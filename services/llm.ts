export async function parseParkingText(text: string) {
  const prompt = `
You are a parking data extractor. Extract structured JSON from this text:

"${text}"

Return only valid JSON with:
{
  "Restriction Type": one of ["Permit Parking", "Pay and Display", "Loading Bay", "Disabled Bay", "Clearway", "EV Parking", "No Loading", "Controlled Parking Zone", "Single Yellow Line", "Double Yellow Line", "Single Red Line", "Double Red Line", "Temporary Restriction", "School Keep Clear Zone"],
  "Controlled Parking Zone": like "A2" or null,
  "Times Of Operation": like "Mon - Sat 8am - 6pm" or null
}`.trim();

  console.log("📤 Sending prompt to LLM:\n", prompt);

  const res = await fetch(
    "https://3510-86-30-160-220.ngrok-free.app/api/generate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "phi", prompt }),
    },
  );

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No stream available from LLM");

  const decoder = new TextDecoder();
  let output = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    output += decoder.decode(value, { stream: true });
  }

  console.log("📥 Full raw LLM stream:\n", output);

  try {
    const lines = output.trim().split("\n");
    const combined = lines
      .map((line) => {
        try {
          return JSON.parse(line).response || "";
        } catch {
          return "";
        }
      })
      .join("")
      .trim();

    console.log("🧠 Parsed combined JSON text:\n", combined);
    return JSON.parse(combined);
  } catch (err) {
    throw new Error(`❌ Final JSON parse failed: ${err}\nRaw: ${output}`);
  }
}
