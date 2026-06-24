# Algorithmic Intuition

## What is this app about?

**A framework for deriving algorithms from first principles.** Instead of memorizing solutions, this framework teaches you to:

1. **Define the problem** as a function
2. **Write brute force** solutions
3. **Identify repeated work** causing inefficiency
4. **Reverse information flow** to uncover hidden patterns
5. **Extract state** that must persist
6. **Compress state** to remove redundancy
7. **Find invariants** that guide the solution
8. **Recognize events** that trigger updates
9. **Choose data structures** that maintain these properties

This systematic approach transforms interview problems from "I've seen this before" into "I can derive this myself."

---

## The Master Formula

```
Problem
   ↓
Function Definition
   ↓
Brute Force Solution
   ↓
Repeated Work Analysis
   ↓
Reverse Information Flow
   ↓
State Identification
   ↓
State Compression
   ↓
Invariant Discovery
   ↓
Event Recognition
   ↓
Data Structure Selection
   ↓
Efficient Algorithm
```

---

## Installation & Setup

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```
2. Set your `GEMINI_API_KEY` in [.env.local](.env.local)
3. Run the app:
   ```
   npm run dev
   ```
