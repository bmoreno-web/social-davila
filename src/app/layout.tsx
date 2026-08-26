import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DAVILA PM SOCIAL — Plataforma de Gestión y Analítica",
  description: "Panel interno de analítica, reporting y experiencia de cliente de Davila PM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#090b10] text-zinc-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
