"use client";

import { useEffect, useState, Fragment } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, Pencil, Trash2, Bookmark, BookmarkCheck, Send } from "lucide-react";
import { useToaster } from "@/components/providers";

interface Profile {
  id: string;
  name: string;
  email: string;
  xp: number;
}

interface BookmarkEntry {
  id: string;
  student_id: string;
}

export function AdminLeaderboard({ currentUserId: _currentUserId }: { currentUserId: string }) {
  const supabase = createClient();
  const toaster = useToaster();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editName, setEditName] = useState("");
  const [editXp, setEditXp] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Recruiter features
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);
  const [interestFormId, setInterestFormId] = useState<string | null>(null);
  const [interestMessage, setInterestMessage] = useState("");
  const [isSendingInterest, setIsSendingInterest] = useState(false);

  const bookmarkedIds = new Set(bookmarks.map((b) => b.student_id));

  useEffect(() => {
    async function fetchProfiles() {
      const { data } = await supabase
        .from("profiles")
        .select("id, name, email, xp")
        .eq("role", "student")
        .order("xp", { ascending: false });

      if (data) setProfiles(data);
    }

    async function fetchBookmarks() {
      const res = await fetch("/api/bookmarks");
      const data = await res.json();
      if (Array.isArray(data)) setBookmarks(data);
    }

    fetchProfiles();
    fetchBookmarks();

    const channel = supabase
      .channel("admin-leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchProfiles();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function openEdit(profile: Profile) {
    setEditingProfile(profile);
    setEditName(profile.name);
    setEditXp(profile.xp);
  }

  async function handleSaveEdit() {
    if (!editingProfile) return;
    setIsSaving(true);

    await supabase
      .from("profiles")
      .update({ name: editName, xp: editXp })
      .eq("id", editingProfile.id);

    setProfiles((prev) =>
      prev
        .map((p) =>
          p.id === editingProfile.id ? { ...p, name: editName, xp: editXp } : p,
        )
        .sort((a, b) => b.xp - a.xp),
    );

    setEditingProfile(null);
    setIsSaving(false);
  }

  async function handleDelete(userId: string) {
    setDeletingId(userId);

    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      setProfiles((prev) => prev.filter((p) => p.id !== userId));
    }

    setDeletingId(null);
  }

  async function toggleBookmark(studentId: string) {
    const existing = bookmarks.find((b) => b.student_id === studentId);
    if (existing) {
      await fetch(`/api/bookmarks/${existing.id}`, { method: "DELETE" });
      setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
    } else {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
      });
      const data = await res.json();
      if (data.id) setBookmarks((prev) => [...prev, { id: data.id, student_id: studentId }]);
    }
  }

  async function sendInterest(studentId: string) {
    setIsSendingInterest(true);
    const res = await fetch("/api/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: studentId, message: interestMessage || undefined }),
    });

    if (res.ok) {
      toaster.current?.show({
        title: "Interest Sent",
        message: "The student will see your signal on their dashboard.",
        variant: "success",
      });
      setInterestFormId(null);
      setInterestMessage("");
    }
    setIsSendingInterest(false);
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Student Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">XP</TableHead>
                  <TableHead className="w-36 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile, index) => (
                  <Fragment key={profile.id}>
                    <TableRow>
                      <TableCell className="font-mono text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {profile.name || "Anonymous"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {profile.email}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {profile.xp}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={bookmarkedIds.has(profile.id) ? "Remove from shortlist" : "Add to shortlist"}
                            onClick={() => toggleBookmark(profile.id)}
                          >
                            {bookmarkedIds.has(profile.id) ? (
                              <BookmarkCheck className="h-4 w-4 text-primary" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Signal interest"
                            onClick={() =>
                              setInterestFormId((prev) =>
                                prev === profile.id ? null : profile.id
                              )
                            }
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(profile)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingId === profile.id}
                            onClick={() => handleDelete(profile.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {interestFormId === profile.id && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-muted/40 pb-3 pt-2">
                          <div className="flex items-end gap-2 px-1">
                            <Textarea
                              placeholder={`Optional message to ${profile.name || "this student"} (max 160 chars)`}
                              maxLength={160}
                              rows={2}
                              value={interestMessage}
                              onChange={(e) => setInterestMessage(e.target.value)}
                              className="flex-1 text-xs resize-none"
                            />
                            <div className="flex flex-col gap-1.5">
                              <Button
                                size="sm"
                                disabled={isSendingInterest}
                                onClick={() => sendInterest(profile.id)}
                              >
                                {isSendingInterest ? "Sending..." : "Send"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setInterestFormId(null);
                                  setInterestMessage("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-xp">XP</Label>
              <Input
                id="edit-xp"
                type="number"
                min={0}
                value={editXp}
                onChange={(e) => setEditXp(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProfile(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
