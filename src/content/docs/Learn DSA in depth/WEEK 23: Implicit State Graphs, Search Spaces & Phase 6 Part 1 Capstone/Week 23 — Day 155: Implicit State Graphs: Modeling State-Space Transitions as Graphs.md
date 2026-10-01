---
title: "Week 23 — Day 155: Implicit State Graphs: Modeling State-Space Transitions as Graphs"
---

# Week 23 — Day 155: Implicit State Graphs: Modeling State-Space Transitions as Graphs

Welcome to **Day 155 of your DSA Mastery Journey**!

Throughout Weeks 20 to 22, you mastered graph representations where vertices and edges are explicitly materialized in memory—as adjacency lists, adjacency matrices, or flat CSR buffers. You investigated cycle detection, DAG dependency scheduling, connected component partitioning, bipartite testing, Euler tours, and planarity.

Today, we launch the final, capstone week of Phase 6 Part 1: **WEEK 23: Implicit State Graphs, Search Spaces & Phase 6 Part 1 Capstone**.

In real-world problem solving and senior technical interviews, graphs rarely arrive pre-packaged as `List<int>[] adj`. Instead, they present as **combinatorial search spaces**, word puzzles, mechanical locks, robotic path planners, or game state trees. The graph exists *implicitly*:
- A **Vertex** is an arbitrary configuration or state of the universe (e.g. a 4-letter word `"hit"`, or a lock combination `(0, 0, 0, 0)`).
- An **Edge** is a legal atomic transition or move (e.g. changing one letter to another valid dictionary word, or rotating one dial by $\pm 1$).
- The graph is far too astronomical to materialize in RAM upfront; it is generated lazily, on the fly, as the search frontier expands.

Today, you will master:
1. **The Implicit State-Space Abstraction:** Formulating combinatorial puzzles as unweighted digraphs and deriving asymptotic bounds from state cardinality $|V|$ and branching factor $b$.
2. **On-The-Fly Neighbor Generation:** Eliminating $O(N)$ scanning bottlenecks using intermediate wildcard buckets (`"h*t"`).
3. **From-Scratch Implicit BFS Engine:** Building `ImplicitStateBfsEngine<TState>` with generic transition models and predecessor path reconstruction.
4. **Canonical Problem Mastery:** Conquering **[LeetCode 127] Word Ladder** and **[LeetCode 752] Open the Lock**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            DAY 155: IMPLICIT STATE-SPACE GRAPHS & BFS                            │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│     THE IMPLICIT GRAPH ABSTRACTION │                             │    OPTIMAL NEIGHBOR GENERATION    │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Vertex = Discrete State (s).    │                             │ • Naive: Check all N words.       │
│ • Edge = Legal Move s -> s'.      │ ── Combinatorial Bridge ──► │   Cost: O(N * L) per state -> TLE!│
│ • State Space: |V| = b^d.         │                             │ • Optimal: Wildcard Buckets       │
│ • Lazy evaluation on the fly!     │                             │   "d*g" -> [dog, dig, dug].       │
│ • Shortest path = BFS wavefront.  │                             │ • Branching factor: 26 * L.       │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CANONICAL PROBLEM MASTERY           │
                          ├─────────────────────────────────────────────┤
                          │ • [LC 127] Word Ladder (Hard)               │
                          │ • [LC 752] Open the Lock (Medium)           │
                          │ • From-Scratch: ImplicitStateBfsEngine      │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🗝️ The Visual Mental Model: The Combination Lock & The Word Web

Before writing a single line of queue logic, visualize how physical objects create graph topologies:

```
                  THE 4-DIAL COMBINATION LOCK AS AN IMPLICIT GRAPH

      Every dial has digits 0 through 9 arranged in a circular ring buffer:
      
                 ┌───┐ ┌───┐ ┌───┐ ┌───┐
                 │ 0 │ │ 0 │ │ 0 │ │ 0 │  <=== State: "0000" (Start Vertex)
                 └───┘ └───┘ └───┘ └───┘
      
      At any instant, what are the legal moves?
      You can rotate any of the 4 dials forward (+1) or backward (-1):
      
         Dial 0: +1 -> "1000", -1 -> "9000"
         Dial 1: +1 -> "0100", -1 -> "0900"
         Dial 2: +1 -> "0010", -1 -> "0090"
         Dial 3: +1 -> "0001", -1 -> "0009"
      
      THEREFORE:
      • Total Vertices |V| = 10 * 10 * 10 * 10 = 10,000 states (all combinations).
      • Branching Factor b = 4 dials * 2 directions = exactly 8 outgoing edges per node.
      • Total Edges |E| = (10,000 * 8) / 2 = 40,000 undirected edges.
      • Deadends = Vertices with their incident edges severed (barriers).
      
      THE QUESTION: "What is the minimum turns to reach target T without hitting deadends?"
      TRANSLATES DIRECTLY TO:
      "Find the shortest unweighted path from '0000' to T in an implicit 8-regular graph!"
```

---

### 1.2 🖼️ Visual Gallery: The Word Ladder Transformation Graph

Consider finding the shortest mutation sequence from `"hit"` to `"cog"` using word list `["hot", "dot", "dog", "lot", "log", "cog"]`:

```
                       WORD LADDER BFS LAYER WAVEFRONT

        Level 0:                         [ "hit" ]
                                             │  (change 'i' -> 'o')
                                             ▼
        Level 1:                         [ "hot" ]
                                        /         \
                      (change 'h'->'d')/           \(change 'h'->'l')
                                      ▼             ▼
        Level 2:                 [ "dot" ]       [ "lot" ]
                                     │               │
                      (change 't'->'g')             (change 't'->'g')
                                     ▼               ▼
        Level 3:                 [ "dog" ]       [ "log" ]
                                        \         /
                      (change 'd'->'c')  \       / (change 'l'->'c')
                                          ▼     ▼
        Level 4:                         [ "cog" ]  <=== TARGET REACHED!
                                                        Shortest Length = 5 words!

   INVARIANT: BFS guarantees that when "cog" is first popped or queued at Level 4,
   NO SHORTER SEQUENCE OF MUTATIONS CAN POSSIBLY EXIST!
```

---

### 1.3 5W1H Executive Architecture Blueprint: Implicit State Graphs

| Dimension | Architectural Specification |
| :--- | :--- |
| **1. WHAT** | An **Implicit Graph** is a tuple $(S, \mathcal{T}, s_0, \mathcal{G})$ where $S$ is the state universe, $\mathcal{T}: S \to \mathcal{P}(S)$ is the dynamic transition function generating outgoing edges, $s_0$ is the start state, and $\mathcal{G} \subseteq S$ is the goal predicate. |
| **2. WHY** | Avoids the catastrophic memory footprint of allocating astronomical graphs upfront. Enables exploring only the connected component reachable from the start state $s_0$. |
| **3. WHEN** | Puzzle solving, minimum transformations, string mutations, shortest reachability under game rules, automated theorem proving, robotics navigation. |
| **4. WHERE** | Memory resides primarily in the **Queue** (frontier states) and the **Visited Set** (`HashSet<TState>` to prevent cycles and redundant work). |
| **5. WHO** | Candidate identifies problem as an implicit graph, formalizes state space size ($|V|$) and branching factor ($b$), and justifies BFS for unweighted minimum-step optimality. |
| **6. HOW** | Run standard FIFO queue BFS; evaluate legal neighbors lazily on each dequeued state; check against visited hash set before enqueuing. |

---

### 1.4 ⚙️ Core Operations 5-Dimension Deep-Dive

#### Core Operation: Intermediate Wildcard Pattern Bucketing for Neighbor Discovery
- **Dimension 1 (Contract & Complexity):** Given a vocabulary $W$ of $N$ words each of length $L$, generate all valid 1-edit neighbors of a query word $w$ in $O(L^2)$ time rather than $O(N \cdot L)$ naive string scans. Space complexity: $O(N \cdot L^2)$ to store the pattern dictionary.
- **Dimension 2 (Step-by-Step Logic):**
  1. For each word $w \in W$, generate $L$ wildcard patterns by replacing the $i$-th character with `'*'`:
     - Example: `"hot"` yields `"*ot"`, `"h*t"`, `"ho*"`.
  2. Map each wildcard pattern to a list of matching words in a lookup dictionary:
     `Dictionary<string, List<string>> patternMap`.
  3. To find all neighbors of active state $u$:
     - Generate the $L$ wildcard patterns for $u$.
     - Retrieve the union of word lists associated with each pattern.
     - Any word $v$ sharing a pattern with $u$ (where $v \ne u$) differs by exactly 1 character!
