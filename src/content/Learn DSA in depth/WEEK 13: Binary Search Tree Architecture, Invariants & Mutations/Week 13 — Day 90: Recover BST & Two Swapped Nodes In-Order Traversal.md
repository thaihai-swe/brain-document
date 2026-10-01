---
title: "Week 13 — Day 90: Recover BST & Two Swapped Nodes In-Order Traversal"
---

# Week 13 — Day 90: Recover BST & Two Swapped Nodes In-Order Traversal

Welcome to **Day 90 of your DSA Mastery Journey**!

Yesterday in [Day 89](./Week%2013%20%E2%80%94%20Day%2089:%20Lowest%20Common%20Ancestor%20&%20Two%20Sum%20in%20BST.md), we mastered the BST split point principle for $O(1)$-space LCA and engineered dual-iterator two-pointer convergence.

Today, we tackle **BST Structural Corruption, Inversion Identification & Full Rebalancing**:
1. **The Two-Swapped-Nodes Inversion Theorem ([LeetCode 99]):** Identifying and repairing two swapped node values in an corrupted BST. We prove why adjacent swaps generate exactly one inversion ($A[i] > A[i+1]$) while non-adjacent swaps generate exactly two inversions ($A[i] > A[i+1]$ and $A[j] > A[j+1]$).
2. **The $O(1)$ Auxiliary Space Mandate:** Solving BST recovery in strictly **$O(1)$ auxiliary space** using **Morris Threaded Traversal**, avoiding all recursion stacks and flat array allocations.
3. **Complete Tree Rebalancing ([LeetCode 1382]):** Flattening an arbitrary degenerate skewed BST into a sorted sequence in-place, then reconstructing an optimally balanced AVL tree ($H = \lceil \log_2 (N + 1) \rceil$) in strictly $\Theta(N)$ time.
4. **Systems Architecture:** Database index corruption detection and repair tools (PostgreSQL `amcheck` B-Tree validation) and hardware-level memory preservation.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 90 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: RECOVER BST         │                                     │    PART II: BST REBALANCING     │
│   Two-Inversion Identification  │                                     │   Flattening & Median Rebuild   │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • LC 99: Recover BST            │                                     │ • LC 1382: Balance a BST        │
│ • In-Order Monotonicity Invert  │                                     │ • Degenerate O(N) Skew Recovery │
│ • Inversion 1: first = prev     │                                     │ • Pass 1: In-Order to List O(N) │
│ • Inversion 2: second = curr    │                                     │ • Pass 2: Median Partition O(N) │
│ • Morris Threading: O(1) Memory │                                     │ • Guarantees AVL Height Balance │
│ • Swap first.val <-> second.val │                                     │ • Zero Rotations Needed!        │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:*
    - **Recover BST:** Given the root of a BST where the values of exactly two nodes were swapped by mistake, recover the tree without changing its structure.
    - **Balance BST:** Given an arbitrary BST, return a height-balanced BST containing the exact same values.
  - *Core Invariants:*
    1. **In-Order Monotonicity Violation Invariant:** In a sorted sequence where two elements $x < y$ have their positions swapped ($y$ appears before $x$), the element $y$ is abnormally larger than its successor, creating the **first inversion** ($prev.val > curr.val$). The element $x$ is abnormally smaller than its predecessor, creating the **second inversion** (or coinciding with the first if adjacent).
    2. **Swapped Node Identity Rule:**
       - The first corrupted node is always the **larger element of the first inversion** (`first = prev`).
       - The second corrupted node is always the **smaller element of the last inversion** (`second = curr`).
    3. **Morris Invariant:** During Morris traversal, every threaded edge (`pred.right = curr`) created during the descent must be severed (`pred.right = null`) upon the second visit, restoring the tree's original topology before termination.
  - *Misconception Check:* A common error in [LeetCode 99] is assuming there are always two distinct inversions. When two swapped nodes are **adjacent in in-order order** (e.g. `[1, 3, 2, 4]`), there is only **one** inversion (`3 > 2`). If the candidate only updates `second` on the second inversion, `second` remains `null`. The correct invariant initializes `second = curr` on the very first inversion, and then overwrites `second = curr` if a second inversion occurs!
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the memory cost of copying all tree elements into an auxiliary array, sorting the array, and rewriting values ($O(N)$ extra space).
  - *Complexity Advantage:* Identifies and swaps the two corrupted nodes in $\Theta(N)$ time and strictly **$O(1)$ auxiliary space** using Morris traversal.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Corrupted index repair, detecting silent bit-flips or bad memory writes in memory-resident trees, or converting unbalanced search trees into balanced ones.
  - *When to Avoid / Failure Modes:* If more than two nodes are misplaced, the two-inversion theorem does not apply; full in-order reconstruction or permutation cycle decomposition is required.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Morris traversal temporarily writes to the `right` pointer of in-order predecessor nodes on the managed heap. It uses 0 bytes of call stack memory and 0 bytes of heap allocation, making it safe for trees of depth $N > 100,000$.
  - *Production Systems:* Database index integrity checkers (e.g. PostgreSQL `amcheck`, SQLite `PRAGMA integrity_check`), which detect B-Tree ordering violations caused by disk page corruption or buggy comparator functions.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To recover a BST with two swapped nodes, I perform an in-order traversal tracking the previous node. A valid BST must be strictly increasing. When an inversion occurs where prev.val is greater than curr.val, the first swapped node is always prev. The second swapped node is curr. If a second inversion occurs later, second is updated to the new curr. For an O(1) space solution, I use Morris traversal, which creates temporary threads from predecessors to ancestors, allowing us to find and swap the two corrupted values without any stack or heap memory."
  - *Interviewer Evaluation Lens:* Assesses whether the candidate understands the inversion math (adjacent vs non-adjacent cases), knows how to handle the single-inversion edge case, and demonstrates mastery of $O(1)$-space Morris traversal.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:*
    - Recover BST ([LC 99]): Time: $\Theta(N)$; Auxiliary Space: Strictly $O(1)$ via Morris Traversal.
    - Balance BST ([LC 1382]): Time: $\Theta(N)$; Auxiliary Space: $O(N)$ for intermediate list.
  - *State Transition Trace (Non-adjacent swap on `[3, 1, 4, null, null, 2]`):*
    - In-order: `[1, 3, 2, 4]` (Nodes 3 and 2 swapped).
    - `prev=1, curr=3`: Valid ($1 < 3$).
    - `prev=3, curr=2`: Inversion! `first = prev (3)`, `second = curr (2)`.
    - `prev=2, curr=4`: Valid ($2 < 4$).
    - End of traversal. Swap `first.val (3)` and `second.val (2)`. Tree recovered!

