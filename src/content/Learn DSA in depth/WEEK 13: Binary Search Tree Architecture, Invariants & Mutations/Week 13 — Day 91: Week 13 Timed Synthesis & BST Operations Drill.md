---
title: "Week 13 — Day 91: Week 13 Timed Synthesis & BST Operations Drill"
---

# Week 13 — Day 91: Week 13 Timed Synthesis & BST Operations Drill

Welcome to **Day 91 of your DSA Mastery Journey**!

Yesterday in [Day 90](./Week%2013%20%E2%80%94%20Day%2090:%20Recover%20BST%20&%20Two%20Swapped%20Nodes%20In-Order%20Traversal.md), we mastered the Two-Swapped-Nodes Inversion Theorem, $O(1)$-space Morris tree recovery, and complete BST rebalancing.

Today is our **Week 13 Timed Synthesis & BST Operations Drill**. We synthesize the entire week's concepts under timed interview conditions:
1. **Reverse In-Order Suffix Accumulation ([LeetCode 538 / 1038]):** Transforming a BST into a Greater Sum Tree using Right $\to$ Root $\to$ Left traversal in both recursive DFS and strictly $O(1)$-space Reverse Morris Traversal.
2. **Nearest-Neighbor Search in BSTs ([LeetCode 270]):** Finding the closest value to a continuous target in $O(H)$ time and $O(1)$ space via logarithmic branch pruning.
3. **The $K$-Closest Elements Dual-Stack Algorithm ([LeetCode 272]):** Eliminating the naive $O(N)$ full traversal and $O(N \log K)$ heap solutions by deploying **Dual In-Order Predecessor and Successor Stacks**, achieving the optimal **$O(H + K)$ time** Big Tech standard.
4. **Systems Architecture:** Nearest-Neighbor spatial search in multi-dimensional trees ($k$-d trees, R-Trees) and PostgreSQL GiST index range expansion.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 91 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: REVERSE IN-ORDER    │                                     │     PART II: K-CLOSEST VALUES   │
│   Suffix Sum Accumulation       │                                     │   Dual Predecessor/Successor    │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • LC 538 / 1038: Greater Tree   │                                     │ • LC 270: Single Closest (O(H)) │
│ • Order: Right -> Root -> Left  │                                     │ • LC 272: K Closest Values      │
│ • Running Sum: sum += node.val  │                                     │ • Naive: O(N) Inorder or Heap   │
│ • Reverse Morris: O(1) Memory   │                                     │ • Optimal: Dual Stacks O(H + K) │
│ • Replace Node Value in-place   │                                     │ • Two-Pointer Merge on Stacks   │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:*
    - **Greater Tree Conversion (LC 538 / 1038):** Replace every node value in a BST with the sum of all keys in the tree greater than or equal to the original key.
    - **Single Closest Value (LC 270):** Given root of BST and target floating-point number, find the node value closest to the target.
    - **$K$ Closest Values (LC 272):** Find the $k$ values in the BST that are closest to the target, returned in any order.
  - *Core Invariants:*
    1. **Reverse In-Order Suffix Invariant:** Visiting nodes in **Right $\to$ Root $\to$ Left** order processes keys in strictly descending order ($k_n > k_{n-1} > \dots > k_1$). Maintaining a running sum `sum += node.val` yields the exact suffix sum of all elements $\ge node.val$.
    2. **Branch Pruning Proximity Invariant:** If $target < node.val$, all nodes in the right subtree are strictly farther from $target$ than $node.val$. Therefore, the closest element can only be updated by descending into the left subtree.
    3. **Dual-Stack Cursor Invariant:** By maintaining a predecessor stack (nodes $\le target$) and a successor stack (nodes $> target$), the top elements of the two stacks represent the next closest candidates on either side of the target.
  - *Misconception Check:* In [LeetCode 272], many candidates perform a full in-order traversal into an array ($O(N)$), or maintain a bounded Max-Heap of size $K$ ($O(N \log K)$). While both pass easy test suites, Big Tech interviewers explicitly ask: *"Can you solve it in $O(H + K)$ time where you only visit the relevant nodes?"*
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Prevents full-tree materialization ($O(N)$) when $K \ll N$.
  - *Complexity Advantage:* Reduces $K$-closest search from $O(N)$ to strictly **$O(H + K)$ time**, descending directly to the target locus in $O(H)$ and expanding outward by $K$ steps.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Nearest-neighbor queries, metric distance bounding, cumulative percentile transforms, and range expansion in sorted indexes.
  - *When to Avoid / Failure Modes:* If the target distance metric is non-monotonic or non-Euclidean across multiple dimensions, multi-dimensional structures ($k$-d trees, VP-trees) must replace 1D BSTs.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Reverse Morris Traversal mutates and restores `left` predecessor pointers temporarily, using 0 bytes of heap and stack memory. Dual-stack $K$-closest allocates two small `Stack<TreeNode>` instances bounded by $2H$ references ($\approx 320$ bytes).
  - *Production Systems:* Spatial index k-Nearest-Neighbor (k-NN) queries in PostgreSQL PostGIS, point-in-time financial order book liquidity depth accumulation, and geographic bounding box expansions.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To convert a BST to a Greater Tree, I perform a reverse in-order traversal—Right, Root, Left—which visits keys in descending order, accumulating a running sum and updating each node in O(N) time and O(H) space, or O(1) space via Reverse Morris. For K-closest values, instead of a full O(N) scan, I build two spine stacks: a predecessor stack for nodes less than or equal to target, and a successor stack for nodes greater than target in O(H) time. Then, I repeatedly compare the top elements of both stacks and pop the closer one K times, achieving the optimal O(H + K) time standard."
  - *Interviewer Evaluation Lens:* Checks whether candidate understands reverse in-order traversal, knows how to prune single closest value search in $O(H)$, and can construct the optimal $O(H + K)$ dual-stack solution for LC 272.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:*
    - Greater Tree ([LC 538]): Time: $\Theta(N)$; Auxiliary Space: $O(H)$ recursive / $O(1)$ Morris.
    - Closest Value ([LC 270]): Time: $O(H)$; Auxiliary Space: Strictly $O(1)$.
    - $K$ Closest Values ([LC 272]): Time: $O(H + K)$; Auxiliary Space: $O(H + K)$.
  - *State Transition Trace (LC 538 on `[4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]`):*
    - Traversal order: `8 -> 7 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1 -> 0`.
    - `sum` progression: `8 -> 15 -> 21 -> 26 -> 30 -> 33 -> 35 -> 36 -> 36`.
    - Nodes updated in-place with exact cumulative suffix sums!

