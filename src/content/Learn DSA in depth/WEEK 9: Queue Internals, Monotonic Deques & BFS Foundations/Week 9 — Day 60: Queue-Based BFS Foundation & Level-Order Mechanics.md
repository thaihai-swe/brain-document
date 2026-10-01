---
title: "Week 9 — Day 60: Queue-Based BFS Foundation & Level-Order Mechanics"
---

# Week 9 — Day 60: Queue-Based BFS Foundation & Level-Order Mechanics

Welcome to **Day 60 of your DSA Mastery Journey**!

In [Day 57](./Week%209%20%E2%80%94%20Day%2057:%20Queue%20Internals,%20Circular%20Buffers,%20From-Scratch%20Implementations%20%28Circular%20Array%20vs.%20Linked%20List%29%20&%20FIFO%20Mechanics.md), we constructed circular array queues and linked-node queues from scratch. In [Day 58](./Week%209%20%E2%80%94%20Day%2058:%20Deque%20Data%20Structure%20From%20Scratch,%20Monotonic%20Deque%20&%20The%20Sliding%20Window%20Maximum.md) and [Day 59](./Week%209%20%E2%80%94%20Day%2059:%20Constrained%20Subsequence%20Optimization%20&%20Shortest%20Subarrays.md), we explored Monotonic Deques for sliding window extrema and non-monotonic prefix sums.

Today, we connect the FIFO Queue to graph theory and spatial traversal: **Breadth-First Search (BFS)** and **Level-Order Wavefront Mechanics**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 60 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: BFS INVARIANTS      │                                     │     PART II: WAVE PATTERNS      │
│  Mathematical & Spatial Laws    │                                     │   Multi-Source & Level Snapshot │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Monotonic Distance Invariant  │                                     │ • levelSize Snapshot Pattern    │
│ • Inductive Correctness Proof   │                                     │ • Multi-Source Wavefronts       │
│ • Mark-on-Enqueue vs Dequeue    │                                     │ • In-Place Distance Propagation │
│ • Exponential Bloat Analysis    │                                     │ • Grid Flat-Index Encoding      │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **Breadth-First Search (BFS)** is a graph and tree traversal algorithm that explores vertices in concentric radial wavefronts in strictly non-decreasing order of distance from the source using a FIFO queue.
  - *Core Invariants:* Monotonic Distance Invariant: For all vertices in the queue, $\text{dist}(u) \le \text{dist}(v) \le \text{dist}(u) + 1$; Level Snapshot Invariant: Capturing `int levelSize = queue.Count` at the start of a round isolates depth tiers; Mark-on-Enqueue Law: A node must be marked as visited **immediately upon enqueueing**, not when dequeued.
  - *Misconception Check:* Marking nodes as visited upon dequeue instead of enqueue causes duplicate copies of the same node to be enqueued from multiple neighbors, triggering exponential memory blowup ($O(B^D)$) and TLE.
