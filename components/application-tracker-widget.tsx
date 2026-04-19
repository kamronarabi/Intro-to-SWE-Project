"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplicationForm } from "@/components/application-form";
import { ApplicationsList } from "@/components/applications-list";
import { useToaster } from "@/components/providers";

interface Application {
  id: string;
  company_name: string;
  role: string;
  application_date: string;
  status: string;
  notes: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  applied:   "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  interview: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  offer:     "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  rejected:  "bg-red-500/10 text-red-400 border border-red-500/20",
  accepted:  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

const STATUS_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "accepted", label: "Accepted" },
];

export function ApplicationTrackerWidget() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toaster = useToaster();

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      if (!res.ok) return;
      const data = await res.json();
      setApplications(data);
    } catch {
      // silently fail — widget is secondary UI
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (app: Application, newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...app, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a))
      );
      toaster.current?.show({
        title: "Status Updated",
        message: `${app.company_name} → ${newStatus}`,
        variant: "success",
      });
    } catch {
      toaster.current?.show({
        message: "Failed to update status.",
        variant: "error",
      });
    }
  };

  const handleDelete = async (app: Application) => {
    if (!confirm(`Remove application to ${app.company_name}?`)) return;
    try {
      const res = await fetch(`/api/applications/${app.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setApplications((prev) => prev.filter((a) => a.id !== app.id));
      toaster.current?.show({
        title: "Application Removed",
        message: app.company_name,
        variant: "warning",
      });
    } catch {
      toaster.current?.show({ message: "Failed to delete application.", variant: "error" });
    }
  };

  const handleAdd = async (data: Omit<Application, "id">) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      const created = await res.json();
      setApplications((prev) => [created, ...prev]);
      setIsAddOpen(false);
      toaster.current?.show({
        title: "Application Added",
        message: data.company_name,
        variant: "success",
      });
    } catch {
      toaster.current?.show({ message: "Failed to add application.", variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const recent = applications.slice(0, 5);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-base">Applications</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAll(true)}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Show All
          </button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No applications yet.{" "}
          <button
            onClick={() => setIsAddOpen(true)}
            className="text-muted-foreground hover:text-foreground underline"
          >
            Add one
          </button>
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {recent.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-muted/30 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{app.company_name}</p>
                <p className="text-xs text-muted-foreground truncate">{app.role}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Select
                  value={app.status}
                  onValueChange={(val) => handleStatusChange(app, val)}
                >
                  <SelectTrigger className="h-6 text-xs border-0 bg-transparent p-0 w-auto gap-1 focus:ring-0">
                    <Badge className={`text-xs ${STATUS_COLORS[app.status] ?? ""}`}>
                      {STATUS_OPTIONS.find((o) => o.value === app.status)?.label ?? app.status}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(app)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Application Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Application</DialogTitle>
          </DialogHeader>
          <ApplicationForm
            onSubmit={handleAdd}
            onCancel={() => setIsAddOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Show All Dialog */}
      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Applications</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <ApplicationsList />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
