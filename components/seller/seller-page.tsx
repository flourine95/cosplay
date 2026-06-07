"use client"

import type { ReactNode } from "react"
import { CalendarSectionNew } from "./section/calendar-section"
import { DashboardSectionNew } from "./section/dashboard-section"
import { OrdersSectionNew } from "./section/orders-section"
import { ProductsSectionNew } from "./section/products-section"
import { RevenueSectionNew } from "./section/revenue-section"
import { StatisticsSectionNew } from "./section/statistics-section"
import { TailoringSectionNew } from "./section/tailoring-section"

type SellerPageProps = {
  title: ReactNode
  description: string
  type:
    | "dashboard"
    | "products"
    | "orders"
    | "quotes"
    | "tailoring"
    | "calendar"
    | "revenue"
    | "statistics"
}

export function SellerPage({ title, description, type }: SellerPageProps) {
  return (
    <div className="mx-auto max-w-[1280px] space-y-7">
      <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-primary/30">
        <div className="relative border-b border-slate-100 bg-gradient-to-r from-white via-primary/10 to-secondary/10 p-6 md:p-8">
          <div className="absolute top-8 right-8 hidden h-24 w-24 rounded-full bg-primary/20 blur-2xl md:block" />

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-primary/20 px-4 py-1.5 text-xs font-black tracking-wider text-primary uppercase">
                Seller Center
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                {description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {type === "dashboard" && <DashboardSectionNew />}
      {type === "products" && <ProductsSectionNew />}
      {type === "orders" && <OrdersSectionNew />}
      {type === "tailoring" && <TailoringSectionNew />}
      {type === "calendar" && <CalendarSectionNew />}
      {type === "revenue" && <RevenueSectionNew />}
      {type === "statistics" && <StatisticsSectionNew />}
    </div>
  )
}

// UI helpers moved to components/seller/seller-ui.tsx
