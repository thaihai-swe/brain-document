---
title: "Week 7 — Day 46: Doubly Linked Lists & The LRU Cache Architecture"
---

# 🚀 Week 7 — Day 46: Doubly Linked Lists & The LRU Cache Architecture

In **Day 45**, we scaled list merging across $K$ sorted streams, proving why Divide-and-Conquer beats Min-Heaps in physical CPU cache efficiency.

Today, we build one of the most celebrated and frequently asked composite data structures in Big Tech interview history:
1. **The LRU Cache Eviction Policy:** Evicting the Least Recently Used item in strict **$O(1)$ average time** for both `Get` and `Put`.
2. **The Architectural Deduction:** Proving why Arrays, Hash Maps, and Singly Linked Lists all fail in isolation, necessitating a synchronized **Hash Map + Doubly Linked List (DLL)**.
3. **The Dual Sentinel Pattern (`dummyHead` & `dummyTail`):** Eliminating all edge cases, null pointer dereferences, and conditional checks during node splicing.
4. **The Bidirectional Key Storage Invariant:** Why nodes in the linked list **must** store both `key` and `value` to achieve $O(1)$ eviction.
5. **Concurrency & Thread Safety:** Why LRU `Get()` is technically a mutation and how production caching engines handle concurrent reads.

---

## 1. 🧠 TEACH: Architectural Deduction of the LRU Cache

### 1.1 Problem Specification ([LeetCode 146])

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

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

### 2.1 [LeetCode 146] LRU Cache — Production C# Implementation

```csharp
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

### 2.2 Visual Execution Trace

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

### 2.3 Production Concurrency Considerations (Senior / Staff Engineer Level)

In a high-scale multithreaded backend (e.g. ASP.NET Core service):
- **The Paradox of LRU `Get`:** In standard dictionaries, `Get` is a pure read operation that can execute concurrently under a shared read lock (`ReaderWriterLockSlim.EnterReadLock()`).
- **In an LRU Cache, `Get` is a WRITE operation!** It mutates `prev` and `next` pointers to promote the node to the head!
- **Consequence:** If two threads call `Get()` simultaneously without synchronization, pointer race conditions will corrupt the doubly linked list, leading to memory leaks or deadlocks.
- **Production Solutions:**
  1. **Lock Striping:** Partition the keyspace into multiple smaller LRU caches based on `hash(key) % partitionCount` to reduce lock contention.
  2. **Clock / Approximated LRU (Second-Chance FIFO):** Avoid moving nodes on read; instead, set a volatile `isAccessed = 1` bit on read, and clear it during eviction passes (used in the Linux kernel page cache).

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

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

## 4. 🔗 CONNECT: The Pattern Decision Bridge

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

### Preview for Day 47: Advanced Cache Architecture — The LFU Cache
Tomorrow in **Day 47**, we conquer one of the hardest composite data structure problems on LeetCode:
- **[LeetCode 460] LFU Cache (Hard):** Least Frequently Used cache eviction.
- Why a single doubly linked list is insufficient.
- **The Two-Table Architecture:** `nodeTable: Dictionary<int, LfuNode>` synchronized with `freqTable: Dictionary<int, DoublyLinkedList>`.
- Maintaining a global `minFreq` scalar in $O(1)$ time across frequency promotions and evictions.

---

## 5. 🎯 Day 46 Checkpoint Questions

Verify your mastery of composite cache structures:

1. **The Invariant of `node.key`:** If we omit `key` from `DNode` and only store `val`, why does `PopTail()` cause the time complexity of `Put` to degrade from $O(1)$ to $O(N)$?
2. **Sentinel Safety:** How do `dummyHead` and `dummyTail` ensure that calling `RemoveNode(node)` will never trigger a `NullReferenceException`, even if `node` was the only data element in the list?
3. **The `Put` Branching Logic:** When `Put(key, val)` is called and `key` already exists, what exact steps must occur with respect to the node's value, position in the DLL, and the cache's current capacity?
4. **Multithreaded Dilemma:** Why does an LRU Cache require exclusive locking even for read requests (`Get`), and what high-throughput architectures mitigate this bottleneck?
