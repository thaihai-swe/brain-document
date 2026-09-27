---
title: "Week 8 — Day 53: Monotonic Stack Range Contribution & Subarray Aggregations"
---

In **Day 52**, we used monotonic increasing stacks to identify geometric boundary spans for histogram area optimization.

Today, we conquer one of the most mathematically profound patterns in advanced algorithm design:
1. **The Contribution Model (Inversion of Summation):** Shifting focus from enumerating $O(N^2)$ subarrays to calculating how many subarrays each element $A[i]$ dominates as the minimum or maximum.
2. **The Span Formula:** Proving why the number of valid subarrays is strictly $\mathbf{(i - L) \times (R - i)}$.
3. **The Duplicate Counting Catastrophe:** How symmetric boundaries cause double-counting, and why the **Asymmetry Rule** ($<$ on left, $\le$ on right) guarantees mathematical bijection.
4. **Range Difference Decomposition ([LeetCode 2104]):** Exploiting linearity of summation to compute $\sum (\max - \min)$ in $O(N)$ time.
5. **Combining Monotonic Stacks with Prefix Sums ([LeetCode 1856]):** Finding the maximum min-product in linear time.

---

## 1. 🧠 TEACH: Concept & Invariants

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* The **Monotonic Stack Range Contribution Pattern** inverts subarray aggregation problems by determining the exact number of contiguous subarrays in which each element $nums[i]$ acts as the dominant minimum or maximum.
  - *Core Invariants:* Range Contribution Invariant: If $nums[i]$ is the minimum across range $[L_i + 1 .. R_i - 1]$, total subarrays where $nums[i]$ is minimum $= (i - L_i) \times (R_i - i)$; Duplicate Asymmetry Rule: Use strictly $<$ on one boundary and $\le$ on the opposite boundary to prevent double-counting equal elements.
  - *Misconception Check:* If duplicate elements exist (e.g. `[2, 2, 2]`), using strictly $<$ on both sides or $\le$ on both sides will either under-count or over-count overlapping subarrays. Strict asymmetry ($<$ left, $\le$ right) guarantees a mathematical partition.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(N^2)$ generation or $O(N^3)$ evaluation of all contiguous subarrays.
  - *Complexity Advantage:* Reduces cumulative subarray aggregations to a single linear $O(N)$ scan.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Sum of Subarray Minimums" (LC 907), "Sum of Subarray Ranges" (LC 2104). Signal words: "sum of minimum of all subarrays", "sum of max - min of all subarrays".
  - *When to Avoid / Failure Modes:* If subarray lengths are constrained to fixed size $K$ (use Monotonic Deque instead).
- **4. WHERE:**
  - *Physical CLR Memory:* 64-bit integer accumulators (`long`) to prevent 32-bit overflow before modulo $10^9 + 7$; two monotonic stack passes (or a single pass calculating left and right simultaneously).
  - *Production Systems:* Statistical dispersion analysis in financial time series, variance aggregation in signal processing streams.
- **5. WHO:**
  - *Spoken Script:* "Instead of finding the minimum of every subarray, I invert the problem to ask: in how many subarrays is $nums[i]$ the minimum? A monotonic stack finds the left and right boundaries where $nums[i]$ is strictly dominant. The number of subarrays is $(i - L) \times (R - i)$, contributing $nums[i] \times \text{count}$ to the total sum in $O(N)$ time."
  - *Interviewer Evaluation Lens:* Checks duplicate asymmetry rule ($<$ left, $\le$ right), 64-bit integer overflow defense, and modulo arithmetic hygiene.
- **6. HOW:**
  - *Cost Model:* Time: $O(N)$ (two linear passes); Space: $O(N)$ auxiliary memory.
  - *State Transition Trace (LC 907):* `nums=[3, 1, 2, 4] -> For val 1: Left boundary=-1, Right boundary=4 -> Count = (1 - (-1)) * (4 - 1) = 2 * 3 = 6 subarrays -> Contribution = 1 * 6 = 6`.


