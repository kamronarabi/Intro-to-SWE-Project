"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/sign-out-button";
import { TaskComposer } from "@/components/task-composer";
import { AdminLeaderboard } from "@/components/admin-leaderboard";

export default function AdminPage() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (profile) setUserName(profile.name);
    }

    loadUser();
  }, []);

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {userName ? `Administrator: ${userName}` : "Admin Dashboard"}
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left: Task Composer */}
          <section className="w-full lg:w-1/3">
            <h2 className="mb-4 text-lg font-semibold">Create Tasks</h2>
            <TaskComposer />
          </section>

          {/* Right: Admin Leaderboard */}
          <section className="w-full lg:w-2/3">
            <h2 className="mb-4 text-lg font-semibold">Students</h2>
            {userId && <AdminLeaderboard currentUserId={userId} />}
          </section>
        </div>
      </main>
    </div>
  );
}
