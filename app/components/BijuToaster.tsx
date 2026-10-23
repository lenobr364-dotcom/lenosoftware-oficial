"use client";

import { Toaster } from "react-hot-toast";

export function BijuToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4200,
        className: "",
        style: {
          background: "linear-gradient(165deg, rgba(14,14,18,0.92) 0%, rgba(8,8,12,0.95) 100%)",
          color: "rgba(245,245,245,0.96)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "1rem",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 16px 48px -20px rgba(0,0,0,0.75)",
          backdropFilter: "blur(20px)",
          padding: "12px 16px",
          fontSize: "0.875rem",
          maxWidth: "min(22rem, calc(100vw - 2rem))",
        },
        success: {
          iconTheme: { primary: "#22d3ee", secondary: "#020308" },
          style: {
            borderColor: "rgba(34,211,238,0.28)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 40px -12px rgba(34,211,238,0.35)",
          },
        },
        error: {
          iconTheme: { primary: "#fb7185", secondary: "#020308" },
          style: {
            borderColor: "rgba(251,113,133,0.35)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 36px -12px rgba(251,113,133,0.25)",
          },
        },
      }}
    />
  );
}
