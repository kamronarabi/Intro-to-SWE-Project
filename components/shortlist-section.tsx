"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, X } from "lucide-react";

interface BookmarkedStudent {
  id: string;
  student_id: string;
  profiles: {
    id: string;
    name: string;
    xp: number;
  } | null;
}

export function ShortlistSection() {
  const [bookmarks, setBookmarks] = useState<BookmarkedStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookmarks")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBookmarks(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  async function removeBookmark(bookmarkId: string) {
    await fetch(`/api/bookmarks/${bookmarkId}`, { method: "DELETE" });
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-yellow-500" />
          Your Shortlist
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : bookmarks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No candidates shortlisted yet. Use the bookmark icon in the leaderboard to add students.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {bookmarks.map((b) => {
              const student = b.profiles;
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {student?.name || "Unknown"}
                    </span>
                    <span className="xp-badge text-xs px-2 py-0.5">
                      {student?.xp ?? 0} XP
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeBookmark(b.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
