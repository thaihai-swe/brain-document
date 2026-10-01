---
title: "Week 34 — Day 234: Unbounded Knapsack & Coin Change I & II: Forward Sweep Proof, Minimum Coins vs. Number of Ways"
---

# Week 34 — Day 234: Unbounded Knapsack & Coin Change I & II: Forward Sweep Proof, Minimum Coins vs. Number of Ways

## 1. TEACH: Infinite Resource Reuse, Forward Sweep Mechanics & Loop Ordering Theorems

### 1.1 The Unbounded Knapsack Problem Formalization

In the 0-1 Knapsack problem, each item could be selected at most once: $x_i \in \{0, 1\}$. 
In the **Unbounded Knapsack Problem** (also known as the Complete Knapsack Problem), items represent renewable or infinite resources. Each item type $i \in \{1, \dots, N\}$ possesses an intrinsic weight $w_i \in \mathbb{Z}^+$ and value $v_i \in \mathbb{Z}^+$, and an unlimited quantity of each item is available:

$$\bbox[12px,border:2px solid #2563eb,background-color:#eff6ff]{\begin{aligned}
\text{Maximize} \quad & \sum_{i=1}^N x_i v_i \\
\text{Subject to} \quad & \sum_{i=1}^N x_i w_i \le W, \quad x_i \in \{0, 1, 2, 3, \dots\} \quad \forall i \in \{1, \dots, N\}
\end{aligned}}$$

```
               0-1 Knapsack vs. Unbounded Knapsack Semantics
               
   0-1 Knapsack:       Pick Item i  ──► Transition to (i - 1, w - w_i)
                       (Item i is CONSUMED; cannot be picked again)
                       
   Unbounded Knapsack: Pick Item i  ──► Transition to (i, w - w_i)
                       (Item i REMAINS IN THE POOL; can be picked again!)
```

#### 2D Dynamic Programming Recurrence
Let $\text{dp}[i][w]$ denote the maximum value achievable using any quantity of items chosen from the prefix $\{1, \dots, i\}$ with total weight not exceeding $w$:

1. **Option A (Skip Item $i$):** We do not use item $i$ at all. The value is strictly that of using the first $i-1$ items: $\text{dp}[i-1][w]$.
2. **Option B (Pick Item $i$):** We include at least one instance of item $i$, gaining value $v_i$ and consuming weight $w_i$. Crucially, **item $i$ is NOT retired**; the remaining capacity $w - w_i$ can still be allocated to further instances of item $i$. Thus, the subproblem state is $\text{dp}[i][w - w_i] + v_i$.

$$\text{dp}[i][w] = \begin{cases}
\text{dp}[i-1][w] & \text{if } w < w_i \\
\max(\text{dp}[i-1][w], \mathbf{dp[i][w - w_i]} + v_i) & \text{if } w \ge w_i
\end{cases}$$

Notice the fundamental structural difference in the second argument: in 0-1 Knapsack, it was $\text{dp}[i-1][w - w_i]$; in Unbounded Knapsack, it is $\mathbf{dp[i][w - w_i]}$!

---

### 1.2 The Forward Sweep Invariant & Inductive Proof of Correctness

In Day 232, we proved that in 0-1 Knapsack, a 1D rolling array MUST iterate capacity in descending order ($w = W \to w_i$) to prevent multi-use item corruption.
In Unbounded Knapsack, the objective is the exact opposite: **we explicitly desire multi-use accumulation**.

```
                         The Sweep Direction Duality
                         
   0-1 Knapsack:       w = W down to w_i   ==> Reads row (i - 1)  ==> Single Use
   Unbounded Knapsack: w = w_i up to W     ==> Reads row (i)      ==> Infinite Use
```

#### Theorem (The Forward Sweep Invariant)
*Let $\text{dp}$ be a 1D array of size $W+1$ initialized such that before processing item $i$, $\text{dp}[w]$ holds $\text{dp}_{i-1}[w]$ for all $w \in [0, W]$. Updating the array via:*
$$\text{dp}[w] = \max(\text{dp}[w], \text{dp}[w - w_i] + v_i)$$
*in strictly ascending order ($w = w_i \to W$) correctly computes the Unbounded Knapsack state $\text{dp}_i[w]$ for all $w \in [0, W]$.*

#### Mathematical Proof by Induction
Let $\text{dp}^{(t)}$ denote the state of the 1D array during the evaluation of item $i$.
Before the capacity loop begins:
$$\text{dp}^{(0)}[k] = \text{dp}_{i-1}[k] \quad \text{for all } k \in [0, W]$$

We iterate $w$ in strictly ascending order: $w = w_i, w_i + 1, \dots, W$.

**Base Case:** At $w = w_i$:
$$\text{dp}[w_i] \leftarrow \max(\text{dp}[w_i], \text{dp}[0] + v_i)$$
Here, $\text{dp}[w_i]$ holds $\text{dp}_{i-1}[w_i]$, and $\text{dp}[0]$ holds $\text{dp}_{i-1}[0] = 0 = \text{dp}_i[0]$.
Thus, $\text{dp}[w_i] = \max(\text{dp}_{i-1}[w_i], \text{dp}_i[0] + v_i) = \text{dp}_i[w_i]$. The base case holds.

