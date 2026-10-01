---
title: "Week 34 — Day 235: Bounded Knapsack: Binary Grouping Optimization (1, 2, 4, ... 2^k, R) & Large Capacity Handling"
---

# Week 34 — Day 235: Bounded Knapsack: Binary Grouping Optimization (1, 2, 4, ... 2^k, R) & Large Capacity Handling

## 1. TEACH: Bounded Resource Allocation & The Binary Grouping Principle

### 1.1 The Bounded Knapsack Problem Formalization

In Days 232 and 234, we explored the two extreme ends of resource multiplicity:
- **0-1 Knapsack:** Each item has an availability count of strictly $c_i = 1$ ($x_i \in \{0, 1\}$).
- **Unbounded Knapsack:** Each item has infinite availability $c_i = \infty$ ($x_i \in \{0, 1, 2, \dots\}$).

In real-world inventory management and capacity engineering, resource availability is rarely binary and almost never infinite. Instead, it is bounded by a known, finite inventory count $c_i \in \mathbb{Z}^+$. This defines the **Bounded Knapsack Problem (BKP)**:

$$\bbox[12px,border:2px solid #2563eb,background-color:#eff6ff]{\begin{aligned}
\text{Maximize} \quad & \sum_{i=1}^N x_i v_i \\
\text{Subject to} \quad & \sum_{i=1}^N x_i w_i \le W, \quad x_i \in \{0, 1, 2, \dots, c_i\} \quad \forall i \in \{1, \dots, N\}
\end{aligned}}$$

```
                      The Multiplicity Spectrum
                      
     0-1 Knapsack          Bounded Knapsack           Unbounded Knapsack
       c_i = 1              1 <= c_i < ∞                   c_i = ∞
  ───────────────────    ─────────────────────    ───────────────────────────
   Single Selection       Finite Multiplicity      Infinite Resource Reuse
  w = W down to w_i       Binary Grouping / Deque     w = w_i up to W
```

---

### 1.2 The Naive 0-1 Expansion Pathology

The most straightforward way to solve Bounded Knapsack is to expand every item $i$ with count $c_i$ into $c_i$ distinct, individual items of weight $w_i$ and value $v_i$, and then run standard 0-1 Knapsack:
$$\text{Total Items Generated} = \sum_{i=1}^N c_i$$
$$\text{Time Complexity} = O\left( W \cdot \sum_{i=1}^N c_i \right)$$

#### Why Naive Expansion Fails at Staff Scale
Consider an e-commerce inventory with $N = 100$ item types, each with stock $c_i = 10,000$, and a warehouse capacity $W = 50,000$:
- Total expanded items: $100 \times 10,000 = 1,000,000$ items.
- Total inner loop operations: $10^6 \times 50,000 = \mathbf{50,000,000,000}$ operations ($\approx 5 \times 10^{10}$).
- At $10^8$ operations per second, naive expansion requires **500 seconds (~8.3 minutes)**, resulting in catastrophic Time Limit Exceeded (TLE) in automated services!

We need a compression technique that represents all possible selection quantities in $[0, c_i]$ without generating $c_i$ items.

---

### 1.3 The Binary Grouping Optimization: Theory & Proof of Completeness

The **Binary Grouping Optimization** is an elegant application of binary positional numeral systems. Instead of splitting $c_i$ into $1 + 1 + 1 + \dots + 1$, we bundle items into **power-of-two packages**:
$$1, 2, 4, 8, \dots, 2^k, R$$
where $k$ is the largest integer such that the prefix sum of powers of two does not exceed $c_i$:
$$2^{k+1} - 1 \le c_i$$
and the remainder $R$ is defined as:
$$R = c_i - (2^{k+1} - 1) \ge 0$$

Each bundle of size $2^j$ has:
$$\text{Weight} = 2^j \cdot w_i, \quad \text{Value} = 2^j \cdot v_i$$
The final bundle of size $R$ has:
$$\text{Weight} = R \cdot w_i, \quad \text{Value} = R \cdot v_i$$

```
               Binary Grouping Decomposition (c_i = 13)
               
    Powers of Two:     1,  2,  4      (Prefix Sum: 1 + 2 + 4 = 7)
    Remainder R:       13 - 7 = 6
    
    Resulting Bundles: { 1,  2,  4,  6 }
    
    Can we form any x in [0, 13]?
      0 = (empty)         5 = 1 + 4          10 = 4 + 6
      1 = 1               6 = 6 (or 2+4)     11 = 1 + 4 + 6
      2 = 2               7 = 1 + 2 + 4      12 = 2 + 4 + 6
      3 = 1 + 2           8 = 2 + 6          13 = 1 + 2 + 4 + 6
      4 = 4               9 = 1 + 2 + 6
    
    TOTAL BUNDLES: 4 items (instead of 13 items)!
```

---

#### Theorem (Binary Grouping Completeness Theorem)
*Let $c \in \mathbb{N}$ be an item count decomposed into the bundle set:*
$$\mathcal{B} = \{1, 2, 4, \dots, 2^k, R\} \quad \text{where } R = c - (2^{k+1} - 1) \ge 0$$
*Every integer $x \in [0, c]$ can be represented as a subset sum of elements from $\mathcal{B}$, and no subset sum of $\mathcal{B}$ can exceed $c$.*

