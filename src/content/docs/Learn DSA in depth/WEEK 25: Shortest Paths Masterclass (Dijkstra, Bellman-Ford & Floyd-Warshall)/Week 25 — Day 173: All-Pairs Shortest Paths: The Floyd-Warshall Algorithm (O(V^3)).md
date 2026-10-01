---
title: "Week 25 — Day 173: All-Pairs Shortest Paths: The Floyd-Warshall Algorithm (O(V^3))"
---

# Week 25 — Day 173: All-Pairs Shortest Paths: The Floyd-Warshall Algorithm ($O(V^3)$)

Welcome to **Day 173 of your DSA Mastery Journey**!

Thus far in Week 25, we have focused on **Single-Source Shortest Path (SSSP)** problems: finding the shortest path from *one fixed source* $s$ to all other vertices.
- **Dijkstra:** $O((V + E) \log V)$ (Non-negative weights only).
- **Bellman-Ford / SPFA:** $O(V \cdot E)$ (Arbitrary weights and negative cycle detection).

However, in many real-world distributed architectures, we must answer **All-Pairs Shortest Path (APSP)** queries:
- In routing tables, every router needs to know the shortest path to *every other* router.
- In social network analysis, we compute the diameter, closeness centrality, and average shortest path across the entire graph.
- In transitive closure engines, we compute whether *any* path exists between every pair $(i, j)$.

If we executed Dijkstra from all $V$ vertices, it would require $O(V \cdot (V + E) \log V)$, which fails if negative edges exist. If we executed Bellman-Ford from all $V$ vertices, it would take $O(V^2 \cdot E) \approx O(V^4)$ on dense graphs.

In 1962, Robert Floyd and Stephen Warshall published an exceptionally elegant dynamic programming algorithm that solves All-Pairs Shortest Paths in **$O(V^3)$ time and $O(V^2)$ space** using just **three nested loops**: **The Floyd-Warshall Algorithm**.

Today, you will master:
1. **The Intermediate Vertex DP Formulation:** Defining subproblems over prefix vertex sets $\{0, 1, \dots, k\}$.
2. **The Outermost $k$-Loop Invariant:** Proving mathematically why placing loop $k$ inside loops $i$ and $j$ produces catastrophic algorithmic failure.
3. **In-Place 2D Memory Optimization:** Transitioning from $O(V^3)$ 3D DP tables to cache-line contiguous $O(V^2)$ flat matrices.
4. **Predecessor Path Reconstruction:** Maintaining a `next[i, j]` matrix to reconstruct exact vertex sequences in $O(\text{path length})$.
5. **Canonical Problem Mastery:** Conquering **[LeetCode 1334] Find the City With the Smallest Number of Neighbors at a Threshold Distance (Medium)**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   DAY 173: FLOYD-WARSHALL ALL-PAIRS SHORTEST PATHS                               │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       INTERMEDIATE VERTEX DP      │                             │    THE OUTERMOST k-LOOP INVARIANT │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • dp[k, i, j]:                    │                             │ • k represents the TRANSIT NODE.  │
│   Shortest path i -> j using only │ ── Subproblem Induction ──► │ • Can we go i -> k -> j?          │
│   nodes {0 ... k} as transit!     │                             │ • Must resolve ALL pairs (i, j)   │
│ • Base Case: Direct edges (k=-1). │                             │   using transit k BEFORE moving   │
│ • Recurrence:                     │                             │   to transit k + 1!               │
│   min(dp[k-1, i, j],              │                             │ • If k is innermost -> WRONG!     │
│       dp[k-1, i, k] + dp[k-1,k,j])│                             │   Subpaths are unoptimized!      │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         PRODUCTION C# & PROBLEM SET         │
                          ├─────────────────────────────────────────────┤
                          │ • Production FloydWarshallSolver Container  │
                          │ • Path Reconstruction via next[i, j] Matrix │
                          │ • Negative Cycle Detection (dist[i, i] < 0) │
                          │ • [LC 1334] Smallest Neighbors at Threshold │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🗝️ The Visual Mental Model: The Intermediate Transit Airport

