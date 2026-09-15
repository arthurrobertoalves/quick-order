# Quick Order — API (NestJS)

API REST do sistema Quick Order. Veja a documentação completa do projeto no [README raiz](../README.md).

## Scripts

```bash
npm install
cp .env.example .env      # preencher DATABASE_URL

npx prisma migrate dev    # aplica migrations no banco local
npx prisma db seed        # popula categorias, produtos e combos

npm run start:dev         # http://localhost:3001
npm run build && npm run start:prod
npm run test               # testes unitários
npm run test:e2e           # testes end-to-end
```

## Endpoints

| Método | Rota            | Descrição                          |
| ------ | --------------- | ----------------------------------- |
| GET    | `/health`        | Healthcheck                         |
| GET    | `/categories`    | Lista categorias                    |
| GET    | `/products`      | Lista produtos ativos               |
| GET    | `/products/:id`  | Detalhe de um produto               |
| GET    | `/combos`        | Lista combos ativos                 |
| GET    | `/combos/:id`    | Detalhe de um combo                 |
| POST   | `/orders`        | Cria um pedido (preço recalculado)  |
| GET    | `/orders/:id`    | Detalhe de um pedido                |
