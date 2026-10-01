---
title: "Week 27 — Day 188: Permutations Masterclass: Visited Arrays, In-Place Swapping & Duplicate Pruning"
---


## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 The Combinatorial Geometry of Permutations ($N!$)

A **permutation** of a set $S$ with $N = |S|$ distinct elements is a bijective mapping of $S$ onto itself, representing an ordered sequence containing every element of $S$ exactly once. In sharp contrast to subsets ($2^N$) and combinations ($\binom{N}{k}$), in permutations **order is paramount**:
$$(1, 2, 3) \neq (1, 3, 2) \neq (3, 2, 1)$$

The cardinality of the permutation space is governed by the factorial function:
$$P(N) = N! = N \times (N - 1) \times (N - 2) \times \dots \times 2 \times 1$$

#### Asymptotic Growth: Stirling's Approximation
Factorial growth expands with extreme velocity, far outstripping exponential curves ($2^N$):
$$N! \sim \sqrt{2\pi N} \left(\frac{N}{e}\right)^N$$

| $N$ | Subsets ($2^N$) | Permutations ($N!$) | Total Search Tree Nodes $\lfloor e \cdot N! \rfloor$ | Feasibility Boundary |
| :---: | :---: | :---: | :---: | :---: |
| **4** | 16 | 24 | 65 | Sub-microsecond |
| **8** | 256 | 40,320 | 109,601 | Sub-millisecond |
| **10** | 1,024 | 3,628,800 | 9,864,101 | ~15 ms |
| **12** | 4,096 | 479,001,600 | 1,302,061,345 | ~1.5 seconds |
| **14** | 16,384 | 87,178,291,200 | 2.37 $\times 10^{11}$ | Hours (Practical CPU Limit) |

The total number of internal and leaf nodes in a permutation search tree is:
$$\sum_{k=0}^N \frac{N!}{(N - k)!} = \lfloor e \cdot N! \rfloor$$

---

### 1.2 The Three Canonical Permutation Paradigms

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PARADIGM 1: VISITED ARRAY + PATH BUFFER                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  State: bool[] visited of size N, List<int> path buffer.                    │
│  Transition: Loop i from 0 to N-1; if (!visited[i]) { Choose; Recurse; }    │
│  Auxiliary Memory: O(N) visited array + O(N) path list + O(N) stack.        │
│  Emission: When path.Count == N.                                            │
│  Advantage: Intuitive; trivially extends to duplicate pruning via sorting.  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                 PARADIGM 2: BITMASK VISITED ENCODING                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  State: int visitedMask (scalar 32-bit register), List<int> path buffer.   │
│  Transition: if ((mask & (1 << i)) == 0) { Recurse(mask | (1 << i)); }      │
│  Auxiliary Memory: O(1) visited state (register) + O(N) path + O(N) stack.  │
│  Advantage: Zero unchoose needed for mask when passed by value!             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                 PARADIGM 3: IN-PLACE SWAPPING (ZERO ALLOCATION)             │
├─────────────────────────────────────────────────────────────────────────────┤
│  State: Mutates the input array nums in-place. NO path buffer!              │
│  Boundary: Segment [0, start - 1] is FIXED prefix.                         │
│            Segment [start, N - 1] is UNCHOSEN candidate pool.               │
│  Transition: Swap(nums[start], nums[i]); Recurse(start + 1);                │
│              Swap(nums[start], nums[i]); (UNCHOOSE)                         │
│  Auxiliary Memory: STRICTLY O(1) beyond the O(N) call stack frames!         │
│  Advantage: Maximum cache locality; lowest memory overhead in computer science.│
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Memory Architecture of In-Place Swapping
Instead of allocating external tracking arrays, in-place swapping partitions the original array into two dynamically resizing physical zones:

```
At recursion depth `start`:
       Committed Prefix (Fixed)      Candidate Pool (Available for slot `start`)
      ┌───────────────────────────┬────────────────────────────────────────────┐
Array │ nums[0]  nums[1]  ...     │ nums[start]  nums[start+1] ... nums[N-1]  │
      └───────────────────────────┴────────────────────────────────────────────┘
      0                       start-1   start                              N-1

1. CHOOSE:   Swap(nums, start, i) where i in [start, N-1]
             Candidate nums[i] is swapped into the active slot `start`.
2. EXPLORE:  Recurse(start + 1)
             The prefix now has length start + 1.
3. UNCHOOSE: Swap(nums, start, i)
             Restores original element positions for the next sibling choice.
```

---

### 1.3 Permutations with Duplicates & The `!visited[i-1]` Invariant ([LC 47])

