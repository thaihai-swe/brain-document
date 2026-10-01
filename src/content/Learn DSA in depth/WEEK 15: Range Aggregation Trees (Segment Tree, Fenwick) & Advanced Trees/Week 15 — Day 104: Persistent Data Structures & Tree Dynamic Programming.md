---
title: "Week 15 — Day 104: Persistent Data Structures & Tree Dynamic Programming"
---

# Week 15 — Day 104: Persistent Data Structures & Tree Dynamic Programming

Welcome to **Day 104 of your DSA Mastery Journey**!

Yesterday in [Day 103](./Week%2015%20%E2%80%94%20Day%20103:%20Order-Statistic%20Tree%20%28Rank%20Tree%29%20&%20Advanced%20Invariants.md), we conquered node augmentation by embedding subtree sizes to build the Order-Statistic Tree for $O(\log N)$ rank and selection queries.

Today, we cross into the frontier of **Advanced Tree Architectures and Dynamic Programming**:
1. **Persistent Data Structures (Path Copying):**
   - Transcending ephemeral data structures: creating versions that preserve historical states indefinitely without allocating redundant full copies.
   - **Path Copying:** Mutating an element at depth $D$ copies only the $D$ ancestor nodes along the root-to-node path ($O(\log N)$ in balanced trees), sharing all unmodified subtrees by reference.
   - **The Merkle / Git Architecture Connection:** Understanding how Git commits, blockchain state tries, and functional language compilers (`System.Collections.Immutable`) employ path copying for instantaneous time-travel branch snapshots.
2. **Tree Dynamic Programming (Tree DP):**
   - Generalizing dynamic programming from 1D sequences and 2D grids to arbitrary hierarchical DAGs / trees.
   - **Postorder Bottom-Up State Aggregation:** Formulating state vectors $(S_0, S_1, \dots)$ where parent decisions depend directly on children's sub-problem solutions.
   - Conquering the two classic Tier-1 interview archetypes:
     - **Maximum Independent Set on Trees:** [LeetCode 337] House Robber III (Rob vs. Skip state tuple).
     - **Minimum Vertex / Dominating Set:** [LeetCode 968] Binary Tree Cameras (3-State postorder machine: Uncovered, CoveredNoCamera, HasCamera).
     - **Global Path Optimization:** [LeetCode 124] Binary Tree Maximum Path Sum (Split arch path vs. Extendable single-branch gain).

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 104 ARCHITECTURE                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
         ┌────────────────────────────────────────┴────────────────────────────────────────┐
         ▼                                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│     PERSISTENT DATA STRUCTURES    │                             │       TREE DYNAMIC PROGRAMMING    │
│            (PATH COPYING)         │                             │       (POSTORDER STATE VECTOR)    │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Ephemeral: Mutates in-place.    │                             │ • Subproblem: Optimal state of    │
│ • Fully Persistent: All versions  │                             │   subtree rooted at node u.       │
│   can be queried and mutated.     │                             │ • Postorder traversal guarantees  │
│ • Path Copying Mechanism:         │                             │   left and right children solved  │
│   - Copy only nodes on path from  │                             │   before parent combines them.    │
│     root to updated node.         │                             │ • State Tuples:                   │
│   - Unmodified subtrees shared!   │                             │   - Robber: (Rob, Skip)           │
│ • Space: O(log N) per mutation!   │                             │   - Cameras: (Uncov, Cov, Cam)    │
│ • Foundations of Git & Immutable  │                             │ • Time: O(N) single pass          │
│   data structures (.NET CLR).     │                             │ • Space: O(H) call stack frames   │
└───────────────────────────────────┘                             └───────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition (Persistence):* A data structure is **persistent** if modifying an element produces a new version without destroying or mutating previous versions. In **Path Copying Persistence**, inserting or updating a key in a tree creates a new root and duplicates only the nodes along the descent path to that key; all unmodified subtrees are shared by reference between versions.
  - *Formal Definition (Tree DP):* **Tree Dynamic Programming** is an optimization technique that solves combinatorial or aggregation problems on trees by recursively computing optimal sub-solutions for subtrees in postorder (bottom-up), combining children state tuples into a parent state tuple in $O(1)$ time per node.
  - *Invariants:*
    - **Path Copying Invariant:** For any version $t$, root $R_t$ provides an immutable, valid view of the collection at time $t$. Any node shared between $R_t$ and $R_{t-1}$ is strictly read-only and structurally identical in both versions.
    - **Optimal Substructure on Trees:** The optimal solution for a subtree rooted at node $u$ depends strictly on the optimal sub-solutions of its child subtrees given the specific decision chosen at $u$.
  - *Misconception Check:*
    - *Persistence Misconception:* "Persistence requires cloning the entire tree ($O(N)$ space per update)." False! Path copying duplicates strictly $O(\text{height}) = O(\log N)$ nodes. The remaining $N - \log N$ nodes are shared by reference.
    - *Tree DP Misconception:* "Tree DP requires storing a `Dictionary<TreeNode, int>` or multi-dimensional DP array on the heap." False! Because postorder visits every node exactly once and dependencies flow strictly from children to parents, states can be returned directly up the call stack as value tuples `(int Rob, int Skip)`, consuming $O(H)$ stack space and zero heap allocations.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Persistence:* Solves the problem of destructive mutations in concurrent, multi-threaded, or audit-intensive environments. Eliminates locking and race conditions; enables instantaneous undo/redo and time-travel query features.
  - *Tree DP:* Solves the exponential $O(2^N)$ explosion of naive recursion on trees where parent choices overlap and recompute descendant subtrees repeatedly.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Persistent Trees: Building transactional memory systems, version control systems (like Git), geometric range queries (e.g. Persistent Segment Tree for dynamic range queries across time), or functional immutable collections.
    - Tree DP: Any tree problem asking for maximum independent set ("no two adjacent nodes"), minimum vertex cover ("all edges or nodes monitored"), path aggregates with turning points, or tree diameter.
  - *When to Avoid / Failure Modes:*
    - Persistence on unbalanced trees without rebalancing: degenerate linked lists degenerate path copying to $O(N)$ space and time per mutation.
    - Tree DP on cyclical graphs without spanning tree decomposition: causes infinite loops; graph DP requires DAG topological ordering or visited color states.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Memory Model:* In C#, persistent nodes are immutable (`readonly` properties or immutable records). Once allocated in Generation 0 of the CLR managed heap, historical nodes that remain referenced survive into Generation 2, while obsolete versions are collected naturally without affecting active version roots.
  - *Production Systems:*
    - **Git Object Model:** Git commits point to tree objects. When a file is updated, Git creates a new blob and new tree objects along the path to the repository root, while unchanged directory trees are referenced by their existing SHA-1 hashes (Merkle path copying).
    - **.NET `System.Collections.Immutable`:** `ImmutableSortedSet<T>` and `ImmutableDictionary<K, V>` are implemented as persistent AVL trees utilizing path copying.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "A persistent data structure preserves past versions upon mutation. In a persistent BST, instead of modifying pointers in-place, we use path copying: we clone only the $O(\log N)$ nodes along the path from the root to the target, creating a new root for the new version while sharing all untouched subtrees with previous versions. In Tree DP, we solve optimization problems on trees using a bottom-up postorder traversal. Each node returns a state tuple summarizing its subtree's optimal decisions—such as rob versus skip—allowing the parent to compute its optimal state in $O(1)$ time, yielding an overall $O(N)$ time and $O(H)$ stack space solution."
  - *Interviewer Evaluation Lens:* Checks whether candidate distinguishes ephemeral from persistent structures, computes the exact $O(\log N)$ path copying space bound, derives postorder Tree DP transitions cleanly without heap dictionaries, and handles edge cases like leaf and null states.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:*
    - Persistent BST `Insert`: $O(\log N)$ time, $O(\log N)$ auxiliary space (allocates $\log N$ new nodes).
    - Persistent BST `Search`: $O(\log N)$ time, $O(1)$ auxiliary space.
    - Tree DP `HouseRobberIII`: $O(N)$ time, $O(H)$ stack space.
    - Tree DP `BinaryTreeCameras`: $O(N)$ time, $O(H)$ stack space.

