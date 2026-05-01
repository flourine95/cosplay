"use client"
import React, { useEffect, useMemo, useState } from "react"
import { Navbar } from "@/components/home/navbar"
import { AnnouncementBar } from "@/components/home/announcement-bar"
import { Footer } from "@/components/home/footer"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
type Measurements = {
  bust?: number | null
  waist?: number | null
  hips?: number | null
  shoulder?: number | null
  neck?: number | null
  height?: number | null
  weight?: number | null
  armLength?: number | null
  legLength?: number | null
}

type MeasurementSet = {
  id: string
  name: string
  date: string
  notes?: string
  tags?: string[]
  measurements: Measurements
  isDefault?: boolean
}

const STORAGE_KEY = "measurements_v2"

function parseNumber(v: FormDataEntryValue | null) {
  if (!v) return null
  const s = String(v).trim()
  if (s === "") return null
  const n = Number(s.replace(",", "."))
  return Number.isFinite(n) ? n : null
}

export default function MeasurementsPage() {
  const [sets, setSets] = useState<MeasurementSet[]>([])
  const [query, setQuery] = useState("")
  const [editing, setEditing] = useState<MeasurementSet | null>(null)
  const [form, setForm] = useState<Partial<MeasurementSet>>({
    name: "",
    notes: "",
    tags: [],
    measurements: {},
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setSets(JSON.parse(raw))
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets))
  }, [sets])

  // Migrate legacy key if present
  useEffect(() => {
    try {
      const rawLegacy = localStorage.getItem("measurements")
      if (rawLegacy && !localStorage.getItem(STORAGE_KEY)) {
        const legacy = JSON.parse(rawLegacy)
        if (Array.isArray(legacy)) {
          const migrated: MeasurementSet[] = legacy.map((l: any) => ({
            id: l.id || String(Date.now() + Math.random()),
            name: l.name || "Số đo",
            date: l.date || new Date().toISOString(),
            notes: "",
            tags: [],
            measurements: {
              bust: l.bust ? Number(l.bust) : null,
              waist: l.waist ? Number(l.waist) : null,
              hips: l.hips ? Number(l.hips) : null,
              height: l.height ? Number(l.height) : null,
              weight: l.weight ? Number(l.weight) : null,
            },
            isDefault: false,
          }))
          if (migrated.length) setSets(migrated)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  function resetForm() {
    setEditing(null)
    setForm({ name: "", notes: "", tags: [], measurements: {} })
  }

  function startEdit(s: MeasurementSet) {
    setEditing(s)
    setForm({ ...s, tags: s.tags || [], measurements: s.measurements || {} })
  }

  function handleInputChange<K extends keyof MeasurementSet>(
    key: K,
    value: any
  ) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleMeasurementChange<K extends keyof Measurements>(
    key: K,
    value: string
  ) {
    setForm((f) => ({
      ...f,
      measurements: { ...(f.measurements || {}), [key]: parseNumber(value) },
    }))
  }

  function saveSet(e?: React.FormEvent) {
    e?.preventDefault()
    const entry: MeasurementSet = {
      id: editing?.id || String(Date.now()),
      name: (form.name || "Số đo mới").trim(),
      date: editing?.date || new Date().toISOString(),
      notes: form.notes || "",
      tags: Array.isArray(form.tags)
        ? form.tags
        : String(form.tags || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
      measurements: {
        ...(form.measurements || {}),
      },
      isDefault: !!(editing?.isDefault || form.isDefault),
    }

    setSets((prev) => {
      const exists = prev.find((p) => p.id === entry.id)
      if (entry.isDefault) {
        // unset previous default
        prev = prev.map((p) => ({ ...p, isDefault: p.id === entry.id }))
      }
      if (exists) return prev.map((p) => (p.id === entry.id ? entry : p))
      return [entry, ...prev]
    })

    resetForm()
  }

  function removeSet(id: string) {
    if (!confirm("Xoá số đo này?")) return
    setSets((prev) => prev.filter((p) => p.id !== id))
  }

  function setDefault(id: string) {
    setSets((prev) => prev.map((p) => ({ ...p, isDefault: p.id === id })))
  }

  function downloadJSON(data: any, filename = "measurements.json") {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportAll() {
    downloadJSON(sets, "measurements_all.json")
  }

  function exportOne(s: MeasurementSet) {
    downloadJSON(s, `measurement_${s.id}.json`)
  }

  function importFile(file: File | null) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (Array.isArray(parsed)) setSets((prev) => [...parsed, ...prev])
        else if (parsed && parsed.id) setSets((prev) => [parsed, ...prev])
      } catch (e) {
        alert("Tệp không hợp lệ")
      }
    }
    reader.readAsText(file)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sets
    return sets.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.tags || []).some((t) => t.toLowerCase().includes(q))
    )
  }, [sets, query])

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="container mx-auto p-6">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/profile">Thông tin cá nhân</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Quản lý số đo</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="mb-4 text-2xl font-semibold">Quản lý số đo</h1>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc tag"
              className="rounded border px-2 py-1"
            />
            <button
              onClick={exportAll}
              className="rounded bg-green-600 px-3 py-1 text-white"
            >
              Xuất tất cả
            </button>
            <label className="cursor-pointer rounded border px-3 py-1">
              Nhập
              <input
                onChange={(e) => importFile(e.target.files?.[0] || null)}
                type="file"
                accept="application/json"
                className="hidden"
              />
            </label>
          </div>

          <div className="text-sm text-muted-foreground">
            Số bộ: {sets.length}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form onSubmit={saveSet} className="col-span-1 rounded border p-4">
            <h2 className="mb-2 text-lg font-medium">Thêm / Chỉnh sửa</h2>
            <div className="mb-2">
              <label className="block text-sm">Tên</label>
              <input
                value={form.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm">Ngày</label>
              <input
                value={
                  editing?.date
                    ? new Date(editing.date).toISOString().slice(0, 16)
                    : new Date().toISOString().slice(0, 16)
                }
                onChange={(e) =>
                  handleInputChange(
                    "date",
                    new Date(e.target.value).toISOString()
                  )
                }
                type="datetime-local"
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm">Ngực (cm)</label>
                <input
                  value={form.measurements?.bust ?? ""}
                  onChange={(e) =>
                    handleMeasurementChange("bust", e.target.value)
                  }
                  className="mt-1 w-full rounded border px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm">Eo (cm)</label>
                <input
                  value={form.measurements?.waist ?? ""}
                  onChange={(e) =>
                    handleMeasurementChange("waist", e.target.value)
                  }
                  className="mt-1 w-full rounded border px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm">Mông (cm)</label>
                <input
                  value={form.measurements?.hips ?? ""}
                  onChange={(e) =>
                    handleMeasurementChange("hips", e.target.value)
                  }
                  className="mt-1 w-full rounded border px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm">Vai (cm)</label>
                <input
                  value={form.measurements?.shoulder ?? ""}
                  onChange={(e) =>
                    handleMeasurementChange("shoulder", e.target.value)
                  }
                  className="mt-1 w-full rounded border px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm">Cổ (cm)</label>
                <input
                  value={form.measurements?.neck ?? ""}
                  onChange={(e) =>
                    handleMeasurementChange("neck", e.target.value)
                  }
                  className="mt-1 w-full rounded border px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm">Chiều cao (cm)</label>
                <input
                  value={form.measurements?.height ?? ""}
                  onChange={(e) =>
                    handleMeasurementChange("height", e.target.value)
                  }
                  className="mt-1 w-full rounded border px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm">Chiều dài tay (cm)</label>
                <input
                  value={form.measurements?.armLength ?? ""}
                  onChange={(e) =>
                    handleMeasurementChange("armLength", e.target.value)
                  }
                  className="mt-1 w-full rounded border px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm">Chiều dài chân (cm)</label>
                <input
                  value={form.measurements?.legLength ?? ""}
                  onChange={(e) =>
                    handleMeasurementChange("legLength", e.target.value)
                  }
                  className="mt-1 w-full rounded border px-2 py-1"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm">Cân nặng (kg)</label>
                <input
                  value={form.measurements?.weight ?? ""}
                  onChange={(e) =>
                    handleMeasurementChange("weight", e.target.value)
                  }
                  className="mt-1 w-full rounded border px-2 py-1"
                />
              </div>
            </div>

            <div className="mt-2 mb-2">
              <label className="block text-sm">
                Tags (phân cách bằng dấu phẩy)
              </label>
              <input
                value={(form.tags || []).join(", ")}
                onChange={(e) =>
                  handleInputChange(
                    "tags",
                    String(e.target.value)
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                  )
                }
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm">Ghi chú</label>
              <textarea
                value={form.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded border px-4 py-2"
              >
                Huỷ
              </button>
            </div>
          </form>

          <div className="col-span-2 space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded border p-4 text-sm text-muted-foreground">
                Không tìm thấy bộ số đo nào.
              </div>
            ) : (
              filtered.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start justify-between rounded border p-3"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{s.name}</div>
                      {s.isDefault && (
                        <div className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                          Mặc định
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {new Date(s.date).toLocaleString()}
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                      <div>Ngực: {s.measurements.bust ?? "-"}</div>
                      <div>Eo: {s.measurements.waist ?? "-"}</div>
                      <div>Mông: {s.measurements.hips ?? "-"}</div>
                      <div>Vai: {s.measurements.shoulder ?? "-"}</div>
                      <div>Cổ: {s.measurements.neck ?? "-"}</div>
                      <div>Chiều cao: {s.measurements.height ?? "-"}</div>
                      <div>Cân nặng: {s.measurements.weight ?? "-"}</div>
                    </div>

                    {s.tags && s.tags.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Tags: {s.tags.join(", ")}
                      </div>
                    )}
                    {s.notes && (
                      <div className="mt-2 text-sm">Ghi chú: {s.notes}</div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => startEdit(s)}
                      className="rounded border px-3 py-1 text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => setDefault(s.id)}
                      className="rounded border px-3 py-1 text-sm"
                    >
                      Đặt mặc định
                    </button>
                    <button
                      onClick={() => exportOne(s)}
                      className="rounded border px-3 py-1 text-sm"
                    >
                      Xuất
                    </button>
                    <button
                      onClick={() => removeSet(s.id)}
                      className="rounded border px-3 py-1 text-sm text-red-600"
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
