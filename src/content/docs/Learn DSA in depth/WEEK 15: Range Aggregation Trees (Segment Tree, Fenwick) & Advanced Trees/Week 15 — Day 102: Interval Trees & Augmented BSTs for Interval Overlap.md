---
title: "Week 15 — Day 102: Interval Trees & Augmented BSTs for Interval Overlap"
---

# Week 15 — Day 102: Interval Trees & Augmented BSTs for Interval Overlap

Welcome to **Day 102 of your DSA Mastery Journey**!

Yesterday in [Day 101](./Week%2015%20%E2%80%94%20Day%20101:%20Segment%20Tree%20Range%20Updates%20&%20Lazy%20Propagation.md), we mastered Segment Tree Lazy Propagation, deferring updates via lazy tags to achieve $O(\log N)$ interval mutations.

Today, we explore an entirely distinct paradigm for managing intervals: **Augmented Balanced Binary Search Trees**, specifically the **Interval Tree** (Cormen, Leiserson, Rivest, Stein - CLRS):
1. **The Augmented BST Paradigm:** How augmenting a self-balancing BST (AVL or Red-Black) with a single subtree metadata field ($Max$) enables logarithmic geometric interval queries.
2. **The 5W1H Executive Blueprint:** Contract, invariants, search pruning guarantees, and systems applications.
3. **The Sacred Interval Search Theorem:** The rigorous mathematical proof guaranteeing that if an overlapping interval exists in the tree, branching left when $\text{left}.Max \ge qLow$ will never miss it.
4. **$O(1)$ Rotation Invariant Maintenance:** How recomputing $Max$ bottom-up preserves logarithmic self-balancing without increasing rotation overhead.
5. **From-Scratch Production Implementation:** Building an industrial-strength, self-balancing AVL-backed `IntervalTree` in C# with overlap search and collision detection.
6. **Hardware & Systems Memory Dive:** The Linux kernel Virtual Memory Area (VMA) manager (`mm/mmap.c`), augmented tree cache lines, and interval scheduling.
7. **LeetCode Lab:** Comprehensive architectural walkthroughs of:
   - **[LeetCode 252] Meeting Rooms**
   - **[LeetCode 253] Meeting Rooms II**
   - **[LeetCode 56] Merge Intervals**

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 102 ARCHITECTURE                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: AUGMENTED BST       │                                     │  PART II: INTERVAL THEOREM      │
│     Interval Node Structure     │                                     │     Pruning Search Guarantee    │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Node stores: [low, high]      │                                     │ • Query: [qLow, qHigh]          │
│ • BST Key: Ordered by 'low'     │                                     │ • Overlap:                      │
│ • Augmentation:                 │                                     │   low <= qHigh && qLow <= high  │
│   Max = max(high,               │                                     │ • Branch Decision:              │
│             left.Max,           │                                     │   If left != null &&            │
│             right.Max)          │                                     │      left.Max >= qLow:          │
│ • Self-Balancing: AVL rotations │                                     │      MUST branch LEFT!          │
│ • Max recalculated in O(1) time │                                     │   Else:                         │
│   during rotation rebalancing!  │                                     │      Branch RIGHT!              │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* An **Interval Tree** is an augmented self-balancing Binary Search Tree designed to store a dynamic collection of intervals and support point and range overlap queries in logarithmic time:
    1. Each node stores an interval $I = [low, high]$ where $low \le high$.
    2. Nodes are organized according to standard BST ordering keyed on the **low endpoint** ($u.low$).
    3. Each node $u$ is augmented with an additional attribute:
       $$u.Max = \max(u.high, \ u.\text{Left}?.Max \ ?? \ -\infty, \ u.\text{Right}?.Max \ ?? \ -\infty)$$
       which stores the maximum right endpoint found anywhere in the subtree rooted at $u$.
  - *Invariants:*
    - **BST Left-Endpoint Invariant:** For every node $u$, all intervals in $u.\text{Left}$ have $low \le u.low$, and all intervals in $u.\text{Right}$ have $low \ge u.low$.
    - **Subtree Max-Endpoint Invariant:** For every node $u$, $u.Max = \max \{ v.high \mid v \in \text{Subtree}(u) \}$.
    - **Interval Overlap Invariant:** Two intervals $A = [l_1, h_1]$ and $B = [l_2, h_2]$ overlap if and only if:
      $$l_1 \le h_2 \quad \text{and} \quad l_2 \le h_1$$
  - *Misconception Check:* Candidates often ask: "Why not key the BST by $high$?" Keying by $high$ destroys the Interval Search Theorem! If nodes are keyed by $high$, you cannot prune the right subtree when searching for overlaps.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the $O(N)$ linear scan required to find whether a new time slot or memory page collides with any existing allocation.
  - *Algorithmic Advantage:* An Interval Tree checks for an overlapping interval in strictly **$O(\log N)$ time**, and reports all $K$ overlapping intervals in $O(K \log N)$ time.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Online calendar scheduling with dynamic bookings (Airbnb, Google Calendar).
    - Memory management: Linux kernel Virtual Memory Area (VMA) range allocation.
    - Window management & 2D rendering: Bounding box collision detection.
    - Computational biology: Genomic sequence overlap analysis (finding overlapping gene annotations).
  - *When to Avoid / Failure Modes:*
    - If all intervals are static and known upfront, sorting by start time + Two Pointers / Sweep-Line is simpler and consumes zero pointer overhead.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Memory Model:* Each node requires:
    `int Low, High, Max, Height; IntervalNode Left, Right;` $\approx 48$ bytes on 64-bit CLR.
  - *Production Systems:* Linux kernel (`mm/mmap.c` `struct vm_area_struct`), GCC interval analysis, and Cisco router access control lists (ACLs).
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "An Interval Tree is a self-balancing BST keyed on interval start times, augmented so that each node stores the maximum end time in its subtree. When querying for an overlap with [qLow, qHigh], we check if the current node overlaps. If not, we inspect the left child's Max. If left.Max >= qLow, the Interval Search Theorem guarantees that if an overlap exists anywhere in the tree, at least one overlap exists in the left subtree, so we branch left. Otherwise, no interval in the left subtree can possibly reach qLow, so we safely prune left and branch right. This guarantees O(log N) overlap detection."
  - *Interviewer Evaluation Lens:* Checks whether candidate proves the Interval Search Theorem without hesitation, formulates the 2-way overlap condition ($l_1 \le h_2 \land l_2 \le h_1$), and correctly maintains $Max$ during tree rotations.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:*
    - `Insert(low, high)`: $O(\log N)$ time.
    - `Delete(low, high)`: $O(\log N)$ time.
    - `SearchOverlap(qLow, qHigh)`: $O(\log N)$ time.
    - `FindAllOverlaps(qLow, qHigh)`: $O(K \log N)$ time where $K$ is number of matches.
    - Space: $O(N)$ heap objects.

