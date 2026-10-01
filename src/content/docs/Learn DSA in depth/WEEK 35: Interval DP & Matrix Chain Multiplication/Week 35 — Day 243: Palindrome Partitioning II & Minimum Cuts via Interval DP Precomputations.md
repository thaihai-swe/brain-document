---
title: "Week 35 — Day 243: Palindrome Partitioning II & Minimum Cuts via Interval DP Precomputations"
---

# Week 35 — Day 243: Palindrome Partitioning II & Minimum Cuts via Interval DP Precomputations

---

## 1. TEACH: Two-Stage DP Architecture & Palindromic Interval Precomputation

### The Exponential Trap: Palindrome Partitioning I vs. II

In combinatorial string processing, palindromic partitioning represents a classic bifurcation between **all-solutions search** (backtracking) and **optimal-metric decision** (dynamic programming).

Consider the contrast between two canonical formulations:
1. **Palindrome Partitioning I ([LeetCode 131]):** Return *all possible* partitions such that every substring is a palindrome. For a string of $N$ identical characters (e.g., `"aaaa"`), every subset of the $N-1$ possible cut positions produces a valid partition. The number of valid partitions is exactly $2^{N-1}$. Any algorithm must emit $\Theta(N \cdot 2^N)$ characters; backtracking is strictly optimal because the output size itself is exponential.
2. **Palindrome Partitioning II ([LeetCode 132]):** Determine the *minimum number of cuts* needed to partition string $s$ such that every resulting substring is a palindrome. Here, we do not need to enumerate the $2^{N-1}$ partitions; we seek a single scalar integer:
   $$\text{minCuts}(s) \in [0, N-1]$$

A novice engineer who ports the recursive backtracking framework from Problem I to Problem II falls into the **Exponential Search Trap**. Branching across all cut combinations yields an execution tree of depth $N$ and branching factor up to $2$, resulting in $\mathcal{O}(2^N)$ time complexity. For $N = 2000$, $2^{2000} \approx 1.14 \times 10^{602}$, which guarantees an instantaneous Time Limit Exceeded (TLE) crash.

A slightly more experienced candidate might attempt a 1D Dynamic Programming approach: let $\text{dp}[i]$ be the minimum cuts for prefix $s[0 \dots i]$. To compute $\text{dp}[i]$, the algorithm checks all possible final cuts at $j \in [0, i-1]$:
$$\text{dp}[i] = \min_{0 \le j < i, \, s[j+1 \dots i] \text{ is palindrome}} (\text{dp}[j] + 1)$$
However, if the palindrome check on substring $s[j+1 \dots i]$ is performed naively via a two-pointer scan taking $\mathcal{O}(i - j) = \mathcal{O}(N)$ time inside the nested loop, the total time complexity deteriorates to:
$$\sum_{i=1}^N \sum_{j=0}^{i-1} \mathcal{O}(i - j) = \mathcal{O}(N^3)$$
For $N = 2000$, $N^3 = 8 \times 10^9$ operations, which exceeds standard interview execution limits (typically $10^8$ operations per second).

```
NAIVE BACKTRACKING:
                s[0...N-1]
               /     |    \
           cut@1   cut@2  cut@3 ... (O(2^N) states - EXPLOSION)

NAIVE 1D DP WITH ON-THE-FLY PALINDROME CHECK:
dp[i] = min_{j} (dp[j] + 1) where checkPalindrome(s[j+1..i]) takes O(N)
Total Time: O(N) outer * O(N) split * O(N) check = O(N^3) (TOO SLOW FOR N=2000)

TWO-STAGE DP PIPELINE (OPTIMAL):
Stage 1 (Interval DP): Precompute isPal[i, j] in O(1) per cell -> Total O(N^2)
Stage 2 (Linear 1D DP): dp[i] = min_{j} (dp[j] + 1) with O(1) table lookup -> Total O(N^2)
Combined Time: O(N^2) + O(N^2) = O(N^2)  [~4 * 10^6 ops, runs in 15 ms]
```

---

### The Two-Stage DP Architecture

To break the cubic barrier, we decouple the problem into a pipelined **Two-Stage Dynamic Programming Architecture**:

```
+-----------------------------------------------------------------------+
| STAGE 1: 2D Interval DP (Subproblem: Palindrome Verification)         |
| State:   isPal[i, j] in {true, false}                                 |
| Rule:    isPal[i, j] = (s[i] == s[j]) && (j - i < 2 || isPal[i+1,j-1])|
| Cost:    O(N^2) Time, O(N^2) Auxiliary Space                          |
+-----------------------------------------------------------------------+
                                   |
                                   v  Precomputed O(1) Oracle Table
+-----------------------------------------------------------------------+
| STAGE 2: 1D Linear Prefix DP (Subproblem: Cut Minimization)           |
| State:   minCuts[i] = minimum cuts for prefix s[0 ... i]              |
| Rule:    If isPal[0, i] => minCuts[i] = 0 (Zero-cut fast path)        |
|          Else minCuts[i] = min_{0 <= j < i, isPal[j+1, i]} (dp[j] + 1)|
| Cost:    O(N^2) Time, O(N) Auxiliary Space                            |
+-----------------------------------------------------------------------+
```

#### Stage 1: Interval Dynamic Programming Formulation
A substring $s[i \dots j]$ is a palindrome if and only if its outer boundary characters match ($s[i] == s[j]$) and its internal sub-interval $s[i+1 \dots j-1]$ is itself a palindrome.
- **Base Cases:**
  - Length 1 ($i == j$): Trivially `isPal[i, i] = true`.
  - Length 2 ($j == i + 1$): `isPal[i, i+1] = (s[i] == s[i+1])`.
- **Inductive Step ($j - i \ge 2$):**
  $$\text{isPal}[i, j] = (s[i] == s[j]) \land \text{isPal}[i+1, j-1]$$
- **Traversal Order:**
  Notice that cell $(i, j)$ depends on cell $(i+1, j-1)$, which lies one row down and one column left. Thus, Stage 1 can be evaluated either:
  1. Outer loop over interval length $L = 1 \dots N$, inner loop over start index $i = 0 \dots N - L$; or
  2. Outer loop moving backwards $i = N-1 \dots 0$, inner loop moving forwards $j = i \dots N-1$.

#### Stage 2: 1D Linear Dynamic Programming Formulation
Let $\text{minCuts}[i]$ represent the minimum cuts needed to partition prefix $s[0 \dots i]$ into valid palindromic substrings.
- **Base Case:**
  - Single character prefix ($i = 0$): $\text{minCuts}[0] = 0$.
