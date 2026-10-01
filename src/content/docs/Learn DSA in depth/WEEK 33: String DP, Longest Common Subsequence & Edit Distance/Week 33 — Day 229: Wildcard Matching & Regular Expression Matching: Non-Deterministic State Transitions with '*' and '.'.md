---
title: "Week 33 — Day 229: Wildcard Matching & Regular Expression Matching: Non-Deterministic State Transitions with '*' and '.'"
---

# Week 33 — Day 229: Wildcard Matching & Regular Expression Matching: Non-Deterministic State Transitions with '*' and '.'

---

## 1. TEACH: Non-Deterministic Finite Automata via 2D DP & The Semantic Divergence of '*'

In computer science theory, pattern matching with metacharacters is fundamentally governed by **Automata Theory**. When a pattern contains wildcards or repetition operators, the matching engine cannot advance deterministically along a single timeline; at each character, multiple alternative paths may be simultaneously viable. Without dynamic programming or memoization, naive recursive search attempts all execution branches, suffering catastrophic exponential degradation ($O(2^{M+N})$) known as **catastrophic backtracking**.

To avoid exponential blowup, modern compilers, search engines, and network packet filters use **Non-Deterministic Finite Automata (NFA)** simulation. In algorithm design, a 2D boolean dynamic programming table is the exact discrete equivalent of an NFA execution frontier: cell $\text{dp}[i][j]$ tracks whether the set of active NFA states after consuming pattern prefix $p[0 \dots j-1]$ can accept string prefix $s[0 \dots i-1]$.

Day 229 focuses on the two classic, hardest pattern matching paradigms in the dynamic programming canon:
1. **Wildcard Matching** ([LeetCode 44] - Hard): Where `?` matches any single character, and `*` matches **any sequence of characters** (including the empty sequence).
2. **Regular Expression Matching** ([LeetCode 10] - Hard): Where `.` matches any single character, and `*` is the **Kleene Star Quantifier**, matching **zero or more occurrences of the preceding element**.

Mastering these problems requires internalizing four structural pillars:
- **The Semantic Divergence of `*`**: Unravelling why `*` in Wildcard Matching is an independent token whose transition checks the left neighbor $\text{dp}[i][j-1]$ and top neighbor $\text{dp}[i-1][j]$, whereas `*` in Regular Expression is a bound quantifier whose transition checks two steps left $\text{dp}[i][j-2]$ and top neighbor $\text{dp}[i-1][j]$.
- **Empty Pattern & Leading Star Invariants**: Formulating the base cases for patterns that begin with or consist entirely of repetition operators (e.g., `****` in Wildcard, or `a*b*c*` in Regex matching the empty string `""`).
- **Greedy Two-Pointer Pruning for Wildcard Matching**: Proving why Wildcard Matching possesses the **Rightmost Star Invariant**, enabling an optimal $O(M)$ average time and $O(1)$ auxiliary space two-pointer scanner, whereas Regular Expression Matching strictly mandates full dynamic programming due to quantifier context ambiguity.
- **Space-Optimized 1D Rolling Frontiers**: Compressing the $O(M \times N)$ boolean tables into $O(N)$ rolling frontiers.

```
THE SEMANTIC DIVERGENCE OF '*':

1. WILDCARD MATCHING (LeetCode 44)
   '*' is an independent wildcard matching ANY sequence:
   
           dp[i-1][j] (Match 1+ characters: consume s[i-1], keep '*')
               |
               v
   dp[i][j-1] ---> dp[i][j]
   (Match 0 chars: consume '*', keep s)
   
   Recurrence: dp[i][j] = dp[i][j-1] || dp[i-1][j]

-------------------------------------------------------------------------

2. REGULAR EXPRESSION MATCHING (LeetCode 10)
   '*' is a Kleene quantifier modifying preceding character p[j-2]:
   
           dp[i-1][j] (Match 1+ chars: ONLY if s[i-1] matches p[j-2])
               |
               v
   dp[i][j-2] ====> dp[i][j]
   (Match 0 occurrences of 'p[j-2]*': look 2 columns back!)
   
   Recurrence: dp[i][j] = dp[i][j-2] || (match(s[i-1], p[j-2]) && dp[i-1][j])
```

---

### 1.1 Wildcard Matching ([LeetCode 44]): Recurrence & Boundary Invariants

Let $s$ be an input string of length $M$ and $p$ be a pattern of length $N$.
We define $\text{dp}[i][j]$ as a boolean flag over $0 \le i \le M$ and $0 \le j \le N$:
$$\text{dp}[i][j] \equiv \text{true if prefix } s[0 \dots i-1] \text{ matches pattern prefix } p[0 \dots j-1], \text{ otherwise false}$$

#### Boundary Conditions
1. **Empty String Matches Empty Pattern:**
   $$\text{dp}[0][0] = \text{true}$$
2. **Non-Empty String Cannot Match Empty Pattern:**
   $$\text{dp}[i][0] = \text{false}, \quad \forall \; 1 \le i \le M$$
3. **Empty String Matching Non-Empty Pattern:**
   An empty string $s = \epsilon$ can match a pattern prefix $p[0 \dots j-1]$ if and only if **all** characters in that pattern prefix are `*`. The moment a non-`*` character appears, all subsequent cells in row $0$ become `false`:
   $$\text{dp}[0][j] = \text{dp}[0][j-1] \;\land\; (p[j-1] == '*')$$

#### The General Recurrence
For any cell $(i, j)$ where $i \ge 1$ and $j \ge 1$:
- **Case 1: Exact Character or '?' ($p[j-1] == '?' \lor p[j-1] == s[i-1]$)**
  The current character is satisfied. State is inherited directly along the diagonal:
  $$\text{dp}[i][j] = \text{dp}[i-1][j-1]$$
- **Case 2: Wildcard Star ($p[j-1] == '*'$)**
  A wildcard star can match:
  1. **An empty sequence (0 characters):** We ignore the `*` and check whether $s[0 \dots i-1]$ matches $p[0 \dots j-2]$: $\text{dp}[i][j-1]$.
  2. **One or more characters:** We use the `*` to match current character $s[i-1]$. Because `*` can match arbitrary sequences, the `*` remains active to potentially match earlier characters in $s$: $\text{dp}[i-1][j]$.
  $$\text{dp}[i][j] = \text{dp}[i][j-1] \;\lor\; \text{dp}[i-1][j]$$