---

### 1.1 Physical Mental Model — Git Chapter Books & The Neighborhood Burglar

**Analogy 1 — Persistence: The Git Commit & Carbon-Copy Table of Contents**

Imagine you are authoring a massive 1,000-chapter book, and you want to publish Edition 2 by changing a single sentence in Chapter 42:
- **Destructive in-place rewrite:** You erase Chapter 42. Edition 1 is ruined and gone forever!
- **Naive cloning ($O(N)$):** You photocopy all 1,000 chapters. Massive paper waste!
- **Path Copying (Git Persistence, $O(\log N)$):**
  - You re-type **only Chapter 42**.
  - You create a new Edition 2 Table of Contents (new root).
  - Edition 2 points to your newly printed Chapter 42, but **points by reference to the existing printed pages** of all other 999 chapters!
  - Edition 1 and Edition 2 now coexist simultaneously in perfect harmony, sharing 99.9% of their physical paper!

```
Edition 1 Root: [Book v1]                Edition 2 Root: [Book v2]
                 │   \                                    /   │
                 │    └──> [Ch 1..41] (Shared Pages) <───┘    │
                 │         [Ch 43..1000] (Shared Pages)       │
                 ▼                                            ▼
          [Old Ch 42]                                   [New Ch 42]
```

---

**Analogy 2 — Tree DP: The Neighborhood Burglar (House Robber III)**

Houses in a mountain hamlet are connected like a binary tree. If a burglar robs two directly connected houses (parent and child) on the same night, security alarms ring.
You stand at house $u$. You don't need to try $2^N$ combinations.
Your scout returns just **two numbers** from each child: `(RobbedChild, SkippedChild)`:

```
                  [ House u: Loot = $10 ]
                 /                       \
      Left Sub-Village                Right Sub-Village
  Left: (Rob=$20, Skip=$15)       Right: (Rob=$30, Skip=$25)

The Decision at House u:
1. If I ROB House u ($10):
   -> My children MUST BE SKIPPED (alarms would trigger!).
   -> Total = $10 + Left.Skip ($15) + Right.Skip ($25) = $50!

2. If I SKIP House u ($0):
   -> My children can either be robbed or skipped—take whichever made more money!
   -> Total = $0 + max(20, 15) + max(30, 25) = $20 + $30 = $50!

Return up to parent: (Rob = $50, Skip = $50)
```

**Zero Heap Allocations:**
Only two integers `(int Rob, int Skip)` returned on the CPU stack per call frame. Runs in $\Theta(N)$ time and $O(H)$ memory!

---

### 1.2 Path Copying Mechanics & Merkle Tree Architecture

Consider a standard binary search tree. In an ephemeral tree, inserting or updating a key mutates child pointers directly, obliterating previous history:

```
Ephemeral In-Place Mutation:
       (4)                        (4)
      /   \                      /   \
    (2)   (6)       ===>       (2)   (6)
   /   \                      /   \
 (1)   (3)                  (1)   (3)
                                     \
                                     (3.5)  <-- Previous tree lost forever!
```

#### The Path Copying Technique
When creating Version 1 from Version 0 by inserting `3.5`:
1. Start at the root. We need to modify node `4`'s left child, node `2`'s right child, and node `3`'s right child.
2. We **duplicate node 4** $\to$ `4'`.
3. We **duplicate node 2** $\to$ `2'`. Node `4'`'s left child points to `2'`. Node `4'`'s right child points to the **existing, untouched node 6**!
4. We **duplicate node 3** $\to$ `3'`. Node `2'`'s left child points to the **existing, untouched node 1**!
5. Node `3'` gets a new right child `3.5`.
6. Version 0 is accessed via Root `(4)`. Version 1 is accessed via Root `(4')`.

```
Visualizing Structural Sharing via Path Copying:

Version 0 Root: [4]
                  \
                  [6] (Shared)
                  / \
                [5] [7] (Shared)

Version 0:                Version 1:
    [4]                       [4']  <-- Version 1 Root
   /   \                     /   \
 [2]    \                  [2']   \
 / \     \                 /  \    \
[1] [3]   \              [1]  [3']  \
           \             (S)    \    \
            =======> [6] <=======    \
                     / \              \
                   [5] [7]             \
                                        --> [3.5] (New)
```

**Key Observation:**
- Untouched nodes (`1`, `6`, `5`, `7`) are **shared by reference** between both versions.
- Memory allocated: exactly $1 + \text{depth} = 4$ new nodes, instead of copying all 7 nodes!
- If the tree has height $H = \log_2 N$, each insertion or update costs strictly **$O(\log N)$ time and $O(\log N)$ new node allocations**.

#### The Git Commit Tree Analogy
This is precisely how Git represents repository snapshots:
- A Git commit points to a root `Tree` object (representing the project root folder).
- Subdirectories are child `Tree` objects; files are `Blob` objects.
- When you edit a single file inside `src/core/utils.cs`:
  1. Git creates a new blob for `utils.cs`.
  2. Git creates a new tree for `core/`, pointing to the new `utils.cs` and sharing all other untouched files.
  3. Git creates a new tree for `src/`, pointing to the new `core/` tree and sharing other sibling folders.
  4. Git creates a new root commit tree, pointing to the new `src/` tree.
