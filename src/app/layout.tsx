import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kawaii Anime Store - Tienda de Anime Artesanal",
  description:
    "Tienda mexicana de anime artesanal. Pines, llaveros, dibujos impresos, ropa modificada y joyería económica con estética kawaii.",
  keywords: [
    "anime",
    "kawaii",
    "pines",
    "llaveros",
    "dibujos",
    "ropa modificada",
    "joyería",
    "tienda anime",
    "México",
  ],
  authors: [{ name: "Kawaii Anime Store" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Kawaii Anime Store",
    description: "Tienda de anime artesanal en México",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: '#0f0a1a', color: '#f8fafc' }}
      >
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1225',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f8fafc',
            },
          }}
        />
      </body>
    </html>
  );
}