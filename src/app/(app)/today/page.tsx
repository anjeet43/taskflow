"use client";
import { useEffect, useMemo, useState } from "react";
import { useProfile } from "@/lib/use-profile";
import { PageHeader, type SortKey } from "@/components/layout/page-header";
import { TaskList } from "@/components/tasks/task-list";
import { EmptyState } from "@/components/empty-state";
import { useWorkspace } from "@/components/workspace-context";
import { sortTasks } from "@/lib/sort-tasks";
import { CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function TodayPage() {
  const { tasks } = useWorkspace();
  const [sort, setSort] = useState<SortKey>("manual");
  const { firstName } = useProfile();
  // Computed after mount so the server render and the browser never disagree about the hour.
  const [greeting, setGreeting] = useState("Hello");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h >= 5 && h < 12 ? "Good morning" : h >= 12 && h < 17 ? "Good afternoon" : "Good evening");
  }, []);
  const todayStr = new Date().toISOString().slice(0, 10);

  const { dueToday, overdue, completedToday } = useMemo(() => {
    const open = tasks.filter((t) => !t.completed);
    return {
      dueToday: sortTasks(open.filter((t) => t.due_date === todayStr), sort),
      overdue: sortTasks(open.filter((t) => t.due_date && t.due_date < todayStr), sort),
      completedToday: tasks.filter((t) => t.completed && t.completed_at?.slice(0, 10) === todayStr).length,
    };
  }, [tasks, sort, todayStr]);

  const remaining = dueToday.length + overdue.length;

  return (
    <div>
      <PageHeader title="Today" subtitle={format(new Date(), "EEEE, MMMM d")} sort={sort} onSortChange={setSort} />
      <div className="mx-auto max-w-2xl px-5 py-6 md:px-8">
        <h2 className="mb-1 break-words text-xl font-semibold">{greeting}{firstName ? `, ${firstName}` : ""} 👋</h2>
        <p className="mb-6 text-sm text-muted">
          {remaining === 0 ? "You have no tasks left for today." : `You have ${remaining} task${remaining === 1 ? "" : "s"} remaining today.`}
          {completedToday > 0 && ` · ${completedToday} completed`}
        </p>

        {overdue.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-danger">Overdue</h3>
            <TaskList tasks={overdue} showProject emptyState={null} />
          </div>
        )}

        <h3 className="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-muted">Due today</h3>
        <TaskList
          tasks={dueToday}
          showProject
          emptyState={<EmptyState icon={CheckCircle2} title="Nothing planned for today." description="Enjoy the clear schedule, or add something new." />}
        />
      </div>
    </div>
  );
}
