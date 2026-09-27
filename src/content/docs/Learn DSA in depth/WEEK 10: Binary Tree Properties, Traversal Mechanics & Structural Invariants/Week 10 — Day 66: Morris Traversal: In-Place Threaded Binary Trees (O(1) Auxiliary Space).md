---
title: "Week 10 — Day 66: Morris Traversal: In-Place Threaded Binary Trees (O(1) Auxiliary Space)"
---

# Week 10 — Day 66: Morris Traversal: In-Place Threaded Binary Trees ($O(1)$ Auxiliary Space)

Welcome to **Day 66 of your DSA Mastery Journey**!

In [Day 64](./Week%2010%20%E2%80%94%20Day%2064:%20Tree%20Memory%20Architecture,%20From-Scratch%20BinaryTree%20&%20Traversal%20Invariants%20%28Preorder,%20Inorder,%20Postorder%29.md) and [Day 65](./Week%2010%20%E2%80%94%20Day%2065:%20Iterative%20Traversals%20&%20Explicit%20Stack%20State%20Machines.md), we explored recursive DFS and iterative explicit-stack state machines. Both paradigms, however, require $O(H)$ auxiliary memory (up to $O(N)$ for skewed trees) to remember the path back to ancestor nodes.

Today, we conquer one of the most brilliant and celebrated algorithmic discoveries in computer science: **Morris Traversal** (invented by J. H. Morris in 1979).

We will achieve **$O(N)$ linear time traversal with strict $O(1)$ auxiliary memory**:
- **Zero recursive stack frames**
- **Zero heap-allocated collections (`Stack<T>`)**
- **Zero parent pointers**
- **100% tree restoration (zero residual mutation)**

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 66 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: THE MORRIS DISCOVERY│                                     │     PART II: IN-PLACE REPAIR    │
│    Threaded Binary Tree Theory  │                                     │        Canonical Problems       │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • The N + 1 Null Pointer Insight│                                     │ • Morris Inorder (LC 94)        │
│ • Inorder Predecessor Law       │                                     │ • Morris Preorder (LC 144)      │
│ • Thread Creation vs Severing   │                                     │ • Recover BST in O(1) (LC 99)   │
│ • 3E Edge Traversal Bound Proof │                                     │ • Embedded Systems RAM Reality  │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **Morris Traversal** is an in-place tree traversal algorithm that achieves strictly $O(1)$ auxiliary memory by temporarily threading the tree using unused `null` right child pointers of in-order predecessors.
  - *Core Invariants:* Thread Creation Invariant: If `predecessor.right == null`, set `predecessor.right = curr` (create temporary thread) and advance `curr = curr.left`; Thread Destruction Invariant: If `predecessor.right == curr`, set `predecessor.right = null` (destroy thread, restoring tree topology), visit `curr` (for Inorder), and advance `curr = curr.right`.
  - *Misconception Check:* Morris Traversal does *not* corrupt the tree permanently; every temporary thread created is guaranteed to be severed and restored to `null` on the second visit, leaving the original tree structure 100% intact upon completion.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(H)$ memory overhead of both recursive call stacks and explicit heap stacks.
  - *Complexity Advantage:* Achieves strictly $\Theta(1)$ auxiliary memory while maintaining $O(N)$ linear time.
- **3. WHEN:**
  - *When to Choose / Signal Words:* Extreme memory-constrained embedded environments, "Recover Binary Search Tree" (LC 99 in $O(1)$ space), interviewers asking for true $O(1)$ auxiliary space tree traversal. Signal words: "traverse tree in O(1) space", "Morris traversal", "threaded binary tree".
  - *When to Avoid / Failure Modes:* Multi-threaded concurrent environments where mutating tree pointers causes data races for simultaneous readers.
- **4. WHERE:**
  - *Physical CLR Memory:* Strictly zero heap and stack memory allocations; operates directly by repurposing unused 8-byte `null` pointer addresses within existing heap nodes.
  - *Production Systems:* Embedded microcontroller firmware, real-time operating system kernel debuggers inspecting deep structures under tight RAM constraints.
