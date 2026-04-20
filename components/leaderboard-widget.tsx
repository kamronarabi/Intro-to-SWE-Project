"use client";

import { useState } from "react";
import { Leaderboard } from "@/components/leaderboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUser } from "@/components/user-context";

export function LeaderboardWidget() {
  const { userId, userXp } = useUser();
  const [showAll, setShowAll] = useState(false);

  if (!userId) return null;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-base">Leaderboard</h3>
        <button
          onClick={() => setShowAll(true)}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Show All
        </button>
      </div>
      <Leaderboard currentUserId={userId} currentUserXp={userXp} limit={5} />

      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Full Leaderboard</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <Leaderboard currentUserId={userId} currentUserXp={userXp} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
