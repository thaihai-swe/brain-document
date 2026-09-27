---
title: "Week 10 — Day 69: Maximum Depth, Minimum Depth & Balanced Binary Tree Invariant"
---

# Week 10 — Day 69: Maximum Depth, Minimum Depth & Balanced Binary Tree Invariant

Welcome to **Day 69 of your DSA Mastery Journey**!

Yesterday in [Day 68](./Week%2010%20%E2%80%94%20Day%2068:%20Tree%20Symmetry,%20Isomorphism,%20Inversion%20&%20Structural%20Equivalence.md), we explored structural equivalence, mirror reflections, and in-place tree inversions.

Today, we master **Tree Vertical Metrics & Height Invariants**:
1. **Depth vs. Height Formalisms:** Disambiguating top-down path length from bottom-up subtree elevation.
2. **The AVL Balance Factor Invariant:** Understanding why a tree is balanced if and only if $|\text{height}(\text{left}) - \text{height}(\text{right})| \le 1$ for *every* node.
3. **The Bottom-Up Short-Circuiting Pattern:** Why top-down height checks trigger an $O(N^2)$ disaster, and how post-order DFS with sentinel `-1` achieves strict $\Theta(N)$ optimality.
4. **The Minimum Depth Trap:** Why naive `Math.Min` fails on single-child nodes, and how BFS guarantees optimal early exit on the first leaf.
5. **Canonical Problem Walkthroughs:** Production C# implementations for **LeetCode 104**, **LeetCode 111**, and **LeetCode 110**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 69 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: METRIC INVARIANTS   │                                     │     PART II: PATTERN MASTERY    │
│    Height, Depth & Balance      │                                     │   Short-Circuiting & Early Exit │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Depth (Top-Down) vs Height    │                                     │ • Bottom-Up O(N) Balanced Tree  │
│ • AVL Balance Factor |BF| <= 1  │                                     │ • Sentinel -1 Short-Circuit     │
│ • The Min-Depth Single-Child Trap│                                    │ • BFS Early Exit on First Leaf  │
│ • Top-Down O(N^2) Proof         │                                     │ • Maximum Depth Postorder DFS   │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **Tree Depth, Height & Balance Invariants** measure vertical topological distances from the root and leaf boundaries.
  - *Core Invariants:* Height Formula: $\text{Height}(u) = 1 + \max(\text{Height}(u.left), \text{Height}(u.right))$; AVL Balance Invariant: $|\text{Height}(u.left) - \text{Height}(u.right)| \le 1$ for **every** node $u$; Bottom-Up Short-Circuit Invariant: Return $-1$ immediately from subtrees upon detecting an imbalance to terminate in $\Theta(N)$ time.
  - *Misconception Check:* The Minimum Depth is *not* simply $1 + \min(\text{left}, \text{right})$; if a node has only one child, the path to a leaf must traverse that child! A null child does not count as a leaf.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(N^2)$ top-down re-traversal antipattern (calling `Height()` at every node).
  - *Complexity Advantage:* Computes height and verifies balance simultaneously in a single bottom-up $\Theta(N)$ pass.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Maximum Depth of Binary Tree" (LC 104), "Minimum Depth of Binary Tree" (LC 111), "Balanced Binary Tree" (LC 110). Signal words: "maximum depth", "minimum depth to leaf", "balanced binary tree".
  - *When to Avoid / Failure Modes:* Writing top-down recursive solutions that calculate height repeatedly at each node.
- **4. WHERE:**
  - *Physical CLR Memory:* Postorder recursion stack frames; returning integer height with sentinel `-1` for imbalance avoids allocating secondary tuples.
  - *Production Systems:* Self-balancing tree maintenance (AVL / Red-Black rebalance triggers), database query plan tree depth cost estimation.
