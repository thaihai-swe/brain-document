---
title: "Week 5 — Day 32: KMP Pattern Matching & The Pi-Array"
---

In **Day 31**, we used the Rabin-Karp algorithm to perform probabilistic substring matching via polynomial rolling hashes.

Today, we conquer **Knuth-Morris-Pratt (KMP)**: one of the crowning theoretical achievements in string algorithms.

While Rabin-Karp relies on hash arithmetic (which can suffer from hash collisions or worst-case $O(N \times M)$ degradation on pathological inputs), KMP is **strictly deterministic**. By precomputing a **prefix-suffix failure automaton ($\pi$-array)** in $O(M)$ time, KMP guarantees that the text pointer **never moves backward**, searching strings in guaranteed **$O(N + M)$ worst-case time with zero collisions and zero floating-point math**.

---

## 1. 🧠 TEACH: Deterministic Automata & The Prefix Function

### 1.1 The Backtracking Problem in Naive Search

Suppose we are searching for `pattern = "ABABCABAB"` inside `text = "ABABDABACDABABCABAB"`:

```
text:    A  B  A  B  D  A  B  A  C  D  A  B  A  B  C  A  B  A  B
pattern: A  B  A  B  C  ...
Index:   0  1  2  3  4
                     ▲
                 Mismatch! ('D' != 'C')
```

- In a naive search, when the mismatch occurs at index 4, the algorithm resets `pattern` back to index 0 and rewinds `text` back to index 1 (`'B'`).
- **The Redundancy:** We *already* examined `text[0 .. 3] = "ABAB"`. We already know its contents! Why throw away that information and re-read characters we have already seen?
- **The KMP Invariant:**
  > **The text pointer $i$ NEVER moves backward.**  
  > Only the pattern pointer $j$ falls back to the longest known prefix that matches what we just read.

---

### 1.2 The Formal Definition of the $\pi$-Array (Prefix Function / LPS)

For a pattern $P$ of length $M$, we construct an array $\pi$ (also called LPS: *Longest Prefix Suffix*) of length $M$:

$$\mathbf{\pi[i] = \text{length of the longest PROPER prefix of } P[0..i] \text{ that is also a suffix of } P[0..i]}}$$

- **Proper Prefix:** A prefix that is not the entire string (e.g. for `"ABA"`, proper prefixes are `""`, `"A"`, `"AB"`; `"ABA"` is not proper).
- **Suffix:** A substring that ends at index $i$.

#### Example Trace of $\pi$:
Let $P = \text{"ABABCABAB"}$:

| Index $i$ | Substring $P[0..i]$ | Proper Prefixes | Suffixes | Longest Match | Length $\pi[i]$ |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **0** | `"A"` | $\emptyset$ | $\emptyset$ | `""` | **0** |
| **1** | `"AB"` | `"A"` | `"B"` | `""` | **0** |
| **2** | `"ABA"` | `"A"`, `"AB"` | `"BA"`, `"A"` | `"A"` | **1** |
| **3** | `"ABAB"` | `"A"`, `"AB"`, `"ABA"` | `"BAB"`, `"AB"`, `"B"` | `"AB"` | **2** |
| **4** | `"ABABC"` | `"A"`, `"AB"`, ... | `"BABC"`, `"ABC"`, ... | `""` | **0** |
| **5** | `"ABABCA"` | `"A"`, `"AB"`, ... | `"BABCA"`, ..., `"A"` | `"A"` | **1** |
| **6** | `"ABABCAB"` | `"A"`, `"AB"`, ... | `"BABCAB"`, ..., `"AB"` | `"AB"` | **2** |
| **7** | `"ABABCABA"` | `"A"`, `"AB"`, `"ABA"`, ... | `"BABCABA"`, ..., `"ABA"` | `"ABA"` | **3** |
| **8** | `"ABABCABAB"`| `"A"`, `"AB"`, `"ABA"`, `"ABAB"`, ... | `"BABCABAB"`, ..., `"ABAB"` | `"ABAB"` | **4** |

$$\pi = [0, \ 0, \ 1, \ 2, \ 0, \ 1, \ 2, \ 3, \ 4]$$

---

### 1.3 Constructing the $\pi$-Array in $O(M)$ Time

