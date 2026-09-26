---
title: "Week 6 — Day 38: In-Place Reversals & Palindrome Lists"
---

In **Days 36 and 37**, we mastered basic pointer chasing, sentinel dummy nodes, and single-pass midpoint finding via fast & slow pointers.

Today, we combine those techniques to conquer **Structural Transformations & Symmetry Invariants**:
1. **Subsegment Reversals ([LeetCode 92]):** Reversing an arbitrary subsegment between positions $left$ and $right$ in a single pass without allocating any new nodes.
2. **Palindrome List Verification ([LeetCode 234]):** Determining if a linked list reads the same forward and backward in $O(N)$ time with strictly **$O(1)$ auxiliary space**, and restoring the list before returning.
3. **List Folding / Interweaving ([LeetCode 143]):** Reordering a list into an alternating outside-in zip ($L_0 \to L_n \to L_1 \to L_{n-1} \dots$) in $O(1)$ space.

---

## 1. 🧠 TEACH: Subsegment Pointer Rewiring & Structural Symmetry

### 1.1 The Anatomy of Subsegment Reversal (Reverse Linked List II)

Given a list, reverse only the nodes from position $left$ to position $right$:
```
List:     1  ──►  2  ──►  3  ──►  4  ──►  5
                 ▲               ▲
                left           right

Target:   1  ──►  4  ──►  3  ──►  2  ──►  5
```

#### Deconstructing the List into Three Segments:
To perform this reversal cleanly in a single pass with $O(1)$ auxiliary space, we must identify four anchor nodes:
1. `prev`: The node immediately **before** position $left$ (at index $left - 1$).
2. `curr`: The node at position $left$ (which will end up as the tail of the reversed subsegment).
3. `then`: The next node to be moved to the front of the sublist (`curr.next`).
4. `dummy`: A sentinel node preceding `head`, essential when $left = 1$ (where `head` itself is reversed!).

```
                dummy ──► 1 ──► 2 ──► 3 ──► 4 ──► 5
                          ▲     ▲     ▲
                        prev   curr  then
```

#### The In-Place Head-Insertion Pointer Dance:
Instead of severing the sublist and doing an isolated 3-pointer reversal, we repeatedly remove `then` from its current spot and insert it immediately after `prev`:

```csharp
ListNode then = curr.next;
curr.next = then.next;   // 1. Bypass 'then'
then.next = prev.next;   // 2. Point 'then' to the front of the reversed sublist
prev.next = then;        // 3. Connect 'prev' to 'then'
```

Notice what happens after one step:
```
Iteration 1: Move '3' to front of subsegment
dummy ──► 1 ──► 3 ──► 2 ──► 4 ──► 5
          ▲           ▲     ▲
        prev         curr  then (now node 4)

Iteration 2: Move '4' to front of subsegment
dummy ──► 1 ──► 4 ──► 3 ──► 2 ──► 5
          ▲                 ▲
        prev               curr
```
In exactly $right - left$ operations, the sublist is completely reversed in-place without ever losing reference to the prefix or suffix!

---

### 1.2 Palindrome Verification in $O(1)$ Auxiliary Space

Testing if an array is a palindrome is trivial because arrays allow bidirectional indexing: `arr[left] == arr[right]`.  
Singly linked lists only point forward!

- **Naive Approach ($O(N)$ Space):** Copy values into a `List<int>` and use two pointers. In Big Tech interviews, this is an automatic downgrade because it uses $O(N)$ auxiliary memory.
- **The $O(1)$ Auxiliary Space Pipeline:**
  We can solve this without any extra allocations using a 4-phase pipeline:

```
Step 1: Find Midpoint via Fast & Slow Pointers
  1 ──► 2 ──► 2 ──► 1
        ▲
       slow (midpoint)

Step 2: Reverse the Second Half In-Place
  First Half:   1 ──► 2 ──► null
  Second Half:  1 ──► 2 ──► null  (Reversed!)

Step 3: Compare Both Halves
  p1 = head, p2 = reversedHead
  Compare until p2 == null. If all values match -> Palindrome!

Step 4: Restore Original List (Production Hygiene Invariant)
  Re-reverse the second half back to original orientation.
```

#### Why Restoring the List is Mandatory:
In production systems, passing a linked list to an `IsPalindrome(head)` query method should **not destroy or mutate the caller's data structure**. An interviewer will specifically evaluate whether you re-reverse the second half before returning `true` or `false`!

---

### 1.3 The Folding Pattern (Reorder List)

