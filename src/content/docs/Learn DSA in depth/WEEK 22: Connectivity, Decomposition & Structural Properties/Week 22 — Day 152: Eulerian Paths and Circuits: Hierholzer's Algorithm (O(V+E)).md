---
title: "Week 22 — Day 152: Eulerian Paths and Circuits: Hierholzer's Algorithm (O(V+E))"
---

# Week 22 — Day 152: Eulerian Paths and Circuits: Hierholzer's Algorithm (O(V+E))

Welcome to **Day 152 of your DSA Mastery Journey**!

In 1736, the Swiss mathematician Leonhard Euler solved the historic **Seven Bridges of Königsberg** problem: *Can a pedestrian walk through the city crossing each of the seven bridges spanning the Pregel River exactly once?*

Euler proved that it was impossible, inventing the mathematical field of **Graph Theory** in the process.

Today, we study the modern algorithmic formulation of this historic breakthrough: **Eulerian Trails, Eulerian Circuits, and Hierholzer's Algorithm**.

Eulerian paths are crucial across computer science:
- **Bioinformatics & Genome Sequencing:** Reconstructing full DNA sequences from millions of overlapping short reads using **De Bruijn Graphs**.
- **Robotics & Routing:** Snowplow routing, street sweeper scheduling, and mail carrier delivery paths (the Chinese Postman Problem).
- **Network Packet Sniffing:** Verifying that network diagnostic probes inspect every physical link exactly once.
- **Flight & Itinerary Scheduling:** Finding continuous flight itineraries that consume every purchased ticket ([LeetCode 332]).

Today, you will master:
1. **The Degree Parity Invariants:** Necessary and sufficient conditions for Eulerian trails and circuits in both undirected and directed graphs.
2. **Hierholzer's Algorithm (1873):** Achieving optimal $\Theta(V + E)$ linear-time trail reconstruction via post-order cycle splicing.
3. **Lexicographical Tie-Breaking:** Combining Hierholzer's algorithm with min-heaps in **[LeetCode 332] Reconstruct Itinerary**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   DAY 152: EULERIAN PATHS, CIRCUITS & HIERHOLZER'S ALGORITHM                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       DEGREE PARITY CONDITIONS    │                             │       HIERHOLZER'S ALGORITHM      │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Undirected Circuit:             │                             │ 1. Start at valid start node.     │
│   ALL vertices have EVEN degree.  │ ── Post-Order Splice ─────► │ 2. Follow unused edges greedily.  │
│ • Undirected Trail:               │                             │ 3. When stuck (no outgoing edges):│
│   EXACTLY 2 vertices have ODD deg.│                             │    Push node to result stack!     │
│ • Directed Circuit:               │                             │ 4. Unwind stack in reverse!       │
│   inDegree(v) == outDegree(v).    │                             │ • Strict O(V + E) linear time!    │
│ • Directed Trail:                 │                             │ • Slices sub-cycles seamlessly!   │
│   out - in = 1 (start), in-out = 1│                             │                                   │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CANONICAL PROBLEM MASTERY           │
                          ├─────────────────────────────────────────────┤
                          │ • [LC 332] Reconstruct Itinerary (Hard)    │
                          │ • [LC 753] Cracking the Safe (De Bruijn)    │
                          │ • From-Scratch: HierholzerEulerianEngine    │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🌉 The Visual Mental Model: The Königsberg Bridges & One-Stroke Drawing

Before analyzing degree parities or Hierholzer's stack, picture the classic childhood puzzle of drawing a figure in **one single pen stroke** without lifting your pencil and without retracing any line:

```
              🌉 THE SEVEN BRIDGES & ONE-STROKE DRAWING INUITION

   Imagine drawing an envelope figure on a piece of paper:
   
   • Every time your pencil ENTERS an intersection and LEAVES it:
     It consumes exactly 2 edges (1 In, 1 Out)!
     
   • Therefore, every intermediate vertex MUST have an EVEN degree!
   • The ONLY possible exceptions:
     1. The START vertex: Your pen leaves 1 more time than it enters (Out - In = 1).
     2. The END vertex:   Your pen enters 1 more time than it leaves (In - Out = 1).

   EULER'S PARITY LAW (1736):
   • Closed Circuit (Ends where you started): 100% of all vertices MUST have EVEN degree!
   • Open Trail (Distinct start & finish):    EXACTLY TWO vertices have ODD degree!
```

---

