---
title: "Week 2 — Day 11: Fixed-Size Sliding Window"
---

Welcome to Day 11! Today we begin our deep dive into the **Sliding Window pattern**, starting with its most structured form: the **Fixed-Size Window**.

In [Day 8](./Week%202%20%E2%80%94%20Day%208:%20Prefix%20Sum%20Fundamentals%20%281D%29.md), we solved range queries with $O(N)$ prefix sum memory. When queries all share the **exact same length $K$** and proceed sequentially, the Fixed-Size Sliding Window achieves the same $O(1)$ query capability with **$O(1)$ auxiliary memory**!

---

## 1. 🧠 TEACH: Mechanics of the Fixed Window

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* The **Fixed-Size Sliding Window** maintains a continuous subarray of constant width $K$ as it translates across a sequence.
  - *Core Invariants:* Window Width Invariant: $|R - L + 1| == K$ at every step; Differential Update Invariant: $\text{State}_{R} = \text{State}_{R-1} + \text{Enter}(nums[R]) - \text{Exit}(nums[R - K])$.
  - *Misconception Check:* Never recompute the window metric from scratch at every index ($O(N \times K)$); differential update (add incoming, subtract outgoing) guarantees $O(1)$ transitions per step.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates repeated $O(K)$ redundant computations across overlapping adjacent windows.
  - *Complexity Advantage:* Reduces time complexity from $O(N \times K)$ to strict $O(N)$ linear time.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Subarray of size K with maximum sum", "average of all contiguous subarrays of size K", "check if string contains permutation of length K". Signal words: "contiguous subarray of fixed length k", "consecutive k elements".
  - *When to Avoid / Failure Modes:* When window size is variable or conditioned on an unknown threshold (use variable sliding window instead).
- **4. WHERE:**
  - *Physical CLR Memory:* Stack registers holding window bounds (`L`, `R`) and running accumulator (`windowSum`). Zero heap allocations during sliding.
  - *Production Systems:* Real-time network rate limiters (leaky/token bucket fixed windows), streaming moving-average calculations in IoT telemetry.
- **5. WHO:**
  - *Spoken Script:* "For a fixed window of size K, I initialize the state over the first K elements. Then, for each subsequent element from index K to N-1, I incorporate the new element at R and subtract the outgoing element at R-K in $O(1)$ time, maintaining strict $O(N)$ linear time with $O(1)$ extra space."
  - *Interviewer Evaluation Lens:* Checks clean two-phase structure (warmup loop for first $K$ elements followed by sliding loop), and correct boundary indexing.
- **6. HOW:**
  - *Cost Model:* Time: $\Theta(N)$ single pass; Space: $O(1)$ auxiliary memory.
  - *State Transition Trace:* `nums=[1, 4, 2, 10, 2], K=3 -> init sum=7 -> slide: sum += 10 - 1 = 16 -> slide: sum += 2 - 4 = 14 -> max=16`.


### 1.1 Physical Mental Model: The Sliding Cardboard Stencil & Incremental Delta

A fixed-size sliding window is mechanically identical to sliding a rigid cardboard cutout of width $K$ across a printed paper tape:

```
       ======================================================================
         PHYSICAL ANALOGY: RIGID CARDBOARD CUTOUT SLIDING ACROSS TAPE
       ======================================================================

       Paper Tape:  [ 2 ]   [ 1 ]   [ 5 ]   [ 1 ]   [ 3 ]   [ 2 ]
       Cardboard:   |=== FIXED WIDTH K = 3 ===|
       
       SLIDE FRAME 1 SLOT TO THE RIGHT:
                    [ 2 ]   [ 1 ]   [ 5 ]   [ 1 ]   [ 3 ]   [ 2 ]
                    EXIT   |<-- UNTOUCHED -->|  ENTER
                   (Left)                      (Right)
       
       THE INCREMENTAL DELTA PRINCIPLE:
       - Naive: Read all K numbers inside the cutout from scratch: O(K) work.
       - Delta: Exactly 1 number leaves the left edge, and 1 new number enters the right!
                The middle (K - 2) numbers never move!
                NewSum = OldSum - ExitingNumber + EnteringNumber
                Updated in 2 CPU operations: strictly O(1) time!
```

