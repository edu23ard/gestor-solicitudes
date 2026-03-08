import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestor de Solicitudes",
  description: "Proyecto DAA - Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Tu Menú de Navegación */}
        <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc", display: "flex", gap: "10px" }}>
          <Link href="/">Inicio</Link> |
          <Link href="/login">Login</Link> |
          <Link href="/register">Registro</Link> |
          <Link href="/solicitudes">Solicitudes</Link>
        </nav>

        {/* Contenido de las páginas */}
        <main style={{ padding: "1rem" }}>
          {children}
        </main>
      </body>
    </html>
  );
}