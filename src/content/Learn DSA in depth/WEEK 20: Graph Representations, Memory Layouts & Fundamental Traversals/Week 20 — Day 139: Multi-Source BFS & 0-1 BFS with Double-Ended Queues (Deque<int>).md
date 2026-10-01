---
title: "Week 20 — Day 139: Multi-Source BFS & 0-1 BFS with Double-Ended Queues (Deque<int>)"
---

# Week 20 — Day 139: Multi-Source BFS & 0-1 BFS with Double-Ended Queues (Deque<int>)

Welcome to **Day 139 of your DSA Mastery Journey**!

Yesterday, on Day 138, you proved that **Breadth-First Search (BFS)** is the mathematically optimal shortest-path engine on unweighted graphs, running in strictly linear $\Theta(V + E)$ time.

However, real-world networks frequently present two architectural challenges that break standard single-source BFS:
1. **Multiple Simultaneous Origins (Multi-Source Wavefronts):** When tracking how a virus spreads across a population, how fire propagates through a forest, or which hospital is closest to every household in a city, the search does not start from a single source—it originates from dozens or thousands of points simultaneously.
2. **Binary Edge Weights ($w \in \{0, 1\}$):** In grid navigation, changing direction or paying a toll costs 1 unit, while continuing straight along a belt or pipe costs 0 units. Running Dijkstra’s algorithm on this graph incurs an $O((V + E) \log V)$ priority queue overhead.

Today, you will master two advanced BFS paradigms:
- **Multi-Source BFS**: Collapsing multi-origin propagation into a single linear-time wavefront using the **Super-Source Abstraction**.
- **0-1 BFS**: Using a **Double-Ended Queue (Deque)** to achieve Dijkstra-level shortest path accuracy in strictly **$\Theta(V + E)$ linear time**, completely bypassing the $\log V$ heap bottleneck!

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             DAY 139: MULTI-SOURCE BFS & 0-1 BFS TOPOLOGY                         │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│        MULTI-SOURCE BFS           │                             │              0-1 BFS              │
│     (The Super-Source Model)      │                             │     (Double-Ended Queue Deque)    │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Multiple sources S1, S2, S3.    │                             │ • Edge weights in {0, 1}.         │
│ • Equivalent to imaginary root S* │ ── Algorithmic Evolution ──►│ • Weight 0 Edge: PUSH FRONT!      │
│   connecting to all Si with w = 0!│                             │   (Same distance layer d).        │
│ • Queue initialized with ALL      │                             │ • Weight 1 Edge: PUSH BACK!       │
│   sources simultaneously at d = 0!│                             │   (Next distance layer d + 1).    │
│ • Wavefronts expand in parallel.  │                             │ • Deque remains strictly sorted:  │
│ • Time: O(V + E) single pass!     │                             │   strictly O(V + E) vs O(E log V)!│
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CANONICAL PROBLEM MASTERY           │
                          ├─────────────────────────────────────────────┤
                          │ • [LC 994] Rotting Oranges (Multi-Source).  │
                          │ • [LC 1368] Min Cost Valid Path (0-1 BFS).  │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🚑 The Visual Mental Model: Forest Fires & Highway Toll Slips

Before writing algorithmic code, let us build clear physical intuitions for both Multi-Source BFS and 0-1 BFS:

#### 1. Multi-Source BFS: The Simultaneous Forest Fires
Imagine 3 separate lightning strikes ignite fires at different locations in a dry forest at the exact same minute:

```
            🔥 MULTI-SOURCE BFS: SIMULTANEOUS EXPANDING FRONTIERS

   Instead of running 3 separate slow simulations, we drop ALL fire origins
   into our queue at Time T = 0:

   Hour 0:        [Fire 1]                       [Fire 2]
                     │                              │
   Hour 1:     ┌─────┴─────┐                  ┌─────┴─────┐
               ▼           ▼                  ▼           ▼
             ( A )       ( B )              ( C )       ( D )
                 \       /                      \       /
   Hour 2:        ▼     ▼                        ▼     ▼
               [ Collision! ]                 [ Burned ]

   Every tree in the forest is touched at the earliest hour possible by WHICHEVER
   fire was closest to it. One single BFS pass solves the entire landscape!
```

