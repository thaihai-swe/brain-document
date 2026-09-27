---
title: "Week 12 — Day 81: Subtree Matching & Merging"
---

# Week 12 — Day 81: Subtree Matching & Merging

Welcome to **Day 81 of your DSA Mastery Journey**!

Yesterday in [Day 80](./Week%2012%20%E2%80%94%20Day%2080:%20Populating%20Next%20Right%20Pointers%20in%20Sibling%20Nodes.md), we mastered horizontal pointer linkage, sewing next right pointers across sibling and cousin boundaries in strictly $O(1)$ auxiliary space.

Today, we delve into **Subtree Matching, Tree Superposition & Merkle DAG Deduplication**:
1. **Tree Superposition ([LeetCode 617]):** Merging two binary trees by topological overlapping, contrasting in-place memory mutation against pure functional immutability.
2. **Subtree Isomorphism ([LeetCode 572]):** Determining subtree containment using dual-recursive structural verification ($O(M \cdot N)$) versus linear-time string serialization with the Knuth-Morris-Pratt (KMP) algorithm ($O(M + N)$).
3. **Subtree Deduplication & The Merkle DAG ([LeetCode 652]):** Identifying identical subtrees across an arbitrary binary tree. We expose the dangerous $O(N^2)$ memory explosion of naive string concatenation, and engineer the optimal $O(N)$ **Merkle Subtree Triplet ID Compression** algorithm.
4. **Systems Architecture:** Common Subexpression Elimination (CSE) in compilers (Roslyn / LLVM), Git content-addressable Merkle trees, and managed CLR Large Object Heap (LOH) fragmentation.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 81 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┼───────────────────────────────────────┐
         ▼                                       ▼                                       ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│     PART I: TREE MERGING        │   │    PART II: SUBTREE MATCHING    │   │  PART III: SUBTREE DEDUP (DAG)  │
│   Structural Superposition      │   │     Isomorphism & Containment   │   │  Merkle Triplet ID Compression  │
├─────────────────────────────────┤   ├─────────────────────────────────┤   ├─────────────────────────────────┤
│ • LC 617: Merge Two Trees       │   │ • LC 572: Subtree of Another    │   │ • LC 652: Find Duplicate Subs   │
│ • Base Cases: t1/t2 null graft  │   │ • Dual DFS: O(M * N) Worst Case │   │ • Naive String Trap: O(N²) GC   │
│ • In-Place vs Immutable Copy    │   │ • KMP + Serialization: O(M + N) │   │ • Triplet: (val, leftId, right) │
│ • Reference Sharing Dangers     │   │ • Null Sentinel Requirement     │   │ • Strict O(N) Time & Space      │
│ • Compiler AST Rewriting        │   │ • Delimiter Token Invariant     │   │ • Roslyn / LLVM AST Deduplication│
└─────────────────────────────────┘   └─────────────────────────────────┘   └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:*
    - **Tree Merging:** Given two binary trees $T_1$ and $T_2$, their merge is a new tree where overlapping nodes sum their values, and non-overlapping subtrees are preserved.
    - **Subtree Containment:** Tree $T$ is a subtree of $S$ if there exists a node $u \in S$ such that the subtree rooted at $u$ is isomorphic in structure and node values to $T$.
    - **Subtree Deduplication:** Partitioning all $N$ subtrees of a binary tree into equivalence classes of isomorphic subtrees, identifying classes with cardinality $\ge 2$.
  - *Core Invariants:*
    1. **Structural Isomorphism Invariant:** Two trees $A$ and $B$ are isomorphic if and only if $A.val == B.val$, and $Isomorphic(A.left, B.left)$, and $Isomorphic(A.right, B.right)$ (for ordered binary trees).
    2. **Unique Serialization Invariant:** Two trees are isomorphic if and only if their unique pre/postorder serializations with explicit null sentinels and delimiters are identical strings.
    3. **Merkle Triplet Invariant:** Every unique subtree structure has a 1-to-1 mapping with an integer ID $ID(u) = UniqueMapping(u.val, ID(u.left), ID(u.right))$, where $ID(null) = 0$.
  - *Misconception Check:* A common error in [LeetCode 572] is assuming that if $T$'s preorder traversal is a substring of $S$'s preorder traversal, $T$ must be a subtree of $S$. Without delimiters and explicit null markers, counterexamples abound: a tree with values `12` matches nodes `1` and `2`, and different topologies produce identical preorder values (e.g., left-skewed vs right-skewed).
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates redundant tree evaluation and detects duplicated computations. Compilers use subtree deduplication to eliminate common subexpressions (CSE) across abstract syntax trees (ASTs).
  - *Complexity Advantage:* Naive subtree string serialization causes an $O(N^2)$ memory explosion due to string allocations at each node. Merkle Triplet ID hashing reduces subtree deduplication from $O(N^2)$ time/space to strictly **$O(N)$ time and $O(N)$ space**.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose / Signal Words:* "Subtree of another tree", "merge two binary trees", "find duplicate subtrees", "tree isomorphism", "common subexpression elimination", "Merkle tree verification".
  - *When to Avoid / Failure Modes:* If tree structures are unordered (where left and right children can be swapped), standard binary tree isomorphism fails; unordered tree isomorphism requires sorting child hashes (AHU algorithm).
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Naive string serialization allocates millions of temporary strings on the Gen 0 GC heap, leading to frequent Garbage Collector pauses and Large Object Heap (LOH) fragmentation if serialized strings exceed 85,000 bytes. The Merkle Triplet approach allocates small integer structs in a hash table, maximizing cache locality and minimizing GC pressure.
  - *Production Systems:* Git commit tree object hashes (Merkle DAG), LLVM/Roslyn compiler AST node deduplication, React Virtual DOM reconciliation, Ethereum state tries.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To merge two binary trees, I overlay them recursively: if either node is null, I return the other; otherwise, I sum their values and recurse on their left and right children. For finding duplicate subtrees, naive postorder string serialization takes $O(N^2)$ due to string copying. Instead, I use Merkle Triplet compression: each subtree is uniquely identified by its root value and the integer IDs of its left and right children. Looking up this triplet in a hash map assigns each unique subtree an integer ID in $O(1)$ time, yielding an optimal $O(N)$ time and space solution."
  - *Interviewer Evaluation Lens:* Assesses whether the candidate recognizes the $O(N^2)$ string concatenation trap, understands null sentinels in tree serialization, and knows how to compress subtrees using Merkle hashing or integer tuple ID assignment.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:*
    - LC 617 (Merge): Time: $O(\min(N, M))$ or $O(N + M)$; Auxiliary Space: $O(\min(H_1, H_2))$ stack frames.
    - LC 572 (Subtree): Dual DFS: $O(M \cdot N)$ time, $O(H)$ space; KMP/Merkle: $O(M + N)$ time, $O(M + N)$ space.
    - LC 652 (Duplicate Subtrees): Triplet ID Merkle Hash: $O(N)$ time, $O(N)$ space.
  - *State Transition Trace (LC 652 Triplet ID):*
    `Node(4, null, null) -> Triplet (4, 0, 0) -> ID 1`.
    `Second Node(4, null, null) -> Triplet (4, 0, 0) -> Seen ID 1 (Count=2, Duplicate found!)`.

