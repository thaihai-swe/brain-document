---
title: "Week 7 — Day 46: Doubly Linked Lists From Scratch & The LRU Cache Architecture"
---

In **Day 45**, we scaled list merging across $K$ sorted streams, proving why Divide-and-Conquer beats Min-Heaps in physical CPU cache efficiency.

Today, we build one of the most celebrated and frequently asked container and composite data structures in Big Tech interview history:
1. **The Doubly Linked List Container (`DoublyLinkedList<T>`):** Building a production-grade generic DLL from scratch in C# with a **Dual Sentinel Invariant (`_headSentinel` & `_tailSentinel`)** that eliminates all null pointer checks during splicing.
2. **The LRU Cache Eviction Policy:** Evicting the Least Recently Used item in strict **$O(1)$ average time** for both `Get` and `Put`.
3. **The Architectural Deduction:** Proving why Arrays, Hash Maps, and Singly Linked Lists all fail in isolation, necessitating a synchronized **Hash Map + Doubly Linked List (DLL)**.
4. **The Bidirectional Key Storage Invariant:** Why nodes in the linked list **must** store both `key` and `value` to achieve $O(1)$ eviction.
5. **Concurrency & Thread Safety:** Why LRU `Get()` is technically a mutation and how production caching engines handle concurrent reads.

---

## 1. 🧠 TEACH: Architectural Deduction of the LRU Cache

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* The **LRU (Least Recently Used) Cache** is a composite data structure combining a **Doubly Linked List** and a **Hash Map** to provide $O(1)$ key lookups and $O(1)$ recency-based evictions.
  - *Core Invariants:* Access Order Invariant: Doubly linked list maintains access order (Most Recently Used at head, Least Recently Used at tail); Fast Lookup Invariant: `Dictionary<K, DNode>` maps keys directly to node references; Bi-Directional Node Invariant: Each `DNode` stores both `key` and `value`.
  - *Misconception Check:* If `DNode` only stores `value` and omits `key`, evicting the tail node requires scanning the entire dictionary in $O(N)$ time to remove the evicted key! Storing `key` inside `DNode` enables strict $O(1)$ dictionary removal.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(N)$ eviction cost of array-based caches and the $O(N)$ lookup cost of pure linked lists.
  - *Complexity Advantage:* Guarantees strict worst-case $O(1)$ time complexity for both `Get(key)` and `Put(key, value)` operations.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "LRU Cache" (LC 146), database buffer pool page management, Redis eviction policies, browser cache architectures. Signal words: "LRU cache", "least recently used eviction", "O(1) get and put".
  - *When to Avoid / Failure Modes:* When access frequency is more important than access recency (use LFU Cache instead); multithreaded environments without synchronization locks.
- **4. WHERE:**
  - *Physical CLR Memory:* Sentinel `head` and `tail` dummy nodes bound the doubly linked list; `DNode` occupies 48–56 bytes on 64-bit CLR heap (`Object Header` + `MethodTable` + `key` + `val` + `prev` + `next`).
  - *Production Systems:* Operating system virtual memory page replacement (clock algorithm approximation), Memcached item eviction engine, CPU L2/L3 cache associativity eviction.
- **5. WHO:**
  - *Spoken Script:* "An LRU Cache combines a hash map for $O(1)$ key lookup with a doubly linked list for $O(1)$ node detachment and head promotion. I bind the list with dummy head and tail sentinels to avoid boundary null checks, and store the key inside each node so tail eviction removes the hash map entry in $O(1)$ time."
  - *Interviewer Evaluation Lens:* Checks why `key` is stored in node, sentinel node usage (`head` and `tail`), handling of existing key updates in `Put`, and capacity boundary enforcement.
- **6. HOW:**
  - *Cost Model:* `Get`: $O(1)$ time; `Put`: $O(1)$ time; Space: $O(\text{Capacity})$.
  - *State Transition Trace (Get / Put):* `Get(key) -> node = map[key] -> Detach(node) -> AddToHead(node) -> return node.val; Put(key, val) -> if exists: update & promote; else: add, if count > cap: EvictTail()`.


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

### 1.1 Physical Mental Model: The Sliding Bookshelf & Card Index Catalog

An LRU Cache is a composite architecture combining a rapid index looker-upper with a physical conveyor belt:

