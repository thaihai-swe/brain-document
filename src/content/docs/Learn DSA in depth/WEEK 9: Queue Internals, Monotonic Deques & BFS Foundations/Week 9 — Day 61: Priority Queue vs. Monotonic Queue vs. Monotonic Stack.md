---
title: "Week 9 — Day 61: Priority Queue vs. Monotonic Queue vs. Monotonic Stack"
---

# Week 9 — Day 61: Priority Queue vs. Monotonic Queue vs. Monotonic Stack

Welcome to **Day 61 of your DSA Mastery Journey**!

Throughout Week 8 and Week 9, we have studied specialized ordered collections:
- **Monotonic Stacks** ([Days 50–53](../WEEK%208:%20Stack%20Call%20Semantics,%20Monotonic%20Stacks%20&%20Expression%20Parsing/Week%208%20%E2%80%94%20Day%2051:%20Monotonic%20Stack%20Fundamentals%20%E2%80%94%20Next%20Greater%20&%20Smaller%20Elements.md)) for nearest greater/smaller boundaries in 1D arrays.
- **Monotonic Deques** ([Days 58–59](./Week%209%20%E2%80%94%20Day%2058:%20Deque%20Data%20Structure%20From%20Scratch,%20Monotonic%20Deque%20&%20The%20Sliding%20Window%20Maximum.md)) for contiguous sliding window extrema in linear time.
- **FIFO Queues** ([Days 57, 60](./Week%209%20%E2%80%94%20Day%2060:%20Queue-Based%20BFS%20Foundation%20&%20Level-Order%20Mechanics.md)) for unweighted shortest path wavefronts.

Today, we orchestrate the **Grand Architectural Synthesis**: comparing **Monotonic Stacks**, **Monotonic Deques**, and **Priority Queues (Heaps)**. We will confront hard multi-dimensional boundary problems where linear monotonic pruning breaks down, necessitating the **Priority Queue Sweep-Line** and **2D Boundary Min-Heap BFS**.

---

## 🧭 Executive Architecture: The Ordered Collection Diagnostic Matrix

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ORDERED COLLECTION SELECTION MATRIX                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

                       Can elements depart out of strict arrival order?
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼ NO                                            ▼ YES
    Are we querying a sliding window of              Does order depend on arbitrary
    contiguous index range [i-k, i]?                 attributes, intervals, or 2D boundaries?
              │                                                       │
      ┌───────┴───────┐                                               ▼
      ▼ YES           ▼ NO                                   PRIORITY QUEUE (HEAP)
  MONOTONIC       MONOTONIC                                  • Skyline Problem (LC 218)
    DEQUE           STACK                                    • Trapping Rain Water II (LC 407)
  • Sliding Max   • Next Greater                             • Event-driven simulations
  • O(N) time     • Histogram Area                           • O(N log K) time
  • O(K) space    • O(N) time, O(N) space
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* Architectural contrast between the three primary ordered buffers: **Priority Queue (Min/Max Heap)**, **Monotonic Queue/Deque**, and **Monotonic Stack**.
  - *Core Invariants:* Priority Queue: Tree-structured heap invariant ($parent \le children$), logarithmic dynamic operations ($O(\log N)$); Monotonic Deque: Sequence-ordered sliding window extremes ($O(1)$ amortized); Monotonic Stack: LIFO nearest boundary extremes ($O(1)$ amortized).
  - *Misconception Check:* A Priority Queue is *not* always the right tool for sliding window maximums; using a heap costs $O(N \log K)$ and requires lazy deletion, whereas a Monotonic Deque achieves $O(N)$ with immediate eviction.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates choosing the wrong buffer container under technical interview constraints.
  - *Complexity Advantage:* Selects the optimal data structure achieving $O(1)$ amortized vs. $O(\log N)$ performance based on access pattern constraints.
- **3. WHEN:**
  - *When to Choose / Signal Words:* Global top-K / dynamic event scheduling $\implies$ Priority Queue; Contiguous sliding window min/max $\implies$ Monotonic Deque; Nearest greater/smaller boundary lookup $\implies$ Monotonic Stack.
  - *When to Avoid / Failure Modes:* Never use a Priority Queue where a Monotonic Stack or Deque applies; the extra $\log N$ factor causes TLE on $N \ge 10^5$.
- **4. WHERE:**
  - *Physical CLR Memory:* Flat contiguous array for Binary Heap (`PriorityQueue<T, P>`) vs. Circular Ring Buffer for Deque vs. Array-backed Stack.
  - *Production Systems:* CPU process priority scheduling (Heap) vs. network traffic shaping buffers (Deque) vs. thread call stacks (Stack).
- **5. WHO:**
  - *Spoken Script:* "I choose between these three primitives based on scope: a Monotonic Stack finds the nearest greater or smaller neighbor in $O(N)$; a Monotonic Deque maintains the running minimum or maximum over a fixed sliding window in amortized $O(N)$; and a Priority Queue maintains global min/max over arbitrary dynamic insertions and deletions in $O(N \log N)$."
  - *Interviewer Evaluation Lens:* Checks whether candidate can articulate trade-offs across all three structures, analyze space/time complexities, and justify container selection.
