export async function parseParkingText(text: string) {
  const prompt = `
You are a parking data extractor. Extract structured JSON from this text:

"${text}"

Return only valid JSON with:
{
  "Restriction Type": one of ["Permit Parking", "Pay and Display", "Loading Bay", "Disabled Bay", "Clearway", "EV Parking", "No Loading", "Controlled Parking Zone", "Single Yellow Line", "Double Yellow Line", "Single Red Line", "Double Red Line", "Temporary Restriction", "School Keep Clear Zone"],
  "Controlled Parking Zone": like "A2" or null,
  "Times Of Operation": like "Mon - Fri 8:30am - 6:30pm, Sat 8:30am - 1:30pm" or null
}`.trim();

  console.log("📤 Sending prompt to LLM:\n", prompt);

  const res = await fetch(
    "https://3510-86-30-160-220.ngrok-free.app/api/generate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi",
        prompt,
        stream: false, // 🛑 This is the key fix
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