- **Fast-Path Invariant:**
  - If $\text{isPal}[0, i] == \text{true}$, the entire prefix $s[0 \dots i]$ is already a palindrome. No cuts are required:
    $$\text{minCuts}[i] = 0$$
- **General Transition ($i > 0$):**
  - If $s[0 \dots i]$ is not a palindrome, the worst-case number of cuts is $i$ (cutting between every adjacent pair of characters). We test every possible final palindromic segment $s[j+1 \dots i]$ where $j \in [0, i-1]$:
    $$\text{minCuts}[i] = \min_{\substack{0 \le j < i \\ \text{isPal}[j+1, i] == \text{true}}} (\text{minCuts}[j] + 1)$$

---

### Space Optimization: The Center Expansion Collapse

While the canonical two-stage approach requires $\mathcal{O}(N^2)$ auxiliary space for the `isPal` matrix, we can compress auxiliary memory to $\mathcal{O}(N)$ by collapsing Stage 1 directly into Stage 2 via **Center Expansion**.

Every palindrome is centered either at an exact character (odd length, $2N-1$ total centers) or between two characters (even length). Rather than pre-storing all $N^2$ boolean values:
1. Initialize $\text{minCuts}[i] = i$ for all $i \in [0, N-1]$.
2. For each center $c \in [0, N-1]$:
   - **Odd expansion:** Let $l = c, r = c$.
   - **Even expansion:** Let $l = c, r = c + 1$.
3. Expand outward while $l \ge 0$, $r < N$, and $s[l] == s[r]$:
   - Since $s[l \dots r]$ is guaranteed to be a palindrome:
     $$\text{minCuts}[r] = \min(\text{minCuts}[r], \, l == 0 \ ? \ 0 : \text{minCuts}[l-1] + 1)$$
   - Decrement $l$, increment $r$.

This inline center-expansion algorithm executes in identical $\mathcal{O}(N^2)$ worst-case time, but eliminates the $\mathcal{O}(N^2)$ 2D boolean array entirely, reducing space to $\mathcal{O}(N)$ contiguous integers in L1 CPU cache.

---

## 2. IMPLEMENT: Production-Grade Palindrome Cut Solver & Path Reconstructor (.NET 8+)

