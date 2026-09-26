# 🚀 Week 3 — Day 17: Subsequences vs. Substrings & Multi-Pointer Matching

Welcome to Day 17! Today we analyze one of the most foundational distinctions in string algorithms: **Substrings vs. Subsequences**.

Understanding the difference between contiguous segments and order-preserving sparse sequences unlocks greedy two-pointer traversals, inverted-index lookups, and the **Multi-Pointer Bucket pattern** (an interview favorite at Google and Meta).

---

## 1. 🧠 TEACH: The Hierarchy of String Decompositions

### 1.1 Strict Definitions

```
Given original string: "abcde"

1. SUBSTRING (Contiguous, Order Preserved):
   "bcd"  ──► Valid (continuous block)
   "ace"  ──► INVALID (contains gaps)
   Total non-empty substrings = N(N + 1) / 2 = O(N²)

2. SUBSEQUENCE (Sparse, Relative Order Preserved):
   "ace"  ──► Valid (delete 'b' and 'd'; relative order a -> c -> e intact)
   "cba"  ──► INVALID (relative order reversed)
   Total non-empty subsequences = 2^N - 1 = O(2^N)

3. SUBSET (Set Theory, Order Does NOT Matter):
   { 'e', 'a', 'c' } ──► Identical to { 'a', 'c', 'e' }
```

---

### 1.2 Greedy Two-Pointer Subsequence Matching (1-on-1)

To check if pattern $S$ is a subsequence of text $T$:
- Place pointer `i` on $S$, pointer `j` on $T$.
- If `S[i] == T[j]`, advance both `i++` and `j++`.
- If `S[i] != T[j]`, advance only `j++` (skip character in $T$).

```
S = "abc"
T = "a h b g d c"
     ▲
     j (S[0]=='a' == T[0]=='a' -> Match! i=1, j=1)

T = "a h b g d c"
       ▲
       j (S[1]=='b' != T[1]=='h' -> Skip! j=2)

T = "a h b g d c"
         ▲
         j (S[1]=='b' == T[2]=='b' -> Match! i=2, j=3)
```

#### The Greedy Choice Invariant:
> **Why is greedy matching always correct?**
> Matching the *earliest possible* occurrence of `S[i]` in $T$ leaves the maximal remaining suffix of $T$ available to match all subsequent characters `S[i+1 .. |S|-1]`. Delaying a match can only hurt or tie future possibilities, never help.

---

### 1.3 The 1-to-Many Bottleneck: Checking $K$ Words Against One Text

Suppose you have $K = 50,000$ candidate words and a long text $T$ of length $50,000$.
- Running the greedy two-pointer check on each word:
  $$\text{Total Time} = O(K \times |T|) = 50,000 \times 50,000 = 2.5 \times 10^9 \text{ operations} \implies \mathbf{TLE!}$$

#### Technique A: Multi-Pointer Bucket / Waiting List Pattern (Optimal)
Instead of scanning $T$ once per word, **scan $T$ exactly ONCE across all $K$ words simultaneously**!
- Create 26 buckets (one for each character `'a'..'z'`).
- Group words into buckets based on the character they are **currently waiting to match**.
- Stream through $T$ character by character:
  - When character $c$ appears in $T$, process all words in `bucket[c]`.
  - Advance their respective pointers by 1.
  - If a word is finished, increment the matching counter.
  - If not finished, re-file the word into the bucket for its **next waiting character**.

$$\mathbf{\text{Total Time} = O(|T| + \sum |word_i|)}$$

#### Technique B: Inverted Index + Binary Search
- Precompute all index locations of each character in $T$: `pos[26] = List<int>`.
- For each word, binary search (`BinarySearch` or custom upper-bound) for the smallest index in `pos[c]` that is strictly greater than `prevIndex`.
- Time per word: $O(L \log |T|)$. Excellent when words arrive as an infinite stream or $K \ll |T|$.

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 392 — Is Subsequence (Easy)

> Given two strings `s` and `t`, return `true` if `s` is a **subsequence** of `t`, or `false` otherwise.

#### Visual Trace:
`s = "abc"`, `t = "ahbgdc"`

