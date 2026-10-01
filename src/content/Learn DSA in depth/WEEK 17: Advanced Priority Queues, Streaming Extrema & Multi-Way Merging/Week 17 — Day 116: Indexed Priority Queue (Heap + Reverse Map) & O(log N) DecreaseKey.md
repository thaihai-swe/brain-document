---
title: "Week 17 — Day 116: Indexed Priority Queue (Heap + Reverse Map) & O(log N) DecreaseKey"
---

# Week 17 — Day 116: Indexed Priority Queue (Heap + Reverse Map) & O(log N) DecreaseKey

Welcome to **Day 116 of your DSA Mastery Journey**!

Yesterday, on Day 115, you learned the Lazy Deletion pattern to reconcile stale entries in immutable priority queues like .NET's `PriorityQueue<TElement, TPriority>`. While lazy deletion is powerful, it has fundamental limitations: it cannot eagerly alter an existing element's position, and it increases the heap size to $O(N + D)$ with duplicate keys.

Today, we build the ultimate, fully controllable priority queue architecture: **The Indexed Priority Queue (IPQ)**.

By augmenting an implicit binary heap with an **inverse position mapping** (`pos[key] -> heapIndex`), we achieve total state controllability. You will learn how to inspect, mutate, and delete any arbitrary element in the heap, executing **`DecreaseKey`**, **`IncreaseKey`**, and **`Delete`** in strictly **$O(\log N)$ time**, while maintaining **$O(1)$ `Contains`** queries.

This data structure is the direct algorithmic engine powering **Dijkstra’s Single-Source Shortest Path** and **Prim’s Minimum Spanning Tree** algorithms in production routing systems worldwide.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               DAY 116: INDEXED PRIORITY QUEUE (IPQ)                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       FORWARD HEAP ARRAY          │                             │      INVERSE POSITION MAP         │
│          _heap[heapIndex]         │                             │           _pos[key]               │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Stored level-by-level:          │                             │ • Maps each unique key to its     │
│   _heap[i] = Key at heap index i. │ ◄── Bi-directional Sync ──► │   exact current index in _heap.   │
│ • Enforces heap-order invariant:  │                             │ • Enables O(1) key location:      │
│   Priority(parent) <= Priority(ch)│                             │   int idx = _pos[key];            │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         THE IPQ OPERATIONS REVOLUTION       │
                          ├─────────────────────────────────────────────┤
                          │ • Contains(key):          O(1)              │
                          │ • DecreaseKey(key, prio): O(log N)          │
                          │ • IncreaseKey(key, prio): O(log N)          │
                          │ • Delete(key):            O(log N)          │
                          │ • ExtractMin():           O(log N)          │
                          │ • Space: Strictly O(V) with ZERO duplicates!│
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* An **Indexed Priority Queue (IPQ)** is a priority queue where every element is identified by a unique, immutable key $k \in K$. It maintains an internal implicit binary heap of keys coupled with an inverse index table $\text{pos}: K \to [0, N-1]$ such that $\text{pos}[k]$ returns the exact array index of key $k$ within the heap at any given moment.
  - *Invariants:*
    1. **Heap-Order Invariant:** $\forall i \in [1, N-1]: \text{prio}[\text{heap}[\lfloor(i-1)/2\rfloor]] \le \text{prio}[\text{heap}[i]]$.
    2. **Bidirectional Invertibility Invariant:** $\forall i \in [0, N-1]: \text{pos}[\text{heap}[i]] = i$ and $\text{heap}[\text{pos}[k]] = k$.
  - *Misconception Check:*
    - *Misconception 1:* "Can't we just find an item in a standard heap by binary search?" **False!** A binary heap is partially ordered vertically (parent $\le$ child), but completely unordered horizontally (siblings have no relation). Finding a key without an index map requires an $O(N)$ linear scan.
    - *Misconception 2:* "Lazy priority queues are just as good as IPQs for Dijkstra." **False!** A lazy priority queue pushes duplicate vertices for every edge relaxation, bloating the queue to $O(E)$ elements and taking $O(E \log E)$ time. An IPQ updates the vertex in-place via `DecreaseKey`, guaranteeing the heap never exceeds $|V|$ elements and achieving $O(E \log V)$ time with strictly $O(V)$ space.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *The Bottleneck:* In graph algorithms, when a shorter path to a vertex $u$ is discovered, its tentative distance $d[u]$ decreases. In standard heaps, you cannot update an element's priority without linear search ($O(N)$) or pushing duplicates ($O(E)$ space).
  - *The IPQ Solution:* With `pos[u]`, we immediately find $u$'s heap index in $O(1)$ time, update its priority, and call `SiftUp(pos[u])` in $O(\log N)$ time, achieving in-place updates.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Dijkstra’s Single-Source Shortest Paths on dense or memory-constrained graphs.
    - Prim’s Minimum Spanning Tree algorithm.
    - Task schedulers requiring dynamic priority reprioritization or immediate cancellation.
    - A* search algorithms where heuristic estimates improve dynamically.
  - *When to Avoid / Failure Modes:*
    - When keys are non-hashable and cannot be mapped to integer indices.
    - Simple Top-K or streaming extrema problems where elements are never modified after insertion.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Dense Key Sets ($0 \le k < V$):* Represented using 3 flat primitive arrays: `int[] heap`, `int[] pos`, and `TPriority[] priorities`. Zero dictionary lookups, zero hashing overhead, and perfect L1 cache line alignment!
  - *Sparse/Object Keys:* Backed by a generic `Dictionary<TKey, int> pos` and flat arrays for the heap and priorities.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "An Indexed Priority Queue solves the limitation of standard heaps by maintaining an inverse position map alongside the heap array. The heap stores keys, while the position map tracks where each key lives in the heap. Whenever two elements are swapped during sifting, the position map is synchronized in $O(1)$. This allows us to locate any key in $O(1)$ time and execute `DecreaseKey`, `IncreaseKey`, or `Delete` in strictly $O(\log N)$ time, guaranteeing that Dijkstra's algorithm runs in $O(E \log V)$ time and strictly $O(V)$ space."