---

### 1.1 Physical Mental Model — Downhill Snowball & The Two Elevator Carts

**Analogy 1 — Greater Tree (LC 538): The Downhill Snowball**

Standard in-order climbs the hill from smallest to largest (`Left -> Root -> Right`).
To add up all numbers greater than or equal to each node:
- Climb directly to the **highest peak** (the absolute rightmost node).
- Pack a snowball and roll it **downhill in reverse in-order** (`Right -> Root -> Left`).
- Every house you pass in descending order adds its own snow to the snowball, and the snowball writes its total current weight directly into that house's ledger!

```
Peak Start: [ 7 ] ──> [ 6 ] ──> [ 5 ] ──> [ 4 ] ──> [ 1 ] (Descending Walk)

Snowball Weight Accumulation:
  House 7: absorbs 7  -> ledger = 7
  House 6: absorbs 6  -> ledger = 13
  House 5: absorbs 5  -> ledger = 18
  House 4: absorbs 4  -> ledger = 22
  House 1: absorbs 1  -> ledger = 23
```

---

**Analogy 2 — K Closest Values (LC 272): Two Elevator Carts at the Target Floor**

Suppose target altitude is $3.71$. Don't scan the entire million-node mountain!
Drop two elevator cables directly from the peak to the target floor in $O(H)$ time:
- **Left Elevator (Predecessor Stack):** Suspends all nodes $\le 3.71$ (e.g. top is `3`).
- **Right Elevator (Successor Stack):** Suspends all nodes $> 3.71$ (e.g. top is `4`).

```
Target = 3.71

  Left Elevator Top:  [ 3 ]     <-- Diff: |3.71 - 3| = 0.71  (CLOSER! Pick 3)
  Right Elevator Top: [ 5 ]     <-- Diff: |3.71 - 5| = 1.29

Decision:
  1. Compare top of Left vs top of Right.
  2. The one with smaller distance is selected.
  3. Advance that elevator by stepping to its next neighbor in O(1) amortized time.
  4. Repeat K times -> Done in strictly O(H + K) time!
```

