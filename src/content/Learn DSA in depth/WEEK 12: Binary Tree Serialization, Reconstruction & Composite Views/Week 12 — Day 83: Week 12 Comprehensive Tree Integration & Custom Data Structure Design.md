---
title: "Week 12 — Day 83: Week 12 Comprehensive Tree Integration & Custom Data Structure Design"
---

# Week 12 — Day 83: Week 12 Comprehensive Tree Integration & Custom Data Structure Design

Welcome to **Day 83 of your DSA Mastery Journey**!

Yesterday in [Day 82](./Week%2012%20%E2%80%94%20Day%2082:%20Tree%20Count%20&%20Enumeration:%20Unique%20Binary%20Search%20Trees%20&%20Catalan%20Numbers.md), we explored combinatorial tree enumeration, Catalan numbers, and Cartesian subtree generation with structural sharing.

Today is our **Week 12 Capstone & Advanced Synthesis Day**:
1. **Expression Tree Construction & Evaluation (Abstract Syntax Trees):** Building binary ASTs from postfix expressions using an explicit node stack, evaluating arithmetic trees recursively via postorder bottom-up synthesis.
2. **Postorder Pruning & Forest Collection ([LeetCode 1110]):** Deleting arbitrary target nodes from a binary tree, cleanly severing parent references, and assembling disjoint tree components into a forest.
3. **The Postorder Greedy State Machine ([LeetCode 968]):** Solving the minimum vertex cover / dominating set problem on trees (**Binary Tree Cameras**) in strictly $O(N)$ time via bottom-up 3-state aggregation.
4. **Systems Architecture:** C# Roslyn compiler `SyntaxTree` representations, LINQ `Expression<Func<T>>` to SQL translation engines, and tree state machine memory layouts.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 83 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┼───────────────────────────────────────┐
         ▼                                       ▼                                       ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│     PART I: EXPRESSION TREES    │   │    PART II: FOREST DISCONNECTION│   │   PART III: TREE STATE MACHINE  │
│   Abstract Syntax Trees (ASTs)  │   │      Postorder Tree Pruning     │   │      Binary Tree Cameras        │
├─────────────────────────────────┤   ├─────────────────────────────────┤   ├─────────────────────────────────┤
│ • Postfix -> Binary AST Stack   │   │ • LC 1110: Del Nodes -> Forest  │   │ • LC 968: Min Cameras (Hard)    │
│ • Leaves = Operands             │   │ • Postorder Severing Invariant  │   │ • States: 0=Uncov, 1=Cam, 2=Cov │
│ • Internal Nodes = Operators    │   │ • Parent Nullification          │   │ • Greedy Bottom-Up Decisions    │
│ • Postorder Tree Evaluation     │   │ • Root Candidate Promotion      │   │ • Root Edge Case State 0 Check  │
│ • Roslyn / LINQ IQueryable AST  │   │ • HashSet O(1) Target Lookup    │   │ • Strict O(N) Time & O(H) Space │
└─────────────────────────────────┘   └─────────────────────────────────┘   └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:*
    - **Expression Tree (AST):** A binary tree representing an arithmetic or logical expression where leaf nodes are operands (numbers/variables) and internal nodes are operators (`+`, `-`, `*`, `/`).
    - **Tree Disconnection (Forest Collection):** Transforming a single connected tree into a set of disjoint trees (forest) by deleting specific target nodes and nullifying parent links.
    - **Tree Vertex Dominating Set (Binary Tree Cameras):** Placing the minimum number of monitors such that every node is covered (either having a camera or adjacent to a node with a camera).
  - *Core Invariants:*
    1. **AST Evaluation Invariant:** The numerical value of an operator node $u$ is strictly equal to $Evaluate(u.left) \odot Evaluate(u.right)$, where $\odot$ is the binary operator stored at $u$.
    2. **Postorder Severing Invariant:** A node $u$ determines if its children must be detached *after* visiting them. If $u$ is deleted, any non-null surviving child of $u$ becomes a new root in the forest.
    3. **Greedy Camera Invariant:** A leaf node should *never* have a camera placed on it; placing a camera on its parent covers the leaf, the parent, and potentially the grandparent, maximizing coverage leverage.
  - *Misconception Check:* In [LeetCode 968], candidates often try Dynamic Programming with 3 states per node ($dp[u][0], dp[u][1], dp[u][2]$). While correct ($O(N)$), greedy bottom-up postorder state assignment is significantly simpler, handles all edge cases, and uses strictly $O(H)$ recursion stack without multi-dimensional arrays.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* ASTs eliminate operator precedence ambiguity (parentheses are encoded implicitly by tree depth). Greedy tree state machines eliminate $NP$-hard vertex cover complexity by exploiting the acyclic property of trees.
  - *Complexity Advantage:* All three algorithms execute in optimal $\Theta(N)$ time and $O(H)$ auxiliary space.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose / Signal Words:* "Evaluate mathematical expression", "parse prefix/postfix", "delete nodes and return disjoint trees", "minimum cameras to monitor tree", "vertex cover on tree".
  - *When to Avoid / Failure Modes:* If the graph contains cycles, binary tree postorder state machines cannot be applied; cycle-breaking or general graph vertex cover approximations are required.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Expression trees in .NET are represented via `System.Linq.Expressions.Expression`. The Roslyn C# compiler converts source code text into an immutable `SyntaxTree` AST where every token is an immutable node on the managed heap.
  - *Production Systems:* SQL query parse trees in database query engines (PostgreSQL, SQLite), shader compilers in game engines (DirectX/Vulkan HLSL compilers), and LINQ-to-Entities translators converting C# expressions into SQL queries.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To solve Binary Tree Cameras in O(N) time, I use a postorder DFS state machine returning three states: 0 for uncovered, 1 for has camera, and 2 for covered without camera. By greedily leaving leaves uncovered, their parents are forced to take a camera, covering up to three tiers simultaneously. At each node, if either child is uncovered, the node must take a camera. If either child has a camera, the parent is covered. Otherwise, the parent is uncovered. Finally, if the root itself is uncovered, we place one final camera."
  - *Interviewer Evaluation Lens:* Checks understanding of postorder bottom-up decision propagation, recognition of greedy dominance over leaves, and handling of the final root uncovered edge case.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:* Time: $\Theta(N)$; Auxiliary Space: $O(H)$ recursion stack frames.
  - *State Transition Trace (LC 968):*
    `Leaf -> Returns 0 (Uncovered) -> Parent sees child=0 -> Parent takes Camera (State 1, CameraCount++) -> Grandparent sees child=1 -> Grandparent becomes Covered (State 2)`.

