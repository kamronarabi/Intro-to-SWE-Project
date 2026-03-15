"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  xp: number;
}

interface LeaderboardProps {
  currentUserId: string;
}

export function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfiles() {
      const { data } = await supabase
        .from("profiles")
        .select("id, name, xp")
        .eq("role", "student")
        .order("xp", { ascending: false });

      if (data) setProfiles(data);
    }

    fetchProfiles();

    const channel = supabase
      .channel("leaderboard")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          setProfiles((prev) => {
            const updated = prev.map((p) =>
              p.id === payload.new.id
                ? { ...p, name: payload.new.name, xp: payload.new.xp }
                : p,
            );
            return updated.sort((a, b) => b.xp - a.xp);
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        (payload) => {
          if (payload.new.role === "student") {
            setProfiles((prev) =>
              [...prev, { id: payload.new.id, name: payload.new.name, xp: payload.new.xp }]
                .sort((a, b) => b.xp - a.xp),
            );
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "profiles" },
        (payload) => {
          setProfiles((prev) => prev.filter((p) => p.id !== payload.old.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {profiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No students yet.</p>
        ) : (
          <div className="space-y-2">
            {profiles.map((profile, index) => (
              <div
                key={profile.id}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  profile.id === currentUserId
                    ? "bg-primary/10 font-semibold"
                    : "bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono text-muted-foreground">
                    {index + 1}
                  </span>
                  <span>{profile.name || "Anonymous"}</span>
                </div>
                <span className="font-mono">{profile.xp} XP</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
