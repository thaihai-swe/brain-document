---
title: "Week 22 — Day 150: Graph Coloring, Welsh-Powell Greedy Algorithm & The Chromatic Number"
---

# Week 22 — Day 150: Graph Coloring, Welsh-Powell Greedy Algorithm & The Chromatic Number

Welcome to **Day 150 of your DSA Mastery Journey**!

Yesterday, on Day 149, you mastered bipartite graphs and proved why 2-coloring succeeds if and only if a graph contains zero odd-length cycles.

Today, we generalize beyond 2 colors to the foundational problem of **General Graph Coloring** and the **Chromatic Number $\chi(G)$**.

While deciding whether a general graph can be colored with $k$ colors ($k \ge 3$) is **NP-complete**, the structural upper bounds and heuristic greedy algorithms form the bedrock of production computer engineering:
- **Optimizing Compilers (LLVM, GCC, CLR JIT):** How does the compiler map hundreds of virtual variables to a scarce pool of 16 physical CPU hardware registers? By building a **Register Interference Graph** and finding a $K$-coloring (Chaitin's Algorithm)!
- **Frequency & Spectrum Allocation:** How do telecommunication towers broadcast cellular signals without co-channel interference? By coloring the network graph with frequency bands!
- **Scheduling & Timetabling:** Scheduling university exams or airport flight slots into minimal conflict-free time slots.

Today, you will master:
1. **The Chromatic Number $\chi(G)$ & Classical Bounds:** The Maximum Degree bound ($\Delta(G) + 1$), **Brooks' Theorem**, and the **Four Color Theorem**.
2. **The Welsh-Powell Degree-Ordered Greedy Algorithm:** Achieving near-optimal colorings in polynomial time.
3. **Compiler Register Allocation:** Simulating Chaitin's interference graph coloring in C#.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   DAY 150: GRAPH COLORING, WELSH-POWELL & REGISTER ALLOCATION                    │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       THE CHROMATIC NUMBER χ(G)   │                             │       WELSH-POWELL ALGORITHM      │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Smallest k such that adjacent   │                             │ 1. Sort vertices by DESCENDING    │
│   nodes have distinct colors.     │ ── Degree-Ordered Greedy ─► │    degree: deg(v1) >= deg(v2)...  │
│ • Brooks' Theorem:                │                             │ 2. Assign Color 1 to v1 and all   │
│   χ(G) <= Δ(G) (unless Kn or C_odd)                             │    non-adjacent nodes in order.   │
│ • Planar Graphs: χ(G) <= 4!       │                             │ 3. Repeat with Color 2, 3...      │
│ • General k-Coloring is NP-Hard!  │                             │ • Minimizes color fragmentation!  │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         SYSTEMS & PROBLEM MASTERY           │
                          ├─────────────────────────────────────────────┤
                          │ • [LC 1042] Flower Planting With No Adjacent│
                          │ • From-Scratch: WelshPowellColoringEngine   │
                          │ • LLVM/CLR Register Allocation Simulation   │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🎨 The Visual Mental Model: Map Borders & CPU Register Scarcity

Before writing greedy algorithms or chromatic polynomials, picture how compilers map software variables to CPU hardware:

```
              🎨 COMPILER VARIABLE LIVE RANGES & HARDWARE REGISTERS

   In your C# code, you create 50 temporary variables (x, y, z, total, temp, etc.).
   However, your physical x86-64 CPU only has 16 registers (RAX, RBX, RCX, RDX...)!
   
   How do you pack 50 variables into 16 registers without overwriting values?
   
   LOOK AT THEIR "LIVE RANGES" OVER TIME:
   
   Line 1: x = 10;
   Line 2: y = 20;
   Line 3: total = x + y;   <── x and y are BOTH needed here! (They INTERFERE!)
   Line 4: // x is dead!
   Line 5: z = 30;          <── z is born AFTER x died! (They NEVER overlap!)

   THE INTERFERENCE GRAPH:
   • Nodes = Variables (x, y, z, total).
   • Edges = Both variables hold data at the SAME time!
   
          [ x ] ────────── [ y ]
                             │
                             │
          [ z ] ────────── [ total ]
   
   COLORING THE GRAPH = ASSIGNING HARDWARE REGISTERS:
   • x and y interfere  ──► MUST have different registers (x = RAX, y = RBX).
   • x and z NEVER overlap ──► z CAN REUSE x's REGISTER (RAX)!
   
   MINIMUM HARDWARE REGISTERS NEEDED = THE CHROMATIC NUMBER χ(G)!
```

#### The Welsh-Powell Heuristic: "Handle the Biggest Troublemakers First!"
- If you color a small, quiet country first, you waste primary colors.
- When you finally reach the "hub" country touching 10 neighbors, all available colors are blocked around it, forcing you to invent expensive new colors!
- **Rule:** Sort nodes by **descending degree** ($\Delta \to 1$). Give the high-degree hubs primary colors first, and let low-degree leaves reuse them!

---

### 1.2 🖼️ Visual Gallery: Welsh-Powell Round-by-Round Execution

```
   Degree-Sorted Vertex List: [ A (deg 4),  B (deg 3),  C (deg 2),  D (deg 2),  E (deg 1) ]

   ROUND 1 (Color 1 - GREEN):
   1. Take highest uncolored: Node A ──► Paint GREEN.
   2. Scan remaining:
      • B is adjacent to A? YES ──► Skip B.
      • C is NOT adjacent to A? ──► Paint GREEN!
      • D is adjacent to A? YES ──► Skip D.
      • E is NOT adjacent to A or C? ──► Paint GREEN!
   Green Set: { A, C, E } (Maximal Independent Set!)

   ROUND 2 (Color 2 - BLUE):
   1. Take next uncolored: Node B ──► Paint BLUE.
   2. Scan remaining:
      • D is NOT adjacent to B? ──► Paint BLUE!
   Blue Set: { B, D }

   RESULT: 5-vertex graph properly colored with ONLY 2 COLORS! (Optimal!)
```

---

### 1.3 🏛️ Memory Layout: Mex (Minimum Excluded) Used-Colors Array

When picking a color for vertex $u$, we must find the smallest integer not used by any neighbor (the **mex**):

```
   Vertex 0 is adjacent to neighbors colored: { 0, 1, 3 }
   
   usedColors Boolean Scratchpad (RAM):
   Color Index:   [ 0 ]     [ 1 ]     [ 2 ]     [ 3 ]     [ 4 ]
   usedColors:    [ true ]  [ true ]  [false]   [ true ]  [false]
                                         ▲
                                         │ Smallest unused color is 2!
   
   • Assign color[0] = 2.
   • Scratchpad reset takes O(deg(u)) operations, maintaining cache-line efficiency!
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* A **Proper Vertex Coloring** of a graph $G = (V, E)$ is an assignment of colors (labels) $c: V \to \{1, 2, \dots, k\}$ such that for every edge $(u, v) \in E$, $c(u) \neq c(v)$.
  - *The Chromatic Number $\chi(G)$:* The minimum number of colors needed to properly color $G$.
  - *Classical Coloring Theorems:*
    1. **Trivial Degree Bound:** Every graph can be colored with at most $\Delta(G) + 1$ colors using naive greedy coloring, where $\Delta(G)$ is the maximum vertex degree in $G$.
    2. **Brooks' Theorem (1941):** For any connected undirected graph $G$, $\chi(G) \le \Delta(G)$, **unless** $G$ is a complete graph ($K_n$) or an odd cycle ($C_{2k+1}$).
    3. **The Four Color Theorem (Appel & Haken, 1976):** Every planar graph can be properly colored using at most **4 colors** ($\chi(G) \le 4$).
  - *Misconceptions:*
    - *Misconception 1:* "Greedy coloring always finds the minimum number of colors." **False!** Greedy coloring depends heavily on vertex processing order. An adversarial order on a bipartite graph can force greedy coloring to use $n/2$ colors instead of 2! The **Welsh-Powell algorithm** mitigates this by ordering vertices by descending degree.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *The Register Allocation Bottleneck:* Modern CPUs (x86-64, ARM64) have only 16 to 32 general-purpose registers (`RAX`, `RBX`, `RCX`, etc.). High-level code uses thousands of temporary variables.
  - *The Interference Graph:*
    - Each variable is a vertex.
    - An edge exists between two variables if their "live ranges" overlap (they must hold values at the same point in time).
    - Coloring the interference graph with $K$ colors (where $K$ is the number of hardware registers) directly solves register assignment!
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Partitioning elements with pairwise conflicts into minimal batches ([LC 1042]).
    - Static resource scheduling and timetable generation.
  - *When to Avoid / Failure Modes:*
    - Expecting exact optimal chromatic numbers on large dense graphs: computing $\chi(G)$ is NP-hard. Use greedy heuristics (Welsh-Powell or DSatur).
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Array Memory:* An integer array `int[] color` of size $V$, combined with a bitset or boolean array `bool[] usedColors` to find the smallest available color (mex / minimum excluded value).
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "Vertex coloring assigns colors so that adjacent nodes have distinct colors. The minimum colors needed is the chromatic number $\chi(G)$. While computing $\chi(G)$ is NP-complete, Brooks' Theorem guarantees $\chi(G) \le \Delta(G)$ for all graphs except complete graphs and odd cycles. To achieve a high-quality greedy coloring, I use the Welsh-Powell algorithm, which sorts vertices by descending degree and greedily colors independent sets. In systems, this exact pattern powers compiler register allocation via Chaitin's interference graph algorithm."
- **6. HOW (Complexity & Invariants):**
  - *Welsh-Powell Complexity:* Time: $O(V \log V + V^2)$ or $O(V \log V + V + E)$; Space: $\Theta(V)$ memory.

---

### 1.5 The Welsh-Powell Algorithm Mechanics

Why does sorting by descending degree improve greedy coloring?

If you color low-degree nodes first, high-degree "hub" nodes get processed last when most colors around them have already been taken, forcing the introduction of unnecessary new colors. By coloring **high-degree vertices first**, they receive the primary colors, and lower-degree vertices can easily reuse existing colors!

#### Step-by-Step Welsh-Powell Logic:
1. Compute the degree $\text{deg}(v)$ for every vertex $v \in V$.
2. Sort the vertices in **descending order of degree**:
   $$\text{deg}(v_1) \ge \text{deg}(v_2) \ge \dots \ge \text{deg}(v_n)$$
3. Pick the first uncolored vertex $v_i$ and assign it the current color $C$.
4. Iterate through the remaining uncolored vertices in sorted order; if a vertex is **not adjacent** to any vertex already colored with $C$ in this round, assign it color $C$.
5. Increment color $C \leftarrow C + 1$, and repeat until all vertices are colored.

```
Welsh-Powell State Execution:
  Vertices sorted by Degree: [ A(4), B(3), C(3), D(2), E(1) ]

  Round 1 (Color = 1):
    - Color A = 1
    - C is not adjacent to A? Color C = 1
    - E is not adjacent to A or C? Color E = 1

  Round 2 (Color = 2):
    - Next uncolored is B: Color B = 2
    - D is not adjacent to B? Color D = 2

  Finished in 2 colors! (Minimal chromatic assignment).
```

---

### 1.2 Compiler Register Allocation (Chaitin's Algorithm)

```
Variable Live Ranges:
  Time:     t0    t1    t2    t3    t4    t5
  var x:    [===========]
  var y:          [=================]
  var z:                      [===========]

Interference Graph:
  • x overlaps with y  ==> Edge (x, y)
  • y overlaps with z  ==> Edge (y, z)
  • x does NOT overlap with z ==> No edge!

Graph Coloring (Available CPU Registers: R1, R2):
  • Color 1 (R1): Assign to x
  • Color 2 (R2): Assign to y (adjacent to x)
  • Color 1 (R1): Assign to z (NOT adjacent to x!)

Result: 3 variables safely execute in 2 CPU registers!
```

---

## 2. 💻 IMPLEMENT: Production C# Container

The `WelshPowellColoringEngine` provides:
1. `ColorGraphWelshPowell`: High-performance degree-ordered graph coloring.
2. `SimulateRegisterAllocation`: Maps program variables to physical CPU registers given an interference matrix.
3. Automated `Debug.Assert` validation tests.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedDSA.GraphFundamentals
{
    /// <summary>
    /// Production container for Graph Coloring using the Welsh-Powell Algorithm
    /// and Compiler Register Allocation simulation.
    /// </summary>
    public sealed class WelshPowellColoringEngine
    {
        /// <summary>
        /// Colors an undirected graph using the Welsh-Powell degree-ordered heuristic.
        /// </summary>
        /// <param name="numVertices">Total number of vertices.</param>
        /// <param name="edges">Undirected edges [u, v].</param>
        /// <param name="assignedColors">Output array where assignedColors[v] is the 1-based color.</param>
        /// <returns>The total number of distinct colors utilized.</returns>
        public static int ColorGraphWelshPowell(int numVertices, int[][] edges, out int[] assignedColors)
        {
            if (numVertices == 0)
            {
                assignedColors = Array.Empty<int>();
                return 0;
            }

            // 1. Build Adjacency List & Degrees
            List<int>[] adj = new List<int>[numVertices];
            for (int i = 0; i < numVertices; i++) adj[i] = new List<int>();

            foreach (var edge in edges)
            {
                int u = edge[0];
                int v = edge[1];
                adj[u].Add(v);
                adj[v].Add(u);
            }

            // 2. Order vertices by descending degree
            int[] vertices = new int[numVertices];
            for (int i = 0; i < numVertices; i++) vertices[i] = i;

            Array.Sort(vertices, (a, b) => adj[b].Count.CompareTo(adj[a].Count));

            assignedColors = new int[numVertices]; // 0 = uncolored
            int currentColor = 1;

            // 3. Iteratively color independent sets
            for (int i = 0; i < numVertices; i++)
            {
                int root = vertices[i];
                if (assignedColors[root] != 0) continue;

                // Color root with currentColor
                assignedColors[root] = currentColor;
                List<int> currentColoredSet = new List<int> { root };

                // Scan remaining vertices to find independent non-adjacent candidates
                for (int j = i + 1; j < numVertices; j++)
                {
                    int candidate = vertices[j];
                    if (assignedColors[candidate] != 0) continue;

                    // Check if candidate is adjacent to ANY vertex already colored currentColor
                    bool isConflicting = false;
                    foreach (int neighbor in adj[candidate])
                    {
                        if (assignedColors[neighbor] == currentColor)
                        {
                            isConflicting = true;
                            break;
                        }
                    }

                    if (!isConflicting)
                    {
                        assignedColors[candidate] = currentColor;
                        currentColoredSet.Add(candidate);
                    }
                }

                currentColor++;
            }

            return currentColor - 1;
        }

        /// <summary>
        /// Simulates compiler register allocation over an interference graph.
        /// Returns true if all variables can fit within available physical registers.
        /// </summary>
        public static bool TryAllocateRegisters(int numVariables, int[][] interferenceEdges, int availableRegisters, out int[] registerMap)
        {
            int colorsUsed = ColorGraphWelshPowell(numVariables, interferenceEdges, out registerMap);
            return colorsUsed <= availableRegisters;
        }

        /// <summary>
        /// Comprehensive validation suite.
        /// </summary>
        public static void RunTests()
        {
            Console.WriteLine("Running WelshPowellColoringEngine Test Suite...");

            // Test 1: Complete Graph K4 (Requires exactly 4 colors)
            int[][] edgesK4 = new int[][]
            {
                new int[] { 0, 1 }, new int[] { 0, 2 }, new int[] { 0, 3 },
                new int[] { 1, 2 }, new int[] { 1, 3 },
                new int[] { 2, 3 }
            };
            int colorsK4 = ColorGraphWelshPowell(4, edgesK4, out var mapK4);
            Debug.Assert(colorsK4 == 4, $"Test 1 Failed: K4 requires 4 colors, got {colorsK4}");
            ValidateProperColoring(4, edgesK4, mapK4);

            // Test 2: Bipartite Cycle C4 (Requires exactly 2 colors)
            int[][] edgesC4 = new int[][]
            {
                new int[] { 0, 1 }, new int[] { 1, 2 }, new int[] { 2, 3 }, new int[] { 3, 0 }
            };
            int colorsC4 = ColorGraphWelshPowell(4, edgesC4, out var mapC4);
            Debug.Assert(colorsC4 == 2, $"Test 2 Failed: C4 requires 2 colors, got {colorsC4}");
            ValidateProperColoring(4, edgesC4, mapC4);

            // Test 3: Register Allocation Simulation
            // 3 variables: x-y, y-z. Fits in 2 registers!
            int[][] regEdges = new int[][] { new int[] { 0, 1 }, new int[] { 1, 2 } };
            bool canAlloc2 = TryAllocateRegisters(3, regEdges, 2, out var regMap);
            Debug.Assert(canAlloc2, "Test 3 Failed: Should fit in 2 registers.");
            Debug.Assert(regMap[0] == regMap[2], "Test 3 Failed: Non-interfering x and z should share register.");

            Console.WriteLine("All WelshPowellColoringEngine tests PASSED successfully!");
        }

        private static void ValidateProperColoring(int n, int[][] edges, int[] colors)
        {
            foreach (var edge in edges)
            {
                int u = edge[0];
                int v = edge[1];
                Debug.Assert(colors[u] != colors[v], $"Color Invariant Violated between adjacent nodes {u} and {v}");
            }
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Systems & Complexity Analysis

### 3.1 Complexity Profile

| Metric | Bound | Architectural Justification |
| :--- | :--- | :--- |
| **Degree Sorting** | $O(V \log V)$ | Sorting vertex indices by degree array size. |
| **Greedy Independent Set Passes** | $O(V^2 + E)$ | Scanning non-adjacent candidates across colors. |
| **Total Time Complexity** | $\mathbf{O(V \log V + V^2)}$ | Fast polynomial-time heuristic approximation for NP-hard coloring. |
| **Auxiliary Space** | $\mathbf{\Theta(V)}$ | Compact `int[] color` array. |

---

## 4. 🧩 APPLY: Canonical Problem Walkthroughs

### 4.1 [LeetCode 1042] Flower Planting With No Adjacent (Medium)

#### Problem Description
You have `n` gardens, labeled from `1` to `n`, and an array `paths` where `paths[i] = [x, y]` describes a bidirectional path. Every garden has **at most 3 paths** coming into or out of it. Choose a flower type (from 1, 2, 3, 4) for each garden such that no two adjacent gardens share the same flower type.

#### Architectural Proof & Intuition
- Since the maximum degree $\Delta(G) \le 3$, by the **Trivial Degree Bound**, the graph can always be colored using at most $\Delta(G) + 1 = 3 + 1 = \mathbf{4}$ colors!
- Therefore, a simple greedy traversal is **mathematically guaranteed** to succeed with zero backtracking!

```csharp
public class SolutionLC1042
{
    public int[] GardenNoAdj(int n, int[][] paths)
    {
        List<int>[] adj = new List<int>[n + 1];
        for (int i = 1; i <= n; i++) adj[i] = new List<int>();

        foreach (var p in paths)
        {
            adj[p[0]].Add(p[1]);
            adj[p[1]].Add(p[0]);
        }

        int[] colors = new int[n]; // 0-indexed result: garden i+1 gets colors[i]

        for (int i = 1; i <= n; i++)
        {
            bool[] used = new bool[5]; // Colors 1, 2, 3, 4

            // Check neighbor colors
            foreach (int neighbor in adj[i])
            {
                if (neighbor < i) // Only check already-colored gardens
                {
                    used[colors[neighbor - 1]] = true;
                }
            }

            // Pick first unused color (mex)
            for (int c = 1; c <= 4; c++)
            {
                if (!used[c])
                {
                    colors[i - 1] = c;
                    break;
                }
            }
        }

        return colors;
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 1042] Flower Planting With No Adjacent (Medium):**
   - Implement the greedy $\Delta(G) + 1$ coloring.

2. **Brooks' Theorem Verification Lab:**
   - Construct an odd cycle $C_5$ and verify that it requires $\Delta(C_5) + 1 = 3$ colors.
   - Construct a tree and verify that it requires only $\chi = 2$ colors despite $\Delta$ being arbitrary.

3. **Compiler Register Spill Simulator:**
   - Modify `WelshPowellColoringEngine` to detect when $\chi(G) > K$, selecting the vertex with the lowest spill cost (e.g. lowest loop depth) to spill to RAM stack memory.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Graph Coloring Strategy:

                    What is the Maximum Target Color Count (k)?
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼ (k = 2)                                       ▼ (k >= 3)
         Bipartite 2-Coloring                            General Graph Coloring
         Strictly O(V + E)                               NP-Complete in General!
                 │                                               │
                 ▼                                               ▼
         Odd-Cycle Check                                  Greedy Heuristics
                                                  (Welsh-Powell, Chaitin Register)
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
How is graph vertex coloring used in optimizing compilers for CPU register allocation?

### Architectural Model Answer
1. **The Physical Register Constraint:**
   - In computer architecture, CPU instructions execute orders of magnitude faster when operands reside in physical hardware registers (e.g. 16 registers in x86-64) rather than RAM.
   - However, compiler intermediate representations (IR, such as LLVM SSA form) generate an unbounded number of virtual registers (variables).

2. **Construction of the Interference Graph:**
   - The compiler performs **Liveness Analysis** to compute the live range of each variable (the program interval between its definition and its last use).
   - An **Interference Graph** $G = (V, E)$ is constructed:
     - Each virtual variable is a vertex $v \in V$.
     - An undirected edge $(u, v) \in E$ is added if and only if the live ranges of variable $u$ and variable $v$ overlap. Adjacent variables cannot share the same physical register simultaneously without overwriting data.

3. **Reduction to K-Coloring (Chaitin's Algorithm):**
   - The register allocation problem is reduced to finding a **$K$-coloring** of the interference graph, where $K$ is the number of available physical CPU registers.
   - If the graph can be colored with $K$ colors:
     - Each color directly corresponds to a specific hardware register.
     - Two non-adjacent vertices can safely share the same physical register at different time intervals.
   - If the graph requires more than $K$ colors ($\chi(G) > K$), the compiler selects "spill candidate" variables to be evicted to RAM stack frames, removing their interference edges until the graph becomes $K$-colorable.
