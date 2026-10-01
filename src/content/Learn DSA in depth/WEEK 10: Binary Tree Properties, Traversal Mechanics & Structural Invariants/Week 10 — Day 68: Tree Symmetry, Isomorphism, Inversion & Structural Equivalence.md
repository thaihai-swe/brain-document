---
title: "Week 10 — Day 68: Tree Symmetry, Isomorphism, Inversion & Structural Equivalence"
---

# Week 10 — Day 68: Tree Symmetry, Isomorphism, Inversion & Structural Equivalence

Welcome to **Day 68 of your DSA Mastery Journey**!

Yesterday in [Day 67](./Week%2010%20%E2%80%94%20Day%2067:%20Level-Order%20Traversals,%20Zigzag%20&%20Multi-Level%20BFS%20Aggregations.md), we analyzed horizontal level-order snapshot mechanics and memory tradeoffs between DFS and BFS.

Today, we delve into **Geometric & Structural Invariants on Trees**:
1. **Tree Isomorphism & Structural Equivalence:** What constitutes true equality between two separate tree topologies?
2. **The Mirror Equivalence Invariant:** The mathematical condition under which a tree reflects across its central vertical axis.
3. **In-Place Tree Inversion:** The mechanics of branch swapping, pointer rewiring, and topological reflection.
4. **Dual-Pointer Lockstep Traversal:** Verifying equivalence concurrently using both recursive divide-and-conquer and iterative parallel queues.
5. **Canonical Problem Walkthroughs:** Production C# implementations for **LeetCode 226**, **LeetCode 100**, and **LeetCode 101**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 68 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: STRUCTURAL LAWS     │                                     │     PART II: DUAL-POINTER BFS   │
│  Isomorphism & Reflection Math  │                                     │    Lockstep Verification        │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Same-Tree Invariant (LC 100)  │                                     │ • Invert Tree (LC 226)          │
│ • Mirror Symmetry Law (LC 101)  │                                     │ • Cross-Subtree Parallel Queue  │
│ • Inductive Equivalence Proof   │                                     │ • In-Place Pointer Rewiring     │
│ • Merkle Tree Systems Link      │                                     │ • Short-Circuiting Null Guards  │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **Tree Symmetry, Isomorphism & Inversion** evaluates and transforms geometric reflectional properties of binary trees.
  - *Core Invariants:* Mirror Equivalence Invariant: Two subtrees $T_1$ and $T_2$ are symmetric $\iff$ $T_1.val == T_2.val$ AND $T_1.left$ is symmetric to $T_2.right$ AND $T_1.right$ is symmetric to $T_2.left$; Inversion Invariant: Swapping `node.left` and `node.right` at every node reflects the tree across its vertical central axis.
  - *Misconception Check:* Two trees having identical inorder traversals does *not* prove they are structurally identical! For example, a left-skewed tree and a right-skewed tree of three nodes can produce identical inorder lists. True structural identity requires both value and pointer topology verification.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the need to serialize trees to strings to test structural equivalence or symmetry.
  - *Complexity Advantage:* Verifies symmetry and inverts trees in optimal $O(N)$ linear time and $O(H)$ space.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Symmetric Tree" (LC 101), "Same Tree" (LC 100), "Invert Binary Tree" (LC 226), "Subtree of Another Tree" (LC 572). Signal words: "symmetric tree", "invert binary tree", "check if trees are identical".
  - *When to Avoid / Failure Modes:* General undirected graphs with cross-edges (requires graph isomorphism algorithms).
- **4. WHERE:**
  - *Physical CLR Memory:* Dual-pointer lockstep recursion frames or dual-queue lockstep BFS; in-place swap of child references.
  - *Production Systems:* UI component visual mirroring for RTL (right-to-left) language localization, 3D computer graphics model reflection matrices.
- **5. WHO:**
  - *Spoken Script:* "To test if a tree is symmetric, I compare two pointers lockstep: root1 and root2 must have equal values, and root1's left must mirror root2's right while root1's right mirrors root2's left. For tree inversion, I recursively swap each node's left and right child pointers in a postorder or preorder traversal in $O(N)$ time."
  - *Interviewer Evaluation Lens:* Evaluates lockstep comparison logic, handling of asymmetric null children, and recursive vs. iterative queue implementations.
