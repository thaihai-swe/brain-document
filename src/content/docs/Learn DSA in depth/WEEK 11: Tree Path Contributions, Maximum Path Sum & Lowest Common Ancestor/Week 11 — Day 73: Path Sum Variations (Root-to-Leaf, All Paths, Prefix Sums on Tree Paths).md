---
title: "Week 11 — Day 73: Path Sum Variations (Root-to-Leaf, All Paths, Prefix Sums on Tree Paths)"
---

# Week 11 — Day 73: Path Sum Variations (Root-to-Leaf, All Paths, Prefix Sums on Tree Paths)

Welcome to **Day 73 of your DSA Mastery Journey**!

Yesterday in [Day 72](./Week%2011%20%E2%80%94%20Day%2072:%20Binary%20Tree%20Maximum%20Path%20Sum%20%E2%80%94%20The%20Global%20Variable%20Contribution%20Model.md), we mastered the global variable contribution model and the positive bottleneck rule for maximum curved path sums.

Today, we explore the **Tripartite Taxonomy of Path Sum Problems**:
1. **Type 1 (Root-to-Leaf Fixed Paths):** Subtractive state propagation terminating strictly on leaf nodes ([LeetCode 112]).
2. **Type 2 (All Paths Enumeration):** Systematic backtracking with single-instance mutable buffers ([LeetCode 113]).
3. **Type 3 (Arbitrary Ancestor-to-Descendant Downward Paths):** The profound fusion of **Prefix Sums** with **Tree DFS** in strict $\Theta(N)$ time ([LeetCode 437]).
4. **The Cross-Branch Contamination Hazard:** Why prefix sum dictionaries strictly require backtracking unwinding (`map[currSum]--`) upon subtree exit.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 73 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: PATH TAXONOMY       │                                     │     PART II: PREFIX TREE DFS    │
│  Root-to-Leaf vs Arbitrary Down │                                     │      Path Sum III Invariant     │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Type 1: Leaf Target Subtraction│                                    │ • Prefix Map: Dictionary<long,int│
│ • Type 2: Backtracking Path Copy│                                     │ • map[0] = 1 Root Base Case     │
│ • The Non-Leaf Premature Stop   │                                     │ • Cross-Branch Isolation Law    │
│ • Single Mutable Buffer Hygiene │                                     │ • 64-bit Overflow Prevention    │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **Tree Path Sum Variations** categorize all downward path problems into 3 distinct algorithmic patterns: 1. Root-to-Leaf existence; 2. Root-to-Leaf path enumeration; 3. Arbitrary downward sub-paths.
  - *Core Invariants:* Type 1 (Existence): Subtractive target $\text{target} - u.val == 0$ at leaf; Type 2 (Enumeration): Backtracking with list recycling (`path.Add(u.val)` on entry, `path.RemoveAt(path.Count - 1)` on exit); Type 3 (Arbitrary Downward): Prefix Sum Map on ancestor paths with postorder backtracking (`prefixMap[runningSum]--`).
  - *Misconception Check:* In Type 3 (LC 437), naive double-DFS runs in $O(N^2)$ time; tracking running prefix sums in a hash map along the active ancestor path achieves optimal $\Theta(N)$ linear time, but you MUST decrement the prefix count before returning to the parent to prevent state bleeding into sibling subtrees!
- **2. WHY:**
  - *Bottleneck Solved:* Lifts 1D array prefix sum techniques onto hierarchical tree topologies, reducing path search from $O(N^2)$ to $\Theta(N)$.
  - *Complexity Advantage:* Solves arbitrary downward path counting in strict $O(N)$ linear time and $O(H)$ space.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Path Sum" (LC 112), "Path Sum II" (LC 113), "Path Sum III" (LC 437). Signal words: "root-to-leaf path sum", "find all paths matching target", "path sum III arbitrary downward".
  - *When to Avoid / Failure Modes:* If paths can travel upward through ancestors and down another branch (requires tree diameter / maximum path sum contribution model).
- **4. WHERE:**
  - *Physical CLR Memory:* Managed heap dictionary `Dictionary<long, int>` for prefix sums; 64-bit integer keys prevent arithmetic overflow; stack recursion frames.
  - *Production Systems:* Hierarchical file system quota tracking, network security permission path validation, decision tree path risk scoring.
