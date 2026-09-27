---
title: "Week 13 — Day 87: BST 3-Case Node Deletion & In-Place Structural Rewiring"
---

# Week 13 — Day 87: BST 3-Case Node Deletion & In-Place Structural Rewiring

Welcome to **Day 87 of your DSA Mastery Journey**!

Yesterday in [Day 86](./Week%2013%20%E2%80%94%20Day%2086:%20BST%20Search,%20Insertion%20&%20Successor-Predecessor%20Mechanics.md), we mastered logarithmic branch pruning, leaf insertion, and $O(1)$-space in-order successor/predecessor navigation without parent pointers.

Today, we conquer the most delicate structural mutation in binary search trees: **The 3-Case Hibbard Deletion Algorithm & Subtree Range Trimming**:
1. **The 3 Topological Cases of BST Deletion ([LeetCode 450]):**
   - **Case 1 (Leaf Node):** Severing parent references with zero child displacement.
   - **Case 2 (Single Child):** Bypassing the deleted node to graft its sole child directly to its parent.
   - **Case 3 (Two Children):** Splicing the in-order successor (or predecessor) to preserve the global ordering invariant.
2. **The Successor Single-Child Guarantee:** Proving mathematically why the in-order successor can *never* possess a left child, guaranteeing that deleting the successor falls strictly into Case 1 or Case 2!
3. **Subtree Range Trimming ([LeetCode 669]):** Pruning out-of-boundary subtrees in a single recursive pass by leveraging the BST ordering trichotomy.
4. **The Knuth-Hibbard Asymmetry Theorem:** Why repeatedly deleting via in-order successors causes trees to become pathological left-heavy skews over time.
5. **Systems Architecture:** Database index page reclamation (B+ Tree underflow merging) and GC reference loitering prevention on the .NET CLR heap.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 87 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: HIBBARD DELETION    │                                     │     PART II: RANGE TRIMMING     │
│   The 3 Topological Cases       │                                     │     Subtree Branch Bypassing    │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • LC 450: Delete Node in BST    │                                     │ • LC 669: Trim a BST            │
│ • Case 1: Leaf -> Return null   │                                     │ • Predicate: [low, high] bounds │
│ • Case 2: 1 Child -> Bypass node│                                     │ • If val < low: Prune Left Tree │
│ • Case 3: 2 Children -> Swap    │                                     │   --> Return Trim(node.right)   │
│   with Successor (min of right) │                                     │ • If val > high: Prune Right    │
│ • Invariant: Succ.Left == null! │                                     │   --> Return Trim(node.left)    │
│ • GC Reference Loitering Null   │                                     │ • Pure Functional In-Place Rewire│
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* Given a target value $K$ and root of BST $T$, remove the node containing key $K$ and return the new root such that the **Global BST Invariant** holds for all remaining nodes.
  - *Core Invariants:*
    1. **Structural Continuity Invariant:** For every node $u$ remaining in $T$, all keys in $\text{Left}(u) < u.val <$ all keys in $\text{Right}(u)$.
    2. **Successor Left-Child Nullity Invariant:** For any node $u$ with $u.right \ne null$, let $s = \text{Successor}(u) = \min(u.right)$. Then $s.left$ is **strictly `null`**.
    3. **Range Trimming Invariant:** Any node $u$ with $u.val < low$ cannot have any valid nodes in its left subtree; its entire left subtree can be discarded. Similarly, any node with $u.val > high$ cannot have valid nodes in its right subtree.
  - *Misconception Check:* Candidates often attempt to swap values for Case 3 (`node.val = successor.val`) in systems where nodes are mutable objects. While valid in LeetCode, in real-world production systems (or concurrent memory architectures), mutating node keys invalidates external references and hash keys. In production, **pointer splicing** (rewiring left/right references to physically move the successor node) is strictly required.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Prevents rebuilding the tree from scratch ($O(N)$) upon record removal; achieves dynamic deletion in $O(H)$ time.
  - *Mathematical Advantage:* By substituting the deleted node with its in-order successor, all nodes in the left subtree remain strictly smaller than the successor, and all remaining nodes in the right subtree remain strictly greater.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Dynamic sorted indexes requiring real-time record removal, interval trimming, or eviction policies (LRU/TTL index pruning).
  - *When to Avoid / Failure Modes:* In unrotated plain BSTs, repeated deletions and insertions lead to tree degeneration (Hibbard asymmetry), requiring self-balancing AVL or Red-Black rotations.
  - *Signal Words:* "Delete node in BST", "trim BST", "remove range", "prune nodes outside interval".
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* When removing a node in C#, references to the removed node must be cleared to allow the .NET Generational Garbage Collector (Gen 0 GC) to reclaim its ~40 bytes of heap memory. Leaving references creates **Memory Loitering**.
  - *Production Systems:* B+ Tree leaf page key deletion in database storage engines (MySQL InnoDB, SQLite). When a page falls below 50% capacity (underflow), storage engines merge sibling pages.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To delete a node from a BST in O(H) time, I handle three topological cases. If the node is a leaf, I return null to sever it. If it has one child, I return that child to bypass the node. If it has two children, I find its in-order successor—the minimum of its right subtree. The successor is guaranteed to have no left child, so I copy its value to the current node and recursively delete the successor from the right subtree, reducing Case 3 into Case 1 or 2."
  - *Interviewer Evaluation Lens:* Checks whether candidate cleanly identifies all 3 cases, proves why the successor has no left child, handles the root deletion edge case, and understands pointer rewiring vs value swapping.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:* Time: $O(H)$ where $H$ is tree height; Auxiliary Space: $O(H)$ recursive call stack (or $O(1)$ iterative).
  - *State Transition Trace (Delete `Node(5)` with two children in `[5, 3, 6, 2, 4, null, 7]`):*
    - Find `5`: Has two children (`3` and `6`).
    - Find Successor: $\min(6) = 6$ (since $6.left == null$).
    - Value Swap: `Node(5).val = 6`.
    - Recurse Right: Delete `6` from right subtree $\implies$ Case 2 (has right child 7) $\implies$ returns `7`.
    - Result: `Node(6)` with left `3` and right `7`. Valid BST!