- A commit with 100,000 files in 1,000 folders where 1 file changed allocates only $\approx 4$ small tree objects, storing history with minimal storage overhead!

---

### 1.2 Tree Dynamic Programming (Tree DP) Mechanics

Dynamic programming on trees leverages the fundamental topological property of trees: **any non-empty subtree is structurally isolated from its sibling subtrees, connected solely through their common parent**.

#### The Postorder Execution Pattern
Because a parent's state depends on its children's states, Tree DP is implemented via **Postorder Depth-First Search (DFS)**:
```
Postorder Traversal Order:
1. Recursively compute Left Child State:   (Left_0, Left_1, ...)
2. Recursively compute Right Child State:  (Right_0, Right_1, ...)
3. Aggregate Children States into Parent:  (Parent_0, Parent_1, ...)
4. Return Parent State Vector to Caller.
```

#### Archetype 1: House Robber III (Maximum Independent Set)
Given a binary tree where each node has a monetary value `val`, determine the maximum amount of money you can rob without robbing two directly connected nodes (parent and child):
- At each node $u$, we define a 2-tuple:
  $$\mathbf{DP}(u) = (\text{Rob}_u, \text{Skip}_u)$$
- **Case 1: Rob Node $u$:**
  If we rob $u$, we **cannot** rob either of its children ($u.\text{Left}$ or $u.\text{Right}$). Therefore, we must take the `Skip` values of both children:
  $$\text{Rob}_u = u.\text{Val} + \text{Skip}_{\text{Left}} + \text{Skip}_{\text{Right}}$$
- **Case 2: Skip Node $u$:**
  If we skip $u$, its children are free to be either robbed or skipped! For each child, we greedily take the maximum of its `Rob` and `Skip` states:
  $$\text{Skip}_u = \max(\text{Rob}_{\text{Left}}, \text{Skip}_{\text{Left}}) + \max(\text{Rob}_{\text{Right}}, \text{Skip}_{\text{Right}})$$
- **Base Case (Null Node):**
  $$\mathbf{DP}(\text{null}) = (0, 0)$$
- **Result at Root:** $\max(\text{Rob}_{\text{root}}, \text{Skip}_{\text{root}})$.

---

### 1.3 CLR Memory Model & Immutability

In C# and the .NET Common Language Runtime (CLR):
1. **Object Allocation & Generational GC:**
   - When a node is created in a persistent BST, it is allocated in **Generation 0**.
   - As new versions are created, older roots and path-copied nodes that are kept in historical arrays survive GC sweeps, getting promoted to **Generation 1 and Generation 2**.
   - Unreferenced versions (e.g., dropped undo states) are reclaimed quickly in Gen 0/1 sweeps.
2. **Value Tuples for Zero Heap Allocation:**
   - In Tree DP, returning `(int Rob, int Skip)` utilizes C# `ValueTuple<int, int>`, which is a stack-allocated struct.
   - This achieves **zero heap allocations** throughout the entire traversal of millions of tree nodes, completely eliminating GC pressure.

---

### 1.4 ⚙️ Core Operations Deep-Dive: Persistent Trees & Tree DP State Machines

#### Dimension 1: Operation Contract & Big-O Bounds

##### 1. Persistent BST Insertion (`Insert`)
- **Signature:** `(int VersionId, PersistentNode<K, V> NewRoot) Insert(int versionId, K key, V value)`
- **Pre-conditions:** `versionId` is a valid version index ($0 \le \text{versionId} < \text{VersionCount}$), `key` is non-null and implements `IComparable<K>`.
- **Post-conditions:** Returns a new version identifier and root. The specified previous version is completely unchanged. Exactly $\text{depth} + 1$ new nodes are allocated.
- **Invariants:**
  1. *Version Immutability:* For any version $v < \text{newVersion}$, querying root $R_v$ produces identical results before and after the insertion.
  2. *Subtree Reference Equality:* For any child pointer not on the search path from $R_{\text{newVersion}}$ to the new node, `nodeNew.Child == nodeOld.Child` by reference.

##### 2. Tree DP: House Robber III (`RobTree`)
- **Signature:** `(int Rob, int Skip) RobSubtree(TreeNode? node)`
- **Pre-conditions:** `node` is the root of a binary tree with $N \ge 0$ nodes.
- **Post-conditions:** Returns a 2-tuple where `Rob` is the max money obtainable if `node` is robbed, and `Skip` is the max money if `node` is not robbed.
- **Invariants:**
  1. $\text{Rob}_u = u.\text{val} + \text{Left.Skip} + \text{Right.Skip}$.
  2. $\text{Skip}_u = \max(\text{Left.Rob}, \text{Left.Skip}) + \max(\text{Right.Rob}, \text{Right.Skip})$.

##### 3. Tree DP: Binary Tree Cameras (`MinCameraCover`)
- **Signature:** `CameraState Dfs(TreeNode? node, ref int cameras)`
- **Pre-conditions:** `node` is the root of a binary tree ($N \ge 1$).
- **Post-conditions:** Returns the coverage state of `node` ($0 = \text{Uncovered}, 1 = \text{CoveredNoCamera}, 2 = \text{HasCamera}$) while incrementing `cameras` to the minimal required count.
- **Invariants:**
  1. If either child is $0$ (Uncovered), node $u$ MUST place a camera: state becomes $2$, `cameras++`.
  2. Else if either child is $2$ (Has Camera), node $u$ is covered: state becomes $1$.
  3. Else (both children are $1$), node $u$ is uncovered: state becomes $0$.

##### Big-O Operational Complexity Matrix
| Operation | Time (Best) | Time (Avg) | Time (Worst) | Aux Space | Primary Bottleneck |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Persistent BST Insert** | $O(1)$ | $O(\log N)$ | $O(N)$ (skewed) | $O(\log N)$ heap | Path node duplication allocations on heap |
| **Persistent BST Search** | $O(1)$ | $O(\log N)$ | $O(N)$ (skewed) | $O(1)$ | Cache misses navigating node references |
| **Tree DP (Robber III)** | $O(N)$ | $O(N)$ | $O(N)$ | $O(H)$ stack | Stack frame recursion on unbalanced trees |
| **Tree DP (Cameras)** | $O(N)$ | $O(N)$ | $O(N)$ | $O(H)$ stack | Postorder state resolution on leaf-dense trees |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
====================================================================================================
                        TREE ARCHITECTURE SELECTION DECISION TREE