---

### 1.1 Physical Mental Model — Security Watchtowers & The Calculator Assembler

**Analogy 1 — Binary Tree Cameras (LC 968): Security Watchtowers in a Hilltop Village**

Imagine a mountain village structured like a binary tree. You need to install the minimum number of security cameras (watchtowers) such that every house (node) is monitored. A camera placed at house $u$ monitors:
- House $u$ itself
- House $u$'s parent
- Both of house $u$'s children

```
                [Grandparent] (Covered: State 2)
                     ▲
                     │ (Monitored by Camera below)
                [ Parent ]    (HAS CAMERA: State 1) 📷
                /        \
          [Child A]    [Child B]  (Uncovered leaves forced parent to buy camera)
```

**The Greedy Bottom-Up Strategy:**
- **Never place cameras at leaf nodes!** A camera on a leaf covers at most 2 nodes (itself + parent). A camera on a leaf's parent covers up to 4 nodes (parent, left child, right child, grandparent)!
- Therefore, leaves greedily report: *"I am uncovered (State 0)!"*
- The parent sees an uncovered child and is forced to install a camera: *"I must take a camera (State 1)!"*
- The grandparent sees a child with a camera: *"I am safely covered (State 2)!"*

```
State Machine Rules (Postorder DFS):
  State 0: UNCOVERED (Needs camera from parent)
  State 1: HAS_CAMERA (Monitors self, children, and parent)
  State 2: COVERED (Monitored by someone else, no camera here)
  Null Node: Returns State 2 (Empty slots do not need monitoring!)

Decision Tree at node u:
  If (left == 0 || right == 0)       --> Return State 1 (📷 Install camera, count++)
  Else if (left == 1 || right == 1)  --> Return State 2 (🛡️ Protected by child)
  Else                               --> Return State 0 (⚠️ Uncovered, ask parent)
```

---

**Analogy 2 — Expression Tree (AST): The Conveyor-Belt Calculator**

Imagine a factory conveyor belt. When numbers roll in, they sit on storage trays (stack). When an operator symbol (`+`, `*`) rolls in, a robotic arm pops the last two items off the tray, welds them as children beneath the operator, and puts the newly welded cluster back onto the tray.

```
Postfix Stream: [ 3, 4, +, 2, 7, -, * ]

Stack State Trace:
  Push 3:    [ (3) ]
  Push 4:    [ (3), (4) ]
  Op '+':    Pop 4 (right), Pop 3 (left) -> Weld [(3) + (4)] -> Push (+)
             Stack: [ (+) ]
  Push 2:    [ (+), (2) ]
  Push 7:    [ (+), (2), (7) ]
  Op '-':    Pop 7 (right), Pop 2 (left) -> Weld [(2) - (7)] -> Push (-)
             Stack: [ (+), (-) ]
  Op '*':    Pop (-) (right), Pop (+) (left) -> Weld [(+) * (-)] -> Push (*)
             Stack: [ (*) ]  <-- Final AST Root!
```

---

### 1.2 Expression Tree (AST) Internals: Postfix Construction & Evaluation

An **Expression Tree** represents the syntax of an algebraic formula:

```
Expression (Infix):   (3 + 4) * (2 - 7)
Postfix (RPN):        3 4 + 2 7 - *

                      [ * ]
                    /       \
                [ + ]       [ - ]
               /     \     /     \
             [ 3 ]  [ 4 ] [ 2 ]  [ 7 ]
```

#### The Postfix-to-AST Construction Algorithm:
1. Initialize an explicit `Stack<AstNode>`.
2. Scan tokens from left to right:
   - If token is an **operand** (number): Create a leaf node and push it onto the stack.
   - If token is an **operator** (`+`, `-`, `*`, `/`):
     - Pop `rightNode = stack.Pop()` (First popped is the right child!).
     - Pop `leftNode = stack.Pop()` (Second popped is the left child!).
     - Create an operator node with `left` and `right`.
     - Push the newly formed operator node back onto the stack.
3. When token stream terminates, `stack.Pop()` is the root of the complete Expression Tree!