Consider booking flights between cities $i$ and $j$.
Initially (before considering any layover cities), the only valid paths are **direct non-stop flights**:
$$\text{dist}[i, j] = w(i, j)$$

Now, the aviation authority opens transit airports one by one:
- **Phase $k = 0$:** You are now allowed to make a layover at Airport $0$.
  Does flying $i \to 0 \to j$ beat the direct flight $i \to j$?
  $$\text{dist}[i, j] \leftarrow \min(\text{dist}[i, j], \text{dist}[i, 0] + \text{dist}[0, j])$$
- **Phase $k = 1$:** You are now allowed to make layovers at Airports $\{0, 1\}$.
  Does routing through Airport $1$ improve any flight?
- $\dots$
- **Phase $k = V - 1$:** You are allowed to use *any* airport in the world as an intermediate layover!
  All shortest paths are fully solved!

```
                    INTERMEDIATE TRANSIT VERTEX EXPANSION

                      Direct Path: cost = 9
           [ City i ] ─────────────────────────► [ City j ]
                 \                                 ▲
                  \                               /
           cost=3  \                             / cost=4
                    ▼                           /
                    [ Transit Airport k ] ─────┘
                    
           Total Layover Cost = 3 + 4 = 7 < 9!
           Improvement: dist[i, j] becomes 7!
```

---

### 1.2 🧮 Mathematical Formulation & State Recurrence

Let the vertices of graph $G$ be numbered $V = \{0, 1, \dots, n-1\}$.

#### Dynamic Programming State:
Define $D^{(k)}[i, j]$ as the length of the shortest path from vertex $i$ to vertex $j$ such that **all intermediate vertices along the path belong strictly to the prefix subset $\{0, 1, \dots, k\}$**.

#### Base Case ($k = -1$, no intermediate vertices permitted):
$$D^{(-1)}[i, j] = \begin{cases}
0 & \text{if } i = j \\
w(i, j) & \text{if } (i, j) \in E \\
\infty & \text{otherwise}
\end{cases}$$

#### State Recurrence (Transition from $k-1$ to $k$):
When vertex $k$ is introduced as an eligible transit node, for any pair $(i, j)$, there are two possibilities:
1. **Vertex $k$ is NOT on the shortest path:** The shortest path uses only intermediate nodes from $\{0, \dots, k-1\}$.
   Length $= D^{(k-1)}[i, j]$.
2. **Vertex $k$ IS on the shortest path:** The path decomposes into $i \rightsquigarrow k$ and $k \rightsquigarrow j$. Since simple shortest paths do not repeat nodes, neither subpath uses $k$ internally. Both subpaths use intermediate nodes from $\{0, \dots, k-1\}$.
   Length $= D^{(k-1)}[i, k] + D^{(k-1)}[k, j]$.

Therefore, the recurrence is:
$$\mathbf{D^{(k)}[i, j] = \min\left( D^{(k-1)}[i, j], \; D^{(k-1)}[i, k] + D^{(k-1)}[k, j] \right)}$$

---

### 1.3 ⚠️ The Critical Invariant: Why the $k$-Loop MUST Be Outermost!

This is one of the most famous algorithmic traps in technical interviews.
Look at the three nested loops:
```csharp
// CORRECT FLOYD-WARSHALL:
for (int k = 0; k < n; k++)         // <=== k MUST BE OUTERMOST!
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            dist[i, j] = Math.Min(dist[i, j], dist[i, k] + dist[k, j]);
```

**What happens if you place $k$ as the innermost loop?**
```csharp
// FATAL DISASTER (DO NOT DO THIS!):
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
        for (int k = 0; k < n; k++)   // <=== BROKEN!
            dist[i, j] = Math.Min(dist[i, j], dist[i, k] + dist[k, j]);
```

