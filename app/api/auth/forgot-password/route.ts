import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"
import { forgotPasswordSchema } from "@/schemas/auth"
import { Resend } from "resend" // 1. Thêm import này

// 2. Khởi tạo đối tượng Resend với API Key đã cấu hình trong file .env
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Xóa các token cũ chưa sử dụng của user này (nếu có) để dọn dẹp DB
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id, usedAt: null },
    })

    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // Hết hạn sau 1 giờ

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    })

    // Tạo đường dẫn động gửi kèm trong mail
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/change-password?token=${token}`

    // 3. Thay thế đoạn console.warn cũ bằng lệnh gửi mail thực tế dưới đây
    try {
      await resend.emails.send({
        from: "Cosplay System <onboarding@resend.dev>", // Tên thương hiệu hiển thị trong hòm thư
        to: email, // Email người nhận
        subject: "Yêu cầu đặt lại mật khẩu tài khoản của bạn",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 24px; border-radius: 12px;">
            <h2 style="color: #111827; margin-bottom: 16px;">Đặt lại mật khẩu</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 24px;">
              Bạn nhận được email này vì hệ thống nhận được yêu cầu khôi phục mật khẩu từ tài khoản của bạn. Vui lòng bấm vào nút dưới đây để thiết lập mật khẩu mới:
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Xác nhận đổi mật khẩu
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; padding-top: 16px; margin-top: 24px;">
              Đường dẫn này chỉ có hiệu lực trong vòng 1 tiếng và chỉ sử dụng được duy nhất một lần. Nếu bạn không đưa ra yêu cầu này, hãy bỏ qua email này an toàn.
            </p>
          </div>
        `,
      })
    } catch (mailError) {
      // Nếu có lỗi từ server Resend (như sai API key), ghi nhận log lại nhưng không làm sập luồng xử lý
      console.error("Lỗi gửi email thực tế:", mailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Không thể xử lý yêu cầu" },
      { status: 500 }
    )
  }
}