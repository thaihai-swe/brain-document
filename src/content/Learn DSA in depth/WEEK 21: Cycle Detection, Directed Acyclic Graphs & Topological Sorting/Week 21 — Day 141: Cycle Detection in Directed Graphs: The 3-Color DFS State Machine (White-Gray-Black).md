---
title: "Week 21 — Day 141: Cycle Detection in Directed Graphs: The 3-Color DFS State Machine (White-Gray-Black)"
---

# Week 21 — Day 141: Cycle Detection in Directed Graphs: The 3-Color DFS State Machine (White-Gray-Black)

Welcome to **Day 141 of your DSA Mastery Journey**!

Throughout Week 20, you established the foundations of graph modeling: representations (Adjacency List, Adjacency Matrix, and Compressed Sparse Row), DFS discovery/finish timestamps, the Parenthesis Theorem, and BFS shortest-path optimality.

Today, we enter **Week 21: Cycle Detection, Directed Acyclic Graphs (DAGs) & Topological Sorting**.

A **Directed Acyclic Graph (DAG)** is the foundational structure of computer science workflows: compiler intermediate representations (LLVM DAGs), software package dependencies (npm, NuGet, pip), distributed workflow orchestrators (Apache Airflow, Temporal), and financial transaction clearing engines.

To determine whether a directed graph is a valid DAG, we must answer one critical question: **Does this graph contain a directed cycle?**

If you attempt to detect cycles in a directed graph using a simple boolean `visited[]` array, your algorithm will fail catastrophically—flagging valid acyclic diamond graphs as cyclic! Today, you will master the canonical solution: **The 3-Color DFS State Machine (White, Gray, Black)**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             DAY 141: THE 3-COLOR DFS STATE MACHINE                               │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       THE THREE VERTEX STATES     │                             │     WHY BOOLEAN VISITED FAILS     │
│         (Color Transition)        │                             │        (The Diamond Hazard)       │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • WHITE (0): Unvisited node.      │                             │ • Consider diamond: A -> B, A -> C│
│ • GRAY  (1): Active on current    │                             │   B -> D, C -> D. (Zero cycles!). │
│   recursion call stack (ancestor).│ ── State Machine Defense ─► │ • With boolean visited: D is      │
│ • BLACK (2): Fully explored &     │                             │   visited via B; when C reaches D,│
│   backtracked. Safe leaf/subgraph.│                             │   visited[D] == true --> FALSE    │
│ • INVARIANT: Cycle exists IFF     │                             │   POSITIVE CYCLE ERROR!           │
│   DFS sees an edge to a GRAY node!│                             │ • 3-Color Fix: D is BLACK (safe!).│
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CANONICAL PROBLEM MASTERY           │
                          ├─────────────────────────────────────────────┤
                          │ • [LC 207] Course Schedule (Cycle Detection)│
                          │ • [LC 802] Find Eventual Safe States.       │
                          │ • From-Scratch: DirectedCycleDetector in C# │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🚦 The Visual Mental Model: Wet Cement Footprints & The Ouroboros Snake

Before writing color state flags or cycle detection code, picture walking through an ancient maze of rooms connected by one-way corridors:

```
          🐍 THE OUROBOROS & THE WET CEMENT FOOTPRINT ANALOGY

   Imagine exploring rooms with a special pair of boots:
   
   1. WHITE (0) = UNTOUCHED FRESH SNOW:
      You have never entered this room. It is completely pristine.
      
   2. GRAY (1)  = WET CEMENT (ACTIVE FOOTPRINTS):
      You step into the room and leave wet cement footprints.
      This room is CURRENTLY ON YOUR ACTIVE PATH (your call stack).
      
   3. BLACK (2) = HARDENED DRY CONCRETE (SEALED ROOM):
      You finished exploring all exits from this room and backtracked.
      The room is permanently sealed and safe. No loops can ever start here.

   NOW WATCH WHAT HAPPENS WHEN YOU LOOK DOWN AT A DOORWAY:
   
   • Scenario A: Corridor leads to a GRAY room (WET CEMENT)!
     💥 DISASTER! You just walked in a circle and arrived back at your own footprints!
     Like a snake biting its own tail (an Ouroboros), you have discovered a DIRECTED CYCLE!
     
   • Scenario B: Corridor leads to a BLACK room (HARDENED CONCRETE)!
     ✅ SAFE! You didn't loop! You simply merged into a road that was already explored
     and completely finished earlier. This is a CROSS EDGE, not a cycle!
```

