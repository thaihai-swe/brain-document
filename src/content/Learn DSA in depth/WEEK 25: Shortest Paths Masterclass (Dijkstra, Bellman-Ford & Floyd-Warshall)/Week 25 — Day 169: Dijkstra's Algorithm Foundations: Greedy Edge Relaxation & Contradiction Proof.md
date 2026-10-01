---
title: "Week 25 — Day 169: Dijkstra's Algorithm Foundations: Greedy Edge Relaxation & Contradiction Proof"
---

# Week 25 — Day 169: Dijkstra's Algorithm Foundations: Greedy Edge Relaxation & Contradiction Proof

Welcome to **Day 169 of your DSA Mastery Journey**!

Today officially launches **Week 25: Shortest Paths Masterclass (Dijkstra, Bellman-Ford & Floyd-Warshall)**. 

In Week 20, you mastered **Breadth-First Search (BFS)** to determine shortest paths on *unweighted* graphs. In BFS, edge traversal costs are uniform (each hop costs 1). However, in real-world systems—whether routing packets across intercontinental fiber lines, computing airline ticket costs, or navigating GPS road grids—edges possess non-uniform positive weights representing latency, monetary cost, or physical distance.

In 1956, Dutch computer scientist Edsger W. Dijkstra formulated one of the most celebrated algorithms in computing history: **Dijkstra's Algorithm**. 

Today, you will master:
1. **The Single-Source Shortest Path (SSSP) Mathematical Formulation:** The Triangle Inequality and edge relaxation mechanics.
2. **The Greedy Choice Property & Formal Contradiction Proof:** Rigorously proving why non-negative edge weights ($w \ge 0$) guarantee that finalized tentative distances are permanently optimal.
3. **The C# Lazy Stale Deletion Pattern:** Implementing optimal $O((V + E) \log V)$ priority queue traversal using `.NET 6+` `PriorityQueue<TElement, TPriority>` without custom intrusive Fibonacci or binary heaps.
4. **From-Scratch Production C# Container:** Building `DijkstraShortestPath` with path predecessor reconstruction and automated self-validating test harnesses.
5. **Canonical Problem Mastery:** Conquering **[LeetCode 743] Network Delay Time (Medium)**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   DAY 169: DIJKSTRA'S ALGORITHM & GREEDY RELAXATION PROOFS                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       THE GREEDY RELAXATION MODEL │                             │    THE CONTRADICTION PROOF        │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • SSSP: dist[s] = 0, dist[v] = ∞. │                             │ • Assume first error at node u.   │
│ • Relaxation:                     │ ── Non-Negative Invariant ─►│ • Optimal path must cross cut     │
│   dist[v] = min(dist[v],          │    (w(e) ≥ 0 guarantees     │   (Visited, Unvisited) at edge (x,y)│
│                 dist[u] + w(u,v)).│     no undercutting!)       │ • dist[y] ≥ dist[u] (greedy min!) │
│ • Extract-Min: Finalize smallest. │                             │ • Weight(path) ≥ dist[y] ≥ dist[u]│
└───────────────────────────────────┘                             │ • Contradiction: Path cannot be < │
                                                  │               └───────────────────────────────────┘
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         PRODUCTION C# & PROBLEM SET         │
                          ├─────────────────────────────────────────────┤
                          │ • Production DijkstraShortestPath Container │
                          │ • Lazy Stale Deletion in PriorityQueue<T, P>│
                          │ • Path reconstruction via predecessor array │
                          │ • [LC 743] Network Delay Time (Medium)      │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🗝️ The Visual Mental Model: The Concentric Oil Slick / Wavefront

In unweighted BFS, the search frontier expands in discrete concentric rings: hops 0, 1, 2, 3...
In Dijkstra's algorithm, visualize pouring a continuous fluid (like water or oil) at the source vertex $s$ at time $t = 0$. The fluid expands along each pipe $(u, v)$ at a constant speed of 1 unit per second.
- A pipe of length 5 takes 5 seconds to traverse.
- The next vertex reached by the expanding fluid is **guaranteed to be the closest unvisited vertex in the entire network**.
- Once the fluid reaches vertex $u$, **no other path can possibly arrive earlier** (assuming pipe lengths cannot be negative!).