---

### 1.1 Physical Mental Model — Conference Room Bookings & The High-Water Mark

**Analogy: Booking a Conference Hall with a High-Water Mark**

Imagine managing meeting reservations in a busy convention center:
- Every meeting has a start time and an end time: $[low, high]$ (e.g. $[15:00, 20:00]$).
- All meetings are cataloged in a BST sorted strictly by **start time** ($low$).
- But start time alone cannot tell you if a meeting lasts 10 minutes or 10 hours!
- To prevent double-booking without checking every reservation in the building, each wing manager paints a **High-Water Mark ($Max$)** on the hallway wall:
  $$\text{High-Water Mark } (Max) = \text{The absolute latest any meeting ends anywhere in this wing!}$$

```
                [ Meeting [15, 20], Max = 30 ]  <-- Hallway Leader
               /                              \
  (Meetings starting <= 15)        (Meetings starting >= 15)
            ▼                                  ▼
[ Meeting [10, 30], Max = 30 ]      [ Meeting [17, 19], Max = 19 ]
```

---

**The High-Water Overlap Decision Rule:**

You want to book a new meeting $[qLow, qHigh] = [16:00, 18:00]$.
At each node, check if your meeting overlaps with the current meeting:
$$(\text{start}_1 \le \text{end}_2) \land (\text{start}_2 \le \text{end}_1) \implies \text{COLLISION!}$$

If current node does not overlap, look at the **Left Wing's High-Water Mark**:

```
Case A: left.Max < qLow (e.g. left.Max = 14:00, but your meeting starts at 16:00):
  Even the longest meeting in the entire left wing wraps up BEFORE you start!
  --> IMPOSSIBLE to collide with anyone on the left!
  --> PRUNE the entire left wing completely! Branch RIGHT!

Case B: left.Max >= qLow (e.g. left.Max = 30:00, and your meeting starts at 16:00):
  Some meeting in the left wing runs well past your start time!
  --> By the Interval Search Theorem: if an overlap exists anywhere,
      at least one collision MUST exist in the left wing!
  --> Branch LEFT with zero hesitation!
```

**Zero Backtracking:** You walk down exactly **one path** from root to leaf in $O(\log N)$ time to find an overlapping interval!

---

### 1.2 The Sacred Interval Search Theorem & Proof

The defining property of an Interval Tree is that searching for a single overlapping interval requires exploring **only a single path from root to leaf** ($O(\log N)$ steps), with **zero backtracking**!

```
                    [ Node u: [low, high], Max ]
                               /     \
                              /       \
                             ▼         ▼
                      [ Left Subtree ] [ Right Subtree ]
```