- **5. WHO:**
  - *Spoken Script:* "To verify if a tree is balanced in $O(N)$ time, I use a bottom-up postorder DFS. If any subtree's left and right heights differ by more than 1, I immediately return -1 to short-circuit the recursion, avoiding the $O(N^2)$ penalty of recalculating heights top-down."
  - *Interviewer Evaluation Lens:* Checks bottom-up short-circuiting pattern, handling of single-child nodes in minimum depth, and complexity derivation.
- **6. HOW:**
  - *Cost Model:* Bottom-Up: $\Theta(N)$ time, $O(H)$ space; Top-Down (Antipattern): $O(N^2)$ time.
  - *State Transition Trace (Balanced Tree):* `Dfs(node): left = Dfs(node.left); if (left == -1) return -1; right = Dfs(node.right); if (right == -1 || abs(left - right) > 1) return -1; return 1 + max(left, right)`.


### 1.1 Disambiguating Depth vs. Height

In tree theory, **Depth** and **Height** are dual complementary metrics that measure distance in opposite directions:

```
                  [ Root ]         Depth = 1, Height = 3
                   /    \
               [ A ]    [ B ]      Depth = 2, Height = 2
               /
            [ C ]                  Depth = 3, Height = 1 (Leaf)
```

1. **Depth of a Node $u$ (Top-Down):**
   The number of edges (or nodes) along the unique simple path from the **Root downward to $u$**.
   $$\text{Depth}(\text{Root}) = 1, \quad \text{Depth}(u) = \text{Depth}(\text{parent}(u)) + 1$$
2. **Height of a Node $u$ (Bottom-Up):**
   The number of nodes along the **longest downward path from $u$ to a leaf**.
   $$\text{Height}(u) = \begin{cases} 0, & \text{if } u = \text{null} \\ 1 + \max(\text{Height}(u.\text{left}), \text{Height}(u.\text{right})), & \text{otherwise} \end{cases}$$
3. **Height of the Tree:**
   The height of the Root node, which equals the **Maximum Depth** of any leaf in the tree.

---

### 1.2 The AVL Balance Factor Invariant

In self-balancing binary search trees (such as AVL trees and Red-Black trees), balanced height guarantees $O(\log N)$ search, insertion, and deletion times.

> [!IMPORTANT]
> ### 💡 The Balanced Binary Tree Invariant
> A binary tree is **height-balanced** if and only if for **EVERY** node $u$ in the tree:
> $$|\text{BalanceFactor}(u)| = |\text{Height}(u.\text{left}) - \text{Height}(u.\text{right})| \le 1$$
> And both the left subtree and right subtree are themselves height-balanced.

```
       Balanced (|BF| <= 1):                      Unbalanced (|BF| = 2):
              [ 1 ]  (BF = 0)                             [ 1 ]  (BF = 2! UNBALANCED!)
             /     \                                     /
        [ 2 ]       [ 3 ]  (BF = 0)                 [ 2 ]  (BF = 1)
        /   \       /                               /
      [ 4 ] [ 5 ] [ 6 ]                           [ 3 ]  (Leaf)
```

---

### 1.3 The Top-Down Trap ($O(N^2)$) vs. Bottom-Up Short-Circuiting ($\Theta(N)$)

#### The Naive Top-Down Antipattern:
```csharp
// ❌ CATASTROPHIC: Re-calculates height from scratch at every single node!
public bool IsBalancedTopDown(TreeNode root) {
    if (root == null) return true;
    int leftH = Height(root.left);
    int rightH = Height(root.right);
    return Math.Abs(leftH - rightH) <= 1 && IsBalancedTopDown(root.left) && IsBalancedTopDown(root.right);
}
```
**Why does this degrade to $O(N^2)$?**
On a degenerate skewed tree (like a linked list $1 \to 2 \to 3 \dots \to N$):
- Node 1 computes height of $N-1$ nodes ($O(N)$ work).
- Node 2 computes height of $N-2$ nodes ($O(N-1)$ work).
- Total work:
  $$\sum_{i=1}^{N} i = \frac{N(N + 1)}{2} = \mathbf{O(N^2)}$$
For $N = 10^5$, $10^{10}$ operations result in an immediate **Time Limit Exceeded (TLE)**.

