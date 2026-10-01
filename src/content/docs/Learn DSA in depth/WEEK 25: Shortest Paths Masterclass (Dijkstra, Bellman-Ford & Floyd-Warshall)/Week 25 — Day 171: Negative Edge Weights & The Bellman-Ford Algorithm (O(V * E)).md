---
title: "Week 25 — Day 171: Negative Edge Weights & The Bellman-Ford Algorithm (O(V * E))"
---

# Week 25 — Day 171: Negative Edge Weights & The Bellman-Ford Algorithm ($O(V \cdot E)$)

Welcome to **Day 171 of your DSA Mastery Journey**!

Over the past two days, you mastered **Dijkstra's Algorithm** for both general graphs and 2D spatial grids. Dijkstra is exceptionally fast—running in $O((V + E) \log V)$—because it makes an irrevocable **greedy choice**: once a vertex is popped from the min-priority queue, its distance is finalized and never relaxed again.

However, this greedy finalization fundamentally relies on an uncompromising precondition: **all edge weights must be non-negative ($w \ge 0$)**.

What happens when edges can have negative weights?
- In financial markets, a directed edge represents a currency trade with transactional rebates or arbitrage yields.
- In transportation networks, an edge represents a flight that awards frequent flyer mileage credits ($-\$$).
- In electronic circuit design, active components (e.g. amplifiers) supply negative resistance or voltage boosts.

If a single negative edge exists, Dijkstra's greedy invariant can catastrophically fail. Even worse, if a cycle exists whose sum of edge weights is strictly negative (a **Negative Weight Cycle**), a path can loop infinitely, driving shortest path distance to $-\infty$!

Today, we introduce the **Bellman-Ford Algorithm** ($O(V \cdot E)$), formulated independently by Alfonso Shimbel (1955), Richard Bellman (1958), and Lester Ford Jr. (1956).

Today, you will master:
1. **The Dijkstra Failure Proof:** Constructing the exact minimal counterexample proving why greedy algorithms cannot handle negative weights.
2. **The $(V - 1)$-Hop Theorem:** Proving via the Pigeonhole Principle why any simple shortest path contains at most $|V| - 1$ edges.
3. **The $V$-th Pass Negative Cycle Invariant:** Detecting infinite arbitrage cycles in exactly one additional pass.
4. **From-Scratch C# Container:** Building `BellmanFordSolver` with predecessor path reconstruction and cycle detection.
5. **Canonical Problem Mastery:** Conquering **[LeetCode 787] Cheapest Flights Within K Stops (Medium)** using snapshot array relaxation.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   DAY 171: NEGATIVE WEIGHTS, CYCLES & THE BELLMAN-FORD ALGORITHM                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       WHY DIJKSTRA COLLAPSES      │                             │      THE (V - 1)-HOP THEOREM      │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Greedy finalization assumes     │                             │ • A simple path visits at most V  │
│   future edges only add cost.     │ ── Mathematical Shift ────► │   distinct vertices.              │
│ • Negative edge can undercut an   │    (From Greedy to DP)      │ • By Pigeonhole Principle, simple │
│   already "finalized" node!       │                             │   path has at most V - 1 edges!   │
│ • Counterexample:                 │                             │ • Relaxing all E edges V - 1 times│
│   A -> B (w=2), A -> C (w=5),     │                             │   guarantees full convergence!    │
│   C -> B (w=-4) => dist[B] = 1!   │                             │ • Pass V: Any update => NEG CYCLE!│
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         PRODUCTION C# & PROBLEM SET         │
                          ├─────────────────────────────────────────────┤
                          │ • Production BellmanFordSolver Container    │
                          │ • Negative Cycle Detection & Extraction     │
                          │ • [LC 787] Cheapest Flights Within K Stops  │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🗝️ The Visual Mental Model: Why Dijkstra Fails on Negative Edges

Let us construct the classic 3-node counterexample where Dijkstra produces a provably incorrect answer:

```
                  THE DIJKSTRA NEGATIVE EDGE FAILURE TRACE

                              [ Source A ]
                             /            \
                    w = 2   /              \  w = 5
                           ▼                ▼
                         [ B ]            [ C ]
                           ▲                │
                           │     w = -4     │
                           └────────────────┘

    1. Dijkstra initializes: dist[A]=0, dist[B]=∞, dist[C]=∞.
    2. Pop A: Relaxes edges to B (dist=2) and C (dist=5).
    3. Dijkstra GREEDILY POPS B (because tentative dist 2 < 5).
       DIJKSTRA DECLARES: "Node B is finalized! Optimal distance to B is 2!"
    4. Dijkstra pops C (dist=5):
       Relaxes edge C -> B with weight -4.
       New candidate distance to B = dist[C] + (-4) = 5 - 4 = 1.
    5. CATASTROPHE!
       True shortest path to B is A -> C -> B with total cost 1!
       Because B was already marked "finalized", Dijkstra fails to update B!
```

