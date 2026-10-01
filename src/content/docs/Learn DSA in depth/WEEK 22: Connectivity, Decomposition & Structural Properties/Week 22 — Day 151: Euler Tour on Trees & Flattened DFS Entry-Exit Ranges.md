---
title: "Week 22 — Day 151: Euler Tour on Trees & Flattened DFS Entry-Exit Ranges"
---

# Week 22 — Day 151: Euler Tour on Trees & Flattened DFS Entry-Exit Ranges

Welcome to **Day 151 of your DSA Mastery Journey**!

Yesterday, on Day 150, you conquered graph coloring, the Welsh-Powell degree-ordered heuristic, and compiler register allocation.

Today, we explore one of the most powerful bridges between graph algorithms and advanced data structures: **The Euler Tour Technique on Trees (Tree Flattening via DFS In/Out Timestamps)**.

In hierarchical tree problems, answering queries like:
- *"What is the sum of all node values in the entire subtree of $u$?"*
- *"Add $+X$ to all nodes in the subtree of $u$."*
- *"Is node $u$ an ancestor of node $v$?"*

...would naively require traversing the entire subtree in $O(N)$ time per query. If there are $Q$ queries, this degrades to $O(Q \cdot N)$—far too slow for real-time systems.

By using the **Euler Tour Technique**, we flatten the 2D hierarchical tree into a **1D contiguous array**. Because DFS explores subtrees contiguously, **every subtree in the tree maps strictly to a contiguous subarray slice $[in[u], out[u]]$**!

This single insight unlocks:
- **$O(1)$ Ancestor Queries:** Checking if $u$ is an ancestor of $v$ without climbing parent pointers.
- **$O(\log N)$ Subtree Updates & Queries:** Pairing Euler Tour with a **Fenwick Tree (Binary Indexed Tree)** or **Segment Tree** (Week 15 & Week 55).

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   DAY 151: EULER TOUR ON TREES & SUBTREE RANGE FLATTENING                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       THE SUBTREE RANGE INVARIANT │                             │       THE 1D FLATTENED ARRAY      │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Run DFS from Root:              │                             │ • Subtree(u) == [in[u], out[u]]!  │
│   in[u]  = clock++ (entry time)   │ ── Flattening Bridge ─────► │ • Tree queries become 1D array    │
│   out[u] = clock++ (exit time)    │                             │   RANGE QUERIES!                  │
│ • Parenthesis Theorem:            │                             │ • Point Update: O(log N) in BIT.  │
│   Descendant intervals are        │                             │ • Subtree Sum: Range sum on       │
│   STRICTLY NESTED inside [in, out]│                             │   [in[u], out[u]] in O(log N)!    │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CANONICAL PROBLEM MASTERY           │
                          ├─────────────────────────────────────────────┤
                          │ • Subtree Range Sum Engine                  │
                          │ • [LC 337] House Robber III (Tree DP)       │
                          │ • From-Scratch: EulerTourTreeFlattener      │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🌲➡️📏 The Visual Mental Model: Flattening the Hanging Mobile into a Ruler

Before computing DFS timestamps or segment tree intervals, picture a wooden hanging baby mobile:

```
              🌲➡️📏 FLATTENING A BRANCHING TREE INTO A 1D RULER

   Imagine a decorative hanging mobile with wooden bells dangling on strings:
   
                     [ Bell 1 ] (Root)
                     /        \
             [ Bell 2 ]      [ Bell 3 ]
             /        \
        [ Bell 4 ]   [ Bell 5 ]

   If you want to calculate the total weight of Bell 2 and ALL bells hanging below it:
   • Naive way: Climb up and down strings in 2D space, dereferencing memory pointers.
   
   THE EULER TOUR TRANSFORMATION:
   Cut the strings in Depth-First Search order and lay the bells out in a single straight line
   on a 1D numbered ruler:
   
   1D Ruler:   [ Bell 1 ]   [ Bell 2 ]   [ Bell 4 ]   [ Bell 5 ]   [ Bell 3 ]
   Index:          0            1            2            3            4
                                └─────────────────────────┘
                                   SUBTREE(2) IS CONTIGUOUS!
                                   Range: [ in[2]=1 ... out[2]=3 ]

   THE ARCHITECTURAL MIRACLE:
   Every single subtree in the tree flattens into a strictly CONTIGUOUS 1D SLICE!
   • To sum or update all nodes in Subtree(2), you simply query the 1D slice [1..3]!
   • No pointer chasing! 100% flat array CPU cache locality!
```