#### 2. 0-1 BFS: The Free Express Lane vs Toll Booth
Imagine driving through a city where most roads have a $1 toll, but certain express slips are completely FREE ($0 toll):

```
            🚗 0-1 BFS: THE DOUBLE-ENDED QUEUE (DEQUE) ELEVATOR

   When you traverse an edge (u -> v):
   
   • Case A: Cost is 0 (FREE EXPRESS SLIP)
     You arrive at v at the EXACT SAME TIME as u! You haven't aged a single step!
     ===> Push v to the FRONT of the queue so it is processed IMMEDIATELY!
     
   • Case B: Cost is 1 (STANDARD TOLL ROAD)
     You arrive at v at Time + 1!
     ===> Push v to the BACK of the queue with the next time batch!

                    0-Cost Edge (Push Front)       1-Cost Edge (Push Back)
                                │                              │
                                ▼                              ▼
   Deque Head: ┌──────────┬──────────┬──────────┬──────────┬──────────┐ : Deque Tail
               │ dist = d │ dist = d │dist = d+1│dist = d+1│dist = d+1│
               └──────────┴──────────┴──────────┴──────────┴──────────┘
```

---

### 1.2 🖼️ Visual Gallery: The Virtual Super-Source & Deque Monotonicity

#### The Mathematical Equivalence of the Virtual Super-Source ($S^*$)
How does Multi-Source BFS prove its correctness mathematically? By visualizing an invisible "master source" node:

```
                  THE VIRTUAL SUPER-SOURCE EQUIVALENCE

           ┌───────────────────────────────────────────────┐
           │        Virtual Super-Source Node (S*)         │
           └───────────────────────────────────────────────┘
                     /               │               \
         weight = 0 /     weight = 0 │     weight = 0 \
                   ▼                 ▼                 ▼
             [ Source 1 ]      [ Source 2 ]      [ Source 3 ]
                 (0)               (0)               (0)
                  │                 │                 │
                  ▼                 ▼                 ▼
                (Node A)          (Node B)          (Node C)

   Running Multi-Source BFS is 100% IDENTICAL to running standard BFS
   from a single virtual super-source S* that connects to all real sources
   via zero-cost instantaneous edges!
```

---

### 1.3 🏛️ Memory Layout: Circular Ring Buffer Deque Architecture

To achieve $O(1)$ operations at both ends without GC pressure, we use an unmanaged power-of-two circular ring buffer:

