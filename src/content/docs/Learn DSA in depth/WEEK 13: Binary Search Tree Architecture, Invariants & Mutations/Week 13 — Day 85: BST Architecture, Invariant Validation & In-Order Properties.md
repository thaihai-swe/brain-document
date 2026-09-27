---
title: "Week 13 — Day 85: BST Architecture, Invariant Validation & In-Order Properties"
---

# Week 13 — Day 85: BST Architecture, Invariant Validation & In-Order Properties

Welcome to **Day 85 of your DSA Mastery Journey**!

Yesterday in [Day 84](../WEEK%2012:%20Binary%20Tree%20Serialization,%20Reconstruction%20&%20Composite%20Views/Week%2012%20%E2%80%94%20Day%2084:%20Phase%203%20Milestone%20Assessment%20&%20Mock%20Interview%20Simulation.md), we completed the Phase 3 Milestone Assessment, mastering complex tree path contribution models and bijective tree serialization protocols.

Today kicks off **Phase 4: Ordered Tree Structures (Weeks 13–15)**. We enter the domain of **Binary Search Trees (BSTs)**:
1. **The Global BST Ordering Contract:** Why the BST property applies to *all* descendants in a subtree, not merely direct children.
2. **Range Propagation Invariant ([LeetCode 98]):** Downward interval bounding $(min, max)$ versus in-order predecessor monotonicity checks.
3. **In-Order Monotonicity & Projection ([LeetCode 230], [LeetCode 530]):** Exploiting the sorted order of BST in-order traversals for early-exit $k$-th smallest queries and minimum adjacent difference computations.
4. **Production-Grade Implementation:** Designing an extensible, memory-safe `BinarySearchTree<T>` container from scratch in C# with fail-fast validation.
5. **Systems Architecture:** Relational database indexing (PostgreSQL B-Tree index scan bounds) and .NET CLR `SortedSet<T>` memory layouts.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 85 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: THE BST INVARIANT   │                                     │   PART II: IN-ORDER PROJECTION  │
│   Global Subtree Ordering       │                                     │     Monotonic Sorted Sequence   │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Def: Left < Root < Right      │                                     │ • In-Order Traversal is Sorted  │
│ • Local Check Pitfall (5-10-15) │                                     │ • LC 230: K-th Smallest (Early) │
│ • LC 98: Range Propagation      │                                     │ • LC 530: Min Absolute Diff     │
│ • Interval: (low, high) bounds  │                                     │ • Predecessor Difference Delta  │
│ • 64-bit long bounds overflow   │                                     │ • Morris In-Order O(1) Space    │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* A **Binary Search Tree (BST)** is a binary tree where every node $u$ satisfies the **Global Ordering Invariant**:
    $$\forall x \in \text{LeftSubtree}(u): \text{key}(x) < \text{key}(u) \quad \text{and} \quad \forall y \in \text{RightSubtree}(u): \text{key}(u) < \text{key}(y)$$
  - *Core Invariants:*
    1. **Global Ordering Invariant:** The ordering constraint is hereditary. It is not enough that $u.left < u$; every node in $u$'s left subtree must be strictly less than $u$.
    2. **In-Order Monotonicity Invariant:** An in-order traversal of a valid BST visits keys in strictly monotonically increasing order: $k_1 < k_2 < \dots < k_n$.
    3. **Range Propagation Invariant:** When descending into a left child, the upper bound tightens: $(low, high) \to (low, node.val)$. When descending into a right child, the lower bound tightens: $(low, high) \to (node.val, high)$.
  - *Misconception Check:* The most common candidate bug in BST interviews is validating only direct children:
    `if (node.left != null && node.left.val >= node.val) return false;`
    This naive local check falsely validates the tree `[10, 5, 15, null, null, 6, 20]`, where `6` is in the right child of `5`, but resides in the left subtree of `10` ($6 < 10$ is violated!).
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Unifies the $O(\log N)$ binary search capability of contiguous sorted arrays with the dynamic $O(1)$ pointer insertion/deletion of linked nodes without array memory copying.
  - *Algorithmic Purpose:* Enables dynamic sorted sets with predecessor, successor, floor, ceiling, and range search queries (`[L, R]`) that Hash Tables cannot support.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Dynamic collections requiring continuous ordering, rank queries, interval scans, or real-time streaming min/max retrieval.
  - *When to Avoid / Failure Modes:* If the input data is already sorted and insertions are unrotated, a plain BST degenerates into a linear linked list of height $H = N$, collapsing all operations from $O(\log N)$ to $O(N)$ and causing stack overflows.
  - *Signal Words:* "Validate BST", "k-th smallest element", "minimum difference between nodes", "find predecessor/successor", "range search".
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Heap nodes with reference pointers. In 64-bit .NET: 16B Object Header + 8B MethodTable pointer + 8B `left` + 8B `right` + 4B/8B `value` + padding $\approx 40$ bytes per node.
  - *Production Systems:* Relational database indexing (PostgreSQL and MySQL B+ Trees generalize BST nodes into 4KB disk pages), .NET `SortedSet<T>` and `SortedDictionary<K,V>` (internally implemented as Red-Black BSTs).
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "A Binary Search Tree enforces that all nodes in a node's left subtree are strictly less than the node, and all in the right subtree are strictly greater. To validate a BST, local child checks fail; we must propagate valid range bounds downward: the left child inherits (low, curr.val) and the right child inherits (curr.val, high). Alternatively, an in-order traversal of a BST must yield a strictly increasing sequence. I leverage in-order tracking for k-th smallest and minimum absolute difference in O(H) auxiliary space."
  - *Interviewer Evaluation Lens:* Checks whether the candidate understands the global subtree ordering constraint, uses 64-bit `long` range boundaries to prevent integer overflow at `int.MinValue`/`int.MaxValue`, and demonstrates in-order traversal state tracking.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:*
    - Search / Insert / Delete: Best/Average $\Theta(\log N)$, Worst-Case $O(N)$ (degenerate tree).
    - Validation ([LC 98]): Time: $\Theta(N)$; Auxiliary Space: $O(H)$ recursion stack frames.
    - $K$-th Smallest ([LC 230]): Time: $O(H + K)$; Auxiliary Space: $O(H)$.
  - *State Transition Trace (LC 98 Range Propagation on `[5, 1, 4, null, null, 3, 6]`):*
    - Root `5`: Range $(-\infty, +\infty)$ $\implies$ Valid.
    - Left `1`: Range $(-\infty, 5)$ $\implies$ Valid.
    - Right `4`: Range $(5, +\infty)$ $\implies$ Violation! ($4 \le 5$). Return `false`.

