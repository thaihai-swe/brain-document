---
title: "Week 6 — Day 36: Memory Architecture, Pointer Chasing, The Sentinel Dummy Node & From-Scratch Singly Linked List"
---

Welcome to **Week 6** and the start of **Phase 2 (Linear Abstract Data Types & Pointer Networks)**!

Over the past 5 weeks (Days 1–35), we operated primarily on contiguous arrays and flat memory buffers where CPU cache lines provided automatic prefetching and $O(1)$ arithmetic indexing.

Today, we cross the threshold into **Node-Pointer Heap Architectures**:
1. **The Physical Reality of Linked Memory:** Managed heap allocations, pointer chasing latency, CPU cache misses, and the 32-byte object overhead paradox in 64-bit .NET.
2. **From-Scratch Singly Linked List Container (`SinglyLinkedList<T>`):** Building a production-grade generic linked list container in C# with a permanent **Sentinel Dummy Node Invariant**, tail-pointer tracking, reference loitering prevention, and fail-fast enumerator.
3. **The Sentinel Invariant:** Proving how dummy head nodes eliminate all edge-case branching during head deletions and empty list operations.
4. **The Iterative 3-Pointer Reversal Invariant:** Coordinating `prev`, `curr`, and `nextTemp` to reverse pointer directions in $O(N)$ time and strict $O(1)$ auxiliary space.
5. **Canonical Problem Walkthroughs:** Deep-dive derivations for **LeetCode 206 (Reverse Linked List)**, **LeetCode 203 (Remove Linked List Elements)**, and **LeetCode 21 (Merge Two Sorted Lists)**.

---

## 1. 🧠 TEACH: Heap Memory Realities, Pointer Chasing & Sentinel Nodes

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* A **Singly Linked List** is a linear collection of independently allocated nodes where each node contains a value and a single forward reference pointer (`next`).
  - *Core Invariants:* Sentinel Anchor Invariant: `dummy.next = head` anchors the collection, guaranteeing that every real node (including the original head) always has a valid non-null predecessor; Sequential Reachability: Node $k$ can only be accessed by traversing $k-1$ sequential pointers from head.
  - *Misconception Check:* Inserting into a linked list is *not* universally $O(1)$; it is only $O(1)$ *if you already hold a direct pointer to the predecessor node*. Finding an element or index requires an $O(N)$ linear walk.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(N)$ element memory-shifting cost of array insertions and head deletions.
  - *Complexity Advantage:* Provides strict, predictable worst-case $\Theta(1)$ insertions and deletions at boundaries without buffer reallocation spikes.
- **3. WHEN:**
  - *When to Choose / Signal Words:* Frequent head insertions/deletions, unknown collection size with gradual allocations, composite architectures requiring $O(1)$ node detachment (LRU cache). Signal words: "remove linked list elements", "delete node in list", "sentinel dummy node".
  - *When to Avoid / Failure Modes:* High-frequency random index lookups ($O(N)$ vs array $O(1)$), binary search (cannot locate midpoint in $O(1)$), memory-constrained environments where 24–32B per-node CLR overhead and CPU cache misses degrade performance.
- **4. WHERE:**
  - *Physical CLR Memory:* 64-bit .NET object heap: 8-byte `Object Header` + 8-byte `MethodTable Pointer` + `T` value payload (e.g. 4B `int` + 4B padding) + 8-byte `next` reference $= 24–32$ bytes per node. Pointer chasing across disconnected heap pages causes high L1/L2 data cache misses (~25–40%).
  - *Production Systems:* Operating system free memory block freelists, garbage collector finalization queues, lock-free concurrent queue primitives (Michael-Scott queue).
- **5. WHO:**
  - *Spoken Script:* "In linked lists, I prepend a sentinel dummy node pointing to the head. This guarantees the head node always has a valid predecessor, completely eliminating null-head edge cases during insertions, deletions, and merges."
  - *Interviewer Evaluation Lens:* Checks candidate's usage of sentinel nodes to avoid special-case branching, handling of empty lists, and prevention of severed reference leaks.
