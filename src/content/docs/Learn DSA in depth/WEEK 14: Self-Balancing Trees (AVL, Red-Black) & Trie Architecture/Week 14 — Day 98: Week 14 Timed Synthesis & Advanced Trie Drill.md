---
title: "Week 14 — Day 98: Week 14 Timed Synthesis & Advanced Trie Drill"
---

# Week 14 — Day 98: Week 14 Timed Synthesis & Advanced Trie Drill

Welcome to **Day 98 of your DSA Mastery Journey**!

Today marks the **capstone synthesis of Week 14**. Throughout this week, we navigated the entire landscape of advanced tree architectures:
- [Day 92](./Week%2014%20%E2%80%94%20Day%2092:%20Self-Balancing%20Tree%20Mechanics%20&%20From-Scratch%20AVL%20Tree.md): AVL Trees & the 4 rotation invariants ($H \le 1.44 \log_2 N$).
- [Day 93](./Week%2014%20%E2%80%94%20Day%2093:%20Red-Black%20Tree%20Architecture%20&%20Systems%20Memory%20Layout.md): Red-Black Trees & the 2-3-4 B-Tree isomorphism ($O(1)$ rotation bounds).
- [Day 94](./Week%2014%20%E2%80%94%20Day%2094:%20Trie%20Architecture%20&%20From-Scratch%20Implementation.md): Digital search tree foundations & CLR object layouts.
- [Day 95](./Week%2014%20%E2%80%94%20Day%2095:%20Trie%20Prefix%20Search,%20Wildcard%20Matching%20&%20Auto-Complete.md): Backtracking wildcard queries (`.`) & Top-$K$ caching.
- [Day 96](./Week%2014%20%E2%80%94%20Day%2096:%20Word%20Search%20II%20&%20Trie-Pruned%202D%20Grid%20Backtracking.md): Dual-automaton 2D grid backtracking & dynamic dead-leaf pruning.
- [Day 97](./Week%2014%20%E2%80%94%20Day%2097:%20Maximum%20XOR%20Pair%20in%20Array%20&%20Bitwise%20Binary%20Trie.md): Bitwise Binary Tries & greedy MSB dominance.

