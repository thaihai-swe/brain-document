---
title: "Week 34 — Day 232: 0-1 Knapsack Masterclass: State Definition, Proof of Backward Sweep & 1D Space Optimization"
---

# Week 34 — Day 232: 0-1 Knapsack Masterclass: State Definition, Proof of Backward Sweep & 1D Space Optimization

## 1. TEACH: 0-1 Knapsack Foundations, State Space & The Backward Sweep Invariant

### 1.1 Formal Mathematical Formulation: Binary Integer Programming

The **0-1 Knapsack Problem** is the archetypal archetype of constrained combinatorial resource allocation. Formally, we are given:
- A set of $N$ discrete items indexed $i \in \{1, 2, \dots, N\}$.
- Each item $i$ possesses an intrinsic positive integer weight $w_i \in \mathbb{Z}^+$ and an intrinsic positive integer utility or value $v_i \in \mathbb{Z}^+$.
- A knapsack with a maximum integer weight capacity $W \in \mathbb{Z}^+$.

We define a vector of binary decision variables $x = \langle x_1, x_2, \dots, x_N \rangle$ where:
$$x_i \in \{0, 1\} \quad \text{for all } i \in \{1, \dots, N\}$$
The value $x_i = 1$ signifies that item $i$ is included in the knapsack, while $x_i = 0$ signifies that item $i$ is excluded.

The objective is to maximize the cumulative value of selected items without violating the total weight constraint:

$$\bbox[12px,border:2px solid #2563eb,background-color:#eff6ff]{\begin{aligned}
\text{Maximize} \quad & \sum_{i=1}^N x_i v_i \\
\text{Subject to} \quad & \sum_{i=1}^N x_i w_i \le W, \quad x_i \in \{0, 1\} \quad \forall i \in \{1, \dots, N\}
\end{aligned}}$$

```
               0-1 Knapsack Decision Space Topology
               
                     Item Set S = { (w1, v1), (w2, v2), ..., (wN, vN) }
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
         Pick Item i (x_i = 1)                   Skip Item i (x_i = 0)
         • Gain Value: +v_i                      • Gain Value: +0
         • Consume Capacity: -w_i                • Consume Capacity: -0
         • Remaining Cap: W - w_i                • Remaining Cap: W
```

#### Why Greedy Heuristics Fail
In continuous (fractional) knapsack, sorting items by value density $\rho_i = \frac{v_i}{w_i}$ and greedily taking fractions of items yields an optimal solution. In the 0-1 knapsack problem, however, the integrality constraint $x_i \in \{0, 1\}$ breaks the greedy choice property.

*Counterexample:*
Let $W = 50$, and consider three items:
- Item 1: $w_1 = 10, v_1 = 60 \implies \rho_1 = 6.0$
- Item 2: $w_2 = 20, v_2 = 100 \implies \rho_2 = 5.0$
- Item 3: $w_3 = 30, v_3 = 120 \implies \rho_3 = 4.0$

A greedy density strategy chooses Item 1 ($w=10, v=60$, remaining capacity 40), then Item 2 ($w=20, v=100$, remaining capacity 20). Item 3 ($w=30$) cannot fit. 
- Greedy Total Value: $60 + 100 = 160$ (Total weight: 30).
- Optimal Choice: Take Item 2 and Item 3: Total weight $= 20 + 30 = 50 \le 50$, Total Value $= 100 + 120 = \mathbf{220}$.
The greedy density heuristic yields a suboptimal result because it fails to consider capacity packing utilization. Dynamic programming is required.

---

### 1.2 2D Dynamic Programming Formulation

#### State Definition
Let $\text{dp}[i][w]$ denote the maximum cumulative value obtainable by selecting a subset from the prefix of the first $i$ items $\{1, \dots, i\}$ such that their total weight does not exceed capacity $w$, where $0 \le i \le N$ and $0 \le w \le W$.

#### Base Cases (Boundary Invariants)
- $\text{dp}[0][w] = 0$ for all $0 \le w \le W$: With zero items available, the maximum achievable value is identically zero regardless of capacity.
- $\text{dp}[i][0] = 0$ for all $0 \le i \le N$: With zero capacity, no positive-weight item can be packed, so the maximum achievable value is zero.

#### State Transition Equations
For item $i$ (with weight $w_i$ and value $v_i$) and current capacity $w$:
1. **Case 1: Capacity Exceeded ($w < w_i$)**
   Item $i$ cannot fit into the knapsack of capacity $w$. We have no choice but to exclude it ($x_i = 0$):
   $$\text{dp}[i][w] = \text{dp}[i-1][w]$$
2. **Case 2: Item Fits ($w \ge w_i$)**
   We have two mutually exclusive options:
   - **Option A (Skip Item $i$):** Do not include item $i$. The value is the optimal value achievable using a subset of the first $i-1$ items with capacity $w$: $\text{dp}[i-1][w]$.
   - **Option B (Pick Item $i$):** Include item $i$. We gain value $v_i$ and commit capacity $w_i$. The remaining capacity $w - w_i$ must be optimally allocated among the first $i-1$ items: $\text{dp}[i-1][w - w_i] + v_i$.
   To maximize total value, we take the maximum:
   $$\text{dp}[i][w] = \max(\text{dp}[i-1][w], \text{dp}[i-1][w - w_i] + v_i)$$

Unifying both cases:
$$\text{dp}[i][w] = \begin{cases}
\text{dp}[i-1][w] & \text{if } w < w_i \\
\max(\text{dp}[i-1][w], \text{dp}[i-1][w - w_i] + v_i) & \text{if } w \ge w_i
\end{cases}$$

---