- **Dimension 3 (Visual State Transition):**
  ```
  Pattern Map Construction:
  "hot" -> *ot: [hot],  h*t: [hot],  ho*: [hot]
  "dot" -> *ot: [hot, dot], d*t: [dot], do*: [dot]
  "lot" -> *ot: [hot, dot, lot], l*t: [lot], lo*: [lot]

  Querying Neighbors of "hot":
  Patterns: "*ot", "h*t", "ho*"
  Lookup "*ot" -> { "hot", "dot", "lot" }
  Filter out self ("hot") -> Neighbors = { "dot", "lot" }
  Time: O(L) hash lookups instead of scanning all N=5000 words!
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  Two words $u, v \in \Sigma^L$ differ by Hamming distance 1 if and only if there exists some index $k \in [0, L-1]$ such that $u[i] = v[i]$ for all $i \ne k$, and $u[k] \ne v[k]$. By replacing index $k$ with `'*'`, both words produce an identical wildcard string $p = u[0..k-1] + '*' + u[k+1..L-1]$. Thus, bucket membership is both necessary and sufficient for 1-edit adjacency.
- **Dimension 5 (Edge Case Matrix):**
  - $L=1$: Wildcard is `'*'`; all 1-letter words in dictionary form a complete graph $K_N$.
  - Target word not in dictionary: Terminate immediately with return value 0.
  - Disconnected component: Queue empties before reaching target; returns 0 safely.

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Container(s)

Below is the production-grade C# implementation of the generic **`ImplicitStateBfsEngine<TState>`** supporting customizable transition models, visited state tracking, and predecessor path reconstruction.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedGraph.ImplicitStates
{
    /// <summary>
    /// Contract defining an implicit state transition model.
    /// </summary>
    /// <typeparam name="TState">The discrete state representation.</typeparam>
    public interface IImplicitGraphModel<TState> where TState : notnull, IEquatable<TState>
    {
        /// <summary>
        /// Generates all valid, unconstrained neighbor states reachable in one atomic step.
        /// </summary>
        IEnumerable<TState> GetNeighbors(TState state);

        /// <summary>
        /// Determines whether a state is an impassable deadend/obstacle.
        /// </summary>
        bool IsDeadend(TState state);
    }

    /// <summary>
    /// Production-grade generic BFS engine for implicit state spaces.
    /// Guarantees discovery of the shortest transition path in unweighted state graphs.
    /// </summary>
    public class ImplicitStateBfsEngine<TState> where TState : notnull, IEquatable<TState>
    {
        private readonly IImplicitGraphModel<TState> _model;

        public ImplicitStateBfsEngine(IImplicitGraphModel<TState> model)
        {
            _model = model ?? throw new ArgumentNullException(nameof(model));
        }

        /// <summary>
        /// Computes the minimum number of transitions from start to target.
        /// Returns -1 if target is unreachable.
        /// </summary>
        public int FindShortestPathLength(TState start, TState target)
        {
            if (_model.IsDeadend(start) || _model.IsDeadend(target))
                return -1;

            if (start.Equals(target))
                return 0;

            var queue = new Queue<TState>();
            var visited = new HashSet<TState>();

            queue.Enqueue(start);
            visited.Add(start);

            int distance = 0;

            while (queue.Count > 0)
            {
                int levelSize = queue.Count;
                distance++;

                for (int i = 0; i < levelSize; i++)
                {
                    TState current = queue.Dequeue();

                    foreach (TState next in _model.GetNeighbors(current))
                    {
                        if (next.Equals(target))
                            return distance;

                        if (!_model.IsDeadend(next) && visited.Add(next))
                        {
                            queue.Enqueue(next);
                        }
                    }
                }
            }

            return -1; // Unreachable
        }

        /// <summary>
        /// Reconstructs the exact sequence of states forming the shortest path.
        /// </summary>
        public List<TState>? FindShortestPath(TState start, TState target)
        {
            if (_model.IsDeadend(start) || _model.IsDeadend(target))
                return null;

            var queue = new Queue<TState>();
            var visited = new HashSet<TState>();
            var parent = new Dictionary<TState, TState>();

            queue.Enqueue(start);
            visited.Add(start);

            bool found = false;

            if (start.Equals(target))
                return new List<TState> { start };

            while (queue.Count > 0 && !found)
            {
                TState current = queue.Dequeue();

                foreach (TState next in _model.GetNeighbors(current))
                {
                    if (_model.IsDeadend(next) || visited.Contains(next))
                        continue;

                    visited.Add(next);
                    parent[next] = current;

                    if (next.Equals(target))
                    {
                        found = true;
                        break;
                    }

                    queue.Enqueue(next);
                }
            }

            if (!found)
                return null;

            // Reconstruct path backward from target to start
            var path = new List<TState>();
            TState curr = target;
            while (!curr.Equals(start))
            {
                path.Add(curr);
                curr = parent[curr];
            }
            path.Add(start);
            path.Reverse();

            return path;
        }
    }

    /// <summary>
    /// Unit test verification suite for ImplicitStateBfsEngine.
    /// </summary>
    public static class ImplicitStateBfsEngineTests
    {
        private class SimpleNumberLineModel : IImplicitGraphModel<int>
        {
            private readonly HashSet<int> _deadends;
            public SimpleNumberLineModel(IEnumerable<int> deadends) => _deadends = new HashSet<int>(deadends);

            public IEnumerable<int> GetNeighbors(int state)
            {
                yield return state - 1;
                yield return state + 1;
            }

            public bool IsDeadend(int state) => _deadends.Contains(state);
        }

        public static void RunTests()
        {
            // Test 1: Direct path on number line from 0 to 3
            var model = new SimpleNumberLineModel(Array.Empty<int>());
            var engine = new ImplicitStateBfsEngine<int>(model);
            int dist = engine.FindShortestPathLength(0, 3);
            Debug.Assert(dist == 3, $"Expected 3, got {dist}");

            // Test 2: Deadend blocking direct path, forcing detours or failure
            var blockedModel = new SimpleNumberLineModel(new[] { 1 });
            var blockedEngine = new ImplicitStateBfsEngine<int>(blockedModel);
            var path = blockedEngine.FindShortestPath(0, 2);
            // On a 1D line with 1 blocked, 0 cannot reach 2 without passing 1
            Debug.Assert(path == null, "Path should be null when blocked on 1D line");

            // Test 3: Start equals target
            Debug.Assert(engine.FindShortestPathLength(5, 5) == 0, "Distance to self must be 0");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### 3.1 Asymptotic Time & Space Derivations

In an implicit graph, complexity is derived from the **branching factor** $b$ (maximum outgoing edges from any state) and the **search depth** $d$ (shortest path distance to target):

1. **State Space Tree Size:**
   $$\text{States Visited} = 1 + b + b^2 + b^3 + \dots + b^d = \frac{b^{d+1} - 1}{b - 1} = \Theta(b^d)$$
2. **Word Ladder Complexity Derivation:**
   - Let $N$ be the number of words in the dictionary, and $L$ be the word length.
   - Using intermediate pattern maps:
     - Building the pattern map: $N$ words, each producing $L$ patterns $\implies O(N \cdot L^2)$ string operations.
     - BFS traversal: Each word visited at most once. Generating its $L$ patterns takes $O(L^2)$ time. Across all $N$ words, neighbor retrieval takes $O(N \cdot L^2)$.
     - **Total Time Complexity:** $\mathbf{O(N \cdot L^2)}$.
     - **Total Space Complexity:** $\mathbf{O(N \cdot L^2)}$ to store the pattern dictionary and hash sets.

3. **Open the Lock Complexity Derivation:**
   - Number of states $|V| = 10^4 = 10,000$.
   - Outgoing edges per state $b = 4 \times 2 = 8$. Total edges $|E| = 40,000$.
   - BFS visits each state at most once and explores each edge once.
   - **Total Time Complexity:** $\mathbf{O(10^4 \times 8) = O(1)}$ (constant bounded by 10,000 states).
   - **Total Space Complexity:** $\mathbf{O(10^4) = O(1)}$ visited array slots.

---

### 3.2 Systems & Runtime Trade-off Matrix

| Metric | Explicit Graph Representation | Implicit State Graph (Standard BFS) | Implicit State Graph (Bidirectional BFS) |
| :--- | :--- | :--- | :--- |
| **Memory Allocation** | Pre-allocates $O(V + E)$ nodes/edges | Allocates only frontier $O(b^d)$ and visited set | Allocates reduced dual frontiers $O(b^{d/2})$ |
| **Setup Cost** | Heavy initial parsing phase | Zero setup (pure lazy evaluation) | Zero setup |
| **Search Space Frontier** | Explores entire reachable component | Expands full forward cone: $b^d$ nodes | Expands two half cones: $2 \cdot b^{d/2}$ nodes |
| **Cache Locality** | High if stored in CSR array | Moderate (heap allocations in `Queue<T>` and `HashSet<T>`) | Moderate |
| **Best Used When** | Graph is static, small, or queried multiple times | Large combinatorial state space with known start and target | Deep state graphs with high branching factor $b$ |

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### 4.1 [LeetCode 127] Word Ladder (Hard)

- **Problem:** Given two words `beginWord` and `endWord`, and a dictionary `wordList`, return the number of words in the shortest transformation sequence from `beginWord` to `endWord`, or 0 if no such sequence exists. Every adjacent pair must differ by exactly 1 character.
- **Optimal C# Implementation:**

```csharp
public class WordLadderSolver
{
    public int LadderLength(string beginWord, string endWord, IList<string> wordList)
    {
        var wordSet = new HashSet<string>(wordList);
        if (!wordSet.Contains(endWord))
            return 0;

        int L = beginWord.Length;

        // Step 1: Pre-process intermediate wildcard patterns: O(N * L^2)
        var comboMap = new Dictionary<string, List<string>>();
        foreach (string word in wordSet)
        {
            for (int i = 0; i < L; i++)
            {
                string pattern = word.Substring(0, i) + '*' + word.Substring(i + 1);
                if (!comboMap.TryGetValue(pattern, out var list))
                {
                    list = new List<string>();
                    comboMap[pattern] = list;
                }
                list.Add(word);
            }
        }

        // Step 2: Queue BFS from beginWord
        var queue = new Queue<string>();
        var visited = new HashSet<string>();

        queue.Enqueue(beginWord);
        visited.Add(beginWord);

        int level = 1;

        while (queue.Count > 0)
        {
            int size = queue.Count;
            level++;

            for (int k = 0; k < size; k++)
            {
                string curr = queue.Dequeue();

                for (int i = 0; i < L; i++)
                {
                    string pattern = curr.Substring(0, i) + '*' + curr.Substring(i + 1);
                    if (!comboMap.TryGetValue(pattern, out var neighbors))
                        continue;

                    foreach (string neighbor in neighbors)
                    {
                        if (neighbor == endWord)
                            return level;

                        if (visited.Add(neighbor))
                        {
                            queue.Enqueue(neighbor);
                        }
                    }
                }
            }
        }

        return 0;
    }
}
```

---

### 4.2 [LeetCode 752] Open the Lock (Medium)

- **Problem:** A 4-dial lock starts at `"0000"`. Each move rotates one wheel 1 slot forward or backward. Given a list of `deadends` and a `target`, return the minimum total number of turns to open the lock, or -1 if impossible.
- **Optimal C# Implementation:**

```csharp
public class OpenLockSolver
{
    public int OpenLock(string[] deadends, string target)
    {
        var deadSet = new HashSet<string>(deadends);
        if (deadSet.Contains("0000") || deadSet.Contains(target))
            return -1;

        if (target == "0000")
            return 0;

        var visited = new HashSet<string> { "0000" };
        var queue = new Queue<string>();
        queue.Enqueue("0000");

        int turns = 0;

        while (queue.Count > 0)
        {
            int levelCount = queue.Count;
            turns++;

            for (int k = 0; k < levelCount; k++)
            {
                string curr = queue.Dequeue();

                // Generate all 8 neighbors (4 dials * 2 directions)
                for (int i = 0; i < 4; i++)
                {
                    char c = curr[i];
                    char up = c == '9' ? '0' : (char)(c + 1);
                    char down = c == '0' ? '9' : (char)(c - 1);

                    Span<char> chars = stackalloc char[4];
                    curr.AsSpan().CopyTo(chars);

                    // Forward rotation
                    chars[i] = up;
                    string nextUp = new string(chars);
                    if (nextUp == target) return turns;
                    if (!deadSet.Contains(nextUp) && visited.Add(nextUp))
                        queue.Enqueue(nextUp);

                    // Backward rotation
                    chars[i] = down;
                    string nextDown = new string(chars);
                    if (nextDown == target) return turns;
                    if (!deadSet.Contains(nextDown) && visited.Add(nextDown))
                        queue.Enqueue(nextDown);
                }
            }
        }

        return -1;
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Minimum Genetic Mutation ([LeetCode 433] - Medium)
- **Constraint:** A gene string of length 8 composed of `['A', 'C', 'G', 'T']`. Minimum mutations to reach target.
- **Hint:** Identify branching factor $b = 8 \times 3 = 24$. Use `HashSet<string> bank` and implicit BFS.

### Exercise 2: Sliding Puzzle ([LeetCode 773] - Hard)
- **Constraint:** $2 \times 3$ board with tiles $0$ to $5$. Find minimum moves to reach solved board `[[1,2,3],[4,5,0]]`.
- **Hint:** Encode the $2 \times 3$ board as a 6-character string (e.g. `"123450"`). Precompute the swap adjacency list for each index $0 \dots 5$. Run BFS across the implicit $6! = 720$ state space!

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
                         IMPLICIT SEARCH SPACE DECISION TREE

                  Are state vertices explicitly listed upfront?
                               /                 \
                             YES                  NO
                             /                     \
                 [Standard Graph BFS/DFS]     Is the edge cost uniform (all 1)?
                                                    /             \
                                                  YES              NO
                                                  /                 \
                                [Implicit Level BFS]      [Dijkstra / A* Search]
                                          │
                           Is the search depth d large (d > 6)?
                                    /           \
                                  YES            NO
                                  /               \
                       [Bidirectional BFS]    [Standard 1-Direction BFS]
                       (Preview: Day 156)           (Today: Day 155)
```

---

## 7. 🎯 Daily Checkpoint Questions

### Diagnostic Question
In the **Word Ladder** problem ([LeetCode 127]), how do you formally define the vertex set $V$ and edge set $E$, what is the branching factor $b$, and why does changing characters `'a'` through `'z'` at each position outperform comparing the current word against all $N$ words in the dictionary when $N \gg 26 \times L$?

### Architectural Model Answer
1. **Formal Graph Definition:**
   - **Vertex Set $V$:** The set of all valid English words in `wordList` plus `beginWord`. $|V| = N + 1$.
   - **Edge Set $E$:** An undirected edge exists between $u$ and $v$ if and only if $\text{HammingDistance}(u, v) = 1$.
2. **Branching Factor:**
   - For a word of length $L$, there are $L$ positions. Each position can mutate into 25 other lowercase letters. Thus, the maximum branching factor is $b = 25 \times L$.
3. **Complexity Comparison:**
   - If you check all $N$ words in the dictionary: Generating neighbors takes $O(N \cdot L)$ string comparisons per dequeued state. Over $N$ states, total neighbor discovery work is $O(N^2 \cdot L)$.
   - If you generate 26 variations at each of the $L$ positions: Generating neighbors takes $O(26 \cdot L^2)$ string operations. Over $N$ states, total neighbor discovery work is $O(N \cdot 26 \cdot L^2)$.
   - When dictionary size $N = 5,000$ and word length $L = 5$:
     - Naive approach: $N \cdot L = 5,000 \times 5 = 25,000$ ops per state.
     - Generative approach: $26 \times L^2 = 26 \times 25 = 650$ ops per state.
     - **The generative/wildcard approach is $\approx 40\times$ faster**, completely eliminating TLE penalties!
