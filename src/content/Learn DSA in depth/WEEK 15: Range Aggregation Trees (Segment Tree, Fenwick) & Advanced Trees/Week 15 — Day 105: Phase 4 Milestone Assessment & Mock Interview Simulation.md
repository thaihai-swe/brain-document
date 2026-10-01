---
title: "Week 15 — Day 105: Phase 4 Milestone Assessment & Big Tech Mock Interview Simulation"
---

# Week 15 — Day 105: Phase 4 Milestone Assessment & Big Tech Mock Interview Simulation

Welcome to **Day 105 of your DSA Mastery Journey**!

Today marks the **culmination of Phase 4 (Weeks 13–15: Binary Search Trees, Self-Balancing Trees, Tries, and Range Aggregation Trees)**. Over the last 21 days (Days 85–105), you systematically engineered the most sophisticated pointer-based and range-query data structures in computer science:
- **Week 13 (BST Architecture & Invariants):** In-Order invariants, successor/predecessor navigation, 3-case node deletion, range queries, and BST recovery.
- **Week 14 (Self-Balancing Trees & Tries):** AVL rotational mechanics, Red-Black color invariants, from-scratch 26-way Trie prefix trees, and Bitwise Binary Tries for XOR optimization.
- **Week 15 (Range Aggregation & Advanced Trees):** Fenwick Trees (Binary Indexed Trees), Segment Trees with Lazy Propagation, Interval Trees, Order-Statistic Trees (Rank Trees), Persistent BSTs with Path Copying, and Tree Dynamic Programming.

Today is your **Phase 4 Capstone Mock Interview Simulation**:
1. **Mock Interview Simulation (90 Minutes Total):**
   - **Problem 1 (BST Mutation & Invariant Preservation, 45 min):** [LeetCode 450] Delete Node in a BST (Medium/Hard)
   - **Problem 2 (Trie-Pruned Backtracking & Optimization, 45 min):** [LeetCode 212] Word Search II (Hard)
2. **Master Architecture Synthesis:** The Phase 4 Master Tree Selection Decision Matrix.
3. **Comprehensive Phase 4 Retrospective:** Auditing the Top 5 Tree Mutation & Range Aggregator Failure Modes across Days 85–105.
4. **Transition to Phase 5:** The gateway to Graph Algorithms, Topological Sort, Shortest Paths, Minimum Spanning Trees, and Disjoint Set Union (DSU).

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             PHASE 4 CAPSTONE MILESTONE ARCHITECTURE                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
         ┌────────────────────────────────────────┴────────────────────────────────────────┐
         ▼                                                                                 ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     INTERVIEW SIMULATION 1      │                                     │     INTERVIEW SIMULATION 2      │