====================================================================================================
Does the problem require tracking historical versions or computing optimal tree states?
   │
   ├─► [Historical Versioning / Undo / Concurrent Snapshots]
   │      │
   │      └─► Need to query or branch from previous states without destructive overwrite?
   │             └─► YES: Use PATH COPYING PERSISTENCE:
   │                        • On Insert/Update: allocate cloned nodes along descent path.
   │                        • Point unmodified child branches to existing nodes from parent version.
   │                        • Save new root into Version Registry List<Node>.
   │
   └─► [Optimal Tree State / Subtree Combinatorics / Monitoring]
          │
          ├─► Problem requires choosing non-adjacent nodes (e.g. Robber III)?
          │      └─► 2-State Postorder Machine: (Rob, Skip)
          │             • Rob = val + left.Skip + right.Skip
          │             • Skip = max(left.Rob, left.Skip) + max(right.Rob, right.Skip)
          │
          ├─► Problem requires minimum coverage/monitoring (e.g. Binary Tree Cameras)?
          │      └─► 3-State Bottom-Up Greedy DP:
          │             • State 0: Uncovered (needs parent or self to monitor)
          │             • State 1: Covered without camera (monitored by child)
          │             • State 2: Has camera (monitors parent and children)
          │             • IF left == 0 || right == 0 => state = 2, cameras++
          │             • ELSE IF left == 2 || right == 2 => state = 1
          │             • ELSE => state = 0
          │             • Special Root Check: if root state == 0 => cameras++
          │
          └─► Problem requires maximum contiguous path (e.g. Max Path Sum [LC 124])?
                 └─► Single-Branch Gain vs. Arch Path DP:
                        • LeftGain = max(0, Dfs(node.left))
                        • RightGain = max(0, Dfs(node.right))
                        • GlobalMax = max(GlobalMax, node.val + LeftGain + RightGain)
                        • Return to parent: node.val + max(LeftGain, RightGain)
====================================================================================================
```

---

#### Dimension 3: Visual ASCII State Transitions

##### Trace A: Path Copying on Persistent BST
Inserting Key `15` into Version 0 containing `[10, 5, 20, 3]`:

```
Version 0:
       [10]_v0
      /       \
   [5]_v0    [20]_v0
   /
 [3]_v0

Descent Path for 15: Root [10] -> Right [20] -> Left [null]

Step 1: Clone [10] as [10]_v1.
        Left child of [10]_v1 points to existing [5]_v0!
Step 2: Clone [20] as [20]_v1.
        Right child of [10]_v1 points to [20]_v1.
Step 3: Attach new node [15]_v1 as left child of [20]_v1.
        Right child of [20]_v1 points to [20]_v0's right child (null).

Resulting Multi-Version Topology:
Version 0 Root: [10]_v0
Version 1 Root: [10]_v1

   [10]_v0                   [10]_v1
   /     \                  /       \
  |       --> [20]_v0      |         --> [20]_v1
  |                       |             /     \
  └--------> [5]_v0 <-----┘        [15]_v1    null
            /
          [3]_v0

Shared Nodes: [5]_v0, [3]_v0 (Zero re-allocation!).
Allocated Nodes: [10]_v1, [20]_v1, [15]_v1 (Exactly 3 nodes).
```

---

##### Trace B: Tree DP State Tuple Machine (House Robber III)
Tree Topology:
```
        [3]
       /   \
     [4]   [5]
     / \     \
   [1] [3]   [1]
```

```
Postorder Computation Trace:
1. Leaf [1] (Left-Left):
   - Rob = 1, Skip = 0 ==> State: (Rob: 1, Skip: 0)
2. Leaf [3] (Left-Right):
   - Rob = 3, Skip = 0 ==> State: (Rob: 3, Skip: 0)
3. Node [4] (Left Child):
   - Left child state: (1, 0), Right child state: (3, 0)
   - Rob = 4 + Left.Skip(0) + Right.Skip(0) = 4
   - Skip = max(1, 0) + max(3, 0) = 1 + 3 = 4
   - State for [4]: (Rob: 4, Skip: 4)

4. Leaf [1] (Right-Right):
   - Rob = 1, Skip = 0 ==> State: (Rob: 1, Skip: 0)
5. Node [5] (Right Child):
   - Left child is null: (0, 0), Right child state: (1, 0)
   - Rob = 5 + 0 + Right.Skip(0) = 5
   - Skip = max(0, 0) + max(1, 0) = 0 + 1 = 1
   - State for [5]: (Rob: 5, Skip: 1)

6. Root [3]:
   - Left child [4] state: (Rob: 4, Skip: 4)
   - Right child [5] state: (Rob: 5, Skip: 1)
   - Rob = 3 + Left.Skip(4) + Right.Skip(1) = 3 + 4 + 1 = 8
   - Skip = max(4, 4) + max(5, 1) = 4 + 5 = 9
   - State for Root [3]: (Rob: 8, Skip: 9)