- **5. WHO:**
  - *Spoken Script:* "Morris Traversal achieves $O(1)$ auxiliary space by threading the tree: it finds the current node's in-order predecessor and points its null right pointer back to the current node. On the second visit, it detects the existing thread, severs it to restore tree topology, visits the node, and moves right. Each edge is traversed at most three times, guaranteeing $O(N)$ time."
  - *Interviewer Evaluation Lens:* Checks predecessor finding loop (`while (pred.right != null && pred.right != curr)`), thread severing discipline, and time complexity amortized proof.
- **6. HOW:**
  - *Cost Model:* Time: $O(N)$ (each edge traversed at most 3 times); Space: strictly $\Theta(1)$ auxiliary memory.
  - *State Transition Trace:* `Find pred of curr -> pred.right == null: pred.right = curr, curr = curr.left -> pred.right == curr: pred.right = null, Visit(curr), curr = curr.right`.


### 1.1 The Null Pointer Waste Theorem

In any binary tree with $N$ vertices:
- Every node has 2 child pointers (`Left` and `Right`), giving **$2N$ total pointer fields**.
- In an acyclic tree, every node except the root has exactly 1 incoming parent edge, meaning there are **$N - 1$ active edges**.
- Therefore, the number of unused (`null`) pointer fields is:
  $$\text{Null Pointers} = 2N - (N - 1) = \mathbf{N + 1}$$

Over **half** of all pointer fields in a binary tree are completely unused!

> [!IMPORTANT]
> ### 💡 The Morris Traversal Insight
> Why allocate auxiliary memory (a call stack or heap stack) to remember the path back to a parent when **$N + 1$ null pointers already exist inside the tree itself**?
>
> If we temporarily redirect a predecessor node's null right pointer to point upward to the current node, we create a **temporary bridge (thread)**. When our traversal finishes the left subtree, this bridge allows us to walk back up to the parent in $O(1)$ space, after which we can **sever the bridge to restore the original tree**!

---

### 1.2 The In-Order Predecessor Invariant

