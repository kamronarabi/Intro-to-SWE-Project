"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SideNav from '@/components/ui/student-dashboard/sidenav';
 
export default function Layout({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserName(profile.name);
      }
    }

    loadUser();
  }, [supabase]);

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-56">
        <SideNav userName={userName} />
      </div>
      <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}