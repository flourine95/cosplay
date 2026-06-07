"use client"

import React, { useState } from "react"
import { ArrowLeft, Save, UploadCloud } from "lucide-react"
import Link from "next/link"

export interface ProductData {
  name?: string
  sku?: string
  category?: string
  condition?: string
  description?: string
  sizes?: string[]
  businessTypes?: string[]
  sellPrice?: string | number
  sellStock?: string | number
  rentPrice?: string | number
  rentDeposit?: string | number
  rentAccessories?: string
  tailorPrice?: string | number
  tailorTime?: string | number
  tailorMeasurements?: string[]
}

export default function ProductForm({
  initialData = null,
}: {
  initialData?: ProductData | null
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    category: initialData?.category || "Váy Dạ Hội",
    condition: initialData?.condition || "Mới 100%", // Thêm: Tình trạng độ mới
    description: initialData?.description || "", // Thêm: Mô tả chi tiết

    // Block 2: Loại hình kinh doanh
    isSelling: initialData?.businessTypes?.includes("Bán") || false,
    isRenting: initialData?.businessTypes?.includes("Thuê") || false,
    isTailoring: initialData?.businessTypes?.includes("May đo") || false,
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement
    const { checked } = e.target as HTMLInputElement

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  return (
    <div className="relative min-h-[calc(100vh-100px)] pb-24">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/seller/products"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-primary/10 hover:text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {initialData ? "Sửa thông tin sản phẩm" : "Thêm sản phẩm mới"}
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý thông tin, mô tả, cấu hình giá bán, thuê và may đo.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="mb-4 text-lg font-black text-slate-900">
              Thông tin cơ bản
            </h2>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="VD: Set Hầu Gái Maid Cosplay Phong Cách Nhật..."
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Mã SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    placeholder="VD: SP-001"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Danh mục
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option>Trang Phục Cosplay</option>
                    <option>Váy Dạ Hội</option>
                    <option>Giáp / Vũ khí</option>
                    <option>Phụ kiện / Tóc giả (Wig)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Tình trạng
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option>Mới 100% (Brand New)</option>
                    <option>Như mới (Like New 95%)</option>
                    <option>Đã sử dụng (80%)</option>
                    <option>Hàng rách/lỗi nhẹ (Thanh lý)</option>
                  </select>
                </div>
              </div>

              {/* BỔ SUNG: Kích cỡ */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Kích cỡ (Size) có sẵn
                </label>
                <div className="flex flex-wrap gap-3">
                  {["S", "M", "L", "XL", "Free-size"].map((size) => (
                    <label
                      key={size}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary"
                    >
                      <input type="checkbox" className="hidden" />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              {/* BỔ SUNG: Mô tả chi tiết */}
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Mô tả chi tiết
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Viết mô tả chi tiết về chất liệu vải, form dáng, lưu ý giặt ủi..."
                  className="min-h-[120px] w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm transition outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Hình ảnh sản phẩm
                </label>
                <div className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 transition hover:border-primary/50 hover:bg-primary/5">
                  <UploadCloud className="mb-2 h-8 w-8 text-slate-400" />
                  <span className="text-sm font-bold text-slate-600">
                    Click để tải ảnh lên (Tối đa 8 ảnh)
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Form Bán Đứt */}
          {formData.isSelling && (
            <section className="rounded-[2rem] border border-emerald-100 bg-emerald-50/30 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-black text-emerald-800">
                Cấu hình Bán đứt
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-emerald-900">
                    Giá bán (VNĐ) *
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full rounded-xl border border-emerald-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-emerald-900">
                    Tồn kho bán lẻ
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full rounded-xl border border-emerald-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Form Cho Thuê */}
          {formData.isRenting && (
            <section className="rounded-[2rem] border border-sky-100 bg-sky-50/30 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-black text-sky-800">
                Cấu hình Cho thuê
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-sky-900">
                    Giá thuê (VNĐ/ngày) *
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-sky-900">
                    Tiền cọc bắt buộc (VNĐ)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* BỔ SUNG: Phụ kiện đi kèm khi thuê */}
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-bold text-sky-900">
                  Phụ kiện bao gồm (Cực kỳ quan trọng để đối chiếu khi trả đồ)
                </label>
                <textarea
                  placeholder="VD: 1 Váy chính, 1 Tạp dề, 1 Nơ cổ, 1 Tóc giả (Wig)..."
                  className="min-h-[80px] w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
                />
              </div>
            </section>
          )}

          {/* Form Đặt May */}
          {formData.isTailoring && (
            <section className="rounded-[2rem] border border-purple-100 bg-purple-50/30 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-black text-purple-800">
                Cấu hình Đặt may
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-purple-900">
                    Giá khởi điểm (VNĐ) *
                  </label>
                  <input
                    type="number"
                    placeholder="Từ..."
                    className="w-full rounded-xl border border-purple-200 px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-purple-900">
                    Thời gian gia công (Ngày)
                  </label>
                  <input
                    type="number"
                    placeholder="VD: 14"
                    className="w-full rounded-xl border border-purple-200 px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-sm font-bold text-purple-900">
                  Yêu cầu khách cung cấp số đo:
                </label>
                <div className="flex flex-wrap gap-4">
                  {[
                    "Vòng ngực",
                    "Vòng eo",
                    "Vòng hông",
                    "Chiều cao",
                    "Chiều dài tay",
                    "Vòng đầu",
                    "Rộng vai",
                  ].map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-2 text-sm font-medium text-purple-800"
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* CỘT PHẢI: LỰA CHỌN LOẠI HÌNH */}
        <div className="space-y-6">
          <section className="sticky top-24 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="mb-4 text-lg font-black text-slate-900">
              Loại hình kinh doanh
            </h2>
            <p className="mb-4 text-xs text-slate-500">
              Tick chọn các mô hình bạn muốn áp dụng cho sản phẩm này.
            </p>

            <div className="space-y-3">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${formData.isSelling ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:bg-slate-50"}`}
              >
                <input
                  type="checkbox"
                  name="isSelling"
                  checked={formData.isSelling}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-700">
                  Cho phép Bán đứt
                </span>
              </label>

              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${formData.isRenting ? "border-sky-500 bg-sky-50/50" : "border-slate-200 hover:bg-slate-50"}`}
              >
                <input
                  type="checkbox"
                  name="isRenting"
                  checked={formData.isRenting}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="font-bold text-slate-700">Cho phép Thuê</span>
              </label>

              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${formData.isTailoring ? "border-purple-500 bg-purple-50/50" : "border-slate-200 hover:bg-slate-50"}`}
              >
                <input
                  type="checkbox"
                  name="isTailoring"
                  checked={formData.isTailoring}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="font-bold text-slate-700">Nhận Đặt May</span>
              </label>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed right-0 bottom-0 z-40 flex w-full border-t border-slate-200 bg-white/80 p-4 shadow-lg backdrop-blur-md lg:w-[calc(100%-240px)]">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-end gap-3 px-4 lg:px-10">
          <Link
            href="/seller/products"
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Hủy bỏ
          </Link>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90">
            <Save className="h-4 w-4" />
            Lưu Sản Phẩm
          </button>
        </div>
      </div>
    </div>
  )
}