- **6. HOW:**
  - *Cost Model:* Access/Search: $O(N)$; Prepend: $O(1)$; Append with tail: $O(1)$; Delete after pointer: $O(1)$; Space: $O(N)$ node heap memory.
  - *State Transition Trace (Delete Val):* `dummy.next = head; curr = dummy; while (curr.next != null) { if (curr.next.val == val) curr.next = curr.next.next; else curr = curr.next; } return dummy.next;`.

### ⚖️ Architectural Comparison: Array vs. Linked List (The Fundamental Memory Divide)
| Evaluation Metric | Array / Dynamic Array (`List<T>`) | Singly Linked List | Doubly Linked List |
| :--- | :--- | :--- | :--- |
| **Physical Memory Layout** | **Contiguous** block of memory on heap/stack | **Scattered** individual heap nodes | **Scattered** individual heap nodes |
| **Random Access `[i]`** | $\mathbf{\Theta(1)}$ direct address calculation | $\Theta(N)$ sequential pointer walk | $\Theta(N)$ sequential pointer walk |
| **CPU Cache Locality** | **Maximum (Spatial & Temporal):** Contiguous elements fill 64-byte cache lines; hardware prefetcher pre-loads adjacent data | **Poor:** Each node access dereferences an arbitrary pointer, causing frequent L1/L2/L3 cache misses | **Poor:** Double pointer dereferencing causes CPU pipeline stalls and cache line thrashing |
| **Insert / Delete at Head** | $\Theta(N)$ (requires shifting all subsequent elements right/left) | $\mathbf{\Theta(1)}$ (rewire `head` reference) | $\mathbf{\Theta(1)}$ (rewire `head` and sentinel references) |
| **Insert at Tail** | **Amortized $\Theta(1)$** ($\Theta(N)$ when reallocation buffer doubles) | $\Theta(1)$ with cached `tail` pointer | $\Theta(1)$ with cached `tail` pointer |
| **Insert / Delete in Middle** | $\Theta(N)$ memory move / copy overhead | $\Theta(1)$ rewiring *once pointer is at position* ($\Theta(N)$ to find position) | $\Theta(1)$ rewiring *once node reference is known* |
| **Memory Overhead per Element** | **0 bytes** overhead for primitive value types | **16 to 24 bytes** in 64-bit CLR (Object Header + TypeHandle + Next pointer) | **24 to 32 bytes** in 64-bit CLR (Header + TypeHandle + Next + Prev) |
| **Resizing Behavior** | Allocates new buffer ($1.5\times$ or $2\times$), copies memory, discards old buffer | Smooth, incremental per-node allocation on demand | Smooth, incremental per-node allocation on demand |
| **Garbage Collector Impact** | Low GC pressure (single array object) | **High GC pressure** (thousands of isolated node objects to trace/collect) | **High GC pressure** (higher reference density increases GC mark phase duration) |
| **Best Used When** | Frequent reads, index lookups, batch processing, known size, cache efficiency | Frequent head insertions/removals, unknown size, strict $O(1)$ memory guarantees | LRU Cache implementation (with HashMap), bidirectional browser history |

---

### 1.1 Physical Memory Model: Array Locality vs. Pointer Chasing

To truly master linked lists, you must understand what happens inside the CPU hardware when traversing nodes versus arrays:

```
Array in RAM (Contiguous Memory):
Address:   0x1000  0x1004  0x1008  0x100C  0x1010
Values:  [   10,     20,     30,     40,     50   ]
           ▲
           CPU fetches 64-byte cache line -> ALL 5 elements loaded into L1 cache!
           Accessing next element = 1 nanosecond (Cache Hit).

Linked List in Managed Heap (Fragmented Memory):
Node 1: Address 0x1040 [ Val: 10 | Next: 0x8520 ] ──┐
                                                    │ Pointer dereference
Node 2: Address 0x8520 [ Val: 20 | Next: 0x3100 ] ◄─┘ (Jump across heap pages!)
                                                    │ Pointer dereference
Node 3: Address 0x3100 [ Val: 30 | Next: null   ] ◄─┘
```

