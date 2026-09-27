---
title: "Week 13 — Day 89: Lowest Common Ancestor & Two Sum in BST"
---

# Week 13 — Day 89: Lowest Common Ancestor & Two Sum in BST

Welcome to **Day 89 of your DSA Mastery Journey**!

Yesterday in [Day 88](./Week%2013%20%E2%80%94%20Day%2088:%20BST%20Construction,%20Conversion%20&%20Range%20Queries.md), we mastered balanced BST construction from sorted arrays and linked lists via median partitioning and simulated in-order traversal.

Today, we exploit the global BST ordering contract to solve complex multi-pointer search problems:
1. **The BST Split Point Principle ([LeetCode 235]):** Finding the Lowest Common Ancestor (LCA) in strictly $O(1)$ auxiliary space and $O(H)$ time by tracking where targets bifurcate.
2. **The Controlled Spine Iterator ([LeetCode 173]):** Implementing `BSTIterator` in amortized $O(1)$ time and $O(H)$ auxiliary space via lazy left-spine pushes.
3. **Dual-Iterator Two-Pointer Convergence ([LeetCode 653]):** Solving Two-Sum on a BST in strictly $O(H)$ auxiliary space by coordinating forward and reverse in-order iterators, eliminating the $O(N)$ heap memory of hash sets.
4. **Systems Architecture:** Database index bidirectional cursor navigation (`FETCH NEXT` / `FETCH PRIOR`), and RocksDB / LevelDB LSM-tree iterator mechanics.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 89 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│        PART I: BST LCA          │                                     │     PART II: DUAL ITERATORS     │
│    The Split Point Invariant    │                                     │   Two-Pointer BST Convergence   │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • LC 235: Lowest Common Ancestor│                                     │ • LC 173: BSTIterator           │
│ • p, q < root -> Branch Left    │                                     │ • Lazy Left-Spine Push Stack    │
│ • p, q > root -> Branch Right   │                                     │ • Amortized O(1) Next() Proof   │
│ • Bifurcation (Split) -> LCA!   │                                     │ • LC 653: Two Sum IV on BST     │
│ • Zero Recursion: O(1) Aux Space│                                     │ • Forward + Reverse Iterators   │
│ • Compare with LC 236 (General) │                                     │ • Strict O(H) Aux Space vs O(N) │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:*
    - **BST Lowest Common Ancestor (LC 235):** Find the lowest node $u$ in BST $T$ such that both $p$ and $q$ are descendants of $u$ (where a node can be a descendant of itself).
    - **Controlled BST Iterator (LC 173):** An iterator over the in-order traversal of a BST providing `Next()` and `HasNext()` in amortized $O(1)$ time and $O(H)$ memory.
    - **BST Two-Sum (LC 653):** Determine if there exist two distinct nodes $u, v \in T$ such that $u.val + v.val = k$.
  - *Core Invariants:*
    1. **The BST Split Point Invariant:** The Lowest Common Ancestor of two nodes $p$ and $q$ (with $p.val < q.val$) is the **first node $u$ encountered from the root** that satisfies:
       $$p.val \le u.val \le q.val$$
    2. **Spine Stack Invariant:** The top of the forward iterator stack is always the minimum unvisited node in the tree. The top of the reverse iterator stack is always the maximum unvisited node.
    3. **Two-Pointer Convergence Invariant:** Advancing the forward iterator increases the candidate sum; advancing the reverse iterator decreases the candidate sum.
  - *Misconception Check:* Candidates frequently copy general binary tree LCA ([LeetCode 236]) for [LeetCode 235]. While functionally correct, LC 236 uses bottom-up post-order DFS that traverses both subtrees and uses $O(H)$ recursion stack. In a BST, the ordering property allows a **top-down greedy walk in strictly $O(1)$ auxiliary space**!
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the need to materialize the entire tree into a flat array or allocate an $O(N)$ hash set to solve Two-Sum or range traversals.
  - *Complexity Advantage:* Reduces auxiliary space from $O(N)$ to $O(H)$ ($\approx 20$ stack frames for $1,000,000$ nodes), while achieving optimal $O(1)$ amortized iteration step time.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Finding closest common ancestors in sorted hierarchies, streaming tree iterators, or multi-element sum queries on ordered trees.
  - *When to Avoid / Failure Modes:* If the tree is an unordered general binary tree, split-point routing fails completely; general post-order LCA must be used.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Iterative BST LCA uses exactly zero heap allocations and 0 stack frames (CPU registers only). The BST iterator maintains an explicit `Stack<TreeNode>` containing at most $H$ node references.
  - *Production Systems:* Relational database cursor pagination (`FETCH NEXT` and `FETCH PRIOR`), index seek point determination, and LSM-tree multi-version merge iterators (RocksDB / Pebble).
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To find the Lowest Common Ancestor in a BST, I start at the root and exploit the ordering invariant: if both targets are smaller than the current node, the LCA must be in the left subtree. If both are larger, it must be in the right subtree. The moment the paths split—meaning one target is smaller and the other is larger, or the current node equals one of the targets—the current node is guaranteed to be the LCA. This runs in O(H) time and strictly O(1) space without recursion."
  - *Interviewer Evaluation Lens:* Checks whether the candidate immediately recognizes that BST LCA does not require general postorder DFS, articulates the split-point invariant, and implements Two-Sum in $O(H)$ space using dual spine iterators.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:*
    - BST LCA ([LC 235]): Time: $O(H)$; Auxiliary Space: Strictly $O(1)$.
    - BST Iterator ([LC 173]): `Next()` Amortized $O(1)$ time; Auxiliary Space: $O(H)$.
    - BST Two-Sum ([LC 653]): Time: $O(N)$; Auxiliary Space: $O(H)$ dual iterators.
  - *State Transition Trace (LCA of `2` and `8` in root `6`):*
    - Root `6`: $2 < 6$ and $8 > 6$. Paths diverge!
    - Node `6` is the Split Point $\implies$ Return `Node(6)` in $O(1)$ comparisons!

