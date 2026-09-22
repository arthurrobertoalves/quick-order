"use client";

import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/format";
import { productEmoji } from "@/lib/visuals";

export function SuggestionDialog() {
  const { suggestion, acceptSuggestion, dismissSuggestion, catalog, addProduct } = useCart();
  const router = useRouter();

  let emoji = "✨";
  let title = "";
  let description = "";
  let acceptLabel = "Sim, quero!";

  if (suggestion?.kind === "upgrade") {
    const diff = suggestion.upgradeTo.price - suggestion.product.price;
    emoji = productEmoji(suggestion.upgradeTo.name, suggestion.upgradeTo.category.slug);
    title = "Que tal aumentar?";
    description = `Por apenas ${formatCurrency(diff)} a mais, leve ${suggestion.upgradeTo.name} em vez de ${suggestion.product.name}.`;
    acceptLabel = `Aumentar por +${formatCurrency(diff)}`;
  } else if (suggestion?.kind === "comboConvert") {
    const diff = suggestion.combo.price - suggestion.product.price;
    emoji = "🔥";
    title = "Vire combo!";
    description = `Você escolheu ${suggestion.product.name}. Transforme em ${suggestion.combo.name} por mais ${formatCurrency(diff)}.`;
    acceptLabel = `Virar combo por +${formatCurrency(diff)}`;
  } else if (suggestion?.kind === "crossSell") {
    emoji = productEmoji(suggestion.product.name, suggestion.product.category.slug);
    title = "Quer acompanhar?";
    description = `Adicionar ${suggestion.product.name} ao seu pedido por ${formatCurrency(suggestion.product.price)}?`;
    acceptLabel = `Adicionar +${formatCurrency(suggestion.product.price)}`;
  } else if (suggestion?.kind === "dessert") {
    emoji = "🍦";
    title = "Quase pronto!";
    description = "Que tal fechar com uma sobremesa?";
  }

  const desserts = catalog.products.filter((p) => p.category.slug === "sobremesas");

  return (
    <AlertDialog open={suggestion !== null}>
      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader className="items-center text-center">
          <span className="animate-pop text-7xl">{emoji}</span>
          <AlertDialogTitle className="text-3xl font-black">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-base">{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {suggestion?.kind === "dessert" && (
          <div className="grid grid-cols-3 gap-2">
            {desserts.map((dessert) => (
              <Button
                key={dessert.id}
                variant="outline"
                className="h-auto flex-col gap-1 rounded-2xl py-3"
                onClick={() => {
                  addProduct(dessert, 1);
                  dismissSuggestion();
                  router.push("/checkout");
                }}
              >
                <span className="text-4xl">{productEmoji(dessert.name, "sobremesas")}</span>
                <span className="text-sm font-bold">{dessert.name}</span>
                <span className="text-sm font-black text-red-600">
                  +{formatCurrency(dessert.price)}
                </span>
              </Button>
            ))}
          </div>
        )}

        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          {suggestion?.kind !== "dessert" && (
            <AlertDialogAction className="h-14 rounded-full text-lg font-black" onClick={acceptSuggestion}>
              {acceptLabel}
            </AlertDialogAction>
          )}
          <AlertDialogCancel
            className="h-12 rounded-full text-base font-semibold"
            onClick={() => {
              dismissSuggestion();
              if (suggestion?.kind === "dessert") router.push("/checkout");
            }}
          >
            {suggestion?.kind === "dessert" ? "Não, ir para o pagamento" : "Não, obrigado"}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
