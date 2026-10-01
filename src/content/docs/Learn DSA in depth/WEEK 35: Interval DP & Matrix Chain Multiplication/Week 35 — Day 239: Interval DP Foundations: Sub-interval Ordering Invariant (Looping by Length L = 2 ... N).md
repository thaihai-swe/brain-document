---
title: "Week 35 — Day 239: Interval DP Foundations: Sub-interval Ordering Invariant (Looping by Length L = 2 ... N)"
---

# Week 35 — Day 239: Interval DP Foundations: Sub-interval Ordering Invariant (Looping by Length L = 2 ... N)

> "In linear and grid dynamic programming, subproblems follow straightforward spatial gradients—left-to-right or top-to-bottom. In **Interval Dynamic Programming**, subproblems are defined over contiguous subarrays $[i \dots j]$ of an underlying sequence. Here, the dependency graph does not flow along coordinate axes; it flows strictly along the dimension of **interval length**. Attempting to solve interval DP using standard nested loops (`for i ... for j`) inevitably crashes into uncomputed states. To preserve the DAG's topological ordering, bottom-up interval DP must advance by interval length $L = 2 \dots N$, propagating a diagonal wavefront across the upper-triangular state matrix."

---

## 1. TEACH: The Interval DP Paradigm & Length-Based Topological Ordering

### Defining the Interval State Space

In Interval Dynamic Programming, the objective is to determine an optimal scalar metric (e.g., minimum merge cost, maximum palindrome length, optimal parenthesization) over a continuous sequence of elements $A = [a_0, a_1, \dots, a_{N-1}]$.

The fundamental 2D state is defined as:
$$\text{dp}[i][j]$$
representing the optimal solution for the continuous subsegment $A[i \dots j]$, where $0 \le i \le j < N$.

The interval length $L$ of subproblem $\text{dp}[i][j]$ is:
$$L = j - i + 1$$

```
               Continuous Subsegment A[i ... j] of Length L:
               
               Index:    0    1    ...    i         ...         j    ...  N-1
               Array:  [ . ][ . ] ... [ a_i ][ a_{i+1} ] ... [ a_j ] ... [ . ]
                                       |<------- Length L ------->|
```

#### Base Cases (Unit Intervals, $L = 1$)
Every single-element interval $[i \dots i]$ has length $L = 1$. The base cases are typically trivial and depend on the problem semiring:
- **Cost Minimization (e.g., Stone Merging):** A single pile requires zero merges:
  $$\text{dp}[i][i] = 0 \quad \forall i \in [0, N-1]$$
- **Length Maximization (e.g., Longest Palindromic Subsequence):** A single character is trivially a palindrome of length 1:
  $$\text{dp}[i][i] = 1 \quad \forall i \in [0, N-1]$$

---

### The Subproblem Decomposition & Split Operator

To solve a composite interval $[i \dots j]$ of length $L \ge 2$, we partition the range into two non-empty, contiguous sub-intervals at an internal split boundary $k$:
$$[i \dots j] \implies [i \dots k] \cup [k+1 \dots j], \quad \text{where } i \le k < j$$

```
               Splitting Interval [i ... j] at Index k:
               
               +-------------------------------------------------------+
               |                    Interval [i ... j]                 |
               +---------------------------+---------------------------+
               |   Left Sub-interval       |   Right Sub-interval      |
               |        [i ... k]          |        [k+1 ... j]        |
               +---------------------------+---------------------------+
               i                           k  k+1                      j
               |<------ Length L_1 ------->|  |<------ Length L_2 ---->|
```

Notice the crucial algebraic property of the sub-interval lengths:
$$L_1 = k - i + 1, \quad L_2 = j - (k + 1) + 1 = j - k$$
$$L_1 + L_2 = (k - i + 1) + (j - k) = j - i + 1 = L$$

Because both sub-intervals are non-empty ($i \le k < j$):
$$1 \le L_1 < L \quad \text{and} \quad 1 \le L_2 < L$$

**Both constituent sub-intervals $[i \dots k]$ and $[k+1 \dots j]$ have lengths strictly smaller than $L$!**

#### The Canonical Interval Recurrence
For optimization problems requiring an exhaustive search over all valid split locations:
$$\text{dp}[i][j] = \min_{i \le k < j} \Big( \text{dp}[i][k] + \text{dp}[k+1][j] + \text{MergeCost}(i, k, j) \Big)$$
or for boundary-contraction problems (e.g., LPS):
$$\text{dp}[i][j] = \begin{cases}
\text{dp}[i+1][j-1] + 2, & \text{if } A[i] == A[j] \\
\max(\text{dp}[i+1][j], \; \text{dp}[i][j-1]), & \text{if } A[i] \neq A[j]
\end{cases}$$