Today, we consolidate these patterns under timed interview conditions with two advanced Trie capstones:
1. **Shortest Root Prefix Replacement:** Greedily canonicalizing sentence tokens via early Trie exit.
2. **Reverse Trie with Palindromic Prefix/Suffix Caching:** Slashing palindrome pair search from $O(N^2 \cdot L)$ down to $O(N \cdot L^2)$.
3. **The 5W1H Executive Blueprint:** Contract, invariants, and structural matching rules.
4. **Hardware & Systems Memory Dive:** High-performance zero-allocation substring checks using `ReadOnlySpan<char>`, string interning, and SIMD string comparison.
5. **LeetCode Lab:** Comprehensive architectural walkthroughs of:
   - **[LeetCode 648] Replace Words** (Medium)
   - **[LeetCode 336] Palindrome Pairs** (Hard)

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 98 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: SHORTEST ROOT       │                                     │  PART II: REVERSE TRIE PALINDROME│
│    Greedy Early-Exit Search     │                                     │    Suffix Caching & Matching    │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Dictionary: ["cat", "bat",    │                                     │ • Brute Force:                  │
│                "rat"]           │                                     │   Compare all pairs: O(N^2 * L) │
│ • Sentence: "the cattle was..." │                                     │ • Reverse Trie Invariant:       │
│ • Root Matching Rule:           │                                     │   Index all reversed words.     │
│   Walk Trie until IsEnd == true.│                                     │ • 3 Structural Match Cases:     │
│   Return immediately!           │                                     │   1. len(A) == len(B)           │
│   "cattle" -> "cat"             │                                     │   2. len(A) > len(B) (Pal rest) │
│ • Cost: O(Sentence Length)      │                                     │   3. len(A) < len(B) (Pal rest) │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* Advanced Trie synthesis combines forward digital search with **reverse indexing** and **slice caching**:
    1. **Shortest Root Invariant:** Given a dictionary of roots, a token $T$ is replaced by the *shortest* root $R$ that forms a prefix of $T$. If multiple roots match (e.g. `"cat"` and `"catt"`), the search halts at the shallowest terminal node.
    2. **Palindrome Pair Invariant:** Two strings $S_1$ and $S_2$ form a palindrome concatenation $S_1 + S_2$ if and only if one of three structural conditions holds:
       - Case 1: $|S_1| = |S_2|$ and $S_1 = \text{reverse}(S_2)$.
       - Case 2: $|S_1| > |S_2|$, $S_1$ begins with $\text{reverse}(S_2)$, and the remaining suffix of $S_1$ is itself a palindrome.
       - Case 3: $|S_1| < |S_2|$, $S_2$ ends with $\text{reverse}(S_1)$, and the remaining prefix of $S_2$ is itself a palindrome.
  - *Misconception Check:* In Palindrome Pairs, candidates often try to insert words normally and search for suffixes. Reversing the words before insertion into the Trie makes prefix traversal over $S_1$ match the tail of $S_2$ naturally!
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the catastrophic $O(N^2 \cdot L)$ cost of quadratic string comparisons. For $N = 30,000$ words of average length $L = 5$, brute force requires $9 \times 10^8$ operations. Reverse Trie matching solves this in $O(N \cdot L^2) \approx 7.5 \times 10^5$ operations—over **1,000x faster**!
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Language stemmers (e.g. Porter Stemmer in Lucene), text search token normalizers, DNA inverted repeat detection, reverse genome sequence matching.
  - *When to Avoid / Failure Modes:* If words are extremely long ($L > 10^5$) and few in number ($N \le 10$), Trie construction incurs high memory; use KMP or Manacher's algorithm directly.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Memory Model:* To avoid allocating substrings during palindrome checks, use .NET `ReadOnlySpan<char>` with index pointers (`start, end`) directly referencing the underlying string buffer.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To solve Palindrome Pairs in O(N * L^2) time, we insert all words into a Trie in reverse. Each Trie node maintains two attributes: the index of the word ending at this node, and a list of indices of all words whose remaining prefix is a palindrome. For each word, we walk down the reverse Trie. If we reach a terminal node and the rest of our word is a palindrome, we found a pair. Conversely, if our word finishes and the current Trie node has cached palindrome suffixes, those form valid pairs as well. This eliminates the O(N^2) brute force completely."
  - *Interviewer Evaluation Lens:* Checks whether candidate identifies the reverse Trie mapping, accounts for all 3 length disparity cases, handles the empty string `""` correctly, and avoids memory allocations via string spans.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:*
    - Root Replacement: $O(\sum L_{\text{roots}} + L_{\text{sentence}})$ time, $O(L)$ auxiliary space.
    - Palindrome Pairs: $O(N \cdot L^2)$ time where $L$ is max word length, $O(N \cdot L)$ space.

---

### 1.1 Palindrome Pair Structural Cases Visualized

```
Case 1: Equal Length (|S1| == |S2|)
S1: [ 'a' 'b' 'c' ]
S2: [ 'c' 'b' 'a' ]
S1 + S2 = "abccba" (Palindrome!)
Reverse Trie Match: S1 matches reverse(S2) character-by-character to terminal node.

Case 2: S1 is Longer (|S1| > |S2|)
S1: [ 'a' 'b' 'c' ] [ 'd' 'e' 'd' ]
                    └─────────────┘ Palindromic Suffix!
S2: [ 'c' 'b' 'a' ]
S1 + S2 = "abcded" + "cba" = "abcdedcba" (Palindrome!)
Reverse Trie Match: S1 matches reverse(S2) at node 'c'; remaining suffix of S1 ("ded") is palindrome.

Case 3: S2 is Longer (|S1| < |S2|)
S1: [ 'c' 'b' 'a' ]
S2: [ 'd' 'e' 'd' ] [ 'a' 'b' 'c' ]
    └─────────────┘ Palindromic Prefix!
S1 + S2 = "cba" + "dedabc" = "cbadedabc" (Palindrome!)
Reverse Trie Match: S1 finishes at node 'a'; Trie branch below contains cached word S2 whose remaining prefix ("ded") is palindrome!
```

