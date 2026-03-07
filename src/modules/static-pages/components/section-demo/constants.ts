export const CODE_LINES = [
  {
    tokens: [
      { color: "purple.700", darkColor: "purple.400", text: "import" },
      { color: "gray.600", darkColor: "gray.400", text: " { " },
      { color: "cyan.700", darkColor: "cyan.400", text: "Button" },
      { color: "gray.600", darkColor: "gray.400", text: " } " },
      { color: "purple.700", darkColor: "purple.400", text: "from" },
      {
        color: "green.700",
        darkColor: "green.400",
        text: ' "@chakra-ui/react"',
      },
    ],
  },
  {
    tokens: [
      { color: "purple.700", darkColor: "purple.400", text: "import" },
      { color: "gray.600", darkColor: "gray.400", text: " { " },
      { color: "cyan.700", darkColor: "cyan.400", text: "motion" },
      { color: "gray.600", darkColor: "gray.400", text: " } " },
      { color: "purple.700", darkColor: "purple.400", text: "from" },
      { color: "green.700", darkColor: "green.400", text: ' "motion/react"' },
    ],
  },
  { tokens: [] },
  {
    tokens: [
      { color: "purple.700", darkColor: "purple.400", text: "export" },
      { color: "blue.700", darkColor: "blue.400", text: " function " },
      { color: "yellow.600", darkColor: "yellow.400", text: "App" },
      { color: "gray.600", darkColor: "gray.400", text: "() {" },
    ],
  },
  {
    tokens: [
      { color: "purple.700", darkColor: "purple.400", text: "  return" },
      { color: "gray.600", darkColor: "gray.400", text: " (" },
    ],
  },
  {
    tokens: [
      { color: "gray.600", darkColor: "gray.400", text: "    <" },
      { color: "red.600", darkColor: "red.400", text: "motion.div" },
      { color: "gray.600", darkColor: "gray.400", text: " " },
      { color: "cyan.700", darkColor: "cyan.400", text: "animate" },
      { color: "gray.600", darkColor: "gray.400", text: "={{ " },
      { color: "cyan.700", darkColor: "cyan.400", text: "scale" },
      { color: "gray.600", darkColor: "gray.400", text: ": " },
      { color: "orange.600", darkColor: "orange.400", text: "1" },
      { color: "gray.600", darkColor: "gray.400", text: " }}" },
      { color: "gray.600", darkColor: "gray.400", text: ">" },
    ],
  },
  {
    tokens: [
      { color: "gray.600", darkColor: "gray.400", text: "      <" },
      { color: "red.600", darkColor: "red.400", text: "Button" },
      { color: "gray.600", darkColor: "gray.400", text: " " },
      { color: "cyan.700", darkColor: "cyan.400", text: "colorPalette" },
      { color: "gray.600", darkColor: "gray.400", text: "=" },
      { color: "green.700", darkColor: "green.400", text: '"purple"' },
      { color: "gray.600", darkColor: "gray.400", text: ">" },
    ],
  },
  {
    tokens: [
      { color: "gray.700", darkColor: "gray.300", text: "        Launch" },
      { color: "gray.700", darkColor: "gray.300", text: " 🚀" },
    ],
  },
  {
    tokens: [
      { color: "gray.600", darkColor: "gray.400", text: "      </" },
      { color: "red.600", darkColor: "red.400", text: "Button" },
      { color: "gray.600", darkColor: "gray.400", text: ">" },
    ],
  },
  {
    tokens: [
      { color: "gray.600", darkColor: "gray.400", text: "    </" },
      { color: "red.600", darkColor: "red.400", text: "motion.div" },
      { color: "gray.600", darkColor: "gray.400", text: ">" },
    ],
  },
  { tokens: [{ color: "gray.600", darkColor: "gray.400", text: "  )" }] },
  { tokens: [{ color: "gray.600", darkColor: "gray.400", text: "}" }] },
] as const;