---

### 1.2 🖼️ Visual Gallery: The 3-Color State Machine & The Diamond Graph Dissection

```
                     THE 3-COLOR DFS STATE MACHINE
                     
   ┌───────────────┐     First Entered      ┌───────────────┐     Exited & Sealed   ┌───────────────┐
   │     WHITE     │ ─────────────────────► │     GRAY      │ ────────────────────► │     BLACK     │
   │  (Unvisited)  │   disc[u] assigned     │ (Active Stack)│    fin[u] assigned    │  (Completed)  │
   └───────────────┘                        └───────────────┘                       └───────────────┘
                                                    │
                                                    ▼ Saw edge to Gray!
                                            🚨 DIRECTED CYCLE DETECTED!
```

#### Why Naive Boolean `visited[]` Fails: The Diamond Graph
A classic trap in technical interviews is using a single boolean `visited[]` array on directed graphs:

```
               THE DIAMOND GRAPH (Strictly Acyclic! Zero Cycles!)

                                [ Node 0 ]
                                 /      \
                                ▼        ▼
                            [ Node 1 ]  [ Node 2 ]
                                \        /
                                 ▼      ▼
                                [ Node 3 ]

   ❌ Trace with Flawed Boolean visited[]:
   1. DFS(0) -> DFS(1) -> DFS(3). Mark 0, 1, 3 visited. Node 3 has no exits. Backtrack!
   2. From 0, explore neighbor 2 -> DFS(2). Mark 2 visited.
   3. From 2, inspect neighbor 3:
      - Node 3 is already marked visited!
      - Naive logic panics: "Visited node hit! CYCLE DETECTED!" 
      - 💥 FALSE POSITIVE! There is NO cycle! All paths flow downward!

   ✅ Trace with 3-Color State Machine:
   1. DFS(0) [Gray] -> DFS(1) [Gray] -> DFS(3) [Gray]. 
      Node 3 has no exits -> turns BLACK! Backtrack to 1 (turns BLACK), then 0.
   2. From 0, explore neighbor 2 -> DFS(2) [Gray].
   3. From 2, inspect neighbor 3:
      - color[3] == BLACK! (Not Gray!)
      - Engine recognizes: "Node 3 is already sealed. This is a Cross Edge. Safe!"
      - Node 2 turns BLACK. Node 0 turns BLACK.
   • Result: Correct! Zero cycles reported!
```

---

### 1.3 🏛️ Side-by-Side Memory Layout: Byte Array State & Stack Evolution