---

### The Sub-interval Dependency Trap

Why can we not simply use classical nested loops over indices $i$ and $j$?

#### The Naive Failure:
```csharp
// FATAL FLAW: Standard Row-Major Traversal
for (int i = 0; i < n; i++)
{
    for (int j = i + 1; j < n; j++)
    {
        for (int k = i; k < j; k++)
        {
            // BUG: dp[k + 1, j] is evaluated for k >= i!
            // When k = i, dp[k + 1, j] = dp[i + 1, j].
            // But row i + 1 has NOT BEEN COMPUTED YET because the outer loop is at row i!
            dp[i, j] = Math.Min(dp[i, j], dp[i, k] + dp[k + 1, j] + cost);
        }
    }
}
```

```
       The Dirty Read Pathology:
       
       State Matrix (Upper Triangular):
             j = 0     j = 1     j = 2     j = 3
       i = 0 [ 0 ]     [dp01]    [dp02]    [TARGET: dp03]
       i = 1           [ 0 ]     [dp12]    [UNCOMPUTED: dp13!] <--- DIRTY READ!
       i = 2                     [ 0 ]     [UNCOMPUTED: dp23!] <--- DIRTY READ!
       i = 3                               [ 0 ]
       
       When evaluating dp[0, 3] at split k = 1:
       dp[0, 3] queries dp[0, 1] (computed) + dp[2, 3] (UNCOMPUTED in row 2!).
       The algorithm reads default uninitialized memory (0 or infinity),
       corrupting the entire DP state space.
```

---

### The Length-Based Iteration Invariant

To ensure that every subproblem queried has already been computed, the evaluation order must respect the **topological sort of the interval poset (partially ordered set)**. Because subproblem dependencies are strictly ordered by interval length, **interval length must advance monotonically**.

```
       =================================================================
       THE CANONICAL INTERVAL DP LOOP STRUCTURE:
       -----------------------------------------------------------------
       Loop 1: Length len  (2 to N)           <--- OUTER LOOP (Length)
       Loop 2: Start i     (0 to N - len)     <--- MIDDLE LOOP (Window)
               End   j     = i + len - 1
       Loop 3: Split k     (i to j - 1)       <--- INNER LOOP (Split)
       =================================================================
```

```
       Visualizing Diagonal Wavefront Propagation across Upper Triangle:
       
       Diagonal 0 (len = 1): dp[0,0], dp[1,1], dp[2,2], dp[3,3]  (Base cases)
       Diagonal 1 (len = 2): dp[0,1], dp[1,2], dp[2,3]           (Step 1)
       Diagonal 2 (len = 3): dp[0,2], dp[1,3]                    (Step 2)
       Diagonal 3 (len = 4): dp[0,3]                             (Final Target)
       
       j ->   0       1       2       3
       i 
       0    [ d0 ]  [ d1 ]  [ d2 ]  [ d3 ]   <-- Final answer at dp[0, N-1]
       1            [ d0 ]  [ d1 ]  [ d2 ]
       2                    [ d0 ]  [ d1 ]
       3                            [ d0 ]
```

#### Theorem: Length-Based Topological Invariant
> **Theorem:** In bottom-up interval dynamic programming, iterating the interval length $L$ from $2$ to $N$, and for each length evaluating all valid starting positions $i \in [0, N - L]$ with $j = i + L - 1$, guarantees that for every split point $k \in [i, j-1]$, both $\text{dp}[i][k]$ and $\text{dp}[k+1][j]$ are fully resolved prior to the evaluation of $\text{dp}[i][j]$.

#### Formal Inductive Proof
1. **Base Case ($L = 1$):** All single-element intervals $[i \dots i]$ are initialized prior to the loop. Their values are exact.
2. **Inductive Hypothesis:** Assume that for all lengths $l < L$, every interval $[u \dots v]$ with length $v - u + 1 = l$ has been correctly computed and stored in the matrix.
3. **Inductive Step:** Consider an arbitrary interval $[i \dots j]$ with length $j - i + 1 = L$.
   - Any valid split $k$ satisfies $i \le k < j$.
   - The left sub-interval is $[i \dots k]$, which has length $L_1 = k - i + 1$. Since $k < j$, $L_1 < j - i + 1 = L$.
   - The right sub-interval is $[k+1 \dots j]$, which has length $L_2 = j - (k + 1) + 1 = j - k$. Since $k \ge i$, $L_2 < j - i + 1 = L$.
   - By the inductive hypothesis, because $L_1 < L$ and $L_2 < L$, both $\text{dp}[i][k]$ and $\text{dp}[k+1][j]$ were resolved in earlier outer loop iterations ($l = L_1$ and $l = L_2$).
   - Therefore, no transition during iteration $L$ ever encounters an uncomputed cell.
