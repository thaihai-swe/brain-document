---
title: "Week 25 — Day 170: Dijkstra on 2D Grids & State Spaces: Multi-Dimensional Relaxations"
---

# Week 25 — Day 170: Dijkstra on 2D Grids & State Spaces: Multi-Dimensional Relaxations

Welcome to **Day 170 of your DSA Mastery Journey**!

Yesterday, you mastered **Dijkstra's Algorithm** on general directed graphs where edges possess non-negative additive weights ($w \ge 0$), and proved why greedy tentative distance finalization is optimal.

Today, we elevate Dijkstra's algorithm to solve two higher-order systems and interview paradigms:
1. **2D Grid Spatial Graphs:** Where vertices represent physical cells $(r, c)$ in a matrix, edges represent orthogonal transitions (Up, Down, Left, Right), and costs represent elevation differences, terrain friction, or toll charges.
2. **Minimax & Bottleneck Metrics:** In standard shortest-path problems, path cost is the **sum** of edge weights: $\sum w_i$. In network capacity planning and terrain navigation, path cost is defined as the **bottleneck (maximum edge weight along the path)**:
   $$\text{Cost}(P) = \max_{e \in P} w(e)$$
   We will prove mathematically why Dijkstra seamlessly generalizes to minimax metrics without altering its greedy correctness proof!
3. **State-Augmented Graph Dimensions:** When path feasibility depends on auxiliary states (e.g. remaining fuel, collected key bitmasks, or obstacle elimination quotas), expanding the search space from $V$ to $V \times K$.

Today, you will build a production-grade `MinimaxGridDijkstra` engine in C# and conquer two canonical LeetCode challenges: **[LeetCode 1631] Path With Minimum Effort** and **[LeetCode 778] Swim in Rising Water**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   DAY 170: 2D GRID DIJKSTRA, MINIMAX METRICS & STATE SPACES                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       THE MINIMAX PATH METRIC     │                             │    THE MONOTONICITY THEOREM       │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Additive: cost = dist[u] + w.   │                             │ • Why does Minimax Dijkstra work? │
│ • Minimax:                        │ ── Algebraic Extension ───► │ • Monotonicity Invariant:         │
│   cost = max(dist[u], w(u, v)).   │                             │   f(P ∘ e) = max(f(P), w(e))      │
│ • Objective:                      │                             │   Since w(e) ≥ 0, f(P ∘ e) ≥ f(P)!│
│   Minimize the MAXIMUM bottleneck!│                             │ • Path extensions NEVER decrease  │
│ • 2D Grid: dist[rows, cols].      │                             │   bottleneck cost! Proof holds!   │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         PRODUCTION C# & PROBLEM SET         │
                          ├─────────────────────────────────────────────┤
                          │ • Production MinimaxGridDijkstra Engine     │
                          │ • [LC 1631] Path With Minimum Effort (Med)  │
                          │ • [LC 778] Swim in Rising Water (Hard)      │
                          │ • Multi-Dimensional State Augmentation      │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🗝️ The Visual Mental Model: The Mountain Pass & The Rising Tide

Consider hiking across a rugged mountain range from coordinate $(0, 0)$ to coordinate $(R-1, C-1)$:
- In **Standard Shortest Path**, you want to minimize your *total elevation climbed* ($\sum \Delta h$).
- In **Path With Minimum Effort**, you want to minimize your *maximum steepness on any single step*: $\min \max |\Delta h|$. A long gentle ramp is vastly preferable to a single vertical cliff!
- In **Swim in Rising Water**, rain falls and the water level rises steadily across a terrain of varying elevations. You can swim into any adjacent cell whose elevation is $\le \text{Current Water Level}$. The minimum time to reach the destination is simply the **maximum elevation encountered along the path**.

```
                         ADDITIVE SUM VS. MINIMAX BOTTLENECK

        Path 1: [ 1 ] ──(2)──► [ 2 ] ──(2)──► [ 3 ] ──(2)──► [ 4 ]
                • Additive Sum = 2 + 2 + 2 = 6
                • Minimax Bottleneck = max(2, 2, 2) = 2  <=== SUPERIOR MINIMAX!

        Path 2: [ 1 ] ──────────────(5)─────────────► [ 4 ]
                • Additive Sum = 5  <=== SUPERIOR ADDITIVE SUM!
                • Minimax Bottleneck = max(5) = 5
```

---