- **6. HOW (Operations, Implementation & State Trace):**
  - *Complexity Profile:* `Contains`: $\Theta(1)$; `Peek`: $\Theta(1)$; `Insert`: $\Theta(\log N)$; `DecreaseKey`: $\Theta(\log N)$; `Delete`: $\Theta(\log N)$; `ExtractMin`: $\Theta(\log N)$. Space: $\Theta(V)$.

---

### 1.1 Physical Mental Model — The Coat Check Room & Two-Way Claim Board

**Everyday Analogy: Tracking Moving Jackets in a Coat Check Room**

Imagine a coat check room where $N$ jackets move between hooks constantly as high-priority VIP jackets bubble to the front:
- In a standard heap, jackets are swapped between hooks, but nobody keeps a record of which hook holds which jacket.
- If you ask the attendant: *"Where is Jacket #42? I want to upgrade its ticket,"* the attendant must walk down every aisle checking all 10,000 hooks ($O(N)$ linear search!).

**The IPQ Solution: The Two-Way Claim Board**
The attendant maintains two synchronized boards:
1. **The Hook Array (`heap[hook]`):** *"Who is hanging on Hook $i$ right now?"*
2. **The Position Board (`pos[jacket]`):** *"Which hook is Jacket $K$ currently hanging on?"*
3. **The Priority Board (`prio[jacket]`):** *"What is the priority value of Jacket $K$?"*

```
THE TRI-ARRAY SYNCHRONIZATION:

Hook Array:      Hook [ 0 ]   Hook [ 1 ]   Hook [ 2 ]
                 holds: J-2   holds: J-0   holds: J-4
                   ▲            ▲            ▲
Position Board:    │            │            │
  Jacket 0: Hook 1 ─────────────┘            │
  Jacket 2: Hook 0 ─────────────┘            │
  Jacket 4: Hook 2 ──────────────────────────┘
```

---

