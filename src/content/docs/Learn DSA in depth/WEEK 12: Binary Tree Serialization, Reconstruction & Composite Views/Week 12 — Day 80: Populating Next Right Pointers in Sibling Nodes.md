---
title: "Week 12 — Day 80: Populating Next Right Pointers in Sibling Nodes"
---

# Week 12 — Day 80: Populating Next Right Pointers in Sibling Nodes

Welcome to **Day 80 of your DSA Mastery Journey**!

Yesterday in [Day 79](./Week%2012%20%E2%80%94%20Day%2079:%20Binary%20Tree%20Reconstruction%20from%20Traversals.md), we mastered dual-traversal tree reconstruction and index arithmetic without memory allocations.

Today, we conquer **Horizontal Pointer Linkage & Breadth Traversal without a Queue**:
1. **The Level-Linked Binary Tree Contract:** Populating horizontal `next` references across siblings and cousins.
2. **The $O(1)$ Auxiliary Space Mandate:** Why standard BFS queues violate Big Tech interview constraints ($O(W) \approx O(N)$ memory).
3. **Case 1: Perfect Binary Trees ([LeetCode 116]):** Sibling linkage and cross-cousin linkage using existing parent `next` pointers.
4. **Case 2: Arbitrary Binary Trees ([LeetCode 117]):** The **Dummy Head Sentinel (Sewing Needle)** technique stitching child frontiers in strictly $O(1)$ auxiliary space.
5. **Real-World Systems Architecture:** Database B+ Tree leaf page chaining in storage engines (MySQL InnoDB / SQLite) enabling $O(1)$ sequential range scans.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 80 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: PERFECT TREES       │                                     │    PART II: ARBITRARY TREES     │
│   Existing Pointer Navigation   │                                     │   The Sewing Needle Sentinel    │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Sibling: curr.left -> right   │                                     │ • LC 117: Missing Children Gap  │
│ • Cousin: curr.right -> next.left│                                    │ • Dummy Sentinel Node at d + 1  │
│ • Zero Queue: O(1) Extra Space  │                                     │ • Needle Stitching Next Tier    │
│ • Leftmost Vertical Descent     │                                     │ • Advance: curr = dummy.next    │
│ • Horizontal Level Walking      │                                     │ • B+ Tree Leaf Range Scan Link  │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* **Horizontal Pointer Linkage** populates each node's `next` pointer to point to its nearest horizontal neighbor to the right on the same depth tier. If no such neighbor exists, `next` is set to `null`.
  - *Core Invariants:*
    1. **Same-Level Reachability Invariant:** If node $v$ is immediately to the right of node $u$ at depth $d$, then $u.next == v$. If $u$ is the rightmost node at depth $d$, then $u.next == null$.
    2. **Perfect Cousin Invariant (LC 116):** For any node $u$ with $u.next \ne null$, $u.right.next = u.next.left$.
    3. **Dummy Needle Invariant (LC 117):** At level $d$, maintaining a dummy sentinel for level $d+1$ turns level $d+1$ into a singly linked list as level $d$ is traversed horizontally.
  - *Misconception Check:* A candidate often uses standard BFS with a `Queue<Node>`. While functionally correct, BFS requires $O(W) = O(N)$ heap memory (where $W \approx N/2$ in a balanced tree), which directly violates the explicit follow-up constraint: *"You may only use constant extra space. Can you do it with $O(1)$ extra space?"*
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the memory allocation and queue management overhead of BFS.
  - *Complexity Advantage:* Traverses every node and establishes horizontal pointers in $\Theta(N)$ time and strictly **$O(1)$ auxiliary space**, using the established pointers of level $d$ to sew the pointers of level $d+1$.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose / Signal Words:* "Populate next right pointers in each node", "connect nodes at the same level", "level-order traversal in O(1) space", "B+ Tree leaf node linkage".
  - *When to Avoid / Failure Modes:* If node mutations are concurrent or read-only, mutating `next` pointers introduces data race conditions.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Direct in-place mutation of 8-byte reference fields on the managed heap; zero queue allocation on Gen 0 GC heap; CPU cache prefetching along horizontal links.
  - *Production Systems:* B+ Tree leaf node horizontal double-linking in database storage engines (MySQL InnoDB, SQLite) allowing fast range scans (`BETWEEN A AND B`) without traversing back up to the root; Threaded Binary Trees.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To connect next right pointers in a perfect binary tree in O(1) space, I use the already linked parent level to link the child level: left child points to right child, and right child points to parent.next.left. For an arbitrary binary tree with missing nodes, I use a dummy sentinel node for the child level like a sewing needle, stitching children together as I walk horizontally across the parent level. When the parent level finishes, I jump to dummy.next, achieving O(N) time and strictly O(1) space."
  - *Interviewer Evaluation Lens:* Checks recognition of why standard BFS queue violates $O(1)$ space, mastery of the cousin linkage in LC 116, ability to design the dummy sentinel needle for missing children in LC 117, and proper level transition.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:* Time: $\Theta(N)$; Space: strictly $O(1)$ auxiliary space.
  - *State Transition Trace (LC 117):*
    `Parent Level: 1 -> dummy.next = null, needle = dummy -> 1 has left 2 (needle.next=2, needle=2), 1 has right 3 (needle.next=3, needle=3) -> parent done -> curr = dummy.next (2) -> repeat`.