---

### 1.1 Physical Mental Model — The School Parade Lineup & Temporary Vine Bridges

**Analogy 1 — Spotting Two Swapped Students in a Parade Line**

Imagine children lined up for a school photo in strictly ascending height order. Exactly two mischievous students swapped places:

```
Normal Lineup (Ascending):  1,  2,  3,  4,  5,  6,  7

Non-Adjacent Swap (Students 2 and 6 swapped):
  Lineup:  1, [ 6 ],  3,   4,   5, [ 2 ],  7
               ▲  ▲                 ▲  ▲
              (6 > 3)              (5 > 2)
            Bump 1: TALL KID     Bump 2: SHORT KID
```

**The Inspection Walk (In-Order Traversal):**
- As you walk along the line comparing each child with the previous child (`prev > curr`):
  - **First Drop (`prev > curr`):** You catch the unusually **TALL kid** who jumped ahead into the front of the line! $\implies \text{first} = prev$.
  - **Second Drop (`prev > curr`):** You catch the unusually **SHORT kid** who was pushed to the back of the line! $\implies \text{second} = curr$.
- **Adjacent Swap Edge Case (Students 2 and 3 swapped: `[ 1, 3, 2, 4 ]`):**
  - There is only **one** drop in the entire line (`3 > 2`)!
  - Therefore, at the very first drop, always tentatively record:
    $\text{first} = prev$ (3) and $\text{second} = curr$ (2).
  - If a second drop never appears, `second` is already correct!

---

**Analogy 2 — Morris Traversal: The Temporary Return Vine**

To inspect the tree in-order without using recursion or stack memory ($O(1)$ space):
- Before you step down into your left child, you walk to the rightmost leaf of that left subtree (your in-order predecessor).
- You tie a **temporary vine** from that leaf pointing back up to yourself (`pred.right = curr`).
- You explore the left subtree normally.
- When that left subtree finishes, it naturally walks across the vine, popping right back up to you!
- You arrive back at your node, **sever the vine** (`pred.right = null`), print your node, and proceed to the right child.