**The In-Place `DecreaseKey` Magic (Dijkstra's Secret Weapon):**

A shorter highway route to City #4 is discovered ($\text{distance decreases from 50 to 12}$):
1. **Instant Lookup ($O(1)$):** Read `pos[4] = Hook 2`. We know its exact hook without searching!
2. **Update Distance ($O(1)$):** Set `prio[4] = 12`.
3. **Bubble Up (`SiftUp(2)` $\implies O(\log N)$):**
   - Jacket #4 is now lighter than its parent! It floats upward.
   - Every time two jackets swap hooks, their entries on the Position Board are updated in $O(1)$!
   - Jacket #4 reaches Hook 0.

**The Dijkstra Superpower:**
Standard queues push duplicate vertices ($O(E)$ heap space). An Indexed Priority Queue updates vertices **in-place**, bounding heap size strictly to $|V|$ vertices and memory to $O(V)$!

---

### 1.2 The Tri-Array Memory Architecture

When keys are integers $k \in [0, V-1]$ (e.g. vertex IDs in a graph), an Indexed Priority Queue requires **zero dynamic node allocations**:

```
====================================================================================================
                        IPQ TRI-ARRAY MEMORY LAYOUT (V = 5, N = 3)
====================================================================================================
Active elements: Key 2 (prio=15), Key 0 (prio=30), Key 4 (prio=50)

1. Forward Heap Array (Heap Index -> Key):
   Index:      0     1     2     3     4
   _heap:    [ 2  |  0  |  4  |  -  |  -  ]   <-- Min-Heap: prio[2] <= prio[0], prio[4]

2. Inverse Position Map (Key -> Heap Index):
   Key:        0     1     2     3     4
   _pos:     [ 1  | -1  |  0  | -1  |  2  ]   <-- -1 denotes key is NOT in the heap!

3. Priority Array (Key -> Priority Value):
   Key:        0     1     2     3     4
   _prio:    [ 30 |  -  | 15  |  -  | 50  ]

Inspection Verification:
• Where is Key 4?       _pos[4] = 2.             _heap[2] = 4.  (Match!)
• What is Key 4's prio? _prio[4] = 50.
• Who is at Root?       _heap[0] = 2.            _pos[2] = 0.   (Match!)
====================================================================================================
```

---

### 1.2 The Synchronized Swap Invariant

In a standard heap, swapping two elements during sifting is trivial:
```csharp
// Standard Heap Swap:
T temp = _heap[i];
_heap[i] = _heap[j];
_heap[j] = temp;
```

In an Indexed Priority Queue, executing this naïve swap creates an **immediate catastrophic desynchronization**!
If `_heap[i]` moves to index `j`, but `_pos[_heap[i]]` still points to `i`, any subsequent lookup will access the wrong element!

#### The Atomic Synchronized Swap
Every swap in an IPQ must update both the forward heap and the inverse position map atomically:

```csharp
private void Swap(int i, int j)
{
    int keyI = _heap[i];
    int keyJ = _heap[j];

    // 1. Swap in forward heap array
    _heap[i] = keyJ;
    _heap[j] = keyI;

    // 2. Synchronize inverse position map
    _pos[keyJ] = i;
    _pos[keyI] = j;
}
```

```
====================================================================================================
                            SYNCHRONIZED SWAP TRACE: Swap(0, 1)
====================================================================================================
Before Swap:
_heap[0] = Key 2, _pos[Key 2] = 0
_heap[1] = Key 0, _pos[Key 0] = 1

Execution:
1. _heap[0] = Key 0
2. _heap[1] = Key 2
3. _pos[Key 0] = 0   <-- Key 0 now knows it lives at index 0!
4. _pos[Key 2] = 1   <-- Key 2 now knows it lives at index 1!

After Swap:
_pos[_heap[0]] = _pos[Key 0] = 0. (Valid!)
_pos[_heap[1]] = _pos[Key 2] = 1. (Valid!)
====================================================================================================
```

---

### 1.3 Operations Deep-Dive: DecreaseKey and Arbitrary Deletion

#### How `DecreaseKey(key, newPriority)` Works in $O(\log N)$
1. **O(1) Index Lookup:** Retrieve the current heap index of `key`: `int idx = _pos[key]`.
2. **Pre-condition Validation:** Verify `newPriority < _prio[key]`.
3. **Priority Mutation:** Set `_prio[key] = newPriority`.
4. **Targeted SiftUp:** Because the priority decreased (smaller value in Min-Heap), the key can only move **upward** toward the root. Call `SiftUp(idx)`.
5. **Runtime:** Exactly $\Theta(\text{depth}) \le \log_2 N$ steps!

#### How `Delete(key)` Works in $O(\log N)$
1. **O(1) Index Lookup:** `int idx = _pos[key]`.
2. **Swap with Last Leaf:** Swap `_heap[idx]` with `_heap[_count - 1]`.
3. **Unregister Key:** Set `_pos[key] = -1` and decrement `_count--`.
4. **Bi-directional Restoration:** If the replaced index `idx < _count`, the element moved from the leaf might need to sift up OR sift down:
   - Call `SiftUp(idx)`.
   - Call `SiftDown(idx)`.
5. **Runtime:** Exactly $O(\log N)$!

---

### 1.4 ⚙️ Core Operations Deep-Dive: Indexed Priority Queue

#### Dimension 1: Operation Contract & Big-O Bounds

| Operation | Input Signature | Output / Post-condition | Time Complexity | Space Complexity | Invariants Maintained |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Contains` | `bool Contains(int key)` | Returns `true` iff key is in queue | $\Theta(1)$ | $\Theta(1)$ | None (Read-only) |
| `Insert` | `void Insert(int key, P prio)` | Inserts key with initial priority | $\Theta(\log N)$ | $\Theta(1)$ | Heap-Order & Invertibility |
| `DecreaseKey` | `void DecreaseKey(int key, P prio)` | Lowers priority; restores position via `SiftUp` | $\Theta(\log N)$ | $\Theta(1)$ | Heap-Order & Invertibility |
| `IncreaseKey` | `void IncreaseKey(int key, P prio)` | Raises priority; restores position via `SiftDown` | $\Theta(\log N)$ | $\Theta(1)$ | Heap-Order & Invertibility |
| `Delete` | `void Delete(int key)` | Removes key completely from IPQ | $\Theta(\log N)$ | $\Theta(1)$ | Heap-Order & Invertibility |
| `ExtractMin` | `int ExtractMin()` | Removes and returns the key with min priority | $\Theta(\log N)$ | $\Theta(1)$ | Heap-Order & Invertibility |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                       [ DecreaseKey(key, newPrio) ]
                                     │
                                     ▼
                           Does Contains(key)?
                              /             \
                        NO   /               \  YES
                            ▼                 ▼
                  Throw Exception      Is newPrio < prio[key]?
                                          /             \
                                    NO   /               \  YES
                                        ▼                 ▼
                              Throw Exception     prio[key] = newPrio
                                                          │
                                                          ▼
                                                  int idx = pos[key]
                                                          │
                                                          ▼
                                                    SiftUp(idx)
                                                          │
                                                          ▼
                                                        Done
```

---

#### Dimension 3: Visual ASCII State Transitions

Trace:
1. `Insert(key=3, prio=50)`
2. `Insert(key=1, prio=20)`
3. `DecreaseKey(key=3, prio=10)`
4. `ExtractMin()`

```
Step 1: Insert(3, 50)
  _heap = [ 3 ], _pos[3] = 0, _prio[3] = 50. Count = 1

Step 2: Insert(1, 20)
  Append at index 1: _heap = [ 3, 1 ]
  SiftUp(1): prio[1]=20 < prio[3]=50 -> Swap(1, 0)
  _heap = [ 1, 3 ]
  _pos[1] = 0, _pos[3] = 1
  _prio[1] = 20, _prio[3] = 50. Count = 2

Step 3: DecreaseKey(3, 10)
  idx = _pos[3] = 1
  _prio[3] = 10
  SiftUp(1): prio[3]=10 < prio[1]=20 -> Swap(1, 0)
  _heap = [ 3, 1 ]
  _pos[3] = 0, _pos[1] = 1
  _prio[3] = 10, _prio[1] = 20. Count = 2

Step 4: ExtractMin()
  Root key is _heap[0] = 3.
  Swap(0, Count - 1) -> Swap(0, 1)
  _heap = [ 1, 3 ]
  _pos[3] = -1, Count = 1
  SiftDown(0): only 1 element, no children.
  Return Key 3!
  End State: _heap = [ 1 ], _pos[1] = 0, _pos[3] = -1.
```

---

#### Dimension 4: Invariant Preservation Proof

**Theorem:** The `Swap(i, j)` operation maintains the Bidirectional Invertibility Invariant $\forall k \in [0, N-1]: \text{pos}[\text{heap}[k]] = k$.

*Proof by Case Analysis:*
1. Prior to swap, assume the invariant holds: $\text{pos}[\text{heap}[i]] = i$ and $\text{pos}[\text{heap}[j]] = j$.
2. Let $u = \text{heap}[i]$ and $v = \text{heap}[j]$.
3. The swap performs four assignments:
   - $\text{heap}'[i] \gets v$
   - $\text{heap}'[j] \gets u$
   - $\text{pos}'[v] \gets i$
   - $\text{pos}'[u] \gets j$
4. Now check indices $i$ and $j$:
   - For index $i$: $\text{pos}'[\text{heap}'[i]] = \text{pos}'[v] = i$. (Invariant holds for $i$).
   - For index $j$: $\text{pos}'[\text{heap}'[j]] = \text{pos}'[u] = j$. (Invariant holds for $j$).
