// Since the routing and layout are handled by [locale], this file
// ensures that pages outside of [locale] also work correctly.
// For most use cases, the actual content is in [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
