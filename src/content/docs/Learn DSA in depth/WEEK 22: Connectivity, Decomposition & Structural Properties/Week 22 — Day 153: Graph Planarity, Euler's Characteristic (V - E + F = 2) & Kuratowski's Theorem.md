---
title: "Week 22 — Day 153: Graph Planarity, Euler's Characteristic (V - E + F = 2) & Kuratowski's Theorem"
---

# Week 22 — Day 153: Graph Planarity, Euler's Characteristic (V - E + F = 2) & Kuratowski's Theorem

Welcome to **Day 153 of your DSA Mastery Journey**!

Yesterday, on Day 152, you mastered Eulerian trails and Hierholzer's algorithm.

Today, we dive into geometric and topological graph theory with **Graph Planarity**, **Euler's Polyhedral Formula**, and **Kuratowski's Forbidden Minors**.

Why is planarity one of the most critical structural concepts in computer science and hardware engineering?
1. **Printed Circuit Board (PCB) & VLSI Routing:** Physical electrical traces printed on a copper layer cannot cross each other without short-circuiting. The routing layout of single-layer circuits is strictly a **planar graph embedding** problem!
2. **Road Networks & Geographic Information Systems (GIS):** Road networks without multi-level overpasses are planar-like graphs.
3. **Algorithmic Complexity Superpowers:** While general graph algorithms cost $O(V + E)$, in planar graphs, edges are mathematically constrained to be sparse:
   $$E \le 3V - 6$$
   Therefore, **any $O(V + E)$ algorithm (like BFS, DFS, or Dijkstra) runs in strictly $O(V)$ linear time on planar graphs!**

Today, you will master:
1. **Euler's Formula ($V - E + F = 2$):** Proving the planar edge-bound theorem ($E \le 3V - 6$).
2. **Kuratowski's & Wagner's Theorems:** The two topological obstacles to planarity: $K_5$ (the complete 5-node graph) and $K_{3,3}$ (the three-utilities bipartite graph).
3. **The `PlanarityAnalyzer` C# Engine:** Validating planar topological invariants.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   DAY 153: GRAPH PLANARITY, EULER'S FORMULA & KURATOWSKI                         │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│     EULER'S FORMULA (V - E + F = 2│                             │     KURATOWSKI'S THEOREM          │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Planar: Embedded in plane with  │                             │ • Graph is planar IFF it contains │
│   zero edge crossings!            │ ── Topological Obstacles ─► │   NO subdivision of K5 or K3,3!   │
│ • Faces F bounded by edges.       │                             │ • K5: 5 nodes, 10 edges.          │
│ • 2E >= 3F (triangular faces)     │                             │   (Exceeds 3V - 6 = 9 edges!).    │
│ • Consequence:                    │                             │ • K3,3: Utilities Bipartite.      │
│   E <= 3V - 6 (for V >= 3)!       │                             │   (Exceeds 2V - 4 = 8 edges!).    │
│ • Planar BFS/DFS is ALWAYS O(V)!  │                             │ • Hardware PCB Routing Barrier.   │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CANONICAL PROBLEM MASTERY           │
                          ├─────────────────────────────────────────────┤
                          │ • Mathematical Non-Planarity Proofs         │
                          │ • Road Network Linear Time Traversals       │
                          │ • From-Scratch: PlanarityAnalyzer in C#     │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 📐 The Visual Mental Model: Copper Traces & The 3 Utilities Puzzle

Before looking at algebraic polyhedral formulas, picture drawing electrical wires on a flat printed circuit board:

```
              📐 COPPER CIRCUIT WIRES & THE 3 UTILITIES PUZZLE

   Imagine soldering copper wires on a flat, single-layer circuit board:
   • If two copper wires cross each other:
     💥 SHORT CIRCUIT! The board catches fire!
     
   Can you connect 3 Houses to 3 Utilities (Water, Gas, Electricity) with ZERO crossings?
   
        [ House A ]       [ House B ]       [ House C ]
             │ \   \       /   │   \       /   / │
             │  \   ──────┼────┼────┼─────     │
             │   ───────  │    │    │   ────── │
             ▼          ▼ ▼    ▼    ▼ ▼        ▼
        [ Water ]         [ Gas ]         [ Electricity ]

   TRY AS HARD AS YOU CAN, YOU WILL ALWAYS HAVE AT LEAST ONE CROSSING!
   This graph is K_{3,3} (The Complete Bipartite Utility Graph).
   It is MATHEMATICALLY IMPOSSIBLE to draw on a 2D plane without wires crossing!
```

