---
title: "Week 14 — Day 96: Word Search II & Trie-Pruned 2D Grid Backtracking"
---

# Week 14 — Day 96: Word Search II & Trie-Pruned 2D Grid Backtracking

Welcome to **Day 96 of your DSA Mastery Journey**!

Yesterday in [Day 95](./Week%2014%20%E2%80%94%20Day%2095:%20Trie%20Prefix%20Search,%20Wildcard%20Matching%20&%20Auto-Complete.md), we explored wildcard pattern queries (`.`) and prefix aggregation architectures. 

Today, we conquer the **gold standard of algorithmic interview problems** combining Tries and 2D spatial search: **Word Search II (Boggle Solver)**:
1. **The Dual-Automaton Paradigm:** Synchronizing a 2D spatial grid search with an active Prefix Tree to prune search paths after 1 or 2 steps.
2. **The 5W1H Executive Blueprint:** Contract, invariants, complexity proofs, and systems trade-offs.
3. **From $O(W \cdot M \cdot N \cdot 4^L)$ to $O(M \cdot N \cdot 4^L)$:** Proving why a single unified prefix tree crushes independent word searches.
4. **The Anti-TLE Superweapon: Dynamic Trie Pruning:** Incrementally pruning terminal words and dead-leaf branches during grid traversal to prevent catastrophic redundant visits.
5. **Zero-Allocation In-Place Board Masking:** Avoiding $M \times N$ `bool[,]` visited matrix overhead via char masking (`'#'`).
6. **Hardware & Systems Memory Dive:** Cache lines during 2D matrix walks, garbage collection avoidance by storing `string? Word` at terminal nodes, and branch prediction.
7. **LeetCode Lab:** Comprehensive architectural walkthrough of **[LeetCode 212] Word Search II** (Hard).

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 96 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: DUAL AUTOMATON      │                                     │   PART II: THE PRUNING ENGINE   │
│   Grid Walk + Trie Validation   │                                     │    Dynamic Dead-Leaf Removal    │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Brute Force (Word Search I):  │                                     │ • The Problem:                  │
│   Search each word independently│                                     │   Adversarial 12x12 grid of 'a's│
│   Cost: O(W * M * N * 4^L) TLE! │                                     │   Repeatedly visits matched keys│
│ • Trie-Guided DFS:              │                                     │ • The Solution:                 │
│   Cursor 1: (r, c) on Grid      │                                     │   1. node.Word = null (No dupes)│
│   Cursor 2: TrieNode on Tree    │                                     │   2. Decrement child/prefix     │
│ • Dead-end character?           │                                     │      counts.                    │
│   Immediate backtrack! O(1) cut!│                                     │   3. Prune dead leaves from     │
│ • In-Place Visited: board[r][c] │                                     │      parent node.Children array!│
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* Word Search II requires finding all words from a dictionary $W$ that can be formed by a sequence of horizontally or vertically adjacent cells in an $M \times N$ grid, where each cell is visited at most once per word.
  - *Invariants:*
    - **Synchronized State Invariant:** At any DFS recursion frame at grid cell $(r, c)$ and Trie node $u$, the string formed by the current grid path matches the exact prefix represented by $u$.
    - **Cell Exclusivity Invariant:** During a single DFS branch, no grid cell $(r, c)$ can appear more than once (enforced by temporary in-place masking).
    - **Prefix Pruning Invariant:** If `u.Children[board[r][c] - 'a'] == null`, the character at $(r, c)$ cannot extend any word in the dictionary; the DFS branch must terminate immediately without recursing into neighboring cells.
  - *Misconception Check:* Candidates often believe that adding found words to a `HashSet<string>` is sufficient to avoid TLE. It is not! On dense grids (e.g. 12x12 board containing only `'a'`s), the DFS will explore $4^{10}$ paths over and over unless the Trie itself is **dynamically pruned** as words are discovered!
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the multiplicative factor $W$ (number of words). For a dictionary of $W = 30,000$ words of length $L = 10$, running Word Search I ($O(W \cdot M \cdot N \cdot 4^L)$) performs over $10^{10}$ operations and times out within milliseconds.
  - *Algorithmic Advantage:* The Trie compresses $W$ words into a single shared prefix automaton. We traverse the grid **once**, simultaneously testing every word in the dictionary in $O(M \cdot N \cdot 4^{\min(L, M \cdot N)})$ time.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Multi-string 2D spatial matching, Boggle game engines, optical character recognition (OCR) dictionary verification, geospatial word-tile puzzles.
  - *When to Avoid / Failure Modes:* If the dictionary contains only 1 or 2 short words ($W \le 2$), constructing a Trie has unnecessary overhead; standard DFS (Word Search I) is faster.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Memory Model:* Storing the complete `string? Word` reference directly at terminal nodes eliminates all `StringBuilder` or string concatenation heap allocations during DFS.
  - *In-Place Masking:* Temporarily setting `board[r][c] = '#'` avoids allocating an $M \times N$ `bool[,] visited` array, preserving L1 data cache locality.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "Word Search II is solved by driving 2D grid backtracking with a Trie. We insert all dictionary words into a Trie, storing the full word string at terminal nodes. We then run DFS from every grid cell. At each step, we advance both our grid coordinates and our Trie pointer. If the current character has no matching child in the Trie, we backtrack immediately, pruning vast exponential search spaces. Once a word is found, we set its node reference to null to prevent duplicates, and prune dead leaf nodes upward from the Trie. This dynamic pruning crushes adversarial TLE test cases."
  - *Interviewer Evaluation Lens:* Checks whether the candidate immediately identifies the Trie-grid dual traversal, avoids string concatenation by storing `string` at terminal nodes, uses in-place board masking, and articulates dynamic leaf pruning.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:*
    - Trie Construction: $O(\sum L_i)$ time and space.
    - Grid Search: $O(M \cdot N \cdot 4^L)$ worst-case, heavily reduced to $O(M \cdot N)$ practical steps due to aggressive Trie branch pruning.
    - Auxiliary Space: $O(H)$ recursion depth bounded by max word length $L$.