When the input multiset contains identical values (e.g., $nums = [1, 1', 2]$), naive permutation engines produce $N!$ leaves containing duplicate output sequences ($[1, 1', 2]$ and $[1', 1, 2]$).

The number of unique permutations of a multiset with item multiplicities $n_1, n_2, \dots, n_m$ is given by the **multinomial coefficient**:
$$\frac{N!}{n_1! \, n_2! \, \dots \, n_m!}$$
For $[1, 1, 2]$, there are exactly $\frac{3!}{2! \, 1!} = 3$ unique permutations: $[1, 1, 2]$, $[1, 2, 1]$, and $[2, 1, 1]$.

#### The Canonical Duplicate Pruning Rule
1. **Sort the array:** `Array.Sort(nums)` so that duplicate values are contiguous.
2. **Apply the Guard Condition:** In the loop from $0$ to $N-1$:
   ```csharp
   if (visited[i]) continue;
   if (i > 0 && nums[i] == nums[i - 1] && !visited[i - 1])
   {
       continue; // PRUNE DUPLICATE SIBLING
   }
   ```

#### The Deep Mathematical Invariant: Why `!visited[i-1]`?
A frequent source of confusion is whether the condition should be `!visited[i-1]` or `visited[i-1]`. Both yield correct answers, but their performance profiles and pruning depths are radically different:

- **Enforcing Relative Index Ordering:**
  To guarantee that duplicate values (say, the two $1$s at indices $0$ and $1$) do not create symmetric permutations, we impose the rule:
  $$\text{Duplicate elements MUST be selected in strictly increasing order of their original indices.}$$
  That is, $nums[1]$ may be selected if and only if $nums[0]$ is **already currently active** in the search path (an ancestor in the current stack).
- **Evaluating `!visited[i - 1]`:**
  If $nums[i] == nums[i-1]$ and `!visited[i - 1]`, it means the earlier identical element $nums[i-1]$ is **not currently in the active path** (it was already explored and unchosen in a preceding sibling branch).
  Selecting $nums[i]$ now would mean placing the second instance of $1$ into this slot without the first instance, launching a search tree identical to the one already generated when $nums[i-1]$ was in this slot!
  Therefore, skipping when `!visited[i - 1]` prunes redundant branches at the earliest possible depth.

```
                  nums = [1_a, 1_b, 2] (Sorted)

                           Root
              /              │              \
      Choose 1_a        Choose 1_b          Choose 2
      visited = {0}     Condition:          visited = {2}
           │            nums[1] == nums[0]       │
           │            && !visited[0]           │
           │            (visited[0] is false)    │
           │            >>> PRUNED! <<<          │
           ▼            (Saves entire subtree!)  ▼
    Generates:                               Generates:
    [1_a, 1_b, 2]                            [2, 1_a, 1_b]
    [1_a, 2, 1_b]
```

---

### 1.4 The In-Place Duplicate Trap

Can we apply the same simple check `if (i > start && nums[i] == nums[i-1]) continue;` to the **in-place swapping** paradigm?

> [!CAUTION]
> **THE IN-PLACE DUPLICATE TRAP:**
> **No!** Swapping `nums[start]` with `nums[i]` fundamentally destroys the contiguous sorted order of the remaining segment $[\text{start}, N-1]$.
>
> Consider $nums = [2, 1_a, 1_b]$ at `start = 0`:
> - Step 1 ($i = 0$): Swap $0$ with $0 \implies [2, 1_a, 1_b]$. Explore.
> - Step 2 ($i = 1$): Swap $0$ with $1 \implies [1_a, 2, 1_b]$.
>   Notice what happened to the tail $[2, 1_b]$: it is **no longer sorted**! The two identical values $1_a$ and $1_b$ are separated.
> - Simple neighbor comparison (`nums[i] == nums[i-1]`) fails completely because identical elements are scattered across arbitrary positions.

#### How to Correctly Prune In-Place Permutations
To generate unique permutations in-place without sorting stability, we use a **Local Hash Set** per activation frame:
```csharp
var seenAtThisLevel = new HashSet<int>();
for (int i = start; i < nums.Length; i++)
{
    // If a value has already been placed into slot 'start' at this level, skip!
    if (!seenAtThisLevel.Add(nums[i]))
    {
        continue;
    }

    Swap(nums, start, i);
    PermuteInPlaceUnique(start + 1, nums, result);
    Swap(nums, start, i); // Unchoose
}
```
Because the `HashSet<int>` is local to the stack frame, its size is bounded by $N - \text{start} \le N$. It guarantees that no two sibling branches place identical values into slot `start`.

---

## 2. ⚙️ IMPLEMENT: Production-Grade Container / Algorithm

The following production container **`PermutationGenerator`** implements:
1. **Visited Array Permutations** ([LC 46]).
2. **Bitmask Register Permutations** ([LC 46]).
3. **Zero-Allocation In-Place Swapping** ([LC 46]).
4. **Deduplicated Visited Permutations** ([LC 47]) with the `!visited[i-1]` invariant.
5. **Deduplicated In-Place Swapping** ([LC 47]) with local level set.
6. **Lexicographical Next Permutation** ([LC 31]) in $O(N)$ time, $O(1)$ space.
7. Comprehensive verification suite in `Main()`.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace CombinatorialPermutations
{
    /// <summary>
    /// Production-grade permutation generation engine supporting visited arrays,
    /// bitmask tracking, zero-allocation in-place swapping, and duplicate pruning.
    /// </summary>
    public static class PermutationGenerator
    {
        // ====================================================================
        // 1. VISITED ARRAY PERMUTATIONS (LEETCODE 46)
        // ====================================================================

        /// <summary>
        /// Generates all permutations of distinct integers using a boolean visited array.
        /// Time: O(N * N!), Space: O(N) auxiliary.
        /// </summary>
        public static List<List<int>> PermuteVisited(int[] nums)
        {
            if (nums == null || nums.Length == 0) return new List<List<int>>();

            var result = new List<List<int>>(GetFactorial(nums.Length));
            var path = new List<int>(nums.Length);
            bool[] visited = new bool[nums.Length];

            VisitedDfs(nums, visited, path, result);
            return result;
        }

        private static void VisitedDfs(
            int[] nums,
            bool[] visited,
            List<int> path,
            List<List<int>> result)
        {
            if (path.Count == nums.Length)
            {
                result.Add(new List<int>(path));
                return;
            }

            for (int i = 0; i < nums.Length; i++)
            {
                if (visited[i]) continue;

                // CHOOSE
                visited[i] = true;
                path.Add(nums[i]);

                // EXPLORE
                VisitedDfs(nums, visited, path, result);

                // UNCHOOSE (State Restoration)
                path.RemoveAt(path.Count - 1);
                visited[i] = false;
            }
        }

        // ====================================================================
        // 2. REGISTER-PARALLEL BITMASK PERMUTATIONS (LEETCODE 46)
        // ====================================================================

        /// <summary>
        /// Generates all permutations using an integer bitmask for visited state.
        /// Avoids heap allocations for visited tracking.
        /// </summary>
        public static List<List<int>> PermuteBitmask(int[] nums)
        {
            if (nums == null || nums.Length == 0) return new List<List<int>>();

            var result = new List<List<int>>(GetFactorial(nums.Length));
            var path = new List<int>(nums.Length);

            BitmaskDfs(nums, visitedMask: 0, path, result);
            return result;
        }

        private static void BitmaskDfs(
            int[] nums,
            int visitedMask,
            List<int> path,
            List<List<int>> result)
        {
            if (path.Count == nums.Length)
            {
                result.Add(new List<int>(path));
                return;
            }

            for (int i = 0; i < nums.Length; i++)
            {
                // Bit test: is i-th element already visited?
                if ((visitedMask & (1 << i)) != 0) continue;

                path.Add(nums[i]); // CHOOSE

                // EXPLORE: pass mutated mask by value (automatic unchoose for mask!)
                BitmaskDfs(nums, visitedMask | (1 << i), path, result);

                path.RemoveAt(path.Count - 1); // UNCHOOSE path
            }
        }

        // ====================================================================
        // 3. ZERO-ALLOCATION IN-PLACE SWAPPING (LEETCODE 46)
        // ====================================================================

        /// <summary>
        /// Generates all permutations by swapping elements in-place within the array.
        /// Auxiliary space is strictly O(1) beyond call stack activation frames.
        /// </summary>
        public static List<List<int>> PermuteInPlace(int[] nums)
        {
            if (nums == null || nums.Length == 0) return new List<List<int>>();

            var result = new List<List<int>>(GetFactorial(nums.Length));
            int[] workingArray = (int[])nums.Clone();

            InPlaceDfs(0, workingArray, result);
            return result;
        }

        private static void InPlaceDfs(
            int start,
            int[] nums,
            List<List<int>> result)
        {
            if (start == nums.Length)
            {
                result.Add(new List<int>(nums));
                return;
            }

            for (int i = start; i < nums.Length; i++)
            {
                // CHOOSE: Swap candidate nums[i] into active slot 'start'
                Swap(nums, start, i);

                // EXPLORE: Advance prefix boundary
                InPlaceDfs(start + 1, nums, result);

                // UNCHOOSE: Restore original array order
                Swap(nums, start, i);
            }
        }

        // ====================================================================
        // 4. DEDUPLICATED PERMUTATIONS: VISITED INVARIANT (LEETCODE 47)
        // ====================================================================

        /// <summary>
        /// Generates unique permutations of a multiset using sorted visited pruning.
        /// Enforces the !visited[i-1] canonical order invariant.
        /// </summary>
        public static List<List<int>> PermuteUniqueVisited(int[] nums)
        {
            if (nums == null || nums.Length == 0) return new List<List<int>>();

            int[] sorted = (int[])nums.Clone();
            Array.Sort(sorted);

            var result = new List<List<int>>();
            var path = new List<int>(sorted.Length);
            bool[] visited = new bool[sorted.Length];

            UniqueVisitedDfs(sorted, visited, path, result);
            return result;
        }

        private static void UniqueVisitedDfs(
            int[] nums,
            bool[] visited,
            List<int> path,
            List<List<int>> result)
        {
            if (path.Count == nums.Length)
            {
                result.Add(new List<int>(path));
                return;
            }

            for (int i = 0; i < nums.Length; i++)
            {
                if (visited[i]) continue;

                // CANONICAL DUPLICATE INVARIANT:
                // If nums[i] equals previous element, require that nums[i-1] is currently VISITED.
                // If nums[i-1] is NOT visited, picking nums[i] would launch a duplicate subtree!
                if (i > 0 && nums[i] == nums[i - 1] && !visited[i - 1])
                {
                    continue;
                }

                visited[i] = true;
                path.Add(nums[i]);

                UniqueVisitedDfs(nums, visited, path, result);

                path.RemoveAt(path.Count - 1);
                visited[i] = false;
            }
        }

        // ====================================================================
        // 5. DEDUPLICATED PERMUTATIONS: IN-PLACE LOCAL SET (LEETCODE 47)
        // ====================================================================

        /// <summary>
        /// Generates unique permutations in-place using a stack-frame local set to avoid the duplicate trap.
        /// </summary>
        public static List<List<int>> PermuteUniqueInPlace(int[] nums)
        {
            if (nums == null || nums.Length == 0) return new List<List<int>>();

            var result = new List<List<int>>();
            int[] working = (int[])nums.Clone();

            UniqueInPlaceDfs(0, working, result);
            return result;
        }

        private static void UniqueInPlaceDfs(
            int start,
            int[] nums,
            List<List<int>> result)
        {
            if (start == nums.Length)
            {
                result.Add(new List<int>(nums));
                return;
            }

            // Local set tracking values already placed into slot 'start' at THIS level
            var seen = new HashSet<int>();

            for (int i = start; i < nums.Length; i++)
            {
                // Prune duplicate value for slot 'start'
                if (!seen.Add(nums[i]))
                {
                    continue;
                }

                Swap(nums, start, i);
                UniqueInPlaceDfs(start + 1, nums, result);
                Swap(nums, start, i);
            }
        }

        // ====================================================================
        // 6. LEXICOGRAPHICAL NEXT PERMUTATION (LEETCODE 31)
        // ====================================================================

        /// <summary>
        /// Rearranges numbers into the lexicographically next greater permutation in-place.
        /// Time: O(N), Space: O(1).
        /// </summary>
        public static void NextPermutation(int[] nums)
        {
            if (nums == null || nums.Length <= 1) return;

            // 1. Find largest index i such that nums[i] < nums[i + 1] (pivot)
            int i = nums.Length - 2;
            while (i >= 0 && nums[i] >= nums[i + 1])
            {
                i--;
            }

            if (i >= 0)
            {
                // 2. Find largest index j such that nums[j] > nums[i] (successor)
                int j = nums.Length - 1;
                while (nums[j] <= nums[i])
                {
                    j--;
                }

                // 3. Swap pivot and successor
                Swap(nums, i, j);
            }

            // 4. Reverse suffix from i + 1 to end (transforms descending to ascending)
            Reverse(nums, i + 1, nums.Length - 1);
        }

        // ====================================================================
        // HELPER UTILITIES
        // ====================================================================

        private static void Swap(int[] array, int i, int j)
        {
            int temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }

        private static void Reverse(int[] array, int start, int end)
        {
            while (start < end)
            {
                Swap(array, start, end);
                start++;
                end--;
            }
        }

        private static int GetFactorial(int n)
        {
            int f = 1;
            for (int i = 2; i <= n; i++) f *= i;
            return f;
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
            Console.WriteLine("  WEEK 27 — DAY 188: PERMUTATIONS MASTERCLASS & DUPLICATE PRUNING   ");
            Console.WriteLine("====================================================================\n");

            TestDistinctPermutationsEquivalence();
            TestDuplicatePermutationsPruning();
            TestNextPermutationAlgorithm();
            RunPermutationBenchmark();

            Console.WriteLine("\n[SUCCESS] All Permutation Generator invariants and test suites passed seamlessly!");
        }

        private static void TestDistinctPermutationsEquivalence()
        {
            Console.Write("Test 1: Equivalence Across All 3 Distinct Paradigms (N = 3)... ");

            int[] nums = { 1, 2, 3 };
            int expected = 6; // 3! = 6

            var visited = PermutationGenerator.PermuteVisited(nums);
            var bitmask = PermutationGenerator.PermuteBitmask(nums);
            var inPlace = PermutationGenerator.PermuteInPlace(nums);

            Debug.Assert(visited.Count == expected);
            Debug.Assert(bitmask.Count == expected);
            Debug.Assert(inPlace.Count == expected);

            var setVisited = Canonicalize(visited);
            var setBitmask = Canonicalize(bitmask);
            var setInPlace = Canonicalize(inPlace);

            Debug.Assert(setVisited.SetEquals(setBitmask));
            Debug.Assert(setVisited.SetEquals(setInPlace));

            Console.WriteLine($"PASSED (All paradigms produced exactly {expected} permutations)");
        }

        private static void TestDuplicatePermutationsPruning()
        {
            Console.Write("Test 2: LeetCode 47 Unique Permutations ([1, 1, 2])... ");

            int[] nums = { 1, 1, 2 };
            // Multinomial 3! / (2! * 1!) = 3
            var resVisited = PermutationGenerator.PermuteUniqueVisited(nums);
            var resInPlace = PermutationGenerator.PermuteUniqueInPlace(nums);

            Debug.Assert(resVisited.Count == 3, $"Expected 3 permutations, got {resVisited.Count}");
            Debug.Assert(resInPlace.Count == 3, $"Expected 3 permutations, got {resInPlace.Count}");

            var setVisited = Canonicalize(resVisited);
            var setInPlace = Canonicalize(resInPlace);

            Debug.Assert(setVisited.Contains("1,1,2"));
            Debug.Assert(setVisited.Contains("1,2,1"));
            Debug.Assert(setVisited.Contains("2,1,1"));
            Debug.Assert(setVisited.SetEquals(setInPlace));

            // Edge Case: All duplicates [2, 2, 2, 2] -> Exactly 1 unique permutation
            var allDups = PermutationGenerator.PermuteUniqueVisited(new[] { 2, 2, 2, 2 });
            Debug.Assert(allDups.Count == 1, $"Expected 1 permutation for [2,2,2,2], got {allDups.Count}");

            Console.WriteLine("PASSED (Found exactly 3 unique permutations for [1,1,2]; 1 for [2,2,2,2])");
        }

        private static void TestNextPermutationAlgorithm()
        {
            Console.Write("Test 3: LeetCode 31 Next Permutation In-Place Cycles... ");

            int[] nums = { 1, 2, 3 };
            PermutationGenerator.NextPermutation(nums);
            Debug.Assert(string.Join(",", nums) == "1,3,2");

            PermutationGenerator.NextPermutation(nums);
            Debug.Assert(string.Join(",", nums) == "2,1,3");

            // Test rollover from maximum [3, 2, 1] to minimum [1, 2, 3]
            int[] max = { 3, 2, 1 };
            PermutationGenerator.NextPermutation(max);
            Debug.Assert(string.Join(",", max) == "1,2,3", "Rollover to ascending failed!");

            Console.WriteLine("PASSED (Lexicographical stepping and rollover verified)");
        }

        private static void RunPermutationBenchmark()
        {
            Console.WriteLine("\nTest 4: Performance Benchmark (N = 9 -> 362,880 Permutations)");

            int[] nums = { 1, 2, 3, 4, 5, 6, 7, 8, 9 };

            var sw = Stopwatch.StartNew();
            var resInPlace = PermutationGenerator.PermuteInPlace(nums);
            sw.Stop();
            long inPlaceTime = sw.ElapsedMilliseconds;

            sw.Restart();
            var resBitmask = PermutationGenerator.PermuteBitmask(nums);
            sw.Stop();
            long bitmaskTime = sw.ElapsedMilliseconds;

            sw.Restart();
            var resVisited = PermutationGenerator.PermuteVisited(nums);
            sw.Stop();
            long visitedTime = sw.ElapsedMilliseconds;

            Console.WriteLine($"  - In-Place Swapping:  {inPlaceTime} ms ({resInPlace.Count:N0} permutations)");
            Console.WriteLine($"  - Bitmask Register:   {bitmaskTime} ms ({resBitmask.Count:N0} permutations)");
            Console.WriteLine($"  - Bool Array Visited: {visitedTime} ms ({resVisited.Count:N0} permutations)");
        }

        private static HashSet<string> Canonicalize(List<List<int>> permutations)
        {
            var set = new HashSet<string>();
            foreach (var p in permutations)
            {
                set.Add(string.Join(",", p));
            }
            return set;
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Complexity, Proofs & Performance Profile

### 3.1 Formal Proof of the `!visited[i-1]` Duplicate Invariant

#### Theorem
Let $A = [a_0, a_1, \dots, a_{N-1}]$ be an array sorted in non-decreasing order ($a_0 \le a_1 \le \dots \le a_{N-1}$). The condition:
$$\text{Skip candidate } i \iff visited[i] \lor (i > 0 \land a_i == a_{i-1} \land \neg visited[i-1])$$
generates every unique multiset permutation of $A$ **exactly once**.

#### Proof
1. **Canonical Order Definition:**
   Consider an equivalence class of identical values $v$ appearing at contiguous original indices $p, p+1, \dots, p+k-1$ in $A$.
   A multiset permutation is uniquely identified by the positions in the output sequence to which these $k$ items are assigned: $pos_0, pos_1, \dots, pos_{k-1}$.
   Because the items are indistinguishable, there are $k!$ different assignments of the physical indices $\{p, \dots, p+k-1\}$ to $\{pos_0, \dots, pos_{k-1}\}$.
   We define the **Canonical Assignment** as the unique assignment that preserves relative index order:
   $$\text{Assign } a_p \to pos_0, \quad a_{p+1} \to pos_1, \quad \dots, \quad a_{p+k-1} \to pos_{k-1}$$

2. **Enforcement by the Guard Condition:**
   - Suppose the search attempts to assign element $a_j$ (where $j \in [p+1, p+k-1]$) to an output slot while its predecessor $a_{j-1}$ has **not yet been assigned** ($\neg visited[j-1]$).
   - In this state, $a_j == a_{j-1}$ and $\neg visited[j-1]$ evaluate to **true**.
   - The engine triggers `continue` and prunes the branch.
   - Consequently, $a_j$ can only be assigned to an output slot if $a_{j-1}$ is **already visited** ($visited[j-1] == \text{true}$).
   - By induction, $a_{p+m}$ can only be chosen if all $a_p, a_{p+1}, \dots, a_{p+m-1}$ have already been committed to earlier output slots.

3. **Uniqueness:**
   For any set of $k$ output slots, exactly one ordering of indices satisfies $p$ before $p+1$ before $\dots$ before $p+k-1$.
   All other $(k! - 1)$ assignments violate the relative order invariant and are pruned.
   Therefore, each unique multiset permutation is materialized by **exactly one** search path.

$\blacksquare$ **Q.E.D.**

---

### 3.2 Complexity Profile Across Permutation Paradigms

| Paradigm | Time Complexity | Auxiliary Space (Excl. Output) | Heap Allocation per Node | Cache Locality |
| :--- | :---: | :---: | :---: | :---: |
| **Visited Array** ([LC 46]) | $\Theta(N \cdot N!)$ | $\mathcal{O}(N)$ frames + $\mathcal{O}(N)$ heap | `visited` array & path buffer | Good |
| **Bitmask Visited** ([LC 46]) | $\Theta(N \cdot N!)$ | $\mathcal{O}(N)$ frames + $\mathcal{O}(N)$ path | Path buffer only (mask in register) | Excellent |
| **In-Place Swapping** ([LC 46])| $\Theta(N \cdot N!)$ | $\mathbf{\mathcal{O}(N)\text{ stack only}}$ | $\mathbf{0\text{ bytes}}$ (Zero allocation) | **Optimal (L1 Cache)** |
| **Deduplicated Visited** ([LC 47]) | $\mathcal{O}\left(N \cdot \frac{N!}{\prod n_i!}\right)$ | $\mathcal{O}(N)$ frames + $\mathcal{O}(N)$ heap | Filtered pruning | Good |
| **Next Permutation** ([LC 31]) | $\mathbf{\mathcal{O}(N)\text{ per step}}$ | $\mathbf{\mathcal{O}(1)}$ | $\mathbf{0\text{ bytes}}$ | Sequential memory scan |

---

## 4. 🎬 DEMONSTRATE: Canonical Traces & Step-by-Step Executions

### 4.1 Trace of In-Place Swapping for $N = 3$: `nums = [1, 2, 3]`

```
Initial Array: [1, 2, 3]

Frame 0 (start = 0):
  ├── i = 0: Swap(0, 0) -> [1, 2, 3]
  │     Frame 1 (start = 1):
  │       ├── i = 1: Swap(1, 1) -> [1, 2, 3]
  │       │     Frame 2 (start = 2):
  │       │       └── i = 2: Swap(2, 2) -> [1, 2, 3]
  │       │             Frame 3 (start = 3 == N): Emit [1, 2, 3]
  │       │             Unswap(2, 2) -> [1, 2, 3]
  │       │     Unswap(1, 1) -> [1, 2, 3]
  │       │
  │       └── i = 2: Swap(1, 2) -> [1, 3, 2]
  │             Frame 2 (start = 2):
  │               └── i = 2: Swap(2, 2) -> [1, 3, 2]
  │                     Frame 3 (start = 3 == N): Emit [1, 3, 2]
  │                     Unswap(2, 2) -> [1, 3, 2]
  │             Unswap(1, 2) -> [1, 2, 3] (Restored!)
  │     Unswap(0, 0) -> [1, 2, 3]
  │
  ├── i = 1: Swap(0, 1) -> [2, 1, 3]
  │     Frame 1 (start = 1):
  │       ├── i = 1: Swap(1, 1) -> [2, 1, 3] ==> Emit [2, 1, 3]
  │       └── i = 2: Swap(1, 2) -> [2, 3, 1] ==> Emit [2, 3, 1]
  │     Unswap(0, 1) -> [1, 2, 3] (Restored!)
  │
  └── i = 2: Swap(0, 2) -> [3, 2, 1]
        Frame 1 (start = 1):
          ├── i = 1: Swap(1, 1) -> [3, 2, 1] ==> Emit [3, 2, 1]
          └── i = 2: Swap(1, 2) -> [3, 1, 2] ==> Emit [3, 1, 2]
        Unswap(0, 2) -> [1, 2, 3] (Restored!)

Total Leaves Emitted: Exactly 6 (3! = 6)
```

---

### 4.2 Step-by-Step Execution of Next Permutation ([LC 31]) on `[1, 5, 8, 4, 7, 6, 5, 3, 1]`

```
Array: [ 1,  5,  8,  4,  7,  6,  5,  3,  1 ]
Indices: 0   1   2   3   4   5   6   7   8

Step 1: Scan right-to-left for first decrease (pivot nums[i] < nums[i+1]):
  - 3 > 1 (descending)
  - 5 > 3 (descending)
  - 6 > 5 (descending)
  - 7 > 6 (descending)
  - 4 < 7  ===> PIVOT FOUND AT index i = 3 (value 4)!

Step 2: Scan right-to-left for first element > pivot (nums[j] > nums[i]):
  - 1 <= 4
  - 3 <= 4
  - 5 > 4  ===> SUCCESSOR FOUND AT index j = 6 (value 5)!

Step 3: Swap pivot and successor (Swap index 3 and 6):
  Before: [ 1, 5, 8, 4, 7, 6, 5, 3, 1 ]
  After:  [ 1, 5, 8, 5, 7, 6, 4, 3, 1 ]
                     ^        ^

Step 4: Reverse suffix from index i + 1 = 4 to end:
  Suffix to reverse: [ 7, 6, 4, 3, 1 ]
  Reversed suffix:   [ 1, 3, 4, 6, 7 ]

Final Next Permutation: [ 1, 5, 8, 5, 1, 3, 4, 6, 7 ]
```

---

## 5. 🏋️ PRACTICE: Progressive Rigorous Drills

### Drill 1: Permutation Sequence ([LC 60] - Hard)
- **Problem Statement:** The set $[1, 2, 3, \dots, n]$ contains $n!$ unique permutations. Listed in order, for $n = 3$:
  1. `"123"`, 2. `"132"`, 3. `"213"`, 4. `"231"`, 5. `"312"`, 6. `"321"`.
  Given $n$ and $k$, return the $k$-th permutation string directly in $O(N^2)$ time without generating earlier permutations!
- **Core Invariant (Factoradic Number System):**
  Each first digit partitions the remaining $(n-1)!$ permutations into blocks.
  The index of the first digit is $\lfloor (k - 1) / (n - 1)! \rfloor$.
  Remove that digit from available candidates, update $k \leftarrow (k - 1) \pmod{(n - 1)!} + 1$, and repeat.

```csharp
public static class PermutationSequenceSolver
{
    public static string GetPermutation(int n, int k)
    {
        var numbers = new List<int>(n);
        int[] factorial = new int[n];
        factorial[0] = 1;

        for (int i = 1; i < n; i++)
        {
            factorial[i] = factorial[i - 1] * i;
        }

        for (int i = 1; i <= n; i++)
        {
            numbers.Add(i);
        }

        k--; // Convert to 0-indexed
        var sb = new System.Text.StringBuilder(n);

        for (int i = n - 1; i >= 0; i--)
        {
            int index = k / factorial[i];
            k %= factorial[i];

            sb.Append(numbers[index]);
            numbers.RemoveAt(index); // O(N) shift
        }

        return sb.ToString();
    }
}
```

---

### Drill 2: Permutations with Absolute Difference Restriction
- **Problem Statement:** Generate all permutations of $[1 \dots N]$ such that for every adjacent pair of elements, $|P[i] - P[i-1]| \ne 1$.
- **Invariants:**
  - Lookahead pruning: When choosing candidate $c$, verify $|c - path[^1]| \ne 1$ before recursing.

---

### Drill 3: Palindromic Permutations II ([LC 267])
- **Problem Statement:** Given a string $s$, return all palindromic permutations (without duplicates) of $s$. Return empty list if no palindromic permutation exists.
- **Invariants:**
  - Count character frequencies. At most ONE character can have an odd frequency.
  - Form the half-string prefix by taking half of each character frequency.
  - Generate all unique permutations of the half-string using the `!visited[i-1]` invariant.
  - Assemble full palindrome: $prefix + (oddChar?) + Reverse(prefix)$.

---

## 6. 🔗 CONNECT: Real-World Systems & Cross-Domain Mappings

### 6.1 Traveling Salesperson Problem (TSP) & Exact Route Solvers

The classic Traveling Salesperson Problem (TSP) seeks the shortest tour visiting $N$ cities:
- The search space is the set of all $(N - 1)!$ cyclic permutations of cities.
- Exact solvers utilize **In-Place Backtracking with Branch and Bound**:
  $$\text{if } (currentCost + \text{MST\_LowerBound}(unvisited) \ge bestCost) \text{ prune branch;}$$
- Maintaining the permutation in-place via array swaps minimizes memory thrashing while traversing tens of millions of tours.

---

### 6.2 CPU Instruction Scheduling & Super-Scalar Pipelines

During compiler optimization (LLVM, GCC), the instruction scheduler reorders assembly instructions within a basic block to minimize pipeline stalls:
- Instructions with data hazards (Read-After-Write) define a Directed Acyclic Graph (DAG).
- The scheduler explores the space of **valid topological permutations** of instructions.
- Permutation search finds the ordering that maximizes IPC (Instructions Per Cycle) while fitting register allocation limits.

---

### 6.3 Cryptanalysis & Classical Cipher Attacks

In historical and puzzle cryptanalysis (monoalphabetic substitution ciphers):
- The key is a permutation of the 26 letters of the alphabet ($26! \approx 4 \times 10^{26}$ keys).
- Solvers execute **Permutation Backtracking guided by N-gram frequencies** (digraph and trigraph scoring), pruning permutations that introduce unpronounceable letter clusters.

---

## 7. 🎯 Daily Checkpoint Questions

1. **Stirling's Asymptotic Dominance:** Why does the permutation search space ($N!$) become computationally infeasible on modern hardware around $N = 14$, whereas subset generation ($2^N$) remains feasible up to $N = 25$?
2. **In-Place Swapping Memory Advantage:** Why does in-place swapping achieve $\mathcal{O}(1)$ auxiliary space during traversal, while visited array and bitmask approaches require $\mathcal{O}(N)$ auxiliary memory?
3. **The `!visited[i-1]` Invariant:** In multiset permutations ([LC 47]), why does skipping when `i > 0 && nums[i] == nums[i-1] && !visited[i-1]` prevent duplicate permutations from being generated? What would happen if `visited[i-1]` were used instead?
4. **The In-Place Duplicate Trap:** Explain why sorting the input array and applying `if (i > start && nums[i] == nums[i-1]) continue;` **fails** when applied to in-place swapping permutations.
5. **Next Permutation Mechanics:** In the $O(N)$ Next Permutation algorithm ([LC 31]), why is it guaranteed that reversing the suffix from $i + 1$ to the end of the array produces the smallest possible lexicographical arrangement for that suffix?

---

### 💡 Checkpoint Solutions

1. **Factorial vs. Exponential Scaling:**
   At $N = 14$, $14! \approx 8.7 \times 10^{10}$ permutations. Evaluating 1 billion states per second on a high-end multi-core CPU would still require $\sim 87$ seconds. At $N = 15$, $15! \approx 1.3 \times 10^{12}$ states, requiring over 20 minutes. In contrast, for $N = 25$, $2^N = 33,554,432$ states, which can be enumerated in under 30 milliseconds. Factorial growth quickly eclipses exponential growth because the branching factor increases at every depth rather than remaining constant ($2$).
2. **Auxiliary Memory Architecture:**
   - In-place swapping partitions the input array into two contiguous physical regions: $[0, \text{start}-1]$ (fixed prefix) and $[\text{start}, N-1]$ (available candidates). It tracks both the active path and the remaining candidates entirely within the original array memory. No secondary path buffer or boolean visited tracking table is allocated.
   - In contrast, the visited array approach requires an external `bool[N]` (or bitmask) and a dynamically resizing `List<int>` path buffer to accumulate the active prefix, requiring $\mathcal{O}(N)$ auxiliary heap memory.
3. **The `!visited[i-1]` Pruning Invariant:**
   - By requiring that $nums[i-1]$ is *already visited* before $nums[i]$ can be chosen, we force all identical elements to be selected in strictly increasing order of their original array indices ($0, 1, \dots$).
   - If `!visited[i-1]` is true when considering $nums[i]$, it means the preceding identical instance was already explored and unchosen in an earlier sibling branch. Committing to $nums[i]$ now would launch an identical, redundant search tree.
   - If `visited[i-1]` were used instead, it would enforce selection in reverse index order ($1'$ before $1$). This also yields correct deduplicated results, but it prunes branches at a *deeper* level in the tree, visiting significantly more doomed nodes before terminating.
4. **Failure of In-Place Duplicate Pruning:**
   When using in-place swapping, swapping `nums[start]` with `nums[i]` disrupts the contiguous order of the remaining suffix $[\text{start}, N-1]$. Subsequent candidates are no longer sorted! Therefore, two identical elements that were originally adjacent become separated by other elements, causing the neighbor comparison `nums[i] == nums[i-1]` to evaluate to `false` and miss duplicate branches. A local `HashSet<int>` per stack frame is required to record which distinct values have already been swapped into slot `start`.
5. **Next Permutation Suffix Reversal:**
   The algorithm finds the first index $i$ from the right such that $nums[i] < nums[i+1]$. By definition of $i$, all elements to the right of $i$ are in strictly non-increasing (descending) order: $nums[i+1] \ge nums[i+2] \ge \dots \ge nums[N-1]$.
   When we swap $nums[i]$ with its smallest successor $nums[j]$ in that suffix, the suffix remains in descending order.
   The lexicographically smallest possible permutation of any multiset is its non-decreasing (ascending) order.
   Because the suffix is sorted in descending order, simply reversing it in-place in $O(N)$ transforms it into ascending order, guaranteeing that the new suffix is the minimal possible continuation.
