"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/totem/site-header";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import { ApiError, api } from "@/lib/api";
import type { PaymentMethod } from "@/lib/types";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "PIX", label: "Pix" },
  { value: "CARD", label: "Cartão" },
  { value: "CASH", label: "Dinheiro" },
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
        items: lines.map((line) => ({
          type: line.type,
          id: line.id,
          quantity: line.quantity,
        })),
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
    <main className="flex flex-1 flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-bold">Finalizar pedido</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo do pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lines.map((line) => (
              <div key={line.key} className="flex justify-between text-sm">
                <span>
                  {line.name} x{line.quantity}
                </span>
                <span>{formatCurrency(line.unitPrice * line.quantity)}</span>
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nome</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Como podemos te chamar?"
              aria-invalid={Boolean(errors.customerName)}
            />
            {errors.customerName && (
              <p className="text-destructive text-sm">{errors.customerName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Forma de pagamento</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              className="grid grid-cols-3 gap-3"
            >
              {PAYMENT_METHODS.map((method) => (
                <Label
                  key={method.value}
                  htmlFor={method.value}
                  className="flex items-center justify-center gap-2 rounded-md border p-3 text-sm has-[[data-state=checked]]:border-primary"
                >
                  <RadioGroupItem id={method.value} value={method.value} />
                  {method.label}
                </Label>
              ))}
            </RadioGroup>
            {errors.paymentMethod && (
              <p className="text-destructive text-sm">{errors.paymentMethod}</p>
            )}
          </div>

          {formError && <p className="text-destructive text-sm">{formError}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Enviando..." : "Confirmar pedido"}
          </Button>
        </form>
      </div>
    </main>
  );
}