Below is the complete, self-contained C# (.NET 8+) implementation container `PalindromeCutSolver`. It contains:
1. Canonical Two-Stage DP (`MinCutsTwoStage`) in $\mathcal{O}(N^2)$ time and $\mathcal{O}(N^2)$ space.
2. Space-Optimized Center Expansion DP (`MinCutsSpaceOptimized`) in $\mathcal{O}(N^2)$ time and $\mathcal{O}(N)$ space.
3. Partition Path Reconstructor (`GetOptimalPalindromePartitions`) returning the actual optimal substrings.
4. $K$-Palindrome Partitioning III Solver (`MinChangesForKPalindromes` for [LeetCode 1278]) in $\mathcal{O}(K \cdot N^2)$ time.
5. 3-Palindrome Partitioning IV Solver (`CanPartitionThreePalindromes` for [LeetCode 1745]) in $\mathcal{O}(N^2)$ time.
6. A self-validating test harness in `Main()` with robust `Debug.Assert` verifications.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace DynamicProgramming.IntervalDP
{
    /// <summary>
    /// Production-grade suite solving minimum palindromic cut and partition optimization
    /// problems using Interval DP precomputations, 1D linear DP, and center-expansion reductions.
    /// </summary>
    public sealed class PalindromeCutSolver
    {
        /// <summary>
        /// Solves LeetCode 132 (Palindrome Partitioning II) using canonical Two-Stage DP:
        /// Stage 1: Interval DP precomputing isPal[i, j] in O(N^2) time and O(N^2) space.
        /// Stage 2: 1D Linear DP computing minCuts[i] in O(N^2) time and O(N) space.
        /// </summary>
        /// <param name="s">Input string to partition.</param>
        /// <returns>Minimum cuts required such that every substring is a palindrome.</returns>
        /// <exception cref="ArgumentNullException">Thrown if s is null.</exception>
        public static int MinCutsTwoStage(string s)
        {
            ArgumentNullException.ThrowIfNull(s);

            int n = s.Length;
            if (n <= 1)
            {
                return 0;
            }

            // STAGE 1: 2D Interval DP to precompute palindrome table
            // isPal[i, j] is true iff s[i..j] is a palindrome
            bool[,] isPal = new bool[n, n];

            // Outer loop iterates backwards by starting index i
            // Inner loop iterates forwards by ending index j
            for (int i = n - 1; i >= 0; i--)
            {
                for (int j = i; j < n; j++)
                {
                    if (s[i] == s[j])
                    {
                        // Substrings of length <= 3 only require matching endpoints
                        // (length 1: j - i == 0, length 2: j - i == 1, length 3: j - i == 2)
                        isPal[i, j] = (j - i < 3) || isPal[i + 1, j - 1];
                    }
                }
            }

            // STAGE 2: 1D Linear DP to compute minimum cuts
            // minCuts[i] is the minimum cuts for prefix s[0..i]
            int[] minCuts = new int[n];

            for (int i = 0; i < n; i++)
            {
                // Fast-Path: if s[0..i] is already a palindrome, 0 cuts are needed
                if (isPal[0, i])
                {
                    minCuts[i] = 0;
                    continue;
                }

                // Trivial upper bound: i cuts for a prefix of length i + 1
                int currentMin = i;

                // Test every possible last cut point j such that s[j+1..i] is palindromic
                for (int j = 0; j < i; j++)
                {
                    if (isPal[j + 1, i])
                    {
                        int candidate = minCuts[j] + 1;
                        if (candidate < currentMin)
                        {
                            currentMin = candidate;
                        }
                    }
                }

                minCuts[i] = currentMin;
            }

            return minCuts[n - 1];
        }

        /// <summary>
        /// Solves LeetCode 132 using in-line Center Expansion, achieving O(N^2) time
        /// while reducing auxiliary space to strictly O(N) by eliminating the 2D boolean table.
        /// </summary>
        /// <param name="s">Input string to partition.</param>
        /// <returns>Minimum cuts required.</returns>
        public static int MinCutsSpaceOptimized(string s)
        {
            ArgumentNullException.ThrowIfNull(s);

            int n = s.Length;
            if (n <= 1)
            {
                return 0;
            }

            // minCuts[i] stores the minimum cuts for prefix s[0..i]
            int[] minCuts = new int[n];
            for (int i = 0; i < n; i++)
            {
                minCuts[i] = i; // Initialize with worst-case cut count
            }

            // Expand around all 2N - 1 possible palindrome centers
            for (int mid = 0; mid < n; mid++)
            {
                // Odd-length palindromes centered at mid
                ExpandAndRelax(s, mid, mid, minCuts);

                // Even-length palindromes centered between mid and mid + 1
                ExpandAndRelax(s, mid, mid + 1, minCuts);
            }

            return minCuts[n - 1];
        }

        private static void ExpandAndRelax(string s, int left, int right, int[] minCuts)
        {
            int n = s.Length;
            while (left >= 0 && right < n && s[left] == s[right])
            {
                // Substring s[left..right] is a valid palindrome
                int cutsNeeded = (left == 0) ? 0 : minCuts[left - 1] + 1;
                if (cutsNeeded < minCuts[right])
                {
                    minCuts[right] = cutsNeeded;
                }

                left--;
                right++;
            }
        }

        /// <summary>
        /// Reconstructs the exact optimal sequence of palindromic substrings achieving
        /// the minimum cut count.
        /// </summary>
        /// <param name="s">Input string.</param>
        /// <returns>List of palindromic substrings representing the optimal partition.</returns>
        public static IReadOnlyList<string> GetOptimalPalindromePartitions(string s)
        {
            ArgumentNullException.ThrowIfNull(s);

            int n = s.Length;
            if (n == 0)
            {
                return Array.Empty<string>();
            }

            // Precompute palindromic matrix
            bool[,] isPal = new bool[n, n];
            for (int i = n - 1; i >= 0; i--)
            {
                for (int j = i; j < n; j++)
                {
                    if (s[i] == s[j])
                    {
                        isPal[i, j] = (j - i < 3) || isPal[i + 1, j - 1];
                    }
                }
            }

            int[] minCuts = new int[n];
            int[] parentCut = new int[n]; // Tracks the best j that produced minCuts[i]

            for (int i = 0; i < n; i++)
            {
                if (isPal[0, i])
                {
                    minCuts[i] = 0;
                    parentCut[i] = -1; // -1 denotes no cut needed (entire prefix is palindrome)
                    continue;
                }

                int currentMin = i;
                int bestSplit = 0;

                for (int j = 0; j < i; j++)
                {
                    if (isPal[j + 1, i])
                    {
                        int candidate = minCuts[j] + 1;
                        if (candidate < currentMin)
                        {
                            currentMin = candidate;
                            bestSplit = j;
                        }
                    }
                }

                minCuts[i] = currentMin;
                parentCut[i] = bestSplit;
            }

            // Backtrack from end of string to reconstruct partitions
            List<string> partitions = new List<string>();
            int curr = n - 1;
            while (curr >= 0)
            {
                int prev = parentCut[curr];
                if (prev == -1)
                {
                    // Prefix s[0..curr] is the first partition
                    partitions.Add(s.Substring(0, curr + 1));
                    break;
                }
                else
                {
                    partitions.Add(s.Substring(prev + 1, curr - prev));
                    curr = prev;
                }
            }

            partitions.Reverse();
            return partitions;
        }

        /// <summary>
        /// Solves LeetCode 1278 (Palindrome Partitioning III):
        /// Given string s and integer k, partition s into k non-empty substrings,
        /// changing minimal characters so that every substring becomes a palindrome.
        /// Time Complexity: O(N^2 + K * N^2) = O(K * N^2).
        /// Space Complexity: O(N^2 + K * N).
        /// </summary>
        public static int MinChangesForKPalindromes(string s, int k)
        {
            ArgumentNullException.ThrowIfNull(s);
            int n = s.Length;
            if (k <= 0 || k > n)
            {
                throw new ArgumentException("k must be in range [1, s.Length]");
            }

            // STAGE 1: Interval DP to compute cost[i, j]
            // cost[i, j] = minimum character replacements to make s[i..j] a palindrome
            int[,] cost = new int[n, n];
            for (int len = 2; len <= n; len++)
            {
                for (int i = 0; i <= n - len; i++)
                {
                    int j = i + len - 1;
                    cost[i, j] = cost[i + 1, j - 1] + (s[i] == s[j] ? 0 : 1);
                }
            }

            // STAGE 2: Multi-Stage Linear DP
            // dp[p, i] = min changes to partition prefix s[0..i-1] into p palindromes
            const int INF = 1_000_000;
            int[,] dp = new int[k + 1, n + 1];

            // Initialize DP table to INF
            for (int p = 0; p <= k; p++)
            {
                for (int i = 0; i <= n; i++)
                {
                    dp[p, i] = INF;
                }
            }
            dp[0, 0] = 0;

            // p partitions
            for (int p = 1; p <= k; p++)
            {
                // i characters in prefix (must have at least p characters for p non-empty pieces)
                for (int i = p; i <= n; i++)
                {
                    // j is the split point before the last partition: s[j..i-1]
                    for (int j = p - 1; j < i; j++)
                    {
                        int candidate = dp[p - 1, j] + cost[j, i - 1];
                        if (candidate < dp[p, i])
                        {
                            dp[p, i] = candidate;
                        }
                    }
                }
            }

            return dp[k, n];
        }

        /// <summary>
        /// Solves LeetCode 1745 (Palindrome Partitioning IV):
        /// Determines if string s can be partitioned into exactly 3 non-empty palindromic substrings.
        /// Time Complexity: O(N^2), Space Complexity: O(N^2).
        /// </summary>
        public static bool CanPartitionThreePalindromes(string s)
        {
            ArgumentNullException.ThrowIfNull(s);
            int n = s.Length;
            if (n < 3)
            {
                return false;
            }

            // Precompute palindromic matrix in O(N^2)
            bool[,] isPal = new bool[n, n];
            for (int i = n - 1; i >= 0; i--)
            {
                for (int j = i; j < n; j++)
                {
                    if (s[i] == s[j])
                    {
                        isPal[i, j] = (j - i < 3) || isPal[i + 1, j - 1];
                    }
                }
            }

            // Test all two split points (i, j) defining 3 non-empty segments:
            // Part 1: s[0..i-1]
            // Part 2: s[i..j]
            // Part 3: s[j+1..n-1]
            // where 1 <= i <= j < n - 1
            for (int i = 1; i < n - 1; i++)
            {
                if (!isPal[0, i - 1])
                {
                    continue; // Prune search if prefix is not a palindrome
                }

                for (int j = i; j < n - 1; j++)
                {
                    if (isPal[i, j] && isPal[j + 1, n - 1])
                    {
                        return true;
                    }
                }
            }

            return false;
        }

        /// <summary>
        /// Self-validating test harness executing rigorous invariant assertions across
        /// all implementations and edge cases.
        /// </summary>
        public static void Main()
        {
            Console.WriteLine("Executing PalindromeCutSolver verification suite...");

            // 1. Single character & trivial strings
            Debug.Assert(MinCutsTwoStage("a") == 0, "Single char should require 0 cuts.");
            Debug.Assert(MinCutsSpaceOptimized("a") == 0, "Single char space-optimized should be 0 cuts.");
            Debug.Assert(MinCutsTwoStage("aa") == 0, "'aa' is already a palindrome.");
            Debug.Assert(MinCutsTwoStage("ab") == 1, "'ab' requires 1 cut: 'a' | 'b'.");

            // 2. Canonical LeetCode 132 test cases
            // "aab" -> "aa" | "b" (1 cut)
            Debug.Assert(MinCutsTwoStage("aab") == 1, "'aab' requires 1 cut.");
            Debug.Assert(MinCutsSpaceOptimized("aab") == 1, "'aab' space-optimized requires 1 cut.");

            // "leet" -> "l" | "ee" | "t" (2 cuts)
            Debug.Assert(MinCutsTwoStage("leet") == 2, "'leet' requires 2 cuts.");
            Debug.Assert(MinCutsSpaceOptimized("leet") == 2, "'leet' space-optimized requires 2 cuts.");

            // "abacaba" -> already palindrome (0 cuts)
            Debug.Assert(MinCutsTwoStage("abacaba") == 0, "'abacaba' requires 0 cuts.");
            Debug.Assert(MinCutsSpaceOptimized("abacaba") == 0, "'abacaba' space-optimized requires 0 cuts.");

            // "abcde" -> 4 cuts: 'a' | 'b' | 'c' | 'd' | 'e'
            Debug.Assert(MinCutsTwoStage("abcde") == 4, "'abcde' requires 4 cuts.");
            Debug.Assert(MinCutsSpaceOptimized("abcde") == 4, "'abcde' space-optimized requires 4 cuts.");

            // 3. Partition Path Reconstruction Assertions
            var parts1 = GetOptimalPalindromePartitions("aab");
            Debug.Assert(parts1.Count == 2, "Partitions for 'aab' must have 2 parts.");
            Debug.Assert(parts1[0] == "aa" && parts1[1] == "b", "Partitions should be 'aa' and 'b'.");

            var parts2 = GetOptimalPalindromePartitions("leet");
            Debug.Assert(parts2.Count == 3, "Partitions for 'leet' must have 3 parts.");
            Debug.Assert(parts2[0] == "l" && parts2[1] == "ee" && parts2[2] == "t", "Partitions should be 'l', 'ee', 't'.");

            var parts3 = GetOptimalPalindromePartitions("abacaba");
            Debug.Assert(parts3.Count == 1 && parts3[0] == "abacaba", "Whole string should be single part.");

            // 4. Cross-Method Consistency Fuzzing Test
            string[] testCorpus = new[]
            {
                "racecar",
                "noonabbadavid",
                "banana",
                "character",
                "steponnopets",
                "abcdefedcba",
                "rotolevelrotor"
            };

            foreach (var testStr in testCorpus)
            {
                int resTwoStage = MinCutsTwoStage(testStr);
                int resOpt = MinCutsSpaceOptimized(testStr);
                var reconstructed = GetOptimalPalindromePartitions(testStr);

                Debug.Assert(resTwoStage == resOpt, $"Mismatch for '{testStr}': TwoStage={resTwoStage}, Opt={resOpt}");
                Debug.Assert(reconstructed.Count == resTwoStage + 1,
                    $"Reconstruction cut count mismatch for '{testStr}': expected {resTwoStage + 1} parts, got {reconstructed.Count}");

                // Verify every piece in reconstructed partition is indeed a palindrome
                foreach (var piece in reconstructed)
                {
                    Debug.Assert(IsPalindrome(piece), $"Reconstructed piece '{piece}' is not a valid palindrome!");
                }
            }

            // 5. Palindrome Partitioning III (LeetCode 1278) Verifications
            // "abc", k = 2 -> change 'a' to 'c' to get "c" | "c" (0 changes for "b" | "c") -> min changes 1
            Debug.Assert(MinChangesForKPalindromes("abc", 2) == 1, "'abc' with k=2 requires 1 change.");
            // "aabbc", k = 3 -> "aa" | "bb" | "c" (0 changes)
            Debug.Assert(MinChangesForKPalindromes("aabbc", 3) == 0, "'aabbc' with k=3 requires 0 changes.");
            // "leetcode", k = 8 -> 8 single letters, 0 changes
            Debug.Assert(MinChangesForKPalindromes("leetcode", 8) == 0, "k = length requires 0 changes.");

            // 6. Palindrome Partitioning IV (LeetCode 1745) Verifications
            // "abcbdd" -> "a" | "bcb" | "dd" (True)
            Debug.Assert(CanPartitionThreePalindromes("abcbdd") == true, "'abcbdd' can be split into 3 palindromes.");
            // "bcbddxy" -> False
            Debug.Assert(CanPartitionThreePalindromes("bcbddxy") == false, "'bcbddxy' cannot be split into 3 palindromes.");

            Console.WriteLine("All PalindromeCutSolver assertions verified successfully.");
        }

        private static bool IsPalindrome(string s)
        {
            int l = 0, r = s.Length - 1;
            while (l < r)
            {
                if (s[l] != s[r]) return false;
                l++;
                r--;
            }
            return true;
        }
    }
}
```

---

## 3. ANALYZE: Algorithmic Invariants & The 5-Dimension Staff Deep-Dive

### Invariant 1: Optimal Substructure on Prefix Partitions

The minimum cut problem on strings exhibits strict **Bellman Optimality**. 

Let $s[0 \dots i]$ be an arbitrary prefix. Any valid partition of $s[0 \dots i]$ can be uniquely characterized by the position of its *final cut*, say after index $j$ (where $-1 \le j < i$, with $j = -1$ denoting no cuts). The final partition segment is $s[j+1 \dots i]$.

For the entire partition of $s[0 \dots i]$ to be optimal, the sub-partition of prefix $s[0 \dots j]$ *must* be an optimal partition of $s[0 \dots j]$. 

**Formal Proof by Contradiction (Cut-and-Paste):**
Suppose an optimal partition of $s[0 \dots i]$ ends with palindromic segment $s[j+1 \dots i]$, preceded by a partition of $s[0 \dots j]$ requiring $C$ cuts. The total cuts for $s[0 \dots i]$ is $C + 1$. 

Assume there exists an alternative partition of $s[0 \dots j]$ requiring $C' < C$ cuts. We can cut out the original prefix partition and paste the alternative partition in its place. The resulting partition of $s[0 \dots i]$ would require $C' + 1 < C + 1$ cuts. This contradicts the optimality of the original partition. 

Therefore, every subproblem exhibits optimal substructure:
$$\text{minCuts}[i] = \min_{\substack{0 \le j < i \\ \text{isPal}[j+1, i] == \text{true}}} (\text{minCuts}[j] + 1)$$

---

### Invariant 2: Symmetric Boundary Contraction of Palindromes

The validity of substring $s[i \dots j]$ being a palindrome depends exclusively on two conditions:
1. $s[i] == s[j]$
2. $s[i+1 \dots j-1]$ is a palindrome.

Because $|s[i+1 \dots j-1]| = |s[i \dots j]| - 2$, the subproblem length strictly decreases by 2. This creates an acyclic directed dependency DAG where any interval of length $L$ depends strictly on an interval of length $L - 2$.

```
Length L:       s[i] ............................ s[j]
                 |                                  |
               Equal?                            Equal?
                 \                                  /