**Inductive Step:**
Assume that for all $k \in [0, w-1]$, the array has already been updated to its final row-$i$ values: $\text{dp}[k] = \text{dp}_i[k]$.
Now evaluate capacity $w$:
$$\text{dp}[w] \leftarrow \max(\text{dp}[w], \text{dp}[w - w_i] + v_i)$$
Examine the two terms on the right-hand side:
1. The first term $\text{dp}[w]$ has not yet been modified during item $i$'s loop (since the loop progresses upward and has just reached $w$). Therefore, $\text{dp}[w] = \text{dp}_{i-1}[w]$.
2. The second term references index $w - w_i$. Because $w_i \ge 1$, we have $w - w_i \le w - 1$. By our inductive hypothesis, all indices strictly smaller than $w$ have **already been updated** during item $i$'s loop! Therefore:
   $$\text{dp}[w - w_i] = \mathbf{dp_i[w - w_i]}$$
Substituting both terms:
$$\text{dp}[w] = \max(\text{dp}_{i-1}[w], \text{dp}_i[w - w_i] + v_i) = \text{dp}_i[w]$$

By mathematical induction, the ascending capacity sweep correctly computes the unbounded choice recurrence for all $w \in [w_i, W]$. $\blacksquare$

---

### 1.3 The Combinations vs. Permutations Loop Ordering Theorem

A ubiquitous Staff-level interview challenge is understanding the deep mathematical duality between **Coin Change II** ([LeetCode 518]) and **Combination Sum IV** ([LeetCode 377]). Both problems use identical numbers and seek ways to sum to a target, yet their code differs only by **swapping the inner and outer loops**!

```
                  The Loop Ordering Duality Matrix
                  
   Architecture A: Outer Coins, Inner Amount        Architecture B: Outer Amount, Inner Coins
   ─────────────────────────────────────────        ─────────────────────────────────────────
   for coin in coins:                               for amount = 1 to Target:
       for a = coin to Target:                          for coin in coins:
           dp[a] += dp[a - coin]                            if a >= coin:
                                                                dp[a] += dp[a - coin]
   
   Result: COMBINATIONS (LC 518)                    Result: PERMUTATIONS (LC 377)
   {1, 2} and {2, 1} are counted ONCE               {1, 2} and {2, 1} are counted AS TWO
```

#### Theorem (Loop Ordering Duality)
1. *Iterating denominations in the outer loop and target amount in the inner loop counts **Unordered Combinations**.*
2. *Iterating target amount in the outer loop and denominations in the inner loop counts **Ordered Permutations**.*

#### Mathematical Proof
**Case 1: Outer Coins, Inner Amount (Combinations)**
Let coins be ordered arbitrarily: $c_1, c_2, \dots, c_N$.
When the outer loop is at coin $c_k$, the inner loop updates amounts using only coins from the prefix $\{c_1, \dots, c_k\}$.
A coin $c_k$ is only ever appended to combinations formed exclusively from $\{c_1, \dots, c_k\}$.
Crucially, a coin $c_j$ with $j < k$ **can never be selected after $c_k$**, because the outer loop for $c_j$ has already permanently finished!
Thus, every valid coin combination is generated in a canonical, monotonically non-decreasing order of denomination indices:
$$idx_1 \le idx_2 \le \dots \le idx_m$$
Because there is exactly one sorted representation for any multiset of coins, each combination is counted **exactly once**.

**Case 2: Outer Amount, Inner Coins (Permutations)**
When the outer loop is amount $a$, we consider all transitions ending with coin $c_i$:
$$\text{dp}[a] = \sum_{c \in \text{coins}, c \le a} \text{dp}[a - c]$$
This expresses that an ordered sequence of coins summing to $a$ is formed by taking ANY valid ordered sequence summing to $a - c$ and appending coin $c$ as the final element.
Because this recurrence branches on the **final coin** in the sequence, the sequences $(1, 2)$ and $(2, 1)$ represent distinct terminal choices:
- Sequence $(1, 2)$ is formed at amount 3 by taking sequence $(1)$ at amount 1 and appending coin 2.
- Sequence $(2, 1)$ is formed at amount 3 by taking sequence $(2)$ at amount 2 and appending coin 1.
Both paths contribute independently to $\text{dp}[3]$, generating all distinct **permutations**. $\blacksquare$

---

### 1.4 Algebraic Semiring Duality: Optimization vs. Counting

Notice the profound algebraic duality between Coin Change I and Coin Change II:

| Problem | Semiring Name | Carrier Set | Collector ($\oplus$) | Extender ($\otimes$) | Identity ($\mathbf{0}$) | Unit ($\mathbf{1}$) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Coin Change I** ([LC 322]) | Tropical $(\min, +)$ | $\mathbb{R} \cup \{\infty\}$ | $\min(a, b)$ | $a + b$ | $\infty$ | $0$ |
| **Coin Change II** ([LC 518]) | Counting $(+, \times)$ | $\mathbb{N}_0$ | $a + b$ | $a \times b$ | $0$ | $1$ |