```
       ======================================================================
         PHYSICAL ANALOGY: CARD CATALOG (MAP) + HOOKED BOOKSHELF (DLIST)
       ======================================================================

       1. THE CARD CATALOG (Hash Map):
          Key "Book A" points directly to physical memory address of Book A.
          Gives instant O(1) location without walking the shelf!

       2. THE HOOKED BOOKSHELF (Doubly Linked List):
          Books have carabiner hooks on BOTH sides (prev and next).
          
          [Head: MRU Sentinel] <=====> [Most Recent] <=====> [Oldest] <=====> [Tail: LRU Sentinel]
          
          - ACCESS / READ: Unclip book from middle, snap neighbors together in O(1),
            and clip book right behind [Head Sentinel].
          - CAPACITY FULL? Unclip book right in front of [Tail Sentinel] and toss it!

       3. WHY STORE 'KEY' INSIDE THE NODE?
          When the oldest book at the tail is tossed out, the librarian must find
          its card in the catalog box to shred it.
          Without 'key' written on the book's spine, finding the card would require
          inspecting every single card in the box (O(N) catastrophe!).
```

```
       ======================================================================
           COMPOSITE MEMORY TOPOLOGY: HASH MAP + DOUBLY LINKED LIST
       ======================================================================

       Dictionary<int, DNode> (Managed Heap):
       Key 10 ---> [ Ref to Node A ]
       Key 20 ---> [ Ref to Node B ]
                         |
                         v
       Doubly Linked List (Bounded by Sentinels):
       +-------+      +---------------+      +---------------+      +-------+
       | Head  |<====>| Node A        |<====>| Node B        |<====>| Tail  |
       | Dummy |      | key: 10, v: 99|      | key: 20, v: 50|      | Dummy |
       +-------+      +---------------+      +---------------+      +-------+
          MRU                                                          LRU
       (Promote here!)                                             (Evict here!)
```

---

### 1.2 Problem Specification ([LeetCode 146])

Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**:
- `LRUCache(int capacity)`: Initialize the cache with positive size `capacity`.
- `int Get(int key)`: Return the value of the `key` if it exists, otherwise return `-1`.
- `void Put(int key, int value)`: Update the value of the `key` if it exists. Otherwise, add the `key-value` pair to the cache. If the number of keys exceeds `capacity`, **evict the least recently used key**.
- **Performance Requirement:** Both `Get` and `Put` must run in **$O(1)$ average time complexity**.

---

### 1.2 Why Single Data Structures Fail (The Systems Proof)

| Candidate Structure | `Get(key)` Time | `Put(key, value)` Time | Evict LRU Element Time | Fatal Flaw |
| :--- | :---: | :---: | :---: | :--- |
| **Array / Dynamic List** | $O(N)$ | $O(1)$ amortized | $O(N)$ (requires shifting elements) | No fast key lookup; element deletion requires $O(N)$ memory shifts. |
| **Hash Map Alone** | **$O(1)$** | **$O(1)$** | $O(N)$ | Hash maps have no ordering concept. Finding the oldest timestamp requires scanning all entries. |
| **Hash Map + Singly Linked List** | **$O(1)$** | **$O(1)$** | $O(N)$ | To move an existing node to the MRU position, we must detach it. Detaching an arbitrary node in a singly linked list requires its **predecessor**, which takes an $O(N)$ linear scan! |
| **Hash Map + Doubly Linked List** | **$O(1)$** | **$O(1)$** | **$O(1)$** | **THE SWEET SPOT:** Doubly linked nodes store `prev` and `next`, enabling instant $O(1)$ self-removal! |

```
                       ┌─────────────────────────┐
                       │  Dictionary<int, DNode> │
                       └────────────┬────────────┘
                                    │
           Key "A" ─────────────────┼───────────────┐
           Key "B" ─────────────────┼──────┐        │
                                    ▼      ▼        ▼
 dummyHead <──► [ Node A ] <──► [ Node B ] <──► [ Node C ] <──► dummyTail
   (MRU)           val: 10        val: 20         val: 30         (LRU)
```

1. **`Dictionary<int, DNode> map`:** Maps `key` $\to$ physical node in the heap ($O(1)$ lookup).
2. **`DoublyLinkedList`:** Maintains chronological access order:
   - **Head (`dummyHead.next`):** Most Recently Used (MRU) node.
   - **Tail (`dummyTail.prev`):** Least Recently Used (LRU) node.

---

### 1.3 The Dual Sentinel Invariant

Without sentinel nodes, every node insertion and removal requires checking:
`if (head == null)`, `if (node == head)`, `if (node == tail)`.

With **`dummyHead` and `dummyTail`**:
```
dummyHead ◄────────────────────────────────► dummyTail
   next ──────────────────────────────────────►
   ◄────────────────────────────────────────── prev
```
Every real data node is always guaranteed to have a non-null `prev` and a non-null `next`!