---

### 1.1 Physical Mental Model — The Hospital Floor Lanyard Chain

**Analogy: Linking Hospital Patients on the Same Floor**

Picture a hospital with patients on multiple floors. Each floor is a tree level. Initially, every patient wears a badge holder (the `next` pointer) but it's empty. Your job is to connect all patients on the same floor with a chain so nurses can walk left-to-right without going up/down elevator shafts.

```
Before linking:          After linking:
Floor 0: [1]             [1] → null
          ↓↓                ↓↓
Floor 1: [2] [3]         [2] → [3] → null
          ↓↓  ↓↓             ↓↓   ↓↓
Floor 2: [4][5][6][7]   [4]→[5]→[6]→[7]→null
```

**The O(1)-Space Trick: Use the Already-Linked Floor Above**

You're standing on Floor 1 (which is already linked). Walk horizontally across Floor 1 using `curr.next` — and while you walk, stitch Floor 2's children together using a "needle" pointer.

```
Perfect Binary Tree (LC 116) — Two connection types:

Type 1 — Internal siblings (same parent):
  parent.left.next = parent.right

  [parent P]
   /       \
 [L]  →   [R]     ← L.next wired to R

Type 2 — Cousin nodes (different parents):
  parent.right.next = parent.next.left  (if parent.next exists)

  [parent P] → [parent Q]
        \          /
        [R]  →  [QL]     ← R.next wired to Q's left child

State trace (Level 1 already linked [2]→[3]):
  curr = [2], curr.next = [3]

  Process [2]:
    [2].left  = [4]: [4].next = [5] = [2].right    ← Type 1
    [2].right = [5]: [5].next = [6] = [2].next.left ← Type 2

  Process [3] (via curr = curr.next):
    [3].left  = [6]: [6].next = [7] = [3].right    ← Type 1
    [3].right = [7]: [7].next = null (no [3].next)

  Jump to Level 2: curr = [4] (leftmost of level)
```

**Arbitrary Binary Tree (LC 117) — Dummy Sentinel Needle:**

When some nodes are missing, use a dummy "sentinel" node to avoid null-pointer edge cases:

```
Tree:         [1]
             /   \
           [2]   [3]
             \     \
             [4]   [5]

Level 1: [2]→[3]→null  (already linked)

Walk Level 1 with needle:
  dummy → (needle starts here)
  curr=[2]: has right=[4] → needle.next=[4], needle=[4]
  curr=[3]: has right=[5] → needle.next=[5], needle=[5]
  curr=null: end of level

  dummy.next = [4]  → jump to Level 2: [4]→[5]→null  ✅

Memory: only 3 pointers needed (curr, needle, dummy) — no queue!
```

---

### 1.2 The Horizontal Linkage Problem

Given the definition of `Node`:
```csharp
public class Node
{
    public int val;
    public Node? left;
    public Node? right;
    public Node? next;
}
```
Initially, all `next` pointers are `null`. Our goal is to connect all nodes across each level horizontally:

```
Level 0:                 [ 1 ] ──> null
                       /       \
Level 1:            [ 2 ] ───────> [ 3 ] ──> null
                   /     \        /     \
Level 2:        [ 4 ] ──> [ 5 ] ─> [ 6 ] ──> [ 7 ] ──> null
```

---

### 1.2 LeetCode 116: Perfect Binary Tree Mechanics

