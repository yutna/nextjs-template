/**
 * Local ESLint plugin with project-specific rules.
 *
 * Rules:
 * - enforce-event-prop-naming: Enforce on* prefix for event callback props
 * - enforce-handler-naming: Enforce handle* prefix for event handler identifiers in JSX
 * - no-cross-module-import: Forbid imports between feature roots
 * - no-hook-spread: Forbid spreading hook return values in JSX
 * - sort-imports: Enforce repository import ordering
 * - no-inline-style: Forbid inline style attribute in JSX
 */

// -------------------------------------------------------------------
// Shared helpers
// -------------------------------------------------------------------

/** Walk up from a node to find the enclosing function / arrow function. */
function findEnclosingFunction(node) {
  let current = node.parent;
  while (current) {
    if (
      current.type === "FunctionDeclaration" ||
      current.type === "ArrowFunctionExpression" ||
      current.type === "FunctionExpression"
    ) {
      return current;
    }
    current = current.parent;
  }
  return null;
}

/** Recursively collect all binding names from a parameter pattern. */
function getParamNames(param) {
  const names = new Set();
  if (!param) return names;
  if (param.type === "Identifier") {
    names.add(param.name);
  } else if (param.type === "ObjectPattern") {
    for (const prop of param.properties) {
      if (prop.type === "Property") {
        for (const n of getParamNames(prop.value)) names.add(n);
      } else if (prop.type === "RestElement") {
        for (const n of getParamNames(prop.argument)) names.add(n);
      }
    }
  } else if (param.type === "ArrayPattern") {
    for (const el of param.elements) {
      if (el) for (const n of getParamNames(el)) names.add(n);
    }
  } else if (param.type === "AssignmentPattern") {
    for (const n of getParamNames(param.left)) names.add(n);
  } else if (param.type === "RestElement") {
    for (const n of getParamNames(param.argument)) names.add(n);
  }
  return names;
}

// -------------------------------------------------------------------
// enforce-event-prop-naming
// -------------------------------------------------------------------

/** Non-event function prop prefixes that are allowed in *Props interfaces. */
const ALLOWED_FN_PROP_PREFIXES = /^(on[A-Z]|render[A-Z]|get[A-Z]|format[A-Z])/;
const ALLOWED_FN_PROP_NAMES = new Set(["children", "ref"]);

/** Check whether a TS type annotation node represents a function type. */
function isFunctionType(typeNode) {
  if (!typeNode) return false;
  if (typeNode.type === "TSFunctionType") return true;
  if (typeNode.type === "TSUnionType" || typeNode.type === "TSIntersectionType") {
    return typeNode.types.some((t) => isFunctionType(t));
  }
  if (typeNode.type === "TSParenthesizedType") {
    return isFunctionType(typeNode.typeAnnotation);
  }
  return false;
}

/** Find the parent interface/type-alias name containing a property. */
function getParentTypeName(node) {
  let current = node.parent;
  while (current) {
    if (current.type === "TSInterfaceDeclaration") return current.id?.name;
    if (current.type === "TSTypeAliasDeclaration") return current.id?.name;
    current = current.parent;
  }
  return null;
}