### 1.2 🧮 Mathematical Proof: The Monotonicity Property of Minimax Paths

Why does Dijkstra's algorithm remain provably correct when we replace addition with the maximum function?

#### Path Weight Function $f(P)$:
Let $P = (e_1, e_2, \dots, e_k)$ be a path.
In standard Dijkstra: $f_{\text{add}}(P) = \sum_{i=1}^k w(e_i)$.
In minimax Dijkstra: $f_{\max}(P) = \max_{1 \le i \le k} w(e_i)$.

#### The Generalized Dijkstra Monotonicity Requirement:
Dijkstra's greedy choice property relies on a single fundamental axiom: **Path Monotonicity**.
> For any path $P$ and any additional edge $e$ appended to $P$:
> $$f(P \circ e) \ge f(P)$$

Let us verify whether $f_{\max}$ satisfies this axiom:
$$f_{\max}(P \circ e) = \max(f_{\max}(P), w(e))$$
By definition of the maximum function:
$$\max(A, B) \ge A \quad (\forall A, B)$$
Therefore:
$$f_{\max}(P \circ e) = \max(f_{\max}(P), w(e)) \ge f_{\max}(P)$$

#### Consequence:
Extending a path by adding an edge can **never decrease its bottleneck cost**.
Because extending a path cannot undercut an existing bottleneck, the contradiction proof from Day 169 holds identically!
When the priority queue extracts cell $(r, c)$ with bottleneck cost $B$, **no alternative path can ever reach $(r, c)$ with a smaller bottleneck**.

---

### 1.3 🖼️ Visual Architecture: 2D Matrix Memory Layout & Directional Vectors

On a 2D grid of size $R \times C$:
- Total vertices: $|V| = R \times C$.
- Each cell $(r, c)$ has up to 4 orthogonal neighbors:
  $$\Delta r = [-1, 0, 1, 0], \quad \Delta c = [0, 1, 0, -1]$$
- Total edges: $|E| \le 4 \times R \times C$.
- The distance array is allocated as a contiguous 2D array `int[R, C]`. In C#, a flat 1D array `int[R * C]` indexed via `r * C + c` delivers optimal cache-line spatial prefetching.

```
                    2D GRID ORTHOGONAL RELAXATION MATRIX

                             (r - 1, c) [Up]
                                   ▲
                                   │
      (r, c - 1) [Left] ◄─── (r, c) [Current] ───► (r, c + 1) [Right]
                                   │
                                   ▼
                             (r + 1, c) [Down]

    RELAXATION LOGIC FOR NEIGHBOR (nr, nc):
    int edgeWeight = Math.Abs(grid[nr][nc] - grid[r][c]);
    int newEffort = Math.Max(effort[r, c], edgeWeight);

    if (newEffort < effort[nr, nc])
    {
        effort[nr, nc] = newEffort;
        pq.Enqueue((nr, nc), newEffort);
    }
```

---

### 1.4 5W1H Executive Architecture Blueprint: 2D Grid Minimax Dijkstra

| Dimension | Architectural Specification |
| :--- | :--- |
| **1. WHAT** | Dijkstra's shortest path algorithm adapted to 2D matrix graphs using the minimax bottleneck relaxation operator $\text{dist}[v] = \min(\text{dist}[v], \max(\text{dist}[u], w(u, v)))$. |
| **2. WHY** | Binary search on answer + BFS costs $O(R \cdot C \log (\max H))$. Minimax Dijkstra solves the exact optimal path in a single pass in $O(R \cdot C \log(R \cdot C))$ without guesswork. |
| **3. WHEN** | Minimum effort paths, flooding/submerging simulations, network maximum bandwidth paths, escaping grid mazes under tolerance limits. |
| **4. WHERE** | 2D contiguous buffer `int[R, C]` paired with C# `.NET 6+` `PriorityQueue<(int R, int C), int>` using the lazy stale deletion pattern. |
| **5. WHO** | *"I model 2D grid bottlenecks using Minimax Dijkstra. Because the bottleneck function f(P) = max(w(e)) is monotonically non-decreasing, Dijkstra's greedy priority queue guarantees optimal bottleneck finalization in $O(RC \log(RC))$."* |
| **6. HOW** | Seed `dist[0, 0] = 0` $\to$ pop min bottleneck cell $(r, c) \to$ if $d > dist[r, c]$ continue $\to$ if $(r, c) == (R-1, C-1)$ return early $\to$ explore 4 directions $\to$ relax `max(dist[r, c], edgeCost)`. |

