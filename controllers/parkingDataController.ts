// routes/parking.ts
import { getUserClient, supabase } from "../services/db.ts";
import { parseParkingText } from "../services/llm.ts";
import { Context } from "jsr:@oak/oak";
import type { Database } from "../supabase.types.ts";

type ParkingInsert =
  Database["public"]["Tables"]["parking_restrictions"]["Insert"];

const taskQueue: (() => Promise<void>)[] = [];
let processing = false;

async function processQueue() {
  if (processing || taskQueue.length === 0) {
    if (!processing && taskQueue.length === 0) {
      console.log("✅ Queue is empty.");
    }
    return;
  }
  processing = true;
  console.log(`🔵 Starting task. Remaining queue length: ${taskQueue.length}`);
  const task = taskQueue.shift()!;
  try {
    await task();
    console.log("✅ Task completed.");
  } catch (err) {
    console.error("❌ Task failed:", err);
  }
  processing = false;
  if (taskQueue.length) processQueue();
  else console.log("✅ All tasks completed, queue is empty.");
}

export async function getallData(ctx: Context) {
  console.log("GET /getAllData called");
  const { data, error } = await supabase
    .from("parking_restrictions")
    .select("*");
  if (error) {
    console.error("Error fetching all data:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
    return;
  }
  ctx.response.status = 200;
  ctx.response.body = data;
}

export async function addNewData(ctx: Context) {
  console.log("POST /AddNewData hit");
  const token = ctx.request.headers.get("authorization")?.replace(
    "Bearer ",
    "",
  );
  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Missing auth token" };
    return;
  }

  const client = getUserClient(token);
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user) {
    console.error("User error:", userError);
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid user" };
    return;
  }

  const newData = await ctx.request.body.json();
  console.log("📥 Queueing new incoming data:", newData);

  taskQueue.push(async () => {
    console.log("⚙️ Processing queued data...");
    let structured: ParkingInsert;

    if (newData.text && !newData["Restriction Type"]) {
      const parsed = await parseParkingText(newData.text, newData.road_name);
      structured = {
        ...parsed,
        Latitude: newData.latitude,
        Longitude: newData.longitude,
        "Image URL": newData.image_url,
        status: "pending",
        submitted_by: user.id,
      };
    } else {
      structured = {
        ...newData,
        status: "pending",
        submitted_by: user.id,
      } as ParkingInsert;
    }

    const { error: insertError } = await client
      .from("parking_restrictions")
      .insert([structured]);

    if (insertError) {
      console.error("Insert error:", insertError);
    } else {
      console.log("✅ Inserted structured data into database.");
    }
  });

  console.log(`📝 Task added. Current queue length: ${taskQueue.length}`);
  processQueue();

  ctx.response.status = 202;
  ctx.response.body = { message: "Queued for processing" };
}
