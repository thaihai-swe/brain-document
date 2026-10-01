---
title: "Week 21 — Day 146: All Paths in DAGs, Topological Dynamic Programming & Transitive Closure"
---

# Week 21 — Day 146: All Paths in DAGs, Topological Dynamic Programming & Transitive Closure

Welcome to **Day 146 of your DSA Mastery Journey**!

In graph theory, some problems are notoriously impossible to solve efficiently on general graphs. One of the most famous examples is the **Longest Simple Path Problem**: on a general directed graph with cycles, finding the longest path is **NP-hard** (equivalent to solving the Hamiltonian Path problem).

Yet, the moment a graph is guaranteed to be a **Directed Acyclic Graph (DAG)**, the Longest Path problem becomes solvable in strictly **linear time $\Theta(V + E)$**!

Why? Because the topological ordering of a DAG provides a **perfect, non-circular topological sequence of subproblems** that unlocks the full power of **Dynamic Programming (DP)**.

Today, you will master:
1. **Topological DP:** Solving Longest Path, Shortest Path, and Path Counting on DAGs in $\Theta(V + E)$ time.
2. **Transitive Closure:** Determining all-pairs reachability using high-speed 64-bit bitset operations ($O(V \cdot (V + E) / 64)$).
3. **All Paths Enumeration:** Backtracking on DAGs without cycle-detection overhead.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             DAY 146: TOPOLOGICAL DYNAMIC PROGRAMMING                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       TOPOLOGICAL DP INVARIANT    │                             │     TRANSITIVE CLOSURE BITSETS    │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • General Graphs: Longest Path    │                             │ • Reachability Matrix: R[u, v]    │
│   is NP-Hard!                     │                             │   = true if path u ~> v exists.   │
│ • On DAGs: Topological sort       │ ── High-Speed Bitwise OR ─► │ • Compact Bitsets (ulong / 64):   │
│   guarantees subproblem ordering: │                             │   Bitset[u] |= Bitset[v]          │
│   DP[v] = max(DP[v], DP[u] + w).  │                             │ • Solves [LC 1462] Course IV      │
│ • Runs in strictly O(V + E) time! │                             │   with O(1) query latency!        │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CANONICAL PROBLEM MASTERY           │
                          ├─────────────────────────────────────────────┤
                          │ • [LC 1462] Course Schedule IV (Transitive) │
                          │ • [LC 797] All Paths From Source to Target  │
                          │ • From-Scratch: DagPathAnalyzer in C#       │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🏔️ The Visual Mental Model: Mountain River Cascades & The Domino Line

Before writing DP transition recurrences or bitsets, picture a series of mountain waterfalls flowing downhill:

```
              🏔️ MOUNTAIN WATERFALLS & STRICT DOWNHILL CAUSALITY

   Water only flows strictly DOWNHILL. It can never flow uphill into a circle!
   
                      [ Summit A ] (Source)
                        /      \
                       ▼        ▼
                   [ Pool B ]  [ Pool C ]
                       \        /
                        ▼      ▼
                      [ Lake D ] (Sink)

   If you stand at Lake D and want to know:
   "What is the maximum travel time for a log to float from Summit A to Lake D?"
   
   • In a general graph with loops:
     Logs can circle in whirlpools forever! Finding the longest simple path is NP-HARD!
     
   • In a DAG (Strict Downhill Flow):
     1. Solve Summit A first: dist[A] = 0.
     2. Next solve Pool B and Pool C: dist[B] = 5, dist[C] = 8.
     3. Finally look at Lake D:
        - Route through B takes: dist[B] + 3 = 8
        - Route through C takes: dist[C] + 2 = 10
        ===> dist[D] = max(8, 10) = 10!
        
   BECAUSE WATER FLOWS ONLY DOWNHILL, NO FUTURE POOL CAN EVER ALTER AN EARLIER POOL!
   By processing pools in TOPOLOGICAL ORDER, every subproblem is 100% SOLVED
   before you ever need its answer!
```

---

### 1.2 🖼️ Visual Gallery: Topological DP Relaxation & 64-Bit Transitive Bitsets

