"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToaster } from "@/components/providers";

type Tab = "admin" | "student";
type Mode = "login" | "signup";

interface AuthModalProps {
  initialTab?: Tab;
  initialMode?: Mode;
}

export function AuthModal({ initialTab = "student", initialMode = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toaster = useToaster();

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRepeatPassword("");
    setError(null);
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    // Admins can only login, not sign up
    if (newTab === "admin") setMode("login");
    resetForm();
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      if (mode === "signup") {
        // Only students can sign up
        if (!email.endsWith("@ufl.edu")) {
          throw new Error("Only @ufl.edu email addresses can create a student account");
        }
        if (password !== repeatPassword) {
          throw new Error("Passwords do not match");
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, role: "student" },
          },
        });
        if (signUpError) {
          // Provide a friendlier message for duplicate email
          if (signUpError.message.toLowerCase().includes("already registered")) {
            throw new Error("An account with this email already exists. Please log in instead.");
          }
          throw signUpError;
        }

        // If Supabase returns a user with an empty session and identities is empty,
        // it means the email is already taken (email confirmation disabled case)
        if (
          signUpData.user &&
          signUpData.user.identities &&
          signUpData.user.identities.length === 0
        ) {
          throw new Error("An account with this email already exists. Please log in instead.");
        }

        toaster.current?.show({
          title: "Account Created",
          message: `Welcome to LevelUp, ${name}!`,
          variant: "success",
        });
        router.push("/student");
        router.refresh();
      } else {
        // Login
        const { data: authData, error: loginError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });
        if (loginError) throw loginError;

        // Look up the user's role and redirect accordingly
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .maybeSingle();
        if (profileError) throw profileError;
        if (!profile) throw new Error("Profile not found. Please contact an administrator.");

        toaster.current?.show({
          title: "Welcome back",
          message: "Signed in successfully.",
          variant: "success",
        });
        router.push(profile.role === "admin" ? "/admin" : "/student");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">
          {mode === "login" ? "Login" : "Create Account"}
        </CardTitle>
        <CardDescription>
          {tab === "admin"
            ? "Sign in as an administrator"
            : mode === "login"
              ? "Sign in to your student account"
              : "Create a new student account (requires @ufl.edu email)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Tab switcher */}
        <div className="flex mb-6 border rounded-md overflow-hidden">
          <button
            type="button"
            onClick={() => handleTabChange("student")}
            className={`flex-1 py-2 text-sm font-medium ${
              tab === "student"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("admin")}
            className={`flex-1 py-2 text-sm font-medium ${
              tab === "admin"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            {mode === "signup" && (
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={tab === "student" ? "name@ufl.edu" : "admin@example.com"}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {mode === "signup" && (
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">Confirm Password</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? mode === "login"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </Button>
          </div>

          {/* Only students can toggle between login/signup */}
          {tab === "student" && (
            <div className="mt-4 text-center text-sm">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeChange("signup")}
                    className="underline underline-offset-4"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeChange("login")}
                    className="underline underline-offset-4"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