Reordering a list as $L_0 \to L_n \to L_1 \to L_{n-1} \to L_2 \dots$ uses the exact same algorithmic primitives:
1. **Find Midpoint and Sever:** Locate middle, sever the list: `mid.next = null`.
2. **Reverse Second Half:** Invert the second half in-place.
3. **Interleave (Zip Merge):** Weave nodes alternating from the first half and the reversed second half:
   ```
   L1: 1 ──► 2 ──► null
   L2: 4 ──► 3 ──► null
   Merge: 1 ──► 4 ──► 2 ──► 3 ──► null
   ```

---

### 1.4 Interview Spoken Drill (20–30 Seconds)

> *"To test if a linked list is a palindrome in O(1) space, I use fast and slow pointers to locate the midpoint, then reverse the second half in-place using a 3-pointer reversal. I compare the first half and the reversed second half node-by-node. Finally, to prevent side-effects on the caller's data structure, I re-reverse the second half to restore the original list before returning. This runs in $O(N)$ time with strictly $O(1)$ auxiliary space."*

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 92 — Reverse Linked List II (Medium)

> Given the `head` of a singly linked list and two integers `left` and `right` where `left <= right`, reverse the nodes of the list from position `left` to position `right`, and return the reversed list. Solve in a single pass.

#### Production C# Implementation:
```csharp
public class SolutionReverseBetween {
    public ListNode ReverseBetween(ListNode head, int left, int right) {
        if (head == null || left == right) return head;

        // Sentinel dummy node handles the case where left == 1 (reversing the head)
        ListNode dummy = new ListNode(0, head);
        ListNode prev = dummy;

        // Step 1: Advance 'prev' to the node immediately before position 'left'
        for (int i = 0; i < left - 1; i++) {
            prev = prev.next;
        }

        // 'curr' will be the tail of the reversed sublist
        ListNode curr = prev.next;

        // Step 2: Head-insertion pointer dance (right - left times)
        for (int i = 0; i < right - left; i++) {
            ListNode then = curr.next;
            curr.next = then.next;
            then.next = prev.next;
            prev.next = then;
        }

        return dummy.next;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — single pass over the list.
- **Space Complexity:** $O(1)$ — scalar pointers only (`dummy`, `prev`, `curr`, `then`).

---

### Problem 2: LeetCode 234 — Palindrome Linked List (Easy)

> Given the `head` of a singly linked list, return `true` if it is a palindrome or `false` otherwise.  
> Could you do it in $O(n)$ time and $O(1)$ space?

#### Production C# Implementation (Complete with List Restoration):
```csharp
public class SolutionPalindromeList {
    public bool IsPalindrome(ListNode head) {
        if (head == null || head.next == null) return true;

        // Step 1: Find end of first half via Fast & Slow pointers
        ListNode firstHalfEnd = GetFirstHalfEnd(head);
        
        // Step 2: Reverse second half in-place
        ListNode secondHalfStart = ReverseList(firstHalfEnd.next);

        // Step 3: Check whether values match
        ListNode p1 = head;
        ListNode p2 = secondHalfStart;
        bool isPalindrome = true;

        while (isPalindrome && p2 != null) {
            if (p1.val != p2.val) {
                isPalindrome = false;
            }
            p1 = p1.next;
            p2 = p2.next;
        }

        // Step 4: Restore the original list structure (Production Invariant)
        firstHalfEnd.next = ReverseList(secondHalfStart);

        return isPalindrome;
    }

