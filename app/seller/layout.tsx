import { redirect } from "next/navigation"

import { UserRole } from "@/app/generated/prisma/enums"
import { SellerShellNew } from "@/components/seller/seller-shell"
import { getSession } from "@/lib/auth"

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()

  if (!user || user.role !== UserRole.SELLER) {
    redirect(`/login?redirect=${encodeURIComponent("/seller")}`)
  }

  return <SellerShellNew>{children}</SellerShellNew>
}
