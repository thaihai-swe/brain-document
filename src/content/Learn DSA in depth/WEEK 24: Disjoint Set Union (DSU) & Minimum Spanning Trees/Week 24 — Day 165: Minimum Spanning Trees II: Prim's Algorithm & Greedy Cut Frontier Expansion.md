---
title: "Week 24 — Day 165: Minimum Spanning Trees II: Prim's Algorithm & Greedy Cut Frontier Expansion"
---

# Week 24 — Day 165: Minimum Spanning Trees II: Prim's Algorithm & Greedy Cut Frontier Expansion

Welcome to **Day 165 of your DSA Mastery Journey**!

Yesterday, you mastered **Kruskal's Algorithm**, an edge-centric greedy algorithm that maintains an evolving forest of trees, connecting them using Disjoint Set Union. Kruskal's algorithm is optimal for **sparse graphs** where $|E| \ll V^2$.

However, what happens when a graph is **dense** ($|E| \approx V^2$)? For example, in a complete Euclidean graph of $V = 10,000$ points, there are $\approx 50,000,000$ edges. Sorting 50 million edges in Kruskal's algorithm consumes immense memory and computation.

Today, we introduce **Prim's Algorithm**, a vertex-centric greedy algorithm. Rather than maintaining an evolving forest, Prim grows a **single connected tree** from an arbitrary starting seed vertex, continuously expanding its frontier across the cut $(T, V \setminus T)$ using a min-priority queue.

Today, you will master:
1. **The Cut Frontier Dynamic:** How Prim operationalizes the Cut Property at every vertex expansion.
2. **Dense vs. Sparse Density Trade-offs:** When Prim's $O(V^2)$ flat matrix variant crushes both Kruskal and heap-based Prim.
3. **The Virtual Super-Source Pattern:** Converting vertex installation costs (e.g. digging water wells or building power plants) into weighted edges incident to a virtual node.
4. **From-Scratch C# Engine:** Building `PrimMstSolver` with `.NET 6+` `PriorityQueue<TElement, TPriority>`.
5. **Canonical Problem Mastery:** Conquering **[LeetCode 1135] Connecting Cities With Minimum Cost** and **[LeetCode 1168] Optimize Water Distribution in a Village**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│              DAY 165: PRIM'S ALGORITHM, CUT FRONTIERS & VIRTUAL SUPER-SOURCES                    │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       VERTEX-CENTRIC TREE GROWTH  │                             │    THE VIRTUAL SUPER-SOURCE       │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Seed Tree: T = {root}.          │                             │ • Vertex cost: wells[i].          │
│ • Cut: (T, V \ T).                │ ── Cut Frontier Expansion ─►│ • Edge cost: pipes[i][j].         │
│ • Min-Heap selects lightest edge  │                             │ • Trick: Add Virtual Node 0!      │
│   crossing from T to V \ T.       │                             │ • Edge (0 -> i) with weight w[i]. │
│ • Node u joins T; its incident    │                             │ • Standard MST on V + 1 nodes     │
│   edges populate the priority queue│                            │   finds optimal global trade-off! │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         PRODUCTION C# & PROBLEM SET         │
                          ├─────────────────────────────────────────────┤
                          │ • Production PrimMstSolver Container        │
                          │ • [LC 1135] Connecting Cities Min Cost      │
                          │ • [LC 1168] Optimize Water Distribution     │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🗝️ The Visual Mental Model: Kruskal vs. Prim Structural Topology

Notice the fundamental topological difference between how Kruskal and Prim grow an MST:

```
                    KRUSKAL'S VS. PRIM'S STRUCTURAL EVOLUTION

   KRUSKAL'S ALGORITHM (Edge-Centric Forest):
   Step 1: (A - B)              (C - D)              (E - F)     [Isolated pairs]
   Step 2: (A - B - C - D)                           (E - F)     [Merging subtrees]
   Step 3: (A - B - C - D - E - F)                               [Final unified tree]
   • An evolving forest merges into a single tree at the very last step.

   PRIM'S ALGORITHM (Vertex-Centric Growing Tree):
   Step 1: [ A ]                                                 [Single seed node]
   Step 2: [ A - B ]                                             [Grows frontier]
   Step 3: [ A - B - C ]                                         [Tree absorbs C]
   Step 4: [ A - B - C - D - E - F ]                             [Tree absorbs all]
   • Always exactly ONE connected tree, expanding outward like a growing crystal!
```

