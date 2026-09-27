---
title: "Week 9 — Day 57: Queue Internals, Circular Buffers, From-Scratch Implementations (Circular Array vs. Linked List) & FIFO Mechanics"
---

Welcome to **Week 9: Queue Internals, Monotonic Deques & BFS Foundations**!

Having mastered LIFO call stacks, monotonic boundary formulations, and expression parsing in Week 8, we now pivot to the foundational counterpart of the stack: the **Queue** and the **First-In-First-Out (FIFO)** discipline:
1. **The Physical Reality of the Queue:** Why naive array queues suffer from an $O(N)$ shifting bottleneck, and how the **Circular Ring Buffer** achieves strict $O(1)$ enqueue and dequeue operations via modular arithmetic.
2. **From-Scratch Container Implementations:** Building three production-grade FIFO containers in C#:
   - **`CircularArrayQueue<T>`:** Dynamic ring buffer with geometric doubling, two-segment wraparound copying, GC reference loitering prevention (`default(T)`), and fail-fast iteration.
   - **`LinkedQueue<T>`:** Node-pointer queue with dedicated `_head` and `_tail` references, guaranteeing strict worst-case $O(1)$ operations with zero resizing stalls.
   - **`TwoStackQueue<T>`:** Simulating FIFO behavior with two LIFO stacks using lazy element transfer and the **Amortized Potential Method ($\Phi$)**.
3. **Hardware & Systems Memory Models:** Modulo division cost vs. bitwise power-of-two masking (`index & (capacity - 1)`), CPU cache line spatial prefetching vs. heap node pointer chasing.
4. **Canonical Problem Walkthroughs:** Deep-dive derivations for **LeetCode 622 (Design Circular Queue)**, **LeetCode 641 (Design Circular Deque)**, and **LeetCode 232 (Implement Queue using Stacks)**.

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* The **Queue Abstract Data Type (ADT)** is a linear FIFO (First-In, First-Out) collection where elements are inserted at the `Tail` and extracted from the `Head`.
  - *Core Invariants:* FIFO Invariant: Elements dequeue in the exact chronological order of their arrival; Circular Ring Buffer Invariant: Head and Tail wrap around via $(index + 1) \pmod{\text{Capacity}}$; Full Condition: `count == capacity`; Empty Condition: `count == 0`.
  - *Misconception Check:* A naive array implementation of a queue that shifts all elements left on dequeue takes $O(N)$ time per dequeue; a circular ring buffer achieves strictly $O(1)$ enqueue and dequeue by advancing the `head` pointer.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(N)$ memory-shifting cost of array head deletions.
  - *Complexity Advantage:* Provides guaranteed worst-case $\Theta(1)$ enqueue and dequeue operations without memory movement.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Implement Queue using Stacks" (LC 232), "Design Circular Queue" (LC 622), BFS level-order traversals, asynchronous event loops. Signal words: "FIFO", "circular queue", "first-in first-out".
  - *When to Avoid / Failure Modes:* When priority ordering or LIFO ordering is required.
- **4. WHERE:**
  - *Physical CLR Memory:* Contiguous array on CLR managed heap with power-of-two capacity for fast bitwise masking (`idx & (cap - 1)`), avoiding costly modulo `%` instructions; prevent reference loitering with `_items[head] = default(T)!`.
  - *Production Systems:* Operating system process scheduling runqueues, network interface card (NIC) packet ring buffers, message broker channels (Kafka partition queues).
- **5. WHO:**
  - *Spoken Script:* "A queue enforces strict FIFO processing. In a circular array implementation, I use modular index arithmetic $(tail + 1) \pmod{\text{Capacity}}$ to wrap pointers around the buffer, guaranteeing $O(1)$ enqueue and dequeue operations without shifting memory."
  - *Interviewer Evaluation Lens:* Evaluates circular pointer arithmetic, full vs. empty disambiguation (using an explicit `count` variable), and reference loitering prevention (`default(T)`).
- **6. HOW:**
  - *Cost Model:* Enqueue: $O(1)$; Dequeue: $O(1)$; Peek: $O(1)$; Space: $O(N)$.
  - *State Transition Trace (Circular Queue):* `cap=4: Enqueue(A) [A,_,_,_] h=0,t=1 -> Enqueue(B) [A,B,_,_] t=2 -> Dequeue() [_,B,_,_] h=1 -> Enqueue(C,D,E) wraps around t=1 -> Full!`.

