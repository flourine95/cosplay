"use client"

import { useState } from "react"
import { Star, MessageSquare, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ReviewItem } from "./review-item"
import { WriteReview } from "./write-review"
import { getProductReviews } from "@/lib/products"
import type { Product } from "@/lib/products"

interface ProductReviewsProps {
  product: Product
}

export function ProductReviews({ product }: ProductReviewsProps) {
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [reviews, setReviews] = useState(() => getProductReviews(product.slug))

  const refreshReviews = () => {
    setReviews(getProductReviews(product.slug))
    setShowWriteReview(false)
  }

  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(
    (rating) => reviews.filter((review) => review.rating === rating).length
  )

  const totalReviews = reviews.length
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0

  return (
    <div className="space-y-8">
      {/* Reviews header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Đánh giá sản phẩm
          </h2>
          <p className="mt-1 text-muted-foreground">
            {totalReviews} đánh giá • {averageRating.toFixed(1)} sao trung bình
          </p>
        </div>

        <Button
          onClick={() => setShowWriteReview(!showWriteReview)}
          variant="outline"
          size="sm"
          className="rounded-full"
        >
          {showWriteReview ? (
            <>
              <MessageSquare className="mr-2 size-4" />
              Hủy
            </>
          ) : (
            <>
              <Plus className="mr-2 size-4" />
              Viết đánh giá
            </>
          )}
        </Button>
      </div>

      {/* Rating overview */}
      {totalReviews > 0 && (
        <Card className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Average rating */}
            <div className="text-center md:text-left">
              <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
                <span className="text-4xl font-bold text-foreground">
                  {averageRating.toFixed(1)}
                </span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-5 ${
                        i < Math.floor(averageRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground">
                Dựa trên {totalReviews} đánh giá
              </p>
            </div>

            {/* Rating distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating, index) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="w-8 text-sm font-medium">{rating}</span>
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-amber-400"
                      style={{
                        width:
                          totalReviews > 0
                            ? `${((ratingCounts[index] ?? 0) / totalReviews) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <span className="w-8 text-sm text-muted-foreground">
                    {ratingCounts[index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Write review form */}
      {showWriteReview && (
        <WriteReview
          productSlug={product.slug}
          productName={product.name}
          onReviewAdded={refreshReviews}
        />
      )}

      {/* Reviews list */}
      {totalReviews > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5" />
            <h3 className="text-lg font-semibold text-foreground">
              Tất cả đánh giá ({totalReviews})
            </h3>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center">
          <MessageSquare className="mx-auto mb-4 size-12 text-muted-foreground/50" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Chưa có đánh giá nào
          </h3>
          <p className="mb-4 text-muted-foreground">
            Hãy là người đầu tiên đánh giá sản phẩm này
          </p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setShowWriteReview(true)}
          >
            <Plus className="mr-2 size-4" />
            Viết đánh giá đầu tiên
          </Button>
        </Card>
      )}
    </div>
  )
}
