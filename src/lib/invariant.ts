/**
 * Asserts that a condition is true. If it's not, it throws a `InvariantError`.
 * This is useful for asserting internal invariants that should always be true.
 * It's a way to make your code's assumptions explicit.
 * In production builds, the message is stripped to save bytes.
 *
 * @param condition The condition to check.
 * @param message The message to throw if the condition is false. Can be a string or a function that returns a string for lazy evaluation.
 */
export class InvariantError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "InvariantError";
  }
}

export function invariant(
  condition: unknown,
  message?: string | (() => string)
): asserts condition {
  if (!condition) {
    const prefix = "Invariant failed";
    const providedMessage = typeof message === "function" ? message() : message;
    const finalMessage = providedMessage ? `${prefix}: ${providedMessage}` : prefix;
    throw new InvariantError(finalMessage);
  }
}