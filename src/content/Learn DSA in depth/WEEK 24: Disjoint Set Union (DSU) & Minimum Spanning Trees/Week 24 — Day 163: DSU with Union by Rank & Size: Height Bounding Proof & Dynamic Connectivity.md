---
title: "Week 24 — Day 163: DSU with Union by Rank & Size: Height Bounding Proof & Dynamic Connectivity"
---

# Week 24 — Day 163: DSU with Union by Rank & Size: Height Bounding Proof & Dynamic Connectivity

Welcome to **Day 163 of your DSA Mastery Journey**!

Yesterday, you discovered how **Path Compression** flattens the depth of a Disjoint Set Union (DSU) tree during `Find(x)` calls. However, path compression only activates *after* paths have already been traversed. If an adversary deliberately feeds a sequence of unbalanced unions without executing queries in between, the tree can temporarily accumulate depth before any query flattens it.

Today, we complete the foundational DSU architecture by introducing **Union by Rank** and **Union by Size**. These two proactive heuristics ensure that trees remain logarithmically shallow *at the very instant of merging*, guaranteeing that:
1. The maximum tree depth never exceeds $\lfloor \log_2 N \rfloor$, even before path compression runs!
2. When combined with path compression, the amortized runtime per operation drops to the theoretical lower bound: $\Theta(\alpha(N))$.

Furthermore, you will formalize the **Height Bounding Proof by Mathematical Induction**, build an industrial-strength `DisjointSetUnionRankSize` C# container, and solve two classic LeetCode challenges: **[LeetCode 1319] Number of Operations to Make Network Connected** and **[LeetCode 200] Number of Islands** using 2D-to-1D index flattening.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   DAY 163: UNION BY RANK, SIZE & HEIGHT BOUNDING PROOFS                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       PROACTIVE TREE BALANCING    │                             │   MATHEMATICAL INDUCTION PROOF    │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Union by Rank:                  │                             │ • Base Case: rank 0 -> 2^0 = 1.   │
│   Attach shallower tree to deeper.│ ── Height Bound Guarantee ─►│ • Inductive Step:                 │
│ • Union by Size:                  │                             │   Merge rank r with rank r        │
│   Attach smaller component to big.│                             │   => rank becomes r + 1           │
│ • Height strictly bounded by:     │                             │   => size ≥ 2^r + 2^r = 2^(r+1)   │
│   height ≤ ⌊log₂ N⌋!              │                             │ • Consequence: r ≤ ⌊log₂ N⌋!      │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         PRODUCTION C# & PROBLEM SET         │
                          ├─────────────────────────────────────────────┤
                          │ • Production DisjointSetUnionRankSize class │
                          │ • [LC 1319] Number of Ops to Connect Network│
                          │ • [LC 200] Number of Islands (2D Flattening)│
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🗝️ The Visual Mental Model: Balancing Tree Merges

When merging two disjoint sets rooted at $R_1$ and $R_2$, we have a choice:
- Make $R_1$ the child of $R_2$ (`parent[R1] = R2`), OR
- Make $R_2$ the child of $R_1$ (`parent[R2] = R1`).

If we make the wrong choice repeatedly, we create a tall linear chain. Proactive balancing eliminates this risk through two alternative strategies:

```
                    UNION BY RANK: SHALLOWER TREE UNDER DEEPER TREE

     Tree 1 (Rank = 2)           Tree 2 (Rank = 1)
          [ R1 ]                      [ R2 ]
         /      \                        │
       [ A ]   [ B ]                   [ C ]

     MERGE STRATEGY:
     • Attach R2 under R1 (rank 1 tree under rank 2 tree).
     • The overall height remains 2!
     • Rank of R1 DOES NOT INCREASE!

                  RESULTING TREE (Rank = 2, Unchanged):
                              [ R1 ]
                             /  │   \
                           [ A ][ B ][ R2 ]
                                       │
                                     [ C ]
```

#### What is "Rank"?
In DSU, **rank** represents an upper bound on the height of the tree rooted at that representative.
- When merging two trees of **different ranks**, the root with smaller rank is attached as a child of the root with larger rank. The overall tree height remains unchanged, so the rank does not increase!
- When merging two trees of **equal rank $r$**, attaching either under the other increases the resulting tree height by 1. Therefore, the winner's rank becomes $r + 1$.