- **Case 3: Incompatible Character Mismatch**
  $$\text{dp}[i][j] = \text{false}$$

---

### 1.2 Regular Expression Matching ([LeetCode 10]): The Kleene Star Quantifier

In regular expressions, the `*` symbol has a fundamentally different grammar: it is **never** a standalone token. It is a quantifier that binds to the immediately preceding element ($p[j-2]$), signifying that the preceding element may occur **zero, one, or multiple consecutive times**.

#### State Definition
$$\text{dp}[i][j] \equiv \text{true if prefix } s[0 \dots i-1] \text{ matches regex pattern prefix } p[0 \dots j-1]$$

#### Boundary Conditions
1. **Empty String Matches Empty Pattern:**
   $$\text{dp}[0][0] = \text{true}$$
2. **Non-Empty String Cannot Match Empty Pattern:**
   $$\text{dp}[i][0] = \text{false}, \quad \forall \; 1 \le i \le M$$
3. **Empty String Matching Leading Quantifiers (Row 0):**
   An empty string $s = \epsilon$ can match patterns like `"a*b*c*"` because each `*` can zero out its preceding character.
   When $p[j-1] == '*' $, we look **two columns back** ($j-2$):
   $$\text{dp}[0][j] = \text{dp}[0][j-2], \quad \forall \; j \ge 2 \text{ where } p[j-1] == '*'$$

#### The General Recurrence
At coordinate $(i, j)$ with $i \ge 1$ and $j \ge 1$:

- **Case 1: Normal Character or '.' ($p[j-1] \neq '*'$)**
  Define the single-character matching predicate:
  $$\text{CharMatch}(s[i-1], p[j-1]) \equiv (p[j-1] == '.' \;\lor\; p[j-1] == s[i-1])$$
  If $\text{CharMatch}$ is true, transition diagonally:
  $$\text{dp}[i][j] = \text{dp}[i-1][j-1] \;\land\; \text{CharMatch}(s[i-1], p[j-1])$$

- **Case 2: Kleene Star Quantifier ($p[j-1] == '*'$)**
  The `*` acts upon $p[j-2]$. We have two disjoint execution branches:
  1. **Zero Occurrences of $p[j-2]$:**
     We completely bypass the sub-expression $p[j-2]*$. This looks two columns left in the pattern:
     $$\text{ZeroMatch} = \text{dp}[i][j-2]$$
  2. **One or More Occurrences of $p[j-2]$:**
     This branch is legal **only if** the current character $s[i-1]$ matches the quantified character $p[j-2]$:
     $$\text{PrecedingMatch} = \text{CharMatch}(s[i-1], p[j-2])$$
     If valid, we consume character $s[i-1]$ from $s$, while keeping the pattern $p[0 \dots j-1]$ active (so $p[j-2]*$ can absorb further characters):
     $$\text{MultipleMatch} = \text{PrecedingMatch} \;\land\; \text{dp}[i-1][j]$$

  Combining both possibilities:
  $$\text{dp}[i][j] = \text{dp}[i][j-2] \;\lor\; \left(\text{CharMatch}(s[i-1], p[j-2]) \;\land\; \text{dp}[i-1][j]\right)$$

---

### 1.3 The Greedy Rightmost Star Optimization for Wildcard Matching ($O(1)$ Space)

While Regular Expression Matching strictly requires 2D dynamic programming due to quantifier context ambiguity (e.g., in `s = "aa"`, `p = "a*a"`, the `a*` must match 1 `'a'` rather than 2 so the trailing `'a'` can match), **Wildcard Matching exhibits a remarkable greedy property**.

#### Theorem 1 (Rightmost Star Invariant)
*In Wildcard Matching, if multiple `*` wildcards appear in pattern $p$, any mismatch between character $s[i]$ and $p[j]$ can be resolved by backtracking strictly to the most recently encountered `*`. Re-evaluating earlier `*` wildcards is strictly redundant.*

**Proof Intuition:**
Because `*` matches **any sequence of any characters**, the rightmost `*` can absorb any characters that an earlier `*` could absorb. If a valid match exists that requires extending a previous star, that same string of characters can instead be absorbed by the latest star without altering subsequent pattern requirements.
Therefore, an algorithm only needs to record:
1. `starIdx`: The index of the most recent `*` in pattern $p$.
2. `matchIdx`: The index in $s$ that was aligned with `starIdx`.

#### The $O(1)$ Space Two-Pointer Loop
```csharp
int sIdx = 0, pIdx = 0;
int starIdx = -1, matchIdx = 0;

while (sIdx < s.Length)
{
    if (pIdx < p.Length && (p[pIdx] == '?' || p[pIdx] == s[sIdx]))
    {
        // 1. Exact match or '?': advance both
        sIdx++;
        pIdx++;
    }
    else if (pIdx < p.Length && p[pIdx] == '*')
    {
        // 2. Encountered '*': record star position, tentatively match 0 characters
        starIdx = pIdx;
        matchIdx = sIdx;
        pIdx++;
    }
    else if (starIdx != -1)
    {
        // 3. Mismatch, but we have an active star: backtrack!
        // Advance the star's matched range by 1 character
        pIdx = starIdx + 1;
        matchIdx++;
        sIdx = matchIdx;
    }
    else
    {
        // 4. Mismatch with no star to absorb: match fails!
        return false;
    }
}

// Consume any trailing stars in pattern
while (pIdx < p.Length && p[pIdx] == '*') pIdx++;

return pIdx == p.Length;
```
- **Time Complexity:** $O(M)$ on average; $O(M \times N)$ in pathological adversarial cases (e.g., $s = \text{"a"}^k, p = \text{"*a"}^k$).
- **Auxiliary Space:** Strictly **$O(1)$** (zero heap memory).

---

## 2. IMPLEMENT: Production-Grade Regex & Wildcard DP Engine (.NET 8+)