#### The Optimal Bottom-Up Short-Circuiting Pattern ($\Theta(N)$):
Instead of computing height separately from balance, **combine them into a single postorder DFS**:
- Return the actual height (an integer $\ge 0$) if the subtree is balanced.
- Return **sentinel `-1`** immediately if the subtree is unbalanced!
- If a child returns `-1`, the parent **short-circuits** and returns `-1` immediately without inspecting its other subtree!

---

### 1.4 The Minimum Depth Trap: The Single-Child Fallacy

What is the definition of **Minimum Depth**?
$$\text{The number of nodes along the shortest path from the root down to the nearest LEAF node.}$$
A **leaf** is strictly defined as a node with **NO children** (`left == null && right == null`).

> [!CAUTION]
> ### ⚠️ The Fatal Single-Child Bug
> Consider a skewed tree with two nodes:
> ```
>        [ 1 ]
>         \
>         [ 2 ]  (Leaf)
> ```
> If you write:
> ```csharp
> return 1 + Math.Min(MinDepth(root.left), MinDepth(root.right));
> ```
> `MinDepth(root.left)` evaluates to `0` because `root.left == null`.
> The formula returns: $1 + \min(0, 1) = \mathbf{1}$!
> **This is completely WRONG!** Node 1 is NOT a leaf (it has a right child). The nearest leaf is node 2, which has a path length of **2**!

#### The Rule for Minimum Depth:
- If a node has **only one child**, you **MUST** follow that child's path!
- You can only take $\min(\text{left}, \text{right})$ if **both children exist**!

---

## 2. 💻 DEMONSTRATE: Canonical Invariant Visualization & Algorithmic Mechanics

### 2.1 Bottom-Up Short-Circuiting Trace (LeetCode 110)

Consider the unbalanced tree:
```
           [ 1 ]
          /     \
       [ 2 ]    [ 3 ]
       /
     [ 4 ]
     /
   [ 5 ]
```

```
Postorder DFS with Sentinel -1:

1. At Leaf 5: left = 0, right = 0. Balanced. Return height = 1 + max(0, 0) = 1.
2. At Node 4: left = 1 (from node 5), right = 0. |1 - 0| <= 1. Return height = 1 + 1 = 2.
3. At Node 2: left = 2 (from node 4), right = 0.
   |left - right| = |2 - 0| = 2 > 1  ===> UNBALANCED!
   Return SENTINEL -1!

4. At Root 1:
   left = -1!
   ===> SHORT-CIRCUIT TRIGGERED!
   Root does not even compute height of right subtree (Node 3)!
   Return -1 immediately!

Final Check: result != -1 ===> false (Unbalanced in O(N) time!).
```

---

### 2.2 BFS Early-Exit Wavefront for Minimum Depth (LeetCode 111)

Because BFS explores nodes in non-decreasing order of depth, **the very first leaf node dequeued from the queue is guaranteed to have the minimum depth**:

```
           [ 1 ]              Layer 1
          /     \
       [ 2 ]    [ 3 ]         Layer 2
       /
     [ 4 ]                    Layer 3

Queue Trace:
  Push(1). depth = 1.
  Layer 1 (size = 1):
    Pop 1. Children exist (2, 3). Enqueue 2, 3. depth becomes 2.
  Layer 2 (size = 2):
    Pop 2. Has left child 4. Enqueue 4.
    Pop 3. Both children are null! (LEAF DISCOVERED!).
    ===> EARLY EXIT! Return depth = 2 immediately!
    (Node 4 is never even dequeued!).
```

---

## 3. 🔬 COMPLEXITY & MATHEMATICAL INVARIANTS

### 3.1 Theorem: Optimality of Bottom-Up Balance Check

