---
title: "Week 11 — Day 76: Flatten Binary Tree to Linked List & In-Place Pointer Rewiring"
---

# Week 11 — Day 76: Flatten Binary Tree to Linked List & In-Place Pointer Rewiring

Welcome to **Day 76 of your DSA Mastery Journey**!

Yesterday in [Day 75](./Week%2011%20%E2%80%94%20Day%2075:%20Binary%20Tree%20Boundary%20Traversal%20&%20Vertical%20Order%20Traversal.md), we mastered boundary contour extraction and 2D vertical grid projections.

Today, we confront one of the most intellectually elegant pointer-manipulation techniques in technical interviews: **In-Place Tree Structural Transformations & Pointer Splicing**:
1. **The Preorder Flattening Contract:** Transforming a non-linear 2D tree topology into a right-skewed linked list strictly in-place.
2. **The Reference Overwriting Hazard:** Why standard top-down preorder traversal destroys subtree references before they can be traversed.
3. **Approach 1: Reverse Post-Order DFS (`Right -> Left -> Root`):** Utilizing recursion stack unwinding to safely assemble the list from tail to head.
4. **Approach 2: In-Place Predecessor Splicing ($O(1)$ Auxiliary Space):** The Morris-style pointer transformation achieving linear time with zero stack frames and zero heap allocations.
5. **The Multilevel Doubly Linked List Isomorphism ([LeetCode 430]):** Mapping tree flattening onto complex bidirectional node graphs.
6. **Real-World Systems Architecture:** LISP 2 Mark-Compact GC pointer threading and .NET `ThreadPool` work-stealing queue task flattening.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 76 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: TREE FLATTENING     │                                     │     PART II: COMPLEX SPLICING   │
│   In-Place Pointer Surgery      │                                     │  Multilevel Doubly Linked Lists │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Preorder Sequence Contract    │                                     │ • LC 430: Tree-to-DLL Mapping   │
│ • Reverse Postorder DFS: O(H)   │                                     │ • Child == Left, Next == Right  │
│ • Morris Predecessor Splicing   │                                     │ • Bidirectional Pointer Stitch  │
│ • Zero Extra Memory: O(1) Space │                                     │ • Tail Splice & Null Traps      │
│ • Amortized 2*|E| Proof         │                                     │ • Mark-Compact GC Threading     │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* **Tree Flattening** transforms a binary tree into a right-skewed linked list in-place such that nodes follow the tree's **preorder traversal** (`Root -> Left -> Right`), where for every node $u$, $u.left = \text{null}$ and $u.right$ points to the next node in the preorder sequence.
  - *Core Invariants:*
    1. **Preorder Continuity Invariant:** For every node $u$, $u.right$ points to the node that would immediately follow $u$ in standard preorder traversal.
    2. **Null Left Branch Invariant:** For every node $u$, $u.left == \text{null}$ upon completion.
    3. **Node Identity Preservation:** No new `TreeNode` objects are allocated; all mutations rewire existing pointers on the managed heap.
  - *Misconception Check:* A naive forward preorder traversal that sets `root.right = root.left` immediately destroys the reference to the original `root.right` subtree! Once overwritten, the entire right subtree is orphaned and lost.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the $O(N)$ extra memory overhead of storing nodes in a temporary list or queue, and eliminates the $O(H)$ stack space of recursive traversals.
  - *Complexity Advantage:* In-place predecessor splicing executes in $\Theta(N)$ time and strictly **$O(1)$ auxiliary space**, enabling zero-allocation memory compaction and cache streaming.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose / Signal Words:* "Flatten binary tree to linked list", "in-place flattening", "right pointer as next", "multilevel doubly linked list flattening".
  - *When to Avoid / Failure Modes:* If the tree must retain logarithmic search properties ($O(\log N)$ BST search), flattening is destructive and irreversible without tree reconstruction.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Direct pointer rewiring of 8-byte reference fields (`left`, `right`) within 64-bit object headers on the CLR managed heap.
  - *Production Systems:* LISP 2 Mark-Compact GC pointer threading algorithm (threading forwarding addresses through existing pointer fields without relocation tables), .NET `ThreadPool` flattening hierarchical recursive tasks into linear worker ring buffers.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To flatten a binary tree into a preorder linked list in strictly $O(1)$ space, I iterate using a current pointer. Whenever a node has a left child, I locate the rightmost node of that left subtree—which is the preorder predecessor of the current right child—link its right pointer to the current right child, move the left subtree to the right, and set left to null. Since each edge is traversed at most twice, this runs in $O(N)$ time with zero extra memory."
  - *Interviewer Evaluation Lens:* Checks awareness of the reference-overwriting bug in forward preorder, mastery of Reverse Postorder DFS (`Right -> Left -> Root`), ability to execute Morris-style predecessor splicing, and rigorous amortized edge traversal analysis proving $O(N)$ time.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:* Predecessor Splicing: $\Theta(N)$ time, $\mathbf{O(1)}$ auxiliary space; Reverse Postorder: $\Theta(N)$ time, $O(H)$ call stack space.
  - *State Transition Trace (Predecessor Splicing):*
    `curr=1 (left=2, right=5) -> pred=4 (rightmost of 2) -> pred.right = 5 -> curr.right = 2 -> curr.left = null -> advance curr to 2 -> repeat`.

