"use client";
import * as DM from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = DM.Root;
export const DropdownMenuTrigger = DM.Trigger;
export const DropdownMenuSub = DM.Sub;
export const DropdownMenuSubTrigger = DM.SubTrigger;

export function DropdownMenuContent({ className, ...props }: React.ComponentProps<typeof DM.Content>) {
  return (
    <DM.Portal>
      <DM.Content
        sideOffset={6}
        className={cn(
          "z-50 min-w-[180px] overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-xl animate-fade-in",
          className
        )}
        {...props}
      />
    </DM.Portal>
  );
}
export function DropdownMenuSubContent({ className, ...props }: React.ComponentProps<typeof DM.SubContent>) {
  return (
    <DM.Portal>
      <DM.SubContent className={cn("z-50 min-w-[160px] rounded-xl border border-border bg-surface p-1 shadow-xl", className)} {...props} />
    </DM.Portal>
  );
}
export function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof DM.Item>) {
  return (
    <DM.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-ink outline-none max-md:min-h-11 max-md:py-2.5",
        "focus:bg-surface-2 data-[disabled]:opacity-50",
        className
      )}
      {...props}
    />
  );
}
export const DropdownMenuSeparator = ({ className, ...props }: React.ComponentProps<typeof DM.Separator>) => (
  <DM.Separator className={cn("my-1 h-px bg-border", className)} {...props} />
);
export const DropdownMenuLabel = ({ className, ...props }: React.ComponentProps<typeof DM.Label>) => (
  <DM.Label className={cn("px-2.5 py-1 text-xs font-medium text-muted", className)} {...props} />
);
