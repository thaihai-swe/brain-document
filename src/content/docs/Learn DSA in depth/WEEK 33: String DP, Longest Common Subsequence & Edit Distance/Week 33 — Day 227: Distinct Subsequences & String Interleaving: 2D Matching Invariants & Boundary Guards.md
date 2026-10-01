---
title: "Week 33 — Day 227: Distinct Subsequences & String Interleaving: 2D Matching Invariants & Boundary Guards"
---

# Week 33 — Day 227: Distinct Subsequences & String Interleaving: 2D Matching Invariants & Boundary Guards

---

## 1. TEACH: Combinatorial Prefix Lattices, Inclusion-Exclusion & Index Conservation

In Days 225 and 226, our exploration of dual-sequence dynamic programming centered on **extremal optimization**—finding the *maximum* length of a shared sequence (LCS) or the *minimum* cost of string transformation (Edit Distance). Today, we shift paradigms into two distinct, high-frequency structural variants of string dynamic programming:
1. **Combinatorial Subsequence Counting** ([LeetCode 115] *Distinct Subsequences*): Rather than asking *whether* or *how long* a subsequence exists, we calculate the exact number of distinct combinatorial ways to form target string $t$ as a subsequence of source string $s$.
2. **Exact Multi-Sequence Interleaving Verification** ([LeetCode 97] *Interleaving String*): Rather than dropping characters, we verify whether string $s_3$ can be formed by a seamless, non-overlapping, order-preserving interleaving of strings $s_1$ and $s_2$.

Mastering these paradigms requires unravelling three foundational algorithmic mechanisms:
- **The Unconditional Exclusion Principle**: Understanding why in Distinct Subsequences, the previous prefix subproblem $\text{dp}[i-1][j]$ is *always* added, regardless of whether current characters match.
- **The Backward 1D Sweep Invariant**: Proving why sweeping a 1D rolling array from right to left ($j = N$ down to $1$) completely eliminates diagonal race conditions without requiring a temporary register.
- **The Spatial Index Conservation Invariant**: In string interleaving, establishing why any 2D coordinate $(i, j)$ corresponds to the strictly fixed index $k = i + j - 1$ in $s_3$.

```
COMBINATORIAL TRANSITION LATTICE (Distinct Subsequences):
Source s: "r a b b b i t" (M = 7)
Target t: "r a b b i t"   (N = 6)

When s[i-1] != t[j-1]:
                     (i-1, j)  [Exclude s[i-1]]
                        |
                        v
                     (i, j)    ===> dp[i][j] = dp[i-1][j]

When s[i-1] == t[j-1]:
    (i-1, j-1)       (i-1, j)  [Match s[i-1] OR Exclude s[i-1]]
         \              |
          \             |
           v            v
               (i, j)          ===> dp[i][j] = dp[i-1][j] + dp[i-1][j-1]
```

---

### 1.1 Distinct Subsequences: Combinatorial State Space & Boundary Invariants

Given a source string $s$ of length $M$ and a target string $t$ of length $N$, we seek the number of distinct subsequences of $s$ that equal $t$.

#### State Definition
Let $\text{dp}[i][j]$ denote the number of distinct subsequences of prefix $s[0 \dots i-1]$ that equal prefix $t[0 \dots j-1]$, defined over $0 \le i \le M$ and $0 \le j \le N$.

#### Boundary Invariants
1. **Target is Empty ($j = 0$):**
   An empty target string $t = \epsilon$ can be formed from any prefix $s[0 \dots i-1]$ in exactly **one way**: by deleting all characters in $s[0 \dots i-1]$.
   $$\text{dp}[i][0] = 1, \quad \forall \; 0 \le i \le M$$
2. **Source is Empty, Target is Non-Empty ($i = 0, j > 0$):**
   An empty source string $s = \epsilon$ has no characters to offer. It is impossible to form a non-empty string $t$ from an empty string.
   $$\text{dp}[0][j] = 0, \quad \forall \; 1 \le j \le N$$

---

### 1.2 The Distinct Subsequences Recurrence

At coordinate $(i, j)$, we consider whether character $s[i-1]$ participates in forming $t[j-1]$:

#### Choice 1: Exclude $s[i-1]$ (The Skip Option)
We can always choose to ignore character $s[i-1]$. In this case, the entire target prefix $t[0 \dots j-1]$ must be formed solely from the preceding prefix $s[0 \dots i-2]$.
The number of ways to do this is $\text{dp}[i-1][j]$.
*Notice: This option is available unconditionally, regardless of whether $s[i-1]$ equals $t[j-1]$!*

#### Choice 2: Include $s[i-1]$ (The Match Option)
If and only if $s[i-1] == t[j-1]$, we can use $s[i-1]$ to satisfy the last character of target prefix $t[0 \dots j-1]$. The remaining target prefix $t[0 \dots j-2]$ must then be formed from $s[0 \dots i-2]$.
The number of ways to do this is $\text{dp}[i-1][j-1]$.

#### The Unified Recurrence
By the Rule of Sum in combinatorics:
$$\text{dp}[i][j] = \text{dp}[i-1][j] + \begin{cases} 
\text{dp}[i-1][j-1], & \text{if } s[i-1] == t[j-1] \\ 
0, & \text{if } s[i-1] \neq t[j-1] 
\end{cases}$$

---

### 1.3 The Backward 1D Sweep: Eliminating Diagonal Registers

Notice the dependencies of $\text{dp}[i][j]$:
- It requires $\text{dp}[i-1][j]$ (the cell directly above in row $i-1$).
- It requires $\text{dp}[i-1][j-1]$ (the cell diagonally above-left in row $i-1$).