---

### 1.1 The Local Child Checking Fallacy

Consider the canonical counterexample:

```
                  [ 10 ]
                 /      \
             [ 5 ]      [ 15 ]
            /     \
         [ 2 ]   [ 12 ]* <── VIOLATION! (12 > 10, but in Left Subtree)
```

1. **Local Check Lens:**
   - At Node `5`: Left `2 < 5` (OK), Right `12 > 5` (OK).
   - At Node `10`: Left `5 < 10` (OK), Right `15 > 10` (OK).
   - Local check reports **TRUE**!
2. **Global BST Invariant Lens:**
   - Node `12` is in the left subtree of root `10`.
   - Every node in the left subtree of `10` must be $< 10$.
   - Because $12 > 10$, the tree is **INVALID**!

To resolve this, every node must be validated against an **open interval $(low, high)$**:

```
                       [ 10 ]  Range: (-∞, +∞)
                      /      \
     Range: (-∞, 10) [ 5 ]    [ 15 ] Range: (10, +∞)
                    /     \
  Range: (-∞, 5) [ 2 ]   [ 12 ] Range: (5, 10) ──> 12 is NOT in (5, 10)! INVALID!
```

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch `BinarySearchTree<T>`

Below is a complete, production-grade, generic `BinarySearchTree<T>` container in C#:

