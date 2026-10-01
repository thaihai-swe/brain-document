---
title: "Week 22 — Day 148: Connected Components in Undirected Graphs: BFS-DFS Flood Fill & Island Decomposition"
---

# Week 22 — Day 148: Connected Components in Undirected Graphs: BFS-DFS Flood Fill & Island Decomposition

Welcome to **Day 148 of your DSA Mastery Journey**!

Throughout Week 21, you explored the mechanics of directed graph dependencies: cyclic invariants, the 3-color DFS state machine, Kahn's algorithm, topological dynamic programming, and parallel build engines.

Today, we launch **Week 22: Connectivity, Decomposition & Structural Properties**.

In graph theory, real-world networks—whether social networks, computer clusters, neural pathways, or road grids—are rarely connected as a single monolithic entity. They naturally partition into disconnected clusters. Understanding the structural properties of these clusters is fundamental to distributed systems, image segmentation, clustering algorithms, and percolation theory.

Today, you will master:
1. **The Algebraic Foundation of Connectivity:** Proving that path reachability in undirected graphs forms an **Equivalence Relation**, partitioning vertices into disjoint **Connected Components**.
2. **Component Labeling & Sizing:** Tracking component IDs, sizes, and representative roots using both BFS and DFS.
3. **2D Implicit Grid Graphs & Flood Fill:** Transforming matrix cells into graph nodes and implementing the canonical **Flood Fill** algorithm.
4. **Reverse Multi-Source Reachability:** Conquering complex multi-boundary grid flow problems like **[LeetCode 417] Pacific Atlantic Water Flow**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             DAY 148: CONNECTED COMPONENTS & FLOOD FILL                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       CONNECTIVITY EQUIVALENCE    │                             │       2D GRID FLOOD FILL          │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Relation u ~ v iff path exists. │                             │ • Cells (r, c) = Graph Vertices.  │
│ • Reflexive: u ~ u                │ ── Decomposition Bridge ──► │ • Edges = 4-way orthogonal adj.   │
│ • Symmetric: u ~ v <=> v ~ u      │                             │ • Multi-Source Reverse Flow:      │
│ • Transitive: u ~ v & v ~ w       │                             │   Start from ocean boundaries     │
│   ===> u ~ w                      │                             │   and flow UPHILL into terrain!   │
│ • Partitions V into disjoint CCs! │                             │ • Zero visited allocation trap.   │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CANONICAL PROBLEM MASTERY           │
                          ├─────────────────────────────────────────────┤
                          │ • [LC 323] Number of Connected Components   │
                          │ • [LC 733] Flood Fill                       │
                          │ • [LC 417] Pacific Atlantic Water Flow      │
                          │ • From-Scratch: ConnectedComponentsEngine   │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🏝️ The Visual Mental Model: Archipelagos & The Paint Bucket Flood Fill

Before writing grid loops or equivalence classes, picture looking down from an airplane at an ocean archipelago:

```
              🏝️ ISLANDS IN THE OCEAN & THE PAINT BUCKET FLOOD FILL

   Imagine looking at an ocean map where 1 is land and 0 is water:
   
          [ 1 ][ 1 ][ 0 ][ 0 ][ 1 ]
          [ 1 ][ 1 ][ 0 ][ 0 ][ 1 ]
          [ 0 ][ 0 ][ 0 ][ 1 ][ 1 ]
          [ 1 ][ 0 ][ 0 ][ 0 ][ 0 ]
   
   How do you count the islands? Just like the "Paint Bucket" tool in Photoshop:
   
   1. Scan cells row-by-row until you find an unpainted land tile (1).
   2. Click it with GREEN PAINT! The paint flows outward in 4 directions (North, South,
      East, West), coloring every contiguous land tile green until it hits ocean (0).
   3. When the green paint stops flowing:
      ===> You have discovered ISLAND #1 (Component 1)!
   4. Resume scanning for the next unpainted 1. Click it with BLUE PAINT!
      ===> You have discovered ISLAND #2 (Component 2)!
   5. Repeat until all land is painted!
   
   BECAUSE CONNECTIVITY IS TRANSITIVE (A touches B and B touches C ===> A touches C),
   EACH PAINT FILL EXPLORES ONE COMPLETE, MAXIMAL CONNECTED COMPONENT!
```

