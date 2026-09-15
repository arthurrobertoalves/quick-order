export type CategorySlug = "lanches" | "acompanhamentos" | "bebidas" | "sobremesas";

export interface Category {
  id: number;
  slug: CategorySlug;
  name: string;
  order: number;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  active: boolean;
  categoryId: number;
  category: Category;
  upgradeToProductId: number | null;
  upgradeTo?: Product | null;
}

export interface ComboItem {
  id: number;
  quantity: number;
  product: Product;
}

export interface Combo {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  active: boolean;
  items: ComboItem[];
}

export type PaymentMethod = "PIX" | "CARD" | "CASH";

export type OrderItemType = "PRODUCT" | "COMBO";

export interface CreateOrderItemPayload {
  type: OrderItemType;
  id: number;
  quantity: number;
}

export interface CreateOrderPayload {
  customerName: string;
  paymentMethod: PaymentMethod;
  items: CreateOrderItemPayload[];
}

export interface OrderItemResponse {
  id: number;
  type: OrderItemType;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: number;
  customerName: string;
  paymentMethod: PaymentMethod;
  total: number;
  createdAt: string;
  items: OrderItemResponse[];
}