Below is the complete, production-grade C# (.NET 8+) implementation encapsulated in `RegexDynamicProgrammingEngine`. It provides:
1. `IsMatchWildcardDp`: Full 2D tabular solver for [LC 44] ($O(MN)$ time, $O(MN)$ space).
2. `IsMatchWildcardSpaceOptimized`: $O(N)$ rolling array solver.
3. `IsMatchWildcardGreedy`: $O(1)$ auxiliary space two-pointer scanner with rightmost-star backtracking.
4. `IsMatchRegexDp`: Full 2D tabular solver for [LC 10] ($O(MN)$ time, $O(MN)$ space).
5. `IsMatchRegexSpaceOptimized`: $O(N)$ rolling array solver for [LC 10].
6. Complete self-validating test harness in `Main()` with explicit `Debug.Assert` checks.

```csharp
using System;
using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace DynamicProgrammingMastery.Week33
{
    /// <summary>
    /// Production-grade computational engine for non-deterministic pattern matching,
    /// simulating NFA execution frontiers via 2D dynamic programming, 1D rolling buffers,
    /// and optimal O(1) space greedy wildcard scanners.
    /// </summary>
    public static class RegexDynamicProgrammingEngine
    {
        // =========================================================================
        // 1. LEETCODE 44: WILDCARD MATCHING ('?' AND standalone '*')
        // =========================================================================

        /// <summary>
        /// Solves Wildcard Matching using full 2D Tabular Dynamic Programming.
        /// '?' matches any single character. '*' matches any sequence of characters (including empty).
        /// Time Complexity: O(M * N), Space Complexity: O(M * N).
        /// </summary>
        public static bool IsMatchWildcardDp(string s, string p)
        {
            ValidateInputs(s, p);
            int m = s.Length;
            int n = p.Length;

            bool[,] dp = new bool[m + 1, n + 1];

            // Base Case 1: Empty string matches empty pattern
            dp[0, 0] = true;

            // Base Case 2: Empty string matching pattern consisting of leading '*'
            for (int j = 1; j <= n; j++)
            {
                if (p[j - 1] == '*')
                {
                    dp[0, j] = dp[0, j - 1];
                }
            }

            // Fill matrix
            for (int i = 1; i <= m; i++)
            {
                char sc = s[i - 1];
                for (int j = 1; j <= n; j++)
                {
                    char pc = p[j - 1];

                    if (pc == '?' || pc == sc)
                    {
                        // Direct diagonal inheritance
                        dp[i, j] = dp[i - 1, j - 1];
                    }
                    else if (pc == '*')
                    {
                        // '*' matches 0 characters (dp[i, j-1]) OR 1+ characters (dp[i-1, j])
                        dp[i, j] = dp[i, j - 1] || dp[i - 1, j];
                    }
                }
            }

            return dp[m, n];
        }

        /// <summary>
        /// Solves Wildcard Matching using an O(N) rolling array.
        /// Time Complexity: O(M * N), Space Complexity: O(N).
        /// </summary>
        public static bool IsMatchWildcardSpaceOptimized(string s, string p)
        {
            ValidateInputs(s, p);
            int m = s.Length;
            int n = p.Length;

            bool[] dp = new bool[n + 1];
            dp[0] = true;

            for (int j = 1; j <= n; j++)
            {
                if (p[j - 1] == '*')
                {
                    dp[j] = dp[j - 1];
                }
            }

            for (int i = 1; i <= m; i++)
            {
                char sc = s[i - 1];
                bool prevDiag = dp[0]; // Stores dp[i-1, 0]
                dp[0] = false;         // Non-empty string cannot match empty pattern

                for (int j = 1; j <= n; j++)
                {
                    char pc = p[j - 1];
                    bool temp = dp[j]; // Stores dp[i-1, j] before overwrite

                    if (pc == '?' || pc == sc)
                    {
                        dp[j] = prevDiag;
                    }
                    else if (pc == '*')
                    {
                        // dp[j] holds top (dp[i-1, j]), dp[j-1] holds left (dp[i, j-1])
                        dp[j] = dp[j] || dp[j - 1];
                    }
                    else
                    {
                        dp[j] = false;
                    }

                    prevDiag = temp; // Advance diagonal for next column
                }
            }

            return dp[n];
        }

        /// <summary>
        /// Solves Wildcard Matching using the Greedy Two-Pointer Rightmost Star Algorithm.
        /// Achieves optimal O(1) auxiliary space and O(M) average time complexity.
        /// </summary>
        public static bool IsMatchWildcardGreedy(string s, string p)
        {
            ValidateInputs(s, p);
            int sIdx = 0, pIdx = 0;
            int starIdx = -1, matchIdx = 0;

            int sLen = s.Length;
            int pLen = p.Length;

            while (sIdx < sLen)
            {
                // Case 1: Exact character match or single-character wildcard '?'
                if (pIdx < pLen && (p[pIdx] == '?' || p[pIdx] == s[sIdx]))
                {
                    sIdx++;
                    pIdx++;
                }
                // Case 2: Encounter wildcard star '*'
                else if (pIdx < pLen && p[pIdx] == '*')
                {
                    starIdx = pIdx;
                    matchIdx = sIdx;
                    pIdx++; // Tentatively assume '*' matches 0 characters
                }
                // Case 3: Mismatch, but we encountered an earlier star: backtrack!
                else if (starIdx != -1)
                {
                    pIdx = starIdx + 1; // Reset pattern pointer to right after star
                    matchIdx++;         // Let the star consume 1 more character from s
                    sIdx = matchIdx;    // Reset string pointer to new trial start
                }
                // Case 4: Mismatch with no star to absorb: match fails immediately
                else
                {
                    return false;
                }
            }

            // Consume any remaining consecutive stars in pattern
            while (pIdx < pLen && p[pIdx] == '*')
            {
                pIdx++;
            }

            return pIdx == pLen;
        }

        // =========================================================================
        // 2. LEETCODE 10: REGULAR EXPRESSION MATCHING ('.' AND KLEENE '*')
        // =========================================================================

        /// <summary>
        /// Solves Regular Expression Matching using full 2D Tabular Dynamic Programming.
        /// '.' matches any single character. '*' matches zero or more of the PRECEDING element.
        /// Time Complexity: O(M * N), Space Complexity: O(M * N).
        /// </summary>
        public static bool IsMatchRegexDp(string s, string p)
        {
            ValidateInputs(s, p);
            int m = s.Length;
            int n = p.Length;

            bool[,] dp = new bool[m + 1, n + 1];

            // Base Case 1: Empty string matches empty pattern
            dp[0, 0] = true;

            // Base Case 2: Empty string matching pattern with Kleene stars (e.g. "a*b*c*")
            for (int j = 2; j <= n; j++)
            {
                if (p[j - 1] == '*')
                {
                    // Inherit state from 2 columns back (0 occurrences of preceding char)
                    dp[0, j] = dp[0, j - 2];
                }
            }

            // Fill 2D Table
            for (int i = 1; i <= m; i++)
            {
                char sc = s[i - 1];
                for (int j = 1; j <= n; j++)
                {
                    char pc = p[j - 1];

                    if (pc != '*')
                    {
                        // Single character match: check if characters match AND diagonal is true
                        if (pc == '.' || pc == sc)
                        {
                            dp[i, j] = dp[i - 1, j - 1];
                        }
                    }
                    else
                    {
                        // Kleene star: pc == '*'
                        // Choice 1: Zero occurrences of preceding element p[j-2]
                        bool zeroMatch = (j >= 2) && dp[i, j - 2];

                        // Choice 2: One or more occurrences of preceding element p[j-2]
                        char precedingChar = p[j - 2];
                        bool precedingMatches = (precedingChar == '.' || precedingChar == sc);
                        bool oneOrMoreMatch = precedingMatches && dp[i - 1, j];

                        dp[i, j] = zeroMatch || oneOrMoreMatch;
                    }
                }
            }

            return dp[m, n];
        }

        /// <summary>
        /// Solves Regular Expression Matching using an O(N) rolling array.
        /// Time Complexity: O(M * N), Space Complexity: O(N).
        /// </summary>
        public static bool IsMatchRegexSpaceOptimized(string s, string p)
        {
            ValidateInputs(s, p);
            int m = s.Length;
            int n = p.Length;

            bool[] dp = new bool[n + 1];
            dp[0] = true;

            for (int j = 2; j <= n; j++)
            {
                if (p[j - 1] == '*')
                {
                    dp[j] = dp[j - 2];
                }
            }

            for (int i = 1; i <= m; i++)
            {
                char sc = s[i - 1];
                bool prevDiag = dp[0]; // Stores dp[i-1, 0]
                dp[0] = false;         // Non-empty string cannot match empty pattern

                for (int j = 1; j <= n; j++)
                {
                    char pc = p[j - 1];
                    bool temp = dp[j]; // Stores dp[i-1, j] before overwrite

                    if (pc != '*')
                    {
                        if (pc == '.' || pc == sc)
                        {
                            dp[j] = prevDiag;
                        }
                        else
                        {
                            dp[j] = false;
                        }
                    }
                    else
                    {
                        bool zeroMatch = (j >= 2) && dp[j - 2];
                        char precedingChar = p[j - 2];
                        bool precedingMatches = (precedingChar == '.' || precedingChar == sc);
                        bool oneOrMoreMatch = precedingMatches && temp; // temp holds dp[i-1, j]

                        dp[j] = zeroMatch || oneOrMoreMatch;
                    }

                    prevDiag = temp;
                }
            }

            return dp[n];
        }

        // =========================================================================
        // DEFENSIVE VALIDATION
        // =========================================================================

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static void ValidateInputs(string s, string p)
        {
            if (s == null) throw new ArgumentNullException(nameof(s), "Input string s cannot be null.");
            if (p == null) throw new ArgumentNullException(nameof(p), "Pattern string p cannot be null.");
        }

        // =========================================================================
        // SELF-VALIDATING TEST SUITE (MAIN ENTRY POINT)
        // =========================================================================

        public static void Main()
        {
            Console.WriteLine("================================================================");
            Console.WriteLine(" RUNNING REGEX & WILDCARD DP MATCHING VALIDATION SUITE          ");
            Console.WriteLine("================================================================\n");

            TestWildcardCanonical();
            TestWildcardGreedyEquivalence();
            TestRegexCanonical();
            TestRegexSpaceOptimizedEquivalence();
            TestEdgeCasesAndStress();

            Console.WriteLine("\n[SUCCESS] ALL WILDCARD & REGEX DP MATCHING TESTS PASSED RIGOROUSLY!");
        }

        private static void TestWildcardCanonical()
        {
            Console.WriteLine("--> Test 1: Canonical LeetCode 44 Wildcard Scenarios...");

            // Example 1: s = "aa", p = "a" -> false
            Debug.Assert(IsMatchWildcardDp("aa", "a") == false);

            // Example 2: s = "aa", p = "*" -> true
            Debug.Assert(IsMatchWildcardDp("aa", "*") == true);

            // Example 3: s = "cb", p = "?a" -> false
            Debug.Assert(IsMatchWildcardDp("cb", "?a") == false);

            // Example 4: s = "adceb", p = "*a*b" -> true
            Debug.Assert(IsMatchWildcardDp("adceb", "*a*b") == true);

            // Example 5: s = "acdcb", p = "a*c?b" -> false
            Debug.Assert(IsMatchWildcardDp("acdcb", "a*c?b") == false);

            // Consecutive stars: s = "abc", p = "*****a*****b*****c*****" -> true
            Debug.Assert(IsMatchWildcardDp("abc", "*****a*****b*****c*****") == true);

            Console.WriteLine("   [PASSED]");
        }

        private static void TestWildcardGreedyEquivalence()
        {
            Console.WriteLine("--> Test 2: Greedy Two-Pointer O(1) Space vs 2D Tabular DP...");

            (string S, string P)[] testCases = new[]
            {
                ("aa", "a"),
                ("aa", "*"),
                ("cb", "?a"),
                ("adceb", "*a*b"),
                ("acdcb", "a*c?b"),
                ("mississippi", "m??*ss*?i*pi"),
                ("", "*****"),
                ("ho", "**ho"),
                ("b", "?*?"),
                ("abcd", "*d*")
            };

            foreach (var (s, p) in testCases)
            {
                bool dpRes = IsMatchWildcardDp(s, p);
                bool optRes = IsMatchWildcardSpaceOptimized(s, p);
                bool greedyRes = IsMatchWildcardGreedy(s, p);

                Console.WriteLine($"   Wildcard s='{s}', p='{p}': DP={dpRes}, Opt={optRes}, Greedy={greedyRes}");
                Debug.Assert(dpRes == greedyRes, $"Greedy mismatch on s='{s}', p='{p}'");
                Debug.Assert(dpRes == optRes, $"Optimized mismatch on s='{s}', p='{p}'");
            }

            Console.WriteLine("   [PASSED]");
        }

        private static void TestRegexCanonical()
        {
            Console.WriteLine("--> Test 3: Canonical LeetCode 10 Regular Expression Scenarios...");

            // Example 1: s = "aa", p = "a" -> false
            Debug.Assert(IsMatchRegexDp("aa", "a") == false);

            // Example 2: s = "aa", p = "a*" -> true
            Debug.Assert(IsMatchRegexDp("aa", "a*") == true);

            // Example 3: s = "ab", p = ".*" -> true
            Debug.Assert(IsMatchRegexDp("ab", ".*") == true);

            // Example 4: s = "aab", p = "c*a*b" -> true (c* is 0, a* is 2, b is 1)
            Debug.Assert(IsMatchRegexDp("aab", "c*a*b") == true);

            // Example 5: s = "mississippi", p = "mis*is*p*." -> false
            Debug.Assert(IsMatchRegexDp("mississippi", "mis*is*p*.") == false);

            // Subtlety: Greedy failure trap in Regex -> s = "aaa", p = "a*a" -> true
            Debug.Assert(IsMatchRegexDp("aaa", "a*a") == true);

            // Empty string matching quantifiers
            Debug.Assert(IsMatchRegexDp("", "a*b*c*") == true);
            Debug.Assert(IsMatchRegexDp("", "a*b*c") == false);

            Console.WriteLine("   [PASSED]");
        }

        private static void TestRegexSpaceOptimizedEquivalence()
        {
            Console.WriteLine("--> Test 4: Regex Space-Optimized O(N) vs 2D Tabular DP...");

            (string S, string P)[] cases = new[]
            {
                ("aa", "a"),
                ("aa", "a*"),
                ("ab", ".*"),
                ("aab", "c*a*b"),
                ("mississippi", "mis*is*p*."),
                ("aaa", "a*a"),
                ("a", "ab*"),
                ("bbbba", ".*a*a"),
                ("ab", ".*.."),
                ("", ".*")
            };

            foreach (var (s, p) in cases)
            {
                bool tab = IsMatchRegexDp(s, p);
                bool opt = IsMatchRegexSpaceOptimized(s, p);

                Console.WriteLine($"   Regex s='{s}', p='{p}': Tab={tab}, Opt={opt}");
                Debug.Assert(tab == opt, $"Regex mismatch on s='{s}', p='{p}': Tab={tab}, Opt={opt}");
            }

            Console.WriteLine("   [PASSED]");
        }

        private static void TestEdgeCasesAndStress()
        {
            Console.WriteLine("--> Test 5: Empty Strings, Single Tokens & Repetitive Discrepancies...");

            // Both empty
            Debug.Assert(IsMatchWildcardDp("", "") == true);
            Debug.Assert(IsMatchRegexDp("", "") == true);

            // One empty
            Debug.Assert(IsMatchWildcardDp("a", "") == false);
            Debug.Assert(IsMatchRegexDp("a", "") == false);
            Debug.Assert(IsMatchWildcardDp("", "a") == false);
            Debug.Assert(IsMatchRegexDp("", "a") == false);

            // Dot matching in Regex
            Debug.Assert(IsMatchRegexDp("a", ".") == true);
            Debug.Assert(IsMatchRegexDp("ab", "..") == true);
            Debug.Assert(IsMatchRegexDp("ab", ".") == false);

            Console.WriteLine("   [PASSED]");
        }
    }
}
```