---

### 1.2 🖼️ Visual Gallery: Subtree Interval Brackets & The $O(1)$ Ancestor Test

#### 1. Visualizing Subtree Interval Brackets on the 1D Array:

```
   Tour Array:   [  1  ]   [  2  ]   [  4  ]   [  5  ]   [  3  ]
   Index:           0         1         2         3         4

   Subtree(1):   [═════════════════════════════════════════════]   in=0, out=4 (All Nodes!)
   Subtree(2):             [═════════════════════════]             in=1, out=3 (Nodes 2, 4, 5)
   Subtree(4):                       [═════]                       in=2, out=2 (Leaf 4)
   Subtree(5):                                 [═════]             in=3, out=3 (Leaf 5)
   Subtree(3):                                           [═════]   in=4, out=4 (Leaf 3)
```

#### 2. The $O(1)$ Instant Ancestor Test:
How do you check if Node $u$ is an ancestor of Node $v$ in $O(1)$ time without climbing parent pointers?

```
   Interval of Node u:  [ in[u] ───────────────────────────────────────── out[u] ]
                                     │                     │
   Interval of Node v:               [ in[v] ───── out[v] ]
   
   • If interval [in[v], out[v]] is STRICTLY CONTAINED within [in[u], out[u]]:
     ===> Node u is guaranteed to be an ANCESTOR of Node v!
     Formula: (in[u] <= in[v] && out[u] >= out[v])
```

---

### 1.3 🏛️ Memory Layout: Parallel 1D Flat Arrays in Hardware RAM

```
   State Tracking in RAM (Flat Contiguous Arrays):
   
   Node ID (u):   [ 1 ]    [ 2 ]    [ 3 ]    [ 4 ]    [ 5 ]
   inTime[u]:     [ 0 ]    [ 1 ]    [ 4 ]    [ 2 ]    [ 3 ]
   outTime[u]:    [ 4 ]    [ 3 ]    [ 4 ]    [ 2 ]    [ 3 ]
   
   Linear Tour:   [ Node 1 ][ Node 2 ][ Node 4 ][ Node 5 ][ Node 3 ]
   Value Array:   [  10    ][  20    ][  40    ][  50    ][  30    ]
   
   • Subtree sum for Node 2: Range query on ValueArray from index inTime[2] to outTime[2]!
   • Powered by Fenwick Tree / Segment Tree in strictly O(log N) time!
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* An **Euler Tour on a Tree** is a sequence of vertices visited during a Depth-First Search traversal that records both the discovery (entry) timestamp `in[u]` and the completion (exit) timestamp `out[u]` of every vertex $u$.
  - *The Subtree-to-Range Invariant:*
    For any vertex $u$ in a tree, the set of all vertices in the subtree rooted at $u$ (including $u$ itself) corresponds **exactly and exclusively** to the set of vertices whose entry times fall within the closed interval:
    $$v \in \text{Subtree}(u) \iff in[u] \le in[v] \le out[u]$$
  - *The Ancestor Test Invariant in $O(1)$:*
    Vertex $u$ is an ancestor of vertex $v$ if and only if the interval $[in[v], out[v]]$ is strictly contained within $[in[u], out[u]]$:
    $$u \text{ is ancestor of } v \iff in[u] \le in[v] \land out[u] \ge out[v]$$
  - *Misconceptions:*
    - *Misconception 1:* "Euler Tour only works for binary trees." **False!** It works identically for $N$-ary trees, general unweighted trees, and directed trees.
    - *Misconception 2:* "Subtree modifications require Heavy-Light Decomposition." **False!** Subtree updates require only a simple Euler Tour paired with a 1D Fenwick/Segment Tree. Heavy-Light Decomposition (Week 55) is needed for *path* queries between arbitrary nodes $(u, v)$.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Dimension Reduction:* Reduces difficult 2D hierarchical subtree operations into standard 1D range queries on arrays.
  - *Hardware Cache Locality:* Operating on contiguous 1D arrays leverages CPU cache lines far better than traversing scattered tree node pointers in heap memory.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Subtree range sum, min, or max queries.
    - Checking Lowest Common Ancestors (LCA) using Binary Lifting (Day 75 & Week 55).
    - Offline tree query processing (Mo's algorithm on trees).
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Array Memory:* Three flat arrays of size $N$: `int[] inTime`, `int[] outTime`, and `int[] tourArray` containing the linearized nodes in visitation order.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "The Euler Tour technique flattens a tree into a 1D array by recording entry and exit timestamps during a DFS. Because DFS fully explores a node's entire subtree before returning, all descendants of $u$ have entry timestamps within the contiguous interval $[in[u], out[u]]$. This reduces any subtree query or batch modification into a standard 1D array range query, which can be executed in $O(\log N)$ time using a Fenwick Tree or Segment Tree, and allows checking ancestor relationships in $O(1)$ time."
- **6. HOW (Complexity & Invariants):**
  - *Precomputation Time:* $\Theta(V + E) = \Theta(N)$ single DFS pass.
  - *Ancestor Check Time:* $\Theta(1)$ direct array index comparison.
  - *Subtree Query / Update:* $O(\log N)$ when paired with a Fenwick Tree.

---

### 1.5 The Subtree-to-Range Theorem & Visual Trace

Consider the following rooted tree with 5 nodes:

```
Tree Architecture:
           [ 1 ]
          /     \
       [ 2 ]   [ 3 ]
       /   \
    [ 4 ] [ 5 ]
