---
title: "Week 21 — Day 145: Advanced DAG Scheduling: Alien Dictionary & Multi-Constraint Topological Ordering"
---

# Week 21 — Day 145: Advanced DAG Scheduling: Alien Dictionary & Multi-Constraint Topological Ordering

Welcome to **Day 145 of your DSA Mastery Journey**!

Over the past two days, you mastered the mathematical invariants and production implementations of both BFS-based (Kahn's) and DFS-based (Reverse Post-Order) topological sorting. You explored how DAGs guarantee conflict-free serial execution orderings.

Today, we take these principles and apply them to one of the most intellectually demanding, high-frequency interview problems in graph theory: **[LeetCode 269] Alien Dictionary**.

In real-world data engineering, compilers, and linguistics engines, you are rarely handed clean adjacency lists like `edges = [[0, 1], [1, 2]]`. Instead, you are given raw, partially ordered observations—such as sorted lists of foreign words, version manifests, or log traces—and you must **infer the latent directed graph yourself**.

Today, you will learn:
1. How to derive directed precedence edges from lexicographical comparisons of adjacent strings.
2. The catastrophic **Prefix Collision Trap** (`"apple"` appearing before `"app"`), which violates the fundamental laws of dictionary sorting.
3. How to construct a complete, multi-constraint alphabet DAG and schedule it using Kahn's algorithm.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             DAY 145: ALIEN DICTIONARY & DAG INFERENCE                            │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│     LATENT GRAPH EXTRACTION       │                             │     THE TWO INVALIDITY TRAPS      │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Compare word[i] vs word[i+1].   │                             │ 1. PREFIX COLLISION:              │
│ • Find FIRST differing char:      │                             │    If word[i] starts with         │
│   word[i][k] != word[i+1][k].     │ ─── Precedence Rule ──────► │    word[i+1] but is LONGER:       │
│ • Deduped Directed Edge:          │                             │    ("apple" before "app")         │
│   word[i][k] ──► word[i+1][k]     │                             │    ==> IMPOSSIBLE DICTIONARY!     │
│ • Remaining chars give NO INFO!   │                             │ 2. DIRECTED CYCLE:                │
│   (break immediately after first).│                             │    a -> b and b -> a ==> CYCLE!   │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CANONICAL PROBLEM MASTERY           │
                          ├─────────────────────────────────────────────┤
                          │ • [LC 269] Alien Dictionary (Hard)          │
                          │ • From-Scratch: AlienDictionaryParser in C# │
                          │ • Automated Invariant Verification Suites   │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 👽 The Visual Mental Model: The Rosetta Stone Alien Dictionary

Before writing character maps or graph builders, picture an archaeologist deciphering an alien dictionary:

```
              👽 DECIPHERING AN ALIEN DICTIONARY LIKE A ROSETTA STONE

   You find a list of alien words sorted in their secret alphabetical order.
   How do you deduce the order of the alien letters?
   
   Rule of Lexicographical Dictionaries:
   You look at TWO ADJACENT WORDS and find the FIRST LETTER THAT DIFFERS:
   
   Word A:  [ w ]  [ r ]  [ t ]
   Word B:  [ w ]  [ r ]  [ f ]
              │      │      │
            Same   Same   DIFFERENT! ──► 't' appears before 'f'!
                                         Edge: [ t ] ──────► [ f ]
   
   ⚠️ CRITICAL RULE:
   Letters AFTER the first difference tell you NOTHING!
   In English, "c[a]t" comes before "c[u]p" because 'a' < 'u'. 
   The fact that 't' comes after 'p' is completely irrelevant!
   ===> STOP AND BREAK IMMEDIATELY AFTER THE FIRST DIFFERING LETTER!
```

---

### 1.2 🖼️ Visual Gallery: Word Alignment Matrix & The Prefix Violation

#### 1. Precedence Graph Extraction:

```
   Word List:                       Extracted Precedence Edges:
   0: "wrt"                         • Compare 0 & 1 ("wrt", "wrf"): 't' != 'f' ===> [t -> f]
   1: "wrf"                         • Compare 1 & 2 ("wrf", "er"):  'w' != 'e' ===> [w -> e]
   2: "er"                          • Compare 2 & 3 ("er", "ett"):  'r' != 't' ===> [r -> t]
   3: "ett"                         • Compare 3 & 4 ("ett", "rftt"):'e' != 'r' ===> [e -> r]
   4: "rftt"
   
   The Resulting Character DAG:
   [ w ] ──────► [ e ] ──────► [ r ] ──────► [ t ] ──────► [ f ]
   
   Topological Sort Wavefront:
   Output Alphabet: "wertf"!
```

#### 2. 🚨 The Fatal Prefix Violation:
What if the dictionary lists a longer word before its own prefix?

```
   Word A:  [ a ][ p ][ p ][ l ][ e ]  (Length = 5)
   Word B:  [ a ][ p ][ p ]            (Length = 3)
              ▲   ▲   ▲
              Matching prefix! But Word A is LONGER!
              
   Under every alphabetical system in the known universe, "app" MUST precede "apple"!
   If Word A is longer than Word B and Word B is a prefix of Word A:
   ===> 💥 THE DICTIONARY IS FRAUDULENT! IMMEDIATELY RETURN "" (INVALID)!
```

---

### 1.3 🏛️ Memory Layout: Bounded 26-Alphabet Precedence Containers

Because English lowercase letters are bounded to $[a-z]$ ($V \le 26$), we represent the entire graph in flat cache-friendly arrays:

```
   Index Map: 'a' -> 0, 'b' -> 1, ... 'z' -> 25
   
   inDegree Array (RAM):
   Index:      [ 0 ]    [ 4 ]    ...    [ 17 ]    [ 19 ]    [ 22 ]
   Char:       ('a')    ('e')           ('r')     ('t')     ('w')
   inDegree:   [ -1 ]   [ 1 ]           [ 1  ]    [ 1  ]    [ 0  ]
               (Unseen) (w->e)          (e->r)    (r->t)    (Source!)
   
   HashSet<int>[26] adj:
   adj[22] ('w'): { 4 ('e') }
   
   • -1 in inDegree indicates character never appeared in the input text!
   • Distinct HashSet eliminates false in-degree inflation from duplicate edges!
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Problem Definition:* Given a list of strings `words` sorted lexicographically by the rules of an unfamiliar alien language, derive the alphabetical ordering of all unique characters in the language.
  - *Edge Extraction Invariant:* In any lexicographically sorted list, given two adjacent words $W_A$ and $W_B$:
    - Let $k$ be the first index such that $W_A[k] \neq W_B[k]$.
    - Then $W_A[k]$ must precede $W_B[k]$ in the alphabet:
      $$W_A[k] \longrightarrow W_B[k]$$
    - **Crucial Rule:** Any characters at indices $j > k$ provide **zero** information about character precedence! Once the first difference is identified, you must immediately `break`.
  - *The Two Invalidity Conditions:*
    1. **The Prefix Violation:** If $W_B$ is a proper prefix of $W_A$ (e.g., $W_A = \text{"abc"}$ and $W_B = \text{"ab"}$), but $W_A$ appears before $W_B$, the dictionary is fundamentally invalid. Under standard lexicographical rules, a prefix must always come before a longer word.
    2. **Directed Cycle:** If the extracted precedence graph contains a cycle (e.g., $a \to b \to a$), no valid alphabet ordering exists.
  - *Isolated Vertices Invariant:* All unique characters appearing in any word must be included in the alphabet, even if they have an in-degree and out-degree of 0 (isolated nodes).
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Latent Graph Reconstruction:* Solves the problem of reverse-engineering hidden rules or priority constraints from observational data (e.g., inferring build dependencies from historical commit sequencing).
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Deductive reasoning over sorted sequences.
    - Deciphering custom collations and locale sorting rules in database engines.
  - *Failure Modes:*
    - Forgetting to register characters that have no edges (characters that only appear in single words or matching prefixes).
    - Comparing non-adjacent words: comparing all pairs $O(N^2)$ is redundant; comparing adjacent pairs $W_i$ and $W_{i+1}$ is both necessary and sufficient ($O(N \cdot L)$).
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Array Memory:* A fixed 26-element array `int[] inDegree` initialized with `-1` (to represent unseen characters) and a 26-element `HashSet<int>[] adj` to prevent duplicate parallel edges from inflating in-degrees.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To solve Alien Dictionary, I model the character precedence as a DAG. First, I identify all unique characters. Next, I compare adjacent words to find their first differing character, creating a directed edge from the earlier character to the later character, while immediately checking for the invalid prefix condition where a longer word precedes its own prefix. Finally, I run Kahn's algorithm using an in-degree array. If the number of processed characters equals the count of unique characters, I return the string; otherwise, a cycle exists, and I return an empty string. The time complexity is optimal at $O(C)$ where $C$ is the total number of characters across all words."
- **6. HOW (Complexity & Invariants):**
  - *Time Complexity:* $\Theta(C)$ where $C = \sum |W_i|$ (total length of all words), plus $O(V + E)$ where $V \le 26$ and $E \le 26^2$.
  - *Space Complexity:* $\Theta(1)$ auxiliary space since $|V| \le 26$ (bounded alphabet).

---

### 1.5 The Mathematics of Lexicographical Word Comparison

How does standard lexicographical sorting work?
Given two strings $S = s_1 s_2 \dots s_m$ and $T = t_1 t_2 \dots t_n$:

$S < T$ **if and only if**:
1. There exists some index $k \le \min(m, n)$ such that:
   $$s_1 = t_1, \quad s_2 = t_2, \quad \dots, \quad s_{k-1} = t_{k-1}, \quad \text{and} \quad s_k < t_k$$
2. **OR** $S$ is a proper prefix of $T$ ($m < n$ and $s_i = t_i$ for all $1 \le i \le m$).

#### The Prefix Collision Trap:
Consider the input:
```
words = [ "apple", "app" ]
```
- Length of `"apple"` is 5. Length of `"app"` is 3.
- For indices 0, 1, 2, both words have `"app"`.
- The first word runs out of characters in the second word, but the first word is longer.
- Under any valid lexicographical rule, `"app"` MUST come before `"apple"`.
- Because `"apple"` appears before `"app"`, **no alphabet ordering can ever make this dictionary valid!**
- The algorithm must immediately return `""`.

```
Prefix Collision Visualization:
  Word 0: a - p - p - l - e  (Length 5)
  Word 1: a - p - p          (Length 3)
          ▲   ▲   ▲
          All match, but Word 0 is longer! ==> INVALID!
```

---

### 1.2 Step-by-Step Graph Inference Trace

Consider the foreign word dictionary:
```
words = [ "wrt", "wrf", "er", "ett", "rftt" ]
```

#### Step 1: Discover All Unique Characters
Unique characters: `{ 'w', 'r', 't', 'f', 'e' }` (Total = 5).

#### Step 2: Compare Adjacent Word Pairs

1. Compare `"wrt"` and `"wrf"`:
   - Index 0: `'w' == 'w'`
   - Index 1: `'r' == 'r'`
   - Index 2: `'t' != 'f'` $\implies$ **Edge: `'t' -> 'f'`**. Break!

2. Compare `"wrf"` and `"er"`:
   - Index 0: `'w' != 'e'` $\implies$ **Edge: `'w' -> 'e'`**. Break!

3. Compare `"ett"` and `"rftt"`:
   - Index 0: `'e' != 'r'` $\implies$ **Edge: `'e' -> 'r'`**. Break!

4. Compare `"er"` and `"ett"`:
   - Index 0: `'e' == 'e'`
   - Index 1: `'r' != 't'` $\implies$ **Edge: `'r' -> 't'`**. Break!

#### Inferred Graph Edges:
- `t -> f`
- `w -> e`
- `r -> t`
- `e -> r`

```
Inferred DAG Architecture:
       [ w ] ──► [ e ] ──► [ r ] ──► [ t ] ──► [ f ]
```

#### Step 3: Kahn's Algorithm BFS Wavefront
- In-Degrees:
  - `w`: 0
  - `e`: 1 (from `w`)
  - `r`: 1 (from `e`)
  - `t`: 1 (from `r`)
  - `f`: 1 (from `t`)
- Initial Queue: `[ 'w' ]`
- Sequential Wavefront:
  1. Dequeue `'w'` $\implies$ `inDegree['e']` becomes 0 $\implies$ Enqueue `'e'`.
  2. Dequeue `'e'` $\implies$ `inDegree['r']` becomes 0 $\implies$ Enqueue `'r'`.
  3. Dequeue `'r'` $\implies$ `inDegree['t']` becomes 0 $\implies$ Enqueue `'t'`.
  4. Dequeue `'t'` $\implies$ `inDegree['f']` becomes 0 $\implies$ Enqueue `'f'`.
  5. Dequeue `'f'`.
- Result String: `"wertf"` (5 characters processed == 5 unique characters). Valid!

---

## 2. 💻 IMPLEMENT: Production C# Container

The following `AlienDictionaryParser` is written defensively with:
- Zero allocation for unused characters.
- Hash sets to prevent parallel duplicate edges from corrupting in-degrees.
- Immediate detection of the prefix trap.
- Full `Debug.Assert` validation tests.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;

namespace AdvancedDSA.GraphFundamentals
{
    /// <summary>
    /// Robust, production-grade parser to infer alphabet orderings from
    /// sorted lexicographical dictionaries (LeetCode 269).
    /// </summary>
    public sealed class AlienDictionaryParser
    {
        /// <summary>
        /// Infers the unique alphabet ordering from a sorted dictionary of alien words.
        /// </summary>
        /// <param name="words">The sorted array of words.</param>
        /// <returns>A string of characters in valid topological order, or "" if invalid or cyclic.</returns>
        public static string AlienOrder(string[] words)
        {
            if (words == null || words.Length == 0) return string.Empty;

            // 1. Initialize In-Degree table and Adjacency Sets for lowercase English letters
            // -1 indicates character does not appear in the dictionary
            int[] inDegree = new int[26];
            Array.Fill(inDegree, -1);

            HashSet<int>[] adj = new HashSet<int>[26];
            for (int i = 0; i < 26; i++)
            {
                adj[i] = new HashSet<int>();
            }

            // Register all unique characters
            int uniqueCharCount = 0;
            foreach (string word in words)
            {
                foreach (char c in word)
                {
                    int idx = c - 'a';
                    if (inDegree[idx] == -1)
                    {
                        inDegree[idx] = 0;
                        uniqueCharCount++;
                    }
                }
            }

            // 2. Build DAG by comparing adjacent words
            for (int i = 0; i < words.Length - 1; i++)
            {
                string w1 = words[i];
                string w2 = words[i + 1];

                // Check Prefix Collision Trap:
                // If w1 is strictly longer than w2 and w1 starts with w2, invalid!
                if (w1.Length > w2.Length && w1.StartsWith(w2))
                {
                    return string.Empty;
                }

                int minLen = Math.Min(w1.Length, w2.Length);
                for (int j = 0; j < minLen; j++)
                {
                    if (w1[j] != w2[j])
                    {
                        int u = w1[j] - 'a';
                        int v = w2[j] - 'a';

                        // Add directed edge u -> v (w1[j] precedes w2[j])
                        // HashSet.Add returns true only if the edge was not already present
                        if (adj[u].Add(v))
                        {
                            inDegree[v]++;
                        }

                        // Fundamental Rule: only the first differing character provides ordering info!
                        break;
                    }
                }
            }

            // 3. Seed Kahn's Queue with all 0-in-degree characters
            Queue<int> queue = new Queue<int>();
            for (int i = 0; i < 26; i++)
            {
                if (inDegree[i] == 0)
                {
                    queue.Enqueue(i);
                }
            }

            StringBuilder sb = new StringBuilder(uniqueCharCount);

            // 4. Process BFS Wavefront
            while (queue.Count > 0)
            {
                int u = queue.Dequeue();
                sb.Append((char)(u + 'a'));

                foreach (int v in adj[u])
                {
                    inDegree[v]--;
                    if (inDegree[v] == 0)
                    {
                        queue.Enqueue(v);
                    }
                }
            }

            // 5. Verification: If all unique characters were emitted, graph is a DAG
            if (sb.Length == uniqueCharCount)
            {
                return sb.ToString();
            }

            // Cycle detected (processed count < unique character count)
            return string.Empty;
        }

        /// <summary>
        /// Automated validation suite covering canonical cases and treacherous edge cases.
        /// </summary>
        public static void RunTests()
        {
            Console.WriteLine("Running AlienDictionaryParser Test Suite...");

            // Test 1: Canonical Valid Alien Dictionary
            string[] words1 = { "wrt", "wrf", "er", "ett", "rftt" };
            string result1 = AlienOrder(words1);
            Debug.Assert(result1 == "wertf", $"Test 1 Failed: Expected 'wertf', got '{result1}'");

            // Test 2: Two Words, Single Relation
            string[] words2 = { "z", "x" };
            string result2 = AlienOrder(words2);
            Debug.Assert(result2 == "zx", $"Test 2 Failed: Expected 'zx', got '{result2}'");

            // Test 3: Directed Cycle (Invalid Dictionary: z -> x and x -> z)
            string[] words3 = { "z", "x", "z" };
            string result3 = AlienOrder(words3);
            Debug.Assert(result3 == "", $"Test 3 Failed: Cycle must produce empty string, got '{result3}'");

            // Test 4: Prefix Trap ("apple" before "app" -> Impossible!)
            string[] words4 = { "apple", "app" };
            string result4 = AlienOrder(words4);
            Debug.Assert(result4 == "", $"Test 4 Failed: Prefix trap must return empty string, got '{result4}'");

            // Test 5: Single Word (Any order of its unique characters)
            string[] words5 = { "z" };
            string result5 = AlienOrder(words5);
            Debug.Assert(result5 == "z", $"Test 5 Failed: Expected 'z', got '{result5}'");

            // Test 6: Disconnected Characters with No Precedence Edges
            string[] words6 = { "zy", "zx" };
            string result6 = AlienOrder(words6);
            // y -> x, z has no edges. Both "zyx" and "yzx" are valid topological sorts.
            Debug.Assert(result6.Length == 3 && result6.Contains('z') && result6.IndexOf('y') < result6.IndexOf('x'),
                $"Test 6 Failed: Invariant y before x violated in '{result6}'");

            Console.WriteLine("All AlienDictionaryParser tests PASSED successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Systems & Complexity Analysis

### 3.1 Complexity Profile

| Phase | Time Complexity | Space Complexity | Architectural Justification |
| :--- | :--- | :--- | :--- |
| **Character Discovery** | $O(C)$ | $O(1)$ | Single pass over all strings; alphabet size $|\Sigma| \le 26$. |
| **Edge Inference** | $O(N \cdot L)$ | $O(|\Sigma|^2)$ | Compares $N - 1$ adjacent pairs up to length $L = \min(|W_i|, |W_{i+1}|)$. |
| **Kahn's Topological Sort** | $O(|\Sigma| + E)$ | $O(|\Sigma|)$ | At most 26 vertices and $26^2 = 676$ possible unique directed edges. |
| **Overall Asymptotic Bound** | $\mathbf{O(C)}$ | $\mathbf{O(1)}$ | Dominated by reading the total character count $C$; graph operations are bounded $O(1)$. |

---

## 4. 🧩 APPLY: Canonical Problem Walkthroughs

### 4.1 [LeetCode 269] Alien Dictionary (Hard) Walkthrough

#### Problem Statement
There is a new alien language that uses the English alphabet. However, the order of the letters is unknown to you. You are given a list of strings `words` from the alien language's dictionary. Now it is claimed that the strings in `words` are sorted lexicographically by the rules of this new language.

If the claim is incorrect, and the given arrangement cannot correspond to any order of letters, return `""`. Otherwise, return a string of the unique letters in the new alien language sorted in **lexicographically increasing order** by the new language's rules.

#### Critical Traps & Edge Cases:
1. **Parallel Duplicate Edges:**
   - If input has `"aba"` and `"abb"`, it generates `a -> b`.
   - If a later pair also generates `a -> b`, using a standard `List<int>[]` would increment `inDegree[b]` twice!
   - **Fix:** Use `HashSet<int>[]` to deduplicate edges and ensure `inDegree` accurately reflects the number of *distinct* predecessors.
2. **Valid Prefix Ordering:**
   - If `w1 = "app"` and `w2 = "apple"`, no difference is found in the first 3 characters.
   - Loop terminates without adding an edge. This is **valid** because `"app"` is shorter than `"apple"`.
   - Only `w1.Length > w2.Length` with a matching prefix is invalid!

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 269] Alien Dictionary (Hard):**
   - Solve using the complete prefix verification and in-degree BFS wavefront.

2. **[LeetCode 953] Verifying an Alien Dictionary (Easy):**
   - Inverted problem: Given a fixed alien alphabet order, verify if a list of words is sorted.

3. **Multi-Component Ambiguity Lab:**
   - What happens when multiple topological orderings exist (e.g. `{ "a", "b" }` where `a` and `b` have no edges)?
   - Verify that any permutation of independent characters satisfies the problem specification.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Inference & Scheduling Pipeline:

    Raw Sorted Sequences
             │
             ▼
┌───────────────────────────┐
│ 1. Prefix Collision Trap  │ ── Longer prefix appears before shorter? ──► Return "" (Invalid)
└───────────────────────────┘
             │ (Valid)
             ▼
┌───────────────────────────┐
│ 2. First Difference Edge  │ ── Find w1[k] != w2[k] ──► Add Edge: w1[k] -> w2[k]
└───────────────────────────┘
             │
             ▼
┌───────────────────────────┐
│ 3. Deduplicate via Sets   │ ── Ensure in-degree increments only on new edges
└───────────────────────────┘
             │
             ▼
┌───────────────────────────┐
│ 4. Kahn's In-Degree BFS   │ ── Cycles detected if processedCount < uniqueChars
└───────────────────────────┘
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
In the Alien Dictionary problem, what two conditions cause the alphabet ordering to be invalid?

### Architectural Model Answer
1. **Condition 1: The Prefix Collision Invalidation (Lexicographical Anomaly):**
   - Under standard lexicographical order, for any two words $W_1$ and $W_2$, if $W_1$ is a proper prefix of $W_2$, then $W_1$ must precede $W_2$ ($W_1 < W_2$).
   - For example, `"app"` must precede `"apple"`.
   - If the input dictionary contains a pair of adjacent words where $W_1$ appears *before* $W_2$, but $W_1$ starts with $W_2$ and $|W_1| > |W_2|$ (e.g. `["apple", "app"]`), then no possible ordering of alphabet characters can ever make `"apple"` precede `"app"`.
   - This represents an immediate mathematical contradiction that invalidates the dictionary.

2. **Condition 2: Directed Cycle in the Character Precedence Graph:**
   - Let each character represent a vertex in a directed precedence graph, with directed edge $u \to v$ indicating that character $u$ must appear before character $v$ in the alphabet.
   - If the set of inferred edges contains a directed cycle:
     $$c_0 \to c_1 \to c_2 \to \dots \to c_k \to c_0$$
   - This establishes the mutual contradiction:
     $$c_0 < c_1 < c_2 < \dots < c_k < c_0 \implies c_0 < c_0$$
   - Since a strict total order must be irreflexive ($x \not< x$), no linear sequence can satisfy cyclic prerequisites.
   - When running Kahn's algorithm, vertices involved in the cycle will never reach an in-degree of 0, resulting in $\text{processedCount} < \text{uniqueCharCount}$, signaling an invalid dictionary.