#### Why Innermost $k$ Fails:
If $k$ is innermost, you are evaluating: *"Can pair $(i, j)$ be improved using a single intermediate hop $k$ using only initial direct edges?"*
- Path $i \to k$ has had **zero** opportunities to be optimized by other intermediate nodes!
- If the true shortest path between $i$ and $j$ requires **3 or more hops** (e.g. $i \to a \to b \to j$), an innermost $k$ loop will **never discover it**, because when computing $i \to b \to j$, the subpath $i \to a \to b$ has not yet been computed!
- When $k$ is outermost, the inductive invariant guarantees that when we introduce transit node $k$, **all subpaths using nodes $0 \dots k-1$ are already globally optimal**!

---

### 1.4 🔄 Negative Cycle Detection & In-Place Space Optimization

#### In-Place 2D Space Optimization:
Notice that in the recurrence:
$$D^{(k)}[i, k] = \min(D^{(k-1)}[i, k], D^{(k-1)}[i, k] + D^{(k-1)}[k, k]) = D^{(k-1)}[i, k]$$
(assuming no negative cycles so $D[k, k] = 0$).
Because the $k$-th row and $k$-th column values do not change during phase $k$, we can safely overwrite the 2D array in-place without allocating a 3D matrix:
`dist[i, j] = Math.Min(dist[i, j], dist[i, k] + dist[k, j]);`

#### Negative Cycle Detection Invariant:
Initially, $\text{dist}[i, i] = 0$ for all $i$.
If a negative cycle exists containing vertex $i$, circulating around the cycle yields a negative cost.
Therefore:
$$\mathbf{\text{A negative cycle exists if and only if } \text{dist}[i, i] < 0 \text{ for any } i \in V.}$$

---

### 1.5 5W1H Executive Architecture Blueprint: Floyd-Warshall

| Dimension | Architectural Specification |
| :--- | :--- |
| **1. WHAT** | An All-Pairs Shortest Path dynamic programming algorithm that evaluates intermediate transit vertices monotonically in $\Theta(V^3)$ time and $\Theta(V^2)$ space. |
| **2. WHY** | Solves all-pairs distances on small/medium graphs ($V \le 400$) with just three nested loops, handles negative edges, and detects negative cycles without priority queues. |
| **3. WHEN** | Small graphs ($V \le 400$), computing graph diameter/centrality, transitive closures, finding optimal city hubs under distance thresholds ([LC 1334]). |
| **4. WHERE** | 2D primitive integer array `int[V, V]` (or flat `int[V * V]`). Perfectly linear contiguous CPU memory access pattern when inner loop iterates over columns $j$. |
| **5. WHO** | *"For all-pairs shortest paths on graphs up to 400 nodes, I use Floyd-Warshall. By placing the intermediate transit vertex $k$ in the outermost loop, subproblem optimality is guaranteed across all pairs in $O(V^3)$ time."* |
| **6. HOW** | Initialize matrix with edge weights $\to$ outermost loop $k \in [0, V-1] \to$ loops $i, j \in [0, V-1] \to$ relax `dist[i, j] = min(dist[i, j], dist[i, k] + dist[k, j])`. |

---

## 2. ⚙️ IMPLEMENT: Production-Grade Container