### ⚖️ Architectural Comparison: Stack vs. Queue vs. Deque
| Dimension | Stack (`LIFO`) | Queue (`FIFO`) | Deque (Double-Ended Queue) |
| :--- | :--- | :--- | :--- |
| **Access Discipline** | **Last-In, First-Out:** Entry and exit through `Top` only | **First-In, First-Out:** Entry at `Tail`, exit at `Head` | **Bidirectional:** Entry and exit at both `Front` and `Back` |
| **Active Access Points** | 1 point (`Top`) | 2 points (`Head` and `Tail`) | 2 points (`Front` and `Back`) |
| **Optimal Array Implementation** | Dynamic array: push/pop at index `Count - 1` | Circular Ring Buffer: modular arithmetic `(tail + 1) % Cap` | Circular Ring Buffer: bidirectional modular arithmetic |
| **Optimal Linked Implementation**| Singly linked list: push/pop at `Head` | Singly linked list: enqueue at `Tail`, dequeue at `Head` | Doubly linked list with sentinel dummy nodes |
| **Primary Invariants** | Top element always reflects the most recently observed active state | Order of dequeue matches chronological order of enqueue | Elements can be inspected and pruned from both extremities |
| **Canonical Algorithmic Patterns**| 1. Monotonic Stack (Next Greater/Smaller element)<br>2. Parentheses & syntax parsing<br>3. Recursive call-stack emulation<br>4. Depth-First Search (DFS) | 1. Breadth-First Search (BFS) level wavefronts<br>2. Task buffering & rate limiting<br>3. Producer-Consumer streaming | 1. Monotonic Deque (Sliding Window Min/Max)<br>2. 0-1 BFS shortest paths<br>3. Maximum constrained subsequence DP |

---

### 1.1 The Queue ADT Contract & The FIFO Invariant

The **Queue** is a linear Abstract Data Type (ADT) governed by the **FIFO (First-In-First-Out)** discipline:

$$\text{FIFO Invariant: } \text{Elements are removed in the exact chronological order in which they were added.}$$

Mathematically, for any two elements $x$ and $y$:
$$\text{Enqueue}(x) \prec \text{Enqueue}(y) \implies \text{Dequeue}() = x \prec \text{Dequeue}() = y$$

#### Core Operations & Complexity Targets:
- **`Enqueue(T item)`:** Inserts an element at the back (**tail**) of the queue. Target: $O(1)$ amortized / worst-case.
- **`Dequeue()`:** Removes and returns the element from the front (**head**) of the queue. Target: $O(1)$ time. Throws if empty.
- **`Peek()`:** Inspects the front element without removing it. Target: $O(1)$ time. Throws if empty.
- **`TryDequeue(out T item)` / `TryPeek(out T item)`:** Non-throwing defensive inspection primitives. Target: $O(1)$ time.
- **`Count` / `IsEmpty`:** State inspection properties. Target: $O(1)$ time.
- **`Clear()`:** Resets the queue, unlinking all references to permit immediate Garbage Collection.

---

### 1.2 The Naive Array Dilemma: The $O(N)$ Dequeue Bottleneck

Suppose we implement a queue using a standard dynamic array (`List<T>`), enqueuing at the end and dequeuing from index `0`:

```
Initial:   [ 10 , 20 , 30 , 40 ]   (Head is at index 0)
Dequeue(): Returns 10.
Shift:     [ 20 , 30 , 40 ,  ? ]   <-- EVERY element must shift 1 slot left!
Cost:      N - 1 element copies! Time = O(N).
```

If a system processes $100,000$ messages per second, an $O(N)$ dequeue operation will execute $10^{10}$ memory copies, choking the CPU memory bus and stalling the thread.

---

### 1.3 The Solution: The Circular Buffer (Ring Queue)

Instead of shifting elements leftward on every dequeue, **we let the `head` pointer advance rightward**!

When `head` or `tail` reaches the physical boundary of the array buffer (`capacity - 1`), it wraps around to index `0` using **Modular Arithmetic**:

$$\mathbf{\text{nextIndex} = (\text{currentIndex} + 1) \pmod{\text{Capacity}}}$$

```
Physical Memory Buffer of Capacity 8:
Indices:      0      1      2      3      4      5      6      7
           ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
Values:    │  40  │  50  │ null │ null │  10  │  20  │  30  │  35  │
           └──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
                           ▲             ▲
                           │             └── _head = 4 (Oldest element: 10)
                           └── _tail = 2 (Next insertion slot: after 50)

Elements in FIFO logical order: 10 -> 20 -> 30 -> 35 -> 40 -> 50 (Count = 6)
```

---

### 1.4 Disambiguating "Full" vs. "Empty" Invariants

In a circular buffer of size $C$, both an empty buffer and a completely full buffer result in `head == tail`. How do we distinguish between them?

