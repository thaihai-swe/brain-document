---
title: "Week 22 — Day 149: Bipartite Graph Detection: 2-Color BFS-DFS & Odd-Length Cycle Impossibility"
---

# Week 22 — Day 149: Bipartite Graph Detection: 2-Color BFS-DFS & Odd-Length Cycle Impossibility

Welcome to **Day 149 of your DSA Mastery Journey**!

Yesterday, on Day 148, you explored how undirected connectivity forms an equivalence relation that partitions graphs into connected components and mastered multi-source reverse flood fill.

Today, we dive into one of the most elegant, mathematically profound concepts in graph theory: **Bipartite Graphs**.

Bipartite graphs model natural two-sided relationships across computing:
- **Matching Markets:** Job applicants $\leftrightarrow$ job openings, drivers $\leftrightarrow$ riders (Uber / Lyft), doctors $\leftrightarrow$ hospital residencies (Stable Marriage problem).
- **Recommendation Engines:** Users $\leftrightarrow$ movies (Netflix), customers $\leftrightarrow$ products (Amazon).
- **Compiler Optimizations:** Resolving register constraints and instruction scheduling.
- **Network Flow:** The fundamental input structure for **Hopcroft-Karp Maximum Bipartite Matching** (Week 57).

Today, you will master:
1. **The Bipartite Characterization Theorem (Kőnig, 1936):** Proving why a graph is bipartite **if and only if** it contains zero odd-length cycles.
2. **The 2-Color State Machine:** Implementing high-performance BFS and DFS coloring algorithms.
3. **Implicit Conflict Graph Modeling:** Transforming mutual dislike constraints into bipartite graphs in **[LeetCode 886] Possible Bipartition**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             DAY 149: BIPARTITE GRAPH DETECTION                                   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│     ODD-CYCLE IMPOSSIBILITY       │                             │       THE 2-COLOR STATE MACHINE   │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Bipartite: V = V1 ∪ V2, V1∩V2=∅.│                             │ • Unvisited: -1                   │
│ • Every edge joins V1 and V2.     │ ── 2-Color Parity Gate ───► │ • Color 0: Set A (Red)            │
│ • Traversing a cycle alternates:  │                             │ • Color 1: Set B (Blue)           │
│   V1 -> V2 -> V1 -> V2 ...        │                             │ • Invariant: neighbor v MUST have:│
│ • Returns to start only after an  │                             │   color[v] == 1 - color[u]!       │
│   EVEN number of edge steps!      │                             │ • If color[v] == color[u]:        │
│ • Odd-cycle ==> NOT BIPARTITE!    │                             │   ODD-CYCLE FOUND! NOT BIPARTITE! │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CANONICAL PROBLEM MASTERY           │
                          ├─────────────────────────────────────────────┤
                          │ • [LC 785] Is Graph Bipartite?              │
                          │ • [LC 886] Possible Bipartition             │
                          │ • From-Scratch: BipartiteGraphDetector      │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🔴🔵 The Visual Mental Model: Rival Teams & The Triangular Feud

Before writing alternating BFS loops or reading Kőnig's theorem, picture dividing people into two rival sports teams:

```
              🔴🔵 TWO RIVAL SPORTS TEAMS & THE TRIANGULAR FEUD

   You must assign every player either a RED jersey (0) or a BLUE jersey (1).
   Rule: If two players are bitter rivals (an EDGE), they CANNOT be on the same team!

   CASE 1: SQUARE CYCLE (C4 - EVEN LENGTH)     CASE 2: TRIANGLE CYCLE (C3 - ODD LENGTH)
   
        [ 0: RED ] ─────── [ 1: BLUE ]                       [ 0: RED ]
             │                  │                             /        \
             │                  │                            /          \
        [ 3: BLUE ] ────── [ 2: RED ]                  [ 1: BLUE ] ──── [ 2: ??? ]
        
   Trace Case 1:                                Trace Case 2:
   • 0 is Red  ──► 1 must be Blue.              • 0 is Red  ──► 1 must be Blue.
   • 1 is Blue ──► 2 must be Red.               • 0 is Red  ──► 2 must be Blue!
   • 2 is Red  ──► 3 must be Blue.              • BUT 1 and 2 are rivals!
   • 3 is Blue ──► connects back to 0 (Red).    • If 2 is Blue: conflicts with 1!
   ✅ PERFECT HARMONY! ZERO CONFLICTS!          • If 2 is Red:  conflicts with 0!
   Graph is BIPARTITE (2-Colorable)!            💥 IMPOSSIBLE! 2 CANNOT WEAR EITHER COLOR!
                                                Graph is NOT BIPARTITE (Odd Cycle C3)!
```

