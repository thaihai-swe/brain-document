---
title: "Week 7 — Day 44: High-Performance List Arithmetic"
---

# 🚀 Week 7 — Day 44: High-Performance List Arithmetic

In **Day 43**, we tackled complex arbitrary pointer networks using the 3-pass node interleaving technique and flattened multilevel child branches.

Today, we explore **Arbitrary-Precision Arithmetic on Linked Lists**:
1. **The BigInteger Paradigm:** Overcoming hardware primitive limits (`long.MaxValue` $\approx 9.22 \times 10^{18}$) by modeling unbounded precision numbers as digit chains.
2. **Endianness & Digit Ordering:**
   - **Little-Endian (Reverse Order) — [LeetCode 2]:** Least significant digit first $\implies$ natural alignment with forward pointer traversal.
   - **Big-Endian (Natural Order) — [LeetCode 445]:** Most significant digit first $\implies$ the unequal length misalignment dilemma.
3. **Non-Destructive Traversal:** Performing addition when input lists are immutable (read-only or shared across threads) without reversing in-place.
4. **The Rightmost Non-9 Fast Forward Trick ([LeetCode 369]):** Single-pass addition of 1 in strictly $O(1)$ space.

---

## 1. 🧠 TEACH: Concept & Invariants

### 1.1 Why Linked Lists for Big Integer Arithmetic?

In production financial engines, public-key cryptography (RSA 2048/4096-bit primes), and scientific computing, numbers often have thousands of decimal digits. 
- A 32-bit `int` overflows at $2,147,483,647$ (10 digits).
- A 64-bit `long` overflows at $9,223,372,036,854,775,807$ (19 digits).

A linked list provides dynamic, heap-allocated arbitrary precision: each node stores a single digit $d \in [0 \dots 9]$ (or a base-$10^9$ block for high-throughput vectorized operations).

---

### 1.2 Reverse Order (Little-Endian) Addition ([LeetCode 2])

In **LeetCode 2**, digits are stored in **reverse order**:
$$\text{List: } 2 \to 4 \to 3 \implies 342$$
$$\text{List: } 5 \to 6 \to 4 \implies 465$$

```
   10^0   10^1   10^2
    (2) ──► (4) ──► (3)    = 342
  + (5) ──► (6) ──► (4)    = 465
  ──────────────────────
    (7) ──► (0) ──► (8)    = 807
```

#### Why This Is Trivial:
1. The heads of both lists represent the **ones place** ($10^0$).
2. Traversal via `.next` moves simultaneously to higher powers of 10 ($10^1, 10^2, \dots$).
3. Any arithmetic carry generated at step $k$ ($carry = sum / 10$) naturally propagates directly into the addition at step $k+1$!

#### ⚠️ The Catastrophic Trailing Carry Bug:
Consider:
$$\text{List 1: } 9 \to 9 \implies 99$$
$$\text{List 2: } 1 \implies 1$$
$$99 + 1 = 100 \implies 0 \to 0 \to 1$$

- Step 1: $9 + 1 = 10 \implies val = 0, carry = 1$.
- Step 2: $9 + 0 + carry(1) = 10 \implies val = 0, carry = 1$.
- Both lists are now exhausted (`l1 == null && l2 == null`)!
- If your loop condition is simply `while (l1 != null || l2 != null)`, the loop terminates, and you return $0 \to 0$ ($0$ instead of $100$)!

#### The Unified Loop Invariant:
$$\mathbf{\text{while } (l1 \ne \text{null } || \ l2 \ne \text{null } || \ \text{carry } \ne 0)}$$
By including `carry != 0` directly in the loop header, the loop automatically runs one final iteration when both lists are exhausted, appending the final carry node!

---

### 1.3 Natural Order (Big-Endian) Addition ([LeetCode 445])

In **LeetCode 445**, digits are stored in **natural order**:
$$\text{List 1: } 7 \to 2 \to 4 \to 3 \implies 7243$$
$$\text{List 2: } 5 \to 6 \to 4 \implies 564$$