#### Theorem Statement:
To find an interval overlapping $Q = [qLow, qHigh]$:
1. If $u$ overlaps $Q$, return $u$.
2. If $u.\text{Left} \ne \text{null}$ and $u.\text{Left}.Max \ge qLow$, an overlapping interval is **guaranteed to exist in the left subtree** (if any overlap exists in the entire tree). Therefore, we can safely branch **LEFT**.
3. Otherwise, no interval in the left subtree can possibly overlap $Q$. We can safely prune the left subtree and branch **RIGHT**.

---

#### Formal Mathematical Proof:

##### Case 1: $u.\text{Left} \ne \text{null}$ and $u.\text{Left}.Max \ge qLow$
By definition of $Max$, there exists some interval $I = [l', h']$ in the left subtree such that:
$$h' = u.\text{Left}.Max \ge qLow$$
Since $I$ is in the left subtree, by the BST ordering invariant on $low$:
$$l' \le u.low$$

Now, does $I$ overlap $Q = [qLow, qHigh]$?
- We already know $qLow \le h'$ (since $h' \ge qLow$).
- If $l' \le qHigh$, then both overlap conditions hold ($l' \le qHigh \land qLow \le h'$), meaning **$I$ overlaps $Q$** in the left subtree!
- What if $l' > qHigh$?
  If $l' > qHigh$, then because $u.low \ge l'$, we have:
  $$u.low \ge l' > qHigh \implies u.low > qHigh$$
  Because all intervals $J = [l'', h'']$ in the **right subtree** have $l'' \ge u.low$, it follows that:
  $$l'' \ge u.low > qHigh \implies l'' > qHigh$$
  Therefore, **NO interval in the right subtree can possibly overlap $Q$** (all their start times are strictly greater than $qHigh$)!
  Nor can $u$ overlap $Q$.

**Conclusion for Case 1:** Either an overlap exists in the left subtree (at interval $I$), OR **no overlap exists anywhere in the entire tree**! Thus, branching LEFT is mathematically guaranteed never to miss an overlap! $\blacksquare$

---

##### Case 2: $u.\text{Left} = \text{null}$ or $u.\text{Left}.Max < qLow$
If $u.\text{Left}.Max < qLow$, then for *every* interval $[l, h]$ in the left subtree:
$$h \le u.\text{Left}.Max < qLow \implies h < qLow$$
Since its end time is strictly less than $qLow$, it ends before $Q$ even begins.
Therefore, **zero intervals in the left subtree can overlap $Q$**.
We can safely prune the left subtree entirely and search the right subtree! $\blacksquare$

---

### 1.2 Visual Trace: Interval Search

Consider an Interval Tree storing intervals:
`[15, 20]`, `[10, 30]`, `[17, 19]`, `[5, 20]`, `[12, 15]`, `[30, 40]`.

```
Tree Topology:
                     [15, 20] (Max = 40)
                    /                   \
        [10, 30] (Max = 30)          [17, 19] (Max = 40)
        /                  \                            \
   [5, 20] (Max = 20)   [12, 15] (Max = 15)           [30, 40] (Max = 40)
```

#### Query 1: Search Overlap for $Q = [14, 16]$:
```
1. Start at Root [15, 20] (Max = 40):
   - Overlap check: 15 <= 16 AND 14 <= 20? YES!
   - Root [15, 20] overlaps [14, 16]! Return [15, 20] immediately.
```

#### Query 2: Search Overlap for $Q = [21, 23]$:
```
1. Start at Root [15, 20] (Max = 40):
   - Overlap check: 15 <= 23 AND 21 <= 20? FALSE. (No overlap with root).
   - Inspect Left Child: Left child is [10, 30] with Max = 30.
   - Is left.Max >= qLow? (30 >= 21) --> YES!
   - By the Theorem, branch LEFT!

2. Move to Node [10, 30] (Max = 30):
   - Overlap check: 10 <= 23 AND 21 <= 30? YES!
   - MATCH FOUND: [10, 30] overlaps [21, 23]!
```

---

### 1.3 ⚙️ Core Operations Deep-Dive: Augmented Interval Tree Search & Rebalancing Invariants

#### Dimension 1: Operation Contract & Big-O Bounds

##### Augmented Interval Tree Operations (`SearchOverlap`, `SearchAllOverlaps`, `Insert`, `UpdateMax`)
- **Signatures:**
  - `public IntervalNode SearchOverlap(IntervalNode root, Interval q)`: Finds any single interval in the tree that overlaps query interval $q = [qLow, qHigh]$.
  - `public void SearchAllOverlaps(IntervalNode root, Interval q, List<Interval> results)`: Collects all $K$ overlapping intervals in output list.
  - `public IntervalNode Insert(IntervalNode root, Interval interval)`: Inserts new interval keyed by `Low`, rebalances via AVL/Red-Black rotations, updates `Max` annotations.
  - `private void UpdateMax(IntervalNode u)`: Recomputes $u.\text{Max} = \max(u.\text{High}, u.\text{Left}.\text{Max}, u.\text{Right}.\text{Max})$ in $O(1)$ time.
