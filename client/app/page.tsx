"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";

const FLOATERS = [
  { e: "🍔", cls: "left-[6%] top-[8%] text-7xl", r: "-12deg", d: "0s" },
  { e: "🍟", cls: "right-[8%] top-[14%] text-6xl", r: "10deg", d: "0.8s" },
  { e: "🥤", cls: "left-[10%] top-[38%] text-6xl", r: "8deg", d: "1.6s" },
  { e: "🍦", cls: "right-[6%] top-[42%] text-7xl", r: "-8deg", d: "0.4s" },
  { e: "🍗", cls: "left-[42%] top-[4%] text-5xl", r: "14deg", d: "1.2s" },
];

export default function WelcomePage() {
  const { catalog, clear } = useCart();

  useEffect(() => {
    clear();
  }, [clear]);

  const featured = catalog.combos[0];

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-gradient-to-b from-orange-500 via-red-500 to-red-600 text-white">
      {FLOATERS.map((f) => (
        <span
          key={f.e + f.cls}
          aria-hidden
          className={`animate-float absolute select-none drop-shadow-lg ${f.cls}`}
          style={{ "--r": f.r, animationDelay: f.d } as React.CSSProperties}
        >
          {f.e}
        </span>
      ))}

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-24 text-center">
        <p className="mb-3 rounded-full bg-white/20 px-5 py-2 text-lg font-semibold tracking-wide backdrop-blur">
          Autoatendimento
        </p>
        <h1 className="text-[clamp(3rem,11dvh,6rem)] leading-none font-black tracking-tight drop-shadow-md">
          Bateu a
          <br />
          <span className="text-yellow-300">fome?</span>
        </h1>
        <p className="mt-4 text-[clamp(1.1rem,3dvh,1.6rem)] font-medium text-white/90">
          Monte seu pedido em poucos toques
        </p>
      </div>

      <div className="relative z-10 space-y-4 px-6 pb-10">
        {featured && (
          <Link
            href="/menu?tab=combos"
            className="animate-slide-up flex items-center gap-4 rounded-3xl bg-white/95 p-4 text-neutral-900 shadow-xl active:scale-[0.98]"
          >
            <span className="text-5xl">🔥</span>
            <span className="flex-1 text-left">
              <span className="block text-sm font-bold tracking-wide text-red-600 uppercase">
                Destaque do dia
              </span>
              <span className="block text-xl leading-tight font-extrabold">{featured.name}</span>
              <span className="text-muted-foreground block text-sm">
                {featured.items.map((i) => i.product.name).join(" + ")}
              </span>
            </span>
            <span className="text-2xl font-black text-red-600">{formatCurrency(featured.price)}</span>
          </Link>
        )}

        <Link
          href="/menu?tab=lanches"
          className="animate-pulse-soft relative block overflow-hidden rounded-full bg-yellow-300 py-6 text-center text-3xl font-black text-red-700 shadow-2xl active:scale-95"
        >
          Toque para começar
          <span className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-white/40 [animation:shine_3s_ease-in-out_infinite]" />
        </Link>
        <Link
          href="/menu?tab=combos"
          className="block rounded-full border-2 border-white/70 py-4 text-center text-xl font-bold active:scale-95"
        >
          Ver combos 🔥
        </Link>
      </div>
    </main>
  );
}