---

### 1.2 🖼️ Visual Gallery: Disjoint Island Partitioning & 2D Orthogonal Stencils

#### 1. Graph Decomposition into Disjoint Components:

```
        Component 1 (Green):          Component 2 (Blue):          Component 3 (Orange):
        [ 0 ] ─────── [ 1 ]           [ 3 ] ─────── [ 4 ]                  [ 5 ]
          │             │               │             │              (Isolated Node)
          │             │               │             │
        [ 2 ] ──────────┘               └─────────── [ 6 ]
   V1 = { 0, 1, 2 }              V2 = { 3, 4, 6 }              V3 = { 5 }
   Total Components = 3. Disjoint union: V1 ∪ V2 ∪ V3 = V, Vi ∩ Vj = ∅.
```

#### 2. The 2D Grid Orthogonal Stencil:

```
                            (-1, 0) [NORTH]
                                 ▲
                                 │
           (0, -1) [WEST] ◄─── (r, c) ───► (0, +1) [EAST]
                                 │
                                 ▼
                            (+1, 0) [SOUTH]

   Direction Arrays:
   int[] dr = { -1, 1,  0, 0 };
   int[] dc = {  0, 0, -1, 1 };
   
   Boundary Guard:
   if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr, nc]) ...
```

---

### 1.3 🏛️ Memory Layout: Flat Component IDs & 2D Coordinate Flattening

In hardware memory, a 2D $M \times N$ matrix is laid out as a single contiguous 1D array in row-major order:

```
   Coordinate (r, c) in an M x N Grid:
   • 2D to 1D:  index = r * N + c
   • 1D to 2D:  r = index / N,  c = index % N

   Component Label Array in RAM (int[] componentId):
   Index:          [ 0 ][ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ]
   componentId:    [ 1 ][ 1 ][ 1 ][ 2 ][ 2 ][ 3 ][ 2 ]
   
   Lookup: Are u and v in the same component?
   componentId[u] == componentId[v]  <=== O(1) instantaneous answer!
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* In an undirected graph $G = (V, E)$, two vertices $u$ and $v$ are connected ($u \sim v$) if there exists a path between them. A **Connected Component** is a maximal connected subgraph $G' = (V', E')$ such that for every pair $u, v \in V'$, $u \sim v$, and no vertex in $V \setminus V'$ is connected to any vertex in $V'$.
  - *Equivalence Relation Invariant:* The connectivity relation $\sim$ is:
    1. **Reflexive:** $u \sim u$ (a trivial path of length 0 exists from $u$ to itself).
    2. **Symmetric:** $u \sim v \implies v \sim u$ (since undirected edges can be traversed in both directions).
    3. **Transitive:** $u \sim v \land v \sim w \implies u \sim w$ (concatenation of path $u \rightsquigarrow v$ and $v \rightsquigarrow w$ yields path $u \rightsquigarrow w$).
    - *Consequence:* By the Fundamental Theorem of Equivalence Relations, $\sim$ strictly partitions the vertex set $V$ into mutually disjoint equivalence classes: $V = V_1 \cup V_2 \cup \dots \cup V_k$ where $V_i \cap V_j = \emptyset$ for $i \neq j$.
  - *Implicit Grid Graphs:* An $M \times N$ matrix is an implicit graph where each coordinate $(r, c)$ is a vertex, with up to 4 orthogonal neighbors: $(r \pm 1, c)$ and $(r, c \pm 1)$.
  - *Misconceptions:*
    - *Misconception 1:* "Connected components and strongly connected components are the same." **False!** In directed graphs, path existence is not symmetric ($u \to v$ does not imply $v \to u$). Directed graphs require **Strongly Connected Components (SCCs)** where mutual reachability ($u \rightsquigarrow v$ and $v \rightsquigarrow u$) is enforced.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Network Partitioning:* Detects isolated network clusters, air-gapped data centers, or severed optical lines.
  - *Computer Vision & Image Processing:* Identifies connected pixels belonging to distinct visual objects (Connected-Component Labeling / CCL in OpenCV).
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Counting islands, regions, or clusters in graphs or grids ([LC 323], [LC 200]).
    - Flood-filling regions of uniform color ([LC 733]).
    - Multi-boundary flow simulation ([LC 417]).
  - *When to Avoid / Failure Modes:*
    - Highly dynamic edge additions/removals: recalculating BFS/DFS from scratch on every mutation costs $O(V + E)$. Use **Disjoint Set Union (DSU / Union-Find)** instead for incremental dynamic connectivity.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Array Memory:* A component map `int[] componentId` of size $V$, where `componentId[u] = c` records the component label. Stored in contiguous 32-bit integer arrays for fast cache locality.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To identify connected components in an undirected graph, I iterate through all vertices. Whenever I find an unvisited vertex, I increment the component count and initiate a BFS or DFS to discover and label its entire connected component. For 2D grid flood fill, each cell is an implicit node with 4 orthogonal neighbors. When simulating flows from boundaries, such as Pacific Atlantic Water Flow, running reverse flood fills inward from ocean edges avoids expensive per-cell simulations. This guarantees optimal $O(V + E)$ or $O(M \cdot N)$ time complexity."
- **6. HOW (Complexity & Invariants):**
  - *Time Complexity:* $\Theta(V + E)$—every vertex is visited once, and every edge is traversed twice (once from each endpoint).
  - *Space Complexity:* $\Theta(V)$ auxiliary space for visited flags / component IDs and traversal queue/stack.

---

### 1.5 The Equivalence Class Partitioning Invariant

```
Graph Decomposition Architecture:
             Component 1:                   Component 2:           Component 3:
        [ 0 ] ─────── [ 1 ]             [ 3 ] ─────── [ 4 ]           [ 5 ]
          │             │                 │             │
          │             │                 │             │
        [ 2 ] ──────────┘                 └─────────── [ 6 ]
   V1 = { 0, 1, 2 }               V2 = { 3, 4, 6 }              V3 = { 5 }
   Total Components = 3. Disjoint union: V1 ∪ V2 ∪ V3 = V, Vi ∩ Vj = ∅.
