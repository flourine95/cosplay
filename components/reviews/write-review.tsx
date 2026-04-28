"use client"

import { useState } from "react"
import { Star, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { updateProductRating } from "@/lib/products"

interface WriteReviewProps {
  productSlug: string
  productName: string
  onReviewAdded?: () => void
}

export function WriteReview({
  productSlug,
  productName,
  onReviewAdded,
}: WriteReviewProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      toast.error("Chỉ được tải lên tối đa 5 ảnh")
      return
    }
    setImages((prev) => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error("Vui lòng chọn số sao")
      return
    }

    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề đánh giá")
      return
    }

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá")
      return
    }

    setIsSubmitting(true)

    try {
      // Convert images to URLs (in real app, upload to server)
      images.map(
        () =>
          "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=300&fit=crop"
      )
      // Update product rating
      updateProductRating(productSlug)

      toast.success("Đánh giá của bạn đã được gửi thành công!")

      // Reset form
      setRating(0)
      setTitle("")
      setComment("")
      setImages([])

      // Notify parent component
      onReviewAdded?.()

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Viết đánh giá cho {productName}
          </h3>
          <p className="text-sm text-muted-foreground">
            Chia sẻ trải nghiệm của bạn để giúp người khác quyết định
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <Label className="mb-2 block text-sm font-semibold text-foreground">
              Đánh giá của bạn *
            </Label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-colors"
                >
                  <Star
                    className={`size-8 ${
                      i < (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-border hover:text-amber-400"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                {rating} sao -{" "}
                {rating === 5
                  ? "Xuất sắc"
                  : rating === 4
                    ? "Tốt"
                    : rating === 3
                      ? "Trung bình"
                      : rating === 2
                        ? "Kém"
                        : "Rất kém"}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <Label
              htmlFor="title"
              className="text-sm font-semibold text-foreground"
            >
              Tiêu đề đánh giá *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tóm tắt trải nghiệm của bạn"
              className="mt-1"
              maxLength={100}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {title.length}/100 ký tự
            </p>
          </div>

          {/* Comment */}
          <div>
            <Label
              htmlFor="comment"
              className="text-sm font-semibold text-foreground"
            >
              Nội dung đánh giá *
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Hãy chia sẻ chi tiết về sản phẩm, chất lượng, trải nghiệm sử dụng..."
              className="mt-1 min-h-[120px]"
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {comment.length}/1000 ký tự
            </p>
          </div>

          {/* Images */}
          <div>
            <Label className="mb-2 block text-sm font-semibold text-foreground">
              Hình ảnh (tùy chọn)
            </Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="mr-2 size-4" />
                      Chọn ảnh
                    </span>
                  </Button>
                </Label>
                <span className="text-xs text-muted-foreground">
                  Tối đa 5 ảnh, mỗi ảnh dưới 5MB
                </span>
              </div>

              {/* Image preview */}
              {images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="size-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </form>
      </div>
    </Card>
  )
}
