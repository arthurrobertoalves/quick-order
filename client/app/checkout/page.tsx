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
          <h1 className="text-3xl font-black">Quase lá! 🎉</h1>

          <section className="bg-card rounded-3xl border p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-extrabold">Resumo do pedido</h2>
            <ul className="space-y-2">
              {lines.map((line) => (
                <li key={line.key} className="flex items-center gap-3">
                  <span className="text-2xl">
                    {line.type === "COMBO" ? "🔥" : productEmoji(line.name, line.categorySlug)}
                  </span>
                  <span className="flex-1 text-base font-semibold">
                    {line.quantity}x {line.name}
                  </span>
                  <span className="font-bold">{formatCurrency(line.unitPrice * line.quantity)}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-2xl font-black">
              <span>Total</span>
              <span className="text-red-600">{formatCurrency(subtotal)}</span>
            </div>
          </section>

          <section className="space-y-2">
            <Label htmlFor="customerName" className="text-lg font-extrabold">
              Seu nome
            </Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Como podemos te chamar?"
              autoComplete="off"
              className="h-14 rounded-2xl px-4 text-lg"
              aria-invalid={Boolean(errors.customerName)}
            />
            {errors.customerName && (
              <p className="text-destructive text-sm font-semibold">{errors.customerName}</p>
            )}
          </section>

          <section className="space-y-2">
            <Label className="text-lg font-extrabold">Como vai pagar?</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              className="grid grid-cols-3 gap-3"
            >
              {PAYMENT_METHODS.map((method) => (
                <Label
                  key={method.value}
                  htmlFor={method.value}
                  className="has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-red-50 bg-card flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 p-4 text-base font-bold transition-colors"
                >
                  <span className="text-4xl">{method.emoji}</span>
                  {method.label}
                  <RadioGroupItem id={method.value} value={method.value} className="sr-only" />
                </Label>
              ))}
            </RadioGroup>
            {errors.paymentMethod && (
              <p className="text-destructive text-sm font-semibold">{errors.paymentMethod}</p>
            )}
          </section>

          {formError && (
            <p className="bg-destructive/10 text-destructive rounded-2xl p-3 text-sm font-semibold">
              {formError}
            </p>
          )}
        </div>

        <div className="bg-card border-t p-4 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)]">
          <Button
            type="submit"
            size="lg"
            className="h-16 w-full justify-between rounded-full px-6 text-xl font-black"
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
