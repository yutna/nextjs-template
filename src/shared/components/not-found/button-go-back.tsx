"use client";

import { Button } from "@chakra-ui/react";
import { LuArrowLeft } from "react-icons/lu";

import { useRouter } from "@/shared/lib/navigation";

import type { ButtonGoBackProps } from "./types";

export function ButtonGoBack({ label }: ButtonGoBackProps) {
  // Hooks
  const router = useRouter();

  // Event handlers
  function handleClickGoBack() {
    router.back();
  }

  return (
    <Button onClick={handleClickGoBack} size="lg" variant="outline">
      <LuArrowLeft />
      {label}
    </Button>
  );
}