#### Why Kőnig's Theorem is a Physical Law
- In an even cycle ($C_4, C_6, C_8$), the colors alternate: `Red -> Blue -> Red -> Blue -> Red`. The parity brings you back to the start with the correct matching color.
- In an odd cycle ($C_3, C_5, C_7$), you take an odd number of alternating steps: `Red -> Blue -> Red -> Blue -> Red`. The last step forces two identical colors to touch!
- **Invariant:** A graph is Bipartite **if and only if** it contains ZERO odd-length cycles!

---

### 1.2 🖼️ Visual Gallery: The 2-Color Alternating State Machine

```
                        THE 2-COLOR STATE TRANSITION
                        
   Current Node (u):  [ Color c (0 or 1) ]
                               │
               Traverse Edge   ▼   nextColor = 1 - c (or c ^ 1)
   Adjacent Node (v):
   • If color[v] == -1:       Color v with nextColor! Enqueue v!
   • If color[v] == 1 - c:    Opposite color already verified! Safe!
   • If color[v] == c:        🚨 COLOR COLLISION! SAME COLOR DETECTED!
                              Graph is NOT Bipartite!
```

#### Partitioning Vertices into Two Independent Sets:

```
        Set V1 (All Red Nodes):              Set V2 (All Blue Nodes):
             [ Node 0 ] ─────────────────────────► [ Node 1 ]
             [ Node 2 ] ─────────────────────────► [ Node 3 ]
             
        • ZERO edges exist within Set V1!
        • ZERO edges exist within Set V2!
        • 100% of all edges cross the boundary between V1 and V2!
```

---

### 1.3 🏛️ Memory Layout: Signed Byte Color Array in Hardware RAM

```
   State Tracking in RAM (sbyte[] color array):
   
   Index (v):   [ 0 ]    [ 1 ]    [ 2 ]    [ 3 ]
   color[v]:    [ 0 ]    [ 1 ]    [ 0 ]    [ 1 ]
   Meaning:     Red      Blue     Red      Blue
   
   • Initialized to -1 (Unvisited / Uncolored).
   • Fast XOR color flip: nextColor = (sbyte)(color[curr] ^ 1);
   • Ultra-compact: 1 byte per vertex in contiguous L1 cache line!
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* A graph $G = (V, E)$ is **Bipartite** (or 2-colorable) if its vertex set $V$ can be partitioned into two disjoint subsets $V_1$ and $V_2$ ($V = V_1 \cup V_2$ with $V_1 \cap V_2 = \emptyset$) such that every edge $(u, v) \in E$ connects a vertex in $V_1$ to a vertex in $V_2$. No edge can exist between two vertices in the same subset.
  - *The Odd-Cycle Impossibility Theorem (Kőnig, 1936):* An undirected graph $G$ is bipartite **if and only if** $G$ contains **no simple cycles of odd length**.
  - *The 2-Color State Machine:*
    - Color States: `-1` (uncolored / unvisited), `0` (Color A), `1` (Color B).
    - Transition: When expanding from vertex $u$ with color $c$, all unvisited neighbors $v$ must be colored $1 - c$.
    - Violation Check: If an adjacent neighbor $v$ is already colored and $\text{color}[v] == \text{color}[u]$, an odd-length cycle is confirmed, and the graph cannot be bipartite.
  - *Misconceptions:*
    - *Misconception 1:* "Trees might not be bipartite." **False!** Every tree is bipartite because trees contain zero cycles, and therefore zero odd cycles!
    - *Misconception 2:* "A disconnected graph is not bipartite if one component is empty." **False!** Disconnected graphs are bipartite as long as *every* connected component is individually bipartite.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Structural Compatibility:* Determines whether a system can be divided into two non-conflicting groups (e.g., scheduling two distinct shifts with no conflicting worker pairs).
  - *Prerequisite for Max Flow Matching:* Maximum Bipartite Matching algorithms (Hopcroft-Karp, Kuhn's algorithm) require bipartite inputs to compute maximum cardinality matchings in polynomial time.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Partitioning objects into two opposing sets ([LC 785], [LC 886]).
    - Checking if an undirected graph can be 2-colored.
  - *Signal Words:* "Divide into two groups", "opposing teams", "no mutual conflicts".
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Array Memory:* A compact `sbyte[] color` array of size $V$ initialized with `-1`. Takes only 1 byte per vertex in contiguous RAM.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "A graph is bipartite if its vertices can be partitioned into two sets such that no two adjacent vertices share a set. By Kőnig's Theorem, this is equivalent to containing no odd-length cycles. I implement this using a 2-color BFS or DFS: I assign color 0 to an unvisited node, and alternate colors 0 and 1 across edges. If I ever encounter an adjacent neighbor with the same color as the current node, an odd cycle is detected, proving the graph is not bipartite. I loop over all vertices to handle disconnected components, running in optimal $O(V + E)$ time."
- **6. HOW (Complexity & Invariants):**
  - *Time Complexity:* $\Theta(V + E)$—every vertex is colored once; every edge is checked once from each endpoint.
  - *Space Complexity:* $\Theta(V)$ auxiliary space for the color array and queue/call-stack.

---

### 1.5 The Odd-Cycle Impossibility Theorem & Proof

Why does the existence of an odd cycle make 2-coloring impossible?

```
Even Cycle (C4 - Bipartite):               Odd Cycle (C3 or C5 - NOT Bipartite):
       [ 0: Red ] ───► [ 1: Blue ]                  [ 0: Red ]
           │                 │                       /        \
           ▼                 ▼                      v          v
      [ 3: Blue ] ◄─── [ 2: Red ]              [ 1: Blue ] ──► [ 2: Red? Blue? ]
   Alternates: R -> B -> R -> B -> R.           Edge (1, 2) has conflict!
   Clean 2-coloring succeeds!                   Both Red and Blue violate rule!
