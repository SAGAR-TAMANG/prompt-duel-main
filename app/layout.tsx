import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans' 
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PromptDuel | The Blind Taste Test for LLM Prompts",
  description: "Stop guessing which prompt is better. Side-by-side LLM testing and human-in-the-loop feedback to optimize your AI agents.",
  keywords: ["LLM testing", "Prompt Engineering", "AI development", "Prompt Optimization", "SaaS", "Build in Public"],
  authors: [{ name: "Sagar Tamang", url: "https://x.com/sagar_builds" }],
  creator: "Sagar Tamang",
  metadataBase: new URL("https://promptduel.feynmanpi.com"),
  
  // OpenGraph (Facebook, LinkedIn, Discord)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://promptduel.feynmanpi.com",
    title: "PromptDuel | Unbiased LLM Evaluation",
    description: "Battle your prompts side-by-side and let human feedback decide the winner.",
    siteName: "PromptDuel",
    images: [
      {
        url: "/og-image.png", // Ensure you create this 1200x630 image in your /public folder
        width: 1200,
        height: 630,
        alt: "PromptDuel Preview",
      },
    ],
  },

  // Twitter (X)
  twitter: {
    card: "summary_large_image",
    title: "PromptDuel | Battle your prompts",
    description: "The 'Pepsi Challenge' for LLM Prompts. Build better AI with human-in-the-loop feedback.",
    creator: "@sagar_builds",
    images: ["/og-image.png"],
  },

  // Favicons
  icons: {
    icon: "/favicon.ico",
    // shortcut: "/favicon-16x16.png",
    // apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-white dark:bg-black text-zinc-950 dark:text-zinc-50">
        {children}
      </body>
    </html>
  );
}