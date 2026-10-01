---
title: "Week 20 — Day 135: Adjacency List & Matrix Containers from Scratch (AdjacencyListGraph<T>, AdjacencyMatrixGraph<T>)"
---

# Week 20 — Day 135: Adjacency List & Matrix Containers from Scratch (AdjacencyListGraph<T>, AdjacencyMatrixGraph<T>)

Welcome to **Day 135 of your DSA Mastery Journey**!

Yesterday, on Day 134, you established the mathematical foundations of graph theory: vertex sets, edge relations, the Handshaking Lemma, and the degree parity theorem.

Today, we bridge theory into production software engineering. You will implement the two foundational graph representations from scratch in C#:
1. **The Generic Adjacency List Graph (`AdjacencyListGraph<T, W>`)**: Optimized for sparse graphs ($|E| \ll |V|^2$), providing optimal $O(V + E)$ space complexity and fast $O(\text{deg}(u))$ neighbor enumeration.
2. **The Generic Adjacency Matrix Graph (`AdjacencyMatrixGraph<T, W>`)**: Optimized for dense graphs ($|E| \approx |V|^2$), providing instantaneous $O(1)$ edge existence queries and edge mutations.

Both implementations feature dynamic vertex mapping (`Dictionary<T, int>`), support for directed, undirected, and weighted edges, XML documentation, and comprehensive `Debug.Assert` validation test suites.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             DAY 135: GRAPH CONTAINER ARCHITECTURE                                │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│     ADJACENCY LIST CONTAINER      │                             │    ADJACENCY MATRIX CONTAINER     │
│       AdjacencyListGraph<T, W>    │                             │     AdjacencyMatrixGraph<T, W>    │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Vertex Index Map:               │                             │ • Vertex Index Map:               │
│   Dictionary<T, int> _vertexToId  │                             │   Dictionary<T, int> _vertexToId  │
│ • Flat Bucket Array:              │                             │ • 2D Dense Matrix:                │
│   List<WeightedEdge<W>>[] _adj    │ ── Design Trade-Off Matrix ─►│   W?[,] _matrix                   │
│ • Space: O(V + E).                │                             │ • Space: O(V^2).                  │
│ • Neighbor Query: O(deg(u)).      │                             │ • Neighbor Query: O(V) row scan.  │
│ • Edge Check: O(deg(u)).          │                             │ • Edge Check: O(1) direct index.  │
│ • Best For: Sparse graphs / BFS.  │                             │ • Best For: Dense graphs / Floyd. │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │     CANONICAL PROBLEM: ALL PATHS IN DAG     │
                          ├─────────────────────────────────────────────┤
                          │ • [LeetCode 797] All Paths Source to Target │
                          │ • Backtracking DFS Path Exploration.        │
                          │ • Time: O(2^V * V) worst-case complete DAG. │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🏛️ Physical Mental Model & Architecture: Generic Vertex Registry & Dual Storage

Before diving into code, let us visualize how a production graph container bridges real-world generic objects (like airport codes `"SEA"`, `"SFO"`, `"JFK"`) to high-speed internal arrays:

```
                  THE GENERIC VERTEX REGISTRY & DUAL MEMORY MODEL

   Real-World Graph:
          "SEA" ─────── $120 ───────► "SFO"
            │                           │
          $250                        $300
            ▼                           ▼
          "JFK" ◄────── $180 ───────── "ORD"

   Step 1: Bidirectional Vertex Registry (Translates string keys to 0-based integers)
   ┌─────────┬────────┐       ┌─────────┬────────┐
   │ String  │ Int ID │       │ Int ID  │ String │
   ├─────────┼────────┤       ├─────────┼────────┤
   │ "SEA"   │   0    │       │    0    │ "SEA"  │
   │ "SFO"   │   1    │  <==> │    1    │ "SFO"  │
   │ "JFK"   │   2    │       │    2    │ "JFK"  │
   │ "ORD"   │   3    │       │    3    │ "ORD"  │
   └─────────┴────────┘       └─────────┴────────┘

   ────────────────────────────────────────────────────────────────────────────────────────────
   REPRESENTATION A: ADJACENCY LIST IN RAM (Array of Dynamic Edge Lists)
   Index [0] ("SEA"): ──► [ to: 1 ("SFO"), w: $120 ] ──► [ to: 2 ("JFK"), w: $250 ] ──► null
   Index [1] ("SFO"): ──► [ to: 3 ("ORD"), w: $300 ] ──► null
   Index [2] ("JFK"): ──► null (No outgoing flights)
   Index [3] ("ORD"): ──► [ to: 2 ("JFK"), w: $180 ] ──► null

   ────────────────────────────────────────────────────────────────────────────────────────────
   REPRESENTATION B: ADJACENCY MATRIX IN RAM (Contiguous 4x4 Grid of Weights)
                 Col 0 ("SEA")   Col 1 ("SFO")   Col 2 ("JFK")   Col 3 ("ORD")
   Row 0 ("SEA"):  [   null    |     $120     |     $250     |     null     ]
   Row 1 ("SFO"):  [   null    |     null     |     null     |     $300     ]
   Row 2 ("JFK"):  [   null    |     null     |     null     |     null     ]
   Row 3 ("ORD"):  [   null    |     null     |     $180     |     null     ]
```