- **6. HOW:**
  - *Cost Model:* Stack: $O(1)$ amortized push/pop; Deque: $O(1)$ amortized push/pop; PriorityQueue: $O(\log N)$ enqueue/dequeue.
  - *State Transition Trace:* Decision Matrix: `Static window? -> Deque; Nearest neighbor? -> Stack; Arbitrary streaming inserts? -> PriorityQueue`.


### ⚖️ Architectural Comparison: Priority Queue vs. Monotonic Queue vs. Monotonic Stack
| Architectural Feature | Priority Queue (Binary Heap) | Monotonic Queue (Deque) | Monotonic Stack |
| :--- | :--- | :--- | :--- |
| **Underlying Container**| Complete binary tree in contiguous array | Double-ended queue (`CircularArrayDeque` or `LinkedList`) | Dynamic array (`ArrayStack`) or linked nodes |
| **Order Maintenance** | Heap invariant restored via `SiftUp` / `SiftDown` | Maintained by evicting smaller/larger elements from the **Back** | Maintained by popping violating elements from the **Top** |
| **Eviction Mechanics** | Explicit extraction of minimum/maximum element | 1. **Back eviction:** Maintained on every push<br>2. **Front eviction:** When element expires outside window | **Top eviction:** Popped whenever the incoming element violates monotonicity |
| **Time per Operation** | $\Theta(\log K)$ per push/pop | **Amortized $\Theta(1)$** (each element enters and leaves deque at most once) | **Amortized $\Theta(1)$** (each element pushed and popped at most once) |
| **Active Window Scope** | Global extrema over all unextracted items | **Local extrema over contiguous sliding window $[i-K+1, i]$** | **Nearest boundary element** (Next Greater / Previous Smaller) |
| **Canonical Interview Triggers**| 1. K-way merge of sorted streams<br>2. Find Kth largest element<br>3. Dijkstra / Prim greedy shortest paths | 1. Sliding Window Maximum / Minimum<br>2. Shortest subarray with sum at least $K$<br>3. Constrained subsequence sum DP | 1. Daily Temperatures / Next Greater Element<br>2. Largest Rectangle in Histogram<br>3. Trapping Rain Water (horizontal scan) |


### 1.1 Physical Mental Model: ER Triage, Highway Radar Van, and Cinema Sightlines

Choosing between a Priority Queue, a Monotonic Deque, and a Monotonic Stack is best understood through three distinct real-world physical screening mechanics:

```
       ======================================================================
         PHYSICAL ANALOGY: ER TRIAGE VS RADAR VAN VS SIGHTLINE CANISTER
       ======================================================================

       1. PRIORITY QUEUE (Hospital ER Triage)
          - Rule: Severity governs order, independent of arrival time.
          - Arrival: Arbitrary timestamps, arbitrary severity levels.
          - Structure: Binary tree. New arrival sifts up log(N) levels to top.
          [Heart Attack] <--- Dispatched first even if arrived last!
             /        \
         [Broken Arm] [Flu]

       2. MONOTONIC DEQUE (Rolling Highway Surveillance Van)
          - Rule: Rolling fixed-time window [t - K, t].
          - "Younger & Stronger" Domination: A sports car at 120 mph renders
            an older truck at 55 mph irrelevant (truck is slower AND expires sooner!).
          - Front: Old expired cars exit window.
          - Back: Slower older cars pruned by incoming speed demon.
          Front: [Max Speed 120mph] <--- [90mph] <--- [70mph] :Back (Pruning)

       3. MONOTONIC STACK (Tall Cinema Sightlines)
          - Rule: Nearest unobstructed barrier / shadow caster.
          - Structure: Vertical canister, LIFO only.
          - When a 6'5" person enters, every shorter person behind them is
            eclipsed and popped. Only visible peaks remain.
          Top: [ 6'5" ]
               [ 6'7" ]
          Bot: [ 7'0" ]
```

```
       ======================================================================
           MEMORY LAYOUT & DATA FLOW TOPOLOGY COMPARISON
       ======================================================================

       [Priority Queue: Complete Tree in Array]
       Array Index:  [0]   [1]   [2]   [3]   [4]   [5]
       Tree Level:  Root |  L1    L1  |  L2    L2    L2
       Pointers:    Parent at (i-1)/2, Children at 2i+1, 2i+2. Non-contiguous values.

       [Monotonic Deque: Double-Ended Circular Ring Buffer]
       Buffer:      [ . | . | Head: Max | Val | Val | Tail | . | . ]
                                ^                      ^
                                |--- Front: Pop Expired|--- Back: Prune Smaller

       [Monotonic Stack: Contiguous LIFO Buffer]
       Buffer:      [ Bottom: Max | Val | Top: Min ] <---> Push / Pop only here!
```

```
       ======================================================================
                   DECISION MATRIX: WHICH CONTAINER TO DEPLOY?
       ======================================================================

                             Need extreme value?
                                      |
                     +----------------+----------------+
                     |                                 |
              Global extrema over              Local extreme over
             dynamic life spans?               ordered stream?
                     |                                 |
            [PRIORITY QUEUE]                           |
             O(log N) push/pop                         |
                                        +--------------+--------------+
                                        |                             |
                                 Contiguous fixed              Nearest boundary
                                 sliding window?               greater/smaller?
                                        |                             |
                                [MONOTONIC DEQUE]             [MONOTONIC STACK]
                                 O(1) amortized                O(1) amortized
```

