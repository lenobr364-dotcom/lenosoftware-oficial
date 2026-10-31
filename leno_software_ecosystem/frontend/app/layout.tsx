import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leno Software Ecosystem",
  description: "Console Next.js ligado à API FastAPI do ecossistema Leno.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
