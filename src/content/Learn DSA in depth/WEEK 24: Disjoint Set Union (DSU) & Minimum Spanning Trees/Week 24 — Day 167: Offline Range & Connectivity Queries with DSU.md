---
title: "Week 24 — Day 167: Offline Range & Connectivity Queries with DSU"
---

# Week 24 — Day 167: Offline Range & Connectivity Queries with DSU

Welcome to **Day 167 of your DSA Mastery Journey**!

Standard Disjoint Set Union (DSU) possesses one fundamental structural limitation: **it is strictly monotonic**. It supports adding edges (`Union`), but it **cannot delete edges** without expensive rollback stacks or persistent segment-tree dynamic connectivity.

Consider this classic systems interview problem:
> *"Given an undirected graph with weighted edges, you receive $Q$ queries: `[u, v, limit]`. For each query, return whether there is a path connecting $u$ and $v$ using strictly edges with weight $< limit$."*

If you answer these queries **online** (in the order they arrive), you are trapped:
- Query 1 might require edges with weight $< 10$.
- Query 2 might require edges with weight $< 3$ (demanding that edges $\ge 3$ be removed!).
- Rebuilding the graph or running BFS/DFS for every query costs $O(Q \cdot (V + E)) \approx 10^5 \times 10^5 = 10^{10}$ operations—instant Time Limit Exceeded (TLE).

The breakthrough paradigm is **Offline Query Processing**:
If we are allowed to inspect all queries upfront, we can **sort the queries** in non-decreasing order of their threshold `limit`. Then, edges are inserted into the DSU monotonically, one by one. Once an edge is added, it is **never deleted**!

Today, you will master:
1. **The Offline Query Reordering Paradigm:** Decoupling arrival order from execution order using index tags.
2. **Dual Two-Pointer Sweep:** Advancing an edge pointer monotonically as query thresholds expand.
3. **Production Offline Query Engine:** Implementing a clean C# container `OfflineConnectivityQueryEngine` with automated assertions.
4. **Canonical Hard Problems:**
   - **[LeetCode 1697] Checking Existence of Edge Length Limited Paths (Hard)**
   - **[LeetCode 2421] Number of Good Paths (Hard)**

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│              DAY 167: OFFLINE QUERY REORDERING & MONOTONIC DSU EXPANSION                         │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       THE OFFLINE PARADIGM        │                             │    THE DUAL MONOTONIC SWEEP       │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Online: Queries answered in     │                             │ • Sort edges ascending by weight. │
│   arbitrary arrival order.        │ ── Query Reordering Bridge ─► • Sort queries ascending by limit. │
│ • Offline: Reorder queries by     │                             │ • Pointer edgeIdx moves forward.  │
│   weight limit.                   │                             │ • Add edges with weight < limit.  │
│ • Edges added monotonically!      │                             │ • Answer query via DSU.Find() in  │
│ • ZERO edge deletions required!   │                             │   O(α(N)) amortized time!         │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         PRODUCTION C# & PROBLEM SET         │
                          ├─────────────────────────────────────────────┤
                          │ • Production OfflineConnectivityQueryEngine │
                          │ • [LC 1697] Edge Length Limited Paths (Hard)│
                          │ • [LC 2421] Number of Good Paths (Hard)     │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🗝️ The Visual Mental Model: The Water Level Analogy

Visualize edge weights as the heights of underwater bridges, and query thresholds as the rising water level:

```
                    THE RISING THRESHOLD / WATER LEVEL MODEL

    Edges in Graph (Sorted by weight):
    Edge A (w = 2)    Edge B (w = 5)    Edge C (w = 8)    Edge D (w = 12)
    ──────▲─────────────────▲─────────────────▲─────────────────▲────────
          │                 │                 │                 │

    Incoming Queries (Sorted by limit):
    • Query 1 (Limit = 4):
      Add edges with weight < 4 -> Adds Edge A (w = 2).
      Check DSU: Is u1 connected to v1? Answer immediately!

    • Query 2 (Limit = 7):
      Water level rises! Add edges with 4 <= weight < 7 -> Adds Edge B (w = 5).
      Notice: Edge A is RETAINED! We never delete Edge A!
      Check DSU: Is u2 connected to v2? Answer immediately!

    • Query 3 (Limit = 10):
      Water level rises again! Add edges with 7 <= weight < 10 -> Adds Edge C (w = 8).
      Check DSU: Is u3 connected to v3? Answer immediately!
```