#### 1. Linearized Topological Sequence: Every Arrow Points Left-to-Right!

```
   (0) ──► (1) ──► (3)
    │               ▲       Linearize in Topological Order:
    └───► (2) ──────┘       [ 0 ] ────────► [ 1 ] ────────► [ 2 ] ────────► [ 3 ]
                            
   Step 0: dist = [0, -inf, -inf, -inf]
   Step 1: Relax edges from 0:
           • 0 -> 1 (w=4): dist[1] = max(-inf, 0 + 4) = 4
           • 0 -> 2 (w=2): dist[2] = max(-inf, 0 + 2) = 2
   Step 2: Relax edges from 1:
           • 1 -> 3 (w=5): dist[3] = max(-inf, 4 + 5) = 9
   Step 3: Relax edges from 2:
           • 2 -> 3 (w=8): dist[3] = max(9, 2 + 8) = 10!
   
   Final Longest Path: dist[3] = 10 (Path: 0 -> 2 -> 3)!
```

#### 2. 64-Bit SIMD Bitset Transitive Closure:
How do we check if Node $u$ can reach Node $v$ in $O(1)$ time?

```
   Each row is a 64-bit integer (ulong). Bit k = 1 means "can reach node k":
   
   reach[u]:  0 0 1 0 1 1 0 0  (u can reach nodes 2, 3, 5)
   reach[v]:  0 1 0 0 0 1 0 0  (v can reach nodes 2, 6)
   ──────────────────────────────────────────────────────────
   OR (|):    0 1 1 0 1 1 0 0  (Combined in 1 single CPU cycle!)
   
   Propagates reachability across 64 nodes in a single hardware ALU clock tick!
```

---

### 1.3 🏛️ Memory Layout: Contiguous DP Array & Bitset Matrix

```
   1. DP State Memory:
   Index (v):   [ 0 ][ 1 ][ 2 ][ 3 ]
   dist[v]:     [ 0 ][ 4 ][ 2 ][ 10]
   paths[v]:    [ 1 ][ 1 ][ 1 ][ 2 ]
   
   2. Transitive Closure Matrix (V x (V/64) ulong words):
   Node 0:  [ 0x000000000000000E ]  ── (Bits 1, 2, 3 set)
   Node 1:  [ 0x0000000000000008 ]  ── (Bit 3 set)
   Node 2:  [ 0x0000000000000008 ]  ── (Bit 3 set)
   Node 3:  [ 0x0000000000000000 ]  ── (Leaf sink)
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Topological Subproblem Invariant:* In a DAG, if vertices are processed in topological order $u_1, u_2, \dots, u_n$, then whenever vertex $v$ is evaluated, **every possible path leading into $v$ has already been completely calculated**. There are no back edges or feedback loops that could update previous states.
  - *Topological Longest Path Formulation:*
    Let $\text{dist}[v]$ be the longest path from any source to $v$:
    $$\text{dist}[v] = \max_{(u, v) \in E} (\text{dist}[u] + \text{weight}(u, v))$$
  - *Path Counting Formulation:*
    Let $\text{paths}[v]$ be the number of distinct paths from source $S$ to vertex $v$:
    $$\text{paths}[v] = \sum_{(u, v) \in E} \text{paths}[u], \quad \text{with } \text{paths}[S] = 1$$
  - *Transitive Closure:* A binary relation matrix $R$ where $R[u, v] = 1$ if and only if there exists a directed path of length $\ge 0$ from $u$ to $v$.
  - *Misconceptions:*
    - *Misconception 1:* "Dijkstra's algorithm is required to find shortest paths on DAGs." **False!** Dijkstra takes $O((V + E) \log V)$ and fails on negative edge weights. Topological DP computes single-source shortest paths on DAGs in strictly $\Theta(V + E)$ time, and effortlessly handles negative edge weights without any infinite cycle issues!
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Critical Path Method (CPM):* In project management (PERT/GANTT charts) and hardware circuit timing analysis, the "critical path" is the longest path of sequential dependencies that dictates the minimum possible time to complete a project or clock cycle.
  - *Transitive Dependency Queries:* Quickly answering questions like: *"Does Service A transitively depend on Service B?"* or *"Is Class X an ancestor of Class Y?"* in $O(1)$ time after preprocessing.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Whenever you need to optimize paths (longest, shortest, min cost) or count paths on a known acyclic graph.
    - Answering repeated reachability queries between arbitrary pairs on a DAG ([LC 1462]).
  - *Failure Modes:*
    - Attempting to apply topological DP to a graph with cycles: without an acyclic invariant, the topological sort does not exist, creating infinite recursion or unresolvable cyclic dependencies.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Bitset Acceleration:* In transitive closure, representing reachability using 64-bit unsigned integers (`ulong`) allows CPU ALUs to perform bitwise OR across 64 vertices in a single clock cycle:
    $$\text{reach}[u][k] \mid= \text{reach}[v][k]$$
    This delivers a 64x speedup over standard boolean arrays.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "While the Longest Path problem is NP-hard on general graphs due to simple cycle constraints, it is solvable in strictly $O(V + E)$ on a DAG using Topological Dynamic Programming. By first linearizing the graph via Kahn's algorithm or DFS finish time, we process each node after all its predecessors have finished. We can relax edges in topological order to find longest paths, shortest paths with negative weights, or total path counts. For reachability queries, we propagate transitive closures using 64-bit bitsets in $O(V \cdot (V + E) / 64)$ time."
- **6. HOW (Complexity & Invariants):**
  - *Topological DP:* Time: $\Theta(V + E)$; Space: $\Theta(V)$.
  - *Bitset Transitive Closure:* Time: $O(V \cdot (V + E) / 64)$; Space: $O(V^2 / 64)$ bits.

---

### 1.5 📐 The Miracle of Topological DP: Longest Path in $O(V + E)$

Why is Longest Path NP-hard on general graphs, but linear on DAGs?

```
General Graph (Cyclic):                    DAG (Acyclic):
       [ A ] ◄───────┐                            [ A ]
      /     \        │                           /     \
     v       v       │                          v       v
   [ B ] ──► [ C ] ──┘                        [ B ] ──► [ C ]
                                                 \     /
