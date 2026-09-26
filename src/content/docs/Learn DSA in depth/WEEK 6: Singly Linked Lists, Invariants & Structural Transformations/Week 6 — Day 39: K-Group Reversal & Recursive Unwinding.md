---
title: "Week 6 — Day 39: K-Group Reversal & Recursive Unwinding"
---

In **Day 38**, we mastered single subsegment reversals and palindrome symmetry verification.

Today, we confront the undisputed gold standard of linked list interview questions: **Reverse Nodes in $K$-Group ([LeetCode 25 — Hard])**.

LeetCode 25 is famous among Big Tech interviewers (Google, Meta, Amazon, Apple) because it tests whether you can maintain complex, multi-anchor invariants under pressure. You must count ahead, detect whether a complete group exists, reverse exactly $K$ nodes in-place, and **stitch the reversed chunk back into the outer list** without cycles, orphaned references, or auxiliary memory allocation.

---

## 1. 🧠 TEACH: The Mechanics of Group Chunking & Boundary Stitching

### 1.1 The Challenge of $K$-Group Reversal

Given a linked list and integer $K$:
> *"Reverse the nodes of the list $k$ at a time, and return its modified list. If the number of nodes is not a multiple of $k$, then left-out nodes at the end should **remain as they are**."*

```
Original (k = 3):  [ 1 ──► 2 ──► 3 ] ──► [ 4 ──► 5 ──► 6 ] ──► [ 7 ──► 8 ]
                     ├──Group 1──┤         ├──Group 2──┤         └Leftover┘

Target:            [ 3 ──► 2 ──► 1 ] ──► [ 6 ──► 5 ──► 4 ] ──► [ 7 ──► 8 ]
                                       ▲                         ▲
                              Stitched Connection         Remains Intact!
```

#### Why Naive Code Fails:
Candidates frequently:
1. Reverse the leftover nodes at the end when fewer than $K$ nodes remain.
2. Lose the pointer to the next group (`groupNext`), causing the tail of the reversed group to point into the void (`null`).
3. Fail to connect the previous group's tail to the new head of the reversed group.

---

### 1.2 The 4 Anchor Pointers of $K$-Group Chunking

To execute $K$-Group reversal cleanly with **strictly $O(1)$ auxiliary space**, we identify four anchor pointers for every chunk:

```
           groupPrev         curr                     kth     groupNext
               │               │                       │          │
   ... ──────► ◯ ────────────► ◯ ───► ◯ ───► ... ────► ◯ ───────► ◯ ───► ...
               ▲               └────── K nodes ────────┘
     Tail of previous group                            Head of next group
```

1. `groupPrev`: The node immediately **preceding** the current $K$-group. (For the first group, this is our sentinel `dummy`!).
2. `kth`: The $K$-th node of the current group. (Discovered by walking $K$ steps from `groupPrev`).
3. `groupNext`: The node immediately **following** the current group (`kth.next`).
4. `curr`: The first node of the current group (`groupPrev.next`).

---

### 1.3 The 4-Step Invariant Pointer Dance

Once `kth` is confirmed to exist (ensuring at least $K$ nodes remain):

```
Step 1: Save the next group boundary
  groupNext = kth.next;

Step 2: Reverse the K nodes in-place
  Standard 3-pointer reversal starting at curr, stopping when prev reaches kth.
  Notice: After reversal, 'curr' (Node 1) is now the TAIL of the group, 
          and 'kth' (Node 3) is now the HEAD of the group!

Step 3: Reconnect with outer list
  groupPrev.next = kth;       // Previous group connects to new head
  curr.next = groupNext;      // New tail connects to next group

Step 4: Advance groupPrev
  groupPrev = curr;           // The old curr is now the tail for the next iteration!
```

```
Before Step 3:
  groupPrev (0) ──┐
                  │ (disconnected)
  kth (3) ──► 2 ──► 1 (curr) ──┐
                               │ (disconnected)
  groupNext (4) ◄──────────────┘

After Step 3:
  groupPrev (0) ──► 3 (kth) ──► 2 ──► 1 (curr) ──► 4 (groupNext)
```

---

### 1.4 Recursive Unwinding vs. Optimal Iterative

- **Recursive Approach:**
  - Check if $K$ nodes exist.
  - Reverse the first $K$ nodes.
  - Set `curr.next = ReverseKGroup(groupNext, k);`
  - While clean, recursion consumes $O(N / K)$ call stack frames. If $N = 10^5$ and $K = 2$, this uses $50,000$ stack frames $\implies$ **StackOverflowException** risk in C#!
