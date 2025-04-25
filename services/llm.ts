import "jsr:@std/dotenv/load";

const openrouter_key = Deno.env.get("OPEN_ROUTER_KEY");

export async function parseParkingText(text: string, roadName: string) {
  const prompt = `
You are a parking data extractor. Extract structured JSON from this OCR text:

"${text}"

Return a single valid JSON object like this:
{
  "Restriction Type": one of ["Permit Parking", "Pay and Display", "Loading Bay", "Disabled Bay", "Clearway", "EV Parking", "No Loading", "Controlled Parking Zone", "Single Yellow Line", "Double Yellow Line", "Single Red Line", "Double Red Line", "Temporary Restriction", "School Keep Clear Zone"],
  "Controlled Parking Zone": a valid permit area code like "A", "A2", "B", or null,
  "Times Of Operation": example format: "Mon - Fri 8:30am - 6:30pm, Sat 8:30am - 1:30pm", or null,
  "Maximum Stay": example values: "20 mins", "1 hour", "No return within 2 hours", or null
}
Respond only with valid JSON and nothing else.`.trim();

  console.log("📤 Sending prompt to OpenRouter:", prompt);

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openrouter_key}`,
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
  console.log("📥 OpenRouter raw:", raw);

  try {
    const parsed = JSON.parse(raw);
    const jsonText = parsed.choices[0].message.content.trim().replace(
      /^```json|```$/g,
      "",
    ).trim();

    const json = JSON.parse(jsonText);

    // Inject road name into the final result
    return {
      ...json,
      "Road Name": roadName,
    };
  } catch (err) {
    throw new Error(`❌ Invalid JSON from OpenRouter: ${raw}`);
  }
}
