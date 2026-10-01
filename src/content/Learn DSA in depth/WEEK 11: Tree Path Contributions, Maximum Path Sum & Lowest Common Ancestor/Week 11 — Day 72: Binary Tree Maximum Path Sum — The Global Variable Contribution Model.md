---
title: "Week 11 — Day 72: Binary Tree Maximum Path Sum — The Global Variable Contribution Model"
---

# Week 11 — Day 72: Binary Tree Maximum Path Sum — The Global Variable Contribution Model

Welcome to **Day 72 of your DSA Mastery Journey**!

Yesterday in [Day 71](./Week%2011%20%E2%80%94%20Day%2071:%20Tree%20Diameter%20&%20Post-Order%20Bottom-Up%20Aggregation%20Pattern.md), we unlocked the **Dual-Role Principle** and the **Simple Path Non-Bifurcation Law** for unweighted tree diameters.

Today, we confront the **absolute pinnacle of post-order tree path problems in Big Tech interviews**:
1. **The Weighted Path Paradigm:** What happens when nodes carry arbitrary positive, zero, and **negative values**?
2. **The Positive Bottleneck Rule:** Why negative child subtree paths must be greedily pruned ($\max(0, \text{gain})$).
3. **The Global Variable Contribution Model:** Tracking the apex curved sum while passing only straight non-bifurcating branches upward.
4. **Tree Dynamic Programming (House Robber III):** Formulating optimal subtree decisions using clean, zero-allocation C# `ValueTuple` state vectors.
5. **Canonical Problem Walkthroughs:** Production C# solutions for **LeetCode 124** and **LeetCode 337**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 72 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: WEIGHTED PATH LAWS  │                                     │     PART II: TREE DYNAMIC PROG  │
│  Negative Nodes & Pruning Math  │                                     │        House Robber III         │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Positive Bottleneck: max(0,G) │                                     │ • State Vector: (rob, notRob)   │
│ • The All-Negative Tree Hazard  │                                     │ • Parent-Child Exclusion Law    │
│ • Initializing to int.MinValue  │                                     │ • Zero-Alloc ValueTuple Stacks  │
│ • Dual-Role Postorder Assembly  │                                     │ • Postorder Bottom-Up Memo      │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **Binary Tree Maximum Path Sum** finds the path with the largest sum of node values where the path may start and end at any node.
  - *Core Invariants:* Positive Gain Bottleneck: Prune negative subtree contributions with $\max(0, \text{gain})$ (a negative branch only decreases the path sum and is never taken); Arch Sum Update Invariant: Local arch sum $= u.val + \max(0, \text{leftGain}) + \max(0, \text{rightGain})$ updates `globalMax`; Branch Return Invariant: Node $u$ returns $u.val + \max(0, \max(\text{leftGain}, \text{rightGain}))$ to its parent.
  - *Misconception Check:* Initializing `globalMax` to `0` fails catastrophically when all node values in the tree are negative (e.g. `[-3]`); `globalMax` must be initialized to `int.MinValue`.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates combinatorial path generation across non-linear tree topologies.
  - *Complexity Advantage:* Evaluates all possible paths in optimal $O(N)$ linear time and $O(H)$ space.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Binary Tree Maximum Path Sum" (LC 124), "House Robber III" (LC 337). Signal words: "maximum path sum in binary tree", "path can start and end anywhere", "node values can be negative".
  - *When to Avoid / Failure Modes:* If the path must be strictly root-to-leaf (use subtractive target DFS instead).
- **4. WHERE:**
  - *Physical CLR Memory:* Global variable or `ref int maxPathSum` initialized to `int.MinValue`; recursion call stack on thread stack.
  - *Production Systems:* Pipeline routing throughput optimization, financial trade flow graph profit maximization.
- **5. WHO:**
  - *Spoken Script:* "In Maximum Path Sum, a node computes its local arch sum using its value plus any positive contributions from left and right children, updating a global maximum initialized to `int.MinValue`. It returns its value plus the single maximum positive branch to its parent, achieving $O(N)$ time and $O(H)$ space."
  - *Interviewer Evaluation Lens:* Checks negative branch pruning ($\max(0, gain)$), `int.MinValue` initialization for all-negative trees, and distinction between arch sum and branch return.
