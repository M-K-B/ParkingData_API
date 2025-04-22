import { createClient } from "../deps.ts";
import "jsr:@std/dotenv/load";
import { Database } from "../supabase.types.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_KEY");

export const supabase = createClient<Database>(
  `${SUPABASE_URL}`,
  `${SUPABASE_KEY}`,
);

// Create a user-context client for RLS
export function getUserClient(token: string) {
  return createClient<Database>(
    `${SUPABASE_URL}`,
    `${SUPABASE_KEY}`,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  );
}
