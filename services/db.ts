import { createClient } from "../deps.ts";
import "jsr:@std/dotenv/load";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_KEY");

const supabase = createClient(
  `${SUPABASE_URL}`,
  `${SUPABASE_KEY}`,
  {
    global: {
      fetch: (...args) => fetch(...args),
    },
  },
);

export { supabase };
