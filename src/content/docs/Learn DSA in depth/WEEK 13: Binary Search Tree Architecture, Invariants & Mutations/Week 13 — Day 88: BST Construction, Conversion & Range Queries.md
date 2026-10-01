---
title: "Week 13 — Day 88: BST Construction, Conversion & Range Queries"
---

# Week 13 — Day 88: BST Construction, Conversion & Range Queries

Welcome to **Day 88 of your DSA Mastery Journey**!

Yesterday in [Day 87](./Week%2013%20%E2%80%94%20Day%2087:%20BST%203-Case%20Node%20Deletion%20&%20In-Place%20Structural%20Rewiring.md), we mastered the 3 topological cases of the Hibbard Deletion algorithm and range trimming.

Today, we conquer **Optimal Balanced BST Construction, Linked List Conversion & Range Query Pruning**:
1. **Divide-and-Conquer Median Partitioning ([LeetCode 108]):** Constructing a height-balanced BST from a sorted array in strictly $\Theta(N)$ time and $O(\log N)$ stack space.
2. **The In-Order Simulation Paradigm ([LeetCode 109]):** Converting a sorted singly linked list into a height-balanced BST. We expose the $O(N \log N)$ slow/fast pointer bottleneck and engineer the optimal **$\Theta(N)$ In-Order Simulated Reconstruction** algorithm.
3. **Logarithmic Range Query Pruning ([LeetCode 938]):** Pruning non-overlapping subtrees when querying intervals $[low, high]$ in a BST.
4. **Systems Architecture:** Database B+ Tree **Bulk Loading** in SQLite, PostgreSQL, and RocksDB SSTables, contrasting bulk builds ($\Theta(N)$ sequential I/O) against repeated individual insertions ($\Theta(N \log N)$ random page splits).

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 88 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: BALANCED BUILDS     │                                     │     PART II: RANGE QUERIES      │
│   Median Partitioning & Inorder │                                     │     Subtree Branch Pruning      │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • LC 108: Sorted Array to BST   │                                     │ • LC 938: Range Sum of BST      │
│ • Midpoint: mid = (L + R) / 2   │                                     │ • Invariant: [low, high] bounds │
│ • AVL Balance Guarantee: Δh ≤ 1 │                                     │ • If root < low: Prune Left     │
│ • LC 109: Sorted List to BST    │                                     │ • If root > high: Prune Right   │
│ • Slow/Fast Trap: O(N log N)    │                                     │ • If low ≤ root ≤ high: Sum both│
│ • Inorder Simulation: O(N) Time │                                     │ • Database Index Range Scan     │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:*
    - **Balanced BST Construction:** Given a monotonically increasing sequence of $N$ keys, construct a BST whose height satisfies $H \le \lceil \log_2 (N + 1) \rceil$ and where $|h(\text{left}) - h(\text{right})| \le 1$ for every node (AVL-balanced).
    - **BST Range Query:** Given a BST and an interval $[low, high]$, aggregate all node values falling within $[low, high]$ while pruning branches that lie entirely outside the interval.
  - *Core Invariants:*
    1. **Median Root Invariant:** Choosing the median element of any sorted sub-array $[L, R]$ as root forces the left and right subtrees to differ in size by at most 1 ($|N_{left} - N_{right}| \le 1$), guaranteeing minimum tree height.
    2. **In-Order Equivalence Invariant:** An in-order traversal of a balanced BST constructed from a sorted sequence must visit elements in the exact order of the original sequence.
    3. **Range Pruning Invariant:** If $u.val < low$, no node in $\text{Left}(u)$ can be in range. If $u.val > high$, no node in $\text{Right}(u)$ can be in range.
  - *Misconception Check:* In [LeetCode 109] (Sorted List to BST), candidates frequently use Floyd's tortoise/hare slow/fast pointers to find the middle node at every recursive step. Finding the midpoint of a linked list of length $K$ takes $O(K)$ time. Since this is done at every level of the recursion tree, the recurrence is $T(N) = 2T(N/2) + O(N) = \mathbf{\Theta(N \log N)}$. By simulating in-order traversal using a global pointer, the tree can be constructed in strictly **$\Theta(N)$ time**!
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the $O(N^2)$ pathological skew that occurs when inserting sorted keys sequentially into an unrotated BST (`1, 2, 3...`).
  - *Complexity Advantage:* Directly generates a perfectly balanced tree in linear $\Theta(N)$ time, avoiding thousands of expensive balancing rotations.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Bulk loading static data into search indexes, balancing an existing skewed BST (via in-order flattening followed by median reconstruction), or computing range sums.
  - *When to Avoid / Failure Modes:* If data arrives as an unpredictable dynamic stream over time, dynamic self-balancing trees (AVL / Red-Black) must be used instead of static reconstruction.
  - *Signal Words:* "Convert sorted array/list to BST", "balance a BST", "range sum of BST", "bulk load index".
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Array-based midpoint construction uses $O(\log N)$ call stack memory and allocates $N$ contiguous-like `TreeNode` references on the Gen 0 heap.
  - *Production Systems:* Database B+ Tree **Bulk Loading** (SQLite, PostgreSQL, MySQL InnoDB). When creating an index on an existing table, the database sorts the table and packs leaf pages sequentially from left to right, achieving 100% page fill factors and zero page splits.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To construct a balanced BST from a sorted array in O(N) time, I pick the midpoint as the root and recursively build the left and right subtrees from the left and right subarrays, guaranteeing that subtree sizes differ by at most one. For a sorted linked list, finding the midpoint repeatedly with slow/fast pointers takes O(N log N). Instead, I count the list length upfront and simulate an in-order traversal: I build the left subtree of size N/2, read the current list node into the root, advance the list pointer, and build the right subtree, achieving strict O(N) time and O(log N) stack space."
  - *Interviewer Evaluation Lens:* Checks whether the candidate identifies the $O(N \log N)$ slow/fast pointer inefficiency in linked lists and knows how to implement the optimal $O(N)$ simulated in-order reconstruction.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:*
    - Array to BST ([LC 108]): Time: $\Theta(N)$; Auxiliary Space: $O(\log N)$ stack frames.
    - List to BST ([LC 109]): In-Order Simulation: $\Theta(N)$ time; $O(\log N)$ stack frames.
    - Range Sum ([LC 938]): Time: $O(K + H)$ where $K$ is nodes in range; Auxiliary Space: $O(H)$.
  - *State Transition Trace (LC 108 on `[-10, -3, 0, 5, 9]`):*
    - `mid = 2` (val = `0`) $\implies$ Root is `0`.
    - Left subarray `[-10, -3]`: `mid = 0` (val = `-10`), Right child `-3`.
    - Right subarray `[5, 9]`: `mid = 3` (val = `5`), Right child `9`.
    - Result: Root `0`, Left `-10` (with right `-3`), Right `5` (with right `9`). Height = 3.

