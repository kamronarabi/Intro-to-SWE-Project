"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/sign-out-button";
import { TaskCard, type Task } from "@/components/task-card";
import { Leaderboard } from "@/components/leaderboard";

interface StudentTask {
  id: string;
  task_id: string;
  status: string;
}

export default function StudentPage() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userXp, setUserXp] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingTaskIds, setPendingTaskIds] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [noTasksLeft, setNoTasksLeft] = useState(false);

  // Load user profile
  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, xp")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserName(profile.name);
        setUserXp(profile.xp);
      }
    }

    loadUser();
  }, []);

  // Load all eligible tasks
  const loadTasks = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setNoTasksLeft(false);

    // Fetch all tasks
    const { data: allTasks } = await supabase.from("tasks").select("*");
    if (!allTasks || allTasks.length === 0) {
      setTasks([]);
      setNoTasksLeft(true);
      setIsLoading(false);
      return;
    }

    // Fetch student's task history
    const { data: studentTasks } = await supabase
      .from("student_tasks")
      .select("id, task_id, status")
      .eq("student_id", userId);

    const history = (studentTasks || []) as StudentTask[];

    // Filter eligible tasks
    const eligible = allTasks.filter((task) => {
      // Count completions for this task
      const completions = history.filter(
        (st) => st.task_id === task.id && st.status === "completed",
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

    // Create pending student_task records for tasks that don't already have one
    const newPendingIds: Record<string, string> = {};

    for (const task of eligible) {
      const existingPending = history.find(
        (st) => st.task_id === task.id && st.status === "pending",
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

  // Load tasks once user is known
  useEffect(() => {
    if (userId) loadTasks();
  }, [userId, loadTasks]);

  async function handleComplete(task: Task) {
    const stId = pendingTaskIds[task.id];
    if (!stId || !userId) return;

    // Mark task as completed
    await supabase
      .from("student_tasks")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", stId);

    // Atomically increment XP
    await supabase.rpc("increment_xp", { amount: task.xp_value });

    // Update local XP display
    setUserXp((prev) => prev + task.xp_value);

    // Remove from list and reload
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setPendingTaskIds((prev) => {
      const next = { ...prev };
      delete next[task.id];
      return next;
    });
  }

  async function handleDiscard(task: Task) {
    const stId = pendingTaskIds[task.id];
    if (!stId) return;

    // Mark task as discarded
    await supabase
      .from("student_tasks")
      .update({ status: "discarded" })
      .eq("id", stId);

    // Remove from list
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setPendingTaskIds((prev) => {
      const next = { ...prev };
      delete next[task.id];
      return next;
    });
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">LevelUp</h1>
            <p className="text-sm text-muted-foreground">
              {userName ? `Welcome, ${userName}` : "Student Dashboard"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold">
              {userXp} XP
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          {/* Task section */}
          <section className="flex w-full flex-col items-center gap-4 lg:w-1/2">
            <h2 className="self-start text-lg font-semibold">Your Tasks</h2>
            {isLoading && tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Loading tasks...</p>
            ) : noTasksLeft ? (
              <div className="w-full max-w-md rounded-xl border p-8 text-center">
                <p className="text-lg font-medium">All caught up!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  No more tasks available. Check back later!
                </p>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-4">
                {tasks.slice(0, 3).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={() => handleComplete(task)}
                    onDiscard={() => handleDiscard(task)}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Leaderboard section */}
          <section className="flex w-full flex-col items-center gap-4 lg:w-1/2">
            <h2 className="self-start text-lg font-semibold">Leaderboard</h2>
            {userId && <Leaderboard currentUserId={userId} currentUserXp={userXp} />}
          </section>
        </div>
      </main>
    </div>
  );
}
