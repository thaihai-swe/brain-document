---
title: "Week 4 — Day 22: Binary Search Invariants and Boundary Formulations"
---

# 🚀 Week 4 — Day 22: Binary Search Invariants and Boundary Formulations

Welcome to **Week 4**! Over Weeks 1–3, you built an unshakeable foundation in linear data structures: memory layouts, pointer coordination (Opposite-Ends, Fast & Slow Reader/Writer), range accumulation (Prefix Sums, Difference Arrays), continuous windowing, and string runtime internals.

This week, we make the leap from $O(N)$ linear scans into **$O(\log N)$ logarithmic search spaces**. 

Binary Search is universally famous, yet it is notorious for producing subtle **off-by-one errors**, **infinite loops**, and **boundary miscalculations** under interview pressure. Today, we demystify the algorithm from first principles, establishing **strict loop invariants** and mastering the **canonical boundary templates** that guarantee 100% correctness on every problem.

---

## 1. 🧠 TEACH: The Mechanics of Binary Search Invariants

### 1.1 The Core Intuition: Halving the Hypothesis Space

Consider searching for a target value in a sorted array of size $N$:

```
Index:    0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15
nums:   [ 2,   5,   8,  12,  16,  23,  38,  45,  56,  67,  78,  82,  89,  91,  95,  99 ]
```

- **Linear Scan:** Inspects element by element from left to right. In the worst case, touches all $N$ elements $\to O(N)$ time.
- **Binary Search:** Exploits the **order invariant** (monotonicity). By querying the midpoint, we compare `nums[mid]` to `target`:
  - If `nums[mid] == target`: Found.
  - If `nums[mid] < target`: Because the array is sorted, every element at indices $\le mid$ is strictly $< target$. We can instantaneously discard the entire left half.
  - If `nums[mid] > target`: Every element at indices $\ge mid$ is strictly $> target$. Discard the entire right half.

Every single query **eliminates $50\%$ of the remaining search candidates**.

$$\frac{N}{2^k} = 1 \implies 2^k = N \implies \mathbf{k = \log_2 N}$$

- For $N = 1,000$, binary search takes at most $\approx 10$ steps.
- For $N = 1,000,000$, binary search takes at most $\approx 20$ steps.
- For $N = 10^9$ (one billion items), binary search takes at most $\approx 30$ steps!

---

### 1.2 The Integer Overflow Bug (The 20-Year-Old Flaw)

In 2006, Joshua Bloch (author of *Effective Java*) revealed that standard binary search implementations across JDK, C++, and textbook libraries had contained an integer overflow bug for over two decades:

```csharp
// ⚠️ THE OVERFLOW TRAP:
int mid = (left + right) / 2;
```

#### What goes wrong?
In 32-bit signed integers:
$$\text{int.MaxValue} = 2^{31} - 1 = 2,147,483,647$$

If an array is large (e.g., $N > 1.07 \times 10^9$) and both `left` and `right` are near the upper half of the array:
$$\text{left} = 1,500,000,000, \quad \text{right} = 1,800,000,000$$
$$\text{left} + \text{right} = 3,300,000,000 > 2^{31} - 1$$

In C# without `checked` arithmetic, 32-bit signed integer addition **wraps around into a negative number**:
$$\text{left} + \text{right} \to -994,967,296$$
$$\text{mid} = -994,967,296 / 2 = -497,483,648 \implies \mathbf{\text{IndexOutOfRangeException}!}$$

#### The Production Fix:
Distribute the subtraction so the sum never exceeds `right`:

$$\mathbf{\text{mid} = \text{left} + \frac{\text{right} - \text{left}}{2}}$$

- Since $\text{right} \ge \text{left}$, $(\text{right} - \text{left}) \ge 0$, and it cannot overflow.
- Alternatively, in modern C# / low-level code: `mid = (int)((uint)left + (uint)right >> 1)` (unsigned logical shift avoids sign overflow).

---

### 1.3 The Two Fundamental Search Paradigms

Binary search problems fall into two distinct categories:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Binary Search Paradigms                         │
└────────────────────────────────────────────────────────────────────────┘
                    │
                    ├─► 1. Exact Match:
                    │      "Find target, return -1 if missing"
                    │      Loop: while (left <= right)
                    │      Bounds: [left, right] fully inclusive
                    │
                    └─► 2. Boundary / Condition Search:
                           "Find FIRST position where condition P(x) is TRUE"
                           (Lower Bound, First Occurrence, Feasibility)
                           Loop: while (left < right)
                           Bounds: [left, right) half-open
