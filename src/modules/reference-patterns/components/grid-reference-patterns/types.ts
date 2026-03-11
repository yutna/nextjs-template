export interface ReferencePatternItem {
  codePath: string;
  description: string;
  kind: string;
  title: string;
}

export interface GridReferencePatternsProps {
  description: string;
  heading: string;
  items: ReadonlyArray<ReferencePatternItem>;
}
