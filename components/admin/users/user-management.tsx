"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Ban,
  Loader2,
  MoreHorizontal,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { UserRole, UserStatus } from "@/app/generated/prisma/enums"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  DropdownMenuSeparator,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  AdminUserCreateInput,
  AdminUserUpdateInput,
} from "@/schemas/admin-user"
import {
  adminUserCreateSchema,
  adminUserUpdateSchema,
} from "@/schemas/admin-user"

const EMPTY_USERS: AdminUser[] = []

type AdminUser = {
  id: number
  name: string
  email: string
  phone: string | null
  role: UserRole
  status: UserStatus
  orders: number
  products: number
  spent: number
  createdAt: string
  lastLoginAt: string | null
}

type UsersResponse = {
  data: {
    users: AdminUser[]
    stats: {
      total: number
      newThisMonth: number
      suspended: number
    }
  }
}

type UserDialogMode = "create" | "edit"

const isUsersResponse = (value: unknown): value is UsersResponse => {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    typeof (value as UsersResponse).data === "object"
  )
}

const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Admin",
  [UserRole.SELLER]: "Seller",
  [UserRole.CUSTOMER]: "Customer",
}

const statusLabels: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: "Đang hoạt động",
  [UserStatus.INACTIVE]: "Không hoạt động",
  [UserStatus.SUSPENDED]: "Bị khóa",
  [UserStatus.PENDING_VERIFICATION]: "Chờ xác minh",
}

const formatCurrency = (value: number): string => {
  return `${value.toLocaleString("vi-VN")}đ`
}

const formatDate = (value: string): string => {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value))
}

const emptyCreateForm: AdminUserCreateInput = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: UserRole.CUSTOMER,
  status: UserStatus.ACTIVE,
}

const getUserPayload = (
  form: AdminUserCreateInput,
  mode: UserDialogMode
): AdminUserCreateInput | AdminUserUpdateInput => {
  if (mode === "create") return form

  return {
    name: form.name,
    email: form.email,
    phone: form.phone,
    role: form.role,
    status: form.status,
  }
}

