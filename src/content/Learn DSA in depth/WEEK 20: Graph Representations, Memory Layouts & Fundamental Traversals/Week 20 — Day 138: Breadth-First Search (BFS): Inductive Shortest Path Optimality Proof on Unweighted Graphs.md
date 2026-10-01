---
title: "Week 20 — Day 138: Breadth-First Search (BFS): Inductive Shortest Path Optimality Proof on Unweighted Graphs"
---

# Week 20 — Day 138: Breadth-First Search (BFS): Inductive Shortest Path Optimality Proof on Unweighted Graphs

Welcome to **Day 138 of your DSA Mastery Journey**!

Yesterday, on Day 137, you mastered **Depth-First Search (DFS)**, uncovering discovery/finish timestamps, edge classifications, and explicit stack overflow defenses. While DFS is unmatched for cycle detection, topological sorting, and exhaustive path enumeration, it has a glaring limitation: **it cannot find the shortest path**. DFS plunges down whichever arbitrary branch it happens to inspect first, often finding a tortuous path of length 50 when an optimal direct path of length 2 exists.

To find the true, guaranteed shortest path between two entities in an unweighted graph, we deploy **Breadth-First Search (BFS)**.

Invented by Edward F. Moore in 1959 for finding the shortest path through an electronic routing maze, BFS expands outward from a source vertex like ripples in a pond, exploring all vertices at distance $1$, then all vertices at distance $2$, and so forth. Today, you will master the queue FIFO mechanics of BFS, build a production-grade C# shortest-path engine with complete path reconstruction, and study the rigorous mathematical proof by induction that guarantees its shortest-path optimality.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 DAY 138: BREADTH-FIRST SEARCH WAVEFRONT                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│        THE FIFO QUEUE WAVEFRONT   │                             │    SHORTEST PATH OPTIMALITY PROOF │
│         Layer-by-Layer Expansion  │                             │        (INDUCTIVE GUARANTEE)      │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Layer 0: Source {S} (dist = 0). │                             │ • Two-Layer Invariant:            │
│ • Layer 1: Neighbors of S (d = 1).│ ── Inductive Optimality ──► │   Queue contains vertices from at │
│ • Layer 2: Neighbors of L1 (d = 2)│                             │   most two layers: { d, d + 1 }.  │
│ • Monotonic Queue Ordering:       │                             │ • Theorem: When vertex v is first │
│   dist(q1) <= dist(q2) <= ...     │                             │   dequeued, dist[v] = delta(s, v).│
│   <= dist(q1) + 1.                │                             │ • Guaranteed shortest path!       │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │   SHORTEST PATH ENGINE & RECONSTRUCTION     │
                          ├─────────────────────────────────────────────┤
                          │ • Tracks: dist[] and parent[] arrays.       │
                          │ • Path Reconstruction: Backtrack from dest  │
                          │   to src via parent pointers: O(d) steps.   │
                          │ • Canonical: [LC 1091] Binary Matrix 8-Way. │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🌊 The Visual Mental Model: The Pebble in the Pond & Concentric Distance Ripples

Before writing queue loops or inductive proofs, picture what happens when you drop a pebble into a calm pond:

```
              🌊 THE PEBBLE IN THE POND: CONCENTRIC DISTANCE RIPPLES

   Drop a pebble at Source Vertex (S):
   Water waves expand outwards in uniform concentric circles.
   The wave MUST reach every point at distance 1 before it can possibly touch distance 2!

                      Distance d = 2 (Second Ripple)
                    . - ~ ~ ~ ~ ~ ~ ~ ~ - .
                . '                         ' .
              /       Distance d = 1            \
             /       . - ~ ~ ~ ~ - .             \
            /      /                 \            \
           |      |      [ S ]        |            |
           |      |     (d = 0)       |            |
           |      |      /   \        |            |
           |      |     ▼     ▼       |            |
           |      |   ( A )  ( B )    |            |
           |       \   d=1    d=1    /             |
            \        ' - ~ ~ ~ ~ - '              /
             \          /       \                /
              \        ▼         ▼              /
                . '  ( C )      ( D )       ' .
                    . - ~ ~ ~ ~ ~ ~ ~ ~ - .
```