Because query thresholds increase monotonically:
$$\text{Limit}_1 \le \text{Limit}_2 \le \dots \le \text{Limit}_Q$$
The set of available edges **only expands**:
$$E_{\text{valid}}(\text{Limit}_1) \subseteq E_{\text{valid}}(\text{Limit}_2) \subseteq \dots \subseteq E_{\text{valid}}(\text{Limit}_Q)$$
This exact subset inclusion property matches DSU's native operation: **monotonic incremental union**!

---

### 1.2 🖼️ Visual Architecture: Original Index Preservation

When sorting queries by their threshold limit, their relative indices are permuted. However, the final output array must report answers matching the **original input order**!

We preserve original order by bundling each query with its original index $i$:
```
                    ORIGINAL INDEX PRESERVATION PIPELINE

   Original Queries:
   Index 0: [u=1, v=2, limit=15]
   Index 1: [u=0, v=3, limit=5]
   Index 2: [u=2, v=4, limit=10]

   Step 1: Augment with original index & sort by limit ascending:
   • Query Obj: [u=0, v=3, limit=5,  OrigIdx=1]
   • Query Obj: [u=2, v=4, limit=10, OrigIdx=2]
   • Query Obj: [u=1, v=2, limit=15, OrigIdx=0]

   Step 2: Process sequentially and write results directly to ans[OrigIdx]:
   • Process limit=5  -> ans[1] = DSU.Find(0) == DSU.Find(3)
   • Process limit=10 -> ans[2] = DSU.Find(2) == DSU.Find(4)
   • Process limit=15 -> ans[0] = DSU.Find(1) == DSU.Find(2)

   Step 3: Return ans array in original order!
```

---

### 1.3 5W1H Executive Architecture Blueprint: Offline DSU Queries

| Dimension | Architectural Specification |
| :--- | :--- |
| **1. WHAT** | An algorithm design pattern where queries are sorted offline by a monotonic parameter (e.g. weight, time, or value) so that DSU only performs insertions. |
| **2. WHY** | Eliminates the need for dynamic edge deletions or re-running full graph traversals ($O(Q \cdot (V + E))$), reducing runtime to $O(E \log E + Q \log Q + (E + Q)\alpha(V))$. |
| **3. WHEN** | Range-limited connectivity, threshold reachability, max-weight constrained paths, finding valid components under growing constraints. |
| **4. WHERE** | Primitive structs or tuples: `(int U, int V, int Limit, int OriginalIndex)[]` sorted via `Array.Sort`. Results populated into `bool[] ans`. |
| **5. WHO** | *"I convert dynamic threshold queries into offline batch operations. By sorting queries and edges by limit, edges are inserted monotonically into DSU, answering all queries in near-linear time without edge deletions."* |
| **6. HOW** | Sort edges ascending $\to$ sort queries with original indices $\to$ maintain two pointers `edgeIdx` and `qIdx` $\to$ insert edges where $w < \text{limit}$ $\to$ evaluate `Find(u) == Find(v)`. |

---

## 2. ⚙️ IMPLEMENT: Production Offline Query Engine

Here is the standalone, compilable C# implementation of `OfflineConnectivityQueryEngine` which encapsulates the dual monotonic sweep pattern with automated assertions.