- **5. WHO:**
  - *Spoken Script:* "For Path Sum III, naive double DFS takes $O(N^2)$. I optimize to $O(N)$ by maintaining a running prefix sum in a hash map along the active recursion branch. Before returning to the parent, I decrement the prefix sum's count in the map so it does not falsely bleed into sibling subtrees."
  - *Interviewer Evaluation Lens:* Verifies prefix sum backtracking cleanup (`map[sum]--`), map initialization with `{0: 1}`, 64-bit overflow prevention, and list recycling in Type 2.
- **6. HOW:**
  - *Cost Model:* Type 1: $O(N)$ time, $O(H)$ space; Type 2: $O(N)$ time, $O(H)$ space (excluding output); Type 3: $\Theta(N)$ time, $O(H)$ space.
  - *State Transition Trace (Type 3 Prefix):* `runningSum += node.val -> count += map[runningSum - target] -> map[runningSum]++ -> recurse left & right -> map[runningSum]-- (Backtrack!)`.


### 1.1 The Path Taxonomy on Trees

Not all "paths" are created equal. In technical interviews, identifying the exact geometric constraints of the path statement is critical:

| Path Type | Start Node | End Node | Directionality | Canonical Problem | Optimal Time |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Type 1: Root-to-Leaf Existence** | Must be `Root` | Must be `Leaf` | Strictly Downward | [LeetCode 112] | $O(N)$ time, $O(H)$ space |
| **Type 2: Root-to-Leaf Enumeration**| Must be `Root` | Must be `Leaf` | Strictly Downward | [LeetCode 113] | $O(N)$ time, $O(H)$ space |
| **Type 3: Ancestor-to-Descendant** | Any Ancestor | Any Descendant | Strictly Downward | [LeetCode 437] | $\mathbf{O(N)}$ (with Prefix Map) |
| **Type 4: Any-to-Any (Curved)** | Any Node | Any Node | Can Curve at Apex | [LeetCode 124] | $O(N)$ time, $O(H)$ space |

---

### 1.2 Type 1 & 2: Subtractive State & Backtracking Memory Hygiene

For root-to-leaf paths:
- Instead of adding values upward ($0 + \text{val}_1 + \text{val}_2 \dots$), subtract downward:
  $$\text{remainingSum} = \text{targetSum} - \text{node.val}$$
- **The Leaf Termination Invariant:**
  A path is valid if and only if:
  $$\text{remainingSum} == 0 \quad \text{AND} \quad \text{node.left} == \text{null} \quad \text{AND} \quad \text{node.right} == \text{null}$$

#### Memory Allocation Antipattern in Type 2:
```csharp
// ❌ CATASTROPHIC: Creates a new List at EVERY SINGLE recursive call!
void Dfs(TreeNode node, List<int> currentPath) {
    var newPath = new List<int>(currentPath); // Copies O(H) elements every call -> O(N * H) memory!
    newPath.Add(node.val);
    ...
}
```

#### Production Backtracking Invariant:
Maintain a **single shared mutable buffer** `List<int> currentPath`.
1. Append on entry: `currentPath.Add(node.val);`
2. If valid leaf: add deep clone to result: `result.Add(new List<int>(currentPath));`
3. Backtrack on exit: `currentPath.RemoveAt(currentPath.Count - 1);`
This guarantees that auxiliary heap memory never exceeds $O(H)$!

---

### 1.3 Type 3: The Prefix Sum on Trees Transformation

In [LeetCode 437], the path can start at **any ancestor** and end at **any descendant**, traveling strictly downwards.

#### The Naive Double DFS ($O(N^2)$):
Run a DFS from the root to visit every node. From *every* node visited, launch a second DFS to find all valid downward paths starting from that node:
$$T(N) = \sum_{u \in V} O(\text{depth}(u)) = O(N^2) \quad \text{on degenerate trees!}$$

#### The Optimal Prefix Sum Map Transformation ($\Theta(N)$):
Recall the 1D Prefix Sum formula ([Day 9](../WEEK%202:%20Advanced%20Traversal%20-%20Sliding%20Window%20&%20Prefix%20Sums/Week%202%20%E2%80%94%20Day%209:%20Prefix%20Sum%20%2B%20Hash%20Map%20%28The%20Subarray%20Sum%20Pattern%29.md)):
$$\text{Sum}(nums[j \dots i]) = P[i] - P[j - 1] = \text{target} \implies P[j - 1] = P[i] - \text{target}$$

On a tree, the path from the root down to the current node $u$ forms a 1-dimensional prefix chain!
Any valid sub-path ending at node $u$ with sum equal to `targetSum` satisfies:
$$\text{CurrentPrefixSum} - \text{AncestorPrefixSum} = \text{targetSum}$$
$$\mathbf{\text{AncestorPrefixSum} = \text{CurrentPrefixSum} - \text{targetSum}}$$