```
1D ROLLING ARRAY COMPRESSION:
If we update dp[j] in row-major order:
Sweeping Left-to-Right (j = 1 -> N):
  When evaluating dp[j], dp[j-1] was ALREADY overwritten with its row i value!
  The old row i-1 value is lost unless stored in a temporary register.

Sweeping Right-to-Left (j = N down to 1):
  When evaluating dp[j]:
  - dp[j] currently holds row i-1's value (Top neighbor).
  - dp[j-1] has NOT YET BEEN TOUCHED! It still holds row i-1's value (Top-left diagonal neighbor).
  Therefore:
  dp[j] = dp[j] + (s[i-1] == t[j-1] ? dp[j-1] : 0)
  No temporary variable is required!
```

#### Theorem 1 (Correctness of Backward Sweep)
*In the 1D rolling array compression of Distinct Subsequences, updating column $j$ in descending order from $N$ down to $1$ ensures that `dp[j-1]` strictly represents $\text{dp}[i-1][j-1]$ and `dp[j]` represents $\text{dp}[i-1][j]$ before the update.*

**Proof:**
During iteration $i$, let the 1D array initially hold the values from row $i-1$: $\text{dp}[k] = \text{dp}[i-1][k]$ for all $0 \le k \le N$.
When computing the new value for index $j$, only indices $k > j$ have been updated.
For all $k \le j$, $\text{dp}[k]$ remains untouched from row $i-1$.
Specifically:
- `dp[j]` holds $\text{dp}[i-1][j]$.
- `dp[j-1]` holds $\text{dp}[i-1][j-1]$.
The update `dp[j] += dp[j-1]` correctly executes the recurrence $\text{dp}[i][j] = \text{dp}[i-1][j] + \text{dp}[i-1][j-1]$.
Once updated, `dp[j]` now holds $\text{dp}[i][j]$, which will never be read by any subsequent step in row $i$ because future steps only evaluate indices $j' < j$.
Hence, no state is prematurely destroyed.
$\blacksquare$

---

### 1.4 Interleaving String ([LeetCode 97]): Spatial Index Conservation

In [LeetCode 97], we are given strings $s_1$ (length $M$), $s_2$ (length $N$), and $s_3$ (length $L$). We must determine whether $s_3$ can be formed by interleaving $s_1$ and $s_2$.

#### The Cardinal Length Invariant
An interleaving preserves every character of both source strings without duplication or omission. Therefore, a necessary condition for interleaving is:
$$|s_1| + |s_2| == |s_3| \iff M + N == L$$
If $M + N \neq L$, the function must immediately return `false` in $O(1)$ time.

#### The Spatial Index Conservation Invariant
When matching prefixes $s_1[0 \dots i-1]$ and $s_2[0 \dots j-1]$, the total number of characters consumed is precisely $i + j$.
Therefore, these characters must account for the first $i + j$ characters of $s_3$, specifically prefix $s_3[0 \dots i+j-1]$.
The character in $s_3$ that must be matched at coordinate $(i, j)$ is **strictly fixed** to index:
$$k = i + j - 1$$

#### State Definition & Recurrence
Let $\text{dp}[i][j]$ be a boolean flag indicating whether $s_3[0 \dots i+j-1]$ is a valid interleaving of $s_1[0 \dots i-1]$ and $s_2[0 \dots j-1]$.

- **Base Case:** $\text{dp}[0][0] = \text{true}$ (empty strings interleave to form an empty string).
- **Row 0 ($i = 0$):** Matches $s_2$ exclusively against $s_3$:
  $$\text{dp}[0][j] = \text{dp}[0][j-1] \land (s_2[j-1] == s_3[j-1])$$
- **Col 0 ($j = 0$):** Matches $s_1$ exclusively against $s_3$:
  $$\text{dp}[i][0] = \text{dp}[i-1][0] \land (s_1[i-1] == s_3[i-1])$$
- **Interior Cells ($i \ge 1, j \ge 1$):**
  We can reach $(i, j)$ by taking $s_1[i-1]$ (from top) OR by taking $s_2[j-1]$ (from left):
  $$\text{dp}[i][j] = \left(\text{dp}[i-1][j] \land s_1[i-1] == s_3[i+j-1]\right) \;\lor\; \left(\text{dp}[i][j-1] \land s_2[j-1] == s_3[i+j-1]\right)$$

```
INTERLEAVING REACHABILITY GRAPH:
s1 = "a b"
s2 = "c d"
s3 = "a c b d"

                  j=0 (eps)       j=1 ('c')       j=2 ('d')
i=0 (eps)         [ TRUE  ] ====> [ FALSE ]       [ FALSE ]
                     |
                   s1[0]='a'
                     v
i=1 ('a')         [ TRUE  ] ====> [ TRUE  ] ====> [ FALSE ]
                                     |
                                   s1[1]='b'
                                     v
i=2 ('b')         [ FALSE ]       [ TRUE  ] ====> [ TRUE  ] (TARGET!)
```

---

## 2. IMPLEMENT: Production-Grade String Sequence Counting & Interleaving Engine (.NET 8+)

Below is the complete, production-grade C# (.NET 8+) implementation encapsulated in `StringSequenceCountingEngine`. It provides:
1. `NumDistinctTabulated`: Full 2D DP matrix solver with 64-bit unsigned integer accumulators to prevent overflow.
2. `NumDistinctSpaceOptimized`: $O(N)$ backward 1D sweep solver with zero temporary registers.
3. `IsInterleaveTabulated`: Full 2D boolean reachability matrix solver.
4. `IsInterleaveSpaceOptimized`: $O(\min(M, N))$ forward 1D rolling array solver with dimension swapping.
5. Defensive parameter checks, `ReadOnlySpan<char>` slicing, and a comprehensive self-validating test harness in `Main()`.

