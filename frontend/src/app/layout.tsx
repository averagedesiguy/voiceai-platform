import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoiceAI Platform — AI Communication Infrastructure",
  description:
    "Build and deploy intelligent voice agents, chat agents, and workflow automations. The unified AI communication platform for developers and businesses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