---

### 1.1 Structural Tree Superposition & Merging Mechanics ([LeetCode 617])

In **Tree Superposition**, we overlay two binary trees $T_1$ and $T_2$ starting from their roots:
1. **Both Nodes Present ($u_1 \ne null \land u_2 \ne null$):** The merged node's value is $u_1.val + u_2.val$. Its left child is the merge of $u_1.left$ and $u_2.left$, and its right child is the merge of $u_1.right$ and $u_2.right$.
2. **One Node Present ($u_1 == null \lor u_2 == null$):** The merged node is whichever node is non-null. The entire subtree rooted at that node is grafted into the merged tree.
3. **Both Nodes Null ($u_1 == null \land u_2 == null$):** The merged node is `null`.

```
        Tree 1                    Tree 2                     Merged Tree
         [ 1 ]                     [ 2 ]                        [ 3 ]
        /     \                   /     \                      /     \
     [ 3 ]   [ 2 ]       +     [ 1 ]   [ 3 ]        =       [ 4 ]   [ 5 ]
     /                             \       \                /   \       \
  [ 5 ]                           [ 4 ]   [ 7 ]          [ 5 ] [ 4 ]   [ 7 ]
```

#### In-Place Mutation vs. Immutable Pure Functional Superposition
In an interview, candidates must clarify whether in-place mutation of $T_1$ is permitted:
- **In-Place Mutation:** `root1.val += root2.val; root1.left = Merge(root1.left, root2.left); ... return root1;`.
  - *Warning:* When $u_1 == null$ and $u_2 \ne null$, returning $u_2$ grafts $T_2$'s subtree directly into $T_1$. Any subsequent mutation of $T_2$ mutates $T_1$, violating encapsulation.
- **Pure Functional Allocation:** Allocate a `new TreeNode(root1.val + root2.val)` at every overlapping node, cloning subtrees when only one exists.

---

### 1.2 Subtree Identification & Isomorphism ([LeetCode 572])

Given tree $root$ and tree $subRoot$, does there exist a node $u \in root$ such that the subtree rooted at $u$ is structurally and value-identical to $subRoot$?

```
        root                                  subRoot
        [ 3 ]                                  [ 4 ]
       /     \                                /     \
    [ 4 ]   [ 5 ]                          [ 1 ]   [ 2 ]
   /     \
[ 1 ]   [ 2 ]   <── Matches subRoot!
```

#### Approach 1: Dual-Recursive DFS ($O(M \cdot N)$)
At every node $u$ in $root$, check if $IsSameTree(u, subRoot)$ is true. If not, recurse on $u.left$ and $u.right$:
```csharp
bool IsSubtree(TreeNode root, TreeNode subRoot) {
    if (root == null) return false;
    if (IsSameTree(root, subRoot)) return true;
    return IsSubtree(root.left, subRoot) || IsSubtree(root.right, subRoot);
}
```
- **Worst-Case Trap:** If both trees consist of identical values (e.g., complete binary trees of all `1`s), $IsSameTree$ inspects $O(M)$ nodes for each of the $O(N)$ candidate roots in $root$, deteriorating to $O(N \cdot M)$ time.