```csharp
using System;
using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace DynamicProgrammingMastery.Week33
{
    /// <summary>
    /// Production-grade computational engine for combinatorial subsequence counting,
    /// backward 1D rolling array compressions, and multi-string interleaving verifications.
    /// </summary>
    public static class StringSequenceCountingEngine
    {
        // =========================================================================
        // 1. LEETCODE 115: DISTINCT SUBSEQUENCES (TABULATION & 1D BACKWARD SWEEP)
        // =========================================================================

        /// <summary>
        /// Computes the number of distinct subsequences of s which equal t using a full 2D table.
        /// Employs 64-bit unsigned integers (ulong) to prevent intermediate integer overflow.
        /// Time Complexity: O(M * N), Space Complexity: O(M * N).
        /// </summary>
        /// <param name="s">Source string.</param>
        /// <param name="t">Target subsequence string.</param>
        /// <returns>Count of distinct subsequences fitting within 32-bit signed integer.</returns>
        public static int NumDistinctTabulated(string s, string t)
        {
            ValidateStrings(s, t);
            int m = s.Length;
            int n = t.Length;

            if (m < n) return 0;
            if (n == 0) return 1;

            // Use ulong to guard against intermediate arithmetic overflow
            ulong[,] dp = new ulong[m + 1, n + 1];

            // Base case: empty target t can be formed from any prefix of s in 1 way
            for (int i = 0; i <= m; i++)
            {
                dp[i, 0] = 1;
            }

            for (int i = 1; i <= m; i++)
            {
                char sc = s[i - 1];
                for (int j = 1; j <= n; j++)
                {
                    // Unconditional skip option: exclude s[i-1]
                    dp[i, j] = dp[i - 1, j];

                    // Match option: include s[i-1] if it matches t[j-1]
                    if (sc == t[j - 1])
                    {
                        dp[i, j] += dp[i - 1, j - 1];
                    }
                }
            }

            // LeetCode guarantees the final result fits in a standard 32-bit int
            return dp[m, n] > int.MaxValue ? int.MaxValue : (int)dp[m, n];
        }

        /// <summary>
        /// Computes the number of distinct subsequences using an O(N) rolling array.
        /// Sweeps column j strictly backward (N down to 1) to eliminate diagonal race conditions.
        /// Time Complexity: O(M * N), Space Complexity: O(N).
        /// </summary>
        public static int NumDistinctSpaceOptimized(string s, string t)
        {
            ValidateStrings(s, t);
            int m = s.Length;
            int n = t.Length;

            if (m < n) return 0;
            if (n == 0) return 1;

            ulong[] dp = new ulong[n + 1];
            dp[0] = 1; // Empty target can always be formed in 1 way

            for (int i = 1; i <= m; i++)
            {
                char sc = s[i - 1];
                // CRITICAL: Sweep backward to access dp[j-1] from row i-1 before it is updated!
                for (int j = n; j >= 1; j--)
                {
                    if (sc == t[j - 1])
                    {
                        dp[j] += dp[j - 1];
                    }
                    // When sc != t[j-1], dp[j] remains unchanged (dp[j] = dp[j]),
                    // naturally preserving the unconditional exclusion term dp[i-1][j]!
                }
            }

            return dp[n] > int.MaxValue ? int.MaxValue : (int)dp[n];
        }

        // =========================================================================
        // 2. LEETCODE 97: INTERLEAVING STRING (TABULATION & 1D FORWARD SWEEP)
        // =========================================================================

        /// <summary>
        /// Determines whether s3 is formed by an interleaving of s1 and s2 using full 2D DP.
        /// Time Complexity: O(M * N), Space Complexity: O(M * N).
        /// </summary>
        public static bool IsInterleaveTabulated(string s1, string s2, string s3)
        {
            ValidateThreeStrings(s1, s2, s3);
            int m = s1.Length;
            int n = s2.Length;

            // Cardinal Length Invariant: characters must be strictly conserved
            if (m + n != s3.Length)
                return false;

            bool[,] dp = new bool[m + 1, n + 1];
            dp[0, 0] = true;

            // Initialize Row 0 (matching s2 exclusively against s3)
            for (int j = 1; j <= n; j++)
            {
                dp[0, j] = dp[0, j - 1] && (s2[j - 1] == s3[j - 1]);
            }

            // Initialize Col 0 (matching s1 exclusively against s3)
            for (int i = 1; i <= m; i++)
            {
                dp[i, 0] = dp[i - 1, 0] && (s1[i - 1] == s3[i - 1]);
            }

            // Interior Reachability
            for (int i = 1; i <= m; i++)
            {
                char c1 = s1[i - 1];
                for (int j = 1; j <= n; j++)
                {
                    char c2 = s2[j - 1];
                    char c3 = s3[i + j - 1]; // Spatial Index Conservation Invariant: k = i + j - 1

                    bool takeFromS1 = dp[i - 1, j] && (c1 == c3);
                    bool takeFromS2 = dp[i, j - 1] && (c2 == c3);

                    dp[i, j] = takeFromS1 || takeFromS2;
                }
            }

            return dp[m, n];
        }

        /// <summary>
        /// Determines whether s3 is an interleaving of s1 and s2 using an O(min(M, N)) rolling array.
        /// Time Complexity: O(M * N), Space Complexity: O(min(M, N)).
        /// </summary>
        public static bool IsInterleaveSpaceOptimized(string s1, string s2, string s3)
        {
            ValidateThreeStrings(s1, s2, s3);

            if (s1.Length + s2.Length != s3.Length)
                return false;

            // Symmetrical optimization: ensure s2 is the shorter string
            if (s1.Length < s2.Length)
            {
                (s1, s2) = (s2, s1);
            }

            int m = s1.Length;
            int n = s2.Length;

            bool[] dp = new bool[n + 1];
            dp[0] = true;

            // Initialize Row 0
            for (int j = 1; j <= n; j++)
            {
                dp[j] = dp[j - 1] && (s2[j - 1] == s3[j - 1]);
            }

            // Forward sweep across rows
            for (int i = 1; i <= m; i++)
            {
                char c1 = s1[i - 1];
                // Update column 0: can we extend vertically from dp[0]?
                dp[0] = dp[0] && (c1 == s3[i - 1]);

                for (int j = 1; j <= n; j++)
                {
                    char c2 = s2[j - 1];
                    char c3 = s3[i + j - 1];

                    // dp[j] holds top neighbor (dp[i-1][j]) before overwrite.
                    // dp[j-1] holds left neighbor (dp[i][j-1]) updated in this row.
                    bool takeFromS1 = dp[j] && (c1 == c3);
                    bool takeFromS2 = dp[j - 1] && (c2 == c3);

                    dp[j] = takeFromS1 || takeFromS2;
                }
            }

            return dp[n];
        }

        // =========================================================================
        // DEFENSIVE VALIDATION
        // =========================================================================

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static void ValidateStrings(string s, string t)
        {
            if (s == null) throw new ArgumentNullException(nameof(s), "Source string cannot be null.");
            if (t == null) throw new ArgumentNullException(nameof(t), "Target string cannot be null.");
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static void ValidateThreeStrings(string s1, string s2, string s3)
        {
            if (s1 == null) throw new ArgumentNullException(nameof(s1), "String s1 cannot be null.");
            if (s2 == null) throw new ArgumentNullException(nameof(s2), "String s2 cannot be null.");
            if (s3 == null) throw new ArgumentNullException(nameof(s3), "String s3 cannot be null.");
        }

        // =========================================================================
        // SELF-VALIDATING TEST SUITE (MAIN ENTRY POINT)
        // =========================================================================

        public static void Main()
        {
            Console.WriteLine("================================================================");
            Console.WriteLine(" RUNNING DISTINCT SUBSEQUENCES & INTERLEAVING VALIDATION SUITE ");
            Console.WriteLine("================================================================\n");

            TestDistinctSubsequencesBasic();
            TestDistinctSubsequencesSpaceOptimized();
            TestInterleavingStringBasic();
            TestInterleavingSpaceOptimized();
            TestEdgeCases();

            Console.WriteLine("\n[SUCCESS] ALL DISTINCT SUBSEQUENCES & INTERLEAVING TESTS PASSED RIGOROUSLY!");
        }

        private static void TestDistinctSubsequencesBasic()
        {
            Console.WriteLine("--> Test 1: Canonical LeetCode 115 Scenarios...");

            // Example 1: s = "rabbbit", t = "rabbit" -> 3
            // 3 different ways to remove one 'b' from "rabbbit"
            int ways1 = NumDistinctTabulated("rabbbit", "rabbit");
            Console.WriteLine($"   NumDistinct('rabbbit', 'rabbit') = {ways1} (Expected: 3)");
            Debug.Assert(ways1 == 3);

            // Example 2: s = "babgbag", t = "bag" -> 5
            int ways2 = NumDistinctTabulated("babgbag", "bag");
            Console.WriteLine($"   NumDistinct('babgbag', 'bag') = {ways2} (Expected: 5)");
            Debug.Assert(ways2 == 5);

            // Disjoint strings
            Debug.Assert(NumDistinctTabulated("abcdef", "xyz") == 0);

            // Target longer than source
            Debug.Assert(NumDistinctTabulated("short", "verylongtarget") == 0);

            Console.WriteLine("   [PASSED]");
        }

        private static void TestDistinctSubsequencesSpaceOptimized()
        {
            Console.WriteLine("--> Test 2: Space-Optimized O(N) vs Full Tabulation...");

            (string S, string T)[] testCases = new[]
            {
                ("rabbbit", "rabbit"),
                ("babgbag", "bag"),
                ("aabdbaabeeadcbbdedacbbeecbabebaeeecaeabadadcbdbcdaebbeedadbaccbaeddcecbeadecdbbbdaedaadbeacbbaeabbaaccbabcbae", "bddabdcae"),
                ("ABCDE", "ACE"),
                ("AAAAAA", "AA") // Combinatorial (6 choose 2) = 15
            };

            foreach (var (src, tgt) in testCases)
            {
                int tabResult = NumDistinctTabulated(src, tgt);
                int optResult = NumDistinctSpaceOptimized(src, tgt);

                Console.WriteLine($"   '{src.Substring(0, Math.Min(src.Length, 15))}...' vs '{tgt}': Tab={tabResult}, Opt={optResult}");
                Debug.Assert(tabResult == optResult, $"Mismatch on case '{src}' vs '{tgt}': {tabResult} != {optResult}");
            }

            Console.WriteLine("   [PASSED]");
        }

        private static void TestInterleavingStringBasic()
        {
            Console.WriteLine("--> Test 3: Canonical LeetCode 97 Interleaving Scenarios...");

            // Example 1: s1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac" -> true
            bool res1 = IsInterleaveTabulated("aabcc", "dbbca", "aadbbcbcac");
            Console.WriteLine($"   IsInterleave('aabcc', 'dbbca', 'aadbbcbcac') = {res1} (Expected: true)");
            Debug.Assert(res1 == true);

            // Example 2: s1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc" -> false
            bool res2 = IsInterleaveTabulated("aabcc", "dbbca", "aadbbbaccc");
            Console.WriteLine($"   IsInterleave('aabcc', 'dbbca', 'aadbbbaccc') = {res2} (Expected: false)");
            Debug.Assert(res2 == false);

            // Example 3: Empty strings
            bool res3 = IsInterleaveTabulated("", "", "");
            Debug.Assert(res3 == true);

            Console.WriteLine("   [PASSED]");
        }

        private static void TestInterleavingSpaceOptimized()
        {
            Console.WriteLine("--> Test 4: Interleaving Space-Optimized O(min(M, N)) vs Tabulation...");

            (string S1, string S2, string S3)[] cases = new[]
            {
                ("aabcc", "dbbca", "aadbbcbcac"),
                ("aabcc", "dbbca", "aadbbbaccc"),
                ("", "abc", "abc"),
                ("abc", "", "abc"),
                ("a", "b", "ab"),
                ("a", "b", "ba"),
                ("aa", "ab", "aaba"),
                ("aa", "ab", "abaa")
            };

            foreach (var (s1, s2, s3) in cases)
            {
                bool tab = IsInterleaveTabulated(s1, s2, s3);
                bool opt = IsInterleaveSpaceOptimized(s1, s2, s3);

                Debug.Assert(tab == opt, $"Mismatch on '{s1}', '{s2}', '{s3}': Tab={tab}, Opt={opt}");
            }

            Console.WriteLine("   [PASSED]");
        }

        private static void TestEdgeCases()
        {
            Console.WriteLine("--> Test 5: Length Invariants & Boundary Cases...");

            // Length mismatch must return false immediately
            Debug.Assert(IsInterleaveSpaceOptimized("abc", "def", "abcdefg") == false);
            Debug.Assert(IsInterleaveSpaceOptimized("abc", "def", "abcde") == false);

            // Empty target in Distinct Subsequences
            Debug.Assert(NumDistinctSpaceOptimized("anything", "") == 1);
            Debug.Assert(NumDistinctSpaceOptimized("", "") == 1);
            Debug.Assert(NumDistinctSpaceOptimized("", "nonempty") == 0);

            Console.WriteLine("   [PASSED]");
        }
    }
}
```

