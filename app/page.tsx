"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";

type View = "landing" | "login" | "signup";

export default function Home() {
  const [view, setView] = useState<View>("landing");

  return (
    <AuroraBackground showRadialGradient={true}>
      <div className="z-10 flex flex-col items-center justify-center w-full h-full">
        <AnimatePresence mode="wait">
          {view === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex flex-col items-center gap-8 text-center px-6"
            >
              <div className="flex flex-col items-center gap-3">
                <h1 className="text-8xl font-bold">LevelUp</h1>
                <p className="text-4xl text-muted-foreground">
                  A platform to help actually land a job.
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-32"
                  onClick={() => setView("login")}
                >
                  Log In
                </Button>
                <Button
                  size="lg"
                  className="min-w-32"
                  onClick={() => setView("signup")}
                >
                  Sign Up
                </Button>
              </div>
            </motion.div>
          )}

          {(view === "login" || view === "signup") && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex flex-col items-center gap-4 w-full px-6"
            >
              <button
                onClick={() => setView("landing")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                ← Back
              </button>
              <AuthModal
                initialMode={view === "login" ? "login" : "signup"}
                initialTab="student"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuroraBackground>
  );
}
