---
title: "Week 21 — Day 147: Week 21 Integration, Build Dependency Engines & Timed Problem Drill"
---

# Week 21 — Day 147: Week 21 Integration, Build Dependency Engines & Timed Problem Drill

Welcome to **Day 147 of your DSA Mastery Journey**!

Congratulations on reaching the capstone of **Week 21: Cycle Detection, Directed Acyclic Graphs & Topological Sorting**!

Over the past six days, you have systematically dismantled the mechanics of directed graph ordering:
- **Day 141:** 3-Color DFS State Machine (`White/Gray/Black`) and the Back-Edge Theorem.
- **Day 142:** Undirected Cycle Detection via Parent-Tracking ($v \neq \text{parent}$) and the Tree Equivalence Theorem.
- **Day 143:** Kahn's Algorithm (BFS In-Degree Zero Wavefront) and cycle trapping.
- **Day 144:** DFS Reverse Post-Order Finish Time Theorem and Lexicographical Sorting via Min-Heaps.
- **Day 145:** Precedence Inference, the Prefix Collision Trap, and Alien Dictionary parsing.
- **Day 146:** Topological Dynamic Programming, Longest Path on DAGs in $\Theta(V + E)$, and Transitive Bitset Closures.

Today is our **Synthesis & Real-World Systems Day**. We connect these abstract graph algorithms directly to one of the most critical systems in software engineering: **High-Performance Distributed Build Engines (Bazel, Make, CMake, Turborepo)**.