---

### 1.2 The Tripartite Architectural Comparison

| Dimension | Monotonic Stack | Monotonic Deque | Priority Queue (Binary Heap) |
| :--- | :--- | :--- | :--- |
| **Primary Invariant** | Elements from bottom to top are strictly increasing/decreasing. | Elements from front to back are strictly increasing/decreasing. | Heap-order: parent is $\le$ (min) or $\ge$ (max) children. |
| **Access Discipline** | Single-ended (Push/Pop at Top). | Double-ended (Prune Back, Evict Front). | Root-only extraction (`Dequeue`), append at leaf (`Enqueue`). |
| **Element Eviction** | Only evicted when *dominated* by incoming top element. | Evicted from front (out of window) AND from back (dominated). | Evicted only when element reaches top of heap (or lazy deletion). |
| **Window Type** | 1D bounded spans, nearest smaller/greater neighbors. | Contiguous sliding window $[i - K + 1, i]$. | Arbitrary arrival times, overlapping intervals, multi-dimensional frontiers. |
| **Time Complexity** | Amortized $O(1)$ per operation $\implies \mathbf{O(N)}$ total. | Amortized $O(1)$ per operation $\implies \mathbf{O(N)}$ total. | $O(\log K)$ per operation $\implies \mathbf{O(N \log K)}$ total. |
| **Underlying Memory** | Contiguous array (`T[]`). | Contiguous circular ring (`T[]`) or doubly-linked nodes. | Contiguous complete binary tree array (`T[]`). |

---

### 1.2 When Does the Monotonic Deque Fail? (The Heap Threshold)

The Monotonic Deque achieves $O(N)$ linear time by exploiting two strict structural preconditions:
1. **Contiguous FIFO Lifespans:** Elements enter the active set in strict order of index $0, 1, 2, \dots$ and expire in strict order of index $0, 1, 2, \dots$.
2. **Total Domination Property:** If $A[i] \ge A[j]$ and $i > j$, then $j$ is *inferior in value* AND *dies earlier*.

#### The Failure Case:
When elements have **independent, arbitrary lifespans** (e.g., building intervals $[L_i, R_i, H_i]$ where building $A$ starts before building $B$ but building $A$ also ends *after* building $B$), precondition 1 is violated:
- An element entering later might **expire earlier**!
- Therefore, a smaller element cannot be safely pruned from the back, because when the larger element expires early, the smaller element might re-emerge as the active maximum!
- **Result:** You cannot prune candidates in $O(1)$. You must retain all active candidates in a data structure that dynamically extracts the global maximum: **The Priority Queue (Heap)**.

---

### 1.3 The Dimensionality Leap: 1D vs. 2D Trapping Rain Water

Consider the problem of calculating trapped rainwater:

#### In 1D ([LeetCode 42]):
- Water at index $i$ is trapped between the maximum height to its left and the maximum height to its right:
  $$\text{water}[i] = \max(0, \min(\text{leftMax}[i], \text{rightMax}[i]) - \text{height}[i])$$
- Water can only spill in **two directions**: Left or Right.
- Because there are only 2 linear escape routes, two pointers advancing inward from both ends solve the problem in **strict $O(N)$ time and $O(1)$ space**.

#### In 2D ([LeetCode 407]):
- A grid of elevation cells $M \times N$.
- Water does **not** spill only along straight horizontal or vertical lines! Water is fluid: it leaks through any arbitrary, serpentine, winding path of least resistance to any perimeter boundary cell!
- Water level at cell $(r, c)$ is governed by the **Minimax Path Invariant**:
  $$\text{WaterLevel}(r, c) = \min_{\text{all paths } P \text{ from } (r, c) \text{ to boundary}} \left( \max_{(u, v) \in P} \text{height}[u][v] \right)$$
- To find the lowest bottleneck enclosing a region, we must simulate the boundary shrinking inward starting from the **lowest perimeter cell**.
- This requires a **Min-Heap (Priority Queue) over the 2D boundary**, transforming the problem into a generalized **Dijkstra-style BFS** in $O(M \cdot N \log(M \cdot N))$ time!

### 1.4 ⚙️ Core Operations Deep-Dive: 2D Inward Boundary Shrinkage & Minimax Proofs

#### Dimension 1: Operation Contract & Big-O Bounds
- **Operation Signatures:**
  1. `int TrapRainWater(int[][] heightMap)`
  2. `IList<IList<int>> GetSkyline(int[][] buildings)`
- **Preconditions:**
  - `heightMap` is an $M \times N$ integer elevation matrix with $M, N \ge 1$ and non-negative heights.
  - In `GetSkyline`, `buildings` triplets $[L_i, R_i, H_i]$ satisfy $0 \le L_i < R_i$.
- **Postconditions:**
  - `TrapRainWater` returns the exact total volume of trapped water enclosed by the terrain perimeter.
  - `GetSkyline` returns key points $(x, y)$ marking coordinate changes in the outer silhouette.
