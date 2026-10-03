"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createProject, updateProject } from "@/server/projects";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

const COLORS = ["#6366f1", "#ef4444", "#f59e0b", "#10b981", "#06b6d4", "#8b5cf6", "#ec4899", "#64748b"];

export function ProjectDialog({ open, onOpenChange, project }: { open: boolean; onOpenChange: (v: boolean) => void; project?: Project }) {
  const [name, setName] = useState(project?.name ?? "");
  const [color, setColor] = useState(project?.color ?? COLORS[0]);
  const [description, setDescription] = useState(project?.description ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (project) await updateProject(project.id, { name, color, description: description || null });
      else await createProject({ name, color, icon: "folder", description });
      toast.success(project ? "Project updated" : "Project created");
      onOpenChange(false);
      if (!project) { setName(""); setDescription(""); setColor(COLORS[0]); }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
        <form onSubmit={submit} className="mt-3 space-y-3">
          <Input autoFocus placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea placeholder="Description (optional)" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn("h-7 w-7 rounded-full ring-offset-2 ring-offset-surface transition-shadow", color === c && "ring-2 ring-ink")}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || !name.trim()}>{project ? "Save" : "Create project"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