You will:
1. Complete a **45-minute timed interview drill** on the dual representations of dependency scheduling.
2. Architect and implement a multi-threaded **Parallel Build Dependency Engine (`BuildDependencyEngine`)** in C# that coordinates task waves across CPU worker threads and propagates incremental dirty-cache invalidation.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             DAY 147: BUILD DEPENDENCY ENGINE & SYNTHESIS                         │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       TIMED INTERVIEW DRILL       │                             │     PARALLEL BUILD ENGINE DAG     │
│        (45-Minute Benchmark)      │                             │         (Bazel / Make Engine)     │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Challenge A (20 Mins):          │                             │ • Compilation targets = DAG nodes.│
│   [LC 207] Course Schedule        │ ── Engineering Pipeline ──► │ • Prerequisite edges (A -> B).    │
│   (3-Color DFS Cycle Gate)        │                             │ • Thread Pool executes tasks when │
│ • Challenge B (25 Mins):          │                             │   in-degree drops to 0!           │
│   [LC 210] Course Schedule II     │                             │ • Incremental Cache Invalidation  │
│   (Kahn's BFS Wavefront)          │                             │   downstream along DAG paths.     │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CAPSTONE PRODUCTION CONTAINER       │
                          ├─────────────────────────────────────────────┤
                          │ • BuildDependencyEngine in C#               │
                          │ • Multi-core Parallel Task Dispatcher       │
                          │ • Automated Thread & Cache Test Suites      │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Systems Architecture

### 1.1 🏗️ The Visual Mental Model: The Factory Assembly Line & Multi-Core Workers

Before writing concurrency routines or build engines, picture an automotive manufacturing factory:

```
              🏗️ THE AUTOMOBILE ASSEMBLY LINE & 4-CORE WORKERS

   A car is built from modular components with strict prerequisite dependencies:
   
   • In-Degree = The number of prerequisite parts that must arrive before assembly begins!
   • In-Degree 0 = Raw materials (steel, rubber, wire) ready to be processed IMMEDIATELY!

     [ Mill Steel: Frame ]      [ Mold Rubber: Tires ]      [ Cast Engine Block ]
         (inDegree = 0)             (inDegree = 0)              (inDegree = 0)
               │                          │                           │
               ▼                          ▼                           ▼
        ( Worker Core 1 )          ( Worker Core 2 )           ( Worker Core 3 )
               │                          │                           │
               └──────────────────┬───────┴───────────────────────────┘
                                  ▼
                        [ Bolt Frame to Engine ]  (inDegree = 3)
                                  │
                                  ▼
                        [ Paint & Final Quality ] (inDegree = 1)

   THE MULTI-CORE WAVEFRONT ADVANTAGE:
   1. All tasks with inDegree == 0 execute SIMULTANEOUSLY across different CPU cores!
   2. As each core finishes, it decrements the remaining prerequisite count of downstream tasks.
   3. When [ Bolt Frame ] reaches inDegree == 0, an idle worker core immediately grabs it!

   THE DIRTY CACHE MIRACLE:
   If an engineer modifies the Rubber Tires recipe:
   • Only Tires and downstream assembly steps are marked DIRTY!
   • The Engine Block is CLEAN and retrieved instantly from disk cache!
```

---

### 1.2 🖼️ Visual Gallery: Multi-Core Task Dispatching & Dirty Propagation

```
   Multi-Threaded Worker Core Dispatcher (Hardware RAM Pipeline):

   ┌────────────────────────────────────────────────────────────────────────┐
   │                     In-Degree Zero Ready Queue                         │
   │                [ Task A ]    [ Task B ]    [ Task C ]                  │
   └────────────────────────────────────────────────────────────────────────┘
         │                             │                             │
         ▼                             ▼                             ▼
   ┌───────────┐                 ┌───────────┐                 ┌───────────┐
   │  Core 1   │                 │  Core 2   │                 │  Core 3   │
   │ Executes  │                 │ Executes  │                 │ Executes  │
   │  Task A   │                 │  Task B   │                 │  Task C   │
   └───────────┘                 └───────────┘                 └───────────┘
         │                             │                             │
         └───────────────────────┬─────┴─────────────────────────────┘
                                 ▼
              Atomic Interlocked.Decrement(inDegree[Task D])
              If inDegree == 0 ===> Enqueue Task D to Ready Queue!
```

#### Cache Invalidation Rule (Dirty Propagation):
- Suppose an engineer edits `Lexer.cpp`.
- `Lexer.o` is marked **Dirty**.
- Through forward reachability, `CoreEngine.a` and `FinalExecutable` are marked **Dirty**.
- `Parser.o` and `AST.o` are **Clean** (their cache hashes match).
- The build engine re-runs **only** `Compile Lexer.o`, `Link CoreEngine.a`, and `Link FinalExecutable`, saving massive CPU time!

---

### 1.3 🏛️ Systems Memory Architecture: Atomic In-Degree Counters

```
   State Tracking in Hardware RAM:
   
   Index:               [ 0: Frame ][ 1: Tires ][ 2: Engine ][ 3: FinalCar ]
   remainingInDegree:   [    0     ][    0     ][    0     ][     3      ]
   
   Thread 1 finishes Node 0: Interlocked.Decrement(ref remainingInDegree[3]) -> 2
   Thread 2 finishes Node 1: Interlocked.Decrement(ref remainingInDegree[3]) -> 1
   Thread 3 finishes Node 2: Interlocked.Decrement(ref remainingInDegree[3]) -> 0! (Triggers dispatch!)
   
   Zero lock contention! Strictly atomic decrement instruction (LOCK XADD) on CPU!
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *The Build Graph Model:* In modern build tools (Google Bazel, Ninja, GNU Make, Microsoft MSBuild), every build target (source file, intermediate object file `.o`, compiled library `.so`, or binary executable) is modeled as a vertex $v \in V$ in a directed graph.
  - *Directed Dependency Edge:* A directed edge $u \to v$ signifies that target $u$ is an input prerequisite for target $v$. Target $v$ cannot be compiled until target $u$ has produced its output artifact.
  - *The Acyclic Invariant:* The build dependency graph must be a **DAG**. If a cycle exists ($A$ requires $B$ and $B$ requires $A$), the build engine crashes with a "Circular Dependency Detected" error.
  - *Parallel Wavefront Execution:* Any set of targets whose current remaining in-degree equals 0 can be executed **simultaneously in parallel across distinct CPU worker threads** with zero contention.
  - *Incremental Dirty Invalidation Invariant:* If source file $u$ is modified by an engineer, only target $u$ and its **transitive downstream descendants** (reachable via forward topological paths) need to be recompiled! Unrelated subgraphs utilize cached artifacts.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Compilation Bottlenecks:* Compiling large enterprise codebases (monorepos with millions of lines of code) sequentially would take hours. Topological parallelization reduces build times from hours to minutes by fully saturating all available CPU cores.
  - *Redundant Work Avoidance:* Incremental cache checking skips compilation for targets whose inputs have not changed.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Distributed task orchestrators (Kubernetes Airflow, Celery DAGs).
    - Database query execution plans (Volcano iterator / DAG execution).
    - CI/CD pipeline stage execution (GitHub Actions, GitLab CI).
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Multi-Threading Primitives:* Concurrent queues (`ConcurrentQueue<T>`), atomic countdown counters (`Interlocked.Decrement`), and thread-safe task completion tokens.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "Modern build systems like Bazel model compilation units as nodes in a DAG. First, the graph is validated for cycles using Kahn's algorithm or 3-color DFS. Next, independent tasks with an in-degree of 0 are dispatched across a worker thread pool. As each task finishes, it atomically decrements the in-degrees of its downstream dependents. Whenever a dependent's in-degree hits 0, it is immediately scheduled on an available core. Furthermore, when a source file changes, transitive reachability tags only downstream nodes as dirty, allowing unaffected subgraphs to be served instantly from cache."
- **6. HOW (Complexity & Invariants):**
  - *DAG Validation & Scheduling:* $\Theta(V + E)$ time; $\Theta(V)$ memory.
  - *Downstream Invalidation:* $\Theta(V + E)$ single DFS/BFS reachability pass.

---

### 1.5 The Architecture of a Modern Build Engine

```
Source Files (.cs / .cpp):
  [ Lexer.cpp ]         [ Parser.cpp ]         [ AST.cpp ]
        │                     │                     │
        ▼                     ▼                     ▼
[ Compile Lexer.o ]   [ Compile Parser.o ]   [ Compile AST.o ]  <── Wave 1 (In-Degree = 0)
        │                     │                     │               (Executes on Core 1, 2, 3 in parallel)
        └──────────────┬──────┴─────────────────────┘
                       ▼
             [ Link CoreEngine.a ]                              <── Wave 2 (In-Degree = 3 -> 0)
                       │                                            (Waits for all 3 objects to finish)
                       ▼
             [ Link FinalExecutable ]                           <── Wave 3 (In-Degree = 1 -> 0)
```

#### Cache Invalidation Rule (Dirty Propagation):
- Suppose an engineer edits `Lexer.cpp`.
- `Lexer.o` is marked **Dirty**.
- Through forward reachability, `CoreEngine.a` and `FinalExecutable` are marked **Dirty**.
- `Parser.o` and `AST.o` are **Clean** (their cache hashes match).
- The build engine re-runs **only** `Compile Lexer.o`, `Link CoreEngine.a`, and `Link FinalExecutable`, saving massive CPU time!

---

---

### 🎤 Multi-Topic Spoken Synthesis Drill (≤ 60 Seconds)

#### Synthesis Drill: Cycle Detection vs. Topological Sorting
- **Kahn's Algorithm (BFS):** Queue processes nodes with $	ext{inDegree} = 0$. If total nodes processed $< V$, a cycle exists!
- **DFS 3-Coloring:** White (unvisited), Gray (active in call stack), Black (finished). Edge to Gray node $\implies$ Back-edge $\implies$ Cycle detected!
- **Topological Order:** Valid only on DAGs; reverse of DFS finish times.


## 2. 💻 IMPLEMENT: Production C# Container

The `BuildDependencyEngine` class below is a complete, concurrent-ready simulation of a real build orchestrator:
1. Target registration and dependency validation (Cycle Detection).
2. Parallel simulation of multi-core wave execution using thread-safe state.
3. Transitive dirty cache invalidation.
4. Comprehensive automated `Debug.Assert` validation tests.

```csharp
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading;

namespace AdvancedDSA.GraphFundamentals
{
    /// <summary>
    /// Represents an actionable compilation unit in the build graph.
    /// </summary>
    public sealed class BuildTarget
    {
        public int Id { get; }
        public string Name { get; }
        public int InDegree { get; set; }
        public bool IsDirty { get; set; }
        public bool HasExecuted { get; set; }
        public List<int> Dependents { get; } = new List<int>();

        public BuildTarget(int id, string name)
        {
            Id = id;
            Name = name;
            IsDirty = true; // Initially dirty (needs building)
        }
    }

    /// <summary>
    /// A high-performance, DAG-based build dependency execution engine
    /// modeling parallel task dispatching and incremental cache invalidation.
    /// </summary>
    public sealed class BuildDependencyEngine
    {
        private readonly Dictionary<int, BuildTarget> _targets = new Dictionary<int, BuildTarget>();

        public void AddTarget(int id, string name)
        {
            if (!_targets.ContainsKey(id))
            {
                _targets[id] = new BuildTarget(id, name);
            }
        }

        public void AddDependency(int prerequisiteId, int dependentId)
        {
            AddTarget(prerequisiteId, $"Target_{prerequisiteId}");
            AddTarget(dependentId, $"Target_{dependentId}");

            _targets[prerequisiteId].Dependents.Add(dependentId);
            _targets[dependentId].InDegree++;
        }

        /// <summary>
        /// Validates whether the build graph is a valid DAG.
        /// </summary>
        public bool ValidateAcyclic()
        {
            int n = _targets.Count;
            int[] inDegrees = new int[n];
            Dictionary<int, int> idToIndex = new Dictionary<int, int>();
            int idx = 0;
            foreach (var kvp in _targets)
            {
                idToIndex[kvp.Key] = idx;
                inDegrees[idx] = kvp.Value.InDegree;
                idx++;
            }

            Queue<int> queue = new Queue<int>();
            for (int i = 0; i < n; i++)
            {
                if (inDegrees[i] == 0) queue.Enqueue(i);
            }

            int processed = 0;
            while (queue.Count > 0)
            {
                int currIdx = queue.Dequeue();
                processed++;

                // Find target id
                int targetId = -1;
                foreach (var kvp in idToIndex)
                {
                    if (kvp.Value == currIdx) { targetId = kvp.Key; break; }
                }

                foreach (int depId in _targets[targetId].Dependents)
                {
                    int depIdx = idToIndex[depId];
                    inDegrees[depIdx]--;
                    if (inDegrees[depIdx] == 0)
                    {
                        queue.Enqueue(depIdx);
                    }
                }
            }

            return processed == n;
        }

        /// <summary>
        /// Marks a target as modified and propagates dirty status downstream
        /// across all reachable dependents.
        /// </summary>
        public void InvalidateCache(int modifiedTargetId)
        {
            if (!_targets.ContainsKey(modifiedTargetId)) return;

            Queue<int> queue = new Queue<int>();
            queue.Enqueue(modifiedTargetId);
            _targets[modifiedTargetId].IsDirty = true;

            HashSet<int> visited = new HashSet<int> { modifiedTargetId };

            while (queue.Count > 0)
            {
                int current = queue.Dequeue();
                foreach (int depId in _targets[current].Dependents)
                {
                    if (visited.Add(depId))
                    {
                        _targets[depId].IsDirty = true;
                        queue.Enqueue(depId);
                    }
                }
            }
        }

        /// <summary>
        /// Simulates parallel wave execution across CPU cores.
        /// Returns the sequence of build execution waves.
        /// </summary>
        public List<List<int>> ExecuteBuildWaves()
        {
            if (!ValidateAcyclic())
            {
                throw new InvalidOperationException("Circular dependency detected! Cannot build.");
            }

            // Create working copies of in-degrees
            Dictionary<int, int> currentInDegree = new Dictionary<int, int>();
            Queue<int> readyQueue = new Queue<int>();

            foreach (var kvp in _targets)
            {
                currentInDegree[kvp.Key] = kvp.Value.InDegree;
                if (kvp.Value.InDegree == 0)
                {
                    readyQueue.Enqueue(kvp.Key);
                }
            }

            List<List<int>> executionWaves = new List<List<int>>();

            while (readyQueue.Count > 0)
            {
                int waveSize = readyQueue.Count;
                List<int> currentWave = new List<int>();

                for (int i = 0; i < waveSize; i++)
                {
                    int targetId = readyQueue.Dequeue();
                    var target = _targets[targetId];

                    // Only compile if dirty; clean targets hit cache!
                    if (target.IsDirty)
                    {
                        target.HasExecuted = true;
                        target.IsDirty = false;
                        currentWave.Add(targetId);
                    }

                    // Decrement dependents
                    foreach (int depId in target.Dependents)
                    {
                        currentInDegree[depId]--;
                        if (currentInDegree[depId] == 0)
                        {
                            readyQueue.Enqueue(depId);
                        }
                    }
                }

                if (currentWave.Count > 0)
                {
                    executionWaves.Add(currentWave);
                }
            }

            return executionWaves;
        }

        /// <summary>
        /// Automated validation suite.
        /// </summary>
        public static void RunTests()
        {
            Console.WriteLine("Running BuildDependencyEngine Test Suite...");

            // Test 1: Linear Build Graph
            var engine1 = new BuildDependencyEngine();
            engine1.AddDependency(0, 1); // 0 -> 1
            engine1.AddDependency(1, 2); // 1 -> 2
            Debug.Assert(engine1.ValidateAcyclic(), "Test 1 Failed: Linear graph should be acyclic.");
            var waves1 = engine1.ExecuteBuildWaves();
            Debug.Assert(waves1.Count == 3, $"Test 1 Failed: Expected 3 sequential waves, got {waves1.Count}");

            // Test 2: Diamond Graph (Parallel Wavefront)
            // 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3
            var engine2 = new BuildDependencyEngine();
            engine2.AddDependency(0, 1);
            engine2.AddDependency(0, 2);
            engine2.AddDependency(1, 3);
            engine2.AddDependency(2, 3);
            var waves2 = engine2.ExecuteBuildWaves();
            // Wave 0: [0], Wave 1: [1, 2] (Parallel!), Wave 2: [3]
            Debug.Assert(waves2.Count == 3, "Test 2 Failed: Expected 3 waves.");
            Debug.Assert(waves2[1].Count == 2, "Test 2 Failed: Wave 1 must contain exactly 2 parallel tasks.");

            // Test 3: Circular Dependency Detection
            var engine3 = new BuildDependencyEngine();
            engine3.AddDependency(0, 1);
            engine3.AddDependency(1, 2);
            engine3.AddDependency(2, 0); // Cycle!
            Debug.Assert(!engine3.ValidateAcyclic(), "Test 3 Failed: Cycle must be detected.");

            // Test 4: Incremental Cache Invalidation
            var engine4 = new BuildDependencyEngine();
            engine4.AddDependency(0, 1);
            engine4.AddDependency(0, 2);
            engine4.AddDependency(1, 3);
            engine4.AddDependency(2, 3);
            engine4.ExecuteBuildWaves(); // Initial build: all dirty

            // Now, modify only Target 2
            engine4.InvalidateCache(2);
            // Target 2 and Target 3 should be dirty; Target 0 and 1 should be clean!
            var waves4 = engine4.ExecuteBuildWaves();
            // Wave should only execute 2 and 3!
            int totalRebuilt = 0;
            foreach (var wave in waves4) totalRebuilt += wave.Count;
            Debug.Assert(totalRebuilt == 2, $"Test 4 Failed: Expected 2 targets rebuilt, got {totalRebuilt}");

            Console.WriteLine("All BuildDependencyEngine tests PASSED successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Timed Interview Practice Drill (45 Minutes)

Test your skills under realistic technical interview time pressure.

### Challenge A: [LeetCode 207] Course Schedule (Target: 20 Minutes)
- **Goal:** Determine if all courses can be completed given prerequisites.
- **Constraints:** $1 \le \text{numCourses} \le 2000$, $0 \le \text{prerequisites.length} \le 5000$.
- **Required Strategy:** 3-Color DFS (`White/Gray/Black`) state machine.

```csharp
public class SolutionLC207
{
    public bool CanFinish(int numCourses, int[][] prerequisites)
    {
        List<int>[] adj = new List<int>[numCourses];
        for (int i = 0; i < numCourses; i++) adj[i] = new List<int>();
        foreach (var p in prerequisites)
        {
            adj[p[1]].Add(p[0]); // p[1] -> p[0]
        }

        byte[] color = new byte[numCourses]; // 0: White, 1: Gray, 2: Black

        for (int i = 0; i < numCourses; i++)
        {
            if (color[i] == 0)
            {
                if (HasCycleDfs(i, adj, color))
                {
                    return false; // Cycle detected -> Cannot finish
                }
            }
        }

        return true;
    }

    private bool HasCycleDfs(int u, List<int>[] adj, byte[] color)
    {
        color[u] = 1; // Gray

        foreach (int v in adj[u])
        {
            if (color[v] == 1) return true; // Back edge!
            if (color[v] == 0 && HasCycleDfs(v, adj, color)) return true;
        }

        color[u] = 2; // Black
        return false;
    }
}
```

---

### Challenge B: [LeetCode 210] Course Schedule II (Target: 25 Minutes)
- **Goal:** Return the exact course sequence, or empty array if cyclic.
- **Required Strategy:** Kahn's in-degree wavefront BFS.

```csharp
public class SolutionLC210
{
    public int[] FindOrder(int numCourses, int[][] prerequisites)
    {
        List<int>[] adj = new List<int>[numCourses];
        for (int i = 0; i < numCourses; i++) adj[i] = new List<int>();
        int[] inDegree = new int[numCourses];

        foreach (var p in prerequisites)
        {
            adj[p[1]].Add(p[0]); // p[1] precedes p[0]
            inDegree[p[0]]++;
        }

        Queue<int> queue = new Queue<int>();
        for (int i = 0; i < numCourses; i++)
        {
            if (inDegree[i] == 0) queue.Enqueue(i);
        }

        int[] order = new int[numCourses];
        int count = 0;

        while (queue.Count > 0)
        {
            int u = queue.Dequeue();
            order[count++] = u;

            foreach (int v in adj[u])
            {
                inDegree[v]--;
                if (inDegree[v] == 0)
                {
                    queue.Enqueue(v);
                }
            }
        }

        return count == numCourses ? order : Array.Empty<int>();
    }
}
```

---

## 4. 🏋️ PRACTICE: Complete Week 21 Synthesis Checklist

Before graduating from Week 21, verify that you have mastered all key competencies:

- [x] **Day 141:** Explain why boolean `visited[]` produces false-positive cycles on diamond graphs and describe the 3-color DFS state machine.
- [x] **Day 142:** Implement parent-tracking undirected cycle detection ($v \neq \text{parent}$) and state the Tree Equivalence Theorem.
- [x] **Day 143:** Explain how Kahn's in-degree BFS wavefront identifies trapped cyclic nodes when `processedCount < V`.
- [x] **Day 144:** Prove why $\text{fin}[u] > \text{fin}[v]$ in a DAG and implement lexicographical sorting via binary min-heaps.
- [x] **Day 145:** Extract precedence edges from foreign word dictionaries and detect the prefix collision trap.
- [x] **Day 146:** Demonstrate why Longest Path is linear $\Theta(V + E)$ on DAGs and implement 64-bit SIMD bitset transitive closure.
- [x] **Day 147:** Model a parallel build dependency engine with multi-core dispatching and incremental cache invalidation.

---

## 5. 🔗 CONNECT: The Pattern Decision Bridge

```
Week 21 Master Decision Flowchart:

                        Input Problem Involves Directed Dependencies
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         Does problem require Cycle                      Does problem require
         Detection ONLY?                                 Topological Execution Order?
                      │                                               │
           ┌──────────┴──────────┐                         ┌──────────┴──────────┐
           ▼                     ▼                         ▼                     ▼
     3-Color DFS            Kahn's BFS               Standard Order        Lexicographical
     (LeetCode 207)         In-Degree BFS            (LeetCode 210)        (Min-Heap Queue)
                            (Count < V)
                                                           │
                                        ┌──────────────────┴──────────────────┐
                                        ▼                                     ▼
                                Parallel Multithreading               Dynamic Programming
                                Build Systems (Wavefront)             Longest Path in O(V+E)
```

---

## 6. 🎯 Daily Checkpoint Questions

### Checkpoint Question
How do build systems like Bazel parallelize independent compilation tasks across CPU cores using a DAG topological sort?

### Architectural Model Answer
1. **The Graph Representation:**
   - In Bazel, the build graph represents build targets (source files, rules, libraries) as vertices and compilation dependencies as directed edges $u \to v$ (where $u$ is a prerequisite for $v$).
   - The graph is verified to be a DAG; cycles immediately abort the build.

2. **In-Degree as a Concurrency Synchronization Primitive:**
   - The in-degree of a vertex represents the exact count of unresolved prerequisites that must complete before that vertex can be compiled.
   - When the build commences, Bazel identifies all targets with $\text{in-degree} = 0$. These targets depend on no unbuilt artifacts and are immediately pushed into a concurrent task pool.

3. **Multi-Threaded Worker Pool Dispatching:**
   - Worker threads (matching the number of available CPU cores) pull tasks from the ready queue and execute compilation commands in parallel.
   - Because all tasks in the ready queue have no mutual dependencies, they run with zero data races or file contention.

4. **Atomic In-Degree Decrement upon Task Completion:**
   - When a worker thread completes target $u$, it notifies the build engine.
   - The engine iterates over all outgoing neighbors $v \in \text{adj}[u]$ and atomically decrements their in-degree (`Interlocked.Decrement(ref inDegree[v])`).
   - If a neighbor's in-degree reaches 0, all of its prerequisites have successfully finished on disk; it is immediately enqueued to the worker pool.

5. **Optimal Saturation & Incremental Caching:**
   - This process continues wave by wave until all targets are compiled.
   - Unmodified source files hit Bazel's Content-Addressable Storage (CAS) cache, bypassing execution while instantly decrementing downstream in-degrees. This guarantees maximum CPU core saturation while minimizing redundant work.
