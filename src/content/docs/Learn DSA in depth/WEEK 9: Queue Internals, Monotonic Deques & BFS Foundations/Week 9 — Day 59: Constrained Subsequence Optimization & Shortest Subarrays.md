---
title: "Week 9 — Day 59: Constrained Subsequence Optimization & Shortest Subarrays"
---

# Week 9 — Day 59: Constrained Subsequence Optimization & Shortest Subarrays

Welcome to **Day 59 of your DSA Mastery Journey**!

Yesterday in [Day 58](./Week%209%20%E2%80%94%20Day%2058:%20Deque%20Data%20Structure%20From%20Scratch,%20Monotonic%20Deque%20&%20The%20Sliding%20Window%20Maximum.md), we implemented `CircularArrayDeque<T>` and `LinkedDeque<T>` from scratch and tackled sliding window extrema in $O(N)$ time.

Today, we confront the **most intellectually demanding frontier of Monotonic Deques**:
1. **The Failure of Two Pointers:** Why non-monotonic prefix sums (caused by negative numbers) shatter classic sliding window assumptions.
2. **Dual-Condition Monotonic Pruning:** How to combine prefix sums with a **Monotonically Increasing Deque** to solve the notorious **LeetCode 862 (Shortest Subarray with Sum at Least K)** in strict $O(N)$ time.
3. **Constrained Dynamic Programming:** Accelerating subsequence DP state transitions from $O(N \cdot K)$ to $O(N)$ using Monotonic Deques in **LeetCode 1425** and **LeetCode 1499**.

---

## 🧭 Executive Architecture: The Two-Pointer Breakdown & Deque Triumph

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    THE SUBARRAY SUM PARADOX                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

   CASE 1: All Elements are Positive (nums[i] >= 0)
   Prefix Sums P[i] are MONOTONICALLY INCREASING.
   As right pointer R expands, sum strictly grows.
   As left pointer L shrinks, sum strictly shrinks.
   ==> Classic Two-Pointer / Sliding Window works in O(N)!

   CASE 2: Array Contains Negative Numbers (nums[i] < 0 permitted)
   Prefix Sums P[i] FLUCTUATE WILDLY up and down.
   Expanding R might DECREASE the sum!
   Shrinking L might INCREASE the sum!
   ==> Two Pointers fails completely!
   ==> Monotonic Deque on Prefix Sums RESTORES O(N) OPTIMALITY.
