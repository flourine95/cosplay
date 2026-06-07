import { Suspense } from "react"
import { CustomOrderSuccess } from "@/components/custom-order/custom-order-success"

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomOrderSuccess />
    </Suspense>
  )
}
