"use client";
import { useMemo, useState } from "react";
import { PageHeader, type SortKey } from "@/components/layout/page-header";
import { TaskList } from "@/components/tasks/task-list";
import { EmptyState } from "@/components/empty-state";
import { useWorkspace } from "@/components/workspace-context";
import { sortTasks } from "@/lib/sort-tasks";
import { Inbox } from "lucide-react";

export default function InboxPage() {
  const { tasks } = useWorkspace();
  const [sort, setSort] = useState<SortKey>("manual");
  const open = useMemo(() => sortTasks(tasks.filter((t) => !t.completed), sort), [tasks, sort]);

  return (
    <div>
      <PageHeader title="Inbox" subtitle={`${open.length} task${open.length === 1 ? "" : "s"}`} sort={sort} onSortChange={setSort} />
      <div className="mx-auto max-w-2xl px-5 py-6 md:px-8">
        <TaskList tasks={open} showProject emptyState={<EmptyState icon={Inbox} title="You're all caught up." description="Nothing left in your inbox." />} />
      </div>
    </div>
  );
}