```
sPtr = 0 ('a'), tPtr = 0 ('a') -> Match! sPtr = 1, tPtr = 1
sPtr = 1 ('b'), tPtr = 1 ('h') -> Mismatch! tPtr = 2
sPtr = 1 ('b'), tPtr = 2 ('b') -> Match! sPtr = 2, tPtr = 3
sPtr = 2 ('c'), tPtr = 3 ('g') -> Mismatch! tPtr = 4
sPtr = 2 ('c'), tPtr = 4 ('d') -> Mismatch! tPtr = 5
sPtr = 2 ('c'), tPtr = 5 ('c') -> Match! sPtr = 3, tPtr = 6

sPtr reached s.Length (3 == 3) -> Return true.
```

#### Production C# Implementation:
```csharp
public class SolutionIsSubsequence {
    public bool IsSubsequence(string s, string t) {
        if (s.Length == 0) return true;
        if (s.Length > t.Length) return false;

        int sPtr = 0;
        int tPtr = 0;

        while (sPtr < s.Length && tPtr < t.Length) {
            if (s[sPtr] == t[tPtr]) {
                sPtr++;
            }
            tPtr++;
        }

        return sPtr == s.Length;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(|T|)$ — single pass over $T$.
- **Space Complexity:** $O(1)$ auxiliary space.

---

### Problem 2: LeetCode 792 — Number of Matching Subsequences (Medium)

> Given a string `s` and an array of strings `words`, return the *number of `words[i]` that is a subsequence of `s`*.

#### The Multi-Pointer Bucket Walkthrough:
`s = "abcde"`, `words = ["a", "bb", "acd", "ace"]`

1. **Initial Buckets:**
   - Bucket `'a'`: `[ ("a", 0), ("acd", 0), ("ace", 0) ]`
   - Bucket `'b'`: `[ ("bb", 0) ]`
2. **Stream `s[0] = 'a'`:**
   - Dequeue all items in Bucket `'a'`:
     - `("a", 0)` $\to$ pointer reaches end! `matchedCount++` (1).
     - `("acd", 0)` $\to$ advance: `("acd", 1)`. Next char is `'c'` $\to$ move to Bucket `'c'`.
     - `("ace", 0)` $\to$ advance: `("ace", 1)`. Next char is `'c'` $\to$ move to Bucket `'c'`.
3. **Stream `s[1] = 'b'`:**
   - Dequeue Bucket `'b'`:
     - `("bb", 0)` $\to$ advance: `("bb", 1)`. Next char is `'b'` $\to$ re-add to Bucket `'b'`.
4. **Stream `s[2] = 'c'`:**
   - Dequeue Bucket `'c'`:
     - `("acd", 1)` $\to$ next char `'d'` $\to$ Bucket `'d'`.
     - `("ace", 1)` $\to$ next char `'e'` $\to$ Bucket `'e'`.
5. Continue until end of `s`. Final count = 3 (`"a"`, `"acd"`, `"ace"`).

#### Production C# Implementation:
```csharp
public class SolutionNumMatchingSubseq {
    // Lightweight struct to avoid heap allocations per node
    private readonly struct WordPointer {
        public readonly int WordIndex;
        public readonly int CharIndex;

        public WordPointer(int wordIndex, int charIndex) {
            WordIndex = wordIndex;
            CharIndex = charIndex;
        }
    }