4. By mathematical induction, all state evaluations are topologically sound. $\blacksquare$

---

## 2. IMPLEMENT: Production-Grade Interval DP Template Engine (.NET 8+)

The following compile-ready C# container implements:
1. `SolveMergeStonesTwoPileWarmup`: The foundational interval DP stone-merging problem with $O(1)$ prefix sum range queries.
2. `LongestPalindromicSubsequence`: Classical interval DP string contraction.
3. `PrintIntervalDpMatrix`: Diagnostic visualizer rendering upper-triangular interval tables.
4. Comprehensive test harness in `Main()` with `Debug.Assert` assertions.

```csharp
using System;
using System.Diagnostics;

namespace AdvancedAlgorithms.DynamicProgramming
{
    /// <summary>
    /// Production-grade engine establishing the canonical length-based interval DP templates.
    /// Demonstrates diagonal wavefront traversal, prefix sum integration, and upper-triangular indexing.
    /// </summary>
    public sealed class IntervalDpTemplateEngine
    {
        private const int Infinity = 1_000_000_000;

        /// <summary>
        /// Solves the Minimum Cost to Merge Stones (2-Pile Pairwise Warmup).
        /// Given N piles of stones, any two ADJACENT piles can be merged into a single pile.
        /// The cost of a merge is the sum of stones in the two piles.
        /// Returns the minimum total cost to merge all N piles into 1 pile.
        /// Time Complexity: O(N^3).
        /// Space Complexity: O(N^2).
        /// </summary>
        /// <param name="stones">Array of non-negative stone counts.</param>
        /// <returns>Minimum scalar cost to merge all stones.</returns>
        public int SolveMergeStonesTwoPileWarmup(int[] stones)
        {
            ArgumentNullException.ThrowIfNull(stones);
            int n = stones.Length;
            if (n <= 1) return 0;

            // Precompute prefix sums for O(1) range sum queries: sum(i..j) = prefix[j+1] - prefix[i]
            int[] prefix = new int[n + 1];
            for (int i = 0; i < n; i++)
            {
                if (stones[i] < 0) throw new ArgumentException("Stone counts must be non-negative.");
                prefix[i + 1] = prefix[i] + stones[i];
            }

            // dp[i, j] = minimum cost to merge stones from index i to j into a single pile
            int[,] dp = new int[n, n];

            // Base cases: len = 1 is implicitly 0 (single pile requires 0 cost to merge)
            // Outer loop: Iterate by interval length from 2 to N
            for (int len = 2; len <= n; len++)
            {
                // Middle loop: Iterate over all valid starting indices
                for (int i = 0; i <= n - len; i++)
                {
                    int j = i + len - 1; // End index of the interval
                    dp[i, j] = Infinity;

                    // Inner loop: Iterate over all possible partition boundaries k
                    for (int k = i; k < j; k++)
                    {
                        int cost = dp[i, k] + dp[k + 1, j];
                        if (cost < dp[i, j])
                        {
                            dp[i, j] = cost;
                        }
                    }

                    // Add the final merge cost for combining the two resulting sub-piles
                    // The cost to merge the final two piles is the total sum of all stones in range [i..j]
                    int rangeSum = prefix[j + 1] - prefix[i];
                    dp[i, j] += rangeSum;
                }
            }

            return dp[0, n - 1];
        }

        /// <summary>
        /// Solves [LeetCode 516] Longest Palindromic Subsequence via Interval DP.
        /// Finds the length of the longest palindromic subsequence in string s.
        /// Time Complexity: O(N^2).
        /// Space Complexity: O(N^2).
        /// </summary>
        /// <param name="s">Input string.</param>
        /// <returns>Length of the longest palindromic subsequence.</returns>
        public int LongestPalindromicSubsequence(string s)
        {
            ArgumentNullException.ThrowIfNull(s);
            int n = s.Length;
            if (n <= 1) return n;

            // dp[i, j] = length of LPS in substring s[i..j]
            int[,] dp = new int[n, n];

            // Base cases: single characters are palindromes of length 1
            for (int i = 0; i < n; i++)
            {
                dp[i, i] = 1;
            }

            // Outer loop: Length from 2 to N
            for (int len = 2; len <= n; len++)
            {
                for (int i = 0; i <= n - len; i++)
                {
                    int j = i + len - 1;

                    if (s[i] == s[j])
                    {
                        // Boundary match: characters match, expand inward
                        dp[i, j] = (len == 2) ? 2 : dp[i + 1, j - 1] + 2;
                    }
                    else
                    {
                        // Boundary mismatch: take the best by dropping either s[i] or s[j]
                        dp[i, j] = Math.Max(dp[i + 1, j], dp[i, j - 1]);
                    }
                }
            }

            return dp[0, n - 1];
        }

        /// <summary>
        /// Diagnostic helper to print the upper-triangular interval DP matrix to the console.
        /// </summary>
        public void PrintIntervalDpMatrix(int[,] dp, int n)
        {
            ArgumentNullException.ThrowIfNull(dp);
            Console.WriteLine("--- Upper-Triangular Interval DP Table ---");
            Console.Write("       ");
            for (int j = 0; j < n; j++) Console.Write($"j={j,-5} ");
            Console.WriteLine();

            for (int i = 0; i < n; i++)
            {
                Console.Write($"i={i,-3} | ");
                for (int j = 0; j < n; j++)
                {
                    if (j < i)
                    {
                        Console.Write("  .    "); // Lower triangle unused
                    }
                    else
                    {
                        Console.Write($"{dp[i, j],-5} ");
                    }
                }
                Console.WriteLine();
            }
        }

        /// <summary>
        /// Self-validating test harness verifying topological invariants, edge cases, and benchmarks.
        /// </summary>
        public static void Main()
        {
            var engine = new IntervalDpTemplateEngine();
            Console.WriteLine("=== Running Interval DP Foundations Verification Suite ===");

            // Test 1: Minimum Cost to Merge Stones (2-Pile Warmup)
            // Stones = [3, 2, 4, 1]
            // Step 1: Merge [3, 2] -> cost 5, stones: [5, 4, 1]
            // Step 2: Merge [4, 1] -> cost 5, stones: [5, 5]
            // Step 3: Merge [5, 5] -> cost 10, stones: [10]
            // Total cost = 5 + 5 + 10 = 20.
            int[] stones1 = { 3, 2, 4, 1 };
            int res1 = engine.SolveMergeStonesTwoPileWarmup(stones1);
            Debug.Assert(res1 == 20, $"Test 1 Failed: Expected 20, got {res1}");
            Console.WriteLine($"Test 1 Passed: Merge Stones [3, 2, 4, 1] min cost = {res1}");

            // Test 2: Merge Stones - Small Array (N=2)
            int[] stones2 = { 5, 8 };
            int res2 = engine.SolveMergeStonesTwoPileWarmup(stones2);
            Debug.Assert(res2 == 13, $"Test 2 Failed: Expected 13, got {res2}");
            Console.WriteLine($"Test 2 Passed: Merge Stones [5, 8] min cost = {res2}");

            // Test 3: Merge Stones - Single Element / Empty (N <= 1)
            Debug.Assert(engine.SolveMergeStonesTwoPileWarmup(new int[] { 42 }) == 0, "Test 3a Failed");
            Debug.Assert(engine.SolveMergeStonesTwoPileWarmup(Array.Empty<int>()) == 0, "Test 3b Failed");
            Console.WriteLine("Test 3 Passed: Boundary stone counts (N <= 1) return 0 correctly.");

            // Test 4: Longest Palindromic Subsequence - Standard Case
            // "bbbab" -> "bbbb" (length 4)
            string s4 = "bbbab";
            int res4 = engine.LongestPalindromicSubsequence(s4);
            Debug.Assert(res4 == 4, $"Test 4 Failed: Expected 4, got {res4}");
            Console.WriteLine($"Test 4 Passed: LPS('bbbab') = {res4}");

            // Test 5: Longest Palindromic Subsequence - Already Palindrome
            string s5 = "racecar";
            int res5 = engine.LongestPalindromicSubsequence(s5);
            Debug.Assert(res5 == 7, $"Test 5 Failed: Expected 7, got {res5}");
            Console.WriteLine($"Test 5 Passed: LPS('racecar') = {res5}");

            // Test 6: Longest Palindromic Subsequence - No Palindrome > 1
            string s6 = "abcdef";
            int res6 = engine.LongestPalindromicSubsequence(s6);
            Debug.Assert(res6 == 1, $"Test 6 Failed: Expected 1, got {res6}");
            Console.WriteLine($"Test 6 Passed: LPS('abcdef') = {res6}");

            // Test 7: LPS Single Character & Empty
            Debug.Assert(engine.LongestPalindromicSubsequence("z") == 1, "Test 7a Failed");
            Debug.Assert(engine.LongestPalindromicSubsequence("") == 0, "Test 7b Failed");
            Console.WriteLine("Test 7 Passed: Boundary strings handled correctly.");

            Console.WriteLine("All 7 Interval DP foundational verification tests passed with 100% assertion integrity.");
        }
    }
}
```

