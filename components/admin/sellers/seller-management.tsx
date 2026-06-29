import { AlertCircle, CheckCircle, Star, Store, TrendingUp } from "lucide-react"
import { SellerStatus } from "@/app/generated/prisma/enums"
import {
  SellerApprovalDialog,
  type SellerApprovalProfile,
} from "@/components/admin/sellers/seller-approval-dialog"
import { SellerStatusSelect } from "@/components/admin/sellers/seller-status-select"
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

type SellerRow = {
  id: number
  name: string
  email: string
  phone: string | null
  shopName: string | null
  shopDescription: string | null
  businessLicense: string | null
  taxCode: string | null
  bankName: string | null
  bankAccount: string | null
  bankAccountName: string | null
  sellerStatus: SellerStatus | null
  sellerApprovedAt: Date | null
  sellerRating: number
  sellerTotalSales: number
  createdAt: Date
  productCount: number
  revenue: number
}

interface SellerManagementProps {
  sellers: SellerRow[]
}

const statusLabels: Record<SellerStatus, string> = {
  [SellerStatus.PENDING]: "Chờ duyệt",
  [SellerStatus.APPROVED]: "Đã duyệt",
  [SellerStatus.REJECTED]: "Từ chối",
  [SellerStatus.SUSPENDED]: "Tạm khóa",
}

const formatCurrency = (value: number): string =>
  `${value.toLocaleString("vi-VN")}đ`

const formatDate = (value: Date): string =>
  new Intl.DateTimeFormat("vi-VN").format(value)

const toApprovalProfile = (seller: SellerRow): SellerApprovalProfile => ({
  id: seller.id,
  name: seller.name,
  email: seller.email,
  phone: seller.phone,
  shopName: seller.shopName,
  shopDescription: seller.shopDescription,
  businessLicense: seller.businessLicense,
  taxCode: seller.taxCode,
  bankName: seller.bankName,
  bankAccount: seller.bankAccount,
  bankAccountName: seller.bankAccountName,
  sellerStatus: seller.sellerStatus,
  sellerApprovedAt: seller.sellerApprovedAt?.toISOString() ?? null,
  productCount: seller.productCount,
  revenue: seller.revenue,
})

export default function SellerManagement({ sellers }: SellerManagementProps) {
  const pendingCount = sellers.filter(
    (seller) => seller.sellerStatus === SellerStatus.PENDING
  ).length
  const approvedCount = sellers.filter(
    (seller) => seller.sellerStatus === SellerStatus.APPROVED
  ).length
  const rejectedCount = sellers.filter(
    (seller) => seller.sellerStatus === SellerStatus.REJECTED
  ).length
  const suspendedCount = sellers.filter(
    (seller) => seller.sellerStatus === SellerStatus.SUSPENDED
  ).length
  const totalRevenue = sellers.reduce((sum, seller) => sum + seller.revenue, 0)

  const stats = [
    { label: "Tổng seller", value: sellers.length, icon: Store },
    { label: "Đã duyệt", value: approvedCount, icon: TrendingUp },
    { label: "Chờ duyệt", value: pendingCount, icon: AlertCircle },
    {
      label: "Từ chối / tạm khóa",
      value: rejectedCount + suspendedCount,
      icon: AlertCircle,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý seller</h1>
        <p className="text-sm text-muted-foreground">
          Duyệt hồ sơ, theo dõi sản phẩm và doanh thu của từng cửa hàng.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <CardTitle>
            Tổng doanh thu seller: {formatCurrency(totalRevenue)}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cửa hàng</TableHead>
                <TableHead>Chủ shop</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead className="text-center">Sản phẩm</TableHead>
                <TableHead>Doanh thu</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead className="text-right">Hồ sơ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Chưa có seller nào.
                  </TableCell>
                </TableRow>
              ) : (
                sellers.map((seller) => (
                  <TableRow key={seller.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-semibold text-foreground">
                            {seller.shopName ?? "Chưa đặt tên shop"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            #{seller.id}
                          </p>
                        </div>
                        {seller.sellerStatus === SellerStatus.APPROVED && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {seller.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {seller.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            seller.sellerStatus === SellerStatus.SUSPENDED ||
                            seller.sellerStatus === SellerStatus.REJECTED
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {seller.sellerStatus
                            ? statusLabels[seller.sellerStatus]
                            : "Chờ duyệt"}
                        </Badge>
                        <SellerStatusSelect
                          sellerId={seller.id}
                          sellerStatus={seller.sellerStatus}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {seller.sellerRating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-semibold text-foreground">
                            {seller.sellerRating.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Chưa có
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {seller.productCount}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {formatCurrency(seller.revenue)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(seller.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <SellerApprovalDialog
                        seller={toApprovalProfile(seller)}
                      />
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
