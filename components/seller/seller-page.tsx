"use client"

import { useMemo, useState } from "react"
import {
  ArrowUpDown,
  CalendarDays,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react"
import {
  rentalSchedules,
  revenueRows,
  sellerKpis,
  sellerOrders,
  sellerProducts,
  statisticRows,
  parseDateString,
} from "./seller-data"

type SellerPageProps = {
  title: string
  description: string
  type:
    | "dashboard"
    | "products"
    | "orders"
    | "quotes"
    | "calendar"
    | "revenue"
    | "statistics"
}

type SortType = "none" | "asc" | "desc"

const quoteRows = sellerOrders.map((order, index) => ({
  ...order,
  quoteCode: `BG-${String(index + 1).padStart(4, "0")}`,
  rentalDays: index % 2 === 0 ? 3 : 5,
  deposit: index % 2 === 0 ? "500.000đ" : "1.000.000đ",
  quoteStatus: index % 2 === 0 ? "Chờ báo giá" : "Đã báo giá",
  note:
    index % 2 === 0
      ? "Cần xác nhận ngày trả và phí cọc."
      : "Đã gửi báo giá, chờ khách đặt cọc.",
}))

export function SellerPage({ title, description, type }: SellerPageProps) {
  return (
    <div className="mx-auto max-w-[1280px] space-y-7">
      <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-teal-100/80">
        <div className="relative border-b border-slate-100 bg-gradient-to-r from-white via-teal-50 to-emerald-50 p-6 md:p-8">
          <div className="absolute top-8 right-8 hidden h-24 w-24 rounded-full bg-teal-200/40 blur-2xl md:block" />

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-teal-100 px-4 py-1.5 text-xs font-black tracking-wider text-teal-700 uppercase">
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

      {type === "dashboard" && <DashboardSection />}
      {type === "products" && <ProductsSection />}
      {type === "orders" && <OrdersSection />}
      {type === "quotes" && <QuotesSection />}
      {type === "calendar" && <CalendarSection />}
      {type === "revenue" && <RevenueSection />}
      {type === "statistics" && <StatisticsSection />}
    </div>
  )
}

function QuotesSection() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortField, setSortField] = useState<"date" | "total" | null>(null)
  const [sortType, setSortType] = useState<SortType>("none")

  const filtered = useMemo(() => {
    let result = [...quoteRows]

    if (statusFilter) {
      result = result.filter((item) => item.quoteStatus === statusFilter)
    }

    return result
  }, [statusFilter])

  const sorted = useMemo(() => {
    if (sortType === "none" || !sortField) return filtered

    const result = [...filtered]

    if (sortField === "date") {
      result.sort((a, b) => {
        const dateA = parseDateString(a.date)
        const dateB = parseDateString(b.date)

        return sortType === "asc"
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime()
      })
    }

    if (sortField === "total") {
      result.sort((a, b) =>
        sortType === "asc"
          ? a.totalAmount - b.totalAmount
          : b.totalAmount - a.totalAmount
      )
    }

    return result
  }, [filtered, sortField, sortType])

  const toggleSort = (field: "date" | "total") => {
    if (sortField === field) {
      setSortType(
        sortType === "none" ? "asc" : sortType === "asc" ? "desc" : "none"
      )
    } else {
      setSortField(field)
      setSortType("asc")
    }
  }

  const uniqueStatuses = Array.from(
    new Set(quoteRows.map((item) => item.quoteStatus))
  )

  const totalQuoteValue = quoteRows.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  )

  return (
    <div className="space-y-7">
      <div className="grid gap-4 md:grid-cols-3">
        <QuoteSummaryCard
          label="Tổng báo giá"
          value={quoteRows.length.toString()}
          note="Số báo giá đang có trong hệ thống"
        />
        <QuoteSummaryCard
          label="Chờ báo giá"
          value={quoteRows
            .filter((item) => item.quoteStatus === "Chờ báo giá")
            .length.toString()}
          note="Cần xử lý và gửi cho khách"
        />
        <QuoteSummaryCard
          label="Giá trị tạm tính"
          value={`${totalQuoteValue.toLocaleString("vi-VN")}đ`}
          note="Tổng tiền thuê dự kiến"
        />
      </div>

      <Panel>
        <SectionTitle
          title="Báo giá đơn hàng"
          desc="Theo dõi khách cần báo giá, tiền cọc, số ngày thuê, tổng tiền và trạng thái xử lý."
          right={<SmallButton text="Tạo báo giá" />}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
              statusFilter === null
                ? "bg-teal-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất cả ({quoteRows.length})
          </button>

          {uniqueStatuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                statusFilter === status
                  ? "bg-teal-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status} (
              {quoteRows.filter((q) => q.quoteStatus === status).length})
            </button>
          ))}
        </div>

        <div className="mt-5">
          <QuotesTable
            data={sorted}
            onSortDate={() => toggleSort("date")}
            onSortTotal={() => toggleSort("total")}
            sortField={sortField}
            sortType={sortType}
          />
        </div>
      </Panel>
    </div>
  )
}

