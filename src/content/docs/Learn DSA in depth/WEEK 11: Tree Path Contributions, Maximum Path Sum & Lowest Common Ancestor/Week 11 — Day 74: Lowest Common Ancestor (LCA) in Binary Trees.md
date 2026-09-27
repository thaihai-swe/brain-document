---
title: "Week 11 — Day 74: Lowest Common Ancestor (LCA) in Binary Trees"
---

# Week 11 — Day 74: Lowest Common Ancestor (LCA) in Binary Trees

Welcome to **Day 74 of your DSA Mastery Journey**!

Yesterday in [Day 73](./Week%2011%20%E2%80%94%20Day%2073:%20Path%20Sum%20Variations%20(Root-to-Leaf,%20All%20Paths,%20Prefix%20Sums%20on%20Tree%20Paths).md), we mastered the tripartite taxonomy of path sum variations and unlocked the prefix sum map on tree paths.

Today, we dive into one of the most foundational, frequently tested tree paradigms in Big Tech interviews: **The Lowest Common Ancestor (LCA)**:
1. **The Formal Topological Definition:** Defining ancestry, descendants, and the Knuth inclusion convention.
2. **The 4 Fundamental Structural Cases:** Breaking down the divide-and-conquer postorder search into mutually exclusive structural topologies.
3. **The Short-Circuit Optimization:** Why returning immediately upon encountering $p$ or $q$ is correct when both nodes are guaranteed to exist ([LeetCode 236]).
4. **Defensive Existence Verification:** How and why the short-circuit optimization breaks down when nodes may be absent from the tree ([LeetCode 1644]).
5. **The Parent-Pointer Reduction:** Mapping tree LCA to the two-pointer **Intersection of Two Linked Lists** in strictly $O(1)$ auxiliary space ([LeetCode 1650]).
6. **Real-World Systems Architecture:** Git merge-base DAG resolution, Linux VFS namespace convergence, and compiler AST type coercion.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 74 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: TOPOLOGICAL LCA     │                                     │    PART II: ADVANCED VARIANTS   │
│  Divide-and-Conquer Postorder   │                                     │ Parent Pointers & Verification  │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Knuth Self-Descendant Rule    │                                     │ • LC 1650: Parent Pointers      │
│ • Case 1: Disjoint Split Subtree│                                     │ • 2-Pointer List Reduction: O(1)│
│ • Case 2/3: Unilateral Ancestry │                                     │ • LC 1644: Defensive Node Count │
│ • Case 4: Node u is Target      │                                     │ • Full Tree Traversal Invariant │
│ • Reference Equality (== vs val)│                                     │ • Git Merge-Base Commit Finding │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* The **Lowest Common Ancestor (LCA)** of two nodes $p$ and $q$ in a rooted tree $T$ is the deepest node $u$ that has both $p$ and $q$ as descendants (where Donald Knuth's formal convention allows a node to be a descendant of itself).
  - *Core Invariants:*
    1. **Deepest Ancestor Invariant:** If $u = \text{LCA}(p, q)$, then no proper descendant of $u$ contains both $p$ and $q$ in its subtree.
    2. **Disjoint Subtree Invariant:** If $p$ resides in the left subtree of $u$ and $q$ resides in the right subtree of $u$ (or vice versa), $u$ is the unique, definitive LCA.
    3. **Ancestor-Descendant Invariant:** If $p$ is an ancestor of $q$, then $\text{LCA}(p, q) = p$.
  - *Misconception Check:* In standard LCA ([LeetCode 236]), where $p$ and $q$ are guaranteed to exist, returning $p$ immediately upon encountering it without searching its subtree is an optimal $O(1)$ pruning step. However, if node existence is **not guaranteed** ([LeetCode 1644]), this optimization is a critical bug: if $q$ does not exist in the tree at all, returning $p$ produces a false positive!
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the need to construct, store, and compare two full root-to-node path lists (which consumes $O(H)$ extra memory and requires multiple passes).
  - *Complexity Advantage:* Solves LCA in a single pass of post-order DFS in $\Theta(N)$ time and $O(H)$ stack space with zero heap allocation. With parent pointers, reduces time to $\Theta(H)$ and auxiliary space to strictly $O(1)$.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose / Signal Words:* "Lowest Common Ancestor", "deepest shared ancestor", "distance between two nodes in tree" ($\text{Dist}(p, q) = \text{Depth}(p) + \text{Depth}(q) - 2 \cdot \text{Depth}(\text{LCA})$).
  - *When to Avoid / Failure Modes:* If the tree is a **Binary Search Tree (BST)**, do NOT use general binary tree LCA! Exploit BST key ordering ($p.val < root.val < q.val$) for non-branching $O(H)$ descent ([LeetCode 235]).
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Call stack activation frames unwind during post-order traversal; node matching must rely on **reference equality** (`node == p` or `object.ReferenceEquals`) rather than integer value equality (`node.val == p.val`), because trees may contain duplicate values.
  - *Production Systems:* Git merge-base commit resolution on DAGs, Linux Virtual File System (VFS) namespace dentry convergence, Roslyn compiler AST common ancestor type coercion (`cond ? exprA : exprB`).
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "The Lowest Common Ancestor is the deepest node having both $p$ and $q$ as descendants. In a binary tree, I use postorder divide-and-conquer: if the current node is null, $p$, or $q$, I immediately return it. If both left and right subtrees return non-null, the current node is their convergence point and therefore the LCA. Otherwise, I propagate whichever non-null child reference bubbled up. This runs in $O(N)$ time and $O(H)$ space."
  - *Interviewer Evaluation Lens:* Evaluates candidate's clarity on the 4 structural cases, understanding of reference equality vs. value equality, awareness of the node-existence prerequisite (LC 236 vs. LC 1644), and mastery of the two-pointer linked-list reduction when parent pointers exist (LC 1650).
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:* Time: $\Theta(N)$ worst-case; Space: $O(H)$ recursion stack ($H = \log N$ balanced, $O(N)$ skewed). Parent pointer approach: $\Theta(H)$ time, $O(1)$ space.
  - *State Transition Trace (LC 236):* `Dfs(u): if (u == null || u == p || u == q) return u; left = Dfs(u.left); right = Dfs(u.right); if (left != null && right != null) return u; return left ?? right;`.

---

### 1.1 The Mathematical & Topological Definition of LCA

Formally, let $T = (V, E)$ be a rooted tree with root $R$.
For any node $u \in V$, the set of ancestors $\text{Anc}(u)$ is defined as all nodes on the unique simple path from $R$ to $u$, inclusive:
$$\text{Anc}(u) = \{ v \in V \mid v \text{ is on the simple path from } R \text{ to } u \}$$

The common ancestors of two nodes $p, q \in V$ is the intersection:
$$\text{CommonAnc}(p, q) = \text{Anc}(p) \cap \text{Anc}(q)$$

Since $R \in \text{Anc}(p)$ and $R \in \text{Anc}(q)$, the set $\text{CommonAnc}(p, q)$ is guaranteed to be non-empty.
Because $T$ is a tree, the nodes in $\text{CommonAnc}(p, q)$ form a simple path starting at $R$ and ending at some node $u^*$.

The **Lowest Common Ancestor** is defined as:
$$\text{LCA}(p, q) = \arg\max_{v \in \text{CommonAnc}(p, q)} \text{Depth}(v)$$

```
                     [ Root: 3 ] ◄── Common Ancestor (Depth 0)
                     /         \
                 [ 5 ] ◄───────┼── LOWEST Common Ancestor (Depth 1)
                /     \        │   (Deepest node containing both 6 and 4)
             [ 6 ]   [ 2 ]     │
             (p)     /   \     │
                   [ 7 ] [ 4 ] ◄── (q)
```

#### The Tree Distance Identity
A canonical interview identity relates LCA to the shortest path distance between any two nodes:
$$\text{Dist}(p, q) = \text{Depth}(p) + \text{Depth}(q) - 2 \cdot \text{Depth}(\text{LCA}(p, q))$$
This formula is ubiquitous in graph theory, network routing, and tree query optimization.

---

### 1.2 The 4 Fundamental Structural Cases

When performing a post-order traversal at any node $u$, we evaluate its left and right subtrees. Exactly 4 mutually exclusive topological configurations exist:

```
Case 1: Disjoint Subtrees (Bifurcation Apex)
        [ u ] ◄── u is LCA!
       /     \
    ...       ...
    [ p ]     [ q ]
Left returns p, Right returns q -> Both non-null => return u.

Case 2: Left Subtree Dominance
        [ u ]
       /     \
    ...       null / no targets
    [ LCA ]
    /     \
  [ p ]   [ q ]
Left returns LCA, Right returns null => return Left.

Case 3: Right Subtree Dominance
        [ u ]
       /     \
   null      ...
             [ LCA ]
             /     \
           [ p ]   [ q ]
Left returns null, Right returns LCA => return Right.

Case 4: Node u is Itself Target (Knuth Self-Descendant)
        [ u ] (p) ◄── p is LCA!
       /     \
    ...       ...
   [ q ]
Left returns q, but u == p. By Knuth's definition, u is LCA!
```

---

### 1.3 The Pruning Invariant: Why LC 236 Can Short-Circuit

In [LeetCode 236], the problem specification guarantees:
> *"All `Node.val` are unique. $p$ and $q$ will exist in the tree."*

Because both $p$ and $q$ **are guaranteed to exist**, consider what happens when our traversal reaches node $p$:
- **Subcase A ($q$ is inside the subtree of $p$):** If $q$ lies below $p$, then by definition $p$ is an ancestor of $q$. Thus, $p$ is the LCA! We do not need to search inside $p$'s subtree to find $q$; returning $p$ immediately is guaranteed to be correct.
- **Subcase B ($q$ is NOT in the subtree of $p$):** $q$ must reside in some other branch of the tree. Node $p$ will bubble up as a non-null reference until it reaches the true LCA, where $q$ will bubble up from the other side.

Therefore, the base case:
```csharp
if (root == null || root == p || root == q) return root;
```
is both **provably correct** and **optimally pruned**. It saves thousands of unnecessary recursive visits in large trees.

---

## 2. 🔬 ANALYZE: Mathematical Correctness Proof & Complexity

### 2.1 Inductive Correctness Proof

**Theorem:** The function `LowestCommonAncestor(root, p, q)` returns:
1. `null` if neither $p$ nor $q$ exists in the subtree rooted at `root`.
2. $p$ if only $p$ exists in the subtree.
3. $q$ if only $q$ exists in the subtree.
4. $u = \text{LCA}(p, q)$ if both $p$ and $q$ exist in the subtree.

**Base Cases:**
- If `root == null`: The subtree is empty. Neither $p$ nor $q$ exists. Returns `null`. Correct.
- If `root == p`: $p$ exists at the root. If $q$ is also in this subtree, $p$ is the LCA; if not, $p$ is the only target found so far. Returning $p$ satisfies the contract. Correct.
- If `root == q`: Symmetric to `root == p`. Returns $q$. Correct.

**Inductive Step:**
Assume by induction that `left = Dfs(root.left)` and `right = Dfs(root.right)` correctly satisfy the theorem for the left and right subtrees.
- **If `left != null && right != null`:**
  By induction hypothesis, one subtree contains $p$ and the other contains $q$.
  Since $p$ and $q$ reside in disjoint subtrees of `root`, `root` is the lowest node where their paths to the root intersect.
  Therefore, `root` is the Lowest Common Ancestor. Returning `root` is correct.
- **If `left != null && right == null`:**
  No targets exist in the right subtree. The left subtree either contains only one target, or contains both targets (in which case `left` is already their resolved LCA). Propagating `left` upward is correct.
- **If `left == null && right != null`:**
  Symmetric to the above. Propagating `right` upward is correct.
- **If `left == null && right == null`:**
  Neither target exists in either subtree. Returning `null` is correct. $\blacksquare$

---

### 2.2 Systems Trade-Off & Complexity Matrix

| Approach | Canonical LeetCode | Time Complexity | Auxiliary Space | Key Requirement / Trade-off |
| :--- | :--- | :--- | :--- | :--- |
| **Path Array Intersect** | LC 236 (Naive) | $\Theta(N)$ | $\Theta(H)$ heap memory | Finds paths `root->p` and `root->q`, then compares prefixes. Wastes heap allocations. |
| **Divide & Conquer DFS** | [LeetCode 236] | $\mathbf{\Theta(N)}$ | $\mathbf{O(H)}$ stack space | Optimal single-pass postorder DFS. Zero heap allocation. Requires targets to exist. |
| **Defensive DFS Count** | [LeetCode 1644] | $\Theta(N)$ full pass | $O(H)$ stack space | Must visit entire tree without early pruning to verify both $p$ and $q$ exist. |
| **Parent Pointer 2-Ptr** | [LeetCode 1650] | $\mathbf{\Theta(H)}$ | $\mathbf{O(1)}$ auxiliary space | Maps LCA to Linked List Intersection. $O(H)$ time where $H \ll N$. Zero memory overhead. |
| **Binary Lifting (RMQ)** | Advanced / OLAP | $O(N \log N)$ build | $O(N \log N)$ table | $O(\log N)$ or $O(1)$ per query for static trees with millions of LCA queries. |

---

## 3. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

---

### 3.1 Problem 1: [LeetCode 236] Lowest Common Ancestor of a Binary Tree (Medium)

> **Problem Description:**
> Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.
> According to the definition of LCA on Wikipedia: "The lowest common ancestor is defined between two nodes $p$ and $q$ as the lowest node in $T$ that has both $p$ and $q$ as descendants (where we allow **a node to be a descendant of itself**)."
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[2, 10^5]$.
> - $-10^9 \le \text{Node.val} \le 10^9$
> - All `Node.val` are **unique**.
> - $p \ne q$
> - $p$ and $q$ **will exist in the tree**.

#### Production C# Implementation

```csharp
using System;

public class Solution
{
    /// <summary>
    /// Finds the Lowest Common Ancestor of two nodes guaranteed to exist in the binary tree.
    /// Runs in O(N) time and O(H) call stack space with zero heap allocation.
    /// </summary>
    public TreeNode? LowestCommonAncestor(TreeNode? root, TreeNode? p, TreeNode? q)
    {
        // Base Case 1: Empty subtree returns null
        // Base Case 2 & 3: If root matches p or q, bubble it up immediately
        if (root == null || root == p || root == q)
        {
            return root;
        }

        // Post-Order Divide: Recurse into left and right subtrees
        TreeNode? left = LowestCommonAncestor(root.left, p, q);
        TreeNode? right = LowestCommonAncestor(root.right, p, q);

        // Conquer Case 1: Bifurcation Apex
        // p was found in one subtree, q in the other -> root is the LCA!
        if (left != null && right != null)
        {
            return root;
        }

        // Conquer Case 2 & 3: Unilateral Ancestry
        // Either one subtree contains the LCA / target, or both are null
        return left ?? right;
    }
}
```

#### Step-by-Step Execution Trace

Given tree: `root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]`, `p = 5`, `q = 1`:

```
                 [ 3 ]
                /     \
             [ 5 ]   [ 1 ]
             /   \   /   \
            6     2 0     8
                 / \
                7   4
```

1. `Dfs(3)` calls `Dfs(3.left = 5)`.
2. At node `5`: `root == p` is `true`.
   - Node `5` immediately returns `5` without exploring `6` or `2`!
3. `Dfs(3)` calls `Dfs(3.right = 1)`.
4. At node `1`: `root == q` is `true`.
   - Node `1` immediately returns `1` without exploring `0` or `8`!
5. In `Dfs(3)`:
   - `left = 5` (non-null)
   - `right = 1` (non-null)
   - Both are non-null $\implies$ `return root` (node `3`).
6. **Result:** Node `3` is correctly returned as the LCA in just 3 function calls!

---

### 3.2 Problem 2: [LeetCode 1650] Lowest Common Ancestor of a Binary Tree III (Medium)

> **Problem Description:**
> Given two nodes of a binary tree `p` and `q`, return their lowest common ancestor (LCA).
> Each node will have a reference to its **parent node**. The tree for this problem is defined as:
> ```csharp
> public class Node {
>     public int val;
>     public Node left;
>     public Node right;
>     public Node parent;
> }
> ```
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[2, 10^5]$.
> - $-10^9 \le \text{Node.val} \le 10^9$
> - All `Node.val` are **unique**.
> - $p \ne q$
> - $p$ and $q$ exist in the tree.

#### The Mathematical Reduction to Linked List Intersection
When nodes have parent pointers, following the `parent` reference from any node forms a **singly linked list** terminating at `root.parent == null`.
Finding the LCA of $p$ and $q$ is **100% mathematically isomorphic** to finding the intersection node of two singly linked lists ([LeetCode 160])!

```
p Path:   p ──> ... ──> LCA ──> ... ──> Root ──> null  (Length = a + c)
q Path:   q ──> ... ──> LCA ──> ... ──> Root ──> null  (Length = b + c)
```

By initializing pointer $A$ at $p$ and pointer $B$ at $q$:
- When pointer $A$ reaches `null`, redirect it to $q$.
- When pointer $B$ reaches `null`, redirect it to $p$.
- Both pointers travel exactly $(a + c + b) = (b + c + a)$ steps!
- They converge directly at the **LCA** in strictly $\Theta(H)$ time and **$O(1)$ auxiliary space**!

#### Production C# Implementation (Strict $O(1)$ Auxiliary Space)

```csharp
public class Solution1650
{
    /// <summary>
    /// Finds the LCA using parent pointers in O(H) time and O(1) auxiliary space.
    /// Eliminates hash set overhead by reducing to two-pointer linked list intersection.
    /// </summary>
    public Node LowestCommonAncestor(Node p, Node q)
    {
        Node? ptrA = p;
        Node? ptrB = q;

        // Both pointers traverse (depth(p) + depth(q) - depth(LCA)) steps
        // They are guaranteed to meet at the LCA node
        while (ptrA != ptrB)
        {
            ptrA = (ptrA == null) ? q : ptrA.parent;
            ptrB = (ptrB == null) ? p : ptrB.parent;
        }

        return ptrA!;
    }
}
```

---

### 3.3 Problem 3: [LeetCode 1644] Lowest Common Ancestor of a Binary Tree II (Medium)

> **Problem Description:**
> Given the `root` of a binary tree, return the lowest common ancestor (LCA) of two given nodes, `p` and `q`.
> If either `p` or `q` **does not exist in the tree, return `null`**.
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[1, 10^4]$.
> - $-10^9 \le \text{Node.val} \le 10^9$
> - All `Node.val` are unique.
> - $p$ and $q$ might not exist in the tree!

#### Why the LC 236 Solution Fails Here
Suppose $p$ is at the root and $q$ does not exist in the tree at all.
In LC 236:
```csharp
if (root == p) return root; // Returns p immediately!
```
The algorithm returns $p$ without ever verifying whether $q$ exists! But because $q$ is absent, the correct answer is `null`.

#### The Defensive Invariant: Full Tree Postorder Traversal
To solve LC 1644, we must:
1. **Never short-circuit** before checking both children, OR
2. Track boolean flags `pFound` and `qFound` during traversal.
3. Return the LCA candidate only if **both** `pFound == true` and `qFound == true`.

#### Production C# Implementation

```csharp
public class Solution1644
{
    private bool _pFound;
    private bool _qFound;

    public TreeNode? LowestCommonAncestor(TreeNode? root, TreeNode? p, TreeNode? q)
    {
        _pFound = false;
        _qFound = false;

        TreeNode? lcaCandidate = Dfs(root, p, q);

        // Both targets MUST exist in the tree; otherwise LCA is invalid
        return (_pFound && _qFound) ? lcaCandidate : null;
    }

    private TreeNode? Dfs(TreeNode? node, TreeNode? p, TreeNode? q)
    {
        if (node == null) return null;

        // CRITICAL: We MUST perform post-order traversal on BOTH children first!
        // We cannot return early, because we need to explore subtrees to update _pFound and _qFound
        TreeNode? left = Dfs(node.left, p, q);
        TreeNode? right = Dfs(node.right, p, q);

        // Check if the current node is p or q
        bool isCurrentTarget = false;
        if (node == p)
        {
            _pFound = true;
            isCurrentTarget = true;
        }
        if (node == q)
        {
            _qFound = true;
            isCurrentTarget = true;
        }

        // Case 1: Node is itself one of the targets
        if (isCurrentTarget)
        {
            return node;
        }

        // Case 2: Targets found in left and right subtrees
        if (left != null && right != null)
        {
            return node;
        }

        // Case 3: Propagate non-null result from child
        return left ?? right;
    }
}
```

---

## 4. 🏋️ PRACTICE: Guided Exercises & Problem Set

### 4.1 Guided Exercises

#### Exercise 1: [LeetCode 235] Lowest Common Ancestor of a Binary Search Tree (Easy/Medium)
- **Problem Statement:** Exploit the Binary Search Tree invariant to find the LCA of $p$ and $q$ without branching into both subtrees.
- **Trigger Clue:** "Binary Search Tree" $\implies$ Left subtree $< \text{root.val} <$ Right subtree.
- **Template Hint:** If both $p.val < root.val$ and $q.val < root.val$, the LCA must be in `root.left`. If both $p.val > root.val$ and $q.val > root.val$, the LCA must be in `root.right`. The first node where $p$ and $q$ **split** (or where `root.val == p.val || root.val == q.val`) is the LCA!
- **Target Complexity:** $\Theta(H)$ time, strictly $O(1)$ space using an iterative `while` loop!

#### Exercise 2: [LeetCode 1123] Lowest Common Ancestor of Deepest Leaves (Medium)
- **Problem Statement:** Given the `root` of a binary tree, return the lowest common ancestor of its deepest leaves.
- **Trigger Clue:** "Deepest leaves" $\implies$ requires height calculation alongside LCA resolution.
- **Template Hint:** In postorder DFS, return a tuple `(int MaxDepth, TreeNode? Lca)`. If `left.MaxDepth == right.MaxDepth`, the current node is the LCA of all deepest leaves seen so far! If `left.MaxDepth > right.MaxDepth`, bubble `(left.MaxDepth + 1, left.Lca)`.
- **Target Complexity:** $\Theta(N)$ time, $O(H)$ stack space.

#### Exercise 3: [LeetCode 1740] Find Distance in a Binary Tree (Medium)
- **Problem Statement:** Given the values of two nodes `p` and `q`, return the minimum number of edges needed to travel from `p` to `q`.
- **Trigger Clue:** Distance between two nodes.
- **Template Hint:** Apply the Tree Distance Identity:
  $$\text{Dist}(p, q) = \text{Dist}(R, p) + \text{Dist}(R, q) - 2 \cdot \text{Dist}(R, \text{LCA}(p, q))$$
- **Target Complexity:** $\Theta(N)$ time, $O(H)$ space.

---

## 5. ⚡ HARDWARE & SYSTEMS CONNECTIONS

```
Feature Branch:      [ Commit C1 ] ──> [ Commit C2 ] ──> [ HEAD (p) ]
                                            ▲
                                            │ Common Base Commit: LCA(p, q)
Main Branch:         [ Commit M1 ] ─────────┴──────────> [ HEAD (q) ]
```

### 5.1 Git Merge-Base Algorithm (DAG Commit Ancestry)
When you run `git merge feature-branch` into `main`, Git must execute a **3-way merge**:
1. It inspects commit `HEAD` ($p$) and `feature` ($q$).
2. To determine which lines were modified by each branch without producing false conflict storms, Git must find their **common base commit**.
3. In Git's Directed Acyclic Graph (DAG) of commit SHA hashes, the common base is precisely the **Lowest Common Ancestor** of the two commit pointers!
4. If a repository has multiple merge bases (criss-cross merges), Git creates a virtual merge-base commit by recursively finding the LCA of the merge bases.

### 5.2 Linux Virtual File System (VFS) Dentry Path Resolution
In the Linux kernel VFS, every cached directory and file is represented as a `struct dentry`. Each `dentry` contains a pointer `d_parent` pointing to its enclosing directory.
When resolving relative path navigations or computing the canonical common security namespace root between two file descriptors, the kernel traces `d_parent` pointers upward. This is identical to the $O(1)$ space pointer-swapping algorithm in [LeetCode 1650]!

---

## 6. ⚠️ DAILY ERROR LOG & COMMON TRAPS

### Trap 1: Confusing Reference Equality with Value Equality
- **The Bug:** Writing `if (root.val == p.val || root.val == q.val)` in generic binary trees.
- **The Failure:** If the tree contains duplicate values across different nodes, the algorithm mistakenly identifies an unrelated node as $p$ or $q$, corrupting the LCA result.
- **The Fix:** **Always use reference equality (`root == p || root == q`)** or `object.ReferenceEquals(root, p)`.

### Trap 2: Premature Return in LeetCode 1644
- **The Bug:** Applying the standard LeetCode 236 early return `if (root == p) return root;` when targets are not guaranteed to exist.
- **The Failure:** If $p$ is at the root and $q$ is absent, the code returns $p$ without searching the rest of the tree. The true answer is `null`.
- **The Fix:** Traverse both children in postorder first, update existence flags `_pFound` and `_qFound`, and validate that both are true before returning.

### Trap 3: Memory Bloat via Root-to-Node Path Arrays
- **The Bug:** Generating two `List<TreeNode>` path collections from root to $p$ and root to $q$, then comparing them.
- **The Failure:** Incurs $O(N)$ heap allocations, triggers Gen 0 GC collections, and requires two separate DFS passes plus a linear array search.
- **The Fix:** Use single-pass divide-and-conquer postorder DFS with zero heap memory overhead.

---

## 7. 🎯 DAILY CHECKPOINT & SELF-ASSESSMENT

### 1. Conceptual Verification
1. In [LeetCode 236], if $p$ is an ancestor of $q$, explain why the recursive algorithm returns $p$ without ever visiting the subtree containing $q$. Why does this optimization fail in [LeetCode 1644]?
2. How does the presence of a `parent` pointer in [LeetCode 1650] allow us to reduce the LCA problem to the Intersection of Two Linked Lists? What is the mathematical formula proving pointer convergence?
3. Contrast the time and space complexity of finding LCA in a generic Binary Tree versus a Binary Search Tree (BST). Why does a BST not require postorder child aggregation?

### 2. Implementation Audit
- Trace your `LowestCommonAncestor` implementation on a degenerate skewed tree:
  `1 -> 2 -> 3 -> 4 -> 5` where `p = 4` and `q = 5`.
  What is the maximum call stack depth reached during execution? Does it cause stack overflow if $N = 10^5$?

---
*Next Module: **Week 11 — Day 75: Binary Tree Boundary Traversal & Vertical Order Traversal***