By maintaining a frequency hash map `Dictionary<long, int> prefixMap` along the active DFS recursion branch:
$$\text{validPathsEndingAtCurrent} = \text{prefixMap.GetValueOrDefault}(\text{currentSum} - \text{targetSum})$$

---

### 1.4 The Cross-Branch Contamination Law (Backtracking Map Decrement)

Unlike a 1D array where traversal is linear, a tree branches into left and right subtrees.

```
                         [ Root ]  (Prefix = 10)
                         /      \
               (Branch 1)        (Branch 2)
                 [ A ]             [ B ]
```

> [!CAUTION]
> ### ⚠️ The Fatal Cross-Branch Contamination Bug
> Suppose during the exploration of Branch 1 (node $A$), we add $A$'s prefix sum to `prefixMap`.
> When DFS finishes Branch 1 and backtracks to Root, it proceeds to explore Branch 2 (node $B$).
>
> If $A$'s prefix sum was **not removed** from `prefixMap`:
> When inspecting node $B$, the algorithm might match $B$'s sum against $A$'s prefix sum!
> But $A$ is in a completely disjoint subtree—it is **NOT an ancestor of $B$**!
>
> **The Immutable Invariant:**
> When backtracking out of a node, **you MUST decrement its prefix sum frequency**:
> ```csharp
> prefixMap[currentSum]--;
> ```
> This ensures that `prefixMap` contains **ONLY** prefix sums from the root down along the **current ancestor spine**!

---

## 2. 💻 DEMONSTRATE: Canonical Invariant Visualization & Algorithmic Mechanics

### 2.1 State Trace: Prefix Sum Map on Trees (LeetCode 437)

Let target sum be $K = 8$. Tree:
```
                 [ 10 ]
                /      \
             [ 5 ]    [ -3 ]
            /     \        \
         [ 3 ]   [ 2 ]    [ 11 ]
```

```
Initial: prefixMap = { 0: 1 }. totalPaths = 0.

1. At Root 10:
   currSum = 10.
   Target ancestor needed: currSum - K = 10 - 8 = 2.
   Does map contain 2? No.
   Add 10 to map: { 0: 1, 10: 1 }.

2. At Node 5:
   currSum = 10 + 5 = 15.
   Target needed: 15 - 8 = 7. Not in map.
   Add 15 to map: { 0: 1, 10: 1, 15: 1 }.

3. At Node 3:
   currSum = 15 + 3 = 18.
   Target needed: 18 - 8 = 10.
   Does map contain 10? YES! (prefixMap[10] = 1).
   ===> PATH FOUND! (Path: 5 -> 3, sum = 8). totalPaths += 1.
   Add 18 to map. Recurse children (both null).
   BACKTRACK: decrement 18 from map!

4. Backtrack to Node 5:
   Recurse into Right Child (2):
   currSum = 15 + 2 = 17.
   Target needed: 17 - 8 = 9. Not in map.
   Add 17 to map. Recurse children.
   BACKTRACK: decrement 17 from map!

5. Backtrack out of Node 5:
   BACKTRACK: decrement 15 from map!
   Map now contains: { 0: 1, 10: 1 }. (Clean! Node 5 leaves zero residue!).

6. At Node -3 (Right branch of Root):
   currSum = 10 + (-3) = 7.
   Target needed: 7 - 8 = -1. Not in map.
   Add 7 to map.

7. At Node 11:
   currSum = 7 + 11 = 18.
   Target needed: 18 - 8 = 10.
   Does map contain 10? YES! (prefixMap[10] = 1).
   ===> PATH FOUND! (Path: -3 -> 11, sum = 8). totalPaths += 1.
```

---

## 3. 🔬 COMPLEXITY & MATHEMATICAL INVARIANTS

### 3.1 Theorem: Optimality of Prefix Sum Tree Traversal

> [!TIP]
> ### 🧮 Complexity Proof
>
> In `PathSumIII`:
> 1. Every node $u \in V$ is visited exactly once during the DFS traversal.
> 2. At each node $u$, hash map lookups, insertions, and decrements take $O(1)$ average time.
> 3. Total time:
>    $$T(N) = \sum_{u \in V} O(1) = \mathbf{\Theta(N)}$$
> 4. Space complexity is determined by:
>    - The recursion call stack: $O(H)$.
>    - The size of `prefixMap`: At any moment, the map contains at most $H + 1$ distinct prefix entries (corresponding strictly to ancestors along the current root-to-node path).
>    - Thus, total auxiliary space is **$\Theta(H)$**—optimal! $\blacksquare$

