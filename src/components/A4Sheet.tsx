import React from 'react';
import { DSASheetData } from '../types';
import { Check, Code2, Layers, Cpu, Compass, RefreshCw, Zap, Table, AlertTriangle } from 'lucide-react';

interface A4SheetProps {
  data: DSASheetData;
  sandboxNotes?: Partial<DSASheetData>;
  mode: 'reference' | 'sandbox' | 'comparison';
  theme: 'academic' | 'tech-slate' | 'blueprint' | 'geometric-balance';
  fontSize: 'xs' | 'sm' | 'base' | 'lg';
  showLineNumbers: boolean;
}

export const A4Sheet: React.FC<A4SheetProps> = ({
  data,
  sandboxNotes = {} as Partial<DSASheetData>,
  mode,
  theme,
  fontSize,
  showLineNumbers
}) => {
  // Helper to determine text content based on selected mode (AI reference vs. user sandbox notes)
  const getField = <K extends keyof DSASheetData>(key: K, fallback: string = ""): any => {
    if (mode === 'sandbox') {
      return sandboxNotes[key] || "";
    }
    return data[key] || fallback;
  };

  const getSubField = (parentKey: 'functionDefinition' | 'bruteForce' | 'reverseInformationFlow' | 'state' | 'stateCompression' | 'dataStructure' | 'finalComplexity', childKey: string, fallback: string = ""): string => {
    if (mode === 'sandbox') {
      const parent = sandboxNotes[parentKey] as any;
      return parent ? parent[childKey] || "" : "";
    }
    const parent = data[parentKey] as any;
    return parent ? parent[childKey] || fallback : fallback;
  };

  const getRepeatedWork = (): string[] => {
    if (mode === 'sandbox') {
      return sandboxNotes.repeatedWork || [];
    }
    return data.repeatedWork || [];
  };

  const getEvents = (): Array<{ trigger: string; update: string }> => {
    if (mode === 'sandbox') {
      return sandboxNotes.events || [];
    }
    return data.events || [];
  };

  const getChecklistAnswer = (key: keyof DSASheetData['checklistAnswers']): string => {
    if (mode === 'sandbox') {
      return sandboxNotes.checklistAnswers ? sandboxNotes.checklistAnswers[key] || "" : "";
    }
    return data.checklistAnswers ? data.checklistAnswers[key] || "" : "";
  };

  const getCodeSnippet = (): { language: string; code: string } => {
    if (mode === 'sandbox') {
      return sandboxNotes.codeSnippet || { language: 'typescript', code: '' };
    }
    return data.codeSnippet || { language: 'typescript', code: '' };
  };

  // Theme-specific CSS classes
  const themeStyles = {
    academic: {
      container: "bg-white text-gray-900 font-sans border-gray-400 print:border-none",
      headerBg: "bg-white border-b-2 border-double border-gray-900",
      accentText: "text-gray-900 font-bold",
      monoText: "font-mono bg-gray-50 text-gray-900 px-1 py-0.5 rounded border border-gray-100",
      codeBg: "bg-gray-50 text-gray-900 border border-gray-300 font-mono",
      cardBg: "bg-white border border-gray-300",
      titleFont: "font-display font-bold tracking-tight text-gray-900",
      sectionHeading: "font-display text-xs uppercase tracking-widest border-b border-gray-900 pb-0.5 mb-1.5 font-bold",
      divider: "border-gray-900 border-dashed"
    },
    'tech-slate': {
      container: "bg-slate-50 text-slate-900 font-sans border-slate-300 print:border-none",
      headerBg: "bg-slate-900 text-white p-6 rounded-t-lg",
      accentText: "text-indigo-600 font-semibold",
      monoText: "font-mono bg-indigo-50 text-indigo-900 px-1 py-0.5 rounded font-medium",
      codeBg: "bg-slate-900 text-slate-100 border border-slate-800 font-mono",
      cardBg: "bg-white border border-slate-200 shadow-xs",
      titleFont: "font-display font-extrabold tracking-tight",
      sectionHeading: "font-display text-xs uppercase tracking-wider text-indigo-700 font-bold border-b border-indigo-100 pb-1 mb-2",
      divider: "border-slate-200"
    },
    blueprint: {
      container: "bg-[#f4f7fa] text-[#1a3a5f] font-mono border-[#8ca9cf] print:border-none",
      headerBg: "bg-[#1a3a5f] text-white p-5 border-b border-[#8ca9cf]",
      accentText: "text-[#0052cc] font-bold",
      monoText: "font-mono bg-white text-[#0052cc] px-1 py-0.5 rounded border border-[#8ca9cf]",
      codeBg: "bg-[#0b1b30] text-[#a5c3e6] border border-[#1a3a5f] font-mono",
      cardBg: "bg-white border border-[#abc2de]",
      titleFont: "font-mono font-bold uppercase tracking-tight text-white",
      sectionHeading: "font-mono text-xs uppercase tracking-wider text-[#1a3a5f] font-bold border-b-2 border-[#1a3a5f] pb-0.5 mb-2",
      divider: "border-[#abc2de] border-double"
    },
    'geometric-balance': {
      container: "bg-slate-50 text-slate-900 font-mono border-8 border-slate-200 print:border-none",
      headerBg: "bg-white border-b-2 border-slate-900 pb-4 mb-4",
      accentText: "text-blue-600 font-bold",
      monoText: "font-mono bg-white text-slate-900 px-1 py-0.5 border border-slate-300 font-bold",
      codeBg: "bg-slate-900 text-slate-100 border border-slate-900 font-mono",
      cardBg: "bg-white border border-slate-300 shadow-sm",
      titleFont: "font-sans font-black tracking-tighter uppercase text-slate-900",
      sectionHeading: "font-mono text-[10px] text-blue-600 font-bold uppercase tracking-wide border-b border-slate-200 mb-1.5 pb-0.5",
      divider: "border-slate-900 border-b-2"
    }
  }[theme];

  // Font size multiplier
  const sizeClasses = {
    xs: "text-[10px] leading-relaxed",
    sm: "text-[11px] leading-relaxed",
    base: "text-[12px] leading-relaxed",
    lg: "text-[13px] leading-relaxed"
  }[fontSize];

  const subSizeClasses = {
    xs: "text-[9px]",
    sm: "text-[10px]",
    base: "text-[11px]",
    lg: "text-[12px]"
  }[fontSize];

  return (
    <div 
      id="dsa-a4-sheet"
      className={`print-page w-full aspect-[210/297] mx-auto p-8 border-2 shadow-xl rounded-md flex flex-col justify-between transition-all duration-300 ${themeStyles.container} ${sizeClasses}`}
    >
      {/* 1. Header Area */}
      {theme === 'geometric-balance' ? (
        <header className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tighter leading-none uppercase text-slate-900">
              {getField('problemName') || "DSA Thinking Framework"}
            </h1>
            <p className="text-xs mt-1 text-slate-500 font-sans font-bold uppercase tracking-widest italic leading-tight">
              {getField('problemDescription') || "From Problem Computation → Efficient Implementation"}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`inline-block px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold ${
                getField('difficulty') === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                getField('difficulty') === 'Medium' ? 'bg-amber-100 text-amber-800' :
                'bg-rose-100 text-rose-800'
              } no-print`}>
                {getField('difficulty') || "Medium"}
              </span>
              <span className="text-[10px] font-mono text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded font-semibold border border-slate-300">
                f(x) = {getSubField('functionDefinition', 'signature') || "compute(x)"}
              </span>
            </div>
          </div>
          <div className="text-right pl-4 shrink-0">
            <div className="text-[10px] bg-slate-900 text-white px-2 py-0.5 inline-block mb-1 font-sans font-bold">REVISION 1.0.4</div>
            <p className="text-[10px] text-slate-400 font-sans uppercase">SYSTEMATIC ALGORITHMIC DESIGN</p>
          </div>
        </header>
      ) : (
        <div className={`mb-4 rounded-md overflow-hidden ${theme === 'academic' ? 'border-b-4 border-gray-900 pb-3' : ''}`}>
          <div className={`p-4 ${theme !== 'academic' ? themeStyles.headerBg : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1.5 text-xs tracking-wider uppercase opacity-80 font-semibold mb-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>DSA Thinking Framework</span>
                </div>
                <h1 className={`${themeStyles.titleFont} text-2xl`}>
                  {getField('problemName') || "Untitled Algorithm"}
                </h1>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${
                  getField('difficulty') === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                  getField('difficulty') === 'Medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                } no-print`}>
                  {getField('difficulty') || "Medium"}
                </span>
                <p className="text-[10px] font-mono opacity-80 mt-1">
                  A4 PORTRAIT REFERENCE
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-current/10">
              <div className="col-span-1 md:col-span-3">
                <span className="font-bold uppercase tracking-wider text-[9px] opacity-75 block">Problem Context:</span>
                <p className="italic text-[10px] line-clamp-2">
                  {getField('problemDescription') || "Enter a custom problem description in the workspace panels to formulate your thinking sheet."}
                </p>
              </div>
              <div className="col-span-1 border-l pl-3 border-current/10">
                <span className="font-bold uppercase tracking-wider text-[9px] opacity-75 block">Function Target:</span>
                <code className={`${themeStyles.monoText} text-[10px] block truncate font-bold mt-1`}>
                  {getSubField('functionDefinition', 'signature') || "f(x) = compute(x)"}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Columns / Bento Grid of the 9 Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
        
        {/* Column 1: Core Target & Brute Force */}
        <div className="space-y-3 flex flex-col">
          {/* Step 1: Define the Function */}
          <div className={`p-3 rounded-md flex-1 ${themeStyles.cardBg}`}>
            <h3 className={themeStyles.sectionHeading}>
              1. Define the Function
            </h3>
            <p className="font-semibold text-indigo-950/95 dark:text-gray-900 mb-1">
              Required output for input:
            </p>
            <div className="p-1.5 bg-gray-50 rounded border mb-1.5">
              <code className={`${themeStyles.monoText} block text-[10px] text-center`}>
                {getSubField('functionDefinition', 'signature') || "f(input) = output"}
              </code>
            </div>
            <p className={`${subSizeClasses} opacity-90`}>
              {getSubField('functionDefinition', 'description') || "Describe clearly what mapping this function satisfies."}
            </p>
          </div>

          {/* Step 2: Write Brute Force */}
          <div className={`p-3 rounded-md flex-1 ${themeStyles.cardBg}`}>
            <h3 className={themeStyles.sectionHeading}>
              2. Brute Force
            </h3>
            <p className={`${subSizeClasses} font-semibold text-gray-700 block mb-1`}>
              Brute Force Logic:
            </p>
            <p className={`${subSizeClasses} italic leading-tight mb-2 opacity-90`}>
              "{getSubField('bruteForce', 'logic') || "How would you solve this if efficiency did not matter?"}"
            </p>
            <div className="grid grid-cols-2 gap-2 border-t pt-1.5 border-dashed border-gray-300">
              <div>
                <span className="text-[9px] uppercase tracking-wider opacity-75 block">Brute Time</span>
                <span className={`${themeStyles.monoText} text-[10px] font-bold`}>
                  {getSubField('bruteForce', 'timeComplexity') || "O(?)"}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider opacity-75 block">Brute Space</span>
                <span className={`${themeStyles.monoText} text-[10px] font-bold`}>
                  {getSubField('bruteForce', 'spaceComplexity') || "O(?)"}
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Find Repeated Work */}
          <div className={`p-3 rounded-md flex-1 ${themeStyles.cardBg}`}>
            <h3 className={themeStyles.sectionHeading}>
              3. Repeated Work
            </h3>
            <p className={`${subSizeClasses} mb-1 font-semibold`}>
              Why is the brute force slow?
            </p>
            {getRepeatedWork().length > 0 ? (
              <ul className="space-y-1 pl-3 list-disc">
                {getRepeatedWork().map((item, idx) => (
                  <li key={idx} className={`${subSizeClasses} opacity-90`}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`${subSizeClasses} italic text-gray-400`}>
                Identified redundant scans, overlaps, or recalculations.
              </p>
            )}
          </div>
        </div>

        {/* Column 2: Reverse Flow, State & Compression */}
        <div className="space-y-3 flex flex-col">
          {/* Step 4: Reverse Information Flow */}
          <div className={`p-3 rounded-md flex-1 ${themeStyles.cardBg}`}>
            <h3 className={themeStyles.sectionHeading}>
              4. Reverse Information Flow
            </h3>
            <div className="space-y-1.5">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 block">Query → Answer</span>
                <p className={`${subSizeClasses} italic opacity-90`}>
                  "{getSubField('reverseInformationFlow', 'traditionalQuery') || "Standard scan approach"}"
                </p>
              </div>
              <div className="text-center py-0.5">
                <span className="text-[10px] font-bold">⇄ REVERSED ⇄</span>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 block">Answer → Query</span>
                <p className={`${subSizeClasses} italic opacity-90`}>
                  "{getSubField('reverseInformationFlow', 'reversedQuery') || "How does a new candidate answer previous elements?"}"
                </p>
              </div>
              <div className="border-t pt-1.5 mt-1 border-dashed border-gray-300">
                <span className="text-[9px] font-bold uppercase opacity-75 block">Breakthrough Insight:</span>
                <p className={`${subSizeClasses} font-semibold leading-tight text-indigo-950`}>
                  {getSubField('reverseInformationFlow', 'insight') || "What enables standard query inversion?"}
                </p>
              </div>
            </div>
          </div>

          {/* Step 5: Identify the State */}
          <div className={`p-3 rounded-md flex-1 ${themeStyles.cardBg}`}>
            <h3 className={themeStyles.sectionHeading}>
              5. Identify the State
            </h3>
            <p className={`${subSizeClasses} mb-1.5 opacity-90`}>
              <strong>State Variable(s):</strong> what survives between iterations.
            </p>
            <div className="space-y-1.5">
              {getSubField('state', 'description') && (
                <p className={`${subSizeClasses} bg-slate-50 p-1 border rounded italic`}>
                  {getSubField('state', 'description')}
                </p>
              )}
              {((mode === 'sandbox' ? sandboxNotes.state?.stateVariables : data.state?.stateVariables) || []).map((v: any, idx: number) => (
                <div key={idx} className="border-l-2 border-indigo-400 pl-1.5">
                  <span className={`${themeStyles.monoText} text-[9px] font-bold`}>{v.name}</span>
                  <p className="text-[9px] text-gray-600 mt-0.5">{v.purpose}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 6: Compress the State */}
          <div className={`p-3 rounded-md flex-1 ${themeStyles.cardBg}`}>
            <h3 className={themeStyles.sectionHeading}>
              6. Compress the State
            </h3>
            <div className="space-y-1">
              <div>
                <span className="text-[9px] font-bold uppercase text-red-500 block">Discard Redundant / Dominated:</span>
                <p className={`${subSizeClasses} opacity-90`}>
                  {getSubField('stateCompression', 'whatToRemove') || "Which entries can never help again?"}
                </p>
              </div>
              <div className="border-t border-gray-200 mt-1 pt-1.5">
                <span className="text-[9px] font-bold uppercase text-indigo-600 block">Compressed Form:</span>
                <p className={`${subSizeClasses} font-semibold text-indigo-950`}>
                  {getSubField('stateCompression', 'howCompressed') || "How is the state reduced to active candidates?"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Invariant, Events & DS */}
        <div className="space-y-3 flex flex-col">
          {/* Step 7: Find the Invariant */}
          <div className={`p-3 rounded-md flex-1 ${themeStyles.cardBg}`}>
            <h3 className={themeStyles.sectionHeading}>
              7. Find the Invariant
            </h3>
            <p className={`${subSizeClasses} mb-1 font-semibold text-slate-800`}>
              What must always remain true?
            </p>
            <div className="bg-amber-50/50 border border-amber-200 p-2 rounded text-[10px] leading-tight text-amber-950">
              <strong>Invariant:</strong> {getField('invariant') || "Specify the constant mathematical property that bounds search states."}
            </div>
          </div>

          {/* Step 8: Identify Events */}
          <div className={`p-3 rounded-md flex-1 ${themeStyles.cardBg}`}>
            <h3 className={themeStyles.sectionHeading}>
              8. Identify Events
            </h3>
            <p className={`${subSizeClasses} font-semibold mb-1`}>
              State Updates & Transitions:
            </p>
            {getEvents().length > 0 ? (
              <div className="space-y-1.5">
                {getEvents().map((ev, idx) => (
                  <div key={idx} className="bg-slate-50 p-1 border rounded text-[9px]">
                    <div className="font-bold text-slate-700">➜ {ev.trigger}</div>
                    <div className="text-gray-600 italic">{ev.update}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`${subSizeClasses} italic text-gray-400`}>
                Specify events and triggers.
              </p>
            )}
          </div>

          {/* Step 9: Choose the Data Structure */}
          <div className={`p-3 rounded-md flex-1 ${
            theme === 'geometric-balance' 
              ? 'bg-slate-900 text-white border border-slate-900 shadow-sm' 
              : themeStyles.cardBg
          }`}>
            <h3 className={
              theme === 'geometric-balance'
                ? "font-mono text-[10px] text-blue-400 font-bold uppercase tracking-wide border-b border-slate-700 mb-1.5 pb-0.5"
                : themeStyles.sectionHeading
            }>
              9. Choose Data Structure
            </h3>
            <div className={`flex items-center gap-1.5 mb-1 p-1 rounded font-mono font-bold text-[10px] ${
              theme === 'geometric-balance'
                ? 'bg-slate-800 text-blue-300 border border-slate-700'
                : 'bg-indigo-50 text-indigo-900 border border-indigo-100'
            }`}>
              <Table className={`w-3.5 h-3.5 ${theme === 'geometric-balance' ? 'text-blue-400' : 'text-indigo-600'}`} />
              <span>{getSubField('dataStructure', 'selectedDS') || "Hash Map / Monotonic Stack / Queue / Heap"}</span>
            </div>
            <p className={`${subSizeClasses} leading-tight ${theme === 'geometric-balance' ? 'text-slate-300' : 'opacity-90'}`}>
              {getSubField('dataStructure', 'reason') || "Explain how this DS perfectly preserves the State + Invariant at minimal complexity."}
            </p>
            <div className={`mt-2 border-t pt-2 grid grid-cols-2 gap-2 ${theme === 'geometric-balance' ? 'border-slate-800' : ''}`}>
              <div>
                <span className="text-[9px] uppercase tracking-wider block opacity-75">Final Time</span>
                <span className={`${
                  theme === 'geometric-balance'
                    ? "font-mono bg-slate-800 text-slate-100 px-1 py-0.5 border border-slate-700 font-bold"
                    : themeStyles.monoText
                } text-[10px] font-bold`}>
                  {getSubField('finalComplexity', 'time') || "O(?)"}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider block opacity-75">Final Space</span>
                <span className={`${
                  theme === 'geometric-balance'
                    ? "font-mono bg-slate-800 text-slate-100 px-1 py-0.5 border border-slate-700 font-bold"
                    : themeStyles.monoText
                } text-[10px] font-bold`}>
                  {getSubField('finalComplexity', 'space') || "O(?)"}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. The Master Formula Trace */}
      <div className={`my-3 p-2 border rounded-md font-mono ${themeStyles.codeBg} ${subSizeClasses} no-print`}>
        <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider opacity-75 mb-0.5">
          <Cpu className="w-3.5 h-3.5" />
          <span>Master Formula Execution Trace</span>
        </div>
        <p className="whitespace-normal leading-normal text-[10px]">
          {getField('masterFormulaTrace') || "Problem → Function → Brute Force → Repeated Work → Reverse Flow → State → Compression → Invariant → Events → DS."}
        </p>
      </div>

      {/* 4. Bottom Row: Checklist, Code, and Golden Rule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t-2 border-dashed border-gray-300">
        
        {/* 30-Second Interview Checklist */}
        <div className={`p-3 rounded-md ${themeStyles.cardBg}`}>
          <h4 className="font-display text-[10px] uppercase tracking-widest font-bold text-slate-800 border-b pb-1 mb-2">
            30-Second Interview Checklist
          </h4>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]">
            <div className="flex items-start gap-1">
              <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-slate-700">1. Function?</span>
                <span className="text-gray-600 truncate block max-w-[120px]">{getChecklistAnswer('function') || "Defined"}</span>
              </div>
            </div>
            <div className="flex items-start gap-1">
              <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-slate-700">2. Brute Force?</span>
                <span className="text-gray-600 truncate block max-w-[120px]">{getChecklistAnswer('bruteForce') || "Analyzed"}</span>
              </div>
            </div>
            <div className="flex items-start gap-1">
              <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-slate-700">3. Repeated Work?</span>
                <span className="text-gray-600 truncate block max-w-[120px]">{getChecklistAnswer('repeatedWork') || "Located"}</span>
              </div>
            </div>
            <div className="flex items-start gap-1">
              <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-slate-700">4. Reversed?</span>
                <span className="text-gray-600 truncate block max-w-[120px]">{getChecklistAnswer('reversedFlow') || "Inverted"}</span>
              </div>
            </div>
            <div className="flex items-start gap-1">
              <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-slate-700">5. State?</span>
                <span className="text-gray-600 truncate block max-w-[120px]">{getChecklistAnswer('state') || "Formed"}</span>
              </div>
            </div>
            <div className="flex items-start gap-1">
              <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-slate-700">6. Compressed?</span>
                <span className="text-gray-600 truncate block max-w-[120px]">{getChecklistAnswer('compressedState') || "Optimized"}</span>
              </div>
            </div>
            <div className="flex items-start gap-1">
              <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-slate-700">7. Invariant?</span>
                <span className="text-gray-600 truncate block max-w-[120px]">{getChecklistAnswer('invariant') || "Formulated"}</span>
              </div>
            </div>
            <div className="flex items-start gap-1">
              <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-slate-700">8. Events?</span>
                <span className="text-gray-600 truncate block max-w-[120px]">{getChecklistAnswer('events') || "Mapped"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Syntax-Highlighted Implementation */}
        <div className={`p-3 rounded-md overflow-hidden flex flex-col justify-between ${themeStyles.codeBg}`}>
          <div className="flex justify-between items-center text-[8px] uppercase tracking-wider opacity-75 border-b border-white/10 pb-1 mb-1">
            <div className="flex items-center gap-1">
              <Code2 className="w-3 h-3" />
              <span>Optimal Implementation ({getCodeSnippet().language})</span>
            </div>
          </div>
          <pre className="text-[8px] leading-tight font-mono whitespace-pre overflow-x-auto flex-1 font-semibold text-emerald-400 max-h-[100px] overflow-y-auto">
            {getCodeSnippet().code || `// Implement the optimal state transitions here...\nfunction solve(nums) {\n  // Invariant holds\n}`}
          </pre>
          <div className="mt-1.5 pt-1.5 border-t border-white/5 flex justify-between items-center text-[8px] italic opacity-85">
            <span>Time: {getSubField('finalComplexity', 'time', 'O(N)')}</span>
            <span>Space: {getSubField('finalComplexity', 'space', 'O(N)')}</span>
          </div>
        </div>

      </div>

      {/* The Golden Rule Banner */}
      {theme === 'geometric-balance' ? (
        <div className="mt-4 grid grid-cols-12 gap-4">
          <div className="col-span-8 bg-blue-50/70 border border-blue-200 p-3 rounded-md text-left">
            <span className="text-[10px] font-bold text-blue-700 uppercase mb-1 block underline">The Golden Rule</span>
            <p className="text-[10px] leading-tight font-sans text-slate-800">
              <span className="font-black">Algorithms are not about memorizing data structures.</span> They are about discovering the synergy between <span className="text-blue-600 font-bold">State</span>, <span className="text-blue-600 font-bold">Invariant</span>, and <span className="text-blue-600 font-bold">Events</span>. The DS usually becomes obvious afterwards.
            </p>
          </div>
          <div className="col-span-4 flex items-center justify-center border-l border-slate-300 pl-2">
            <div className="text-[9px] text-slate-400 font-sans tracking-tight text-center leading-tight uppercase font-semibold">
              &copy; CORE LOGIC FRAMEWORK // DESIGNED FOR PROBLEM SOLVING
            </div>
          </div>
        </div>
      ) : (
        <div className={`mt-3 p-2 rounded-md text-center text-[9px] uppercase tracking-wider font-semibold border ${
          theme === 'academic' ? 'border-gray-900 bg-white' :
          theme === 'tech-slate' ? 'border-indigo-100 bg-indigo-50/50 text-indigo-900' :
          'border-[#8ca9cf] bg-[#e6f0fa] text-[#1a3a5f]'
        }`}>
          👑 <strong>Golden Rule:</strong> Algorithms are not about memorizing data structures. They are about discovering: <span className="font-mono">State + Invariant + Events</span>
        </div>
      )}
    </div>
  );
};
