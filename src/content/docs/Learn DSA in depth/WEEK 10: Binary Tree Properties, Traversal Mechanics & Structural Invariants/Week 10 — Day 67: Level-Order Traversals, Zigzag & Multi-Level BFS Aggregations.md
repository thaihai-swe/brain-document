---
title: "Week 10 — Day 67: Level-Order Traversals, Zigzag & Multi-Level BFS Aggregations"
---

# Week 10 — Day 67: Level-Order Traversals, Zigzag & Multi-Level BFS Aggregations

Welcome to **Day 67 of your DSA Mastery Journey**!

Over the past three days ([Days 64–66](./Week%2010%20%E2%80%94%20Day%2064:%20Tree%20Memory%20Architecture,%20From-Scratch%20BinaryTree%20&%20Traversal%20Invariants%20%28Preorder,%20Inorder,%20Postorder%29.md)), we thoroughly explored Depth-First Search (DFS) traversals—both recursive and iterative—as well as $O(1)$ Morris threading.

Today, we pivot to horizontal spatial exploration: **Breadth-First Search (BFS) on Hierarchical Topologies**:
1. **Tree BFS vs. Graph BFS:** Why trees require **zero visited sets** (acyclic property + single in-degree).
2. **The Level Snapshot Invariant:** Isolating discrete tiers using the `levelSize = queue.Count` pattern.
3. **Memory Profile Contrasts:** Mathematical comparison of peak memory in DFS ($O(H)$) versus BFS ($O(W)$), and the dramatic $25,000 : 1$ memory disparity in balanced trees.
4. **Zigzag & Multi-Level Aggregations:** Achieving bidirectional level order without expensive list reversal allocations.
5. **Canonical Problem Walkthroughs:** Production C# solutions for **LeetCode 102**, **LeetCode 103**, and **LeetCode 107**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 67 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: BFS INVARIANTS      │                                     │     PART II: SPATIAL PATTERNS   │
│    Memory Models & Mechanics    │                                     │     Zigzag & Bottom-Up Trees    │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Zero Visited Set Law          │                                     │ • Level-Order Snapshot (LC 102) │
│ • levelSize Snapshot Pattern    │                                     │ • Zero-Alloc Zigzag (LC 103)    │
│ • Peak Width: W = ceil(N / 2)   │                                     │ • Bottom-Up Inversion (LC 107)  │
│ • DFS vs BFS Memory Inversion   │                                     │ • Pre-allocated Capacity Bounds │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **Level-Order Traversal** explores a binary tree horizontally level by level using a FIFO queue.
  - *Core Invariants:* Level Snapshot Invariant: Capture `int levelSize = queue.Count` at the start of each depth iteration to process all nodes at that depth atomically; Zigzag Direct Slotting Invariant: Alternate filling level arrays forward or backward based on `levelIndex % 2 == 0`, avoiding costly list reversals.
  - *Misconception Check:* In tree BFS, a `visited` hash set is *never* needed! Because trees are strictly acyclic directed structures, nodes can never be reached more than once from the root.
- **2. WHY:**
  - *Bottleneck Solved:* Solves horizontal multi-node aggregations (level averages, min/max per level, perimeter projections) that are cumbersome in vertical DFS.
  - *Complexity Advantage:* Traverses the tree in strict $O(N)$ linear time with $O(W)$ space, where $W$ is the maximum tree width.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Binary Tree Level Order Traversal" (LC 102), "Binary Tree Zigzag Level Order Traversal" (LC 103), "Binary Tree Right Side View" (LC 199). Signal words: "level order traversal", "zigzag traversal", "nodes visible from right side".
  - *When to Avoid / Failure Modes:* Path sum and tree diameter problems that depend on vertical root-to-leaf paths (use DFS instead).