```
   State Tracking in RAM (Compact byte[] color array):
   
   Index (v):     [ 0 ]        [ 1 ]        [ 2 ]        [ 3 ]
   color[v]:      [GRAY ]      [BLACK]      [WHITE]      [BLACK]
   Meaning:      Active Stack   Closed       Unvisited    Closed
   
   Physical Call Stack at this exact moment:
   ┌────────────────────────────────────────────────────────┐
   │ Frame 1: DFS(u=0)  ── color[0] is GRAY                 │
   │ Frame 2: DFS(u=2)  ── exploring edge (2 -> 0)...       │
   │          Inspects color[0] == GRAY ===> CYCLE FOUND!   │
   └────────────────────────────────────────────────────────┘
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* A **Directed Cycle** is a non-empty sequence of directed edges $v_0 \to v_1 \to v_2 \to \dots \to v_k \to v_0$ where the start and end vertices are identical. A directed graph containing zero directed cycles is called a **Directed Acyclic Graph (DAG)**.
  - *The 3-Color State Machine:*
    1. **WHITE (`0`):** The vertex has not yet been discovered or processed.
    2. **GRAY (`1`):** The vertex has been discovered and is **currently residing on the active recursion call stack**. All of its ancestors currently being explored are Gray.
    3. **BLACK (`2`):** The vertex and all of its descendants have been completely explored and backtracked. It is permanently closed.
  - *The Back Edge Invariant:* In a directed graph, a directed cycle exists **if and only if** during DFS, an edge $(u, v)$ is traversed where $v$ is **GRAY**.
    $$\text{Cycle Exists} \iff \exists (u, v) \in E \text{ such that } \text{Color}[v] == \text{GRAY}$$
  - *Misconception Check:*
    - *Misconception 1:* "In a directed graph, if an edge points to an already-visited node, a cycle exists." **False!** In the diamond graph ($A \to B \to D$ and $A \to C \to D$), when exploring from $C$, vertex $D$ is already visited. However, $D$ is already fully processed (**Black**). This edge $C \to D$ is a **Cross Edge**, not a cycle! Only edges pointing to **Gray** nodes (active ancestors) represent **Back Edges** that close a cycle.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates false-positive cycle reports in directed graphs with multiple converging paths (cross and forward edges).
  - *Algorithmic Purpose:* Essential for detecting deadlock in distributed database lock managers, verifying build task graphs in compilers, and checking prerequisite feasibility.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Checking if a directed graph has dependencies that can be scheduled (Course Schedule, build order).
    - Finding memory reference cycles in garbage collectors.
    - Determining deadlocked processes in operating system resource allocation graphs.
  - *When to Avoid / Failure Modes:*
    - Undirected graphs: in an undirected graph, undirected edges are bidirectional ($u - v \implies u \to v$ and $v \to u$). Without parent tracking, every undirected edge looks like a 2-cycle. Use **Parent-Tracking DFS** instead (Day 142).
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Array Memory:* A compact byte array `byte[] color` of size $V$ stored in contiguous memory. Each state requires only 2 bits of information, minimizing cache misses during edge traversals.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To detect cycles in a directed graph, a boolean visited array fails because cross edges to already-completed nodes produce false positives. Instead, I use a 3-color DFS state machine: White is unvisited, Gray is currently active on the recursion stack, and Black is fully explored. A directed cycle exists if and only if DFS encounters an edge pointing to a Gray node—which represents a back edge to an active ancestor. This runs in optimal $O(V + E)$ time and $O(V)$ space."
- **6. HOW (Operations, Implementation & State Trace):**
  - *Complexity Profile:* Time: $\Theta(V + E)$ single DFS pass; Space: $\Theta(V)$ for color state array and recursion call stack.

---

## 2. 🛠️ IMPLEMENT: Production-Grade From-Scratch C# Container

Below is the production-grade C# container `DirectedCycleDetector`. It features:
1. The 3-Color DFS state machine.
2. Full **cycle path reconstruction** (extracting the exact chain of vertices forming the cycle).
3. Identification of **Eventual Safe States** ([LeetCode 802]).
4. Disconnected graph handling via an outer vertex loop.
5. Self-verifying test suite with automated assertions.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace GraphFundamentals.CycleDetection
{
    public enum NodeColor : byte
    {
        White = 0, // Unvisited
        Gray = 1,  // Currently on recursion stack (ancestor)
        Black = 2  // Fully processed and safe
    }

    /// <summary>
    /// Production-grade Directed Cycle Detector using the 3-Color DFS State Machine.
    /// Provides cycle detection, exact cycle path extraction, and safe state identification.
    /// </summary>
    public class DirectedCycleDetector
    {
        private readonly int _vertexCount;
        private readonly List<int>[] _adj;

        public int VertexCount => _vertexCount;

        public DirectedCycleDetector(int vertexCount)
        {
            if (vertexCount <= 0)
                throw new ArgumentOutOfRangeException(nameof(vertexCount));

            _vertexCount = vertexCount;
            _adj = new List<int>[vertexCount];
            for (int i = 0; i < vertexCount; i++) _adj[i] = new List<int>();
        }

        public void AddDirectedEdge(int u, int v)
        {
            ValidateVertex(u);
            ValidateVertex(v);
            _adj[u].Add(v);
        }

        /// <summary>
        /// Determines if the directed graph contains at least one cycle.
        /// Runs in strictly O(V + E) time.
        /// </summary>
        public bool HasCycle()
        {
            var color = new NodeColor[_vertexCount];

            for (int u = 0; u < _vertexCount; u++)
            {
                if (color[u] == NodeColor.White)
                {
                    if (DfsCheckCycle(u, color))
                        return true;
                }
            }

            return false;
        }

        private bool DfsCheckCycle(int u, NodeColor[] color)
        {
            color[u] = NodeColor.Gray;

            var neighbors = _adj[u];
            for (int i = 0; i < neighbors.Count; i++)
            {
                int v = neighbors[i];

                // Back Edge: v is Gray -> Cycle detected!
                if (color[v] == NodeColor.Gray)
                    return true;

                if (color[v] == NodeColor.White)
                {
                    if (DfsCheckCycle(v, color))
                        return true;
                }
            }

            color[u] = NodeColor.Black;
            return false;
        }

        /// <summary>
        /// Finds and reconstructs the exact sequence of vertices forming a cycle.
        /// Returns an empty list if the graph is a DAG.
        /// </summary>
        public List<int> FindCyclePath()
        {
            var color = new NodeColor[_vertexCount];
            var parent = new int[_vertexCount];
            Array.Fill(parent, -1);

            int cycleStart = -1;
            int cycleEnd = -1;

            for (int u = 0; u < _vertexCount; u++)
            {
                if (color[u] == NodeColor.White)
                {
                    if (DfsFindPath(u, color, parent, ref cycleStart, ref cycleEnd))
                        break;
                }
            }

            if (cycleStart == -1) return new List<int>(); // No cycle

            // Reconstruct path: cycleEnd -> ... -> cycleStart -> cycleEnd
            var cyclePath = new List<int>();
            cyclePath.Add(cycleStart);

            for (int curr = cycleEnd; curr != cycleStart; curr = parent[curr])
            {
                cyclePath.Add(curr);
            }
            cyclePath.Add(cycleStart);
            cyclePath.Reverse();

            return cyclePath;
        }

        private bool DfsFindPath(int u, NodeColor[] color, int[] parent, ref int cycleStart, ref int cycleEnd)
        {
            color[u] = NodeColor.Gray;

            var neighbors = _adj[u];
            for (int i = 0; i < neighbors.Count; i++)
            {
                int v = neighbors[i];

                if (color[v] == NodeColor.Gray)
                {
                    cycleStart = v;
                    cycleEnd = u;
                    return true;
                }

                if (color[v] == NodeColor.White)
                {
                    parent[v] = u;
                    if (DfsFindPath(v, color, parent, ref cycleStart, ref cycleEnd))
                        return true;
                }
            }

            color[u] = NodeColor.Black;
            return false;
        }

        /// <summary>
        /// Returns all eventual safe nodes (nodes that cannot reach any directed cycle).
        /// Corresponds to LeetCode 802.
        /// </summary>
        public List<int> FindEventualSafeNodes()
        {
            var color = new NodeColor[_vertexCount];
            var safeNodes = new List<int>();

            for (int i = 0; i < _vertexCount; i++)
            {
                if (IsNodeSafe(i, color))
                {
                    safeNodes.Add(i);
                }
            }

            return safeNodes;
        }

        private bool IsNodeSafe(int u, NodeColor[] color)
        {
            if (color[u] != NodeColor.White)
            {
                return color[u] == NodeColor.Black; // Black is safe, Gray is part of a cycle
            }

            color[u] = NodeColor.Gray;

            var neighbors = _adj[u];
            for (int i = 0; i < neighbors.Count; i++)
            {
                int v = neighbors[i];
                if (!IsNodeSafe(v, color))
                {
                    return false; // Propagates cycle risk
                }
            }

            color[u] = NodeColor.Black;
            return true;
        }

        private void ValidateVertex(int v)
        {
            if (v < 0 || v >= _vertexCount)
                throw new ArgumentOutOfRangeException(nameof(v));
        }
    }

    /// <summary>
    /// Verification test suite for 3-Color Directed Cycle Detection.
    /// </summary>
    public static class DirectedCycleDetectorTests
    {
        public static void RunAllTests()
        {
            Console.WriteLine("Executing Directed Cycle Detector Verification Suite...");

            // Test 1: Diamond Graph (Acyclic verification)
            var diamond = new DirectedCycleDetector(vertexCount: 4);
            diamond.AddDirectedEdge(0, 1);
            diamond.AddDirectedEdge(0, 2);
            diamond.AddDirectedEdge(1, 3);
            diamond.AddDirectedEdge(2, 3);

            Debug.Assert(!diamond.HasCycle(), "Diamond graph incorrectly classified as cyclic!");
            Debug.Assert(diamond.FindCyclePath().Count == 0);
            Debug.Assert(diamond.FindEventualSafeNodes().Count == 4);

            // Test 2: Graph with Directed Cycle: 1 -> 2 -> 3 -> 1
            var cyclic = new DirectedCycleDetector(vertexCount: 4);
            cyclic.AddDirectedEdge(0, 1);
            cyclic.AddDirectedEdge(1, 2);
            cyclic.AddDirectedEdge(2, 3);
            cyclic.AddDirectedEdge(3, 1); // Cycle: 1-2-3-1

            Debug.Assert(cyclic.HasCycle(), "Failed to detect directed cycle!");
            var cyclePath = cyclic.FindCyclePath();
            Debug.Assert(cyclePath.Count == 4);
            Debug.Assert(cyclePath[0] == cyclePath[^1], "Cycle path endpoints must match!");

            // Test 3: Eventual Safe States
            // Node 0 -> 1 -> 2 -> 1 (Cycle)
            // Node 3 -> (terminal safe)
            var safeTest = new DirectedCycleDetector(vertexCount: 4);
            safeTest.AddDirectedEdge(0, 1);
            safeTest.AddDirectedEdge(1, 2);
            safeTest.AddDirectedEdge(2, 1);

            var safeNodes = safeTest.FindEventualSafeNodes();
            Debug.Assert(safeNodes.Count == 1 && safeNodes[0] == 3);

            Console.WriteLine("All Directed Cycle Detection tests passed with 100% assertions verified!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### Asymptotic Profile

| Operation | Time Complexity | Auxiliary Space | Call Stack Limit |
| :--- | :--- | :--- | :--- |
| **`HasCycle()`** | $\Theta(V + E)$ | $\Theta(V)$ (`byte[] color`) | Max recursion depth $\le V$ |
| **`FindCyclePath()`** | $\Theta(V + E)$ | $\Theta(V)$ (`parent[]`) | Max recursion depth $\le V$ |
| **`FindEventualSafeNodes()`** | $\Theta(V + E)$ | $\Theta(V)$ | Max recursion depth $\le V$ |

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### Problem 1: [LeetCode 207] Course Schedule (Medium)

#### Problem Statement
There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [ai, bi]` indicates that you must take course `bi` first if you want to take course `ai`.
Return `true` if you can finish all courses. Otherwise, return `false`.