In a **Perfect Binary Tree**, every internal node has **both** left and right children, and all leaves are at the exact same depth.
This rigid symmetry yields two distinct horizontal connection types:

#### 1. Sibling Connection (Same Parent)
Connecting `curr.left` to `curr.right` is trivial because they share the same parent:
$$\text{curr.left.next} = \text{curr.right}$$

#### 2. Cousin Connection (Cross-Parent Boundary)
How do we connect `curr.right` to `curr.next.left` across different subtrees?
Because level $d$ has **already been connected horizontally**, `curr.next` points directly to the next cousin parent!
$$\text{curr.right.next} = \text{curr.next.left}$$

```
                [ curr ] ────────────> [ curr.next ]
               /        \              /            \
         [ curr.left ]  [ curr.right ] [ curr.next.left ]
               │              ▲               ▲
               └──────────────┘               │
               Sibling Link                   │
                              └───────────────┘
                                 Cousin Link!
```

#### Traversal Algorithm:
1. Maintain `leftmost` pointing to the leftmost node of the current level.
2. While `leftmost.left != null`:
   - Iterate across the level using `curr = leftmost; while (curr != null) { ... curr = curr.next; }`
   - Advance down to the next level: `leftmost = leftmost.left`.

---

### 1.3 LeetCode 117: The Sewing Needle Architecture (Arbitrary Trees)

In an **Arbitrary Binary Tree**, nodes may have only a left child, only a right child, or no children at all.
The formula `curr.right.next = curr.next.left` **crashes catastrophically** because:
1. `curr.right` might be `null`.
2. `curr.next` might not have a left child!
3. Multiple cousins in between might be completely missing!

```
                [ 1 ] ──> null
               /     \
            [ 2 ] ──> [ 3 ] ──> null
           /   \         \
        [ 4 ]  [ 5 ]     [ 7 ] ──> null  (Node 6 is missing!)
```

#### The Sewing Needle Solution:
We maintain a **dummy sentinel node** (`dummy`) representing the head of level $d+1$, and a moving pointer `needle`:
1. At the start of level $d$, initialize `dummy = new Node(0); needle = dummy;`.
2. As `curr` walks horizontally across level $d$:
   - If `curr.left != null`:
     ```csharp
     needle.next = curr.left;
     needle = needle.next;
     ```
   - If `curr.right != null`:
     ```csharp
     needle.next = curr.right;
     needle = needle.next;
     ```
3. When `curr == null` (finished level $d$):
   - Level $d+1$ is now completely connected!
   - Advance to the next level: `curr = dummy.next;`
   - Reset `dummy.next = null; needle = dummy;`

```
Level d:       [ 2 ] ──────────────> [ 3 ] ──> null  (curr walks here)
               /   \                    \
Level d+1:  [ 4 ]  [ 5 ]                [ 7 ]
              ▲      ▲                    ▲
              │      │                    │
[ dummy ] ────┴──────┴────────────────────┘  (needle stitches here!)
```

---

### 1.4 ⚙️ Core Operations Deep-Dive: Sibling Pointer Weaving across Level Frontiers

#### Dimension 1: Operation Contract & Big-O Bounds

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               SIBLING WEAVING CONTRACT SPECIFICATION                              │
├───────────────┬───────────────────────────────┬───────────────────────────────────┬───────────────┤
│ OPERATION     │ PRECONDITIONS                 │ POSTCONDITIONS / GUARANTEES       │ TIME & SPACE  │
├───────────────┼───────────────────────────────┼───────────────────────────────────┼───────────────┤
│ Connect(root) │ Binary tree with next fields; │ All nodes at same depth linked    │ Time: Θ(N)    │
│ (Arbitrary)   │ initial next == null          │ horizontally; rightmost -> null.  │ Space: Θ(1)   │
├───────────────┼───────────────────────────────┼───────────────────────────────────┼───────────────┤
│ StitchChild   │ needle non-null sentinel;     │ Appends child to frontier list;   │ Time: Θ(1)    │
│               │ child non-null TreeNode       │ needle advances to child.         │ Space: Θ(1)   │
└───────────────┴───────────────────────────────┴───────────────────────────────────┴───────────────┘
```

- **Time Complexity Bounds:**
  - *Full Traversal:* Every node is visited once as a parent traversing level $d$, and its outgoing edges are evaluated in $O(1)$ time. Total time is strictly $\Theta(N)$.
- **Space Complexity:**
  - Auxiliary Memory: Strictly $\Theta(1)$ auxiliary space. A single sentinel node (`dummy`) and scalar pointers (`curr`, `needle`) manage the entire breadth traversal, eliminating the $O(W) \approx O(N)$ FIFO queue memory.

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                       ┌─────────────────────────┐
                       │   Connect(root)         │
                       │   curr = root           │
                       └────────────┬────────────┘
                                    │
                               curr != null ?
                                    │
                 ┌──────────────────┴──────────────────┐
                 ▼ (YES)                               ▼ (NO)
            needle = dummy                         RETURN root
            dummy.next = null
            (Horizontal Walk Across Level d)
            While curr != null:
              If curr.left != null:
                 needle.next = curr.left
                 needle = needle.next
              If curr.right != null:
                 needle.next = curr.right
                 needle = needle.next
              curr = curr.next
            (Advance to Level d+1 Frontier)
            curr = dummy.next
```