#### Approach 2: Linear Serialization + Knuth-Morris-Pratt (KMP) ($O(M + N)$)
If we serialize both trees into strings using preorder traversal with **mandatory delimiters** and **explicit null sentinels**, the problem reduces to string substring search:
$$\text{IsSubtree}(root, subRoot) \iff \text{ContainsSubstring}(\text{Serialize}(root), \text{Serialize}(subRoot))$$
Using KMP or Rabin-Karp rolling hash, substring containment executes in $O(|S| + |T|) = O(N + M)$ time.

---

### 1.3 Subtree Deduplication & The Merkle DAG ([LeetCode 652])

Given the root of a binary tree, return all **duplicate subtrees**. For each kind of duplicate subtree, return the root node of any one of them.

```
              [ 1 ]
             /     \
          [ 2 ]   [ 3 ]
         /       /     \
      [ 4 ]   [ 2 ]   [ 4 ]
             /
          [ 4 ]

Duplicate Subtrees:
1) [ 4 ]                  (Appears 3 times)
2) [ 2 ]                  (Appears 2 times)
  /
[ 4 ]
```

---

## 2. 🔬 Theoretical Foundations & Algorithmic Mechanics

### 2.1 The String Serialization Pitfall: $O(N^2)$ Allocation Proof

A standard solution to [LeetCode 652] performs a postorder DFS, constructing a serialized string representation for each subtree:
```csharp
string Serialize(TreeNode node) {
    if (node == null) return "#";
    string serial = $"{node.val},{Serialize(node.left)},{Serialize(node.right)}";
    // track in Dictionary<string, int>
    return serial;
}
```

#### Mathematical Proof of $O(N^2)$ Time and Space Complexity
Let $N$ be the total number of nodes in the binary tree.
1. **Skewed Degenerate Tree (Worst Case):**
   Consider a tree structured as a linked list of length $N$:
   - The leaf at depth $N$ produces a string of length $O(1)$.
   - Its parent produces a string of length $O(1) + O(1) = O(2)$.
   - Node at depth $k$ produces a string of length $O(N - k)$.
   - The total string characters created across all nodes is:
     $$\sum_{k=1}^{N} k = \frac{N(N + 1)}{2} = \Theta(N^2)$$
   - Allocating and hashing strings of length $k$ takes $\Theta(k)$ time.
   - Total time to construct and hash these strings: $\sum_{k=1}^N \Theta(k) = \Theta(N^2)$.
2. **Balanced Binary Tree:**
   In a balanced tree with $N$ nodes and height $H = \log_2 N$:
   $$T(N) = 2T(N/2) + \Theta(N)$$
   By the Master Theorem ($a = 2, b = 2, f(N) = \Theta(N)$):
   $$T(N) = \Theta(N \log N)$$
   Even in the balanced case, total string allocations require $O(N \log N)$ space, allocating tens of thousands of temporary string objects on the managed heap.

---

### 2.2 Merkle Subtree ID Mapping & Triplet Compression ($O(N)$ Formal Proof)

To break the $O(N^2)$ barrier, we apply **Merkle Tree Triplet Compression** (also known as DAG common subexpression elimination):

```
                       Subtree at Node u
                             [val]
                            /     \
                     [leftID]     [rightID]
                         │           │
                         ▼           ▼
                 Triplet: (val, leftID, rightID)
                               │
                        Hash Map Lookup
                               │
                               ▼
                        Unique Integer ID
```

#### The Triplet Compression Theorem
> **Theorem:** Every binary tree subtree can be uniquely characterized by a 3-tuple:
> $$\tau(u) = \langle u.val, \, ID(u.left), \, ID(u.right) \rangle$$
> where $ID(null) = 0$, and $ID(u) \in \{1, 2, \dots, K\}$ ($K \le N$) is a sequentially assigned integer identifying the unique structural isomorphism class of the subtree rooted at $u$.

#### Complexity Analysis:
1. **Lookup Cost:** Looking up a fixed 3-tuple `(int val, int leftId, int rightId)` in a `Dictionary<(int, int, int), int>` computes the hash of 3 integers in $O(1)$ time.
2. **Time Complexity:** For each of the $N$ nodes, we perform:
   - 2 recursive postorder child lookups: $O(1)$
   - 1 tuple construction and dictionary lookup: $O(1)$
   - Total Time: $\sum_{i=1}^N O(1) = \mathbf{\Theta(N)}$ strictly!
3. **Space Complexity:**
   - Triplet Map: Stores at most $N$ unique triplet keys: $O(N)$.
   - Frequency Map: Stores at most $N$ unique IDs: $O(N)$.
   - Recursion Stack: $O(H)$ where $H \le N$.
   - Total Space: $\mathbf{\Theta(N)}$ strictly, with zero string allocations!

---

### 2.3 ASCII Structural Architecture & Triplet State Diagrams

#### Merkle Triplet ID Assignment Walkthrough
Consider the tree from [LeetCode 652]:

```
              [ 1 ]
             /     \
          [ 2 ]   [ 3 ]
         /       /     \
      [ 4 ]   [ 2 ]   [ 4 ]
             /
          [ 4 ]
```

