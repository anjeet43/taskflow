import { createClient } from "@/lib/supabase/server";
import type { Project, Tag, Task } from "@/types";

/** Loads everything the app shell needs in one place: the user, their projects, tags, and all tasks (with
 *  their tags and subtasks attached). Simpler and fewer round-trips than fetching per-view for an app this size. */
export async function loadWorkspace() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: projects }, { data: tags }, { data: tasks }, { data: taskTags }] = await Promise.all([
    supabase.from("projects").select("*").eq("archived", false).order("sort_order"),
    supabase.from("tags").select("*").order("name"),
    supabase.from("tasks").select("*").order("sort_order").order("created_at"),
    supabase.from("task_tags").select("task_id, tag_id"),
  ]);

  const tagById = new Map((tags ?? []).map((t) => [t.id, t as Tag]));
  const tagsByTask = new Map<string, Tag[]>();
  for (const row of taskTags ?? []) {
    const tag = tagById.get(row.tag_id);
    if (!tag) continue;
    tagsByTask.set(row.task_id, [...(tagsByTask.get(row.task_id) ?? []), tag]);
  }

  const all = (tasks ?? []).map((t) => ({ ...t, tags: tagsByTask.get(t.id) ?? [] })) as Task[];
  const byParent = new Map<string, Task[]>();
  for (const t of all) if (t.parent_id) byParent.set(t.parent_id, [...(byParent.get(t.parent_id) ?? []), t]);
  const topLevel = all.filter((t) => !t.parent_id).map((t) => ({ ...t, subtasks: byParent.get(t.id) ?? [] }));

  return {
    user,
    projects: (projects ?? []) as Project[],
    tags: (tags ?? []) as Tag[],
    tasks: topLevel,
  };
}