│      BST 3-Case Node Deletion   │                                     │   Trie-Pruned 2D Backtracking   │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • LC 450: Delete Node (Med/Hard)│                                     │ • LC 212: Word Search II (Hard) │
│ • Case 1: Leaf Node -> null     │                                     │ • 26-Way Prefix Trie            │
│ • Case 2: Single Child -> splice│                                     │ • In-Place '#' Grid Marking     │
│ • Case 3: Two Children:         │                                     │ • Dead-Branch Pruning           │
│   - Find In-Order Successor     │                                     │   (Parent child decrement)      │
│   - Value Copy or Node Splice   │                                     │ • Eliminates O(4^L) explosion   │
│   - Delete Successor from Subtr │                                     │ • Deduplicated Result Set       │
│ • Invariant: BST ordering kept! │                                     │ • O(M*N * 4^L) -> O(M*N * 3^L)  │
│ • O(H) Time, O(H) Space         │                                     │ • O(Total Letters) Space        │
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:*
    - **BST Invariant-Preserving Deletion (LC 450):** Given the root of a BST and a target key, remove the node containing the key while preserving the strict Binary Search Tree invariant ($\forall u: \text{Left}(u) < u < \text{Right}(u)$) across all remaining nodes.
    - **Trie-Pruned Grid Backtracking (LC 212):** Given an $M \times N$ board of characters and a dictionary of words, find all words present on the board via horizontally or vertically adjacent cells without reusing the same physical grid cell in a single word.
  - *Core Invariants:*
    1. **BST Deletion Invariant:** When deleting a node with two children, substituting it with its In-Order Successor (the minimum node in its right subtree) guarantees that all elements in the left subtree remain strictly smaller, and all elements in the remaining right subtree remain strictly larger.
    2. **Trie Prefix Pruning Invariant:** If a grid prefix is not present in the Trie, no valid word can start with this prefix; the recursive search path can be pruned immediately with zero further descent.
    3. **Trie Leaf Pruning Invariant:** Once a word is discovered in the grid, setting `node.Word = null` prevents duplicate reporting. Furthermore, if a leaf node has zero remaining children, it can be pruned from its parent, preventing subsequent traversals from re-exploring dead branches.
  - *Misconception Check:*
    - In LC 450, candidates often try to delete a two-child node by pulling its left child directly into its position, which leads to complex structural rewiring or corrupts right-subtree relationships. Finding the in-order successor reduces the problem to Case 1 or Case 2!
    - In LC 212, running a separate DFS for each word takes $O(W \times M \times N \times 4^L)$ time and results in `Time Limit Exceeded`. Building a unified Trie of all words and executing a single DFS per cell achieves orders of magnitude faster execution.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Solves structural pointer corruption in mutable search trees and eliminates redundant exponential combinatorial searches on 2D matrices.
  - *Complexity Advantage:* BST deletion executes in strictly **$O(H)$ time**; Trie-pruned search cuts the backtracking search space by $> 95\%$ via prefix failure pruning and dynamic node unlinking.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Any Tier-1 technical screen evaluating mutable tree surgery, prefix dictionary matching, or stateful backtracking.
  - *When to Avoid / Failure Modes:* If the grid allows cell reuse, the search is no longer a simple path and can cycle infinitely; in-place grid masking (`board[r][c] = '#'`) must be used with postorder unmasking.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* LC 450 executes in stack frames ($O(H)$ recursion depth), allocating zero new heap objects. LC 212 allocates a compact Trie array structure where each node holds a `TrieNode[26]` buffer; in-place matrix mutation avoids `HashSet<(int, int)>` allocation overhead on the heap.
  - *Production Systems:* Database index B-Tree node rebalancing and underflow merging upon deletion; search engine spell-check and type-ahead suggestions over spatial 2D keyboard coordinates.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "For BST deletion, I navigate to the target key in $O(H)$ time using the BST property. If the node has zero or one child, I splice it directly to null or its single child. If it has two children, I find its in-order successor—the minimum node in its right subtree—copy the successor's value into the target node, and recursively delete the successor from the right subtree. For Word Search II, I insert all words into a prefix Trie. I then launch a backtracking DFS from each grid cell, navigating the Trie simultaneously. I mark visited cells in-place with a sentinel character, prune dead Trie branches dynamically once words are found, and restore grid characters on backtrack."
  - *Interviewer Evaluation Lens:* Verifies that candidate distinguishes all 3 deletion cases, handles the two-child successor swap without pointer leakage, integrates Trie with matrix backtracking, avoids duplicate words via `node.Word = null`, and explains dead-branch Trie pruning.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:*
    - LC 450: Time: $O(H)$ ($O(\log N)$ balanced, $O(N)$ skewed); Auxiliary Space: $O(H)$ stack frames.
    - LC 212: Time: $O(M \times N \times 3^L)$ where $L$ is the max word length; Auxiliary Space: $O(\sum |W|)$ for the Trie.

---

### 1.1 Physical Mental Model — Organ Transplants & The Pack of Scent Hounds

**Analogy 1 — BST Deletion (LC 450): The Organ Transplant & Successor Donor**

