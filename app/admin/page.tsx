"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/sign-out-button";
import { TaskComposer } from "@/components/task-composer";
import { AdminLeaderboard } from "@/components/admin-leaderboard";
import { ShortlistSection } from "@/components/shortlist-section";

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold">LevelUp</span>
            <span className="text-xs text-muted-foreground font-normal">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              <span className="hidden sm:inline">{userName || "Admin"}</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_2fr]">
            {/* Left: Task Composer */}
            <div>
              <h2 className="mb-4 text-base font-semibold">Create Tasks</h2>
              <TaskComposer />
            </div>

            {/* Right: Admin Leaderboard + Shortlist */}
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="mb-4 text-base font-semibold">Students</h2>
                {userId && <AdminLeaderboard currentUserId={userId} />}
              </div>
              <div>
                <h2 className="mb-4 text-base font-semibold">Shortlist</h2>
                <ShortlistSection />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
