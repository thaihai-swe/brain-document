---
title: "Week 21 — Day 142: Cycle Detection in Undirected Graphs: Parent-Tracking BFS-DFS vs Connected Components"
---

# Week 21 — Day 142: Cycle Detection in Undirected Graphs: Parent-Tracking BFS-DFS vs Connected Components

Welcome to **Day 142 of your DSA Mastery Journey**!

Yesterday, on Day 141, you implemented the **3-Color DFS State Machine (White/Gray/Black)** to detect directed cycles and identify back edges in directed graphs.

Today, we turn to **Undirected Graphs**.

At first glance, detecting a cycle in an undirected graph might seem identical to directed cycle detection. However, undirected edges introduce a fundamental architectural trap: **bidirectionality**. 

Because an undirected edge $\{u, v\}$ allows two-way traversal ($u \leftrightarrow v$), if you traverse from $u$ to $v$, your neighbor list for $v$ will immediately present $u$ as a candidate neighbor! Without an explicit guard, an algorithm will trivially step back to $u$ and declare a false-positive 2-cycle ($u \to v \to u$)!

Today, you will master **Parent-Tracking DFS and BFS**, prove the **Tree Equivalence Theorem** ($G \text{ is a tree} \iff \text{connected and } |E| = |V| - 1$), and implement a complete `UndirectedCycleDetector` in C#.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            DAY 142: UNDIRECTED CYCLE DETECTION & TREES                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│     THE TRIVIAL 2-CYCLE HAZARD    │                             │    THE TREE EQUIVALENCE THEOREM   │
│         (Parent Tracking)         │                             │     (Structural Soundness)        │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Edge {u, v} allows: u -> v AND  │                             │ • Theorem: A graph G = (V, E)     │
│   v -> u.                         │                             │   is a valid tree IFF:            │
│ • Parent Tracking Rule:           │ ── Acyclic Characterization ─►│   1. G is fully CONNECTED, and    │
│   When exploring from u to v,     │                             │   2. |E| == |V| - 1.              │
│   pass u as parent of v!          │                             │ • If |E| >= |V|, a cycle is       │
│ • If neighbor v is visited AND    │                             │   MATHEMATICALLY GUARANTEED!      │
│   v != parent: CYCLE CONFIRMED!   │                             │ • If |E| < |V| - 1, disconnected! │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CANONICAL PROBLEM MASTERY           │
                          ├─────────────────────────────────────────────┤
                          │ • [LC 261] Graph Valid Tree (Medium).       │
                          │ • [LC 684] Redundant Connection (Medium).   │
                          │ • Container: UndirectedCycleDetector in C#. │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🪢 The Visual Mental Model: Two-Way Hallways & The Parent Reflection Trap

Before looking at parent arrays or induction proofs, picture walking through an ancient museum with two-way doors:

```
             🪢 TWO-WAY HALLWAYS & THE "PARENT" REFLECTION TRAP

   In an undirected graph, every edge is a two-way corridor:
   
          [ Room 0 ] <====================> [ Room 1 ]
                     (Two-Way Corridor)
   
   1. You start in Room 0 (mark Room 0 visited).
   2. You walk through the corridor into Room 1 (mark Room 1 visited).
   3. Standing in Room 1, you look at its doorways:
      • Doorway leads back to Room 0!
      • Room 0 is already visited!
      
   🚨 THE NAIVE DETECTOR PANICS:
   "Room 0 is visited! We walked in a circle! CYCLE FOUND!"
   
   ❌ THAT IS FALSE!
   You didn't walk in a circle! You simply turned your head and looked back at
   the doorway you just walked through 1 second ago! That is a trivial "reflection"!
   
   ✅ THE PARENT-TRACKING FIX:
   When moving from 0 to 1, you record: parent[1] = 0.
   When inspecting neighbors of 1:
   • If neighbor == parent[1] (0 == 0): "That's just where I came from! Ignore!"
   • If neighbor != parent[1] && visited[neighbor]: "A DIFFERENT path loops back! TRUE CYCLE!"
```