function QuoteSummaryCard({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note: string
}) {
  return (
    <div className="group rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-teal-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <p className="text-xs font-black tracking-wider text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{note}</p>
      <div className="mt-5 h-2 rounded-full bg-slate-100">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-teal-500 to-emerald-300 transition-all duration-500 group-hover:w-full" />
      </div>
    </div>
  )
}

function QuotesTable({
  data,
  onSortDate,
  onSortTotal,
  sortField,
  sortType,
}: {
  data: typeof quoteRows
  onSortDate: () => void
  onSortTotal: () => void
  sortField: "date" | "total" | null
  sortType: SortType
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse bg-white text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wider text-slate-400 uppercase">
            <tr>
              <Th>Mã</Th>
              <Th>Khách hàng</Th>
              <Th>SĐT</Th>
              <Th>Sản phẩm thuê</Th>
              <Th>
                <button
                  onClick={onSortDate}
                  className="flex items-center gap-2 hover:text-slate-600"
                >
                  Ngày thuê
                  <SortIcon
                    field="date"
                    currentField={sortField}
                    sortType={sortType}
                  />
                </button>
              </Th>
              <Th align="center">Số ngày</Th>
              <Th>Tiền cọc</Th>
              <Th>
                <button
                  onClick={onSortTotal}
                  className="flex items-center gap-2 hover:text-slate-600"
                >
                  Tổng báo giá
                  <SortIcon
                    field="total"
                    currentField={sortField}
                    sortType={sortType}
                  />
                </button>
              </Th>
              <Th>Trạng thái</Th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((quote) => (
              <tr
                key={quote.quoteCode}
                className="group transition duration-300 hover:bg-teal-50/70"
              >
                <Td>
                  <span className="font-black text-slate-950">
                    {quote.quoteCode}
                  </span>
                </Td>

                <Td>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-200 to-pink-200 text-xs font-black text-slate-700 transition duration-300 group-hover:scale-110">
                      {quote.avatar}
                    </span>
                    <span className="font-bold text-slate-800">
                      {quote.customer}
                    </span>
                  </div>
                </Td>

                <Td>{quote.phone}</Td>
                <Td>{quote.item}</Td>
                <Td>{quote.date}</Td>
                <Td align="center">{quote.rentalDays} ngày</Td>
                <Td>
                  <span className="font-black text-teal-700">
                    {quote.deposit}
                  </span>
                </Td>
                <Td>
                  <span className="font-black text-slate-950">
                    {quote.total}
                  </span>
                </Td>
                <Td>
                  <StatusPill status={quote.quoteStatus} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OrdersSection() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortField, setSortField] = useState<"date" | "total" | null>(null)
  const [sortType, setSortType] = useState<SortType>("none")

  const filtered = useMemo(() => {
    let result = [...sellerOrders]

    if (statusFilter) {
      result = result.filter((o) => o.status === statusFilter)
    }

    return result
  }, [statusFilter])

  const sorted = useMemo(() => {
    if (sortType === "none" || !sortField) return filtered

    const result = [...filtered]

    if (sortField === "date") {
      result.sort((a, b) => {
        const dateA = parseDateString(a.date)
        const dateB = parseDateString(b.date)

        return sortType === "asc"
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime()
      })
    }

    if (sortField === "total") {
      result.sort((a, b) =>
        sortType === "asc"
          ? a.totalAmount - b.totalAmount
          : b.totalAmount - a.totalAmount
      )
    }

    return result
  }, [filtered, sortField, sortType])

  const toggleSort = (field: "date" | "total") => {
    if (sortField === field) {
      setSortType(
        sortType === "none" ? "asc" : sortType === "asc" ? "desc" : "none"
      )
    } else {
      setSortField(field)
      setSortType("asc")
    }
  }

  const uniqueStatuses = Array.from(new Set(sellerOrders.map((o) => o.status)))

  return (
    <Panel>
      <SectionTitle
        title="Tiếp nhận đơn hàng"
        desc="Kiểm tra khách, ngày thuê, tạm tính và xác nhận đơn."
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
            statusFilter === null
              ? "bg-teal-500 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Tất cả ({sellerOrders.length})
        </button>

        {uniqueStatuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
              statusFilter === status
                ? "bg-teal-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {status} ({sellerOrders.filter((o) => o.status === status).length})
          </button>
        ))}
      </div>

      <div className="mt-5">
        <OrdersTable
          data={sorted}
          onSortDate={() => toggleSort("date")}
          onSortTotal={() => toggleSort("total")}
          sortField={sortField}
          sortType={sortType}
        />
      </div>
    </Panel>
  )
}