### 1.2 🖼️ Visual Gallery: Hierholzer's Sub-Cycle Splice State Evolution

The hardest challenge in Eulerian traversal is getting trapped in a premature dead-end before visiting side loops:

```
                  THE SUB-CYCLE SPLICING TRICK
                  
            [ A ] ──────► [ B ] ──────► [ C ] ──────► [ A ]  (Main Highway)
                            │             ▲
                            ▼             │  (Side Detour)
                          [ D ] ──────► [ E ]

   1. Suppose we start at A and greedily drive: A -> B -> C -> A.
      💥 DEAD END! We reached A, but we completely missed the detour (B -> D -> E -> B)!
      
   2. HOW HIERHOLZER SOLVES THIS VIA POST-ORDER STACK:
      • When a node runs out of outgoing roads, PUSH IT TO A RESULT STACK:
        - At A: No more exits! Push [ A ]. Backtrack to C.
        - At C: No more exits! Push [ C ]. Backtrack to B.
      • At B: Look! Node B STILL HAS UNUSED EXITS (B -> D)!
        - Follow the detour: B -> D -> E -> B.
        - Detour dead-ends at B: Push [ B ], Push [ E ], Push [ D ].
        - Finally backtrack to A and push [ A ].

   3. RESULT STACK (Unwound / Reversed):
      Top: [ A ] ──► [ B ] ──► [ D ] ──► [ E ] ──► [ B ] ──► [ C ] ──► [ A ]
      
   THE DETOUR (B -> D -> E -> B) WAS SPLICED DIRECTLY INTO THE HIGHWAY!
```

---

### 1.3 🏛️ Memory Layout: Fast Edge Cursors vs Slow `RemoveAt(0)`

A devastating performance bug in naive implementations is doing `adj[u].RemoveAt(0)` (which takes $O(E)$ to shift array elements, causing $O(E^2)$ overall slowdown):

```
   ❌ SLOW: list.RemoveAt(0)
   Shifts all downstream elements in RAM: O(E^2) runtime disaster!

   ✅ FAST: Head-Edge Cursor Array (int[] edgeCursor):
   
   Adjacency for B:  [ (B->C), (B->D) ]
   edgeCursor[B]:    starts at 0
   
   • Step 1: Read adj[B][edgeCursor[B]++] ──► Takes (B->C), cursor advances to 1.
   • Step 2: Read adj[B][edgeCursor[B]++] ──► Takes (B->D), cursor advances to 2.
   • Step 3: edgeCursor[B] == Count       ──► Instantly know B has 0 edges left!
   
   Zero memory copying, zero heap allocations, strictly O(V + E) linear execution!
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Definitions:*
    - An **Eulerian Trail** (or Path) is a walk in a graph that visits **every edge exactly once**.
    - An **Eulerian Circuit** (or Tour) is an Eulerian trail that starts and ends at the **same vertex**.
    - (Contrast with a *Hamiltonian Path*, which visits every *vertex* once and is NP-complete!).
  - *Euler's Degree Parity Invariants:*
    - **Undirected Graphs:**
      1. *Circuit Exists:* Graph is connected (ignoring isolated vertices) and **every vertex has an even degree**.
      2. *Trail Exists:* Graph is connected and **exactly two vertices have odd degree** (one is the start, one is the end).
    - **Directed Graphs:**
      1. *Circuit Exists:* Graph is strongly connected and for every vertex $v$, $\text{in-degree}(v) == \text{out-degree}(v)$.
      2. *Trail Exists:* Graph is weakly connected and:
         - Exactly one vertex $s$ has $\text{out-degree}(s) - \text{in-degree}(s) = 1$ (the unique Start node).
         - Exactly one vertex $t$ has $\text{in-degree}(t) - \text{out-degree}(t) = 1$ (the unique End node).
         - All other vertices have $\text{in-degree}(v) == \text{out-degree}(v)$.
  - *Hierholzer's Algorithm Mechanics:*
    1. Start at the designated start vertex.
    2. Greedily follow unused outgoing edges, removing them from the graph as they are traversed.
    3. When a vertex has no more unused outgoing edges, **push it onto an output stack** and backtrack to its predecessor.
    4. Reversing the output stack yields the valid Eulerian sequence!
  - *Misconceptions:*
    - *Misconception 1:* "Eulerian path and Hamiltonian path are similar complexity." **False!** Eulerian path is linear $\Theta(V + E)$ via Hierholzer's algorithm. Hamiltonian path is **NP-hard** ($O(V!)$).
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Optimal Coverage:* Solves any problem requiring complete traversal of a network's connections with zero redundant edge traversals.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Reconstructing sequences from directed edge segments ([LC 332]).
    - Generating minimal-length string superstrings containing all $K$-length subsequences (De Bruijn graphs, [LC 753]).
  - *Failure Modes:*
    - Failing to reverse the post-order result stack: Hierholzer discovers the end of the trail first upon getting stuck, so prepending or reversing is strictly mandatory.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Data Structures:* Adjacency lists utilizing `PriorityQueue` or sorted arrays to support deterministic lexicographical edge selection.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "An Eulerian trail visits every edge exactly once. For a directed graph, an Eulerian trail exists if all nodes except two have balanced in-degree and out-degree, with the start having out-degree minus in-degree equal to 1, and the end having in-degree minus out-degree equal to 1. To reconstruct the trail in linear $O(V + E)$ time, I use Hierholzer's algorithm: I greedily traverse unused edges, and when a node has no remaining edges, I push it to a stack. Unwinding the stack reverses the post-order exploration, seamlessly splicing closed sub-cycles into the main trail."
- **6. HOW (Complexity & Invariants):**
  - *Time Complexity:* $\Theta(V + E)$ without sorting; $O(E \log E)$ if outgoing edges must be explored in lexicographical order.
  - *Space Complexity:* $\Theta(V + E)$ to store the graph and recursion/result stack.

---

### 1.5 Why Post-Order Unwinding Splices Sub-Cycles

Consider a graph with a main loop and a sub-cycle:
```
Graph Architecture:
       [ A ] ──► [ B ] ──► [ C ] ──► [ A ]
                   │         ▲
                   ▼         │
                 [ D ] ──► [ E ]