---

### 1.1 The Preorder Reference Overwriting Hazard

Consider what happens if we attempt naive forward preorder traversal:

```csharp
// ❌ CATASTROPHIC BUG: Subtree Reference Loss!
void BadFlatten(TreeNode? root)
{
    if (root == null) return;

    TreeNode? left = root.left;
    TreeNode? right = root.right;

    root.left = null;
    root.right = left; // Overwrites right pointer!

    BadFlatten(root.left);
    BadFlatten(root.right); // Visits old left child, NEVER visits original right subtree!
}
```

Because `root.right` must be rewired to point to the start of the left subtree, **the reference to the original right subtree is severed**.

---

### 1.2 Approach 1: Reverse Post-Order DFS (`Right -> Left -> Root`)

To avoid losing references using recursion, we reverse the traversal order:
$$\text{Standard Preorder: } \text{Root} \longrightarrow \text{Left} \longrightarrow \text{Right}$$
$$\text{Reverse Preorder (Reverse Post-Order): } \text{Right} \longrightarrow \text{Left} \longrightarrow \text{Root}$$

In Reverse Post-Order:
1. We visit the **very last node** of the flattened list first!
2. We maintain a pointer `prev` pointing to the node that was most recently processed.
3. At the current node:
   ```csharp
   curr.right = prev;
   curr.left = null;
   prev = curr;
   ```
4. By the time the recursion unwinds back to the root, the entire linked list has been stitched together in reverse!

```
Tree:        [ 1 ]
            /     \
         [ 2 ]   [ 5 ]
         /   \       \
       [ 3 ] [ 4 ]   [ 6 ]

Preorder Sequence:         1 -> 2 -> 3 -> 4 -> 5 -> 6
Reverse Postorder Visits:  6 -> 5 -> 4 -> 3 -> 2 -> 1
```

- When visiting `6`: `6.right = null`, `prev = 6`.
- When visiting `5`: `5.right = 6`, `prev = 5`.
- When visiting `4`: `4.right = 5`, `prev = 4`.
- When visiting `3`: `3.right = 4`, `prev = 3`.
- When visiting `2`: `2.right = 3`, `prev = 2`.
- When visiting `1`: `1.right = 2`, `prev = 1`.
- **Complexity:** $\Theta(N)$ time, $\Theta(H)$ recursion stack space.

---

### 1.3 Approach 2: In-Place Predecessor Splicing ($O(1)$ Auxiliary Space)

Can we achieve tree flattening in **$O(1)$ auxiliary space** without any recursion or stack?
**YES!** By using **Predecessor Splicing** (the foundational principle behind Morris Traversal):