```
                    EQUAL RANK MERGE: RANK INCREMENTS BY 1

     Tree 1 (Rank = r)           Tree 2 (Rank = r)
          [ R1 ]                      [ R2 ]
          /    \                      /    \
        [...]  [...]                [...]  [...]

     MERGE STRATEGY:
     • Attach R2 under R1.
     • Resulting tree has height r + 1.
     • Rank(R1) increases: rank[R1] = r + 1.
```

---

### 1.2 🧮 Mathematical Proof by Induction: The Logarithmic Height Bound

We now rigorously prove that under Union by Rank, a tree of rank $r$ contains at least $2^r$ nodes.

#### Theorem:
> Let $T$ be a DSU tree constructed strictly using **Union by Rank** without path compression. If $T$ has rank $r$, then $T$ contains at least $2^r$ nodes.

#### Proof by Strong Mathematical Induction:

**Base Case ($r = 0$):**
Initially, every element is an isolated singleton with $\text{rank} = 0$.
The number of nodes is $1 = 2^0$. The base case holds trivially.

**Inductive Hypothesis:**
Assume that for all ranks $k < r$, any tree of rank $k$ contains at least $2^k$ nodes.

**Inductive Step (Rank $r$):**
How can a tree achieve rank $r$?
Looking at the merge rules:
1. Merging a tree of rank $r_1$ with a tree of rank $r_2$ where $r_1 > r_2$ yields a tree of rank $r_1$. Its rank does not change.
2. The **only** way for a tree's rank to increase to $r$ is by merging two distinct trees that *both* already had rank $r - 1$.

Let $T_1$ and $T_2$ be the two trees of rank $r - 1$ being merged:
- By the inductive hypothesis, $|T_1| \ge 2^{r - 1}$.
- By the inductive hypothesis, $|T_2| \ge 2^{r - 1}$.

When $T_2$ is attached under $T_1$, the resulting tree $T$ has rank $(r - 1) + 1 = r$.
The total number of vertices in $T$ is:
$$|T| = |T_1| + |T_2| \ge 2^{r - 1} + 2^{r - 1} = 2 \cdot 2^{r - 1} = 2^r$$

This completes the induction. $\blacksquare$

#### Corollary (Strict Height Bound):
If a graph has $N$ total vertices, the maximum possible rank $r_{\max}$ in the forest satisfies:
$$2^{r_{\max}} \le N \implies r_{\max} \le \lfloor \log_2 N \rfloor$$
Because the tree height is bounded above by its rank, **the maximum depth of any tree is at most $\lfloor \log_2 N \rfloor$**.
Even without path compression, Union by Rank guarantees $O(\log N)$ worst-case time for both `Find` and `Union`!

---

### 1.3 🖼️ Visual Comparison: Union by Rank vs. Union by Size

| Feature | Union by Rank | Union by Size |
| :--- | :--- | :--- |
| **Tracking Metric** | Upper bound on tree depth (`rank[i]`). | Exact vertex count in component (`size[i]`). |
| **Initial Values** | `rank[i] = 0` for all $i$. | `size[i] = 1` for all $i$. |
| **Merge Decision** | `rank[rX] < rank[rY] ? parent[rX] = rY : ...` | `size[rX] < size[rY] ? parent[rX] = rY : ...` |
| **Update Rule** | If `rank[rX] == rank[rY]`, `rank[rY]++`. | `size[winner] += size[loser]`. |
| **Path Compression Interaction** | Rank no longer represents exact height after compression (acts as a heuristic). | Size remains 100% exact and accurate even after path compression! |
| **Practical Utility** | Standard academic theoretical formulation. | **Preferred in production** when component sizes are needed (e.g. finding largest component). |

---

### 1.4 5W1H Executive Architecture Blueprint: Union by Rank & Size

| Dimension | Architectural Specification |
| :--- | :--- |
| **1. WHAT** | Proactive merge-balancing heuristics maintaining tree depth $O(\log N)$ by attaching shallower or smaller subtrees under deeper or larger roots. |
| **2. WHY** | Path compression alone is reactive. Union by rank prevents deep trees from forming in the first place, ensuring optimal $O(\alpha(N))$ amortized performance. |
| **3. WHEN** | Any dynamic connectivity problem where component sizes, edge recycling, or strict worst-case latency guarantees are required. |
| **4. WHERE** | Two parallel 1D integer arrays in RAM: `int[] parent` and `int[] rankOrSize`. Total overhead: $8N$ bytes. |
| **5. WHO** | *"I implement DSU combining two-pass path compression with union by size. Union by size guarantees logarithmic tree depth before compression and maintains accurate component cardinalities in O(1)."* |
| **6. HOW** | On `Union(x, y)`, compare `size[rootX]` and `size[rootY]`. Re-parent smaller root under larger, accumulate component size into winner, and decrement component count. |