#### Approach 1: The Explicit Count Tracker (Preferred in Production)
Maintain an explicit field `private int _count`:
- **Empty Invariant:** `_count == 0`.
- **Full Invariant:** `_count == _items.Length`.
- **Advantage:** Utilizes $100\%$ of array capacity (zero wasted slots). Simplifies capacity doubling and trimming.

#### Approach 2: The Sentinel Gap (Classic Systems / Lock-Free Ring Buffers)
Reserve one slot as a permanent unfillable sentinel gap:
- **Empty Invariant:** `head == tail`.
- **Full Invariant:** `(tail + 1) % capacity == head`.
- **Advantage:** In single-producer single-consumer (SPSC) concurrent ring buffers, `head` is only written by the consumer and `tail` is only written by the producer. Omitting a shared `_count` variable eliminates **cache line false sharing**!

---

### 1.5 Resizing with Wraparound: The Two-Segment Copy

When `_count == _items.Length`, the circular buffer must expand (geometric doubling $2\times$).

Because the data may wrap around the boundary (`_head >= _tail`), we cannot use a single naive `Array.Copy`. The data is split into two disjoint segments:
1. **Segment 1 (Head to End):** Elements from `_head` to `_items.Length - 1`.
2. **Segment 2 (Start to Tail):** Elements from `0` to `_tail - 1`.

```
Old Buffer (Cap = 4, Head = 2, Tail = 2, Full):
Index:       0      1      2      3
          [ 40  ,  50  ,  20  ,  30  ]
                          ▲
                        Head & Tail

Unwrapping into New Buffer of Capacity 8:
Segment 1: Copy from index 2 length 2 (elements 20, 30) -> newArray[0..1]
Segment 2: Copy from index 0 length 2 (elements 40, 50) -> newArray[2..3]

New Buffer:
Index:       0      1      2      3      4      5      6      7
          [ 20  ,  30  ,  40  ,  50  , null , null , null , null ]
            ▲                                  ▲
          _head = 0                          _tail = 4
```

After unwrapping, `_head` resets to `0` and `_tail` becomes `_count`, restoring a clean linear memory layout!

---

### 1.6 Bitwise Optimization: Power-of-Two Masking

Integer division and modulo operations (`%`) require ~10–20 CPU clock cycles on modern x86/ARM hardware.

If the buffer capacity is constrained to a **Power of Two** ($C = 2^k$):
$$\mathbf{i \pmod C \equiv i \ \& \ (C - 1)}$$

For example, if $C = 8$ (binary `0000 1000`), then $C - 1 = 7$ (binary `0000 0111`):
- `9 % 8 = 1`
- `9 & 7 = (1001) & (0111) = 0001 = 1` (Takes **1 CPU cycle**!).
- Production high-throughput messaging engines (e.g., LMAX Disruptor, Java `ArrayDeque`) enforce power-of-two capacities for this reason.

---

### 1.7 Architectural Trade-Off Matrix

| Metric | `CircularArrayQueue<T>` | `LinkedQueue<T>` | `TwoStackQueue<T>` |
| :--- | :--- | :--- | :--- |
| **Enqueue Time** | $O(1)$ amortized (resizing copy) | **Strict $O(1)$ worst-case** | **Strict $O(1)$ worst-case** |
| **Dequeue Time** | **Strict $O(1)$ worst-case** | **Strict $O(1)$ worst-case** | $O(1)$ amortized (batch dump) |
| **Memory Allocation** | Single contiguous buffer | Standalone node per element | Backed by two array stacks |
| **Memory Overhead** | Unused capacity buffer slots | **24–32 bytes/node** on 64-bit CLR | Up to $2\times$ stack array buffers |
| **CPU Cache Locality** | **Near 100% L1 cache hits** | Poor (heap pointer chasing) | Good (contiguous stack scans) |
| **GC Pressure** | Near zero (reusable buffer) | High (Gen 0 allocation churn) | Low |
| **Latency Predictability**| Jitter spikes on resize | **Completely predictable** | Periodic batch migration |

---

### 1.8 Interview Spoken Drill (20–30 Seconds)

> *"A queue enforces First-In-First-Out ordering. Implementing a queue with a standard array causes an $O(N)$ dequeue bottleneck due to element shifting. To solve this, we use a Circular Ring Buffer with head and tail pointers advancing via modular arithmetic: `(index + 1) % capacity`. When full, we double capacity and unwrap the two disjoint memory segments into contiguous space. To prevent GC reference loitering in C#, dequeued slots must be cleared to `default(T)`. When strict worst-case latency with zero resizing jitter is required, a linked-node queue is preferred; otherwise, circular array queues provide superior CPU cache locality and throughput."*

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Containers

