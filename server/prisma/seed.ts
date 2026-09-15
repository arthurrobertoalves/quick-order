import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await Promise.all(
    [
      { slug: 'lanches', name: 'Lanches', order: 1 },
      { slug: 'acompanhamentos', name: 'Acompanhamentos', order: 2 },
      { slug: 'bebidas', name: 'Bebidas', order: 3 },
      { slug: 'sobremesas', name: 'Sobremesas', order: 4 },
    ].map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: category,
        create: category,
      }),
    ),
  );

  const categoryBySlug = Object.fromEntries(
    categories.map((category) => [category.slug, category]),
  );

  async function upsertProduct(data: {
    name: string;
    description: string;
    price: number;
    categorySlug: keyof typeof categoryBySlug;
  }) {
    return prisma.product.upsert({
      where: { name: data.name },
      update: {
        description: data.description,
        price: data.price,
        categoryId: categoryBySlug[data.categorySlug].id,
      },
      create: {
        name: data.name,
        description: data.description,
        price: data.price,
        categoryId: categoryBySlug[data.categorySlug].id,
      },
    });
  }

  const [xBurger, baconBurger, duploBurger] = await Promise.all([
    upsertProduct({
      name: 'X-Burger',
      description: 'Hambúrguer, queijo, alface e tomate.',
      price: 15.9,
      categorySlug: 'lanches',
    }),
    upsertProduct({
      name: 'Bacon Burger',
      description: 'Hambúrguer, queijo, bacon crocante e barbecue.',
      price: 19.9,
      categorySlug: 'lanches',
    }),
    upsertProduct({
      name: 'Duplo Burger',
      description: 'Dois hambúrgueres, queijo duplo e molho especial.',
      price: 22.9,
      categorySlug: 'lanches',
    }),
  ]);

  await Promise.all([
    upsertProduct({
      name: 'X-Salada',
      description: 'Hambúrguer, queijo, alface, tomate e maionese.',
      price: 17.9,
      categorySlug: 'lanches',
    }),
    upsertProduct({
      name: 'Chicken Burger',
      description: 'Filé de frango empanado, alface e maionese.',
      price: 18.9,
      categorySlug: 'lanches',
    }),
  ]);

  const batataMedia = await upsertProduct({
    name: 'Batata Média',
    description: 'Porção média de batatas fritas crocantes.',
    price: 9.9,
    categorySlug: 'acompanhamentos',
  });
  const batataPequena = await upsertProduct({
    name: 'Batata Pequena',
    description: 'Porção pequena de batatas fritas crocantes.',
    price: 7.9,
    categorySlug: 'acompanhamentos',
  });
  await prisma.product.update({
    where: { id: batataPequena.id },
    data: { upgradeToProductId: batataMedia.id },
  });
  await upsertProduct({
    name: 'Nuggets',
    description: 'Porção de nuggets de frango crocantes.',
    price: 12.9,
    categorySlug: 'acompanhamentos',
  });

  const [cocaCola] = await Promise.all([
    upsertProduct({
      name: 'Coca-Cola',
      description: 'Refrigerante de cola 300ml.',
      price: 6.0,
      categorySlug: 'bebidas',
    }),
    upsertProduct({
      name: 'Fanta',
      description: 'Refrigerante de laranja 300ml.',
      price: 6.0,
      categorySlug: 'bebidas',
    }),
    upsertProduct({
      name: 'Sprite',
      description: 'Refrigerante de limão 300ml.',
      price: 6.0,
      categorySlug: 'bebidas',
    }),
  ]);

  const [sorvete] = await Promise.all([
    upsertProduct({
      name: 'Sorvete',
      description: 'Casquinha de sorvete de creme.',
      price: 8.9,
      categorySlug: 'sobremesas',
    }),
    upsertProduct({
      name: 'Sundae',
      description: 'Sundae de chocolate com calda.',
      price: 10.9,
      categorySlug: 'sobremesas',
    }),
    upsertProduct({
      name: 'Torta',
      description: 'Torta doce individual.',
      price: 9.9,
      categorySlug: 'sobremesas',
    }),
  ]);

  async function upsertCombo(data: {
    name: string;
    description: string;
    price: number;
    items: { productId: number; quantity?: number }[];
  }) {
    const combo = await prisma.combo.upsert({
      where: { name: data.name },
      update: { description: data.description, price: data.price },
      create: { name: data.name, description: data.description, price: data.price },
    });
    await prisma.comboItem.deleteMany({ where: { comboId: combo.id } });
    await prisma.comboItem.createMany({
      data: data.items.map((item) => ({
        comboId: combo.id,
        productId: item.productId,
        quantity: item.quantity ?? 1,
      })),
    });
    return combo;
  }

  await upsertCombo({
    name: 'Combo Clássico',
    description: 'X-Burger, batata média e refrigerante.',
    price: 27.9,
    items: [
      { productId: xBurger.id },
      { productId: batataMedia.id },
      { productId: cocaCola.id },
    ],
  });

  await upsertCombo({
    name: 'Combo Bacon',
    description: 'Bacon Burger, batata média e refrigerante.',
    price: 31.9,
    items: [
      { productId: baconBurger.id },
      { productId: batataMedia.id },
      { productId: cocaCola.id },
    ],
  });

  await upsertCombo({
    name: 'Combo Completo',
    description: 'Duplo Burger, batata média, refrigerante e sobremesa.',
    price: 37.9,
    items: [
      { productId: duploBurger.id },
      { productId: batataMedia.id },
      { productId: cocaCola.id },
      { productId: sorvete.id },
    ],
  });

  console.log('Seed completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
