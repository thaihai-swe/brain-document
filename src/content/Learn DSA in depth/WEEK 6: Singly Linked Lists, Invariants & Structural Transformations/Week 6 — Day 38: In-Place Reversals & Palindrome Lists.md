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

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **In-Place Linked List Reversal** redirects node reference pointers backward using 3 iterative pointers (`prev`, `curr`, `nextTemp`).
  - *Core Invariants:* 3-Pointer Invariant: At every step, preserve `nextTemp = curr.next`, redirect `curr.next = prev`, then shift `prev = curr` and `curr = nextTemp`; Palindrome Invariant: Reversing the second half allows lockstep comparison with the first half.
  - *Misconception Check:* Overwriting `curr.next = prev` before stashing `curr.next` severs the remaining list into an unrecoverable orphaned memory leak. Always save `nextTemp` first.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the need to copy list values into an array or allocate new reversed nodes.
  - *Complexity Advantage:* Reverses the list in $\Theta(N)$ time and strictly $O(1)$ auxiliary space.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Reverse Linked List" (LC 206), "Reverse Linked List II" (LC 92 — between $m$ and $n$), "Palindrome Linked List" (LC 234). Signal words: "reverse linked list in-place", "palindrome list in O(1) space".
  - *When to Avoid / Failure Modes:* When the list is shared across concurrent readers and mutating node references causes data race corruption.
- **4. WHERE:**
  - *Physical CLR Memory:* Pointers reside in CPU registers; in-place mutation rewires existing managed heap node references with zero GC allocations.
  - *Production Systems:* Undo/redo command history stacks, reversing packet routes in network path routing, reversing transaction logs.
- **5. WHO:**
  - *Spoken Script:* "To reverse a linked list in-place in $O(1)$ space, I maintain three pointers: prev, curr, and nextTemp. At each step, I stash curr.next into nextTemp, reverse curr.next to point to prev, and advance prev and curr forward. For palindrome lists, I find the midpoint with fast/slow, reverse the second half, and compare both halves."
  - *Interviewer Evaluation Lens:* Checks pointer preservation order, boundary condition when reversing subsegment $[m .. n]$, and restoring list structure post-palindrome check.
- **6. HOW:**
  - *Cost Model:* Time: $\Theta(N)$; Space: $O(1)$ auxiliary memory.
  - *State Transition Trace:* `1 -> 2 -> 3 -> null: curr=1, prev=null -> nextTemp=2, 1.next=null, prev=1, curr=2 -> nextTemp=3, 2.next=1, prev=2, curr=3 -> nextTemp=null, 3.next=2, prev=3, curr=null -> return prev (3)`.


### 1.1 Physical Mental Model: The Train Coupler Reversal & Mirrored Inspection

Reversing linked lists in $O(1)$ space without dropping nodes requires the discipline of a railway engineer uncoupling and flipping train cars:

```
       ======================================================================
         PHYSICAL ANALOGY: THE 3-HANDED TRAIN COUPLER DANCE
       ======================================================================

       DANGER: If you disconnect Car 1 before holding Car 2, Car 2 rolls down
       the mountain into the void! (Severed Reference Garbage Collection Bug).

       STEP 1: Hand 3 secures nextTemp = curr.next
       [Prev]         [Curr] -------------> [NextTemp] ---> [Car 3]
                        |                         ^
                        +--- Hand 3 holds here ---+

       STEP 2: Invert coupler: curr.next = prev
       [Prev] <-------- [Curr]               [NextTemp] ---> [Car 3]
                        |                         ^
                        +--- Coupler flipped -----+

       STEP 3: Advance prev = curr, curr = nextTemp
                        [Prev]               [Curr]    ---> [Car 3]
```

```
       ======================================================================
         PALINDROME DETECTION: SPLIT, FLIP, AND FACE-TO-FACE INSPECTION
       ======================================================================

       Original: [ 'R' -> 'A' -> 'D' -> 'A' -> 'R' -> null ]

       1. Fast-Slow Midpoint Split:
          Head 1: [ 'R' -> 'A' -> 'D' -> null ]
          Head 2: [ 'A' -> 'R' -> null ]

       2. Flip Head 2 in-place:
          Head 1: [ 'R' -> 'A' -> 'D' -> null ]
          Head 2: [ 'R' -> 'A' -> null ]

       3. Walk both heads forward side-by-side:
          'R' == 'R' (Match!)
          'A' == 'A' (Match!)
          Head 2 reaches null -> Symmetrical Palindrome confirmed!
```

