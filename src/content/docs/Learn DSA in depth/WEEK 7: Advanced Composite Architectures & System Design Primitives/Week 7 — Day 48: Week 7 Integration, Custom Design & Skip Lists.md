---
title: "Week 7 — Day 48: Week 7 Integration, Custom Design & Skip Lists"
---

In **Days 43 to 47**, we explored advanced pointer graphs, arbitrary-precision arithmetic, $K$-way stream merging, and high-performance cache engines (LRU & LFU).

Today, we conquer **Custom Data Structure Design from Scratch**:
1. **API Design & Invariant Defensive Architecture ([LeetCode 707]):** Implementing a production-grade Doubly Linked List with dual sentinels and bidirectional search pruning.
2. **The Skip List Architecture ([LeetCode 1206]):** William Pugh’s elegant probabilistic alternative to Red-Black balanced search trees.
3. **The Express Lane Mental Model:** Multi-layered forward pointer towers enabling expected **$O(\log N)$ search, insertion, and deletion** without tree rotations.
4. **Why Redis and RocksDB Choose Skip Lists:** The physical systems advantages of skip lists over balanced binary search trees in concurrent and disk-backed engines.

---

## 1. 🧠 TEACH: Custom API Design & The Skip List Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* A **Skip List** is a probabilistic hierarchical data structure consisting of multiple layers of sorted linked lists that provides logarithmic search, insertion, and deletion.
  - *Core Invariants:* Geometric Level Invariant: A node is promoted to level $L+1$ with independent probability $P$ (typically $P = 0.5$ or $0.25$); Layered Express Invariant: Layer $0$ contains all $N$ elements; each higher layer skips over elements, acting as an express lane; Maximum Level: $L_{\max} = \lceil \log_{1/P} N \rceil$.
  - *Misconception Check:* Skip lists do *not* require complex rebalancing rotations like AVL or Red-Black trees; their balance is maintained probabilistically via coin flips during insertion.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the locking bottlenecks and complex tree rotation algorithms of self-balancing binary search trees in concurrent multi-threaded environments.
  - *Complexity Advantage:* Achieves expected $O(\log N)$ time for search, insertion, and deletion with simple sequential pointer rewiring.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Design SkipList" (LC 1206), Redis Sorted Sets (`ZSET`), LevelDB memtable index. Signal words: "design skip list", "concurrent sorted map", "probabilistic balanced search".
  - *When to Avoid / Failure Modes:* Memory-critical embedded systems where the pointer tower array overhead per node exceeds memory constraints.
- **4. WHERE:**
  - *Physical CLR Memory:* Tower nodes contain value `T` and an array of forward reference pointers (`Node[] Forward`); expected forward pointers per node is $1 / (1 - P) = 2$ for $P = 0.5$.
  - *Production Systems:* Redis `ZSET` internal data structure, Apache Cassandra and RocksDB MemTable in-memory SSTable staging buffers.
- **5. WHO:**
  - *Spoken Script:* "A Skip List is a probabilistic alternative to balanced trees that organizes linked lists into layered express lanes. By promoting nodes to higher levels with probability P, search, insertion, and deletion run in expected $O(\log N)$ time without complex rotations, making it exceptionally suited for concurrent lock-free systems like Redis ZSETs."
  - *Interviewer Evaluation Lens:* Evaluates candidate's understanding of coin-flip level generation, top-down search traversal, and update array tracking during insertions and deletions.
- **6. HOW:**
  - *Cost Model:* Search/Insert/Delete: Expected $O(\log N)$ time (Worst $O(N)$ with astronomically low probability); Space: $O(N)$ expected auxiliary space.
  - *State Transition Trace:* `Search: Start at top level head -> while (curr.forward[l]?.val < target) curr = curr.forward[l] -> drop to l - 1 -> repeat until level 0`.


### 1.1 Physical Mental Model: The Iron Bookends & The Multi-Level Express Subway

Custom linked list design and Skip Lists are grounded in two tangible physical systems: permanent mechanical bookends and express transit networks:

