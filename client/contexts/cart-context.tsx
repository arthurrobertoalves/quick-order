"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api } from "@/lib/api";
import type { Category, Combo, Product } from "@/lib/types";

export interface CartLine {
  key: string;
  type: "PRODUCT" | "COMBO";
  id: number;
  name: string;
  unitPrice: number;
  quantity: number;
  categorySlug: string;
}

type Suggestion =
  | { kind: "upgrade"; lineKey: string; product: Product; upgradeTo: Product }
  | { kind: "comboConvert"; lineKey: string; product: Product; combo: Combo }
  | { kind: "crossSell"; product: Product }
  | { kind: "dessert" };

interface Catalog {
  categories: Category[];
  products: Product[];
  combos: Combo[];
  loading: boolean;
}

interface CartContextValue {
  catalog: Catalog;
  lines: CartLine[];
  subtotal: number;
  itemCount: number;
  suggestion: Suggestion | null;
  addProduct: (product: Product, quantity?: number) => void;
  addCombo: (combo: Combo, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
  acceptSuggestion: () => void;
  dismissSuggestion: () => void;
  requestCheckoutGate: () => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "quick-order-cart";

function productToLine(product: Product, quantity: number): CartLine {
  return {
    key: `product-${product.id}`,
    type: "PRODUCT",
    id: product.id,
    name: product.name,
    unitPrice: product.price,
    quantity,
    categorySlug: product.category.slug,
  };
}

function comboToLine(combo: Combo, quantity: number): CartLine {
  return {
    key: `combo-${combo.id}`,
    type: "COMBO",
    id: combo.id,
    name: combo.name,
    unitPrice: combo.price,
    quantity,
    categorySlug: "combos",
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [catalog, setCatalog] = useState<Catalog>({
    categories: [],
    products: [],
    combos: [],
    loading: true,
  });
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  const dismissedUpgrades = useRef(new Set<number>());
  const dismissedComboConvert = useRef(new Set<number>());
  const crossSellShown = useRef(false);
  const dessertShown = useRef(false);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getProducts(), api.getCombos()])
      .then(([categories, products, combos]) => {
        setCatalog({ categories, products, combos, loading: false });
      })
      .catch(() => setCatalog((prev) => ({ ...prev, loading: false })));
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage on mount
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // storage unavailable, ignore
    }
  }, [lines, hydrated]);

  const findComboForProduct = useCallback(
    (product: Product) => {
      return catalog.combos.find((combo) =>
        combo.items.some((item) => item.product.id === product.id),
      );
    },
    [catalog.combos],
  );

  const findAccompanimentSuggestion = useCallback(() => {
    return catalog.products.find(
      (p) => p.category.slug === "acompanhamentos" && p.name === "Batata Média",
    );
  }, [catalog.products]);

  const evaluateSuggestions = useCallback(
    (currentLines: CartLine[], addedProduct?: Product) => {
      if (addedProduct) {
        if (
          addedProduct.upgradeToProductId &&
          addedProduct.upgradeTo &&
          !dismissedUpgrades.current.has(addedProduct.id)
        ) {
          setSuggestion({
            kind: "upgrade",
            lineKey: `product-${addedProduct.id}`,
            product: addedProduct,
            upgradeTo: addedProduct.upgradeTo,
          });
          return;
        }

        if (
          addedProduct.category.slug === "lanches" &&
          !dismissedComboConvert.current.has(addedProduct.id)
        ) {
          const combo = findComboForProduct(addedProduct);
          const comboAlreadyInCart = combo
            ? currentLines.some((l) => l.type === "COMBO" && l.id === combo.id)
            : false;
          if (combo && !comboAlreadyInCart) {
            setSuggestion({ kind: "comboConvert", lineKey: `product-${addedProduct.id}`, product: addedProduct, combo });
            return;
          }
        }
      }

      const hasLanche = currentLines.some((l) => l.categorySlug === "lanches");
      const hasBebida = currentLines.some((l) => l.categorySlug === "bebidas");
      const hasAcompanhamento = currentLines.some((l) => l.categorySlug === "acompanhamentos");
      if (hasLanche && hasBebida && !hasAcompanhamento && !crossSellShown.current) {
        const suggestion = findAccompanimentSuggestion();
        if (suggestion) {
          crossSellShown.current = true;
          setSuggestion({ kind: "crossSell", product: suggestion });
          return;
        }
      }

      setSuggestion(null);
    },
    [findComboForProduct, findAccompanimentSuggestion],
  );

  const addProduct = useCallback(
    (product: Product, quantity = 1) => {
      const key = `product-${product.id}`;
      const existing = lines.find((l) => l.key === key);
      const next = existing
        ? lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + quantity } : l))
        : [...lines, productToLine(product, quantity)];
      setLines(next);
      evaluateSuggestions(next, product);
    },
    [lines, evaluateSuggestions],
  );

  const addCombo = useCallback(
    (combo: Combo, quantity = 1) => {
      const key = `combo-${combo.id}`;
      const existing = lines.find((l) => l.key === key);
      const next = existing
        ? lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + quantity } : l))
        : [...lines, comboToLine(combo, quantity)];
      setLines(next);
      evaluateSuggestions(next);
    },
    [lines, evaluateSuggestions],
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    const safeQuantity = Math.max(1, Math.floor(quantity) || 1);
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, quantity: safeQuantity } : l)));
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    dismissedUpgrades.current.clear();
    dismissedComboConvert.current.clear();
    crossSellShown.current = false;
    dessertShown.current = false;
    setSuggestion(null);
  }, []);

  const acceptSuggestion = useCallback(() => {
    if (!suggestion) return;
    if (suggestion.kind === "upgrade") {
      setLines((prev) => {
        const current = prev.find((l) => l.key === suggestion.lineKey);
        const quantity = current?.quantity ?? 1;
        const withoutOld = prev.filter((l) => l.key !== suggestion.lineKey);
        const upgradedKey = `product-${suggestion.upgradeTo.id}`;
        const existingUpgraded = withoutOld.find((l) => l.key === upgradedKey);
        if (existingUpgraded) {
          return withoutOld.map((l) =>
            l.key === upgradedKey ? { ...l, quantity: l.quantity + quantity } : l,
          );
        }
        return [...withoutOld, productToLine(suggestion.upgradeTo, quantity)];
      });
    }
    if (suggestion.kind === "comboConvert") {
      setLines((prev) => {
        const withoutOld = prev.filter((l) => l.key !== suggestion.lineKey);
        const comboKey = `combo-${suggestion.combo.id}`;
        const existingCombo = withoutOld.find((l) => l.key === comboKey);
        if (existingCombo) {
          return withoutOld.map((l) =>
            l.key === comboKey ? { ...l, quantity: l.quantity + 1 } : l,
          );
        }
        return [...withoutOld, comboToLine(suggestion.combo, 1)];
      });
    }
    if (suggestion.kind === "crossSell") {
      addProduct(suggestion.product, 1);
    }
    setSuggestion(null);
  }, [suggestion, addProduct]);

  const dismissSuggestion = useCallback(() => {
    if (suggestion?.kind === "upgrade") {
      dismissedUpgrades.current.add(suggestion.product.id);
    }
    if (suggestion?.kind === "comboConvert") {
      dismissedComboConvert.current.add(suggestion.product.id);
    }
    setSuggestion(null);
  }, [suggestion]);

  const requestCheckoutGate = useCallback(() => {
    const hasDessert = lines.some((l) => l.categorySlug === "sobremesas");
    if (!hasDessert && !dessertShown.current && catalog.products.some((p) => p.category.slug === "sobremesas")) {
      dessertShown.current = true;
      setSuggestion({ kind: "dessert" });
      return false;
    }
    return true;
  }, [lines, catalog.products]);

  const subtotal = useMemo(
    () => Math.round(lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0) * 100) / 100,
    [lines],
  );
  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  const value: CartContextValue = {
    catalog,
    lines,
    subtotal,
    itemCount,
    suggestion,
    addProduct,
    addCombo,
    updateQuantity,
    removeLine,
    clear,
    acceptSuggestion,
    dismissSuggestion,
    requestCheckoutGate,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export type { Suggestion };
