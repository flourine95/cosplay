import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "custom-orders"
)

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
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

    if (files.length > 5) {
      return NextResponse.json(
        { error: "Tối đa 5 ảnh tham khảo" },
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
      const buffer = Buffer.from(await file.arrayBuffer())

      await writeFile(path.join(UPLOAD_DIR, fileName), buffer)
      urls.push(`/uploads/custom-orders/${fileName}`)
    }

    return NextResponse.json({ data: { urls } })
  } catch (error) {
    console.error("POST /api/custom-order-images error:", error)
    return NextResponse.json(
      { error: "Không thể tải ảnh đặt may lên" },
      { status: 500 }
    )
  }
}