- **4. WHERE:**
  - *Physical CLR Memory:* Heap-allocated FIFO `Queue<TreeNode>`; peak queue memory occurs at the leaf level ($N/2$ nodes in a complete binary tree).
  - *Production Systems:* Hierarchical organizational charts, multi-level access control role inheritance evaluation, document object model tree rendering engines.
- **5. WHO:**
  - *Spoken Script:* "In tree BFS, trees are naturally directed and acyclic, so no `visited` set is required. I capture `queue.Count` at the start of each level to process all nodes at that depth atomically. For zigzag order, I allocate a fixed-size array per level and populate it forward or backward based on level parity, avoiding list reversals."
  - *Interviewer Evaluation Lens:* Checks level snapshot pattern (`levelSize = queue.Count`), zero-allocation zigzag array slotting, and memory complexity analysis ($O(W)$ vs. DFS $O(H)$).
- **6. HOW:**
  - *Cost Model:* Time: $\Theta(N)$ linear time; Space: $O(W) = O(N)$ where $W$ is maximum level breadth.
  - *State Transition Trace (Level Order):* `Queue=[1] -> levelSize=1 -> dequeue 1, enqueue 2, 3 -> Queue=[2, 3] -> levelSize=2 -> dequeue 2, 3, enqueue children...`.


### 1.1 Why Trees Require No `visited` Set in BFS

In generic graph BFS ([Day 60](../WEEK%209:%20Queue%20Internals,%20Monotonic%20Deques%20&%20BFS%20Foundations/Week%209%20%E2%80%94%20Day%2060:%20Queue-Based%20BFS%20Foundation%20&%20Level-Order%20Mechanics.md)), a `visited` set or boolean array is mandatory to prevent infinite cycles and $O(4^D)$ exponential re-enqueues.

In a **Binary Tree**, however:
1. **Acyclic Invariant:** There are no undirected cycles or back-edges.
2. **Single In-Degree Invariant:** Every node has exactly one parent.
3. **Directed Child Traversal:** Pointers flow strictly downward (`node.left` and `node.right`).

Because a node can **never be reached by more than one path**, a tree BFS needs **zero visited tracking**! Every node enters the FIFO queue at most once.

---

### 1.2 The Level-Order Snapshot Invariant

To group tree node values by their exact depth $d$:

```csharp
while (queue.Count > 0)
{
    // Snapshot the EXACT number of nodes on the current horizontal tier
    int levelSize = queue.Count;
    var currentLevel = new List<int>(levelSize); // Pre-allocate exact capacity!

    for (int i = 0; i < levelSize; i++)
    {
        TreeNode node = queue.Dequeue();
        currentLevel.Add(node.val);

        // Enqueue next tier (level d + 1)
        if (node.left != null) queue.Enqueue(node.left);
        if (node.right != null) queue.Enqueue(node.right);
    }

    result.Add(currentLevel);
}
```

> [!IMPORTANT]
> ### 💡 The Invariant of Discrete Tier Segmentation
> At the moment `int levelSize = queue.Count` is evaluated:
> 1. The queue contains **only** nodes belonging to depth level $d$.
> 2. The inner loop runs **exactly `levelSize` times**, dequeueing all level-$d$ nodes.
> 3. Any children pushed into the queue during this loop belong strictly to level $d + 1$ and sit safely behind the level-$d$ nodes.
> 4. When the inner loop finishes, level $d$ is completely retired, and the queue contains **only** nodes belonging to level $d + 1$.

---

### 1.3 Memory Footprint Inversion: DFS vs. BFS

