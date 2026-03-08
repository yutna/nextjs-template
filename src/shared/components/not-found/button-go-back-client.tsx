"use client";

import { useRouter } from "@/shared/lib/navigation";

import { ButtonGoBack } from "./button-go-back";

import type { ButtonGoBackClientProps } from "./types";

export function ButtonGoBackClient({
  label,
}: Readonly<ButtonGoBackClientProps>) {
  const router = useRouter();

  function handleClick() {
    router.back();
  }

  return <ButtonGoBack label={label} onClick={handleClick} />;
}
