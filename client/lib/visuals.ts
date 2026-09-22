export interface CategoryVisual {
  slug: string;
  label: string;
  emoji: string;
}

export const CATEGORY_VISUALS: CategoryVisual[] = [
  { slug: "combos", label: "Combos", emoji: "🔥" },
  { slug: "lanches", label: "Lanches", emoji: "🍔" },
  { slug: "acompanhamentos", label: "Batatas", emoji: "🍟" },
  { slug: "bebidas", label: "Bebidas", emoji: "🥤" },
  { slug: "sobremesas", label: "Doces", emoji: "🍦" },
];

const PRODUCT_EMOJI: Record<string, string> = {
  "X-Burger": "🍔",
  "X-Salada": "🥬",
  "Bacon Burger": "🥓",
  "Chicken Burger": "🐔",
  "Duplo Burger": "🍔",
  "Batata Pequena": "🍟",
  "Batata Média": "🍟",
  Nuggets: "🍗",
  "Coca-Cola": "🥤",
  Fanta: "🧃",
  Sprite: "🍋",
  Sorvete: "🍦",
  Sundae: "🍨",
  Torta: "🥧",
};

export function productEmoji(name: string, categorySlug: string) {
  return (
    PRODUCT_EMOJI[name] ??
    CATEGORY_VISUALS.find((c) => c.slug === categorySlug)?.emoji ??
    "🍽️"
  );
}
