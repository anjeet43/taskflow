"use client";
import { use, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { PageHeader, type SortKey } from "@/components/layout/page-header";
import { TaskList } from "@/components/tasks/task-list";
import { EmptyState } from "@/components/empty-state";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { useWorkspace } from "@/components/workspace-context";
import { Plus } from "lucide-react";
import { sortTasks } from "@/lib/sort-tasks";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ListTodo } from "lucide-react";
import { deleteProject } from "@/server/projects";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { projects, tasks, openQuickAdd } = useWorkspace();
  const [sort, setSort] = useState<SortKey>("manual");
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  const project = projects.find((p) => p.id === id);
  const projectTasks = useMemo(
    () => sortTasks(tasks.filter((t) => t.project_id === id && !t.completed), sort),
    [tasks, id, sort]
  );

  if (!project) return notFound();

  async function onDelete() {
    if (!confirm(`Delete "${project!.name}"? Tasks inside will move to Inbox.`)) return;
    await deleteProject(project!.id);
    toast.success("Project deleted");
    router.push("/projects");
  }

  return (
    <div>
      <PageHeader title={project.name} subtitle={`${projectTasks.length} open task${projectTasks.length === 1 ? "" : "s"}`} sort={sort} onSortChange={setSort} />
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-5 md:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
            {project.description && <p className="min-w-0 break-words text-sm text-muted">{project.description}</p>}
          </div>
          <div className="flex gap-1">
            <Button variant="secondary" size="sm" className="max-md:h-10" onClick={() => openQuickAdd(project.id)}><Plus className="h-4 w-4" /> Add task</Button>
            <Button variant="ghost" size="icon" aria-label="Edit project" className="max-md:h-10 max-md:w-10" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" aria-label="Delete project" className="max-md:h-10 max-md:w-10" onClick={onDelete}><Trash2 className="h-4 w-4 text-danger" /></Button>
          </div>
        </div>
        <TaskList
          tasks={projectTasks}
          emptyState={<EmptyState icon={ListTodo} title="No tasks in this project yet." description="Add one to get started." />}
        />
      </div>
      <ProjectDialog open={editOpen} onOpenChange={setEditOpen} project={project} />
    </div>
  );
}