### 2.1 Container 1: `CircularArrayQueue<T>` (Dynamic Ring Buffer)

```csharp
using System;
using System.Collections;
using System.Collections.Generic;

/// <summary>
/// A production-grade generic Circular Ring Buffer Queue implemented from scratch in C#.
/// Features geometric doubling, two-segment wraparound unwrapping, GC reference loitering prevention,
/// and fail-fast version iteration.
/// </summary>
/// <typeparam name="T">The type of elements held in the queue.</typeparam>
public class CircularArrayQueue<T> : IEnumerable<T>, IReadOnlyCollection<T> {
    private const int DefaultCapacity = 4;
    private T[] _items;
    private int _head;
    private int _tail;
    private int _count;
    private int _version;

    public CircularArrayQueue(int initialCapacity = DefaultCapacity) {
        if (initialCapacity < 0) {
            throw new ArgumentOutOfRangeException(nameof(initialCapacity), "Capacity cannot be negative.");
        }
        _items = initialCapacity == 0 ? Array.Empty<T>() : new T[initialCapacity];
        _head = 0;
        _tail = 0;
        _count = 0;
        _version = 0;
    }

    /// <summary>
    /// Gets the number of elements contained in the queue.
    /// </summary>
    public int Count => _count;

    /// <summary>
    /// Gets the total capacity of the internal circular buffer.
    /// </summary>
    public int Capacity => _items.Length;

    /// <summary>
    /// Gets a value indicating whether the queue is empty.
    /// </summary>
    public bool IsEmpty => _count == 0;

    /// <summary>
    /// Adds an item to the end of the queue.
    /// Time Complexity: Amortized O(1), Worst-Case O(N) when resizing.
    /// </summary>
    public void Enqueue(T item) {
        if (_count == _items.Length) {
            EnsureCapacity(_count + 1);
        }

        _items[_tail] = item;
        _tail = (_tail + 1) % _items.Length;
        _count++;
        _version++;
    }

    /// <summary>
    /// Removes and returns the item at the beginning of the queue.
    /// Time Complexity: Strictly O(1).
    /// </summary>
    public T Dequeue() {
        if (_count == 0) {
            throw new InvalidOperationException("Queue is empty.");
        }

        T removed = _items[_head];
        // CRITICAL: Prevent GC reference loitering for reference types
        _items[_head] = default(T)!;
        _head = (_head + 1) % _items.Length;
        _count--;
        _version++;

        CheckShrink();
        return removed;
    }

    /// <summary>
    /// Returns the item at the beginning of the queue without removing it.
    /// Time Complexity: Strictly O(1).
    /// </summary>
    public T Peek() {
        if (_count == 0) {
            throw new InvalidOperationException("Queue is empty.");
        }
        return _items[_head];
    }

    /// <summary>
    /// Attempts to remove and return the item at the beginning of the queue.
    /// </summary>
    public bool TryDequeue(out T item) {
        if (_count == 0) {
            item = default(T)!;
            return false;
        }
        item = Dequeue();
        return true;
    }

    /// <summary>
    /// Attempts to return the item at the beginning of the queue without removing it.
    /// </summary>
    public bool TryPeek(out T item) {
        if (_count == 0) {
            item = default(T)!;
            return false;
        }
        item = _items[_head];
        return true;
    }

    /// <summary>
    /// Removes all items from the queue and clears references for GC reclamation.
    /// </summary>
    public void Clear() {
        if (_count > 0) {
            if (_head < _tail) {
                Array.Clear(_items, _head, _count);
            } else {
                Array.Clear(_items, _head, _items.Length - _head);
                Array.Clear(_items, 0, _tail);
            }
            _head = 0;
            _tail = 0;
            _count = 0;
        }
        _version++;
    }

    private void EnsureCapacity(int minCapacity) {
        int newCapacity = _items.Length == 0 ? DefaultCapacity : _items.Length * 2;
        if (newCapacity < minCapacity) {
            newCapacity = minCapacity;
        }

        T[] newArray = new T[newCapacity];
        if (_count > 0) {
            if (_head < _tail) {
                // Elements are contiguous: copy directly
                Array.Copy(_items, _head, newArray, 0, _count);
            } else {
                // Wraparound copy in two segments
                int firstSegmentLen = _items.Length - _head;
                Array.Copy(_items, _head, newArray, 0, firstSegmentLen);
                Array.Copy(_items, 0, newArray, firstSegmentLen, _tail);
            }
        }

        _items = newArray;
        _head = 0;
        _tail = _count;
    }

    private void CheckShrink() {
        // Shrink when utilization drops to 25% or below, halving capacity
        if (_count > 0 && _count <= _items.Length / 4 && _items.Length > DefaultCapacity) {
            int newCapacity = Math.Max(_items.Length / 2, DefaultCapacity);
            T[] newArray = new T[newCapacity];

            if (_head < _tail) {
                Array.Copy(_items, _head, newArray, 0, _count);
            } else {
                int firstSegmentLen = _items.Length - _head;
                Array.Copy(_items, _head, newArray, 0, firstSegmentLen);
                Array.Copy(_items, 0, newArray, firstSegmentLen, _tail);
            }

            _items = newArray;
            _head = 0;
            _tail = _count;
        }
    }

    public IEnumerator<T> GetEnumerator() {
        int capturedVersion = _version;
        for (int i = 0; i < _count; i++) {
            if (capturedVersion != _version) {
                throw new InvalidOperationException("Collection was modified during enumeration.");
            }
            yield return _items[(_head + i) % _items.Length];
        }
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}
```

