import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  size?: "sm" | "md"
}

export function StarRating({ rating, size = "sm" }: StarRatingProps) {
  const cls = size === "md" ? "size-4" : "size-3"
  return (
    <div className="flex gap-0.5" aria-label={`${rating} trên 5 sao`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${cls} ${i < rating ? "fill-primary text-primary" : "text-border"}`}
        />
      ))}
    </div>
  )
}
