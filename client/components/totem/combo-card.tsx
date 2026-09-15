"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import type { Combo } from "@/lib/types";
import { toast } from "sonner";

export function ComboCard({ combo }: { combo: Combo }) {
  const { addCombo } = useCart();
  const individualTotal = combo.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const savings = Math.max(0, Math.round((individualTotal - combo.price) * 100) / 100);

  return (
    <Card className="flex flex-col justify-between border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base leading-snug">{combo.name}</CardTitle>
          {savings > 0 && <Badge variant="secondary">Economize {formatCurrency(savings)}</Badge>}
        </div>
        <p className="text-muted-foreground text-sm">
          {combo.items.map((item) => item.product.name).join(" + ")}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold">{formatCurrency(combo.price)}</p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={() => {
            addCombo(combo, 1);
            toast.success(`${combo.name} adicionado ao pedido`);
          }}
        >
          <Plus className="size-4" />
          Adicionar combo
        </Button>
      </CardFooter>
    </Card>
  );
}