```
Morris Threading Step:
       [ curr: 2 ]
      /           ▲ (Temporary vine tied up to 2)
   [ 1 ]          │
      \           │
     [ pred ] ────┘ (pred.right = curr)
```

Zero stack frames! Zero heap allocations! The tree is temporarily modified and completely restored.

---

### 1.2 Structural BST Corruption: The Two-Swapped-Nodes Inversion Theorem

In a valid BST, an in-order traversal yields a strictly increasing sequence:
$$S_{\text{valid}} = [1, 2, 3, 4, 5, 6, 7]$$

Suppose exactly two elements $x$ and $y$ (with $x < y$) are swapped:
- Before swap: $\dots x \dots y \dots$
- After swap: $\dots y \dots x \dots$

There are exactly two structural cases:

```
Case 1: Non-Adjacent Swap (x = 2, y = 6 swapped)
In-Order: [ 1,  6,  3,  4,  5,  2,  7 ]
                ▲   ▲           ▲   ▲
               (6 > 3)         (5 > 2)
             Inversion 1     Inversion 2
             first = 6       second = 2
             (prev node)     (curr node)

Case 2: Adjacent Swap (x = 3, y = 4 swapped)
In-Order: [ 1,  2,  4,  3,  5,  6,  7 ]
                    ▲   ▲
                   (4 > 3)
                 Inversion 1 (Only One Inversion!)
                 first = 4, second = 3
                 (prev)     (curr)
```

#### The Universal Assignment Rule:
1. **At Inversion 1 ($prev.val > curr.val$ and `first == null`):**
   - `first = prev;` (The abnormally large element that was swapped forward).
   - `second = curr;` (Tentatively assume the swap was adjacent!).
2. **At Inversion 2 ($prev.val > curr.val$ and `first != null`):**
   - `second = curr;` (The abnormally small element that was swapped backward).

By setting `second = curr` on the first inversion, **both adjacent and non-adjacent cases are solved with identical code!**

---

### 1.2 The $O(1)$ Auxiliary Space Mandate: Morris Threading Integration

Standard recursive or stack-based in-order traversal consumes $O(H)$ memory, which degrades to $O(N)$ on skewed trees.
To achieve strictly **$O(1)$ auxiliary space**, we embed our inversion-tracking pointers into **Morris In-Order Traversal**:

```
Morris Threading Mechanics:
1. If curr.left == null:
   - Visit curr (Check inversion with prev).
   - curr = curr.right.
2. If curr.left != null:
   - Find in-order predecessor: pred = curr.left; while (pred.right != null && pred.right != curr) pred = pred.right;
   - If pred.right == null:
       pred.right = curr;  // Establish thread!
       curr = curr.left;
   - If pred.right == curr:
       pred.right = null;  // Sever thread (restore tree)!
       Visit curr (Check inversion with prev).
       curr = curr.right;
```

---

### 1.3 ⚙️ Core Operations Deep-Dive: Two-Swapped-Nodes Morris Inversion Repair

#### Dimension 1: Operation Contract & Big-O Bounds

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           BST RECOVERY & INVERSION CONTRACT SPECIFICATION                         │
├───────────────┬───────────────────────────────┬───────────────────────────────────┬───────────────┤
│ OPERATION     │ PRECONDITIONS                 │ POSTCONDITIONS / GUARANTEES       │ TIME & SPACE  │
├───────────────┼───────────────────────────────┼───────────────────────────────────┼───────────────┤
│ RecoverTree   │ Valid BST structure except    │ In-place value swap of the two    │ Time: Θ(N)    │
│ (Morris O(1)) │ exactly 2 nodes swapped keys  │ inverted nodes; BST 100% restored.│ Space: Θ(1)   │
├───────────────┼───────────────────────────────┼───────────────────────────────────┼───────────────┤
│ BalanceBST    │ Arbitrary valid BST (may be   │ Returns new AVL height-balanced   │ Time: Θ(N)    │
│               │ degenerate skewed line)       │ BST with optimal depth ceil(log2N)│ Space: O(N)   │
└───────────────┴───────────────────────────────┴───────────────────────────────────┴───────────────┘
```

- **Time Complexity Bounds:**
  - *Morris Traversal:* Every edge in the tree is traversed at most 3 times (once downward to explore, once downward to build predecessor thread, once upward via thread and sever) $\implies \Theta(N)$ optimal time.
  - *Value Swap:* $\Theta(1)$ constant time primitive.
- **Space Complexity:** Strictly $\Theta(1)$ auxiliary space. Eliminates the $O(H)$ recursion stack frames and $O(N)$ auxiliary array allocations completely.

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                       ┌─────────────────────────┐
                       │   MORRIS TRAVERSAL STEP │
                       └────────────┬────────────┘
                                    │
                            curr.left == null ?
                                    │
                 ┌──────────────────┴──────────────────┐
                 ▼ (YES: No Left Branch)               ▼ (NO: Thread Predecessor)
            Evaluate Inversion(prev, curr)        pred = FindPredecessor(curr)
            prev = curr                           pred.right == null ?
            curr = curr.right                              │
                                                  ┌────────┴────────┐
                                                  ▼ (YES)           ▼ (NO: Thread Exists)
                                            pred.right = curr  pred.right = null (SEVER)
                                            curr = curr.left   Evaluate Inversion(prev, curr)
                                                               prev = curr
                                                               curr = curr.right
```