#### The Four Core Atomic Operations:

```csharp
// 1. Remove an arbitrary node from the DLL in O(1)
private void RemoveNode(DNode node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
}

// 2. Insert a node immediately after dummyHead (MRU position) in O(1)
private void AddToHead(DNode node) {
    node.next = dummyHead.next;
    node.prev = dummyHead;
    dummyHead.next.prev = node;
    dummyHead.next = node;
}

// 3. Move an existing node to the MRU position
private void MoveToHead(DNode node) {
    RemoveNode(node);
    AddToHead(node);
}

// 4. Pop the Least Recently Used node (immediate predecessor of dummyTail)
private DNode PopTail() {
    DNode lru = dummyTail.prev;
    RemoveNode(lru);
    return lru;
}
```

---

### 1.4 Why `DNode` Must Store `key` (The Reverse-Lookup Invariant)

A classic interview mistake is defining:
```csharp
class DNode {
    public int val; // Missing 'key'!
    public DNode prev;
    public DNode next;
}
```

When cache capacity is exceeded during `Put`:
1. We call `DNode lru = PopTail()`.
2. We detach `lru` from the linked list in $O(1)$.
3. Now, we MUST remove this item from `Dictionary<int, DNode> map`!
4. **How do we know which dictionary key maps to `lru`?**
   - Without storing `key` inside `lru`, we would have to iterate over all pairs in `map` to find which entry points to `lru` $\implies \mathbf{O(N)}$ **disaster!**
5. By storing `key` in `DNode`, eviction is an instant $O(1)$ operation:
   $$\mathbf{\text{map.Remove}(lru.key)}$$

---

### 1.5 Interview Spoken Drill (20–30 Seconds)

> *"To implement an LRU Cache with $O(1)$ operations, I synchronize a Hash Map with a Doubly Linked List. The Hash Map maps keys directly to doubly linked nodes for $O(1)$ access, while the Doubly Linked List tracks access recency, keeping the most recently used node at the head and the least recently used at the tail. By using both dummyHead and dummyTail sentinel nodes, node insertion, deletion, and relocation operate without null checks. Crucially, each node stores both its key and value so that when the LRU tail is evicted, we can delete its corresponding key from the hash map in $O(1)$ time."*

### 1.6 ⚙️ Core Operations Deep-Dive: Hash-Map & Doubly-Linked-List Coordination Mechanics

#### Dimension 1: Operation Contract & Big-O Bounds
- **Operation Signatures:**
  1. `int Get(int key)`
  2. `void Put(int key, int value)`
- **Preconditions:**
  - `capacity` is a positive integer ($C \ge 1$).
  - Keys and values are non-negative 32-bit integers.
- **Postconditions:**
  - `Get` returns the stored value if present and promotes the node to the Most Recently Used (MRU) position; otherwise returns `-1`.
  - `Put` inserts or updates the key-value pair, promotes it to MRU, and evicts the Least Recently Used (LRU) node if size exceeds capacity.
- **Complexity Bounds:**
  - **Time Complexity:**
    - `Get`: Strictly $\mathbf{O(1)}$ worst-case.
    - `Put`: Strictly $\mathbf{O(1)}$ worst-case.
  - **Auxiliary Space Complexity:**
    - $\Theta(C)$ auxiliary space — Hash Map holding at most $C$ entries and Doubly Linked List with $C + 2$ total nodes (including dual sentinels).

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree
1. **`Get(key)` Execution Flow:**
   - Probe `map.TryGetValue(key, out DNode node)`.
   - If NOT found: Return `-1`.
   - If found:
     - `MoveToHead(node)` (detach from current position, insert after `dummyHead`).
     - Return `node.val`.
2. **`Put(key, value)` Execution Flow:**
   - Probe `map.TryGetValue(key, out DNode node)`.
   - **Case 1 (Key Exists):**
     - Update: `node.val = value`.
     - `MoveToHead(node)`.
   - **Case 2 (Key New):**
     - Allocate `newNode = new DNode(key, value)`.
     - `AddToHead(newNode)`.
     - `map[key] = newNode`.
     - If `map.Count > capacity`:
       - Evict LRU tail: `DNode lru = PopTail()`.
       - Reverse map purge: `map.Remove(lru.key)`.