Consider the peak auxiliary memory usage of DFS versus BFS on two extreme tree topologies:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             TOPOLOGY 1: BALANCED BINARY TREE (N = 1,000,000)                     │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Depth H = log2(10^6) ≈ 20 levels.                                                               │
│ Max Layer Width W = ceil(N / 2) = 500,000 nodes (at the leaf tier).                              │
│                                                                                                  │
│ • DFS Peak Stack Memory:                                                                         │
│   20 frames * 48 Bytes/frame ≈ 960 BYTES (< 1 KB!).                                              │
│                                                                                                  │
│ • BFS Peak Queue Memory:                                                                         │
│   500,000 node pointers * 8 Bytes/reference ≈ 4 MEGABYTES!                                       │
│                                                                                                  │
│ ===> In a balanced tree, BFS consumes OVER 4,000x MORE MEMORY than DFS!                         │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            TOPOLOGY 2: SKEWED DEGENERATE TREE (N = 1,000,000)                    │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Depth H = 1,000,000 levels.                                                                      │
│ Max Layer Width W = 1 node per level.                                                            │
│                                                                                                  │
│ • DFS Peak Stack Memory:                                                                         │
│   1,000,000 frames * 48 Bytes ≈ 48 MB ==> FATAL StackOverflowException!                         │
│                                                                                                  │
│ • BFS Peak Queue Memory:                                                                         │
│   Queue holds at most 1 element at any instant! (O(1) Memory!).                                  │
│                                                                                                  │
│ ===> In a skewed tree, BFS is O(1) space, while DFS crashes the process!                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 1.4 High-Performance Zigzag Mechanics (Zero-Allocation Array Inversion)

In Zigzag level order traversal ([LeetCode 103]):
- Even levels ($0, 2, 4, \dots$) are recorded Left-to-Right.
- Odd levels ($1, 3, 5, \dots$) are recorded Right-to-Left.

#### The Naive Antipattern:
Collecting items into a `List<int>` and calling `.Reverse()` on odd levels, or using `LinkedList<int>.AddFirst()`.
- `.Reverse()` copies elements twice.
- `LinkedList<int>` allocates a 24-byte `LinkedListNode` heap object for **every single value**.

#### The High-Performance Invariant: Direct Array Slot Placement
Because `levelSize` is known upfront, allocate a flat array `int[] row = new int[levelSize]`.
Place incoming values directly into their final target index:
$$\text{targetIndex} = \text{isLeftToRight} \ ? \ i : (\text{levelSize} - 1 - i)$$
This achieves **$O(1)$ additional space overhead** and **zero extra memory copies**!

---

### 1.5 N-ary Tree Traversal & Left-Child Right-Sibling (LCRS) Binary Representation

In real-world software engineering, tree topologies are rarely strictly binary. Hierarchical file systems, DOM trees, organizational hierarchies, and compiler abstract syntax trees have nodes with **arbitrary numbers of children** ($N$-ary trees).

```csharp
// Standard N-ary Tree Node Representation
public class Node {
    public int val;
    public IList<Node> children;
}
```

#### Traversal Generalization:
The `levelSize = queue.Count` snapshot generalizes effortlessly to $N$-ary trees:
Instead of inspecting `node.left` and `node.right`, iterate over `foreach (var child in node.children)` and enqueue non-null children.

#### The Memory Bottleneck of Standard N-ary Trees:
When each node holds `IList<Node> children` (backed by a dynamic array like `List<Node>`):
1. Every node allocates a separate list object header + array buffer on the heap.
2. In large trees (e.g. 10 million DOM nodes), this causes severe **heap fragmentation** and 32–48 bytes of pointer overhead per node just to manage empty or 1-element child lists!

#### The Left-Child Right-Sibling (LCRS) Invariant:
Any arbitrary $N$-ary tree can be encoded **without loss of information** as a strict binary tree using exactly two reference pointers:
- **`left` pointer:** Points to the node's **first child** (oldest child).
- **`right` pointer:** Points to the node's **immediate next sibling**.

```
N-ary Tree Representation:
          [ 1 ]
       /    |    \
     [ 2 ] [ 3 ] [ 4 ]
    /   \
  [ 5 ] [ 6 ]

Equivalent Left-Child Right-Sibling (LCRS) Binary Tree:
       [ 1 ]
       /
     [ 2 ] ────────► [ 3 ] ────────► [ 4 ]
     /
   [ 5 ] ──► [ 6 ]
```

