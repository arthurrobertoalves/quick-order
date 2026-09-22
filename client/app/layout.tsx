import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";
import { SuggestionDialog } from "@/components/totem/suggestion-dialog";
import { Toaster } from "@/components/ui/sonner";
import { KioskShell } from "@/components/totem/kiosk-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = { width: "device-width", initialScale: 1, maximumScale: 1 };

export const metadata: Metadata = {
  title: "Quick Order - Totem de Autoatendimento",
  description: "Monte seu pedido de lanches em poucos toques.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <KioskShell>{children}</KioskShell>
          <SuggestionDialog />
          <Toaster position="top-center" />
        </CartProvider>
      </body>
    </html>
  );
}