---

## 3. ANALYZE: Algorithmic Invariants & 5-Dimension Deep-Dive

To achieve true Staff-level expertise in pattern matching engines, we contrast the asymptotic bounds and runtime dynamics of both automata paradigms.

### Algorithmic Comparison Across Pattern Matching Architectures

| Characteristic | Wildcard 2D DP ([LC 44]) | Wildcard Greedy Scanner | Regex 2D DP ([LC 10]) | Regex 1D Rolling Buffer |
| :--- | :--- | :--- | :--- | :--- |
| **Metacharacters** | `?` (single), `*` (sequence) | `?` (single), `*` (sequence) | `.` (single), `*` (Kleene quantifier) | `.` (single), `*` (Kleene quantifier) |
| **Time Complexity** | $O(M \times N)$ | **$O(M)$ average, $O(MN)$ worst** | $O(M \times N)$ | $O(M \times N)$ |
| **Auxiliary Space** | $O(M \times N)$ | **$O(1)$** | $O(M \times N)$ | **$O(N)$** |
| **Greedy Solvable?**| **Yes (Rightmost Star)** | **Yes** | **NO (Quantifier Ambiguity)** | NO |
| **Lookback Distance**| 1 step left ($\text{dp}[i][j-1]$) | Pointer reset to `starIdx + 1` | **2 steps left ($\text{dp}[i][j-2]$)** | 2 steps left (`dp[j-2]`) |
| **Base Row 0 Invariant**| $\text{dp}[0][j] = \text{dp}[0][j-1] \land (p[j-1] == '*')$ | Handled in trailing loop | $\text{dp}[0][j] = \text{dp}[0][j-2] \text{ when } p[j-1] == '*' $ | Handled in base loop |

