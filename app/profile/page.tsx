import { redirect } from "next/navigation"
import { ProfileOverview } from "@/components/profile/profile-overview"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function Page() {
  const user = await getSession()
  if (!user) redirect("/login?redirect=/profile")

  const [orderCount, measurementCount, customOrderCount] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.measurement.count({ where: { userId: user.id } }),
    prisma.customOrder.count({ where: { userId: user.id } }),
  ])

  return (
    <ProfileOverview
      user={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        joinDate: user.createdAt.toISOString(),
        stats: {
          orders: orderCount,
          measurements: measurementCount,
          customOrders: customOrderCount,
        },
      }}
    />
  )
}
