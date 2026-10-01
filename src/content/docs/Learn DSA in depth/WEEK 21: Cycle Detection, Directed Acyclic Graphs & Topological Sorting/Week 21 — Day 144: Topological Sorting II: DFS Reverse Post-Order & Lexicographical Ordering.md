---
title: "Week 21 — Day 144: Topological Sorting II: DFS Reverse Post-Order & Lexicographical Ordering"
---

# Week 21 — Day 144: Topological Sorting II: DFS Reverse Post-Order & Lexicographical Ordering

Welcome to **Day 144 of your DSA Mastery Journey**!

Yesterday, on Day 143, you learned how Kahn's algorithm resolves dependencies iteratively using an in-degree zero BFS wavefront. You saw how decrementing prerequisite counts mirrors the execution of real-world build tools.

Today, we dive into the second classical approach to topological sorting: **DFS Reverse Post-Order (Tarjan's formulation)**.

Why do we need a DFS approach if Kahn's algorithm already works?
1. **Algorithmic Duality:** DFS finish timestamps provide deep topological properties that form the theoretical foundation of **Kosaraju's and Tarjan's Strongly Connected Components (SCC)** algorithms (Week 23).
2. **Reverse Post-Order Invariant:** When a vertex has no further outgoing edges to explore, it is mathematically guaranteed that all its downstream descendants have already finished. Therefore, prepending completed vertices onto a linked list or pushing them onto a stack yields a valid topological order.
3. **Lexicographical Constraints:** What happens when an interview problem requires you to find the *lexicographically smallest* topological ordering? We will explore how priority queues (`PriorityQueue<int, int>` / Min-Heaps) interface with topological sorting.
4. **Leaf Trimming on Trees:** You will discover how topological in-degree peeling can be creatively inverted to find graph centroids in **[LeetCode 310] Minimum Height Trees**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   DAY 144: DFS REVERSE POST-ORDER & LEXICOGRAPHICAL ORDERING                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       DFS FINISH-TIME THEOREM     │                             │    PRIORITY TOPOLOGICAL SORTING   │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • In a DAG, if edge (u -> v) exists│                            │ • In Kahn's algorithm, multiple   │
│   then: fin[u] > fin[v]!          │                             │   nodes may have in-degree == 0.  │
│ • A node finishes DFS only AFTER  │ ─── Lexicographical Order ─►│ • Replace standard FIFO Queue with│
│   all its descendants finish!     │                             │   a Binary Min-Heap (PriorityQ).  │
│ • Reverse Post-Order = Pop stack  │                             │ • Always pick the smallest index  │
│   ==> VALID TOPOLOGICAL SORT!     │                             │   available at each decision step!│
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CANONICAL PROBLEM MASTERY           │
                          ├─────────────────────────────────────────────┤
                          │ • [LC 310] Minimum Height Trees (Leaf Peel) │
                          │ • [LC 1136] Parallel Courses (Semesters DP) │
                          │ • From-Scratch: DfsTopologicalSorter        │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🥞 The Visual Mental Model: Subroutine Call Stacks & Inverted Finished Tasks

Before looking at mathematical finish-time inequalities, picture how nested software functions execute on a CPU:

```
              🥞 SUBROUTINE CALL HIERARCHY & REVERSE POST-ORDER

   Imagine 3 nested function calls:
   • Main() requires PrepareData()
   • PrepareData() requires FetchFromDisk()

   Execution Timeline on CPU:
   1. Enter Main()                 ── disc[Main] = 1
   2.   Enter PrepareData()        ── disc[PrepareData] = 2
   3.     Enter FetchFromDisk()    ── disc[FetchFromDisk] = 3
   4.     Exit FetchFromDisk()     ── fin[FetchFromDisk] = 4 (FINISHES FIRST!)
   5.   Exit PrepareData()         ── fin[PrepareData] = 5   (FINISHES SECOND!)
   6. Exit Main()                  ── fin[Main] = 6          (FINISHES LAST!)

   NOTICE THE REVERSAL:
   • The deepest leaf dependency (FetchFromDisk) ALWAYS finishes first!
   • The top-level master caller (Main) ALWAYS finishes last!
   
   If you record tasks in POST-ORDER (as they finish):
      [ FetchFromDisk, PrepareData, Main ]  <=== Deepest dependency first!
      
   REVERSE THAT SEQUENCE (or push onto a Stack as each finishes):
      [ Main, PrepareData, FetchFromDisk ]  <=== PERFECT TOPOLOGICAL ORDER!
```

---

### 1.2 🖼️ Visual Gallery: Reverse Post-Order Stack & Min-Heap Tie-Breaking

#### 1. Visualizing the DFS Finish-Stack:

```
        (0) ──► (1)
         │       │          DFS Traversal & Finish Sequence:
         ▼       ▼          1. DFS(0) -> DFS(1) -> DFS(2).
        (3) ◄── (2)         2. Node 3 has no outgoing edges -> fin[3] (Pushed to Stack!).
                            3. Node 2 has no more exits     -> fin[2] (Pushed to Stack!).
                            4. Node 1 has no more exits     -> fin[1] (Pushed to Stack!).
                            5. Node 0 has no more exits     -> fin[0] (Pushed to Stack!).

   LIFO Stack (Pushed upon Finish):
   ┌───────────┐
   │  Node 0   │ ◄── TOP (Popped 1st: 0)
   ├───────────┤
   │  Node 1   │ ◄── (Popped 2nd: 1)
   ├───────────┤
   │  Node 2   │ ◄── (Popped 3rd: 2)
   ├───────────┤
   │  Node 3   │ ◄── (Popped 4th: 3)
   └───────────┘
   Result: [ 0, 1, 2, 3 ] (Optimal Topological Order!)
```

#### 2. Lexicographical Tie-Breaking: Kahn's with Min-Heap
When multiple valid topological orderings exist and you must pick the **alphabetically or numerically smallest**:

```
      (2) ──► (4)        At Step 0, two independent tasks have inDegree == 0:
                         Node 2 and Node 3!
      (3) ──► (5)
      
   • With standard FIFO Queue: might dequeue [3, 2, ...] or [2, 3, ...] arbitrarily.
   • With PriorityQueue (Min-Heap):
     PriorityQueue: [ 2, 3 ]
     PeekMin() ALWAYS selects Node 2 first!
     Guarantees lexicographically strictly minimal output!
```

---

### 1.3 🏛️ Memory Layout: Output Array Populated Right-to-Left

Instead of allocating an extra `Stack<int>` object or reversing a list, high-performance engines write directly into a pre-allocated flat array from right to left:

```
   Pre-allocated Output Buffer (Length = 4, tailIndex starts at 3):
   
   Initial:     [   ?   ][   ?   ][   ?   ][   ?   ]   tailIndex = 3
   Push 3:      [   ?   ][   ?   ][   ?   ][   3   ]   tailIndex = 2
   Push 2:      [   ?   ][   ?   ][   2   ][   3   ]   tailIndex = 1
   Push 1:      [   ?   ][   1   ][   2   ][   3   ]   tailIndex = 0
   Push 0:      [   0   ][   1   ][   2   ][   3   ]   tailIndex = -1 (Done!)
   
   Zero intermediate allocations! Result is ready in sequential cache-friendly memory!
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Finish-Time Theorem:* In any Directed Acyclic Graph $G = (V, E)$, for every directed edge $(u, v) \in E$, the DFS finish time of $u$ is strictly greater than the DFS finish time of $v$:
    $$\text{fin}[u] > \text{fin}[v]$$
  - *Reverse Post-Order Definition:* A post-order DFS traversal records a vertex immediately after all its outgoing edges have been explored (upon return from the recursive call). Reversing this post-order sequence (e.g., prepending to a linked list or pushing to an explicit stack) produces a valid topological sort.
  - *Cycle Safety Requirement:* If the graph is not guaranteed to be acyclic, standard reverse post-order DFS will output an invalid ordering! Thus, a **3-color state machine** (White/Gray/Black from Day 141) must be integrated into the DFS to detect cycles before emitting the order.
  - *Lexicographical Topological Order:* When multiple valid topological orderings exist, the unique ordering that is lexicographically smallest is obtained by always selecting the available vertex with the minimum index. This cannot be solved via DFS easily; it requires Kahn's algorithm equipped with a **Binary Min-Heap**.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Structural Insights:* DFS post-order numbers provide the exact topological ordering needed for compiler AST reductions, dataflow reachability, and Strongly Connected Component decomposition.
  - *Simplicity in Functional Pipelines:* In languages with recursion and immutable linked lists, prepending completed vertices during DFS backtracking avoids allocating large intermediate queue structures.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose DFS Reverse Post-Order:*
    - When integrating topological sorting directly into an existing recursive DFS pass.
    - When computing component dependencies in Tarjan's SCC algorithm.
  - *When to Choose Kahn's with Min-Heap:*
    - When the problem explicitly states: *"Return the lexicographically smallest topological sort"* or *"Tie-break smaller numbered tasks first"*.
  - *Failure Modes:*
    - Deep call stacks: If $|V| > 100,000$ in languages like C# or Python without tail-call optimization, recursive DFS will crash with a `StackOverflowException`. Use Kahn's algorithm or an explicit heap-allocated stack for very deep DAGs.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Array Memory:* A `byte[] visited` (or `color[]`) array of size $V$, an adjacency list array, and an output buffer `int[] result` populated from right-to-left (index $V - 1$ down to $0$).
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To perform topological sorting via DFS, I rely on the Finish-Time Theorem: in any DAG, for every directed edge $u \to v$, $u$ finishes strictly after $v$ because $u$ cannot complete until all its descendants have returned. Therefore, reversing the DFS post-order finish sequence guarantees that all prerequisites appear before their dependents. I pair this with a 3-color state machine to guard against cycles. If an interview requires the lexicographically smallest order, I switch to Kahn's algorithm and replace the FIFO queue with a Binary Min-Heap."
- **6. HOW (Complexity & Invariants):**
  - *DFS Reverse Post-Order:* Time: $\Theta(V + E)$; Space: $\Theta(V)$ stack space.
  - *Lexicographical Kahn's with Min-Heap:* Time: $O(V \log V + E \log V)$; Space: $O(V)$.

---

### 1.5 Mathematical Proof of the Finish-Time Theorem

Why does reversing the DFS post-order finish time guarantee a valid topological order?

> [!IMPORTANT]
> **Theorem:**
> Let $G = (V, E)$ be a directed acyclic graph. If $(u, v) \in E$, then in any DFS traversal of $G$, $\text{fin}[u] > \text{fin}[v]$.

#### Rigorous Proof:
Consider the moment when the DFS traversal explores the directed edge $(u, v)$. At this instant, vertex $u$ is active on the recursion stack ($\text{Color}[u] = \text{GRAY}$). For vertex $v$, exactly one of three states must hold:

1. **Case 1: $v$ is WHITE (undiscovered):**
   - Since $v$ is White, DFS immediately makes a recursive call to `Dfs(v)`.
   - Vertex $v$ becomes a descendant of $u$ in the DFS search tree.
   - By the Parenthesis Theorem of DFS, all descendants of $v$ must finish before $v$ finishes, and $v$ must finish before $u$ backtracks:
     $$\text{disc}[u] < \text{disc}[v] < \text{fin}[v] < \text{fin}[u]$$
   - Thus, $\text{fin}[u] > \text{fin}[v]$.

2. **Case 2: $v$ is BLACK (already fully explored):**
   - Vertex $v$ and all of its descendants have already completed their DFS traversal and backtracked.
   - Therefore, its finish timestamp $\text{fin}[v]$ has already been recorded in the past.
   - Meanwhile, vertex $u$ is still currently active on the stack and has not yet finished.
   - Therefore:
     $$\text{fin}[v] < \text{fin}[u]$$
   - Thus, $\text{fin}[u] > \text{fin}[v]$.

3. **Case 3: $v$ is GRAY (currently active on the stack):**
   - If $v$ were Gray, $v$ would be an active ancestor of $u$ on the call stack ($v \rightsquigarrow u$).
   - But we are currently examining the edge $(u, v)$, which means there is a direct edge $u \to v$.
   - The path $v \rightsquigarrow u \to v$ would constitute a **directed cycle**.
   - However, by premise, $G$ is a **DAG** (Acyclic).
   - Therefore, Case 3 is **impossible** in a DAG!

#### Conclusion:
In all possible valid cases in a DAG, $\text{fin}[u] > \text{fin}[v]$.

Because every prerequisite $u$ finishes **after** its dependent $v$, sorting vertices by descending order of finish time ($\text{fin}[u] \downarrow$) places every prerequisite before its dependents. This is identical to **reversing the DFS post-order traversal sequence**. $\blacksquare$

---

### 1.2 Lexicographically Smallest Topological Sort

Often, interview problems ask for:
*"If multiple topological orderings exist, return the one that is lexicographically smallest."*

```
Example:
Edges: [ 0 -> 2 ], [ 1 -> 2 ]
Both 0 and 1 have in-degree 0.

Valid Topological Orders:
1) [ 0, 1, 2 ]
2) [ 1, 0, 2 ]

