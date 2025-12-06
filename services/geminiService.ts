import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Character, ScriptResponse } from "../types";

// Helper to clean base64 string for API (remove data:image/png;base64 prefix)
const cleanBase64 = (dataUrl: string) => {
  return dataUrl.split(",")[1];
};

export const generateScript = async (topic: string): Promise<ScriptResponse> => {
  const ai = new GoogleGenAI({ apiKey: __API_KEY__ });   // ← ТҮЗЕЛДІ

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      genre: { type: Type.STRING },
      scenes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sceneNumber: { type: Type.INTEGER },
            description: { type: Type.STRING },
            visualPrompt: { type: Type.STRING },
            suggestedCharacters: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["sceneNumber", "description", "visualPrompt", "suggestedCharacters"],
        },
      },
    },
    required: ["title", "genre", "scenes"],
  };

  const prompt = `
    Create a visual storyboard script for the following topic: "${topic}".
    Break into 6–8 visual keyframes.
    Focus on visual description only.
    Return strictly JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No script generated");
    return JSON.parse(text) as ScriptResponse;
  } catch (error) {
    console.error("Error generating script:", error);
    throw error;
  }
};

export const generateSceneImage = async (
  sceneDescription: string,
  selectedCharacters: Character[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: __API_KEY__ });   // ← ТҮЗЕЛДІ

  const parts: any[] = [];
  let charDescriptionString = "";

  selectedCharacters.forEach((char, index) => {
    parts.push({
      inlineData: {
        mimeType: char.mimeType,
        data: cleanBase64(char.imageBase64),
      },
    });
    charDescriptionString += `Reference image ${index + 1} is "${char.name}". `;
  });

  const prompt = `
    Generate a cinematic keyframe.
    Visual: ${sceneDescription}
    ${charDescriptionString}
    Style: photorealistic, 4K, cinematic lighting.
  `;

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts },
    });

    const candidates = response.candidates;
    if (candidates?.length) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