---

### 2.2 Container 2: `LinkedQueue<T>` (Singly-Linked FIFO Node List)

```csharp
using System;
using System.Collections;
using System.Collections.Generic;

/// <summary>
/// A node-based FIFO queue implemented from scratch in C#.
/// Features strict worst-case O(1) operations, zero resizing latency jitter,
/// and reference unlinking for immediate GC reclamation.
/// </summary>
public class LinkedQueue<T> : IEnumerable<T>, IReadOnlyCollection<T> {
    private sealed class QueueNode {
        public T Value;
        public QueueNode? Next;
        public QueueNode(T value) { Value = value; }
    }

    private QueueNode? _head; // Dequeued from front
    private QueueNode? _tail; // Enqueued at back
    private int _count;
    private int _version;

    public LinkedQueue() {
        _head = null;
        _tail = null;
        _count = 0;
        _version = 0;
    }

    public int Count => _count;
    public bool IsEmpty => _count == 0;

    /// <summary>
    /// Enqueues an item to the back of the queue.
    /// Time Complexity: Strictly O(1) worst-case.
    /// </summary>
    public void Enqueue(T item) {
        var newNode = new QueueNode(item);
        if (_tail == null) {
            _head = newNode;
            _tail = newNode;
        } else {
            _tail.Next = newNode;
            _tail = newNode;
        }
        _count++;
        _version++;
    }

    /// <summary>
    /// Dequeues an item from the front of the queue.
    /// Time Complexity: Strictly O(1) worst-case.
    /// </summary>
    public T Dequeue() {
        if (_head == null) {
            throw new InvalidOperationException("Queue is empty.");
        }

        var removedNode = _head;
        T value = removedNode.Value;

        _head = _head.Next;
        if (_head == null) {
            _tail = null;
        }

        _count--;
        _version++;

        // Unlink to prevent reference loitering
        removedNode.Next = null;
        removedNode.Value = default(T)!;
        return value;
    }

    public T Peek() {
        if (_head == null) {
            throw new InvalidOperationException("Queue is empty.");
        }
        return _head.Value;
    }

    public void Clear() {
        var curr = _head;
        while (curr != null) {
            var next = curr.Next;
            curr.Next = null;
            curr.Value = default(T)!;
            curr = next;
        }
        _head = null;
        _tail = null;
        _count = 0;
        _version++;
    }

    public IEnumerator<T> GetEnumerator() {
        int capturedVersion = _version;
        var curr = _head;
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

### 2.3 Container 3: `TwoStackQueue<T>` (Simulated Queue via Dual Stacks)

```csharp
using System;
using System.Collections.Generic;

/// <summary>
/// A FIFO Queue implemented using two LIFO Stacks (_inStack and _outStack).
/// Demonstrates the Potential Method for amortized O(1) operations.
/// </summary>
public class TwoStackQueue<T> {
    private readonly Stack<T> _inStack;
    private readonly Stack<T> _outStack;

    public TwoStackQueue() {
        _inStack = new Stack<T>();
        _outStack = new Stack<T>();
    }

    public int Count => _inStack.Count + _outStack.Count;
    public bool IsEmpty => _inStack.Count == 0 && _outStack.Count == 0;

    /// <summary>
    /// Enqueues item into inStack.
    /// Time Complexity: Strictly O(1).
    /// </summary>
    public void Enqueue(T item) {
        _inStack.Push(item);
    }