function compareNaturalCaseInsensitive(left, right) {
  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function getNewline(text) {
  return text.includes("\r\n") ? "\r\n" : "\n";
}

function getImportSource(node) {
  return typeof node.source.value === "string" ? node.source.value : "";
}

function getImportPathGroup(source) {
  if (source.startsWith("@/")) return "internal";
  if (source.startsWith(".")) return "local";

  return "external";
}

function getImportGroup(node) {
  const source = getImportSource(node);

  if (node.importKind === "type") return "type";
  if (source === "server-only") return "runtime-boundary";

  return getImportPathGroup(source);
}

function getTypeImportSubgroup(node) {
  return getImportPathGroup(getImportSource(node));
}

function sortImportChunk(nodes, sourceCode) {
  const newline = getNewline(sourceCode.text);
  const groupOrder = [
    "runtime-boundary",
    "external",
    "internal",
    "local",
    "type",
  ];
  const typeSubgroupOrder = ["external", "internal", "local"];
  const items = nodes.map((node, index) => ({
    group: getImportGroup(node),
    index,
    source: getImportSource(node),
    text: sourceCode.getText(node),
    typeSubgroup: getTypeImportSubgroup(node),
  }));

  items.sort((left, right) => {
    const groupDiff =
      groupOrder.indexOf(left.group) - groupOrder.indexOf(right.group);

    if (groupDiff !== 0) return groupDiff;

    if (left.group === "type" && right.group === "type") {
      const subgroupDiff =
        typeSubgroupOrder.indexOf(left.typeSubgroup) -
        typeSubgroupOrder.indexOf(right.typeSubgroup);

      if (subgroupDiff !== 0) return subgroupDiff;
    }

    const sourceDiff = compareNaturalCaseInsensitive(left.source, right.source);

    if (sourceDiff !== 0) return sourceDiff;

    return left.index - right.index;
  });

  return groupOrder
    .map((group) => items.filter((item) => item.group === group))
    .filter((itemsInGroup) => itemsInGroup.length > 0)
    .map((itemsInGroup) => itemsInGroup.map((item) => item.text).join(newline))
    .join(`${newline}${newline}`);
}

function getImportChunks(programBody) {
  const chunks = [];
  let currentChunk = [];

  for (const node of programBody) {
    if (node.type === "ImportDeclaration") {
      currentChunk.push(node);
      continue;
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = [];
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

const enforceEventPropNaming = {
  create(context) {
    return {
      TSPropertySignature(node) {
        const typeName = getParentTypeName(node);
        if (!typeName || !typeName.endsWith("Props")) return;

        const typeAnnotation = node.typeAnnotation?.typeAnnotation;
        if (!typeAnnotation || !isFunctionType(typeAnnotation)) return;

        const propName = node.key?.type === "Identifier" ? node.key.name : null;
        if (!propName) return;

        if (ALLOWED_FN_PROP_NAMES.has(propName)) return;
        if (ALLOWED_FN_PROP_PREFIXES.test(propName)) return;

        const suggested =
          propName.charAt(0).toUpperCase() + propName.slice(1);
        context.report({
          data: { name: propName, suggested, typeName },
          messageId: "missingOnPrefix",
          node: node.key,
        });
      },
    };
  },
  meta: {
    docs: {
      description:
        "Enforce on* prefix for event callback props in component prop interfaces",
    },
    messages: {
      missingOnPrefix:
        "Event callback prop '{{name}}' in '{{typeName}}' should start with 'on' followed by an uppercase letter (e.g., 'on{{suggested}}').",
    },
    schema: [],
    type: "suggestion",
  },
};

// -------------------------------------------------------------------
// enforce-handler-naming
// -------------------------------------------------------------------

const enforceHandlerNaming = {
  create(context) {
    return {
      JSXAttribute(node) {
        const attrName =
          node.name?.type === "JSXIdentifier" ? node.name.name : null;
        if (!attrName || !/^on[A-Z]/.test(attrName)) return;

        const value = node.value;
        if (!value || value.type !== "JSXExpressionContainer") return;
        const expr = value.expression;
        if (!expr || expr.type !== "Identifier") return;

        const handlerName = expr.name;
        if (handlerName === "undefined") return;
        if (/^handle[A-Z]/.test(handlerName)) return;

        // Allow prop forwarding: identifier is a parameter of the enclosing function.
        const enclosingFn = findEnclosingFunction(node);
        if (enclosingFn) {
          const paramNames = new Set();
          for (const param of enclosingFn.params) {
            for (const n of getParamNames(param)) paramNames.add(n);
          }
          if (paramNames.has(handlerName)) return;
        }

        const eventPart = attrName.slice(2);
        context.report({
          data: { name: handlerName, prop: attrName, suggested: eventPart },
          messageId: "missingHandlePrefix",
          node: expr,
        });
      },
    };
  },
  meta: {
    docs: {
      description:
        "Enforce handle* prefix for event handler identifiers passed to on* JSX props",
    },
    messages: {
      missingHandlePrefix:
        "Handler '{{name}}' passed to '{{prop}}' should start with 'handle' (e.g., 'handle{{suggested}}').",
    },
    schema: [],
    type: "suggestion",
  },
};

// -------------------------------------------------------------------
// no-cross-module-import
// -------------------------------------------------------------------

const noCrossModuleImport = {
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const match = filename.match(/src\/(?:features|modules)\/([^/]+)\//);

    if (!match) return {};

    const sourceFeature = match[1];

    return {
      ImportDeclaration(node) {
        const value = node.source.value;
        const target = value.match(/^@\/(?:features|modules)\/([^/]+)/);

        if (target && target[1] !== sourceFeature) {
          context.report({
            data: { sourceFeature, targetFeature: target[1] },
            messageId: "crossModule",
            node,
          });
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        "Disallow imports between different feature roots under src/features/",
    },
    messages: {
      crossModule:
        'Cross-feature import: "{{sourceFeature}}" cannot import from "{{targetFeature}}". Move shared code to src/shared/ instead.',
    },
    schema: [],
    type: "problem",
  },
};

// -------------------------------------------------------------------
// no-hook-spread
// -------------------------------------------------------------------

const noHookSpread = {
  create(context) {
    const hookResults = new Set();

    return {
      JSXSpreadAttribute(node) {
        if (
          node.argument.type === "Identifier" &&
          hookResults.has(node.argument.name)
        ) {
          context.report({
            data: { name: node.argument.name },
            messageId: "hookSpread",
            node,
          });
        }
      },
      VariableDeclarator(node) {
        if (
          node.id.type === "Identifier" &&
          node.init?.type === "CallExpression" &&
          node.init.callee.type === "Identifier" &&
          /^use[A-Z]/.test(node.init.callee.name)
        ) {
          hookResults.add(node.id.name);
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        "Disallow spreading hook return values directly into JSX props",
    },
    messages: {
      hookSpread:
        'Do not spread hook result "{{name}}" into JSX. Use explicit prop binding instead.',
    },
    schema: [],
    type: "problem",
  },
};

// -------------------------------------------------------------------
// sort-imports
// -------------------------------------------------------------------

const sortImports = {
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    return {
      Program(node) {
        for (const chunk of getImportChunks(node.body)) {
          if (chunk.length < 2) continue;

          const start = chunk[0].range[0];
          const end = chunk[chunk.length - 1].range[1];
          const actual = sourceCode.text.slice(start, end);
          const sorted = sortImportChunk(chunk, sourceCode);

          if (actual === sorted) continue;

          context.report({
            fix(fixer) {
              return fixer.replaceTextRange([start, end], sorted);
            },
            messageId: "sortImports",
            node: chunk[0],
          });
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        "Enforce repository import ordering with server-only first and path-based grouping for all other imports",
    },
    fixable: "code",
    messages: {
      sortImports: "Imports must follow the repository import ordering.",
    },
    schema: [],
    type: "layout",
  },
};

// -------------------------------------------------------------------
// no-inline-style
// -------------------------------------------------------------------

const noInlineStyle = {
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.type === "JSXIdentifier" && node.name.name === "style") {
          context.report({
            messageId: "inlineStyle",
            node,
          });
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        "Disallow inline style attribute in JSX. Use Chakra UI style props or CSS Modules.",
    },
    messages: {
      inlineStyle:
        "Inline style is banned. Use Chakra UI style props or CSS Modules instead.",
    },
    schema: [],
    type: "suggestion",
  },
};

// -------------------------------------------------------------------
// no-upward-layer-import
// -------------------------------------------------------------------

/**
 * Layers that components must never import from.
 * The data flow is strictly: page → screen → container → component.
 * Components receive data through props only.
 */
const UPWARD_LAYERS = [
  "actions",
  "containers",
  "contexts",
  "hooks",
  "providers",
  "screens",
];

const noUpwardLayerImport = {
  create(context) {
    const filename = context.filename ?? context.getFilename();

    // Only apply to files inside a components/ layer
    if (!/\/components\//.test(filename)) return {};

    return {
      ImportDeclaration(node) {
        const value = node.source.value;

        for (const layer of UPWARD_LAYERS) {
          if (new RegExp(`/${layer}/`).test(value)) {
            context.report({
              data: { layer, path: value },
              messageId: "upwardLayerImport",
              node,
            });
            return;
          }
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        "Enforce layer boundary: components cannot import from containers, screens, hooks, actions, contexts, or providers",
    },
    messages: {
      upwardLayerImport:
        'Component imports from "{{layer}}" layer ({{path}}). Layer flow is: page → screen → container → component. Components receive data through props, not by importing upward layers.',
    },
    schema: [],
    type: "problem",
  },
};

// -------------------------------------------------------------------
// Plugin export
// -------------------------------------------------------------------

export default {
  rules: {
    "enforce-event-prop-naming": enforceEventPropNaming,
    "enforce-handler-naming": enforceHandlerNaming,
    "no-cross-module-import": noCrossModuleImport,
    "no-hook-spread": noHookSpread,
    "no-inline-style": noInlineStyle,
    "no-upward-layer-import": noUpwardLayerImport,
    "sort-imports": sortImports,
  },
};