- **6. HOW:**
  - *Cost Model:* Time: $\Theta(N)$ linear time; Space: $O(H)$ auxiliary call stack space.
  - *State Transition Trace (LC 124):* `Dfs(node): left = max(0, Dfs(node.left)); right = max(0, Dfs(node.right)); maxSum = max(maxSum, node.val + left + right); return node.val + max(left, right)`.


### 1.1 Physical Mental Model: The Gold Mine Tunnel Inspector & Toxic Debt Pruning

Imagine inspecting an underground gold mine where each cavern contains either gold nuggets (positive value) or toxic debt/cave-in clean-up costs (negative value):
- **The Toxic Debt Pruning Rule ($\max(0, \text{Gain})$):**
  - Your scout crawls down the left shaft and reports: *"Boss, this shaft will net us $-5$ gold after cleanup."*
  - Do you connect that shaft? **Absolutely NOT!** You board up the entrance and take **0 gold** ($\max(0, -5) = 0$). You never willingly take on someone else's toxic debt!
- **The Two Roles (Grand Hall vs. Extraction Rail):**
  - **The Grand Hall (Local Apex):** In cavern $u$, you can connect the clean gold from the left shaft, scoop up your own gold, and connect the clean gold from the right shaft:
    $$\text{Local Arch Sum} = u.\text{val} + \max(0, \text{leftGain}) + \max(0, \text{rightGain})$$
    This might be the richest continuous vein in the entire mine, so you check if it breaks the company record (`maxSum`).
  - **The Extraction Rail to Surface (Return to Parent):** To send a single unbroken rail cart line upward to your parent, you **cannot fork into both shafts**! You must choose the single richest shaft:
    $$\text{Return to Parent} = u.\text{val} + \max(0, \max(\text{leftGain}, \text{rightGain}))$$
- **The All-Toxic Mine Trap (`int.MinValue`):**
  - What if every cavern in the entire mountain is negative (e.g., `[-10, -20, -3]`)?
  - If your record book initializes to `0`, you would mistakenly say the max profit is $0$. But regulations state **you must visit at least one cavern**! The least disastrous choice is `-3`. Initializing to `int.MinValue` guarantees you pick the best of the worst!

```
                  THE GOLD MINE STATE EVOLUTION TRACE (LC 124)
   
   Mine Topology:
                         [ -10 ]
                         /     \
                    [ 9 ]       [ 20 ]
                                /    \
                             [ 15 ]  [ 7 ]

   ─── Bottom-Up Vein Aggregations ────────────────────────────────────────────────
   
   1. Cavern [ 15 ]:
      - Left = 0, Right = 0 (Pruned nulls)
      - Arch Sum = 15 + 0 + 0 = 15.
      - Returns Upward: 15 + max(0, 0) = 15.
   
   2. Cavern [ 7 ]:
      - Left = 0, Right = 0
      - Arch Sum = 7 + 0 + 0 = 7.
      - Returns Upward: 7 + max(0, 0) = 7.
   
   3. Cavern [ 20 ]:
      - Left Gain = max(0, 15) = 15
      - Right Gain = max(0, 7) = 7
      - 💥 GRAND HALL ARCH SUM: 20 + 15 + 7 = 42!  <── RECORD VEIN! (maxSum = 42)
      - Returns Upward: 20 + max(15, 7) = 35.
   
   4. Cavern [ 9 ]:
      - Arch Sum = 9. Returns Upward = 9.
   
   5. Cavern [ -10 ] (Root):
      - Left Gain = max(0, 9) = 9
      - Right Gain = max(0, 35) = 35
      - Arch Sum = -10 + 9 + 35 = 34.
      - Does 34 beat 42? NO! (maxSum stays 42!).
   
   FINAL RESULT: Global Maximum Path Sum = 42 (Path: 15 -> 20 -> 7).
```

---

### 1.2 The Binary Tree Maximum Path Sum Problem

A **Path** in a binary tree is a non-empty sequence of nodes where each pair of adjacent nodes has an edge connecting them, and **no node appears more than once**.
The **Path Sum** is the sum of values of the nodes in the path.

In [LeetCode 124]:
- Nodes can have **negative values** (e.g. `node.val = -100`).
- The path does **not** have to pass through the root.
- The path must contain **at least one node** (cannot be an empty path).

---

### 1.2 The Positive Bottleneck Rule: Pruning Negative Gains