---

## 3. ANALYZE: Algorithmic Invariants & 5-Dimension Deep-Dive

To achieve Staff-level mastery over sequence counting and interleaving verification, we examine their microarchitectural profiles and compare their structural memory models.

### Algorithmic Comparison Across Sequence Verification Architectures

| Characteristic | Distinct Subsequences Tabulated | Distinct Subsequences 1D | Interleaving String Tabulated | Interleaving String 1D |
| :--- | :--- | :--- | :--- | :--- |
| **Problem Type** | Combinatorial Counting | Combinatorial Counting | Boolean Reachability | Boolean Reachability |
| **Time Complexity** | $O(M \times N)$ | $O(M \times N)$ | $O(M \times N)$ | $O(M \times N)$ |
| **Auxiliary Space** | $O(M \times N)$ (64-bit words) | **$O(N)$ (64-bit words)** | $O(M \times N)$ (booleans) | **$O(\min(M, N))$ (booleans)** |
| **Sweep Direction** | Row-major left-to-right | **Row-major RIGHT-TO-LEFT** | Row-major left-to-right | **Row-major LEFT-TO-RIGHT** |
| **Diagonal Register?**| Not needed (in 2D matrix) | **Not needed (backward sweep)**| Not needed (in 2D matrix) | **Not needed (short-circuit logic)**|
| **Overflow Hazard?** | **High** (requires `ulong`) | **High** (requires `ulong`) | None (Boolean states) | None (Boolean states) |

