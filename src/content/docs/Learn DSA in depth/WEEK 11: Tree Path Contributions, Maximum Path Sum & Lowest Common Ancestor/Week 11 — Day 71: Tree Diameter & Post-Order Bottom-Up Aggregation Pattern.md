---
title: "Week 11 — Day 71: Tree Diameter & Post-Order Bottom-Up Aggregation Pattern"
---

# Week 11 — Day 71: Tree Diameter & Post-Order Bottom-Up Aggregation Pattern

Welcome to **Week 11: Tree Path Contributions, Maximum Path Sum & Lowest Common Ancestor**!

In Week 10, we mastered hierarchical memory structures, recursive and iterative state machines, and level-order spatial BFS. Now, we enter the most intellectually rewarding and frequently tested domain of tree algorithms: **Path Contribution Models & Ancestor Topologies**.

Today, we decode the foundational engine of all tree path problems:
1. **The Diameter Invariant:** The definition, physical reality, and mechanics of the longest path between any two nodes.
2. **The Dual-Role Principle:** Why every node in a tree must compute two strictly distinct quantities:
   - A **local curved path** that turns at the node and updates a global maximum.
   - A **straight upward branch** that can be returned to its parent.
3. **The Simple Path Non-Bifurcation Law:** Why a path can never fork twice, and why returning a curved path to an ancestor corrupts the graph topology.
4. **General Undirected Tree Diameters:** The celebrated **Two-Pass BFS Theorem** for arbitrary graph trees.
5. **Canonical Problem Walkthroughs:** Production C# solutions for **LeetCode 543**, **LeetCode 1245**, and **LeetCode 687**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 71 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: THE DUAL-ROLE LAW   │                                     │     PART II: CANONICAL MODELS   │
│  Curved Path vs Straight Branch │                                     │     Binary & Undirected Trees   │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Local Turning Point Invariant │                                     │ • Binary Tree Diameter (LC 543) │
│ • No-Bifurcation Topology Rule  │                                     │ • Undirected 2-Pass BFS (LC 1245│
│ • Global Variable Accumulator   │                                     │ • Longest Univalue Path (LC 687)│
│ • Two-Pass BFS Diameter Theorem │                                     │ • Network Routing Latency Link  │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* The **Diameter of a Binary Tree** is the length of the longest path between any two vertices in the tree.
  - *Core Invariants:* Dual-Role Principle: At node $u$, the diameter through $u$ is the curved path $\text{LeftHeight} + \text{RightHeight}$, but node $u$ can only return a straight branch $1 + \max(\text{LeftHeight}, \text{RightHeight})$ to its parent; Non-Bifurcation Law: A simple path cannot branch into two sub-paths at the parent level; a parent can only continue along one child branch.
  - *Misconception Check:* The longest path does *not* necessarily pass through the root of the tree! The diameter can reside entirely within a deep, sprawling left or right subtree.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(N^2)$ all-pairs shortest path search or top-down recursive traversal.
  - *Complexity Advantage:* Calculates the global maximum path length in a single bottom-up $\Theta(N)$ pass.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Diameter of Binary Tree" (LC 543), "Longest Univalue Path" (LC 687), general tree diameter. Signal words: "diameter of tree", "longest path between two nodes", "path may or may not pass through root".
  - *When to Avoid / Failure Modes:* When node values or edge weights can be negative (requires maximum path sum contribution model instead).
- **4. WHERE:**
  - *Physical CLR Memory:* Global or `ref` integer `maxDiameter` variable; call stack frames store local subtree heights.
  - *Production Systems:* Network diameter routing latency bounds, distributed cluster communication worst-case hops.
- **5. WHO:**
  - *Spoken Script:* "The diameter of a tree is the maximum curved path between any two nodes. In a postorder DFS, each node plays a dual role: it computes the curved path through itself as left height plus right height to update a global maximum, but returns only the single longest straight branch to its parent, guaranteeing $O(N)$ time."
  - *Interviewer Evaluation Lens:* Checks dual-role distinction (curved path update vs. straight branch return), edge-counting vs. node-counting convention, and $O(N)$ proof.
- **6. HOW:**
  - *Cost Model:* Time: $\Theta(N)$ single pass; Space: $O(H)$ recursion call stack space.
  - *State Transition Trace (LC 543):* `Dfs(node): left = Dfs(node.left); right = Dfs(node.right); maxDiameter = max(maxDiameter, left + right); return 1 + max(left, right)`.


### 1.1 Physical Mental Model: The Mountain Pass & The Wishbone Rule

#### The Wishbone & The Hiking Trail (The Non-Bifurcation Law)
Imagine planning a single continuous hiking trek across a mountain range (a simple path):
- **The Mountain Pass (The Apex):**
  - Every mountain trek has a single highest point: the **Pass (Apex)**.
  - You hike up from a valley on the left, cross over the pass at node $u$, and hike down into a valley on the right.
  - This forms a complete, beautiful **Curved Trail**: $\text{Left Valley} + \text{Right Valley}$.
- **The Basecamp Helicopter Call (The Upward Return):**
  - Now, imagine a helicopter at your parent node asking: *"Can we extend this trail up to our camp?"*
  - You can only offer the helicopter **ONE single continuous ridge line**!
  - If you try to give the helicopter both the left trail and the right trail, you create a **fork in the road (a $Y$-junction / bifurcation)**. A hiker cannot walk in two directions simultaneously!
  - Therefore, you must make a painful choice: pick the **single deepest valley** ($\max(\text{Left}, \text{Right})$), add your own step ($+1$), and send that straight ridge up to your parent!

```
                    THE WISHBONE DUAL-ROLE APEX TOPOLOGY
   
                                [ Parent ]
                                    ▲
                         1 + max(L, R) = 3 (Single straight ridge offered upward!)
                                    │
                              ╭───[ u ]───╮  ◄── APEX / TURNING POINT
                              │           │
                     Left = 2 │           │ Right = 1
                              ▼           ▼
                           [ L1 ]       [ R1 ]
                             │
                           [ L2 ]
   
   Curved Trail Length (Local Diameter) = Left + Right = 2 + 1 = 3 edges!
   Potential Global Maximum: Updates maxDiameter = max(maxDiameter, 3).
   Upward Trail Offered to Parent = 1 + max(2, 1) = 3 nodes (2 edges).
```

---

### 1.2 What is the Diameter of a Tree?

The **Diameter** of a tree is the length (measured in edges or nodes) of the **longest simple path between ANY two arbitrary nodes** in the tree:

> [!IMPORTANT]
> ### 💡 The Non-Root Path Reality
> The longest path in a tree does **NOT** necessarily pass through the Root node!
>
> In an unbalanced or lop-sided tree, the diameter may reside entirely within a deep, dense subtree:
> ```
>                     [ Root ]
>                      /
>                  [ A ]
>                  /   \
>              [ B ]   [ C ]
>              /           \
>          [ D ]           [ E ]
>          /                   \
>      [ F ]                   [ G ]
>
> The Diameter is F -> D -> B -> A -> C -> E -> G (Length = 6 edges).
> It never touches the Root!
> ```

---

### 1.2 The Dual-Role Principle: Curved Path vs. Straight Branch

Every simple path in a rooted tree has a **unique apex node** (the "highest" node along the path, which has minimum depth). For that specific path, the apex node acts as the **turning point**:

```
                       [ Parent ]
                           ▲
                           │ (Can ONLY return a SINGLE straight branch!)
                           │
                     [ Apex Node u ]  <─── TURNING POINT / APEX
                      /           \
                     /             \
             [ Left Branch ]   [ Right Branch ]
                    │                 │
                    ▼                 ▼
                 (Curved Path = Left + Right)
```

At any node $u$:
1. **Local Role (Curved Path):**
   Node $u$ can act as the **apex** of a path connecting a node in its left subtree to a node in its right subtree:
   $$\text{Local Curved Path Length} = \text{leftHeight} + \text{rightHeight}$$
   This curved path can potentially beat the global maximum diameter!
2. **Upward Role (Straight Branch to Parent):**
   Node $u$ can **ONLY** extend a single continuous branch upward to its parent:
   $$\text{Return Value to Parent} = 1 + \max(\text{leftHeight}, \text{rightHeight})$$

---

### 1.3 The Non-Bifurcation Topological Law

Why can a node **NEVER** return $\text{leftHeight} + \text{rightHeight}$ to its parent?

> [!CAUTION]
> ### ⚠️ The Simple Path Non-Bifurcation Law
> By graph theory definition, a **Simple Path** is a sequence of edges that visits each vertex **at most once**.
> In any simple path, every intermediate vertex must have a degree of **exactly 2** (one edge entering, one edge exiting).
>
> If node $u$ returned its curved path ($\text{left} + \text{right}$) upward to its parent, the parent would extend an edge into $u$.
> Vertex $u$ would then have **3 incident edges on the path**:
> 1. Edge to parent
> 2. Edge to left child
> 3. Edge to right child
>
> This creates a **fork / bifurcation** (a "T-junction"), which is a tree subgraph, **NOT a simple path**!

---

### 1.4 General Undirected Trees: The Two-Pass BFS Theorem

In an undirected, unweighted tree represented as an adjacency list `List<int>[] graph` (without a pre-designated root, as in [LeetCode 1245]):

> [!TIP]
> ### 🧮 The Two-Pass BFS Algorithm
> 1. **Pass 1:** Pick an arbitrary starting node $X$ (e.g., node 0). Run BFS to find the node $A$ that is **farthest away from $X$**.
> 2. **Pass 2:** Run BFS starting from node $A$ to find the node $B$ that is **farthest away from $A$**.
> 3. **The Result:** The distance between $A$ and $B$ is **the exact diameter of the tree**!
>
> **Time Complexity:** $2 \times O(V + E) = \mathbf{\Theta(V + E)}$—strictly optimal!

### 1.5 ⚙️ Core Operations Deep-Dive: Postorder Dual-Role Diameter Aggregation

#### Dimension 1: Operation Contract & Big-O Bounds
- **Operation Signature:** `int DiameterOfBinaryTree(TreeNode root)` with helper `int CalculateHeightAndDiameter(TreeNode node, ref int maxDiameter)`
- **Preconditions:**
  - `root` represents an acyclic binary tree containing $N \ge 0$ nodes.
  - Tree structure is immutable during traversal (read-only access).
- **Postconditions:**
  - Returns the length (in number of edges) of the longest simple path between any two vertices in the tree.
  - Leaves the input tree pointers and values completely unaltered.
- **Complexity Bounds:**
  - **Time Complexity:**
    - *Best Case:* $\Omega(N)$ — must traverse every vertex to guarantee finding the longest path.
    - *Average Case:* $\Theta(N)$ — single bottom-up postorder pass visiting each node exactly once.
    - *Worst Case:* $O(N)$ — linear chain degenerate trees.
  - **Auxiliary Space Complexity:**
    - *Best Case:* $O(\log N)$ stack frames on balanced trees.
    - *Worst Case:* $O(N)$ stack frames on degenerate skew trees.

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree
1. **Base Case:**
   - If `node == null`, return `0` (an empty subtree has edge height 0).
2. **Bottom-Up Traversal (Postorder):**
   - Recurse left: `leftHeight = CalculateHeightAndDiameter(node.left, ref maxDiameter)`.
   - Recurse right: `rightHeight = CalculateHeightAndDiameter(node.right, ref maxDiameter)`.
3. **Local Curved Apex Evaluation:**
   - Compute candidate diameter through current node: `curvedPath = leftHeight + rightHeight`.
   - Update accumulator: `maxDiameter = Math.Max(maxDiameter, curvedPath)`.
4. **Straight Branch Upward Return:**
   - A parent can only link to one child. Return longest single branch extending upwards:
     `return 1 + Math.Max(leftHeight, rightHeight)`.

```
                     [Visit Node u]
                            │
                     Is u == null?
                    /             \
              (Yes)/               \(No)
                  ▼                 ▼
               Return 0     leftHeight  = DFS(u.left)
                            rightHeight = DFS(u.right)
                                    │
                                    ▼
                         curvedPath = leftHeight + rightHeight
                         maxDiameter = max(maxDiameter, curvedPath)
                                    │
                                    ▼
                         Return 1 + max(leftHeight, rightHeight)
```

#### Dimension 3: Visual ASCII State Transitions
```
EXECUTION TRACE ON ASYMMETRIC TREE:
             [ 1 ]
            /     \
         [ 2 ]   [ 3 ]
         /   \
       [ 4 ] [ 5 ]
             /
           [ 6 ]

Node Processing Sequence (Bottom-Up Postorder):
1. Leaf [4]:
   left=0, right=0 => curved=0 => maxDiam=0 => returns 1.
2. Leaf [6]:
   left=0, right=0 => curved=0 => maxDiam=0 => returns 1.
3. Node [5]:
   left=1, right=0 => curved=1 => maxDiam=1 => returns 1 + max(1, 0) = 2.
4. Node [2]:
   left=1, right=2 => curved=1 + 2 = 3 edges (Path: 4 -> 2 -> 5 -> 6).
   maxDiam = max(1, 3) = 3!
   returns 1 + max(1, 2) = 3.
5. Leaf [3]:
   left=0, right=0 => curved=0 => returns 1.
6. Root [1]:
   left=3, right=1 => curved=3 + 1 = 4 edges (Path: 6 -> 5 -> 2 -> 1 -> 3).
   maxDiam = max(3, 4) = 4!
   returns 1 + max(3, 1) = 4.

GLOBAL MAX DIAMETER: 4 edges.
```

#### Dimension 4: Invariant Preservation Proof
- **Theorem (Completeness of Apex-Based Path Enumeration):**
  *Every simple path $P$ in a tree has a unique highest node $u = \text{LCA}(v_1, v_2)$ where $v_1, v_2$ are the path endpoints, and its length is identically $\text{Height}(P \cap T_{\text{left}}) + \text{Height}(P \cap T_{\text{right}})$.*
- **Proof:**
  1. Let $P$ be any simple path connecting vertices $v_1$ and $v_2$.
  2. Because $T$ is acyclic and rooted, there exists a unique node $u$ on $P$ with minimum depth (the apex / lowest common ancestor of $v_1$ and $v_2$).
  3. Path $P$ decomposes into two simple paths: a path from $u$ down to $v_1$ entirely inside $u$'s left child subtree (or equal to $u$), and a path from $u$ down to $v_2$ entirely inside $u$'s right child subtree (or equal to $u$).
  4. The maximum possible path length with apex $u$ is the sum of the longest downward branches in $u.left$ and $u.right$.
  5. By induction, postorder traversal visits all nodes, evaluating every potential apex $u \in V$.
  6. Therefore, the global maximum accumulator $\max_{u \in V} (\text{leftHeight}_u + \text{rightHeight}_u)$ evaluates the supremum over all simple paths, guaranteeing exact diameter calculation. $\blacksquare$

#### Dimension 5: Edge Case Matrix
| Edge Scenario | Trigger Condition | Algorithmic Guard / Resolution | Verification Invariant |
| :--- | :--- | :--- | :--- |
| **Empty Tree** | `root == null` | Guard returns `0` immediately | Diameter of empty tree is 0 |
| **Single-Node Tree** | $N = 1$ | Left and right heights are 0; curved path is $0 + 0 = 0$; returns 0 | Longest path has 0 edges |
| **Two-Node Tree** | Root with 1 child | Curved path equals $1 + 0 = 1$; returns 1 edge | 1 edge between root and child |
| **Linear Skew Chain** | $1 \to 2 \to 3 \dots \to N$ | At each node, one child height is 0; apex sum equals height of linear chain | Diameter equals $N - 1$ edges |
| **Edge vs Node Counting** | Problem specification variance | LeetCode 543 counts edges (heights return edges); LeetCode 1245 counts edges | Return $H_L + H_R$ for edges; $(H_L + H_R + 1)$ for nodes |

---

## 2. 💻 DEMONSTRATE: Canonical Invariant Visualization & Algorithmic Mechanics

### 2.1 State Trace: Dual-Role Postorder Aggregation (LeetCode 543)

Consider the binary tree:
```
           [ 1 ]
          /     \
       [ 2 ]    [ 3 ]
       /   \
     [ 4 ] [ 5 ]
```

```
Postorder Traversal Trace:
Tracking: globalMaxDiameter = 0.
Function returns: height of subtree (edges count).

1. Leaf 4:
   left = 0, right = 0.
   Curved diameter at 4 = 0 + 0 = 0.
   Return to parent = 1 + max(0, 0) = 1.

2. Leaf 5:
   left = 0, right = 0.
   Curved diameter at 5 = 0 + 0 = 0.
   Return to parent = 1 + max(0, 0) = 1.

3. Node 2:
   left = 1 (from leaf 4), right = 1 (from leaf 5).
   Local Curved Diameter at 2 = 1 + 1 = 2 edges (Path: 4 -> 2 -> 5).
   globalMaxDiameter = max(0, 2) = 2.
   Return to parent = 1 + max(1, 1) = 2 edges.

4. Leaf 3:
   left = 0, right = 0.
   Curved diameter at 3 = 0.
   Return to parent = 1 + max(0, 0) = 1 edge.

5. Root 1:
   left = 2 (from node 2), right = 1 (from node 3).
   Local Curved Diameter at 1 = 2 + 1 = 3 edges (Path: 4 -> 2 -> 1 -> 3 or 5 -> 2 -> 1 -> 3).
   globalMaxDiameter = max(2, 3) = 3.
   Return to caller = 1 + max(2, 1) = 3.

Final Result: globalMaxDiameter = 3 edges!
```

---

### 2.2 Visualizing the Two-Pass BFS Proof (General Undirected Tree)

```
       (u) ───────────────────── (v)   <--- True Diameter D = path(u, v)
        │                         │
        │                         │
       ...                       ...
        │                         │
        └──────── (X) ────────────┘
               (Start node)

1. BFS from arbitrary node X:
   Because a tree has no cycles, walking farthest from X inevitably drives
   the frontier outward to a peripheral boundary leaf.
   That leaf A is guaranteed to be an extremal endpoint (either u or v)!

2. BFS from A:
   Walking farthest from one end of the diameter (A) traverses all the way
   across the longest backbone of the tree, reaching the opposite end B.
```

---

## 3. 🔬 COMPLEXITY & MATHEMATICAL INVARIANTS

### 3.1 Theorem: Correctness of the Two-Pass BFS Diameter Algorithm

> [!TIP]
> ### 🧮 Proof by Contradiction
>
> Let $D = (u, v)$ be a diameter path of maximal length in tree $T$.
> Let $A$ be the node farthest from arbitrary start node $X$, found in Pass 1.
>
> We claim that $A$ must be an endpoint of **some** diameter of $T$.
>
> **Case 1: The path from $X$ to $A$ intersects the diameter path $(u, v)$ at some node $W$:**
> - $\text{dist}(X, A) \ge \text{dist}(X, u) \implies \text{dist}(X, W) + \text{dist}(W, A) \ge \text{dist}(X, W) + \text{dist}(W, u)$.
> - Subtracting $\text{dist}(X, W)$:
>   $$\text{dist}(W, A) \ge \text{dist}(W, u)$$
> - Now consider the path from $A$ to $v$ via $W$:
>   $$\text{dist}(A, v) = \text{dist}(A, W) + \text{dist}(W, v) \ge \text{dist}(u, W) + \text{dist}(W, v) = \text{dist}(u, v)$$
> - Since $\text{dist}(u, v)$ is the maximum diameter in the tree, $\text{dist}(A, v)$ cannot be strictly greater.
>   Therefore, $\text{dist}(A, v) = \text{dist}(u, v)$, proving $(A, v)$ is also a diameter!
>
> Thus, $A$ is guaranteed to be an endpoint of a diameter. A second BFS from $A$ will discover $B$ such that $\text{dist}(A, B)$ is the maximum diameter. $\blacksquare$

---

## 4. 🛠️ PRACTICE: Canonical Big Tech Problem Walkthroughs

---

### 4.1 Problem 1: [LeetCode 543] Diameter of Binary Tree (Easy)

> **Problem Description:**
> Given the `root` of a binary tree, return *the length of the **diameter** of the tree*.
> The diameter of a binary tree is the **length** of the longest path between any two nodes in a tree. This path may or may not pass through the `root`.
> The length of a path between two nodes is represented by the number of edges between them.
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[1, 10^4]$.
> - $-100 \le \text{Node.val} \le 100$

#### Production C# Implementation

```csharp
using System;

public class Solution
{
    private int _maxDiameter;

    public int DiameterOfBinaryTree(TreeNode? root)
    {
        _maxDiameter = 0;
        ComputeHeight(root);
        return _maxDiameter;
    }

    private int ComputeHeight(TreeNode? node)
    {
        if (node == null) return 0;

        // Postorder DFS: compute children branch heights
        int leftHeight = ComputeHeight(node.left);
        int rightHeight = ComputeHeight(node.right);

        // 1. Dual-Role Local Path: update global diameter with curved path
        int localCurvedPath = leftHeight + rightHeight;
        if (localCurvedPath > _maxDiameter)
        {
            _maxDiameter = localCurvedPath;
        }

        // 2. Dual-Role Upward Branch: return single longest branch to parent
        return 1 + Math.Max(leftHeight, rightHeight);
    }
}
```

#### Complexity
- **Time Complexity:** $\Theta(N)$ — Every node is visited exactly once.
- **Space Complexity:** $O(H)$ — Bounded by tree height ($O(\log N)$ balanced, $O(N)$ skewed).

---

### 4.2 Problem 2: [LeetCode 1245] Tree Diameter (Medium)

> **Problem Description:**
> Given an undirected tree of `n` nodes labeled from `0` to `n - 1` and an array of `edges` where `edges[i] = [u, v]`, return *the diameter of the tree*.
>
> **Constraints:**
> - $n == \text{edges.Length} + 1$
> - $1 \le n \le 10^4$
> - $0 \le u_i, v_i < n$

#### Production C# Implementation (Two-Pass BFS Algorithm)

```csharp
using System.Collections.Generic;

public class Solution
{
    public int TreeDiameter(int[][] edges)
    {
        if (edges == null || edges.Length == 0) return 0;
        int n = edges.Length + 1;

        // 1. Build adjacency list representation of undirected tree
        var graph = new List<int>[n];
        for (int i = 0; i < n; i++) graph[i] = new List<int>();

        foreach (var edge in edges)
        {
            graph[edge[0]].Add(edge[1]);
            graph[edge[1]].Add(edge[0]);
        }

        // 2. Pass 1: Find farthest node 'farthestNodeA' from arbitrary node 0
        var (farthestNodeA, _) = BfsFarthest(graph, 0, n);

        // 3. Pass 2: Find farthest node and distance from 'farthestNodeA'
        var (_, diameter) = BfsFarthest(graph, farthestNodeA, n);

        return diameter;
    }

    private static (int FarthestNode, int Distance) BfsFarthest(List<int>[] graph, int start, int n)
    {
        var queue = new Queue<int>();
        var visited = new bool[n];

        queue.Enqueue(start);
        visited[start] = true;

        int farthestNode = start;
        int distance = -1;

        while (queue.Count > 0)
        {
            int levelSize = queue.Count;
            distance++;

            for (int i = 0; i < levelSize; i++)
            {
                int curr = queue.Dequeue();
                farthestNode = curr;

                foreach (int neighbor in graph[curr])
                {
                    if (!visited[neighbor])
                    {
                        visited[neighbor] = true;
                        queue.Enqueue(neighbor);
                    }
                }
            }
        }

        return (farthestNode, distance);
    }
}
```

#### Complexity
- **Time Complexity:** $O(V + E) = O(N)$ where $N$ is the number of nodes. Two linear BFS sweeps.
- **Space Complexity:** $O(V + E) = O(N)$ for adjacency list and BFS visited/queue buffers.

---

### 4.3 Problem 3: [LeetCode 687] Longest Univalue Path (Medium)

> **Problem Description:**
> Given the `root` of a binary tree, return *the length of the longest path, where each node in the path has the same value*. This path may or may not pass through the root.
> The length of the path between two nodes is represented by the number of edges between them.
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[0, 10^4]$.
> - $-1000 \le \text{Node.val} \le 1000$

#### Production C# Implementation (Conditional Branch Extension)

```csharp
using System;

public class Solution
{
    private int _maxUnivaluePath;

    public int LongestUnivaluePath(TreeNode? root)
    {
        _maxUnivaluePath = 0;
        PostorderUnivalue(root);
        return _maxUnivaluePath;
    }

    private int PostorderUnivalue(TreeNode? node)
    {
        if (node == null) return 0;

        // 1. Postorder DFS on children
        int leftBranch = PostorderUnivalue(node.left);
        int rightBranch = PostorderUnivalue(node.right);

        int leftArrow = 0;
        int rightArrow = 0;

        // 2. Conditional branch extension: extend arrow ONLY if child value matches current node value
        if (node.left != null && node.left.val == node.val)
        {
            leftArrow = leftBranch + 1;
        }

        if (node.right != null && node.right.val == node.val)
        {
            rightArrow = rightBranch + 1;
        }

        // 3. Update global maximum with curved univalue path turning at node
        int localCurvedPath = leftArrow + rightArrow;
        if (localCurvedPath > _maxUnivaluePath)
        {
            _maxUnivaluePath = localCurvedPath;
        }

        // 4. Return single longest matching branch to parent
        return Math.Max(leftArrow, rightArrow);
    }
}
```

#### Complexity
- **Time Complexity:** $\Theta(N)$.
- **Space Complexity:** $O(H)$ call stack depth.

---

## 5. ⚡ HARDWARE & SYSTEMS CONNECTIONS

### 5.1 Network Diameter & Latency Bounds in P2P Topologies
- In distributed overlay networks (e.g. BitTorrent DHT, Ethereum gossip networks, data-center spine-leaf fabrics), the **network diameter** defines the **worst-case broadcast latency** between any two nodes.
- If an overlay spanning tree has diameter $D$, a gossip message is guaranteed to reach all global participants in at most $D \times \text{RTT}$ milliseconds.
- Systems architects run the **Two-Pass BFS algorithm** during topology reconfiguration to detect network diameter stretching.

---

## 6. ⚠️ DAILY ERROR LOG & COMMON TRAPS

### Trap 1: Returning the Curved Path to Parent
- **The Bug:** Writing `return 1 + leftHeight + rightHeight;`.
- **The Consequence:** Causes invalid multi-branching (bifurcation) in ancestor calculations. A single simple path cannot visit both left and right subtrees of a child and also connect to the parent!
- **The Fix:** **Always return `1 + Math.Max(leftHeight, rightHeight)` to parent.**

### Trap 2: Counting Nodes Instead of Edges
- **The Bug:** Returning `leftHeight + rightHeight + 1`.
- **The Consequence:** In LeetCode 543 and 687, path length is defined as the number of **edges**, not nodes. The formula `leftHeight + rightHeight` (where leaf height is 1) already correctly accounts for the two connecting edges.
- **The Fix:** Clarify whether the prompt defines path length in terms of edges ($E = V - 1$) or nodes ($V$).

### Trap 3: Resetting Value vs. Branch in Univalue Path
- **The Bug:** Skipping the recursive call when `node.left.val != node.val`.
- **The Consequence:** Fails to search for valid univalue paths deeper in the subtree!
- **The Fix:** **Always recurse unconditionally** to explore children, and only set `leftArrow = 0` if values mismatch.

---

## 7. 🎯 DAILY CHECKPOINT & SELF-ASSESSMENT

### 1. Conceptual Verification
1. Why can a node NEVER return the length of its curved path (`leftHeight + rightHeight`) to its parent? What topological rule prevents a valid simple path from branching twice?
2. In the Two-Pass BFS algorithm on an undirected tree, why is the node $A$ found in the first pass guaranteed to be an endpoint of some diameter?
3. How does the postorder contribution pattern used in [LeetCode 543] lay the foundation for [LeetCode 124] (Binary Tree Maximum Path Sum)?

### 2. Implementation Audit
- Review your `DiameterOfBinaryTree` implementation. What does it return when the tree has only 1 node (`root = [1]`)? Why should the diameter be 0 edges?

---
*Next Module: **Week 11 — Day 72: Binary Tree Maximum Path Sum — The Global Variable Contribution Model (LeetCode 124, 337)***