- **Complexity Bounds:**
  - **TrapRainWater (2D Dijkstra-Style BFS):**
    - Time Complexity: $O(M \cdot N \log(M \cdot N))$ — every cell is enqueued and dequeued from the Min-Heap once.
    - Auxiliary Space Complexity: $\Theta(M \cdot N)$ — Min-Heap holding at most $2(M + N)$ boundary cells simultaneously, plus $M \times N$ boolean `visited` matrix.
  - **GetSkyline (Sweep-Line):**
    - Time Complexity: $O(N \log N)$ sorting $2N$ events and maintaining heap operations.
    - Auxiliary Space Complexity: $O(N)$ active building heap.

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree
1. **Perimeter Seeding & Heap Initialization:**
   - If $M < 3$ or $N < 3$, return `0` (cannot trap water without at least one interior cell).
   - Initialize `PriorityQueue<(int r, int c, int h), int> minHeap`.
   - Allocate `bool[,] visited = new bool[M, N]`.
   - Push all perimeter cells $(0, c), (M-1, c), (r, 0), (r, N-1)$ into `minHeap` with priority $h = heightMap[r][c]$. Mark `visited[r][c] = true`.
2. **Inward Boundary Shrinkage Loop (`while minHeap.Count > 0`):**
   - Dequeue lowest boundary cell: `(int r, int c, int h) = minHeap.Dequeue()`.
   - For each 4-way orthogonal neighbor $(nr, nc) \in [(r-1,c), (r+1,c), (r,c-1), (r,c+1)]$:
     - Check: $0 \le nr < M \land 0 \le nc < N \land !visited[nr, nc]$.
     - If valid and unvisited:
       - Mark `visited[nr, nc] = true`.
       - *Calculate Trapped Water:*
         `int trapped = Math.Max(0, h - heightMap[nr][nc]);`
         `totalWater += trapped;`
       - *Update Effective Boundary Elevation:*
         `int effectiveH = Math.Max(h, heightMap[nr][nc]);`
       - Enqueue new boundary frontier: `minHeap.Enqueue((nr, nc, effectiveH), effectiveH)`.

```
                    [Initialize Perimeter into Min-Heap]
                                    │
                         while minHeap.Count > 0
                                    │
                       (r, c, h) = minHeap.Dequeue()
                       (Lowest current boundary point)
                                    │
                     For each unvisited neighbor (nr, nc):
                       visited[nr, nc] = true
                       trapped = max(0, h - heightMap[nr][nc])
                       totalWater += trapped
                       effectiveH = max(h, heightMap[nr][nc])
                       minHeap.Enqueue((nr, nc, effectiveH))
```

#### Dimension 3: Visual ASCII State Transitions
```
3x3 ELEVATION MATRIX:
[ 3, 3, 3 ]
[ 3, 1, 3 ]   Center cell (1,1) at height 1, surrounded by wall of 3.
[ 3, 3, 3 ]

HEAP INWARD SHRINKAGE TRACE:
1. Enqueue all 8 border cells with height 3 into Min-Heap.
2. Dequeue first cell with minimum height: say (0,1) at height 3.
   - Inspect unvisited neighbor: (1,1) at height 1.
   - Water trapped at (1,1) = max(0, 3 - 1) = 2 units!
   - Effective boundary pushed for (1,1) = max(3, 1) = 3.
   - Enqueue (1,1) with effective height 3.
3. Remaining cells dequeued all have height 3; all neighbors already visited.
4. Heap exhausts. Total trapped water = 2 units.
```

#### Dimension 4: Invariant Preservation Proof
- **Minimax Boundary Bottleneck Invariant (Inductive Proof):**
  - Let $B$ be the set of active boundary cells stored in the Min-Heap.
  - Initially, $B$ forms a continuous topological Jordan curve separating the interior of the grid from the outside world.
  - *Inductive Invariant:* When cell $u$ is dequeued from $B$, its elevation $H[u]$ is the absolute minimum boundary height of all closed paths containing unvisited interior cells.
  - Because $u = \arg\min_{b \in B} H[b]$, any escape path from an interior neighbor $v$ to the boundary must pass either through $u$ or through some other boundary cell $w \in B$.
  - Since $H[w] \ge H[u]$ for all $w \in B$, the escape bottleneck through any alternative path is $\ge H[u]$.
  - Therefore, water at $v$ cannot spill out at any height below $H[u]$. The water level at $v$ is strictly bounded by $H[u]$, confirming that $trapped = \max(0, H[u] - height[v])$ is globally optimal and exact.

#### Dimension 5: Edge Case Matrix
| Edge Case Scenario | Input State | Algorithmic Behavior | Invariant Preservation |
| :--- | :--- | :--- | :--- |
| **Grid Too Small** | $M < 3$ or $N < 3$ | Guard condition fires immediately; returns 0. | No interior cells can exist; zero water. |
| **Flat Plateau** | All cells identical elevation | Every neighbor has $h - heightMap = 0$; zero water accumulated. | Plateau holds no water. |
| **Deep Lake Crater** | Interior cells at 0, perimeter at 10 | Lowest boundary cell (10) fills interior up to 10; traps $10 \times \text{cells}$. | Correctly computes maximum volume lake. |
| **Leaking Low Notch** | Perimeter has one low cell at 1 | Lowest cell (1) dequeued first; water drains out through notch without trapping. | Accurately models leak dynamics. |
| **Pyramid / Peak** | Interior higher than perimeter | Neighbors have $heightMap \ge h$; water calculation yields 0. | Mountain slopes shed water completely. |

