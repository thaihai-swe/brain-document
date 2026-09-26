---
title: "Week 3 — Day 20: Master Review, Pattern Cross-Mapping & Integration Challenges"
---

Welcome to Day 20! You have now completed the entire array and string curriculum across Weeks 1, 2, and 3.

Today is our **Grand Synthesis & Pattern Cross-Mapping Day**. Before the Week 1–3 Milestone Assessment (Mock Interview) tomorrow, we construct a unified decision architecture across all 12 core patterns, walk through three integration challenges combining multiple techniques, and provide your master code templates.

---

## 1. 🧠 TEACH: The Unified Pattern Decision Architecture

### 1.1 The 5-Second Diagnostic Flowchart

When you read any Array or String problem in an interview, trace this decision path:

```
                                    Array / String Problem
                                              │
      ┌───────────────────────────────────────┼───────────────────────────────────────┐
      ▼                                       ▼                                       ▼
PAIR / TRIPLET / SEARCH               CONTIGUOUS RANGE / SUBARRAY            TRANSFORMATION / PARSING
      │                                       │                                       │
      ├─ Sorted array?                        ├─ Static multiple queries?             ├─ Filter/Compact in-place?
      │  └─► Opposite-Ends Pointers           │  └─► 1D/2D Prefix Sum                 │  └─► Fast & Slow (Reader/Writer)
      │                                       │                                       │
      ├─ Palindrome symmetry?                 ├─ Target sum with negatives?           ├─ Reverse word sequence?
      │  ├─ Outside-In (Verification)         │  └─► Prefix Sum + Hash Map            │  └─► 3-Step In-Place Reversal
      │  └─ Inside-Out (Expansion)            │                                       │
      │                                       ├─ Monotonic min/max window?            ├─ Adjacent cancellation?
      └─ Sparse subsequence matching?         │  └─► Variable Sliding Window          │  └─► In-Place Stack Pointer
         ├─ Single pair: Greedy 2-pointer     │                                       │
         └─ Multi-target: Bucket Dispatch     └─ Fixed length K or Anagrams?          └─ Numeric parsing / Atoi?
                                                 └─► Fixed Window / Match Counter        └─► Pre-Multiplication Guard
```

---

### 1.2 The Master Decision Matrix (All 12 Patterns)

| # | Pattern Name | Trigger Signals | Key Invariant | Time | Space |
|:---:|:--- |:--- |:--- |:---:|:---:|
| **1** | **Opposite-Ends Pointers** | Sorted array, Two Sum II, Container With Water | Monotonicity: moving pointer shrinks search space predictably | $O(N)$ | $O(1)$ |
| **2** | **Reader & Writer Pointers** | In-place removal, Move Zeroes, Deduplication | `write <= read`; valid items in `[0 .. write - 1]` | $O(N)$ | $O(1)$ |
| **3** | **Array Reversal Trick** | Rotate array by $K$, Reverse Words | $(A^R B^R)^R = BA$ | $O(N)$ | $O(1)$ |
| **4** | **1D Prefix Sum** | Static immutable array, repeated range sums | $\text{Sum}(L \dots R) = P[R + 1] - P[L]$ ($N+1$ dummy) | $O(1)$ query | $O(N)$ |
| **5** | **Prefix Sum + Hash Map** | Subarray sum equals $K$ with **negative numbers** | $P[i-1] = P[j] - K$; count: `map[0]=1`, maxLen: `map[0]=-1` | $O(N)$ | $O(N)$ |
| **6** | **2D Prefix Sum** | Matrix subgrid range queries | Inclusion-Exclusion: $+ \text{BR} - \text{TR} - \text{BL} + \text{TL}$ | $O(1)$ query | $O(MN)$ |
| **7** | **Fixed-Size Window** | Exactly length $K$ given, maximum average | Delta update: $+ \text{nums}[r] - \text{nums}[r - K]$ | $O(N)$ | $O(1)$ |
| **8** | **Variable-Size Window** | Longest/shortest span, all non-negative | Monotonic accordion: expand `r`, shrink `l` | $O(N)$ | $O(1)$ |
| **9** | **Frequency Match Window** | Anagrams, Permutation in String, Min Window | Single `matches` counter or deficit vector `missing` | $O(N)$ | $O(1)$ |
| **10**| **Inside-Out Expansion** | Longest Palindromic Substring | Expand around $2N - 1$ centers (odd & even) | $O(N^2)$ | $O(1)$ |
| **11**| **Multi-Pointer Buckets** | $K$ words against 1 long text (Subsequences) | 26 waiting lists; stream text $S$ once | $O(\|S\| + \sum L)$ | $O(K)$ |
| **12**| **In-Place Stack Pointer** | Remove adjacent duplicates, nested collapses | Use input `char[]` with `write` as stack top | $O(N)$ | $O(1)$ |