```
       ======================================================================
           MEMORY LAYOUT & STACK VARIABLE REFERENCES
       ======================================================================

       Stack Frame:
       [ prev: 0x1000 ]   [ curr: 0x2000 ]   [ nextTemp: 0x3000 ]
             |                  |                     |
             v                  v                     v
       Heap Node A (0x1000) Heap Node B (0x2000) Heap Node C (0x3000)
       +--------+---------+ +--------+---------+ +--------+---------+
       | Val: 1 | Next: 0 | | Val: 2 | Next: A | | Val: 3 | Next: D |
       +--------+---------+ +--------+---------+ +--------+---------+
                                   ^
                                   |--- Coupler redirected backwards!
```

---

### 1.2 The Anatomy of Subsegment Reversal (Reverse Linked List II)

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

### 1.5 ⚙️ Core Operations Deep-Dive: Subsegment Reversals & Symmetric Fold Invariants

#### Dimension 1: Operation Contract & Big-O Bounds

##### Structural Operations (`ReverseBetween`, `IsPalindrome`, `ReorderList`)
- **Signatures:**
  - `public ListNode ReverseBetween(ListNode head, int left, int right)`: Reverses subsegment from index `left` to `right` (1-indexed) in-place.
  - `public bool IsPalindrome(ListNode head)`: Verifies reflective value equality without allocating auxiliary collections, restoring list structure upon completion.
  - `public void ReorderList(ListNode head)`: Folds list into $L_0 \to L_n \to L_1 \to L_{n-1} \dots$ pattern in-place.
- **Preconditions:**
  - $1 \le \text{left} \le \text{right} \le N$.
  - Acyclic singly linked list; nodes hold comparable primitive values.
- **Postconditions:**
  - `ReverseBetween`: Nodes outside $[\text{left}, \text{right}]$ remain in original positions; internal nodes reversed.
  - `IsPalindrome`: Caller's original linked list structure completely restored ($R(R(\text{tail})) = \text{tail}$); returns exact boolean verdict.
  - `ReorderList`: List transformed in-place; tail points to `null` with no cycles.
- **Complexity Bounds:**

| Operation | Time Complexity | Auxiliary Space | Pointer Rewirings | Mutation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **`ReverseBetween`** | $O(N)$ single pass | $O(1)$ | $\text{right} - \text{left}$ iterations | In-place head-insert |
| **`IsPalindrome`** | $O(N)$ ($2N$ node hops) | $O(1)$ | $2 \times$ reverse second half | Mutate $\to$ verify $\to$ restore |
| **`ReorderList`** | $O(N)$ ($1.5N$ hops) | $O(1)$ | Severing + reverse + zip | In-place interleave |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                       Subsegment Reversal `ReverseBetween`
                                       │
                      [dummy.next = head; prev = dummy]
                                       │
                    [Walk prev left - 1 steps forward]
                                       │
                                       ▼
                   [start = prev.next; then = start.next]
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 │
             [i < right - left?]                        │
                      │                                 │
           ┌──────────┴──────────┐                      │
          YES                    NO                     │
           │                     │                      │
  [start.next = then.next;       └──────────────► [Return dummy.next]
   then.next = prev.next;
   prev.next = then;
   then = start.next;
   i++]
           │
           └──► Loop back to [i < right - left?]
```

---

#### Dimension 3: Visual ASCII State Transitions

##### 1. Head-Insertion Subsegment Flipping (`left=2, right=4` for `[1, 2, 3, 4, 5]`)
```
Anchor: prev = [1], start = [2], then = [3]
Initial:  [dummy] ──► [1: prev] ──► [2: start] ──► [3: then] ──► [4] ──► [5]

Iteration 1 (Shift [3] in front of [2]):
  start.next = then.next   (2 -> 4)
  then.next = prev.next    (3 -> 2)
  prev.next = then         (1 -> 3)
  then = start.next        (then = 4)
State:    [dummy] ──► [1: prev] ──► [3] ──► [2: start] ──► [4: then] ──► [5]

