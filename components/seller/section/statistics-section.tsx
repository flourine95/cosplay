import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, TrendingUp, Clock, Users, ThumbsUp, Package } from "lucide-react"

const topProducts = [
  {
    name: "Đầm công chúa Dạ Hội",
    rented: 45,
    revenue: "5.4M",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop",
  },
  {
    name: "Set Hầu gái phong cách Nhật",
    rented: 38,
    revenue: "3.4M",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop",
  },
  {
    name: "Áo Cosplay Chiến Binh",
    rented: 28,
    revenue: "33.6M",
    rating: 5.0,
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop",
  },
]

const topCustomers = [
  {
    name: "Nguyễn Minh Anh",
    orders: 12,
    spent: "4.2M",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
  },
  {
    name: "Trần Hữu Khang",
    orders: 8,
    spent: "3.8M",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    name: "Lê Bảo Ngọc",
    orders: 7,
    spent: "2.9M",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  },
  {
    name: "Hoàng Nam",
    orders: 6,
    spent: "2.5M",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  },
]

const recentReviews = [
  {
    id: 1,
    customer: "Nguyễn Lan",
    product: "Áo Cosplay Venti",
    rating: 5,
    comment: "Chất lượng tuyệt vời, đúng như mô tả. Shop tư vấn nhiệt tình!",
    time: "2 giờ trước",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
  {
    id: 2,
    customer: "Trần Quốc Huy",
    product: "Đầm công chúa",
    rating: 5,
    comment: "Váy rất đẹp, vừa vặn. Sẽ ủng hộ shop lần sau.",
    time: "5 giờ trước",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    id: 3,
    customer: "Phạm Thu Hà",
    product: "Set Hầu gái",
    rating: 4,
    comment: "Đẹp nhưng giao hơi chậm. Nhìn chung ok.",
    time: "1 ngày trước",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  },
]

export function StatisticsSectionNew() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đánh giá trung bình
            </CardTitle>
            <div className="rounded-full bg-muted p-2">
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">4.8</div>
            <p className="mt-1 text-xs text-muted-foreground">
              từ 156 đánh giá
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tỉ lệ hoàn thành
            </CardTitle>
            <div className="rounded-full bg-muted p-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">98%</div>
            <Badge variant="secondary" className="mt-2">
              Xuất sắc
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Thời gian phản hồi
            </CardTitle>
            <div className="rounded-full bg-muted p-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">18 phút</div>
            <p className="mt-1 text-xs text-muted-foreground">Trung bình</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Khách quay lại
            </CardTitle>
            <div className="rounded-full bg-muted p-2">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">64%</div>
            <Badge variant="secondary" className="mt-2">
              +8% tháng này
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-2">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle>Sản phẩm bán chạy</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Top 3 sản phẩm có doanh thu cao nhất
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 rounded-lg border border-border/60 p-4 transition-all hover:border-primary/30 hover:bg-muted/30"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      idx === 0
                        ? "bg-primary/10 text-primary"
                        : idx === 1
                          ? "bg-muted text-muted-foreground"
                          : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {product.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.rented} lượt
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span className="text-xs font-medium">
                          {product.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-purple-500/10 p-2">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <CardTitle>Khách hàng thân thiết</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Top 4 khách hàng chi tiêu nhiều nhất
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 rounded-lg border border-border/60 p-4 transition-all hover:border-primary/30 hover:bg-muted/30"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      idx === 0
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={customer.avatar} />
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {customer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {customer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customer.orders} đơn hàng
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{customer.spent}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <ThumbsUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>Đánh giá gần đây</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Phản hồi mới nhất từ khách hàng
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-border/60 p-4 transition-all hover:border-primary/30 hover:bg-muted/30"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.avatar} />
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {review.customer.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {review.customer}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {review.product}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-primary text-primary"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-foreground">
                      {review.comment}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {review.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