Here is the production-grade, standalone compilable C# implementation of `FloydWarshallSolver` featuring path reconstruction via `next[i, j]` matrix, negative cycle detection, and automated self-validating test harnesses.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedGraphAlgorithms.ShortestPaths
{
    /// <summary>
    /// Production-grade implementation of the Floyd-Warshall All-Pairs Shortest Path Algorithm.
    /// Time Complexity: O(V^3).
    /// Space Complexity: O(V^2).
    /// </summary>
    public sealed class FloydWarshallSolver
    {
        public const int Infinity = 1_000_000_000; // Use 10^9 to prevent integer overflow on addition

        public sealed class ApspResult
        {
            public bool HasNegativeCycle { get; }
            public int[,] Distances { get; }
            public int[,] NextHop { get; }
            public int VertexCount { get; }

            public ApspResult(bool hasNegCycle, int[,] dist, int[,] next, int v)
            {
                HasNegativeCycle = hasNegCycle;
                Distances = dist;
                NextHop = next;
                VertexCount = v;
            }

            /// <summary>
            /// Reconstructs the exact sequence of vertices on the shortest path from u to v.
            /// </summary>
            public List<int> ReconstructPath(int u, int v)
            {
                if (HasNegativeCycle || Distances[u, v] >= Infinity)
                    return new List<int>();

                var path = new List<int> { u };
                int curr = u;

                while (curr != v)
                {
                    curr = NextHop[curr, v];
                    if (curr == -1) return new List<int>();
                    path.Add(curr);
                }

                return path;
            }
        }

        /// <summary>
        /// Computes All-Pairs Shortest Paths for a graph of V vertices.
        /// </summary>
        /// <param name="v">Number of vertices [0 .. v-1].</param>
        /// <param name="edges">Collection of directed edges (From, To, Weight).</param>
        public static ApspResult Compute(int v, List<(int From, int To, int Weight)> edges)
        {
            if (v <= 0) throw new ArgumentOutOfRangeException(nameof(v));

            var dist = new int[v, v];
            var next = new int[v, v];

            // Step 1: Initialize base distances and next-hop pointers
            for (int i = 0; i < v; i++)
            {
                for (int j = 0; j < v; j++)
                {
                    if (i == j)
                    {
                        dist[i, j] = 0;
                        next[i, j] = j;
                    }
                    else
                    {
                        dist[i, j] = Infinity;
                        next[i, j] = -1;
                    }
                }
            }

            foreach (var (from, to, weight) in edges)
            {
                if (weight < dist[from, to]) // Keep minimum weight if parallel edges exist
                {
                    dist[from, to] = weight;
                    next[from, to] = to;
                }
            }

            // Step 2: Triple Nested Loop - THE CRITICAL INVARIANT: k MUST BE OUTERMOST!
            for (int k = 0; k < v; k++)
            {
                for (int i = 0; i < v; i++)
                {
                    // Optimization: if no path from i to k, skip inner loop
                    if (dist[i, k] >= Infinity) continue;

                    for (int j = 0; j < v; j++)
                    {
                        if (dist[k, j] >= Infinity) continue;

                        int candidate = dist[i, k] + dist[k, j];
                        if (candidate < dist[i, j])
                        {
                            dist[i, j] = candidate;
                            next[i, j] = next[i, k]; // Next step on path from i to j is next step from i to k
                        }
                    }
                }
            }

            // Step 3: Check for Negative Cycles (dist[i, i] < 0)
            bool hasNegativeCycle = false;
            for (int i = 0; i < v; i++)
            {
                if (dist[i, i] < 0)
                {
                    hasNegativeCycle = true;
                    break;
                }
            }

            return new ApspResult(hasNegativeCycle, dist, next, v);
        }

        // ====================================================================
        // SELF-VALIDATING TEST SUITE
        // ====================================================================
        public static void Main()
        {
            Console.WriteLine("==================================================");
            Console.WriteLine("RUNNING TEST SUITE: FloydWarshallSolver (C#)");
            Console.WriteLine("==================================================");

            // Test 1: 4-Node Directed Graph
            // 0 -> 1 (w=5), 0 -> 3 (w=10)
            // 1 -> 2 (w=3)
            // 2 -> 3 (w=1)
            // Shortest path 0 -> 3 should be 0 -> 1 -> 2 -> 3 with cost 5 + 3 + 1 = 9 (beats direct 10!)
            var edges = new List<(int, int, int)>
            {
                (0, 1, 5),
                (0, 3, 10),
                (1, 2, 3),
                (2, 3, 1)
            };

            var res = Compute(4, edges);
            Debug.Assert(res.HasNegativeCycle == false);
            Debug.Assert(res.Distances[0, 3] == 9, $"Expected dist[0, 3] = 9, got {res.Distances[0, 3]}");

            var path03 = res.ReconstructPath(0, 3);
            var expected = new List<int> { 0, 1, 2, 3 };
            Debug.Assert(path03.Count == expected.Count);
            for (int i = 0; i < path03.Count; i++)
            {
                Debug.Assert(path03[i] == expected[i]);
            }

            // Test 2: Negative Cycle Detection
            var negCycleEdges = new List<(int, int, int)>
            {
                (0, 1, 1),
                (1, 2, -3),
                (2, 0, 1) // Cycle: 0 -> 1 -> 2 -> 0 has weight 1 - 3 + 1 = -1!
            };
            var negRes = Compute(3, negCycleEdges);
            Debug.Assert(negRes.HasNegativeCycle == true, "Must detect negative weight cycle!");

            Console.WriteLine("✅ All FloydWarshallSolver assertions passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Operational Deep-Dive (5 Dimensions)

### Dimension 1: Mathematical Contract & Asymptotic Proofs

| Algorithm | All-Pairs Time Complexity | Space Complexity | Best Graph Density |
| :--- | :--- | :--- | :--- |
| **Floyd-Warshall** | $\mathbf{\Theta(V^3)}$ | $\mathbf{\Theta(V^2)}$ | **Small / Dense graphs** ($V \le 400$) |
| **$V \times$ Dijkstra (Heap)** | $O(V \cdot (V + E) \log V)$ | $O(V + E)$ | **Sparse graphs** ($E \ll V^2$, non-negative) |
| **$V \times$ Bellman-Ford** | $O(V^2 \cdot E)$ | $O(V)$ | Fails on dense graphs ($O(V^4)$) |
| **Johnson's Algorithm (Day 174)** | $O(V \cdot E \log V)$ | $O(V^2)$ | **Sparse graphs with negative edges** |

---

### Dimension 2: Step-by-Step Execution Trace

Graph: $V = 3$. Edges: $0 \to 1 (4), 1 \to 2 (2), 0 \to 2 (8)$.

| Phase | Transit Node $k$ | Pairs Evaluated | Update Calculation | Resulting `dist[0, 2]` |
| :---: | :---: | :---: | :--- | :---: |
| *Init* | None ($k = -1$) | Direct edges | `dist[0, 2] = 8` | 8 |
| **$k = 0$** | Transit = 0 | $(1, 2)$ via 0? | $dist[1, 0] = \infty \to$ no change | 8 |
| **$k = 1$** | Transit = 1 | $(0, 2)$ via 1? | $dist[0, 1] + dist[1, 2] = 4 + 2 = 6 < 8$! | **6 (Updated!)** |
| **$k = 2$** | Transit = 2 | All pairs | No pair improved | **6 (Final optimal)** |

---

### Dimension 3: Visual ASCII Memory State Transitions

```
               IN-PLACE MATRIX STATE MUTATION DURING PHASE k=1

    Matrix BEFORE Phase k=1:
         0   1   2
       +---+---+---+
    0  | 0 | 4 | 8 |  <=== dist[0, 2] is currently 8 (direct edge)
       +---+---+---+
    1  | ∞ | 0 | 2 |
       +---+---+---+
    2  | ∞ | ∞ | 0 |
       +---+---+---+

    Evaluating pair (i=0, j=2) using transit k=1:
    candidate = dist[0, 1] + dist[1, 2] = 4 + 2 = 6.
    Since 6 < 8, dist[0, 2] is overwritten with 6!

    Matrix AFTER Phase k=1:
         0   1   2
       +---+---+---+
    0  | 0 | 4 | 6 |  <=== OPTIMAL!
       +---+---+---+
    1  | ∞ | 0 | 2 |
       +---+---+---+
    2  | ∞ | ∞ | 0 |
       +---+---+---+
```

---

### Dimension 4: Invariant Preservation Proofs

1. **Subproblem Prefix Invariant:**
   At the conclusion of the $k$-th iteration of the outermost loop, $\text{dist}[i, j]$ equals the exact weight of the shortest path from $i$ to $j$ using intermediate vertices exclusively from the prefix set $\{0, 1, \dots, k\}$.
   - *Proof by Induction on $k$:*
     - *Base Case ($k=0$):* For $k=0$, the only eligible intermediate node is vertex $0$. A path uses vertex 0 as intermediate if and only if it follows $i \to 0 \to j$. The algorithm computes $\min(\text{dist}[i, j], \text{dist}[i, 0] + \text{dist}[0, j])$, which is exact.
     - *Inductive Step:* Assume invariant holds for $k-1$. For transit node $k$, any shortest path using nodes $\{0 \dots k\}$ either does not use $k$ (optimal by induction $D^{(k-1)}[i, j]$), or visits $k$ once. If it visits $k$, the subpaths $i \rightsquigarrow k$ and $k \rightsquigarrow j$ contain intermediate nodes strictly from $\{0 \dots k-1\}$, which are optimal by induction. Thus $D^{(k)}[i, j] = \min(D^{(k-1)}[i, j], D^{(k-1)}[i, k] + D^{(k-1)}[k, j])$.

---

### Dimension 5: Edge Case Analysis & Defense Matrix

| Edge Case Scenario | Potential Failure Mode | Built-in Defense Mechanism |
| :--- | :--- | :--- |
| **Integer Overflow on Addition** | `int.MaxValue + int.MaxValue` wraps to negative number. | Define `Infinity = 1_000_000_000`; guard `if (dist[i, k] >= Infinity) continue;`. |
| **Self-Loops $(u, u)$** | Non-zero diagonal entries. | Initialize `dist[i, i] = 0` explicitly; overwrite only if negative. |
| **Multiple Edges Between $u$ and $v$** | Overwriting a lighter edge with a heavier edge. | Check `if (weight < dist[from, to])` during initial matrix population. |

---

## 4. 🎬 DEMONSTRATE: Canonical LeetCode Walkthroughs

### 4.1 [LeetCode 1334] Find City With Smallest Number of Neighbors at Threshold Distance (Medium)

#### Problem Formulation
There are $n$ cities numbered from $0$ to $n-1$. Given array `edges` where `edges[i] = [fromi, toi, weighti]` and integer `distanceThreshold`.
Return the city that has the smallest number of cities that are reachable through some path whose distance is **at most** `distanceThreshold`. If there are multiple such cities, return the city with the **greatest number** (highest index).

#### Algorithmic Formulation via Floyd-Warshall
1. $n \le 100$: With only 100 cities, $V^3 = 100^3 = 1,000,000$ operations—computable in $< 5$ ms!
2. Run Floyd-Warshall to compute all-pairs shortest distances `dist[i, j]`.
3. For each city $i$: count how many other cities $j \ne i$ have $\text{dist}[i, j] \le \text{distanceThreshold}$.
4. Find the minimum neighbor count; break ties by picking the largest index $i$!

```csharp
using System;

public sealed class SmallestNeighborsSolution
{
    private const int Infinity = 1_000_000_000;

    public int FindTheCity(int n, int[][] edges, int distanceThreshold)
    {
        var dist = new int[n, n];

        // 1. Initialize matrix
        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j < n; j++)
            {
                dist[i, j] = (i == j) ? 0 : Infinity;
            }
        }

        foreach (var edge in edges)
        {
            int u = edge[0];
            int v = edge[1];
            int w = edge[2];
            dist[u, v] = w;
            dist[v, u] = w; // Undirected graph
        }

        // 2. Floyd-Warshall Triple Loop (k outermost!)
        for (int k = 0; k < n; k++)
        {
            for (int i = 0; i < n; i++)
            {
                if (dist[i, k] >= Infinity) continue;

                for (int j = 0; j < n; j++)
                {
                    if (dist[k, j] >= Infinity) continue;

                    dist[i, j] = Math.Min(dist[i, j], dist[i, k] + dist[k, j]);
                }
            }
        }

        // 3. Count neighbors within threshold distance for each city
        int minCount = int.MaxValue;
        int bestCity = -1;

        for (int i = 0; i < n; i++)
        {
            int count = 0;
            for (int j = 0; j < n; j++)
            {
                if (i != j && dist[i, j] <= distanceThreshold)
                {
                    count++;
                }
            }

            // Condition: smallest neighbor count, tie-breaker: largest index
            if (count <= minCount)
            {
                minCount = count;
                bestCity = i;
            }
        }

        return bestCity;
    }
}
```

#### Complexity Analysis
- **Time Complexity:** $O(N^3)$. With $N = 100$, operations $\approx 10^6$, running in under $4$ ms!
- **Space Complexity:** $O(N^2)$ for the $100 \times 100$ distance matrix ($40$ KB memory).

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Transitive Closure via Warshall's Algorithm
- **Constraint:** Given directed graph, output boolean matrix `reach[i, j] = true` if there exists any path from $i$ to $j$.
- **Bitwise Optimization:**
  - Transition: `reach[i, j] = reach[i, j] | (reach[i, k] & reach[k, j])`.
  - In C#: Using `BitArray` or `ulong` bitmasks compresses the inner loop by $64\times$, running $O(V^3 / 64)$!

### Exercise 2: Course Schedule IV ([LeetCode 1462] - Medium)
- **Constraint:** Given prerequisites, answer queries whether course $u$ is a prerequisite of course $v$.
- **Floyd-Warshall Solution:** This is simply reachability / Transitive Closure! Compute `connected[i, j]` via Floyd-Warshall in $O(V^3)$, then answer each query in $O(1)$!

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
                     ALL-PAIRS SHORTEST PATHS DECISION TREE

                         How large is the vertex count V?
                                    /       \
                          V ≤ 400            V > 400
                            /                   \
                  [Floyd-Warshall]      Do negative edges exist?
                  O(V³) time, O(V²) space         /        \
                  Zero heap overhead!           YES         NO
                                                /            \
                                          [Johnson's APSP]   [V × Dijkstra]
                                          O(VE log V)        O(V(V+E)log V)
                                         (Day 174 Preview)
```

---

## 7. 🎯 Daily Checkpoint Questions

### Diagnostic Question
Prove why the intermediate vertex loop $k$ must be the outermost loop in the Floyd-Warshall algorithm.

### Architectural Model Answer
1. **Dynamic Programming Subproblem Definition:**
   The state $D^{(k)}[i, j]$ is defined as the shortest path from $i$ to $j$ using intermediate vertices selected strictly from the prefix set $\{0, 1, \dots, k\}$.
2. **The Inductive Dependency:**
   To compute optimal paths allowing vertex $k$ as a transit point ($D^{(k)}[i, j]$), the recurrence requires:
   $$D^{(k)}[i, j] = \min(D^{(k-1)}[i, j], D^{(k-1)}[i, k] + D^{(k-1)}[k, j])$$
   This transition strictly requires that the subpaths $i \rightsquigarrow k$ and $k \rightsquigarrow j$ have *already* been fully optimized across all intermediate transit nodes from $\{0, 1, \dots, k-1\}$.
3. **Failure of Innermost $k$:**
   If $k$ is placed in the innermost loop:
   - When iterating over pair $(i, j)$, the algorithm only tests whether a single node $k$ directly bridges $i$ and $j$.
   - The subpaths $i \to k$ and $k \to j$ are unoptimized direct edges. Paths requiring $\ge 3$ edges (e.g. $i \to a \to b \to j$) will never be discovered because subpath $i \to a \to b$ was never finalized before evaluating transit node $b$.
4. **Conclusion:**
   Placing $k$ as the outermost loop guarantees that each transit vertex is introduced incrementally, ensuring that when resolving phase $k$, all subproblems of size $k-1$ are already globally optimal across the entire $V \times V$ matrix.