#### The Preorder Splicing Law
In a preorder traversal (`Root -> LeftSubtree -> RightSubtree`):
- All nodes in `LeftSubtree` must be visited **before** the first node of `RightSubtree`.
- The last node visited in `LeftSubtree` is its **rightmost node** (its in-order predecessor).
- Therefore, the original `curr.right` must be attached directly to the **rightmost descendant of `curr.left`**!

```
Step 1: Identify curr (1) and its left child (2).
        Find the rightmost node of left child: pred = 4.

                 [ 1 ] (curr)
                /     \
             [ 2 ]   [ 5 ] (curr.right)
             /   \       \
           [ 3 ] [ 4 ]   [ 6 ]
                   ▲
                   └── pred (rightmost of left subtree)

Step 2: Splice curr.right onto pred.right!
                 [ 1 ] (curr)
                /
             [ 2 ]
             /   \
           [ 3 ] [ 4 ]
                   \
                   [ 5 ]
                       \
                       [ 6 ]

Step 3: Move left subtree to right, and set left to null!
                 [ 1 ] (curr)
                     \
                     [ 2 ]
                     /   \
                   [ 3 ] [ 4 ]
                           \
                           [ 5 ]
                               \
                               [ 6 ]

Step 4: Advance curr = curr.right (now node 2), and repeat!
```

---

## 2. 🔬 ANALYZE: Complexity & Amortized Proof

### 2.1 Amortized Edge Traversal Proof ($2 \cdot |E|$ Steps)

A candidate often asks: *"Doesn't finding the rightmost predecessor for each node take $O(N)$, leading to $O(N^2)$ time?"*

**Formal Proof that Predecessor Splicing is strictly $\Theta(N)$:**
1. Consider the edges in the binary tree. There are $|E| = N - 1$ edges.
2. In the algorithm:
   - To find the predecessor, we only traverse edges going down `pred = pred.right`.
   - Once `pred.right = curr.right` is spliced, `curr.left` is shifted to `curr.right`.
   - Node `curr` advances down `curr.right`.
3. Every edge in the tree is traversed:
   - **At most once** while searching for the predecessor.
   - **At most once** when the `curr` pointer advances forward through the flattened spine.
4. Total edge visits $\le 2 \cdot (N - 1) = 2N - 2$.
5. Therefore, the total time complexity is strictly bounded by $O(N)$! $\blacksquare$

---

### 2.2 Algorithmic Trade-Off Matrix

| Strategy | Time Complexity | Auxiliary Space | In-Place? | Key Trade-Off |
| :--- | :--- | :--- | :--- | :--- |
| **Preorder Array Copy** | $\Theta(N)$ | $\Theta(N)$ heap list | ❌ No | Trivial to code; wastes $O(N)$ memory allocations. |
| **Reverse Postorder DFS** | $\Theta(N)$ | $\Theta(H)$ stack | ✅ Yes | Clean, recursive; incurs $O(N)$ stack frames on skewed trees. |
| **Predecessor Splicing** | $\mathbf{\Theta(N)}$ | $\mathbf{O(1)}$ memory | ✅ Yes | **Optimal Big Tech solution:** Zero stack, zero heap, $O(1)$ space. |

---

## 3. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

---

### 3.1 Problem 1: [LeetCode 114] Flatten Binary Tree to Linked List (Medium)

> **Problem Description:**
> Given the `root` of a binary tree, flatten the tree into a "linked list":
> - The "linked list" should use the same `TreeNode` class where the `right` child pointer points to the next node in the list and the `left` child pointer is always `null`.
> - The "linked list" should be in the same order as a **preorder traversal** of the binary tree.
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[0, 2000]$.
> - $-100 \le \text{Node.val} \le 100$
> - **Follow up:** Can you flatten the tree in-place with **$O(1)$ extra space**?

#### Production C# Implementation 1: Reverse Postorder DFS ($O(H)$ Stack Space)