---

## 2. ⚙️ IMPLEMENT: Production-Grade Container

Here is the production-grade, standalone compilable C# implementation of `DisjointSetUnionRankSize` featuring path compression, union by size, dynamic component count, and component size querying.

```csharp
using System;
using System.Diagnostics;

namespace AdvancedGraphAlgorithms.DisjointSet
{
    /// <summary>
    /// Industrial-strength Disjoint Set Union (DSU) featuring:
    /// 1. Two-pass recursive path compression during Find.
    /// 2. Union by size (weight balancing) to bound tree depth.
    /// 3. O(1) component cardinality and total component tracking.
    /// </summary>
    public sealed class DisjointSetUnionRankSize
    {
        private readonly int[] _parent;
        private readonly int[] _size;
        private int _components;

        /// <summary>
        /// Gets the total number of distinct connected components currently in the universe.
        /// </summary>
        public int ComponentCount => _components;

        /// <summary>
        /// Gets the total capacity (number of elements) in the universe.
        /// </summary>
        public int TotalElements => _parent.Length;

        /// <summary>
        /// Initializes a new disjoint set universe with N isolated singletons [0 .. N-1].
        /// </summary>
        /// <param name="n">Number of elements in the universe.</param>
        public DisjointSetUnionRankSize(int n)
        {
            if (n <= 0)
                throw new ArgumentOutOfRangeException(nameof(n), "Universe size must be positive.");

            _parent = new int[n];
            _size = new int[n];
            _components = n;

            for (int i = 0; i < n; i++)
            {
                _parent[i] = i;
                _size[i] = 1; // Each singleton has an initial component size of 1
            }
        }

        /// <summary>
        /// Finds the canonical representative (root) of element x with full path compression.
        /// Amortized Complexity: O(alpha(N)) <= 4.
        /// </summary>
        public int Find(int x)
        {
            Validate(x);

            if (_parent[x] != x)
            {
                _parent[x] = Find(_parent[x]); // Path compression
            }

            return _parent[x];
        }

        /// <summary>
        /// Merges the sets containing x and y using Union by Size.
        /// </summary>
        /// <returns>True if sets were merged; False if x and y were already in the same set.</returns>
        public bool Union(int x, int y)
        {
            int rootX = Find(x);
            int rootY = Find(y);

            if (rootX == rootY)
            {
                return false; // Redundant edge / Cycle detected
            }

            // Union by Size: attach the smaller component under the larger root
            if (_size[rootX] < _size[rootY])
            {
                _parent[rootX] = rootY;
                _size[rootY] += _size[rootX];
            }
            else
            {
                _parent[rootY] = rootX;
                _size[rootX] += _size[rootY];
            }

            _components--;
            return true;
        }

        /// <summary>
        /// Returns the number of elements belonging to the component containing element x.
        /// Time Complexity: O(alpha(N)).
        /// </summary>
        public int GetComponentSize(int x)
        {
            return _size[Find(x)];
        }

        /// <summary>
        /// Checks if elements x and y belong to the same component.
        /// </summary>
        public bool IsConnected(int x, int y)
        {
            return Find(x) == Find(y);
        }

        private void Validate(int x)
        {
            if (x < 0 || x >= _parent.Length)
                throw new IndexOutOfRangeException($"Index {x} is out of bounds [0, {_parent.Length - 1}].");
        }

        // ====================================================================
        // SELF-VALIDATING TEST SUITE
        // ====================================================================
        public static void Main()
        {
            Console.WriteLine("==========================================================");
            Console.WriteLine("RUNNING TEST SUITE: DisjointSetUnionRankSize (Union-by-Size)");
            Console.WriteLine("==========================================================");

            var dsu = new DisjointSetUnionRankSize(7);
            Debug.Assert(dsu.ComponentCount == 7);

            // Merge {0, 1} -> root is 0, size is 2
            Debug.Assert(dsu.Union(0, 1) == true);
            Debug.Assert(dsu.GetComponentSize(0) == 2);
            Debug.Assert(dsu.GetComponentSize(1) == 2);
            Debug.Assert(dsu.ComponentCount == 6);

            // Merge {2, 3, 4} -> size is 3
            Debug.Assert(dsu.Union(2, 3) == true);
            Debug.Assert(dsu.Union(3, 4) == true);
            Debug.Assert(dsu.GetComponentSize(2) == 3);
            Debug.Assert(dsu.GetComponentSize(4) == 3);
            Debug.Assert(dsu.ComponentCount == 4);

            // Merge component {0, 1} (size 2) with component {2, 3, 4} (size 3)
            // Smaller component ({0, 1}) must attach under larger component ({2, 3, 4})
            int rootBeforeMerge = dsu.Find(2);
            Debug.Assert(dsu.Union(0, 4) == true);
            Debug.Assert(dsu.Find(0) == rootBeforeMerge, "Smaller tree root must point to larger tree root!");
            Debug.Assert(dsu.GetComponentSize(0) == 5, "Combined component size must equal 2 + 3 = 5.");
            Debug.Assert(dsu.ComponentCount == 3);

            // Redundant edge check
            Debug.Assert(dsu.Union(1, 3) == false, "Cycle edge must return false.");
            Debug.Assert(dsu.ComponentCount == 3);

            Console.WriteLine("✅ All DisjointSetUnionRankSize assertions passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Operational Deep-Dive (5 Dimensions)

### Dimension 1: Mathematical Contract & Asymptotic Proofs

| Heuristics Employed | `Find` Amortized Time | `Union` Amortized Time | Worst-Case Tree Depth |
| :--- | :--- | :--- | :--- |
| **None (Naive)** | $\Theta(N)$ | $\Theta(N)$ | $N$ |
| **Path Compression Only** | $\Theta(\log_{1 + M/N} N)$ | $\Theta(\log_{1 + M/N} N)$ | $N$ (transient) |
| **Union by Rank / Size Only** | $\Theta(\log N)$ | $\Theta(\log N)$ | $\lfloor \log_2 N \rfloor$ |
| **Path Compression + Rank/Size** | $\mathbf{\Theta(\alpha(N)) \le 4}$ | $\mathbf{\Theta(\alpha(N)) \le 4}$ | $\mathbf{\lfloor \log_2 N \rfloor}$ |

---

### Dimension 2: Step-by-Step Execution Trace (Union by Size)

Let us trace `Union(0, 1)`, `Union(2, 3)`, `Union(3, 4)`, then `Union(0, 2)`:

| Step | Operation | Components Merged | `size[]` Array | `parent[]` Array | Tree Depth |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 0 | Init (N=5) | Singletons | `[1, 1, 1, 1, 1]` | `[0, 1, 2, 3, 4]` | 1 |
| 1 | `Union(0, 1)` | {0} and {1} | `[2, 1, 1, 1, 1]` | `[0, 0, 2, 3, 4]` | 2 |
| 2 | `Union(2, 3)` | {2} and {3} | `[2, 1, 2, 1, 1]` | `[0, 0, 2, 2, 4]` | 2 |
| 3 | `Union(3, 4)` | {2, 3} and {4} | `[2, 1, 3, 1, 1]` | `[0, 0, 2, 2, 2]` | 2 |
| 4 | `Union(0, 2)` | Size 2 under Size 3! | `[2, 1, 5, 1, 1]` | `[2, 0, 2, 2, 2]` | 2 (Remains flat!) |

---

### Dimension 3: Visual ASCII Memory State Transitions

```
               UNION BY SIZE PREVENTS TREE HEIGHT GROWTH

   Component A (Size = 2, Root = 0):        Component B (Size = 3, Root = 2):
              [ 0 ]                                    [ 2 ]
                │                                     /     \
              [ 1 ]                                 [ 3 ]   [ 4 ]

   MERGE ATTEMPT: Union(1, 4)
   1. Find(1) -> Root is 0 (Size = 2)
   2. Find(4) -> Root is 2 (Size = 3)
   3. Compare sizes: Size(0) < Size(2).
      DECISION: Root 0 attaches under Root 2!
      parent[0] = 2; size[2] = 3 + 2 = 5;

   RESULTING MEMORY TOPOLOGY:
                                  [ 2 ] (Size: 5)
                                /   │   \
                              [ 3 ] [ 4 ] [ 0 ]
                                            │
                                          [ 1 ]

   If we had naively attached Root 2 under Root 0:
   The resulting tree would have height 3. Union by size kept max height at 2!