---

### 1.2 Reverse In-Order Traversal: The Right-Root-Left Paradigm

Standard In-Order visits: $\text{Left} \to \text{Root} \to \text{Right} \implies$ **Ascending Order**.
**Reverse In-Order** visits: $\text{Right} \to \text{Root} \to \text{Left} \implies$ **Descending Order**.

```
Tree:               [ 4 ]
                   /     \
                [ 1 ]   [ 6 ]
                       /     \
                    [ 5 ]   [ 7 ]

Descending Order: 7 -> 6 -> 5 -> 4 -> 1
Running Sum:
- Visit 7: sum = 0 + 7 = 7  --> Node(7).val = 7
- Visit 6: sum = 7 + 6 = 13 --> Node(6).val = 13
- Visit 5: sum = 13 + 5 = 18 -> Node(5).val = 18
- Visit 4: sum = 18 + 4 = 22 -> Node(4).val = 22
- Visit 1: sum = 22 + 1 = 23 -> Node(1).val = 23
```

---

### 1.2 The $K$-Closest Elements Dual-Stack Algorithm ([LeetCode 272])

To achieve optimal **$O(H + K)$ time**, we treat the BST like a sorted array with a cursor at `target`, expanding outward using two stacks:

```
Target: 3.714286, K = 3
Tree:
                 [ 4 ]
                /     \
             [ 2 ]   [ 5 ]
            /     \
         [ 1 ]   [ 3 ]

Predecessor Stack (Nodes <= Target):     Successor Stack (Nodes > Target):
[ 4 ]                                    [ 4 ]
[ 2 ]                                    (Top = 4)
[ 3 ] (Top = 3)

Step 1: Compare |3 - 3.71| = 0.71 vs |4 - 3.71| = 0.29.
        Node(4) is closer! Pop 4. Advance Successor Stack. Output: [ 4 ]
Step 2: Compare |3 - 3.71| = 0.71 vs |5 - 3.71| = 1.29.
        Node(3) is closer! Pop 3. Advance Predecessor Stack. Output: [ 4, 3 ]
Step 3: Compare |2 - 3.71| = 1.71 vs |5 - 3.71| = 1.29.
        Node(5) is closer! Pop 5. Advance Successor Stack. Output: [ 4, 3, 5 ]
Done! Total Steps: O(H + K).
```

---

### 1.3 ⚙️ Core Operations Deep-Dive: Dual-Stack In-Order Predecessor/Successor $O(H + K)$ Search

#### Dimension 1: Operation Contract & Big-O Bounds

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               DUAL-STACK K-CLOSEST CONTRACT SPECIFICATION                         │
├───────────────┬───────────────────────────────┬───────────────────────────────────┬───────────────┤
│ OPERATION     │ PRECONDITIONS                 │ POSTCONDITIONS / GUARANTEES       │ TIME & SPACE  │
├───────────────┼───────────────────────────────┼───────────────────────────────────┼───────────────┤
│ InitStacks    │ Valid BST root; double target │ predStack has nodes <= target;    │ Time: O(H)    │
│               │                               │ succStack has nodes > target.     │ Space: O(H)   │
├───────────────┼───────────────────────────────┼───────────────────────────────────┼───────────────┤
│ ExtractK      │ 1 <= K <= N; stacks populated │ Returns exactly K values closest  │ Time: O(H + K)│
│               │ via InitStacks                │ to target in strictly O(H+K) time.│ Space: O(H)   │
└───────────────┴───────────────────────────────┴───────────────────────────────────┴───────────────┘
```

- **Time Complexity Bounds:**
  - *Initialization:* Descends 1 root-to-leaf path to partition ancestors around `target` $\implies \Theta(H)$ operations.
  - *K Extractions:* Each of the $K$ extractions compares top of `predStack` against `succStack`. Amortized cost per extraction is $\Theta(1)$ because any node is pushed and popped at most once.
  - *Total Time:* Strictly $\Theta(H + K)$, outperforming naive $O(N)$ full scans and $O(N \log K)$ heap solutions.
- **Space Complexity:** $\Theta(H)$ auxiliary space bounded by the maximum tree height ($H \le 1.44 \log_2 N$ in balanced trees).

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                       ┌─────────────────────────┐
                       │   Dual-Stack Extraction │
                       │   Loop: while k > 0     │
                       └────────────┬────────────┘
                                    │
                         Is predStack Empty ?
                                    │
                 ┌──────────────────┴──────────────────┐
                 ▼ (YES: No smaller candidates)        ▼ (NO: Check succStack)
            Pop succStack                         Is succStack Empty ?
            Advance succStack (Left spine)                 │
            Add to Result                         ┌────────┴────────┐
            k--                                   ▼ (YES)           ▼ (NO: Compare Closest)
                                            Pop predStack       |target - pred.val| <= |target - succ.val| ?
                                            Advance predStack              │
                                            Add to Result      ┌───────────┴───────────┐
                                            k--                ▼ (YES: Pred Closer)    ▼ (NO: Succ Closer)
                                                         Pop predStack           Pop succStack
                                                         Advance predStack       Advance succStack
                                                         Add to Result           Add to Result
                                                         k--                     k--
```

