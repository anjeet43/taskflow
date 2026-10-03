import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { addDays, addMonths, addWeeks, format } from "date-fns";

/**
 * Optional daily cron (e.g. Vercel Cron) for recurring tasks that were MISSED entirely rather than completed —
 * completing one on time already spawns its next occurrence (see server/tasks.ts). This route catches a
 * recurring task whose due date has passed with no newer occurrence of the same title/project yet created,
 * and rolls it forward so it doesn't just vanish into the past forever.
 *
 * Uses the service-role key (server-only; never sent to the browser) because it must look across all users'
 * recurring tasks, which RLS would otherwise block a single user's session from doing.
 */
function nextOccurrence(from: string, recurrence: string, days: number[] | null) {
  const base = new Date(`${from}T00:00:00`);
  if (recurrence === "daily") return format(addDays(base, 1), "yyyy-MM-dd");
  if (recurrence === "monthly") return format(addMonths(base, 1), "yyyy-MM-dd");
  if (days?.length) {
    for (let i = 1; i <= 7; i++) {
      const d = addDays(base, i);
      if (days.includes(d.getDay())) return format(d, "yyyy-MM-dd");
    }
  }
  return format(addWeeks(base, 1), "yyyy-MM-dd");
}

export async function GET(req: NextRequest) {
  if (process.env.CRON_SECRET && req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const supabase = createServiceClient(url, key);
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: overdue, error } = await supabase
    .from("tasks")
    .select("*")
    .not("recurrence", "is", null)
    .eq("completed", false)
    .lt("due_date", today);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let created = 0;
  for (const task of overdue ?? []) {
    const nextDue = nextOccurrence(task.due_date, task.recurrence, task.recurrence_days);
    // Skip if a newer occurrence already exists (e.g. it was completed and server/tasks.ts already made one).
    const { data: dup } = await supabase
      .from("tasks")
      .select("id")
      .eq("user_id", task.user_id)
      .eq("title", task.title)
      .eq("recurrence", task.recurrence)
      .gte("due_date", today)
      .limit(1);
    if (dup?.length) continue;

    await supabase.from("tasks").insert({
      user_id: task.user_id,
      title: task.title,
      description: task.description,
      project_id: task.project_id,
      priority: task.priority,
      due_date: nextDue,
      due_time: task.due_time,
      recurrence: task.recurrence,
      recurrence_days: task.recurrence_days,
    });
    created++;
  }

  return NextResponse.json({ ok: true, created });
}
