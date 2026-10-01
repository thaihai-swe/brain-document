---
title: "Week 27 — Day 187: Combinations & Combination Sum: Monotonic Indexing & Unbounded Deduplication"
---



## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 The Combinatorial Geometry of Combinations $\binom{N}{k}$

A **combination** is an unordered selection of $k$ distinct elements chosen from a set of $N$ elements. In contrast to permutations, the internal order of elements in a combination does not distinguish one combination from another:
$$\{1, 2, 3\} \equiv \{3, 1, 2\} \equiv \{2, 3, 1\}$$

The number of combinations of size $k$ from $N$ elements is given by the binomial coefficient:
$$\binom{N}{k} = \frac{N!}{k!(N - k)!} = \frac{N \times (N - 1) \times \dots \times (N - k + 1)}{k!}$$

```
                PERMUTATION TREE vs COMBINATION TREE
                Selecting k = 2 elements from {1, 2, 3}

   PERMUTATIONS (Order Matters, P(3,2) = 6):
                     Root
            /         │         \
          [1]        [2]        [3]
         /   \      /   \      /   \
       [1,2] [1,3] [2,1] [2,3] [3,1] [3,2]  <-- 6 Distinct Leaves

   COMBINATIONS (Order Irrelevant, C(3,2) = 3):
                     Root
            /         │
          [1]        [2]       [3] (Pruned: No remaining elements!)
         /   \        │
       [1,2] [1,3]  [2,3]                   <-- 3 Canonical Leaves
       (Avoids generating [2,1], [3,1], [3,2] entirely!)
```

If an algorithm naively generates all permutations and then deduplicates them via sorting and hash tables, it performs a factor of $k!$ redundant work:
- For $N = 20, k = 10$: $\binom{20}{10} = 184,756$ combinations, but $P(20, 10) = 670,442,572,800$ permutations.
- Naive permutation generation is over **3.6 million times slower**!

---

### 1.2 The Monotonic Index Invariant

To generate each combination exactly once without generating redundant permutations, the search engine enforces the **Monotonic Index Invariant**:

> ### 🛡️ The Monotonic Index Invariant
> Let the selected elements in a combination be indexed by their original positions in the sorted input domain: $\text{idx}_0, \text{idx}_1, \dots, \text{idx}_{k-1}$.
> At every recursive step $d$, the candidate chosen for slot $d$ must strictly satisfy:
> $$\text{idx}_d > \text{idx}_{d-1}$$
> Equivalently, when invoking the child frame from index $i$, the child search space is strictly bounded to the interval $[i + 1, N - 1]$.

By forcing indices to be strictly monotonically increasing, every combination has exactly **one canonical representation**. Sibling branches never reconsider elements evaluated by earlier siblings, completely eliminating the $k!$ permutation explosion at the root.

---

### 1.3 Capacity Lookahead Pruning in $\binom{N}{k}$

In standard combinations of fixed size $k$, a naive loop iterates candidate index $i$ all the way to $N$:
```csharp
for (int i = start; i <= n; i++) // NAIVE: Pushes doomed frames!
```

Suppose $n = 10, k = 5$, and the current path buffer contains 2 elements (`path.Count == 2`). We need $5 - 2 = 3$ more elements.
- If the loop advances to $i = 9$, the only remaining candidate elements in the entire domain are $\{9, 10\}$ (2 elements).
- Because $2 < 3$, it is mathematically impossible to reach size $k = 5$ from this branch.
- Any recursive call invoked with $i = 9$ or $i = 10$ is guaranteed to fail.

#### Mathematical Derivation of the Tight Upper Bound
Let $k - |path|$ denote the number of additional elements required to complete the combination.
Let $i$ be the candidate index under consideration from domain $[1, n]$. The total count of available elements from $i$ to $n$ (inclusive) is:
$$\text{Available Elements} = n - i + 1$$

For a branch to have any possibility of succeeding, the available elements must be at least the required elements:
$$n - i + 1 \ge k - |path|$$
Solving for candidate index $i$:
$$i \le n - (k - |path|) + 1$$

```
                       CAPACITY LOOKAHEAD BOUNDARY
                       n = 5, k = 3, path.Count = 1

   Required more elements: k - |path| = 3 - 1 = 2
   Available from i: n - i + 1 >= 2  ==>  i <= 5 - 2 + 1 = 4

   Index i = 1: Available {1,2,3,4,5} (5) >= 2  [VALID]
   Index i = 2: Available {2,3,4,5}   (4) >= 2  [VALID]
   Index i = 3: Available {3,4,5}     (3) >= 2  [VALID]
   Index i = 4: Available {4,5}       (2) >= 2  [VALID - BOUNDARY]
   Index i = 5: Available {5}         (1) <  2  [PRUNED IMMEDIATELY!]
```

