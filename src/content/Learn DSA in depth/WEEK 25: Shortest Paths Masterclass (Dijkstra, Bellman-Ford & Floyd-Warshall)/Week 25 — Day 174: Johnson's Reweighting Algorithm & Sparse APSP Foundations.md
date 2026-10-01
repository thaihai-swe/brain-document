---
title: "Week 25 — Day 174: Johnson's Reweighting Algorithm & Sparse APSP Foundations"
---

# Week 25 — Day 174: Johnson's Reweighting Algorithm & Sparse APSP Foundations

Welcome to **Day 174 of your DSA Mastery Journey**!

Yesterday, you mastered the **Floyd-Warshall Algorithm**, which computes All-Pairs Shortest Paths (APSP) in $\Theta(V^3)$ time and handles negative edges. Floyd-Warshall is ideal for small, dense graphs ($V \le 400$).

However, modern enterprise graphs—such as the internet router topology, road navigation networks, and distributed service dependency maps—are almost universally **sparse** ($|E| \ll V^2$, often $|E| \approx 2V$ to $5V$). On a sparse graph with $V = 10,000$ vertices and $E = 30,000$ edges:
- Floyd-Warshall requires $V^3 = (10,000)^3 = 10^{12}$ operations—catastrophic failure!
- If all edge weights were non-negative, running Dijkstra from every vertex ($V \times \text{Dijkstra}$) would take:
  $$O(V \cdot (V + E) \log V) \approx 10^4 \times (40,000) \times 14 \approx 5.6 \times 10^9 \text{ operations}$$
  Vastly faster!
- But what if the graph contains **negative edge weights**? Dijkstra cannot be run!

In 1977, American computer scientist Donald B. Johnson published a stroke of algorithmic genius: **Johnson's Reweighting Algorithm**. 

Johnson's algorithm combines **Bellman-Ford vertex potentials** with **$V$ runs of Dijkstra**, solving All-Pairs Shortest Paths on sparse graphs with negative edges in **$O(V \cdot E \log V)$ time**!

Today, you will master:
1. **The Vertex Potential Field Analogy:** How potential energy functions from physics eliminate negative edges without altering shortest paths.
2. **The Telescoping Path Cancellation Theorem:** Proving why adding $h(u) - h(v)$ to every edge preserves exact shortest path topologies.
3. **The Non-Negativity Proof via Triangle Inequality:** Proving that setting $h(u) = \delta(s, u)$ via a single Bellman-Ford pass guarantees $\hat{w}(u, v) \ge 0$.
4. **From-Scratch C# Container:** Building `JohnsonApspSolver` with virtual super-source augmentation and automated self-validating assertions.
5. **Canonical Problem Mastery:** Conquering **[LeetCode 1514] Path with Maximum Probability (Medium)** via logarithmic potential reweighting.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   DAY 174: JOHNSON'S REWEIGHTING & SPARSE ALL-PAIRS SHORTEST PATHS               │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       THE POTENTIAL FIELD CONCEPT │                             │      THE 5-STEP JOHNSON PIPELINE  │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Physics analogy: Elevation h(u).│                             │ 1. Add virtual super-source s.    │
│ • Reweighted edge:                │ ── Telescoping Proof ─────► │ 2. Run Bellman-Ford from s -> h(u)│
│   w'(u, v) = w(u, v) + h(u) - h(v)│                             │ 3. Reweight: w' = w + h(u) - h(v).│
│ • By Triangle Inequality:         │                             │    All w' are strictly ≥ 0!       │
│   h(v) ≤ h(u) + w(u, v)           │                             │ 4. Run Dijkstra V times!          │
│   => w'(u, v) ≥ 0 GUARANTEED!     │                             │ 5. Restore true distances:        │
│ • Intermediate potentials cancel! │                             │    dist(u, v) = dist' - h(u)+ h(v)│
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         PRODUCTION C# & PROBLEM SET         │
                          ├─────────────────────────────────────────────┤
                          │ • Production JohnsonApspSolver Container    │
                          │ • Sparse APSP Performance Benchmarks        │
                          │ • [LC 1514] Path with Max Probability (Med) │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🗝️ The Visual Mental Model: Topographical Elevation Fields

