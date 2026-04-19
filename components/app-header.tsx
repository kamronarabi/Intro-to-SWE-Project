"use client";

import { UserCircle } from "lucide-react";
import { useUser } from "@/components/user-context";
import { SignOutButton } from "@/components/sign-out-button";

export function AppHeader() {
  const { userName, userXp } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-16">
        <span className="text-xl font-bold">LevelUp</span>
        <div className="flex items-center gap-4">
          <span className="xp-badge">{userXp.toLocaleString()} XP</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCircle className="h-6 w-6" />
            <span className="hidden sm:inline">{userName}</span>
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
