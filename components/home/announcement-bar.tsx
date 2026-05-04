export function AnnouncementBar() {
  return (
    <div className="bg-foreground py-2 text-center text-xs font-medium text-background">
      <span className="inline-flex items-center gap-2">
        Miễn phí vận chuyển cho đơn từ 500K. Nhập code{" "}
        <span className="rounded bg-background/15 px-1.5 py-0.5 font-bold tracking-wider text-background">
          COSPLAY10
        </span>{" "}
        giảm thêm 10%
      </span>
    </div>
  )
}