#### The Hardware Penalty of "Pointer Chasing":
- **Spatial Locality Failure:** Linked list nodes are allocated dynamically on the heap at arbitrary virtual memory addresses.
- **Cache Misses & TLB Thrashing:** When the CPU reads `curr.next`, the target address is rarely in the CPU L1 or L2 cache. The CPU pipeline must stall while fetching the node from L3 cache or main RAM (~50–100ns latency).
- **The Memory Overhead Paradox in C#:**
  - In a 64-bit .NET runtime, a `class ListNode` has:
    - 8 bytes: Object Header (SyncBlockIndex)
    - 8 bytes: Method Table Pointer (TypeHandle)
    - 4 bytes: `int val`
    - 4 bytes: Padding / Memory Alignment
    - 8 bytes: `ListNode next` reference pointer
  - **Total:** **32 bytes on the heap** to store a single 4-byte integer! (An array uses just 4 bytes per integer).

---

### 1.2 Reference Semantics & Garbage Collection in C#

In C#, `ListNode` is a **reference type** (`class`).

```csharp
public class ListNode {
    public int val;
    public ListNode next;
    public ListNode(int val = 0, ListNode next = null) {
        this.val = val;
        this.next = next;
    }
}
```

- When you assign `ListNode p = head;`, you are **not copying the node**. You are copying an 8-byte pointer reference pointing to the exact same heap memory object.
- **Deleting a Node in C#:**
  - You do not manually `free()` or `delete` memory.
  - To delete a node, you simply bypass its pointer: `prev.next = curr.next;`.
  - Once no active GC roots (local variables, static fields, or reachable node references) point to `curr`, the .NET Garbage Collector will automatically reclaim its memory during a Gen 0 collection.
  - **Reference Unlinking:** When removing nodes in custom containers, setting `removedNode.next = null` ensures the detached node does not hold references to subsequent nodes in the chain.

---

### 1.3 The Sentinel Dummy Node Invariant (The Anti-Edge-Case Weapon)

In naive linked list implementations, code is riddled with fragile edge-case checks:
- *"What if the head node itself needs to be deleted?"*
- *"What if the list is empty (`head == null`)?"*
- *"What if the new node must be inserted before the head?"*

Without a sentinel node, modifying the head requires updating the variable `head` directly, forcing you to write separate branching paths for `head` versus internal nodes:

```csharp
// ⚠️ CLUNKY NAIVE CODE (Fragile & Branch-Heavy):
while (head != null && head.val == target) {
    head = head.next; // Special case for head deletion
}
ListNode curr = head;
while (curr != null && curr.next != null) {
    if (curr.next.val == target) {
        curr.next = curr.next.next; // Standard internal deletion
    } else {
        curr = curr.next;
    }
}
return head;
```

#### The Universal Solution: The Sentinel Dummy Node
Create a dummy node that precedes the actual head:

$$\mathbf{\text{ListNode dummy} = \text{new ListNode}(0, \text{head})}$$

```
                dummy                   head (Original)
               ┌───────────┐           ┌───────────┐           ┌───────────┐
Memory:        │ Val: 0    │ ───────►  │ Val: 10   │ ───────►  │ Val: 20   │
               │ Next: ────┼┐          │ Next: ────┼┐          │ Next: null│
               └───────────┘│          └───────────┘│          └───────────┘
                            └───────────────────────┘
```

#### The Power of the Invariant:
1. **Uniformity:** Every node in the original list (including the original `head`) now has a guaranteed preceding predecessor (`dummy` or another node).
2. **Head Modification Safety:** Even if the first 5 nodes are deleted or reordered, `dummy.next` will always point to the new, true head of the list!
3. **Clean Return:** At the end of the function, simply return $\mathbf{dummy.next}$.

---

### 1.4 The Iterative 3-Pointer Reversal Invariant

Reversing a linked list in-place in $O(N)$ time and $O(1)$ space requires coordinating three pointers:
- `prev`: The head of the already-reversed sublist (starts at `null`).
- `curr`: The node currently being flipped (starts at `head`).
- `nextTemp`: A temporary anchor holding the reference to the rest of the unreversed list.