**Architectural Advantage:** LCRS bounds the pointer fields to exactly **two reference pointers per node** (16 bytes on 64-bit platforms), eliminating list allocations completely while preserving deterministic $O(N)$ reconstruction.

---

## 2. 💻 DEMONSTRATE: Canonical Invariant Visualization & Algorithmic Mechanics

### 2.1 State Trace: Level Snapshot Execution

Consider tree:
```
         [ 3 ]             (Level 0)
        /     \
      [ 9 ]   [ 20 ]       (Level 1)
              /    \
            [ 15 ] [ 7 ]   (Level 2)
```

```
Initial: queue = [ 3 ]

Tier 0:
  Snapshot: levelSize = 1.
  i = 0: Dequeue 3. currentLevel = [ 3 ].
         Enqueue 3.left (9), Enqueue 3.right (20).
  Result += [ [3] ].
  Queue for next tier: [ 9, 20 ]

Tier 1:
  Snapshot: levelSize = 2.
  i = 0: Dequeue 9. currentLevel = [ 9 ].
         9 has no children.
  i = 1: Dequeue 20. currentLevel = [ 9, 20 ].
         Enqueue 20.left (15), Enqueue 20.right (7).
  Result += [ [9, 20] ].
  Queue for next tier: [ 15, 7 ]

Tier 2:
  Snapshot: levelSize = 2.
  i = 0: Dequeue 15. currentLevel = [ 15 ].
  i = 1: Dequeue 7. currentLevel = [ 15, 7 ].
  Result += [ [15, 7] ].
  Queue for next tier: [ ]

Queue is empty. Terminate!
Final Result: [ [3], [9, 20], [15, 7] ].
```

---

## 3. 🔬 COMPLEXITY & MATHEMATICAL INVARIANTS

### 3.1 Peak Queue Width Theorem

> [!TIP]
> ### 🧮 Mathematical Derivation of Maximum Queue Width
>
> In a binary tree of height $H$ with $N$ vertices:
> 1. The maximum number of nodes at any depth $d \in [0, H-1]$ is $2^d$.
> 2. For a complete binary tree, the maximum width $W$ occurs at the leaf tier (depth $H - 1$):
>    $$W = 2^{H-1}$$
> 3. Total nodes in a full tree of height $H$:
>    $$N = 2^H - 1 \implies 2^H = N + 1 \implies 2^{H-1} = \frac{N + 1}{2}$$
> 4. Therefore, for balanced/complete binary trees:
>    $$W = \left\lceil \frac{N}{2} \right\rceil = \mathbf{\Theta(N)}$$
>
> Thus, the worst-case auxiliary space complexity of tree BFS is **strictly $\Theta(N)$**. $\blacksquare$

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

#### Production C# Implementation

```csharp
using System.Collections.Generic;

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
            // Snapshot the count of nodes at current level
            int levelSize = queue.Count;
            var currentLevel = new List<int>(levelSize);

            for (int i = 0; i < levelSize; i++)
            {
                TreeNode node = queue.Dequeue();
                currentLevel.Add(node.val);

                if (node.left != null) queue.Enqueue(node.left);
                if (node.right != null) queue.Enqueue(node.right);
            }

            result.Add(currentLevel);
        }

        return result;
    }
}
```

#### Complexity
- **Time Complexity:** $O(N)$. Every node is enqueued and dequeued exactly once.
- **Space Complexity:** $O(W) = O(N)$ where $W$ is the maximum width of the tree.

---

### 4.2 Problem 2: [LeetCode 103] Binary Tree Zigzag Level Order Traversal (Medium)

> **Problem Description:**
> Given the `root` of a binary tree, return *the zigzag level order traversal of its nodes' values* (i.e., from left to right, then right to left for the next level and alternate between).
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[0, 2000]$.
> - $-100 \le \text{Node.val} \le 100$