Iteration 2 (Shift [4] in front of [3]):
  start.next = then.next   (2 -> 5)
  then.next = prev.next    (4 -> 3)
  prev.next = then         (1 -> 4)
  then = start.next        (then = 5)
State:    [dummy] ──► [1: prev] ──► [4] ──► [3] ──► [2: start] ──► [5]
Terminates (i = 2 == right - left). Entire range [2..4] reversed in-place!
```

##### 2. Reorder List: Alternating Zip Weaving
```
First Half (L1):  [1] ──► [2] ──► null
Second Half (L2): [4] ──► [3] ──► null

Step 1: Save anchors: l1Next = 1.next (2), l2Next = 4.next (3)
Step 2: Interleave:   1.next = 4; 4.next = l1Next (4 -> 2)
Step 3: Advance:      l1 = 2; l2 = 3
Result after hop 1:   [1] ──► [4] ──► [2] ──► null, l2 = [3]
Step 4: Interleave:   2.next = 3; 3.next = null
Final Weave:          [1] ──► [4] ──► [2] ──► [3] ──► null
```

---

#### Dimension 4: Invariant Preservation Proof

##### Theorem 1: Subsegment Reversal Loop Invariant
Let subsegment to reverse be $S = [v_{\text{left}}, \dots, v_{\text{right}}]$.
Let `prev` reference node $v_{\text{left}-1}$ and `start` reference $v_{\text{left}}$.
- **Loop Invariant:**
  At the beginning of iteration $k \in [0, \text{right} - \text{left}]$, the list topology satisfies:
  1. `prev.next` points to the head of the reversed prefix of size $k+1$.
  2. `start` remains fixed as the tail of the partially reversed prefix, pointing to $v_{\text{left} + k + 1}$.
  3. All nodes outside $[\text{left}, \text{right}]$ maintain their original connections.
- **Proof:**
  When inserting `then = start.next` between `prev` and `prev.next`, `then` becomes the new head of the reversed sublist, while `start.next` skips to `then.next`. The reversed segment expands by 1 node while keeping the outer prefix `prev` and unreversed suffix connected.
  After exactly $\text{right} - \text{left}$ iterations, the segment is completely inverted, and `start.next` holds $v_{\text{right}+1}$.

##### Theorem 2: Palindrome Restoration Idempotency
Let $L$ be a list of length $N$, partitioned at midpoint $M = \lfloor N/2 \rfloor$.
Let $L_2$ be the sublist starting at $M+1$.
1. **First Mutation:** $L_2' = \text{Reverse}(L_2)$.
   Value symmetry is verified by pointwise comparison:
   $$v_i == v_i' \quad \forall i \in [0, |L_2'| - 1]$$
2. **Restoration Invocation:** $L_2'' = \text{Reverse}(L_2')$.
   Since reversal of an acyclic singly linked list is an involution:
   $$\text{Reverse}(\text{Reverse}(S)) = S$$
   $L_2'' \equiv L_2$.
   Re-attaching $M.\text{next} = L_2''$ restores the exact initial pointer graph and memory state, preserving caller data integrity with zero side-effects.

---

#### Dimension 5: Edge Case Matrix

| Edge Case | State / Input | Algorithmic Behavior | Invariant Preservation |
| :--- | :--- | :--- | :--- |
| **`left == right`** | Range of length 1 | Loop `i < right - left` terminates at 0 iterations | No pointers modified; returns `head` in $O(1)$ |
| **Reversal From Head (`left == 1`)** | `prev` is `dummy` | Sentinel dummy receives newly rotated head via `dummy.next = then` | Eliminates special branching for head replacements |
| **Palindrome Single Element** | $N = 1$ | Fast/slow terminates immediately; second half is `null` | Returns `true` in $O(1)$ |
| **Two Elements Identical** | `[1, 1]` | Midpoint is node 1; second half `[1]` reversed to `[1]`; match | Returns `true`; restored cleanly |
| **Two Elements Different** | `[1, 2]` | Node values $1 \ne 2$; comparison mismatch detected | Restores second half; returns `false` |
| **Odd-Length Palindrome** | `[1, 2, 1]` | `fast.next != null` leaves `slow` at center; second half starts at center.next | Center node remains in first half; symmetry holds |

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
