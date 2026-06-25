import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function to sleep/delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Lazy-initialized Gemini Client to prevent startup crashes
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please add it to Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Endpoint to retrieve server-side configuration (specifically the pre-filled Gemini API key)
app.get("/api/config", (req, res) => {
  return res.json({
    apiKey: process.env.GEMINI_API_KEY || ""
  });
});

// Endpoint to generate DSA Thinking Framework sheet
app.post("/api/generate", async (req, res) => {
  try {
    const { problemTitle, problemDescription, apiKey: clientApiKey, customRestriction } = req.body;
    if (!problemTitle) {
      return res.status(400).json({ error: "Problem title is required." });
    }

    let ai: GoogleGenAI;
    if (clientApiKey && clientApiKey.trim()) {
      ai = new GoogleGenAI({
        apiKey: clientApiKey.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } else {
      ai = getGeminiClient();
    }
    
    let systemPrompt = `You are a world-class algorithms coach and computer science professor specializing in LeetCode, technical interviews, and the "DSA THINKING FRAMEWORK".
Your task is to analyze the user's algorithmic problem and populate the DSA Thinking Framework sheet.

Follow these 9 core steps exactly:
1. DEFINE THE FUNCTION: What output is required for each input? f(x) = ...
2. WRITE THE BRUTE FORCE: How to solve it without efficiency constraints, with time/space.
3. FIND REPEATED WORK: Why is brute force slow? Identify repeated scans, comparisons, traversals.
4. REVERSE INFORMATION FLOW: Shift from "Query -> Answer" to "Answer -> Query". Create a revolutionary insight.
5. IDENTIFY THE STATE: What information must survive between iterations?
6. COMPRESS THE STATE: Remove dominated candidates, redundant values, impossible states.
7. FIND THE INVARIANT: What property must always remain true?
8. IDENTIFY EVENTS: What new information causes a state update?
9. CHOOSE THE DATA STRUCTURE: Select the data structure that maintains the state + invariant.

Also generate the master formula trace string, 30-second checklist answers, and a clean, fully-commented TypeScript implementation of the efficient algorithm.`;

    if (customRestriction && customRestriction.trim()) {
      systemPrompt += `\n\nCRITICAL CONSTRAINTS & INSTRUCTIONS FROM USER:\n${customRestriction.trim()}`;
    }

    const userPrompt = `Problem Name: "${problemTitle}"
Description: ${problemDescription || "Analyze this problem name and output the perfect optimal solution."}

Analyze this problem and fill out the DSA Thinking Framework. Return a single JSON object matching the requested schema.`;

    const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let text = "";
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      let attempts = 2;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          console.log(`Attempting generation with model: ${modelName} (attempt ${attempt}/${attempts})`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  problemName: { type: Type.STRING },
                  difficulty: { type: Type.STRING, description: "Easy, Medium, or Hard" },
                  problemDescription: { type: Type.STRING },
                  functionDefinition: {
                    type: Type.OBJECT,
                    properties: {
                      signature: { type: Type.STRING, description: "Mathematical function notation, e.g., f(nums, target) = [i, j]" },
                      description: { type: Type.STRING, description: "Clear explanation of input-to-output mapping" }
                    },
                    required: ["signature", "description"]
                  },
                  bruteForce: {
                    type: Type.OBJECT,
                    properties: {
                      logic: { type: Type.STRING },
                      timeComplexity: { type: Type.STRING, description: "e.g., O(N²)" },
                      spaceComplexity: { type: Type.STRING, description: "e.g., O(1)" }
                    },
                    required: ["logic", "timeComplexity", "spaceComplexity"]
                  },
                  repeatedWork: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of redundant operations performed by brute force"
                  },
                  reverseInformationFlow: {
                    type: Type.OBJECT,
                    properties: {
                      traditionalQuery: { type: Type.STRING, description: "The forward query, e.g., 'For element i, who is greater?'" },
                      reversedQuery: { type: Type.STRING, description: "The reversed query, e.g., 'Can arriving element j answer waiting queries?'" },
                      insight: { type: Type.STRING, description: "The breakthrough observation" }
                    },
                    required: ["traditionalQuery", "reversedQuery", "insight"]
                  },
                  state: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING, description: "What must be remembered between iterations" },
                      stateVariables: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            purpose: { type: Type.STRING }
                          },
                          required: ["name", "purpose"]
                        }
                      }
                    },
                    required: ["description", "stateVariables"]
                  },
                  stateCompression: {
                    type: Type.OBJECT,
                    properties: {
                      whatToRemove: { type: Type.STRING, description: "Which states are redundant or dominated" },
                      howCompressed: { type: Type.STRING, description: "How the state compression yields better complexity" }
                    },
                    required: ["whatToRemove", "howCompressed"]
                  },
                  invariant: { type: Type.STRING, description: "The property that remains true throughout execution" },
                  events: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        trigger: { type: Type.STRING },
                        update: { type: Type.STRING }
                      },
                      required: ["trigger", "update"]
                    },
                    description: "The set of transitions triggered by incoming data"
                  },
                  dataStructure: {
                    type: Type.OBJECT,
                    properties: {
                      selectedDS: { type: Type.STRING },
                      reason: { type: Type.STRING }
                    },
                    required: ["selectedDS", "reason"]
                  },
                  finalComplexity: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING },
                      space: { type: Type.STRING }
                    },
                    required: ["time", "space"]
                  },
                  masterFormulaTrace: { type: Type.STRING, description: "A sequential '->' trace matching the Master Formula flow for this problem" },
                  checklistAnswers: {
                    type: Type.OBJECT,
                    properties: {
                      function: { type: Type.STRING },
                      bruteForce: { type: Type.STRING },
                      repeatedWork: { type: Type.STRING },
                      reversedFlow: { type: Type.STRING },
                      state: { type: Type.STRING },
                      compressedState: { type: Type.STRING },
                      invariant: { type: Type.STRING },
                      events: { type: Type.STRING },
                      ds: { type: Type.STRING },
                      complexity: { type: Type.STRING }
                    },
                    required: [
                      "function", "bruteForce", "repeatedWork", "reversedFlow", "state", 
                      "compressedState", "invariant", "events", "ds", "complexity"
                    ]
                  },
                  codeSnippet: {
                    type: Type.OBJECT,
                    properties: {
                      language: { type: Type.STRING },
                      code: { type: Type.STRING }
                    },
                    required: ["language", "code"]
                  }
                },
                required: [
                  "problemName", "difficulty", "problemDescription", "functionDefinition", "bruteForce",
                  "repeatedWork", "reverseInformationFlow", "state", "stateCompression", "invariant",
                  "events", "dataStructure", "finalComplexity", "masterFormulaTrace", "checklistAnswers", "codeSnippet"
                ]
              }
            }
          });

          if (response.text) {
            text = response.text;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Error on model ${modelName} (attempt ${attempt}/${attempts}):`, err.message || err);
          const isRateOrUnavailable = err.message?.includes("503") || err.message?.includes("429") || err.message?.includes("UNAVAILABLE") || err.message?.includes("ResourceExhausted") || err.message?.includes("high demand");
          if (isRateOrUnavailable && attempt < attempts) {
            console.log("Waiting 1.5 seconds before retrying due to high demand...");
            await delay(1500);
          } else {
            break;
          }
        }
      }
      if (text) {
        break;
      }
    }

    if (!text) {
      throw lastError || new Error("Failed to generate response from all available models.");
    }

    const data = JSON.parse(text.trim());
    // Assign a unique temporary ID
    data.id = "custom-" + Date.now();
    return res.json(data);

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to generate thinking framework sheet." 
    });
  }
});

// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