---

### 5-Dimension Deep-Dive

#### 1. Arithmetic & Register Dynamics: Why the Sweep Directions Invert
Compare the inner update operations of the two algorithms:

1. **Distinct Subsequences:**
   $$\text{dp}[j] = \text{dp}[j] + \text{dp}[j-1]$$
   - To compute new $\text{dp}[j]$, we require the old (row $i-1$) value of $\text{dp}[j-1]$.
   - Sweeping **right-to-left** ($j = N \to 1$) ensures that $\text{dp}[j-1]$ has not been overwritten yet. 
   - A single CPU arithmetic addition instruction (`add rax, rdx`) executes without branching.

2. **Interleaving String:**
   $$\text{dp}[j] = (\text{dp}[j] \land s_1[i-1] == s_3[i+j-1]) \lor (\text{dp}[j-1] \land s_2[j-1] == s_3[i+j-1])$$
   - Notice that the second term reads $\text{dp}[j-1]$. But this $\text{dp}[j-1]$ is the **left neighbor from the CURRENT row $i$**, NOT row $i-1$!
   - In 2D table coordinates, moving right corresponds to picking a character from $s_2$. The left neighbor is $\text{dp}[i][j-1]$.
   - Therefore, $\text{dp}[j-1]$ **MUST BE OVERWRITTEN FIRST** for row $i$!
   - Hence, Interleaving String **MUST SWEEP LEFT-TO-RIGHT** ($j = 1 \to N$).

```
SWEEP DIRECTION CONTRAST:
Distinct Subsequences: Requires dp[i-1][j-1] (Top-Left)  ===> MUST SWEEP RIGHT-TO-LEFT (<-)
Interleaving String  : Requires dp[i][j-1]   (Left)      ===> MUST SWEEP LEFT-TO-RIGHT (->)
```

#### 2. Memory Topology & Integer Overflow Defenses
In Distinct Subsequences ([LC 115]), identical character repetitions can cause combinatorial explosion.
Consider $s = \text{"a"}^{100}$ and $t = \text{"a"}^{50}$.
The total number of distinct subsequences is given by the binomial coefficient:
$$\binom{100}{50} \approx 1.0089 \times 10^{29}$$
- This number vastly exceeds standard 32-bit signed integers ($2.14 \times 10^9$) and 64-bit unsigned integers ($1.84 \times 10^{19}$).
- In standard C#, executing unchecked 32-bit additions causes silent overflow and wrap-around into negative numbers.
- While LeetCode 115 guarantees that test cases resulting in valid answers fit into a 32-bit signed integer, **intermediate cells along unrelated branches can easily exceed $2^{31} - 1$** before being discarded or trimmed.
- Using 64-bit unsigned integers (`ulong`) prevents premature arithmetic faults in intermediate cells.