Imagine a patient undergoing surgery to remove a diseased organ (node $u$) in a biological tree:
- If the node is a superficial skin tag (leaf) $\implies$ simple excision (return `null`).
- If the node connects to a single blood vessel (one child) $\implies$ bypass surgery (re-route parent pointer directly to child).
- If the node connects to two critical vascular branches (two children) $\implies$ **ORGAN TRANSPLANT REQUIRED!**
  - You cannot leave the left and right branches flapping in the wind.
  - You harvest the **In-Order Successor** (the smallest organ in the right wing, $\min(u.right)$).
  - Why is this donor biologically compatible?
    1. Being from the right branch, it is larger than all left organs.
    2. Being the *minimum* of the right branch, it is smaller than all remaining right organs.
    3. It has **no left vessel of its own** ($s.left == null$), making its harvest safe and trivial!

```
Case 3 Surgical Extraction:
         [ Node to Remove: 5 ]*                 [ Promoted Donor: 6 ] 🏥
        /                      \               /                     \
   [ Left Wing: 3 ]      [ Right Wing: 7 ]   [ Left Wing: 3 ]   [ Right Wing: 7 ]
                         /                                             \
                   [ Donor: 6 ] (Harvested!)                         [ 8 ]
```

---

**Analogy 2 — Word Search II (LC 212): The Pack of Scent Hounds**

Imagine searching a $10 \times 10$ forest grid for 30,000 lost items:
- Searching for each item individually (Word Search I) means walking the entire forest 30,000 times—an impossible $3 \times 10^{10}$ steps!
- Word Search II equips you with a **Pack of Scent Hounds (The Trie)**:
  - You walk across the grid **only once**.
  - At every step, the hounds sniff the current tile:
    - If the scent exists in the Trie: continue forward into neighboring tiles.
    - If the scent goes cold (`children[c - 'a'] == null`): **STOP INSTANTLY!** Turn around and backtrack.
  - When an item is found, strike it from the list (`node.Word = null`) and prune the dead scent trail upward so hounds never sniff that direction again!

```
Forest Cobblestone:         Trie Scent Trail:
      [ o ]                   (Root) -> 'o' -> 'a' -> 't' -> 'h' ★ ("oath" found!)
      [ t ]                   When "oath" is found:
                              - Set node.Word = null (Prevent duplicates)
                              - Prune leaf 'h' if no other words branch here!
```

---

### 1.2 ⚙️ Core Operations Deep-Dive: Phase 4 Advanced Tree Surgery & Trie Search Pruning

#### Dimension 1: Operation Contract & Big-O Bounds

##### 1. BST Invariant-Preserving Deletion (`DeleteNode`)
- **Signature:** `TreeNode? DeleteNode(TreeNode? root, int key)`
- **Pre-conditions:** `root` is a valid BST (or `null`); `key` is an integer.
- **Post-conditions:** Returns the root of the modified BST with the node containing `key` removed. If `key` is not found, the tree is unchanged. The BST invariant is preserved across all nodes.
- **Invariants:**
  1. For any node $u$, all keys in $\text{LeftSubtree}(u) < u.\text{val} < \text{RightSubtree}(u)$.
  2. The in-order traversal of the tree after deletion remains strictly monotonically increasing.

##### 2. Trie-Pruned 2D Matrix Search (`FindWords`)
- **Signature:** `IList<string> FindWords(char[][] board, string[] words)`
- **Pre-conditions:** `board` is an $M \times N$ matrix of lowercase English letters; `words` is a non-null collection of lowercase strings.
- **Post-conditions:** Returns all distinct words from `words` that can be formed by a sequence of adjacent valid grid cells without cell reuse.
- **Invariants:**
  1. *Prefix Synchronization:* At cell $(r, c)$ matched with `TrieNode` $u$, $u$ represents the exact prefix formed by the active path from the start cell.
  2. *Cell Exclusivity:* Any cell in the active DFS path has `board[r][c] == '#'`, preventing self-intersecting loops.