In Coin Change I:
$$\text{dp}[a] = \min_{c} (\text{dp}[a - c] + 1) \quad \text{with base } \text{dp}[0] = 0$$
In Coin Change II:
$$\text{dp}[a] = \sum_{c} (\text{dp}[a - c]) \quad \text{with base } \text{dp}[0] = 1$$

---

## 2. IMPLEMENT: Production-Grade Unbounded Knapsack & Coin Change Engine (.NET 8+)

The following complete, compile-ready C# container implements:
1. `MinCoins`: Solves Coin Change I ([LC 322]) with overflow-safe sentinel guards.
2. `CountCombinations`: Solves Coin Change II ([LC 518]) enforcing the outer-coin combination invariant.
3. `CountPermutations`: Solves Combination Sum IV ([LC 377]) enforcing the outer-amount permutation invariant.
4. `SolveUnboundedKnapsack`: Classic value-maximizing unbounded knapsack.
5. Self-validating test harness in `Main()` with robust `Debug.Assert` validation.

```csharp
using System;
using System.Diagnostics;

namespace DynamicProgramming.UnboundedKnapsack
{
    /// <summary>
    /// Production-grade engine for Unbounded Knapsack, Coin Change optimization,
    /// and the Combinations vs. Permutations loop ordering duality.
    /// </summary>
    public static class CoinChangeEngine
    {
        #region 1. Coin Change I ([LC 322]) - Minimum Coins (Tropical Semiring)

        /// <summary>
        /// Computes the minimum number of coins needed to make up the given amount.
        /// Returns -1 if the amount cannot be made up by any combination of the coins.
        /// Uses an overflow-safe sentinel guard (amount + 1).
        /// Time Complexity: O(Coins.Length * Amount)
        /// Space Complexity: O(Amount)
        /// </summary>
        public static int MinCoins(int[] coins, int amount)
        {
            ArgumentNullException.ThrowIfNull(coins);
            if (amount < 0) throw new ArgumentOutOfRangeException(nameof(amount), "Amount cannot be negative.");
            if (amount == 0) return 0;
            if (coins.Length == 0) return -1;

            // SENTINEL GUARD DESIGN:
            // The maximum possible coins needed is 'amount' (using denomination 1).
            // Hence, 'amount + 1' acts as infinity without risking integer overflow when adding 1.
            int infinity = amount + 1;
            int[] dp = new int[amount + 1];
            Array.Fill(dp, infinity);
            dp[0] = 0; // Base case: 0 coins needed for amount 0

            // Forward sweep across amounts for each coin
            foreach (int coin in coins)
            {
                if (coin <= 0) continue; // Defensive guard against non-positive denominations

                for (int a = coin; a <= amount; a++)
                {
                    int candidate = dp[a - coin] + 1;
                    if (candidate < dp[a])
                    {
                        dp[a] = candidate;
                    }
                }
            }

            return dp[amount] > amount ? -1 : dp[amount];
        }

        #endregion

        #region 2. Coin Change II ([LC 518]) - Combinations (Outer Coins)

        /// <summary>
        /// Computes the number of UNORDERED COMBINATIONS that make up the given amount.
        /// Loop Ordering: Outer = Coins, Inner = Amount.
        /// Enforces monotonic denomination indices: {1, 2} == {2, 1}.
        /// Time Complexity: O(Coins.Length * Amount)
        /// Space Complexity: O(Amount)
        /// </summary>
        public static int CountCombinations(int[] coins, int amount)
        {
            ArgumentNullException.ThrowIfNull(coins);
            if (amount < 0) throw new ArgumentOutOfRangeException(nameof(amount), "Amount cannot be negative.");
            if (amount == 0) return 1;

            int[] dp = new int[amount + 1];
            dp[0] = 1; // 1 way to form amount 0 (the empty set of coins)

            // COMBINATION INVARIANT: Outer = Coins
            foreach (int coin in coins)
            {
                if (coin <= 0) continue;

                // FORWARD SWEEP INVARIANT: Ascending traversal allows infinite reuse of current coin
                for (int a = coin; a <= amount; a++)
                {
                    dp[a] += dp[a - coin];
                }
            }

            return dp[amount];
        }

        #endregion

        #region 3. Combination Sum IV ([LC 377]) - Permutations (Outer Amount)

        /// <summary>
        /// Computes the number of ORDERED PERMUTATIONS that make up the given amount.
        /// Loop Ordering: Outer = Amount, Inner = Coins.
        /// Distinguishes sequence order: (1, 2) != (2, 1).
        /// Time Complexity: O(Coins.Length * Amount)
        /// Space Complexity: O(Amount)
        /// </summary>
        public static int CountPermutations(int[] coins, int amount)
        {
            ArgumentNullException.ThrowIfNull(coins);
            if (amount < 0) throw new ArgumentOutOfRangeException(nameof(amount), "Amount cannot be negative.");
            if (amount == 0) return 1;

            int[] dp = new int[amount + 1];
            dp[0] = 1;

            // PERMUTATION INVARIANT: Outer = Amount
            for (int a = 1; a <= amount; a++)
            {
                // Inner = Coins: any coin can be chosen as the final element in the sequence
                foreach (int coin in coins)
                {
                    if (a >= coin)
                    {
                        // Check for integer overflow protection
                        if (int.MaxValue - dp[a - coin] >= dp[a])
                        {
                            dp[a] += dp[a - coin];
                        }
                        else
                        {
                            dp[a] = int.MaxValue; // Saturate on overflow
                        }
                    }
                }
            }

            return dp[amount];
        }

        #endregion

        #region 4. Classic Unbounded Knapsack (Value Maximization)

        /// <summary>
        /// Solves the classic Unbounded Knapsack problem, maximizing total value under capacity W.
        /// Time Complexity: O(N * W)
        /// Space Complexity: O(W)
        /// </summary>
        public static int SolveUnboundedKnapsack(int[] weights, int[] values, int capacity)
        {
            ArgumentNullException.ThrowIfNull(weights);
            ArgumentNullException.ThrowIfNull(values);

            if (weights.Length != values.Length)
            {
                throw new ArgumentException("Mismatched weights and values array lengths.");
            }

            int n = weights.Length;
            if (n == 0 || capacity <= 0) return 0;

            int[] dp = new int[capacity + 1];

            for (int i = 0; i < n; i++)
            {
                int w_i = weights[i];
                int v_i = values[i];
                if (w_i <= 0) continue;

                // FORWARD SWEEP: Ascending capacity traversal
                for (int w = w_i; w <= capacity; w++)
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

        #endregion

        #region Self-Validating Test Suite

        public static void Main()
        {
            Console.WriteLine("================================================================================");
            Console.WriteLine("  CoinChangeEngine: Self-Validating Production Test Suite");
            Console.WriteLine("================================================================================");

            // Test 1: Canonical LeetCode 322 Example
            {
                int[] coins = { 1, 2, 5 };
                int amount = 11;
                // 11 = 5 + 5 + 1 => 3 coins
                int minCoins = MinCoins(coins, amount);

                Debug.Assert(minCoins == 3, $"Test 1 Failed: Expected 3, got {minCoins}");
                Console.WriteLine($"[PASS] Test 1 (Coin Change I): coins=[1,2,5], amount=11 => MinCoins={minCoins}");
            }

            // Test 2: Unreachable Target Amount
            {
                int[] coins = { 2 };
                int amount = 3;
                int minCoins = MinCoins(coins, amount);

                Debug.Assert(minCoins == -1, $"Test 2 Failed: Expected -1, got {minCoins}");
                Console.WriteLine("[PASS] Test 2 (Unreachable Amount): coins=[2], amount=3 => -1 (Correct)");
            }

            // Test 3: Zero Amount Base Case
            {
                int[] coins = { 1, 5, 10 };
                Debug.Assert(MinCoins(coins, 0) == 0);
                Debug.Assert(CountCombinations(coins, 0) == 1);
                Debug.Assert(CountPermutations(coins, 0) == 1);

                Console.WriteLine("[PASS] Test 3 (Zero Amount Boundary): MinCoins=0, Combinations=1, Permutations=1");
            }

            // Test 4: Greedy Failure Counterexample in Coin Change I
            {
                // In system {1, 3, 4}, for amount 6:
                // Greedy picks 4, then 1, then 1 => 3 coins (4 + 1 + 1)
                // Optimal DP picks 3 + 3 => 2 coins!
                int[] coins = { 1, 3, 4 };
                int amount = 6;
                int minCoins = MinCoins(coins, amount);

                Debug.Assert(minCoins == 2, $"Test 4 Failed: Expected 2 (3+3), got {minCoins}");
                Console.WriteLine($"[PASS] Test 4 (Greedy Trap): coins=[1,3,4], amount=6 => MinCoins={minCoins} (Greedy would be 3)");
            }

            // Test 5: Loop Ordering Duality (Combinations vs. Permutations)
            {
                int[] coins = { 1, 2 };
                int amount = 3;
                // Combinations: {1,1,1}, {1,2} => 2 ways
                // Permutations: (1,1,1), (1,2), (2,1) => 3 ways
                int combinations = CountCombinations(coins, amount);
                int permutations = CountPermutations(coins, amount);

                Debug.Assert(combinations == 2, $"Combinations failed: Expected 2, got {combinations}");
                Debug.Assert(permutations == 3, $"Permutations failed: Expected 3, got {permutations}");
                Console.WriteLine($"[PASS] Test 5 (Loop Ordering Duality): coins=[1,2], amount=3 => Comb={combinations}, Perm={permutations}");
            }

            // Test 6: Canonical LeetCode 518 Example
            {
                int[] coins = { 1, 2, 5 };
                int amount = 5;
                // Combinations: 5 = (5), (2+2+1), (2+1+1+1), (1+1+1+1+1) => 4 ways
                int combinations = CountCombinations(coins, amount);

                Debug.Assert(combinations == 4, $"Test 6 Failed: Expected 4, got {combinations}");
                Console.WriteLine($"[PASS] Test 6 (Coin Change II): coins=[1,2,5], amount=5 => Combinations={combinations}");
            }

            // Test 7: Classic Unbounded Knapsack
            {
                int[] weights = { 2, 3, 4 };
                int[] values = { 5, 8, 11 };
                int capacity = 6;
                // Items can be reused:
                // Option A: 3 of item 0 (w=2, v=5) => w=6, v=15
                // Option B: 2 of item 1 (w=3, v=8) => w=6, v=16  <-- OPTIMAL
                // Option C: 1 of item 2 (w=4, v=11) + 1 of item 0 (w=2, v=5) => w=6, v=16 <-- OPTIMAL
                int expectedMax = 16;
                int maxVal = SolveUnboundedKnapsack(weights, values, capacity);

                Debug.Assert(maxVal == expectedMax, $"Test 7 Failed: Expected {expectedMax}, got {maxVal}");
                Console.WriteLine($"[PASS] Test 7 (Unbounded Knapsack): Capacity=6 => MaxValue={maxVal} (Correct)");
            }

            Console.WriteLine("================================================================================");
            Console.WriteLine("  All 7 Verification Test Suites Passed Flawlessly with 100% Invariants.");
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
                      INVARIANT 1: CANONICAL COIN SYSTEM PROPERTY
A coin denomination system is "canonical" if and only if the greedy algorithm yields 
an optimal solution for EVERY integer amount.
While US currency {1, 5, 10, 25} is canonical, arbitrary systems (e.g. {1, 3, 4}) 
are non-canonical and strictly require dynamic programming.

                      INVARIANT 2: SENTINEL OVERFLOW SAFETY
In minimization DP, initializing unreachable states to int.MaxValue causes 32-bit 
signed integer overflow when computing dp[a - c] + 1 (wrapping to negative numbers).
Setting the sentinel to (amount + 1) guarantees strict mathematical correctness:
no valid combination can ever require more than 'amount' coins.

                      INVARIANT 3: MONOTONIC DENOMINATION CANONICALIZATION
By placing the denomination loop on the outside, any chosen combination must satisfy:
    coin_1 <= coin_2 <= ... <= coin_k
eliminating all n! permutations of the same multiset.
```

