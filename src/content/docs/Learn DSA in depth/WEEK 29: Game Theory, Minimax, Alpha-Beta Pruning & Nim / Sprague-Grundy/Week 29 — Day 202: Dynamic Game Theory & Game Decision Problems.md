---
title: "Week 29 — Day 202: Dynamic Game Theory & Game Decision Problems"
---

# Week 29 — Day 202: Dynamic Game Theory & Game Decision Problems

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

In previous days, we explored combinatorial games with infinite or vast state spaces requiring tree search (Minimax, Alpha-Beta) or impartial games solved algebraically (Bouton's XOR sum, Sprague-Grundy $\text{mex}$). In this module, we examine **Dynamic Game Theory**: zero-sum games with finite, overlapping subproblems where the optimal adversarial strategy is solved using **Dynamic Programming and Memoized Backtracking**.

When game states are bounded by compact discrete coordinates—such as subarray intervals $[i, j]$, suffix indices with branching bounds $(i, M)$, or integer bitmasks representing exhausted resources—exhaustive Minimax degrades into an identical-state bottleneck. By applying memoization, we convert exponential search trees ($\mathcal{O}(b^d)$) into polynomial or bounded state graphs ($\mathcal{O}(|V|)$).

```
========================================================================================================
                      DYNAMIC GAME THEORY PARADIGM ARCHETYPES
========================================================================================================

Archetype                 State Representation      Canonical Problem       Core Recurrence
--------------------------------------------------------------------------------------------------------
1. Interval Games         dp[i, j]                  [LC 877] Stone Game     dp[i,j] = max(piles[i] - dp[i+1,j],
                          Subarray boundaries       [LC 486] Predict Winner               piles[j] - dp[i,j-1])
                                                                            
2. Variable Suffix Games  dp[i, M]                  [LC 1140] Stone Game II dp[i,M] = max(suffix[i] - 
                          Suffix idx + pickup bound                                   dp[i+X, max(M, X)])
                                                                            
3. Bitmask Games          memo[usedBitmask]         [LC 464] Can I Win      memo[mask] = exists move s.t.
                          Set of exhausted pool                             opponent memo[mask | bit] == False
========================================================================================================
```

---

### Archetype 1: Interval Games ([LeetCode 877] Stone Game)

In an Interval Game, players take turns selecting elements strictly from the boundaries of an array (`piles[i]` or `piles[j]`).
- Let $dp[i][j]$ represent the **maximum net score advantage** that the current player can achieve over their opponent from the subarray `piles[i...j]`.
- If the player chooses `piles[i]`, the opponent will achieve an advantage of $dp[i+1][j]$ on the remaining subarray. The net advantage is:
  $$\text{Choice } i: \quad \text{piles}[i] - dp[i+1][j]$$
- If the player chooses `piles[j]`, the net advantage is:
  $$\text{Choice } j: \quad \text{piles}[j] - dp[i][j-1]$$
- The player maximizes their advantage:
  $$\mathbf{dp[i][j] = \max\left(\text{piles}[i] - dp[i+1][j], \quad \text{piles}[j] - dp[i][j-1]\right)}$$

#### The Even-Length Parity Theorem (The Analytical Shortcut)
In [LeetCode 877], $N$ is always even and $\sum \text{piles}$ is odd.
The first player (Alice) can calculate the sum of all **even-indexed piles** ($\sum \text{piles}[2k]$) versus the sum of all **odd-indexed piles** ($\sum \text{piles}[2k+1]$).
- Because the total sum is odd, one of these two sums must be strictly greater than the other!
- If the even sum is greater, Alice picks `piles[0]`. This exposes only odd indices (`1` and `N-1`) to Bob. Whatever Bob picks, Alice can pick the next even index. Alice takes **every single even pile**!
- Therefore, in [LC 877], the first player **always wins** ($\mathcal{O}(1)$ return `true`). However, when $N$ can be odd or tied ([LC 486]), the $\mathcal{O}(N^2)$ interval DP is required.

---

### Archetype 2: Variable Pickup Suffix Games ([LeetCode 1140] Stone Game II)

In Stone Game II, an array `piles[0...N-1]` is consumed from left to right.
- On a player's turn with parameter $M$, they may take $X$ consecutive piles where $1 \le X \le 2M$.
- The next player inherits parameter $M' = \max(M, X)$. The game starts at index $0$ with $M = 1$.
- Goal: Maximize the total number of stones collected by the first player.

#### Suffix Sum Complementary Invariant
Let $\text{suffixSum}[i] = \sum_{k=i}^{N-1} \text{piles}[k]$ be the total stones remaining on the board from index $i$ to the end.
If the current player makes a choice that leaves the opponent with optimal score $\text{dp}(i + X, \max(M, X))$, then the current player receives **all remaining stones minus the opponent's share**:

$$\mathbf{\text{dp}(i, M) = \max_{1 \le X \le 2M} \left( \text{suffixSum}[i] - \text{dp}(i + X, \max(M, X)) \right)}$$

This recurrence eliminates the need to track individual player scores, unifying the problem into a 2D memoization table $\mathcal{O}(N^2)$.

---

### Archetype 3: Bitmask Decision Games ([LeetCode 464] Can I Win)

In [LeetCode 464], two players take turns picking integers from a shared pool $\{1, 2, \dots, \text{maxChoosableInteger}\}$ (where $\text{maxChoosable} \le 20$).
- Chosen numbers cannot be chosen again.
- The running sum accumulates. The first player to make the running sum reach or exceed $\text{desiredTotal}$ wins.

#### The Bitmask State Invariant
Because $\text{maxChoosable} \le 20$, the entire set of available versus used numbers can be represented by a **single 32-bit integer** `usedNumbers`:
- If the $k$-th bit is $1$, number $k$ has already been selected.
- If the $k$-th bit is $0$, number $k$ remains in the pool.

#### Why `currentTotal` is Redundant in the Memoization Key
A common rookie trap is attempting to memoize on `(usedNumbers, currentTotal)`.
However, `currentTotal` is **uniquely determined** by `usedNumbers`:
$$\text{currentTotal} = \sum_{k=1}^{\text{maxChoosable}} k \cdot \left[ (\text{usedNumbers} \gg k) \ \& \ 1 \right]$$
Any two paths that used the exact same subset of numbers have identically reached the exact same total!
Therefore, the state space is strictly bounded by $2^{\text{maxChoosable}} \le 2^{20} \approx 1.04 \times 10^6$ states, fitting easily into flat memory.

```
========================================================================================================
                      CAN I WIN: BITMASK STATE TRANSITION & PRUNING
========================================================================================================

 Current State: usedNumbers = 0b00110 (Numbers 1 and 2 used, currentTotal = 3)
 Target: desiredTotal = 6. Remaining pool: {3, 4}.
 
                       [ used = 0b00110, total = 3 ]
                             /               \
                  Pick 3    /                 \   Pick 4
                           v                   v
              [ used = 0b01110, total = 6 ]   [ used = 0b10110, total = 7 ]
                     (3 + 3 = 6 >= 6)                (3 + 4 = 7 >= 6)
                     IMMEDIATE WIN!                  IMMEDIATE WIN!
                     Return: TRUE                    Return: TRUE
========================================================================================================
```

---

## 2. ⚙️ IMPLEMENT: Production-Grade Container / Algorithm

The following production-grade C# implementation provides:
1. `StoneGameSolver`: Interval DP solver + Analytical parity validator ([LC 877] / [LC 486]).
2. `StoneGameIISolver`: Suffix sum memoized solver for variable pickup multipliers ([LC 1140]).
3. `CanIWinSolver`: 32-bit integer bitmask memoized Minimax engine with early feasibility pruning ([LC 464]).
4. Complete self-validating verification test suite in `Main()`.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedDSA.GameTheory
{
    public static class DynamicGameTheorySuite
    {
        // =========================================================================
        // 1. LEETCODE 877 / 486: INTERVAL MINIMAX DP
        // =========================================================================

        public static class StoneGame
        {
            /// <summary>
            /// Solves LeetCode 486 (Predict the Winner) / LeetCode 877 (Stone Game).
            /// Computes the net advantage of Player 1 using O(N^2) interval DP.
            /// Returns true if Player 1 score >= Player 2 score.
            /// </summary>
            public static bool PredictTheWinner(int[] piles)
            {
                if (piles == null || piles.Length == 0) return true;
                int n = piles.Length;

                // dp[i, j] represents max net score advantage on piles[i...j]
                int[,] dp = new int[n, n];

                // Base Case: Subarrays of length 1
                for (int i = 0; i < n; i++)
                {
                    dp[i, i] = piles[i];
                }

                // Fill DP table by increasing subarray length
                for (int len = 2; len <= n; len++)
                {
                    for (int i = 0; i <= n - len; i++)
                    {
                        int j = i + len - 1;
                        int pickLeft = piles[i] - dp[i + 1, j];
                        int pickRight = piles[j] - dp[i, j - 1];
                        dp[i, j] = Math.Max(pickLeft, pickRight);
                    }
                }

                return dp[0, n - 1] >= 0;
            }

            /// <summary>
            /// Analytical solution for LeetCode 877: First player always wins when N is even.
            /// </summary>
            public static bool StoneGameAnalytical(int[] piles) => true;
        }

        // =========================================================================
        // 2. LEETCODE 1140: VARIABLE PICKUP SUFFIX SUM DP (STONE GAME II)
        // =========================================================================

        public static class StoneGameII
        {
            /// <summary>
            /// Computes the maximum stones Alice can obtain under optimal play.
            /// Uses suffix sums and a 2D memoization table [index, M].
            /// </summary>
            public static int MaxStonesAlice(int[] piles)
            {
                if (piles == null || piles.Length == 0) return 0;
                int n = piles.Length;

                // 1. Precompute Suffix Sums
                int[] suffixSum = new int[n + 1];
                for (int i = n - 1; i >= 0; i--)
                {
                    suffixSum[i] = suffixSum[i + 1] + piles[i];
                }

                // 2. Memoization table: memo[i, M]
                // Max M can reach N
                int[,] memo = new int[n, n + 1];

                return Dfs(0, 1, piles, suffixSum, memo);
            }

            private static int Dfs(int i, int m, int[] piles, int[] suffixSum, int[,] memo)
            {
                int n = piles.Length;
                if (i >= n) return 0;

                // Pruning Invariant: If player can take all remaining stones, take all!
                if (i + 2 * m >= n)
                {
                    return suffixSum[i];
                }

                if (memo[i, m] != 0)
                {
                    return memo[i, m];
                }

                int maxStones = 0;
                int maxPickup = 2 * m;

                for (int x = 1; x <= maxPickup; x++)
                {
                    int nextM = Math.Max(m, x);
                    // Current player gets: Total remaining stones - Opponent's optimal share
                    int stones = suffixSum[i] - Dfs(i + x, nextM, piles, suffixSum, memo);
                    if (stones > maxStones)
                    {
                        maxStones = stones;
                    }
                }

                memo[i, m] = maxStones;
                return maxStones;
            }
        }

        // =========================================================================
        // 3. LEETCODE 464: BITMASK MEMOIZED MINIMAX (CAN I WIN)
        // =========================================================================

        public static class CanIWin
        {
            /// <summary>
            /// Solves LeetCode 464: Can I Win.
            /// Tracks used numbers using a 32-bit integer bitmask.
            /// </summary>
            public static bool Solve(int maxChoosableInteger, int desiredTotal)
            {
                // Edge Case 1: Desired total is 0 or negative -> First player wins immediately
                if (desiredTotal <= 0) return true;

                // Edge Case 2: Sum of all integers cannot reach desiredTotal -> Impossible to win
                int maxPossibleSum = (maxChoosableInteger * (maxChoosableInteger + 1)) / 2;
                if (maxPossibleSum < desiredTotal) return false;

                // Edge Case 3: Sum of all integers equals desiredTotal
                // Odd number of turns => Player 1 wins; Even number of turns => Player 2 wins
                if (maxPossibleSum == desiredTotal)
                {
                    return (maxChoosableInteger % 2) != 0;
                }

                // Memoization table: 0 = unvisited, 1 = true, 2 = false
                // State size: 2^(maxChoosableInteger + 1)
                byte[] memo = new byte[1 << (maxChoosableInteger + 1)];

                return MinimaxDfs(0, desiredTotal, maxChoosableInteger, memo);
            }

            private static bool MinimaxDfs(int usedMask, int remainingTotal, int maxChoosable, byte[] memo)
            {
                if (memo[usedMask] != 0)
                {
                    return memo[usedMask] == 1;
                }

                for (int i = 1; i <= maxChoosable; i++)
                {
                    int bit = 1 << i;
                    // If number i has not been chosen yet
                    if ((usedMask & bit) == 0)
                    {
                        // Invariant: If picking i reaches or exceeds remaining total, player wins immediately!
                        if (i >= remainingTotal)
                        {
                            memo[usedMask] = 1;
                            return true;
                        }

                        // Explore: Pass state to opponent.
                        // If opponent cannot win from this resulting state, current player wins!
                        if (!MinimaxDfs(usedMask | bit, remainingTotal - i, maxChoosable, memo))
                        {
                            memo[usedMask] = 1;
                            return true;
                        }
                    }
                }

                memo[usedMask] = 2; // All moves lead to opponent winning -> current player loses
                return false;
            }
        }

        // =========================================================================
        // 4. VERIFICATION & SELF-VALIDATING TEST HARNESS
        // =========================================================================

        public static void Main()
        {
            Console.WriteLine("=================================================================");
            Console.WriteLine("🧪 RUNNING DAY 202: DYNAMIC GAME THEORY & MEMOIZED MINIMAX SUITE");
            Console.WriteLine("=================================================================");

            // -------------------------------------------------------------
            // TEST 1: LeetCode 877 / 486 (Predict The Winner / Stone Game)
            // -------------------------------------------------------------
            int[] piles1 = { 5, 3, 4, 5 }; // Alice wins
            Debug.Assert(StoneGame.PredictTheWinner(piles1) == true, "Test 1A Failed: Alice should win on [5, 3, 4, 5]");

            int[] piles2 = { 1, 5, 2 }; // Odd length: P1 choices: 1 or 2. If 1 -> P2 takes 5. If 2 -> P2 takes 5. P1 loses!
            Debug.Assert(StoneGame.PredictTheWinner(piles2) == false, "Test 1B Failed: P1 should lose on [1, 5, 2]");

            int[] piles3 = { 1, 5, 233, 7 }; // P1 picks 1, P2 picks 233... P1 loses or wins?
            // If P1 picks 7 -> remaining [1, 5, 233]. P2 picks 233 -> P2 score = 233. P1 loses!
            // Wait, what does DP say?
            bool p1CanWin3 = StoneGame.PredictTheWinner(piles3);
            Debug.Assert(p1CanWin3 == true, "Test 1C Failed: On even length [1, 5, 233, 7], P1 always wins");
            Console.WriteLine("  [PASS] Test 1: Interval Game DP (LC 877 / LC 486) Verified.");

            // -------------------------------------------------------------
            // TEST 2: LeetCode 1140 (Stone Game II)
            // -------------------------------------------------------------
            int[] s2Piles1 = { 2, 7, 9, 4, 4 };
            int aliceStones1 = StoneGameII.MaxStonesAlice(s2Piles1);
            // Expected: 10
            Debug.Assert(aliceStones1 == 10, $"Test 2A Failed: Expected 10 stones, got {aliceStones1}");

            int[] s2Piles2 = { 1, 2, 3, 4, 5, 100 };
            int aliceStones2 = StoneGameII.MaxStonesAlice(s2Piles2);
            // Expected: 104
            Debug.Assert(aliceStones2 == 104, $"Test 2B Failed: Expected 104 stones, got {aliceStones2}");
            Console.WriteLine("  [PASS] Test 2: Variable Pickup Suffix Sum DP (LC 1140) Verified.");

            // -------------------------------------------------------------
            // TEST 3: LeetCode 464 (Can I Win)
            // -------------------------------------------------------------
            // maxChoosable = 10, desired = 11 -> P1 can pick 10 (needs 1). P2 picks 1? No!
            // If P1 picks 1, remaining = 10. P2 can pick 10 and win!
            // Can P1 win for (10, 11)?
            // If P1 picks 10 -> leaves 1 -> P2 picks 1 (total 11) -> P2 wins.
            // If P1 picks any x -> leaves 11 - x <= 10 -> P2 picks 11 - x and wins!
            // Therefore, for (10, 11), P1 MUST LOSE!
            Debug.Assert(CanIWin.Solve(10, 11) == false, "Test 3A Failed: (10, 11) must be false");

            // maxChoosable = 10, desired = 0 -> True immediately
            Debug.Assert(CanIWin.Solve(10, 0) == true, "Test 3B Failed: (10, 0) must be true");

            // maxChoosable = 10, desired = 1 -> True (P1 picks 1)
            Debug.Assert(CanIWin.Solve(10, 1) == true, "Test 3C Failed: (10, 1) must be true");

            // maxChoosable = 10, desired = 40 -> Sum 1..10 = 55 >= 40.
            bool canWin40 = CanIWin.Solve(10, 40);
            Debug.Assert(canWin40 == false, "Test 3D Failed: (10, 40) must be false");

            // maxChoosable = 4, desired = 6 -> Sum = 10.
            // If P1 picks 1 -> remaining 5. P2 can pick 4 (total 5? no, 1+4=5 < 6).
            // Actually, for (4, 6): True!
            Debug.Assert(CanIWin.Solve(4, 6) == true, "Test 3E Failed: (4, 6) must be true");
            Console.WriteLine("  [PASS] Test 3: Bitmask Memoized Minimax (LC 464) Verified.");

            // -------------------------------------------------------------
            // TEST 4: Performance & Memory Scaling Benchmark
            // -------------------------------------------------------------
            var sw = Stopwatch.StartNew();
            for (int i = 0; i < 500; i++)
            {
                StoneGameII.MaxStonesAlice(s2Piles1);
                CanIWin.Solve(10, 11);
            }
            sw.Stop();
            Console.WriteLine($"  [BENCHMARK] 1,000 Dynamic Game Solutions Completed in: {sw.ElapsedMilliseconds} ms ({sw.Elapsed.TotalMicroseconds / 1000:F2} µs/op)");

            Console.WriteLine("=================================================================");
            Console.WriteLine("✅ ALL DYNAMIC GAME THEORY VERIFICATIONS SUCCESSFULLY PASSED!");
            Console.WriteLine("=================================================================");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Complexity, Proofs & Performance Profile

### Complexity Matrix

| Problem | Time Complexity | Auxiliary Space | State Bounding Invariant |
| :--- | :--- | :--- | :--- |
| **Stone Game ([LC 877])** | $\mathcal{O}(1)$ Math / $\mathcal{O}(N^2)$ DP | $\mathcal{O}(N^2)$ table | Parity theorem (even length array) |
| **Stone Game II ([LC 1140])**| $\mathcal{O}(N^3)$ (or $\mathcal{O}(N^2)$ tight) | $\mathcal{O}(N^2)$ table | $M \le N$, $X \le 2M$, suffix sum complement |
| **Can I Win ([LC 464])** | $\mathcal{O}(2^M \cdot M)$ | $\mathcal{O}(2^M)$ flat byte array | $M \le 20 \implies 2^{21}$ bytes $\approx 2\text{ MB}$ |

---

### Formal Mathematical Proofs

#### Theorem 1: The Even/Odd Parity Forced Win in [LC 877]
*Claim:* In a game where $N$ is even, elements are chosen from boundaries, and total stone sum is odd, Player 1 can guarantee victory on turn 1.

*Proof:*
1. Let the array be indexed $0, 1, 2, \dots, N-1$.
2. The indices partition into two disjoint sets:
   $$\text{EvenIndices} = \{0, 2, 4, \dots, N-2\}, \quad \text{OddIndices} = \{1, 3, 5, \dots, N-1\}$$
3. Compute the sum of stones in each partition:
   $$S_{\text{even}} = \sum_{k=0}^{N/2 - 1} \text{piles}[2k], \quad S_{\text{odd}} = \sum_{k=0}^{N/2 - 1} \text{piles}[2k + 1]$$
4. Since $S_{\text{total}} = S_{\text{even}} + S_{\text{odd}}$ is odd, $S_{\text{even}} \neq S_{\text{odd}}$.
   Therefore, either $S_{\text{even}} > S_{\text{odd}}$ or $S_{\text{odd}} > S_{\text{even}}$.
5. **Case 1 ($S_{\text{even}} > S_{\text{odd}}$):**
   - Player 1 chooses `piles[0]` (an even index).
   - The remaining subarray is $[1, N-1]$. Both available boundary choices (`1` and `N-1`) are **odd indices**!
   - Player 2 is forced to choose an odd index (say, index $j$).
   - This exposes an even index adjacent to $j$ to Player 1.
   - Player 1 chooses that even index, once again leaving only odd indices exposed to Player 2.
   - By induction, Player 1 collects every element in $\text{EvenIndices}$.
   - Player 1 score $= S_{\text{even}} > S_{\text{odd}} =$ Player 2 score. Player 1 wins.
6. **Case 2 ($S_{\text{odd}} > S_{\text{even}}$):**
   - Player 1 chooses `piles[N-1]` (an odd index), similarly forcing Player 2 to take only even indices. Player 1 wins.
7. Thus, Player 1 can force a win in all configurations where $N$ is even and the sum is odd. $\blacksquare$

---

## 4. 🎬 DEMONSTRATE: Canonical Traces & Step-by-Step Executions

### Execution Trace: Can I Win for `maxChoosable = 4`, `desiredTotal = 6`

Pool: $\{1, 2, 3, 4\}$. Target: $6$. Max possible sum = $10 \ge 6$.

```
Frame 0: P1 evaluates options from pool {1, 2, 3, 4}.
  Option 1: P1 picks 4.
    Remaining needed: 6 - 4 = 2.
    P2 turn. Pool left: {1, 2, 3}.
    P2 checks: can P2 pick >= 2?
    Yes! P2 picks 2 (or 3) and reaches >= 2 -> P2 WINS!
    From P1's perspective, picking 4 allows opponent to win. Option 4 FAILS.

  Option 2: P1 picks 3.
    Remaining needed: 6 - 3 = 3.
    P2 turn. Pool left: {1, 2, 4}.
    P2 checks: can P2 pick >= 3?
    P2 picks 4 (or 3 if available) and reaches >= 3 -> P2 WINS!
    From P1's perspective, Option 3 FAILS.

  Option 3: P1 picks 1.
    Remaining needed: 6 - 1 = 5.
    P2 turn. Pool left: {2, 3, 4}.
    Can P2 win immediately? Highest pick is 4 < 5. P2 CANNOT win immediately!
    Now evaluate P2's moves:
      - If P2 picks 4: leaves remaining 1. Pool {2, 3}. P1 picks 2 >= 1 -> P1 WINS!
      - If P2 picks 3: leaves remaining 2. Pool {2, 4}. P1 picks 2 >= 2 -> P1 WINS!
      - If P2 picks 2: leaves remaining 3. Pool {3, 4}. P1 picks 3 >= 3 -> P1 WINS!
    In EVERY branch P2 explores, P1 has a winning response!
    Therefore, P2 has NO winning moves from state (used = 0b00010, remaining = 5).
    P2 LOSES!
    Which means: Option 1 (P1 picking 1) is a GUARANTEED WIN FOR P1!

Result: CanIWin(4, 6) = TRUE. (Winning move: Pick 1).
```

---

## 5. 🏋️ PRACTICE: Progressive Rigorous Drills

### Drill 1: [LeetCode 1406] Stone Game III (Preview)
**Problem:** In Stone Game III, a player can take $1, 2,$ or $3$ piles from the front of `piles`. Values can be negative! Return `"Alice"`, `"Bob"`, or `"Tie"`.

*Solution:*
- Suffix DP formulation:
  $$dp[i] = \max_{X \in \{1, 2, 3\}} \left( \sum_{k=0}^{X-1} \text{piles}[i + k] - dp[i + X] \right)$$
- Base case: $dp[N] = 0$.
- Because each state only depends on $dp[i+1], dp[i+2], dp[i+3]$, the space complexity can be optimized from $\mathcal{O}(N)$ to $\mathcal{O}(1)$ using three rolling variables!

```csharp
public static string StoneGameIII(int[] piles)
{
    int n = piles.Length;
    int a = 0, b = 0, c = 0; // dp[i+1], dp[i+2], dp[i+3]

    for (int i = n - 1; i >= 0; i--)
    {
        int ans = int.MinValue;
        int sum = 0;
        for (int k = 1; k <= 3 && i + k <= n; k++)
        {
            sum += piles[i + k - 1];
            int next = (k == 1) ? a : (k == 2) ? b : c;
            ans = Math.Max(ans, sum - next);
        }
        c = b;
        b = a;
        a = ans;
    }

    if (a > 0) return "Alice";
    if (a < 0) return "Bob";
    return "Tie";
}
```

---

## 6. 🔗 CONNECT: Real-World Systems & Cross-Domain Mappings

### Dynamic Game Theory in Distributed Infrastructure

```
========================================================================================================
                          ENTERPRISE RESOURCE AUCTIONS & ALLOCATION MAPPINGS
========================================================================================================

Theoretical Concept          Cloud Infrastructure (AWS / Azure) Financial High-Frequency Trading
--------------------------------------------------------------------------------------------------------
Suffix Sum Complement        Spot Instance Auction Reserve      Liquidity Replenishment
(Total - Opponent optimal)   (Allocates spot VM capacity while (Calculates fill probability across order
                             maximizing provider net margin)    book depth minus market impact)

Bitmask State Elimination    Zero-Day Vulnerability Patching   Combinatorial Feature Bundle Pricing
(Single integer state key)   (Models exploit sequences where    (Evaluates optimal SaaS tier discounting
                             each CVE can only be patched once) where product add-ons are chosen once)
========================================================================================================
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint: Single 32-Bit Bitmask Memoization in [LC 464]

**Question:**
In [LC 464] (Can I Win), why can we memoize states using a single 32-bit integer `usedNumbers` without tracking the running score `currentTotal` in the memoization key?

**Production Answer:**
1. **Mathematical Invariance of Path Totals:**
   - In [LC 464], integers are chosen from the set $\{1, 2, \dots, M\}$ without replacement.
   - Let $S \subseteq \{1, 2, \dots, M\}$ be the subset of integers that have been chosen so far.
   - The running sum of chosen numbers is uniquely defined by:
     $$\text{currentTotal} = \sum_{x \in S} x$$
   - Regardless of the order in which the numbers in $S$ were selected (e.g., choosing $1$ then $4$ vs choosing $4$ then $1$), the running total is identically $5$.

2. **Bijection from Bitmask to Running Total:**
   - The 32-bit integer `usedNumbers` encodes the subset $S$ as a bitmask where the $k$-th bit is $1 \iff k \in S$.
   - Because `currentTotal` is a deterministic function of `usedNumbers` ($\text{currentTotal} = f(\text{usedNumbers})$), adding `currentTotal` to the memoization tuple `(usedNumbers, currentTotal)` would be completely redundant.
   - Any two search paths that produce the same `usedNumbers` bitmask must have:
     1. The exact same remaining pool of numbers available to be chosen.
     2. The exact same accumulated total, and therefore the exact same remaining distance to `desiredTotal`.
   - Hence, `usedNumbers` is a necessary and sufficient coordinate to uniquely identify the game state. Memoizing on `usedNumbers` alone reduces the state space to at most $2^{M+1}$ entries ($2^{21}$ bytes $\approx 2\text{ MB}$), which fits into a contiguous flat array with $\mathcal{O}(1)$ cache-line lookup times.
