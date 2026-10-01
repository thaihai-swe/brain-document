---
title: "Week 23 — Day 156: Bidirectional BFS: Frontier Shrinkage (O(b^(d/2)) vs O(b^d)) & Meet-in-the-Middle Search"
---

# Week 23 — Day 156: Bidirectional BFS: Frontier Shrinkage (O(b^(d/2)) vs O(b^d)) & Meet-in-the-Middle Search

Welcome to **Day 156 of your DSA Mastery Journey**!

Yesterday, on Day 155, you learned to abstract combinatorial puzzles into implicit state graphs and traversed them using standard Breadth-First Search. However, in deep search spaces with high branching factors (e.g., word mutations, Rubik's cubes, 15-puzzles), standard single-directional BFS rapidly hits the **Exponential Wall of Combinatorial Explosion**: exploring a tree of depth $d$ with branching factor $b$ requires visiting $\approx \Theta(b^d)$ states.

Today, you will shatter this exponential bottleneck using **Bidirectional BFS (Meet-in-the-Middle Graph Search)**:
- Instead of expanding a single cone of depth $d$ containing $b^d$ leaves, we expand **two simultaneous half-cones**—one forward from `start` and one backward from `target`—each to depth $d/2$.
- The combined search space shrinks to $2 \times b^{d/2}$, reducing the number of states visited by several orders of magnitude (often from hundreds of millions of states down to tens of thousands!).
- By coupling this with the **Frontier Swapping Optimization** (always expanding the smaller frontier set), we guarantee maximum efficiency and zero redundant exploration.

Today, you will master:
1. **The Mathematical Foundations of Bidirectional BFS:** Proving frontier shrinkage from $O(b^d)$ to $O(b^{d/2})$ and formalizing the intersection rendezvous condition.
2. **The Frontier-Swapping Primitive:** Maintaining two hash sets (`forwardSet`, `backwardSet`) and swapping references dynamically to expand from the smaller boundary.
3. **From-Scratch Container:** Building `BidirectionalBfsSearcher<TState>` with path recovery and bidirectional meeting point extraction.
4. **Canonical Problem Mastery:** Solving the notorious **[LeetCode 126] Word Ladder II** (combining Bidirectional BFS for minimal distance mapping with DFS backtracking on the generated DAG).

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             DAY 156: BIDIRECTIONAL BFS & FRONTIER SHRINKAGE                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│     THE EXPONENTIAL FRONTIER GAP   │                             │    THE FRONTIER-SWAP ALGORITHM    │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Unidirectional BFS:             │                             │ • Maintain forward & backward sets│
│   Frontier = b^d.                 │ ── Meet-In-Middle Bridge ──►│ • If forward.Count > backward.Count:│
│ • Bidirectional BFS:              │                             │     Swap(ref forward, ref backward)│
│   Frontier = 2 * b^(d/2).         │                             │ • Expand smallest frontier next.  │
│ • Example (b=10, d=8):            │                             │ • Stop immediately when frontiers │
│   10^8 (100M) -> 2 * 10^4 (20k)!  │                             │   intersect on a common node!     │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CANONICAL PROBLEM MASTERY           │
                          ├─────────────────────────────────────────────┤
                          │ • [LC 126] Word Ladder II (Hard)            │
                          │ • Bidirectional BFS + DFS Backtracking DAG  │
                          │ • From-Scratch: BidirectionalBfsSearcher    │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🌐 The Visual Mental Model: Two Expanding Search Cones

Visualize standard BFS versus Bidirectional BFS as flashlights in a dark forest:

```
    SINGLE-DIRECTIONAL BFS: ONE MASSIVE CONE           BIDIRECTIONAL BFS: TWO COMPACT CONES
    
               [ START ]                                     [ START ]
                   │                                             │
                  / \                                           / \
                 /   \                                         /   \  Depth d/2
                /     \                                       /     \
               /       \                                     ▼=======▼  RENDEZVOUS!
              /         \  Depth d                           ▲=======▲  Frontiers Intersect!
             /           \                                    \     /
            /             \                                    \   /  Depth d/2
           /               \                                    \ /
          /                 \                                    │
         ▼===================▼                               [ TARGET ]
              [ TARGET ]
              
      Leaves: b^d states!                             Total Leaves: 2 * b^(d/2) states!
      If b = 10, d = 6:                               If b = 10, d = 6:
      Nodes = 1,000,000 states                        Nodes = 2 * 10^3 = 2,000 states
      ===> 500x MEMORY & CPU REDUCTION!               ===> INSTANT CONVERGENCE!
```

---

### 1.2 🖼️ Visual Gallery: The Frontier Swapping State Machine

To prevent one frontier from runaway expansion into an unstructured dense cluster, we always expand the set with fewer nodes:

```
                      THE DYNAMIC FRONTIER-SWAPPING TECHNIQUE

    Step 1:
    Forward Frontier:  { "hit" }                     (Size = 1)  <--- Smaller! Expand Forward.
    Backward Frontier: { "cog" }                     (Size = 1)

    Step 2:
    Forward Frontier:  { "hot" }                     (Size = 1)  <--- Smaller! Expand Forward.
    Backward Frontier: { "cog" }                     (Size = 1)

    Step 3:
    Forward Frontier:  { "dot", "lot" }              (Size = 2)  
    Backward Frontier: { "cog" }                     (Size = 1)  <--- Smaller! SWAP & Expand Backward!
    
    After Swap:
    Active Frontier:   { "cog" }                     (Size = 1)  
    Target Frontier:   { "dot", "lot" }              (Size = 2)
    Neighbors of "cog" include: { "dog", "log" }
    
    Step 4:
    Active Frontier:   { "dog", "log" }              (Size = 2)
    Target Frontier:   { "dot", "lot" }              (Size = 2)
    Neighbors of "dog" include "dot"!
    ===> INTERSECTION DETECTED: "dot" exists in Target Frontier!
    ===> PATH FOUND! Total steps = 4!
```

---

### 1.3 5W1H Executive Architecture Blueprint: Bidirectional BFS

| Dimension | Architectural Specification |
| :--- | :--- |
| **1. WHAT** | **Bidirectional Breadth-First Search** is a graph traversal algorithm that runs two simultaneous BFS wavefronts: one forward from the source vertex $s$ and one backward from the target vertex $t$, terminating as soon as the two frontiers intersect. |
| **2. WHY** | Eliminates the exponential growth of search frontiers. Reduces state space complexity from $\Theta(b^d)$ to $\Theta(b^{d/2})$, transforming intractable search problems into sub-millisecond computations. |
| **3. WHEN** | The source $s$ and destination $t$ are both known upfront, edges are undirected or easily reversible, edge weights are uniform ($1$), and the branching factor $b \ge 2$. |
| **4. WHERE** | Memory resides in two frontier hash sets (`HashSet<TState> beginSet`, `HashSet<TState> endSet`) and a global or dual visited set (`visitedBegin`, `visitedEnd`). |
| **5. WHO** | Used in high-performance routing engines (Google Maps highway hierarchy search), automated puzzle solvers, automated planning, and Big Tech interview problems with tight time limits. |
| **6. HOW** | Initialize `beginSet = {start}`, `endSet = {target}`. In each step: pick the smaller set, generate next-level neighbors, check if any neighbor $\in$ opposite set; if yes, terminate; else swap and continue. |

---

### 1.4 ⚙️ Core Operations 5-Dimension Deep-Dive

#### Core Operation: Frontier Swapping & Intersection Detection
- **Dimension 1 (Contract & Complexity):** Advance the search frontier by exactly one distance layer. Time complexity: $O(|S_{min}| \cdot b)$ where $|S_{min}|$ is the size of the smaller active frontier. Space complexity: $O(|S_{begin}| + |S_{end}|)$.
- **Dimension 2 (Step-by-Step Logic):**
  1. Compare frontier sizes:
     `if (beginSet.Count > endSet.Count) Swap(ref beginSet, ref endSet);`
  2. Instantiate a fresh `nextLevel = new HashSet<TState>()`.
  3. Mark all states in `beginSet` as visited in `visited` to avoid self-loops.
  4. For each state $u \in beginSet$:
     - For each legal neighbor $v \in \text{Neighbors}(u)$:
       - **Intersection Check:** If $v \in endSet$, the frontiers have collided! Return `distance + 1`.
       - If $v \notin visited$, add $v$ to `nextLevel`.
  5. Replace active frontier: `beginSet = nextLevel`.
  6. Increment `distance++`. If `beginSet.Count == 0`, source and target lie in disconnected components; return $-1$.
- **Dimension 3 (Visual State Transition):**
  ```
  Collision Point Topology:
  
  [Start] ──> ... ──> [u] ─────────► [v] <───────── [w] <── ... <── [Target]
                     (In beginSet)   (In endSet)
  
  When u generates neighbor v, and v is already in endSet:
  Distance = depth(Forward) + depth(Backward) + 1.
  The shortest path is proven closed!
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Frontier Separation Invariant:* At distance layer $k$, all nodes in `beginSet` have shortest path distance $d_s$ from $start$, and all nodes in `endSet` have distance $d_t$ from $target$. When a neighbor $v$ of `beginSet` is found in `endSet`, the total path length is $d_s + 1 + d_t$. Because BFS expands monotonically level by level, no path shorter than $d_s + 1 + d_t$ can exist.
- **Dimension 5 (Edge Case Matrix):**
  - $start == target$: Return 0 immediately.
  - No path exists: The smaller frontier eventually produces an empty `nextLevel`; algorithm cleanly terminates returning -1 or 0.
  - Asymmetric branching factor: If $b_{forward} \gg b_{backward}$, frontier swapping automatically forces search to proceed from the backward direction, dynamically balancing work.

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Container(s)

Below is the standalone C# implementation of **`BidirectionalBfsSearcher<TState>`** supporting frontier swapping, symmetric/asymmetric transitions, and full path reconstruction.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedGraph.ImplicitStates
{
    /// <summary>
    /// Contract defining a reversible state transition model.
    /// </summary>
    public interface IReversibleGraphModel<TState> where TState : notnull, IEquatable<TState>
    {
        IEnumerable<TState> GetForwardNeighbors(TState state);
        IEnumerable<TState> GetBackwardNeighbors(TState state);
        bool IsDeadend(TState state);
    }

    /// <summary>
    /// Production-grade Bidirectional BFS search engine with dynamic frontier swapping.
    /// Reduces combinatorial search complexity from O(b^d) to O(b^(d/2)).
    /// </summary>
    public class BidirectionalBfsSearcher<TState> where TState : notnull, IEquatable<TState>
    {
        private readonly IReversibleGraphModel<TState> _model;

        public BidirectionalBfsSearcher(IReversibleGraphModel<TState> model)
        {
            _model = model ?? throw new ArgumentNullException(nameof(model));
        }

        /// <summary>
        /// Finds the minimum edge transitions between start and target.
        /// Returns -1 if no path exists.
        /// </summary>
        public int FindShortestDistance(TState start, TState target)
        {
            if (_model.IsDeadend(start) || _model.IsDeadend(target))
                return -1;

            if (start.Equals(target))
                return 0;

            var forwardSet = new HashSet<TState> { start };
            var backwardSet = new HashSet<TState> { target };
            var visited = new HashSet<TState> { start, target };

            int distance = 0;
            bool isForward = true;

            while (forwardSet.Count > 0 && backwardSet.Count > 0)
            {
                // Dynamic Frontier Swapping: always expand smaller set
                if (forwardSet.Count > backwardSet.Count)
                {
                    var tempSet = forwardSet;
                    forwardSet = backwardSet;
                    backwardSet = tempSet;
                    isForward = !isForward;
                }

                var nextLevel = new HashSet<TState>();
                distance++;

                foreach (TState curr in forwardSet)
                {
                    IEnumerable<TState> neighbors = isForward
                        ? _model.GetForwardNeighbors(curr)
                        : _model.GetBackwardNeighbors(curr);

                    foreach (TState neighbor in neighbors)
                    {
                        if (_model.IsDeadend(neighbor))
                            continue;

                        // Collision detected!
                        if (backwardSet.Contains(neighbor))
                            return distance;

                        if (visited.Add(neighbor))
                        {
                            nextLevel.Add(neighbor);
                        }
                    }
                }

                forwardSet = nextLevel;
            }

            return -1; // Disconnected
        }

        /// <summary>
        /// Reconstructs the complete shortest path between start and target.
        /// </summary>
        public List<TState>? FindShortestPath(TState start, TState target)
        {
            if (_model.IsDeadend(start) || _model.IsDeadend(target))
                return null;

            if (start.Equals(target))
                return new List<TState> { start };

            var forwardParents = new Dictionary<TState, TState>();
            var backwardParents = new Dictionary<TState, TState>();

            var forwardSet = new HashSet<TState> { start };
            var backwardSet = new HashSet<TState> { target };

            forwardParents[start] = default!;
            backwardParents[target] = default!;

            TState meetingNode = default!;
            bool connected = false;
            bool isForward = true;

            while (forwardSet.Count > 0 && backwardSet.Count > 0 && !connected)
            {
                if (forwardSet.Count > backwardSet.Count)
                {
                    var tempSet = forwardSet;
                    forwardSet = backwardSet;
                    backwardSet = tempSet;
                    isForward = !isForward;
                }

                var nextLevel = new HashSet<TState>();

                foreach (TState curr in forwardSet)
                {
                    IEnumerable<TState> neighbors = isForward
                        ? _model.GetForwardNeighbors(curr)
                        : _model.GetBackwardNeighbors(curr);

                    foreach (TState next in neighbors)
                    {
                        if (_model.IsDeadend(next))
                            continue;

                        if (backwardSet.Contains(next))
                        {
                            meetingNode = next;
                            if (isForward)
                            {
                                forwardParents[next] = curr;
                            }
                            else
                            {
                                backwardParents[next] = curr;
                            }
                            connected = true;
                            break;
                        }

                        var parents = isForward ? forwardParents : backwardParents;
                        if (!parents.ContainsKey(next))
                        {
                            parents[next] = curr;
                            nextLevel.Add(next);
                        }
                    }

                    if (connected) break;
                }

                forwardSet = nextLevel;
            }

            if (!connected)
                return null;

            // Splice path together at meetingNode
            var path = new List<TState>();

            // Forward half: start -> meetingNode
            var forwardHalf = new List<TState>();
            TState currF = meetingNode;
            while (currF != null && !currF.Equals(default!) && forwardParents.ContainsKey(currF))
            {
                forwardHalf.Add(currF);
                if (currF.Equals(start)) break;
                currF = forwardParents[currF];
            }
            forwardHalf.Reverse();
            path.AddRange(forwardHalf);

            // Backward half: meetingNode -> target
            TState currB = backwardParents.ContainsKey(meetingNode) ? backwardParents[meetingNode] : default!;
            while (currB != null && !currB.Equals(default!) && backwardParents.ContainsKey(currB))
            {
                path.Add(currB);
                if (currB.Equals(target)) break;
                currB = backwardParents[currB];
            }

            return path;
        }
    }

    /// <summary>
    /// Verification test suite.
    /// </summary>
    public static class BidirectionalBfsTests
    {
        private class UndirectedGraphModel : IReversibleGraphModel<int>
        {
            private readonly Dictionary<int, List<int>> _adj = new();

            public void AddEdge(int u, int v)
            {
                if (!_adj.ContainsKey(u)) _adj[u] = new List<int>();
                if (!_adj.ContainsKey(v)) _adj[v] = new List<int>();
                _adj[u].Add(v);
                _adj[v].Add(u);
            }

            public IEnumerable<int> GetForwardNeighbors(int state) => _adj.TryGetValue(state, out var list) ? list : Array.Empty<int>();
            public IEnumerable<int> GetBackwardNeighbors(int state) => GetForwardNeighbors(state);
            public bool IsDeadend(int state) => false;
        }

        public static void RunTests()
        {
            var graph = new UndirectedGraphModel();
            // Path: 1 - 2 - 3 - 4 - 5 - 6
            graph.AddEdge(1, 2);
            graph.AddEdge(2, 3);
            graph.AddEdge(3, 4);
            graph.AddEdge(4, 5);
            graph.AddEdge(5, 6);

            var searcher = new BidirectionalBfsSearcher<int>(graph);
            int dist = searcher.FindShortestDistance(1, 6);
            Debug.Assert(dist == 5, $"Expected distance 5, got {dist}");

            var path = searcher.FindShortestPath(1, 6);
            Debug.Assert(path != null && path.Count == 6, "Expected path of length 6");
            Debug.Assert(path[0] == 1 && path[^1] == 6, "Path endpoints must match");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### 3.1 Mathematical Frontier Shrinkage Derivation

Let $b$ be the uniform branching factor and $d$ be the shortest path distance between source and target:

1. **Unidirectional BFS Work:**
   $$W_{\text{uni}} = \sum_{i=0}^d b^i = \frac{b^{d+1} - 1}{b - 1} \approx b^d$$
2. **Bidirectional BFS Work:**
   - Both forward and backward frontiers expand to depth $\lfloor d/2 \rfloor$ and $\lceil d/2 \rceil$:
   $$W_{\text{bi}} = \sum_{i=0}^{\lfloor d/2 \rfloor} b^i + \sum_{j=0}^{\lceil d/2 \rceil} b^j \approx 2 \cdot b^{d/2}$$
3. **Speedup Ratio:**
   $$\text{Speedup} = \frac{W_{\text{uni}}}{W_{\text{bi}}} \approx \frac{b^d}{2 \cdot b^{d/2}} = \frac{1}{2} b^{d/2}$$
   - When $b = 16$ and $d = 8$:
     - $W_{\text{uni}} \approx 16^8 \approx 4.29 \times 10^9$ states.
     - $W_{\text{bi}} \approx 2 \times 16^4 = 2 \times 65,536 = 1.31 \times 10^5$ states.
     - **Speedup $\approx 32,768\times$!**

---

### 3.2 Systems & Cache Analysis

- **Memory Allocation Profile:**
  - Standard BFS requires a single `Queue<T>` storing the largest layer ($b^d$ states). For deep trees, this causes catastrophic GC pressure and `OutOfMemoryException`.
  - Bidirectional BFS stores only $b^{d/2}$ states in RAM at any moment. In C# .NET, a frontier of $50,000$ strings easily resides in Gen 0 / Gen 1 nursery collections without triggering Gen 2 Large Object Heap (LOH) fragmentation.
- **Hash Table Probing vs Set Swapping:**
  - Bidirectional BFS relies on $O(1)$ lookup: `backwardSet.Contains(neighbor)`.
  - Always expanding the smaller set ensures that the amortized number of hash queries is strictly minimized.

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### 4.1 [LeetCode 126] Word Ladder II (Hard)

- **Problem:** Given `beginWord`, `endWord`, and `wordList`, return **all** shortest transformation sequences from `beginWord` to `endWord`.
- **Optimal Architecture:**
  1. Use **Bidirectional BFS** to build a directional Directed Acyclic Graph (DAG) containing only shortest-path edges (`parentMap: child -> List<parents>`), stopping as soon as the level containing `endWord` finishes.
  2. Use **DFS Backtracking** on the DAG to reconstruct all valid paths from `endWord` back to `beginWord`.

```csharp
public class WordLadderIISolver
{
    public IList<IList<string>> FindLadders(string beginWord, string endWord, IList<string> wordList)
    {
        var wordSet = new HashSet<string>(wordList);
        var results = new List<IList<string>>();
        if (!wordSet.Contains(endWord))
            return results;

        wordSet.Remove(beginWord);

        // DAG adjacency: child -> list of parents that reach it in minimum steps
        var parents = new Dictionary<string, List<string>>();

        var forward = new HashSet<string> { beginWord };
        var backward = new HashSet<string> { endWord };

        bool found = false;
        bool isForward = true;

        while (forward.Count > 0 && !found)
        {
            if (forward.Count > backward.Count)
            {
                var temp = forward;
                forward = backward;
                backward = temp;
                isForward = !isForward;
            }

            // Remove current frontier from wordSet so future levels cannot loop back
            foreach (string w in forward)
                wordSet.Remove(w);

            var nextLevel = new HashSet<string>();

            foreach (string word in forward)
            {
                char[] chars = word.ToCharArray();
                for (int i = 0; i < chars.Length; i++)
                {
                    char orig = chars[i];
                    for (char c = 'a'; c <= 'z'; c++)
                    {
                        if (c == orig) continue;
                        chars[i] = c;
                        string neighbor = new string(chars);

                        if (backward.Contains(neighbor))
                        {
                            found = true;
                            AddEdge(parents, word, neighbor, isForward);
                        }
                        else if (!found && wordSet.Contains(neighbor))
                        {
                            nextLevel.Add(neighbor);
                            AddEdge(parents, word, neighbor, isForward);
                        }
                    }
                    chars[i] = orig;
                }
            }

            forward = nextLevel;
        }

        if (found)
        {
            var path = new List<string> { endWord };
            DfsBuildPaths(endWord, beginWord, parents, path, results);
        }

        return results;
    }

    private void AddEdge(Dictionary<string, List<string>> parents, string u, string v, bool isForward)
    {
        string parent = isForward ? u : v;
        string child = isForward ? v : u;

        if (!parents.TryGetValue(child, out var list))
        {
            list = new List<string>();
            parents[child] = list;
        }
        list.Add(parent);
    }

    private void DfsBuildPaths(string curr, string target, Dictionary<string, List<string>> parents,
                               List<string> path, List<IList<string>> results)
    {
        if (curr == target)
        {
            var fullPath = new List<string>(path);
            fullPath.Reverse();
            results.Add(fullPath);
            return;
        }

        if (!parents.TryGetValue(curr, out var parentList))
            return;

        foreach (string parent in parentList)
        {
            path.Add(parent);
            DfsBuildPaths(parent, target, parents, path, results);
            path.RemoveAt(path.Count - 1); // Backtrack
        }
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Open the Lock with Bidirectional BFS ([LeetCode 752] - Medium)
- **Task:** Rewrite Day 155's lock solver using Bidirectional BFS with frontier swapping.
- **Verification:** Measure execution time difference: standard BFS visits up to 10,000 states; Bidirectional BFS stops in $< 200$ checks!

### Exercise 2: Jump Game IV ([LeetCode 1345] - Hard)
- **Constraint:** Array of integers where transitions are $i \pm 1$ or jumping to any index $j$ where `arr[j] == arr[i]`.
- **Hint:** Use Bidirectional BFS from index 0 and index $N-1$. Clear the value-index bucket after first visit to avoid $O(N^2)$ edge traversals!

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
                   WHEN TO UPGRADE FROM BFS TO BIDIRECTIONAL BFS

       Do you know BOTH the start state and the target state explicitly?
                            /                  \
                          YES                   NO (e.g. "Find ANY node matching P")
                          /                      \
      Is search depth d > 5?            [Standard Single-Direction BFS]
             /               \
           YES                NO
           /                   \
   Is branching b >= 4?    [Standard Single-Direction BFS]
         /           \
       YES            NO
       /               \
[Bidirectional BFS]  [Standard BFS]
(Guaranteed win!)
```

---

## 7. 🎯 Daily Checkpoint Questions

### Diagnostic Question
Why does Bidirectional BFS reduce the search space from $O(b^d)$ to $O(b^{d/2})$, and how do you detect when the forward and backward frontiers meet without corrupting path directionality?

### Architectural Model Answer
1. **Mathematical Space Reduction:**
   - In a search tree with uniform branching factor $b$, each level grows by a factor of $b$. Standard BFS must explore the full depth $d$, generating $b^d$ states at the leaf layer.
   - Bidirectional BFS simultaneously expands from both endpoints. Each search tree only needs to reach depth $d/2$ before the frontiers collide:
     $$\text{Total States} = b^{d/2} (\text{Forward}) + b^{d/2} (\text{Backward}) = 2 \cdot b^{d/2}$$
   - For $b = 10, d = 8$: $10^8 = 100,000,000$ states collapses to $2 \times 10^4 = 20,000$ states.
2. **Intersection Detection & Directionality Preservation:**
   - To detect collision: In each step, when expanding the active frontier (say `forwardSet`), inspect each generated neighbor $v$. If $v$ already exists inside `backwardSet`, an intersection has occurred!
   - Directionality is preserved by maintaining a boolean flag (`isForward`) during frontier swaps. When an edge $(u, v)$ is discovered:
     - If `isForward == true`: $u$ is the parent and $v$ is the child ($u \to v$).
     - If `isForward == false`: $v$ is the parent and $u$ is the child ($v \to u$).
   - This ensures the reconstructed path always flows unidirectionally from $start \to target$.
