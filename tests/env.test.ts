import { parse } from "jsr:@std/dotenv";
import { assert } from "https://deno.land/std/assert/mod.ts";

const envText = await Deno.readTextFile(".env"); // or ".env.test"
const envVars = parse(envText);

// set vars manually
for (const [key, value] of Object.entries(envVars)) {
  Deno.env.set(key, value);
}

Deno.test("SUPABASE env vars exist", () => {
  assert(Deno.env.get("SUPABASE_URL"));
  assert(Deno.env.get("SUPABASE_KEY"));
});