    /// <summary>
    /// Dequeues item from outStack, migrating inStack only if outStack is empty.
    /// Time Complexity: Amortized O(1), Worst-Case O(N).
    /// </summary>
    public T Dequeue() {
        MoveInToOutIfEmpty();
        if (_outStack.Count == 0) {
            throw new InvalidOperationException("Queue is empty.");
        }
        return _outStack.Pop();
    }

    public T Peek() {
        MoveInToOutIfEmpty();
        if (_outStack.Count == 0) {
            throw new InvalidOperationException("Queue is empty.");
        }
        return _outStack.Peek();
    }

    private void MoveInToOutIfEmpty() {
        if (_outStack.Count == 0) {
            while (_inStack.Count > 0) {
                _outStack.Push(_inStack.Pop());
            }
        }
    }
}
```

---

### 2.4 Comprehensive Unit Test Verification Suite

```csharp
using System;
using System.Diagnostics;

public static class QueueVerificationSuite {
    public static void RunAllTests() {
        TestCircularArrayWraparound();
        TestCircularArrayResizing();
        TestLinkedQueueOperations();
        TestTwoStackQueueFIFO();
        TestFailFastEnumerator();
        Console.WriteLine("✅ All QueueVerificationSuite Unit Tests Passed Successfully!");
    }

    private static void TestCircularArrayWraparound() {
        var queue = new CircularArrayQueue<int>(4);
        queue.Enqueue(1);
        queue.Enqueue(2);
        queue.Enqueue(3);

        Debug.Assert(queue.Dequeue() == 1);
        Debug.Assert(queue.Dequeue() == 2);

        // Wrap around tail past buffer boundary
        queue.Enqueue(4);
        queue.Enqueue(5);
        queue.Enqueue(6);

        Debug.Assert(queue.Count == 4);
        Debug.Assert(queue.Dequeue() == 3);
        Debug.Assert(queue.Dequeue() == 4);
        Debug.Assert(queue.Dequeue() == 5);
        Debug.Assert(queue.Dequeue() == 6);
        Debug.Assert(queue.IsEmpty);
    }

    private static void TestCircularArrayResizing() {
        var queue = new CircularArrayQueue<int>(2);
        queue.Enqueue(10);
        queue.Enqueue(20);
        Debug.Assert(queue.Capacity == 2);

        // Triggers capacity doubling to 4 with two-segment unwrap
        queue.Enqueue(30);
        Debug.Assert(queue.Capacity == 4);
        Debug.Assert(queue.Count == 3);
        Debug.Assert(queue.Dequeue() == 10);
        Debug.Assert(queue.Dequeue() == 20);
        Debug.Assert(queue.Dequeue() == 30);
    }

    private static void TestLinkedQueueOperations() {
        var queue = new LinkedQueue<string>();
        queue.Enqueue("A");
        queue.Enqueue("B");
        queue.Enqueue("C");

        Debug.Assert(queue.Peek() == "A");
        Debug.Assert(queue.Dequeue() == "A");
        Debug.Assert(queue.Count == 2);
        Debug.Assert(queue.Dequeue() == "B");
        Debug.Assert(queue.Dequeue() == "C");
        Debug.Assert(queue.IsEmpty);
    }

    private static void TestTwoStackQueueFIFO() {
        var queue = new TwoStackQueue<int>();
        queue.Enqueue(1);
        queue.Enqueue(2);
        Debug.Assert(queue.Dequeue() == 1);
        queue.Enqueue(3);
        Debug.Assert(queue.Dequeue() == 2);
        Debug.Assert(queue.Dequeue() == 3);
        Debug.Assert(queue.IsEmpty);
    }