---

### 1.2 Tree Disconnection & Forest Collection ([LeetCode 1110])

Given a binary tree and a list of node values to delete, delete all specified nodes and return the roots of the remaining trees (a forest):

```
Input Tree:
              [ 1 ]* (Delete 1)
             /     \
          [ 2 ]   [ 3 ]* (Delete 3)
         /     \       \
      [ 4 ]   [ 5 ]   [ 6 ]

Remaining Forest Roots:
Forest = { [ 2 ], [ 6 ] }

    [ 2 ]                 [ 6 ]
   /     \
[ 4 ]   [ 5 ]
```

#### The Postorder Pruning Invariant:
We must process nodes bottom-up (postorder):
1. Recurse on `node.left` and `node.right` first so child pointers are updated.
2. If `node` itself must be deleted:
   - If `node.left != null`, `node.left` is a new root in the forest.
   - If `node.right != null`, `node.right` is a new root in the forest.
   - Return `null` to the parent to sever the connection!
3. If `node` is not deleted:
   - Return `node` to preserve the connection.

---

### 1.3 The Postorder Greedy State Machine ([LeetCode 968])

Given a binary tree, we install cameras on nodes. Each camera monitors its node, its parent, and its immediate children. Return the **minimum number of cameras** needed to monitor all nodes.

#### The 3-State Protocol:
At each node $u$, postorder DFS returns an integer state representing the status of node $u$:
- **State 0 (Uncovered):** Node $u$ has no camera and is not monitored by any child. It demands that its parent place a camera!
- **State 1 (Has Camera):** Node $u$ has a camera installed. It monitors itself, its children, and its parent.
- **State 2 (Covered):** Node $u$ has no camera, but is safely monitored by at least one of its children. It does not need a camera, nor does it force its parent to place one.

```
                    [ ? ] (Parent Decision)
                   /     \
              [State L]  [State R]
```

#### Decision Rules:
1. **Base Case (`null` node):** A `null` node does not need a camera and must not force its parent to place one. Therefore, `null` returns **State 2 (Covered)**.
2. **Rule 1 (Child Demands Camera):** If either child is in **State 0 (Uncovered)**:
   - Node $u$ is forced to install a camera!
   - `cameraCount++`
   - Return **State 1 (Has Camera)**.
3. **Rule 2 (Parent is Monitored):** If either child is in **State 1 (Has Camera)**:
   - Node $u$ is already covered by its child's camera.
   - Return **State 2 (Covered)**.
4. **Rule 3 (Both Children are Covered):** If both children are in **State 2 (Covered)**:
   - Neither child has a camera, so node $u$ is currently **Uncovered**!
   - Node $u$ delays placing a camera, hoping its parent will cover it.
   - Return **State 0 (Uncovered)**.

### 1.4 ⚙️ Core Operations Deep-Dive: Greedy Postorder Camera State Machine & Forest Severing

#### Dimension 1: Operation Contract & Big-O Bounds
- **Operation Signature:** `int MinCameraCover(TreeNode root)` with internal helper `CameraState Dfs(TreeNode node, ref int cameraCount)`
  - State Enum: `Uncovered = 0`, `HasCamera = 1`, `Covered = 2`.
- **Preconditions:**
  - `root` represents an arbitrary binary tree of $N \ge 1$ nodes.
  - Tree structure is strictly acyclic.
- **Postconditions:**
  - Returns the exact minimum integer cardinality of vertices required to dominate all $N$ nodes.
  - Leaves the original tree topology unmodified (read-only traversal).
- **Complexity Bounds:**
  - **Time Complexity:**
    - *Best Case:* $\Omega(N)$ — every node must be visited at least once to verify coverage.
    - *Average Case:* $\Theta(N)$ — single bottom-up postorder pass.
    - *Worst Case:* $O(N)$ — linear traversal over degenerate skew chains.
  - **Auxiliary Space Complexity:**
    - *Best Case:* $O(\log N)$ stack frames for balanced binary trees.
    - *Worst Case:* $O(N)$ stack frames for degenerate linear tree topologies.

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree
1. **Null Node Sentinel Return:**
   - If `node == null`, return `State.Covered` (2). A null child cannot be monitored and requires no monitor.
2. **Postorder Subtree Traversal:**
   - Traverse left subtree: `leftState = Dfs(node.left, ref cameraCount)`.
   - Traverse right subtree: `rightState = Dfs(node.right, ref cameraCount)`.
3. **Branch Decision Tree:**
   - *Condition 1 (Defensive Coverage Requirement):*
     - If `leftState == State.Uncovered || rightState == State.Uncovered`:
       - One or both children have no coverage. Current node $u$ must host a camera.
       - Increment `cameraCount++`.
       - Return `State.HasCamera` (1).
   - *Condition 2 (Satisfied by Child Camera):*
     - If `leftState == State.HasCamera || rightState == State.HasCamera`:
       - At least one child has a camera shining onto current node $u$.
       - Node $u$ is now safely monitored.
       - Return `State.Covered` (2).
   - *Condition 3 (Both Children Satisfied without Camera):*
     - Both children are in `State.Covered` (e.g. leaves returning to null children, or parents of camera nodes).
     - Node $u$ is currently unmonitored. By greedy dominance, defer placing a camera to $u$'s parent.
     - Return `State.Uncovered` (0).
