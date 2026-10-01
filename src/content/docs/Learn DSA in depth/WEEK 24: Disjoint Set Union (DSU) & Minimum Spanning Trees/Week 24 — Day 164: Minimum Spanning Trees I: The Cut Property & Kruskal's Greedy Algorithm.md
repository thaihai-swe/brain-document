---
title: "Week 24 — Day 164: Minimum Spanning Trees I: The Cut Property & Kruskal's Greedy Algorithm"
---

# Week 24 — Day 164: Minimum Spanning Trees I: The Cut Property & Kruskal's Greedy Algorithm

Welcome to **Day 164 of your DSA Mastery Journey**!

Over the past two days, you mastered **Disjoint Set Union (DSU)**—achieving near-constant $O(\alpha(N))$ amortized dynamic equivalence partitioning using path compression and union by rank/size. Today, we unleash the full power of DSU to solve one of the most fundamental optimization problems in computer science and network engineering: **The Minimum Spanning Tree (MST)** problem.

Imagine deploying a nationwide fiber-optic telecommunications backbone or laying electrical transmission grids across $V$ cities. There are $E$ candidate corridors, each associated with a non-zero construction cost. Your mission is to connect all cities into a single network while **minimizing total construction cost**.

Today, you will:
1. Master the mathematical definition of a **Cut** and rigorously prove the **Cut Property Theorem** via an exchange argument.
2. Implement **Kruskal's Algorithm**—an edge-centric greedy algorithm running in $O(E \log E)$ time powered by DSU.
3. Build a production-grade `KruskalMstSolver` C# container with cycle prevention and edge weighting.
4. Solve **[LeetCode 1584] Min Cost to Connect All Points** by translating complete 2D coordinate graphs into minimum spanning forests.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│              DAY 164: THE CUT PROPERTY THEOREM & KRUSKAL'S GREEDY MST ALGORITHM                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       THE CUT PROPERTY THEOREM    │                             │       KRUSKAL'S ALGORITHM         │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Cut (S, V \ S): Disjoint split. │                             │ • Sort all E edges ascending.     │
│ • Crossing edge: u in S, v in V\S.│ ── Theoretical Foundation ─►│ • Initialize DSU with V nodes.    │
│ • The Cut Property:               │                             │ • For each edge (u, v, w):        │
│   Lightest crossing edge e*       │                             │     if DSU.Union(u, v):           │
│   MUST belong to some MST!        │                             │         Include in MST!           │
│ • Proved via exchange argument.   │                             │ • Stop when V - 1 edges chosen.   │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         PRODUCTION C# & PROBLEM SET         │
                          ├─────────────────────────────────────────────┤
                          │ • Production KruskalMstSolver Container     │
                          │ • Automated assertions & test suite         │
                          │ • [LC 1584] Min Cost to Connect All Points  │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🗝️ The Visual Mental Model: Cuts and Crossing Edges

Let $G = (V, E, w)$ be a connected, undirected, weighted graph.
- A **Spanning Tree** $T \subseteq E$ is an acyclic subset of edges that connects all $|V|$ vertices. A spanning tree always contains exactly $|V| - 1$ edges.
- A **Minimum Spanning Tree (MST)** is a spanning tree whose total edge weight $\sum_{e \in T} w(e)$ is minimized.

#### What is a Graph Cut?
A **cut** $(S, V \setminus S)$ is a partition of the vertex set $V$ into two disjoint, non-empty subsets $S$ and $V \setminus S$.
An edge $e = (u, v)$ is said to **cross the cut** if one endpoint lies in $S$ and the other endpoint lies in $V \setminus S$ (i.e., $u \in S$ and $v \in V \setminus S$).

