export type SavedAddress = {
  id?: string
  name?: string
  phone?: string
  address?: string
  city?: string
  district?: string
  ward?: string
  isDefault?: boolean
}

export function parseSavedAddresses(value: unknown): SavedAddress[] {
  if (!value) return []

  if (Array.isArray(value)) {
    return value as SavedAddress[]
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? (parsed as SavedAddress[]) : []
    } catch {
      return []
    }
  }

  return []
}

export function getDefaultAddress(value: unknown): SavedAddress | null {
  const addresses = parseSavedAddresses(value)
  if (addresses.length === 0) return null

  return addresses.find((address) => address.isDefault) ?? addresses[0]
}
