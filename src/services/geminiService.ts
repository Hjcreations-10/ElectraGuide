import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const translateText = async (text: string, targetLanguage: string) => {
  if (!process.env.GEMINI_API_KEY) return text;
  
  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following to ${targetLanguage}. Return only the translated text, no quotes or explanations: "${text}"`
    });
    return (result.text || text).trim();
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};

export const translateBatch = async (texts: string[], targetLanguage: string) => {
  if (!process.env.GEMINI_API_KEY || texts.length === 0) return {};
  
  try {
    const prompt = `Translate the following list of UI labels into ${targetLanguage}. 
    Return a JSON object where the keys are the original English labels and the values are the translations.
    Maintain the EXACT keys.
    Labels: ${JSON.stringify(texts)}`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      generationConfig: {
        response_mime_type: "application/json"
      }
    });

    if (result.text) {
      try {
        return JSON.parse(result.text);
      } catch (e) {
        console.error("Failed to parse batch translation response", e);
      }
    }
    return {};
  } catch (error) {
    console.error("Batch translation error:", error);
    return {};
  }
};

export const getElectionInsights = async (data: any) => {
  if (!process.env.GEMINI_API_KEY) return "Voter turnout remains a key metric for democratic health.";
  
  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this election data and provide a 2-sentence key insight for voters: ${JSON.stringify(data)}`
    });
    return result.text || "Analyzing trends shows increasing engagement in rural sectors.";
  } catch (error) {
    console.error("Insight error:", error);
    return "Analyzing trends shows increasing engagement in rural sectors.";
  }
};
