---
title: "Week 22 — Day 154: Week 22 Synthesis, Network Routing Topologies & Timed Interview Drill"
---

# Week 22 — Day 154: Week 22 Synthesis, Network Routing Topologies & Timed Interview Drill

Welcome to **Day 154 of your DSA Mastery Journey**!

Congratulations on reaching the capstone of **Week 22: Connectivity, Decomposition & Structural Properties**!

Over the past six days, you expanded your graph theory toolkit far beyond basic traversals:
- **Day 148:** Equivalence relations in undirected graphs, connected components, and multi-source reverse flood fill ([LC 323], [LC 417]).
- **Day 149:** Bipartite graph detection, Kőnig's Odd-Cycle Impossibility Theorem, and 2-color state machines ([LC 785], [LC 886]).
- **Day 150:** Graph coloring, the Chromatic Number $\chi(G)$, Brooks' Theorem, Welsh-Powell degree-ordered coloring, and LLVM/CLR compiler register allocation ([LC 1042]).
- **Day 151:** The Euler Tour technique on trees, flattening hierarchical subtrees into contiguous 1D array ranges $[in[u], out[u]]$ for $O(1)$ ancestor queries and $O(\log N)$ range updates ([LC 337]).
- **Day 152:** Eulerian trails and circuits, degree parity invariants, and Hierholzer's linear-time cycle splicing algorithm ([LC 332], [LC 753]).
- **Day 153:** Graph planarity, Euler's Characteristic ($V - E + F = 2$), the $E \le 3V - 6$ sparsity bound, and Kuratowski's forbidden minors ($K_5, K_{3,3}$).

Today is our **Synthesis & Systems Integration Day**. We connect graph planarity and Eulerian routing directly to physical hardware engineering: **Printed Circuit Board (PCB) Trace Routing & Multi-Layer Vias**.

You will:
1. Complete a **45-minute timed interview drill** on Bipartite Detection and Hierholzer Itinerary Reconstruction.
2. Architect and implement a multi-layer **PCB Trace Router Simulator (`PcbTraceRouterSimulator`)** in C# demonstrating how hardware engineers overcome planar crossing limits.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             DAY 154: HARDWARE ROUTING SYNTHESIS & DRILL                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       TIMED INTERVIEW DRILL       │                             │       PCB TRACE ROUTER SYSTEMS    │
│        (45-Minute Benchmark)      │                             │         (VLSI Physical Design)    │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Challenge A (20 Mins):          │                             │ • Single-layer PCB is strictly    │
│   [LC 785] Is Graph Bipartite?    │ ── Engineering Pipeline ──► │   PLANAR: traces cannot cross!    │
│   (2-Color BFS/DFS Wavefront)     │                             │ • By Kuratowski, K3,3 forces a    │
│ • Challenge B (25 Mins):          │                             │   crossing on 1 layer!            │
│   [LC 332] Reconstruct Itinerary  │                             │ • Multi-Layer Vias: drill through │
│   (Hierholzer Directed Trail)     │                             │   layers to achieve 3D routing!   │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CAPSTONE PRODUCTION CONTAINER       │
                          ├─────────────────────────────────────────────┤
                          │ • PcbTraceRouterSimulator in C#             │
                          │ • Multi-Layer Grid Routing with Vias        │
                          │ • Automated Collision & Continuity Tests    │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Systems Architecture

### 1.1 🏎️ The Visual Mental Model: Highway Overpasses & The PCB Via Elevator

Before configuring 3D grid routers or EDA algorithms, picture two high-speed highways that must cross each other:

