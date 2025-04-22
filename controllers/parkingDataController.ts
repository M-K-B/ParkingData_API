import { supabase } from "../services/db.ts";
import { Context } from "jsr:@oak/oak";
import { Database } from "../supabase.types.ts";

import { getUserClient } from "../services/db.ts";

type ParkingInsert =
  Database["public"]["Tables"]["parking_restrictions"]["Insert"];
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
  console.log(token);
  const supabase = getUserClient(token);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid user" };
    return;
  }

  const newData = await ctx.request.body.json();

  const insertData = {
    ...newData,
    submitted_by: user.id,
  };
  console.log(insertData);
  const { data, error } = await supabase
    .from("parking_restrictions")
    .insert([insertData])
    .select();

  if (error) {
    ctx.response.status = 403;
    ctx.response.body = { error: error.message };
    return;
  }
  console.log(data);
  ctx.response.status = 201;
  ctx.response.body = { data };
}

export { addNewData, getallData };
