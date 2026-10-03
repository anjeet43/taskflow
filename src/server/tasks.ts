"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addDays, addMonths, addWeeks, format } from "date-fns";
import type { Priority } from "@/types";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, user };
}

export type CreateTaskInput = {
  title: string;
  description?: string;
  projectId?: string | null;
  parentId?: string | null;
  priority?: Priority;
  dueDate?: string | null;
  dueTime?: string | null;
  recurrence?: "daily" | "weekly" | "monthly" | "custom" | null;
  recurrenceDays?: number[] | null;
  tagIds?: string[];
};

export async function createTask(input: CreateTaskInput) {
  const { supabase, user } = await requireUser();
  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: input.title,
      description: input.description ?? null,
      project_id: input.projectId ?? null,
      parent_id: input.parentId ?? null,
      priority: input.priority ?? "none",
      due_date: input.dueDate ?? null,
      due_time: input.dueTime ?? null,
      recurrence: input.recurrence ?? null,
      recurrence_days: input.recurrenceDays ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  if (input.tagIds?.length) {
    await supabase.from("task_tags").insert(input.tagIds.map((tag_id) => ({ task_id: task.id, tag_id })));
  }
  revalidatePath("/", "layout");
  return task;
}

export async function updateTask(id: string, patch: Partial<CreateTaskInput>) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("tasks")
    .update({
      ...(patch.title !== undefined && { title: patch.title }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.projectId !== undefined && { project_id: patch.projectId }),
      ...(patch.priority !== undefined && { priority: patch.priority }),
      ...(patch.dueDate !== undefined && { due_date: patch.dueDate }),
      ...(patch.dueTime !== undefined && { due_time: patch.dueTime }),
      ...(patch.recurrence !== undefined && { recurrence: patch.recurrence }),
      ...(patch.recurrenceDays !== undefined && { recurrence_days: patch.recurrenceDays }),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

/** Next occurrence date for a recurring task's base date, used right when it's completed. */
function nextOccurrence(from: string, recurrence: "daily" | "weekly" | "monthly" | "custom", days: number[] | null) {
  const base = new Date(`${from}T00:00:00`);
  if (recurrence === "daily") return format(addDays(base, 1), "yyyy-MM-dd");
  if (recurrence === "monthly") return format(addMonths(base, 1), "yyyy-MM-dd");
  // weekly / custom: next date (within 7 days) whose weekday is in `days`, else +1 week on the same day
  if (days?.length) {
    for (let i = 1; i <= 7; i++) {
      const d = addDays(base, i);
      if (days.includes(d.getDay())) return format(d, "yyyy-MM-dd");
    }
  }
  return format(addWeeks(base, 1), "yyyy-MM-dd");
}

export async function toggleComplete(id: string, completed: boolean) {
  const { supabase } = await requireUser();
  const { data: task, error } = await supabase
    .from("tasks")
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  // Completing a recurring task spawns its next occurrence instead of just disappearing.
  if (completed && task.recurrence && task.due_date) {
    const nextDue = nextOccurrence(task.due_date, task.recurrence, task.recurrence_days);
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
  }
  revalidatePath("/", "layout");
}

export async function deleteTask(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function duplicateTask(id: string) {
  const { supabase, user } = await requireUser();
  const { data: original, error: readErr } = await supabase.from("tasks").select("*").eq("id", id).single();
  if (readErr) throw new Error(readErr.message);
  const { id: _old, created_at, updated_at, completed_at, ...rest } = original;
  const { error } = await supabase
    .from("tasks")
    .insert({ ...rest, user_id: user.id, title: `${rest.title} (copy)`, completed: false, completed_at: null });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function moveTask(id: string, projectId: string | null) {
  await updateTask(id, { projectId });
}

/** Persists manual drag-and-drop order within whatever list the task was dropped in. */
export async function reorderTasks(orderedIds: string[]) {
  const { supabase } = await requireUser();
  await Promise.all(
    orderedIds.map((id, i) => supabase.from("tasks").update({ sort_order: i }).eq("id", id))
  );
  revalidatePath("/", "layout");
}

export async function setTaskTags(taskId: string, tagIds: string[]) {
  const { supabase } = await requireUser();
  await supabase.from("task_tags").delete().eq("task_id", taskId);
  if (tagIds.length) await supabase.from("task_tags").insert(tagIds.map((tag_id) => ({ task_id: taskId, tag_id })));
  revalidatePath("/", "layout");
}