```
    (7) ──► (2) ──► (4) ──► (3)    (Length = 4)
  +         (5) ──► (6) ──► (4)    (Length = 3)
  ──────────────────────────────
    (7) ──► (8) ──► (0) ──► (7)    = 7807
```

#### The Misalignment Problem:
- The head of List 1 is $7 \times 10^3$ (thousands place).
- The head of List 2 is $5 \times 10^2$ (hundreds place).
- You cannot add the heads directly ($7 + 5 \ne 12$)!
- Addition must begin at the **tails** (least significant digits), but singly linked lists cannot traverse backwards!

#### Three Candidate Approaches:

| Approach | Time | Space | Constraints / Drawbacks |
| :--- | :---: | :---: | :--- |
| **1. In-Place Reversal** | $O(N)$ | $O(1)$ | Mutates the input. **Prohibited** if interview specifies lists are read-only or shared across threads! |
| **2. Recursive Length Alignment** | $O(N)$ | $O(N)$ | Compute lengths $L_1, L_2$. Pad with virtual zeros. Recurse to tails, unwind while returning `carry`. Complex implementation. |
| **3. Dual Explicit Stacks** | $O(N)$ | $O(N)$ | **Optimal for Interviews:** Push digits to `Stack<int>`. Popping gives reverse order. Build output list from tail to head via head-prepending! |

---

### 1.4 Interview Spoken Drill (20–30 Seconds)

> *"When adding two numbers represented by linked lists in reverse order, both lists are already aligned by the least significant digit, so I process them in a single pass with a dummy sentinel using the loop condition `while (l1 != null || l2 != null || carry != 0)`. The `carry != 0` guard ensures an extra node is created if a trailing carry overflows the most significant place. If digits are in natural forward order and input mutation is prohibited, I push all digits onto two auxiliary stacks to reverse their order in LIFO fashion, popping and prepending nodes to the result list while propagating the carry."*

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

### 2.1 [LeetCode 2] Add Two Numbers (Reverse Order)

You are given two non-empty linked lists representing two non-negative integers. The digits are stored in **reverse order**, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

#### Production C# Implementation:

```csharp
public class SolutionAddTwoNumbers {
    /// <summary>
    /// Adds two numbers represented by reverse-order linked lists.
    /// Time Complexity: O(max(N, M))
    /// Space Complexity: O(max(N, M)) for the output list; O(1) auxiliary overhead.
    /// </summary>
    public ListNode AddTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        int carry = 0;

        // Loop continues as long as there is an unconsumed digit OR an active carry
        while (l1 != null || l2 != null || carry != 0) {
            int sum = carry;

            if (l1 != null) {
                sum += l1.val;
                l1 = l1.next;
            }

            if (l2 != null) {
                sum += l2.val;
                l2 = l2.next;
            }

            carry = sum / 10;
            curr.next = new ListNode(sum % 10);
            curr = curr.next;
        }

        return dummy.next;
    }
}
```

#### Visual Trace on `l1 = [9, 9]`, `l2 = [1]`:
```
Initial: dummy -> null, carry = 0

Iteration 1:
  sum = 0 (carry) + 9 (l1) + 1 (l2) = 10
  carry = 1, sum % 10 = 0
  dummy -> [0]
  l1 = l1.next (node 9), l2 = null

Iteration 2:
  sum = 1 (carry) + 9 (l1) + 0 = 10
  carry = 1, sum % 10 = 0
  dummy -> [0] -> [0]
  l1 = null, l2 = null

Iteration 3:
  l1 == null, l2 == null, BUT carry == 1!
  sum = 1 (carry) + 0 + 0 = 1
  carry = 0, sum % 10 = 1
  dummy -> [0] -> [0] -> [1]

Result: [0] -> [0] -> [1]  (100 in reverse order = 99 + 1!)
```

#### Complexity Analysis:
- **Time Complexity:** $O(\max(N, M))$ — We iterate at most $\max(N, M) + 1$ times.
- **Space Complexity:** $O(\max(N, M))$ to allocate the result list; $O(1)$ auxiliary memory.

---

### 2.2 [LeetCode 445] Add Two Numbers II (Natural Order without Mutation)

You are given two non-empty linked lists representing two non-negative integers. The most significant digit comes first and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list. **You cannot modify the input lists.**

