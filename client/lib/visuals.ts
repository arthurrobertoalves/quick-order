export interface CategoryVisual {
  slug: string;
  label: string;
  emoji: string;
  gradient: string;
}

export const CATEGORY_VISUALS: CategoryVisual[] = [
  { slug: "combos", label: "Combos", emoji: "🔥", gradient: "from-orange-500 to-red-500" },
  { slug: "lanches", label: "Lanches", emoji: "🍔", gradient: "from-amber-400 to-orange-500" },
  { slug: "acompanhamentos", label: "Batatas", emoji: "🍟", gradient: "from-yellow-300 to-amber-400" },
  { slug: "bebidas", label: "Bebidas", emoji: "🥤", gradient: "from-sky-400 to-blue-500" },
  { slug: "sobremesas", label: "Doces", emoji: "🍦", gradient: "from-pink-400 to-rose-500" },
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

export function categoryVisual(slug: string) {
  return CATEGORY_VISUALS.find((c) => c.slug === slug) ?? CATEGORY_VISUALS[1];
}