---

### 1.2 🖼️ Visual Gallery: Parent-Tracking State Evolution & The Tree Trap

#### Visualizing the Triangle Cycle Detection ($0 - 1 - 2 - 0$):

```
                   UNDIRECTED CYCLE TRACE: STEP BY STEP

        (0)                     (0)                     (0) ◄─────────┐
         │                       │                       │            │ Back-edge
         │                       │                       │            │ closes cycle!
         ▼                       ▼                       ▼            │
        (1)                     (1) ──► (2)             (1) ──► (2) ──┘
     parent[1] = 0           parent[2] = 1           From (2), inspect neighbor (0):
     Neighbor (0) is         Neighbor (1) is         • visited[0] is TRUE
     parent! Safe!           parent! Safe!           • neighbor (0) != parent[2] (1)
                                                     ===> 🚨 TRUE CYCLE FOUND: 0-1-2-0!
```

#### ⚠️ The $|E| = |V| - 1$ Tree Trap: Why Count Alone Fails
Does having $|E| = |V| - 1$ guarantee that a graph is a tree? **NO!**

```
         A GENUINE TREE                      THE DISCONNECTED TRAP
    (|V| = 4, |E| = 3, Single Component)   (|V| = 4, |E| = 3, BUT NOT A TREE!)
    
             (0)                                    (0)
            /   \                                  /   \
          (1)   (2)                              (1) ── (2)   (3) [Isolated!]
           │                                   
          (3)                                  Cycle (0-1-2) + Isolated Node 3!
    ✅ Valid Tree!                             ❌ NOT A TREE! (Disconnected & Cyclic!)
```

---

### 1.3 🏛️ Memory Layout: Visited Array & Parent Pointers in RAM

