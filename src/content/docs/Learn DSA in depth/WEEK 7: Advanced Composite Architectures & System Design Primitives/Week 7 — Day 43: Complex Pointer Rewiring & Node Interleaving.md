---
title: "Week 7 — Day 43: Complex Pointer Rewiring & Node Interleaving"
---

Welcome to **Week 7: Advanced Composite Architectures & System Design Primitives**!

In **Week 6 (Days 36–42)**, you conquered singly linked list fundamentals: pointer chasing, fast & slow pointers, in-place reversals, $K$-group chunking, multi-chain partitioning, and list merge sort.

This week, we ascend into **elite pointer engineering and composite data structures**:
1. **Arbitrary Pointer Graphs & Deep Copying ([LeetCode 138]):** The trade-off between the $O(N)$ auxiliary hash table and the **3-Pass Node Interleaving Technique ($O(1)$ auxiliary space)**.
2. **The Interleaving Invariant:** Weaving cloned nodes directly alongside originals to encode the mapping within the physical heap topology itself.
3. **Multilevel Doubly Linked List Flattening ([LeetCode 430]):** Handling tree-like child branches with bidirectional splice invariants.
4. **Graph Cloning Contrast ([LeetCode 133]):** Why general graphs cannot use node interleaving and must rely on memoized graph traversals.

---

## 1. 🧠 TEACH: Arbitrary Pointer Topologies & Node Interleaving

### 1.1 The Challenge of Deep Copying Lists with Random Pointers

A standard singly linked list can be deep copied in a single forward pass: create a new node, point `prev.next` to it, and continue.

However, consider a node with a secondary arbitrary pointer:
```csharp
public class Node {
    public int val;
    public Node next;
    public Node random; // Can point to ANY node in the list or null!
}
```

```
     ┌────────────────────────┐
     │                        ▼
    (1) ──► (2) ──► (3) ──► (4) ──► null
     ▲               │
     └───────────────┘
   Node 1 random -> Node 4
   Node 3 random -> Node 1
```

If we try to clone this in a single forward pass:
- When cloning Node 1, its `random` pointer points to Node 4, which **has not been created yet**!
- If a random pointer points backward (Node 3 pointing to Node 1), we need an instantaneous way to look up the newly created clone of Node 1.

---

### 1.2 The Two Paradigms: Hash Map vs. Physical Interleaving

#### Approach 1: The Hash Table Mapping ($O(N)$ Space)
Maintain a dictionary mapping each original node to its newly created clone:
$$\text{map}[\text{originalNode}] = \text{clonedNode}$$

- **Pass 1:** Traverse the list. For every original node `curr`, create a shallow copy `new Node(curr.val)` and register `map[curr] = clone`.
- **Pass 2:** Traverse again. Connect the pointers of each clone:
  ```csharp
  map[curr].next   = (curr.next != null)   ? map[curr.next]   : null;
  map[curr].random = (curr.random != null) ? map[curr.random] : null;
  ```
- *Evaluation:* Very clean ($O(N)$ time), but requires allocating an auxiliary dictionary of size $O(N)$. Top-tier interviewers will immediately follow up:
  > *"Can you deep-copy this list in $O(1)$ auxiliary memory without using a hash table?"*

---

#### Approach 2: The 3-Pass Node Interleaving Technique ($O(1)$ Auxiliary Space)

How can we look up the clone of an arbitrary node without a dictionary?  
**By placing the clone immediately adjacent to the original in the linked list itself!**