```csharp
using System;
using System.Collections;
using System.Collections.Generic;

namespace BstFundamentals
{
    /// <summary>
    /// Represents a strongly-typed node within a Binary Search Tree.
    /// </summary>
    public sealed class BstNode<T>
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

    /// <summary>
    /// A production-grade generic Binary Search Tree enforcing global ordering.
    /// Supports O(H) search, insertion, and in-order enumeration.
    /// </summary>
    public class BinarySearchTree<T> : IEnumerable<T>
    {
        private readonly IComparer<T> _comparer;
        private int _version; // Detects concurrent modification during enumeration

        public BstNode<T>? Root { get; private set; }
        public int Count { get; private set; }

        public BinarySearchTree(IComparer<T>? comparer = null)
        {
            _comparer = comparer ?? Comparer<T>.Default;
        }

        /// <summary>
        /// Inserts a new value into the BST. Duplicates are rejected.
        /// Time Complexity: O(H) where H is tree height.
        /// Auxiliary Space: O(1) iterative pointer advancement.
        /// </summary>
        public bool Insert(T value)
        {
            if (value == null) throw new ArgumentNullException(nameof(value));

            if (Root == null)
            {
                Root = new BstNode<T>(value);
                Count++;
                _version++;
                return true;
            }

            BstNode<T> current = Root;
            BstNode<T>? parent = null;
            int comparison = 0;

            while (current != null)
            {
                parent = current;
                comparison = _comparer.Compare(value, current.Value);

                if (comparison == 0)
                {
                    return false; // Duplicate keys disallowed
                }
                else if (comparison < 0)
                {
                    current = current.Left!;
                }
                else
                {
                    current = current.Right!;
                }
            }

            // Attach new leaf node
            BstNode<T> newNode = new BstNode<T>(value);
            if (comparison < 0)
            {
                parent!.Left = newNode;
            }
            else
            {
                parent!.Right = newNode;
            }

            Count++;
            _version++;
            return true;
        }

        /// <summary>
        /// Searches for a target value iteratively without stack frame allocation.
        /// Time Complexity: O(H).
        /// Auxiliary Space: O(1).
        /// </summary>
        public bool Contains(T value)
        {
            if (value == null) return false;

            BstNode<T>? current = Root;
            while (current != null)
            {
                int cmp = _comparer.Compare(value, current.Value);
                if (cmp == 0) return true;
                current = cmp < 0 ? current.Left : current.Right;
            }

            return false;
        }

        /// <summary>
        /// Validates whether the tree strictly satisfies the BST invariant.
        /// Employs range propagation with downward interval bounds.
        /// </summary>
        public bool IsValidBst()
        {
            return ValidateRange(Root, default, default, hasMin: false, hasMax: false);
        }

        private bool ValidateRange(BstNode<T>? node, T? min, T? max, bool hasMin, bool hasMax)
        {
            if (node == null) return true;

            if (hasMin && _comparer.Compare(node.Value, min!) <= 0) return false;
            if (hasMax && _comparer.Compare(node.Value, max!) >= 0) return false;

            return ValidateRange(node.Left, min, node.Value, hasMin, hasMax: true) &&
                   ValidateRange(node.Right, node.Value, max, hasMin: true, hasMax);
        }

        /// <summary>
        /// Yields an in-order sequence of elements using an explicit stack.
        /// Enforces fail-fast enumeration via version tracking.
        /// </summary>
        public IEnumerator<T> GetEnumerator()
        {
            int startingVersion = _version;
            Stack<BstNode<T>> stack = new Stack<BstNode<T>>();
            BstNode<T>? current = Root;

            while (current != null || stack.Count > 0)
            {
                if (_version != startingVersion)
                    throw new InvalidOperationException("Collection was modified during enumeration.");

                while (current != null)
                {
                    stack.Push(current);
                    current = current.Left;
                }

                current = stack.Pop();
                yield return current.Value;

                current = current.Right;
            }
        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### 3.1 The In-Order Monotonicity Theorem

> **Theorem (BST In-Order Monotonicity):** An in-order traversal of a binary tree visits elements in strictly ascending order if and only if the binary tree is a valid Binary Search Tree without duplicate keys.
>
> **Proof ($\implies$ Direction):**
> 1. In-order traversal visits $\text{LeftSubtree}(u)$, then node $u$, then $\text{RightSubtree}(u)$.
> 2. By structural induction: for any node $u$, all nodes in $\text{LeftSubtree}(u)$ are visited *before* $u$, and all nodes in $\text{RightSubtree}(u)$ are visited *after* $u$.
> 3. By the BST definition, $\forall x \in \text{Left}(u): x.val < u.val$ and $\forall y \in \text{Right}(u): u.val < y.val$.
> 4. Since the in-order traversal within each subtree is inductively sorted, the sequence of visited values satisfies:
>    $$\text{InOrder}(\text{Left}(u)) < u.val < \text{InOrder}(\text{Right}(u))$$
> 5. Therefore, the entire in-order traversal sequence is strictly monotonically increasing: $x_1 < x_2 < \dots < x_n$. $\blacksquare$

---

### 3.2 Time & Space Complexity Trade-Off Matrix

| Operation | Best Case (Balanced BST) | Average Case (Random BST) | Worst Case (Degenerate Line) | Auxiliary Space |
| :--- | :--- | :--- | :--- | :--- |
| **Search / Lookup** | $\Theta(1)$ (at root) | $\Theta(\log N)$ | $\Theta(N)$ | $O(1)$ Iterative / $O(H)$ Recursive |
| **Insertion** | $\Theta(1)$ (at root) | $\Theta(\log N)$ | $\Theta(N)$ | $O(1)$ Iterative / $O(H)$ Recursive |
| **Validation (LC 98)** | $\Theta(1)$ (root invalid)| $\Theta(N)$ (must verify all)| $\Theta(N)$ | $O(H)$ Call Stack |
| **$K$-th Smallest (LC 230)**| $\Theta(K)$ (leftmost spine)| $\Theta(\log N + K)$ | $\Theta(N)$ | $O(H)$ Stack Frames |
| **Min Difference (LC 530)** | $\Theta(N)$ | $\Theta(N)$ | $\Theta(N)$ | $O(H)$ (or $O(1)$ via Morris) |

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### 4.1 [LeetCode 98] Validate Binary Search Tree: Dual Paradigms

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

    public static class BstValidator
    {
        // =========================================================================
        // Approach 1: Range Propagation DFS (Recommended & Self-Contained)
        // Passes downward interval (min, max).
        // Uses 64-bit 'long' to prevent integer overflow when node.val == int.MinValue/MaxValue.
        // Time Complexity: O(N) visiting each node once.
        // Auxiliary Space: O(H) recursion stack frames.
        // =========================================================================
        public static bool IsValidBST(TreeNode? root)
        {
            return Validate(root, long.MinValue, long.MaxValue);
        }

        private static bool Validate(TreeNode? node, long min, long max)
        {
            if (node == null) return true;

            // Strict inequality required: duplicates are invalid in strict BST
            if (node.val <= min || node.val >= max) return false;

            // Left child upper-bounded by node.val; Right child lower-bounded by node.val
            return Validate(node.left, min, node.val) &&
                   Validate(node.right, node.val, max);
        }

        // =========================================================================
        // Approach 2: In-Order Traversal with Predecessor State
        // Verifies strictly increasing property: prev.val < curr.val.
        // Time Complexity: O(N) early exit on first violation.
        // Auxiliary Space: O(H) stack frames.
        // =========================================================================
        public static bool IsValidBstInorder(TreeNode? root)
        {
            long prevValue = long.MinValue;

            bool InorderDfs(TreeNode? node)
            {
                if (node == null) return true;

                // Step 1: Recurse Left
                if (!InorderDfs(node.left)) return false;

                // Step 2: In-Order Monotonicity Check
                if (node.val <= prevValue) return false;
                prevValue = node.val;

                // Step 3: Recurse Right
                return InorderDfs(node.right);
            }

            return InorderDfs(root);
        }
    }
}
```

