---
title: "Week 13 — Day 86: BST Search, Insertion & Successor-Predecessor Mechanics"
---

# Week 13 — Day 86: BST Search, Insertion & Successor-Predecessor Mechanics

Welcome to **Day 86 of your DSA Mastery Journey**!

Yesterday in [Day 85](./Week%2013%20%E2%80%94%20Day%2085:%20BST%20Architecture,%20Invariant%20Validation%20&%20In-Order%20Properties.md), we explored the global BST ordering contract, range propagation validation with 64-bit boundaries, and in-order monotonicity.

Today, we dive into the core mutating and navigation mechanics of Binary Search Trees:
1. **Logarithmic Branch Pruning ([LeetCode 700]):** Exploiting the trichotomy of comparisons ($<, ==, >$) to eliminate half the search space at every step in strictly $O(1)$ auxiliary space.
2. **The Leaf Attachment Invariant ([LeetCode 701]):** Why new keys in a plain BST can *always* be inserted as new leaf nodes without disturbing existing subtree relationships.
3. **In-Order Successor & Predecessor Mechanics ([LeetCode 285]):** Solving successor queries in $O(H)$ time and strictly $O(1)$ auxiliary space **without parent pointers** by tracking the lowest ancestor where a left branch was taken.
4. **From-Scratch Systems Container:** Extending our `BinarySearchTree<T>` container with production-grade `Find`, `Insert`, `Successor`, and `Predecessor` methods.
5. **Systems Architecture:** Database index cursor navigation (`SEEK` followed by sequential `SCAN`), C++ `std::map::lower_bound`, and .NET CLR `SortedSet<T>.GetViewBetween()`.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 86 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: SEARCH & INSERT     │                                     │  PART II: SUCCESSOR/PREDECESSOR │
│   Logarithmic Branch Pruning    │                                     │     Ancestor State Tracking     │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • LC 700: BST Search            │                                     │ • LC 285: Inorder Successor     │
│ • Trichotomy: <, ==, > decisions│                                     │ • Case 1: Node has Right Child  │
│ • Iterative O(1) Aux Space      │                                     │   --> Leftmost in Right Subtree │
│ • LC 701: Leaf Insertion        │                                     │ • Case 2: Node has No Right     │
│ • Parent Tracking Pointer       │                                     │   --> Lowest Ancestor (Turn L)  │
│ • O(H) Best vs O(N) Worst Case  │                                     │ • Predecessor: Symmetric Mirror │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:*
    - **BST Search:** Given target key $K$, locate the node $u$ such that $\text{key}(u) = K$, or conclude $K \notin T$.
    - **BST Insert:** Add key $K$ into tree $T$ such that the global BST ordering invariant is preserved for all nodes.
    - **In-Order Successor ($Succ(u)$):** The node with the smallest key strictly greater than $\text{key}(u)$ (i.e. the node immediately following $u$ in in-order sequence).
    - **In-Order Predecessor ($Pred(u)$):** The node with the largest key strictly less than $\text{key}(u)$ (i.e. the node immediately preceding $u$ in in-order sequence).
  - *Core Invariants:*
    1. **Branch Pruning Invariant:** If $target < u.val$, $target$ cannot exist in $u$'s right subtree. If $target > u.val$, $target$ cannot exist in $u$'s left subtree.
    2. **Leaf Attachment Invariant:** A new key can always be inserted as a direct child of some existing node (a new leaf) without restructuring any existing nodes in a plain BST.
    3. **Successor Dual-Case Invariant:**
       - *Case A (Right Child Exists):* $Succ(u)$ is the leftmost node in $u$'s right subtree ($\min(u.right)$).
       - *Case B (No Right Child):* $Succ(u)$ is the lowest ancestor of $u$ whose left child is also an ancestor of $u$ (the node where we took the last "turn left" from the root).
  - *Misconception Check:* Candidates often believe that finding a successor without parent pointers requires full $O(N)$ in-order traversal into an array. In reality, searching from the root towards the target tracks the lowest ancestor candidate in strictly $O(H)$ time and $O(1)$ auxiliary space!
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the $O(N)$ linear search of linked lists and the $O(N)$ shift penalty of array insertion.
  - *Complexity Advantage:* Executes search and insertion in $O(H)$ operations. In balanced trees ($H \approx \log_2 N$), this reduces 1,000,000 comparisons down to $\approx 20$.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Dynamic collections where lookups, insertions, floor/ceiling queries, and sequential range queries must all execute in logarithmic time.
  - *When to Avoid / Failure Modes:* If keys arrive in strictly sorted or reverse-sorted order, plain BST insertion creates a degenerate chain of height $H = N$, degrading search to $O(N)$. Self-balancing variants (AVL / Red-Black) must be used to guarantee $O(\log N)$.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Iterative search and insertion require zero stack frames ($O(1)$ auxiliary space). Traversal walks heap reference pointers (`node = node.left`), which can trigger CPU L1/L2 cache misses if nodes are non-contiguously allocated across the Gen 0 GC heap.
  - *Production Systems:* Database B+ Tree leaf page traversal (MySQL InnoDB index seeks), `std::map::lower_bound` in C++, and `.NET` `SortedSet<T>.GetViewBetween()`.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To search or insert in a BST, I compare the target with the current node: if less, I branch left; if greater, I branch right; if equal, I found the target or detected a duplicate. This achieves O(H) time and O(1) space iteratively. To find an in-order successor without parent pointers, if the node has a right child, the successor is simply the leftmost node in that right subtree. Otherwise, I walk from the root: whenever the target is less than the current node, the current node is a potential successor, so I record it and branch left. The last recorded ancestor is the successor, executing in O(H) time and O(1) space."
  - *Interviewer Evaluation Lens:* Verifies that the candidate avoids recursion stack overhead for simple search/insert, cleanly separates the two successor topological cases, and explains why tracking the lowest left-branch ancestor finds the successor without parent pointers.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:*
    - Search / Insert: Time: $O(H)$; Auxiliary Space: $O(1)$ iterative.
    - Successor / Predecessor: Time: $O(H)$; Auxiliary Space: $O(1)$ iterative.
  - *State Transition Trace (Successor of `Node(4)` in tree with root `[5, 3, 6, 2, 4]`):*
    - Root `5`: `4 < 5` $\implies$ `successorCandidate = 5`, move `curr = curr.left (3)`.
    - Node `3`: `4 > 3` $\implies$ move `curr = curr.right (4)`.
    - Node `4`: Target reached! Node 4 has no right child.
    - Return `successorCandidate = 5`. Correct ($Succ(4) = 5$)!

