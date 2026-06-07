/* eslint-disable no-console */
import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import dotenv from "dotenv"

dotenv.config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("=== Checking Database Stats ===")
  const userCount = await prisma.user.count()
  const productCount = await prisma.product.count()
  const cartItemCount = await prisma.cartItem.count()
  const orderCount = await prisma.order.count()
  const orderItemCount = await prisma.orderItem.count()
  const paymentCount = await prisma.payment.count()

  console.log(`Users: ${userCount}`)
  console.log(`Products: ${productCount}`)
  console.log(`Cart Items: ${cartItemCount}`)
  console.log(`Orders: ${orderCount}`)
  console.log(`Order Items: ${orderItemCount}`)
  console.log(`Payments: ${paymentCount}`)

  if (cartItemCount > 0) {
    console.log("\n=== Cart Items ===")
    const cartItems = await prisma.cartItem.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true } },
      },
      take: 5,
    })
    console.dir(cartItems, { depth: null })
  }

  if (orderCount > 0) {
    console.log("\n=== Latest Orders ===")
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    })
    console.dir(orders, { depth: null })
  }
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
