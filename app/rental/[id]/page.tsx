import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { RentalBooking } from "@/components/rental/rental-booking"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const rentalItemId = parseInt(id, 10)

  let rentalItem = null

  if (!isNaN(rentalItemId)) {
    rentalItem = await prisma.rentalItem.findUnique({
      where: { id: rentalItemId },
      include: {
        product: {
          include: {
            images: true,
            seller: true,
          },
        },
        rentalOrders: {
          where: {
            status: {
              notIn: ["CANCELLED"],
            },
          },
          select: {
            startDate: true,
            endDate: true,
          },
        },
      },
    })

    if (!rentalItem) {
      rentalItem = await prisma.rentalItem.findFirst({
        where: { productId: rentalItemId },
        include: {
          product: {
            include: {
              images: true,
              seller: true,
            },
          },
          rentalOrders: {
            where: {
              status: {
                notIn: ["CANCELLED"],
              },
            },
            select: {
              startDate: true,
              endDate: true,
            },
          },
        },
      })
    }
  } else {
    // Try matching by product slug
    rentalItem = await prisma.rentalItem.findFirst({
      where: {
        product: { slug: id },
      },
      include: {
        product: {
          include: {
            images: true,
            seller: true,
          },
        },
        rentalOrders: {
          where: {
            status: {
              notIn: ["CANCELLED"],
            },
          },
          select: {
            startDate: true,
            endDate: true,
          },
        },
      },
    })
  }

  if (!rentalItem) {
    return notFound()
  }

  // Format bookings for the calendar
  const bookings = rentalItem.rentalOrders.map((order) => ({
    from: order.startDate.toISOString(),
    to: order.endDate.toISOString(),
  }))

  const serializedItem = {
    id: rentalItem.id,
    productId: rentalItem.productId,
    productSlug: rentalItem.product.slug,
    pricePerDay: Number(rentalItem.pricePerDay),
    depositAmount: Number(rentalItem.depositAmount),
    condition: rentalItem.condition,
    product: {
      name: rentalItem.product.name,
      image: rentalItem.product.images[0]?.url || "/images/placeholder.jpg",
      shopName: rentalItem.product.seller.shopName || "Cosplay Shop",
      description: rentalItem.product.description || "",
    },
  }

  return (
    <RentalBooking rentalItem={serializedItem} existingBookings={bookings} />
  )
}
