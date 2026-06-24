"use client"

import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Edit, Grid, Loader2, MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  adminCategorySchema,
  type AdminCategoryFormValues,
  type AdminCategoryInput,
} from "@/schemas/admin-category"

type AdminCategory = {
  id: number
  name: string
  slug: string
  description: string | null
  parentId: number | null
  order: number
  isActive: boolean
  parent: { id: number; name: string } | null
  _count: { products: number; children: number }
}

interface CategoryManagementProps {
  categories: AdminCategory[]
}

const createSlug = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const emptyValues: AdminCategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  parentId: undefined,
  order: 0,
  isActive: true,
}

export default function CategoryManagement({
  categories,
}: CategoryManagementProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(
    null
  )
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(
    null
  )

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<AdminCategoryFormValues, unknown, AdminCategoryInput>({
    resolver: zodResolver(adminCategorySchema),
    defaultValues: emptyValues,
  })

  const parentId = useWatch({ control, name: "parentId" })
  const isActive = useWatch({ control, name: "isActive" })
  const name = useWatch({ control, name: "name" })

  const availableParents = useMemo(() => {
    return categories.filter((category) => category.id !== editingCategory?.id)
  }, [categories, editingCategory?.id])

  const activeCount = categories.filter((category) => category.isActive).length
  const productCount = categories.reduce(
    (total, category) => total + category._count.products,
    0
  )

  const saveMutation = useMutation({
    mutationFn: async (data: AdminCategoryInput) => {
      const res = await fetch(
        editingCategory
          ? `/api/admin/categories/${editingCategory.id}`
          : "/api/admin/categories",
        {
          method: editingCategory ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      )
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? "Không thể lưu danh mục")
      }
      return json.data as AdminCategory
    },
    onSuccess: () => {
      toast.success(
        editingCategory ? "Đã cập nhật danh mục" : "Đã thêm danh mục"
      )
      setIsDialogOpen(false)
      setEditingCategory(null)
      reset(emptyValues)
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? "Không thể xóa danh mục")
      }
      return json
    },
    onSuccess: () => {
      toast.success("Đã xóa danh mục")
      setDeletingCategoryId(null)
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message)
      setDeletingCategoryId(null)
    },
  })

  const handleOpenCreate = () => {
    setEditingCategory(null)
    reset(emptyValues)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (category: AdminCategory) => {
    setEditingCategory(category)
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      parentId: category.parentId ?? undefined,
      order: category.order,
      isActive: category.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleGenerateSlug = () => {
    setValue("slug", createSlug(name), { shouldValidate: true })
  }

  const handleFormSubmit = (data: AdminCategoryInput) => {
    saveMutation.mutate({
      ...data,
      description: data.description || undefined,
      parentId: data.parentId,
    })
  }

  const handleDelete = (category: AdminCategory) => {
    setDeletingCategoryId(category.id)
    deleteMutation.mutate(category.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quản lý danh mục
          </h1>
          <p className="text-sm text-muted-foreground">
            Tạo, sửa, ẩn hiện và sắp xếp danh mục sản phẩm.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng danh mục
            </CardTitle>
            <div className="rounded-full bg-muted p-2">
              <Grid className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {categories.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đang hiển thị
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {activeCount}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sản phẩm đã gắn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {productCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Danh mục cha</TableHead>
                <TableHead className="text-center">Sản phẩm</TableHead>
                <TableHead className="text-center">Thứ tự</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Chưa có danh mục nào.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-semibold text-foreground">
                      <div className="space-y-1">
                        <p>{category.name}</p>
                        {category.description && (
                          <p className="max-w-xs truncate text-xs font-normal text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {category.slug}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.parent?.name ?? "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {category._count.products}
                    </TableCell>
                    <TableCell className="text-center">
                      {category.order}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={category.isActive ? "default" : "secondary"}
                      >
                        {category.isActive ? "Đang hiện" : "Tạm ẩn"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            disabled={
                              deletingCategoryId === category.id ||
                              category._count.products > 0 ||
                              category._count.children > 0
                            }
                            onClick={() => handleDelete(category)}
                          >
                            {deletingCategoryId === category.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Xóa danh mục
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
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
              </DialogTitle>
              <DialogDescription>
                Danh mục đang hiển thị sẽ được dùng trong form tạo/sửa sản phẩm.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên danh mục</Label>
                <Input
                  id="name"
                  aria-invalid={!!errors.name}
                  placeholder="Kimono & Yukata"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    aria-invalid={!!errors.slug}
                    placeholder="kimono-yukata"
                    {...register("slug")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateSlug}
                  >
                    Tạo
                  </Button>
                </div>
                {errors.slug && (
                  <p className="text-xs text-destructive">
                    {errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                className="min-h-24"
                placeholder="Mô tả ngắn về nhóm sản phẩm này"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Danh mục cha</Label>
                <Select
                  value={parentId ? String(parentId) : "none"}
                  onValueChange={(value) =>
                    setValue(
                      "parentId",
                      value === "none" ? undefined : Number(value),
                      { shouldValidate: true }
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Không có" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có</SelectItem>
                    {availableParents.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.parentId && (
                  <p className="text-xs text-destructive">
                    {errors.parentId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Thứ tự</Label>
                <Input
                  id="order"
                  type="number"
                  min="0"
                  aria-invalid={!!errors.order}
                  {...register("order", { valueAsNumber: true })}
                />
                {errors.order && (
                  <p className="text-xs text-destructive">
                    {errors.order.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <div>
                <Label>Hiển thị danh mục</Label>
                <p className="text-xs text-muted-foreground">
                  Tắt đi nếu muốn tạm ẩn danh mục khỏi form sản phẩm.
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
                {editingCategory ? "Cập nhật" : "Thêm danh mục"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