##### Big-O Operational Complexity Matrix
| Operation | Time (Best) | Time (Avg) | Time (Worst) | Aux Space | Primary Computational Bottleneck |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **BST DeleteNode** | $O(1)$ | $O(\log N)$ | $O(N)$ (skewed) | $O(H)$ stack | Pointer chasing down the tree height |
| **Trie Build** | $O(\sum |W|)$ | $O(\sum |W|)$ | $O(\sum |W|)$ | $O(\sum |W|)$ heap | Cache line misses during 26-way node allocations |
| **Grid Backtrack** | $O(M \cdot N)$ | $O(M \cdot N \cdot 3^L)$ | $O(M \cdot N \cdot 4^L)$ | $O(L)$ stack | Branching factor in 4-directional matrix exploration |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
====================================================================================================
                        PHASE 4 META-ALGORITHMIC DECISION TREE
====================================================================================================
What is the structural objective of the operation?
   │
   ├─► [BST Node Deletion: DeleteNode(root, key)]
   │      │
   │      ├─► key < root.val: root.left = DeleteNode(root.left, key); return root;
   │      ├─► key > root.val: root.right = DeleteNode(root.right, key); return root;
   │      └─► key == root.val (Found Node to Delete!):
   │             ├─► Case 1: Leaf (left == null && right == null) => return null;
   │             ├─► Case 2: One child:
   │             │      • left == null => return right;
   │             │      • right == null => return left;
   │             └─► Case 3: Two children:
   │                    • Find In-Order Successor: s = FindMin(root.right);
   │                    • root.val = s.val;
   │                    • root.right = DeleteNode(root.right, s.val);
   │                    • return root;
   │
   └─► [2D Grid Dictionary Search: Word Search II]
          │
          ├─► Phase 1: Build Prefix Trie:
          │      • Insert all words into Trie; attach word string to leaf: node.Word = word.
          │
          └─► Phase 2: Explore Grid:
                 • For each cell (r, c):
                      - If Trie root has child board[r][c] => Launch DFS(r, c, root.Children[board[r][c]]).
                 • In DFS(r, c, node):
                      - If node.Word != null => Add to Results; node.Word = null (deduplicate!).
                      - Save original char: original = board[r][c]; board[r][c] = '#'.
                      - For each direction (dr, dc) in 4 neighbors:
                           • If neighbor valid and node.Children[board[nr][nc]] != null:
                                - Recurse DFS(nr, nc, node.Children[board[nr][nc]]).
                      - Backtrack: board[r][c] = original.
                      - Dead-Branch Pruning: if node has 0 children, unlink from parent.
====================================================================================================
```

---

#### Dimension 3: Visual ASCII State Transitions

##### Trace A: BST 3-Case Node Deletion
Deleting Key `5` from BST:
```
Initial State:
         [5]  <-- Delete target (Two Children)
       /     \
     [3]     [8]
    /   \    /  \
  [2]   [4] [6] [9]
             \
             [7]

Step 1: Find In-Order Successor of [5]:
        Go to right child [8], then descend left-most node => [6]!
Step 2: Copy successor value 6 into target node:
         [6]  <-- Value overwritten
       /     \
     [3]     [8]
    /   \    /  \
  [2]   [4] [6] [9]  <-- Now delete duplicate [6] from right subtree!
             \
             [7]

Step 3: Delete [6] from right subtree:
        Node [6] has only ONE child ([7]).
        Splice [7] into [8]'s left child pointer!

Final State:
         [6]
       /     \
     [3]     [8]
    /   \    /  \
  [2]   [4] [7] [9]
(BST Invariant strictly preserved: 2 < 3 < 4 < 6 < 7 < 8 < 9. Balanced & intact!)
```

---

##### Trace B: Trie-Pruned Grid Backtracking
Grid:
```
[ 'o', 'a', 'a', 'n' ]
[ 'e', 't', 'a', 'e' ]
[ 'i', 'h', 'k', 'r' ]
[ 'i', 'f', 'l', 'v' ]
Words: ["oath", "pea", "eat", "rain"]
```

```
Trie Root:
 ├── 'o' ── 'a' ── 't' ── 'h' (Word: "oath")
 ├── 'p' ── 'e' ── 'a' (Word: "pea")
 ├── 'e' ── 'a' ── 't' (Word: "eat")
 └── 'r' ── 'a' ── 'i' ── 'n' (Word: "rain")

