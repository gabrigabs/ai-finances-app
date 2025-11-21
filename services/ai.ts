
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile } from "../context/FinancialContext";

// Initialize the client for basic tasks (uses environment key)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FAST = 'gemini-2.5-flash';

// Schema for Dashboard Insights
const insightSchema = {
  type: Type.OBJECT,
  properties: {
    alerts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["warning", "info", "success"] },
          title: { type: Type.STRING },
          message: { type: Type.STRING },
          icon: { type: Type.STRING }
        }
      }
    },
    summary: {
      type: Type.OBJECT,
      properties: {
        sentiment: { type: Type.STRING },
        keyObservation: { type: Type.STRING }
      }
    }
  }
};

// Schema for Document Extraction
const transactionExtractionSchema = {
  type: Type.OBJECT,
  properties: {
      bankName: { type: Type.STRING, description: "Nome do banco ou instituição financeira identificado no documento (ex: Nubank, Itaú). Se não encontrar, deixe vazio." },
      items: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
            description: { type: Type.STRING, description: "Nome do estabelecimento ou descrição curta da transação" },
            amount: { type: Type.NUMBER, description: "Valor numérico da transação (positivo)" },
            date: { type: Type.STRING, description: "Data da transação no formato ISO YYYY-MM-DD" },
            category: { type: Type.STRING, description: "Categoria sugerida (Ex: Comida, Transporte, Saúde, Moradia, Lazer, Receita, Outros)" },
            type: { type: Type.STRING, enum: ["income", "expense"], description: "Se é uma despesa (expense) ou receita (income)" },
            installments: {
                type: Type.OBJECT,
                description: "Informação sobre parcelamento, se detectado (ex: 1/12 ou 10x)",
                properties: {
                    current: { type: Type.NUMBER, description: "Número da parcela atual (se não explícito, assumir 1)" },
                    total: { type: Type.NUMBER, description: "Total de parcelas. Essencial para compras parceladas." }
                },
                nullable: true
            }
            }
        }
      }
  }
};

export const generateDashboardInsights = async (transactions: any[]) => {
  try {
    const prompt = `
      Analise as seguintes transações financeiras e forneça 3 alertas/insights importantes para um dashboard pessoal.
      Foque em anomalias de gastos, contas recorrentes próximas ou oportunidades de economia.
      Use português do Brasil (pt-BR).
      
      Transações: ${JSON.stringify(transactions)}
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: insightSchema,
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating insights:", error);
    return null;
  }
};

export const chatWithFinancialData = async (history: any[], newMessage: string, transactions: any[], userProfile: UserProfile | null) => {
  try {
    let profileContext = "Perfil do usuário não definido. Assuma um perfil moderado.";
    if (userProfile) {
        profileContext = `
            DADOS DO PERFIL DO USUÁRIO (USE ISSO PARA PERSONALIZAR A RESPOSTA):
            - Renda Mensal Declarada: R$ ${userProfile.monthlyIncome}
            - Objetivos Financeiros: ${userProfile.goals.join(', ')}
            - Perfil de Risco: ${userProfile.riskProfile}
        `;
    }

    const systemInstruction = `
      Você é o Finanças IA, um estrategista financeiro pessoal de elite.
      Seu objetivo não é apenas responder, mas GUIAR o usuário para a saúde financeira.
      
      ${profileContext}
      
      Transações Recentes: ${JSON.stringify(transactions.slice(0, 50))}.

      DIRETRIZES DE PERSONALIDADE:
      1. Seja direto e estratégico. Evite clichês genéricos.
      2. Se o usuário tem o objetivo de "Sair das dívidas", priorize agressivamente cortes de gastos supérfluos nas suas sugestões.
      3. Se o usuário é "Investidor", sugira alocação de sobras.
      4. Use português do Brasil (pt-BR).
      5. Compare os gastos atuais com a Renda Mensal declarada para dar choques de realidade se necessário.
    `;

    const chat = ai.chats.create({
      model: MODEL_FAST,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    // Construct history for context if needed, but for now simplicity implies sending last message with system context is enough 
    // or rebuilding history object if utilizing persistent chat session.
    // Since history comes from UI state, we can technically pass it to history param in create, but 
    // for this implementation we treat each request as fresh context-aware prompt or keep simple.
    
    const response = await chat.sendMessage({
      message: newMessage
    });

    return response.text;
  } catch (error) {
    console.error("Error in chat:", error);
    return "Desculpe, tive um problema ao analisar seus dados agora. Tente novamente em instantes.";
  }
};

export const extractTransactionsFromDocument = async (base64Data: string, mimeType: string) => {
  try {
    const prompt = `
      Você é um auditor financeiro rigoroso. Analise este documento (imagem/PDF) e extraia transações financeiras.
      
      DIRETRIZES ESTRITAS:
      1. **INSTITUIÇÃO:** Tente identificar o nome do banco ou cartão (ex: Nubank, Inter, Itaú) no cabeçalho.
      2. **DATAS:** Converta TODAS as datas para o formato ISO 8601 (YYYY-MM-DD). Se o ano não estiver visível, assuma o ano ATUAL. Se a data for ambígua, use o primeiro dia do mês corrente.
      3. **VALORES:** Apenas números float positivos. Ignore símbolos de moeda (R$).
      4. **PARCELAS:** É CRUCIAL identificar parcelamentos. Procure por "01/12", "10x", "Parc 1 de 5". 
         - Se encontrar "01/10" -> current: 1, total: 10.
         - Se encontrar "10x" em uma compra nova -> current: 1, total: 10.
         - Se encontrar "05/10" -> current: 5, total: 10.
      5. **LISTAGEM:** Se for uma fatura de cartão, liste CADA compra individualmente. Não agrupe.
      6. **CETICISMO:** Se uma linha não parecer claramente uma transação financeira (ex: saldos anteriores, textos de marketing, subtotais parciais), IGNORE-A.
      
      Retorne APENAS o JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: transactionExtractionSchema,
      }
    });

    const jsonText = response.text;
    if (!jsonText) return { items: [] };
    const result = JSON.parse(jsonText);
    
    return result; 
  } catch (error) {
    console.error("Error extracting transactions:", error);
    return { items: [] };
  }
};
