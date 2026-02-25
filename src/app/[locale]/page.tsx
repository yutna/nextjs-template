import "server-only";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function Page({ params }: Readonly<PageProps>) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <main>
      <h1>Welcome to Next.js template!</h1>
    </main>
  );
}
