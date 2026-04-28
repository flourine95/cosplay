import type { ReactNode } from "react"
import Link from "next/link"
import { LuArrowLeft, LuCheck } from "react-icons/lu"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type AuthShellProps = {
  badge: string
  title: string
  description: string
  highlights: string[]
  stats: Array<{ value: string; label: string }>
  panelLabel: string
  panelTitle: string
  panelDescription: string
  children: ReactNode
  footer: ReactNode
  backHref?: string
  backLabel?: string
}

export function AuthShell({
  badge,
  title,
  description,
  highlights,
  stats,
  panelLabel,
  panelTitle,
  panelDescription,
  children,
  footer,
  backHref = "/",
  backLabel = "Về trang chủ",
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(249,250,251,0.96))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_34%),linear-gradient(180deg,_rgba(10,11,16,0.98),_rgba(17,24,39,0.95))]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" />
        <div className="absolute top-24 right-[-6rem] h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 md:px-6 lg:py-12">
        <div className="grid w-full gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
          <section className="flex flex-col justify-between rounded-[2rem] border border-border/70 bg-background/80 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur md:p-8 lg:min-h-[min(86vh,54rem)] lg:p-10">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-foreground">
                  cosplay<span className="text-primary">.vn</span>
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                asChild
              >
                <Link href={backHref}>
                  <LuArrowLeft data-icon="inline-start" />
                  {backLabel}
                </Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-1 flex-col justify-center gap-8 lg:mt-0">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full px-3 py-1 text-xs tracking-wide uppercase">
                  {badge}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Đồng bộ với hệ màu chủ đạo của Cosplay.vn
                </span>
              </div>

              <div className="max-w-xl space-y-5">
                <h1 className="text-4xl leading-[1.05] font-black tracking-tight text-foreground md:text-5xl lg:text-6xl">
                  {title}
                </h1>
                <p className="max-w-lg text-base leading-7 text-muted-foreground md:text-lg">
                  {description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/80 p-4"
                  >
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                      <LuCheck className="size-4" />
                    </span>
                    <p className="text-sm leading-6 text-foreground/90">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <Card
                    key={stat.label}
                    className="border-border/70 bg-card/90 shadow-none"
                  >
                    <CardContent className="space-y-1 py-4">
                      <div className="text-2xl font-black tracking-tight text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-border/70 bg-card/80 p-5 md:p-6">
              <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                {panelLabel}
              </p>
              <div className="mt-2 flex flex-col gap-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  {panelTitle}
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  {panelDescription}
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center">
            <Card className="w-full border-border/70 bg-background/90 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.5)] backdrop-blur">
              <CardContent className="space-y-6 p-6 md:p-8">
                {children}
                {footer}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  )
}
