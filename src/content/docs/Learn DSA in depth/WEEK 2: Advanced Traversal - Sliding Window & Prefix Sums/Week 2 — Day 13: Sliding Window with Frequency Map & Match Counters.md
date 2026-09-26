---
title: "Week 2 — Day 13: Sliding Window with Frequency Map & Match Counters"
---

# 🚀 Week 2 — Day 13: Sliding Window with Frequency Map & Match Counters

Welcome to Day 13! Today we tackle the most sophisticated variant of the sliding window technique: **Sliding Window with Frequency Maps and Match Counters**.

This pattern governs classic Big Tech interview problems involving anagrams, string permutations, and the crown jewel of sliding window questions: **LeetCode 76 (Minimum Window Substring)**.

---

## 1. 🧠 TEACH: The Mechanics of State Tracking

### 1.1 The Bottleneck: Comparing Frequency Maps in $O(|\Sigma|)$

When searching for an anagram or substring permutation of pattern $P$ inside string $S$:
- Both the pattern and the current window have character frequency distributions.
- A naive check compares all 26 lowercase English letter frequencies (or 128 ASCII frequencies) every time the window moves one step:

```csharp
// Naive: O(26) check on EVERY slide -> 26 * N operations
bool IsMatch(int[] window, int[] target) {
    for (int i = 0; i < 26; i++) {
        if (window[i] != target[i]) return false;
    }
    return true;
}
```

While $O(26)$ is mathematically constant, doing 26 checks across $10^5$ iterations creates high branching overhead and CPU pipeline stalls.

---

### 1.2 The Match Counter Optimization: $O(1)$ Window Validation

Instead of scanning all 26 frequencies on every step, maintain a single integer:
> **`matches` = The count of characters whose frequencies in the window *exactly match* their target frequency.**

```
Total possible matches: 26 (all lowercase letters from 'a' to 'z').
Goal: Window is a valid permutation iff `matches == 26`.
```

#### How `matches` Updates in $O(1)$ When an Element Enters (`right`):
Suppose character `c` enters the window:
- If `window[c] == target[c]`: (it was already a match, but adding one more makes it an excess!) $\to$ `matches--`
- `window[c]++`
- If `window[c] == target[c]`: (adding it made it exactly equal to target!) $\to$ `matches++`

#### How `matches` Updates in $O(1)$ When an Element Exits (`left`):
Suppose character `c` leaves the window:
- If `window[c] == target[c]`: (it was an exact match, but losing one breaks it!) $\to$ `matches--`
- `window[c]--`
- If `window[c] == target[c]`: (it was an excess, but losing one brought it to exact match!) $\to$ `matches++`

**Evaluation cost: A single `if (matches == 26)` integer comparison in $O(1)$!**

---

### 1.3 The Deficit / Deficit Counter Pattern (For Minimum Window Substring)

For problems where window size is dynamic (like LeetCode 76):
Instead of maintaining two frequency arrays and comparing them, we can use a single array `need[128]` and a deficit scalar `missing`:

1. Pre-fill `need` with frequencies of pattern $T$: `need[c]++` for each $c \in T$.
2. Initialize `missing = t.Length`.
3. **Expand `right`:**
   - If `need[s[right]] > 0`: this character is useful for satisfying $T$ $\to$ `missing--`.
   - Decrement `need[s[right]]--`.
   - *(Note: `need[c]` can become negative! A negative value means the window contains excess copies of `c`.)*
4. **Contract `left` when `missing == 0` (All characters satisfied!):**
   - If `need[s[left]] < 0`: this character is an excess copy! Increment `need[s[left]]++` and shrink `left++`.
   - Stop when `need[s[left]] == 0` (we are at a strictly required character).
   - Record the shortest window, then drop this character: `need[s[left]]++`, `missing++`, `left++`.

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 567 — Permutation in String (Medium)

> Given two strings `s1` and `s2`, return `true` if `s2` contains a **permutation** of `s1`, or `false` otherwise.
> In other words, return `true` if one of `s1`'s permutations is the substring of `s2`.

#### Invariant:
A permutation of `s1` must have the **exact same length** as `s1`.
Therefore, this is a **Fixed-Size Sliding Window** of length $K = \text{s1.Length}$ with character state tracking.