- **Preconditions:**
  - Every interval satisfies $Low \le High$.
  - BST ordering is keyed strictly on `Low` (with secondary tie-break on `High`).
  - $u.\text{Max}$ accurately reflects the maximum endpoint across the entire subtree rooted at $u$.
- **Postconditions:**
  - `SearchOverlap` returns a valid overlapping node ($l \le qHigh \land qLow \le h$) or `null` if and only if no overlap exists globally.
  - Tree remains balanced ($|\text{balance factor}| \le 1$ for AVL).
- **Complexity Bounds:**

| Operation | Time Complexity (Balanced) | Time Complexity (Skewed) | Auxiliary Space | Max Rotations |
| :--- | :--- | :--- | :--- | :--- |
| **`SearchOverlap`** | $O(\log N)$ | $O(N)$ | $O(1)$ iterative / $O(\log N)$ stack | 0 |
| **`SearchAllOverlaps`** | $O(K \log N)$ | $O(N)$ | $O(\log N)$ stack | 0 |
| **`Insert`** | $O(\log N)$ | $O(N)$ | $O(\log N)$ stack | $\le 2$ (AVL) |
| **`UpdateMax`** | $O(1)$ | $O(1)$ | $O(1)$ | 0 |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                     Augmented Interval Tree Overlap Search
                                       │
                                [curr = root]
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 │
              [curr == null?]                           │
                      │                                 │
           ┌──────────┴──────────┐                      │
          YES                    NO                     │
           │                     │                      │
     [Return null]         [curr overlaps Q?]           │
                                 │                      │
                           ┌─────┴─────┐                │
                          YES          NO               │
                           │           │                │
                     [Return curr]     ▼                │
                   [curr.Left != null &&                │
                    curr.Left.Max >= Q.Low?]            │
                                 │                      │
                           ┌─────┴─────┐                │
                          YES          NO               │
                           │           │                │
                   [curr = curr.Left]  [curr = curr.Right]
                           │           │                │
                           └─────┬─────┘                │
                                 │                      │
                                 └──────────────────────┘ Loop back
```

---

#### Dimension 3: Visual ASCII State Transitions

##### 1. Overlap Search Pruning Decision ($Q = [21, 23]$)
```
Root: [15, 20], Subtree Max = 40
Query Q = [21, 23]

Step 1: Check Root:
  Does [15, 20] overlap [21, 23]?
  15 <= 23 (true), but 21 <= 20 is FALSE -> No overlap with root.

Step 2: Inspect Left Subtree [10, 30] (Max = 30):
  left.Max (30) >= Q.Low (21)? TRUE!
  By Theorem 1: We are MATHEMATICALLY GUARANTEED that either an overlap
  exists in the left subtree, or NO overlap exists anywhere in the entire tree!
  Action: Branch LEFT. (Right subtree pruned!).

Step 3: Move to Left Child [10, 30]:
  Does [10, 30] overlap [21, 23]?
  10 <= 23 (true) AND 21 <= 30 (true) -> OVERLAP FOUND! Return [10, 30].
```

##### 2. AVL Rotation `Max` Field Recalculation
```
Right Rotation (LL Case):
        y (Max_y)                    x (Max_x)
       / \                          / \
      x   T3       ======>         T1  y
     / \                              / \
    T1  T2                           T2  T3

Bottom-Up Max Restoration:
Step 1: Recalculate y (now the child):
  y.Max = max(y.High, max(T2.Max, T3.Max))
Step 2: Recalculate x (now the root):
  x.Max = max(x.High, max(T1.Max, y.Max))