```
              🏎️ HIGHWAY OVERPASSES & THE 3D PCB VIA ELEVATOR

   Imagine two multi-lane highways that must cross:
   • If they meet on the SAME flat 2D ground level:
     💥 HEAD-ON CRASH! Traffic gridlock and destruction!
     (On a circuit board: Copper touches copper ===> Short circuit & burned chips!)
     
   HOW CIVIL ENGINEERS SOLVE IT (THE 3D OVERPASS):
   • Highway 1 stays on the ground level (Layer 1).
   • Highway 2 takes an elevated bridge or subway tunnel (Layer 2) to pass cleanly
     above or below Highway 1 without ever touching it!

   THE PCB "VIA" (VERTICAL INTERCONNECT ACCESS):
   A Via is a tiny vertical elevator shaft drilled through the fiberglass board:
   
   Layer 1 (Top):     Trace ──► [ Via 1 (Down) ]                       [ Via 2 (Up) ] ──► Target
                                      │                                      ▲
   Dielectric Insulation              │                                      │
   ───────────────────────────────────┼──────────────────────────────────────┼─────────────
   Layer 2 (Subway):                  └─────── (Tunnel Under Obstacle) ──────┘

   BECAUSE REAL CIRCUITS CONTAIN NON-PLANAR K_{3,3} SUBGRAPHS,
   3D MULTI-LAYER ROUTING WITH VIAS IS PHYSICALLY MANDATORY IN EVERY DEVICE!
```

---

### 1.2 🖼️ Visual Gallery: 2D Collision vs 3D Via Subway Underpass

```
   The 2D Planar Obstacle (Collision!):
     Layer 1 (Top):
       Pin A ───────────────► Pin B
                   X  <── Electrical Short-Circuit!
       Pin C ───────────────► Pin D

   The Multi-Layer Via Resolution (3D Non-Planar Bypass):
     Layer 1 (Top):
       Pin A ───────────────► Pin B
                 (Gap)
       Pin C ──► [ Via 1 ] (Drops down)                   [ Via 2 ] ──► Pin D
                     │                                        ▲
     Dielectric      │                                        │
     ────────────────┼────────────────────────────────────────┼────────
     Layer 2 (Bottom):
                     └──────── (Underpass Trace) ─────────────┘
```

#### The 3D Grid State Machine (6 Cardinal Directions):
In 3D routing, each step from `(layer, r, c)` has 6 possible moves:
1. North: `(layer, r - 1, c)`
2. South: `(layer, r + 1, c)`
3. West:  `(layer, r, c - 1)`
4. East:  `(layer, r, c + 1)`
5. Via Down: `(layer - 1, r, c)` (Drill downward)
6. Via Up:   `(layer + 1, r, c)` (Drill upward)

---

### 1.3 🏛️ Memory Layout: 3D Grid Tensor Flattening in Hardware RAM

In hardware memory, a 3D PCB grid of dimensions `[Layers, Rows, Cols]` is stored as a single flat 1D array:

```
   Coordinate: (layer, r, c) in [L, R, C] Grid:
   1D Index:   index = (layer * R + r) * C + c
   
   State Buffer (int[] grid):
   0 = Empty Free Space
   -1 = Board Boundary / Keep-Out Obstacle
   NetId > 0 = Routed Copper Trace
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *The Physical Trace Problem:* In electronic design automation (EDA, e.g. Altium Designer, KiCad, Cadence), integrated circuits (chips) have pins that must be interconnected by conductive copper traces on a circuit board.
  - *The Planar Barrier:* A single copper layer is mathematically a 2D plane $\mathbb{R}^2$. Copper traces cannot touch or intersect without causing an electrical short-circuit. Thus, a single-layer PCB can only route netlists that form a **Planar Graph**!
  - *Kuratowski's Inevitability:* Any real-world circuit containing 3 source pins connecting to 3 destination pins (e.g. data bus lines to memory) embeds a **$K_{3,3}$ bipartite graph**. By Kuratowski's theorem, $K_{3,3}$ is non-planar—meaning it is physically impossible to route on a single layer without intersections!
  - *The Multi-Layer Via Solution:* Hardware designers resolve this by stacking multiple copper layers (4, 8, 16, or 32 layers) separated by insulating dielectric. A **Via** is a vertical copper-plated hole drilled through the board. A trace routes along Layer 1, drops down a via to Layer 2 to pass under the obstructing trace, and returns to Layer 1 through another via!
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Physical Miniaturization:* Modern smartphones pack billions of transistors and complex high-speed buses into tiny motherboards by routing non-planar subgraphs across dozens of PCB layers.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Circuit routing, optical network layout, FPGA channel routing.
  - *Failure Modes:*
    - Excessive vias: each via introduces parasitic capacitance and inductance that degrades high-frequency gigahertz signals.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *3D Grid Memory:* A 3D tensor `int[layers, rows, cols]` representing multi-layer PCB space, where values represent net IDs (0 = empty, $>0$ = net ID).
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "Single-layer PCB trace routing is a direct physical manifestation of planar graph theory: copper traces cannot intersect without short-circuiting. By Kuratowski's theorem, any netlist embedding a $K_5$ or $K_{3,3}$ minor is impossible to route on a single 2D plane. Electronic design tools solve this by extending routing into 3D using multi-layer boards connected by vertical vias. Traces hop between layers to cross obstacles, effectively bypassing 2D planarity barriers."
- **6. HOW (Complexity & Invariants):**
  - *Path Routing (Lee's Algorithm / 3D BFS):* $\Theta(\text{Layers} \cdot M \cdot N)$ per net.

---

### 1.5 The Multi-Layer Via Resolution of $K_{3,3}$

```
The 2D Planar Obstacle (Collision!):
  Layer 1 (Top):
    Pin A ───────────────► Pin B
                X  <── Electrical Short-Circuit!
    Pin C ───────────────► Pin D

The Multi-Layer Via Resolution (3D Non-Planar Bypass):
  Layer 1 (Top):
    Pin A ───────────────► Pin B
              (Gap)
    Pin C ──► [ Via 1 ] (Drops down)                   [ Via 2 ] ──► Pin D
                  │                                        ▲
  Dielectric      │                                        │
  ────────────────┼────────────────────────────────────────┼────────
  Layer 2 (Bottom):
                  └──────── (Underpass Trace) ─────────────┘