In unweighted diameter ([Day 71](./Week%2011%20%E2%80%94%20Day%2071:%20Tree%20Diameter%20&%20Post-Order%20Bottom-Up%20Aggregation%20Pattern.md)), every additional edge increases the path length by $+1$, so you *always* take the child path.

In a weighted tree with negative values:
$$\text{If a child branch has a negative maximum sum, INCLUDING IT MAKES OUR PATH WORSE!}$$

```
                [ 10 ]  <-- Node u
               /      \
            [ -5 ]    [ 20 ]
```
- If node `10` extends its path into `node.left` (sum: `-5`), the total path sum becomes $10 + (-5) = 5$.
- If node `10` **prunes** the left child entirely, the path sum is simply $10 + 0 = 10$!

> [!IMPORTANT]
> ### 💡 The Positive Bottleneck Rule
> For any child subtree, define its **effective gain** as:
> $$\text{Gain} = \max(0, \text{MaxBranchSum}(\text{child}))$$
> If $\text{MaxBranchSum} < 0$, we treat its contribution as **$0$** (greedily ignoring that entire subtree).

---

### 1.3 The 4 Possible Path Topologies at Node $u$

At any node $u$, exactly 4 mutually exclusive path configurations can involve $u$:

```
Case 1: Node u alone (both children ignored or negative)
        [ u ]

Case 2: Node u + Left Subtree (right child ignored or negative)
        [ u ]
        /
     [ L ]

Case 3: Node u + Right Subtree (left child ignored or negative)
        [ u ]
            \
            [ R ]

Case 4: Left Subtree + Node u + Right Subtree (CURVED APEX PATH)
        [ u ]
        /   \
     [ L ]  [ R ]
```

Notice the mathematical elegance of the **Positive Bottleneck Rule**:
By defining $\text{leftGain} = \max(0, \text{left})$ and $\text{rightGain} = \max(0, \text{right})$, **ALL 4 CASES COLLAPSE INTO A SINGLE FORMULA**:

$$\mathbf{\text{CurvedPathSum}(u) = u.\text{val} + \text{leftGain} + \text{rightGain}}$$

- If both are $0$, it reduces to **Case 1** ($u.\text{val}$).
- If only left $> 0$, it reduces to **Case 2** ($u.\text{val} + \text{leftGain}$).
- If only right $> 0$, it reduces to **Case 3** ($u.\text{val} + \text{rightGain}$).
- If both $> 0$, it computes **Case 4** ($u.\text{val} + \text{leftGain} + \text{rightGain}$).

---

### 1.4 The All-Negative Tree Trap: Initializing `_maxSum`

What happens if the entire tree contains only negative numbers, such as `[-3]` or `[-10, -20, -30]`?

> [!CAUTION]
> ### ⚠️ The Fatal `_maxSum = 0` Bug
> If you initialize `private int _maxSum = 0;`:
> For tree `[-3]`, the algorithm calculates $\text{CurvedPathSum} = -3 + 0 + 0 = -3$.
> Since $-3 < 0$, `_maxSum` is **never updated**, and the function returns `0`!
>
> **This is WRONG!** An empty path is not allowed. The correct maximum path sum for `[-3]` is **`-3`**!
>
> **The Immutable Invariant:**
> The global maximum tracker MUST be initialized to **`int.MinValue`**, guaranteeing that even if every single node in the tree is negative, the single least-negative node will be correctly recorded!

---

### 1.5 Tree Dynamic Programming (House Robber III — LeetCode 337)

In [LeetCode 337], a thief wants to rob houses arranged in a binary tree.
**Constraint:** If two directly connected houses (parent and child) are robbed on the same night, the alarm sounds!

At each node $u$, we must decide whether to **Rob** or **Skip** $u$.
This induces a **2-State Dynamic Programming Vector**:

$$\text{State}(u) = \Big( \text{rob}(u), \; \text{skip}(u) \Big)$$

```
1. If we ROB node u:
   We CANNOT rob u's left child, and we CANNOT rob u's right child!
   rob(u) = u.val + skip(u.left) + skip(u.right)

2. If we SKIP node u:
   We are FREE to either rob OR skip each child (we take the maximum of each child's options)!
   skip(u) = max(rob(u.left), skip(u.left)) + max(rob(u.right), skip(u.right))
```

By computing this state vector from the bottom up in postorder, we solve the problem in **strict $\Theta(N)$ time** with zero hash map memoization overhead!

