"use client";
import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { TaskItem } from "@/components/tasks/task-item";
import { reorderTasks } from "@/server/tasks";
import { toast } from "sonner";
import type { Task } from "@/types";

export function TaskList({ tasks, showProject, emptyState }: { tasks: Task[]; showProject?: boolean; emptyState: React.ReactNode }) {
  const [order, setOrder] = useState(tasks);
  if (order.length !== tasks.length || order.some((t, i) => t.id !== tasks[i]?.id)) {
    // Props changed (new data from the server) — resync local order without losing the drag affordance.
    if (JSON.stringify(order.map((t) => t.id).sort()) !== JSON.stringify(tasks.map((t) => t.id).sort())) {
      setOrder(tasks);
    }
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = order.findIndex((t) => t.id === active.id);
    const newIndex = order.findIndex((t) => t.id === over.id);
    const next = arrayMove(order, oldIndex, newIndex);
    setOrder(next);
    await reorderTasks(next.map((t) => t.id));
  }

  // Touch/keyboard alternative to dragging: "Move up" / "Move down" in each task's menu.
  async function moveBy(id: string, dir: -1 | 1) {
    const from = order.findIndex((t) => t.id === id);
    const to = from + dir;
    if (from < 0 || to < 0 || to >= order.length) return;
    const prev = order;
    const next = arrayMove(order, from, to);
    setOrder(next);
    try {
      await reorderTasks(next.map((t) => t.id));
    } catch (err) {
      setOrder(prev);
      toast.error(err instanceof Error ? err.message : "Couldn't change the order");
    }
  }

  if (tasks.length === 0) return <>{emptyState}</>;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={order.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="divide-y divide-border/60">
          {order.map((t, i) => (
            <TaskItem key={t.id} task={t} showProject={showProject} onMove={(dir) => moveBy(t.id, dir)} isFirst={i === 0} isLast={i === order.length - 1} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
