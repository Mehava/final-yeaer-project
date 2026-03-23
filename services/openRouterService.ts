
import { Language, Mood, Region } from '../types';
import { GoogleGenAI } from "@google/genai";

const OPENROUTER_API_KEY = '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';

/**
 * Generates multiple advertising script variations.
 * Tries OpenRouter free models first, then falls back to Gemini 3 Flash if needed.
 */
export const generateScript = async (
  brandName: string,
  productDescription: string,
  targetAudience: string,
  language: Language,
  mood: Mood,
  region: Region
): Promise<string[] | null> => {
  const models = [
    "google/gemini-2.0-flash-lite-preview-02-05:free",
    "deepseek/deepseek-r1:free",
    "mistralai/mistral-7b-instruct:free",
    "meta-llama/llama-3-8b-instruct:free"
  ];

  const prompt = `
    Act as a world-class Indian ad agency creative director and scriptwriter. 
    Brand: ${brandName}
    Product/Service: ${productDescription}
    Target Audience: ${targetAudience}
    Primary Language: ${language}
    Emotional Mood: ${mood}
    Target Region: ${region}
    
    TASK: Generate THREE distinct, high-impact 30-second creative ad script variations.
    
    STRICT LANGUAGE REQUIREMENT:
    - All dialogue, voiceover, and narrator lines MUST be written in the ${language} language using its native script (e.g., Devanagari for Hindi, Tamil script for Tamil, Bengali script for Bengali). 
    - DO NOT use English transliteration for the dialogue.
    - Visual scene descriptions and camera directions should remain in English for the production crew.
    
    CULTURAL CONTEXT:
    - Tailor the metaphors, slang, and cultural references to the ${region} region of India.
    - Ensure the ${mood} tone is consistently maintained throughout the script.
    
    OUTPUT FORMAT: You must return a valid JSON object with exactly this structure:
    {
      "variations": [
        "[SCENE 1: Visual description] Narrator (${language}): Native script text here...",
        "[SCENE 1: Visual description] Character (${language}): Native script text here...",
        "[SCENE 1: Visual description] Narrator (${language}): Native script text here..."
      ]
    }
    
    Return ONLY the raw JSON object. No markdown code blocks, no preamble, and no conversational filler.
  `;

  // Try OpenRouter models
  for (const model of models) {
    try {
      console.debug(`[AIVISION] Attempting OpenRouter model: ${model}`);
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "AIVISION Studio"
        },
        body: JSON.stringify({
          "model": model,
          "messages": [{ "role": "user", "content": prompt }],
          "temperature": 0.8 // Slightly higher for more creative variations
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          // Robust JSON extraction
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          const rawText = jsonMatch ? jsonMatch[0] : content;
          const parsed = JSON.parse(rawText);
          if (parsed.variations && Array.isArray(parsed.variations)) {
            return parsed.variations;
          }
        }
      }
    } catch (e) {
      console.warn(`[AIVISION] OpenRouter ${model} failed, trying next...`);
    }
  }

  // Final Fallback: Use Gemini 3 Flash directly
  console.info("[AIVISION] OpenRouter exhausted or failed. Failing over to Gemini 3 Flash...");
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(result.text);
    return parsed.variations || null;
  } catch (geminiError) {
    console.error("[AIVISION] All script generation paths failed.", geminiError);
    return null;
  }
};
