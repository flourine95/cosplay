import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"

type AuthShellProps = {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  imageLabel: string
  children: React.ReactNode
  className?: string
}

export function AuthShell({
  title,
  description,
  imageSrc,
  imageAlt,
  imageLabel,
  children,
  className,
}: AuthShellProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden bg-background",
        className
      )}
    >
      {/* ── Image: left side, full height, fades right into background ── */}
      <div className="absolute inset-y-0 left-0 hidden w-full lg:block lg:w-[72%]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover object-center"
          priority
          quality={90}
          sizes="(max-width: 1024px) 100vw, 72vw"
        />
        {/* Right-edge fade — ảnh chảy vào nền, không đường kẻ cứng */}
        <div className="absolute inset-0 bg-linear-to-l from-background via-background/10 to-transparent" />
        {/* Bottom fade */}
        <div className="absolute inset-0 bg-linear-to-t from-background/40 via-transparent to-transparent" />
      </div>

      {/* Mobile: ảnh làm background, fade xuống dưới */}
      <div className="absolute inset-0 lg:hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover object-center"
          priority
          quality={90}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/50 via-background/85 to-background" />
      </div>

      {/* ── Content layer ── */}
      <div className="relative flex min-h-screen flex-col lg:ml-auto lg:w-[42%]">
        {/* Top bar — padding khớp với form area */}
        <div className="flex items-center justify-between px-8 pt-8 sm:px-12 lg:px-14">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-foreground"
          >
            cosplay<span className="text-primary">.vn</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground hover:bg-muted/50"
          >
            <ArrowLeft className="size-3.5" />
            <span>Cửa hàng</span>
          </Link>
        </div>

        {/* Form — vertically centered */}
        <div className="flex flex-1 flex-col justify-center px-8 py-10 sm:px-12 lg:px-14">
          <div className="w-full max-w-[26rem]">
            <div className="mb-7">
              <p className="mb-3 text-[0.7rem] font-bold tracking-[0.15em] text-primary uppercase">
                {imageLabel}
              </p>
              <h1 className="text-[1.875rem] leading-[1.1] font-extrabold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>

            {children}
          </div>
        </div>

        <p className="px-8 pb-8 text-xs text-muted-foreground/50 sm:px-12 lg:px-14">
          © 2025 cosplay.vn
        </p>
      </div>
    </div>
  )
}