Final Max Money: max(8, 9) = 9!
(Optimal strategy: Skip root, Rob [4] and Rob [5] -> 4 + 5 = 9).
```

---

#### Dimension 4: Invariant Preservation Proof

##### 1. Mathematical Proof of Version Immutability Under Path Copying
Let $T_v$ be the binary tree representing version $v$ with root $R_v$.
Let an insertion or update occur at target location $x$, where $x$ resides at depth $k$ along path $P = \langle u_0, u_1, \dots, u_k \rangle$ with $u_0 = R_v$ and $u_k = x$.
- **Path Copying Definition:** A new path $P' = \langle u'_0, u'_1, \dots, u'_k \rangle$ is allocated where each $u'_i$ is an exact value clone of $u_i$. For any child pointer of $u_i$ not pointing to $u_{i+1}$, $u'_i$ points to the identical existing node in $T_v$.
- **Proof of Version $v$ Invariant:**
  1. None of the nodes in $T_v$ undergo pointer modification or value reassignment.
  2. All references reachable from $R_v$ remain strictly identical in address, value, and topology.
  3. Therefore, $T_v$ is completely unaffected by the generation of $T_{v+1}$.
- **Proof of Version $v+1$ Correctness:**
  1. For every node $w \notin P$, the path from $R_{v+1}$ to $w$ branches off $P'$ at some node $u'_i$ to $w = \text{sibling}(u_{i+1})$.
  2. Because $u'_i$ inherits the exact child reference to $w$ from $u_i$, the entire subtree rooted at $w$ is identical to its representation in $T_v$.
  3. The updated or inserted node is attached at $u'_k$.
  4. Thus, $T_{v+1}$ accurately reflects the mutation while $T_v$ remains identical. $\blacksquare$

##### 2. Optimality Proof of Tree DP House Robber
Let $T_u$ be the subtree rooted at $u$.
We prove by induction on the height of $T_u$ that $(\text{Rob}_u, \text{Skip}_u)$ represent the exact maximum weight independent sets of $T_u$ under the constraints that $u$ is included or excluded respectively.
- **Base Case (Height 0, Leaf Node):**
  If $u$ is a leaf, $u.\text{Left} = \text{null}$ and $u.\text{Right} = \text{null}$.
  $\text{Rob}_u = u.\text{val} + 0 + 0 = u.\text{val}$ (optimal when robbing $u$).
  $\text{Skip}_u = 0 + 0 = 0$ (optimal when skipping $u$). Base case holds.
- **Inductive Step:**
  Assume the induction hypothesis holds for all subtrees of height $< H$. Let $T_u$ have height $H$.
  1. If $u$ is robbed: no adjacent node can be robbed. The children $L$ and $R$ must both be skipped. By induction hypothesis, $\text{Skip}_L$ and $\text{Skip}_R$ are the maximum independent set weights of $T_L$ and $T_R$ with their roots skipped. Thus $\text{Rob}_u = u.\text{val} + \text{Skip}_L + \text{Skip}_R$ is globally optimal for $T_u$ with $u$ robbed.
  2. If $u$ is skipped: the constraint between $u$ and its children is lifted. The optimal weight for $T_L$ can either rob $L$ or skip $L$, independently of $T_R$. Thus, taking $\max(\text{Rob}_L, \text{Skip}_L) + \max(\text{Rob}_R, \text{Skip}_R)$ yields the true supremum.
  By mathematical induction, the state equations preserve optimality for all nodes in the tree. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Archetype | Concrete Input Instance | Failure Mode / Danger | Defensive Guard & Mitigation |
| :--- | :--- | :--- | :--- |
| **Empty Tree Persistence** | `version = 0`, root is `null` | `NullReferenceException` on root access | Handle `null` root gracefully; inserting into empty version returns new single-node root |
| **Duplicate Key Insert in Persistent Tree** | `Insert(v0, 10, "A")` then `Insert(v1, 10, "B")` | Duplicate keys corrupting BST ordering | Standard BST replace: clone path and update `Value` without adding a new child node |
| **Degenerate Linked-List Tree** | Skewed tree of height $N$ | Path copying allocates $N$ nodes per insertion, degenerating space to $O(N^2)$ | In production, combine path copying with AVL or Red-Black balance rotations |
| **Single-Node Tree in House Robber** | `root = [42]` | Robber misses leaf state or crashes on null child access | Null child returns `(0, 0)`; root computes `(42, 0)`, returning $\max(42, 0) = 42$ |
| **Root Uncovered in Binary Tree Cameras** | `root = [0, 0, null, 0]` | Greedy postorder leaves root with state $0$ (uncovered) | After DFS completes, check: `if (Dfs(root) == State.Uncovered) cameras++;` |
| **All Negative Values in Max Path Sum** | `root = [-3, -2, -1]` | Accumulating negative sums dragging result below maximum single node | Clamp single-branch gain to zero: `Math.Max(0, Dfs(child))` |

---

## 2. 🎬 DEMONSTRATE: From-Scratch Production Implementation

Below is the complete, production-grade, generic C# implementation of:
1. `PersistentBst<TKey, TValue>`: An industrial-strength immutable binary search tree with path copying and version indexing.
2. `TreeDynamicProgramming`: Production implementations of House Robber III, Binary Tree Cameras, and Binary Tree Maximum Path Sum.
3. Unit Test Suite verifying version immutability, node allocation efficiency, and DP optimality.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedTrees.Day104
{
    // =========================================================================
    // PART 1: IMMUTABLE NODE & PERSISTENT BST VIA PATH COPYING
    // =========================================================================

    /// <summary>
    /// Represents an immutable node in a persistent binary search tree.
    /// All fields are strictly read-only to guarantee version immutability.
    /// </summary>
    public sealed class PersistentNode<TKey, TValue>
    {
        public TKey Key { get; }
        public TValue Value { get; }
        public PersistentNode<TKey, TValue>? Left { get; }
        public PersistentNode<TKey, TValue>? Right { get; }

        public PersistentNode(
            TKey key, 
            TValue value, 
            PersistentNode<TKey, TValue>? left = null, 
            PersistentNode<TKey, TValue>? right = null)
        {
            Key = key;
            Value = value;
            Left = left;
            Right = right;
        }

        /// <summary>
        /// Creates a clone of this node with an updated left child.
        /// </summary>
        public PersistentNode<TKey, TValue> WithLeft(PersistentNode<TKey, TValue>? newLeft) =>
            new PersistentNode<TKey, TValue>(Key, Value, newLeft, Right);

        /// <summary>
        /// Creates a clone of this node with an updated right child.
        /// </summary>
        public PersistentNode<TKey, TValue> WithRight(PersistentNode<TKey, TValue>? newRight) =>
            new PersistentNode<TKey, TValue>(Key, Value, Left, newRight);

        /// <summary>
        /// Creates a clone of this node with an updated value.
        /// </summary>
        public PersistentNode<TKey, TValue> WithValue(TValue newValue) =>
            new PersistentNode<TKey, TValue>(Key, newValue, Left, Right);
    }

    /// <summary>
    /// An industrial-strength, fully persistent Binary Search Tree utilizing Path Copying.
    /// Every insertion or update produces a new immutable version while sharing untouched subtrees.
    /// </summary>
    public sealed class PersistentBst<TKey, TValue> where TKey : IComparable<TKey>
    {
        private readonly List<PersistentNode<TKey, TValue>?> _roots = new();

        public int VersionCount => _roots.Count;

        public PersistentBst()
        {
            // Version 0: Empty tree
            _roots.Add(null);
        }

        /// <summary>
        /// Retrieves the root node of a specific version.
        /// </summary>
        public PersistentNode<TKey, TValue>? GetRoot(int version)
        {
            if (version < 0 || version >= _roots.Count)
                throw new ArgumentOutOfRangeException(nameof(version), $"Version {version} does not exist.");
            return _roots[version];
        }

        /// <summary>
        /// Inserts or updates a key-value pair based on an existing version,
        /// generating a new version via Path Copying in O(log N) time and space.
        /// </summary>
        public int Insert(int baseVersion, TKey key, TValue value)
        {
            PersistentNode<TKey, TValue>? baseRoot = GetRoot(baseVersion);
            PersistentNode<TKey, TValue> newRoot = InsertRecursive(baseRoot, key, value);
            _roots.Add(newRoot);
            return _roots.Count - 1;
        }

        private PersistentNode<TKey, TValue> InsertRecursive(
            PersistentNode<TKey, TValue>? current, 
            TKey key, 
            TValue value)
        {
            if (current == null)
            {
                // Reached insertion point: allocate new leaf
                return new PersistentNode<TKey, TValue>(key, value);
            }

            int comparison = key.CompareTo(current.Key);

            if (comparison < 0)
            {
                // Path Copying: duplicate current node, recursing down left subtree.
                // Right child is SHARED by reference!
                PersistentNode<TKey, TValue> newLeft = InsertRecursive(current.Left, key, value);
                return current.WithLeft(newLeft);
            }
            else if (comparison > 0)
            {
                // Path Copying: duplicate current node, recursing down right subtree.
                // Left child is SHARED by reference!
                PersistentNode<TKey, TValue> newRight = InsertRecursive(current.Right, key, value);
                return current.WithRight(newRight);
            }
            else
            {
                // Key exists: update value in cloned node, sharing both children
                return current.WithValue(value);
            }
        }

        /// <summary>
        /// Searches for a key in a specified historical version in O(log N) time and O(1) space.
        /// </summary>
        public bool TryGetValue(int version, TKey key, out TValue? value)
        {
            PersistentNode<TKey, TValue>? current = GetRoot(version);

            while (current != null)
            {
                int comparison = key.CompareTo(current.Key);
                if (comparison == 0)
                {
                    value = current.Value;
                    return true;
                }
                current = comparison < 0 ? current.Left : current.Right;
            }

            value = default;
            return false;
        }
    }

    // =========================================================================
    // PART 2: TREE DYNAMIC PROGRAMMING PRODUCTION SOLVERS
    // =========================================================================

    public sealed class TreeNode
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

    public static class TreeDynamicProgramming
    {
        // ---------------------------------------------------------------------
        // 1. LeetCode 337: House Robber III (2-State Tuple Machine)
        // ---------------------------------------------------------------------
        public static int Rob(TreeNode? root)
        {
            var (rob, skip) = RobDfs(root);
            return Math.Max(rob, skip);
        }

        private static (int Rob, int Skip) RobDfs(TreeNode? node)
        {
            if (node == null) return (0, 0);

            var (leftRob, leftSkip) = RobDfs(node.left);
            var (rightRob, rightSkip) = RobDfs(node.right);

            // If we rob this node, we cannot rob its children
            int rob = node.val + leftSkip + rightSkip;

            // If we skip this node, children can independently be robbed or skipped
            int skip = Math.Max(leftRob, leftSkip) + Math.Max(rightRob, rightSkip);

            return (rob, skip);
        }

        // ---------------------------------------------------------------------
        // 2. LeetCode 968: Binary Tree Cameras (3-State Dominating Set)
        // ---------------------------------------------------------------------
        public enum CameraCoverageState
        {
            Uncovered = 0,          // Leaf or node whose children have no camera
            CoveredNoCamera = 1,    // Monitored by a child's camera
            HasCamera = 2           // Actively hosting a camera
        }

        public static int MinCameraCover(TreeNode? root)
        {
            int cameraCount = 0;

            CameraCoverageState rootState = CameraDfs(root, ref cameraCount);

            // If root itself remains uncovered, we must place a camera on the root
            if (rootState == CameraCoverageState.Uncovered)
            {
                cameraCount++;
            }

            return cameraCount;
        }

        private static CameraCoverageState CameraDfs(TreeNode? node, ref int cameraCount)
        {
            // Base Case: Null nodes are considered already covered without a camera
            if (node == null) return CameraCoverageState.CoveredNoCamera;

            CameraCoverageState left = CameraDfs(node.left, ref cameraCount);
            CameraCoverageState right = CameraDfs(node.right, ref cameraCount);

            // Case 1: If either child is uncovered, current node MUST host a camera!
            if (left == CameraCoverageState.Uncovered || right == CameraCoverageState.Uncovered)
            {
                cameraCount++;
                return CameraCoverageState.HasCamera;
            }

            // Case 2: If either child has a camera, current node is monitored
            if (left == CameraCoverageState.HasCamera || right == CameraCoverageState.HasCamera)
            {
                return CameraCoverageState.CoveredNoCamera;
            }

            // Case 3: Both children are covered but neither has a camera => current node is uncovered
            return CameraCoverageState.Uncovered;
        }

        // ---------------------------------------------------------------------
        // 3. LeetCode 124: Binary Tree Maximum Path Sum
        // ---------------------------------------------------------------------
        public static int MaxPathSum(TreeNode? root)
        {
            int globalMax = int.MinValue;
            MaxGainDfs(root, ref globalMax);
            return globalMax;
        }

        private static int MaxGainDfs(TreeNode? node, ref int globalMax)
        {
            if (node == null) return 0;

            // Compute maximum single-branch gain from children (clamped to 0 if negative)
            int leftGain = Math.Max(0, MaxGainDfs(node.left, ref globalMax));
            int rightGain = Math.Max(0, MaxGainDfs(node.right, ref globalMax));

            // Arch path sum passing through current node as the turning point
            int archPathSum = node.val + leftGain + rightGain;

            // Update global maximum path
            if (archPathSum > globalMax)
            {
                globalMax = archPathSum;
            }

            // Return extendable single-branch gain to parent
            return node.val + Math.Max(leftGain, rightGain);
        }
    }

    // =========================================================================
    // PART 3: PRODUCTION VERIFICATION TEST SUITE
    // =========================================================================

    public static class Program
    {
        public static void Main()
        {
            Console.WriteLine("=================================================================");
            Console.WriteLine("  RUNNING DAY 104: PERSISTENT TREES & TREE DP VERIFICATION SUITE ");
            Console.WriteLine("=================================================================");

            TestPersistentBst_VersionIsolation();
            TestPersistentBst_PathCopyingSharing();
            TestHouseRobberIII_OptimalDecision();
            TestBinaryTreeCameras_MinimalCoverage();
            TestMaxPathSum_NegativeNodes();

            Console.WriteLine("\n[SUCCESS] ALL VERIFICATION TESTS PASSED!");
        }

        private static void TestPersistentBst_VersionIsolation()
        {
            var pbst = new PersistentBst<int, string>();

            // Version 0: Empty
            // Version 1: Add (10, "V1_10")
            int v1 = pbst.Insert(0, 10, "V1_10");

            // Version 2: Add (5, "V2_5") based on v1
            int v2 = pbst.Insert(v1, 5, "V2_5");

            // Version 3: Add (20, "V3_20") based on v2
            int v3 = pbst.Insert(v2, 20, "V3_20");

            // Version 4: Branch from v1! Add (15, "V4_15") directly to v1
            int v4 = pbst.Insert(v1, 15, "V4_15");

            // Verify Version 1: Contains 10, does NOT contain 5, 20, or 15
            Debug.Assert(pbst.TryGetValue(v1, 10, out string? val1) && val1 == "V1_10");
            Debug.Assert(!pbst.TryGetValue(v1, 5, out _));
            Debug.Assert(!pbst.TryGetValue(v1, 20, out _));
            Debug.Assert(!pbst.TryGetValue(v1, 15, out _));

            // Verify Version 2: Contains 10 and 5, does NOT contain 20 or 15
            Debug.Assert(pbst.TryGetValue(v2, 10, out _));
            Debug.Assert(pbst.TryGetValue(v2, 5, out string? val2) && val2 == "V2_5");
            Debug.Assert(!pbst.TryGetValue(v2, 20, out _));

            // Verify Version 3: Contains 10, 5, and 20
            Debug.Assert(pbst.TryGetValue(v3, 20, out string? val3) && val3 == "V3_20");

            // Verify Version 4: Contains 10 and 15, does NOT contain 5 or 20
            Debug.Assert(pbst.TryGetValue(v4, 10, out _));
            Debug.Assert(pbst.TryGetValue(v4, 15, out string? val4) && val4 == "V4_15");
            Debug.Assert(!pbst.TryGetValue(v4, 5, out _));
            Debug.Assert(!pbst.TryGetValue(v4, 20, out _));

            Console.WriteLine("✔ TestPersistentBst_VersionIsolation passed.");
        }

        private static void TestPersistentBst_PathCopyingSharing()
        {
            var pbst = new PersistentBst<int, int>();

            // Build base tree: 10, 5, 20, 3, 7
            int v1 = pbst.Insert(0, 10, 10);
            int v2 = pbst.Insert(v1, 5, 5);
            int v3 = pbst.Insert(v2, 20, 20);
            int v4 = pbst.Insert(v3, 3, 3);
            int v5 = pbst.Insert(v4, 7, 7);

            var rootV5 = pbst.GetRoot(v5)!;

            // Now insert 25 (goes into right subtree of 20).
            // Left subtree rooted at 5 (containing 5, 3, 7) MUST BE SHARED BY REFERENCE!
            int v6 = pbst.Insert(v5, 25, 25);
            var rootV6 = pbst.GetRoot(v6)!;

            // Verify root nodes are different instances
            Debug.Assert(!ReferenceEquals(rootV5, rootV6), "Roots should be different instances.");

            // Verify left child of root (node 5) is EXACTLY the same reference
            Debug.Assert(ReferenceEquals(rootV5.Left, rootV6.Left), "Left subtree must be shared by reference!");

            // Verify right child of root (node 20) is cloned
            Debug.Assert(!ReferenceEquals(rootV5.Right, rootV6.Right), "Right child on path must be cloned!");

            Console.WriteLine("✔ TestPersistentBst_PathCopyingSharing passed.");
        }

        private static void TestHouseRobberIII_OptimalDecision()
        {
            // Test Tree 1:
            //       3
            //      / \
            //     2   3
            //      \   \
            //       3   1
            // Optimal: 3 (root) + 3 (left.right) + 1 (right.right) = 7
            var tree1 = new TreeNode(3,
                new TreeNode(2, null, new TreeNode(3)),
                new TreeNode(3, null, new TreeNode(1))
            );
            Debug.Assert(TreeDynamicProgramming.Rob(tree1) == 7);

            // Test Tree 2:
            //       3
            //      / \
            //     4   5
            //    / \   \
            //   1   3   1
            // Optimal: Skip root, take 4 + 5 = 9
            var tree2 = new TreeNode(3,
                new TreeNode(4, new TreeNode(1), new TreeNode(3)),
                new TreeNode(5, null, new TreeNode(1))
            );
            Debug.Assert(TreeDynamicProgramming.Rob(tree2) == 9);

            Console.WriteLine("✔ TestHouseRobberIII_OptimalDecision passed.");
        }

        private static void TestBinaryTreeCameras_MinimalCoverage()
        {
            // Tree 1: [0, 0, null, 0, 0]
            //       0
            //      /
            //     0
            //    / \
            //   0   0
            // Answer: 1 camera placed at middle node 0
            var tree1 = new TreeNode(0,
                new TreeNode(0, new TreeNode(0), new TreeNode(0)),
                null
            );
            Debug.Assert(TreeDynamicProgramming.MinCameraCover(tree1) == 1);

            // Tree 2: [0, 0, null, 0, null, 0, null, null, 0] (Linear chain of 5 nodes)
            // Answer: 2 cameras
            var tree2 = new TreeNode(0,
                new TreeNode(0,
                    new TreeNode(0,
                        new TreeNode(0, null, new TreeNode(0)),
                        null),
                    null),
                null
            );
            Debug.Assert(TreeDynamicProgramming.MinCameraCover(tree2) == 2);

            Console.WriteLine("✔ TestBinaryTreeCameras_MinimalCoverage passed.");
        }

        private static void TestMaxPathSum_NegativeNodes()
        {
            // Tree 1: [-10, 9, 20, null, null, 15, 7]
            // Optimal: 15 + 20 + 7 = 42
            var tree1 = new TreeNode(-10,
                new TreeNode(9),
                new TreeNode(20, new TreeNode(15), new TreeNode(7))
            );
            Debug.Assert(TreeDynamicProgramming.MaxPathSum(tree1) == 42);

            // Tree 2: All negative [-3]
            var tree2 = new TreeNode(-3);
            Debug.Assert(TreeDynamicProgramming.MaxPathSum(tree2) == -3);

            Console.WriteLine("✔ TestMaxPathSum_NegativeNodes passed.");
        }
    }
}
```