---

## 3. ANALYZE: Algorithmic Invariants & The 5-Dimension Staff Deep-Dive

```
========================================================================================
                      THE 5-DIMENSION STAFF ENGINEERING DEEP-DIVE
========================================================================================
[1] Asymptotic Complexity  --> Split Search: O(N^3) time, O(N^2) space; Knuth-Yao O(N^2)
[2] Memory Layout          --> Upper-triangular matrix; 50% storage waste vs flat 1D index
[3] Directional Wavefront  --> Diagonal wavefront progression (d = 0 to N-1)
[4] Algebraic Semirings    --> Min-Plus (Merge Stones) vs Max-Plus (Palindromic Subsequence)
[5] Boundary Degradation   --> Substring len=2 boundary condition, prefix sum off-by-one
========================================================================================
```

### Dimension 1: Asymptotic Complexity & The Knuth-Yao Optimization

#### Standard Complexity
For an array of length $N$:
- Interval length $L$ ranges from $2$ to $N$ ($N - 1$ outer iterations).
- Start index $i$ ranges from $0$ to $N - L$ ($N - L + 1$ middle iterations).
- Split index $k$ ranges from $i$ to $j - 1$ ($L - 1$ inner iterations).

The total number of inner loop operations is:
$$\sum_{L=2}^N (N - L + 1)(L - 1) = \sum_{L=1}^{N-1} (N - L) \cdot L = \frac{N(N^2 - 1)}{6} = O(N^3)$$