#### 3. Structural Failure Modes & Edge Cases
- **Length Discrepancy in Interleaving String**: If $|s_1| + |s_2| \neq |s_3|$, the function must immediately return `false`. Failing to check this leads to out-of-bounds indexing when referencing $s_3[i + j - 1]$.
- **Empty String Combinations**:
  - `IsInterleave("", "", "") == true`
  - `NumDistinct("any", "") == 1` (the empty target is matched by deleting everything).
  - `NumDistinct("", "any") == 0` (cannot form non-empty target from empty source).
- **Target Longer Than Source**: In Distinct Subsequences, if $|s| < |t|$, immediately return `0` without allocating tables.

#### 4. Hardware & Microarchitectural Considerations: Branch Prediction in Boolean Chains
In `IsInterleaveSpaceOptimized`:
```csharp
bool takeFromS1 = dp[j] && (c1 == c3);
bool takeFromS2 = dp[j - 1] && (c2 == c3);
dp[j] = takeFromS1 || takeFromS2;
```
- In C#, the `&&` and `||` operators perform **short-circuit evaluation**, compiling to conditional branch instructions.
- If reachability flags fluctuate rapidly, hardware branch predictors encounter high misprediction rates ($15–20\%$ branch miss rate).
- In high-throughput streaming systems, replacing short-circuit logic with bitwise operations (`takeFromS1 = dp[j] & (c1 == c3); dp[j] = takeFromS1 | takeFromS2;`) eliminates branches completely, replacing them with single-cycle bitwise `AND`/`OR` instructions.

#### 5. Staff-Level Production Trade-offs: Dynamic Programming vs. Trie-Based Stream Matching
When monitoring live telemetry or network packet logs for target substring/subsequence patterns:
- If a target pattern is static and source streams arrive indefinitely, storing a full 2D DP matrix per connection consumes gigabytes of RAM.
- Building an **Aho-Corasick Automaton** or **Prefix Tree (Trie)** processes streaming inputs in strictly $O(1)$ time per ingested byte, maintaining only a single state pointer rather than a rolling array.
- Dynamic programming is optimal for offline pair-wise sequence audits, whereas finite state transducers dominate real-time event streaming.

---

## 4. DEMONSTRATE: Visual State Transitions & Reachability Grids

To solidify your visual intuition, we trace both algorithms on canonical interview inputs.

### 4.1 Distinct Subsequences Trace: `s = "rabbbit"`, `t = "rabbit"`

```
Source: s = "rabbbit" (M = 7)
Target: t = "rabbit"  (N = 6)

Row 0 initialized to: dp[0] = 1, all others 0.
Initial 1D Array:
Index:    0    1('r')  2('a')  3('b')  4('b')  5('i')  6('t')
dp:     [ 1,     0,      0,      0,      0,      0,      0   ]
```

#### Iteration 1: $s[0] = \text{'r'}$
Sweep $j = 6 \to 1$:
- Matches $t[0] = \text{'r'}$ at $j = 1$: `dp[1] += dp[0] = 0 + 1 = 1`.
```
dp: [ 1,  1,  0,  0,  0,  0,  0 ]
```

#### Iteration 2: $s[1] = \text{'a'}$
Sweep $j = 6 \to 1$:
- Matches $t[1] = \text{'a'}$ at $j = 2$: `dp[2] += dp[1] = 0 + 1 = 1`.
```
dp: [ 1,  1,  1,  0,  0,  0,  0 ]
```

#### Iteration 3: $s[2] = \text{'b'}$ (First 'b' in source)
Sweep $j = 6 \to 1$:
- Matches $t[3] = \text{'b'}$ at $j = 4$: `dp[4] += dp[3] = 0 + 0 = 0`.
- Matches $t[2] = \text{'b'}$ at $j = 3$: `dp[3] += dp[2] = 0 + 1 = 1`.
```
dp: [ 1,  1,  1,  1,  0,  0,  0 ]
```

#### Iteration 4: $s[3] = \text{'b'}$ (Second 'b' in source)
Sweep $j = 6 \to 1$:
- Matches $t[3] = \text{'b'}$ at $j = 4$: `dp[4] += dp[3] = 0 + 1 = 1`.
- Matches $t[2] = \text{'b'}$ at $j = 3$: `dp[3] += dp[2] = 1 + 1 = 2`.
```
dp: [ 1,  1,  1,  2,  1,  0,  0 ]
```

#### Iteration 5: $s[4] = \text{'b'}$ (Third 'b' in source)
Sweep $j = 6 \to 1$:
- Matches $t[3] = \text{'b'}$ at $j = 4$: `dp[4] += dp[3] = 1 + 2 = 3`.
- Matches $t[2] = \text{'b'}$ at $j = 3$: `dp[3] += dp[2] = 2 + 1 = 3`.
```
dp: [ 1,  1,  1,  3,  3,  0,  0 ]
```

#### Iteration 6: $s[5] = \text{'i'}$
Sweep $j = 6 \to 1$:
- Matches $t[4] = \text{'i'}$ at $j = 5$: `dp[5] += dp[4] = 0 + 3 = 3`.
```
dp: [ 1,  1,  1,  3,  3,  3,  0 ]
```

#### Iteration 7: $s[6] = \text{'t'}$
Sweep $j = 6 \to 1$:
- Matches $t[5] = \text{'t'}$ at $j = 6$: `dp[6] += dp[5] = 0 + 3 = 3`.
```
dp: [ 1,  1,  1,  3,  3,  3,  3 ]
```

**Final Answer:** `dp[6] = 3`.
Notice how the backward sweep allowed index $j = 4$ to read `dp[3]` from the previous row before `dp[3]` itself was incremented!

---