---

### 1.1 In-Order Successor & Predecessor: The Two Topological Cases

Understanding in-order successor and predecessor mechanics is the foundation of BST cursor navigation and node deletion:

```
Case A: Target has a Right Subtree           Case B: Target has NO Right Subtree
              [ 15 ]                                        [ 20 ] (Successor!)
             /      \                                      /
          [ 6 ]    [ 18 ]                               [ 10 ]
         /     \                                       /      \
      [ 3 ]   [ 8 ]                                 [ 5 ]    [ 15 ] (Target)
             /     \                                         /
          [ 7 ]   [ 12 ]                                  [ 12 ]
                 /
      Successor [ 9 ]
```

#### Case A: Target Node Has a Right Child
- The in-order successor is the **minimum node in the right subtree**.
- Navigation rule: Step right once (`curr = target.right`), then walk left until reaching a node whose `left == null`:
  ```csharp
  TreeNode curr = target.right;
  while (curr.left != null) curr = curr.left;
  return curr;
  ```

#### Case B: Target Node Has NO Right Child
- The in-order successor is the **lowest ancestor whose left child is also an ancestor of target**.
- Intuition: If you walk from the root towards the target:
  - Whenever `target.val < curr.val`: `curr` is larger than `target`, so `curr` is a candidate successor. We record `successor = curr` and move **left** to see if a tighter successor exists.
  - Whenever `target.val >= curr.val`: `curr` is smaller than or equal to `target`, so it cannot be a successor. We move **right**.
  - When the loop terminates at `null`, the last recorded candidate is the exact in-order successor!