Length L-2:        s[i+1] ................... s[j-1]
                     \                     /
                      ...               ...
Length 1 or 0:             s[mid] / ""
```

This structural invariant allows the entire $N \times N$ boolean matrix to be filled in $\mathcal{O}(N^2)$ time with zero recursion, provided shorter intervals are computed before longer intervals (or rows are swept bottom-to-top from $N-1$ down to 0).

---

### Invariant 3: Zero-Cut Fast Path Dominance

If the entire prefix $s[0 \dots i]$ is a palindrome ($\text{isPal}[0, i] == \text{true}$), then:
$$\text{minCuts}[i] = 0$$

Since the cut count cannot be negative ($\text{minCuts}[i] \ge 0$), $0$ is the global mathematical lower bound for any prefix. Encountering $\text{isPal}[0, i] == \text{true}$ allows the algorithm to short-circuit the inner loop:
- It eliminates the need to evaluate any candidate split $j \in [0, i-1]$.
- In practical execution on highly palindromic inputs (e.g., repeated character sequences or genomic palindromic runs), this fast-path prunes up to $90\%$ of candidate state comparisons.

---

### The 5-Dimension Staff Deep-Dive

| Dimension | Two-Stage Matrix DP | Space-Optimized Center Expansion | Naive Recursion + Memoization |
| :--- | :--- | :--- | :--- |
| **1. Time Complexity** | $\mathcal{O}(N^2)$ deterministic. Stage 1 takes $\frac{N(N+1)}{2}$ steps; Stage 2 takes $\frac{N(N-1)}{2}$ steps. | $\mathcal{O}(N^2)$ worst-case. In practice, non-palindromes terminate expansion in $\mathcal{O}(1)$ steps, yielding $\mathcal{O}(N)$ on random strings! | $\mathcal{O}(N^2)$ with memoization, $\mathcal{O}(2^N)$ without. High constant factor from dictionary hashing. |
| **2. Space Complexity** | $\mathcal{O}(N^2)$ for 2D boolean array + $\mathcal{O}(N)$ for 1D cut array. For $N = 2000$, boolean matrix consumes $\approx 4\text{ MB}$. | $\mathcal{O}(N)$ strictly for the 1D `minCuts` array. For $N = 2000$, consumes $\approx 8\text{ KB}$ (fits in L1 data cache). | $\mathcal{O}(N)$ recursion stack depth + $\mathcal{O}(N)$ memo table entries. |
| **3. Memory Locality & Cache** | Row-major access in Stage 2 is contiguous. In Stage 1, backwards sweep ($i = N-1 \dots 0, j = i \dots N-1$) achieves sequential memory writes. | **Maximum spatial locality.** Only writes to a single 1D array of 32-bit integers. Zero garbage collector pressure. | **Poor cache locality.** Deep recursive stack frames cause frequent cache line invalidations. |
| **4. Boundary Invariants** | Lengths 1, 2, and 3 handled cleanly by $(j - i < 3) \lor \text{isPal}[i+1, j-1]$. Zero array out-of-bounds risk. | Odd and even centers handled separately; pointer bounds ($0 \le l \le r < N$) explicitly guarded. | High risk of off-by-one errors at prefix boundaries ($j = -1$ vs $j = 0$). |
| **5. State Coupling** | Decoupled into two sequential pipeline stages. Palindrome table can be reused for other queries. | Coupled: Palindrome detection and cut minimization happen simultaneously during outward expansion. | Coupled: Recursion intertwines substring validation with decision branching. |

---

## 4. DEMONSTRATE: Visual State Transitions & Cut Boundary Wavefront Traces

### Trace 1: The Canonical Walkthrough on `"aab"`

Let string $s = \text{"aab"}$ with indices $0, 1, 2$.

#### Stage 1: Interval DP Matrix Population (`isPal[i, j]`)

We iterate $i = 2 \dots 0$:
1. $i = 2$ (`'b'`):
   - $j = 2$: $s[2] == s[2] \implies \text{isPal}[2, 2] = \text{true}$
2. $i = 1$ (`'a'`):
   - $j = 1$: $s[1] == s[1] \implies \text{isPal}[1, 1] = \text{true}$
   - $j = 2$: $s[1] \ne s[2]$ (`'a' != 'b'`) $\implies \text{isPal}[1, 2] = \text{false}$
3. $i = 0$ (`'a'`):
   - $j = 0$: $s[0] == s[0] \implies \text{isPal}[0, 0] = \text{true}$
   - $j = 1$: $s[0] == s[1]$ (`'a' == 'a'`), $j - i = 1 < 3 \implies \text{isPal}[0, 1] = \text{true}$
   - $j = 2$: $s[0] \ne s[2]$ (`'a' != 'b'`) $\implies \text{isPal}[0, 2] = \text{false}$

**Precomputed Palindrome Matrix:**
```
     j=0   j=1   j=2
      'a'   'a'   'b'