```
       ======================================================================
           MEMORY LAYOUT & RUNTIME REGISTERS DURING WINDOW SLIDE
       ======================================================================

       CPU Registers:
       [ currentSum: 8 ]  [ maxSum: 8 ]  [ entering: nums[3]=1 ]  [ exiting: nums[0]=2 ]
              |
              v
       Delta Update: currentSum = currentSum + 1 - 2 = 7.  (1 clock cycle!)
       
       Flat Array Buffer in L1 Data Cache:
       +-------+-------+-------+-------+-------+-------+
       |   2   |   1   |   5   |   1   |   3   |   2   |
       +-------+-------+-------+-------+-------+-------+
         Exits           Enters
```

---

### 1.2 The Physical Intuition: A Shutter of Width K

Imagine a camera shutter that exposes exactly $K$ consecutive items at any time.

```
Array: [ 2,  1,  5,  1,  3,  2 ]     K = 3

Window 0: [ 2,  1,  5 ], 1,  3,  2     Sum = 8
            ▲       ▲
          left    right

Window 1:   2, [ 1,  5,  1 ], 3,  2     Sum = 8 - 2 + 1 = 7
                 ▲       ▲
               left    right

Window 2:   2,  1, [ 5,  1,  3 ], 2     Sum = 7 - 1 + 3 = 9
                     ▲       ▲
                   left    right
```

#### The State Update Invariant:
When moving the window one position to the right:
1. **One element enters** at `right`: `nums[right]`
2. **One element exits** at `left` (`right - K`): `nums[right - K]`
3. The remaining $K - 2$ internal elements **never change**:

$$\mathbf{\text{windowState}_{new} = \text{windowState}_{old} + \text{nums}[right] - \text{nums}[right - K]}$$

Re-summing all $K$ items takes $O(K)$. By applying this incremental delta update, advancing the window takes **strictly $O(1)$** time.

---

### 1.2 Two Implementation Idioms: Which is Better in Interviews?

#### Idiom A: Two-Phase (Pre-Fill First, Then Slide)
```csharp
// Phase 1: Pre-calculate first K elements
int sum = 0;
for (int i = 0; i < k; i++) sum += nums[i];
int maxSum = sum;

// Phase 2: Slide from k to n - 1
for (int i = k; i < nums.Length; i++) {
    sum += nums[i] - nums[i - k];
    maxSum = Math.Max(maxSum, sum);
}
```

#### Idiom B: Unified Single Loop (Interview Standard)
```csharp
int sum = 0, maxSum = int.MinValue;

for (int right = 0; right < nums.Length; right++) {
    // 1. Element enters
    sum += nums[right];

    // 2. Element exits (only once window exceeds size K)
    if (right >= k) {
        sum -= nums[right - k];
    }

    // 3. Window of size K is fully formed
    if (right >= k - 1) {
        maxSum = Math.Max(maxSum, sum);
    }
}
```

> [!TIP]
> **Why Unified Single Loop is Superior:**
> - Handles strings, complex data structures, and edge cases where $N < K$ gracefully.
> - Keeps entry, exit, and evaluation logic cleanly co-located in a single place.

---

### 1.3 Fixed Sliding Window vs. Prefix Sums

| Dimension | Fixed Sliding Window | 1D Prefix Sum (Day 8) |
| :--- | :--- | :--- |
| **Window Length** | **Fixed $K$** across all steps | **Arbitrary** variable lengths $(L \dots R)$ |
| **Traversal Order** | Sequential (left $\to$ right) | Random access (any query at any time) |
| **Auxiliary Memory** | **$O(1)$ space** | **$O(N)$ space** |
| **Time Complexity** | $O(N)$ single pass | $O(N)$ build + $O(1)$ per query |

---

### 1.4 Precision Guardrail: Avoid Floating-Point Division in Loops