---

## 2. ⚙️ IMPLEMENT: Production-Grade Container

Here is the production-grade, standalone compilable C# implementation of `MinimaxGridDijkstra` featuring early termination, direction arrays, and automated self-validating assertions.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedGraphAlgorithms.ShortestPaths
{
    /// <summary>
    /// Production-grade 2D Grid Minimax Dijkstra Engine.
    /// Computes the path from (0, 0) to (R-1, C-1) minimizing the maximum edge transition cost.
    /// Time Complexity: O(R * C * log(R * C)).
    /// Space Complexity: O(R * C).
    /// </summary>
    public sealed class MinimaxGridDijkstra
    {
        private static readonly int[] Dr = { -1, 0, 1, 0 };
        private static readonly int[] Dc = { 0, 1, 0, -1 };

        /// <summary>
        /// Finds the minimum effort path from top-left (0, 0) to bottom-right (R-1, C-1)
        /// where effort is the maximum absolute elevation difference between consecutive cells.
        /// </summary>
        /// <param name="heights">2D grid of elevations.</param>
        /// <returns>Minimum effort scalar value.</returns>
        public static int ComputeMinimumEffort(int[][] heights)
        {
            if (heights == null || heights.Length == 0 || heights[0].Length == 0)
                throw new ArgumentException("Grid must be non-empty.", nameof(heights));

            int rows = heights.Length;
            int cols = heights[0].Length;

            if (rows == 1 && cols == 1)
                return 0;

            var effort = new int[rows, cols];
            for (int r = 0; r < rows; r++)
            {
                for (int c = 0; c < cols; c++)
                {
                    effort[r, c] = int.MaxValue;
                }
            }

            // Min-Heap prioritizing cells by lowest tentative effort
            var pq = new PriorityQueue<(int R, int C), int>();

            effort[0, 0] = 0;
            pq.Enqueue((0, 0), 0);

            while (pq.Count > 0)
            {
                pq.TryDequeue(out var cell, out int currEffort);
                int r = cell.R;
                int c = cell.C;

                // Lazy stale deletion check
                if (currEffort > effort[r, c])
                    continue;

                // Early exit: First time bottom-right is popped, its effort is permanently optimal!
                if (r == rows - 1 && c == cols - 1)
                    return currEffort;

                // Explore all 4 orthogonal directions
                for (int i = 0; i < 4; i++)
                {
                    int nr = r + Dr[i];
                    int nc = c + Dc[i];

                    // Grid boundary check
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols)
                    {
                        int stepCost = Math.Abs(heights[nr][nc] - heights[r][c]);
                        // Minimax relaxation: bottleneck is the maximum of current effort and step cost
                        int nextEffort = Math.Max(currEffort, stepCost);

                        if (nextEffort < effort[nr, nc])
                        {
                            effort[nr, nc] = nextEffort;
                            pq.Enqueue((nr, nc), nextEffort);
                        }
                    }
                }
            }

            return effort[rows - 1, cols - 1];
        }

        // ====================================================================
        // SELF-VALIDATING TEST SUITE
        // ====================================================================
        public static void Main()
        {
            Console.WriteLine("==================================================");
            Console.WriteLine("RUNNING TEST SUITE: MinimaxGridDijkstra");
            Console.WriteLine("==================================================");

            // Test 1: Standard 3x3 grid
            // [1, 2, 2]
            // [3, 8, 2]
            // [5, 3, 5]
            // Optimal path: (0,0)->(0,1)->(0,2)->(1,2)->(2,2) with heights: 1->2->2->2->5.
            // Max diff: |5 - 2| = 3.
            int[][] grid1 = {
                new[] { 1, 2, 2 },
                new[] { 3, 8, 2 },
                new[] { 5, 3, 5 }
            };
            int effort1 = ComputeMinimumEffort(grid1);
            Debug.Assert(effort1 == 2, $"Expected 2, got {effort1}");

            // Test 2: Single cell grid (0 effort)
            int[][] grid2 = { new[] { 42 } };
            Debug.Assert(ComputeMinimumEffort(grid2) == 0);

            // Test 3: Straight line grid
            int[][] grid3 = {
                new[] { 1, 10, 6, 7, 9, 10, 4, 9 }
            };
            // Difference steps: |10-1|=9, |6-10|=4, |7-6|=1, |9-7|=2, |10-9|=1, |4-10|=6, |9-4|=5. Max = 9.
            Debug.Assert(ComputeMinimumEffort(grid3) == 9);

            Console.WriteLine("✅ All MinimaxGridDijkstra assertions passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Operational Deep-Dive (5 Dimensions)

### Dimension 1: Mathematical Contract & Asymptotic Proofs

| Operation | Grid Graph Metrics | Complexity Bound |
| :--- | :--- | :--- |
| **Total Vertices $|V|$** | $R \times C$ | $\Theta(RC)$ |
| **Total Edges $|E|$** | At most $4 \times R \times C$ | $\Theta(RC)$ (Planar Sparse Graph!) |
| **Heap Insertions** | At most $4 \times RC$ relaxations | $O(RC \log(RC))$ |
| **Heap Extractions** | At most $4 \times RC$ dequeues | $O(RC \log(RC))$ |
| **Total Runtime** | — | $\mathbf{\Theta(RC \log(RC))}$ |
| **Auxiliary Memory** | Distance matrix + PriorityQueue | $\mathbf{\Theta(RC)}$ |

---

### Dimension 2: Step-by-Step Execution Trace

Grid:
```
[ 1, 3 ]
[ 4, 5 ]
```

| Step | Popped `(r, c)` | Effort | Visited Check | Neighbors Inspected | Next Effort | Enqueued |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | `(0, 0)` | 0 | Valid | Right: `(0, 1)` diff $= |3 - 1| = 2$<br/>Down: `(1, 0)` diff $= |4 - 1| = 3$ | $\max(0, 2) = 2$<br/>$\max(0, 3) = 3$ | `((0, 1), 2)`<br/>`((1, 0), 3)` |
| 2 | `(0, 1)` | 2 | Valid | Down: `(1, 1)` diff $= |5 - 3| = 2$ | $\max(2, 2) = 2$ | `((1, 1), 2)` |
| 3 | `(1, 1)` | **2** | **TARGET!** | **Early Exit!** | — | **Result: 2** |

---

### Dimension 3: Visual ASCII State Transitions

```
               MINIMAX WAVEFRONT ADVANCEMENT ON ELEVATION GRID

    Initial:
    [ (0) ]   ∞         Queue: [ ((0,0), effort=0) ]
       ∞      ∞

    Step 1: Expand (0, 0):
    [  0  ]   2         Queue: [ ((0,1), 2), ((1,0), 3) ]
       3      ∞

    Step 2: Pop minimum effort ((0, 1), effort=2):
    [  0  ] [ 2 ]       Neighbor (1, 1): height 5 vs 3 -> diff = 2.
       3      2         Effort = max(2, 2) = 2.
                        Queue: [ ((1,1), 2), ((1,0), 3) ]

    Step 3: Pop minimum effort ((1, 1), effort=2):
    Target reached! Finished in 3 operations without touching path through (1, 0)!
```

---

### Dimension 4: Invariant Preservation Proofs

1. **Minimax Subpath Optimality:**
   Let $P^*$ be the path minimizing the maximum edge weight from source $(0, 0)$ to cell $(r, c)$.
   - *Proof:* Suppose an alternative path $P'$ reaches $(r, c)$ with a smaller bottleneck. Then $P'$ must contain a first unvisited edge $(x, y)$ crossing the frontier. Because $f_{\max}(P') < f_{\max}(P^*)$, and $f_{\max}$ is monotonic, the bottleneck to $y$ is strictly less than the bottleneck to $(r, c)$. But the priority queue extracts the cell with minimum tentative bottleneck, so $y$ would have been extracted before $(r, c)$. Contradiction.
2. **Early Termination Invariant:**
   The moment the target cell $(R-1, C-1)$ is popped from the priority queue, the algorithm can terminate immediately.
   - *Proof:* Any remaining path currently in the priority queue has bottleneck $\ge \text{current}$. By monotonicity, extending any of those paths can only increase or maintain their bottleneck. None can ever reach the destination with a smaller value.

---

### Dimension 5: Edge Case Analysis & Defense Matrix

| Edge Case Scenario | Failure Mode | Built-in Defense Mechanism |
| :--- | :--- | :--- |
| **$1 \times 1$ Grid** | Loop bounds crash or unnecessary queue processing. | Guard clause `if (rows == 1 && cols == 1) return 0;`. |
| **Flat Terrain (All Equal Heights)** | Infinite loops or queue thrashing. | Edge weight is $\Delta h = 0$. $\max(0, 0) = 0$. Solves in linear time without redundant visits. |
| **Dead-End Mazes** | Attempting out-of-bounds indices. | Strict boundary guard `if (nr >= 0 && nr < rows && nc >= 0 && nc < cols)`. |
| **Large Grid ($1000 \times 1000$)** | Memory bloat in priority queue. | Lazy stale check `if (currEffort > effort[r, c]) continue;` keeps active queue compact. |

---

## 4. 🎬 DEMONSTRATE: Canonical LeetCode Walkthroughs

### 4.1 [LeetCode 1631] Path With Minimum Effort (Medium)

#### Problem Statement
You are a hiker preparing for an upcoming hike. You are given `heights`, a 2D array of size `rows x columns`, where `heights[row][col]` represents the height of cell `(row, col)`. You are situated in the top-left cell, `(0, 0)`, and you hope to travel to the bottom-right cell, `(rows-1, columns-1)`. You can move **up, down, left, or right**. A path's **effort** is the **maximum absolute difference** in heights between two consecutive cells of the path. Return the minimum effort required to travel from the top-left cell to the bottom-right cell.

#### Complete Annotated Solution
```csharp
using System;
using System.Collections.Generic;

public sealed class PathWithMinimumEffortSolution
{
    private static readonly int[] Dr = { -1, 0, 1, 0 };
    private static readonly int[] Dc = { 0, 1, 0, -1 };

    public int MinimumEffortPath(int[][] heights)
    {
        int rows = heights.Length;
        int cols = heights[0].Length;

        if (rows == 1 && cols == 1) return 0;

        var dist = new int[rows, cols];
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                dist[r, c] = int.MaxValue;

        var pq = new PriorityQueue<(int R, int C), int>();

        dist[0, 0] = 0;
        pq.Enqueue((0, 0), 0);

        while (pq.Count > 0)
        {
            pq.TryDequeue(out var curr, out int effort);
            int r = curr.R;
            int c = curr.C;

            if (effort > dist[r, c]) continue;
            if (r == rows - 1 && c == cols - 1) return effort;

            for (int i = 0; i < 4; i++)
            {
                int nr = r + Dr[i];
                int nc = c + Dc[i];

                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols)
                {
                    int step = Math.Abs(heights[nr][nc] - heights[r][c]);
                    int nextEffort = Math.Max(effort, step);

                    if (nextEffort < dist[nr, nc])
                    {
                        dist[nr, nc] = nextEffort;
                        pq.Enqueue((nr, nc), nextEffort);
                    }
                }
            }
        }

        return dist[rows - 1, cols - 1];
    }
}
```

#### Complexity Analysis
- **Time Complexity:** $O(R \cdot C \log(R \cdot C))$. For $R, C \le 100$, $V = 10,000$. $\log(10,000) \approx 13$. Total operations $\approx 4 \times 10^4 \times 13 \approx 5 \times 10^5$, finishing in under $15$ ms in C#!
- **Space Complexity:** $O(R \cdot C)$ for the 2D effort matrix and priority queue.

---

### 4.2 [LeetCode 778] Swim in Rising Water (Hard)

#### Problem Formulation
You are given an $n \times n$ integer matrix `grid` where each value `grid[i][j]` represents the elevation at that point `(i, j)`. The rain starts to fall. At time $t$, the depth of the water everywhere is $t$. You can swim from a square to another 4-directionally adjacent square if and only if the elevation of both squares is at most $t$. You start at the top left square `(0, 0)`. Return the minimum time until you can reach the bottom right square `(n - 1, n - 1)`.

#### Minimax Dijkstra Insight
To traverse a path $P = (s, \dots, t)$, the water level must rise to at least the elevation of every cell along the path!
Therefore, the time required for path $P$ is:
$$\text{Time}(P) = \max_{(r, c) \in P} \text{grid}[r][c]$$
This is identical to Minimax Dijkstra!
- Starting water level is $\text{grid}[0][0]$.
- Relaxing neighbor $(nr, nc)$ requires water level $\max(\text{currentWater}, \text{grid}[nr][nc])$.
- Dijkstra finds the path minimizing this maximum in $O(N^2 \log N)$!

```csharp
using System;
using System.Collections.Generic;

public sealed class SwimInRisingWaterSolution
{
    private static readonly int[] Dr = { -1, 0, 1, 0 };
    private static readonly int[] Dc = { 0, 1, 0, -1 };

    public int SwimInWater(int[][] grid)
    {
        int n = grid.Length;
        var visited = new bool[n, n];
        var pq = new PriorityQueue<(int R, int C), int>();

        // Seed with start cell (0, 0)
        pq.Enqueue((0, 0), grid[0][0]);
        visited[0, 0] = true;

        while (pq.Count > 0)
        {
            pq.TryDequeue(out var cell, out int time);
            int r = cell.R;
            int c = cell.C;

            // Early exit: destination reached
            if (r == n - 1 && c == n - 1)
                return time;

            for (int i = 0; i < 4; i++)
            {
                int nr = r + Dr[i];
                int nc = c + Dc[i];

                if (nr >= 0 && nr < n && nc >= 0 && nc < n && !visited[nr, nc])
                {
                    visited[nr, nc] = true;
                    int nextTime = Math.Max(time, grid[nr][nc]);
                    pq.Enqueue((nr, nc), nextTime);
                }
            }
        }

        return -1;
    }
}
```

#### Complexity Analysis
- **Time Complexity:** $O(N^2 \log N)$. Every cell is visited once and pushed to the priority queue once.
- **Space Complexity:** $O(N^2)$ for the `visited` bitmatrix and priority queue.

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Shortest Path in a Grid with Obstacles Elimination ([LeetCode 1293] - Hard)
- **Constraint:** $M \times N$ grid with obstacles (`1`). You can eliminate up to $k$ obstacles. Find minimum steps to reach $(M-1, N-1)$.
- **State Space Augmentation:**
  - Standard state: `(r, c)`.
  - Augmented state: `(r, c, obstaclesLeft)`.
  - Maintain `visited[r, c, k]`. Run 0-1 BFS or Dijkstra across the 3D state graph!

### Exercise 2: Minimum Cost to Make at Least One Valid Path in a Grid ([LeetCode 1368] - Hard)
- **Constraint:** Grid where each cell has a arrow sign pointing 1 (Right), 2 (Left), 3 (Down), 4 (Up). Modifying an arrow costs 1.
- **0-1 BFS / Dijkstra Optimization:**
  - Moving along the existing arrow costs **0**.
  - Changing the arrow direction costs **1**.
  - Solve in $O(R \cdot C)$ using 0-1 BFS (`LinkedList<T>` deque) or Dijkstra!

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
                     2D GRID SHORTEST PATH DECISION TREE

                         What path metric are you optimizing?
                                    /        \
                            ADDITIVE          MINIMAX
                           SUM (Σ w)         BOTTLENECK (max w)
                             /                  \
              Are edge costs uniform?        [Minimax Dijkstra]
                    /         \              O(RC log(RC))
                  YES          NO            ([LC 1631], [LC 778])
                  /             \
            [Standard BFS]   [Grid Dijkstra]
             O(RC) time      O(RC log(RC))
```

---

## 7. 🎯 Daily Checkpoint Questions

### Diagnostic Question
Why can Dijkstra's algorithm be adapted to solve the Minimax Path problem (minimizing the maximum edge weight) without altering its greedy correctness proof?

### Architectural Model Answer
1. **The Greedy Precondition (Monotonicity):**
   Dijkstra's greedy proof relies on one core mathematical property: path costs must be **monotonically non-decreasing under path extension**. If extending path $P$ by edge $e$ could decrease the cost ($f(P \circ e) < f(P)$), an unvisited path could later undercut a finalized node.
2. **Minimax Monotonicity Satisfaction:**
   In the minimax problem, the cost of path $P$ is $f_{\max}(P) = \max_{e \in P} w(e)$.
   When an edge $e$ is appended to $P$:
   $$f_{\max}(P \circ e) = \max(f_{\max}(P), w(e))$$
   Because the maximum of any quantity with another value is always greater than or equal to the original quantity ($\max(A, B) \ge A$ for all real numbers):
   $$f_{\max}(P \circ e) \ge f_{\max}(P)$$
3. **Proof Preservation:**
   Because adding an edge can never reduce the bottleneck, any path currently in the priority queue will only accumulate equal or larger bottlenecks as it extends. Therefore, when the priority queue extracts a cell with the minimum tentative bottleneck, no alternative path currently in the queue can ever reach that cell with a smaller bottleneck. The greedy choice is permanently optimal.