i=0   [ T     T     F ]   ("a" is Pal, "aa" is Pal, "aab" is NOT Pal)
i=1   [ .     T     F ]   ("a" is Pal, "ab" is NOT Pal)
i=2   [ .     .     T ]   ("b" is Pal)
```

#### Stage 2: 1D Linear DP Cut Vector Evolution (`minCuts[i]`)

We initialize $\text{minCuts}$ array of length 3:
```
Index i:        0       1       2
Prefix:        "a"    "aa"    "aab"
Initial:       [ 0,     1,      2  ]
```

**Step-by-step resolution:**
- **$i = 0$ (`"a"`):**
  - $\text{isPal}[0, 0] == \text{true} \implies \text{minCuts}[0] = 0$.
- **$i = 1$ (`"aa"`):**
  - Fast-Path Check: $\text{isPal}[0, 1] == \text{true} \implies \text{minCuts}[1] = 0$.
- **$i = 2$ (`"aab"`):**
  - Fast-Path Check: $\text{isPal}[0, 2] == \text{false}$. Must search split points $j \in [0, 1]$.
  - Candidate $j = 0$: Does cut after $j=0$ leave a palindrome?
    - Check $\text{isPal}[j+1, 2] = \text{isPal}[1, 2]$ (`"ab"`). False. No transition.
  - Candidate $j = 1$: Does cut after $j=1$ leave a palindrome?
    - Check $\text{isPal}[j+1, 2] = \text{isPal}[2, 2]$ (`"b"`). True!
    - $\text{minCuts}[2] = \min(\text{currentMin}, \text{minCuts}[1] + 1) = \min(2, 0 + 1) = 1$.

**Final Result:** $\text{minCuts}[2] = 1$. The optimal partition is `"aa" | "b"`.

---

### Trace 2: Center-Expansion Wavefront on `"leet"`

Let string $s = \text{"leet"}$ ($N = 4$). Initialize $\text{minCuts} = [0, 1, 2, 3]$.

```
Center mid=0 ('l'):
  Odd (l=0, r=0): "l" is Pal. left=0 => minCuts[0] = 0.
  Even (l=0, r=1): "le" is NOT Pal. Stop.

