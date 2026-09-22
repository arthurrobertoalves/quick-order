"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/totem/site-header";
import { ProductCard } from "@/components/totem/product-card";
import { ComboCard } from "@/components/totem/combo-card";
import { CartBar } from "@/components/totem/cart-sheet";
import { useCart } from "@/contexts/cart-context";
import { CATEGORY_VISUALS } from "@/lib/visuals";

const VALID = CATEGORY_VISUALS.map((c) => c.slug);

function MenuContent() {
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab") ?? "lanches";
  const [tab, setTab] = useState(VALID.includes(requested) ? requested : "lanches");
  const { catalog } = useCart();
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [tab]);

  const current = CATEGORY_VISUALS.find((c) => c.slug === tab)!;

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <SiteHeader step={1} />
      <Tabs value={tab} onValueChange={setTab} className="min-h-0 flex-1 gap-0">
        <TabsList className="no-scrollbar bg-muted !h-auto w-full shrink-0 justify-start gap-2 overflow-x-auto rounded-none p-2">
          {CATEGORY_VISUALS.map((c) => (
            <TabsTrigger
              key={c.slug}
              value={c.slug}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-auto min-w-[5.2rem] shrink-0 flex-col gap-0.5 rounded-2xl px-3 py-2 text-sm font-bold data-[state=active]:shadow-md"
            >
              <span className="text-3xl leading-none">{c.emoji}</span>
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <h2 className="mb-3 text-2xl font-black">
            {current.emoji} {current.label}
          </h2>

          {catalog.loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-3xl" />
              ))}
            </div>
          ) : catalog.products.length === 0 ? (
            <p className="text-muted-foreground py-10 text-center">
              Não foi possível carregar o cardápio. Chame um atendente.
            </p>
          ) : (
            <>
              <TabsContent value="combos" className="flex flex-col gap-3">
                {catalog.combos.map((combo, i) => (
                  <ComboCard key={combo.id} combo={combo} index={i} />
                ))}
              </TabsContent>
              {CATEGORY_VISUALS.filter((c) => c.slug !== "combos").map((c) => (
                <TabsContent key={c.slug} value={c.slug}>
                  <div className="grid grid-cols-2 gap-3">
                    {catalog.products
                      .filter((p) => p.category.slug === c.slug)
                      .map((product, i) => (
                        <ProductCard key={product.id} product={product} index={i} />
                      ))}
                  </div>
                </TabsContent>
              ))}
            </>
          )}
        </div>
      </Tabs>
      <CartBar onJump={setTab} />
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
