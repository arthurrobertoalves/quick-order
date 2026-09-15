"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";

export function CartSheet() {
  const { lines, subtotal, itemCount, updateQuantity, removeLine, requestCheckoutGate } =
    useCart();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleCheckout() {
    const canProceed = requestCheckoutGate();
    if (canProceed) {
      setOpen(false);
      router.push("/checkout");
    } else {
      setOpen(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="lg" className="relative gap-2">
          <ShoppingCart className="size-5" />
          Carrinho
          {itemCount > 0 && (
            <Badge className="absolute -right-2 -top-2 h-6 min-w-6 justify-center rounded-full px-1">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Seu pedido</SheetTitle>
          <SheetDescription>Revise os itens antes de finalizar.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          {lines.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Seu carrinho está vazio.
            </p>
          ) : (
            <ul className="space-y-4 pb-4">
              {lines.map((line) => (
                <li key={line.key} className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{line.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {formatCurrency(line.unitPrice)} un.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7"
                        onClick={() => updateQuantity(line.key, line.quantity - 1)}
                        disabled={line.quantity <= 1}
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{line.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7"
                        onClick={() => updateQuantity(line.key, line.quantity + 1)}
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-medium">
                      {formatCurrency(line.unitPrice * line.quantity)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive size-7"
                      onClick={() => removeLine(line.key)}
                      aria-label="Remover item"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        <Separator />
        <SheetFooter className="gap-2">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <Button variant="outline" size="lg" onClick={() => setOpen(false)}>
            Continuar comprando
          </Button>
          <Button size="lg" disabled={lines.length === 0} onClick={handleCheckout}>
            Finalizar pedido
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
