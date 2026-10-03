"use client";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/components/workspace-context";

export type SortKey = "manual" | "due" | "priority" | "created";

export function PageHeader({
  title, subtitle, sort, onSortChange,
}: { title: string; subtitle?: string; sort?: SortKey; onSortChange?: (s: SortKey) => void }) {
  const { setQuickAddOpen } = useWorkspace();
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg/80 px-5 py-4 backdrop-blur md:px-8">
      <div>
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {onSortChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm"><ArrowUpDown className="h-3.5 w-3.5" /> Sort</Button>
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
        <Button size="sm" onClick={() => setQuickAddOpen(true)}><Plus className="h-4 w-4" /> Add task</Button>
      </div>
    </div>
  );
}