#### Production C# Implementation ($O(1)$ Match Counter):
```csharp
public class SolutionCheckInclusion {
    public bool CheckInclusion(string s1, string s2) {
        if (s1.Length > s2.Length) return false;

        int[] s1Count = new int[26];
        int[] s2Count = new int[26];

        for (int i = 0; i < s1.Length; i++) {
            s1Count[s1[i] - 'a']++;
            s2Count[s2[i] - 'a']++;
        }

        // Count how many of the 26 characters already match
        int matches = 0;
        for (int i = 0; i < 26; i++) {
            if (s1Count[i] == s2Count[i]) matches++;
        }

        int left = 0;
        for (int right = s1.Length; right < s2.Length; right++) {
            if (matches == 26) return true;

            // 1. Right character enters
            int rIdx = s2[right] - 'a';
            s2Count[rIdx]++;
            if (s2Count[rIdx] == s1Count[rIdx]) {
                matches++;
            } else if (s2Count[rIdx] == s1Count[rIdx] + 1) {
                matches--;
            }

            // 2. Left character exits
            int lIdx = s2[left] - 'a';
            s2Count[lIdx]--;
            if (s2Count[lIdx] == s1Count[lIdx]) {
                matches++;
            } else if (s2Count[lIdx] == s1Count[lIdx] - 1) {
                matches--;
            }

            left++;
        }

        return matches == 26;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ where $N = \text{s2.Length}$ — single pass, strictly $O(1)$ operations per character slide.
- **Space Complexity:** $O(1)$ — fixed 26-element integer arrays.

---

### Problem 2: LeetCode 438 — Find All Anagrams in a String (Medium)

> Given two strings `s` and `p`, return an array of all the start indices of `p`'s **anagrams** in `s`. You may return the answer in **any order**.

#### Insight:
Identical fixed window of size $K = \text{p.Length}$. Whenever `matches == 26`, add `left` to the result list!

#### Production C# Implementation:
```csharp
public class SolutionFindAnagrams {
    public IList<int> FindAnagrams(string s, string p) {
        var result = new List<int>();
        if (s.Length < p.Length) return result;

        int[] pCount = new int[26];
        int[] sCount = new int[26];

        for (int i = 0; i < p.Length; i++) {
            pCount[p[i] - 'a']++;
            sCount[s[i] - 'a']++;
        }

        int matches = 0;
        for (int i = 0; i < 26; i++) {
            if (pCount[i] == sCount[i]) matches++;
        }

        int left = 0;
        for (int right = p.Length; right < s.Length; right++) {
            if (matches == 26) {
                result.Add(left);
            }

            int rIdx = s[right] - 'a';
            sCount[rIdx]++;
            if (sCount[rIdx] == pCount[rIdx]) matches++;
            else if (sCount[rIdx] == pCount[rIdx] + 1) matches--;

            int lIdx = s[left] - 'a';
            sCount[lIdx]--;
            if (sCount[lIdx] == pCount[lIdx]) matches++;
            else if (sCount[lIdx] == pCount[lIdx] - 1) matches--;

            left++;
        }

        // Check final window
        if (matches == 26) {
            result.Add(left);
        }

        return result;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ where $N = \text{s.Length}$.
- **Space Complexity:** $O(1)$ auxiliary space.

---

### Problem 3: LeetCode 76 — Minimum Window Substring (Hard - Foundational Pattern)

> Given two strings `s` and `t` of lengths `m` and `n` respectively, return the **minimum window substring** of `s` such that every character in `t` (**including duplicates**) is included in the window. If there is no such substring, return the empty string `""`.

#### The Deficit Vector Mental Walkthrough:
`s = "ADOBECODEBANC"`, `t = "ABC"`

1. `need` initialized: `need['A'] = 1, need['B'] = 1, need['C'] = 1`. Other characters = 0.
2. `missing = 3`.
3. Expand `right`:
   - `s[0] = 'A'`: `need['A'] > 0` $\to$ `missing--` (2). `need['A'] = 0`.
   - `s[1] = 'D'`: `need['D'] <= 0` $\to$ `missing` unchanged. `need['D'] = -1`.
   - `s[2] = 'O'`: `need['O'] = -1`.
   - `s[3] = 'B'`: `need['B'] > 0` $\to$ `missing--` (1). `need['B'] = 0`.
   - `s[4] = 'E'`: `need['E'] = -1`.
   - `s[5] = 'C'`: `need['C'] > 0` $\to$ `missing--` (0). `need['C'] = 0`.
4. `missing == 0`! Window `"ADOBEC"` contains all of $T$!
   - Now contract `left`:
     - `s[0] = 'A'`: `need['A'] == 0` $\to$ cannot drop without losing required character!
     - Window `[0 .. 5]` length = 6. Best so far = `"ADOBEC"`.
     - Drop `'A'`: `need['A']++` (1), `missing++` (1), `left = 1`.
5. Continue expanding `right` until `'A'` is found again at index 10, then contract left past garbage characters `'D'`, `'O'`, `'B'`, `'E'`, `'C'`, `'O'`, `'D'`, `'E'` until reaching optimal window `"BANC"` of length 4.

#### Production C# Implementation:
```csharp
public class SolutionMinWindow {
    public string MinWindow(string s, string t) {
        if (string.IsNullOrEmpty(s) || string.IsNullOrEmpty(t) || s.Length < t.Length) {
            return string.Empty;
        }

        // ASCII table for required characters deficit
        int[] need = new int[128];
        for (int i = 0; i < t.Length; i++) {
            need[t[i]]++;
        }

        int missing = t.Length;
        int left = 0;
        int minLen = int.MaxValue;
        int startIdx = 0;

        for (int right = 0; right < s.Length; right++) {
            char rChar = s[right];
            
            // If this character was needed, decrement deficit
            if (need[rChar] > 0) {
                missing--;
            }
            need[rChar]--;

            // When all characters are satisfied, contract from left
            while (missing == 0) {
                int currentLen = right - left + 1;
                if (currentLen < minLen) {
                    minLen = currentLen;
                    startIdx = left;
                }

                char lChar = s[left];
                need[lChar]++;
                // If dropping this character makes us deficit again
                if (need[lChar] > 0) {
                    missing++;
                }
                left++;
            }
        }

        return (minLen == int.MaxValue) ? string.Empty : s.Substring(startIdx, minLen);
    }
}
```

#### Complexity:
- **Time Complexity:** $O(M + N)$ where $M = \text{s.Length}, N = \text{t.Length}$. Each character is visited at most twice.
- **Space Complexity:** $O(1)$ — fixed 128-element integer lookup array.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Solve these in sequence to conquer frequency tracking:

### Problem 1 (Fixed Permutation Window): LeetCode 567 — Permutation in String (Medium)
- **Goal:** Determine if `s2` contains permutation of `s1`.
- **Key Insight:** Fixed window size $K = \text{s1.Length}$ with $O(1)$ `matches` counter.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 2 (All Permutations): LeetCode 438 — Find All Anagrams in a String (Medium)
- **Goal:** Collect all starting indices where anagram occurs.
- **Key Insight:** Same as LC 567, appending `left` whenever `matches == 26`.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 3 (The Crown Jewel): LeetCode 76 — Minimum Window Substring (Hard)
- **Goal:** Shortest substring of `s` covering multiset `t`.
- **Key Insight:** Single `need[128]` array with negative excess and `missing` deficit counter.
- **Target Complexity:** $O(M + N)$ time, $O(1)$ space.

---

## 4. 🔗 CONNECT: Complete Week 2 Traversal Synthesis

```
Prefix Sums & Sliding Window Mastery Map:
  ├─ Static Subarray Sum Queries (Q times)      ──► 1D Prefix Sum (Day 8)
  ├─ Subarray Sum == K with Negative Numbers    ──► Prefix Sum + Hash Map (Day 9)
  ├─ Submatrix Sum Queries in 2D                ──► 2D Prefix Sum & Inclusion-Exclusion (Day 10)
  ├─ Fixed Window Optimization (Length K)       ──► Fixed-Size Window (Day 11)
  ├─ Longest/Shortest Monotonic Subarray        ──► Variable-Size Window (Day 12)
  └─ Multiset / Substring Character Matching    ──► Window + Frequency Map / Deficit Counter (Day 13)
```

---

## 5. 🎯 Day 13 Checkpoint Questions

Test your deep understanding of frequency counters:

1. **Match Counter Transition:** In LeetCode 567, if `s1Count['a'] = 2` and `s2Count['a']` increases from 2 to 3 upon element entry, why does `matches` *decrement* (`matches--`)?
2. **Negative Deficit Semantics:** In LeetCode 76, what does it mean when `need['D'] = -2`? Why is it safe to shrink past `'D'` without incrementing `missing`?
3. **Substring Allocation Optimization:** Why do we track `startIdx` and `minLen` as integers during the loop and call `s.Substring(startIdx, minLen)` only *once* at return, rather than calling `s.Substring(...)` inside the loop?
