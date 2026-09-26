---
title: "Week 6 — Day 40: Two-Pointer Removal & Intersection Invariants"
---

In **Days 37 to 39**, we used fast & slow pointers to find midpoints, prove cyclic loops, and reverse nodes in $K$-element blocks.

Today, we explore **Relative Distance Invariants & Pointer-Switching Mechanics**:
1. **The Fixed $K$-Gap Pattern ([LeetCode 19]):** Finding and removing the $N$-th node from the end of a list in a **single pass** without pre-computing the list's length.
2. **The Cyclic Equivalence Trick ([LeetCode 160]):** Finding the intersection node of two lists in $O(1)$ space without a hash set by proving $L_A + L_B = L_B + L_A$.
3. **The Multi-Chain Partition Architecture ([LeetCode 86]):** Stable partitioning of nodes around a pivot value using dual dummy sentinels.

---

## 1. 🧠 TEACH: Relative Gap Invariants & Cycle Switching Tricks

### 1.1 The Fixed $K$-Gap Pattern: One-Pass $N$-th From End

Suppose you are asked to delete the $N$-th node from the end of a list of unknown length $L$:
```
List: 1 ──► 2 ──► 3 ──► 4 ──► 5,  N = 2
Target to delete: Node 4 (2nd from the end)
```

- **Two-Pass Naive Approach:**
  - Pass 1: Traverse the list to count total length $L = 5$.
  - Pass 2: The target node is at index $L - N = 5 - 2 = 3$. Traverse to index $L - N - 1 = 2$ and delete node 4.
  - *Interview Critique:* While $O(N)$, it requires scanning the list twice. Top-tier interviewers will immediately ask: *"Can you do this in a single pass?"*

#### The $(N + 1)$-Gap Invariant:
To delete a node in a singly linked list, we must position our pointer at its **immediate predecessor** (the node right before it).

If we maintain two pointers `fast` and `slow` separated by a fixed distance of **$N + 1$ nodes**:

```
dummy ──► 1 ──► 2 ──► 3 ──► 4 ──► 5 ──► null
  ▲                   ▲
 slow               fast (advanced N + 1 = 3 steps ahead)
```

When `fast` and `slow` move in lockstep at the same speed ($1$ step per iteration):
- The distance between `fast` and `slow` remains invariant: exactly $N + 1$ nodes.
- When `fast` falls off the end of the list (`fast == null`):
  - `fast` is at distance $L + 1$ from `dummy`.
  - `slow` is at distance $(L + 1) - (N + 1) = \mathbf{L - N}$ from `dummy`!
- **`slow` is sitting directly on the predecessor of the $N$-th node from the end!**
- We can delete the target in $O(1)$ time:
  $$\mathbf{\text{slow.next} = \text{slow.next.next}}$$

---

### 1.2 The Intersection Invariant ($L_A + L_B = L_B + L_A$)

Given two singly linked lists $A$ and $B$ that merge into a shared tail at intersection node $C$:

```
List A:   a1 ──► a2 ──┐
                      ▼
List B:   b1 ──► b2 ──► c1 ──► c2 ──► c3 ──► null
          └── b ──┘   └─── c ───┘
```

- Length of List A: $L_A = a + c$
- Length of List B: $L_B = b + c$

If $a \ne b$, two pointers starting at `headA` and `headB` will arrive at the shared segment at different times. They will never collide.

#### How to Synchronize Them Without a Hash Set?
- **Hash Set Approach:** Store all nodes of List A in a `HashSet<ListNode>`, then traverse B $\implies O(M + N)$ time, but **$O(M)$ auxiliary memory**.
- **The Pointer-Switching Magic ($O(1)$ Space):**
  - Place pointer $p_A$ at `headA`, and pointer $p_B$ at `headB`.
  - Advance both by 1 step on each iteration.
  - When $p_A$ reaches the end of List A (`p_A == null`), redirect it to **`headB`**!
  - When $p_B$ reaches the end of List B (`p_B == null`), redirect it to **`headA`**!

```
Distance traveled by p_A before collision: a + c + b
Distance traveled by p_B before collision: b + c + a

Because: (a + c) + b == (b + c) + a
Both pointers traverse the EXACT SAME TOTAL DISTANCE!
```

#### What if the lists do NOT intersect?
- If there is no intersection ($c = 0$):
  - $p_A$ travels $L_A + L_B$ and lands on `null`.
  - $p_B$ travels $L_B + L_A$ and lands on `null`.
  - Both become `null` at the exact same step!
  - The loop terminates with $p_A == p_B == null \implies$ returns `null`!

---

### 1.3 The Multi-Chain Partition Architecture (Partition List)

Given a linked list and a value $x$, partition it such that all nodes less than $x$ come before nodes greater than or equal to $x$, while **preserving original relative order** (stable partition).

Attempting to swap nodes in-place within a single list is a recipe for broken links and lost pointers.