```csharp
public class Solution114Dfs
{
    private TreeNode? _prev = null;

    public void Flatten(TreeNode? root)
    {
        if (root == null) return;

        // Traverse Right first, then Left, then Root (Reverse Post-Order)
        Flatten(root.right);
        Flatten(root.left);

        // Process current node
        root.right = _prev;
        root.left = null;
        _prev = root;
    }
}
```

#### Production C# Implementation 2: Predecessor Splicing (Optimal $O(1)$ Space)

```csharp
public class Solution114Optimal
{
    /// <summary>
    /// Flattens binary tree into preorder linked list in-place.
    /// Runs in O(N) time and strictly O(1) auxiliary space via predecessor splicing.
    /// </summary>
    public void Flatten(TreeNode? root)
    {
        TreeNode? curr = root;

        while (curr != null)
        {
            // If current node has a left child, we must splice
            if (curr.left != null)
            {
                // 1. Find the rightmost node of curr.left (preorder predecessor of curr.right)
                TreeNode pred = curr.left;
                while (pred.right != null)
                {
                    pred = pred.right;
                }

                // 2. Splice original curr.right onto predecessor's right
                pred.right = curr.right;

                // 3. Move left subtree to right and null out left
                curr.right = curr.left;
                curr.left = null;
            }

            // 4. Advance to the next node along the right spine
            curr = curr.right;
        }
    }
}
```

---

### 3.2 Problem 2: [LeetCode 430] Flatten a Multilevel Doubly Linked List (Medium)

> **Problem Description:**
> You are given a doubly linked list, which contains nodes that have a next pointer, a previous pointer, and an additional **child pointer**. This child pointer may or may not point to a separate doubly linked list, also containing these special nodes.
> Flatten the list so that all the nodes appear in a single-level, doubly linked list. The nodes should appear in the order of a **multilevel preorder traversal**.
>
> ```csharp
> public class Node {
>     public int val;
>     public Node prev;
>     public Node next;
>     public Node child;
> }
> ```

#### The Binary Tree Isomorphism
Notice that a multilevel doubly linked list is topologically identical to a binary tree:
- `child` pointer $\equiv$ `left` child
- `next` pointer $\equiv$ `right` child

When a node has a `child`, we splice the child sub-list between `curr` and `curr.next`, updating bidirectional `prev` and `next` pointers!

#### Production C# Implementation (Iterative $O(1)$ Space)

```csharp
public class Solution430
{
    public Node Flatten(Node head)
    {
        if (head == null) return null;

        Node curr = head;

        while (curr != null)
        {
            if (curr.child != null)
            {
                Node originalNext = curr.next;

                // 1. Splice child as curr.next
                curr.next = curr.child;
                curr.child.prev = curr;

                // 2. Find the tail of the child sub-list
                Node tail = curr.child;
                while (tail.next != null)
                {
                    tail = tail.next;
                }

                // 3. Connect child tail to originalNext
                if (originalNext != null)
                {
                    tail.next = originalNext;
                    originalNext.prev = tail;
                }

                // 4. Null out child pointer
                curr.child = null;
            }

            curr = curr.next;
        }

        return head;
    }
}
```

---

## 4. 🏋️ PRACTICE: Guided Exercises & Problem Set

### 4.1 Guided Exercises

#### Exercise 1: [LeetCode 116] Populating Next Right Pointers in Each Node (Medium)
- **Problem Statement:** In a perfect binary tree, populate each node's `next` pointer to point to its next right sibling.
- **Trigger Clue:** "Perfect binary tree" + $O(1)$ space constraint.
- **Template Hint:** Use the already established `next` pointers of the parent level to link the children of the next level:
  `curr.left.next = curr.right;`
  `if (curr.next != null) curr.right.next = curr.next.left;`
- **Target Complexity:** $\Theta(N)$ time, strictly $O(1)$ space without BFS queue!