---

## 2. 💻 DEMONSTRATE: Canonical Invariant Visualization & Algorithmic Mechanics

### 2.1 2D Inward Boundary Elevation Shrinkage (LeetCode 407 Trace)

```
Initial 2D Elevation Map (3 x 6):
┌────┬────┬────┬────┬────┬────┐
│ 12 │ 13 │  1 │ 12 │ 12 │ 12 │    All perimeter cells (border) are pushed into Min-Heap.
├────┼────┼────┼────┼────┼────┤
│ 13 │  4 │ 13 │ 12 │  3 │ 12 │    Inner cells: (1,1)=4, (1,2)=13, (1,3)=12, (1,4)=3.
├────┼────┼────┼────┼────┼────┤
│ 12 │ 12 │ 12 │ 12 │ 12 │ 12 │
└────┴────┴────┴────┴────┴────┘

Min-Heap extracts the absolute LOWEST boundary cell: (0, 2) with Height = 1!
Why? Water can spill out of the lake at height 1! The lowest boundary cell is the global bottleneck!

Cell (0,2) [Height 1] examines unvisited neighbor (1, 2) [Height 13]:
  • Water trapped at (1,2) = max(0, boundaryHeight(1) - height(13)) = 0.
  • Effective boundary for (1,2) becomes max(1, 13) = 13.
  • Push (1,2) with height 13 into Min-Heap!

Next lowest boundary cells are extracted: 12, 12, 12...
Eventually, cell (1, 0) [Height 13] or (2, 1) [Height 12] expands to inner cell (1, 1) [Height 4]:
  • Surrounding boundary height is 12!
  • Cell height is 4!
  • Trapped Water = 12 - 4 = 8 units!
  • Push (1,1) with effective height max(12, 4) = 12 into Min-Heap!
```

---

## 3. 🔬 COMPLEXITY & MATHEMATICAL INVARIANTS

### 3.1 Formal Invariant Proof: 2D Boundary Inward Shrinkage

> [!TIP]
> ### 🧮 Proof by Induction on Boundary Elevations
>
> **Invariant Statement:** When cell $u$ is dequeued from the boundary Min-Heap with effective elevation $H[u]$, $H[u]$ is the **exact minimax bottleneck height** of any path connecting $u$ to the grid boundary.
>
> **Base Case:**
> All cells on the external perimeter are initialized into the Min-Heap with their native height. Their minimax path to the boundary is trivial (length 0), so their bottleneck is precisely their own height. The invariant holds.
>
> **Inductive Step:**
> Assume the invariant holds for all cells dequeued so far. Let $u$ be the current lowest cell in the Min-Heap, with elevation $H[u]$.
> Let $v$ be an unvisited interior neighbor of $u$.
> Any path from $v$ to the outside world that exits via $u$ has a bottleneck of at least:
> $$B = \max(H[u], \text{height}[v])$$
> Could there be an alternate path from $v$ to the boundary with an even lower bottleneck $B' < B$?
> - Any alternate path must cross some other cell $w$ currently residing in the boundary Min-Heap.
> - Because $u$ was chosen as the minimum element in the Min-Heap, we know:
>   $$H[w] \ge H[u]$$
> - Therefore, any path passing through $w$ has a bottleneck of at least $H[w] \ge H[u]$.
> - Thus, no alternate unexamined path can provide a lower bottleneck than $H[u]$!
>
> Hence, setting the water level at $v$ to $\max(H[u], \text{height}[v])$ is strictly optimal. $\blacksquare$

---

## 4. 🛠️ PRACTICE: Canonical Big Tech Problem Walkthroughs

---

### 4.1 Problem 1: [LeetCode 218] The Skyline Problem (Hard)

> **Problem Description:**
> A city's skyline is the outer contour of the silhouette formed by all the buildings in this city when viewed from a distance. Given the locations and heights of all the buildings, return *the skyline formed by these buildings collectively*.
>
> Each building is represented by a triplet `[left, right, height]`.
> The output is a list of "key points" `[x, y]` sorted by their x-coordinate.
>
> **Constraints:**
> - $1 \le \text{buildings.Length} \le 3 \cdot 10^4$
> - $0 \le \text{left}_i < \text{right}_i \le 2^{31} - 1$
> - $1 \le \text{height}_i \le 2^{31} - 1$

#### 1. Sweep-Line Algorithmic Formulation
- We convert each building $[L, R, H]$ into **two critical events**:
  1. **Start Event:** At $x = L$, height $+H$ enters the skyline.
  2. **End Event:** At $x = R$, height $-H$ exits the skyline.
- We sweep a vertical line from left to right across all $x$-coordinates.
- At any coordinate $x$, the current skyline height is the **maximum height among all currently active buildings**.
- When the maximum active height **changes**, a new key point is born!