```
State at step i:
   Already Reversed           Currently Flipping             Unprocessed
  [ Node A ] ◄── [ Node B ]        [ Node C ]        ──►     [ Node D ] ──► ...
       ▲                               ▲                         ▲
      prev                            curr                    nextTemp
```

#### The 4-Step Invariant Loop:
1. `nextTemp = curr.next;` $\implies$ **Anchor:** Save the forward link before severing it!
2. `curr.next = prev;`     $\implies$ **Rewire:** Flip current node's pointer backward to `prev`.
3. `prev = curr;`          $\implies$ **Advance Prev:** Current node becomes the new head of the reversed portion.
4. `curr = nextTemp;`      $\implies$ **Advance Curr:** Move to the next unprocessed node.

When `curr == null`, the loop terminates. `prev` points directly to the new head of the completely reversed list!

---

### 1.5 Interview Spoken Drill (20–30 Seconds)

> *"To eliminate head modification edge cases, I create a sentinel dummy node whose next pointer references the head. This guarantees that every node in the list, including the original head, has a valid predecessor. When reversing a list in-place, I maintain three pointers: prev, curr, and a temporary next reference. In each step, I save curr.next, flip the pointer backward to prev, and advance both pointers. This runs in $O(N)$ time with strictly $O(1)$ auxiliary space."*

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Singly Linked List

### 2.1 Complete C# Implementation (`SinglyLinkedList<T>`)

