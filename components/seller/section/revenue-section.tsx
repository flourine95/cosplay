import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
} from "lucide-react"

const revenueData = [
  { month: "Tháng 1/2026", revenue: "45.2M", orders: 28, growth: "+12%" },
  { month: "Tháng 2/2026", revenue: "52.8M", orders: 34, growth: "+16%" },
  { month: "Tháng 3/2026", revenue: "61.5M", orders: 42, growth: "+18%" },
  { month: "Tháng 4/2026", revenue: "58.3M", orders: 38, growth: "-5%" },
]

const transactions = [
  {
    id: "TXN-001",
    type: "in",
    description: "Thanh toán đơn #DH-1024",
    customer: "Nguyễn Minh Anh",
    amount: "+360.000đ",
    date: "05/05/2026 14:30",
    status: "Thành công",
  },
  {
    id: "TXN-002",
    type: "in",
    description: "Thanh toán đơn #DH-1029",
    customer: "Trần Hữu Khang",
    amount: "+250.000đ",
    date: "05/05/2026 10:15",
    status: "Thành công",
  },
  {
    id: "TXN-003",
    type: "out",
    description: "Hoàn cọc đơn #DH-1028",
    customer: "Hoàng Nam",
    amount: "-300.000đ",
    date: "04/05/2026 16:45",
    status: "Thành công",
  },
  {
    id: "TXN-004",
    type: "withdraw",
    description: "Rút tiền về Vietcombank",
    customer: "Chuyển khoản",
    amount: "-10.000.000đ",
    date: "03/05/2026 09:00",
    status: "Đang xử lý",
  },
  {
    id: "TXN-005",
    type: "in",
    description: "Cọc đơn đặt may #TAIL-001",
    customer: "Nguyễn Lan",
    amount: "+500.000đ",
    date: "02/05/2026 11:20",
    status: "Thành công",
  },
  {
    id: "TXN-006",
    type: "penalty",
    description: "Trừ cọc (Hư hỏng nhẹ) #DH-1025",
    customer: "Lê Văn Tú",
    amount: "+50.000đ",
    date: "01/05/2026 15:30",
    status: "Thành công",
  },
]

const revenueByModel = [
  {
    model: "Bán đứt",
    percent: 45,
    amount: "65.610.000đ",
    orders: 124,
    color: "bg-emerald-500",
    textColor: "text-emerald-700",
    bgLight: "bg-emerald-500/10",
  },
  {
    model: "Cho thuê",
    percent: 35,
    amount: "51.030.000đ",
    orders: 89,
    color: "bg-sky-500",
    textColor: "text-sky-700",
    bgLight: "bg-sky-500/10",
  },
  {
    model: "Đặt may đo",
    percent: 20,
    amount: "29.160.000đ",
    orders: 12,
    color: "bg-purple-500",
    textColor: "text-purple-700",
    bgLight: "bg-purple-500/10",
  },
]

export function RevenueSectionNew() {
  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <p className="text-sm font-medium text-muted-foreground">
              Doanh thu tháng này
            </p>
            <div className="rounded-full bg-muted p-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">128.5M</p>
            <Badge variant="secondary" className="mt-2">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12% so với tháng trước
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <p className="text-sm font-medium text-muted-foreground">
              Tiền cọc đang giữ
            </p>
            <div className="rounded-full bg-muted p-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">24.8M</p>
            <p className="mt-2 text-sm text-muted-foreground">42 đơn thuê</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <p className="text-sm font-medium text-muted-foreground">
              Chờ thanh toán
            </p>
            <div className="rounded-full bg-muted p-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">8.2M</p>
            <p className="mt-2 text-sm text-muted-foreground">12 đơn hàng</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Model */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Doanh thu theo mô hình</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Phân bổ doanh thu từ các loại hình kinh doanh
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueByModel.map((item) => (
              <div key={item.model} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.model}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.orders} đơn hàng
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">
                      {item.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.percent}%
                    </p>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dõi xu hướng doanh thu 4 tháng gần nhất
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tháng</TableHead>
                    <TableHead className="text-right">Doanh thu</TableHead>
                    <TableHead className="text-right">Đơn hàng</TableHead>
                    <TableHead className="text-right">Tăng trưởng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueData.map((row) => {
                    const isPositive = row.growth.startsWith("+")
                    return (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium">
                          {row.month}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-primary">
                            {row.revenue}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{row.orders} đơn</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="secondary"
                            className={
                              isPositive
                                ? "bg-emerald-500/10 text-emerald-700"
                                : "bg-red-500/10 text-red-700"
                            }
                          >
                            {isPositive ? (
                              <TrendingUp className="mr-1 h-3 w-3" />
                            ) : (
                              <TrendingDown className="mr-1 h-3 w-3" />
                            )}
                            {row.growth}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Quản lý tài chính</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Thao tác nhanh với tài khoản
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" size="lg">
              <Wallet className="mr-3 h-5 w-5" />
              <div className="flex-1 text-left">
                <p className="font-semibold">Rút tiền</p>
                <p className="text-xs opacity-90">
                  Số dư khả dụng: 45.200.000đ
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              size="lg"
            >
              <CreditCard className="mr-3 h-5 w-5" />
              <div className="flex-1 text-left">
                <p className="font-semibold">Liên kết ngân hàng</p>
                <p className="text-xs text-muted-foreground">
                  Quản lý tài khoản nhận tiền
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              size="lg"
            >
              <DollarSign className="mr-3 h-5 w-5" />
              <div className="flex-1 text-left">
                <p className="font-semibold">Lịch sử giao dịch</p>
                <p className="text-xs text-muted-foreground">
                  Xem chi tiết thu chi
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Giao dịch gần đây</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {transactions.length} giao dịch trong 7 ngày qua
              </p>
            </div>
            <Button variant="outline" size="sm">
              Xem tất cả
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã GD</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => {
                  const getIcon = () => {
                    if (txn.type === "in") return ArrowDownRight
                    if (txn.type === "out") return ArrowUpRight
                    if (txn.type === "withdraw") return Wallet
                    return DollarSign
                  }
                  const Icon = getIcon()
                  const isPositive = txn.type === "in" || txn.type === "penalty"

                  return (
                    <TableRow key={txn.id}>
                      <TableCell className="font-medium">{txn.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`rounded-full p-1.5 ${
                              isPositive ? "bg-emerald-500/10" : "bg-red-500/10"
                            }`}
                          >
                            <Icon
                              className={`h-3 w-3 ${
                                isPositive ? "text-emerald-600" : "text-red-600"
                              }`}
                            />
                          </div>
                          <span className="text-sm">{txn.description}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {txn.customer}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-semibold ${
                            isPositive ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {txn.amount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            txn.status === "Thành công"
                              ? "bg-emerald-500/10 text-emerald-700"
                              : "bg-amber-500/10 text-amber-700"
                          }
                        >
                          {txn.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {txn.date}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
