/**
 * Local ESLint plugin with project-specific rules.
 *
 * Rules:
 * - no-cross-module-import: Forbid imports between feature modules
 * - no-hook-spread: Forbid spreading hook return values in JSX
 * - no-inline-style: Forbid inline style attribute in JSX
 */

// -------------------------------------------------------------------
// no-cross-module-import
// -------------------------------------------------------------------

const noCrossModuleImport = {
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const match = filename.match(/src\/modules\/([^/]+)\//);

    if (!match) return {};

    const sourceModule = match[1];

    return {
      ImportDeclaration(node) {
        const value = node.source.value;
        const target = value.match(/^@\/modules\/([^/]+)/);

        if (target && target[1] !== sourceModule) {
          context.report({
            data: { sourceModule, targetModule: target[1] },
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
        "Disallow imports between different feature modules under src/modules/",
    },
    messages: {
      crossModule:
        'Cross-module import: "{{sourceModule}}" cannot import from "{{targetModule}}". Move shared code to src/shared/ instead.',
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
// Plugin export
// -------------------------------------------------------------------

export default {
  rules: {
    "no-cross-module-import": noCrossModuleImport,
    "no-hook-spread": noHookSpread,
    "no-inline-style": noInlineStyle,
  },
};