How long can a path be?                           v   v
Cycles create INFINITE walks!                     [ D ]
Forcing "simple paths" (no repeats)       Every edge moves strictly FORWARD.
makes it equivalent to Hamiltonian        No back edges ==> No cycles.
Path, which is NP-Complete!               Topological order guarantees optimal subproblem!
```

#### The Dynamic Programming Algorithm on DAGs:
1. Compute a valid topological ordering of $G$: $[u_1, u_2, \dots, u_n]$.
2. Initialize `dist[v] = -infinity` for all $v$, and `dist[source] = 0`.
3. For each vertex $u$ in topological order:
   - If `dist[u] != -infinity`:
     - For each outgoing directed edge $(u, v)$ with weight $w$:
       $$\text{dist}[v] = \max(\text{dist}[v], \text{dist}[u] + w)$$
4. **Correctness Invariant:** Because edges flow only from earlier topological indices to later topological indices, by the time the outer loop reaches $v$, every possible predecessor of $v$ has already been processed. Therefore, `dist[v]` is finalized and optimal!

---

### 1.2 Transitive Closure via 64-Bit Bitsets

Given a DAG, how do we answer: *"Can node $u$ reach node $v$?"* for $Q$ queries?

If we run BFS for each query, each check costs $O(V + E)$, leading to $O(Q \cdot (V + E))$ query time.
Instead, we precompute the **Transitive Closure Matrix** in topological order:

```
For a DAG with 6 nodes (0 to 5):
Reachability can be packed into a single 64-bit integer (ulong)!

Bit position k represents whether node k is reachable:
Node 0: 0b001111 (Can reach 0, 1, 2, 3)
Node 1: 0b001100 (Can reach 2, 3)

When edge (0 -> 1) exists:
  Reach[0] |= Reach[1]
  In C#: reach[0] |= reach[1]; (1 CPU instruction for up to 64 nodes!)