```
       ======================================================================
         PHYSICAL ANALOGY A: THE PERMANENT IRON BOOKENDS (LC 707)
       ======================================================================

       WITHOUT BOOKENDS:
       Empty shelf = null. Inserting first book or deleting last book requires
       special 'if' statements to reassign shelf boundaries.

       WITH PERMANENT IRON BOOKENDS (Dual Sentinels):
       [IRON BOOKEND: Head] <=======> [IRON BOOKEND: Tail]  (Size = 0)
       - The shelf is NEVER empty!
       - Inserting Book X: Always clips between two existing objects:
         `newNode.prev = pred; newNode.next = succ;`
         `pred.next = newNode; succ.prev = newNode;`
       - Zero boundary special cases!
```

```
       ======================================================================
         PHYSICAL ANALOGY B: THE MULTI-LEVEL EXPRESS SUBWAY (SKIP LIST)
       ======================================================================

       Level 2 (Bullet Train): [Depot] -----------------------> [Stop 40] -> null
                                  |                                |
       Level 1 (Express Line): [Depot] -------------> [Stop 20] -> [Stop 40] -> null
                                  |                      |         |
       Level 0 (Local Line):   [Depot] -> [10] -> ...-> [Stop 20]->[Stop 40] -> null

       RIDING TO STATION 35:
       1. Board Bullet Train on Level 2: Next is 40 (Overshoot!). Drop down escalator!
       2. Level 1 Express: Next is 20 (Ride to 20!). Next is 40 (Overshoot!). Drop down!
       3. Level 0 Local: Walk from 20 to 35 one block at a time.
       Result: Traversed the whole city in log(N) station checks without tree rotations!
```

```
       ======================================================================
           SKIPLIST TOWER MEMORY LAYOUT ON CLR MANAGED HEAP
       ======================================================================

       SkipListNode Object (Tower of Pointers):
       +---------------------------------------------+
       | Value: 25                                   |
       | forward[2]: 0x8000 (Pointer to Node 40 L2)  |  <--- Bullet Express
       | forward[1]: 0x6000 (Pointer to Node 31 L1)  |  <--- Express
       | forward[0]: 0x5000 (Pointer to Node 30 L0)  |  <--- Local
       +---------------------------------------------+
```

---

### 1.2 Custom Linked List API Design ([LeetCode 707])

Designing a linked list from scratch is a classic litmus test in technical screens. Most bugs occur due to:
- Loose index boundaries (`index < 0`, `index > size`, `index == size`).
- Off-by-one errors when advancing to insertion or deletion targets.
- Forgetting to synchronize the list's `size` counter.

#### The Dual Sentinel Architecture:
By enclosing the list between `dummyHead` and `dummyTail`:
```
dummyHead <──► [Node 0] <──► [Node 1] <──► ... <──► [Node N-1] <──► dummyTail
```
- Inserting at index 0 is identical to inserting at index $k$.
- Deleting the only element in the list requires **zero null checks**.
- **Bidirectional Optimization:** If `index < size / 2`, start from `dummyHead` and traverse forward; otherwise, start from `dummyTail` and traverse backward! This cuts average search traversal steps in half!

---

### 1.2 The Skip List Architecture (Probabilistic Balance)

Balanced Binary Search Trees (AVL trees, Red-Black trees) guarantee $O(\log N)$ time for search, insertion, and deletion. However:
- Red-Black trees require complex rotations, node recoloring, and dual parent/child link updates.
- Implementing a lock-free or concurrent Red-Black tree is notoriously difficult because tree rotations require locking large subtrees simultaneously.

In 1990, William Pugh published **Skip Lists**: a probabilistic data structure that achieves identical $O(\log N)$ expected time using **layered linked lists** with no rotations!

```
Level 3:  [Head] ─────────────────────────────► [25] ──────────────────────► null
             │                                    │
Level 2:  [Head] ──────────────► [10] ──────────► [25] ──────────► [40] ───► null
             │                     │              │                 │
Level 1:  [Head] ──────► [5] ──► [10] ──► [18] ─► [25] ──► [31] ─► [40] ───► null
             │            │        │        │      │        │       │
Level 0:  [Head] ──► 2 ─► 5 ──► 8 ─► 10 ─► 18 ──► 25 ─► 30 ─► 31 ─► 40 ───► null
```

