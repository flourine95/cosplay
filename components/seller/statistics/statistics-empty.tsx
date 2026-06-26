export function StatisticsEmpty({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
      {text}
    </div>
  )
}
