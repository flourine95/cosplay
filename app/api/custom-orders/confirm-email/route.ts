import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSession()
    if (!sessionUser) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, orderNumber, characterName } = body

    if (!orderId || !orderNumber) {
      return NextResponse.json(
        { error: "Thiếu thông tin đơn hàng" },
        { status: 400 }
      )
    }

    const orderLink = `${process.env.NEXT_PUBLIC_APP_URL}/custom-order/${orderId}`
    const recipientEmail = sessionUser.email
    const recipientName = sessionUser.name ?? "bạn"

    try {
      const result = await resend.emails.send({
        from: "Cosplay System <onboarding@resend.dev>",
        to: recipientEmail,
        subject: `Xác nhận yêu cầu đặt may #${orderNumber}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #6d28d9, #4f46e5); padding: 32px 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">
                🎉 Yêu cầu đặt may đã được gửi!
              </h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">
                Cosplay Custom Order
              </p>
            </div>

            <!-- Body -->
            <div style="padding: 28px 24px; background: #ffffff;">
              <p style="color: #374151; font-size: 15px; margin: 0 0 16px;">
                Xin chào <strong>${recipientName}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 14px; line-height: 24px; margin: 0 0 20px;">
                Chúng tôi đã nhận được yêu cầu đặt may trang phục cosplay của bạn. 
                Maker sẽ xem xét và gửi báo giá trong vòng <strong>24 giờ</strong>.
              </p>

              <!-- Order Info Box -->
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 0 0 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="color: #6b7280; font-size: 13px; padding: 4px 0;">Mã yêu cầu</td>
                    <td style="color: #111827; font-size: 13px; font-weight: 700; text-align: right;">#${orderNumber}</td>
                  </tr>
                  ${characterName ? `
                  <tr>
                    <td style="color: #6b7280; font-size: 13px; padding: 4px 0;">Nhân vật</td>
                    <td style="color: #111827; font-size: 13px; font-weight: 600; text-align: right;">${characterName}</td>
                  </tr>
                  ` : ""}
                  <tr>
                    <td style="color: #6b7280; font-size: 13px; padding: 4px 0;">Trạng thái</td>
                    <td style="text-align: right;">
                      <span style="background: #d1fae5; color: #065f46; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 999px;">
                        Đã gửi
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Steps -->
              <p style="color: #111827; font-size: 14px; font-weight: 700; margin: 0 0 12px;">
                📋 Điều gì sẽ xảy ra tiếp theo?
              </p>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${[
                  { num: "1", text: "Maker xem xét yêu cầu", sub: "Trong 24 giờ" },
                  { num: "2", text: "Bạn nhận báo giá", sub: "Sau khi Maker xem xét" },
                  { num: "3", text: "Duyệt giá & đặt cọc 30–50%", sub: "Khi đồng ý báo giá" },
                  { num: "4", text: "Maker tiến hành gia công", sub: "3–6 tuần" },
                ]
                  .map(
                    (s) => `
                  <div style="display: flex; align-items: flex-start; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="background: #ede9fe; color: #7c3aed; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; text-align: center; line-height: 24px;">
                      ${s.num}
                    </div>
                    <div>
                      <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${s.text}</p>
                      <p style="margin: 2px 0 0; color: #9ca3af; font-size: 12px;">${s.sub}</p>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 28px 0 0;">
                <a href="${orderLink}" style="background: #7c3aed; color: white; padding: 12px 32px; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 14px; display: inline-block;">
                  Xem tiến độ đơn hàng →
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px 24px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Nếu bạn không đặt yêu cầu này, vui lòng bỏ qua email.
                <br/>Có thắc mắc? <a href="${process.env.NEXT_PUBLIC_APP_URL}/support" style="color: #7c3aed;">Liên hệ hỗ trợ</a>
              </p>
            </div>
          </div>
        `,
      })
    } catch (mailError) {
      console.error("Lỗi gửi email xác nhận đặt may:", mailError)
      // Không throw — lỗi email không nên ảnh hưởng flow chính
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/custom-orders/confirm-email error:", error)
    return NextResponse.json(
      { error: "Không thể gửi email xác nhận" },
      { status: 500 }
    )
  }
}