### 4.2 Interleaving String Trace: `s1 = "aabcc"`, `s2 = "dbbca"`, `s3 = "aadbbcbcac"`

```
s1 = "aabcc" (M = 5)
s2 = "dbbca" (N = 5)
s3 = "aadbbcbcac" (L = 10, M + N == L)

COMPLETED 2D BOOLEAN REACHABILITY MATRIX:
            eps(0)  'd'(1)  'b'(2)  'b'(3)  'c'(4)  'a'(5)
eps(0)    [   T       F       F       F       F       F   ]
'a'(1)    [   T       F       F       F       F       F   ]
'a'(2)    [   T       T       T       T       T       F   ]
'b'(3)    [   F       T       T       F       T       F   ]
'c'(4)    [   F       F       T       T       T       T   ]
'c'(5)    [   F       F       F       T       F       T   ] <--- TARGET (5, 5) IS TRUE!

Path of True States to Reach (5, 5):
(0,0) -> (1,0) ['a'] -> (2,0) ['a'] -> (2,1) ['d'] -> (2,2) ['b'] -> (3,2) ['b']
      -> (4,2) ['c'] -> (4,3) ['b'] -> (4,4) ['c'] -> (5,4) ['c'] -> (5,5) ['a']
Matches s3: "a a d b b c b c a c"
Result: TRUE!
```

---

## 5. PRACTICE: Canonical Subsequence & Interleaving Problems

Solidify your mastery by implementing and defending these two classic interview challenges.

### 5.1 LeetCode 115: Distinct Subsequences (Hard)

#### Problem Statement
Given two strings `s` and `t`, return the number of distinct subsequences of `s` which equals `t`. The test cases are generated so that the answer fits in a 32-bit signed integer.

```
Example 1:
Input: s = "rabbbit", t = "rabbit"
Output: 3
Explanation:
As shown below, there are 3 ways you can generate "rabbit" from s:
rabbbit
rabbbit
rabbbit

Example 2:
Input: s = "babgbag", t = "bag"
Output: 5
Explanation:
There are 5 ways you can generate "bag" from s:
babgbag
babgbag
babgbag
babgbag
babgbag
```

#### Key Invariants & Architectural Decisions
1. **Unconditional Exclusion Addition**: Always retain $\text{dp}[i-1][j]$ because any valid subsequence of $s[0 \dots i-2]$ matching $t[0 \dots j-1]$ remains valid when another character is appended to $s$.
2. **Backward 1D Sweep**: Decrement $j$ from $N$ down to $1$ so that `dp[j-1]` is read before it is mutated.
3. **64-bit Accumulators**: Use `ulong` to avoid arithmetic overflow on large intermediate combinatorial numbers.

#### Complexity Invariants
- **Time Complexity:** $\Theta(M \times N)$, visiting every cell once.
- **Space Complexity:** $O(N)$ auxiliary memory using a single 1D rolling array.

---

### 5.2 LeetCode 97: Interleaving String (Medium)

#### Problem Statement
Given strings `s1`, `s2`, and `s3`, find whether `s3` is formed by an interleaving of `s1` and `s2`. An interleaving of two strings `s` and `t` is a configuration where they are divided into non-empty substrings such that:
- $s = s_1 + s_2 + \dots + s_k$
- $t = t_1 + t_2 + \dots + t_m$
- $|k - m| \le 1$
- The interleaving is $s_1 + t_1 + s_2 + t_2 + \dots$ or $t_1 + s_1 + t_2 + s_2 + \dots$

```
Example 1:
Input: s1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"
Output: true

Example 2:
Input: s1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc"
Output: false

Example 3:
Input: s1 = "", s2 = "", s3 = ""
Output: true
```

#### Key Invariants & Architectural Decisions
1. **Cardinal Length Guard**: `if (s1.Length + s2.Length != s3.Length) return false;`.
2. **Forward 1D Sweep**: Must sweep left-to-right ($j = 1 \to N$) because taking from $s_2$ requires the updated left neighbor $\text{dp}[j-1]$ from the current row.
3. **Dimension Swap**: Swap $s_1$ and $s_2$ so that the 1D buffer size is $\min(M, N) + 1$.

#### Complexity Invariants
- **Time Complexity:** $O(M \times N)$ operations.
- **Space Complexity:** $O(\min(M, N))$ auxiliary boolean buffer.

---

## 6. CONNECT: TCP Packet Stream Reassembly & Transaction Serializability

The combinatorial and interleaving principles developed today are core building blocks in network protocols and distributed database engines.

```
+--------------------------------------------------------------------------+
| MULTI-PATH TCP (MPTCP) PACKET INTERLEAVING REASSEMBLY                     |
+--------------------------------------------------------------------------+
| Client sends stream: "GET /index.html HTTP/1.1\r\nHost: example.com\r\n" |
|                                                                          |
| Network splits stream across two physical interfaces (Wi-Fi and 5G LTE): |
| Sub-Flow 1 (Wi-Fi):  Packets s1 = [ Chunk 1, Chunk 3, Chunk 5 ]          |
| Sub-Flow 2 (5G LTE): Packets s2 = [ Chunk 2, Chunk 4, Chunk 6 ]          |
|                                                                          |
| Receiver Network Buffer: Interleaved byte stream s3                      |
| Question: Can buffer s3 be verified as a valid interleaving of s1 & s2?  |
|                                                                          |
| -> Dynamic Programming verifies interleaving validity in O(M * N)        |
|    without re-sorting or buffering the entire global stream!             |
+--------------------------------------------------------------------------+
```