```csharp
using System;
using System.Collections;
using System.Collections.Generic;

/// <summary>
/// A node in a singly linked list.
/// </summary>
public class SinglyLinkedListNode<T> {
    public T Value;
    public SinglyLinkedListNode<T>? Next;

    public SinglyLinkedListNode(T value, SinglyLinkedListNode<T>? next = null) {
        Value = value;
        Next = next;
    }
}

/// <summary>
/// A production-grade generic singly linked list container implemented from scratch in C#.
/// Features a permanent Sentinel Dummy Head Node invariant, tail-pointer tracking,
/// fail-fast version iteration, and GC reference unlinking.
/// </summary>
public class SinglyLinkedList<T> : IEnumerable<T> {
    // Permanent sentinel node: _sentinel.Next is the actual first element of the list.
    private readonly SinglyLinkedListNode<T> _sentinel;
    private SinglyLinkedListNode<T> _tail;
    private int _count;
    private int _version;

    public SinglyLinkedList() {
        _sentinel = new SinglyLinkedListNode<T>(default!);
        _tail = _sentinel;
        _count = 0;
        _version = 0;
    }

    /// <summary>
    /// Gets the number of elements contained in the linked list.
    /// Time Complexity: O(1).
    /// </summary>
    public int Count => _count;

    /// <summary>
    /// Gets a value indicating whether the linked list is empty.
    /// </summary>
    public bool IsEmpty => _count == 0;

    /// <summary>
    /// Gets or sets the value at the specified zero-based index.
    /// Time Complexity: O(index) where index <= N.
    /// </summary>
    public T this[int index] {
        get {
            var node = GetNodeAt(index);
            return node.Value;
        }
        set {
            var node = GetNodeAt(index);
            node.Value = value;
            _version++;
        }
    }

    /// <summary>
    /// Inserts an element at the beginning of the list.
    /// Time Complexity: Strictly O(1).
    /// </summary>
    public void AddFirst(T item) {
        var newNode = new SinglyLinkedListNode<T>(item, _sentinel.Next);
        _sentinel.Next = newNode;

        // If list was previously empty, tail must point to the new node
        if (_tail == _sentinel) {
            _tail = newNode;
        }

        _count++;
        _version++;
    }

    /// <summary>
    /// Appends an element to the end of the list.
    /// Time Complexity: Strictly O(1) via cached tail pointer.
    /// </summary>
    public void AddLast(T item) {
        var newNode = new SinglyLinkedListNode<T>(item);
        _tail.Next = newNode;
        _tail = newNode;

        _count++;
        _version++;
    }

    /// <summary>
    /// Inserts an element at the specified zero-based index.
    /// Time Complexity: O(index).
    /// </summary>
    public void InsertAt(int index, T item) {
        if ((uint)index > (uint)_count) {
            throw new ArgumentOutOfRangeException(nameof(index), $"Index must be between 0 and {_count}.");
        }

        if (index == 0) {
            AddFirst(item);
            return;
        }

        if (index == _count) {
            AddLast(item);
            return;
        }

        // Walk to predecessor at (index - 1)
        var prev = _sentinel;
        for (int i = 0; i < index; i++) {
            prev = prev.Next!;
        }

        var newNode = new SinglyLinkedListNode<T>(item, prev.Next);
        prev.Next = newNode;

        _count++;
        _version++;
    }

    /// <summary>
    /// Removes and returns the first element of the list.
    /// Time Complexity: Strictly O(1).
    /// </summary>
    public T RemoveFirst() {
        if (IsEmpty) {
            throw new InvalidOperationException("The linked list is empty.");
        }

        var firstNode = _sentinel.Next!;
        _sentinel.Next = firstNode.Next;

        // If list became empty, reset tail to sentinel
        if (_tail == firstNode) {
            _tail = _sentinel;
        }

        _count--;
        _version++;

        T value = firstNode.Value;
        firstNode.Next = null; // Prevent reference loitering
        return value;
    }

    /// <summary>
    /// Removes and returns the last element of the list.
    /// Time Complexity: O(N) because finding the node before tail requires linear walk.
    /// </summary>
    public T RemoveLast() {
        if (IsEmpty) {
            throw new InvalidOperationException("The linked list is empty.");
        }

        return RemoveAtInternal(_count - 1);
    }

    /// <summary>
    /// Removes the element at the specified zero-based index.
    /// Time Complexity: O(index).
    /// </summary>
    public void RemoveAt(int index) {
        ValidateIndex(index);
        RemoveAtInternal(index);
    }

    private T RemoveAtInternal(int index) {
        var prev = _sentinel;
        for (int i = 0; i < index; i++) {
            prev = prev.Next!;
        }

        var target = prev.Next!;
        prev.Next = target.Next;

        if (_tail == target) {
            _tail = prev;
        }

        _count--;
        _version++;

        T value = target.Value;
        target.Next = null; // Unlink node for GC
        return value;
    }

    /// <summary>
    /// Removes the first occurrence of a specific value from the list.
    /// Time Complexity: O(N).
    /// </summary>
    public bool Remove(T item) {
        var comparer = EqualityComparer<T>.Default;
        var prev = _sentinel;

        while (prev.Next != null) {
            if (comparer.Equals(prev.Next.Value, item)) {
                var target = prev.Next;
                prev.Next = target.Next;

                if (_tail == target) {
                    _tail = prev;
                }

                _count--;
                _version++;

                target.Next = null;
                return true;
            }
            prev = prev.Next;
        }

        return false;
    }

    /// <summary>
    /// Determines whether an element is in the linked list.
    /// </summary>
    public bool Contains(T item) => IndexOf(item) >= 0;

    /// <summary>
    /// Searches for the specified value and returns the zero-based index of the first occurrence.
    /// </summary>
    public int IndexOf(T item) {
        var comparer = EqualityComparer<T>.Default;
        var curr = _sentinel.Next;
        int index = 0;

        while (curr != null) {
            if (comparer.Equals(curr.Value, item)) {
                return index;
            }
            curr = curr.Next;
            index++;
        }

        return -1;
    }

    /// <summary>
    /// Removes all nodes from the list.
    /// </summary>
    public void Clear() {
        // Sever all forward pointers to assist GC
        var curr = _sentinel.Next;
        while (curr != null) {
            var next = curr.Next;
            curr.Next = null;
            curr = next;
        }

        _sentinel.Next = null;
        _tail = _sentinel;
        _count = 0;
        _version++;
    }

    private SinglyLinkedListNode<T> GetNodeAt(int index) {
        ValidateIndex(index);
        var curr = _sentinel.Next!;
        for (int i = 0; i < index; i++) {
            curr = curr.Next!;
        }
        return curr;
    }

    private void ValidateIndex(int index) {
        if ((uint)index >= (uint)_count) {
            throw new ArgumentOutOfRangeException(nameof(index), $"Index {index} out of range [0, {_count - 1}].");
        }
    }

    /// <summary>
    /// Returns an enumerator that iterates through the linked list with fail-fast version checking.
    /// </summary>
    public IEnumerator<T> GetEnumerator() {
        int capturedVersion = _version;
        var curr = _sentinel.Next;

        while (curr != null) {
            if (capturedVersion != _version) {
                throw new InvalidOperationException("Collection was modified during enumeration.");
            }
            yield return curr.Value;
            curr = curr.Next;
        }
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}
```

