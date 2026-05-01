import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AuthShellProps = {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  imageLabel: string
  imageTitle: string
  stats: Array<{ label: string; value: string }>
  children: React.ReactNode
  className?: string
}

export function AuthShell({
  title,
  description,
  imageSrc,
  imageAlt,
  imageLabel,
  imageTitle,
  stats,
  children,
  className,
}: AuthShellProps) {
  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,214,102,0.28)_0%,_rgba(255,255,255,0.94)_34%,_rgba(245,247,255,1)_62%,_rgba(255,250,242,1)_100%)] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div
        className={cn(
          "mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-border/70 bg-background/80 shadow-[0_32px_120px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:grid-cols-[1.02fr_0.98fr]",
          className
        )}
      >
        <div className="relative hidden min-h-[560px] overflow-hidden bg-[linear-gradient(180deg,rgba(24,20,46,0.18)_0%,rgba(51,38,86,0.08)_35%,rgba(255,246,232,0.94)_100%)] p-5 text-foreground lg:flex lg:flex-col lg:justify-between">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 56vw"
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,242,0.14)_0%,rgba(255,247,235,0.16)_38%,rgba(15,23,42,0.64)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,214,102,0.30),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(96,165,250,0.18),_transparent_30%)]" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="text-2xl font-semibold tracking-[0.18em] text-foreground uppercase"
            >
              cosplay.vn
            </Link>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-border/70 bg-background/85 text-foreground hover:bg-background"
            >
              <Link href="/">
                Quay về cửa hàng
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          <div className="relative z-10 flex max-w-xl flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-md">
              <Sparkles className="size-4 text-brand" />
              {imageLabel}
            </div>
            <div className="space-y-4">
              <h2 className="max-w-lg text-4xl leading-tight font-semibold tracking-tight text-foreground md:text-5xl">
                {imageTitle}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/70 bg-background/82 px-4 py-3 shadow-sm backdrop-blur-md"
                >
                  <div className="text-2xl font-semibold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center bg-background/90 px-5 py-8 sm:px-8 md:px-10 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex items-center justify-between gap-3 lg:hidden">
              <Link
                href="/"
                className="text-lg font-semibold tracking-[0.16em] text-foreground uppercase"
              >
                cosplay.vn
              </Link>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full border-border/70 bg-background/80"
              >
                <Link href="/">Quay về cửa hàng</Link>
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium tracking-[0.24em] text-brand uppercase">
                {imageLabel}
              </p>
              <h1 className="text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                {description}
              </p>
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-border/70 bg-card/96 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
