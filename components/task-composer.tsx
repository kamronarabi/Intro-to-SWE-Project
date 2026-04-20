"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useToaster } from "@/components/providers";

export function TaskComposer({ onTaskCreated }: { onTaskCreated?: () => void }) {
  const supabase = createClient();
  const toaster = useToaster();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xpValue, setXpValue] = useState(25);
  const [isRepeatable, setIsRepeatable] = useState(false);
  const [maxCompletions, setMaxCompletions] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    let companyId: string | null = null;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();
      companyId = profile?.company_id ?? null;
    }

    const { error: insertError } = await supabase.from("tasks").insert({
      title: title.trim(),
      description: description.trim(),
      xp_value: xpValue,
      is_repeatable: isRepeatable,
      max_completions: isRepeatable ? maxCompletions : 1,
      ...(companyId ? { company_id: companyId } : {}),
    });

    if (insertError) {
      setError(insertError.message);
      setIsSubmitting(false);
      return;
    }

    const createdTitle = title.trim();
    // Reset form
    setTitle("");
    setDescription("");
    setXpValue(25);
    setIsRepeatable(false);
    setMaxCompletions(1);
    setIsSubmitting(false);
    toaster.current?.show({
      title: "Task Created",
      message: `"${createdTitle}" is now live for students.`,
      variant: "success",
    });
    onTaskCreated?.();
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="h-5 w-5" />
          Create Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Name</Label>
            <Input
              id="title"
              placeholder="e.g. Complete a LeetCode problem"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what the student needs to do..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="min-h-[125px]"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="xp">XP Value</Label>
              <Input
                id="xp"
                type="number"
                min={1}
                max={1000}
                value={xpValue}
                onChange={(e) => setXpValue(Number(e.target.value))}
              />
            </div>

            <div className="flex-1 space-y-2">
              <Label>Repeatable</Label>
              <div className="flex items-center gap-3 pt-1.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isRepeatable}
                  onClick={() => setIsRepeatable((v) => !v)}
                  className="relative flex-shrink-0 w-9 h-5 rounded-full border-none cursor-pointer transition-colors duration-200"
                  style={{ background: isRepeatable ? "hsl(var(--foreground))" : "hsl(var(--muted))" }}
                >
                  <span
                    className="absolute top-[3px] w-3.5 h-3.5 rounded-full transition-all duration-200"
                    style={{
                      left: isRepeatable ? 19 : 3,
                      background: isRepeatable ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
                    }}
                  />
                </button>
                {isRepeatable && (
                  <Input
                    type="number"
                    min={2}
                    max={100}
                    value={maxCompletions}
                    onChange={(e) => setMaxCompletions(Number(e.target.value))}
                    placeholder="Max times"
                    className="w-24"
                  />
                )}
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isSubmitting || !title.trim()} className="w-full">
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
