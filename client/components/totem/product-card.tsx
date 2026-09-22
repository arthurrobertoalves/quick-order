"use client";

import { Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import { productEmoji } from "@/lib/visuals";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { lines, addProduct, updateQuantity, removeLine } = useCart();
  const line = lines.find((l) => l.key === `product-${product.id}`);

  return (
    <div className="bg-card flex flex-col overflow-hidden rounded-2xl border">
      <div className="flex items-start justify-between gap-2 p-3 pb-0">
        <span className="bg-muted flex size-11 shrink-0 items-center justify-center rounded-full text-2xl">
          {productEmoji(product.name, product.category.slug)}
        </span>
        {product.upgradeTo && (
          <Badge variant="secondary" className="text-xs font-medium">
            Tem maior
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 pt-2">
        <h3 className="text-base leading-tight font-semibold">{product.name}</h3>
        {product.description && (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-snug">
            {product.description}
          </p>
        )}
        <p className="mt-2 text-lg font-bold text-red-700">{formatCurrency(product.price)}</p>
      </div>

      <div className="p-3 pt-0">
        {line ? (
          <div className="flex items-center justify-between rounded-full border p-1">
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
            <span className="text-base font-semibold">{line.quantity}</span>
            <Button
              size="icon"
              className="size-9 rounded-full"
              aria-label="Aumentar quantidade"
              onClick={() => addProduct(product, 1)}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="hover:bg-primary hover:text-primary-foreground h-11 w-full rounded-full font-semibold"
            onClick={() => addProduct(product, 1)}
          >
            <Plus className="size-4" /> Adicionar
          </Button>
        )}
      </div>
    </div>
  );
}