#### Why the Wavefront MUST Find the Shortest Path
- In an unweighted graph, every edge takes exactly "1 time step" (1 wave propagation) to traverse.
- If vertex $C$ is first touched at Time $T = 2$, it is **physically impossible** for any other path to reach $C$ in 1 step (otherwise the wave would have already hit it at Time 1!).
- Therefore, the very **first time a node is touched by the expanding wave**, that path is guaranteed to be the absolute shortest!

---

### 1.2 🖼️ Visual Gallery: The Two-Layer FIFO Queue State Evolution

A Breadth-First Search executes this concentric ripple using a simple First-In, First-Out (FIFO) Queue. 

```
               THE TWO-LAYER QUEUE INVARIANT IN ACTION

   At any instant, the Queue contains ONLY nodes from Layer d and Layer d+1:

   Queue Head                                                     Queue Tail
   ┌──────────────┬──────────────┬──────────────┬──────────────┬───────────┐
   │   Node A     │   Node B     │   Node C     │   Node D     │  Node E   │
   │ (dist = d)   │ (dist = d)   │ (dist = d+1) │ (dist = d+1) │(dist = d+1│
   └──────────────┴──────────────┴──────────────┴──────────────┴───────────┘
   ▲                             ▲
   └─── Currently Dequeueing ────┴─── Newly Discovered Neighbors Pushed Here
        (Layer d)                     (Layer d+1)
```

#### ⚠️ The Fatal Visited Trap: Enqueue vs Dequeue
Where you mark a vertex as `visited` makes the difference between blazing fast $O(V + E)$ and crashing with Out-Of-Memory:

```
   ❌ WRONG: Mark Visited upon DEQUEUE           ✅ CORRECT: Mark Visited upon ENQUEUE
   
      (A) ──► (C)                                   (A) ──► (C)
       │       ▲                                     │       ▲
       ▼       │                                     ▼       │
      (B) ─────┘                                    (B) ─────┘
   
   1. Pop A -> sees C (not visited) -> Enqueue C. 1. Pop A -> sees C -> Mark C visited & Enqueue.
   2. Pop B -> sees C (STILL not visited!)        2. Pop B -> sees C (already visited!)
      -> Enqueues C a SECOND time!                   -> Safely ignores C!
   
   Result: Exponential duplicate node             Result: Exactly ONE entry per vertex in
   allocations on dense graphs: O(b^d) RAM!       queue: Strictly O(V) memory footprint!
```

---

### 1.3 🏛️ Memory Layout: Queue Buffer & Predecessor Backtracking Array

How does BFS reconstruct the exact path from Source to Target? It tracks parent pointers in a flat array:

```
   Source = 0, Target = 3
   
   Adjacency List:                   Parent Predecessor Array (RAM):
   0: [1, 2]                         Index (v):   [ 0 ][ 1 ][ 2 ][ 3 ]
   1: [3]                            parent[v]:   [-1 ][ 0 ][ 0 ][ 1 ]
   2: [3]                            dist[v]:     [ 0 ][ 1 ][ 1 ][ 2 ]
   
   Path Reconstruction via Backtracking from Target (3):
   Step 1: curr = 3  ──►  path.Add(3)
   Step 2: curr = parent[3] = 1  ──►  path.Add(1)
   Step 3: curr = parent[1] = 0  ──►  path.Add(0)
   Step 4: curr = parent[0] = -1 ──►  Stop!
   
   Reversed Path: 0 -> 1 -> 3 (Optimal Shortest Path of length 2!)
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* **Breadth-First Search (BFS)** is a graph traversal algorithm that systematically explores the edges of an unweighted graph $G = (V, E)$ outward from a source vertex $s$. It visits all vertices at distance $k$ from $s$ before exploring any vertex at distance $k + 1$.
  - *Core Invariants:*
    1. **The Two-Layer Queue Invariant:** At any instant during BFS execution, the vertices currently residing in the FIFO queue have distances from the source that satisfy:
       $$\text{dist}(q_{\text{head}}) \le \text{dist}(q_{\text{tail}}) \le \text{dist}(q_{\text{head}}) + 1$$
       The queue never contains vertices spanning more than two consecutive distance layers $\{d, d + 1\}$.
    2. **Monotonicity Invariant:** The sequence of vertices dequeued from the queue has monotonically non-decreasing distances from the source:
       $$d_1 \le d_2 \le d_3 \le \dots \le d_V$$
    3. **First-Discovery Optimality Invariant:** When a vertex $v$ is first discovered (inserted into the queue), the recorded distance $\text{dist}[v]$ is the true mathematical shortest-path distance $\delta(s, v)$.
  - *Misconception Check:*
    - *Misconception 1:* "BFS finds the shortest path on any graph." **False!** BFS only finds the shortest path on **unweighted graphs** (or graphs where all edges have the exact same positive weight). If edges have varying weights, a path with 2 heavy edges of weight 10 is longer than a path with 3 light edges of weight 1. For non-uniform weights, you must use **Dijkstra's Algorithm** (or 0-1 BFS).
    - *Misconception 2:* "Marking a node as visited when it is dequeued is correct." **Fatal Performance Bug!** If you mark a node as visited only when it is *dequeued*, the same neighbor can be added to the queue dozens of times by different parents in the same layer, causing an **exponential memory explosion** ($O(b^d)$)! A node must **always be marked visited immediately upon ENQUEUEING**!
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the non-optimal, arbitrary deep paths of DFS. Provides a deterministic, minimal-step trajectory between any two vertices in linear time $\Theta(V + E)$.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Finding the shortest path or minimum number of moves/operations in unweighted graphs or game states.
    - Level-order traversal of trees and layered networks.
    - Multi-source wavefront expansions (e.g. fire spreading, infection propagation).
  - *When to Avoid / Failure Modes:*
    - Graphs with non-uniform edge weights (use Dijkstra).
    - Exhaustive combinatorial path generation (use DFS/Backtracking).
    - Extremely high branching factor with deep targets where queue memory exceeds RAM (use Bidirectional BFS or Iterative Deepening DFS).
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Memory Model (Queue Frontier):* Unlike DFS whose memory is bounded by the maximum depth $d$ of the tree ($O(d)$), BFS stores the entire current **frontier layer**. In a graph with branching factor $b$, the frontier at depth $d$ contains $O(b^d)$ nodes! On wide graphs, BFS memory can quickly consume gigabytes of heap RAM.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "Breadth-First Search discovers vertices layer-by-layer using a FIFO queue. It maintains the invariant that the queue contains vertices from at most two consecutive distance layers, guaranteeing monotonically increasing distance discovery. On unweighted graphs, when a vertex is first reached, its recorded distance is mathematically proven to be the shortest path. To prevent exponential node duplication, I always mark vertices as visited immediately upon enqueueing."
- **6. HOW (Operations, Implementation & State Trace):**
  - *Complexity Profile:* Time: $\Theta(V + E)$ on adjacency list; Space: $\Theta(V)$ queue and visited arrays.

---

### 1.5 📐 Mathematical Proof: Inductive Optimality of BFS Shortest Paths

Let $\delta(s, v)$ denote the true shortest-path distance (minimum number of edges) from source $s$ to vertex $v$.
Let $\text{dist}[v]$ denote the distance assigned to vertex $v$ by the BFS algorithm.

#### Theorem: Shortest Path Correctness of BFS
For all vertices $v \in V$ reachable from $s$, upon completion of BFS:
$$\text{dist}[v] = \delta(s, v)$$

*Proof by Contradiction & Induction on Distance:*
1. **Base Case:** For the source vertex $s$, $\text{dist}[s] = 0 = \delta(s, s)$. The theorem trivially holds.
2. **Inductive Hypothesis:** Assume for all vertices $u$ with $\delta(s, u) \le k$, BFS correctly assigns $\text{dist}[u] = \delta(s, u)$, and these vertices are enqueued before any vertex at distance $\ge k + 1$.
3. **Inductive Step:** Consider a vertex $v$ such that $\delta(s, v) = k + 1$.
   - By definition of shortest path, there must exist some predecessor vertex $u$ on the shortest path from $s$ to $v$ such that $(u, v) \in E$ and $\delta(s, u) = k$.
   - By our inductive hypothesis, $\text{dist}[u] = k$, and $u$ is enqueued during the processing of layer $k$.
   - Because the queue operates in strict FIFO order and only contains vertices of distance $k$ and $k + 1$:
     - Vertex $u$ will be dequeued during layer $k$.
     - When $u$ is dequeued, edge $(u, v)$ is examined.
   - If $v$ has not yet been discovered:
     - BFS sets $\text{dist}[v] = \text{dist}[u] + 1 = k + 1 = \delta(s, v)$.
     - Vertex $v$ is enqueued into layer $k + 1$.
   - *Could $v$ have been discovered earlier with a distance $< k + 1$?*
     - No. By definition, $\delta(s, v) = k + 1$ is the global minimum. Any earlier path would have length $\le k$, contradicting that the shortest path is $k + 1$.
   - *Could $v$ be discovered later from some other node?*
     - No. Because $v$ is enqueued when $u$ is processed at layer $k$, its distance is finalized at $k + 1$. Any subsequent paths reaching $v$ from layer $k + 1$ or higher will see that $v$ is already marked visited and will be safely ignored.
4. Therefore, by mathematical induction, for every reachable vertex $v$, $\text{dist}[v] = \delta(s, v)$. $\blacksquare$

---

## 2. 🛠️ IMPLEMENT: Production-Grade From-Scratch C# Engine

Below is the standalone, production-grade C# implementation of `BreadthFirstSearchEngine`. It features:
1. Shortest path distance calculation on unweighted graphs.
2. Complete predecessor tracking for $O(d)$ **path reconstruction**.
3. Level-by-level layer boundary iteration.
4. Comprehensive `Debug.Assert` validation test suite.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace GraphFundamentals.Traversals
{
    /// <summary>
    /// Production-grade Breadth-First Search (BFS) shortest path engine.
    /// Provides optimal unweighted shortest paths and linear-time path reconstruction.
    /// </summary>
    public class BreadthFirstSearchEngine
    {
        private readonly List<int>[] _adj;
        private readonly int _vertexCount;

        public int VertexCount => _vertexCount;

        public BreadthFirstSearchEngine(int vertexCount)
        {
            if (vertexCount <= 0)
                throw new ArgumentOutOfRangeException(nameof(vertexCount));

            _vertexCount = vertexCount;
            _adj = new List<int>[vertexCount];
            for (int i = 0; i < vertexCount; i++) _adj[i] = new List<int>();
        }

        public void AddUndirectedEdge(int u, int v)
        {
            ValidateVertex(u);
            ValidateVertex(v);
            _adj[u].Add(v);
            if (u != v) _adj[v].Add(u);
        }

        public void AddDirectedEdge(int u, int v)
        {
            ValidateVertex(u);
            ValidateVertex(v);
            _adj[u].Add(v);
        }

        /// <summary>
        /// Computes shortest path distances and parent pointers from source in O(V + E) time.
        /// </summary>
        public (int[] Distances, int[] Parents) ComputeShortestPaths(int src)
        {
            ValidateVertex(src);

            int[] dist = new int[_vertexCount];
            int[] parent = new int[_vertexCount];
            Array.Fill(dist, -1);
            Array.Fill(parent, -1);

            var queue = new Queue<int>(_vertexCount);

            // Invariant: Mark visited IMMEDIATELY upon enqueueing!
            dist[src] = 0;
            parent[src] = src; // Source is its own parent
            queue.Enqueue(src);

            while (queue.Count > 0)
            {
                int u = queue.Dequeue();
                int currentDist = dist[u];

                var neighbors = _adj[u];
                for (int i = 0; i < neighbors.Count; i++)
                {
                    int v = neighbors[i];

                    if (dist[v] == -1) // Unvisited neighbor
                    {
                        dist[v] = currentDist + 1;
                        parent[v] = u;
                        queue.Enqueue(v);
                    }
                }
            }

            return (dist, parent);
        }

        /// <summary>
        /// Reconstructs the exact shortest sequence of vertices from src to dst.
        /// Returns empty list if dst is unreachable.
        /// </summary>
        public List<int> ReconstructShortestPath(int src, int dst)
        {
            ValidateVertex(src);
            ValidateVertex(dst);

            var (dist, parent) = ComputeShortestPaths(src);

            if (dist[dst] == -1)
            {
                return new List<int>(); // No path exists
            }

            var path = new List<int>(dist[dst] + 1);
            int curr = dst;

            while (curr != src)
            {
                path.Add(curr);
                curr = parent[curr];
            }
            path.Add(src);

            path.Reverse(); // Reverse to get src -> ... -> dst order
            return path;
        }

        private void ValidateVertex(int v)
        {
            if (v < 0 || v >= _vertexCount)
                throw new ArgumentOutOfRangeException(nameof(v));
        }
    }

    /// <summary>
    /// Verification test suite for BFS shortest path engine.
    /// </summary>
    public static class BfsEngineTests
    {
        public static void RunAllTests()
        {
            Console.WriteLine("Executing BFS Engine Verification Suite...");

            // Test 1: Grid-like Graph Shortest Path
            // 0 - 1 - 2
            // |       |
            // 3 - 4 - 5
            var bfs = new BreadthFirstSearchEngine(vertexCount: 6);
            bfs.AddUndirectedEdge(0, 1);
            bfs.AddUndirectedEdge(1, 2);
            bfs.AddUndirectedEdge(0, 3);
            bfs.AddUndirectedEdge(3, 4);
            bfs.AddUndirectedEdge(4, 5);
            bfs.AddUndirectedEdge(2, 5);

            var (dist, parent) = bfs.ComputeShortestPaths(0);

            Debug.Assert(dist[0] == 0);
            Debug.Assert(dist[1] == 1);
            Debug.Assert(dist[3] == 1);
            Debug.Assert(dist[2] == 2);
            Debug.Assert(dist[4] == 2);
            Debug.Assert(dist[5] == 3);

            // Path reconstruction from 0 to 5
            var path = bfs.ReconstructShortestPath(0, 5);
            Debug.Assert(path.Count == 4);
            Debug.Assert(path[0] == 0 && path[3] == 5);
            Debug.Assert(path.Contains(1) || path.Contains(3)); // Path is either 0-1-2-5 or 0-3-4-5

            // Test 2: Disconnected Component
            var disconnectedBfs = new BreadthFirstSearchEngine(vertexCount: 4);
            disconnectedBfs.AddUndirectedEdge(0, 1);
            // Nodes 2 and 3 are isolated from 0 and 1
            disconnectedBfs.AddUndirectedEdge(2, 3);

            var (discDist, _) = disconnectedBfs.ComputeShortestPaths(0);
            Debug.Assert(discDist[0] == 0);
            Debug.Assert(discDist[1] == 1);
            Debug.Assert(discDist[2] == -1);
            Debug.Assert(discDist[3] == -1);

            var emptyPath = disconnectedBfs.ReconstructShortestPath(0, 3);
            Debug.Assert(emptyPath.Count == 0);

            Console.WriteLine("All BFS Shortest Path verification tests passed with 100% assertions verified!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### Asymptotic Profile

| Metric / Structure | Breadth-First Search (BFS) | Depth-First Search (DFS) |
| :--- | :--- | :--- |
| **Time Complexity** | $\Theta(V + E)$ | $\Theta(V + E)$ |
| **Shortest Path Optimality** | $\mathbf{\text{Guaranteed (Unweighted)}}$ | Not Guaranteed (arbitrary deep branch) |
| **Memory Consumption** | $\Theta(\text{Max Frontier Width}) = O(b^d)$ | $\Theta(\text{Max Depth}) = O(d)$ |
| **Data Structure Engine** | FIFO Queue | LIFO Stack |
| **Memory Allocation** | Heap Queue buffer | Thread Stack / Heap Stack |

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### Problem: [LeetCode 1091] Shortest Path in Binary Matrix (Medium)

#### Problem Statement
Given an `n x n` binary matrix `grid`, return the length of the shortest clear path in the matrix. If there is no clear path, return `-1`.
A clear path in a binary matrix is a path from the top-left cell `(0, 0)` to the bottom-right cell `(n - 1, n - 1)` such that:
- All visited cells of the path are `0`.
- All adjacent cells of the path are **8-directionally connected** (horizontally, vertically, or diagonally).
- The length of a clear path is the number of visited cells of this path.

#### Algorithmic Strategy (8-Directional Queue BFS)
1. Edge cases: If `grid[0][0] == 1` or `grid[n-1][n-1] == 1`, start or end is blocked $\implies$ return `-1`.
2. BFS Queue stores `(r, c, pathLength)`.
3. Enqueue `(0, 0, 1)` and immediately mutate `grid[0][0] = 1` to mark visited.
4. While queue is not empty:
   - Dequeue `(r, c, length)`.
   - If `r == n - 1 && c == n - 1`, return `length` (first dequeue to target is guaranteed optimal!).
   - Explore all 8 directional offsets `[-1, 0, 1] x [-1, 0, 1]`:
     - If neighbor is within bounds and `grid[nr][nc] == 0`:
       - Mutate `grid[nr][nc] = 1` (mark visited immediately!).
       - Enqueue `(nr, nc, length + 1)`.
5. If queue exhausts without reaching destination, return `-1`.

#### Production Solution in C#
```csharp
using System.Collections.Generic;