#### The Prepending Pattern (Tail-to-Head Construction):
Instead of building forward with a dummy node and having to reverse the result at the end, we prepend each new node to the front of `resultHead`:
```csharp
ListNode resultHead = null;
...
ListNode newNode = new ListNode(val);
newNode.next = resultHead;
resultHead = newNode;
```

#### Production C# Implementation:

```csharp
public class SolutionAddTwoNumbersII {
    /// <summary>
    /// Adds two numbers represented in natural order without mutating inputs,
    /// using dual stacks to process digits least-significant-first.
    /// Time Complexity: O(N + M)
    /// Space Complexity: O(N + M) auxiliary space for the stacks.
    /// </summary>
    public ListNode AddTwoNumbers(ListNode l1, ListNode l2) {
        var s1 = new Stack<int>();
        var s2 = new Stack<int>();

        // Step 1: Push all digits to stacks
        ListNode curr1 = l1;
        while (curr1 != null) {
            s1.Push(curr1.val);
            curr1 = curr1.next;
        }

        ListNode curr2 = l2;
        while (curr2 != null) {
            s2.Push(curr2.val);
            curr2 = curr2.next;
        }

        ListNode resultHead = null;
        int carry = 0;

        // Step 2: Pop digits from least significant to most significant
        while (s1.Count > 0 || s2.Count > 0 || carry != 0) {
            int sum = carry;

            if (s1.Count > 0) {
                sum += s1.Pop();
            }

            if (s2.Count > 0) {
                sum += s2.Pop();
            }

            carry = sum / 10;

            // Prepend new node directly to the result head
            ListNode newNode = new ListNode(sum % 10);
            newNode.next = resultHead;
            resultHead = newNode;
        }

        return resultHead;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N + M)$ — Traversing `l1` and `l2` to push to stacks takes $O(N + M)$; popping and creating nodes takes $O(\max(N, M))$.
- **Space Complexity:** $O(N + M)$ auxiliary stack memory.

---

### 2.3 [LeetCode 369] Plus One Linked List ($O(1)$ Extra Space Trick)

Given a non-negative integer represented as a linked list of digits in **natural order**, plus one to the integer.

#### The Intuition:
Consider adding 1:
- $123 + 1 = 124$ (only the last digit changes).
- $129 + 1 = 130$ (the 9 becomes 0, the digit before it increments).
- $199 + 1 = 200$ (all trailing 9s become 0, the digit before them increments).
- $999 + 1 = 1000$ (a new digit 1 must be prepended, all 9s become 0).

#### The Rightmost Non-9 Two-Pointer Pattern:
Find the **last (rightmost) node whose value is not 9**:
1. Place a sentinel dummy node before head: `dummy = new ListNode(0, head)`.
2. Maintain `notNine = dummy`.
3. Scan through the list with `curr`: whenever `curr.val != 9`, update `notNine = curr`.
4. Increment `notNine.val++`.
5. Set all nodes after `notNine` to `0`!
6. If `dummy.val == 1`, return `dummy` (e.g. $999 \to 1000$); otherwise return `dummy.next`!

```
List: dummy(0) ──► 1 ──► 9 ──► 9 ──► null
                   ▲
                notNine (last node != 9)

1. notNine.val++: 1 becomes 2
2. Set all nodes after notNine to 0:
   dummy(0) ──► 2 ──► 0 ──► 0 ──► null