4. **Root Edge Correction:**
   - After DFS completion, if `rootState == State.Uncovered`:
     - Root has no parent to place a camera for it!
     - Increment `cameraCount++`.
5. **Return:** Return final `cameraCount`.

```
                        [Visit Node u]
                               │
                        Is u == null?
                       /             \
                 (Yes)/               \(No)
                     ▼                 ▼
              Return Covered (2)  leftState  = DFS(u.left)
                                  rightState = DFS(u.right)
                                       │
                leftState == 0 || rightState == 0?
               /                                  \
         (Yes)/                                    \(No)
             ▼                                      ▼
      cameraCount++                 leftState == 1 || rightState == 1?
   Return HasCamera (1)            /                                  \
                             (Yes)/                                    \(No)
                                 ▼                                      ▼
                         Return Covered (2)                     Return Uncovered (0)
```

#### Dimension 3: Visual ASCII State Transitions
```
EXAMPLE TREE EXECUTION TRACE:
              [ 1 ]
             /     \
          [ 2 ]   [ 3 ]
         /
       [ 4 ]

STEP-BY-STEP RECURSIVE SYNTHESIS:
1. Leaf [4]:
   - left = null (2), right = null (2)
   - Both children Covered (2) => Leaf returns Uncovered (0).
   - cameraCount = 0.

2. Node [2]:
   - left = [4] (0), right = null (2)
   - Left child is Uncovered (0)! Node [2] forced to take Camera.
   - cameraCount++ => 1.
   - Returns HasCamera (1).

3. Leaf [3]:
   - left = null (2), right = null (2)
   - Returns Uncovered (0).
   - cameraCount = 1.

4. Root [1]:
   - left = [2] (1), right = [3] (0)
   - Right child [3] is Uncovered (0)! Root [1] forced to take Camera.
   - cameraCount++ => 2.
   - Returns HasCamera (1).

RESULT: Exactly 2 cameras needed (placed at Node [2] and Node [1]).
All 4 nodes covered.
```

#### Dimension 4: Invariant Preservation Proof
- **Theorem (Greedy Minimality and Full Tree Domination):**
  *The bottom-up 3-state algorithm produces a dominating set of minimum possible cardinality.*
- **Proof:**
  1. *Complete Coverage Invariant:*
     - A leaf node returns 0. Its parent is compelled by Condition 1 to install a camera, ensuring all leaves are covered.
     - Any node whose child has a camera returns 2, correctly reflecting its covered status.
     - Any internal node returning 0 is handled either by its parent installing a camera (Condition 1) or, if it is the root, by the post-DFS root check.
     - Therefore, after the algorithm terminates, every node in the tree is dominated.
  2. *Minimality Invariant (Greedy Exchange Argument):*
     - Suppose an optimal solution $OPT$ places a camera on leaf $v$. Let $p$ be $v$'s parent.
     - Replacing $v$'s camera with a camera on $p$ maintains coverage for $v$ while strictly expanding or preserving coverage for $p$'s other child and $p$'s parent.
     - Thus, $|\text{Greedy}| \le |OPT|$. Since $OPT$ is optimal, $|\text{Greedy}| = |OPT|$.
  3. *Conclusion:* The algorithm guarantees full coverage with minimal cameras. $\blacksquare$

#### Dimension 5: Edge Case Matrix
| Edge Scenario | Trigger Condition | Algorithmic Guard / Resolution | Verification Invariant |
| :--- | :--- | :--- | :--- |
| **Single-Node Tree** | $N = 1$ (`root.left == null && root.right == null`) | DFS returns `State.Uncovered` (0); post-traversal check increments count to 1 | Root cannot defer to parent; camera placed on root |
| **Two-Node Tree** | $N = 2$ (`root` with single leaf child) | Child returns 0; root sees uncovered child, places camera on root (count = 1) | Single camera covers both root and child |
| **Three-Node Balanced V-Shape** | Root with two leaf children | Both leaves return 0; root places 1 camera covering all 3 nodes | Exactly 1 camera placed at apex |
| **Skewed Linear Chain** | $1 \to 2 \to 3 \dots \to N$ | Cameras placed at alternating positions: $N-1, N-4, \dots$ | Matches $\lceil N/3 \rceil$ optimal vertex dominating set bound |
| **Disconnected Forest Output (LC 1110)** | Deleting root node | If root is deleted, its non-null children are promoted to roots; return forest list | Forest roots collection preserved; parent link nullified |

---

---

### 🎤 Multi-Topic Spoken Synthesis Drill (≤ 60 Seconds)

#### Synthesis Drill: Tree Serialization Protocols
- **Preorder DFS:** `val,left,right` with `#` sentinels for nulls. Reconstructs in $O(N)$ with a single queue of tokens without needing indices.
- **BFS Level-Order:** Comma-separated array representation matching LeetCode visualizer. Requires a queue during deserialization to wire children to parents.


## 2. 🔬 Theoretical Foundations & Algorithmic Mechanics

### 2.1 Postfix Expression to Binary AST Construction Proof

