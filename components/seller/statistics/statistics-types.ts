export type StatisticsData = {
  kpis: {
    averageRating: number
    reviewCount: number
    completionRate: number
    responseMinutes: number
    returnCustomerRate: number
  }
  topProducts: {
    id: number
    name: string
    image: string | null
    orders: number
    revenue: number
    rating: number
  }[]
  topCustomers: {
    name: string
    avatar: string | null
    orders: number
    spent: number
  }[]
  recentReviews: {
    id: number
    customer: string
    avatar: string | null
    product: string
    rating: number
    comment: string
    createdAt: string
  }[]
}

export type StatisticsResponse = {
  data: StatisticsData
}