```
Step 1: Leaf Nodes [4]
  left = null (ID 0), right = null (ID 0), val = 4
  Triplet: (4, 0, 0)
  => Assign ID: 1. Count[1] = 1.

Step 2: Second Leaf [4] (under right [3])
  Triplet: (4, 0, 0)
  => Found in Map! Existing ID: 1. Count[1] = 2.
  => Duplicate Detected! Output root node [4].

Step 3: Third Leaf [4] (under middle [2])
  Triplet: (4, 0, 0)
  => Found in Map! Existing ID: 1. Count[1] = 3.
  => Count > 2, already added to duplicates list. Skip.

Step 4: Subtree [2] -> [4] (left branch)
  val = 2, left = ID 1, right = ID 0
  Triplet: (2, 1, 0)
  => Assign ID: 2. Count[2] = 1.

Step 5: Subtree [2] -> [4] (middle branch)
  val = 2, left = ID 1, right = ID 0
  Triplet: (2, 1, 0)
  => Found in Map! Existing ID: 2. Count[2] = 2.
  => Duplicate Detected! Output root node [2].

Step 6: Subtree [3] -> left [2], right [4]
  val = 3, left = ID 2, right = ID 1
  Triplet: (3, 2, 1)
  => Assign ID: 3. Count[3] = 1.

Step 7: Root [1] -> left [2] (ID 2), right [3] (ID 3)
  val = 1, left = ID 2, right = ID 3
  Triplet: (1, 2, 3)
  => Assign ID: 4. Count[4] = 1.
```

---

## 3. 💻 Production C# Implementations

### 3.1 [LeetCode 617] Merge Two Binary Trees: In-Place vs. Immutable

```csharp
namespace TreeMatchingAndMerging
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

    public static class TreeMerger
    {
        /// <summary>
        /// Approach 1: High-Performance In-Place Mutation.
        /// Reuses root1 nodes where possible, grafting non-overlapping subtrees from root2.
        /// Time Complexity: O(min(N, M)) overlapping nodes visited.
        /// Auxiliary Space: O(min(H1, H2)) call stack frames.
        /// </summary>
        public static TreeNode? MergeTreesInPlace(TreeNode? root1, TreeNode? root2)
        {
            // Base Cases: If either node is null, return the other
            if (root1 == null) return root2;
            if (root2 == null) return root1;

            // In-place value accumulation
            root1.val += root2.val;

            // Recurse on children and link results
            root1.left = MergeTreesInPlace(root1.left, root2.left);
            root1.right = MergeTreesInPlace(root1.right, root2.right);

            return root1;
        }

        /// <summary>
        /// Approach 2: Pure Functional Immutable Merging.
        /// Allocates a completely new tree without mutating or sharing references with inputs.
        /// Essential for multithreaded systems and concurrent AST transformations.
        /// Time Complexity: O(N + M) total nodes.
        /// Auxiliary Space: O(N + M) heap allocations + O(max(H1, H2)) stack frames.
        /// </summary>
        public static TreeNode? MergeTreesImmutable(TreeNode? root1, TreeNode? root2)
        {
            if (root1 == null && root2 == null) return null;

            if (root1 == null) return CloneTree(root2);
            if (root2 == null) return CloneTree(root1);

            TreeNode merged = new TreeNode(root1.val + root2.val)
            {
                left = MergeTreesImmutable(root1.left, root2.left),
                right = MergeTreesImmutable(root1.right, root2.right)
            };

            return merged;
        }

        private static TreeNode? CloneTree(TreeNode? node)
        {
            if (node == null) return null;
            return new TreeNode(node.val)
            {
                left = CloneTree(node.left),
                right = CloneTree(node.right)
            };
        }
    }
}
```

---

### 3.2 [LeetCode 572] Subtree of Another Tree: Dual DFS vs. Serialization + KMP