### 1.1 The Combinatorial Subarray Dilemma

Given an array of integers `arr`, compute the sum of `min(b)` for every contiguous subarray `b`.
Since the answer may be large, return it modulo $10^9 + 7$.

- An array of length $N$ has $\frac{N(N + 1)}{2}$ contiguous subarrays ($O(N^2)$).
- **The Naive Approach ($O(N^2)$ or $O(N^3)$):**
  - Iterate over every pair $(j, k)$.
  - Find the minimum in `arr[j .. k]`.
  - For $N = 3 \times 10^4$, $N^2 \approx 9 \times 10^8$ operations $\implies$ **Definite TLE**.

---

### 1.2 The Element Contribution Model (Inversion of Summation)

Instead of asking: *"For each subarray, what is its minimum?"*
We **invert the summation**:

> [!TIP]
> **The Contribution Framing:** For each element $arr[i]$, **in how many subarrays does $arr[i]$ serve as the absolute minimum?**

$$\sum_{\text{subarrays } b} \min(b) = \sum_{i=0}^{N-1} \Big( arr[i] \times \text{Count of subarrays where } arr[i] \text{ is the minimum} \Big)$$

#### How Many Subarrays Have $arr[i]$ as Minimum?
Let:
- $L = \text{Index of the Previous Less Element }(PLE)$ to the left of $i$.
- $R = \text{Index of the Next Less Element }(NLE)$ to the right of $i$.

```
Index:       L              i              R
Values:   [ ... 1 ,  ( 5 ,  3 ,  7 ,  4 ) , 2 ... ]
                    └───────┘  └───────┘
                     Choices    Choices
                     for Left   for Right
```

For $arr[i]$ to be the minimum of subarray $[start \dots end]$:
- The `start` boundary can be chosen from any index in $[L + 1 \dots i]$: exactly **$(i - L)$ choices**.
- The `end` boundary can be chosen from any index in $[i \dots R - 1]$: exactly **$(R - i)$ choices**.
- By the Fundamental Counting Principle, the total number of subarrays where $arr[i]$ is the minimum is:
  $$\mathbf{\text{Count}(i) = (i - L) \times (R - i)}$$
- Total contribution of $arr[i]$ to the final sum:
  $$\mathbf{\text{Contribution}(i) = arr[i] \times (i - L) \times (R - i)}$$

---

### 1.3 The Duplicate Catastrophe & The Asymmetry Invariant

What happens when an array contains **duplicate elements**?
Consider: `arr = [2, 2]`. Subarrays: `[2] (idx 0)`, `[2] (idx 1)`, and `[2, 2]`.

#### The Symmetric Trap (Strict $<$ on both sides):
- For `arr[0] = 2`: $L = -1$, $R = 2 \implies (0 - (-1)) \times (2 - 0) = 1 \times 2 = 2$ subarrays (`[2]`, `[2, 2]`).
- For `arr[1] = 2`: $L = -1$, $R = 2 \implies (1 - (-1)) \times (2 - 1) = 2 \times 1 = 2$ subarrays (`[2]`, `[2, 2]`).
- Total subarrays counted = $2 + 2 = 4$!
- **Catastrophe!** The subarray `[2, 2]` was counted **twice**!

#### The Asymmetry Rule (The Mathematical Fix):
To create a strict bijection (every subarray counted exactly once), we break ties by defining:
- **Left boundary ($L$):** First element **strictly less than** $arr[i]$ ($<$).
- **Right boundary ($R$):** First element **less than or equal to** $arr[i]$ ($\le$).

```
arr = [2, 2]
Index 0:
  L: Strictly smaller to left -> none -> L = -1 (Choices: {0} -> 1)
  R: Smaller OR EQUAL to right -> index 1 -> R = 1 (Choices: {0} -> 1)
  Count = (0 - (-1)) * (1 - 0) = 1 * 1 = 1 subarray: [2] (at idx 0).

Index 1:
  L: Strictly smaller to left -> none -> L = -1 (Choices: {0, 1} -> 2)
  R: Smaller OR EQUAL to right -> none -> R = 2 (Choices: {1} -> 1)
  Count = (1 - (-1)) * (2 - 1) = 2 * 1 = 2 subarrays: [2] (at idx 1), and [2, 2]!

Total = 1 + 2 = 3 subarrays! PERFECT BIJECTION!
```

