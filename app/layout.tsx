import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Karate Smalsa | SMA Al Islam 1 Surakarta",
    template: "%s | Karate Smalsa",
  },
  description:
    "Website resmi ekstrakurikuler Karate SMA Al Islam 1 Surakarta.",
  keywords: [
    "Karate Smalsa",
    "Karate SMA Al Islam 1 Surakarta",
    "Karate Solo",
    "Ekstrakurikuler Karate",
    "SMA Al Islam 1 Surakarta",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}