#### Algorithmic Strategy (Directed Cycle Equivalence)
- The prerequisite relationship represents a directed edge: `bi -> ai` (taking `bi` unlocks `ai`).
- Can you finish all courses?
  - You can finish all courses if and only if there are **NO circular dependencies** (no directed cycles).
  - If a cycle exists ($A \to B \to C \to A$), none of those courses can ever be started because each requires a prerequisite that requires itself!
- Model the courses as a directed graph and apply the **3-Color DFS State Machine**:
  - `0 = White` (unvisited)
  - `1 = Gray` (currently being explored on active stack)
  - `2 = Black` (fully verified safe, no cycles downstream)
- Return `true` if no cycle is found.

#### Production Solution in C#
```csharp
using System.Collections.Generic;

public class CourseScheduleSolution
{
    public static bool CanFinish(int numCourses, int[][] prerequisites)
    {
        // Step 1: Build Adjacency List: bi -> ai
        var adj = new List<int>[numCourses];
        for (int i = 0; i < numCourses; i++) adj[i] = new List<int>();

        for (int i = 0; i < prerequisites.Length; i++)
        {
            int course = prerequisites[i][0];
            int prereq = prerequisites[i][1];
            adj[prereq].Add(course);
        }

        // Step 2: 3-Color State Array
        // 0 = White, 1 = Gray, 2 = Black
        byte[] color = new byte[numCourses];

        for (int course = 0; course < numCourses; course++)
        {
            if (color[course] == 0)
            {
                if (HasCycleDfs(course, adj, color))
                {
                    return false; // Cycle detected -> impossible to finish
                }
            }
        }

        return true;
    }

    private static bool HasCycleDfs(int u, List<int>[] adj, byte[] color)
    {
        color[u] = 1; // Mark Gray (active on recursion stack)

        var neighbors = adj[u];
        for (int i = 0; i < neighbors.Count; i++)
        {
            int v = neighbors[i];

            if (color[v] == 1) return true; // Reached Gray node -> Directed Cycle!
            if (color[v] == 0 && HasCycleDfs(v, adj, color)) return true;
        }

        color[u] = 2; // Mark Black (completed & verified safe)
        return false;
    }
}
```