```csharp
using System;
using System.Diagnostics;

namespace AdvancedGraphAlgorithms.Offline
{
    /// <summary>
    /// Production-grade engine to process threshold-limited connectivity queries offline.
    /// Eliminates dynamic edge deletions by sorting queries alongside edges.
    /// </summary>
    public sealed class OfflineConnectivityQueryEngine
    {
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

            public int CompareTo(WeightedEdge other) => Weight.CompareTo(other.Weight);
        }

        public readonly struct ThresholdQuery : IComparable<ThresholdQuery>
        {
            public readonly int U;
            public readonly int V;
            public readonly int Limit;
            public readonly int OriginalIndex;

            public ThresholdQuery(int u, int v, int limit, int originalIndex)
            {
                U = u;
                V = v;
                Limit = limit;
                OriginalIndex = originalIndex;
            }

            public int CompareTo(ThresholdQuery other) => Limit.CompareTo(other.Limit);
        }

        private sealed class FastDsu
        {
            private readonly int[] _parent;
            private readonly int[] _rank;

            public FastDsu(int n)
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

            public void Union(int x, int y)
            {
                int rx = Find(x);
                int ry = Find(y);
                if (rx == ry) return;

                if (_rank[rx] < _rank[ry]) _parent[rx] = ry;
                else if (_rank[rx] > _rank[ry]) _parent[ry] = rx;
                else
                {
                    _parent[ry] = rx;
                    _rank[rx]++;
                }
            }

            public bool IsConnected(int x, int y) => Find(x) == Find(y);
        }

        /// <summary>
        /// Executes batch offline connectivity queries under edge weight thresholds.
        /// </summary>
        public static bool[] ProcessQueries(int v, WeightedEdge[] edges, (int U, int V, int Limit)[] queries)
        {
            int qCount = queries.Length;
            var sortedQueries = new ThresholdQuery[qCount];
            for (int i = 0; i < qCount; i++)
            {
                sortedQueries[i] = new ThresholdQuery(queries[i].U, queries[i].V, queries[i].Limit, i);
            }

            // Sort both edges and queries: O(E log E + Q log Q)
            Array.Sort(edges);
            Array.Sort(sortedQueries);

            var dsu = new FastDsu(v);
            var results = new bool[qCount];
            int edgeIdx = 0;
            int totalEdges = edges.Length;

            // Dual monotonic sweep
            foreach (var q in sortedQueries)
            {
                while (edgeIdx < totalEdges && edges[edgeIdx].Weight < q.Limit)
                {
                    dsu.Union(edges[edgeIdx].U, edges[edgeIdx].V);
                    edgeIdx++;
                }

                results[q.OriginalIndex] = dsu.IsConnected(q.U, q.V);
            }

            return results;
        }

        public static void Main()
        {
            Console.WriteLine("==================================================");
            Console.WriteLine("RUNNING TEST SUITE: OfflineConnectivityQueryEngine");
            Console.WriteLine("==================================================");

            // 4 vertices: 0, 1, 2, 3
            // Edges: (0-1: 2), (1-2: 4), (2-3: 6)
            var edges = new[]
            {
                new WeightedEdge(0, 1, 2),
                new WeightedEdge(1, 2, 4),
                new WeightedEdge(2, 3, 6)
            };

            var queries = new[]
            {
                (U: 0, V: 2, Limit: 5), // Path 0-1-2 max edge is 4 < 5 -> TRUE
                (U: 0, V: 2, Limit: 3), // Requires edge 1-2 (w=4) >= 3 -> FALSE
                (U: 0, V: 3, Limit: 7), // Path 0-1-2-3 max edge is 6 < 7 -> TRUE
                (U: 1, V: 3, Limit: 6)  // Edge 2-3 is 6, limit is 6 (strictly less) -> FALSE
            };

            var answers = ProcessQueries(4, edges, queries);

            Debug.Assert(answers[0] == true);
            Debug.Assert(answers[1] == false);
            Debug.Assert(answers[2] == true);
            Debug.Assert(answers[3] == false);

            Console.WriteLine("✅ All OfflineConnectivityQueryEngine assertions passed!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Operational Deep-Dive (5 Dimensions)

### Dimension 1: Mathematical Contract & Asymptotic Proofs

| Query Strategy | Time Complexity per Query Batch | Graph Mutation Requirements |
| :--- | :--- | :--- |
| **Online (Arbitrary Order)** | $O(Q \cdot (V + E))$ | Requires edge additions and deletions (Dynamic Graph). |
| **Offline Sorted by Limit** | $\mathbf{O(E \log E + Q \log Q + (E + Q)\alpha(V))}$ | Strictly monotonic edge insertions (Static DSU). |

---

### Dimension 2: Step-by-Step Execution Trace ([LC 1697])

Edges: $e_1=(0,1, w=2), e_2=(1,2, w=5), e_3=(0,2, w=8)$.
Queries: $Q_0=(0, 2, \text{limit}=3), Q_1=(0, 2, \text{limit}=6)$.

| Step | Query Being Answered | Edges Added to DSU | DSU Components | `IsConnected(u, v)` | Result Written |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | $Q_0$: limit = 3 | $(0, 1, w=2)$ | $\{0, 1\}, \{2\}$ | `IsConnected(0, 2)` $\to$ `false` | `answer[0] = false` |
| 2 | $Q_1$: limit = 6 | $(1, 2, w=5)$ | $\{0, 1, 2\}$ | `IsConnected(0, 2)` $\to$ `true` | `answer[1] = true` |

---

### Dimension 3: Visual ASCII State Transitions

```
               MONOTONIC TWO-POINTER SWEEP PROGRESSION

    Edge List:    [ (0,1, w=2) ]    [ (1,2, w=5) ]    [ (0,2, w=8) ]
                         ▲                 ▲                 ▲
                         │                 │                 │
    Query Limits:     Limit = 3         Limit = 6         Limit = 10
                         │                 │                 │
                         ▼                 ▼                 ▼
    DSU State:       {0, 1}, {2}      {0, 1, 2}         {0, 1, 2}
    Connectivity:     0 ~ 2: NO         0 ~ 2: YES        0 ~ 2: YES