- **Iterative Approach ($O(1)$ Auxiliary Space):**
  - Uses the 4 anchor pointers inside a `while (true)` loop.
  - Zero call stack overhead. **Required for Senior/Staff Big Tech interviews.**

---

### 1.5 Interview Spoken Drill (20–30 Seconds)

> *"To reverse nodes in k-groups with O(1) space, I use a sentinel dummy node and maintain a pointer to the previous group's tail, groupPrev. In each iteration, I look ahead k steps to find the kth node. If fewer than k nodes remain, I leave them as-is and terminate. Otherwise, I preserve kth.next, reverse the k nodes in-place, connect groupPrev to the new head (kth), and connect the new tail to the next group. Finally, I advance groupPrev to the new tail and repeat, achieving $O(N)$ time with strictly $O(1)$ extra memory."*

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 24 — Swap Nodes in Pairs (Medium)

> Given a linked list, swap every two adjacent nodes and return its head. You must solve the problem without modifying the values in the list's nodes (i.e., only nodes themselves may be changed.)

#### Visual Step-by-Step Trace:
`head = [1 -> 2 -> 3 -> 4]` ($K = 2$)

```
Initialize: dummy -> 1 -> 2 -> 3 -> 4
prev = dummy

Iteration 1:
 first = prev.next (1)
 second = prev.next.next (2)

 Pointer rewiring:
  first.next = second.next  (1 -> 3)
  second.next = first       (2 -> 1)
  prev.next = second        (dummy -> 2 -> 1 -> 3 -> 4)

 Advance: prev = first (node 1)

Iteration 2:
 first = prev.next (3)
 second = prev.next.next (4)

 Pointer rewiring:
  first.next = second.next  (3 -> null)
  second.next = first       (4 -> 3)
  prev.next = second        (1 -> 4 -> 3 -> null)

Final: dummy -> 2 -> 1 -> 4 -> 3 -> null. (Correct!)
```

#### Production C# Implementation:
```csharp
public class SolutionSwapPairs {
    public ListNode SwapPairs(ListNode head) {
        if (head == null || head.next == null) return head;

        ListNode dummy = new ListNode(0, head);
        ListNode prev = dummy;

        while (prev.next != null && prev.next.next != null) {
            ListNode first = prev.next;
            ListNode second = prev.next.next;

            // In-place pointer rewiring for pair (first, second)
            first.next = second.next;
            second.next = first;
            prev.next = second;

            // Advance prev to the tail of the swapped pair
            prev = first;
        }

        return dummy.next;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — single pass; visits each pair once.
- **Space Complexity:** $O(1)$ — constant scalar pointers.

---

### Problem 2: LeetCode 25 — Reverse Nodes in k-Group (Hard)

> Given the `head` of a linked list, reverse the nodes of the list `k` at a time, and return the modified list.  
> `k` is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of `k` then left-out nodes, in the end, should remain as it is.  
> You may not alter the values in the list's nodes, only nodes themselves may be changed.

#### Visual Step-by-Step Trace:
`head = [1 -> 2 -> 3 -> 4 -> 5]`, `k = 2`

```
dummy -> 1 -> 2 -> 3 -> 4 -> 5
groupPrev = dummy

Round 1:
 1. Count k nodes ahead: kth = 2. Exists!
 2. groupNext = kth.next = 3.
 3. Reverse [1 -> 2]:
    becomes [2 -> 1]
 4. Stitch:
    groupPrev.next = kth (dummy -> 2)
    curr.next = groupNext (1 -> 3)
    groupPrev = curr (node 1)
 List state: dummy -> 2 -> 1 -> 3 -> 4 -> 5

Round 2:
 1. Count k nodes ahead from groupPrev (1): kth = 4. Exists!
 2. groupNext = kth.next = 5.
 3. Reverse [3 -> 4]:
    becomes [4 -> 3]
 4. Stitch:
    groupPrev.next = 4 (1 -> 4)
    curr.next = 5 (3 -> 5)
    groupPrev = curr (node 3)
 List state: dummy -> 2 -> 1 -> 4 -> 3 -> 5

Round 3:
 1. Count k nodes ahead from groupPrev (3): only node 5 exists (< 2 nodes).
    kth == null!
 2. Break loop! Leftover node 5 remains untouched.