3. dummy.val == 0 -> return dummy.next = Node 2! Result: 200!
```

#### Production C# Implementation:

```csharp
public class SolutionPlusOne {
    /// <summary>
    /// Adds one to a linked list representing a natural-order integer in O(N) time
    /// and strict O(1) auxiliary space.
    /// </summary>
    public ListNode PlusOne(ListNode head) {
        ListNode dummy = new ListNode(0, head);
        ListNode notNine = dummy;
        ListNode curr = head;

        // Step 1: Locate the rightmost node that is not equal to 9
        while (curr != null) {
            if (curr.val != 9) {
                notNine = curr;
            }
            curr = curr.next;
        }

        // Step 2: Increment the rightmost non-9 node
        notNine.val++;

        // Step 3: All trailing nodes that were 9 must rollover to 0
        curr = notNine.next;
        while (curr != null) {
            curr.val = 0;
            curr = curr.next;
        }

        // If dummy was incremented from 0 to 1 (e.g. 999 -> 1000), dummy is the new head
        return (dummy.val == 1) ? dummy : dummy.next;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — Single pass to find `notNine`, and at most one partial pass to set trailing 9s to 0.
- **Space Complexity:** **Strictly $O(1)$** — Only two reference pointers (`notNine`, `curr`) and one sentinel dummy node.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master high-performance list arithmetic on LeetCode:

### Problem 1 (Reverse Order Carry Propagation): LeetCode 2 — Add Two Numbers (Medium)
- **Goal:** Implement the single-pass addition with dummy node and `carry != 0` loop guard.
- **Target Complexity:** $O(\max(N, M))$ time, $O(1)$ auxiliary space.

### Problem 2 (Immutable Natural Order): LeetCode 445 — Add Two Numbers II (Medium)
- **Goal:** Implement non-destructive addition using dual stacks and head prepending.
- **Target Complexity:** $O(N + M)$ time, $O(N + M)$ space.

### Problem 3 (Rightmost Non-9 Pattern): LeetCode 369 — Plus One Linked List (Medium)
- **Goal:** Implement the $O(1)$ space two-pointer rollover trick.
- **Target Complexity:** $O(N)$ time, strictly $O(1)$ auxiliary space.

### Bonus / Extension Challenge: LeetCode 43 — Multiply Strings (Medium)
- **Goal:** Implement arbitrary-precision multiplication of two numbers represented as strings.
- **Hint:** An array of size $M + N$ accumulates products: `pos[i + j + 1] += d1 * d2`.

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                   List Arithmetic Pattern Decision Tree                │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Digits stored in Reverse Order (Little-Endian)?
                   │   └─► Single-Pass Dummy + (l1 != null || l2 != null || carry != 0) [LC 2]
                   │
                   ├─► Digits stored in Natural Order (Big-Endian)?
                   │   ├─► Mutation allowed? ────────► Reverse both -> Add -> Reverse result
                   │   └─► Mutation NOT allowed? ────► Dual Stacks + Prepend to Head [LC 445]
                   │
                   ├─► Special Case: Adding 1 to Natural Order List?
                   │   └─► Two-Pointer Rightmost Non-9 Trick (Strict O(1) Space) [LC 369]
                   │
                   └─► Merging K independent sorted lists into one?
                       └─► K-Way Merge (Day 45) [LC 23]
```

### Preview for Day 45: $K$-Way Merge of Linked Lists
Tomorrow in **Day 45**, we scale from merging two lists to **merging $K$ sorted lists**:
- **[LeetCode 23] Merge k Sorted Lists:** Comparing the **Min-Heap / PriorityQueue approach** ($O(N \log K)$ time, $O(K)$ space) against the **Divide-and-Conquer pairwise merge approach** ($O(N \log K)$ time, $O(\log K)$ recursion space).
- We will benchmark why Divide-and-Conquer exhibits superior cache locality and fewer heap allocations in C# than a PriorityQueue.

---

## 5. 🎯 Day 44 Checkpoint Questions

Verify your mastery of linked list arithmetic and carry invariants:

1. **The Trailing Carry Bug:** In LeetCode 2, what exact failure occurs if the loop condition is `while (l1 != null || l2 != null)` instead of `while (l1 != null || l2 != null || carry != 0)` on the input `[5] + [5]`?
2. **Prepending Invariant:** In LeetCode 445, why does `newNode.next = resultHead; resultHead = newNode;` build the list in correct forward order without requiring a subsequent reversal?
3. **Rightmost Non-9 Correctness:** In LeetCode 369, why does setting every node after `notNine` to `0` guarantee mathematical correctness? Could any node after `notNine` ever have a value other than `9`?
4. **Memory Footprint Trade-off:** Compare the auxiliary memory footprint of adding two 1,000-digit numbers using LeetCode 445's dual stacks vs. mutating the list in-place by reversing it twice.
