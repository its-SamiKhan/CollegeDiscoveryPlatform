"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import ToastContainer from "../shared/ToastContainer";
import { ThemeProvider } from "./ThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <ToastContainer />
      </ThemeProvider>
    </SessionProvider>
  );
}