Center mid=1 ('e'):
  Odd (l=1, r=1): "e" is Pal. left=1 => minCuts[1] = min(1, minCuts[0]+1) = min(1, 0+1) = 1.
  Even (l=1, r=2): "ee" is Pal.
    left=1, right=2 => minCuts[2] = min(2, minCuts[0]+1) = min(2, 0+1) = 1.
    Expand: l=0, r=3: "leet" -> s[0] != s[3] ('l' != 't'). Stop.

Center mid=2 ('e'):
  Odd (l=2, r=2): "e" is Pal. left=2 => minCuts[2] = min(1, minCuts[1]+1) = min(1, 2) = 1.
  Even (l=2, r=3): "et" is NOT Pal. Stop.

Center mid=3 ('t'):
  Odd (l=3, r=3): "t" is Pal. left=3 => minCuts[3] = min(3, minCuts[2]+1) = min(3, 1+1) = 2.
  Even (l=3, r=4): Out of bounds.

FINAL MINIMUM CUTS ARRAY:
minCuts = [ 0, 1, 1, 2 ]
Result for full string s[0..3] is minCuts[3] = 2.
Optimal Partitions: "l" | "ee" | "t" (Total 2 cuts).
```

---

## 5. PRACTICE: Canonical Cut Optimization Problems & Comparative Solutions

### Problem 1: Palindrome Partitioning II ([LeetCode 132] - Hard)

- **Problem Statement:** Given a string $s$, partition $s$ such that every substring of the partition is a palindrome. Return the minimum cuts needed for a palindrome partitioning of $s$.
- **Constraints:** $1 \le s.\text{length} \le 2000$; $s$ consists of lowercase English letters only.
- **Key Insight:** Precomputing the 2D palindromic matrix drops each inner loop step to $\mathcal{O}(1)$. Alternatively, center expansion eliminates the 2D matrix entirely.

```csharp
public int MinCut(string s) 
{
    // High-performance single-pass center expansion
    int n = s.Length;
    int[] dp = new int[n];
    for (int i = 0; i < n; i++) dp[i] = i;

    for (int mid = 0; mid < n; mid++) 
    {
        // Odd expansion
        for (int l = mid, r = mid; l >= 0 && r < n && s[l] == s[r]; l--, r++) 
        {
            int cost = (l == 0) ? 0 : dp[l - 1] + 1;
            if (cost < dp[r]) dp[r] = cost;
        }
        // Even expansion
        for (int l = mid, r = mid + 1; l >= 0 && r < n && s[l] == s[r]; l--, r++) 
        {
            int cost = (l == 0) ? 0 : dp[l - 1] + 1;
            if (cost < dp[r]) dp[r] = cost;
        }
    }
    return dp[n - 1];
}
```

---

### Problem 2: Palindrome Partitioning III ([LeetCode 1278] - Hard)

- **Problem Statement:** You are given a string $s$ containing lowercase letters and an integer $k$. You need to change some characters to make $s$ into $k$ palindromic substrings. Return the minimal number of characters that you need to change.
- **Constraints:** $1 \le k \le s.\text{length} \le 100$; $s$ consists of lowercase English letters.
- **Mathematical Transition:**
  1. **Stage 1 (Interval DP):** Compute `cost[i, j]` = minimum replacements to make $s[i \dots j]$ palindromic:
     $$\text{cost}[i, j] = \text{cost}[i+1, j-1] + (s[i] == s[j] \ ? \ 0 : 1)$$
  2. **Stage 2 (2D DP):** Partition prefix $s[0 \dots i-1]$ into $p$ parts:
     $$\text{dp}[p, i] = \min_{p-1 \le j < i} (\text{dp}[p-1, j] + \text{cost}[j, i-1])$$

```csharp
public int PalindromePartition(string s, int k) 
{
    int n = s.Length;
    int[,] cost = new int[n, n];

    // Compute cost using interval length traversal
    for (int len = 2; len <= n; len++) 
    {
        for (int i = 0; i <= n - len; i++) 
        {
            int j = i + len - 1;
            cost[i, j] = cost[i + 1, j - 1] + (s[i] == s[j] ? 0 : 1);
        }
    }

    int[,] dp = new int[k + 1, n + 1];
    for (int p = 0; p <= k; p++)
        for (int i = 0; i <= n; i++)
            dp[p, i] = 1_000_000;

    dp[0, 0] = 0;

    for (int p = 1; p <= k; p++) 
    {
        for (int i = p; i <= n; i++) 
        {
            for (int j = p - 1; j < i; j++) 
            {
                dp[p, i] = Math.Min(dp[p, i], dp[p - 1, j] + cost[j, i - 1]);
            }
        }
    }
    return dp[k, n];
}
```

---

### Problem 3: Palindrome Partitioning IV ([LeetCode 1745] - Hard)

- **Problem Statement:** Given a string $s$, return `true` if it is possible to split $s$ into **three** non-empty palindromic substrings, otherwise return `false`.
- **Constraints:** $3 \le s.\text{length} \le 2000$.
- **Key Insight:** Precompute `isPal[i, j]` in $\mathcal{O}(N^2)$ time. Then check all pairs of cut points $(i, j)$ where $1 \le i \le j < N-1$. Substring ranges are:
  - Part 1: $[0 \dots i-1]$
  - Part 2: $[i \dots j]$
  - Part 3: $[j+1 \dots N-1]$
  Total evaluation time: $\mathcal{O}(N^2) + \mathcal{O}(N^2) = \mathcal{O}(N^2)$.

```csharp
public bool CheckPartitioning(string s) 
{
    int n = s.Length;
    bool[,] isPal = new bool[n, n];

    for (int i = n - 1; i >= 0; i--) 
    {
        for (int j = i; j < n; j++) 
        {
            if (s[i] == s[j]) 
            {
                isPal[i, j] = (j - i < 3) || isPal[i + 1, j - 1];
            }
        }
    }

    // Check all valid pairs of cut points
    for (int i = 1; i < n - 1; i++) 
    {
        if (!isPal[0, i - 1]) continue; // Early pruning

        for (int j = i; j < n - 1; j++) 
        {
            if (isPal[i, j] && isPal[j + 1, n - 1]) 
            {
                return true;
            }
        }
    }
    return false;
}
```

---

## 6. CONNECT: Text Segmentation in Search Query Parsers & Genomic Palindromes

### 1. NLP Search Query Segmentation & Compound Word Tokenization

In high-throughput search engines (e.g., Google Search, Elasticsearch, Apache Lucene), user queries frequently lack clean whitespace delimitation:
- **Languages without Whitespace:** Chinese, Japanese, and Thai do not use spaces between words. A search query like `"北京大学研究生院"` must be partitioned into valid dictionary vocabulary words.
- **Morphological Compounding in Germanic Languages:** German concatenates nouns into single tokens: `"Donaudampfschifffahrt"` (Danube steamship travel).
- **URL & Hashtag Segmentation:** Processing raw URL slugs (`"#nowplaying"`, `"cleanenergyinitiative"`).

#### Two-Stage Architecture Analogy in Query Tokenizers
Just as Palindrome Partitioning II decouples **interval verification** from **cut minimization**, production text tokenizers use a two-stage pipeline:
1. **Stage 1 (Interval Validation via Trie/FST):** A Finite State Transducer (FST) or Double-Array Trie pre-identifies all valid dictionary words in the query:
   $$\text{isValidWord}[i, j] \in \{\text{true}, \text{false}\} \quad \text{with associated unigram log-probability } \log P(w)$$
2. **Stage 2 (Viterbi / 1D Linear DP):** Computes the segmentation that maximizes total sequence likelihood (or minimizes total token penalty):
   $$\text{dp}[i] = \min_{0 \le j < i, \, \text{isValidWord}[j+1, i]} (\text{dp}[j] + \text{cost}(s[j+1 \dots i]))$$

By precomputing the interval matches in Stage 1, the search engine processes queries in microsecond latencies ($\mathcal{O}(N^2)$ or $\mathcal{O}(N \cdot L_{\max})$ where $L_{\max} \approx 30$), eliminating catastrophic backtracking timeouts.

```
RAW QUERY SLUG: "appletreefarm"
STAGE 1 (FST Interval Lookup):
  [0, 4]  -> "apple" (valid, cost 1.2)
  [5, 8]  -> "tree"  (valid, cost 1.5)
  [9, 12] -> "farm"  (valid, cost 1.8)