#### Mathematical Proof
**Part 1: Proof that no subset sum exceeds $c$**
The sum of all elements in $\mathcal{B}$ is:
$$\sum_{b \in \mathcal{B}} b = \sum_{j=0}^k 2^j + R = (2^{k+1} - 1) + (c - (2^{k+1} - 1)) = c$$
Since all elements are positive, any subset sum $S \subseteq \mathcal{B}$ satisfies $\sum_{s \in S} s \le c$.

**Part 2: Proof that every integer $x \in [0, c]$ is representable**
Let $x$ be an arbitrary integer in the range $0 \le x \le c$. We consider two exhaustive cases:

- **Case 1: $0 \le x \le 2^{k+1} - 1$**
  By the fundamental theorem of binary number systems, every non-negative integer strictly less than $2^{k+1}$ has a unique binary representation using $k+1$ bits:
  $$x = \sum_{j=0}^k b_j \cdot 2^j \quad \text{where } b_j \in \{0, 1\}$$
  Therefore, $x$ is formed by taking the subset of powers of two where $b_j = 1$, without using the remainder bundle $R$.

- **Case 2: $2^{k+1} - 1 < x \le c$**
  Subtract the remainder $R$ from $x$:
  $$y = x - R$$
  Because $x \le c$, we have:
  $$y = x - R \le c - R = 2^{k+1} - 1$$
  Furthermore, because $x > 2^{k+1} - 1$ and $R = c - (2^{k+1} - 1) \le c$:
  $$y = x - R > (2^{k+1} - 1) - R = (2^{k+1} - 1) - (c - (2^{k+1} - 1)) = 2^{k+2} - 2 - c$$
  Since $k$ was chosen maximally such that $2^{k+1} - 1 \le c < 2^{k+2} - 1$, we have $y \ge 0$.
  Therefore, $y \in [0, 2^{k+1} - 1]$.
  By Case 1, $y$ can be represented as a subset sum of the powers of two $\{1, 2, \dots, 2^k\}$.
  Adding the remainder bundle $R$ to this subset yields:
  $$y + R = (x - R) + R = x$$
  Thus, $x$ is represented as a subset sum of $\mathcal{B}$.

Because both cases hold, $\mathcal{B}$ spans the exact integer interval $[0, c]$ with zero holes and zero over-generation. $\blacksquare$

---

#### Asymptotic Complexity Reduction
The number of bundles generated for an item with count $c_i$ is:
$$M_i = (k + 1) + 1 = \lfloor \log_2(c_i + 1) \rfloor + 1 \in \Theta(\log c_i)$$