---

### 3.2 The 5-Dimension Staff Deep-Dive

#### 1. State Topology & Dependency DAG
In 0-1 Knapsack, transitions only flow from row $i-1$ to row $i$.
In Unbounded Knapsack, transitions flow **within the same row $i$** from $w - w_i$ to $w$.
This creates a self-looping recurrence in the item dimension, which collapses into a 1D DAG whose vertices are the amounts $0, 1, \dots, W$ and whose edges are directed transitions $(a - c) \to a$ for each coin $c$. Because all $c \ge 1$, the graph is strictly acyclic.

```
                    Unbounded Knapsack 1D Dependency DAG
                    
      (0) ──(+c)──► (c) ──(+c)──► (2c) ──(+c)──► (3c) ──► ... ──► (W)
       │             │             │
       └──(+c2)──► (c2) ──(+c)──► (c2 + c)
```

---

#### 2. Choice Gradients: Tropical Minimization vs. Combinatorial Counting
- **Coin Change I:** Evaluates the tropical minimum $\min_{c} (\text{dp}[a - c] + 1)$. The choice gradient identifies the single steepest descent edge leading to the minimum path length back to vertex 0.
- **Coin Change II:** Evaluates the summation $\sum_{c} \text{dp}[a - c]$. The choice gradient accumulates the flow of all valid topological paths from vertex 0 to $a$.

