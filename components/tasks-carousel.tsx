"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TaskCard, type Task } from "@/components/task-card";
import { Button } from "@/components/ui/button";

interface TasksCarouselProps {
  tasks: Task[];
  pendingTaskIds: Record<string, string>;
  isLoading: boolean;
  noTasksLeft: boolean;
  onComplete: (task: Task) => void;
  onDiscard: (task: Task) => void;
}

const PAGE_SIZE = 3;

export function TasksCarousel({
  tasks,
  isLoading,
  noTasksLeft,
  onComplete,
  onDiscard,
}: TasksCarouselProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(tasks.length / PAGE_SIZE);
  const visible = tasks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Daily Tasks</h2>
        {tasks.length > 0 && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {tasks.length} remaining
          </span>
        )}
      </div>

      {isLoading && tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading tasks...</p>
      ) : noTasksLeft ? (
        <div className="glass-card p-8 text-center">
          <p className="text-lg font-medium">All caught up!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No more tasks available. Check back later!
          </p>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              {visible.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => onComplete(task)}
                  onDiscard={() => onDiscard(task)}
                  isLoading={isLoading}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