```

To compute transitive closure:
1. Traverse vertices in **reverse topological order** (from sinks back to sources).
2. For each node $u$:
   - Set $\text{reach}[u][u] = 1$ (every node reaches itself).
   - For each outgoing edge $u \to v$:
     $$\text{reach}[u] \mid= \text{reach}[v]$$
3. Answering any reachability query $(u, v)$ takes **$O(1)$** bit-test time!

---

## 2. 💻 IMPLEMENT: Production C# Container

The `DagPathAnalyzer` provides:
1. `ComputeLongestPath`: Solves single-source and all-pairs longest path on DAGs in $\Theta(V + E)$.
2. `CountAllPaths`: Computes total distinct paths between source and destination.
3. `ComputeTransitiveClosure`: Precomputes reachability bitsets for $O(1)$ query time.
4. Full `Debug.Assert` validation tests.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedDSA.GraphFundamentals
{
    /// <summary>
    /// Production-grade engine for Topological Dynamic Programming,
    /// Path Counting, Longest Path on DAGs, and Bitset Transitive Closure.
    /// </summary>
    public sealed class DagPathAnalyzer
    {
        /// <summary>
        /// Computes the length of the longest path in a directed acyclic graph in O(V + E) time.
        /// </summary>
        /// <param name="numVertices">Total number of vertices.</param>
        /// <param name="edges">Array of unweighted directed edges [u, v].</param>
        /// <returns>The number of edges in the longest path.</returns>
        public static int ComputeLongestPath(int numVertices, int[][] edges)
        {
            if (numVertices <= 1) return 0;

            // 1. Build Adjacency and In-Degree
            List<int>[] adj = new List<int>[numVertices];
            for (int i = 0; i < numVertices; i++) adj[i] = new List<int>();
            int[] inDegree = new int[numVertices];

            foreach (var edge in edges)
            {
                adj[edge[0]].Add(edge[1]);
                inDegree[edge[1]]++;
            }

            // 2. Kahn's Topological Sort
            Queue<int> queue = new Queue<int>();
            for (int i = 0; i < numVertices; i++)
            {
                if (inDegree[i] == 0) queue.Enqueue(i);
            }

            int[] dp = new int[numVertices]; // dp[v] = longest path ending at v
            int maxPath = 0;

            while (queue.Count > 0)
            {
                int u = queue.Dequeue();
                maxPath = Math.Max(maxPath, dp[u]);

                foreach (int v in adj[u])
                {
                    // Relax edge (u, v)
                    if (dp[u] + 1 > dp[v])
                    {
                        dp[v] = dp[u] + 1;
                    }

                    inDegree[v]--;
                    if (inDegree[v] == 0)
                    {
                        queue.Enqueue(v);
                    }
                }
            }

            return maxPath;
        }

        /// <summary>
        /// Computes the total number of distinct paths from source to target in a DAG.
        /// </summary>
        public static long CountPaths(int numVertices, int[][] edges, int source, int target)
        {
            List<int>[] adj = new List<int>[numVertices];
            for (int i = 0; i < numVertices; i++) adj[i] = new List<int>();
            int[] inDegree = new int[numVertices];

            foreach (var edge in edges)
            {
                adj[edge[0]].Add(edge[1]);
                inDegree[edge[1]]++;
            }

            Queue<int> queue = new Queue<int>();
            for (int i = 0; i < numVertices; i++)
            {
                if (inDegree[i] == 0) queue.Enqueue(i);
            }

            long[] pathCount = new long[numVertices];
            pathCount[source] = 1;

            while (queue.Count > 0)
            {
                int u = queue.Dequeue();

                foreach (int v in adj[u])
                {
                    pathCount[v] += pathCount[u];
                    inDegree[v]--;
                    if (inDegree[v] == 0)
                    {
                        queue.Enqueue(v);
                    }
                }
            }

            return pathCount[target];
        }

        /// <summary>
        /// Precomputes Transitive Closure Reachability using 64-bit Bitsets.
        /// reach[u, v] is true if there exists a directed path from u to v.
        /// </summary>
        public static ulong[][] ComputeTransitiveClosure(int numVertices, int[][] edges)
        {
            List<int>[] adj = new List<int>[numVertices];
            for (int i = 0; i < numVertices; i++) adj[i] = new List<int>();
            int[] inDegree = new int[numVertices];

            foreach (var edge in edges)
            {
                adj[edge[0]].Add(edge[1]);
                inDegree[edge[1]]++;
            }

            // Obtain topological order
            Queue<int> queue = new Queue<int>();
            for (int i = 0; i < numVertices; i++)
            {
                if (inDegree[i] == 0) queue.Enqueue(i);
            }

            int[] topoOrder = new int[numVertices];
            int idx = 0;
            while (queue.Count > 0)
            {
                int u = queue.Dequeue();
                topoOrder[idx++] = u;
                foreach (int v in adj[u])
                {
                    inDegree[v]--;
                    if (inDegree[v] == 0) queue.Enqueue(v);
                }
            }

            // Word count for bitsets: ceil(numVertices / 64)
            int words = (numVertices + 63) / 64;
            ulong[][] reach = new ulong[numVertices][];
            for (int i = 0; i < numVertices; i++)
            {
                reach[i] = new ulong[words];
                // Set self reachability: reach[i] can reach i
                reach[i][i / 64] |= (1UL << (i % 64));
            }

            // Reverse topological propagation (from sinks back to sources)
            for (int i = numVertices - 1; i >= 0; i--)
            {
                int u = topoOrder[i];
                foreach (int v in adj[u])
                {
                    for (int w = 0; w < words; w++)
                    {
                        reach[u][w] |= reach[v][w];
                    }
                }
            }

            return reach;
        }

        /// <summary>
        /// Queries reachability in O(1) time using bitmasking.
        /// </summary>
        public static bool IsReachable(ulong[][] reach, int u, int v)
        {
            return (reach[u][v / 64] & (1UL << (v % 64))) != 0;
        }

        /// <summary>
        /// Comprehensive validation suite.
        /// </summary>
        public static void RunTests()
        {
            Console.WriteLine("Running DagPathAnalyzer Test Suite...");

            // Test 1: Longest Path on Diamond Graph
            // 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3
            // Length of longest path: 2 edges (0 -> 1 -> 3)
            int[][] edges1 = { new int[] { 0, 1 }, new int[] { 0, 2 }, new int[] { 1, 3 }, new int[] { 2, 3 } };
            int longest1 = ComputeLongestPath(4, edges1);
            Debug.Assert(longest1 == 2, $"Test 1 Failed: Expected longest path 2, got {longest1}");

            // Test 2: Path Counting on Diamond Graph
            // Number of paths from 0 to 3: 2 (0->1->3 and 0->2->3)
            long count1 = CountPaths(4, edges1, 0, 3);
            Debug.Assert(count1 == 2, $"Test 2 Failed: Expected 2 paths, got {count1}");

            // Test 3: Transitive Closure Bitset Queries
            ulong[][] reach1 = ComputeTransitiveClosure(4, edges1);
            Debug.Assert(IsReachable(reach1, 0, 3), "Test 3 Failed: 0 should reach 3.");
            Debug.Assert(IsReachable(reach1, 0, 1), "Test 3 Failed: 0 should reach 1.");
            Debug.Assert(!IsReachable(reach1, 1, 2), "Test 3 Failed: 1 should NOT reach 2.");
            Debug.Assert(!IsReachable(reach1, 3, 0), "Test 3 Failed: 3 should NOT reach 0 (Acyclic!).");

            // Test 4: Linear Chain (0 -> 1 -> 2 -> 3 -> 4)
            int[][] edges2 = { new int[] { 0, 1 }, new int[] { 1, 2 }, new int[] { 2, 3 }, new int[] { 3, 4 } };
            int longest2 = ComputeLongestPath(5, edges2);
            Debug.Assert(longest2 == 4, $"Test 4 Failed: Expected longest path 4, got {longest2}");

            Console.WriteLine("All DagPathAnalyzer tests PASSED successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Systems & Complexity Analysis

### 3.1 Complexity Comparison

| Problem | General Graph Complexity | DAG Complexity | Algorithmic Mechanism |
| :--- | :--- | :--- | :--- |
| **Shortest Path (Pos Weights)** | $O((V + E) \log V)$ (Dijkstra) | $\mathbf{\Theta(V + E)}$ | Topological DP edge relaxation |
| **Shortest Path (Neg Weights)** | $O(V \cdot E)$ (Bellman-Ford) | $\mathbf{\Theta(V + E)}$ | Topological DP edge relaxation |
| **Longest Simple Path** | **NP-Hard** ($O(V!)$) | $\mathbf{\Theta(V + E)}$ | Topological DP: `dp[v] = max(dp[v], dp[u] + w)` |
| **Path Counting ($s \rightsquigarrow t$)** | **#P-Complete** on cyclic graphs | $\mathbf{\Theta(V + E)}$ | Topological DP: `dp[v] = sum(dp[u])` |
| **Transitive Closure** | $O(V^3)$ (Floyd-Warshall) | $\mathbf{O(V \cdot E / 64)}$ | Reverse Topological 64-bit Bitset Propagation |

---

## 4. 🧩 APPLY: Canonical Problem Walkthroughs

### 4.1 [LeetCode 1462] Course Schedule IV (Medium)

#### Problem Description
There are a total of `numCourses` courses labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a, b]` indicates that you must take course `a` before course `b`. You are also given an array `queries` where `queries[j] = [u, v]`.