How do we build $\pi$ in linear time without checking all substrings?

We use two pointers:
- `i`: Current position in the pattern being computed ($1 \dots M - 1$).
- `len`: Length of the current longest matching prefix suffix.

```
P:     [ A   B   A   B   C   A   B   A   B ]
             ▲       ▲
            len      i
```

1. **If $P[i] == P[len]$:** The matching prefix-suffix extends by 1!
   - `len++`
   - `pi[i] = len`
   - `i++`
2. **If $P[i] \ne P[len]$:** We cannot extend the current prefix.
   - We must fall back to a shorter prefix that is also a suffix:  
     $$\mathbf{len = \pi[len - 1]}$$
   - We repeat this check without advancing $i$ until either characters match or `len == 0`.
   - If `len == 0` and still no match: `pi[i] = 0; i++;`.

#### Why is Building $\pi$ Strictly $O(M)$? (Amortized Analysis)
- In each iteration of the loop, `len` increases by at most 1 (when characters match).
- Therefore, across the entire execution of $M$ steps, `len` can increase at most $M$ times.
- Since `len` never drops below 0, the fallback `len = pi[len - 1]` can execute at most $M$ times total!
- **Total Operations $\le 2M \implies \mathbf{O(M)}$ Linear Time.**

---

### 1.4 The $O(N)$ KMP Search Phase

Once $\pi$ is built, we search $T$ with pointer $i$ and $P$ with pointer $j$:

```csharp
int i = 0; // Pointer in text (never moves backward!)
int j = 0; // Pointer in pattern

while (i < text.Length) {
    if (text[i] == pattern[j]) {
        i++;
        j++;
        if (j == pattern.Length) {
            // Match found at index (i - pattern.Length)!
            j = pi[j - 1]; // Reset j to find subsequent matches
        }
    } else {
        if (j > 0) {
            j = pi[j - 1]; // Fallback in pattern; DO NOT change i!
        } else {
            i++; // Cannot fallback further; advance text pointer
        }
    }
}
```

---

### 1.5 The Periodicity Theorem (The Secret to LeetCode 459)

If a string $S$ of length $N$ is formed by repeating a smaller substring $K$ times (e.g. $S = \text{"abcabcabc"}$, $N = 9$):
What does its final prefix function value $\pi[N - 1]$ tell us?

```
S:     a  b  c  a  b  c  a  b  c   (N = 9)
pi:    0  0  0  1  2  3  4  5  6   (pi[8] = 6)
       ├──────────────┤ ├──────────────┤
        Prefix "abcabc"   Suffix "abcabc"
```

The length of the non-overlapping remaining segment is:
$$\text{Candidate Unit Length} = N - \pi[N - 1] = 9 - 6 = 3 \quad (\text{"abc"})$$

> **String Periodicity Theorem:**  
> A string $S$ of length $N$ consists of a repeated substring if and only if:
> 1. $\pi[N - 1] > 0$, AND
> 2. $\mathbf{N \pmod{N - \pi[N - 1]} == 0}$

---

### 1.6 Interview Spoken Drill (20–30 Seconds)

> *"KMP eliminates backtracking in the text by precomputing the prefix function $\pi$, which stores the length of the longest proper prefix that is also a suffix for every prefix of the pattern. When a mismatch occurs at $pattern[j]$, instead of restarting the text scan, I fall back to $j = \pi[j - 1]$. The text pointer moves strictly forward, guaranteeing $O(N + M)$ worst-case time with zero collision risk and zero extra allocations."*

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 28 — Find the Index of the First Occurrence in a String (Medium)

> Given two strings `needle` and `haystack`, return the index of the first occurrence of `needle` in `haystack`, or `-1` if `needle` is not part of `haystack`. Solve in deterministic $O(N + M)$ time.

