export interface ReferencePatternsHubItem {
  description: string;
  href: string;
  statusLabel: string;
  title: string;
}

export interface ReferencePatternsHubProps {
  actionLabel: string;
  description: string;
  eyebrow: string;
  heading: string;
  items: ReadonlyArray<ReferencePatternsHubItem>;
}