---

### 1.1 Physical Mental Model — Center Tent Poles & The Conveyor-Belt In-Order Reader

**Analogy 1 — Sorted Array to BST: Planting the Center Tent Pole**

Imagine pitching a large circus tent using a piece of fabric marked with sorted numbers.
- If you plant your main pole at the exact center (median element), the fabric drapes down symmetrically on both sides with equal slope: a **height-balanced tree** of depth $\approx \log_2 N$.
- If you plant the pole at the far left edge (index 0), the fabric slopes down into a dangerous one-sided slide: a **degenerate linked list** of depth $N$!

```
Sorted Array: [ -10, -3, 0, 5, 9 ]
                         ▲
                   Center Pole [ 0 ]
                  /                 \
        Left Wing [-10, -3]     Right Wing [5, 9]
          Mid: [-10]                Mid: [5]
             \                         \
            [-3]                       [9]

Resulting Balanced Tree (Height = 3, perfectly balanced):
               [ 0 ]
              /     \
          [ -10 ]   [ 5 ]
             \         \
            [ -3 ]     [ 9 ]
```

---

**Analogy 2 — Sorted List to BST: The Conveyor-Belt In-Order Reader (O(N) trick)**

When data is in a linked list, you cannot jump to the median in $O(1)$ time—walking to the middle with slow/fast pointers repeatedly wastes $O(N \log N)$ time.
Instead, treat the linked list as a **one-way conveyor belt** running past an assembly worker:
1. "Wait, don't read the conveyor belt yet! First, build the structure for a left subtree of size $N/2$."
2. "Now that the left subtree is assembled, take the **next item** rolling off the belt. This item MUST be the root!"
3. "Now, build the right subtree of size $N - N/2 - 1$ from the remaining items on the belt."

```
Conveyor Belt: [ -10 ] -> [ -3 ] -> [ 0 ] -> [ 5 ] -> [ 9 ] -> null
Head Pointer:      ▲

Assembly Sequence (Simulated In-Order):
1. Build Left Subtree of size 2:
   - Worker reads [-10], then [-3] off belt -> Assembles Left Subtree
2. Belt head is now at [ 0 ]:
   - Worker consumes [ 0 ] as Root!
3. Build Right Subtree of size 2:
   - Worker reads [ 5 ], then [ 9 ] off belt -> Assembles Right Subtree

Every node is visited EXACTLY ONCE! Time drops from O(N log N) to strictly O(N)!
```

