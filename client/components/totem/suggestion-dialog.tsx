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

export function SuggestionDialog() {
  const { suggestion, acceptSuggestion, dismissSuggestion, catalog, addProduct } = useCart();
  const router = useRouter();

  const open = suggestion !== null;

  let title = "";
  let description = "";
  let acceptLabel = "Sim, quero!";

  if (suggestion?.kind === "upgrade") {
    const diff = suggestion.upgradeTo.price - suggestion.product.price;
    title = "Que tal aumentar?";
    description = `Por apenas ${formatCurrency(diff)} a mais, você pode levar ${suggestion.upgradeTo.name} em vez de ${suggestion.product.name}.`;
    acceptLabel = `Levar por +${formatCurrency(diff)}`;
  } else if (suggestion?.kind === "comboConvert") {
    const diff = suggestion.combo.price - suggestion.product.price;
    title = "Transforme em combo";
    description = `Você já escolheu seu ${suggestion.product.name}. Que tal transformar em ${suggestion.combo.name} por mais ${formatCurrency(diff)}?`;
    acceptLabel = `Sim, por +${formatCurrency(diff)}`;
  } else if (suggestion?.kind === "crossSell") {
    title = "Quer acompanhar?";
    description = `Quer adicionar ${suggestion.product.name} ao seu pedido por ${formatCurrency(suggestion.product.price)}?`;
    acceptLabel = "Adicionar";
  } else if (suggestion?.kind === "dessert") {
    title = "Seu pedido está quase pronto!";
    description = "Deseja adicionar uma sobremesa?";
  }

  const desserts = catalog.products.filter((p) => p.category.slug === "sobremesas");

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {suggestion?.kind === "dessert" && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {desserts.map((dessert) => (
              <Button
                key={dessert.id}
                variant="outline"
                className="h-auto flex-col gap-1 py-3"
                onClick={() => {
                  addProduct(dessert, 1);
                  dismissSuggestion();
                  router.push("/checkout");
                }}
              >
                <span className="font-medium">{dessert.name}</span>
                <span className="text-muted-foreground text-sm">
                  {formatCurrency(dessert.price)}
                </span>
              </Button>
            ))}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              dismissSuggestion();
              if (suggestion?.kind === "dessert") router.push("/checkout");
            }}
          >
            Não, obrigado
          </AlertDialogCancel>
          {suggestion?.kind !== "dessert" && (
            <AlertDialogAction onClick={acceptSuggestion}>{acceptLabel}</AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