---

### 3.2 The Base Case Invariant: Why `prefixMap[0] = 1` is Mandatory
If a path starting **directly at the Root** has a sum equal to `targetSum`:
$$\text{CurrentPrefixSum} = \text{targetSum} \implies \text{CurrentPrefixSum} - \text{targetSum} = 0$$
To record this path, the map must indicate that a prefix sum of $0$ has occurred **once** (representing the empty path before the root).
Omitting `prefixMap[0] = 1` causes all valid paths originating at the root to be missed!

---

## 4. 🛠️ PRACTICE: Canonical Big Tech Problem Walkthroughs

---

### 4.1 Problem 1: [LeetCode 112] Path Sum (Easy)

> **Problem Description:**
> Given the `root` of a binary tree and an integer `targetSum`, return `true` if the tree has a **root-to-leaf** path such that adding up all the values along the path equals `targetSum`.
> *A leaf is a node with no children.*
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[0, 5000]$.
> - $-1000 \le \text{Node.val}, \text{targetSum} \le 1000$

#### Production C# Implementation (Subtractive State Propagation)

```csharp
public class Solution
{
    public bool HasPathSum(TreeNode? root, int targetSum)
    {
        if (root == null) return false;

        // Leaf condition: verify if remaining target equals leaf value
        if (root.left == null && root.right == null)
        {
            return targetSum == root.val;
        }

        // Subtractive recursion down both branches
        int remainingSum = targetSum - root.val;
        return HasPathSum(root.left, remainingSum) || HasPathSum(root.right, remainingSum);
    }
}
```

---

### 4.2 Problem 2: [LeetCode 113] Path Sum II (Medium)

> **Problem Description:**
> Given the `root` of a binary tree and an integer `targetSum`, return *all **root-to-leaf** paths where the sum of the node values in the path equals `targetSum`*.
> Each path should be returned as a list of the node **values**, not node references.
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[0, 5000]$.
> - $-1000 \le \text{Node.val}, \text{targetSum} \le 1000$

#### Production C# Implementation (Backtracking with Shared Mutable Buffer)

```csharp
using System.Collections.Generic;

public class Solution
{
    public IList<IList<int>> PathSum(TreeNode? root, int targetSum)
    {
        var result = new List<IList<int>>();
        var currentPath = new List<int>();

        Dfs(root, targetSum, currentPath, result);
        return result;
    }

    private static void Dfs(TreeNode? node, int remainingSum, List<int> currentPath, List<IList<int>> result)
    {
        if (node == null) return;

        // 1. Choose: Add current node to shared path buffer
        currentPath.Add(node.val);
        remainingSum -= node.val;

        // 2. Leaf Check: If remaining sum is 0 at a leaf, record a snapshot clone of currentPath
        if (node.left == null && node.right == null && remainingSum == 0)
        {
            result.Add(new List<int>(currentPath)); // Deep clone
        }
        else
        {
            // Explore children
            Dfs(node.left, remainingSum, currentPath, result);
            Dfs(node.right, remainingSum, currentPath, result);
        }

        // 3. Un-choose (Backtrack): Pop node to preserve buffer state for ancestor callers
        currentPath.RemoveAt(currentPath.Count - 1);
    }
}
```

---

### 4.3 Problem 3: [LeetCode 437] Path Sum III (Medium)

> **Problem Description:**
> Given the `root` of a binary tree and an integer `targetSum`, return *the number of paths where the sum of the values along the path equals `targetSum`*.
> The path does not need to start or end at the root or a leaf, but it must go downwards (i.e., traveling only from parent nodes to child nodes).
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[0, 1000]$.
> - $-10^9 \le \text{Node.val} \le 10^9$
> - $-1000 \le \text{targetSum} \le 1000$

#### Production C# Implementation ($\Theta(N)$ Prefix Sum HashMap with 64-Bit Arithmetic)