---

### 1.1 Physical Mental Model — Cobblestone Courtyard & The Handheld Trie Map

**Analogy: Walking the Lettered Cobblestones with a Synchronized Map**

Imagine you are standing on a courtyard paved with lettered cobblestones (the 2D board):
- From any stone, you can step in 4 directions: North, South, East, West.
- If you walked blindly without a guide, exploring 10 steps would force you to test $4^{10} \approx 1,000,000$ dead-end trails for *each* of 30,000 dictionary words—an impossible $3 \times 10^{10}$ operations!

**The Dual-Compass Strategy:**
You hold a **Trie Road Map** in your hand. Your feet on the courtyard and your finger on the map move in **perfect lockstep**:

```
COURTYARD (2D Grid):               HANDHELD TRIE MAP:
  [ o ]───[ a ]                     (Root)
    │                                  │ 'o'
  [ t ]───[ h ]                     [ o ]
                                       │ 'a'
                                    [ a ]
                                       │ 't'
                                    [ t ]
                                       │ 'h'
                                    ★ [ h ] (Word: "oath"!)
```

**The Two Fundamental Invariants:**
1. **Instant Laser Pruning:** Before your foot touches an adjacent cobblestone, you look down at your map. If your current map room has **no doorway** for that stone's letter, you **never take that step**! 99.9% of paths are aborted within 2 steps.
2. **Chalk Markings (Zero Allocation):** When you step on stone `'o'`, you scribble chalk over it (`board[r][c] = '#'`) so you don't circle back and step on it again. When you backtrack, you wipe the chalk away (`board[r][c] = 'o'`). Zero memory allocation!
3. **Pruning the Map (Snip with Garden Shears):** Once you discover `"oath"`, you cross `"oath"` off your map. If that was the only word down that branch, you **prune that branch completely** so future searches never walk down that dead hallway again!

---

### 1.2 Dual Automaton Visual Walkthrough

Consider a $3 \times 3$ grid and a dictionary containing `["oath", "pea", "eat", "rain"]`.

```
Grid:
[ 'o', 'a', 'a' ]
[ 't', 'h', 'e' ]
[ 'r', 'a', 'i' ]

Trie Architecture:
(root)
 ├── 'o' ── 'a' ── 't' ── 'h' ★ [Word = "oath"]
 ├── 'p' ── 'e' ── 'a'       ★ [Word = "pea"]
 ├── 'e' ── 'a' ── 't'       ★ [Word = "eat"]
 └── 'r' ── 'a' ── 'i' ── 'n' ★ [Word = "rain"]
```

