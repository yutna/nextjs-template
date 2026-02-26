export const CODE_LINES = [
  {
    tokens: [
      { text: "import", color: "purple.700", darkColor: "purple.400" },
      { text: " { ", color: "gray.600", darkColor: "gray.400" },
      { text: "Button", color: "cyan.700", darkColor: "cyan.400" },
      { text: " } ", color: "gray.600", darkColor: "gray.400" },
      { text: "from", color: "purple.700", darkColor: "purple.400" },
      {
        text: ' "@chakra-ui/react"',
        color: "green.700",
        darkColor: "green.400",
      },
    ],
  },
  {
    tokens: [
      { text: "import", color: "purple.700", darkColor: "purple.400" },
      { text: " { ", color: "gray.600", darkColor: "gray.400" },
      { text: "motion", color: "cyan.700", darkColor: "cyan.400" },
      { text: " } ", color: "gray.600", darkColor: "gray.400" },
      { text: "from", color: "purple.700", darkColor: "purple.400" },
      { text: ' "motion/react"', color: "green.700", darkColor: "green.400" },
    ],
  },
  { tokens: [] },
  {
    tokens: [
      { text: "export", color: "purple.700", darkColor: "purple.400" },
      { text: " function ", color: "blue.700", darkColor: "blue.400" },
      { text: "App", color: "yellow.600", darkColor: "yellow.400" },
      { text: "() {", color: "gray.600", darkColor: "gray.400" },
    ],
  },
  {
    tokens: [
      { text: "  return", color: "purple.700", darkColor: "purple.400" },
      { text: " (", color: "gray.600", darkColor: "gray.400" },
    ],
  },
  {
    tokens: [
      { text: "    <", color: "gray.600", darkColor: "gray.400" },
      { text: "motion.div", color: "red.600", darkColor: "red.400" },
      { text: " ", color: "gray.600", darkColor: "gray.400" },
      { text: "animate", color: "cyan.700", darkColor: "cyan.400" },
      { text: "={{ ", color: "gray.600", darkColor: "gray.400" },
      { text: "scale", color: "cyan.700", darkColor: "cyan.400" },
      { text: ": ", color: "gray.600", darkColor: "gray.400" },
      { text: "1", color: "orange.600", darkColor: "orange.400" },
      { text: " }}", color: "gray.600", darkColor: "gray.400" },
      { text: ">", color: "gray.600", darkColor: "gray.400" },
    ],
  },
  {
    tokens: [
      { text: "      <", color: "gray.600", darkColor: "gray.400" },
      { text: "Button", color: "red.600", darkColor: "red.400" },
      { text: " ", color: "gray.600", darkColor: "gray.400" },
      { text: "colorPalette", color: "cyan.700", darkColor: "cyan.400" },
      { text: "=", color: "gray.600", darkColor: "gray.400" },
      { text: '"purple"', color: "green.700", darkColor: "green.400" },
      { text: ">", color: "gray.600", darkColor: "gray.400" },
    ],
  },
  {
    tokens: [
      { text: "        Launch", color: "gray.700", darkColor: "gray.300" },
      { text: " 🚀", color: "gray.700", darkColor: "gray.300" },
    ],
  },
  {
    tokens: [
      { text: "      </", color: "gray.600", darkColor: "gray.400" },
      { text: "Button", color: "red.600", darkColor: "red.400" },
      { text: ">", color: "gray.600", darkColor: "gray.400" },
    ],
  },
  {
    tokens: [
      { text: "    </", color: "gray.600", darkColor: "gray.400" },
      { text: "motion.div", color: "red.600", darkColor: "red.400" },
      { text: ">", color: "gray.600", darkColor: "gray.400" },
    ],
  },
  { tokens: [{ text: "  )", color: "gray.600", darkColor: "gray.400" }] },
  { tokens: [{ text: "}", color: "gray.600", darkColor: "gray.400" }] },
] as const;
