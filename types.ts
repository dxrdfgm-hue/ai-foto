export interface Character {
  id: string;
  name: string;
  imageBase64: string; // The raw base64 data without the prefix for the API, or full for display
  mimeType: string;
}

export interface Scene {
  sceneNumber: number;
  description: string; // Kazakh description
  visualPrompt: string; // English prompt optimized for image generation
  suggestedCharacters: string[]; // Names of characters in this scene
}

export interface ScriptResponse {
  title: string;
  genre: string;
  scenes: Scene[];
}

export interface GeneratedImage {
  id: string;
  sceneNumber: number;
  imageUrl: string;
  promptUsed: string;
}
