export async function parseParkingText(text: string) {
  const prompt = `
You are a parking data extractor. Extract structured JSON from this OCR text:

"${text}"

Return a single valid JSON object like this:
{
  "Restriction Type": one of ["Permit Parking", "Pay and Display", "Loading Bay", "Disabled Bay", "Clearway", "EV Parking", "No Loading", "Controlled Parking Zone", "Single Yellow Line", "Double Yellow Line", "Single Red Line", "Double Red Line", "Temporary Restriction", "School Keep Clear Zone"],
  "Controlled Parking Zone": like "A2", "B", or null,
  "Times Of Operation": like "Mon - Fri 8:30am - 6:30pm, Sat 8:30am - 1:30pm" or null,
  "Maximum Stay": like "1 hour", "No return within 2 hours", or null
}
Respond only with JSON.
`.trim();

  console.log("📤 Sending prompt to Mistral:", prompt);

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer 20ThOtXpBmowdDF5GVa5HNAtYhQm7jRL",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
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
  console.log("📥 Mistral raw:", raw);

  try {
    const parsed = JSON.parse(raw);
    return JSON.parse(parsed.choices[0].message.content);
  } catch (err) {
    throw new Error(`❌ Invalid JSON from Mistral: ${raw}`);
  }
}