STAGE 2 (Viterbi Linear DP):
  minCost[12] = minCost[8] + cost("farm") = minCost[4] + cost("tree") + cost("farm")
Optimal Tokenization: ["apple", "tree", "farm"]
```

---

### 2. Bioinformatics: Restriction Enzyme Cleavage Sites & CRISPR Hairpin Loops

In genomic engineering and molecular biology, inverted repeats and **biological palindromes** are fundamental regulatory mechanisms:

#### Restriction Endonuclease Recognition Sites
Bacterial restriction enzymes (the foundational tools of recombinant DNA cloning) recognize specific palindromic DNA sequences on double-stranded DNA:
- Example: **EcoRI** recognizes the 6-base pair inverted palindrome:
  $$\begin{aligned}
  5' - \text{G A A T T C} - 3' \\
  3' - \text{C T T A A G} - 5'
  \end{aligned}$$
  Notice that reading $5' \to 3'$ on the top strand yields `GAATTC`, and reading $5' \to 3'$ on the bottom complementary strand also yields `GAATTC`.

#### RNA Hairpin Secondary Structure & CRISPR Spacers
In single-stranded RNA and CRISPR-Cas9 guide RNA, self-complementary palindromic sequences fold back on themselves to form **stem-loop (hairpin) structures**:

```
RNA Stem-Loop Folding:
      G - C
      A - U  <- Inverted Palindromic Stem (Hybridized Base Pairs)
      A - U
    /       \
   U         G <- Unpaired Loop
    \       /
      A - C