Subtree max invariant preserved in O(1) operations!
```

---

#### Dimension 4: Invariant Preservation Proof

##### Theorem 1: Interval Search Pruning Correctness
Let $u$ be the current node, and $Q = [qLow, qHigh]$ be the query interval.
Suppose $u$ does not overlap $Q$, and $u.\text{Left} \ne \text{null}$ with $u.\text{Left}.\text{Max} \ge qLow$.
1. **Existence in Left Subtree:**
   Since $u.\text{Left}.\text{Max} \ge qLow$, there exists some interval $I = [l', h']$ in the left subtree such that $h' = u.\text{Left}.\text{Max} \ge qLow$.
2. **BST Ordering:**
   Since $I$ is in the left subtree of $u$, by BST key ordering on `Low`:
   $$l' \le u.\text{Low}$$
3. **Case Analysis on $l'$:**
   - If $l' \le qHigh$: Since both $l' \le qHigh$ and $h' \ge qLow$ hold, interval $I$ overlaps $Q$. An overlap exists in the left subtree!
   - If $l' > qHigh$: Then $u.\text{Low} \ge l' > qHigh \implies u.\text{Low} > qHigh$.
     For every interval $J = [l'', h'']$ in the **right subtree** of $u$, BST ordering guarantees $l'' \ge u.\text{Low} > qHigh$.
     Since $l'' > qHigh$, interval $J$ starts after $Q$ ends, so no interval in the right subtree can possibly overlap $Q$.
4. **Conclusion:**
   Either the left subtree contains an overlapping interval, or no interval in the entire tree overlaps $Q$.
   Therefore, branching LEFT never eliminates a viable match, guaranteeing search correctness in $O(\log N)$ time.

##### Theorem 2: $O(1)$ Rebalancing Invariance
The augmented property is defined as:
$$\text{Max}(u) = \max(u.\text{High}, \text{Max}(u.\text{Left}), \text{Max}(u.\text{Right}))$$
Because $\text{Max}(u)$ depends exclusively on $u$'s own attributes and the precomputed $\text{Max}$ attributes of its immediate children, any local rotation (which changes only parent-child pointers between 2 or 3 nodes) allows exact bottom-up recomputation of $\text{Max}$ in $O(1)$ time, preserving tree balance and annotation invariants simultaneously.

---

#### Dimension 5: Edge Case Matrix

| Edge Case | State / Input | Algorithmic Mechanism | Invariant Preservation |
| :--- | :--- | :--- | :--- |
| **Empty Tree Search** | `root == null` | Base condition returns `null` immediately | Safe termination with zero exceptions |
| **No Overlapping Interval** | All intervals disjoint from $Q$ | Descends $O(\log N)$ levels until `curr == null`; returns `null` | Eliminates false positives |
| **Query Completely Left of Tree** | $qHigh < \min(Low)$ | Left subtree Max fails; right subtree pruned; terminates | Search halts in $O(\log N)$ steps |
| **Point Query Overlap** | $qLow == qHigh$ | Overlap condition $Low \le t \land t \le High$ evaluates identically | Finds intervals containing point $t$ |
| **Multiple Overlapping Intervals** | Several intervals overlap $Q$ | Single-search returns first encountered; all-search branches both ways | Correctness preserved for both APIs |
| **Identical Start Times** | $I_1.Low == I_2.Low$ | Placed in right subtree via tie-breaking ($Low_1 \le Low_2$) | BST property preserved without key collision loss |

---

## 2. 🎯 GUIDED PRACTICE: Architectural Patterns & Techniques

### Pattern 1: $O(1)$ Rotation Invariant Maintenance

When rebalancing an AVL-backed Interval Tree via single or double rotations, the `Max` attribute must be updated.
Because `Max` depends solely on a node's immediate interval and its two immediate children, recalculation is an $O(1)$ local operation:

```csharp
private static void UpdateNode(IntervalNode u)
{
    u.Height = 1 + Math.Max(Height(u.Left), Height(u.Right));
    
    int leftMax = u.Left?.Max ?? int.MinValue;
    int rightMax = u.Right?.Max ?? int.MinValue;
    
    u.Max = Math.Max(u.High, Math.Max(leftMax, rightMax));
}
```

```
Right Rotation (RotateRight on Y):
         Y                     X
        / \                   / \
       X   T3     ===>       T1  Y
      / \                       / \
     T1  T2                    T2  T3

Rebalancing Sequence:
1. Perform standard pointer swing: Y.Left = X.Right; X.Right = Y;
2. Update Y FIRST (since Y is now a child of X): UpdateNode(Y);
3. Update X SECOND (since X is now the parent of Y): UpdateNode(X);
Cost: Exactly 2 calls to UpdateNode() => O(1) time!
```

---

### Pattern 2: Interval Overlap Logic Invariant

Many developers write cumbersome nested `if` statements to test whether $[l_1, h_1]$ and $[l_2, h_2]$ overlap.
The mathematically minimal, bug-free condition is:

```csharp
public static bool Overlaps(int l1, int h1, int l2, int h2)
{
    return l1 <= h2 && l2 <= h1;
}
```

- If $l_1 > h_2$, interval 1 starts strictly after interval 2 ends $\implies$ Disjoint.
- If $l_2 > h_1$, interval 2 starts strictly after interval 1 ends $\implies$ Disjoint.
- Negating the disjoint condition gives $l_1 \le h_2 \land l_2 \le h_1$!

---

## 3. 💻 PRODUCTION IMPLEMENTATION: Clean C# Code

Below is the complete, self-balancing, AVL-backed `IntervalTree` in C#.
- Automatically maintains balance factor $BF \in \{-1, 0, +1\}$ guaranteeing $H \le 1.44 \log_2 N$.
- $O(1)$ `Max` maintenance during rotations.
- Strictly $O(\log N)$ `Insert` and `SearchOverlap`.
- Complete multi-overlap query: `FindAllOverlaps(qLow, qHigh)` in $O(K \log N)$ time.

```csharp
using System;
using System.Collections.Generic;

namespace AdvancedDSA.Trees
{
    public readonly record struct Interval(int Low, int High)
    {
        public bool Overlaps(Interval other) => Low <= other.High && other.Low <= High;
        public override string ToString() => $"[{Low}, {High}]";
    }

