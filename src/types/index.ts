export type Priority = "none" | "low" | "medium" | "high";
export type Recurrence = "daily" | "weekly" | "monthly" | "custom" | null;

export type Project = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  description: string | null;
  archived: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Tag = { id: string; user_id: string; name: string; color: string };

export type Task = {
  id: string;
  user_id: string;
  project_id: string | null;
  parent_id: string | null;
  title: string;
  description: string | null;
  completed: boolean;
  completed_at: string | null;
  priority: Priority;
  due_date: string | null; // YYYY-MM-DD
  due_time: string | null; // HH:MM:SS
  recurrence: Recurrence;
  recurrence_days: number[] | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  subtasks?: Task[];
};

export type Profile = { id: string; email: string; full_name: string | null; avatar_url: string | null; theme: string };
