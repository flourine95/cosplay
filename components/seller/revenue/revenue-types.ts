export type RevenueData = {
  summary: {
    monthRevenue: number
    totalRevenue: number
    heldDeposits: number
    pendingPayments: number
    availableBalance: number
  }
  revenueByModel: {
    model: string
    amount: number
    orders: number
    percent: number
  }[]
  monthlyRevenue: { month: string; revenue: number; orders: number }[]
  transactions: {
    id: string
    description: string
    customer: string
    amount: number
    date: string
    status: string
  }[]
}

export type RevenueResponse = {
  data: RevenueData
}