---

### Problem 2: [LeetCode 802] Find Eventual Safe States (Medium)

#### Problem Statement
There is a directed graph of `n` nodes labeled from `0` to `n - 1`. A terminal node is a node with no outgoing edges.
A node is an **eventual safe node** if every possible path starting from that node leads to a terminal node (or another safe node).
Return an array of all safe nodes sorted in ascending order.

#### Algorithmic Strategy
- Any node that is part of a cycle, or can reach a cycle, is **NOT safe** because a path from it can loop infinitely without reaching a terminal node.
- A node is safe if and only if **all paths starting from it lead to terminal nodes without encountering any cycles**.
- This directly maps to our 3-color state machine:
  - If a node finishes with `color[u] == 2` (Black), it is strictly safe!
  - If a node encounters a `Gray` node, it is part of or leads to a cycle.

#### Production Solution in C#
```csharp
using System.Collections.Generic;

public class EventualSafeNodesSolution
{
    public static IList<int> EventualSafeNodes(int[][] graph)
    {
        int n = graph.Length;
        byte[] color = new byte[n]; // 0: White, 1: Gray, 2: Black
        var safeNodes = new List<int>();

        for (int i = 0; i < n; i++)
        {
            if (IsSafeDfs(i, graph, color))
            {
                safeNodes.Add(i);
            }
        }

        return safeNodes;
    }

    private static bool IsSafeDfs(int u, int[][] graph, byte[] color)
    {
        if (color[u] != 0)
        {
            return color[u] == 2; // Black is safe, Gray is cyclic
        }

        color[u] = 1; // Mark Gray

        foreach (int v in graph[u])
        {
            if (!IsSafeDfs(v, graph, color))
            {
                return false;
            }
        }

        color[u] = 2; // Mark Black (safe)
        return true;
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 207] Course Schedule (Medium):**
   - Implement the 3-color DFS solution and verify correctness on disconnected cyclic components.

2. **[LeetCode 802] Find Eventual Safe States (Medium):**
   - Solve using the 3-color state machine as demonstrated.

3. **Cycle Extraction Lab:**
   - *Task:* Given a directed graph with a cycle, modify `DirectedCycleDetector` to print the exact nodes in order: `A -> B -> C -> A`.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Directed Cycle Detection Strategy:

                     ┌───────────────────────────────────────────────┐
                     │          DIRECTED GRAPH CYCLE DETECTION       │
                     └───────────────────────────────────────────────┘
                                             │
             ┌───────────────────────────────┴───────────────────────────────┐
             ▼                                                               ▼
┌──────────────────────────────────────────┐    ┌──────────────────────────────────────────┐
│         3-COLOR DFS STATE MACHINE        │    │          KAHN'S IN-DEGREE BFS            │
├──────────────────────────────────────────┤    ├──────────────────────────────────────────┤
│ • Technique: White/Gray/Black tracking.  │    │ • Technique: In-degree zero queue wave.  │
│ • Detects: Back edge to Gray node.       │    │ • Detects: Dequeued count < V.           │
│ • Advantage: Can easily extract exact    │    │ • Advantage: Simultaneously produces a   │
│   cycle path and identify safe states.   │    │   valid topological ordering!            │
│ • Standard: LeetCode 207, 802.           │    │ • Standard: LeetCode 210, Build Systems. │
└──────────────────────────────────────────┘    └──────────────────────────────────────────┘
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
Why is encountering a Gray node during a 3-color DFS a necessary and sufficient condition for the existence of a directed cycle?

### Architectural Model Answer
1. **The State Meaning of Gray:**
   - In a 3-color DFS traversal:
     - **White:** Vertex is undiscovered.
     - **Gray:** Vertex has been discovered, its discovery timestamp has been recorded, but its finish timestamp has not yet occurred. It **currently resides on the active recursion call stack**.
     - **Black:** Vertex and all reachable subtrees have been fully explored and its finish timestamp has been assigned.
   - Therefore, at any point during DFS, the set of all currently Gray vertices forms a **simple directed ancestor path** leading from the search root directly to the currently active vertex $u$:
     $$\text{Root} \rightsquigarrow g_1 \rightsquigarrow g_2 \rightsquigarrow \dots \rightsquigarrow u$$

2. **Sufficiency (Gray Node $\implies$ Cycle):**
   - Suppose DFS is currently at vertex $u$ and examines outgoing edge $(u, v)$ where $\text{Color}[v] == \text{GRAY}$.
   - Because $v$ is Gray, $v$ is an active ancestor on the call stack. This means there already exists an active directed path:
     $$v \rightsquigarrow u$$
   - Traversal of edge $(u, v)$ adds the closing link:
     $$v \rightsquigarrow u \to v$$
   - This forms a closed directed loop where start and end vertices are identical. Thus, encountering a Gray node is a **sufficient condition** for a directed cycle.

3. **Necessity (Cycle $\implies$ Encountering a Gray Node):**
   - Suppose the graph contains a directed cycle $C = v_0 \to v_1 \to v_2 \to \dots \to v_k \to v_0$.
   - Without loss of generality, let $v_0$ be the **very first vertex of $C$** discovered by DFS. At time `disc[v0]`, $v_0$ turns Gray.
   - For every other vertex $v_i \in C$, $v_i$ is White when $v_0$ is discovered.
   - By the **White Path Theorem**, because there is a path from $v_0$ to $v_k$ consisting entirely of White vertices at time `disc[v0]`, every vertex in $C$ must become a descendant of $v_0$ in the DFS tree before $v_0$ can finish and turn Black.
   - In particular, vertex $v_k$ will be discovered and turn Gray while $v_0$ is still Gray.
   - When DFS inspects the outgoing edges of $v_k$, it must examine the edge $(v_k, v_0)$.
   - At that moment, because $v_0$ has not finished, $\text{Color}[v_0]$ is still **GRAY**.
   - Therefore, DFS is mathematically guaranteed to inspect an edge pointing to a Gray node.

4. **Conclusion:**
   - Encountering an edge to a Gray node is both **necessary and sufficient** for the existence of a directed cycle. Cross and forward edges to Black nodes do not indicate cycles.