For each query, determine whether course `u` is a prerequisite of course `v` (directly or indirectly). Return a boolean array of answers.

#### Architectural Solution: Transitive Bitset Closure

```csharp
public class Solution
{
    public IList<bool> CheckIfPrerequisite(int numCourses, int[][] prerequisites, int[][] queries)
    {
        // reach[u, v] == true if course u is an ancestor/prerequisite of v
        bool[,] isPrereq = new bool[numCourses, numCourses];

        List<int>[] adj = new List<int>[numCourses];
        for (int i = 0; i < numCourses; i++) adj[i] = new List<int>();
        int[] inDegree = new int[numCourses];

        foreach (var p in prerequisites)
        {
            int u = p[0];
            int v = p[1];
            adj[u].Add(v);
            inDegree[v]++;
            isPrereq[u, v] = true;
        }

        Queue<int> queue = new Queue<int>();
        for (int i = 0; i < numCourses; i++)
        {
            if (inDegree[i] == 0) queue.Enqueue(i);
        }

        // Propagate reachability in topological order
        while (queue.Count > 0)
        {
            int u = queue.Dequeue();

            foreach (int v in adj[u])
            {
                // Everything that reaches u also reaches v
                for (int p = 0; p < numCourses; p++)
                {
                    if (isPrereq[p, u])
                    {
                        isPrereq[p, v] = true;
                    }
                }

                inDegree[v]--;
                if (inDegree[v] == 0)
                {
                    queue.Enqueue(v);
                }
            }
        }

        // Answer each query in O(1) time
        bool[] result = new bool[queries.Length];
        for (int i = 0; i < queries.Length; i++)
        {
            result[i] = isPrereq[queries[i][0], queries[i][1]];
        }

        return result;
    }
}
```

