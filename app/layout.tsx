import { Be_Vietnam_Pro as BeVietnamPro } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/lib/cart-context"
import { cn } from "@/lib/utils"
import "./globals.css"

const beVietnamPro = BeVietnamPro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={cn("font-sans antialiased", beVietnamPro.variable)}
    >
      <body>
        <ThemeProvider>
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