#### Production C# Implementation:
```csharp
public class SolutionKmp {
    public int StrStr(string haystack, string needle) {
        if (needle.Length == 0) return 0;
        if (needle.Length > haystack.Length) return -1;

        // Step 1: Precompute the Pi-array (LPS) in O(M)
        int[] pi = BuildPiTable(needle);

        int i = 0; // Text pointer
        int j = 0; // Pattern pointer

        // Step 2: Stream through text in O(N)
        while (i < haystack.Length) {
            if (haystack[i] == needle[j]) {
                i++;
                j++;

                if (j == needle.Length) {
                    return i - needle.Length; // First complete match found
                }
            } else {
                if (j > 0) {
                    // Fall back to longest matching proper prefix
                    j = pi[j - 1];
                } else {
                    i++;
                }
            }
        }

        return -1;
    }

    private int[] BuildPiTable(string pattern) {
        int m = pattern.Length;
        int[] pi = new int[m];
        int len = 0;

        for (int i = 1; i < m; i++) {
            while (len > 0 && pattern[i] != pattern[len]) {
                len = pi[len - 1]; // Fallback
            }

            if (pattern[i] == pattern[len]) {
                len++;
            }

            pi[i] = len;
        }

        return pi;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N + M)$ — $O(M)$ to build the table, $O(N)$ to scan the text.
- **Space Complexity:** $O(M)$ — to store the $\pi$-array of size $M$.

---

### Problem 2: LeetCode 459 — Repeated Substring Pattern (Easy)

> Given a string `s`, check if it can be constructed by taking a substring of it and appending multiple copies of the substring together.

#### Visual Step-by-Step Trace:
`s = "abab"` ($N = 4$)
- Build $\pi$:
  - `i = 1`: `s[1] = 'b' != s[0] = 'a'` $\implies \pi[1] = 0$.
  - `i = 2`: `s[2] = 'a' == s[0] = 'a'` $\implies \pi[2] = 1$.
  - `i = 3`: `s[3] = 'b' == s[1] = 'b'` $\implies \pi[3] = 2$.
- $\pi = [0, 0, 1, 2]$.
- $\pi[N - 1] = 2$.
- Candidate unit length: $N - \pi[N - 1] = 4 - 2 = 2$.
- Check divisibility: $4 \% 2 == 0$ (True!).
- Result: `true` (formed by `"ab"` repeated twice).

#### Production C# Implementation:
```csharp
public class SolutionRepeatedSubstring {
    public bool RepeatedSubstringPattern(string s) {
        int n = s.Length;
        if (n <= 1) return false;

        // Build Pi-table for the entire string
        int[] pi = new int[n];
        int len = 0;

        for (int i = 1; i < n; i++) {
            while (len > 0 && s[i] != s[len]) {
                len = pi[len - 1];
            }
            if (s[i] == s[len]) {
                len++;
            }
            pi[i] = len;
        }

        int lps = pi[n - 1];
        // Condition: LPS must be > 0 and remainder of n / (n - lps) must be 0
        return lps > 0 && (n % (n - lps) == 0);
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — single pass $\pi$-table construction.
- **Space Complexity:** $O(N)$ — integer array for $\pi$.

---

### Problem 3: LeetCode 214 — Shortest Palindrome (Hard)

> You are given a string `s`. You can convert `s` to a palindrome by adding characters in front of it.
> Return the shortest palindrome you can find by performing this transformation.

#### The KMP Reduction Insight:
To make $S$ a palindrome by prepending the minimum number of characters:
1. We must find the **longest prefix of $S$ that is ALREADY a palindrome**!
2. Once we know the longest palindrome prefix $S[0 \dots k-1]$, the remaining suffix $S[k \dots N-1]$ must be reversed and prepended to the front.

#### How to find the Longest Palindrome Prefix with KMP?
Reverse $S$ into $S^R$.  
Construct a synthetic string with a unique separator `#`:
$$\mathbf{T = S + '\#' + S^R}$$

Compute the $\pi$-array for $T$.
The value at the very end, $\pi[T.Length - 1]$, gives the length of the longest prefix of $S$ that matches a suffix of $S^R$!  
Because a prefix of $S$ that matches a suffix of $S^R$ is **symmetrical with its own reverse $\implies$ it is a palindrome!**

```
s = "aacecaaa"
s^R = "aaacecaa"
T = "aacecaaa#aaacecaa"

The longest prefix of S that matches suffix of S^R has length 7: "aacecaa"!
Non-palindrome suffix of S: "a"
Reverse suffix and prepend: "a" + "aacecaaa" = "aaacecaaa".
```

#### Production C# Implementation:
```csharp
public class SolutionShortestPalindrome {
    public string ShortestPalindrome(string s) {
        if (string.IsNullOrEmpty(s)) return s;

        // Step 1: Create reversed string
        char[] revChars = s.ToCharArray();
        Array.Reverse(revChars);
        string rev = new string(revChars);

        // Step 2: Combine with separator '#' that does not appear in alphabet
        string combined = s + "#" + rev;

        // Step 3: Compute Pi-table on combined string
        int[] pi = new int[combined.Length];
        int len = 0;

        for (int i = 1; i < combined.Length; i++) {
            while (len > 0 && combined[i] != combined[len]) {
                len = pi[len - 1];
            }
            if (combined[i] == combined[len]) {
                len++;
            }
            pi[i] = len;
        }

        // Longest palindrome prefix length is pi[combined.Length - 1]
        int longestPalPrefixLen = pi[combined.Length - 1];

        // Suffix that must be reversed and prepended
        string nonPalSuffix = s.Substring(longestPalPrefixLen);
        char[] suffixChars = nonPalSuffix.ToCharArray();
        Array.Reverse(suffixChars);

        return new string(suffixChars) + s;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — building $\pi$-table on combined string of length $2N + 1$.
- **Space Complexity:** $O(N)$ — to store the combined string and $\pi$-array.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master the KMP pattern on LeetCode:

### Problem 1 (Core Substring Match): LeetCode 28 — Find the Index of the First Occurrence in a String (Medium)
- **Goal:** Implement clean `BuildPiTable` and text matching loop from memory.
- **Target Complexity:** $O(N + M)$ time, $O(M)$ space.

### Problem 2 (Periodicity Property): LeetCode 459 — Repeated Substring Pattern (Easy)
- **Goal:** Apply the $\pi[n-1]$ periodicity theorem $n \% (n - \pi[n-1]) == 0$.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.

### Problem 3 (Hard Reduction): LeetCode 214 — Shortest Palindrome (Hard)
- **Goal:** Use $S + '\#' + S^R$ to extract the longest palindromic prefix.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.

### Bonus / Extension Challenge: LeetCode 1392 — Longest Happy Prefix (Hard)
- **Goal:** Find the longest prefix that is also a suffix (literally the definition of $\pi[n-1]$!).
- **Hint:** Return `s.Substring(0, pi[s.Length - 1])` in $O(N)$ time!

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                        String Search Comparison                        │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Multiple patterns of same length ─────────► Rabin-Karp Rolling Hash (Day 31)
                   │
                   ├─► Single pattern, guaranteed O(N+M) time ───► KMP Automata (Day 32)
                   │   (No hash collision risk, exact LPS)
                   │
                   ├─► Multiple patterns of variable lengths ────► Aho-Corasick / Trie (Week 53)
                   │
                   └─► Substring periodicities / Palindromes ────► KMP π-Table / Manacher (Week 53)
```

### Preview for Day 33: Bit Manipulation Basics & Array XOR Patterns
Over Days 31 and 32, we explored high-level string algorithms (Rabin-Karp and KMP).  
Tomorrow in **Day 33**, we drop down to the lowest layer of machine execution: **Bit Manipulation & Array XOR Patterns**.  
We will master register-level bit tricks: isolating lowest set bits with `x & (-x)`, Brian Kernighan's bit counting, and using XOR group cancellation to find unique elements in $O(N)$ time and strictly $O(1)$ space!

---

## 5. 🎯 Day 32 Checkpoint Questions

Verify your mastery of KMP failure automata with these 4 questions:

1. **Why `len = pi[len - 1]`:** When a mismatch occurs during $\pi$-table construction ($P[i] \ne P[len]$), why do we fall back to $\pi[len - 1]$ instead of $len - 1$?
2. **Text Pointer Invariant:** In the KMP search loop, why does the text pointer $i$ never decrement? How does this guarantee linear execution?
3. **The Separator Invariant in 214:** In LeetCode 214, why is it mandatory to insert the separator character `'#'` between $S$ and $S^R$ in $S + '\#' + S^R$? What bug would occur if you computed $\pi$ on $S + S^R$ directly?
4. **Periodicity Proof:** If $S = \text{"aaaa"}$, what is $\pi$? What is $N - \pi[N-1]$? Why does this confirm that the minimal repeating block has length 1?