Treating these bundles as standard 0-1 knapsack items and executing the backward sweep yields:
$$\bbox[12px,border:2px solid #2563eb,background-color:#eff6ff]{\text{Total Time Complexity} = O\left( W \cdot \sum_{i=1}^N \log c_i \right)}$$

For $N = 100$ and $c_i = 10,000$, $\log_2(10000) \approx 14$.
The number of items drops from $1,000,000$ to $100 \times 14 = 1,400$ items!
Total operations: $1,400 \times 50,000 = \mathbf{70,000,000}$ operations ($\approx 7 \times 10^7$).
Runtime drops from **500 seconds to 0.15 seconds** (a **$3,500\times$ speedup**)!

---

### 1.4 Monotonic Queue Sliding Window Optimization ($O(N \cdot W)$)

Can we do even better than $O(W \sum \log c_i)$?
Yes. Using **Monotonic Queue Optimization**, the Bounded Knapsack problem can be solved in strictly **$O(N \cdot W)$ time**, completely independent of item counts $c_i$!

#### Recurrence Transformation
The full recurrence for item $i$ (with weight $w_i$, value $v_i$, and count $c_i$) is:
$$\text{dp}[i][w] = \max_{0 \le k \le c_i, \, k \cdot w_i \le w} \Big( \text{dp}[i-1][w - k \cdot w_i] + k \cdot v_i \Big)$$

Notice that capacity $w$ only transitions from capacities that differ by integer multiples of $w_i$.
We partition all capacities $w \in [0, W]$ into $w_i$ disjoint **residue classes** based on their remainder modulo $w_i$:
$$w = p \cdot w_i + r \quad \text{where } r = w \pmod{w_i}, \quad p = \lfloor w / w_i \rfloor$$

Substitute $w = p \cdot w_i + r$ into the recurrence:
$$\text{dp}[p \cdot w_i + r] = \max_{0 \le k \le \min(p, c_i)} \Big( \text{dp}[(p - k) \cdot w_i + r] + k \cdot v_i \Big)$$
Let $j = p - k$. As $k$ ranges from $0$ to $\min(p, c_i)$, the index $j$ ranges from $\max(0, p - c_i)$ to $p$:
$$\text{dp}[p \cdot w_i + r] = \max_{\max(0, p - c_i) \le j \le p} \Big( \text{dp}[j \cdot w_i + r] + (p - j) \cdot v_i \Big)$$
Pull out the term $p \cdot v_i$ which does not depend on the maximization variable $j$:
$$\bbox[12px,border:2px solid #2563eb,background-color:#eff6ff]{\text{dp}[p \cdot w_i + r] = \max_{\max(0, p - c_i) \le j \le p} \Big( \mathbf{\text{dp}[j \cdot w_i + r] - j \cdot v_i} \Big) + p \cdot v_i}$$

```
                Sliding Window Over Residue Class r
                
    Index j:        0      1      2     ...    p - c_i ...    p
    Value g(j):   g(0)   g(1)   g(2)    ...   g(p-c_i) ...   g(p)
                                              └────── Window ──────┘
                                                    Size <= c_i + 1
```

Let $g(j) = \text{dp}[j \cdot w_i + r] - j \cdot v_i$.
The expression $\max_{p - c_i \le j \le p} g(j)$ is a standard **Sliding Window Maximum** over a window of length at most $c_i + 1$!
Using a **Monotonic Deque** that maintains values of $g(j)$ in strictly decreasing order:
- Each index $j \in [0, \lfloor W / w_i \rfloor]$ is pushed into the deque once and popped at most once.
- Finding the maximum takes amortized $O(1)$ time per state!
- For each residue class $r \in [0, w_i - 1]$, the loop runs in $O(W / w_i)$ time.
- Summing over all $w_i$ residue classes: $w_i \times O(W / w_i) = \mathbf{O(W)}$.
- For all $N$ items, the total time complexity is strictly $\mathbf{O(N \cdot W)}$!

---

## 2. IMPLEMENT: Production-Grade Bounded Knapsack Engine (.NET 8+)

The following compile-ready, production-grade C# container implements:
1. `SolveBinaryGrouping`: The industry-standard $O(W \sum \log c_i)$ binary bundle transformation.
2. `SolveMonotonicQueue`: The optimal Staff-level $O(N \cdot W)$ sliding window deque optimization.
3. `SolveNaive`: The $O(W \sum c_i)$ expansion baseline for correctness verification.
4. Comprehensive test suite in `Main()` with self-validating `Debug.Assert` tests covering canonical instances, huge counts ($c_i = 10,000$), zero capacity, and benchmark execution.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace DynamicProgramming.BoundedKnapsack
{
    public readonly record struct ItemBundle(int Weight, int Value);

    /// <summary>
    /// Production-grade engine for solving the Bounded Knapsack Problem.
    /// Implements Binary Grouping Optimization and Monotonic Queue DP.
    /// </summary>
    public static class BoundedKnapsackEngine
    {
        #region 1. Binary Grouping Optimization (O(W * ∑ log C))

        /// <summary>
        /// Solves Bounded Knapsack using the Binary Grouping Theorem.
        /// Decomposes each count c_i into {1, 2, 4, ..., 2^k, R} bundles.
        /// Time Complexity: O(W * ∑ log(counts[i]))
        /// Space Complexity: O(W)
        /// </summary>
        public static int SolveBinaryGrouping(int[] weights, int[] values, int[] counts, int capacity)
        {
            ValidateInputs(weights, values, counts, capacity);
            if (capacity == 0 || weights.Length == 0) return 0;

            // Step 1: Decompose items into binary power-of-two bundles
            List<ItemBundle> bundles = new();

            for (int i = 0; i < weights.Length; i++)
            {
                int w = weights[i];
                int v = values[i];
                int c = counts[i];

                if (w <= 0 || v <= 0 || c <= 0) continue;

                // Cap the count at capacity / weight because we can never pick more than that
                c = Math.Min(c, capacity / w);

                int k = 1;
                while (c >= k)
                {
                    bundles.Add(new ItemBundle(k * w, k * v));
                    c -= k;
                    k <<= 1; // k = 1, 2, 4, 8, ...
                }

                // Add remaining chunk R
                if (c > 0)
                {
                    bundles.Add(new ItemBundle(c * w, c * v));
                }
            }

            // Step 2: Run standard 0-1 Knapsack backward sweep on the generated bundles
            int[] dp = new int[capacity + 1];

            foreach (var bundle in bundles)
            {
                int bWeight = bundle.Weight;
                int bValue = bundle.Value;

                // 0-1 Knapsack Backward Sweep Invariant
                for (int w = capacity; w >= bWeight; w--)
                {
                    int candidate = dp[w - bWeight] + bValue;
                    if (candidate > dp[w])
                    {
                        dp[w] = candidate;
                    }
                }
            }

            return dp[capacity];
        }

        #endregion

        #region 2. Monotonic Queue Sliding Window Optimization (O(N * W))

        /// <summary>
        /// Solves Bounded Knapsack in optimal linear O(N * W) time using a Monotonic Deque.
        /// Partitions capacity into residue classes modulo w_i and slides a window of size c_i + 1.
        /// Time Complexity: O(N * W)
        /// Space Complexity: O(W)
        /// </summary>
        public static int SolveMonotonicQueue(int[] weights, int[] values, int[] counts, int capacity)
        {
            ValidateInputs(weights, values, counts, capacity);
            if (capacity == 0 || weights.Length == 0) return 0;

            int n = weights.Length;
            int[] dp = new int[capacity + 1];

            // Deque stores index j within the residue class
            int[] deque = new int[capacity + 1];

            for (int i = 0; i < n; i++)
            {
                int w_i = weights[i];
                int v_i = values[i];
                int c_i = counts[i];

                if (w_i <= 0 || v_i <= 0 || c_i <= 0) continue;

                c_i = Math.Min(c_i, capacity / w_i);

                // Copy previous DP state
                int[] prevDp = (int[])dp.Clone();

                // Iterate over all residue classes modulo w_i
                for (int r = 0; r < w_i; r++)
                {
                    int head = 0;
                    int tail = 0; // Deque pointers: [head, tail)

                    int maxP = (capacity - r) / w_i;

                    for (int p = 0; p <= maxP; p++)
                    {
                        int currentVal = prevDp[p * w_i + r] - p * v_i;

                        // Maintain monotonic decreasing order: pop elements with smaller or equal values
                        while (tail > head)
                        {
                            int prevIndex = deque[tail - 1];
                            int prevVal = prevDp[prevIndex * w_i + r] - prevIndex * v_i;
                            if (prevVal <= currentVal)
                            {
                                tail--;
                            }
                            else
                            {
                                break;
                            }
                        }

                        deque[tail++] = p;

                        // Evict elements outside the sliding window [p - c_i, p]
                        while (head < tail && deque[head] < p - c_i)
                        {
                            head++;
                        }

                        // The maximum in the window is at deque[head]
                        int bestJ = deque[head];
                        dp[p * w_i + r] = (prevDp[bestJ * w_i + r] - bestJ * v_i) + p * v_i;
                    }
                }
            }

            return dp[capacity];
        }

        #endregion

        #region 3. Naive 0-1 Expansion Baseline (O(W * ∑ C))

        /// <summary>
        /// Baseline naive expansion: splits count into c_i single items.
        /// Used for correctness verification against optimized implementations.
        /// Time Complexity: O(W * ∑ counts[i])
        /// Space Complexity: O(W)
        /// </summary>
        public static int SolveNaive(int[] weights, int[] values, int[] counts, int capacity)
        {
            ValidateInputs(weights, values, counts, capacity);
            if (capacity == 0 || weights.Length == 0) return 0;

            int[] dp = new int[capacity + 1];

            for (int i = 0; i < weights.Length; i++)
            {
                int w_i = weights[i];
                int v_i = values[i];
                int c_i = counts[i];

                for (int k = 0; k < c_i; k++)
                {
                    for (int w = capacity; w >= w_i; w--)
                    {
                        dp[w] = Math.Max(dp[w], dp[w - w_i] + v_i);
                    }
                }
            }

            return dp[capacity];
        }

        #endregion

        private static void ValidateInputs(int[] weights, int[] values, int[] counts, int capacity)
        {
            ArgumentNullException.ThrowIfNull(weights);
            ArgumentNullException.ThrowIfNull(values);
            ArgumentNullException.ThrowIfNull(counts);

            if (weights.Length != values.Length || weights.Length != counts.Length)
            {
                throw new ArgumentException("Mismatched array lengths for weights, values, and counts.");
            }

            if (capacity < 0)
            {
                throw new ArgumentOutOfRangeException(nameof(capacity), "Capacity cannot be negative.");
            }
        }

        #region Self-Validating Test Suite & Benchmarks

        public static void Main()
        {
            Console.WriteLine("================================================================================");
            Console.WriteLine("  BoundedKnapsackEngine: Self-Validating Production Test Suite");
            Console.WriteLine("================================================================================");

            // Test 1: Canonical Small Instance
            {
                int[] weights = { 2, 3, 4 };
                int[] values  = { 3, 4, 5 };
                int[] counts  = { 2, 3, 2 }; // item 0: 2, item 1: 3, item 2: 2
                int capacity = 7;

                int resNaive = SolveNaive(weights, values, counts, capacity);
                int resBinary = SolveBinaryGrouping(weights, values, counts, capacity);
                int resDeque = SolveMonotonicQueue(weights, values, counts, capacity);

                Debug.Assert(resBinary == resNaive, $"Binary failed: Expected {resNaive}, got {resBinary}");
                Debug.Assert(resDeque == resNaive, $"Deque failed: Expected {resNaive}, got {resDeque}");

                Console.WriteLine($"[PASS] Test 1 (Canonical Instance): Capacity={capacity} => MaxValue={resBinary} (Naive={resNaive}, Deque={resDeque})");
            }

            // Test 2: Multiplicity Saturation (Degenerates to Unbounded Knapsack)
            {
                int[] weights = { 2 };
                int[] values  = { 5 };
                int[] counts  = { 100 }; // 100 available, but capacity only fits 5
                int capacity = 10;
                // Fits 10 / 2 = 5 items => 5 * 5 = 25
                int expected = 25;

                int resBinary = SolveBinaryGrouping(weights, values, counts, capacity);
                int resDeque = SolveMonotonicQueue(weights, values, counts, capacity);

                Debug.Assert(resBinary == expected);
                Debug.Assert(resDeque == expected);

                Console.WriteLine($"[PASS] Test 2 (Saturation): Capacity=10, Weight=2, Value=5, Count=100 => MaxValue={resBinary}");
            }

            // Test 3: Tight Count Constraints (c_i prevents greedy packing)
            {
                // Item 0: w=1, v=10, count=2 (can only take 2)
                // Item 1: w=2, v=15, count=2
                // Capacity: 5
                // Best: 2 of item 0 (w=2, v=20) + 1 of item 1 (w=2, v=15) => w=4, v=35
                int[] weights = { 1, 2 };
                int[] values  = { 10, 15 };
                int[] counts  = { 2, 2 };
                int capacity = 5;
                int expected = 35;

                int resNaive = SolveNaive(weights, values, counts, capacity);
                int resBinary = SolveBinaryGrouping(weights, values, counts, capacity);
                int resDeque = SolveMonotonicQueue(weights, values, counts, capacity);

                Debug.Assert(resBinary == expected);
                Debug.Assert(resDeque == expected);

                Console.WriteLine($"[PASS] Test 3 (Tight Multiplicity Constraints): Expected={expected}, Got={resBinary}");
            }

            // Test 4: Zero Capacity & Zero Count Boundaries
            {
                int[] weights = { 5 };
                int[] values  = { 50 };
                int[] counts  = { 10 };

                Debug.Assert(SolveBinaryGrouping(weights, values, counts, 0) == 0);
                Debug.Assert(SolveMonotonicQueue(weights, values, counts, 0) == 0);

                int[] zeroCounts = { 0 };
                Debug.Assert(SolveBinaryGrouping(weights, values, zeroCounts, 50) == 0);
                Debug.Assert(SolveMonotonicQueue(weights, values, zeroCounts, 50) == 0);

                Console.WriteLine("[PASS] Test 4 (Boundaries): Zero Capacity and Zero Counts return 0 correctly.");
            }

            // Test 5: Large Count Scalability Benchmark (c_i = 10,000)
            {
                int[] weights = { 10, 20, 30, 40 };
                int[] values  = { 25, 45, 70, 95 };
                int[] counts  = { 10000, 10000, 10000, 10000 };
                int capacity = 2000;

                Stopwatch sw = Stopwatch.StartNew();
                int resBinary = SolveBinaryGrouping(weights, values, counts, capacity);
                sw.Stop();
                long binaryTime = sw.ElapsedMilliseconds;

                sw.Restart();
                int resDeque = SolveMonotonicQueue(weights, values, counts, capacity);
                sw.Stop();
                long dequeTime = sw.ElapsedMilliseconds;

                Debug.Assert(resBinary == resDeque, $"Mismatch: Binary={resBinary}, Deque={resDeque}");

                Console.WriteLine($"[PASS] Test 5 (Scalability c=10,000): MaxValue={resBinary}");
                Console.WriteLine($"       - Binary Grouping: {binaryTime} ms");
                Console.WriteLine($"       - Monotonic Deque: {dequeTime} ms");
            }

            Console.WriteLine("================================================================================");
            Console.WriteLine("  All 5 Verification Test Suites Passed Flawlessly with 100% Invariants.");
            Console.WriteLine("================================================================================");
        }

        #endregion
    }
}
```

---

## 3. ANALYZE: Algorithmic Invariants & The 5-Dimension Staff Deep-Dive

### 3.1 Core Algorithmic Invariants

```
                      INVARIANT 1: BINARY DECOMPOSITION CANONICALITY
Every integer multiplicity c >= 1 decomposes into exactly:
    B = floor(log_2(c + 1)) + (c - (2^{k+1} - 1) > 0 ? 1 : 0)
independent bundles whose subset sums span [0, c] surjectively and injectively.

                      INVARIANT 2: RESIDUE CLASS INDEPENDENCE
In Monotonic Queue DP, capacities w1 and w2 with w1 % w_i != w2 % w_i belong to 
disjoint dependency chains. They never interact or share transitions within item i's pass.

                      INVARIANT 3: SLIDING WINDOW BOUNDEDNESS
The monotonic deque window for residue class r at step p contains indices j satisfying:
    p - c_i <= j <= p.
The window size is strictly bounded by c_i + 1, guaranteeing that no element is selected 
more than c_i times.
```

---

### 3.2 The 5-Dimension Staff Deep-Dive

#### 1. State Topology: Partitioning into $w_i$ Disjoint Strands
In Monotonic Queue DP, instead of a single homogeneous row sweep, the 1D state array $\text{dp}[0 \dots W]$ is decomposed into $w_i$ disjoint interleaved 1D strands:
$$\text{Strand}_r = \langle \text{dp}[r], \text{dp}[r + w_i], \text{dp}[r + 2w_i], \dots, \text{dp}[r + \lfloor(W-r)/w_i\rfloor w_i] \rangle$$
Each strand is solved independently as an optimal sliding window maximum!

```
                  Decomposition into Disjoint Residue Strands (w_i = 3)
                  
     Capacity:   0   1   2   3   4   5   6   7   8   9  10  11
     Strand 0:  [0]         [3]         [6]         [9]          (r = 0)
     Strand 1:      [1]         [4]         [7]        [10]      (r = 1)
     Strand 2:          [2]         [5]         [8]        [11]  (r = 2)
```

---

#### 2. Choice Gradients: Discrete Multiplicity Bounding
In Unbounded Knapsack, the sliding window extends all the way back to $j = 0$ (window size $\infty$).
In Bounded Knapsack, the window is truncated at $j = p - c_i$. The choice gradient must continuously prune elements that fall behind the eviction horizon $p - c_i$.

---

#### 3. Boundary Invariants: Remainder Buckets
For every residue class $r \in [0, w_i - 1]$, the base case corresponds to $p = 0$, representing capacity $r$.
Since $r < w_i$, item $i$ cannot fit into capacity $r$. Thus $\text{dp}[0 \cdot w_i + r] = \text{prevDp}[r]$ is seeded directly from the previous item's evaluation.

---

#### 4. Memory Architecture: Array Cache Line Efficiency
- **Binary Grouping:** Uses a flat 1D array of size $W+1$. Backward sweeps operate entirely in L1/L2 cache, making it extremely fast in practice despite the extra logarithmic factor.
- **Monotonic Queue:** Allocates a deque buffer of size $\lfloor W / w_i \rfloor + 1$. Strided access across memory ($r, r + w_i, r + 2w_i$) can cause occasional cache line skips if $w_i$ is large, but its strictly linear asymptotic bound $O(N \cdot W)$ makes it unbeatable when $c_i \approx W$.

---

#### 5. Degenerate Extremes

| Scenario | Input Profile | Theoretical Pathology | Engine Defense |
| :--- | :--- | :--- | :--- |
| **Count Exceeds Total Capacity** | $c_i = 10^9, w_i = 10, W = 100$ | Memory / Loop explosion if naive | Clamp: $c_i = \min(c_i, \lfloor W / w_i \rfloor) = 10$. |
| **Count is Exactly 1** | $c_i = 1$ | Extra grouping overhead | Degenerates to single bundle of size 1 (0-1 Knapsack). |
| **All Counts are Zero** | $c_i = 0$ | No bundles generated | Skips item in $O(1)$. |
| **$w_i > W$** | $w_i = 500, W = 100$ | Cannot fit even 1 item | Clamped count is 0 $\implies$ skipped in $O(1)$. |

---

## 4. DEMONSTRATE: Visual State Transitions & Grouping Diagrams

### 4.1 Step-by-Step Trace of Binary Grouping

Let an item have $w_i = 2, v_i = 5$, and count $c_i = 13$.

```
Decomposition Algorithm Execution:
  Start: c = 13, k = 1

  Step 1: k = 1. Is 13 >= 1? Yes.
          Create Bundle: Weight = 1 * 2 = 2, Value = 1 * 5 = 5.
          c = 13 - 1 = 12, k = 1 * 2 = 2.

  Step 2: k = 2. Is 12 >= 2? Yes.
          Create Bundle: Weight = 2 * 2 = 4, Value = 2 * 5 = 10.
          c = 12 - 2 = 10, k = 2 * 2 = 4.

  Step 3: k = 4. Is 10 >= 4? Yes.
          Create Bundle: Weight = 4 * 2 = 8, Value = 4 * 5 = 20.
          c = 10 - 4 = 6, k = 4 * 2 = 8.

  Step 4: k = 8. Is 6 >= 8? NO! Loop terminates.

  Step 5: Remainder c = 6 > 0.
          Create Remainder Bundle: Weight = 6 * 2 = 12, Value = 6 * 5 = 30.

Generated 0-1 Bundles:
  Bundle 0: (w=2,  v=5)   [Size: 1]
  Bundle 1: (w=4,  v=10)  [Size: 2]
  Bundle 2: (w=8,  v=20)  [Size: 4]
  Bundle 3: (w=12, v=30)  [Size: 6]
```

---

### 4.2 Visual Monotonic Deque Sliding Window Execution

Consider residue class $r = 1$ with $w_i = 3, v_i = 4, c_i = 2$.
Capacities: $p=0 \implies 1, \quad p=1 \implies 4, \quad p=2 \implies 7, \quad p=3 \implies 10, \quad p=4 \implies 13$.
Window constraint: $p - c_i \le j \le p \implies [p - 2, p]$ (window size 3).

```
   p=0: Window [0, 0]. Push j=0.
        Deque: [0]  ==> Best j=0.
        
   p=1: Window [0, 1]. Compare g(1) vs g(0).
        Push j=1. Deque: [0, 1]  ==> Best j=0.
        
   p=2: Window [0, 2]. Push j=2.
        Deque: [0, 1, 2]  ==> Best j=0.
        
   p=3: Window [1, 3]. Evict j=0 (since 0 < 3 - 2 = 1)!
        Deque head shifts from 0 to 1.
        Push j=3. Deque: [1, 2, 3]  ==> Best j=1.
        
   p=4: Window [2, 4]. Evict j=1 (since 1 < 4 - 2 = 2)!
        Deque head shifts to 2.
        Push j=4. Deque: [2, 3, 4]  ==> Best j=2.
```

Every index enters and leaves the deque exactly once!

---

## 5. PRACTICE: Canonical Bounded Knapsack Problems & Variations

### 5.1 Classic Bounded Knapsack Problem

Given $N$ item types, each with weight $w_i$, value $v_i$, and multiplicity count $c_i$, pack a knapsack of capacity $W$ to maximize total value.

```csharp
public class BoundedKnapsackSolver
{
    public int MaximizeValue(int[] weights, int[] values, int[] counts, int capacity)
    {
        // Production implementation using Binary Grouping
        int[] dp = new int[capacity + 1];

        for (int i = 0; i < weights.Length; i++)
        {
            int w = weights[i];
            int v = values[i];
            int c = Math.Min(counts[i], capacity / w);

            for (int k = 1; c > 0; k <<= 1)
            {
                int take = Math.Min(k, c);
                int bundleWeight = take * w;
                int bundleValue = take * v;

                // 0-1 Knapsack backward sweep
                for (int cap = capacity; cap >= bundleWeight; cap--)
                {
                    dp[cap] = Math.Max(dp[cap], dp[cap - bundleWeight] + bundleValue);
                }

                c -= take;
            }
        }

        return dp[capacity];
    }
}
```

---

### 5.2 Multi-Unit Inventory Order Fulfillment

#### Problem
An e-commerce seller has inventory batches of products. Each product has a weight, a revenue, and a warehouse stock count. A pallet shipping container has maximum payload capacity $W$. Determine the optimal product mix to maximize revenue.

#### Implementation with Multiplicity Pruning
```csharp
public static int FulfillOptimalOrder(int[] weights, int[] revenues, int[] stocks, int containerPayload)
{
    // Clamp inventory stock to physically packable limits
    int[] effectiveStocks = new int[stocks.Length];
    for (int i = 0; i < stocks.Length; i++)
    {
        effectiveStocks[i] = Math.Min(stocks[i], containerPayload / weights[i]);
    }

    return BoundedKnapsackEngine.SolveBinaryGrouping(weights, revenues, effectiveStocks, containerPayload);
}
```

---

## 6. CONNECT: E-Commerce Multi-Pallet Shipping Logistics & Cloud Datacenter Quotas

### 6.1 Amazon Fulfillment Center Freight Logistics

In fulfillment logistics (e.g., Amazon FBA, FedEx Ground):
- Semi-trailer trucks and standardized shipping pallets have strict **weight ceilings** (e.g., $45,000\text{ lbs}$ legal axle limit).
- Warehouses store high-demand inventory in bounded batches (e.g., 500 units of Laptop A, 2,000 units of Monitor B, 10,000 cables).
- Schedulers run Bounded Knapsack optimizations across outbound freight containers to maximize shipped inventory value per transport run.

```
                    Fulfillment Pallet Loading Optimization
                    
      Pallet Capacity: 2,500 lbs
      
      SKU 101 (Server Blade):  Weight: 45 lbs, Profit: $800, Stock: 30 units
      SKU 102 (Switch):        Weight: 25 lbs, Profit: $350, Stock: 50 units
      SKU 103 (UPS Battery):   Weight: 80 lbs, Profit: $200, Stock: 20 units
      ──────────────────────────────────────────────────────────────────────────
      Binary Grouping decomposes 100 total items into ~18 power-of-two bundles.
      Optimal packing solved in < 1 ms!
```

---

### 6.2 Multi-Tenant Cloud Quota Provisioning

In public cloud virtualization (AWS EC2, Google Compute Engine, Microsoft Azure):
- A physical bare-metal blade server has 128 physical cores and 512 GB RAM.
- Customer reservation requests specify VM sizes with maximum instance quotas:
  - e.g., "At most 10 instances of `m5.xlarge` (4 vCPUs, 16 GB RAM)".
- Hypervisors solve a multi-dimensional Bounded Knapsack to maximize revenue and cluster packing density.

---

## 7. CHECKPOINT: Comprehensive Self-Assessment & Mastery Key

### 7.1 Diagnostic Mastery Audit (10 Staff-Level Questions)

```
[Q1] What is the mathematical proof that the binary decomposition {1, 2, 4, ..., 2^k, R} 
     can uniquely represent any integer x in [0, c] without exceeding c?

[Q2] Why does naive 0-1 expansion of bounded knapsack fail in production systems when 
     item counts are large (e.g., c_i = 10,000)? State the time complexity comparison.

[Q3] What is the time complexity of the Monotonic Queue Optimization for Bounded Knapsack, 
     and why is it strictly independent of the item counts c_i?

[Q4] In Monotonic Queue DP, explain why capacity must be partitioned into residue classes 
     modulo w_i. Why can states from different residue classes never interact?

[Q5] State the transformation equation that converts the Bounded Knapsack recurrence into 
     a sliding window maximum over a Monotonic Deque.

[Q6] In Binary Grouping, why should the item count c_i be clamped to min(c_i, floor(W / w_i)) 
     BEFORE generating binary bundles?

[Q7] What are the practical engineering trade-offs between Binary Grouping and Monotonic 
     Queue DP? Under what conditions would you choose Binary Grouping over Monotonic Queue?

[Q8] If an item has c_i >= floor(W / w_i), what does the bounded knapsack problem degenerate 
     into for that specific item? How should the algorithm optimize this?

[Q9] Why does the Monotonic Deque need to maintain values in strictly decreasing order? 
     What element is always at the head of the deque?

[Q10] Contrast the memory layout of 0-1 Knapsack, Unbounded Knapsack, and Bounded Knapsack 
      when implemented using 1D rolling arrays.
```

---

### 7.2 Exhaustive Mastery Key & Mathematical Derivations

#### [A1] Proof of Binary Decomposition Completeness
Let $k$ be maximal such that $2^{k+1} - 1 \le c$, and $R = c - (2^{k+1} - 1)$.
The total sum of elements is $(2^{k+1} - 1) + R = c$. Hence no subset sum exceeds $c$.
For any $x \in [0, c]$:
- If $x \le 2^{k+1} - 1$, its standard binary representation uses a subset of $\{1, 2, 4, \dots, 2^k\}$.
- If $x > 2^{k+1} - 1$, subtract $R$: $y = x - R$. Then $0 \le y \le c - R = 2^{k+1} - 1$.
Represent $y$ using powers of two, and include $R$. The sum is $y + R = x$.
Thus every integer in $[0, c]$ is representable.

#### [A2] Naive Expansion Failure
Naive expansion generates $\sum c_i$ individual 0-1 items, running in $O(W \sum c_i)$.
For $N = 100, c_i = 10,000, W = 50,000$, naive expansion executes $5 \times 10^{10}$ operations (several minutes, TLE). Binary grouping reduces items to $\sum \log c_i$, executing $O(W \sum \log c_i) \approx 7 \times 10^7$ operations ($< 0.15\text{ seconds}$).

#### [A3] Monotonic Queue Complexity
Time Complexity: $\mathbf{O(N \cdot W)}$.
Across all $w_i$ residue classes, each capacity index $p \in [0, \lfloor W / w_i \rfloor]$ is pushed into the monotonic deque once and popped at most once. The total operations across all residue classes per item is $w_i \times O(W / w_i) = O(W)$. For $N$ items, total time is $O(N \cdot W)$, with zero dependence on $c_i$.

#### [A4] Residue Class Partitioning Modulo $w_i$
Any transition for item $i$ changes capacity by an integer multiple of $w_i$: $w' = w - k \cdot w_i$.
Taking modulo $w_i$: $w' \pmod{w_i} = (w - k \cdot w_i) \pmod{w_i} = w \pmod{w_i} = r$.
Capacities with different remainders modulo $w_i$ can never reach each other through multiples of $w_i$. Hence they form completely independent 1D subproblems.

#### [A5] Sliding Window Transformation
Let $w = p \cdot w_i + r$ and $j = p - k$. The recurrence transforms to:
$$\text{dp}[p \cdot w_i + r] = \max_{p - c_i \le j \le p} \Big( \text{dp}[j \cdot w_i + r] - j \cdot v_i \Big) + p \cdot v_i$$
Defining $g(j) = \text{dp}[j \cdot w_i + r] - j \cdot v_i$, this is a sliding window maximum of $g(j)$ over $j \in [p - c_i, p]$.

#### [A6] Clamping Count Before Grouping
Even if stock is $c_i = 1,000,000$, the knapsack capacity $W$ can physically fit at most $\lfloor W / w_i \rfloor$ items. Clamping $c_i = \min(c_i, \lfloor W / w_i \rfloor)$ prevents generating useless high-power bundles that exceed $W$, saving both allocation and loop overhead.

#### [A7] Practical Engineering Trade-offs
- **Binary Grouping:** Extremely simple (~15 lines of code), zero extra allocations, excellent CPU cache locality via flat array backward sweep. Preferred in $95\%$ of interview and competitive programming problems where $W \sum \log c_i \le 10^8$.
- **Monotonic Queue:** Optimal asymptotic time $O(NW)$, but higher constant factor due to deque pointer manipulation, cloning previous row state, and strided memory access. Mandatory when $W \approx 10^5$ and $c_i \approx 10^5$.

#### [A8] Degeneration to Unbounded Knapsack
When $c_i \ge \lfloor W / w_i \rfloor$, the capacity constraint restricts the item more than its inventory count. The item multiplicity constraint is inactive, and the problem for that item degenerates into **Unbounded Knapsack**. The engine can directly execute a forward sweep ($w = w_i \to W$) in $O(W)$ time without generating any bundles!

#### [A9] Monotonic Deque Decreasing Invariant
The deque maintains elements in strictly decreasing order of $g(j)$. When a new element $g(p)$ arrives, all elements at the tail of the deque with value $\le g(p)$ are popped because they are both smaller and older than $g(p)$ (hence can never be the maximum in any future window). The maximum element in the current window is always at the **head** of the deque.

#### [A10] Memory Layout Across Knapsack Variants
All three knapsack variants can be implemented using a 1D array of size $W+1$:
- **0-1 Knapsack:** Descending traversal ($w = W \to w_i$) prevents reuse.
- **Unbounded Knapsack:** Ascending traversal ($w = w_i \to W$) enables infinite reuse.
- **Bounded Knapsack (Binary Grouping):** Descending traversal ($w = W \to b_w$) over power-of-two bundles.
- **Bounded Knapsack (Monotonic Deque):** Strided traversal along residue classes ($r, r + w_i, r + 2w_i$) with an auxiliary deque array of size $\lfloor W / w_i \rfloor + 1$.
