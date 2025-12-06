import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Character, ScriptResponse } from "../types";

// Helper to clean base64 string for API (remove data:image/png;base64, prefix)
const cleanBase64 = (dataUrl: string) => {
  return dataUrl.split(',')[1];
};

/**
 * Generates a script based on a user prompt.
 * Returns a structured JSON object with scenes.
 */
export const generateScript = async (topic: string): Promise<ScriptResponse> => {
  const ai = new GoogleGenAI({ apiKey:AIzaSyBZOmJWwa3hWzEltEOwfH-6n_rhWWpb3Ww });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Сценарий тақырыбы" },
      genre: { type: Type.STRING, description: "Жанры" },
      scenes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sceneNumber: { type: Type.INTEGER },
            description: { type: Type.STRING, description: "Short context in Kazakh (hidden in UI)." },
            visualPrompt: { type: Type.STRING, description: "Detailed visual description of this specific movement/frame in English, suitable for an image generator." },
            suggestedCharacters: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of character names present in this specific frame."
            }
          },
          required: ["sceneNumber", "description", "visualPrompt", "suggestedCharacters"]
        }
      }
    },
    required: ["title", "genre", "scenes"]
  };

  const prompt = `
    Create a visual storyboard script for the following topic: "${topic}".
    Break down the action into 6 to 8 distinct keyframes (movements).
    Focus on visual action.
    Use generic names for characters (e.g., Асқар, Айнұр).
    Return strictly JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are a storyboard artist. Break stories into distinct visual keyframes/movements.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No script generated");
    return JSON.parse(text) as ScriptResponse;
  } catch (error) {
    console.error("Error generating script:", error);
    throw error;
  }
};

/**
 * Generates an image for a specific scene using character reference images.
 */
export const generateSceneImage = async (
  sceneDescription: string,
  selectedCharacters: Character[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Construct parts: Images first, then text prompt
  const parts: any[] = [];

  // Add character reference images
  let charDescriptionString = "";
  
  selectedCharacters.forEach((char, index) => {
    parts.push({
      inlineData: {
        mimeType: char.mimeType,
        data: cleanBase64(char.imageBase64),
      },
    });
    charDescriptionString += `Reference image ${index + 1} is character named "${char.name}". `;
  });

  const prompt = `
    Generate a high-quality, cinematic movie scene keyframe.
    Visual Action: ${sceneDescription}
    
    Instructions:
    ${charDescriptionString}
    Please ensure the characters in the generated image closely resemble the facial features and appearance of the provided reference images.
    The style should be photorealistic, 4k, cinematic lighting.
  `;

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Using flash-image for multimodal capabilities
      contents: { parts: parts },
      config: {
        // We rely on the model to return the image data in the response parts
      }
    });

    // Parse response for image
    // The SDK might return it in candidates[0].content.parts
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated in response");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