#### Production C# Implementation (Zero-Reversal Index Placement)

```csharp
using System.Collections.Generic;

public class Solution
{
    public IList<IList<int>> ZigzagLevelOrder(TreeNode? root)
    {
        var result = new List<IList<int>>();
        if (root == null) return result;

        var queue = new Queue<TreeNode>();
        queue.Enqueue(root);

        bool leftToRight = true;

        while (queue.Count > 0)
        {
            int levelSize = queue.Count;
            // Pre-allocate array of exact size to avoid resizing and list reversing
            int[] row = new int[levelSize];

            for (int i = 0; i < levelSize; i++)
            {
                TreeNode node = queue.Dequeue();

                // Direct slot assignment based on zigzag direction
                int targetIdx = leftToRight ? i : (levelSize - 1 - i);
                row[targetIdx] = node.val;

                if (node.left != null) queue.Enqueue(node.left);
                if (node.right != null) queue.Enqueue(node.right);
            }

            result.Add(row);
            leftToRight = !leftToRight; // Toggle direction for next tier
        }

        return result;
    }
}
```

#### Complexity
- **Time Complexity:** $O(N)$. Zero reverse passes; each value is placed directly into its destination index.
- **Space Complexity:** $O(W) = O(N)$ for the queue buffer.

---

### 4.3 Problem 3: [LeetCode 107] Binary Tree Level Order Traversal II (Medium)

> **Problem Description:**
> Given the `root` of a binary tree, return *the bottom-up level order traversal of its nodes' values* (i.e., from left to right, level by level from leaf to root).
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[0, 2000]$.
> - $-1000 \le \text{Node.val} \le 1000$

#### Production C# Implementation (Standard BFS + Two-Pointer In-Place Reversal)

```csharp
using System.Collections.Generic;

public class Solution
{
    public IList<IList<int>> LevelOrderBottom(TreeNode? root)
    {
        var result = new List<IList<int>>();
        if (root == null) return result;

        var queue = new Queue<TreeNode>();
        queue.Enqueue(root);

        // 1. Collect levels standard top-down
        while (queue.Count > 0)
        {
            int levelSize = queue.Count;
            var currentLevel = new List<int>(levelSize);

            for (int i = 0; i < levelSize; i++)
            {
                TreeNode node = queue.Dequeue();
                currentLevel.Add(node.val);

                if (node.left != null) queue.Enqueue(node.left);
                if (node.right != null) queue.Enqueue(node.right);
            }

            result.Add(currentLevel);
        }

        // 2. In-place two-pointer reversal of the outer level list
        int left = 0;
        int right = result.Count - 1;
        while (left < right)
        {
            var temp = result[left];
            result[left] = result[right];
            result[right] = temp;
            left++;
            right--;
        }

        return result;
    }
}
```

---

### 4.4 Problem 4: [LeetCode 429] N-ary Tree Level Order Traversal (Medium)

> **Problem Description:**
> Given an $n$-ary tree, return the *level order traversal* of its nodes' values.
> Each node has an integer value `val` and a list of children `IList<Node> children`.

