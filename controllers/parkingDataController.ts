import { getUserClient } from "../services/db.ts";
import { parseParkingText } from "../services/llm.ts";
import { Context } from "jsr:@oak/oak";
import { Database } from "../supabase.types.ts";
import { supabase } from "../services/db.ts";

type ParkingInsert =
  Database["public"]["Tables"]["parking_restrictions"]["Insert"];

async function getallData(ctx: Context) {
  console.log("GET /getAllData called");
  const { data, error } = await supabase.from("parking_restrictions").select(
    "*",
  );
  if (error) {
    console.error("Error fetching all data:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
    return;
  }
  ctx.response.status = 200;
  ctx.response.body = data;
}

async function addNewData(ctx: Context) {
  console.log("POST /AddNewData hit");
  const token = ctx.request.headers.get("authorization")?.replace(
    "Bearer ",
    "",
  );
  console.log("Token:", token);

  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Missing auth token" };
    return;
  }

  const supabase = getUserClient(token);
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("User error:", userError);
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid user" };
    return;
  }

  const newData = await ctx.request.body.json();
  console.log("Incoming data:", newData);

  let structured: ParkingInsert;

  if (newData.text && !newData["Restriction Type"]) {
    console.log("Text found, parsing via LLM...");
    try {
      const parsed = await parseParkingText(newData.text);
      console.log("Parsed result:", parsed);
      structured = {
        ...parsed,
        Latitude: newData.latitude,
        Longitude: newData.longitude,
        "Image URL": newData.image_url,
        submitted_by: user.id,
      };
    } catch (err) {
      console.error("LLM parse error:", err);
      ctx.response.status = 500;
      ctx.response.body = { error: err };
      return;
    }
  } else {
    console.log("Using provided structured data");
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
    console.error("Insert error:", error);
    ctx.response.status = 403;
    ctx.response.body = { error: error.message };
    return;
  }

  console.log("Inserted data:", data);
  ctx.response.status = 201;
  ctx.response.body = { data };
}

export { addNewData, getallData };