    private static void TestFailFastEnumerator() {
        var queue = new CircularArrayQueue<int>();
        queue.Enqueue(1);
        queue.Enqueue(2);

        bool caught = false;
        try {
            foreach (var item in queue) {
                if (item == 1) queue.Enqueue(99); // Concurrent modification
            }
        } catch (InvalidOperationException) {
            caught = true;
        }
        Debug.Assert(caught);
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### 3.1 Formal Amortized Analysis Proof for `TwoStackQueue<T>`

Why is `TwoStackQueue.Dequeue()` considered amortized $O(1)$ when a single operation may migrate $N$ elements from `_inStack` to `_outStack` in $O(N)$ time?

#### Proof via The Potential Method ($\Phi$)
Define the potential function $\Phi$:
$$\mathbf{\Phi = 2 \cdot |\text{inStack}|}$$

Notice:
- Initially, both stacks are empty $\implies \Phi_0 = 0$.
- For all states, $|\text{inStack}| \ge 0 \implies \mathbf{\Phi \ge 0}$ (valid potential function).
- The amortized cost $\hat{c}_i$ of the $i$-th operation with actual cost $c_i$ is:
  $$\hat{c}_i = c_i + \Phi(D_i) - \Phi(D_{i-1})$$

#### Case 1: `Enqueue(item)`
- Actual cost $c_i = 1$ (push onto `_inStack`).
- Size of `inStack` increases by 1: $\Delta\Phi = 2 \cdot (k + 1) - 2k = 2$.
- $\mathbf{\hat{c}_i = 1 + 2 = 3 = O(1)}$.

#### Case 2: `Dequeue()` when `_outStack` is NOT empty
- Actual cost $c_i = 1$ (pop from `_outStack`).
- Size of `inStack` is unchanged: $\Delta\Phi = 0$.
- $\mathbf{\hat{c}_i = 1 + 0 = 1 = O(1)}$.

#### Case 3: `Dequeue()` when `_outStack` IS empty (Migration of $K$ items)
- Let $|\text{inStack}| = K$.
- Actual cost $c_i = 2K + 1$ ($K$ pops from `_inStack`, $K$ pushes onto `_outStack`, and $1$ final pop).
- Size of `inStack` drops from $K \to 0$:
  $$\Delta\Phi = \Phi(D_i) - \Phi(D_{i-1}) = 0 - 2K = -2K$$
- Amortized cost:
  $$\mathbf{\hat{c}_i = (2K + 1) + (-2K) = 1 = O(1)}$$

In all cases, the amortized cost is strictly bounded by **3 operations**! The potential $\Phi$ acts as a "credit bank", where each enqueue pays 2 prepaid credits that cover its eventual transfer from `inStack` to `outStack`.

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### 4.1 [LeetCode 622] Design Circular Queue

> Design your implementation of the circular queue. The circular queue is a linear data structure in which the operations are performed based on FIFO principle, and the last position is connected back to the first position to make a circle.

#### Implementation:
```csharp
public class MyCircularQueue {
    private readonly int[] _data;
    private int _head;
    private int _tail;
    private int _count;
    private readonly int _capacity;

    public MyCircularQueue(int k) {
        _capacity = k;
        _data = new int[k];
        _head = 0;
        _tail = 0;
        _count = 0;
    }

    public bool EnQueue(int value) {
        if (IsFull()) return false;
        _data[_tail] = value;
        _tail = (_tail + 1) % _capacity;
        _count++;
        return true;
    }

    public bool DeQueue() {
        if (IsEmpty()) return false;
        _head = (_head + 1) % _capacity;
        _count--;
        return true;
    }

    public int Front() {
        return IsEmpty() ? -1 : _data[_head];
    }

    public int Rear() {
        if (IsEmpty()) return -1;
        // Previous index with modulo wrapping
        int prev = (_tail - 1 + _capacity) % _capacity;
        return _data[prev];
    }

    public bool IsEmpty() => _count == 0;
    public bool IsFull() => _count == _capacity;
}
```

#### Complexity Analysis:
- **Time Complexity:** All operations (`EnQueue`, `DeQueue`, `Front`, `Rear`, `IsEmpty`, `IsFull`) are **strictly $O(1)$**.
- **Space Complexity:** $O(K)$ fixed buffer. Zero dynamic allocations.

---

### 4.2 [LeetCode 641] Design Circular Deque

> Design your implementation of the circular double-ended queue (deque).

#### Key Insight:
- `InsertFront`: Decrement `_head`: `(_head - 1 + _capacity) % _capacity`.
- `DeleteFront`: Increment `_head`: `(_head + 1) % _capacity`.
- `InsertLast`: Write to `_tail`, then increment `_tail`: `(_tail + 1) % _capacity`.
- `DeleteLast`: Decrement `_tail`: `(_tail - 1 + _capacity) % _capacity`.

```csharp
public class MyCircularDeque {
    private readonly int[] _data;
    private int _head;
    private int _tail;
    private int _count;
    private readonly int _capacity;

    public MyCircularDeque(int k) {
        _capacity = k;
        _data = new int[k];
        _head = 0;
        _tail = 0;
        _count = 0;
    }

    public bool InsertFront(int value) {
        if (IsFull()) return false;
        _head = (_head - 1 + _capacity) % _capacity;
        _data[_head] = value;
        _count++;
        return true;
    }

    public bool InsertLast(int value) {
        if (IsFull()) return false;
        _data[_tail] = value;
        _tail = (_tail + 1) % _capacity;
        _count++;
        return true;
    }

    public bool DeleteFront() {
        if (IsEmpty()) return false;
        _head = (_head + 1) % _capacity;
        _count--;
        return true;
    }

    public bool DeleteLast() {
        if (IsEmpty()) return false;
        _tail = (_tail - 1 + _capacity) % _capacity;
        _count--;
        return true;
    }

    public int GetFront() => IsEmpty() ? -1 : _data[_head];
    public int GetRear() => IsEmpty() ? -1 : _data[(_tail - 1 + _capacity) % _capacity];
    public bool IsEmpty() => _count == 0;
    public bool IsFull() => _count == _capacity;
}
```

---

### 4.3 [LeetCode 232] Implement Queue using Stacks

> Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (`push`, `peek`, `pop`, and `empty`).

```csharp
using System.Collections.Generic;

public class MyQueue {
    private readonly Stack<int> _in;
    private readonly Stack<int> _out;

    public MyQueue() {
        _in = new Stack<int>();
        _out = new Stack<int>();
    }

    public void Push(int x) {
        _in.Push(x);
    }

    public int Pop() {
        Peek();
        return _out.Pop();
    }

    public int Peek() {
        if (_out.Count == 0) {
            while (_in.Count > 0) {
                _out.Push(_in.Pop());
            }
        }
        return _out.Peek();
    }

    public bool Empty() => _in.Count == 0 && _out.Count == 0;
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem 1 (Warmup): LeetCode 933 — Number of Recent Calls (Easy)
- **Goal:** Track recent requests within the past 3000 milliseconds using a FIFO queue.
- **Target Complexity:** $O(1)$ amortized per ping, $O(W)$ space where $W \le 3000$.
- **Hint:** Enqueue `t`, then `while (queue.Peek() < t - 3000) queue.Dequeue()`. Return `queue.Count`.

### Problem 2 (Dual Adaptation): LeetCode 225 — Implement Stack using Queues (Easy)
- **Goal:** Implement LIFO stack using FIFO queues.
- **Approach 1:** Push-heavy: enqueue item, then dequeue and re-enqueue previous $N-1$ elements in a single queue to rotate the new element to the front ($O(N)$ push, $O(1)$ pop).

### Problem 3 (Stream Processing): LeetCode 346 — Moving Average from Data Stream (Easy)
- **Goal:** Compute the moving average of the last `size` values in a data stream in $O(1)$ time.
- **Hint:** Maintain a running sum and a circular queue of capacity `size`. When queue reaches capacity, subtract `queue.Dequeue()` from running sum before adding new value.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Queue Architecture Decision Tree                  │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Fixed capacity & zero-allocation throughput?
                   │   └─► Circular Array Ring Buffer [LC 622]
                   │       (Bitwise power-of-two masking: index & (cap - 1))
                   │
                   ├─► Bidirectional insertions and removals at both ends?
                   │   └─► Circular Deque / Doubly Linked Deque (Day 58) [LC 641]
                   │
                   ├─► Sliding window extrema (min/max) in O(1) amortized?
                   │   └─► Monotonic Deque of Indices (Day 58) [LC 239]
                   │
                   ├─► Graph layer-by-layer level order traversal?
                   │   └─► Queue-Based BFS with snapshot int size = q.Count (Day 60)
                   │
                   └─► Strictly predictable latency with zero resize pauses?
                       └─► Singly-Linked Node Queue (LinkedQueue<T>)
```

---

## 7. 🎯 Day 57 Checkpoint Questions

Verify your mastery of circular buffers and queue memory internals:

1. **Disambiguating Invariants:** In a fixed-capacity ring buffer of size $C$, explain why `head == tail` is ambiguous without an explicit `count` variable. What is the sentinel-slot alternative to distinguish between full and empty states?
2. **Modulo vs Bitwise Masking:** Why do high-performance message brokers (like the LMAX Disruptor) enforce ring buffer sizes to powers of two ($2^k$), and what exact bitwise operation replaces `(index + 1) % capacity`?
3. **Wraparound Copy Logic:** When a circular queue with `_head = 3` and `_tail = 3` (in an array of length 4) expands to capacity 8, explain why a single `Array.Copy` fails and trace the two-segment copy that unwraps the data.
4. **Potential Method Proof:** In `TwoStackQueue<T>`, why does the potential function $\Phi = 2 \cdot |\text{inStack}|$ guarantee that dequeuing an element that triggers a migration of $1,000$ items still has an amortized cost of $O(1)$?
5. **Reference Loitering in Dequeue:** In `CircularArrayQueue<T>.Dequeue()`, what exact line of code must be executed to prevent keeping reference-type objects alive in Gen 2 Garbage Collection?