```

---

### 1.4 Paradigm 1: Exact Match (`left <= right`)

Use this when you are searching for a specific target value, and the array contains distinct elements or you only care about returning *any* matching index.

#### The Invariant:
- The target, if it exists in the array, is guaranteed to lie within the **inclusive range** `[left, right]`.
- Initial state: `left = 0, right = nums.Length - 1`.
- When `nums[mid] < target`: `left = mid + 1` (discard `mid` because `nums[mid]` is not target).
- When `nums[mid] > target`: `right = mid - 1` (discard `mid`).
- Termination: Loop runs while `left <= right`. If `left > right`, the search range is empty $\implies$ return `-1`.

```
Range: [ left . . . . . . . . . mid . . . . . . . . . right ]
                                 ▲
                     If nums[mid] < target:
                     left = mid + 1
                                       [ left . . . . right ]
```

---

### 1.5 Paradigm 2: Lower Bound / First True (`left < right`)

In real-world Big Tech interviews, exact match accounts for only ~10% of binary search problems. 90% of problems ask for a **boundary**:
- *"Find the FIRST index where $nums[i] \ge \text{target}$."* (Lower Bound / Search Insert Position)
- *"Find the FIRST occurrence of a duplicate element."*
- *"Find the MINIMUM capacity where shipment is feasible."* (Answer Space)

Notice the boolean evaluation across the sorted array:

```
Index:        0      1      2      3      4      5      6
nums:       [ 2,     4,     7,     7,     7,     11,    15 ]
nums[i]>=7: False  False  True   True   True   True   True
                          ▲
                    FIRST TRUE (Index 2)
```

#### The Half-Open Invariant `[left, right)`:
- Range definition: `left` is inclusive, `right` is exclusive.
- Initial state: `left = 0, right = nums.Length` (if all elements are `False`, the answer is `nums.Length`).
- When `Condition(mid) == True`:
  - `mid` *could* be the first true, or the first true is to its left.
  - Therefore, we **keep `mid` in our search range**: `right = mid`.
- When `Condition(mid) == False`:
  - `mid` is definitely NOT the answer, and neither is anything to its left.
  - We discard `mid`: `left = mid + 1`.
- Termination: The loop continues while `left < right`. When `left == right`, the range has collapsed to a single point. `left` is guaranteed to be the index of the **first True**.

#### Why This Never Infinitely Loops:
- If `left < right`, then `mid = left + (right - left) / 2` satisfies:
  $$\text{left} \le \text{mid} < \text{right}$$
- When condition is True: `right = mid`. Since $\text{mid} < \text{right}$, `right` strictly decreases.
- When condition is False: `left = mid + 1`. Since $\text{mid} \ge \text{left}$, `left` strictly increases.
- In every iteration, the search interval length `right - left` strictly decreases by at least 1. It is mathematically impossible to infinite-loop.

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 704 — Binary Search (Easy)

> Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`. You must write an algorithm with $O(\log n)$ runtime complexity.

#### Visual Step-by-Step Trace:
`nums = [-1, 0, 3, 5, 9, 12]`, `target = 9`

```
Iteration 1:
 left = 0, right = 5
 mid = 0 + (5 - 0) / 2 = 2
 nums[mid] = nums[2] = 3
 3 < 9 (target) -> target is to the right.
 left = mid + 1 = 3

Iteration 2:
 left = 3, right = 5
 mid = 3 + (5 - 3) / 2 = 4
 nums[mid] = nums[4] = 9
 9 == 9 (Match found!)
 Return mid = 4.
```