---

## 2. 🎯 GUIDED PRACTICE: Architectural Patterns & Techniques

### Pattern 1: Shortest Root Greedy Early-Exit ([LeetCode 648])

When replacing words in a sentence with their shortest dictionary root:
1. Build a Trie containing all roots.
2. For each token in the sentence, walk down the Trie character by character.
3. **Early Exit Rule:** As soon as `node.IsEnd == true`, return the prefix immediately! Continuing deeper would only find longer, redundant roots.
4. If a character is missing or the walk terminates without hitting `IsEnd`, return the original word untouched.

```csharp
private string FindShortestRoot(TrieNode root, string word)
{
    TrieNode curr = root;
    for (int i = 0; i < word.Length; i++)
    {
        int idx = word[i] - 'a';
        if (curr.Children[idx] == null) return word; // No root matches
        
        curr = curr.Children[idx]!;
        if (curr.IsEnd)
        {
            return word.Substring(0, i + 1); // Shortest root found!
        }
    }
    return word;
}
```

---

### Pattern 2: Reverse Trie Node Structure for Palindrome Pairs

To support $O(N \cdot L^2)$ Palindrome Pair detection, each `TrieNode` must store:
1. `WordIndex`: The index of the word that terminates at this node ($-1$ if no word terminates here).
2. `PalindromeRest`: A list of word indices for all words that pass through this node whose **remaining prefix (from index 0 to current position)** is a palindrome!

```csharp
public sealed class PalindromeTrieNode
{
    public readonly PalindromeTrieNode?[] Children = new PalindromeTrieNode?[26];
    public int WordIndex = -1;
    
    // Caches indices of words whose remaining prefix forms a palindrome
    public readonly List<int> PalindromeRest = new();
}
```

#### Why cache `PalindromeRest` during insertion?
When querying with a shorter word $S_1$, $S_1$ will run out of characters while descending down the branch. Instead of traversing the entire subtree to find matching words, we read `node.PalindromeRest` in **$O(1)$ time**!

---

## 3. 💻 PRODUCTION IMPLEMENTATION: Clean C# Code

Below is the complete, high-performance, industrial-strength C# solution for both capstone problems.

### Part A: Shortest Root Replacer ([LeetCode 648])

```csharp
using System;
using System.Collections.Generic;
using System.Text;

namespace AdvancedDSA.Trees
{
    public sealed class WordReplacer
    {
        private sealed class TrieNode
        {
            public readonly TrieNode?[] Children = new TrieNode?[26];
            public bool IsEnd;
        }

        public string ReplaceWords(IList<string> dictionary, string sentence)
        {
            if (dictionary == null || dictionary.Count == 0 || string.IsNullOrEmpty(sentence))
            {
                return sentence;
            }

            // 1. Build Root Trie
            TrieNode root = new();
            foreach (string word in dictionary)
            {
                TrieNode curr = root;
                foreach (char c in word)
                {
                    int idx = c - 'a';
                    curr.Children[idx] ??= new TrieNode();
                    curr = curr.Children[idx]!;
                }
                curr.IsEnd = true;
            }

            // 2. Process sentence tokens with zero allocation StringBuilder
            string[] tokens = sentence.Split(' ');
            StringBuilder sb = new(sentence.Length);

            for (int t = 0; t < tokens.Length; t++)
            {
                if (t > 0) sb.Append(' ');

                string token = tokens[t];
                TrieNode curr = root;
                int replaceLen = -1;

                for (int i = 0; i < token.Length; i++)
                {
                    int idx = token[i] - 'a';
                    if (idx < 0 || idx >= 26 || curr.Children[idx] == null)
                    {
                        break; // No prefix match
                    }

                    curr = curr.Children[idx]!;
                    if (curr.IsEnd)
                    {
                        replaceLen = i + 1; // Shortest root found!
                        break;
                    }
                }

                if (replaceLen != -1)
                {
                    sb.Append(token, 0, replaceLen);
                }
                else
                {
                    sb.Append(token);
                }
            }

            return sb.ToString();
        }
    }
}
```