#### Exercise 2: [LeetCode 117] Populating Next Right Pointers in Each Node II (Medium)
- **Problem Statement:** Same as LC 116, but the tree is an **arbitrary** binary tree (missing nodes).
- **Trigger Clue:** Incomplete levels $\implies$ cannot assume `curr.right` or `curr.next.left` exists.
- **Template Hint:** Maintain a sentinel dummy node for the child level: `dummy.next = null; needle = dummy;`. As `curr` iterates across the parent level, append existing children to `needle.next` and advance `needle`!
- **Target Complexity:** $\Theta(N)$ time, $O(1)$ space.

#### Exercise 3: [LeetCode 897] Increasing Order Search Tree (Easy)
- **Problem Statement:** Rearrange a BST into in-order sequence so that the leftmost node becomes root, and all nodes have only right children.
- **Trigger Clue:** In-order flattening $\implies$ standard in-order traversal keeping `prev` pointer.
- **Target Complexity:** $\Theta(N)$ time, $O(H)$ space.

---

## 5. ⚡ HARDWARE & SYSTEMS CONNECTIONS

### 5.1 LISP 2 Mark-Compact Garbage Collection (Pointer Threading)
During memory compaction, a copying Garbage Collector must move surviving objects to one end of the heap.
However, updating all references pointing to the moved objects normally requires an auxiliary relocation hash table ($O(N)$ extra memory).
- The classic **LISP 2 algorithm** solves this by **pointer threading**:
- It threads references directly through the objects' own pointer fields, forming in-place linked lists of referrers.
- This is the exact memory-level equivalent of predecessor splicing: reusing existing object fields to eliminate auxiliary memory allocation during defragmentation.

### 5.2 Task Schedulers & Thread Pool Deque Flattening
In divide-and-conquer runtimes (e.g. .NET `Parallel.Invoke`, TPL, or Java ForkJoin):
- Sub-tasks spawn child tasks, forming a hierarchical tree of closures.
- Worker threads executing tasks flatten the execution tree into a flat double-ended queue (work-stealing deque).
- In-place splicing avoids allocating scheduler nodes, keeping cache thrashing to zero.

---

## 6. ⚠️ DAILY ERROR LOG & COMMON TRAPS

### Trap 1: Forgetting to Set `curr.left = null`
- **The Bug:** Splicing `curr.right = curr.left` without executing `curr.left = null`.
- **The Failure:** The tree becomes a corrupted graph with lingering left pointers, failing LeetCode's automated structural validator.
- **The Fix:** **Always explicitly null out the left pointer:** `curr.left = null;`.

### Trap 2: Infinite Loop on Spliced Nodes
- **The Bug:** Advance pointer logic inside predecessor search connecting `pred.right` back to `curr` (like Morris Traversal thread) and forgetting to remove it.
- **The Failure:** Creates an un-severed cycle `curr -> ... -> pred -> curr`, causing an infinite loop.
- **The Fix:** Splice `pred.right = curr.right` (connecting to the original right child, NOT to `curr`).

### Trap 3: Null Reference on `originalNext.prev` in LC 430
- **The Bug:** Writing `originalNext.prev = tail;` without checking `if (originalNext != null)`.
- **The Failure:** If the parent node was the last node in its tier, `originalNext` is `null`, throwing `NullReferenceException`.
- **The Fix:** Guard with null check: `if (originalNext != null) originalNext.prev = tail;`.

---

## 7. 🎯 DAILY CHECKPOINT & SELF-ASSESSMENT

### 1. Conceptual Verification
1. In [LeetCode 114], trace how predecessor splicing transforms the tree into a linked list in $O(1)$ auxiliary space without allocating any new nodes or stack frames.
2. Why does the Reverse Postorder DFS (`Right -> Left -> Root`) eliminate the problem of overwriting `curr.right` before its subtree is visited?
3. In [LeetCode 430], what edge cases occur when a node with a `child` has `next == null`?

### 2. Implementation Audit
- Trace your `Flatten` implementation on a tree with only left children:
  `1 -> left: 2 -> left: 3`.
  Verify that the algorithm produces `1 -> right: 2 -> right: 3` with all left pointers nullified.

---
*Next Module: **Week 11 — Day 77: Week 11 Timed Synthesis & Path Contribution Drill (LeetCode 863, 257)***