```

---

### Dimension 4: Invariant Preservation Proofs

1. **Threshold Safety Invariant:**
   When answering query $Q_k$ with limit $L_k$, the DSU contains *all* edges with weight $< L_k$ and *zero* edges with weight $\ge L_k$.
   - *Proof:* Queries are sorted in non-decreasing order of limit ($L_1 \le L_2 \le \dots \le L_Q$). Edges are sorted in non-decreasing order of weight. The inner pointer `edgeIdx` advances while `edgeList[edgeIdx].Weight < L_k`. Because $L_{k+1} \ge L_k$, the pointer never needs to decrement. Zero edges of weight $\ge L_k$ have been visited. Thus the invariant holds for every query.

---

### Dimension 5: Edge Case Analysis & Defense Matrix

| Edge Case Scenario | Potential Failure Mode | Defense Mechanism |
| :--- | :--- | :--- |
| **All Edges $\ge$ Limit** | Zero edges added into DSU; false positives if nodes initialized incorrectly. | DSU starts with every node in its own singleton; returns `false` unless $u == v$. |
| **Same Source and Target ($u == v$)** | Path of length 0 with zero edges required. | In LC 1697, problem specifies edge length limited path. If $u == v$, `IsConnected(u, u)` naturally returns `true`. |
| **Query Limit Exceeds All Edges** | Pointer out of bounds. | Guard `while (edgeIdx < totalEdges && ...)` prevents overflow. |

---

## 4. 🎬 DEMONSTRATE: Canonical LeetCode Walkthroughs

### 4.1 [LeetCode 1697] Checking Existence of Edge Length Limited Paths (Hard)

#### Problem Formulation
An undirected graph of $n$ nodes is given, numbered from $0$ to $n - 1$. You are given a 2D integer array `edgeList`, where `edgeList[i] = [u, v, dis]` denotes an edge of distance `dis`. You are also given a 2D integer array `queries`, where `queries[j] = [p, q, limit]`.
Return a boolean array `answer`, where `answer[j]` is `true` if there exists a path between $p$ and $q$ such that every edge along the path has distance strictly less than `limit`, or `false` otherwise.

#### Complete C# Implementation
```csharp
using System;

