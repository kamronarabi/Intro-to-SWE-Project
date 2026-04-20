"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TaskCard, type Task } from "@/components/task-card";

interface TasksCarouselProps {
  tasks: Task[];
  pendingTaskIds: Record<string, string>;
  isLoading: boolean;
  noTasksLeft: boolean;
  onComplete: (task: Task) => void;
  onDiscard: (task: Task) => void;
}

const PAGE_SIZE = 3;

function ArrowButton({
  dir,
  disabled,
  onClick,
}: {
  dir: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card text-foreground disabled:text-border disabled:bg-transparent disabled:cursor-default transition-colors"
    >
      {dir === "left" ? (
        <ChevronLeft className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  );
}

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

  useEffect(() => {
    if (page > 0 && page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [tasks.length]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Daily Tasks</h2>
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
          <p className="text-base font-medium">All caught up!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No more tasks available. Check back later!
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <ArrowButton
              dir="left"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="flex-1 grid grid-cols-3 gap-3 [grid-auto-rows:185px]"
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
            <ArrowButton
              dir="right"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            />
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 mt-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className="h-1.5 rounded-full border-none transition-all duration-200"
                  style={{
                    width: i === page ? 20 : 6,
                    background:
                      i === page
                        ? "hsl(var(--foreground))"
                        : "hsl(var(--border))",
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
