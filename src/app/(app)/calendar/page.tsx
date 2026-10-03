"use client";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useWorkspace } from "@/components/workspace-context";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday, addMonths, subMonths,
} from "date-fns";

export default function CalendarPage() {
  const { tasks, toggleComplete } = useWorkspace();
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const byDate = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    for (const t of tasks) if (t.due_date) map.set(t.due_date, [...(map.get(t.due_date) ?? []), t]);
    return map;
  }, [tasks]);

  const selectedTasks = selected ? byDate.get(selected) ?? [] : [];

  return (
    <div>
      <PageHeader title="Calendar" subtitle={format(month, "MMMM yyyy")} />
      <div className="mx-auto max-w-3xl px-5 py-6 md:px-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={() => setMonth((m) => subMonths(m, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => setMonth((m) => addMonths(m, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setMonth(new Date())}>Today</Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted mb-1">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const key = format(d, "yyyy-MM-dd");
            const dayTasks = byDate.get(key) ?? [];
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={cn(
                  "flex h-20 flex-col items-start rounded-xl border border-border p-1.5 text-left transition-colors hover:bg-surface-2",
                  !isSameMonth(d, month) && "opacity-40",
                  selected === key && "ring-2 ring-accent",
                  isToday(d) && "bg-accent/5"
                )}
              >
                <span className={cn("text-xs", isToday(d) && "font-semibold text-accent")}>{format(d, "d")}</span>
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {dayTasks.slice(0, 3).map((t) => (
                    <span key={t.id} className={cn("h-1.5 w-1.5 rounded-full", t.completed ? "bg-ok" : "bg-accent")} />
                  ))}
                  {dayTasks.length > 3 && <span className="text-[9px] text-muted">+{dayTasks.length - 3}</span>}
                </div>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-6 rounded-xl border border-border p-4 animate-slide-up">
            <h3 className="mb-2 text-sm font-medium">{format(new Date(`${selected}T00:00:00`), "EEEE, MMMM d")}</h3>
            {selectedTasks.length === 0 && <p className="text-sm text-muted">No tasks due this day.</p>}
            <div className="space-y-2">
              {selectedTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <Checkbox checked={t.completed} onCheckedChange={() => toggleComplete(t)} priority={t.priority} />
                  <span className={cn("text-sm", t.completed && "text-muted line-through")}>{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