> [!IMPORTANT]
> **The Golden Law:** When computing range contributions with duplicates, one boundary MUST be strict ($<$) and the other MUST be non-strict ($\le$).

---

### 1.4 Linearity of Summation: Sum of Subarray Ranges ([LeetCode 2104])

The "range" of a subarray is defined as $\max(b) - \min(b)$.
By the distributive property of summation:
$$\sum_{b} (\max(b) - \min(b)) = \sum_{b} \max(b) - \sum_{b} \min(b)$$

We solve this in two independent linear passes:
1. `SumSubarrayMax`: Compute contribution of each element as maximum using a Monotonic Decreasing Stack.
2. `SumSubarrayMin`: Compute contribution of each element as minimum using a Monotonic Increasing Stack.
3. $\text{Result} = \text{SumSubarrayMax} - \text{SumSubarrayMin}$ in **$O(N)$ time and $O(N)$ space**!

---

### 1.5 Interview Spoken Drill (20–30 Seconds)

> *"To find the sum of subarray minimums in $O(N)$ time, I use the contribution model: instead of checking all $O(N^2)$ subarrays, I calculate how many subarrays each element $A[i]$ serves as the minimum for. For an element $A[i]$, the number of subarrays is $(i - L) \times (R - i)$, where $L$ is the previous smaller element and $R$ is the next smaller element. To prevent double-counting duplicate values, I enforce the asymmetry invariant: searching strictly less on the left and less-than-or-equal on the right. This partitions every subarray into a unique owner and runs in $O(N)$ time via a single monotonic stack pass."*

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

### 2.1 [LeetCode 907] Sum of Subarray Minimums

Given an array of integers `arr`, find the sum of `min(b)`, where `b` ranges over every contiguous subarray of `arr`. Return the answer modulo $10^9 + 7$.

#### Single-Pass Monotonic Stack Implementation:
Just like in LeetCode 84, we can compute contributions in a **single pass** using a virtual sentinel at index $N$ with value $0$ (or $-\infty$):
- When $arr[i]$ triggers a pop of `mid = stack.Pop()`:
  - $R = i$ (Next Less or Equal element).
  - $L = stack.Peek()$ (Previous Less element, or $-1$ if stack empty).
  - Contribution: $arr[mid] \times (mid - L) \times (R - mid)$.

#### Production C# Implementation:

```csharp
public class SolutionSubarrayMins {
    private const int MOD = 1_000_000_007;

    /// <summary>
    /// Computes sum of subarray minimums in O(N) time and O(N) space
    /// using a single-pass monotonic stack with asymmetry duplicate protection.
    /// </summary>
    public int SumSubarrayMins(int[] arr) {
        if (arr == null || arr.Length == 0) return 0;

        int n = arr.Length;
        var stack = new Stack<int>(); // Stores indices
        long totalSum = 0;

        // Traverse up to n inclusive (index n acts as sentinel with value 0)
        for (int i = 0; i <= n; i++) {
            // Virtual sentinel value 0 forces all elements to pop at the end
            int currentVal = (i == n) ? 0 : arr[i];

            // Invariant: pop when currentVal <= stack.Peek() value
            // (Strict on left because stack elements are strictly increasing; non-strict on right)
            while (stack.Count > 0 && currentVal <= arr[stack.Peek()]) {
                int mid = stack.Pop();
                int r = i; // Next Less or Equal index
                int l = (stack.Count == 0) ? -1 : stack.Peek(); // Previous Less index

                long leftCount = mid - l;
                long rightCount = r - mid;
                long contribution = (leftCount * rightCount) % MOD;
                contribution = (contribution * arr[mid]) % MOD;

                totalSum = (totalSum + contribution) % MOD;
            }

            stack.Push(i);
        }

        return (int)totalSum;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — Each element is pushed and popped exactly once.
- **Space Complexity:** $O(N)$ — Stack holds at most $N + 1$ indices.

---

### 2.2 [LeetCode 2104] Sum of Subarray Ranges

Given an integer array `nums`, return the **sum of all subarray ranges** of `nums`. The range of a subarray is the difference between the largest and smallest element in the subarray.

#### Production C# Implementation:

```csharp
public class SolutionSubarrayRanges {
    /// <summary>
    /// Computes sum of subarray ranges in O(N) time and O(N) space
    /// via Sum(Max) - Sum(Min) decomposition.
    /// </summary>
    public long SubArrayRanges(int[] nums) {
        return CalculateSum(nums, isMax: true) - CalculateSum(nums, isMax: false);
    }