public class ShortestPathBinaryMatrixSolution
{
    private static readonly int[] DeltaRow = { -1, -1, -1,  0, 0,  1, 1, 1 };
    private static readonly int[] DeltaCol = { -1,  0,  1, -1, 1, -1, 0, 1 };

    public static int ShortestPathBinaryMatrix(int[][] grid)
    {
        int n = grid.Length;
        if (grid[0][0] != 0 || grid[n - 1][n - 1] != 0) return -1;
        if (n == 1) return 1;

        var queue = new Queue<(int R, int C, int Dist)>();
        queue.Enqueue((0, 0, 1));
        grid[0][0] = 1; // Mark visited

        while (queue.Count > 0)
        {
            var (r, c, dist) = queue.Dequeue();

            if (r == n - 1 && c == n - 1)
            {
                return dist;
            }

            for (int i = 0; i < 8; i++)
            {
                int nr = r + DeltaRow[i];
                int nc = c + DeltaCol[i];

                if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] == 0)
                {
                    grid[nr][nc] = 1; // Mark visited upon enqueue!
                    queue.Enqueue((nr, nc, dist + 1));
                }
            }
        }

        return -1;
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 1162] As Far from Land as Possible (Medium):**
   - *Task:* Given an `n x n` grid containing only `0`s (water) and `1`s (land), find a water cell such that its distance to the nearest land cell is maximized, and return the distance.
   - *Pattern:* Multi-source BFS starting from all land cells simultaneously.

