import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnnouncementBar } from "@/components/home/announcement-bar"
import { Navbar } from "@/components/home/navbar"
import { Newsletter } from "@/components/home/newsletter"
import { Footer } from "@/components/home/footer"
import { formatPrice } from "@/lib/utils"
import {
  recentOrders,
  services,
  mobileCats,
  rentalItems,
  customOrderSteps,
  reviews,
} from "@/lib/data/home"
import { Featured } from "@/components/home/featured"
import { StarRating } from "@/components/common/star-rating"

export default function Page() {
  const firstService = services[0]!
  const firstReview = reviews[0]!
  return (
    <main className="min-h-screen">
      <AnnouncementBar />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="relative min-h-[92vh] lg:min-h-[88vh]">
          <div className="absolute inset-y-0 right-0 w-full lg:w-[58%]">
            <Image
              src="https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1200&h=1600&fit=crop&crop=top"
              alt="Cosplay trang phục chất lượng cao"
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
            <div className="absolute inset-0 bg-linear-to-r from-background via-background/60 to-transparent lg:via-background/20" />
            <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent lg:hidden" />
          </div>
          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 py-24 md:px-6 lg:py-0">
            <div className="flex min-h-[92vh] flex-col justify-center lg:min-h-[88vh] lg:max-w-[52%]">
              <div className="mb-6 flex items-center gap-2">
                <span className="h-px w-8 bg-primary" />
                <span className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">
                  Nền tảng cosplay Việt Nam
                </span>
              </div>
              <h1 className="text-[clamp(2.75rem,7vw,5rem)] leading-[1.02] font-extrabold tracking-tight text-foreground">
                Hóa thân thành <span className="text-primary">nhân vật</span>{" "}
                bạn yêu thích
              </h1>
              <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
                Mua, thuê hoặc đặt may trang phục cosplay chất lượng cao. Hơn
                500 bộ từ anime, game, phim, giao toàn quốc.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" className="rounded-full px-8" asChild>
                  <Link href="/products">
                    Khám phá ngay <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8"
                  asChild
                >
                  <Link href="/rental/1">Xem trang phục thuê</Link>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Giao toàn quốc",
                  "Đổi trả 7 ngày",
                  "Hàng chính hãng",
                  "10.000+ đơn",
                ].map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="rounded-full px-3.5 py-1.5 text-sm font-medium"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 pt-8">
                <Separator className="col-span-3" />
                {[
                  { value: "500+", label: "Trang phục" },
                  { value: "10K+", label: "Đơn hàng" },
                  { value: "4.9★", label: "Đánh giá" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-extrabold text-foreground">
                      {s.value}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6">
                <Separator className="mb-6" />
                <p className="mb-3 text-xs font-bold tracking-[0.15em] text-muted-foreground uppercase">
                  Vừa có đơn
                </p>
                <div className="flex flex-col gap-0">
                  {recentOrders.map((order, i) => (
                    <div
                      key={order.name}
                      className={`flex items-center justify-between py-3 ${i < recentOrders.length - 1 ? "border-b border-border/30" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="size-2 shrink-0 rounded-full bg-primary" />
                        <span className="text-sm font-semibold text-foreground">
                          {order.name}
                        </span>
                        <span className="hidden text-sm text-muted-foreground sm:inline">
                          {order.series}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden text-sm text-muted-foreground sm:inline">
                          {order.type}
                        </span>
                        <span className="shrink-0 text-sm text-muted-foreground">
                          {order.time} trước
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Services */}
      <section id="services" className="bg-muted/20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-12">
            <p className="mb-2 text-sm font-bold tracking-[0.12em] text-primary uppercase">
              Dịch vụ
            </p>
            <h2 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold tracking-tight text-foreground">
              Một nơi, ba cách sở hữu
            </h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-5 lg:grid-rows-2">
            <Link
              href={firstService.href}
              className="group relative min-h-120 overflow-hidden rounded-2xl lg:col-span-3 lg:row-span-2"
            >
              <Image
                src={firstService.image}
                alt={firstService.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <span className="mb-2 text-xs font-bold tracking-[0.15em] text-white/60 uppercase">
                  {firstService.label}
                </span>
                <h3 className="text-3xl font-extrabold text-white">
                  {firstService.title}
                </h3>
                <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-white/70">
                  {firstService.desc}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                    {firstService.detail}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {firstService.cta} <ArrowRight className="size-4" />
                  </span>
                </div>
              </div>
            </Link>
            {services.slice(1).map((s) => (
              <Link
                key={s.id}
                href={s.href}
                className="group relative min-h-57.5 overflow-hidden rounded-2xl lg:col-span-2"
              >
                <Image
                  src={s.image}
                  alt={s.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <span className="mb-1 text-[10px] font-bold tracking-[0.15em] text-white/60 uppercase">
                    {s.label}
                  </span>
                  <h3 className="text-xl font-extrabold text-white">
                    {s.title}
                  </h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-white">
                      {s.detail}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {s.cta} <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured — client component, kept separate */}
      <Featured />
      {/* Categories */}
      <section id="collections" className="bg-muted/20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold tracking-tight text-foreground">
              Khám phá theo thể loại
            </h2>
            <Link
              href="/products"
              className="hidden items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground md:flex"
            >
              Tất cả <ArrowRight className="size-4" />
            </Link>
          </div>
          {/* Mobile */}
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            {mobileCats.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                aria-label={`${cat.name} — ${cat.count}`}
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="50vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <h3 className="text-base font-extrabold text-white">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-white/70">{cat.count}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {/* Desktop */}
          <div className="hidden lg:flex lg:flex-col lg:gap-3">
            <div className="grid grid-cols-4 grid-rows-[280px] gap-3">
              <Link
                href="/products?category=anime"
                aria-label="Anime — 180+ bộ"
                className="group relative col-span-2 overflow-hidden rounded-2xl"
              >
                <Image
                  src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=560&fit=crop"
                  alt="Anime"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold text-white">
                        Anime
                      </h3>
                      <p className="text-sm text-white/70">180+ bộ</p>
                    </div>
                    <span className="flex size-8 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                      <ArrowRight className="size-4 text-white" />
                    </span>
                  </div>
                </div>
              </Link>
              {[
                {
                  href: "/products?category=game",
                  label: "Game — 120+ bộ",
                  src: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&h=560&fit=crop",
                  name: "Game",
                  count: "120+ bộ",
                },
                {
                  href: "/products?category=movie",
                  label: "Phim & Series — 90+ bộ",
                  src: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&h=560&fit=crop",
                  name: "Phim & Series",
                  count: "90+ bộ",
                },
              ].map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  aria-label={c.label}
                  className="group relative col-span-1 overflow-hidden rounded-2xl"
                >
                  <Image
                    src={c.src}
                    alt={c.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="25vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="text-lg font-extrabold text-white">
                          {c.name}
                        </h3>
                        <p className="text-sm text-white/70">{c.count}</p>
                      </div>
                      <span className="flex size-8 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                        <ArrowRight className="size-4 text-white" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="grid grid-cols-4 grid-rows-[220px] gap-3">
              <Link
                href="/products?category=fantasy"
                aria-label="Fantasy & Original — 60+ bộ"
                className="group relative col-span-2 overflow-hidden rounded-2xl"
              >
                <Image
                  src="https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&h=440&fit=crop"
                  alt="Fantasy & Original"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold text-white">
                        Fantasy & Original
                      </h3>
                      <p className="text-sm text-white/70">60+ bộ</p>
                    </div>
                    <span className="flex size-8 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                      <ArrowRight className="size-4 text-white" />
                    </span>
                  </div>
                </div>
              </Link>
              {[
                {
                  href: "/products?category=accessories",
                  label: "Phụ kiện — 200+ món",
                  src: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=440&fit=crop&crop=top",
                  name: "Phụ kiện",
                  count: "200+ món",
                },
                {
                  href: "/custom-order",
                  label: "Đặt may theo yêu cầu",
                  src: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&h=440&fit=crop&crop=top",
                  name: "Đặt may",
                  count: "Theo yêu cầu",
                },
              ].map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  aria-label={c.label}
                  className="group relative col-span-1 overflow-hidden rounded-2xl"
                >
                  <Image
                    src={c.src}
                    alt={c.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="25vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="text-lg font-extrabold text-white">
                          {c.name}
                        </h3>
                        <p className="text-sm text-white/70">{c.count}</p>
                      </div>
                      <span className="flex size-8 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                        <ArrowRight className="size-4 text-white" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Rent */}
      <section id="rent" className="bg-background py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid items-center gap-10 gap-y-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col gap-6">
              <h2 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold tracking-tight text-foreground">
                Thuê thay vì mua, tiết kiệm thật sự
              </h2>
              <p className="max-w-[52ch] text-muted-foreground">
                Không cần bỏ ra cả triệu để mua một bộ chỉ mặc vài lần. Thuê
                trang phục chất lượng cao với giá hợp lý, phù hợp cho mọi sự
                kiện.
              </p>
              <div className="grid grid-cols-3 gap-4 py-6">
                <Separator className="col-span-3" />
                {[
                  { value: "500+", label: "Bộ sẵn thuê", hint: null },
                  { value: "99K", label: "Từ/ngày", hint: null },
                  {
                    value: "30%",
                    label: "Đặt cọc",
                    hint: "Hoàn lại khi trả đúng hạn",
                  },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-extrabold text-foreground">
                      {s.value}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {s.label}
                    </p>
                    {s.hint && (
                      <p className="mt-0.5 text-xs text-muted-foreground/60">
                        {s.hint}
                      </p>
                    )}
                  </div>
                ))}
                <Separator className="col-span-3" />
              </div>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                {[
                  "Thuê theo ngày, tuần hoặc tháng",
                  "Vệ sinh, kiểm tra trước khi giao",
                  "Hỗ trợ đổi size nếu không vừa",
                  "Giao nhận tận nơi tại TP.HCM & Hà Nội",
                ].map((b) => (
                  <li key={b} className="flex items-center gap-2.5">
                    <span className="size-1 shrink-0 rounded-full bg-primary" />
                    {b}
                  </li>
                ))}
              </ul>
              <Button size="lg" className="w-fit rounded-full" asChild>
                <Link href="/rental/1">
                  Xem trang phục cho thuê <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {rentalItems.map((item) => (
                <div
                  key={item.name}
                  className="relative aspect-3/4 overflow-hidden rounded-xl"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute right-3 bottom-3 left-3">
                    <p className="text-xs font-medium text-white/70">
                      {item.series}
                    </p>
                    <p className="text-sm font-bold text-white">{item.name}</p>
                    <p className="mt-0.5 text-xs font-semibold text-primary">
                      {formatPrice(item.price)}/ngày
                    </p>
                  </div>
                  {!item.available && (
                    <Badge
                      variant="secondary"
                      className="absolute top-3 right-3 rounded-full"
                    >
                      Đã thuê
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Custom Order */}
      <section id="custom" className="bg-muted/20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold tracking-tight text-foreground">
                Không tìm được? Chúng tôi may cho bạn
              </h2>
              <p className="mt-3 text-muted-foreground">
                Từ anime, game đến original design — theo đúng số đo và thiết kế
                bạn muốn.
              </p>
            </div>
            <Button
              size="lg"
              className="w-fit shrink-0 rounded-full px-8"
              asChild
            >
              <Link href="/custom-order">
                Đặt may ngay <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="relative">
            <div className="absolute top-6 right-0 left-0 hidden h-px bg-border md:block" />
            <div className="grid gap-8 md:grid-cols-4">
              {customOrderSteps.map((step) => (
                <div key={step.number} className="relative flex flex-col gap-4">
                  <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background">
                    <span className="text-sm font-extrabold text-foreground">
                      {step.number}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {step.title}
                      </h3>
                      {step.time && (
                        <Badge variant="secondary" className="rounded-full">
                          {step.time}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-14 pt-8">
            <Separator className="mb-8" />
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {[
                "Thợ may chuyên nghiệp 10+ năm kinh nghiệm",
                "Cập nhật tiến độ qua Zalo mỗi ngày",
                "Hoàn tiền nếu không đúng yêu cầu",
                "Giao toàn quốc, đóng gói cẩn thận",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="size-1 shrink-0 rounded-full bg-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Social Proof */}
      <section className="bg-background py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-12">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold tracking-tight text-foreground">
                  10.000+ khách hàng đã tin tưởng
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Cosplayer khắp Việt Nam — mua, thuê, đặt may.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StarRating rating={5} size="md" />
                <span className="text-lg font-extrabold text-foreground">
                  4.9
                </span>
                <span className="text-sm text-muted-foreground">
                  / 5 &nbsp;·&nbsp; 2.400+ đánh giá
                </span>
              </div>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="flex flex-col justify-between gap-6 rounded-2xl bg-foreground p-8 text-background lg:row-span-2">
              <div className="flex flex-col gap-4">
                <StarRating rating={firstReview.rating} size="md" />
                <p className="text-xl leading-relaxed font-medium text-background/90">
                  &ldquo;{firstReview.comment}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-background/10 pt-5">
                <Avatar className="size-10">
                  <AvatarImage
                    src={firstReview.avatar}
                    alt={firstReview.name}
                  />
                  <AvatarFallback className="bg-background/20 text-background">
                    {firstReview.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-background">
                    {firstReview.name}
                  </p>
                  <p className="text-xs text-background/50">
                    {firstReview.service}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
              {reviews.slice(1).map((review) => (
                <div
                  key={review.name}
                  className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/20 p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        <AvatarImage src={review.avatar} alt={review.name} />
                        <AvatarFallback>{review.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {review.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {review.service}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-8 rounded-2xl border border-border/60 px-6 py-4 lg:col-span-2">
              <p className="shrink-0 text-sm font-semibold text-muted-foreground">
                Được đánh giá trên
              </p>
              <div className="flex items-center gap-8">
                {[
                  { name: "Google", score: "4.9" },
                  { name: "Facebook", score: "4.8" },
                  { name: "Shopee", score: "4.9" },
                ].map((p) => (
                  <div key={p.name} className="flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-foreground">
                      {p.score}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </main>
  )
}