---

### 1.1 The 3 Topological Cases of Hibbard Deletion

```
Case 1: Delete Leaf Node [ 2 ]
      [ 5 ]                  [ 5 ]
     /     \     ===>       /     \
  [ 3 ]   [ 7 ]          [ 3 ]   [ 7 ]
  /
[ 2 ]* (Sever -> null)

---------------------------------------------------------------------------------
Case 2: Delete Node with One Child [ 3 ]
      [ 5 ]                  [ 5 ]
     /     \     ===>       /     \
  [ 3 ]*  [ 7 ]          [ 4 ]   [ 7 ]  <── Child [ 4 ] bypassed directly to [ 5 ]
     \
     [ 4 ]

---------------------------------------------------------------------------------
Case 3: Delete Node with Two Children [ 5 ]
         [ 5 ]*                                  [ 6 ] (Successor Promoted!)
        /     \                                 /     \
     [ 3 ]   [ 7 ]             ===>          [ 3 ]   [ 7 ]
    /   \    /   \                          /   \       \
  [ 2 ] [ 4 ][ 6 ][ 8 ]                   [ 2 ] [ 4 ]   [ 8 ]
             ▲
     Successor (min of right)
```

---

### 1.2 Mathematical Proof: The Successor Left-Child Nullity Invariant

> **Theorem (Successor Left-Child Invariant):**
> Let $u$ be any node in a Binary Search Tree with $u.right \ne null$. Let $s$ be the in-order successor of $u$. Then $s.left == null$.
>
> **Proof by Contradiction:**
> 1. By definition of in-order traversal, the in-order successor of $u$ is the node with the minimum value in $u$'s right subtree:
>    $$s = \arg\min_{v \in \text{RightSubtree}(u)} \text{val}(v)$$
> 2. Suppose for contradiction that $s.left \ne null$, and let $w = s.left$.
> 3. By the BST Global Ordering Invariant, every node in the left subtree of $s$ must be strictly less than $s$:
>    $$\text{val}(w) < \text{val}(s)$$
> 4. Since $w$ is a descendant of $s$, and $s \in \text{RightSubtree}(u)$, it follows that $w \in \text{RightSubtree}(u)$.
> 5. But then $w$ is a node in $u$'s right subtree with $\text{val}(w) < \text{val}(s)$, which directly contradicts that $s$ is the minimum value in $u$'s right subtree.
> 6. Therefore, $s.left$ must be strictly `null`. $\blacksquare$