- **6. HOW:**
  - *Cost Model:* Time: $O(N)$ linear time; Space: $O(H)$ call stack space.
  - *State Transition Trace (Invert):* `Invert(node): if (null) return; Swap(node.left, node.right); Invert(node.left); Invert(node.right)`.


### 1.1 Physical Mental Model: The Folded Paper Snowflake & Vanity Mirror

Imagine folding a sheet of paper down the center vertical crease (the tree's Root node):
- If the tree is **symmetric**, folding the left half over onto the right half causes every branch and leaf to press perfectly against its counterpart.
- **The Cross-Reflection Rule (Mirror Hands):**
  - When you look into a bathroom mirror and raise your **left hand**, your mirror reflection raises its **right hand**!
  - Therefore, the **outermost left branch** ($T_1.\text{left}$) must match the **outermost right branch** ($T_2.\text{right}$).
  - The **innermost left branch** ($T_1.\text{right}$) must match the **innermost right branch** ($T_2.\text{left}$).
- **The Folded Snowflake Failure Modes:**
  - If a leaf on the left has no paper on the right (null mismatch) $\implies$ Not symmetric!
  - If the shapes match but the numbers don't (value mismatch) $\implies$ Not symmetric!

```
                    THE VANITY MIRROR LOCKSTEP REFLECTION
   
                           Axis of Reflection
                                   │
                                 [ 1 ]
                                /  │  \
                           [ 2 ]   │   [ 2 ]
                          /     \  │  /     \
                       [ 3 ]   [ 4 ] [ 4 ]   [ 3 ]
                         │       │     │       │
      Outermost Left ────┴───────┼─────┼───────┴──── Outermost Right (3 == 3!)
                                 └─────┘
                         Innermost Pair (4 == 4!)
```

---

### 1.2 Step-by-Step State Evolution: Dual-Queue Lockstep BFS

Instead of recursion, we can verify symmetry iteratively using a FIFO Queue comparing nodes in lockstep pairs:

```
Tree:
                 [ 1 ]
                /     \
             [ 2 ]   [ 2 ]
             /   \   /   \
           [ 3 ] [ 4 ][ 4 ][ 3 ]

Initial State: Enqueue root.left (2_L) and root.right (2_R).
Queue: [ (2_L, 2_R) ]

CYCLE 1:
- Dequeue Pair: (2_L, 2_R).
- Values Match? 2 == 2 (YES).
- Enqueue Outer Pair: (2_L.left, 2_R.right) ──► (3_L, 3_R)
- Enqueue Inner Pair: (2_L.right, 2_R.left) ──► (4_L, 4_R)
Queue: [ (3_L, 3_R), (4_L, 4_R) ]

CYCLE 2:
- Dequeue Pair: (3_L, 3_R).
- Values Match? 3 == 3 (YES).
- Children: Both left and right are null for both nodes. Enqueue nothing.
Queue: [ (4_L, 4_R) ]

CYCLE 3:
- Dequeue Pair: (4_L, 4_R).
- Values Match? 4 == 4 (YES).
- Children: Both null. Enqueue nothing.
Queue: [ ]

Queue is Empty ──► Tree is 100% Guaranteed Symmetric!
```

---

### 1.3 Structural Equivalence vs. Value Equivalence (The Same-Tree Invariant)

Two binary trees $P$ and $Q$ are **identical (isomorphic and value-equivalent)** if and only if they satisfy the recursive predicate $\text{IsSame}(P, Q)$:

> [!IMPORTANT]
> ### 💡 The Same-Tree Recursive Invariant
> $$\text{IsSame}(P, Q) \iff \begin{cases}
> \text{true}, & \text{if } P = \text{null} \land Q = \text{null} \\
> \text{false}, & \text{if } (P = \text{null} \land Q \ne \text{null}) \lor (P \ne \text{null} \land Q = \text{null}) \\
> \text{false}, & \text{if } P.\text{val} \ne Q.\text{val} \\
> \text{IsSame}(P.\text{left}, Q.\text{left}) \land \text{IsSame}(P.\text{right}, Q.\text{right}), & \text{otherwise}
> \end{cases}$$

Every node in $P$ must match the corresponding node in $Q$ in **both presence, pointer geometry, and value**.

---

### 1.2 The Mirror Equivalence Invariant (Symmetric Trees)

A single binary tree $T$ is **symmetric (a mirror reflection of itself)** across its central vertical axis if and only if:
$$\text{Root is null} \quad \lor \quad \text{IsMirror}(T.\text{left}, T.\text{right})$$

```
                   Axis of Reflection
                           │
                         [ 1 ]
                        /  │  \
                   [ 2 ]   │   [ 2 ]
                   /   \   │   /   \
                 [ 3 ] [ 4 ] [ 4 ] [ 3 ]
                   ▲       │       ▲
                   └───────┼───────┘
                    Must match values!
```

> [!IMPORTANT]
> ### 💡 The Cross-Subtree Mirror Invariant
> Two subtrees $T_1$ and $T_2$ are mutual mirror reflections if and only if:
> 1. Their root values are equal: $T_1.\text{val} == T_2.\text{val}$.
> 2. The **outer subtrees** mirror each other: $\text{IsMirror}(T_1.\text{left}, T_2.\text{right})$.
> 3. The **inner subtrees** mirror each other: $\text{IsMirror}(T_1.\text{right}, T_2.\text{left})$.

Notice the crucial cross-matching:
$$\mathbf{(T_1.\text{left} \longleftrightarrow T_2.\text{right}) \quad \text{and} \quad (T_1.\text{right} \longleftrightarrow T_2.\text{left})}$$

---

### 1.3 In-Place Tree Inversion: The Topological Reflection

Inverting a binary tree ([LeetCode 226]) means creating its horizontal mirror image.
For every single node $u$ in the tree:
1. Swap its left child pointer with its right child pointer:
   $$\text{swap}(u.\text{left}, u.\text{right})$$
2. Recursively invert the left subtree (which was formerly the right subtree).
3. Recursively invert the right subtree (which was formerly the left subtree).

Whether this swap is executed **preorder** (before recursing) or **postorder** (after recursing) yields the exact same final topology! However, executing the swap in **inorder** is a classic bug (swapping in the middle causes one child to be inverted twice while the other child is never inverted!).

### 1.4 ⚙️ Core Operations Deep-Dive: Dual-Subtree Mirror Locks & In-Place Reflection Invariants

#### Dimension 1: Operation Contract & Big-O Bounds
- **Operation Signatures:**
  1. `bool IsSymmetric(TreeNode root)`
  2. `TreeNode InvertTree(TreeNode root)`
  3. `bool IsSameTree(TreeNode p, TreeNode q)`
- **Preconditions:**
  - `root`, `p`, and `q` reference finite acyclic binary trees.
  - Structural comparison requires reference non-nullity check before value comparison to prevent null dereference faults.
- **Postconditions:**
  - `IsSymmetric` and `IsSameTree` return boolean answers leaving inputs completely unmodified.
  - `InvertTree` modifies input in-place such that every node's left and right subtrees are recursively reflected across the vertical axis.
- **Complexity Bounds:**
  - **Time Complexity:**
    - *Best Case:* $\Omega(1)$ on early value mismatch or asymmetric root child presence.
    - *Worst Case:* $\Theta(N)$ when the tree is fully symmetric or identical; every node is visited.
  - **Auxiliary Space Complexity:**
    - *Balanced Tree:* $O(\log N)$ call frames.
    - *Degenerate Tree:* $O(N)$ call frames. Zero heap allocations.

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree
1. **Dual-Subtree Mirror Locking (`IsMirror(t1, t2)`):**
   - *Check 1 (Both Null Sentinel):* If `t1 == null && t2 == null`, return `true`.
   - *Check 2 (Asymmetry Sentinel):* If `t1 == null || t2 == null`, return `false`.
   - *Check 3 (Value Mismatch):* If `t1.val != t2.val`, return `false`.
   - *Recursive Locking:*
     - Outer Subtree Lock: `bool outer = IsMirror(t1.left, t2.right)`. If `!outer`, return `false` (short-circuit).
     - Inner Subtree Lock: `bool inner = IsMirror(t1.right, t2.left)`.
     - Return `outer && inner`.
2. **In-Place Topological Inversion Flow (`InvertTree(root)`):**
   - If `root == null`, return `null`.
   - Preorder Pointer Swap:
     `var temp = root.left; root.left = root.right; root.right = temp;`
   - Recurse Left: `InvertTree(root.left)`.
   - Recurse Right: `InvertTree(root.right)`.
   - Return `root`.

```
                        [IsMirror(t1, t2)]
                                │
                     t1 == null && t2 == null?
                    /                         \
              (Yes)/                           \(No)
                  ▼                             ▼
             Return true              t1 == null || t2 == null?
                                     /                         \
                               (Yes)/                           \(No)
                                   ▼                             ▼
                              Return false               t1.val != t2.val?
                                                        /                 \
                                                  (Yes)/                   \(No)
                                                      ▼                     ▼
                                                 Return false     Lockstep Recursion:
                                                                  IsMirror(t1.left, t2.right) &&
                                                                  IsMirror(t1.right, t2.left)
```

#### Dimension 3: Visual ASCII State Transitions
```
MIRROR LOCKSTEP COMPARISON:
              [ Root ]
             /        \
          [ t1 ]    [ t2 ]
          /    \    /    \
        [A]    [B] [C]   [D]

Comparison 1 (Outer Lock): t1.left [A] <==== MATCH ====> t2.right [D]
Comparison 2 (Inner Lock): t1.right [B] <==== MATCH ====> t2.left [C]

TOPOLOGICAL INVERSION STATE:
    BEFORE:                      SWAP POINTERS:               RECURSE SUBTREES:
       [ 4 ]                          [ 4 ]                          [ 4 ]
      /     \                        /     \                        /     \
    [ 2 ]   [ 7 ]      ===>        [ 7 ]   [ 2 ]      ===>        [ 7 ]   [ 2 ]
    /   \   /   \                  /   \   /   \                  /   \   /   \
   1     3 6     9                6     9 1     3                9     6 3     1
```

#### Dimension 4: Invariant Preservation Proof
- **Mirror Reflection Isomorphism Invariant:**
  - Let $T_1$ and $T_2$ be two trees with root nodes $r_1$ and $r_2$.
  - By definition of geometric reflection across vertical axis $Y$, $T_1 \cong_{mirror} T_2 \iff$
    1. $r_1.val = r_2.val$,
    2. Left subtree of $T_1$ is mirror image of right subtree of $T_2$: $T_1.left \cong_{mirror} T_2.right$,
    3. Right subtree of $T_1$ is mirror image of left subtree of $T_2$: $T_1.right \cong_{mirror} T_2.left$.
  - The base case $T_1 = \emptyset \land T_2 = \emptyset$ evaluates to `true`.
  - By structural induction, if both outer and inner subtrees satisfy the mirror equivalence, the combined tree rooted at $(r_1, r_2)$ strictly preserves reflective symmetry.
- **Topological Inversion Involutive Property:**
  - Inverting tree $T$ swaps the left and right child pointers of every vertex $u \in V(T)$.
  - Repeating the inversion operation a second time performs a second swap:
    $$\text{Invert}(\text{Invert}(T)) = T$$
  - Since swapping preserves the multiset of vertices and all edge incident relations (with chirality reversed), no vertex is lost or duplicated.

#### Dimension 5: Edge Case Matrix
| Edge Case Scenario | Input State | Algorithmic Behavior | Invariant Preservation |
| :--- | :--- | :--- | :--- |
| **Empty Tree** | `root == null` | Base condition returns `true` (symmetric) or `null` (invert). | Safe empty handling; no crash. |
| **Single Node** | `root.left = null, root.right = null` | Calls `IsMirror(null, null)` -> returns `true`. Swaps nulls. | Trivial symmetry and self-inversion. |
| **Structurally Symmetric, Values Differ** | Topologies match, but values do not | Structure checks pass; `t1.val != t2.val` detects mismatch. | Immediate short-circuit to `false`. |
| **Values Match, Structure Differs** | Identical values, but one has left child, other has neither | `t1 == null || t2 == null` evaluates to `true`. | Immediate short-circuit to `false`. |
| **Purely Left/Right Zigzag** | Asymmetric zig-zag pattern | Inner/outer child mismatch caught at level 2. | Early exit without visiting remainder. |

---

## 2. 💻 DEMONSTRATE: Canonical Invariant Visualization & Algorithmic Mechanics

### 2.1 State Trace: Inverting a Binary Tree In-Place

Consider the tree:
```
           [ 4 ]
          /     \
       [ 2 ]   [ 7 ]
       /   \   /   \
     [ 1 ] [ 3 ][ 6 ][ 9 ]
```

```
Step 1: At Root (4):
  Swap 4.left and 4.right!
           [ 4 ]
          /     \
       [ 7 ]   [ 2 ]       <-- Left and Right swapped!
       /   \   /   \
     [ 6 ] [ 9 ][ 1 ][ 3 ]

Step 2: Recurse into Left Child (7):
  Swap 7.left and 7.right!
       [ 7 ]  ===>       [ 7 ]
       /   \            /     \
     [ 6 ] [ 9 ]      [ 9 ]   [ 6 ]

Step 3: Recurse into Right Child (2):
  Swap 2.left and 2.right!
       [ 2 ]  ===>       [ 2 ]
       /   \            /     \
     [ 1 ] [ 3 ]      [ 3 ]   [ 1 ]

Final Inverted Tree:
           [ 4 ]
          /     \
       [ 7 ]   [ 2 ]
       /   \   /   \
     [ 9 ] [ 6 ][ 3 ][ 1 ]  (Perfect Horizontal Reflection!)
```

---

### 2.2 Dual-Pointer Lockstep BFS Trace (Symmetric Tree)

Instead of recursion, we can verify symmetry iteratively using a FIFO queue that enqueues **pairs of symmetric candidates**:

```
Queue State Evolution:
Initial: Push(root.left), Push(root.right).  ===> Queue: [ 2L, 2R ]

Iteration 1:
  Dequeue t1 = 2L, Dequeue t2 = 2R.
  Values match: 2 == 2.
  Enqueue Outer Pair: Push(2L.left: 3), Push(2R.right: 3).
  Enqueue Inner Pair: Push(2L.right: 4), Push(2R.left: 4).
  Queue: [ (3, 3), (4, 4) ]

Iteration 2:
  Dequeue t1 = 3, Dequeue t2 = 3.
  Values match: 3 == 3. Both children null.

Iteration 3:
  Dequeue t1 = 4, Dequeue t2 = 4.
  Values match: 4 == 4. Both children null.

Queue is empty. All symmetric pairs verified! Return true.
```

---

## 3. 🔬 COMPLEXITY & MATHEMATICAL INVARIANTS

### 3.1 Theorem: Correctness of Structural Induction on Trees

> [!TIP]
> ### 🧮 Proof of Symmetric Tree Correctness
>
> **Inductive Hypothesis:** $\text{IsMirror}(u, v)$ returns `true` if and only if the subtree rooted at $u$ is the mirror image of the subtree rooted at $v$.
>
> **Base Cases:**
> 1. $u = \text{null}$ and $v = \text{null}$: Two empty trees are mirror reflections of each other. Returns `true`. Correct.
> 2. One is null, the other is non-null: Asymmetric presence. Returns `false`. Correct.
> 3. $u.\text{val} \ne v.\text{val}$: Asymmetric values. Returns `false`. Correct.
>
> **Inductive Step:**
> Assume the hypothesis holds for all proper subtrees of $u$ and $v$.
> By the definition of reflection:
> - $u$'s left branch must reflect into $v$'s right branch $\implies \text{IsMirror}(u.\text{left}, v.\text{right}) = \text{true}$.
> - $u$'s right branch must reflect into $v$'s left branch $\implies \text{IsMirror}(u.\text{right}, v.\text{left}) = \text{true}$.
>
> Since both conditions are conjunctions with $u.\text{val} == v.\text{val}$, the algorithm returns `true` if and only if both conditions are satisfied across all $N$ vertices. $\blacksquare$

---

### 3.2 Complexity Invariants
- **Time Complexity:** Strict $\Theta(N)$. Every node is examined at most once. Short-circuits immediately upon the first detected mismatch.
- **Space Complexity:**
  - Recursive DFS: $\Theta(H)$ where $H$ is the tree height.
  - Iterative Parallel Queue BFS: $\Theta(W)$ where $W \le \lceil N/2 \rceil$ is the maximum tree width.

---

## 4. 🛠️ PRACTICE: Canonical Big Tech Problem Walkthroughs

---

### 4.1 Problem 1: [LeetCode 226] Invert Binary Tree (Easy)

> **Problem Description:**
> Given the `root` of a binary tree, invert the tree, and return *its root*.
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[0, 100]$.
> - $-100 \le \text{Node.val} \le 100$

#### Production C# Implementation (In-Place Pointer Swapping)

```csharp
public class Solution
{
    public TreeNode? InvertTree(TreeNode? root)
    {
        if (root == null) return null;

        // 1. Swap left and right child pointers in-place
        TreeNode? temp = root.left;
        root.left = root.right;
        root.right = temp;

        // 2. Recursively invert subtrees
        InvertTree(root.left);
        InvertTree(root.right);

        return root;
    }
}
```

---

### 4.2 Problem 2: [LeetCode 100] Same Tree (Easy)

> **Problem Description:**
> Given the roots of two binary trees `p` and `q`, write a function to check if they are the same or not.
> Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.
>
> **Constraints:**
> - The number of nodes in both trees is in the range $[0, 100]$.
> - $-10^4 \le \text{Node.val} \le 10^4$

#### Production C# Implementation (Clean Short-Circuiting DFS)

```csharp
public class Solution
{
    public bool IsSameTree(TreeNode? p, TreeNode? q)
    {
        // Case 1: Both are null -> identical
        if (p == null && q == null) return true;

        // Case 2: One is null, other is non-null -> structural mismatch
        if (p == null || q == null) return false;

        // Case 3: Values differ -> value mismatch
        if (p.val != q.val) return false;

        // Case 4: Values match -> recurse both subtrees in lockstep
        return IsSameTree(p.left, q.left) && IsSameTree(p.right, q.right);
    }
}
```

---

### 4.3 Problem 3: [LeetCode 101] Symmetric Tree (Easy)

> **Problem Description:**
> Given the `root` of a binary tree, check *whether it is a mirror of itself* (i.e., symmetric around its center).
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[1, 1000]$.
> - $-100 \le \text{Node.val} \le 100$

#### Approach A: Recursive Cross-Mirror DFS ($O(H)$ Space)

```csharp
public class Solution
{
    public bool IsSymmetric(TreeNode? root)
    {
        if (root == null) return true;
        return CheckMirror(root.left, root.right);
    }

    private static bool CheckMirror(TreeNode? t1, TreeNode? t2)
    {
        if (t1 == null && t2 == null) return true;
        if (t1 == null || t2 == null) return false;
        if (t1.val != t2.val) return false;

        // Cross-match: Outer subtrees (t1.left, t2.right) AND Inner subtrees (t1.right, t2.left)
        return CheckMirror(t1.left, t2.right) && CheckMirror(t1.right, t2.left);
    }
}
```

#### Approach B: Iterative Parallel Queue BFS ($O(W)$ Space)

```csharp
using System.Collections.Generic;

public class SolutionIterative
{
    public bool IsSymmetric(TreeNode? root)
    {
        if (root == null) return true;

        // Queue holds pairs of nodes that must mirror each other
        var queue = new Queue<TreeNode?>();
        queue.Enqueue(root.left);
        queue.Enqueue(root.right);

        while (queue.Count > 0)
        {
            TreeNode? t1 = queue.Dequeue();
            TreeNode? t2 = queue.Dequeue();

            if (t1 == null && t2 == null) continue;
            if (t1 == null || t2 == null) return false;
            if (t1.val != t2.val) return false;

            // Enqueue Outer Pair: t1.left with t2.right
            queue.Enqueue(t1.left);
            queue.Enqueue(t2.right);

            // Enqueue Inner Pair: t1.right with t2.left
            queue.Enqueue(t1.right);
            queue.Enqueue(t2.left);
        }

        return true;
    }
}
```

---

## 5. ⚡ HARDWARE & SYSTEMS CONNECTIONS

### 5.1 Merkle Trees & Cryptographic Structural Equality

In distributed databases (e.g. Apache Cassandra, Git, Ethereum):
- Verifying whether two massive tree structures across distributed servers are identical using naive recursive DFS takes $O(N)$ network requests and stalls the I/O bus.
- Instead, systems use **Merkle Trees**:
  $$\text{Hash}(u) = \text{SHA256}(u.\text{val} + \text{Hash}(u.\text{left}) + \text{Hash}(u.\text{right}))$$
- To check if two trees of 100,000,000 files are identical, the system compares only the **32-byte Root Hash**!
- If the root hashes match, the trees are guaranteed to be identical in **$O(1)$ time**. If they differ, a binary-search DFS identifies the exact mismatched leaf in $O(\log N)$ network roundtrips.

---

## 6. ⚠️ DAILY ERROR LOG & COMMON TRAPS

### Trap 1: Checking Parallel Branches Instead of Cross Branches in Symmetry
- **The Bug:** Writing `CheckMirror(t1.left, t2.left) && CheckMirror(t1.right, t2.right)`.
- **The Failure:** This checks if the two subtrees are **identical clones** (like `IsSameTree`), NOT mirror reflections! A tree with left child 2 and right child 2 will pass, but its children will be compared in the wrong orientation.
- **The Fix:** Always cross-compare: `(t1.left, t2.right)` and `(t1.right, t2.left)`.

### Trap 2: Inverting Trees Inorder
- **The Bug:** Writing:
  ```csharp
  InvertTree(root.left);
  Swap(root.left, root.right);
  InvertTree(root.right);
  ```
- **The Failure:** The left child is inverted, then swapped to the right. The next call `InvertTree(root.right)` inverts the *same* subtree again, leaving the original left child inverted twice and the original right child completely untouched!
- **The Fix:** Swap **preorder** (before recursing) or **postorder** (after recursing). Never swap inorder.

### Trap 3: Omitting the Empty Tree Base Case
- **The Bug:** Writing `if (root.left == null && root.right == null) return true;` without checking if `root == null`.
- **The Failure:** Throws `NullReferenceException` when given an empty tree input `[]`.
- **The Fix:** Always guard with `if (root == null) return true;`.

---

## 7. 🎯 DAILY CHECKPOINT & SELF-ASSESSMENT

### 1. Conceptual Verification
1. In [LeetCode 101], how do you prove that an iterative queue implementation of tree symmetry correctly validates the mirror condition without checking all $N^2$ node pairs?
2. Why does inverting a binary tree using an **inorder** traversal fail, while preorder and postorder both succeed?
3. In distributed systems, how do Merkle Trees optimize the `IsSameTree` check from $O(N)$ down to $O(1)$?

### 2. Implementation Audit
- Review your `IsSymmetric` implementation. What does it return when `root = [1, 2, 2, null, 3, null, 3]`? Trace the execution through both the recursive and iterative approaches.

---
*Next Module: **Week 10 — Day 69: Maximum Depth, Minimum Depth & Balanced Binary Tree Invariant (LeetCode 104, 111, 110)***