---

### 2.2 Visual Invariant Traces

#### Trace 1: `AddFirst("B")` on List containing `["C"]`
Initially: `_sentinel.Next -> ["C"] -> null`. Adding `"B"`:

```
1. Create new node: ["B" | Next: null]
2. Wire new node forward:
   newNode.Next = _sentinel.Next (points to "C")
   ["B" | Next -> "C"]
3. Rewire sentinel:
   _sentinel.Next = newNode
   _sentinel -> ["B"] -> ["C"] -> null
4. Update count: _count = 2, _version++
Invariant maintained: _sentinel.Next points to head ("B").
```

---

### 2.3 Comprehensive Verification Test Suite

```csharp
using System;
using System.Diagnostics;

public static class SinglyLinkedListVerificationSuite {
    public static void RunAllTests() {
        TestAddFirstAndLast();
        TestInsertAtAndRemoveAt();
        TestRemoveByValue();
        TestClearAndLoitering();
        TestFailFastEnumerator();
        Console.WriteLine("✅ All SinglyLinkedList<T> Unit Tests Passed Successfully!");
    }

    private static void TestAddFirstAndLast() {
        var list = new SinglyLinkedList<int>();
        list.AddFirst(20);
        list.AddFirst(10); // [10, 20]
        list.AddLast(30);  // [10, 20, 30]

        Debug.Assert(list.Count == 3);
        Debug.Assert(list[0] == 10);
        Debug.Assert(list[1] == 20);
        Debug.Assert(list[2] == 30);
    }

    private static void TestInsertAtAndRemoveAt() {
        var list = new SinglyLinkedList<string>();
        list.AddLast("A");
        list.AddLast("C");
        list.InsertAt(1, "B"); // [A, B, C]
        Debug.Assert(list[1] == "B");

        list.RemoveAt(1); // removes "B" -> [A, C]
        Debug.Assert(list.Count == 2);
        Debug.Assert(list[0] == "A" && list[1] == "C");

        string first = list.RemoveFirst();
        Debug.Assert(first == "A");
        Debug.Assert(list.Count == 1);
    }

    private static void TestRemoveByValue() {
        var list = new SinglyLinkedList<int>();
        list.AddLast(1);
        list.AddLast(2);
        list.AddLast(3);

        bool removed = list.Remove(2);
        Debug.Assert(removed);
        Debug.Assert(list.Count == 2);
        Debug.Assert(list.IndexOf(2) == -1);
    }

    private static void TestClearAndLoitering() {
        var list = new SinglyLinkedList<string>();
        list.AddLast("one");
        list.AddLast("two");
        list.Clear();
        Debug.Assert(list.Count == 0);
        Debug.Assert(list.IsEmpty);
    }

    private static void TestFailFastEnumerator() {
        var list = new SinglyLinkedList<int>();
        list.AddLast(1);
        list.AddLast(2);

        bool caught = false;
        try {
            foreach (var item in list) {
                if (item == 1) list.AddLast(99);
            }
        } catch (InvalidOperationException) {
            caught = true;
        }
        Debug.Assert(caught);
    }
}
```

---

## 3. 🔬 ANALYZE: Systems & Memory Trade-Offs