The space complexity is the size of the 2D table:
$$\frac{N(N + 1)}{2} \text{ upper-triangular states} \implies O(N^2)$$

#### The Knuth-Yao Speedup ($O(N^3) \to O(N^2)$)
When the cost function satisfies the **Quadrangle Inequality** (convexity property) and **Interval Monotonicity**:
$$\text{Cost}(i, l) + \text{Cost}(j, k) \le \text{Cost}(i, k) + \text{Cost}(j, l) \quad \text{for } i \le j \le k \le l$$
the optimal split point $\text{opt}[i, j]$ is monotonically bounded by its immediate sub-interval splits:
$$\text{opt}[i, j-1] \le \text{opt}[i, j] \le \text{opt}[i+1, j]$$
By restricting the search loop for $k$ to $[\text{opt}[i, j-1], \text{opt}[i+1, j]]$, the inner loop amortizes across diagonals, collapsing the total time from $O(N^3)$ to **$O(N^2)$**! This optimization will be analyzed in detail during Day 240 (Matrix Chain Multiplication).

---

### Dimension 2: Memory Hierarchy & Upper-Triangular Cache Access

In interval DP, any state with $j < i$ represents a negative-length interval, which is physically impossible. Therefore, the lower-triangular half of matrix `dp[i, j]` is completely unused.

```
       Upper-Triangular Allocation:
       +---+---+---+---+
       | X | X | X | X |   X = Active Interval State
       +---+---+---+---+   . = Unused Memory (50% Overhead)
       | . | X | X | X |
       +---+---+---+---+
       | . | . | X | X |
       +---+---+---+---+
       | . | . | . | X |
       +---+---+---+---+
```

#### Cache Line Stride During Split Searches
Notice what happens in the inner split loop:
```csharp
for (int k = i; k < j; k++)
{
    int cost = dp[i, k] + dp[k + 1, j]; // Accesses row i (left) and column j (right)
}
```
1. `dp[i, k]` advances along row $i$ as $k$ increments. In row-major memory, this is a **unit-stride sequential read**, fetching contiguous words from the L1 cache.
2. `dp[k + 1, j]` advances along column $j$ as $k$ increments. In row-major memory, each step jumps by $N \times 4$ bytes! This causes **column striding**, leading to frequent L1 cache line evictions for large $N$.
3. *Production Mitigation:* Transposing the right subproblem or storing intermediate diagonal stripes drastically reduces cache miss penalties when $N > 1000$.

---

### Dimension 3: Directional Wavefront & Diagonal Poset

In mathematical lattice theory, the subproblems of Interval DP form a **Graded Poset** where the rank function is interval length:
$$\text{Rank}([i \dots j]) = j - i + 1$$

A state of rank $L$ has incoming directed edges *exclusively* from states of rank strictly $< L$.
Therefore, processing rank-by-rank ($L = 1, L = 2, \dots, L = N$) is a canonical **topological sort** of the dependency DAG.

```
       Rank 4 (L=4):                  [0 ... 3]
                                     /    |    \
       Rank 3 (L=3):           [0...2]   ...   [1...3]
                               /   \           /   \
       Rank 2 (L=2):       [0..1]  [1..2]  [2..3]  ...
                           /   \   /   \   /   \
       Rank 1 (L=1):     [0]   [1]     [2]     [3]
```

---

### Dimension 4: Algebraic Semirings & Cost Aggregators

Interval DP problems divide into two broad semiring categories:

1. **Split-Search Problems (Min-Plus Semiring):**
   $$\text{dp}[i][j] = \min_{i \le k < j} \Big( \text{dp}[i][k] + \text{dp}[k+1][j] \Big) + \text{Cost}(i, j)$$
   - Carrier: $\mathbb{R} \cup \{+\infty\}$.
   - Choice: $\min$. Accumulation: $+$.
   - Examples: Minimum Cost to Merge Stones, Matrix Chain Multiplication, Polygon Triangulation.

2. **Boundary-Contraction Problems (Max-Plus Semiring):**
   $$\text{dp}[i][j] = \begin{cases} \text{dp}[i+1][j-1] + 2, & \text{if } A[i] == A[j] \\ \max(\text{dp}[i+1][j], \text{dp}[i][j-1]), & \text{otherwise} \end{cases}$$
   - Carrier: $\mathbb{N}$.
   - Choice: $\max$. Accumulation: $+$.
   - Examples: Longest Palindromic Subsequence, Strange Printer, Burst Balloons.

---

### Dimension 5: Failure Modes & Boundary Degradation

| Failure Mode | Root Cause | Structural Mitigation |
| :--- | :--- | :--- |
| **Dirty Reads from Uncomputed Cells** | Iterating $i$ and $j$ naively instead of length $L$ | Enforce outer loop on $L = 2 \dots N$. |
| **Substring Length 2 Boundary Crash** | `dp[i+1, j-1]` accesses $j-1 < i+1$ when $len = 2$ | Handle $len = 2$ explicitly: `(len == 2) ? 2 : dp[i+1, j-1] + 2`. |
| **Prefix Sum Off-By-One** | `prefix[j] - prefix[i]` omits element $j$ | Use 1-indexed prefix sums: `prefix[j + 1] - prefix[i]`. |
| **Integer Overflow on Sums** | Adding large range sums to infinity sentinels | Guard sentinel comparisons before adding `rangeSum`. |

---

## 4. DEMONSTRATE: Visual State Transitions & Triangular Wavefront Traces

### Step-by-Step Grid Evolution: Merge Stones [3, 2, 4, 1]

Let $N = 4$. Prefix sums:
`prefix = [0, 3, 5, 9, 10]`
`rangeSum(i, j) = prefix[j+1] - prefix[i]`

#### Step 0: Base Cases ($len = 1$, Diagonal 0)
`dp[0, 0] = 0`, `dp[1, 1] = 0`, `dp[2, 2] = 0`, `dp[3, 3] = 0`.

```
Diagonal 0:
j=0     j=1     j=2     j=3
i=0 [ 0 ]   [ . ]   [ . ]   [ . ]
i=1         [ 0 ]   [ . ]   [ . ]
i=2                 [ 0 ]   [ . ]
i=3                         [ 0 ]
```

#### Step 1: Interval Length $len = 2$ (Diagonal 1)
- $[0 \dots 1]$: $k = 0 \implies \text{dp}[0, 0] + \text{dp}[1, 1] + \text{sum}(0, 1) = 0 + 0 + 5 = \mathbf{5}$
- $[1 \dots 2]$: $k = 1 \implies \text{dp}[1, 1] + \text{dp}[2, 2] + \text{sum}(1, 2) = 0 + 0 + 6 = \mathbf{6}$
- $[2 \dots 3]$: $k = 2 \implies \text{dp}[2, 2] + \text{dp}[3, 3] + \text{sum}(2, 3) = 0 + 0 + 5 = \mathbf{5}$

```
Diagonal 1:
j=0     j=1     j=2     j=3
i=0 [ 0 ]   [ 5 ]   [ . ]   [ . ]
i=1         [ 0 ]   [ 6 ]   [ . ]
i=2                 [ 0 ]   [ 5 ]
i=3                         [ 0 ]
```

#### Step 2: Interval Length $len = 3$ (Diagonal 2)
- $[0 \dots 2]$ ($\text{sum} = 9$):
  - $k = 0: \text{dp}[0, 0] + \text{dp}[1, 2] = 0 + 6 = 6$
  - $k = 1: \text{dp}[0, 1] + \text{dp}[2, 2] = 5 + 0 = 5$
  - $\min(6, 5) + 9 = \mathbf{14}$
- $[1 \dots 3]$ ($\text{sum} = 7$):
  - $k = 1: \text{dp}[1, 1] + \text{dp}[2, 3] = 0 + 5 = 5$
  - $k = 2: \text{dp}[1, 2] + \text{dp}[3, 3] = 6 + 0 = 6$
  - $\min(5, 6) + 7 = \mathbf{12}$

```
Diagonal 2:
j=0     j=1     j=2     j=3
i=0 [ 0 ]   [ 5 ]   [ 14 ]  [ . ]
i=1         [ 0 ]   [ 6 ]   [ 12 ]
i=2                 [ 0 ]   [ 5 ]
i=3                         [ 0 ]
```