#### The Dual Dummy Pattern:
Create two independent dummy chains:
1. `lessDummy`: Accumulates nodes with `val < x`.
2. `greaterDummy`: Accumulates nodes with `val >= x`.

```
Original:    1 ──► 4 ──► 3 ──► 2 ──► 5 ──► 2,  x = 3

lessList:    dummyLess    ──► 1 ──► 2 ──► 2
greaterList: dummyGreater ──► 4 ──► 3 ──► 5
```

#### The Critical Bug: Severing the Tail!
Notice that the last node in `greaterList` (node `5`) originally pointed to node `2` in the input list!  
If you do not explicitly sever this link:
$$\mathbf{\text{greaterTail.next} = \text{null}}$$
When you stitch `lessTail.next = greaterDummy.next`, node `5` will still point to node `2`, creating a **catastrophic infinite cycle**!

---

### 1.4 Interview Spoken Drill (20–30 Seconds)

> *"To remove the N-th node from the end in one pass, I place a dummy node before the head and advance a fast pointer N + 1 steps ahead. Then, I move both fast and slow pointers in lockstep until fast hits null. Slow will stop exactly on the predecessor of the target node, allowing an $O(1)$ deletion in a single pass. For finding list intersections in $O(1)$ space, I advance two pointers simultaneously; when either hits null, I redirect it to the other list's head. Since $L_A + L_B = L_B + L_A$, both pointers are guaranteed to meet at the intersection node or terminate at null."*

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 19 — Remove Nth Node From End of List (Medium)

> Given the `head` of a linked list, remove the `n-th` node from the end of the list and return its head. Solve in **one pass**.

#### Visual Step-by-Step Trace:
`head = [1 -> 2 -> 3 -> 4 -> 5]`, `n = 2`

```
Initialize: dummy -> 1 -> 2 -> 3 -> 4 -> 5 -> null
slow = dummy
fast = dummy

Step 1: Advance fast by n + 1 = 3 steps
 fast moves to dummy -> 1 -> 2 -> 3
 fast = node 3, slow = dummy

Step 2: Move both in lockstep until fast == null
 fast = 4, slow = 1
 fast = 5, slow = 2
 fast = null, slow = 3  (fast reached null -> STOP!)

slow is at node 3 (predecessor of node 4!).
Delete target:
 slow.next = slow.next.next (3 -> 5)

Final list: dummy -> 1 -> 2 -> 3 -> 5 -> null. (Correct!)
```

#### Production C# Implementation:
```csharp
public class SolutionRemoveNthFromEnd {
    public ListNode RemoveNthFromEnd(ListNode head, int n) {
        // Sentinel dummy handles deletion of head node effortlessly
        ListNode dummy = new ListNode(0, head);
        ListNode slow = dummy;
        ListNode fast = dummy;

        // Step 1: Create a fixed gap of (n + 1) nodes between fast and slow
        for (int i = 0; i <= n; i++) {
            fast = fast.next;
        }

        // Step 2: Slide both pointers until fast falls off the end
        while (fast != null) {
            slow = slow.next;
            fast = fast.next;
        }

        // Step 3: slow is now sitting at the node immediately before the target
        slow.next = slow.next.next;

        return dummy.next;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(L)$ — strictly a single pass over the list of length $L$.
- **Space Complexity:** $O(1)$ — constant scalar pointers.

---

### Problem 2: LeetCode 160 — Intersection of Two Linked Lists (Easy)

> Given the heads of two singly linked-lists `headA` and `headB`, return the node at which the two lists intersect. If the two linked lists have no intersection at all, return `null`. Solve in $O(m + n)$ time and **$O(1)$ space**.

#### Visual Step-by-Step Trace:
`List A = [4 -> 1 -> 8 -> 4 -> 5]` ($L_A = 5$)  
`List B = [5 -> 6 -> 1 -> 8 -> 4 -> 5]` ($L_B = 6$)  
Intersection at node `8`.

```
Initial: pA = 4, pB = 5
Step 1:  pA = 1, pB = 6
Step 2:  pA = 8, pB = 1
Step 3:  pA = 4, pB = 8
Step 4:  pA = 5, pB = 4
Step 5:  pA = null -> redirect to headB (5), pB = 5
Step 6:  pA = 6, pB = null -> redirect to headA (4)
Step 7:  pA = 1, pB = 1
Step 8:  pA = 8, pB = 8  (pA == pB! COLLISION at node 8!)

