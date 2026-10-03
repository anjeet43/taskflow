"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, user };
}

/** Finds existing tags by name (creating any that don't exist yet) and returns their ids. */
export async function resolveTagIds(names: string[]): Promise<string[]> {
  if (names.length === 0) return [];
  const { supabase, user } = await requireUser();
  const unique = [...new Set(names.map((n) => n.toLowerCase()))];

  const { data: existing } = await supabase.from("tags").select("id, name").in("name", unique).eq("user_id", user.id);
  const have = new Map((existing ?? []).map((t) => [t.name, t.id]));
  const missing = unique.filter((n) => !have.has(n));

  if (missing.length) {
    const { data: created, error } = await supabase
      .from("tags")
      .insert(missing.map((name) => ({ name, user_id: user.id })))
      .select("id, name");
    if (error) throw new Error(error.message);
    for (const t of created ?? []) have.set(t.name, t.id);
  }
  revalidatePath("/", "layout");
  return unique.map((n) => have.get(n)!);
}

export async function deleteTag(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