---

### 1.2 🖼️ Visual Mechanics: The Cut Frontier Expansion

At any iteration in Prim's algorithm:
- Let $T$ be the set of vertices already included in the MST.
- The remaining vertices are $V \setminus T$.
- The cut is $(T, V \setminus T)$.
- The **Cut Property** guarantees that the edge with the absolute minimum weight that connects any node in $T$ to any node in $V \setminus T$ **must belong to the MST**.

```
                           PRIM'S CUT FRONTIER AT STEP k

                Tree Nodes (T)                     Unvisited Nodes (V \ T)
          ┌───────────────────────────┐         ┌───────────────────────────┐
          │         [ Root ]          │         │           ( D )           │
          │          /    \           │         │            /              │
          │        (2)    (3)         │         │           (6)             │
          │        /        \         │         │           /               │
          │     [ A ] ---- [ B ]      │         │         ( E )             │
          └───────┬──────────┬────────┘         └───────────┬───────────────┘
                  │          │                              │
         w=8 (A->D)   w=4 (B->D)                         w=5 (B->E)
                  │          │                              │
                  └──────────┴──────────────┬───────────────┘
                                            │
                                            ▼
                               [ CUT FRONTIER MIN-HEAP ]
                               • (B -> D, w = 4)  <=== LIGHTEST! EXTRACT!
                               • (B -> E, w = 5)
                               • (A -> D, w = 8)

   ACTION:
   1. Extract lightest edge (B -> D, w = 4).
   2. Add vertex D into T.
   3. Push all edges incident to D connecting to V \ T into Min-Heap!
```

---

### 1.3 ⚖️ Algorithmic Comparison: Kruskal vs. Prim Heap vs. Prim Dense

| Metric | Kruskal's MST | Prim's (Min-Heap) | Prim's (Dense Flat Array) |
| :--- | :--- | :--- | :--- |
| **Strategy** | Edge-centric (Forest) | Vertex-centric (Growing tree) | Vertex-centric (Growing tree) |
| **Time Complexity** | $\mathbf{\Theta(E \log E)}$ | $\mathbf{\Theta((V + E) \log V)}$ | $\mathbf{\Theta(V^2)}$ |
| **Space Complexity** | $\Theta(V + E)$ | $\Theta(V + E)$ | $\mathbf{\Theta(V)}$ (Zero edge storage!) |
| **Graph Density Sweet Spot** | **Sparse graphs** ($E \ll V^2$) | Medium graphs | **Dense complete graphs** ($E \approx V^2$) |
| **Core Data Structures** | `Array.Sort` + `DSU` | `PriorityQueue<TElement, TPriority>` | Primitive `int[] minDist`, `bool[] inMST` |

> [!IMPORTANT]
> **When does Prim Dense $O(V^2)$ beat Kruskal and Prim Heap?**
> When the graph is a complete graph ($E = \frac{V(V-1)}{2} \approx V^2$):
> - Kruskal sorts $V^2$ edges: $O(V^2 \log V)$ time and $O(V^2)$ memory to materialize edges.
> - Prim Heap pushes $V^2$ edges: $O(V^2 \log V)$ time.
> - **Prim Dense with Flat Array:** Requires **$O(V^2)$ time and only $O(V)$ memory!** We calculate distances on-the-fly without ever allocating an edge list!

---

### 1.4 🚰 The Virtual Super-Source Modeling Technique

In many real-world systems problems, you are given both **vertex creation costs** and **edge connection costs**:
- E.g. [LeetCode 1168]: You can build a water well at village $i$ for cost $wells[i]$, or connect pipe between $i$ and $j$ for cost $pipes[i][j]$.
- If you build zero wells, nobody has water. If you build $N$ wells, you don't need any pipes. What is the optimal combination?

