"use client";
import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { TaskItem } from "@/components/tasks/task-item";
import { reorderTasks } from "@/server/tasks";
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

  if (tasks.length === 0) return <>{emptyState}</>;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={order.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="divide-y divide-border/60">
          {order.map((t) => <TaskItem key={t.id} task={t} showProject={showProject} />)}
        </div>
      </SortableContext>
    </DndContext>
  );
}
