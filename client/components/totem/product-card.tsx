"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/types";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const { addProduct } = useCart();

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-base leading-snug">{product.name}</CardTitle>
        {product.description && (
          <p className="text-muted-foreground text-sm">{product.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold">{formatCurrency(product.price)}</p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={() => {
            addProduct(product, 1);
            toast.success(`${product.name} adicionado ao pedido`);
          }}
        >
          <Plus className="size-4" />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
}