> **Theorem (AST Structural Preservation):** A valid postfix (Reverse Polish Notation) expression containing binary operators uniquely and unambiguously determines a binary expression tree without parentheses.
>
> **Proof by Stack Invariant:**
> 1. In any valid postfix expression of length $L$ with $k$ binary operators, there are exactly $k + 1$ operands.
> 2. Each binary operator reduces the net stack size by 1 (pops 2 operands, pushes 1 subtree).
> 3. After processing all $L$ tokens, the stack contains exactly $(k + 1) - k = 1$ element: the root of the expression tree.
> 4. Since operands are pushed in arrival order and operators pop the most recent operands, the left-to-right evaluation order and operator hierarchy are preserved identically. $\blacksquare$

---

### 2.2 Proof of Greedy Dominance in Tree Camera Placement

> **Lemma (Greedy Placement on Parents Beats Leaves):**
> For any leaf node $v$ with parent $p$, placing a camera at parent $p$ is always strictly superior or equal to placing a camera at leaf $v$.
>
> **Proof:**
> - A camera placed at leaf $v$ covers at most 2 nodes: $v$ and its parent $p$.
> - A camera placed at parent $p$ covers:
>   1. Leaf $v$.
>   2. Any sibling leaves of $v$ (e.g. $p.right$).
>   3. Parent $p$ itself.
>   4. Grandparent of $v$ ($p.parent$).
> - Thus, the set of nodes covered by placing a camera at $p$ is a superset of the nodes covered by placing a camera at $v$:
>   $$\text{Coverage}(p) \supseteq \text{Coverage}(v)$$
> - By mathematical induction from the bottom of the tree upwards, greedily placing cameras at parents of uncovered nodes achieves the optimal minimum vertex cover. $\blacksquare$

---

### 2.3 ASCII Structural Diagrams: State Transitions in [LeetCode 968]

```
Scenario A: Leaf Node Evaluation
        [ P ]                 [ P ] ◄── Child is 0 -> P takes Camera! (State 1)
       /                     /
    [ L ]                 [ L ]   ◄── State 0 (Uncovered)
   /     \
 null   null
(State 2) (State 2)

Scenario B: Grandparent Evaluation
        [ GP ] ◄── Child P has camera (State 1) -> GP is Covered! (State 2)
       /
    [ P ]      ◄── Has Camera (State 1)
   /
[ L ]          ◄── Monitored by P (State 2)
```

---

## 3. 💻 Production C# Implementations

### 3.1 Expression Tree (AST): From-Scratch Postfix Parser & Recursive Evaluator

```csharp
using System;
using System.Collections.Generic;

namespace TreeIntegrationAndAst
{
    public class AstNode
    {
        public string Token { get; set; }
        public AstNode? Left { get; set; }
        public AstNode? Right { get; set; }

        public bool IsLeaf => Left == null && Right == null;

        public AstNode(string token, AstNode? left = null, AstNode? right = null)
        {
            Token = token;
            Left = left;
            Right = right;
        }
    }

    public static class ExpressionTreeEngine
    {
        private static readonly HashSet<string> Operators = new HashSet<string> { "+", "-", "*", "/" };

        /// <summary>
        /// Constructs a Binary Expression Tree from space-delimited Postfix tokens.
        /// Time Complexity: O(N) where N is token count.
        /// Auxiliary Space: O(N) for stack and AST nodes.
        /// </summary>
        public static AstNode BuildFromPostfix(string postfix)
        {
            if (string.IsNullOrWhiteSpace(postfix))
                throw new ArgumentException("Expression cannot be empty.");

            string[] tokens = postfix.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            Stack<AstNode> stack = new Stack<AstNode>();

            foreach (string token in tokens)
            {
                if (Operators.Contains(token))
                {
                    if (stack.Count < 2)
                        throw new InvalidOperationException($"Malformed postfix syntax at token: {token}");

                    // Crucial: First popped is the RIGHT operand!
                    AstNode right = stack.Pop();
                    AstNode left = stack.Pop();

                    AstNode opNode = new AstNode(token, left, right);
                    stack.Push(opNode);
                }
                else
                {
                    // Operand leaf node
                    stack.Push(new AstNode(token));
                }
            }

            if (stack.Count != 1)
                throw new InvalidOperationException("Malformed expression: leftover operands on stack.");

            return stack.Pop();
        }

        /// <summary>
        /// Evaluates an AST recursively using Postorder Bottom-Up traversal.
        /// Time Complexity: O(N) visiting every AST node once.
        /// Auxiliary Space: O(H) call stack frames where H is tree height.
        /// </summary>
        public static double Evaluate(AstNode? root)
        {
            if (root == null)
                throw new ArgumentNullException(nameof(root));

            // Base Case: Leaf operand
            if (root.IsLeaf)
            {
                if (double.TryParse(root.Token, out double val))
                    return val;
                throw new FormatException($"Invalid numeric literal: {root.Token}");
            }

            // Postorder: Evaluate children first
            double leftVal = Evaluate(root.Left);
            double rightVal = Evaluate(root.Right);

            // Apply parent operator
            return root.Token switch
            {
                "+" => leftVal + rightVal,
                "-" => leftVal - rightVal,
                "*" => leftVal * rightVal,
                "/" => Math.Abs(rightVal) < 1e-12 
                    ? throw new DivideByZeroException("Attempted division by zero in AST evaluation.")
                    : leftVal / rightVal,
                _ => throw new InvalidOperationException($"Unsupported operator: {root.Token}")
            };
        }
    }
}
```

---

### 3.2 [LeetCode 1110] Delete Nodes And Return Forest

