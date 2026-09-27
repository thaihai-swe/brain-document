---
title: "Week 11 — Day 75: Binary Tree Boundary Traversal & Vertical Order Traversal"
---

# Week 11 — Day 75: Binary Tree Boundary Traversal & Vertical Order Traversal

Welcome to **Day 75 of your DSA Mastery Journey**!

Yesterday in [Day 74](./Week%2011%20%E2%80%94%20Day%2074:%20Lowest%20Common%20Ancestor%20(LCA)%20in%20Binary%20Trees.md), we mastered the 4 structural topologies of Lowest Common Ancestor (LCA) and the two-pointer linked-list reduction.

Today, we transition from ancestor path aggregations into **Advanced Spatial & Geometric Tree Traversals**:
1. **The Anti-Clockwise Boundary Contour ([LeetCode 545]):** Decomposing the tree boundary into 4 decoupled, non-overlapping passes (Root $\to$ Left Boundary $\to$ All Leaves $\to$ Right Boundary).
2. **The Boundary Navigation Laws:** How to navigate the boundary when nodes have missing children without getting trapped in interior subtrees.
3. **The 2D Cartesian Tree Coordinate System:** Mapping binary tree nodes onto a 2D grid $(r, c)$ with column offsets.
4. **Single-Pass BFS Vertical Grouping ([LeetCode 314]):** Eliminating hash map key sorting via `minCol` and `maxCol` tracking to achieve strict $\Theta(N)$ linear time.
5. **Multi-Criteria Sorted Vertical Traversal ([LeetCode 987]):** Resolving coordinate collisions $(r, c)$ with deterministic value tie-breaking.
6. **Real-World Systems Architecture:** Ray-tracing bounding volume hierarchy (BVH) boundary extraction and UI layout engine column projections.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 75 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│   PART I: BOUNDARY CONTOUR      │                                     │   PART II: VERTICAL 2D GRIDS    │
│  Anti-Clockwise Perimeter DFS   │                                     │  BFS Wavefront & Range Tracking │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Decoupled 4-Pass Architecture │                                     │ • 2D Plane: (Row r, Column c)   │
│ • Root Non-Leaf Invariant       │                                     │ • LC 314: BFS Natural Row Order │
│ • Left Spine (Top-Down Non-Leaf)│                                     │ • MinCol / MaxCol O(N) Pruning  │
│ • Unified Leaves (Left-to-Right)│                                     │ • LC 987: (Col, Row, Val) Sort  │
│ • Right Spine (Bottom-Up Unwind)│                                     │ • Top View & Bottom View Prims  │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* **Boundary Traversal** extracts the anti-clockwise outer perimeter of a binary tree starting from the root, traversing down the left boundary, across all leaf nodes left-to-right, and up the right boundary. **Vertical Order Traversal** projects nodes onto a 2D Cartesian coordinate plane where the root is at $(r=0, c=0)$, mapping nodes into columns by horizontal offset $c$.
  - *Core Invariants:*
    1. **Boundary Non-Leaf Invariant:** Left boundary and right boundary traversals strictly exclude leaf nodes to prevent duplicate emissions with the leaf-collection pass.
    2. **Anti-Clockwise Sequence Invariant:** $\text{Boundary} = [\text{Root}] + \text{LeftBoundary}(\text{top-down}) + \text{AllLeaves}(\text{left-to-right}) + \text{RightBoundary}(\text{bottom-up})$.
    3. **Column Coordinate Invariant:** A left child transitions $(r+1, c-1)$, while a right child transitions $(r+1, c+1)$.
  - *Misconception Check:* On the left boundary, if `node.left` is `null`, the boundary does **not** stop! It follows `node.right` (as long as `node.right` is not a leaf). Symmetrically, on the right boundary, if `node.right` is `null`, it follows `node.left`.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the combinatorial complexity and duplicate-node edge cases of attempting to trace the boundary in a single tangled traversal by cleanly separating it into 3 isolated concerns.
  - *Complexity Advantage:* Solves boundary traversal in a single composite pass in $\Theta(N)$ time and $O(H)$ space. Solves vertical order traversal in strictly $\Theta(N)$ time via BFS coordinate grouping, bypassing expensive $O(N \log N)$ sorting.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose / Signal Words:* "Boundary of binary tree", "anti-clockwise perimeter", "vertical order traversal", "columns from left to right", "top view / bottom view of tree".
  - *When to Avoid / Failure Modes:* Do NOT use DFS for LeetCode 314 if you want to avoid sorting: DFS explores depth before width, which scrambles row ordering within columns and requires sorting by depth. BFS naturally guarantees top-to-bottom row ordering!
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* BFS queue storing `(TreeNode Node, int Col)` value tuples directly on the managed heap; `Dictionary<int, List<int>>` bucket storage; thread call stack unwinding for bottom-up right boundary reversal.
  - *Production Systems:* 2D convex hull / silhouette generation in computer graphics, 3D ray-tracing bounding volume hierarchy (BVH) occlusion culling, layout reflow engines in browser rendering pipelines.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "For boundary traversal, I decouple the problem into 4 clean stages: add the root if it is not a leaf, traverse the left boundary top-down excluding leaves, collect all leaves left-to-right via in-order DFS, and collect the right boundary bottom-up excluding leaves via postorder unwinding. For vertical order traversal, I use BFS with column coordinates, tracking minimum and maximum column indices to output columns in $O(N)$ time without sorting."
  - *Interviewer Evaluation Lens:* Checks whether the candidate separates leaf collection from boundary spines (preventing duplicate emissions), handles single-child boundary fallbacks, understands why BFS eliminates sorting in LC 314, and correctly implements multi-key tie-breaking in LC 987.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:* Boundary: $\Theta(N)$ time, $O(H)$ space; Vertical Order (LC 314): $\Theta(N)$ time, $O(N)$ space; Multi-Criteria Vertical Order (LC 987): $O(N \log N)$ time, $O(N)$ space.
  - *State Transition Trace (LC 314 BFS):*
    `Queue: [(root, 0)] -> Dequeue (u, c) -> dict[c].Add(u.val) -> minCol = min(minCol, c), maxCol = max(maxCol, c) -> Enqueue (u.left, c-1), (u.right, c+1) -> Loop c from minCol to maxCol`.