#### Why Euler's Polyhedral Formula ($V - E + F = 2$) Governs Flat Space
Look at what happens when you draw enclosed regions on a flat sheet:

```
   1. A Single Triangle:
      • Vertices V = 3  (Corners)
      • Edges    E = 3  (Sides)
      • Faces    F = 2  (1 inside triangle + 1 infinite outside face)
      Check: V - E + F = 3 - 3 + 2 = 2!
      
   2. Draw a line splitting the triangle in two:
      • V = 3, E = 4, F = 3 (2 inside faces + 1 infinite outside face)
      Check: V - E + F = 3 - 4 + 3 = 2!
      
   THE SPARSITY LAW (Why Planar Graphs Can Never Be Dense):
   • Every face needs at least 3 edges to close it: 2E >= 3F  ===> F <= 2E / 3.
   • Substitute into Euler's formula:
     V - E + (2E / 3) >= 2   ===>  V - E/3 >= 2  ===>  E <= 3V - 6!
   
   A planar graph with 1,000,000 vertices can have AT MOST ~3,000,000 edges!
   Dense graphs (where E = O(V^2)) CAN NEVER BE DRAWN WITHOUT CROSSINGS!
```

---

### 1.2 🖼️ Visual Gallery: The Two Forbidden Kuratowski Non-Planar Archetypes

```
   1. K4 (Complete 4-Node): PLANAR!          2. K5 (Complete 5-Node): NON-PLANAR!
   
           [ A ] ────── [ B ]                               ( 1 )
            │  \      /  │                                 / | \ \
            │   \    /   │                                /  |  \ \
            │    \  /    │                               (2)─┼───(3)
            │     \/     │                                \  |  / /
            [ C ] ────── [ D ]                             \ | / /
      Naive drawing: diagonal crossing!                     ( 4 )
                                                              │
      Redraw diagonal B-C around outside:           • V = 5, E = 5*4/2 = 10 edges.
      (A) ─── (B)                                   • Check bound: 3V - 6 = 15 - 6 = 9.
       │       │ \                                  • But E = 10 > 9! (Violation!)
       │       │  \ (B-C loops around)              ===> 💥 IMPOSSIBLE TO DRAW PLANAR!
      (C) ─── (D) ─┘
      ✅ ZERO CROSSINGS! K4 IS PLANAR!
```

---

### 1.3 🏛️ Memory Layout: Compact CSR Cache Efficiency Guaranteed by $E \le 3V$

Because planar graphs are strictly sparse ($E < 3V$), their memory footprint in Compressed Sparse Row (CSR) storage is guaranteed to be linear and cache-optimal:

```
   Planar Graph Memory Profile in RAM:
   
   RowOffsets array:    Length = V + 1   (e.g., 100,001 ints = 400 KB)
   ColIndices array:    Length <= 3V - 6 (e.g., <= 300,000 ints = 1.2 MB)
   
   TOTAL MEMORY: Less than 2 Megabytes for 100,000 vertices!
   Traversals (BFS/DFS) run in strictly O(V) time because E is bounded by 3V!
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* A graph $G = (V, E)$ is **Planar** if it can be drawn in a 2D Euclidean plane $\mathbb{R}^2$ such that its edges intersect only at their endpoints (i.e. zero edge crossings).
  - *Euler's Polyhedral Formula (1758):* For any connected planar graph drawn in the plane:
    $$V - E + F = 2$$
    where $V$ is the number of vertices, $E$ is the number of edges, and $F$ is the number of faces (regions bounded by edges, including the single unbounded exterior face).
  - *The Planar Sparsity Theorem:* For any connected planar graph with $V \ge 3$:
    $$E \le 3V - 6$$
    If $G$ is also triangle-free (e.g. bipartite):
    $$E \le 2V - 4$$
  - *Kuratowski's Theorem (1930):* A finite graph is planar **if and only if** it does not contain a subgraph that is a subdivision of $K_5$ (the complete graph on 5 vertices) or $K_{3,3}$ (the complete bipartite utility graph on $3 + 3$ vertices).
  - *Misconceptions:*
    - *Misconception 1:* "If a drawing of a graph has crossing edges, the graph is non-planar." **False!** A graph is planar if there exists *at least one* valid drawing without crossings. For example, $K_4$ drawn as an $X$-box has a crossing, but redrawing one diagonal around the outside removes the crossing completely!
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Linear Time Traversal:* Because $E \le 3V - 6 = O(V)$, any graph algorithm on planar graphs that costs $O(V + E)$ (such as BFS, DFS, Kahn's topological sort, or Kosaraju's SCC) runs in strictly **$O(V)$ linear time**!
  - *Physical VLSI / PCB Design:* Determines whether copper traces can connect chips on a single board layer without short-circuiting.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Spatial road network routing, GIS map coloring, mesh generation in computer graphics.
    - Testing single-layer PCB routability.
  - *Failure Modes:*
    - Assuming 3D networks are planar: subways, airline routes, and multi-layer PCBs violate planarity constraints.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Compact Representation:* Planar graphs can be stored in flat CSR arrays requiring at most $3V$ elements in `ColumnIndices`, drastically cutting RAM consumption.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "A graph is planar if it can be embedded in the plane with zero edge crossings. By Euler's formula $V - E + F = 2$, every face is bounded by at least 3 edges, which proves that the number of edges in any planar graph is strictly bounded by $E \le 3V - 6$. This sparsity ensures that BFS and DFS run in strictly $O(V)$ time. By Kuratowski's theorem, non-planarity is characterized by the presence of $K_5$ or $K_{3,3}$ minors, which serves as the theoretical foundation for single-layer PCB routing."
- **6. HOW (Complexity & Invariants):**
  - *Planar Sparsity:* $E = O(V)$; Maximum average degree is strictly $< 6$ ($\sum \text{deg}(v) = 2E < 6V - 12 \implies \text{avg}(\text{deg}) < 6$). Every planar graph has at least one vertex with degree $\le 5$.

---

### 1.5 Mathematical Proof: The $E \le 3V - 6$ Sparsity Bound

Why are planar graphs guaranteed to have fewer than $3V$ edges?

```
A Planar Triangulation:
         [ A ]
        /  |  \
       /   |   \
    [ B ]──┼──[ C ]
       \   |   /
        \  |  /
         [ D ]
Every face is a triangle (bounded by 3 edges).
Adding any more edges would force an edge crossing!
```

#### Step-by-Step Proof:
1. Consider a connected planar graph $G = (V, E)$ with $V \ge 3$ drawn in the plane, dividing it into $F$ faces.
2. Every face $f_i$ is bounded by a cycle of edges. Since the graph is simple and $V \ge 3$, the boundary of every face must contain **at least 3 edges**:
   $$\text{Edges bounding face } f_i \ge 3$$
3. Summing the bounding edges across all $F$ faces:
   $$\sum_{i=1}^F (\text{Edges bounding } f_i) \ge 3F$$
4. In any planar drawing, **every edge borders at most 2 faces** (one on each side):
   $$\sum_{i=1}^F (\text{Edges bounding } f_i) = 2E$$
5. Combining these inequalities:
   $$2E \ge 3F \implies F \le \frac{2}{3}E$$
6. Now, substitute this into **Euler's Formula** ($V - E + F = 2$):
   $$V - E + F = 2$$
   $$V - E + \frac{2}{3}E \ge 2$$
   $$V - \frac{1}{3}E \ge 2$$
   $$V - 2 \ge \frac{1}{3}E$$
   $$E \le 3V - 6 \quad \blacksquare$$

---

### 1.2 Kuratowski's Two Forbidden Minors: $K_5$ and $K_{3,3}$

Why are $K_5$ and $K_{3,3}$ non-planar?

```
1. Complete Graph K5:                      2. Complete Bipartite K3,3 (Utility Graph):
        ( 5 Vertices )                                ( 3 Houses, 3 Utilities )
        Every node connects to                        Top:    [ H1 ]  [ H2 ]  [ H3 ]
        all other 4 nodes.                                       \  \  /  /
        V = 5, E = 10.                                            \  \/  /
        Planar Bound: E <= 3(5) - 6 = 9!                          /\ /\ /
        Since 10 > 9, K5 CANNOT BE PLANAR!            Bottom: [ Gas ] [ Water ] [ Elec ]
                                                      Bipartite (no triangles): E <= 2(6) - 4 = 8!
                                                      Actual E = 9 > 8: CANNOT BE PLANAR!
