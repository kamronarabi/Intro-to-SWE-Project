"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Repeat } from "lucide-react";

export interface Task {
  id: string;
  title: string;
  description: string;
  xp_value: number;
  is_repeatable: boolean;
  max_completions: number;
}

interface TaskCardProps {
  task: Task;
  onComplete: () => void;
  onDiscard: () => void;
  isLoading: boolean;
}

export function TaskCard({ task, onComplete, onDiscard, isLoading }: TaskCardProps) {
  return (
    <Card className="w-full h-full flex flex-col overflow-visible">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold leading-snug">{task.title}</CardTitle>
          <span className="shrink-0 border border-border text-muted-foreground rounded-md px-1.5 py-0.5 text-[11px] font-medium font-mono">+{task.xp_value} XP</span>
        </div>
        <CardDescription className="text-xs leading-relaxed">{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="py-2">
        {task.is_repeatable && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Repeat className="h-3 w-3" />
            <span>Repeatable · up to {task.max_completions} times</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2 mt-auto">
        <Button
          onClick={onComplete}
          disabled={isLoading}
          size="sm"
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Check className="h-3.5 w-3.5" />
          Complete
        </Button>
        <Button
          variant="destructive"
          onClick={onDiscard}
          disabled={isLoading}
          size="icon"
          className="h-8 w-8"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
