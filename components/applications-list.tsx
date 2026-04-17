"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApplicationForm } from "./application-form";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2 } from "lucide-react";

interface Application {
  id: string;
  company_name: string;
  role: string;
  application_date: string;
  status: string;
  notes: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-blue-100 text-blue-800",
  interview: "bg-yellow-100 text-yellow-800",
  offer: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  accepted: "bg-emerald-100 text-emerald-800",
};

export function ApplicationsList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/applications");
      if (!response.ok) {
        const data = await response.json();
        if (
          response.status === 400 ||
          data.error?.includes("applications")
        ) {
          setError(
            "Applications table not found. Please run migrations by visiting /api/seed"
          );
          setApplications([]);
          return;
        }
        throw new Error("Failed to fetch applications");
      }
      const data = await response.json();
      setApplications(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      setError("Could not load applications. Please check the server logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAddNew = () => {
    setEditingApplication(null);
    setIsOpen(true);
  };

  const handleEdit = (application: Application) => {
    setEditingApplication(application);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete application");
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const handleSubmit = async (
    data: Omit<Application, "id">
  ) => {
    setIsSubmitting(true);
    try {
      if (editingApplication) {
        // Update
        const response = await fetch(
          `/api/applications/${editingApplication.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) throw new Error("Failed to update application");
        const updated = await response.json();
        setApplications((prev) =>
          prev.map((app) => (app.id === updated.id ? updated : app))
        );
      } else {
        // Create
        const response = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to create application");
        const created = await response.json();
        setApplications((prev) => [created, ...prev]);
      }
      setIsOpen(false);
      setEditingApplication(null);
    } catch (error) {
      console.error("Error saving application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <p className="text-gray-600 mb-4">
            To fix this, visit{" "}
            <a
              href="/api/seed"
              className="text-blue-600 hover:underline"
              target="_blank"
            >
              /api/seed
            </a>{" "}
            to run the database migrations.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <Button onClick={handleAddNew}>+ New Application</Button>
      </div>

      {applications.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <p>No applications yet. Start by adding a new one!</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      {app.company_name}
                    </h3>
                    <Badge className={STATUS_COLORS[app.status]}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-1">{app.role}</p>
                  <p className="text-sm text-gray-500">
                    Applied: {new Date(app.application_date).toLocaleDateString()}
                  </p>
                  {app.notes && (
                    <p className="text-sm text-gray-600 mt-2">{app.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(app)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(app.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingApplication ? "Update Application" : "New Application"}
            </DialogTitle>
          </DialogHeader>
          <ApplicationForm
            application={editingApplication || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setIsOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