#### 2. Critical Event Sorting Order (Tie-Breaking Rules)
If two events share the exact same $x$-coordinate, the order in which we process them determines correctness:
1. **Both are Start Events:** Higher building must be processed first (sort height descending) so it supersedes the lower building immediately.
2. **Both are End Events:** Lower building must be processed first (sort height ascending) so the true ground height is revealed last.
3. **One Start, One End:** The Start event must be processed before the End event, preventing the skyline from prematurely dropping to 0 between adjacent touching buildings.

#### 3. Production C# Implementation (Sweep-Line with Multi-Set / Frequency Map)

```csharp
using System;
using System.Collections.Generic;

public class Solution
{
    private sealed class Event : IComparable<Event>
    {
        public int X;
        public int Height;
        public bool IsStart;

        public Event(int x, int height, bool isStart)
        {
            X = x;
            Height = height;
            IsStart = isStart;
        }

        public int CompareTo(Event? other)
        {
            if (other == null) return 1;
            if (X != other.X) return X.CompareTo(other.X);

            // Same X: Apply tie-breaking rules
            if (IsStart && other.IsStart)
            {
                // Both start: higher height first
                return other.Height.CompareTo(Height);
            }
            if (!IsStart && !other.IsStart)
            {
                // Both end: lower height first
                return Height.CompareTo(other.Height);
            }
            // Start event must precede End event
            return IsStart ? -1 : 1;
        }
    }

    public IList<IList<int>> GetSkyline(int[][] buildings)
    {
        var result = new List<IList<int>>();
        if (buildings == null || buildings.Length == 0) return result;

        // Step 1: Create events
        var events = new List<Event>(buildings.Length * 2);
        foreach (var b in buildings)
        {
            events.Add(new Event(b[0], b[2], true));
            events.Add(new Event(b[1], b[2], false));
        }

        // Step 2: Sort events according to tie-breaking specification
        events.Sort();

        // Step 3: Maintain active heights using a SortedDictionary (acting as a Max-Heap with O(log N) deletion)
        // Key: Height, Value: Count of buildings with this height
        var activeHeights = new SortedDictionary<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
        activeHeights[0] = 1; // Base ground level of height 0

        int currentMaxHeight = 0;

        // Step 4: Process events
        foreach (var ev in events)
        {
            if (ev.IsStart)
            {
                if (!activeHeights.ContainsKey(ev.Height))
                    activeHeights[ev.Height] = 0;
                activeHeights[ev.Height]++;
            }
            else
            {
                activeHeights[ev.Height]--;
                if (activeHeights[ev.Height] == 0)
                {
                    activeHeights.Remove(ev.Height);
                }
            }

            // Top of active heights is the first key in the SortedDictionary
            int newMaxHeight = 0;
            foreach (var kvp in activeHeights)
            {
                newMaxHeight = kvp.Key;
                break;
            }

            // If the global skyline height changes, record a key point
            if (newMaxHeight != currentMaxHeight)
            {
                result.Add(new List<int> { ev.X, newMaxHeight });
                currentMaxHeight = newMaxHeight;
            }
        }

        return result;
    }
}
```

#### 4. Complexity
- **Time Complexity:** $O(N \log N)$ where $N$ is the number of buildings. Sorting takes $O(N \log N)$, and dictionary operations take $O(\log N)$ per event.
- **Space Complexity:** $O(N)$ for event list and active heights dictionary.

---

### 4.2 Problem 2: [LeetCode 407] Trapping Rain Water II (Hard)

> **Problem Description:**
> Given an $m \times n$ integer matrix `heightMap` representing the height of each unit cell in a 2D elevation map, return *the volume of water it can trap after raining*.
>
> **Constraints:**
> - $m == \text{heightMap.Length}$, $n == \text{heightMap}[i].\text{Length}$
> - $1 \le m, n \le 200$
> - $0 \le \text{heightMap}[i][j] \le 2 \cdot 10^4$

#### 1. The 2D Min-Heap Boundary Algorithm
1. If $m < 3$ or $n < 3$, no water can be trapped (all cells are borders). Return 0.
2. Initialize a Min-Heap of boundary cells: `(row, col, height)`.
3. Mark all perimeter cells as visited and enqueue them into the Min-Heap.
4. Maintain `currentWaterLevel = 0`.
5. While the heap is not empty:
   - Dequeue the cell with the smallest height: `(r, c, h)`.
   - Update `currentWaterLevel = Math.Max(currentWaterLevel, h)`.
   - For all 4 unvisited neighbors `(nr, nc)`:
     - Mark `visited[nr, nc] = true` immediately!
     - If `heightMap[nr][nc] < currentWaterLevel`, add trapped water:
       $$\text{trapped} += \text{currentWaterLevel} - \text{heightMap}[nr][nc]$$
     - Enqueue neighbor into the heap with its effective height: `(nr, nc, Math.Max(heightMap[nr][nc], currentWaterLevel))`.

#### 2. Production C# Implementation

