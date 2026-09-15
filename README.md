# Quick Order

Sistema de compras de lanches para um totem de fast-food, desenvolvido como projeto bimestral da disciplina ES41.

## 1. Descrição

O Quick Order simula a experiência de autoatendimento de uma grande rede de lanchonetes. Em um totem (ou navegador), o cliente monta seu pedido escolhendo lanches, acompanhamentos, bebidas, sobremesas ou combos prontos, revisa o carrinho, escolhe uma forma de pagamento simulada e recebe um número de pedido ao final. O projeto tem como foco demonstrar boas práticas de organização de código, validação de dados, UX e uma arquitetura clara entre frontend, backend e banco de dados — além de técnicas de upselling e cross-selling aplicadas via UX.

## 2. Tecnologias

- **Frontend:** Next.js (App Router), TypeScript, shadcn/ui, Tailwind CSS
- **Backend:** NestJS, TypeScript, Prisma ORM
- **Banco de dados:** PostgreSQL (Neon)
- **Deploy:** Vercel (frontend), Render (backend), Neon (banco)

## 3. Arquitetura

```
Usuário
   ↓
Next.js (client/)         — UI do totem, carrinho, sugestões, checkout
   ↓  fetch HTTP (NEXT_PUBLIC_API_URL)
NestJS (server/)          — API REST, validação de DTOs, regras de negócio
   ↓
Prisma ORM                — schema, migrations, queries tipadas
   ↓
PostgreSQL (Neon)
```

O frontend nunca acessa o banco diretamente: toda leitura/escrita de produtos, combos e pedidos passa pela API NestJS, que recalcula preços e valida os dados antes de persistir.

Estrutura do backend (`server/src`):

```
src/
├── categories/   # GET /categories
├── products/     # GET /products, GET /products/:id
├── combos/       # GET /combos, GET /combos/:id
├── orders/       # POST /orders, GET /orders/:id
├── health/       # GET /health
├── prisma/       # PrismaService/PrismaModule (conexão única e global)
└── common/       # utilitários (conversão de Decimal do Prisma)
```

Estrutura do frontend (`client/`):

```
app/
├── page.tsx                    # Tela inicial (boas-vindas)
├── menu/page.tsx                # Catálogo com abas (Combos/Lanches/...)
├── checkout/page.tsx            # Nome, pagamento, resumo
└── confirmation/[orderId]/      # Confirmação com número do pedido
contexts/cart-context.tsx        # Estado do carrinho + motor de sugestões
components/totem/                # Componentes de UI específicos do totem
components/ui/                   # Componentes shadcn/ui
lib/                             # Cliente de API, tipos e formatação
```

## 4. Funcionalidades

- Catálogo navegável por categorias (Lanches, Acompanhamentos, Bebidas, Sobremesas, Combos)
- Carrinho com adição, remoção e alteração de quantidade, persistido em `localStorage`
- Upsell de tamanho (ex.: batata pequena → média)
- Sugestão de conversão de lanche em combo
- Cross-sell de acompanhamento após lanche + bebida no carrinho
- Sugestão de sobremesa antes do checkout
- Checkout com validação de nome e forma de pagamento simulada (Pix, Cartão, Dinheiro)
- Confirmação do pedido com número gerado pelo backend
- Preço final sempre recalculado no backend a partir do banco de dados

## 5. Banco de dados

Entidades (`server/prisma/schema.prisma`):

- **Category** — categorias do cardápio (slug, nome, ordem)
- **Product** — produtos individuais, pertencem a uma `Category`; podem apontar para outro `Product` via `upgradeToProductId` (upsell de tamanho)
- **Combo** — combos com preço próprio
- **ComboItem** — relação N:N entre `Combo` e `Product`, com quantidade
- **Order** — pedido finalizado (cliente, forma de pagamento, total, data)
- **OrderItem** — item do pedido, referenciando um `Product` **ou** um `Combo`, com preço e subtotal calculados no momento da criação

O schema é versionado por migrations do Prisma (`server/prisma/migrations`) e populado por um seed idempotente (`server/prisma/seed.ts`) que cadastra as 4 categorias, os 14 produtos e os 3 combos exigidos pelo projeto.