1. **Sewing Needle Level-Traversal Protocol:**
   - Initialize `curr = root`, and allocate a single reusable sentinel `dummy = new Node(0)`.
   - **Outer Loop (Level by Level):** While `curr != null`:
     - Reset the sewing needle: `needle = dummy; dummy.next = null;`.
     - **Inner Loop (Horizontal Walk across Level $d$):** While `curr != null`:
       - If `curr.left != null`: stitch `needle.next = curr.left; needle = needle.next;`.
       - If `curr.right != null`: stitch `needle.next = curr.right; needle = needle.next;`.
       - Advance horizontal cursor: `curr = curr.next;`.
     - **Advance Frontier:** Set `curr = dummy.next;` (the head of level $d+1$ captured by the dummy sentinel).
   - Return `root`.

---

#### Dimension 3: Visual ASCII State Transitions (Frontier Stitching Across Gaps)

```
LEVEL d (Connected):       [ 2 ] ─────────────────────────> [ 3 ] ──> null  (curr walks)
                          /     \                               \
LEVEL d+1 (Unconnected):[ 4 ]   [ 5 ]                          [ 7 ]

STEP 1: INITIAL STATE AT LEVEL d
   curr = [ 2 ]. needle = [ dummy ]. dummy.next = null.

STEP 2: PROCESS CURR = [ 2 ]
   - curr.left exists: [ 4 ].
     needle.next = [ 4 ]; needle = [ 4 ]. (dummy.next now points to 4!)
   - curr.right exists: [ 5 ].
     needle.next = [ 5 ]; needle = [ 5 ]. (4.next now points to 5!)
   - curr = curr.next ([ 3 ]).

STEP 3: PROCESS CURR = [ 3 ] (ACROSS GAP)
   - curr.left is null (Gap!).
   - curr.right exists: [ 7 ].
     needle.next = [ 7 ]; needle = [ 7 ]. (5.next now points directly to 7!)
   - curr = curr.next (null). Inner loop finishes!

STEP 4: TRANSITION TO LEVEL d+1
   - curr = dummy.next ([ 4 ]).
   - Level d+1 is now completely woven: [ 4 ] -> [ 5 ] -> [ 7 ] -> null!
```

---

#### Dimension 4: Invariant Preservation Proof

**Theorem (Correctness of Sibling Frontier Stitching):**
Traversing level $d$ via `next` pointers while sequentially appending non-null child nodes to `dummy.next` correctly establishes the horizontal linked list for level $d+1$.

*Proof by Induction on Depth $d$:*
1. **Base Case ($d = 0$):**
   Level 0 contains only `root`. `root.next` is initialized to `null`. This forms a valid 1-element horizontal list.
2. **Inductive Hypothesis:**
   Assume level $d$ is correctly connected from left to right:
   $$\text{Level}(d) = \langle u_1, u_2, \dots, u_k \rangle \quad \text{where } u_i.\text{next} = u_{i+1}$$
3. **Inductive Step:**
   The inner loop visits parents in order $u_1, u_2, \dots, u_k$.
   For each parent $u_i$, its non-null children are evaluated in order ($u_i.\text{left}$, then $u_i.\text{right}$).
   Because in any binary tree, all descendants of $u_i$ lie strictly to the left of all descendants of $u_{i+1}$ (for $i < i+1$), the sequence of children appended to `needle` is:
   $$\text{Children}(u_1) \circ \text{Children}(u_2) \circ \dots \circ \text{Children}(u_k)$$
   This sequence includes every non-null node at depth $d+1$ in strictly increasing horizontal column order.
   `dummy.next` points to the first non-null node at depth $d+1$, and the last child points to `null`.
   Therefore, level $d+1$ forms a valid horizontal list, completing the induction. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Scenario | Input Condition | Algorithmic Flow | Guarantee |