```

When you invoke a traversal (BFS or DFS) starting at vertex $s$, the traversal visits **all** vertices reachable from $s$, and **only** vertices reachable from $s$. Because connectivity is transitive and symmetric, the set of visited vertices is guaranteed to be a maximal connected component.

---

### 1.2 2D Grid Graph Modeling & Boundary Traps

In a 2D matrix of dimensions $M \times N$:
- Total Vertices: $V = M \cdot N$.
- Total Edges: Every internal cell has 4 edges $\implies E < 4 \cdot M \cdot N$.
- Orthogonal Direction Vectors:
  ```csharp
  int[] dr = { -1, 1, 0, 0 };
  int[] dc = { 0, 0, -1, 1 };
  ```

#### The Reverse Flow Technique (Pacific Atlantic Water Flow)
In **[LeetCode 417] Pacific Atlantic Water Flow**, water flows from higher or equal elevation down to adjacent cells, and we must find all cells that can flow into both the Pacific Ocean (top and left borders) and Atlantic Ocean (bottom and right borders).

- **Naive Forward Approach:** Run BFS/DFS from every single cell $(r, c)$ to check if it reaches both oceans. Cost: $O((M \cdot N)^2)$—catastrophically slow (Time Limit Exceeded)!
- **Optimal Reverse Approach:** Invert the perspective!
  1. Water flowing *downhill* to the ocean is equivalent to water flowing *uphill* from the ocean into the continental interior!
  2. Multi-source BFS/DFS starting from all Pacific border cells simultaneously, moving to neighbors with height $\ge$ current cell. Mark `canReachPacific[r, c] = true`.
  3. Multi-source BFS/DFS starting from all Atlantic border cells simultaneously, moving to neighbors with height $\ge$ current cell. Mark `canReachAtlantic[r, c] = true`.
  4. The intersection: cells where `canReachPacific[r, c] && canReachAtlantic[r, c]` form the exact solution in strictly $O(M \cdot N)$ time!

```
Reverse Flood Fill Mechanics:
  [ Pacific Ocean ] (Top / Left)
         │  Flows UPHILL (height[next] >= height[curr])
         ▼
    [ Terrain ]
         ▲
         │  Flows UPHILL (height[next] >= height[curr])
  [ Atlantic Ocean ] (Bottom / Right)