```
                        [Put(key, value)]
                                │
                        Key exists in map?
                       /                  \
                 (Yes)/                    \(No)
                     ▼                      ▼
            node.val = value          newNode = new DNode(key, val)
            MoveToHead(node)          AddToHead(newNode)
                                      map[key] = newNode
                                            │
                                    map.Count > capacity?
                                   /                     \
                             (Yes)/                       \(No)
                                 ▼                         ▼
                         lru = PopTail()                 Done
                         map.Remove(lru.key)
```

#### Dimension 3: Visual ASCII State Transitions
```
CAPACITY = 2
Initial: HeadSentinel <───► TailSentinel

1. Put(1, 10):
   Head <───► [ K:1, V:10 ] <───► Tail
   Map: { 1 -> [1,10] }

2. Put(2, 20):
   Head <───► [ K:2, V:20 ] <───► [ K:1, V:10 ] <───► Tail
   Map: { 1 -> [1,10], 2 -> [2,20] }

3. Get(1) -> Access Key 1:
   Promote [1,10] to MRU (Head):
   Head <───► [ K:1, V:10 ] <───► [ K:2, V:20 ] <───► Tail
   Least recently used is now [ K:2, V:20 ]!

4. Put(3, 30) -> Capacity Exceeded (3 > 2)!
   - PopTail(): [ K:2, V:20 ] detached!
   - map.Remove(2): Reverse lookup purged!
   - AddToHead([3, 30]):
   Head <───► [ K:3, V:30 ] <───► [ K:1, V:10 ] <───► Tail
   Map: { 1 -> [1,10], 3 -> [3,30] }
```

#### Dimension 4: Invariant Preservation Proof
- **Bijective Coordination Invariant:**
  - Let $M$ be the set of keys in `map` and $L$ be the set of data nodes between `dummyHead` and `dummyTail`.
  - At every step:
    1. For every $k \in M$, $map[k] \in L$ and $map[k].key = k$.
    2. For every $node \in L$, $node.key \in M$ and $map[node.key] = node$.
  - When an eviction occurs, `PopTail()` extracts the physical predecessor of `dummyTail`, yielding node $u$.
  - Because $u.key$ is stored inside $u$, executing `map.Remove(u.key)` guarantees that $M$ and $L$ remain in exact one-to-one correspondence ($|M| = |L| \le C$).
- **Dual-Sentinel Null-Pointer Elimination Lemma:**
  - In a standard doubly linked list, deleting a node requires 4 null checks (`if prev == null`, `if next == null`).
  - By maintaining permanent non-null `dummyHead` and `dummyTail` nodes:
    - Every active data node $u$ is guaranteed to have non-null $u.prev$ and non-null $u.next$.
    - Node removal strictly evaluates:
      $$u.prev.next = u.next \quad \text{and} \quad u.next.prev = u.prev$$
    - Zero conditional branches are required, optimizing CPU instruction pipelining and eliminating null dereference hazards.

#### Dimension 5: Edge Case Matrix
| Edge Case Scenario | Input State | Algorithmic Behavior | Invariant Preservation |
| :--- | :--- | :--- | :--- |
| **Capacity = 1** | $C = 1$ | Every new insertion immediately evicts the previous node. | Maximum size 1 maintained. |
| **Value Update (No Eviction)** | `Put(1, 10)`, then `Put(1, 99)` | Key found in map; updates value; moves to head; size unchanged. | Overwrite without triggering spurious eviction. |
| **Get Missing Key** | `Get(999)` | `TryGetValue` returns false; returns -1; list unchanged. | Pure read without mutation. |
| **Repeated Get on Same Key** | Multiple `Get(1)` calls | Node detached and spliced before head; list geometry identical. | Idempotent recency promotion. |
| **Frequent Eviction Cascade** | Continuous stream of distinct keys | Every insertion pops tail and purges map key in $O(1)$. | Steady-state memory footprint strictly bounded by $C$. |

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Doubly Linked List

### 2.1 Complete C# Implementation (`DoublyLinkedList<T>`)