```

---

---

### 🎤 Multi-Topic Spoken Synthesis Drill (≤ 60 Seconds)

#### Synthesis Drill: Graph Connectivity & Routing Topologies
- **Bipartite Verification:** 2-Color BFS/DFS. Graph is bipartite if and only if it contains no odd-length cycles.
- **Eulerian Path:** Connected graph with at most two vertices of odd degree (undirected) or $	ext{out} - 	ext{in} \le 1$ (directed). Hierholzer's algorithm in $O(V+E)$.
- **Tarjan's Low-Link Values:** Computes strongly connected components (SCCs) and articulation bridges in a single DFS pass.


## 2. 💻 IMPLEMENT: Production C# Container

The `PcbTraceRouterSimulator` simulates multi-layer PCB routing using 3D BFS with vertical via transitions:
1. Multi-layer grid modeling with collision detection.
2. Routing traces between pins with via penalties.
3. Automated `Debug.Assert` validation tests.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedDSA.GraphFundamentals
{
    /// <summary>
    /// Represents a 3D coordinate on a multi-layer PCB.
    /// </summary>
    public readonly struct PcbPoint : IEquatable<PcbPoint>
    {
        public int Layer { get; }
        public int Row { get; }
        public int Col { get; }

        public PcbPoint(int layer, int row, int col)
        {
            Layer = layer;
            Row = row;
            Col = col;
        }

        public bool Equals(PcbPoint other) => Layer == other.Layer && Row == other.Row && Col == other.Col;
        public override bool Equals(object obj) => obj is PcbPoint other && Equals(other);
        public override int GetHashCode() => HashCode.Combine(Layer, Row, Col);
    }

    /// <summary>
    /// Production container for Multi-Layer PCB Trace Routing,
    /// demonstrating how multi-layer vias resolve planar graph crossing barriers.
    /// </summary>
    public sealed class PcbTraceRouterSimulator
    {
        private readonly int _layers;
        private readonly int _rows;
        private readonly int _cols;
        private readonly int[,,] _board; // 0 = free, >0 = Net ID

        public PcbTraceRouterSimulator(int layers, int rows, int cols)
        {
            _layers = layers;
            _rows = rows;
            _cols = cols;
            _board = new int[layers, rows, cols];
        }

        /// <summary>
        /// Attempts to route an electrical net between start and target points using 3D BFS.
        /// Allows routing along the 2D plane and hopping between layers via vertical vias.
        /// </summary>
        public bool TryRouteNet(int netId, PcbPoint start, PcbPoint target, out List<PcbPoint> path)
        {
            path = new List<PcbPoint>();

            Queue<PcbPoint> queue = new Queue<PcbPoint>();
            Dictionary<PcbPoint, PcbPoint> parent = new Dictionary<PcbPoint, PcbPoint>();

            queue.Enqueue(start);
            parent[start] = start;

            // 6-Directional Moves: 4 orthogonal planar moves + 2 vertical via moves
            int[] dl = { 0, 0, 0, 0, -1, 1 };
            int[] dr = { -1, 1, 0, 0, 0, 0 };
            int[] dc = { 0, 0, -1, 1, 0, 0 };

            bool found = false;

            while (queue.Count > 0)
            {
                PcbPoint curr = queue.Dequeue();

                if (curr.Equals(target))
                {
                    found = true;
                    break;
                }

                for (int d = 0; d < 6; d++)
                {
                    int nl = curr.Layer + dl[d];
                    int nr = curr.Row + dr[d];
                    int nc = curr.Col + dc[d];

                    if (nl >= 0 && nl < _layers && nr >= 0 && nr < _rows && nc >= 0 && nc < _cols)
                    {
                        var next = new PcbPoint(nl, nr, nc);

                        // Must be empty cell, or the target pin
                        if ((_board[nl, nr, nc] == 0 || next.Equals(target)) && !parent.ContainsKey(next))
                        {
                            parent[next] = curr;
                            queue.Enqueue(next);
                        }
                    }
                }
            }

            if (!found) return false;

            // Reconstruct path
            PcbPoint step = target;
            while (!step.Equals(start))
            {
                path.Add(step);
                _board[step.Layer, step.Row, step.Col] = netId; // Mark copper trace
                step = parent[step];
            }
            path.Add(start);
            _board[start.Layer, start.Row, start.Col] = netId;
            path.Reverse();

            return true;
        }

        /// <summary>
        /// Comprehensive validation suite.
        /// </summary>
        public static void RunTests()
        {
            Console.WriteLine("Running PcbTraceRouterSimulator Test Suite...");

            // Test 1: Single-layer routing without obstacles
            var pcb1 = new PcbTraceRouterSimulator(1, 5, 5);
            bool ok1 = pcb1.TryRouteNet(1, new PcbPoint(0, 0, 0), new PcbPoint(0, 4, 4), out var path1);
            Debug.Assert(ok1, "Test 1 Failed: Direct path should route.");
            Debug.Assert(path1.Count == 9, $"Test 1 Failed: Expected 9 steps, got {path1.Count}");

            // Test 2: Crossing Obstacle on Single-Layer Board (Must Fail)
            var pcb2 = new PcbTraceRouterSimulator(1, 3, 3);
            // Block row 1 completely with Net 1
            pcb2.TryRouteNet(1, new PcbPoint(0, 1, 0), new PcbPoint(0, 1, 2), out _);
            // Now attempt to route Net 2 from (0, 0, 1) to (0, 2, 1) crossing row 1
            bool ok2 = pcb2.TryRouteNet(2, new PcbPoint(0, 0, 1), new PcbPoint(0, 2, 1), out _);
            Debug.Assert(!ok2, "Test 2 Failed: Single-layer cannot cross existing trace without collision!");

            // Test 3: Multi-Layer Via Bypass (Must Succeed!)
            // Enable 2 layers: Net 2 should drop to Layer 1 via a via and bypass row 1!
            var pcb3 = new PcbTraceRouterSimulator(2, 3, 3);
            // Place blocking Net 1 on Layer 0
            pcb3.TryRouteNet(1, new PcbPoint(0, 1, 0), new PcbPoint(0, 1, 2), out _);
            // Route Net 2 from Layer 0 across row 1
            bool ok3 = pcb3.TryRouteNet(2, new PcbPoint(0, 0, 1), new PcbPoint(0, 2, 1), out var path3);
            Debug.Assert(ok3, "Test 3 Failed: Multi-layer via must successfully bypass blocking trace!");

            bool usedLayer1 = false;
            foreach (var pt in path3)
            {
                if (pt.Layer == 1) usedLayer1 = true;
            }
            Debug.Assert(usedLayer1, "Test 3 Failed: Path must utilize Layer 1 via underpass!");

            Console.WriteLine("All PcbTraceRouterSimulator tests PASSED successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Timed Interview Practice Drill (45 Minutes)

### Challenge A: [LeetCode 785] Is Graph Bipartite? (Target: 20 Minutes)
- **Goal:** Determine if the graph can be partitioned into two independent sets.
- **Constraints:** $1 \le V \le 100$, graph can be disconnected.
- **Strategy:** 2-Color BFS/DFS state machine.

```csharp
public class SolutionLC785_Drill
{
    public bool IsBipartite(int[][] graph)
    {
        int n = graph.Length;
        int[] color = new int[n]; // 0: uncolored, 1: red, 2: blue

        for (int i = 0; i < n; i++)
        {
            if (color[i] != 0) continue;

            Queue<int> q = new Queue<int>();
            q.Enqueue(i);
            color[i] = 1;

            while (q.Count > 0)
            {
                int u = q.Dequeue();
                int nextColor = (color[u] == 1) ? 2 : 1;

                foreach (int v in graph[u])
                {
                    if (color[v] == color[u]) return false; // Odd cycle!
                    if (color[v] == 0)
                    {
                        color[v] = nextColor;
                        q.Enqueue(v);
                    }
                }
            }
        }

        return true;
    }
}
```

---

### Challenge B: [LeetCode 332] Reconstruct Itinerary (Target: 25 Minutes)
- **Goal:** Find an Eulerian path consuming all tickets, starting from `"JFK"`, with smallest lexical order.
- **Strategy:** Hierholzer's Algorithm with `PriorityQueue` post-order DFS.

```csharp
public class SolutionLC332_Drill
{
    public IList<string> FindItinerary(IList<IList<string>> tickets)
    {
        var graph = new Dictionary<string, PriorityQueue<string, string>>();

        foreach (var t in tickets)
        {
            string from = t[0], to = t[1];
            if (!graph.ContainsKey(from)) graph[from] = new PriorityQueue<string, string>();
            graph[from].Enqueue(to, to);
        }

        var result = new List<string>();
        Hierholzer("JFK", graph, result);
        result.Reverse();
        return result;
    }

