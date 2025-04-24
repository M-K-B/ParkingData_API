export async function parseParkingText(text: string) {
  const prompt = `
You are a parking data extractor. Extract structured JSON from the following raw sign text:

"${text}"

Return only **valid JSON** with these fields:
{
  "Restriction Type": string // One of: ["Permit Parking", "Pay and Display", "Loading Bay", "Disabled Bay", "Clearway", "EV Parking", "No Loading", "Controlled Parking Zone", "Single Yellow Line", "Double Yellow Line", "Single Red Line", "Double Red Line", "Temporary Restriction", "School Keep Clear Zone"],
  "Controlled Parking Zone": string | null // Example: "A", "A2", "B3", etc.
  "Times Of Operation": string | null // Example: "Mon - Fri 8:30am - 6:30pm, Sat 8:30am - 1:30pm"
  "Valid Parking Permits": string | null // Example: "A2", "B", "C1" — extract only if permit is mentioned
  "Maximum Stay": string | null // Examples: "1 hour", "No return within 1 hour", "40 mins", etc.
}

Avoid extra text. Do not return markdown or explanation. Only return the JSON object. If any fields are missing, set them to null.
`.trim();

  console.log("📤 Sending prompt to LLM:\n", prompt);

  const res = await fetch(
    "https://3510-86-30-160-220.ngrok-free.app/api/generate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi",
        prompt,
        stream: true,
      }),
    },
  );

  const textBody = await res.text();
  console.log("📥 LLM raw response:\n", textBody);

  try {
    const json = JSON.parse(textBody);
    return JSON.parse(json.response);
  } catch (err) {
    throw new Error(`❌ Invalid LLM JSON: ${textBody}`);
  }
}
