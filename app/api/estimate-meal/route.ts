import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { food, image } = await req.json();

    if (!food && !image) {
      return NextResponse.json(
        { error: "Food description or image is required" },
        { status: 400 }
      );
    }

    const prompt = `
Estimate calories and macros for this meal.

Important:
- If an image is provided, identify visible food items and estimate realistic portions.
- If text is provided, use it to improve the estimate.
- Assume Singapore/Malaysia hawker or restaurant portions unless the user says homemade.
- Do not underestimate oils, sauces, rice, fried egg, hidden fats, or large portions.
- For homemade food, use normal home-cooking portions and do not overinflate calories.
- Return practical fitness-tracking estimates.

Meal description:
${food || "No text description provided."}

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
`;

    const inputContent: any[] = [
      {
        type: "input_text",
        text: prompt,
      },
    ];

    if (image) {
      inputContent.push({
        type: "input_image",
        image_url: image,
      });
    }

    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input: [
        {
          role: "user",
          content: inputContent,
        },
      ],
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