```csharp
using System;
using System.Text;
using System.Collections.Generic;

namespace TreeMatchingAndMerging
{
    public static class SubtreeMatcher
    {
        // =========================================================================
        // Approach 1: Dual-Recursive DFS (Interview Standard)
        // Time Complexity: O(M * N) worst case, O(M + N) average on non-uniform trees.
        // Auxiliary Space: O(H_root) call stack.
        // =========================================================================
        public static bool IsSubtreeDfs(TreeNode? root, TreeNode? subRoot)
        {
            if (root == null) return false;

            // Check if current subtree matches
            if (IsSameTree(root, subRoot)) return true;

            // Recurse left or right
            return IsSubtreeDfs(root.left, subRoot) || IsSubtreeDfs(root.right, subRoot);
        }

        private static bool IsSameTree(TreeNode? p, TreeNode? q)
        {
            if (p == null && q == null) return true;
            if (p == null || q == null) return false;
            if (p.val != q.val) return false;

            return IsSameTree(p.left, q.left) && IsSameTree(p.right, q.right);
        }

        // =========================================================================
        // Approach 2: Linear Serialization + Knuth-Morris-Pratt (KMP)
        // Time Complexity: O(M + N) strictly linear!
        // Auxiliary Space: O(M + N) for serialized strings and KMP prefix table.
        // =========================================================================
        public static bool IsSubtreeKmp(TreeNode? root, TreeNode? subRoot)
        {
            if (subRoot == null) return true;
            if (root == null) return false;

            // Step 1: Serialize both trees into unique string representations
            // Using comma delimiters and '#' null tokens to prevent ambiguity
            StringBuilder sbRoot = new StringBuilder();
            SerializePreorder(root, sbRoot);
            string sText = sbRoot.ToString();

            StringBuilder sbSub = new StringBuilder();
            SerializePreorder(subRoot, sbSub);
            string sPattern = sbSub.ToString();

            // Step 2: Run KMP Pattern Matching
            return KmpSearch(sText, sPattern);
        }

        private static void SerializePreorder(TreeNode? node, StringBuilder sb)
        {
            if (node == null)
            {
                sb.Append(",#");
                return;
            }

            sb.Append(',').Append(node.val);
            SerializePreorder(node.left, sb);
            SerializePreorder(node.right, sb);
        }

        private static bool KmpSearch(string text, string pattern)
        {
            int n = text.Length;
            int m = pattern.Length;
            if (m == 0) return true;
            if (n < m) return false;

            // Build KMP Longest Proper Prefix which is Suffix (LPS) table
            int[] lps = BuildLps(pattern);

            int i = 0; // index for text
            int j = 0; // index for pattern

            while (i < n)
            {
                if (text[i] == pattern[j])
                {
                    i++;
                    j++;
                    if (j == m) return true; // Match found!
                }
                else
                {
                    if (j != 0)
                    {
                        j = lps[j - 1];
                    }
                    else
                    {
                        i++;
                    }
                }
            }

            return false;
        }

        private static int[] BuildLps(string pattern)
        {
            int m = pattern.Length;
            int[] lps = new int[m];
            int len = 0;
            int i = 1;

            while (i < m)
            {
                if (pattern[i] == pattern[len])
                {
                    len++;
                    lps[i] = len;
                    i++;
                }
                else
                {
                    if (len != 0)
                    {
                        len = lps[len - 1];
                    }
                    else
                    {
                        lps[i] = 0;
                        i++;
                    }
                }
            }

            return lps;
        }
    }
}
```

---

### 3.3 [LeetCode 652] Find Duplicate Subtrees: The $O(N^2)$ Trap vs. Optimal $O(N)$ Triplet Hashing

```csharp
using System;
using System.Collections.Generic;

namespace TreeMatchingAndMerging
{
    public static class DuplicateSubtreeFinder
    {
        // =========================================================================
        // Approach 1: Postorder String Serialization (Naive Baseline)
        // Time Complexity: O(N^2) on skewed trees due to string concatenation.
        // Auxiliary Space: O(N^2) memory footprint on Gen 0 GC heap.
        // =========================================================================
        public static IList<TreeNode> FindDuplicateSubtreesNaive(TreeNode? root)
        {
            List<TreeNode> duplicates = new List<TreeNode>();
            Dictionary<string, int> serializationCounts = new Dictionary<string, int>();

            PostorderSerialize(root, serializationCounts, duplicates);
            return duplicates;
        }

        private static string PostorderSerialize(
            TreeNode? node, 
            Dictionary<string, int> counts, 
            List<TreeNode> duplicates)
        {
            if (node == null) return "#";

            // Incurring string allocations at every node!
            string leftSerial = PostorderSerialize(node.left, counts, duplicates);
            string rightSerial = PostorderSerialize(node.right, counts, duplicates);
            string serial = $"{node.val},{leftSerial},{rightSerial}";

            counts.TryGetValue(serial, out int count);
            counts[serial] = count + 1;

            if (count == 1) // Add exactly once when frequency reaches 2
            {
                duplicates.Add(node);
            }

            return serial;
        }

        // =========================================================================
        // Approach 2: Optimal Merkle Triplet ID Compression (Production / Big Tech)
        // Replaces string serialization with unique integer ID mapping.
        // Time Complexity: Strictly O(N) — fixed-size 3-integer hash operations.
        // Auxiliary Space: Strictly O(N) — zero heap string allocations.
        // =========================================================================
        public static IList<TreeNode> FindDuplicateSubtreesOptimal(TreeNode? root)
        {
            List<TreeNode> duplicates = new List<TreeNode>();
            
            // Maps (nodeVal, leftSubtreeId, rightSubtreeId) -> uniqueSubtreeId
            Dictionary<(int val, int leftId, int rightId), int> tripletToId = 
                new Dictionary<(int val, int leftId, int rightId), int>();

            // Maps uniqueSubtreeId -> frequency count
            Dictionary<int, int> idFrequencies = new Dictionary<int, int>();

            int nextId = 1;

            int AssignSubtreeId(TreeNode? node)
            {
                if (node == null) return 0; // Null sentinel is always ID 0

                int leftId = AssignSubtreeId(node.left);
                int rightId = AssignSubtreeId(node.right);

                var triplet = (node.val, leftId, rightId);

                if (!tripletToId.TryGetValue(triplet, out int currentId))
                {
                    currentId = nextId++;
                    tripletToId[triplet] = currentId;
                }

                idFrequencies.TryGetValue(currentId, out int freq);
                idFrequencies[currentId] = freq + 1;

                // Add to result exactly on the 2nd occurrence
                if (freq == 1)
                {
                    duplicates.Add(node);
                }

                return currentId;
            }

            AssignSubtreeId(root);
            return duplicates;
        }
    }
}
```