    /// <summary>
    /// Production-grade Self-Balancing AVL-backed Interval Tree.
    /// Supports O(log N) point and range overlap queries.
    /// </summary>
    public sealed class IntervalTree
    {
        private sealed class IntervalNode
        {
            public Interval Interval;
            public int Max;
            public int Height;
            public IntervalNode? Left;
            public IntervalNode? Right;

            public IntervalNode(Interval interval)
            {
                Interval = interval;
                Max = interval.High;
                Height = 1;
            }
        }

        private IntervalNode? _root;
        public int Count { get; private set; }

        /// <summary>
        /// Inserts an interval [low, high] into the Interval Tree in O(log N) time.
        /// </summary>
        public void Insert(int low, int high)
        {
            if (low > high) throw new ArgumentException($"Invalid interval: [{low}, {high}].");

            _root = InsertInternal(_root, new Interval(low, high));
            Count++;
        }

        private IntervalNode InsertInternal(IntervalNode? node, Interval interval)
        {
            if (node == null) return new IntervalNode(interval);

            // BST ordered by Low endpoint
            if (interval.Low < node.Interval.Low)
            {
                node.Left = InsertInternal(node.Left, interval);
            }
            else
            {
                node.Right = InsertInternal(node.Right, interval);
            }

            return Rebalance(node);
        }

        /// <summary>
        /// Searches for ANY interval in the tree that overlaps [qLow, qHigh].
        /// Guaranteed to find a match in strictly O(log N) time if an overlap exists.
        /// </summary>
        public Interval? SearchOverlap(int qLow, int qHigh)
        {
            if (qLow > qHigh) throw new ArgumentException($"Invalid query: [{qLow}, {qHigh}].");

            Interval query = new(qLow, qHigh);
            IntervalNode? curr = _root;

            while (curr != null)
            {
                // Check if current node overlaps
                if (curr.Interval.Overlaps(query))
                {
                    return curr.Interval;
                }

                // Interval Search Theorem:
                // If left child exists and its Max endpoint >= qLow, an overlap MUST exist in left subtree!
                if (curr.Left != null && curr.Left.Max >= qLow)
                {
                    curr = curr.Left;
                }
                else
                {
                    // Otherwise, left subtree cannot possibly contain an overlap
                    curr = curr.Right;
                }
            }

            return null;
        }

        /// <summary>
        /// Finds all intervals in the tree that overlap [qLow, qHigh].
        /// Time: O(K log N) where K is the number of overlapping intervals.
        /// </summary>
        public IReadOnlyList<Interval> FindAllOverlaps(int qLow, int qHigh)
        {
            if (qLow > qHigh) throw new ArgumentException($"Invalid query: [{qLow}, {qHigh}].");

            List<Interval> results = new();
            Interval query = new(qLow, qHigh);
            CollectOverlaps(_root, query, results);
            return results;
        }

        private void CollectOverlaps(IntervalNode? node, Interval query, List<Interval> results)
        {
            if (node == null) return;

            // Pruning: If the entire subtree's max endpoint is less than query.Low, prune!
            if (node.Max < query.Low) return;

            // 1. Explore left subtree if it could contain overlaps
            if (node.Left != null && node.Left.Max >= query.Low)
            {
                CollectOverlaps(node.Left, query, results);
            }

            // 2. Check current node
            if (node.Interval.Overlaps(query))
            {
                results.Add(node.Interval);
            }

            // 3. Explore right subtree if current node's Low <= query.High
            if (node.Interval.Low <= query.High)
            {
                CollectOverlaps(node.Right, query, results);
            }
        }

        #region AVL Self-Balancing & Max Maintenance

        private static int Height(IntervalNode? node) => node?.Height ?? 0;
        private static int MaxEndpoint(IntervalNode? node) => node?.Max ?? int.MinValue;
        private static int BalanceFactor(IntervalNode node) => Height(node.Left) - Height(node.Right);

        private static void Update(IntervalNode node)
        {
            node.Height = 1 + Math.Max(Height(node.Left), Height(node.Right));
            node.Max = Math.Max(node.Interval.High, Math.Max(MaxEndpoint(node.Left), MaxEndpoint(node.Right)));
        }

        private static IntervalNode RotateRight(IntervalNode y)
        {
            IntervalNode x = y.Left!;
            IntervalNode? t2 = x.Right;

            x.Right = y;
            y.Left = t2;

            Update(y);
            Update(x);

            return x;
        }

        private static IntervalNode RotateLeft(IntervalNode x)
        {
            IntervalNode y = x.Right!;
            IntervalNode? t2 = y.Left;

            y.Left = x;
            x.Right = t2;

            Update(x);
            Update(y);

            return y;
        }