```

---

## 1. 🧠 TEACH: Concept, Invariants & Mathematical Mechanics

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **Constrained Subsequence Optimization** uses Monotonic Deques to accelerate dynamic programming transitions and prune non-monotonic prefix sum spaces.
  - *Core Invariants:* DP Transition Invariant: In $dp[i] = nums[i] + \max(0, \max_{i-k \le j < i}(dp[j]))$, the monotonic deque maintains candidate $dp[j]$ values in descending order; Non-Monotonic Prefix Pruning Invariant (LC 862): If $P[i] \le P[D[\text{back}]]$, pop back (a smaller prefix at a later index is always superior for future subarrays).
  - *Misconception Check:* In LeetCode 862 (Shortest Subarray with Sum at Least K), standard two-pointer sliding window fails because array contains negative numbers; using a monotonic increasing deque on prefix sums restores optimal $O(N)$ time.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(K)$ inner loop scan in dynamic programming recurrences and overcomes negative-number non-monotonicity in subarray problems.
  - *Complexity Advantage:* Reduces time complexity from $O(N \times K)$ to strict $O(N)$ amortized linear time.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Constrained Subsequence Sum" (LC 1425), "Shortest Subarray with Sum at Least K" (LC 862), "Jump Game VI" (LC 1696). Signal words: "constrained subsequence", "shortest subarray with sum at least k", "sliding window DP".
  - *When to Avoid / Failure Modes:* When transitions depend on multiple dimensions or non-contiguous ranges (requires Segment Tree or Convex Hull Trick).
- **4. WHERE:**
  - *Physical CLR Memory:* 64-bit prefix sum array `long[] P` to avoid integer overflow; double-ended index deque in CLR heap.
  - *Production Systems:* Financial algorithmic trading lookback windows with transaction costs, constrained resource path scheduling.
- **5. WHO:**
  - *Spoken Script:* "In LeetCode 862, because the array contains negative numbers, prefix sums are non-monotonic, breaking standard two-pointer sliding window. I use a monotonic increasing deque of prefix indices: when a valid range $P[i] - P[\text{front}] \ge K$ is found, front is popped because it cannot yield a shorter subarray later."
  - *Interviewer Evaluation Lens:* Evaluates why standard sliding window fails on negative numbers, why front can be popped greedily, and why back can be pruned monotonically.
- **6. HOW:**
  - *Cost Model:* Time: $O(N)$ amortized linear time; Space: $O(N)$ auxiliary space.
  - *State Transition Trace (LC 862):* `For index i: while(P[i] - P[D.front] >= K) { minLen = min(minLen, i - D.popFront()); } while(!empty && P[i] <= P[D.back]) D.popBack(); D.pushBack(i)`.


### 1.1 The Prefix Sum Transformation

Recall that any subarray sum from index $j$ to index $i - 1$ can be expressed as the difference of two prefix sums:

$$\text{Sum}(nums[j \dots i - 1]) = P[i] - P[j]$$

Where the prefix sum array $P$ is defined with a base sentinel $P[0] = 0$:
$$P[k] = \sum_{m=0}^{k-1} nums[m], \quad 0 \le k \le N$$

We seek a pair of indices $(j, i)$ with $0 \le j < i \le N$ such that:
$$P[i] - P[j] \ge K \quad \text{minimizing the subarray length } (i - j)$$

---

### 1.2 The Two Fatal Traps of Naive Search

1. **Brute Force:** Testing every pair $(j, i)$ requires checking $\frac{N(N+1)}{2}$ intervals $\implies O(N^2)$ time. For $N = 10^5$, $10^{10}$ operations result in a devastating **Time Limit Exceeded (TLE)**.
2. **Binary Search + Prefix Min:** Trying to binary search for the best $j$ fails because the prefix sum array $P$ is not sorted when $nums$ contains negative numbers.

---

### 1.3 The Monotonic Increasing Deque of Prefix Sums

To achieve $O(N)$ time, we iterate through $i$ from $0$ to $N$, maintaining candidate left indices $j$ in a **Monotonically Increasing Deque** of prefix sums:

$$P[\text{deque}[0]] < P[\text{deque}[1]] < P[\text{deque}[2]] < \dots < P[\text{deque}[\text{back}]]$$

At each step $i$, we execute two profound pruning passes:

#### Pass 1: Pruning from the Front (Shortest Subarray Realized)
```
While Deque is not empty AND P[i] - P[deque.First] >= K:
    Record valid length: minLen = min(minLen, i - deque.First)
    deque.PopFirst()   <=== PERMANENTLY EVICTED!
```

> [!IMPORTANT]
> ### 💡 Why Can We Permanently Evict `deque.First` from the Front?
> Suppose at index $i$, we find that $P[i] - P[j] \ge K$, where $j = \text{deque.First}$.
> We record $i - j$ as a candidate minimum length.
>
> Now consider any future right boundary $i' > i$:
> If $P[i'] - P[j] \ge K$ also holds, the length of that new subarray would be:
> $$i' - j > i - j$$
> Because $i' > i$, the subarray starting at $j$ and ending at $i'$ is **strictly longer** than the subarray ending at $i$!
> Since our objective is to find the **shortest** subarray, index $j$ can **NEVER** beat $i - j$ in any future step!
>
> Therefore, $j$ has yielded its absolute best possible contribution and can be **permanently discarded** from the front of the deque!

---

#### Pass 2: Pruning from the Back (Candidate Elimination Invariant)
```
While Deque is not empty AND P[i] <= P[deque.Last]:
    deque.PopLast()    <=== PERMANENTLY PRUNED!
