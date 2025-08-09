import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import * as jose from "jose";
// The 'better-auth/jwt' import is assumed to provide a `getToken` function
// similar to 'next-auth/jwt' for accessing the session JWT on the server.
import { getToken } from "better-auth/jwt";
import { App, Category } from "@/types/app";

// Standard Supabase client for unauthenticated access on the client side.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Server client for server-side rendering and actions
export const supabaseServer = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
};

const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);
if (!process.env.SUPABASE_JWT_SECRET) {
  console.warn("SUPABASE_JWT_SECRET is not set. JWT functions will not work.");
}

/**
 * Signs a JWT with user data for Supabase RLS.
 */
export async function signSupabaseJwt(user: { id: string; email?: string; [key: string]: any }) {
  if (!process.env.SUPABASE_JWT_SECRET) {
    throw new Error("SUPABASE_JWT_SECRET is not set.");
  }
  const payload = {
    ...user,
    aud: "authenticated",
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
  };
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
  return jwt;
}

/**
 * Verifies a Supabase JWT.
 */
export async function verifySupabaseJwt(jwt: string) {
  if (!process.env.SUPABASE_JWT_SECRET) {
    throw new Error("SUPABASE_JWT_SECRET is not set.");
  }
  try {
    const { payload } = await jose.jwtVerify(jwt, secret, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export async function getAppStats(slug: string): Promise<{ views: number; forks: number } | null> {
    const { data, error } = await supabaseServer()
        .from('apps')
        .select('views, forks')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error(`Error fetching stats for app ${slug}:`, error);
        return null;
    }
    return data;
}

export async function incrementForkCount(slug: string): Promise<void> {
    const { error } = await supabaseServer().rpc('increment_fork_count', { app_slug: slug });
    if (error) {
        console.error(`Error incrementing fork count for ${slug}:`, error);
    }
}

export async function getTrendingApps(): Promise<App[]> {
    const { data, error } = await supabaseServer()
        .from('apps')
        .select(`*, categories ( id, name )`)
        .order('forks', { ascending: false })
        .limit(10);
    
    if (error) {
        console.error("Error fetching trending apps:", error);
        return [];
    }
    return data as App[];
}

export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabaseServer()
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
    
    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
    return data as Category[];
}

/**
 * Creates a Supabase client authenticated with the current user's JWT.
 * This should be used in Server Components, Server Actions, or API routes
 * to perform RLS-enabled database queries.
 * It relies on `getToken` from `better-auth/jwt` to extract the JWT from cookies.
 */
export async function getSupabaseUserClient() {
  // getToken is assumed to work in server environments by reading cookies
  // and decrypting the JWT. The `raw: true` option is assumed to return the
  // encoded JWT string.
  const token = await getToken({ raw: true });

  if (!token) {
    // Return a non-authenticated client for public access.
    // Depending on the use case, you might want to throw an error here instead.
    return supabase;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  );
}