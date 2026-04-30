"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, ChevronDown, Search } from "lucide-react"
import { sellerNavItems } from "./seller-data"

export function SellerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#f3faf8] text-slate-800">
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between bg-gradient-to-r from-[#229b8e] via-[#2ca99c] to-[#21a08f] px-5 text-white shadow-lg shadow-teal-900/10 lg:px-10">
        <Link href="/seller" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black text-teal-600 shadow-md transition duration-300 group-hover:scale-110 group-hover:rotate-12">
            S
          </span>
          <span className="text-sm font-extrabold tracking-widest">
            SELLER CENTER
          </span>
        </Link>

        <div className="hidden w-[42%] items-center gap-3 rounded-full bg-white/20 px-5 py-3 text-white shadow-inner ring-1 ring-white/20 backdrop-blur md:flex">
          <Search className="h-4 w-4 opacity-80" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-white/75"
            placeholder="Tìm đơn hàng, sản phẩm, khách hàng..."
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/20 transition duration-300 hover:-translate-y-1 hover:bg-white/30 hover:shadow-lg">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-400 ring-2 ring-white" />
          </button>
          <button className="flex items-center gap-3 rounded-full bg-white/20 py-1 pr-4 pl-1 transition duration-300 hover:-translate-y-1 hover:bg-white/30 hover:shadow-lg">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-200 text-sm font-bold text-pink-700">
              S
            </span>
            <span className="hidden text-sm font-semibold sm:block">
              Seller
            </span>
            <ChevronDown className="hidden h-4 w-4 sm:block" />
          </button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-72px)] grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden border-r border-teal-100/80 bg-white px-5 py-7 lg:block">
          <div className="mb-8 flex flex-col items-center border-b border-slate-100 pb-7">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-lime-200 via-emerald-200 to-teal-300 p-2 shadow-xl shadow-teal-900/15 transition duration-500 hover:scale-105 hover:rotate-3">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-5xl"></div>
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-900">
              Tool Rental
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Verified seller account
            </p>
          </div>

          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
            Menu
          </p>
          <nav className="space-y-2">
            {sellerNavItems.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition duration-300 ${
                    active
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                      : "text-slate-500 hover:-translate-y-0.5 hover:bg-teal-50 hover:text-teal-700 hover:shadow-md"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition duration-300 group-hover:rotate-6 ${active ? "bg-white/20" : "bg-slate-100 group-hover:bg-teal-100"}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="min-w-0 overflow-y-auto px-4 py-6 md:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}