2. **[LeetCode 542] 01 Matrix (Medium):**
   - *Task:* Given an `m x n` binary matrix `mat`, return the distance of the nearest `0` for each cell.
   - *Pattern:* Multi-source BFS initializing the queue with all `0` coordinates.

3. **Layer Barrier BFS (Level-Order Output):**
   - Implement BFS using an inner `int levelSize = queue.Count` loop to process the graph in discrete distance slices without storing distances in the queue.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Search Space Strategy Decision:

                     ┌───────────────────────────────────────────────┐
                     │          GRAPH SEARCH SPACE PROFILE           │
                     └───────────────────────────────────────────────┘
                                             │
             ┌───────────────────────────────┴───────────────────────────────┐
             ▼                                                               ▼
┌──────────────────────────────────────────┐    ┌──────────────────────────────────────────┐
│      UNWEIGHTED SHORTEST PATH            │    │       ARBITRARY WEIGHTED SHORTEST PATH   │
├──────────────────────────────────────────┤    ├──────────────────────────────────────────┤
│ • Algorithm: Breadth-First Search (BFS). │    │ • Algorithm: Dijkstra's Algorithm.       │
│ • Structure: FIFO Queue.                 │    │ • Structure: Min-Heap / PriorityQueue.   │
│ • Time Complexity: O(V + E) strictly!    │    │ • Time Complexity: O((V + E) log V).     │
│ • Key Invariant: Distance increases      │    │ • Key Invariant: PriorityQueue always    │
│   monotonically layer-by-layer.          │    │   relaxes smallest tentative distance.   │
└──────────────────────────────────────────┘    └──────────────────────────────────────────┘
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
Prove by induction on path length why Breadth-First Search guarantees finding the shortest path between two vertices in an unweighted graph.