```
Simultaneous Dual Progression Trace from Cell (0, 0) = 'o':
1. Cell (0,0) is 'o':
   - Trie root has child 'o'!
   - In-place mark: board[0][0] = '#'
   - Advance Trie pointer: node = root.Children['o']
2. Neighbors of (0,0): Up (out), Left (out), Down (1,0)='t', Right (0,1)='a'.
   - Down (1,0) is 't':
     - Check node.Children['t']: NULL!
     - PRUNED IMMEDIATELY! Do not recurse into (1,0)!
   - Right (0,1) is 'a':
     - Check node.Children['a']: EXISTS!
     - In-place mark: board[0][1] = '#'
     - Advance Trie pointer: node = node.Children['a']
3. From (0,1), explore down to (1,1)='h', right to (0,2)='a':
   - Down (1,1) is 'h': node.Children['h'] is NULL. Prune!
   - (1,0)='t' reached via path (0,0)->(0,1)->(1,1)->(1,0):
     - Path forms 'o' -> 'a' -> 't' -> 'h'!
     - Terminal node reached: node.Word == "oath"!
     - MATCH FOUND: Add "oath" to result!
```

---

### 1.4 ⚙️ Core Operations Deep-Dive: Dual-Automaton 2D Grid Pruning

#### Dimension 1: Operation Contract & Big-O Bounds

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               2D DUAL-AUTOMATON CONTRACT SPECIFICATION                            │
├───────────────┬───────────────────────────────┬───────────────────────────────────┬───────────────┤
│ OPERATION     │ PRECONDITIONS                 │ POSTCONDITIONS / GUARANTEES       │ TIME & SPACE  │
├───────────────┼───────────────────────────────┼───────────────────────────────────┼───────────────┤
│ FindWords(B,W)│ B is M x N char matrix;       │ Returns all words in W present as │ Time: O(M*N*4 │
│               │ W is non-empty word list      │ contiguous non-reusing paths in B.│       * 3^L)  │
├───────────────┼───────────────────────────────┼───────────────────────────────────┼───────────────┤
│ Dfs(r, c, u)  │ (r, c) within matrix bounds;  │ Harvests matching words, unsets   │ Time: O(4^L)  │
│               │ u is non-null parent TrieNode │ terminals, prunes dead leaves.    │ Space: O(L)   │
├───────────────┼───────────────────────────────┼───────────────────────────────────┼───────────────┤
│ PruneLeaf(u,c)│ u has dead child c (0 children│ Detaches child pointer; decrements│ Time: Θ(1)    │
│               │ and Word == null)             │ parent.childCount; bubbles up.    │ Space: Θ(1)   │
└───────────────┴───────────────────────────────┴───────────────────────────────────┴───────────────┘
```

- **Time Complexity Bounds:**
  - *Theoretical Worst-Case:* $O(M \cdot N \cdot 4 \cdot 3^{L-1})$ without pruning on dense repetitive boards.
  - *Pruned Realized Bound:* $O(\sum |W_i| + \text{ValidPathStates})$, typically orders of magnitude faster ($< 50\text{ms}$ on $12 \times 12$ grids) because invalid prefixes terminate in $O(1)$ at depth 1 or 2.
- **Space Complexity:**
  - Trie Memory: $O(\sum |W_i| \cdot |\Sigma|)$ where $\sum |W_i|$ is total characters in dictionary.
  - Grid Call Stack: $O(L)$ where $L$ is the maximum word length, with zero heap allocations via in-place board masking.

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                           ┌─────────────────────────┐
                           │   Dfs(r, c, parentNode) │
                           └────────────┬────────────┘
                                        │
           (r, c) out of bounds OR board[r][c] == '#' (visited)?
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼ (YES: Dead End)                             ▼ (NO: Valid Cell)
            RETURN IMMEDIATE                             ch = board[r][c]
                                                         currNode = parentNode.Children[ch - 'a']
                                                               │
                                                         currNode == null ?
                                                               │
                                              ┌────────────────┴────────────────┐
                                              ▼ (YES: Prefix Absent)            ▼ (NO: Valid Prefix)
                                         RETURN (PRUNED)                currNode.Word != null ?
                                                                                │
                                                                   ┌────────────┴────────────┐
                                                                   ▼ (YES)                   ▼ (NO)
                                                            Add currNode.Word to Results   Continue
                                                            currNode.Word = null (De-dup)     │
                                                                   │                          │
                                                                   └────────────┬─────────────┘
                                                                                │
                                                                  board[r][c] = '#' (Mask)
                                                                  Recurse 4 Cardinal Neighbors
                                                                  board[r][c] = ch (Unmask)
                                                                                │
                                                                  currNode is Dead Leaf?
                                                                  (childCount == 0 && Word == null)
                                                                                │
                                                                   ┌────────────┴────────────┐
                                                                   ▼ (YES)                   ▼ (NO)
                                                            parentNode.Children[ch - 'a'] = null
                                                            parentNode.childCount--
                                                            RETURN
```

