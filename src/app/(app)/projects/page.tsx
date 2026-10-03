"use client";
import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/empty-state";
import { useWorkspace } from "@/components/workspace-context";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus } from "lucide-react";

export default function ProjectsPage() {
  const { projects, tasks } = useWorkspace();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <PageHeader title="Projects" subtitle={`${projects.length} project${projects.length === 1 ? "" : "s"}`} />
      <div className="mx-auto max-w-3xl px-5 py-6 md:px-8">
        <div className="mb-4 flex justify-end">
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> New project</Button>
        </div>
        {projects.length === 0 ? (
          <EmptyState icon={FolderKanban} title="Create your first project." description="Group related tasks together — like College, Coding, or Internship." actionLabel="New project" onAction={() => setDialogOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {projects.map((p) => {
              const open = tasks.filter((t) => t.project_id === p.id && !t.completed).length;
              return (
                <Link key={p.id} href={`/projects/${p.id}`} className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-2">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-medium">{p.name}</span>
                  </div>
                  {p.description && <p className="mb-2 line-clamp-2 text-sm text-muted">{p.description}</p>}
                  <p className="text-xs text-muted">{open} open task{open === 1 ? "" : "s"}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <ProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