Main Cycle: A -> B -> C -> A
Sub-Cycle attached at B: B -> D -> E -> C -> A ...
```

If we greedily rush forward:
1. $A \to B \to C \to A$.
2. Node $A$ is now stuck! It has no more unused outgoing edges.
3. Hierholzer's algorithm pushes $A$ to the stack: `Stack = [ A ]`.
4. Backtrack to $C$. Node $C$ has no more edges $\implies$ push $C$: `Stack = [ A, C ]`.
5. Backtrack to $B$. Node $B$ still has an unused edge to $D$!
6. Traverse $B \to D \to E \to C \dots$
7. When all edges are exhausted, the nodes are popped from the stack in reverse order.
8. The sub-cycle $B \to D \to E$ is spliced **directly into the middle** of the main trail at vertex $B$!

---

## 2. 💻 IMPLEMENT: Production C# Container

The `HierholzerEulerianEngine` provides:
1. `FindEulerianTrailDirected`: Finds directed Eulerian trails with cycle splicing.
2. `ValidateEulerianConditions`: Verifies degree parity invariants.
3. Automated `Debug.Assert` validation tests.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedDSA.GraphFundamentals
{
    /// <summary>
    /// Production container for finding Eulerian Paths and Circuits in Directed Graphs
    /// using Hierholzer's Algorithm in optimal O(V + E) time.
    /// </summary>
    public sealed class HierholzerEulerianEngine
    {
        /// <summary>
        /// Finds a directed Eulerian Trail or Circuit visiting every edge exactly once.
        /// </summary>
        /// <param name="numVertices">Total number of vertices.</param>
        /// <param name="edges">Directed edges [u, v].</param>
        /// <param name="trail">The ordered sequence of vertices in the Eulerian trail.</param>
        /// <returns>True if an Eulerian trail exists and was found; false otherwise.</returns>
        public static bool TryFindDirectedEulerianTrail(int numVertices, int[][] edges, out List<int> trail)
        {
            trail = new List<int>();
            if (edges == null || edges.Length == 0) return true;

            // 1. Build Adjacency List and Calculate Degrees
            List<int>[] adj = new List<int>[numVertices];
            for (int i = 0; i < numVertices; i++) adj[i] = new List<int>();

            int[] inDegree = new int[numVertices];
            int[] outDegree = new int[numVertices];

            foreach (var edge in edges)
            {
                int u = edge[0];
                int v = edge[1];
                adj[u].Add(v);
                outDegree[u]++;
                inDegree[v]++;
            }

            // 2. Identify Start Node & Validate Degree Parity
            int startNode = -1;
            int endNode = -1;
            int startCandidates = 0;
            int endCandidates = 0;

            for (int i = 0; i < numVertices; i++)
            {
                int diff = outDegree[i] - inDegree[i];
                if (diff == 1)
                {
                    startNode = i;
                    startCandidates++;
                }
                else if (diff == -1)
                {
                    endNode = i;
                    endCandidates++;
                }
                else if (diff != 0)
                {
                    // More than 1 degree imbalance -> Impossible!
                    return false;
                }
            }

            // Must be either:
            // Case A (Trail): exactly one start (out-in=1) and one end (in-out=1)
            // Case B (Circuit): startCandidates == 0 and endCandidates == 0
            if (!((startCandidates == 1 && endCandidates == 1) || (startCandidates == 0 && endCandidates == 0)))
            {
                return false;
            }

            // If it's a circuit, pick any node with outDegree > 0 as start
            if (startNode == -1)
            {
                for (int i = 0; i < numVertices; i++)
                {
                    if (outDegree[i] > 0)
                    {
                        startNode = i;
                        break;
                    }
                }
            }

            if (startNode == -1) return false;

            // 3. Hierholzer's Algorithm using an Explicit Stack
            Stack<int> callStack = new Stack<int>();
            List<int> postOrder = new List<int>(edges.Length + 1);
            int[] edgePointer = new int[numVertices]; // Tracks next unvisited edge index

            callStack.Push(startNode);

            while (callStack.Count > 0)
            {
                int u = callStack.Peek();

                if (edgePointer[u] < adj[u].Count)
                {
                    // Follow next unused outgoing edge
                    int next = adj[u][edgePointer[u]++];
                    callStack.Push(next);
                }
                else
                {
                    // No more outgoing edges from u -> Push to post-order
                    postOrder.Add(callStack.Pop());
                }
            }

            // 4. Reverse post-order to get forward Eulerian trail
            postOrder.Reverse();

            // Verify that all edges were visited
            if (postOrder.Count == edges.Length + 1)
            {
                trail = postOrder;
                return true;
            }

            // Disconnected edge components existed!
            return false;
        }

        /// <summary>
        /// Comprehensive validation suite.
        /// </summary>
        public static void RunTests()
        {
            Console.WriteLine("Running HierholzerEulerianEngine Test Suite...");

            // Test 1: Simple Directed Circuit (0 -> 1 -> 2 -> 0)
            int[][] edges1 = { new int[] { 0, 1 }, new int[] { 1, 2 }, new int[] { 2, 0 } };
            bool ok1 = TryFindDirectedEulerianTrail(3, edges1, out var trail1);
            Debug.Assert(ok1, "Test 1 Failed: Circuit should be found.");
            Debug.Assert(trail1.Count == 4 && trail1[0] == trail1[3], "Test 1 Circuit endpoints mismatch.");

            // Test 2: Directed Eulerian Trail (0 -> 1 -> 2)
            int[][] edges2 = { new int[] { 0, 1 }, new int[] { 1, 2 } };
            bool ok2 = TryFindDirectedEulerianTrail(3, edges2, out var trail2);
            Debug.Assert(ok2, "Test 2 Failed: Trail should be found.");
            Debug.Assert(trail2[0] == 0 && trail2[2] == 2, "Test 2 Trail endpoints mismatch.");

            // Test 3: Impossible Degree Parity
            // Node 0 has out=2, in=0 (diff 2 -> Impossible)
            int[][] edges3 = { new int[] { 0, 1 }, new int[] { 0, 2 } };
            bool ok3 = TryFindDirectedEulerianTrail(3, edges3, out _);
            Debug.Assert(!ok3, "Test 3 Failed: Degree mismatch should return false.");

            Console.WriteLine("All HierholzerEulerianEngine tests PASSED successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Systems & Complexity Analysis

### 3.1 Complexity Profile

| Metric | Hierholzer's Algorithm | Architectural Justification |
| :--- | :--- | :--- |
| **Edge Traversal** | $\Theta(E)$ | Every edge pushed to stack and removed exactly once. |
| **Vertex Processing** | $\Theta(V)$ | Every vertex popped from stack and appended to output. |
| **Total Time Complexity** | $\mathbf{\Theta(V + E)}$ | Strictly optimal: matches input reading bound. |
| **Auxiliary Space** | $\mathbf{\Theta(V + E)}$ | Explicit stack and adjacency lists. |

---

## 4. 🧩 APPLY: Canonical Problem Walkthroughs

### 4.1 [LeetCode 332] Reconstruct Itinerary (Hard)

#### Problem Description
You are given a list of airline `tickets` where `tickets[i] = [from_i, to_i]`. Reconstruct the itinerary in order and return it. All tickets belong to a man who departs from `"JFK"`, thus the itinerary must begin with `"JFK"`. If there are multiple valid itineraries, you should return the itinerary that has the **smallest lexical order** when read as a single string.

#### Architectural Solution: Hierholzer with Min-Heap
To ensure the smallest lexical order, outgoing flight destinations must be explored in alphabetical order. We store edges in a `PriorityQueue` (or sorted lists).

```csharp
public class SolutionLC332
{
    public IList<string> FindItinerary(IList<IList<string>> tickets)
    {
        // 1. Build Adjacency List with Min-Heaps for Lexicographical Sorting
        var graph = new Dictionary<string, PriorityQueue<string, string>>();

        foreach (var ticket in tickets)
        {
            string from = ticket[0];
            string to = ticket[1];

            if (!graph.ContainsKey(from))
            {
                graph[from] = new PriorityQueue<string, string>();
            }
            graph[from].Enqueue(to, to); // Min-heap orders alphabetically
        }

        // 2. Hierholzer's Post-Order Traversal
        var itinerary = new List<string>();
        Dfs("JFK", graph, itinerary);

        // 3. Reverse post-order to get forward trail
        itinerary.Reverse();
        return itinerary;
    }

