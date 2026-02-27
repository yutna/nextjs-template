import { ChakraProvider } from "@chakra-ui/react";
import { render } from "@testing-library/react";

import { system } from "@/shared/vendor/chakra-ui/system";

import type { RenderOptions } from "@testing-library/react";
import type { ReactNode } from "react";

function Wrapper({ children }: { children: ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}

export function renderWithProviders(
  ui: ReactNode,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: Wrapper, ...options });
}