> [!TIP]
> ### 🧮 Proof of Strict $\Theta(N)$ Bound
>
> In the bottom-up postorder function `CheckHeight(node)`:
> 1. Each node in the tree is visited at most once.
> 2. At each node $u$, the operations performed are:
>    - Checking nullity: $O(1)$
>    - Checking if either child returned `-1`: $O(1)$
>    - Computing $|H_{\text{left}} - H_{\text{right}}|$: $O(1)$
>    - Computing $1 + \max(H_{\text{left}}, H_{\text{right}})$: $O(1)$
> 3. Total operations across the entire tree:
>    $$T(N) \le c \cdot N = \mathbf{\Theta(N)}$$
>
> Since any algorithm must inspect every node in the worst case to verify balance (a single leaf at depth $N$ can break balance), $\Omega(N)$ is a trivial lower bound. Therefore, the bottom-up approach is **asymptotically optimal**. $\blacksquare$

---

## 4. 🛠️ PRACTICE: Canonical Big Tech Problem Walkthroughs

---

### 4.1 Problem 1: [LeetCode 104] Maximum Depth of Binary Tree (Easy)

> **Problem Description:**
> Given the `root` of a binary tree, return *its maximum depth*.
> A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[0, 10^4]$.
> - $-100 \le \text{Node.val} \le 100$

#### Production C# Implementation (Postorder DFS)

```csharp
using System;

public class Solution
{
    public int MaxDepth(TreeNode? root)
    {
        // Base case: empty subtree has depth 0
        if (root == null) return 0;

        // Postorder invariant: compute children depths first
        int leftDepth = MaxDepth(root.left);
        int rightDepth = MaxDepth(root.right);

        // Root adds 1 to the maximum child depth
        return 1 + Math.Max(leftDepth, rightDepth);
    }
}
```

#### Complexity
- **Time Complexity:** $O(N)$ — Visits every node once.
- **Space Complexity:** $O(H)$ — Bounded by tree height ($O(\log N)$ balanced, $O(N)$ skewed).

---

### 4.2 Problem 2: [LeetCode 111] Minimum Depth of Binary Tree (Easy)

> **Problem Description:**
> Given a binary tree, find its minimum depth.
> The minimum depth is the number of nodes along the shortest path from the root node down to the nearest leaf node.
> *Note: A leaf is a node with no children.*
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[0, 10^5]$.
> - $-1000 \le \text{Node.val} \le 1000$

#### Solution A: High-Performance BFS Early-Exit ($O(\text{MinDepth})$ Space/Time)

```csharp
using System.Collections.Generic;

public class Solution
{
    public int MinDepth(TreeNode? root)
    {
        if (root == null) return 0;

        var queue = new Queue<TreeNode>();
        queue.Enqueue(root);
        int depth = 1;

        while (queue.Count > 0)
        {
            int levelSize = queue.Count;

            for (int i = 0; i < levelSize; i++)
            {
                TreeNode node = queue.Dequeue();

                // Leaf check: first leaf discovered in BFS has the absolute minimum depth!
                if (node.left == null && node.right == null)
                {
                    return depth;
                }

                if (node.left != null) queue.Enqueue(node.left);
                if (node.right != null) queue.Enqueue(node.right);
            }

            depth++;
        }

        return depth;
    }
}
```

#### Solution B: Defensive DFS (Resolving the Single-Child Trap)

```csharp
using System;

public class SolutionDfs
{
    public int MinDepth(TreeNode? root)
    {
        if (root == null) return 0;

        // If left child is null, we MUST take the right child path
        if (root.left == null) return 1 + MinDepth(root.right);

        // If right child is null, we MUST take the left child path
        if (root.right == null) return 1 + MinDepth(root.left);

        // Both children exist: safe to take the minimum
        return 1 + Math.Min(MinDepth(root.left), MinDepth(root.right));
    }
}
```

---

### 4.3 Problem 3: [LeetCode 110] Balanced Binary Tree (Easy)

> **Problem Description:**
> Given a binary tree, determine if it is **height-balanced**.
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[0, 5000]$.
> - $-10^4 \le \text{Node.val} \le 10^4$

#### Production C# Implementation (Bottom-Up Sentinel Short-Circuiting)