#### Symmetric Predecessor Rules:
- **Case A (Left Child Exists):** Predecessor is the **maximum node in the left subtree** (`step left, walk rightmost`).
- **Case B (No Left Child):** Predecessor is the **lowest ancestor where we turned right** (`whenever target.val > curr.val: predecessor = curr; curr = curr.right`).

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Container Extensions

Below is the complete `BinarySearchTree<T>` container extended with production-grade search, insertion, successor, and predecessor operations in strictly $O(1)$ auxiliary space:

```csharp
using System;
using System.Collections.Generic;

namespace BstFundamentals
{
    public class BstNode<T>
    {
        public T Value { get; set; }
        public BstNode<T>? Left { get; set; }
        public BstNode<T>? Right { get; set; }

        public BstNode(T value)
        {
            Value = value;
        }

        public bool IsLeaf => Left == null && Right == null;
    }

    public class BinarySearchTree<T>
    {
        private readonly IComparer<T> _comparer;
        public BstNode<T>? Root { get; private set; }
        public int Count { get; private set; }

        public BinarySearchTree(IComparer<T>? comparer = null)
        {
            _comparer = comparer ?? Comparer<T>.Default;
        }

        /// <summary>
        /// Searches for a node matching the specified value.
        /// Time Complexity: O(H).
        /// Auxiliary Space: Strictly O(1) iterative pointer advancement.
        /// </summary>
        public BstNode<T>? Find(T value)
        {
            if (value == null) return null;

            BstNode<T>? current = Root;
            while (current != null)
            {
                int cmp = _comparer.Compare(value, current.Value);
                if (cmp == 0) return current;
                current = cmp < 0 ? current.Left : current.Right;
            }

            return null; // Not found
        }

        /// <summary>
        /// Inserts a new value into the BST preserving global ordering.
        /// Rejects duplicate values.
        /// Time Complexity: O(H).
        /// Auxiliary Space: Strictly O(1).
        /// </summary>
        public bool Insert(T value)
        {
            if (value == null) throw new ArgumentNullException(nameof(value));

            if (Root == null)
            {
                Root = new BstNode<T>(value);
                Count++;
                return true;
            }

            BstNode<T> current = Root;
            BstNode<T>? parent = null;
            int cmp = 0;

            while (current != null)
            {
                parent = current;
                cmp = _comparer.Compare(value, current.Value);

                if (cmp == 0) return false; // Duplicate keys not permitted
                current = cmp < 0 ? current.Left! : current.Right!;
            }

            BstNode<T> newNode = new BstNode<T>(value);
            if (cmp < 0)
            {
                parent!.Left = newNode;
            }
            else
            {
                parent!.Right = newNode;
            }

            Count++;
            return true;
        }

        /// <summary>
        /// Finds the in-order successor of a given value without parent pointers.
        /// Time Complexity: O(H).
        /// Auxiliary Space: Strictly O(1).
        /// </summary>
        public BstNode<T>? FindSuccessor(T value)
        {
            if (value == null || Root == null) return null;

            BstNode<T>? current = Root;
            BstNode<T>? successor = null;

            while (current != null)
            {
                int cmp = _comparer.Compare(value, current.Value);

                if (cmp < 0)
                {
                    // Current is larger than target: potential successor!
                    successor = current;
                    current = current.Left; // Look for a smaller candidate
                }
                else if (cmp > 0)
                {
                    current = current.Right;
                }
                else
                {
                    // Found target node!
                    // If target has a right child, successor is leftmost in right subtree
                    if (current.Right != null)
                    {
                        successor = FindMin(current.Right);
                    }
                    break;
                }
            }

            return successor;
        }

        /// <summary>
        /// Finds the in-order predecessor of a given value without parent pointers.
        /// Time Complexity: O(H).
        /// Auxiliary Space: Strictly O(1).
        /// </summary>
        public BstNode<T>? FindPredecessor(T value)
        {
            if (value == null || Root == null) return null;

            BstNode<T>? current = Root;
            BstNode<T>? predecessor = null;

            while (current != null)
            {
                int cmp = _comparer.Compare(value, current.Value);

                if (cmp > 0)
                {
                    // Current is smaller than target: potential predecessor!
                    predecessor = current;
                    current = current.Right; // Look for a larger candidate
                }
                else if (cmp < 0)
                {
                    current = current.Left;
                }
                else
                {
                    // Found target node!
                    // If target has a left child, predecessor is rightmost in left subtree
                    if (current.Left != null)
                    {
                        predecessor = FindMax(current.Left);
                    }
                    break;
                }
            }

            return predecessor;
        }

        public BstNode<T>? FindMin(BstNode<T>? subRoot)
        {
            if (subRoot == null) return null;
            BstNode<T> current = subRoot;
            while (current.Left != null) current = current.Left;
            return current;
        }

        public BstNode<T>? FindMax(BstNode<T>? subRoot)
        {
            if (subRoot == null) return null;
            BstNode<T> current = subRoot;
            while (current.Right != null) current = current.Right;
            return current;
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### 3.1 Mathematical Derivation of Search Space Reduction

In a balanced Binary Search Tree of $N$ nodes:
$$T(N) = T(N/2) + \Theta(1)$$
By Case 2 of the Master Theorem ($a = 1, b = 2, f(N) = \Theta(1)$):
$$c_{\text{crit}} = \log_b a = \log_2 1 = 0 \implies f(N) = \Theta(N^0) \implies T(N) = \mathbf{\Theta(\log N)}$$

In a degenerate tree (e.g. keys inserted in sorted order `1, 2, 3, ..., N`):
$$T(N) = T(N - 1) + \Theta(1) \implies T(N) = \mathbf{\Theta(N)}$$

```
Balanced Tree (H = log₂ N):                Degenerate Skewed Tree (H = N):
           [ 4 ]                                   [ 1 ]
         /       \                                     \
      [ 2 ]     [ 6 ]                                  [ 2 ]
     /     \   /     \                                     \
   [ 1 ]  [ 3 ][ 5 ] [ 7 ]                                 [ 3 ]
   Depth: 3 comparisons for N = 7                          Depth: 7 comparisons for N = 7