---

### 5-Dimension Deep-Dive

#### 1. Arithmetic & Register Dynamics: Why Regex Cannot Be Solved Greedily
Consider why the greedy two-pointer technique succeeds for Wildcard Matching but **fails catastrophically for Regular Expressions**:
- In Wildcard Matching, `*` matches *any arbitrary character sequence*. Thus, if a star appears, any characters consumed by an earlier star could just as easily be absorbed by the latest star. There is zero structural context attached to `*`.
- In Regular Expressions, `*` is constrained: $a*$ can *only* match the character `'a'`. 
- Consider $s = \text{"aaa"}$ and $p = \text{"a*a"}$.
  - A greedy matcher encounters $a*$ and eagerly absorbs all three `'a'` characters.
  - The pattern pointer advances to the trailing `'a'`.
  - The string is now exhausted, so the trailing `'a'` fails to match!
  - To succeed, the engine must non-deterministically test matching 0 `'a'`s, 1 `'a'`, or 2 `'a'`s.
  - Because quantifiers carry character constraints, greedily advancing causes premature state pruning. Only dynamic programming (or full NFA simulation) preserves global correctness.

#### 2. Memory Topology & Lookback Strides ($j-2$ in Regex)
In Regular Expression Matching, the `*` operator requires evaluating $\text{dp}[i][j-2]$:
- When compressing into a 1D rolling array, evaluating index $j$ requires reading `dp[j - 2]`.
- Notice that in a 1D array sweeping left-to-right ($j = 1 \to N$):
  - `dp[j - 2]` was already updated for the **current row $i$**!
  - Is reading the current row's `dp[i][j-2]` mathematically valid?
  - **YES!** Because matching zero occurrences of $p[j-2]*$ means string prefix $s[0 \dots i-1]$ (row $i$) must match pattern prefix $p[0 \dots j-3]$ (column $j-2$).
  - Therefore, reading `dp[j-2]` directly from the rolling array correctly accesses $\text{dp}[i][j-2]$! No temporary variable is required for the 2-step horizontal jump.

