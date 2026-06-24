import FeeManagement from "@/components/admin/fees/fee-management"
import { prisma } from "@/lib/prisma"

export default async function FeesPage() {
  const [fees, orders] = await Promise.all([
    prisma.systemFee.findMany({
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.order.findMany({
      select: { total: true },
    }),
  ])

  const activePercentageFee = fees.find(
    (fee) => fee.isActive && fee.feeType === "percentage"
  )
  const feeRate = activePercentageFee
    ? Number(activePercentageFee.feeValue) / 100
    : 0
  const totalCollectedFee = orders.reduce(
    (sum, order) => sum + Number(order.total) * feeRate,
    0
  )

  return (
    <FeeManagement
      fees={fees.map((fee) => ({
        id: fee.id,
        name: fee.name,
        description: fee.description,
        feeType: fee.feeType,
        feeValue: Number(fee.feeValue),
        isActive: fee.isActive,
        updatedAt: fee.updatedAt,
      }))}
      totalCollectedFee={totalCollectedFee}
    />
  )
}
