import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = localFont({
  variable: "--font-display-local",
  src: [
    {
      path: "../../public/fonts/NeueMontreal-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/NeueMontreal-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/NeueMontreal-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/NeueMontreal-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/NeueMontreal-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/NeueMontreal-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/NeueMontreal-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mobile Arcade | Campaigns",
  description:
    "Mobile Arcade campaign landing pages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