---

### 1.2 Balanced BST Construction via Median Partitioning ([LeetCode 108])

Given a sorted array `nums` of size $N$, we want to construct a height-balanced BST.
A tree is **height-balanced** if the depths of the two subtrees of every node never differ by more than 1.

```
Array: [ -10, -3, 0, 5, 9 ]
Indices:  0    1  2  3  4
                  ▲
             Midpoint (2) -> Root = [ 0 ]
           /                             \
Left Subarray: [ -10, -3 ]          Right Subarray: [ 5, 9 ]
Indices: [0, 1]                     Indices: [3, 4]
mid = 0 -> Node [ -10 ]             mid = 3 -> Node [ 5 ]
         \                                    \
       Node [ -3 ]                          Node [ 9 ]
```

#### The Recurrence Relation:
At each step, we choose `mid = L + (R - L) / 2`.
$$T(N) = 2T(N/2) + \Theta(1)$$
By Case 2 of the Master Theorem ($a = 2, b = 2, f(N) = \Theta(1)$):
$$c_{\text{crit}} = \log_2 2 = 1 \implies T(N) = \mathbf{\Theta(N)}$$
The recursion stack has maximum depth equal to the tree height: $H = \lceil \log_2 N \rceil \implies \mathbf{O(\log N)}$ auxiliary space.

---

### 1.2 The $O(N)$ In-Order Simulation for Linked Lists ([LeetCode 109])

When converting a singly linked list `head` to a BST, random access is unavailable ($O(1)$ index access is impossible).

#### The $O(N \log N)$ Slow/Fast Pointer Trap
Candidates often find the linked list median using slow/fast pointers:
```
Level 0: Scan N elements to find median.
Level 1: Scan N/2 elements twice = N elements total.
Level 2: Scan N/4 elements four times = N elements total.
Total Time: N * (log N levels) = O(N log N).
```

#### The Optimal $\Theta(N)$ In-Order Simulated Reconstruction
Notice the profound connection: **An in-order traversal visits nodes in the exact same order as the linked list!**
1. Count the length of the list $N$ in a single pass ($O(N)$).
2. Maintain a global cursor pointer `_head` pointing to the current linked list node.
3. Recursively construct the tree for range $[0, N - 1]$ using in-order semantics:
   - **Step 1 (Left Subtree):** Build left subtree for range $[L, mid - 1]$.
   - **Step 2 (Root Node):** 
     - The next value to be consumed *must* be `_head.val`!
     - Create `TreeNode root = new TreeNode(_head.val)`.
     - Advance `_head = _head.next`.
     - Attach the left subtree constructed in Step 1 to `root.left`.
   - **Step 3 (Right Subtree):** Build right subtree for range $[mid + 1, R]$ and attach to `root.right`.
   - Return `root`.

Each node in the linked list is visited **exactly once**, yielding an optimal **$\Theta(N)$ time** complexity!

---

### 1.3 Range Query Pruning Mechanics ([LeetCode 938])

Given the root of a BST and an interval $[low, high]$, return the sum of values of all nodes with a value in $[low, high]$:

```
Range: [7, 15]

               [ 10 ]  <── In Range! (10 in [7, 15]) -> Include 10, Search Left & Right
              /      \
          [ 5 ]*     [ 15 ] <── In Range! (15 in [7, 15]) -> Include 15, Search Left & Right
         /     \        \
      [ 3 ]   [ 7 ]    [ 18 ]*
```

#### Pruning Decisions:
1. **Case 1 (`node.val < low`):**
   - Node is strictly less than $low$.
   - By the BST invariant, all nodes in `node.left` are also $< low$.
   - **Pruning Action:** Skip `node.left` entirely! Recurse only on `node.right`:
     $$\text{RangeSum}(node) = \text{RangeSum}(node.right)$$
2. **Case 2 (`node.val > high`):**
   - Node is strictly greater than $high$.
   - All nodes in `node.right` are also $> high$.
   - **Pruning Action:** Skip `node.right` entirely! Recurse only on `node.left`:
     $$\text{RangeSum}(node) = \text{RangeSum}(node.left)$$
3. **Case 3 (`low <= node.val <= high`):**
   - Node is inside the interval.
   - Values in both left and right subtrees may fall inside the interval.
   - **Action:** Include `node.val` and recurse on both children:
     $$\text{RangeSum}(node) = node.val + \text{RangeSum}(node.left) + \text{RangeSum}(node.right)$$

---

### 1.4 ⚙️ Core Operations Deep-Dive: Divide-and-Conquer Median Partitioning & In-Order Simulation

