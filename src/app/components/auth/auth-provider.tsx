"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { FilePicker } from "../file-picker/file-picker";

export function AuthProvider() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      {!isAuthenticated ? (
        <LoginForm onSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <FilePicker />
      )}
    </>
  );
}