#### The Intuition:
- **Level 0:** A standard sorted singly linked list containing ALL elements.
- **Level 1:** An "express lane" containing roughly $1/2$ of the elements.
- **Level 2:** A "super-express lane" containing roughly $1/4$ of the elements.
- **Level $k$:** Contains roughly $(1/2)^k$ of the elements.

#### How Search Operates in $O(\log N)$ Time:
1. Start at `dummyHead` at the topmost active level.
2. At each level, walk right as long as the next node's value is **strictly less than the target**:
   $$\text{while } (curr.forward[level] \ne \text{null } \&\& \ curr.forward[level].val < target) \implies curr = curr.forward[level];$$
3. When the next node is $\ge target$ (or `null`), **drop down one level** (`level--`).
4. Repeat until we reach Level 0.
5. If `curr.forward[0] != null && curr.forward[0].val == target`, the target is found!

---

### 1.3 Probabilistic Coin Tossing (Geometric Distribution)

How do we decide how many levels a new node should occupy?
We simulate a coin toss with probability $P = 1/2$:
```csharp
private int RandomLevel() {
    int level = 1;
    // With 50% probability, promote to next level
    while (_random.NextDouble() < 0.5 && level < MAX_LEVEL) {
        level++;
    }
    return level;
}
```
- Expected number of nodes at level $k$ is $N / 2^k$.
- The expected maximum height for $N$ elements is $\log_2 N$.
- At each level during search, we scan at most $1/P = 2$ nodes before dropping down.
- Therefore, expected search cost is $\frac{1}{P} \log_{1/P} N = \mathbf{2 \log_2 N = O(\log N)}$.

---

### 1.4 The `update[]` Array Invariant (Insertion & Deletion)

To insert a new node tower of height $L$, we must update the forward pointers of its predecessors at **every level from 0 to $L-1$**!

During our search traversal, we maintain an array:
$$\mathbf{update[MAX\_LEVEL]}$$
Where `update[i]` records the last node visited at level `i` before dropping down.

```
When inserting newNode of height 3:
For level i = 0, 1, 2:
  newNode.forward[i] = update[i].forward[i];
  update[i].forward[i] = newNode;
```

Similarly, when deleting `num`:
If `curr.forward[0].val == num`, we iterate from Level 0 upwards:
$$\mathbf{update[i].forward[i] = update[i].forward[i].forward[i]}$$

---

### 1.5 Why Redis Sorted Sets (`zset`) Use Skip Lists

In production systems design interviews, you may be asked: *"Why did Salvatore Sanfilippo (creator of Redis) choose Skip Lists over Red-Black trees for Sorted Sets?"*

1. **Range Queries are Trivial:** In a Skip List, once you find the start of a range at Level 0, you simply traverse `.forward[0]` sequentially! In a Red-Black tree, finding in-order successors across a range requires parent pointers or stack traversals.
2. **Simpler Concurrency:** Skip lists can be implemented lock-free using atomic Compare-And-Swap (CAS) on pointer towers. Concurrent Red-Black trees require complex multi-node tree locks.
3. **Memory Tunability:** By tuning the promotion probability $P$ (e.g. $P = 1/4$ instead of $1/2$), the memory overhead per node is only $\frac{1}{1 - P} - 1 = 1.33 - 1 = 0.33$ extra pointers per node—less than the 3 pointers (left, right, parent) + color bit of a Red-Black tree!

---

### 1.6 XOR Linked Lists: Memory-Efficient Bidirectional Traversal

A standard Doubly Linked List node requires two reference pointers on 64-bit platforms: `prev` (8 bytes) and `next` (8 bytes) = 16 bytes of pointer overhead per node.
An **XOR Linked List** reduces this overhead by half (to 8 bytes) by storing a single field:
$$\mathbf{\text{diff} = \text{prev} \oplus \text{next}}$$

#### The XOR Traversal Invariant:
Recall the algebraic self-inverse properties of XOR: $A \oplus (A \oplus B) = B$ and $B \oplus (A \oplus B) = A$.
- **Traversing Forward:** Given the address of the previous node `prev` and the current node `curr`:
  $$\mathbf{\text{next} = \text{curr.diff} \oplus \text{prev}}$$
- **Traversing Backward:** Given the address of the next node `next` and the current node `curr`:
  $$\mathbf{\text{prev} = \text{curr.diff} \oplus \text{next}}$$