**Corollaries:**
- Because $s.left == null$, deleting the successor $s$ from the right subtree can **never** trigger Case 3.
- Deleting $s$ is guaranteed to trigger **Case 1 (if $s$ is a leaf)** or **Case 2 (if $s$ has a right child)**.

---

### 1.3 Subtree Range Trimming Mechanics ([LeetCode 669])

In [LeetCode 669], we are given a BST and an interval $[low, high]$. We must trim the tree so that all remaining elements fall within $[low, high]$:

```
Given Range: [1, 3]

Original Tree:                         Trimmed Tree:
        [ 3 ]                                [ 3 ]
       /     \                              /
    [ 0 ]*   [ 4 ]*                       [ 2 ]
     \                                    /
     [ 2 ]                             [ 1 ]
     /
  [ 1 ]
```

#### Pruning Decisions:
1. **If `node.val < low`:**
   - Because of the BST invariant, all nodes in `node.left` are also $< low$ (too small).
   - Therefore, `node` and its entire left subtree must be discarded!
   - We bypass `node` and return `TrimBST(node.right, low, high)`.
2. **If `node.val > high`:**
   - All nodes in `node.right` are also $> high$ (too large).
   - `node` and its entire right subtree are discarded.
   - We bypass `node` and return `TrimBST(node.left, low, high)`.
3. **If `low <= node.val <= high`:**
   - `node` survives. We recursively trim both children:
     - `node.left = TrimBST(node.left, low, high);`
     - `node.right = TrimBST(node.right, low, high);`
   - Return `node`.

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Container Extensions

Below is the complete `BinarySearchTree<T>` container extended with production-grade recursive and iterative 3-case deletion, complete with memory reference cleanup:

```csharp
using System;
using System.Collections.Generic;

namespace BstFundamentals
{
    public class BinarySearchTreeDeletionExtensions<T> where T : IComparable<T>
    {
        public BstNode<T>? Root { get; set; }
        public int Count { get; private set; }

        /// <summary>
        /// Approach 1: Functional Recursive 3-Case Hibbard Deletion.
        /// Rewires parent pointers seamlessly using recursive return values.
        /// Time Complexity: O(H).
        /// Auxiliary Space: O(H) call stack frames.
        /// </summary>
        public bool Remove(T value)
        {
            if (value == null) throw new ArgumentNullException(nameof(value));

            int initialCount = Count;
            Root = DeleteRecursive(Root, value);
            return Count < initialCount;
        }

        private BstNode<T>? DeleteRecursive(BstNode<T>? node, T value)
        {
            if (node == null) return null;

            int cmp = value.CompareTo(node.Value);

            if (cmp < 0)
            {
                node.Left = DeleteRecursive(node.Left, value);
            }
            else if (cmp > 0)
            {
                node.Right = DeleteRecursive(node.Right, value);
            }
            else
            {
                // Target Node Found! Execute 3-Case Deletion:
                Count--;

                // Case 1: Leaf Node
                if (node.Left == null && node.Right == null)
                {
                    return null;
                }

                // Case 2: One Child (Left is null, Right exists)
                if (node.Left == null)
                {
                    return node.Right;
                }

                // Case 2: One Child (Right is null, Left exists)
                if (node.Right == null)
                {
                    return node.Left;
                }

                // Case 3: Two Children
                // Find in-order successor (minimum in right subtree)
                BstNode<T> successor = FindMin(node.Right);

                // Overwrite current node's value with successor's value
                node.Value = successor.Value;

                // Recursively delete successor from right subtree (guaranteed Case 1 or 2)
                node.Right = DeleteRecursive(node.Right, successor.Value);

                // Re-increment Count because the inner recursive call will decrement Count again
                Count++;
            }

            return node;
        }

        /// <summary>
        /// Approach 2: Strictly Iterative In-Place Pointer Rewiring.
        /// Zero stack frames; completely avoids recursion limits.
        /// Time Complexity: O(H).
        /// Auxiliary Space: Strictly O(1).
        /// </summary>
        public bool RemoveIterative(T value)
        {
            if (value == null || Root == null) return false;

            BstNode<T>? curr = Root;
            BstNode<T>? parent = null;

            // Step 1: Locate target node and its parent
            while (curr != null && curr.Value.CompareTo(value) != 0)
            {
                parent = curr;
                curr = value.CompareTo(curr.Value) < 0 ? curr.Left : curr.Right;
            }

            if (curr == null) return false; // Value not found

            // Step 2: Handle Case 3 (Two Children) by reducing to Case 1 or 2
            if (curr.Left != null && curr.Right != null)
            {
                // Find in-order successor and its parent
                BstNode<T> succParent = curr;
                BstNode<T> succ = curr.Right;

                while (succ.Left != null)
                {
                    succParent = succ;
                    succ = succ.Left;
                }

                // Copy successor value to current node
                curr.Value = succ.Value;

                // Now target to physically delete is 'succ'
                curr = succ;
                parent = succParent;
            }

            // Step 3: Handle Case 1 (Leaf) & Case 2 (Single Child) for node 'curr'
            BstNode<T>? replacement = curr.Left ?? curr.Right;

            if (parent == null)
            {
                // Deleting root node
                Root = replacement;
            }
            else if (parent.Left == curr)
            {
                parent.Left = replacement;
            }
            else
            {
                parent.Right = replacement;
            }

            // Sever deleted node pointers to prevent memory loitering
            curr.Left = null;
            curr.Right = null;
            Count--;

            return true;
        }

        private BstNode<T> FindMin(BstNode<T> node)
        {
            while (node.Left != null) node = node.Left;
            return node;
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### 3.1 The Knuth-Hibbard Deletion Asymmetry Theorem

In 1962, Thomas C. Hibbard introduced the standard 3-case BST deletion algorithm. For decades, computer scientists assumed that performing random insertions and Hibbard deletions on a BST preserved average $O(\log N)$ height.

> **Theorem (Knuth-Hibbard Asymmetry Theorem):**
> Successive random insertions and Hibbard deletions that consistently replace two-child nodes with their **in-order successor** do *not* leave trees randomly distributed. Instead, they systematically introduce **left-heavy skew**, causing average tree height to degenerate from $\Theta(\log N)$ to $\mathbf{\Theta(\sqrt{N})}$.
>
> **Mathematical Intuition:**
> 1. In Case 3, the successor is always chosen from the **right subtree**.
> 2. The successor is deleted from the right subtree, reducing the size of the right subtree by 1.
> 3. The left subtree is left completely untouched.
> 4. Over thousands of random delete/insert cycles, right subtrees become statistically shorter than left subtrees.
> 5. Donald Knuth proved in *The Art of Computer Programming (Vol. 3)* that after $O(N^2)$ operations, the height degrades to $\Theta(\sqrt{N})$.

```
Symmetric Initial Tree               After 10,000 Hibbard Deletions (Left Skew)
           [ 50 ]                                    [ 50 ]
         /        \                                 /      \
      [ 25 ]    [ 75 ]                           [ 25 ]   [ 60 ]
      /    \    /    \                           /    \        \
   [ 10 ] [ 35 ][ 60 ][ 90 ]                  [ 10 ] [ 35 ]   [ 75 ]
                                              /
                                           [ 5 ]
```

**Architectural Countermeasure:**
To eliminate Hibbard skew, production plain BSTs toggle between the in-order successor and the in-order predecessor on alternating deletions (or randomly with probability $p = 0.5$). For absolute worst-case guarantees, **self-balancing trees (AVL / Red-Black)** must be used.

---

### 3.2 Time & Space Complexity Analysis

| Algorithm Phase | Best Case (Balanced) | Average Case (Random) | Worst Case (Skewed) | Auxiliary Space |
| :--- | :--- | :--- | :--- | :--- |
| **Locating Node to Delete** | $\Theta(1)$ (Root) | $\Theta(\log N)$ | $\Theta(N)$ | $O(1)$ Iterative / $O(H)$ Recursive |
| **Finding Successor (Case 3)**| $\Theta(1)$ | $\Theta(\log N)$ | $\Theta(N)$ | $O(1)$ |
| **Total Deletion Time ([LC 450])**| $\Theta(1)$ | $\Theta(\log N)$ | $\Theta(N)$ | $O(1)$ Iterative / $O(H)$ Recursive |
| **Range Trimming ([LC 669])** | $\Theta(N)$ | $\Theta(N)$ | $\Theta(N)$ | $O(H)$ Stack Frames |

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### 4.1 [LeetCode 450] Delete Node in a BST

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

    public static class BstDeletionSolution
    {
        /// <summary>
        /// Deletes a node with the given key from a BST.
        /// Time Complexity: O(H).
        /// Auxiliary Space: O(H) recursion stack.
        /// </summary>
        public static TreeNode? DeleteNode(TreeNode? root, int key)
        {
            if (root == null) return null;

            if (key < root.val)
            {
                root.left = DeleteNode(root.left, key);
            }
            else if (key > root.val)
            {
                root.right = DeleteNode(root.right, key);
            }
            else
            {
                // Target Node Found!
                // Case 1 & 2: At most one child
                if (root.left == null) return root.right;
                if (root.right == null) return root.left;

                // Case 3: Two children
                // Find in-order successor (smallest in right subtree)
                TreeNode successor = GetMin(root.right);

                // Overwrite value
                root.val = successor.val;

                // Delete successor from right subtree
                root.right = DeleteNode(root.right, successor.val);
            }

            return root;
        }

        private static TreeNode GetMin(TreeNode node)
        {
            while (node.left != null) node = node.left;
            return node;
        }
    }
}
```