    private long CalculateSum(int[] nums, bool isMax) {
        int n = nums.Length;
        var stack = new Stack<int>();
        long total = 0;

        for (int i = 0; i <= n; i++) {
            while (stack.Count > 0 && IsTrigger(nums, i, stack.Peek(), isMax)) {
                int mid = stack.Pop();
                int l = (stack.Count == 0) ? -1 : stack.Peek();
                int r = i;

                long count = (long)(mid - l) * (r - mid);
                total += count * nums[mid];
            }
            stack.Push(i);
        }

        return total;
    }

    private bool IsTrigger(int[] nums, int currIdx, int topIdx, bool isMax) {
        if (currIdx == nums.Length) return true; // Sentinel flush at the end

        int curr = nums[currIdx];
        int top = nums[topIdx];

        // For Max: pop when curr >= top (decreasing stack)
        // For Min: pop when curr <= top (increasing stack)
        return isMax ? (curr >= top) : (curr <= top);
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — Two linear passes over `nums`.
- **Space Complexity:** $O(N)$ auxiliary stack space.

---

### 2.3 [LeetCode 1856] Maximum Subarray Min-Product

The **min-product** of an array is the **minimum-value** multiplied by the **sum** of the array. Given an array of positive integers `nums`, return the **maximum min-product** of any non-empty subarray modulo $10^9 + 7$.

#### Algorithmic Invariants:
1. For each `nums[mid]`, find the widest subarray $[L + 1 \dots R - 1]$ where `nums[mid]` is the minimum.
2. The elements in this subarray are positive $\implies$ wider span strictly increases the subarray sum!
3. To compute $\sum_{k=L+1}^{R-1} nums[k]$ in $O(1)$ time, use a **Prefix Sum Array**:
   $$\text{Sum} = P[R] - P[L + 1]$$
4. Maximize $\mathbf{nums[mid] \times (P[R] - P[L + 1])}$ across all $mid$ using 64-bit `long`, and apply modulo $10^9 + 7$ only at the very end!

#### Production C# Implementation:

```csharp
public class SolutionMaxMinProduct {
    private const int MOD = 1_000_000_007;

    /// <summary>
    /// Computes maximum min-product in O(N) time and O(N) space
    /// using Monotonic Increasing Stack + Prefix Sums.
    /// </summary>
    public int MaxSumMinProduct(int[] nums) {
        int n = nums.Length;

        // Step 1: Compute Prefix Sums using 64-bit long
        long[] prefix = new long[n + 1];
        for (int i = 0; i < n; i++) {
            prefix[i + 1] = prefix[i] + nums[i];
        }

        var stack = new Stack<int>();
        long maxProduct = 0;

        // Step 2: Monotonic stack to find boundaries for each element
        for (int i = 0; i <= n; i++) {
            int currentVal = (i == n) ? 0 : nums[i];

            while (stack.Count > 0 && currentVal < nums[stack.Peek()]) {
                int mid = stack.Pop();
                int r = i;
                int l = (stack.Count == 0) ? -1 : stack.Peek();

                // Subarray span is [l + 1 .. r - 1]
                // Prefix sum of span is prefix[r] - prefix[l + 1]
                long sum = prefix[r] - prefix[l + 1];
                long product = (long)nums[mid] * sum;

                if (product > maxProduct) {
                    maxProduct = product;
                }
            }

            stack.Push(i);
        }

        return (int)(maxProduct % MOD);
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — Single pass to build prefix sums; single pass monotonic stack.
- **Space Complexity:** $O(N)$ auxiliary space for `prefix` array and stack.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Apply the contribution model on LeetCode:

### Problem 1 (The Foundational Model): LeetCode 907 — Sum of Subarray Minimums (Medium)
- **Goal:** Implement the contribution formula with asymmetry protection.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.

### Problem 2 (Range Decomposition): LeetCode 2104 — Sum of Subarray Ranges (Medium)
- **Goal:** Solve in $O(N)$ time via `SumMax - SumMin`.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.

### Problem 3 (Stack + Prefix Sums): LeetCode 1856 — Maximum Subarray Min-Product (Medium)
- **Goal:** Combine monotonic stack boundaries with $O(1)$ prefix sum queries.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.

### Bonus / Grandmaster Challenge: LeetCode 2281 — Sum of Total Strength of Wizards (Hard)
- **Goal:** Compute $\sum (\min \times \text{sum})$ for all subarrays in $O(N)$ time using prefix sums of prefix sums!

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Subarray Aggregation Decision Tree                   │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Sum of Minimums across ALL subarrays?
                   │   └─► Contribution Model: (i - L) * (R - i) * arr[i] [LC 907]
                   │       (Enforce Asymmetry: < on left, <= on right)
                   │
                   ├─► Sum of (Max - Min) across ALL subarrays?
                   │   └─► Linearity of Summation: Sum(Max) - Sum(Min) [LC 2104]
                   │
                   ├─► Maximize min * sum over contiguous subarray?
                   │   └─► Monotonic Stack (Boundary) + Prefix Sums [LC 1856]
                   │
                   └─► Arithmetic expression evaluation with precedence?
                       └─► Dijkstra's Shunting-Yard Algorithm (Day 54) [LC 150, LC 227]
```

### Preview for Day 54: Arithmetic Expression Parsing & The Shunting-Yard Algorithm
Tomorrow in **Day 54**, we step from array analytics into **compiler front-end engineering**:
- **Expression Representations:** Infix ($1 + 2 \times 3$), Prefix ($+ 1 \times 2 \ 3$), and Postfix / Reverse Polish Notation ($1 \ 2 \ 3 \times +$).
- **Operator Precedence & Associativity:** Managing `*` and `/` before `+` and `-`.
- **Dijkstra's Shunting-Yard Algorithm:** Evaluating mathematical expressions with nested parentheses and unary negation signs in $O(N)$ time ([LeetCode 150], [LeetCode 227], [LeetCode 224]).

---

## 5. 🎯 Day 53 Checkpoint Questions

Verify your mastery of range contributions and duplicate handling:

1. **The Asymmetry Proof:** In LeetCode 907, why does using $<$ on the left and $\le$ on the right guarantee that identical values (e.g. `[71, 55, 82, 55]`) do not double-count overlapping subarrays?
2. **Modulo Arithmetic Safety:** In LeetCode 907, why must `leftCount * rightCount` be computed using `long` before applying `% MOD`, and why must `(leftCount * rightCount) % MOD` be multiplied by `arr[mid]` before applying `% MOD` again?
3. **Prefix Sum Subarray Span:** In LeetCode 1856, when `mid = stack.Pop()` with left boundary `l` and right boundary `r`, why is the prefix sum formula `prefix[r] - prefix[l + 1]` and NOT `prefix[r] - prefix[l]`?
4. **Linearity of Summation:** Explain why LeetCode 2104 can be split into two separate passes (`SumMax - SumMin`) rather than attempting to track the minimum and maximum simultaneously in a single stack.