```
1D ROLLING JUMP IN REGEX DP:
When evaluating dp[j] (where p[j-1] == '*'):
- dp[j-2] was updated 2 steps ago in the CURRENT row i ===> represents dp[i, j-2] (0 matches of p[j-2]*)
- temp holds the old value of dp[j] from row i-1       ===> represents dp[i-1, j] (1+ matches of p[j-2]*)
Result: Both required predecessors are accessible in O(1) CPU registers!
```

#### 3. Structural Failure Modes & Edge Cases
- **Pattern Starting with `*` in Regex**: In formal regular expressions, `*` must follow a character. An input pattern like `*a` is syntactically invalid. Production engines must validate that `p[0] != '*'` before evaluating `p[j-2]`.
- **Empty String Matching Chained Quantifiers**: Pattern `a*b*c*d*` matches `""`. The base initialization of row $0$ must propagate truth values two columns at a time: `dp[0][j] = dp[0][j-2]`. Failing to initialize row 0 causes valid empty-string matches to fail.
- **Consecutive Stars in Wildcard**: Pattern `a*****b` is semantically equivalent to `a*b`. While the DP handles redundant stars correctly, collapsing consecutive `*` tokens during pattern preprocessing optimizes runtime and reduces table dimensions.

#### 4. Hardware & Microarchitectural Considerations: Branch Predictor Thrashing
In naive recursive backtracking for regex:
```csharp
// Catastrophic recursive branching
return IsMatch(s, p.Substring(2)) || (firstMatch && IsMatch(s.Substring(1), p));
```
- Each recursive call creates a branch that modern CPU branch target buffers (BTBs) cannot predict. Branch misprediction rates skyrocket to over $35\%$.
- Furthermore, recursive string slicing (`Substring(1)`) allocates thousands of short-lived heap objects, triggering Gen-0 garbage collection pauses.
- The 2D DP and 1D rolling array implementations eliminate all object allocations, maintaining sequential row-major memory sweeps that hardware cache prefetchers stream into L1 caches with $99.9\%$ efficiency.

#### 5. Staff-Level Production Trade-offs: Thompson's NFA vs. PCRE Backtracking
In industry regex runtimes:
- **PCRE (Perl Compatible Regular Expressions / Python `re` / Java `java.util.regex`)**: Uses recursive backtracking. While it supports advanced non-regular features like backreferences (`(\w+)\1`), it is vulnerable to **Regular Expression Denial of Service (ReDoS)**—adversarial input strings can lock the CPU at $100\%$ utilization for hours.
- **Thompson's NFA / Google RE2 / Rust `regex`**: Uses dynamic programming state frontiers. It strictly forbids backreferences, guaranteeing that **every regular expression query completes in strictly $O(M \times N)$ linear/polynomial time**, immune to ReDoS attacks.

---

## 4. DEMONSTRATE: Visual State Transitions & NFA Execution Traces

To develop deep visual intuition, we trace both algorithms across tricky canonical test cases.

### 4.1 Wildcard Matching Trace: `s = "adceb"`, `p = "*a*b"`

```
String:  s = "adceb" (M = 5)
Pattern: p = "*a*b"  (N = 4)

Initial Matrix:
Row 0 (s = ""):
- j=0 (eps): true
- j=1 ('*'): dp[0, 1] = dp[0, 0] = true
- j=2 ('a'): false
- j=3 ('*'): dp[0, 3] = dp[0, 2] = false
- j=4 ('b'): false
Row 0: [ T, T, F, F, F ]
```

#### Completed 2D Table:
```
              eps     '*'(1)  'a'(2)  '*'(3)  'b'(4)
eps(0)     [   T,      T,      F,      F,      F   ]
'a'(1)     [   F,      T,      T,      T,      F   ]  <-- 'a' matches '*' (top) & 'a' (diag)
'd'(2)     [   F,      T,      F,      T,      F   ]  <-- 'd' matches '*'
'c'(3)     [   F,      T,      F,      T,      F   ]  <-- 'c' matches '*'
'e'(4)     [   F,      T,      F,      T,      F   ]  <-- 'e' matches '*'
'b'(5)     [   F,      T,      F,      T,     (T)  ]  <-- 'b' matches 'b' (diag from (4,3))
                                                ^
                                          TARGET IS TRUE!
```

#### Greedy Two-Pointer Execution Walk:
```
s = "adceb", p = "*a*b"
1. s[0]='a', p[0]='*': Star encountered! starIdx=0, matchIdx=0, pIdx advances to 1.
2. s[0]='a', p[1]='a': Exact match! sIdx=1, pIdx=2.
3. s[1]='d', p[2]='*': Star encountered! starIdx=2, matchIdx=1, pIdx advances to 3.
4. s[1]='d', p[3]='b': Mismatch ('d' != 'b'), but starIdx=2 exists!
   Backtrack: star absorbs 'd'. matchIdx=2, sIdx=2, pIdx resets to 3.
5. s[2]='c', p[3]='b': Mismatch ('c' != 'b'), starIdx=2 exists!
   Backtrack: star absorbs 'c'. matchIdx=3, sIdx=3, pIdx resets to 3.
6. s[3]='e', p[3]='b': Mismatch ('e' != 'b'), starIdx=2 exists!
   Backtrack: star absorbs 'e'. matchIdx=4, sIdx=4, pIdx resets to 3.
7. s[4]='b', p[3]='b': Exact match! sIdx=5, pIdx=4.
Loop terminates: sIdx == 5, pIdx == 4 == p.Length.
Result: TRUE in O(1) space!
```