        private static IntervalNode Rebalance(IntervalNode node)
        {
            Update(node);

            int bf = BalanceFactor(node);

            // Left-Heavy
            if (bf > 1)
            {
                if (BalanceFactor(node.Left!) < 0)
                {
                    node.Left = RotateLeft(node.Left!); // LR Case
                }
                return RotateRight(node); // LL Case
            }

            // Right-Heavy
            if (bf < -1)
            {
                if (BalanceFactor(node.Right!) > 0)
                {
                    node.Right = RotateRight(node.Right!); // RL Case
                }
                return RotateLeft(node); // RR Case
            }

            return node;
        }

        #endregion
    }
}
```

---

## 4. ⚡ HARDWARE & RUNTIME ARCHITECTURE: Cache, Memory & CLR Deep Dive

### 4.1 Real-World Systems Design: The Linux Kernel Virtual Memory Area (VMA) Tree

In the Linux operating system kernel (`mm/mmap.c`), every process maintains a list of memory mappings (executable code, stack, heap, shared libraries, `mmap` regions) represented as `struct vm_area_struct`:

```c
struct vm_area_struct {
    unsigned long vm_start;     // low endpoint
    unsigned long vm_end;       // high endpoint
    struct rb_node vm_rb;       // Red-Black Tree node
    unsigned long rb_subtree_gap; // Augmented subtree gap metadata!
};
```

```
Linux Kernel Virtual Memory Pipeline:
1. Process calls malloc() or mmap():
   - Kernel must find an unallocated memory hole of size S (e.g. [start, start + S]).
2. Collision Query:
   - Kernel queries the process's augmented Red-Black Interval Tree.
   - Bounded by O(log N) pointer comparisons to verify no existing VMA overlaps the range.
3. Fast Insertion:
   - New VMA inserted; Red-Black rotations maintain the tree with at most 2 rotations!
```

---

## 5. 🧩 LEETCODE LAB: Canonical Problems & Step-by-Step Breakdown

### Problem 1: [LeetCode 252] Meeting Rooms

**Difficulty:** Easy | **Frequency:** High (Amazon, Meta, Google)

#### Problem Statement
Given an array of meeting time intervals `intervals` where `intervals[i] = [start_i, end_i]`, determine if a person could attend all meetings.

#### Solution via Sorting (Sweep-Line):
```csharp
using System;

public class Solution
{
    public bool CanAttendMeetings(int[][] intervals)
    {
        if (intervals == null || intervals.Length <= 1) return true;

        Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));

        for (int i = 1; i < intervals.Length; i++)
        {
            // If current meeting starts before previous meeting ends, collision!
            if (intervals[i][0] < intervals[i - 1][1])
            {
                return false;
            }
        }

        return true;
    }
}
```
- **Complexity:** $O(N \log N)$ time, $O(1)$ space.

---

### Problem 2: [LeetCode 253] Meeting Rooms II

**Difficulty:** Medium | **Frequency:** Top 5 Most Asked Interval Problems (Google, Amazon, Meta, Bloomberg)

#### Problem Statement
Given an array of meeting time intervals `intervals` where `intervals[i] = [start_i, end_i]`, return the *minimum number of conference rooms required*.

#### Architectural Strategy: Two-Pointer Chronological Sweep vs Min-Heap
To find the maximum concurrent overlapping intervals:
1. Separate `start` times and `end` times into two arrays.
2. Sort both arrays ascending.
3. Advance chronological pointers:
   - When `starts[startPtr] < ends[endPtr]`, a new meeting begins before the earliest ongoing meeting finishes $\implies$ allocate a new room (`rooms++`, `startPtr++`).
   - Otherwise, an existing meeting ended $\implies$ free a room and advance (`endPtr++`, `startPtr++`).

#### Production C# Solution

```csharp
using System;