---

### Part B: Reverse Trie Palindrome Pair Solver ([LeetCode 336])

```csharp
using System;
using System.Collections.Generic;

namespace AdvancedDSA.Trees
{
    public sealed class PalindromePairFinder
    {
        private sealed class TrieNode
        {
            public readonly TrieNode?[] Children = new TrieNode?[26];
            public int WordIndex = -1;
            public readonly List<int> PalindromeRest = new();
        }

        public IList<IList<int>> PalindromePairs(string[] words)
        {
            List<IList<int>> results = new();
            if (words == null || words.Length < 2) return results;

            TrieNode root = new();

            // 1. Insert all words in REVERSE into the Trie
            for (int i = 0; i < words.Length; i++)
            {
                string word = words[i];
                TrieNode curr = root;

                for (int j = word.Length - 1; j >= 0; j--)
                {
                    // If the remaining prefix word[0..j] is a palindrome, record index i
                    if (IsPalindrome(word, 0, j))
                    {
                        curr.PalindromeRest.Add(i);
                    }

                    int idx = word[j] - 'a';
                    curr.Children[idx] ??= new TrieNode();
                    curr = curr.Children[idx]!;
                }

                curr.WordIndex = i;
                curr.PalindromeRest.Add(i); // Empty remainder is a palindrome!
            }

            // 2. For each word, search forward in the reverse Trie
            for (int i = 0; i < words.Length; i++)
            {
                string word = words[i];
                TrieNode curr = root;

                for (int j = 0; j < word.Length; j++)
                {
                    // Case 2: |word| > |other|
                    // We hit a terminal node, and remaining suffix word[j..end] is a palindrome!
                    if (curr.WordIndex != -1 && curr.WordIndex != i && IsPalindrome(word, j, word.Length - 1))
                    {
                        results.Add(new int[] { i, curr.WordIndex });
                    }

                    int idx = word[j] - 'a';
                    if (curr.Children[idx] == null)
                    {
                        curr = null;
                        break;
                    }
                    curr = curr.Children[idx]!;
                }

                if (curr == null) continue;

                // Case 1 & Case 3: |word| <= |other|
                // Our word finished. All words with palindrome remainders cached at this node match!
                foreach (int otherIdx in curr.PalindromeRest)
                {
                    if (otherIdx != i)
                    {
                        results.Add(new int[] { i, otherIdx });
                    }
                }
            }

            return results;
        }

        /// <summary>
        /// Zero-allocation two-pointer palindrome check.
        /// </summary>
        private static bool IsPalindrome(string s, int left, int right)
        {
            while (left < right)
            {
                if (s[left] != s[right]) return false;
                left++;
                right--;
            }
            return true;
        }
    }
}
```

---

## 4. ⚡ HARDWARE & RUNTIME ARCHITECTURE: Cache, Memory & CLR Deep Dive

### 4.1 Substring Allocations vs `ReadOnlySpan<char>`

In Palindrome Pairs, verifying palindromic slices is in the **critical inner loop**.
A standard junior implementation does:
```csharp
if (IsPalindrome(word.Substring(0, j + 1))) ... // BAD!
```
- `word.Substring()` allocates a new `System.String` on the managed heap every time.
- For $N = 30,000$ and $L = 10$, this creates up to **300,000 heap objects**, causing tens of megabytes of memory churn and triggering GC Gen 0 sweeps.
- **The High-Performance Fix:** Pass index bounds `(string s, int left, int right)` or slice using `ReadOnlySpan<char>`:
  ```csharp
  ReadOnlySpan<char> span = word.AsSpan(left, length);
  ```
  `ReadOnlySpan<char>` is a `ref struct` residing purely on the CPU stack. It performs **zero heap allocations** and maps directly into L1 CPU cache!

---

### 4.2 String Interning in .NET