```csharp
using System.Collections.Generic;

namespace TreeIntegrationAndAst
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

    public static class ForestCollector
    {
        /// <summary>
        /// Deletes specified nodes from a binary tree and returns roots of remaining forest.
        /// Time Complexity: Strictly O(N) visiting each node once.
        /// Auxiliary Space: O(H + D) where H is tree height and D is size of to_delete set.
        /// </summary>
        public static IList<TreeNode> DelNodes(TreeNode? root, int[] to_delete)
        {
            List<TreeNode> forest = new List<TreeNode>();
            HashSet<int> toDeleteSet = new HashSet<int>(to_delete);

            // Postorder bottom-up pruning
            TreeNode? survivingRoot = PostorderPrune(root, toDeleteSet, forest);

            // If the original root itself was not deleted, it is part of the forest
            if (survivingRoot != null)
            {
                forest.Add(survivingRoot);
            }

            return forest;
        }

        private static TreeNode? PostorderPrune(
            TreeNode? node, 
            HashSet<int> toDeleteSet, 
            List<TreeNode> forest)
        {
            if (node == null) return null;

            // Recurse bottom-up
            node.left = PostorderPrune(node.left, toDeleteSet, forest);
            node.right = PostorderPrune(node.right, toDeleteSet, forest);

            // Check if current node must be deleted
            if (toDeleteSet.Contains(node.val))
            {
                // Any non-null children now become independent roots in the forest!
                if (node.left != null) forest.Add(node.left);
                if (node.right != null) forest.Add(node.right);

                // Return null to sever parent's pointer to this node
                return null;
            }

            // Node survives; return to parent
            return node;
        }
    }
}
```

---

### 3.3 [LeetCode 968] Binary Tree Cameras: Greedy Postorder State Machine

```csharp
namespace TreeIntegrationAndAst
{
    public static class BinaryTreeCameras
    {
        // State Constants
        private const int STATE_UNCOVERED = 0;  // Node needs camera from parent
        private const int STATE_HAS_CAMERA = 1; // Node has camera installed
        private const int STATE_COVERED = 2;    // Node covered without camera

        /// <summary>
        /// Solves minimum camera placement in O(N) time and O(H) auxiliary space.
        /// Employs greedy bottom-up state machine.
        /// </summary>
        public static int MinCameraCover(TreeNode? root)
        {
            int cameraCount = 0;

            int PostorderDfs(TreeNode? node)
            {
                // Base Case: Null node is safely covered and demands nothing
                if (node == null) return STATE_COVERED;

                int leftState = PostorderDfs(node.left);
                int rightState = PostorderDfs(node.right);

                // Rule 1: If either child is UNCOVERED, current node MUST place a camera
                if (leftState == STATE_UNCOVERED || rightState == STATE_UNCOVERED)
                {
                    cameraCount++;
                    return STATE_HAS_CAMERA;
                }

                // Rule 2: If either child HAS CAMERA, current node is safely COVERED
                if (leftState == STATE_HAS_CAMERA || rightState == STATE_HAS_CAMERA)
                {
                    return STATE_COVERED;
                }

                // Rule 3: Both children are COVERED (no cameras), current node is UNCOVERED
                return STATE_UNCOVERED;
            }

            // Evaluate root
            int rootState = PostorderDfs(root);

            // Critical Gotcha: If root remains UNCOVERED, we must install one final camera!
            if (rootState == STATE_UNCOVERED)
            {
                cameraCount++;
            }

            return cameraCount;
        }
    }
}
```

---

## 4. ⚙️ Systems-Level Mechanics & Hardware Interactions

### 4.1 C# Roslyn Compiler ASTs & LINQ `Expression<Func<T>>` Translation

In .NET, **Expression Trees** are not theoretical homework exercises; they power core framework features:

```csharp
// 1. Compiled Delegate (Black Box Bytecode)
Func<Customer, bool> predicate1 = c => c.Age > 21;

// 2. Expression Tree AST (Inspectable Data Structure)
Expression<Func<Customer, bool>> predicate2 = c => c.Age > 21;
```

```
           BinaryExpression (GreaterThan)
                   /             \
MemberExpression (c.Age)    ConstantExpression (21)
```

- When passed to `IQueryable<T>` (Entity Framework Core), EF Core does **not** execute the C# code.
- Instead, EF Core traverses the `Expression` AST using a visitor pattern (`ExpressionVisitor`), translating:
  - `GreaterThan` $\implies$ SQL `>`
  - `MemberExpression (c.Age)` $\implies$ SQL Column `[Age]`
  - `ConstantExpression (21)` $\implies$ SQL Parameter `@p0 = 21`
- Generated Query: `SELECT * FROM Customers WHERE [Age] > @p0;`

---

### 4.2 Stack Depth vs. Instruction Pointers in Tree Interpreters

In tree-walking interpreters (such as early Ruby, Python AST executors, and calculator engines), traversing an Expression Tree invokes native machine call stacks:

```
Machine Call Stack:
[ Evaluate(op: '+') ] -> calls Evaluate(op: '*') -> calls Evaluate(leaf: 3)
```

1. **Stack Overflow Vulnerability:** A deeply nested expression like `1 + (1 + (1 + ... 50,000 times))` causes a 50,000-frame call stack, crashing with `StackOverflowException`.
2. **Bytecode Compilation Remedy:** Production runtimes compile ASTs into linear **Bytecode Instructions** executed on a virtual evaluation stack (e.g. .NET CIL / Java Bytecode), replacing recursion with an iterative instruction pointer loop.