---

### 1.1 The BST Split Point Principle ([LeetCode 235])

In a general binary tree, finding LCA requires post-order bottom-up search. But in a BST, the tree's keys enforce spatial partitioning:

```
                      [ 6 ]  <── Split Point! (2 < 6 < 8) -> LCA is 6!
                    /       \
                [ 2 ]       [ 8 ]
               /     \     /     \
             [ 0 ]  [ 4 ] [ 7 ]  [ 9 ]
```

#### Decision Rules:
Starting from `curr = root`:
1. **Both Targets Left ($p.val < curr.val \land q.val < curr.val$):**
   - Both nodes reside in the left subtree.
   - Advance: `curr = curr.left`.
2. **Both Targets Right ($p.val > curr.val \land q.val > curr.val$):**
   - Both nodes reside in the right subtree.
   - Advance: `curr = curr.right`.
3. **Split Point Reached (Bifurcation or Match):**
   - If $p.val \le curr.val \le q.val$ (or $q.val \le curr.val \le p.val$):
   - $p$ and $q$ branch into different subtrees, OR `curr` equals one of the targets.
   - **`curr` is uniquely guaranteed to be the Lowest Common Ancestor!**

---

### 1.2 Binary Search Tree Iterator ([LeetCode 173])

A standard in-order traversal can be flattened into an array of $N$ elements upfront. However, this consumes $O(N)$ heap memory and cannot be used for streaming or early-exit pipelines.

The **Controlled Spine Iterator** maintains an explicit `Stack<TreeNode>` containing only the **left spine** of the current subtree:

```
Initial State: Push Left Spine from Root [ 7 ]
       [ 7 ]
      /     \           Stack (Bottom -> Top):
   [ 3 ]   [ 15 ]       [ 7 ]
  /     \               [ 3 ] ◄── Top (Next smallest)
null   null

1. Next() pops [ 3 ]. Value = 3.
   3 has no right child.
   Stack now has: [ 7 ].

2. Next() pops [ 7 ]. Value = 7.
   7 has right child [ 15 ]!
   PushLeftSpine(15):
   Stack now has: [ 15 ], [ 9 ].
```

---

### 1.3 Two-Pointer Convergence via Dual BST Iterators ([LeetCode 653])

In a sorted array, the classic Two-Sum problem is solved using two pointers `left = 0` and `right = N - 1` in $O(N)$ time and $O(1)$ space.

