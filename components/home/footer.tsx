import Link from "next/link"
import { SiFacebook, SiInstagram, SiYoutube } from "react-icons/si"
import { Separator } from "@/components/ui/separator"

const footerLinks = {
  "Dịch vụ": [
    { label: "Mua trang phục", href: "/products" },
    { label: "Thuê trang phục", href: "/rental/1" },
    { label: "Đặt may theo yêu cầu", href: "/custom-order" },
    { label: "Phụ kiện cosplay", href: "/products" },
  ],
  "Hỗ trợ": [
    { label: "Hướng dẫn chọn size", href: "#size-guide" },
    { label: "Chính sách đổi trả", href: "#return" },
    { label: "Câu hỏi thường gặp", href: "#faq" },
    { label: "Liên hệ", href: "#contact" },
  ],
  "Về chúng tôi": [
    { label: "Giới thiệu", href: "#about" },
    { label: "Blog cosplay", href: "#blog" },
    { label: "Sự kiện", href: "#events" },
    { label: "Tuyển dụng", href: "#careers" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold text-background">
                cosplay<span className="text-primary">.vn</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-background/60">
              Nền tảng cosplay hàng đầu Việt Nam: mua, thuê và đặt may trang
              phục chất lượng cao.
            </p>
            <div className="mt-4 flex gap-3">
              {[
                { icon: SiFacebook, label: "Facebook" },
                { icon: SiInstagram, label: "Instagram" },
                { icon: SiYoutube, label: "Youtube" },
              ].map(({ icon: Icon, label }) => (
                <Link
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-background/20"
                >
                  <Icon />
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-3 text-sm font-semibold text-background">
                {title}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-background/60 transition-colors hover:text-background"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-background/10" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-background/50 md:flex-row">
          <p>© 2026 cosplay.vn — Bản quyền thuộc về cosplay.vn</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-background">
              Chính sách bảo mật
            </Link>
            <Link href="#" className="hover:text-background">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
