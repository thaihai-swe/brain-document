---
title: "Week 7 — Day 47: Advanced Cache Architecture — The LFU Cache"
---

In **Day 46**, we mastered the **LRU Cache**, synchronizing a Hash Map with a single Doubly Linked List to achieve $O(1)$ recency tracking.

Today, we conquer what is widely regarded as the **gold standard of composite data structure design** in Big Tech interviews:
1. **The LFU Cache Policy ([LeetCode 460]):** Evicting items with the lowest access frequency, breaking ties using recency (Least Recently Used among the least frequently used).
2. **Why Single Doubly Linked Lists Fail:** Why tracking both frequency tiers and recency within tiers requires a **Multi-Tier Composite Architecture**.
3. **The Two-Table Blueprint:** Synchronizing `nodeTable: Dictionary<int, LfuNode>` with `freqTable: Dictionary<int, DoublyLinkedList>`.
4. **The $O(1)$ `minFreq` Invariant:** Proving how the global minimum frequency scalar is tracked in $O(1)$ time during frequency promotions and evictions without searching.
5. **Production C# Implementation:** A clean, modular, bug-free implementation ready for Staff-level interviews.

---

## 1. 🧠 TEACH: The Multi-Tier Architecture of the LFU Cache

### 1.1 The LFU Problem Specification

Design a data structure that implements a **Least Frequently Used (LFU) cache**:
- `LFUCache(int capacity)`: Initializes the object with the capacity of the data structure.
- `int Get(int key)`: Gets the value of the `key` if the `key` exists in the cache. Otherwise, returns `-1`.
- `void Put(int key, int value)`: Updates the value of the `key` if present, or inserts the `key` if not already present. When the cache reaches its capacity, it should **invalidate and remove the least frequently used key** before inserting a new item.
- **Tie-Breaker:** For this problem, when there is a **tie** (i.e. two or more keys with the same frequency), the **least recently used** key among them is invalidated.
- **Performance Requirement:** Both `Get` and `Put` must execute in **$O(1)$ average time complexity**.

---

### 1.2 Why Min-Heaps and Single Linked Lists Fail

| Proposed Architecture | Frequency Update (`Get`/`Put`) | Eviction Time | Fatal Flaw |
| :--- | :---: | :---: | :--- |
| **Min-Heap on Frequency** | $O(\log N)$ (Heapify-down) | $O(\log N)$ | Violates strict $O(1)$ requirement; priority update on existing node is slow. |
| **Sorted Doubly Linked List** | $O(N)$ (Search insertion point) | $O(1)$ | Splicing a promoted node past nodes with equal or higher frequency takes linear time. |
| **Single DLL (like LRU)** | N/A | N/A | Cannot track both frequency count and chronological recency in a single linear sequence. |
| **Two Dictionaries + Multi-DLL** | **$O(1)$** | **$O(1)$** | **OPTIMAL:** Isolates frequencies into independent doubly linked lists! |

---

### 1.3 The Two-Table Architecture

To achieve $O(1)$ for both metrics (frequency and recency), we decompose the cache into:

1. **`nodeTable: Dictionary<int, LfuNode>`**
   - Maps `key` $\to$ `LfuNode`.
   - Each `LfuNode` holds: `key`, `val`, `freq`, `prev`, and `next`.
   - Gives instant $O(1)$ address lookup for any key.

2. **`freqTable: Dictionary<int, DoublyLinkedList>`**
   - Maps frequency count `f` $\to$ a dedicated `DoublyLinkedList` containing all nodes accessed exactly `f` times.
   - Within each frequency list, nodes are ordered by recency:
     - **Head:** Most Recently Used node of frequency `f`.
     - **Tail:** Least Recently Used node of frequency `f`.

3. **Global Scalar: `int minFreq`**
   - Stores the minimum frequency currently existing in the cache.
   - Enables $O(1)$ eviction lookup without scanning the frequency table!