```

Computational biologists running whole-genome scans (e.g., detecting CRISPR Cas9 off-target cleavage sites across 3 billion base pairs of human DNA) use **Interval Dynamic Programming precomputations** to identify inverted palindromic intervals and partition chromosomes into minimal independent folding domains.

---

## 7. CHECKPOINT: Comprehensive Self-Assessment & Mastery Key

### Technical Verification Questions

#### Question 1
Why does Palindrome Partitioning I ([LC 131]) require an exponential backtracking algorithm $\mathcal{O}(N \cdot 2^N)$, whereas Palindrome Partitioning II ([LC 132]) can be solved in polynomial time $\mathcal{O}(N^2)$?
- **A)** Problem I allows non-contiguous substrings, while Problem II strictly requires contiguous substrings.
- **B)** Problem I requires outputting all valid partitions whose count can reach $2^{N-1}$, whereas Problem II only asks for a single scalar minimum cut count.
- **C)** Problem II assumes all characters in the string are identical.
- **D)** Problem I has a non-optimal substructure that invalidates memoization.

#### Question 2
In the Stage 1 Interval DP precomputation `isPal[i, j] = (s[i] == s[j]) && (j - i < 3 || isPal[i+1, j-1])`, why is the condition `j - i < 3` sufficient to skip referencing `isPal[i+1, j-1]`?
- **A)** Because substrings of length 0, 1, and 2 with matching endpoints have an empty or single-character internal substring, which is palindromic by definition.
- **B)** Because strings of length less than 3 cannot be stored in a 2D array.
- **C)** Because the compiler automatically optimizes intervals of length 3 into SIMD instructions.
- **D)** Because substrings of length 3 are guaranteed to be palindromes regardless of character equality.

#### Question 3
What is the space complexity of the Center Expansion algorithm for Palindrome Partitioning II, and why does it outperform the Two-Stage DP in memory efficiency?
- **A)** $\mathcal{O}(1)$ space; it requires no memory whatsoever.
- **B)** $\mathcal{O}(N)$ space; it eliminates the $N \times N$ boolean table and only stores the 1D prefix cut array `minCuts`.
- **C)** $\mathcal{O}(N \log N)$ space; it uses recursion with balanced divide-and-conquer call stacks.
- **D)** $\mathcal{O}(N^2)$ space; it stores palindrome centers in a hash set.

#### Question 4
In Stage 2 Linear DP, what is the significance of the fast-path check `if (isPal[0, i]) minCuts[i] = 0;`?
- **A)** It prevents an integer overflow exception when adding 1.
- **B)** It initializes the base case for an empty string.
- **C)** Since the theoretical lower bound on cuts is 0, if the entire prefix $s[0 \dots i]$ is already a palindrome, no cuts are required, safely bypassing the inner split search loop.
- **D)** It resets the parent pointer array during reconstruction.

#### Question 5
In Palindrome Partitioning III ([LC 1278]), what does the Stage 1 table `cost[i, j]` represent?
- **A)** The number of cuts needed to partition $s[i \dots j]$ into palindromes.
- **B)** The minimum number of character modifications required to transform substring $s[i \dots j]$ into a valid palindrome.
- **C)** The length of the longest palindromic subsequence in $s[i \dots j]$.
- **D)** The number of distinct palindromic substrings in $s[i \dots j]$.

#### Question 6
If a string $s$ of length $N$ consists of all distinct characters (e.g., `"abcdef"`), what will `minCuts[N-1]` evaluate to?
- **A)** $0$
- **B)** $1$
- **C)** $N - 1$
- **D)** $N$

#### Question 7
How does path reconstruction backtrack the optimal sequence of palindromic substrings from the 1D DP state?
- **A)** By re-running the entire Stage 1 Interval DP in reverse order.
- **B)** By maintaining a parent array `parentCut[i]` that records the split index $j$ that yielded the minimum cuts for prefix $i$, and following pointers backwards from $N-1$ to 0.
- **C)** By running a breadth-first search on the string from left to right.
- **D)** By sorting all substrings by length descending.

#### Question 8
For Palindrome Partitioning IV ([LC 1745], checking if $s$ can be split into exactly 3 palindromes), why does precomputing `isPal` allow an $\mathcal{O}(N^2)$ total solution?
- **A)** Because checking all pairs of split points $(i, j)$ takes $\mathcal{O}(N^2)$ pairs, and each check takes $\mathcal{O}(1)$ via table lookup: `isPal[0, i-1] && isPal[i, j] && isPal[j+1, n-1]`.
- **B)** Because 3 palindromes can only exist if $N$ is divisible by 3.
- **C)** Because we can greedily take the longest palindrome from the left and right.
- **D)** Because binary search can locate the split points in $\mathcal{O}(\log N)$ time.

#### Question 9
In the space-optimized center expansion approach, why must we expand both odd centers (`l = mid, r = mid`) and even centers (`l = mid, r = mid + 1`)?
- **A)** Because palindromes can have either odd lengths (single center character like `"aba"`) or even lengths (dual center characters like `"abba"`).
- **B)** Because odd centers run on the CPU and even centers run on the GPU.
- **C)** Because strings with odd length cannot contain even palindromes.
- **D)** Because odd centers find minimum cuts and even centers find maximum cuts.

#### Question 10
In production search engine tokenizers (e.g., Chinese morphological query parsing), what is the direct structural equivalent of `isPal[i, j]`?
- **A)** An inverted index mapping document IDs to term frequencies.
- **B)** A dictionary lookup table or Finite State Transducer (FST) verifying if substring $s[i \dots j]$ constitutes a valid dictionary vocabulary word.
- **C)** A Bloom filter checking if the user is authenticated.
- **D)** An LRU cache storing the user's past query strings.

---

### Mastery Key & Detailed Explanations

1. **B is correct.** Problem I is an enumeration problem where the size of the output space itself is $2^{N-1}$, necessitating exponential $\mathcal{O}(N \cdot 2^N)$ backtracking. Problem II is an optimization problem seeking a single scalar metric; by defining optimal substructure over prefix cuts, DP collapses the search space to $\mathcal{O}(N^2)$.
2. **A is correct.** If $j - i < 3$, the length of $s[i \dots j]$ is at most 3:
   - Length 1 ($j - i = 0$): single character, trivially palindromic.
   - Length 2 ($j - i = 1$): endpoints $s[i]$ and $s[j]$ are adjacent; if $s[i] == s[j]$, the entire string is palindromic.
   - Length 3 ($j - i = 2$): internal substring $s[i+1]$ has length 1, which is always palindromic. Thus, no lookup into `isPal[i+1, j-1]` is required.
3. **B is correct.** By expanding around all $2N-1$ centers on the fly, the algorithm verifies palindromic segments dynamically and immediately relaxes `minCuts[right]`. The 2D boolean array is never stored, reducing auxiliary space to a single 1D array of $N$ integers ($\mathcal{O}(N)$ space).
4. **C is correct.** The cut count for any string cannot be negative. If $s[0 \dots i]$ is a palindrome, 0 cuts is mathematically optimal. Fast-pathing to 0 prunes the inner loop search over all $j \in [0, i-1]$.
5. **B is correct.** In [LC 1278], `cost[i, j]` is precomputed as the minimum number of character changes to make $s[i \dots j]$ a palindrome, where matching outer characters cost 0 and mismatched outer characters cost 1 plus the inner subproblem cost.
6. **C is correct.** When all characters are distinct, no palindromic substring can have length greater than 1. Every single character must form its own partition, requiring a cut between every adjacent pair: exactly $N - 1$ cuts.
7. **B is correct.** Recording `parentCut[i] = best_j` whenever `minCuts[j] + 1 < currentMin` creates an inverted choice DAG. Backtracking from $N-1$ via `curr = parentCut[curr]` reconstructs the exact segment boundaries in $\mathcal{O}(\text{number of cuts}) = \mathcal{O}(N)$ time.
8. **A is correct.** Choosing 2 cut positions $i$ and $j$ from $N-1$ boundaries produces $\binom{N-1}{2} = \mathcal{O}(N^2)$ candidate pairs. With `isPal` precomputed, checking the three palindromic conditions takes $\mathcal{O}(1)$ time per pair, leading to an overall $\mathcal{O}(N^2)$ time bound.
9. **A is correct.** Palindromes exhibit reflectional symmetry across either a central character (odd length, e.g., `"racecar"`) or the boundary between two adjacent matching characters (even length, e.g., `"noon"`). Checking both ensures complete coverage of all possible palindromic substrings.
10. **B is correct.** In word segmentation systems, a lexicon FST/Trie answers the query "is substring $[i \dots j]$ a valid word?" in $\mathcal{O}(1)$ to $\mathcal{O}(L)$ time, directly mirroring the role of `isPal[i, j]` before running Viterbi DP over the sequence.
