"use client";

import { useState, useEffect } from "react";
import { X, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InterestSignal {
  id: string;
  message: string | null;
  seen: boolean;
  created_at: string;
  recruiter: {
    name: string;
    company: { name: string } | null;
  } | null;
}

export function RecruiterInterestBanner() {
  const [signals, setSignals] = useState<InterestSignal[]>([]);

  useEffect(() => {
    fetch("/api/interests")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSignals(data);
      })
      .catch(() => {});
  }, []);

  function dismiss(id: string) {
    setSignals((prev) => prev.filter((s) => s.id !== id));
    fetch(`/api/interests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seen: true }),
    }).catch(() => {});
  }

  if (signals.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-6">
      {signals.map((signal) => {
        const companyName = signal.recruiter?.company?.name ?? "A recruiter";
        return (
          <div
            key={signal.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {companyName} is interested in your profile
                </p>
                {signal.message && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    &ldquo;{signal.message}&rdquo;
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => dismiss(signal.id)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