Why does adding a constant $C$ to every edge fail, while adding a vertex potential difference $h(u) - h(v)$ succeed?

Imagine walking between cities on a hilly continent.
- Let $h(u)$ represent the **physical elevation (height above sea level)** of city $u$.
- When you hike from city $u$ to city $v$, you experience:
  1. The base road exertion $w(u, v)$.
  2. The gravitational potential change: you start at elevation $h(u)$ and finish at elevation $h(v)$, giving a net elevation change of $h(u) - h(v)$.

```
                    TELESCOPING POTENTIAL CANCELLATION

         City A                    City B                    City C
      (Elev = 100m)             (Elev = 300m)             (Elev = 150m)
           [ A ] ────────────────► [ B ] ────────────────► [ C ]
                   Road w(A, B)              Road w(B, C)

    Reweighted Edge 1: w'(A, B) = w(A, B) + h(A) - h(B)
    Reweighted Edge 2: w'(B, C) = w(B, C) + h(B) - h(C)

    Total Reweighted Path Cost:
    w'(Path) = w'(A, B) + w'(B, C)
             = [w(A, B) + h(A) - h(B)] + [w(B, C) + h(B) - h(C)]
             = w(A, B) + w(B, C) + h(A) + (-h(B) + h(B)) - h(C)
             = w(Original Path) + h(A) - h(C)!

    NOTICE:
    The intermediate elevation h(B) CANCELS OUT COMPLETELY!
    The total reweighted cost depends ONLY on the original cost and the endpoints A and C!
```

Because **every** path from $A$ to $C$ has its cost modified by the exact same quantity $+ (h(A) - h(C))$, the relative ranking of all paths between $A$ and $C$ is **100% preserved**!
The path that was shortest in the original graph remains the shortest in the reweighted graph!

---

### 1.2 🧮 Mathematical Proofs: Non-Negativity & Shortest Path Preservation

#### Theorem 1 (Path Equivalence Theorem):
> Let $P = (v_0, v_1, v_2, \dots, v_k)$ be any path from $u = v_0$ to $v = v_k$. Under the reweighting $\hat{w}(x, y) = w(x, y) + h(x) - h(y)$, the length of path $P$ satisfies:
> $$\hat{w}(P) = w(P) + h(u) - h(v)$$

#### Proof:
Expand the sum of reweighted edge costs along path $P$:
$$\hat{w}(P) = \sum_{i=1}^k \hat{w}(v_{i-1}, v_i) = \sum_{i=1}^k \left[ w(v_{i-1}, v_i) + h(v_{i-1}) - h(v_i) \right]$$
Separate the sums:
$$\hat{w}(P) = \sum_{i=1}^k w(v_{i-1}, v_i) + \sum_{i=1}^k \left( h(v_{i-1}) - h(v_i) \right)$$
The second sum is a telescoping series:
$$\sum_{i=1}^k (h(v_{i-1}) - h(v_i)) = (h(v_0) - h(v_1)) + (h(v_1) - h(v_2)) + \dots + (h(v_{k-1}) - h(v_k)) = h(v_0) - h(v_k)$$
Since $v_0 = u$ and $v_k = v$:
$$\hat{w}(P) = w(P) + h(u) - h(v)$$
Because $h(u) - h(v)$ is a constant for any fixed pair of endpoints $(u, v)$, a path $P^*$ minimizes $w(P)$ if and only if it minimizes $\hat{w}(P)$. $\blacksquare$

---

#### Theorem 2 (Non-Negativity Theorem):
> If we introduce a virtual super-source $s$ with zero-weight directed edges $(s, v, 0)$ to all $v \in V$, and define $h(u) = \delta(s, u)$ (the shortest path distance from $s$ to $u$), then for every directed edge $(u, v) \in E$:
> $$\hat{w}(u, v) = w(u, v) + h(u) - h(v) \ge 0$$