---

### 4.2 Regular Expression Matching Trace: `s = "aab"`, `p = "c*a*b"`

```
String:  s = "aab"   (M = 3)
Pattern: p = "c*a*b" (N = 5)

Row 0 Base Case (s = ""):
- j=0 (eps): true
- j=1 ('c'): false
- j=2 ('*'): dp[0, 2] = dp[0, 0] = true  (c* matches 0 occurrences of 'c')
- j=3 ('a'): false
- j=4 ('*'): dp[0, 4] = dp[0, 2] = true  (a* matches 0 occurrences of 'a')
- j=5 ('b'): false
Row 0: [ T, F, T, F, T, F ]
```

#### Completed 2D Table:
```
              eps    'c'(1)  '*'(2)  'a'(3)  '*'(4)  'b'(5)
eps(0)     [   T,      F,      T,      F,      T,      F   ]
'a'(1)     [   F,      F,      F,      T,      T,      F   ]  <-- 'a' matches 'a' (diag) & 'a*' (zero)
'a'(2)     [   F,      F,      F,      F,      T,      F   ]  <-- 'a' matches 'a*' (multiple)
'b'(3)     [   F,      F,      F,      F,      F,     (T)  ]  <-- 'b' matches 'b' (diag from (2,4))
                                                        ^
                                                  TARGET IS TRUE!
```

---

## 5. PRACTICE: Canonical Wildcard & Regular Expression Problems

Solidify your implementation agility with these two premier interview benchmarks.

### 5.1 LeetCode 44: Wildcard Matching (Hard)

#### Problem Statement
Given an input string (`s`) and a pattern (`p`), implement wildcard pattern matching with support for `'?'` and `'*'` where:
- `'?'` Matches any single character.
- `'*'` Matches any sequence of characters (including the empty sequence).
The matching should cover the entire input string (not partial).

```
Example 1:
Input: s = "aa", p = "a"
Output: false

Example 2:
Input: s = "aa", p = "*"
Output: true

Example 3:
Input: s = "cb", p = "?a"
Output: false
```

#### Key Invariants & Architectural Decisions
1. **Choose Greedy Two-Pointer for Production**: When auxiliary space must be strictly minimized ($O(1)$ space), use the Rightmost Star tracking algorithm.
2. **Tabular DP for Predictability**: If constant execution time bounds are mandated (avoiding worst-case adversarial inputs), use $O(MN)$ DP.
3. **Empty String Star Absorption**: Base row must initialize $\text{dp}[0][j] = \text{dp}[0][j-1]$ when $p[j-1] == '*' $.

#### Complexity Invariants
- **DP Time Complexity:** $\Theta(M \times N)$.
- **DP Space Complexity:** $O(N)$ with rolling array.
- **Greedy Space Complexity:** $O(1)$ auxiliary space.

---

### 5.2 LeetCode 10: Regular Expression Matching (Hard)

#### Problem Statement
Given an input string `s` and a pattern `p`, implement regular expression matching with support for `'.'` and `'*'` where:
- `'.'` Matches any single character.
- `'*'` Matches zero or more of the preceding element.
The matching should cover the entire input string (not partial).

```
Example 1:
Input: s = "aa", p = "a"
Output: false

Example 2:
Input: s = "aa", p = "a*"
Output: true

Example 3:
Input: s = "ab", p = ".*"
Output: true
```

#### Key Invariants & Architectural Decisions
1. **Never Separate `*` From Its Preceding Character**: In Regex DP, `*` is at index $j-1$, but it modifies character $p[j-2]$. Always evaluate $p[j-2]$ when handling `*`.
2. **Two-Step Horizontal Lookback**: Zero matches of $p[j-2]*$ skips two columns: $\text{dp}[i][j-2]$.
3. **Vertical Inheritance for Multiple Matches**: When $s[i-1]$ matches $p[j-2]$, multiple matches inherit from $\text{dp}[i-1][j]$ (same pattern prefix, previous string character).

#### Complexity Invariants
- **Time Complexity:** $\Theta(M \times N)$ operations.
- **Space Complexity:** $O(N)$ auxiliary memory using 1D rolling array.

---

## 6. CONNECT: Compiler Lexical Analysis (Lex/Flex) & Network Intrusion Detection (Snort)

The dynamic programming simulation of NFAs is the core algorithmic workhorse of systems infrastructure that must parse unvetted data at multi-gigabit speeds.

```
+--------------------------------------------------------------------------+
| HIGH-THROUGHPUT NETWORK INTRUSION DETECTION (SNORT / SURICATA)           |
+--------------------------------------------------------------------------+
| 10 Gbps Ethernet Fiber Stream:                                           |
| Packet Payload: [ ... GET /admin.php?cmd=cat%20/etc/passwd HTTP/1.1 ... ] |
|                                                                          |
| Security Rule: alert tcp any any -> any 80 (pcre:"/cmd=.*(cat|id|sh)/i") |
|                                                                          |
| The ReDoS Catastrophe:                                                   |
| Malicious packet sent with adversarial prefix: "cmd=aaaaaaaaaaaaaa..."   |
| Backtracking regex engines lock CPU at 100% (Denial of Service!)        |
|                                                                          |
| Snort / Suricata Architecture:                                            |
| 1. Multi-String Literal Filter: Aho-Corasick filters literal "cmd="      |
| 2. DP / Thompson NFA Engine: Executes linear-time O(M * N) simulation    |
|    Guarantees zero-backtracking, predictable wire-speed packet inspection|
+--------------------------------------------------------------------------+
```