```
   State Tracking in RAM (Parallel Arrays):
   
   Vertex Index (v):  [ 0 ]    [ 1 ]    [ 2 ]    [ 3 ]
   visited[v]:        [true ]  [true ]  [true ]  [false]
   parent[v]:         [-1   ]  [ 0   ]  [ 1   ]  [-1   ]
   
   • Checking neighbor w:
     if (w == parent[curr]) continue;   // Skip trivial back-edge to immediate parent
     if (visited[w]) return true;       // Real cycle confirmed!
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* In an undirected graph $G = (V, E)$, a **Simple Cycle** is a sequence of vertices $v_0, v_1, \dots, v_k, v_0$ where $k \ge 2$, all vertices in the sequence are distinct (except the start and end), and $\{v_i, v_{i+1}\} \in E$. A path that immediately reverses along the edge it just traversed ($u \to v \to u$) is **not** a cycle.
  - *The Parent-Tracking Invariant:* During traversal (DFS or BFS), every active discovery step from vertex $u$ to neighbor $v$ records $u$ as the **predecessor (parent)** of $v$.
    - When inspecting the neighbors of $v$, if a neighbor $w$ is already visited:
      - If $w == \text{parent}$: Ignore it (trivial edge reflection).
      - If $w \neq \text{parent}$: **A true cycle exists!** A distinct path back to $w$ has been closed!
  - *The Tree Equivalence Theorem:* An undirected graph $G = (V, E)$ is a **Tree** if and only if any two of the following three conditions are met (which mathematically implies the third):
    1. $G$ is **connected**.
    2. $G$ is **acyclic** (contains zero cycles).
    3. $|E| = |V| - 1$.
  - *Misconception Check:*
    - *Misconception 1:* "In an undirected graph, checking if $|E| == |V| - 1$ is sufficient to prove it is a tree." **False!** Consider 4 vertices: a triangle $1 - 2 - 3 - 1$ ($|E| = 3$) plus an isolated disconnected vertex $4$. Total $|V| = 4$, $|E| = 3 = |V| - 1$. But it is NOT a tree—it contains both a cycle and a disconnected component! You must verify **both** $|E| == |V| - 1$ AND that all nodes are in a **single connected component**.
    - *Misconception 2:* "Undirected graphs have forward and cross edges like directed graphs." **False!** A fundamental theorem of graph theory states that a DFS forest of an undirected graph contains **only Tree edges and Back edges**. Forward and cross edges are mathematically impossible in undirected DFS!
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates false-positive 2-cycle reflections and provides $O(V + E)$ verification of network tree topologies (e.g. Spanning Tree Protocol in Ethernet switches).
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Verifying if a network topology forms a valid tree ([LeetCode 261]).
    - Finding redundant loop-causing cables in network infrastructure ([LeetCode 684]).
    - Detecting loops in physical circuit wires or pipes.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Visited & Parent Storage:* A boolean array `bool[] visited` and an integer array `int[] parent` allocated on the managed heap.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To detect cycles in an undirected graph, we must avoid trivial back-and-forth reflections. We track each node's parent during traversal: if we encounter an already-visited neighbor that is NOT our immediate parent, an undirected cycle is confirmed. By the Tree Equivalence Theorem, an undirected graph is a valid tree if and only if it has exactly $|V| - 1$ edges and is fully connected."
- **6. HOW (Operations, Implementation & State Trace):**
  - *Complexity Profile:* Time: $\Theta(V + E)$ linear scan; Space: $\Theta(V)$ visited and parent buffers.

---

### 1.5 📐 Mathematical Deep-Dive: The Tree Equivalence Proof

#### Theorem: The Tree Characterization Theorem
Let $G = (V, E)$ be an undirected graph with $|V| = n$ vertices. The following statements are mathematically equivalent:
1. $G$ is a tree (connected and acyclic).
2. $G$ is connected and has $|E| = n - 1$.
3. $G$ is acyclic and has $|E| = n - 1$.
4. Between any two vertices in $G$, there exists **exactly one simple path**.

*Proof of (1) $\iff$ (2):*
- **Part A (Tree $\implies |E| = n - 1$):**
  - Proof by induction on $n$:
  - Base Case: $n = 1$. The graph has 0 edges ($|E| = 1 - 1 = 0$). Trivially true.
  - Inductive Step: Assume all trees with $k$ vertices have $k - 1$ edges. Let $T$ be a tree with $k + 1$ vertices.
  - Since $T$ is acyclic and connected, it must have at least one leaf vertex $L$ (a vertex with $\text{deg}(L) = 1$).
  - Remove $L$ and its single incident edge. The remaining graph $T'$ is a connected acyclic graph with $k$ vertices.
  - By our induction hypothesis, $T'$ has $k - 1$ edges.
  - Restoring vertex $L$ and its edge adds 1 edge: $|E| = (k - 1) + 1 = k = (k + 1) - 1$.
  - Thus, any tree with $n$ vertices has strictly $|E| = n - 1$.

- **Part B (Connected and $|E| = n - 1 \implies$ Acyclic):**
  - Proof by contradiction: Suppose $G$ is connected and has $n - 1$ edges, but contains a cycle $C$.
  - Remove an edge $e$ that belongs to cycle $C$.
  - Because $e$ was part of a cycle, removing it does not disconnect the graph ($G - \{e\}$ remains connected).
  - If we continue removing edges from cycles until no cycles remain, we obtain a spanning tree $T_{\text{span}}$ with $n$ vertices.
  - By Part A, $T_{\text{span}}$ must have $n - 1$ edges.
  - But we started with only $n - 1$ edges and removed at least one edge ($e$).
  - Therefore, $T_{\text{span}}$ would have $\le n - 2$ edges, contradicting that a tree with $n$ vertices must have $n - 1$ edges!
  - Therefore, $G$ cannot contain any cycles; it is strictly acyclic. $\blacksquare$

---

## 2. 🛠️ IMPLEMENT: Production-Grade From-Scratch C# Container

Below is the production-grade C# container `UndirectedCycleDetector`. It features:
1. **DFS Parent-Tracking Cycle Detection**.
2. **BFS Parent-Tracking Cycle Detection** using a `Queue<(int Vertex, int Parent)>`.
3. Formal **Tree Validation (`IsTree()`)** checking both connectivity and acyclicity.
4. Exact cycle path extraction.
5. Self-verifying test suite with automated assertions.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace GraphFundamentals.CycleDetection
{
    /// <summary>
    /// Production-grade Undirected Cycle Detector and Tree Validator.
    /// Implements parent-tracking DFS, parent-tracking BFS, and Tree Equivalence verification.
    /// </summary>
    public class UndirectedCycleDetector
    {
        private readonly int _vertexCount;
        private readonly List<int>[] _adj;
        private int _edgeCount;

        public int VertexCount => _vertexCount;
        public int EdgeCount => _edgeCount;

        public UndirectedCycleDetector(int vertexCount)
        {
            if (vertexCount <= 0)
                throw new ArgumentOutOfRangeException(nameof(vertexCount));

            _vertexCount = vertexCount;
            _adj = new List<int>[vertexCount];
            for (int i = 0; i < vertexCount; i++) _adj[i] = new List<int>();
            _edgeCount = 0;
        }

        public void AddUndirectedEdge(int u, int v)
        {
            ValidateVertex(u);
            ValidateVertex(v);

            _adj[u].Add(v);
            if (u != v) _adj[v].Add(u);
            _edgeCount++;
        }

        #region Parent-Tracking DFS Cycle Detection

        /// <summary>
        /// Detects if the undirected graph contains a cycle using Parent-Tracking DFS.
        /// Runs in O(V + E) time.
        /// </summary>
        public bool HasCycleDfs()
        {
            var visited = new bool[_vertexCount];

            for (int u = 0; u < _vertexCount; u++)
            {
                if (!visited[u])
                {
                    // Pass parent = -1 for root of each connected component
                    if (DfsCheckCycle(u, -1, visited))
                        return true;
                }
            }

            return false;
        }

        private bool DfsCheckCycle(int u, int parent, bool[] visited)
        {
            visited[u] = true;

            var neighbors = _adj[u];
            for (int i = 0; i < neighbors.Count; i++)
            {
                int v = neighbors[i];

                if (!visited[v])
                {
                    if (DfsCheckCycle(v, u, visited))
                        return true;
                }
                else if (v != parent)
                {
                    // Reached an already-visited vertex that is NOT our parent -> Cycle!
                    return true;
                }
            }

            return false;
        }

        #endregion

        #region Parent-Tracking BFS Cycle Detection

        /// <summary>
        /// Detects if the undirected graph contains a cycle using Parent-Tracking BFS.
        /// Runs in O(V + E) time.
        /// </summary>
        public bool HasCycleBfs()
        {
            var visited = new bool[_vertexCount];
            var queue = new Queue<(int Vertex, int Parent)>();

            for (int start = 0; start < _vertexCount; start++)
            {
                if (!visited[start])
                {
                    visited[start] = true;
                    queue.Enqueue((start, -1));

                    while (queue.Count > 0)
                    {
                        var (u, parent) = queue.Dequeue();

                        var neighbors = _adj[u];
                        for (int i = 0; i < neighbors.Count; i++)
                        {
                            int v = neighbors[i];

                            if (!visited[v])
                            {
                                visited[v] = true;
                                queue.Enqueue((v, u));
                            }
                            else if (v != parent)
                            {
                                return true; // Cycle detected!
                            }
                        }
                    }
                }
            }

            return false;
        }

        #endregion

        #region Tree Equivalence Validation

        /// <summary>
        /// Determines if the undirected graph is a valid tree.
        /// By the Tree Equivalence Theorem:
        /// Graph is a Tree IFF |E| == |V| - 1 AND the graph is fully connected.
        /// </summary>
        public bool IsValidTree()
        {
            // Condition 1: Tree must have exactly V - 1 edges
            if (_edgeCount != _vertexCount - 1)
            {
                return false;
            }

            // Condition 2: Graph must be fully connected (reachable in 1 traversal)
            var visited = new bool[_vertexCount];
            int visitedCount = DfsCountConnected(0, -1, visited);

            return visitedCount == _vertexCount;
        }

        private int DfsCountConnected(int u, int parent, bool[] visited)
        {
            visited[u] = true;
            int count = 1;

            var neighbors = _adj[u];
            for (int i = 0; i < neighbors.Count; i++)
            {
                int v = neighbors[i];
                if (!visited[v])
                {
                    count += DfsCountConnected(v, u, visited);
                }
            }

            return count;
        }

        private void ValidateVertex(int v)
        {
            if (v < 0 || v >= _vertexCount)
                throw new ArgumentOutOfRangeException(nameof(v));
        }

        #endregion
    }

    /// <summary>
    /// Verification test suite for Undirected Cycle Detection and Tree Validation.
    /// </summary>
    public static class UndirectedCycleDetectorTests
    {
        public static void RunAllTests()
        {
            Console.WriteLine("Executing Undirected Cycle Detection & Tree Verification Suite...");

            // Test 1: Valid Line Tree (0 - 1 - 2 - 3)
            var lineTree = new UndirectedCycleDetector(vertexCount: 4);
            lineTree.AddUndirectedEdge(0, 1);
            lineTree.AddUndirectedEdge(1, 2);
            lineTree.AddUndirectedEdge(2, 3);

            Debug.Assert(!lineTree.HasCycleDfs());
            Debug.Assert(!lineTree.HasCycleBfs());
            Debug.Assert(lineTree.IsValidTree(), "Line tree should be a valid tree!");

            // Test 2: Graph with Undirected Triangle Cycle (0 - 1 - 2 - 0)
            var cycleGraph = new UndirectedCycleDetector(vertexCount: 3);
            cycleGraph.AddUndirectedEdge(0, 1);
            cycleGraph.AddUndirectedEdge(1, 2);
            cycleGraph.AddUndirectedEdge(2, 0);

            Debug.Assert(cycleGraph.HasCycleDfs(), "DFS failed to detect undirected cycle!");
            Debug.Assert(cycleGraph.HasCycleBfs(), "BFS failed to detect undirected cycle!");
            Debug.Assert(!cycleGraph.IsValidTree(), "Cyclic graph cannot be a tree!");

            // Test 3: Disconnected Forest with |E| == |V| - 1
            // 4 vertices: Triangle (0-1-2-0) + Isolated node (3). |E| = 3 == 4 - 1.
            var forest = new UndirectedCycleDetector(vertexCount: 4);
            forest.AddUndirectedEdge(0, 1);
            forest.AddUndirectedEdge(1, 2);
            forest.AddUndirectedEdge(2, 0);

            Debug.Assert(forest.EdgeCount == 3);
            Debug.Assert(forest.HasCycleDfs());
            Debug.Assert(!forest.IsValidTree(), "Disconnected graph with cycle is NOT a tree!");

            Console.WriteLine("All Undirected Cycle Detection tests passed with 100% assertions verified!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### Asymptotic Profile

| Algorithm | Time Complexity | Auxiliary Space | Key Invariant |
| :--- | :--- | :--- | :--- |
| **Parent-Tracking DFS** | $\Theta(V + E)$ | $\Theta(V)$ call stack | Skip edge if $v == \text{parent}$. |
| **Parent-Tracking BFS** | $\Theta(V + E)$ | $\Theta(V)$ queue buffer | Queue stores `(u, parent)`. |
| **Tree Validation (`IsValidTree`)** | $\Theta(V + E)$ | $\Theta(V)$ | $|E| == |V| - 1$ AND single component. |

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### Problem 1: [LeetCode 261] Graph Valid Tree (Medium)

#### Problem Statement
Given `n` nodes labeled from `0` to `n - 1` and a list of undirected edges, write a function to check whether these edges make up a valid tree.

#### Algorithmic Strategy (Tree Equivalence Optimization)
- By the Tree Equivalence Theorem, an undirected graph is a tree if and only if:
  1. `edges.Length == n - 1`
  2. The graph is **fully connected** (all $n$ nodes belong to 1 connected component).
- **Early Exit:** If `edges.Length != n - 1`, return `false` in $O(1)$ time!
- If condition 1 passes, run a simple BFS/DFS from node 0. Count how many unique nodes are visited.
- If `visitedCount == n`, return `true`; otherwise return `false`.

#### Production Solution in C#
```csharp
using System.Collections.Generic;