    private void Hierholzer(string curr, Dictionary<string, PriorityQueue<string, string>> graph, List<string> result)
    {
        if (graph.ContainsKey(curr))
        {
            var pq = graph[curr];
            while (pq.Count > 0)
            {
                string next = pq.Dequeue();
                Hierholzer(next, graph, result);
            }
        }
        result.Add(curr); // Post-order stack push
    }
}
```

---

## 4. 🏋️ PRACTICE: Complete Week 22 Synthesis Checklist

Before graduating from Week 22, verify that you have mastered all key competencies:

- [x] **Day 148:** Explain the algebraic equivalence relation of undirected connectivity and implement multi-source reverse flood fill ([LC 417]).
- [x] **Day 149:** State and prove Kőnig's Odd-Cycle Impossibility Theorem and implement 2-color bipartite detection.
- [x] **Day 150:** State Brooks' Theorem, describe Welsh-Powell greedy degree ordering, and explain compiler register allocation.
- [x] **Day 151:** Demonstrate how the Euler Tour technique flattens tree subtrees into contiguous 1D array ranges $[in[u], out[u]]$ for $O(1)$ ancestor tests and $O(\log N)$ range queries.
- [x] **Day 152:** State Euler's degree parity conditions for directed/undirected Eulerian trails and implement Hierholzer's $O(V+E)$ cycle-splicing algorithm.
- [x] **Day 153:** Derive the $E \le 3V - 6$ sparsity bound from Euler's formula ($V - E + F = 2$) and identify Kuratowski's forbidden minors ($K_5, K_{3,3}$).
- [x] **Day 154:** Model a multi-layer PCB router demonstrating how 3D vias overcome 2D planar crossing barriers.

---

## 5. 🔗 CONNECT: The Pattern Decision Bridge

```
Week 22 Master Structural Classification:

                     What structural property is in question?
                                        │
     ┌──────────────────┬───────────────┴───────────────┬──────────────────┐
     ▼                  ▼                               ▼                  ▼
  Bipartite?         Coloring?                      Eulerian?           Planar?
  Zero Odd Cycles?   Chromatic Number χ(G)          Traverse All Edges? Draw without Crossings?
  2-Color BFS/DFS    Welsh-Powell Greedy            Hierholzer O(V+E)   E <= 3V - 6
  (LC 785, 886)      Register Allocation (LC 1042)  (LC 332, 753)       Kuratowski K5, K3,3