```
   Circular Array Buffer (Capacity = 8, Mask = 7):
   
   Index:     [ 0 ]    [ 1 ]    [ 2 ]    [ 3 ]    [ 4 ]    [ 5 ]    [ 6 ]    [ 7 ]
   Value:    [ C ]    [ D ]    [ . ]    [ . ]    [ . ]    [ . ]    [ A ]    [ B ]
                        ▲                                            ▲
                        │                                            │
                     _tail = 2                                    _head = 6
   
   • PopFront(): Reads from _head (6), advances: _head = (6 + 1) & 7 = 7.
   • PushFront(X): Decrements: _head = (6 - 1) & 7 = 5, writes buffer[5] = X.
   • PushBack(Y): Writes buffer[2] = Y, advances: _tail = (2 + 1) & 7 = 3.
   
   Result: Zero allocations, zero pointer dereferences, 100% L1 cache locality!
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Multi-Source BFS:* A technique where a set of $K$ starting vertices $S = \{s_1, s_2, \dots, s_k\}$ are all enqueued simultaneously into the BFS queue at distance $0$. The queue expands all frontiers concurrently, computing the shortest distance from *any* source in $S$ to every reachable vertex in $V$.
  - *0-1 BFS:* A shortest-path algorithm for graphs whose edge weights are restricted exclusively to $\{0, 1\}$. Instead of a FIFO queue, it utilizes a **Double-Ended Queue (Deque)**:
    - If edge $(u, v)$ has weight $0$: Enqueue $v$ to the **FRONT** of the deque.
    - If edge $(u, v)$ has weight $1$: Enqueue $v$ to the **BACK** of the deque.
  - *Core Invariants:*
    1. **Super-Source Equivalence Invariant:** Multi-Source BFS from $S$ is mathematically isomorphic to single-source BFS originating from an imaginary super-source $S^*$ connected to every $s_i \in S$ via a directed edge of weight $0$.
    2. **Deque Monotonicity Invariant (0-1 BFS):** At all times, the distances of elements in the deque are monotonically non-decreasing, and the difference between the minimum and maximum distance in the deque is at most $1$:
       $$\text{dist}(deque.\text{PeekFront()}) \le \text{dist}(deque.\text{PeekBack()}) \le \text{dist}(deque.\text{PeekFront()}) + 1$$
  - *Misconception Check:*
    - *Misconception 1:* "To find the nearest hospital to each house, we must run BFS once for every house." **Disastrous Complexity!** Running BFS for $H$ houses takes $O(H \times (V + E))$. Instead, **reverse the direction**: run **Multi-Source BFS once** starting from all hospitals simultaneously! Total runtime drops to $O(V + E)$!
    - *Misconception 2:* "In 0-1 BFS, you can mark a node as visited when pushing to the back." **Subtle Bug!** Unlike unweighted BFS where the first discovery is guaranteed optimal, in 0-1 BFS a node might first be reached via an edge of weight 1 (dist = 5), but later relaxed via an edge of weight 0 from a shorter path (dist = 4). Therefore, relaxation must update `dist[v]` whenever `dist[u] + w < dist[v]`, similar to Dijkstra!
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the $O(\log V)$ priority queue overhead of Dijkstra on binary-weight graphs. For a graph with $1,000,000$ vertices, eliminating the heap cuts runtime by a factor of $\log_2(10^6) \approx 20\times$.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose Multi-Source BFS:*
    - "Nearest distance from any X to all Y" (e.g. 01 Matrix, Rotting Oranges, Walls and Gates).
  - *When to Choose 0-1 BFS:*
    - Grid pathfinding where movement in one direction is free while changes/obstacles cost 1.
    - Graph problems where edge weights are strictly binary $\{0, 1\}$.
  - *When to Avoid / Failure Modes:*
    - Edge weights $\ge 2$ (use Dijkstra or Dial's algorithm).
    - Negative edge weights (use Bellman-Ford).
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Deque Memory Architecture:* In C#, a Deque can be implemented via a circular ring buffer array or a `LinkedList<T>`. In high-performance systems, an unmanaged circular buffer array `int[] buffer` with bitwise modulo indexing provides zero GC allocations and optimal cache locality.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "Multi-Source BFS models simultaneous multi-origin wavefronts by enqueuing all source nodes at distance zero, mathematically equivalent to a super-source. 0-1 BFS solves single-source shortest paths on graphs with weights in {0, 1} in strictly linear O(V+E) time. By pushing 0-weight relaxations to the front of a Deque and 1-weight relaxations to the back, we preserve monotonic distance ordering without the logarithmic heap overhead of Dijkstra."
- **6. HOW (Operations, Implementation & State Trace):**
  - *Complexity Profile:* Multi-Source BFS: $\Theta(V + E)$; 0-1 BFS: $\Theta(V + E)$ time, $\Theta(V)$ auxiliary space.

---

## 2. 🛠️ IMPLEMENT: Production-Grade From-Scratch C# Containers

Below is the standalone C# implementation of:
1. `CircularDeque<T>`: A high-performance, cache-conscious circular array double-ended queue.
2. `ZeroOneBfsEngine`: The production-grade 0-1 BFS solver.
3. Verification test harness with automated assertions.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace GraphFundamentals.Traversals
{
    /// <summary>
    /// High-performance circular ring buffer Double-Ended Queue (Deque).
    /// Provides strictly O(1) PushFront, PushBack, PopFront, and PopBack.
    /// </summary>
    public class CircularDeque<T>
    {
        private T[] _buffer;
        private int _head;
        private int _tail;
        private int _count;
        private int _capacity;

        public int Count => _count;

        public CircularDeque(int capacity = 16)
        {
            _capacity = Math.Max(16, capacity);
            _buffer = new T[_capacity];
            _head = 0;
            _tail = 0;
            _count = 0;
        }

        public void PushFront(T item)
        {
            if (_count == _capacity) Resize(_capacity * 2);

            _head = (_head - 1 + _capacity) % _capacity;
            _buffer[_head] = item;
            _count++;
        }

        public void PushBack(T item)
        {
            if (_count == _capacity) Resize(_capacity * 2);

            _buffer[_tail] = item;
            _tail = (_tail + 1) % _capacity;
            _count++;
        }

        public T PopFront()
        {
            if (_count == 0) throw new InvalidOperationException("Deque is empty.");

            T item = _buffer[_head];
            _buffer[_head] = default!;
            _head = (_head + 1) % _capacity;
            _count--;
            return item;
        }

        public T PopBack()
        {
            if (_count == 0) throw new InvalidOperationException("Deque is empty.");

            _tail = (_tail - 1 + _capacity) % _capacity;
            T item = _buffer[_tail];
            _buffer[_tail] = default!;
            _count--;
            return item;
        }

        private void Resize(int newCapacity)
        {
            var newBuffer = new T[newCapacity];
            for (int i = 0; i < _count; i++)
            {
                newBuffer[i] = _buffer[(_head + i) % _capacity];
            }
            _buffer = newBuffer;
            _head = 0;
            _tail = _count;
            _capacity = newCapacity;
        }
    }

    /// <summary>
    /// Production-grade 0-1 BFS Shortest Path Engine.
    /// Computes shortest paths on graphs with edge weights in {0, 1} in strictly O(V + E) time.
    /// </summary>
    public class ZeroOneBfsEngine
    {
        public readonly struct WeightedEdge
        {
            public int Destination { get; }
            public int Weight { get; } // Strictly 0 or 1

            public WeightedEdge(int destination, int weight)
            {
                if (weight != 0 && weight != 1)
                    throw new ArgumentException("0-1 BFS edges must have weight 0 or 1.");
                Destination = destination;
                Weight = weight;
            }
        }

        private readonly List<WeightedEdge>[] _adj;
        private readonly int _vertexCount;

        public ZeroOneBfsEngine(int vertexCount)
        {
            if (vertexCount <= 0)
                throw new ArgumentOutOfRangeException(nameof(vertexCount));

            _vertexCount = vertexCount;
            _adj = new List<WeightedEdge>[vertexCount];
            for (int i = 0; i < vertexCount; i++) _adj[i] = new List<WeightedEdge>();
        }

        public void AddDirectedEdge(int u, int v, int weight)
        {
            _adj[u].Add(new WeightedEdge(v, weight));
        }

        /// <summary>
        /// Computes shortest distances from source using a Double-Ended Queue in O(V + E) time.
        /// </summary>
        public int[] ComputeShortestPaths(int src)
        {
            int[] dist = new int[_vertexCount];
            Array.Fill(dist, int.MaxValue);

            var deque = new CircularDeque<int>(_vertexCount);

            dist[src] = 0;
            deque.PushBack(src);

            while (deque.Count > 0)
            {
                int u = deque.PopFront();
                int currentDist = dist[u];

                var edges = _adj[u];
                for (int i = 0; i < edges.Count; i++)
                {
                    var edge = edges[i];
                    int v = edge.Destination;
                    int weight = edge.Weight;

                    // Edge Relaxation Test
                    if (currentDist + weight < dist[v])
                    {
                        dist[v] = currentDist + weight;

                        // If edge weight is 0: PUSH FRONT (same distance layer)
                        // If edge weight is 1: PUSH BACK (next distance layer)
                        if (weight == 0)
                        {
                            deque.PushFront(v);
                        }
                        else
                        {
                            deque.PushBack(v);
                        }
                    }
                }
            }

            return dist;
        }
    }

    /// <summary>
    /// Verification test suite for Multi-Source and 0-1 BFS.
    /// </summary>
    public static class AdvancedBfsTests
    {
        public static void RunAllTests()
        {
            Console.WriteLine("Executing Multi-Source and 0-1 BFS Verification Suite...");

            // Test 1: CircularDeque Operations
            var deque = new CircularDeque<int>(capacity: 4);
            deque.PushBack(10);
            deque.PushBack(20);
            deque.PushFront(5);
            // Deque state: [5, 10, 20]
            Debug.Assert(deque.Count == 3);
            Debug.Assert(deque.PopFront() == 5);
            Debug.Assert(deque.PopBack() == 20);
            Debug.Assert(deque.PopFront() == 10);
            Debug.Assert(deque.Count == 0);

            // Test 2: 0-1 BFS Shortest Path
            // Graph:
            // 0 -(1)-> 1 -(1)-> 3 (cost = 2)
            // 0 -(0)-> 2 -(1)-> 3 (cost = 1)
            var zeroOne = new ZeroOneBfsEngine(vertexCount: 4);
            zeroOne.AddDirectedEdge(0, 1, 1);
            zeroOne.AddDirectedEdge(1, 3, 1);
            zeroOne.AddDirectedEdge(0, 2, 0);
            zeroOne.AddDirectedEdge(2, 3, 1);

            int[] dist = zeroOne.ComputeShortestPaths(0);
            Debug.Assert(dist[0] == 0);
            Debug.Assert(dist[2] == 0); // 0-cost edge
            Debug.Assert(dist[1] == 1);
            Debug.Assert(dist[3] == 1); // 0 -> 2 -> 3 has total weight 0 + 1 = 1!

            Console.WriteLine("All Multi-Source and 0-1 BFS tests passed with 100% assertions verified!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### Asymptotic Profile

| Algorithm | Edge Weights | Data Structure | Time Complexity | Auxiliary Space |
| :--- | :--- | :--- | :--- | :--- |
| **Standard BFS** | Uniform ($w = 1$) | FIFO Queue | $\mathbf{\Theta(V + E)}$ | $\Theta(V)$ |
| **Multi-Source BFS** | Uniform ($w = 1$) | FIFO Queue | $\mathbf{\Theta(V + E)}$ | $\Theta(V)$ |
| **0-1 BFS** | Binary ($w \in \{0, 1\}$) | Double-Ended Queue (Deque) | $\mathbf{\Theta(V + E)}$ | $\Theta(V)$ |
| **Dijkstra's Algorithm** | Arbitrary Non-negative ($w \ge 0$) | Binary Min-Heap (`PriorityQueue`) | $O((V + E) \log V)$ | $\Theta(V)$ |

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### Problem 1: [LeetCode 994] Rotting Oranges (Medium — Multi-Source BFS)

#### Problem Statement
You are given an `m x n` grid where each cell can have one of three values:
- `0` representing an empty cell,
- `1` representing a fresh orange, or
- `2` representing a rotten orange.
Every minute, any fresh orange that is **4-directionally adjacent** to a rotten orange becomes rotten.
Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return `-1`.

#### Algorithmic Strategy (Multi-Source Simultaneous Expansion)
1. Count all fresh oranges `freshCount`.
2. Enqueue all initial rotten oranges `(r, c)` simultaneously into a `Queue<(int, int)>`.
3. If `freshCount == 0`, return `0` immediately.
4. Execute level-order BFS tracking elapsed `minutes`:
   - Iterate across all nodes currently in the queue (`int size = queue.Count`).
   - For each rotten orange, inspect 4 adjacent neighbors:
     - If neighbor is fresh (`grid[nr][nc] == 1`):
       - Mutate `grid[nr][nc] = 2` (rot the orange!).
       - `freshCount--`.
       - Enqueue neighbor.
   - If any orange was rotted during this round, increment `minutes++`.
5. Return `freshCount == 0 ? minutes : -1`.

#### Production Solution in C#
```csharp
using System.Collections.Generic;