| :--- | :--- | :--- | :--- |
| **Empty Tree** | `root == null` | Outer loop condition `curr != null` is false | Returns `null` immediately |
| **Single Node Tree** | `root.left == null && root.right == null` | Inner loop finds zero children; `dummy.next == null` | Terminates after 1 iteration |
| **Level with All Null Children** | Entire frontier empty | `dummy.next` remains `null`; outer loop terminates | Clean exit at tree leaf level |
| **Sparse Tree with Huge Gaps** | Multi-node missing branches | `needle.next` bridges directly to next available cousin | Zero null reference exceptions |
| **Perfect Binary Tree** | All internal nodes full | Every sibling and cousin pair connected seamlessly | Runs in identical $\Theta(N)$ time |

---

## 2. 🔬 ANALYZE: Mathematical Complexity & Cache Locality

### 2.1 Space Complexity Comparison

| Algorithm | Time Complexity | Auxiliary Space | Space Classification |
| :--- | :--- | :--- | :--- |
| **Queue-Based BFS** | $\Theta(N)$ | $O(W) \approx \frac{N}{2}$ | $O(N)$ Heap Allocations |
| **Recursive DFS** | $\Theta(N)$ | $O(H)$ | $O(H)$ Stack Frames |
| **Horizontal Pointer Sewing** | $\mathbf{\Theta(N)}$ | $\mathbf{O(1)}$ | **Strictly Constant Space** |

### 2.2 Hardware Cache Locality in Level Traversals
Once `next` pointers are populated:
- Any subsequent level-order operation can traverse the tree using linear single-pointer dereferencing (`curr = curr.next`).
- CPU hardware spatial prefetchers can load consecutive sibling nodes into L1 cache lines, accelerating tree rendering and range query algorithms.

---

## 3. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

---

### 3.1 Problem 1: [LeetCode 116] Populating Next Right Pointers in Each Node (Medium)

> **Problem Description:**
> You are given a **perfect binary tree** where all leaves are on the same level, and every parent has two children.
> Populate each next pointer to point to its next right node. If there is no next right node, the next pointer should be set to `NULL`.
> Initially, all next pointers are set to `NULL`.
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[0, 2^{12} - 1]$.
> - $-1000 \le \text{Node.val} \le 1000$
> - **Follow up:** You may only use constant extra space.

#### Production C# Implementation (Strictly $O(1)$ Auxiliary Space)

```csharp
public class Solution116
{
    public Node Connect(Node root)
    {
        if (root == null) return null;

        Node leftmost = root;

        // While there is a next level to connect
        while (leftmost.left != null)
        {
            Node curr = leftmost;

            // Traverse horizontally across the current level
            while (curr != null)
            {
                // 1. Sibling Link: Left child points to right child
                curr.left.next = curr.right;

                // 2. Cousin Link: Right child points to next cousin's left child
                if (curr.next != null)
                {
                    curr.right.next = curr.next.left;
                }

                // Advance horizontally
                curr = curr.next;
            }

            // Advance down to the next level's leftmost node
            leftmost = leftmost.left;
        }

        return root;
    }
}
```

---

### 3.2 Problem 2: [LeetCode 117] Populating Next Right Pointers in Each Node II (Medium)

> **Problem Description:**
> Given a binary tree (which is **not necessarily perfect**), populate each next pointer to point to its next right node. If there is no next right node, the next pointer should be set to `NULL`.
> Initially, all next pointers are set to `NULL`.
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[0, 6000]$.
> - $-100 \le \text{Node.val} \le 100$
> - **Follow-up:** Can you do it in $O(1)$ extra space?

#### Production C# Implementation (The Sewing Needle Sentinel)

```csharp
public class Solution117
{
    public Node Connect(Node root)
    {
        if (root == null) return null;

        Node curr = root;

        // Dummy sentinel node anchors the start of the child level
        var dummy = new Node(0);

        while (curr != null)
        {
            Node needle = dummy;

            // Traverse the current level horizontally using existing next pointers
            while (curr != null)
            {
                if (curr.left != null)
                {
                    needle.next = curr.left;
                    needle = needle.next;
                }

                if (curr.right != null)
                {
                    needle.next = curr.right;
                    needle = needle.next;
                }

                curr = curr.next;
            }

            // Advance curr to the first node of the newly stitched child level
            curr = dummy.next;

            // Reset dummy sentinel for the subsequent tier
            dummy.next = null;
        }

        return root;
    }
}
```