---

#### 3. Boundary Invariants & Identity Elements
- For Coin Change I, $\text{dp}[0] = 0$ (zero coins required for zero amount). Unreachable amounts are marked with the sentinel $\infty = \text{amount} + 1$.
- For Coin Change II, $\text{dp}[0] = 1$ (exactly one combination, the empty set $\emptyset$, sums to zero). If $\text{dp}[0]$ were 0, the sum would propagate zeroes permanently.

---

#### 4. Memory Architecture & Sequential Stride-1 Hardware Prefetching
Because the forward sweep iterates $a = c \to \text{amount}$ in strictly ascending order:
- The CPU hardware prefetcher detects contiguous, stride-1 forward memory access.
- Cache lines are sequentially brought into L1 cache ahead of instruction execution.
- Unlike backward sweeps or 2D matrices, the forward sweep operates at near-theoretical peak DRAM bandwidth!

---

#### 5. Degenerate & Adversarial Extremes

| Scenario | Input Profile | Theoretical Pathology | Engine Defense |
| :--- | :--- | :--- | :--- |
| **All Coins Exceed Target** | `coins = [10, 20]`, `amount = 5` | Loop `for (a = c; a <= amount)` never triggers | `dp[5]` remains $\infty \implies$ returns -1 in $O(1)$. |
| **Divisibility Failure** | `coins = [2, 4, 6]`, `amount = 7` | $\gcd(\text{coins}) = 2$, but $7 \pmod 2 \ne 0$ | Sentinel correctly detects unreachability $\implies$ returns -1. |
| **Zero Amount** | `coins = [1, 2]`, `amount = 0` | Boundary corner case | Returns 0 for MinCoins; 1 for Combinations. |
| **Permutation Overflow** | `coins = [1, 2]`, `amount = 100` | Number of permutations exceeds $2^{31} - 1$ | Saturating addition: `dp[a] = int.MaxValue` prevents wrap-around. |

