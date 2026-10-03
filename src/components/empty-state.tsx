import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon, title, description, actionLabel, onAction,
}: { icon: LucideIcon; title: string; description?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-muted">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-sm font-medium text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-sm text-muted">{description}</p>}
      {actionLabel && onAction && (
        <Button size="sm" variant="secondary" className="mt-4" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
