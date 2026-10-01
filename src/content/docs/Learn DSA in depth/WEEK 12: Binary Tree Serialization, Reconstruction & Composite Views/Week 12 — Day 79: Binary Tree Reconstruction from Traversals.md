---
title: "Week 12 — Day 79: Binary Tree Reconstruction from Traversals"
---

# Week 12 — Day 79: Binary Tree Reconstruction from Traversals

Welcome to **Day 79 of your DSA Mastery Journey**!

Yesterday in [Day 78](./Week%2012%20%E2%80%94%20Day%2078:%20Binary%20Tree%20Serialization%20&%20Deserialization.md), we proved the Structural Ambiguity Theorem: a single standard traversal sequence without null sentinels cannot uniquely identify an arbitrary binary tree.

Today, we answer the complementary fundamental question: **How do we reconstruct arbitrary binary trees without null sentinels using dual traversals?**
1. **The Inorder Splitting Theorem:** Why Inorder traversal provides the spatial left/right partition boundary that Preorder and Postorder cannot provide alone.
2. **Preorder + Inorder Reconstruction ([LeetCode 105]):** The canonical divide-and-conquer index arithmetic engine.
3. **The Left Subtree Count Law:** Deriving `leftSize = inRootIdx - inStart` to partition array boundaries without allocating memory.
4. **The Hash Map Acceleration:** Reducing search complexity from $O(N^2)$ to **strict $\Theta(N)$** via $O(1)$ index lookups.
5. **Inorder + Postorder Reconstruction ([LeetCode 106]):** Symmetric reverse-root divide-and-conquer.
6. **Preorder + Postorder Ambiguity ([LeetCode 889]):** Proving why trees with single-child nodes cannot be uniquely reconstructed without chirality markers.
7. **Real-World Systems Architecture:** Compiler Abstract Syntax Tree (AST) generation from linear token streams and out-of-order CPU instruction DAG reconstruction.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 79 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: CANONICAL DUALS     │                                     │     PART II: BOUNDARY ARITHMETIC│
│  Inorder + (Preorder / Postorder│                                     │  Index Math & Non-Unique Trees  │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Preorder: Identifies ROOT     │                                     │ • leftSize = inRootIdx - inStart│
│ • Inorder: Partitions SUBTREES  │                                     │ • Zero-Alloc Index Ranges: O(1) │
│ • HashMap: O(N^2) -> O(N) Proof │                                     │ • LC 106: Postorder End Root    │
│ • LC 105: Preorder + Inorder    │                                     │ • LC 889: Pre + Post Ambiguity  │
│ • Zero LINQ Memory Allocations  │                                     │ • Single-Child Degeneracy Proof │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* **Binary Tree Reconstruction** creates the unique in-memory binary tree topology from two distinct standard linear traversal sequences (assuming all node values are unique).
  - *Core Invariants:*
    1. **Dual-Traversal Completeness Invariant:** A tree is uniquely reconstructible if and only if **Inorder** is paired with either **Preorder** or **Postorder** (given distinct node keys).
    2. **Inorder Partitioning Invariant:** In `inorder`, all nodes to the left of the root's index belong to the left subtree; all nodes to the right belong to the right subtree.
    3. **Left Subtree Size Invariant:** The number of nodes in the left subtree is invariant across all traversal orders: $\text{leftSize} = \text{inRootIdx} - \text{inStart}$.
  - *Misconception Check:* Preorder + Postorder does **not** uniquely reconstruct an arbitrary binary tree if any node has only a single child! For a tree with root `1` and single child `2`, Preorder is `[1, 2]` and Postorder is `[2, 1]` regardless of whether `2` is a left child or a right child!
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the $O(N)$ linear scan to find the root's position in the `inorder` array at every recursive level, avoiding the $O(N^2)$ degradation on skewed trees.
  - *Complexity Advantage:* Precomputing an `inorderMap` reduces root index lookup to $O(1)$, achieving optimal $\Theta(N)$ linear time and $O(N)$ space.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose / Signal Words:* "Construct binary tree from preorder and inorder", "reconstruct tree from traversals", "build tree from inorder and postorder".
  - *When to Avoid / Failure Modes:* If the tree contains **duplicate node values**, the hash map index lookup becomes non-injective (ambiguous root index), breaking the divide-and-conquer partition!
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* `Dictionary<int, int>` mapping `val -> inorderIndex` on the managed heap; index pointer arguments (`preStart, preEnd, inStart, inEnd`) passed on CPU registers, eliminating array-slice memory allocations.
  - *Production Systems:* Programming language compiler AST generation from token streams (Roslyn / LLVM), database query optimizer join tree generation from serialized relational plans.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To reconstruct a binary tree from preorder and inorder traversals, the first element of preorder is the root, and finding that root in inorder splits the tree into left and right subtrees. I precompute a hash map of inorder values to indices for O(1) lookup. I calculate the left subtree size as the root's inorder index minus the inorder start, partition both arrays using index ranges without copying memory, and recursively build the subtrees in O(N) time and O(N) space."
  - *Interviewer Evaluation Lens:* Assesses zero-allocation index passing (avoiding `Array.Copy` or LINQ `.Skip()/.Take()`), derivation of `leftSize` arithmetic, hash map optimization from $O(N^2)$ to $O(N)$, and explanation of why Preorder+Postorder is ambiguous.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:* Time: $\Theta(N)$; Space: $\Theta(N)$ for hash map + $O(H)$ recursion stack.
  - *State Transition Trace (LC 105):*
    `preorder: [3, 9, 20, 15, 7], inorder: [9, 3, 15, 20, 7] -> root=3 at inIdx=1 -> leftSize = 1 - 0 = 1 -> leftPre: [9], leftIn: [9] -> rightPre: [20, 15, 7], rightIn: [15, 20, 7]`.

---

### 1.1 Physical Mental Model — The Jigsaw Puzzle Detective

**Analogy: Two Incomplete Witness Reports**

Imagine a detective has two witnesses to the same crime scene (the tree):

- **Witness A (Preorder):** Remembers the **order people arrived** (Root first, then left group, then right group). Knows who arrived first — but can't tell where the left group ended and right group began.
- **Witness B (Inorder):** Remembers **seating arrangement left-to-right** at the table. Crucially, the victim (root) is seated **between** the left and right groups — acting as a natural divider!

Together, they can reconstruct the exact original scene.

```
Concrete Example: preorder=[3,9,20,15,7], inorder=[9,3,15,20,7]

Step 1 — Identify Root:
  preorder[0] = 3 → ROOT is node 3

Step 2 — Find Root in Inorder (splits table into two groups):
  inorder = [ 9 | 3 | 15, 20, 7 ]
               ▲   ▲   ▲
         Left grp Root Right group
         (1 person) (3 people)

Step 3 — Split Preorder using leftSize=1:
  preorder = [ 3 | 9 | 20, 15, 7 ]
               ▲   ▲   ▲
             Root Left  Right subtree preorder

Step 4 — Recurse on left:
  preorder=[9], inorder=[9] → leaf node 9

Step 5 — Recurse on right:
  preorder=[20,15,7], inorder=[15,20,7]
    Root=20; inorder=[15|20|7]; leftSize=1
    Left: preorder=[15], inorder=[15] → leaf 15
    Right: preorder=[7], inorder=[7] → leaf 7

Final reconstructed tree:
          [3]
         /   \
       [9]   [20]
             /   \
           [15]  [7]    ✅
```

**State evolution — index tracking without array copying:**

```
Call               preStart preEnd inStart inEnd  leftSize  Action
────────────────── ──────── ────── ─────── ─────  ────────  ──────────────
Build(0, 4, 0, 4)    0       4      0       4        1      Root=3 at in[1]
  Build(1,1, 0,0)    1       1      0       0        —      Root=9 (leaf)
  Build(2,4, 2,4)    2       4      2       4        1      Root=20 at in[3]
    Build(3,3,2,2)   3       3      2       2        —      Root=15 (leaf)
    Build(4,4,4,4)   4       4      4       4        —      Root=7 (leaf)

Zero sub-arrays allocated! Only integer index ranges passed.
```

**Why Preorder + Postorder is NOT enough (without Inorder):**

```
Ambiguous case — two different trees, same preorder AND postorder:

Tree A:       Tree B:
  [1]            [1]
  /                \
[2]                [2]

PreOrder:  [1, 2]    [1, 2]    ← identical!
PostOrder: [2, 1]    [2, 1]    ← identical!

Without Inorder, we can't determine if 2 is a left or right child!
```

---

### 1.2 The Inorder Splitting Theorem

Why is **Inorder** mandatory for unique tree reconstruction?
- In a **Preorder** traversal (`Root -> Left -> Right`), the root appears first, but we cannot tell where the left subtree ends and the right subtree begins.
- In a **Postorder** traversal (`Left -> Right -> Root`), the root appears last, but we again cannot tell where the left subtree ends and the right subtree begins.
- In an **Inorder** traversal (`Left -> Root -> Right`), the root acts as a physical geometric barrier dividing the left subtree from the right subtree!

```
Preorder:   [ Root | ◄───── Left Subtree ─────► | ◄───── Right Subtree ─────► ]
              ▲
              │ Matches Root Value
              ▼
Inorder:    [ ◄── Left Subtree ──► | Root | ◄──────── Right Subtree ────────► ]
              inStart          inRootIdx-1  inRootIdx+1                   inEnd
```

By locating the root in `inorder` at index `inRootIdx`:
1. All elements from `inStart` to `inRootIdx - 1` belong strictly to the **Left Subtree**.
2. All elements from `inRootIdx + 1` to `inEnd` belong strictly to the **Right Subtree**.

---

### 1.2 The Index Partitioning Arithmetic Engine

To implement reconstruction in $O(1)$ auxiliary space per recursive step, we **never create sub-arrays**. We pass 4 index boundaries:
`preStart, preEnd, inStart, inEnd`

#### The Left Subtree Count Law:
$$\text{leftSize} = \text{inRootIdx} - \text{inStart}$$

Using `leftSize`, we calculate the exact index boundaries for both subtrees:

```
Left Subtree:
  Preorder: [ preStart + 1 , preStart + leftSize ]
  Inorder:  [ inStart      , inRootIdx - 1 ]

Right Subtree:
  Preorder: [ preStart + leftSize + 1 , preEnd ]
  Inorder:  [ inRootIdx + 1           , inEnd ]
```

---

### 1.3 Why Preorder + Postorder is Ambiguous (Single-Child Degeneracy)

Can we reconstruct a binary tree from **Preorder + Postorder** alone?
**NO, not uniquely!**

**Proof by Counterexample:**
Consider a tree with a root `1` and a single child `2`:
```
Tree A (Left Child):       [ 1 ]
                          /
                       [ 2 ]

Tree B (Right Child):      [ 1 ]
                                \
                                [ 2 ]
```
- **Preorder of Tree A:** `[1, 2]`
- **Preorder of Tree B:** `[1, 2]`
- **Postorder of Tree A:** `[2, 1]`
- **Postorder of Tree B:** `[2, 1]`

Both trees produce the **exact same preorder and postorder sequences**!
Without Inorder, it is mathematically impossible to know whether node `2` is a left child or a right child.
*(LeetCode 889 allows returning ANY valid reconstruction by arbitrarily assigning single children as left subtrees).*

---

### 1.4 ⚙️ Core Operations Deep-Dive: Preorder/Inorder Boundary Split Index Arithmetic

#### Dimension 1: Operation Contract & Big-O Bounds

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               TREE RECONSTRUCTION CONTRACT SPECIFICATION                          │
├───────────────┬───────────────────────────────┬───────────────────────────────────┬───────────────┤
│ OPERATION     │ PRECONDITIONS                 │ POSTCONDITIONS / GUARANTEES       │ TIME & SPACE  │
├───────────────┼───────────────────────────────┼───────────────────────────────────┼───────────────┤
│ BuildTree     │ preorder and inorder arrays   │ Returns unique binary tree matching│ Time: Θ(N)   │
│ (Pre + In)    │ of size N; unique keys        │ both traversals identically.      │ Space: Θ(N)   │
├───────────────┼───────────────────────────────┼───────────────────────────────────┼───────────────┤
│ BuildTree     │ postorder and inorder arrays  │ Returns unique binary tree matching│ Time: Θ(N)   │
│ (Post + In)   │ of size N; unique keys        │ both traversals identically.      │ Space: Θ(N)   │
└───────────────┴───────────────────────────────┴───────────────────────────────────┴───────────────┘
```

- **Time Complexity Bounds:**
  - *Hash Map Preprocessing:* Scanning `inorder` to build `Dictionary<int, int>` takes $\Theta(N)$ time.
  - *Recursive Divide-and-Conquer:* Exactly $N$ recursive invocations, each doing $O(1)$ arithmetic index bounds calculations $\implies \Theta(N)$ total time.
- **Space Complexity:**
  - Auxiliary Memory: $\Theta(N)$ space for the hash map indexing `inorder` positions.
  - Call Stack: $\Theta(H)$ recursion stack frames where $H \in [\log_2 N, N]$.

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                       ┌─────────────────────────┐
                       │  Build(preL,preR,inL,inR│
                       └────────────┬────────────┘
                                    │
                         preL > preR OR inL > inR ?
                                    │
                 ┌──────────────────┴──────────────────┐
                 ▼ (YES)                               ▼ (NO)
            RETURN NULL                         rootVal = preorder[preL]
                                                inRootIdx = inMap[rootVal]
                                                leftSize = inRootIdx - inL
                                                       │
                                                       ▼
                                                root = new TreeNode(rootVal)
                                                root.left = Build(preL + 1, preL + leftSize,
                                                                  inL, inRootIdx - 1)
                                                root.right = Build(preL + leftSize + 1, preR,
                                                                   inRootIdx + 1, inR)
                                                RETURN root
```

1. **Index Slicing Arithmetic Equations:**
   - Let `rootVal = preorder[preStart]`.
   - Lookup root index in inorder: `inRootIdx = inMap[rootVal]`.
   - Calculate left subtree cardinality: `leftSize = inRootIdx - inStart`.
   - **Left Subtree Sub-boundaries:**
     - Preorder: `[preStart + 1, preStart + leftSize]`
     - Inorder: `[inStart, inRootIdx - 1]`
   - **Right Subtree Sub-boundaries:**
     - Preorder: `[preStart + leftSize + 1, preEnd]`
     - Inorder: `[inRootIdx + 1, inEnd]`

---

#### Dimension 3: Visual ASCII State Transitions (Partitioning Boundaries)

```
PREORDER: [ 3,  9,  20, 15,  7 ] (Indices: preStart=0, preEnd=4)
INORDER:  [ 9,  3,  15, 20,  7 ] (Indices: inStart=0, inEnd=4)

STEP 1: ROOT RESOLUTION
   - rootVal = preorder[0] = 3.
   - inRootIdx = inMap[3] = 1.
   - leftSize = inRootIdx - inStart = 1 - 0 = 1.

STEP 2: PARTITION ARITHMETIC
   LEFT SUBTREE BOUNDS:
   - Preorder: [ preStart + 1, preStart + leftSize ] = [ 1, 1 ] -> Element [ 9 ]
   - Inorder:  [ inStart, inRootIdx - 1 ]           = [ 0, 0 ] -> Element [ 9 ]

   RIGHT SUBTREE BOUNDS:
   - Preorder: [ preStart + leftSize + 1, preEnd ]   = [ 2, 4 ] -> Elements [ 20, 15, 7 ]
   - Inorder:  [ inRootIdx + 1, inEnd ]             = [ 2, 4 ] -> Elements [ 15, 20, 7 ]

STEP 3: RECONSTRUCTED TREE TOPOLOGY
               [ 3 ]
              /     \
           [ 9 ]   [ 20 ]
                   /    \
                [ 15 ]  [ 7 ]
```

---

#### Dimension 4: Invariant Preservation Proof

**Theorem (Uniqueness and Correctness of Inorder-Preorder Bipartition):**
Given preorder and inorder traversals of a binary tree with unique keys, the boundary split equations uniquely determine the left and right subtrees of every node.

*Proof:*
1. **Root Uniqueness:**
   In preorder traversal ($\text{Root} \to \text{Left} \to \text{Right}$), the first element `preorder[preStart]` is unequivocally the apex of the current subtree.
2. **Inorder Bipartition:**
   In inorder traversal ($\text{Left} \to \text{Root} \to \text{Right}$), all nodes in the left subtree must appear before the root, and all nodes in the right subtree must appear after the root.
   Because all values are unique, there is a unique index `inRootIdx` where `inorder[inRootIdx] == rootVal`.
   The slice `inorder[inStart ... inRootIdx - 1]` contains exactly the nodes of the left subtree.
   Its size $N_L = \text{inRootIdx} - \text{inStart}$ is the invariant count of left subtree elements.
3. **Preorder Subtree Contiguity:**
   In preorder traversal, the left subtree elements are contiguous and immediately follow `rootVal`.
   Thus, the slice `preorder[preStart + 1 ... preStart + N_L]` corresponds bijectively to the left subtree, and the remainder `preorder[preStart + N_L + 1 ... preEnd]` corresponds to the right subtree.
   By strong induction on tree size $N$, every node is partitioned into its unique child position. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Scenario | Input Condition | Algorithmic Behavior | Guarantee |
| :--- | :--- | :--- | :--- |
| **Empty Subtree** | `preStart > preEnd` or `inStart > inEnd` | Immediate base case return `null` | Zero illegal array accesses |
| **Single-Node Subtree** | `preStart == preEnd` | `leftSize = 0`; children receive empty ranges | Returns leaf node cleanly |
| **Pure Left-Skewed Tree** | Root is maximum; right subtrees empty | `inRootIdx == inEnd`; right range becomes empty | Reconstructs left spine in $O(N)$ |
| **Pure Right-Skewed Tree** | Root is minimum; left subtrees empty | `inRootIdx == inStart`; `leftSize = 0` | Reconstructs right spine in $O(N)$ |
| **Postorder + Inorder Symmetry** | Root is at `postEnd` | Root picked from `postEnd`; $N_R = inEnd - inRootIdx$ | Symmetric $O(N)$ reconstruction |

---

## 2. 🔬 ANALYZE: Complexity & Memory Optimization

### 2.1 The $O(N^2)$ Array Slicing Antipattern vs. Register Indices

Many candidates implement divide-and-conquer using LINQ or `Array.Copy`:
```csharp
// ❌ CATASTROPHIC HEAP ALLOCATION: O(N^2) Array Churn!
TreeNode? BadBuild(int[] pre, int[] @in)
{
    if (pre.Length == 0) return null;
    int rootVal = pre[0];
    int rootIdx = Array.IndexOf(@in, rootVal); // O(N) linear scan!

    var leftIn = @in.Take(rootIdx).ToArray();         // Allocates new array!
    var rightIn = @in.Skip(rootIdx + 1).ToArray();     // Allocates new array!
    var leftPre = pre.Skip(1).Take(rootIdx).ToArray(); // Allocates new array!
    var rightPre = pre.Skip(1 + rootIdx).ToArray();    // Allocates new array!

    return new TreeNode(rootVal) {
        left = BadBuild(leftPre, leftIn),
        right = BadBuild(rightPre, rightIn)
    };
}
```

#### Why This Catastrophically Fails:
1. `Array.IndexOf(@in, rootVal)` scans linearly: $O(N)$ work per node $\implies O(N^2)$ total time!
2. `.Skip()`, `.Take()`, and `.ToArray()` allocate new arrays on the heap at every recursive call $\implies O(N^2)$ auxiliary memory allocations!

#### The High-Performance Fix:
1. Precompute `Dictionary<int, int>` for $O(1)$ root index lookups.
2. Pass 4 integer indices on CPU registers: `(preStart, preEnd, inStart, inEnd)`.
3. Auxiliary heap memory allocated: **ZERO**.

$$\text{Time Complexity: } \Theta(N)$$
$$\text{Auxiliary Space Complexity: } \Theta(N) \text{ (for hash map) } + O(H) \text{ call stack}$$

---

## 3. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

---

### 3.1 Problem 1: [LeetCode 105] Construct Binary Tree from Preorder and Inorder Traversal (Medium)

> **Problem Description:**
> Given two integer arrays `preorder` and `inorder` where `preorder` is the preorder traversal of a binary tree and `inorder` is the inorder traversal of the same tree, construct and return *the binary tree*.
>
> **Constraints:**
> - $1 \le \text{preorder.length} \le 3000$
> - $\text{inorder.length} == \text{preorder.length}$
> - $-3000 \le \text{preorder}[i], \text{inorder}[i] \le 3000$
> - `preorder` and `inorder` consist of **unique** values.
> - Each value of `inorder` also appears in `preorder`.
> - `preorder` is **guaranteed** to be the preorder traversal of the tree.
> - `inorder` is **guaranteed** to be the inorder traversal of the tree.

#### Production C# Implementation

```csharp
using System.Collections.Generic;

public class Solution105
{
    private readonly Dictionary<int, int> _inorderMap = new();

    public TreeNode? BuildTree(int[] preorder, int[] inorder)
    {
        if (preorder == null || inorder == null || preorder.Length == 0)
        {
            return null;
        }

        // 1. Precompute Inorder Index Hash Map for O(1) lookups
        _inorderMap.Clear();
        for (int i = 0; i < inorder.Length; i++)
        {
            _inorderMap[inorder[i]] = i;
        }

        // 2. Launch divide-and-conquer with zero heap allocation
        return Build(preorder, 0, preorder.Length - 1, 0, inorder.Length - 1);
    }

    private TreeNode? Build(int[] preorder, int preStart, int preEnd, int inStart, int inEnd)
    {
        // Base case: empty index range
        if (preStart > preEnd || inStart > inEnd)
        {
            return null;
        }

        // 1. Root is always the first element in preorder
        int rootVal = preorder[preStart];
        var root = new TreeNode(rootVal);

        // 2. Find root index in inorder sequence
        int inRootIdx = _inorderMap[rootVal];

        // 3. Compute left subtree size
        int leftSize = inRootIdx - inStart;

        // 4. Divide and Conquer
        // Left Subtree ranges:
        //   preorder: [preStart + 1, preStart + leftSize]
        //   inorder:  [inStart, inRootIdx - 1]
        root.left = Build(preorder, preStart + 1, preStart + leftSize, inStart, inRootIdx - 1);

        // Right Subtree ranges:
        //   preorder: [preStart + leftSize + 1, preEnd]
        //   inorder:  [inRootIdx + 1, inEnd]
        root.right = Build(preorder, preStart + leftSize + 1, preEnd, inRootIdx + 1, inEnd);

        return root;
    }
}
```

---

### 3.2 Problem 2: [LeetCode 106] Construct Binary Tree from Inorder and Postorder Traversal (Medium)

> **Problem Description:**
> Given two integer arrays `inorder` and `postorder` where `inorder` is the inorder traversal of a binary tree and `postorder` is the postorder traversal of the same tree, construct and return *the binary tree*.
>
> **Constraints:**
> - $1 \le \text{inorder.length} \le 3000$
> - $\text{postorder.length} == \text{inorder.length}$
> - Values are unique.

#### Inorder + Postorder Index Arithmetic
In Postorder (`Left -> Right -> Root`):
- Root is always the **last** element: `rootVal = postorder[postEnd]`.
- Left subtree spans: `[postStart, postStart + leftSize - 1]`.
- Right subtree spans: `[postStart + leftSize, postEnd - 1]`.

#### Production C# Implementation

```csharp
using System.Collections.Generic;

public class Solution106
{
    private readonly Dictionary<int, int> _inorderMap = new();

    public TreeNode? BuildTree(int[] inorder, int[] postorder)
    {
        if (inorder == null || postorder == null || inorder.Length == 0)
        {
            return null;
        }

        _inorderMap.Clear();
        for (int i = 0; i < inorder.Length; i++)
        {
            _inorderMap[inorder[i]] = i;
        }

        return Build(postorder, 0, postorder.Length - 1, 0, inorder.Length - 1);
    }

    private TreeNode? Build(int[] postorder, int postStart, int postEnd, int inStart, int inEnd)
    {
        if (postStart > postEnd || inStart > inEnd)
        {
            return null;
        }

        // 1. Root is the LAST element in postorder
        int rootVal = postorder[postEnd];
        var root = new TreeNode(rootVal);

        int inRootIdx = _inorderMap[rootVal];
        int leftSize = inRootIdx - inStart;

        // 2. Divide and conquer
        root.left = Build(postorder, postStart, postStart + leftSize - 1, inStart, inRootIdx - 1);
        root.right = Build(postorder, postStart + leftSize, postEnd - 1, inRootIdx + 1, inEnd);

        return root;
    }
}
```

---

### 3.3 Problem 3: [LeetCode 889] Construct Binary Tree from Preorder and Postorder Traversal (Medium)

> **Problem Description:**
> Given two integer arrays `preorder` and `postorder`, construct and return *any binary tree* that has the same preorder and postorder traversals.

#### Key Insight:
- `preorder[preStart]` is the `root`.
- If `preStart == preEnd`, the node is a leaf!
- Otherwise, `preorder[preStart + 1]` is the **root of the left subtree** (`leftRootVal`).
- Find `leftRootVal` in `postorder` at `postLeftRootIdx`.
- The number of nodes in the left subtree is:
  $$\text{leftSize} = \text{postLeftRootIdx} - \text{postStart} + 1$$

#### Production C# Implementation

```csharp
using System.Collections.Generic;

public class Solution889
{
    private readonly Dictionary<int, int> _postorderMap = new();

    public TreeNode? ConstructFromPrePost(int[] preorder, int[] postorder)
    {
        if (preorder == null || postorder == null || preorder.Length == 0)
        {
            return null;
        }

        _postorderMap.Clear();
        for (int i = 0; i < postorder.Length; i++)
        {
            _postorderMap[postorder[i]] = i;
        }

        return Build(preorder, 0, preorder.Length - 1, 0, postorder.Length - 1);
    }

    private TreeNode? Build(int[] preorder, int preStart, int preEnd, int postStart, int postEnd)
    {
        if (preStart > preEnd) return null;

        var root = new TreeNode(preorder[preStart]);
        if (preStart == preEnd) return root; // Leaf reached

        // The node immediately following root in preorder is the root of the left subtree
        int leftRootVal = preorder[preStart + 1];
        int postLeftRootIdx = _postorderMap[leftRootVal];

        int leftSize = postLeftRootIdx - postStart + 1;

        root.left = Build(preorder, preStart + 1, preStart + leftSize, postStart, postLeftRootIdx);
        root.right = Build(preorder, preStart + leftSize + 1, preEnd, postLeftRootIdx + 1, postEnd - 1);

        return root;
    }
}
```

---

## 4. 🏋️ PRACTICE: Guided Exercises & Problem Set

### 4.1 Guided Exercises

#### Exercise 1: [LeetCode 1008] Construct Binary Search Tree from Preorder Traversal (Medium)
- **Problem Statement:** Reconstruct a BST from `preorder` traversal alone in $O(N)$ time.
- **Trigger Clue:** In a BST, Inorder is simply the sorted preorder array!
- **Template Hint:** Do NOT sort in $O(N \log N)$! Instead, use upper bound tracking:
  `TreeNode? Build(int[] pre, ref int idx, int bound)`
  If `idx == pre.Length || pre[idx] > bound`, return null!
- **Target Complexity:** $\Theta(N)$ time, $O(H)$ space.

#### Exercise 2: [LeetCode 1028] Recover a Tree From Preorder Traversal (Hard)
- **Problem Statement:** Recover a binary tree from a serialized string where depth is encoded by the number of dashes (`-`).
- **Trigger Clue:** Preorder depth parsing using a monotonic stack.
- **Target Complexity:** $\Theta(N)$ time, $O(H)$ space.

#### Exercise 3: [LeetCode 536] Construct Binary Tree from String (Medium)
- **Problem Statement:** Construct a binary tree from a string containing parentheses: `"4(2(3)(1))(6(5))"`.
- **Trigger Clue:** Parenthesis nesting matches left and right child scopes.
- **Target Complexity:** $\Theta(N)$ time, $O(H)$ stack space.

---

## 5. ⚡ HARDWARE & SYSTEMS CONNECTIONS

### 5.1 Compiler AST Reconstruction from Token Streams
In the C# Roslyn Compiler:
- Source code is lexed into a flat, sequential stream of tokens.
- Binary expressions (`a + b * c`) represent hierarchical trees where `*` has higher precedence than `+`.
- The parser reconstructs the Abstract Syntax Tree using precedence climbing and Pratt parsing, which directly mirrors Inorder boundary partitioning!

### 5.2 Out-of-Order CPU Instruction DAG Reconstruction
Modern x86/ARM CPUs execute instructions out-of-order:
- Machine code is fetched as a linear preorder stream of instructions.
- The instruction decoder reconstructs a Directed Acyclic Graph (DAG) of register dependencies in hardware (Register Alias Table - RAT), ensuring parallel pipelines respect true data dependencies.

---

## 6. ⚠️ DAILY ERROR LOG & COMMON TRAPS

### Trap 1: Off-by-One in Left Preorder Subtree Range
- **The Bug:** Writing `preStart + leftSize - 1` instead of `preStart + leftSize`.
- **The Failure:** Misses the last node of the left subtree, corrupting the tree structure.
- **The Fix:** Remember: the left subtree starts at `preStart + 1` and has length `leftSize`, so its inclusive end is `(preStart + 1) + leftSize - 1 = preStart + leftSize`.

### Trap 2: Slicing Arrays via LINQ
- **The Bug:** Using `preorder.Skip(1).Take(leftSize).ToArray()`.
- **The Failure:** Causes $O(N^2)$ heap allocation garbage and memory thrashing.
- **The Fix:** **Always pass indices: `preStart, preEnd, inStart, inEnd`**.

### Trap 3: Key Collisions with Duplicate Node Values
- **The Bug:** Applying `_inorderMap[inorder[i]] = i` when trees contain duplicate values.
- **The Failure:** Duplicate keys overwrite earlier indices, causing invalid partition boundaries.
- **The Fix:** Dual-traversal reconstruction mathematically requires **unique node values**. If duplicates exist, the problem cannot be solved deterministically.

---

## 7. 🎯 DAILY CHECKPOINT & SELF-ASSESSMENT

### 1. Conceptual Verification
1. In [LeetCode 105], how do we calculate the exact number of nodes in the left subtree to determine the split boundary in the `preorder` array?
2. Why can an arbitrary binary tree NOT be uniquely reconstructed from Preorder and Postorder traversals alone when nodes have only one child?
3. What happens if the input tree contains duplicate node values? Why does the hash map acceleration fail, and what is the resulting time complexity?

### 2. Implementation Audit
- Trace your `BuildTree` implementation for LeetCode 105 on a single node tree:
  `preorder = [1]`, `inorder = [1]`.
  Verify that the base case properly assigns `root.val = 1` and sets `root.left = null` and `root.right = null` without throwing an `IndexOutOfRangeException`.

---
*Next Module: **Week 12 — Day 80: Populating Next Right Pointers in Sibling Nodes (LeetCode 116, 117)***