---

### 1.1 The Anti-Clockwise Boundary Decomposition

The boundary of a binary tree is defined as the anti-clockwise path around its outer contour:
1. **The Root Node** (if it is not a leaf).
2. **The Left Boundary:** The path from the root's left child down to the leftmost non-leaf node.
3. **The Leaves:** All leaf nodes in the entire tree, visited strictly from left to right.
4. **The Right Boundary:** The path from the rightmost non-leaf node up to the root's right child (reversed).

```
                      [ 1 ] (Root)
                    /       \
 (Left Boundary) [ 2 ]     [ 3 ] (Right Boundary - Bottom Up)
                 /   \         \
              [ 4 ]  [ 5 ]     [ 6 ]
                     /   \     /
                   [ 7 ] [ 8 ][ 9 ]
                   ▲     ▲    ▲
                   └─────┴────┴── (All Leaves - Left to Right)

Anti-Clockwise Order: [ 1, 2, 4, 7, 8, 9, 6, 3 ]
```

> [!IMPORTANT]
> ### 💡 The Unified Leaf Collection Invariant
> Trying to collect leaves as part of the left or right boundary traversals leads to horrific edge cases where leaves in interior subtrees are missed or emitted in the wrong order.
> **The Golden Rule:** Left and right boundary traversals must **strictly skip all leaf nodes**. All leaves are collected in a single, separate in-order/pre-order traversal of the entire tree!

---

### 1.2 Boundary Navigation Laws: The Single-Child Fallback

When traversing the left boundary, what happens if a node has **no left child**?
- Does the left boundary stop? **NO!**
- If `node.left == null`, the outer left contour continues down `node.right`!
- The left boundary only stops when a node is a **leaf** (`node.left == null && node.right == null`).

