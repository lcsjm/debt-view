import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  console.log("Key:", apiKey ? "Loaded" : "Not loaded");
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: "Hello AI!" }] }]
    });
    console.log("Success! Response:", response.text);
  } catch(e) {
    console.error("Failed:", e);
  }
}
main();
