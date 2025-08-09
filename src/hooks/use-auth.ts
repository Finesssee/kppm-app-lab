"use client";

import { useContext } from "react";
import { AuthContext } from "@/components/auth/AuthProvider";
import { signIn, signOut } from "@/lib/auth/auth-client";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { signIn, signOut };