#### Production C# Implementation:
```csharp
public class SolutionBinarySearchExact {
    public int Search(int[] nums, int target) {
        int left = 0;
        int right = nums.Length - 1; // Inclusive bounds [left, right]

        while (left <= right) {
            int mid = left + (right - left) / 2; // Overflow-safe

            if (nums[mid] == target) {
                return mid; // Target found
            }
            if (nums[mid] < target) {
                left = mid + 1; // Target lies in right half
            } else {
                right = mid - 1; // Target lies in left half
            }
        }

        return -1; // Target does not exist in array
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(\log N)$ — with each step, the search window halves ($N, N/2, N/4, \dots, 1$).
- **Space Complexity:** $O(1)$ — only three scalar pointers (`left`, `right`, `mid`).

---

### Problem 2: LeetCode 35 — Search Insert Position (Easy)

> Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.
> You must write an algorithm with $O(\log n)$ runtime complexity.

#### Deep Insight:
This problem is not asking for exact match — it is asking for the **Lower Bound**:
> *"Find the first index $i$ such that $nums[i] \ge \text{target}$."*

If all elements are smaller than `target`, it should be inserted at the very end (`index = nums.Length`).

#### Visual Step-by-Step Trace:
`nums = [1, 3, 5, 6]`, `target = 2`

```
Target condition: nums[i] >= 2
nums:              [   1,       3,       5,       6   ]
nums[i] >= 2:        False    True     True     True
                               ▲
                      Desired insertion index = 1

Initialization: left = 0, right = 4  (half-open [0, 4))

Iteration 1:
 left = 0, right = 4
 mid = 0 + (4 - 0) / 2 = 2
 nums[2] = 5 >= 2 (True) -> right = mid = 2

Iteration 2:
 left = 0, right = 2
 mid = 0 + (2 - 0) / 2 = 1
 nums[1] = 3 >= 2 (True) -> right = mid = 1

Iteration 3:
 left = 0, right = 1
 mid = 0 + (1 - 0) / 2 = 0
 nums[0] = 1 >= 2 (False) -> left = mid + 1 = 1

