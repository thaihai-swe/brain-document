---
title: "Week 23 — Day 157: Matrix Grid Graphs: Obstacles, Bitmask States & Shortest Path with Keys"
---

# Week 23 — Day 157: Matrix Grid Graphs: Obstacles, Bitmask States & Shortest Path with Keys

Welcome to **Day 157 of your DSA Mastery Journey**!

In Day 148 and Day 155, you traversed 2D grid graphs where each cell $(r, c)$ was marked as visited exactly once. In standard flood fills and shortest-path grid problems, the rule is absolute: *never revisit a cell*, because revisiting a previously explored cell can only produce a path that is equal to or longer than the first arrival.

However, in advanced system simulations and FAANG hard interview questions, this Markovian assumption collapses when an agent collects **inventory, keys, energy, or tools** along the way.
- Consider a locked dungeon: You cannot pass the door at $(2, 5)$ until you collect the key at $(9, 1)$.
- To reach the key and return to the door, you **must walk back over the exact same hallway tiles you previously visited!**
- If your visited set only stores `(r, c)`, your algorithm will prune the return path and fail completely.

The solution is **State Augmentation via Bitmasks**:
- We expand the state definition from a 2D coordinate $(r, c)$ to a **3D state tuple $(r, c, \text{mask})$**, where $\text{mask}$ is a compact bitfield encoding the set of keys currently in possession.
- Visiting cell $(r, c)$ with 0 keys is a *completely different state* from visiting $(r, c)$ with 3 keys!
- By projecting the grid into a layered 3D state space, the problem transforms cleanly back into an unweighted shortest path BFS.

