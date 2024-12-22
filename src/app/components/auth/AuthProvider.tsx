"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "./LoginForm";
import { FilePicker } from "../file-picker/FilePicker";
import { useAuth } from "@/app/hooks/api/useAuth";

export function AuthProvider() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isAuthenticated: authState } = useAuth();

  useEffect(() => {
    setMounted(true);
    setIsAuthenticated(authState);
    console.log("[AuthProvider] mounted:", mounted, "authState:", authState);
  }, [authState, mounted]);

  if (!mounted) {
    console.log("[AuthProvider] Not mounted yet");
    return null;
  }

  console.log("[AuthProvider] Render with isAuthenticated:", isAuthenticated);
  return (
    <>
      {!isAuthenticated ? (
        <LoginForm
          onSuccess={() => {
            console.log("[AuthProvider] onSuccess callback from LoginForm");
            setIsAuthenticated(true);
          }}
        />
      ) : (
        <FilePicker />
      )}
    </>
  );
}
