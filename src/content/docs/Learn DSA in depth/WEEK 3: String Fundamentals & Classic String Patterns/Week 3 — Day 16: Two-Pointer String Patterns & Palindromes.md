---
title: "Week 3 — Day 16: Two-Pointer String Patterns & Palindromes"
---

Welcome to Day 16! Today we explore **Two-Pointer String Patterns and Palindromic Symmetry**.

Palindromes are among the most frequently tested concepts in technical interviews because they reveal whether a candidate can effectively coordinate pointers in two opposing directions: **Outside-In (Converging / Verification)** and **Inside-Out (Expanding / Discovery)**.

---

## 1. 🧠 TEACH: The Mechanics of Palindromic Symmetry

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* Palindromic patterns exploit reflectional symmetry across a center: a string is a palindrome if $s[i] == s[N - 1 - i]$ for all $i$.
  - *Core Invariants:* Symmetry Invariant: $s[L] == s[R]$; Center Expansion Invariant: A string of length $N$ contains exactly $2N - 1$ possible palindrome centers ($N$ single-character odd centers, $N - 1$ between-character even centers).
  - *Misconception Check:* Finding the longest palindromic substring does *not* require $O(N^3)$ brute-force substring generation and testing; expanding outward from all $2N-1$ centers takes $O(N^2)$ time with strictly $O(1)$ auxiliary space.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates $O(N^3)$ substring extraction and $O(N^2)$ auxiliary space of dynamic programming tables.
  - *Complexity Advantage:* Center expansion achieves $O(N^2)$ time with strictly $O(1)$ space, avoiding large 2D boolean matrices.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Valid Palindrome" (LC 125), "Valid Palindrome II" (LC 680 — at most one deletion), "Longest Palindromic Substring" (LC 5). Signal words: "reads the same forward and backward", "palindrome", "expand around center".
  - *When to Avoid / Failure Modes:* When string length is $N \ge 10^5$, where $O(N^2)$ center expansion TLEs (requires Manacher's Algorithm for $O(N)$ linear time).
- **4. WHERE:**
  - *Physical CLR Memory:* Stack registers for `left` and `right` pointer indices; `char.IsLetterOrDigit` and `char.ToLowerInvariant` for ASCII character normalization.
  - *Production Systems:* DNA bioinformatics reverse complement palindrome identification, computational linguistics morphology parsing.
- **5. WHO:**
  - *Spoken Script:* "For palindrome verification, I use opposite-ends two pointers skipping non-alphanumeric characters. For finding palindromic substrings, I expand outwards from each of the $2N-1$ possible centers in $O(1)$ auxiliary space, eliminating the need for an $O(N^2)$ dynamic programming table."
  - *Interviewer Evaluation Lens:* Checks handling of both odd and even palindrome centers, character normalization, and branching logic when 1 deletion is permitted (Valid Palindrome II).
- **6. HOW:**
  - *Cost Model:* Verification: $O(N)$ time, $O(1)$ space; Center Expansion: $O(N^2)$ time, $O(1)$ auxiliary space.
  - *State Transition Trace (Center Expansion):* `s="babad" -> Center i=1 ('a'): expand L=0 ('b'), R=2 ('b') => match "bab" (len 3) -> L=-1 stop. Max len = 3`.


### 1.1 Physical Mental Model: The Folding Paper Strip & The Acoustic Canyon Echo

Palindrome verification and discovery are grounded in two opposing physical mechanics:

```
       ======================================================================
         PHYSICAL ANALOGY A: THE FOLDING PAPER STRIP (OUTSIDE-IN CALIPER)
       ======================================================================

       Take a long strip of printed paper and fold it in half:
       
       [ Left Jaw ] ------------------>            <------------------ [ Right Jaw ]
       [ 'r' ]   [ 'a' ]   [ 'c' ]   [ 'e' ]   [ 'c' ]   [ 'a' ]   [ 'r' ]
       
       Jaws march inward in lockstep:
       1. Check: Does paper left match paper right? ('r' == 'r') -> YES!
       2. Squeeze: left++, right--. ('a' == 'a') -> YES!
       
       ALLOCATION-FREE IN-FLIGHT FILTERING:
       If s[left] is a comma or space (non-alphanumeric), Jaw L simply glides past it!
       Zero new strings allocated! Pure in-place verification in O(1) space!
```

```
       ======================================================================
         PHYSICAL ANALOGY B: THE ACOUSTIC CANYON ECHO (INSIDE-OUT EXPANSION)
       ======================================================================

       Stand at an epicenter and shout outward in both directions:
       
       Odd Center (Standing on a rock):
                  <--- Sound Wave               Sound Wave --->
       [ 'r' ] <====== [ 'a' ] <===== [ 'd' ] =====> [ 'a' ] ======> [ 'r' ]
                                         ^
                                   Epicenter (odd)
       
       Even Center (Standing in the valley between two rocks):
                  <--- Sound Wave               Sound Wave --->
       [ 'a' ] <====== [ 'b' ] <===== (gap) =====> [ 'b' ] ======> [ 'a' ]
                                         ^
                                   Epicenter (even)
       
       Total Epicenters in String of Length N = N (rocks) + N-1 (gaps) = 2N - 1!
```

---

### 1.2 The Two Opposing Pointer Paradigms

```
Pattern 1: Outside-In (Converging)          Pattern 2: Inside-Out (Expanding)
Used for: VERIFICATION                      Used for: DISCOVERY / SEARCH
Left at 0, Right at N-1                     Start at Center, Expand Outward

   left ──►            ◄── right                     ◄── left    right ──►
 [  r   a   d   a   r  ]                          [  r   a   d   a   r  ]
    ▲               ▲                                        ▲
 Check: s[left] == s[right]                           Center = 'd' (odd)
 Then: left++, right--                                Expand: 'a'=='a', 'r'=='r'
```

| Direction | Pointer Setup | Primary Use Case | Classic Problem |
| :--- | :--- | :--- | :--- |
| **Outside-In** | `left = 0, right = n - 1` | Verification, skipping invalid chars, tolerance deletions | LeetCode 125, LeetCode 680 |
| **Inside-Out** | `left = center, right = center (+ 1)` | Finding longest palindrome, counting palindromes | LeetCode 5, LeetCode 647 |

---

### 1.2 Why There Are Exactly $2N - 1$ Palindrome Centers

A common interview question: *"How many candidate centers exist in a string of length $N$?"*

Every palindrome is either **odd length** or **even length**:
1. **Odd-length palindromes** (e.g. `"racecar"`, `"aba"`):
   The mirror axis passes directly through a single character. There are **$N$** possible single-character centers:
   $$(0, 0), (1, 1), (2, 2), \dots, (N-1, N-1)$$
2. **Even-length palindromes** (e.g. `"noon"`, `"abba"`):
   The mirror axis passes through the gap between two adjacent characters. There are **$N - 1$** possible between-character centers:
   $$(0, 1), (1, 2), (2, 3), \dots, (N-2, N-1)$$

$$\text{Total Candidate Centers} = N + (N - 1) = \mathbf{2N - 1}$$

---

### 1.3 Allocation-Free In-Flight Sanitization

A common candidate mistake in LeetCode 125 is allocating intermediate strings:
```csharp
// ⚠️ ANTI-PATTERN: Allocates multiple large heap strings!
string cleaned = Regex.Replace(s, @"[^a-zA-Z0-9]", "").ToLower();
```
- For $N = 10^5$, regex compilation and string creation allocate hundreds of kilobytes on the heap.
- **The Optimal Interview Idiom:** Skip non-alphanumeric characters *in-flight* using two pointers with `char.IsLetterOrDigit` and `char.ToLowerInvariant`:
  - **Zero heap allocations.**
  - **$O(1)$ auxiliary memory.**

---

### 1.4 The Single-Branch Deletion Invariant (LeetCode 680)

When allowed at most **one deletion**:
- Converge `left` and `right` inward while `s[left] == s[right]`.
- The moment a mismatch occurs (`s[left] != s[right]`), you have exactly two choices:
  1. Delete `s[left]` and verify if the remaining substring `[left + 1 .. right]` is a palindrome, OR
  2. Delete `s[right]` and verify if the remaining substring `[left .. right - 1]` is a palindrome.

```
       left               right
        ▼                   ▼
     [ 'a' , 'b' , 'c' , 'a' ]
Mismatch! Can delete 'b' (check "c") OR delete 'c' (check "b").
```

Because at most 1 deletion is permitted, we branch **at most once**. Each branch is a simple linear scan $\implies O(N) + O(N) = \mathbf{O(N)}$ total time!

---

### 1.5 ⚙️ Core Operations Deep-Dive: Two-Pointer String Palindromic Reflection & Center Expansion

#### Dimension 1: Operation Contract & Big-O Bounds

##### Palindromic Primitives (`IsPalindrome`, `ValidPalindromeII`, `ExpandAroundCenter`)
- **Signatures:**
  - `public bool IsPalindrome(string s)`: Inward convergence with in-place alphanumeric filtering in $\Theta(N)$ time and $O(1)$ auxiliary space.
  - `public bool ValidPalindrome(string s)`: Single-branch fault-tolerant verification in $O(N)$ time and $O(1)$ space.
  - `public (int left, int right) ExpandAroundCenter(string s, int l, int r)`: Outward symmetry expansion in $O(K)$ time where $K$ is palindrome span.
- **Preconditions:**
  - String reference is non-null ($N \ge 0$).
  - Character comparisons performed under invariant culture case-insensitivity.
- **Postconditions:**
  - Validates symmetry without allocating cleansed strings or allocating string reverses on heap.
  - Outward expansion returns maximal symmetric interval $[L \dots R]$.
- **Complexity Bounds:**

| Strategy | Time Complexity | Auxiliary Space | Heap Allocations | Max Input Size $N$ |
| :--- | :--- | :--- | :--- | :--- |
| **Inward Two-Pointer (In-Place)** | **$\Theta(N)$** | **$O(1)$** | **Zero** | $10^7+$ |
| **Cleanse + Reverse String Copy** | $O(N)$ | $O(N)$ | 2 Full String Allocations | Limited by GC heap |
| **Center Expansion (All Centers)** | $O(N^2)$ worst / $O(N)$ avg | $O(1)$ | Zero | $10^4$ |
| **Manacher's Algorithm** | $O(N)$ linear | $O(N)$ | Fixed transformed char array | $10^6$ |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
             Two-Pointer Palindrome Verification Logic
                                 │
                   [Init: left = 0, right = N - 1]
                                 │
                         [left < right?]
                    ┌────────────┴────────────┐
                    ▼                         ▼
                   YES                        NO ──► [Return TRUE]
                    │
      [s[left] alphanumeric?]
         ┌──────────┴──────────┐
         NO                   YES
         │                     │
    [left++]        [s[right] alphanumeric?]
         │             ┌───────┴───────┐
         │             NO             YES
         │             │               │
         │         [right--]    [ToLower(s[left]) ==
         │             │         ToLower(s[right])?]
         │             │          ┌────┴────┐
         │             │         YES        NO
         │             │          │          │
         │             │     [left++,     [Return FALSE]
         │             │      right--]
         └─────────────┼──────────┘
                       │
                       ▼
                 (Next Iteration)
```

```
          Fault-Tolerant Deletion Logic (LeetCode 680)
                               │
               [Converge inward: left++, right--]
                               │
                      [s[left] != s[right]]
                               │
             ┌─────────────────┴─────────────────┐
             ▼                                   ▼
    [Branch 1: Delete s[left]]         [Branch 2: Delete s[right]]
    [Check IsPalindrome(L+1, R)]        [Check IsPalindrome(L, R-1)]
             │                                   │
             └─────────────────┬─────────────────┘
                               ▼
        [Return Branch1 == true || Branch2 == true]
```

---

#### Dimension 3: Visual ASCII State Transitions

##### 1. Inward Symmetric Reflection with Noise Filtering
```
String: "R3#c e- C a r"

L=0 ('R'), R=12 ('r') ──► Alphanumeric Match! ('r' == 'r') -> L=1, R=11
L=1 ('3'), R=11 ('a') ──► Mismatch ('3' != 'a') -> return FALSE!

String: "A man, a plan, a canal: Panama"
Step 1:  L=0 ('A'), R=29 ('a') ──► Match! -> L=1, R=28
Step 2:  L=1 (' ') ──────────────► Non-alphanumeric -> Skip: L=2 ('m')
Step 3:  L=2 ('m'), R=28 ('m') ──► Match! -> L=3, R=27
Step 4:  ...
Step 14: L=14 ('p'), R=15 ('p') ──► Central collision! Return TRUE.
```

##### 2. Parity Center Expansion Traversal ($2N - 1$ Centers)
```
Indices:   0   1   2   3   4
Chars:     b   a   b   a   d

Center 0 (Odd: 'b'):   [b]                       len = 1
Center 1 (Even: gap):  b | a                     len = 0
Center 2 (Odd: 'a'):   b [a] b  ──► "bab"         len = 3
Center 3 (Even: gap):  a | b                     len = 0
Center 4 (Odd: 'b'):   a [b] a  ──► "aba"         len = 3
...
Total centers checked: 5 odd + 4 even = 9 centers.
```

---

#### Dimension 4: Invariant Preservation Proof

##### 1. Two-Pointer Inward Invariant:
- **Loop Invariant:** At the start of each iteration with active indices `left` and `right`, the cleansed prefix before `left` is the exact reverse of the cleansed suffix after `right`.
- **Base Case:** At start ($left = 0, right = N - 1$), both cleansed prefix and suffix are empty strings $\epsilon = \text{reverse}(\epsilon)$. Invariant holds trivially.
- **Inductive Step:**
  - Non-alphanumeric characters are discarded by pointer increments/decrements without altering the semantic cleansed string.
  - When valid alphanumerics are reached at `left` and `right`:
    - If `ToLower(s[left]) != ToLower(s[right])`, the mirror property is violated. The string cannot be a palindrome. Returning `false` is correct.
    - If `ToLower(s[left]) == ToLower(s[right])`, the matching character pair is appended to prefix and suffix respectively, maintaining prefix $=$ reverse(suffix).
    - Indices advance to `left + 1` and `right - 1`.
- **Termination:** When `left >= right`, all alphanumeric characters have been verified pairwise, with at most one central odd element remaining (which is trivially symmetric with itself). String is proven palindromic. $\blacksquare$

##### 2. Single-Deletion Disjunction Completeness:
- Let mismatch occur at $(L, R)$ where $s[L] \ne s[R]$.
- Any valid palindrome with $\le 1$ deletion must either:
  1. Omit index $L$, requiring substring $s[L+1 \dots R]$ to be palindromic.
  2. Omit index $R$, requiring substring $s[L \dots R-1]$ to be palindromic.
- Retaining both $s[L]$ and $s[R]$ is impossible because $s[L] \ne s[R]$.
- Because at most 1 deletion is allowed, no further deletions can occur inside the recursive calls. Hence, the disjunction $\text{Pal}(L+1, R) \lor \text{Pal}(L, R-1)$ is both necessary and sufficient. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Scenario | Concrete Input | Danger / Failure Mode | Invariant Protection Mechanism |
| :--- | :--- | :--- | :--- |
| **All Non-Alphanumeric Chars** | `s = ".,;: !?"` | Pointer crossover / IndexOutOfRangeException | Bounds guard in inner skips: `while (left < right && !char.IsLetterOrDigit(...))` prevents crossing. Terminates with `true`. |
| **Single Character String** | `s = "a"` | Loop condition fails immediately | `left = 0, right = 0`. Condition `0 < 0` is false. Exits cleanly, returns `true`. |
| **Even Length Palindrome** | `s = "abba"` | Pointers cross without landing on same center | Pointers evaluate $(0,3) \to (1,2) \to$ step to $L=2, R=1$. Terminating condition `left < right` correctly halts. |
| **Deletion at Boundary** | `s = "abca"` | Branching deletes wrong end | Evaluates branch 1 (`s[1..2]` = `"bc"`, false) and branch 2 (`s[0..1]` = `"ab"` false)... waits: for `"abca"`, deleting 'b' gives `"aca"` (true), deleting 'c' gives `"aba"` (true). Disjunction returns true. |
| **Already Perfect Palindrome** | `s = "radar"` | Deletion branch never fires | Mismatch condition never entered; returns `true` without branching. |

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 125 — Valid Palindrome (Easy)

> A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.
> Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.

#### Visual Trace:
`s = "A man, a plan, a canal: Panama"`

```
Initial: left = 0 ('A'), right = 29 ('a')
  s[0] is letter ('a'), s[29] is letter ('a') -> MATCH! left=1, right=28
left = 1 (' ' -> skip), left = 2 ('m')
right = 28 ('m') -> MATCH! left=3, right=27
left = 3 ('a'), right = 27 ('a') -> MATCH!
...
Pointers meet at index 14 ('p'). All alphanumeric characters mirrored perfectly.
Result: true. (Zero heap allocations!)
```

#### Production C# Implementation:
```csharp
public class SolutionIsPalindrome {
    public bool IsPalindrome(string s) {
        if (string.IsNullOrEmpty(s)) return true;

        int left = 0;
        int right = s.Length - 1;

        while (left < right) {
            // Skip non-alphanumeric from left
            while (left < right && !char.IsLetterOrDigit(s[left])) {
                left++;
            }

            // Skip non-alphanumeric from right
            while (left < right && !char.IsLetterOrDigit(s[right])) {
                right--;
            }

            // Case-insensitive character comparison
            if (char.ToLowerInvariant(s[left]) != char.ToLowerInvariant(s[right])) {
                return false;
            }

            left++;
            right--;
        }

        return true;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — single pass; each character is inspected at most twice.
- **Space Complexity:** $O(1)$ — zero heap allocations.

---

### Problem 2: LeetCode 680 — Valid Palindrome II (Easy)

> Given a string `s`, return `true` if the `s` can be palindrome after deleting **at most one** character from it.

#### Visual Trace:
`s = "abca"`

```
left = 0 ('a'), right = 3 ('a') -> Match! left=1, right=2
left = 1 ('b'), right = 2 ('c') -> MISMATCH!

Branch 1: Delete 'b' -> check range [2 .. 2] ("c") -> Palindrome! (true)
Branch 2: Delete 'c' -> check range [1 .. 1] ("b") -> Palindrome! (true)

Result = true || true = true.
```

#### Production C# Implementation:
```csharp
public class SolutionValidPalindromeII {
    public bool ValidPalindrome(string s) {
        int left = 0;
        int right = s.Length - 1;

        while (left < right) {
            if (s[left] != s[right]) {
                // Try deleting s[left] OR deleting s[right]
                return IsPalindromeRange(s, left + 1, right)
                    || IsPalindromeRange(s, left, right - 1);
            }
            left++;
            right--;
        }

        return true;
    }

    private static bool IsPalindromeRange(string s, int left, int right) {
        while (left < right) {
            if (s[left] != s[right]) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — at most $2N$ comparisons.
- **Space Complexity:** $O(1)$ auxiliary space.

---

### Problem 3: LeetCode 5 — Longest Palindromic Substring (Medium)

> Given a string `s`, return the *longest palindromic substring* in `s`.

#### Inside-Out Expansion Algorithm:
For each of the $2N - 1$ centers:
1. Expand odd palindrome around center `(i, i)`.
2. Expand even palindrome around center `(i, i + 1)`.
3. If the discovered palindrome length exceeds our best, record `startIdx = left + 1` and `maxLen`.

#### Visual Trace:
`s = "babad"`

```
Center i = 0 ('b'):
  odd (0, 0): "b" (len 1)
  even (0, 1): "ba" (not palindrome)
Center i = 1 ('a'):
  odd (1, 1): expand left=0('b'), right=2('b') -> "bab" (len 3)!
  even (1, 2): "ab" (not palindrome)
Center i = 2 ('b'):
  odd (2, 2): expand left=1('a'), right=3('a') -> "aba" (len 3)
  even (2, 3): "ba" (not palindrome)
...
Best length = 3 ("bab" or "aba").
```

#### Production C# Implementation:
```csharp
public class SolutionLongestPalindrome {
    public string LongestPalindrome(string s) {
        if (string.IsNullOrEmpty(s)) return string.Empty;

        int startIdx = 0;
        int maxLen = 0;

        for (int i = 0; i < s.Length; i++) {
            // Case 1: Odd-length palindrome (center is s[i])
            ExpandAroundCenter(s, i, i, ref startIdx, ref maxLen);

            // Case 2: Even-length palindrome (center is between s[i] and s[i+1])
            ExpandAroundCenter(s, i, i + 1, ref startIdx, ref maxLen);
        }

        return s.Substring(startIdx, maxLen);
    }

    private static void ExpandAroundCenter(string s, int left, int right,
                                           ref int startIdx, ref int maxLen) {
        while (left >= 0 && right < s.Length && s[left] == s[right]) {
            left--;
            right++;
        }

        // Loop terminated when s[left] != s[right] or boundaries exceeded
        // Valid palindrome is s[left + 1 .. right - 1]
        int currentLen = right - left - 1;
        if (currentLen > maxLen) {
            maxLen = currentLen;
            startIdx = left + 1;
        }
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N^2)$ — $2N - 1$ centers, each expands at most $O(N)$.
- **Space Complexity:** $O(1)$ auxiliary space (vastly superior to the $O(N^2)$ space required by 2D Dynamic Programming).

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Solve these to master both palindromic directions:

### Problem 1 (Converging Verification): LeetCode 125 — Valid Palindrome (Easy)
- **Goal:** Verify palindrome ignoring case and non-alphanumeric.
- **Key Insight:** Outside-in pointers with in-flight skipping; zero allocations.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 2 (Tolerance Deletion): LeetCode 680 — Valid Palindrome II (Easy)
- **Goal:** Verify palindrome with at most 1 deletion.
- **Key Insight:** Single branch on first mismatch: `[left+1 .. right]` or `[left .. right-1]`.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 3 (Center Expansion): LeetCode 5 — Longest Palindromic Substring (Medium)
- **Goal:** Find longest palindrome in $O(1)$ auxiliary memory.
- **Key Insight:** Expand outward from all $2N - 1$ centers.
- **Target Complexity:** $O(N^2)$ time, $O(1)$ auxiliary space.

### Bonus / Extension Challenge: LeetCode 647 — Palindromic Substrings (Medium)
- **Goal:** Count total palindromic substrings in `s`.
- **Hint:** Uses the identical $2N - 1$ center expansion as LC 5! Simply increment a `count` on every valid expansion step.

---

## 4. 🔗 CONNECT: Palindromes vs. Opposite-Ends Arrays

Notice the deep connection between Day 3 and Day 16:

```
Opposite-Ends Array (Day 3):
  nums[left] + nums[right] compared to target
  Pointers move conditionally based on sum.

Outside-In String (Day 16):
  s[left] compared to s[right]
  Pointers move conditionally to skip noise or test symmetry.
  Exact same 2-pointer convergence mechanics!
```

---

## 5. 🎯 Day 16 Checkpoint Questions

Verify your palindromic mechanics:

1. **Center Counting:** Why are there $2N - 1$ possible palindrome centers in a string of length $N$? How many correspond to odd lengths, and how many to even lengths?
2. **Bounds Arithmetic:** In `ExpandAroundCenter`, when the `while` loop finishes, the indices are `left` and `right`. Why is the length of the valid palindrome calculated as `right - left - 1`, and why does it start at `left + 1`?
3. **Branching Limit:** In LeetCode 680, why are we guaranteed that at most **one** mismatch branch will ever be needed? What would happen to time complexity if $K$ deletions were allowed?