---

## 4. ⚙️ Systems-Level Mechanics & Hardware Interactions

### 4.1 CLR String Interning, Heap Fragmentation & The 85KB LOH Boundary

In .NET, understanding why the naive string approach fails at scale requires inspecting the Common Language Runtime (CLR) memory model:

```
Managed Heap (Gen 0 / Gen 1 / Gen 2 / LOH)
┌────────────────────────────────────────────────────────────────────────┐
│ Small Object Heap (SOH - Gen 0):                                       │
│ [String: "4,#,#"] [String: "2,4,#,#,#"] [String: "1,2,4,#,#,#,3..."]   │
│ ──> Thousands of ephemeral strings trigger frequent Gen 0 GC sweeps!   │
├────────────────────────────────────────────────────────────────────────┤
│ Large Object Heap (LOH - >= 85,000 bytes):                             │
│ If tree depth >= 20,000, serialized string exceeds 85KB threshold!     │
│ ──> Allocated directly to LOH! LOH is NOT compacted by default!        │
│ ──> Causes severe memory fragmentation and OutOfMemoryException!       │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Temporary String Churn:** Every node in naive serialization calls `$"{val},{left},{right}"`. A tree of $100,000$ nodes instantiates $100,000$ intermediate `string` objects and internal string buffers.
2. **The 85,000 Byte Large Object Heap (LOH) Boundary:** In .NET, objects $\ge 85,000$ bytes bypass Generations 0, 1, and 2, landing directly on the Large Object Heap. For skewed trees, serialized strings at higher levels exceed 85KB. The LOH does not compact automatically during standard GC cycles; repeated allocations cause heap fragmentation and out-of-memory crashes.
3. **Triplet ValueTuples on the Stack:** The optimal approach uses `(int val, int leftId, int rightId)`. This is a C# `ValueTuple<int, int, int>`, a 12-byte contiguous struct allocated directly on the thread call stack without GC involvement.

---

### 4.2 Structural Sharing & Common Subexpression Elimination (CSE)

The Merkle Triplet compression in [LeetCode 652] is the foundational algorithm behind **Common Subexpression Elimination (CSE)** in production optimizing compilers (such as Microsoft's Roslyn C# compiler and LLVM):

```
Expression:   (a + b) * (a + b)

       Tree AST:                        Deduplicated DAG:
          [*]                                  [*]
        /     \                               /   \
      [+]     [+]              ====>         [+]───┘ (Self-Loop)
     /   \   /   \                          /   \
    a     b a     b                        a     b
```

By assigning integer IDs to subtrees, the compiler converts an Abstract Syntax Tree (AST) into a **Directed Acyclic Graph (DAG)**. Identical subtrees share the exact same ID, allowing the compiler to evaluate `(a + b)` once into a CPU register and reuse it for both operand branches.

---

### 4.3 Git Tree Objects & Merkle DAG Content-Addressable Storage

In the Git version control system, directories and subdirectories are represented as a **Merkle Tree**:

```
Git Commit Tree
└── Root Tree Object: Hash = "a8f3b..."
    ├── "src" -> Subtree Object: Hash = "4e12c..."
    │   ├── "main.cs" -> Blob: Hash = "b901a..."
    │   └── "util.cs" -> Blob: Hash = "c782d..."
    └── "README.md" -> Blob: Hash = "99f0e..."
```

- When a file in `src/` changes, only `src` and the root tree object recompute their SHA-1/SHA-256 hashes.
- If two directories across different repositories or branches contain identical files, their Merkle hashes match identically. Git instantly detects subtree equality in $O(1)$ time by comparing 20-byte hash digests.

---

## 5. 🧩 Canonical LeetCode Pattern Walkthroughs & Deep Dives

### 5.1 [LeetCode 617] Merge Two Binary Trees: Recursive Trace

#### Input:
```
Tree 1:       [ 1 ]               Tree 2:       [ 2 ]
             /     \                           /     \
          [ 3 ]   [ 2 ]                     [ 1 ]   [ 3 ]
          /                                     \       \
       [ 5 ]                                   [ 4 ]   [ 7 ]
```

#### Execution Trace Table:

| Call Step | Node 1 | Node 2 | Condition | Action Taken | Resulting Node |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `1` | `2` | Both non-null | `val = 1 + 2 = 3`; recurse Left & Right | Node(3) |
| **2 (Left)** | `3` | `1` | Both non-null | `val = 3 + 1 = 4`; recurse Left & Right | Node(4) |
| **3 (L -> L)**| `5` | `null` | Node 2 is null | Return Node 1 (`5`) | Node(5) |
| **4 (L -> R)**| `null`| `4` | Node 1 is null | Return Node 2 (`4`) | Node(4) |
| **5 (Right)**| `2` | `3` | Both non-null | `val = 2 + 3 = 5`; recurse Left & Right | Node(5) |
| **6 (R -> L)**| `null`| `null` | Both null | Return `null` | `null` |
| **7 (R -> R)**| `null`| `7` | Node 1 is null | Return Node 2 (`7`) | Node(7) |

#### Final Merged Tree:
```
         [ 3 ]
        /     \
     [ 4 ]   [ 5 ]
    /     \       \
 [ 5 ]   [ 4 ]   [ 7 ]