---

## 3. 🥊 PRACTICE: High-Frequency Problem Walkthroughs

### Problem 1: LeetCode 337 — House Robber III (Medium)

> The thief has found himself a new place for his thievery again. There is only one entrance to this area, called `root`.
> Besides the `root`, each house has one and only one parent house. After a tour, the smart thief realized that all houses in this place form a binary tree. It will automatically contact the police if **two directly-linked houses were broken into on the same night**.
> Given the `root` of the binary tree, return *the maximum amount of money the thief can rob without alerting the police*.

#### 1. The Bottleneck of Naive Recursion
A naive recursive solution defines `Rob(node)`:
- If we rob `node`, we add `node.val` and recursively call `Rob` on all 4 grandchildren (`node.left.left`, `node.left.right`, etc.).
- If we skip `node`, we recursively call `Rob` on both children (`node.left`, `node.right`).
- **Complexity Disaster:** Each node calls its children and grandchildren, overlapping exponentially: $T(N) = 2T(N-1) + 4T(N-2) \implies O(2^N)$ time!

#### 2. The Tree DP State Transformation
Instead of returning a single integer, every node computes and returns a **2-state tuple**:
$$\mathbf{DP}(u) = (\text{Rob}_u, \text{Skip}_u)$$
- $\text{Rob}_u = u.\text{val} + \text{Left.Skip} + \text{Right.Skip}$
- $\text{Skip}_u = \max(\text{Left.Rob}, \text{Left.Skip}) + \max(\text{Right.Rob}, \text{Right.Skip})$
Because each node is visited exactly once in postorder DFS, time complexity collapses from $O(2^N)$ to **strictly $O(N)$** with $O(H)$ stack space!