In a BST, we can simulate the exact same two-pointer algorithm directly on the tree structure:
- **Forward Iterator (`BstIterator`):** Mimics `left++`, yielding elements in ascending order ($x_1 < x_2 < \dots$).
- **Reverse Iterator (`BstReverseIterator`):** Mimics `right--`, yielding elements in descending order ($x_n > x_{n-1} > \dots$).

```
        Forward Iterator (Left)                  Reverse Iterator (Right)
                 [ 5 ]                                    [ 5 ]
                /     \                                  /     \
             [ 3 ]   [ 6 ]                            [ 3 ]   [ 6 ]
            /     \       \                          /     \       \
         [ 2 ]   [ 4 ]   [ 7 ]                    [ 2 ]   [ 4 ]   [ 7 ]
           ▲                                                        ▲
         currL = 2                                                currR = 7

Sum = 2 + 7 = 9. If Target = 9 -> Found!
If Sum < Target -> currL = forward.Next()
If Sum > Target -> currR = reverse.Next()
```

- **Memory Comparison:** A `HashSet<int>` stores up to $N$ integers ($\approx 8 \text{ MB}$ for $10^6$ nodes). Dual iterators store only $2H$ pointers on the call stack ($\approx 320 \text{ bytes}$)!

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Algorithms

Below are the complete, production-grade implementations for BST LCA, BST Iterator, and the Dual-Iterator Two-Sum solver:

```csharp
using System;
using System.Collections.Generic;

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

    // =========================================================================
    // 1. Lowest Common Ancestor of a BST ([LeetCode 235])
    // Time Complexity: O(H).
    // Auxiliary Space: Strictly O(1) iterative top-down walk.
    // =========================================================================
    public static class BstLcaSolver
    {
        public static TreeNode? LowestCommonAncestor(TreeNode? root, TreeNode p, TreeNode q)
        {
            TreeNode? curr = root;

            while (curr != null)
            {
                // Both targets in Left Subtree
                if (p.val < curr.val && q.val < curr.val)
                {
                    curr = curr.left;
                }
                // Both targets in Right Subtree
                else if (p.val > curr.val && q.val > curr.val)
                {
                    curr = curr.right;
                }
                // Split Point reached! (One left, one right, or curr == p, or curr == q)
                else
                {
                    return curr;
                }
            }

            return null;
        }
    }

    // =========================================================================
    // 2. Binary Search Tree In-Order Iterator ([LeetCode 173])
    // Supports Next() in amortized O(1) time and HasNext() in O(1) time.
    // Auxiliary Space: Strictly O(H) bound by tree height.
    // =========================================================================
    public class BSTIterator
    {
        private readonly Stack<TreeNode> _stack = new Stack<TreeNode>();

        public BSTIterator(TreeNode? root)
        {
            PushLeftSpine(root);
        }

        public bool HasNext()
        {
            return _stack.Count > 0;
        }

        public int Next()
        {
            TreeNode node = _stack.Pop();

            // If the popped node has a right child, its entire left spine must be pushed
            if (node.right != null)
            {
                PushLeftSpine(node.right);
            }

            return node.val;
        }

        private void PushLeftSpine(TreeNode? node)
        {
            while (node != null)
            {
                _stack.Push(node);
                node = node.left;
            }
        }
    }

    // =========================================================================
    // 3. Binary Search Tree Reverse In-Order Iterator
    // Pushes Right Spine to yield elements in strictly descending order.
    // =========================================================================
    public class BSTReverseIterator
    {
        private readonly Stack<TreeNode> _stack = new Stack<TreeNode>();

        public BSTReverseIterator(TreeNode? root)
        {
            PushRightSpine(root);
        }

        public bool HasPrev()
        {
            return _stack.Count > 0;
        }

        public int Prev()
        {
            TreeNode node = _stack.Pop();

            if (node.left != null)
            {
                PushRightSpine(node.left);
            }

            return node.val;
        }

        private void PushRightSpine(TreeNode? node)
        {
            while (node != null)
            {
                _stack.Push(node);
                node = node.right;
            }
        }
    }

    // =========================================================================
    // 4. Two Sum IV - Input is a BST ([LeetCode 653])
    // Optimal Dual-Iterator Two-Pointer Solution.
    // Time Complexity: O(N) single pass.
    // Auxiliary Space: Strictly O(H) using two spine stacks.
    // =========================================================================
    public static class BstTwoSumSolver
    {
        public static bool FindTarget(TreeNode? root, int k)
        {
            if (root == null) return false;

            BSTIterator forward = new BSTIterator(root);
            BSTReverseIterator reverse = new BSTReverseIterator(root);

            if (!forward.HasNext() || !reverse.HasPrev()) return false;

            int leftVal = forward.Next();
            int rightVal = reverse.Prev();

            while (leftVal < rightVal)
            {
                int currentSum = leftVal + rightVal;

                if (currentSum == k)
                {
                    return true;
                }
                else if (currentSum < k)
                {
                    if (!forward.HasNext()) break;
                    leftVal = forward.Next(); // Advance left pointer
                }
                else
                {
                    if (!reverse.HasPrev()) break;
                    rightVal = reverse.Prev(); // Advance right pointer
                }
            }

            return false;
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### 3.1 Formal Proof: The BST Split Point Theorem

> **Theorem (BST Split Point Theorem):**
> Let $T$ be a valid Binary Search Tree, and let $p$ and $q$ be two nodes in $T$ with $p.val < q.val$. The first node $u$ encountered on the downward path from the root satisfying:
> $$p.val \le u.val \le q.val$$
> is the **Lowest Common Ancestor** of $p$ and $q$.
>
> **Proof:**
> 1. Let $w$ be any ancestor of $u$ on the path from root. 
> 2. Since the search reached $u$, at every ancestor $w$, either:
>    - $p.val < w.val \land q.val < w.val$ (both branched left), or
>    - $p.val > w.val \land q.val > w.val$ (both branched right).
> 3. Therefore, both $p$ and $q$ belong to the same subtree of $w$, meaning $w$ is indeed a common ancestor of $p$ and $q$, but not the *lowest*.
> 4. Now consider node $u$, where $p.val \le u.val \le q.val$:
>    - **Case 1 ($p.val < u.val < q.val$):** By the BST invariant, $p$ must reside in $\text{LeftSubtree}(u)$, and $q$ must reside in $\text{RightSubtree}(u)$. Since $\text{LeftSubtree}(u)$ and $\text{RightSubtree}(u)$ are completely disjoint subgraphs, no descendant of $u$ can contain both $p$ and $q$. Thus, $u$ is the lowest common ancestor.
>    - **Case 2 ($u.val == p.val$):** Since $q.val > p.val$, $q$ resides in $\text{RightSubtree}(u)$. Since a node is allowed to be a descendant of itself, $u = p$ is the lowest common ancestor.
>    - **Case 3 ($u.val == q.val$):** Symmetrically, $u = q$ is the lowest common ancestor.
> 5. Therefore, the first node $u$ satisfying $p.val \le u.val \le q.val$ is uniquely the LCA. $\blacksquare$

---

### 3.2 Amortized $O(1)$ Complexity Proof of `BSTIterator.Next()`

> **Theorem (`BSTIterator` Amortized Step Cost):**
> Across any full in-order traversal of $N$ nodes using `BSTIterator`, the total time spent executing `Next()` is $\Theta(N)$, yielding an amortized cost of:
> $$\frac{\Theta(N)}{N} = \mathbf{O(1) \text{ amortized per call}}$$
>
> **Proof by Aggregate Accounting:**
> 1. Consider the tree's nodes and directed edges.
> 2. Each node $u$ in the tree is pushed onto the stack **exactly once** during the entire lifetime of the iterator (either during initial construction or when descending the left spine of its parent's right child).
> 3. Each node $u$ is popped from the stack **exactly once** in `Next()`.
> 4. No node is ever pushed twice or popped twice.
> 5. The total number of stack operations across all $N$ calls to `Next()` is exactly:
>    $$\text{Total Pushes} = N, \quad \text{Total Pops} = N \implies \text{Total Stack Ops} = 2N$$
> 6. Amortized cost per operation:
>    $$T_{\text{amortized}} = \frac{2N}{N} = 2 = O(1) \quad \blacksquare$$

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### 4.1 [LeetCode 235] Execution Trace

#### Input:
`root = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5]`, `p = 2`, `q = 4`.

```
                      [ 6 ]
                    /       \
                [ 2 ]       [ 8 ]
               /     \     /     \
             [ 0 ]  [ 4 ] [ 7 ]  [ 9 ]
                   /     \
                 [ 3 ]  [ 5 ]