### 1.3 The Backward Sweep Invariant: Inductive Proof of Correctness

In standard 2D dynamic programming, computing $\text{dp}[i][w]$ requires maintaining an $(N+1) \times (W+1)$ matrix, consuming $\Theta(N \cdot W)$ memory. Notice that row $i$ depends **exclusively on row $i-1$**. Can we compress the 2D table into a single 1D array of size $W+1$?

Yes, but the **loop direction of the capacity variable $w$** is critical. We now formulate and formally prove the **Backward Sweep Invariant**.

```
                         The Loop Direction Dilemma
                         
  Iterating Forward: for (w = w_i; w <= W; w++)       <-- FATAL BUG for 0-1 Knapsack!
  Iterating Backward: for (w = W; w >= w_i; w--)      <-- MANDATORY for 0-1 Knapsack!
```

#### Theorem (The Backward Sweep Invariant)
*Let $\text{dp}$ be a 1D array of size $W+1$ initialized such that before processing item $i$, $\text{dp}[w]$ stores the value $\text{dp}_{i-1}[w]$ for all $w \in [0, W]$. Updating the array via:*
$$\text{dp}[w] = \max(\text{dp}[w], \text{dp}[w - w_i] + v_i)$$
*correctly computes $\text{dp}_i[w]$ for the 0-1 knapsack problem if and only if the capacity $w$ is iterated in strictly descending order from $W$ down to $w_i$.*

#### Mathematical Proof by Induction
Let $\text{dp}^{(t)}$ denote the state of the 1D array at step $t$ within the capacity loop for item $i$.
Before the capacity loop begins, by the inductive hypothesis:
$$\text{dp}^{(0)}[k] = \text{dp}_{i-1}[k] \quad \text{for all } k \in [0, W]$$

We iterate $w$ in descending order: $w = W, W-1, W-2, \dots, w_i$.

**Base Case:** At the first step of the loop, $w = W$.
We compute:
$$\text{dp}[W] \leftarrow \max(\text{dp}[W], \text{dp}[W - w_i] + v_i)$$
On the right-hand side:
- $\text{dp}[W]$ currently holds $\text{dp}^{(0)}[W] = \text{dp}_{i-1}[W]$.
- Since $w_i > 0$, the index $W - w_i < W$. Because we iterate in strictly descending order, index $W - w_i$ has **not yet been updated** in the current loop for item $i$. Therefore, $\text{dp}[W - w_i]$ currently holds $\text{dp}^{(0)}[W - w_i] = \text{dp}_{i-1}[W - w_i]$.
Substituting these values:
$$\text{dp}[W] = \max(\text{dp}_{i-1}[W], \text{dp}_{i-1}[W - w_i] + v_i) = \text{dp}_i[W]$$
The base case holds.

**Inductive Step:**
Assume that for all capacity values $u \in \{w+1, w+2, \dots, W\}$, the array has been correctly updated such that $\text{dp}[u] = \text{dp}_i[u]$.
Now consider the evaluation at capacity $w$:
$$\text{dp}[w] \leftarrow \max(\text{dp}[w], \text{dp}[w - w_i] + v_i)$$
Examine the two terms on the right-hand side:
1. The first term $\text{dp}[w]$ has not been overwritten yet during item $i$'s loop (since $w < u$ for all previously updated indices $u$). Thus, $\text{dp}[w] = \text{dp}_{i-1}[w]$.
2. The second term references index $w - w_i$. Because $w_i \ge 1$, we have $w - w_i < w$. Since the loop iterates strictly downwards ($W \to w_i$), all indices strictly less than $w$ remain completely untouched during the current item's loop. Therefore:
   $$\text{dp}[w - w_i] = \text{dp}_{i-1}[w - w_i]$$
Substituting both terms:
$$\text{dp}[w] = \max(\text{dp}_{i-1}[w], \text{dp}_{i-1}[w - w_i] + v_i) = \text{dp}_i[w]$$
For all capacities $w < w_i$, item $i$ cannot fit, so $\text{dp}_i[w] = \text{dp}_{i-1}[w]$. Because the loop terminates at $w = w_i$, the entries $\text{dp}[0 \dots w_i - 1]$ retain their unmodified values $\text{dp}_{i-1}[0 \dots w_i - 1]$, which is exactly correct.

By mathematical induction, descending iteration guarantees that **every item $i$ is considered at most once**, preserving the 0-1 constraint. $\blacksquare$

---

#### The Forward Sweep Pathology (Why Ascending Iteration Fails for 0-1)
Suppose we iterate forward: `for (int w = w_i; w <= W; w++)`.
Consider a single item with $w_1 = 2, v_1 = 10$, and capacity $W = 6$.
Initial array: `dp = [0, 0, 0, 0, 0, 0, 0]`.
- At $w = 2$: $\text{dp}[2] = \max(\text{dp}[2], \text{dp}[0] + 10) = 10$.
- At $w = 4$: $\text{dp}[4] = \max(\text{dp}[4], \text{dp}[4 - 2] + 10) = \max(0, \text{dp}[2] + 10) = \max(0, 10 + 10) = \mathbf{20}$.
- At $w = 6$: $\text{dp}[6] = \max(\text{dp}[6], \text{dp}[6 - 2] + 10) = \max(0, \text{dp}[4] + 10) = \max(0, 20 + 10) = \mathbf{30}$.

*Result:* Item 1 was chosen **three times**!
Because index 2 was updated to 10 *before* index 4 was computed, index 4 read the updated value from item 1.
Ascending iteration solves the **Unbounded Knapsack Problem** (infinite reuse of items), but completely violates the 0-1 knapsack single-choice constraint!