```
Node A (addr: 0x10)       Node B (addr: 0x20)       Node C (addr: 0x30)
prev: 0x00, next: 0x20   prev: 0x10, next: 0x30   prev: 0x20, next: 0x00
diff = 0x00 ^ 0x20       diff = 0x10 ^ 0x30       diff = 0x20 ^ 0x00
     = 0x20                   = 0x20                   = 0x20

Forward traversal at Node B:
next = B.diff ^ addr(A) = 0x20 ^ 0x10 = 0x30 (Node C's address!)
```

#### The Managed Garbage Collection Hazard (.NET / Java):
In systems design interviews, why can you NOT implement a raw XOR Linked List using managed object references in .NET or Java?
1. **Compacting Garbage Collection:** Modern managed runtimes (CLR, JVM) use compacting generational collectors. During Gen 0/1/2 collection, live objects are moved to defragment memory. Their physical memory addresses change!
2. **Broken GC Roots:** Storing raw integer XOR bitmasks `(IntPtr)a ^ (IntPtr)b` blinds the GC. The runtime cannot identify these bit patterns as object references, causing the GC to reclaim live nodes prematurely.
3. **Safe Production Alternatives:** In managed code, if memory efficiency is paramount, XOR lists are implemented over **flat index arrays** (`int[]`) where indices (not memory addresses) are XORed: `diffIndex = prevIndex ^ nextIndex`.

*(Note: For the full mathematical exploration of probabilistic structures and skip lists, see Week 61-62: Probabilistic & Streaming Data Structures).*

---

### 1.6 Interview Spoken Drill (20–30 Seconds)

> *"A Skip List is a probabilistic alternative to balanced binary search trees that achieves $O(\log N)$ expected search, insertion, and deletion without tree rotations. It organizes elements into layered forward pointer towers where each higher level acts as an express lane skipping roughly half the elements. When inserting, we determine the node's tower height using a geometric coin toss with $P = 0.5$. During search, we maintain an update array of predecessors at each level, allowing us to splice the new tower in $O(\log N)$ time. Redis uses skip lists for Sorted Sets because they provide exceptional cache-friendly range scans and simpler concurrency than Red-Black trees."*

---

### 1.7 ⚙️ Core Operations Deep-Dive: Probabilistic Forward-Tower Maintenance & In-Place Splicing

#### Dimension 1: Operation Contract & Big-O Bounds

##### Skip List Operations (`Search`, `Insert`, `Erase`) & XOR Traversal (`Next`)
- **Signatures:**
  - `public bool Search(int target)`: Queries key existence in layered DAG.
  - `public void Add(int num)`: Generates geometric level $L$, collects predecessor vector `update[0..MAX]`, splices forward pointers.
  - `public bool Erase(int num)`: Collects predecessors, unlinks node across layers, adjusts active `_level`.
  - `public Node Next(Node curr, Node prev)`: Decodes next pointer in XOR list via `(Node)(curr.Diff ^ (IntPtr)prev)`.
- **Preconditions:**
  - `MAX_LEVEL` bounded (typically 16 or 32 for $N \le 2^{32}$).
  - Head sentinel initialized with `forward = new Node[MAX_LEVEL]`, all pointing to `null` or tail sentinel.
  - Probabilistic coin-toss generator initialized with uniform distribution $P = \frac{1}{2}$ or $P = \frac{1}{4}$.
- **Postconditions:**
  - Layer $0$ forms a fully sorted singly linked list containing all elements.
  - Layer $k$ contains a probabilistically sampled subset of layer $k-1$ preserving monotonicity.
  - `Erase` preserves predecessor-to-successor continuity across all $L$ towers previously occupied by the deleted node.
- **Complexity Bounds:**