1. **Dual Stack Construction Protocol:**
   - Initialize `Stack<TreeNode> predStack`, `Stack<TreeNode> succStack`.
   - `curr = root`:
     - While `curr != null`:
       - If `curr.val <= target`: push `curr` to `predStack`, advance `curr = curr.right`.
       - Else: push `curr` to `succStack`, advance `curr = curr.left`.

2. **Stack Advancement Mechanics:**
   - **`AdvancePred(Stack<TreeNode> stack)`:** Let `node = stack.Pop()`. If `node.left != null`, push `node.left` and all its successive right descendants (`curr = node.left; while(curr != null) { stack.Push(curr); curr = curr.right; }`).
   - **`AdvanceSucc(Stack<TreeNode> stack)`:** Let `node = stack.Pop()`. If `node.right != null`, push `node.right` and all its successive left descendants (`curr = node.right; while(curr != null) { stack.Push(curr); curr = curr.left; }`).

---

#### Dimension 3: Visual ASCII State Transitions (Dual-Stack Expansion)

```
TARGET: 3.71, K = 3 ON BST:
                 [ 4 ]
                /     \
            [ 2 ]     [ 5 ]
           /     \
        [ 1 ]   [ 3 ]

STEP 1: INITIAL STACK DIVISION
   Descending from root [4] to target 3.71:
   - 4 > 3.71  ──> Push 4 to succStack. Branch LEFT.
   - 2 <= 3.71 ──> Push 2 to predStack. Branch RIGHT.
   - 3 <= 3.71 ──> Push 3 to predStack. Branch RIGHT.
   predStack (Top -> Bottom): [ 3, 2 ]
   succStack (Top -> Bottom): [ 4 ]

STEP 2: EXTRACTION 1 (Compare Tops)
   - predTop = 3 (diff = |3 - 3.71| = 0.71)
   - succTop = 4 (diff = |4 - 3.71| = 0.29)
   - 0.29 < 0.71 ──> 4 is closer! Pop 4. Output: [ 4 ].
   - Advance succStack: 4.right is [ 5 ]. Push 5. succStack now: [ 5 ].

STEP 3: EXTRACTION 2 (Compare Tops)
   - predTop = 3 (diff = 0.71)
   - succTop = 5 (diff = |5 - 3.71| = 1.29)
   - 0.71 < 1.29 ──> 3 is closer! Pop 3. Output: [ 4, 3 ].
   - Advance predStack: 3.left is null. predStack now: [ 2 ].

STEP 4: EXTRACTION 3
   - predTop = 2 (diff = 1.71)
   - succTop = 5 (diff = 1.29)
   - 1.29 < 1.71 ──> 5 is closer! Pop 5. Output: [ 4, 3, 5 ].
   Terminated in exactly K = 3 pop steps!
```

---

#### Dimension 4: Invariant Preservation Proof

**Theorem (Correctness & Amortized $O(H + K)$ Bound):**
The dual-stack algorithm extracts the exact $K$ closest values to `target` in strictly $O(H + K)$ time.

*Proof:*
1. **Sorted In-Order Equivalence:**
   - By the BST property, `predStack` represents an in-order cursor moving backward from `target` ($x \le \text{target}$ in descending order).
   - `succStack` represents an in-order cursor moving forward from `target` ($x > \text{target}$ in ascending order).
   - Comparing the tops of the two stacks at each step is isomorphic to comparing the two pointers in an array-based Two-Pointer closest-elements search.
   - Because both streams are monotonically increasing in distance from `target`, greedily choosing the closer top at each step guarantees that no closer unvisited element exists in the tree.

