"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { OrderResponse } from "@/lib/types";

export default function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getOrder(Number(orderId))
      .then(setOrder)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Pedido não encontrado."),
      );
  }, [orderId]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      {error ? (
        <div className="space-y-4">
          <p className="text-destructive">{error}</p>
          <Button asChild>
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      ) : !order ? (
        <Skeleton className="h-64 w-full max-w-sm" />
      ) : (
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="text-primary size-16" />
            <h1 className="text-2xl font-bold">Pedido confirmado!</h1>
            <p className="text-muted-foreground">Obrigado pela preferência, {order.customerName}.</p>
          </div>

          <Card>
            <CardContent className="space-y-3 pt-6">
              <p className="text-muted-foreground text-sm">Número do pedido</p>
              <p className="text-3xl font-bold">#{order.orderNumber}</p>
              <div className="text-muted-foreground flex justify-between border-t pt-3 text-sm">
                <span>Total</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Button asChild size="lg" className="w-full">
            <Link href="/">Fazer novo pedido</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