export default function UserManagement() {
  const queryClient = useQueryClient()
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [dialogMode, setDialogMode] = useState<UserDialogMode>("create")
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState<AdminUserCreateInput>(emptyCreateForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null)

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users")
      const json = (await res.json()) as unknown
      if (!res.ok || !isUsersResponse(json)) {
        const message =
          typeof json === "object" &&
          json !== null &&
          "error" in json &&
          typeof json.error === "string"
            ? json.error
            : "Không thể tải danh sách người dùng"
        throw new Error(message)
      }
      return json.data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = getUserPayload(form, dialogMode)
      const url =
        dialogMode === "edit" && editingUserId
          ? `/api/admin/users/${editingUserId}`
          : "/api/admin/users"
      const res = await fetch(url, {
        method: dialogMode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Không thể lưu người dùng")
      return json.data as AdminUser
    },
    onSuccess: () => {
      toast.success(
        dialogMode === "edit" ? "Đã cập nhật người dùng" : "Đã thêm người dùng"
      )
      setIsDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: (error) => toast.error(error.message),
  })

  const statusMutation = useMutation({
    mutationFn: async ({
      user,
      status,
    }: {
      user: AdminUser
      status: UserStatus
    }) => {
      const payload: AdminUserUpdateInput = {
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        role: user.role,
        status,
      }
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Không thể đổi trạng thái")
      return json.data as AdminUser
    },
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái")
      setStatusTarget(null)
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: (error) => toast.error(error.message),
  })

  const usersData = usersQuery.data
  const usersList = usersData?.users ?? EMPTY_USERS

  const filteredUsers = useMemo(() => {
    return usersList.filter((user) => {
      const roleMatched = filterRole === "all" || user.role === filterRole
      const statusMatched =
        filterStatus === "all" || user.status === filterStatus
      return roleMatched && statusMatched
    })
  }, [filterRole, filterStatus, usersList])

  const stats = [
    {
      label: "Tổng user",
      value: usersData?.stats.total ?? 0,
      icon: Users,
    },
    {
      label: "User mới tháng này",
      value: usersData?.stats.newThisMonth ?? 0,
      icon: TrendingUp,
    },
    {
      label: "Bị khóa",
      value: usersData?.stats.suspended ?? 0,
      icon: Ban,
    },
  ]

  const handleOpenCreate = () => {
    setDialogMode("create")
    setEditingUserId(null)
    setForm(emptyCreateForm)
    setFormError(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (user: AdminUser) => {
    setDialogMode("edit")
    setEditingUserId(user.id)
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      phone: user.phone ?? "",
      role: user.role,
      status: user.status,
    })
    setFormError(null)
    setIsDialogOpen(true)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const payload = getUserPayload(form, dialogMode)
    const parsed =
      dialogMode === "create"
        ? adminUserCreateSchema.safeParse(payload)
        : adminUserUpdateSchema.safeParse(payload)

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Dữ liệu người dùng không hợp lệ"
      setFormError(message)
      toast.error(message)
      return
    }

    saveMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quản lý Người dùng
          </h1>
          <p className="text-sm text-muted-foreground">
            Xem danh sách, phân quyền và trạng thái hoạt động.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <UserPlus className="h-4 w-4" />
          Thêm user mới
        </Button>
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

      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc theo vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value={UserRole.CUSTOMER}>Customer</SelectItem>
            <SelectItem value={UserRole.SELLER}>Seller</SelectItem>
            <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[190px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {Object.values(UserStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">
          {filteredUsers.length} users
        </span>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Giao dịch</TableHead>
                <TableHead>Tổng chi</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersQuery.isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}

              {usersQuery.isError && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-destructive"
                  >
                    {usersQuery.error.message}
                  </TableCell>
                </TableRow>
              )}

              {!usersQuery.isLoading &&
                !usersQuery.isError &&
                filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Không có người dùng phù hợp.
                    </TableCell>
                  </TableRow>
                )}

              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-foreground">
                        {user.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{roleLabels[user.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === UserStatus.SUSPENDED
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {statusLabels[user.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{user.orders}</TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {formatCurrency(user.spent)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={
                            user.status === UserStatus.SUSPENDED
                              ? ""
                              : "text-destructive focus:text-destructive"
                          }
                          onClick={() => setStatusTarget(user)}
                        >
                          {user.status === UserStatus.SUSPENDED
                            ? "Mở khóa tài khoản"
                            : "Khóa tài khoản"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "edit" ? "Chỉnh sửa user" : "Thêm user mới"}
              </DialogTitle>
            </DialogHeader>

            {formError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </div>

            {dialogMode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Vai trò</Label>
                <Select
                  value={form.role}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      role: value as UserRole,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UserRole).map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleLabels[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      status: value as UserStatus,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UserStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusLabels[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!statusTarget}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusTarget?.status === UserStatus.SUSPENDED
                ? "Mở khóa tài khoản?"
                : "Khóa tài khoản?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusTarget?.status === UserStatus.SUSPENDED
                ? `Người dùng ${statusTarget.name} sẽ có thể đăng nhập lại.`
                : `Người dùng ${statusTarget?.name ?? ""} sẽ bị đăng xuất khỏi mọi phiên và không thể đăng nhập.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant={
                statusTarget?.status === UserStatus.SUSPENDED
                  ? "default"
                  : "destructive"
              }
              disabled={statusMutation.isPending}
              onClick={() => {
                if (!statusTarget) return
                statusMutation.mutate({
                  user: statusTarget,
                  status:
                    statusTarget.status === UserStatus.SUSPENDED
                      ? UserStatus.ACTIVE
                      : UserStatus.SUSPENDED,
                })
              }}
            >
              {statusMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
