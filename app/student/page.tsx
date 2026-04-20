"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { type Task } from "@/components/task-card";
import { TasksCarousel } from "@/components/tasks-carousel";
import { PracticeProblemsGrid } from "@/components/practice-problems-grid";
import { LeaderboardWidget } from "@/components/leaderboard-widget";
import { ApplicationTrackerWidget } from "@/components/application-tracker-widget";
import { useUser } from "@/components/user-context";
import { useToaster } from "@/components/providers";
import { RecruiterInterestBanner } from "@/components/recruiter-interest-banner";

interface StudentTask {
  id: string;
  task_id: string;
  status: string;
}

export default function StudentPage() {
  const supabase = createClient();
  const { userId, addXp } = useUser();
  const toaster = useToaster();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingTaskIds, setPendingTaskIds] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [noTasksLeft, setNoTasksLeft] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setNoTasksLeft(false);

    const { data: rawTasks } = await supabase
      .from("tasks")
      .select("*, companies(name)");
    const allTasks = (rawTasks || []).map((t) => ({
      ...t,
      company_name: (t.companies as { name: string } | null)?.name ?? null,
    }));
    if (allTasks.length === 0) {
      setTasks([]);
      setNoTasksLeft(true);
      setIsLoading(false);
      return;
    }

    const { data: studentTasks } = await supabase
      .from("student_tasks")
      .select("id, task_id, status")
      .eq("student_id", userId);

    const history = (studentTasks || []) as StudentTask[];

    const eligible = allTasks.filter((task) => {
      const completions = history.filter(
        (st) => st.task_id === task.id && st.status === "completed"
      ).length;
      return completions < task.max_completions;
    });

    if (eligible.length === 0) {
      setTasks([]);
      setPendingTaskIds({});
      setNoTasksLeft(true);
      setIsLoading(false);
      return;
    }

    const newPendingIds: Record<string, string> = {};

    for (const task of eligible) {
      const existingPending = history.find(
        (st) => st.task_id === task.id && st.status === "pending"
      );

      if (existingPending) {
        newPendingIds[task.id] = existingPending.id;
      } else {
        const { data: newStudentTask } = await supabase
          .from("student_tasks")
          .insert({ student_id: userId, task_id: task.id, status: "pending" })
          .select("id")
          .single();

        if (newStudentTask) {
          newPendingIds[task.id] = newStudentTask.id;
        }
      }
    }

    setTasks(eligible);
    setPendingTaskIds(newPendingIds);
    setIsLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    if (userId) loadTasks();
  }, [userId, loadTasks]);

  async function handleComplete(task: Task) {
    const stId = pendingTaskIds[task.id];
    if (!stId || !userId) return;

    await supabase
      .from("student_tasks")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", stId);

    await supabase.rpc("increment_xp", { amount: task.xp_value });

    addXp(task.xp_value);

    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setPendingTaskIds((prev) => {
      const next = { ...prev };
      delete next[task.id];
      return next;
    });

    toaster.current?.show({
      title: "Task Complete",
      message: `+${task.xp_value} XP earned!`,
      variant: "success",
    });
  }

  async function handleDiscard(task: Task) {
    const stId = pendingTaskIds[task.id];
    if (!stId) return;

    await supabase
      .from("student_tasks")
      .update({ status: "discarded" })
      .eq("id", stId);

    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setPendingTaskIds((prev) => {
      const next = { ...prev };
      delete next[task.id];
      return next;
    });

    toaster.current?.show({
      title: "Task Skipped",
      message: `"${task.title}" removed from queue`,
      variant: "default",
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <RecruiterInterestBanner />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* Main column */}
        <div className="flex flex-col gap-8">
          <TasksCarousel
            tasks={tasks}
            pendingTaskIds={pendingTaskIds}
            isLoading={isLoading}
            noTasksLeft={noTasksLeft}
            onComplete={handleComplete}
            onDiscard={handleDiscard}
          />
          <PracticeProblemsGrid />
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-6">
          <LeaderboardWidget />
          <ApplicationTrackerWidget />
        </div>
      </div>
    </div>
  );
}