---

### 4.3 Dangling Pointer Hazards in Non-GC Systems (C++ / Rust vs. C#)

In [LeetCode 1110], when a node is deleted:
- In **C# (.NET Managed CLR)**: Setting `node.left = null; node.right = null;` or returning `null` leaves unreferenced nodes to be swept by Gen 0 Garbage Collection. Surviving children placed in `forest` maintain strong references and stay alive.
- In **C++ (Manual Memory Management)**: Deleting a node requires calling `delete node;`. If you delete `node` *before* adding its children to the forest, reading `node->left` invokes **Undefined Behavior (Use-After-Free)**!
- In **Rust**: Ownership prevents dangling pointers; the node must be moved out via `Option::take()`.

---

## 5. 🧩 Canonical LeetCode Pattern Walkthroughs & Deep Dives

### 5.1 [LeetCode 1110] Delete Nodes And Return Forest: Step-by-Step Trace

#### Input:
`root = [1, 2, 3, 4, 5, 6, 7]`, `to_delete = [3, 5]`

```
              [ 1 ]
             /     \
          [ 2 ]   [ 3 ]*
         /     \  /     \
      [ 4 ]  [ 5 ]*[ 6 ] [ 7 ]
```

#### Bottom-Up Postorder Trace:
1. `Node 4`: Not deleted $\implies$ returns `Node 4` to parent `2`.
2. `Node 5`: In `to_delete`! Children are null. Returns `null` to parent `2`.
3. `Node 2`: Not deleted. Left is `4`, Right is `null`. Returns `Node 2` to parent `1`.
4. `Node 6`: Not deleted $\implies$ returns `Node 6` to parent `3`.
5. `Node 7`: Not deleted $\implies$ returns `Node 7` to parent `3`.
6. `Node 3`: In `to_delete`!
   - Non-null children: `Node 6` and `Node 7`.
   - Add `Node 6` and `Node 7` to `forest`.
   - Returns `null` to parent `1`.
7. `Node 1`: Not deleted. Left is `2`, Right is `null`.
8. Root check: `Node 1` is not deleted $\implies$ add `Node 1` to `forest`.

**Final Forest Output:** `{[ 6 ], [ 7 ], [ 1 ]}` (where `1.left = 2`, `2.left = 4`).

---

### 5.2 [LeetCode 968] Binary Tree Cameras: State Machine Trace

#### Tree Structure:
```
           [ 1 ]
          /
       [ 2 ]
      /
   [ 3 ]
  /
[ 4 ]
```

#### Trace:
1. **Node 4 (Leaf):**
   - Left is null (Covered / 2), Right is null (Covered / 2).
   - Rule 3: Both children covered $\implies$ Node 4 returns **State 0 (Uncovered)**.
2. **Node 3:**
   - Left child Node 4 is **State 0 (Uncovered)**!
   - Rule 1: Node 3 MUST install camera!
   - `cameraCount = 1`. Returns **State 1 (Has Camera)**.
3. **Node 2:**
   - Left child Node 3 is **State 1 (Has Camera)**, Right child is null (State 2).
   - Rule 2: Covered by child! Returns **State 2 (Covered)**.
4. **Node 1 (Root):**
   - Left child Node 2 is **State 2 (Covered)**, Right child is null (State 2).
   - Rule 3: Both children covered $\implies$ Node 1 returns **State 0 (Uncovered)**.
5. **Root Post-Check:**
   - `rootState == STATE_UNCOVERED (0)`.
   - Install camera at Root! `cameraCount = 2`.

**Total Cameras Required:** `2` (Placed at Node 3 and Node 1).

---

## 6. ⚠️ Real-World Engineering Failure Modes & Post-Mortems

### Failure Mode 1: Parent Reference Severing Omission
- **Production Incident:** A data pipeline pruned inactive customer accounts from an account hierarchy tree using [LeetCode 1110] logic. The developer added children of deleted nodes to the forest, but failed to return `null` to the parent node.
- **Consequence:** The parent maintained a reference to the deleted node. Traversal pipelines encountered deleted accounts, resulting in duplicate billing invoices.
- **Remedy:** Ensure the recursive return value explicitly replaces the parent's child reference: `node.left = Prune(node.left);`.

---

### Failure Mode 2: Uncovered Root Gotcha in Binary Tree Cameras
- **Production Incident:** In an interview simulation for [LeetCode 968], a candidate implemented the postorder DFS correctly, but omitted the root post-check:
  ```csharp
  if (PostorderDfs(root) == STATE_UNCOVERED) cameraCount++;
  ```
- **Consequence:** On trees where the root has covered children (e.g. a single-node tree `[0]` or a 4-node chain), the root remained in State 0 (Uncovered). The function reported 0 cameras instead of 1, failing edge tests.

---

### Failure Mode 3: Divide-by-Zero in AST Evaluation Engines
- **Production Incident:** A spreadsheet formula engine evaluated user formulas via AST postorder traversal. A formula with `= A1 / (B1 - B1)` triggered an unhandled floating-point division by zero, yielding `double.PositiveInfinity` and corrupting downstream financial models.
- **Remedy:** Guard operator evaluation with explicit zero-epsilon checks (`Math.Abs(divisor) < 1e-12`), throwing domain-specific evaluation exceptions before IEEE-754 infinity propagates.

