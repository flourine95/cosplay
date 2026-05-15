import { createHash } from "crypto"

export const hashPassword = (password: string): string => {
  return createHash("sha256").update(password).digest("hex")
}

export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash
}
