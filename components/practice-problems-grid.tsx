"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PracticeProblemCard } from "@/components/practice-problem-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { practiceProblems } from "@/lib/practice-problems";

const PAGE_SIZE = 6;

export function PracticeProblemsGrid() {
  const [page, setPage] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const totalPages = Math.ceil(practiceProblems.length / PAGE_SIZE);
  const visible = practiceProblems.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Practice Problems</h2>
        <button
          onClick={() => setShowAll(true)}
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          Show All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((problem) => (
          <PracticeProblemCard key={problem.id} problem={problem} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
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

      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-5xl h-[90vh] overflow-y-auto">
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
