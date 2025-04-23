import { getUserClient } from "../services/db.ts";
import { parseParkingText } from "../services/llm.ts";
import { Context } from "jsr:@oak/oak";
import { Database } from "../supabase.types.ts";
import { supabase } from "../services/db.ts";
type ParkingInsert =
  Database["public"]["Tables"]["parking_restrictions"]["Insert"];

async function getallData(ctx: Context) {
  const { data, error } = await supabase.from("parking_restrictions").select(
    "*",
  );
  if (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
    return;
  }
  ctx.response.status = 200;
  ctx.response.body = data;
}

async function addNewData(ctx: Context) {
  const token = ctx.request.headers.get("authorization")?.replace(
    "Bearer ",
    "",
  );
  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Missing auth token" };
    return;
  }

  const supabase = getUserClient(token);
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid user" };
    return;
  }

  const newData = await ctx.request.body.json();
  let structured: ParkingInsert;

  if (newData.text && !newData["Restriction Type"]) {
    try {
      const parsed = await parseParkingText(newData.text);
      structured = {
        ...parsed,
        Latitude: newData.latitude,
        Longitude: newData.longitude,
        "Image URL": newData.image_url,
        submitted_by: user.id,
      };
    } catch (err) {
      ctx.response.status = 500;
      ctx.response.body = { error: err };
      return;
    }
  } else {
    structured = {
      ...newData,
      submitted_by: user.id,
    };
  }

  const { data, error } = await supabase
    .from("parking_restrictions")
    .insert([structured])
    .select();

  if (error) {
    ctx.response.status = 403;
    ctx.response.body = { error: error.message };
    return;
  }

  ctx.response.status = 201;
  ctx.response.body = { data };
}

export { addNewData, getallData };
