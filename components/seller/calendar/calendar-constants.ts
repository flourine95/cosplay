import { RentalStatus } from "@/app/generated/prisma/enums"

export const rentalCalendarStatusClasses: Record<RentalStatus, string> = {
  [RentalStatus.PENDING]: "bg-amber-500/10 text-amber-700",
  [RentalStatus.CONFIRMED]: "bg-sky-500/10 text-sky-700",
  [RentalStatus.DEPOSIT_PAID]: "bg-sky-500/10 text-sky-700",
  [RentalStatus.READY_FOR_PICKUP]: "bg-indigo-500/10 text-indigo-700",
  [RentalStatus.RENTED]: "bg-purple-500/10 text-purple-700",
  [RentalStatus.RETURNED]: "bg-emerald-500/10 text-emerald-700",
  [RentalStatus.DEPOSIT_REFUNDED]: "bg-emerald-500/10 text-emerald-700",
  [RentalStatus.COMPLETED]: "bg-emerald-500/10 text-emerald-700",
  [RentalStatus.CANCELLED]: "bg-rose-500/10 text-rose-700",
  [RentalStatus.OVERDUE]: "bg-rose-500/10 text-rose-700",
}