---

### 4.2 [LeetCode 669] Trim a Binary Search Tree

```csharp
namespace BstFundamentals
{
    public static class BstTrimmingSolution
    {
        /// <summary>
        /// Trims BST so that all node values lie within [low, high].
        /// Time Complexity: Strictly O(N) visiting each valid node once.
        /// Auxiliary Space: O(H) recursion call stack.
        /// </summary>
        public static TreeNode? TrimBST(TreeNode? root, int low, int high)
        {
            if (root == null) return null;

            // If root value is strictly less than low:
            // All nodes in left subtree are also < low, so prune root + left subtree!
            if (root.val < low)
            {
                return TrimBST(root.right, low, high);
            }

            // If root value is strictly greater than high:
            // All nodes in right subtree are also > high, so prune root + right subtree!
            if (root.val > high)
            {
                return TrimBST(root.left, low, high);
            }

            // Root value is valid; trim left and right subtrees recursively
            root.left = TrimBST(root.left, low, high);
            root.right = TrimBST(root.right, low, high);

            return root;
        }
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Symmetric Deletion with In-Order Predecessor
- **Problem:** Implement BST deletion replacing Case 3 nodes with their **in-order predecessor** instead of successor.
- **Hint:** In Case 3, find the maximum node in the left subtree: `TreeNode pred = GetMax(root.left)`. Set `root.val = pred.val`, then delete `pred.val` from the left subtree: `root.left = DeleteNode(root.left, pred.val)`.
- **Target Complexity:** Time: $O(H)$, Auxiliary Space: $O(H)$.

### Exercise 2: Split BST ([LeetCode 776])
- **Problem:** Given root of BST and target integer $V$, split the tree into two subtrees: one with values $\le V$ and one with values $> V$.
- **Hint:** If `root.val <= V`, `root` and its entire left subtree belong to the $\le V$ tree. Recurse on `root.right` to split it into two subtrees: `[rightSmall, rightLarge]`. Set `root.right = rightSmall`, and return `[root, rightLarge]`.
- **Target Complexity:** Time: $O(H)$, Auxiliary Space: $O(H)$.

### Exercise 3: Prune BST Leaf Nodes Not Satisfying Condition
- **Problem:** Remove all leaf nodes whose value is an odd integer.
- **Hint:** Use bottom-up postorder traversal: `root.left = Prune(root.left); root.right = Prune(root.right);`. After children are pruned, check if `root` has now become a leaf (`left == null && right == null`) and is odd (`root.val % 2 != 0`). If so, return `null`.
- **Target Complexity:** Time: $O(N)$, Auxiliary Space: $O(H)$.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

### Real-World Systems Design: B+ Tree Page Reclamation in Database Engines

In relational database storage engines (PostgreSQL, MySQL InnoDB, SQLite), table rows are stored inside B+ Tree leaf pages (typically 4KB or 16KB blocks on disk):

```
       B+ Tree Internal Node [ Page 10 ]
                 /            \
     [ Leaf Page 1 ]         [ Leaf Page 2 ]
     Keys: [ 10, 20 ]        Keys: [ 30, 40, 50, 60 ]
