"use client";

import { createContext, useContext, useRef } from "react";
import { ThemeProvider } from "next-themes";
import Toaster, { type ToasterRef } from "@/components/toast";

const ToasterContext = createContext<React.RefObject<ToasterRef | null>>({
  current: null,
});

export function useToaster() {
  return useContext(ToasterContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const toasterRef = useRef<ToasterRef>(null);

  return (
    <ToasterContext.Provider value={toasterRef}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        disableTransitionOnChange
      >
        {children}
        <Toaster ref={toasterRef} defaultPosition="bottom-right" />
      </ThemeProvider>
    </ToasterContext.Provider>
  );
}