Result: Node 8. (Correct!)
```

#### Production C# Implementation:
```csharp
public class SolutionGetIntersectionNode {
    public ListNode GetIntersectionNode(ListNode headA, ListNode headB) {
        if (headA == null || headB == null) return null;

        ListNode pA = headA;
        ListNode pB = headB;

        // Invariant: Both pointers traverse exactly (LA + LB) nodes
        while (pA != pB) {
            // When reaching null, switch to the head of the opposite list
            pA = (pA == null) ? headB : pA.next;
            pB = (pB == null) ? headA : pB.next;
        }

        // Either points to the intersection node, or both are null (no intersection)
        return pA;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(L_A + L_B)$ — at most two passes over each list.
- **Space Complexity:** **$O(1)$ auxiliary space** — zero hash sets allocated.

---

### Problem 3: LeetCode 86 — Partition List (Medium)

> Given the `head` of a linked list and a value `x`, partition it such that all nodes **less than** `x` come before nodes **greater than or equal** to `x`.  
> You should preserve the original relative order of the nodes in each of the two partitions.

#### Production C# Implementation:
```csharp
public class SolutionPartitionList {
    public ListNode Partition(ListNode head, int x) {
        // Dual dummy nodes represent the heads of the two partitions
        ListNode lessDummy = new ListNode(0);
        ListNode greaterDummy = new ListNode(0);

        ListNode lessTail = lessDummy;
        ListNode greaterTail = greaterDummy;

        ListNode curr = head;

        // Step 1: Distribute nodes into the two chains
        while (curr != null) {
            if (curr.val < x) {
                lessTail.next = curr;
                lessTail = lessTail.next;
            } else {
                greaterTail.next = curr;
                greaterTail = greaterTail.next;
            }
            curr = curr.next;
        }

        // Step 2: CRITICAL - Sever the trailing link of greaterTail to prevent cycles!
        greaterTail.next = null;

        // Step 3: Stitch the two chains together
        lessTail.next = greaterDummy.next;

        return lessDummy.next;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — single pass over the original list.
- **Space Complexity:** $O(1)$ — re-splices existing nodes; only allocates two lightweight sentinel headers.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master relative gap invariants and multi-chain partitioning on LeetCode:

### Problem 1 (Fixed $K$-Gap): LeetCode 19 — Remove Nth Node From End of List (Medium)
- **Goal:** Implement one-pass deletion with $(N + 1)$-gap and dummy head.
- **Target Complexity:** $O(L)$ time, $O(1)$ space.

### Problem 2 (Pointer Switching): LeetCode 160 — Intersection of Two Linked Lists (Easy)
- **Goal:** Implement $O(1)$ space intersection check using cyclic pointer redirection.
- **Target Complexity:** $O(L_A + L_B)$ time, $O(1)$ space.

### Problem 3 (Dual Chain Partition): LeetCode 86 — Partition List (Medium)
- **Goal:** Distribute nodes across two dummy chains and remember to sever `greaterTail.next`.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Bonus / Extension Challenge: LeetCode 328 — Odd Even Linked List (Medium)
- **Goal:** Group all odd-indexed nodes together followed by even-indexed nodes in $O(N)$ time and $O(1)$ space.
- **Hint:** Maintain two pointers `odd` and `even`, weave them forward two steps at a time, then connect `odd.next = evenHead`!

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Relative Distance Decision Tree                   │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Find/Delete N-th node from end in 1 pass ─► Fixed (N+1)-Gap Two Pointers [LC 19]
                   │
                   ├─► Find intersection of two lists in O(1) ───► Pointer Switching Walk [LC 160]
                   │                                               (pA -> headB, pB -> headA)
                   │
                   ├─► Partition elements into 2 categories ─────► Dual Dummy Chains (Less & Greater) [LC 86]
                   │   (Preserving original relative order)        (Sever greaterTail.next = null!)
                   │
                   └─► Sort linked list in O(N log N) time ──────► Linked List Merge Sort (Day 41)
                                                                   [LC 148]
```

### Preview for Day 41: Sorting Lists — Merge Sort in $O(N \log N)$ Time and $O(1)$ Space
Today we mastered single-pass gap tracking and multi-chain partitioning.  
Tomorrow in **Day 41**, we tackle **Sorting Linked Lists**:
We will prove why **Merge Sort** is the gold standard for linked lists (unlike arrays, merging two lists requires **$O(1)$ auxiliary memory**), how to find midpoints and sever connections cleanly, and how bottom-up iterative merge sort achieves true $O(1)$ stack space!

---

## 5. 🎯 Day 40 Checkpoint Questions

Verify your mastery of relative distance and partitioning invariants:

1. **The $(N + 1)$ Offset Rationale:** In LeetCode 19, why must `fast` be advanced $N + 1$ steps ahead instead of $N$ steps? What node would `slow` stop at if `fast` was advanced only $N$ steps?
2. **Cycle Prevention in Partition List:** In LeetCode 86, explain the exact scenario where omitting `greaterTail.next = null` produces a memory cycle.
3. **Non-Intersecting Proof in LeetCode 160:** If List A has length 3 and List B has length 5 and they do NOT intersect, trace the exact step count when both pointers become `null`. Why does the loop cleanly terminate without infinite cycling?
4. **Odd Even Linked List Contrast:** How does LeetCode 328 (Odd Even Linked List) differ from LeetCode 86 (Partition List)? Why does LeetCode 328 not require extra dummy nodes?
