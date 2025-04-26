import "jsr:@std/dotenv/load";

const openrouter_key = Deno.env.get("OPEN_ROUTER_KEY");

export async function parseParkingText(
  text: string,
  roadName: string,
) {
  const prompt = `
You are a parking data extractor. Extract structured JSON from this OCR text:

"${text}"

Return only valid JSON like:
{
  "Restriction Type": one of ["Permit Parking", "Pay and Display", "Loading Bay", "Disabled Bay", "Clearway", "EV Parking", "No Loading", "Controlled Parking Zone", "Single Yellow Line", "Double Yellow Line", "Single Red Line", "Double Red Line", "Temporary Restriction", "School Keep Clear Zone"],
  "Controlled Parking Zone": a valid permit area code like "A", "A2", "B", or null,
  "Times Of Operation": example "Mon - Fri 8:30am - 6:30pm, Sat 8:30am - 1:30pm", or null,
  "Maximum Stay": example "20 mins", "1 hour", "No return within 2 hours", or null
}`.trim();

  console.log("📤 Prompt:", prompt);

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openrouter_key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-r1:free",
      messages: [
        {
          role: "system",
          content: "You extract structured data from street signs.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const raw = await res.text();
  console.log("📥 Raw LLM output:", raw);

  let extracted: Record<string, any>;
  try {
    const parsed = JSON.parse(raw);
    const jsonText = parsed.choices[0].message.content
      .trim()
      .replace(/^```json|```$/g, "")
      .trim();
    extracted = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`Invalid JSON from LLM: ${raw}`);
  }

  // normalize keys to match your DB
  return {
    "Restriction Type": extracted["Restriction Type"] ?? null,
    "Controlled Parking Zone": extracted["Controlled Parking Zone"] ?? null,
    "Times Of Operation": extracted["Times Of Operation"] ??
      extracted["Times of Operation"] ??
      extracted["Time of Operation"] ??
      null,
    "Maximum Stay": extracted["Maximum Stay"] ??
      extracted["Max Stay"] ??
      null,
    "Road Name": roadName,
  };
}