Execution at cell (0, 0) = 'o':
1. 'o' matches Trie root's child 'o'.
   Mark board[0][0] = '#'.
2. Explore neighbors:
   - (0, 1) = 'a' matches child 'a'. Mark '#'.
   - (1, 1) = 't' matches child 't'. Mark '#'.
   - (2, 1) = 'h' matches child 'h'. Mark '#'.
   - Node has Word: "oath"! Add "oath" to Result.
   - Set node.Word = null (Prevent duplicates).
3. Backtrack:
   - Restore (2, 1) = 'h', (1, 1) = 't', (0, 1) = 'a', (0, 0) = 'o'.
4. Result: "oath" found in 4 steps without exploring dead branches!
```

---

#### Dimension 4: Invariant Preservation Proof

##### 1. Mathematical Proof of In-Order Successor Deletion Correctness
Let $T$ be a valid Binary Search Tree. Let $u$ be the node targeted for deletion, having two non-empty children $L = u.\text{left}$ and $R = u.\text{right}$.
- By the BST Invariant:
  $$\forall x \in \text{Subtree}(L): x < u.\text{val}$$
  $$\forall y \in \text{Subtree}(R): y > u.\text{val}$$
- Let $s$ be the in-order successor of $u$, defined as the node with the minimum value in $\text{Subtree}(R)$.
  $$s = \arg\min_{z \in \text{Subtree}(R)} z.\text{val}$$
- **Properties of Successor $s$:**
  1. $s$ has no left child ($s.\text{left} = \text{null}$). If it had a left child, that child would be smaller than $s$, contradicting $s$ being the minimum in $\text{Subtree}(R)$.
  2. Because $s \in \text{Subtree}(R)$, $s.\text{val} > u.\text{val} > \max(\text{Subtree}(L))$. Thus, replacing $u.\text{val}$ with $s.\text{val}$ preserves the left BST invariant:
     $$\forall x \in \text{Subtree}(L): x < s.\text{val}$$
  3. Because $s$ is the minimum in $\text{Subtree}(R)$, all remaining nodes $y \in \text{Subtree}(R) \setminus \{s\}$ satisfy:
     $$y.\text{val} > s.\text{val}$$
     Thus, replacing $u.\text{val}$ with $s.\text{val}$ preserves the right BST invariant.
  4. Deleting $s$ from $\text{Subtree}(R)$ is guaranteed to be trivial (Case 1: leaf, or Case 2: node with only a right child).
- Therefore, the substitution and subsequent deletion recursively maintain the BST invariant across all remaining nodes in $O(H)$ time. $\blacksquare$

##### 2. Correctness Proof of Dead-Branch Trie Pruning
Let $W$ be a leaf node in the Trie where $W.\text{Word} \ne \text{null}$ and $W.\text{Children}$ is empty.
- When $W.\text{Word}$ is discovered in the grid:
  1. Setting $W.\text{Word} = \text{null}$ ensures that no future DFS visits can re-add this word, guaranteeing output uniqueness without requiring a hash set filter.
  2. Since $W.\text{Children}$ is empty and $W$ no longer marks the termination of any word, $W$ is a **dead node** that cannot lead to any further valid word discoveries.
  3. Removing $W$ from its parent's `Children` map preserves the invariant that every remaining path in the Trie leads to at least one valid, undiscovered dictionary word.
  4. This pruning monotonically decreases the Trie size, preventing redundant $O(4^L)$ subtree explorations. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Archetype | Concrete Input Instance | Failure Mode / Danger | Defensive Guard & Mitigation |
| :--- | :--- | :--- | :--- |
| **Deleting Root Node** | `root = [5]`, `key = 5` | `NullReferenceException` or returning disconnected tree | Function returns the new root directly: `return DeleteNode(root, key);` |
| **Key Not Present in BST** | `tree = [2, 1, 3]`, `key = 99` | Infinite descent or runtime crash | Base case `if (root == null) return null;` terminates naturally |
| **Successor is Immediate Right Child** | `root = [5, null, 6]` | Pointer rewiring circular reference | Delete successor by calling `DeleteNode(root.right, successor.val)` directly |
| **Duplicate Words in Dictionary** | `words = ["a", "a"]` | Duplicate results returned in output list | Set `node.Word = null` immediately upon first discovery |
| **Grid Cell Visited Self-Intersection** | `board = [['a', 'a']]`, `word = "aaa"` | Traversing back to initial cell causing infinite loop | Mutate `board[r][c] = '#'` before recursion, restore on backtrack |
| **Single Character Word Search** | `board = [['a']]`, `words = ["a"]` | Directional loops out-of-bounds | Immediate check of `node.Word != null` at start of DFS before neighbor loops |

---

---

### 🎤 Multi-Topic Spoken Synthesis Drill (≤ 60 Seconds)

#### Synthesis Drill 5: Segment Tree vs. Fenwick Tree (BIT) vs. Sparse Table
- **Sparse Table:** Static array only (no updates). $O(1)$ range queries via idempotence ($\min, \max, \gcd$). $O(N \log N)$ preprocessing.
- **Fenwick Tree (BIT):** Mutable array with *point updates* and *prefix sum queries* in $O(\log N)$. Minimal memory ($N$ ints), simple lowbit arithmetic (`i & -i`).
- **Segment Tree:** Mutable array with *range updates* and *range queries* of arbitrary associative functions in $O(\log N)$. Uses $4N$ memory; supports lazy propagation for range assignments/adds.


## 2. 🥊 MOCK INTERVIEW PROBLEM 1: LeetCode 450 — Delete Node in a BST (Medium/Hard)

### Problem Statement
> Given a root node reference of a BST and a key, delete the node with the given key in the BST. Return *the root node reference (possibly updated) of the BST*.
>
> Basically, the deletion can be divided into two stages:
> 1. Search for a node to remove.
> 2. If the node is found, delete the node.
>
> **Constraints:**
> - The number of nodes in the tree is in the range $[0, 10^4]$.
> - $-10^5 \le \text{Node.val} \le 10^5$
> - Each node has a unique value.
> - `root` is a valid binary search tree.
> - $-10^5 \le \text{key} \le 10^5$

---

### Production C# Implementation

```csharp
namespace AdvancedTrees.Day105
{
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

