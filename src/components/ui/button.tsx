import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-[510] whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-btn-primary hover:bg-accent",
        outline: "border border-primary text-primary bg-transparent hover:bg-primary/6",
        secondary: "border border-primary text-primary bg-transparent hover:bg-primary/6 dark:border-border dark:text-secondary-foreground dark:shadow-btn-secondary dark:hover:bg-primary/12",
        ghost: "hover:bg-muted hover:text-foreground text-muted-foreground rounded-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/85 rounded-full",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 min-w-[127px] px-5 text-[16px] font-[510] rounded-full",
        xs: "h-6 gap-1 rounded-sm px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1 rounded-full px-4 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-1.5 px-6 rounded-full text-base",
        icon: "size-9 rounded-md p-2",
        "icon-xs": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-11 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
