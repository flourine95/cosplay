"use client"

import { useState } from "react"
import { Star, ThumbsUp, User, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import type { Review } from "@/lib/products"

interface ReviewItemProps {
  review: Review
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function ReviewItem({ review }: ReviewItemProps) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful)
  const [hasVoted, setHasVoted] = useState(false)

  const handleHelpful = () => {
    if (!hasVoted) {
      setHelpfulCount((prev) => prev + 1)
      setHasVoted(true)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar className="size-10">
            <AvatarImage src={review.userAvatar} alt={review.userName} />
            <AvatarFallback>
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {review.userName}
              </span>
              {review.verified && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="mr-1 size-3" />
                  Đã mua hàng
                </Badge>
              )}
            </div>

            <div className="mb-2 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Review content */}
        <div>
          <h4 className="mb-2 font-semibold text-foreground">{review.title}</h4>
          <p className="leading-relaxed text-muted-foreground">
            {review.comment}
          </p>
        </div>

        {/* Review images */}
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {review.images.map((image, index) => (
              <div
                key={index}
                className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
              >
                <Image
                  src={image}
                  alt={`Review image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHelpful}
            disabled={hasVoted}
            className="text-muted-foreground hover:text-foreground"
          >
            <ThumbsUp className="mr-2 size-4" />
            Hữu ích ({helpfulCount})
          </Button>

          <span className="text-xs text-muted-foreground">
            Đánh giá này có hữu ích với bạn không?
          </span>
        </div>
      </div>
    </Card>
  )
}
