---
title: "Week 2 — Day 13: Sliding Window with Frequency Map & Match Counters"
---

Welcome to Day 13! Today we tackle the most sophisticated variant of the sliding window technique: **Sliding Window with Frequency Maps and Match Counters**.

This pattern governs classic Big Tech interview problems involving anagrams, string permutations, and the crown jewel of sliding window questions: **LeetCode 76 (Minimum Window Substring)**.

---

## 1. 🧠 TEACH: The Mechanics of State Tracking

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* The **Sliding Window with Frequency Map & Match Counters** tracks multi-character frequency constraints simultaneously using a single scalar `matchedCount`.
  - *Core Invariants:* Scalar Match Invariant: `matchedCount` equals the number of distinct characters whose current frequency matches their exact required target frequency; Full Validity: Window is a valid match if and only if `matchedCount == requiredDistinctCount`.
  - *Misconception Check:* Do *not* compare the entire frequency array of size 26 or 128 on every single pointer advance ($O(26 \times N)$); updating `matchedCount` only when an individual count reaches or departs from target achieves strict $O(1)$ state updates.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(|\Sigma|)$ per-step dictionary/array comparison overhead.
  - *Complexity Advantage:* Reduces window validation cost from $O(|\Sigma|)$ to strict $O(1)$ per step, yielding $O(N)$ overall time.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Permutation in string" (LC 567), "find all anagrams in a string" (LC 438), "minimum window substring" (LC 76). Signal words: "contains permutation", "anagram substring", "minimum window containing all characters".
  - *When to Avoid / Failure Modes:* When character order within the window matters (anagrams/permutations disregard order; exact sequence matching requires KMP or Rabin-Karp).
- **4. WHERE:**
  - *Physical CLR Memory:* Stack-allocated fixed-size integer arrays (`int[128]` or `stackalloc int[26]`) avoiding heap GC allocations completely.
  - *Production Systems:* Intrusion detection regex pattern filters, genomic DNA sequence motif search, real-time packet payload signature matching.
- **5. WHO:**
  - *Spoken Script:* "To verify anagram or substring matches in $O(1)$ per step without scanning the entire frequency table, I track a single scalar `matchedCount`. When adding or removing a character, I only update `matchedCount` when that specific character's count enters or leaves its exact target frequency."
  - *Interviewer Evaluation Lens:* Checks whether candidate uses a scalar match counter vs. re-iterating the frequency table, handling of characters with count exceeding requirement, and contraction condition.
- **6. HOW:**
  - *Cost Model:* Time: $O(N)$ linear time; Space: $O(1)$ auxiliary space (fixed ASCII/alphabet size).
  - *State Transition Trace:* `s="cbaebabacd", p="abc" -> need={'a':1,'b':1,'c':1}, required=3 -> R adds 'c','b','a': matched=3 (Found index 0!) -> R adds 'e': matched stays 3, but window invalid -> contract L`.


### 1.1 Physical Mental Model: The Grocery Shopping Cart & The 26-Bulb Lightboard

Maintaining substring anagrams and minimum windows without rescanning frequency tables is best visualized as a shopping cart equipped with a dashboard of indicator bulbs:

```
       ======================================================================
         PHYSICAL ANALOGY: GROCERY CART & THE DASHBOARD LIGHTBULBS
       ======================================================================

       Target Recipe: Need [ 'a': 1, 'b': 2, 'c': 1 ]
       
       DASHBOARD INDICATOR LIGHTS (One bulb per unique letter):
       [ Light A ]     [ Light B ]     [ Light C ]      ===> matchCount = 0 / 3
         (Off)           (Off)           (Off)
       
       STEP 1: Toss 'b' into cart:
       - Count of 'b' goes from 0 -> 1 (Still need 1 more). Light B stays OFF.
       
       STEP 2: Toss another 'b' into cart:
       - Count of 'b' goes from 1 -> 2 (EXACT MATCH!). Light B clicks ON!
       - matchCount increments: 0 -> 1!
       
       STEP 3: Toss a 3rd 'b' into cart:
       - Count of 'b' goes from 2 -> 3 (TOO MANY!). Light B clicks OFF!
       - matchCount decrements: 1 -> 0!

       💡 THE O(1) VERIFICATION PRINCIPLE:
       The cashier NEVER inspects all items in the cart!
       The cashier checks a single master dial: `matchCount == required`!
       Every item added or removed only toggles ONE bulb in O(1) time!
```