When calculating maximum average or comparing against a threshold:
$$\frac{\text{sum}}{K} \ge \text{threshold} \iff \text{sum} \ge K \times \text{threshold}$$

- Floating-point division (`double`) inside a hot loop is slower than integer addition and introduces roundoff error.
- **Rule:** Maintain running integer sums throughout the traversal. Divide by $K$ as a `double` **only once at the very end**.

---

### 1.5 ⚙️ Core Operations Deep-Dive: Fixed-Size Sliding Window State Slide & Running Aggregation

#### Dimension 1: Operation Contract & Big-O Bounds

##### Fixed-Window Primitives (`SlideWindow`, `FindMaxAverage`, `NumOfSubarrays`)
- **Signatures:**
  - `public double FindMaxAverage(int[] nums, int k)`: Finds maximum contiguous subarray average of fixed length $k$ in $\Theta(N)$ time and $O(1)$ space.
  - `public int NumOfSubarrays(int[] arr, int k, int threshold)`: Counts subarrays of length $k$ with average $\ge \text{threshold}$ in $\Theta(N)$ time.
  - `private void Slide(ref long windowSum, int incoming, int outgoing)`: In-place $\Delta$-state mutation in $O(1)$ time.
- **Preconditions:**
  - $1 \le k \le nums.Length \le 10^5$.
  - State transformation operation must possess an algebraic inverse (e.g., addition has subtraction; frequency counters have decrements).
- **Postconditions:**
  - Evaluates all $N - k + 1$ contiguous subsegments of length $k$ without redundant element traversals.
  - Returns exact global aggregate without floating-point precision degradation during iterative summation.
- **Complexity Bounds:**

| Implementation Pattern | Time Complexity | Auxiliary Space | Operations per Shift | Memory Allocation |
| :--- | :--- | :--- | :--- | :--- |
| **In-Place Sliding Window** | **$\Theta(N)$** | **$O(1)$** | 1 Add, 1 Sub, 1 Compare | Zero heap allocations |
| **Prefix Sum Array ($P$)** | $\Theta(N)$ | $O(N)$ | 1 Subtraction ($P[i+k] - P[i]$) | $(N+1) \times 4$ bytes |
| **Naive Slicing ($K$-recalculation)** | $O(N \cdot k)$ | $O(1)$ | $k$ additions per window | Zero |
| **LINQ `.Skip().Take().Sum()`** | $O(N \cdot k)$ | $O(k)$ garbage | Allocation churn + Iterator overhead | Heavy GC pressure |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
          Fixed Window Single-Pass Algorithmic Flow
                             │
            [Input: nums[], window size k]
                             │
             [Init: windowSum = 0, best = -INF]
                             │
                  [Loop: right = 0 to N-1]
                             │
            ┌────────────────┴────────────────┐
            ▼                                 │
     1. Add Incoming:                         │
        windowSum += nums[right]              │
            │                                 │
            ▼                                 │
     2. Window Oversized? (right >= k)        │
        YES ──► windowSum -= nums[right - k]  │
        NO  ──► continue                      │
            │                                 │
            ▼                                 │
     3. Window Full? (right >= k - 1)         │
        YES ──► best = Max(best, windowSum)   │
        NO  ──► continue                      │
            │                                 │
            └────────────────┬────────────────┘
                             │
                  [Loop Complete (right == N)]
                             │
                             ▼
                [Return best (or best / k)]
```

---

#### Dimension 3: Visual ASCII State Transitions

##### Sliding Window $\Delta$-Transition Pipeline
```
Array: [ 1,  12, -5, -6,  50,   3 ],  K = 4

Step 0: Priming (right = 0..2)
[ 1,  12, -5 ], -6,  50,   3        sum = 8          (Incomplete: len < 4)

Step 1: First Full Window (right = 3)
┌──────────────────────┐
│  1   12   -5   -6    │  50    3   sum = 2          best = 2
└──────────────────────┘
   0    1    2    3