Symmetrically, for the right boundary:
- If `node.right != null`, advance down `node.right`.
- If `node.right == null`, the outer right contour continues down `node.left`!
- The right boundary stops when a node is a leaf.

```csharp
// Left Boundary Navigation Rule:
void AddLeftBoundary(TreeNode? node, List<int> result)
{
    var curr = node;
    while (curr != null)
    {
        if (!IsLeaf(curr)) result.Add(curr.val);
        curr = (curr.left != null) ? curr.left : curr.right;
    }
}
```

---

### 1.3 The 2D Cartesian Tree Coordinate System

Every node in a binary tree can be uniquely mapped to a coordinate pair $(r, c)$ in a 2D Cartesian plane:
- **Root Node:** Assigned $(r=0, c=0)$.
- **Left Child:** Moves down and left $\implies (r+1, c-1)$.
- **Right Child:** Moves down and right $\implies (r+1, c+1)$.

```
Column:       -2        -1         0        +1        +2
Row 0:                            [ 3 ]
                                 /     \
Row 1:                    [ 9 ]         [ 20 ]
                                        /    \
Row 2:                               [ 15 ]  [ 7 ]

Column -1: [ 9 ]
Column  0: [ 3, 15 ]
Column +1: [ 20 ]
Column +2: [ 7 ]
```

---

## 2. 🔬 ANALYZE: Complexity & Coordinate Collision Mechanics

### 2.1 The Range Optimization: Eliminating Sort in LeetCode 314

In LeetCode 314, nodes in the same column must appear from **top to bottom** (increasing row index $r$).
If multiple nodes have the same row and column, they must appear in **left-to-right arrival order**.

- **Why BFS is Provably Optimal:**
  Because Breadth-First Search traverses level by level ($r=0, r=1, r=2 \dots$), nodes are **naturally enqueued and processed in strictly increasing order of row $r$**!
  Within the same level, the left child is enqueued before the right child, guaranteeing left-to-right arrival order!

- **Eliminating Dictionary Key Sorting:**
  If we use a standard `Dictionary<int, List<int>>`, keys can be negative (e.g. $-3, -2, -1, 0, 1$).
  Sorting the keys takes $O(K \log K)$ where $K$ is the number of distinct columns.
  Instead, we track two integer scalars:
  $$\text{minCol} = \min(c) \quad \text{and} \quad \text{maxCol} = \max(c)$$
  After BFS completes, we iterate directly from `minCol` to `maxCol`:
  ```csharp
  for (int c = minCol; c <= maxCol; c++)
  {
      result.Add(columnMap[c]);
  }
  ```
  This reduces column extraction to strictly **$\Theta(N)$ linear time**!

---

### 2.2 Collision Mechanics: LeetCode 314 vs. LeetCode 987

Big Tech interviewers frequently test the difference between these two variants:

| Dimension | LeetCode 314 (Medium) | LeetCode 987 (Hard) |
| :--- | :--- | :--- |
| **Column Ordering** | Columns from left to right (increasing $c$) | Columns from left to right (increasing $c$) |
| **Row Ordering** | Rows from top to bottom (increasing $r$) | Rows from top to bottom (increasing $r$) |
| **Same $(r, c)$ Collision** | **Arrival order** (order visited by BFS) | **Ascending Node Value** (`node.val` sorted!) |
| **Optimal Traversal** | **BFS** with `minCol`/`maxCol` tracking | **DFS or BFS** + Multi-Key Sort |
| **Time Complexity** | $\mathbf{\Theta(N)}$ linear time | $\mathbf{O(N \log N)}$ due to value sorting |
| **Auxiliary Space** | $O(N)$ queue and dictionary | $O(N)$ list of coordinate tuples |

---

## 3. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

---

### 3.1 Problem 1: [LeetCode 545] Boundary of Binary Tree (Medium)