---

## 4. DEMONSTRATE: Visual State Transitions & Loop Ordering Traces

### 4.1 Step-by-Step Trace of Coin Change I ([LC 322])

Let `coins = [1, 2, 5]` and `amount = 11`.
Sentinel: $\infty = 11 + 1 = 12$.
Initial Array:
`dp = [0, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12]`

```
After Coin 1 (Forward Sweep a = 1 to 11):
  dp[a] = min(dp[a], dp[a - 1] + 1)
  dp = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ]

After Coin 2 (Forward Sweep a = 2 to 11):
  a=2: min(2, dp[0] + 1) = 1
  a=3: min(3, dp[1] + 1) = 2
  a=4: min(4, dp[2] + 1) = 2
  a=5: min(5, dp[3] + 1) = 3
  ...
  dp = [ 0, 1, 1, 2, 2, 3, 3, 4, 4, 5,  5,  6 ]

After Coin 5 (Forward Sweep a = 5 to 11):
  a=5: min(3, dp[0] + 1) = 1
  a=6: min(3, dp[1] + 1) = 2
  a=10: min(5, dp[5] + 1) = 2
  a=11: min(6, dp[6] + 1) = 2 + 1 = 3   <-- OPTIMAL: 3 COINS (5 + 5 + 1)
  dp = [ 0, 1, 1, 2, 2, 1, 2, 2, 3, 3,  2,  3 ]

Result: 3 coins.
```

---

### 4.2 Side-by-Side Trace: Combinations vs. Permutations

Let `coins = [1, 2]` and `amount = 3`.

```
================================================================================
  CASE 1: COMBINATIONS (Outer = Coins, Inner = Amount)
================================================================================
  Initial: dp = [ 1, 0, 0, 0 ]

  Process Coin 1 (a = 1 to 3):
    a = 1: dp[1] += dp[0] => 1
    a = 2: dp[2] += dp[1] => 1
    a = 3: dp[3] += dp[2] => 1
    dp = [ 1, 1, 1, 1 ]   (Every amount has exactly 1 combination of 1's)

  Process Coin 2 (a = 2 to 3):
    a = 2: dp[2] += dp[0] => 1 + 1 = 2   (Combinations for 2: {1,1} and {2})
    a = 3: dp[3] += dp[1] => 1 + 1 = 2   (Combinations for 3: {1,1,1} and {1,2})
    dp = [ 1, 1, 2, 2 ]

  FINAL COMBINATIONS COUNT = 2  ({1, 1, 1} and {1, 2})
```

```
================================================================================
  CASE 2: PERMUTATIONS (Outer = Amount, Inner = Coins)
================================================================================
  Initial: dp = [ 1, 0, 0, 0 ]

  Amount a = 1:
    coin 1: dp[1] += dp[0] => 1
    dp[1] = 1   (Sequences: (1))

  Amount a = 2:
    coin 1: dp[2] += dp[1] => 1
    coin 2: dp[2] += dp[0] => 1 + 1 = 2
    dp[2] = 2   (Sequences: (1, 1), (2))

  Amount a = 3:
    coin 1: dp[3] += dp[2] => 2   (Sequences ending in 1: (1, 1, 1), (2, 1))
    coin 2: dp[3] += dp[1] => 2 + 1 = 3 (Sequences ending in 2: (1, 2))
    dp[3] = 3   (Sequences: (1, 1, 1), (2, 1), (1, 2))

  FINAL PERMUTATIONS COUNT = 3  ((1, 1, 1), (1, 2), (2, 1))
```

---

## 5. PRACTICE: Canonical Unbounded Knapsack Problems & Variations

### 5.1 [LeetCode 322] Coin Change (Medium)

```csharp
public class Solution
{
    public int CoinChange(int[] coins, int amount)
    {
        if (amount == 0) return 0;

        int sentinel = amount + 1;
        int[] dp = new int[amount + 1];
        Array.Fill(dp, sentinel);
        dp[0] = 0;

        foreach (int coin in coins)
        {
            for (int a = coin; a <= amount; a++)
            {
                dp[a] = Math.Min(dp[a], dp[a - coin] + 1);
            }
        }

        return dp[amount] > amount ? -1 : dp[amount];
    }
}
```

- **Time Complexity:** $O(N \cdot A)$ where $N = \text{coins.Length}, A = \text{amount}$.
- **Space Complexity:** $O(A)$ auxiliary 1D array.