1. **Unified Inversion Detection State Machine:**
   - Define macro `ProcessNode(curr)`:
     - If `prev != null && prev.val > curr.val`:
       - If `first == null`: assign `first = prev` and `second = curr` (optimistic adjacent assignment).
       - Else: assign `second = curr` (overwrites second with non-adjacent discrepancy).
     - Update: `prev = curr`.
   - **Step 1 (Descent / Threading):** While `curr != null`:
     - If `curr.left == null`: call `ProcessNode(curr)`; set `curr = curr.right`.
     - Else:
       - Find predecessor `pred = curr.left; while (pred.right != null && pred.right != curr) pred = pred.right;`
       - If `pred.right == null`: establish thread `pred.right = curr`; advance `curr = curr.left`.
       - Else: sever thread `pred.right = null`; call `ProcessNode(curr)`; advance `curr = curr.right`.
   - **Step 2 (Repair):** Swap values: `(first.val, second.val) = (second.val, first.val)`.

---

#### Dimension 3: Visual ASCII State Transitions (Morris Threading & Repair)

```
SCENARIO: BST with 1 and 3 Swapped: In-Order Sequence = [ 3, 2, 1 ]

STEP 1: MORRIS THREAD ESTABLISHMENT
        [ 1 ]* (Stored val=3)
       /
    [ 2 ]
   /
 [ 3 ]* (Stored val=1)
 Predecessors threaded back to ancestors: Leaf threads upward to 2, 2 threads to 1.

STEP 2: IN-ORDER VISIT & INVERSION IDENTIFICATION
   Visit 1: Node with val 3. prev = [3].
   Visit 2: Node with val 2.
            Check: prev (3) > curr (2)? YES! ===> INVERSION 1 DETECTED!
            Assignment: first = [3], second = [2].
            prev = [2].
   Visit 3: Node with val 1.
            Check: prev (2) > curr (1)? YES! ===> INVERSION 2 DETECTED!
            Assignment: second = [1] (Updated!).
            prev = [1].

STEP 3: POST-TRAVERSAL IN-PLACE VALUE SWAP
   All temporary threads are severed (pred.right = null).
   Swap: first.val (3) <===> second.val (1):
   Tree keys restored to strictly ascending order [ 1, 2, 3 ] in O(1) space!
```

---

#### Dimension 4: Invariant Preservation Proof

**Theorem (Inversion Classification & Morris Completeness):**
Any single transposition of two keys in a strictly sorted array produces either exactly one adjacent inversion or exactly two non-adjacent inversions, and Morris traversal visits the sequence in identical order to recursive in-order DFS without structural alteration.

*Proof:*
1. **Transposition Inversion Count:**
   Let $A = \langle a_1, a_2, \dots, a_n \rangle$ be strictly increasing ($a_1 < a_2 < \dots < a_n$).
   Swap elements at indices $i < j$ ($a_i < a_j$ originally).
   Let $A'$ be the swapped sequence.
   - For any index $k < i$ or $k > j$, relative order with all elements is unchanged.
   - For index $i$: $A'[i] = a_j$. Since $a_j > a_{i+1}$, we have $A'[i] > A'[i+1]$. This produces inversion 1 at index $i$.
   - For index $j$: $A'[j] = a_i$. Since $a_{j-1} > a_i$, we have $A'[j-1] > A'[j]$. This produces inversion 2 at index $j-1$.
   - For all indices $k \in (i, j-1)$: elements $A'[k]$ were between $a_i$ and $a_j$. Since $a_j > A'[k] > a_i$, the intermediate subarray remains strictly monotonic.
   - If $j = i + 1$ (adjacent swap), indices $i$ and $j-1$ coincide, producing exactly **1 inversion** ($A'[i] > A'[i+1]$).
   - If $j > i + 1$, indices $i$ and $j-1$ are distinct, producing exactly **2 inversions**.
   Setting `first = prev, second = curr` on inversion 1, and updating `second = curr` on inversion 2 guarantees that `first = A[j]` and `second = A[i]`.

