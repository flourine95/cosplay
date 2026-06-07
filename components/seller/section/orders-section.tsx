"use client"

import { useMemo, useState } from "react"
import { MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { sellerOrders, orderDetails } from "../seller-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function OrdersSectionNew() {
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = [...sellerOrders]
    if (typeFilter !== "all") {
      result = result.filter((o) =>
        typeFilter === "sale"
          ? o.orderType === "Bán đứt"
          : o.orderType === "Thuê"
      )
    }
    if (statusFilter) {
      result = result.filter((o) => o.status === statusFilter)
    }
    return result
  }, [typeFilter, statusFilter])

  const uniqueStatuses = Array.from(new Set(filtered.map((o) => o.status)))

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Đơn mua & Thuê</CardTitle>
        <p className="text-sm text-muted-foreground">
          Quản lý giao dịch, kiểm soát ngày trả đồ và xử lý tiền cọc
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabs */}
        <Tabs value={typeFilter} onValueChange={setTypeFilter}>
          <TabsList>
            <TabsTrigger value="all">
              Tất cả ({sellerOrders.length})
            </TabsTrigger>
            <TabsTrigger value="sale">
              Bán đứt (
              {sellerOrders.filter((o) => o.orderType === "Bán đứt").length})
            </TabsTrigger>
            <TabsTrigger value="rental">
              Thuê ({sellerOrders.filter((o) => o.orderType === "Thuê").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Status Filters */}
        {uniqueStatuses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(null)}
            >
              Tất cả
            </Button>
            {uniqueStatuses.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        )}

        {/* Orders Table */}
        <div className="rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Đơn hàng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Ngày thuê/trả</TableHead>
                <TableHead className="text-right">Cọc</TableHead>
                <TableHead className="text-right">Tổng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <p className="text-sm text-muted-foreground">
                      Không tìm thấy đơn hàng nào
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => (
                  <Collapsible
                    key={order.id}
                    open={expandedOrderId === order.id}
                    onOpenChange={(open) =>
                      setExpandedOrderId(open ? order.id : null)
                    }
                    asChild
                  >
                    <>
                      <TableRow>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{order.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.customer} · {order.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{order.orderType}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{order.rentalDates}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm text-muted-foreground">
                            {order.deposit}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold">{order.total}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                {expandedOrderId === order.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem>In hóa đơn</DropdownMenuItem>
                                <DropdownMenuItem>
                                  Liên hệ khách
                                </DropdownMenuItem>
                                {order.orderType === "Thuê" &&
                                  order.status === "Đang thuê" && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>
                                        Nhận lại đồ
                                      </DropdownMenuItem>
                                    </>
                                  )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <CollapsibleContent>
                            <div className="border-t border-border/60 bg-muted/30 p-4">
                              <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase">
                                Sản phẩm
                              </p>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {orderDetails.map((detail, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-3"
                                  >
                                    <div>
                                      <p className="font-medium">
                                        {detail.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {detail.desc}
                                      </p>
                                    </div>
                                    <Badge variant="secondary">
                                      {detail.qty}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </TableCell>
                      </TableRow>
                    </>
                  </Collapsible>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