In dictionary engines processing massive sentences, many tokens repeat frequently (e.g. `"the"`, `"and"`, `"of"`).
- .NET maintains an **Intern Pool** (`string.Intern(str)`).
- When a string is interned, the CLR checks whether an identical character sequence exists in the internal hashtable. If it does, it returns the existing pointer.
- Comparing two interned strings is reduced to a **single pointer equality check (`ReferenceEquals`) in 1 CPU cycle**, avoiding character-by-character comparisons!

---

## 5. 🧩 LEETCODE LAB: Canonical Problems & Step-by-Step Breakdown

### Problem 1: [LeetCode 648] Replace Words

**Difficulty:** Medium | **Frequency:** High (Amazon, Uber)

#### Problem Statement
In English, we have what we call a **root**, which can be followed by some other word to form another longer word. For example, when the root `"an"` is followed by `"other"`, we can form `"another"`.

Given a `dictionary` of roots and a `sentence` containing words separated by spaces, replace all successors in the sentence with the root forming it. If a successor can be replaced by more than one root, replace it with the **shortest** root.

#### Complexity Analysis:
- **Time Complexity:**
  - Building Trie: $O(D \cdot L_{\text{root}})$ where $D$ is the number of dictionary roots.
  - Sentence Processing: $O(S)$ where $S$ is the total number of characters in the sentence.
  - Total Time: $O(D \cdot L + S)$ — optimal linear time.
- **Space Complexity:** $O(D \cdot L \times 26)$ for Trie storage.

---

### Problem 2: [LeetCode 336] Palindrome Pairs

**Difficulty:** Hard | **Frequency:** Top 10 Advanced String Problems (Airbnb, Meta, Google, Apple)

#### Problem Statement
Given a list of unique words, return all pairs of **distinct** indices `(i, j)` in the given list, so that the concatenation of the two words `words[i] + words[j]` is a palindrome.

#### Edge Case Walkthrough: The Empty String `""`
Suppose `words = ["bat", "tab", "cat", ""]`:
1. The empty string `""` has length 0. It is a self-palindrome.
2. For any word $W$ that is itself a palindrome (e.g. `"racecar"`):
   - `"" + "racecar"` is a palindrome! (Pair: `[emptyIdx, racecarIdx]`).
   - `"racecar" + ""` is a palindrome! (Pair: `[racecarIdx, emptyIdx]`).
3. Handled automatically:
   - When inserting `""`, root's `WordIndex = emptyIdx` and `PalindromeRest` includes `emptyIdx`.
   - When querying `"racecar"`, `IsPalindrome("racecar", 0, len-1) == true`, so at root we pair with `emptyIdx`!

#### Complexity Analysis:
- **Time Complexity:**
  - Insertion: For each word of length $L$, we check $L$ prefixes for palindrome properties: $L \times O(L) = O(L^2)$ per word. Total Insert: $O(N \cdot L^2)$.
  - Search: For each word of length $L$, we check $L$ suffixes: $O(L^2)$ per word. Total Search: $O(N \cdot L^2)$.
  - Total Time: $\Theta(N \cdot L^2)$. For $N = 30,000, L = 5 \implies \approx 7.5 \times 10^5$ operations (passes in $\approx 200\text{ ms}$).
- **Space Complexity:** $O(N \cdot L \times 26)$ for Trie nodes and cached index lists.

---

## 6. ⚠️ COMMON PITFALLS & ERROR LOG: Production Bug Audits

### Bug 1: Self-Pairing Bug in Palindrome Pairs
- **Symptom:** Pair `(i, i)` is returned (e.g. `["a"]` returns `[[0, 0]]`).
- **Root Cause:** Forgetting to guard index comparisons:
  ```csharp
  if (curr.WordIndex != -1 && curr.WordIndex != i) ...
  ```
- **Fix:** Always ensure `curr.WordIndex != i` and `otherIdx != i`.

### Bug 2: Missing the Shortest Root Constraint in Replace Words
- **Symptom:** `"cattle"` is replaced by `"catt"` instead of `"cat"`.
- **Root Cause:** Continuing the Trie traversal after hitting an `IsEnd = true` node.
- **Fix:** Terminate immediately on the first `IsEnd == true` node encountered.

