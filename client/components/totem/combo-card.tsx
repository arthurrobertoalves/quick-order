"use client";

import { Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import { productEmoji } from "@/lib/visuals";
import type { Combo } from "@/lib/types";

export function ComboCard({ combo, index = 0 }: { combo: Combo; index?: number }) {
  const { lines, addCombo, updateQuantity, removeLine } = useCart();
  const line = lines.find((l) => l.key === `combo-${combo.id}`);
  const individualTotal = combo.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const savings = Math.max(0, Math.round((individualTotal - combo.price) * 100) / 100);

  return (
    <div
      className="animate-slide-up overflow-hidden rounded-3xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-100 shadow-md"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="flex shrink-0 -space-x-3">
          {combo.items.slice(0, 4).map((item) => (
            <span
              key={item.id}
              className="flex size-14 items-center justify-center rounded-full border-2 border-white bg-white text-3xl shadow"
            >
              {productEmoji(item.product.name, item.product.category.slug)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl leading-tight font-black">{combo.name}</h3>
          <p className="text-muted-foreground text-xs leading-snug">
            {combo.items.map((i) => i.product.name).join(" + ")}
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 px-4 pb-4">
        <div>
          {savings > 0 && (
            <>
              <Badge className="bg-green-600 text-white">Economize {formatCurrency(savings)}</Badge>
              <p className="text-muted-foreground mt-1 text-sm line-through">
                {formatCurrency(individualTotal)}
              </p>
            </>
          )}
          <p className="text-3xl leading-none font-black text-red-600">{formatCurrency(combo.price)}</p>
        </div>

        {line ? (
          <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-inner">
            <Button
              size="icon"
              variant="outline"
              className="size-12 rounded-full"
              aria-label="Diminuir quantidade"
              onClick={() =>
                line.quantity <= 1 ? removeLine(line.key) : updateQuantity(line.key, line.quantity - 1)
              }
            >
              <Minus className="size-5" />
            </Button>
            <span key={line.quantity} className="animate-pop w-6 text-center text-xl font-black">
              {line.quantity}
            </span>
            <Button
              size="icon"
              className="size-12 rounded-full"
              aria-label="Aumentar quantidade"
              onClick={() => addCombo(combo, 1)}
            >
              <Plus className="size-5" />
            </Button>
          </div>
        ) : (
          <Button className="h-14 rounded-full px-6 text-lg font-bold" onClick={() => addCombo(combo, 1)}>
            <Plus className="size-5" /> Quero
          </Button>
        )}
      </div>
    </div>
  );
}
