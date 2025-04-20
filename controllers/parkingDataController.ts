import { supabase } from "../services/db.ts";
import { Context } from "jsr:@oak/oak";

async function getallData(ctx: Context) {
  console.log("GET /allData hit");

  const { data, error } = await supabase
    .from("parking_restrictions")
    .select("*");

  if (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
    return;
  }

  ctx.response.status = 200;
  ctx.response.body = data;
}

export { getallData };
