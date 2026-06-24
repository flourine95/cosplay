import { AlertCircle, Clock, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type AdminOrderRow = {
  id: string
  customer: string
  seller: string
  type: "Mua hàng" | "Đặt may" | "Thuê đồ"
  item: string
  amount: number
  status: string
  createdAt: Date
  deadline?: Date | null
}

interface OrderManagementProps {
  orders: AdminOrderRow[]
}

const formatCurrency = (value: number): string =>
  `${value.toLocaleString("vi-VN")}đ`

const formatDate = (value: Date): string =>
  new Intl.DateTimeFormat("vi-VN").format(value)

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  if (["CANCELLED", "REFUNDED", "OVERDUE", "REJECTED"].includes(status)) {
    return "destructive"
  }
  if (["COMPLETED", "DELIVERED", "RETURNED"].includes(status)) {
    return "default"
  }
  if (["PENDING", "SUBMITTED", "DRAFT"].includes(status)) {
    return "secondary"
  }
  return "outline"
}

const statusLabels: Record<string, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
  DRAFT: "Nháp",
  SUBMITTED: "Đã gửi yêu cầu",
  QUOTED: "Đã báo giá",
  QUOTE_ACCEPTED: "Đã nhận báo giá",
  DEPOSIT_PAID: "Đã đặt cọc",
  IN_PROGRESS: "Đang thực hiện",
  REVISION_REQUESTED: "Yêu cầu chỉnh sửa",
  READY: "Sẵn sàng bàn giao",
  READY_FOR_PICKUP: "Sẵn sàng nhận đồ",
  RENTED: "Đang thuê",
  RETURNED: "Đã trả đồ",
  DEPOSIT_REFUNDED: "Đã hoàn cọc",
  OVERDUE: "Quá hạn",
}

export default function OrderManagement({ orders }: OrderManagementProps) {
  const activeCount = orders.filter(
    (order) =>
      !["COMPLETED", "CANCELLED", "REFUNDED", "RETURNED"].includes(order.status)
  ).length
  const overdueCount = orders.filter(
    (order) => order.status === "OVERDUE"
  ).length
  const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0)

  const stats = [
    {
      label: "Tổng đơn hàng",
      value: orders.length,
      icon: ShoppingCart,
    },
    { label: "Đang xử lý", value: activeCount, icon: Clock },
    { label: "Quá hạn", value: overdueCount, icon: AlertCircle },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý đơn hàng</h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi đơn mua, đơn đặt may và đơn thuê đồ cosplay.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className="rounded-full bg-muted p-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Tổng giá trị đơn: {formatCurrency(totalAmount)}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Sản phẩm/Yêu cầu</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Chưa có đơn hàng nào.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={`${order.type}-${order.id}`}>
                    <TableCell className="font-semibold text-foreground">
                      {order.id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{order.type}</Badge>
                    </TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.seller}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {order.item}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {formatCurrency(order.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>
                        {statusLabels[order.status] ?? order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