```
                    DIJKSTRA'S ALGORITHM EXPANDING WAVEFRONT

          (w=2)                (w=3)
    [ A ] ─────► [ B ] ──────► [ D ]
      │            ▲             ▲
      │            │             │
(w=6) │      (w=1) │             │ (w=1)
      ▼            │             │
    [ C ] ─────────┴─────────────┘

    Source: Node A (Time = 0)

    Time t = 0: Fluid starts at A.
                dist[A] = 0.
    Time t = 2: Fluid reaches B via direct edge (A -> B).
                B is finalized! dist[B] = 2.
                Pipes from B open: B -> D takes 3s (arrives at t = 2 + 3 = 5).
    Time t = 5: Fluid reaches D via (A -> B -> D).
                dist[D] = 5.
    Time t = 6: Fluid reaches C via (A -> C).
                dist[C] = 6.
                Pipe from C -> B takes 1s (would arrive at t = 6 + 1 = 7).
                Too late! B was already reached at t = 2!
```

---

### 1.2 🖼️ Visual Mechanics: The Edge Relaxation Primitive

The fundamental building block of all shortest-path algorithms is **Edge Relaxation**.
Given directed edge $e = (u, v)$ with weight $w(u, v)$:
- We inspect whether routing through $u$ offers a shorter path to $v$ than our current best known estimate `dist[v]`.

$$\text{If } \text{dist}[u] + w(u, v) < \text{dist}[v] \implies \text{dist}[v] \leftarrow \text{dist}[u] + w(u, v)$$

```
                       THE EDGE RELAXATION PRIMITIVE

        Current state:
        dist[u] = 4
        dist[v] = 10
        Edge: (u -> v) with weight w = 3

        Can we improve dist[v]?
        Candidate distance = dist[u] + w = 4 + 3 = 7.
        Since 7 < 10, RELAX THE EDGE!

        AFTER RELAXATION:
        dist[v] = 7
        parent[v] = u   <=== Record predecessor for path reconstruction!
```

---

### 1.3 🧮 Mathematical Proof by Contradiction: Dijkstra's Correctness

#### Theorem:
> Let $G = (V, E, w)$ be a directed graph with strictly non-negative edge weights ($w(e) \ge 0$ for all $e \in E$). When Dijkstra's algorithm extracts a vertex $u$ from the priority queue to finalize it, the tentative distance $\text{dist}[u]$ is equal to the true shortest path distance $\delta(s, u)$.

#### Proof by Contradiction:
1. Let $S \subset V$ be the set of vertices that have already been finalized (extracted from the priority queue).
2. Suppose for contradiction that Dijkstra's algorithm does **not** always find the shortest path.
3. Let $u$ be the **very first vertex** extracted from the priority queue such that:
   $$\text{dist}[u] > \delta(s, u)$$
   (Notice that for the source vertex $s$, $\text{dist}[s] = 0 = \delta(s, s)$, so $u \ne s$, and $S$ contains at least $s$).
4. Because $s \in S$ and $u \notin S$, any true optimal shortest path $P$ from $s$ to $u$ starts inside $S$ and ends outside $S$.
5. Let $(x, y)$ be the **first edge along path $P$ that crosses the cut** from $S$ to $V \setminus S$, where $x \in S$ and $y \notin S$ (it is possible that $y = u$).

```
                         THE CUT SEPARATING S AND V \ S

             Finalized Set S                  Unvisited Set V \ S
        ┌───────────────────────────┐         ┌───────────────────────────┐
        │        [ Source s ]       │         │                           │
        │             │             │         │                           │
        │             ▼             │         │                           │
        │           [ x ] ──────────┼─────────┼──► [ y ]                  │
        └───────────────────────────┘ (Edge)  │      │                    │
                                              │      ▼                    │
                                              │    [ u ] (Extracted next) │
                                              └───────────────────────────┘
```