public class Solution
{
    public int MinMeetingRooms(int[][] intervals)
    {
        if (intervals == null || intervals.Length == 0) return 0;

        int n = intervals.Length;
        int[] starts = new int[n];
        int[] ends = new int[n];

        for (int i = 0; i < n; i++)
        {
            starts[i] = intervals[i][0];
            ends[i] = intervals[i][1];
        }

        Array.Sort(starts);
        Array.Sort(ends);

        int rooms = 0;
        int endPtr = 0;

        for (int startPtr = 0; startPtr < n; startPtr++)
        {
            if (starts[startPtr] < ends[endPtr])
            {
                rooms++; // Room collision: allocate new room
            }
            else
            {
                endPtr++; // Reuse existing room that just finished
            }
        }

        return rooms;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** Sorting takes $2 \times O(N \log N) \implies O(N \log N)$. Two-pointer linear sweep takes $O(N)$. Total Time: $\Theta(N \log N)$.
- **Space Complexity:** $O(N)$ for separate start and end arrays.

---

## 6. ⚠️ COMMON PITFALLS & ERROR LOG: Production Bug Audits

### Bug 1: Keying the BST by `high` Instead of `low`
- **Symptom:** Querying for an overlap returns `null` even though an overlapping interval is present in the tree.
- **Root Cause:** Ordering the BST by `high` invalidates the second half of the Interval Search Theorem proof! You can no longer guarantee that intervals in the right subtree start after the left subtree.
- **Fix:** The BST ordering must **strictly be based on `low`**.

### Bug 2: Missing `Max` Recomputation on Both Nodes during Rotation
- **Symptom:** Tree rebalances properly, but future overlap queries fail.
- **Root Cause:** After rotating $Y$ and $X$, only calling `Update(X)` (the new parent), leaving $Y$ (the child) with a stale `Max` attribute.
- **Fix:** Always update the lower child first, then the upper parent:
  ```csharp
  Update(y); // Update child first!
  Update(x); // Update parent second!
  ```

### Bug 3: Strict Inequality vs Inclusive Equality in Overlap Checks
- **Symptom:** Meeting at $[10, 20]$ is reported as colliding with meeting at $[20, 30]$.
- **Root Cause:** In meeting room problems, meeting ends at $20$ and the next starts at $20$, meaning they do **not** overlap. Using `<=` instead of `<` causes false positive collision reports.
- **Fix:** Distinguish open vs closed intervals:
  - Closed intervals: `l1 <= h2 && l2 <= h1`
  - Half-open intervals: `l1 < h2 && l2 < h1`

---

## 7. 🎯 DAILY CHECKPOINT QUESTIONS: Active Recall & Spoken Defense

### Checkpoint 1: Rigorous Proof of the Interval Search Theorem
**Question:** In an Interval Tree, if `left != null && left.Max >= qLow`, prove why branching left is guaranteed to find an overlap if any overlap exists in the entire tree.
<details>
<summary><b>View Architectural Answer</b></summary>

Let $I = [l', h']$ be an interval in the left subtree such that $h' = \text{left}.Max \ge qLow$.
Since $I$ is in the left subtree, by BST ordering, $l' \le u.low$.
There are two possibilities for $l'$:
1. $l' \le qHigh$: Since $qLow \le h'$ and $l' \le qHigh$, interval $I$ overlaps $Q$! An overlap exists in the left subtree.
2. $l' > qHigh$: Since $u.low \ge l'$, this implies $u.low > qHigh$.
Because all intervals in the right subtree have $low \ge u.low$, all intervals in the right subtree have $low > qHigh$.
Therefore, **no interval in the right subtree (or root) can possibly overlap $Q$**.
Conclusion: Either the left subtree contains an overlap, or no overlap exists anywhere in the entire tree. Branching left is guaranteed never to miss an overlap!
</details>

---

### Checkpoint 2: Interval Tree vs Segment Tree
**Question:** Compare an Interval Tree and a Segment Tree. When would you choose an Interval Tree over a Segment Tree?
<details>
<summary><b>View Architectural Answer</b></summary>

- **Segment Tree:** Operates over a **fixed, bounded coordinate domain** (e.g. $[0, N-1]$). Each node represents a fixed binary slice of the coordinate space. Excellent for range aggregations (sum, min, max) and range updates.
- **Interval Tree:** Operates over **dynamic, continuous arbitrary intervals** $[low, high]$ on an unbounded domain ($-\infty$ to $+\infty$). Each node stores an actual user interval.
- **When to choose Interval Tree:** When intervals are dynamically inserted and deleted over continuous floating-point or unbounded 64-bit coordinates without needing coordinate compression, and queries ask: "Which specific intervals overlap query $Q$?"
</details>

---

### Checkpoint 3: AVL vs Red-Black for Interval Trees
**Question:** Why did the Linux kernel choose Red-Black Trees rather than AVL Trees to implement its internal Virtual Memory Area (VMA) Interval Tree?
<details>
<summary><b>View Architectural Answer</b></summary>

In operating systems memory management, memory allocations (`mmap`, `malloc`) and deallocations (`munmap`, `free`) occur hundreds of thousands of times per second.
An AVL tree requires $O(\log N)$ rotations on deletion in the worst case.
A Red-Black tree guarantees **at most 2 rotations on insertion and at most 3 rotations on deletion**.
Because each rotation in an Interval Tree requires recomputing the augmented `Max` attribute, the strict $O(1)$ upper bound on rotations in Red-Black trees provides predictable, sub-microsecond latency, preventing kernel thread scheduling jitter.
</details>

---

### Daily Mastery Checklist
- [x] Mastered the augmented BST interval architecture (BST on `low`, augmented with `Max`).
- [x] Formulated and proved the Sacred Interval Search Theorem.
- [x] Engineered an industrial-strength self-balancing AVL `IntervalTree` in C#.
- [x] Verified $O(1)$ `Max` maintenance during tree rotations.
- [x] Solved and analyzed [LeetCode 252], [LeetCode 253] Meeting Rooms I & II.
- [x] Examined the Linux kernel Virtual Memory Area (VMA) augmented tree memory model.