Step 2: Slide Window Right (right = 4)
- Outgoing: nums[4 - 4] = nums[0] (value: 1) leaves left boundary
+ Incoming: nums[4] (value: 50) enters right boundary
      ┌──────────────────────┐
   1  │ 12   -5   -6    50   │  3   sum = 2 - 1 + 50 = 51   best = 51
      └──────────────────────┘
         1    2    3     4

Step 3: Slide Window Right (right = 5)
- Outgoing: nums[5 - 4] = nums[1] (value: 12) leaves left boundary
+ Incoming: nums[5] (value: 3) enters right boundary
           ┌──────────────────────┐
   1   12  │ -5   -6    50    3   │ sum = 51 - 12 + 3 = 42  best = 51
           └──────────────────────┘
              2    3     4    5
```

---

#### Dimension 4: Invariant Preservation Proof

##### Loop Invariant:
At the termination of each loop iteration for index `right`:
1. If $right < k - 1$, `windowSum` equals $\sum_{j=0}^{right} nums[j]$ (window is actively priming).
2. If $right \ge k - 1$, `windowSum` equals $\sum_{j=right-k+1}^{right} nums[j]$ (window represents exactly the contiguous slice of length $k$ terminating at `right`).

##### Proof by Mathematical Induction on `right`:
- **Base Case ($right = k - 1$):**
  - Loop executes for $right = 0, 1, \dots, k-1$.
  - Incoming elements $nums[0], \dots, nums[k-1]$ are added.
  - Since $right < k$ for all these steps, the exit condition `right >= k` never triggers; no elements are subtracted.
  - At $right = k - 1$, `windowSum` $= \sum_{j=0}^{k-1} nums[j]$. Window length is $(k-1) - 0 + 1 = k$. Invariant holds.
- **Inductive Step ($right \ge k$):**
  - Assume by induction that at the end of iteration $right - 1$, `windowSum` holds the sum of window ending at $right - 1$:
    $$S_{right-1} = \sum_{j=right-k}^{right-1} nums[j]$$
  - In iteration $right$:
    1. Incoming addition: $S' = S_{right-1} + nums[right] = \sum_{j=right-k}^{right} nums[j]$. Length is $k + 1$.
    2. Since $right \ge k$, the removal condition evaluates to `true`.
       Subtract outgoing element $nums[right - k]$:
       $$S_{right} = S' - nums[right - k] = \left(\sum_{j=right-k}^{right} nums[j]\right) - nums[right - k] = \sum_{j=right-k+1}^{right} nums[j]$$
    3. The resulting sum covers elements from index $right - k + 1$ to $right$, which is exactly $k$ elements.
  - Invariant is preserved for all $right \ge k - 1$.
- **Termination:**
  - Loop terminates after $right = N - 1$.
  - Exactly $(N - 1) - (k - 1) + 1 = N - k + 1$ windows of length $k$ were evaluated. Completeness is guaranteed. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Scenario | Concrete Input | Danger / Failure Mode | Invariant Protection Mechanism |
| :--- | :--- | :--- | :--- |
| **$K = 1$ (Unit Window)** | `nums = [-5, 3]`, $k = 1$ | Subtraction condition triggers immediately | At $right = 0$, $right \ge k-1$ evaluates `true` (evaluates `nums[0]`). At $right = 1$, $right \ge 1$ subtracts `nums[0]` and adds `nums[1]`. Correctly processes singletons. |
| **$K = N$ (Single Global Window)** | `nums = [1, 2, 3]`, $k = 3$ | Over-iteration or null subtraction | `right >= k` never triggers because $right \in [0, 2] < 3$. Evaluates exactly once at $right = 2$. |
| **All Negative Values** | `nums = [-8, -3, -5]`, $k = 2$ | Initializing `maxSum = 0` yields false maximum of 0 | Initialize `bestSum = long.MinValue` (or initial sum of first $k$ elements) to avoid zero-clamping negative sums. |
| **Integer Arithmetic Overflow** | $10^5$ items of $10^4$, $k = 10^5$ | Sum exceeds $2^{31}-1 \approx 2.14 \times 10^9$ | Maintain `windowSum` as 64-bit signed `long`. Cast to `double` only when returning average. |
| **Integer Division Truncation** | Average of `[1, 0]`, $k=2$ | Integer division `1 / 2 = 0` instead of `0.5` | Cast dividend to `double` before dividing: `(double)maxSum / k`. |

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 643 — Maximum Average Subarray I (Easy)

> You are given an integer array `nums` consisting of `n` elements, and an integer `k`.
> Find a contiguous subarray whose **length is equal to `k`** that has the maximum average value and return this value. Any answer with a calculation error less than $10^{-5}$ will be accepted.

#### Visual Trace:
`nums = [ 1, 12, -5, -6, 50, 3 ]`, `k = 4`

```
right = 0: val =  1, window = [1],               right < 3 (forming...)
right = 1: val = 12, window = [1, 12],           right < 3 (forming...)
right = 2: val = -5, window = [1, 12, -5],       right < 3 (forming...)
right = 3: val = -6, window = [1, 12, -5, -6],   sum = 2. Window formed! maxSum = 2.
right = 4: val = 50, drop nums[0]=1.  sum = 2 + 50 - 1 = 51.  maxSum = max(2, 51) = 51.
right = 5: val =  3, drop nums[1]=12. sum = 51 + 3 - 12 = 42. maxSum = max(51, 42) = 51.