#### Production C# Implementation
```csharp
using System.Collections.Generic;

public class SolutionNaryLevelOrder
{
    public class Node
    {
        public int val;
        public IList<Node> children;

        public Node() { children = new List<Node>(); }
        public Node(int _val) { val = _val; children = new List<Node>(); }
        public Node(int _val, IList<Node> _children) { val = _val; children = _children; }
    }

    public IList<IList<int>> LevelOrder(Node? root)
    {
        var result = new List<IList<int>>();
        if (root == null) return result;

        var queue = new Queue<Node>();
        queue.Enqueue(root);

        while (queue.Count > 0)
        {
            int levelSize = queue.Count;
            var currentLevel = new List<int>(levelSize);

            for (int i = 0; i < levelSize; i++)
            {
                Node current = queue.Dequeue();
                currentLevel.Add(current.val);

                if (current.children != null)
                {
                    foreach (var child in current.children)
                    {
                        if (child != null)
                        {
                            queue.Enqueue(child);
                        }
                    }
                }
            }

            result.Add(currentLevel);
        }

        return result;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — Every node and child pointer is visited exactly once.
- **Space Complexity:** $O(W) \le O(N)$ where $W$ is the maximum breadth tier of the tree.

---

## 5. ⚡ HARDWARE & SYSTEMS CONNECTIONS

### 5.1 Memory Allocation Locality: Pre-allocated List Capacities

In .NET, declaring `new List<int>()` creates an empty list with capacity 0.
- When elements are added, the list allocates an array of capacity 4, then 8, 16, 32, etc.
- If a tree level has 500 nodes, adding without capacity triggers **7 array re-allocations and memory copies** for that single level!
- Writing `new List<int>(levelSize)` allocates exactly one array of size 500 once, eliminating memory churn and Gen 0 GC collections.

### 5.2 Systems Distributed Multicast Spanning Trees
- In distributed systems (e.g. Apache Kafka consumer group coordination, IP Multicast), message dissemination utilizes a **Minimum Spanning Tree (MST)**.
- Packet broadcast flows level-by-level using BFS wavefronts, ensuring all nodes at distance $d$ receive network frames concurrently before tier $d + 1$.

---

## 6. ⚠️ DAILY ERROR LOG & COMMON TRAPS

### Trap 1: Dynamic Evaluation of `queue.Count` in Inner Loop
- **The Bug:** Writing `for (int i = 0; i < queue.Count; i++)`.
- **The Failure:** As children are enqueued, `queue.Count` changes dynamically! The loop never finishes or groups multiple levels into a single row.
- **The Fix:** **Always snapshot `int levelSize = queue.Count;`** into a local variable before the loop.

### Trap 2: Enqueuing Null Nodes
- **The Bug:** Writing `queue.Enqueue(node.left)` without checking `if (node.left != null)`.
- **The Failure:** `null` values enter the queue, causing `NullReferenceException` on subsequent `node.val` access.
- **The Fix:** Guard every enqueue: `if (node.left != null) queue.Enqueue(node.left);`.

### Trap 3: Memory Bloat from `LinkedListNode` in Zigzag
- **The Bug:** Using `LinkedList<int>.AddFirst()` to reverse odd tiers.
- **The Failure:** Every insertion allocates a `LinkedListNode` object on the heap, producing thousands of small object allocations.
- **The Fix:** Allocate `int[] row = new int[levelSize]` and assign `row[levelSize - 1 - i] = node.val`.

---

## 7. 🎯 DAILY CHECKPOINT & SELF-ASSESSMENT

### 1. Conceptual Verification
1. In a balanced binary tree of $1,000,000$ nodes, compare the peak memory usage of recursive DFS ($O(H)$) versus queue-based BFS ($O(W)$). What is the exact ratio of peak memory?
2. In Left-Child Right-Sibling (LCRS) representation, how can an arbitrary node with 100 children be represented using only binary pointers without dynamic list allocations?
3. How does the level-order BFS algorithm adapt when transitioning from a strict binary tree to an $N$-ary tree? Explain why the time complexity remains strictly $O(N)$.
2. Why does Breadth-First Search on a tree require **no** `visited` set or boolean matrix, whereas BFS on a graph strictly requires one?
3. How does direct array index assignment `row[levelSize - 1 - i] = node.val` eliminate the memory overhead of reversing lists in Zigzag traversal?

### 2. Implementation Audit
- In your `LevelOrder` solution, verify that `new List<int>(levelSize)` is pre-allocated. Trace what happens to runtime performance when capacity is omitted for a tree with $100,000$ leaves.

---
*Next Module: **Week 10 — Day 68: Tree Symmetry, Isomorphism, Inversion & Structural Equivalence (LeetCode 100, 101, 226)***