```

When a SQL `DELETE` statement executes:
1. **Mark as Deleted:** The storage engine removes the key from the leaf page.
2. **Page Underflow Threshold:** If the leaf page's data volume falls below a fixed threshold (e.g. 50% capacity), the engine cannot leave empty disk blocks wasted.
3. **Redistribution or Sibling Merge:**
   - **Borrow Key:** If the sibling page has excess keys, borrow a key (like BST successor rotation).
   - **Merge Pages:** If the sibling page is also underfilled, merge both pages into a single 4KB page and delete the separator key from the parent index node (recursive deletion up the tree).

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint 1: The Successor Left-Child Guarantee
**Question:** In Case 3 of BST deletion, why is the in-order successor strictly guaranteed to have NO left child (`successor.left == null`)?
<details>
<summary><b>View Architectural Answer</b></summary>

The in-order successor of node $u$ is defined as the node with the minimum value in $u$'s right subtree. 
To find the minimum value in any binary search tree, we start at the subtree root and walk repeatedly left: `while (curr.left != null) curr = curr.left;`.
The loop terminates only when `curr.left == null`.
If the successor had a left child, that left child would contain a value strictly smaller than the successor, which contradicts that the successor was the minimum element in that right subtree. Therefore, `successor.left` is guaranteed to be `null`.
</details>

---

### Checkpoint 2: Value Overwriting vs. Pointer Rewiring in Production Systems
**Question:** In [LeetCode 450], Case 3 is commonly implemented as:
```csharp
root.val = successor.val;
root.right = DeleteNode(root.right, successor.val);
```
Why is this key-overwriting pattern considered an anti-pattern in production systems with object identity or concurrency?
<details>
<summary><b>View Architectural Answer</b></summary>

1. **Object Identity & Reference Mutation:** If external callers hold references to the `successor` node or the `root` node, overwriting `root.val` mutates the identity of an existing object without notifying callers.
2. **Heavy Payload Copies:** If each node contains a large payload object (e.g. 100KB struct or domain entity), copying values incurs memory copies.
3. **Concurrent Tree Synchronization:** In lock-free or fine-grained locking BSTs (e.g. concurrent database indexes), modifying a node's key in-place while readers are concurrently searching breaks reader invariants. Physical pointer splicing of the successor node preserves object identity and immutability.
</details>

---

### Checkpoint 3: The Knuth-Hibbard Left-Skew Phenomenon
**Question:** If a plain BST undergoes 100,000 random insertions and 100,000 Hibbard deletions, why does the tree degenerate into a left-skewed shape with height $\Theta(\sqrt{N})$ instead of remaining $O(\log N)$?
<details>
<summary><b>View Architectural Answer</b></summary>

Hibbard deletion is structurally asymmetric. Whenever a two-child node is deleted, the algorithm always removes the in-order successor from the **right subtree**. Over time, this consistently removes nodes from right subtrees while leaving left subtrees untouched. 
Statistically, right branches become shorter, while left branches grow progressively deeper. As proven by Donald Knuth, this structural asymmetry degrades average path length from $O(\log N)$ to $\Theta(\sqrt{N})$.
</details>

---

### Checkpoint 4: Range Trimming Pruning Completeness
**Question:** In [LeetCode 669], when `root.val < low`, why is it mathematically safe to discard the entire left subtree without inspecting any of its nodes?
<details>
<summary><b>View Architectural Answer</b></summary>

By the Global BST Invariant, for any node $u$, every node $v$ in its left subtree satisfies $\text{val}(v) < \text{val}(u)$.
If $\text{val}(u) < low$, then by transitivity:
$$\forall v \in \text{LeftSubtree}(u): \text{val}(v) < \text{val}(u) < low$$
Every single descendant in the left subtree is strictly less than $low$. None of them can ever satisfy the range condition $[low, high]$. Therefore, the entire left subtree can be pruned in $O(1)$ operations.
</details>

---

### Daily Mastery Checklist
- [x] Mastered the 3 topological cases of the Hibbard Deletion Algorithm ([LeetCode 450]).
- [x] Formally proved the Successor Left-Child Nullity Invariant ($s.left == null$).
- [x] Implemented recursive rewiring and iterative pointer splicing for BST deletion.
- [x] Solved Subtree Range Trimming ([LeetCode 669]) in $O(N)$ time and $O(H)$ space.
- [x] Analyzed the Knuth-Hibbard Asymmetry Theorem and understood why plain BSTs degenerate to $\Theta(\sqrt{N})$.
- [x] Connected BST deletion to database B+ Tree underflow page merges.
