
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getIcebreaker = async (memberName: string, role: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere uma pergunta de "quebra-gelo" (icebreaker) curta e divertida em português para o(a) ${memberName}, que atua como ${role} na daily de hoje. A pergunta deve ser leve e ajudar a começar a reunião com energia positiva.`,
      config: {
        temperature: 0.8,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching icebreaker:", error);
    return "Qual é a boa de hoje?";
  }
};

export const summarizeDaily = async (updates: any[]) => {
  try {
    const context = JSON.stringify(updates);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Abaixo estão as notas da nossa reunião diária (daily). Por favor, resuma os pontos principais, demandas críticas e novidades compartilhadas em português de forma concisa e profissional: ${context}`,
      config: {
        temperature: 0.5,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing daily:", error);
    return "Não foi possível gerar o resumo automático no momento.";
  }
};
