import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

async function testModel(model: string) {
  try {
    console.log(`\n=== ${model} ===`);

    const response = await ai.models.generateContent({
      model,
      contents: "Привіт",
    });

    console.log("✅ SUCCESS");
    console.log(response.text);
  } catch (error: any) {
    console.log("❌ ERROR");
    console.log(error?.status);
    console.log(error?.message);
  }
}

async function main() {
  await testModel("models/gemini-2.5-flash-lite");
  await testModel("models/gemini-3.5-flash-lite");
  await testModel("models/gemini-2.5-flash");
  await testModel("models/gemini-3.5-flash");
}

main();