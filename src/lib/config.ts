import { invariant } from "./invariant";

// Use a type for environment variables for better intellisense and type-checking.
type Env = {
  VITE_API_URL: string | undefined;
  VITE_ENABLE_MOCKS: "true" | "false" | undefined;
};

// Access environment variables in a type-safe way.
const env: Env = {
  VITE_API_URL: import.meta.env?.VITE_API_URL,
  VITE_ENABLE_MOCKS: import.meta.env?.VITE_ENABLE_MOCKS as Env['VITE_ENABLE_MOCKS'],
};

/**
 * Validates the environment variables.
 * Throws an error if any required variable is missing.
 */
function validateConfig(): void {
  invariant(env.VITE_API_URL, "VITE_API_URL is not defined in your .env file");
}

// Run validation on module load.
validateConfig();

/**
 * A type-safe config object that is validated on startup.
 */
export const config = {
  apiUrl: env.VITE_API_URL as string,
  enableMocks: env.VITE_ENABLE_MOCKS === "true",
} as const;