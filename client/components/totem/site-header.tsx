import Link from "next/link";
import { CartSheet } from "./cart-sheet";

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3 sm:px-6">
      <Link href="/" className="text-lg font-bold tracking-tight">
        Quick Order
      </Link>
      <CartSheet />
    </header>
  );
}
