"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, user };
}

export async function createProject(input: { name: string; color: string; icon: string; description?: string }) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase.from("projects").insert({ ...input, user_id: user.id }).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  return data;
}

export async function updateProject(id: string, patch: Partial<{ name: string; color: string; icon: string; description: string | null; archived: boolean }>) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("projects").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteProject(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