#### Step 3: Interval Length $len = 4$ (Diagonal 3 - Target!)
- $[0 \dots 3]$ ($\text{sum} = 10$):
  - $k = 0: \text{dp}[0, 0] + \text{dp}[1, 3] = 0 + 12 = 12$
  - $k = 1: \text{dp}[0, 1] + \text{dp}[2, 3] = 5 + 5 = 10$ (Optimal Split!)
  - $k = 2: \text{dp}[0, 2] + \text{dp}[3, 3] = 14 + 0 = 14$
  - $\min(12, 10, 14) + 10 = 10 + 10 = \mathbf{20}$

```
Final Matrix:
j=0     j=1     j=2     j=3
i=0 [ 0 ]   [ 5 ]   [ 14 ]  [ 20 ]  <-- Final Answer: dp[0, 3] = 20
i=1         [ 0 ]   [ 6 ]   [ 12 ]
i=2                 [ 0 ]   [ 5 ]
i=3                         [ 0 ]
```

---

## 5. PRACTICE: Canonical Interval Problems & Recurrence Derivations

### Problem 1: Minimum Cost to Merge Stones (2-Pile Pairwise Warmup)
- **Problem Formulation:** Merge $N$ contiguous piles into 1 pile, merging 2 adjacent piles at a time.
- **Recurrence:**
  $$\text{dp}[i][j] = \min_{i \le k < j} (\text{dp}[i][k] + \text{dp}[k+1][j]) + \sum_{m=i}^j \text{stones}[m]$$
- **Base Case:** $\text{dp}[i][i] = 0$.
- **Complexity:** Time $O(N^3)$, Space $O(N^2)$.

### Problem 2: Longest Palindromic Subsequence ([LeetCode 516])
- **Problem Formulation:** Find the length of the longest palindromic subsequence in string $s$.
- **Recurrence:**
  $$\text{dp}[i][j] = \begin{cases} 
  \text{dp}[i+1][j-1] + 2, & \text{if } s[i] == s[j] \\
  \max(\text{dp}[i+1][j], \text{dp}[i][j-1]), & \text{if } s[i] \neq s[j]
  \end{cases}$$
- **Base Case:** $\text{dp}[i][i] = 1$.
- **Complexity:** Time $O(N^2)$, Space $O(N^2)$.

### Problem 3: Minimum Insertion Steps to Make a String Palindrome ([LeetCode 1312])
- **Problem Formulation:** Find the minimum number of character insertions to convert string $s$ into a palindrome.
- **Reduction to LPS:**
  $$\text{minInsertions} = N - \text{LPS}(s)$$
  Every character already part of the Longest Palindromic Subsequence is matched. Every remaining character outside the LPS requires exactly 1 insertion to balance.

---

## 6. CONNECT: Streaming Media Segment Defragmentation & Buffer Consolidation

In high-throughput distributed video streaming (e.g., Netflix, YouTube HLS/DASH chunk delivery) and network card kernel drivers, interval DP principles optimize contiguous memory buffer consolidation.

```
       Adaptive Bitrate Streaming (HLS / DASH) Chunk Pipeline:
       
       Continuous Video Stream Playback Buffer (Timeline in Seconds):
       +---------------+---------------+---------------+---------------+
       | Chunk 0 (2s)  | Chunk 1 (2s)  | Chunk 2 (2s)  | Chunk 3 (2s)  |
       | Bitrate: 4M   | Bitrate: 6M   | Bitrate: 6M   | Bitrate: 4M   |
       +---------------+---------------+---------------+---------------+
       |<----------------------- Interval [0 ... 3] ------------------->|
```

### The Media Buffer Defragmentation Problem
When video players stream chunks over HTTP, chunks arrive out of order and must be merged into contiguous playback intervals in memory:
1. **Merge Overhead Cost:** Each consolidation of two contiguous memory buffers incurs a memory copy cost proportional to their combined byte size.
2. **Quality Switch Penalty:** Merging chunks across different bitrate encoding profiles requires transcoding or audio-video clock resynchronization:
   $$\text{Penalty}(i, k, j) = \text{Bytes}(i, j) + \alpha \cdot |\text{Bitrate}(k) - \text{Bitrate}(k+1)|$$
3. **Interval DP Formulation:**
   $$\text{Cost}[i, j] = \min_{i \le k < j} \Big(\text{Cost}[i, k] + \text{Cost}[k+1, j] + \text{Penalty}(i, k, j)\Big)$$
   The media engine precomputes the optimal hierarchical merge tree for incoming chunk windows, ensuring that memory buffer consolidation minimizes CPU cache thrashing and avoids video playback stuttering.

---

