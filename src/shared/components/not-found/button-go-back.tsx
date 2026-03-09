"use client";

import { Button } from "@chakra-ui/react";
import { LuArrowLeft } from "react-icons/lu";

import type { ButtonGoBackProps } from "./types";

export function ButtonGoBack({ label, onClick }: Readonly<ButtonGoBackProps>) {
  return (
    <Button onClick={onClick} size="lg" variant="outline">
      <LuArrowLeft />
      {label}
    </Button>
  );
}
