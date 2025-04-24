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

  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "phi", prompt }),
  });

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  let fullResponse = "";
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    // Match each line of JSON
    chunk.trim().split("\n").forEach((line) => {
      try {
        const parsed = JSON.parse(line);
        if (parsed.response) fullResponse += parsed.response;
      } catch (_) {
        // Ignore bad lines
      }
    });
  }

  console.log("📥 LLM stitched response:", fullResponse);

  try {
    return JSON.parse(fullResponse);
  } catch (err) {
    throw new Error(`❌ Final JSON parse failed: ${fullResponse}`);
  }
}
