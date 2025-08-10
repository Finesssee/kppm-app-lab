/**
 * Centralized error logger.
 * In a real app, you would integrate this with a service like Sentry, Datadog, or LogRocket.
 * @param error The error object to log.
 * @param context Optional context to provide more information about the error.
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  console.error("Caught an error:", error, "with context:", context);
  // TODO: Integrate with a monitoring service like Sentry.
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: context });
  // }
}