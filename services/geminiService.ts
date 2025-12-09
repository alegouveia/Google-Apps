import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { AudienceType, FileData, InterpretationConfig, InputMode } from "../types";

// Ensure API Key is present
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API Key is missing. Please set process.env.API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Constructs the system instruction based on the user's configuration.
 */
const getSystemInstruction = (config: InterpretationConfig): string => {
  let instruction = `Você é o JusPátria, um assistente jurídico de elite especializado em legislação brasileira. 
  Sua missão é desmistificar leis com precisão técnica, citando fontes e jurisprudência, mantendo a sobriedade e clareza.\n\n`;

  instruction += `ESTRUTURA DE RESPOSTA OBRIGATÓRIA (Use Markdown):\n`;
  instruction += `Para cada ponto analisado, siga estritamente este layout:\n`;
  instruction += `> 🏛️ **ARTIGO EM QUESTÃO:**\n`;
  instruction += `> (Transcreva ou cite o artigo/inciso/lei analisado com precisão)\n\n`;
  instruction += `> 📘 **INTERPRETAÇÃO:**\n`;
  instruction += `> (Sua explicação adaptada ao público: ${config.audience})\n`;
  
  // Custom formatting instructions inside Interpretation
  switch (config.format) {
    case 'Tópicos':
      instruction += `> (Use bullet points para listar os principais conceitos)\n`;
      break;
    case 'Perguntas e Respostas':
      instruction += `> (Formule como FAQ: P: Dúvida comum? R: Explicação)\n`;
      break;
    case 'Resumo Executivo':
      instruction += `> (Texto corrido, direto ao ponto, focado em tomada de decisão)\n`;
      break;
    default:
      instruction += `> (Texto corrido explicativo e didático)\n`;
  }
  
  instruction += `\n`;
  instruction += `> ⚖️ **JURISPRUDÊNCIA STF/STJ:**\n`;
  instruction += `> (Obrigatório verificar: Existe Súmula Vinculante, Súmula comum, Recursos Repetitivos (STJ) ou Repercussão Geral (STF) sobre isso? Se sim, cite e explique. Se não houver entendimento específico consolidado, informe: "Não há súmula vinculante ou tema repetitivo específico identificado para este ponto.")\n\n`;
  instruction += `--- (Separador entre tópicos)\n\n`;

  instruction += `PERFIL DE RESPOSTA:\n`;
  instruction += `- **Público Alvo:** ${config.audience}.\n`;
  instruction += `- **Tom de Voz:** ${config.tone}.\n`;
  instruction += `- **Nível de Detalhe:** ${config.length}.\n\n`;

  if (config.audience === AudienceType.CHILD) {
    instruction += `DIRETRIZES PARA CRIANÇAS/SIMPLIFICADO:\n`;
    instruction += `- Use analogias simples. Explique o STF como "O Tribunal dos Juízes Supremos".\n`;
  } else if (config.audience === AudienceType.PROFESSIONAL) {
    instruction += `DIRETRIZES PARA PROFISSIONAIS:\n`;
    instruction += `- Cite a jurisprudência com número do RE, REsp ou Súmula. Use terminologia técnica.\n`;
  } else {
    instruction += `DIRETRIZES PARA LEIGOS:\n`;
    instruction += `- Explique o impacto prático. Se houver decisão do STF/STJ, explique como isso muda a vida da pessoa.\n`;
  }

  return instruction;
};

export const interpretLaw = async (
  mode: InputMode,
  content: string | FileData,
  config: InterpretationConfig,
  userQuestion?: string
): Promise<string> => {
  try {
    const systemInstruction = getSystemInstruction(config);
    const modelId = "gemini-2.5-flash"; 

    let userPrompt = "";
    
    // If user provided a specific question, prioritize it.
    if (userQuestion && userQuestion.trim() !== "") {
      userPrompt += `PERGUNTA PRIORITÁRIA DO USUÁRIO: "${userQuestion}"\n\n`;
      userPrompt += `INSTRUÇÃO: Responda a pergunta acima usando o documento fornecido e seu conhecimento da lei brasileira. Mantenha o formato Artigo -> Interpretação -> STF/STJ.\n\n`;
      userPrompt += `--------------------------------------------------\n`;
      userPrompt += `CONTEXTO / DOCUMENTO:\n`;
    } else {
      userPrompt += `INSTRUÇÃO: Analise o seguinte texto jurídico. Identifique os principais pontos legais e explique-os no formato solicitado (Artigo/Interpretação/Jurisprudência).\n\nDOCUMENTO:\n`;
    }

    let contents: { parts: Part[] };

    if (mode === InputMode.TEXT) {
      contents = {
        parts: [{ text: `${userPrompt}\n${content as string}` }]
      };
    } else if (mode === InputMode.URL) {
      // URL handling
      return await interpretUrl(content as string, config, systemInstruction, userQuestion);
    } else if (mode === InputMode.FILE) {
      const fileData = content as FileData;
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.data
            }
          },
          { text: userPrompt }
        ]
      };
    } else {
      throw new Error("Modo de entrada inválido.");
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Lower temperature for more factual accuracy regarding laws
      },
      contents: contents!
    });

    return response.text || "Não foi possível gerar uma explicação.";

  } catch (error) {
    console.error("Erro na interpretação:", error);
    return "Ocorreu um erro ao processar sua solicitação. Verifique se o texto ou arquivo são válidos.";
  }
};

async function interpretUrl(
  url: string, 
  config: InterpretationConfig, 
  systemInstruction: string,
  userQuestion?: string
): Promise<string> {
   let prompt = `Acesse e analise o conteúdo legal na URL: ${url}.\n`;
   
   if (userQuestion) {
     prompt += `Responda: "${userQuestion}". Estruture: Artigo em Questão -> Interpretação -> Jurisprudência STF/STJ.`;
   } else {
     prompt += `Faça a análise completa seguindo o formato: Artigo em Questão -> Interpretação -> Jurisprudência STF/STJ.`;
   }
   
   const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      tools: [{ googleSearch: {} }] 
    }
  });

  return response.text || "Não foi possível acessar ou interpretar a URL fornecida.";
}

/**
 * Generates a practical example based on a specific legal context.
 */
export const generatePracticalExample = async (context: string): Promise<string> => {
  try {
    const prompt = `
      Com base no seguinte contexto jurídico brasileiro (Artigo e Interpretação):
      "${context}"
      
      Crie um EXEMPLO PRÁTICO e FICTÍCIO do cotidiano para ilustrar essa regra.
      - Use nomes fictícios (ex: João, Maria, Empresa X).
      - Descreva a situação, o conflito e como a lei se aplica neste caso específico.
      - Seja didático, direto e claro.
      - Não use formatação complexa, apenas parágrafos.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7, // Higher temperature for creative scenario generation
      }
    });

    return response.text || "Não foi possível gerar um exemplo no momento.";
  } catch (error) {
    console.error("Error generating example:", error);
    return "Erro ao gerar exemplo. Tente novamente.";
  }
};
