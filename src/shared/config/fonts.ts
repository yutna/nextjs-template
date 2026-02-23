import { JetBrains_Mono, Noto_Sans_Thai } from "next/font/google";

export const jetBrainsMono = JetBrains_Mono({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
});

export const notoSansThai = Noto_Sans_Thai({
  display: "swap",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-thai",
});