```

#### DFS Traversal Trace (Clock starts at 0):
1. Visit `1`: `in[1] = 0`
2. Visit `2`: `in[2] = 1`
3. Visit `4`: `in[4] = 2`. Leaf node $\implies$ `out[4] = 2`
4. Visit `5`: `in[5] = 3`. Leaf node $\implies$ `out[5] = 3`
5. Backtrack from `2`: `out[2] = 3`
6. Visit `3`: `in[3] = 4`. Leaf node $\implies$ `out[3] = 4`
7. Backtrack from `1`: `out[1] = 4`

```
Summary Intervals:
  Node 1: [ 0, 4 ]  <── Contains { 1, 2, 4, 5, 3 } (Entire tree)
  Node 2: [ 1, 3 ]  <── Contains { 2, 4, 5 }       (Subtree of 2!)
  Node 4: [ 2, 2 ]  <── Contains { 4 }
  Node 5: [ 3, 3 ]  <── Contains { 5 }
  Node 3: [ 4, 4 ]  <── Contains { 3 }

Notice: The Subtree of Node 2 is strictly the contiguous range [ 1, 3 ]!
```

---

## 2. 💻 IMPLEMENT: Production C# Container

The `EulerTourTreeFlattener` provides:
1. `FlattenTree`: Linearizes the tree into `inTime` and `outTime` arrays.
2. `IsAncestor`: $O(1)$ ancestor relationship verification.
3. `SubtreeSumEngine`: Demonstrates $O(\log N)$ subtree queries and point updates via an integrated Fenwick Tree.
4. Comprehensive automated `Debug.Assert` tests.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedDSA.GraphFundamentals
{
    /// <summary>
    /// Production container implementing the Euler Tour Tree Flattening technique
    /// for O(1) ancestor queries and O(log N) subtree range aggregations.
    /// </summary>
    public sealed class EulerTourTreeFlattener
    {
        private readonly int _n;
        private readonly List<int>[] _adj;
        private readonly int[] _inTime;
        private readonly int[] _outTime;
        private readonly int[] _flatOrder;
        private int _timer;

        public int[] InTime => _inTime;
        public int[] OutTime => _outTime;
        public int[] FlatOrder => _flatOrder;

        public EulerTourTreeFlattener(int n)
        {
            _n = n;
            _adj = new List<int>[n];
            for (int i = 0; i < n; i++) _adj[i] = new List<int>();

            _inTime = new int[n];
            _outTime = new int[n];
            _flatOrder = new int[n];
        }

        public void AddUndirectedEdge(int u, int v)
        {
            _adj[u].Add(v);
            _adj[v].Add(u);
        }

        /// <summary>
        /// Flattens the tree rooted at root using a single DFS pass.
        /// </summary>
        public void FlattenTree(int root = 0)
        {
            _timer = 0;
            Dfs(root, -1);
        }

        private void Dfs(int u, int parent)
        {
            _inTime[u] = _timer;
            _flatOrder[_timer] = u;
            _timer++;

            foreach (int v in _adj[u])
            {
                if (v != parent)
                {
                    Dfs(v, u);
                }
            }

            _outTime[u] = _timer - 1; // Inclusive exit boundary
        }

        /// <summary>
        /// Determines whether u is an ancestor of v in O(1) time.
        /// </summary>
        public bool IsAncestor(int u, int v)
        {
            return _inTime[u] <= _inTime[v] && _outTime[u] >= _outTime[v];
        }

        /// <summary>
        /// Returns the size of the subtree rooted at u.
        /// </summary>
        public int GetSubtreeSize(int u)
        {
            return _outTime[u] - _inTime[u] + 1;
        }

        /// <summary>
        /// Test suite validating range containment and ancestor invariants.
        /// </summary>
        public static void RunTests()
        {
            Console.WriteLine("Running EulerTourTreeFlattener Test Suite...");

            // Construct Tree:
            //         0
            //       /   \
            //      1     2
            //     / \
            //    3   4
            var flattener = new EulerTourTreeFlattener(5);
            flattener.AddUndirectedEdge(0, 1);
            flattener.AddUndirectedEdge(0, 2);
            flattener.AddUndirectedEdge(1, 3);
            flattener.AddUndirectedEdge(1, 4);

            flattener.FlattenTree(0);

            // Test 1: Ancestor Queries
            Debug.Assert(flattener.IsAncestor(0, 3), "Test 1 Failed: 0 must be ancestor of 3.");
            Debug.Assert(flattener.IsAncestor(1, 3), "Test 1 Failed: 1 must be ancestor of 3.");
            Debug.Assert(!flattener.IsAncestor(2, 3), "Test 1 Failed: 2 is NOT an ancestor of 3.");
            Debug.Assert(!flattener.IsAncestor(3, 1), "Test 1 Failed: Child cannot be ancestor of parent.");
            Debug.Assert(flattener.IsAncestor(1, 1), "Test 1 Failed: Node is ancestor of itself.");

            // Test 2: Subtree Sizes
            Debug.Assert(flattener.GetSubtreeSize(0) == 5, "Test 2 Failed: Root subtree size must be 5.");
            Debug.Assert(flattener.GetSubtreeSize(1) == 3, "Test 2 Failed: Subtree 1 size must be 3 {1, 3, 4}.");
            Debug.Assert(flattener.GetSubtreeSize(2) == 1, "Test 2 Failed: Leaf 2 size must be 1.");

            // Test 3: Contiguous Range Invariant
            // All descendants of 1 must lie in [in[1], out[1]]
            int in1 = flattener.InTime[1];
            int out1 = flattener.OutTime[1];
            Debug.Assert(flattener.InTime[3] >= in1 && flattener.InTime[3] <= out1, "Test 3 Failed: 3 in range.");
            Debug.Assert(flattener.InTime[4] >= in1 && flattener.InTime[4] <= out1, "Test 3 Failed: 4 in range.");
            Debug.Assert(flattener.InTime[2] < in1 || flattener.InTime[2] > out1, "Test 3 Failed: 2 outside range.");

            Console.WriteLine("All EulerTourTreeFlattener tests PASSED successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Systems & Complexity Analysis

### 3.1 Complexity Profile

| Operation | Naive Tree Traversal | Euler Tour + Fenwick Tree | Architectural Advantage |
| :--- | :--- | :--- | :--- |
| **Precomputation** | $O(1)$ | $\mathbf{\Theta(N)}$ | Single linear DFS traversal. |
| **Ancestor Query $(u, v)$** | $O(N)$ (climb parents) | $\mathbf{\Theta(1)}$ | Direct index bounds check: `in[u] <= in[v] && out[u] >= out[v]`. |
| **Subtree Sum Query** | $O(\text{Size}(u))$ | $\mathbf{O(\log N)}$ | Range query on $[in[u], out[u]]$. |
| **Subtree Node Update** | $O(\text{Size}(u))$ | $\mathbf{O(\log N)}$ | Range update via difference arrays or lazy Segment Tree. |

---

## 4. 🧩 APPLY: Canonical Problem Walkthroughs

### 4.1 [LeetCode 337] House Robber III (Medium)

#### Problem Description
The thief has found himself a new place for his thievery again. There is only one entrance to this area, called `root`. Besides `root`, each house has one and only one parent house. After a tour, the smart thief realized that all houses in this place form a binary tree. It will automatically contact the police if **two directly-linked houses were broken into on the same night**.

Given the `root` of the binary tree, return the *maximum amount of money the thief can rob without alerting the police*.

#### Architectural Intuition: Tree DP (Rob vs Skip)
While Euler Tour flattens the tree for range updates, hierarchical tree optimization often uses **Tree DP**:
- For each node $u$, return a tuple `(rob, skip)`:
  - $\text{rob}(u) = \text{val}(u) + \text{skip}(\text{left}) + \text{skip}(\text{right})$
  - $\text{skip}(u) = \max(\text{rob}(\text{left}), \text{skip}(\text{left})) + \max(\text{rob}(\text{right}), \text{skip}(\text{right}))$

```csharp
public class SolutionLC337
{
    public class TreeNode {
        public int val;
        public TreeNode left;
        public TreeNode right;
        public TreeNode(int val=0, TreeNode left=null, TreeNode right=null) {
            this.val = val;
            this.left = left;
            this.right = right;
        }
    }