---

### Problem 2: LeetCode 968 — Binary Tree Cameras (Hard)

> You are given the `root` of a binary tree. We install cameras on the tree nodes where each camera at a node can monitor its parent, itself, and its immediate children.
> Return *the minimum number of cameras needed to monitor all nodes of the tree*.

#### 1. Why Greedy Bottom-Up Works
Consider a leaf node. Should we put a camera on the leaf, or on the leaf's parent?
- A camera on the leaf monitors at most 2 nodes (leaf and parent).
- A camera on the leaf's parent monitors the parent, the parent's parent, and **all sibling leaves** (up to 4 nodes!).
- **Greedy Invariant:** Never place a camera on a leaf. Always place the camera on the leaf's parent to maximize coverage!

#### 2. The 3-State Postorder Machine
We classify every node into one of three mutual states:
- `State 0 (Uncovered)`: The node has no camera and is not monitored by any child.
- `State 1 (CoveredNoCamera)`: The node has no camera, but is successfully monitored by at least one child's camera.
- `State 2 (HasCamera)`: The node actively hosts a camera.

**Postorder Transitions:**
1. Base Case: `null` node is `CoveredNoCamera` (does not need a camera, and cannot monitor).
2. If `left == Uncovered || right == Uncovered`:
   - A child is crying for help! Current node **must place a camera**: state becomes `HasCamera`, `cameraCount++`.
