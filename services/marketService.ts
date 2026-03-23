
import { GoogleGenAI } from "@google/genai";
import { Region } from '../types';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface MarketInsight {
  trend: string;
  relevance: string;
  sources: { title: string; uri: string }[];
}

/**
 * Fetches real-time market trends for specific Indian regions using Google Search Grounding.
 * Uses gemini-3-pro-image-preview as required for search tool access.
 */
export const fetchMarketTrends = async (region: Region, industry: string = "Consumer Goods"): Promise<MarketInsight | null> => {
  try {
    const ai = getAI();
    const prompt = `What are the current trending creative themes, visual styles, and consumer behaviors for ${industry} advertising specifically in ${region} region of India? Focus on news from the last 30 days and regional cultural nuances.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No insights found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = chunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    return {
      trend: text,
      relevance: `Grounded Regional Intelligence for ${region}`,
      sources: sources
    };
  } catch (error) {
    console.error("Market Trend Fetch Error:", error);
    throw error; // Rethrow to handle in UI
  }
};
