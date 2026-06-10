import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { food } = await req.json();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
Estimate calories and macros for this meal:

${food}

Return ONLY raw JSON.

Do NOT wrap the response in markdown.
Do NOT wrap the response in backticks.
Do NOT include explanations.

Example:
{
  "name": "Chicken Rice",
  "calories": 650,
  "protein": 35,
  "carbs": 70,
  "fat": 18
}
`,
    });

   const cleanedText = response.output_text
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

const data = JSON.parse(cleanedText);
    return NextResponse.json(data);
    } catch (error) {
    console.error("Estimate meal error:", error);

    return NextResponse.json(
      { error: "Failed to estimate meal. Check terminal for details." },
      { status: 500 }
    );
  }
}