```

---

## 6. 🎯 Daily Checkpoint Questions

### Checkpoint Question
Why are printed circuit board (PCB) trace routing problems modeled as planar graphs, and how do multi-layer vias resolve the $K_{3,3}$ topological crossing barrier?

### Architectural Model Answer
1. **The Planar Graph Model of Single-Layer PCBs:**
   - In physical circuit design, electrical conductors (copper traces) are etched onto a non-conductive dielectric substrate.
   - If two traces carrying different electrical signals intersect on the same physical layer, they form an electrical short-circuit, causing hardware failure.
   - Therefore, valid single-layer trace layout is mathematically identical to a **Planar Graph Embedding**: vertices represent electronic pins, and edges represent traces that must not cross in the 2D plane $\mathbb{R}^2$.

2. **The $K_{3,3}$ Topological Crossing Barrier:**
   - Consider connecting 3 signal sources (e.g. data pins on a microcontroller) to 3 destinations (e.g. memory bus pins). This forms the complete bipartite graph $K_{3,3}$ ($V = 6, E = 9$).
   - For a bipartite planar graph with $V \ge 3$, faces have at least 4 edges ($2E \ge 4F \implies F \le \frac{E}{2}$). Substituting into Euler's formula ($V - E + F = 2$) yields:
     $$E \le 2V - 4$$
   - For $K_{3,3}$ with $V = 6$:
     $$E \le 2(6) - 4 = 8$$
   - But $K_{3,3}$ has $9$ edges ($9 > 8$).
   - By **Kuratowski's Theorem**, $K_{3,3}$ is fundamentally non-planar and **cannot be drawn on a single layer without at least one crossing**.

3. **Multi-Layer Vias as 3D Non-Planar Resolution:**
   - To overcome this 2D topological limit, circuit designers manufacture boards with multiple stacked copper layers (e.g. 4, 8, or 16 layers).
   - A **Via** is a vertical hole drilled through the substrate and electroplated with copper, creating a conductive bridge between distinct vertical layers.
   - When a trace on Layer 1 encounters an obstructing trace, it drops down a via to Layer 2, routes under the obstacle in the third dimension, and returns to Layer 1 through a second via.
   - By introducing a 3rd spatial dimension ($z$-axis), the routing space transitions from $\mathbb{R}^2$ to a 3D manifold, where edge crossings can be completely avoided.
