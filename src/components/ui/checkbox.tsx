"use client";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Checkbox({
  className,
  priority,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & { priority?: "none" | "low" | "medium" | "high" }) {
  const ring =
    priority === "high" ? "border-danger" : priority === "medium" ? "border-warn" : priority === "low" ? "border-ok" : "border-border";
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer h-[18px] w-[18px] shrink-0 rounded-md border-2 transition-colors",
        "data-[state=checked]:bg-accent data-[state=checked]:border-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        ring,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-accent-ink animate-check-pop">
        <Check className="h-3 w-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