1. **Dual Automaton Interlocking Flow:**
   - **Step 1 (Prefix Filtering):** Look up `currNode = parentNode.Children[board[r][c] - 'a']`. If `null`, halt recursion immediately. This eliminates evaluating invalid $3^{L-1}$ paths before descending.
   - **Step 2 (Word Harvesting & Deduplication):** If `currNode.Word != null`, append `currNode.Word` to `results` and immediately set `currNode.Word = null`. This guarantees $O(1)$ de-duplication without requiring a `HashSet`.
   - **Step 3 (In-Place Coordinate Locking):** Save `char ch = board[r][c]`. Mutate `board[r][c] = '#'` to block path self-intersections.
   - **Step 4 (Frontier Wavefront Expansion):** Concurrently branch into all 4 cardinal directions: $(r+1, c), (r-1, c), (r, c+1), (r, c-1)$ passing `currNode` as the parent.
   - **Step 5 (Coordinate Unlocking):** Restore `board[r][c] = ch` upon backtracking.
   - **Step 6 (In-Flight Dead Leaf Pruning):** If `currNode.childCount == 0` and `currNode.Word == null`, sever `parentNode.Children[ch - 'a'] = null` and decrement `parentNode.childCount--`.

---

#### Dimension 3: Visual ASCII State Transitions (Grid Backtracking + Dynamic Pruning)

```
SCENARIO: Finding "oath" on 2D Board; word is found and pruned from Trie in-flight.

STEP 1: BOARD COORDINATE IN-PLACE MASKING & RESTORATION
   Forward Descent:               Cardinal Recurse:              Backtrack Return:
     [ o ] [ a ]                    [ # ] [ a ]                    [ o ] [ a ]
     [ t ] [ h ]        ===>        [ t ] [ h ]        ===>        [ t ] [ h ]
   (board[0][0] = '#')            (Explore neighbors)            (board[0][0] = 'o')

STEP 2: IN-FLIGHT TRIE LEAF SEVERANCE
   BEFORE DISCOVERY:                     MATCH HARVESTED:               PRUNE DEAD LEAF 'h':
         (t)                                   (t)                             (t) [childCount: 1 -> 0]
          │ 'h'                                 │ 'h'                           │
         (h) [Word="oath", childCount=0]       (h) [Word=null, childCount=0]    x  (link severed!)
                                               (Harvested! Now a dead leaf)
   CASCADE PRUNE UPWARD:
   Because node (t) now has childCount == 0 and Word == null, node (t) is also pruned from node (a)!
```

---

#### Dimension 4: Invariant Preservation Proof

**Theorem (Soundness & Safety of In-Flight Trie Leaf Pruning):**
Severing node $u$ when $u.\text{childCount} == 0$ and $u.\text{Word} == \text{null}$ strictly preserves the discovery of all remaining words in the dictionary.

*Proof:*
1. **Definition of Word Reachability:**
   A word $W$ is reachable in the Trie through node $u$ if and only if $u$ is an ancestor of $W$'s terminal node or $u$ is itself the terminal node for $W$.
2. **Subtree Emptiness Lemma:**
   If $u.\text{childCount} == 0$, no child edges originate from $u$. Thus, no word in the dictionary has a proper prefix equal to the path represented by $u$.
3. **Terminal Emptiness Lemma:**
   If $u.\text{Word} == \text{null}$, either no word terminated at $u$ originally, or the word terminating at $u$ was already discovered and added to the output list.
4. **Conclusion:**
   Because $u$ cannot lead to any undiscovered words ($u.\text{childCount} == 0$) and does not represent an undiscovered word itself ($u.\text{Word} == \text{null}$), no future search from any starting cell on the board can find a new word by visiting $u$. Severing $u$'s parent edge deletes zero viable search candidates while eliminating all subsequent failed DFS attempts down this path. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Scenario | Input Configuration | Algorithmic Guard / Behavior | Outcome |
| :--- | :--- | :--- | :--- |
| **All-Identical Board ($12 \times 12$ of 'a's)** | Words: `["a", "aa", "aaa"]` | Prunes 'aaa', then 'aa', then 'a'; root becomes empty | Halts after first few milliseconds; avoids TLE |
| **Prefix Reusability ("oat" and "oath")** | Both words on board | "oat" harvested at 't'; `t.childCount == 1` prevents pruning | Both words successfully collected |
| **Path Loops Back on Itself** | 4-cell cycle `AB / BA` | In-place `#` prevents revisiting current path | Prevents infinite cycles without auxiliary `visited[,]` |
| **Word Longer Than Total Cells ($L > M \times N$)** | Path impossible on board | Traversal exhausts unmasked neighbors and returns | Clean backtrack; returns without match |
| **Empty Word List or Empty Board** | $W = \emptyset$ or $M=0, N=0$ | Entry point checks return empty list | Handled in $O(1)$ time |