| Operation | Time (Expected) | Time (Worst-Case) | Auxiliary Space | In-Place? |
| :--- | :--- | :--- | :--- | :--- |
| **`Search(val)`** | $O(\log N)$ | $O(N)$ (pathological coin flips) | $O(1)$ | Yes |
| **`Add(val)`** | $O(\log N)$ | $O(N)$ | $O(\text{MAX\_LEVEL})$ stack | No (allocates tower node) |
| **`Erase(val)`** | $O(\log N)$ | $O(N)$ | $O(\text{MAX\_LEVEL})$ stack | Yes |
| **`XOR Next`** | $O(1)$ | $O(1)$ | $O(1)$ | Yes |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                      Skip List `Add(val)` Execution Flow
                                       │
                         [curr = Head; level = _level - 1]
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 │
           ┌─► [curr.forward[level] != null             │
           │    && curr.forward[level].val < val?]      │
           │                  │                         │
          YES                 NO                        │
           │                  │                         │
    [curr = curr.        [update[level] = curr;         │
     forward[level]]      level--]                      │
           │                  │                         │
           └──────────────────┤                         │
                              ▼                         │
                        [level >= 0?] ───YES────────────┘
                              │ NO
                              ▼
                 [lvl = RandomLevel(MAX_LEVEL)]
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
             [lvl > _level?]       [lvl <= _level]
                    │                   │
           [Extend _level to lvl;       │
            update[i] = Head]           │
                    │                   │
                    └─────────┬─────────┘
                              ▼
                  [Allocate newNode(val, lvl)]
                              │
               [Loop i from 0 up to lvl - 1:
                newNode.forward[i] = update[i].forward[i];
                update[i].forward[i] = newNode]
                              │
                              ▼
                           [Return]
```

---

#### Dimension 3: Visual ASCII State Transitions

##### 1. Search Downward Drop & Express Lane Bypass
```
Level 2: [Head] ──────────────────────────► [20] ──────────────────────► null
           │                                  │
Level 1: [Head] ──────────► [10] ──────────► [20] ──────────► [30] ────► null
           │                  │               │                │
Level 0: [Head] ──► [5] ──► [10] ──► [15] ─► [20] ──► [25] ─► [30] ────► null
```
*Searching for `25`:*
1. At Level 2: `Head.forward[2] = 20 < 25`. Step right to `[20]`. `20.forward[2] = null`. Drop down to Level 1.
2. At Level 1: `20.forward[1] = 30 > 25`. Drop down to Level 0.
3. At Level 0: `20.forward[0] = 25 == 25`. Key found! Total node comparisons: 4 (instead of 6 sequential scans).

##### 2. Tower Insertion & Splicing (`Add(17)`, generated `lvl = 2`)
```
Predecessors collected in `update[]`:
update[1] = Node(10)
update[0] = Node(15)

Step 1: Allocate newNode(17) with forward array of size 2:
newNode.forward[1] = update[1].forward[1] (which was Node(20))
newNode.forward[0] = update[0].forward[0] (which was Node(20))

Step 2: Rewire predecessors:
update[1].forward[1] = newNode(17)
update[0].forward[0] = newNode(17)

State After Insertion:
Level 1: [10] ────────────────────────► [17] ──────────► [20]
          │                              │                │
