"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";

export default function WelcomePage() {
  const { catalog, clear } = useCart();

  useEffect(() => {
    clear();
  }, [clear]);

  const featured = catalog.combos[0];

  return (
    <main className="flex flex-1 flex-col">
      <div className="bg-primary text-primary-foreground flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <span className="mb-4 text-5xl">🍔</span>
        <h1 className="text-4xl font-bold tracking-tight">Bem-vindo!</h1>
        <p className="mt-2 text-lg text-white/85">O que você deseja pedir hoje?</p>
      </div>

      <div className="space-y-3 px-6 py-6">
        {featured && (
          <Link
            href="/menu?tab=combos"
            className="bg-card flex items-center gap-4 rounded-2xl border p-4 text-left active:opacity-80"
          >
            <span className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-full text-2xl">
              🔥
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-muted-foreground block text-xs font-medium tracking-wide uppercase">
                Destaque do dia
              </span>
              <span className="block truncate text-base font-semibold">{featured.name}</span>
            </span>
            <span className="shrink-0 text-lg font-bold text-red-700">
              {formatCurrency(featured.price)}
            </span>
          </Link>
        )}

        <Link
          href="/menu?tab=lanches"
          className="bg-primary text-primary-foreground block rounded-full py-4 text-center text-lg font-semibold active:opacity-90"
        >
          Fazer meu pedido
        </Link>
        <Link
          href="/menu?tab=combos"
          className="block rounded-full border py-3.5 text-center text-base font-semibold active:opacity-70"
        >
          Ver combos
        </Link>
      </div>
    </main>
  );
}
