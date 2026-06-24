export interface FrameworkStep {
  title: string;
  number: number;
  description: string;
  content: string; // The filled-out text/formula
  placeholder?: string; // Guidance for writing
}

export interface StateTableEntry {
  problem: string;
  state: string;
}

export interface InvariantEntry {
  algorithm: string;
  invariant: string;
}

export interface EventEntry {
  problem: string;
  event: string;
}

export interface DataStructureSelection {
  state: string;
  invariant: string;
  ds: string;
}

export interface DSASheetData {
  id: string;
  problemName: string;
  problemDescription?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  functionDefinition: {
    signature: string;
    description: string;
  };
  bruteForce: {
    logic: string;
    timeComplexity: string;
    spaceComplexity: string;
  };
  repeatedWork: string[];
  reverseInformationFlow: {
    traditionalQuery: string;
    reversedQuery: string;
    insight: string;
  };
  state: {
    description: string;
    stateVariables: Array<{ name: string; purpose: string }>;
  };
  stateCompression: {
    whatToRemove: string;
    howCompressed: string;
  };
  invariant: string;
  events: Array<{ trigger: string; update: string }>;
  dataStructure: {
    selectedDS: string;
    reason: string;
  };
  finalComplexity: {
    time: string;
    space: string;
  };
  masterFormulaTrace: string; // Brief trace of how master formula flow applied
  checklistAnswers: {
    function: string;
    bruteForce: string;
    repeatedWork: string;
    reversedFlow: string;
    state: string;
    compressedState: string;
    invariant: string;
    events: string;
    ds: string;
    complexity: string;
  };
  codeSnippet?: {
    language: string;
    code: string;
  };
}
