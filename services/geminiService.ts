
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Mood, Language } from '../types';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateVisual = async (prompt: string, mood: Mood = Mood.PROFESSIONAL): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Professional advertising visual for an Indian brand. 
            Style: Premium, High Fidelity. 
            Mood: ${mood}. 
            Scene: ${prompt}. 
            Context: Ensure the visual elements (lighting, decor, attire) are culturally resonant with Indian aesthetics.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return null;
  }
};

// Fix: Implemented generateVideo with Veo model, polling, and API key injection for download.
export const generateVideo = async (
  prompt: string,
  aspectRatio: '16:9' | '9:16',
  resolution: '720p' | '1080p',
  onStatusChange: (status: string) => void
): Promise<string | null> => {
  try {
    // Guidelines: Always create a new GoogleGenAI instance right before making an API call.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    onStatusChange('Initializing Veo engine...');
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: {
        numberOfVideos: 1,
        resolution,
        aspectRatio
      }
    });

    while (!operation.done) {
      onStatusChange('Video synthesis in progress... This may take a few minutes.');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Guidelines: Re-instantiate AI to ensure it uses the most up-to-date API key.
      const pollingAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
      operation = await pollingAi.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) return null;

    onStatusChange('Finalizing assets...');
    // Guidelines: Append the API key when fetching from the video download link.
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Gemini Video Generation Error:", error);
    throw error;
  }
};

export const generateAudio = async (text: string, language: Language, voiceName: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Act as a professional Indian voiceover artist. Read this script in ${language} with high emotional resonance and perfect regional accent: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Gemini Audio Generation Error:", error);
    return null;
  }
};

export const checkCulturalSensitivity = async (content: string, region: string, language: Language): Promise<{ score: number, feedback: string, suggestions: string[], linguisticAccuracy: string } | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze this Indian advertisement content for:
        1. Cultural Sensitivity: Check for regional taboos, religious sensitivities, and local customs in the ${region} region.
        2. Linguistic Accuracy: Is the ${language} used natural, colloquial, or overly formal?
        3. Regional Resonance: Does it use metaphors or references common in ${region}?
        
        Content: "${content}"
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Sensitivity score from 0 to 100" },
            feedback: { type: Type.STRING, description: "Detailed cultural and linguistic feedback" },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific improvements for better regional connection" },
            linguisticAccuracy: { type: Type.STRING, description: "Analysis of the specific language usage" }
          },
          required: ["score", "feedback", "suggestions", "linguisticAccuracy"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Cultural Sensitivity Error:", error);
    return null;
  }
};

export const pcmToWav = (base64Pcm: string): string => {
  const binaryString = atob(base64Pcm);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  
  const buffer = new ArrayBuffer(44 + bytes.length);
  const view = new DataView(buffer);
  
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + bytes.length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, bytes.length, true);
  
  const pcm16 = new Int16Array(bytes.buffer);
  for (let i = 0; i < pcm16.length; i++) {
    view.setInt16(44 + i * 2, pcm16[i], true);
  }
  
  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};