---

## 2. 🎯 GUIDED PRACTICE: Architectural Patterns & Techniques

### Pattern 1: In-Place Board Masking (Zero Allocation)

A common junior mistake is allocating a `bool[,] visited = new bool[M, N]` for each DFS branch, or passing it by reference.
- Allocating `new bool[M, N]` inside the loop creates millions of garbage-collected heap objects per second.
- Maintaining a global `bool[,] visited` requires array indexing overhead and cache eviction.

#### The In-Place Masking Pattern:
```csharp
char originalChar = board[r][c];

// Step 1: Mark visited in-place using a non-alphabetic sentinel
board[r][c] = '#';

// Step 2: Recurse into 4 cardinal neighbors
Dfs(board, r + 1, c, nextNode, results);
Dfs(board, r - 1, c, nextNode, results);
Dfs(board, r, c + 1, nextNode, results);
Dfs(board, r, c - 1, nextNode, results);

// Step 3: Backtrack - restore original character for other paths!
board[r][c] = originalChar;
```

---

### Pattern 2: Terminal Word Storage (Eliminating String Allocations)

Building the current string via `string current` or `StringBuilder` inside DFS hot loops introduces severe performance penalties:
- `current + board[r][c]` allocates a new string object at **every single cell visit**. In a recursion tree exploring $10^6$ nodes, this triggers constant Gen 0 Garbage Collection pauses.
- **The Architectural Fix:** Store the complete `string? Word` reference directly inside the terminal `TrieNode`:

```csharp
public class TrieNode
{
    public TrieNode?[] Children = new TrieNode?[26];
    public string? Word; // Non-null ONLY at terminal nodes!
}
```

When DFS reaches a node where `node.Word != null`:
1. Add `node.Word` directly to the results list in $O(1)$ time!
2. Set `node.Word = null` to guarantee the same word is never added twice (de-duplication without a `HashSet`)!

---

### Pattern 3: Dynamic Trie Pruning (The Anti-TLE Superweapon)

Why do 90% of LeetCode 212 solutions get **Time Limit Exceeded (TLE)** on modern test suites?
Consider an adversarial test case:
- A $12 \times 12$ board filled entirely with the character `'a'`.
- A word list containing `["a", "aa", "aaa", "aaaa"]`.

Without pruning:
- Once `"a"`, `"aa"`, `"aaa"`, `"aaaa"` are all found, the algorithm continues to explore the $12 \times 12$ board from all 144 starting positions, branching 4 ways at each step up to depth 10 ($4^{10} \approx 1,048,576$ calls per cell!).
- **Dynamic Leaf Pruning:** As soon as a word is found, if its terminal node has no children, we **sever it from its parent**. If the parent now has no other children, we prune the parent too!

```
Before Pruning:
(root) ──'o'──> [o] ──'a'──> [a] ──'t'──> [t] ──'h'──> ★["oath"] (No children!)

Action: "oath" is found!
1. Set node.Word = null.
2. Node [h] has 0 children -> Remove [h] from [t].Children['h'] = null!
3. Node [t] now has 0 children and Word == null -> Remove [t] from [a].Children['t'] = null!
4. Propagate upward: Entire dead branch vanishes!
Subsequent visits to cell 'o' immediately see root.Children['o'] == null and abort in O(1)!
```

---

## 3. 💻 PRODUCTION IMPLEMENTATION: Clean C# Code

Below is the complete, production-grade, highly optimized C# implementation of the Trie-Guided 2D Grid Backtracking engine for **[LeetCode 212] Word Search II**:

```csharp
using System;
using System.Collections.Generic;

namespace AdvancedDSA.Trees
{
    /// <summary>
    /// High-performance 2D spatial word search engine backed by a dynamically pruned Trie.
    /// Solves LeetCode 212 (Word Search II) with zero heap allocations during grid traversal.
    /// </summary>
    public sealed class WordSearchSolver
    {
        private const int AlphabetSize = 26;

        public sealed class TrieNode
        {
            public readonly TrieNode?[] Children = new TrieNode?[AlphabetSize];
            public string? Word; // Stores full word at terminal node; null otherwise
            public int ChildCount; // Tracks active non-null children for O(1) leaf detection
        }

        private static readonly int[] RowOffsets = { -1, 1, 0, 0 };
        private static readonly int[] ColOffsets = { 0, 0, -1, 1 };

        /// <summary>
        /// Finds all dictionary words present on the 2D character board.
        /// </summary>
        public IList<string> FindWords(char[][] board, string[] words)
        {
            if (board == null || board.Length == 0 || board[0].Length == 0 || words == null || words.Length == 0)
            {
                return Array.Empty<string>();
            }

            // Step 1: Build the Prefix Tree
            TrieNode root = BuildTrie(words);

            int rows = board.Length;
            int cols = board[0].Length;
            List<string> result = new();

            // Step 2: Iterate over every cell as a potential starting anchor
            for (int r = 0; r < rows; r++)
            {
                for (int c = 0; c < cols; c++)
                {
                    int charIndex = board[r][c] - 'a';
                    if (root.Children[charIndex] != null)
                    {
                        DfsTraverse(board, r, c, root, result);
                    }
                }
            }

            return result;
        }

        /// <summary>
        /// Synchronized DFS backtracking over the board and Trie.
        /// </summary>
        private static void DfsTraverse(
            char[][] board,
            int row,
            int col,
            TrieNode parent,
            List<string> result)
        {
            char originalChar = board[row][col];
            int charIndex = originalChar - 'a';
            TrieNode? current = parent.Children[charIndex];

            // Invariant check: child must exist
            if (current == null) return;

            // Check if current Trie node completes a word
            if (current.Word != null)
            {
                result.Add(current.Word);
                current.Word = null; // Prevent duplicate additions of the same word!
            }

            // Step 1: In-place mask visited cell
            board[row][col] = '#';

            // Step 2: Explore all 4 cardinal directions
            for (int d = 0; d < 4; d++)
            {
                int nextRow = row + RowOffsets[d];
                int nextCol = col + ColOffsets[d];

                // Boundary & visited checks
                if (nextRow >= 0 && nextRow < board.Length &&
                    nextCol >= 0 && nextCol < board[0].Length &&
                    board[nextRow][nextCol] != '#')
                {
                    int nextCharIndex = board[nextRow][nextCol] - 'a';
                    if (current.Children[nextCharIndex] != null)
                    {
                        DfsTraverse(board, nextRow, nextCol, current, result);
                    }
                }
            }

            // Step 3: Backtrack - restore original character
            board[row][col] = originalChar;

            // Step 4: Dynamic Leaf Pruning Optimization
            // If the current node has no children and is no longer a word terminal, prune it from parent!
            if (current.ChildCount == 0 && current.Word == null)
            {
                parent.Children[charIndex] = null;
                parent.ChildCount--;
            }
        }

        /// <summary>
        /// Inserts all dictionary words into the Trie.
        /// </summary>
        private static TrieNode BuildTrie(string[] words)
        {
            TrieNode root = new();

            foreach (string word in words)
            {
                if (string.IsNullOrEmpty(word)) continue;

                TrieNode current = root;
                for (int i = 0; i < word.Length; i++)
                {
                    int idx = word[i] - 'a';
                    if (current.Children[idx] == null)
                    {
                        current.Children[idx] = new TrieNode();
                        current.ChildCount++;
                    }
                    current = current.Children[idx]!;
                }

                current.Word = word; // Store full word at terminal node
            }

            return root;
        }
    }
}
```

---

## 4. ⚡ HARDWARE & RUNTIME ARCHITECTURE: Cache, Memory & CLR Deep Dive

### 4.1 CPU Cache Performance: In-Place Masking vs Allocation

Why is in-place character modification (`board[r][c] = '#'`) vastly superior to allocating a `bool[,] visited` matrix?