    private ListNode GetFirstHalfEnd(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;
        // Stops slow at the first middle for even lengths
        while (fast.next != null && fast.next.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    }

    private ListNode ReverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — finding mid takes $N/2$, reversing takes $N/2$, comparing takes $N/2$, restoring takes $N/2$. Total operations $= 2N = O(N)$.
- **Space Complexity:** **$O(1)$ auxiliary space** — strictly in-place pointer modifications.

---

### Problem 3: LeetCode 143 — Reorder List (Medium)

> You are given the head of a singly linked-list: $L_0 \to L_1 \to \dots \to L_{n-1} \to L_n$  
> Reorder it to be: $L_0 \to L_n \to L_1 \to L_{n-1} \to L_2 \to L_{n-2} \dots$  
> You may not modify the values in the list's nodes. Only nodes themselves may be changed.

#### Visual Step-by-Step Trace:
`head = [1 -> 2 -> 3 -> 4 -> 5]`

```
Step 1: Find middle & sever
 slow stops at 3.
 secondHalf = 4 -> 5
 slow.next = null -> firstHalf = 1 -> 2 -> 3 -> null

Step 2: Reverse second half
 reversedSecondHalf = 5 -> 4 -> null

Step 3: Interleave (Zip)
 L1: 1 -> 2 -> 3 -> null
 L2: 5 -> 4 -> null

 1. Connect 1 -> 5, advance L1 to 2
 2. Connect 5 -> 2, advance L2 to 4
 3. Connect 2 -> 4, advance L1 to 3
 4. Connect 4 -> 3
Result: 1 -> 5 -> 2 -> 4 -> 3 -> null. (Correct!)
```

#### Production C# Implementation:
```csharp
public class SolutionReorderList {
    public void ReorderList(ListNode head) {
        if (head == null || head.next == null) return;

        // Step 1: Find midpoint using fast/slow pointers
        ListNode slow = head;
        ListNode fast = head;
        while (fast.next != null && fast.next.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }

        // Sever the list into two halves
        ListNode secondHalf = slow.next;
        slow.next = null;

        // Step 2: Reverse the second half
        ListNode prev = null;
        ListNode curr = secondHalf;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        ListNode l2 = prev;
        ListNode l1 = head;

        // Step 3: Interleave nodes from l1 and l2
        while (l2 != null) {
            ListNode next1 = l1.next;
            ListNode next2 = l2.next;

            l1.next = l2;
            l2.next = next1;

            l1 = next1;
            l2 = next2;
        }
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — linear passes.
- **Space Complexity:** $O(1)$ auxiliary memory.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master in-place reversals and symmetry checks on LeetCode:

### Problem 1 (Subsegment In-Place): LeetCode 92 — Reverse Linked List II (Medium)
- **Goal:** Implement the single-pass head-insertion pointer dance without severing the list.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 2 (Symmetry & Restoration): LeetCode 234 — Palindrome Linked List (Easy)
- **Goal:** Implement the 4-phase pipeline (mid $\to$ reverse $\to$ compare $\to$ restore).
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 3 (Folding / Interleave): LeetCode 143 — Reorder List (Medium)
- **Goal:** Split, reverse second half, and zip-merge nodes in-place.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Bonus / Extension Challenge: LeetCode 2074 — Reverse Nodes in Even Length Groups (Medium)
- **Goal:** Traverse nodes in groups of lengths $1, 2, 3, 4, \dots$. If a group's actual length is even, reverse it!
- **Hint:** Combine length counting with the subsegment reversal template!

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                   In-Place Linked List Transformations                 │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Reverse subsegment between left and right ─► Head-Insertion Dance (`prev, curr, then`)
                   │                                               [LC 92]
                   │
                   ├─► Check symmetry / Palindrome in O(1) space ─► Midpoint + Reverse 2nd Half + Restore
                   │                                               [LC 234]
                   │
                   ├─► Fold / Interleave list (L0 -> Ln -> L1) ───► Split Mid + Reverse 2nd Half + Zip
                   │                                               [LC 143]
                   │
                   └─► Reverse in fixed chunks of K ─────────────► K-Group Boundary Stitching (Day 39)
                                                                   [LC 25, LC 24]
```

### Preview for Day 39: $K$-Group Reversal & Recursive Unwinding
Today we reversed arbitrary subsegments and single halves.  
Tomorrow in **Day 39**, we tackle the pinnacle of singly linked list structural rewiring: **Reverse Nodes in $K$-Group ([LeetCode 25 — Hard])**. We will learn how to maintain sublist boundaries and cleanly stitch consecutive reversed chunks without memory leaks!

---

## 5. 🎯 Day 38 Checkpoint Questions

Verify your depth in subsegment pointer mechanics with these 4 questions:

1. **The Role of `prev` in LeetCode 92:** Why is it mandatory to have `prev` point to the node immediately *before* position `left`? How does `prev.next = then` maintain connectivity?
2. **List Mutation Ethics:** Why do top-tier interviewers at Google and Meta penalize candidates who solve LeetCode 234 in $O(1)$ space without restoring the list at the end?
3. **Midpoint Parity in Palindrome Check:** In LeetCode 234, why does the loop `while (fast.next != null && fast.next.next != null)` stop `slow` at the first middle on even lengths? What happens to the odd middle node on odd lengths?
4. **Reorder List Termination:** In LeetCode 143, why is the condition for zipping `while (l2 != null)` rather than `while (l1 != null)`?
