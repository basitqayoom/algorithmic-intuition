import React, { useState, useEffect } from 'react';
import { PRESET_SHEETS } from './presets';
import { A4Sheet } from './components/A4Sheet';
import { SlideView } from './components/SlideView';
import { DSASheetData } from './types';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  BookOpen, 
  Sparkles, 
  Settings, 
  Printer, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  HelpCircle, 
  FileText, 
  CheckCircle,
  Copy,
  ChevronRight,
  Info,
  Cpu,
  AlertTriangle,
  Maximize2,
  Minimize2,
  LayoutGrid
} from 'lucide-react';

const generateClientSide = async (problemTitle: string, problemDescription: string, clientApiKey: string, customRestriction?: string) => {
  const ai = new GoogleGenAI({
    apiKey: clientApiKey,
  });

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

  const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash"];
  let text = "";
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    let attempts = 2;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        console.log(`Attempting browser-side generation with model: ${modelName} (attempt ${attempt}/${attempts})`);
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
        console.warn(`Browser-side error on model ${modelName} (attempt ${attempt}/${attempts}):`, err.message || err);
        const isRateOrUnavailable = err.message?.includes("503") || err.message?.includes("429") || err.message?.includes("UNAVAILABLE") || err.message?.includes("ResourceExhausted") || err.message?.includes("high demand");
        if (isRateOrUnavailable && attempt < attempts) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
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
    throw lastError || new Error("Failed to generate response client-side from all available models.");
  }

  const generatedData = JSON.parse(text.trim());
  return {
    ...generatedData,
    id: `custom-${Date.now()}`
  };
};

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'presets' | 'ai' | 'sandbox'>('presets');
  
  // Sheet list: load presets first, then merge with localStorage custom sheets
  const [allSheets, setAllSheets] = useState<DSASheetData[]>(() => {
    const saved = localStorage.getItem('dsa_custom_sheets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...PRESET_SHEETS, ...parsed];
      } catch (e) {
        return PRESET_SHEETS;
      }
    }
    return PRESET_SHEETS;
  });

  // Currently selected sheet data
  const [currentSheetId, setCurrentSheetId] = useState<string>(PRESET_SHEETS[0].id);
  const currentSheet = allSheets.find(s => s.id === currentSheetId) || PRESET_SHEETS[0];

  // Customizer preferences
  const [mode, setMode] = useState<'reference' | 'sandbox'>('reference');
  const [theme, setTheme] = useState<'academic' | 'tech-slate' | 'blueprint' | 'geometric-balance'>('geometric-balance');
  const [fontSize, setFontSize] = useState<'xs' | 'sm' | 'base' | 'lg'>('sm');
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(0.9);

  // Custom AI input
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDesc, setCustomDesc] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [customRestriction, setCustomRestriction] = useState<string>('');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [viewLayout, setViewLayout] = useState<'sheet' | 'slides'>('sheet');

  // Fetch pre-configured API key from server environment on mount
  useEffect(() => {
    fetch('/api/config')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load server config');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response (possibly booting or restarting)');
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.apiKey) {
          setApiKey(data.apiKey);
        }
      })
      .catch((err) => console.warn('Pre-configured server config fetch omitted (server booting/restarting):', err.message || err));
  }, []);

  // Listen for Escape key to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sandbox Practice Notes
  // Keyed by sheet ID so that users don't lose practice notes when switching problems!
  const [sandboxNotesStore, setSandboxNotesStore] = useState<Record<string, Partial<DSASheetData>>>(() => {
    const saved = localStorage.getItem('dsa_sandbox_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  // Current sandbox notes for the active sheet ID
  const activeSandboxNotes = sandboxNotesStore[currentSheetId] || {
    problemName: currentSheet.problemName,
    difficulty: currentSheet.difficulty,
    problemDescription: currentSheet.problemDescription,
    functionDefinition: { signature: '', description: '' },
    bruteForce: { logic: '', timeComplexity: '', spaceComplexity: '' },
    repeatedWork: [],
    reverseInformationFlow: { traditionalQuery: '', reversedQuery: '', insight: '' },
    state: { description: '', stateVariables: [] },
    stateCompression: { whatToRemove: '', howCompressed: '' },
    invariant: '',
    events: [],
    dataStructure: { selectedDS: '', reason: '' },
    finalComplexity: { time: '', space: '' },
    checklistAnswers: {
      function: '', bruteForce: '', repeatedWork: '', reversedFlow: '',
      state: '', compressedState: '', invariant: '', events: '', ds: '', complexity: ''
    },
    codeSnippet: { language: 'typescript', code: '' }
  };

  // --- PERSISTENCE ---
  useEffect(() => {
    const customOnly = allSheets.filter(s => !PRESET_SHEETS.some(p => p.id === s.id));
    localStorage.setItem('dsa_custom_sheets', JSON.stringify(customOnly));
  }, [allSheets]);

  useEffect(() => {
    localStorage.setItem('dsa_sandbox_notes', JSON.stringify(sandboxNotesStore));
  }, [sandboxNotesStore]);

  // --- HELPERS ---
  const handleUpdateSandbox = (updater: (prev: Partial<DSASheetData>) => Partial<DSASheetData>) => {
    setSandboxNotesStore(prev => ({
      ...prev,
      [currentSheetId]: updater(prev[currentSheetId] || {
        problemName: currentSheet.problemName,
        difficulty: currentSheet.difficulty,
        problemDescription: currentSheet.problemDescription,
        functionDefinition: { signature: '', description: '' },
        bruteForce: { logic: '', timeComplexity: '', spaceComplexity: '' },
        repeatedWork: [],
        reverseInformationFlow: { traditionalQuery: '', reversedQuery: '', insight: '' },
        state: { description: '', stateVariables: [] },
        stateCompression: { whatToRemove: '', howCompressed: '' },
        invariant: '',
        events: [],
        dataStructure: { selectedDS: '', reason: '' },
        finalComplexity: { time: '', space: '' },
        checklistAnswers: {
          function: '', bruteForce: '', repeatedWork: '', reversedFlow: '',
          state: '', compressedState: '', invariant: '', events: '', ds: '', complexity: ''
        },
        codeSnippet: { language: 'typescript', code: '' }
      })
    }));
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  // Call the server API route to generate standard sheet
  const handleAISubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);

    let data;

    try {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemTitle: customTitle,
            problemDescription: customDesc,
            apiKey: apiKey,
            customRestriction: customRestriction
          })
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('NOT_JSON_RESPONSE');
        }

        const resData = await response.json();

        if (!response.ok) {
          throw new Error(resData.error || 'Failed to generate thinking sheet.');
        }
        data = resData;
      } catch (fetchErr: any) {
        console.warn('Backend server generated an error or is unavailable:', fetchErr.message || fetchErr);
        
        // If they entered a custom API key, fall back to direct browser-side generation
        if (apiKey && apiKey.trim()) {
          console.info('Attempting direct client-side fallback generation via Gemini API...');
          data = await generateClientSide(customTitle, customDesc, apiKey.trim(), customRestriction);
        } else {
          // If no custom API key is available
          if (fetchErr.message === 'NOT_JSON_RESPONSE') {
            throw new Error('This app is hosted in a static client-only environment (like Netlify) without an active backend server. To generate new thinking sheets directly, please provide a Gemini API key in the input field above.');
          }
          throw fetchErr;
        }
      }

      // Add sheet to list
      setAllSheets(prev => [data, ...prev]);
      setCurrentSheetId(data.id);
      setActiveTab('presets'); // switch to presets so they can view it
      setMode('reference'); // default to showing the AI solution
      
      // Reset inputs
      setCustomTitle('');
      setCustomDesc('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Remove a custom generated sheet
  const handleDeleteSheet = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (PRESET_SHEETS.some(p => p.id === id)) return; // Don't delete presets

    if (confirm('Are you sure you want to delete this custom thinking sheet?')) {
      const nextSheets = allSheets.filter(s => s.id !== id);
      setAllSheets(nextSheets);
      
      // If we deleted the active one, select the first preset
      if (currentSheetId === id) {
        setCurrentSheetId(PRESET_SHEETS[0].id);
      }
    }
  };

  // Load an expert solution into Sandbox practice so they can modify it
  const loadAIReferenceIntoSandbox = () => {
    if (confirm('This will copy the entire AI solution into your sandbox practice workspace. Any existing practice notes for this problem will be overwritten. Proceed?')) {
      handleUpdateSandbox(() => ({
        ...currentSheet,
        id: currentSheet.id // keep ID
      }));
      setMode('sandbox');
      alert('Expert answers copied successfully! You can now refine, annotate, and print your customized version.');
    }
  };

  // Reset sandbox notes for the current sheet
  const resetSandboxNotes = () => {
    if (confirm('Reset your sandbox practice notes for this problem?')) {
      handleUpdateSandbox(() => ({
        problemName: currentSheet.problemName,
        difficulty: currentSheet.difficulty,
        problemDescription: currentSheet.problemDescription,
        functionDefinition: { signature: '', description: '' },
        bruteForce: { logic: '', timeComplexity: '', spaceComplexity: '' },
        repeatedWork: [],
        reverseInformationFlow: { traditionalQuery: '', reversedQuery: '', insight: '' },
        state: { description: '', stateVariables: [] },
        stateCompression: { whatToRemove: '', howCompressed: '' },
        invariant: '',
        events: [],
        dataStructure: { selectedDS: '', reason: '' },
        finalComplexity: { time: '', space: '' },
        checklistAnswers: {
          function: '', bruteForce: '', repeatedWork: '', reversedFlow: '',
          state: '', compressedState: '', invariant: '', events: '', ds: '', complexity: ''
        },
        codeSnippet: { language: 'typescript', code: '' }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* 1. Header (Hidden on print) */}
      <header className="bg-slate-950 border-b border-slate-800 py-3 px-6 flex justify-between items-center no-print sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-lg text-white shadow-md">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-md font-display font-bold tracking-tight text-white flex items-center gap-2">
              DSA Thinking Framework <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-mono border border-indigo-500/30 font-semibold uppercase tracking-wider">Studio</span>
            </h1>
            <p className="text-[10px] text-slate-400">
              Model-driven LeetCode analysis • State-Invariant-Event Worksheet • Print Perfect A4 Cheat Sheets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-[11px] text-slate-400 bg-slate-900/60 py-1.5 px-3 rounded-lg border border-slate-800 font-mono hidden lg:flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>Format: A4 Portrait (Print Ready)</span>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-95 text-white py-1.5 px-4 rounded-lg font-medium text-xs shadow-md shadow-indigo-900/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet (A4)</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace (Hidden on print) */}
      <main className="flex-1 flex flex-col lg:flex-row no-print h-[calc(100vh-53px)] overflow-hidden">
        
        {/* Left Side: Interactive Playground / Controls */}
        <div className="w-full lg:w-[45%] border-r border-slate-800 flex flex-col bg-slate-950/40">
          {/* Tabs header */}
          <div className="flex border-b border-slate-800 bg-slate-950 px-4">
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'presets' 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. Explore & Select</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'ai' 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>2. AI Solver Generator</span>
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'sandbox' 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>3. Interactive Sandbox</span>
            </button>
          </div>

          {/* Tab Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            
            {/* TAB 1: EXPLORE PRESETS */}
            {activeTab === 'presets' && (
              <div className="space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                  <h3 className="font-display font-bold text-sm text-white mb-1.5">
                    Explore Master Frameworks
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Select a classic LeetCode problem below to immediately inspect, tweak, and print its completed <strong>DSA Thinking Framework</strong>. Study how a quadratic brute force transitions into an optimal linear algorithm by finding the precise <strong>State, Invariant, and Events</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {allSheets.map((sheet) => {
                    const isPreset = PRESET_SHEETS.some(p => p.id === sheet.id);
                    return (
                      <div
                        key={sheet.id}
                        onClick={() => setCurrentSheetId(sheet.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer text-left relative group ${
                          currentSheetId === sheet.id 
                            ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-950/20' 
                            : 'bg-slate-900/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold mb-1.5 ${
                              sheet.difficulty === 'Easy' ? 'bg-emerald-950 text-emerald-400' :
                              sheet.difficulty === 'Medium' ? 'bg-amber-950 text-amber-400' :
                              'bg-rose-950 text-rose-400'
                            }`}>
                              {sheet.difficulty || 'Medium'}
                            </span>
                            <h4 className="font-display font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">
                              {sheet.problemName}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500 font-mono">
                              {isPreset ? "PRESET" : "CUSTOM"}
                            </span>
                            {!isPreset && (
                              <button
                                onClick={(e) => handleDeleteSheet(sheet.id, e)}
                                className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                                title="Delete Sheet"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                          {sheet.problemDescription}
                        </p>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2 text-[10px] text-slate-400 font-mono">
                          <span>DS: {sheet.dataStructure?.selectedDS || "N/A"}</span>
                          <span>Time: {sheet.finalComplexity?.time || "O(N)"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: AI GENERATOR */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-tr from-indigo-950/50 to-purple-950/30 p-4 rounded-xl border border-indigo-900/40">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-display font-bold text-sm text-white">
                      AI Framework Generator
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Struggling to find the optimal state compression or invariant for a tricky LeetCode problem? Type in the title (and optional description), and let the AI system formulate the full 9-step framework.
                  </p>
                </div>

                <form onSubmit={handleAISubmission} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Gemini API Key
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {apiKey ? '✓ Configured' : 'Optional (if set in server env)'}
                      </span>
                    </div>
                    <input
                      type="password"
                      placeholder="Enter custom GEMINI_API_KEY (overrides environment if provided)"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Problem Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Slidings Window Maximum, LRU Cache, Merge k Sorted Lists"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Problem Description / Notes (Optional)
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Copy-paste the problem text here, or any custom ideas you have to guide the AI..."
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        AI Constraints & Guardrails (Optional)
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomRestriction("Do not write the solution code directly. Only provide step-by-step logic, high-level structural hints, and return placeholder explanations inside the codeSnippet block instead of fully working code.")}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                      >
                        Shortcut: No direct code solution
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="e.g. 'Do not write the solution', 'Withhold the final code', 'Return only conceptual flowcharts'"
                      value={customRestriction}
                      onChange={(e) => setCustomRestriction(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Directly shapes Gemini generation behaviour, letting you prevent it from spoiling code solutions.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-950/50 border border-rose-900/80 rounded-lg text-xs text-rose-300 space-y-1.5">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>API Initialization Info</span>
                      </div>
                      <p className="leading-normal font-sans text-slate-300">
                        {errorMsg}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isGenerating || !customTitle.trim()}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isGenerating
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/50'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/20'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Formulating Steps 1–9... (takes ~15s)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Custom DSA Framework</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="border-t border-slate-800/80 pt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Quick Start Brainstorm Prompts
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { title: 'Three Sum', desc: 'Find unique triplets sum to zero' },
                      { title: 'Merge Intervals', desc: 'Overlap merge' },
                      { title: 'Valid Parentheses', desc: 'Check syntax' },
                      { title: 'Search in Rotated Sorted Array', desc: 'Rotated BS' }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCustomTitle(item.title);
                          setCustomDesc(item.desc);
                        }}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg p-2 text-left text-[11px] w-[calc(50%-4px)] flex flex-col justify-between cursor-pointer"
                      >
                        <span className="font-bold text-slate-200">{item.title}</span>
                        <span className="text-[10px] text-slate-500 truncate block w-full">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: INTERACTIVE SANDBOX */}
            {activeTab === 'sandbox' && (
              <div className="space-y-4">
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-display font-bold text-sm text-white">
                      Your LeetCode Practice Sandbox
                    </h3>
                    <div className="flex gap-1.5 no-print">
                      <button
                        onClick={loadAIReferenceIntoSandbox}
                        className="text-[10px] bg-indigo-950 border border-indigo-800/60 text-indigo-300 hover:bg-indigo-900 px-2.5 py-1 rounded-md font-mono font-bold transition-all cursor-pointer"
                        title="Copy AI's exact solution to get a headstart!"
                      >
                        Load Expert Answers
                      </button>
                      <button
                        onClick={resetSandboxNotes}
                        className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded-md font-mono border border-slate-800 transition-all cursor-pointer"
                      >
                        Reset Notes
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Practice applying the framework step-by-step for <strong>{currentSheet.problemName}</strong>! Fill in your thoughts, save formulas, and switch the print preview mode to <strong>"My Practice Notes"</strong> to print your customized version.
                  </p>
                </div>

                <div className="space-y-4 font-sans text-xs">
                  {/* Step 1 & 2 */}
                  <div className="p-3 bg-slate-900/20 border border-slate-800/80 rounded-xl space-y-3">
                    <span className="font-mono text-[10px] uppercase text-indigo-400 font-bold tracking-wider">
                      Steps 1 & 2: Define & Brute Force
                    </span>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">
                        Function Signature f(x):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. f(nums) = [next_greater_i]"
                        value={activeSandboxNotes.functionDefinition?.signature || ''}
                        onChange={(e) => handleUpdateSandbox(prev => ({
                          ...prev,
                          functionDefinition: {
                            signature: e.target.value,
                            description: prev.functionDefinition?.description || ''
                          }
                        }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">
                        Function Description:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Define what mapping this function satisfies..."
                        value={activeSandboxNotes.functionDefinition?.description || ''}
                        onChange={(e) => handleUpdateSandbox(prev => ({
                          ...prev,
                          functionDefinition: {
                            signature: prev.functionDefinition?.signature || '',
                            description: e.target.value
                          }
                        }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Brute Time:</label>
                        <input
                          type="text"
                          placeholder="O(N²)"
                          value={activeSandboxNotes.bruteForce?.timeComplexity || ''}
                          onChange={(e) => handleUpdateSandbox(prev => ({
                            ...prev,
                            bruteForce: {
                              ...prev.bruteForce,
                              logic: prev.bruteForce?.logic || '',
                              spaceComplexity: prev.bruteForce?.spaceComplexity || '',
                              timeComplexity: e.target.value
                            }
                          }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Brute Space:</label>
                        <input
                          type="text"
                          placeholder="O(1)"
                          value={activeSandboxNotes.bruteForce?.spaceComplexity || ''}
                          onChange={(e) => handleUpdateSandbox(prev => ({
                            ...prev,
                            bruteForce: {
                              ...prev.bruteForce,
                              logic: prev.bruteForce?.logic || '',
                              timeComplexity: prev.bruteForce?.timeComplexity || '',
                              spaceComplexity: e.target.value
                            }
                          }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Brute Force Logic:</label>
                      <textarea
                        rows={2}
                        placeholder="Scan everything, test all combinations..."
                        value={activeSandboxNotes.bruteForce?.logic || ''}
                        onChange={(e) => handleUpdateSandbox(prev => ({
                          ...prev,
                          bruteForce: {
                            ...prev.bruteForce,
                            timeComplexity: prev.bruteForce?.timeComplexity || '',
                            spaceComplexity: prev.bruteForce?.spaceComplexity || '',
                            logic: e.target.value
                          }
                        }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Step 3 & 4 */}
                  <div className="p-3 bg-slate-900/20 border border-slate-800/80 rounded-xl space-y-3">
                    <span className="font-mono text-[10px] uppercase text-indigo-400 font-bold tracking-wider">
                      Steps 3 & 4: Repeated Work & Reversed Flow
                    </span>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Repeated Work List:</label>
                      <textarea
                        rows={2}
                        placeholder="Overlapping rightward scans, re-counting character maps..."
                        value={(activeSandboxNotes.repeatedWork || []).join('\n')}
                        onChange={(e) => handleUpdateSandbox(prev => ({
                          ...prev,
                          repeatedWork: e.target.value ? e.target.value.split('\n') : []
                        }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 font-mono"
                      />
                      <span className="text-[10px] text-slate-500 italic block mt-0.5">Use separate lines for separate items.</span>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Traditional Query (Query → Answer):</label>
                      <input
                        type="text"
                        placeholder="Who is greater than me?"
                        value={activeSandboxNotes.reverseInformationFlow?.traditionalQuery || ''}
                        onChange={(e) => handleUpdateSandbox(prev => ({
                          ...prev,
                          reverseInformationFlow: {
                            ...prev.reverseInformationFlow,
                            reversedQuery: prev.reverseInformationFlow?.reversedQuery || '',
                            insight: prev.reverseInformationFlow?.insight || '',
                            traditionalQuery: e.target.value
                          }
                        }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Reversed Query (Answer → Query):</label>
                      <input
                        type="text"
                        placeholder="Am I greater than previous waiting queries?"
                        value={activeSandboxNotes.reverseInformationFlow?.reversedQuery || ''}
                        onChange={(e) => handleUpdateSandbox(prev => ({
                          ...prev,
                          reverseInformationFlow: {
                            ...prev.reverseInformationFlow,
                            traditionalQuery: prev.reverseInformationFlow?.traditionalQuery || '',
                            insight: prev.reverseInformationFlow?.insight || '',
                            reversedQuery: e.target.value
                          }
                        }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Breakthrough Insight:</label>
                      <textarea
                        rows={2}
                        placeholder="A new element answers multiple elements waiting behind it..."
                        value={activeSandboxNotes.reverseInformationFlow?.insight || ''}
                        onChange={(e) => handleUpdateSandbox(prev => ({
                          ...prev,
                          reverseInformationFlow: {
                            ...prev.reverseInformationFlow,
                            traditionalQuery: prev.reverseInformationFlow?.traditionalQuery || '',
                            reversedQuery: prev.reverseInformationFlow?.reversedQuery || '',
                            insight: e.target.value
                          }
                        }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Step 5 & 6 */}
                  <div className="p-3 bg-slate-900/20 border border-slate-800/80 rounded-xl space-y-3">
                    <span className="font-mono text-[10px] uppercase text-indigo-400 font-bold tracking-wider">
                      Steps 5 & 6: State & Compression
                    </span>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">State Description:</label>
                      <input
                        type="text"
                        placeholder="Unanswered indices in monotonic order..."
                        value={activeSandboxNotes.state?.description || ''}
                        onChange={(e) => handleUpdateSandbox(prev => ({
                          ...prev,
                          state: {
                            stateVariables: prev.state?.stateVariables || [],
                            description: e.target.value
                          }
                        }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">What is discarded (Compression):</label>
                      <textarea
                        rows={2}
                        placeholder="Any elements smaller than leftward items can never resolve queries..."
                        value={activeSandboxNotes.stateCompression?.whatToRemove || ''}
                        onChange={(e) => handleUpdateSandbox(prev => ({
                          ...prev,
                          stateCompression: {
                            howCompressed: prev.stateCompression?.howCompressed || '',
                            whatToRemove: e.target.value
                          }
                        }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">How Compressed:</label>
                      <textarea
                        rows={2}
                        placeholder="Strictly decreasing monotonic indices..."
                        value={activeSandboxNotes.stateCompression?.howCompressed || ''}
                        onChange={(e) => handleUpdateSandbox(prev => ({
                          ...prev,
                          stateCompression: {
                            whatToRemove: prev.stateCompression?.whatToRemove || '',
                            howCompressed: e.target.value
                          }
                        }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Step 7, 8, 9 */}
                  <div className="p-3 bg-slate-900/20 border border-slate-800/80 rounded-xl space-y-3">
                    <span className="font-mono text-[10px] uppercase text-indigo-400 font-bold tracking-wider">
                      Steps 7, 8, 9: Invariant, Events & DS
                    </span>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">The Invariant:</label>
                      <textarea
                        rows={2}
                        placeholder="The stack remains strictly decreasing..."
                        value={activeSandboxNotes.invariant || ''}
                        onChange={(e) => handleUpdateSandbox(prev => ({
                          ...prev,
                          invariant: e.target.value
                        }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Selected Data Structure:</label>
                      <input
                        type="text"
                        placeholder="Monotonic Stack"
                        value={activeSandboxNotes.dataStructure?.selectedDS || ''}
                        onChange={(e) => handleUpdateSandbox(prev => ({
                          ...prev,
                          dataStructure: {
                            reason: prev.dataStructure?.reason || '',
                            selectedDS: e.target.value
                          }
                        }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Why this fits:</label>
                      <textarea
                        rows={2}
                        placeholder="Supports LIFO lookup matching the nearest unresolved element query..."
                        value={activeSandboxNotes.dataStructure?.reason || ''}
                        onChange={(e) => handleUpdateSandbox(prev => ({
                          ...prev,
                          dataStructure: {
                            selectedDS: prev.dataStructure?.selectedDS || '',
                            reason: e.target.value
                          }
                        }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Final Time:</label>
                        <input
                          type="text"
                          placeholder="O(N)"
                          value={activeSandboxNotes.finalComplexity?.time || ''}
                          onChange={(e) => handleUpdateSandbox(prev => ({
                            ...prev,
                            finalComplexity: {
                              ...prev.finalComplexity,
                              space: prev.finalComplexity?.space || '',
                              time: e.target.value
                            }
                          }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Final Space:</label>
                        <input
                          type="text"
                          placeholder="O(N)"
                          value={activeSandboxNotes.finalComplexity?.space || ''}
                          onChange={(e) => handleUpdateSandbox(prev => ({
                            ...prev,
                            finalComplexity: {
                              ...prev.finalComplexity,
                              time: prev.finalComplexity?.time || '',
                              space: e.target.value
                            }
                          }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Code Implementation */}
                  <div className="p-3 bg-slate-900/20 border border-slate-800/80 rounded-xl space-y-3">
                    <span className="font-mono text-[10px] uppercase text-indigo-400 font-bold tracking-wider">
                      Code Implementation
                    </span>
                    <div>
                      <textarea
                        rows={6}
                        placeholder="function solve() { ... }"
                        value={activeSandboxNotes.codeSnippet?.code || ''}
                        onChange={(e) => handleUpdateSandbox(prev => ({
                          ...prev,
                          codeSnippet: {
                            language: 'typescript',
                            code: e.target.value
                          }
                        }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-[11px] text-emerald-400 font-mono placeholder:text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: The Print-Perfect Live Preview */}
        <div className="flex-1 bg-slate-900 overflow-y-auto flex flex-col p-6 items-center border-slate-800">
          
          {/* Visual controls and config panel */}
          <div className="w-full max-w-4xl bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 flex flex-wrap gap-4 items-center justify-between text-xs">
            <div className="flex flex-wrap items-center gap-4">
              {/* Mode Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Preview Target</span>
                <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-800 flex">
                  <button
                    onClick={() => setMode('reference')}
                    className={`px-3 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                      mode === 'reference' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    AI Expert Sheet
                  </button>
                  <button
                    onClick={() => {
                      setMode('sandbox');
                      setActiveTab('sandbox');
                    }}
                    className={`px-3 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                      mode === 'sandbox' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>My Practice Notes</span>
                  </button>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Print theme style</span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none"
                >
                  <option value="geometric-balance">Geometric Balance</option>
                  <option value="tech-slate">Sleek Tech Slate</option>
                  <option value="academic">Academic Handout (Pure Mono)</option>
                  <option value="blueprint">Engineer Draft Blueprint</option>
                </select>
              </div>

              {/* Font Size Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Font Scale</span>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none"
                >
                  <option value="xs">Dense (XS)</option>
                  <option value="sm">Standard (SM)</option>
                  <option value="base">Medium (MD)</option>
                  <option value="lg">Spacious (LG)</option>
                </select>
              </div>

              {/* Layout Style Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Layout Style</span>
                <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-800 flex">
                  <button
                    onClick={() => setViewLayout('sheet')}
                    className={`px-3 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                      viewLayout === 'sheet' 
                        ? 'bg-indigo-600 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>A4 Sheet</span>
                  </button>
                  <button
                    onClick={() => setViewLayout('slides')}
                    className={`px-3 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                      viewLayout === 'slides' 
                        ? 'bg-indigo-600 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Slides</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Scale Slider & Full Screen Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Zoom:</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.2"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-20 accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] font-mono text-slate-400 w-8">{(scale * 100).toFixed(0)}%</span>
              </div>

              <button
                onClick={() => setIsFullScreen(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white py-1.5 px-3 rounded-lg font-medium text-[11px] transition-all cursor-pointer shadow-sm border border-indigo-500/30"
                title="Open sheet in immersive full screen"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Full Screen</span>
              </button>
            </div>
          </div>

          {/* Interactive alert informing user what printing triggers */}
          <div className="w-full max-w-4xl bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 mb-6 flex items-center gap-2.5">
            <Info className="w-5 h-5 text-indigo-400 shrink-0" />
            <p className="leading-normal">
              <strong>Tip:</strong> The card below is formatted to exactly standard **A4 portrait layout**. Clicking **Print Sheet (A4)** automatically hides all application panels and styles the layout flawlessly for A4 PDF conversion or paper prints.
            </p>
          </div>

          {/* Scale container wrapping the Sheet */}
          <div 
            className="w-full flex justify-center overflow-x-auto p-4 bg-slate-950 rounded-2xl border border-slate-800/60 shadow-inner"
            style={{ minHeight: '600px' }}
          >
            {viewLayout === 'sheet' ? (
              <div 
                style={{ 
                  transform: `scale(${scale})`, 
                  transformOrigin: 'top center',
                  width: '100%',
                  maxWidth: '850px'
                }}
                className="origin-top font-sans"
              >
                <A4Sheet
                  data={currentSheet}
                  sandboxNotes={activeSandboxNotes}
                  mode={mode}
                  theme={theme}
                  fontSize={fontSize}
                  showLineNumbers={showLineNumbers}
                />
              </div>
            ) : (
              <div className="w-full max-w-4xl flex justify-center font-sans">
                <SlideView
                  data={currentSheet}
                  sandboxNotes={activeSandboxNotes}
                  mode={mode}
                  theme={theme}
                  fontSize={fontSize}
                  showLineNumbers={showLineNumbers}
                />
              </div>
            )}
          </div>

        </div>

      </main>

      {/* 3. Pure Print View - ONLY Visible during window.print() */}
      <div className="hidden print:block bg-white text-black min-h-screen p-0">
        <A4Sheet
          data={currentSheet}
          sandboxNotes={activeSandboxNotes}
          mode={mode}
          theme={theme}
          fontSize={fontSize}
          showLineNumbers={showLineNumbers}
        />
      </div>

      {/* 4. Full Screen Overlay View */}
      {isFullScreen && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 overflow-y-auto flex flex-col p-6 items-center no-print">
          
          {/* Controls Bar */}
          <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between text-xs mb-6 shadow-2xl sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <Cpu className="text-indigo-400 w-5 h-5" />
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Full Screen Preview: <span className="text-indigo-400">{currentSheet.problemName}</span>
                </h2>
                <p className="text-[10px] text-slate-400">
                  Press <kbd className="bg-slate-800 px-1 py-0.5 rounded border border-slate-700 font-mono text-slate-300">ESC</kbd> to exit full screen
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Preview Target */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Preview Target</span>
                <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex">
                  <button
                    onClick={() => setMode('reference')}
                    className={`px-2.5 py-1 rounded-md font-medium text-[10px] transition-all cursor-pointer ${
                      mode === 'reference' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    AI Expert
                  </button>
                  <button
                    onClick={() => {
                      setMode('sandbox');
                    }}
                    className={`px-2.5 py-1 rounded-md font-medium text-[10px] transition-all cursor-pointer flex items-center gap-1 ${
                      mode === 'sandbox' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>Sandbox</span>
                  </button>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Print theme style</span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="bg-slate-955 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 bg-slate-950 focus:outline-none"
                >
                  <option value="geometric-balance">Geometric Balance</option>
                  <option value="tech-slate">Sleek Tech Slate</option>
                  <option value="academic">Academic Handout (Pure Mono)</option>
                  <option value="blueprint">Engineer Draft Blueprint</option>
                </select>
              </div>

              {/* Font Size Selector */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Font Scale</span>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value as any)}
                  className="bg-slate-955 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 bg-slate-950 focus:outline-none"
                >
                  <option value="xs">Dense (XS)</option>
                  <option value="sm">Standard (SM)</option>
                  <option value="base">Medium (MD)</option>
                  <option value="lg">Spacious (LG)</option>
                </select>
              </div>

              {/* Layout Style Selector */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Layout Style</span>
                <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex">
                  <button
                    onClick={() => setViewLayout('sheet')}
                    className={`px-2 py-0.5 rounded font-medium text-[10px] transition-all cursor-pointer ${
                      viewLayout === 'sheet' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    A4 Sheet
                  </button>
                  <button
                    onClick={() => setViewLayout('slides')}
                    className={`px-2 py-0.5 rounded font-medium text-[10px] transition-all cursor-pointer ${
                      viewLayout === 'slides' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Slides
                  </button>
                </div>
              </div>

              {/* Zoom Slider */}
              <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-[10px]">Zoom:</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-16 accent-indigo-500 cursor-pointer"
                />
                <span className="text-[9px] font-mono text-slate-400 w-8">{(scale * 100).toFixed(0)}%</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-2 px-3 rounded-lg font-semibold text-[11px] shadow-md shadow-indigo-900/20 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => setIsFullScreen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-lg font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1 border border-slate-700"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Exit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Full Screen Sheet Stage */}
          <div className="w-full max-w-5xl flex justify-center bg-slate-950 rounded-2xl border border-slate-800 p-8 shadow-inner overflow-x-auto min-h-[90vh] mb-8">
            {viewLayout === 'sheet' ? (
              <div 
                style={{ 
                  transform: `scale(${scale})`, 
                  transformOrigin: 'top center',
                  width: '100%',
                  maxWidth: '850px'
                }}
                className="origin-top font-sans"
              >
                <A4Sheet
                  data={currentSheet}
                  sandboxNotes={activeSandboxNotes}
                  mode={mode}
                  theme={theme}
                  fontSize={fontSize}
                  showLineNumbers={showLineNumbers}
                />
              </div>
            ) : (
              <div className="w-full max-w-4xl flex justify-center font-sans">
                <SlideView
                  data={currentSheet}
                  sandboxNotes={activeSandboxNotes}
                  mode={mode}
                  theme={theme}
                  fontSize={fontSize}
                  showLineNumbers={showLineNumbers}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