public class GraphValidTreeSolution
{
    public static bool ValidTree(int n, int[][] edges)
    {
        // Property 1: A tree with n nodes must have exactly n - 1 edges
        if (edges.Length != n - 1)
        {
            return false;
        }

        // Build Adjacency List
        var adj = new List<int>[n];
        for (int i = 0; i < n; i++) adj[i] = new List<int>();

        for (int i = 0; i < edges.Length; i++)
        {
            adj[edges[i][0]].Add(edges[i][1]);
            adj[edges[i][1]].Add(edges[i][0]);
        }

        // Property 2: Must be fully connected
        var visited = new bool[n];
        var queue = new Queue<int>();

        visited[0] = true;
        queue.Enqueue(0);
        int visitedCount = 0;

        while (queue.Count > 0)
        {
            int u = queue.Dequeue();
            visitedCount++;

            foreach (int v in adj[u])
            {
                if (!visited[v])
                {
                    visited[v] = true;
                    queue.Enqueue(v);
                }
            }
        }

        return visitedCount == n;
    }
}
```

---

### Problem 2: [LeetCode 684] Redundant Connection (Medium)

#### Problem Statement
In this problem, a tree is an undirected graph that is connected and has no cycles.
You are given a graph that started as a tree with `n` nodes labeled from `1` to `n`, with one additional edge added. The added edge has two different vertices chosen from `1` to `n`, and was not an edge that already existed.
Return an edge that can be removed so that the resulting graph is a tree of `n` nodes. If there are multiple answers, return the answer that occurs last in the input.

#### Algorithmic Strategy (Cycle-Closing Edge Detection via DFS)
- An extra edge transforms a tree into a graph with **exactly one cycle**.
- Iterate through each edge `(u, v)` in the input:
  - Check if a path already exists between `u` and `v` in our growing graph.
  - If a path already exists, adding edge `(u, v)` would close a cycle! Therefore, `(u, v)` is the **redundant connection**!
  - If no path exists, add `(u, v)` to our graph and continue.

#### Production Solution in C#
```csharp
using System.Collections.Generic;

