import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

const MAX_FILES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024
const UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "rental-evidence"
)

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File)

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Vui long chon it nhat mot anh" },
        { status: 400 }
      )
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Toi da ${MAX_FILES} anh moi lan tai len` },
        { status: 400 }
      )
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const urls: string[] = []
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Chi ho tro file hinh anh" },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Moi anh toi da 5MB" },
          { status: 400 }
        )
      }

      const ext = path.extname(file.name).toLowerCase() || ".jpg"
      const fileName = `${randomUUID()}${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())

      await writeFile(path.join(UPLOAD_DIR, fileName), buffer)
      urls.push(`/uploads/rental-evidence/${fileName}`)
    }

    return NextResponse.json({ data: { urls } })
  } catch (error) {
    console.error("POST /api/rental/evidence-images error:", error)
    return NextResponse.json(
      { error: "Khong the tai anh bang chung thue do" },
      { status: 500 }
    )
  }
}