### Bug 3: String Allocation Thrashing during Palindrome Verification
- **Symptom:** Memory Limit Exceeded (MLE) or high garbage collection pauses.
- **Root Cause:** Calling `word.Substring(0, j + 1)` inside the palindrome check.
- **Fix:** Use two-pointer index bounds `(string s, int left, int right)` directly over the original string.

---

## 7. 🎯 DAILY CHECKPOINT QUESTIONS: Active Recall & Spoken Defense

### Checkpoint 1: Palindrome Pairs Complexity Derivation
**Question:** Derive why Reverse Trie matching achieves $O(N \cdot L^2)$ time for Palindrome Pairs, compared to $O(N^2 \cdot L)$ for brute force. Under what conditions could brute force theoretically outperform Trie?
<details>
<summary><b>View Architectural Answer</b></summary>

- **Brute Force:** There are $N(N - 1)$ pairs. For each pair, checking whether $S_i + S_j$ is a palindrome takes $O(2L)$ time:
  $$\text{Total Time} = O(N^2 \cdot L)$$
- **Reverse Trie:** We process each word of length $L$ independently against the Trie. Checking if a slice of length $k$ is a palindrome takes $O(k)$ time. Doing this across all slices of length $0 \dots L$ takes $\sum_{k=1}^L O(k) = O(L^2)$ per word.
  $$\text{Total Time} = O(N \cdot L^2)$$
- **When Brute Force Wins:** If $L \gg N$ (e.g. $N = 3$ words of length $L = 1,000,000$), $N^2 \cdot L = 9 \times 10^6$, whereas $N \cdot L^2 = 3 \times 10^{12}$! The Trie approach is optimal when $N \gg L$ (millions of short words), which matches virtually all production dictionaries.
</details>

---

### Checkpoint 2: Architectural Retrospective: When to Use Which Tree?
**Question:** Across Weeks 13 and 14, we mastered Plain BSTs, AVL Trees, Red-Black Trees, Classical Tries, and Bitwise Tries. Summarize the single primary decision criteria for selecting each.
<details>
<summary><b>View Architectural Answer</b></summary>

1. **Plain BST:** Simple educational prototypes; never use in production due to $O(N)$ degeneration.
2. **AVL Tree:** Read-intensive ordered dictionaries where lookup speed is paramount ($H \le 1.44 \log_2 N$).
3. **Red-Black Tree:** Write-intensive ordered collections (.NET `SortedSet`, Linux CFS) where rotation counts must be strictly bounded ($\le 2$ on insert, $\le 3$ on delete).
4. **Classical Trie:** String dictionaries requiring prefix matching, autocomplete, or spatial grid pruning in $O(L)$ time independent of corpus size $N$.
5. **Bitwise Binary Trie:** Pairwise integer XOR optimization, prefix XOR subarrays, and network IP CIDR routing tables in fixed 31/32-step operations.
</details>

---

### Checkpoint 3: Zero-Allocation Palindrome Verification
**Question:** How does using .NET `ReadOnlySpan<char>` or two-pointer bounds prevent garbage collection thrashing in high-frequency string processing?
<details>
<summary><b>View Architectural Answer</b></summary>

A `System.String` in .NET is an immutable reference type stored on the managed garbage-collected heap. Slicing with `s.Substring()` allocates a new heap object, object header, and copied character buffer.
In contrast:
1. Two-pointer indexing operates directly on the immutable character buffer without allocating anything.
2. `ReadOnlySpan<char>` is a `ref struct` that lives exclusively on the CPU stack. Slicing a span merely updates an interior memory pointer and a length integer (16 bytes total on stack). It creates **zero GC pressure**, avoids cache thrashing, and executes within L1 cache registers.
</details>

---

### Daily Mastery Checklist
- [x] Solved [LeetCode 648] Replace Words with greedy early-exit Trie prefix search.
- [x] Mastered all 3 length disparity cases in [LeetCode 336] Palindrome Pairs.
- [x] Implemented Reverse Trie with cached `PalindromeRest` index lists.
- [x] Optimized string slice verification using zero-allocation two-pointer checks.
- [x] Completed the comprehensive Week 14 Architectural Retrospective across all balanced and digital search tree models.