#### Proof:
1. By the **Triangle Inequality** of shortest paths, the shortest distance from $s$ to $v$ cannot exceed the shortest distance from $s$ to $u$ plus the edge weight $w(u, v)$:
   $$\delta(s, v) \le \delta(s, u) + w(u, v)$$
2. Substitute the definition $h(x) = \delta(s, x)$:
   $$h(v) \le h(u) + w(u, v)$$
3. Subtract $h(v)$ from both sides:
   $$0 \le w(u, v) + h(u) - h(v)$$
4. Since $\hat{w}(u, v) = w(u, v) + h(u) - h(v)$, we have:
   $$\hat{w}(u, v) \ge 0$$
This completes the proof. Every reweighted edge is guaranteed non-negative! $\blacksquare$

---

### 1.3 🖼️ Visual Mechanics: The 5-Stage Johnson Algorithmic Pipeline

```
                    THE 5 STAGES OF JOHNSON'S ALGORITHM

    STAGE 1: Augment Graph with Virtual Super-Source [ s ]
             Add edges (s -> v) with weight 0 for every v in V.

    STAGE 2: Single Bellman-Ford Run from s
             Computes vertex potentials h(u) for all u in V.
             * If a negative cycle exists, Bellman-Ford reports it and halts!

    STAGE 3: Edge Reweighting
             For every edge (u, v):
             w'(u, v) = w(u, v) + h(u) - h(v)  [All w' >= 0!]

    STAGE 4: Run Dijkstra V Times!
             For each vertex u in V:
             Run Dijkstra(u) on graph with weights w' in O((V + E) log V).

    STAGE 5: Un-weight Distances Back to True Metric
             For every pair (u, v):
             dist(u, v) = dist'(u, v) - h(u) + h(v).
```

---

### 1.4 5W1H Executive Architecture Blueprint: Johnson's Reweighting

| Dimension | Architectural Specification |
| :--- | :--- |
| **1. WHAT** | An All-Pairs Shortest Path algorithm that reweights edges using Bellman-Ford vertex potentials to eliminate negative edges, then executes Dijkstra $V$ times. |
| **2. WHY** | Floyd-Warshall is $O(V^3)$, which is horribly slow on sparse graphs. Johnson's runs in $O(V \cdot E \log V)$, which beats Floyd-Warshall whenever $E \ll V^2 / \log V$. |
| **3. WHEN** | Sparse networks ($E = O(V)$) with potential negative edge weights, all-pairs routing on airline/transport networks with rebates, sparse APSP queries. |
| **4. WHERE** | Array-backed structures: `int[] h` for potentials, adjacency list with reweighted weights, and `int[V, V]` final distance matrix. |
| **5. WHO** | *"For sparse graphs with negative edge weights, I use Johnson's algorithm. By computing vertex potentials with one Bellman-Ford pass, all edges become non-negative, allowing $V \times$ Dijkstra to compute APSP in $O(VE \log V)$."* |
| **6. HOW** | Virtual source $s \to$ Bellman-Ford computes $h \to$ reweight $w' = w + h(u) - h(v) \to V \times$ Dijkstra $\to$ restore $dist(u, v) = dist' - h(u) + h(v)$. |

---

## 2. ⚙️ IMPLEMENT: Production-Grade Container