For any node `curr` that has a left child:
$$\text{In-Order Predecessor of } curr = \text{The rightmost node in } curr\text{'s left subtree.}$$

```
                   [ curr ]
                    /
                 [ Left ]
                     \
                   [ ... ]
                       \
                      [ pred ]  <-- Rightmost node! pred.right is currently null!
```

To find `pred`:
```csharp
TreeNode pred = curr.left;
while (pred.right != null && pred.right != curr)
{
    pred = pred.right;
}
```

Notice the critical condition `pred.right != curr`:
- If `pred.right == null`, we are visiting `curr` for the **first time**.
- If `pred.right == curr`, we have already threaded this node and are visiting `curr` for the **second time** via our bridge!

---

### 1.3 The Two-Pass State Machine: Thread Creation & Thread Destruction

At every step during Morris Traversal:

```
                               ┌───────────────────────────────┐
                               │       Is curr.left null?      │
                               └───────────────────────────────┘
                                   │                       │
                                  YES                      NO
                                   │                       │
                                   ▼                       ▼
                    ┌─────────────────────────┐   ┌────────────────────────────────┐
                    │ 1. Process curr.val     │   │ Find Inorder Predecessor: pred │
                    │ 2. Move curr = curr.right│  └────────────────────────────────┘
                    └─────────────────────────┘                   │
                                                  ┌───────────────┴───────────────┐
                                                  ▼                               ▼
                                          pred.right == null              pred.right == curr
                                          (First Visit to curr)          (Second Visit to curr)
                                                  │                               │
                                                  ▼                               ▼
                                     ┌─────────────────────────┐    ┌─────────────────────────┐
                                     │ 1. Thread:              │    │ 1. Sever Thread:        │
                                     │    pred.right = curr    │    │    pred.right = null    │
                                     │ 2. [If Preorder: Visit] │    │ 2. [If Inorder: Visit]  │
                                     │ 3. Move curr = curr.left│    │ 3. Move curr = curr.right│
                                     └─────────────────────────┘    └─────────────────────────┘
```

1. **If `curr.left == null`:**
   We cannot go left. Emit `curr.val` and step right: `curr = curr.right`.
2. **If `curr.left != null`:**
   Find predecessor `pred`.
   - **Case A (`pred.right == null`):**
     First time at `curr`. Create bridge: `pred.right = curr`.
     *(If doing Preorder: emit `curr.val` here!)*
     Drill left: `curr = curr.left`.
   - **Case B (`pred.right == curr`):**
     Second time at `curr` (left subtree complete!). Sever bridge: `pred.right = null` (tree restored!).
     *(If doing Inorder: emit `curr.val` here!)*
     Drill right: `curr = curr.right`.

---

## 2. 💻 DEMONSTRATE: Canonical Invariant Visualization & Algorithmic Mechanics

### 2.1 Visualizing Morris Inorder on a 3-Node Tree

Consider the tree:
```
       [ 2 ]
      /     \
    [ 1 ]   [ 3 ]
```

```
Step 1: curr = 2.
  curr.left != null (node 1).
  Find predecessor of 2: pred = 1.
  pred.right is null!
  ===> CREATE THREAD: 1.right = 2!
  Tree temporarily becomes:
       [ 2 ] <────────┐
      /     \         │ (Thread)
    [ 1 ]   [ 3 ]     │
      └───────────────┘
  Move curr = curr.left = 1.

Step 2: curr = 1.
  curr.left == null.
  ===> EMIT 1! Output: [ 1 ].
  Move curr = curr.right = 2 (following our thread!).

Step 3: curr = 2 (Second Visit!).
  curr.left != null.
  Find predecessor of 2: pred = 1.
  pred.right == 2 (Thread detected!).
  ===> SEVER THREAD: 1.right = null! (Original tree restored!)
  ===> EMIT 2! Output: [ 1, 2 ].
  Move curr = curr.right = 3.

Step 4: curr = 3.
  curr.left == null.
  ===> EMIT 3! Output: [ 1, 2, 3 ].
  Move curr = curr.right = null.

Step 5: curr == null. Terminate!
Final Output: 1 -> 2 -> 3. (Inorder Complete! Auxiliary Space: O(1)!)
```

---

## 3. 🔬 COMPLEXITY & MATHEMATICAL INVARIANTS

### 3.1 Theorem: Strict $O(N)$ Time Complexity Proof

A common point of confusion is: *"Since we search for the predecessor at every node with a left child, doesn't that take $O(N^2)$ worst-case time?"*

> [!TIP]
> ### 🧮 Proof via Edge Traversal Accounting
>
> In a binary tree with $N$ vertices, there are exactly $|E| = N - 1$ edges.
> Let us count the **maximum number of times any edge $e = (u, v)$ can be traversed** during the entire Morris algorithm:
>
> 1. **Traversal 1 (Downward Search during Thread Creation):**
>    When finding the predecessor of some ancestor, edge $e$ is traversed downwards at most once while `pred.right == null`.
> 2. **Traversal 2 (Downward Search during Thread Severing):**
>    When finding the predecessor of that same ancestor a second time, edge $e$ is traversed downwards at most once while checking `pred.right != curr`.
> 3. **Traversal 3 (Main Algorithm Forward Movement):**
>    Edge $e$ is traversed by the main `curr` pointer when stepping `curr = curr.left` or `curr = curr.right`.
>
> **Summing Over All Edges:**
> No edge in the entire tree is traversed more than **3 times**!
> $$\text{Total Operations} \le 3 \times |E| = 3(N - 1) = \mathbf{\Theta(N)}$$
>
> Thus, despite the nested `while` loop, Morris Traversal runs in **strict $\Theta(N)$ linear time**. $\blacksquare$

---

### 3.2 Space Complexity Invariant
$$\text{Auxiliary Space} = \mathbf{O(1)}$$
No activation frames are created on the call stack, no objects are allocated on the GC heap, and the original tree structure is completely unchanged when the function returns.

---

## 4. 🛠️ PRACTICE: Canonical Big Tech Problem Walkthroughs

---

### 4.1 Problem 1: [LeetCode 94] Binary Tree Inorder Traversal (Morris Traversal) (Easy/Hard Concept)

> **Problem Description:**
> Given the `root` of a binary tree, return *the inorder traversal of its nodes' values* using **$O(1)$ auxiliary space** (excluding the return list).

#### Production C# Implementation

```csharp
using System.Collections.Generic;

public class Solution
{
    public IList<int> InorderTraversal(TreeNode? root)
    {
        var result = new List<int>();
        TreeNode? curr = root;

        while (curr != null)
        {
            if (curr.left == null)
            {
                // No left subtree: process current node and move right
                result.Add(curr.val);
                curr = curr.right;
            }
            else
            {
                // Find inorder predecessor: rightmost node of left subtree
                TreeNode pred = curr.left;
                while (pred.right != null && pred.right != curr)
                {
                    pred = pred.right;
                }

                if (pred.right == null)
                {
                    // First visit: create thread and drill left
                    pred.right = curr;
                    curr = curr.left;
                }
                else
                {
                    // Second visit: sever thread, process current node, and move right
                    pred.right = null;
                    result.Add(curr.val);
                    curr = curr.right;
                }
            }
        }

        return result;
    }
}
```

---

### 4.2 Problem 2: [LeetCode 144] Binary Tree Preorder Traversal (Morris Traversal) (Easy/Hard Concept)

> **Problem Description:**
> Given the `root` of a binary tree, return *the preorder traversal of its nodes' values* using **$O(1)$ auxiliary space**.

#### Production C# Implementation (Emitting on First Visit)

```csharp
using System.Collections.Generic;

public class Solution
{
    public IList<int> PreorderTraversal(TreeNode? root)
    {
        var result = new List<int>();
        TreeNode? curr = root;

        while (curr != null)
        {
            if (curr.left == null)
            {
                result.Add(curr.val);
                curr = curr.right;
            }
            else
            {
                TreeNode pred = curr.left;
                while (pred.right != null && pred.right != curr)
                {
                    pred = pred.right;
                }

                if (pred.right == null)
                {
                    // PREORDER INVARIANT: Visit root BEFORE exploring left subtree!
                    result.Add(curr.val);
                    pred.right = curr;
                    curr = curr.left;
                }
                else
                {
                    // Left subtree complete: restore tree and pivot right
                    pred.right = null;
                    curr = curr.right;
                }
            }
        }

        return result;
    }
}
```

---

### 4.3 Problem 3: [LeetCode 99] Recover Binary Search Tree (Medium)

> **Problem Description:**
> You are given the `root` of a binary search tree (BST), where the values of **exactly two nodes** were swapped by mistake. Recover the tree **without changing its structure** in **$O(1)$ auxiliary space**.
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[2, 1000]$.
> - $-2^{31} \le \text{Node.val} \le 2^{31} - 1$

#### 1. The Inorder Monotonicity Invariant
In a valid BST, Inorder traversal yields values in **strictly increasing order**:
$$A[0] < A[1] < A[2] < \dots < A[N-1]$$
When two nodes are swapped, there will be either **one** or **two** inversions ($A[i] > A[i+1]$):
- **Case 1 (Non-adjacent swap):** Two separate violations: `[1, 5, 3, 4, 2, 6]`.
  First violation: $5 > 3 \implies \text{first} = 5$.
  Second violation: $4 > 2 \implies \text{second} = 2$.
- **Case 2 (Adjacent swap):** One single violation: `[1, 3, 2, 4]`.
  First violation: $3 > 2 \implies \text{first} = 3, \text{second} = 2$.

By running Morris Inorder Traversal, we can track `prev` and identify `first` and `second` in **$O(1)$ space**, then swap their values!

#### 2. Production C# Implementation

```csharp
public class Solution
{
    public void RecoverTree(TreeNode? root)
    {
        TreeNode? first = null;
        TreeNode? second = null;
        TreeNode? prev = null;

        TreeNode? curr = root;

        // In-place Morris Inorder Traversal
        while (curr != null)
        {
            if (curr.left == null)
            {
                // Inspect monotonicity
                DetectViolation(curr, ref prev, ref first, ref second);
                curr = curr.right;
            }
            else
            {
                TreeNode pred = curr.left;
                while (pred.right != null && pred.right != curr)
                {
                    pred = pred.right;
                }

                if (pred.right == null)
                {
                    pred.right = curr;
                    curr = curr.left;
                }
                else
                {
                    pred.right = null;
                    DetectViolation(curr, ref prev, ref first, ref second);
                    curr = curr.right;
                }
            }
        }

        // Swap the values of the two identified nodes
        if (first != null && second != null)
        {
            int temp = first.val;
            first.val = second.val;
            second.val = temp;
        }
    }

    private static void DetectViolation(TreeNode curr, ref TreeNode? prev, ref TreeNode? first, ref TreeNode? second)
    {
        if (prev != null && prev.val > curr.val)
        {
            if (first == null)
            {
                first = prev;   // First violation: take the larger previous node
            }
            second = curr;      // Second violation (or adjacent): take the smaller current node
        }
        prev = curr;
    }
}
```

#### 3. Complexity
- **Time Complexity:** $O(N)$ total operations.
- **Space Complexity:** **Strict $O(1)$ auxiliary space**.

---

## 5. ⚡ HARDWARE & SYSTEMS CONNECTIONS

### 5.1 Embedded Systems, Microcontrollers & Memory Ceilings

```
Embedded Architecture Comparison (e.g. ARM Cortex-M0 / Automotive ECUs):
Total Available SRAM: 8 KB to 32 KB.

Recursive Traversal on 5,000-Node Tree:
• Stack Depth: 5,000 frames.
• Stack Memory: 5,000 * 48 Bytes = 240 KB!
• Result: HARDWARE FAULT (Memory overlap crashes device).

Morris Traversal on 5,000-Node Tree:
• Stack Depth: 1 frame (main function).
• Stack Memory: 48 Bytes!
• Auxiliary Heap: 0 Bytes!
• Result: Flawless execution within 8 KB SRAM limit.
```

### 5.2 Concurrency & Thread-Safety Warnings
- **The Critical Caveat:** Morris Traversal **mutates the tree while reading it**!
- If another thread attempts to read or traverse the tree concurrently during a Morris pass, it will encounter circular pointer references and enter an infinite loop!
- In multithreaded systems, Morris Traversal requires exclusive writer synchronization (`Monitor.Enter` or `ReaderWriterLockSlim.EnterWriteLock`).

---

## 6. ⚠️ DAILY ERROR LOG & COMMON TRAPS

### Trap 1: Missing the Loop Guard `pred.right != curr`
- **The Bug:** Writing `while (pred.right != null) pred = pred.right;`.
- **The Failure:** On the second visit, `pred.right` points back to `curr`. The loop traverses the thread endlessly, resulting in an infinite loop and thread hang.
- **The Fix:** **Always include `&& pred.right != curr`** in the predecessor search.

### Trap 2: Early Return Before Severing Threads
- **The Bug:** Returning early (e.g. finding a target value and doing `return true`) without completing the traversal.
- **The Failure:** Leaves temporary threads active inside the tree. The tree now contains permanent cycles, breaking any future traversals or GC collection.
- **The Fix:** In Morris traversal, **you must complete the full traversal** to ensure all `pred.right = null` calls execute.

### Trap 3: Confusing Preorder vs Inorder Visit Points
- **The Bug:** Emitting `result.Add(curr.val)` inside `pred.right != null` for Preorder.
- **The Fix:**
  - **Preorder:** Emit on the **first visit** (`pred.right == null`).
  - **Inorder:** Emit on the **second visit** (`pred.right == curr`).

---

## 7. 🎯 DAILY CHECKPOINT & SELF-ASSESSMENT

### 1. Conceptual Verification
1. Why is the time complexity of Morris Traversal strictly $O(N)$ even though we search for the in-order predecessor at every step?
2. In Morris Traversal, how many total null pointers exist in a binary tree with $N$ vertices, and why does this guarantee that sufficient empty pointer slots exist to thread every node?
3. What is the fundamental danger of running a Morris Traversal in a concurrent multi-threaded application without locks?

### 2. Implementation Audit
- In your implementation of `RecoverTree`, trace why setting `second = curr` on both the first and second inversions correctly handles adjacent swapped nodes (e.g., `[1, 3, 2, 4]`).

---
*Next Module: **Week 10 — Day 67: Level-Order Traversals, Zigzag & Multi-Level BFS Aggregations (LeetCode 102, 103, 107)***