```csharp
using System;
using System.Collections.Generic;

public class Solution
{
    private sealed class Cell : IComparable<Cell>
    {
        public int Row;
        public int Col;
        public int Height;

        public Cell(int row, int col, int height)
        {
            Row = row;
            Col = col;
            Height = height;
        }

        public int CompareTo(Cell? other)
        {
            return other == null ? 1 : Height.CompareTo(other.Height);
        }
    }

    private static readonly int[] DRow = { -1, 1, 0, 0 };
    private static readonly int[] DCol = { 0, 0, -1, 1 };

    public int TrapRainWater(int[][] heightMap)
    {
        if (heightMap == null || heightMap.Length < 3 || heightMap[0].Length < 3)
            return 0;

        int m = heightMap.Length;
        int n = heightMap[0].Length;

        // Min-Heap tracking active boundary cells
        var minHeap = new PriorityQueue<Cell, int>();
        bool[,] visited = new bool[m, n];

        // 1. Enqueue all perimeter cells
        for (int r = 0; r < m; r++)
        {
            for (int c = 0; c < n; c++)
            {
                if (r == 0 || r == m - 1 || c == 0 || c == n - 1)
                {
                    minHeap.Enqueue(new Cell(r, c, heightMap[r][c]), heightMap[r][c]);
                    visited[r, c] = true;
                }
            }
        }

        int totalWater = 0;
        int waterLevel = 0;

        // 2. Inward boundary shrinkage
        while (minHeap.Count > 0)
        {
            Cell current = minHeap.Dequeue();
            waterLevel = Math.Max(waterLevel, current.Height);

            for (int d = 0; d < 4; d++)
            {
                int nr = current.Row + DRow[d];
                int nc = current.Col + DCol[d];

                if (nr >= 0 && nr < m && nc >= 0 && nc < n && !visited[nr, nc])
                {
                    visited[nr, nc] = true; // Mark visited ON ENQUEUE!

                    int neighborHeight = heightMap[nr][nc];
                    if (neighborHeight < waterLevel)
                    {
                        totalWater += waterLevel - neighborHeight;
                    }

                    // Enqueue neighbor with its effective spillway height
                    int effectiveHeight = Math.Max(neighborHeight, waterLevel);
                    minHeap.Enqueue(new Cell(nr, nc, effectiveHeight), effectiveHeight);
                }
            }
        }

        return totalWater;
    }
}
```

#### 3. Complexity
- **Time Complexity:** $O(M \cdot N \log(M \cdot N))$. Every cell enters the priority queue at most once. Each heap operation takes $O(\log(M \cdot N))$.
- **Space Complexity:** $O(M \cdot N)$ for the visited matrix and priority queue.

---

### 4.3 Problem 3: LeetCode 295 — Find Median from Data Stream (Hard) ⭐⭐⭐

> The **median** is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.
>
> Implement the `MedianFinder` class:
> - `void AddNum(int num)` adds the integer `num` from the data stream to the data structure.
> - `double FindMedian()` returns the median of all elements so far. Answers within $10^{-5}$ of the actual answer will be accepted.

#### 1. Invariant Architecture: The Two-Heap Equilibrium
Why not keep a sorted array? Inserting takes $O(N)$ due to shifting elements.
Why not a balanced BST? Rebalancing is complex and $O(\log N)$ constants are high.
**The Two-Heap Pattern:** Divide the numbers into two equal halves:
- **`_maxHeap` (Lower Half):** Stores the smaller half of numbers. The largest among them (`_maxHeap.Peek()`) is a candidate median.
- **`_minHeap` (Upper Half):** Stores the larger half of numbers. The smallest among them (`_minHeap.Peek()`) is a candidate median.

```
       Lower Half (maxHeap)                  Upper Half (minHeap)
    [ 1,   2,   3,   5,   7 ]             [ 8,  10,  12,  15,  20 ]
                           ▲               ▲
                           │               │
                     maxHeap.Peek()  minHeap.Peek()
                           (5)            (8)

Median = (5 + 8) / 2.0 = 6.5
```

**The Two Fundamental Invariants:**
1. **Value Invariant:** Every element in `_maxHeap` $\le$ every element in `_minHeap`.
2. **Balance Invariant:** $0 \le \text{\_maxHeap.Count} - \text{\_minHeap.Count} \le 1$.

#### 2. Production C# Implementation
```csharp
using System;
using System.Collections.Generic;

public class MedianFinder {
    // Max-Heap stores the lower half of values (inverted priority)
    private readonly PriorityQueue<int, int> _maxHeap;
    // Min-Heap stores the upper half of values
    private readonly PriorityQueue<int, int> _minHeap;

    public MedianFinder() {
        // C# PriorityQueue is Min-Heap by default; invert priority for Max-Heap
        _maxHeap = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
        _minHeap = new PriorityQueue<int, int>();
    }

    public void AddNum(int num) {
        // Step 1: Push to maxHeap first
        _maxHeap.Enqueue(num, num);

        // Step 2: Satisfy Value Invariant: maxHeap top must be <= minHeap top
        int maxVal = _maxHeap.Dequeue();
        _minHeap.Enqueue(maxVal, maxVal);

        // Step 3: Satisfy Balance Invariant: maxHeap.Count >= minHeap.Count
        if (_minHeap.Count > _maxHeap.Count) {
            int minVal = _minHeap.Dequeue();
            _maxHeap.Enqueue(minVal, minVal);
        }
    }

    public double FindMedian() {
        if (_maxHeap.Count > _minHeap.Count) {
            return _maxHeap.Peek();
        }
        return (_maxHeap.Peek() + _minHeap.Peek()) / 2.0;
    }
}
```