> **Problem Description:**
> The **boundary** of a binary tree is the concatenation of the **root**, the **left boundary**, the **leaves** ordered from left-to-right, and the **reverse order of the right boundary**.
> - The **left boundary** is the path from the root to the leftmost non-leaf node (advance left if possible, else right).
> - The **right boundary** is the path from the root to the rightmost non-leaf node (advance right if possible, else left).
> - If the root has no left child, the left boundary is empty. If the root has no right child, the right boundary is empty.
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[1, 10^4]$.
> - $-1000 \le \text{Node.val} \le 1000$

#### Production C# Implementation

```csharp
using System.Collections.Generic;

public class Solution545
{
    public IList<int> BoundaryOfBinaryTree(TreeNode? root)
    {
        var result = new List<int>();
        if (root == null) return result;

        // 1. Root Node: Add root if it is NOT a leaf
        if (!IsLeaf(root))
        {
            result.Add(root.val);
        }

        // 2. Left Boundary: Top-down traversal excluding leaves
        AddLeftBoundary(root.left, result);

        // 3. Leaves: Unified in-order traversal of the entire tree
        AddLeaves(root, result);

        // 4. Right Boundary: Bottom-up traversal excluding leaves (reversed)
        AddRightBoundary(root.right, result);

        return result;
    }

    private static bool IsLeaf(TreeNode node)
    {
        return node.left == null && node.right == null;
    }

    private static void AddLeftBoundary(TreeNode? node, List<int> result)
    {
        var curr = node;
        while (curr != null)
        {
            if (!IsLeaf(curr))
            {
                result.Add(curr.val);
            }

            // Boundary navigation fallback rule
            curr = (curr.left != null) ? curr.left : curr.right;
        }
    }

    private static void AddLeaves(TreeNode? node, List<int> result)
    {
        if (node == null) return;

        if (IsLeaf(node))
        {
            result.Add(node.val);
            return;
        }

        AddLeaves(node.left, result);
        AddLeaves(node.right, result);
    }

    private static void AddRightBoundary(TreeNode? node, List<int> result)
    {
        // Use call stack unwinding to naturally reverse the order (bottom-up)!
        if (node == null || IsLeaf(node)) return;

        // Advance right if possible, else fallback to left
        if (node.right != null)
        {
            AddRightBoundary(node.right, result);
        }
        else
        {
            AddRightBoundary(node.left, result);
        }

        // Add to result AFTER recursive call returns (reverses sequence)
        result.Add(node.val);
    }
}
```

---

### 3.2 Problem 2: [LeetCode 314] Binary Tree Vertical Order Traversal (Medium)

> **Problem Description:**
> Given the `root` of a binary tree, return *the vertical order traversal of its nodes' values* (i.e., from top to bottom, column by column).
> If two nodes are in the same row and column, the order should be from **left to right**.
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[0, 100]$.
> - $-100 \le \text{Node.val} \le 100$

#### Production C# Implementation (Optimal $\Theta(N)$ without Sorting)

```csharp
using System;
using System.Collections.Generic;

public class Solution314
{
    public IList<IList<int>> VerticalOrder(TreeNode? root)
    {
        var result = new List<IList<int>>();
        if (root == null) return result;

        // Map: Column Index -> List of node values in arrival order
        var columnMap = new Dictionary<int, List<int>>();
        
        // Queue stores (TreeNode Node, int Col)
        var queue = new Queue<(TreeNode Node, int Col)>();
        queue.Enqueue((root, 0));

        int minCol = 0;
        int maxCol = 0;

        // BFS: Naturally visits rows from top to bottom
        while (queue.Count > 0)
        {
            var (node, col) = queue.Dequeue();

            if (!columnMap.TryGetValue(col, out var list))
            {
                list = new List<int>();
                columnMap[col] = list;
            }
            list.Add(node.val);

            minCol = Math.Min(minCol, col);
            maxCol = Math.Max(maxCol, col);

            if (node.left != null)
            {
                queue.Enqueue((node.left, col - 1));
            }
            if (node.right != null)
            {
                queue.Enqueue((node.right, col + 1));
            }
        }

        // Extract columns in strictly linear time from minCol to maxCol
        for (int c = minCol; c <= maxCol; c++)
        {
            if (columnMap.TryGetValue(c, out var colList))
            {
                result.Add(colList);
            }
        }

        return result;
    }
}
```