```

#### Formal Proof (Kőnig, 1936):
1. **Direction 1: Bipartite $\implies$ No Odd Cycles**
   - Suppose graph $G$ is bipartite with partition $(V_1, V_2)$.
   - Consider any simple cycle $C = v_0, v_1, v_2, \dots, v_k, v_0$.
   - Without loss of generality, let $v_0 \in V_1$.
   - Since every edge connects $V_1$ to $V_2$:
     - $v_1 \in V_2$
     - $v_2 \in V_1$
     - $v_3 \in V_2$
     - In general, $v_i \in V_1$ for all even $i$, and $v_i \in V_2$ for all odd $i$.
   - The final edge of the cycle returns to $v_0 \in V_1$.
   - For $(v_k, v_0)$ to be a valid bipartite edge, $v_k$ must belong to $V_2$.
   - This requires $k$ to be **odd**.
   - The total number of edges in cycle $C$ is $k + 1$.
   - Since $k$ is odd, $k + 1$ is **even**.
   - Therefore, any cycle in a bipartite graph must have an **even length**. No odd cycles can exist!

2. **Direction 2: No Odd Cycles $\implies$ Bipartite**
   - Pick an arbitrary root $s$. Define distance $dist(s, v)$ as the length of the shortest path from $s$ to $v$.
   - Partition vertices:
     $$V_1 = \{ v \in V \mid dist(s, v) \text{ is even} \}$$
     $$V_2 = \{ v \in V \mid dist(s, v) \text{ is odd} \}$$
   - Assume for contradiction that an edge $(u, v)$ connects two vertices in the same set (say $u, v \in V_1$).
   - Then paths from $s \rightsquigarrow u$ and $s \rightsquigarrow v$ both have even length.
   - Let $w$ be their Lowest Common Ancestor.
   - The cycle formed by $w \rightsquigarrow u \to v \rightsquigarrow w$ has odd length:
     $$\text{Length} = (dist(s, u) - dist(s, w)) + (dist(s, v) - dist(s, w)) + 1$$
   - Since $dist(s, u)$ and $dist(s, v)$ have the same parity, their differences from $dist(s, w)$ have the same parity, so their sum is even. Adding 1 makes the total cycle length **odd**!
   - This contradicts the premise that $G$ has no odd cycles.
   - Therefore, no edge can connect two vertices in the same set. $G$ is bipartite! $\blacksquare$

---

## 2. 💻 IMPLEMENT: Production C# Container

The `BipartiteGraphDetector` class provides:
1. `IsBipartiteBfs`: Queue-based 2-color wavefront (immune to stack overflows).
2. `IsBipartiteDfs`: Recursive 2-color state machine.
3. Automated `Debug.Assert` validation tests covering bipartite graphs, odd cycles (triangles, pentagons), even cycles, and disconnected components.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedDSA.GraphFundamentals
{
    /// <summary>
    /// Production container for Bipartite Graph Detection and 2-Coloring.
    /// Implements both BFS and DFS approaches with full disconnected component handling.
    /// </summary>
    public sealed class BipartiteGraphDetector
    {
        public const sbyte Uncolored = -1;
        public const sbyte ColorA = 0;
        public const sbyte ColorB = 1;

        /// <summary>
        /// Determines whether an undirected graph is bipartite using BFS.
        /// </summary>
        /// <param name="graph">Adjacency array where graph[u] contains all neighbors of u.</param>
        /// <param name="colors">Output array with assigned colors (0 or 1) if bipartite.</param>
        /// <returns>True if the graph is bipartite; false if an odd-length cycle exists.</returns>
        public static bool IsBipartiteBfs(int[][] graph, out sbyte[] colors)
        {
            if (graph == null) throw new ArgumentNullException(nameof(graph));

            int n = graph.Length;
            colors = new sbyte[n];
            Array.Fill(colors, Uncolored);

            Queue<int> queue = new Queue<int>();

            // Iterate through all vertices to handle disconnected components
            for (int i = 0; i < n; i++)
            {
                if (colors[i] != Uncolored) continue;

                // Start coloring a new component with ColorA (0)
                colors[i] = ColorA;
                queue.Enqueue(i);

                while (queue.Count > 0)
                {
                    int u = queue.Dequeue();
                    sbyte currentColor = colors[u];
                    sbyte neighborColor = (sbyte)(1 - currentColor); // Alternate: 0 -> 1, 1 -> 0

                    foreach (int v in graph[u])
                    {
                        if (colors[v] == Uncolored)
                        {
                            colors[v] = neighborColor;
                            queue.Enqueue(v);
                        }
                        else if (colors[v] == currentColor)
                        {
                            // Invariant Violation: Adjacent nodes have identical color!
                            // Odd-length cycle detected.
                            return false;
                        }
                    }
                }
            }

            return true;
        }

        /// <summary>
        /// Determines whether an undirected graph is bipartite using recursive DFS.
        /// </summary>
        public static bool IsBipartiteDfs(int[][] graph, out sbyte[] colors)
        {
            if (graph == null) throw new ArgumentNullException(nameof(graph));

            int n = graph.Length;
            colors = new sbyte[n];
            Array.Fill(colors, Uncolored);

            for (int i = 0; i < n; i++)
            {
                if (colors[i] == Uncolored)
                {
                    if (!DfsColor(i, ColorA, graph, colors))
                    {
                        return false;
                    }
                }
            }

            return true;
        }

        private static bool DfsColor(int u, sbyte colorToAssign, int[][] graph, sbyte[] colors)
        {
            colors[u] = colorToAssign;
            sbyte nextColor = (sbyte)(1 - colorToAssign);

            foreach (int v in graph[u])
            {
                if (colors[v] == colorToAssign)
                {
                    return false; // Conflict found -> Odd cycle!
                }

                if (colors[v] == Uncolored)
                {
                    if (!DfsColor(v, nextColor, graph, colors))
                    {
                        return false;
                    }
                }
            }

            return true;
        }

        /// <summary>
        /// Automated validation test suite.
        /// </summary>
        public static void RunTests()
        {
            Console.WriteLine("Running BipartiteGraphDetector Test Suite...");

            // Test 1: Even Cycle C4 (Bipartite)
            // 0 - 1 - 2 - 3 - 0
            int[][] graphC4 = new int[][]
            {
                new int[] { 1, 3 },
                new int[] { 0, 2 },
                new int[] { 1, 3 },
                new int[] { 0, 2 }
            };
            bool okBfs1 = IsBipartiteBfs(graphC4, out var colors1);
            bool okDfs1 = IsBipartiteDfs(graphC4, out _);
            Debug.Assert(okBfs1 && okDfs1, "Test 1 Failed: Even cycle C4 must be bipartite.");

            // Test 2: Odd Cycle C3 Triangle (Not Bipartite)
            // 0 - 1 - 2 - 0
            int[][] graphC3 = new int[][]
            {
                new int[] { 1, 2 },
                new int[] { 0, 2 },
                new int[] { 0, 1 }
            };
            bool okBfs2 = IsBipartiteBfs(graphC3, out _);
            bool okDfs2 = IsBipartiteDfs(graphC3, out _);
            Debug.Assert(!okBfs2 && !okDfs2, "Test 2 Failed: Triangle C3 cannot be bipartite.");

            // Test 3: Disconnected graph with one Bipartite component and one Odd-Cycle component
            int[][] graphMixed = new int[][]
            {
                new int[] { 1 }, // 0 - 1 (bipartite)
                new int[] { 0 },
                new int[] { 3, 4 }, // 2 - 3 - 4 - 2 (triangle)
                new int[] { 2, 4 },
                new int[] { 2, 3 }
            };
            bool okBfs3 = IsBipartiteBfs(graphMixed, out _);
            Debug.Assert(!okBfs3, "Test 3 Failed: Mixed graph containing odd cycle must return false.");

            // Test 4: Tree (Always Bipartite)
            // 0 - 1, 0 - 2, 1 - 3
            int[][] graphTree = new int[][]
            {
                new int[] { 1, 2 },
                new int[] { 0, 3 },
                new int[] { 0 },
                new int[] { 1 }
            };
            bool okBfs4 = IsBipartiteBfs(graphTree, out _);
            Debug.Assert(okBfs4, "Test 4 Failed: Any tree must be bipartite.");

            Console.WriteLine("All BipartiteGraphDetector tests PASSED successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Systems & Complexity Analysis

### 3.1 Complexity Profile

| Metric | BFS 2-Coloring | DFS 2-Coloring | Architectural Justification |
| :--- | :--- | :--- | :--- |
| **Time Complexity** | $\mathbf{\Theta(V + E)}$ | $\mathbf{\Theta(V + E)}$ | Optimal: Every vertex visited once; every edge checked twice. |
| **Auxiliary Space** | $\mathbf{\Theta(V)}$ | $\mathbf{\Theta(V)}$ | Compact byte array ($V$ bytes) + queue/call-stack ($O(V)$). |
| **Stack Overflow Risk** | **None** | High on deep trees ($V > 50,000$) | BFS uses heap-allocated queue; DFS uses CLR thread stack. |

---

## 4. 🧩 APPLY: Canonical Problem Walkthroughs

### 4.1 [LeetCode 785] Is Graph Bipartite? (Medium)

```csharp
public class SolutionLC785
{
    public bool IsBipartite(int[][] graph)
    {
        int n = graph.Length;
        int[] color = new int[n]; // 0: unvisited, 1: red, -1: blue

        for (int i = 0; i < n; i++)
        {
            if (color[i] != 0) continue;

            Queue<int> queue = new Queue<int>();
            queue.Enqueue(i);
            color[i] = 1;

            while (queue.Count > 0)
            {
                int curr = queue.Dequeue();

                foreach (int neighbor in graph[curr])
                {
                    if (color[neighbor] == color[curr])
                    {
                        return false; // Conflict found
                    }

                    if (color[neighbor] == 0)
                    {
                        color[neighbor] = -color[curr]; // Flip 1 to -1 or -1 to 1
                        queue.Enqueue(neighbor);
                    }
                }
            }
        }

        return true;
    }
}
```

---

### 4.2 [LeetCode 886] Possible Bipartition (Medium)

#### Problem Description
We want to split a group of `n` people (labeled from `1` to `n`) into two groups of any size. Each person may dislike some other people, given in the `dislikes` array where `dislikes[i] = [a, b]` indicates that the person labeled `a` and the person labeled `b` cannot be in the same group. Return `true` if and only if it is possible to split everyone into two groups.

#### Architectural Modeling
Mutual dislikes form **undirected conflict edges**. Splitting people into two non-conflicting groups is mathematically identical to checking whether the conflict graph is **bipartite**!

```csharp
public class SolutionLC886
{
    public bool PossibleBipartition(int n, int[][] dislikes)
    {
        List<int>[] adj = new List<int>[n + 1];
        for (int i = 1; i <= n; i++) adj[i] = new List<int>();

        foreach (var d in dislikes)
        {
            adj[d[0]].Add(d[1]);
            adj[d[1]].Add(d[0]);
        }

        int[] color = new int[n + 1]; // 0: uncolored, 1: group A, 2: group B

        for (int i = 1; i <= n; i++)
        {
            if (color[i] != 0) continue;

            Queue<int> queue = new Queue<int>();
            queue.Enqueue(i);
            color[i] = 1;

            while (queue.Count > 0)
            {
                int u = queue.Dequeue();
                int nextColor = (color[u] == 1) ? 2 : 1;

                foreach (int v in adj[u])
                {
                    if (color[v] == color[u])
                    {
                        return false; // Disliked persons assigned to same group!
                    }

                    if (color[v] == 0)
                    {
                        color[v] = nextColor;
                        queue.Enqueue(v);
                    }
                }
            }
        }

        return true;
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 785] Is Graph Bipartite? (Medium):**
   - Implement both BFS and DFS solutions and compare memory footprints.

2. **[LeetCode 886] Possible Bipartition (Medium):**
   - Solve by converting dislike pairs into an adjacency list graph.

3. **Odd-Cycle Witness Extraction Lab:**
   - Modify `BipartiteGraphDetector` so that if the graph is NOT bipartite, it reconstructs and returns the exact odd-cycle path: e.g. `[0, 1, 2, 0]`.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Bipartite Decision Framework:

              Problem requires dividing items into 2 non-conflicting sets
                                       │
                                       ▼
                     Model constraints as Undirected Edges
                                       │
                                       ▼
                         Run 2-Color State Machine
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
     No Color Conflicts Found                     Color Conflict Encountered!
                │                                             │
                ▼                                             ▼
        Graph is BIPARTITE                            Graph has ODD CYCLE
  (Zero odd-length cycles exist)               (Mathematically IMPOSSIBLE to 2-color)
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
Prove that a graph is 2-colorable (bipartite) if and only if it contains zero odd-length cycles.

### Architectural Model Answer
1. **Definition of Bipartite & 2-Colorable:**
   - A graph $G = (V, E)$ is 2-colorable if each vertex can be assigned a color from $\{0, 1\}$ such that no two adjacent vertices share the same color. This is equivalent to bipartiteness with partition sets $V_0 = \{ v \mid \text{color}(v) = 0 \}$ and $V_1 = \{ v \mid \text{color}(v) = 1 \}$.

2. **Necessity ($\implies$): Bipartite Graphs Cannot Contain Odd Cycles:**
   - Let $C = v_0, v_1, v_2, \dots, v_k, v_0$ be any cycle in a 2-colorable graph.
   - Without loss of generality, assign $\text{color}(v_0) = 0$.
   - Since adjacent vertices must have alternating colors:
     $$\text{color}(v_i) = i \pmod 2$$
   - For the cycle to close, the final edge $(v_k, v_0)$ requires $\text{color}(v_k) \neq \text{color}(v_0) = 0$, meaning $\text{color}(v_k) = 1$.
   - Thus, $k \equiv 1 \pmod 2$, meaning $k$ is odd.
   - The total number of edges in $C$ is $k + 1$. Since $k$ is odd, $k + 1$ is **even**.
   - Therefore, every cycle in a bipartite graph must have an even length; **no odd-length cycles can exist**.

3. **Sufficiency ($\impliedby$): Zero Odd Cycles Guarantees Bipartiteness:**
   - Assume $G$ contains zero odd-length cycles.
   - Pick an arbitrary vertex $s$ in a connected component. Assign colors based on shortest-path distances from $s$:
     $$\text{color}(v) = dist(s, v) \pmod 2$$
   - Suppose for contradiction that there exists an edge $(u, v)$ such that $\text{color}(u) == \text{color}(v)$.
   - This means $dist(s, u)$ and $dist(s, v)$ have the same parity.
   - Let $w$ be the lowest common ancestor of $u$ and $v$ on the shortest-path tree from $s$.
   - The cycle formed by $w \rightsquigarrow u \to v \rightsquigarrow w$ has length:
     $$\text{Length} = (dist(s, u) - dist(s, w)) + (dist(s, v) - dist(s, w)) + 1$$
   - Since $dist(s, u)$ and $dist(s, v)$ have identical parity, their sum is even, and subtracting $2 \cdot dist(s, w)$ remains even. Adding $1$ produces an **odd integer**.
   - This contradicts our hypothesis that $G$ has no odd cycles.
   - Thus, no edge can connect vertices of the same color, proving that $G$ is 2-colorable. $\blacksquare$