- **2. WHY:**
  - *Bottleneck Solved:* Guarantees finding the shortest path in unweighted graphs without exploring deeper suboptimal paths.
  - *Complexity Advantage:* Solves shortest path queries in strict $O(V + E)$ linear time where Dijkstra's algorithm would cost $O((V + E) \log V)$.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Binary Tree Level Order Traversal" (LC 102), "Shortest Path in Binary Matrix" (LC 1091), "Word Ladder" (LC 127), multi-source wavefront expansions (LC 542, 994). Signal words: "shortest path in unweighted graph", "level-order traversal", "minimum steps / transformations".
  - *When to Avoid / Failure Modes:* Weighted graphs with variable edge costs (requires Dijkstra's algorithm) or negative edge cycles (requires Bellman-Ford).
- **4. WHERE:**
  - *Physical CLR Memory:* FIFO queue on managed heap; 2D boolean array `bool[,]` for visited set; memory peak is proportional to the maximum breadth / cut of the graph.
  - *Production Systems:* Social network degree-of-separation discovery (LinkedIn connections), network packet broadcast routing, web crawler URL boundary frontiers.
- **5. WHO:**
  - *Spoken Script:* "BFS explores nodes in order of shortest distance using a FIFO queue. In level-order traversals, I capture `queue.Count` at the start of each level to process nodes in discrete depth tiers. I always mark nodes as visited immediately upon enqueue to prevent redundant queue inflation."
  - *Interviewer Evaluation Lens:* Verifies Mark-on-Enqueue discipline, level snapshot pattern (`levelSize = queue.Count`), multi-source initialization, and $O(V + E)$ derivation.
- **6. HOW:**
  - *Cost Model:* Time: $O(V + E)$ linear time; Space: $O(V)$ maximum queue breadth.
  - *State Transition Trace (Level Order):* `Queue=[root] -> levelSize=1 -> dequeue root, enqueue left & right -> Queue=[left, right] -> levelSize=2 -> ...`.


### 1.1 Physical Mental Model: Concentric Water Ripples & The VIP Waiting Stamp

Imagine dropping a pebble into a calm pond at night. The physical mechanics of wave propagation and line management perfectly embody Breadth-First Search (BFS):

```
       ======================================================================
         PHYSICAL ANALOGY: CONCENTRIC WATER RIPPLES & VIP ENTRY STAMP
       ======================================================================

                   Wave 2 (Radius = 2)
              . - ~ ~ - .
          . '      B      ' .           Level 0 (Pebble): Node S (Distance 0)
        /          |          \         Level 1 (Ring 1): Nodes A, B (Dist 1)
       /     A --- S           \        Level 2 (Ring 2): Nodes C, D, E (Dist 2)
      |     / \                 |
      |    C   D       E        |       A ripple cannot skip across space!
       \              /        /        It touches every shore at radius 1
        \            /        /         BEFORE any droplet at radius 2 can move.
          . ' - - - - - - - '
```

```
       ======================================================================
               FIFO QUEUE STATE: AT MOST TWO CONCURRENT RADIAL WAVES
       ======================================================================

       Deq Head <------------------------------------------------ Enq Tail
       +-----------------------+---------------------------------------+
       |   Wave d Points       |           Wave (d + 1) Points         |
       |   [ Node A, Node B ]  |     [ Node C, Node D, Node E ]        |
       +-----------------------+---------------------------------------+
        <- Currently popping -><- Freshly discovered neighbor ripples -
```

```
       ======================================================================
         THE "BOUNCER STAMP" LAW: MARK-ON-ENQUEUE VS MARK-ON-DEQUEUE
       ======================================================================

       [WRONG: Mark on Dequeue]               [CORRECT: Mark on Enqueue]
       Node A sees Neighbor X -> Enq X        Node A sees Neighbor X -> STAMP X -> Enq X
       Node B sees Neighbor X -> Enq X!       Node B sees Neighbor X -> Already Stamped! Skip!
       Node C sees Neighbor X -> Enq X!       
                                              Result: EXACTLY 1 copy of X enters queue.
       Queue flooded with duplicates:         Space bounded to O(V).
       O(B^D) memory explosion & TLE crash!
```

```
       ======================================================================
         MEMORY LAYOUT: BFS LEVEL-ORDER RUNTIME IN CLR HEAP
       ======================================================================

       Managed Stack Frame:
       [ levelSize: 2 ]  [ d: 1 ]
             |
             v
       Managed Heap (Queue<int> internal ring buffer):
       +-------+-------+-------+-------+-------+-------+-------+
       |   A   |   B   |   C   |   D   |   E   | (cap) | (cap) |
       +-------+-------+-------+-------+-------+-------+-------+
           ^               ^
           |               |
         Head             Tail
       
       Visited Lookup (bool[] on Heap):
       Index:   [0:S]   [1:A]   [2:B]   [3:C]   [4:D]   [5:E]
       Value:  [ true |  true |  true |  true |  true |  true ]
```

---

### 1.2 The Breadth-First Search (BFS) Invariant

Breadth-First Search (BFS) is a graph/tree traversal algorithm that systematically explores vertices in concentric circles outward from a source:

> [!IMPORTANT]
> ### 💡 The Monotonic Distance Queue Invariant
> At any point during a BFS traversal starting from source vertex $S$:
> 1. The vertices currently in the queue have distances from $S$ that are **monotonically non-decreasing**.
> 2. If the vertex at the head of the queue is at distance $d$, then every other vertex in the queue is at distance either $d$ or $d + 1$:
>    $$\text{queue} = [ \underbrace{v_a, v_b, \dots, v_k}_{\text{Distance } d}, \; \underbrace{u_a, u_b, \dots, u_m}_{\text{Distance } d + 1} ]$$
> 3. Consequently, **vertices are dequeued in strictly non-decreasing order of their shortest unweighted path distance from $S$**.

This invariant guarantees that the **first time** a vertex $v$ is dequeued (or enqueued), the path discovered to $v$ is **the absolute shortest path** in an unweighted graph!

---

### 1.2 The Layer-by-Layer Level-Order Snapshot Invariant

In many problems (e.g., binary tree level order traversal, day-by-day infection simulation, step-by-step maze escapes), we must group nodes by their exact level $d$.

To prevent children nodes (level $d+1$) from intermingling with current nodes (level $d$), we enforce the **Snapshot Invariant**:

```csharp
while (queue.Count > 0)
{
    // Snapshot the exact number of nodes belonging to the CURRENT tier
    int levelSize = queue.Count;

    for (int i = 0; i < levelSize; i++)
    {
        var node = queue.Dequeue();
        // Process node of level d...

        // Enqueue children (which belong to level d + 1)
        if (node.Left != null) queue.Enqueue(node.Left);
        if (node.Right != null) queue.Enqueue(node.Right);
    }

    // At this point, EXACTLY one full level has been completed!
}
```

```
Queue State at Start of Level d:
┌───────────────────────────────┐
│ Level d Nodes: [ A, B, C ]    │   ===> Snapshot: levelSize = 3
└───────────────────────────────┘

After processing A, B, C (children of A, B, C are enqueued):
┌───────────────────────────────┐
│ Level d + 1 Nodes: [ D, E, F ]│   ===> Ready for next level loop
└───────────────────────────────┘
```

---

### 1.3 The Mark-on-Enqueue vs. Mark-on-Dequeue Catastrophe

This is the **single most pervasive failure mode** in graph and grid BFS implementations.

```
┌───────────────────────────────────────────────┬───────────────────────────────────────────────┐
│         ✅ CORRECT: Mark-on-Enqueue           │          ❌ CATASTROPHIC: Mark-on-Dequeue     │
├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ Visited state marked the MICROSECOND a cell   │ Visited state marked only AFTER cell is       │
│ is pushed to the queue.                       │ popped from the queue.                        │
├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ Invariant: No node can EVER exist in the      │ Invariant: Nodes can be enqueued MULTIPLE     │
│ queue more than once.                         │ times by different neighbors!                 │
├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ Queue Size: Bounded by O(V) or O(M × N).      │ Queue Size: EXPONENTIAL BLOAT O(4^D)!         │
│ Memory: Linear O(V).                          │ Memory: OutOfMemoryException (OOM).           │
│ Time: Strict O(V + E).                        │ Time: Exponential timeout (TLE).              │
└───────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

#### Why Does Mark-on-Dequeue Explode?
Consider a 2D grid where each cell has 4 neighbors:
```
           [ (0,1) ]
               ▲
               │
[ (1,0) ] <─ [ (1,1) ] ─> [ (1,2) ]
               │
               ▼
           [ (2,1) ]
```
When `(1,1)` is dequeued, it pushes all 4 neighbors `(0,1)`, `(1,0)`, `(1,2)`, `(2,1)` into the queue.
- If we **do not mark them as visited immediately**, each of those 4 neighbors will look at their adjacent cells and re-enqueue `(1,1)` and each other!
- Cell `(2,2)` will be pushed by `(1,2)` AND by `(2,1)`!
- By layer $D$, the queue contains $O(4^D)$ redundant entries. In an $M \times N$ grid, what should take $100 \times 100 = 10,000$ operations instead blows up into $4^{50} \approx 10^{30}$ operations, crashing the runtime.

> [!CAUTION]
> **Cardinal Law of BFS:** ALWAYS mark a node or cell as `visited` at the exact moment you call `queue.Enqueue(...)`, never when you call `queue.Dequeue()`.

---

### 1.4 Single-Source vs. Multi-Source BFS

- **Single-Source BFS:** Starts with a single origin node in the queue at distance $0$. Traversal represents an expanding sphere around one point.
- **Multi-Source BFS:** Multiple distinct starting origins exist (e.g., all rotting oranges, all gates, all water sources).
  - **The Super-Source Paradigm:** Instead of running $K$ separate BFS traversals (which costs $O(K \cdot V)$), initialize the queue with **ALL** $K$ sources simultaneously at time $t = 0$!
  - This is mathematically equivalent to adding a virtual "super-source" connected to all actual sources with zero-weight edges.
  - The wavefront propagates outward simultaneously from all origins in **$O(V + E)$ total time**!

### 1.5 ⚙️ Core Operations Deep-Dive: Multi-Source Seeding & Enqueue-Time Marking Invariants

#### Dimension 1: Operation Contract & Big-O Bounds
- **Operation Signatures:**
  1. `int OrangesRotting(int[][] grid)`
  2. `int ShortestPathBinaryMatrix(int[][] grid)`
- **Preconditions:**
  - `grid` is an $M \times N$ matrix where $M, N \ge 1$.
  - Cells contain discrete domain states (e.g., $0=$ empty/passable, $1=$ obstacle/fresh, $2=$ infected/source).
- **Postconditions:**
  - `OrangesRotting` returns the minimum elapsed minutes until zero fresh targets remain, or `-1` if unreachable.
  - `ShortestPathBinaryMatrix` returns the length of the shortest 8-directional clear path from $(0,0)$ to $(M-1, N-1)$, or `-1`.
- **Complexity Bounds:**
  - **Time Complexity:**
    - $\Theta(M \cdot N)$ — each cell is enqueued at most once and visited at most once through constant degree directions ($\le 4$ or $\le 8$).
  - **Auxiliary Space Complexity:**
    - $O(M \cdot N)$ — FIFO queue storing active perimeter frontier coordinates.

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree
1. **Multi-Source Seeding & Target Census:**
   - Initialize `Queue<(int r, int c)> queue`.
   - Initialize `int freshCount = 0, minutes = 0`.
   - Scan entire grid $(r, c) \in [0, M-1] \times [0, N-1]$:
     - If `grid[r][c] == 2` (source): `queue.Enqueue((r, c))`.
     - If `grid[r][c] == 1` (target): `freshCount++`.
   - If `freshCount == 0`: Return `0` immediately.
2. **Synchronized Wavefront Expansion Loop (`while queue.Count > 0 && freshCount > 0`):**
   - *Phase 1 (Freeze Frontier):* `int levelSize = queue.Count`.
   - *Phase 2 (Drain Snapshot):*
     - For $i = 0$ to `levelSize - 1`:
       - `(int r, int c) = queue.Dequeue()`.
       - Explore cardinal neighbors `(nr, nc)` via $\Delta = [(-1,0), (1,0), (0,-1), (0,1)]$:
         - Boundary & State Gate:
           - Is $0 \le nr < M$ and $0 \le nc < N$?
           - Is `grid[nr][nc] == 1`?
         - If both YES:
           - **Mark Visited / Infected at ENQUEUE TIME:** `grid[nr][nc] = 2`.
           - Decrement remaining targets: `freshCount--`.
           - Enqueue new frontier: `queue.Enqueue((nr, nc))`.
   - *Phase 3 (Advance Clock):*
     - Increment `minutes++`.
3. **Termination Check:**
   - Return `freshCount == 0 ? minutes : -1`.

```
                    [Scan Grid at t = 0]
                             │
            Enqueue all '2's, count all '1's (freshCount)
                             │
                     freshCount == 0?
                    /                \
              (Yes)/                  \(No)
                  ▼                    ▼
              Return 0         [while queue > 0 && freshCount > 0]
                                       │
                               levelSize = queue.Count
                               for i = 0 to levelSize - 1:
                                 Dequeue (r, c)
                                 For each cardinal neighbor (nr, nc):
                                   if in_bounds && grid[nr][nc] == 1:
                                     grid[nr][nc] = 2 (MARK AT ENQUEUE!)
                                     freshCount--
                                     queue.Enqueue((nr, nc))
                               minutes++
                                       │
                         freshCount == 0 ? minutes : -1
```

#### Dimension 3: Visual ASCII State Transitions
```
3x3 GRID WITH 2 ROTTEN ORANGES:
Initial (t=0):
[ 2, 1, 1 ]   Queue: [ (0,0), (0,2) ] (Size=2)
[ 1, 1, 0 ]   FreshCount = 5
[ 0, 1, 2 ]

t=1: levelSize=2
- Process (0,0): Infect (0,1), (1,0). FreshCount: 5 -> 3
- Process (0,2): (0,1) already infected! Infect none.
Queue: [ (0,1), (1,0) ]
Minutes = 1

t=2: levelSize=2
- Process (0,1): Infect (1,1). FreshCount: 3 -> 2
- Process (1,0): none.
Queue: [ (1,1) ]
Minutes = 2

t=3: levelSize=1
- Process (1,1): Infect (2,1). FreshCount: 2 -> 1
Queue: [ (2,1) ]
Minutes = 3

t=4: (2,1) infects (2,2) neighbor (already 2). FreshCount reaches 0.
Final Minutes = 4.
```

#### Dimension 4: Invariant Preservation Proof
- **Enqueue-Time Marking Invariant (Anti-Duplication Lemma):**
  - Suppose a vertex $v$ is marked visited upon `Dequeue()` rather than `Enqueue()`.
  - Let $v$ have $k$ in-neighbors at level $d$. Each neighbor observes $v$ as unvisited and enqueues $v$.
  - Consequently, $v$ appears $k$ times in the queue at level $d+1$, leading to redundant subtree expansions of size $O(\Delta^D)$.
  - In contrast, by mutating `grid[nr][nc] = 2` at the exact moment $(nr, nc)$ is enqueued, all other neighbors at level $d$ observe $(nr, nc)$ as already visited.
  - Thus, every reachable cell is enqueued exactly once, bounding total queue operations to $\le M \cdot N$.
- **Super-Source Equivalence Proof:**
  - Let $S = \{ s_1, s_2, \dots, s_k \}$ be the set of initial sources.
  - Introducing a virtual super-source $s^*$ with directed edges $(s^*, s_i)$ of weight 0 transforms the multi-source problem into single-source BFS from $s^*$.
  - Enqueueing all $s_i \in S$ at $t = 0$ is mathematically identical to dequeuing $s^*$ at $t = -1$ and expanding all its distance-0 neighbors.
  - By the Bellman-Ford/Dijkstra shortest-path optimality condition on unit-weight graphs, the first time any cell is reached via the synchronized wavefront represents its global shortest distance to *any* source in $S$.

#### Dimension 5: Edge Case Matrix
| Edge Case Scenario | Input State | Algorithmic Behavior | Invariant Preservation |
| :--- | :--- | :--- | :--- |
| **No Fresh Oranges** | Grid contains only 0s and 2s | `freshCount == 0` triggers immediate return before loop; returns 0. | Time elapsed is 0 minutes. |
| **No Rotten Oranges** | Grid contains only 1s | Queue is empty initially; loop never runs; returns -1. | Unreachable targets cleanly detected. |
| **Isolated Target** | A fresh orange surrounded by 0s | Wavefront terminates when queue empties; `freshCount > 0` returns -1. | Accurately reports impossible convergence. |
| **1x1 Grid** | Single cell `[2]` or `[0]` | Loop condition fails immediately; returns 0. | Trivial single-cell handling. |
| **Instant Multi-Source Collision** | Two sources adjacent to same target | First source infects and marks; second source sees target as already visited. | Zero redundant visits or double-counting. |

---

## 2. 💻 DEMONSTRATE: Canonical Invariant Visualization & Algorithmic Mechanics

### 2.1 Multi-Source Wavefront Propagation Trace

Consider an $M \times N$ grid with two infection sources $S_1$ and $S_2$:

```
Initial (t = 0):
┌───┬───┬───┬───┬───┐
│ S1│ . │ . │ . │ S2│      Queue at t = 0: [ S1, S2 ]
├───┼───┼───┼───┼───┤      Visited: { S1, S2 }
│ . │ . │ . │ . │ . │
├───┼───┼───┼───┼───┤
│ . │ . │ . │ . │ . │
└───┴───┴───┴───┴───┘

Wavefront t = 1 (levelSize = 2 processed):
┌───┬───┬───┬───┬───┐
│ S1│ 1 │ . │ 1 │ S2│      Queue at t = 1: [ (0,1), (1,0), (0,3), (1,4) ]
├───┼───┼───┼───┼───┤
│ 1 │ . │ . │ . │ 1 │
├───┼───┼───┼───┼───┤
│ . │ . │ . │ . │ . │
└───┴───┴───┴───┴───┘

Wavefront t = 2 (levelSize = 4 processed):
┌───┬───┬───┬───┬───┐
│ S1│ 1 │ 2 │ 1 │ S2│      Notice how wavefronts from S1 and S2 collide
├───┼───┼───┼───┼───┤      gracefully at cell (0,2) and (1,2) without
│ 1 │ 2 │ . │ 2 │ 1 │      redundant re-computation!
├───┼───┼───┼───┼───┤
│ 2 │ . │ . │ . │ 2 │
└───┴───┴───┴───┴───┘
```

---

## 3. 🔬 COMPLEXITY & MATHEMATICAL INVARIANTS

### 3.1 Theorem: Correctness of BFS Shortest Paths

> [!TIP]
> ### 🧮 Mathematical Proof by Induction on Distance $d$
>
> **Statement:** Let $\delta(S, v)$ denote the shortest unweighted path distance from source $S$ to vertex $v$.
> For all vertices $v$, BFS finalizes vertex $v$ with calculated distance $d[v] = \delta(S, v)$, and dequeues vertices in non-decreasing order of $\delta(S, v)$.
>
> **Base Case ($d = 0$):**
> Source $S$ is enqueued with $d[S] = 0 = \delta(S, S)$. Clearly true.
>
> **Inductive Step:**
> Assume that all vertices with shortest path $\delta(S, u) \le k$ are dequeued in non-decreasing order and assigned correct distances.
>
> Let $v$ be a vertex with $\delta(S, v) = k + 1$.
> There exists some neighbor $u$ of $v$ such that $\delta(S, u) = k$ and edge $(u, v) \in E$.
> 1. By the inductive hypothesis, $u$ is dequeued before any vertex at distance $> k$.
> 2. When $u$ is processed, edge $(u, v)$ is relaxed: $v$ is discovered and enqueued with distance $d[v] = d[u] + 1 = k + 1$.
> 3. Could $v$ have been discovered earlier at distance $\le k$? No, because that would contradict $\delta(S, v) = k + 1$.
> 4. Could $v$ be discovered later with distance $> k + 1$? No, because $u$ already enqueued $v$ at distance $k + 1$, and since $v$ is marked visited on enqueue, no later path can re-assign $d[v]$.
>
> Hence, $d[v] = k + 1 = \delta(S, v)$, and $v$ is placed behind all distance-$k$ nodes in the FIFO queue, preserving monotonic non-decreasing order. $\blacksquare$

---

### 3.2 Complexity Invariants
- **Graph BFS:** Time is $\Theta(|V| + |E|)$. Every vertex is enqueued at most once ($O(V)$), and every incident edge is examined at most twice in undirected graphs or once in directed graphs ($O(E)$). Space is $O(|V|)$ for the queue and visited array.
- **Grid BFS ($M \times N$):** Each cell has at most 4 edges $\implies |V| = M \cdot N, |E| \le 4 \cdot M \cdot N$. Time is $\Theta(M \cdot N)$. Space is $O(M \cdot N)$ in worst-case diagonal wavefront expansion.

---

## 4. 🛠️ PRACTICE: Canonical Big Tech Problem Walkthroughs

---

### 4.1 Problem 1: [LeetCode 102] Binary Tree Level Order Traversal (Medium)

> **Problem Description:**
> Given the `root` of a binary tree, return *the level order traversal of its nodes' values* (i.e., from left to right, level by level).
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[0, 2000]$.
> - $-1000 \le \text{Node.val} \le 1000$

#### 1. Invariant Application
Use the `levelSize = queue.Count` snapshot pattern. Every iteration of the outer `while` loop processes all nodes belonging to the current depth level and collects their children into the queue for the next level.

#### 2. Production C# Implementation

```csharp
using System;
using System.Collections.Generic;

public class TreeNode
{
    public int val;
    public TreeNode? left;
    public TreeNode? right;
    public TreeNode(int val = 0, TreeNode? left = null, TreeNode? right = null)
    {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

public class Solution
{
    public IList<IList<int>> LevelOrder(TreeNode? root)
    {
        var result = new List<IList<int>>();
        if (root == null) return result;

        var queue = new Queue<TreeNode>();
        queue.Enqueue(root);

        while (queue.Count > 0)
        {
            // Snapshot the exact count of nodes at the current level
            int levelSize = queue.Count;
            var currentLevel = new List<int>(levelSize);

            for (int i = 0; i < levelSize; i++)
            {
                TreeNode node = queue.Dequeue();
                currentLevel.Add(node.val);

                // Enqueue left and right children for the next tier
                if (node.left != null) queue.Enqueue(node.left);
                if (node.right != null) queue.Enqueue(node.right);
            }

            result.Add(currentLevel);
        }

        return result;
    }
}
```

#### 3. Complexity
- **Time Complexity:** $O(N)$ where $N$ is the number of nodes. Each node is enqueued and dequeued exactly once.
- **Space Complexity:** $O(W)$ where $W$ is the maximum width of the tree. For a full binary tree, $W \approx N / 2 \implies O(N)$.

---

### 4.2 Problem 2: [LeetCode 994] Rotting Oranges (Medium)

> **Problem Description:**
> You are given an $m \times n$ `grid` where each cell can have one of three values:
> - `0` representing an empty cell,
> - `1` representing a fresh orange, or
> - `2` representing a rotten orange.
>
> Every minute, any fresh orange that is **4-directionally adjacent** to a rotten orange becomes rotten.
> Return *the minimum number of minutes that must elapse until no cell has a fresh orange*. If this is impossible, return `-1`.
>
> **Constraints:**
> - $m == \text{grid.Length}$, $n == \text{grid}[i].\text{Length}$
> - $1 \le m, n \le 10$
> - $\text{grid}[i][j]$ is `0`, `1`, or `2`.

#### 1. Multi-Source BFS Strategy
1. **Initial Pass:** Traverse the grid. Count total `freshOranges`. Enqueue all initial rotten oranges (`grid[r][c] == 2`) into the queue at $t = 0$.
2. **Edge Case:** If `freshOranges == 0`, return `0` immediately.
3. **Wavefront Propagation:** Execute level-order traversal. Each level represents $1$ minute.
4. **Mark-on-Enqueue:** As soon as an adjacent fresh orange is infected, mutate `grid[nr][nc] = 2`, decrement `freshOranges`, and enqueue it.
5. **Termination:** If `freshOranges == 0`, return elapsed minutes; otherwise return `-1`.

#### 2. Production C# Implementation

```csharp
public class Solution
{
    private static readonly int[] RowOffsets = { -1, 1, 0, 0 };
    private static readonly int[] ColOffsets = { 0, 0, -1, 1 };

    public int OrangesRotting(int[][] grid)
    {
        if (grid == null || grid.Length == 0) return 0;

        int rows = grid.Length;
        int cols = grid[0].Length;

        // Use flat integer encoding: index = r * cols + c to avoid tuple/class allocations
        var queue = new Queue<int>();
        int freshCount = 0;

        // Step 1: Scan grid, identify all sources (multi-source init) and count fresh targets
        for (int r = 0; r < rows; r++)
        {
            for (int c = 0; c < cols; c++)
            {
                if (grid[r][c] == 2)
                {
                    queue.Enqueue(r * cols + c);
                }
                else if (grid[r][c] == 1)
                {
                    freshCount++;
                }
            }
        }

        // If no fresh oranges exist initially, 0 minutes required
        if (freshCount == 0) return 0;

        int minutesElapsed = 0;

        // Step 2: Multi-source level-order BFS wavefront propagation
        while (queue.Count > 0 && freshCount > 0)
        {
            int levelSize = queue.Count;

            for (int i = 0; i < levelSize; i++)
            {
                int encoded = queue.Dequeue();
                int r = encoded / cols;
                int c = encoded % cols;

                for (int d = 0; d < 4; d++)
                {
                    int nr = r + RowOffsets[d];
                    int nc = c + ColOffsets[d];

                    // Boundary check and fresh orange check
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1)
                    {
                        // CRITICAL: Mark as rotten (visited) ON ENQUEUE!
                        grid[nr][nc] = 2;
                        freshCount--;
                        queue.Enqueue(nr * cols + nc);
                    }
                }
            }

            minutesElapsed++;
        }

        // If fresh oranges still remain, they were unreachable
        return freshCount == 0 ? minutesElapsed : -1;
    }
}
```

#### 3. Complexity
- **Time Complexity:** $O(M \cdot N)$. Every cell is visited and processed at most once.
- **Space Complexity:** $O(M \cdot N)$ for the BFS queue.

---

### 4.3 Problem 3: [LeetCode 286] Walls and Gates (Medium)

> **Problem Description:**
> You are given an $m \times n$ grid `rooms` initialized with three possible values:
> - `-1`: A wall or an obstacle.
> - `0`: A gate.
> - `INF` ($2147483647$): An empty room.
>
> Fill each empty room with the distance to its **nearest gate**. If it is impossible to reach a gate, it should be filled with `INF`.
>
> **Constraints:**
> - $m == \text{rooms.Length}$, $n == \text{rooms}[i].\text{Length}$
> - $1 \le m, n \le 250$
> - $\text{rooms}[i][j]$ is `-1`, `0`, or $2^{31} - 1$.

#### 1. Why Single-Source Fails vs. Why Multi-Source Excels
- **Single-Source from each empty room:** Initiating a search from every room takes $O((M \cdot N) \times (M \cdot N)) = O((M \cdot N)^2) \approx (250^2)^2 \approx 3.9 \times 10^9$ operations $\implies$ **TLE**.
- **Multi-Source from all gates simultaneously:** Enqueue all `0` cells (gates) into the queue. Advance outward step by step. When reaching an empty room with `rooms[nr][nc] == INF`, set `rooms[nr][nc] = rooms[r][c] + 1` and enqueue it!
- Because BFS guarantees shortest paths, the first gate whose wavefront reaches an empty room is guaranteed to be its nearest gate!
- Total time drops to **$O(M \cdot N)$**!

#### 2. Production C# Implementation

```csharp
public class Solution
{
    private const int EmptyRoom = 2147483647;
    private static readonly int[] DRow = { -1, 1, 0, 0 };
    private static readonly int[] DCol = { 0, 0, -1, 1 };

    public void WallsAndGates(int[][] rooms)
    {
        if (rooms == null || rooms.Length == 0) return;

        int m = rooms.Length;
        int n = rooms[0].Length;

        // Flat array queue of packed integers: (r * n + c)
        var queue = new Queue<int>();

        // Step 1: Enqueue all gates (distance 0 origins)
        for (int r = 0; r < m; r++)
        {
            for (int c = 0; c < n; c++)
            {
                if (rooms[r][c] == 0)
                {
                    queue.Enqueue(r * n + c);
                }
            }
        }

        // Step 2: Multi-source wavefront expansion
        while (queue.Count > 0)
        {
            int encoded = queue.Dequeue();
            int r = encoded / n;
            int c = encoded % n;
            int currentDist = rooms[r][c];

            for (int i = 0; i < 4; i++)
            {
                int nr = r + DRow[i];
                int nc = c + DCol[i];

                // If neighbor is within bounds and is an unvisited empty room
                if (nr >= 0 && nr < m && nc >= 0 && nc < n && rooms[nr][nc] == EmptyRoom)
                {
                    // Update distance directly in grid (acts as visited marker!)
                    rooms[nr][nc] = currentDist + 1;
                    queue.Enqueue(nr * n + nc);
                }
            }
        }
    }
}
```

#### 3. Complexity
- **Time Complexity:** $O(M \cdot N)$. Every room is visited at most once.
- **Space Complexity:** $O(M \cdot N)$ maximum queue footprint.

---

## 5. ⚡ HARDWARE & SYSTEMS CONNECTIONS

### 5.1 Memory Optimization: Flat Index Encoding vs. Heap Tuples

In .NET grid traversals, storing coordinates as objects or reference types in a queue creates massive GC pressure:
```csharp
// ❌ BAD: Generates M * N heap-allocated objects for GC Gen 0 to clean up
Queue<Tuple<int, int>> queue = new Queue<Tuple<int, int>>();

// ⚠️ ACCEPTABLE: ValueTuple struct avoids heap allocation but copies 8 bytes per enqueue/dequeue
Queue<(int r, int c)> queue = new Queue<(int r, int c)>();

// ✅ HIGH-PERFORMANCE: Flat 32-bit Integer Packing (0 heap allocs, 4 bytes per item)
Queue<int> queue = new Queue<int>();
int encoded = r * cols + c;
int r = encoded / cols;
int c = encoded % cols;
```

On 64-bit hardware, using `int` reduces queue memory footprint by **50%** compared to `(int, int)` structs and **75%** compared to `Tuple<int, int>` objects, fitting up to $2\times$ more frontier states into the CPU L3 cache.

### 5.2 Systems Applications of BFS
1. **Network Packet Flooding:** Routing protocols (like OSPF's Link-State Advertising) flood link-state packets across peer routers using multi-source BFS wavefront rules.
2. **Web Crawlers (Googlebot):** Frontier URLs are prioritized and explored level-by-level to ensure authoritative top-level pages are indexed before deep leaf nodes.
3. **Garbage Collection (Tracing Collectors):** The CLR GC uses BFS/DFS graph reachability starting from "GC Roots" (stack frames, static variables) to discover all live objects in the managed heap.

---

## 6. ⚠️ DAILY ERROR LOG & COMMON TRAPS

### Trap 1: Marking Visited on Dequeue Instead of Enqueue
- **The Bug:** Marking `visited[r, c] = true` inside the loop right after `queue.Dequeue()`.
- **The Catastrophe:** Multiple neighboring cells discover `(r, c)` before it is dequeued, pushing duplicate instances into the queue. On large grids, this leads to $O(4^D)$ memory explosion and immediate `OutOfMemoryException`.
- **The Fix:** **Always mark visited immediately prior to or upon `queue.Enqueue(...)`!**

### Trap 2: Modifying Queue Without Snapshotting `levelSize`
- **The Bug:** Writing `for (int i = 0; i < queue.Count; i++)` directly in the level loop.
- **The Failure:** Because new children are enqueued inside the loop, `queue.Count` grows dynamically, turning the loop into an infinite or corrupted traversal that fails to segment discrete levels.
- **The Fix:** Capture `int levelSize = queue.Count;` in a local variable before starting the inner loop.

### Trap 3: Boundary Guard Order in Array Indexing
- **The Bug:** Writing `if (grid[nr][nc] == 1 && nr >= 0 && nr < rows)`.
- **The Failure:** In C#, short-circuit boolean evaluation evaluates left-to-right. Evaluating `grid[nr][nc]` when `nr = -1` triggers an unhandled `IndexOutOfRangeException`!
- **The Fix:** Always check array bounds **before** dereferencing the array: `if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == ...)`.

### Trap 4: Spurious Increment on the Final BFS Level
- **The Bug:** Incrementing `minutes++` at the end of every `while (queue.Count > 0)` loop iteration in LeetCode 994.
- **The Failure:** The final wave enqueues 0 new fresh oranges, but `minutes++` still executes, giving an answer that is off-by-one (+1).
- **The Fix:** Add condition `while (queue.Count > 0 && freshCount > 0)` or only increment `minutes++` when at least one new cell was infected during the tier.

---

## 7. 🎯 DAILY CHECKPOINT & SELF-ASSESSMENT

### 1. Conceptual Verification
1. Why does Breadth-First Search guarantee finding the shortest path in an unweighted graph, whereas Depth-First Search (DFS) does not?
2. In a grid of size $M \times N$, what is the exact maximum number of elements that can be stored in the BFS queue simultaneously?
3. Contrast Multi-Source BFS with running $K$ individual Single-Source BFS searches. What is the time complexity difference?

### 2. Implementation Audit
- Look at your implementation of `OrangesRotting`. Did you mark `grid[nr][nc] = 2` **before** or **after** calling `queue.Enqueue(nr * cols + nc)`? Explain the difference in queue memory consumption.

---
*Next Module: **Week 9 — Day 61: Priority Queue vs. Monotonic Queue vs. Monotonic Stack (LeetCode 218, 407)***
