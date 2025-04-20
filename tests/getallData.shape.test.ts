import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { getallData } from "../controllers/parkingDataController.ts";

Deno.test("getallData returns correct shape", async () => {
  const ctx: any = { response: {} };
  await getallData(ctx);
  assertEquals(typeof ctx.response.body, "object");
});