### 1.6 ⚙️ Core Operations Deep-Dive: Positive Bottleneck Capping & Path Contribution Mechanics

#### Dimension 1: Operation Contract & Big-O Bounds
- **Operation Signature:** `int MaxPathSum(TreeNode root)` with helper `int CalculateGain(TreeNode node, ref int maxPathSum)`
- **Preconditions:**
  - `root` represents an acyclic binary tree containing $N \ge 1$ nodes.
  - Node values $u.val \in [-10^4, 10^4]$ (may be negative, zero, or positive).
- **Postconditions:**
  - Returns the exact maximum sum of any non-empty simple path in the tree.
  - Guarantees the chosen path does not bifurcate at any node other than its single apex.
- **Complexity Bounds:**
  - **Time Complexity:**
    - *Best Case:* $\Omega(N)$ — every node must be evaluated to ensure no high-value path is missed.
    - *Average Case:* $\Theta(N)$ — single bottom-up postorder pass.
    - *Worst Case:* $O(N)$ — linear chain degenerate trees.
  - **Auxiliary Space Complexity:**
    - *Best Case:* $O(\log N)$ stack frames for balanced binary trees.
    - *Worst Case:* $O(N)$ stack frames for degenerate linear chains. Zero heap allocations.

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree
1. **Base Case:**
   - If `node == null`, return `0` (null contribution is identity element for addition).
2. **Postorder Subtree Traversal with Positive Bottleneck Rule:**
   - Recurse left: `int rawLeft = CalculateGain(node.left, ref maxPathSum)`.
   - Recurse right: `int rawRight = CalculateGain(node.right, ref maxPathSum)`.
   - **Bottleneck Capping:**
     - `leftGain = Math.Max(0, rawLeft)` (if left subtree is net-negative, do not include it!).
     - `rightGain = Math.Max(0, rawRight)` (if right subtree is net-negative, do not include it!).
3. **Local Curved Apex Evaluation:**
   - `localArchSum = node.val + leftGain + rightGain`.
   - Update global tracker: `maxPathSum = Math.Max(maxPathSum, localArchSum)`.
4. **Upward Straight Branch Propagation:**
   - A parent connecting to `node` can only continue downward through at most one child branch.
   - Return: `return node.val + Math.Max(leftGain, rightGain)`.

```
                       [CalculateGain(u)]
                                │
                         Is u == null?
                        /             \
                  (Yes)/               \(No)
                      ▼                 ▼
                   Return 0     rawLeft  = DFS(u.left)
                                rawRight = DFS(u.right)
                                        │
                                        ▼
                                 Bottleneck Capping:
                                 leftGain  = max(0, rawLeft)
                                 rightGain = max(0, rawRight)
                                        │
                                        ▼
                         localArch = u.val + leftGain + rightGain
                         maxPathSum = max(maxPathSum, localArch)
                                        │
                                        ▼
                         Return u.val + max(leftGain, rightGain)
```

#### Dimension 3: Visual ASCII State Transitions
```
EXECUTION TRACE WITH NEGATIVE PRUNING:
             [  10  ]
            /        \
        [ -5 ]      [  20  ]
        /    \      /      \
      [ 3 ]  [ 1 ] [ 15 ]  [ -7 ]

1. Leaf [3]:  gains=(0,0) => arch=3  => returns 3.
2. Leaf [1]:  gains=(0,0) => arch=1  => returns 1.
3. Node [-5]:
   - rawLeft=3, rawRight=1 => leftGain=3, rightGain=1.
   - localArch = -5 + 3 + 1 = -1 => maxPathSum updated to 3 (from leaf [3]).
   - returns: -5 + max(3, 1) = -2.
4. Leaf [15]: gains=(0,0) => arch=15 => returns 15.
5. Leaf [-7]: gains=(0,0) => arch=-7 => returns -7.
6. Node [20]:
   - rawLeft=15 (leftGain=15).
   - rawRight=-7 => BOTTLENECK CAPPING: rightGain = max(0, -7) = 0!
   - localArch = 20 + 15 + 0 = 35 => maxPathSum = 35.
   - returns: 20 + max(15, 0) = 35.
7. Root [10]:
   - rawLeft = -2 => BOTTLENECK CAPPING: leftGain = max(0, -2) = 0! (Left branch discarded!)
   - rawRight = 35 => rightGain = 35.
   - localArch = 10 + 0 + 35 = 45 => maxPathSum = 45!
   - returns: 10 + 35 = 45.

RESULT: maxPathSum = 45 (Path: 15 -> 20 -> 10). Left subtree [-5] fully pruned.
```

