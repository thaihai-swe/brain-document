---
title: "Week 5 — Day 35: Phase 1 Milestone Assessment & Mock Interview Simulation"
---

Congratulations on reaching **Day 35**! 

Today marks the **completion of Phase 1 (Linear Data Structures & Core Algorithmic Techniques)**. Over the last 5 weeks and 35 consecutive days, you have systematically built an elite algorithmic foundation:
- **Weeks 1–3:** Array Memory Layouts, Pointer Coordination, Sliding Windows, Prefix Sums, and String CLR Internals.
- **Weeks 4–5:** Binary Search Invariants, Answer Spaces, Multi-Pointer Reductions, Interval Algebra, Sweep-Line, 2D Matrix Symmetries, Rabin-Karp, KMP Automata, and Register-Level Bit Manipulation.

Today is your **Phase 1 Capstone Assessment**. We conduct a full **90-minute Mock Interview Simulation** featuring two of the most famous and challenging problems in Big Tech technical screens:
1. **Problem 1 (Arrays & Binary Search, 45 min):** [LeetCode 4] Median of Two Sorted Arrays (Hard)
2. **Problem 2 (Strings & Sliding Window, 45 min):** [LeetCode 76] Minimum Window Substring (Hard)

---

## 1. 🎯 MOCK INTERVIEW STRUCTURE & SCORING RUBRIC

Treat this simulation as a real onsite technical interview at Google, Meta, or Microsoft:

