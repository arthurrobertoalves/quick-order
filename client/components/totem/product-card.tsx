"use client";

import { Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import { categoryVisual, productEmoji } from "@/lib/visuals";
import type { Product } from "@/lib/types";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { lines, addProduct, updateQuantity, removeLine } = useCart();
  const line = lines.find((l) => l.key === `product-${product.id}`);
  const visual = categoryVisual(product.category.slug);

  return (
    <div
      className="animate-slide-up bg-card flex flex-col overflow-hidden rounded-3xl border shadow-sm"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className={`relative flex h-[clamp(6rem,15dvh,9rem)] items-center justify-center bg-gradient-to-br ${visual.gradient}`}
      >
        <span className="text-[clamp(3.5rem,9dvh,5.5rem)] drop-shadow-lg">
          {productEmoji(product.name, product.category.slug)}
        </span>
        {product.upgradeTo && (
          <Badge className="absolute top-2 left-2 bg-white/90 text-neutral-800">Tem maior</Badge>
        )}
        {line && (
          <span
            key={line.quantity}
            className="animate-pop absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white text-base font-black text-red-600"
          >
            {line.quantity}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="text-lg leading-tight font-extrabold">{product.name}</h3>
        {product.description && (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-snug">
            {product.description}
          </p>
        )}
        <p className="mt-auto pt-1 text-2xl font-black text-red-600">
          {formatCurrency(product.price)}
        </p>
      </div>

      <div className="p-3 pt-0">
        {line ? (
          <div className="flex items-center justify-between rounded-full bg-red-50 p-1">
            <Button
              size="icon"
              variant="outline"
              className="size-12 rounded-full bg-white"
              aria-label="Diminuir quantidade"
              onClick={() =>
                line.quantity <= 1 ? removeLine(line.key) : updateQuantity(line.key, line.quantity - 1)
              }
            >
              <Minus className="size-5" />
            </Button>
            <span className="text-xl font-black">{line.quantity}</span>
            <Button
              size="icon"
              className="size-12 rounded-full"
              aria-label="Aumentar quantidade"
              onClick={() => addProduct(product, 1)}
            >
              <Plus className="size-5" />
            </Button>
          </div>
        ) : (
          <Button
            className="h-14 w-full rounded-full text-lg font-bold"
            onClick={() => addProduct(product, 1)}
          >
            <Plus className="size-5" /> Adicionar
          </Button>
        )}
      </div>
    </div>
  );
}
