"use client"

import Image from "next/image"
import { ImagePlus, Trash2, UploadCloud } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

type ProductImageFieldProps = {
  error?: string
  imageUrls: string[]
  isUploading: boolean
  onRemoveImage: (url: string) => void
  onUploadImages: (files: FileList | null) => void
}

export function ProductImageField({
  error,
  imageUrls,
  isUploading,
  onRemoveImage,
  onUploadImages,
}: ProductImageFieldProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Ảnh sản phẩm
          </h2>
          <p className="text-sm text-muted-foreground">
            Ảnh đầu tiên sẽ là ảnh đại diện trên marketplace.
          </p>
        </div>
        <Button type="button" variant="outline" disabled={isUploading}>
          <Label className="flex cursor-pointer items-center gap-2">
            {isUploading ? <Spinner /> : <ImagePlus data-icon="inline-start" />}
            Tải ảnh
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => onUploadImages(event.target.files)}
            />
          </Label>
        </Button>
      </div>

      {imageUrls.length === 0 ? (
        <Empty className="min-h-40 bg-muted/30">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UploadCloud />
            </EmptyMedia>
            <EmptyTitle>Chưa có ảnh sản phẩm</EmptyTitle>
            <EmptyDescription>
              Seller nên tải ít nhất 3 ảnh: mặt trước, chi tiết chất liệu và phụ
              kiện đi kèm.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {imageUrls.map((url, index) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-xl bg-muted"
            >
              <Image
                src={url}
                alt={`Ảnh sản phẩm ${index + 1}`}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
                onClick={() => onRemoveImage(url)}
                aria-label="Xóa ảnh"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