```

---

## 2. 💻 IMPLEMENT: Production C# Container

The `ConnectedComponentsEngine` provides:
1. `FindComponents`: Decomposes general undirected graphs into labeled components with size tracking.
2. `FloodFillGrid`: High-performance 2D grid flood fill with boundary checks and in-place mutation.
3. Automated `Debug.Assert` validation tests covering disconnected components, isolated vertices, and grids.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedDSA.GraphFundamentals
{
    /// <summary>
    /// Production container for Undirected Graph Connected Component Decomposition
    /// and 2D Matrix Flood Fill algorithms.
    /// </summary>
    public sealed class ConnectedComponentsEngine
    {
        /// <summary>
        /// Decomposes an undirected graph into connected components.
        /// </summary>
        /// <param name="numVertices">Total number of vertices (0 to numVertices - 1).</param>
        /// <param name="edges">Undirected edges [u, v].</param>
        /// <param name="componentId">Output array where componentId[v] is the component index of v.</param>
        /// <param name="componentSizes">Output list of sizes for each component.</param>
        /// <returns>The total number of connected components.</returns>
        public static int FindComponents(int numVertices, int[][] edges, out int[] componentId, out List<int> componentSizes)
        {
            if (numVertices < 0) throw new ArgumentOutOfRangeException(nameof(numVertices));
            if (edges == null) throw new ArgumentNullException(nameof(edges));

            componentId = new int[numVertices];
            Array.Fill(componentId, -1);
            componentSizes = new List<int>();

            if (numVertices == 0) return 0;

            // 1. Build Adjacency List for Undirected Graph
            List<int>[] adj = new List<int>[numVertices];
            for (int i = 0; i < numVertices; i++) adj[i] = new List<int>();

            foreach (var edge in edges)
            {
                int u = edge[0];
                int v = edge[1];
                adj[u].Add(v);
                adj[v].Add(u);
            }

            int currentComponent = 0;
            Queue<int> queue = new Queue<int>();

            // 2. Iterate through all vertices to find unvisited roots
            for (int i = 0; i < numVertices; i++)
            {
                if (componentId[i] != -1) continue;

                // Discovered a new connected component
                int size = 0;
                componentId[i] = currentComponent;
                queue.Enqueue(i);

                while (queue.Count > 0)
                {
                    int u = queue.Dequeue();
                    size++;

                    foreach (int v in adj[u])
                    {
                        if (componentId[v] == -1)
                        {
                            componentId[v] = currentComponent;
                            queue.Enqueue(v);
                        }
                    }
                }

                componentSizes.Add(size);
                currentComponent++;
            }

            return currentComponent;
        }

        /// <summary>
        /// In-place 2D grid flood fill replacing connected pixels of originalColor with newColor.
        /// </summary>
        public static int[][] FloodFill(int[][] image, int sr, int sc, int newColor)
        {
            if (image == null || image.Length == 0) return image;
            int originalColor = image[sr][sc];
            if (originalColor == newColor) return image; // Avoid infinite loop

            int rows = image.Length;
            int cols = image[0].Length;

            Queue<(int r, int c)> queue = new Queue<(int r, int c)>();
            queue.Enqueue((sr, sc));
            image[sr][sc] = newColor;

            int[] dr = { -1, 1, 0, 0 };
            int[] dc = { 0, 0, -1, 1 };

            while (queue.Count > 0)
            {
                var (r, c) = queue.Dequeue();

                for (int d = 0; d < 4; d++)
                {
                    int nr = r + dr[d];
                    int nc = c + dc[d];

                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && image[nr][nc] == originalColor)
                    {
                        image[nr][nc] = newColor;
                        queue.Enqueue((nr, nc));
                    }
                }
            }

            return image;
        }

        /// <summary>
        /// Comprehensive test suite.
        /// </summary>
        public static void RunTests()
        {
            Console.WriteLine("Running ConnectedComponentsEngine Test Suite...");

            // Test 1: 3 Components in 5 Vertices (0-1-2, 3-4)
            int[][] edges1 = { new int[] { 0, 1 }, new int[] { 1, 2 }, new int[] { 3, 4 } };
            int count1 = FindComponents(5, edges1, out int[] compId1, out var sizes1);
            Debug.Assert(count1 == 2, $"Test 1 Failed: Expected 2 components, got {count1}");
            Debug.Assert(sizes1[0] == 3 && sizes1[1] == 2, "Test 1 Sizes mismatch.");
            Debug.Assert(compId1[0] == compId1[1] && compId1[1] == compId1[2], "Test 1 Component 0 mismatch.");
            Debug.Assert(compId1[3] == compId1[4], "Test 1 Component 1 mismatch.");
            Debug.Assert(compId1[0] != compId1[3], "Test 1 Components should be disjoint.");

            // Test 2: Isolated Vertices (No Edges)
            int[][] edges2 = Array.Empty<int[]>();
            int count2 = FindComponents(4, edges2, out _, out var sizes2);
            Debug.Assert(count2 == 4, $"Test 2 Failed: Expected 4 isolated components, got {count2}");
            Debug.Assert(sizes2.Count == 4 && sizes2[0] == 1, "Test 2 Failed: Sizes should all be 1.");

            // Test 3: 2D Grid Flood Fill
            int[][] grid = new int[][]
            {
                new int[] { 1, 1, 1 },
                new int[] { 1, 1, 0 },
                new int[] { 1, 0, 1 }
            };
            FloodFill(grid, 1, 1, 2);
            Debug.Assert(grid[0][0] == 2 && grid[1][1] == 2 && grid[1][2] == 0 && grid[2][2] == 1,
                "Test 3 Failed: Flood fill corrupted grid boundaries.");

            Console.WriteLine("All ConnectedComponentsEngine tests PASSED successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Systems & Complexity Analysis

### 3.1 Complexity Profile

| Operation | Time Complexity | Space Complexity | Architectural Justification |
| :--- | :--- | :--- | :--- |
| **Component Finding (Graph)** | $\Theta(V + E)$ | $\Theta(V)$ | Every vertex processed once; every undirected edge inspected twice. |
| **Grid Flood Fill ($M \times N$)** | $\Theta(M \cdot N)$ | $\Theta(M \cdot N)$ | In worst case, flood fills entire grid; queue stores up to $O(M + N)$ perimeter cells. |
| **Pacific Atlantic Water Flow** | $\Theta(M \cdot N)$ | $\Theta(M \cdot N)$ | Two multi-source BFS passes; each cell visited at most twice. |

---

### 3.2 Memory Layout & In-Place Mutation

When operating on 2D grid graphs in systems with memory constraints:
- **In-Place Mutation:** Directly overwriting `image[r][c] = newColor` eliminates the need for an auxiliary `bool[M, N]` visited matrix, saving $M \times N$ bytes of heap memory.
- **Edge Case Guard:** If `originalColor == newColor`, an in-place mutation without a guard would loop infinitely. Always check `if (originalColor == newColor) return image;` before launching the traversal.

---

## 4. 🧩 APPLY: Canonical Problem Walkthroughs

### 4.1 [LeetCode 323] Number of Connected Components in an Undirected Graph (Medium)

```csharp
public class SolutionLC323
{
    public int CountComponents(int n, int[][] edges)
    {
        List<int>[] adj = new List<int>[n];
        for (int i = 0; i < n; i++) adj[i] = new List<int>();

        foreach (var edge in edges)
        {
            adj[edge[0]].Add(edge[1]);
            adj[edge[1]].Add(edge[0]);
        }

        bool[] visited = new bool[n];
        int components = 0;

        for (int i = 0; i < n; i++)
        {
            if (!visited[i])
            {
                components++;
                Dfs(i, adj, visited);
            }
        }

        return components;
    }

