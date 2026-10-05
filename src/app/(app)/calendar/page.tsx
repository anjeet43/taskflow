"use client";
import { useEffect, useMemo, useRef, useState } from "react";
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

  // On phones the day list sits below the month grid; bring it into view after a date is tapped.
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected && window.matchMedia("(max-width: 767px)").matches) {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selected]);

  return (
    <div>
      <PageHeader title="Calendar" subtitle={format(month, "MMMM yyyy")} />
      <div className="mx-auto max-w-3xl px-3 py-4 sm:px-5 sm:py-6 md:px-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-1">
            <Button variant="outline" size="icon" aria-label="Previous month" className="max-md:h-11 max-md:w-11" onClick={() => setMonth((m) => subMonths(m, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" aria-label="Next month" className="max-md:h-11 max-md:w-11" onClick={() => setMonth((m) => addMonths(m, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button variant="ghost" size="sm" className="max-md:h-11 max-md:px-4" onClick={() => { setMonth(new Date()); setSelected(format(new Date(), "yyyy-MM-dd")); }}>Today</Button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[11px] text-muted sm:gap-1 sm:text-xs">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="py-1"><span className="sm:hidden">{d[0]}</span><span className="max-sm:hidden">{d}</span></div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {days.map((d) => {
            const key = format(d, "yyyy-MM-dd");
            const dayTasks = byDate.get(key) ?? [];
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                aria-label={`${format(d, "EEEE, MMMM d")}, ${dayTasks.length} task${dayTasks.length === 1 ? "" : "s"}`}
                aria-pressed={selected === key}
                className={cn(
                  "flex h-14 min-w-0 flex-col items-start rounded-lg border border-border p-1 text-left transition-colors hover:bg-surface-2 sm:h-20 sm:rounded-xl sm:p-1.5",
                  !isSameMonth(d, month) && "opacity-40",
                  selected === key && "ring-2 ring-accent",
                  isToday(d) && "bg-accent/5"
                )}
              >
                <span className={cn("text-xs", isToday(d) && "font-semibold text-accent")}>{format(d, "d")}</span>
                <div className="mt-auto flex flex-wrap gap-0.5 sm:mt-1">
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
          <div ref={panelRef} className="mt-5 scroll-mb-24 rounded-xl border border-border p-4 animate-slide-up sm:mt-6">
            <h3 className="mb-2 text-sm font-medium">{format(new Date(`${selected}T00:00:00`), "EEEE, MMMM d")}</h3>
            {selectedTasks.length === 0 && <p className="text-sm text-muted">No tasks due this day.</p>}
            <div className="space-y-2">
              {selectedTasks.map((t) => (
                <label key={t.id} htmlFor={`cal-${t.id}`} className="flex cursor-pointer items-center gap-2 max-md:min-h-11">
                  <Checkbox id={`cal-${t.id}`} checked={t.completed} onCheckedChange={() => toggleComplete(t)} priority={t.priority} />
                  <span className={cn("min-w-0 break-words text-sm", t.completed && "text-muted line-through")}>{t.title}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
