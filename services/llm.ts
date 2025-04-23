export async function parseParkingText(text: string) {
  const prompt = `
  You are a UK parking sign parser. Input is raw OCR text from a parking sign. Your job is to extract structured JSON with 3 fields.
  
  OCR TEXT:
  "${text}"
  
  Return ONLY valid JSON:
  {
    "Restriction Type": one of [
      "Permit Parking", "Pay and Display", "Loading Bay", "Disabled Bay", "Clearway", "EV Parking", "No Loading",
      "Controlled Parking Zone", "Single Yellow Line", "Double Yellow Line",
      "Single Red Line", "Double Red Line", "Temporary Restriction", "School Keep Clear Zone"
    ],
    "Controlled Parking Zone": string like "A2" or null,
    "Times Of Operation": string — can be one or multiple blocks like:
      "Mon - Fri 8:30am - 6:30pm, Sat 8:30am - 1:30pm"
  }
  
  Rules:
  - Restriction Type must match the text. Use "Unknown" if no clear match.
  - Times Of Operation can include multiple blocks, separated by commas.
  - Accept formats like “Mon–Fri”, “Sat”, “8.30am–6.30pm”, etc.
  - Controlled Zone (e.g. “A2”, “Z”) is optional, but include it if detected.
  - Output MUST be parseable JSON. No comments or extra text.
  
  Example input:
  "Permit holders only A2\nMon–Fri 8.30–6.30\nSat 8.30–1.30"
  
  Example output:
  {
    "Restriction Type": "Permit Parking",
    "Controlled Parking Zone": "A2",
    "Times Of Operation": "Mon - Fri 8:30am - 6:30pm, Sat 8:30am - 1:30pm"
  }
  `.trim();

  console.log("📤 Sending prompt to LLM:\n", prompt);

  const res = await fetch(
    "https://3510-86-30-160-220.ngrok-free.app/api/generate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "phi", prompt }),
    },
  );

  const raw = await res.text();
  console.log("📥 LLM raw response:\n", raw);

  try {
    const json = JSON.parse(raw);
    return JSON.parse(json.response);
  } catch (err) {
    throw new Error(`❌ Invalid LLM JSON: ${raw}`);
  }
}