```

> [!IMPORTANT]
> ### 💡 Why Can We Permanently Prune `deque.Last` from the Back?
> Suppose we are at index $i$, and the back of our deque contains index $j$ where:
> $$j < i \quad \text{and} \quad P[j] \ge P[i]$$
> Now consider any future right endpoint $i' > i$.
>
> Let us compare using $j$ as a starting point versus using $i$ as a starting point:
> 1. **Sum Comparison:** Since $P[i] \le P[j]$, subtracting $P[i]$ yields a larger (or equal) sum:
>    $$P[i'] - P[i] \ge P[i'] - P[j]$$
>    If $P[i'] - P[j] \ge K$ is satisfied, then $P[i'] - P[i] \ge K$ is **guaranteed** to be satisfied as well!
> 2. **Length Comparison:** Since $j < i$, starting from $i$ gives a strictly shorter length:
>    $$i' - i < i' - j$$
>
> In both criteria—**subarray sum** and **subarray length**—the newer index $i$ completely and unequivocally **dominates** the older index $j$!
>
> Index $j$ is strictly inferior in every possible future scenario. It is dead weight and must be pruned from the back!

---

## 2. 💻 DEMONSTRATE: Canonical Invariant Visualization & Algorithmic Mechanics

### 2.1 Complete State Machine Walkthrough for LeetCode 862

Let input be:
$$nums = [2, -1, 2, 1], \quad K = 3$$

#### Step 0: Compute Prefix Sums (with 64-bit `long` to prevent overflow)
$$P = [0, 2, 1, 3, 4] \quad (\text{Indices } 0 \dots 4)$$

```
Index:    0    1    2    3    4
nums[i]:  -    2   -1    2    1
P[i]:     0    2    1    3    4
```

#### Step-by-Step Deque State Evolution:

```
──────────────────────────────────────────────────────────────────────────────────────────────────
Step i = 0 (P[0] = 0):
  Front Check: Deque empty.
  Back Check:  Deque empty.
  Enqueue:     PushLast(0).
  Deque:       [ 0 ]              (P values: [0])
  MinLength:   ∞

──────────────────────────────────────────────────────────────────────────────────────────────────
Step i = 1 (P[1] = 2):
  Front Check: P[1] - P[0] = 2 - 0 = 2 < 3. (Condition not met).
  Back Check:  P[1] = 2 > P[0] = 0. (Monotonic increasing order preserved).
  Enqueue:     PushLast(1).
  Deque:       [ 0, 1 ]           (P values: [0, 2])
  MinLength:   ∞

──────────────────────────────────────────────────────────────────────────────────────────────────
Step i = 2 (P[2] = 1):
  Front Check: P[2] - P[0] = 1 - 0 = 1 < 3.
  Back Check:  P[2] = 1 <= P[1] = 2  ===> DOMINATED! PopLast(1)!
               Index 1 has larger P and older index. Pruned!
               P[2] = 1 > P[0] = 0.
  Enqueue:     PushLast(2).
  Deque:       [ 0, 2 ]           (P values: [0, 1])
  MinLength:   ∞

──────────────────────────────────────────────────────────────────────────────────────────────────
Step i = 3 (P[3] = 3):
  Front Check: P[3] - P[0] = 3 - 0 = 3 >= K (3)  ===> VALID!
               Candidate Length = 3 - 0 = 3. MinLength = 3.
               PopFirst(0)! (Index 0 can never yield shorter length).
               Next front is index 2: P[3] - P[2] = 3 - 1 = 2 < 3. Stop.
  Back Check:  P[3] = 3 > P[2] = 1.
  Enqueue:     PushLast(3).
  Deque:       [ 2, 3 ]           (P values: [1, 3])
  MinLength:   3