public class RottingOrangesSolution
{
    private static readonly int[] Dr = { -1, 1, 0, 0 };
    private static readonly int[] Dc = { 0, 0, -1, 1 };

    public static int OrangesRotting(int[][] grid)
    {
        int rows = grid.Length;
        int cols = grid[0].Length;
        var queue = new Queue<(int R, int C)>();
        int freshCount = 0;

        // Step 1: Multi-Source Initialization
        for (int r = 0; r < rows; r++)
        {
            for (int c = 0; c < cols; c++)
            {
                if (grid[r][c] == 2)
                {
                    queue.Enqueue((r, c));
                }
                else if (grid[r][c] == 1)
                {
                    freshCount++;
                }
            }
        }

        if (freshCount == 0) return 0;

        int minutes = 0;

        // Step 2: Parallel Wavefront Expansion
        while (queue.Count > 0 && freshCount > 0)
        {
            int currentWaveSize = queue.Count;
            minutes++;

            for (int i = 0; i < currentWaveSize; i++)
            {
                var (r, c) = queue.Dequeue();

                for (int d = 0; d < 4; d++)
                {
                    int nr = r + Dr[d];
                    int nc = c + Dc[d];

                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1)
                    {
                        grid[nr][nc] = 2; // Rotted!
                        freshCount--;
                        queue.Enqueue((nr, nc));
                    }
                }
            }
        }

