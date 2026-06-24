import React, { useState, useEffect } from 'react';
import { PRESET_SHEETS } from './presets';
import { A4Sheet } from './components/A4Sheet';
import { DSASheetData } from './types';
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
  AlertTriangle
} from 'lucide-react';

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

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: customTitle,
          problemDescription: customDesc
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate thinking sheet.');
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
            </div>

            {/* Scale Slider */}
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
            style={{ minHeight: '800px' }}
          >
            <div 
              style={{ 
                transform: `scale(${scale})`, 
                transformOrigin: 'top center',
                width: '100%',
                maxWidth: '850px'
              }}
              className="origin-top"
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
    </div>
  );
}
