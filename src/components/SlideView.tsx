import React, { useState, useEffect } from 'react';
import { DSASheetData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Code2, 
  Layers, 
  Cpu, 
  Compass, 
  RefreshCw, 
  Zap, 
  Table, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  BookOpen, 
  FileText,
  Clock,
  Dribbble,
  LayoutGrid
} from 'lucide-react';

interface SlideViewProps {
  data: DSASheetData;
  sandboxNotes?: Partial<DSASheetData>;
  mode: 'reference' | 'sandbox';
  theme: 'academic' | 'tech-slate' | 'blueprint' | 'geometric-balance';
  fontSize: 'xs' | 'sm' | 'base' | 'lg';
  showLineNumbers: boolean;
}

export const SlideView: React.FC<SlideViewProps> = ({
  data,
  sandboxNotes = {} as Partial<DSASheetData>,
  mode,
  theme,
  fontSize,
  showLineNumbers
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState(false);

  // Helper to determine text content based on selected mode
  const getField = <K extends keyof DSASheetData>(key: K, fallback: string = ""): any => {
    if (mode === 'sandbox') {
      return sandboxNotes[key] || "";
    }
    return data[key] || fallback;
  };

  const getSubField = (
    parentKey: 'functionDefinition' | 'bruteForce' | 'reverseInformationFlow' | 'state' | 'stateCompression' | 'dataStructure' | 'finalComplexity', 
    childKey: string, 
    fallback: string = ""
  ): string => {
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

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const totalSlides = 6;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleCopyCode = () => {
    const code = getCodeSnippet().code;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Theme-specific CSS styles
  const themeStyles = {
    academic: {
      card: "bg-white text-gray-900 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      header: "bg-gray-100 border-b-2 border-gray-900 p-4",
      headerText: "text-gray-900 font-black",
      headerSubtext: "text-gray-500 font-mono",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-700",
      textMuted: "text-gray-500",
      accentText: "text-gray-900 font-bold underline decoration-gray-900",
      pill: "border border-gray-900 bg-white text-gray-900",
      highlight: "bg-gray-50 border border-gray-300 p-4 rounded-md font-sans text-gray-900",
      badge: "bg-gray-200 text-gray-900 font-semibold border border-gray-400",
      badgeSuccess: "bg-green-100 text-green-900 font-bold border border-green-300",
      badgeDanger: "bg-red-100 text-red-900 font-bold border border-red-300",
      dangerText: "text-red-700 font-bold",
      successText: "text-green-700 font-bold",
      dangerBlock: "bg-red-50/80 border border-red-200 text-gray-900 p-3.5 rounded-xl",
      successBlock: "bg-green-50/80 border border-green-200 text-gray-900 p-3.5 rounded-xl",
      sectionTitle: "font-display text-sm uppercase tracking-wider text-gray-900 font-black border-b border-gray-900 pb-1 mb-3",
      codeBg: "bg-gray-50 text-gray-900 border border-gray-300 font-mono",
      tableBg: "bg-white",
      tableHeaderBg: "bg-gray-100",
      tableHeaderTextColor: "text-gray-700",
      tableBorder: "border-gray-200",
      checklistBg: "bg-gray-50/50 border border-gray-200 p-2 rounded-lg",
      buttonActive: "bg-gray-900 text-white hover:bg-gray-800",
      buttonInactive: "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300",
      indicatorActive: "bg-gray-900",
      indicatorInactive: "bg-gray-200 hover:bg-gray-300",
      subBg: "bg-gray-50/50",
      subBorder: "border-gray-200",
      reversedBg: "bg-blue-50/50 border border-blue-200 text-blue-900 p-3 rounded-lg text-xs"
    },
    'tech-slate': {
      card: "bg-slate-900 text-slate-100 border border-slate-800 shadow-xl",
      header: "bg-slate-950 border-b border-slate-800 p-5",
      headerText: "text-white font-bold",
      headerSubtext: "text-slate-400",
      textPrimary: "text-slate-100",
      textSecondary: "text-slate-300",
      textMuted: "text-slate-400",
      accentText: "text-indigo-400 font-semibold",
      pill: "bg-indigo-950/40 border border-indigo-800/60 text-indigo-300",
      highlight: "bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-xl text-slate-100 font-sans",
      badge: "bg-indigo-600 text-white font-medium",
      badgeSuccess: "bg-emerald-950/40 text-emerald-300 border border-emerald-800/40",
      badgeDanger: "bg-rose-950/40 text-rose-300 border border-rose-800/40",
      dangerText: "text-rose-400 font-bold",
      successText: "text-emerald-400 font-bold",
      dangerBlock: "bg-rose-950/10 border border-rose-900/20 text-slate-100 p-3.5 rounded-xl",
      successBlock: "bg-emerald-950/10 border border-emerald-900/20 text-slate-100 p-3.5 rounded-xl",
      sectionTitle: "font-display text-sm uppercase tracking-wider text-indigo-400 font-bold border-b border-indigo-950 pb-1.5 mb-3",
      codeBg: "bg-slate-950 text-slate-100 border border-slate-800 font-mono",
      tableBg: "bg-slate-950/20",
      tableHeaderBg: "bg-slate-950",
      tableHeaderTextColor: "text-slate-400",
      tableBorder: "border-slate-800",
      checklistBg: "bg-slate-950/40 border border-slate-800/80 p-2 rounded-lg",
      buttonActive: "bg-indigo-600 text-white hover:bg-indigo-500",
      buttonInactive: "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700",
      indicatorActive: "bg-indigo-500",
      indicatorInactive: "bg-slate-800 hover:bg-slate-700",
      subBg: "bg-slate-950/60",
      subBorder: "border-slate-800",
      reversedBg: "bg-indigo-950/30 border border-indigo-900/30 text-indigo-200 p-3 rounded-lg text-xs"
    },
    blueprint: {
      card: "bg-[#0f253e] text-[#a5c3e6] border-2 border-[#1a3a5f] shadow-lg",
      header: "bg-[#1a3a5f] text-white p-5 border-b border-[#abc2de]/20",
      headerText: "text-white font-black",
      headerSubtext: "text-[#8cb9f1]",
      textPrimary: "text-[#abc2de]",
      textSecondary: "text-[#8cb9f1]",
      textMuted: "text-[#688db3]",
      accentText: "text-[#4b9eff] font-bold",
      pill: "bg-[#16365a] border border-[#2b5d95] text-[#86bafc]",
      highlight: "bg-[#0c1e33] border border-[#234c7a] p-4 rounded-lg text-[#abc2de] font-sans",
      badge: "bg-[#0052cc] text-white font-bold border border-[#abc2de]/30",
      badgeSuccess: "bg-[#0a2f1d] text-[#4ef0a5] border border-[#145a32]",
      badgeDanger: "bg-[#450a0a] text-[#f87171] border border-[#7f1d1d]",
      dangerText: "text-rose-400 font-bold",
      successText: "text-[#4ef0a5] font-bold",
      dangerBlock: "bg-[#450a0a]/20 border border-[#7f1d1d]/40 text-[#abc2de] p-3.5 rounded-xl",
      successBlock: "bg-[#0a2f1d]/20 border border-[#145a32]/40 text-[#abc2de] p-3.5 rounded-xl",
      sectionTitle: "font-mono text-sm uppercase tracking-widest text-[#4b9eff] font-extrabold border-b border-[#234c7a] pb-1 mb-3",
      codeBg: "bg-[#081524] text-[#a5c3e6] border border-[#1a3a5f] font-mono",
      tableBg: "bg-[#0c1e33]/50",
      tableHeaderBg: "bg-[#0c1e33]",
      tableHeaderTextColor: "text-[#8cb9f1]",
      tableBorder: "border-[#234c7a]",
      checklistBg: "bg-[#0c1e33] border border-[#234c7a] p-2 rounded-lg",
      buttonActive: "bg-[#0052cc] text-white hover:bg-[#0066ff]",
      buttonInactive: "bg-[#16365a] text-[#8cb9f1] hover:bg-[#204975]",
      indicatorActive: "bg-[#4b9eff]",
      indicatorInactive: "bg-[#16365a] hover:bg-[#204975]",
      subBg: "bg-[#0c1e33]",
      subBorder: "border-[#234c7a]",
      reversedBg: "bg-[#16365a] border border-[#2b5d95] text-[#86bafc] p-3 rounded-lg text-xs"
    },
    'geometric-balance': {
      card: "bg-white text-slate-900 border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
      header: "bg-white border-b-4 border-slate-900 p-5",
      headerText: "text-slate-900 font-black",
      headerSubtext: "text-slate-500 font-bold font-mono",
      textPrimary: "text-slate-900",
      textSecondary: "text-slate-700",
      textMuted: "text-slate-500",
      accentText: "text-blue-600 font-black",
      pill: "bg-blue-50 border-2 border-slate-900 text-slate-900 font-bold",
      highlight: "bg-amber-50 border-2 border-slate-900 p-4 rounded-none text-slate-900 font-sans",
      badge: "bg-slate-900 text-white font-bold border-2 border-slate-900",
      badgeSuccess: "bg-green-100 text-green-900 font-bold border-2 border-slate-900",
      badgeDanger: "bg-red-100 text-red-900 font-bold border-2 border-slate-900",
      dangerText: "text-red-600 font-black",
      successText: "text-green-600 font-black",
      dangerBlock: "bg-red-50 border-2 border-slate-900 text-slate-900 p-3.5 rounded-none",
      successBlock: "bg-green-50 border-2 border-slate-900 text-slate-900 p-3.5 rounded-none",
      sectionTitle: "font-mono text-xs uppercase tracking-widest text-slate-900 font-black border-b-2 border-slate-900 pb-1 mb-3",
      codeBg: "bg-slate-900 text-slate-100 border-4 border-slate-900 font-mono",
      tableBg: "bg-white",
      tableHeaderBg: "bg-slate-100 border-b-2 border-slate-900",
      tableHeaderTextColor: "text-slate-800 font-bold",
      tableBorder: "border-slate-900 border-2",
      checklistBg: "bg-white border-2 border-slate-900 p-2 rounded-none",
      buttonActive: "bg-blue-600 text-white hover:bg-blue-500 border-2 border-slate-900",
      buttonInactive: "bg-white text-slate-900 hover:bg-slate-100 border-2 border-slate-900",
      indicatorActive: "bg-blue-600",
      indicatorInactive: "bg-slate-200 hover:bg-slate-300 border border-slate-900",
      subBg: "bg-white border-2 border-slate-900",
      subBorder: "border-slate-900",
      reversedBg: "bg-blue-50 border-2 border-slate-900 text-slate-900 font-bold p-3 rounded-none text-xs"
    }
  }[theme];

  // Font size classes
  const fontSizes = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg"
  }[fontSize];

  // Render active slide content
  const renderSlideContent = () => {
    switch (currentSlide) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${
                  getField('difficulty') === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                  getField('difficulty') === 'Medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {getField('difficulty') || 'Medium'}
                </span>
                <span className={`text-xs ${themeStyles.textMuted} font-mono`}>STEP 1 & 2 OF DSA THINKING FRAMEWORK</span>
              </div>
              <p className={`text-sm ${themeStyles.textSecondary} mt-2 italic max-w-2xl leading-relaxed`}>
                {getField('problemDescription') || 'No description provided.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Step 1: Function Definition */}
              <div className="space-y-3">
                <h3 className={themeStyles.sectionTitle}>
                  1. Function Definition
                </h3>
                <div className="space-y-2">
                  <div className={`font-mono text-xs font-semibold ${themeStyles.subBg} ${themeStyles.subBorder} border p-2.5 rounded-lg ${themeStyles.textPrimary}`}>
                    <span className={themeStyles.accentText}>f</span>(input) = <span className={themeStyles.successText}>{getSubField('functionDefinition', 'signature') || 'Not defined'}</span>
                  </div>
                  <p className={`text-xs ${themeStyles.textSecondary} leading-relaxed`}>
                    {getSubField('functionDefinition', 'description') || 'Define what output is mathematically required for each input.'}
                  </p>
                </div>
              </div>

              {/* Step 2: Brute Force */}
              <div className="space-y-3">
                <h3 className={themeStyles.sectionTitle}>
                  2. Brute Force Approach
                </h3>
                <div className="space-y-3">
                  <p className={`text-xs ${themeStyles.textSecondary} leading-relaxed`}>
                    {getSubField('bruteForce', 'logic') || 'Describe how to solve the problem without efficiency constraints.'}
                  </p>
                  <div className="flex gap-4">
                    <div className={`${themeStyles.subBg} ${themeStyles.subBorder} border p-2 rounded-lg flex-1`}>
                      <span className={`block text-[9px] uppercase tracking-wider ${themeStyles.textMuted}`}>Brute Force Time</span>
                      <span className={`font-mono text-xs ${themeStyles.dangerText}`}>{getSubField('bruteForce', 'timeComplexity') || 'O(N²)'}</span>
                    </div>
                    <div className={`${themeStyles.subBg} ${themeStyles.subBorder} border p-2 rounded-lg flex-1`}>
                      <span className={`block text-[9px] uppercase tracking-wider ${themeStyles.textMuted}`}>Brute Force Space</span>
                      <span className={`font-mono text-xs ${themeStyles.dangerText}`}>{getSubField('bruteForce', 'spaceComplexity') || 'O(1)'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Master Formula Trace */}
            <div className={`mt-4 pt-4 border-t ${themeStyles.subBorder}`}>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${themeStyles.accentText} mb-2`}>
                <Cpu className="w-3.5 h-3.5" />
                Master Formula Flow Trace
              </span>
              <div className={`${themeStyles.codeBg} p-3.5 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed`}>
                {getField('masterFormulaTrace') || 'No formula trace generated.'}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <span className={`text-xs ${themeStyles.accentText} font-mono uppercase font-semibold`}>STEP 3 & 4: Bottlenecks & Insight</span>
              <h2 className={`text-base font-bold ${themeStyles.textPrimary} mt-1`}>Analyzing Repeated Work & Query Reversal</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 3: Find Repeated Work */}
              <div className="space-y-3">
                <h3 className={themeStyles.sectionTitle}>
                  3. Repeated Work
                </h3>
                {getRepeatedWork().length > 0 ? (
                  <ul className="space-y-2.5">
                    {getRepeatedWork().map((item, idx) => (
                      <li key={idx} className={`flex gap-2.5 items-start text-xs ${themeStyles.textPrimary} leading-normal`}>
                        <span className={`flex items-center justify-center ${themeStyles.badgeDanger} rounded-full h-4.5 w-4.5 text-[9px] font-bold shrink-0 mt-0.5`}>
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`text-xs ${themeStyles.textSecondary} italic`}>No explicit repeated work items specified.</p>
                )}
              </div>

              {/* Step 4: Reverse Information Flow */}
              <div className="space-y-4">
                <h3 className={themeStyles.sectionTitle}>
                  4. Reverse Information Flow
                </h3>
                <div className="space-y-3.5">
                  <div className={`${themeStyles.subBg} ${themeStyles.subBorder} border p-3 rounded-lg text-xs`}>
                    <span className={`block text-[9px] uppercase tracking-wider ${themeStyles.textMuted} font-bold mb-1`}>Traditional (Query ➔ Answer)</span>
                    <p className={`${themeStyles.textPrimary} leading-relaxed font-sans`}>{getSubField('reverseInformationFlow', 'traditionalQuery')}</p>
                  </div>
                  
                  <div className={themeStyles.reversedBg}>
                    <span className={`block text-[9px] uppercase tracking-wider ${themeStyles.accentText} font-bold mb-1`}>Reversed (Answer ➔ Query)</span>
                    <p className="leading-relaxed font-sans">{getSubField('reverseInformationFlow', 'reversedQuery')}</p>
                  </div>

                  <div className={themeStyles.highlight}>
                    <span className={`block text-[9px] uppercase tracking-wider ${themeStyles.accentText} font-black mb-1 flex items-center gap-1`}>
                      <Zap className={`w-3 h-3 ${themeStyles.accentText}`} /> Breakthrough Insight
                    </span>
                    <p className={`text-xs ${themeStyles.textPrimary} font-medium leading-relaxed font-sans`}>{getSubField('reverseInformationFlow', 'insight')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <span className={`text-xs ${themeStyles.accentText} font-mono uppercase font-semibold`}>STEP 5 & 6: Memory State & Compression</span>
              <h2 className={`text-base font-bold ${themeStyles.textPrimary} mt-1`}>State Identification & Compression</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 5: State Variables */}
              <div className="space-y-3">
                <h3 className={themeStyles.sectionTitle}>
                  5. State Identification
                </h3>
                <p className={`text-xs ${themeStyles.textSecondary} leading-relaxed mb-3`}>
                  {getSubField('state', 'description') || 'Describe what information must survive between index/element transitions.'}
                </p>

                {getSubField('state', 'stateVariables') && (getSubField('state', 'stateVariables') as any).length > 0 ? (
                  <div className={`overflow-hidden border ${themeStyles.subBorder} rounded-xl ${themeStyles.tableBg}`}>
                    <table className="w-full text-xs text-left">
                      <thead className={`${themeStyles.tableHeaderBg} text-[10px] uppercase tracking-wider ${themeStyles.tableHeaderTextColor} border-b ${themeStyles.subBorder}`}>
                        <tr>
                          <th className="px-3 py-2 font-semibold">Variable</th>
                          <th className="px-3 py-2 font-semibold">Purpose</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${themeStyles.tableBorder}`}>
                        {(getSubField('state', 'stateVariables') as any).map((v: any, idx: number) => (
                          <tr key={idx} className="hover:opacity-90">
                            <td className={`px-3 py-2 font-mono ${themeStyles.accentText} font-semibold`}>{v.name}</td>
                            <td className={`px-3 py-2 ${themeStyles.textPrimary}`}>{v.purpose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={`text-xs ${themeStyles.textSecondary} italic`}>No state variables registered.</p>
                )}
              </div>

              {/* Step 6: State Compression */}
              <div className="space-y-4">
                <h3 className={themeStyles.sectionTitle}>
                  6. State Compression
                </h3>
                <div className="space-y-3.5">
                  <div className={`${themeStyles.dangerBlock} text-xs`}>
                    <span className={`block text-[9px] uppercase tracking-wider ${themeStyles.dangerText} font-bold mb-1.5 flex items-center gap-1`}>
                      <AlertTriangle className="w-3 h-3" /> What to Remove (Dominated Candidates)
                    </span>
                    <p className={`${themeStyles.textPrimary} leading-relaxed font-sans`}>{getSubField('stateCompression', 'whatToRemove')}</p>
                  </div>
                  
                  <div className={`${themeStyles.successBlock} text-xs`}>
                    <span className={`block text-[9px] uppercase tracking-wider ${themeStyles.successText} font-bold mb-1.5 flex items-center gap-1`}>
                      <Check className="w-3.5 h-3.5" /> How State Compression is Achieved
                    </span>
                    <p className={`${themeStyles.textPrimary} leading-relaxed font-sans`}>{getSubField('stateCompression', 'howCompressed')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <span className={`text-xs ${themeStyles.accentText} font-mono uppercase font-semibold`}>STEP 7 & 8: Guarantees & Transitions</span>
              <h2 className={`text-base font-bold ${themeStyles.textPrimary} mt-1`}>Establishing the Invariant & Event Transitions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 7: Invariant */}
              <div className="space-y-3">
                <h3 className={themeStyles.sectionTitle}>
                  7. The Invariant
                </h3>
                <div className={`${themeStyles.subBg} ${themeStyles.subBorder} border p-4 rounded-xl space-y-2`}>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${themeStyles.pill} font-mono uppercase`}>Mathematical Guard</span>
                  <p className={`text-xs ${themeStyles.textPrimary} leading-relaxed font-medium`}>
                    {getField('invariant') || 'No core invariant defined.'}
                  </p>
                  <p className={`text-[11px] ${themeStyles.textSecondary} italic`}>
                    This property must hold true before and after each element is integrated.
                  </p>
                </div>
              </div>

              {/* Step 8: Identify Events */}
              <div className="space-y-3">
                <h3 className={themeStyles.sectionTitle}>
                  8. Event Transitions
                </h3>
                {getEvents().length > 0 ? (
                  <div className="space-y-3">
                    {getEvents().map((e, idx) => (
                      <div key={idx} className={`${themeStyles.subBg} ${themeStyles.subBorder} border rounded-xl p-3 text-xs flex flex-col gap-2`}>
                        <div className={`flex gap-2 items-center ${themeStyles.textPrimary}`}>
                          <span className={`${themeStyles.pill} font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase`}>Trigger {idx + 1}</span>
                          <span className="font-semibold">{e.trigger}</span>
                        </div>
                        <div className={`flex gap-2 items-start pl-2 border-l ${themeStyles.subBorder}`}>
                          <span className={`text-[9px] uppercase tracking-wider ${themeStyles.successText} shrink-0 mt-0.5`}>➔ Update State</span>
                          <span className={themeStyles.textPrimary}>{e.update}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-xs ${themeStyles.textSecondary} italic`}>No events registered.</p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <span className={`text-xs ${themeStyles.accentText} font-mono uppercase font-semibold`}>STEP 9 & METRICS: Data Structure & Checklist</span>
              <h2 className={`text-base font-bold ${themeStyles.textPrimary} mt-1`}>Data Structure Selection & 30s Fast Checklist</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 9: Data Structure Selection */}
              <div className="space-y-4">
                <h3 className={themeStyles.sectionTitle}>
                  9. Data Structure Choice
                </h3>
                <div className={`${themeStyles.subBg} ${themeStyles.subBorder} border rounded-xl p-4 space-y-3`}>
                  <div className="flex items-center gap-2">
                    <span className={`${themeStyles.badge} text-[10px] px-2 py-0.5 rounded font-mono uppercase`}>DS Selected</span>
                    <span className={`font-mono text-sm font-bold ${themeStyles.textPrimary}`}>{getSubField('dataStructure', 'selectedDS') || 'Not chosen'}</span>
                  </div>
                  <div>
                    <span className={`block text-[9px] uppercase tracking-wider ${themeStyles.textMuted} font-bold mb-1`}>Reason & Maintaining the Invariant</span>
                    <p className={`text-xs ${themeStyles.textSecondary} leading-relaxed`}>{getSubField('dataStructure', 'reason')}</p>
                  </div>
                </div>

                {/* Final Complexities */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className={`${themeStyles.subBg} ${themeStyles.subBorder} border p-3 rounded-xl`}>
                    <span className={`block text-[9px] uppercase tracking-wider ${themeStyles.accentText} font-bold`}>Optimal Time</span>
                    <span className={`font-mono text-sm font-bold ${themeStyles.successText}`}>{getSubField('finalComplexity', 'time') || 'O(N)'}</span>
                  </div>
                  <div className={`${themeStyles.subBg} ${themeStyles.subBorder} border p-3 rounded-xl`}>
                    <span className={`block text-[9px] uppercase tracking-wider ${themeStyles.accentText} font-bold`}>Optimal Space</span>
                    <span className={`font-mono text-sm font-bold ${themeStyles.accentText}`}>{getSubField('finalComplexity', 'space') || 'O(1)'}</span>
                  </div>
                </div>
              </div>

              {/* 30-Second Checklist Grid */}
              <div className="space-y-3">
                <h3 className={themeStyles.sectionTitle}>
                  30-Second Fast Checklist
                </h3>
                <div className="grid grid-cols-2 gap-2 text-[10px] leading-tight">
                  <div className={themeStyles.checklistBg}>
                    <strong className={`${themeStyles.textMuted} block mb-0.5 font-bold`}>1. Function:</strong>
                    <span className={themeStyles.textPrimary}>{getChecklistAnswer('function')}</span>
                  </div>
                  <div className={themeStyles.checklistBg}>
                    <strong className={`${themeStyles.textMuted} block mb-0.5 font-bold`}>2. Brute Force:</strong>
                    <span className={themeStyles.textPrimary}>{getChecklistAnswer('bruteForce')}</span>
                  </div>
                  <div className={themeStyles.checklistBg}>
                    <strong className={`${themeStyles.textMuted} block mb-0.5 font-bold`}>3. Repeated Work:</strong>
                    <span className={themeStyles.textPrimary}>{getChecklistAnswer('repeatedWork')}</span>
                  </div>
                  <div className={themeStyles.checklistBg}>
                    <strong className={`${themeStyles.textMuted} block mb-0.5 font-bold`}>4. Reversed Flow:</strong>
                    <span className={themeStyles.textPrimary}>{getChecklistAnswer('reversedFlow')}</span>
                  </div>
                  <div className={themeStyles.checklistBg}>
                    <strong className={`${themeStyles.textMuted} block mb-0.5 font-bold`}>5. State Variables:</strong>
                    <span className={themeStyles.textPrimary}>{getChecklistAnswer('state')}</span>
                  </div>
                  <div className={themeStyles.checklistBg}>
                    <strong className={`${themeStyles.textMuted} block mb-0.5 font-bold`}>6. Compression:</strong>
                    <span className={themeStyles.textPrimary}>{getChecklistAnswer('compressedState')}</span>
                  </div>
                  <div className={themeStyles.checklistBg}>
                    <strong className={`${themeStyles.textMuted} block mb-0.5 font-bold`}>7. Invariant:</strong>
                    <span className={themeStyles.textPrimary}>{getChecklistAnswer('invariant')}</span>
                  </div>
                  <div className={themeStyles.checklistBg}>
                    <strong className={`${themeStyles.textMuted} block mb-0.5 font-bold`}>8. Events Update:</strong>
                    <span className={themeStyles.textPrimary}>{getChecklistAnswer('events')}</span>
                  </div>
                  <div className={`${themeStyles.checklistBg} col-span-2`}>
                    <strong className={`${themeStyles.textMuted} block mb-0.5 font-bold`}>9. Data Structure choice & proof:</strong>
                    <span className={themeStyles.textPrimary}>{getChecklistAnswer('ds')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        const code = getCodeSnippet().code;
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className={`text-xs ${themeStyles.accentText} font-mono uppercase font-semibold`}>FINAL PHASE: Optimal Implementation</span>
                <h2 className={`text-base font-bold ${themeStyles.textPrimary} mt-1`}>TypeScript Code Solution</h2>
              </div>
              <button
                onClick={handleCopyCode}
                className={`flex items-center gap-1.5 ${themeStyles.buttonInactive} text-xs py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer`}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className={`${themeStyles.codeBg} p-4 rounded-xl text-xs overflow-x-auto max-h-[420px] leading-relaxed select-all`}>
                <code>
                  {code ? code : "// No code implementation generated yet."}
                </code>
              </pre>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full max-w-4xl p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 min-h-[500px] ${themeStyles.card} ${fontSizes}`}>
      
      {/* Slides Header */}
      <div className={`flex justify-between items-center pb-4 mb-4 border-b ${themeStyles.subBorder}`}>
        <div className="flex items-center gap-3">
          <span className={`p-2 rounded-lg bg-indigo-500/10 ${themeStyles.accentText} shrink-0`}>
            <LayoutGrid className="w-4 h-4" />
          </span>
          <div>
            <h1 className={`text-base font-black tracking-tight ${themeStyles.headerText} leading-tight`}>
              {getField('problemName') || "DSA Thinking Framework"}
            </h1>
            <p className={`text-[10px] ${themeStyles.headerSubtext}`}>
              Interactive Slide Mode — Slide {currentSlide + 1} of {totalSlides}
            </p>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-1.5">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                currentSlide === idx 
                  ? `w-5 ${themeStyles.indicatorActive}` 
                  : `w-2 ${themeStyles.indicatorInactive}`
              }`}
              title={`Jump to Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Main Slide Content Stage */}
      <div className="flex-1 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.18 }}
            className="min-h-[320px]"
          >
            {renderSlideContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation Controls Footer */}
      <div className={`flex justify-between items-center pt-4 mt-6 border-t ${themeStyles.subBorder} text-xs`}>
        <button
          onClick={prevSlide}
          className={`flex items-center gap-1 py-2 px-4 rounded-xl transition-all cursor-pointer ${themeStyles.buttonInactive}`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className={`text-xs font-mono ${themeStyles.textSecondary}`}>
          Slide {currentSlide + 1} / {totalSlides}
        </span>

        <button
          onClick={nextSlide}
          className={`flex items-center gap-1 py-2 px-4 rounded-xl transition-all cursor-pointer ${themeStyles.buttonActive}`}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