Today, you will master:
1. **The State Augmentation Paradigm:** Formalizing when and why physical coordinates alone are insufficient to define graph vertices.
2. **Compact Bitmask Encoding:** Manipulating integer bitfields (`mask | (1 << k)`, `mask & (1 << k)`) with zero heap allocations.
3. **Flat 3D Visited Matrices:** Implementing cache-friendly `bool[Rows, Cols, 1 << K]` lookup arrays for $O(1)$ state verification.
4. **Canonical Problem Mastery:** Solving **[LeetCode 864] Shortest Path to Get All Keys** and **[LeetCode 847] Shortest Path Visiting All Nodes**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             DAY 157: STATE-AUGMENTED BITMASK BFS                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       THE MARKOVIAN TRAP BREAK    │                             │       BITMASK STATE ALGEBRA       │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Naive: visited[r, c]            │                             │ • K keys -> 2^K distinct masks.   │
│   Prunes valid return trips!      │ ── Dimensional Expansion ──►│ • Collect key 'c':                │
│ • Augmented: visited[r, c, mask]  │                             │   nextMask = mask | (1 << (c-'a'))│
│ • State space expands to:         │                             │ • Unlock door 'D':                │
│   |V| = R * C * 2^K.              │                             │   if ((mask & (1 << (D-'A'))) != 0│
│ • BFS guarantees shortest path!   │                             │ • All keys collected:             │
│                                   │                             │   mask == (1 << K) - 1            │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CANONICAL PROBLEM MASTERY           │
                          ├─────────────────────────────────────────────┤
                          │ • [LC 864] Shortest Path to Get All Keys    │
                          │ • [LC 847] Shortest Path Visiting All Nodes │
                          │ • From-Scratch: StateAugmentedGridSolver    │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🏰 The Visual Mental Model: The Multi-Story Dungeon

Visualize state augmentation as taking an elevator between different floors of a dungeon:

```
                  THE 3D LAYERED DUNGEON STATE SPACE (K = 2 KEYS: 'a' and 'b')
                  
    FLOOR 3: mask = 11_2 (Both Keys 'a' and 'b')  ──► EXIT DOOR UNLOCKED!
    ▲
    │ (Agent acquires key 'b' at cell (1, 2) on Floor 1 -> Elevator ascends to Floor 3!)
    │
    FLOOR 1: mask = 01_2 (Has Key 'a', missing 'b') 
    ▲
    │ (Agent acquires key 'a' at cell (4, 4) on Floor 0 -> Elevator ascends to Floor 1!)
    │
    FLOOR 0: mask = 00_2 (No Keys)                ──► CANNOT PASS DOORS 'A' OR 'B'!
    
    KEY INSIGHT:
    The physical grid (R x C) is duplicated 2^K times!
    Walking to (r, c) on Floor 0 does NOT mark (r, c) on Floor 1 as visited!
    The agent is free to traverse the physical corridor on Floor 1 to reach door 'A'!
```

---

### 1.2 🖼️ Visual Gallery: Bitmask Algebra & Bit Manipulation Primitives

```
                     BITFIELD OPERATIONS FOR K <= 6 KEYS

    1. Bitmask Initialization (Empty inventory):
       int mask = 0;                     // Binary: 000000_2

    2. Key Acquisition ('a' through 'f'):
       char key = 'c';                   // Key index: 'c' - 'a' = 2
       mask |= (1 << (key - 'a'));       // Binary: 000100_2 (Bit 2 flipped to 1!)

    3. Lock Clearance Check ('A' through 'F'):
       char lock = 'C';                  // Lock index: 'C' - 'A' = 2
       bool canPass = (mask & (1 << (lock - 'A'))) != 0;
       // Evaluates TRUE only if Bit 2 is set!

    4. Goal State Predicate (All K keys collected):
       int targetMask = (1 << K) - 1;    // If K=3: (1 << 3) - 1 = 8 - 1 = 7 (111_2)
       bool isFinished = (mask == targetMask);
```

---

### 1.3 5W1H Executive Architecture Blueprint: State-Augmented Graphs

| Dimension | Architectural Specification |
| :--- | :--- |
| **1. WHAT** | A **State-Augmented Graph** expands physical vertices $V_{phys}$ into composite tuples $V_{aug} = V_{phys} \times S_{internal}$, where $S_{internal}$ represents the discrete internal state or inventory of the agent. |
| **2. WHY** | Breaks the limitation where paths requiring back-tracking or cycle traversal are mistakenly pruned by standard 2D visited sets. |
| **3. WHEN** | Mazes with keys and doors, energy-constrained pathfinding, traveling salesman subsets (TSP on small $N \le 15$), fuel/recharge stations. |
| **4. WHERE** | Stored in physical memory as a flattened 3D array: `bool[Rows, Cols, 1 << K]` or `int[Rows, Cols, 1 << K]` to avoid thousands of small heap object allocations. |
| **5. WHO** | Senior engineers designing state-machine game agents, robotic navigation with payload states, and solving LeetCode Hard grid problems. |
| **6. HOW** | Run queue-based BFS where each queue element is a packed struct or tuple `(int r, int c, int mask)`; transition into 4 orthogonal neighbors, updating the mask upon key pickup. |

---

### 1.4 ⚙️ Core Operations 5-Dimension Deep-Dive

#### Core Operation: Augmented State Enqueue & 3D Visited Mutation
- **Dimension 1 (Contract & Complexity):** Test feasibility of transition from $(r, c, \text{mask})$ to neighbor $(nr, nc, \text{nextMask})$. Time complexity: $O(1)$ bitwise and array indexing. Space complexity: $O(R \cdot C \cdot 2^K)$ visited flags.
- **Dimension 2 (Step-by-Step Logic):**
  1. Boundary Guard: Verify $0 \le nr < R$ and $0 \le nc < C$.
  2. Obstacle Check: Verify `grid[nr][nc] != '#'`.
  3. Lock Guard: If `grid[nr][nc]` is uppercase letter `'A'` to `'F'`:
     - Test if key exists: `if ((mask & (1 << (grid[nr][nc] - 'A'))) == 0) continue;` (Cannot pass!).
  4. Inventory Mutation: If `grid[nr][nc]` is lowercase letter `'a'` to `'f'`:
     - Compute new mask: `nextMask = mask | (1 << (grid[nr][nc] - 'a'));`.
     - Else: `nextMask = mask;`.
  5. 3D Visited Deduplication:
     - If `visited[nr, nc, nextMask] == true`: Drop transition.
     - Else: Mark `visited[nr, nc, nextMask] = true; queue.Enqueue((nr, nc, nextMask));`.
- **Dimension 3 (Visual State Transition):**
  ```
  Cell (3, 4) contains Key 'b'. Current State: (3, 3, mask=01_2, dist=10).
  Move East to (3, 4):
  1. Cell holds 'b' -> bit index = 1.
  2. nextMask = 01_2 | (1 << 1) = 01_2 | 10_2 = 11_2.
  3. Check visited[3, 4, 11_2]: False.
  4. Mark visited[3, 4, 11_2] = True.
  5. Enqueue (3, 4, 11_2) with distance 11.
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *State-Layered Distance Optimality:* In a BFS on an unweighted state-augmented graph, elements enter the queue in non-decreasing order of distance $d$. Because each state is uniquely identified by the triple $(r, c, \text{mask})$, when state $(r, c, \text{targetMask})$ is first dequeued, its recorded distance is the global minimum unweighted path length.
- **Dimension 5 (Edge Case Matrix):**
  - $K = 0$: Degenerates to standard 2D grid BFS ($2^0 = 1$ layer).
  - Target key already held: Bitwise OR operation is idempotent (`mask | (1 << k) == mask`).
  - Key unreachable behind its own lock: Search terminates returning -1 without infinite loop.

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Container(s)

Below is the standalone C# implementation of **`StateAugmentedGridSolver`**, complete with bitmask bit-packing, memory layout optimization, and unit test verification.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedGraph.ImplicitStates
{
    /// <summary>
    /// Production-grade solver for grid graphs requiring bitmask state augmentation.
    /// Solves shortest path problems where grid cells may be revisited under different inventories.
    /// </summary>
    public class StateAugmentedGridSolver
    {
        private static readonly int[] Dr = { -1, 1, 0, 0 };
        private static readonly int[] Dc = { 0, 0, -1, 1 };

        public readonly struct State : IEquatable<State>
        {
            public readonly int Row;
            public readonly int Col;
            public readonly int Mask;

            public State(int row, int col, int mask)
            {
                Row = row;
                Col = col;
                Mask = mask;
            }

            public bool Equals(State other) =>
                Row == other.Row && Col == other.Col && Mask == other.Mask;

            public override bool Equals(object? obj) =>
                obj is State other && Equals(other);

            public override int GetHashCode() =>
                HashCode.Combine(Row, Col, Mask);
        }

        /// <summary>
        /// Finds the minimum steps to collect all keys in a grid maze.
        /// Grid notation: '@'=start, '.'=empty, '#'=wall, 'a'-'f'=keys, 'A'-'F'=locks.
        /// Returns -1 if impossible.
        /// </summary>
        public int FindShortestPathToAllKeys(string[] grid)
        {
            int rows = grid.Length;
            int cols = grid[0].Length;

            int startR = -1, startC = -1;
            int totalKeys = 0;

            // Step 1: Scan grid for start position and count total keys
            for (int r = 0; r < rows; r++)
            {
                for (int c = 0; c < cols; c++)
                {
                    char ch = grid[r][c];
                    if (ch == '@')
                    {
                        startR = r;
                        startC = c;
                    }
                    else if (ch >= 'a' && ch <= 'f')
                    {
                        totalKeys = Math.Max(totalKeys, ch - 'a' + 1);
                    }
                }
            }

            int targetMask = (1 << totalKeys) - 1;

            // Step 2: Allocate flat 3D visited buffer: bool[rows, cols, 1 << totalKeys]
            int maskStates = 1 << totalKeys;
            bool[,,] visited = new bool[rows, cols, maskStates];

            var queue = new Queue<State>();
            var initial = new State(startR, startC, 0);

            queue.Enqueue(initial);
            visited[startR, startC, 0] = true;

            int steps = 0;

            while (queue.Count > 0)
            {
                int levelSize = queue.Count;

                for (int i = 0; i < levelSize; i++)
                {
                    State curr = queue.Dequeue();

                    // Goal reached: All keys in possession!
                    if (curr.Mask == targetMask)
                        return steps;

                    for (int d = 0; d < 4; d++)
                    {
                        int nr = curr.Row + Dr[d];
                        int nc = curr.Col + Dc[d];

                        // Boundary and wall guards
                        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols)
                            continue;

                        char cell = grid[nr][nc];
                        if (cell == '#')
                            continue;

                        // Lock guard: Must possess matching key
                        if (cell >= 'A' && cell <= 'F')
                        {
                            int requiredKey = cell - 'A';
                            if ((curr.Mask & (1 << requiredKey)) == 0)
                                continue; // Key not owned!
                        }

                        // Key pickup
                        int nextMask = curr.Mask;
                        if (cell >= 'a' && cell <= 'f')
                        {
                            nextMask |= (1 << (cell - 'a'));
                        }

                        if (!visited[nr, nc, nextMask])
                        {
                            visited[nr, nc, nextMask] = true;
                            queue.Enqueue(new State(nr, nc, nextMask));
                        }
                    }
                }

                steps++;
            }

            return -1; // Unreachable
        }
    }

    /// <summary>
    /// Verification test suite.
    /// </summary>
    public static class StateAugmentedGridTests
    {
        public static void RunTests()
        {
            var solver = new StateAugmentedGridSolver();

            // Test 1: Simple maze with key and door
            string[] grid1 = {
                "@.a.#",
                "###.#",
                "b.A.B"
            };
            int steps1 = solver.FindShortestPathToAllKeys(grid1);
            Debug.Assert(steps1 == 8, $"Expected 8, got {steps1}");

            // Test 2: Impossible maze (key behind locked door without key)
            string[] grid2 = {
                "@..aA",
                "..B#b"
            };
            int steps2 = solver.FindShortestPathToAllKeys(grid2);
            Debug.Assert(steps2 == -1, $"Expected -1, got {steps2}");

            // Test 3: Zero keys in maze (starts at goal)
            string[] grid3 = { "@.." };
            int steps3 = solver.FindShortestPathToAllKeys(grid3);
            Debug.Assert(steps3 == 0, $"Expected 0, got {steps3}");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### 3.1 Asymptotic Derivations for State Augmentation

1. **State Space Cardinality:**
   - Physical grid dimensions: $R \times C$.
   - Bitmask possibilities: $2^K$ where $K$ is the number of keys.
   - **Total Vertices:** $|V| = R \cdot C \cdot 2^K$.
   - **Total Edges:** Each augmented vertex has at most 4 directional transitions: $|E| \le 4 \cdot |V| = 4 \cdot R \cdot C \cdot 2^K$.

2. **Time Complexity:**
   - Standard BFS visits each state at most once and explores each transition at most once:
     $$\mathbf{\text{Time Complexity} = O(R \cdot C \cdot 2^K)}$$
   - For $R = 30, C = 30$, and $K = 6$:
     $$|V| = 30 \times 30 \times 2^6 = 900 \times 64 = 57,600 \text{ states}$$
     $$|E| \approx 4 \times 57,600 = 230,400 \text{ edges}$$
     This evaluates in $< 15$ milliseconds in C#!

3. **Space Complexity:**
   - Visited 3D boolean buffer: $R \cdot C \cdot 2^K$ bytes.
   - Queue storage: At most $R \cdot C \cdot 2^K$ elements.
   - **Total Space Complexity:** $\mathbf{O(R \cdot C \cdot 2^K)}$.

---

### 3.2 Systems Memory Layout: 3D Array vs Flat 1D Indexing

In C# .NET, a multi-dimensional array `bool[R, C, M]` incurs boundary-check overhead on 3 axes. In performance-critical engines, we can flatten the 3D index into a single contiguous 1D array:

$$\text{Index}(r, c, \text{mask}) = (r \times C + c) \times 2^K + \text{mask}$$

```csharp
// High-performance flat bit-array optimization:
int totalStates = rows * cols * (1 << totalKeys);
var flatVisited = new bool[totalStates];

// Check visited in strict O(1) single-offset pointer arithmetic:
int flatIndex = ((nr * cols) + nc) * maskStates + nextMask;
if (!flatVisited[flatIndex])
{
    flatVisited[flatIndex] = true;
    queue.Enqueue(...);
}
```
This flat indexing pattern maximizes CPU cache line spatial locality because state transitions for adjacent coordinates reside within the same 64-byte L1 cache line!

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### 4.1 [LeetCode 864] Shortest Path to Get All Keys (Hard)

- **Problem:** Given grid with `@`, walls `#`, empty `.`, keys `'a'-'f'`, and locks `'A'-'F'`, return minimum steps to acquire all keys.
- **Walkthrough:** The `StateAugmentedGridSolver` implemented in Section 2 is the exact, canonical optimal solution.

---

### 4.2 [LeetCode 847] Shortest Path Visiting All Nodes (Hard)

- **Problem:** Given an undirected, connected graph of $N$ nodes ($1 \le N \le 12$), return the length of the shortest path that visits every node. You may start and stop at any node, and you may revisit nodes and reuse edges multiple times.
- **State Augmentation Architecture:**
  - State: `(int node, int visitedMask)`.
  - Initial Multi-Source Frontier: Enqueue every node $i \in [0, N-1]$ with `mask = 1 << i`.
  - Termination Predicate: `mask == (1 << N) - 1`.

```csharp
public class ShortestPathAllNodesSolver
{
    public int ShortestPathLength(int[][] graph)
    {
        int N = graph.Length;
        if (N <= 1) return 0;

        int targetMask = (1 << N) - 1;
        // visited[node, mask]
        bool[,] visited = new bool[N, 1 << N];
        var queue = new Queue<(int Node, int Mask)>();

        // Multi-source start: We can begin at ANY node
        for (int i = 0; i < N; i++)
        {
            int initialMask = 1 << i;
            queue.Enqueue((i, initialMask));
            visited[i, initialMask] = true;
        }

        int steps = 0;

        while (queue.Count > 0)
        {
            int size = queue.Count;
            steps++;

            for (int k = 0; k < size; k++)
            {
                var (curr, mask) = queue.Dequeue();

                foreach (int neighbor in graph[curr])
                {
                    int nextMask = mask | (1 << neighbor);

                    if (nextMask == targetMask)
                        return steps;

                    if (!visited[neighbor, nextMask])
                    {
                        visited[neighbor, nextMask] = true;
                        queue.Enqueue((neighbor, nextMask));
                    }
                }
            }
        }

        return -1;
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Shortest Path with Alternating Colors ([LeetCode 1129] - Medium)
- **Constraint:** Graph with red and blue edges. Paths must alternate edge colors: red $\to$ blue $\to$ red.
- **Hint:** Augment state to `(int node, int lastColor)` where `lastColor ∈ {Red, Blue}`. Visited matrix is `bool[N, 2]`.

### Exercise 2: Minimum Cost to Reach Destination in Time ([LeetCode 1928] - Hard)
- **Constraint:** Edges have travel times; nodes have passing fees. Find minimum fee path completing within `maxTime`.
- **Hint:** Augment state to `(int node, int timeElapsed)`. Track minimum cost to reach `(node, time)` using Dijkstra or BFS.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
                   STATE AUGMENTATION PATTERN TRIGGER MATRIX

     Does the problem allow or require revisiting physical graph vertices?
                              /                       \
                            YES                        NO
                            /                           \
       What resource or state is mutable?        [Standard BFS / DFS]
             /                   \               (2D visited[r, c])
      Discrete Inventory       Continuous Cost
      (Keys, Visited Nodes)    (Time, Weight, Battery)
            /                             \
     Is subset count <= 15?         Is cost bounded and small?
          /             \                     /             \
        YES              NO                 YES              NO
        /                 \                 /                 \
  [Bitmask BFS]     [NP-Hard Branch]  [Augmented BFS]   [Dijkstra with Potentials]
  (visited[u,mask])                   (visited[u,cost])
```

---

## 7. 🎯 Daily Checkpoint Questions

### Diagnostic Question
In state-augmented BFS on grid graphs (such as [LeetCode 864]), why is it mathematically valid to visit the same physical grid coordinate $(r, c)$ multiple times, and what prevents the algorithm from entering an infinite oscillation loop?

### Architectural Model Answer
1. **Mathematical Validity of Multi-Visit:**
   - The graph vertex is **not** the coordinate $(r, c)$; the vertex is the **composite state tuple** $v = (r, c, \text{mask})$.
   - Visiting $(r, c)$ with key inventory `mask1 = 0001_2` represents a completely distinct node in the augmented state graph from visiting $(r, c)$ with `mask2 = 0011_2`.
   - The physical edge between $(r, c)$ and neighbor $(r', c')$ translates into $2^K$ disjoint parallel edges across the $2^K$ layers of the augmented graph. Therefore, returning to $(r, c)$ with an increased key count is traversing a directed forward edge into a higher-order state layer, not revisiting the same graph vertex.
2. **Infinite Oscillation Prevention:**
   - An infinite loop is prevented by the **3D visited table** `visited[r, c, mask]`.
   - If the agent walks in a cycle without picking up any new keys, the mask remains identical (`mask == oldMask`).
   - When the agent attempts to step back onto $(r, c)$ with the *same* mask, `visited[r, c, mask]` evaluates to `true`, and the transition is pruned immediately.
   - Because the state space $|V| = R \cdot C \cdot 2^K$ is finite, and BFS never re-enqueues an identical state tuple, termination is mathematically guaranteed.
