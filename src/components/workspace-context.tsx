"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Project, Tag, Task } from "@/types";
import { toggleComplete as toggleCompleteAction, deleteTask as deleteTaskAction } from "@/server/tasks";
import { toast } from "sonner";

type WorkspaceState = {
  tasks: Task[];
  projects: Project[];
  tags: Tag[];
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
  quickAddOpen: boolean;
  setQuickAddOpen: (v: boolean) => void;
  quickAddProjectId: string | null;
  openQuickAdd: (projectId?: string | null) => void;
  toggleComplete: (task: Task) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
};

const Ctx = createContext<WorkspaceState | null>(null);

export function WorkspaceProvider({
  initialTasks,
  projects,
  tags,
  children,
}: {
  initialTasks: Task[];
  projects: Project[];
  tags: Tag[];
  children: React.ReactNode;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [searchOpen, setSearchOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddProjectId, setQuickAddProjectId] = useState<string | null>(null);
  const openQuickAdd = (projectId: string | null = null) => { setQuickAddProjectId(projectId); setQuickAddOpen(true); };

  // Keep in sync whenever the server layout re-renders with fresh data (after a server action revalidates).
  useEffect(() => setTasks(initialTasks), [initialTasks]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (!typing && e.key === "/") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (!typing && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setQuickAddOpen(true);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setPaletteOpen(false);
        setQuickAddOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function toggleComplete(task: Task) {
    const next = !task.completed;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: next } : t)));
    try {
      await toggleCompleteAction(task.id, next);
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: !next } : t)));
      toast.error(err instanceof Error ? err.message : "Couldn't update that task");
    }
  }

  async function removeTask(id: string) {
    const prev = tasks;
    setTasks((p) => p.filter((t) => t.id !== id));
    try {
      await deleteTaskAction(id);
      toast.success("Task deleted");
    } catch (err) {
      setTasks(prev);
      toast.error(err instanceof Error ? err.message : "Couldn't delete that task");
    }
  }

  const value = useMemo(
    () => ({ tasks, projects, tags, searchOpen, setSearchOpen, paletteOpen, setPaletteOpen, quickAddOpen, setQuickAddOpen, quickAddProjectId, openQuickAdd, toggleComplete, removeTask }),
    [tasks, projects, tags, searchOpen, paletteOpen, quickAddOpen, quickAddProjectId]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
