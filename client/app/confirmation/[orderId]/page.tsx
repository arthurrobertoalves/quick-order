"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { productEmoji } from "@/lib/visuals";
import type { OrderResponse } from "@/lib/types";

export default function ConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getOrder(Number(orderId))
      .then(setOrder)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Pedido não encontrado."));
  }, [orderId]);

  if (error) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-6xl">😕</span>
        <p className="text-destructive text-lg font-semibold">{error}</p>
        <Button asChild size="lg" className="h-14 rounded-full px-8 text-lg font-bold">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
      </main>
    );
  }

  return (
    <main className="relative flex flex-1 flex-col items-center overflow-hidden bg-gradient-to-b from-green-500 to-emerald-600 px-6 pt-16 pb-10 text-center text-white">
      {["🎉", "✨", "🎊", "🥳"].map((e, i) => (
        <span
          key={i}
          aria-hidden
          className="animate-float absolute text-5xl opacity-80"
          style={
            {
              left: `${12 + i * 22}%`,
              top: `${6 + (i % 2) * 10}%`,
              "--r": `${i % 2 ? -10 : 10}deg`,
              animationDelay: `${i * 0.4}s`,
            } as React.CSSProperties
          }
        >
          {e}
        </span>
      ))}

      <span className="animate-pop mb-4 flex size-24 items-center justify-center rounded-full bg-white text-6xl shadow-xl">
        ✅
      </span>
      <h1 className="text-4xl font-black drop-shadow-sm">Pedido confirmado!</h1>
      <p className="mt-2 text-lg text-white/90">Obrigado, {order.customerName}! 💚</p>

      <div className="animate-slide-up mt-8 w-full max-w-sm rounded-3xl bg-white p-6 text-neutral-900 shadow-2xl">
        <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
          Número do pedido
        </p>
        <p className="text-6xl font-black text-red-600">#{order.orderNumber}</p>

        <ul className="mt-5 space-y-2 text-left">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-sm">
              <span className="text-xl">
                {item.type === "COMBO" ? "🔥" : productEmoji(item.name, "")}
              </span>
              <span className="flex-1 font-medium">
                {item.quantity}x {item.name}
              </span>
              <span className="font-bold">{formatCurrency(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t pt-4 text-xl font-black">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      <p className="mt-6 text-sm text-white/80">Chame seu pedido pelo número quando estiver pronto.</p>

      <Button
        asChild
        size="lg"
        className="mt-auto h-16 w-full max-w-sm rounded-full bg-white text-xl font-black text-emerald-700 hover:bg-white/90"
      >
        <Link href="/">Fazer novo pedido</Link>
      </Button>
    </main>
  );
}
