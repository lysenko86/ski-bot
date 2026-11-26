import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY не знайдено");
}

const ai = new GoogleGenAI({
  apiKey,
});

export async function askGemini(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "models/gemini-3.5-flash-lite",
    contents: prompt,
  });

  return response.text ?? "Не вдалося отримати відповідь.";
}