---

## 2. 🎬 DEMONSTRATE: Integration Problems

---

### Problem 1: LeetCode 340 — Longest Substring with At Most K Distinct Characters (Medium)

> Given a string `s` and an integer `k`, return the *length of the longest substring of `s` that contains at most `k` distinct characters*.

#### Integration Points:
- Variable-Size Sliding Window (Template 1)
- Frequency Map tracking distinct keys
- Edge cases: $K = 0$ or $K \ge \text{distinct chars}$

#### Production C# Implementation:
```csharp
public class SolutionLengthOfLongestSubstringKDistinct {
    public int LengthOfLongestSubstringKDistinct(string s, int k) {
        if (string.IsNullOrEmpty(s) || k == 0) return 0;

        // ASCII frequency table
        int[] freq = new int[256];
        int distinctCount = 0;
        int left = 0;
        int maxLen = 0;

        for (int right = 0; right < s.Length; right++) {
            char rChar = s[right];
            if (freq[rChar] == 0) {
                distinctCount++;
            }
            freq[rChar]++;

            // When distinct characters exceed k, contract from left
            while (distinctCount > k) {
                char lChar = s[left];
                freq[lChar]--;
                if (freq[lChar] == 0) {
                    distinctCount--;
                }
                left++;
            }

            maxLen = Math.Max(maxLen, right - left + 1);
        }

        return maxLen;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — amortized linear scan.
- **Space Complexity:** $O(1)$ — fixed 256-element integer table.

---

### Problem 2: LeetCode 1047 — Remove All Adjacent Duplicates In String (Easy)

> You are given a string `s` consisting of lowercase English letters. A **duplicate removal** consists of choosing two adjacent and equal letters and removing them.
> We repeatedly make duplicate removals on `s` until we no longer can.
> Return *the final string after all such duplicate removals have been made*.

#### The Two-Pointer Stack Simulation (Zero Extra Memory):
While standard solutions use a `Stack<char>`, top candidates use `chars` as an **in-place stack** using a single integer `write`:
- `write` represents the size of the stack.
- Top of the stack is `chars[write - 1]`.
- If `write > 0 && chars[write - 1] == chars[read]`:
  **Pop:** `write--` (cancels adjacent duplicate!).
- Else:
  **Push:** `chars[write++] = chars[read]`.

#### Visual Trace:
`s = "abbaca"`

```
read = 0 ('a'): stack empty -> push 'a'. chars[0] = 'a', write = 1
read = 1 ('b'): top ('a') != 'b' -> push 'b'. chars[1] = 'b', write = 2
read = 2 ('b'): top ('b') == 'b' -> MATCH! POP! write = 1 (stack is now ['a'])
read = 3 ('a'): top ('a') == 'a' -> MATCH! POP! write = 0 (stack is empty)
read = 4 ('c'): stack empty -> push 'c'. chars[0] = 'c', write = 1
read = 5 ('a'): top ('c') != 'a' -> push 'a'. chars[1] = 'a', write = 2