| Evaluation Dimension | Standard for "Strong Hire" (4/4) | Score (0–4) |
| :--- | :--- | :---: |
| **1. Problem Exploration & Clarification** | Asks about constraints, empty inputs, negative values, and confirms time/space requirements before writing code. | [ ] / 4 |
| **2. Invariant Formulation & Architecture** | States the mathematical invariant (e.g. partition cut balance, window validity) clearly before implementation. | [ ] / 4 |
| **3. Production Code Quality (C#)** | Writes clean, modular C# with descriptive variable names, zero redundant allocations, and overflow guards. | [ ] / 4 |
| **4. Dry-Run & Edge Case Verification** | Proactively walks through an example and edge cases (single elements, identical values, empty strings) without being prompted. | [ ] / 4 |
| **5. Complexity Derivation** | Derives exact Big-O time and space from first principles; explains trade-offs confidently. | [ ] / 4 |

**Passing Bar:** 16 / 20 points.

---

## 2. 🥊 MOCK INTERVIEW PROBLEM 1: LeetCode 4 — Median of Two Sorted Arrays (Hard)

> Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the **median** of the two sorted arrays.  
> The overall run time complexity should be **$O(\log(m + n))$**.
>
> **Constraints:**
> - $nums1.Length == m, \ nums2.Length == n$
> - $0 \le m \le 1000, \ 0 \le n \le 1000$
> - $1 \le m + n \le 2000$
> - $-10^6 \le nums1[i], nums2[i] \le 10^6$

---

### 2.1 The Mathematical Partition Cut Invariant

Attempting to merge the arrays takes $O(M + N)$ time, which violates the strict $O(\log(M + N))$ requirement.

#### The Core Insight:
The median divides a combined sorted collection into two equal halves (Left Half and Right Half) such that:
1. $\text{Size}(\text{Left Half}) == \text{Size}(\text{Right Half})$ (or Left has 1 more element if total size is odd).
2. Every element in the Left Half is $\le$ every element in the Right Half:
   $$\max(\text{Left Half}) \le \min(\text{Right Half})$$

Instead of merging, we perform a **Binary Search on the Partition Cut of the smaller array**!

```
nums1:  [ x1, x2 | x3, x4, x5 ]      <- Cut i divides nums1 into Left1 and Right1
nums2:  [ y1, y2, y3 | y4, y5 ]      <- Cut j divides nums2 into Left2 and Right2
```

#### The Invariant Formulas:
1. Always binary search on the **shorter** array (swap if $M > N$) to ensure $O(\log(\min(M, N)))$ runtime and guarantee that $j \ge 0$.
2. Total elements in Left Half:
   $$\text{halfLen} = \frac{m + n + 1}{2}$$
3. For any cut index $i \in [0 \dots m]$ in `nums1`, the cut index $j$ in `nums2` is fixed:
   $$\mathbf{j = \text{halfLen} - i}$$
4. The 4 boundary values around the cut:
   - $L_1 = (i == 0) \ ? \ -\infty : nums1[i - 1]$
   - $R_1 = (i == m) \ ? \ +\infty : nums1[i]$
   - $L_2 = (j == 0) \ ? \ -\infty : nums2[j - 1]$
   - $R_2 = (j == n) \ ? \ +\infty : nums2[j]$

#### The Valid Partition Condition:
The combined partition is valid if and only if:
$$\mathbf{L_1 \le R_2 \quad \text{and} \quad L_2 \le R_1}$$

- If $L_1 > R_2$: Cut $i$ in `nums1` is too far to the right $\implies$ move cut left: `hi = i - 1`.
- If $L_2 > R_1$: Cut $i$ in `nums1` is too far to the left $\implies$ move cut right: `lo = i + 1`.

Once valid:
- If total length $(m + n)$ is **odd**: $\text{Median} = \max(L_1, L_2)$.
- If total length $(m + n)$ is **even**: $\text{Median} = \frac{\max(L_1, L_2) + \min(R_1, R_2)}{2.0}$.

---

### 2.2 Production C# Implementation

```csharp
public class SolutionMedianSortedArrays {
    public double FindMedianSortedArrays(int[] nums1, int[] nums2) {
        // Invariant 1: Always binary search on the shorter array
        if (nums1.Length > nums2.Length) {
            return FindMedianSortedArrays(nums2, nums1);
        }

        int m = nums1.Length;
        int n = nums2.Length;
        int halfLen = (m + n + 1) / 2;

        int lo = 0;
        int hi = m;

        while (lo <= hi) {
            int i = lo + (hi - lo) / 2; // Cut in nums1
            int j = halfLen - i;        // Cut in nums2

            // Boundary elements with infinity guards
            int l1 = (i == 0) ? int.MinValue : nums1[i - 1];
            int r1 = (i == m) ? int.MaxValue : nums1[i];

            int l2 = (j == 0) ? int.MinValue : nums2[j - 1];
            int r2 = (j == n) ? int.MaxValue : nums2[j];

            if (l1 <= r2 && l2 <= r1) {
                // Perfect partition cut found!
                if ((m + n) % 2 != 0) {
                    return Math.Max(l1, l2); // Odd total length
                } else {
                    return (Math.Max(l1, l2) + Math.Min(r1, r2)) / 2.0; // Even total length
                }
            } else if (l1 > r2) {
                // Cut i is too far right; move left
                hi = i - 1;
            } else {
                // Cut i is too far left; move right
                lo = i + 1;
            }
        }

        throw new ArgumentException("Input arrays are not sorted.");
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $\mathbf{O(\log(\min(M, N)))}$ — binary search on the shorter array. With $M \le 1000$, $\log_2(1000) \approx 10$ iterations max!
- **Space Complexity:** **$O(1)$** — strictly scalar pointers and boundary variables.

---

## 3. 🥊 MOCK INTERVIEW PROBLEM 2: LeetCode 76 — Minimum Window Substring (Hard)

> Given two strings `s` and `t` of lengths `m` and `n` respectively, return the **minimum window substring** of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string `""`.
>
> **Constraints:**
> - $m == s.Length, \ n == t.Length$
> - $1 \le m, n \le 10^5$
> - `s` and `t` consist of uppercase and lowercase English letters.
> - Must run in **$O(m + n)$** time.

---

### 3.1 The Dynamic Sliding Window Invariant

This is the definitive benchmark problem for the **Variable-Size Sliding Window Pattern** (introduced in Week 2).

#### The State Machine:
1. **Target Frequency Map:** Count frequencies of all characters in `t`. Store in a fixed-size ASCII array `int[128] targetFreq`.
2. **Window Frequency Map:** Track character counts in the current window `s[left .. right]`: `int[128] windowFreq`.
3. **Match Counter:** Track `int matchedCount`, representing how many *unique characters* have satisfied their required frequency:
   $$\text{When } windowFreq[c] == targetFreq[c] \implies \text{matchedCount}++$$
4. **The Expansion-Contraction Invariant:**
   - **Expand Right:** Expand `right` pointer to include incoming characters until `matchedCount == totalUniqueInT` (window is valid).
   - **Shrink Left:** While the window is valid, record the minimum window length, then shrink `left` pointer to remove unneeded characters until the window becomes invalid again.

---

### 3.2 Production C# Implementation

```csharp
public class SolutionMinWindowSubstring {
    public string MinWindow(string s, string t) {
        if (string.IsNullOrEmpty(s) || string.IsNullOrEmpty(t) || s.Length < t.Length) {
            return string.Empty;
        }

        // Frequency table for target string t (ASCII 128)
        int[] targetFreq = new int[128];
        int uniqueTargetChars = 0;
        foreach (char c in t) {
            if (targetFreq[c] == 0) uniqueTargetChars++;
            targetFreq[c]++;
        }

        int[] windowFreq = new int[128];
        int matchedChars = 0;

        int minLen = int.MaxValue;
        int bestStart = 0;

        int left = 0;

        // Slide right pointer across string s
        for (int right = 0; right < s.Length; right++) {
            char rightChar = s[right];
            windowFreq[rightChar]++;

            // Did this character satisfy its requirement in t?
            if (targetFreq[rightChar] > 0 && windowFreq[rightChar] == targetFreq[rightChar]) {
                matchedChars++;
            }

            // Window is valid! Try to shrink left boundary to find minimum
            while (matchedChars == uniqueTargetChars) {
                int currentLen = right - left + 1;
                if (currentLen < minLen) {
                    minLen = currentLen;
                    bestStart = left;
                }

                char leftChar = s[left];
                windowFreq[leftChar]--;

                // If removing leftChar breaks validity
                if (targetFreq[leftChar] > 0 && windowFreq[leftChar] < targetFreq[leftChar]) {
                    matchedChars--;
                }

                left++; // Contract window
            }
        }

        return minLen == int.MaxValue ? string.Empty : s.Substring(bestStart, minLen);
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $\mathbf{O(M + N)}$ — constructing `targetFreq` takes $O(N)$; each character in `s` is visited at most twice (once by `right`, once by `left`). Total operations $\le 2M + N \implies O(M + N)$.
- **Space Complexity:** $\mathbf{O(1)}$ auxiliary space — two fixed `int[128]` frequency tables.

---

## 4. 🎓 PHASE 1 MASTER RETROSPECTIVE & READINESS SCORECARD

You have now completed **all 35 Days of Phase 1**.

### The 8 Pillars of Phase 1 Mastery:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 1 COMPLETE: THE 8 CORE PILLARS                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
  1. Memory Architecture & Amortization: CPU Cache lines, LOH, Span<T>, Dynamic Arrays
  2. Pointer Coordination: Opposite-ends (2Sum), Fast & Slow Reader/Writer (In-place)
  3. Continuous Windows & Accumulation: Fixed/Dynamic Sliding Window, Prefix Sum, Diff Arrays
  4. String Memory & Automata: UTF-16 Runes, Rabin-Karp Rolling Hash, KMP π-Automata
  5. Logarithmic Search Spaces: Exact match, Lower Bound, Rotated Arrays, Answer Spaces
  6. Multi-Pointer Reductions: 3Sum duplicate pruning, Trapping Rain Water Bounded-Min
  7. Interval Algebra & Sweep-Line: Start vs End sorting, 3-Phase Insert, Arrival/Departure Events
  8. 2D Coordinate Transformations: Transpose + Reverse, Spiral peeling, Saddleback search
```

---

## 5. 🎯 Phase 1 Capstone Questions

Test your permanent conceptual retention:

1. **Median of Two Sorted Arrays Invariant:** In LeetCode 4, why must we ensure $M \le N$ before starting the binary search? Name two distinct failure modes if $M > N$.
2. **Sliding Window Complexity Proof:** In LeetCode 76 (Minimum Window Substring), although there is a `while` loop nested inside a `for` loop, why is the overall time complexity strictly $O(M + N)$ and never $O(M^2)$?
3. **Partition Boundary Infinity Guards:** In LeetCode 4, why do we use `int.MinValue` when $i = 0$ and `int.MaxValue` when $i = m$? How does this prevent index-out-of-bounds branching?
4. **Answer Space vs Linear Scan:** Contrast the problem-solving philosophy of **Day 24 (Binary Search on Answer)** with **Day 26 (Interval Scheduling)**. How do their greedy choices differ?

---

### 🚀 What Lies Ahead in Phase 2 (Weeks 6–10)?
In Phase 2, we leave primitive arrays and strings to conquer **Linear Abstract Data Types (ADTs)**:
- **Linked Lists Mastery:** Singly, doubly, circular, Floyd's cycle proofs, and LRU cache internals.
- **Stacks & Queues:** Call stacks, Monotonic Stacks (Next Greater Element), Monotonic Deques (Sliding Window Max), and Shunting-Yard expression parsing.
- **Heaps & Priority Queues:** Linear-time `BuildHeap`, custom comparators, K-way merges, and streaming medians.
- **Tries (Prefix Trees):** Autocomplete architectures, bitwise XOR tries, and prefix matching.