### 1.2 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* A graph container manages an associative mapping between generic user identifiers $T$ and internal 0-indexed integers $[0 \dots V-1]$, maintaining connectivity relations $E$ between them.
  - *Core Invariants:*
    1. **Symmetry Invariant (Undirected):** In an undirected graph, for any edge $(u, v)$ with weight $w$, $(v, u)$ exists with the identical weight $w$.
    2. **Bidirectional Degree Invariant:** Total edges tracked in the internal storage equals $|E|$ for directed graphs and $2|E|$ for undirected adjacency lists.
    3. **Index Bijectivity Invariant:** Every vertex $t \in T$ maps to a unique integer index in $[0, V-1]$, and the reverse lookup array `_idToVertex[i]` maps back to $t$.
  - *Misconception Check:*
    - *Misconception 1:* "Removing an edge from an adjacency list takes $O(1)$." **False!** In an adjacency list, finding the edge $(u, v)$ requires scanning $u$'s list of neighbors, which takes $O(\text{deg}(u))$ time. Only an Adjacency Matrix can delete an edge in strictly $O(1)$ time.
    - *Misconception 2:* "We should always store graph vertices by their integer values directly." **False!** Real-world applications use string names (cities, IP addresses, user IDs). A production container must decouple the generic type `T` from internal contiguous zero-based indexing via a bidirectional index registry.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates hardcoded vertex bounds, enables generic payloads on vertices and edges, and provides clean abstractions for BFS, DFS, and shortest-path algorithms without leaking internal array indices to client code.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose Adjacency List:*
    - Traversal-heavy workloads (BFS, DFS, Dijkstra, Kahn's topological sort).
    - Sparse graphs where $|E| \ll V^2$ (which represents $>99\%$ of real-world datasets).
  - *When to Choose Adjacency Matrix:*
    - Edge existence queries (`HasEdge(u, v)`) dominate the runtime.
    - Dense graphs where $|E| \approx V^2$.
    - Dynamic algorithms requiring frequent edge updates or all-pairs shortest paths (Floyd-Warshall).
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Adjacency List in CLR Heap:* An array of object references (`List<Edge>[]`). Each non-empty list is an independent heap object with its own backing array. Traversing neighbors causes pointer dereferencing across disparate memory pages.
  - *Adjacency Matrix in CLR Heap:* A single contiguous 2D rectangular array `W?[,]`. Stored sequentially in row-major order. Scanning all outgoing neighbors of vertex $u$ is a sequential scan across contiguous memory, prefetching smoothly into CPU cache lines.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "An Adjacency List stores edges as dynamic lists per vertex, consuming $O(V+E)$ space and enabling $O(\text{deg}(u))$ neighbor iteration, making it optimal for sparse graphs and BFS/DFS traversals. An Adjacency Matrix stores edges in a 2D array, consuming $O(V^2)$ space but providing instantaneous $O(1)$ edge existence checks, ideal for dense graphs and dynamic edge mutations."
- **6. HOW (Operations, Implementation & State Trace):**
  - *Complexity Profile:*
    - `AddVertex`: Amortized $O(1)$ (both).
    - `AddEdge`: $O(1)$ (both).
    - `HasEdge`: $O(\text{deg}(u))$ List vs $O(1)$ Matrix.
    - `GetNeighbors`: $O(\text{deg}(u))$ List vs $O(V)$ Matrix.

---

## 2. 🛠️ IMPLEMENT: Production-Grade From-Scratch C# Containers

Below are the complete, production-grade generic C# containers:
1. `AdjacencyListGraph<T, W>`
2. `AdjacencyMatrixGraph<T, W>`

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace GraphFundamentals.Containers
{
    /// <summary>
    /// Represents a directed, weighted edge targeting a specific destination vertex.
    /// </summary>
    public readonly struct GraphEdge<T, W>
    {
        public T Destination { get; }
        public W Weight { get; }

        public GraphEdge(T destination, W weight)
        {
            Destination = destination;
            Weight = weight;
        }

        public override string ToString() => $"-> {Destination} (w={Weight})";
    }

    /// <summary>
    /// Production-grade generic Adjacency List Graph container.
    /// Optimized for sparse graphs with O(V + E) memory and O(deg(u)) neighbor iteration.
    /// </summary>
    /// <typeparam name="T">The vertex identifier type.</typeparam>
    /// <typeparam name="W">The edge weight type.</typeparam>
    public class AdjacencyListGraph<T, W> where T : notnull
    {
        private readonly bool _isDirected;
        private readonly Dictionary<T, int> _vertexToId;
        private readonly List<T> _idToVertex;
        private readonly List<List<GraphEdge<T, W>>> _adjacency;

        public int VertexCount => _idToVertex.Count;
        public int EdgeCount { get; private set; }
        public bool IsDirected => _isDirected;

        public AdjacencyListGraph(bool isDirected = false, int initialCapacity = 16)
        {
            _isDirected = isDirected;
            _vertexToId = new Dictionary<T, int>(initialCapacity);
            _idToVertex = new List<T>(initialCapacity);
            _adjacency = new List<List<GraphEdge<T, W>>>(initialCapacity);
            EdgeCount = 0;
        }

        /// <summary>
        /// Registers a vertex in the graph. Runs in amortized O(1) time.
        /// </summary>
        public bool AddVertex(T vertex)
        {
            if (vertex == null) throw new ArgumentNullException(nameof(vertex));
            if (_vertexToId.ContainsKey(vertex)) return false;

            int id = _idToVertex.Count;
            _vertexToId[vertex] = id;
            _idToVertex.Add(vertex);
            _adjacency.Add(new List<GraphEdge<T, W>>());
            return true;
        }

        /// <summary>
        /// Adds a directed or undirected weighted edge. Automatically registers missing vertices.
        /// Runs in O(1) amortized time.
        /// </summary>
        public void AddEdge(T source, T destination, W weight)
        {
            AddVertex(source);
            AddVertex(destination);

            int u = _vertexToId[source];
            _adjacency[u].Add(new GraphEdge<T, W>(destination, weight));

            if (!_isDirected && !EqualityComparer<T>.Default.Equals(source, destination))
            {
                int v = _vertexToId[destination];
                _adjacency[v].Add(new GraphEdge<T, W>(source, weight));
            }

            EdgeCount++;
        }

        /// <summary>
        /// Checks if an edge exists from source to destination. Runs in O(deg(u)) time.
        /// </summary>
        public bool HasEdge(T source, T destination)
        {
            if (!_vertexToId.TryGetValue(source, out int u)) return false;
            if (!_vertexToId.ContainsKey(destination)) return false;

            var edges = _adjacency[u];
            for (int i = 0; i < edges.Count; i++)
            {
                if (EqualityComparer<T>.Default.Equals(edges[i].Destination, destination))
                    return true;
            }

            return false;
        }

        /// <summary>
        /// Returns all outgoing edges from the specified vertex. Runs in O(1) time.
        /// </summary>
        public IReadOnlyList<GraphEdge<T, W>> GetNeighbors(T vertex)
        {
            if (!_vertexToId.TryGetValue(vertex, out int u))
                throw new KeyNotFoundException($"Vertex '{vertex}' not found in graph.");

            return _adjacency[u];
        }

        /// <summary>
        /// Returns all registered vertices in the graph.
        /// </summary>
        public IReadOnlyList<T> GetAllVertices() => _idToVertex;
    }

    /// <summary>
    /// Production-grade generic Adjacency Matrix Graph container.
    /// Optimized for dense graphs with strictly O(1) edge lookup and mutation.
    /// </summary>
    /// <typeparam name="T">The vertex identifier type.</typeparam>
    /// <typeparam name="W">The edge weight type (must be value or reference type).</typeparam>
    public class AdjacencyMatrixGraph<T, W> where T : notnull
    {
        private const int DefaultCapacity = 16;
        private readonly bool _isDirected;
        private readonly Dictionary<T, int> _vertexToId;
        private readonly List<T> _idToVertex;
        private W?[,] _matrix;
        private int _capacity;

        public int VertexCount => _idToVertex.Count;
        public int EdgeCount { get; private set; }
        public bool IsDirected => _isDirected;

        public AdjacencyMatrixGraph(bool isDirected = false, int initialCapacity = DefaultCapacity)
        {
            _isDirected = isDirected;
            _capacity = Math.Max(DefaultCapacity, initialCapacity);
            _vertexToId = new Dictionary<T, int>(_capacity);
            _idToVertex = new List<T>(_capacity);
            _matrix = new W?[_capacity, _capacity];
            EdgeCount = 0;
        }

        public bool AddVertex(T vertex)
        {
            if (vertex == null) throw new ArgumentNullException(nameof(vertex));
            if (_vertexToId.ContainsKey(vertex)) return false;

            if (_idToVertex.Count >= _capacity)
            {
                ResizeMatrix(_capacity * 2);
            }

            int id = _idToVertex.Count;
            _vertexToId[vertex] = id;
            _idToVertex.Add(vertex);
            return true;
        }

        public void AddEdge(T source, T destination, W weight)
        {
            AddVertex(source);
            AddVertex(destination);

            int u = _vertexToId[source];
            int v = _vertexToId[destination];

            if (_matrix[u, v] == null)
            {
                EdgeCount++;
            }

            _matrix[u, v] = weight;

            if (!_isDirected && u != v)
            {
                _matrix[v, u] = weight;
            }
        }

        public bool HasEdge(T source, T destination)
        {
            if (!_vertexToId.TryGetValue(source, out int u)) return false;
            if (!_vertexToId.TryGetValue(destination, out int v)) return false;

            return _matrix[u, v] != null;
        }

        public bool TryGetEdgeWeight(T source, T destination, out W weight)
        {
            if (_vertexToId.TryGetValue(source, out int u) &&
                _vertexToId.TryGetValue(destination, out int v) &&
                _matrix[u, v] != null)
            {
                weight = _matrix[u, v]!;
                return true;
            }

            weight = default!;
            return false;
        }

        public bool RemoveEdge(T source, T destination)
        {
            if (!_vertexToId.TryGetValue(source, out int u)) return false;
            if (!_vertexToId.TryGetValue(destination, out int v)) return false;

            if (_matrix[u, v] == null) return false;

            _matrix[u, v] = default;
            if (!_isDirected && u != v)
            {
                _matrix[v, u] = default;
            }

            EdgeCount--;
            return true;
        }

        public List<GraphEdge<T, W>> GetNeighbors(T vertex)
        {
            if (!_vertexToId.TryGetValue(vertex, out int u))
                throw new KeyNotFoundException($"Vertex '{vertex}' not found.");

            var neighbors = new List<GraphEdge<T, W>>();
            int count = _idToVertex.Count;

            for (int v = 0; v < count; v++)
            {
                if (_matrix[u, v] != null)
                {
                    neighbors.Add(new GraphEdge<T, W>(_idToVertex[v], _matrix[u, v]!));
                }
            }

            return neighbors;
        }

        public IReadOnlyList<T> GetAllVertices() => _idToVertex;

        private void ResizeMatrix(int newCapacity)
        {
            var newMatrix = new W?[newCapacity, newCapacity];
            int currentCount = _idToVertex.Count;

            for (int r = 0; r < currentCount; r++)
            {
                for (int c = 0; c < currentCount; c++)
                {
                    newMatrix[r, c] = _matrix[r, c];
                }
            }

            _matrix = newMatrix;
            _capacity = newCapacity;
        }
    }

    /// <summary>
    /// Self-testing verification harness for graph containers.
    /// </summary>
    public static class GraphContainersTests
    {
        public static void RunAllTests()
        {
            Console.WriteLine("Executing Graph Containers Verification Suite...");

            // Test 1: AdjacencyListGraph Directed & Weighted Operations
            var listGraph = new AdjacencyListGraph<string, int>(isDirected: true);
            listGraph.AddEdge("NYC", "LON", 3450);
            listGraph.AddEdge("NYC", "PAR", 3620);
            listGraph.AddEdge("LON", "TOK", 5940);

            Debug.Assert(listGraph.VertexCount == 4);
            Debug.Assert(listGraph.EdgeCount == 3);
            Debug.Assert(listGraph.HasEdge("NYC", "LON"));
            Debug.Assert(listGraph.HasEdge("NYC", "PAR"));
            Debug.Assert(!listGraph.HasEdge("LON", "NYC"), "Directed graph should not have reverse edge");

            var nycNeighbors = listGraph.GetNeighbors("NYC");
            Debug.Assert(nycNeighbors.Count == 2);

            // Test 2: AdjacencyMatrixGraph Undirected & Operations
            var matGraph = new AdjacencyMatrixGraph<string, double>(isDirected: false, initialCapacity: 4);
            matGraph.AddEdge("A", "B", 1.5);
            matGraph.AddEdge("B", "C", 2.5);
            matGraph.AddEdge("C", "A", 3.5);

            Debug.Assert(matGraph.VertexCount == 3);
            Debug.Assert(matGraph.EdgeCount == 3);
            Debug.Assert(matGraph.HasEdge("A", "B"));
            Debug.Assert(matGraph.HasEdge("B", "A"), "Undirected graph must have symmetric edges");

            Debug.Assert(matGraph.TryGetEdgeWeight("B", "C", out double wBC) && Math.Abs(wBC - 2.5) < 1e-9);

            // Deletion in Matrix
            bool removed = matGraph.RemoveEdge("A", "B");
            Debug.Assert(removed);
            Debug.Assert(!matGraph.HasEdge("A", "B"));
            Debug.Assert(!matGraph.HasEdge("B", "A"), "Symmetric edge must also be removed");
            Debug.Assert(matGraph.EdgeCount == 2);

            // Test 3: Matrix Dynamic Resize Test
            for (int i = 0; i < 20; i++)
            {
                matGraph.AddEdge($"Node_{i}", $"Node_{i + 1}", i * 1.0);
            }
            Debug.Assert(matGraph.VertexCount >= 20);

            Console.WriteLine("All Adjacency List and Adjacency Matrix tests passed with 100% assertions verified!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### Asymptotic Profile

| Operation | Adjacency List (`List<Edge>[]`) | Adjacency Matrix (`W?[,]`) |
| :--- | :--- | :--- |
| **Add Vertex $u$** | Amortized $\Theta(1)$ | Amortized $\Theta(1)$ ($\Theta(V^2)$ upon matrix doubling) |
| **Add Edge $(u, v)$** | $\Theta(1)$ | $\mathbf{\Theta(1)}$ |
| **Remove Edge $(u, v)$** | $\Theta(\text{deg}(u))$ | $\mathbf{\Theta(1)}$ |
| **Has Edge $(u, v)$** | $\Theta(\text{deg}(u))$ | $\mathbf{\Theta(1)}$ |
| **Enumerate Neighbors of $u$**| $\mathbf{\Theta(\text{deg}(u))}$ | $\Theta(V)$ |
| **Memory Footprint** | $\Theta(V + E)$ | $\Theta(V^2)$ |

### Systems Memory Overhead: The 64-bit CLR Perspective
In a 64-bit .NET runtime:
- Each `List<T>` object carries a 24-byte object header + 8-byte pointer to its internal array.
- For a sparse graph with $V = 100,000$ vertices and $E = 200,000$ edges:
  - **Adjacency List:** Consumes $100,000 \times 32 \text{ bytes (list objects)} + 200,000 \times 16 \text{ bytes (struct edges)} \approx \mathbf{6.4 \text{ MB}}$.
  - **Adjacency Matrix:** A $100,000 \times 100,000$ matrix requires $10^{10}$ slots. Even with 1-byte booleans, this consumes $\mathbf{10 \text{ Gigabytes}}$ of RAM! An adjacency matrix would trigger an immediate `OutOfMemoryException`.

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### Problem: [LeetCode 797] All Paths From Source to Target (Medium)

#### Problem Statement
Given a directed acyclic graph (DAG) of `n` nodes labeled from `0` to `n - 1`, find all possible paths from node `0` to node `n - 1` and return them in any order.
The graph is given as `graph[i]` is a list of all nodes you can visit from node `i`.

#### Algorithmic Strategy (Backtracking Path DFS)
- Because the graph is a Directed Acyclic Graph (DAG), **cycles are mathematically impossible**. We do not need a `visited` set to prevent infinite loops!
- Use Depth-First Search with backtracking:
  1. Maintain a current `path` list. Add current node `u` to `path`.
  2. If `u == n - 1` (destination reached), clone and record the current path: `results.Add(new List<int>(path))`.
  3. For each neighbor `v` in `graph[u]`, recursively call `Dfs(v)`.
  4. Upon return, backtrack by popping `u` from `path` (`path.RemoveAt(path.Count - 1)`).
- Time Complexity: A complete DAG can have up to $2^{V-1}$ paths (each node can either be included or excluded). With path length up to $V$, total time is $O(2^V \cdot V)$. Auxiliary Space: $O(V)$ for the recursion stack and path buffer.

#### Production Solution in C#
```csharp
using System.Collections.Generic;

public class AllPathsSolution
{
    public static IList<IList<int>> AllPathsSourceTarget(int[][] graph)
    {
        var results = new List<IList<int>>();
        var currentPath = new List<int>();
        int target = graph.Length - 1;

        Dfs(0, target, graph, currentPath, results);
        return results;
    }

    private static void Dfs(
        int u,
        int target,
        int[][] graph,
        List<int> currentPath,
        List<IList<int>> results)
    {
        currentPath.Add(u);

        if (u == target)
        {
            results.Add(new List<int>(currentPath));
        }
        else
        {
            foreach (int v in graph[u])
            {
                Dfs(v, target, graph, currentPath, results);
            }
        }

        // Backtrack
        currentPath.RemoveAt(currentPath.Count - 1);
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 797] All Paths From Source to Target (Medium):**
   - Implement the backtracking DFS solution and verify performance on deep line graphs vs branching trees.

2. **[LeetCode 841] Keys and Rooms (Medium):**
   - *Task:* There are `n` rooms labeled `0` to `n - 1`. You start in room 0. Each room has keys to other rooms. Return `true` if you can visit all rooms.
   - *Pattern:* Directed reachability using BFS or DFS with a boolean `visited` array.

3. **Neighbor Intersection Benchmark:**
   - *Task:* Given two vertices $u$ and $v$, write a function computing their common neighbors in an Adjacency Matrix vs Adjacency List. Compare execution speeds.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Graph Representation Choice Architecture:

                     ┌───────────────────────────────────────────────┐
                     │          GRAPH REPRESENTATION ENGINE          │
                     └───────────────────────────────────────────────┘
                                             │
             ┌───────────────────────────────┴───────────────────────────────┐
             ▼                                                               ▼
┌──────────────────────────────────────────┐    ┌──────────────────────────────────────────┐
│      ADJACENCY LIST (List<Edge>[])       │    │         ADJACENCY MATRIX (W[,])          │
├──────────────────────────────────────────┤    ├──────────────────────────────────────────┤
│ • Space: O(V + E) linear memory.         │    │ • Space: O(V^2) quadratic memory.        │
│ • Enumerate neighbors: O(deg(u)).        │    │ • Enumerate neighbors: O(V) scan.        │
│ • Edge lookup: O(deg(u)) linear search.  │    │ • Edge lookup: O(1) instant indexing.    │
│ • Optimal for: Sparse graphs (V > 1,000) │    │ • Optimal for: Dense graphs (V < 1,000)  │
│   and all standard BFS/DFS algorithms.   │    │   and Floyd-Warshall all-pairs paths.    │
└──────────────────────────────────────────┘    └──────────────────────────────────────────┘
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
What are the asymptotic trade-offs between Adjacency List and Adjacency Matrix when computing the intersection of neighbors between two vertices?

### Architectural Model Answer
1. **Adjacency Matrix Approach:**
   - In an adjacency matrix, the outgoing neighbors of vertex $u$ are represented as row $u$ (`matrix[u, *]`), and the neighbors of $v$ are row $v$ (`matrix[v, *]`).
   - To compute common neighbors, we inspect all $V$ possible vertices:
     ```csharp
     for (int i = 0; i < V; i++) {
         if (matrix[u, i] && matrix[v, i]) commonNeighbors.Add(i);
     }
     ```
   - **Time Complexity:** Strictly $\mathbf{\Theta(V)}$ time.
   - **Bitset Optimization:** If rows are stored as 64-bit integer bitmasks (`ulong[]`), computing the common neighbors is a hardware-accelerated bitwise AND (`rowU[k] & rowV[k]`), reducing runtime to $\mathbf{\Theta(V / 64)}$ operations.

2. **Adjacency List Approach:**
   - In an adjacency list, vertex $u$ has $\text{deg}(u)$ neighbors and $v$ has $\text{deg}(v)$ neighbors.
   - **Case A (Unsorted Lists):** For each neighbor of $u$, we must linearly scan $v$'s list to check for membership.
     $$\text{Time Complexity} = \mathbf{O(\text{deg}(u) \times \text{deg}(v))}$$
   - **Case B (Hash Set Lookup):** If one list is loaded into a hash set:
     $$\text{Time Complexity} = \mathbf{O(\text{deg}(u) + \text{deg}(v))}$$
   - **Case C (Sorted Adjacency Lists):** If neighbor lists are maintained in sorted order, we can find common neighbors using a two-pointer intersection scan in:
     $$\text{Time Complexity} = \mathbf{O(\text{deg}(u) + \text{deg}(v))}$$

3. **Architectural Trade-off Decision:**
   - For **sparse graphs** (e.g. social networks where $\text{deg}(u), \text{deg}(v) \approx 100$ while total users $V = 1,000,000$):
     - Adjacency List (two-pointer/hash set) requires only $\approx 200$ operations.
     - Adjacency Matrix requires scanning all $1,000,000$ columns ($5,000\times$ slower!).
   - For **dense graphs** where $\text{deg}(u) \approx V$:
     - Both take $O(V)$ operations, but the Adjacency Matrix with bitwise SIMD AND instructions significantly outperforms the Adjacency List in CPU cycles.