```

---

### 5.2 [LeetCode 572] Subtree of Another Tree: The Preorder Substring Bug

Consider why delimiter tokens and null sentinels are strictly required when reducing subtree matching to substring search:

#### Counterexample 1: Missing Null Sentinels
```
Tree A:      [ 2 ]                   Tree B:      [ 2 ]
            /                                        \
         [ 1 ]                                      [ 1 ]
```
- Preorder values of A: `[2, 1]`
- Preorder values of B: `[2, 1]`
- Without null markers, string `2,1` matches string `2,1`, falsely concluding Tree B is a subtree of Tree A!
- With null markers:
  - Tree A preorder: `2, 1, #, #, #`
  - Tree B preorder: `2, #, 1, #, #`
  - The strings differ; false positive avoided!

#### Counterexample 2: Missing Delimiters
```
Tree A: Root = [ 12 ]
Tree B: Root = [ 1 ], Left = [ 2 ]
```
- Without delimiters: Tree A serializes to `"12"`, Tree B serializes to `"12"`.
- Match detected falsely!
- With comma delimiters: Tree A is `",12,#,#"`, Tree B is `",1,2,#,#,#"` $\implies$ No match!

---

### 5.3 [LeetCode 652] Find Duplicate Subtrees: Triplet ID Mapping Trace

#### Tree Structure:
```
           [ 0 ]
          /     \
       [ 0 ]   [ 0 ]
      /             \
   [ 0 ]           [ 0 ]
```

#### Triplet Assignment Trace:

| Traversal Order | Node Visited | Left ID | Right ID | Triplet `(val, leftId, rightId)` | Assigned / Looked Up ID | ID Count | Is Duplicate? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Leaf `[0]` (L-L) | `0` | `0` | `(0, 0, 0)` | **ID 1** (New) | 1 | No |
| **2** | Node `[0]` (L) | `1` | `0` | `(0, 1, 0)` | **ID 2** (New) | 1 | No |
| **3** | Leaf `[0]` (R-R) | `0` | `0` | `(0, 0, 0)` | **ID 1** (Existing) | 2 | **YES (Duplicate Leaf [0])** |
| **4** | Node `[0]` (R) | `0` | `1` | `(0, 0, 1)` | **ID 3** (New) | 1 | No |
| **5** | Root `[0]` | `2` | `3` | `(0, 2, 3)` | **ID 4** (New) | 1 | No |

**Duplicates Output:** Exactly one reference to leaf `TreeNode(0)`.
Notice that `Node(0, left=1, right=0)` has ID 2, while `Node(0, left=0, right=1)` has ID 3. Even though both have value 0 and one child 0, their structural asymmetry is strictly preserved!

---

## 6. ⚠️ Real-World Engineering Failure Modes & Post-Mortems

### Failure Mode 1: The Shared Reference Mutation Bug (Grafting Without Cloning)
- **Production Incident:** A financial ledger calculation engine merged daily transaction trees using in-place grafting (`MergeTreesInPlace`). An asynchronous background worker subsequently modified transaction balances in yesterday's tree $T_2$.
- **Root Cause:** In-place merging linked $T_1$'s child pointer directly to $T_2$'s node memory address. Mutating $T_2$ silently corrupted $T_1$'s calculated totals, triggering non-deterministic audit discrepancies.
- **Remedy:** In concurrent or multi-threaded pipelines, use immutable tree merging (`MergeTreesImmutable`) that deeply clones overlapping subtrees.

---

### Failure Mode 2: 32-Bit Hash Collisions in Merkle Subtree Deduplication
- **Production Incident:** A distributed build system used 32-bit `int.GetHashCode()` to hash compiler AST subtrees for artifact caching. Over a multi-million-node codebase, two distinct C# syntax trees produced the exact same 32-bit integer hash (Birthday Paradox collision threshold: $\sqrt{2^{32}} \approx 65,536$ unique subtrees).
- **Consequence:** The compiler skipped compiling an updated function, serving stale binary bytecode and resulting in production crashes.
- **Remedy:** Never rely on 32-bit hashes for Merkle node equivalence. Use cryptographic 128-bit MurmurHash3, BLAKE3, or 256-bit SHA-256 digests, or verify structural equality upon hash match.

---

### Failure Mode 3: OutOfMemoryException from String Serialization Concatenation
- **Production Incident:** An enterprise workflow engine serialized JSON rule trees to detect duplicate sub-processes using naive postorder string concatenation. On deeply nested workflows ($D \approx 15,000$), the service crashed with `System.OutOfMemoryException`.
- **Memory Profiler Trace:** The Gen 0 GC heap was allocated 4.2 GB of temporary string segments within 800ms, and the Large Object Heap contained 1,400 uncollected pinned string buffers exceeding 85KB.
- **Remedy:** Migrated to Merkle Triplet ID mapping with `ValueTuple<int, int, int>`. Memory allocation dropped by 99.8%, and GC execution time plummeted to near zero.

---

### Failure Mode 4: Call Stack Overflow on Skewed Trees ($N = 100,000$)
- **Root Cause:** Both dual DFS subtree matching and recursive serialization rely on the execution call stack. On a skewed binary tree of $100,000$ nodes, the call stack exceeds the default 1MB thread stack limit on 64-bit Windows / Linux (`StackOverflowException`).
- **Remedy:** For production systems processing untrusted tree depths, execute traversals using an explicit heap-allocated `Stack<TreeNode>` or increase thread stack limits using `new Thread(action, stackSize)`.