```
                    THE VIRTUAL SUPER-SOURCE (NODE 0) PATTERN

    Original Problem: Digging wells at vertices vs. Laying pipes between vertices
         (Well: $5)                  (Well: $2)                  (Well: $9)
           [ City 1 ] ------------- (Pipe: $3) ------------- [ City 2 ]

    TRANSFORMATION TO PURE GRAPH MST:
    1. Introduce a fictitious "Virtual Reservoir / Ground Water" node: [ Node 0 ]
    2. A well at City i is simply a pipe from Node 0 to City i with weight wells[i]!

                                   [ Node 0 ]
                                 /     │     \
                     wells[1]=$5/ wells|=$2   \wells[3]=$9
                               /      [2]      \
                              ▼        │        ▼
                          [ City 1 ] --┴--- [ City 3 ]
                                    pipes[1,3]=$3

    Now, any standard MST algorithm (Prim or Kruskal) running on {0, 1, 2, ..., N}
    will automatically select the optimal combination of wells and pipes!
```

---

### 1.5 5W1H Executive Architecture Blueprint: Prim's Algorithm

| Dimension | Architectural Specification |
| :--- | :--- |
| **1. WHAT** | A vertex-centric greedy algorithm that grows an MST starting from a seed vertex by repeatedly picking the cheapest edge crossing the current tree cut. |
| **2. WHY** | Avoids sorting all edges upfront; achieves $O(V^2)$ time with $O(V)$ auxiliary space on dense graphs where edge materialization is prohibitive. |
| **3. WHEN** | Dense graphs ($E \approx V^2$), complete coordinate networks, streaming graph inputs where vertices are expanded outward from an initial anchor. |
| **4. WHERE** | C# `.NET 6+` `PriorityQueue<int, int>` (min-heap) paired with boolean array `bool[] inMST` and tentative cost buffer `int[] minCost`. |
| **5. WHO** | *"For dense networks, I utilize Prim's algorithm. By growing a single tree frontier and greedily incorporating the lightest cut-crossing edge, we achieve minimum spanning tree optimality without $O(E \log E)$ edge sorting."* |
| **6. HOW** | Seed `inMST[0] = true` $\to$ enqueue neighbors $\to$ dequeue min edge $(u, v, w)$ $\to$ if `inMST[v]` continue (stale) $\to$ mark `inMST[v] = true`, accumulate cost, enqueue $v$'s unvisited neighbors. |

---

## 2. ⚙️ IMPLEMENT: Production-Grade Container

