import { Flex, Spinner } from "@chakra-ui/react";

export function LoadingGlobal() {
  return (
    <Flex
      align="center"
      bgGradient="to-br"
      gradientFrom={{ base: "gray.50", _dark: "gray.950" }}
      gradientTo={{ base: "blue.50", _dark: "blue.950" }}
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
