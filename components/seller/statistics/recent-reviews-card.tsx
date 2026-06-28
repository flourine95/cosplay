import { Star, ThumbsUp } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatisticsEmpty } from "./statistics-empty"
import type { StatisticsData } from "./statistics-types"

export function RecentReviewsCard({
  reviews,
}: {
  reviews: StatisticsData["recentReviews"]
}) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <ThumbsUp className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle>Đánh giá gần đây</CardTitle>
            <p className="text-sm text-muted-foreground">
              Phản hồi mới nhất từ khách hàng.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {reviews.length === 0 ? (
          <StatisticsEmpty text="Chưa có đánh giá nào." />
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-border/60 p-4"
            >
              <div className="flex items-start gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={review.avatar ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {review.customer.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{review.customer}</p>
                      <p className="text-xs text-muted-foreground">
                        {review.product}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star
                          key={index}
                          className="size-4 fill-primary text-primary"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{review.comment}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