function DashboardSection() {
  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sellerKpis.map((stat) => (
          <div
            key={stat.label}
            className="group overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black tracking-wider text-slate-400 uppercase">
                  {stat.label}
                </p>
                <p className="mt-2 text-4xl font-black text-slate-950">
                  {stat.value}
                </p>
              </div>
              <span className="rounded-2xl bg-teal-100 px-3 py-1.5 text-xs font-black text-teal-700">
                Live
              </span>
            </div>

            <div className="my-4 border-t border-dashed border-slate-200" />
            <p className="text-sm font-semibold text-slate-500">{stat.note}</p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-300 transition-all duration-500 group-hover:w-full" />
            </div>
          </div>
        ))}
      </div>

      <Panel>
        <SectionTitle
          title="Đơn hàng mới"
          desc="Danh sách chia dạng bảng, có đường kẻ rõ giữa từng cột và từng dòng."
        />
        <div className="mt-5">
          <OrdersTable
            data={sellerOrders}
            onSortDate={() => {}}
            onSortTotal={() => {}}
            sortField={null}
            sortType="none"
          />
        </div>
      </Panel>
    </div>
  )
}

function ProductsSection() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortField, setSortField] = useState<"price" | "name" | null>(null)
  const [sortType, setSortType] = useState<SortType>("none")

  const filtered = useMemo(() => {
    let result = [...sellerProducts]

    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter)
    }

    return result
  }, [statusFilter])

  const sorted = useMemo(() => {
    if (sortType === "none" || !sortField) return filtered

    const result = [...filtered]

    if (sortField === "price") {
      result.sort((a, b) =>
        sortType === "asc" ? a.price - b.price : b.price - a.price
      )
    }

    if (sortField === "name") {
      result.sort((a, b) =>
        sortType === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      )
    }

    return result
  }, [filtered, sortField, sortType])

  const toggleSort = (field: "price" | "name") => {
    if (sortField === field) {
      setSortType(
        sortType === "none" ? "asc" : sortType === "asc" ? "desc" : "none"
      )
    } else {
      setSortField(field)
      setSortType("asc")
    }
  }

  const uniqueStatuses = Array.from(
    new Set(sellerProducts.map((p) => p.status))
  )

  return (
    <Panel>
      <SectionTitle
        title="Danh sách sản phẩm"
        desc="Mỗi sản phẩm được chia hàng rõ ràng, có trạng thái, tồn kho và số lượng đang thuê."
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
            statusFilter === null
              ? "bg-teal-500 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Tất cả ({sellerProducts.length})
        </button>

        {uniqueStatuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
              statusFilter === status
                ? "bg-teal-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {status} ({sellerProducts.filter((p) => p.status === status).length}
            )
          </button>
        ))}
      </div>

      <div className="mt-5">
        <ProductsTable
          data={sorted}
          onSortPrice={() => toggleSort("price")}
          onSortName={() => toggleSort("name")}
          sortField={sortField}
          sortType={sortType}
        />
      </div>
    </Panel>
  )
}