Level 0: [10] ──────────► [15] ────────► [17] ──────────► [20]
```

---

#### Dimension 4: Invariant Preservation Proof

##### Theorem: Probabilistic Height Expectation & Logarithmic Search Bound
Let $p$ be the promotion probability (standard $p = 0.5$).
1. **Node Tower Height Distribution:**
   The height $H$ of any newly allocated node follows a geometric distribution with success probability $(1 - p)$:
   $$\mathbb{P}(H = k) = p^{k-1}(1 - p) \quad \text{for } k \ge 1$$
   The expected height of any node is:
   $$\mathbb{E}[H] = \sum_{k=1}^{\infty} k \cdot p^{k-1}(1 - p) = \frac{1}{1 - p} = \frac{1}{1 - 0.5} = 2$$
2. **Maximum Expected Levels:**
   For $N$ elements, the probability that a node reaches level $k$ is $p^{k-1} = 2^{-(k-1)}$. By union bound, the expected maximum level $L_{max}$ satisfying $\mathbb{E}[\text{count at } L] \approx 1$ is:
   $$N \cdot 2^{-(L-1)} = 1 \implies L_{max} = \log_2 N + 1$$
3. **Backward Search Path Analysis:**
   Tracing the search path in reverse from the target to the head:
   - At any node at level $i$, if the node does not extend to level $i+1$, we must have moved horizontally from its predecessor with probability $1 - p$.
   - If it extends to level $i+1$, we could have arrived from above with probability $p$.
   Let $C(k)$ be the expected number of steps to climb $k$ levels:
   $$C(k) = (1 - p)(1 + C(k)) + p(1 + C(k - 1)) \implies p C(k) = 1 + p C(k - 1) \implies C(k) = \frac{1}{p} + C(k - 1)$$
   For $L = \log_2 N$ levels with $p = 0.5$, total expected steps:
   $$\mathbb{E}[\text{Steps}] = \frac{L}{p} = 2 \log_2 N = O(\log N)$$

##### XOR Reversible Traversal Invariant:
For XOR Doubly Linked Lists, each node stores `Diff = prev ^ next`.
Given `curr` and its immediate predecessor `prev`:
$$\text{next} = \text{curr.Diff} \oplus \text{prev} = (\text{prev} \oplus \text{next}) \oplus \text{prev} = (\text{prev} \oplus \text{prev}) \oplus \text{next} = 0 \oplus \text{next} = \text{next}$$
Induction step guarantees that as long as two consecutive node addresses are known (starting at `Head` and dummy `prev = null`), the entire chain can be traversed deterministically in $O(1)$ space per hop.

---

#### Dimension 5: Edge Case Matrix

| Edge Case | State / Input | Algorithmic Mechanism | Invariant Preservation |
| :--- | :--- | :--- | :--- |
| **Empty Skip List Search** | `Head.forward[i] == null` | Loop drops immediately from `_level - 1` down to 0, returns `false` | Zero pointer exceptions; returns in $O(\log \text{MAX\_LEVEL})$ |
| **Coin Toss Exceeds `_level`** | `lvl > _level` | For $i \in [\_level, lvl-1]$, set `update[i] = Head`; update `_level = lvl` | New express lanes anchored directly at Head sentinel |
| **Duplicate Keys** | `Add(val)` when `val` exists | Inserts new node after existing duplicate at Layer 0 | Splicing remains monotonic ($\le$ holds across forward pointers) |
| **Delete Sole Highest Node** | `Erase(val)` removes sole node at `_level - 1` | While `_level > 1 && Head.forward[_level - 1] == null`, `_level--` | Head sentinel height shrinks dynamically, maintaining $O(\log N)$ bound |
| **XOR List Single Node** | `Head.Diff = 0 ^ 0 = 0` | Forward hop: `0 ^ null = 0` (null); reverse hop: `0 ^ null = 0` (null) | Both forward and backward traversals immediately terminate at boundaries |

---

---

### 🎤 Multi-Topic Spoken Synthesis Drill (≤ 60 Seconds)

#### Synthesis Drill: Skip List vs. Balanced BST vs. Composite LRU Cache
- **Skip List:** Multi-level probabilistic forward pointers. Expected $O(\log N)$ search/insert/delete without complex tree rotation code. Superior for concurrent/lock-free skiplists (e.g. MemTables in LevelDB/RocksDB).
- **Balanced BST:** Deterministic worst-case $O(\log N)$, but strict tree rotations cause heavy synchronization contention in multithreaded systems.
- **LRU Cache Composite:** Hash Table for $O(1)$ addressability + Doubly Linked List for $O(1)$ eviction order.


## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

### 2.1 [LeetCode 707] Design Linked List (Doubly Linked Implementation)

```csharp
public class MyLinkedList {
    private class Node {
        public int val;
        public Node prev;
        public Node next;
        public Node(int val = 0) {
            this.val = val;
        }
    }

    private readonly Node _head;
    private readonly Node _tail;
    private int _size;

    public MyLinkedList() {
        _head = new Node();
        _tail = new Node();
        _head.next = _tail;
        _tail.prev = _head;
        _size = 0;
    }

    /// <summary>
    /// Gets the value of the index-th node in O(min(index, size - index)) time.
    /// </summary>
    public int Get(int index) {
        if (index < 0 || index >= _size) return -1;

        Node curr = GetNodeAt(index);
        return curr.val;
    }

    public void AddAtHead(int val) {
        AddAtIndex(0, val);
    }

    public void AddAtTail(int val) {
        AddAtIndex(_size, val);
    }