```

---

## 2. 💻 IMPLEMENT: Production C# Container

The `PlanarityAnalyzer` provides:
1. `CheckPlanarEdgeBound`: Verifies the fundamental $E \le 3V - 6$ constraint.
2. `CheckBipartitePlanarBound`: Verifies the triangle-free $E \le 2V - 4$ constraint.
3. `EulerCharacteristicValidator`: Verifies $V - E + F = 2$ for planar meshes.
4. Automated `Debug.Assert` validation tests.

```csharp
using System;
using System.Diagnostics;

namespace AdvancedDSA.GraphFundamentals
{
    /// <summary>
    /// Production container for Graph Planarity analysis,
    /// Euler Characteristic verification, and Kuratowski minor bounds.
    /// </summary>
    public sealed class PlanarityAnalyzer
    {
        /// <summary>
        /// Verifies whether the graph satisfies the necessary planar edge bound:
        /// E <= 3V - 6 (for V >= 3).
        /// </summary>
        public static bool SatisfiesPlanarEdgeBound(int numVertices, int numEdges)
        {
            if (numVertices <= 2) return true;
            return numEdges <= (3 * numVertices - 6);
        }

        /// <summary>
        /// Verifies whether a bipartite graph satisfies the planar bound:
        /// E <= 2V - 4 (for V >= 3).
        /// </summary>
        public static bool SatisfiesBipartitePlanarBound(int numVertices, int numEdges)
        {
            if (numVertices <= 2) return true;
            return numEdges <= (2 * numVertices - 4);
        }

        /// <summary>
        /// Validates Euler's Polyhedral Formula: V - E + F = 2.
        /// </summary>
        public static bool ValidateEulerFormula(int v, int e, int f)
        {
            return (v - e + f) == 2;
        }