Every original node `X` will point to its own clone `X'`:
$$\mathbf{\text{X.next} = \text{X'}}$$
$$\mathbf{\text{X'.next} = \text{original X.next}}$$

```
Original:
[A] ──────────────► [B] ──────────────► [C] ──► null

Pass 1 (Weave / Interleave Clones):
[A] ──► [A'] ─────► [B] ──► [B'] ─────► [C] ──► [C'] ──► null
```

#### The Random Pointer Invariant (Pass 2):
If original node `curr` has a random pointer pointing to `curr.random`:
Where is the clone of `curr.random`?
Because every node's clone is its immediate `.next` node:
$$\mathbf{\text{Clone of curr.random}} = \mathbf{\text{curr.random.next}}$$

Therefore, we can wire the clone's random pointer with a single direct dereference:
$$\mathbf{\text{curr.next.random} = \text{curr.random.next}}$$

```
Original link: A.random = C
In the interleaved list:
A.next is A'
A.random is C
C.next is C' (the clone of C!)

Therefore:
A'.random = C'  <===>  curr.next.random = curr.random.next
```

#### Pass 3 (Unweave / Separate):
Restore the original list to its untouched state while decoupling the cloned chain into an independent list:
```csharp
curr.next = clone.next;
clone.next = (clone.next != null) ? clone.next.next : null;
```

---

### 1.3 Multilevel Doubly Linked List Flattening

In **LeetCode 430**, each node has `prev`, `next`, and a possible `child` pointer to another bidirectional linked list:

```
 1 ── 2 ── 3 ── 4 ── 5 ── 6 ── null
           │
           7 ── 8 ── 9 ── 10 ── null
                │
                11 ── 12 ── null
```

#### The Splicing Invariant:
Whenever `curr.child != null`:
1. Find the tail of the child branch (`childTail`).
2. Splice the child chain between `curr` and `curr.next`:
   - `childTail.next = curr.next`
   - If `curr.next != null`, `curr.next.prev = childTail`
   - `curr.next = curr.child`
   - `curr.child.prev = curr`
3. Clear `curr.child = null`.
4. Continue moving forward with `curr = curr.next`. If the child branch contained nested children, our forward traversal will naturally encounter and splice them in correct depth-first order!

---

### 1.4 Interview Spoken Drill (20–30 Seconds)

> *"To clone a linked list with random pointers in $O(1)$ auxiliary space, I use the 3-pass node interleaving technique. In Pass 1, I create a clone for each node and weave it directly after the original. In Pass 2, I assign each clone's random pointer using the invariant `curr.next.random = curr.random.next`, since the clone of any node is physically located at its `.next`. In Pass 3, I unweave the interleaved lists to restore the original structure while extracting the clone. This eliminates the $O(N)$ hash table overhead entirely."*

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

### 2.1 [LeetCode 138] Copy List with Random Pointer

Given a linked list of length $N$ where each node contains an additional `random` pointer, construct a **deep copy** of the list.

#### Approach A: Hash Table ($O(N)$ Auxiliary Space)

```csharp
/*
// Definition for a Node.
public class Node {
    public int val;
    public Node next;
    public Node random;
    
    public Node(int _val) {
        val = _val;
        next = null;
        random = null;
    }
}
*/

public class SolutionCopyListHashMap {
    /// <summary>
    /// Deep copies a list with random pointers using an auxiliary Dictionary.
    /// Time Complexity: O(N)
    /// Space Complexity: O(N) auxiliary space
    /// </summary>
    public Node CopyRandomList(Node head) {
        if (head == null) return null;

        var map = new Dictionary<Node, Node>();

        // Pass 1: Clone all nodes without pointers
        Node curr = head;
        while (curr != null) {
            map[curr] = new Node(curr.val);
            curr = curr.next;
        }

        // Pass 2: Connect next and random pointers for each clone
        curr = head;
        while (curr != null) {
            map[curr].next = (curr.next != null) ? map[curr.next] : null;
            map[curr].random = (curr.random != null) ? map[curr.random] : null;
            curr = curr.next;
        }

        return map[head];
    }
}
```

---

#### Approach B: 3-Pass Node Interleaving (Optimal $O(1)$ Auxiliary Space)

```csharp
public class SolutionCopyListOptimal {
    /// <summary>
    /// Deep copies a list with random pointers in O(N) time and O(1) auxiliary space
    /// by interleaving cloned nodes with original nodes.
    /// </summary>
    public Node CopyRandomList(Node head) {
        if (head == null) return null;

        // -------------------------------------------------------------
        // Pass 1: Weave cloned nodes directly after original nodes
        // Original: A -> B -> C
        // Interleaved: A -> A' -> B -> B' -> C -> C'
        // -------------------------------------------------------------
        Node curr = head;
        while (curr != null) {
            Node clone = new Node(curr.val);
            clone.next = curr.next;
            curr.next = clone;
            curr = clone.next;
        }

        // -------------------------------------------------------------
        // Pass 2: Assign random pointers for cloned nodes
        // Cloned node of curr is curr.next.
        // Cloned node of curr.random is curr.random.next.
        // -------------------------------------------------------------
        curr = head;
        while (curr != null) {
            if (curr.random != null) {
                curr.next.random = curr.random.next;
            }
            curr = curr.next.next; // Advance to next original node
        }

        // -------------------------------------------------------------
        // Pass 3: Unweave the lists (Restore original and extract clone)
        // -------------------------------------------------------------
        curr = head;
        Node cloneHead = head.next;
        Node cloneCurr = cloneHead;

        while (curr != null) {
            curr.next = curr.next.next;
            cloneCurr.next = (cloneCurr.next != null) ? cloneCurr.next.next : null;

            curr = curr.next;
            cloneCurr = cloneCurr.next;
        }

        return cloneHead;
    }
}
```

#### Visual Execution Trace on `[A, B]` where `A.random = B, B.random = A`:

```
1. Pass 1 (Weave):
   A ──► A' ──► B ──► B' ──► null

2. Pass 2 (Rewire Random):
   curr = A:
     A.random = B
     A'.random = B.next = B'
   curr = B:
     B.random = A
     B'.random = A.next = A'

3. Pass 3 (Unweave):
   A.next = B
   A'.next = B'
   B.next = null
   B'.next = null

Result:
Original: A ──► B ──► null (Restored!)
Cloned:   A' ──► B' ──► null (Deep copy with matching random pointers!)
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — 3 linear passes over the $N$ nodes.
- **Space Complexity:** **Strictly $O(1)$ auxiliary space** — No hash table, no call stack; new nodes belong to the required output list.

---

### 2.2 [LeetCode 430] Flatten a Multilevel Doubly Linked List

You are given a doubly linked list where each node has a `next`, `prev`, and an optional `child` pointer that may point to a separate doubly linked list. Flatten the list so that all the nodes appear in a single-level doubly linked list in preorder traversal order.

```csharp
/*
// Definition for a Node.
public class Node {
    public int val;
    public Node prev;
    public Node next;
    public Node child;
}
*/

public class SolutionFlattenList {
    /// <summary>
    /// Flattens a multilevel doubly linked list in O(N) time and O(1) space
    /// by splicing child branches inline.
    /// </summary>
    public Node Flatten(Node head) {
        if (head == null) return null;

        Node curr = head;

        while (curr != null) {
            // Case 1: If current node has no child, proceed forward
            if (curr.child == null) {
                curr = curr.next;
                continue;
            }

            // Case 2: Current node has a child branch -> Splice it!
            Node childHead = curr.child;
            Node childTail = childHead;

            // Find the tail of the child sublist
            while (childTail.next != null) {
                childTail = childTail.next;
            }

            // Connect childTail to curr.next (if curr.next exists)
            childTail.next = curr.next;
            if (curr.next != null) {
                curr.next.prev = childTail;
            }

            // Connect curr to childHead
            curr.next = childHead;
            childHead.prev = curr;

            // Clear the child pointer (CRITICAL INVARIANT!)
            curr.child = null;

            // Advance curr to the newly spliced childHead
            curr = curr.next;
        }

        return head;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — Although finding `childTail` traverses the child list, each node is traversed at most twice (once to find child tail, once as `curr`). Total operations are strictly linear $O(N)$.
- **Space Complexity:** $O(1)$ auxiliary space — pure in-place pointer rewiring.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master complex pointer rewiring and graph cloning on LeetCode:

### Problem 1 (Node Interleaving): LeetCode 138 — Copy List with Random Pointer (Medium)
- **Goal:** Implement both the $O(N)$ hash table solution and the $O(1)$ auxiliary space 3-pass interleaving solution.
- **Target Complexity:** $O(N)$ time, $O(1)$ extra space.

### Problem 2 (Child Branch Splice): LeetCode 430 — Flatten a Multilevel Doubly Linked List (Medium)
- **Goal:** Implement the iterative splicing solution; verify all 4 bidirectional connections and `curr.child = null`.
- **Target Complexity:** $O(N)$ time, $O(1)$ extra space.

### Problem 3 (General Graph Contrast): LeetCode 133 — Clone Graph (Medium)
- **Goal:** Deep copy an undirected graph using BFS or DFS with a `Dictionary<Node, Node>` visited map.
- **Contrast:** Why is node interleaving impossible on an arbitrary general graph?

### Bonus Challenge: LeetCode 1490 — Clone N-ary Tree (Medium)
- **Goal:** Clone a tree where each node has `IList<Node> children`.
- **Target Complexity:** $O(N)$ time, $O(H)$ recursion space.

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Deep Copying & Flattening Decision Tree              │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Deep copying list with arbitrary/random pointers?
                   │   ├─► Hash Map allowed? ────────► O(N) Space Dictionary [LC 138]
                   │   └─► Strict O(1) Space? ───────► 3-Pass Node Interleaving [LC 138 Optimal]
                   │                                  (Weave -> Clone Random -> Unweave)
                   │
                   ├─► Flattening multilevel Doubly Linked List?
                   │   └─► In-Place Splice ──────────► Find childTail, splice between curr & curr.next,
                   │                                  nullify curr.child [LC 430]
                   │
                   ├─► Deep copying general graph with cycles?
                   │   └─► BFS / DFS + Visited Map ──► Interleaving impossible; use Dictionary [LC 133]
                   │
                   └─► Arithmetic on numbers stored in linked lists?
                       └─► High-Performance List Arithmetic (Day 44) [LC 2, LC 445]
```

### Preview for Day 44: High-Performance List Arithmetic
Tomorrow in **Day 44**, we tackle **List Arithmetic & Carry Management**:
- **[LeetCode 2] Add Two Numbers:** Digits stored in reverse order (least significant digit first). Single-pass sum with carry propagation.
- **[LeetCode 445] Add Two Numbers II:** Digits stored in natural order (most significant digit first) without mutating the input list via explicit stack accumulation.

---

## 5. 🎯 Day 43 Checkpoint Questions

Verify your mastery of complex pointer graphs:

1. **The Interleaving Random Pointer Proof:** In LeetCode 138, why is `curr.next.random = curr.random.next` mathematically correct, and what would happen if you wrote `curr.next.random = curr.random`?
2. **Unweaving Separation Invariant:** In Pass 3 of LeetCode 138, what subtle bug occurs if you unweave the cloned list but forget to restore the original list's `.next` pointers? (Why will the interview grader fail your submission even if your cloned list is perfect?)
3. **Graph Interleaving Impossibility:** Why does the 3-pass node interleaving technique work for linked lists with random pointers, but fails completely for arbitrary directed graphs ([LeetCode 133])?
4. **Child Pointer Nullification:** In LeetCode 430, what happens if you forget to set `curr.child = null` after splicing the child list into the main list?
