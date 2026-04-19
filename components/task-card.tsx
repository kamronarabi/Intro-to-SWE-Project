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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <span className="xp-badge text-xs">+{task.xp_value} XP</span>
        </div>
        <CardDescription>{task.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {task.is_repeatable && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Repeat className="h-3 w-3" />
            <span>Repeatable · up to {task.max_completions} times</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          onClick={onComplete}
          disabled={isLoading}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Check className="h-4 w-4" />
          Complete
        </Button>
        <Button
          variant="destructive"
          onClick={onDiscard}
          disabled={isLoading}
          size="icon"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