---

### 5.2 [LeetCode 518] Coin Change II (Medium)

```csharp
public class Solution
{
    public int Change(int amount, int[] coins)
    {
        int[] dp = new int[amount + 1];
        dp[0] = 1;

        // Outer Coins -> Combinations
        foreach (int coin in coins)
        {
            for (int a = coin; a <= amount; a++)
            {
                dp[a] += dp[a - coin];
            }
        }

        return dp[amount];
    }
}
```

- **Time Complexity:** $O(N \cdot A)$.
- **Space Complexity:** $O(A)$.

---

### 5.3 [LeetCode 377] Combination Sum IV (Medium)

```csharp
public class Solution
{
    public int CombinationSum4(int[] nums, int target)
    {
        int[] dp = new int[target + 1];
        dp[0] = 1;

        // Outer Target -> Permutations
        for (int a = 1; a <= target; a++)
        {
            foreach (int num in nums)
            {
                if (a >= num)
                {
                    // Guard against 32-bit signed overflow
                    if (int.MaxValue - dp[a - num] >= dp[a])
                    {
                        dp[a] += dp[a - num];
                    }
                }
            }
        }

        return dp[target];
    }
}
```

- **Time Complexity:** $O(N \cdot \text{target})$.
- **Space Complexity:** $O(\text{target})$.

---

## 6. CONNECT: ATM Currency Dispenser Architecture & Network MTU Packet Sizing

### 6.1 ATM Cash Dispensing Architecture

In banking automation (e.g., Diebold Nixdorf, NCR ATMs), cash machines hold multiple currency cassettes containing fixed denominations (e.g., $\$100, \$50, \$20, \$10$).

```
                    ATM Note Cassette Routing Architecture
                    
        User Requests Withdrawal: $280
        
        Cassette 1: $100 notes (Available: 10)
        Cassette 2:  $50 notes (Available: 0 - DEPLETED!)
        Cassette 3:  $20 notes (Available: 50)
        Cassette 4:  $10 notes (Available: 100)
        
        Greedy Dispatcher: 2 x $100 ($200) -> Cannot use $50 -> 4 x $20 ($80)
        Notes Dispensed: 2 x $100 + 4 x $20 = 6 notes.
```

#### Why Production ATMs Use Dynamic Programming
1. **Cassette Depletion (Non-Canonical Transitions):** If the $\$50$ cassette is depleted, the available coin system changes from $\{10, 20, 50, 100\}$ to $\{10, 20, 100\}$. While the full US currency set is canonical, arbitrary depleted subsets can become non-canonical, where greedy dispensing fails to fulfill valid withdrawals.
2. **Minimizing Mechanical Wear:** ATMs solve a dual-objective DP: minimize total note count (to prevent note jams) subject to cassette inventory limits (Bounded Knapsack).

---

### 6.2 Network MTU Packet Fragmentation

In networking protocols (IPv4 / IPv6, WireGuard, IPsec):
- An application produces a continuous payload stream of size $S$.
- Network hops have distinct **Maximum Transmission Units (MTUs)** (e.g., Ethernet 1500 bytes, PPPoE 1492 bytes, VPN tunnels 1360 bytes).
- Router fragmentation engines solve an Unbounded Knapsack problem to partition data packets into allowed chunk sizes that minimize header overhead and prevent TCP packet fragmentation retransmissions.

---

## 7. CHECKPOINT: Comprehensive Self-Assessment & Mastery Key

### 7.1 Diagnostic Mastery Audit (10 Staff-Level Questions)

```
[Q1] Prove by induction why the capacity loop must be traversed in ascending order 
     (w = w_i up to W) for the 1D space-optimized Unbounded Knapsack problem.

[Q2] What is the exact mathematical difference between the 2D recurrence of 0-1 Knapsack 
     and Unbounded Knapsack? Highlight the row indices.

[Q3] State the Combinations vs. Permutations Loop Ordering Theorem and explain why 
     reversing the nested loop order shifts the solution space between LC 518 and LC 377.

[Q4] In Coin Change I (LC 322), why is initializing the DP array with int.MaxValue 
     considered a dangerous bug in C#? What sentinel should be used instead?

[Q5] What is a "canonical coin system"? Give a concrete counterexample of a 
     non-canonical system where the greedy algorithm fails to find minimum coins.

[Q6] State the Chicken McNugget Theorem (Frobenius Coin Problem) for two coprime 
     denominations a and b. What is the largest unreachable integer amount?

[Q7] In Coin Change II, what would happen if dp[0] were initialized to 0 instead of 1?

[Q8] Why does the forward sweep (ascending traversal) exhibit superior CPU cache 
     performance compared to the backward sweep (descending traversal)?

[Q9] In Combination Sum IV (LC 377), why can the answer overflow 32-bit signed integers 
     even when target is moderately small (e.g., target = 50)?

[Q10] Can the Unbounded Knapsack problem be solved in O(W) time if all item weights 
      and values are known? What is the asymptotic lower bound?
```

---