```

---

### Dimension 4: Invariant Preservation Proofs

1. **Size Conservation Invariant:**
   For any root $R$, $\text{size}[R] = \sum_{v \in \text{Component}(R)} 1$.
   - *Proof:* Initially, $\text{size}[i] = 1$ for all isolated singletons. When merging disjoint components $R_X$ and $R_Y$, the sets are disjoint by definition ($S_X \cap S_Y = \emptyset$). Therefore, the cardinality of the merged component is $|S_X \cup S_Y| = |S_X| + |S_Y| = \text{size}[R_X] + \text{size}[R_Y]$. The algorithm assigns `_size[winner] += _size[loser]`. Thus the invariant holds for all steps.
2. **Logarithmic Bound Invariant:**
   Any tree containing $k$ nodes has depth at most $\lfloor \log_2 k \rfloor + 1$.
   - *Proof:* Established by mathematical induction in Section 1.2.

---

### Dimension 5: Edge Case Analysis & Defense Matrix

| Edge Case Scenario | Potential Pitfall | Defense Mechanism |
| :--- | :--- | :--- |
| **Grid Boundary Overflow** | Mapping 2D $(r, c)$ to 1D index out of bounds. | Flattening formula: `id = r * cols + c` strictly bounded by $[0, \text{rows} \times \text{cols} - 1]$. |
| **Sparse / Disconnected Grid** | Water cells mistakenly merged into land. | Only allocate or union coordinates where `grid[r][c] == '1'`. |
| **Total Component Underflow** | Calling `Union` on already connected elements decrementing count. | Check `if (rootX == rootY) return false;` before decrementing `_components`. |
| **Insufficiency of Edges** | Network connectivity with $|E| < V - 1$. | Mathematical invariant: A graph with $V$ vertices requires at least $V - 1$ edges to be connected. If $|E| < V - 1$, immediately return $-1$. |

---

## 4. 🎬 DEMONSTRATE: Canonical LeetCode Walkthroughs

### 4.1 [LeetCode 1319] Number of Operations to Make Network Connected (Medium)

#### Problem Formulation
There are $n$ computers numbered from $0$ to $n - 1$ and a network of cable connections `connections[i] = [a, b]`. You can extract redundant cables and use them to connect disconnected computers. Return the minimum number of operations to make all computers connected. If it is impossible, return `-1`.

#### Algorithmic Invariants
1. **Edge Count Feasibility Invariant:** To connect $n$ computers into a single component, we require a minimum of $n - 1$ cables. If `connections.Length < n - 1`, it is mathematically impossible; return `-1` in $O(1)$.
2. **Component Reduction Invariant:** If we have $C$ disconnected components, we need exactly $C - 1$ cables to link them into a single connected component.
3. Because `connections.Length >= n - 1`, we are guaranteed to have enough redundant cables! Each redundant cable can bridge two disconnected components.
4. Therefore, the minimum operations required is simply `dsu.ComponentCount - 1`!

```csharp
public sealed class MakeNetworkConnectedSolution
{
    public int MakeConnected(int n, int[][] connections)
    {
        // 1. Feasibility check: must have at least n - 1 edges
        if (connections.Length < n - 1)
        {
            return -1;
        }

        var dsu = new AdvancedGraphAlgorithms.DisjointSet.DisjointSetUnionRankSize(n);

        // 2. Union endpoints of all available cables
        foreach (var conn in connections)
        {
            dsu.Union(conn[0], conn[1]);
        }

        // 3. To connect C components together, exactly C - 1 cables are needed
        return dsu.ComponentCount - 1;
    }
}
```

#### Complexity Analysis
- **Time Complexity:** $O(E \cdot \alpha(N))$. Iterating through all $E$ cables takes near-instant amortized time.
- **Space Complexity:** $O(N)$ for the DSU `parent` and `size` arrays.

---

### 4.2 [LeetCode 200] Number of Islands via 2D Flattening (Medium)

#### Problem Formulation
Given an $m \times n$ 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.

#### 2D-to-1D Coordinate Flattening Architecture
A 2D grid of dimensions $R \times C$ can be mapped bijectively to a 1D linear array of size $R \times C$:
$$\text{Index}(r, c) = r \cdot C + c$$
$$\text{Row}(\text{Index}) = \lfloor \text{Index} / C \rfloor, \quad \text{Col}(\text{Index}) = \text{Index} \pmod C$$

Instead of standard BFS/DFS coloring, we can solve this using DSU:
1. Count the total number of land cells (`'1'`). This is our initial `islandCount`.
2. For every land cell $(r, c)$, check its **Right** neighbor $(r, c+1)$ and **Down** neighbor $(r+1, c)$.
3. If the neighbor is also land, union their flattened 1D indices. If `Union` succeeds, decrement `islandCount`.
4. Checking only Right and Down directions completely avoids duplicate edge checks!

```csharp
public sealed class NumberOfIslandsDsuSolution
{
    public int NumIslands(char[][] grid)
    {
        if (grid == null || grid.Length == 0 || grid[0].Length == 0)
            return 0;

        int rows = grid.Length;
        int cols = grid[0].Length;
        int totalCells = rows * cols;

        var dsu = new AdvancedGraphAlgorithms.DisjointSet.DisjointSetUnionRankSize(totalCells);
        int islandCount = 0;

        // Pass 1: Count total land cells
        for (int r = 0; r < rows; r++)
        {
            for (int c = 0; c < cols; c++)
            {
                if (grid[r][c] == '1')
                {
                    islandCount++;
                }
            }
        }

        // Pass 2: Merge adjacent land cells (Right and Down only)
        for (int r = 0; r < rows; r++)
        {
            for (int c = 0; c < cols; c++)
            {
                if (grid[r][c] == '0') continue;

                int currentId = r * cols + c;

                // Check Right neighbor (r, c + 1)
                if (c + 1 < cols && grid[r][c + 1] == '1')
                {
                    int rightId = r * cols + (c + 1);
                    if (dsu.Union(currentId, rightId))
                    {
                        islandCount--;
                    }
                }

                // Check Down neighbor (r + 1, c)
                if (r + 1 < rows && grid[r + 1][c] == '1')
                {
                    int downId = (r + 1) * cols + c;
                    if (dsu.Union(currentId, downId))
                    {
                        islandCount--;
                    }
                }
            }
        }

        return islandCount;
    }
}
```

#### Complexity Analysis
- **Time Complexity:** $O(R \cdot C \cdot \alpha(R \cdot C)) \approx O(R \cdot C)$. Each cell inspects 2 directional neighbors.
- **Space Complexity:** $O(R \cdot C)$ for the DSU arrays.

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Max Area of Island ([LeetCode 695] - Medium)
- **Constraint:** Given a binary matrix, find the maximum area (number of cells) of an island.
- **DSU Strategy:** Use `DisjointSetUnionRankSize`. Flatten 2D to 1D, union adjacent land cells, and maintain the global maximum of `dsu.GetComponentSize(landId)`.

### Exercise 2: Smallest String With Swaps ([LeetCode 1202] - Medium)
- **Constraint:** Given a string `s` and pairs of indices `pairs[i] = [a, b]` that can be swapped any number of times. Find the lexicographically smallest string possible.
- **Architecture Hint:** Swapping is transitive! If $(a, b)$ and $(b, c)$ can swap, then any permutation among $\{a, b, c\}$ is reachable.
  1. Union all swap pairs in DSU.
  2. Group characters and their original indices by component root.
  3. Sort the characters within each component and re-populate the string at sorted indices.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
                     DSU UNION HEURISTIC SELECTION GUIDE

                Do you need to know component sizes at runtime?
                                  /       \
                                YES        NO
                                /           \
                     [Union by Size]      Is depth bounding sufficient?
                    Tracks exact counts            /         \
                    in O(1) amortized            YES          NO
                                                 /             \
                                        [Union by Rank]    [Naive Merges]
                                        Theoretical        (Risk of linear
                                        academic bound      chain depth!)
```

---

## 7. 🎯 Daily Checkpoint Questions

### Diagnostic Question
Prove that a DSU tree with rank $r$ constructed strictly using union by rank must contain at least $2^r$ vertices.

### Architectural Model Answer
1. **Base Case:** At rank $r = 0$, every node is an isolated singleton containing $1 = 2^0$ vertex. The base case holds.
2. **Induction Step:** By the rules of Union by Rank, a tree can only attain rank $r$ if two distinct trees of rank $r - 1$ are merged together (merging a tree of rank $r - 1$ with any tree of smaller rank does not increase its rank).
3. By the inductive hypothesis, each of the two subtrees of rank $r - 1$ contains at least $2^{r - 1}$ vertices.
4. When they are merged, the total number of vertices in the resulting tree of rank $r$ is:
   $$\text{Vertices} \ge 2^{r - 1} + 2^{r - 1} = 2 \cdot 2^{r - 1} = 2^r$$
5. Consequently, if a graph contains $N$ vertices, the maximum possible rank $r$ is bounded by $2^r \le N \implies r \le \lfloor \log_2 N \rfloor$. Since the tree height never exceeds its rank, tree height is strictly bounded by $\lfloor \log_2 N \rfloor$.
