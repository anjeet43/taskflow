"use client";
import { WorkspaceProvider } from "@/components/workspace-context";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/command/command-palette";
import { GlobalSearch } from "@/components/command/global-search";
import { QuickAddDialog } from "@/components/tasks/quick-add";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import type { Project, Tag, Task } from "@/types";
import type { User } from "@supabase/supabase-js";

export function AppShell({
  user, projects, tags, tasks, children,
}: { user: User; projects: Project[]; tags: Tag[]; tasks: Task[]; children: React.ReactNode }) {
  return (
    <WorkspaceProvider initialTasks={tasks} projects={projects} tags={tags}>
      {/* h-dvh = the *visible* viewport on iOS Safari (100vh includes the collapsing URL bar and gets cut off). */}
      <div className="flex h-screen h-dvh overflow-hidden bg-bg">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
          <OfflineBanner />
          {children}
        </main>
      </div>
      <MobileNav />
      <CommandPalette />
      <GlobalSearch />
      <QuickAddDialog />
    </WorkspaceProvider>
  );
}
