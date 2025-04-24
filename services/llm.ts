export async function parseParkingText(text: string) {
  const prompt = `
  You are a parking restriction data extractor.
  
  Extract parking info from the following text and return a single-line JSON string. Do not include any extra commentary, code formatting, or line breaks. Just the raw JSON.
  
  TEXT:
  "${text}"
  
  Only include the following keys:
  {
    "Restriction Type": (e.g. "Permit Parking", "EV Parking", etc.),
    "Controlled Parking Zone": (e.g. "A", "A2", or null),
    "Times Of Operation": (e.g. "Mon - Fri 8am - 6pm, Sat 8am - 1pm" or null),
    "Maximum Stay": (e.g. "40 minutes", "No return within 1 hour", or null)
  }
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
        stream: false,
      }),
    },
  );

  function extractValidJson(raw: string): string {
    // Remove markdown or code fences
    const clean = raw
      .replace(/```json|```/g, "")
      .replace(/\n/g, "")
      .trim();

    // Try to match the first {...} block
    const match = clean.match(/{.*}/);
    if (!match) throw new Error("No JSON object found in response");

    return match[0];
  }

  const textBody = await res.text();
  console.log("📥 LLM raw response:\n", textBody);

  try {
    const clean = extractValidJson(textBody);
    return JSON.parse(clean);
  } catch (err) {
    throw new Error(`❌ Invalid LLM JSON: ${textBody}`);
  }
}
