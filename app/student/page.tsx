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
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
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

  // Task assignment algorithm
  const getNextTask = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setNoTasksLeft(false);

    // Fetch all tasks
    const { data: allTasks } = await supabase.from("tasks").select("*");
    if (!allTasks || allTasks.length === 0) {
      setCurrentTask(null);
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
      // Skip tasks with a pending assignment
      const hasPending = history.some(
        (st) => st.task_id === task.id && st.status === "pending",
      );
      if (hasPending) return false;

      // Count completions for this task
      const completions = history.filter(
        (st) => st.task_id === task.id && st.status === "completed",
      ).length;

      return completions < task.max_completions;
    });

    if (eligible.length === 0) {
      setCurrentTask(null);
      setPendingTaskId(null);
      setNoTasksLeft(true);
      setIsLoading(false);
      return;
    }

    // Pick a random eligible task
    const picked = eligible[Math.floor(Math.random() * eligible.length)];

    // Create a pending student_task record
    const { data: newStudentTask } = await supabase
      .from("student_tasks")
      .insert({ student_id: userId, task_id: picked.id, status: "pending" })
      .select("id")
      .single();

    setCurrentTask(picked);
    setPendingTaskId(newStudentTask?.id || null);
    setIsLoading(false);
  }, [userId, supabase]);

  // Load first task once user is known
  useEffect(() => {
    if (userId) getNextTask();
  }, [userId, getNextTask]);

  async function handleComplete() {
    if (!pendingTaskId || !currentTask || !userId) return;
    setIsLoading(true);

    // Mark task as completed
    await supabase
      .from("student_tasks")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", pendingTaskId);

    // Atomically increment XP
    await supabase.rpc("increment_xp", { amount: currentTask.xp_value });

    // Update local XP display
    setUserXp((prev) => prev + currentTask.xp_value);

    // Load next task
    await getNextTask();
  }

  async function handleDiscard() {
    if (!pendingTaskId) return;
    setIsLoading(true);

    // Mark task as discarded
    await supabase
      .from("student_tasks")
      .update({ status: "discarded" })
      .eq("id", pendingTaskId);

    // Load next task
    await getNextTask();
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
            <h2 className="self-start text-lg font-semibold">Your Task</h2>
            {isLoading && !currentTask ? (
              <p className="text-sm text-muted-foreground">Loading task...</p>
            ) : noTasksLeft ? (
              <div className="w-full max-w-md rounded-xl border p-8 text-center">
                <p className="text-lg font-medium">All caught up!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  No more tasks available. Check back later!
                </p>
              </div>
            ) : currentTask ? (
              <TaskCard
                task={currentTask}
                onComplete={handleComplete}
                onDiscard={handleDiscard}
                isLoading={isLoading}
              />
            ) : null}
          </section>

          {/* Leaderboard section */}
          <section className="flex w-full flex-col items-center gap-4 lg:w-1/2">
            <h2 className="self-start text-lg font-semibold">Leaderboard</h2>
            {userId && <Leaderboard currentUserId={userId} />}
          </section>
        </div>
      </main>
    </div>
  );
}
