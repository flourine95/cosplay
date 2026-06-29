import type { SessionUser } from "@/lib/auth"

const placeholderValues = new Set([
  "Chưa cập nhật",
  "Địa chỉ shop chưa cập nhật",
  "Chua cap nhat",
  "Dia chi shop chua cap nhat",
])

const hasValue = (value: string | null | undefined) => {
  const normalized = value?.trim()
  return Boolean(normalized) && !placeholderValues.has(normalized!)
}

const requiredSellerProductProfileFields: Array<{
  key: keyof SessionUser
  label: string
}> = [
  { key: "name", label: "Tên người đại diện" },
  { key: "phone", label: "Số điện thoại" },
  { key: "shopName", label: "Tên shop" },
  { key: "shopDescription", label: "Mô tả shop" },
  { key: "shopReturnName", label: "Tên người nhận đồ trả về" },
  { key: "shopReturnPhone", label: "Số điện thoại nhận đồ trả về" },
  { key: "shopReturnAddress", label: "Địa chỉ nhận đồ trả về" },
  { key: "shopReturnCity", label: "Tỉnh/Thành phố nhận đồ trả về" },
  { key: "shopReturnDistrict", label: "Quận/Huyện nhận đồ trả về" },
  { key: "shopReturnWard", label: "Phường/Xã nhận đồ trả về" },
  { key: "businessLicense", label: "Giấy phép kinh doanh" },
  { key: "taxCode", label: "Mã số thuế" },
  { key: "bankName", label: "Ngân hàng" },
  { key: "bankAccount", label: "Số tài khoản" },
  { key: "bankAccountName", label: "Tên chủ tài khoản" },
]

export function getMissingSellerProductProfileFields(seller: SessionUser) {
  return requiredSellerProductProfileFields
    .filter((field) => !hasValue(seller[field.key] as string | null))
    .map((field) => field.label)
}

export function getSellerProductProfileErrorMessage(missingFields: string[]) {
  return `Vui lòng cập nhật đầy đủ hồ sơ seller trước khi đăng bán sản phẩm: ${missingFields.join(", ")}.`
}
