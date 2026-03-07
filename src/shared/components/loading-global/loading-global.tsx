import { Flex, Spinner } from "@chakra-ui/react";

export function LoadingGlobal() {
  return (
    <Flex
      align="center"
      bgGradient="to-br"
      gradientFrom={{ _dark: "gray.950", base: "gray.50" }}
      gradientTo={{ _dark: "blue.950", base: "blue.50" }}
      justify="center"
      minH="100vh"
    >
      <Spinner
        animationDuration="0.8s"
        borderWidth="4px"
        color="blue.500"
        css={{ "--spinner-track-color": "colors.blue.100" }}
        size="xl"
      />
    </Flex>
  );
}
