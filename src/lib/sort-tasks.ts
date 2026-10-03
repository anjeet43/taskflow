import type { Task } from "@/types";
import type { SortKey } from "@/components/layout/page-header";

const PRIORITY_RANK = { high: 0, medium: 1, low: 2, none: 3 } as const;

export function sortTasks(tasks: Task[], sort: SortKey): Task[] {
  const copy = [...tasks];
  if (sort === "due") return copy.sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"));
  if (sort === "priority") return copy.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  if (sort === "created") return copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return copy.sort((a, b) => a.sort_order - b.sort_order);
}
