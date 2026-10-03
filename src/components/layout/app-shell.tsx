"use client";
import { WorkspaceProvider } from "@/components/workspace-context";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/command/command-palette";
import { GlobalSearch } from "@/components/command/global-search";
import { QuickAddDialog } from "@/components/tasks/quick-add";
import type { Project, Tag, Task } from "@/types";
import type { User } from "@supabase/supabase-js";

export function AppShell({
  user, projects, tags, tasks, children,
}: { user: User; projects: Project[]; tags: Tag[]; tasks: Task[]; children: React.ReactNode }) {
  return (
    <WorkspaceProvider initialTasks={tasks} projects={projects} tags={tags}>
      <div className="flex h-screen overflow-hidden bg-bg">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
      </div>
      <MobileNav />
      <CommandPalette />
      <GlobalSearch />
      <QuickAddDialog />
    </WorkspaceProvider>
  );
}