---

### 4.2 [LeetCode 797] All Paths From Source to Target (Medium)

#### Problem Description
Given a directed acyclic graph (`graph`) of `n` nodes labeled from `0` to `n - 1`, find all possible paths from node `0` to node `n - 1`, returning them in **any order**.

#### Architectural Intuition: Backtracking on Acyclic Graphs
In a general graph, backtracking requires an `inStack` boolean array to prevent infinite cycles. In a **DAG**, because cycles are mathematically impossible, we do not need cycle guards! A simple DFS with path push/pop cleanly enumerates all paths.

```csharp
public class Solution
{
    public IList<IList<int>> AllPathsSourceTarget(int[][] graph)
    {
        var result = new List<IList<int>>();
        var currentPath = new List<int> { 0 };
        Dfs(0, graph, currentPath, result);
        return result;
    }

    private void Dfs(int u, int[][] graph, List<int> currentPath, List<IList<int>> result)
    {
        if (u == graph.Length - 1)
        {
            result.Add(new List<int>(currentPath));
            return;
        }

        foreach (int v in graph[u])
        {
            currentPath.Add(v);
            Dfs(v, graph, currentPath, result);
            currentPath.RemoveAt(currentPath.Count - 1); // Backtrack
        }
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 1462] Course Schedule IV (Medium):**
   - Implement transitive closure via topological propagation.

2. **[LeetCode 797] All Paths From Source to Target (Medium):**
   - Solve via backtracking. Analyze the worst-case number of paths ($O(2^{V-1})$ on a complete DAG).

3. **Weighted DAG Critical Path Lab:**
   - Modify `DagPathAnalyzer` to accept positive edge weights (`int[][] weightedEdges = [u, v, w]`) and output both the critical path weight and the exact sequence of vertices forming the path.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Path Evaluation on Directed Graphs:

                    Does the Graph Contain Cycles?
                                 │
                 ┌───────────────┴───────────────┐
                 ▼ (YES)                         ▼ (NO - It is a DAG!)
      ┌─────────────────────┐         ┌───────────────────────────────┐
      │   GENERAL GRAPHS    │         │          TOPOLOGICAL DP       │
      ├─────────────────────┤         ├───────────────────────────────┤
      │ • Shortest: Dijkstra│         │ • Longest Path: Strictly      │
      │   O((V + E) log V). │         │   O(V + E) linear time!       │
      │ • Longest Path:     │         │ • Negative Weights: Safe and  │
      │   NP-Hard!          │         │   strictly O(V + E)!          │
      │ • Closure: O(V^3)   │         │ • Path Counting: O(V + E)!    │
      │   Floyd-Warshall.   │         │ • Transitive Closure:         │
      │                     │         │   O(V * E / 64) via Bitsets.  │
      └─────────────────────┘         └───────────────────────────────┘
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
Why can the longest path problem be solved in $O(V+E)$ time on a DAG, whereas it is NP-hard on general graphs?

### Architectural Model Answer
1. **The Source of NP-Hardness on General Graphs:**
   - In a general directed graph that may contain cycles, the concept of "longest path" must be restricted to **simple paths** (paths that do not repeat any vertex); otherwise, an algorithm could traverse a positive cycle infinitely to achieve infinite length.
   - Deciding whether there exists a simple path of length $|V| - 1$ in a general graph is the **Hamiltonian Path Problem**, which is proven to be **NP-complete**.
   - Because vertices in a cycle have cyclic dependencies, there is no natural sequence in which subproblems can be finalized without having to remember the entire set of visited vertices on the current path, creating an exponential state space ($O(2^V)$).

2. **Why the DAG Structure Resolves Cyclic Ambiguity:**
   - In a DAG, cycles are mathematically impossible. Every simple directed path is strictly finite, and no path can ever revisit a vertex.
   - A DAG admits a **Topological Ordering** of its vertices: $u_1, u_2, \dots, u_V$, such that every directed edge $(u_i, u_j)$ satisfies $i < j$.

3. **Optimal Substructure & Topological Linearization:**
   - Because all edges point strictly forward in the topological order, the longest path to any vertex $v$ depends exclusively on the finalized longest paths of its direct predecessors:
     $$\text{dist}[v] = \max_{(u, v) \in E} (\text{dist}[u] + \text{weight}(u, v))$$
   - When we process vertices in topological order:
     - By the time we arrive at vertex $v$, **every predecessor $u$ of $v$ has already been completely evaluated and will never be modified again**.
     - Each directed edge $(u, v)$ is relaxed exactly once.
   - Total time is $\sum_{u \in V} (1 + \text{out-degree}(u)) = \Theta(V + E)$.
   - Thus, the absence of directed cycles transforms an NP-hard combinatorial search into a single-pass linear dynamic program.