```
       ======================================================================
           FREQUENCY ARRAY & REGISTER RUNTIME LAYOUT
       ======================================================================

       Stack Frame:
       [ matchCount: 3 ]  [ requiredCount: 3 ]  [ left: 0 ]  [ right: 2 ]
              |
              v
       Heap / L1 Cache (Direct-Mapped int[26] Buffer):
       Index:   ['a'-'a']   ['b'-'a']   ['c'-'a']   ...   ['z'-'a']
       Window: [    1    |     1     |     1     |  0  |   ...   ]
       Target: [    1    |     1     |     1     |  0  |   ...   ]
       Status:  [ MATCH ]   [ MATCH ]   [ MATCH ]
```

---

### 1.2 The Bottleneck: Comparing Frequency Maps in $O(|\Sigma|)$

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

### 1.4 ⚙️ Core Operations Deep-Dive: Character Frequency Hash Matching & Exact Counter State Transitions

#### Dimension 1: Operation Contract & Big-O Bounds

##### Match Counter & Multi-Set Primitives (`CheckInclusion`, `FindAnagrams`, `MinWindow`, `UpdateMatchScalar`)
- **Signatures:**
  - `public bool CheckInclusion(string s1, string s2)`: Determines if $s2$ contains a substring identical in multi-set frequency to $s1$ in $\Theta(N)$ time and $O(1)$ space.
  - `public IList<int> FindAnagrams(string s, string p)`: Locates all starting indices of $p$'s anagrams within $s$ in $\Theta(N)$ time.
  - `private void UpdateMatchScalar(int charCode, int delta, int[] current, int[] target, ref int matches)`: Mutates frequency table and maintains exact match indicator in $O(1)$ strict time.
- **Preconditions:**
  - Characters belong to fixed finite alphabet $\Sigma$ (e.g., ASCII 128 or English lowercase 26).
  - Multi-set counts bounded by input string lengths ($0 \le count \le N$).
- **Postconditions:**
  - Maintains scalar invariant `matches == |Sigma|` if and only if current window multi-set is identical to target multi-set.
  - Requires zero loop iterations over alphabet $\Sigma$ during sliding window shift.
- **Complexity Bounds:**

| Implementation Paradigm | Time per Slide Shift | Equality Check Cost | Auxiliary Space | Overhead Factor |
| :--- | :--- | :--- | :--- | :--- |
| **Scalar Match Counter (`matches == 26`)** | **$O(1)$** | **$O(1)$ integer compare** | $O(|\Sigma|) \to 26 \text{ ints}$ | Optimal (Zero looping) |
| **Array Vector Equality (`SequenceEqual`)** | $O(1)$ | $O(|\Sigma|) \to 26 \text{ ops}$ | $O(|\Sigma|)$ | $26\times$ higher CPU cycles |
| **Hash Table (`Dictionary<char, int>`)** | $O(1)$ amortized | $O(|\Sigma|)$ key lookups | $O(|\Sigma|)$ heap objects | Hash collisions + Boxing overhead |
| **Subsegment Re-Sort (`String.Concat`)** | $O(K \log K)$ | $O(K)$ string compare | $O(K)$ string allocations | Disastrous GC thrashing |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
          Exact Match Scalar State Transition Logic
                              │
              [Event: Character c mutates by delta (+1 or -1)]
                              │
              [Let targetCount = target[c]
                   oldCount    = current[c]
                   newCount    = oldCount + delta]
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
       [delta == +1 (Enter)]         [delta == -1 (Exit)]
               │                             │
       ┌───────┴───────┐             ┌───────┴───────┐
       ▼               ▼             ▼               ▼
[newCount ==    [oldCount ==   [newCount ==    [oldCount ==
 targetCount]    targetCount]   targetCount]    targetCount]
       │               │             │               │
      YES             YES           YES             YES
       │               │             │               │
  [matches++]     [matches--]   [matches++]     [matches--]
  (Achieved match)(Lost exact   (Returned to    (Fell below
                   match: excess)match from excess) required count)
       │               │             │               │
       └───────┬───────┘             └───────┬───────┘
               │                             │
               └──────────────┬──────────────┘
                              ▼
                 [Apply current[c] = newCount]
                              │
                              ▼
                   [Check: matches == 26?]
               ┌──────────────┴──────────────┐
               ▼                             ▼
              YES                            NO
               │                             │
        [Window Valid!]             [Advance Window]