> [!IMPORTANT]
> **The Fallacy of Adding a Constant $C$:**
> A common interview misconception is: *"Why not find the minimum negative weight $-W$, add $W$ to all edges so every edge is non-negative, and run Dijkstra?"*
> **This is a fatal error!**
> Adding constant $W$ penalizes paths proportional to their number of edges!
> A 1-edge path gets $+W$, while a 3-edge path gets $+3W$. This artificially changes which path is the shortest!

---

### 1.2 🧮 Mathematical Proof: The $(V - 1)$-Hop Theorem

#### Theorem:
> In any weighted directed graph $G = (V, E, w)$ containing no negative-weight cycles, every simple shortest path from source $s$ to any reachable vertex $v$ consists of at most $|V| - 1$ edges.

#### Proof by Contradiction & Pigeonhole Principle:
1. Let $P = (v_0, v_1, v_2, \dots, v_k)$ be a shortest path from $s = v_0$ to $v = v_k$.
2. Suppose for contradiction that $P$ contains $k \ge |V|$ edges.
3. The number of vertices visited along path $P$ is $k + 1 \ge |V| + 1$.
4. By the **Pigeonhole Principle**, because there are only $|V|$ distinct vertices in the graph, path $P$ must visit at least one vertex more than once.
5. Let $x$ be a repeated vertex. Path $P$ can be decomposed into:
   $$P = (s \rightsquigarrow x \rightsquigarrow x \rightsquigarrow v)$$
   where the segment $C = (x \rightsquigarrow x)$ forms a directed cycle.
6. Since graph $G$ contains **no negative cycles**, the total weight of cycle $C$ is non-negative:
   $$w(C) = \sum_{e \in C} w(e) \ge 0$$