    public static class BstSurgery
    {
        /// <summary>
        /// Deletes a node with the specified key from the BST while preserving the BST invariant.
        /// Time Complexity: O(H) where H is the height of the tree.
        /// Space Complexity: O(H) call stack frames.
        /// </summary>
        public static TreeNode? DeleteNode(TreeNode? root, int key)
        {
            if (root == null) return null;

            if (key < root.val)
            {
                // Key lies in left subtree
                root.left = DeleteNode(root.left, key);
                return root;
            }
            else if (key > root.val)
            {
                // Key lies in right subtree
                root.right = DeleteNode(root.right, key);
                return root;
            }
            else
            {
                // Found the node to delete!
                
                // Case 1: Leaf node (no children)
                if (root.left == null && root.right == null)
                {
                    return null;
                }

                // Case 2: Exactly one child
                if (root.left == null)
                {
                    return root.right;
                }
                if (root.right == null)
                {
                    return root.left;
                }

                // Case 3: Two children
                // Find in-order successor (minimum node in right subtree)
                TreeNode successor = FindMin(root.right);

                // Copy successor value to current node
                root.val = successor.val;

                // Recursively delete the successor from the right subtree
                root.right = DeleteNode(root.right, successor.val);

                return root;
            }
        }

        private static TreeNode FindMin(TreeNode node)
        {
            TreeNode current = node;
            while (current.left != null)
            {
                current = current.left;
            }
            return current;
        }
    }
}
```

---

## 3. 🥊 MOCK INTERVIEW PROBLEM 2: LeetCode 212 — Word Search II (Hard)

### Problem Statement
> Given an `m x n` `board` of characters and a list of strings `words`, return *all words on the board*.
>
> Each word must be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.
>
> **Constraints:**
> - $m == \text{board.length}$
> - $n == \text{board}[i].\text{length}$
> - $1 \le m, n \le 12$
> - `board[i][j]` is a lowercase English letter.
> - $1 \le \text{words.length} \le 3 \times 10^4$
> - $1 \le \text{words}[i].\text{length} \le 10$
> - `words[i]` consists of lowercase English letters.
> - All strings of `words` are unique.

---

### Production C# Implementation

```csharp
using System.Collections.Generic;

