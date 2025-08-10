"use client";

/**
 * @file Unified toast notification facade.
 *
 * This module provides a single, consistent API for showing toast notifications
 * throughout the application. It abstracts the underlying implementation, which
 * is currently based on the shadcn/ui toast system (which uses Radix UI).
 *
 * By centralizing the toast API, we can:
 * 1. Easily swap the underlying toast library in the future.
 * 2. Add application-wide logic (e.g., logging, analytics) to all toasts.
 * 3. Enforce consistent toast behavior and styling.
 *
 * All parts of the application should import `toast` and related utilities
 * from this file (`@/lib/toast`), not directly from `@/hooks/use-toast`
 * or other libraries like 'sonner'.
 */

import { toast as shadcnToast, useToast } from "@/hooks/use-toast";
import type { ToastActionElement } from "@/components/ui/toast";

// Extract the type of the toast properties object from the original toast function.
export type Toast = Parameters<typeof shadcnToast>[0];

// Re-export the main toast function.
export const toast = shadcnToast;

// Re-export the useToast hook and other related types.
export { useToast, type ToastActionElement };