```csharp
using System;

public class Solution
{
    public bool IsBalanced(TreeNode? root)
    {
        // -1 indicates an unbalanced subtree was detected
        return CheckHeight(root) != -1;
    }

    private static int CheckHeight(TreeNode? node)
    {
        if (node == null) return 0;

        // 1. Recurse left
        int leftH = CheckHeight(node.left);
        if (leftH == -1) return -1; // Short-circuit early!

        // 2. Recurse right
        int rightH = CheckHeight(node.right);
        if (rightH == -1) return -1; // Short-circuit early!

        // 3. Evaluate AVL balance factor invariant
        if (Math.Abs(leftH - rightH) > 1)
        {
            return -1; // Unbalanced subtree detected
        }

        // 4. Return valid height
        return 1 + Math.Max(leftH, rightH);
    }
}
```

#### Complexity
- **Time Complexity:** Strict $\Theta(N)$ in the worst case, $O(K)$ where $K \le N$ with early short-circuiting.
- **Space Complexity:** $O(H)$ call stack space.

---

## 5. ⚡ HARDWARE & SYSTEMS CONNECTIONS

### 5.1 Branch Predictors & Short-Circuit Optimization

In modern processors (e.g. Intel Alder Lake, AMD Zen 4):
- The condition `if (leftH == -1) return -1;` allows the CPU branch predictor to bypass execution of the right branch entirely upon an imbalance.
- In automated test harnesses and database page tree verifications, returning a primitive integer sentinel `-1` avoids the memory overhead of heap-allocating `Tuple<bool, int>` or throwing custom exceptions.

### 5.2 Storage Engine B-Tree Height Invariants
- In database storage engines (InnoDB, RocksDB, SQLite), page balance is rigorously maintained to guarantee that every disk read path has bounded depth ($H \le 4$ for petabyte datasets).
- If balance degrades, disk arm movement (seek latency) balloons, degrading queries from microseconds to milliseconds.

---

## 6. ⚠️ DAILY ERROR LOG & COMMON TRAPS

### Trap 1: The Minimum Depth Single-Child Trap
- **The Mistake:** Writing `return 1 + Math.Min(MinDepth(root.left), MinDepth(root.right));` indiscriminately.
- **The Consequence:** Fails whenever a node has exactly one child (e.g., `[1, 2]` returns 1 instead of 2).
- **The Fix:** Explicitly branch if one child is null: `if (root.left == null) return 1 + MinDepth(root.right);`.

### Trap 2: Top-Down $O(N^2)$ Re-computation
- **The Mistake:** Calling `Height()` inside `IsBalanced()` recursively.
- **The Consequence:** Generates an $O(N^2)$ call tree that times out on large inputs.
- **The Fix:** Compute height and check balance **simultaneously from the bottom up**, using sentinel `-1`.

### Trap 3: Defining Leaf Incorrectly
- **The Mistake:** Assuming `root == null` is a leaf.
- **The Consequence:** A leaf is a **non-null node** whose left and right pointers are both null (`node.left == null && node.right == null`).
- **The Fix:** Always test child nullity on the active node.

---

## 7. 🎯 DAILY CHECKPOINT & SELF-ASSESSMENT

### 1. Conceptual Verification
1. In [LeetCode 111] (Minimum Depth), why is `Math.Min(minDepth(left), minDepth(right)) + 1` WRONG when a node has only one child?
2. In [LeetCode 110], why does returning `-1` from `CheckHeight` eliminate the $O(N^2)$ bottleneck of the naive top-down solution?
3. Why is Breadth-First Search asymptotically faster than Depth-First Search for finding the minimum depth in a tree where a shallow leaf exists at depth 2, but the tree extends to depth 1,000 elsewhere?

### 2. Implementation Audit
- Review your `IsBalanced` implementation. Trace what happens when given a complete binary tree of 7 nodes. Does every node return a non-negative height?

---
*Next Module: **Week 10 — Day 70: Week 10 Timed Synthesis & Traversal Architecture Drill (LeetCode 199, 662)***