---

### 4.2 [LeetCode 230] Kth Smallest Element in a BST

```csharp
using System.Collections.Generic;

namespace BstFundamentals
{
    public static class KthSmallestFinder
    {
        /// <summary>
        /// Finds the k-th smallest element (1-indexed) in a BST using iterative in-order traversal.
        /// Halts immediately when k elements have been popped (Early Exit).
        /// Time Complexity: O(H + K) — only walks left spine to depth H, then pops K nodes.
        /// Auxiliary Space: O(H) stack frames.
        /// </summary>
        public static int KthSmallest(TreeNode? root, int k)
        {
            Stack<TreeNode> stack = new Stack<TreeNode>();
            TreeNode? current = root;

            while (current != null || stack.Count > 0)
            {
                // Push left spine to reach minimum available node
                while (current != null)
                {
                    stack.Push(current);
                    current = current.left;
                }

                current = stack.Pop();
                k--;

                if (k == 0)
                {
                    return current.val; // Found the k-th smallest!
                }

                current = current.right;
            }

            return -1; // Should not be reached for valid 1 <= k <= N
        }
    }
}
```

---

### 4.3 [LeetCode 530] Minimum Absolute Difference in BST

```csharp
using System;

namespace BstFundamentals
{
    public static class MinDiffFinder
    {
        /// <summary>
        /// Finds minimum absolute difference between values of any two nodes in a BST.
        /// In a sorted array, min difference is ALWAYS between adjacent elements!
        /// In a BST, in-order traversal visits adjacent elements sequentially.
        /// Time Complexity: Strictly O(N).
        /// Auxiliary Space: O(H) call stack.
        /// </summary>
        public static int GetMinimumDifference(TreeNode? root)
        {
            int minDiff = int.MaxValue;
            TreeNode? prev = null;

            void Inorder(TreeNode? node)
            {
                if (node == null) return;

                Inorder(node.left);

                if (prev != null)
                {
                    minDiff = Math.Min(minDiff, node.val - prev.val);
                }
                prev = node;

                Inorder(node.right);
            }

            Inorder(root);
            return minDiff;
        }
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: In-Order Successor in BST Without Parent Pointers ([LeetCode 285])
- **Problem:** Given the root of a BST and a target node $p$, find the in-order successor of $p$.
- **Hint:** If $p$ has a right child, the successor is the leftmost node in $p$'s right subtree. If $p$ has no right child, walk from the root: whenever `p.val < curr.val`, `curr` is a potential candidate successor (we branched left!), so record `candidate = curr` and move `curr = curr.left`. If `p.val >= curr.val`, move `curr = curr.right`.
- **Target Complexity:** Time: $O(H)$, Auxiliary Space: $O(1)$.

### Exercise 2: Two Sum IV - Input is a BST ([LeetCode 653])
- **Problem:** Given root of BST and integer `k`, return `true` if there exist two elements whose sum equals `k`.
- **Hint:** Two approaches: (1) In-order traversal into `List<int>`, then two-pointer sweep in $O(N)$ time and $O(N)$ space. (2) Dual BST Iterators (one forward, one reverse) simulating two pointers directly on the tree in $O(N)$ time and strictly $O(H)$ space.
- **Target Complexity:** Time: $O(N)$, Auxiliary Space: $O(H)$.

### Exercise 3: Convert Sorted Array to Balanced BST ([LeetCode 108])
- **Problem:** Given an integer array `nums` sorted in ascending order, convert it to a height-balanced BST.
- **Hint:** Midpoint divide-and-conquer: `mid = (L + R) / 2`. `mid` becomes root. Recurse on `[L, mid - 1]` for left child, and `[mid + 1, R]` for right child.
- **Target Complexity:** Time: $O(N)$, Auxiliary Space: $O(\log N)$ stack frames.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

### Real-World Systems Design: Relational Database B-Tree Index Range Scans

In databases like PostgreSQL, MySQL InnoDB, and SQLite, table indexes are structured as multi-way balanced search trees (B+ Trees, a generalization of BSTs):

```sql
SELECT * FROM Users WHERE Age >= 21 AND Age <= 35;
```

```
Database Query Execution Pipeline:
1. Parse SQL AST -> Identify predicate: Age in [21, 35]
2. Index Scan on B-Tree:
   - Root Page: Descend using Binary Search on keys
   - Leaf Page: Find first key >= 21 in O(log N) disk reads
   - Range Scan: Walk leaf horizontal sibling pointers until key > 35
