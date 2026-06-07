"use client"

import { useState } from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className="bg-muted/20 py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-foreground md:text-2xl">
              Ưu đãi chỉ dành cho người đăng ký
            </h2>
            <p className="text-sm text-muted-foreground">
              Bộ sưu tập mới, khuyến mãi và sự kiện cosplay, thẳng vào hộp thư.
            </p>
          </div>

          {submitted ? (
            <div className="flex w-full max-w-sm shrink-0 items-center gap-3 rounded-xl bg-brand-subtle px-5 py-3.5">
              <CheckCircle2 className="size-5 shrink-0 text-brand-subtle-foreground" />
              <div>
                <p className="text-sm font-semibold text-brand-subtle-foreground">
                  Đăng ký thành công!
                </p>
                <p className="text-xs text-brand-subtle-foreground/70">
                  Chúng tôi sẽ gửi ưu đãi đến {email}
                </p>
              </div>
            </div>
          ) : (
            <form
              className="flex w-full max-w-sm shrink-0 gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (email) setSubmitted(true)
              }}
            >
              <Field className="flex-1">
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Địa chỉ email"
                />
              </Field>
              <Button type="submit" className="shrink-0 rounded-full">
                Đăng ký
                <ArrowRight data-icon="inline-end" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
