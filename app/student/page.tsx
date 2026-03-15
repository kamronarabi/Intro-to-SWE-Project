import { SignOutButton } from "@/components/sign-out-button";

export default function StudentPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>
      <p className="text-muted-foreground">Student page — content coming soon.</p>
      <SignOutButton />
    </div>
  );
}
