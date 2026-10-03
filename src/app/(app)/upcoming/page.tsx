"use client";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TaskList } from "@/components/tasks/task-list";
import { EmptyState } from "@/components/empty-state";
import { useWorkspace } from "@/components/workspace-context";
import { CalendarRange } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";

export default function UpcomingPage() {
  const { tasks } = useWorkspace();
  const todayStr = new Date().toISOString().slice(0, 10);

  const groups = useMemo(() => {
    const upcoming = tasks.filter((t) => !t.completed && t.due_date && t.due_date > todayStr);
    const byDate = new Map<string, typeof upcoming>();
    for (const t of upcoming) byDate.set(t.due_date!, [...(byDate.get(t.due_date!) ?? []), t]);
    return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [tasks, todayStr]);

  return (
    <div>
      <PageHeader title="Upcoming" subtitle="Future tasks, grouped by date" />
      <div className="mx-auto max-w-2xl px-5 py-6 md:px-8">
        {groups.length === 0 && <EmptyState icon={CalendarRange} title="Nothing on the horizon." description="Tasks with a future due date show up here." />}
        {groups.map(([date, items]) => {
          const d = new Date(`${date}T00:00:00`);
          const label = isToday(d) ? "Today" : isTomorrow(d) ? "Tomorrow" : format(d, "EEEE, MMM d");
          return (
            <div key={date} className="mb-6">
              <h3 className="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-muted">{label}</h3>
              <TaskList tasks={items} showProject emptyState={null} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