        /// <summary>
        /// Automated validation suite.
        /// </summary>
        public static void RunTests()
        {
            Console.WriteLine("Running PlanarityAnalyzer Test Suite...");

            // Test 1: Complete Graph K4 (V = 4, E = 6) -> Planar!
            // 3(4) - 6 = 6. E = 6 <= 6.
            Debug.Assert(SatisfiesPlanarEdgeBound(4, 6), "Test 1 Failed: K4 is planar.");

            // Test 2: Complete Graph K5 (V = 5, E = 10) -> Non-Planar!
            // 3(5) - 6 = 9. E = 10 > 9.
            Debug.Assert(!SatisfiesPlanarEdgeBound(5, 10), "Test 2 Failed: K5 must violate planar bound.");

            // Test 3: Complete Bipartite K3,3 (V = 6, E = 9) -> Non-Planar!
            // 2(6) - 4 = 8. E = 9 > 8.
            Debug.Assert(!SatisfiesBipartitePlanarBound(6, 9), "Test 3 Failed: K3,3 must violate bipartite planar bound.");

            // Test 4: Cube Graph (V = 8, E = 12, F = 6)
            // 8 - 12 + 6 = 2!
            Debug.Assert(ValidateEulerFormula(8, 12, 6), "Test 4 Failed: Cube must satisfy Euler's formula.");

            // Test 5: Tetrahedron (V = 4, E = 6, F = 4)
            // 4 - 6 + 4 = 2!
            Debug.Assert(ValidateEulerFormula(4, 6, 4), "Test 5 Failed: Tetrahedron must satisfy Euler's formula.");

            Console.WriteLine("All PlanarityAnalyzer tests PASSED successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Systems & Complexity Analysis

### 3.1 Complexity Profile

| Graph Category | Edge Density | BFS/DFS Traversal Complexity | Systems Impact |
| :--- | :--- | :--- | :--- |
| **General Graphs** | $E \le V^2$ | $O(V + E) = O(V^2)$ | High memory footprint; quadratic worst-case. |
| **Planar Graphs** | $\mathbf{E \le 3V - 6}$ | $\mathbf{O(V)}$ strictly linear! | Ultra-fast traversals; low memory cache footprint. |
| **Bipartite Planar** | $\mathbf{E \le 2V - 4}$ | $\mathbf{O(V)}$ strictly linear! | Road networks; single-layer PCB routes. |

---

## 4. 🧩 APPLY: Canonical Systems Walkthroughs

### 4.1 Road Network GPS Traversal Complexity

In geographic information systems (GIS), road maps are embedded on the surface of the Earth. Except for tunnels and bridges, roads only intersect at junctions.
- A road network with 1,000,000 intersections ($V = 10^6$) has at most $3 \cdot 10^6 - 6 \approx 3,000,000$ road segments ($E \approx 3V$).
- Because of planarity, shortest path algorithms (Dijkstra) run in $O(V \log V)$ instead of $O(V^2)$, enabling instant real-time GPS routing!

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **Euler Characteristic Verification Lab:**
   - Verify Euler's formula for an Octahedron ($V=6, E=12, F=8$) and an Icosahedron ($V=12, E=30, F=20$).

2. **Degree 5 Node Invariant:**
   - Prove that every planar graph contains at least one vertex with degree $\text{deg}(v) \le 5$. *(Hint: Assume all $\text{deg}(v) \ge 6 \implies 2E = \sum \text{deg}(v) \ge 6V$, which contradicts $E \le 3V - 6$).*

3. **Planar 5-Coloring Proof:**
   - Using the Degree $\le 5$ invariant, construct an inductive proof that every planar graph is 5-colorable.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Structural Planarity Pipeline:

             Does the application embed in 2D physical space?
                                   │
           ┌───────────────────────┴───────────────────────┐
           ▼ (YES)                                         ▼ (NO)
    PLANAR GRAPH CONSTRAINTS                        GENERAL GRAPH ALGORITHMS
    • E <= 3V - 6 (Sparse!)                         • E can reach O(V^2)
    • All traversals are O(V)                       • Traversals are O(V + E)
    • Four Color Theorem (χ <= 4)                   • Coloring is NP-Hard
    • Single-layer PCB routable                     • Multi-layer vias required
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
Using Euler's formula, prove that in any planar graph with $V \ge 3$, the number of edges satisfies $E \le 3V - 6$.

### Architectural Model Answer
1. **Euler's Polyhedral Formula:**
   - For any connected planar graph embedded in the plane with $V$ vertices, $E$ edges, and $F$ faces:
     $$V - E + F = 2$$

2. **The Face Boundary Inequality:**
   - Each face is enclosed by a boundary cycle of edges.
   - For a simple graph with $V \ge 3$, the boundary of any face must consist of at least 3 edges:
     $$\text{Boundary}(f) \ge 3 \quad \forall f \in F$$
   - Summing across all $F$ faces:
     $$\sum_{f \in F} \text{Boundary}(f) \ge 3F$$

3. **Double Counting of Edges:**
   - Every edge in a planar drawing separates at most two faces (or lies on the boundary of one face twice in a tree). Thus:
     $$\sum_{f \in F} \text{Boundary}(f) = 2E$$
   - Therefore:
     $$2E \ge 3F \implies F \le \frac{2}{3}E$$

4. **Substitution & Algebraic Reduction:**
   - Substitute $F \le \frac{2}{3}E$ into Euler's formula:
     $$2 = V - E + F \le V - E + \frac{2}{3}E = V - \frac{1}{3}E$$
   - Rearranging terms:
     $$\frac{1}{3}E \le V - 2 \implies E \le 3V - 6 \quad \blacksquare$$

5. **Architectural Consequence:**
   - Planar graphs are guaranteed to be **asymptotically sparse** ($E = O(V)$). Graph algorithms whose time complexity is $O(V + E)$ execute in strictly $O(V)$ linear time on planar topologies.