public sealed class DistanceLimitedPathsExistSolution
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

        public void Union(int x, int y)
        {
            int rx = Find(x);
            int ry = Find(y);
            if (rx == ry) return;

            if (_rank[rx] < _rank[ry]) _parent[rx] = ry;
            else if (_rank[rx] > _rank[ry]) _parent[ry] = rx;
            else
            {
                _parent[ry] = rx;
                _rank[rx]++;
            }
        }

        public bool IsConnected(int x, int y) => Find(x) == Find(y);
    }

    private readonly struct Query : IComparable<Query>
    {
        public readonly int U;
        public readonly int V;
        public readonly int Limit;
        public readonly int OriginalIndex;

        public Query(int u, int v, int limit, int originalIndex)
        {
            U = u;
            V = v;
            Limit = limit;
            OriginalIndex = originalIndex;
        }

        public int CompareTo(Query other) => Limit.CompareTo(other.Limit);
    }

    public bool[] DistanceLimitedPathsExist(int n, int[][] edgeList, int[][] queries)
    {
        // 1. Sort edges by distance ascending: O(E log E)
        Array.Sort(edgeList, (a, b) => a[2].CompareTo(b[2]));

        // 2. Wrap queries with their original indices and sort by limit ascending: O(Q log Q)
        int qCount = queries.Length;
        var sortedQueries = new Query[qCount];
        for (int i = 0; i < qCount; i++)
        {
            sortedQueries[i] = new Query(queries[i][0], queries[i][1], queries[i][2], i);
        }
        Array.Sort(sortedQueries);

        var dsu = new Dsu(n);
        var answer = new bool[qCount];
        int edgeIdx = 0;
        int totalEdges = edgeList.Length;

        // 3. Two-pointer sweep: monotonically add edges whose distance < query.Limit
        foreach (var q in sortedQueries)
        {
            while (edgeIdx < totalEdges && edgeList[edgeIdx][2] < q.Limit)
            {
                dsu.Union(edgeList[edgeIdx][0], edgeList[edgeIdx][1]);
                edgeIdx++;
            }

            // Answer query via DSU connectivity check
            answer[q.OriginalIndex] = dsu.IsConnected(q.U, q.V);
        }

        return answer;
    }
}
```

#### Complexity Analysis
- **Time Complexity:**
  - Sorting edges: $O(E \log E)$.
  - Sorting queries: $O(Q \log Q)$.
  - Monotonic DSU insertions: $O(E \cdot \alpha(V))$.
  - Answering queries: $O(Q \cdot \alpha(V))$.
  - Total Time: $\mathbf{O(E \log E + Q \log Q + (E + Q) \alpha(V))}$.
- **Space Complexity:** $O(V + Q)$ for DSU arrays and sorted queries buffer.

---

### 4.2 [LeetCode 2421] Number of Good Paths (Hard)

#### Problem Formulation
There is a tree consisting of $n$ nodes numbered from $0$ to $n - 1$ and $n - 1$ edges. Given array `vals` where `vals[i]` is the value of the $i$-th node. A **good path** is a simple path starting and ending at nodes with the same value, where all intermediate nodes have values $\le$ endpoint values. Return the number of distinct good paths.

```csharp
using System;
using System.Collections.Generic;

public sealed class NumberOfGoodPathsSolution
{
    private sealed class Dsu
    {
        public readonly int[] Parent;
        public readonly int[] Count;

        public Dsu(int n)
        {
            Parent = new int[n];
            Count = new int[n];
            for (int i = 0; i < n; i++)
            {
                Parent[i] = i;
                Count[i] = 1;
            }
        }

        public int Find(int x)
        {
            if (Parent[x] != x) Parent[x] = Find(Parent[x]);
            return Parent[x];
        }
    }

