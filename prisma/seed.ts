import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.menuItem.deleteMany()

  const drinks = [
    {
      name: 'Espresso',
      description: 'Rich and bold single or double shot',
      basePrice: 3.50,
      category: 'Espresso',
      options: JSON.stringify({
        sizes: ['Single', 'Double'],
        milk: ['None', 'Whole', 'Oat', 'Almond'],
        sweetness: ['None', 'Light', 'Medium', 'Sweet'],
        extras: ['Extra Shot (+$0.50)', 'Vanilla (+$0.50)', 'Caramel (+$0.50)']
      })
    },
    {
      name: 'Latte',
      description: 'Smooth espresso with steamed milk',
      basePrice: 4.50,
      category: 'Espresso',
      options: JSON.stringify({
        sizes: ['8oz', '12oz', '16oz'],
        milk: ['Whole', 'Oat', 'Almond', 'Soy'],
        sweetness: ['None', 'Light', 'Medium', 'Sweet'],
        temperature: ['Hot', 'Iced'],
        extras: ['Extra Shot (+$0.50)', 'Vanilla (+$0.50)', 'Caramel (+$0.50)', 'Whipped Cream (+$0.50)']
      })
    },
    {
      name: 'Cappuccino',
      description: 'Equal parts espresso, steamed milk, and foam',
      basePrice: 4.50,
      category: 'Espresso',
      options: JSON.stringify({
        sizes: ['8oz', '12oz'],
        milk: ['Whole', 'Oat', 'Almond'],
        sweetness: ['None', 'Light', 'Medium'],
        temperature: ['Hot'],
        extras: ['Extra Shot (+$0.50)', 'Vanilla (+$0.50)', 'Cinnamon (+$0.25)']
      })
    },
    {
      name: 'Cold Brew',
      description: 'Slow-steeped for 18 hours, smooth and bold',
      basePrice: 5.00,
      category: 'Cold Brew',
      options: JSON.stringify({
        sizes: ['12oz', '16oz'],
        milk: ['None', 'Whole', 'Oat', 'Almond'],
        sweetness: ['None', 'Light', 'Medium', 'Sweet'],
        extras: ['Vanilla (+$0.50)', 'Caramel (+$0.50)', 'Cold Foam (+$1.00)']
      })
    },
    {
      name: 'Matcha Latte',
      description: 'Ceremonial grade matcha with steamed milk',
      basePrice: 5.50,
      category: 'Tea',
      options: JSON.stringify({
        sizes: ['8oz', '12oz', '16oz'],
        milk: ['Whole', 'Oat', 'Almond', 'Soy'],
        sweetness: ['None', 'Light', 'Medium', 'Sweet'],
        temperature: ['Hot', 'Iced'],
        extras: ['Extra Matcha (+$1.00)', 'Vanilla (+$0.50)']
      })
    },
    {
      name: 'Croissant',
      description: 'Buttery, flaky French pastry',
      basePrice: 3.50,
      category: 'Pastries',
      options: JSON.stringify({
        sizes: ['Regular'],
        extras: ['Warmed', 'Butter', 'Jam (+$0.50)']
      })
    }
  ]

  for (const drink of drinks) {
    await prisma.menuItem.create({ data: drink })
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })