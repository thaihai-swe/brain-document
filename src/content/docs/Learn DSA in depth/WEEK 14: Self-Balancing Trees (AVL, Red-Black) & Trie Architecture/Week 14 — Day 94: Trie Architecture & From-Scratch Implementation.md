---
title: "Week 14 — Day 94: Trie Architecture & From-Scratch Implementation"
---

# Week 14 — Day 94: Trie Architecture & From-Scratch Implementation

Welcome to **Day 94 of your DSA Mastery Journey**!

Yesterday in [Day 93](./Week%2014%20%E2%80%94%20Day%2093:%20Red-Black%20Tree%20Architecture%20&%20Systems%20Memory%20Layout.md), we mastered Red-Black Trees, exploring the 5 sacred invariants, the 2-3-4 B-Tree isomorphism, and the constant rotation guarantees that make them the backbone of production runtimes and operating systems.

Today, we transition from binary comparison trees to **digital search trees on strings**: the **Trie** (derived from re**trie**val, pronounced either "try" or "tree"):
1. **Digital Search Tree Architecture:** How character edges form prefixes, eliminating redundant prefix storage across string collections.
2. **The 5W1H Executive Blueprint:** Contract, invariants, performance limits, and systems trade-offs.
3. **Memory Layout Models:** Fixed `char[26]` array ($O(1)$ time, high memory) vs dynamic `Dictionary<char, TrieNode>` ($O(1)$ average, low memory for sparse alphabets).
4. **Core Operations:** Logarithmic string insertion, search, prefix validation (`StartsWith`), and branch-pruned deletion in $O(L)$ time.
5. **From-Scratch Production Implementation:** Building an industrial-strength generic `Trie` container in C# with prefix frequency counting and recursive branch cleanup.
6. **Hardware & Systems Memory Dive:** Cache locality, pointer indirection costs, 64-bit CLR object overhead, and why modern search engines compress tries into Radix Trees / DAFSA.
7. **LeetCode Lab:** Deep architectural walkthrough of **[LeetCode 208] Implement Trie (Prefix Tree)**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 94 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: TRIE ANATOMY        │                                     │    PART II: SYSTEMS TRADEOFFS   │
│   Digital Search Edge Model     │                                     │     Fixed Array vs Hash Map     │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Root node represents ""       │                                     │ • Fixed Array (TrieNode[26]):   │
│ • Edges represent characters    │                                     │   - Direct index: c - 'a'       │
│ • Terminal Flag: IsEnd / Count  │                                     │   - 208 bytes/node on 64-bit CLR│
│ • Prefix Sharing:               │                                     │ • Dynamic Dictionary:           │
│   "apple", "app", "apply"       │                                     │   - Compact for sparse alphabets│
│   share common path root->a->p->p│                                    │   - Boxing/Hashing overhead     │
│ • Worst-case Time: O(L) chars   │                                     │ • Radix / Patricia Compression: │
│   Independent of corpus size N! │                                     │   - Edge labels merge chains    │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* A **Trie** (Prefix Tree) is an $m$-ary digital search tree where:
    1. The root represents the empty string `""`.
    2. Each edge corresponds to an alphabet character.
    3. Nodes do not store their own character; their character identity is determined by their position in their parent's child table.
    4. A boolean flag `IsEnd` (or integer `WordCount`) marks whether the path from the root to the current node represents a valid complete word.
    5. An optional integer `PrefixCount` tracks how many inserted words pass through that node.
  - *Invariants:*
    - **Prefix Path Invariant:** Any string $S = c_0 c_1 \dots c_{L-1}$ stored in the Trie corresponds to a unique simple path of length $L$ starting from the root: $\text{root} \xrightarrow{c_0} u_1 \xrightarrow{c_1} u_2 \dots \xrightarrow{c_{L-1}} u_L$.
    - **Subtree Prefix Invariant:** The subtree rooted at node $u$ (reached via prefix $P$) contains all words in the corpus that share $P$ as their prefix.
  - *Misconception Check:* Candidates often assume nodes store characters. Storing characters inside `TrieNode` is redundant! The character is implicitly encoded by the transition pointer (e.g., `children[c - 'a'] != null`).
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the $O(N \cdot L)$ string comparison cost of linear scans and the $O(L)$ hash-collision / hash-computation cost of hash sets when searching for prefixes.
  - *Algorithmic Advantage:* Standard hash tables (`HashSet<string>`) cannot perform prefix lookups ("Find all words starting with `app`") without scanning all $N$ keys. A Trie finds prefixes in **strictly $O(L)$ time**, completely independent of the total dictionary size $N$!
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Autocomplete engines and typeahead suggestions.
    - Spellcheckers and dictionary validation.
    - Longest Prefix Matching (LPM) in network IP routing tables (CIDR prefix matching).
    - Genome sequencing (search over 4-letter DNA alphabet `A`, `C`, `G`, `T`).
    - Boggle / Word Search 2D grid backtracking (pruning invalid search paths in $O(1)$ steps).
  - *When to Avoid / Failure Modes:*
    - Arbitrary binary data or wide Unicode alphabets (65,536+ UTF-16 code units) where fixed array sizing leads to massive memory bloat ($>99\%$ null pointers).
    - Long, sparse strings with zero shared prefixes (e.g., UUIDs or cryptographic hashes). Here, each node holds only 1 child, wasting 200+ bytes per character without any prefix reuse! Use a Hash Set instead.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Memory Overhead:* On a 64-bit CLR (.NET), a node with `TrieNode[26]` consumes **248 bytes** (Object Header: 16B + MethodTable Pointer: 8B + Array Reference: 8B + Boolean/Counters: 8B + Array Object: 24B + 26 references $\times$ 8B = 208B).
  - *Production Systems:*
    - Linux kernel IP routing tables (`fib_trie.c`).
    - High-performance text indexing engines (Lucene, Elasticsearch finite state transducers).
    - Browser address bar and mobile virtual keyboard autocomplete.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "A Trie is a digital search tree where edges represent characters and nodes store a terminal flag indicating valid words. Its search, insertion, and prefix matching time is strictly bounded by the word length L—O(L)—completely independent of the dictionary size N. For fixed lowercase English alphabets, we implement it using a 26-element array for O(1) transitions. For wide or sparse alphabets, we use a hash map to conserve memory. Unlike a Hash Set, a Trie allows O(L) prefix verification, making it the optimal data structure for autocomplete, dictionary validation, and grid-pruned backtracking."
  - *Interviewer Evaluation Lens:* Checks whether the candidate understands the difference between prefix search vs exact match, articulates the $O(L)$ time complexity independent of $N$, and can justify the memory vs speed trade-off between `TrieNode[26]` and `Dictionary<char, TrieNode>`.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:*
    - `Insert(string word)`: $O(L)$ time, $O(L)$ new nodes worst-case.
    - `Search(string word)`: $O(L)$ time, $O(1)$ auxiliary space.
    - `StartsWith(string prefix)`: $O(L)$ time, $O(1)$ auxiliary space.
    - `Delete(string word)`: $O(L)$ time, $O(L)$ recursion stack, prunes unused nodes.

---

### 1.1 Trie Visual Anatomy & Prefix Path Tracing

Consider inserting four words into an empty Trie: `"app"`, `"apple"`, `"apply"`, `"bat"`.

```
                             [ Root ] (IsEnd=false, Count=4)
                            /        \
                    'a'    /          \ 'b'
                          ▼            ▼
                       [ a ]         [ b ]
                         │             │
                    'p'  │        'a'  │
                         ▼             ▼
                       [ p ]         [ a ]
                         │             │
                    'p'  │        't'  │
                         ▼             ▼
                 ★ [ p ] (IsEnd=true) ★ [ t ] (IsEnd=true)
                   (Word: "app")        (Word: "bat")
                    /         \
             'l'   /           \  (none)
                  ▼             ▼
                [ l ]
               /     \
         'e'  /       \  'y'
             ▼         ▼
     ★ [ e ]     ★ [ y ]
 (Word: "apple")  (Word: "apply")
```

#### Key Architectural Observations:
1. **Common Prefix Compression:** The prefix `"app"` is stored once in memory and shared by `"app"`, `"apple"`, and `"apply"`.
2. **Dual Terminal Nodes:** The node corresponding to `'p'` has `IsEnd = true` (representing `"app"`) and also acts as an internal branching point for `'l'` $\to$ `'e'` and `'l'` $\to$ `'y'`.
3. **Disjoint Subtrees:** Words starting with `'b'` diverge immediately at the root into an isolated branch.

---

### 1.2 Mathematical & Complexity Analysis

Let:
- $N$ = Total number of words stored in the Trie.
- $L$ = Length of the word/prefix being queried or inserted.
- $\Sigma$ = Alphabet size (e.g., $|\Sigma| = 26$ for lowercase English letters `a-z`, $|\Sigma| = 256$ for ASCII, $|\Sigma| = 65,536$ for Unicode BMP).

| Operation | Time Complexity | Auxiliary Space | Comparison with `HashSet<string>` |
| :--- | :--- | :--- | :--- |
| **`Insert(word)`** | $\Theta(L)$ | $O(L \cdot |\Sigma|)$ worst-case | Hash set is $O(L)$ to compute hash, then $O(1)$ bucket insert. |
| **`Search(word)`** | $O(L)$ | $O(1)$ | Hash set is $O(L)$ to hash and verify string equality. |
| **`StartsWith(prefix)`** | $O(L)$ | $O(1)$ | **Hash set cannot do this without an $O(N \cdot L)$ full scan!** |
| **`Delete(word)`** | $O(L)$ | $O(L)$ recursive stack | Hash set is $O(L)$ to hash and remove. |
| **Space Complexity** | $O(M \cdot |\Sigma|)$ | $M \le N \cdot L_{avg}$ | Hash set stores $N$ full string references ($O(N \cdot L_{avg})$). |

> [!IMPORTANT]
> **Trie Runtime Independence:** Notice that Trie lookups are $O(L)$ where $L$ is the length of the string, **not** $O(\log N)$ or $O(N)$. Whether your Trie contains 10 words or 10,000,000 words, looking up a 5-letter word takes at most **5 pointer dereferences**!

---

## 2. 🎯 GUIDED PRACTICE: Architectural Patterns & Techniques

### Pattern 1: Fixed Array (`TrieNode[26]`) vs Dynamic Map (`Dictionary<char, TrieNode>`)

Choosing the internal child representation is the primary architectural trade-off in Trie design:

```
┌──────────────────────────────────────┬──────────────────────────────────────┐
│       FIXED ARRAY: TrieNode[26]      │   DYNAMIC MAP: Dictionary<char, Node>│
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Access: O(1) direct array indexing │ • Access: O(1) amortized hash lookup │
│   int idx = c - 'a';                 │   node.Children.TryGetValue(c, out n)│
│ • Speed: Maximum (single CPU offset) │ • Speed: Slower (hash + equality check)│
│ • Memory: High constant footprint    │ • Memory: Proportional to active     │
│   (26 references per node, even for  │   children. Zero waste for leaves.   │
│   nodes with only 1 child).          │                                      │
│ • Alphabet: Restricted (e.g. [a-z])  │ • Alphabet: Universal (all Unicode)  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

#### Memory Calculation Example:
Suppose a Trie has 10,000 nodes representing lowercase English words.
- **Fixed Array Approach:** 10,000 nodes $\times 26$ references $\times 8$ bytes = **2.08 MB** just for child pointers, even if 90% are `null`.
- **Dynamic Map Approach:** If the average branching factor is 2 children per node: 10,000 nodes $\times 2$ entries $\approx$ **480 KB**.
- **Rule of Thumb:**
  - If alphabet $\le 26$ and performance is paramount $\implies$ **Fixed Array**.
  - If alphabet is large (Unicode, ASCII 128/256) or memory is constrained $\implies$ **Dynamic Dictionary**.

---

### Pattern 2: Multi-Count Extensions (`WordCount` and `PrefixCount`)

A standard Trie only stores a boolean `IsEnd`. However, production systems frequently require:
1. Handling duplicate word insertions.
2. Counting how many words in the dictionary begin with a given prefix in $O(L)$ time.

```csharp
public class TrieNode
{
    public TrieNode[] Children = new TrieNode[26];
    public int WordCount;   // Number of times this exact word was inserted
    public int PrefixCount; // Number of words that pass through this node
    public bool IsEnd => WordCount > 0;
}
```

- When **inserting** a word: Increment `PrefixCount++` on every node visited along the path, and increment `WordCount++` on the terminal node.
- When **deleting** a word: Decrement `PrefixCount--` on every node along the path. If `PrefixCount` becomes 0, the entire child subtree can be pruned immediately!
- `CountWordsStartingWith(prefix)`: Walk down the prefix path in $O(L)$ time and return `curr.PrefixCount`.

---

### Pattern 3: Clean Word Deletion with Recursive Branch Pruning

Deleting from a Trie requires more care than setting `IsEnd = false`. If a node becomes a "dead leaf" (it is not the end of any word and has no children), retaining it in memory causes a memory leak.

```
Deletion Scenario: Delete "apply" from {"app", "apple", "apply"}

Before Deletion:
'a' -> 'p' -> 'p' (IsEnd=true: "app")
               │
              'l'
             /   \
           'e'   'y' (IsEnd=true: "apply")

Step 1: Locate node 'y', clear its IsEnd flag.
Step 2: Check node 'y'. Has no children! Nullify reference: parent['y'] = null.
Step 3: Move up to parent 'l'. Does 'l' have other children? YES ('e' for "apple").
        STOP pruning! The ancestor branch must remain.
```

---

## 3. 💻 PRODUCTION IMPLEMENTATION: Clean C# Code

Below is the complete, production-ready, industrial-strength `Trie` implementation in C#. It features:
- $O(1)$ fast fixed-array indexing for lowercase English letters `[a-z]`.
- Both `WordCount` and `PrefixCount` tracking.
- $O(L)$ `Insert`, `Search`, `StartsWith`, and `CountWordsStartingWith`.
- Complete recursive $O(L)$ `Delete` with dead-branch memory pruning.
- Comprehensive defensive argument validation.

```csharp
using System;

namespace AdvancedDSA.Trees
{
    /// <summary>
    /// Represents a high-performance digital search tree (Trie / Prefix Tree)
    /// optimized for lowercase English characters ('a' through 'z').
    /// </summary>
    public sealed class Trie
    {
        private const int AlphabetSize = 26;

        /// <summary>
        /// Internal digital search tree node.
        /// </summary>
        public sealed class TrieNode
        {
            public readonly TrieNode?[] Children = new TrieNode?[AlphabetSize];
            
            /// <summary>
            /// Number of times the exact word ending at this node was inserted.
            /// </summary>
            public int WordCount { get; set; }

            /// <summary>
            /// Number of active words passing through this node.
            /// </summary>
            public int PrefixCount { get; set; }

            /// <summary>
            /// True if at least one inserted word terminates at this node.
            /// </summary>
            public bool IsEnd => WordCount > 0;

            /// <summary>
            /// Returns true if this node has zero non-null child edges.
            /// </summary>
            public bool HasChildren
            {
                get
                {
                    for (int i = 0; i < AlphabetSize; i++)
                    {
                        if (Children[i] != null) return true;
                    }
                    return false;
                }
            }
        }

        private readonly TrieNode _root;

        /// <summary>
        /// Total number of unique words stored in the Trie.
        /// </summary>
        public int TotalWords { get; private set; }

        public Trie()
        {
            _root = new TrieNode();
            TotalWords = 0;
        }

        /// <summary>
        /// Inserts a word into the Trie.
        /// Time: O(L), Space: O(L) where L is the length of the word.
        /// </summary>
        /// <param name="word">String containing only lowercase English letters.</param>
        public void Insert(string word)
        {
            ValidateString(word, nameof(word));

            TrieNode current = _root;
            current.PrefixCount++;

            for (int i = 0; i < word.Length; i++)
            {
                int index = word[i] - 'a';
                if (current.Children[index] == null)
                {
                    current.Children[index] = new TrieNode();
                }

                current = current.Children[index]!;
                current.PrefixCount++;
            }

            if (current.WordCount == 0)
            {
                TotalWords++;
            }
            current.WordCount++;
        }

        /// <summary>
        /// Returns true if the exact word is present in the Trie.
        /// Time: O(L), Space: O(1).
        /// </summary>
        public bool Search(string word)
        {
            ValidateString(word, nameof(word));

            TrieNode? node = FindNode(word);
            return node != null && node.IsEnd;
        }

        /// <summary>
        /// Returns true if there is any word in the Trie that starts with the given prefix.
        /// Time: O(L), Space: O(1).
        /// </summary>
        public bool StartsWith(string prefix)
        {
            ValidateString(prefix, nameof(prefix));

            TrieNode? node = FindNode(prefix);
            return node != null;
        }

        /// <summary>
        /// Returns the number of words in the Trie that have the specified prefix.
        /// Time: O(L), Space: O(1).
        /// </summary>
        public int CountWordsStartingWith(string prefix)
        {
            ValidateString(prefix, nameof(prefix));

            TrieNode? node = FindNode(prefix);
            return node?.PrefixCount ?? 0;
        }

        /// <summary>
        /// Deletes one occurrence of the word from the Trie and prunes unused child nodes.
        /// Time: O(L), Space: O(L) recursion stack.
        /// </summary>
        /// <returns>True if the word was found and deleted; false otherwise.</returns>
        public bool Delete(string word)
        {
            ValidateString(word, nameof(word));

            if (!Search(word))
            {
                return false;
            }

            bool deleted = DeleteHelper(_root, word, depth: 0);
            if (deleted)
            {
                _root.PrefixCount--;
                TotalWords--;
            }
            return deleted;
        }

        private bool DeleteHelper(TrieNode current, string word, int depth)
        {
            if (depth == word.Length)
            {
                // Word terminal node reached
                current.WordCount--;
                current.PrefixCount--;
                return true;
            }

            int index = word[depth] - 'a';
            TrieNode? child = current.Children[index];
            if (child == null) return false;

            bool success = DeleteHelper(child, word, depth + 1);
            if (success)
            {
                current.PrefixCount--;

                // Dead-branch pruning:
                // If child no longer terminates any word and has no remaining children, delete it!
                if (!child.IsEnd && !child.HasChildren)
                {
                    current.Children[index] = null;
                }
            }

            return success;
        }

        /// <summary>
        /// Traverses down the tree matching characters sequentially.
        /// Returns the ending TrieNode, or null if the path does not exist.
        /// </summary>
        private TrieNode? FindNode(string sequence)
        {
            TrieNode current = _root;
            for (int i = 0; i < sequence.Length; i++)
            {
                int index = sequence[i] - 'a';
                TrieNode? next = current.Children[index];
                if (next == null)
                {
                    return null;
                }
                current = next;
            }
            return current;
        }

        private static void ValidateString(string input, string paramName)
        {
            if (input == null) throw new ArgumentNullException(paramName);

            for (int i = 0; i < input.Length; i++)
            {
                char c = input[i];
                if (c < 'a' || c > 'z')
                {
                    throw new ArgumentException(
                        $"Character '{c}' at index {i} is invalid. Trie only supports lowercase letters 'a'-'z'.",
                        paramName);
                }
            }
        }
    }
}
```

---

## 4. ⚡ HARDWARE & RUNTIME ARCHITECTURE: Cache, Memory & CLR Deep Dive

### 4.1 The Memory Anatomy of a TrieNode on 64-bit .NET CLR

When analyzing standard algorithmic literature, a Trie is often presented as having $O(M)$ memory. In systems programming, however, the **constant factors are immense**:

```
.NET 64-bit Object Memory Layout for a Single TrieNode:
┌────────────────────────────────────────────────────────┐
│ Object Header (SyncBlock Index)              : 8 bytes │
│ MethodTable Pointer (Type metadata)          : 8 bytes │
│ Child Array Reference (Children field)       : 8 bytes │
│ WordCount (Int32)                            : 4 bytes │
│ PrefixCount (Int32)                          : 4 bytes │
├────────────────────────────────────────────────────────┤
│ TOTAL Node Object Overhead                   : 32 bytes│
└────────────────────────────────────────────────────────┘
                    │
                    ▼ References separate Array Object on Heap:
┌────────────────────────────────────────────────────────┐
│ Array Object Header                          : 8 bytes │
│ Array MethodTable Pointer                    : 8 bytes │
│ Array Length Field                           : 8 bytes │
│ 26 Child Object Pointers (26 * 8 bytes)      : 208 bytes│
├────────────────────────────────────────────────────────┤
│ TOTAL Array Object Overhead                  : 232 bytes│
└────────────────────────────────────────────────────────┘
COMBINED MEMORY PER TRIE NODE = 32 + 232 = 264 BYTES!
```

> [!WARNING]
> **Pointer Chasing & Cache Misses:**
> Walking down a Trie to search a word of length $L$ requires dereferencing $L$ distinct heap objects. Because each `TrieNode` is allocated dynamically on the heap, adjacent nodes along a branch are rarely placed in contiguous memory. Every character transition triggers an **L1/L2 cache miss**, forcing the CPU memory controller to fetch a 64-byte cache line from RAM!

### 4.2 Compact Alternatives: Radix Tree & Double-Array Trie

To overcome this cache and memory penalty in production engines, systems engineers use two advanced compressed variants:

```
Standard Trie vs Radix Tree (Patricia Trie):
============================================
Standard Trie (1 character per node):
(root) ──'t'──> (n1) ──'e'──> (n2) ──'s'──> (n3) ──'t'──> [End: "test"]
4 Heap Objects, 4 Pointer Dereferences!

Radix Tree (Compressed single-child chains):
(root) ─────────"test"─────────> [End: "test"]
1 Heap Object, 1 Pointer Dereference!
```

1. **Radix Tree (Patricia Tree):** Compresses non-branching paths (nodes with only 1 child) into a single edge containing a string segment. Reduces node count by up to 70%! Used in the **Linux kernel** for memory page table management and routing tables.
2. **Double-Array Trie (DAT):** Compresses the entire Trie into two parallel integer arrays: `BASE` and `CHECK`. Eliminates all pointer objects, providing blazing fast $O(1)$ transitions directly inside CPU L1/L3 caches. Used in high-speed morphological analyzers and Japanese/Chinese NLP tokenizers.

---

## 5. 🧩 LEETCODE LAB: Canonical Problems & Step-by-Step Breakdown

### Problem: [LeetCode 208] Implement Trie (Prefix Tree)

**Difficulty:** Medium | **Frequency:** Extremely High (Google, Amazon, Meta, Microsoft, Apple)

#### Problem Statement
A trie (pronounced as "try") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. There are various applications of this data structure, such as autocomplete and spellchecker.

Implement the `Trie` class:
- `Trie()` Initializes the trie object.
- `void Insert(string word)` Inserts the string `word` into the trie.
- `bool Search(string word)` Returns `true` if the string `word` is in the trie (i.e., was inserted before), and `false` otherwise.
- `bool StartsWith(string prefix)` Returns `true` if there is a previously inserted string `word` that has the prefix `prefix`, and `false` otherwise.

#### Visual Walkthrough: Executing Commands Sequentially
```
Operations:
1. Trie trie = new Trie();
2. trie.Insert("apple");
3. trie.Search("apple");   // -> true
4. trie.Search("app");     // -> false (node exists, but IsEnd is false!)
5. trie.StartsWith("app"); // -> true  (node exists!)
6. trie.Insert("app");
7. trie.Search("app");     // -> true  (IsEnd now set to true!)
```

```
Step 2: After Insert("apple")
root -> 'a' -> 'p' -> 'p' -> 'l' -> 'e' (IsEnd = true)
                      ▲
                      │
Step 4: Search("app") ends here. node != null, but node.IsEnd == false! => return false.
Step 5: StartsWith("app") ends here. node != null! => return true.
```

#### Production C# Solution (LeetCode 208 Compatible)

```csharp
public class Trie
{
    private sealed class Node
    {
        public readonly Node[] Children = new Node[26];
        public bool IsEnd;
    }

    private readonly Node _root;

    public Trie()
    {
        _root = new Node();
    }

    public void Insert(string word)
    {
        Node current = _root;
        for (int i = 0; i < word.Length; i++)
        {
            int idx = word[i] - 'a';
            if (current.Children[idx] == null)
            {
                current.Children[idx] = new Node();
            }
            current = current.Children[idx];
        }
        current.IsEnd = true;
    }

    public bool Search(string word)
    {
        Node node = Traverse(word);
        return node != null && node.IsEnd;
    }

    public bool StartsWith(string prefix)
    {
        Node node = Traverse(prefix);
        return node != null;
    }

    private Node Traverse(string str)
    {
        Node current = _root;
        for (int i = 0; i < str.Length; i++)
        {
            int idx = str[i] - 'a';
            if (current.Children[idx] == null)
            {
                return null!;
            }
            current = current.Children[idx];
        }
        return current;
    }
}

/**
 * Your Trie object will be instantiated and called as such:
 * Trie obj = new Trie();
 * obj.Insert(word);
 * bool param_2 = obj.Search(word);
 * bool param_3 = obj.StartsWith(prefix);
 */
```

#### Complexity Analysis:
- **Time Complexity:**
  - `Insert`: $O(L)$ where $L$ is `word.Length`. Exactly $L$ loop iterations.
  - `Search`: $O(L)$ where $L$ is `word.Length`. Exactly $L$ pointer dereferences.
  - `StartsWith`: $O(L)$ where $L$ is `prefix.Length`. Exactly $L$ pointer dereferences.
- **Space Complexity:**
  - `Insert`: $O(L)$ worst-case heap allocations when inserting a word with no shared prefix.
  - `Search` / `StartsWith`: $O(1)$ auxiliary space (iterative traversal using a single pointer variable).

---

## 6. ⚠️ COMMON PITFALLS & ERROR LOG: Production Bug Audits

### Bug 1: The "Prefix Confused for Full Word" Bug
- **Symptom:** `Search("app")` returns `true` after inserting `"apple"`.
- **Root Cause:** In `Search(word)`, returning `current != null` instead of checking `current.IsEnd`.
- **Fix:** In `Search(word)`, you must strictly return `current != null && current.IsEnd`. In contrast, `StartsWith(prefix)` only requires `current != null`.

### Bug 2: Character Indexing Buffer Overflow / Negatives
- **Symptom:** `IndexOutOfRangeException` when processing inputs with uppercase letters or punctuation (e.g., `'A' - 'a' = -32`).
- **Production Defense:** Validate inputs upfront or handle case normalizations (`char.ToLowerInvariant(c)`). For arbitrary character sets, use `Dictionary<char, TrieNode>` rather than fixed arrays.

### Bug 3: Memory Leak from Incomplete Deletion (Zombie Branches)
- **Symptom:** After calling `Delete("apple")` on a Trie containing only `"apple"`, heap profilers show all 5 `TrieNode` objects remain allocated in memory!
- **Root Cause:** Merely setting `current.IsEnd = false` removes the word logically, but leaves the physical node chain `root -> a -> p -> p -> l -> e` intact in RAM.
- **Fix:** Implement post-order backtracking cleanup: after clearing `IsEnd`, if the leaf node has zero children, set its parent's pointer to `null` and propagate upward until a node with other children or `IsEnd == true` is reached.

### Bug 4: Thread Safety & Concurrent Modification Exceptions
- **Symptom:** Concurrently inserting words while another thread calls `Search()` or `StartsWith()` causes corrupted tree branches or `NullReferenceException`.
- **Production Fix:** A standard Trie is not thread-safe. For read-heavy concurrent systems, use a `ReaderWriterLockSlim` or an immutable / lock-free Trie architecture where node mutations copy paths (Persistent Trie).

---

## 7. 🎯 DAILY CHECKPOINT QUESTIONS: Active Recall & Spoken Defense

### Checkpoint 1: Memory Footprint Comparison (Trie vs HashSet)
**Question:** For an alphabet of 26 lowercase English letters and $N$ words of average length $L$, compare the memory footprint of storing strings in a `HashSet<string>` vs a `Trie`. Under what dictionary conditions does a Trie consume **less** memory than a `HashSet<string>`?
<details>
<summary><b>View Architectural Answer</b></summary>

- A **`HashSet<string>`** stores each string object as a contiguous character array plus entry metadata (hash code, next pointer). Memory is strictly $O(N \cdot L)$.
- A **`Trie`** with `TrieNode[26]` consumes $\approx 264$ bytes per node on a 64-bit CLR. If words share few prefixes, the Trie creates up to $N \cdot L$ nodes, consuming $\approx 264 \cdot N \cdot L$ bytes—over **10 to 20 times more memory** than a hash set!
- **When Trie wins on memory:** A Trie uses less memory only when there is **massive prefix overlap** (e.g., a dictionary where 1,000,000 words share long common prefixes like `telecommunication...`, `internationalization...`, or dense DNA sequences where $|\Sigma| = 4$). In dense prefix sharing, thousands of words reuse the same ancestral nodes, amortizing node overhead across many words.
</details>

---

### Checkpoint 2: Longest Prefix Match (LPM) in Network Routing
**Question:** How do internet routers use Trie architecture to find the next-hop IP address for an incoming packet with destination IP `192.168.1.45`?
<details>
<summary><b>View Architectural Answer</b></summary>

Internet routing tables use **Classless Inter-Domain Routing (CIDR)** prefixes (e.g., `192.168.0.0/16`, `192.168.1.0/24`).
A router builds a **Binary Bitwise Trie** (alphabet $|\Sigma| = 2$, bits `0` and `1`), where the depth of the tree is at most 32 (for IPv4) or 128 (for IPv6).
When a packet arrives:
1. The router converts the destination IP into a 32-bit binary stream.
2. It walks down the bitwise Trie branch by branch.
3. Every time it encounters a node marked with a routing rule, it updates its `BestRoute` candidate.
4. When it reaches a dead end or bit 31, the last matched node represents the **Longest Prefix Match (LPM)**.
This executes in strictly $\le 32$ bit checks ($O(1)$ bounded time), ensuring line-rate packet forwarding at gigabits per second!
</details>

---

### Checkpoint 3: Exact Search vs Prefix Search Invariants
**Question:** Explain the exact code difference between `Search(word)` and `StartsWith(prefix)` in a Trie. Why can't a standard Hash Table support `StartsWith(prefix)` in $O(L)$ time?
<details>
<summary><b>View Architectural Answer</b></summary>

- In `StartsWith(prefix)`, we only check if the character path exists in the tree: if `current != null` after traversing all $L$ characters, we return `true`.
- In `Search(word)`, the path must exist AND the final node must have `current.IsEnd == true`. If `IsEnd` is false, the queried string is merely a proper prefix of some other longer word in the dictionary, not an inserted word itself.
- A standard Hash Table computes a hash code over the **entire string**. The hash of `"app"` has zero mathematical correlation with the hash of `"apple"`. Therefore, finding whether any key starts with `"app"` in a hash table requires an exhaustive $O(N \cdot L)$ scan over all $N$ keys.
</details>

---

### Daily Mastery Checklist
- [x] Mastered the digital search tree model: character edges, empty root, and `IsEnd` terminal flags.
- [x] Analyzed the memory and speed trade-offs of `TrieNode[26]` vs `Dictionary<char, TrieNode>`.
- [x] Implemented a production-ready C# `Trie` with `Insert`, `Search`, `StartsWith`, `CountWordsStartingWith`, and branch-pruned `Delete`.
- [x] Solved and verified [LeetCode 208] Implement Trie (Prefix Tree).
- [x] Understood 64-bit CLR memory overhead, cache locality costs, and Radix / Patricia compression.
