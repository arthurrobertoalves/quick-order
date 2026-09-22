"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/totem/site-header";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import { ApiError, api } from "@/lib/api";
import { productEmoji } from "@/lib/visuals";
import type { PaymentMethod } from "@/lib/types";

const PAYMENT_METHODS: { value: PaymentMethod; label: string; emoji: string }[] = [
  { value: "PIX", label: "Pix", emoji: "💠" },
  { value: "CARD", label: "Cartão", emoji: "💳" },
  { value: "CASH", label: "Dinheiro", emoji: "💵" },
];

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [errors, setErrors] = useState<{ customerName?: string; paymentMethod?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const orderPlaced = useRef(false);

  useEffect(() => {
    if (lines.length === 0 && !orderPlaced.current) {
      router.replace("/menu");
    }
  }, [lines.length, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (customerName.trim().length < 2) {
      nextErrors.customerName = "Informe seu nome (mínimo 2 caracteres).";
    }
    if (!paymentMethod) {
      nextErrors.paymentMethod = "Selecione uma forma de pagamento.";
    }
    if (lines.length === 0) {
      setFormError("Seu carrinho está vazio.");
      return;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setFormError(null);
    setSubmitting(true);
    try {
      const order = await api.createOrder({
        customerName: customerName.trim(),
        paymentMethod: paymentMethod as PaymentMethod,
        items: lines.map((line) => ({ type: line.type, id: line.id, quantity: line.quantity })),
      });
      orderPlaced.current = true;
      clear();
      router.push(`/confirmation/${order.id}`);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível enviar seu pedido. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <SiteHeader step={2} backHref="/menu" backLabel="Cardápio" />
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5">
          <h1 className="text-2xl font-semibold">Quase lá!</h1>

          <section className="bg-card rounded-2xl border p-4">
            <h2 className="mb-3 text-sm font-semibold">Resumo do pedido</h2>
            <ul className="space-y-2">
              {lines.map((line) => (
                <li key={line.key} className="flex items-center gap-3">
                  <span className="text-xl">
                    {line.type === "COMBO" ? "🔥" : productEmoji(line.name, line.categorySlug)}
                  </span>
                  <span className="flex-1 text-sm font-medium">
                    {line.quantity}x {line.name}
                  </span>
                  <span className="text-sm font-semibold">
                    {formatCurrency(line.unitPrice * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-red-700">{formatCurrency(subtotal)}</span>
            </div>
          </section>

          <section className="space-y-2">
            <Label htmlFor="customerName" className="text-sm font-semibold">
              Seu nome
            </Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Como podemos te chamar?"
              autoComplete="off"
              className="h-12 rounded-xl px-4"
              aria-invalid={Boolean(errors.customerName)}
            />
            {errors.customerName && (
              <p className="text-destructive text-sm">{errors.customerName}</p>
            )}
          </section>

          <section className="space-y-2">
            <Label className="text-sm font-semibold">Como vai pagar?</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              className="grid grid-cols-3 gap-2"
            >
              {PAYMENT_METHODS.map((method) => (
                <Label
                  key={method.value}
                  htmlFor={method.value}
                  className="has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 bg-card flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-3 text-sm font-medium transition-colors"
                >
                  <span className="text-2xl">{method.emoji}</span>
                  {method.label}
                  <RadioGroupItem id={method.value} value={method.value} className="sr-only" />
                </Label>
              ))}
            </RadioGroup>
            {errors.paymentMethod && (
              <p className="text-destructive text-sm">{errors.paymentMethod}</p>
            )}
          </section>

          {formError && (
            <p className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm">{formError}</p>
          )}
        </div>

        <div className="bg-card border-t p-4">
          <Button
            type="submit"
            size="lg"
            className="h-14 w-full justify-between rounded-full px-6 text-base font-semibold"
            disabled={submitting}
          >
            <span>{submitting ? "Enviando..." : "Confirmar pedido"}</span>
            <span>{formatCurrency(subtotal)}</span>
          </Button>
        </div>
      </form>
    </main>
  );
}
