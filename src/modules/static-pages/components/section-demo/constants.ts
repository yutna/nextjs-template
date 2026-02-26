export const CODE_LINES = [
  {
    tokens: [
      { text: "import", color: "purple.400" },
      { text: " { ", color: "gray.400" },
      { text: "Button", color: "cyan.400" },
      { text: " } ", color: "gray.400" },
      { text: "from", color: "purple.400" },
      { text: ' "@chakra-ui/react"', color: "green.400" },
    ],
  },
  {
    tokens: [
      { text: "import", color: "purple.400" },
      { text: " { ", color: "gray.400" },
      { text: "motion", color: "cyan.400" },
      { text: " } ", color: "gray.400" },
      { text: "from", color: "purple.400" },
      { text: ' "motion/react"', color: "green.400" },
    ],
  },
  { tokens: [] },
  {
    tokens: [
      { text: "export", color: "purple.400" },
      { text: " function ", color: "blue.400" },
      { text: "App", color: "yellow.400" },
      { text: "() {", color: "gray.400" },
    ],
  },
  {
    tokens: [
      { text: "  return", color: "purple.400" },
      { text: " (", color: "gray.400" },
    ],
  },
  {
    tokens: [
      { text: "    <", color: "gray.400" },
      { text: "motion.div", color: "red.400" },
      { text: " ", color: "gray.400" },
      { text: "animate", color: "cyan.400" },
      { text: "={{ ", color: "gray.400" },
      { text: "scale", color: "cyan.400" },
      { text: ": ", color: "gray.400" },
      { text: "1", color: "orange.400" },
      { text: " }}", color: "gray.400" },
      { text: ">", color: "gray.400" },
    ],
  },
  {
    tokens: [
      { text: "      <", color: "gray.400" },
      { text: "Button", color: "red.400" },
      { text: " ", color: "gray.400" },
      { text: "colorPalette", color: "cyan.400" },
      { text: "=", color: "gray.400" },
      { text: '"purple"', color: "green.400" },
      { text: ">", color: "gray.400" },
    ],
  },
  {
    tokens: [
      { text: "        Launch", color: "gray.300" },
      { text: " 🚀", color: "gray.300" },
    ],
  },
  {
    tokens: [
      { text: "      </", color: "gray.400" },
      { text: "Button", color: "red.400" },
      { text: ">", color: "gray.400" },
    ],
  },
  {
    tokens: [
      { text: "    </", color: "gray.400" },
      { text: "motion.div", color: "red.400" },
      { text: ">", color: "gray.400" },
    ],
  },
  { tokens: [{ text: "  )", color: "gray.400" }] },
  { tokens: [{ text: "}", color: "gray.400" }] },
] as const;