```

---

#### Dimension 3: Visual ASCII State Transitions

##### Scalar Transition Trace over Alphabet $\Sigma = \{a, b\}$ with Target `[a:1, b:1]` (Required Matches = 2)
```
Initial: s1Count = [a:1, b:1]. Window s2Count = [a:0, b:0].
Match Evaluation:
- 'a': 0 vs 1 (No match)
- 'b': 0 vs 1 (No match)
Initial matches = 0. Target = 2.

Step 1: 'a' enters window (delta = +1)
- oldCount = 0, newCount = 1
- newCount == target['a'] (1 == 1) ──► matches increments: 0 -> 1.
- State: s2Count = [a:1, b:0], matches = 1.

Step 2: 'a' enters window again (delta = +1) [Excess copy!]
- oldCount = 1, newCount = 2
- oldCount == target['a'] (1 == 1) ──► matches decrements: 1 -> 0.
- State: s2Count = [a:2, b:0], matches = 0.

Step 3: 'b' enters window (delta = +1)
- oldCount = 0, newCount = 1
- newCount == target['b'] (1 == 1) ──► matches increments: 0 -> 1.
- State: s2Count = [a:2, b:1], matches = 1.

Step 4: Left 'a' exits window (delta = -1) [Excess resolved!]
- oldCount = 2, newCount = 1
- newCount == target['a'] (1 == 1) ──► matches increments: 1 -> 2.
- State: s2Count = [a:1, b:1], matches = 2.
- Evaluation: matches == 2 (Target Met! Valid Permutation Found!)
```

---

#### Dimension 4: Invariant Preservation Proof

##### Theorem:
At any step $t$, the integer scalar `matches` satisfies:
$$matches = \sum_{c=0}^{25} \mathbf{1}[current[c] == target[c]]$$

##### Proof by Structural Induction over Window Mutations:
1. **Base Case:**
   - At initialization of the first window (length $K$), `matches` is computed by iterating $c = 0 \dots 25$ and testing equality directly. Invariant holds.
2. **Inductive Step (Incoming Character $c$, $+1$ mutation):**
   - Let $old = current[c]$, $new = old + 1$.
   - For all characters $j \ne c$, $current[j]$ remains unchanged; their indicator values $\mathbf{1}[current[j] == target[j]]$ are strictly constant.
   - For character $c$:
     - **Subcase 2.1 ($new == target[c]$):** $old = target[c] - 1$. The indicator changed from $0 \to 1$.
       The code executes `if (new == target[c]) matches++`, correctly updating the sum by $+1$.
     - **Subcase 2.2 ($old == target[c]$):** $new = target[c] + 1$. The indicator changed from $1 \to 0$.
       The code executes `else if (old == target[c]) matches--`, correctly updating the sum by $-1$.
     - **Subcase 2.3 ($old \ne target[c]$ and $new \ne target[c]$):** The indicator was $0$ and remains $0$. Neither branch triggers; `matches` is unmodified.
3. **Inductive Step (Outgoing Character $c$, $-1$ mutation):**
   - Symmetric logic applies to decrements. If $new == target[c]$ (returning from excess), `matches++`. If $old == target[c]$ (falling below target), `matches--`.
4. **Conclusion:**
   - The scalar `matches` is invariant-equivalent to an $O(|\Sigma|)$ full array comparison at every step, reducing multi-set verification to $O(1)$ amortized time. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Scenario | Concrete Input | Danger / Failure Mode | Invariant Protection Mechanism |
| :--- | :--- | :--- | :--- |
| **Pattern Longer than Search String** | `s1 = "abcd"`, `s2 = "ab"` | Substring of length $K$ cannot exist; index underflow | Early boundary check: `if (s1.Length > s2.Length) return false;` prevents invalid window initialization. |
| **Identical Single Character** | `s1 = "a"`, `s2 = "a"` | Loop bounds `for (right = s1.Length ...)` never executed | Initial check before loop: `if (matches == 26) return true;` captures match before sliding starts. |
| **All Identical Characters** | `s1 = "aaa"`, `s2 = "aaaa"` | High excess counts corrupting match scalar | Counter tracks transitions across the exact threshold only: excess beyond target does not repeatedly decrement `matches`. |
| **No Overlapping Alphabet** | `s1 = "abc"`, `s2 = "xyz"` | Spurious match trigger | Zero characters reach target counts; `matches` remains strictly bounded below 26. |
| **Case Sensitivity & ASCII Range** | Upper/lowercase inputs | IndexOutOfBounds on array of size 26 | Map explicitly: `int idx = c - 'a'`. For full ASCII, allocate array of size 128 or 256. |

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