### 1. Multi-Path TCP (MPTCP) Stream Reassembly
Modern mobile devices stream data simultaneously over both cellular (5G) and Wi-Fi interfaces using **Multi-Path TCP (RFC 8684)**:
- Outgoing packets are partitioned across interfaces to maximize aggregate bandwidth.
- Due to varying latency and jitter, packets arrive out of order at the receiving network card.
- The operating system kernel must verify that the coalesced socket stream $s_3$ is a strictly valid interleaving of sub-flow $s_1$ and sub-flow $s_2$.
- The 2D interleaving algorithm verifies packet stream integrity and identifies corrupted or missing packet segments before data is delivered to application memory.

### 2. Distributed Database Concurrency Control: Schedule Serializability
In transaction processing systems (such as Google Spanner or PostgreSQL):
- Two concurrent transactions $T_1$ and $T_2$ execute sequences of read/write database operations: $T_1 = [R_1(A), W_1(A)]$ and $T_2 = [R_2(B), W_2(B)]$.
- The database scheduler executes an interleaved schedule of operations $S$.
- Determining whether an execution schedule $S$ preserves the ACID property of **Serializability** is mathematically equivalent to verifying whether $S$ is a conflict-preserving interleaving of individual transaction operation sequences.

---

## 7. CHECKPOINT: Comprehensive Self-Assessment & Mastery Key

Evaluate your mastery of subsequence counting, interleaving verification, and sweep direction invariants by answering the following architectural questions.

---

### Conceptual & Implementation Mastery Checklist

#### Q1: In Distinct Subsequences ([LC 115]), why is the term $\text{dp}[i-1][j]$ added unconditionally, even when $s[i-1] == t[j-1]$?
**Answer:** The term $\text{dp}[i-1][j]$ represents all valid ways to form target prefix $t[0 \dots j-1]$ from source prefix $s[0 \dots i-2]$ by **ignoring** the current character $s[i-1]$. Even if $s[i-1]$ matches $t[j-1]$, we still have the valid option *not* to use it (leaving it available for potential future matches or treating it as redundant). Therefore, the total count is the sum of ways to form $t[0 \dots j-1]$ without $s[i-1]$ plus the ways to form it using $s[i-1]$ as the match.

#### Q2: Why does the 1D rolling array for Distinct Subsequences sweep right-to-left, whereas Interleaving String sweeps left-to-right?
**Answer:** Distinct Subsequences requires $\text{dp}[i-1][j-1]$ (the top-left diagonal cell from the *previous* row). Sweeping right-to-left ensures that when evaluating index $j$, index $j-1$ has not yet been modified, safely preserving row $i-1$'s diagonal state. In contrast, Interleaving String requires $\text{dp}[i][j-1]$ (the left neighbor from the *current* row). Sweeping left-to-right ensures that `dp[j-1]` has already been updated for row $i$, making it available as the left neighbor.

#### Q3: What is the Spatial Index Conservation Invariant in Interleaving String ([LC 97])?
**Answer:** In any valid interleaving, consuming $i$ characters from $s_1$ and $j$ characters from $s_2$ accounts for exactly $i + j$ characters in $s_3$. Therefore, at coordinate $(i, j)$ in the 2D grid, the corresponding character in $s_3$ that must be matched is strictly fixed to 0-based index $k = i + j - 1$. No search or secondary pointer is needed to locate the target character.

#### Q4: Why is testing $|s_1| + |s_2| == |s_3|$ at the very beginning of Interleaving String a mandatory guard?
**Answer:** An interleaving requires that every single character of both strings is consumed without omission or extra insertion. If $|s_1| + |s_2| \neq |s_3|$, an interleaving is mathematically impossible. Performing this $O(1)$ check avoids allocating memory or executing an $O(M \times N)$ loop that would inevitably fail or risk indexing past the end of $s_3$.

#### Q5: In Distinct Subsequences, why can intermediate cells overflow standard 32-bit signed integers even if the final result fits in 32 bits?
**Answer:** Intermediate subproblems represent combinatorial counts for shorter prefixes of $t$. If $s$ contains long sequences of repeated characters, the number of ways to form a short prefix of $t$ can be astronomically large (e.g., $\binom{80}{20} \approx 3.5 \times 10^{18}$), overflowing a 32-bit integer, even though subsequent characters in $t$ severely constrain the match so that the final $\text{dp}[M][N]$ fits in a 32-bit int. Using 64-bit `ulong` prevents premature overflow exceptions.

#### Q6: How does Interleaving String handle duplicate characters in $s_1$ and $s_2$ (e.g., $s_1 = \text{"a"}$, $s_2 = \text{"a"}$, $s_3 = \text{"aa"}$)?
**Answer:** The recurrence evaluates both options via a boolean OR: $\text{dp}[i][j] = (\text{take from } s_1) \lor (\text{take from } s_2)$. When both $s_1[i-1]$ and $s_2[j-1]$ match $s_3[i+j-1]$, both paths are explored concurrently in the 2D grid, avoiding greedy choice errors where picking one branch could lead to a dead end later.

#### Q7: What is the time and space complexity of the space-optimized Interleaving String algorithm?
**Answer:** Time complexity is $\Theta(M \times N)$, where $M = |s_1|$ and $N = |s_2|$, because every cell in the compressed grid is visited once. Space complexity is $O(\min(M, N))$ because swapping $s_1$ and $s_2$ ensures the 1D boolean array has length equal to the shorter string plus one.

---

### Mastery Verification Summary
- [x] Formulated the combinatorial recurrence for Distinct Subsequences with unconditional exclusion.
- [x] Proved the mathematical correctness of the backward 1D rolling array sweep ($j = N \to 1$).
- [x] Derived the spatial index conservation invariant ($k = i + j - 1$) for Interleaving String.
- [x] Implemented production C# (.NET 8+) code with 64-bit integer overflow protection and assertion suites.
- [x] Validated forward vs backward sweep directions and their microarchitectural cache footprints.
- [x] Connected dual-string dynamic programming to TCP multi-path packet reassembly and database schedule serializability.