    private void Dfs(int u, List<int>[] adj, bool[] visited)
    {
        visited[u] = true;
        foreach (int v in adj[u])
        {
            if (!visited[v])
            {
                Dfs(v, adj, visited);
            }
        }
    }
}
```

---

### 4.2 [LeetCode 417] Pacific Atlantic Water Flow (Medium)

```csharp
public class SolutionLC417
{
    public IList<IList<int>> PacificAtlantic(int[][] heights)
    {
        var result = new List<IList<int>>();
        if (heights == null || heights.Length == 0) return result;

        int m = heights.Length;
        int n = heights[0].Length;

        bool[,] pacific = new bool[m, n];
        bool[,] atlantic = new bool[m, n];

        Queue<(int r, int c)> pacQueue = new Queue<(int r, int c)>();
        Queue<(int r, int c)> atlQueue = new Queue<(int r, int c)>();

        // 1. Seed Pacific (Top row & Left col) and Atlantic (Bottom row & Right col)
        for (int r = 0; r < m; r++)
        {
            pacific[r, 0] = true;
            pacQueue.Enqueue((r, 0));

            atlantic[r, n - 1] = true;
            atlQueue.Enqueue((r, n - 1));
        }

        for (int c = 0; c < n; c++)
        {
            pacific[0, c] = true;
            pacQueue.Enqueue((0, c));

            atlantic[m - 1, c] = true;
            atlQueue.Enqueue((m - 1, c));
        }

        // 2. Multi-source BFS flowing UPHILL
        BfsFlowUphill(heights, pacQueue, pacific, m, n);
        BfsFlowUphill(heights, atlQueue, atlantic, m, n);

        // 3. Find intersection cells
        for (int r = 0; r < m; r++)
        {
            for (int c = 0; c < n; c++)
            {
                if (pacific[r, c] && atlantic[r, c])
                {
                    result.Add(new List<int> { r, c });
                }
            }
        }

        return result;
    }

