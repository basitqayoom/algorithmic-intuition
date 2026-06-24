import { DSASheetData } from './types';

export const PRESET_SHEETS: DSASheetData[] = [
  {
    id: 'next-greater-element',
    problemName: 'Next Greater Element',
    difficulty: 'Medium',
    problemDescription: 'Given an array, find the next greater element for each element. The next greater element of an element x is the first larger element to its right. If it does not exist, return -1.',
    functionDefinition: {
      signature: 'f(nums) = [next_greater_i for i in 0..N-1]',
      description: 'For each index i, returns the value nums[j] where j is the smallest index > i such that nums[j] > nums[i], or -1 if no such j exists.'
    },
    bruteForce: {
      logic: 'For each element at index i, run a nested scan from j = i + 1 to N-1. Return the first element encountered that is strictly greater than nums[i].',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(1)'
    },
    repeatedWork: [
      'Repeated rightward scans: Every element initiates a brand new scan to the right.',
      'Redundant comparisons: We repeatedly compare against elements that have already been compared by prior elements.'
    ],
    reverseInformationFlow: {
      traditionalQuery: 'At index i, "Who is the next greater element to my right?"',
      reversedQuery: 'At index j, "Which previously unanswered elements am I larger than?"',
      insight: 'When a new larger element arrives, it resolves the queries of multiple elements waiting behind it. They can all be answered simultaneously by the arriving element.'
    },
    state: {
      description: 'The set of unanswered elements whose next greater element is yet to be found.',
      stateVariables: [
        { name: 'stack', purpose: 'Stores elements (or their indices) that are currently waiting for a larger element to resolve them.' }
      ]
    },
    stateCompression: {
      whatToRemove: 'Any element that is smaller than another element to its left can never resolve future queries before that larger element does. Smaller elements are "dominated" once a larger element is placed in the stack.',
      howCompressed: 'Maintain elements in strictly decreasing order. If the arriving element is larger than the top of the stack, the top element is resolved and popped. This leaves a monotonic descending stack containing only active candidates.'
    },
    invariant: 'The stack elements are always stored in strictly decreasing order (monotonic). Any element currently in the stack represents an active query that has not yet found a greater element to its right.',
    events: [
      {
        trigger: 'A new element x at index j arrives.',
        update: 'While stack is not empty and x > stack.top(): Pop stack.top() and set its next greater element to x. Then, push x onto the stack.'
      }
    ],
    dataStructure: {
      selectedDS: 'Monotonic Stack',
      reason: 'A Stack natively supports LIFO (Last-In, First-Out) operations. Since the most recently added unanswered element is the first one that could be resolved by a newly arriving element, a stack maintains the ordered active queries with O(1) transitions.'
    },
    finalComplexity: {
      time: 'O(N)',
      space: 'O(N)'
    },
    masterFormulaTrace: 'Problem: Next Greater Element -> Function: f(i)=next_greater -> Brute Force: Scan rightward -> Repeated Work: Overlapping scans -> Reverse Flow: x answers waiting queries -> State: Unresolved elements -> State Compression: Keep decreasing order only -> Invariant: Decreasing stack -> Events: x > top resolves queries -> DS: Stack -> Optimal O(N).',
    checklistAnswers: {
      function: 'f(i) = next greater element to the right of index i.',
      bruteForce: 'Nested loop scanning to the right for every index. O(N²).',
      repeatedWork: 'Scanning elements multiple times; comparing the same pairs repeatedly.',
      reversedFlow: 'Instead of element searching forward, new element looks backward to answer waiting ones.',
      state: 'Indices of elements waiting to find their next greater element.',
      compressedState: 'Keep stack monotonic decreasing; smaller waiting elements are popped once answered.',
      invariant: 'Stack is strictly decreasing: nums[stack[k]] > nums[stack[k+1]].',
      events: 'Arriving nums[i] is greater than nums[stack.top()] -> pop and resolve.',
      ds: 'Stack, because the most recent query is resolved first (LIFO).',
      complexity: 'Time: O(N) since each element is pushed/popped at most once. Space: O(N) for stack.'
    },
    codeSnippet: {
      language: 'typescript',
      code: `function nextGreaterElement(nums: number[]): number[] {
  const n = nums.length;
  const result: number[] = new Array(n).fill(-1);
  const stack: number[] = []; // stores indices

  for (let i = 0; i < n; i++) {
    // Event: larger element arrives, resolving the stack top
    while (stack.length > 0 && nums[i] > nums[stack[stack.length - 1]]) {
      const idx = stack.pop()!;
      result[idx] = nums[i]; // Resolved!
    }
    stack.push(i); // Invariant: stack remains monotonic decreasing
  }

  return result;
}`
    }
  },
  {
    id: 'min-window-substring',
    problemName: 'Minimum Window Substring',
    difficulty: 'Hard',
    problemDescription: 'Given two strings s and t, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string "".',
    functionDefinition: {
      signature: 'f(s, t) = min_len_window_str',
      description: 'Finds the shortest substring s[L..R] that contains all characters of t with at least their required frequencies.'
    },
    bruteForce: {
      logic: 'Generate all possible substrings s[i..j]. For each substring, check if it contains all characters of t with the required frequencies. Return the shortest valid substring.',
      timeComplexity: 'O(N³)',
      spaceComplexity: 'O(K) where K is the alphabet size'
    },
    repeatedWork: [
      'Recalculating character frequencies: Sliding the window index by 1 and re-scanning the entire substring to check validity.',
      'Scanning redundant invalid bounds: Expanding or contracting windows that are mathematically guaranteed to be sub-optimal.'
    ],
    reverseInformationFlow: {
      traditionalQuery: 'For every starting position L, check every ending position R: "Is this substring valid?"',
      reversedQuery: 'Given a valid window s[L..R], "Can we shrink L to make it smaller while maintaining validity?"',
      insight: 'We do not need to check all combinations. Expanding R introduces characters to satisfy the query, and shrinking L reduces the window to find the optimal boundary.'
    },
    state: {
      description: 'The counts of required characters from t and the counts of those characters in our current window s[L..R], alongside the number of unique characters fully satisfied.',
      stateVariables: [
        { name: 'requiredCounts', purpose: 'Frequency map of t.' },
        { name: 'windowCounts', purpose: 'Frequency map of active window s[L..R].' },
        { name: 'satisfiedCount', purpose: 'Number of unique characters that have achieved their required frequency in the window.' }
      ]
    },
    stateCompression: {
      whatToRemove: 'Any window that is larger than our current minimum window can be ignored once we seek smaller answers. We only need to store the global best boundaries `[bestL, bestR]`.',
      howCompressed: 'Instead of storing all valid windows, compress to just `minLen`, `startIdx`, and two moving pointers `L` and `R`.'
    },
    invariant: 'The window s[L..R] expands to the right to find validity, and shrinks from the left to optimize size. At any point, satisfiedCount tracks character completion accurately.',
    events: [
      {
        trigger: 'Pointer R moves right (absorbs s[R]).',
        update: 'Update windowCounts. If windowCounts[s[R]] === requiredCounts[s[R]], increment satisfiedCount.'
      },
      {
        trigger: 'satisfiedCount equals unique characters in t.',
        update: 'A valid window is found! Record if smaller than current best. Then, increment L (eject s[L]), decrement windowCounts[s[L]], and decrement satisfiedCount if it falls below required.'
      }
    ],
    dataStructure: {
      selectedDS: 'Two-Pointer sliding window + HashMap',
      reason: 'HashMap offers O(1) character frequency updates and checks. A Two-Pointer approach bounds our search space to exactly 2N state transitions.'
    },
    finalComplexity: {
      time: 'O(N + M) where N = len(s), M = len(t)',
      space: 'O(K) where K is the character alphabet size'
    },
    masterFormulaTrace: 'Problem: Min Window -> Function: f(s,t)=shortest_valid_sub -> Brute Force: Scan all sub-segments -> Repeated Work: Re-counting characters -> Reverse Flow: Can we shrink L from current valid window? -> State: Characters satisfied -> State Compression: Track minimum length indices only -> Invariant: Window boundaries -> Events: R moves right, L shrinks -> DS: HashMap + Pointers -> Optimal O(N+M).',
    checklistAnswers: {
      function: 'f(s, t) = shortest substring s[L..R] containing all chars of t.',
      bruteForce: 'Iterate all possible L and R, count characters in s[L..R] and compare to t. O(N³).',
      repeatedWork: 'Re-counting characters for overlapping substrings.',
      reversedFlow: 'Rather than starting scans afresh, transition the previous window state incrementally.',
      state: 'Character frequency maps of target t and current window, plus completion tally.',
      compressedState: 'Keep only the best window indices (best_L, best_len) and current active pointers L, R.',
      invariant: 'The window state reflects character counts in the current slice s[L..R] with O(1) updates.',
      events: 'R expands to achieve validity; L contracts to optimize validity.',
      ds: 'Two pointers (L, R) and a frequency Hash Map for O(1) checks.',
      complexity: 'Time: O(N + M) as each pointer moves at most N times. Space: O(K) where K is unique character set.'
    },
    codeSnippet: {
      language: 'typescript',
      code: `function minWindow(s: string, t: string): string {
  if (s.length === 0 || t.length === 0) return "";

  const dictT: { [key: string]: number } = {};
  for (const char of t) {
    dictT[char] = (dictT[char] || 0) + 1;
  }

  const required = Object.keys(dictT).length;
  let l = 0, r = 0;
  let formed = 0;
  const windowCounts: { [key: string]: number } = {};

  let ans = [-1, 0, 0]; // [length, L, R]

  while (r < s.length) {
    const char = s[r];
    windowCounts[char] = (windowCounts[char] || 0) + 1;

    if (dictT[char] !== undefined && windowCounts[char] === dictT[char]) {
      formed++;
    }

    // Try to contract the window
    while (l <= r && formed === required) {
      const currentLen = r - l + 1;
      if (ans[0] === -1 || currentLen < ans[0]) {
        ans = [currentLen, l, r];
      }

      const leftChar = s[l];
      windowCounts[leftChar]--;
      if (dictT[leftChar] !== undefined && windowCounts[leftChar] < dictT[leftChar]) {
        formed--;
      }
      l++;
    }
    r++;
  }

  return ans[0] === -1 ? "" : s.substring(ans[1], ans[2] + 1);
}`
    }
  },
  {
    id: 'two-sum',
    problemName: 'Two Sum',
    difficulty: 'Easy',
    problemDescription: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    functionDefinition: {
      signature: 'f(nums, target) = [index1, index2]',
      description: 'Finds two distinct indices i, j such that nums[i] + nums[j] === target.'
    },
    bruteForce: {
      logic: 'Check every pair of elements using nested loops. If nums[i] + nums[j] === target, return [i, j].',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(1)'
    },
    repeatedWork: [
      'Repeated linear scans: Searching for the complement of nums[i] over and over in the remaining array.'
    ],
    reverseInformationFlow: {
      traditionalQuery: 'For a given nums[i], search forward: "Is there any element equal to target - nums[i]?"',
      reversedQuery: 'At nums[i], look backward: "Have we already seen the complement (target - nums[i]) in the past?"',
      insight: 'Instead of scanning forward to solve the current element, past elements can answer the current element\'s query immediately if they were saved in a fast-lookup map.'
    },
    state: {
      description: 'The elements we have encountered so far, mapped to their indices.',
      stateVariables: [
        { name: 'seenMap', purpose: 'Maps a number value to its index in the array.' }
      ]
    },
    stateCompression: {
      whatToRemove: 'We only need to remember the value and index of previously visited elements. No other details are required.',
      howCompressed: 'Store entries in a hash map as single key-value pairs.'
    },
    invariant: 'At index i, `seenMap` contains all elements from nums[0...i-1]. If `target - nums[i]` exists in `seenMap`, the problem is solved.',
    events: [
      {
        trigger: 'We visit nums[i].',
        update: 'Check if target - nums[i] is in seenMap. If yes, return [seenMap[target - nums[i]], i]. If no, insert nums[i] -> i into seenMap.'
      }
    ],
    dataStructure: {
      selectedDS: 'Hash Map',
      reason: 'A Hash Map provides O(1) average time complexity for insertions and lookups, allowing us to find the complement instantly.'
    },
    finalComplexity: {
      time: 'O(N)',
      space: 'O(N)'
    },
    masterFormulaTrace: 'Problem: Two Sum -> Function: f(nums, target) -> Brute Force: Test all pairs -> Repeated Work: Looking for complement by scanning -> Reverse Flow: Can seen numbers answer the current complement query? -> State: Seen values and their indices -> State Compression: Keep map of visited values -> Invariant: Map contains nums[0..i-1] -> Events: Check map, insert current -> DS: Hash Map -> O(N) Time.',
    checklistAnswers: {
      function: 'f(nums, target) = [index1, index2] adding up to target.',
      bruteForce: 'Nested loops to examine every pair. O(N²).',
      repeatedWork: 'Linearly scanning to find target - nums[i].',
      reversedFlow: 'Check if current element solves a past element\'s need, or vice versa, via memory.',
      state: 'A dictionary of visited numbers and their indices.',
      compressedState: 'No redundancy. Only store the absolute minimum needed: value -> index.',
      invariant: 'At index i, the Hash Map contains all elements nums[j] for j < i.',
      events: 'Arrive at nums[i], calculate complement, check Hash Map, insert.',
      ds: 'Hash Map, as it supports O(1) average time complexity for search/insert.',
      complexity: 'Time: O(N) for a single pass. Space: O(N) for Hash Map storage.'
    },
    codeSnippet: {
      language: 'typescript',
      code: `function twoSum(nums: number[], target: number[]): number[] {
  const seen = new Map<number, number>(); // value -> index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i]; // Found!
    }
    seen.set(nums[i], i); // Maintain invariant
  }

  return [];
}`
    }
  },
  {
    id: 'daily-temperatures',
    problemName: 'Daily Temperatures',
    difficulty: 'Medium',
    problemDescription: 'Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the i-th day to get a warmer temperature. If there is no future day for which this is possible, keep answer[i] == 0 instead.',
    functionDefinition: {
      signature: 'f(temps) = [days_to_wait for i in 0..N-1]',
      description: 'Computes answer[i] = j - i where j is the smallest index > i such that temps[j] > temps[i], or 0.'
    },
    bruteForce: {
      logic: 'For each day i, run a nested scan forward through the array starting at i + 1 until we find a index j where temps[j] > temps[i]. Store the difference j - i.',
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(1)'
    },
    repeatedWork: [
      'Scanning cold streaks: Re-traversing days that are consistently cold, comparing them over and over.'
    ],
    reverseInformationFlow: {
      traditionalQuery: 'On day i, "When is the next warmer day?"',
      reversedQuery: 'On day j, "Is today warmer than any previous days that are still waiting?"',
      insight: 'A hot day can simultaneously answer the questions of many colder days that came before it.'
    },
    state: {
      description: 'Indices of days that have not yet experienced a warmer temperature.',
      stateVariables: [
        { name: 'stack', purpose: 'Stores indices of unanswered colder days.' }
      ]
    },
    stateCompression: {
      whatToRemove: 'If we visit day j, any day in the stack that is warmer than temps[j] cannot be answered by day j. But more importantly, days in the stack MUST be in decreasing order. We do not need to keep elements that are smaller than subsequent stack items.',
      howCompressed: 'Keep stack strictly decreasing. If a warm day arrives, pop and resolve all smaller indices.'
    },
    invariant: 'The stack stores indices of days with strictly decreasing temperatures. The top of the stack is always the coldest day in the stack.',
    events: [
      {
        trigger: 'Day j with temperature T arrives.',
        update: 'While stack is not empty and T > temps[stack.top()]: Pop idx = stack.pop() and set answer[idx] = j - idx. Then push j.'
      }
    ],
    dataStructure: {
      selectedDS: 'Monotonic Stack',
      reason: 'A stack operates in LIFO order. Since the most recent colder day is the easiest to satisfy, the LIFO nature of a stack matches this retrieval perfectly.'
    },
    finalComplexity: {
      time: 'O(N)',
      space: 'O(N)'
    },
    masterFormulaTrace: 'Problem: Daily Temperatures -> Function: f(temps) -> Brute Force: Scan forward O(N²) -> Repeated Work: Scanning long cold streaks -> Reverse Flow: Warm day resolves colder days -> State: Unanswered indices -> State Compression: Monotonic decreasing indices -> Invariant: Decreasing temps on stack -> Events: temps[j] > top pops and writes delta -> DS: Stack -> O(N) solution.',
    checklistAnswers: {
      function: 'f(i) = days to wait for a warmer temperature.',
      bruteForce: 'Double loop checking forward elements for each day. O(N²).',
      repeatedWork: 'Scanning the same elements multiple times during cold periods.',
      reversedFlow: 'Let a warm day answer the backlog of colder days.',
      state: 'Indices of days still waiting for a warmer temperature.',
      compressedState: 'Keep stack monotonic decreasing: only indices of colder days stay.',
      invariant: 'For any indices a, b in stack where a appears before b, temps[a] >= temps[b].',
      events: 'Arrive at day i, while temps[i] > temps[stack.top()], resolve and pop.',
      ds: 'Stack, to resolve the most recent cold days first (LIFO).',
      complexity: 'Time: O(N) because each index is pushed and popped at most once. Space: O(N) for stack.'
    },
    codeSnippet: {
      language: 'typescript',
      code: `function dailyTemperatures(temperatures: number[]): number[] {
  const n = temperatures.length;
  const ans: number[] = new Array(n).fill(0);
  const stack: number[] = []; // stores indices

  for (let i = 0; i < n; i++) {
    const currentTemp = temperatures[i];
    // Resolve all days in the stack colder than today
    while (stack.length > 0 && currentTemp > temperatures[stack[stack.length - 1]]) {
      const prevIndex = stack.pop()!;
      ans[prevIndex] = i - prevIndex; // Wait duration!
    }
    stack.push(i); // Maintain decreasing temperature invariant
  }

  return ans;
}`
    }
  }
];