```
nodeTable:
  Key 1 ──► [ Node(key:1, val:A, freq:2) ]
  Key 2 ──► [ Node(key:2, val:B, freq:1) ]
  Key 3 ──► [ Node(key:3, val:C, freq:1) ]

freqTable:
  Freq 1: dummyHead <──► [ Node 3 ] <──► [ Node 2 ] <──► dummyTail
                           (MRU of F1)    (LRU of F1)  ◄── Eviction target!

  Freq 2: dummyHead <──► [ Node 1 ] <──► dummyTail
                           (MRU of F2)

minFreq = 1
```

---

### 1.4 The Two Invariant Laws of LFU State Maintenance

#### Law 1: The Promotion Invariant (`UpdateFrequency`)
Whenever a node $X$ with frequency $F$ is accessed via `Get(key)` or updated via `Put(key, newVal)`:
1. Remove $X$ from `freqTable[F]`.
2. Increment $X.freq = F + 1$.
3. Add $X$ to the head of `freqTable[F + 1]` (creating `freqTable[F + 1]` if it doesn't exist).
4. **The `minFreq` Maintenance Rule:**
   $$\text{If } F == minFreq \text{ and } freqTable[F].Count == 0 \implies \mathbf{minFreq = F + 1}$$
   *Proof:* Since node $X$ was promoted to $F + 1$, if no other nodes remain with frequency $F$, the new minimum frequency in the entire cache must be $F + 1$!

#### Law 2: The New Insertion & Eviction Invariant
When inserting a brand new key via `Put(newKey, val)`:
1. If the cache is at capacity:
   - Identify the victim list: `freqTable[minFreq]`.
   - Evict the least recently used node: `LfuNode victim = freqTable[minFreq].PopTail()`.
   - Remove `victim.key` from `nodeTable`.
2. Create `newNode` with `freq = 1`.
3. Add `newNode` to `nodeTable` and to `freqTable[1]`.
4. **The `minFreq` Reset Rule:**
   $$\mathbf{minFreq = 1}$$
   *Proof:* A brand new node always enters with access count 1. Therefore, the minimum frequency in the cache is guaranteed to be 1!

---

### 1.5 Interview Spoken Drill (20–30 Seconds)

> *"To implement an LFU Cache with $O(1)$ Get and Put, I synchronize two hash tables with multiple doubly linked lists. The nodeTable maps keys to physical nodes for $O(1)$ lookup, while the freqTable maps each frequency count to an independent Doubly Linked List that orders nodes of that frequency by recency. I maintain a global minFreq scalar. On node access, I remove the node from its current frequency list and insert it into the list for frequency plus one, incrementing minFreq if the old frequency list became empty. On eviction at capacity, I simply pop the tail of freqTable[minFreq] in $O(1)$ time, and on new node insertion, minFreq is unconditionally reset to 1."*

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

### 2.1 [LeetCode 460] LFU Cache — Production C# Implementation

```csharp
public class LFUCache {
    /// <summary>
    /// Node storing key, value, access frequency, and bidirectional pointers.
    /// </summary>
    private class LfuNode {
        public int key;
        public int val;
        public int freq;
        public LfuNode prev;
        public LfuNode next;

        public LfuNode(int key, int val) {
            this.key = key;
            this.val = val;
            this.freq = 1; // Initial frequency is always 1
        }
    }

    /// <summary>
    /// Standalone Doubly Linked List maintaining recency order within a single frequency tier.
    /// </summary>
    private class DoublyLinkedList {
        private readonly LfuNode _dummyHead;
        private readonly LfuNode _dummyTail;
        public int Count { get; private set; }

        public DoublyLinkedList() {
            _dummyHead = new LfuNode(0, 0);
            _dummyTail = new LfuNode(0, 0);
            _dummyHead.next = _dummyTail;
            _dummyTail.prev = _dummyHead;
            Count = 0;
        }

        public void AddToHead(LfuNode node) {
            node.next = _dummyHead.next;
            node.prev = _dummyHead;
            _dummyHead.next.prev = node;
            _dummyHead.next = node;
            Count++;
        }

        public void RemoveNode(LfuNode node) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
            Count--;
        }

        public LfuNode PopTail() {
            if (Count == 0) return null;
            LfuNode lru = _dummyTail.prev;
            RemoveNode(lru);
            return lru;
        }
    }

    private readonly int _capacity;
    private int _minFreq;
    private readonly Dictionary<int, LfuNode> _nodeTable;
    private readonly Dictionary<int, DoublyLinkedList> _freqTable;

    public LFUCache(int capacity) {
        _capacity = capacity;
        _minFreq = 0;
        _nodeTable = new Dictionary<int, LfuNode>(capacity);
        _freqTable = new Dictionary<int, DoublyLinkedList>();
    }

    /// <summary>
    /// Retrieves value and promotes frequency tier in O(1) time.
    /// </summary>
    public int Get(int key) {
        if (!_nodeTable.TryGetValue(key, out LfuNode node)) {
            return -1;
        }

        UpdateFrequency(node);
        return node.val;
    }

    /// <summary>
    /// Inserts or updates key-value pair in O(1) time, evicting LFU/LRU if at capacity.
    /// </summary>
    public void Put(int key, int value) {
        if (_capacity <= 0) return;

        if (_nodeTable.TryGetValue(key, out LfuNode existingNode)) {
            existingNode.val = value;
            UpdateFrequency(existingNode);
        } else {
            // Evict if cache is full
            if (_nodeTable.Count >= _capacity) {
                DoublyLinkedList minList = _freqTable[_minFreq];
                LfuNode victim = minList.PopTail();
                _nodeTable.Remove(victim.key);
            }

            // Create and insert new node
            var newNode = new LfuNode(key, value);
            _nodeTable[key] = newNode;

            if (!_freqTable.TryGetValue(1, out DoublyLinkedList list1)) {
                list1 = new DoublyLinkedList();
                _freqTable[1] = list1;
            }
            list1.AddToHead(newNode);

            // New node always resets minFreq to 1
            _minFreq = 1;
        }
    }

    /// <summary>
    /// Promotes a node from freq -> freq + 1 and adjusts minFreq in O(1).
    /// </summary>
    private void UpdateFrequency(LfuNode node) {
        int oldFreq = node.freq;
        DoublyLinkedList oldList = _freqTable[oldFreq];
        oldList.RemoveNode(node);

        // If the old list was the minimum frequency tier and is now empty, advance minFreq
        if (oldFreq == _minFreq && oldList.Count == 0) {
            _minFreq++;
        }

        // Increment node frequency
        node.freq++;

        // Add node to the new frequency list
        if (!_freqTable.TryGetValue(node.freq, out DoublyLinkedList newList)) {
            newList = new DoublyLinkedList();
            _freqTable[node.freq] = newList;
        }
        newList.AddToHead(node);
    }
}
```

---

### 2.2 Visual Execution Trace

```
Capacity = 2

1. Put(1, 10):
   nodeTable: { 1: Node(1, 10, f=1) }
   freqTable: { 1: [Node 1] }
   minFreq = 1

2. Put(2, 20):
   nodeTable: { 1: Node(1, 10, f=1), 2: Node(2, 20, f=1) }
   freqTable: { 1: [Node 2, Node 1] }  (Node 2 is MRU, Node 1 is LRU)
   minFreq = 1

3. Get(1):
   - Node 1 promoted from f=1 to f=2
   - freqTable[1] now has only [Node 2] (Count = 1 != 0, so minFreq remains 1)
   - freqTable[2] has [Node 1]
   minFreq = 1

4. Put(3, 30): Capacity reached!
   - minFreq is 1. We evict from freqTable[1].
   - freqTable[1] tail is Node 2 -> POP Node 2!
   - nodeTable.Remove(2)
   - Insert Node 3 with f=1.
   - minFreq = 1.
   State:
   freqTable[1]: [Node 3]
   freqTable[2]: [Node 1]
   nodeTable: { 1, 3 }

5. Get(2): Returns -1 (Correctly evicted!)

6. Get(3): Promotes Node 3 to f=2.
   - freqTable[1] becomes empty!
   - Because 1 == minFreq, minFreq increments to 2!
   State:
   freqTable[2]: [Node 3, Node 1] (Node 3 is MRU, Node 1 is LRU)
   minFreq = 2

7. Put(4, 40): Capacity reached!
   - minFreq is 2. Both Node 3 and Node 1 have f=2!
   - Tie-breaker: Evict LRU from freqTable[2] -> POP Node 1!
   - Insert Node 4 with f=1.
   - minFreq resets to 1!
```

#### Complexity Analysis:
- **Time Complexity:**
  - `Get(key)`: $O(1)$ average dictionary lookup + $O(1)$ DLL detachment and attachment = strictly **$O(1)$**.
  - `Put(key, value)`: $O(1)$ average dictionary lookup + $O(1)$ eviction + $O(1)$ DLL insertion = strictly **$O(1)$**.
- **Space Complexity:** $O(C)$ where $C$ is capacity. The data nodes and doubly linked list instances are proportional to the number of stored keys.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Conquer complex composite data structures on LeetCode:

### Problem 1 (The Everest of Cache Design): LeetCode 460 — LFU Cache (Hard)
- **Goal:** Implement the dual-table LFU Cache from scratch in under 30 minutes without reference.
- **Target Complexity:** $O(1)$ `Get`, $O(1)$ `Put`, $O(C)$ space.

### Problem 2 (Doubly Linked Frequency Buckets): LeetCode 432 — All O`one Data Structure (Hard)
- **Goal:** Maintain strings with maximum and minimum counts in $O(1)$ time by chaining frequency bucket nodes together in a Doubly Linked List.
- **Target Complexity:** $O(1)$ `Inc`, $O(1)$ `Dec`, $O(1)$ `GetMaxKey`, $O(1)$ `GetMinKey`.

### Problem 3 (Frequency Stack): LeetCode 895 — Maximum Frequency Stack (Hard)
- **Goal:** Push elements, and pop the most frequent element (breaking ties by recency).
- **Hint:** Synchronize a `freqMap: Dictionary<int, int>` with a `groupStack: Dictionary<int, Stack<int>>` and track `maxFreq` scalar!

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Composite Cache Design Decision Tree                 │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Evict based strictly on access recency?
                   │   └─► LRU Cache: Hash Map + 1 Doubly Linked List [LC 146]
                   │
                   ├─► Evict based on frequency, tie-break on recency?
                   │   └─► LFU Cache: Hash Map + Multi-DLL by Frequency [LC 460]
                   │       (Track minFreq scalar in O(1))
                   │
                   ├─► Pop element with maximum frequency?
                   │   └─► FreqStack: Hash Map + Multi-Stack by Frequency [LC 895]
                   │       (Track maxFreq scalar in O(1))
                   │
                   └─► Probabilistic O(log N) balance without tree rotations?
                       └─► Skip List (Day 48) [LC 1206]
```

### Preview for Day 48: Week 7 Integration, Custom Design & Skip Lists
Tomorrow in **Day 48**, we conclude Week 7's core concepts with custom architectural design:
- **[LeetCode 707] Design Linked List:** Building an industrial-grade Singly/Doubly Linked List API from scratch.
- **[LeetCode 1206] Design Skiplist (Hard):** The probabilistic alternative to Red-Black Balanced Binary Search Trees. Using geometric random coin flips ($P = 1/2$) to build forward pointer towers for $O(\log N)$ search, insertion, and deletion.

---

## 5. 🎯 Day 47 Checkpoint Questions

Verify your mastery of LFU Cache state transitions:

1. **The `minFreq` Increment Invariant:** In `UpdateFrequency(LfuNode node)`, under what exact logical condition must `_minFreq` be incremented by 1? Why can `minFreq` never jump by more than +1 during a node promotion?
2. **The `minFreq` Reset Invariant:** Why does adding a brand new key in `Put` always set `_minFreq = 1`, regardless of what `_minFreq` was before the call?
3. **Empty Frequency Cleanup:** In our implementation, we did not remove empty `DoublyLinkedList` instances from `_freqTable`. Why is leaving empty DLLs in the dictionary harmless in terms of both time complexity and memory overhead?
4. **Capacity Zero Edge Case:** If `capacity == 0`, what does the standard `Put` method do? Why must `if (capacity <= 0) return;` be guarded at the very top of `Put`?