```csharp
using System;
using System.Collections;
using System.Collections.Generic;

/// <summary>
/// A node in a generic doubly linked list.
/// </summary>
public class DoublyLinkedListNode<T> {
    public T Value;
    public DoublyLinkedListNode<T>? Prev;
    public DoublyLinkedListNode<T>? Next;

    public DoublyLinkedListNode(T value) {
        Value = value;
    }
}

/// <summary>
/// A production-grade generic doubly linked list container implemented from scratch in C#.
/// Features a Dual Sentinel Invariant (_headSentinel and _tailSentinel) guaranteeing
/// branchless O(1) node additions, arbitrary removals, and safe bidirectional iterations.
/// </summary>
public class DoublyLinkedList<T> : IEnumerable<T> {
    private readonly DoublyLinkedListNode<T> _headSentinel;
    private readonly DoublyLinkedListNode<T> _tailSentinel;
    private int _count;
    private int _version;

    public DoublyLinkedList() {
        _headSentinel = new DoublyLinkedListNode<T>(default!);
        _tailSentinel = new DoublyLinkedListNode<T>(default!);

        _headSentinel.Next = _tailSentinel;
        _tailSentinel.Prev = _headSentinel;
        _count = 0;
        _version = 0;
    }

    /// <summary>
    /// Gets the number of elements contained in the doubly linked list.
    /// Time Complexity: O(1).
    /// </summary>
    public int Count => _count;

    /// <summary>
    /// Gets a value indicating whether the list is empty.
    /// </summary>
    public bool IsEmpty => _count == 0;

    /// <summary>
    /// Gets the first active data node in the list, or null if the list is empty.
    /// </summary>
    public DoublyLinkedListNode<T>? FirstNode => IsEmpty ? null : _headSentinel.Next;

    /// <summary>
    /// Gets the last active data node in the list, or null if the list is empty.
    /// </summary>
    public DoublyLinkedListNode<T>? LastNode => IsEmpty ? null : _tailSentinel.Prev;

    /// <summary>
    /// Inserts a new value at the beginning of the doubly linked list.
    /// Time Complexity: Strictly O(1).
    /// </summary>
    public DoublyLinkedListNode<T> AddFirst(T item) {
        var node = new DoublyLinkedListNode<T>(item);
        InsertNodeBetween(_headSentinel, _headSentinel.Next!, node);
        return node;
    }

    /// <summary>
    /// Appends a new value to the end of the doubly linked list.
    /// Time Complexity: Strictly O(1).
    /// </summary>
    public DoublyLinkedListNode<T> AddLast(T item) {
        var node = new DoublyLinkedListNode<T>(item);
        InsertNodeBetween(_tailSentinel.Prev!, _tailSentinel, node);
        return node;
    }

    /// <summary>
    /// Inserts a new value immediately after an existing node.
    /// Time Complexity: Strictly O(1).
    /// </summary>
    public DoublyLinkedListNode<T> AddAfter(DoublyLinkedListNode<T> node, T item) {
        if (node == null || node.Next == null) {
            throw new ArgumentNullException(nameof(node), "Cannot insert after null or unlinked node.");
        }
        var newNode = new DoublyLinkedListNode<T>(item);
        InsertNodeBetween(node, node.Next, newNode);
        return newNode;
    }

    /// <summary>
    /// Inserts a new value immediately before an existing node.
    /// Time Complexity: Strictly O(1).
    /// </summary>
    public DoublyLinkedListNode<T> AddBefore(DoublyLinkedListNode<T> node, T item) {
        if (node == null || node.Prev == null) {
            throw new ArgumentNullException(nameof(node), "Cannot insert before null or unlinked node.");
        }
        var newNode = new DoublyLinkedListNode<T>(item);
        InsertNodeBetween(node.Prev, node, newNode);
        return newNode;
    }

    /// <summary>
    /// Removes an arbitrary node from the doubly linked list in strict O(1) time.
    /// </summary>
    public void Remove(DoublyLinkedListNode<T> node) {
        if (node == null) throw new ArgumentNullException(nameof(node));
        if (node.Prev == null || node.Next == null || node == _headSentinel || node == _tailSentinel) {
            throw new InvalidOperationException("Cannot remove an unlinked or sentinel node.");
        }

        // Branchless pointer bypass
        node.Prev.Next = node.Next;
        node.Next.Prev = node.Prev;

        // Sever links to prevent reference loitering
        node.Prev = null;
        node.Next = null;

        _count--;
        _version++;
    }

    /// <summary>
    /// Removes and returns the first element of the list.
    /// Time Complexity: Strictly O(1).
    /// </summary>
    public T RemoveFirst() {
        if (IsEmpty) throw new InvalidOperationException("List is empty.");
        var first = _headSentinel.Next!;
        T val = first.Value;
        Remove(first);
        return val;
    }

    /// <summary>
    /// Removes and returns the last element of the list.
    /// Time Complexity: Strictly O(1).
    /// </summary>
    public T RemoveLast() {
        if (IsEmpty) throw new InvalidOperationException("List is empty.");
        var last = _tailSentinel.Prev!;
        T val = last.Value;
        Remove(last);
        return val;
    }

    /// <summary>
    /// Removes all nodes from the doubly linked list.
    /// </summary>
    public void Clear() {
        var curr = _headSentinel.Next;
        while (curr != _tailSentinel && curr != null) {
            var next = curr.Next;
            curr.Prev = null;
            curr.Next = null;
            curr = next;
        }

        _headSentinel.Next = _tailSentinel;
        _tailSentinel.Prev = _headSentinel;
        _count = 0;
        _version++;
    }

    private void InsertNodeBetween(DoublyLinkedListNode<T> prev, DoublyLinkedListNode<T> next, DoublyLinkedListNode<T> newNode) {
        newNode.Prev = prev;
        newNode.Next = next;
        prev.Next = newNode;
        next.Prev = newNode;

        _count++;
        _version++;
    }

    /// <summary>
    /// Returns an enumerator that iterates forward through the doubly linked list.
    /// </summary>
    public IEnumerator<T> GetEnumerator() {
        int capturedVersion = _version;
        var curr = _headSentinel.Next;

        while (curr != _tailSentinel && curr != null) {
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

#### Atomic Node Detachment Trace:
Detaching `Node B` situated between `Node A` and `Node C`:

```
Before Detach:
[ Node A ] ◄──────► [ Node B ] ◄──────► [ Node C ]
          Next ──►           Next ──►
          ◄── Prev           ◄── Prev