Loop terminates: left == right == 1.
Return 1. (Correct!)
```

#### Production C# Implementation:
```csharp
public class SolutionSearchInsert {
    public int SearchInsert(int[] nums, int target) {
        int left = 0;
        int right = nums.Length; // Half-open range [0, nums.Length)

        // Invariant: The answer is always in [left, right]
        while (left < right) {
            int mid = left + (right - left) / 2;

            if (nums[mid] >= target) {
                right = mid; // First True could be at mid or to the left
            } else {
                left = mid + 1; // mid is strictly False, discard it
            }
        }

        // Upon termination, left == right, which is the index of the first True
        return left;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(\log N)$ — logarithmic halving.
- **Space Complexity:** $O(1)$ — zero auxiliary memory.

---

### Problem 3: LeetCode 34 — Find First and Last Position of Element in Sorted Array (Medium)

> Given an array of integers `nums` sorted in non-decreasing order, find the starting and ending position of a given `target` value.
> If `target` is not found in the array, return `[-1, -1]`.
> You must write an algorithm with $O(\log n)$ runtime complexity.

#### The Dual Boundary Model:
```
nums = [ 5,  7,  7,  8,  8,  10 ],  target = 8
Indices: 0   1   2   3   4   5

1. First Position of 8:
   First index where nums[i] >= 8  -> returns Index 3

2. Last Position of 8:
   Equivalent to: (First index where nums[i] >= 9) - 1
   First index where nums[i] >= 9  -> returns Index 5
   Index 5 - 1 = Index 4.
```

Instead of writing two completely different, messy binary search functions with opposing boundary conditions, we can solve this with **one single clean helper function: `LowerBound(int[] nums, int target)`**!

$$\text{FirstPosition} = \text{LowerBound}(nums, target)$$
$$\text{LastPosition} = \text{LowerBound}(nums, target + 1) - 1$$

#### Visual Step-by-Step Trace:
`nums = [5, 7, 7, 8, 8, 10]`, `target = 8`

1. Call `first = LowerBound(nums, 8)`:
   - Condition: `nums[i] >= 8`
   - Returns index `3`.
   - Validate: Is `3 < nums.Length` and `nums[3] == 8`? **Yes**.
2. Call `last = LowerBound(nums, 9) - 1`:
   - Condition: `nums[i] >= 9`
   - Returns index `5`.
   - `last = 5 - 1 = 4`.
3. Return `[3, 4]`. Correct!

#### What if the target doesn't exist?
`nums = [5, 7, 7, 8, 8, 10]`, `target = 6`
- `first = LowerBound(nums, 6)`: first element $\ge 6$ is index `1` (`nums[1] = 7`).
- Validation check: `nums[first] == target` $\implies 7 == 6$ is **False**.
- We instantly return `[-1, -1]`.

#### Production C# Implementation:
```csharp
public class SolutionFirstAndLastPosition {
    public int[] SearchRange(int[] nums, int target) {
        int first = FindFirstGreaterOrEqual(nums, target);

        // Verification: Does target even exist in the array?
        if (first == nums.Length || nums[first] != target) {
            return new int[] { -1, -1 };
        }

        // Last position of target is one spot before the first element >= (target + 1)
        int last = FindFirstGreaterOrEqual(nums, target + 1) - 1;

        return new int[] { first, last };
    }

    // Canonical Lower Bound: First index where nums[i] >= target
    private int FindFirstGreaterOrEqual(int[] nums, int target) {
        int left = 0;
        int right = nums.Length; // Half-open [left, right)

        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] >= target) {
                right = mid; // Candidate found, try to find an earlier one
            } else {
                left = mid + 1; // Too small, must search right
            }
        }

        return left;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $2 \times O(\log N) = O(\log N)$ — two binary search passes.
- **Space Complexity:** $O(1)$ — constant memory.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Solidify your boundary invariants on these selected LeetCode challenges:

### Problem 1 (Warmup): LeetCode 704 — Binary Search (Easy)
- **Goal:** Implement the exact match `while (left <= right)` template without looking at notes.
- **Target Complexity:** $O(\log N)$ time, $O(1)$ space.

### Problem 2 (Boundary Master): LeetCode 35 — Search Insert Position (Easy)
- **Goal:** Implement the lower-bound `while (left < right)` template.
- **Target Complexity:** $O(\log N)$ time, $O(1)$ space.

### Problem 3 (Dual Boundary): LeetCode 34 — Find First and Last Position of Element in Sorted Array (Medium)
- **Goal:** Reuse a single `LowerBound` function to find both start and end boundaries.
- **Target Complexity:** $O(\log N)$ time, $O(1)$ space.

### Bonus / Extension Challenge: LeetCode 278 — First Bad Version (Easy)
- **Goal:** Given an API `bool IsBadVersion(int version)`, find the first bad version using the minimum number of API calls.
- **Hint:** This is pure First True boundary search. Set `left = 1, right = n`.

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

Notice how binary search relates to array structures and sets up the rest of Week 4:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Binary Search Topography                        │
└────────────────────────────────────────────────────────────────────────┘
                 │
                 ├─► Target value in strictly sorted array ──────► Exact Match (left <= right)
                 │                                                 [LC 704]
                 │
                 ├─► First element satisfying predicate P(x) ────► Lower Bound (left < right)
                 │                                                 [LC 35, LC 34]
                 │
                 ├─► Inflection point / Pivot in shifted array ──► Rotated Binary Search (Day 23)
                 │                                                 [LC 153, LC 33]
                 │
                 └─► Minimize maximum capacity / Feasibility ────► Binary Search on Answer (Day 24)
                                                                   [LC 875, LC 1011, LC 410]
```

### Preview for Day 23: When the Array is NOT Fully Sorted
What happens when a sorted array is shifted, like `[4, 5, 6, 7, 0, 1, 2]`? The global monotonicity is broken!
Tomorrow in **Day 23**, we will discover that even when rotated, **at least one half of the array is ALWAYS strictly sorted**. We will learn how to identify the sorted half and route our search to achieve $O(\log N)$ in rotated arrays and peak finding.

---

## 5. 🎯 Day 22 Checkpoint Questions

Before moving on, verify your mastery by answering these 4 invariant questions:

1. **The Midpoint Bias:** In lower bound binary search, `mid = left + (right - left) / 2` integer division rounds down (biases toward `left`). Why is this rounding direction critical when `right = left + 1` to prevent an infinite loop when `left = mid + 1`?
2. **The Out-of-Bounds Meaning:** In `LowerBound(int[] nums, int target)` with range `[0, nums.Length)`, what does it mean if the function returns `nums.Length`?
3. **Upper Bound via Lower Bound:** Explain how you can find the index of the *last element $\le \text{target}$* using only a standard `LowerBound(nums, target + 1)` function.
4. **Boundary Contraction Invariant:** In the `while (left < right)` pattern, why must the True condition set `right = mid` while the False condition sets `left = mid + 1`? What would happen if the False branch set `left = mid`?
