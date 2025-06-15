"use client"

import * as React from "react"
import * as RadixToast from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Provider + Viewport รวมในไฟล์นี้เลย
export const ToastProvider = RadixToast.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof RadixToast.Viewport>,
  React.ComponentPropsWithoutRef<typeof RadixToast.Viewport>
>(({ className, ...props }, ref) => (
  <RadixToast.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = RadixToast.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all " +
    "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] " +
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out " +
    "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full sm:data-[state=open]:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export const Toast = React.forwardRef<
  React.ElementRef<typeof RadixToast.Root>,
  React.ComponentPropsWithoutRef<typeof RadixToast.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <RadixToast.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
))
Toast.displayName = RadixToast.Root.displayName

export const ToastTitle = React.forwardRef<React.ElementRef<typeof RadixToast.Title>, React.ComponentPropsWithoutRef<typeof RadixToast.Title>>(
  ({ className, ...props }, ref) => (
    <RadixToast.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
  )
)
ToastTitle.displayName = RadixToast.Title.displayName

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof RadixToast.Description>,
  React.ComponentPropsWithoutRef<typeof RadixToast.Description>
>(({ className, ...props }, ref) => (
  <RadixToast.Description ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
))
ToastDescription.displayName = RadixToast.Description.displayName

export const ToastAction = React.forwardRef<React.ElementRef<typeof RadixToast.Action>, React.ComponentPropsWithoutRef<typeof RadixToast.Action>>(
  ({ className, ...props }, ref) => (
    <RadixToast.Action
      ref={ref}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium " +
          "ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 " +
          "disabled:opacity-50 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground",
        className
      )}
      {...props}
    />
  )
)
ToastAction.displayName = RadixToast.Action.displayName

export const ToastClose = React.forwardRef<React.ElementRef<typeof RadixToast.Close>, React.ComponentPropsWithoutRef<typeof RadixToast.Close>>(
  ({ className, ...props }, ref) => (
    <RadixToast.Close
      ref={ref}
      className={cn(
        "absolute right-2 top-2 p-1 text-foreground/50 hover:text-foreground focus:outline-none focus:text-foreground opacity-0 transition-opacity group-hover:opacity-100",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
    </RadixToast.Close>
  )
)
ToastClose.displayName = RadixToast.Close.displayName
