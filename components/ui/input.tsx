import * as React from "react"
import { cn } from "cn"

const fieldStyles =
  "w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input data-slot="input" className={cn(fieldStyles, "h-9", className)} {...props} />
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldStyles, "min-h-24 py-2", className)}
      {...props}
    />
  )
}

function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select data-slot="select" className={cn(fieldStyles, "h-9", className)} {...props} />
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn("grid gap-1.5 text-sm font-semibold", className)}>
      {label}
      {children}
    </label>
  )
}

export { Input, Textarea, Select, Field }