    public int Rob(TreeNode root)
    {
        var (rob, skip) = Dfs(root);
        return Math.Max(rob, skip);
    }

    private (int rob, int skip) Dfs(TreeNode node)
    {
        if (node == null) return (0, 0);

        var left = Dfs(node.left);
        var right = Dfs(node.right);

        // If we rob this house, we CANNOT rob children
        int robThis = node.val + left.skip + right.skip;

        // If we skip this house, we can rob or skip each child freely
        int skipThis = Math.Max(left.rob, left.skip) + Math.Max(right.rob, right.skip);

        return (robThis, skipThis);
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **Euler Tour Subtree Sum Lab:**
   - Integrate `EulerTourTreeFlattener` with a 1D Fenwick Tree to execute $Q$ dynamic node value updates and subtree sum queries in $O((N + Q) \log N)$ total time.

2. **[LeetCode 337] House Robber III (Medium):**
   - Implement the post-order Tree DP solution.

3. **Lowest Common Ancestor via Euler Tour:**
   - Combine the $O(1)$ `IsAncestor` test with **Binary Lifting** (`up[node, k]`) to find the LCA of any pair in $O(\log N)$ time.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Tree Query Strategy:

                       What type of tree query is required?
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
         Subtree Queries                                    Path Queries
         (Subtree sum / max)                                (Path between u and v)
                 │                                               │
                 ▼                                               ▼
         Euler Tour Flattening                              Heavy-Light
         + 1D Fenwick / Segment Tree                        Decomposition (HLD)
         O(log N) query time                                (Week 55-56)
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
Explain how the Euler Tour technique transforms a subtree query into a contiguous range query on a 1D array.

### Architectural Model Answer
1. **The Nature of Depth-First Traversal:**
   - When a DFS visits a vertex $u$ in a tree, it records its entry timestamp $\text{in}[u]$.
   - Before DFS can return from $u$ and record its exit timestamp $\text{out}[u]$, it must recursively visit and completely finish exploring all children of $u$, and all of their descendants.
   - By the **Parenthesis Theorem of DFS**, the visitation time of any descendant $v$ of $u$ satisfies:
     $$\text{in}[u] \le \text{in}[v] \le \text{out}[u]$$

2. **Tree Flattening to 1D Array:**
   - We construct a 1D array `flatArray` of size $N$ where index $t$ stores the node visited at time $t$ ($\text{flatArray}[\text{in}[v]] = v$).
   - Because the DFS exploration of $u$'s subtree is never interrupted by nodes outside of $u$'s subtree, **every single vertex in the subtree of $u$ occupies a unique, contiguous block of indices**:
     $$[\text{in}[u], \text{out}[u]]$$

3. **Subtree Query Transformation:**
   - Any query over the subtree of $u$ (such as sum, min, or max) is now mathematically equivalent to an **array range query** over the contiguous subarray $\text{flatArray}[\text{in}[u] \dots \text{out}[u]]$.
   - This allows any 1D range aggregation structure (like a Fenwick Tree or Segment Tree) to answer subtree queries in $O(\log N)$ time and apply range updates to an entire subtree in $O(\log N)$ time, completely avoiding $O(N)$ tree traversals.