### Architectural Model Answer
1. **The Invariant of Queue Distance Monotonicity:**
   - Let $\delta(s, v)$ be the true shortest path distance from source $s$ to vertex $v$ (measured in number of edges).
   - In BFS, the queue maintains the invariant that if the queue contains vertices $\langle v_1, v_2, \dots, v_r \rangle$, then:
     $$\text{dist}[v_1] \le \text{dist}[v_2] \le \dots \le \text{dist}[v_r] \le \text{dist}[v_1] + 1$$
   - That is, vertices are enqueued and dequeued in monotonically non-decreasing order of their distance from source $s$, spanning at most two adjacent distance layers $\{d, d + 1\}$.

2. **Inductive Proof of Optimality:**
   - **Base Case:** For the source vertex $s$, $\text{dist}[s] = 0 = \delta(s, s)$. The distance is strictly optimal.
   - **Inductive Hypothesis:** Assume that for all vertices $u$ with true shortest distance $\delta(s, u) \le k$, BFS correctly assigns $\text{dist}[u] = \delta(s, u)$, and these vertices are processed before any vertex at distance $\ge k + 1$.
   - **Inductive Step:** Consider an arbitrary vertex $v$ whose true shortest distance is $\delta(s, v) = k + 1$.
     - By definition of distance in an unweighted graph, there exists at least one predecessor $u$ such that $(u, v) \in E$ and $\delta(s, u) = k$.
     - By the inductive hypothesis, $u$ is assigned $\text{dist}[u] = k$ and is dequeued during the processing of layer $k$.
     - When $u$ is dequeued, its outgoing edges are scanned, and $v$ is examined.
     - Vertex $v$ could not have been discovered before layer $k$, because any earlier discovery would imply a path of length $\le k$, contradicting that $\delta(s, v) = k + 1$.
     - Therefore, when $u$ inspects $v$, $v$ is either undiscovered (in which case it is assigned $\text{dist}[v] = \text{dist}[u] + 1 = k + 1 = \delta(s, v)$) or $v$ was already discovered by another valid predecessor also in layer $k$ (which likewise assigned it $k + 1$).
     - Once enqueued, $v$ is marked visited and its distance is permanently finalized.

3. **Conclusion:**
   - By mathematical induction, every reachable vertex $v$ is discovered at layer $\delta(s, v)$. Because BFS processes layers in non-decreasing order, the first time vertex $v$ is dequeued, its path length is guaranteed to be minimal.