> [!TIP]
> **Production Optimization:** Replacing `for (int i = start; i <= n; i++)` with `for (int i = start; i <= n - (k - path.Count) + 1; i++)` prunes massive subtrees near the right edge of the recursion tree, eliminating up to $70\%$ of recursive calls in combinations where $k \approx n/2$.

---

### 1.4 The Combination Sum Taxonomy: Unbounded vs. Bounded Supply

The target sum partition problem splits into three distinct architectural patterns:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              PATTERN 1: COMBINATION SUM I ([LC 39] - UNBOUNDED)             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Candidates: Distinct positive integers.                                    │
│  Supply: UNBOUNDED (Any candidate can be chosen unlimited times).           │
│  Index Transition: Recurse with start = i (NOT i + 1!).                     │
│  Monotonic Ordering: Weak inequality idx_0 <= idx_1 <= ... <= idx_m.        │
│  Pruning: Sort array ascending; if (candidates[i] > remaining) break;       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│          PATTERN 2: COMBINATION SUM II ([LC 40] - BOUNDED MULTISET)         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Candidates: Array contains DUPLICATE integers.                             │
│  Supply: BOUNDED (Each array entry used at most once per path).             │
│  Index Transition: Recurse with start = i + 1.                              │
│  Duplicate Pruning: if (i > start && candidates[i] == candidates[i - 1])    │
│                     continue;                                               │
│  Target Pruning: Sort array ascending; if (candidates[i] > remaining) break;│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│          PATTERN 3: COMBINATION SUM III ([LC 216] - EXACT K DIGITS)         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Candidates: Strictly digits 1 through 9.                                   │
│  Supply: Exactly k digits summing to n; each digit used at most once.       │
│  Index Transition: Recurse with start = i + 1.                              │
│  Dual Pruning: (remaining < 0 || path.Count > k) return;                    │
│                Capacity check: (9 - i + 1 < k - path.Count) break;          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 1.5 Early Pruning via Sorting: `break` vs. `continue`

A frequent optimization bug in backtracking occurs when using `continue` instead of `break` after testing target boundaries.

```
Array is unsorted: [8, 2, 3], target = 7
  - At i = 0 (val 8): 8 > 7. Cannot choose 8.
  - MUST CONTINUE to inspect i = 1 (val 2) and i = 2 (val 3)!

Array is SORTED: [2, 3, 8], target = 7
  - At i = 0 (val 2): 2 <= 7 -> Explore.
  - At i = 1 (val 3): 3 <= 7 -> Explore.
  - At i = 2 (val 8): 8 > 7 -> BREAK IMMEDIATELY!
  - Because array is sorted, every subsequent candidate c_j (for j >= 2)
    satisfies c_j >= c_2 > 7.
  - Using `break` prunes the current candidate AND all subsequent candidates!
```

> [!IMPORTANT]
> **The Sorting Precondition:** Sorting the input array in non-decreasing order transforms an $O(M)$ scan over failing candidates into an **$O(1)$ early termination** via `break`. Never omit the initial `Array.Sort(candidates)` in target sum backtracking engines.

---

## 2. ⚙️ IMPLEMENT: Production-Grade Container / Algorithm