Here is the production-grade, standalone compilable C# implementation of `PrimMstSolver` implementing both **Heap-based Prim** ($O((V + E) \log V)$) and **Dense Matrix Prim** ($O(V^2)$ with $O(V)$ space).

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedGraphAlgorithms.SpanningTrees
{
    /// <summary>
    /// Production-grade implementation of Prim's Minimum Spanning Tree Algorithm
    /// supporting both Min-Heap (sparse/medium graphs) and Flat Array (dense graphs).
    /// </summary>
    public sealed class PrimMstSolver
    {
        public readonly struct AdjacencyEdge
        {
            public readonly int To;
            public readonly int Weight;

            public AdjacencyEdge(int to, int weight)
            {
                To = to;
                Weight = weight;
            }
        }

        /// <summary>
        /// Computes MST total weight using Prim's Algorithm with a Min-Heap.
        /// Optimal for sparse and medium-density graphs.
        /// Time Complexity: O((V + E) log V).
        /// Space Complexity: O(V + E).
        /// </summary>
        /// <param name="v">Number of vertices [0 .. v-1].</param>
        /// <param name="adj">Adjacency list representation of the graph.</param>
        /// <returns>Tuple of (bool isPossible, long totalCost).</returns>
        public static (bool IsPossible, long TotalCost) ComputeMstHeap(int v, List<AdjacencyEdge>[] adj)
        {
            if (v <= 0) throw new ArgumentOutOfRangeException(nameof(v));
            if (v == 1) return (true, 0);

            var inMst = new bool[v];
            // PriorityQueue<TElement, TPriority> orders ascending by TPriority (Min-Heap)
            var pq = new PriorityQueue<int, int>();

            // Seed Prim from vertex 0 with cost 0
            pq.Enqueue(0, 0);

            long totalCost = 0;
            int verticesInMst = 0;

            // Track min weight seen for each node to prune duplicate heap entries
            var minWeight = new int[v];
            Array.Fill(minWeight, int.MaxValue);
            minWeight[0] = 0;

            while (pq.Count > 0 && verticesInMst < v)
            {
                pq.TryDequeue(out int u, out int weight);

                // Lazy deletion check: if u is already absorbed into MST, skip
                if (inMst[u]) continue;

                // Absorb vertex u into tree T
                inMst[u] = true;
                totalCost += weight;
                verticesInMst++;

                // Expand cut frontier: inspect all incident edges from u to V \ T
                foreach (var edge in adj[u])
                {
                    int neighbor = edge.To;
                    int edgeCost = edge.Weight;

                    if (!inMst[neighbor] && edgeCost < minWeight[neighbor])
                    {
                        minWeight[neighbor] = edgeCost;
                        pq.Enqueue(neighbor, edgeCost);
                    }
                }
            }

            bool connected = (verticesInMst == v);
            return (connected, connected ? totalCost : 0);
        }

        /// <summary>
        /// Computes MST total weight on a complete dense graph using Prim's with flat arrays.
        /// Completely avoids edge allocation and priority queue overhead!
        /// Time Complexity: O(V^2).
        /// Space Complexity: O(V) auxiliary memory.
        /// </summary>
        /// <param name="v">Number of vertices.</param>
        /// <param name="getWeight">Function delegate to compute weight between (i, j) on the fly.</param>
        public static (bool IsPossible, long TotalCost) ComputeMstDense(int v, Func<int, int, int> getWeight)
        {
            if (v <= 0) throw new ArgumentOutOfRangeException(nameof(v));
            if (v == 1) return (true, 0);

            var inMst = new bool[v];
            var minCost = new int[v];
            Array.Fill(minCost, int.MaxValue);

            // Start at vertex 0
            minCost[0] = 0;
            long totalCost = 0;

            for (int step = 0; step < v; step++)
            {
                // Step 1: Find unvisited vertex with minimum cost across the cut: O(V)
                int u = -1;
                int minVal = int.MaxValue;

                for (int i = 0; i < v; i++)
                {
                    if (!inMst[i] && minCost[i] < minVal)
                    {
                        minVal = minCost[i];
                        u = i;
                    }
                }

                if (u == -1)
                {
                    // Disconnected graph: no edge crosses the cut
                    return (false, 0);
                }

                // Step 2: Absorb u into MST
                inMst[u] = true;
                totalCost += minVal;

                // Step 3: Relax cut distances to all remaining unvisited vertices: O(V)
                for (int next = 0; next < v; next++)
                {
                    if (!inMst[next])
                    {
                        int weight = getWeight(u, next);
                        if (weight < minCost[next])
                        {
                            minCost[next] = weight;
                        }
                    }
                }
            }

            return (true, totalCost);
        }

        // ====================================================================
        // SELF-VALIDATING TEST SUITE
        // ====================================================================
        public static void Main()
        {
            Console.WriteLine("==================================================");
            Console.WriteLine("RUNNING TEST SUITE: PrimMstSolver (Heap & Dense)");
            Console.WriteLine("==================================================");

            // Test 1: Triangular graph with 3 vertices
            // 0 - 1 (1), 1 - 2 (2), 0 - 2 (3) -> MST cost = 1 + 2 = 3
            int v = 3;
            var adj = new List<AdjacencyEdge>[v];
            for (int i = 0; i < v; i++) adj[i] = new List<AdjacencyEdge>();

            void AddEdge(int u, int to, int w)
            {
                adj[u].Add(new AdjacencyEdge(to, w));
                adj[to].Add(new AdjacencyEdge(u, w));
            }

            AddEdge(0, 1, 1);
            AddEdge(1, 2, 2);
            AddEdge(0, 2, 3);

            var (heapOk, heapCost) = ComputeMstHeap(v, adj);
            Debug.Assert(heapOk == true && heapCost == 3, $"Heap Prim failed: {heapCost}");

            int[,] matrix = {
                { 0, 1, 3 },
                { 1, 0, 2 },
                { 3, 2, 0 }
            };
            var (denseOk, denseCost) = ComputeMstDense(v, (i, j) => matrix[i, j]);
            Debug.Assert(denseOk == true && denseCost == 3, $"Dense Prim failed: {denseCost}");

            Console.WriteLine("✅ All PrimMstSolver assertions passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Operational Deep-Dive (5 Dimensions)

### Dimension 1: Mathematical Contract & Asymptotic Proofs

| Implementation | Min-Key Extraction | Edge Relaxation | Total Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Prim with Min-Heap** | $V \times O(\log V)$ | $E \times O(\log V)$ | $\mathbf{O((V + E) \log V)}$ | $O(V + E)$ |
| **Prim with Dense Matrix** | $V \times O(V)$ | $V \times O(V)$ | $\mathbf{O(V^2)}$ | $\mathbf{O(V)}$ |
| **Prim with Fibonacci Heap** | $V \times O(\log V)$ | $E \times O(1)$ (amortized) | $\mathbf{O(E + V \log V)}$ | $O(V + E)$ |

> [!NOTE]
> While Fibonacci Heaps achieve $O(E + V \log V)$ asymptotically, their huge constant factor overhead makes them slower in practice than binary min-heaps for all practical graph sizes ($V \le 10^6$).

---

### Dimension 2: Step-by-Step Execution Trace

Graph: 4 nodes. Edges: $(0-1: 1), (1-2: 2), (0-2: 3), (2-3: 4)$.

| Step | Current Tree $T$ | Min-Heap Dequeue | In MST? | Edge Added | Cost Added | Cut Frontier Enqueued |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | $\{0\}$ | $(0, w=0)$ | No $\to$ Yes | — | 0 | $(1, w=1), (2, w=3)$ |
| 2 | $\{0, 1\}$ | $(1, w=1)$ | No $\to$ Yes | $0 - 1$ | 1 | $(2, w=2)$ |
| 3 | $\{0, 1, 2\}$ | $(2, w=2)$ | No $\to$ Yes | $1 - 2$ | 2 | $(3, w=4)$ |
| 4 | $\{0, 1, 2\}$ | $(2, w=3)$ | Yes (Stale!) | — | 0 | (Skipped!) |
| 5 | $\{0, 1, 2, 3\}$| $(3, w=4)$ | No $\to$ Yes | $2 - 3$ | 4 | Finished ($V$ absorbed) |
| **Total** | — | — | — | **3 Edges** | **7** | — |

---

### Dimension 3: Visual ASCII State Transitions

```
                    PRIM'S ALGORITHM GREEDY CUT EXPANSION

    Step 0: Seed Tree T = {0}
    [ 0 ] <================ Cut = ({0}, {1, 2, 3})
      │   \
    (1)   (3)
      ▼     ▼
     (1)   (2)

    Step 1: Absorb node 1 (Cost = 1). Cut = ({0, 1}, {2, 3})
    [ 0 ] --- (1) --- [ 1 ]
      │                 │
    (3)                (2)  <=== CHEAPEST CROSSING EDGE!
      ▼                 ▼
     (2)               (2)

    Step 2: Absorb node 2 (Cost = 2). Cut = ({0, 1, 2}, {3})
    [ 0 ] --- (1) --- [ 1 ]
      │                 │
      │                (2)
      │                 │
      └───────>────── [ 2 ] --- (4) ---> ( 3 )

    Step 3: Absorb node 3 (Cost = 4).
    All 4 vertices in T! Total MST Cost = 1 + 2 + 4 = 7.
```

---

### Dimension 4: Invariant Preservation Proofs

1. **Connectivity Invariant:**
   At every iteration, the subgraph induced by vertex set $T$ is connected.
   - *Proof:* Initially $T = \{0\}$, which is connected. At each step, a vertex $v \notin T$ is added via an edge $(u, v)$ where $u \in T$. Adding a leaf edge connecting an existing node in $T$ to a new node $v$ maintains the single connected component invariant.
2. **Global Minimality Invariant:**
   At every iteration, the edge set of $T$ is a subset of some Minimum Spanning Tree of $G$.
   - *Proof:* Follows directly from the Cut Property. The edge chosen to absorb $v$ is the minimum-weight edge crossing the cut $(T, V \setminus T)$.

---

### Dimension 5: Edge Case Analysis & Defense Matrix

| Edge Case Scenario | Potential Failure Mode | Built-in Defense Mechanism |
| :--- | :--- | :--- |
| **Disconnected Components** | Infinite loop or incomplete tree. | Loop terminates when `pq` is empty; check `if (verticesInMst < v) return (false, 0)`. |
| **Duplicate / Parallel Edges** | Multiple edges between same pair $u$ and $v$. | Prim's algorithm naturally picks the one with minimum weight from the priority queue. |
| **Stale Entries in Heap** | Node enqueued multiple times with different costs. | Lazy check `if (inMst[u]) continue;` discards stale elements in $O(1)$. |
| **Self-Loops $(u, u)$** | Self-loop picked into tree. | Guard `if (!inMst[neighbor])` ignores edges back into existing tree vertices. |

---

## 4. 🎬 DEMONSTRATE: Canonical LeetCode Walkthroughs

### 4.1 [LeetCode 1135] Connecting Cities With Minimum Cost (Medium)

#### Problem Formulation
There are $n$ cities labeled from $1$ to $n$. You are given an array `connections` where `connections[i] = [x, y, cost]`. Return the minimum cost to connect all cities such that there is at least one path between any pair of cities. If it is impossible, return `-1`.

#### Prim's Solution
```csharp
public sealed class ConnectingCitiesPrimSolution
{
    public int MinimumCost(int n, int[][] connections)
    {
        if (n <= 1) return 0;
        if (connections.Length < n - 1) return -1;

        // Build adjacency list (1-indexed)
        var adj = new List<(int To, int Cost)>[n + 1];
        for (int i = 1; i <= n; i++) adj[i] = new List<(int, int)>();

        foreach (var conn in connections)
        {
            int u = conn[0];
            int v = conn[1];
            int cost = conn[2];
            adj[u].Add((v, cost));
            adj[v].Add((u, cost));
        }

        var inMst = new bool[n + 1];
        var pq = new PriorityQueue<(int Node, int Cost), int>();

        // Seed from city 1
        pq.Enqueue((1, 0), 0);

        int totalCost = 0;
        int visitedCities = 0;

        while (pq.Count > 0 && visitedCities < n)
        {
            var (city, cost) = pq.Dequeue();

            if (inMst[city]) continue;

            inMst[city] = true;
            totalCost += cost;
            visitedCities++;

            foreach (var (next, nextCost) in adj[city])
            {
                if (!inMst[next])
                {
                    pq.Enqueue((next, nextCost), nextCost);
                }
            }
        }

        return visitedCities == n ? totalCost : -1;
    }
}
```

#### Complexity Analysis
- **Time Complexity:** $O((V + E) \log V)$ where $V = n$ and $E = \text{connections.Length}$.
- **Space Complexity:** $O(V + E)$ for adjacency list and priority queue.

---

### 4.2 [LeetCode 1168] Optimize Water Distribution in a Village (Hard)

#### Problem Formulation
There are $n$ houses in a village. You can supply water by either:
1. Building a well at house $i$ with cost `wells[i - 1]`.
2. Laying a pipe between house $x$ and house $y$ with cost `pipes[j] = [x, y, cost]`.
Return the minimum total cost to supply water to all houses.

#### Algorithmic Formulation via Virtual Super-Source Node 0
1. Create a virtual node $0$ representing the "Deep Aquifer".
2. Building a well at house $i$ is modeled as laying a pipe from virtual node $0$ to house $i$ with weight `wells[i - 1]`.
3. Adding these $n$ edges creates an augmented graph with $n + 1$ nodes: $\{0, 1, \dots, n\}$.
4. Any spanning tree on these $n + 1$ nodes connects every house to node 0 (either directly via a well, or indirectly through pipes to another house with a well).
5. The Minimum Spanning Tree of this augmented graph yields the globally optimal combination!

```csharp
public sealed class OptimizeWaterDistributionSolution
{
    public int MinCostToSupplyWater(int n, int[] wells, int[][] pipes)
    {
        // Augmented graph has n + 1 vertices: 0 is the virtual super-source
        var adj = new List<(int To, int Cost)>[n + 1];
        for (int i = 0; i <= n; i++) adj[i] = new List<(int, int)>();

        // 1. Add edges from virtual source 0 to house i with weight wells[i - 1]
        for (int i = 1; i <= n; i++)
        {
            int wellCost = wells[i - 1];
            adj[0].Add((i, wellCost));
            adj[i].Add((0, wellCost));
        }

        // 2. Add real pipe edges between houses
        foreach (var pipe in pipes)
        {
            int u = pipe[0];
            int v = pipe[1];
            int cost = pipe[2];
            adj[u].Add((v, cost));
            adj[v].Add((u, cost));
        }

        // 3. Execute Prim's MST starting from virtual source 0
        var inMst = new bool[n + 1];
        var pq = new PriorityQueue<(int Node, int Cost), int>();

        pq.Enqueue((0, 0), 0);

        int totalCost = 0;
        int visitedNodes = 0;

        while (pq.Count > 0 && visitedNodes <= n)
        {
            var (curr, cost) = pq.Dequeue();

            if (inMst[curr]) continue;

            inMst[curr] = true;
            totalCost += cost;
            visitedNodes++;

            foreach (var (next, edgeCost) in adj[curr])
            {
                if (!inMst[next])
                {
                    pq.Enqueue((next, edgeCost), edgeCost);
                }
            }
        }

        return totalCost;
    }
}
```

#### Complexity Analysis
- **Time Complexity:** $O((V + E) \log V)$ where $V = n + 1$ and $E = n + \text{pipes.Length}$.
- **Space Complexity:** $O(V + E)$ storing the augmented graph.

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Min Cost to Connect All Points via Dense Prim ([LeetCode 1584] - Medium/Hard)
- **Constraint:** $N$ coordinates, Euclidean/Manhattan complete graph ($E = N(N - 1) / 2$).
- **Challenge:** Solve [LeetCode 1584] using **Prim's Dense $O(V^2)$ Flat Array** implementation instead of Kruskal's! Compare runtime and observe how $O(V^2)$ completely eliminates edge allocation and sorting overhead!

### Exercise 2: Find Critical and Pseudo-Critical Edges in MST ([LeetCode 1489] - Hard)
- **Constraint:** Given a weighted graph, classify each edge as critical (belongs to ALL MSTs) or pseudo-critical (belongs to AT LEAST ONE MST).
- **Architecture Hint:**
  1. Compute base MST weight $W$.
  2. For each edge $e$: Force-exclude $e$ and compute MST. If weight $> W$ or disconnected, $e$ is **Critical**!
  3. Otherwise: Force-include $e$ and compute MST. If weight $== W$, $e$ is **Pseudo-Critical**!

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
                     MST ALGORITHM SELECTION DECISION MATRIX

                             Is the graph density high?
                                     /       \
                          YES (E ≈ V²)        NO (E ≪ V²)
                              /                   \
                   Are vertices spatial?        [Kruskal's Algorithm]
                         /          \           Sort edges in O(E log E)
                       YES           NO         Backed by DSU in O(α(N))
                       /              \
            [Prim Dense O(V²)]   [Prim Heap O((V+E) log V)]
            No edge array memory! Min-Heap with Adjacency List
```

---

## 7. 🎯 Daily Checkpoint Questions

### Diagnostic Question
Under what exact edge density conditions does Prim's algorithm outperform Kruskal's algorithm, and why?

### Architectural Model Answer
1. **Dense Graphs ($E \approx V^2$):**
   In a dense graph, such as a complete graph where $E = \frac{V(V-1)}{2} \approx V^2$:
   - **Kruskal's Algorithm:** Must allocate and sort all $E$ edges. Sorting takes $O(E \log E) = O(V^2 \log (V^2)) = O(V^2 \log V)$ time, and edge storage demands $O(V^2)$ memory.
   - **Prim's Algorithm (Flat Array Variant):** Operates directly using an unvisited distance array `int[] minCost` of size $V$. At each of the $V$ steps, it scans $V$ elements to find the cut minimum ($O(V)$) and updates $V$ neighbor distances ($O(V)$). Total time is strictly $\mathbf{O(V^2)}$, and total auxiliary memory is only $\mathbf{O(V)}$.
2. **Why Prim Dense Dominates:**
   Because $V^2 < V^2 \log V$, and because Prim Dense requires zero edge array allocations (distances are calculated on-the-fly), Prim Dense executes significantly faster and consumes orders of magnitude less memory when $E = \Omega(V^2 / \log V)$.
3. **Sparse Graphs ($E \ll V^2$):**
   Conversely, when $E = O(V)$, Kruskal runs in $O(V \log V)$, which easily beats Prim Dense's $O(V^2)$.