| Metric | Dynamic Array (`List<T>`) | Singly Linked List (`SinglyLinkedList<T>`) |
| :--- | :--- | :--- |
| **Random Access (`this[i]`)** | **$O(1)$** (Direct arithmetic offset) | **$O(N)$** (Requires sequential pointer hop) |
| **Prepend (`AddFirst`)** | $O(N)$ (Must shift all elements right) | **$O(1)$** (Rewire sentinel pointer) |
| **Append (`AddLast`)** | $O(1)$ amortized (Geometric doubling) | **$O(1)$** worst-case (Tail pointer update) |
| **Arbitrary Insertion / Deletion** | $O(N)$ (Memory copy / shifting) | $O(1)$ once node pointer is located |
| **CPU Cache Locality** | **Near 100% L1 cache hit rate** | **Frequent L1/L2 cache misses & stalls** |
| **Memory Overhead per Item** | 0 bytes extra (packed tightly) | **28–32 bytes** on 64-bit CLR (header, pointer) |

---

## 4. 🎬 DEMONSTRATE: Problem Walkthroughs

### 4.1 Problem 1: LeetCode 206 — Reverse Linked List (Easy)

> Given the `head` of a singly linked list, reverse the list, and return the reversed list. Solve both iteratively and recursively.

#### Visual Step-by-Step Trace:
`head = [1 -> 2 -> 3 -> null]`

```
Initial: prev = null, curr = 1

Iteration 1:
 nextTemp = curr.next = 2
 curr.next = prev = null   (1 -> null)
 prev = 1
 curr = 2

Iteration 2:
 nextTemp = curr.next = 3
 curr.next = prev = 1      (2 -> 1 -> null)
 prev = 2
 curr = 3

Iteration 3:
 nextTemp = curr.next = null
 curr.next = prev = 2      (3 -> 2 -> 1 -> null)
 prev = 3
 curr = null

Loop terminates (curr == null).
Return prev = 3.
Final: 3 -> 2 -> 1 -> null (Correct!)
```

#### Production C# Implementation:
```csharp
public class SolutionReverseList {
    // Approach 1: Optimal Iterative 3-Pointer (O(N) Time, O(1) Space)
    public ListNode ReverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;

        while (curr != null) {
            ListNode nextTemp = curr.next; // 1. Save rest of list
            curr.next = prev;              // 2. Reverse pointer
            prev = curr;                   // 3. Move prev forward
            curr = nextTemp;               // 4. Move curr forward
        }

        return prev; // New head
    }

    // Approach 2: Clean Recursive (O(N) Time, O(N) Call Stack Space)
    public ListNode ReverseListRecursive(ListNode head) {
        // Base case: empty list or single node is already reversed
        if (head == null || head.next == null) {
            return head;
        }

        // Recursively reverse rest of list; newHead will be the last node
        ListNode newHead = ReverseListRecursive(head.next);

        // Rewire: make head's successor point back to head
        head.next.next = head;
        head.next = null; // Sever original forward link

        return newHead;
    }
}
```

#### Complexity Analysis:
- **Iterative:** Time $O(N)$, Space **$O(1)$** (Preferred in production to avoid stack overflow).
- **Recursive:** Time $O(N)$, Space $O(N)$ (call stack activation frames).

---

### 4.2 Problem 2: LeetCode 203 — Remove Linked List Elements (Easy)

> Given the `head` of a linked list and an integer `val`, remove all the nodes of the linked list that have `Node.val == val`, and return the new head.

#### The Sentinel Demonstration:
`head = [7 -> 7 -> 7 -> 1 -> 2]`, `val = 7`
With a dummy node, the code does not care that the first three elements are all `7`:

```
dummy -> 7 -> 7 -> 7 -> 1 -> 2
  ▲
 curr

curr.next.val == 7 -> curr.next = curr.next.next (bypasses first 7)
dummy -> 7 -> 7 -> 1 -> 2  (curr stays at dummy!)

curr.next.val == 7 -> curr.next = curr.next.next (bypasses second 7)
dummy -> 7 -> 1 -> 2       (curr stays at dummy!)

curr.next.val == 7 -> curr.next = curr.next.next (bypasses third 7)
dummy -> 1 -> 2            (curr stays at dummy!)

curr.next.val == 1 != 7 -> curr = curr.next (advances to 1)
Return dummy.next -> [1 -> 2]! Clean, elegant, zero edge-case branching!
```