#### Dimension 1: Operation Contract & Big-O Bounds

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           BALANCED BST CONSTRUCTION CONTRACT SPECIFICATION                        │
├───────────────┬───────────────────────────────┬───────────────────────────────────┬───────────────┤
│ CONVERSION    │ PRECONDITIONS                 │ POSTCONDITIONS / GUARANTEES       │ TIME & SPACE  │
├───────────────┼───────────────────────────────┼───────────────────────────────────┼───────────────┤
│ SortedArray   │ Sorted array A of size N;     │ Returns height-balanced BST       │ Time: Θ(N)    │
│ to BST        │ A[0] <= A[1] <= ... <= A[N-1] │ (height <= ceil(log2(N+1))).      │ Space: O(log N│
├───────────────┼───────────────────────────────┼───────────────────────────────────┼───────────────┤
│ SortedList    │ Singly linked list head;      │ Returns height-balanced BST       │ Time: Θ(N)    │
│ to BST        │ elements in sorted order      │ visiting each node exactly once.  │ Space: O(log N│
├───────────────┼───────────────────────────────┼───────────────────────────────────┼───────────────┤
│ RangeSumBST   │ Valid BST root; range [L, R]  │ Returns sum of elements in [L, R];│ Time: O(H + K)│
│ (Pruned)      │ with L <= R                   │ prunes non-overlapping subtrees.  │ Space: O(H)   │
└───────────────┴───────────────────────────────┴───────────────────────────────────┴───────────────┘
```

- **Time Complexity Bounds:**
  - *Construction:* Exactly $N$ node allocations and $N-1$ pointer attachments $\implies \Theta(N)$ optimal time.
  - *Range Query:* $\Theta(H + K)$ time where $H$ is tree height and $K$ is the number of nodes inside the interval $[L, R]$.
- **Space Complexity:** Strictly $\Theta(\log N)$ auxiliary call stack frames for balanced tree construction ($H = \lceil \log_2 N \rceil$).

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                       ┌─────────────────────────┐
                       │   BuildBST(L, R)        │
                       └────────────┬────────────┘
                                    │
                                 L > R ?
                                    │
                 ┌──────────────────┴──────────────────┐
                 ▼ (YES)                               ▼ (NO)
            RETURN NULL                       mid = L + (R - L) / 2
                                              leftTree = BuildBST(L, mid - 1)
                                                       │
                                                       ▼
                                              root = new TreeNode(cursor.val)
                                              root.left = leftTree
                                              cursor = cursor.next (Advance pointer)
                                                       │
                                                       ▼
                                              root.right = BuildBST(mid + 1, R)
                                              RETURN root
```

1. **In-Order Simulated Construction Protocol:**
   - **Step 1 (Length Pre-computation):** Scan linked list to count total elements $N$ in $O(N)$ time.
   - **Step 2 (Cursor Binding):** Store reference to current head in mutable member `cursor = head`.
   - **Step 3 (Divide Left Branch):** Recurse on range $[L, \text{mid} - 1]$. The recursive descent constructs all left descendants before any root is materialized.
   - **Step 4 (Apex Instantiation):** Allocate `root = new TreeNode(cursor.val)`. Stitch `root.left = leftTree`. Advance `cursor = cursor.next`.
   - **Step 5 (Divide Right Branch):** Recurse on range $[\text{mid} + 1, R]$. Stitch `root.right = rightTree`.
   - **Step 6 (Return Root):** Return `root`.

---

#### Dimension 3: Visual ASCII State Transitions (Cursor Advance & Stitching)

```
INPUT LINKED LIST: [ -10 ] -> [ -3 ] -> [ 0 ] -> [ 5 ] -> [ 9 ] -> null (N = 5)

STEP 1: CONSTRUCT LEFT SUBTREE FOR RANGE [0, 1]
   L = 0, R = 1, mid = 0:
   - Recurse Left [0, -1] -> returns null.
   - Root Node created from cursor: [ -10 ]. Cursor advances to [ -3 ].
   - Recurse Right [1, 1] -> creates [ -3 ]. Cursor advances to [ 0 ].
   Resulting Left Subtree:
         [ -10 ]
               \
               [ -3 ]

STEP 2: CREATE GLOBAL APEX FOR RANGE [0, 4] (mid = 2)
   - Left Subtree [0, 1] is complete!
   - Next value at cursor is [ 0 ]!
   - Create Root [ 0 ]:
               [ 0 ]
              /
         [ -10 ]
               \
               [ -3 ]
   - Cursor advances to [ 5 ]!

STEP 3: CONSTRUCT RIGHT SUBTREE FOR RANGE [3, 4] (mid = 3)
   - Cursor builds [ 5 ], advances to [ 9 ], builds [ 9 ].
   - Stitches to Root.Right:
               [ 0 ] (Height Balanced!)
              /     \
         [ -10 ]   [ 5 ]
               \       \
               [ -3 ]  [ 9 ]
```

---

#### Dimension 4: Invariant Preservation Proof

**Theorem (Optimal Height Balance of Median Partitioning):**
Choosing $\text{mid} = \lfloor \frac{L + R}{2} \rfloor$ guarantees that every node in the constructed BST satisfies the AVL height-balance property:
$$\forall u \in T, \ |Height(u.\text{Left}) - Height(u.\text{Right})| \le 1$$

*Proof by Strong Induction on $N = R - L + 1$:*
1. **Base Cases:**
   - $N = 1$: $L = R \implies N_L = 0, N_R = 0 \implies \Delta H = |0 - 0| = 0 \le 1$.
   - $N = 2$: $mid = L \implies N_L = 0, N_R = 1 \implies Height(L) = 0, Height(R) = 1 \implies \Delta H = 1 \le 1$.
2. **Inductive Step:**
   For range $[L, R]$ of size $N \ge 3$:
   - Size of left partition: $N_L = mid - L = \lfloor \frac{N-1}{2} \rfloor$.
   - Size of right partition: $N_R = R - mid = N - 1 - \lfloor \frac{N-1}{2} \rfloor = \lceil \frac{N-1}{2} \rceil$.
   - Notice $0 \le N_R - N_L \le 1$. The subtrees differ in size by at most 1 element.
   - Since $Height(K) = \lfloor \log_2 K \rfloor + 1$ for a complete binary tree of size $K$, the heights of two trees whose sizes differ by at most 1 satisfy:
     $$|Height(N_L) - Height(N_R)| \le 1$$
   - By inductive hypothesis, both subtrees are recursively balanced.
   Therefore, the entire constructed BST is strictly height-balanced. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Scenario | Input Condition | Algorithmic Flow | Guarantee |
| :--- | :--- | :--- | :--- |
| **Empty Input Range** | $L > R$ or $head == null$ | Base case triggers immediately | Returns `null` in $O(1)$ |
| **Single Element** | $L == R$ | Creates single leaf; cursor advances 1 step | Returns single-node tree of height 1 |
| **Two Elements** | $N = 2$ | Root at index 0; right child at index 1 | Height 2 tree; valid BST |
| **All Elements Outside Range in [LeetCode 938]** | All keys $< low$ | Case 1 prunes left subtrees; skips nodes | Returns 0 in $O(H)$ |
| **Disjoint Intervals in Range Query** | Range $[L, R]$ between tree nodes | Prunes branches without matches | Returns 0 without visiting full tree |

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Algorithms

Below are the complete, production-grade implementations for balanced BST construction and range query pruning:

```csharp
using System;

namespace BstFundamentals
{
    public class ListNode
    {
        public int val;
        public ListNode? next;

        public ListNode(int val = 0, ListNode? next = null)
        {
            this.val = val;
            this.next = next;
        }
    }

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

    public static class BstConversionEngine
    {
        // =========================================================================
        // 1. Convert Sorted Array to Balanced BST ([LeetCode 108])
        // Time Complexity: Strictly O(N) — visits each element once.
        // Auxiliary Space: O(log N) recursion stack frames.
        // =========================================================================
        public static TreeNode? SortedArrayToBST(int[] nums)
        {
            if (nums == null || nums.Length == 0) return null;
            return BuildFromSubarray(nums, 0, nums.Length - 1);
        }

        private static TreeNode? BuildFromSubarray(int[] nums, int left, int right)
        {
            if (left > right) return null;

            // Pick middle element to guarantee height balance
            int mid = left + (right - left) / 2;

            TreeNode root = new TreeNode(nums[mid])
            {
                left = BuildFromSubarray(nums, left, mid - 1),
                right = BuildFromSubarray(nums, mid + 1, right)
            };

            return root;
        }

        // =========================================================================
        // 2. Convert Sorted Linked List to Balanced BST ([LeetCode 109])
        // Optimal In-Order Simulation Algorithm.
        // Time Complexity: Strictly O(N) — eliminates the O(N log N) slow/fast search!
        // Auxiliary Space: O(log N) recursion stack frames.
        // =========================================================================
        public static TreeNode? SortedListToBST(ListNode? head)
        {
            if (head == null) return null;

            // Step 1: Count total nodes in list in O(N)
            int count = 0;
            ListNode? curr = head;
            while (curr != null)
            {
                count++;
                curr = curr.next;
            }

            // Step 2: Global cursor tracking the current list node
            ListNode? cursor = head;

            TreeNode? BuildInorder(int l, int r)
            {
                if (l > r) return null;

                int mid = l + (r - l) / 2;

                // 1. Build Left Subtree first (In-Order: Left -> Root -> Right)
                TreeNode? leftChild = BuildInorder(l, mid - 1);

                // 2. Process Current Root Node
                TreeNode root = new TreeNode(cursor!.val);
                root.left = leftChild;

                // Advance cursor to next node in linked list
                cursor = cursor.next;

                // 3. Build Right Subtree
                root.right = BuildInorder(mid + 1, r);

                return root;
            }

            return BuildInorder(0, count - 1);
        }

        // =========================================================================
        // 3. Range Sum of BST ([LeetCode 938])
        // Pruned Branch Recursion.
        // Time Complexity: O(H + K) where K is number of nodes in [low, high].
        // Auxiliary Space: O(H) stack frames.
        // =========================================================================
        public static int RangeSumBST(TreeNode? root, int low, int high)
        {
            if (root == null) return 0;

            // Case 1: Node too small -> Prune left subtree!
            if (root.val < low)
            {
                return RangeSumBST(root.right, low, high);
            }

            // Case 2: Node too large -> Prune right subtree!
            if (root.val > high)
            {
                return RangeSumBST(root.left, low, high);
            }

            // Case 3: Node in range -> Accumulate value and search both subtrees
            return root.val + RangeSumBST(root.left, low, high) + RangeSumBST(root.right, low, high);
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### 3.1 Formal Proof: AVL Height-Balance Guarantee of Midpoint Splitting

> **Theorem (Midpoint Splitting Height Balance):**
> For any sorted array of size $N$, choosing $\text{mid} = \lfloor (L + R) / 2 \rfloor$ at every recursive step constructs a binary tree satisfying the AVL balance property:
> $$\forall u \in T: |h(\text{left}(u)) - h(\text{right}(u))| \le 1$$
>
> **Proof by Structural Induction:**
> 1. Let $N$ be the number of elements in range $[L, R]$.
> 2. The left subtree receives $N_{\text{left}} = \lfloor (N - 1) / 2 \rfloor$ elements.
> 3. The right subtree receives $N_{\text{right}} = N - 1 - N_{\text{left}} = \lceil (N - 1) / 2 \rceil$ elements.
> 4. Notice that $N_{\text{right}} - N_{\text{left}} \in \{0, 1\}$. Subtree node counts differ by at most 1.
> 5. The height of a balanced tree with $k$ nodes is $h(k) = \lfloor \log_2 k \rfloor + 1$.
> 6. Since $N_{\text{right}} \le N_{\text{left}} + 1$, the heights of the two subtrees can differ by at most 1:
>    $$|h(\text{left}) - h(\text{right})| \le 1$$
> 7. By mathematical induction, every internal node satisfies the balance factor constraint $BF \in \{-1, 0, 1\}$. $\blacksquare$

---

### 3.2 Complexity Comparison: Linked List to BST

| Algorithm Approach | Time Complexity | Auxiliary Space | Bottleneck Explanation |
| :--- | :--- | :--- | :--- |
| **Slow/Fast Pointer (Naive)** | $\Theta(N \log N)$ | $O(\log N)$ | Tortoise/hare scans $O(K)$ nodes at depth $\log N$ |
| **Convert to Array + Median** | $\Theta(N)$ | $\Theta(N)$ Heap | Allocates intermediate array of $N$ integers |
| **In-Order Simulation (Optimal)**| $\mathbf{\Theta(N)}$ | $\mathbf{O(\log N)}$ Stack | Consumes list nodes sequentially in $O(1)$ each |

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### 4.1 [LeetCode 109] In-Order Simulation Execution Trace

#### Input:
`head = [-10, -3, 0, 5, 9]`, Length $N = 5$. Range $[0, 4]$.

```
Tree Skeleton Defined by Range [0, 4]:
              mid = 2 (Root)
             /              \
     Range [0, 1]        Range [3, 4]
       mid = 0              mid = 3
         \                    \
       Range [1, 1]        Range [4, 4]
```

#### Step-by-Step Traversal Order:

| Step | Call Range $[L, R]$ | Midpoint | Phase | Action / Cursor Value | Attached Node |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | $[0, 4]$ | `2` | Descend Left | Recurse $[0, 1]$ | Pending |
| **2** | $[0, 1]$ | `0` | Descend Left | Recurse $[0, -1] \implies null$ | Pending |
| **3** | $[0, 1]$ | `0` | **Process Root** | Cursor at `-10`. Create Node(-10). Advance cursor $\to -3$. | Node(-10) |
| **4** | $[0, 1]$ | `0` | Descend Right| Recurse $[1, 1]$ | Attached to `-10.right` |
| **5** | $[1, 1]$ | `1` | **Process Root** | Cursor at `-3`. Create Node(-3). Advance cursor $\to 0$. | Node(-3) |
| **6** | $[0, 4]$ | `2` | **Process Root** | Cursor at `0`. Create Node(0). Left is `-10`. Advance cursor $\to 5$.| Node(0) |
| **7** | $[0, 4]$ | `2` | Descend Right| Recurse $[3, 4]$ | Attached to `0.right` |
| **8** | $[3, 4]$ | `3` | **Process Root** | Cursor at `5`. Create Node(5). Advance cursor $\to 9$. | Node(5) |
| **9** | $[3, 4]$ | `3` | Descend Right| Recurse $[4, 4]$ | Attached to `5.right` |
| **10**| $[4, 4]$ | `4` | **Process Root** | Cursor at `9`. Create Node(9). Advance cursor $\to null$. | Node(9) |

**Final Reconstructed Tree:** Perfectly balanced, zero extra array allocations!

---

### 4.2 [LeetCode 938] Range Sum Pruning Trace

#### Input:
`root = [10, 5, 15, 3, 7, null, 18]`, `low = 7, high = 15`.

```
Execution Trace:
1. Node(10): 10 in [7, 15] -> Include 10. Recurse Left and Right.
2. Node(5):  5 < 7 -> TOO SMALL!
   - Pruning Action: Discard Node(5) and Node(3) (5.left).
   - Recurse ONLY on 5.right (Node 7).
3. Node(7):  7 in [7, 15] -> Include 7. Children are null.
4. Node(15): 15 in [7, 15] -> Include 15. Recurse Left and Right.
   - 15.left is null.
   - 15.right is Node(18).
5. Node(18): 18 > 15 -> TOO LARGE!
   - Pruning Action: Discard Node(18).

Total Sum: 10 + 7 + 15 = 32.
Nodes Visited: 4 (Node 3 was completely skipped!).
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Balance a Binary Search Tree ([LeetCode 1382])
- **Problem:** Given root of a BST, return a balanced BST with the same node values.
- **Hint:** Two-step pipeline: (1) Perform in-order traversal into `List<int>` in $O(N)$ time. (2) Apply [LeetCode 108] median midpoint partition rebuild on the array in $O(N)$ time.
- **Target Complexity:** Time: $O(N)$, Auxiliary Space: $O(N)$ to store flattened list.

### Exercise 2: Count Complete Tree Nodes ([LeetCode 222])
- **Problem:** Given root of a *complete* binary tree, count the number of nodes in less than $O(N)$ time.
- **Hint:** Compare left height $h_L$ (walking leftmost) and right height $h_R$ (walking rightmost). If $h_L == h_R$, the subtree is a full tree containing $2^{h_L} - 1$ nodes! Otherwise, recurse on children: $1 + Count(left) + Count(right)$.
- **Target Complexity:** Time: $O((\log N)^2)$, Auxiliary Space: $O(\log N)$.

### Exercise 3: Iterative Range Sum of BST
- **Problem:** Implement [LeetCode 938] iteratively using an explicit stack or queue.
- **Hint:** Push `root`. While stack not empty: pop `node`. If `low <= node.val <= high`, add `node.val`. If `node.val > low && node.left != null`, push `node.left`. If `node.val < high && node.right != null`, push `node.right`.
- **Target Complexity:** Time: $O(K + H)$, Auxiliary Space: $O(H)$.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

### Real-World Systems Design: Database B+ Tree Bulk Loading

In relational databases (PostgreSQL, MySQL InnoDB, SQLite) and LSM-Tree storage engines (RocksDB), creating an index on a billion-row table by executing $1,000,000,000$ individual `INSERT` operations is an architectural disaster:

```
Individual Insert Approach (Disaster):
- 1,000,000,000 insertions * O(log N) tree navigations = 30,000,000,000 comparisons.
- Constant B+ Tree page splits (50% fill factor overhead).
- Enormous random disk I/O -> Takes 12+ hours!

Bulk Loading Approach (Optimal):
1. External Merge Sort: Sort rows by index key on disk in O(N log N) sequential I/O.
2. Bottom-Up Leaf Packing: Fill 4KB leaf pages sequentially to 90-100% capacity.
3. Build Internal Index Nodes: As leaf pages fill, write parent index pages sequentially.
- Zero page splits, 100% sequential disk writes -> Takes 15 minutes!
```

Just like [LeetCode 108] and [LeetCode 109], production database engines never build trees via repeated insertions when sorted data is available upfront; they use **median bottom-up bulk loading**.

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint 1: In-Order Simulation Correctness
**Question:** In [LeetCode 109], how does the recursive in-order simulation guarantee that `cursor.val` always matches the exact node value needed for `mid`, without ever indexing into the linked list?
<details>
<summary><b>View Architectural Answer</b></summary>

By structural induction on in-order traversal:
An in-order traversal visits nodes in the exact order: $\text{LeftSubtree} \to \text{Root} \to \text{RightSubtree}$.
In the recursive function `BuildInorder(l, r)`:
1. It first constructs the complete left subtree spanning indices $[l, mid - 1]$. By induction, this call consumes exactly $mid - l$ nodes from the linked list cursor.
2. When the call to `BuildInorder(l, mid - 1)` completes, the cursor has advanced by exactly the number of elements in the left subtree.
3. Therefore, the cursor must be resting on the element at relative index $mid$! We can immediately read `cursor.val` as the root, advance `cursor = cursor.next`, and construct the right subtree.
</details>

---

### Checkpoint 2: Midpoint Integer Overflow Trap
**Question:** Why must the midpoint calculation be written as `mid = left + (right - left) / 2` instead of `mid = (left + right) / 2`?
<details>
<summary><b>View Architectural Answer</b></summary>

If `left` and `right` are large positive integers (e.g. `left = 1,500,000,000` and `right = 2,000,000,000`), their sum $left + right = 3,500,000,000$ exceeds `int.MaxValue` ($2^{31} - 1 \approx 2.14 \times 10^9$).
In 32-bit signed integer arithmetic, this triggers an integer overflow, wrapping around to a negative number (`-794,967,296`). Dividing by 2 yields a negative index, crashing with `IndexOutOfRangeException`.
The formula `left + (right - left) / 2` subtracts first, keeping intermediate values within valid bounds.
</details>

---

### Checkpoint 3: Range Pruning Asymptotic Complexity
**Question:** In [LeetCode 938], what is the worst-case time complexity if the range $[low, high]$ contains zero nodes in the tree, but spans across the root (e.g., all tree nodes are $\le 5$ or $\ge 20$, and $[low, high] = [10, 12]$)?
<details>
<summary><b>View Architectural Answer</b></summary>

If $[low, high]$ contains zero nodes:
At each node $u$, the algorithm compares $u.val$ against $[low, high]$. 
- If $u.val < low$, it branches right.
- If $u.val > high$, it branches left.
Because only one branch is taken at each step, the search follows a single path down the tree of length $H$, taking at most $O(H)$ operations before terminating at `null`. It never traverses both subtrees simultaneously, maintaining optimal $O(H)$ time.
</details>

---

### Checkpoint 4: Array-Based vs. Pointer-Based Node Storage Footprint
**Question:** In [LeetCode 108], what is the memory footprint difference between storing the original array `int[1,000,000]` versus the resulting `TreeNode` binary search tree on 64-bit .NET CLR?
<details>
<summary><b>View Architectural Answer</b></summary>

- **Contiguous Array (`int[1,000,000]`):**
  - Array object header: 24 bytes.
  - Elements: $1,000,000 \times 4 \text{ bytes} = 4 \text{ MB}$.
  - Total Memory: $\approx \mathbf{4 \text{ MB}}$.
- **Heap BST (`TreeNode[1,000,000]`):**
  - Each `TreeNode` is a managed heap object:
    - Object Header: 16 bytes.
    - MethodTable Pointer: 8 bytes.
    - Fields: `int val` (4B) + padding (4B) + `left` pointer (8B) + `right` pointer (8B) = 24 bytes.
    - Total per node: $48 \text{ bytes}$.
  - Total Memory: $1,000,000 \times 48 \text{ bytes} = \mathbf{48 \text{ MB}}$ (plus GC tracking overhead).
The pointer-based tree uses **$12\times$ more memory** than the flat contiguous array!
</details>

---

### Daily Mastery Checklist
- [x] Implemented balanced BST construction from sorted array ([LeetCode 108]) in $\Theta(N)$ time.
- [x] Proved why midpoint splitting guarantees the AVL height-balance invariant ($|BF| \le 1$).
- [x] Engineered the optimal $\Theta(N)$ in-order simulation algorithm for linked list conversion ([LeetCode 109]), avoiding the $O(N \log N)$ slow/fast pointer trap.
- [x] Implemented branch-pruning Range Sum of BST ([LeetCode 938]).
- [x] Connected median construction to database B+ Tree bulk loading in SQLite, PostgreSQL, and RocksDB.