```

---

### 3.2 Tail-Call Elimination vs. JIT Loop Unrolling

In C#, recursive search can be written as:
```csharp
public TreeNode? SearchRecursive(TreeNode? root, int val)
{
    if (root == null || root.val == val) return root;
    return val < root.val 
        ? SearchRecursive(root.left, val) 
        : SearchRecursive(root.right, val);
}
```

1. **CLR Tail-Call Optimization (TCO) Limitations:** While the 64-bit .NET RyuJIT compiler *can* perform tail-call optimization in certain scenarios (`tail.` IL prefix), TCO is **not guaranteed** by the C# specification or compiler. Under debugging mode or complex call frames, each recursive step pushes a 48-byte native stack frame.
2. **The Iterative Mandate:** By writing `while (current != null) current = ...`, we guarantee **strictly zero stack allocations ($O(1)$ memory)** across all architectures, platforms, and JIT optimization levels.

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### 4.1 [LeetCode 700] Search in a Binary Search Tree

```csharp
namespace BstFundamentals
{
    public class TreeNode
    {
        public int val;
        public TreeNode? left;
        public TreeNode? right;

        public TreeNode(int val = 0, TreeNode? left = null, TreeNode? right = null)
        {
            this.val = val;
            this.left = left;
            this.right = right;
        }
    }

    public static class BstSearchEngine
    {
        /// <summary>
        /// Approach 1: High-Performance Iterative Search.
        /// Time Complexity: O(H) where H is tree height.
        /// Auxiliary Space: Strictly O(1).
        /// </summary>
        public static TreeNode? SearchBST(TreeNode? root, int val)
        {
            TreeNode? curr = root;

            while (curr != null)
            {
                if (curr.val == val)
                {
                    return curr;
                }
                curr = val < curr.val ? curr.left : curr.right;
            }

            return null;
        }
    }
}
```

---

### 4.2 [LeetCode 701] Insert into a Binary Search Tree

```csharp
namespace BstFundamentals
{
    public static class BstInsertionEngine
    {
        /// <summary>
        /// Approach 1: Iterative Leaf Insertion (Zero Call Stack Overhead).
        /// Time Complexity: O(H).
        /// Auxiliary Space: Strictly O(1).
        /// </summary>
        public static TreeNode InsertIntoBSTIterative(TreeNode? root, int val)
        {
            if (root == null) return new TreeNode(val);

            TreeNode curr = root;

            while (true)
            {
                if (val < curr.val)
                {
                    if (curr.left == null)
                    {
                        curr.left = new TreeNode(val);
                        break;
                    }
                    curr = curr.left;
                }
                else
                {
                    if (curr.right == null)
                    {
                        curr.right = new TreeNode(val);
                        break;
                    }
                    curr = curr.right;
                }
            }

            return root;
        }