#### Production C# Implementation:
```csharp
public class SolutionRemoveElements {
    public ListNode RemoveElements(ListNode head, int val) {
        // Sentinel dummy node handles deletion of head nodes effortlessly
        ListNode dummy = new ListNode(0, head);
        ListNode curr = dummy;

        while (curr.next != null) {
            if (curr.next.val == val) {
                // Delete node by bypassing reference
                curr.next = curr.next.next;
            } else {
                // Only advance curr when no deletion occurred
                curr = curr.next;
            }
        }

        return dummy.next;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — single linear scan.
- **Space Complexity:** $O(1)$ — single dummy node allocated on stack/heap.

---

### 4.3 Problem 3: LeetCode 21 — Merge Two Sorted Lists (Easy)

> You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one **sorted** list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.

#### Production C# Implementation:
```csharp
public class SolutionMergeTwoLists {
    public ListNode MergeTwoLists(ListNode list1, ListNode list2) {
        // Sentinel dummy node provides anchor for merged list
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;

        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                tail.next = list1;
                list1 = list1.next;
            } else {
                tail.next = list2;
                list2 = list2.next;
            }
            tail = tail.next;
        }

        // Splice in whichever list has remaining elements in O(1)
        tail.next = (list1 != null) ? list1 : list2;

        return dummy.next;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N + M)$ — where $N$ and $M$ are lengths of the lists.
- **Space Complexity:** $O(1)$ — zero new node allocations; splices existing node pointers in-place.

---

## 5. 🏋️ PRACTICE: Your Daily Challenges

Master sentinel invariants and pointer reversals on LeetCode:

### Problem 1 (Foundational Reversal): LeetCode 206 — Reverse Linked List (Easy)
- **Goal:** Implement the iterative 3-pointer reversal without looking at notes.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 2 (Sentinel Node): LeetCode 203 — Remove Linked List Elements (Easy)
- **Goal:** Use `dummy = new ListNode(0, head)` to delete target values.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 3 (Pointer Splicing): LeetCode 21 — Merge Two Sorted Lists (Easy)
- **Goal:** Splice two sorted lists in-place using a dummy head.
- **Target Complexity:** $O(N + M)$ time, $O(1)$ space.

### Bonus / Extension Challenge: LeetCode 237 — Delete Node in a Linked List (Medium)
- **Goal:** You are given access ONLY to the node to be deleted (no access to `head`!). Delete it in $O(1)$ time.
- **Hint:** You cannot change the predecessor's `next` pointer! Instead, copy the successor's value into the current node (`node.val = node.next.val`) and bypass the successor (`node.next = node.next.next`)!

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Linked List Strategy Decision                     │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Modifying or deleting head node ──────────► Sentinel Dummy Node (`dummy.next = head`)
                   │                                               [LC 203, LC 21]
                   │
                   ├─► Reversing full list / subsegments ────────► Iterative 3-Pointer (`prev, curr, next`)
                   │                                               [LC 206, LC 92]
                   │
                   ├─► Finding middle / Detecting loops ─────────► Fast & Slow Pointers (Day 37)
                   │                                               [LC 876, LC 141, LC 142]
                   │
                   └─► Dividing list for Merge Sort ─────────────► Fast & Slow + Sever Link (Day 41)
                                                                   [LC 148]
```

---

## 7. 🎯 Day 36 Checkpoint Questions

Verify your depth in linked list memory, container invariants, and pointer mechanics:

1. **Cache Miss Mechanism:** Why does sequential traversal of a linked list of $10^6$ elements take significantly longer on modern CPUs than traversing a contiguous array of $10^6$ integers?
2. **Sentinel Invariant Proof:** Explain why a sentinel dummy node eliminates the need for special-case checks when `head == null` or when the node being deleted is the first node.
3. **Reference Unlinking:** In `SinglyLinkedList<T>.RemoveAt()`, why is it critical to set `target.Next = null` before discarding the node? What GC complication does this prevent?
4. **Reversal Pointer Severance:** In the 3-pointer reversal algorithm, what catastrophic bug happens if you write `curr.next = prev` *before* storing `curr.next` in a temporary variable?
5. **C# Reference Semantics:** If `a` and `b` are two `ListNode` variables pointing to the same node in memory, what is the effect of executing `a.val = 42;` on `b.val`?