Step 1: node.Prev.Next = node.Next
Node A's Next pointer bypasses B to point directly to Node C.

Step 2: node.Next.Prev = node.Prev
Node C's Prev pointer bypasses B to point directly to Node A.

Step 3: Unlink B:
node.Prev = null; node.Next = null;

After Detach:
[ Node A ] ◄──────────────────────────► [ Node C ]
          Next ───────────────────────►
          ◄─────────────────────────── Prev
```

---

### 2.3 Comprehensive Verification Test Suite

```csharp
using System;
using System.Diagnostics;

public static class DoublyLinkedListVerificationSuite {
    public static void RunAllTests() {
        TestAddFirstAndLast();
        TestAddAfterAndBefore();
        TestArbitraryNodeRemoval();
        TestClearAndSentinels();
        TestFailFastEnumerator();
        Console.WriteLine("✅ All DoublyLinkedList<T> Unit Tests Passed Successfully!");
    }

    private static void TestAddFirstAndLast() {
        var dll = new DoublyLinkedList<int>();
        var n20 = dll.AddFirst(20);
        var n10 = dll.AddFirst(10); // [10, 20]
        var n30 = dll.AddLast(30);  // [10, 20, 30]

        Debug.Assert(dll.Count == 3);
        Debug.Assert(dll.FirstNode == n10);
        Debug.Assert(dll.LastNode == n30);
        Debug.Assert(n20.Prev == n10 && n20.Next == n30);
    }

    private static void TestAddAfterAndBefore() {
        var dll = new DoublyLinkedList<string>();
        var first = dll.AddFirst("A");
        var last = dll.AddLast("C");
        var mid = dll.AddAfter(first, "B"); // [A, B, C]

        Debug.Assert(dll.Count == 3);
        Debug.Assert(first.Next == mid && mid.Prev == first);
        Debug.Assert(mid.Next == last && last.Prev == mid);
    }

    private static void TestArbitraryNodeRemoval() {
        var dll = new DoublyLinkedList<int>();
        var n1 = dll.AddLast(1);
        var n2 = dll.AddLast(2);
        var n3 = dll.AddLast(3);

        dll.Remove(n2); // Removes mid node in O(1)
        Debug.Assert(dll.Count == 2);
        Debug.Assert(n1.Next == n3 && n3.Prev == n1);

        int firstVal = dll.RemoveFirst();
        Debug.Assert(firstVal == 1);
        Debug.Assert(dll.Count == 1);
    }

    private static void TestClearAndSentinels() {
        var dll = new DoublyLinkedList<string>();
        dll.AddLast("X");
        dll.AddLast("Y");
        dll.Clear();
        Debug.Assert(dll.Count == 0);
        Debug.Assert(dll.IsEmpty);
        Debug.Assert(dll.FirstNode == null && dll.LastNode == null);
    }

