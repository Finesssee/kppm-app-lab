"use client";

// Re-exporting client-safe functions for use in client components.
// This relies on tree-shaking from the main auth.ts file to be effective,
// ensuring that server-only code (like database config) is not bundled with the client.
export { signIn, signOut } from "@/lib/auth/auth";