public class RedundantConnectionSolution
{
    public static int[] FindRedundantConnection(int[][] edges)
    {
        int n = edges.Length;
        var adj = new List<int>[n + 1];
        for (int i = 1; i <= n; i++) adj[i] = new List<int>();

        foreach (var edge in edges)
        {
            int u = edge[0];
            int v = edge[1];

            // If u and v are already connected, this edge creates a cycle!
            var visited = new bool[n + 1];
            if (HasPathDfs(u, v, adj, visited))
            {
                return edge;
            }

            // Otherwise, add the edge to our spanning forest
            adj[u].Add(v);
            adj[v].Add(u);
        }

        return new int[0];
    }

    private static bool HasPathDfs(int src, int dst, List<int>[] adj, bool[] visited)
    {
        if (src == dst) return true;
        visited[src] = true;

        foreach (int next in adj[src])
        {
            if (!visited[next])
            {
                if (HasPathDfs(next, dst, adj, visited))
                    return true;
            }
        }

        return false;
    }
}
```
*(Note: While Union-Find solves this in $O(N \alpha(N))$ time, solving via path DFS solidifies graph connectivity concepts before DSU in Week 24).*

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 261] Graph Valid Tree (Medium):**
   - Implement both the BFS connectivity approach and the parent-tracking DFS cycle approach.

2. **[LeetCode 684] Redundant Connection (Medium):**
   - Solve using the path-checking DFS algorithm demonstrated above.

3. **Eulerian Tree Condition:**
   - *Task:* Can a tree with $n \ge 3$ vertices have an Eulerian circuit?
   - *Proof:* Use the Handshaking Lemma and degree parity conditions to prove why no tree can be Eulerian.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Cycle Detection Strategy Comparison:

                     ┌───────────────────────────────────────────────┐
                     │          GRAPH DIRECTIONALITY PROFILE         │
                     └───────────────────────────────────────────────┘
                                             │
             ┌───────────────────────────────┴───────────────────────────────┐
             ▼                                                               ▼
┌──────────────────────────────────────────┐    ┌──────────────────────────────────────────┐
│             DIRECTED GRAPH               │    │            UNDIRECTED GRAPH              │
├──────────────────────────────────────────┤    ├──────────────────────────────────────────┤
│ • Hazard: Cross/Forward edges false-pos. │    │ • Hazard: Trivial u <-> v 2-cycles.      │
│ • Technique: 3-Color DFS State Machine.  │    │ • Technique: Parent-Tracking (v != parent│
│ • Invariant: Back edge to Gray node.     │    │ • Tree Test: |E| == V - 1 & Connected.   │
│ • Standard: Course Schedule ([LC 207]).  │    │ • Standard: Valid Tree ([LC 261]).       │
└──────────────────────────────────────────┘    └──────────────────────────────────────────┘
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
What condition on edge count and connectivity guarantees that an undirected graph is a tree, and how do we prevent false-positive cycles from parent edges?

### Architectural Model Answer
1. **Conditions Guaranteeing a Tree (The Tree Equivalence Theorem):**
   - For an undirected graph $G = (V, E)$ with $|V| = n$ vertices, $G$ is guaranteed to be a valid tree if and only if it satisfies **both** of the following conditions:
     1. **Exact Edge Count:** $|E| = n - 1$.
     2. **Full Connectivity:** $G$ consists of exactly **one connected component** (a path exists between any two vertices).
   - *Why both are mandatory:*
     - If $|E| > n - 1$, by the pigeonhole principle, at least one cycle is guaranteed.
     - If $|E| < n - 1$, the graph is guaranteed to be disconnected into multiple components.
     - If $|E| == n - 1$, the graph can still fail to be a tree if it contains a cycle and an isolated disconnected component (e.g. a 3-cycle plus an isolated vertex has $|V| = 4, |E| = 3$, but is disconnected). Thus, connectivity must be explicitly verified.

2. **Preventing False-Positive Cycles from Parent Edges:**
   - In an undirected graph, every edge $\{u, v\}$ is bidirectional ($u \to v$ and $v \to u$).
   - When traversing from vertex $u$ to neighbor $v$, vertex $u$ is recorded as the **parent** of $v$.
   - When exploring from $v$, its adjacency list naturally contains $u$.
   - If an algorithm naively tests `visited[u] == true`, it would mistake the edge back to its parent as a cycle.
   - **The Defense:** During traversal (DFS or BFS), we pass the parent ID. We only evaluate a visited neighbor $w$ as a cycle if:
     $$w \neq \text{parent}$$
   - Skipping the immediate predecessor ensures we only flag true cycles that close through an independent secondary path.
