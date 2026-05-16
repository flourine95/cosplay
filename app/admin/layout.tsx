import Sidebar from "@/components/admin/sidebar"
import Header from "@/components/admin/header"
import { redirect } from "next/navigation"
import { UserRole } from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()

  if (!user || user.role !== UserRole.ADMIN) {
    redirect(`/login?redirect=${encodeURIComponent("/admin")}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Admin Mode Indicator - Top border */}
      <div className="h-1 bg-primary" />

      {/* Header */}
      <Header />

      {/* Content with Sidebar */}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
