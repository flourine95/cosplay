import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { UserRole } from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products")

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File)

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Vui lòng chọn ít nhất một ảnh" },
        { status: 400 }
      )
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const urls: string[] = []
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Chỉ hỗ trợ file hình ảnh" },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Mỗi ảnh tối đa 5MB" },
          { status: 400 }
        )
      }

      const ext = path.extname(file.name).toLowerCase() || ".jpg"
      const fileName = `${randomUUID()}${ext}`
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      await writeFile(path.join(UPLOAD_DIR, fileName), buffer)
      urls.push(`/uploads/products/${fileName}`)
    }

    return NextResponse.json({ data: { urls } })
  } catch (error) {
    console.error("POST /api/admin/product-images error:", error)
    return NextResponse.json(
      { error: "Không thể tải ảnh lên" },
      { status: 500 }
    )
  }
}
