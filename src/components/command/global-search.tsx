"use client";
import { useMemo, useState } from "react";
import { Command } from "cmdk";
import { Search as SearchIcon, CircleDot } from "lucide-react";
import { useWorkspace } from "@/components/workspace-context";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

/** Instant client-side search across title, description, project, tags and a few keywords
 *  ("today", "high priority", etc). Everything already lives in the workspace context, so this is free. */
export function GlobalSearch() {
  const { searchOpen, setSearchOpen, tasks, projects } = useWorkspace();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks.filter((t) => !t.completed).slice(0, 8);
    const todayStr = new Date().toISOString().slice(0, 10);
    return tasks
      .filter((t) => {
        if (q === "today") return t.due_date === todayStr;
        if (q === "high priority" || q === "high") return t.priority === "high";
        if (q === "completed" || q === "done") return t.completed;
        const project = projects.find((p) => p.id === t.project_id)?.name ?? "";
        const hay = `${t.title} ${t.description ?? ""} ${project} ${t.tags?.map((x) => x.name).join(" ") ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 20);
  }, [query, tasks, projects]);

  return (
    <Command.Dialog
      open={searchOpen}
      onOpenChange={(v) => { setSearchOpen(v); if (!v) setQuery(""); }}
      label="Search tasks"
      className="fixed left-1/2 top-[18%] z-50 w-[92vw] max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-slide-up max-md:left-3 max-md:right-3 max-md:top-[calc(env(safe-area-inset-top)+0.75rem)] max-md:w-auto max-md:max-w-none max-md:translate-x-0"
    >
      <div className="flex items-center gap-2 border-b border-border px-3">
        <SearchIcon className="h-4 w-4 text-muted" />
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search tasks... try “today”, “high priority”"
          className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
      </div>
      <Command.List className="max-h-80 overflow-y-auto overscroll-contain p-2 max-md:max-h-[42dvh]">
        <Command.Empty className="py-6 text-center text-sm text-muted">No matching tasks.</Command.Empty>
        {results.map((t) => (
          <Command.Item
            key={t.id}
            onSelect={() => { setSearchOpen(false); router.push(t.project_id ? `/projects/${t.project_id}` : "/inbox"); }}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink aria-selected:bg-surface-2 max-md:min-h-11"
          >
            <CircleDot className={`h-3.5 w-3.5 shrink-0 ${t.completed ? "text-ok" : "text-muted"}`} />
            <span className={`flex-1 truncate ${t.completed ? "line-through text-muted" : ""}`}>{t.title}</span>
            {t.due_date && <span className="text-xs text-muted">{format(new Date(`${t.due_date}T00:00:00`), "MMM d")}</span>}
          </Command.Item>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}