7. Remove cycle $C$ from $P$ to form a simplified path $P' = (s \rightsquigarrow x \rightsquigarrow v)$:
   $$w(P') = w(P) - w(C) \le w(P)$$
8. Thus, removing cycles never increases path length. We can eliminate all cycles until the path is simple.
9. A simple path visits each of the $|V|$ vertices at most once. Therefore, a simple path contains at most $|V| - 1$ edges. $\blacksquare$

---

### 1.3 🖼️ Visual Mechanics: The Bellman-Ford Algorithmic Pipeline

Because any simple shortest path has at most $|V| - 1$ edges, we can compute shortest paths via dynamic programming:
- **Round 1:** Find all shortest paths of length $\le 1$ edge.
- **Round 2:** Find all shortest paths of length $\le 2$ edges.
- $\dots$
- **Round $|V| - 1$:** Find all shortest paths of length $\le |V| - 1$ edges.

```
                    BELLMAN-FORD ROUND-BY-ROUND EXPANSION

    Edge List: [ (A,B, 4), (A,C, 2), (C,B, -3), (B,D, 2), (D,E, 1) ]
    Source: A

    Round 0: dist = [A: 0, B: ∞, C: ∞, D: ∞, E: ∞]
    Round 1: Relaxes 1-hop paths:
             dist = [A: 0, B: 4, C: 2, D: ∞, E: ∞]
    Round 2: Relaxes 2-hop paths (including C -> B with w=-3):
             dist[B] becomes 2 + (-3) = -1!
             dist[D] becomes 4 + 2 = 6!
             dist = [A: 0, B: -1, C: 2, D: 6, E: ∞]
    Round 3: Relaxes 3-hop paths (B -> D with new dist[B]=-1):
             dist[D] becomes -1 + 2 = 1!
             dist[E] becomes 6 + 1 = 7!
    Round 4 (V - 1): Relaxes 4-hop paths (D -> E with new dist[D]=1):
             dist[E] becomes 1 + 1 = 2!
             FULL CONVERGENCE REACHED!
```

---

### 1.4 🔄 The $V$-th Pass Negative Cycle Detection Invariant

What if we run one more round (the $V$-th pass)?
- If the graph has **no negative cycles**, all shortest paths have converged by round $|V| - 1$. No distance can possibly decrease on pass $V$.
- If any distance *does* decrease on pass $V$:
  $$\text{dist}[u] + w(u, v) < \text{dist}[v]$$
  Then a path with $\ge |V|$ edges is shorter than all paths with $< |V|$ edges. By the $(V - 1)$-Hop Theorem, this path must contain a cycle whose sum of edge weights is strictly negative: **A Negative Cycle Exists!**

```
                         NEGATIVE CYCLE ACCELERATION

                              [ Node X ]
                             /          \
                    w = 2   /            \  w = -5
                           ▼              ▼
                         [ Y ] ◄──────── [ Z ]
                                 w = 1

    Cycle Weight: 2 + (-5) + 1 = -2 < 0!
    Every time fluid circulates around X -> Z -> Y -> X:
    Total distance DECREASES by 2!
    After 1,000 iterations: dist = -2,000.
    As iterations -> ∞: dist -> -∞!
    Bellman-Ford detects this on pass V because dist continues to drop!
```

---

### 1.5 5W1H Executive Architecture Blueprint: Bellman-Ford

| Dimension | Architectural Specification |
| :--- | :--- |
| **1. WHAT** | A dynamic programming shortest-path algorithm that relaxes all $|E|$ edges $|V| - 1$ times, correctly solving graphs with arbitrary (including negative) weights. |
| **2. WHY** | Dijkstra fails when negative edges exist. Bellman-Ford guarantees global convergence and detects infinite negative weight cycles. |
| **3. WHEN** | Graphs with negative edge weights, currency exchange rate arbitrage, bounded hop-count routing (e.g. at most $K$ flights), RIP routing protocol. |
| **4. WHERE** | Primitive flat array `int[] dist` of size $V$ and a flat edge array `(int U, int V, int Weight)[]`. Optimal sequential CPU memory read locality. |
| **5. WHO** | *"For graphs with potential negative edge weights or bounded hops, I use Bellman-Ford. By relaxing all edges $|V|-1$ times in $O(VE)$ time, all simple paths converge, and a $V$-th pass detects negative cycles."* |
| **6. HOW** | Initialize `dist[src]=0`, all others $\infty \to$ loop $V - 1$ times: for each $(u, v, w) \in E$, relax $\to$ run pass $V$: if any relaxation succeeds, negative cycle detected. |

---

## 2. ⚙️ IMPLEMENT: Production-Grade Container

Here is the production-grade, standalone compilable C# implementation of `BellmanFordSolver` featuring negative cycle detection, predecessor tracking, and path reconstruction.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedGraphAlgorithms.ShortestPaths
{
    /// <summary>
    /// Represents a directed weighted edge.
    /// </summary>
    public readonly struct Edge
    {
        public readonly int From;
        public readonly int To;
        public readonly int Weight;

        public Edge(int from, int to, int weight)
        {
            From = from;
            To = to;
            Weight = weight;
        }

        public override string ToString() => $"({From} -> {To}, w={Weight})";
    }

    /// <summary>
    /// Encapsulates the complete result of a Bellman-Ford computation.
    /// </summary>
    public sealed class BellmanFordResult
    {
        public bool HasNegativeCycle { get; }
        public int[] Distances { get; }
        public int[] Predecessors { get; }

        public BellmanFordResult(bool hasNegativeCycle, int[] distances, int[] predecessors)
        {
            HasNegativeCycle = hasNegativeCycle;
            Distances = distances;
            Predecessors = predecessors;
        }

        public List<int> ReconstructPath(int target)
        {
            if (HasNegativeCycle || Distances[target] == int.MaxValue)
                return new List<int>();

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
    /// Production-grade implementation of the Bellman-Ford Algorithm.
    /// Time Complexity: O(V * E).
    /// Space Complexity: O(V).
    /// </summary>
    public sealed class BellmanFordSolver
    {
        /// <summary>
        /// Computes shortest paths from source vertex.
        /// Returns BellmanFordResult indicating whether a negative cycle is reachable.
        /// </summary>
        public static BellmanFordResult Compute(int v, List<Edge> edges, int source)
        {
            if (v <= 0) throw new ArgumentOutOfRangeException(nameof(v));
            if (source < 0 || source >= v) throw new ArgumentOutOfRangeException(nameof(source));

            var dist = new int[v];
            var parent = new int[v];
            Array.Fill(dist, int.MaxValue);
            Array.Fill(parent, -1);

            dist[source] = 0;

            // Step 1: Relax all edges |V| - 1 times
            for (int round = 1; round <= v - 1; round++)
            {
                bool anyRelaxation = false;

                foreach (var edge in edges)
                {
                    int u = edge.From;
                    int to = edge.To;
                    int w = edge.Weight;

                    // Only relax from reachable vertices to prevent integer overflow
                    if (dist[u] != int.MaxValue && dist[u] + w < dist[to])
                    {
                        dist[to] = dist[u] + w;
                        parent[to] = u;
                        anyRelaxation = true;
                    }
                }

                // Early exit optimization: If no distance changed, graph converged early!
                if (!anyRelaxation)
                    break;
            }

            // Step 2: Pass V - Check for Negative Weight Cycles
            bool hasNegativeCycle = false;
            foreach (var edge in edges)
            {
                int u = edge.From;
                int to = edge.To;
                int w = edge.Weight;

                if (dist[u] != int.MaxValue && dist[u] + w < dist[to])
                {
                    hasNegativeCycle = true;
                    break;
                }
            }

            return new BellmanFordResult(hasNegativeCycle, dist, parent);
        }

        // ====================================================================
        // SELF-VALIDATING TEST SUITE
        // ====================================================================
        public static void Main()
        {
            Console.WriteLine("==================================================");
            Console.WriteLine("RUNNING TEST SUITE: BellmanFordSolver (C#)");
            Console.WriteLine("==================================================");

            // Test 1: Dijkstra Counterexample (Negative edge without negative cycle)
            // 0 -> 1 (w=2), 0 -> 2 (w=5), 2 -> 1 (w=-4)
            var edges1 = new List<Edge>
            {
                new Edge(0, 1, 2),
                new Edge(0, 2, 5),
                new Edge(2, 1, -4)
            };

            var res1 = Compute(3, edges1, 0);
            Debug.Assert(res1.HasNegativeCycle == false, "Graph 1 must not contain negative cycles.");
            Debug.Assert(res1.Distances[1] == 1, $"Expected dist[1] = 1, got {res1.Distances[1]}");
            var path1 = res1.ReconstructPath(1);
            Debug.Assert(path1.Count == 3 && path1[0] == 0 && path1[1] == 2 && path1[2] == 1);

            // Test 2: Graph with Negative Cycle (1 -> 2 -> 3 -> 1 with sum -1)
            // 0 -> 1 (w=1)
            // 1 -> 2 (w=2), 2 -> 3 (w=2), 3 -> 1 (w=-5) => Sum = -1!
            var edges2 = new List<Edge>
            {
                new Edge(0, 1, 1),
                new Edge(1, 2, 2),
                new Edge(2, 3, 2),
                new Edge(3, 1, -5)
            };

            var res2 = Compute(4, edges2, 0);
            Debug.Assert(res2.HasNegativeCycle == true, "Graph 2 must detect negative cycle!");

            Console.WriteLine("✅ All BellmanFordSolver assertions passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Operational Deep-Dive (5 Dimensions)

### Dimension 1: Mathematical Contract & Asymptotic Proofs

| Algorithm | Time Complexity | Space Complexity | Handles Negative Edges? | Negative Cycle Detection |
| :--- | :--- | :--- | :--- | :--- |
| **Dijkstra** | $O((V + E) \log V)$ | $O(V + E)$ | ❌ Fails / TLE | ❌ Cannot detect |
| **Bellman-Ford** | $\mathbf{\Theta(V \cdot E)}$ | $\mathbf{\Theta(V)}$ | ✅ **100% Correct** | ✅ **Guaranteed on Pass $V$** |
| **SPFA (Queue-BF)** | Avg: $O(E)$, Worst: $O(VE)$ | $O(V)$ | ✅ 100% Correct | ✅ Relaxation count $\ge V$ |

---

### Dimension 2: Step-by-Step Execution Trace

Graph: $0 \to 1 (2), 0 \to 2 (5), 2 \to 1 (-4)$. Source = 0. $V = 3$ nodes $\implies 2$ relaxation rounds.

| Round | Edges Processed | Condition Check | `dist[]` Array | Action Taken |
| :---: | :---: | :---: | :--- | :--- |
| *Init* | — | — | `[0, ∞, ∞]` | Initialize source to 0. |
| **Round 1** | $(0, 1, 2)$<br/>$(0, 2, 5)$<br/>$(2, 1, -4)$ | $0 + 2 < \infty$<br/>$0 + 5 < \infty$<br/>$5 + (-4) = 1 < 2$ | `[0, 2, ∞]`<br/>`[0, 2, 5]`<br/>`[0, 1, 5]` | Relax $0 \to 1$.<br/>Relax $0 \to 2$.<br/>**Relax $2 \to 1$ (under-cuts)!** |
| **Round 2** | All 3 edges | No distance improves | `[0, 1, 5]` | Early termination triggered! |
| **Pass 3** | All 3 edges | No distance improves | `[0, 1, 5]` | **No Negative Cycle detected.** |

---

### Dimension 3: Visual ASCII State Transitions

```
               BELLMAN-FORD SNAPSHOT DISTANCE ARRAY STATE

    Round 0 (Initial):
    +---------+---+----+----+
    | Vertex  | 0 | 1  | 2  |
    | dist[]  | 0 | ∞  | ∞  |
    +---------+---+----+----+

    Round 1 (After 1st pass of all edges):
    +---------+---+----+----+
    | Vertex  | 0 | 1  | 2  |
    | dist[]  | 0 | 1  | 5  |  <=== Edge 2 -> 1 undercuts direct edge 0 -> 1!
    +---------+---+----+----+

    Round 2 (After 2nd pass of all edges):
    +---------+---+----+----+
    | Vertex  | 0 | 1  | 2  |
    | dist[]  | 0 | 1  | 5  |  <=== Zero changes! Early break!
    +---------+---+----+----+
```

---

### Dimension 4: Invariant Preservation Proofs

1. **Hop Convergence Invariant:**
   After completion of the $k$-th iteration of the outer loop ($1 \le k \le |V| - 1$), $\text{dist}[v]$ is less than or equal to the length of the shortest path from $s$ to $v$ that uses **at most $k$ edges**.
   - *Proof by Induction on $k$:*
     - *Base Case ($k=1$):* After round 1, all edges $(s, v)$ directly incident from source $s$ are relaxed, so $\text{dist}[v] \le w(s, v)$. Paths of $\le 1$ edge are optimal.
     - *Inductive Step:* Assume true for $k-1$. Let $P$ be a shortest path of $\le k$ edges from $s$ to $v$. Let $(u, v)$ be the last edge on $P$. Path $s \rightsquigarrow u$ uses $\le k-1$ edges. By inductive hypothesis, after round $k-1$, $\text{dist}[u] \le \text{length}(s \rightsquigarrow u)$. During round $k$, edge $(u, v)$ is relaxed, setting $\text{dist}[v] \le \text{dist}[u] + w(u, v) \le \text{length}(P)$.
2. **Negative Cycle Invariant:**
   A negative cycle is reachable from $s$ if and only if an edge can be relaxed during pass $|V|$.
   - *Proof:* Established in Section 1.4 via the $(V - 1)$-Hop Theorem.

---

### Dimension 5: Edge Case Analysis & Defense Matrix

| Edge Case Scenario | Potential Failure Mode | Built-in Defense Mechanism |
| :--- | :--- | :--- |
| **Integer Overflow on $\infty + w$** | `int.MaxValue + (-5)` wraps to negative infinity! | Guard `if (dist[u] != int.MaxValue && ...)` prevents adding to $\infty$. |
| **Unreachable Negative Cycle** | Cycle exists in disconnected component; mistaken cycle detection. | Cycle detection requires `dist[u] != int.MaxValue`, ensuring cycle is reachable from $s$. |
| **Multi-Hop Cascade in 1 Round** | Iterating edges in topological order relaxes multiple hops in a single round. | In standard Bellman-Ford, cascading accelerates convergence (benign). In bounded-hop problems ([LC 787]), we use cloned snapshot arrays. |

---

## 4. 🎬 DEMONSTRATE: Canonical LeetCode Walkthroughs

### 4.1 [LeetCode 787] Cheapest Flights Within K Stops (Medium)

#### Problem Formulation
There are $n$ cities connected by flights `flights[i] = [from, to, price]`. Given `src`, `dst`, and integer `k`, return the cheapest price from `src` to `dst` with **at most $k$ stops**. If no such route exists, return `-1`.

#### Algorithmic Nuance: Exact $K + 1$ Hops via Snapshot Array
- $k$ intermediate stops means a path with at most **$k + 1$ edges (flights)**!
- In standard Bellman-Ford, relaxing edges in an arbitrary order can cause a cascade: edge $A \to B$ is updated, and in the *same* round, edge $B \to C$ reads the updated $B$ and updates $C$, traversing 2 hops in 1 round!
- **The Snapshot Solution:** Maintain a clone `prevDist = (int[])dist.Clone()`. Inside round $i$, **read strictly from `prevDist`** and **write to `dist`**.
- This guarantees that round $i$ explores paths with *strictly at most $i$ edges*!

```csharp
using System;

public sealed class CheapestFlightsKStopsSolution
{
    public int FindCheapestPrice(int n, int[][] flights, int src, int dst, int k)
    {
        var dist = new int[n];
        Array.Fill(dist, int.MaxValue);
        dist[src] = 0;

        // k stops means at most k + 1 flights (edges)
        for (int round = 1; round <= k + 1; round++)
        {
            // Snapshot of distances at start of round to prevent cascading multi-hop updates
            var prevDist = (int[])dist.Clone();
            bool anyUpdate = false;

            foreach (var flight in flights)
            {
                int u = flight[0];
                int v = flight[1];
                int price = flight[2];

                // Read strictly from previous round's snapshot!
                if (prevDist[u] != int.MaxValue && prevDist[u] + price < dist[v])
                {
                    dist[v] = prevDist[u] + price;
                    anyUpdate = true;
                }
            }

            // Early exit if distances settled
            if (!anyUpdate)
                break;
        }

        return dist[dst] == int.MaxValue ? -1 : dist[dst];
    }
}
```

#### Complexity Analysis
- **Time Complexity:** $O((K + 1) \cdot E)$. We execute at most $K + 1$ rounds over $E$ flights. When $K \le 100$ and $E \le 10,000$, total operations $\approx 10^6$, executing in under $5$ ms!
- **Space Complexity:** $O(N)$ for the `dist` and `prevDist` arrays.

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Currency Arbitrage Detection (CSES 1678 / CLRS)
- **Constraint:** Given an exchange rate matrix $R[i, j]$, find if there exists a sequence of trades $c_1 \to c_2 \dots \to c_1$ yielding profit $> 1.0$.
- **Negative Log Transform:**
  - Profit condition: $R_{1,2} \times R_{2,3} \times R_{3,1} > 1.0$.
  - Take $-\ln$: $-\ln(R_{1,2}) - \ln(R_{2,3}) - \ln(R_{3,1}) < 0$.
  - Finding an arbitrage cycle is mathematically equivalent to **finding a negative cycle in a graph with edge weights $w(i, j) = -\ln(R_{i, j})$**!

### Exercise 2: Network Delay Time with Negative Weights
- **Constraint:** Solve [LeetCode 743] when edges can have negative weights.
- **Architecture Hint:** Replace Dijkstra with `BellmanFordSolver`. Check for negative cycles reachable from $k$.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
                     SHORTEST PATH ALGORITHM SELECTION

                     Do negative edge weights exist?
                               /        \
                             YES         NO
                             /            \
                  Are hops bounded (≤ K)?  [Dijkstra's Algorithm]
                         /         \       O((V + E) log V)
                       YES          NO
                       /             \
            [Snapshot Bellman-Ford]  [Standard Bellman-Ford / SPFA]
               O(K * E) time           O(V * E) time
```

---

## 7. 🎯 Daily Checkpoint Questions

### Diagnostic Question
Why does Bellman-Ford require exactly $V-1$ iterations to guarantee shortest path convergence in a graph without negative cycles?

### Architectural Model Answer
1. **Pigeonhole Bound on Simple Paths:**
   In any graph with $V$ vertices containing no negative cycles, any shortest path between two vertices can be chosen to be simple (free of cycles). By the Pigeonhole Principle, a simple path visiting $V$ vertices can contain at most $V - 1$ edges.
2. **Inductive Round Guarantee:**
   During iteration $k$ of the algorithm, edge relaxations guarantee that all shortest paths using at most $k$ edges are correctly finalized.
3. **Convergence on Pass $V-1$:**
   Since no simple shortest path can contain more than $V - 1$ edges, running $V - 1$ rounds of edge relaxations guarantees that the optimal shortest distance to every reachable vertex has been computed.
4. **The $V$-th Pass Invariant:**
   If a relaxation is still possible on round $V$, it implies a path with $V$ edges is shorter than any path with $\le V - 1$ edges. Because a path with $V$ edges must repeat a vertex, the repeated loop must have a negative weight sum, proving the existence of a negative cycle.
