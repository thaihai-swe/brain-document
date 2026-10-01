---
title: "Week 27 — Day 186: Subsets & Power Set Generation: Inclusion-Exclusion vs. Cascading Iteration vs. Bitmask"
---



## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 The Combinatorial Geometry of the Power Set ($2^N$)

Given a finite set $S$ containing $N = |S|$ distinct elements, the **Power Set** $\mathcal{P}(S)$ is defined as the set of all possible subsets of $S$, including the empty set $\emptyset$ and $S$ itself:
$$\mathcal{P}(S) = \{ A \mid A \subseteq S \}$$

#### Cardinality via the Binomial Theorem
Every subset of size $k$ corresponds to a combination of $k$ elements chosen from $N$. Summing over all possible subset cardinalities $k \in \{0, 1, \dots, N\}$:
$$|\mathcal{P}(S)| = \sum_{k=0}^N \binom{N}{k} = (1 + 1)^N = 2^N$$

Geometrically, the power set maps one-to-one with the vertices of an **$N$-dimensional unit hypercube** $\{0, 1\}^N$. Each coordinate axis represents a specific element $s_j \in S$. A vertex $(b_0, b_1, \dots, b_{N-1}) \in \{0, 1\}^N$ represents the unique subset containing precisely those elements $s_j$ where $b_j = 1$.

```
           Hypercube Representation for N = 3: S = {A, B, C}

                      {A, B, C} (1,1,1)
                        /    \   \
                       /      \   \
             {A, B} (1,1,0)    \   {B, C} (0,1,1)
                │       \       \    │
                │     {A, C} (1,0,1) │
                │        │   \   │   │
             {A} (1,0,0) │    \  │  {C} (0,0,1)
                \        │     \ │   /
                 \       │     {B} (0,1,0)
                  \      │      /
                   \     │     /
                        ∅ (0,0,0)
```

Because generating each subset requires materializing an array of average size $\mathbb{E}[k] = \frac{N}{2}$, the asymptotic lower bound for any power set generation algorithm is:
$$\Omega\left(N \cdot 2^N\right) \text{ time and space}$$

---

### 1.2 The Three Generation Paradigms

There are three primary algorithmic paradigms for generating $\mathcal{P}(S)$, each possessing distinct call stack topologies, memory profiles, and iteration mechanics:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   PARADIGM 1: BINARY INCLUSION-EXCLUSION                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Structure: Full Binary Tree of Depth N                                     │
│  Decision at index i: Branch LEFT (Exclude nums[i]) vs RIGHT (Include nums[i])│
│  Total Nodes in Tree: 2^(N+1) - 1                                           │
│  Output Emitted: ONLY at leaf nodes (depth == N)                            │
│  Total Leaves: Exactly 2^N                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                   PARADIGM 2: START-INDEX PREFIX EXPANSION                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Structure: Multi-Way Tree (Root degree N, child degrees N-1 ... 0)         │
│  Decision at frame: Loop through candidates i from startIndex to N-1        │
│  Total Nodes in Tree: Exactly 2^N                                           │
│  Output Emitted: At EVERY node visited (pre-order materialization)          │
│  Total Invocations: Exactly 2^N                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                   PARADIGM 3: ITERATIVE BIT MANIPULATION                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Structure: Flat loop from 0 to 2^N - 1 (Register-parallel)                 │
│  Decision: Bit test (mask & (1 << j)) != 0                                  │
│  Total Nodes / Stack Frames: EXACTLY ZERO RECURSION FRAMES                  │
│  Output Emitted: 1 subset per integer mask                                  │
│  Auxiliary Memory: O(1) (CPU register only)                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Comparison of Paradigm Mechanics

1. **Binary Choice (Inclusion-Exclusion):**
   - Each recursive call inspects element `nums[index]`.
   - Branch 1: Exclude `nums[index]` $\implies \text{Recurse}(index + 1, path)$.
   - Branch 2: Include `nums[index]` $\implies path.\text{Add}(nums[index]); \text{Recurse}(index + 1, path); path.\text{RemoveAt}(path.Count - 1);$.
   - **Trade-off:** Deep recursion ($N$ frames). Emits solutions only when hitting the base case $index == N$. Explores $2^{N+1} - 1$ total nodes (both internal and leaves).

2. **Start-Index Backtracking Loop:**
   - Every node represents a valid prefix. The current $path$ is added to the result immediately upon entering the frame.
   - A `for` loop iterates from `startIndex` to $N-1$, appending `nums[i]`, recursing with `i + 1`, and unchoosing.
   - **Trade-off:** Explores exactly $2^N$ nodes. Natural foundation for combinatorial constraints, combinations of size $k$, and duplicate pruning.