```csharp
using System.Collections.Generic;

public class Solution
{
    public int PathSum(TreeNode? root, int targetSum)
    {
        if (root == null) return 0;

        // Key: Running Prefix Sum (long to prevent 32-bit integer overflow)
        // Value: Frequency of this prefix sum along the current ancestor path
        var prefixMap = new Dictionary<long, int>();

        // Invariant: Base case for paths starting directly at the root
        prefixMap[0L] = 1;

        return Dfs(root, 0L, targetSum, prefixMap);
    }

    private static int Dfs(TreeNode? node, long currentSum, int targetSum, Dictionary<long, int> prefixMap)
    {
        if (node == null) return 0;

        // 1. Update running prefix sum with 64-bit precision
        currentSum += node.val;

        // 2. Count paths ending at current node: Ancestor needed = currentSum - targetSum
        long neededPrefix = currentSum - targetSum;
        int pathsEndingHere = prefixMap.GetValueOrDefault(neededPrefix, 0);

        // 3. Add current prefix sum to map for descendant nodes
        prefixMap[currentSum] = prefixMap.GetValueOrDefault(currentSum, 0) + 1;

        // 4. Recurse left and right subtrees
        int totalPaths = pathsEndingHere
                       + Dfs(node.left, currentSum, targetSum, prefixMap)
                       + Dfs(node.right, currentSum, targetSum, prefixMap);

        // 5. CRITICAL: Backtrack! Decrement current prefix sum to maintain cross-branch isolation
        prefixMap[currentSum]--;

        return totalPaths;
    }
}
```

---

## 5. ⚡ HARDWARE & SYSTEMS CONNECTIONS

### 5.1 Call-Stack Local Buffers vs. Heap Allocation Storms

In backtracking tree searches:
```csharp
// ❌ HEAP ALLOCATION STORM: Creates 10,000 List<int> objects for GC to collect
void BadDfs(TreeNode node, List<int> path) {
    var copy = new List<int>(path); // Allocates a new array on Gen 0 GC heap every frame!
}

// ✅ ZERO-ALLOCATION BACKTRACKING: Exactly ONE single List<int> lives throughout
void GoodDfs(TreeNode node, List<int> sharedBuffer) {
    sharedBuffer.Add(node.val);
    // ...
    sharedBuffer.RemoveAt(sharedBuffer.Count - 1);
}
```
In high-throughput microservices, the zero-allocation approach reduces GC pause times by **99.5%**, keeping CPU L1 caches hot.

---

## 6. ⚠️ DAILY ERROR LOG & COMMON TRAPS

### Trap 1: Omitting Backtracking Decrement in Path Sum III
- **The Bug:** Omitting `prefixMap[currentSum]--;` before returning from DFS.
- **The Failure:** Causes **cross-branch contamination**: prefix sums from the left subtree remain visible when traversing the right subtree, falsely counting zigzag upward-downward paths.
- **The Fix:** **Always decrement `prefixMap[currentSum]--` on function exit.**

### Trap 2: 32-Bit Signed Integer Overflow in Path Sum III
- **The Bug:** Using `int currentSum = 0;`.
- **The Failure:** With constraints $\text{Node.val} = 10^9$, adding three nodes exceeds $2.14 \times 10^9$ (`int.MaxValue`), wrapping to negative numbers.
- **The Fix:** **Always use `long`** for running prefix sums in LeetCode 437.

### Trap 3: Checking Leaf Target Sum on Non-Leaf Nodes
- **The Bug:** In LeetCode 112, writing `if (targetSum == 0) return true;` before verifying `left == null && right == null`.
- **The Failure:** Stops prematurely at an internal node whose value happens to sum to target, returning `true` for a partial path that does not reach a leaf!
- **The Fix:** Target sum verification **MUST be combined with leaf verification**: `if (node.left == null && node.right == null && remainingSum == 0)`.

---

## 7. 🎯 DAILY CHECKPOINT & SELF-ASSESSMENT

### 1. Conceptual Verification
1. In [LeetCode 437] (Path Sum III), why is it mandatory to decrement `prefixMap[currentSum]--` when backtracking out of a node? What cross-branch corruption occurs if this step is omitted?
2. Why is `prefixMap[0L] = 1` required before starting the DFS traversal in Path Sum III? What happens if this line is deleted?
3. In [LeetCode 113], why must we write `result.Add(new List<int>(currentPath))` rather than `result.Add(currentPath)`?

### 2. Implementation Audit
- Review your `PathSum` solution for LeetCode 437. What happens when the tree contains negative node values that bring the prefix sum back to an earlier value (e.g. $10 \to -5 \to 5$)? Does `Dictionary<long, int>` handle duplicate prefix sums correctly?

---
*Next Module: **Week 11 — Day 74: Lowest Common Ancestor (LCA) in Binary Trees (LeetCode 236, 1650, 1644)***