6. Analyze the vertices:
   - Since $x \in S$ was finalized *before* $u$, by our definition of $u$ as the *first* erroneous node, its distance was computed correctly: $\text{dist}[x] = \delta(s, x)$.
   - When $x$ was finalized, its outgoing edge $(x, y)$ was relaxed, setting:
     $$\text{dist}[y] \le \text{dist}[x] + w(x, y) = \delta(s, x) + w(x, y)$$
   - Because $(x, y)$ is an edge on the optimal subpath from $s$ to $y$:
     $$\delta(s, x) + w(x, y) = \delta(s, y) \implies \text{dist}[y] \le \delta(s, y)$$
   - Since $\text{dist}[y]$ cannot be strictly less than the theoretical shortest path $\delta(s, y)$, we have:
     $$\text{dist}[y] = \delta(s, y)$$
7. Now compare the distances of $y$ and $u$:
   - Path $P$ goes from $s \to y \to u$. Because all edge weights in the graph are **non-negative** ($w \ge 0$), the distance to $u$ along path $P$ must be at least the distance to $y$:
     $$\delta(s, y) \le \delta(s, u)$$
   - Therefore:
     $$\text{dist}[y] = \delta(s, y) \le \delta(s, u) < \text{dist}[u]$$
   - This means:
     $$\text{dist}[y] < \text{dist}[u]$$
8. **The Contradiction:**
   - Both $y$ and $u$ are unvisited vertices residing in the priority queue.
   - But Dijkstra's algorithm chose to extract $u$ instead of $y$!
   - By definition of the min-priority queue, the extracted node $u$ must have $\text{dist}[u] \le \text{dist}[y]$.
   - This directly contradicts $\text{dist}[y] < \text{dist}[u]$!

Therefore, no such erroneous node $u$ can exist. When $u$ is finalized, $\text{dist}[u] = \delta(s, u)$. $\blacksquare$

> [!CAUTION]
> **Why this proof collapses when negative edge weights exist:**
> In Step 7, the inequality $\delta(s, y) \le \delta(s, u)$ relies strictly on $w(e) \ge 0$. If an edge between $y$ and $u$ has a negative weight (e.g. $-10$), then $\delta(s, u)$ could be strictly less than $\delta(s, y)$, destroying the greedy invariant! (We explore this fully on Day 171 with Bellman-Ford).

---

### 1.4 5W1H Executive Architecture Blueprint: Dijkstra's Algorithm

