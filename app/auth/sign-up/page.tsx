import { AuthModal } from "@/components/auth-modal";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <AuthModal initialTab="student" initialMode="signup" />
    </div>
  );
}
