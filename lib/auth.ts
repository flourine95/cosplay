import bcrypt from "bcryptjs"
import { cache } from "react"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import type { User } from "@/app/generated/prisma/client"

const SESSION_COOKIE = "session_id"
const SESSION_DURATION_DAYS = 30

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: number): Promise<string> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)

  const session = await prisma.session.create({
    data: { userId, expiresAt },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return session.id
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value

  if (sessionId) {
    await prisma.session.deleteMany({ where: { id: sessionId } })
    cookieStore.delete(SESSION_COOKIE)
  }
}

export const getSession = cache(
  async (): Promise<(User & { sessionId: string }) | null> => {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value
    if (!sessionId) return null

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.session.delete({ where: { id: sessionId } })
      cookieStore.delete(SESSION_COOKIE)
      return null
    }

    return { ...session.user, sessionId: session.id }
  }
)

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSession>>>

export function sanitizeUser(user: User) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safe } = user
  return safe
}
