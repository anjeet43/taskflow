"use client";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TaskList } from "@/components/tasks/task-list";
import { EmptyState } from "@/components/empty-state";
import { useWorkspace } from "@/components/workspace-context";
import { CheckCircle2 } from "lucide-react";

export default function CompletedPage() {
  const { tasks } = useWorkspace();
  const completed = useMemo(
    () => tasks.filter((t) => t.completed).sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? "")),
    [tasks]
  );
  return (
    <div>
      <PageHeader title="Completed" subtitle={`${completed.length} task${completed.length === 1 ? "" : "s"}`} />
      <div className="mx-auto max-w-2xl px-5 py-6 md:px-8">
        <TaskList tasks={completed} showProject emptyState={<EmptyState icon={CheckCircle2} title="Nothing completed yet." description="Finished tasks will show up here." />} />
      </div>
    </div>
  );
}