Result = 51 / 4.0 = 12.75
```

#### Production C# Implementation:
```csharp
public class SolutionMaxAverageSubarray {
    public double FindMaxAverage(int[] nums, int k) {
        int windowSum = 0;

        // Build initial window of size k
        for (int i = 0; i < k; i++) {
            windowSum += nums[i];
        }

        int maxSum = windowSum;

        // Slide window from k to end
        for (int i = k; i < nums.Length; i++) {
            windowSum += nums[i] - nums[i - k];
            if (windowSum > maxSum) {
                maxSum = windowSum;
            }
        }

        // Divide by k once at the end
        return (double)maxSum / k;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — single pass over the array.
- **Space Complexity:** $O(1)$ auxiliary space.

---

### Problem 2: LeetCode 1456 — Maximum Number of Vowels in a Substring of Given Length (Medium)

> Given a string `s` and an integer `k`, return the *maximum number of vowel letters in any substring of `s` with length `k`*.
> Vowel letters in English are `'a'`, `'e'`, `'i'`, `'o'`, and `'u'`.

#### Optimization: Fast Vowel Lookup & Early Termination
1. Checking if a character is a vowel using a switch statement or bitmask is significantly faster than HashSet lookup.
2. **Early Exit:** If `currentVowels == k`, we can immediately return `k`! It is impossible for a window of size $k$ to contain more than $k$ vowels.

#### Visual Trace:
`s = "abciiidef"`, `k = 3`

```
i = 0 ('a' is vowel): count = 1
i = 1 ('b' not vowel): count = 1
i = 2 ('c' not vowel): count = 1. First window "abc" formed -> max = 1
i = 3 ('i' is vowel): enters 'i' (+1), exits s[0]='a' (-1) -> count = 1 - 1 + 1 = 1
i = 4 ('i' is vowel): enters 'i' (+1), exits s[1]='b' ( 0) -> count = 1 - 0 + 1 = 2
i = 5 ('i' is vowel): enters 'i' (+1), exits s[2]='c' ( 0) -> count = 2 - 0 + 1 = 3
  Early exit triggered! count == k (3 == 3). Return 3 immediately.
```

#### Production C# Implementation:
```csharp
public class SolutionMaxVowels {
    public int MaxVowels(string s, int k) {
        int currentVowels = 0;

        // Build first window of size k
        for (int i = 0; i < k; i++) {
            if (IsVowel(s[i])) currentVowels++;
        }

        int maxVowels = currentVowels;
        if (maxVowels == k) return k; // Cannot exceed k

        // Slide the window
        for (int i = k; i < s.Length; i++) {
            if (IsVowel(s[i])) currentVowels++;
            if (IsVowel(s[i - k])) currentVowels--;

            if (currentVowels > maxVowels) {
                maxVowels = currentVowels;
                if (maxVowels == k) return k; // Early exit
            }
        }

        return maxVowels;
    }

    [System.Runtime.CompilerServices.MethodImpl(
        System.Runtime.CompilerServices.MethodImplOptions.AggressiveInlining)]
    private static bool IsVowel(char c) {
        return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — single pass; constant-time vowel check per character.
- **Space Complexity:** $O(1)$ auxiliary space.

---

### Problem 3: LeetCode 1343 — Number of Sub-arrays of Size k and Average Greater than or Equal to Threshold (Medium)

> Given an array of integers `arr` and two integers `k` and `threshold`, return *the number of sub-arrays of size `k` and average greater than or equal to `threshold`*.

#### Eliminating Division:
Instead of testing $\frac{\text{sum}}{k} \ge \text{threshold}$, multiply both sides by $k$:

$$\text{sum} \ge k \times \text{threshold}$$

We precalculate `targetSum = k * threshold` once. Now each window check is a single integer comparison!

#### Production C# Implementation:
```csharp
public class SolutionNumOfSubarrays {
    public int NumOfSubarrays(int[] arr, int k, int threshold) {
        int targetSum = k * threshold;
        int currentSum = 0;
        int count = 0;

        // Pre-fill first window
        for (int i = 0; i < k; i++) {
            currentSum += arr[i];
        }

        if (currentSum >= targetSum) {
            count++;
        }

        // Slide window
        for (int i = k; i < arr.Length; i++) {
            currentSum += arr[i] - arr[i - k];
            if (currentSum >= targetSum) {
                count++;
            }
        }

        return count;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — linear scan.
- **Space Complexity:** $O(1)$ auxiliary space.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Solve these problems to master fixed window boundaries:

### Problem 1 (The Baseline): LeetCode 643 — Maximum Average Subarray I (Easy)
- **Goal:** Find maximum average of length $K$.
- **Key Insight:** Maximize integer sum, divide by $K$ once at return.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 2 (Character Sliding): LeetCode 1456 — Maximum Number of Vowels in Substring of Length K (Medium)
- **Goal:** Max vowels in substring of length $K$.
- **Key Insight:** Inline vowel checking + early termination when `count == k`.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 3 (Threshold Target): LeetCode 1343 — Number of Sub-arrays of Size k and Average >= Threshold (Medium)
- **Goal:** Count windows of size $k$ meeting the condition.
- **Key Insight:** Compare `currentSum >= k * threshold` to eliminate division.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Bonus / Extension Challenge: LeetCode 1052 — Grumpy Bookstore Owner (Medium)
- **Goal:** Maximize satisfied customers by choosing a contiguous window of minutes $K$ where owner suppresses grumpiness.
- **Hint:** Base satisfied customers are always counted; use a fixed window of size $K$ to maximize the *additional* customers saved.

---

## 4. 🔗 CONNECT: The Sliding Window Progression

```
Sliding Window Hierarchy:
  ├─ Fixed-Size Window (Day 11)
  │    Length is CONSTANT K. Exactly 1 element enters, 1 leaves per step.
  │
  ├─ Variable-Size Window (Day 12 - Tomorrow)
  │    Length expands (right++) until invalid, then contracts (left++) until valid.
  │    Solves "shortest" or "longest" subarray matching a dynamic condition.
  │
  └─ Window with Frequency Map (Day 13)
       Tracks alphabet state (Anagrams, Permutations, Minimum Window Substring).
```

---

## 5. 🎯 Day 11 Checkpoint Questions

Test your sliding window boundary mechanics:

1. **Window Formation Index:** In the unified loop idiom (`for (int right = 0; right < N; right++)`), what is the exact index of `right` when the very first valid window of size $K$ is formed?
2. **Early Termination:** In LeetCode 1456 (Max Vowels), why is checking `if (maxVowels == k) return k;` mathematically safe to do anywhere during the iteration?
3. **Threshold Multiplication:** Why is `sum >= k * threshold` superior to `sum / k >= threshold` in terms of both CPU cycles and numeric correctness?