namespace AdvancedTrees.Day105
{
    public sealed class TrieNode
    {
        public readonly TrieNode?[] Children = new TrieNode?[26];
        public string? Word = null; // Stores complete word at leaf to avoid StringBuilder
        public int ChildCount = 0;   // Enables dead-branch pruning
    }

    public static class WordSearchIISolver
    {
        public static IList<string> FindWords(char[][] board, string[] words)
        {
            var results = new List<string>();
            if (board == null || board.Length == 0 || words == null || words.Length == 0)
                return results;

            // Step 1: Build Prefix Trie
            TrieNode root = BuildTrie(words);

            int rows = board.Length;
            int cols = board[0].Length;

            // Step 2: Backtrack from each cell
            for (int r = 0; r < rows; r++)
            {
                for (int c = 0; c < cols; c++)
                {
                    int charIdx = board[r][c] - 'a';
                    if (root.Children[charIdx] != null)
                    {
                        Dfs(board, r, c, root, results);
                    }
                }
            }

            return results;
        }

        private static TrieNode BuildTrie(string[] words)
        {
            var root = new TrieNode();

            foreach (string word in words)
            {
                TrieNode current = root;
                foreach (char c in word)
                {
                    int idx = c - 'a';
                    if (current.Children[idx] == null)
                    {
                        current.Children[idx] = new TrieNode();
                        current.ChildCount++;
                    }
                    current = current.Children[idx]!;
                }
                current.Word = word;
            }

            return root;
        }

