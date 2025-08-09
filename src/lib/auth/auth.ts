import { betterAuth } from "better-auth";
import type { Session, User } from "better-auth";
import { z } from "zod";

// --- TYPE EXTENSIONS ---
// Extend better-auth's types to include custom properties on session and user objects.
declare module "better-auth" {
  interface Session {
    user: {
      id: string;
      tier?: string;
    } & User;
  }

  interface User {
    tier?: string;
  }
}

declare module "better-auth/jwt" {
  interface JWT {
    id: string;
    tier?: string;
  }
}

// --- ENVIRONMENT VARIABLES VALIDATION ---
const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  POSTGRES_URL: z.string().url(),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
});

const env = envSchema.parse(process.env);

// --- BETTER-AUTH CONFIGURATION ---
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = betterAuth({
  database: env.POSTGRES_URL,
  secret: env.BETTER_AUTH_SECRET,
  emailAndPassword: true,
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tier = user.tier;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id;
        session.user.tier = token.tier;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
});

export type { Session, User };