2. **Morris Thread Invariant:**
   A thread is created from in-order predecessor to current node only when visiting the node for the first time. The thread is traversed and immediately destroyed on the second visit.
   Since every created pointer modification is undone before the algorithm returns, the tree topology is identically preserved. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Scenario | Swapped Nodes | Execution Flow | Result |
| :--- | :--- | :--- | :--- |
| **Adjacent Nodes Swapped** | Parent and child swapped | Single inversion detected; `first = prev, second = curr` | Repaired in 1 inversion step |
| **Non-Adjacent Nodes Swapped** | Distant leaf and root swapped | 2 distinct inversions; `second` updated at second step | Correctly identifies both nodes |
| **Minimal Tree ($N = 2$)** | Root and its single child swapped | 1 comparison; inversion at root | Values swapped; BST restored |
| **Degenerate Linked List Skew** | All left pointers or all right pointers | Morris traversal completes in $O(N)$ with 0 left threads | Repaired with $O(1)$ stack overhead |
| **Corrupted Root Node** | Root is one of the swapped nodes | Handled identically; `first` or `second` captures root | Root value restored in-place |

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Algorithms

Below are the complete, production-grade implementations for BST Recovery (both DFS and $O(1)$ Morris) and BST Rebalancing:

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

    public static class BstRecoveryEngine
    {
        // =========================================================================
        // Approach 1: Recursive In-Order Traversal (Clean & Intuitive)
        // Time Complexity: O(N) single pass.
        // Auxiliary Space: O(H) recursion stack.
        // =========================================================================
        public static void RecoverTreeDfs(TreeNode? root)
        {
            TreeNode? first = null;
            TreeNode? second = null;
            TreeNode? prev = null;

            void Inorder(TreeNode? curr)
            {
                if (curr == null) return;

                Inorder(curr.left);

                // Detect Inversion
                if (prev != null && prev.val > curr.val)
                {
                    if (first == null)
                    {
                        // First inversion: larger element is 'prev'
                        first = prev;
                        // Tentatively set second in case swap was adjacent
                        second = curr;
                    }
                    else
                    {
                        // Second inversion: smaller element is 'curr'
                        second = curr;
                    }
                }
                prev = curr;

                Inorder(curr.right);
            }

            Inorder(root);

            // Swap values of the two identified corrupted nodes
            if (first != null && second != null)
            {
                int temp = first.val;
                first.val = second.val;
                second.val = temp;
            }
        }

        // =========================================================================
        // Approach 2: Optimal Morris In-Order Traversal
        // Eliminates recursion stack; restores threaded pointers before exiting.
        // Time Complexity: Strictly O(N) — each edge traversed at most 4 times.
        // Auxiliary Space: Strictly O(1) constant extra memory!
        // =========================================================================
        public static void RecoverTreeMorris(TreeNode? root)
        {
            TreeNode? first = null;
            TreeNode? second = null;
            TreeNode? prev = null;
            TreeNode? curr = root;

            while (curr != null)
            {
                if (curr.left == null)
                {
                    // Process current node
                    if (prev != null && prev.val > curr.val)
                    {
                        if (first == null) first = prev;
                        second = curr;
                    }
                    prev = curr;

                    curr = curr.right;
                }
                else
                {
                    // Find in-order predecessor
                    TreeNode pred = curr.left;
                    while (pred.right != null && pred.right != curr)
                    {
                        pred = pred.right;
                    }

                    if (pred.right == null)
                    {
                        // Create temporary thread to ancestor
                        pred.right = curr;
                        curr = curr.left;
                    }
                    else
                    {
                        // Sever thread and restore original tree structure
                        pred.right = null;

                        // Process current node
                        if (prev != null && prev.val > curr.val)
                        {
                            if (first == null) first = prev;
                            second = curr;
                        }
                        prev = curr;

                        curr = curr.right;
                    }
                }
            }

            // Swap corrupted values
            if (first != null && second != null)
            {
                int temp = first.val;
                first.val = second.val;
                second.val = temp;
            }
        }

        // =========================================================================
        // 3. Balance a Binary Search Tree ([LeetCode 1382])
        // Pass 1: In-order flattening to sorted List<int> in O(N).
        // Pass 2: Divide-and-conquer median partition rebuild in O(N).
        // Time Complexity: Strictly O(N).
        // Auxiliary Space: O(N) for intermediate sorted list.
        // =========================================================================
        public static TreeNode? BalanceBST(TreeNode? root)
        {
            List<int> sortedValues = new List<int>();

            // Pass 1: In-Order Traversal
            void InorderCollect(TreeNode? node)
            {
                if (node == null) return;
                InorderCollect(node.left);
                sortedValues.Add(node.val);
                InorderCollect(node.right);
            }

            InorderCollect(root);

            // Pass 2: Reconstruct balanced tree via median splitting
            TreeNode? BuildBalanced(int left, int right)
            {
                if (left > right) return null;

                int mid = left + (right - left) / 2;
                TreeNode node = new TreeNode(sortedValues[mid])
                {
                    left = BuildBalanced(left, mid - 1),
                    right = BuildBalanced(mid + 1, right)
                };

                return node;
            }

            return BuildBalanced(0, sortedValues.Count - 1);
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### 3.1 Formal Proof: The Two-Swapped-Nodes Inversion Theorem

> **Theorem (Inversion Signature of Two Swapped Elements):**
> Let $A = [a_1 < a_2 < \dots < a_n]$ be a strictly increasing sequence. If two elements at indices $i < j$ ($a_i < a_j$) are swapped, the number of adjacent inversions ($A[k] > A[k+1]$) in the resulting sequence $A'$ is either **1** (if $j = i + 1$) or **2** (if $j > i + 1$).
>
> **Proof:**
> After swapping indices $i$ and $j$, the new sequence is:
> $$A' = [\dots, a_{i-1}, \, \mathbf{a_j}, \, a_{i+1}, \dots, a_{j-1}, \, \mathbf{a_i}, \, a_{j+1}, \dots]$$
>
> **Case 1 ($j = i + 1$, Adjacent Swap):**
> - The sequence is $[\dots, a_{i-1}, \, a_j, \, a_i, \, a_{i+2}, \dots]$.
> - Comparisons:
>   - $a_{i-1} < a_j$ (True, since $a_{i-1} < a_i < a_j$).
>   - $\mathbf{a_j > a_i}$ (An adjacent inversion at index $i$!).
>   - $a_i < a_{i+2}$ (True, since $a_i < a_j < a_{i+2}$).
> - There is **exactly 1 inversion**: $(a_j, a_i)$. The swapped elements are the two elements of this single inversion: $A'[i] = a_j$ and $A'[i+1] = a_i$.
>
> **Case 2 ($j > i + 1$, Non-Adjacent Swap):**
> - Elements between $i$ and $j$ are strictly between $a_i$ and $a_j$: $a_i < a_{i+1} \le \dots \le a_{j-1} < a_j$.
> - Comparisons:
>   - At index $i$: $\mathbf{a_j > a_{i+1}}$ (Inversion 1!).
>   - Inside $(i, j)$: $A'[k] < A'[k+1]$ remains sorted.
>   - At index $j - 1$: $\mathbf{a_{j-1} > a_i}$ (Inversion 2!).
> - There are **exactly 2 inversions**:
>   - The first inversion occurs between $A'[i] = a_j$ and $A'[i+1]$. The corrupted element is the larger one: $A'[i] = a_j$.
>   - The second inversion occurs between $A'[j-1]$ and $A'[j] = a_i$. The corrupted element is the smaller one: $A'[j] = a_i$. $\blacksquare$

---

### 3.2 Morris Traversal Edge Traversal Bound

> **Theorem (Morris Traversal Linear Time Complexity):**
> Morris Traversal visits every node in an $N$-node binary tree in $\mathbf{\Theta(N)}$ time, despite searching for predecessors at each step.
>
> **Proof:**
> 1. In an $N$-node tree, there are $N - 1$ edges.
> 2. Each edge is traversed at most 4 times:
>    - Once descending to find the predecessor (when building the thread).
>    - Once descending to the left child.
>    - Once descending to find the predecessor again (when verifying thread existence).
>    - Once ascending through the thread to return to the parent.
> 3. Total edge traversals: $\le 4(N - 1) = O(N)$.
> 4. Since each node operation takes $O(1)$ time, total time is strictly $\mathbf{\Theta(N)}$. $\blacksquare$

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### 4.1 [LeetCode 99] Non-Adjacent Swap Trace

#### Input Tree:
```
           [ 3 ]* (Should be 1)
          /     \
       [ 1 ]*   [ 4 ] (Should be 3)
      /
   [ 2 ]
```
Wait, let's trace canonical LeetCode example: `root = [1, 3, null, null, 2]`.
In-order traversal: `[3, 2, 1]`.

#### In-Order Walk:
1. `prev = null, curr = 3`. No inversion. `prev = 3`.
2. `prev = 3, curr = 2`: Inversion ($3 > 2$)!
   - `first = prev (3)`
   - `second = curr (2)`
   - `prev = 2`.
3. `prev = 2, curr = 1`: Inversion ($2 > 1$)!
   - Second inversion detected!
   - Update `second = curr (1)`.
   - `prev = 1`.

#### Post-Processing:
- Identified `first = Node(3)` and `second = Node(1)`.
- Swap their values: `first.val = 1`, `second.val = 3`.
- Resulting In-order: `[1, 2, 3]`. Tree successfully recovered!

---

### 4.2 [LeetCode 1382] Balance a Binary Search Tree Trace

#### Input: Pathologically Skewed Tree ($N = 4$):
```
[ 1 ]
   \
   [ 2 ]
      \
      [ 3 ]
         \
         [ 4 ]
```
Height $H = 4$ (Worst Case).

#### Execution:
1. **Pass 1 (In-order collection):** `sortedValues = [1, 2, 3, 4]`.
2. **Pass 2 (Median Reconstruction):**
   - Range `[0, 3]`: `mid = 1` $\implies$ Root is `Node(2)`.
   - Left child for range `[0, 0]`: `mid = 0` $\implies$ `Node(1)`.
   - Right child for range `[2, 3]`: `mid = 2` $\implies$ `Node(3)`.
     - Right-right child for range `[3, 3]`: `mid = 3` $\implies$ `Node(4)`.

#### Rebalanced Tree:
```
          [ 2 ]
         /     \
      [ 1 ]   [ 3 ]
                 \
                 [ 4 ]
```
Height reduced from 4 to 3 (AVL balanced). Search cost halved!

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Recover BST with Swapped Adjacent Nodes
- **Problem:** Trace [LeetCode 99] logic on tree `[3, 1, 4, null, null, 2]`. Show that only 1 inversion is detected, and verify that setting `second = curr` on the first inversion correctly restores the tree.
- **Target Complexity:** Time: $O(N)$, Auxiliary Space: $O(1)$.

### Exercise 2: Verify Preorder Serialization of a BST ([LeetCode 255])
- **Problem:** Given an array of numbers, verify whether it represents the preorder traversal of a valid Binary Search Tree.
- **Hint:** Maintain a monotonic decreasing stack and a lower bound `low = int.MinValue`. When current number exceeds stack top, pop stack and update `low = poppedValue`. If current number is ever $< low$, return `false`.
- **Target Complexity:** Time: $O(N)$, Auxiliary Space: $O(H)$ (or $O(1)$ in-place array stack).

### Exercise 3: Convert BST to Greater Tree ([LeetCode 538 / 1038])
- **Problem:** Transform a BST such that every node's value is replaced by the sum of all keys greater than or equal to `node.val`.
- **Hint:** Reverse in-order traversal: **Right $\to$ Root $\to$ Left**. Maintain running cumulative sum `sum += node.val; node.val = sum;`.
- **Target Complexity:** Time: $O(N)$, Auxiliary Space: $O(H)$ (or $O(1)$ via Reverse Morris).

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

### Real-World Systems Design: Database Index Corruption Detection (`amcheck`)

In production databases like PostgreSQL, B-Tree index corruption can occur due to faulty RAM, storage controller write reordering, or operating system crashes:

```sql
-- PostgreSQL Index Verification Extension
CREATE EXTENSION amcheck;
SELECT bt_index_check('users_pkey', true);
```

```
PostgreSQL amcheck Verification Pipeline:
1. Lock Index: Acquire shared buffer pin on index pages.
2. In-Order Page Walk: Scan index keys sequentially across sibling leaf pages.
3. Monotonicity Invariant Check: Verify that key[i] < key[i+1].
4. Inversion Detection:
   - If an inversion is detected: Log page corruption event.
   - If single record corrupted: Reorder keys in-place (Recover BST).
   - If structural page corruption: Trigger REINDEX CONCURRENTLY (Balance BST rebuild).
```

By verifying in-order monotonicity without rebuilding the entire multi-terabyte table, database administrators detect and repair data corruption with zero downtime.

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint 1: Inversion Assignment Asymmetry
**Question:** In [LeetCode 99], why is the first corrupted node assigned `first = prev`, while the second corrupted node is assigned `second = curr`?
<details>
<summary><b>View Architectural Answer</b></summary>

Let $x < y$ be the two swapped nodes. In the corrupted in-order traversal, the larger value $y$ appears earlier in the sequence, and the smaller value $x$ appears later.
1. When traversing $y$, it is compared with its successor. Since $y$ is abnormally large, $y > \text{successor}$. Here, $y$ is the **previous** node (`prev`), so we record `first = prev`.
2. When traversing $x$, it is compared with its predecessor. Since $x$ is abnormally small, $\text{predecessor} > x$. Here, $x$ is the **current** node (`curr`), so we record `second = curr`.
Therefore, the first corrupted node is the larger `prev`, and the second corrupted node is the smaller `curr`.
</details>

---

### Checkpoint 2: The Adjacent Inversion Edge Case
**Question:** Why does the code initialize `second = curr` inside the `if (first == null)` branch, rather than waiting for a second inversion?
<details>
<summary><b>View Architectural Answer</b></summary>

If the two swapped nodes are adjacent in in-order order (e.g. elements `3` and `4` swapped in `[1, 2, 4, 3, 5]`), there is **only one inversion** in the entire traversal ($4 > 3$).
If we waited for a second inversion to assign `second`, the second inversion would never arrive, leaving `second == null` and failing to recover the tree.
By proactively setting `second = curr` on the first inversion, we correctly solve the adjacent case immediately. If a second inversion is encountered later (non-adjacent case), `second` is simply overwritten with the true second corrupted node.
</details>

---

### Checkpoint 3: Restoring Modified Pointers in Morris Traversal
**Question:** In Morris Traversal, why is it mandatory to sever the thread (`pred.right = null`) before returning, even if the corrupted nodes have already been found?
<details>
<summary><b>View Architectural Answer</b></summary>

Morris Traversal temporarily mutates the tree structure by creating cycles: the right pointer of a leaf predecessor points backwards to an ancestor.
If the traversal terminates early or fails to sever the thread:
1. The tree contains a **directed cycle**.
2. Any subsequent standard DFS, BFS, or serialization traversal will enter an **infinite loop**, resulting in `StackOverflowException` or memory exhaustion.
3. The tree is permanently corrupted in memory. Therefore, all threads must be cleanly severed before returning.
</details>

---

### Checkpoint 4: In-Order Flattening vs. Rotations for BST Rebalancing
**Question:** In [LeetCode 1382], why is flattening to an array and reconstructing via median splitting ($\Theta(N)$ time) preferred over applying AVL tree rotations during traversal?
<details>
<summary><b>View Architectural Answer</b></summary>

Applying tree rotations to an existing unbalanced tree is complex, requires updating height or balance factors at every node, and incurs $O(N \log N)$ worst-case rotation costs.
In contrast, in-order traversal already outputs the tree's keys in perfectly sorted order in $\Theta(N)$ time. Rebuilding from a sorted array using median partitioning takes $\Theta(N)$ time and guarantees a tree of minimal possible height ($H = \lceil \log_2 (N + 1) \rceil$). The two-pass algorithm is simpler, faster, and provably optimal.
</details>

---

### Daily Mastery Checklist
- [x] Formally proved the Two-Swapped-Nodes Inversion Theorem for both adjacent and non-adjacent cases.
- [x] Solved [LeetCode 99] (Recover BST) using recursive in-order traversal in $O(N)$ time and $O(H)$ space.
- [x] Implemented [LeetCode 99] using Morris Threaded Traversal in strictly $O(1)$ auxiliary space.
- [x] Implemented complete BST rebalancing ([LeetCode 1382]) in $\Theta(N)$ time via in-order flattening and median rebuild.
- [x] Connected BST recovery to database index corruption detection tools (PostgreSQL `amcheck`).