    private void BfsFlowUphill(int[][] heights, Queue<(int r, int c)> queue, bool[,] reachable, int m, int n)
    {
        int[] dr = { -1, 1, 0, 0 };
        int[] dc = { 0, 0, -1, 1 };

        while (queue.Count > 0)
        {
            var (r, c) = queue.Dequeue();

            for (int d = 0; d < 4; d++)
            {
                int nr = r + dr[d];
                int nc = c + dc[d];

                // Uphill condition: height[nr][nc] >= height[r][c]
                if (nr >= 0 && nr < m && nc >= 0 && nc < n && !reachable[nr, nc] && heights[nr][nc] >= heights[r][c])
                {
                    reachable[nr, nc] = true;
                    queue.Enqueue((nr, nc));
                }
            }
        }
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 323] Number of Connected Components in an Undirected Graph (Medium):**
   - Solve using BFS and compare with DFS implementation.

2. **[LeetCode 733] Flood Fill (Easy):**
   - Implement without helper classes using a flat queue.

3. **[LeetCode 417] Pacific Atlantic Water Flow (Medium):**
   - Master the multi-source reverse reachability approach.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Connectivity Strategy:

                     What type of Connectivity Problem?
                                     │
             ┌───────────────────────┴───────────────────────┐
             ▼                                               ▼
     Static Graph / Grid                             Dynamic Incremental Edges
             │                                               │
    ┌────────┴────────┐                             ┌────────┴────────┐
    ▼                 ▼                             ▼                 ▼
General Graph      2D Matrix                   Union-Find (DSU)   Kruskal's MST
BFS / DFS Pass    Flood Fill                   Amortized O(α(N))  Edge sorting
O(V + E)          O(M * N)
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
What is the mathematical difference between connected components in undirected graphs and strongly connected components (SCCs) in directed graphs?

### Architectural Model Answer
1. **Symmetry of the Connectivity Relation:**
   - In an **undirected graph**, the path-existence relation $u \sim v$ is naturally **symmetric**: if there is an edge $(u, v)$, you can traverse from $u$ to $v$ and from $v$ to $u$.
   - Consequently, $u \sim v \iff v \sim u$. This symmetry makes connectivity an **equivalence relation**, strictly partitioning $V$ into mutually disjoint connected components. A single traversal from any vertex in the component reaches all other vertices in that component.

2. **Asymmetry in Directed Graphs:**
   - In a **directed graph**, directed edge $(u, v)$ only permits flow $u \to v$. Having a path $u \rightsquigarrow v$ **does not** imply a path $v \rightsquigarrow u$.
   - Therefore, reachability is not symmetric and not an equivalence relation.

3. **Definition of Strongly Connected Components (SCCs):**
   - To recover an equivalence relation in directed graphs, we define **Mutual Reachability**:
     $$u \equiv v \iff (u \rightsquigarrow v) \land (v \rightsquigarrow u)$$
   - An SCC is a maximal subgraph where *every* vertex is mutually reachable from *every other* vertex in the subgraph.
   - While an undirected component can be discovered with a simple BFS/DFS, an SCC requires specialized algorithms (Tarjan's Low-Link or Kosaraju's Double-DFS pass) to separate one-way forward reachability from true bidirectional cycles.
