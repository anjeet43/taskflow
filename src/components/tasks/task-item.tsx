"use client";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, isPast, isToday } from "date-fns";
import { GripVertical, Flag, ChevronDown, ChevronRight, Copy, Trash2, MoreHorizontal, FolderInput } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/components/workspace-context";
import { duplicateTask, moveTask } from "@/server/tasks";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { toast } from "sonner";

const PRIORITY_COLOR: Record<string, string> = { high: "text-danger", medium: "text-warn", low: "text-ok", none: "text-transparent" };

export function TaskItem({ task, showProject }: { task: Task; showProject?: boolean }) {
  const { toggleComplete, removeTask, projects } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const project = projects.find((p) => p.id === task.project_id);
  const subtasks = task.subtasks ?? [];
  const doneCount = subtasks.filter((s) => s.completed).length;
  const overdue = task.due_date && !task.completed && isPast(new Date(`${task.due_date}T23:59:59`)) && !isToday(new Date(`${task.due_date}T00:00:00`));

  async function onToggle() {
    if (!task.completed) {
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    }
    await toggleComplete(task);
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("group rounded-xl", isDragging && "opacity-50", flash && "task-complete-flash")}
    >
      <div className="flex items-start gap-2 px-2 py-2.5">
        <button {...attributes} {...listeners} className="mt-1 cursor-grab touch-none text-border opacity-0 group-hover:opacity-100 active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </button>

        {subtasks.length > 0 ? (
          <button onClick={() => setOpen((v) => !v)} className="mt-0.5 text-muted">
            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="w-3.5" />
        )}

        <Checkbox checked={task.completed} onCheckedChange={onToggle} priority={task.priority} className="mt-0.5" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("truncate text-sm", task.completed && "text-muted line-through")}>{task.title}</span>
            {task.priority !== "none" && <Flag className={cn("h-3 w-3 shrink-0", PRIORITY_COLOR[task.priority])} fill="currentColor" />}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {task.due_date && (
              <Badge className={cn("bg-surface-2 text-muted", overdue && "bg-danger/10 text-danger")}>
                {format(new Date(`${task.due_date}T00:00:00`), "MMM d")}
              </Badge>
            )}
            {showProject && project && (
              <Badge style={{ backgroundColor: `${project.color}1a`, color: project.color }}>{project.name}</Badge>
            )}
            {task.tags?.map((t) => (
              <Badge key={t.id} style={{ backgroundColor: `${t.color}1a`, color: t.color }}>#{t.name}</Badge>
            ))}
            {subtasks.length > 0 && <span className="text-xs text-muted">{doneCount}/{subtasks.length}</span>}
            {task.recurrence && <Badge className="bg-surface-2 text-muted">↻ {task.recurrence}</Badge>}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-lg p-1 text-muted opacity-0 group-hover:opacity-100 hover:bg-surface-2 hover:text-ink">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={async () => { await duplicateTask(task.id); toast.success("Task duplicated"); }}>
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-ink outline-none focus:bg-surface-2">
                <FolderInput className="h-3.5 w-3.5" /> Move to…
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => moveTask(task.id, null)}>No project</DropdownMenuItem>
                {projects.map((p) => (
                  <DropdownMenuItem key={p.id} onSelect={() => moveTask(task.id, p.id)}>{p.name}</DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => removeTask(task.id)} className="text-danger focus:bg-danger/10">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {open && subtasks.length > 0 && (
        <div className="ml-10 space-y-0.5 border-l border-border pl-3">
          {subtasks.map((s) => (
            <div key={s.id} className="flex items-center gap-2 py-1.5">
              <Checkbox checked={s.completed} onCheckedChange={() => toggleComplete(s)} priority={s.priority} />
              <span className={cn("text-sm", s.completed && "text-muted line-through")}>{s.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
