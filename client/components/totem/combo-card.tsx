"use client";

import { Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import { productEmoji } from "@/lib/visuals";
import type { Combo } from "@/lib/types";

export function ComboCard({ combo }: { combo: Combo }) {
  const { lines, addCombo, updateQuantity, removeLine } = useCart();
  const line = lines.find((l) => l.key === `combo-${combo.id}`);
  const individualTotal = combo.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const savings = Math.max(0, Math.round((individualTotal - combo.price) * 100) / 100);

  return (
    <div className="bg-card overflow-hidden rounded-2xl border">
      <div className="flex items-center gap-3 p-3">
        <div className="flex shrink-0 -space-x-2">
          {combo.items.slice(0, 4).map((item) => (
            <span
              key={item.id}
              className="bg-muted flex size-10 items-center justify-center rounded-full border-2 border-white text-xl"
            >
              {productEmoji(item.product.name, item.product.category.slug)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base leading-tight font-semibold">{combo.name}</h3>
          <p className="text-muted-foreground truncate text-xs leading-snug">
            {combo.items.map((i) => i.product.name).join(" + ")}
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 px-3 pb-3">
        <div>
          {savings > 0 && (
            <Badge variant="secondary" className="mb-1 text-green-700">
              Economize {formatCurrency(savings)}
            </Badge>
          )}
          <p className="text-xl leading-none font-bold text-red-700">{formatCurrency(combo.price)}</p>
        </div>

        {line ? (
          <div className="flex items-center gap-1 rounded-full border p-1">
            <Button
              size="icon"
              variant="ghost"
              className="size-9 rounded-full"
              aria-label="Diminuir quantidade"
              onClick={() =>
                line.quantity <= 1 ? removeLine(line.key) : updateQuantity(line.key, line.quantity - 1)
              }
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-5 text-center text-base font-semibold">{line.quantity}</span>
            <Button
              size="icon"
              className="size-9 rounded-full"
              aria-label="Aumentar quantidade"
              onClick={() => addCombo(combo, 1)}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        ) : (
          <Button className="h-11 rounded-full px-5 font-semibold" onClick={() => addCombo(combo, 1)}>
            <Plus className="size-4" /> Adicionar
          </Button>
        )}
      </div>
    </div>
  );
}