        return freshCount == 0 ? minutes : -1;
    }
}
```

---

### Problem 2: [LeetCode 1368] Minimum Cost to Make at Least One Valid Path in a Grid (Hard — 0-1 BFS)

#### Problem Statement
Given an `m x n` grid, each cell has a sign pointing to the next cell you should visit:
- `1` means go right, `2` means go left, `3` means go down, `4` means go up.
You can modify the sign on a cell with cost `1`.
Return the minimum cost to make at least one valid path from `(0, 0)` to `(m - 1, n - 1)`.

#### Algorithmic Strategy (0-1 BFS on Grid Graph)
- Following the grid's existing sign costs **$0$**.
- Changing the direction to any other of the 3 orthogonal neighbors costs **$1$**.
- Because all edge weights are strictly in $\{0, 1\}$, we can use **0-1 BFS with a Deque**:
  - Distance array `dist[m, n]` initialized to $\infty$, `dist[0, 0] = 0`.
  - Push `(0, 0)` to Deque.
  - While Deque is not empty:
    - Pop `(r, c)` from FRONT.
    - If reached `(m - 1, n - 1)`, return `dist[r, c]`.
    - Check all 4 directions:
      - If direction matches `grid[r][c]`, weight $w = 0$; otherwise $w = 1$.
      - If `dist[r, c] + w < dist[nr, nc]`:
        - Update `dist[nr, nc] = dist[r, c] + w`.
        - If $w == 0$: `PushFront(nr, nc)`.
        - If $w == 1$: `PushBack(nr, nc)`.
- Total Time: strictly $\Theta(M \times N)$ linear operations!

#### Production Solution in C#
```csharp
using System;
using System.Collections.Generic;

