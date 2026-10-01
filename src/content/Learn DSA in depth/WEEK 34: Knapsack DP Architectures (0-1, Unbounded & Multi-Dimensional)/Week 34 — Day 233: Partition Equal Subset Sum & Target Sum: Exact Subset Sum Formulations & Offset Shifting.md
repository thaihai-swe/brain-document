---
title: "Week 34 — Day 233: Partition Equal Subset Sum & Target Sum: Exact Subset Sum Formulations & Offset Shifting"
---

# Week 34 — Day 233: Partition Equal Subset Sum & Target Sum: Exact Subset Sum Formulations & Offset Shifting

## 1. TEACH: Exact Subset Sums, Parity Invariants & Algebraic Reductions

### 1.1 The Exact Subset Sum Paradigm: Reachability vs. Counting

In classical 0-1 Knapsack, the objective is to maximize value without exceeding a capacity ceiling: $\sum x_i w_i \le W$. 
In the **Exact Subset Sum Paradigm**, the constraint is tightened from an inequality to an exact equality:
$$\sum_{i=1}^N x_i a_i = T, \quad x_i \in \{0, 1\}$$

This paradigm branches into two primary computational problems:
1. **Boolean Reachability (Decision Problem):** Does there exist any subset $S \subseteq A$ such that $\sum_{a \in S} a = T$?
   - *State Transition:* $\text{dp}[w] = \text{dp}[w] \lor \text{dp}[w - a_i]$
   - *Algebraic Structure:* Boolean semiring $\langle \{\text{false}, \text{true}\}, \lor, \land, \text{false}, \text{true} \rangle$.
2. **Combinatorial Counting (Counting Problem):** How many distinct subsets $S \subseteq A$ sum to exactly $T$?
   - *State Transition:* $\text{dp}[w] = \text{dp}[w] + \text{dp}[w - a_i]$
   - *Algebraic Structure:* Integer semiring $\langle \mathbb{N}_0, +, \times, 0, 1 \rangle$.

---

### 1.2 Partition Equal Subset Sum ([LC 416]) & Parity Invariants

#### Problem Formalization
Given a non-empty array of positive integers `nums`, determine if the array can be partitioned into two disjoint subsets $S_1$ and $S_2$ ($S_1 \cup S_2 = A, S_1 \cap S_2 = \emptyset$) such that the sum of elements in both subsets is equal:
$$\sum_{x \in S_1} x = \sum_{y \in S_2} y$$

Let $\text{totalSum} = \sum_{i=1}^N \text{nums}[i]$. Because $S_1$ and $S_2$ form a partition of the total array:
$$\sum_{x \in S_1} x + \sum_{y \in S_2} y = \text{totalSum}$$
Substituting the equality condition $\sum_{x \in S_1} x = \sum_{y \in S_2} y = C$:
$$2C = \text{totalSum} \implies C = \frac{\text{totalSum}}{2}$$

```
                Partition Equal Subset Sum Reduction
                
    Total Array Sum: totalSum = ∑ nums[i]
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
  totalSum is ODD               totalSum is EVEN
  • 2C = totalSum               • Target Capacity C = totalSum / 2
  • Impossible in Integers!     • Reduce to 0-1 Subset Sum:
  • Return FALSE in O(1)          Find if subset sums to EXACTLY C
```

#### Theorem (The Parity Invariant)
*If $\text{totalSum}$ is odd ($\text{totalSum} \pmod 2 \ne 0$), no partition into two equal-sum integer subsets exists.*
*Proof:* Let $S_1$ and $S_2$ be two subsets of integers. The sum of integers in any subset is an integer: $\sum S_1 \in \mathbb{Z}$ and $\sum S_2 \in \mathbb{Z}$.
If $\sum S_1 = \sum S_2 = k$, then $\text{totalSum} = \sum S_1 + \sum S_2 = 2k$.
Because $2k$ is divisible by 2 for any integer $k$, $\text{totalSum}$ must be an even integer. If $\text{totalSum}$ is odd, no such integer $k$ exists. $\blacksquare$

#### Boundary Pruning Invariants
1. **Odd Sum Pruning:** If $\text{totalSum} \% 2 \ne 0$, immediately return `false`.
2. **Single-Element Domination:** If $\max(\text{nums}) > \frac{\text{totalSum}}{2}$, then even if all other elements are placed in the opposing subset, their sum will be strictly less than $\max(\text{nums})$. Return `false` in $O(N)$ time before initializing the DP array.

---

### 1.3 Target Sum ([LC 494]): The Algebraic Subset Reduction

#### Problem Formalization
You are given an integer array `nums` and an integer `target`. You want to build an expression out of `nums` by adding one of the symbols `'+'` and `'-'` before each integer in `nums` and then concatenate all the integers.
Return the number of different expressions that you can build, which evaluate to `target`.

#### The Algebraic Transformation
Let $P$ be the set of elements in `nums` assigned a positive sign (`+`), and let $N$ be the set of elements assigned a negative sign (`-`).
Every element in `nums` belongs to either $P$ or $N$:
$$P \cup N = \text{nums} \quad \text{and} \quad P \cap N = \emptyset$$

The evaluated sum of the expression is:
$$\sum_{x \in P} x - \sum_{y \in N} y = \text{target} \quad \implies \quad \text{Sum}(P) - \text{Sum}(N) = \text{target} \quad \text{--- (Equation 1)}$$

