import { JetBrains_Mono, Noto_Sans_Thai } from "next/font/google";

export const jetBrainsMono = JetBrains_Mono({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600", "700"],
});

export const notoSansThai = Noto_Sans_Thai({
  display: "swap",
  subsets: ["thai", "latin"],
  variable: "--font-noto-sans-thai",
  weight: ["400", "500", "600", "700"],
});