```

Because the index maintains BST ordering:
1. Finding the range start (`Age = 21`) requires only $O(\log N)$ comparisons.
2. The remaining rows are read sequentially off contiguous disk pages, avoiding a full table scan ($O(N)$ random I/O).

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint 1: 32-Bit Integer Overflow in Range Validation
**Question:** In [LeetCode 98], what happens if you write `Validate(node, int.MinValue, int.MaxValue)` instead of using `long.MinValue` and `long.MaxValue`? Provide a concrete test case that fails.
<details>
<summary><b>View Architectural Answer</b></summary>

If the tree consists of a single node with value `[2147483647]` (`int.MaxValue`):
```csharp
if (node.val <= min || node.val >= max) return false;
```
Because `node.val == int.MaxValue` and `max == int.MaxValue`, the condition `node.val >= max` evaluates to `true`, falsely rejecting a perfectly valid single-node BST!
Using 64-bit `long.MinValue` and `long.MaxValue` ensures that all 32-bit integer values fall strictly inside the open interval $(long.MinValue, long.MaxValue)$.
</details>

---

### Checkpoint 2: The Local Child Checking Flaw
**Question:** Why does checking `left.val < node.val && right.val > node.val` fail on the tree `[10, 5, 15, null, null, 6, 20]`? Explain the exact mechanics of the failure.
<details>
<summary><b>View Architectural Answer</b></summary>

At node `5`, its right child is `6`. The local check observes `6 > 5`, which is true. 
At root `10`, its left child is `5` and right child is `15`, which satisfies `5 < 10 < 15`.
However, node `6` is in the left subtree of root `10`. By the definition of a BST, all descendants in the left subtree of `10` must be strictly less than `10`. While `6 < 10` is true, suppose the node was `12`. Then `12 > 5` passes locally, but `12 < 10` fails globally! Local checks cannot detect violations against higher ancestors.
</details>

---

### Checkpoint 3: In-Order Traversal vs. Range DFS Memory Footprint
**Question:** Compare the auxiliary memory footprint of validating a BST via Range Propagation DFS versus In-Order Traversal with an explicit stack on a balanced tree of $1,000,000$ nodes.
<details>
<summary><b>View Architectural Answer</b></summary>

Both approaches have the exact same asymptotic auxiliary space: $O(H) = O(\log_2 10^6) \approx 20$ stack frames.
- **Range Propagation DFS:** Allocates 20 native thread call stack frames (each ~48 bytes), using $\approx 1 \text{ KB}$ of call stack memory.
- **In-Order Traversal with Explicit Stack:** Allocates a heap `Stack<TreeNode>` containing at most 20 object references ($\approx 160$ bytes).
Both approaches operate in sub-microsecond time with virtually zero GC pressure.
</details>

---

### Checkpoint 4: Minimum Absolute Difference Between Non-Adjacent Nodes
**Question:** In [LeetCode 530], why are we guaranteed that the minimum absolute difference between *any* two nodes in a BST must occur between two nodes that are adjacent in in-order traversal?
<details>
<summary><b>View Architectural Answer</b></summary>

By the In-Order Monotonicity Theorem, an in-order traversal of a BST produces a strictly sorted array $A = [x_1 < x_2 < \dots < x_n]$.
For any three sorted numbers $a < b < c$:
$$c - a = (c - b) + (b - a)$$
Since $(c - b) > 0$ and $(b - a) > 0$, the distance between non-adjacent elements $c - a$ is strictly greater than both adjacent distances $c - b$ and $b - a$. Therefore, the global minimum difference across all pairs must be attained by some adjacent pair in the sorted in-order sequence.
</details>

---

### Daily Mastery Checklist
- [x] Defined the global BST ordering contract and proved why local child checking fails.
- [x] Implemented range propagation validation using 64-bit `long` interval boundaries in [LeetCode 98].
- [x] Implemented in-order predecessor monotonicity tracking for validation.
- [x] Solved [LeetCode 230] ($K$-th Smallest) using early-exit in-order traversal in $O(H + K)$ time.
- [x] Solved [LeetCode 530] (Minimum Absolute Difference) using in-order adjacent delta comparison.
- [x] Built a generic, production-grade `BinarySearchTree<T>` container in C# with fail-fast iteration.
- [x] Connected BST ordering to relational database B-Tree index range scans.