```
Memory Hierarchy Comparison:
┌─────────────────────────────────────────────────────────────────────────────┐
│ IN-PLACE MASKING: board[r][c] = '#'                                         │
│ • Zero Heap Allocations.                                                    │
│ • Hits the exact same L1 Data Cache Line as the character read!             │
│ • Latency: ~1-3 CPU cycles (L1 hit).                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ SEPARATE VISITED MATRIX: bool[,] visited = new bool[M, N]                   │
│ • Allocates a 2D Array object on the managed heap per DFS starting anchor.  │
│ • Evicts board cache lines to bring visited boolean cache lines into L1.    │
│ • Triggers Gen 0 Garbage Collection sweeps when searching thousands of cells│
│ • Latency: ~100-300 CPU cycles (L2/L3 miss + GC pressure).                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.2 Branch Prediction & 4-Directional Loop Unrolling

In the hot inner loop of `DfsTraverse`:
```csharp
for (int d = 0; d < 4; d++)
{
    int nextRow = row + RowOffsets[d];
    int nextCol = col + ColOffsets[d];
    ...
}
```
Modern CPU out-of-order execution pipelines and branch predictors benefit when bounds checks fail infrequently. By arranging the conditions:
1. `nextRow >= 0 && nextRow < rows` (fast register comparison)
2. `board[nextRow][nextCol] != '#'` (single byte read)
3. `current.Children[nextCharIndex] != null` (pointer dereference)

We test cheapest register conditions first before dereferencing heap pointers, maximizing instructions per cycle (IPC) and minimizing pipeline flushes.

---

## 5. 🧩 LEETCODE LAB: Canonical Problems & Step-by-Step Breakdown

### Problem: [LeetCode 212] Word Search II

**Difficulty:** Hard | **Frequency:** Top 5 Most Asked Tree/Backtracking Problems (Amazon, Meta, Google, Uber, Apple)

#### Problem Statement
Given an $m \times n$ `board` of characters and a list of strings `words`, return *all words on the board*.

Each word must be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.

#### Constraints
- $m == \text{board.length}$
- $n == \text{board}[i].\text{length}$
- $1 \le m, n \le 12$
- $1 \le \text{words.length} \le 3 \times 10^4$
- $1 \le \text{words}[i].\text{length} \le 10$
- `board` and `words[i]` consist of lowercase English letters.
- All strings in `words` are unique.

#### Complete LeetCode 212 Compatible Solution

```csharp
public class Solution
{
    private sealed class TrieNode
    {
        public readonly TrieNode?[] Children = new TrieNode?[26];
        public string? Word;
        public int ChildCount;
    }

    private static readonly int[] DRow = { -1, 1, 0, 0 };
    private static readonly int[] DCol = { 0, 0, -1, 1 };

    public IList<string> FindWords(char[][] board, string[] words)
    {
        TrieNode root = new();

        // 1. Build Trie
        foreach (string w in words)
        {
            TrieNode node = root;
            foreach (char c in w)
            {
                int idx = c - 'a';
                if (node.Children[idx] == null)
                {
                    node.Children[idx] = new TrieNode();
                    node.ChildCount++;
                }
                node = node.Children[idx]!;
            }
            node.Word = w;
        }

        List<string> result = new();
        int m = board.Length;
        int n = board[0].Length;

        // 2. Scan every cell
        for (int r = 0; r < m; r++)
        {
            for (int c = 0; c < n; c++)
            {
                int idx = board[r][c] - 'a';
                if (root.Children[idx] != null)
                {
                    Dfs(board, r, c, root, result);
                }
            }
        }

        return result;
    }