Result: [2 -> 1 -> 4 -> 3 -> 5]. (Correct!)
```

#### Production C# Implementation:
```csharp
public class SolutionReverseKGroup {
    public ListNode ReverseKGroup(ListNode head, int k) {
        if (head == null || k <= 1) return head;

        ListNode dummy = new ListNode(0, head);
        ListNode groupPrev = dummy;

        while (true) {
            // Step 1: Check if k nodes remain
            ListNode kth = GetKthNode(groupPrev, k);
            if (kth == null) {
                break; // Fewer than k nodes remain; leave them as-is
            }

            ListNode groupNext = kth.next;

            // Step 2: Reverse the k nodes in-place
            ListNode prev = groupNext; // Connecting tail directly to groupNext during reversal
            ListNode curr = groupPrev.next;

            while (curr != groupNext) {
                ListNode nextTemp = curr.next;
                curr.next = prev;
                prev = curr;
                curr = nextTemp;
            }

            // Step 3: Reconnect the outer group boundary
            ListNode newGroupTail = groupPrev.next;
            groupPrev.next = kth;
            groupPrev = newGroupTail; // Step 4: Advance groupPrev to the end of reversed chunk
        }

        return dummy.next;
    }

    private ListNode GetKthNode(ListNode start, int k) {
        ListNode curr = start;
        for (int i = 0; i < k && curr != null; i++) {
            curr = curr.next;
        }
        return curr;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — each node is touched at most twice (once during the `GetKthNode` scan, and once during the in-place reversal). Total operations $= 2N = O(N)$.
- **Space Complexity:** **$O(1)$ auxiliary space** — zero heap allocations, zero recursion frames.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master $K$-group chunking on LeetCode:

### Problem 1 (Warmup / $K=2$): LeetCode 24 — Swap Nodes in Pairs (Medium)
- **Goal:** Implement the iterative 3-pointer swap for adjacent pairs.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 2 (The Benchmark): LeetCode 25 — Reverse Nodes in k-Group (Hard)
- **Goal:** Implement the 4-anchor iterative chunking template from memory.
- **Target Complexity:** $O(N)$ time, $O(1)$ auxiliary space.

### Bonus / Extension Challenge: LeetCode 1721 — Swapping Nodes in a Linked List (Medium)
- **Goal:** Swap the values of the $k$-th node from the beginning and the $k$-th node from the end.
- **Hint:** Use two pointers with a fixed $K$-gap (Day 40 preview) to find both targets in a single pass!

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Structural Reversal Decision Matrix                  │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Reverse entire list ──────────────────────► 3-Pointer Iterative [LC 206]
                   │
                   ├─► Reverse between index left and right ─────► Head-Insertion Dance [LC 92]
                   │
                   ├─► Swap adjacent pairs (K = 2) ──────────────► 2-Node Splice [LC 24]
                   │
                   ├─► Reverse in repeated chunks of K ──────────► 4-Anchor K-Group Template [LC 25]
                   │   (Leave < K leftover intact)
                   │
                   └─► Find K-th node from end in 1 pass ────────► Fixed K-Gap Two Pointers (Day 40)
                                                                   [LC 19]
```

### Preview for Day 40: Two-Pointer Removal & Intersection Invariants
Today we operated on multi-node chunks.  
Tomorrow in **Day 40**, we explore **Relative Distance Invariants**:
- The **Fixed $K$-Gap Pattern**: removing the $N$-th node from the end in a single pass without knowing the list length ([LC 19]).
- The **Cyclic Traversal Trick**: finding where two lists intersect without a hash set in $O(1)$ space by switching heads ([LC 160])!

---

## 5. 🎯 Day 39 Checkpoint Questions

Verify your mastery of $K$-group structural rewiring:

1. **Leftover Nodes Handling:** In LeetCode 25, how does the `GetKthNode` function ensure that any leftover segment of size $< K$ at the end of the list remains completely unmutated?
2. **Initial `prev = groupNext` Trick:** In the production implementation of `ReverseKGroup` above, why do we initialize `prev = groupNext` before reversing `curr`? What link does this automatically establish for the new group tail?
3. **Space Complexity of Recursion:** If LeetCode 25 is solved recursively where each recursive call processes $K$ nodes, what is the maximum call stack memory consumed if $N = 10^5$ and $K = 2$?
4. **Boundary Advancing:** After reversing a $K$-group, why is `groupPrev = newGroupTail` assigned to `oldGroupPrev.next` instead of `kth`?