3. Else if `left == HasCamera || right == HasCamera`:
   - At least one child has a camera shining upward: current node is `CoveredNoCamera`.
4. Else (both children are `CoveredNoCamera`):
   - Children are covered from below, but neither has a camera to cover the current node: current node becomes `Uncovered`.
5. **Terminal Root Check:** If DFS returns `Uncovered` for the root, place a final camera at the root (`cameraCount++`).

---

### Problem 3: LeetCode 124 — Binary Tree Maximum Path Sum (Hard)

> A **path** in a binary tree is a sequence of nodes where each pair of adjacent nodes has an edge connecting them. A node can only appear in the sequence at most once. Note that the path does not need to pass through the root.
> The **path sum** is the sum of the node's values in the path. Return *the maximum path sum of any non-empty path*.

#### 1. Path Architecture: Turning Point vs. Single-Branch Gain
Any path in a binary tree has a unique highest node—the **turning point (highest ancestor)**:
- At the turning point node $u$, the path can extend down into both the left and right subtrees:
  $$\text{ArchPathSum}(u) = u.\text{val} + \text{LeftGain} + \text{RightGain}$$
- However, to node $u$'s parent, node $u$ can only extend **one branch** (either left or right, not both, because paths cannot branch):
  $$\text{BranchGain}(u) = u.\text{val} + \max(0, \max(\text{LeftGain}, \text{RightGain}))$$
- Any negative child gain is discarded ($\max(0, \text{gain})$).
- Maintain a global variable `globalMax` updated at every node with `ArchPathSum(u)`. Return `BranchGain(u)` up the recursion stack.

---

## 4. 🔬 VERIFY: Production Quality Checklist & Daily Checkpoint

### Production Quality Verification Checklist
- [x] **Immutability Contract:** All fields in `PersistentNode<TKey, TValue>` are marked `readonly` to prevent accidental mutation of past versions.
- [x] **Structural Sharing Verification:** Asserted via `ReferenceEquals(rootV5.Left, rootV6.Left)` that unmodified subtrees share identical memory addresses across versions.
- [x] **Stack-Allocated DP Tuples:** Tree DP uses C# `(int, int)` value tuples, generating zero heap allocations during bottom-up recursion.
- [x] **Defensive Clamping:** Clamped child gains in `MaxPathSum` with `Math.Max(0, gain)` to prevent negative node subtrees from decreasing the overall path sum.
- [x] **Root Coverage Guard:** Implemented explicit post-DFS root check for `BinaryTreeCameras` (`if (rootState == Uncovered) cameras++`).

---

### 💡 Daily Checkpoint Answer

> **Question:** In a persistent binary search tree of $N$ nodes, how much auxiliary heap memory is allocated per insertion, and how does Git use this principle for tree commits?

**Architectural Answer:**
1. **Auxiliary Heap Allocation in Persistent BST:**
   - In a balanced persistent binary search tree of $N$ nodes, an insertion or update visits exactly $\approx \log_2 N$ nodes from the root to the leaf.
   - Using the **Path Copying technique**, only the nodes along this descent path are duplicated. Each duplicated node allocates a shallow object header (16 bytes on 64-bit CLR), method table pointer (8 bytes), and field references (`Key`, `Value`, `Left`, `Right` = 32 bytes), consuming $\approx 56$ bytes per node.
   - For a tree of $1,000,000$ nodes ($\log_2 N \approx 20$), an insertion allocates only $20 \times 56 \approx 1,120$ bytes ($1.1$ KB) of heap memory!
   - Storing $M$ historical versions requires **$O(N + M \log N)$ total space**, as opposed to $O(M \cdot N)$ for naive copying—a $\frac{N}{\log N}$ space savings of over $50,000\times$!

2. **Git's Implementation of Tree Commits:**
   - Git models repository directories as a directed acyclic Merkle Tree of immutable objects indexed by their cryptographic hash (SHA-1 / SHA-256).
   - A `commit` object points to a top-level `tree` object (the root folder). Subdirectories are child `tree` objects, and files are `blob` objects.
   - When a commit modifies a single file `docs/readme.md`:
     1. Git writes a new blob for `readme.md`.
     2. Git writes a new tree object for `docs/`, updating its pointer to the new blob while keeping all other file pointers identical.
     3. Git writes a new root tree object, updating its pointer to the new `docs/` tree while pointing to the untouched `src/`, `tests/`, and `build/` trees by their existing hashes.
   - Because unmodified directory subtrees share identical SHA hashes, **Git performs Merkle Path Copying**, enabling lightning-fast branch switching, tiny commit storage overhead, and cryptographically verifiable audit trails.