Result: "ca" of length write = 2.
```

#### Production C# Implementation:
```csharp
public class SolutionRemoveDuplicates {
    public string RemoveDuplicates(string s) {
        char[] chars = s.ToCharArray();
        int write = 0; // In-place stack top pointer

        for (int read = 0; read < chars.Length; read++) {
            if (write > 0 && chars[write - 1] == chars[read]) {
                // Adjacent duplicate detected: pop from stack
                write--;
            } else {
                // Push to stack
                chars[write++] = chars[read];
            }
        }

        return new string(chars, 0, write);
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — single pass.
- **Space Complexity:** $O(N)$ for `char[]` buffer; $O(1)$ auxiliary memory (zero stack allocations).

---

### Problem 3: LeetCode 8 — String to Integer (atoi) (Medium)

> Implement the `myAtoi(string s)` function, which converts a string to a 32-bit signed integer.
> 1. Whitespace: Ignore leading spaces.
> 2. Signedness: Determine sign by checking if the next character is `'-'` or `'+'`.
> 3. Conversion: Read integer digits until non-digit is encountered.
> 4. Rounding: Clamp to $[-2^{31}, 2^{31} - 1]$ if overflow occurs.

#### The Pre-Multiplication Overflow Guard:
How do you test if `result * 10 + digit > int.MaxValue` **without triggering overflow**?
$$\text{result} > \frac{\text{int.MaxValue}}{10} \quad \text{OR} \quad \left(\text{result} == \frac{\text{int.MaxValue}}{10} \text{ and } \text{digit} > 7\right)$$
Because $2^{31} - 1 = 2,147,483,64\mathbf{7}$.

#### Production C# Implementation:
```csharp
public class SolutionMyAtoi {
    public int MyAtoi(string s) {
        if (string.IsNullOrEmpty(s)) return 0;

        int i = 0;
        int n = s.Length;

        // 1. Skip leading whitespace
        while (i < n && s[i] == ' ') i++;
        if (i == n) return 0;

        // 2. Check sign
        int sign = 1;
        if (s[i] == '-' || s[i] == '+') {
            sign = (s[i] == '-') ? -1 : 1;
            i++;
        }

        int result = 0;
        int threshold = int.MaxValue / 10;

        // 3. Read digits with overflow guard
        while (i < n && char.IsDigit(s[i])) {
            int digit = s[i] - '0';

            // Pre-multiplication overflow check
            if (result > threshold || (result == threshold && digit > 7)) {
                return (sign == 1) ? int.MaxValue : int.MinValue;
            }

            result = result * 10 + digit;
            i++;
        }

        return result * sign;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — single pass; early exits on non-digit.
- **Space Complexity:** $O(1)$ auxiliary space.

---

## 3. 🛠️ Master Code Template Sheet

### Template A: Subarray Sum Equals K (Prefix Sum + Hash Map)
```csharp
public int SubarraySum(int[] nums, int k) {
    int count = 0, runningSum = 0;
    var map = new Dictionary<int, int> { [0] = 1 };
    foreach (int x in nums) {
        runningSum += x;
        count += map.GetValueOrDefault(runningSum - k, 0);
        map[runningSum] = map.GetValueOrDefault(runningSum, 0) + 1;
    }
    return count;
}
```

### Template B: Variable Sliding Window (Dynamic Min/Max)
```csharp
public int MaxWindow(int[] nums, int k) {
    int left = 0, maxLen = 0;
    for (int right = 0; right < nums.Length; right++) {
        Add(nums[right]);
        while (IsInvalid()) { Remove(nums[left]); left++; }
        maxLen = Math.Max(maxLen, right - left + 1);
    }
    return maxLen;
}
```

### Template C: 2D Prefix Sum Query
```csharp
public int Query2D(int[,] P, int r1, int c1, int r2, int c2) =>
    P[r2 + 1, c2 + 1] - P[r1, c2 + 1] - P[r2 + 1, c1] + P[r1, c1];
```

---

## 4. 🏋️ PRACTICE: Day 20 Integration Challenges

1. **[LeetCode 340] Longest Substring with At Most K Distinct Characters (Medium)** — Variable sliding window with frequency bounds.
2. **[LeetCode 1047] Remove All Adjacent Duplicates In String (Easy)** — In-place stack simulation via pointer overwriting.
3. **[LeetCode 8] String to Integer (atoi) (Medium)** — Pre-multiplication 32-bit overflow guards.
4. **[LeetCode 451] Sort Characters By Frequency (Medium)** *(Bonus)* — Frequency table + Bucket Sort on counts ($O(N)$ runtime).

---

## 5. 🎯 Day 20 Checkpoint Questions

1. **Pre-Multiplication Arithmetic:** In `MyAtoi`, why do we check `result > int.MaxValue / 10` instead of letting `result = result * 10 + digit` calculate first and checking `if (result < 0)`?
2. **In-Place Stack Duality:** In LeetCode 1047, how does the `write` pointer simultaneously act as an array index and a stack top?
3. **Subarray Contrast:** Why would solving LeetCode 340 with Prefix Sum + Hash Map be a disastrous choice compared to Sliding Window?

When you are ready, share your answers or request to launch **Day 21: Week 1–3 Milestone Assessment (Mock Interview Simulation)**!