    private static void TestFailFastEnumerator() {
        var dll = new DoublyLinkedList<int>();
        dll.AddLast(10);
        dll.AddLast(20);

        bool caught = false;
        try {
            foreach (var item in dll) {
                if (item == 10) dll.AddLast(30);
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

| Metric | Singly Linked List (`SinglyLinkedList<T>`) | Doubly Linked List (`DoublyLinkedList<T>`) |
| :--- | :--- | :--- |
| **Node Overhead in 64-bit CLR** | **32 bytes** (Header 8B + MT 8B + Val 8B + Next 8B) | **40 bytes** (Header 8B + MT 8B + Prev 8B + Next 8B + Val 8B) |
| **Removal of Arbitrary Node** | $O(N)$ (Must walk to find predecessor) | **Strictly $O(1)$** (Direct `node.Prev.Next = node.Next`) |
| **Removal of Last Node (`RemoveLast`)** | $O(N)$ (Must scan from head to find node before tail) | **Strictly $O(1)$** (Direct via `_tailSentinel.Prev`) |
| **Bidirectional Traversal** | Impossible (Requires list reversal) | Supported natively via `Prev` pointers |
| **Pointer Maintenance Overhead** | 1 pointer write per insertion | 4 pointer writes per insertion |

---

## 4. 🎬 DEMONSTRATE: Problem Walkthroughs

### 4.1 [LeetCode 146] LRU Cache — Production C# Implementation

```csharp
using System.Collections.Generic;

public class LRUCache {
    /// <summary>
    /// Bidirectional node storing both key and value for O(1) eviction cleanup.
    /// </summary>
    private class DNode {
        public int key;
        public int val;
        public DNode prev;
        public DNode next;

        public DNode(int key = 0, int val = 0) {
            this.key = key;
            this.val = val;
        }
    }

    private readonly int _capacity;
    private readonly Dictionary<int, DNode> _map;
    private readonly DNode _dummyHead;
    private readonly DNode _dummyTail;

    public LRUCache(int capacity) {
        _capacity = capacity;
        _map = new Dictionary<int, DNode>(capacity);

        // Initialize sentinels
        _dummyHead = new DNode();
        _dummyTail = new DNode();
        _dummyHead.next = _dummyTail;
        _dummyTail.prev = _dummyHead;
    }

    /// <summary>
    /// Retrieves the value of the key if present and marks it as Most Recently Used.
    /// Time Complexity: O(1)
    /// </summary>
    public int Get(int key) {
        if (!_map.TryGetValue(key, out DNode node)) {
            return -1;
        }

        // Access refresh: Move accessed node to head (MRU)
        MoveToHead(node);
        return node.val;
    }

    /// <summary>
    /// Inserts or updates the key-value pair, marking it as Most Recently Used.
    /// Evicts the Least Recently Used node if capacity is exceeded.
    /// Time Complexity: O(1)
    /// </summary>
    public void Put(int key, int value) {
        if (_map.TryGetValue(key, out DNode existingNode)) {
            // Key exists: update value and promote to MRU
            existingNode.val = value;
            MoveToHead(existingNode);
        } else {
            // New key: create and insert node
            var newNode = new DNode(key, value);
            _map[key] = newNode;
            AddToHead(newNode);

            // Check capacity limit
            if (_map.Count > _capacity) {
                // Evict LRU node from tail
                DNode lru = PopTail();
                _map.Remove(lru.key); // O(1) removal using node.key
            }
        }
    }

    // -------------------------------------------------------------
    // Private DLL Splicing Primitives
    // -------------------------------------------------------------

    private void AddToHead(DNode node) {
        node.next = _dummyHead.next;
        node.prev = _dummyHead;
        _dummyHead.next.prev = node;
        _dummyHead.next = node;
    }

    private void RemoveNode(DNode node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void MoveToHead(DNode node) {
        RemoveNode(node);
        AddToHead(node);
    }

    private DNode PopTail() {
        DNode lru = _dummyTail.prev;
        RemoveNode(lru);
        return lru;
    }
}
```

---

### 4.2 Visual Execution Trace

```
Operations:
1. cache = new LRUCache(2);
   State: dummyHead <──► dummyTail, map = {}

2. cache.Put(1, 10);
   State: dummyHead <──► [1:10] <──► dummyTail
   map = { 1 -> [1:10] }

3. cache.Put(2, 20);
   State: dummyHead <──► [2:20] <──► [1:10] <──► dummyTail
   map = { 1 -> [1:10], 2 -> [2:20] }

4. cache.Get(1); // Returns 10. Node 1 promoted to MRU!
   State: dummyHead <──► [1:10] <──► [2:20] <──► dummyTail
   (Notice [2:20] is now the LRU tail!)

5. cache.Put(3, 30); // Capacity exceeded!
   - PopTail() evicts [2:20]
   - map.Remove(2) -> key 2 removed
   - Insert [3:30] at head
   State: dummyHead <──► [3:30] <──► [1:10] <──► dummyTail
   map = { 1 -> [1:10], 3 -> [3:30] }

6. cache.Get(2); // Returns -1 (Not found)
```

#### Complexity Analysis:
- **Time Complexity:**
  - `Get(key)`: $O(1)$ average hash table lookup + $O(1)$ node pointer adjustments.
  - `Put(key, value)`: $O(1)$ average hash table insert/update + $O(1)$ node additions/evictions.
- **Space Complexity:** $O(C)$ where $C$ is the cache capacity. The hash map and linked list store at most $C + 1$ entries at any point.

---

### 4.3 Production Concurrency Considerations (Senior / Staff Engineer Level)

In a high-scale multithreaded backend (e.g. ASP.NET Core service):
- **The Paradox of LRU `Get`:** In standard dictionaries, `Get` is a pure read operation that can execute concurrently under a shared read lock (`ReaderWriterLockSlim.EnterReadLock()`).
- **In an LRU Cache, `Get` is a WRITE operation!** It mutates `prev` and `next` pointers to promote the node to the head!
- **Consequence:** If two threads call `Get()` simultaneously without synchronization, pointer race conditions will corrupt the doubly linked list, leading to memory leaks or deadlocks.
- **Production Solutions:**
  1. **Lock Striping:** Partition the keyspace into multiple smaller LRU caches based on `hash(key) % partitionCount` to reduce lock contention.
  2. **Clock / Approximated LRU (Second-Chance FIFO):** Avoid moving nodes on read; instead, set a volatile `isAccessed = 1` bit on read, and clear it during eviction passes (used in the Linux kernel page cache).

---

## 5. 🏋️ PRACTICE: Your Daily Challenges

Master composite data structures on LeetCode:

### Problem 1 (The Holy Grail): LeetCode 146 — LRU Cache (Medium)
- **Goal:** Implement the complete LRU Cache from scratch in under 20 minutes without compiler errors.
- **Target Complexity:** $O(1)$ `Get`, $O(1)$ `Put`, $O(C)$ space.

### Problem 2 (LFU Teaser): LeetCode 460 — LFU Cache (Hard)
- **Goal:** Read the problem description; understand why tracking frequency requires multiple doubly linked lists grouped by frequency tier.
- **Preview for Day 47!**

### Problem 3 (Hierarchical Design): LeetCode 588 — Design In-Memory File System (Hard)
- **Goal:** Implement a trie-like directory tree with composite file metadata and content streams.
- **Target Complexity:** $O(L)$ where $L$ is path length.

### Bonus / Staff Challenge: LeetCode 432 — All O`one Data Structure (Hard)
- **Goal:** Maintain max and min string frequencies in strict $O(1)$ time using a Doubly Linked List of frequency buckets containing hash sets.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Cache Architecture Decision Tree                     │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Evict based strictly on recency of access?
                   │   └─► LRU Cache: Hash Map + Single Doubly Linked List [LC 146]
                   │       (O(1) Get, O(1) Put, O(1) PopTail)
                   │
                   ├─► Evict based on frequency of access, breaking ties with recency?
                   │   └─► LFU Cache: Hash Map + Multi-Tier Doubly Linked Lists (Day 47) [LC 460]
                   │       (Tracking minFreq scalar in O(1))
                   │
                   ├─► Probabilistic O(log N) sorted key-value store without tree rotations?
                   │   └─► Skip List (Day 48) [LC 1206]
                   │
                   └─► Full Singly/Doubly Linked List API implementation from scratch?
                       └─► Design Linked List (Day 48) [LC 707]
```

---

## 7. 🎯 Day 46 Checkpoint Questions

Verify your mastery of doubly linked containers and composite cache structures:

1. **The Invariant of `node.key`:** If we omit `key` from `DNode` and only store `val`, why does `PopTail()` cause the time complexity of `Put` to degrade from $O(1)$ to $O(N)$?
2. **Sentinel Safety:** How do `dummyHead` and `dummyTail` ensure that calling `RemoveNode(node)` will never trigger a `NullReferenceException`, even if `node` was the only data element in the list?
3. **The `Put` Branching Logic:** When `Put(key, val)` is called and `key` already exists, what exact steps must occur with respect to the node's value, position in the DLL, and the cache's current capacity?
4. **Arbitrary Deletion Advantage:** Why can a `DoublyLinkedList<T>` delete an arbitrary node in $O(1)$ time when provided only the node reference, whereas a `SinglyLinkedList<T>` requires $O(N)$ time?
5. **Multithreaded Dilemma:** Why does an LRU Cache require exclusive locking even for read requests (`Get`), and what high-throughput architectures mitigate this bottleneck?