---

### Failure Mode 4: Operand Pop Order Reversal in Postfix Parsers
- **Bug Pattern:**
  ```csharp
  AstNode left = stack.Pop();
  AstNode right = stack.Pop();
  ```
- **Consequence:** In non-commutative operations (`-` and `/`), popping `left` first inverts the operands! Expression `7 - 2` becomes `2 - 7 = -5`.
- **Invariant:** In postfix notation, the operand immediately preceding the operator is the **Right child**:
  ```csharp
  AstNode right = stack.Pop();
  AstNode left = stack.Pop();
  ```

---

## 7. 🧪 Verification, Diagnostic Drills & Conceptual Checkpoints

### Edge Cases Test Suite

| Test Case ID | Problem | Input | Expected Output | Critical Architecture Invariant |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | LC 968 | Single node `[0]` | `1` | Root uncovered edge case requires camera at root. |
| **TC-02** | LC 968 | Two nodes `[0, 0]` | `1` | Parent takes camera, covering leaf and itself. |
| **TC-03** | LC 1110 | All nodes deleted | `[]` (Empty forest) | All roots pruned away. |
| **TC-04** | LC 1110 | No nodes deleted | `[ originalRoot ]` | Single tree preserved intact. |
| **TC-05** | AST Parser | Single operand `"42"` | Returns `42` | Leaf-only expression tree. |

---

### Diagnostic Checkpoint Questions

#### Checkpoint 1: The Null Node State in Tree Cameras
**Question:** In [LeetCode 968], why does a `null` node return **State 2 (Covered)** rather than State 0 (Uncovered) or State 1 (Has Camera)?
<details>
<summary><b>View Architectural Answer</b></summary>

If a `null` node returned **State 0 (Uncovered)**, it would force every leaf node in the tree to install a camera (Rule 1: If child is uncovered, parent must take camera). This violates our fundamental greedy lemma that leaf nodes should never take cameras.

If a `null` node returned **State 1 (Has Camera)**, every leaf node would falsely believe it is already covered by its nonexistent children, preventing its parent from placing a camera.

Returning **State 2 (Covered)** signals that the `null` node is satisfied and places zero demands on its parent, allowing the leaf to correctly return State 0.
</details>

---

#### Checkpoint 2: Right-Before-Left Stack Popping Order
**Question:** When parsing a postfix expression using an operand stack, why must the first popped element be assigned to the `Right` child and the second to the `Left` child?
<details>
<summary><b>View Architectural Answer</b></summary>

In postfix notation (Reverse Polish Notation), expressions are written in the order: `Operand1 Operand2 Operator`.
As tokens are pushed onto a LIFO (Last-In, First-Out) stack:
1. `Operand1` is pushed first.
2. `Operand2` is pushed second (top of stack).
When the operator is encountered, `stack.Pop()` retrieves the most recently pushed element, which is `Operand2` (the right operand). The subsequent `stack.Pop()` retrieves `Operand1` (the left operand). Reversing this corrupts non-commutative operators like subtraction (`-`) and division (`/`).
</details>

---

#### Checkpoint 3: Postorder vs. Preorder Pruning in Forest Collection
**Question:** In [LeetCode 1110], why is postorder bottom-up traversal mandatory? What happens if you try to prune preorder top-down?
<details>
<summary><b>View Architectural Answer</b></summary>

In preorder traversal, if you delete parent node $u$ first, you must immediately decide how to connect $u$'s parent to $u$'s children before knowing if $u$'s children themselves will be deleted.

In postorder traversal, child subtrees are completely processed and pruned *before* the parent evaluates itself. When node $u$ evaluates whether it is deleted, `node.left` and `node.right` are already guaranteed to be either valid surviving subtree roots or `null`. This decouples child pruning from parent severing.
</details>

---

#### Checkpoint 4: Expression Trees vs. String Parsing in Compilers
**Question:** Why do production compilers like Roslyn parse source text into an Expression Tree (AST) rather than evaluating code directly from token strings?
<details>
<summary><b>View Architectural Answer</b></summary>

1. **Precedence and Associativity:** An AST encodes operator precedence and associativity structurally in tree depth, eliminating parentheses handling in downstream compiler phases.
2. **Multiple Optimization Passes:** Compilers perform Constant Folding, Common Subexpression Elimination (CSE), and Dead Code Elimination as tree-to-tree transformations on the AST.
3. **Target Independence:** The AST can be translated into multiple backends (e.g. CIL bytecode, LLVM IR, x86-64 machine code, or SQL queries in LINQ) without reparsing source text.
</details>

---

### Daily Mastery Checklist
- [x] Implemented from-scratch `ExpressionTree` with postfix stack parser and recursive postorder evaluator.
- [x] Solved [LeetCode 1110] (Delete Nodes And Return Forest) using postorder bottom-up disconnection.
- [x] Mastered [LeetCode 968] (Binary Tree Cameras) via greedy 3-state postorder state machine in $O(N)$ time.
- [x] Handled the critical root uncovered edge case in tree camera placement.
- [x] Explored real-world AST applications in the C# Roslyn compiler and LINQ `Expression<Func<T>>` SQL translators.