### 1. Compiler Lexers & Tokenizers (Lex, Flex, ANTLR)
When a compiler (such as Roslyn for C# or Clang for C++) reads source code:
- Lexical grammar rules are defined as regular expressions (e.g., identifiers: `[a-zA-Z_][a-zA-Z0-9_]*`, floating-point numbers: `[0-9]+\.[0-9]*([eE][+-]?[0-9]+)?`).
- The lexer generator converts these regular expressions into a unified Thompson NFA, which is then compiled into a minimized DFA.
- If a regular grammar contains non-deterministic constructs, the compiler runtime executes dynamic programming state tracking to parse ambiguous syntax without backtracking.

### 2. Deep Packet Inspection & Cyber Defense: Immunizing Against ReDoS
Network Intrusion Detection Systems (NIDS) like Snort, Suricata, and Zeek inspect millions of network packets per second:
- Attackers intentionally construct payloads designed to trigger worst-case $O(2^N)$ backtracking in vulnerable regex libraries, causing firewall appliances to freeze and drop legitimate traffic.
- Enterprise security hardware utilizes **Thompson NFA dynamic programming engines** (such as Hyperscan or RE2).
- Because DP maintains a bit-vector representing all active states at character $i$, every byte is processed in strictly $O(1)$ CPU cycles, guaranteeing immunity against ReDoS attacks and enforcing strict SLA compliance.

---

## 7. CHECKPOINT: Comprehensive Self-Assessment & Mastery Key

Evaluate your mastery of non-deterministic string dynamic programming, Kleene star semantics, and greedy optimizations by answering the following architectural questions.

---

### Conceptual & Implementation Mastery Checklist

#### Q1: What is the fundamental difference in state transitions between the `*` wildcard in LeetCode 44 and the `*` quantifier in LeetCode 10?
**Answer:** In LeetCode 44 (Wildcard), `*` is an independent token that matches any sequence of characters. Its transition is $\text{dp}[i][j] = \text{dp}[i][j-1] \lor \text{dp}[i-1][j]$, looking 1 column back (matching 0 characters) or 1 row up (matching 1+ characters). In LeetCode 10 (Regex), `*` is a quantifier that modifies the preceding token $p[j-2]$. Its transition is $\text{dp}[i][j] = \text{dp}[i][j-2] \lor (\text{match}(s[i-1], p[j-2]) \land \text{dp}[i-1][j])$, looking **2 columns back** to skip the quantified token entirely, or 1 row up only if $s[i-1]$ matches the quantified character.

#### Q2: Why can Wildcard Matching be solved in $O(1)$ auxiliary space using a greedy two-pointer approach, whereas Regular Expression Matching cannot?
**Answer:** Wildcard Matching exhibits the Rightmost Star Invariant: because `*` can match any character sequence without restriction, any mismatch can be resolved by backtracking strictly to the most recent `*`. Earlier stars never need to be reconsidered. In contrast, regular expression quantifiers (e.g., $a*$) are constrained to a specific character. If a match fails downstream, the engine cannot determine greedily how many characters $a*$ should have consumed without exploring multiple branching possibilities (e.g., $s = \text{"aaa"}, p = \text{"a*a"}$), necessitating dynamic programming or NFA simulation.

#### Q3: In Regular Expression Matching, how is row 0 (empty string $s = \epsilon$) initialized, and why?
**Answer:** An empty string can match a non-empty regex pattern if and only if the pattern consists of zero or more pairs of characters followed by `*` (e.g., `"a*b*c*"`). Each `*` can eliminate its preceding character by choosing the zero-occurrence branch. Therefore, row 0 is initialized with $\text{dp}[0][0] = \text{true}$, and for $j \ge 2$, if $p[j-1] == '*' $, $\text{dp}[0][j] = \text{dp}[0][j-2]$. Any cell where $p[j-1] \neq '*' $ remains `false`.

#### Q4: Why does a 1D rolling array for Regex DP correctly access $\text{dp}[i][j-2]$ directly from `dp[j-2]`?
**Answer:** When sweeping left-to-right ($j = 1 \to N$), index $j-2$ was updated two steps earlier during the **current row $i$**. In Regex DP, matching zero occurrences of $p[j-2]*$ means string prefix $s[0 \dots i-1]$ matches pattern prefix $p[0 \dots j-3]$, which is precisely $\text{dp}[i][j-2]$. Thus, `dp[j-2]` in the rolling array already holds the required state from the current row, allowing direct horizontal jumps without temporary caching.

#### Q5: What is Catastrophic Backtracking (ReDoS), and how does dynamic programming prevent it?
**Answer:** Catastrophic backtracking occurs when a recursive regex engine attempts all combinations of nested quantifiers (e.g., `(a+)+$`) on a non-matching input like `"aaaa...aab"`, leading to $O(2^N)$ branch evaluations that freeze the CPU. Dynamic programming computes the matching frontier iteratively across an $(M+1) \times (N+1)$ table, visiting each prefix state exactly once. This guarantees that execution terminates in strictly $O(M \times N)$ polynomial time, eliminating exponential explosion.

#### Q6: In Wildcard Matching, what is the significance of the post-loop check `while (pIdx < p.Length && p[pIdx] == '*') pIdx++;`?
**Answer:** If the string $s$ has been completely consumed ($sIdx == s.Length$), but the pattern still has remaining characters, those remaining characters must all be `*` for the match to succeed. A trailing star matches an empty sequence. If any non-`*` character remains, the pattern cannot match, and the check ensures `pIdx == p.Length` correctly evaluates to `false`.

#### Q7: In Regex Matching, what happens if the pattern contains `".*"`?
**Answer:** The sub-expression `".*"` is the universal regex wildcard: `.` matches any character, and `*` allows it to repeat zero or more times. When evaluating `.*`, the zero-match branch checks $\text{dp}[i][j-2]$, and the multiple-match branch checks $\text{dp}[i-1][j]$ unconditionally (since `.` matches any $s[i-1]$). This allows `.*` to match any prefix of arbitrary length.

---

### Mastery Verification Summary
- [x] Analyzed NFA state simulation using 2D dynamic programming tables.
- [x] Contrasted the semantic divergence of `*` in Wildcard vs. Regular Expressions.
- [x] Implemented production-grade 2D DP and $O(N)$ rolling buffers for both problems.
- [x] Implemented and proved the greedy $O(1)$ auxiliary space two-pointer scanner for Wildcard Matching.
- [x] Formulated base-case boundary invariants for leading and chained asterisks (`*`, `a*b*c*`).
- [x] Validated production C# (.NET 8+) code with assertions and edge-case suites.
- [x] Connected regex DP to compiler lexical analyzers (Lex/Flex) and network intrusion prevention (Snort/Suricata).