    /// <summary>
    /// Inserts a node of value val before the index-th node.
    /// </summary>
    public void AddAtIndex(int index, int val) {
        if (index < 0 || index > _size) return;

        // Find successor node
        Node succ = (index == _size) ? _tail : GetNodeAt(index);
        Node pred = succ.prev;

        var newNode = new Node(val) {
            prev = pred,
            next = succ
        };

        pred.next = newNode;
        succ.prev = newNode;
        _size++;
    }

    /// <summary>
    /// Deletes the index-th node in O(min(index, size - index)) time.
    /// </summary>
    public void DeleteAtIndex(int index) {
        if (index < 0 || index >= _size) return;

        Node target = GetNodeAt(index);
        target.prev.next = target.next;
        target.next.prev = target.prev;
        _size--;
    }

    /// <summary>
    /// Helper: Bidirectional traversal optimization.
    /// </summary>
    private Node GetNodeAt(int index) {
        Node curr;
        if (index < _size / 2) {
            curr = _head.next;
            for (int i = 0; i < index; i++) curr = curr.next;
        } else {
            curr = _tail.prev;
            for (int i = 0; i < _size - 1 - index; i++) curr = curr.prev;
        }
        return curr;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:**
  - `AddAtHead`, `AddAtTail`: $O(1)$
  - `Get`, `AddAtIndex`, `DeleteAtIndex`: $O(\min(k, N - k))$ where $k = index$.
- **Space Complexity:** $O(N)$ for node storage.

---

### 2.2 [LeetCode 1206] Design Skiplist (Hard)

Design a Skiplist without using any built-in libraries.

```csharp
public class Skiplist {
    private const int MAX_LEVEL = 16;
    private const double PROBABILITY = 0.5;

    private class SkipNode {
        public int val;
        public SkipNode[] forward;

        public SkipNode(int val, int level) {
            this.val = val;
            this.forward = new SkipNode[level];
        }
    }

    private readonly SkipNode _head;
    private readonly Random _random;
    private int _level;

    public Skiplist() {
        _head = new SkipNode(-1, MAX_LEVEL);
        _random = new Random();
        _level = 1;
    }

    /// <summary>
    /// Returns true if target exists in the skiplist in expected O(log N) time.
    /// </summary>
    public bool Search(int target) {
        SkipNode curr = _head;

        // Traverse down from topmost active level to level 0
        for (int i = _level - 1; i >= 0; i--) {
            while (curr.forward[i] != null && curr.forward[i].val < target) {
                curr = curr.forward[i];
            }
        }

        // At level 0, check if the immediate next node matches target
        curr = curr.forward[0];
        return curr != null && curr.val == target;
    }

    /// <summary>
    /// Inserts num into the skiplist in expected O(log N) time.
    /// </summary>
    public void Add(int num) {
        var update = new SkipNode[MAX_LEVEL];
        SkipNode curr = _head;

        // Step 1: Find predecessors at every level
        for (int i = _level - 1; i >= 0; i--) {
            while (curr.forward[i] != null && curr.forward[i].val < num) {
                curr = curr.forward[i];
            }
            update[i] = curr;
        }

        // Step 2: Generate random level for new node
        int nodeLevel = RandomLevel();
        if (nodeLevel > _level) {
            for (int i = _level; i < nodeLevel; i++) {
                update[i] = _head;
            }
            _level = nodeLevel;
        }

        // Step 3: Splice new node into forward pointer towers
        var newNode = new SkipNode(num, nodeLevel);
        for (int i = 0; i < nodeLevel; i++) {
            newNode.forward[i] = update[i].forward[i];
            update[i].forward[i] = newNode;
        }
    }

    /// <summary>
    /// Removes num from the skiplist in expected O(log N) time.
    /// Returns true if num was found and removed.
    /// </summary>
    public bool Erase(int num) {
        var update = new SkipNode[MAX_LEVEL];
        SkipNode curr = _head;

        // Step 1: Find predecessors at every level
        for (int i = _level - 1; i >= 0; i--) {
            while (curr.forward[i] != null && curr.forward[i].val < num) {
                curr = curr.forward[i];
            }
            update[i] = curr;
        }

        curr = curr.forward[0];
        if (curr == null || curr.val != num) {
            return false; // Target not found
        }

        // Step 2: Unlink node from all levels it occupies
        for (int i = 0; i < _level; i++) {
            if (update[i].forward[i] != curr) break;
            update[i].forward[i] = curr.forward[i];
        }

        // Step 3: Lower active level if top levels are now empty
        while (_level > 1 && _head.forward[_level - 1] == null) {
            _level--;
        }

        return true;
    }

    private int RandomLevel() {
        int level = 1;
        while (_random.NextDouble() < PROBABILITY && level < MAX_LEVEL) {
            level++;
        }
        return level;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:**
  - `Search(target)`: Expected $O(\log N)$, worst case $O(N)$ (if coin toss is pathologically biased).
  - `Add(num)`: Expected $O(\log N)$.
  - `Erase(num)`: Expected $O(\log N)$.
- **Space Complexity:** Expected $O(N)$ — The average number of forward pointers per node is $\sum_{i=1}^\infty i \cdot (1/2)^i = 2$.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Apply custom data structure engineering on LeetCode:

### Problem 1 (API Invariant Design): LeetCode 707 — Design Linked List (Medium)
- **Goal:** Implement the full doubly linked list API with dual sentinels.
- **Target Complexity:** $O(1)$ head/tail operations, $O(N)$ index-based access.

### Problem 2 (The Benchmark): LeetCode 1206 — Design Skiplist (Hard)
- **Goal:** Implement the probabilistic multi-level Skip List from scratch.
- **Target Complexity:** Expected $O(\log N)$ search, insert, and delete.

### Problem 3 (Composite Dynamic Structure): LeetCode 380 — Insert Delete GetRandom O(1) (Medium)
- **Goal:** Combine a `List<int>` with a `Dictionary<int, int>` to achieve $O(1)$ insert, delete, and uniform random sampling using the **swap-with-tail deletion pattern**.
- **Target Complexity:** Strictly $O(1)$ average time for all operations.

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Ordered Set & Custom Design Decision Tree            │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Need O(1) Insert, Delete, and GetRandom?
                   │   └─► Dynamic Array + Hash Map (Swap with Tail) [LC 380]
                   │
                   ├─► Need strict O(1) Key-Value Eviction by Recency/Frequency?
                   │   └─► LRU / LFU Composite Architectures [LC 146, LC 460]
                   │
                   ├─► Need O(log N) Sorted Set with Cache-Friendly Range Traversal?
                   │   └─► Skip List (Layered Forward Towers, P = 0.5) [LC 1206]
                   │
                   └─► Preparing for Week 7 Milestone Assessment?
                       └─► Mock Interview Simulation (Day 49) [LC 25, LC 146]
```

### Preview for Day 49: Phase 2 Part 1 Milestone Assessment & Mock Interview Simulation
Tomorrow in **Day 49**, you face the ultimate Phase 2 Milestone Assessment under strict 90-minute Big Tech interview simulation conditions:
- **Problem 1 (Structural Transformations, 45 min):** [LeetCode 25] Reverse Nodes in k-Group (Hard)
- **Problem 2 (System Design Primitive, 45 min):** [LeetCode 146] LRU Cache (Medium)
- **Full Retrospective:** Audit of Days 36–49, celebration of Linked List and Cache Architecture mastery!

---

## 5. 🎯 Day 48 Checkpoint Questions

Verify your mastery of custom linked list engineering and skip lists:

1. **Geometric Level Distribution:** If a Skip List has $N = 1,000,000$ elements with $P = 1/2$, what is the expected height of the Skip List, and approximately how many total forward pointers are allocated across all nodes?
2. **The `update[]` Array Role:** In LeetCode 1206, why is recording the predecessors in an `update` array necessary during `Add` and `Erase`? Why can we not simply update Level 0 and let higher levels take care of themselves?
3. **Range Scan Comparison:** Explain why Redis utilizes Skip Lists instead of Red-Black Trees for its `ZRANGEBYSCORE` command.
4. **Bidirectional Pruning:** In LeetCode 707, prove why checking `if (index < _size / 2)` guarantees that the maximum number of pointer dereferences to reach any node is at most $\lfloor N / 2 \rfloor$.
5. **XOR Linked List GC Hazard:** Why does an XOR linked list halve pointer overhead, and why is manipulating raw memory addresses via XOR illegal in a compacting garbage collector like the .NET CLR? How can it be safely implemented using array indices?
