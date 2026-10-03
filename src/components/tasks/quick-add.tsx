"use client";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { parseQuickAdd } from "@/lib/quick-add";
import { createTask } from "@/server/tasks";
import { resolveTagIds } from "@/server/tags";
import { useWorkspace } from "@/components/workspace-context";
import { CalendarDays, Flag, Folder, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Priority } from "@/types";

export function QuickAddDialog() {
  const { quickAddOpen, setQuickAddOpen, quickAddProjectId, projects } = useWorkspace();
  const [text, setText] = useState("");
  const [projectId, setProjectId] = useState<string>(quickAddProjectId ?? "none");

  // Re-sync the default project whenever the dialog is (re)opened from a different place.
  useMemo(() => { if (quickAddOpen) setProjectId(quickAddProjectId ?? "none"); }, [quickAddOpen, quickAddProjectId]);
  const [priority, setPriority] = useState<Priority>("none");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const parsed = useMemo(() => parseQuickAdd(text), [text]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const title = parsed.title || text.trim();
    if (!title) return;
    setSaving(true);
    try {
      const tagIds = await resolveTagIds(parsed.tagNames);
      await createTask({
        title,
        projectId: projectId === "none" ? null : projectId,
        priority: priority !== "none" ? priority : parsed.priority ?? "none",
        dueDate: dueDate || parsed.dueDate,
        tagIds,
      });
      toast.success("Task created");
      setText(""); setDueDate(""); setPriority("none"); setProjectId(quickAddProjectId ?? "none");
      setQuickAddOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create that task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
      <DialogContent>
        <DialogTitle>New task</DialogTitle>
        <form onSubmit={submit} className="mt-3 space-y-3">
          <Input
            autoFocus
            placeholder="Finish DSA assignment tomorrow #college !high"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {text && (parsed.dueDate || parsed.priority || parsed.tagNames.length > 0) && (
            <div className="flex flex-wrap gap-1.5 text-xs text-muted">
              {parsed.dueDate && <span className="rounded-md bg-surface-2 px-2 py-1">📅 {format(new Date(`${parsed.dueDate}T00:00:00`), "MMM d")}</span>}
              {parsed.priority && <span className="rounded-md bg-surface-2 px-2 py-1 capitalize">🚩 {parsed.priority}</span>}
              {parsed.tagNames.map((t) => <span key={t} className="rounded-md bg-surface-2 px-2 py-1">#{t}</span>)}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="w-auto min-w-[130px]"><Folder className="h-3.5 w-3.5 text-muted" /><SelectValue placeholder="Project" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger className="w-auto min-w-[110px]"><Flag className="h-3.5 w-3.5 text-muted" /><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex items-center">
              <CalendarDays className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9 rounded-xl border border-border bg-surface pl-8 pr-2 text-sm text-ink"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setQuickAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || !text.trim()}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Add task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