```
Backward Sweep: dp[w] reads dp[w - w_i] from iteration (i - 1)  ==> Single-Use (0-1)
Forward Sweep:  dp[w] reads dp[w - w_i] from iteration (i)      ==> Infinite-Use (Unbounded)
```

---

### 1.4 Item Subset Reconstruction via Choice Backtracking

When solving practical systems problems, knowing the scalar maximum value is insufficient; we must reconstruct the exact subset of items $S^* \subseteq \{1, \dots, N\}$ that achieves this optimum.

Using the 2D matrix $\text{dp}[0 \dots N, 0 \dots W]$, we backtrack from the bottom-right corner $(N, W)$ down to $(0, 0)$:

```
Backtracking Step Invariant (at state (i, w)):

If dp[i][w] == dp[i-1][w]:
    Item i was NOT chosen in the optimal solution.
    Action: Set x_i = 0.
    Next State: Move up to (i-1, w).

Else:
    Item i WAS chosen in the optimal solution.
    Action: Set x_i = 1, record item i.
    Next State: Move up and left to (i-1, w - w_i).
```

The backtracking process runs in $O(N)$ time, as each step decrements the item index $i$ by exactly 1 until $i = 0$ or $w = 0$.

---

## 2. IMPLEMENT: Production-Grade 0-1 Knapsack Engine (.NET 8+)