#### Dimension 4: Invariant Preservation Proof
- **Theorem (Optimality of the Positive Bottleneck Capping Rule):**
  *Pruning any child subtree whose maximum straight branch gain is $\le 0$ strictly preserves or improves the global maximum path sum.*
- **Proof:**
  1. Let $P$ be a candidate simple path passing through node $u$.
  2. If $P$ enters $u$'s left child subtree $T_L$, the sum of nodes in $P \cap T_L$ is at most $\text{rawLeft} = \max_{v \in T_L} \text{Sum}(u.left \leadsto v)$.
  3. If $\text{rawLeft} \le 0$, then for any non-empty subpath in $T_L$, its contribution $S_L \le \text{rawLeft} \le 0$.
  4. Omitting the left subtree from $P$ results in path sum $S_{P \setminus T_L} = S_P - S_L \ge S_P$ (since subtracting a non-positive quantity increases or maintains the sum).
  5. Therefore, the optimal path containing $u$ never needs to include a child branch with gain $\le 0$. Capping at $\max(0, \text{gain})$ strictly maximizes the path sum without omitting any superior alternative. $\blacksquare$

#### Dimension 5: Edge Case Matrix
| Edge Scenario | Trigger Condition | Algorithmic Guard / Resolution | Verification Invariant |
| :--- | :--- | :--- | :--- |
| **All-Negative Values** | All $u.val < 0$ (e.g. `[-3, -5, -2]`) | `maxPathSum` initialized to `int.MinValue`; gains capped at 0 | Returns least negative single node value (`-2`), never 0 |
| **Single-Node Tree** | $N = 1$ | Child gains are 0; `localArch = root.val`; `maxPathSum` records `root.val` | Exactly single node value returned |
| **Zero-Value Nodes** | Nodes with $u.val = 0$ | $0 + \text{gain} = \text{gain}$; zero nodes act as neutral bridges | Path can incorporate zero-weight bridges without penalty |
| **Linear Right Skew** | $1 \to 2 \to 3 \to \dots \to N$ | Left gains are 0; path collapses to linear prefix sum along spine | Result equals sum of all positive nodes in chain |
| **Integer Overflow Risk** | Node values near $10^9$ | Sum can exceed 32-bit `int.MaxValue`; cast intermediate additions to `long` | Standard LC 124 guarantees fit within 32-bit signed int |

---

## 2. 💻 DEMONSTRATE: Canonical Invariant Visualization & Algorithmic Mechanics

### 2.1 State Trace: LeetCode 124 (Binary Tree Maximum Path Sum)

Consider the classic tree:
```
           [ -10 ]
           /     \
        [ 9 ]   [ 20 ]
                /    \
             [ 15 ]  [ 7 ]
```

```
Initial: _maxSum = int.MinValue.

1. Node 9 (Leaf):
   leftGain = 0, rightGain = 0.
   Curved Path at 9: 9 + 0 + 0 = 9.
   _maxSum = max(int.MinValue, 9) = 9.
   Return to parent = 9 + max(0, 0) = 9.

2. Node 15 (Leaf):
   leftGain = 0, rightGain = 0.
   Curved Path at 15: 15. _maxSum = max(9, 15) = 15.
   Return to parent = 15.

3. Node 7 (Leaf):
   leftGain = 0, rightGain = 0.
   Curved Path at 7: 7. _maxSum = max(15, 7) = 15.
   Return to parent = 7.

4. Node 20:
   leftGain = max(0, 15) = 15.
   rightGain = max(0, 7) = 7.
   Curved Path at 20: 20 + 15 + 7 = 42!  <=== GLOBAL MAX UPDATED!
   _maxSum = max(15, 42) = 42.
   Return to parent = 20 + max(15, 7) = 20 + 15 = 35.

5. Root (-10):
   leftGain = max(0, 9) = 9.
   rightGain = max(0, 35) = 35.
   Curved Path at Root: -10 + 9 + 35 = 34.
   _maxSum = max(42, 34) = 42.
   Return to caller = -10 + max(9, 35) = 25.

Final Result: _maxSum = 42! (Path: 15 -> 20 -> 7).
```