#### 3. Complexity Analysis
- **Time Complexity:**
  - `AddNum(num)`: $O(\log N)$ time to maintain the heap invariants.
  - `FindMedian()`: Strictly $O(1)$ time by inspecting the roots of both heaps.
- **Space Complexity:** $O(N)$ auxiliary heap memory for storing $N$ numbers.

---

## 5. ⚡ HARDWARE & SYSTEMS CONNECTIONS

### 5.1 CPU Cache Locality: Array Binary Heap vs. Red-Black Tree

```
PriorityQueue<T> (Array Binary Heap):
Indices:   0     1     2     3     4     5     6
        ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
Values: │  1  │  3  │  2  │  7  │  8  │  4  │  5  │
        └─────┴─────┴─────┴─────┴─────┴─────┴─────┘
• Contiguous memory allocation.
• Children of index i are located at 2*i + 1 and 2*i + 2.
• CPU hardware prefetcher detects linear parent-to-child memory strides.

SortedSet<T> / SortedDictionary<K, V> (Red-Black BST):
          [ Node 1 ] (32 Bytes heap alloc)
           /      \
      [ Node 2 ]  [ Node 3 ]
• Every node is an independent heap object with 3 pointers (Left, Right, Parent) + Color byte.
• Traversal causes random pointer chasing across non-contiguous heap memory pages.
• L1 cache miss rate is significantly higher (> 35% vs < 5% for array heaps).
```

### 5.2 Real-World Systems Applications
1. **Discrete Event Simulation (DES):** Network packet simulators (e.g. ns-3) maintain an event priority queue ordered by timestamp. Events fire chronologically; new events are scheduled into the future dynamically.
2. **Database Query Planners:** Cost-based optimizers (e.g., PostgreSQL GEQO) use priority queues to explore join orders, pruning higher-cost execution plans.
3. **Audio Mixing Engines:** Digital Audio Workstations (DAWs) use priority queues to schedule MIDI note events with sub-millisecond precision.

---

## 6. ⚠️ DAILY ERROR LOG & COMMON TRAPS

### Trap 1: Attempting 1D Two-Pointer Traversal on 2D Grids
- **The Mistake:** Trying to scan 2D Trapping Rain Water row-by-row or column-by-column using 1D logic.
- **The Failure:** Water does not stay within rows or columns. It flows diagonally and around obstacles through winding paths. Row-wise scanning underestimates leaks and overestimates trapped water.
- **The Fix:** Water trapped in 2D is a **minimax path graph problem**. Always use boundary Min-Heap BFS.

### Trap 2: Incorrect Tie-Breaking in Skyline Sweep-Line Events
- **The Mistake:** Not distinguishing between two Start events vs. two End events vs. a Start and End event at the same $x$-coordinate.
- **The Failure:** If an End event is processed before a Start event at the same coordinate $x$, the skyline drops to $0$ momentarily, generating false vertical spikes in the output.
- **The Fix:** Strictly adhere to the 3 tie-breaking rules: Start before End; among Starts, higher first; among Ends, lower first.

### Trap 3: Forgetting to Update `waterLevel = Math.Max(waterLevel, current.Height)`
- **The Mistake:** Using raw `current.Height` without tracking the running maximum boundary elevation.
- **The Failure:** If a low cell is dequeued, it could mistakenly allow subsequent inner cells to trap negative water.
- **The Fix:** Maintain a running `waterLevel` and push `Math.Max(neighborHeight, waterLevel)` into the heap.

### Trap 4: Marking Cells Visited on Dequeue in LeetCode 407
- **The Mistake:** Marking `visited[nr, nc] = true` after popping from `minHeap`.
- **The Failure:** Multiple boundary cells discover the same interior cell, inserting duplicate entries into the heap. Memory and runtime explode!
- **The Fix:** Mark `visited[nr, nc] = true` **immediately before** or during `minHeap.Enqueue(...)`.

---

## 7. 🎯 DAILY CHECKPOINT & SELF-ASSESSMENT

### 1. Conceptual Verification
1. Why does [LeetCode 42] (1D Trapping Rain Water) run in $O(N)$ time with two pointers, while [LeetCode 407] (2D Trapping Rain Water) requires $O(M \cdot N \log(M \cdot N))$ with a Priority Queue?
2. In the Skyline Problem, why must a Start event be processed *before* an End event when they share the exact same $x$-coordinate?
3. What is the fundamental property of an element's lifespan that determines whether a Monotonic Deque ($O(N)$) or a Priority Queue ($O(N \log K)$) must be used?
4. In [LeetCode 295] (Find Median from Data Stream), why are two heaps needed rather than a single heap? Explain how the Value Invariant and Balance Invariant guarantee exact median retrieval in $O(1)$ time.

### 2. Implementation Audit
- In your implementation of `TrapRainWater`, verify that you pass `Math.Max(neighborHeight, waterLevel)` when enqueueing neighbors into the Min-Heap. Why is this necessary?
- In `MedianFinder`, why does passing incoming elements through `_maxHeap` first before balancing to `_minHeap` guarantee that no inverted order occurs?

---
*Next Module: **Week 9 — Day 62: Week 9 Integration, Custom Design & Timed Practice (LeetCode 341, 621)***