---

## 4. 🏋️ PRACTICE: Guided Exercises & Problem Set

### 4.1 Guided Exercises

#### Exercise 1: [LeetCode 199] Binary Tree Right Side View (Revisited via Next Pointers)
- **Problem Statement:** After running `Connect`, extract the right side view of the tree in $O(1)$ auxiliary space.
- **Trigger Clue:** In each level $d$, the last node before `next == null` is the right side view!
- **Template Hint:** Start at `root`. In each level, walk `while (curr.next != null) curr = curr.next;`. Record `curr.val`, then advance to the next level's leftmost node.
- **Target Complexity:** $\Theta(N)$ time, strictly $O(1)$ auxiliary space!

#### Exercise 2: Print Level-by-Level Using Next Pointers
- **Problem Statement:** Print all node values level by level with line breaks without using a queue.
- **Trigger Clue:** Use `dummy.next` to transition between levels, and `curr.next` to traverse lines.
- **Target Complexity:** $\Theta(N)$ time, $O(1)$ space.

---

## 5. ⚡ HARDWARE & SYSTEMS CONNECTIONS

### 5.1 Database B+ Tree Leaf Page Chaining (MySQL InnoDB / SQLite)
In production relational database engines:
- Non-leaf B+ tree nodes contain search keys directing queries down to disk blocks.
- All leaf pages containing actual table rows are **horizontally chained together using next (and previous) block pointers**.
- When an application executes `SELECT * FROM Orders WHERE Date BETWEEN '2026-01-01' AND '2026-01-31'`, the database traverses down $O(\log N)$ to find the first date, and then **walks horizontally along the leaf level pointers in $O(1)$ space per page**, avoiding costly repeated tree traversals!

---

## 6. ⚠️ DAILY ERROR LOG & COMMON TRAPS

### Trap 1: Using a Queue and Claiming $O(1)$ Space
- **The Bug:** Writing a standard BFS with `Queue<Node>` and asserting it uses $O(1)$ space because "it doesn't use recursion".
- **The Failure:** The queue holds up to $N/2$ nodes at the widest level, consuming $O(N)$ memory and failing Big Tech follow-up interviews.
- **The Fix:** Use existing parent `next` pointers or the sewing needle dummy sentinel.

### Trap 2: Forgetting to Clear `dummy.next = null`
- **The Bug:** Omitting `dummy.next = null;` at the end of each tier.
- **The Failure:** If the last level consists entirely of leaves with no children, `dummy.next` retains the previous level's head, causing an infinite loop.
- **The Fix:** **Always reset `dummy.next = null;`** immediately before transitioning to the next level.

### Trap 3: Null Reference in Sibling Access on Imperfect Trees
- **The Bug:** Writing `curr.right.next = curr.next.left;` in LeetCode 117.
- **The Failure:** Throws `NullReferenceException` if `curr.next` is null, or if `curr.next.left` is null.
- **The Fix:** Never assume child existence in arbitrary trees; use the dummy needle pattern.

---

## 7. 🎯 DAILY CHECKPOINT & SELF-ASSESSMENT

### 1. Conceptual Verification
1. In [LeetCode 117], how does maintaining a dummy node for level $d+1$ allow us to traverse level $d$ and link level $d+1$ in strict $O(1)$ auxiliary space without a queue?
2. Why can the cousin connection `curr.right.next = curr.next.left` fail in an arbitrary binary tree, and how does the sentinel approach solve it?
3. Contrast standard BFS queue memory ($O(N)$ heap queue) with horizontal pointer traversal ($O(1)$ space). Under what hardware conditions does the $O(1)$ approach yield superior cache locality?

### 2. Implementation Audit
- Trace your `Connect` implementation on a tree where a parent node has only a right child, and its cousin has only a left child:
  `root = 1; 1.left = 2 (right = 4); 1.right = 3 (left = 5)`.
  Verify that node `4` connects directly to node `5` without throwing null reference exceptions.

---
*Next Module: **Week 12 — Day 81: Subtree Matching & Merging (LeetCode 572, 617, 652)***
