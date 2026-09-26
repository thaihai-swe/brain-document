---
title: "Week 3 — Day 16: Two-Pointer String Patterns & Palindromes"
---

# 🚀 Week 3 — Day 16: Two-Pointer String Patterns & Palindromes

Welcome to Day 16! Today we explore **Two-Pointer String Patterns and Palindromic Symmetry**.

Palindromes are among the most frequently tested concepts in technical interviews because they reveal whether a candidate can effectively coordinate pointers in two opposing directions: **Outside-In (Converging / Verification)** and **Inside-Out (Expanding / Discovery)**.

---

## 1. 🧠 TEACH: The Mechanics of Palindromic Symmetry

### 1.1 The Two Opposing Pointer Paradigms

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
