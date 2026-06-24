"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import {
  DollarSign,
  Edit,
  Loader2,
  MoreHorizontal,
  Percent,
  Plus,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  adminFeeSchema,
  type AdminFeeFormValues,
  type AdminFeeInput,
} from "@/schemas/admin-fee"

type FeeRow = {
  id: number
  name: string
  description: string | null
  feeType: string
  feeValue: number
  isActive: boolean
  updatedAt: Date
}

interface FeeManagementProps {
  fees: FeeRow[]
  totalCollectedFee: number
}

const emptyValues: AdminFeeFormValues = {
  name: "",
  description: "",
  feeType: "percentage",
  feeValue: 0,
  isActive: true,
}

const formatCurrency = (value: number): string =>
  `${value.toLocaleString("vi-VN")}đ`

const formatDate = (value: Date): string =>
  new Intl.DateTimeFormat("vi-VN").format(value)

const formatFeeValue = (fee: FeeRow): string => {
  if (fee.feeType === "percentage") return `${fee.feeValue}%`
  return formatCurrency(fee.feeValue)
}

export default function FeeManagement({
  fees,
  totalCollectedFee,
}: FeeManagementProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<FeeRow | null>(null)
  const [deletingFeeId, setDeletingFeeId] = useState<number | null>(null)

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<AdminFeeFormValues, unknown, AdminFeeInput>({
    resolver: zodResolver(adminFeeSchema),
    defaultValues: emptyValues,
  })

  const feeType = useWatch({ control, name: "feeType" })
  const isActive = useWatch({ control, name: "isActive" })
  const activeFees = fees.filter((fee) => fee.isActive)
  const mainFee = activeFees.find((fee) => fee.feeType === "percentage")

  const saveMutation = useMutation({
    mutationFn: async (data: AdminFeeInput) => {
      const res = await fetch(
        editingFee ? `/api/admin/fees/${editingFee.id}` : "/api/admin/fees",
        {
          method: editingFee ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Không thể lưu phí")
      return json.data as FeeRow
    },
    onSuccess: () => {
      toast.success(editingFee ? "Đã cập nhật phí" : "Đã thêm phí")
      setIsDialogOpen(false)
      setEditingFee(null)
      reset(emptyValues)
      router.refresh()
    },
    onError: (error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (feeId: number) => {
      const res = await fetch(`/api/admin/fees/${feeId}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Không thể xóa phí")
      return json
    },
    onSuccess: () => {
      toast.success("Đã xóa phí")
      setDeletingFeeId(null)
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message)
      setDeletingFeeId(null)
    },
  })

  const handleOpenCreate = () => {
    setEditingFee(null)
    reset(emptyValues)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (fee: FeeRow) => {
    setEditingFee(fee)
    reset({
      name: fee.name,
      description: fee.description ?? "",
      feeType: fee.feeType === "fixed" ? "fixed" : "percentage",
      feeValue: fee.feeValue,
      isActive: fee.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleFormSubmit = (data: AdminFeeInput) => {
    saveMutation.mutate({
      ...data,
      description: data.description || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quản lý phí nền tảng
          </h1>
          <p className="text-sm text-muted-foreground">
            Cấu hình phần trăm hoặc số tiền phí áp dụng cho giao dịch.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Thêm phí
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Phí chính đang áp dụng
            </CardTitle>
            <div className="rounded-full bg-muted p-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {mainFee ? formatFeeValue(mainFee) : "Chưa có"}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng phí ước tính đã thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {formatCurrency(totalCollectedFee)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cấu hình đang bật
            </CardTitle>
            <div className="rounded-full bg-muted p-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {activeFees.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Cấu hình phí</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phí</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Loại phí</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Chưa có cấu hình phí.
                  </TableCell>
                </TableRow>
              ) : (
                fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-mono font-semibold">
                      {fee.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {fee.description ?? "-"}
                    </TableCell>
                    <TableCell>
                      {fee.feeType === "percentage" ? "Phần trăm" : "Cố định"}
                    </TableCell>
                    <TableCell className="text-lg font-bold text-primary">
                      {formatFeeValue(fee)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={fee.isActive ? "default" : "secondary"}>
                        {fee.isActive ? "Đang áp dụng" : "Tạm tắt"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(fee.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(fee)}>
                            <Edit className="h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            disabled={deletingFeeId === fee.id}
                            onClick={() => {
                              setDeletingFeeId(fee.id)
                              deleteMutation.mutate(fee.id)
                            }}
                          >
                            {deletingFeeId === fee.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Xóa phí
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {editingFee ? "Chỉnh sửa phí" : "Thêm phí nền tảng"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Mã phí</Label>
                <Input
                  id="name"
                  placeholder="platform_commission"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Loại phí</Label>
                <Select
                  value={feeType}
                  onValueChange={(value) =>
                    setValue("feeType", value as "percentage" | "fixed", {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Phần trăm</SelectItem>
                    <SelectItem value="fixed">Cố định</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                className="min-h-20"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeValue">
                {feeType === "percentage" ? "Tỷ lệ phí (%)" : "Số tiền phí"}
              </Label>
              <Input
                id="feeValue"
                type="number"
                step="0.01"
                min="0"
                aria-invalid={!!errors.feeValue}
                {...register("feeValue", { valueAsNumber: true })}
              />
              {errors.feeValue && (
                <p className="text-xs text-destructive">
                  {errors.feeValue.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <div>
                <Label>Áp dụng phí</Label>
                <p className="text-xs text-muted-foreground">
                  Tắt nếu muốn giữ lịch sử nhưng không áp dụng trong tính toán.
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(checked) =>
                  setValue("isActive", checked, { shouldValidate: true })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Lưu phí
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
