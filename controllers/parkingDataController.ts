import { getUserClient } from "../services/db.ts";
import { parseParkingText } from "../services/llm.ts";
import { Context } from "jsr:@oak/oak";
import { Database } from "../supabase.types.ts";
import { supabase } from "../services/db.ts";

type ParkingInsert =
  Database["public"]["Tables"]["parking_restrictions"]["Insert"];

// Queue setup
const taskQueue: (() => Promise<void>)[] = [];
let processing = false;

// Queue worker
async function processQueue() {
  if (processing || taskQueue.length === 0) return;

  processing = true;
  const task = taskQueue.shift();
  if (task) {
    try {
      await task();
    } catch (err) {
      console.error("Task failed:", err);
    }
  }
  processing = false;
  if (taskQueue.length > 0) {
    // Keep processing next tasks
    processQueue();
  }
}

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
  console.log("Queueing new incoming data:", newData);

  // Create a task and add to queue
  taskQueue.push(async () => {
    console.log("Processing queued data...");
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
        console.error("LLM parse error:", err);
        // Fail silently inside task, not affecting next tasks
        return;
      }
    } else {
      structured = {
        ...newData,
        submitted_by: user.id,
      };
    }

    const { error: insertError } = await client
      .from("parking_restrictions")
      .insert([structured]);

    if (insertError) {
      console.error("Insert error:", insertError);
      // Fail silently inside task
    } else {
      console.log("Inserted structured data.");
    }
  });

  processQueue();

  // Respond immediately
  ctx.response.status = 202; // Accepted
  ctx.response.body = { message: "Queued for processing" };
}

export { addNewData, getallData };