    public int NumMatchingSubseq(string s, string[] words) {
        // 26 waiting lists (buckets)
        var buckets = new List<WordPointer>[26];
        for (int i = 0; i < 26; i++) {
            buckets[i] = new List<WordPointer>();
        }

        // Place each word in the bucket corresponding to its first character
        for (int i = 0; i < words.Length; i++) {
            if (words[i].Length > 0) {
                int firstChar = words[i][0] - 'a';
                buckets[firstChar].Add(new WordPointer(i, 0));
            }
        }

        int matchCount = 0;

        // Process text s in a single pass
        for (int i = 0; i < s.Length; i++) {
            int c = s[i] - 'a';
            List<WordPointer> currentBucket = buckets[c];
            
            // Re-initialize bucket for new arrivals
            buckets[c] = new List<WordPointer>();

            for (int j = 0; j < currentBucket.Count; j++) {
                WordPointer wp = currentBucket[j];
                int nextCharIdx = wp.CharIndex + 1;
                string word = words[wp.WordIndex];

                if (nextCharIdx == word.Length) {
                    matchCount++; // Entire word matched!
                } else {
                    int nextChar = word[nextCharIdx] - 'a';
                    buckets[nextChar].Add(new WordPointer(wp.WordIndex, nextCharIdx));
                }
            }
        }

        return matchCount;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(|S| + \sum |word_i|)$ — every word character is visited exactly once; $S$ is traversed once.
- **Space Complexity:** $O(K)$ where $K$ is the number of words.

---

### Problem 3: LeetCode 524 — Longest Word in Dictionary through Deleting (Medium)

> Given a string `s` and a string array `dictionary`, return the *longest string in the dictionary that can be formed by deleting some of the given string characters*. If there is more than one possible result, return the **lexicographically smallest** one. If there is no possible result, return the empty string.

#### Insight:
We iterate through the dictionary and maintain the `bestWord`. When comparing candidate `word` against `bestWord`:
- If `word.Length > bestWord.Length`: test if it is a subsequence.
- If `word.Length == bestWord.Length`: only test if `string.CompareOrdinal(word, bestWord) < 0`.
- Otherwise skip immediately!

#### Production C# Implementation:
```csharp
public class SolutionFindLongestWord {
    public string FindLongestWord(string s, IList<string> dictionary) {
        string bestWord = string.Empty;

        for (int i = 0; i < dictionary.Count; i++) {
            string word = dictionary[i];
            
            // Prune: only check if longer OR equal length and lexicographically smaller
            if (word.Length < bestWord.Length) continue;
            if (word.Length == bestWord.Length && string.CompareOrdinal(word, bestWord) >= 0) continue;

            if (IsSubsequence(word, s)) {
                bestWord = word;
            }
        }

        return bestWord;
    }

    private static bool IsSubsequence(string sub, string text) {
        int i = 0, j = 0;
        while (i < sub.Length && j < text.Length) {
            if (sub[i] == text[j]) i++;
            j++;
        }
        return i == sub.Length;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(K \times |S|)$ where $K$ is dictionary count.
- **Space Complexity:** $O(1)$ auxiliary space.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Solve these in sequence to master subsequence mechanics:

### Problem 1 (The Single Pair Matcher): LeetCode 392 — Is Subsequence (Easy)
- **Goal:** Greedy two pointers on two strings.
- **Key Insight:** Earliest match invariant.
- **Target Complexity:** $O(|T|)$ time, $O(1)$ space.

### Problem 2 (Multi-Pointer Buckets): LeetCode 792 — Number of Matching Subsequences (Medium)
- **Goal:** Match $50,000$ words against one text in a single pass.
- **Key Insight:** 26 waiting lists of `WordPointer(wordIndex, charIndex)`.
- **Target Complexity:** $O(|S| + \sum |word_i|)$ time, $O(K)$ space.

### Problem 3 (Greedy Pruning): LeetCode 524 — Longest Word in Dictionary through Deleting (Medium)
- **Goal:** Find longest, lexicographically smallest subsequence.
- **Key Insight:** Prune words shorter than current best before running subsequence check.
- **Target Complexity:** $O(K \times |S|)$ time, $O(1)$ space.

---

## 4. 🔗 CONNECT: Substrings vs. Subsequences in Interviews

```
Problem says: "Contiguous block / window / sub-range"
  └─► SUBSTRING ──► Sliding Window (Days 11–13) or Prefix Sums (Days 8–10)

Problem says: "Delete characters / preserve relative order / matching pattern"
  └─► SUBSEQUENCE ──► Greedy Two Pointers (Day 17) or Dynamic Programming (LCS)
```

---

## 5. 🎯 Day 17 Checkpoint Questions

1. **Greedy Correctness:** Prove why matching the *first* occurrence of character `S[i]` in $T$ is always optimal when checking if $S$ is a subsequence of $T$. Can waiting for a later occurrence ever yield a valid match that the greedy choice missed?
2. **Bucket Memory:** In LeetCode 792, why do we store `(wordIndex, charIndex)` in the buckets rather than storing cloned substring copies of the remaining word?
3. **Binary Search Alternative:** Explain how precomputing an inverted index `pos[26] = List<int>` on string $T$ allows us to check whether a word of length $L$ is a subsequence in $O(L \log |T|)$ time.
