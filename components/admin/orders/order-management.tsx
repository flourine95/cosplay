import { AlertCircle, Clock, ShoppingCart } from "lucide-react"
import Image from "next/image"
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
import { RentalRefundButton } from "./rental-refund-button"

type AdminOrderRow = {
  id: string
  customer: string
  seller: string
  type: "Mua hang" | "Dat may" | "Thue do"
  item: string
  amount: number
  deposit?: number
  refundAmount?: number
  shippingName?: string
  shippingPhone?: string
  shippingAddress?: string
  shippingCity?: string
  shippingDistrict?: string
  shippingWard?: string
  shippingNote?: string | null
  returnName?: string
  returnPhone?: string
  returnAddress?: string
  returnCity?: string
  returnDistrict?: string
  returnWard?: string
  returnAddressNote?: string | null
  pickupImages?: string[]
  returnImages?: string[]
  status: string
  createdAt: Date
  deadline?: Date | null
}

interface OrderManagementProps {
  orders: AdminOrderRow[]
}

const formatCurrency = (value: number): string =>
  `${value.toLocaleString("vi-VN")}d`

const formatDate = (value: Date): string =>
  new Intl.DateTimeFormat("vi-VN").format(value)

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  if (["CANCELLED", "REFUNDED", "OVERDUE", "REJECTED"].includes(status)) {
    return "destructive"
  }
  if (["COMPLETED", "DELIVERED"].includes(status)) {
    return "default"
  }
  if (["PENDING", "SUBMITTED", "DRAFT"].includes(status)) {
    return "secondary"
  }
  return "outline"
}

const statusLabels: Record<string, string> = {
  PENDING: "Cho xu ly",
  CONFIRMED: "Da xac nhan",
  PROCESSING: "Dang xu ly",
  SHIPPING: "Dang giao",
  DELIVERED: "Da giao",
  COMPLETED: "Hoan tat",
  CANCELLED: "Da huy",
  REFUNDED: "Da hoan tien",
  DRAFT: "Nhap",
  SUBMITTED: "Da gui yeu cau",
  QUOTED: "Da bao gia",
  QUOTE_ACCEPTED: "Da nhan bao gia",
  DEPOSIT_PAID: "Admin dang giu coc",
  IN_PROGRESS: "Dang thuc hien",
  REVISION_REQUESTED: "Yeu cau chinh sua",
  READY: "San sang ban giao",
  READY_FOR_PICKUP: "San sang nhan do",
  RENTED: "Dang thue",
  RETURNED: "Khach da bao tra do",
  DEPOSIT_REFUNDED: "Cho admin hoan coc",
  OVERDUE: "Qua han",
}

export default function OrderManagement({ orders }: OrderManagementProps) {
  const activeCount = orders.filter(
    (order) => !["COMPLETED", "CANCELLED", "REFUNDED"].includes(order.status)
  ).length
  const overdueCount = orders.filter(
    (order) => order.status === "OVERDUE"
  ).length
  const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0)

  const stats = [
    {
      label: "Tong don hang",
      value: orders.length,
      icon: ShoppingCart,
    },
    { label: "Dang xu ly", value: activeCount, icon: Clock },
    { label: "Qua han", value: overdueCount, icon: AlertCircle },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quan ly don hang</h1>
        <p className="text-sm text-muted-foreground">
          Theo doi don mua, don dat may va don thue do cosplay.
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
          <CardTitle>Tong gia tri don: {formatCurrency(totalAmount)}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ma don</TableHead>
                <TableHead>Loai</TableHead>
                <TableHead>Khach hang</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>San pham/Yeu cau</TableHead>
                <TableHead>Gia tri</TableHead>
                <TableHead>Trang thai</TableHead>
                <TableHead>Thao tac</TableHead>
                <TableHead>Ngay tao</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Chua co don hang nao.
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
                    <TableCell>
                      {order.seller}
                      {order.type === "Thue do" && order.shippingAddress && (
                        <span className="mt-1 block space-y-1 text-xs text-muted-foreground">
                          <span className="block">
                            Giao: {order.shippingName} - {order.shippingPhone},{" "}
                            {order.shippingAddress}, {order.shippingWard},{" "}
                            {order.shippingDistrict}, {order.shippingCity}
                          </span>
                          {order.returnAddress && (
                            <span className="block">
                              Tra ve: {order.returnName} - {order.returnPhone},{" "}
                              {order.returnAddress}, {order.returnWard},{" "}
                              {order.returnDistrict}, {order.returnCity}
                            </span>
                          )}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {order.item}
                      {order.type === "Thue do" && (
                        <EvidencePreview
                          pickupImages={order.pickupImages ?? []}
                          returnImages={order.returnImages ?? []}
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {formatCurrency(order.amount)}
                      {order.type === "Thue do" && order.deposit != null && (
                        <span className="mt-1 block text-xs font-normal text-muted-foreground">
                          Coc admin giu: {formatCurrency(order.deposit)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>
                        {statusLabels[order.status] ?? order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.type === "Thue do" &&
                      order.status === "DEPOSIT_REFUNDED" ? (
                        <RentalRefundButton
                          orderNumber={order.id}
                          refundAmount={order.refundAmount ?? 0}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
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

function EvidencePreview({
  pickupImages,
  returnImages,
}: {
  pickupImages: string[]
  returnImages: string[]
}) {
  const images = [
    ...pickupImages.slice(0, 2).map((url) => ({ url, label: "Nhan" })),
    ...returnImages.slice(0, 2).map((url) => ({ url, label: "Tra" })),
  ]

  if (images.length === 0) return null

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {images.map((image) => (
        <a
          key={`${image.label}-${image.url}`}
          href={image.url}
          target="_blank"
          rel="noreferrer"
          className="group relative block h-12 w-12 overflow-hidden rounded-md border border-border bg-muted"
        >
          <Image
            src={image.url}
            alt={image.label}
            fill
            className="object-cover"
          />
          <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[10px] text-white">
            {image.label}
          </span>
        </a>
      ))}
    </div>
  )
}