3. **Bitmask Iteration:**
   - Evaluates integers $m \in [0, 2^N - 1]$. For each $m$, the inner loop inspects all $N$ bit positions.
   - If the $j$-th bit is set (`(m & (1 << j)) != 0`), `nums[j]` is included in subset $m$.
   - **Trade-off:** Completely non-recursive. Maximum speed on modern x86/ARM hardware due to zero stack pushes, branch predictability, and register residency. Bounded to $N \le 62$ (due to standard 64-bit integer bit widths).

4. **Cascading Iterative Expansion:**
   - Initializes `result = [[]]`.
   - For each number $x \in nums$, iterates through all currently existing subsets in `result`, creates a clone of each, appends $x$, and appends the new subsets back into `result`.
   - Doubling pattern: $1 \to 2 \to 4 \to 8 \to \dots \to 2^N$.

---

### 1.3 Handling Duplicate Elements & The Level-Pruning Invariant

When the input array contains duplicate elements (e.g., $nums = [1, 2, 2']$), naive power set generation yields duplicate subsets:
- Subset 1: Using the first $2 \implies [1, 2]$
- Subset 2: Using the second $2' \implies [1, 2'] \equiv [1, 2]$

While a `HashSet<List<int>>` can deduplicate solutions post-generation, this incurs massive hashing overhead and does not prevent exponential waste during tree exploration.

#### The Canonical Duplicate Pruning Invariant
To eliminate duplicate generation at the source:
1. **Sort the array:** Sort `nums` in non-decreasing order ($O(N \log N)$) so that all identical elements are contiguous.
2. **Apply the Level-Pruning Condition:** In the start-index loop:
   ```csharp
   for (int i = startIndex; i < nums.Length; i++)
   {
       // LEVEL-ORDER PRUNING INVARIANT
       if (i > startIndex && nums[i] == nums[i - 1])
       {
           continue; // Skip duplicate sibling choice!
       }

       path.Add(nums[i]);
       Dfs(i + 1, path);
       path.RemoveAt(path.Count - 1);
   }
   ```

```
                             Root []
                 /              │             \
          i=0: Choose 1   i=1: Choose 2   i=2: Choose 2' (PRUNED!)
              /    \            │             i > start (2 > 1) && nums[2] == nums[1]
             /      \           │             Skips redundant sibling subtree!
          [1, 2]   [1, 2']   [2, 2']
            │      (PRUNED!)    │
          [1, 2, 2']            ∅
          (ALLOWED!
           i == start (2 == 2)
           along branch)
```

#### Why `i > startIndex` is the Exact Boundary
- **When $i == \text{startIndex}$ (Parent-to-Child Transition):**
  This is the *first* candidate evaluated at the current tree depth. Even if `nums[i] == nums[i - 1]`, this candidate belongs to a **different depth level** (a descendant along the active branch). We MUST allow choosing duplicate elements across consecutive levels to generate multiset subsets like $[2, 2]$.
- **When $i > \text{startIndex}$ (Sibling-to-Sibling Transition):**
  We have already completely explored the recursive subtree generated by committing to `nums[i - 1]` at this exact slot. If `nums[i] == nums[i - 1]`, committing to `nums[i]` would explore an **identical, redundant search subtree**. Therefore, we must `continue` to prune the entire duplicate branch.

---

## 2. ⚙️ IMPLEMENT: Production-Grade Container / Algorithm

The following production C# container **`PowerSetGenerator`** implements:
1. **Binary Inclusion-Exclusion Recursion** ([LC 78]).
2. **Start-Index Backtracking Loop** ([LC 78]).
3. **High-Performance Bitmask Generator** ([LC 78]).
4. **Cascading Iterative Expander** ([LC 78]).
5. **Deduplicated Start-Index Engine** ([LC 90] Subsets II).
6. Complete validation harness and empirical allocation profiling in `Main()`.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace CombinatorialGeneration
{
    /// <summary>
    /// Production-grade power set generator implementing all four canonical paradigms
    /// with strict memory optimization and duplicate pruning invariants.
    /// </summary>
    public static class PowerSetGenerator
    {
        // ====================================================================
        // PARADIGM 1: BINARY INCLUSION-EXCLUSION RECURSION
        // ====================================================================

        /// <summary>
        /// Generates the power set using a binary decision tree (Include vs Exclude).
        /// Emits solutions exclusively at the leaf nodes (depth == N).
        /// </summary>
        public static List<List<int>> GenerateBinaryTree(int[] nums)
        {
            var result = new List<List<int>>(1 << nums.Length);
            var path = new List<int>(nums.Length);
            BinaryTreeDfs(0, nums, path, result);
            return result;
        }

        private static void BinaryTreeDfs(
            int index,
            int[] nums,
            List<int> path,
            List<List<int>> result)
        {
            if (index == nums.Length)
            {
                // Leaf reached: materialize current subset
                result.Add(new List<int>(path));
                return;
            }

            // Branch 1: EXCLUDE nums[index]
            BinaryTreeDfs(index + 1, nums, path, result);

            // Branch 2: INCLUDE nums[index]
            path.Add(nums[index]);                           // Choose
            BinaryTreeDfs(index + 1, nums, path, result);    // Explore
            path.RemoveAt(path.Count - 1);                   // Unchoose (State Restoration)
        }

        // ====================================================================
        // PARADIGM 2: START-INDEX BACKTRACKING LOOP (LC 78)
        // ====================================================================

        /// <summary>
        /// Generates the power set using start-index prefix expansion.
        /// Emits solutions at EVERY node in the search tree (2^N nodes total).
        /// </summary>
        public static List<List<int>> GenerateStartIndex(int[] nums)
        {
            var result = new List<List<int>>(1 << nums.Length);
            var path = new List<int>(nums.Length);
            StartIndexDfs(0, nums, path, result);
            return result;
        }

        private static void StartIndexDfs(
            int startIndex,
            int[] nums,
            List<int> path,
            List<List<int>> result)
        {
            // Pre-order emission: Every node represents a valid prefix subset
            result.Add(new List<int>(path));

            for (int i = startIndex; i < nums.Length; i++)
            {
                path.Add(nums[i]);                         // Choose
                StartIndexDfs(i + 1, nums, path, result);  // Explore
                path.RemoveAt(path.Count - 1);             // Unchoose (State Restoration)
            }
        }

        // ====================================================================
        // PARADIGM 3: REGISTER-PARALLEL BITMASK ENUMERATION
        // ====================================================================

        /// <summary>
        /// Generates the power set iteratively using bit manipulation.
        /// Requires exactly zero call stack frames; purely CPU register-driven.
        /// </summary>
        public static List<List<int>> GenerateBitmask(int[] nums)
        {
            int n = nums.Length;
            if (n > 30) throw new ArgumentException("Bitmask generation exceeds 32-bit limits.");

            int totalSubsets = 1 << n; // 2^N
            var result = new List<List<int>>(totalSubsets);

            for (int mask = 0; mask < totalSubsets; mask++)
            {
                var subset = new List<int>();
                for (int j = 0; j < n; j++)
                {
                    if ((mask & (1 << j)) != 0)
                    {
                        subset.Add(nums[j]);
                    }
                }
                result.Add(subset);
            }

            return result;
        }

        // ====================================================================
        // PARADIGM 4: CASCADING ITERATIVE EXPANSION
        // ====================================================================

        /// <summary>
        /// Generates the power set iteratively by cascading expansion (doubling).
        /// Starts with [[]] and for each element clones existing subsets with element appended.
        /// </summary>
        public static List<List<int>> GenerateCascading(int[] nums)
        {
            var result = new List<List<int>>(1 << nums.Length)
            {
                new List<int>() // Seed with empty subset
            };

            foreach (int num in nums)
            {
                int currentCount = result.Count;
                for (int i = 0; i < currentCount; i++)
                {
                    var newSubset = new List<int>(result[i].Count + 1);
                    newSubset.AddRange(result[i]);
                    newSubset.Add(num);
                    result.Add(newSubset);
                }
            }

            return result;
        }

        // ====================================================================
        // PARADIGM 5: DEDUPLICATED SUBSETS WITH DUPLICATES (LC 90)
        // ====================================================================

        /// <summary>
        /// Generates all unique subsets from an array that may contain duplicate elements.
        /// Enforces the Level-Pruning Invariant: (i > startIndex && nums[i] == nums[i-1]).
        /// </summary>
        public static List<List<int>> GenerateSubsetsWithDuplicates(int[] nums)
        {
            // Precondition: Must be sorted to make duplicates contiguous
            int[] sorted = (int[])nums.Clone();
            Array.Sort(sorted);

            var result = new List<List<int>>();
            var path = new List<int>(sorted.Length);
            DeduplicatedDfs(0, sorted, path, result);
            return result;
        }

        private static void DeduplicatedDfs(
            int startIndex,
            int[] nums,
            List<int> path,
            List<List<int>> result)
        {
            result.Add(new List<int>(path));

            for (int i = startIndex; i < nums.Length; i++)
            {
                // LEVEL-PRUNING INVARIANT:
                // If this is not the first candidate at this level (i > startIndex)
                // and the value equals the previous candidate, PRUNE the redundant subtree!
                if (i > startIndex && nums[i] == nums[i - 1])
                {
                    continue;
                }

                path.Add(nums[i]);                           // Choose
                DeduplicatedDfs(i + 1, nums, path, result);  // Explore
                path.RemoveAt(path.Count - 1);               // Unchoose (State Restoration)
            }
        }
    }

    /// <summary>
    /// Self-contained verification and performance test suite.
    /// </summary>
    public static class Program
    {
        public static void Main()
        {
            Console.WriteLine("====================================================================");
            Console.WriteLine("  WEEK 27 — DAY 186: POWER SET GENERATION & DUPLICATE PRUNING      ");
            Console.WriteLine("====================================================================\n");

            TestParadigmsEquivalence();
            TestDuplicatePruningCorrectness();
            RunEmpiricalPerformanceBenchmark();

            Console.WriteLine("\n[SUCCESS] All Power Set Generator invariants and benchmarks passed seamlessly!");
        }

        private static void TestParadigmsEquivalence()
        {
            Console.Write("Test 1: Equivalence Across All 4 Paradigms (N = 3)... ");

            int[] nums = { 1, 2, 3 };
            int expectedCount = 1 << nums.Length; // 8

            var binary = PowerSetGenerator.GenerateBinaryTree(nums);
            var startIndex = PowerSetGenerator.GenerateStartIndex(nums);
            var bitmask = PowerSetGenerator.GenerateBitmask(nums);
            var cascading = PowerSetGenerator.GenerateCascading(nums);

            Debug.Assert(binary.Count == expectedCount);
            Debug.Assert(startIndex.Count == expectedCount);
            Debug.Assert(bitmask.Count == expectedCount);
            Debug.Assert(cascading.Count == expectedCount);

            // Assert that set of subsets matches across paradigms
            var setBinary = Canonicalize(binary);
            var setStartIndex = Canonicalize(startIndex);
            var setBitmask = Canonicalize(bitmask);
            var setCascading = Canonicalize(cascading);

            Debug.Assert(setBinary.SetEquals(setStartIndex));
            Debug.Assert(setBinary.SetEquals(setBitmask));
            Debug.Assert(setBinary.SetEquals(setCascading));

            Console.WriteLine($"PASSED (All paradigms produced exactly {expectedCount} identical subsets)");
        }

        private static void TestDuplicatePruningCorrectness()
        {
            Console.Write("Test 2: LeetCode 90 Subsets II Duplicate Pruning (nums = [1, 2, 2])... ");

            int[] nums = { 1, 2, 2 };
            var uniqueSubsets = PowerSetGenerator.GenerateSubsetsWithDuplicates(nums);

            // Expected unique subsets for [1, 2, 2]:
            // [], [1], [2], [1,2], [2,2], [1,2,2] -> Total 6 unique subsets
            Debug.Assert(uniqueSubsets.Count == 6, $"Expected 6 unique subsets, got {uniqueSubsets.Count}");

            var canonical = Canonicalize(uniqueSubsets);
            Debug.Assert(canonical.Contains(""), "Missing empty subset");
            Debug.Assert(canonical.Contains("1"), "Missing [1]");
            Debug.Assert(canonical.Contains("2"), "Missing [2]");
            Debug.Assert(canonical.Contains("1,2"), "Missing [1,2]");
            Debug.Assert(canonical.Contains("2,2"), "Missing [2,2]");
            Debug.Assert(canonical.Contains("1,2,2"), "Missing [1,2,2]");

            // Edge Case: All duplicates [2, 2, 2, 2] -> 5 unique subsets (sizes 0 to 4)
            int[] allDups = { 2, 2, 2, 2 };
            var dupResults = PowerSetGenerator.GenerateSubsetsWithDuplicates(allDups);
            Debug.Assert(dupResults.Count == 5, $"Expected 5 subsets for [2,2,2,2], got {dupResults.Count}");

            Console.WriteLine("PASSED (Exactly 6 unique subsets for [1,2,2]; 5 for [2,2,2,2])");
        }

        private static void RunEmpiricalPerformanceBenchmark()
        {
            Console.WriteLine("\nTest 3: Empirical Performance Benchmark (N = 16 -> 65,536 Subsets)");

            int n = 16;
            int[] nums = new int[n];
            for (int i = 0; i < n; i++) nums[i] = i + 1;

            // 1. Bitmask
            var sw = Stopwatch.StartNew();
            var resBitmask = PowerSetGenerator.GenerateBitmask(nums);
            sw.Stop();
            long bitmaskTime = sw.ElapsedMilliseconds;

            // 2. Start-Index Backtracking
            sw.Restart();
            var resStartIndex = PowerSetGenerator.GenerateStartIndex(nums);
            sw.Stop();
            long startIndexTime = sw.ElapsedMilliseconds;

            // 3. Cascading Iterative
            sw.Restart();
            var resCascading = PowerSetGenerator.GenerateCascading(nums);
            sw.Stop();
            long cascadingTime = sw.ElapsedMilliseconds;

            // 4. Binary Tree
            sw.Restart();
            var resBinary = PowerSetGenerator.GenerateBinaryTree(nums);
            sw.Stop();
            long binaryTime = sw.ElapsedMilliseconds;

            Console.WriteLine($"  - Bitmask Iteration:        {bitmaskTime} ms ({resBitmask.Count:N0} subsets)");
            Console.WriteLine($"  - Start-Index Backtracking: {startIndexTime} ms ({resStartIndex.Count:N0} subsets)");
            Console.WriteLine($"  - Cascading Iterative:      {cascadingTime} ms ({resCascading.Count:N0} subsets)");
            Console.WriteLine($"  - Binary Tree (Inc/Exc):    {binaryTime} ms ({resBinary.Count:N0} subsets)");
        }

        private static HashSet<string> Canonicalize(List<List<int>> subsets)
        {
            var set = new HashSet<string>();
            foreach (var s in subsets)
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

### 3.1 Formal Proof of the Duplicate Pruning Invariant

Let $A = [a_0, a_1, \dots, a_{N-1}]$ be an array sorted in non-decreasing order ($a_0 \le a_1 \le \dots \le a_{N-1}$). We seek to prove that the start-index pruning condition:
$$\text{Condition: } i > \text{startIndex} \land A[i] == A[i - 1]$$
guarantees that:
1. Every unique multiset subset of $A$ is generated **at least once**.
2. No duplicate multiset subset of $A$ is generated **more than once**.

#### Proof of Completeness (No Valid Subsets are Missed)
Let $S$ be an arbitrary valid unique subset of elements from $A$. If element value $v$ appears $k$ times in $S$ ($k \ge 1$), then $A$ must contain at least $k$ instances of value $v$, say at contiguous indices $p, p+1, \dots, p+k-1$.

Under the algorithm:
- To select the first instance of $v$, the loop at depth $d$ reaches index $i = p$. Since $p$ is the *first* occurrence of value $v$ in this range, either $p == \text{startIndex}$ or $A[p] \neq A[p-1]$. Thus, $i=p$ is **never pruned**.
- To select the second instance of $v$, the child frame at depth $d+1$ receives $\text{startIndex} = p+1$. The loop immediately inspects $i = p+1$. Here, $i == \text{startIndex}$ ($p+1 == p+1$), so the condition $i > \text{startIndex}$ is **false**. Therefore, $i=p+1$ is **not pruned**.
- By mathematical induction, all $k$ consecutive instances of $v$ at indices $p, p+1, \dots, p+k-1$ are selected with $i == \text{startIndex}$ at depths $d, d+1, \dots, d+k-1$.
Thus, $S$ is guaranteed to be generated.

#### Proof of Uniqueness (No Duplicate Subsets are Generated)
Suppose for contradiction that an identical subset $S$ is generated by two distinct search paths $P_1$ and $P_2$.
Let $d$ be the first depth level where $P_1$ and $P_2$ diverge by selecting different indices $i_1 < i_2$.
- Because both paths lead to identical multisets, the element chosen at depth $d$ must have the exact same value: $A[i_1] = A[i_2] = v$.
- Because the array $A$ is sorted, all elements between index $i_1$ and $i_2$ must also equal $v$:
  $$A[i_1] = A[i_1 + 1] = \dots = A[i_2] = v$$
- Consider the selection of $i_2$ along path $P_2$ at depth $d$.
- Since $i_1$ was evaluated earlier in the same loop, we know that $i_1 \ge \text{startIndex}$.
- Because $i_2 > i_1 \ge \text{startIndex}$, we strictly have:
  $$i_2 > \text{startIndex}$$
- Furthermore, since $A[i_2] = A[i_2 - 1] = v$, the condition:
  $$i_2 > \text{startIndex} \land A[i_2] == A[i_2 - 1]$$
  evaluates to **true**.
- Therefore, index $i_2$ is **pruned by the `continue` statement** and cannot be selected as a branch at depth $d$.
This contradicts the existence of path $P_2$.

$\blacksquare$ **Q.E.D.**

---

### 3.2 Algorithmic Comparison Matrix

| Property | Binary Decision Tree (Inc/Exc) | Start-Index Backtracking Loop | Iterative Bitmask Enumeration | Cascading Expansion |
| :--- | :---: | :---: | :---: | :---: |
| **Time Complexity** | $\Theta(N \cdot 2^N)$ | $\Theta(N \cdot 2^N)$ | $\Theta(N \cdot 2^N)$ | $\Theta(N \cdot 2^N)$ |
| **Auxiliary Stack Space** | $\mathcal{O}(N)$ frames | $\mathcal{O}(N)$ frames | $\mathbf{\mathcal{O}(1)}$ (No stack) | $\mathbf{\mathcal{O}(1)}$ (No stack) |
| **Total Tree Nodes** | $2^{N+1} - 1$ | $\mathbf{2^N}$ | $0$ (Flat iteration) | $0$ (Flat iteration) |
| **Emission Point** | Leaf nodes only | Every tree node | Loop iteration step | Inner list clone |
| **Constraint Pruning** | Inefficient (full depth) | **Optimal (subtrees pruned)** | Inefficient (full mask scan) | Inefficient |
| **Duplicate Handling** | Complex (skip loops) | **Trivial (`i > start`)** | Complex (hash set / bit checks) | Skip identical counts |
| **Maximum Feasible $N$** | $N \le 22$ | $N \le 22$ | $N \le 30$ ($62$ with `ulong`) | $N \le 22$ |

---

## 4. 🎬 DEMONSTRATE: Canonical Traces & Step-by-Step Executions

### 4.1 Trace of Start-Index Generation for `nums = [1, 2, 3]`

```
Tree Topology (Total Nodes = 8):

                      [] (Node 0)
         /                 │             \
      [1] (Node 1)      [2] (Node 4)   [3] (Node 7)
      /         \          │
   [1, 2]     [1, 3]    [2, 3]
  (Node 2)   (Node 5)  (Node 6)
     │
 [1, 2, 3]
  (Node 3)
```

#### Detailed Execution Log

| Step | Depth | Action | `startIndex` | Loop `i` | `path` Buffer | Solution Emitted | Operation |
| :---: | :---: | :--- | :---: | :---: | :--- | :---: | :--- |
| **1** | 0 | Enter frame | 0 | — | `[]` | **`[]`** | Root pre-order emission |
| **2** | 0 | Choose | 0 | 0 | `[1]` | — | Push `nums[0] = 1` |
| **3** | 1 | Enter frame | 1 | — | `[1]` | **`[1]`** | Node 1 pre-order emission |
| **4** | 1 | Choose | 1 | 1 | `[1, 2]` | — | Push `nums[1] = 2` |
| **5** | 2 | Enter frame | 2 | — | `[1, 2]` | **`[1, 2]`** | Node 2 pre-order emission |
| **6** | 2 | Choose | 2 | 2 | `[1, 2, 3]` | — | Push `nums[2] = 3` |
| **7** | 3 | Enter frame | 3 | — | `[1, 2, 3]` | **`[1, 2, 3]`** | Node 3 pre-order emission |
| **8** | 3 | Base exit | 3 | — | `[1, 2, 3]` | — | Loop $i=3 < 3$ terminates |
| **9** | 2 | Unchoose | 2 | 2 | `[1, 2]` | — | Pop `3`; loop terminates |
| **10**| 1 | Unchoose | 1 | 1 | `[1]` | — | Pop `2`; loop advances to $i=2$ |
| **11**| 1 | Choose | 1 | 2 | `[1, 3]` | — | Push `nums[2] = 3` |
| **12**| 2 | Enter frame | 3 | — | `[1, 3]` | **`[1, 3]`** | Node 5 pre-order emission |
| **13**| 2 | Base exit | 3 | — | `[1, 3]` | — | Loop terminates; return to depth 1 |
| **14**| 1 | Unchoose | 1 | 2 | `[1]` | — | Pop `3`; loop terminates |
| **15**| 0 | Unchoose | 0 | 0 | `[]` | — | Pop `1`; loop advances to $i=1$ |
| **16**| 0 | Choose | 0 | 1 | `[2]` | — | Push `nums[1] = 2` |
| **17**| 1 | Enter frame | 2 | — | `[2]` | **`[2]`** | Node 4 pre-order emission |
| **18**| 1 | Choose | 2 | 2 | `[2, 3]` | — | Push `nums[2] = 3` |
| **19**| 2 | Enter frame | 3 | — | `[2, 3]` | **`[2, 3]`** | Node 6 pre-order emission |
| **20**| 1 | Unchoose | 2 | 2 | `[2]` | — | Pop `3`; return to depth 0 |
| **21**| 0 | Unchoose | 0 | 1 | `[]` | — | Pop `2`; loop advances to $i=2$ |
| **22**| 0 | Choose | 0 | 2 | `[3]` | — | Push `nums[2] = 3` |
| **23**| 1 | Enter frame | 3 | — | `[3]` | **`[3]`** | Node 7 pre-order emission |
| **24**| 0 | Unchoose | 0 | 2 | `[]` | — | Pop `3`; Root loop complete! |

---

### 4.2 Trace of Duplicate Pruning for `nums = [1, 2, 2]`

Let $nums = [1, 2_a, 2_b]$ with indices $0, 1, 2$.

```
Frame 0 (startIndex = 0):
  - Emits: []
  - i = 0 (val 1): Recurse(startIndex = 1, path = [1])
      - Emits: [1]
      - i = 1 (val 2_a): Recurse(startIndex = 2, path = [1, 2_a])
          - Emits: [1, 2_a]
          - i = 2 (val 2_b):
              Condition: (i > startIndex) => (2 > 2) is FALSE!
              ALLOWED! (Different depth level -> Parent-child relationship)
              Recurse(startIndex = 3, path = [1, 2_a, 2_b])
                - Emits: [1, 2_a, 2_b]
      - i = 2 (val 2_b):
          Condition: (i > startIndex) => (2 > 1) is TRUE!
          nums[2] == nums[1] (2_b == 2_a) is TRUE!
          >>> PRUNED! (Redundant sibling branch skipped!) <<<

  - i = 1 (val 2_a): Recurse(startIndex = 2, path = [2_a])
      - Emits: [2_a]
      - i = 2 (val 2_b): (2 > 2 is FALSE -> ALLOWED!)
          Recurse(startIndex = 3, path = [2_a, 2_b])
            - Emits: [2_a, 2_b]

  - i = 2 (val 2_b):
      Condition: (i > startIndex) => (2 > 0) is TRUE!
      nums[2] == nums[1] (2_b == 2_a) is TRUE!
      >>> PRUNED! (Redundant sibling branch skipped!) <<<

Total Unique Subsets: [], [1], [1, 2], [1, 2, 2], [2], [2, 2] (Exactly 6 subsets!)
```

---

## 5. 🏋️ PRACTICE: Progressive Rigorous Drills

### Drill 1: Subsets with Exact Target Sum (Combinatorial Subset Sum)
- **Problem Statement:** Given an array of positive integers `nums` and target integer $K$, return all unique subsets whose sum equals $K$. Elements in `nums` may contain duplicates.
- **Pruning Invariants:**
  1. Sort `nums` ascending.
  2. If `currentSum + nums[i] > K`, `break` immediately (since all subsequent elements are $\ge nums[i]$, no further branches can be valid).
  3. Apply `if (i > start && nums[i] == nums[i-1]) continue;` to eliminate duplicate subsets.

```csharp
public static class SubsetSumFinder
{
    public static List<List<int>> FindSubsetsWithSum(int[] nums, int target)
    {
        Array.Sort(nums);
        var result = new List<List<int>>();
        var path = new List<int>();
        Dfs(0, target, nums, path, result);
        return result;
    }

    private static void Dfs(
        int start, int remaining, int[] nums,
        List<int> path, List<List<int>> result)
    {
        if (remaining == 0)
        {
            result.Add(new List<int>(path));
            return;
        }

        for (int i = start; i < nums.Length; i++)
        {
            // Pruning 1: Monotonic Sum Cutoff (Array is sorted!)
            if (nums[i] > remaining) break;

            // Pruning 2: Duplicate Sibling Pruning
            if (i > start && nums[i] == nums[i - 1]) continue;

            path.Add(nums[i]);
            Dfs(i + 1, remaining - nums[i], nums, path, result);
            path.RemoveAt(path.Count - 1);
        }
    }
}
```

---

### Drill 2: Lexicographical Gray Code Power Set Generation
- **Problem Statement:** Generate the power set of $S$ such that every consecutive subset in the output list differs by the insertion or deletion of **exactly one element** (Minimal Change Order / Gray Code order).
- **Core Insight:** In standard binary Gray code, the $m$-th code is computed as:
  $$G(m) = m \oplus (m \gg 1)$$
  Because $G(m)$ and $G(m+1)$ differ by exactly one bit, mapping $G(m)$ to subset elements guarantees that adjacent subsets differ by exactly one element.

---

### Drill 3: Bounded-Size Combinations via Power Set Truncation
- **Problem Statement:** Modify the start-index generator to return all subsets of size exactly $K$ ([LC 77] Combinations) with **depth lookahead pruning**:
  $$\text{if } (nums.\text{Length} - i < K - path.\text{Count}) \text{ break;}$$
- **Mathematical Invariant:** If the number of remaining elements in the array is strictly less than the slots needed to complete a subset of size $K$, terminate the loop immediately.

---

## 6. 🔗 CONNECT: Real-World Systems & Cross-Domain Mappings

### 6.1 Database Query Engines: SQL `GROUPING SETS`, `CUBE` & `ROLLUP`

In analytical relational databases (PostgreSQL, Snowflake, BigQuery), multi-dimensional aggregation operations rely directly on power set generation:

```sql
SELECT department, region, year, SUM(revenue)
FROM sales
GROUP BY CUBE (department, region, year);
```

- The `CUBE` operator computes aggregations over the **entire power set** of the specified dimensions.
- For $N$ dimensions, `CUBE` generates $2^N$ grouping combinations:
  - Size 0: `()` (Grand Total)
  - Size 1: `(department)`, `(region)`, `(year)`
  - Size 2: `(department, region)`, `(department, year)`, `(region, year)`
  - Size 3: `(department, region, year)`
- Database query optimizers evaluate the power set lattice, computing shared sort orders or hash tables to calculate all $2^N$ aggregations in a single pass over the underlying data.

---

### 6.2 Feature Selection in Machine Learning: Exhaustive Wrapper Search

In machine learning model training, **Best Subset Selection** evaluates all possible combinations of $N$ input features to determine the subset minimizing test loss (e.g., AIC, BIC, or cross-validation error):
- For $N$ features, the parameter search space is the power set $\mathcal{P}(\text{Features})$.
- Because training $2^N$ models is computationally prohibitive for $N > 30$, practitioners deploy **Forward Stepwise Selection** (greedy path through the power set lattice) or **Lasso Regularization** ($L_1$ penalty) to approximate the optimal power set vertex in polynomial time.

---

### 6.3 Hardware Logic Synthesis: Karnaugh Maps & Quine-McCluskey

In digital circuit design, Boolean function minimization simplifies logic gate networks:
- A truth table with $N$ inputs defines an $N$-dimensional hypercube of $2^N$ minterms.
- The **Quine-McCluskey algorithm** traverses the hypercube, combining adjacent minterms (differing by a single bit) to extract prime implicants, exactly mirroring the Gray Code power set transition graph.

---

## 7. 🎯 Daily Checkpoint Questions

1. **Cardinality & Work:** Why is the time complexity of power set generation $\Theta(N \cdot 2^N)$ rather than $\Theta(2^N)$? Where does the extra factor of $N$ originate?
2. **Binary Tree vs. Start-Index Topology:** Contrast the search tree shape of the Binary Inclusion-Exclusion model with the Start-Index model. How many total nodes does each tree visit to generate the power set of $N$ elements?
3. **The Duplicate Pruning Boundary:** In the duplicate pruning condition `if (i > startIndex && nums[i] == nums[i-1]) continue;`, why must the inequality be strict ($i > \text{startIndex}$) rather than non-strict ($i \ge \text{startIndex}$)? What would happen if $i \ge \text{startIndex}$ were used?
4. **Register-Parallel Bitmask Limits:** Why is standard bitmask power set generation restricted to $N \le 62$? What data structure or instruction set extensions would allow bitmask generation for $N = 256$?
5. **Memory Footprint:** Between Binary Inclusion-Exclusion, Start-Index Backtracking, and Bitmask Enumeration, which approach incurs the lowest auxiliary memory overhead during traversal (excluding the output container)?

---

### 💡 Checkpoint Solutions

1. **Factor of $N$ Origin:** While there are $2^N$ unique subsets, each subset must be copied into the final result container. The average size of a subset in the power set is $\mathbb{E}[k] = \frac{1}{2^N} \sum_{k=0}^N k \binom{N}{k} = \frac{N}{2}$. Copying $\frac{N}{2}$ elements into an allocated list takes $\Theta(N)$ time per subset. Across all $2^N$ subsets, total work is $2^N \times \frac{N}{2} = \Theta(N \cdot 2^N)$.
2. **Tree Topologies & Node Counts:**
   - *Binary Tree:* A complete binary tree of depth $N$. It has $2^N$ leaves (where solutions are materialized) and $2^N - 1$ internal nodes. Total nodes visited $= 2^{N+1} - 1$.
   - *Start-Index Tree:* A multi-way tree where solutions are emitted at every node (pre-order). The number of nodes in the tree is **exactly $2^N$** (1 root + $\binom{N}{1}$ level 1 + $\dots$ + $\binom{N}{N}$ level $N$).
3. **Strict Inequality Necessity:** If $i \ge \text{startIndex}$ were used, whenever $i == \text{startIndex}$ and $nums[i] == nums[i-1]$, the condition would trigger and prune the candidate. This would make it impossible to select identical elements across consecutive depths along the same branch, completely preventing the generation of valid multiset subsets like $[2, 2]$ from $[1, 2, 2]$. The condition $i > \text{startIndex}$ ensures that the first identical element at any depth is always allowed along the parent-child axis, while subsequent identical elements at the *same* depth are pruned along the sibling axis.
4. **Bitmask Limits & $N = 256$ Extensions:** In standard hardware, primitive scalar integer registers are 64 bits wide (`ulong` in C#), supporting shifts up to $1 \ll 62$. For $N = 256$, one can utilize SIMD 256-bit vector registers (`Vector256<byte>` in .NET with AVX2/AVX-512) or custom 4-word `ulong[4]` arrays with custom bit-test functions.
5. **Auxiliary Memory Overhead:** **Bitmask Enumeration** incurs the lowest auxiliary memory: $\mathbf{\mathcal{O}(1)}$ space. It requires no call stack frames, no dynamic frame allocations, and no path buffer; it operates solely using CPU registers (`mask` and loop counter `j`). In contrast, both recursive approaches require $\mathcal{O}(N)$ activation frames and an $\mathcal{O}(N)$ shared mutable list.