The following compile-ready, production-grade C# container implements:
1. `Solve2D`: Computes optimal value using full $(N+1) \times (W+1)$ 2D dynamic programming.
2. `Solve1D`: Computes optimal value using the mathematically verified $O(W)$ space backward sweep.
3. `SolveWithReconstruction`: Reconstructs the exact indices and weights of chosen items alongside total value.
4. Comprehensive test suite in `Main()` with self-validating `Debug.Assert` tests covering edge cases, large capacities, boundary conditions, and item reconstruction.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace DynamicProgramming.Knapsack
{
    public readonly record struct KnapsackItem(int Id, int Weight, int Value);

    public sealed class KnapsackResult
    {
        public int MaxValue { get; init; }
        public int TotalWeight { get; init; }
        public IReadOnlyList<KnapsackItem> SelectedItems { get; init; } = Array.Empty<KnapsackItem>();
    }

    /// <summary>
    /// Production-grade engine for solving the 0-1 Knapsack Problem.
    /// Provides 2D table computation, O(W) backward sweep optimization, and item subset reconstruction.
    /// </summary>
    public static class ZeroOneKnapsackEngine
    {
        /// <summary>
        /// Solves 0-1 Knapsack using a 2D dynamic programming matrix.
        /// Time Complexity: O(N * W)
        /// Space Complexity: O(N * W)
        /// </summary>
        public static int Solve2D(int[] weights, int[] values, int capacity)
        {
            ValidateInputs(weights, values, capacity);

            int n = weights.Length;
            if (n == 0 || capacity == 0) return 0;

            int[,] dp = new int[n + 1, capacity + 1];

            for (int i = 1; i <= n; i++)
            {
                int w_i = weights[i - 1];
                int v_i = values[i - 1];

                for (int w = 0; w <= capacity; w++)
                {
                    if (w < w_i)
                    {
                        dp[i, w] = dp[i - 1, w];
                    }
                    else
                    {
                        dp[i, w] = Math.Max(dp[i - 1, w], dp[i - 1, w - w_i] + v_i);
                    }
                }
            }

            return dp[n, capacity];
        }

        /// <summary>
        /// Solves 0-1 Knapsack using the mathematically proven 1D Backward Sweep.
        /// Optimizes memory to O(W) by iterating capacity in descending order.
        /// Time Complexity: O(N * W)
        /// Space Complexity: O(W)
        /// </summary>
        public static int Solve1D(int[] weights, int[] values, int capacity)
        {
            ValidateInputs(weights, values, capacity);

            int n = weights.Length;
            if (n == 0 || capacity == 0) return 0;

            int[] dp = new int[capacity + 1];

            for (int i = 0; i < n; i++)
            {
                int w_i = weights[i];
                int v_i = values[i];

                // BACKWARD SWEEP INVARIANT:
                // Iterate w descending from capacity down to w_i.
                // Guarantees dp[w - w_i] represents values from iteration (i - 1).
                for (int w = capacity; w >= w_i; w--)
                {
                    int candidate = dp[w - w_i] + v_i;
                    if (candidate > dp[w])
                    {
                        dp[w] = candidate;
                    }
                }
            }

            return dp[capacity];
        }

        /// <summary>
        /// Solves 0-1 Knapsack and reconstructs the optimal subset of selected items.
        /// Time Complexity: O(N * W)
        /// Space Complexity: O(N * W)
        /// </summary>
        public static KnapsackResult SolveWithReconstruction(int[] weights, int[] values, int capacity)
        {
            ValidateInputs(weights, values, capacity);

            int n = weights.Length;
            if (n == 0 || capacity == 0)
            {
                return new KnapsackResult { MaxValue = 0, TotalWeight = 0, SelectedItems = Array.Empty<KnapsackItem>() };
            }

            int[,] dp = new int[n + 1, capacity + 1];

            for (int i = 1; i <= n; i++)
            {
                int w_i = weights[i - 1];
                int v_i = values[i - 1];

                for (int w = 0; w <= capacity; w++)
                {
                    if (w < w_i)
                    {
                        dp[i, w] = dp[i - 1, w];
                    }
                    else
                    {
                        dp[i, w] = Math.Max(dp[i - 1, w], dp[i - 1, w - w_i] + v_i);
                    }
                }
            }

            // Backtracking from (n, capacity) to extract chosen items
            List<KnapsackItem> chosen = new(n);
            int currW = capacity;
            int totalWeight = 0;

            for (int i = n; i >= 1; i--)
            {
                // If value differs from row above, item i was selected
                if (dp[i, currW] != dp[i - 1, currW])
                {
                    int itemIdx = i - 1;
                    chosen.Add(new KnapsackItem(itemIdx, weights[itemIdx], values[itemIdx]));
                    totalWeight += weights[itemIdx];
                    currW -= weights[itemIdx];
                }
            }

            chosen.Reverse(); // Restore natural ascending index order

            return new KnapsackResult
            {
                MaxValue = dp[n, capacity],
                TotalWeight = totalWeight,
                SelectedItems = chosen
            };
        }

        private static void ValidateInputs(int[] weights, int[] values, int capacity)
        {
            ArgumentNullException.ThrowIfNull(weights);
            ArgumentNullException.ThrowIfNull(values);

            if (weights.Length != values.Length)
            {
                throw new ArgumentException($"Mismatched lengths: weights ({weights.Length}) vs values ({values.Length}).");
            }

            if (capacity < 0)
            {
                throw new ArgumentOutOfRangeException(nameof(capacity), "Capacity cannot be negative.");
            }

            for (int i = 0; i < weights.Length; i++)
            {
                if (weights[i] < 0)
                {
                    throw new ArgumentOutOfRangeException(nameof(weights), $"Weight at index {i} is negative ({weights[i]}).");
                }
                if (values[i] < 0)
                {
                    throw new ArgumentOutOfRangeException(nameof(values), $"Value at index {i} is negative ({values[i]}).");
                }
            }
        }

        #region Self-Validating Test Suite

        public static void Main()
        {
            Console.WriteLine("================================================================================");
            Console.WriteLine("  ZeroOneKnapsackEngine: Self-Validating Production Test Suite");
            Console.WriteLine("================================================================================");

            // Test 1: Canonical Textbook Instance
            {
                int[] weights = { 2, 3, 4, 5 };
                int[] values = { 3, 4, 5, 8 };
                int capacity = 5;
                // Optimal: Item 0 (w=2, v=3) + Item 1 (w=3, v=4) => v=7 (w=5) OR Item 3 (w=5, v=8) => v=8 (w=5)
                // Optimal value = 8 (Item 3)
                int expected = 8;

                int res2D = Solve2D(weights, values, capacity);
                int res1D = Solve1D(weights, values, capacity);
                KnapsackResult resRec = SolveWithReconstruction(weights, values, capacity);

                Debug.Assert(res2D == expected, $"Test 1 2D Failed: Expected {expected}, got {res2D}");
                Debug.Assert(res1D == expected, $"Test 1 1D Failed: Expected {expected}, got {res1D}");
                Debug.Assert(resRec.MaxValue == expected, "Test 1 Reconstruction MaxValue mismatch");
                Debug.Assert(resRec.TotalWeight <= capacity, "Test 1 Weight constraint violated");
                Debug.Assert(resRec.SelectedItems.Count == 1 && resRec.SelectedItems[0].Id == 3);

                Console.WriteLine($"[PASS] Test 1 (Canonical): MaxValue={res1D}, PackedWeight={resRec.TotalWeight}/{capacity}, Items=[{resRec.SelectedItems[0].Id}]");
            }

            // Test 2: Greedy Value-Density Counterexample
            {
                int[] weights = { 10, 20, 30 };
                int[] values = { 60, 100, 120 };
                int capacity = 50;
                // Greedy picks item 0 (10,60) then item 1 (20,100) => 160.
                // Optimal picks item 1 (20,100) + item 2 (30,120) => 220!
                int expected = 220;

                int res1D = Solve1D(weights, values, capacity);
                KnapsackResult resRec = SolveWithReconstruction(weights, values, capacity);

                Debug.Assert(res1D == expected, $"Test 2 Failed: Expected {expected}, got {res1D}");
                Debug.Assert(resRec.TotalWeight == 50);
                Debug.Assert(resRec.SelectedItems.Count == 2);
                Debug.Assert(resRec.SelectedItems[0].Id == 1 && resRec.SelectedItems[1].Id == 2);

                Console.WriteLine($"[PASS] Test 2 (Greedy Trap): MaxValue={res1D} (Greedy would be 160), PackedWeight={resRec.TotalWeight}");
            }

            // Test 3: Zero Capacity Boundary
            {
                int[] weights = { 1, 2, 3 };
                int[] values = { 10, 20, 30 };
                int capacity = 0;

                int res1D = Solve1D(weights, values, capacity);
                KnapsackResult resRec = SolveWithReconstruction(weights, values, capacity);

                Debug.Assert(res1D == 0);
                Debug.Assert(resRec.MaxValue == 0);
                Debug.Assert(resRec.SelectedItems.Count == 0);

                Console.WriteLine("[PASS] Test 3 (Zero Capacity Boundary): Result = 0");
            }

            // Test 4: All Items Exceed Capacity
            {
                int[] weights = { 10, 20, 30 };
                int[] values = { 100, 200, 300 };
                int capacity = 5;

                int res1D = Solve1D(weights, values, capacity);
                KnapsackResult resRec = SolveWithReconstruction(weights, values, capacity);

                Debug.Assert(res1D == 0);
                Debug.Assert(resRec.SelectedItems.Count == 0);

                Console.WriteLine("[PASS] Test 4 (All Items Exceed Capacity): Result = 0");
            }

            // Test 5: Exact Capacity Perfect Fit
            {
                int[] weights = { 5, 10, 15 };
                int[] values = { 50, 100, 150 };
                int capacity = 30; // 5 + 10 + 15 = 30
                int expected = 300;

                int res1D = Solve1D(weights, values, capacity);
                KnapsackResult resRec = SolveWithReconstruction(weights, values, capacity);

                Debug.Assert(res1D == expected);
                Debug.Assert(resRec.TotalWeight == 30);
                Debug.Assert(resRec.SelectedItems.Count == 3);

                Console.WriteLine($"[PASS] Test 5 (All Items Fit Perfectly): MaxValue={res1D}, PackedWeight={resRec.TotalWeight}");
            }

            // Test 6: Single Item Boundary Checks
            {
                int[] weights = { 7 };
                int[] values = { 42 };

                Debug.Assert(Solve1D(weights, values, 6) == 0);
                Debug.Assert(Solve1D(weights, values, 7) == 42);
                Debug.Assert(Solve1D(weights, values, 10) == 42);

                Console.WriteLine("[PASS] Test 6 (Single Item Boundary): Fits when capacity >= 7");
            }

            Console.WriteLine("================================================================================");
            Console.WriteLine("  All 6 Verification Test Suites Passed Flawlessly with 100% Invariants.");
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
                      INVARIANT 1: VALUE-CAPACITY MONOTONICITY
For any fixed set of items, as capacity w increases, the maximum achievable value is 
monotonically non-decreasing:
    dp[i][w] <= dp[i][w + 1]  for all w >= 0.
Having more capacity can never decrease the achievable utility.

                      INVARIANT 2: PSEUDO-POLYNOMIAL BOUNDEDNESS
The time complexity is O(N * W), where W is the magnitude of the capacity.
Because W is encoded in B = ceil(log_2(W)) bits, the runtime is exponential with 
respect to the input length: O(N * 2^B).
The problem is weakly NP-complete, solvable efficiently only when W is small.

                      INVARIANT 3: STRICT SUBSET CONSERVATION
In the backward sweep array, each item i contributes to at most one pick per 
reconstruction path. At no point can dp[w] accumulate value from item i more than once.
```

---

### 3.2 The 5-Dimension Staff Deep-Dive

#### 1. State Topology & Discrete Lattice
The state space is a discrete 2D grid of size $(N+1) \times (W+1)$.
Each cell $(i, w)$ has in-degree at most 2:
- An orthogonal downward edge from $(i-1, w)$ (skip item $i$).
- A diagonal downward-right edge from $(i-1, w - w_i)$ (pick item $i$).

The dependency graph is a Directed Acyclic Graph (DAG) whose topological order is trivial: all edges point from row $i-1$ to row $i$. Hence, rows can be computed sequentially from $i = 1$ to $N$.

```
                        0-1 Knapsack State Lattice DAG
                        
                        (i-1, w - w_i) ────┐
                               │           │ [Pick Item i: +v_i]
                               │           ▼
                          (i-1, w) ────► (i, w)
                               [Skip Item i: +0]
```

---

#### 2. Choice Gradients: Marginal Value vs Combinatorial Complement
At each cell $(i, w)$, the dynamic programming choice compares:
$$\text{Marginal Value Gain} = (\text{dp}[i-1][w - w_i] + v_i) - \text{dp}[i-1][w]$$
If this marginal gain is strictly positive ($> 0$), picking item $i$ is strictly superior. If the gain is zero, a tie occurs: both picking and skipping item $i$ yield identical total value.
- **Tie-Breaking Determinism:** Skipping item $i$ preserves capacity for subsequent items, frequently yielding a solution with smaller total packed weight for the same maximal value.

---

#### 3. Boundary Invariants & Sentinel Values
The knapsack boundaries act as absorbing barriers:
- Row $i = 0$: Seed values $\text{dp}[0][w] = 0$.
- Column $w = 0$: Seed values $\text{dp}[i][0] = 0$.
If items are allowed to have zero weight ($w_i = 0$), item $i$ can be picked with zero capacity cost. In that case, column 0 values would accumulate value. However, in standard formulations where $w_i \in \mathbb{Z}^+$, column 0 remains strictly 0.

---

#### 4. Memory Architecture & Cache Locality
- **Contiguous 2D Array `int[,]`:** Allocates a single block of $(N+1)(W+1) \times 4$ bytes. Row-major access (`dp[i, w]`) achieves unit stride-1 sequential memory access, maximizing L1 data cache line hits.
- **1D Rolling Buffer `int[]`:** Consumes only $(W+1) \times 4$ bytes. For $W = 10,000$, the entire array requires $40\text{ KB}$, fitting directly into modern CPU L1/L2 caches! The backward sweep access `dp[w - w_i]` incurs a small stride backwards, but remains entirely cache-resident, outperforming 2D matrices by an order of magnitude in execution time.

---

#### 5. Degenerate & Adversarial Extremes

| Scenario | Input Profile | DP Behavior | Potential Pathology |
| :--- | :--- | :--- | :--- |
| **Enormous Capacity** | $W = 10^9, N = 50$ | $O(NW)$ memory/time explodes ($4\text{ GB}$ allocation fails) | Pseudo-polynomial trap. Requires Branch-and-Bound or Meet-in-the-Middle $O(2^{N/2})$. |
| **All $w_i > W$** | $w_i = 100, W = 50$ | Loop `for (w = W; w >= w_i; w--)` never executes | Correctly outputs 0 in $O(N)$ iterations. |
| **Zero Weight Items** | $w_i = 0, v_i = 10$ | Infinite loop or multi-add if $w \ge 0$ loop condition | Must guard $w_i > 0$ or handle $w_i = 0$ as unconditional value accumulation. |
| **Identical Items** | 100 identical items | Standard 0-1 evaluates each identically | Bounded Knapsack with Binary Grouping should be used instead. |

---

## 4. DEMONSTRATE: Visual State Transitions & Reconstruction Traces

Let us trace the complete execution of 0-1 Knapsack for:
- Items:
  - Item 0: $w_0 = 2, v_0 = 3$
  - Item 1: $w_1 = 3, v_1 = 4$
  - Item 2: $w_2 = 4, v_2 = 5$
  - Item 3: $w_3 = 5, v_3 = 8$
- Maximum Capacity: $W = 5$.

### 4.1 Step 1: 2D Dynamic Programming Matrix

```
                      2D Knapsack Matrix dp[i, w]
                   w=0    w=1    w=2    w=3    w=4    w=5
                 ┌──────┬──────┬──────┬──────┬──────┬──────┐
       i=0 (Ø)   │  0   │  0   │  0   │  0   │  0   │  0   │
                 ├──────┼──────┼──────┼──────┼──────┼──────┤
       i=1 (2,3) │  0   │  0   │  3   │  3   │  3   │  3   │
                 ├──────┼──────┼──────┼──────┼──────┼──────┤
       i=2 (3,4) │  0   │  0   │  3   │  4   │  4   │  7   │  <-- dp[2,5] = max(3, dp[1,2]+4) = 7
                 ├──────┼──────┼──────┼──────┼──────┼──────┤
       i=3 (4,5) │  0   │  0   │  3   │  4   │  5   │  7   │
                 ├──────┼──────┼──────┼──────┼──────┼──────┤
       i=4 (5,8) │  0   │  0   │  3   │  4   │  5   │  8   │  <-- dp[4,5] = max(7, dp[3,0]+8) = 8
                 └──────┴──────┴──────┴──────┴──────┴──────┘

Optimal Result: dp[4, 5] = 8.
```

---

### 4.2 Step 2: 1D Backward Sweep Evolution Trace

Watch how the 1D buffer evolves after each item using the **Backward Sweep** ($w = 5 \to w_i$):

```
Initial (i=0):         [ 0,  0,  0,  0,  0,  0 ]

Processing Item 0 (w=2, v=3):
  w = 5: dp[5] = max(0, dp[3] + 3) = 3
  w = 4: dp[4] = max(0, dp[2] + 3) = 3
  w = 3: dp[3] = max(0, dp[1] + 3) = 3
  w = 2: dp[2] = max(0, dp[0] + 3) = 3
  Array after Item 0:  [ 0,  0,  3,  3,  3,  3 ]

Processing Item 1 (w=3, v=4):
  w = 5: dp[5] = max(3, dp[2] + 4) = max(3, 3 + 4) = 7
  w = 4: dp[4] = max(3, dp[1] + 4) = max(3, 0 + 4) = 4
  w = 3: dp[3] = max(3, dp[0] + 4) = max(3, 0 + 4) = 4
  Array after Item 1:  [ 0,  0,  3,  4,  4,  7 ]

Processing Item 2 (w=4, v=5):
  w = 5: dp[5] = max(7, dp[1] + 5) = max(7, 0 + 5) = 7
  w = 4: dp[4] = max(4, dp[0] + 5) = max(4, 0 + 5) = 5
  Array after Item 2:  [ 0,  0,  3,  4,  5,  7 ]

Processing Item 3 (w=5, v=8):
  w = 5: dp[5] = max(7, dp[0] + 8) = max(7, 0 + 8) = 8
  Array after Item 3:  [ 0,  0,  3,  4,  5,  8 ]
```

Final Answer in `dp[5]` is **8**, exactly matching the 2D table while consuming $6 \times 4 = 24\text{ bytes}$ of memory!

---

### 4.3 Step 3: Backtracking Item Reconstruction Trace

Starting at $(i=4, w=5)$:

| Step | State $(i, w)$ | $\text{dp}[i, w]$ | $\text{dp}[i-1, w]$ | Condition | Decision | Next State |
| :---: | :---: | :---: | :---: | :--- | :---: | :---: |
| **1** | $(4, 5)$ | 8 | 7 | $\text{dp}[4, 5] \ne \text{dp}[3, 5]$ | **PICK Item 3** ($w_3=5, v_3=8$) | $(3, 5 - 5) = (3, 0)$ |
| **2** | $(3, 0)$ | 0 | 0 | Capacity exhausted ($w = 0$) | Stop | $(0, 0)$ |

Selected Item Set: **`{ Item 3 }`** (Total Weight: 5, Total Value: 8).

---

## 5. PRACTICE: Canonical 0-1 Knapsack Problems & Variations

### 5.1 Exact Capacity Feasibility (Subset Sum Variation)

#### Problem
Given an array of positive weights and a target capacity $W$, determine whether there exists a subset of items whose weights sum to **exactly** $W$.

#### Recurrence
$$\text{dp}[w] = \text{dp}[w] \lor \text{dp}[w - w_i]$$
Base case: $\text{dp}[0] = \text{true}$, all other $\text{dp}[w] = \text{false}$.

```csharp
public static bool CanFormExactWeight(int[] weights, int target)
{
    bool[] dp = new bool[target + 1];
    dp[0] = true;

    foreach (int w_i in weights)
    {
        for (int w = target; w >= w_i; w--)
        {
            if (dp[w - w_i])
            {
                dp[w] = true;
            }
        }
        if (dp[target]) return true; // Early termination optimization
    }

    return dp[target];
}
```

---

### 5.2 Minimum Weight to Achieve Target Value (Dual Knapsack)

#### Problem
When the capacity $W$ is enormous ($W = 10^9$) but the total sum of values is small ($\sum v_i \le 10^4$), standard capacity DP fails due to memory exhaustion.
We invert the dynamic programming state:

#### State Definition
Let $\text{dp}[v]$ denote the **minimum total weight** required to achieve a cumulative value of at least $v$.

#### Recurrence
$$\text{dp}[v] = \min(\text{dp}[v], \text{dp}[v - v_i] + w_i)$$
- Base case: $\text{dp}[0] = 0$, all other $\text{dp}[v] = \infty$.
- Time Complexity: $O(N \cdot \sum v_i)$.
- Space Complexity: $O(\sum v_i)$.

```csharp
public static int SolveLargeCapacityKnapsack(int[] weights, int[] values, int capacity)
{
    int totalValue = 0;
    foreach (int v in values) totalValue += v;

    long[] dp = new long[totalValue + 1];
    Array.Fill(dp, long.MaxValue / 2); // Prevent overflow
    dp[0] = 0;

    for (int i = 0; i < weights.Length; i++)
    {
        int w_i = weights[i];
        int v_i = values[i];

        for (int v = totalValue; v >= v_i; v--)
        {
            dp[v] = Math.Min(dp[v], dp[v - v_i] + w_i);
        }
    }

    // Find the maximum value whose minimum required weight <= capacity
    for (int v = totalValue; v >= 0; v--)
    {
        if (dp[v] <= capacity)
        {
            return v;
        }
    }

    return 0;
}
```

---

## 6. CONNECT: Cloud Container Bin Packing & Virtual Machine Sizing

### 6.1 Kubernetes Pod Placement & Multi-Dimensional Knapsack

In cloud-native infrastructure (e.g., Kubernetes `kube-scheduler`, Borg, Amazon ECS), cluster nodes are Virtual Machines with fixed physical resource capacities:
- Node RAM Capacity: e.g., $W_{\text{RAM}} = 64\text{ GB}$.
- Node CPU Capacity: e.g., $W_{\text{CPU}} = 32\text{ vCPUs}$.

Incoming containerized microservices (Pods) have declared resource requests: $\langle \text{RAM}_i, \text{CPU}_i \rangle$ and associated priority/revenue scores $v_i$.

```
                    Kubernetes Node Resource Bin Packing
                    
      Node Capacity: [ RAM: 64 GB  |  CPU: 32 Cores ]
      
      Pod A: (RAM: 16 GB, CPU: 8 Cores, Priority: 10)  ──► [ Packed ]
      Pod B: (RAM: 32 GB, CPU: 16 Cores, Priority: 25) ──► [ Packed ]
      Pod C: (RAM: 24 GB, CPU: 12 Cores, Priority: 18) ──► [ Rejection: Exceeds RAM ]
      ──────────────────────────────────────────────────────────────
      Total Allocated: RAM: 48/64 GB (75%), CPU: 24/32 Cores (75%)
```

#### Production Trade-offs: Exact Knapsack vs. Online Heuristics
- An exact 0-1 Knapsack DP requires $O(N \cdot W_{\text{RAM}} \cdot W_{\text{CPU}})$ compute. For 1,000 nodes and 10,000 pods per minute, solving exact DP per scheduling decision causes unacceptable scheduling latency ($> 500\text{ ms}$).
- Therefore, production schedulers combine:
  1. **Filtering Phase:** Hard predicate checks (eliminating nodes that cannot fit the pod).
  2. **Scoring Phase:** Knapsack-derived heuristic scoring:
     $$\text{Score} = \alpha \cdot \text{LeastAllocated} + \beta \cdot \text{BalancedResourceAllocation}$$
     where $\text{BalancedResourceAllocation} = 1 - \frac{|\text{CPU}_{\text{fraction}} - \text{RAM}_{\text{fraction}}|}{2}$.

---

## 7. CHECKPOINT: Comprehensive Self-Assessment & Mastery Key

### 7.1 Diagnostic Mastery Audit (10 Staff-Level Questions)

```
[Q1] State the mathematical proof for why the capacity loop must be traversed in descending 
     order (w = W down to w_i) in the 1D space-optimized 0-1 knapsack algorithm.

[Q2] What specific computational problem is solved if the capacity loop is traversed in 
     ascending order (w = w_i up to W)? Explain the state access mechanism.

[Q3] Why is the 0-1 Knapsack problem classified as "weakly NP-complete" rather than 
     "strongly NP-complete"? Define the role of pseudo-polynomial time.

[Q4] In an interview, when capacity W is 10^9 and N is 40, why does the standard DP fail, 
     and what algorithmic technique should you deploy instead?

[Q5] Under what condition does the greedy value-density heuristic (v_i / w_i) guarantee an 
     optimal solution for the 0-1 knapsack problem?

[Q6] Can item reconstruction be performed using strictly O(W) auxiliary space without 
     storing the full (N+1) x (W+1) table? Explain the trade-off.

[Q7] How does the state definition change when we want to find the MINIMUM weight required 
     to achieve a target value V? State the recurrence and base cases.

[Q8] What is the cache locality advantage of iterating w descending compared to a 2D matrix, 
     and what is the exact L1 cache footprint for W = 10,000?

[Q9] If an item has weight w_i = 0 and value v_i > 0, how does it affect the backward sweep, 
     and what defensive guard must be applied?

[Q10] What is the difference between 0-1 Knapsack and the Subset Sum problem? Show the exact 
      reduction from Subset Sum to 0-1 Knapsack.
```

---

### 7.2 Exhaustive Mastery Key & Mathematical Derivations

#### [A1] Inductive Proof of Backward Sweep Invariant
In a 1D array, `dp[w] = max(dp[w], dp[w - w_i] + v_i)`. When looping descending ($w = W \to w_i$), for any $w$, the value at index $w - w_i$ is strictly smaller than $w$. Because the loop moves downwards, index $w - w_i$ has not yet been processed during item $i$'s iteration, meaning it still holds the value from iteration $i-1$: $\text{dp}[w - w_i] \equiv \text{dp}_{i-1}[w - w_i]$. This ensures item $i$ is added to an optimal configuration that contains only items from $\{1, \dots, i-1\}$, guaranteeing item $i$ is chosen at most once.

#### [A2] Forward Sweep Mechanism
Looping ascending ($w = w_i \to W$) solves the **Unbounded Knapsack Problem** (items can be picked an infinite number of times). Because $w - w_i < w$, index $w - w_i$ is updated *before* index $w$ is reached in the current item's loop. Therefore, $\text{dp}[w - w_i]$ reflects a state that already contains one or more instances of item $i$, allowing item $i$ to be picked repeatedly.

#### [A3] Weak NP-Completeness & Pseudo-Polynomial Time
An algorithm is pseudo-polynomial if its runtime is polynomial in the *numeric value* of the input, but exponential in the *length of the input* (the number of bits). The 0-1 knapsack DP runs in $O(N \cdot W)$. The capacity $W$ requires $B = \lceil \log_2(W + 1) \rceil$ bits to encode. Thus $O(N \cdot W) = O(N \cdot 2^B)$, which is exponential in the input size $B$. It is weakly NP-complete because if $W$ is bounded by a polynomial in $N$, it runs in polynomial time. Strongly NP-complete problems remain NP-hard even when numeric values are polynomially bounded.

#### [A4] Large Capacity Technique: Meet-in-the-Middle
When $W = 10^9$ and $N = 40$, $O(N \cdot W) = 4 \times 10^{10}$ operations and $4\text{ GB}$ memory exceeds limits. However, $N = 40$ is small. We split the items into two halves of 20 items each:
1. Generate all $2^{20} \approx 10^6$ subset sums (weight, value) for the first half. Sort by weight and prune dominated pairs.
2. Generate all $2^{20}$ subset sums for the second half.
3. For each pair $(w_2, v_2)$ in the second half, binary search in the first half for the maximum value with weight $\le W - w_2$.
Total runtime: $O(2^{N/2} \cdot \log(2^{N/2})) \approx 10^6 \times 20 \approx 2 \times 10^7$ operations ($< 0.1\text{ second}$).

#### [A5] Greedy Value-Density Optimality Condition
The greedy heuristic is guaranteed to be optimal if and only if item weights and values allow fractional items (Fractional Knapsack), or if item weights are power-of-two multiples ($w_{i+1} = k \cdot w_i$) with decreasing densities, or if every item has identical weight $w_i = w$ (in which case it reduces to sorting by value).

#### [A6] Space-Efficient Item Reconstruction
Yes. Instead of storing $O(N \cdot W)$ 32-bit integers ($4NW$ bytes), we can store a **bitset matrix** of size $(N \times W)$ where bit $(i, w)$ is 1 if item $i$ was picked, and 0 otherwise. This consumes $\frac{N \cdot W}{8}$ bytes (a $32\times$ memory reduction, e.g., $1000 \times 10000$ requires only $1.25\text{ MB}$). Alternatively, divide-and-conquer (Hirschberg-style) reconstructs items in $O(W)$ space with $2\times$ time overhead.

#### [A7] Dual Knapsack Recurrence
State: $\text{dp}[v] =$ minimum weight to achieve total value $v$.
Recurrence: $\text{dp}[v] = \min(\text{dp}[v], \text{dp}[v - v_i] + w_i)$ for $v = \sum v_i \to v_i$.
Base cases: $\text{dp}[0] = 0$, all other $\text{dp}[v] = \infty$.
Runtime: $O(N \cdot \sum v_i)$, useful when $\sum v_i \ll W$.

#### [A8] Cache Locality Analysis
A 2D array of size $(1000 \times 10000)$ requires $40\text{ MB}$, far exceeding the CPU L3 cache ($\approx 16\text{–}32\text{ MB}$) and causing cache line evictions.
A 1D array for $W = 10,000$ requires:
$$\text{Memory} = 10,001 \times 4\text{ bytes} \approx 39.06\text{ KB}$$
Standard L1 data cache per core is $48\text{ KB}$ or $64\text{ KB}$. The entire 1D array resides permanently in L1 cache during execution, resulting in zero DRAM latency and high instruction pipeline throughput.

#### [A9] Zero-Weight Items Pathology
If an item has $w_i = 0$ and $v_i > 0$, the backward loop condition `w >= w_i` reaches $w = 0$. At $w = 0$, $\text{dp}[0] = \max(\text{dp}[0], \text{dp}[0] + v_i) = \text{dp}[0] + v_i$.
Because $w_i = 0$, this item consumes zero capacity and should be picked unconditionally. In clean production code, zero-weight items are extracted in preprocessing and their values are added directly to the baseline result: $\text{baseValue} += v_i$.

#### [A10] Reduction from Subset Sum to 0-1 Knapsack
In Subset Sum, given integers $S = \{s_1, \dots, s_N\}$ and target $T$, determine if any subset sums to $T$.
Reduction to 0-1 Knapsack:
Set $w_i = s_i$, $v_i = s_i$ for all items, and set capacity $W = T$.
Solve the knapsack. If $\text{MaxValue} == T$, then a subset summing to $T$ exists. Since all $v_i = w_i$, $\sum x_i v_i \le \sum x_i w_i \le W = T$. MaxValue can reach $T$ if and only if the subset sum equals $T$ exactly. Subset Sum is a direct special case of 0-1 Knapsack.