### 7.2 Exhaustive Mastery Key & Mathematical Derivations

#### [A1] Inductive Proof of Forward Sweep Invariant
In a 1D array, `dp[w] = max(dp[w], dp[w - w_i] + v_i)`. When looping ascending ($w = w_i \to W$), for any $w$, the value at index $w - w_i$ is strictly smaller than $w$. Because the loop moves upward, index $w - w_i$ has ALREADY been updated during item $i$'s current pass. Therefore, $\text{dp}[w - w_i]$ reflects $\text{dp}_i[w - w_i]$ (which already contains zero or more copies of item $i$). Adding $v_i$ to $\text{dp}_i[w - w_i]$ naturally models selecting item $i$ an unbounded number of times.

#### [A2] 2D Recurrence Comparison
- **0-1 Knapsack:** $\text{dp}[i][w] = \max(\text{dp}[i-1][w], \mathbf{dp[i-1][w - w_i]} + v_i)$. Second term references row $i-1$ (item $i$ cannot be picked again).
- **Unbounded Knapsack:** $\text{dp}[i][w] = \max(\text{dp}[i-1][w], \mathbf{dp[i][w - w_i]} + v_i)$. Second term references row $i$ (item $i$ can be picked repeatedly).

#### [A3] Combinations vs. Permutations Proof
- **Outer Coins:** Denominations are introduced sequentially. Once coin $k$ is active, coins $1 \dots k-1$ cannot be chosen anymore, forcing all generated coin multisets to appear in strictly sorted order ($idx_1 \le idx_2 \le \dots$). This counts each unique subset once (**Combinations**).
- **Outer Amount:** At every amount $a$, all coins are tested as potential terminal steps. An ordered sequence ending in coin 1 transitions from $a - c_1$, while a sequence ending in coin 2 transitions from $a - c_2$. Both sequences are recorded as distinct paths, counting all ordered arrangements (**Permutations**).

#### [A4] Sentinel Guard Overflow
If $\text{dp}$ is initialized with `int.MaxValue`, evaluating $\text{dp}[a - c] + 1$ produces `int.MaxValue + 1 = -2147483648` (32-bit signed integer overflow). In `Math.Min(dp[a], dp[a - c] + 1)`, the negative overflowed number will be erroneously selected as the minimum! The correct sentinel is `amount + 1`, which can safely have 1 added to it without overflowing.

#### [A5] Canonical Coin System & Counterexample
A coin system is canonical if the greedy choice (always picking the largest coin $\le$ remaining amount) always yields the minimal coin count.
**Counterexample:** Coins = $\{1, 3, 4\}$, Amount = $6$.
- Greedy algorithm: picks 4, remaining 2; picks 1, remaining 1; picks 1. Total: $4 + 1 + 1 = \mathbf{3\text{ coins}}$.
- Optimal DP: picks $3 + 3 = \mathbf{2\text{ coins}}$.
The system $\{1, 3, 4\}$ is non-canonical.

#### [A6] Chicken McNugget Theorem (Frobenius Coin Problem)
For two coprime positive integers $a$ and $b$ ($\gcd(a, b) = 1$), the largest integer amount that **cannot** be expressed as a non-negative linear combination $x \cdot a + y \cdot b$ ($x, y \ge 0$) is:
$$g(a, b) = a \cdot b - a - b$$
Every integer strictly greater than $a \cdot b - a - b$ is guaranteed to be reachable!

#### [A7] Base Case $\text{dp}[0] = 0$ Pathology
If $\text{dp}[0] = 0$ in Coin Change II, the additive recurrence $\text{dp}[a] += \text{dp}[a - c]$ will add 0 at the base transition. Because all initial cells would be 0, zero would propagate across all amounts, erroneously returning 0 combinations for every query.

#### [A8] Cache Performance of Forward vs. Backward Sweeps
In forward sweeps ($a = c \to \text{amount}$), memory addresses increment sequentially ($\text{addr}, \text{addr}+4, \text{addr}+8$). The hardware Spatial Prefetcher detects this positive stride-1 pattern and prefetches adjacent cache lines into L1 cache before the CPU requests them. In backward sweeps, memory is traversed in reverse, which can cause prefetcher latency penalties on older or simpler CPU microarchitectures.

#### [A9] Permutation Combinatorial Explosion
In Combination Sum IV, counting permutations of small numbers can grow exponentially:
For `nums = [1, 2]`, the recurrence is $\text{dp}[a] = \text{dp}[a-1] + \text{dp}[a-2]$, which is the Fibonacci sequence!
Because $\text{Fib}(50) \approx 1.25 \times 10^{10} > 2^{31} - 1$, 32-bit signed integers overflow rapidly.

#### [A10] Complexity Lower Bound
The Unbounded Knapsack problem is weakly NP-complete. It cannot be solved in $O(W)$ time in the general case unless $P = NP$. The standard dynamic programming time complexity is $\Theta(N \cdot W)$, which is pseudo-polynomial. When $W$ is large, algorithms such as Bounded DP or branch-and-bound are required.