5. For any index $k \notin \{i, j\}$, $\text{heap}'[k] = \text{heap}[k]$ and $\text{pos}'[\text{heap}'[k]] = \text{pos}[\text{heap}[k]] = k$ because neither position was modified.
6. Therefore, the invariant is preserved across all indices in $[0, N-1]$. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Scenario / Edge Case | Concrete Input | Danger / Pitfall | Guard / Architectural Resolution |
| :--- | :--- | :--- | :--- |
| **DecreaseKey with Worse Priority** | `DecreaseKey(key, 90)` when current is `40` | SiftUp called on larger value violates heap order | Assert `newPriority.CompareTo(current) < 0`; throw `ArgumentException`. |
| **Key Not in IPQ** | `DecreaseKey(999, 10)` | Index out of range or `-1` index exception | Check `_pos[key] != -1`; throw `KeyNotFoundException`. |
| **Delete Root Element** | `Delete(minKey)` | Calling Delete on root | Swap root with last leaf, remove last leaf, call `SiftDown(0)`. |
| **Delete Sole Element** | $N=1$, `Delete(onlyKey)` | Sifting beyond bounds | Decrement count to 0; no sifting needed when count is 0. |
| **Delete Last Leaf** | `Delete(heap[N-1])` | Pointless self-swap | If `idx == _count - 1`, simply set `_pos[key] = -1` and decrement count with zero sifting. |

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Container(s)

Below is the standalone, production-grade C# implementation of `IndexedPriorityQueue<TPriority>` designed for integer keys $k \in [0, \text{maxKeys} - 1]$ (the standard format for graph nodes, task IDs, and entity indices).

```csharp
using System;
using System.Diagnostics;

namespace PriorityQueues.Indexed
{
    /// <summary>
    /// Production-grade Indexed Priority Queue (IPQ) for integer keys in [0, maxKeys - 1].
    /// Provides O(log N) DecreaseKey, IncreaseKey, and Delete, alongside O(1) Contains and Peek.
    /// Ideal for Dijkstra's Shortest Path and Prim's MST.
    /// </summary>
    /// <typeparam name="TPriority">Comparable priority type.</typeparam>
    public sealed class IndexedPriorityQueue<TPriority> where TPriority : IComparable<TPriority>
    {
        private readonly int _maxKeys;
        private int _count;

        // _heap[heapIndex] = key
        private readonly int[] _heap;

        // _pos[key] = heapIndex (-1 if key not in queue)
        private readonly int[] _pos;

        // _priorities[key] = priority
        private readonly TPriority[] _priorities;

        public IndexedPriorityQueue(int maxKeys)
        {
            if (maxKeys <= 0) throw new ArgumentOutOfRangeException(nameof(maxKeys), "maxKeys must be > 0");

            _maxKeys = maxKeys;
            _count = 0;

            _heap = new int[maxKeys];
            _pos = new int[maxKeys];
            _priorities = new TPriority[maxKeys];

            // Initialize inverse position map to -1 (indicating key absence)
            Array.Fill(_pos, -1);
        }

        public int Count => _count;

        public bool Contains(int key)
        {
            ValidateKey(key);
            return _pos[key] != -1;
        }

        public void Insert(int key, TPriority priority)
        {
            ValidateKey(key);
            if (Contains(key))
            {
                throw new InvalidOperationException($"Key {key} already exists in the priority queue.");
            }

            int heapIndex = _count;
            _heap[heapIndex] = key;
            _pos[key] = heapIndex;
            _priorities[key] = priority;

            SiftUp(heapIndex);
            _count++;
        }

        public int PeekKey()
        {
            if (_count == 0) throw new InvalidOperationException("Priority queue is empty.");
            return _heap[0];
        }

        public TPriority PeekPriority()
        {
            if (_count == 0) throw new InvalidOperationException("Priority queue is empty.");
            return _priorities[_heap[0]];
        }

        public int ExtractMin()
        {
            if (_count == 0) throw new InvalidOperationException("Priority queue is empty.");

            int minKey = _heap[0];
            Swap(0, _count - 1);

            _pos[minKey] = -1;
            _priorities[minKey] = default!;
            _count--;

            if (_count > 0)
            {
                SiftDown(0);
            }

            return minKey;
        }

        public void DecreaseKey(int key, TPriority newPriority)
        {
            ValidateKey(key);
            if (!Contains(key))
            {
                throw new InvalidOperationException($"Key {key} is not in the priority queue.");
            }

            if (newPriority.CompareTo(_priorities[key]) >= 0)
            {
                throw new ArgumentException($"New priority {newPriority} must be strictly less than current priority {_priorities[key]}.");
            }

            _priorities[key] = newPriority;
            SiftUp(_pos[key]);
        }

        public void IncreaseKey(int key, TPriority newPriority)
        {
            ValidateKey(key);
            if (!Contains(key))
            {
                throw new InvalidOperationException($"Key {key} is not in the priority queue.");
            }

            if (newPriority.CompareTo(_priorities[key]) <= 0)
            {
                throw new ArgumentException($"New priority {newPriority} must be strictly greater than current priority {_priorities[key]}.");
            }

            _priorities[key] = newPriority;
            SiftDown(_pos[key]);
        }

        public void Delete(int key)
        {
            ValidateKey(key);
            if (!Contains(key))
            {
                throw new InvalidOperationException($"Key {key} is not in the priority queue.");
            }

            int heapIndex = _pos[key];
            Swap(heapIndex, _count - 1);

            _pos[key] = -1;
            _priorities[key] = default!;
            _count--;

            if (heapIndex < _count)
            {
                SiftUp(heapIndex);
                SiftDown(heapIndex);
            }
        }

        private void SiftUp(int i)
        {
            while (i > 0)
            {
                int parent = (i - 1) >> 1;
                if (CompareHeapNodes(i, parent) >= 0) break;

                Swap(i, parent);
                i = parent;
            }
        }

        private void SiftDown(int i)
        {
            int half = _count >> 1;
            while (i < half)
            {
                int left = (i << 1) + 1;
                int right = left + 1;
                int best = left;

                if (right < _count && CompareHeapNodes(right, left) < 0)
                {
                    best = right;
                }

                if (CompareHeapNodes(best, i) >= 0) break;

                Swap(i, best);
                i = best;
            }
        }

        private int CompareHeapNodes(int i, int j)
        {
            int keyI = _heap[i];
            int keyJ = _heap[j];
            return _priorities[keyI].CompareTo(_priorities[keyJ]);
        }

        private void Swap(int i, int j)
        {
            int keyI = _heap[i];
            int keyJ = _heap[j];

            _heap[i] = keyJ;
            _heap[j] = keyI;

            _pos[keyJ] = i;
            _pos[keyI] = j;
        }

        private void ValidateKey(int key)
        {
            if (key < 0 || key >= _maxKeys)
            {
                throw new ArgumentOutOfRangeException(nameof(key), $"Key {key} is out of bounds [0, {_maxKeys - 1}].");
            }
        }
    }

    /// <summary>
    /// Self-testing verification harness.
    /// </summary>
    public static class IPQProgram
    {
        public static void Main()
        {
            Console.WriteLine("Running Indexed Priority Queue Verification Suite...");

            var ipq = new IndexedPriorityQueue<int>(10);

            // Test Case 1: Insertion and Min Extraction
            ipq.Insert(3, 50);
            ipq.Insert(1, 20);
            ipq.Insert(4, 80);
            ipq.Insert(2, 10);

            Debug.Assert(ipq.PeekKey() == 2);
            Debug.Assert(ipq.PeekPriority() == 10);

            // Test Case 2: DecreaseKey
            // Decrease Key 4 from priority 80 to 5 -> Key 4 must become new root!
            ipq.DecreaseKey(4, 5);
            Debug.Assert(ipq.PeekKey() == 4);
            Debug.Assert(ipq.PeekPriority() == 5);

            // Test Case 3: Arbitrary Deletion
            // Delete Key 4 (current root)
            ipq.Delete(4);
            Debug.Assert(!ipq.Contains(4));
            Debug.Assert(ipq.PeekKey() == 2); // Old minimum is back

            // Test Case 4: Sequential extraction check
            int first = ipq.ExtractMin();  // Key 2 (prio 10)
            int second = ipq.ExtractMin(); // Key 1 (prio 20)
            int third = ipq.ExtractMin();  // Key 3 (prio 50)

            Debug.Assert(first == 2);
            Debug.Assert(second == 1);
            Debug.Assert(third == 3);
            Debug.Assert(ipq.Count == 0);

            Console.WriteLine("All Indexed Priority Queue verification suites passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### Dijkstra’s Complexity: Lazy PQ vs. Indexed Priority Queue

In a directed graph with $V$ vertices and $E$ edges:

| Metric | Dijkstra with Lazy Priority Queue | Dijkstra with Indexed Priority Queue (IPQ) |
| :--- | :--- | :--- |
| **Max Heap Capacity** | $\mathbf{\Theta(E)}$ (every edge relaxation pushes a duplicate) | $\mathbf{\Theta(V)}$ (one entry per vertex strictly) |
| **Heap Operation Cost** | $O(\log E) = O(\log V)$ | $O(\log V)$ |
| **Total Enqueues / Updates**| $E$ insertions | $V$ inserts + at most $E$ `DecreaseKey` |
| **Total Runtime** | $\mathbf{O(E \log E) = O(E \log V)}$ | $\mathbf{O(E \log V)}$ |
| **RAM Space Footprint** | **$\mathbf{O(E)}$** | **$\mathbf{O(V)}$** |
| **Dense Graph Space ($E \approx V^2$)**| $10^6$ nodes with $10^8$ edges $\implies \mathbf{100\text{M objects}}$ | $10^6$ nodes $\implies \mathbf{1\text{M entries}}$ ($\mathbf{100\times \text{ less memory!}}$) |

In production systems where memory is the bottleneck, the IPQ's strict $O(V)$ space bound prevents out-of-memory (OOM) crashes on large graphs.

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### Problem 1: [LeetCode 743] Network Delay Time (Medium)

#### Problem Statement
You are given a network of $n$ nodes, labeled from $1$ to $n$. You are also given `times`, a list of travel times as directed edges `times[i] = (u_i, v_i, w_i)`.
We will send a signal from a given node $k$. Return the minimum time it takes for all the $n$ nodes to receive the signal. If it is impossible for all the $n$ nodes to receive the signal, return -1.

#### Production Solution using Indexed Priority Queue

```csharp
using System;
using System.Collections.Generic;
using PriorityQueues.Indexed;

public class NetworkDelayTimeSolution
{
    public int NetworkDelayTime(int[][] times, int n, int k)
    {
        // Build adjacency list: node -> List<(neighbor, weight)>
        var adj = new List<(int Neighbor, int Weight)>[n + 1];
        for (int i = 1; i <= n; i++) adj[i] = new List<(int, int)>();

        foreach (var edge in times)
        {
            adj[edge[0]].Add((edge[1], edge[2]));
        }

        // Distances array
        int[] dist = new int[n + 1];
        Array.Fill(dist, int.MaxValue);

        // IPQ initialized with capacity n + 1 (1-indexed nodes)
        var ipq = new IndexedPriorityQueue<int>(n + 1);

        dist[k] = 0;
        ipq.Insert(k, 0);

        while (ipq.Count > 0)
        {
            int u = ipq.ExtractMin();
            int currentDist = dist[u];

            foreach (var (v, weight) in adj[u])
            {
                if (currentDist + weight < dist[v])
                {
                    dist[v] = currentDist + weight;

                    if (ipq.Contains(v))
                    {
                        ipq.DecreaseKey(v, dist[v]);
                    }
                    else
                    {
                        ipq.Insert(v, dist[v]);
                    }
                }
            }
        }

        // Find the maximum time to reach any node
        int maxTime = 0;
        for (int i = 1; i <= n; i++)
        {
            if (dist[i] == int.MaxValue) return -1; // Unreachable node
            maxTime = Math.Max(maxTime, dist[i]);
        }

        return maxTime;
    }
}
```

---

### Problem 2: [LeetCode 787] Cheapest Flights Within K Stops (Medium)

#### Problem Statement
There are $n$ cities connected by some number of flights. You are given an array `flights` where `flights[i] = [from, to, price]`.
You are also given three integers `src`, `dst`, and `k`. Return the cheapest price from `src` to `dst` with at most `k` stops. If there is no such route, return -1.

#### Architectural Mechanics: State-Augmented Priority Queue
In standard Dijkstra, the state is simply `node`. When the number of stops is constrained to at most $k$, the state becomes a compound tuple: `(City, Stops)`.
Because a longer path with fewer stops might beat a cheaper path that exhausts all stops, we track `minStops[city]` to prune suboptimal routes.

```csharp
using System;
using System.Collections.Generic;

public class CheapestFlightsSolution
{
    public int FindCheapestPrice(int n, int[][] flights, int src, int dst, int k)
    {
        var adj = new List<(int To, int Price)>[n];
        for (int i = 0; i < n; i++) adj[i] = new List<(int, int)>();

        foreach (var f in flights)
        {
            adj[f[0]].Add((f[1], f[2]));
        }

        // Priority Queue stores (City, Stops) keyed by Cost
        var pq = new PriorityQueue<(int City, int Stops), int>();
        pq.Enqueue((src, 0), 0);

        // minStops[city] tracks the minimum stops used to reach city with cheaper or equal cost
        int[] minStops = new int[n];
        Array.Fill(minStops, int.MaxValue);

        while (pq.Count > 0)
        {
            pq.TryDequeue(out var state, out int cost);
            int city = state.City;
            int stops = state.Stops;

            if (city == dst) return cost;
            if (stops > k) continue;

            // Pruning: if we reached this city before with fewer or equal stops, skip!
            if (stops >= minStops[city]) continue;
            minStops[city] = stops;

            foreach (var (nextCity, price) in adj[city])
            {
                pq.Enqueue((nextCity, stops + 1), cost + price);
            }
        }

        return -1;
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 1584] Min Cost to Connect All Points (Medium):**
   - *Task:* Connect $N$ 2D points on a plane with minimum total Manhattan distance.
   - *Algorithmic Pattern:* Prim’s MST algorithm using an Indexed Priority Queue. Key each vertex by its minimum distance to the growing tree, calling `DecreaseKey` when closer points are discovered.
   - *Complexity Target:* $O(N^2)$ using array or $O(N^2 \log N)$ with IPQ.

2. **[LeetCode 1514] Path with Maximum Probability (Medium):**
   - *Task:* Find the path between two vertices with the maximum probability of success.
   - *Algorithmic Pattern:* Modified Dijkstra with Max-Indexed Priority Queue where probabilities multiply ($P_{\text{new}} = P_{\text{curr}} \times \text{prob}$).

3. **[LeetCode 1631] Path With Minimum Effort (Medium):**
   - *Task:* Find a route in a 2D grid that minimizes the maximum absolute elevation difference between two consecutive cells.
   - *Algorithmic Pattern:* Dijkstra on a grid using an IPQ keyed by cell index `r * cols + c`.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Routing Engine Architecture (Google Maps / OSPF Link-State):

                      ┌─────────────────────────────────────────┐
                      │       GRAPH ROUTING ENGINE (DIJKSTRA)   │
                      └─────────────────────────────────────────┘
                                           │
            ┌──────────────────────────────┴──────────────────────────────┐
            ▼                                                             ▼
┌───────────────────────────────────────┐     ┌───────────────────────────────────────┐
│     LAZY PRIORITY QUEUE               │     │     INDEXED PRIORITY QUEUE (IPQ)      │
├───────────────────────────────────────┤     ├───────────────────────────────────────┤
│ • Queue grows to O(E) elements.       │     │ • Queue strictly capped at O(V).      │
│ • Higher memory footprint.            │     │ • Lowest memory footprint.            │
│ • Easy to implement with standard BCL │     │ • Optimal for embedded routers and    │
│   PriorityQueue.                      │     │   large geographic road networks.     │
│ • Suitable for sparse graphs (E ~ V). │     │ • Mandated for dense networks (E ~ V2)│
└───────────────────────────────────────┘     └───────────────────────────────────────┘
```

In enterprise network routers running Open Shortest Path First (OSPF) or Intermediate System to Intermediate System (IS-IS), network topology changes trigger Dijkstra’s algorithm to recalculate routing tables. Because embedded router line cards have strict hardware RAM budgets, implementations always utilize **Indexed Priority Queues** to guarantee that memory consumption never exceeds $V$ vertex entries.

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
In an Indexed Priority Queue, why must the `Swap` operation update the inverse position map before or during the element swap, and what happens if this synchronization fails?

### Architectural Model Answer
1. **The Invariant Requirement:**
   - An Indexed Priority Queue relies on the strict bidirectional invariant:
     $$\forall i \in [0, N-1]: \quad \text{pos}[\text{heap}[i]] = i$$
   - This invariant ensures that looking up any key $k$ via `pos[k]` returns the *exact* array index where $k$ currently resides in `heap`.

2. **What Happens if Synchronization Fails:**
   - If two elements at indices $i$ and $j$ are swapped in the heap array without simultaneously updating `pos`:
     - `pos[heap[i]]` will still point to $j$.
     - `pos[heap[j]]` will still point to $i$.
   - **Silent Data Corruption:** When `DecreaseKey(key, newPriority)` or `Delete(key)` is subsequently invoked on one of these keys:
     1. The algorithm reads the stale index from `pos[key]`.
     2. It mutates the priority and performs sifting on the **wrong element** (the item that previously occupied that slot)!
     3. The heap-order invariant is completely broken across both ancestor and descendant subtrees.
     4. Subsequent `ExtractMin()` calls return incorrect extrema, leading to algorithmic failure (e.g. infinite loops or suboptimal shortest paths in Dijkstra).

3. **Atomic Synchronization Implementation:**
   - Therefore, the `Swap(i, j)` routine must atomically update both mappings:
     ```csharp
     int keyI = _heap[i];
     int keyJ = _heap[j];
     _heap[i] = keyJ;
     _heap[j] = keyI;
     _pos[keyJ] = i;
     _pos[keyI] = j;
     ```
   - This guarantees that no thread or subsequent instruction can ever observe an element at a heap index that disagrees with the inverse position map.