        private static void Dfs(
            char[][] board, 
            int r, 
            int c, 
            TrieNode parent, 
            List<string> results)
        {
            char originalChar = board[r][c];
            int charIdx = originalChar - 'a';
            TrieNode? current = parent.Children[charIdx];

            if (current == null) return;

            // If node holds a word, record it and clear to prevent duplicate results
            if (current.Word != null)
            {
                results.Add(current.Word);
                current.Word = null;
            }

            // Mark cell visited in-place
            board[r][c] = '#';

            // Explore 4 adjacent neighbors
            int[] dRow = { -1, 1, 0, 0 };
            int[] dCol = { 0, 0, -1, 1 };

            for (int i = 0; i < 4; i++)
            {
                int nr = r + dRow[i];
                int nc = c + dCol[i];

                if (nr >= 0 && nr < board.Length && 
                    nc >= 0 && nc < board[0].Length && 
                    board[nr][nc] != '#')
                {
                    int nextIdx = board[nr][nc] - 'a';
                    if (current.Children[nextIdx] != null)
                    {
                        Dfs(board, nr, nc, current, results);
                    }
                }
            }

            // Backtrack: restore original character
            board[r][c] = originalChar;

            // Dead-Branch Pruning: if current node has no children and holds no word, unlink it
            if (current.ChildCount == 0 && current.Word == null)
            {
                parent.Children[charIdx] = null;
                parent.ChildCount--;
            }
        }
    }
}
```

---

## 4. 🔬 VERIFY: Phase 4 Master Retrospective & Production Quality Checklist

### Phase 4 Comprehensive Tree Structures Comparison

| Data Structure | Lookup | Insert | Delete | Range Query | Space | Key Strength | Primary Limitation |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| **Standard BST** | $O(H)$ | $O(H)$ | $O(H)$ | $O(K + H)$ | $O(N)$ | Simple pointer logic | Degenerates to $O(N)$ on sorted input |
| **AVL Tree** | $O(\log N)$ | $O(\log N)$ | $O(\log N)$ | $O(K + \log N)$ | $O(N)$ | Strict balance ($\Delta h \le 1$), fastest lookups | More rotations during mutations |
| **Red-Black Tree** | $O(\log N)$ | $O(\log N)$ | $O(\log N)$ | $O(K + \log N)$ | $O(N)$ | Amortized $O(1)$ rotations, standard in STL/CLR | Slightly taller than AVL (height $\le 2\log N$) |
| **26-Way Trie** | $O(L)$ | $O(L)$ | $O(L)$ | $O(\text{prefix})$ | $O(\Sigma \cdot N)$ | Instant prefix matching & autocomplete | High memory footprint ($26$ pointers per node) |
| **Fenwick Tree (BIT)** | $O(1)$ point | $O(\log N)$ | N/A | $O(\log N)$ prefix | $O(N)$ | Zero pointer overhead, extreme cache locality | Cannot easily support range min/max |
| **Segment Tree** | $O(\log N)$ | $O(\log N)$ | N/A | $O(\log N)$ range | $O(4N)$ | Handles arbitrary associative ops + lazy range updates | High memory constant, complex lazy propagation |
| **Order-Statistic Tree** | $O(\log N)$ | $O(\log N)$ | $O(\log N)$ | $O(\log N)$ rank | $O(N)$ | $O(\log N)$ `Select(k)` and `Rank(x)` | Requires custom balance + size augmentation |
| **Persistent BST** | $O(\log N)$ | $O(\log N)$ | $O(\log N)$ | $O(\log N)$ | $O(M \log N)$ | Immutable historical versions, zero locks | High allocation rate on Gen 0 managed heap |

---

### Top 5 Phase 4 Failure Modes Audited

1. **BST Deletion Pointer Leaks:**
   - *Failure:* Deleting a two-child node by attempting to splice its children directly rather than copying the in-order successor's value.
   - *Remedy:* Always reduce Case 3 to Case 1 or 2 by swapping values with the successor, then calling `DeleteNode(root.right, successor.val)`.
2. **AVL Balance Factor Desynchronization:**
   - *Failure:* Calculating height as `max(left, right)` instead of `1 + max(left, right)`.
   - *Remedy:* Standardize `UpdateHeight(node)` as a single helper executed after every rotation.
3. **Fenwick Tree Zero-Index Infinite Loop:**
   - *Failure:* Passing `i = 0` to `lowbit(i) = i & (-i)`, which yields `0`, freezing the thread in an infinite loop.
   - *Remedy:* Strictly enforce 1-based indexing for all BIT buffers.
4. **Segment Tree Lazy Propagation Misses:**
   - *Failure:* Querying child subtrees without pushing down pending lazy tags from the parent.
   - *Remedy:* Execute `PushDown(node)` at the very beginning of both `UpdateRange` and `QueryRange`.
5. **Trie Memory Explosion on Sparse Alphabets:**
   - *Failure:* Allocating `new TrieNode[256]` or `[65536]` for Unicode inputs.
   - *Remedy:* Use a `Dictionary<char, TrieNode>` or Ternary Search Tree (TST) for large alphabets; reserve fixed 26-element arrays strictly for lowercase ASCII.

---

### 🎓 Phase 4 Graduation & Gateway to Phase 5

Congratulations on completing **Phase 4**! You have conquered:
- Tree pointers, recursive inversions, and Morris threading.
- AVL and Red-Black tree self-balancing rotations.
- Prefix trees, bitwise XOR tries, and Trie-pruned matrix backtracking.
- Logarithmic range aggregators: Fenwick Trees and Segment Trees with Lazy Propagation.
- Order-Statistic Trees, Persistent Path Copying, and Tree Dynamic Programming.

You are now fully prepared to ascend to **Phase 5: Graphs, Topological Sorting, Shortest Paths, Minimum Spanning Trees, and Network Flows**!