```
                         A GRAPH CUT (S, V \ S)

            Subset S                         Subset V \ S
        ┌──────────────┐                 ┌──────────────────┐
        │   ( A )      │                 │      ( D )       │
        │    │         │                 │       │          │
        │    │ (4)     │  e1: (A, D) w=7 │       │ (2)      │
        │    ▼         │=================│=======▼          │
        │   ( B )      │  e2: (B, D) w=3 │      ( E )       │
        │    │         │-----------------│       │          │
        │    │ (5)     │  e3: (C, E) w=6 │       │ (8)      │
        │    ▼         │=================│=======▼          │
        │   ( C )      │                 │      ( F )       │
        └──────────────┘                 └──────────────────┘

   Edges crossing the cut:
   • e1 = (A, D), weight = 7
   • e2 = (B, D), weight = 3  <=== LIGHTEST CROSSING EDGE (e*)!
   • e3 = (C, E), weight = 6

   THE CUT PROPERTY DICTATES:
   The edge e2 = (B, D) with minimum weight w=3 MUST belong to some MST of G!
```

---

### 1.2 🧮 Mathematical Proof: The Cut Property (Exchange Argument)

#### Theorem (The Cut Property):
> Let $G = (V, E, w)$ be a connected, weighted, undirected graph. For any cut $(S, V \setminus S)$ in $G$, let $e^* = (u, v)$ be an edge of strictly minimum weight crossing the cut. Then $e^*$ belongs to every Minimum Spanning Tree of $G$. (If edge weights are not strictly distinct, $e^*$ belongs to at least one MST).

#### Proof by Contradiction & Exchange Argument:
1. Suppose for contradiction that there exists a Minimum Spanning Tree $T$ of $G$ that does **not** contain $e^*$.
2. Because $T$ is a spanning tree, it connects all vertices of $V$. Therefore, there exists a unique simple path $P$ in $T$ connecting vertex $u$ and vertex $v$.
3. Since $u \in S$ and $v \in V \setminus S$, the path $P$ starts in $S$ and ends in $V \setminus S$.
4. By the Intermediate Value Theorem of graph paths, $P$ must cross from $S$ to $V \setminus S$ at least once. Therefore, $P$ contains at least one edge $e' = (x, y)$ such that $x \in S$ and $y \in V \setminus S$.
5. Notice that $e'$ is also an edge crossing the cut $(S, V \setminus S)$. By the definition of $e^*$ as the minimum weight crossing edge:
   $$w(e^*) \le w(e')$$
6. Now, construct a new subgraph $T'$ by **exchanging** edges: remove $e'$ from $T$ and add $e^*$:
   $$T' = (T \setminus \{e'\}) \cup \{e^*\}$$
7. **Properties of $T'$:**
   - Removing $e'$ split $T$ into two disconnected components (one containing $S$, one containing $V \setminus S$).
   - Adding $e^* = (u, v)$ bridges those two components back together because $u \in S$ and $v \in V \setminus S$.
   - Thus, $T'$ is connected, contains $|V| - 1$ edges, and is acyclic $\implies T'$ is a valid spanning tree!