2. **Complexity Amortization:**
   - Initializing both stacks descends 1 path from root to leaf: cost is bounded by $2H = O(H)$.
   - Advancing `predStack` or `succStack` pushes nodes along 1 spine. Across the entire traversal, no node is pushed more than once or popped more than once.
   - For $K$ extractions, at most $K$ nodes are popped. The total number of nodes pushed onto either stack during the extraction phase cannot exceed $K + H$.
   - Total operations $= O(H) + O(K) = \Theta(H + K)$. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Scenario | Input Condition | Algorithmic Flow | Guarantee |
| :--- | :--- | :--- | :--- |
| **Target Smaller Than Minimum Key** | `target < min(BST)` | `predStack` empty from start; pops exclusively from `succStack` | Returns $K$ smallest keys in ascending order |
| **Target Greater Than Maximum Key** | `target > max(BST)` | `succStack` empty from start; pops exclusively from `predStack` | Returns $K$ largest keys in descending order |
| **$K = 1$ (Single Closest Element)** | $K = 1$ | 1 comparison between tops | Returns closest node in $O(H)$ |
| **$K = N$ (Entire Tree Extracted)** | $K = N$ | Empties both stacks completely | Visits every node in $O(N)$ time |
| **Exact Equidistant Ties** | $\|target - pred\| == \|target - succ\|$ | Precondition $\le$ prefers predecessor (or successor consistently) | Deterministic output ordering |

---

---

### 🎤 Multi-Topic Spoken Synthesis Drill (≤ 60 Seconds)

#### Synthesis Drill 1: Heap vs. BST vs. Hash Table
- **Heap (`PriorityQueue<T>`):** Choose when you *only* need the min/max repeatedly. $\Theta(1)$ peek, $\Theta(\log N)$ push/pop. No arbitrary search or ordered traversal. (Signals: *Top-K, streaming median, K-way merge*).
- **BST (`SortedSet<T>` / AVL):** Choose when you need full dynamic order: floor/ceiling, in-order sorted traversal, or range queries $[L, R]$. $\Theta(\log N)$ search/insert/delete. (Signals: *dynamic K-th element, count in range, predecessor/successor*).
- **Hash Table (`Dictionary<K,V>`):** Choose when you need exact key lookup or frequency counting without ordering. Average $\Theta(1)$, worst $\Theta(N)$. (Signals: *Two Sum, frequency map, duplicate detection, LRU cache backing*).


## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Algorithms