## 6. Diferencial: upselling e cross-selling

A lógica de sugestões vive centralizada em `client/contexts/cart-context.tsx` e é exibida por um único componente (`SuggestionDialog`), sempre como um diálogo opcional, com preço explícito e botão de recusa sempre visível:

1. **Upgrade de tamanho** — ao adicionar um produto com `upgradeToProductId` (ex.: Batata Pequena), sugere a versão maior mostrando a diferença de preço.
2. **Sugestão de combo** — ao adicionar um lanche que existe em algum combo, sugere convertê-lo em combo pelo valor adicional.
3. **Cross-sell de acompanhamento** — quando o carrinho tem lanche + bebida e nenhum acompanhamento, sugere adicionar um.
4. **Sobremesa no checkout** — antes de seguir para o checkout, se não houver sobremesa no carrinho, oferece as opções disponíveis.

Cada sugestão é mostrada no máximo uma vez por sessão de compra (controlado por refs no contexto), evitando um fluxo infinito de ofertas. Nenhum item é adicionado automaticamente — o cliente sempre aceita ou recusa explicitamente.

## 7. Validações

**Carrinho** (`contexts/cart-context.tsx`):
- Quantidade nunca fica abaixo de 1 (`updateQuantity` usa `Math.max(1, ...)`)
- Botões de +/- para ajustar quantidade; preço e subtotal recalculados automaticamente
- "Finalizar pedido" fica desabilitado com o carrinho vazio

**Checkout** (`app/checkout/page.tsx`):
- Nome do cliente obrigatório (mínimo 2 caracteres)
- Forma de pagamento obrigatória
- Erros exibidos inline com componentes shadcn/ui (mensagens de erro nos campos)
- Redireciona para o menu se o carrinho estiver vazio

**Backend** (`orders/dto/create-order.dto.ts` + `ValidationPipe` global):
- `class-validator` valida tipo, formato e presença de todos os campos (`whitelist` + `forbidNonWhitelisted` rejeitam campos não esperados, como um preço enviado pelo cliente)
- O preço de cada item **nunca** vem do frontend: o backend busca produto/combo no banco pelo `id` e recalcula `unitPrice`, `subtotal` e `total`
- Produto/combo inexistente ou inativo retorna `404 Not Found`
- Pedido sem itens ou com total inválido retorna `400 Bad Request`

## 8. Deploy

### Executando localmente

**Backend:**

```bash
cd server
npm install
cp .env.example .env   # preencher DATABASE_URL com uma instância Postgres/Neon
npx prisma migrate dev
npx prisma db seed
npm run start:dev       # http://localhost:3001
```

**Frontend:**

```bash
cd client
npm install
cp .env.example .env.local
npm run dev              # http://localhost:3000
```

### Neon (banco)

1. Criar um projeto no [Neon](https://neon.tech) e copiar a connection string (com `sslmode=require`).
2. Usar essa string como `DATABASE_URL` no backend (local e no Render).
3. Rodar `npx prisma migrate deploy` e `npx prisma db seed` apontando para o banco do Neon.

### Render (backend)

- Repositório configurado com `render.yaml` (Blueprint) na raiz, apontando para `server/` como `rootDir`.
- Build command: `npm install && npx prisma generate && npm run build && npx prisma migrate deploy`
- Start command: `npm run start:prod`
- Variáveis de ambiente a configurar no painel do Render: `DATABASE_URL` (Neon), `CORS_ORIGIN` (URL do frontend na Vercel), `PORT`.

### Vercel (frontend)

- Importar o repositório apontando o *root directory* para `client/`.
- Variável de ambiente: `NEXT_PUBLIC_API_URL` com a URL pública do backend no Render.
- Build/start detectados automaticamente (Next.js).

### Variáveis de ambiente

`server/.env.example`:
```
DATABASE_URL=
PORT=3001
CORS_ORIGIN=
```

`client/.env.example`:
```
NEXT_PUBLIC_API_URL=
```

Nenhuma credencial real é versionada — apenas os arquivos `.env.example`, com placeholders.
