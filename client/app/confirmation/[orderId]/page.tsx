"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
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
        <p className="text-destructive text-base font-medium">{error}</p>
        <Button asChild size="lg" className="h-12 rounded-full px-8 font-semibold">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 pt-14 pb-8 text-center">
      <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 text-green-700">
        <Check className="size-8" strokeWidth={2.5} />
      </span>
      <h1 className="text-2xl font-semibold">Pedido confirmado!</h1>
      <p className="text-muted-foreground mt-1">Obrigado, {order.customerName}.</p>

      <div className="bg-card mt-6 w-full max-w-sm rounded-2xl border p-6">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Número do pedido
        </p>
        <p className="text-4xl font-bold text-red-700">#{order.orderNumber}</p>

        <ul className="mt-5 space-y-2 text-left">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-sm">
              <span className="text-lg">
                {item.type === "COMBO" ? "🔥" : productEmoji(item.name, "")}
              </span>
              <span className="flex-1 font-medium">
                {item.quantity}x {item.name}
              </span>
              <span className="font-semibold">{formatCurrency(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t pt-4 text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      <p className="text-muted-foreground mt-6 text-sm">
        Chame seu pedido pelo número quando estiver pronto.
      </p>

      <Button asChild size="lg" className="mt-auto h-14 w-full max-w-sm rounded-full text-base font-semibold">
        <Link href="/">Fazer novo pedido</Link>
      </Button>
    </main>
  );
}