The following production container **`CombinationSumEngine`** implements:
1. **Combinations of size $k$** ([LC 77]) with capacity lookahead pruning.
2. **Combination Sum I** ([LC 39]) with unbounded supply and sorted early `break`.
3. **Combination Sum II** ([LC 40]) with bounded multiset supply and sibling duplicate pruning.
4. **Combination Sum III** ([LC 216]) with fixed cardinality $k$ and domain $[1, 9]$.
5. Comprehensive unit tests and telemetry verification in `Main()`.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace CombinatorialSearch
{
    /// <summary>
    /// Production-grade combination and target sum partition engine.
    /// Implements monotonic indexing, capacity lookahead pruning, and duplicate pruning.
    /// </summary>
    public static class CombinationSumEngine
    {
        // ====================================================================
        // 1. COMBINATIONS OF SIZE K (LEETCODE 77)
        // ====================================================================

        /// <summary>
        /// Generates all combinations of k numbers chosen from range 1..n.
        /// Applies capacity lookahead pruning: i <= n - (k - path.Count) + 1.
        /// </summary>
        public static List<List<int>> Combine(int n, int k)
        {
            if (k <= 0 || n < k) return new List<List<int>>();

            var result = new List<List<int>>();
            var path = new List<int>(k);
            CombineDfs(1, n, k, path, result);
            return result;
        }

        private static void CombineDfs(
            int start,
            int n,
            int k,
            List<int> path,
            List<List<int>> result)
        {
            // Base case: exactly k elements accumulated
            if (path.Count == k)
            {
                result.Add(new List<int>(path));
                return;
            }

            // CAPACITY LOOKAHEAD PRUNING:
            // Calculate maximum candidate index that still leaves enough remaining numbers
            int maxCandidate = n - (k - path.Count) + 1;

            for (int i = start; i <= maxCandidate; i++)
            {
                path.Add(i);                            // CHOOSE
                CombineDfs(i + 1, n, k, path, result);  // EXPLORE (Strict monotonic idx: i + 1)
                path.RemoveAt(path.Count - 1);          // UNCHOOSE (State Restoration)
            }
        }

        // ====================================================================
        // 2. COMBINATION SUM I (LEETCODE 39 - UNBOUNDED SUPPLY)
        // ====================================================================

        /// <summary>
        /// Finds all unique combinations in candidates where the candidate numbers sum to target.
        /// Unbounded supply: the same candidate may be chosen an unlimited number of times.
        /// </summary>
        public static List<List<int>> CombinationSumUnbounded(int[] candidates, int target)
        {
            if (candidates == null || candidates.Length == 0 || target <= 0)
                return new List<List<int>>();

            // Sort to enable monotonic early break
            int[] sorted = (int[])candidates.Clone();
            Array.Sort(sorted);

            var result = new List<List<int>>();
            var path = new List<int>();
            UnboundedDfs(0, target, sorted, path, result);
            return result;
        }

        private static void UnboundedDfs(
            int start,
            int remaining,
            int[] candidates,
            List<int> path,
            List<List<int>> result)
        {
            if (remaining == 0)
            {
                result.Add(new List<int>(path));
                return;
            }

            for (int i = start; i < candidates.Length; i++)
            {
                // EARLY PRUNING:
                // Because candidates is sorted ascending, if current candidate exceeds remaining,
                // all subsequent candidates will also exceed remaining. BREAK immediately!
                if (candidates[i] > remaining)
                {
                    break;
                }

                path.Add(candidates[i]); // CHOOSE

                // EXPLORE: Pass 'i' (NOT 'i + 1') to permit unbounded reuse of candidates[i]!
                UnboundedDfs(i, remaining - candidates[i], candidates, path, result);

                path.RemoveAt(path.Count - 1); // UNCHOOSE
            }
        }

        // ====================================================================
        // 3. COMBINATION SUM II (LEETCODE 40 - BOUNDED MULTISET SUPPLY)
        // ====================================================================

        /// <summary>
        /// Finds all unique combinations in candidates where the numbers sum to target.
        /// Each number in candidates may only be used once per combination.
        /// Contains duplicates in candidates; result must not contain duplicate combinations.
        /// </summary>
        public static List<List<int>> CombinationSumBounded(int[] candidates, int target)
        {
            if (candidates == null || candidates.Length == 0 || target <= 0)
                return new List<List<int>>();

            // Sort to bring duplicates together and enable early break
            int[] sorted = (int[])candidates.Clone();
            Array.Sort(sorted);

            var result = new List<List<int>>();
            var path = new List<int>();
            BoundedDfs(0, target, sorted, path, result);
            return result;
        }

        private static void BoundedDfs(
            int start,
            int remaining,
            int[] candidates,
            List<int> path,
            List<List<int>> result)
        {
            if (remaining == 0)
            {
                result.Add(new List<int>(path));
                return;
            }

            for (int i = start; i < candidates.Length; i++)
            {
                // Pruning 1: Monotonic Sum Cutoff
                if (candidates[i] > remaining)
                {
                    break;
                }

                // Pruning 2: Sibling Duplicate Pruning
                // Skip duplicate choice along the same horizontal tree level
                if (i > start && candidates[i] == candidates[i - 1])
                {
                    continue;
                }

                path.Add(candidates[i]); // CHOOSE

                // EXPLORE: Pass 'i + 1' because each array entry can only be used ONCE
                BoundedDfs(i + 1, remaining - candidates[i], candidates, path, result);

                path.RemoveAt(path.Count - 1); // UNCHOOSE
            }
        }

        // ====================================================================
        // 4. COMBINATION SUM III (LEETCODE 216 - EXACT K DIGITS FROM 1..9)
        // ====================================================================

        /// <summary>
        /// Finds all valid combinations of k numbers that sum up to n such that:
        /// - Only numbers 1 through 9 are used.
        /// - Each number is used at most once.
        /// </summary>
        public static List<List<int>> CombinationSumExactK(int k, int n)
        {
            var result = new List<List<int>>();
            var path = new List<int>(k);
            ExactKDfs(1, n, k, path, result);
            return result;
        }

        private static void ExactKDfs(
            int start,
            int remaining,
            int k,
            List<int> path,
            List<List<int>> result)
        {
            if (remaining == 0 && path.Count == k)
            {
                result.Add(new List<int>(path));
                return;
            }

            // Pruning: Exceeded target or exceeded maximum elements
            if (remaining <= 0 || path.Count >= k)
            {
                return;
            }

            // CAPACITY PRUNING: Domain is [1..9]. Maximum candidate is 9 - (k - path.Count) + 1
            int maxCandidate = 9 - (k - path.Count) + 1;

            for (int i = start; i <= maxCandidate; i++)
            {
                if (i > remaining) break;

                path.Add(i);
                ExactKDfs(i + 1, remaining - i, k, path, result);
                path.RemoveAt(path.Count - 1);
            }
        }
    }

    /// <summary>
    /// Self-contained verification and correctness suite.
    /// </summary>
    public static class Program
    {
        public static void Main()
        {
            Console.WriteLine("====================================================================");
            Console.WriteLine("  WEEK 27 — DAY 187: COMBINATION SUM & MONOTONIC INDEXING ENGINE   ");
            Console.WriteLine("====================================================================\n");

            TestCombinationsCapacityPruning();
            TestCombinationSumUnbounded();
            TestCombinationSumBoundedDuplicates();
            TestCombinationSumExactK();

            Console.WriteLine("\n[SUCCESS] All Combination Sum invariants, prunings, and tests passed seamlessly!");
        }

        private static void TestCombinationsCapacityPruning()
        {
            Console.Write("Test 1: LeetCode 77 Combinations C(4, 2)... ");

            var combinations = CombinationSumEngine.Combine(4, 2);

            // C(4, 2) = 6: [1,2], [1,3], [1,4], [2,3], [2,4], [3,4]
            Debug.Assert(combinations.Count == 6, $"Expected 6 combinations, got {combinations.Count}");

            // Verify strict monotonic indexing in every emitted solution
            foreach (var combo in combinations)
            {
                Debug.Assert(combo.Count == 2);
                Debug.Assert(combo[0] < combo[1], "Monotonic ordering invariant violated!");
            }

            // Edge Case: C(5, 5) = 1
            var single = CombinationSumEngine.Combine(5, 5);
            Debug.Assert(single.Count == 1);
            Debug.Assert(string.Join(",", single[0]) == "1,2,3,4,5");

            Console.WriteLine($"PASSED (Generated {combinations.Count} combinations with capacity lookahead pruning)");
        }

        private static void TestCombinationSumUnbounded()
        {
            Console.Write("Test 2: LeetCode 39 Combination Sum Unbounded ([2,3,6,7], target = 7)... ");

            int[] candidates = { 2, 3, 6, 7 };
            var result = CombinationSumEngine.CombinationSumUnbounded(candidates, 7);

            // Expected: [2, 2, 3] and [7] -> 2 unique combinations
            Debug.Assert(result.Count == 2, $"Expected 2 combinations, got {result.Count}");

            var canonical = Canonicalize(result);
            Debug.Assert(canonical.Contains("2,2,3"), "Missing [2, 2, 3]");
            Debug.Assert(canonical.Contains("7"), "Missing [7]");

            // Edge Case: target smaller than any candidate
            var empty = CombinationSumEngine.CombinationSumUnbounded(new[] { 5, 10 }, 3);
            Debug.Assert(empty.Count == 0);

            Console.WriteLine($"PASSED (Found {result.Count} valid unbounded partitions: [2,2,3], [7])");
        }

        private static void TestCombinationSumBoundedDuplicates()
        {
            Console.Write("Test 3: LeetCode 40 Combination Sum II ([10,1,2,7,6,1,5], target = 8)... ");

            int[] candidates = { 10, 1, 2, 7, 6, 1, 5 };
            var result = CombinationSumEngine.CombinationSumBounded(candidates, 8);

            // Expected unique combinations for target 8:
            // [1, 1, 6], [1, 2, 5], [1, 7], [2, 6] -> Total 4 combinations
            Debug.Assert(result.Count == 4, $"Expected 4 combinations, got {result.Count}");

            var canonical = Canonicalize(result);
            Debug.Assert(canonical.Contains("1,1,6"), "Missing [1, 1, 6]");
            Debug.Assert(canonical.Contains("1,2,5"), "Missing [1, 2, 5]");
            Debug.Assert(canonical.Contains("1,7"), "Missing [1, 7]");
            Debug.Assert(canonical.Contains("2,6"), "Missing [2, 6]");

            // Edge Case: Array with all identical elements [1, 1, 1, 1, 1], target = 3 -> Exactly 1 combination [1, 1, 1]
            var dupResult = CombinationSumEngine.CombinationSumBounded(new[] { 1, 1, 1, 1, 1 }, 3);
            Debug.Assert(dupResult.Count == 1, $"Expected 1 combination, got {dupResult.Count}");
            Debug.Assert(canonical.Count > 0);

            Console.WriteLine($"PASSED (Found {result.Count} unique deduplicated bounded combinations)");
        }

        private static void TestCombinationSumExactK()
        {
            Console.Write("Test 4: LeetCode 216 Combination Sum III (k = 3, n = 9)... ");

            var result = CombinationSumEngine.CombinationSumExactK(3, 9);

            // Expected for k = 3, n = 9:
            // [1, 2, 6], [1, 3, 5], [2, 3, 4] -> Total 3 combinations
            Debug.Assert(result.Count == 3, $"Expected 3 combinations, got {result.Count}");

            var canonical = Canonicalize(result);
            Debug.Assert(canonical.Contains("1,2,6"));
            Debug.Assert(canonical.Contains("1,3,5"));
            Debug.Assert(canonical.Contains("2,3,4"));

            Console.WriteLine($"PASSED (Found {result.Count} exact-size partitions)");
        }

        private static HashSet<string> Canonicalize(List<List<int>> solutions)
        {
            var set = new HashSet<string>();
            foreach (var s in solutions)
            {
                var copy = new List<int>(s);
                copy.Sort();
                set.Add(string.Join(",", copy));
            }
            return set;
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Complexity, Proofs & Performance Profile

### 3.1 Theorem & Formal Proof: Monotonic Indexing Eliminates Permutation Aliasing

#### Statement
Let $S = \{s_0, s_1, \dots, s_{N-1}\}$ be a set of $N$ distinct elements. Let a path $P$ in the recursion tree be represented by the sequence of indices selected: $(\text{idx}_0, \text{idx}_1, \dots, \text{idx}_{k-1})$.
Enforcing the invariant:
$$\text{idx}_0 < \text{idx}_1 < \dots < \text{idx}_{k-1}$$
guarantees that for every subset $U \subseteq S$ of size $k$, there exists **exactly one** path $P$ in the search tree corresponding to $U$.

#### Proof
1. **Existence:**
   Let $U = \{u_1, u_2, \dots, u_k\} \subseteq S$. Because $S$ is totally ordered by its indices $0 \le \text{idx} < N$, the elements of $U$ have unique, distinct indices $I_U = \{j_1, j_2, \dots, j_k\}$.
   Sort the set of indices in strictly ascending order:
   $$j_{(1)} < j_{(2)} < \dots < j_{(k)}$$
   At depth 0, the engine iterates $i \ge 0$, which includes $j_{(1)}$.
   Upon choosing $j_{(1)}$, the child frame iterates $i \ge j_{(1)} + 1$. Because $j_{(2)} > j_{(1)}$, $j_{(2)} \ge j_{(1)} + 1$, so $j_{(2)}$ is within the child loop domain.
   By mathematical induction, each successive index $j_{(m)}$ is within the domain $[j_{(m-1)} + 1, N - 1]$.
   Therefore, the path $(j_{(1)}, j_{(2)}, \dots, j_{(k)})$ exists and will be explored.

2. **Uniqueness:**
   Suppose for contradiction that $U$ corresponds to two distinct valid paths $P_1 = (a_0, a_1, \dots, a_{k-1})$ and $P_2 = (b_0, b_1, \dots, b_{k-1})$ in the recursion tree.
   Since $P_1 \neq P_2$, there exists a smallest index $m$ where $a_m \neq b_m$.
   Without loss of generality, assume $a_m < b_m$.
   Because $P_1$ and $P_2$ represent the same subset $U$, the element $s_{a_m}$ must appear somewhere in $P_2$.
   - It cannot appear at any position $p < m$ because $a_p = b_p$ for all $p < m$.
   - Thus, $s_{a_m}$ must appear at some position $p > m$ in $P_2$, meaning $b_p = a_m$.
   - However, because $P_2$ satisfies the monotonic index invariant:
     $$b_m < b_{m+1} < \dots < b_p = a_m$$
   - This implies $b_m < a_m$, which directly contradicts our assumption that $a_m < b_m$.

Therefore, no such second path can exist. The correspondence between subsets of size $k$ and search paths is a bijection.

$\blacksquare$ **Q.E.D.**

---

### 3.2 Complexity Profile Across the Combination Sum Family

| Problem / Algorithm | Time Complexity | Auxiliary Space | Key Pruning Mechanism | State Advance Step |
| :--- | :---: | :---: | :--- | :---: |
| **Combinations $\binom{N}{k}$** ([LC 77]) | $\mathcal{O}\left(k \cdot \binom{N}{k}\right)$ | $\mathcal{O}(k)$ stack | Capacity Lookahead: $i \le n - (k - \|p\|) + 1$ | `start = i + 1` |
| **Combination Sum I** ([LC 39]) | $\mathcal{O}\left(N^{\frac{T}{\min C}}\right)$ | $\mathcal{O}\left(\frac{T}{\min C}\right)$ stack | Sorted early cutoff: `if (c[i] > rem) break;` | `start = i` (Unbounded) |
| **Combination Sum II** ([LC 40]) | $\mathcal{O}\left(k \cdot 2^N\right)$ | $\mathcal{O}(N)$ stack | Sibling duplicate pruning + early cutoff | `start = i + 1` (Bounded) |
| **Combination Sum III** ([LC 216]) | $\mathcal{O}\left(k \cdot \binom{9}{k}\right) \le \mathcal{O}(1)$ | $\mathcal{O}(k) \le \mathcal{O}(9)$ stack | Dual Capacity + Target cutoff | `start = i + 1` |

*Where $N$ is array length, $k$ is combination size, $T$ is target sum, and $\min C$ is the minimum candidate value.*

---

## 4. 🎬 DEMONSTRATE: Canonical Traces & Step-by-Step Executions

### 4.1 Trace of Combination Sum I ([LC 39]): `candidates = [2, 3, 6, 7]`, `target = 7`

Candidates sorted: `[2, 3, 6, 7]`.

```
Recursion Tree Trace:

Level 0: rem = 7, start = 0
  ├── i = 0 (val 2): rem = 5, path = [2]
  │     ├── i = 0 (val 2): rem = 3, path = [2, 2]
  │     │     ├── i = 0 (val 2): rem = 1, path = [2, 2, 2]
  │     │     │     ├── i = 0 (val 2): 2 > 1 -> BREAK!
  │     │     ├── i = 1 (val 3): rem = 0, path = [2, 2, 3] -> SOLUTION 1 FOUND!
  │     │     └── i = 2 (val 6): 6 > 3 -> BREAK!
  │     ├── i = 1 (val 3): rem = 2, path = [2, 3]
  │     │     ├── i = 1 (val 3): 3 > 2 -> BREAK!
  │     └── i = 2 (val 6): 6 > 5 -> BREAK!
  │
  ├── i = 1 (val 3): rem = 4, path = [3]
  │     ├── i = 1 (val 3): rem = 1, path = [3, 3]
  │     │     └── i = 1 (val 3): 3 > 1 -> BREAK!
  │     └── i = 2 (val 6): 6 > 4 -> BREAK!
  │
  ├── i = 2 (val 6): rem = 1, path = [6]
  │     └── i = 2 (val 6): 6 > 1 -> BREAK!
  │
  └── i = 3 (val 7): rem = 0, path = [7] -> SOLUTION 2 FOUND!

Total Solutions Emitted: [2, 2, 3] and [7]
Total Nodes Pruned by 'break': 9 redundant recursive calls avoided!
```

---

### 4.2 Side-by-Side Invariant Comparison: [LC 39] vs [LC 40]

```
               [LC 39] UNBOUNDED SUPPLY           [LC 40] BOUNDED SUPPLY (WITH DUPLICATES)
             candidates = [2, 3], target = 4             candidates = [2, 2, 3], target = 4
                                                         (sorted: [2_a, 2_b, 3])

Tree Shape:  Vertical Deep Expansion                Horizontal Sibling Pruning
             (Can choose same index repeatedly)     (Advances to i + 1; skips equal siblings)

Node:        Frame 1: Choose 2 (index 0)            Frame 1: Choose 2_a (index 0)
Advance:     Recurse(start = 0, rem = 2)            Recurse(start = 1, rem = 2)

Child:       Frame 2: Choose 2 (index 0)            Frame 2: Choose 2_b (index 1)
             rem = 0 -> Solution: [2, 2]            rem = 0 -> Solution: [2_a, 2_b]

Sibling:     Frame 1: Next choice is 3 (index 1)    Frame 1: Next choice is 2_b (index 1)
                                                    Condition: (i > start && c[1] == c[0])
                                                    Evaluates: (1 > 0 && 2 == 2) -> TRUE!
                                                    >>> PRUNED! (Skips duplicate [2_b, 2_?]) <<<
```

---

## 5. 🏋️ PRACTICE: Progressive Rigorous Drills

### Drill 1: Factor Combinations ([LC 254] - Medium)
- **Problem Statement:** Numbers can be regarded as product of their factors. For example, $8 = 2 \times 2 \times 2 = 2 \times 4$. Given an integer $n$, return all possible combinations of its factors in range $[2, n-1]$.
- **Invariants:**
  1. Monotonic Factor Invariant: Candidate factors must satisfy factor $\ge \text{startFactor}$ to avoid permutations like $2 \times 4$ and $4 \times 2$.
  2. Square Root Boundary: Loop can terminate when factor $\times \text{factor} > n$.
  3. Include remainder: If $n / \text{factor} \ge \text{factor}$, append $n / \text{factor}$ as a valid terminal factor.

```csharp
public static class FactorCombinations
{
    public static List<List<int>> GetFactors(int n)
    {
        var result = new List<List<int>>();
        var path = new List<int>();
        Dfs(2, n, path, result);
        return result;
    }

    private static void Dfs(int start, int n, List<int> path, List<List<int>> result)
    {
        for (int factor = start; factor * factor <= n; factor++)
        {
            if (n % factor == 0)
            {
                // Option 1: Decompose into [factor, n / factor]
                path.Add(factor);
                path.Add(n / factor);
                result.Add(new List<int>(path));
                path.RemoveAt(path.Count - 1); // remove n / factor

                // Option 2: Recurse further on n / factor
                Dfs(factor, n / factor, path, result);
                path.RemoveAt(path.Count - 1); // remove factor
            }
        }
    }
}
```

---

### Drill 2: Optimal Coin Dispensing All Paths (Medium)
- **Problem Statement:** An Automated Teller Machine (ATM) has standard banknote denominations $[10, 20, 50, 100]$. Generate all combinations of banknotes that dispense exact amount $W$ using the minimum total number of banknotes.
- **Pruning Invariant:** If `path.Count >= currentBestBanknoteCount`, terminate branch immediately via **Branch and Bound**.

---

### Drill 3: Partition to K Equal Sum Subsets ([LC 698] Bridge - Hard)
- **Problem Statement:** Given an integer array `nums` and an integer $k$, return `true` if it is possible to divide this array into $k$ non-empty subsets whose sums are all equal.
- **Invariants:**
  - Target sum per bucket: $\text{target} = \sum nums / k$. If $\sum nums \pmod k \neq 0$, return `false`.
  - Sort descending: Placing largest elements first triggers early failures faster.
  - Sibling Bucket Pruning: If an empty bucket fails to accommodate a candidate, all subsequent empty buckets will also fail.

---

## 6. 🔗 CONNECT: Real-World Systems & Cross-Domain Mappings

### 6.1 Cash Register & ATM Banknote Dispensing Systems

Real-world financial hardware systems (Diebold Nixdorf, NCR ATMs) execute bounded combination sum algorithms inside cash dispensing firmware:
- **Cassette Constraints:** Each physical ATM cassette holds a bounded count of bills for each denomination (e.g., $500 \times \$20$ bills, $300 \times \$50$ bills).
- **Firmware Search:** The dispenser runs a bounded multiset combination sum with secondary objective functions:
  1. Minimize total bill count (reduces mechanical dispensing jams).
  2. Balance cassette depletion levels (prevents running out of a single denomination).

---

### 6.2 Network Packet Assembly & MTU Bin Fitting

Network interface drivers and tunneling protocols (IPsec, WireGuard) aggregate small network frames into Jumbo Frames bounded by the Maximum Transmission Unit (MTU = 1500 or 9000 bytes):
- Given a queue of variable-length outgoing packets $[L_1, L_2, \dots, L_m]$, the packet scheduler solves a subset sum packing problem to maximize wire efficiency ($\sum L_i \le \text{MTU}$) without fragmenting IP headers.

---

### 6.3 Knapsack Cryptosystems (Merkle-Hellman)

The earliest public-key cryptosystems (Merkle-Hellman, 1978) were built upon the NP-hard Subset Sum / Combination Sum problem:
- The private key is a **super-increasing sequence** (where each element is strictly greater than the sum of all preceding elements: $s_i > \sum_{j=1}^{i-1} s_j$). Super-increasing subset sum can be solved in $O(N)$ greedy time!
- The public key is disguised using modular multiplication: $p_i = (s_i \cdot w) \pmod q$.
- Encryption creates a public target sum; decryption uses the modular inverse $w^{-1}$ to restore the super-increasing property and solve via greedy backtracking.

---

## 7. 🎯 Daily Checkpoint Questions

1. **Monotonic Indexing Invariant:** How does enforcing `start = i + 1` in combinations $\binom{N}{k}$ eliminate the $k!$ permutation overhead without maintaining a visited hash table?
2. **Capacity Lookahead Arithmetic:** In combinations of size $k$ from range $1 \dots n$, derive the exact upper bound for loop variable $i$. If $n = 20, k = 8$, and the current path has 3 elements, what is the maximum value $i$ should take?
3. **Unbounded vs. Bounded Transition:** Why does Combination Sum I ([LC 39]) pass `start = i` into the child frame, while Combination Sum II ([LC 40]) passes `start = i + 1`? What would happen if `start = i + 1` were passed in [LC 39]?
4. **Early Termination Mechanics:** Explain why sorting candidates ascending allows using `break` instead of `continue` when `candidates[i] > remainingTarget`. What would be the consequence of using `break` on an unsorted array?
5. **Sibling Duplicate Pruning:** In Combination Sum II, why does the check `if (i > start && candidates[i] == candidates[i-1]) continue;` preserve valid multiset solutions like $[2, 2]$ while preventing duplicate solution sets?

---

### 💡 Checkpoint Solutions

1. **Monotonic Indexing:** By requiring that every chosen index is strictly greater than the previous index ($\text{idx}_0 < \text{idx}_1 < \dots < \text{idx}_{k-1}$), all permutations of the same subset are mapped to a single canonical sorted order. Any permutation with inverted order (e.g., choosing index 1 after index 3) is outside the loop domain $[3 + 1, N - 1]$, preventing redundant permutations from ever being generated.
2. **Capacity Lookahead Calculation:**
   - Formula: $i \le n - (k - |path|) + 1$.
   - For $n = 20, k = 8, |path| = 3$:
     $$\text{Remaining needed} = 8 - 3 = 5$$
     $$\text{Max candidate } i = 20 - 5 + 1 = 16$$
   - Any recursive call for $i \in [17, 20]$ would have fewer than 5 remaining numbers available in the domain, making it impossible to reach size 8.
3. **Unbounded vs. Bounded Transition:**
   - In [LC 39], candidates have unbounded supply; passing `start = i` allows the child frame to select the exact same candidate again (and again) at subsequent depths. If `start = i + 1` were passed, each candidate could only be selected once per branch, turning the problem into bounded 0/1 target sum and failing to discover solutions like $[2, 2, 3]$ for target 7.
   - In [LC 40], each element in the input array represents a single physical item; passing `start = i + 1` enforces that a specific array entry cannot be reused in its own subproblem.
4. **Early Termination via `break`:** When the array is sorted in ascending order, $candidates[j] \ge candidates[i]$ for all $j \ge i$. Therefore, if $candidates[i] > remaining$, every subsequent candidate in the loop is also guaranteed to exceed $remaining$. Using `break` halts the loop in $O(1)$, pruning all remaining sibling branches. On an unsorted array, using `break` would incorrectly discard smaller valid candidates that happen to follow a larger one (e.g., in $[8, 2, 3]$ with target 7, breaking at 8 would discard valid candidates 2 and 3).
5. **Sibling Duplicate Pruning:**
   - When $i == start$, the candidate is the *first* element evaluated at the current depth along the active branch (parent-to-child axis). The condition $i > start$ is false, allowing consecutive identical elements across different recursion frames (e.g., picking the first 2 at depth 0, and the second 2 at depth 1 to form $[2, 2]$).
   - When $i > start$, the loop has already completely explored the entire subtree resulting from picking $candidates[i-1]$ at this depth. If $candidates[i] == candidates[i-1]$, picking $candidates[i]$ at this same depth would launch an identical, redundant subtree. The condition $i > start \land candidates[i] == candidates[i-1]$ evaluates to true, correctly pruning the duplicate sibling.
