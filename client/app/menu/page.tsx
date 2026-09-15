"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/totem/site-header";
import { ProductCard } from "@/components/totem/product-card";
import { ComboCard } from "@/components/totem/combo-card";
import { useCart } from "@/contexts/cart-context";
import type { CategorySlug } from "@/lib/types";

const TABS: { value: CategorySlug | "combos"; label: string }[] = [
  { value: "combos", label: "Combos" },
  { value: "lanches", label: "Lanches" },
  { value: "acompanhamentos", label: "Acompanhamentos" },
  { value: "bebidas", label: "Bebidas" },
  { value: "sobremesas", label: "Sobremesas" },
];

function MenuContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "lanches";
  const [tab, setTab] = useState(initialTab);
  const { catalog } = useCart();

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6">
        <Tabs value={tab} onValueChange={setTab} className="flex-1">
          <TabsList className="flex w-full justify-start gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="shrink-0 py-2">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {catalog.loading ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="combos" className="mt-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {catalog.combos.map((combo) => (
                    <ComboCard key={combo.id} combo={combo} />
                  ))}
                </div>
              </TabsContent>
              {(["lanches", "acompanhamentos", "bebidas", "sobremesas"] as CategorySlug[]).map(
                (slug) => (
                  <TabsContent key={slug} value={slug} className="mt-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {catalog.products
                        .filter((p) => p.category.slug === slug)
                        .map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                  </TabsContent>
                ),
              )}
            </>
          )}
        </Tabs>
      </div>
    </main>
  );
}

export default function MenuPage() {
  return (
    <Suspense>
      <MenuContent />
    </Suspense>
  );
}