Below are the complete, production-grade implementations for the Greater Sum Tree, Single Closest Value, and the Optimal $O(H + K)$ $K$-Closest Elements solver:

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

    public static class BstSynthesisEngine
    {
        // =========================================================================
        // 1. Convert BST to Greater Tree ([LeetCode 538 / 1038])
        // Reverse In-Order Traversal (Right -> Root -> Left).
        // Time Complexity: Strictly O(N).
        // Auxiliary Space: O(H) recursion stack.
        // =========================================================================
        public static TreeNode? ConvertBST(TreeNode? root)
        {
            int runningSum = 0;

            void ReverseInorder(TreeNode? node)
            {
                if (node == null) return;

                // Step 1: Recurse Right
                ReverseInorder(node.right);

                // Step 2: Process Current Root
                runningSum += node.val;
                node.val = runningSum;

                // Step 3: Recurse Left
                ReverseInorder(node.left);
            }

            ReverseInorder(root);
            return root;
        }

        // =========================================================================
        // 1b. Convert BST to Greater Tree via Reverse Morris Traversal
        // Eliminates recursion stack completely!
        // Time Complexity: Strictly O(N).
        // Auxiliary Space: Strictly O(1) constant extra space!
        // =========================================================================
        public static TreeNode? ConvertBSTMorris(TreeNode? root)
        {
            int runningSum = 0;
            TreeNode? curr = root;

            while (curr != null)
            {
                if (curr.right == null)
                {
                    // Visit current node
                    runningSum += curr.val;
                    curr.val = runningSum;

                    curr = curr.left;
                }
                else
                {
                    // Find reverse predecessor (leftmost in right subtree)
                    TreeNode succ = curr.right;
                    while (succ.left != null && succ.left != curr)
                    {
                        succ = succ.left;
                    }

                    if (succ.left == null)
                    {
                        // Establish reverse thread
                        succ.left = curr;
                        curr = curr.right;
                    }
                    else
                    {
                        // Sever reverse thread
                        succ.left = null;

                        // Visit current node
                        runningSum += curr.val;
                        curr.val = runningSum;

                        curr = curr.left;
                    }
                }
            }

            return root;
        }

        // =========================================================================
        // 2. Closest Binary Search Tree Value ([LeetCode 270])
        // Time Complexity: Strictly O(H) single branch descent.
        // Auxiliary Space: Strictly O(1) iterative walk.
        // =========================================================================
        public static int ClosestValue(TreeNode? root, double target)
        {
            if (root == null) throw new ArgumentNullException(nameof(root));

            int closest = root.val;
            TreeNode? curr = root;

            while (curr != null)
            {
                // Update closest if current node is strictly closer
                double currDiff = Math.Abs(curr.val - target);
                double closestDiff = Math.Abs(closest - target);

                if (currDiff < closestDiff || (Math.Abs(currDiff - closestDiff) < 1e-9 && curr.val < closest))
                {
                    closest = curr.val;
                }

                // Logarithmic branch pruning
                curr = target < curr.val ? curr.left : curr.right;
            }

            return closest;
        }

        // =========================================================================
        // 3. Closest Binary Search Tree Value II ([LeetCode 272])
        // Optimal Dual-Stack Predecessor & Successor Algorithm.
        // Time Complexity: Strictly O(H + K).
        // Auxiliary Space: Strictly O(H + K).
        // =========================================================================
        public static IList<int> ClosestKValues(TreeNode? root, double target, int k)
        {
            List<int> result = new List<int>(k);
            if (root == null || k == 0) return result;

            Stack<TreeNode> predStack = new Stack<TreeNode>(); // Nodes <= target
            Stack<TreeNode> succStack = new Stack<TreeNode>(); // Nodes > target

            // Step 1: Initialize dual stacks in O(H) time
            TreeNode? curr = root;
            while (curr != null)
            {
                if (curr.val <= target)
                {
                    predStack.Push(curr);
                    curr = curr.right;
                }
                else
                {
                    succStack.Push(curr);
                    curr = curr.left;
                }
            }

            // Step 2: Pop K closest elements by comparing stack tops in O(K)
            for (int i = 0; i < k; i++)
            {
                if (predStack.Count > 0 && succStack.Count > 0)
                {
                    double predDiff = Math.Abs(predStack.Peek().val - target);
                    double succDiff = Math.Abs(succStack.Peek().val - target);

                    if (predDiff <= succDiff)
                    {
                        result.Add(GetNextPredecessor(predStack));
                    }
                    else
                    {
                        result.Add(GetNextSuccessor(succStack));
                    }
                }
                else if (predStack.Count > 0)
                {
                    result.Add(GetNextPredecessor(predStack));
                }
                else if (succStack.Count > 0)
                {
                    result.Add(GetNextSuccessor(succStack));
                }
                else
                {
                    break;
                }
            }

            return result;
        }

        private static int GetNextPredecessor(Stack<TreeNode> stack)
        {
            TreeNode node = stack.Pop();
            int val = node.val;

            // Predecessor descent: Push right spine of left child
            TreeNode? curr = node.left;
            while (curr != null)
            {
                stack.Push(curr);
                curr = curr.right;
            }

            return val;
        }

        private static int GetNextSuccessor(Stack<TreeNode> stack)
        {
            TreeNode node = stack.Pop();
            int val = node.val;

            // Successor descent: Push left spine of right child
            TreeNode? curr = node.right;
            while (curr != null)
            {
                stack.Push(curr);
                curr = curr.left;
            }

            return val;
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### 3.1 Complexity Comparison for [LeetCode 272] (K-Closest Elements)

| Solution Approach | Time Complexity | Auxiliary Space | Architectural Trade-Off |
| :--- | :--- | :--- | :--- |
| **In-Order to Array + Binary Search** | $\Theta(N)$ | $\Theta(N)$ Heap | Materializes all $N$ elements; unacceptable when $K \ll N$ |
| **In-Order + Bounded Max-Heap ($K$)** | $\Theta(N \log K)$ | $\Theta(K)$ Heap | Pushes every node into heap; wastefully visits entire tree |
| **Dual Spine Stacks (Predecessor/Successor)** | $\mathbf{\Theta(H + K)}$ | $\mathbf{\Theta(H + K)}$ | **Optimal.** Only navigates to target depth $H$ and expands by $K$ |

#### Proof of $O(H + K)$ Time:
1. **Stack Initialization:** A single downward walk from root to target visits at most $H$ nodes, pushing each node onto either `predStack` or `succStack` $\implies O(H)$ operations.
2. **Retrieving $K$ Elements:** Each retrieval calls either `GetNextPredecessor` or `GetNextSuccessor`. By aggregate accounting (identical to `BSTIterator`), retrieving $K$ adjacent elements along the tree branches visits at most $O(H + K)$ edges.
3. **Total Time:** $O(H) + O(K) = \mathbf{\Theta(H + K)}$ strictly.

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### 4.1 [LeetCode 270] Closest BST Value: Single Descent Trace

#### Input:
`root = [4, 2, 5, 1, 3]`, `target = 3.714286`.

```
Execution Walk:
1. curr = Node(4):
   - diff = |4 - 3.714286| = 0.285714.
   - closest = 4 (closestDiff = 0.285714).
   - target < 4 -> Branch Left!
2. curr = Node(2):
   - diff = |2 - 3.714286| = 1.714286.
   - diff > closestDiff (1.714 > 0.285) -> closest remains 4.
   - target > 2 -> Branch Right!
3. curr = Node(3):
   - diff = |3 - 3.714286| = 0.714286.
   - diff > closestDiff (0.714 > 0.285) -> closest remains 4.
   - target > 3 -> Branch Right!
4. curr = null -> Terminate!

Final Closest Value: 4.
Comparisons: 3 nodes visited out of 5! Time: O(H). Space: O(1).
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Find Mode in Binary Search Tree ([LeetCode 501])
- **Problem:** Given root of BST with duplicates, return all mode(s) (most frequently occurring element) without using extra space (assume recursion stack does not count).
- **Hint:** Two-pass in-order traversal: Pass 1 finds maximum frequency `maxCount` by comparing `curr.val == prev.val`. Pass 2 collects all values whose frequency equals `maxCount`.
- **Target Complexity:** Time: $O(N)$, Auxiliary Space: $O(1)$ (ignoring call stack or using Morris).

### Exercise 2: Split BST ([LeetCode 776])
- **Problem:** Split BST into two trees: one with elements $\le target$ and one with elements $> target$.
- **Hint:** Recursive divide-and-conquer: if `root.val <= target`, `root` and `root.left` belong to tree 1. Recurse on `root.right` to split it into `[small, large]`. Attach `root.right = small` and return `[root, large]`.
- **Target Complexity:** Time: $O(H)$, Auxiliary Space: $O(H)$.

### Exercise 3: Increasing Order Search Tree ([LeetCode 897])
- **Problem:** Rearrange BST in in-order so that the leftmost node is the new root, and every node has only a right child (right-skewed linked list).
- **Hint:** Maintain dummy head `dummy = new TreeNode(0)` and cursor `curr = dummy`. In in-order traversal, at each node: `node.left = null; curr.right = node; curr = node;`.
- **Target Complexity:** Time: $O(N)$, Auxiliary Space: $O(H)$.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

### Real-World Systems Design: Nearest-Neighbor Search in Multi-Dimensional Trees

The 1D nearest-neighbor search developed in [LeetCode 270] and [LeetCode 272] is the foundational basis for **$k$-d Trees (k-Dimensional Trees)** and **R-Trees** used in spatial databases and game engines:

```
2D k-d Tree Space Partitioning:
            [ (5, 4) ] (Splits on X = 5)
           /          \
   [ (2, 3) ]        [ (7, 6) ] (Splits on Y = 6)
   (Splits on Y = 3)
```

- **Query:** Find the 3 nearest restaurants to a user's GPS coordinates $(X, Y)$.
- **Algorithm:**
  1. Descend the $k$-d tree comparing alternating dimensions $(X \to Y \to X)$ to locate the leaf cell containing $(X, Y)$ in $O(\log N)$ time.
  2. Maintain a priority queue of $K$ closest points.
  3. Backtrack up the tree, checking whether the hypersphere around the query point crosses any splitting hyperplane (bounding box pruning).
  4. If the hyperplane does not intersect the bounding sphere, prune the entire opposite subtree!

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint 1: Reverse In-Order Traversal Invariant
**Question:** In [LeetCode 538], why does a Reverse In-Order Traversal (Right $\to$ Root $\to$ Left) compute the exact greater sum without pre-calculating the sum of all nodes in the tree?
<details>
<summary><b>View Architectural Answer</b></summary>

By the BST Global Ordering Invariant, every node in $\text{RightSubtree}(u)$ has a key strictly greater than $u.val$, and every node in $\text{LeftSubtree}(u)$ has a key strictly less than $u.val$.
Visiting nodes in the order **Right $\to$ Root $\to$ Left** visits keys in strictly descending order:
$$k_n > k_{n-1} > \dots > k_1$$
When the traversal reaches node $u$, every single node with a key $> u.val$ has already been visited and accumulated into `runningSum`. None of the nodes with keys $< u.val$ have been visited yet. Therefore, `runningSum + u.val` is mathematically guaranteed to equal the sum of all keys $\ge u.val$.
</details>

---

### Checkpoint 2: The Dual-Stack Initialization Bound
**Question:** In [LeetCode 272], why does the stack initialization loop push nodes onto *either* `predStack` or `succStack`, but never both?
<details>
<summary><b>View Architectural Answer</b></summary>

At each node `curr` during the downward descent:
- If `curr.val <= target`: `curr` and its entire left subtree are $\le target$. We push `curr` onto `predStack` and branch right (`curr = curr.right`) to search for larger predecessors.
- If `curr.val > target`: `curr` and its entire right subtree are $> target$. We push `curr` onto `succStack` and branch left (`curr = curr.left`) to search for smaller successors.
Because `curr.val` is deterministically either $\le target$ or $> target$, it belongs to exactly one category. The descent traces a single path from root to leaf of length $H$, taking strictly $O(H)$ operations and storing at most $H$ nodes across both stacks combined.
</details>

---

### Checkpoint 3: Single Closest Value Pruning Guarantee
**Question:** In [LeetCode 270], if `target < curr.val`, why can we safely prune the entire right subtree of `curr`?
<details>
<summary><b>View Architectural Answer</b></summary>

For any node $w$ in the right subtree of `curr`, by the BST invariant:
$$w.val > curr.val$$
Since $target < curr.val$, we have the inequality:
$$target < curr.val < w.val$$
The absolute distance from $target$ to $w.val$ is:
$$|w.val - target| = (w.val - curr.val) + (curr.val - target) > |curr.val - target|$$
Every single node in the right subtree is strictly farther from $target$ than `curr.val` itself! None of them can ever be closer than `curr.val`. Therefore, the entire right subtree can be safely discarded.
</details>

---

### Checkpoint 4: Reverse Morris Threading Pointer Direction
**Question:** How does Reverse Morris Traversal differ from Standard Morris Traversal in terms of pointer manipulation?
<details>
<summary><b>View Architectural Answer</b></summary>

In Standard Morris Traversal (In-Order: Left-Root-Right):
- We check if `curr.left == null`.
- If not, we find the in-order predecessor: the rightmost node in the left subtree (`succ = curr.left; while (succ.right != null && succ.right != curr) succ = succ.right;`).
- We establish threads on `succ.right = curr`.

In Reverse Morris Traversal (Reverse In-Order: Right-Root-Left):
- All directions are mirrored!
- We check if `curr.right == null`.
- If not, we find the reverse predecessor: the leftmost node in the right subtree (`succ = curr.right; while (succ.left != null && succ.left != curr) succ = succ.left;`).
- We establish threads on `succ.left = curr`, and sever them on the second visit!
</details>

---

### Daily Mastery Checklist
- [x] Solved Convert BST to Greater Tree ([LeetCode 538 / 1038]) using reverse in-order traversal in $O(N)$ time.
- [x] Implemented Reverse Morris Traversal for Greater Tree conversion in strictly $O(1)$ auxiliary space.
- [x] Implemented Closest BST Value ([LeetCode 270]) in $O(H)$ time and $O(1)$ space.
- [x] Engineered the optimal $O(H + K)$ dual-stack predecessor/successor algorithm for [LeetCode 272].
- [x] Connected nearest-neighbor tree queries to spatial $k$-d trees and PostGIS spatial indexing.