```

#### Step-by-Step Top-Down Walk:
1. **Start at `curr = Node(6)`:**
   - $p.val = 2 < 6$
   - $q.val = 4 < 6$
   - Both targets are strictly less than 6! Advance to left child: `curr = curr.left` (Node 2).
2. **At `curr = Node(2)`:**
   - $p.val = 2 == curr.val$!
   - Condition $p.val \le curr.val \le q.val$ is satisfied ($2 \le 2 \le 4$).
   - Split point reached!
3. **Return `Node(2)`.**

Total comparisons: 2 steps. Space: $O(1)$!

---

### 4.2 [LeetCode 653] Dual-Iterator Two-Sum Trace

#### Input:
`root = [5, 3, 6, 2, 4, null, 7]`, `target = 9`.

```
Sorted In-Order Elements: [ 2, 3, 4, 5, 6, 7 ]
```

#### Pointer Convergence Trace:

| Step | Forward Val (`leftVal`) | Reverse Val (`rightVal`) | Current Sum | Comparison to $k = 9$ | Action Taken |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `2` | `7` | $2 + 7 = 9$ | **$9 == 9$** | **Target Found! Return `true`.** |

If target was `k = 28` (not present):
- Pointers advance iteratively from both ends until `leftVal >= rightVal`, terminating in $O(N)$ time with strictly $O(H)$ auxiliary space.

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Lowest Common Ancestor with Missing Keys (BST Variant)
- **Problem:** Given root of BST and values `p` and `q`, find the LCA. However, `p` or `q` might **not** exist in the tree! If either key is missing, return `null`.
- **Hint:** Two-pass algorithm: (1) Verify both `p` and `q` exist using `Find(p)` and `Find(q)` in $O(H)$ time. (2) If both exist, run the standard split-point LCA in $O(H)$ time and $O(1)$ space.
- **Target Complexity:** Time: $O(H)$, Auxiliary Space: $O(1)$.

### Exercise 2: Two Sum BST in Two Separate Trees ([LeetCode 1214])
- **Problem:** Given roots of two BSTs `root1` and `root2`, return `true` if there exist $u \in \text{root1}$ and $v \in \text{root2}$ such that $u.val + v.val = \text{target}$.
- **Hint:** Standard forward iterator on `root1` and reverse iterator on `root2`. If $val_1 + val_2 < \text{target}$, advance iterator 1. If $val_1 + val_2 > \text{target}$, advance iterator 2.
- **Target Complexity:** Time: $O(N_1 + N_2)$, Auxiliary Space: $O(H_1 + H_2)$.

### Exercise 3: In-Order Successor using `BSTIterator`
- **Problem:** Implement an in-order successor function using `BSTIterator`.
- **Hint:** Initialize `BSTIterator(root)`. While `iterator.HasNext()`: call `int val = iterator.Next()`. If `val == p.val`, the next call to `iterator.Next()` returns the successor.
- **Target Complexity:** Time: $O(N)$ worst case, Auxiliary Space: $O(H)$.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

### Real-World Systems Design: Bidirectional Cursor Pagination in Storage Engines

In enterprise databases (PostgreSQL, SQL Server, MySQL InnoDB) and key-value storage engines (RocksDB, LevelDB), queries use cursors to navigate sorted indexes:

```sql
DECLARE cur SCROLL CURSOR FOR SELECT * FROM Transactions ORDER BY Timestamp;
FETCH NEXT FROM cur;     -- Forward in-order step
FETCH PRIOR FROM cur;    -- Reverse in-order step
```

```
Storage Engine Index Iterator Architecture:
┌────────────────────────────────────────────────────────┐
│                   Index Cursor Engine                  │
├───────────────────────────┬────────────────────────────┤
│ Forward Iterator:         │ Reverse Iterator:          │
│ • Maintains parent stack  │ • Maintains parent stack   │
│ • Reads next key in O(1)  │ • Reads prev key in O(1)   │
│ • Lazy page prefetch      │ • Lazy page prefetch       │
└───────────────────────────┴────────────────────────────┘
```

By maintaining a bounded stack of ancestor page coordinates (height $\le 4$ in typical B+ Trees), the storage engine supports bidirectional pagination in **amortized $O(1)$ memory and time**, without scanning the table.

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint 1: BST LCA Space Advantage over General Trees
**Question:** Why does [LeetCode 235] (BST LCA) execute in strictly $O(1)$ auxiliary space, whereas [LeetCode 236] (General Binary Tree LCA) requires $O(H)$ auxiliary space?
<details>
<summary><b>View Architectural Answer</b></summary>

In a general binary tree, node values carry no spatial routing information. The algorithm has no way of knowing whether target $p$ is in the left or right subtree without traversing both. Therefore, it must perform a post-order bottom-up search, pushing stack frames down both branches ($O(H)$ auxiliary space).

In a Binary Search Tree, comparison with the current node deterministically tells us which subtree contains the targets ($val < curr.val \implies$ Left, $val > curr.val \implies$ Right). Because we only ever descend a single path, we can replace recursion with a simple `while` loop, updating a single pointer variable in a CPU register in strictly $O(1)$ auxiliary memory.
</details>

---

### Checkpoint 2: Amortized vs. Worst-Case `Next()` Cost
**Question:** In [LeetCode 173], what is the worst-case time complexity of a *single* call to `Next()`, and why does this not violate the amortized $O(1)$ requirement?
<details>
<summary><b>View Architectural Answer</b></summary>

The worst-case time complexity of a single `Next()` call is $O(H)$ (e.g. when popping a node whose right child has a long left spine extending to depth $H$). 
However, amortized analysis looks at the cost over a sequence of $N$ operations. Since each node in the tree is pushed onto the stack exactly once and popped exactly once over all $N$ invocations of `Next()`, the total work across all $N$ calls is bounded by $2N$. The average cost per operation is $2N / N = 2 = O(1)$ amortized.
</details>

---

### Checkpoint 3: Dual Iterator vs. HashSet Memory Trade-Off
**Question:** In [LeetCode 653] (Two Sum in BST), under what production conditions is the Dual-Iterator approach strictly superior to a `HashSet<int>` approach?
<details>
<summary><b>View Architectural Answer</b></summary>

The Dual-Iterator approach is strictly superior when:
1. **Memory is constrained:** On an embedded system or large database index with $10,000,000$ nodes, a `HashSet<int>` allocates $\approx 80 \text{ MB}$ of managed heap memory and causes significant GC pressure. Dual iterators allocate only two small stacks bounded by tree height ($\approx 2 \times 30 \times 8 \text{ B} \approx 480 \text{ bytes}$), an $99.99\%$ memory reduction!
2. **Early Exit is Likely:** If the target sum is formed by elements near the extremes (e.g. minimum and maximum), the dual iterators terminate after just a few steps, while the HashSet approach might unnecessarily traverse and allocate thousands of nodes before reaching the pair.
</details>

---

### Checkpoint 4: Split Point with Target Identical to Root
**Question:** In [LeetCode 235], what happens if $p$ is the root of the tree and $q$ is in the right subtree? How does the split-point condition handle this?
<details>
<summary><b>View Architectural Answer</b></summary>

At the root, $p.val == root.val$.
The condition `p.val < curr.val && q.val < curr.val` evaluates to `false` (since $p.val$ is not $< curr.val$).
The condition `p.val > curr.val && q.val > curr.val` evaluates to `false`.
The algorithm enters the `else` block and immediately returns `root` ($p$). 
This is mathematically correct: by definition of LCA, a node is allowed to be a descendant of itself. Thus, $p$ is its own ancestor and also an ancestor of $q$.
</details>

---

### Daily Mastery Checklist
- [x] Solved Lowest Common Ancestor in a BST ([LeetCode 235]) in $O(H)$ time and strictly $O(1)$ auxiliary space.
- [x] Proved the BST Split Point Theorem from first principles.
- [x] Implemented `BSTIterator` ([LeetCode 173]) with lazy left-spine push in amortized $O(1)$ time.
- [x] Implemented `BSTReverseIterator` with right-spine push for descending traversal.
- [x] Solved Two Sum IV ([LeetCode 653]) using dual iterators in $O(N)$ time and strictly $O(H)$ space.
- [x] Connected bidirectional BST iterators to database cursor navigation (`FETCH PRIOR`).
