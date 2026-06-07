import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

import {
  FaUser,
  FaUserAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaVenusMars,
} from "react-icons/fa"

type User = {
  username?: string
  name: string
  email: string
  avatarUrl?: string
  phone?: string
  gender?: string
  status?: string
  address?: string
}

export default function ProfileInfo({ user }: { user: User }) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(-2)
    .join("")
  return (
    <Card className="border-border bg-card/90">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center space-x-4">
          <Avatar className="size-10">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h2 className="text-lg font-medium">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-md border border-border bg-secondary/30 p-4">
            <div className="flex items-center gap-2">
              <FaUser className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">
                Tên đăng nhập
              </h3>
            </div>
            <p className="mt-3">{user.username ?? "Chưa cập nhật"}</p>
          </div>

          <div className="rounded-md border border-border bg-secondary/30 p-4">
            <div className="flex items-center gap-2">
              <FaUserAlt className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">
                Họ và tên
              </h3>
            </div>
            <p className="mt-3">{user.name ?? "Chưa cập nhật"}</p>
          </div>

          <div className="rounded-md border border-border bg-secondary/30 p-4">
            <div className="flex items-center gap-2">
              <FaEnvelope className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">
                Email
              </h3>
            </div>
            <p className="mt-3">{user.email ?? "Chưa cập nhật"}</p>
          </div>

          <div className="rounded-md border border-border bg-secondary/30 p-4">
            <div className="flex items-center gap-2">
              <FaPhoneAlt className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">
                Số điện thoại
              </h3>
            </div>
            <p className="mt-3">{user.phone ?? "Chưa cập nhật"}</p>
          </div>

          <div className="rounded-md border border-border bg-secondary/30 p-4">
            <div className="flex items-center gap-2">
              <FaVenusMars className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">
                Giới tính
              </h3>
            </div>
            <p className="mt-3">{user.gender ?? "Chưa cập nhật"}</p>
          </div>

          <div className="rounded-md border border-border bg-secondary/30 p-4">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">
                Trạng thái
              </h3>
            </div>
            <p className="mt-3">{user.status ?? "Chưa cập nhật"}</p>
          </div>

          <div className="rounded-md border border-border bg-secondary/30 p-4 sm:col-span-2 md:col-span-3">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">
                Địa chỉ
              </h3>
            </div>
            <p className="mt-3">{user.address ?? "Chưa cập nhật"}</p>
          </div>

          <div className="mt-4 rounded-md border border-transparent p-4 sm:col-span-2 md:col-span-3">
            <Link
              href="/profile/edit"
              className="inline-block rounded-md bg-primary px-4 py-2 text-center text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Chỉnh sửa thông tin
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