──────────────────────────────────────────────────────────────────────────────────────────────────
Step i = 4 (P[4] = 4):
  Front Check: P[4] - P[2] = 4 - 1 = 3 >= K (3)  ===> VALID!
               Candidate Length = 4 - 2 = 2. MinLength = min(3, 2) = 2.
               PopFirst(2)!
               Next front is index 3: P[4] - P[3] = 4 - 3 = 1 < 3. Stop.
  Back Check:  P[4] = 4 > P[3] = 3.
  Enqueue:     PushLast(4).
  Deque:       [ 3, 4 ]           (P values: [3, 4])
  MinLength:   2

──────────────────────────────────────────────────────────────────────────────────────────────────
Final Answer: 2 (Subarray nums[2..3] = [2, 1], Sum = 3 >= 3, Length = 2).
```

---

## 3. 🔬 COMPLEXITY & MATHEMATICAL INVARIANTS

### 3.1 Theorem: Strict Amortized $\Theta(N)$ Complexity Proof

We prove that the dual-pruning monotonic deque algorithm runs in strict $O(N)$ time despite containing two nested `while` loops inside the main `for` loop.

> [!TIP]
> ### 🧮 Proof via Potential Method ($\Phi$)
>
> Let our data structure be the Monotonic Deque $D$.
> Define the **Potential Function** $\Phi$ after processing step $i$ as the number of elements currently stored in the deque:
> $$\Phi_i = |D_i|$$
>
> **Properties of $\Phi$:**
> 1. Base potential: $\Phi_0 = 0$ (empty deque).
> 2. Non-negativity: $\forall i \ge 0, \Phi_i \ge 0$.
>
> **Amortized Cost Analysis for Step $i$:**
> In step $i$, let:
> - $c_i$ be the actual number of operations: $1$ insertion + $k_{\text{front}}$ front pops + $k_{\text{back}}$ back pops.
> - The actual cost is:
>   $$c_i = 1 + k_{\text{front}} + k_{\text{back}}$$
> - The change in potential is:
>   $$\Delta \Phi_i = \Phi_i - \Phi_{i-1} = 1 - (k_{\text{front}} + k_{\text{back}})$$
>
> The **amortized cost** $\hat{c}_i$ is defined as:
> $$\hat{c}_i = c_i + \Delta \Phi_i = (1 + k_{\text{front}} + k_{\text{back}}) + (1 - k_{\text{front}} - k_{\text{back}}) = 2$$
>
> **Summing Over All $N + 1$ Steps:**
> $$\sum_{i=0}^{N} c_i = \sum_{i=0}^{N} \hat{c}_i - (\Phi_{N} - \Phi_0) \le \sum_{i=0}^{N} 2 - 0 = 2(N + 1) = O(N)$$
>
> Thus, the total number of operations across the entire algorithm is bounded by $2(N + 1)$, establishing that each element incurs an **amortized cost of $O(1)$**, and the total execution time is **strictly $O(N)$**. $\blacksquare$

---

## 4. 🛠️ PRACTICE: Canonical Big Tech Problem Walkthroughs

---

### 4.1 Problem 1: [LeetCode 862] Shortest Subarray with Sum at Least K (Hard)

> **Problem Description:**
> Given an integer array `nums` and an integer `k`, return *the length of the shortest non-empty subarray of `nums` with a sum of at least `k`*. If there is no such subarray, return `-1`.
>
> **Constraints:**
> - $1 \le \text{nums.Length} \le 10^5$
> - $-10^5 \le \text{nums}[i] \le 10^5$
> - $1 \le k \le 10^9$

#### 1. Implementation Nuances
- **Prefix Sum Overflow:** With $N = 10^5$ and $\text{nums}[i] = 10^5$, the prefix sum can reach $10^{10}$, overflowing a standard 32-bit signed integer (`int.MaxValue` $\approx 2.14 \times 10^9$). We **must use `long`** for prefix sums!
- **Zero-Allocation Array Deque:** Instead of `LinkedList<int>`, use a flat `int[]` of size $N + 1$ with `head` and `tail` pointers for maximum cache performance.

#### 2. Production C# Implementation

```csharp
public class Solution
{
    public int ShortestSubarray(int[] nums, int k)
    {
        if (nums == null || nums.Length == 0) return -1;

        int n = nums.Length;

        // 1. Build prefix sums with 64-bit long to prevent arithmetic overflow
        // P[0] = 0, P[i] = sum(nums[0..i-1])
        long[] p = new long[n + 1];
        for (int i = 0; i < n; i++)
        {
            p[i + 1] = p[i] + nums[i];
        }

        // 2. High-performance flat array acting as double-ended queue of indices
        // Storing indices 0 through n
        int[] deque = new int[n + 1];
        int head = 0;
        int tail = 0; // Active range: [head, tail)

        int minLength = int.MaxValue;

        // 3. Process each prefix sum P[i]
        for (int i = 0; i <= n; i++)
        {
            long currentP = p[i];

            // Condition 1: Prune from front
            // If P[i] - P[deque[head]] >= k, we found a valid subarray.
            // Since i is advancing rightward, deque[head] will never yield a shorter
            // subarray for any future i' > i, so permanently pop it!
            while (tail > head && currentP - p[deque[head]] >= k)
            {
                int candidateLength = i - deque[head];
                if (candidateLength < minLength)
                {
                    minLength = candidateLength;
                }
                head++; // Pop front in O(1)
            }

            // Condition 2: Prune from back
            // If P[i] <= P[deque[tail - 1]], the index deque[tail - 1] is completely dominated:
            // currentP is smaller (easier to reach >= k) and has a larger index (shorter length).
            // Thus, deque[tail - 1] can never be optimal. Prune it!
            while (tail > head && currentP <= p[deque[tail - 1]])
            {
                tail--; // Pop back in O(1)
            }

            // Enqueue current index
            deque[tail++] = i;
        }

        return minLength == int.MaxValue ? -1 : minLength;
    }
}
```

#### 3. Complexity
- **Time Complexity:** $O(N)$ amortized. Each index $0 \dots N$ enters and exits the deque at most once.
- **Space Complexity:** $O(N)$ for the `p` and `deque` arrays.

---

### 4.2 Problem 2: [LeetCode 1425] Constrained Subsequence Sum (Hard)

> **Problem Description:**
> Given an integer array `nums` and an integer `k`, return the maximum sum of a **non-empty** subsequence of that array such that for every two **consecutive** integers in the subsequence, `nums[i]` and `nums[j]`, where $i < j$, the condition $j - i \le k$ is satisfied.
>
> **Constraints:**
> - $1 \le k \le \text{nums.Length} \le 10^5$
> - $-10^4 \le \text{nums}[i] \le 10^4$

#### 1. Dynamic Programming Formulation & Monotonic Deque Transition
Let $dp[i]$ be the maximum subsequence sum ending at index $i$:
$$dp[i] = nums[i] + \max\left(0, \max_{j = \max(0, i - k)}^{i - 1} dp[j]\right)$$

- We add $\max(0, \dots)$ because if all preceding $dp[j]$ are negative, we are better off starting a new subsequence at $nums[i]$.
- To compute $\max_{j \in [i - k, i - 1]} dp[j]$ in $O(1)$ time, we maintain a **Monotonic Decreasing Deque** of indices $j$, ordered by $dp[j]$ descending.

#### 2. Production C# Implementation

```csharp
public class Solution
{
    public int ConstrainedSubsetSum(int[] nums, int k)
    {
        if (nums == null || nums.Length == 0) return 0;

        int n = nums.Length;
        int[] dp = new int[n];

        // Deque storing indices j such that dp[j] is monotonically decreasing
        int[] deque = new int[n];
        int head = 0;
        int tail = 0;

        int globalMax = int.MinValue;

        for (int i = 0; i < n; i++)
        {
            // 1. Evict indices outside the allowed jump boundary [i - k, i - 1]
            while (tail > head && deque[head] < i - k)
            {
                head++; // Pop front
            }

            // 2. Best preceding sum is at the front of the deque
            int maxPreceding = (tail > head && dp[deque[head]] > 0) ? dp[deque[head]] : 0;
            dp[i] = nums[i] + maxPreceding;

            if (dp[i] > globalMax)
            {
                globalMax = dp[i];
            }

            // 3. Maintain monotonic decreasing order of dp values in deque
            while (tail > head && dp[deque[tail - 1]] <= dp[i])
            {
                tail--; // Pop back
            }

            // 4. Enqueue current index
            deque[tail++] = i;
        }

        return globalMax;
    }
}
```

#### 3. Complexity
- **Time Complexity:** $O(N)$ amortized. Each index is pushed and popped at most once.
- **Space Complexity:** $O(N)$ for the `dp` and `deque` buffers.

---

### 4.3 Problem 3: [LeetCode 1499] Max Value of Equation (Hard)

> **Problem Description:**
> You are given an array `points` containing the coordinates of points on a 2D plane, sorted by the x-values, where `points[i] = [xi, yi]` such that $x_i < x_j$ for all $1 \le i < j \le \text{points.Length}$. You are also given an integer $k$.
>
> Return *the maximum value of the equation* $y_i + y_j + |x_i - x_j|$ where $|x_i - x_j| \le k$ and $1 \le i < j \le \text{points.Length}$.
>
> **Constraints:**
> - $2 \le \text{points.Length} \le 10^5$
> - $-10^8 \le x_i, y_i \le 10^8$
> - $0 \le k \le 2 \cdot 10^8$
> - $x_i < x_{i+1}$ for all valid $i$.

#### 1. Algebraic Decomposition
Because the points are strictly sorted by $x$-coordinate, for any $i < j$, we know $x_j > x_i$. Therefore, $|x_i - x_j| = x_j - x_i$.
Substituting this into the equation:
$$\text{Value} = y_i + y_j + (x_j - x_i) = (y_i - x_i) + (y_j + x_j)$$

For a fixed index $j$, the term $(y_j + x_j)$ is a constant! To maximize the total value, we need to find an index $i < j$ such that:
1. $x_j - x_i \le k$
2. $(y_i - x_i)$ is **maximized**.

This is a classic sliding window maximum over the transformed value $y_i - x_i$!
We maintain a **Monotonic Decreasing Deque** of pairs $(y_i - x_i, x_i)$.

#### 2. Production C# Implementation

```csharp
public class Solution
{
    public int FindMaxValueOfEquation(int[][] points, int k)
    {
        int n = points.Length;
        int maxResult = int.MinValue;

        // Flat array deque storing indices i
        // Invariant: points[deque[i]][1] - points[deque[i]][0] is strictly decreasing
        int[] deque = new int[n];
        int head = 0;
        int tail = 0;

        for (int j = 0; j < n; j++)
        {
            int xj = points[j][0];
            int yj = points[j][1];

            // 1. Evict stale points where xj - xi > k from the front
            while (tail > head && xj - points[deque[head]][0] > k)
            {
                head++;
            }

            // 2. The front of the deque holds the maximum (yi - xi)
            if (tail > head)
            {
                int bestI = deque[head];
                int candidate = (points[bestI][1] - points[bestI][0]) + (yj + xj);
                if (candidate > maxResult)
                {
                    maxResult = candidate;
                }
            }

            // 3. Maintain monotonic decreasing order of (yi - xi)
            int currentDiff = yj - xj;
            while (tail > head)
            {
                int backIdx = deque[tail - 1];
                int backDiff = points[backIdx][1] - points[backIdx][0];
                if (backDiff <= currentDiff)
                {
                    tail--; // Prune dominated point
                }
                else
                {
                    break;
                }
            }

            // 4. Enqueue current point
            deque[tail++] = j;
        }

        return maxResult;
    }
}
```

#### 3. Complexity
- **Time Complexity:** $O(N)$. Each point enters and leaves the deque at most once.
- **Space Complexity:** $O(N)$ for the index deque buffer.

---

## 5. ⚡ HARDWARE & SYSTEMS CONNECTIONS

### 5.1 SIMD Vectorization & Prefix Sum Accumulation

In modern CPU microarchitectures (Intel AVX-512, ARM Neon):
- Sequential prefix sum calculation $P[i] = P[i-1] + A[i]$ creates a **Loop-Carried Dependency Chain** where instruction $i$ must wait for instruction $i-1$ to retire, limiting instruction-level parallelism (ILP).
- High-performance data-processing engines (e.g., Apache Arrow, ClickHouse, DuckDB) compute vectorized prefix sums using **SIMD Scan Primitives** (such as parallel prefix add tree reductions), populating 16 integers per CPU cycle.
- Once the prefix sum array is vectorized in L1 cache, feeding it into a branchless monotonic deque achieves throughput in excess of **1.2 GB/second** on single-core execution!

### 5.2 Financial Systems: Sliding Window Risk Bottlenecks
- In algorithmic trade execution, a risk engine must verify that the **maximum cumulative drawdown** over any sliding time window $T$ does not breach a loss threshold $K$.
- Because tick returns can be negative, standard moving-window accumulators fail to detect localized drop spikes. The **Monotonic Deque on Prefix Drawdowns** is the industry standard for real-time risk compliance engines.

---

## 6. ⚠️ DAILY ERROR LOG & COMMON TRAPS

### Trap 1: 32-bit Integer Overflow in Prefix Sums
- **The Bug:** Declaring prefix sum array as `int[] p = new int[n + 1]`.
- **The Failure:** If array contains large numbers (e.g. $10^5 \times 10^5 = 10^{10}$), `int` overflows to negative numbers. Subtraction comparisons give completely bogus results.
- **The Fix:** Always use `long[] p` for cumulative sums in LeetCode 862.

### Trap 2: Omitting the Base Case Sentinel $P[0] = 0$
- **The Bug:** Sizing the prefix sum array to $N$ and starting loop from $0$.
- **The Failure:** Subarrays starting from the very first element ($nums[0 \dots i]$) are ignored because there is no $P[0] = 0$ to subtract from!
- **The Fix:** Prefix array size is **$N + 1$** with $P[0] = 0$. Enqueue $0$ before or during iteration.

### Trap 3: Prematurely Popping the Front
- **The Bug:** Popping `deque[head]` before checking if $P[i] - P[\text{deque}[head]] \ge K$.
- **The Failure:** Valid candidates are discarded before their condition is tested.
- **The Fix:** Only advance `head++` inside a `while (currentP - p[deque[head]] >= k)` block!

### Trap 4: Using `<` Instead of `<=` When Pruning the Back
- **The Bug:** `while (currentP < p[deque[tail - 1]])`.
- **The Failure:** When equal prefix sums exist ($P[i] == P[j]$ with $j < i$), the older index $j$ is kept. But $i$ has a larger index and will ALWAYS yield a shorter subarray!
- **The Fix:** Prune aggressively with `<=`: `while (currentP <= p[deque[tail - 1]])`.

---

## 7. 🎯 DAILY CHECKPOINT & SELF-ASSESSMENT

### 1. Conceptual Verification
1. Why does the standard Two-Pointer / Sliding Window algorithm fail to find the shortest subarray with sum $\ge K$ when the array contains negative numbers?
2. In [LeetCode 862], when $P[i] - P[\text{deque.First}] \ge K$, why are we guaranteed that $\text{deque.First}$ can never produce a shorter valid subarray with any future index $i' > i$?
3. In [LeetCode 1425], how does maintaining a monotonic deque of $dp$ values improve the runtime over a standard dynamic programming scan?

### 2. Implementation Audit
- Review the `while (currentP <= p[deque[tail - 1]])` back-pruning check in your solution. What is the mathematical justification for pruning an index with an *equal* prefix sum?

---
*Next Module: **Week 9 — Day 60: Queue-Based BFS Foundation & Level-Order Mechanics (LeetCode 102, 994, 286)***