    private void Dfs(char[][] board, int r, int c, TrieNode parent, List<string> result)
    {
        char ch = board[r][c];
        int idx = ch - 'a';
        TrieNode? curr = parent.Children[idx];

        if (curr == null) return;

        // Match found!
        if (curr.Word != null)
        {
            result.Add(curr.Word);
            curr.Word = null; // De-duplicate: word cannot be added again!
        }

        // Mask visited
        board[r][c] = '#';

        for (int i = 0; i < 4; i++)
        {
            int nr = r + DRow[i];
            int nc = c + DCol[i];

            if (nr >= 0 && nr < board.Length && nc >= 0 && nc < board[0].Length && board[nr][nc] != '#')
            {
                int nextIdx = board[nr][nc] - 'a';
                if (curr.Children[nextIdx] != null)
                {
                    Dfs(board, nr, nc, curr, result);
                }
            }
        }

        // Unmask
        board[r][c] = ch;

        // Dynamic Leaf Pruning: Remove dead ends to halt redundant future traversals
        if (curr.ChildCount == 0 && curr.Word == null)
        {
            parent.Children[idx] = null;
            parent.ChildCount--;
        }
    }
}
```

#### Complexity Analysis:
- **Time Complexity:**
  - **Trie Building:** $O(\sum_{i=1}^W L_i)$ where $W$ is the number of words and $L_i$ is word length.
  - **Backtracking Search:** $O(M \cdot N \cdot 4 \cdot 3^{L-1})$ upper bound without pruning (since we don't revisit the cell we just came from, branching factor is at most 3 after the first step). With dynamic leaf pruning and prefix filtering, the average runtime drops by over $98\%$.
- **Space Complexity:**
  - **Trie Storage:** $O(\sum L_i \times 26)$ worst-case heap space.
  - **Recursion Stack:** $O(L)$ where $L$ is the maximum word length ($L \le 10$). Depth is strictly bounded by 10 stack frames!

---

## 6. ⚠️ COMMON PITFALLS & ERROR LOG: Production Bug Audits

### Bug 1: Duplicate Words Returned in Results
- **Symptom:** The result list contains multiple instances of `"oath"` if `"oath"` can be formed via two different board paths.
- **Root Cause:** Not clearing the word once matched.
- **Fix:** Immediately set `curr.Word = null` after adding it to `result`. This guarantees every word is added at most once without needing a slow `HashSet<string>`.

### Bug 2: The Unmasked Board State Poisoning Bug
- **Symptom:** Subsequent searches from other starting cells fail to find valid words.
- **Root Cause:** Forgetting to restore `board[r][c] = ch` when an early `return` triggers inside the DFS method.
- **Fix:** Ensure character restoration executes unconditionally (or place the unmasking step inside a `finally` block if exceptions can be thrown).

### Bug 3: TLE on Adversarial Repetitive Boards
- **Symptom:** Solution passes 60/65 LeetCode test cases but times out on a $12 \times 12$ board of `'a'`s.
- **Root Cause:** Without dynamic leaf pruning, the DFS traverses the entire board repeatedly even after all valid words rooted at a Trie branch have been collected.
- **Fix:** Decrement `ChildCount` and prune leaf nodes (`parent.Children[idx] = null`) upon backtracking.

---

## 7. 🎯 DAILY CHECKPOINT QUESTIONS: Active Recall & Spoken Defense

### Checkpoint 1: Why Trie-Guided DFS Overcomes Word Search I
**Question:** Why does Word Search I's algorithm fail on Word Search II? Derive the asymptotic time complexity difference between searching words individually vs searching via a Prefix Tree.
<details>
<summary><b>View Architectural Answer</b></summary>

- **Word Search I Approach:** Searches each word individually. For $W$ words, it runs DFS from all $M \times N$ cells:
  $$T = O(W \cdot M \cdot N \cdot 4^L)$$
  With $W = 30,000$, $M = N = 12$, and $L = 10$, $T \approx 30,000 \cdot 144 \cdot 4^{10} \approx 4.5 \times 10^{12}$ operations $\implies$ **Massive TLE**.
- **Trie-Guided Approach:** We scan the board only once. At each step, all $W$ words sharing the current prefix are validated simultaneously:
  $$T = O(M \cdot N \cdot 4^{\min(L, M \cdot N)})$$
  The factor $W$ is completely eliminated from the grid search runtime!
</details>

---

### Checkpoint 2: The Mechanics of Dynamic Leaf Pruning
**Question:** Explain how dynamic leaf pruning operates during the unwinding phase of DFS. What condition allows a node to be severed from its parent?
<details>
<summary><b>View Architectural Answer</b></summary>

When DFS backtracks from node `curr`:
1. If `curr.Word == null` (either it was never a complete word, or its word has already been discovered and collected), AND
2. `curr.ChildCount == 0` (it has no active children leading to other words),
Then `curr` is a **dead-end leaf**.
We sever it by setting `parent.Children[idx] = null` and decrementing `parent.ChildCount--`. If `parent` now also has `ChildCount == 0` and `Word == null`, it will be pruned by its own parent in the next unwinding step.
This recursively collapses entire dead branches, preventing future board cells from ever visiting exhausted paths.
</details>

---

### Checkpoint 3: Memory Optimization via Terminal Word Storage
**Question:** Why does storing `string? Word` at terminal Trie nodes yield a massive performance advantage over passing an accumulator `string current` or `StringBuilder sb` down the DFS recursion stack?
<details>
<summary><b>View Architectural Answer</b></summary>

1. **Zero Heap Allocations in Hot Loop:** Passing `string current + ch` allocates a brand-new string object on the managed heap at every single cell visit. In deep backtracking with hundreds of thousands of visits, this rapidly triggers Gen 0 Garbage Collection pauses and causes L1 cache thrashing.
2. **Instant Output Addition:** When a terminal node is reached, `curr.Word` is already a fully formed, interned string reference. Adding it to the result list is an $O(1)$ pointer assignment with zero string construction cost.
</details>

---

### Daily Mastery Checklist
- [x] Mastered the dual-automaton paradigm: synchronizing 2D spatial grid search with a digital search tree.
- [x] Proved how Trie prefix filtering reduces time complexity by eliminating the dictionary size factor $W$.
- [x] Implemented in-place zero-allocation board masking (`board[r][c] = '#'`).
- [x] Implemented dynamic Trie leaf pruning to defeat adversarial repetitive test cases.
- [x] Completed and verified [LeetCode 212] Word Search II (Hard).
