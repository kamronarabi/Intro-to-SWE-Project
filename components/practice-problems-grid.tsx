"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PracticeProblemCard } from "@/components/practice-problem-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { practiceProblems } from "@/lib/practice-problems";
import { AnimatePresence, motion } from "framer-motion";

const PAGE_SIZE = 4;

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

export function PracticeProblemsGrid() {
  const [page, setPage] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const totalPages = Math.ceil(practiceProblems.length / PAGE_SIZE);
  const visible = practiceProblems.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Practice Problems</h2>
        <button
          onClick={() => setShowAll(true)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Show All
        </button>
      </div>

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
              className="flex-1 grid grid-cols-2 gap-3"
            >
              {visible.map((problem) => (
                <PracticeProblemCard key={problem.id} problem={problem} />
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

      <Dialog open={showAll} onOpenChange={setShowAll}>
      <DialogContent className="max-w-[90vw] sm:max-w-[90vw] h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Practice Problems</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {practiceProblems.map((problem) => (
              <PracticeProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