public class MinimumCostValidPathSolution
{
    private static readonly int[] Dr = { 0, 0, 1, -1 };
    private static readonly int[] Dc = { 1, -1, 0, 0 };

    public static int MinCost(int[][] grid)
    {
        int m = grid.Length;
        int n = grid[0].Length;

        int[,] dist = new int[m, n];
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                dist[r, c] = int.MaxValue;

        var deque = new LinkedList<(int R, int C)>();

        dist[0, 0] = 0;
        deque.AddFirst((0, 0));

        while (deque.Count > 0)
        {
            var (r, c) = deque.First!.Value;
            deque.RemoveFirst();

            if (r == m - 1 && c == n - 1)
            {
                return dist[r, c];
            }

            int sign = grid[r][c]; // 1: right, 2: left, 3: down, 4: up

            for (int d = 0; d < 4; d++)
            {
                int nr = r + Dr[d];
                int nc = c + Dc[d];

                if (nr >= 0 && nr < m && nc >= 0 && nc < n)
                {
                    // Cost is 0 if moving in sign direction, 1 otherwise
                    int cost = (sign == d + 1) ? 0 : 1;
                    int newDist = dist[r, c] + cost;

                    if (newDist < dist[nr, nc])
                    {
                        dist[nr, nc] = newDist;

                        if (cost == 0)
                            deque.AddFirst((nr, nc)); // Same distance layer
                        else
                            deque.AddLast((nr, nc));  // Next distance layer
                    }
                }
            }
        }

        return dist[m - 1, n - 1];
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 286] Walls and Gates (Medium):**
   - *Task:* Fill each empty room with the distance to its nearest gate.
   - *Pattern:* Multi-source BFS initializing with all gates.

2. **[LeetCode 1368] Minimum Cost to Make at Least One Valid Path in a Grid (Hard):**
   - Solve using the 0-1 BFS Deque algorithm demonstrated above and benchmark against Dijkstra with `PriorityQueue`.

3. **0-1 BFS Invariant Verification:**
   - *Task:* Write an assertion checking that during 0-1 BFS execution, `deque.Last.Value - deque.First.Value <= 1` holds after every single operation.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Shortest Path Engine Selection Matrix:

                     ┌───────────────────────────────────────────────┐
                     │          EDGE WEIGHT CHARACTERISTIC           │
                     └───────────────────────────────────────────────┘
                                             │
             ┌───────────────────────────────┼───────────────────────────────┐
             ▼                               ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│     ALL WEIGHTS = 1     │     │    WEIGHTS IN {0, 1}    │     │   ARBITRARY WEIGHTS     │
│   (Standard / Multi)    │     │        (Binary)         │     │     (Non-Negative)      │
├─────────────────────────┤     ├─────────────────────────┤     ├─────────────────────────┤
│ • Structure: FIFO Queue │     │ • Structure: Deque      │     │ • Structure: Min-Heap   │
│ • Complexity: O(V + E)  │     │ • Complexity: O(V + E)  │     │ • Complexity: O(E log V)│
│ • Technique: BFS /      │     │ • Technique: 0-1 BFS    │     │ • Technique: Dijkstra   │
│   Multi-Source BFS      │     │   (PushFront / PushBack)│     │   with PriorityQueue    │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
Why does 0-1 BFS maintain monotonic distance ordering in the deque without requiring a full binary min-heap?

### Architectural Model Answer
1. **The Nature of Edge Relaxations in 0-1 BFS:**
   - In standard BFS with uniform edge weights $w = 1$, the distance of an enqueued node is always $\text{dist}[u] + 1$. Because nodes are dequeued in non-decreasing order of $\text{dist}[u]$, enqueuing at the back preserves a queue where all elements belong to at most two consecutive layers: $\{d, d + 1\}$.
   - In 0-1 BFS, edge weights are restricted exclusively to $w \in \{0, 1\}$.
   - When a node $u$ with distance $d$ is popped from the front of the deque:
     - An edge of weight $w = 0$ yields a candidate distance of:
       $$\text{dist}[v] = \text{dist}[u] + 0 = d$$
     - An edge of weight $w = 1$ yields a candidate distance of:
       $$\text{dist}[v] = \text{dist}[u] + 1 = d + 1$$

2. **How the Deque Preserves Monotonicity:**
   - Suppose the deque currently contains elements spanning distances $d$ and $d + 1$, where all elements with distance $d$ are at the front and all elements with distance $d + 1$ are at the back.
   - We pop a node $u$ with distance $d$ from the front:
     1. If we relax a neighbor $v$ across a $0$-weight edge, $\text{dist}[v] = d$. We push $v$ to the **FRONT** of the deque. Because the current elements at the front have distance $d$, inserting a node of distance $d$ at the front **preserves the non-decreasing order**.
     2. If we relax a neighbor $v$ across a $1$-weight edge, $\text{dist}[v] = d + 1$. We push $v$ to the **BACK** of the deque. Because the elements at the back have distance $d$ or $d + 1$, adding a node of distance $d + 1$ to the back **preserves the non-decreasing order**.
   - At no point can a node with distance $< d$ or $> d + 1$ be introduced while processing layer $d$.

3. **Asymptotic Consequence:**
   - Because the deque is mathematically guaranteed to remain sorted at all times, the minimum-distance element is always available at the front in strictly **$\Theta(1)$ constant time**.
   - This eliminates the $\Theta(\log V)$ priority queue insertion and deletion overhead of Dijkstra's algorithm, allowing 0-1 BFS to achieve strictly **$\Theta(V + E)$ linear time**.
