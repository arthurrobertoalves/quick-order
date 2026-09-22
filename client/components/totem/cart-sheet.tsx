"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import { CATEGORY_VISUALS, productEmoji } from "@/lib/visuals";

const STEPS = CATEGORY_VISUALS.filter((c) => c.slug !== "combos");

export function CartBar({ onJump }: { onJump?: (slug: string) => void }) {
  const { lines, subtotal, itemCount, updateQuantity, removeLine, requestCheckoutGate } = useCart();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const has = (slug: string) =>
    lines.some((l) => l.categorySlug === slug || l.categorySlug === "combos");
  const done = STEPS.filter((s) => has(s.slug)).length;

  function handleCheckout() {
    setOpen(false);
    if (requestCheckoutGate()) router.push("/checkout");
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="bg-card border-t px-4 pt-3 pb-4">
        <div className="mb-3 flex items-center gap-2">
          {STEPS.map((step) => {
            const ok = has(step.slug);
            return (
              <button
                key={step.slug}
                type="button"
                onClick={() => onJump?.(step.slug)}
                className={`flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
                  ok ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"
                }`}
              >
                {ok ? <Check className="size-4" /> : <span>{step.emoji}</span>}
                <span className="hidden min-[420px]:inline">{step.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-muted-foreground mb-2 text-center text-xs">
          {done === STEPS.length
            ? "Pedido completo — bom apetite!"
            : `${done} de ${STEPS.length} — complete seu pedido`}
        </p>

        <SheetTrigger asChild>
          <Button
            size="lg"
            disabled={lines.length === 0}
            className="h-14 w-full justify-between rounded-full px-5 text-base font-semibold"
          >
            <span className="flex items-center gap-2">
              <span className="relative">
                <ShoppingBag className="size-5" />
                {itemCount > 0 && (
                  <span className="bg-primary-foreground text-primary absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full text-[10px] font-bold">
                    {itemCount}
                  </span>
                )}
              </span>
              Ver pedido
            </span>
            <span>{formatCurrency(subtotal)}</span>
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent
        side="bottom"
        className="mx-auto flex !h-[85dvh] max-h-[85dvh] w-full max-w-[calc(100dvh*9/16)] flex-col overflow-hidden rounded-t-2xl"
      >
        <SheetHeader>
          <SheetTitle>Seu pedido</SheetTitle>
          <SheetDescription>Ajuste as quantidades antes de finalizar.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1 px-4">
          {lines.length === 0 ? (
            <p className="text-muted-foreground py-10 text-center">Seu carrinho está vazio.</p>
          ) : (
            <ul className="space-y-2 pb-4">
              {lines.map((line) => (
                <li key={line.key} className="bg-muted/50 flex items-center gap-3 rounded-xl p-3">
                  <span className="bg-background flex size-11 shrink-0 items-center justify-center rounded-full text-xl">
                    {line.type === "COMBO" ? "🔥" : productEmoji(line.name, line.categorySlug)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{line.name}</p>
                    <p className="text-sm font-semibold text-red-700">
                      {formatCurrency(line.unitPrice * line.quantity)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-full"
                        onClick={() =>
                          line.quantity <= 1
                            ? removeLine(line.key)
                            : updateQuantity(line.key, line.quantity - 1)
                        }
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="w-5 text-center text-sm font-semibold">{line.quantity}</span>
                      <Button
                        size="icon"
                        className="size-8 rounded-full"
                        onClick={() => updateQuantity(line.key, line.quantity + 1)}
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive size-9 shrink-0"
                    onClick={() => removeLine(line.key)}
                    aria-label="Remover item"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        <SheetFooter className="gap-3 border-t">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Subtotal</span>
            <span className="text-red-700">{formatCurrency(subtotal)}</span>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-full font-medium"
            onClick={() => setOpen(false)}
          >
            Continuar comprando
          </Button>
          <Button
            size="lg"
            className="h-14 rounded-full text-base font-semibold"
            disabled={lines.length === 0}
            onClick={handleCheckout}
          >
            Finalizar pedido
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