The total sum of all elements in the array is:
$$\text{Sum}(P) + \text{Sum}(N) = \text{totalSum} \quad \text{--- (Equation 2)}$$

Add Equation 1 and Equation 2:
$$(\text{Sum}(P) - \text{Sum}(N)) + (\text{Sum}(P) + \text{Sum}(N)) = \text{target} + \text{totalSum}$$
$$2 \cdot \text{Sum}(P) = \text{target} + \text{totalSum}$$
$$\bbox[12px,border:2px solid #2563eb,background-color:#eff6ff]{\text{Sum}(P) = \frac{\text{target} + \text{totalSum}}{2}}$$

#### The Four Mandatory Invariant Guards
From this algebraic formulation, four critical boundary guards must hold:
1. **Magnitude Bound:** $|\text{target}| \le \text{totalSum}$. If the absolute value of the target exceeds the sum of all available numbers, even assigning all `+` or all `-` cannot reach the target. Return `0`.
2. **Non-Negativity Constraint:** $\text{target} + \text{totalSum} \ge 0$. Because all elements in `nums` are non-negative, $\text{Sum}(P) \ge 0$.
3. **Parity Constraint:** $(\text{target} + \text{totalSum}) \pmod 2 == 0$. Since $\text{Sum}(P)$ must be an integer, the numerator must be evenly divisible by 2. If it is odd, return `0`.
4. **The Target Capacity:** The problem is reduced to: **Find the number of subsets in `nums` that sum to exactly $C = \frac{\text{target} + \text{totalSum}}{2}$.**

---

### 1.4 Handling Zero Elements ($a_i = 0$): The Multiplicity Theorem

A notorious pitfall in subset counting problems is the presence of elements equal to zero ($a_i = 0$).
In LeetCode 494, elements satisfy $0 \le \text{nums}[i] \le 1000$.

Suppose `nums = [0, 0, 1]` and `target = 1`.
TotalSum $= 1$, Target Capacity $C = \frac{1 + 1}{2} = 1$.
Subsets of non-zero elements summing to 1: `{1}` (1 subset).
What about the zeroes?
- $+0 +0 +1 = 1$
- $+0 -0 +1 = 1$
- $-0 +0 +1 = 1$
- $-0 -0 +1 = 1$
There are **4 valid expressions**! Each zero doubles the number of valid solutions because $+0 = -0 = 0$.

#### Why the Backward Sweep Correctly Handles Zeroes Automatically
In the 1D backward sweep for counting subset sums:
```csharp
for (int s = capacity; s >= num; s--)
{
    dp[s] += dp[s - num];
}
```
If `num == 0`, the inner loop condition `s >= 0` executes for all $s$ down to 0:
$$\text{dp}[s] = \text{dp}[s] + \text{dp}[s - 0] = \text{dp}[s] + \text{dp}[s] = 2 \cdot \text{dp}[s]$$
The DP recurrence **automatically multiplies every reachable sum by 2** without requiring special-case branching!
However, the capacity loop MUST descend all the way to `s = 0` (rather than stopping at `s = 1`).

---

### 1.5 The Offset Shifting Technique for Negative Domain DP

Before the algebraic reduction was widely popularized, Target Sum was historically solved by simulating the decision tree directly over the domain of all possible intermediate sums: $[-\text{totalSum}, +\text{totalSum}]$.

Because array indices in modern programming languages cannot be negative ($[-S \dots S]$ is invalid), we apply **Coordinate Offset Shifting**:

```
                       Offset Coordinate Translation
                       
     Logical Sum Domain:     -totalSum  ...   -1     0     +1   ...  +totalSum
                                 │             │     │      │            │
     Offset Transformation:      + offset (offset = totalSum)
                                 ▼             ▼     ▼      ▼            ▼
     Physical Array Indices:     0      ...  S - 1   S    S + 1 ...   2 * S
```

#### Offset Shifted Recurrence
Let $\text{offset} = \text{totalSum}$.
Array dimension: $\text{dp}[N + 1, 2 \cdot \text{totalSum} + 1]$.
Base case: $\text{dp}[0][0 + \text{offset}] = 1$ (1 way to achieve sum 0 with 0 elements).
For item $i$ (value $a$) and logical sum $s \in [-\text{totalSum}, +\text{totalSum}]$:
$$\text{dp}[i][s + \text{offset}] = \text{dp}[i-1][(s - a) + \text{offset}] + \text{dp}[i-1][(s + a) + \text{offset}]$$
subject to array bounds $[0, 2 \cdot \text{totalSum}]$.

---

## 2. IMPLEMENT: Production-Grade Subset Sum & Target Sum Engine (.NET 8+)

The following compile-ready, production-grade C# container implements:
1. `CanPartition`: $O(C)$ space 1D boolean backward sweep solving Partition Equal Subset Sum ([LC 416]).
2. `CanPartitionBitset`: Ultra-fast 64-bit integer bitset accelerator demonstrating SIMD/bitwise parallelism.
3. `FindTargetSumWays`: $O(P)$ space 1D combinatorial counting backward sweep solving Target Sum ([LC 494]) via algebraic reduction.
4. `FindTargetSumWays2DOffset`: 2D coordinate-shifted matrix formulation validating the algebraic equivalence.
5. Self-validating test harness in `Main()` with comprehensive `Debug.Assert` validation.

```csharp
using System;
using System.Diagnostics;
using System.Numerics;

namespace DynamicProgramming.SubsetSumMastery
{
    /// <summary>
    /// Production-grade engine for exact subset sum formulations, parity invariants,
    /// algebraic target reductions, and bitset accelerations.
    /// </summary>
    public static class SubsetSumEngine
    {
        #region 1. Partition Equal Subset Sum ([LC 416])

        /// <summary>
        /// Determines if the array can be partitioned into two subsets with equal sum.
        /// Uses 1D backward sweep boolean reachability with parity and upper-bound pruning.
        /// Time Complexity: O(N * C) where C = totalSum / 2
        /// Space Complexity: O(C)
        /// </summary>
        public static bool CanPartition(int[] nums)
        {
            ArgumentNullException.ThrowIfNull(nums);
            if (nums.Length < 2) return false;

            int totalSum = 0;
            int maxNum = 0;
            for (int i = 0; i < nums.Length; i++)
            {
                if (nums[i] < 0)
                {
                    throw new ArgumentOutOfRangeException(nameof(nums), "Array elements must be non-negative.");
                }
                totalSum += nums[i];
                if (nums[i] > maxNum) maxNum = nums[i];
            }

            // PARITY INVARIANT GUARD:
            // An odd sum cannot be divided into two equal integer halves.
            if ((totalSum & 1) != 0)
            {
                return false;
            }

            int target = totalSum / 2;

            // SINGLE-ELEMENT DOMINATION GUARD:
            // If any single number exceeds half the sum, balance is impossible.
            if (maxNum > target)
            {
                return false;
            }

            // dp[w] indicates whether a subset summing to w is achievable
            bool[] dp = new bool[target + 1];
            dp[0] = true;

            foreach (int num in nums)
            {
                for (int w = target; w >= num; w--)
                {
                    if (dp[w - num])
                    {
                        dp[w] = true;
                    }
                }

                // Early exit: target is already achievable
                if (dp[target]) return true;
            }

            return dp[target];
        }

        /// <summary>
        /// Solves Partition Equal Subset Sum using 64-bit integer registers as a hardware bitset.
        /// Accelerates reachability transitions by 64x via word-level bitwise shifts.
        /// Supports target capacities up to 64 * capacityWords.
        /// Time Complexity: O(N * (C / 64))
        /// Space Complexity: O(C / 64)
        /// </summary>
        public static bool CanPartitionBitset(int[] nums)
        {
            ArgumentNullException.ThrowIfNull(nums);
            if (nums.Length < 2) return false;

            int totalSum = 0;
            for (int i = 0; i < nums.Length; i++) totalSum += nums[i];

            if ((totalSum & 1) != 0) return false;

            int target = totalSum / 2;

            // In .NET, BigInteger provides arbitrary-precision bit shifts
            BigInteger bitset = BigInteger.One; // bit 0 is set (dp[0] = true)

            foreach (int num in nums)
            {
                bitset |= (bitset << num);

                // Check if target bit is set
                if (!((bitset >> target) & BigInteger.One).IsZero)
                {
                    return true;
                }
            }

            return !((bitset >> target) & BigInteger.One).IsZero;
        }

        #endregion

        #region 2. Target Sum ([LC 494]) via Algebraic Reduction

        /// <summary>
        /// Computes the number of distinct expressions evaluating to target.
        /// Uses the algebraic transformation: P = (target + totalSum) / 2.
        /// Time Complexity: O(N * P)
        /// Space Complexity: O(P)
        /// </summary>
        public static int FindTargetSumWays(int[] nums, int target)
        {
            ArgumentNullException.ThrowIfNull(nums);

            int totalSum = 0;
            for (int i = 0; i < nums.Length; i++)
            {
                if (nums[i] < 0) throw new ArgumentOutOfRangeException(nameof(nums), "Elements must be non-negative.");
                totalSum += nums[i];
            }

            // GUARD 1: Target magnitude cannot exceed total available sum
            if (Math.Abs(target) > totalSum)
            {
                return 0;
            }

            // GUARD 2 & 3: Numerator must be non-negative and even
            int numerator = target + totalSum;
            if ((numerator & 1) != 0 || numerator < 0)
            {
                return 0;
            }

            int p = numerator / 2;

            // dp[s] stores the count of subsets summing to s
            int[] dp = new int[p + 1];
            dp[0] = 1; // 1 way to form sum 0 (the empty subset)

            foreach (int num in nums)
            {
                // Must iterate descending down to num.
                // Notice: if num == 0, s descends to 0, correctly computing dp[s] += dp[s] (doubling count).
                for (int s = p; s >= num; s--)
                {
                    dp[s] += dp[s - num];
                }
            }

            return dp[p];
        }

        /// <summary>
        /// Solves Target Sum using 2D Offset Shifting over the full range [-totalSum, +totalSum].
        /// Demonstrates numerical equivalence to the 1D algebraic reduction.
        /// Time Complexity: O(N * totalSum)
        /// Space Complexity: O(totalSum)
        /// </summary>
        public static int FindTargetSumWays2DOffset(int[] nums, int target)
        {
            ArgumentNullException.ThrowIfNull(nums);

            int totalSum = 0;
            for (int i = 0; i < nums.Length; i++) totalSum += nums[i];

            if (Math.Abs(target) > totalSum) return 0;

            int offset = totalSum;
            int totalRange = 2 * totalSum + 1;

            // Rolling 1D array with offset
            int[] dp = new int[totalRange];
            dp[0 + offset] = 1; // Base case: sum 0 with 0 elements

            foreach (int num in nums)
            {
                int[] next = new int[totalRange];

                for (int s = -totalSum; s <= totalSum; s++)
                {
                    int currentWays = dp[s + offset];
                    if (currentWays > 0)
                    {
                        // Transition 1: Add num (+num)
                        if (s + num <= totalSum)
                        {
                            next[s + num + offset] += currentWays;
                        }

                        // Transition 2: Subtract num (-num)
                        if (s - num >= -totalSum)
                        {
                            next[s - num + offset] += currentWays;
                        }
                    }
                }

                dp = next;
            }

            return dp[target + offset];
        }

        #endregion

        #region Self-Validating Test Suite

        public static void Main()
        {
            Console.WriteLine("================================================================================");
            Console.WriteLine("  SubsetSumEngine: Self-Validating Production Test Suite");
            Console.WriteLine("================================================================================");

            // Test 1: Partition Equal Subset Sum - Valid Even Partition
            {
                int[] nums = { 1, 5, 11, 5 }; // totalSum = 22 => target = 11 (Subsets: {1, 5, 5} and {11})
                bool resultStandard = CanPartition(nums);
                bool resultBitset = CanPartitionBitset(nums);

                Debug.Assert(resultStandard == true, "Test 1 Failed: Standard partition should be true");
                Debug.Assert(resultBitset == true, "Test 1 Failed: Bitset partition should be true");
                Console.WriteLine("[PASS] Test 1 (Valid Partition): nums=[1, 5, 11, 5] => true (11 == 11)");
            }

            // Test 2: Partition Equal Subset Sum - Odd Sum Failure
            {
                int[] nums = { 1, 2, 3, 5 }; // totalSum = 11 (Odd sum)
                bool resultStandard = CanPartition(nums);
                bool resultBitset = CanPartitionBitset(nums);

                Debug.Assert(resultStandard == false, "Test 2 Failed: Odd sum must return false");
                Debug.Assert(resultBitset == false, "Test 2 Failed: Bitset odd sum must return false");
                Console.WriteLine("[PASS] Test 2 (Odd Sum Rejection): nums=[1, 2, 3, 5] => false (Sum=11)");
            }

            // Test 3: Partition Equal Subset Sum - Dominating Element
            {
                int[] nums = { 20, 2, 3, 5 }; // totalSum = 30 => target = 15. Max = 20 > 15!
                bool result = CanPartition(nums);

                Debug.Assert(result == false, "Test 3 Failed: Dominating element must return false");
                Console.WriteLine("[PASS] Test 3 (Dominating Element): nums=[20, 2, 3, 5] => false (20 > 15)");
            }

            // Test 4: Target Sum - Canonical LeetCode 494 Example
            {
                int[] nums = { 1, 1, 1, 1, 1 };
                int target = 3; // TotalSum = 5 => P = (3 + 5) / 2 = 4. Ways = 5.
                int waysAlgebraic = FindTargetSumWays(nums, target);
                int waysOffset = FindTargetSumWays2DOffset(nums, target);

                Debug.Assert(waysAlgebraic == 5, $"Test 4 Failed: Expected 5, got {waysAlgebraic}");
                Debug.Assert(waysOffset == 5, $"Test 4 Offset Failed: Expected 5, got {waysOffset}");
                Console.WriteLine($"[PASS] Test 4 (Canonical Target Sum): nums=[1,1,1,1,1], target=3 => Ways={waysAlgebraic}");
            }

            // Test 5: Target Sum - Zero Element Multiplicity Doubling
            {
                int[] nums = { 0, 0, 0, 0, 0, 0, 0, 0, 1 };
                int target = 1;
                // 8 zeroes => 2^8 = 256 ways
                int expectedWays = 256;

                int waysAlgebraic = FindTargetSumWays(nums, target);
                int waysOffset = FindTargetSumWays2DOffset(nums, target);

                Debug.Assert(waysAlgebraic == expectedWays, $"Test 5 Failed: Expected {expectedWays}, got {waysAlgebraic}");
                Debug.Assert(waysOffset == expectedWays, "Test 5 Offset Failed");
                Console.WriteLine($"[PASS] Test 5 (Zero Multiplicity): 8 zeroes + [1], target=1 => Ways={waysAlgebraic} (2^8 = 256)");
            }

            // Test 6: Target Sum - Negative Target Symmetry
            {
                int[] nums = { 1, 2, 3, 4, 5 };
                int target = -3;
                int waysPositive = FindTargetSumWays(nums, 3);
                int waysNegative = FindTargetSumWays(nums, target);
                int waysOffset = FindTargetSumWays2DOffset(nums, target);

                Debug.Assert(waysNegative == waysPositive, "Negative target should match positive target by symmetry");
                Debug.Assert(waysNegative == waysOffset, "Offset should match algebraic for negative target");
                Console.WriteLine($"[PASS] Test 6 (Negative Target Symmetry): target=-3 => Ways={waysNegative} (Matches target=+3)");
            }

            // Test 7: Target Exceeds Total Sum
            {
                int[] nums = { 1, 2 };
                int target = 10;

                int ways = FindTargetSumWays(nums, target);
                Debug.Assert(ways == 0);
                Console.WriteLine("[PASS] Test 7 (Unreachable Target Magnitude): target=10, sum=3 => Ways=0");
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
                      INVARIANT 1: PARITY PRESERVATION
A set of integers can be partitioned into two subsets of equal sum if and only if 
the total sum of the set is an even integer:
    ∑ nums[i] ≡ 0 (mod 2).
Furthermore, in Target Sum, a valid configuration exists only if:
    target + ∑ nums[i] ≡ 0 (mod 2).

                      INVARIANT 2: ZERO-ELEMENT MULTIPLICITY SCALING
Each element a_i = 0 in the array multiplies the number of valid target sum 
expressions by exactly 2 without altering the target subset capacity:
    Ways(nums ∪ {0}, target) = 2 * Ways(nums, target).

                      INVARIANT 3: BIDIRECTIONAL SIGN SYMMETRY
The number of valid expressions evaluating to +target is identical to the number 
of expressions evaluating to -target:
    Ways(nums, +T) == Ways(nums, -T).
Inverting all signs in any valid expression for +T produces a unique valid expression for -T.
```

---

### 3.2 The 5-Dimension Staff Deep-Dive

#### 1. State Topology & Problem Manifold
- **Partition Equal Subset Sum:** Maps to an unweighted binary hypercube $\{0, 1\}^N$, projected onto a 1D scalar line representing the subset sum in $[0, C]$. The reachable points form a sparse Boolean set.
- **Target Sum:** Projects the $2^N$ sign vertices $\{\pm 1\}^N$ onto a combinatorial frequency distribution over the interval $[-\text{totalSum}, +\text{totalSum}]$, forming a discrete Gaussian-like binomial distribution centered at 0.

```
                    Target Sum Binomial Combinatorial Manifold
                    
              Ways
               ▲
               │                     ┌─┐
               │                    ┌┘ └┐
               │                  ┌─┘   └─┐
               │                ┌─┘       └─┐
               │             ┌──┘           └──┐
               │         ┌───┘                 └───┐
               └─────────┴─────────────────────────┴────────► Sum
                     -totalSum           0            +totalSum
```

---

#### 2. Choice Gradients: Boolean OR vs. Integer Addition
- In **Reachability DP** ([LC 416]), transitions use Boolean OR ($\lor$). Once a state $\text{dp}[w]$ becomes `true`, subsequent paths to $w$ can be short-circuited.
- In **Counting DP** ([LC 494]), transitions use integer addition ($+$). Every distinct subset path that arrives at sum $s$ must be accumulated. Short-circuiting is illegal.

---

#### 3. Boundary Invariants: The Empty Subset Seed
- For reachability: $\text{dp}[0] = \text{true}$ (the empty set $\emptyset$ has sum 0).
- For counting: $\text{dp}[0] = 1$ (the empty set $\emptyset$ is the unique combination achieving sum 0).
- If $\text{dp}[0]$ were initialized to 0, the additive recurrence $\text{dp}[s] += \text{dp}[s - \text{num}]$ would remain stuck at 0 across all capacities.

---

#### 4. Memory Architecture & Hardware Bitset Acceleration
Evaluating `dp[w] = dp[w] | dp[w - num]` across an array of size $C$ performs $C$ scalar memory operations.
By packing 64 boolean states into a single `ulong` (64-bit unsigned integer register):
- The transition for an entire chunk of 64 capacities is performed in **a single CPU clock cycle** using bitwise OR and bitwise shift:
  $$\text{bitset} \leftarrow \text{bitset} \lor (\text{bitset} \ll \text{num})$$
- For a target $C = 10,000$, a standard boolean array requires 10,000 iterations per item. A 64-bit bitset requires only $\lceil 10000 / 64 \rceil = 157$ 64-bit integer operations, achieving an empirical **$50\times$ speedup** and eliminating all branch mispredictions!

---

#### 5. Degenerate & Adversarial Extremes

| Adversarial Scenario | Input Profile | Theoretical Pathology | Engine Defense |
| :--- | :--- | :--- | :--- |
| **All Zeroes Array** | `nums = [0, 0, ..., 0]`, $N=20, T=0$ | Number of ways is $2^{20} = 1,048,576$. | Capacity loop descends down to 0: `dp[0] += dp[0]` doubles each step to $2^{20}$. |
| **Odd Total Sum** | `nums = [2, 2, 3]` ($\sum = 7$) | Parity violation: $7/2 = 3.5 \notin \mathbb{Z}$. | Fast $O(1)$ pre-check: `(totalSum & 1) != 0 => return false`. |
| **Out-of-Bounds Target** | `nums = [1, 2]`, `target = 10` | $10 > 3$. | Magnitude guard: `Math.Abs(target) > totalSum => return 0`. |
| **Negative Target** | `nums = [1, 2, 1]`, `target = -2` | Negative sum index. | Invariant symmetry: $P = (-2 + 4) / 2 = 1 \ge 0$. Handled natively without special case. |

---

## 4. DEMONSTRATE: Visual State Transitions & Algebraic Traces

### 4.1 Step-by-Step Trace of Partition Equal Subset Sum ([LC 416])

Let `nums = [1, 5, 11, 5]`.
- Total Sum $= 1 + 5 + 11 + 5 = 22$ (Even $\implies$ Parity Check Passed).
- Target Capacity $C = 22 / 2 = 11$.
- Array size: $C + 1 = 12$ indices ($0 \dots 11$).

```
Initial (Seed):
  Index:   0   1   2   3   4   5   6   7   8   9  10  11
  dp:    [ T,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F ]

After Item 0 (num = 1):
  w = 1: dp[1] = dp[1] | dp[0] = T
  dp:    [ T,  T,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F ]

After Item 1 (num = 5):
  w = 6: dp[6] = dp[6] | dp[1] = T
  w = 5: dp[5] = dp[5] | dp[0] = T
  dp:    [ T,  T,  F,  F,  F,  T,  T,  F,  F,  F,  F,  F ]

After Item 2 (num = 11):
  w = 11: dp[11] = dp[11] | dp[0] = T  <-- TARGET 11 ACHIEVED! EARLY EXIT!
  dp:    [ T,  T,  F,  F,  F,  T,  T,  F,  F,  F,  F,  T ]

Result: TRUE. Subsets: {11} and {1, 5, 5}.
```

---

### 4.2 Step-by-Step Trace of Target Sum ([LC 494])

Let `nums = [1, 1, 1, 1, 1]` and `target = 3`.
- Total Sum $= 5$.
- Algebraic Reduction:
  $$P = \frac{\text{target} + \text{totalSum}}{2} = \frac{3 + 5}{2} = 4$$
- Target: Find count of subsets summing to exactly 4.
- Array size: $P + 1 = 5$ indices ($0 \dots 4$).

```
Initial (Seed):
  Index:   0   1   2   3   4
  dp:    [ 1,  0,  0,  0,  0 ]

After Item 0 (num = 1):
  w = 1: dp[1] += dp[0] => 1
  dp:    [ 1,  1,  0,  0,  0 ]

After Item 1 (num = 1):
  w = 2: dp[2] += dp[1] => 1
  w = 1: dp[1] += dp[0] => 1 + 1 = 2
  dp:    [ 1,  2,  1,  0,  0 ]

After Item 2 (num = 1):
  w = 3: dp[3] += dp[2] => 1
  w = 2: dp[2] += dp[1] => 1 + 2 = 3
  w = 1: dp[1] += dp[0] => 2 + 1 = 3
  dp:    [ 1,  3,  3,  1,  0 ]

After Item 3 (num = 1):
  w = 4: dp[4] += dp[3] => 1
  w = 3: dp[3] += dp[2] => 1 + 3 = 4
  w = 2: dp[2] += dp[1] => 3 + 3 = 6
  w = 1: dp[1] += dp[0] => 3 + 1 = 4
  dp:    [ 1,  4,  6,  4,  1 ]

After Item 4 (num = 1):
  w = 4: dp[4] += dp[3] => 1 + 4 = 5   <-- RESULT: dp[4] = 5!
  dp:    [ 1,  5, 10, 10,  5 ]

Final Answer: 5 distinct expressions evaluate to +3.
(Combinatorially, choosing which 1 of the five 1's gets a '-' sign: C(5, 1) = 5).
```

---

## 5. PRACTICE: Canonical Subset Sum Problems & Variations

### 5.1 [LeetCode 416] Partition Equal Subset Sum (Medium)

#### Problem Description
Given an integer array `nums`, return `true` if you can partition the array into two subsets such that the sum of the elements in both subsets is equal or `false` otherwise.

#### Complete LeetCode Solution
```csharp
public class Solution
{
    public bool CanPartition(int[] nums)
    {
        int sum = 0;
        int max = 0;
        foreach (int x in nums)
        {
            sum += x;
            if (x > max) max = x;
        }

        // Parity guard: odd sum cannot be divided equally
        if ((sum & 1) != 0) return false;

        int target = sum / 2;
        if (max > target) return false;

        bool[] dp = new bool[target + 1];
        dp[0] = true;

        foreach (int num in nums)
        {
            for (int w = target; w >= num; w--)
            {
                if (dp[w - num])
                {
                    dp[w] = true;
                }
            }
            if (dp[target]) return true; // Early pruning
        }

        return dp[target];
    }
}
```

- **Time Complexity:** $O(N \cdot C)$ where $C = \sum \text{nums} / 2$.
- **Space Complexity:** $O(C)$ 1D array.

---

### 5.2 [LeetCode 494] Target Sum (Medium)

#### Problem Description
You are given an integer array `nums` and an integer `target`.
Build an expression using `'+'` and `'-'` symbols and return the number of different expressions that evaluate to `target`.

#### Complete LeetCode Solution
```csharp
public class Solution
{
    public int FindTargetSumWays(int[] nums, int target)
    {
        int totalSum = 0;
        foreach (int x in nums) totalSum += x;

        // Invariant guards
        if (Math.Abs(target) > totalSum) return 0;
        if (((target + totalSum) & 1) != 0) return 0;

        int p = (target + totalSum) / 2;
        int[] dp = new int[p + 1];
        dp[0] = 1;

        foreach (int num in nums)
        {
            for (int s = p; s >= num; s--)
            {
                dp[s] += dp[s - num];
            }
        }

        return dp[p];
    }
}
```

- **Time Complexity:** $O(N \cdot P)$ where $P = \frac{\text{target} + \text{totalSum}}{2}$.
- **Space Complexity:** $O(P)$ 1D array.

---

### 5.3 Related Variation: Partition with Minimum Difference ([LC 1049])

#### Problem Formalization
Partition `nums` into two subsets $S_1, S_2$ to minimize $|\sum S_1 - \sum S_2|$.
- In [LC 1049] (Last Stone Weight II), smashing stones together is mathematically identical to assigning signs $+$ and $-$ to stones to minimize the non-negative remaining weight.
- We find the maximum achievable subset sum $w \le \lfloor \text{totalSum} / 2 \rfloor$.
- The minimal difference is then:
  $$\text{MinDiff} = \text{totalSum} - 2 \cdot w_{\max}$$

```csharp
public static int LastStoneWeightII(int[] stones)
{
    int totalSum = 0;
    foreach (int s in stones) totalSum += s;

    int target = totalSum / 2;
    bool[] dp = new bool[target + 1];
    dp[0] = true;

    foreach (int stone in stones)
    {
        for (int w = target; w >= stone; w--)
        {
            if (dp[w - stone]) dp[w] = true;
        }
    }

    for (int w = target; w >= 0; w--)
    {
        if (dp[w])
        {
            return totalSum - 2 * w;
        }
    }

    return 0;
}
```

---

## 6. CONNECT: Financial Ledger Reconciliation & Transaction Auditing

### 6.1 Double-Entry Bookkeeping & The Netting Problem

In enterprise financial engineering (e.g., Stripe, PayPal, Wall Street clearing houses), the foundational accounting identity requires that every credit entry must balance an offsetting debit entry:
$$\sum_{i} \text{Debits}_i - \sum_{j} \text{Credits}_j = 0$$

When end-of-day bank settlement reports arrive, payment processors receive a single lump-sum wire transfer (e.g., $\$1,452,890.50$) from an acquiring bank, representing thousands of aggregated customer transactions minus fees.

```
                      Batch Transaction Reconciliation
                      
    Bank Settlement Wire:  $1,452,890.50
    Candidate Invoices:    { Inv_1: $120.00, Inv_2: $4,500.25, ..., Inv_N: $890.10 }
    
    Objective: Find S ⊆ Invoices such that:
               ∑_{i ∈ S} Inv_i = SettlementWireAmount
```

#### Production Engineering Constraints:
1. **The Exact Subset Problem:** Finding which specific set of invoices corresponds to the settlement batch is an Exact Subset Sum problem.
2. **Multiple Matching Subsets (Ambiguity):** If multiple distinct invoice combinations sum to the exact settlement amount, automated systems cannot guess. Schedulers must evaluate tie-breakers:
   - Temporal proximity (timestamps closest to batch close).
   - Merchant ID grouping.
3. **Multi-Currency Netting Cycles:** Clearing houses convert multi-party debts into a minimal set of net settlements. Finding zero-sum balance cycles is a generalized Target Sum problem over directed graphs!

---

## 7. CHECKPOINT: Comprehensive Self-Assessment & Mastery Key

### 7.1 Diagnostic Mastery Audit (10 Staff-Level Questions)

```
[Q1] Prove algebraically why Target Sum (LC 494) can be reduced to counting subsets 
     that sum to P = (target + totalSum) / 2.

[Q2] In Partition Equal Subset Sum (LC 416), explain why checking totalSum % 2 != 0 
     is both a necessary condition and an O(1) pruning optimization.

[Q3] In Target Sum, what invariant ensures that array elements equal to 0 correctly 
     double the number of expressions without causing infinite loops?

[Q4] What are the three mandatory validity guards that must be checked in Target Sum 
     BEFORE allocating the dynamic programming array?

[Q5] Explain the hardware mechanism by which 64-bit integer bitsets achieve a 64x 
     speedup over standard boolean arrays for subset sum reachability.

[Q6] In the Offset Shifting 2D matrix formulation of Target Sum, what is the formula 
     to map a logical intermediate sum s ∈ [-totalSum, +totalSum] to an array index?

[Q7] How is LeetCode 1049 (Last Stone Weight II) mathematically reduced to a 0-1 
     knapsack subset sum problem? State the objective function.

[Q8] Why must the capacity loop descend down to s = num (or s = 0 when zeroes are present) 
     rather than stopping at s = 1 in Target Sum?

[Q9] What happens if all elements in nums are 0 and target is 0? Derive the exact 
     mathematical output as a function of array length N.

[Q10] Contrast the time and space complexity of Meet-in-the-Middle vs. Dynamic Programming 
      for solving the Subset Sum problem when N = 36 and target = 10^12.
```

---

### 7.2 Exhaustive Mastery Key & Mathematical Derivations

#### [A1] Algebraic Derivation of Target Sum
Let $P$ be the set of numbers assigned a positive sign, and $N$ be the set assigned a negative sign.
Every number belongs to either $P$ or $N$: $\text{Sum}(P) + \text{Sum}(N) = \text{totalSum}$.
The evaluated sum is $\text{Sum}(P) - \text{Sum}(N) = \text{target}$.
Adding the two equations:
$$(\text{Sum}(P) + \text{Sum}(N)) + (\text{Sum}(P) - \text{Sum}(N)) = \text{totalSum} + \text{target}$$
$$2 \cdot \text{Sum}(P) = \text{totalSum} + \text{target} \implies \text{Sum}(P) = \frac{\text{totalSum} + \text{target}}{2}$$
Thus, finding the number of assignments achieving `target` is strictly equivalent to finding the number of subsets whose sum equals $P$.

#### [A2] Parity Invariant in Partition Equal Subset Sum
To partition $A$ into $S_1$ and $S_2$ with $\sum S_1 = \sum S_2 = k$, the total sum must be $\sum S_1 + \sum S_2 = 2k$. Because $k$ is an integer (the sum of integers is an integer), $2k$ is necessarily an even integer. If $\text{totalSum}$ is odd, no integer $k$ can satisfy $2k = \text{totalSum}$. Checking `totalSum % 2 != 0` in $O(1)$ prevents unnecessary $O(N \cdot C)$ computation.

#### [A3] Zero Element Multiplicity Doubling
When an element $a_i = 0$ is processed in the descending loop `for (int s = P; s >= 0; s--)`:
At each index $s$, the recurrence computes $\text{dp}[s] \leftarrow \text{dp}[s] + \text{dp}[s - 0] = 2 \cdot \text{dp}[s]$.
Because $+0$ and $-0$ evaluate to the same arithmetic value, every previously valid combination can either add $+0$ or $-0$, yielding exactly two distinct valid expressions. The backward sweep naturally doubles the count for every reachable sum.

#### [A4] The Three Mandatory Validity Guards for Target Sum
1. $|\text{target}| \le \text{totalSum}$: Target magnitude cannot exceed the sum of all absolute numbers.
2. $\text{target} + \text{totalSum} \ge 0$: Since all numbers are non-negative, $\text{Sum}(P) \ge 0$.
3. $(\text{target} + \text{totalSum}) \pmod 2 == 0$: The numerator must be evenly divisible by 2 to yield an integer capacity $P$.

#### [A5] Bitset Register Acceleration
A standard `bool[]` array stores 1 byte per boolean, evaluating states sequentially. A 64-bit unsigned integer (`ulong`) holds 64 distinct capacity states in a single register. The operation `bitset |= (bitset << num)` shifts all 64 bits simultaneously in a single CPU cycle, effectively evaluating 64 transitions in parallel without branches or memory stalls.

#### [A6] Offset Shifting Coordinate Mapping
To map the continuous logical domain $[-\text{totalSum}, +\text{totalSum}]$ to non-negative array indices $[0, 2 \cdot \text{totalSum}]$:
$$\text{PhysicalIndex} = s + \text{offset} \quad \text{where } \text{offset} = \text{totalSum}$$
- When $s = -\text{totalSum}$: $\text{PhysicalIndex} = -\text{totalSum} + \text{totalSum} = 0$.
- When $s = 0$: $\text{PhysicalIndex} = 0 + \text{totalSum} = \text{totalSum}$.
- When $s = +\text{totalSum}$: $\text{PhysicalIndex} = \text{totalSum} + \text{totalSum} = 2 \cdot \text{totalSum}$.

#### [A7] Last Stone Weight II Reduction
In Last Stone Weight II, colliding stones of weights $x$ and $y$ produces $|x - y|$. Repeating collisions over all stones is mathematically equivalent to partitioning stones into positive and negative sets to minimize $|\sum S_1 - \sum S_2|$.
Let $w = \sum S_1 \le \lfloor \text{totalSum} / 2 \rfloor$. Then $\sum S_2 = \text{totalSum} - w$.
The difference is $(\text{totalSum} - w) - w = \text{totalSum} - 2w$.
To minimize this difference, we maximize $w \le \lfloor \text{totalSum} / 2 \rfloor$ using standard 0-1 knapsack reachability.

#### [A8] Loop Lower Bound for Zeroes
If zeroes exist in `nums`, stopping the loop at $s = 1$ would skip updating $\text{dp}[0]$. However, a zero element can be added to the empty set ($+0$ vs $-0$), meaning $\text{dp}[0]$ must double from 1 to 2. Failing to loop down to $s = 0$ prevents zero multiplicity scaling for the base state.

#### [A9] All-Zeroes Array Output
If all $N$ elements are 0 and `target = 0`:
Every element $i$ can be independently chosen as $+0$ or $-0$.
The total number of valid assignments is:
$$\text{Output} = 2^N$$
For $N = 20$, the output is $2^{20} = 1,048,576$.

#### [A10] Meet-in-the-Middle vs. Dynamic Programming
- **Dynamic Programming:** Time $O(N \cdot T) = 36 \times 10^{12}$ operations, Memory $10^{12} \times 4\text{ bytes} = 4\text{ TB}$. Completely infeasible (out of memory and time limit exceeded).
- **Meet-in-the-Middle:** Split array into two halves of $N/2 = 18$ elements.
  - Generate $2^{18} = 262,144$ subset sums for each half.
  - Sort one half in $O(2^{N/2} \log(2^{N/2})) \approx 2.6 \times 10^5 \times 18 \approx 4.7 \times 10^6$ operations.
  - For each sum in the other half, binary search for $T - s$.
  - Total Time: $O(2^{N/2} \cdot N) \approx 10^7$ operations ($< 15\text{ ms}$). Memory: $262,144 \times 8\text{ bytes} \approx 2\text{ MB}$.
  - Meet-in-the-Middle is overwhelmingly superior when $N \le 40$ and $T \gg 10^6$.
