"use client";

import { UserProvider } from "@/components/user-context";
import { AppHeader } from "@/components/app-header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </UserProvider>
  );
}