Here is the production-grade, standalone compilable C# implementation of `JohnsonApspSolver` featuring virtual node augmentation, Bellman-Ford potential calculation, $V \times$ Dijkstra, and automated self-validating assertions.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedGraphAlgorithms.ShortestPaths
{
    /// <summary>
    /// Production-grade implementation of Johnson's Reweighting Algorithm
    /// for All-Pairs Shortest Paths on sparse graphs with negative weights.
    /// Time Complexity: O(V * E log V).
    /// Space Complexity: O(V^2 + E).
    /// </summary>
    public sealed class JohnsonApspSolver
    {
        public const int Infinity = 1_000_000_000;

        public readonly struct DirectedEdge
        {
            public readonly int From;
            public readonly int To;
            public readonly int Weight;

            public DirectedEdge(int from, int to, int weight)
            {
                From = from;
                To = to;
                Weight = weight;
            }
        }

        public sealed class Result
        {
            public bool HasNegativeCycle { get; }
            public int[,] Distances { get; }

            public Result(bool hasCycle, int[,] dist)
            {
                HasNegativeCycle = hasCycle;
                Distances = dist;
            }
        }

        /// <summary>
        /// Computes All-Pairs Shortest Paths using Johnson's Algorithm.
        /// </summary>
        /// <param name="v">Number of vertices [0 .. v-1].</param>
        /// <param name="edges">Collection of directed edges.</param>
        public static Result Compute(int v, List<DirectedEdge> edges)
        {
            if (v <= 0) throw new ArgumentOutOfRangeException(nameof(v));

            // STAGE 1 & 2: Add virtual super-source (vertex v) and run Bellman-Ford
            int superSource = v;
            var augmentedEdges = new List<DirectedEdge>(edges.Count + v);
            augmentedEdges.AddRange(edges);

            for (int i = 0; i < v; i++)
            {
                augmentedEdges.Add(new DirectedEdge(superSource, i, 0));
            }

            var h = new int[v + 1];
            Array.Fill(h, Infinity);
            h[superSource] = 0;

            // Bellman-Ford across v + 1 vertices
            for (int round = 1; round <= v; round++)
            {
                bool anyRelaxation = false;
                foreach (var edge in augmentedEdges)
                {
                    int u = edge.From;
                    int to = edge.To;
                    int w = edge.Weight;

                    if (h[u] != Infinity && h[u] + w < h[to])
                    {
                        h[to] = h[u] + w;
                        anyRelaxation = true;
                    }
                }
                if (!anyRelaxation) break;
            }

            // Check for negative cycles
            foreach (var edge in augmentedEdges)
            {
                int u = edge.From;
                int to = edge.To;
                int w = edge.Weight;

                if (h[u] != Infinity && h[u] + w < h[to])
                {
                    // Negative cycle detected!
                    return new Result(true, new int[v, v]);
                }
            }

            // STAGE 3: Build reweighted adjacency list: w'(u, v) = w(u, v) + h(u) - h(v) >= 0
            var reweightedAdj = new List<(int To, int Weight)>[v];
            for (int i = 0; i < v; i++) reweightedAdj[i] = new List<(int, int)>();

            foreach (var edge in edges)
            {
                int reweighted = edge.Weight + h[edge.From] - h[edge.To];
                Debug.Assert(reweighted >= 0, "Reweighted edge must be non-negative!");
                reweightedAdj[edge.From].Add((edge.To, reweighted));
            }

            // STAGE 4 & 5: Run Dijkstra V times and restore true distances
            var allDistances = new int[v, v];

            for (int src = 0; src < v; src++)
            {
                var dPrime = RunDijkstra(v, reweightedAdj, src);

                for (int dst = 0; dst < v; dst++)
                {
                    if (dPrime[dst] >= Infinity)
                    {
                        allDistances[src, dst] = Infinity;
                    }
                    else
                    {
                        // Restore: dist(u, v) = dist'(u, v) - h(u) + h(v)
                        allDistances[src, dst] = dPrime[dst] - h[src] + h[dst];
                    }
                }
            }

            return new Result(false, allDistances);
        }

        private static int[] RunDijkstra(int v, List<(int To, int Weight)>[] adj, int src)
        {
            var dist = new int[v];
            Array.Fill(dist, Infinity);
            dist[src] = 0;

            var pq = new PriorityQueue<int, int>();
            pq.Enqueue(src, 0);

            while (pq.Count > 0)
            {
                pq.TryDequeue(out int u, out int d);
                if (d > dist[u]) continue;

                foreach (var (next, weight) in adj[u])
                {
                    if (dist[u] + weight < dist[next])
                    {
                        dist[next] = dist[u] + weight;
                        pq.Enqueue(next, dist[next]);
                    }
                }
            }

            return dist;
        }

        // ====================================================================
        // SELF-VALIDATING TEST SUITE
        // ====================================================================
        public static void Main()
        {
            Console.WriteLine("==================================================");
            Console.WriteLine("RUNNING TEST SUITE: JohnsonApspSolver");
            Console.WriteLine("==================================================");

            // Graph with negative edges but NO negative cycles
            // 0 -> 1 (w=-2)
            // 1 -> 2 (w=-1)
            // 2 -> 0 (w=4)  => Cycle: -2 - 1 + 4 = 1 > 0 (Positive)
            // 0 -> 2 (w=3)
            var edges = new List<DirectedEdge>
            {
                new DirectedEdge(0, 1, -2),
                new DirectedEdge(1, 2, -1),
                new DirectedEdge(2, 0, 4),
                new DirectedEdge(0, 2, 3)
            };

            var res = Compute(3, edges);
            Debug.Assert(res.HasNegativeCycle == false);

            // Shortest path 0 -> 2: 0 -> 1 -> 2 with cost (-2) + (-1) = -3 (beats direct 3!)
            Debug.Assert(res.Distances[0, 2] == -3, $"Expected -3, got {res.Distances[0, 2]}");
            Debug.Assert(res.Distances[0, 1] == -2);
            Debug.Assert(res.Distances[1, 2] == -1);
            Debug.Assert(res.Distances[2, 0] == 4);

            Console.WriteLine("✅ All JohnsonApspSolver assertions passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Operational Deep-Dive (5 Dimensions)

### Dimension 1: Mathematical Contract & Asymptotic Proofs

| Phase | Operation | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- |
| **Phase 1: Super-Source Setup** | Add vertex $s$ and $V$ zero-weight edges | $\Theta(V)$ | $\Theta(V)$ |
| **Phase 2: Bellman-Ford** | Run BF once on augmented graph | $\Theta(V \cdot E)$ | $\Theta(V)$ |
| **Phase 3: Reweighting** | Compute $w'(u, v) = w + h(u) - h(v)$ | $\Theta(E)$ | $\Theta(E)$ |
| **Phase 4: $V \times$ Dijkstra** | $V$ independent Dijkstra invocations | $\mathbf{\Theta(V \cdot E \log V)}$ | $\Theta(V + E)$ |
| **Phase 5: Distance Restoration**| Unweight $V^2$ entries | $\Theta(V^2)$ | $\Theta(V^2)$ |
| **Overall Total** | — | $\mathbf{\Theta(V \cdot E \log V)}$ | $\mathbf{\Theta(V^2)}$ |

#### When does Johnson beat Floyd-Warshall?
Floyd-Warshall takes $\Theta(V^3)$.
Johnson takes $\Theta(V \cdot E \log V)$.
Comparing runtimes:
$$V \cdot E \log V < V^3 \iff E < \frac{V^2}{\log V}$$
When $V = 10,000$ and $E = 50,000$:
- Floyd-Warshall: $10^{12}$ ops.
- Johnson's: $10,000 \times 50,000 \times 14 \approx 7 \times 10^9$ ops ($> 140\times$ faster!).

---

### Dimension 2: Step-by-Step Execution Trace

Graph: $V = 3$. Edges: $0 \to 1 (-2), 1 \to 2 (-1), 2 \to 0 (4)$.

| Vertex | Bellman-Ford Potential $h(v)$ | Calculation |
| :---: | :---: | :--- |
| $s$ (Super-source) | $0$ | Root |
| 0 | $0$ | Direct edge from $s$ |
| 1 | $-2$ | Path: $s \to 0 \to 1$ (cost $0 - 2 = -2$) |
| 2 | $-3$ | Path: $s \to 0 \to 1 \to 2$ (cost $0 - 2 - 1 = -3$) |

#### Edge Reweighting:
1. Edge $(0 \to 1, w=-2)$: $\hat{w} = -2 + h(0) - h(1) = -2 + 0 - (-2) = \mathbf{0} \ge 0$!
2. Edge $(1 \to 2, w=-1)$: $\hat{w} = -1 + h(1) - h(2) = -1 + (-2) - (-3) = \mathbf{0} \ge 0$!
3. Edge $(2 \to 0, w=4)$: $\hat{w} = 4 + h(2) - h(0) = 4 + (-3) - 0 = \mathbf{1} \ge 0$!
**All edge weights are strictly $\ge 0$! Dijkstra can now run safely!**

---

### Dimension 3: Visual ASCII State Transitions

```
               THE JOHNSON POTENTIAL FIELD TRANSFORMATION

    Original Graph (Negative Weights):
    [ 0 ] ────── (-2) ──────► [ 1 ] ────── (-1) ──────► [ 2 ]
      ▲                                                   │
      └────────────────────── (4) ────────────────────────┘

    After Super-Source Bellman-Ford:
    h(0) = 0,   h(1) = -2,   h(2) = -3

    Reweighted Non-Negative Graph:
    [ 0 ] ─────── (0) ──────► [ 1 ] ─────── (0) ──────► [ 2 ]
      ▲                                                   │
      └─────────────────────── (1) ───────────────────────┘

    Running Dijkstra from 0 to 2 gives:
    dist'(0, 2) = 0 + 0 = 0.

    Restore True Distance:
    dist(0, 2) = dist'(0, 2) - h(0) + h(2) = 0 - 0 + (-3) = -3!
```

---

### Dimension 4: Invariant Preservation Proofs

1. **Non-Negative Invariant:**
   $\hat{w}(u, v) \ge 0$ for all $(u, v) \in E$.
   - *Proof:* Established via Theorem 2 in Section 1.2.
2. **Path Topology Invariant:**
   For any two paths $P_1, P_2$ connecting $u$ to $v$, $w(P_1) < w(P_2) \iff \hat{w}(P_1) < \hat{w}(P_2)$.
   - *Proof:* Follows directly from $\hat{w}(P) = w(P) + h(u) - h(v)$ (Theorem 1). Adding the same constant to all paths preserves their strict ordering.

---

### Dimension 5: Edge Case Analysis & Defense Matrix

| Edge Case Scenario | Potential Failure Mode | Built-in Defense Mechanism |
| :--- | :--- | :--- |
| **Negative Weight Cycle** | Infinite loop in Bellman-Ford. | Bellman-Ford checks pass $V+1$; reports cycle and terminates gracefully. |
| **Disconnected Components** | Unreachable vertices have $\infty$ in Bellman-Ford. | Virtual super-source $s$ connects to *every* node with weight 0, guaranteeing every node is reachable. |
| **Integer Overflow on $d' - h(u) + h(v)$** | Arithmetic overflow with large weights. | Define `Infinity = 1_000_000_000` with bounds checks before subtraction. |

---

## 4. 🎬 DEMONSTRATE: Canonical LeetCode Walkthroughs

### 4.1 [LeetCode 1514] Path with Maximum Probability (Medium)

#### Problem Formulation
You are given an undirected weighted graph of $n$ nodes, represented by an edge list `edges` where `edges[i] = [a, b]` with probability `succProb[i]` between $0$ and $1$. Given two nodes `start` and `end`, find the path with the **maximum probability** of success. If no path exists, return `0`.

#### The Logarithmic Potential Transformation
Maximizing a product $\prod P_i$ where $0 \le P_i \le 1$:
- Take $-\log_{10}(P_i)$: Since $P_i \le 1$, $-\log_{10}(P_i) \ge 0$.
- Maximizing product $\prod P_i \iff$ Minimizing sum $\sum (-\log_{10} P_i)$.
- Direct Max-Heap Dijkstra on raw probabilities $P_i$ avoids floating-point logarithms!

```csharp
using System;
using System.Collections.Generic;

public sealed class PathWithMaxProbabilitySolution
{
    public double MaxProbability(int n, int[][] edges, double[] succProb, int start, int end)
    {
        // 1. Build adjacency list
        var adj = new List<(int To, double Prob)>[n];
        for (int i = 0; i < n; i++) adj[i] = new List<(int, double)>();

        for (int i = 0; i < edges.Length; i++)
        {
            int u = edges[i][0];
            int v = edges[i][1];
            double p = succProb[i];
            adj[u].Add((v, p));
            adj[v].Add((u, p));
        }

        // 2. Max-Probability array
        var maxProb = new double[n];
        maxProb[start] = 1.0;

        // PriorityQueue ordered by probability descending (negate for min-heap)
        var pq = new PriorityQueue<int, double>();
        pq.Enqueue(start, -1.0); // Negate 1.0 -> -1.0

        while (pq.Count > 0)
        {
            pq.TryDequeue(out int u, out double negP);
            double currP = -negP;

            if (currP < maxProb[u]) continue;
            if (u == end) return currP; // Early exit!

            foreach (var (next, edgeP) in adj[u])
            {
                double nextP = currP * edgeP;
                if (nextP > maxProb[next])
                {
                    maxProb[next] = nextP;
                    pq.Enqueue(next, -nextP);
                }
            }
        }

        return 0.0;
    }
}
```

#### Complexity Analysis
- **Time Complexity:** $O((V + E) \log V)$.
- **Space Complexity:** $O(V + E)$.

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: All-Pairs Shortest Paths on Sparse Graph (CSES 1196)
- **Challenge:** Solve all-pairs shortest paths on a graph with $V = 2500, E = 5000$ containing negative edges.
- **Why Johnson's Wins:** Floyd-Warshall requires $2500^3 \approx 1.56 \times 10^{10}$ ops (TLE!). Johnson's requires $2500 \times 5000 \times 12 \approx 1.5 \times 10^8$ ops, passing effortlessly!

### Exercise 2: Modified Dijkstra for Arbitrary Potentials
- **Challenge:** Prove that if any valid potential function $h$ is known a priori (e.g. Euclidean distance heuristic to target), one can run Dijkstra without Bellman-Ford! (This forms the exact foundation of **A\* Search** on Day 177!).

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
                     ALL-PAIRS SHORTEST PATHS DECISION TREE

                         Is the graph sparse (E ≪ V²)?
                                    /       \
                                  YES        NO
                                  /           \
                     Do negative edges exist?  [Floyd-Warshall]
                            /        \         O(V³) time, O(V²) space
                          YES         NO
                          /            \
                  [Johnson's APSP]   [V × Dijkstra]
                   O(VE log V)        O(V(V+E)log V)
```

---

## 7. 🎯 Daily Checkpoint Questions

### Diagnostic Question
Prove that Johnson's edge reweighting formula $w'(u, v) = w(u, v) + h(u) - h(v)$ preserves the relative shortest paths between all pairs of vertices.

### Architectural Model Answer
1. **Telescoping Sum across Paths:**
   Let $P = (v_0, v_1, \dots, v_k)$ be an arbitrary path connecting source $u = v_0$ to destination $v = v_k$. The reweighted path cost $\hat{w}(P)$ is the sum of reweighted edge costs:
   $$\hat{w}(P) = \sum_{i=1}^k \hat{w}(v_{i-1}, v_i) = \sum_{i=1}^k \left[ w(v_{i-1}, v_i) + h(v_{i-1}) - h(v_i) \right]$$
2. **Intermediate Cancellation:**
   Grouping the terms:
   $$\hat{w}(P) = \sum_{i=1}^k w(v_{i-1}, v_i) + \sum_{i=1}^k \left( h(v_{i-1}) - h(v_i) \right)$$
   The second sum expands as $(h(v_0) - h(v_1)) + (h(v_1) - h(v_2)) + \dots + (h(v_{k-1}) - h(v_k))$. All internal potentials $h(v_1), \dots, h(v_{k-1})$ cancel out telescopically, leaving:
   $$\hat{w}(P) = w(P) + h(u) - h(v)$$
3. **Preservation of Shortest Path:**
   For any fixed source $u$ and destination $v$, the term $h(u) - h(v)$ is a fixed constant that depends strictly on the endpoints, completely independent of the choice of path $P$.
   Therefore, for any two candidate paths $P_1$ and $P_2$ from $u$ to $v$:
   $$w(P_1) < w(P_2) \iff \hat{w}(P_1) < \hat{w}(P_2)$$
   The path that minimizes the reweighted cost $\hat{w}(P)$ is guaranteed to be the exact path that minimizes the original cost $w(P)$.
