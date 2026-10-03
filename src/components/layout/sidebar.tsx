"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Inbox, CalendarDays, CalendarRange, CheckCircle2, Calendar, FolderKanban, Settings,
  ChevronLeft, ChevronRight, Plus, CheckSquare, LogOut, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/components/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ProjectDialog } from "@/components/projects/project-dialog";

const NAV = [
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/upcoming", label: "Upcoming", icon: CalendarRange },
  { href: "/completed", label: "Completed", icon: CheckCircle2 },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const pathname = usePathname();
  const { projects, tasks, setSearchOpen, setPaletteOpen } = useWorkspace();
  const router = useRouter();

  const countFor = (href: string) => {
    const open = tasks.filter((t) => !t.completed);
    if (href === "/inbox") return open.length;
    if (href === "/today") return open.filter((t) => t.due_date === new Date().toISOString().slice(0, 10)).length;
    return undefined;
  };

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "hidden md:flex h-screen flex-col border-r border-border bg-surface transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <div className={cn("flex items-center gap-2 px-4 py-4", collapsed && "justify-center px-0")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink">
          <CheckSquare className="h-4.5 w-4.5" />
        </div>
        {!collapsed && <span className="text-[15px] font-semibold">TaskFlow</span>}
      </div>

      <div className={cn("px-3", collapsed && "px-2")}>
        <button
          onClick={() => setPaletteOpen(true)}
          className={cn(
            "mb-1 flex w-full items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-muted hover:text-ink",
            collapsed && "justify-center px-0"
          )}
        >
          <Search className="h-4 w-4" />
          {!collapsed && <span className="flex-1 text-left">Search</span>}
          {!collapsed && <kbd className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-muted">⌘K</kbd>}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            const count = countFor(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                    active ? "bg-accent/10 text-accent font-medium" : "text-ink hover:bg-surface-2",
                    collapsed && "justify-center px-0"
                  )}
                  title={collapsed ? label : undefined}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {!collapsed && <span className="flex-1">{label}</span>}
                  {!collapsed && !!count && <span className="text-xs text-muted">{count}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {!collapsed && (
          <div className="mt-6">
            <div className="mb-1 flex items-center justify-between px-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">Projects</span>
              <button onClick={() => setNewProjectOpen(true)} className="rounded-md p-0.5 text-muted hover:bg-surface-2 hover:text-ink">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="space-y-0.5">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-sm hover:bg-surface-2",
                      pathname === `/projects/${p.id}` && "bg-accent/10 text-accent font-medium"
                    )}
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="truncate">{p.name}</span>
                  </Link>
                </li>
              ))}
              {projects.length === 0 && <li className="px-3 py-1 text-xs text-muted">No projects yet</li>}
            </ul>
          </div>
        )}
      </nav>

      <div className={cn("border-t border-border p-3 space-y-0.5", collapsed && "px-2")}>
        <Link
          href="/settings"
          className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink hover:bg-surface-2", collapsed && "justify-center px-0")}
        >
          <Settings className="h-4.5 w-4.5" />
          {!collapsed && "Settings"}
        </Link>
        <button
          onClick={signOut}
          className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-ink", collapsed && "justify-center px-0")}
        >
          <LogOut className="h-4.5 w-4.5" />
          {!collapsed && "Sign out"}
        </button>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-ink", collapsed && "justify-center px-0")}
        >
          {collapsed ? <ChevronRight className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
          {!collapsed && "Collapse"}
        </button>
      </div>

      <ProjectDialog open={newProjectOpen} onOpenChange={setNewProjectOpen} />
    </aside>
  );
}
