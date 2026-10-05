"use client";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpDown, Search } from "lucide-react";
import { UserMenu } from "@/components/layout/user-menu";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/components/workspace-context";

export type SortKey = "manual" | "due" | "priority" | "created";

export function PageHeader({
  title, subtitle, sort, onSortChange,
}: { title: string; subtitle?: string; sort?: SortKey; onSortChange?: (s: SortKey) => void }) {
  const { setQuickAddOpen, setSearchOpen } = useWorkspace();
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-bg/80 px-5 py-4 backdrop-blur max-md:px-4 max-md:pb-3 max-md:pt-[calc(0.75rem+env(safe-area-inset-top))] md:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-ink">{title}</h1>
        {subtitle && <p className="truncate text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
        {/* Phone-only search button ("/" needs a physical keyboard). The command palette is in the avatar menu. */}
        <Button variant="ghost" size="icon" className="h-10 w-10 md:hidden" aria-label="Search" onClick={() => setSearchOpen(true)}>
          <Search className="h-[18px] w-[18px]" />
        </Button>
        {onSortChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="max-md:h-10 max-md:w-10 max-md:px-0" aria-label="Sort tasks">
                <ArrowUpDown className="h-3.5 w-3.5" /> <span className="max-md:sr-only">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {([["manual", "Manual order"], ["due", "Due date"], ["priority", "Priority"], ["created", "Created date"]] as const).map(([k, l]) => (
                <DropdownMenuItem key={k} onSelect={() => onSortChange(k)} className={sort === k ? "text-accent" : undefined}>{l}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {/* On phones the bottom-nav "+" button does this, so the text button is desktop/tablet only. */}
        <Button size="sm" className="max-md:hidden" onClick={() => setQuickAddOpen(true)}><Plus className="h-4 w-4" /> Add task</Button>
        <UserMenu />
      </div>
    </div>
  );
}