function ProductsTable({
  data,
  onSortPrice,
  onSortName,
  sortField,
  sortType,
}: {
  data: typeof sellerProducts
  onSortPrice: () => void
  onSortName: () => void
  sortField: "price" | "name" | null
  sortType: SortType
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse bg-white text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wider text-slate-400 uppercase">
            <tr>
              <Th>
                <button
                  onClick={onSortName}
                  className="flex items-center gap-2 hover:text-slate-600"
                >
                  Sản phẩm
                  <SortIcon
                    field="name"
                    currentField={sortField}
                    sortType={sortType}
                  />
                </button>
              </Th>
              <Th>SKU</Th>
              <Th>Danh mục</Th>
              <Th align="center">Tồn</Th>
              <Th align="center">Đang thuê</Th>
              <Th>
                <button
                  onClick={onSortPrice}
                  className="flex items-center gap-2 hover:text-slate-600"
                >
                  Giá thuê
                  <SortIcon
                    field="price"
                    currentField={sortField}
                    sortType={sortType}
                  />
                </button>
              </Th>
              <Th>Trạng thái</Th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((product) => (
              <tr
                key={product.sku}
                className="group transition duration-300 hover:bg-teal-50/70"
              >
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xl transition duration-300 group-hover:scale-110 group-hover:bg-teal-100">
                      {product.image}
                    </span>
                    <div>
                      <p className="font-black text-slate-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-400">Cập nhật hôm nay</p>
                    </div>
                  </div>
                </Td>
                <Td>{product.sku}</Td>
                <Td>{product.category}</Td>
                <Td align="center">{product.stock}</Td>
                <Td align="center">{product.rented}</Td>
                <Td>{product.priceLabel}</Td>
                <Td>
                  <StatusPill status={product.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OrdersTable({
  data,
  onSortDate,
  onSortTotal,
  sortField,
  sortType,
}: {
  data: typeof sellerOrders
  onSortDate: () => void
  onSortTotal: () => void
  sortField: "date" | "total" | null
  sortType: SortType
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse bg-white text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wider text-slate-400 uppercase">
            <tr>
              <Th>Mã đơn</Th>
              <Th>Khách hàng</Th>
              <Th>SĐT</Th>
              <Th>Sản phẩm</Th>
              <Th>
                <button
                  onClick={onSortDate}
                  className="flex items-center gap-2 hover:text-slate-600"
                >
                  Ngày thuê
                  <SortIcon
                    field="date"
                    currentField={sortField}
                    sortType={sortType}
                  />
                </button>
              </Th>
              <Th>
                <button
                  onClick={onSortTotal}
                  className="flex items-center gap-2 hover:text-slate-600"
                >
                  Tạm tính
                  <SortIcon
                    field="total"
                    currentField={sortField}
                    sortType={sortType}
                  />
                </button>
              </Th>
              <Th>Trạng thái</Th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((order) => (
              <tr
                key={order.id}
                className="group transition duration-300 hover:bg-teal-50/70"
              >
                <Td>
                  <span className="font-black text-slate-950">{order.id}</span>
                </Td>

                <Td>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-200 to-pink-200 text-xs font-black text-slate-700 transition duration-300 group-hover:scale-110">
                      {order.avatar}
                    </span>
                    <span className="font-bold text-slate-800">
                      {order.customer}
                    </span>
                  </div>
                </Td>

                <Td>{order.phone}</Td>
                <Td>{order.item}</Td>
                <Td>{order.date}</Td>
                <Td>
                  <span className="font-black text-slate-950">
                    {order.total}
                  </span>
                </Td>
                <Td>
                  <StatusPill status={order.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CalendarSection() {
  const [isOpen, setIsOpen] = useState(false)
  const [schedules, setSchedules] = useState(rentalSchedules)
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    title: "",
    customer: "",
    type: "Giao hàng",
    status: "Chờ xác nhận",
  })

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.date && formData.time && formData.title && formData.customer) {
      setSchedules([...schedules, formData])
      setFormData({
        date: "",
        time: "",
        title: "",
        customer: "",
        type: "Giao hàng",
        status: "Chờ xác nhận",
      })
      setIsOpen(false)
    }
  }

  return (
    <Panel>
      <SectionTitle
        title="Quản lý lịch thuê"
        desc="Lịch giao, nhận trả và bảo trì được tách thành từng dòng với gạch chia rõ ràng."
        right={<AddCalendarButton onClick={() => setIsOpen(!isOpen)} />}
      />

      {isOpen && (
        <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">
              Thêm lịch thuê
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleAddSchedule} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900"
              />

              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900"
              />
            </div>

            <input
              type="text"
              placeholder="Tiêu đề"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900"
            />

            <input
              type="text"
              placeholder="Khách hàng"
              value={formData.customer}
              onChange={(e) =>
                setFormData({ ...formData, customer: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900"
              >
                <option>Giao hàng</option>
                <option>Nhận trả</option>
                <option>Bảo trì</option>
              </select>

              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900"
              >
                <option>Chờ xác nhận</option>
                <option>Đang giao</option>
                <option>Theo dõi</option>
                <option>Bảo trì</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-teal-600"
            >
              Thêm lịch
            </button>
          </form>
        </div>
      )}

      <div className="mt-6 divide-y divide-dashed divide-slate-200 overflow-hidden rounded-3xl border border-slate-100 bg-white">
        {schedules.map((item) => (
          <div
            key={`${item.date}-${item.time}`}
            className="grid gap-4 p-5 transition duration-300 hover:bg-teal-50 md:grid-cols-[150px_minmax(0,1fr)_130px_130px] md:items-center"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div>
                <p className="font-black text-slate-900">{item.date}</p>
                <p className="text-sm text-slate-400">{item.time}</p>
              </div>
            </div>

            <div>
              <p className="font-black text-slate-900">{item.title}</p>
              <p className="text-sm text-slate-500">{item.customer}</p>
            </div>

            <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
              {item.type}
            </span>

            <StatusPill status={item.status} />
          </div>
        ))}
      </div>
    </Panel>
  )
}

function RevenueSection() {
  return (
    <div className="space-y-7">
      <div className="grid gap-4 md:grid-cols-3">
        {revenueRows.map((row) => (
          <div
            key={row.label}
            className="group rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-teal-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-4">
              <p className="text-sm font-black text-slate-500">{row.label}</p>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                {row.change}
              </span>
            </div>

            <p className="mt-5 text-4xl font-black text-slate-950">
              {row.value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{row.note}</p>

            <div className="mt-5 h-2 rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-teal-500 to-emerald-300 transition-all duration-500 group-hover:w-full" />
            </div>
          </div>
        ))}
      </div>

      <Panel>
        <SectionTitle
          title="Doanh thu theo đơn"
          desc="Bảng doanh thu được chia dòng rõ ràng để đối soát nhanh."
        />
        <div className="mt-5">
          <OrdersTable
            data={sellerOrders}
            onSortDate={() => {}}
            onSortTotal={() => {}}
            sortField={null}
            sortType="none"
          />
        </div>
      </Panel>
    </div>
  )
}

function StatisticsSection() {
  const chartRows = [
    {
      label: "Đơn hoàn thành",
      value: 82,
      text: "82%",
    },
    {
      label: "Đơn đang thuê",
      value: 64,
      text: "64%",
    },
    {
      label: "Tỷ lệ đặt cọc",
      value: 76,
      text: "76%",
    },
    {
      label: "Sản phẩm còn hàng",
      value: 58,
      text: "58%",
    },
  ]

  return (
    <div className="space-y-7">
      <Panel>
        <SectionTitle
          title="Biểu đồ thống kê"
          desc="Theo dõi nhanh hiệu suất bán hàng, tỷ lệ đặt cọc và tình trạng cho thuê."
        />

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-100 bg-white p-5">
            <h3 className="text-lg font-black text-slate-950">
              Hiệu suất hoạt động
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Biểu đồ cột ngang theo phần trăm.
            </p>

            <div className="mt-6 space-y-5">
              {chartRows.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">
                      {item.label}
                    </span>
                    <span className="text-sm font-black text-teal-600">
                      {item.text}
                    </span>
                  </div>

                  <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-300 transition-all duration-700"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-teal-50 to-white p-5">
            <h3 className="text-lg font-black text-slate-950">
              Tỷ lệ đơn đã chốt
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Đơn đã báo giá và khách đã xác nhận.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center">
              <div
                className="flex h-48 w-48 items-center justify-center rounded-full"
                style={{
                  background:
                    "conic-gradient(rgb(20 184 166) 0deg 270deg, rgb(226 232 240) 270deg 360deg)",
                }}
              >
                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                  <span className="text-4xl font-black text-slate-950">
                    75%
                  </span>
                  <span className="mt-1 text-xs font-bold text-slate-400">
                    Đã chốt
                  </span>
                </div>
              </div>

              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-4 text-center ring-1 ring-slate-100">
                  <p className="text-2xl font-black text-teal-600">36</p>
                  <p className="text-xs font-bold text-slate-500">Đã chốt</p>
                </div>

                <div className="rounded-2xl bg-white p-4 text-center ring-1 ring-slate-100">
                  <p className="text-2xl font-black text-orange-500">12</p>
                  <p className="text-xs font-bold text-slate-500">Chờ xử lý</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionTitle
          title="Thống kê seller"
          desc="Các chỉ số được tách ô, có gạch chia giữa từng phần và hiệu ứng hover."
        />

        <div className="mt-6 grid overflow-hidden rounded-3xl border border-slate-100 bg-white md:grid-cols-2">
          {statisticRows.map((row, index) => (
            <div
              key={row.label}
              className="group border-r border-b border-slate-100 p-6 transition duration-300 hover:bg-teal-50"
            >
              <p className="text-xs font-black tracking-wider text-slate-400 uppercase">
                #{index + 1} · {row.label}
              </p>
              <p className="mt-3 text-2xl font-black text-slate-950 transition duration-300 group-hover:translate-x-1">
                {row.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {row.note}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function SectionTitle({
  title,
  desc,
  right,
}: {
  title: string
  desc: string
  right?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-dashed border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p>
      </div>
      {right}
    </div>
  )
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-teal-100/80 transition duration-300 hover:shadow-xl ${className}`}
    >
      {children}
    </section>
  )
}

function SmallButton({ text }: { text: string }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-teal-500/20 transition duration-300 hover:-translate-y-1 hover:bg-teal-600">
      <SlidersHorizontal className="h-4 w-4" />
      {text}
    </button>
  )
}

function AddCalendarButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-teal-500/20 transition duration-300 hover:-translate-y-1 hover:bg-teal-600"
    >
      <Plus className="h-4 w-4" />
      Thêm lịch
    </button>
  )
}

function SortIcon({
  field,
  currentField,
  sortType,
}: {
  field: string
  currentField: string | null
  sortType: SortType
}) {
  if (currentField !== field || sortType === "none") {
    return <ArrowUpDown className="h-3 w-3 opacity-40" />
  }

  return (
    <ArrowUpDown
      className={`h-3 w-3 ${sortType === "asc" ? "rotate-180" : ""}`}
    />
  )
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode
  align?: "left" | "center"
}) {
  return (
    <th
      className={`border-r border-slate-100 px-5 py-4 font-black last:border-r-0 ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode
  align?: "left" | "center"
}) {
  return (
    <td
      className={`border-r border-slate-100 px-5 py-4 last:border-r-0 ${
        align === "center" ? "text-center" : "text-slate-600"
      }`}
    >
      {children}
    </td>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Còn hàng": "bg-emerald-100 text-emerald-700",
    "Đang cho thuê": "bg-sky-100 text-sky-700",
    "Bảo trì": "bg-amber-100 text-amber-700",
    "Chờ xác nhận": "bg-orange-100 text-orange-700",
    "Đã báo giá": "bg-violet-100 text-violet-700",
    "Chờ báo giá": "bg-pink-100 text-pink-700",
    "Đang giao": "bg-cyan-100 text-cyan-700",
    "Đặt cọc": "bg-teal-100 text-teal-700",
    "Đang thuê": "bg-indigo-100 text-indigo-700",
    "Theo dõi": "bg-slate-100 text-slate-700",
  }

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-black ${
        styles[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  )
}