---

## 3. 🔬 COMPLEXITY & MATHEMATICAL INVARIANTS

### 3.1 Theorem: Optimality of the Positive Bottleneck Rule

> [!TIP]
> ### 🧮 Proof by Contradiction
>
> Let $P$ be a simple path passing through node $u$ as its apex, extending into subtree $T_{\text{left}}$ with branch sum $S_{\text{left}}$, and into $T_{\text{right}}$ with branch sum $S_{\text{right}}$.
> The sum of path $P$ is:
> $$\text{Sum}(P) = u.\text{val} + S_{\text{left}} + S_{\text{right}}$$
>
> **Claim:** If $S_{\text{left}} < 0$, then $P$ cannot be a path of maximum sum.
>
> **Proof:**
> Construct path $P' = P \setminus T_{\text{left}}$ (the path formed by deleting all nodes of $P$ that reside in $T_{\text{left}}$).
> The sum of path $P'$ is:
> $$\text{Sum}(P') = u.\text{val} + S_{\text{right}}$$
> Subtracting the two sums:
> $$\text{Sum}(P') - \text{Sum}(P) = -S_{\text{left}}$$
> Since $S_{\text{left}} < 0$, we have $-S_{\text{left}} > 0 \implies \text{Sum}(P') > \text{Sum}(P)$.
>
> Thus, path $P'$ strictly exceeds $P$ in total sum!
> Therefore, no path of maximum sum will ever include a child branch whose maximum path sum is negative.
> Capping child contributions at $\max(0, \text{gain})$ is mathematically optimal. $\blacksquare$

---

### 3.2 Complexity Invariants
- **Time Complexity:** Strict $\Theta(N)$.
  Every node in the tree is visited exactly once in postorder DFS. At each node, a constant number of comparisons and additions are performed ($O(1)$).
- **Space Complexity:** $\Theta(H)$ where $H$ is the tree height.
  Bounded by the thread call stack ($O(\log N)$ balanced, $O(N)$ skewed).

---

## 4. 🛠️ PRACTICE: Canonical Big Tech Problem Walkthroughs

---

### 4.1 Problem 1: [LeetCode 124] Binary Tree Maximum Path Sum (Hard)

> **Problem Description:**
> A **path** in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence **at most once**. Note that the path does not need to pass through the root.
> The **path sum** of a path is the sum of the node's values in the path.
> Given the `root` of a binary tree, return *the maximum **path sum** of any **non-empty** path*.
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[1, 3 \cdot 10^4]$.
> - $-1000 \le \text{Node.val} \le 1000$

#### Production C# Implementation

```csharp
using System;

public class Solution
{
    private int _maxPathSum;

    public int MaxPathSum(TreeNode? root)
    {
        // CRITICAL: Initialize to int.MinValue to correctly handle all-negative trees
        _maxPathSum = int.MinValue;
        ComputeMaxGain(root);
        return _maxPathSum;
    }

    private int ComputeMaxGain(TreeNode? node)
    {
        if (node == null) return 0;

        // Postorder DFS: calculate max gain from left and right subtrees
        // The Positive Bottleneck Rule: prune negative gains with Math.Max(0, ...)
        int leftGain = Math.Max(0, ComputeMaxGain(node.left));
        int rightGain = Math.Max(0, ComputeMaxGain(node.right));

        // 1. Dual-Role Local Path: price of the new curved path with node as apex
        int currentCurvedPath = node.val + leftGain + rightGain;
        if (currentCurvedPath > _maxPathSum)
        {
            _maxPathSum = currentCurvedPath;
        }

        // 2. Dual-Role Upward Branch: return max single straight branch to parent
        return node.val + Math.Max(leftGain, rightGain);
    }
}
```

---

### 4.2 Problem 2: [LeetCode 337] House Robber III (Medium)

> **Problem Description:**
> The thief has found himself a new place for his thievery again. There is only one entrance to this area, called `root`.
> Besides the `root`, each house has one and only one parent house. After a tour, the smart thief realized that all houses in this place form a binary tree. It will automatically contact the police if **two directly-linked houses were broken into on the same night**.
> Given the `root` of the binary tree, return *the maximum amount of money the thief can rob without alerting the police*.
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[1, 10^4]$.
> - $0 \le \text{Node.val} \le 10^4$

#### Production C# Implementation (Tree Dynamic Programming with Zero-Allocation `ValueTuple`)

```csharp
using System;

public class Solution
{
    public int Rob(TreeNode? root)
    {
        var (robRoot, skipRoot) = RobDfs(root);
        return Math.Max(robRoot, skipRoot);
    }

    // Returns ValueTuple: (int RobThisNode, int SkipThisNode)
    // Stored directly on call stack registers: ZERO heap allocation!
    private static (int Rob, int Skip) RobDfs(TreeNode? node)
    {
        if (node == null) return (0, 0);

        // Postorder DFS: compute sub-decisions for children first
        var left = RobDfs(node.left);
        var right = RobDfs(node.right);

        // Decision 1: If we ROB this node, we CANNOT rob its children
        int rob = node.val + left.Skip + right.Skip;

        // Decision 2: If we SKIP this node, we are free to rob or skip each child
        int skip = Math.Max(left.Rob, left.Skip) + Math.Max(right.Rob, right.Skip);

        return (rob, skip);
    }
}
```

#### Complexity
- **Time Complexity:** $\Theta(N)$ — Every node is visited exactly once. Eliminates exponential $O(2^N)$ overlapping subtree re-calculations.
- **Space Complexity:** $O(H)$ stack space.

---

## 5. ⚡ HARDWARE & SYSTEMS CONNECTIONS

### 5.1 C# `ValueTuple` Register Allocation vs. Heap Memoization

In dynamic programming on trees:
```csharp
// ❌ NAIVE APPROACH: Heap-Allocated Dictionary Memoization
Dictionary<TreeNode, int> memo = new Dictionary<TreeNode, int>();
// Allocates internal hash buckets, calculates HashCode, incurs dictionary lookup overhead.

// ✅ HIGH-PERFORMANCE APPROACH: C# ValueTuple State Vectors
(int Rob, int Skip) RobDfs(TreeNode node);
```
- In 64-bit .NET runtime, a `ValueTuple<int, int>` is an **8-byte value type**.
- The JIT compiler packs both integers into CPU registers (`RAX` and `RDX`), returning the state vector with **zero heap allocation, zero pointer chasing, and zero garbage collection pressure**!

---

## 6. ⚠️ DAILY ERROR LOG & COMMON TRAPS

### Trap 1: Initializing `_maxPathSum` to 0
- **The Mistake:** Writing `private int _maxPathSum = 0;`.
- **The Failure:** If all node values in the tree are negative (e.g. `[-3, -2, -5]`), the maximum path is `-2`, but the code returns `0`!
- **The Fix:** **Always initialize `_maxPathSum = int.MinValue;`**.

### Trap 2: Returning the Curved Path to the Parent
- **The Mistake:** Writing `return node.val + leftGain + rightGain;`.
- **The Failure:** Violates the Simple Path Non-Bifurcation Law. A path cannot fork into both subtrees and continue upward to its parent.
- **The Fix:** Return only the single best straight branch: `return node.val + Math.Max(leftGain, rightGain);`.

### Trap 3: Forgetting `Math.Max(0, ...)`
- **The Mistake:** Writing `int leftGain = ComputeMaxGain(node.left);` without capping at 0.
- **The Failure:** Forces the path to include negative branches, severely degrading the maximum sum.
- **The Fix:** Always prune negative contributions: `Math.Max(0, ComputeMaxGain(node.left))`.

---

## 7. 🎯 DAILY CHECKPOINT & SELF-ASSESSMENT

### 1. Conceptual Verification
1. In [LeetCode 124], why must the global maximum tracker be initialized to `int.MinValue` rather than `0`? What happens if all nodes in the tree are negative (e.g. `[-3]`)?
2. Explain the physical justification behind the Positive Bottleneck Rule: why does capping child gains at 0 simultaneously handle all 4 path configurations at node $u$?
3. In [LeetCode 337] (House Robber III), why does returning a `(rob, skip)` state tuple from each subtree eliminate the need for a memoization hash map?

### 2. Implementation Audit
- Review your `MaxPathSum` implementation. What does it return when given `root = [-2, 1]`? Trace the values of `leftGain`, `rightGain`, `currentCurvedPath`, and the return value to the caller.

---
*Next Module: **Week 11 — Day 73: Path Sum Variations (Root-to-Leaf, All Paths, Prefix Sums on Tree Paths) (LeetCode 112, 113, 437)***