    public int NumberOfGoodPaths(int[] vals, int[][] edges)
    {
        int n = vals.Length;
        var adj = new List<int>[n];
        for (int i = 0; i < n; i++) adj[i] = new List<int>();

        foreach (var edge in edges)
        {
            adj[edge[0]].Add(edge[1]);
            adj[edge[1]].Add(edge[0]);
        }

        var valToNodes = new SortedDictionary<int, List<int>>();
        for (int i = 0; i < n; i++)
        {
            if (!valToNodes.TryGetValue(vals[i], out var list))
            {
                list = new List<int>();
                valToNodes[vals[i]] = list;
            }
            list.Add(i);
        }

        var dsu = new Dsu(n);
        int totalGoodPaths = n;

        foreach (var (val, nodes) in valToNodes)
        {
            foreach (int u in nodes)
            {
                foreach (int v in adj[u])
                {
                    if (vals[v] <= vals[u])
                    {
                        int rootU = dsu.Find(u);
                        int rootV = dsu.Find(v);

                        if (rootU != rootV)
                        {
                            if (vals[rootU] == vals[rootV])
                            {
                                totalGoodPaths += dsu.Count[rootU] * dsu.Count[rootV];
                                dsu.Parent[rootV] = rootU;
                                dsu.Count[rootU] += dsu.Count[rootV];
                            }
                            else if (vals[rootU] > vals[rootV])
                            {
                                dsu.Parent[rootV] = rootU;
                            }
                            else
                            {
                                dsu.Parent[rootU] = rootV;
                            }
                        }
                    }
                }
            }
        }

        return totalGoodPaths;
    }
}
```

#### Complexity Analysis
- **Time Complexity:** $O(N \log N + N \alpha(N)) = O(N \log N)$.
- **Space Complexity:** $O(N)$ for adjacency list and DSU state.

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Swim in Rising Water ([LeetCode 778] - Hard)
- **Constraint:** $N \times N$ elevation grid. Time $t$ allows walking on cells with elevation $\le t$. Find min time to reach bottom-right.
- **Offline DSU Strategy:** Sort all grid cells by elevation. As time increments, union cell with adjacent already-submerged cells until $(0, 0)$ is connected to $(N-1, N-1)$!

### Exercise 2: Path With Minimum Effort ([LeetCode 1631] - Medium)
- **Constraint:** Find path minimizing the maximum absolute height difference between consecutive cells.
- **Offline DSU Strategy:** Generate all grid edges with weight $|h_1 - h_2|$. Sort edges ascending, union in DSU until start is connected to target!

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
                     OFFLINE VS ONLINE GRAPH DECISION TREE

                Can you inspect all queries before returning answers?
                                  /       \
                                YES        NO
                                /           \
                 Are edges dynamically      Do you have edge deletions?
                     threshold-filtered?              /      \
                         /       \                  YES       NO
                       YES        NO                /          \
                [Offline DSU]  [Standard DSU]  [Link-Cut Tree] [Online BFS]
```

---

## 7. 🎯 Daily Checkpoint Questions

### Diagnostic Question
Why does sorting queries offline enable DSU to answer edge-weight limited path queries without requiring edge deletions?

### Architectural Model Answer
1. **The Dynamic Connectivity Bottleneck:**
   Standard DSU is strictly additive—it supports set unions in near-constant time, but edge deletions require maintaining persistent histories or dynamic link-cut trees, which carry substantial complexity. If queries with different thresholds arrive in random order, edges would need to be added and deleted constantly.
2. **Monotonicity via Offline Sorting:**
   By collecting all queries upfront and sorting them in ascending order of their weight threshold ($L_1 \le L_2 \le \dots \le L_Q$), the subset of valid edges eligible for use is monotonically non-decreasing:
   $$E_{\text{valid}}(L_1) \subseteq E_{\text{valid}}(L_2) \subseteq \dots \subseteq E_{\text{valid}}(L_Q)$$
3. **Zero Deletions:**
   Because the valid edge set only grows, we advance an edge pointer to add newly eligible edges into the DSU. An edge inserted for query $Q_k$ is guaranteed to remain valid for all subsequent queries $Q_{k+1}, Q_{k+2}, \dots, Q_Q$. Thus, edge deletions are completely eliminated, and all $Q$ queries are answered in $O((E + Q) \alpha(V))$ amortized time.