        /// <summary>
        /// Approach 2: Clean Recursive Functional Rewiring.
        /// Time Complexity: O(H).
        /// Auxiliary Space: O(H) stack frames.
        /// </summary>
        public static TreeNode InsertIntoBSTRecursive(TreeNode? root, int val)
        {
            if (root == null) return new TreeNode(val);

            if (val < root.val)
            {
                root.left = InsertIntoBSTRecursive(root.left, val);
            }
            else
            {
                root.right = InsertIntoBSTRecursive(root.right, val);
            }

            return root;
        }
    }
}
```

---

### 4.3 [LeetCode 285] Inorder Successor in BST

```csharp
namespace BstFundamentals
{
    public static class BstSuccessorFinder
    {
        /// <summary>
        /// Finds the in-order successor of node p in a BST without parent pointers.
        /// Time Complexity: Strictly O(H) — only walks a single downward branch.
        /// Auxiliary Space: Strictly O(1) — zero recursion or queue memory.
        /// </summary>
        public static TreeNode? InorderSuccessor(TreeNode? root, TreeNode p)
        {
            if (root == null || p == null) return null;

            TreeNode? successor = null;
            TreeNode? curr = root;

            while (curr != null)
            {
                if (p.val < curr.val)
                {
                    // Current node is strictly greater than p:
                    // It is a candidate successor! Record it and branch left to find tighter bound.
                    successor = curr;
                    curr = curr.left;
                }
                else
                {
                    // Current node is less than or equal to p:
                    // Successor must be strictly greater, so search right subtree.
                    curr = curr.right;
                }
            }

            return successor;
        }
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Closest Binary Search Tree Value ([LeetCode 270])
- **Problem:** Given root of BST and target `double target`, return the value in the BST closest to `target`.
- **Hint:** Track `int closest = root.val`. At each node $u$, update `closest` if $|u.val - target| < |closest - target|$. Then greedily branch left if $target < u.val$, else right.
- **Target Complexity:** Time: $O(H)$, Auxiliary Space: $O(1)$ iterative.

### Exercise 2: In-Order Predecessor in BST (Mirror of LC 285)
- **Problem:** Given root of BST and target node $p$, find the node immediately preceding $p$ in in-order order.
- **Hint:** Mirror the successor logic: whenever `p.val > curr.val`, record `predecessor = curr` and branch right (`curr = curr.right`). If `p.val <= curr.val`, branch left.
- **Target Complexity:** Time: $O(H)$, Auxiliary Space: $O(1)$.

### Exercise 3: Inorder Successor in BST II ([LeetCode 510] With Parent Pointers)
- **Problem:** Given node $p$ with a `parent` pointer (root is not provided), find its in-order successor.
- **Hint:** If $p.right \ne null$, successor is leftmost node in $p.right$. If $p.right == null$, ascend using `parent` pointers: while `p.parent != null && p == p.parent.right`, move `p = p.parent`. Return `p.parent`.
- **Target Complexity:** Time: $O(H)$, Auxiliary Space: $O(1)$.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

### Real-World Systems Design: B-Tree Index Cursors & Range Scanning

In database engines (PostgreSQL, MySQL InnoDB, SQLite), executing a query with `ORDER BY` and `LIMIT` relies heavily on in-order successor traversal:

```sql
SELECT * FROM Orders WHERE Amount >= 1000 ORDER BY Amount ASC LIMIT 10;
```

```
Database Engine Execution Pipeline:
1. Index Seek: Find first key >= 1000 in B-Tree (LC 700 search) in O(log N) disk seeks.
2. Position Cursor: Cursor rests on Node(1000).
3. Successor Scan: Engine repeatedly calls Next() (Successor mechanics) to yield next 9 rows.
4. Early Termination: Query completes after 10 rows without scanning millions of remaining orders!
```

By decoupling the initial $O(\log N)$ search seek from the subsequent $O(1)$ successor cursor advances, database engines achieve millisecond response times on terabyte-scale datasets.

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint 1: Inorder Successor Without Parent Pointers
**Question:** In [LeetCode 285], why does the single while loop `while (curr != null) { if (p.val < curr.val) { succ = curr; curr = curr.left; } else curr = curr.right; }` correctly handle BOTH Case A (node has a right child) and Case B (node has no right child)?
<details>
<summary><b>View Architectural Answer</b></summary>

The algorithm does not need to bifurcate cases because the BST invariant naturally unifies them:
1. If $p$ has a right child: The search walks to $p$, then steps into $p.right$ (because `p.val >= curr.val` when `curr == p`). Once inside $p$'s right subtree, all nodes are $> p.val$. The loop then repeatedly branches left whenever `curr.val > p.val`, constantly updating `succ = curr` until reaching the leftmost node in $p$'s right subtree.
2. If $p$ has no right child: The last node where the search branched left to reach $p$ remains stored in `succ`. When `curr` reaches $p$, it branches right (`curr = null`), terminating the loop. `succ` cleanly holds the lowest left-turn ancestor!
</details>

---

### Checkpoint 2: Leaf Insertion Guarantee
**Question:** In [LeetCode 701], prove why any new key $K$ that does not already exist in a BST can *always* be inserted as a direct leaf child without rearranging existing nodes.
<details>
<summary><b>View Architectural Answer</b></summary>

Let $T$ be a valid BST. Every search path for key $K$ traces a unique sequence of interval bounds:
$$(\text{low}_0, \text{high}_0) \supset (\text{low}_1, \text{high}_1) \supset \dots \supset (\text{low}_k, \text{high}_k)$$
Since $K$ does not exist in $T$, the search must terminate at a `null` pointer of some node $P$.
By the BST invariant, the interval associated with that `null` pointer contains $K$. 
Attaching a new node with value $K$ at that `null` pointer satisfies the local comparison with parent $P$ and respects all ancestor intervals. Because no existing children are displaced, no existing subtree invariants are altered.
</details>

---

### Checkpoint 3: Iterative vs. Recursive Space Complexity
**Question:** Compare the auxiliary memory footprint of recursive BST search versus iterative BST search on an unrotated skewed BST with $N = 50,000$ nodes.
<details>
<summary><b>View Architectural Answer</b></summary>

- **Recursive Search:** Allocates $50,000$ native thread stack frames. On a 64-bit OS with a default 1MB thread stack limit (where each stack frame uses ~48 bytes), $50,000 \times 48 \text{ B} \approx 2.4 \text{ MB}$, resulting in a fatal **`StackOverflowException`**!
- **Iterative Search:** Reuses a single local pointer variable `TreeNode curr` in a CPU register. Auxiliary space is strictly **$O(1)$** (0 bytes on stack/heap), safely executing in sub-millisecond time.
</details>

---

### Checkpoint 4: Successor Under Duplicate Keys
**Question:** How does the in-order successor algorithm change if the BST permits duplicate keys (e.g. left subtree $\le root <$ right subtree)?
<details>
<summary><b>View Architectural Answer</b></summary>

If duplicates are stored in the left subtree ($\le$), then if node $p$ has duplicates, another node with value equal to $p.val$ could appear as an ancestor or descendant. 
To find the strictly greater successor, the comparison condition must remain strict: `if (p.val < curr.val)`. Any node with `curr.val == p.val` must branch right to locate values strictly greater than $p.val$.
</details>

---

### Daily Mastery Checklist
- [x] Implemented iterative and recursive BST search ([LeetCode 700]) in $O(H)$ time and $O(1)$ space.
- [x] Implemented iterative leaf insertion ([LeetCode 701]) without subtree restructuring.
- [x] Solved in-order successor ([LeetCode 285]) in $O(H)$ time and $O(1)$ space without parent pointers.
- [x] Extended `BinarySearchTree<T>` with from-scratch `Find`, `Insert`, `Successor`, and `Predecessor` methods.
- [x] Connected successor mechanics to database B-Tree index range scans and cursor navigation.