    private void Dfs(string airport, Dictionary<string, PriorityQueue<string, string>> graph, List<string> itinerary)
    {
        if (graph.ContainsKey(airport))
        {
            var pq = graph[airport];
            while (pq.Count > 0)
            {
                string next = pq.Dequeue();
                Dfs(next, graph, itinerary);
            }
        }

        itinerary.Add(airport); // Post-order: add when stuck
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 332] Reconstruct Itinerary (Hard):**
   - Implement the Hierholzer solution using a min-heap.

2. **[LeetCode 753] Cracking the Safe (Hard):**
   - Model the problem as a De Bruijn graph with $K^{N-1}$ vertices and $K$ outgoing edges per vertex. Find the Eulerian circuit to generate the minimal safe-cracking string!

3. **Undirected Hierholzer Lab:**
   - Extend `HierholzerEulerianEngine` to handle undirected graphs using edge IDs to avoid traversing the reverse edge twice.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Edge Traversal vs Vertex Traversal:

                 What does the problem require visiting?
                                   │
           ┌───────────────────────┴───────────────────────┐
           ▼                                               ▼
    Visit EVERY VERTEX once                         Visit EVERY EDGE once
    HAMILTONIAN PATH                                EULERIAN PATH
    NP-Hard in general!                             Linear Time O(V + E)!
    (Requires Backtracking / DP)                    (Hierholzer's Algorithm)
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
What are the exact necessary and sufficient conditions for a directed graph to have an Eulerian path?

### Architectural Model Answer
1. **Connectivity Condition:**
   - All vertices that have non-zero degree (either in-degree $> 0$ or out-degree $> 0$) must belong to a single **Weakly Connected Component** (connected when ignoring edge directions). Isolated vertices with degree 0 are permitted.

2. **Degree Balance Conditions:**
   - Define the degree difference for every vertex: $\Delta(v) = \text{out-degree}(v) - \text{in-degree}(v)$.
   - Exactly one of the following two cases must hold:
     - **Case A: Eulerian Circuit (Starts and ends at same node):**
       Every vertex has an in-degree equal to its out-degree:
       $$\text{in-degree}(v) == \text{out-degree}(v) \quad \forall v \in V$$
     - **Case B: Eulerian Trail (Starts and ends at distinct nodes):**
       There exist exactly two vertices $s$ and $t$ such that:
       $$\text{out-degree}(s) - \text{in-degree}(s) = 1 \quad (\text{Unique Start Node } s)$$
       $$\text{in-degree}(t) - \text{out-degree}(t) = 1 \quad (\text{Unique End Node } t)$$
       And for all other vertices $v \in V \setminus \{s, t\}$:
       $$\text{in-degree}(v) == \text{out-degree}(v)$$

3. **Sufficiency:**
   - When these conditions are satisfied, every time an exploratory walk enters an intermediate vertex $v$, an unused outgoing edge is guaranteed to exist. The walk can only terminate at end vertex $t$ (or $s$ in a circuit), and all remaining edges form closed Eulerian cycles that are spliced into the walk by Hierholzer's algorithm.