8. **Compare the total weights:**
   $$w(T') = w(T) - w(e') + w(e^*) = w(T) + (w(e^*) - w(e'))$$
   - Since $w(e^*) \le w(e')$, we have $w(e^*) - w(e') \le 0$, which implies:
   $$w(T') \le w(T)$$
   - If $w(e^*) < w(e')$, then $w(T') < w(T)$, directly contradicting that $T$ was a *Minimum* Spanning Tree!
   - If $w(e^*) = w(e')$, then $w(T') = w(T)$, proving that $e^*$ belongs to the alternative Minimum Spanning Tree $T'$.

Therefore, $e^*$ must belong to an MST. $\blacksquare$

---

### 1.3 🖼️ Visual Mechanics: Kruskal's Greedy Algorithm

Kruskal's algorithm is an edge-centric greedy algorithm that operationalizes the Cut Property:
1. **Sort:** Extract all $E$ edges from the graph and sort them in non-decreasing order of weight:
   $$w(e_1) \le w(e_2) \le w(e_3) \le \dots \le w(e_E)$$
2. **Initialize:** Create a DSU with $V$ components (every node is an isolated tree).
3. **Iterate:** For each sorted edge $e = (u, v)$ with weight $w$:
   - Check if $u$ and $v$ belong to different components using `DSU.Find(u) != DSU.Find(v)`.
   - If they are in different components, adding $e$ cannot form a cycle! Include $e$ in the MST, union $u$ and $v$, and add $w$ to total cost.
   - If they are already in the same component, discard $e$ (it would form a redundant cycle).
4. **Termination:** Terminate as soon as $|V| - 1$ edges have been added (or all edges inspected). If fewer than $|V| - 1$ edges are added, the graph is disconnected.

```
                    KRUSKAL'S ALGORITHM STEP-BY-STEP TRACE

    Edges sorted by weight:
    1. (0, 1, w=1)  -> DSU.Union(0, 1): SUCCESS -> Edge added! [Edges: 1]
    2. (2, 3, w=2)  -> DSU.Union(2, 3): SUCCESS -> Edge added! [Edges: 2]
    3. (1, 2, w=3)  -> DSU.Union(1, 2): SUCCESS -> Edge added! [Edges: 3]
    4. (0, 3, w=4)  -> DSU.Union(0, 3): FAILED! (0 and 3 already share root) -> CYCLE DISCARDED!
    5. (3, 4, w=5)  -> DSU.Union(3, 4): SUCCESS -> Edge added! [Edges: 4 == V - 1] -> DONE!
```

---

### 1.4 5W1H Executive Architecture Blueprint: Kruskal's Algorithm

| Dimension | Architectural Specification |
| :--- | :--- |
| **1. WHAT** | An edge-centric greedy algorithm that constructs an MST by sorting all edges by weight and incrementally adding cycle-free edges using DSU. |
| **2. WHY** | Guarantees globally optimal minimum spanning tree cost in $O(E \log E)$ time, avoiding exponential spanning tree search spaces. |
| **3. WHEN** | Sparse graphs ($E \ll V^2$), when edges are already sorted or easy to sort, clustering algorithms (K-means single-linkage), circuit wiring. |
| **4. WHERE** | Primitive edge array `Edge[]` sorted via QuickSort/Array.Sort, backed by `DisjointSetUnionRankSize` (parent and rank arrays in contiguous RAM). |
| **5. WHO** | *"I build minimum spanning trees using Kruskal's algorithm on sparse graphs. Sorting all edges takes $O(E \log E)$, and DSU union-find verifies cycle freedom in $O(E \cdot \alpha(V))$ amortized time."* |
| **6. HOW** | Sort edges ascending $\to$ initialize DSU $\to$ iterate edges $\to$ if `Union(u, v)` succeeds, add weight and increment edge counter until $V - 1$ edges selected. |

---

## 2. ⚙️ IMPLEMENT: Production-Grade Container

Here is the production-grade, standalone compilable C# implementation of `KruskalMstSolver` with full diagnostics, edge tracking, and automated validation.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedGraphAlgorithms.SpanningTrees
{
    /// <summary>
    /// Represents an undirected weighted edge connecting two vertices.
    /// </summary>
    public readonly struct WeightedEdge : IComparable<WeightedEdge>
    {
        public readonly int U;
        public readonly int V;
        public readonly int Weight;

        public WeightedEdge(int u, int v, int weight)
        {
            U = u;
            V = v;
            Weight = weight;
        }

        public int CompareTo(WeightedEdge other)
        {
            return Weight.CompareTo(other.Weight);
        }

        public override string ToString() => $"({U} <-> {V}, Weight={Weight})";
    }

    /// <summary>
    /// Encapsulates the result of a Minimum Spanning Tree computation.
    /// </summary>
    public sealed class MstResult
    {
        public bool IsSpanningTreePossible { get; }
        public long TotalCost { get; }
        public IReadOnlyList<WeightedEdge> MstEdges { get; }

        public MstResult(bool possible, long totalCost, IReadOnlyList<WeightedEdge> edges)
        {
            IsSpanningTreePossible = possible;
            TotalCost = totalCost;
            MstEdges = edges;
        }
    }

    /// <summary>
    /// Production-grade implementation of Kruskal's Minimum Spanning Tree Algorithm.
    /// Time Complexity: O(E log E) sorting + O(E * alpha(V)) DSU operations.
    /// Space Complexity: O(V + E) for edge list and DSU state.
    /// </summary>
    public sealed class KruskalMstSolver
    {
        /// <summary>
        /// Computes the Minimum Spanning Tree for a graph with V vertices.
        /// </summary>
        /// <param name="verticesCount">Number of vertices [0 .. V-1].</param>
        /// <param name="edges">Collection of all undirected weighted edges.</param>
        /// <returns>MstResult containing success status, total cost, and selected edges.</returns>
        public static MstResult ComputeMst(int verticesCount, List<WeightedEdge> edges)
        {
            if (verticesCount <= 0)
                throw new ArgumentOutOfRangeException(nameof(verticesCount), "Vertex count must be positive.");

            if (verticesCount == 1)
            {
                return new MstResult(true, 0, Array.Empty<WeightedEdge>());
            }

            if (edges == null || edges.Count < verticesCount - 1)
            {
                // A connected spanning tree requires at least V - 1 edges
                return new MstResult(false, 0, Array.Empty<WeightedEdge>());
            }

            // Step 1: Sort all edges in non-decreasing order of weight: O(E log E)
            edges.Sort();

            // Step 2: Initialize DSU with V nodes: O(V)
            var parent = new int[verticesCount];
            var rank = new int[verticesCount];
            for (int i = 0; i < verticesCount; i++)
            {
                parent[i] = i;
                rank[i] = 0;
            }

            // Local DSU Find with Path Compression
            int Find(int x)
            {
                if (parent[x] != x)
                    parent[x] = Find(parent[x]);
                return parent[x];
            }

            // Local DSU Union by Rank
            bool Union(int x, int y)
            {
                int rx = Find(x);
                int ry = Find(y);
                if (rx == ry) return false;

                if (rank[rx] < rank[ry])
                {
                    parent[rx] = ry;
                }
                else if (rank[rx] > rank[ry])
                {
                    parent[ry] = rx;
                }
                else
                {
                    parent[ry] = rx;
                    rank[rx]++;
                }
                return true;
            }

            // Step 3: Iterate through sorted edges and greedily accept cycle-free edges
            var mstEdges = new List<WeightedEdge>(verticesCount - 1);
            long totalCost = 0;

            foreach (var edge in edges)
            {
                if (Union(edge.U, edge.V))
                {
                    mstEdges.Add(edge);
                    totalCost += edge.Weight;

                    // Optimization: stop early once V - 1 edges are accepted
                    if (mstEdges.Count == verticesCount - 1)
                    {
                        break;
                    }
                }
            }

            // If we selected exactly V - 1 edges, graph is connected and MST is complete
            bool isConnected = (mstEdges.Count == verticesCount - 1);
            return new MstResult(isConnected, isConnected ? totalCost : 0, mstEdges);
        }

        // ====================================================================
        // SELF-VALIDATING TEST SUITE
        // ====================================================================
        public static void Main()
        {
            Console.WriteLine("==================================================");
            Console.WriteLine("RUNNING TEST SUITE: KruskalMstSolver (C#)");
            Console.WriteLine("==================================================");

            // Test 1: Standard 5-vertex connected graph
            // 0 - 1 (w=1), 1 - 2 (w=2), 0 - 2 (w=3), 2 - 3 (w=4), 3 - 4 (w=5), 2 - 4 (w=6)
            var edges = new List<WeightedEdge>
            {
                new WeightedEdge(0, 1, 1),
                new WeightedEdge(1, 2, 2),
                new WeightedEdge(0, 2, 3), // Should be skipped (cycle with 0-1-2)
                new WeightedEdge(2, 3, 4),
                new WeightedEdge(3, 4, 5),
                new WeightedEdge(2, 4, 6)  // Should be skipped (cycle with 2-3-4)
            };

            var result = ComputeMst(5, edges);
            Debug.Assert(result.IsSpanningTreePossible == true);
            Debug.Assert(result.MstEdges.Count == 4, "MST on 5 vertices must contain exactly 4 edges.");
            Debug.Assert(result.TotalCost == 1 + 2 + 4 + 5, $"Expected cost 12, got {result.TotalCost}");

            // Test 2: Disconnected graph (cannot form spanning tree)
            var disconnectedEdges = new List<WeightedEdge>
            {
                new WeightedEdge(0, 1, 10),
                new WeightedEdge(2, 3, 20)
            };
            var disResult = ComputeMst(4, disconnectedEdges);
            Debug.Assert(disResult.IsSpanningTreePossible == false);
            Debug.Assert(disResult.MstEdges.Count == 2);

            Console.WriteLine("✅ All KruskalMstSolver assertions passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Operational Deep-Dive (5 Dimensions)

### Dimension 1: Mathematical Contract & Asymptotic Proofs

| Phase | Operation | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- |
| **Phase 1: Edge Sorting** | Dual-Pivot QuickSort (`List.Sort()`) | $\mathbf{\Theta(E \log E)}$ | $O(\log E)$ stack |
| **Phase 2: DSU Setup** | Allocate `parent` & `rank` | $\Theta(V)$ | $\Theta(V)$ memory |
| **Phase 3: Greedy Iteration** | At most $E$ `Find` & `Union` calls | $\Theta(E \cdot \alpha(V))$ | $O(1)$ auxiliary |
| **Phase 4: Early Exit** | Halts immediately when count $= V - 1$ | $O(1)$ check | $O(1)$ |
| **Overall Total** | — | $\mathbf{\Theta(E \log E)}$ | $\mathbf{\Theta(V + E)}$ |

> [!TIP]
> Since $E \le V^2$, we know $\log E \le \log (V^2) = 2 \log V$.
> Therefore, $O(E \log E) = O(E \log V)$.
> In sparse graphs where $E \approx V$, Kruskal's algorithm runs in lightning-fast $O(V \log V)$ time!

---

### Dimension 2: Step-by-Step Execution Trace

Graph: $V = 4$, Edges: $e_1=(0,1, w=1), e_2=(1,2, w=2), e_3=(0,2, w=3), e_4=(2,3, w=4)$.

| Step | Current Edge | Action | DSU Roots Check | Result | Total Cost | Edges Count |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | $(0, 1, 1)$ | `Union(0, 1)` | `Find(0)=0 != Find(1)=1` | **Accepted** | 1 | 1 |
| 2 | $(1, 2, 2)$ | `Union(1, 2)` | `Find(1)=0 != Find(2)=2` | **Accepted** | 3 | 2 |
| 3 | $(0, 2, 3)$ | `Union(0, 2)` | `Find(0)=0 == Find(2)=0` | **Cycle Discarded** | 3 | 2 |
| 4 | $(2, 3, 4)$ | `Union(2, 3)` | `Find(2)=0 != Find(3)=3` | **Accepted** | **7** | **3 ($V - 1$)** |
| — | — | Early Exit | Target reached ($3 == 4 - 1$) | **Done!** | 7 | 3 |

---

### Dimension 3: Visual ASCII State Transitions

```
                    KRUSKAL'S DSU FOREST COMPONENT MERGES

    Initial State: 4 Isolated Components
    ( 0 )     ( 1 )     ( 2 )     ( 3 )

    Step 1: Accept (0, 1, w=1)
    [ 0 ] --- (1) --- [ 1 ]         ( 2 )         ( 3 )
    Merged: {0, 1}

    Step 2: Accept (1, 2, w=2)
    [ 0 ] --- (1) --- [ 1 ] --- (2) --- [ 2 ]     ( 3 )
    Merged: {0, 1, 2}

    Step 3: Edge (0, 2, w=3) inspected.
    0 and 2 are already connected via 0-1-2! Adding (0, 2) forms cycle (0-1-2-0).
    REJECTED!

    Step 4: Accept (2, 3, w=4)
    [ 0 ] --- (1) --- [ 1 ] --- (2) --- [ 2 ] --- (4) --- [ 3 ]
    All 4 vertices connected into 1 tree! Total cost = 1 + 2 + 4 = 7.
```

---

### Dimension 4: Invariant Preservation Proofs

1. **Acyclicity Invariant:**
   The set of accepted edges $T$ never contains a simple cycle.
   - *Proof:* An edge $(u, v)$ is added to $T$ if and only if $\text{Find}(u) \ne \text{Find}(v)$. This means $u$ and $v$ belong to different connected components in $T$. Adding an edge between two disjoint trees can never introduce a cycle; it simply merges the two trees into a single larger tree.
2. **Minimality Invariant:**
   At every stage, the accepted edges form a subset of some Minimum Spanning Tree of $G$.
   - *Proof:* Follows directly from the Cut Property Theorem proved in Section 1.2. The edge $(u, v)$ chosen is the lightest edge in $G$ that connects component $T_u$ to some vertex outside $T_u$. By the Cut Property, this lightest crossing edge must belong to an MST.

---

### Dimension 5: Edge Case Analysis & Defense Matrix

| Edge Case Scenario | Potential Failure Mode | Built-in Defense Mechanism |
| :--- | :--- | :--- |
| **Insufficient Edges ($E < V - 1$)** | Graph cannot be connected. | Immediate $O(1)$ check: `if (edges.Count < V - 1) return MstResult(false)`. |
| **Multiple Equal-Weight Edges** | Nondeterministic edge selection. | Handled naturally: sorting preserves non-decreasing order; any valid cut-crossing edge with min weight yields a valid MST. |
| **Negative Edge Weights** | Mistaken belief that MST algorithms fail on negative weights. | Kruskal's algorithm operates on the Cut Property, which **remains 100% valid with negative edge weights**! (Unlike Dijkstra). |
| **Single Vertex Graph ($V = 1$)** | Crash due to $V - 1 = 0$ loop condition. | Guard clause returns `MstResult(true, 0, emptyList)` in $O(1)$. |

---

## 4. 🎬 DEMONSTRATE: Canonical LeetCode Walkthroughs

### 4.1 [LeetCode 1584] Min Cost to Connect All Points (Medium/Hard)

#### Problem Formulation
You are given an array `points` representing integer coordinates of some points on a 2D plane, where `points[i] = [xi, yi]`. The cost of connecting two points `[xi, yi]` and `[xj, yj]` is the Manhattan distance between them: $|xi - xj| + |yi - yj|$.
Return the minimum cost to make all points connected.

#### Algorithmic Translation to Kruskal's Algorithm
1. This is a **complete graph** where every pair of points $(i, j)$ has an implicit edge of weight $\text{ManhattanDist}(i, j)$.
2. For $N$ points, there are $\frac{N(N - 1)}{2}$ edges. When $N = 1000$, $E \approx 500,000$ edges.
3. We generate all $O(N^2)$ edges, sort them by Manhattan distance, and execute Kruskal's with DSU!

```csharp
public sealed class MinCostConnectPointsSolution
{
    private sealed class Dsu
    {
        private readonly int[] _parent;
        private readonly int[] _rank;

        public Dsu(int n)
        {
            _parent = new int[n];
            _rank = new int[n];
            for (int i = 0; i < n; i++) _parent[i] = i;
        }

        public int Find(int x)
        {
            if (_parent[x] != x)
                _parent[x] = Find(_parent[x]);
            return _parent[x];
        }

        public bool Union(int x, int y)
        {
            int rx = Find(x);
            int ry = Find(y);
            if (rx == ry) return false;

            if (_rank[rx] < _rank[ry]) _parent[rx] = ry;
            else if (_rank[rx] > _rank[ry]) _parent[ry] = rx;
            else
            {
                _parent[ry] = rx;
                _rank[rx]++;
            }
            return true;
        }
    }

    private readonly struct Edge : IComparable<Edge>
    {
        public readonly int U;
        public readonly int V;
        public readonly int Dist;

        public Edge(int u, int v, int dist)
        {
            U = u;
            V = v;
            Dist = dist;
        }

        public int CompareTo(Edge other) => Dist.CompareTo(other.Dist);
    }

    public int MinCostConnectPoints(int[][] points)
    {
        int n = points.Length;
        if (n <= 1) return 0;

        int edgeCount = n * (n - 1) / 2;
        var edges = new Edge[edgeCount];
        int edgeIdx = 0;

        // Generate all N * (N - 1) / 2 Manhattan distance edges
        for (int i = 0; i < n; i++)
        {
            int x1 = points[i][0];
            int y1 = points[i][1];

            for (int j = i + 1; j < n; j++)
            {
                int dist = Math.Abs(x1 - points[j][0]) + Math.Abs(y1 - points[j][1]);
                edges[edgeIdx++] = new Edge(i, j, dist);
            }
        }

        // Sort edges ascending by Manhattan distance
        Array.Sort(edges);

        var dsu = new Dsu(n);
        int totalCost = 0;
        int edgesAccepted = 0;

        foreach (var edge in edges)
        {
            if (dsu.Union(edge.U, edge.V))
            {
                totalCost += edge.Dist;
                edgesAccepted++;

                // Stop as soon as N - 1 edges are accepted
                if (edgesAccepted == n - 1)
                    break;
            }
        }

        return totalCost;
    }
}
```

#### Complexity Analysis
- **Time Complexity:** $O(N^2 \log (N^2)) = O(N^2 \log N)$. Generating $O(N^2)$ edges takes $O(N^2)$ time. Sorting $E = N^2/2$ edges takes $O(E \log E)$. DSU takes $O(E \cdot \alpha(N))$. For $N = 1000$, operations $\approx 5 \times 10^5 \times 19 \approx 9.5 \times 10^6$, executing comfortably within 150 ms in C#!
- **Space Complexity:** $O(N^2)$ to store the edge array.

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Connecting Cities With Minimum Cost ([LeetCode 1135] - Medium)
- **Constraint:** Given $N$ cities and an edge list `connections` where `connections[i] = [city1, city2, cost]`. Return minimum cost to connect all cities. If impossible, return `-1`.
- **Kruskal Solution:** Direct translation! Sort connections, apply DSU, verify if `edgesAccepted == N - 1`.

### Exercise 2: Min Cost to Supply Water ([LeetCode 1168] - Hard Preview)
- **Constraint:** Building wells at city $i$ costs $wells[i]$. Laying pipes between $(i, j)$ costs $pipes[i][j]$.
- **Architecture Hint (Virtual Node):** Create a **virtual super-source node 0**. An edge from node $0$ to city $i$ has weight $wells[i]$. Now run standard Kruskal's across all cities plus node 0! (We explore this deeply tomorrow on Day 165).

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
                   SPANNING TREE ALGORITHM DECISION TREE

                     Is the graph dense (E ≈ V²) or sparse (E ≪ V²)?
                                    /              \
                             DENSE                   SPARSE
                              /                         \
                   [Prim's Algorithm]              [Kruskal's Algorithm]
                  O(V²) with Flat Array            O(E log E) with DSU
                 (Preview: Day 165)                 (Mastered Today!)
```

---

## 7. 🎯 Daily Checkpoint Questions

### Diagnostic Question
Prove the Cut Property of Minimum Spanning Trees using an exchange argument.

### Architectural Model Answer
1. **Setup:** Let $G = (V, E, w)$ be a connected, weighted, undirected graph, and let $(S, V \setminus S)$ be an arbitrary cut. Let $e^* = (u, v)$ be the edge of minimum weight crossing the cut.
2. **Contradiction Assumption:** Assume there exists an MST $T$ that does not include $e^*$.
3. **Fundamental Cycle:** Since $T$ is a spanning tree, adding $e^*$ to $T$ creates a unique simple cycle $C$.
4. **Intermediate Value of Graph Cut:** Because $u \in S$ and $v \in V \setminus S$, the cycle $C$ must cross the cut $(S, V \setminus S)$ an even number of times. Therefore, $C$ must contain at least one other edge $e' \ne e^*$ that also crosses the cut $(S, V \setminus S)$.
5. **Exchange:** Construct a new spanning tree $T' = (T \setminus \{e'\}) \cup \{e^*\}$. By definition of $e^*$ as the lightest crossing edge, $w(e^*) \le w(e')$.
6. **Total Weight Comparison:**
   $$w(T') = w(T) - w(e') + w(e^*) \le w(T)$$
   - If $w(e^*) < w(e')$, then $w(T') < w(T)$, contradicting that $T$ was an MST.
   - If $w(e^*) = w(e')$, then $w(T') = w(T)$, proving $T'$ is an equally minimal spanning tree that contains $e^*$.
7. Thus, $e^*$ must belong to some MST.