---

## 7. 🧪 Verification, Diagnostic Drills & Conceptual Checkpoints

### Edge Cases Test Suite

| Test Case ID | Tree 1 ($S$) | Tree 2 ($T$) | Expected Behavior | Critical Gotcha |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | `null` | `null` | Merge: `null`; IsSubtree: `true` | Both trees completely empty. |
| **TC-02** | `[1]` | `[1, 2]` | IsSubtree: `false` | Subtree cannot be larger than main tree. |
| **TC-03** | Skewed `1->2->3` | Skewed `1->2->3` | Identical trees; Duplicate count = 1 each | Linear depth test for stack safety. |
| **TC-04** | `[2]` | `[2, null, 1]` vs `[2, 1]` | Structural distinction | Asymmetric child positioning must produce different IDs. |
| **TC-05** | Negative values `[-10]` | `[-10]` | Must match correctly | String delimiters must not confuse `-` with delimiter. |

---

### Diagnostic Checkpoint Questions

#### Checkpoint 1: The String Delimiter Mandate
**Question:** In [LeetCode 572], why does preorder tree serialization require both null tokens (`#`) and delimiter tokens (`,`)? Provide a concrete counterexample demonstrating failure when delimiters are omitted.
<details>
<summary><b>View Architectural Answer</b></summary>

Without delimiters, multi-digit values lose their token boundaries. For example, Tree A with root `12` serializes to `"12##"`. Tree B with root `1` and left child `2` serializes to `"12##"`. A string substring check will find `"12##"` inside `"12##"`, falsely reporting Tree B as a subtree of Tree A. 

Without null tokens, structural topology is lost: a root with left child `1` produces preorder `"2,1"`, which is identical to a root with right child `1` producing preorder `"2,1"`. Therefore, both explicit null tokens and delimiters are mathematically necessary for injective serialization.
</details>

---

#### Checkpoint 2: The Merkle Triplet ID Collision Probability
**Question:** In [LeetCode 652], why is the Merkle Triplet ID mapping guaranteed to never produce false positive duplicate matches, unlike 32-bit rolling hashes?
<details>
<summary><b>View Architectural Answer</b></summary>

The Merkle Triplet ID mapping uses a `Dictionary<(int val, int leftId, int rightId), int>`. It does not rely on lossy hash compression; instead, the dictionary uses exact equality comparison (`IEqualityComparer`) on the 3-tuple `(val, leftId, rightId)`. 

Because base null nodes are deterministically assigned `ID 0`, and any new unique triplet is assigned a sequentially incremented integer (`nextId++`), there are zero collisions by mathematical construction. Every unique isomorphism class receives a globally unique integer ID.
</details>

---

#### Checkpoint 3: In-Place Merging Reference Entanglement
**Question:** In [LeetCode 617], what is the architectural danger of writing `if (root1 == null) return root2;` when performing an in-place merge?
<details>
<summary><b>View Architectural Answer</b></summary>

Returning `root2` directly attaches a reference to a subtree allocated for Tree 2 into Tree 1's hierarchy. This creates **aliasing (shared mutable state)**:
1. If the caller subsequently mutates, prunes, or disposes Tree 2, Tree 1 is silently corrupted.
2. In garbage-collected runtimes like .NET, Tree 2 cannot be collected by the GC as long as Tree 1 remains referenced.
3. In multi-threaded environments, reading Tree 1 while Tree 2 is being written causes data races.
</details>

---

#### Checkpoint 4: KMP Preprocessing vs. Dual DFS Trade-off
**Question:** In [LeetCode 572], when is Dual-Recursive DFS strictly preferred over KMP Substring Matching in production systems?
<details>
<summary><b>View Architectural Answer</b></summary>

Dual-Recursive DFS is strictly preferred when:
1. **Memory is constrained:** Dual DFS uses $O(H)$ auxiliary stack space, whereas KMP requires $O(M + N)$ heap space to serialize and store both trees as strings or integer arrays.
2. **Early exit is common:** On real-world non-adversarial trees with diverse node values, Dual DFS rejects mismatched candidates at the root in $O(1)$ operations, running in $O(N)$ average time without serializing the entire tree upfront.
3. **Trees are large and unbalanced:** Serializing a 10,000,000-node tree requires hundreds of megabytes of string memory; Dual DFS can find a match or fail early with zero heap allocations.
</details>

---

### Daily Mastery Checklist
- [x] Mastered tree superposition in [LeetCode 617] with both in-place mutation and immutable functional cloning.
- [x] Analyzed subtree isomorphism in [LeetCode 572] using dual DFS ($O(M \cdot N)$) and KMP serialization ($O(M + N)$).
- [x] Proven why naive string concatenation causes an $O(N^2)$ memory explosion in [LeetCode 652].
- [x] Implemented optimal $O(N)$ Merkle Triplet ID compression, eliminating heap string allocations.
- [x] Connected subtree deduplication to Common Subexpression Elimination (CSE) in compilers and Merkle DAGs in Git.