| Dimension | Architectural Specification |
| :--- | :--- |
| **1. WHAT** | A greedy single-source shortest path algorithm that repeatedly finalizes the unvisited vertex with the minimum tentative distance on graphs with non-negative edge weights. |
| **2. WHY** | Unweighted BFS cannot account for varying link costs or latencies. Dijkstra finds the globally optimal path in $O((V + E) \log V)$ time instead of exponential path searches. |
| **3. WHEN** | GPS turn-by-turn navigation, OSPF internet routing, network packet delays, flight routing with layover times, whenever edge weights are strictly $\ge 0$. |
| **4. WHERE** | Array-backed structures: primitive flat `int[] dist` array, `int[] parent` predecessor array, and a Min-Heap (`PriorityQueue<int, int>` in C# .NET 6+). |
| **5. WHO** | *"For non-negative edge graphs, I use Dijkstra's algorithm. By greedily extracting the vertex with minimum tentative distance from a min-heap, each node is finalized in optimal order, achieving $O((V + E) \log V)$ time."* |
| **6. HOW** | Initialize `dist[src]=0`, all others $\infty \to$ push `(src, 0)` into heap $\to$ while heap non-empty: pop `(u, d)` $\to$ if `d > dist[u]` continue (stale) $\to$ relax all outgoing edges $(u, v, w) \to$ push improved neighbors. |

---

## 2. ⚙️ IMPLEMENT: Production-Grade Container

### The C# .NET 6+ PriorityQueue Dilemma & The Lazy Stale Deletion Pattern

In classic textbook implementations (CLRS), Dijkstra's algorithm uses a `DecreaseKey(v, newDist)` operation on a priority queue. However, BCL's `System.Collections.Generic.PriorityQueue<TElement, TPriority>` (introduced in .NET 6) **does not expose an $O(\log N)$ DecreaseKey method**.

Attempting to implement an indexed heap with custom dictionary lookup adds significant pointer-chasing and GC pressure. Instead, production systems use the **Lazy Stale Deletion Pattern**:
- Whenever an edge relaxation improves `dist[v]`, we simply enqueue a new tuple `(v, newDist)` into the priority queue!
- When popping `(u, d)` from the priority queue:
  ```csharp
  if (d > dist[u]) continue; // Stale duplicate entry: discard in O(1)!
  ```
- Because each edge is relaxed at most once per improvement, at most $E$ entries are ever enqueued. The heap size is at most $E$, and heap operations take $O(\log E) = O(\log V^2) = O(2 \log V) = O(\log V)$ time!
- **Zero custom heap code, zero memory churn, and optimal $O((V + E) \log V)$ complexity!**

---

### Standalone Production Implementation: `DijkstraShortestPath`

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedGraphAlgorithms.ShortestPaths
{
    /// <summary>
    /// Represents a directed edge with a non-negative weight.
    /// </summary>
    public readonly struct DirectedEdge
    {
        public readonly int To;
        public readonly int Weight;

        public DirectedEdge(int to, int weight)
        {
            if (weight < 0)
                throw new ArgumentOutOfRangeException(nameof(weight), "Dijkstra requires non-negative weights.");
            To = to;
            Weight = weight;
        }
    }

    /// <summary>
    /// Encapsulates the complete result of a Dijkstra SSSP computation.
    /// </summary>
    public sealed class DijkstraResult
    {
        public int Source { get; }
        public int[] Distances { get; }
        public int[] Predecessors { get; }

        public DijkstraResult(int source, int[] distances, int[] predecessors)
        {
            Source = source;
            Distances = distances;
            Predecessors = predecessors;
        }

        /// <summary>
        /// Reconstructs the shortest path from source to target vertex.
        /// </summary>
        /// <param name="target">Target vertex.</param>
        /// <returns>List of vertices along the path, or empty list if unreachable.</returns>
        public List<int> ReconstructPath(int target)
        {
            if (Distances[target] == int.MaxValue)
                return new List<int>(); // Unreachable

            var path = new List<int>();
            for (int curr = target; curr != -1; curr = Predecessors[curr])
            {
                path.Add(curr);
            }
            path.Reverse();
            return path;
        }
    }

    /// <summary>
    /// Production-grade implementation of Dijkstra's Single-Source Shortest Path algorithm
    /// utilizing .NET PriorityQueue with the Lazy Stale Deletion Pattern.
    /// Time Complexity: O((V + E) log V).
    /// Space Complexity: O(V + E).
    /// </summary>
    public sealed class DijkstraShortestPath
    {
        /// <summary>
        /// Computes shortest paths from source vertex to all reachable vertices.
        /// </summary>
        /// <param name="v">Total number of vertices [0 .. v-1].</param>
        /// <param name="adj">Adjacency list of directed weighted edges.</param>
        /// <param name="source">Starting source vertex.</param>
        public static DijkstraResult Compute(int v, List<DirectedEdge>[] adj, int source)
        {
            if (v <= 0) throw new ArgumentOutOfRangeException(nameof(v));
            if (source < 0 || source >= v) throw new ArgumentOutOfRangeException(nameof(source));

            var dist = new int[v];
            var parent = new int[v];
            Array.Fill(dist, int.MaxValue);
            Array.Fill(parent, -1);

            // Min-Heap ordered by priority (tentative distance)
            var pq = new PriorityQueue<int, int>();

            // Initialize source
            dist[source] = 0;
            pq.Enqueue(source, 0);

            while (pq.Count > 0)
            {
                pq.TryDequeue(out int u, out int d);

                // -------------------------------------------------------------
                // LAZY STALE DELETION PATTERN:
                // If the popped distance d is greater than dist[u], this entry
                // was superseded by a subsequent, shorter path. Discard in O(1)!
                // -------------------------------------------------------------
                if (d > dist[u])
                    continue;

                // Relax all outgoing edges from u
                foreach (var edge in adj[u])
                {
                    int next = edge.To;
                    int weight = edge.Weight;

                    // Prevent integer overflow when adding to int.MaxValue
                    if (dist[u] != int.MaxValue && dist[u] + weight < dist[next])
                    {
                        dist[next] = dist[u] + weight;
                        parent[next] = u;
                        pq.Enqueue(next, dist[next]);
                    }
                }
            }

            return new DijkstraResult(source, dist, parent);
        }

        // ====================================================================
        // SELF-VALIDATING TEST SUITE
        // ====================================================================
        public static void Main()
        {
            Console.WriteLine("==================================================");
            Console.WriteLine("RUNNING TEST SUITE: DijkstraShortestPath (C#)");
            Console.WriteLine("==================================================");

            // Graph Topology: 5 vertices (0 to 4)
            // 0 -> 1 (w=4), 0 -> 2 (w=2)
            // 2 -> 1 (w=1), 2 -> 3 (w=5)
            // 1 -> 3 (w=1), 3 -> 4 (w=3)
            int v = 5;
            var adj = new List<DirectedEdge>[v];
            for (int i = 0; i < v; i++) adj[i] = new List<DirectedEdge>();

            void AddEdge(int from, int to, int weight) => adj[from].Add(new DirectedEdge(to, weight));

            AddEdge(0, 1, 4);
            AddEdge(0, 2, 2);
            AddEdge(2, 1, 1);
            AddEdge(2, 3, 5);
            AddEdge(1, 3, 1);
            AddEdge(3, 4, 3);

            var result = Compute(v, adj, 0);

            // Assertions
            Debug.Assert(result.Distances[0] == 0, "Distance to source must be 0.");
            Debug.Assert(result.Distances[2] == 2, "Distance to 2 must be 2.");
            Debug.Assert(result.Distances[1] == 3, "Distance to 1 must be 0 -> 2 -> 1 (cost 3), beating direct edge 4!");
            Debug.Assert(result.Distances[3] == 4, "Distance to 3 must be 0 -> 2 -> 1 -> 3 (cost 4).");
            Debug.Assert(result.Distances[4] == 7, "Distance to 4 must be 4 + 3 = 7.");

            // Path Reconstruction Verification
            var path4 = result.ReconstructPath(4);
            var expectedPath = new List<int> { 0, 2, 1, 3, 4 };
            Debug.Assert(path4.Count == expectedPath.Count, "Path length mismatch.");
            for (int i = 0; i < path4.Count; i++)
            {
                Debug.Assert(path4[i] == expectedPath[i], $"Path node {i} mismatch: got {path4[i]}, expected {expectedPath[i]}");
            }

            Console.WriteLine("✅ All DijkstraShortestPath assertions passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Operational Deep-Dive (5 Dimensions)

### Dimension 1: Mathematical Contract & Asymptotic Proofs

| Implementation Architecture | Min-Element Extraction | Edge Relaxation | Total Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Dijkstra with Flat Array** | $V \times O(V)$ | $E \times O(1)$ | $\mathbf{O(V^2)}$ | $\mathbf{O(V)}$ (Optimal for dense graphs) |
| **Dijkstra with Binary Min-Heap (Lazy)** | $V \times O(\log E)$ | $E \times O(\log E)$ | $\mathbf{O((V + E) \log V)}$ | $\mathbf{O(V + E)}$ (Optimal for sparse graphs) |
| **Dijkstra with Fibonacci Heap** | $V \times O(\log V)$ | $E \times O(1)$ amortized | $\mathbf{O(E + V \log V)}$ | $O(V + E)$ (Theoretical only) |

#### Why $O(\log E) = O(\log V)$:
Since $E \le V^2$, we have:
$$\log E \le \log(V^2) = 2 \log V = O(\log V)$$
Therefore, enqueuing up to $E$ elements into the heap adds only a factor of $2$ to the logarithmic depth, maintaining identical asymptotic complexity!

---

### Dimension 2: Step-by-Step Execution Trace

Trace on graph: $0 \to 1 (w=4), 0 \to 2 (w=2), 2 \to 1 (w=1), 1 \to 3 (w=1)$. Source = $0$.

| Step | Heap Dequeue `(u, d)` | Stale? | `dist[]` Array State | Outgoing Edges Relaxed | Enqueued to Heap |
| :---: | :---: | :---: | :--- | :--- | :--- |
| 0 | *Init* | — | `[0, ∞, ∞, ∞]` | — | `(0, 0)` |
| 1 | `(0, 0)` | No | `[0, ∞, ∞, ∞]` | $0 \to 1 (4), 0 \to 2 (2)$ | `(1, 4), (2, 2)` |
| 2 | `(2, 2)` | No | `[0, 4, 2, ∞]` | $2 \to 1 (2 + 1 = 3)$ | `(1, 3)` |
| 3 | `(1, 3)` | No | `[0, 3, 2, ∞]` | $1 \to 3 (3 + 1 = 4)$ | `(3, 4)` |
| 4 | `(1, 4)` | **YES! ($4 > 3$)** | `[0, 3, 2, 4]` | *Skipped in $O(1)$!* | — |
| 5 | `(3, 4)` | No | `[0, 3, 2, 4]` | None | — |

---

### Dimension 3: Visual ASCII State Transitions

```
               DIJKSTRA'S LAZY STALE DELETION IN THE MIN-HEAP

    1. Node 0 relaxes edge to Node 1 with weight 4:
       Heap: [ (Node 1, dist=4) ]
       dist[1] = 4

    2. Node 2 relaxes edge to Node 1 with weight 1 (path cost 2 + 1 = 3):
       New path is shorter (3 < 4)!
       dist[1] = 3
       Heap: [ (Node 1, dist=3), (Node 1, dist=4) ]  <=== Duplicate enqueued!

    3. Later, the heap pops (Node 1, dist=3):
       Finalizes Node 1 with dist = 3.

    4. Still later, the heap pops (Node 1, dist=4):
       Check: if (d > dist[1]) => 4 > 3 is TRUE!
       ACTION: Discard immediately! Zero redundant neighbor exploration!
```

---

### Dimension 4: Invariant Preservation Proofs

1. **Upper-Bound Distance Invariant:**
   At all times, $\text{dist}[v] \ge \delta(s, v)$ for all $v \in V$.
   - *Proof:* Initially, $\text{dist}[s] = 0 = \delta(s, s)$ and all other distances are $\infty \ge \delta(s, v)$. Edge relaxations update $\text{dist}[v] \leftarrow \text{dist}[u] + w(u, v)$. By induction, if $\text{dist}[u]$ is an upper bound on path length to $u$, then $\text{dist}[u] + w(u, v)$ is the weight of a valid concrete walk to $v$. Therefore, $\text{dist}[v]$ cannot be strictly less than the infimum of all path lengths $\delta(s, v)$.
2. **Convergence Invariant:**
   Once vertex $u$ is popped from the priority queue and validated non-stale, $\text{dist}[u]$ never decreases again.
   - *Proof:* Proved by contradiction in Section 1.3.

---

### Dimension 5: Edge Case Analysis & Defense Matrix

| Edge Case Scenario | Potential Failure Mode | Built-in Defense Mechanism |
| :--- | :--- | :--- |
| **Disconnected Components** | Unreachable vertices remain $\infty$; potential integer overflow during relaxation. | Guard `if (dist[u] != int.MaxValue && ...)` prevents overflow wrapping into negative numbers. |
| **Negative Edge Weights** | Infinite loop or incorrect distances. | Constructor validation: throws `ArgumentOutOfRangeException` if $w < 0$. (Use Bellman-Ford on Day 171). |
| **Zero-Weight Cycles ($w = 0$)** | Redundant cycles with zero cost. | Guard `dist[u] + 0 < dist[v]` is false if already equal; does not re-enqueue. |
| **Multiple Self-Loops $(u, u)$** | Self-loop causing re-enqueue. | `dist[u] + w < dist[u]` is strictly false for $w \ge 0$; self-loops are automatically ignored. |

---

## 4. 🎬 DEMONSTRATE: Canonical LeetCode Walkthroughs

### 4.1 [LeetCode 743] Network Delay Time (Medium)

#### Problem Formulation
You are given a network of $n$ nodes, labeled from $1$ to $n$. You are also given `times`, a list of travel times as directed edges `times[i] = [ui, vi, wi]`, where $ui$ is the source node, $vi$ is the target node, and $wi$ is the time it takes for a signal to travel from source to target.

We will send a signal from a given node $k$. Return the **minimum time** it takes for all the $n$ nodes to receive the signal. If it is impossible for all the $n$ nodes to receive the signal, return `-1`.

#### Algorithmic Formulation via Dijkstra SSSP
1. The signal propagates outward along all edges simultaneously.
2. The arrival time of the signal at node $u$ is precisely the **shortest path distance** $\delta(k, u)$ from source $k$ to $u$.
3. All $n$ nodes receive the signal when the *slowest* (farthest) node receives it:
   $$\text{Total Time} = \max_{1 \le i \le n} \text{dist}[i]$$
4. If any node has $\text{dist}[i] = \infty$, the graph is not fully reachable from $k$; return `-1`.

#### Complete C# Annotated Solution
```csharp
using System;
using System.Collections.Generic;

public sealed class NetworkDelayTimeSolution
{
    public int NetworkDelayTime(int[][] times, int n, int k)
    {
        // 1. Build adjacency list (1-indexed nodes [1 .. n])
        var adj = new List<(int To, int Weight)>[n + 1];
        for (int i = 1; i <= n; i++)
            adj[i] = new List<(int, int)>();

        foreach (var edge in times)
        {
            int u = edge[0];
            int v = edge[1];
            int w = edge[2];
            adj[u].Add((v, w));
        }

        // 2. Initialize distance array
        var dist = new int[n + 1];
        Array.Fill(dist, int.MaxValue);

        var pq = new PriorityQueue<int, int>();

        // 3. Seed source node k
        dist[k] = 0;
        pq.Enqueue(k, 0);

        // 4. Dijkstra SSSP Traversal
        while (pq.Count > 0)
        {
            pq.TryDequeue(out int u, out int d);

            // Lazy deletion check: skip stale entries
            if (d > dist[u])
                continue;

            foreach (var (next, weight) in adj[u])
            {
                if (dist[u] + weight < dist[next])
                {
                    dist[next] = dist[u] + weight;
                    pq.Enqueue(next, dist[next]);
                }
            }
        }

        // 5. Compute max time to reach all nodes
        int maxDelay = 0;
        for (int i = 1; i <= n; i++)
        {
            if (dist[i] == int.MaxValue)
            {
                return -1; // Node i is unreachable from source k!
            }
            maxDelay = Math.Max(maxDelay, dist[i]);
        }

        return maxDelay;
    }
}
```

#### Complexity Analysis
- **Time Complexity:** $O((V + E) \log V)$ where $V = n$ and $E = \text{times.Length}$.
  - Initializing adjacency list and distance array: $O(V + E)$.
  - Priority queue operations: At most $E$ edges relaxed, each enqueue costs $O(\log V)$.
  - Total time: $O(E \log V)$. When $n = 100$ and $E = 6000$, total operations $\approx 6000 \times 7 \approx 42,000$, executing in under $2$ ms!
- **Space Complexity:** $O(V + E)$ for the adjacency list and priority queue state.

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Path with Maximum Probability ([LeetCode 1514] - Medium)
- **Constraint:** Undirected graph with edge probabilities $0 \le P \le 1$. Find path maximizing product of probabilities from start to end.
- **Dijkstra Max-Heap Transformation:**
  - Standard Dijkstra minimizes sum: $\min \sum w_i$.
  - Here we maximize product: $\max \prod P_i$.
  - Because $0 \le P_i \le 1$, multiplying by $P_i$ *decreases* or maintains probability (monotonic decay, identical to non-negative costs increasing!).
  - In C#: Use `PriorityQueue<int, double>` with max-heap priority (or negate priority).

### Exercise 2: Reachable Nodes In Subdivided Graph ([LeetCode 882] - Hard)
- **Constraint:** Undirected graph where each edge contains $cnt$ new subdivision nodes. Find total nodes reachable in $\le \text{maxMoves}$.
- **Architecture Hint:** Run Dijkstra from source 0. If $\text{dist}[u] \le \text{maxMoves}$, node $u$ is reachable. Then for each edge $(u, v)$, compute how many intermediate subdivision nodes are consumed from both ends without double-counting!

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
                     SHORTEST PATH ALGORITHM DECISION TREE

                         Are all edge weights identical (all 1)?
                                    /       \
                                  YES        NO
                                  /           \
                           [Standard BFS]   Do negative edge weights exist?
                            O(V + E) time           /        \
                                                  YES         NO
                                                  /            \
                                          [Bellman-Ford]   [Dijkstra's Algorithm]
                                           O(V * E) time    O((V + E) log V) time
                                          (Preview: Day 171) (Mastered Today!)
```

---

## 7. 🎯 Daily Checkpoint Questions

### Diagnostic Question
Prove by contradiction that Dijkstra's algorithm always finds the shortest path on graphs with non-negative edge weights.

### Architectural Model Answer
1. **Contradiction Hypothesis:**
   Assume there exists an execution on a non-negative weighted graph $G = (V, E, w)$ where Dijkstra's algorithm fails. Let $u$ be the *very first* vertex extracted from the min-priority queue for which the tentative distance is strictly greater than the true shortest path distance:
   $$\text{dist}[u] > \delta(s, u)$$
2. **Cut Property & First Crossing Edge:**
   Let $S$ be the set of vertices finalized prior to $u$. By assumption, for all $v \in S$, $\text{dist}[v] = \delta(s, v)$. Any true optimal shortest path $P$ from source $s$ to $u$ begins in $S$ and ends outside $S$. Let $(x, y)$ be the first edge on $P$ that crosses from $S$ to $V \setminus S$, where $x \in S$ and $y \notin S$.
3. **Optimality of Subpath:**
   When $x$ was finalized, its outgoing edge $(x, y)$ was relaxed:
   $$\text{dist}[y] \le \text{dist}[x] + w(x, y) = \delta(s, x) + w(x, y) = \delta(s, y)$$
   Since tentative distances cannot undercut the true shortest distance, $\text{dist}[y] = \delta(s, y)$.
4. **Monotonicity via Non-Negative Weights ($w \ge 0$):**
   Because edge weights are non-negative, any extension of path $P$ from $y$ to $u$ can only add non-negative cost:
   $$\delta(s, y) \le \delta(s, u)$$
   Substituting gives:
   $$\text{dist}[y] = \delta(s, y) \le \delta(s, u) < \text{dist}[u] \implies \text{dist}[y] < \text{dist}[u]$$
5. **The Contradiction:**
   Both $y$ and $u$ were present in the min-priority queue. But Dijkstra extracts the unvisited vertex with the minimum tentative distance. Thus the algorithm must have chosen $y$ before $u$, contradicting that $u$ was extracted next.
   Therefore, no such erroneous node $u$ can exist, and $\text{dist}[u] = \delta(s, u)$ for all finalized nodes.
