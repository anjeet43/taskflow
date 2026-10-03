import { redirect } from "next/navigation";
import { loadWorkspace } from "@/server/data";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const workspace = await loadWorkspace();
  if (!workspace) redirect("/login");

  return (
    <AppShell user={workspace.user} projects={workspace.projects} tags={workspace.tags} tasks={workspace.tasks}>
      {children}
    </AppShell>
  );
}