---

### 3.3 Problem 3: [LeetCode 987] Vertical Order Traversal of a Binary Tree (Hard)

> **Problem Description:**
> Given the `root` of a binary tree, calculate the vertical order traversal of the binary tree.
> For each node at position $(row, col)$, its left child will be at $(row + 1, col - 1)$, and its right child will be at $(row + 1, col + 1)$.
> The vertical-order traversal of a binary tree is a list of top-to-bottom orderings for each column index starting from the leftmost column and ending on the rightmost column.
> **If two nodes have the same position $(row, col)$, they must be ordered by their values in ascending order.**
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[1, 1000]$.
> - $0 \le \text{Node.val} \le 1000$

#### Production C# Implementation (Multi-Key Sorting)

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public class Solution987
{
    // Coordinate Item: (int Col, int Row, int Val)
    private readonly struct NodeCoord : IComparable<NodeCoord>
    {
        public readonly int Col;
        public readonly int Row;
        public readonly int Val;

        public NodeCoord(int col, int row, int val)
        {
            Col = col;
            Row = row;
            Val = val;
        }

        // 1. Column ascending
        // 2. Row ascending (top to bottom)
        // 3. Value ascending (tie-breaker for coordinate collision)
        public int CompareTo(NodeCoord other)
        {
            if (Col != other.Col) return Col.CompareTo(other.Col);
            if (Row != other.Row) return Row.CompareTo(other.Row);
            return Val.CompareTo(other.Val);
        }
    }

    public IList<IList<int>> VerticalTraversal(TreeNode? root)
    {
        var result = new List<IList<int>>();
        if (root == null) return result;

        var nodes = new List<NodeCoord>();
        
        // Collect coordinates via DFS or BFS
        Dfs(root, 0, 0, nodes);

        // Sort all coordinates by (Col, Row, Val)
        nodes.Sort();

        // Group into column lists
        int? currentCol = null;
        List<int>? currentGroup = null;

        foreach (var item in nodes)
        {
            if (currentCol == null || item.Col != currentCol.Value)
            {
                currentGroup = new List<int>();
                result.Add(currentGroup);
                currentCol = item.Col;
            }
            currentGroup!.Add(item.Val);
        }

        return result;
    }

    private static void Dfs(TreeNode? node, int row, int col, List<NodeCoord> nodes)
    {
        if (node == null) return;

        nodes.Add(new NodeCoord(col, row, node.val));
        Dfs(node.left, row + 1, col - 1, nodes);
        Dfs(node.right, row + 1, col + 1, nodes);
    }
}
```

---

## 4. 🏋️ PRACTICE: Guided Exercises & Problem Set

### 4.1 Guided Exercises

#### Exercise 1: [LeetCode 199] Binary Tree Right Side View (Medium)
- **Problem Statement:** Return the values of the nodes you can see ordered from top to bottom when standing on the right side of the tree.
- **Trigger Clue:** "Right side view" $\implies$ the last node visited in each BFS level, or pre-order DFS with `root -> right -> left` checking `depth == result.Count`.
- **Target Complexity:** $\Theta(N)$ time, $O(D)$ where $D$ is the maximum tree diameter.

#### Exercise 2: Top View of a Binary Tree (Classic)
- **Problem Statement:** Print the nodes visible when looking at the tree from the top.
- **Trigger Clue:** In each column $c$, only the node with the **minimum row index $r$** is visible!
- **Template Hint:** Run BFS vertical traversal as in LeetCode 314. The **first** node enqueued into each column $c$ is the topmost visible node. Simply record the first arrival and ignore subsequent nodes in the same column!
- **Target Complexity:** $\Theta(N)$ time, $O(N)$ space.

#### Exercise 3: Bottom View of a Binary Tree (Classic)
- **Problem Statement:** Print the nodes visible when looking at the tree from the bottom.
- **Trigger Clue:** In each column $c$, only the node with the **maximum row index $r$** is visible!
- **Template Hint:** Run BFS vertical traversal. Overwrite `map[col] = node.val` on every visit. Because BFS processes rows top-to-bottom, the last node to overwrite each column will be the bottom-most node!
- **Target Complexity:** $\Theta(N)$ time, $O(N)$ space.

---

## 5. ⚡ HARDWARE & SYSTEMS CONNECTIONS

### 5.1 2D Silhouette Rendering & Occlusion Culling
In game engines and 3D graphics (Unreal / Unity), scenes are organized into **Bounding Volume Hierarchies (BVHs)**—binary trees of Axis-Aligned Bounding Boxes (AABBs):
- To perform **silhouette edge detection** or shadows, the rendering pipeline extracts the 2D boundary of the BVH tree projected onto screen space.
- Decoupling the perimeter into boundary contours enables hardware rasterizers to perform early-Z rejection on interior occluded primitives, saving millions of pixel shader invocations per frame.

### 5.2 UI Layout Engines: Columnar Reflows
Modern web browser layout engines (Blink, WebKit) render CSS Grid and Flexbox layouts using tree structures (Render Trees):
- When rendering multi-column newspaper layouts or masonry grids, elements are mapped to column offsets $c$.
- By tracking `minCol` and `maxCol` in a single layout pass, the browser allocates contiguous memory buffers for each column without invoking $O(N \log N)$ sorting routines.

---

## 6. ⚠️ DAILY ERROR LOG & COMMON TRAPS

### Trap 1: Emitting the Root Node Twice
- **The Bug:** Adding `result.Add(root.val)` unconditionally, and then having the leaf collection pass process the root when `root` is a single isolated node (`[1]`).
- **The Failure:** Returns `[1, 1]` instead of `[1]`.
- **The Fix:** Only add the root if it is **not** a leaf: `if (!IsLeaf(root)) result.Add(root.val);`.

### Trap 2: Terminating the Boundary Early on Null Children
- **The Bug:** Writing `curr = curr.left;` on the left boundary and stopping when `curr == null`.
- **The Failure:** If a left boundary node has no left child but has a right child, the boundary prematurely stops, omitting valid boundary nodes!
- **The Fix:** Use the fallback rule: `curr = (curr.left != null) ? curr.left : curr.right;`.

### Trap 3: Using DFS for LeetCode 314
- **The Bug:** Running standard DFS and appending nodes to `columnMap[col]`.
- **The Failure:** DFS visits the entire left subtree down to depth 10 before visiting the right child at depth 1. If both share column 0, the node at depth 10 is inserted *before* the node at depth 1, violating top-to-bottom row ordering!
- **The Fix:** **Always use BFS for LeetCode 314** to guarantee natural non-decreasing row arrival order.

---

## 7. 🎯 DAILY CHECKPOINT & SELF-ASSESSMENT

### 1. Conceptual Verification
1. In [LeetCode 545] (Boundary of Binary Tree), why must leaves be collected in a separate unified pass rather than being included during the left and right boundary traversals?
2. In [LeetCode 314], why does BFS naturally preserve top-to-bottom row ordering without needing explicit sorting by row, whereas DFS does not?
3. In [LeetCode 987], what edge case occurs when two nodes occupy the exact same $(r, c)$ coordinate, and how does `NodeCoord.CompareTo` resolve it?

### 2. Implementation Audit
- Trace your `BoundaryOfBinaryTree` on a tree with only a root and a single right child: `root = [1, null, 2]`.
  What does each phase return? Does node `2` get emitted once or twice?

---
*Next Module: **Week 11 — Day 76: Flatten Binary Tree to Linked List & In-Place Pointer Rewiring (LeetCode 114, 430)***