Lexicographically Smallest: [ 0, 1, 2 ] because index 0 < index 1.
```

#### Why DFS Cannot Guarantee Lexicographical Order:
In DFS, when you visit node 0, it recursively rushes down the branch all the way to node 2 and marks 2 complete. Even if you sort outgoing edges, DFS is a depth-first commitment: it cannot pause to explore unrelated source node 1 before finishing node 2!

#### The Solution: Kahn's Algorithm + Binary Min-Heap (`PriorityQueue<int, int>`)
By replacing the standard FIFO `Queue<int>` in Kahn's algorithm with a **Min-Heap**, at every step when multiple vertices have an in-degree of 0, the heap greedily extracts the vertex with the smallest numerical label!

```
Wavefront with Min-Heap:
       [ Min-Heap ]
       ┌──────────┐
       │   0, 1   │  ──► ExtractMin() yields 0!
       └──────────┘
```

---

## 2. 💻 IMPLEMENT: Production C# Container

The following container implements both:
1. `DfsTopologicalSorter`: 3-Color DFS Reverse Post-Order with cycle detection.
2. `LexicographicalTopologicalSorter`: Kahn's algorithm powered by a binary min-heap (`PriorityQueue<int, int>`).

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedDSA.GraphFundamentals
{
    /// <summary>
    /// Implements DFS Reverse Post-Order Topological Sorting with integrated
    /// 3-color state machine cycle detection, alongside Lexicographical Topological Sorting.
    /// </summary>
    public sealed class DfsTopologicalSorter
    {
        private const byte White = 0; // Unvisited
        private const byte Gray = 1;  // Active on current recursion stack (ancestor)
        private const byte Black = 2; // Finished and fully explored

        /// <summary>
        /// Computes topological sort using DFS Reverse Post-Order.
        /// </summary>
        /// <param name="numVertices">Total number of vertices.</param>
        /// <param name="edges">Directed edges [u, v] where u -> v.</param>
        /// <param name="topologicalOrder">Resulting topological order if DAG.</param>
        /// <returns>True if DAG; false if directed cycle detected.</returns>
        public static bool TryTopologicalSortDfs(int numVertices, int[][] edges, out int[] topologicalOrder)
        {
            if (numVertices == 0)
            {
                topologicalOrder = Array.Empty<int>();
                return true;
            }

            // 1. Build Adjacency List
            List<int>[] adj = new List<int>[numVertices];
            for (int i = 0; i < numVertices; i++)
            {
                adj[i] = new List<int>();
            }

            foreach (var edge in edges)
            {
                adj[edge[0]].Add(edge[1]);
            }

            byte[] color = new byte[numVertices];
            int[] order = new int[numVertices];
            int writeIndex = numVertices - 1; // Populate from right to left (reverse post-order)

            for (int i = 0; i < numVertices; i++)
            {
                if (color[i] == White)
                {
                    if (!Dfs(i, adj, color, order, ref writeIndex))
                    {
                        topologicalOrder = Array.Empty<int>();
                        return false; // Cycle detected!
                    }
                }
            }

            topologicalOrder = order;
            return true;
        }

        private static bool Dfs(int u, List<int>[] adj, byte[] color, int[] order, ref int writeIndex)
        {
            color[u] = Gray; // Mark active on recursion stack

            foreach (int v in adj[u])
            {
                if (color[v] == Gray)
                {
                    return false; // Back edge found -> Cycle!
                }

                if (color[v] == White)
                {
                    if (!Dfs(v, adj, color, order, ref writeIndex))
                    {
                        return false;
                    }
                }
            }

            color[u] = Black; // Post-order: all descendants finished
            order[writeIndex--] = u; // Prepend to reverse post-order result
            return true;
        }

        /// <summary>
        /// Computes the unique LEXICOGRAPHICALLY SMALLEST topological order using
        /// Kahn's algorithm augmented with a Binary Min-Heap (PriorityQueue).
        /// </summary>
        public static bool TryLexicographicalSort(int numVertices, int[][] edges, out int[] order)
        {
            List<int>[] adj = new List<int>[numVertices];
            for (int i = 0; i < numVertices; i++)
            {
                adj[i] = new List<int>();
            }

            int[] inDegree = new int[numVertices];
            foreach (var edge in edges)
            {
                adj[edge[0]].Add(edge[1]);
                inDegree[edge[1]]++;
            }

            // Min-Heap: key is node index, priority is also node index
            PriorityQueue<int, int> minHeap = new PriorityQueue<int, int>();
            for (int i = 0; i < numVertices; i++)
            {
                if (inDegree[i] == 0)
                {
                    minHeap.Enqueue(i, i);
                }
            }

            int[] result = new int[numVertices];
            int processed = 0;

            while (minHeap.Count > 0)
            {
                int u = minHeap.Dequeue();
                result[processed++] = u;

                foreach (int v in adj[u])
                {
                    inDegree[v]--;
                    if (inDegree[v] == 0)
                    {
                        minHeap.Enqueue(v, v);
                    }
                }
            }

            if (processed == numVertices)
            {
                order = result;
                return true;
            }

            order = Array.Empty<int>();
            return false;
        }

        /// <summary>
        /// Test suite validating DFS topological sort and Lexicographical min-heap ordering.
        /// </summary>
        public static void RunTests()
        {
            Console.WriteLine("Running DfsTopologicalSorter Test Suite...");

            // Test 1: Simple DAG
            int[][] edges1 = new int[][]
            {
                new int[] { 5, 2 },
                new int[] { 5, 0 },
                new int[] { 4, 0 },
                new int[] { 4, 1 },
                new int[] { 2, 3 },
                new int[] { 3, 1 }
            };
            bool ok1 = TryTopologicalSortDfs(6, edges1, out int[] order1);
            Debug.Assert(ok1, "Test 1 Failed: Graph is a DAG.");
            ValidateTopologicalOrder(6, edges1, order1);

            // Test 2: Cycle Detection
            int[][] edges2 = new int[][]
            {
                new int[] { 0, 1 },
                new int[] { 1, 2 },
                new int[] { 2, 0 }
            };
            bool ok2 = TryTopologicalSortDfs(3, edges2, out _);
            Debug.Assert(!ok2, "Test 2 Failed: Cycle must be caught by Gray node detection.");

            // Test 3: Lexicographical Ordering Verification
            // Both 0 and 1 point to 2. Sources are 0 and 1.
            // Valid topological orders: [0, 1, 2] and [1, 0, 2].
            // Lexicographically smallest MUST be [0, 1, 2].
            int[][] edges3 = new int[][]
            {
                new int[] { 1, 2 },
                new int[] { 0, 2 }
            };
            bool ok3 = TryLexicographicalSort(3, edges3, out int[] lexOrder);
            Debug.Assert(ok3, "Test 3 Failed: Lexicographical sort failed.");
            Debug.Assert(lexOrder[0] == 0 && lexOrder[1] == 1 && lexOrder[2] == 2, 
                $"Test 3 Lexicographical Order Mismatch: Got [{string.Join(",", lexOrder)}]");

            Console.WriteLine("All DfsTopologicalSorter tests PASSED successfully!");
        }

        private static void ValidateTopologicalOrder(int n, int[][] edges, int[] order)
        {
            int[] position = new int[n];
            for (int i = 0; i < order.Length; i++)
            {
                position[order[i]] = i;
            }

            foreach (var edge in edges)
            {
                int u = edge[0];
                int v = edge[1];
                Debug.Assert(position[u] < position[v], 
                    $"Topological Invariant Violated: {u} should appear before {v}.");
            }
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Systems & Complexity Analysis

### 3.1 Complexity Comparison

| Algorithm | Time Complexity | Auxiliary Space | Call Stack Risk | Lexicographical Support |
| :--- | :--- | :--- | :--- | :--- |
| **Kahn's BFS Wavefront** | $\Theta(V + E)$ | $\Theta(V)$ | **None (Heap/Queue)** | No (FIFO order) |
| **DFS Reverse Post-Order** | $\Theta(V + E)$ | $\Theta(V)$ | **High ($O(V)$ stack)** | No |
| **Kahn's + Min-Heap** | $\mathbf{O((V + E) \log V)}$ | $\Theta(V)$ | **None** | **Yes (Optimal)** |

---

## 4. 🧩 APPLY: Canonical Problem Walkthroughs

### 4.1 [LeetCode 310] Minimum Height Trees (Medium)

#### Problem Description
A tree is an undirected graph in which any two vertices are connected by exactly one path. In other words, any connected graph without simple cycles is a tree. Given a tree of `n` nodes labelled from `0` to `n - 1`, and an array of `n - 1` `edges`, you can choose any node to be the root.

Return a list of all **Minimum Height Trees (MHTs)**' root labels (the centers of the tree).

#### Architectural Intuition: Topological In-Degree Peeling
- A tree has at most **two centroids** (centers).
- Instead of running BFS from every node ($O(V^2)$), observe the leaf nodes:
  - Any node with $\text{degree} = 1$ is an outermost leaf.
  - A centroid can never be an outermost leaf (unless $n \le 2$).
  - Therefore, we can apply **Kahn's In-Degree Peeling in reverse**: peel off all leaves simultaneously round by round, until only 1 or 2 central nodes remain!

```csharp
public class Solution
{
    public IList<int> FindMinHeightTrees(int n, int[][] edges)
    {
        if (n <= 2)
        {
            var initial = new List<int>();
            for (int i = 0; i < n; i++) initial.Add(i);
            return initial;
        }

        // Build undirected graph degree table
        List<int>[] adj = new List<int>[n];
        for (int i = 0; i < n; i++) adj[i] = new List<int>();
        int[] degree = new int[n];

        foreach (var edge in edges)
        {
            int u = edge[0];
            int v = edge[1];
            adj[u].Add(v);
            adj[v].Add(u);
            degree[u]++;
            degree[v]++;
        }

        // Collect all initial leaves (degree == 1)
        Queue<int> leaves = new Queue<int>();
        for (int i = 0; i < n; i++)
        {
            if (degree[i] == 1)
            {
                leaves.Enqueue(i);
            }
        }

        int remainingNodes = n;

        // Peel leaves inward until at most 2 centroids remain
        while (remainingNodes > 2)
        {
            int leafCount = leaves.Count;
            remainingNodes -= leafCount;

            for (int i = 0; i < leafCount; i++)
            {
                int leaf = leaves.Dequeue();

                foreach (int neighbor in adj[leaf])
                {
                    degree[neighbor]--;
                    if (degree[neighbor] == 1)
                    {
                        leaves.Enqueue(neighbor);
                    }
                }
            }
        }

        return leaves.ToList();
    }
}
```

---

### 4.2 [LeetCode 1136] Parallel Courses (Medium)

#### Problem Description
You are given an integer `n` indicating that there are `n` courses labeled from `1` to `n`. You are also given an array `relations` where `relations[i] = [prevCourse, nextCourse]`. In one semester, you can take any number of courses as long as you have taken all the prerequisites in previous semesters. Return the *minimum number of semesters* needed to take all courses. If it is impossible, return `-1`.

#### Architectural Intuition
This is the canonical **DAG Critical Path / Longest Path** problem. In Kahn's algorithm, all nodes with in-degree 0 in the current BFS layer can be taken simultaneously in the current semester. The number of BFS layers required to empty the graph is the answer!

```csharp
public class Solution
{
    public int MinimumSemesters(int n, int[][] relations)
    {
        List<int>[] graph = new List<int>[n + 1];
        for (int i = 1; i <= n; i++) graph[i] = new List<int>();
        int[] inDegree = new int[n + 1];

        foreach (var rel in relations)
        {
            int prev = rel[0];
            int next = rel[1];
            graph[prev].Add(next);
            inDegree[next]++;
        }

        Queue<int> queue = new Queue<int>();
        for (int i = 1; i <= n; i++)
        {
            if (inDegree[i] == 0)
            {
                queue.Enqueue(i);
            }
        }

        int semesters = 0;
        int completedCourses = 0;

        while (queue.Count > 0)
        {
            int layerSize = queue.Count;
            semesters++; // Advance semester wave

            for (int i = 0; i < layerSize; i++)
            {
                int course = queue.Dequeue();
                completedCourses++;

                foreach (int next in graph[course])
                {
                    inDegree[next]--;
                    if (inDegree[next] == 0)
                    {
                        queue.Enqueue(next);
                    }
                }
            }
        }

        // If completedCourses < n, a prerequisite cycle exists
        return completedCourses == n ? semesters : -1;
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 310] Minimum Height Trees (Medium):**
   - Implement the leaf peeling algorithm and verify that it correctly terminates on both even and odd diameter trees.

2. **[LeetCode 1136] Parallel Courses (Medium):**
   - Implement the level-by-level semester wavefront.

3. **Lexicographical Tie-Breaking Lab:**
   - Solve HackerRank "Topological Sorting: Lexicographically Smallest" by plugging `PriorityQueue<int, int>` into Kahn's algorithm.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Topological Algorithm Selection:

                       ┌───────────────────────────────────────────────┐
                       │          TOPOLOGICAL SORTING CRITERIA         │
                       └───────────────────────────────────────────────┘
                                               │
             ┌─────────────────────────────────┼─────────────────────────────────┐
             ▼                                 ▼                                 ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐  ┌─────────────────────────────┐
│    KAHN'S FIFO WAVEFRONT    │  │    DFS REVERSE POST-ORDER   │  │     KAHN'S + MIN-HEAP       │
├─────────────────────────────┤  ├─────────────────────────────┤  ├─────────────────────────────┤
│ • Level-by-level parallel   │  │ • Recursive graph passes.   │  │ • Lexicographically        │
│   scheduling (semesters).   │  │ • Precursor to Tarjan/      │  │   smallest order required.  │
│ • Safe on deep graphs.      │  │   Kosaraju SCC.             │  │ • Priority scheduling.      │
│ • Leaf peeling (LC 310).    │  │ • Must guard with 3-colors. │  │ • O((V + E) log V) time.    │
└─────────────────────────────┘  └─────────────────────────────┘  └─────────────────────────────┘
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
Prove that in a DAG, if there is a directed edge $u \to v$, then the finish time of $u$ is strictly greater than the finish time of $v$ in a DFS traversal.

### Architectural Model Answer
1. **The Invariant of DFS Finish Timestamps:**
   - In DFS, $\text{fin}[x]$ denotes the logical clock tick at which the exploration of vertex $x$ and all vertices reachable from $x$ along the current DFS tree has completely terminated.

2. **Analysis of the Directed Edge $(u, v)$:**
   - Consider the instant during DFS when the edge $(u, v)$ is traversed from vertex $u$. At this moment, $u$ has been discovered ($\text{disc}[u]$ has occurred) and is actively executing on the call stack ($\text{Color}[u] = \text{GRAY}$).
   - Vertex $v$ can be in one of three states:
     - **White (Undiscovered):** DFS immediately descends into $v$. Vertex $v$ and its entire reachable subgraph are fully explored before DFS can return to $u$. By the nested Parenthesis Theorem:
       $$\text{disc}[u] < \text{disc}[v] < \text{fin}[v] < \text{fin}[u]$$
       Thus, $\text{fin}[u] > \text{fin}[v]$.
     - **Black (Fully Explored):** Vertex $v$ has already completed its DFS traversal and backtracked in an earlier branch. Therefore, $\text{fin}[v]$ was assigned prior to the current time, whereas $u$ has not yet finished.
       $$\text{fin}[v] < \text{fin}[u]$$
       Thus, $\text{fin}[u] > \text{fin}[v]$.
     - **Gray (Active on Call Stack):** If $v$ were Gray, $v$ would be an active ancestor of $u$. The presence of edge $(u, v)$ would complete a directed cycle ($v \rightsquigarrow u \to v$). But the graph is given to be a **DAG** (Acyclic), making this state mathematically impossible.

3. **Conclusion:**
   - Because Case 3 is impossible in a DAG, in every possible traversal case:
     $$\text{fin}[u] > \text{fin}[v]$$
   - Therefore, ordering vertices by decreasing finish time ($\text{fin}[x] \downarrow$) guarantees that $u$ precedes $v$ for every directed edge $(u, v)$. Reversing DFS post-order traversal yields a valid topological sort.