## 7. CHECKPOINT: Comprehensive Self-Assessment & Mastery Key

### Diagnostic Questions

1. **Prove why standard nested loops `for (int i = 0; i < N; i++) for (int j = i; j < N; j++)` violate bottom-up dependency ordering in interval DP, while looping by length `len = 2 ... N` preserves it.**
2. **In [LeetCode 516] Longest Palindromic Subsequence, why does the case $s[i] == s[j]$ reduce to $\text{dp}[i+1][j-1] + 2$ without needing to check intermediate splits $k$?**
3. **What is the purpose of precomputing a prefix sum array when solving stone-merging interval DP problems, and what is the asymptotic consequence of omitting it?**
4. **How does the upper-triangular state representation impact memory hierarchy performance, and why is `dp[k+1, j]` more cache-expensive than `dp[i, k]` in row-major memory?**
5. **How does Minimum Insertion Steps to Make a String Palindrome ([LeetCode 1312]) algebraically reduce to Longest Palindromic Subsequence?**

---

### Comprehensive Mastery Key

#### 1. Formal Proof of Length-Based Dependency Ordering
In interval DP, state $\text{dp}[i, j]$ requires values $\text{dp}[i, k]$ and $\text{dp}[k+1, j]$ for split indices $k \in [i, j-1]$.
If we iterate $i$ outer ($0 \to N-1$) and $j$ inner ($i \to N-1$):
When evaluating cell $(i, j)$, at split $k = i$, the algorithm queries $\text{dp}[i+1, j]$.
However, because the outer loop is currently at index $i$, row $i+1$ has **not yet been computed**! Cell $\text{dp}[i+1, j]$ contains uninitialized default memory.
Conversely, when looping by interval length $L = j - i + 1$:
The queried sub-intervals $[i \dots k]$ and $[k+1 \dots j]$ have lengths $L_1 = k - i + 1$ and $L_2 = j - k$. Because $i \le k < j$, both $L_1 < L$ and $L_2 < L$.
Because the outer loop advances $L$ monotonically ($2 \dots N$), all states of length $< L$ were completely computed in earlier iterations. Thus, length-based iteration strictly preserves the topological sort of the subproblem DAG.

#### 2. Greedy Extremity Matching in LPS
When $s[i] == s[j]$, both characters can simultaneously serve as the outermost matching pair of a palindrome. Any palindrome formed using a proper subset of characters between $i$ and $j$ can be strictly augmented by wrapping it with $s[i]$ and $s[j]$, increasing its length by 2. It is mathematically impossible for an internal split $k$ to yield a longer palindrome than matching the extreme endpoints. Therefore, no split search is required, reducing the state transition from $O(N)$ to $O(1)$.

#### 3. Prefix Sum Query Acceleration
In stone merging, every merge of sub-intervals $[i \dots k]$ and $[k+1 \dots j]$ into $[i \dots j]$ adds the sum of all stones in range $[i \dots j]$.
- With a precomputed prefix sum array `prefix`, $\sum_{m=i}^j \text{stones}[m] = \text{prefix}[j+1] - \text{prefix}[i]$, evaluated in **$O(1)$ time**.
- Without prefix sums, calculating the range sum takes $O(j - i + 1) = O(L)$ time.
- Repeating this inside the split loop would increase the inner transition from $O(1)$ to $O(N)$, degrading overall algorithm complexity from $O(N^3)$ to **$O(N^4)$**, causing immediate Time Limit Exceeded (TLE) on benchmark inputs.

#### 4. Cache Asymmetry in Row-Major Storage
In row-major memory (standard in C# `[,]` and C++), cell `dp[r, c]` has linear address offset $r \times N + c$.
- `dp[i, k]` varies column index $k$ while keeping row $i$ fixed. Successive reads access contiguous 32-bit words in the same 64-byte L1 cache line (unit-stride access).
- `dp[k+1, j]` varies row index $k+1$ while keeping column $j$ fixed. Successive reads jump by $N \times 4$ bytes in memory. For $N \ge 256$, every read jumps to a different memory page, causing massive L1 cache evictions and memory bus stalls.

#### 5. Algebraic Reduction of Min Insertions to LPS
Let $S$ be a string of length $N$. A palindrome is symmetric about its center.
The Longest Palindromic Subsequence (LPS) represents the largest subset of characters in $S$ that already possesses palindromic symmetry.
Every character *not* in the LPS has no matching counterpart. To make the entire string a palindrome, each unmatched character must have a corresponding duplicate inserted at the symmetric opposite position.
Therefore:
$$\text{Min Insertions} = N - \text{Length}(\text{LPS}(S))$$
Computing $\text{LPS}(S)$ in $O(N^2)$ via interval DP immediately gives the optimal insertion count.
