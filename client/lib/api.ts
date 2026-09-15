import type {
  Category,
  Combo,
  CreateOrderPayload,
  OrderResponse,
  Product,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      (Array.isArray(body?.message) ? body.message.join(", ") : body?.message) ??
      "Não foi possível completar a solicitação.";
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getCategories: () => request<Category[]>("/categories"),
  getProducts: () => request<Product[]>("/products"),
  getCombos: () => request<Combo[]>("/combos"),
  createOrder: (payload: CreateOrderPayload) =>
    request<OrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getOrder: (id: number) => request<OrderResponse>(`/orders/${id}`),
};
