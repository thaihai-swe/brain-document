---
title: "Week 18 — Day 121: Separate Chaining Architecture: ChainedHashMap<K, V> & Linked Bucket Traversal"
---

# Week 18 — Day 121: Separate Chaining Architecture: ChainedHashMap<K, V> & Linked Bucket Traversal

Welcome to **Day 121 of your DSA Mastery Journey**!

Yesterday, on Day 120, you established the mathematical foundation of hash functions: determinism, uniform bit dispersion, the avalanche effect, and polynomial rolling hashing. You also proved via the Birthday Paradox that hash collisions are **mathematically inevitable** in any non-trivial dataset ($N \approx 1.177\sqrt{M}$).

Today, we construct the classic, battle-tested architecture designed to resolve those collisions: **Separate Chaining (The Linked Bucket Model)**.

Separate chaining is the foundational architecture of the C++ standard library (`std::unordered_map`), Java 7 (`java.util.HashMap`), and Python’s early dictionary implementations. Today, you will build `ChainedHashMap<K, V>` from scratch in C#, prove the expected $O(1 + \alpha)$ search time under the Simple Uniform Hashing Assumption, explore Java 8’s Red-Black treeification optimization, and analyze the real-world cache line consequences of pointer chasing across the managed heap.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                DAY 121: SEPARATE CHAINING TOPOLOGY                               │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       BUCKET POINTER ARRAY        │                             │        LINKED NODE CHAINS         │
│          _buckets[0 .. M-1]       │                             │      (COLLISION RESOLUTION)       │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Flat array of node references.  │                             │ • Singly-linked list per bucket:  │
│ • Bucket Index Calculation:       │                             │   class Node { K Key; V Val;      │
│   bucket = (h(k) & 0x7FFFFFFF) % M│                             │                Node Next; }       │
│ • Initial capacity: M = 16 or 17. │ ─── References Chain Head ─►│ • Prepend new entries: O(1).     │
│ • Null indicates empty bucket.    │                             │ • Average Chain Length:           │
└───────────────────────────────────┘                             │   alpha = N / M (Load Factor).    │
                                                                  └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │          PERFORMANCE & COMPLEXITY           │
                          ├─────────────────────────────────────────────┤
                          │ • Expected Search:  Theta(1 + alpha)        │
                          │ • Expected Insert:  Theta(1 + alpha)        │
                          │ • Adversarial Worst:Theta(N) (Single Chain) │
                          │ • Java 8 Defense:   Treeify to Red-Black    │
                          │   Tree when Chain >= 8: Theta(log N)!       │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🔗 The Visual Mental Model: The Bucket & Chain Architecture

Before diving into code, let us look directly inside computer memory to see what **Separate Chaining** looks like:

```
               🔗 SEPARATE CHAINING MEMORY ARCHITECTURE

   Imagine an array of 5 buckets (indices 0 to 4).
   Each bucket holds a pointer to a linked list chain of key-value nodes!

   Bucket Array in RAM (Contiguous Reference Pointers):
   ┌───────────┬──────────────────────────────────────────────────────────────────────────────────┐
   │ Bucket[0] │ null (Empty bucket)                                                              │
   ├───────────┼──────────────────────────────────────────────────────────────────────────────────┤
   │ Bucket[1] │ [ "apple" : $5 ] ──► [ "banana" : $3 ] ──► [ "date" : $12 ] ──► null             │
   │           │   ▲                    ▲                      ▲                                  │
   │           │   Node 1               Node 2                 Node 3 (All 3 hashed to Index 1!)  │
   ├───────────┼──────────────────────────────────────────────────────────────────────────────────┤
   │ Bucket[2] │ [ "cherry" : $8 ] ──► null                                                       │
   ├───────────┼──────────────────────────────────────────────────────────────────────────────────┤
   │ Bucket[3] │ null (Empty bucket)                                                              │
   ├───────────┼──────────────────────────────────────────────────────────────────────────────────┤
   │ Bucket[4] │ [ "fig" : $15 ] ──► null                                                         │
   └───────────┴──────────────────────────────────────────────────────────────────────────────────┘

   Key Statistics:
   • Total Buckets (Capacity M) = 5
   • Total Elements Stored (N)  = 5
   • Load Factor (α = N / M)   = 5 / 5 = 1.0 (Average of 1 item per bucket!)
```

#### Step-by-Step State Evolution: How Operations Work Visually

```
1. LOOKUP: Get("banana")
   Step 1: Compute Hash: hash("banana") % 5 = Index 1.
   Step 2: Jump directly to Bucket[1] in O(1) time!
   Step 3: Walk down the chain:
           - Check Node 1: Key is "apple"  != "banana". Step to next!
           - Check Node 2: Key is "banana" == "banana"! Match found! Return $3.
   Search completed in 2 comparisons!

──────────────────────────────────────────────────────────────────────────────────────────
2. DELETION: Remove("banana") (Visual Pointer Rewiring)
   Step 1: Find Node 1 ("apple") pointing to Node 2 ("banana").
   Step 2: Simply rewire Node 1's Next pointer to skip Node 2 and point to Node 3 ("date")!

   BEFORE:
   Bucket[1] ──► [ "apple" ] ──► [ "banana" ] ──► [ "date" ] ──► null

   AFTER:
   Bucket[1] ──► [ "apple" ] ───────────────────► [ "date" ] ──► null
                                     │
                                     └── [ "banana" ] unlinked & collected by GC!
```

---

### 1.2 🏛️ Separate Chaining vs Open Addressing (Visual Comparison)

```
SEPARATE CHAINING (Linked Nodes):             OPEN ADDRESSING (Flat Array):
Bucket Array points outside to Heap Nodes.     Everything lives inside ONE single flat array!

Bucket[0] ──► null                             Index 0: [ Empty ]
Bucket[1] ──► [ "apple" ] ──► [ "date" ]       Index 1: [ "apple"  : $5 ]
Bucket[2] ──► [ "cherry" ]                     Index 2: [ "date"   : $12 ]  <-- Stepped +1 from collision!
Bucket[3] ──► null                             Index 3: [ "cherry" : $8 ]
Bucket[4] ──► null                             Index 4: [ ⚰️ TOMBSTONE ]    <-- Deleted item marker!

• Pros: Load factor can exceed 1.0; easy del.  • Pros: Zero heap pointers! Pure L1 cache locality!
• Cons: Heap object overhead; pointer chasing. • Cons: Primary clustering; needs tombstone markers.
```

---

### 1.3 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* **Separate Chaining** resolves collisions by having each bucket in a table of size $M$ hold a linked list of entries that map to that bucket index.
  - *Core Invariants:*
    1. **Bucket Partition Invariant:** Any key $k$ resides exclusively in the linked chain rooted at index $h(k) \pmod M$.
    2. **Key Uniqueness Invariant:** No linked chain contains duplicate keys.
  - *Misconceptions:*
    - *Misconception 1:* "The load factor $\alpha = N / M$ can never exceed 1.0." **False!** Unlike open addressing where table capacity is a hard ceiling, in separate chaining $N$ can exceed $M$ ($\alpha > 1.0$). $\alpha$ simply represents the average length of each linked chain.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates clustering. Collisions in bucket 1 have **zero effect** on bucket 2.
  - *Graceful Degradation:* The table never "runs out of slots." Deleting a node is a simple pointer unlink without tombstones.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Frequent deletions, unpredictable element counts, or large value objects.
  - *When to Avoid:* Memory-constrained devices (pointer overhead) or high-throughput inner loops where pointer chasing causes cache misses.
- **4. WHERE (Physical Memory Model):**
  - *CLR Managed Heap:* The bucket array `Node[] _buckets` is a contiguous array of 8-byte reference pointers. Each entry is a distinct managed object (`class Node { K Key; V Value; Node Next; }`), consuming 24 bytes of metadata + payload.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "Separate chaining resolves hash collisions by maintaining an array of bucket pointers, each referencing a linked list of entries. When inserting, we compute the bucket index via modular hashing, search the chain for key uniqueness, and update or prepend. Under uniform hashing, the expected chain length is the load factor $\alpha = N / M$, yielding average $O(1)$ operations with zero clustering."
- **6. HOW (Complexity Profile):**
  - *Average Case:* `Get`: $O(1 + \alpha)$, `Put`: $O(1 + \alpha)$, `Remove`: $O(1 + \alpha)$ where $\alpha \le 0.75$.
  - *Worst Case:* $O(N)$ when an adversary forces all keys into a single bucket.

---

### 1.4 Load Factor Analysis & Expected Search Cost

Let $N$ be the total key-value pairs stored in the table, and $M$ be the total buckets.
The **Load Factor** is:
$$\alpha = \frac{N}{M}$$

- **Unsuccessful Search (Key not present):** Must inspect the entire chain at bucket $h(k) \implies \text{Cost} = 1 + \alpha$.
- **Successful Search (Key present):** On average, the target node is in the middle of the chain $\implies \text{Cost} \approx 1 + \frac{\alpha}{2}$.
- As long as resizing keeps $\alpha \le 0.75$, both operations take strictly **$\Theta(1)$ constant time**!

---

### 1.2 Java 8+ Treeification: Defending Against $O(N)$ Degradation

In 2014, Java 8 introduced a landmark defense against Hash Flooding Denial-of-Service attacks:

```
Bucket Traversal Evolution:

Standard Linked Chain (O(N) Worst Case):
_buckets[i] -> [ Node 1 ] -> [ Node 2 ] -> [ Node 3 ] -> ... -> [ Node 1000 ] (1000 comparisons!)

Java 8 Treeified Bucket (O(log N) Worst Case):
When chain length >= 8 and table capacity M >= 64:
_buckets[i] -> [ Red-Black Tree Root ]
                     /           \
               [ Node 2 ]     [ Node 6 ]
                /      \       /      \
             [ 1 ]    [ 3 ]  [ 5 ]   [ 7 ]
Search drops from 8 comparisons to log_2(8) = 3 comparisons!
```

- When elements in a single bucket reach **TREEIFY_THRESHOLD = 8**, the linked list converts into a **Red-Black Tree**.
- If deletions cause the tree size to drop below **UNTREEIFY_THRESHOLD = 6**, it converts back into a linked list.
- This guarantees that even if an attacker crafts thousands of colliding keys, bucket lookups never exceed **$O(\log N)$ time**.

---

### 1.3 Hardware Systems Dive: Why Chaining Loses in Memory Cache Lines

```
Cache Line Comparison:

1. Separate Chaining (Linked Node):
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │ Node 1       │ ──> │ Node 2       │ ──> │ Node 3       │
   │ @ 0x00A1F040 │     │ @ 0x048B2100 │     │ @ 0x08F00220 │
   └──────────────┘     └──────────────┘     └──────────────┘
   • Nodes are allocated arbitrarily across the managed heap.
   • Traversing Node 1 -> Node 2 -> Node 3 dereferences 64-bit pointers across DRAM.
   • Result: 3 consecutive L1/L2 cache misses! (Latency: ~150-200 CPU cycles).

2. Open Addressing (Flat Contiguous Array):
   [ Slot 0 | Slot 1 | Slot 2 | Slot 3 | Slot 4 | Slot 5 | Slot 6 | Slot 7 ]
   • All slots reside sequentially in contiguous memory.
   • Loading Slot 0 loads Slots 0 through 3 directly into a single 64-byte L1 cache line!
   • Result: Zero pointer dereferences; near-instantaneous memory access (< 1 ns).
```

This explains why modern high-performance runtimes (such as Rust’s `hashbrown`, Google’s `SwissTable`, and .NET’s internal `Dictionary`) use flat-array indexing rather than linked-node chaining.

---

### 1.4 ⚙️ Core Operations Deep-Dive: Separate Chaining Bucket Traversal

#### Dimension 1: Operation Contract & Big-O Bounds

| Operation | Input Signature | Output / Post-condition | Expected Time | Worst-Case Time | Auxiliary Space |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Get` | `bool TryGetValue(K key, out V val)` | Returns `true` and value if key found | $\Theta(1 + \alpha)$ | $\Theta(N)$ | $\Theta(1)$ |
| `Put` | `void Add(K key, V val)` | Inserts or updates key-value pair | $\Theta(1 + \alpha)$ | $\Theta(N)$ | $\Theta(1)$ |
| `Remove` | `bool Remove(K key)` | Unlinks node; returns `true` if deleted | $\Theta(1 + \alpha)$ | $\Theta(N)$ | $\Theta(1)$ |
| `Rehash` | `void Rehash(int newCapacity)` | Resizes table; migrates all linked nodes | $\Theta(N + M)$ | $\Theta(N + M)$ | $\Theta(N_{\text{new}})$ |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                            [ Put(key, value) ]
                                     │
                                     ▼
                    int bucket = GetBucketIndex(key)
                                     │
                                     ▼
                         Node curr = _buckets[bucket]
                                     │
                                     ▼
                          Loop while curr != null:
                          - If curr.Key.Equals(key):
                              curr.Value = value (Update!)
                              Return
                          - curr = curr.Next
                                     │
                                     ▼
                     (Key not found: Prepend new node)
                   newNode = new Node(key, value, _buckets[bucket])
                   _buckets[bucket] = newNode
                   _count++; _version++
                                     │
                                     ▼
                    Is (count / capacity) > 0.75?
                         /               \
                   YES  /                 \  NO
                       ▼                   ▼
                  Rehash(2 * M)          Done!
```

---

#### Dimension 3: Visual ASCII State Transitions

Trace `Put("A", 10)`, `Put("B", 20)`, `Put("C", 30)` into 4 buckets.
Assume `hash("A") % 4 = 1`, `hash("B") % 4 = 1` (COLLISION!), `hash("C") % 4 = 3`.

```
Initial: _buckets = [ null, null, null, null ]

1. Put("A", 10): bucket = 1
   _buckets[1] -> [ "A": 10 | null ]

2. Put("B", 20): bucket = 1 (Collision with "A"!)
   Traverse chain: "A" != "B".
   Prepend "B" to head of Bucket 1:
   _buckets[1] -> [ "B": 20 | Next ] ──► [ "A": 10 | null ]

3. Put("C", 30): bucket = 3
   _buckets[3] -> [ "C": 30 | null ]

Final Table State:
_buckets[0]: null
_buckets[1]: [ "B": 20 ] -> [ "A": 10 ] -> null
_buckets[2]: null
_buckets[3]: [ "C": 30 ] -> null
```

---

#### Dimension 4: Invariant Preservation Proof

**Theorem:** The `Put(key, value)` operation preserves the Key Uniqueness Invariant across all buckets.

*Proof by Contradiction:*
1. Suppose inserting `(key, value)` results in two distinct nodes $u$ and $v$ with $u.\text{Key}.\text{Equals}(v.\text{Key}) = \text{true}$.
2. By the Determinism Invariant, $h(u.\text{Key}) = h(v.\text{Key})$, meaning both keys map to the exact same bucket index $b = h(key) \pmod M$.
3. Prior to insertion, assume the table satisfied key uniqueness.
4. The insertion routine iterates through the entire linked chain rooted at `_buckets[b]` from head to tail.
5. If a node with matching key existed, the algorithm overwrites its value and returns immediately without allocating a new node.
6. A new node is prepended to `_buckets[b]` if and only if the traversal reached `null` without finding any matching key.
7. Therefore, a new node is created only when no duplicate existed, resulting in exactly one node with that key.
8. By contradiction, duplicate keys cannot exist in any chain. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Scenario / Edge Case | Concrete Input | Danger / Pitfall | Guard / Architectural Resolution |
| :--- | :--- | :--- | :--- |
| **Negative Hash Code** | `key.GetHashCode() == int.MinValue` | `Math.Abs(int.MinValue)` overflows to negative! | Use bitwise mask: `(key.GetHashCode() & 0x7FFFFFFF) % capacity` |
| **Null Key** | `Add(null, val)` | `NullReferenceException` calling `.GetHashCode()` | Guard with `if (key == null) throw new ArgumentNullException()` or dedicated bucket 0 |
| **Removing Head of Chain** | Delete first element in chain | Losing reference to rest of chain | `_buckets[b] = curr.Next` safely updates head |
| **Removing Middle/Tail Node** | Delete node in chain of length 5 | Unlinking error | Track `prev` pointer: `prev.Next = curr.Next` |
| **Concurrent Mutation during Iterate**| Calling `Add()` during `foreach` | Undefined iteration behavior | Fail-fast `_version` check on `MoveNext()` |

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Container(s)

Below is the standalone, production-grade C# implementation of `ChainedHashMap<TKey, TValue>`. It includes:
- Generic key-value storage with custom `IEqualityComparer<TKey>`.
- Linked bucket node traversal.
- Safe bitwise index masking (`& 0x7FFFFFFF`).
- Dynamic resizing and prime capacity expansion when $\alpha > 0.75$.
- Fail-fast `_version` tracking for safe enumeration.
- Comprehensive unit test assertions.

```csharp
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;

namespace HashTables.Chaining
{
    /// <summary>
    /// Production-grade Hash Map implementing Separate Chaining.
    /// Provides average O(1) Search, Insert, and Delete operations with dynamic resizing.
    /// </summary>
    /// <typeparam name="TKey">Unique key type.</typeparam>
    /// <typeparam name="TValue">Value payload type.</typeparam>
    public sealed class ChainedHashMap<TKey, TValue> : IEnumerable<KeyValuePair<TKey, TValue>>
    {
        private Node[] _buckets;
        private int _count;
        private int _version;
        private readonly IEqualityComparer<TKey> _comparer;

        private const int DefaultCapacity = 17; // Prime initial capacity
        private const double MaxLoadFactor = 0.75;

        public ChainedHashMap(int initialCapacity = DefaultCapacity, IEqualityComparer<TKey>? comparer = null)
        {
            int capacity = Math.Max(initialCapacity, DefaultCapacity);
            _buckets = new Node[capacity];
            _count = 0;
            _version = 0;
            _comparer = comparer ?? EqualityComparer<TKey>.Default;
        }

        public int Count => _count;
        public int Capacity => _buckets.Length;
        public double LoadFactor => (double)_count / _buckets.Length;

        public TValue this[TKey key]
        {
            get
            {
                if (TryGetValue(key, out TValue val)) return val;
                throw new KeyNotFoundException($"Key '{key}' was not found in the hash map.");
            }
            set => AddOrUpdate(key, value);
        }

        public void Add(TKey key, TValue value)
        {
            if (key == null) throw new ArgumentNullException(nameof(key));

            int bucket = GetBucketIndex(key);
            Node? curr = _buckets[bucket];

            while (curr != null)
            {
                if (_comparer.Equals(curr.Key, key))
                {
                    throw new ArgumentException($"An entry with the key '{key}' already exists.");
                }
                curr = curr.Next;
            }

            // Key does not exist: prepend new node
            _buckets[bucket] = new Node(key, value, _buckets[bucket]);
            _count++;
            _version++;

            if (LoadFactor > MaxLoadFactor)
            {
                Resize(_buckets.Length * 2 + 1);
            }
        }

        public void AddOrUpdate(TKey key, TValue value)
        {
            if (key == null) throw new ArgumentNullException(nameof(key));

            int bucket = GetBucketIndex(key);
            Node? curr = _buckets[bucket];

            while (curr != null)
            {
                if (_comparer.Equals(curr.Key, key))
                {
                    curr.Value = value; // Update existing
                    _version++;
                    return;
                }
                curr = curr.Next;
            }

            // Prepend new node
            _buckets[bucket] = new Node(key, value, _buckets[bucket]);
            _count++;
            _version++;

            if (LoadFactor > MaxLoadFactor)
            {
                Resize(_buckets.Length * 2 + 1);
            }
        }

        public bool TryGetValue(TKey key, out TValue value)
        {
            if (key == null) throw new ArgumentNullException(nameof(key));

            int bucket = GetBucketIndex(key);
            Node? curr = _buckets[bucket];

            while (curr != null)
            {
                if (_comparer.Equals(curr.Key, key))
                {
                    value = curr.Value;
                    return true;
                }
                curr = curr.Next;
            }

            value = default!;
            return false;
        }

        public bool ContainsKey(TKey key) => TryGetValue(key, out _);

        public bool Remove(TKey key)
        {
            if (key == null) throw new ArgumentNullException(nameof(key));

            int bucket = GetBucketIndex(key);
            Node? curr = _buckets[bucket];
            Node? prev = null;

            while (curr != null)
            {
                if (_comparer.Equals(curr.Key, key))
                {
                    if (prev == null)
                    {
                        // Removing head of chain
                        _buckets[bucket] = curr.Next!;
                    }
                    else
                    {
                        // Unlink middle or tail
                        prev.Next = curr.Next;
                    }

                    _count--;
                    _version++;
                    return true;
                }

                prev = curr;
                curr = curr.Next;
            }

            return false;
        }

        public void Clear()
        {
            Array.Clear(_buckets, 0, _buckets.Length);
            _count = 0;
            _version++;
        }

        private int GetBucketIndex(TKey key)
        {
            int hash = _comparer.GetHashCode(key);
            // Mask sign bit to ensure strictly positive modulo
            return (hash & 0x7FFFFFFF) % _buckets.Length;
        }

        private void Resize(int newCapacity)
        {
            Node[] newBuckets = new Node[newCapacity];

            for (int i = 0; i < _buckets.Length; i++)
            {
                Node? curr = _buckets[i];
                while (curr != null)
                {
                    Node next = curr.Next!;
                    int newBucket = (_comparer.GetHashCode(curr.Key) & 0x7FFFFFFF) % newCapacity;

                    // Prepend into new bucket
                    curr.Next = newBuckets[newBucket];
                    newBuckets[newBucket] = curr;

                    curr = next;
                }
            }

            _buckets = newBuckets;
        }

        public IEnumerator<KeyValuePair<TKey, TValue>> GetEnumerator()
        {
            int expectedVersion = _version;

            for (int i = 0; i < _buckets.Length; i++)
            {
                Node? curr = _buckets[i];
                while (curr != null)
                {
                    if (expectedVersion != _version)
                    {
                        throw new InvalidOperationException("Collection was modified during enumeration.");
                    }

                    yield return new KeyValuePair<TKey, TValue>(curr.Key, curr.Value);
                    curr = curr.Next;
                }
            }
        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();

        /// <summary>
        /// Singly-linked bucket node.
        /// </summary>
        private sealed class Node
        {
            public readonly TKey Key;
            public TValue Value;
            public Node? Next;

            public Node(TKey key, TValue value, Node? next)
            {
                Key = key;
                Value = value;
                Next = next;
            }
        }
    }

    /// <summary>
    /// Self-testing verification harness.
    /// </summary>
    public static class ChainedHashMapProgram
    {
        public static void Main()
        {
            Console.WriteLine("Running Separate Chaining Hash Map Verification Suite...");

            var map = new ChainedHashMap<string, int>(initialCapacity: 5);

            // Test 1: Insertion and Lookup
            map.Add("Apple", 100);
            map.Add("Banana", 200);
            map.Add("Cherry", 300);

            Debug.Assert(map.Count == 3);
            Debug.Assert(map["Apple"] == 100);
            Debug.Assert(map["Banana"] == 200);
            Debug.Assert(map["Cherry"] == 300);

            // Test 2: Updates
            map["Apple"] = 150;
            Debug.Assert(map["Apple"] == 150);

            // Test 3: Deletion
            bool removed = map.Remove("Banana");
            Debug.Assert(removed);
            Debug.Assert(!map.ContainsKey("Banana"));
            Debug.Assert(map.Count == 2);

            // Test 4: Dynamic Resizing trigger
            // Insert enough elements to exceed load factor 0.75
            for (int i = 0; i < 20; i++)
            {
                map.AddOrUpdate($"Item_{i}", i);
            }

            Debug.Assert(map.Capacity > 5, "Map failed to resize dynamically!");
            for (int i = 0; i < 20; i++)
            {
                Debug.Assert(map[$"Item_{i}"] == i);
            }

            Console.WriteLine("All Separate Chaining Hash Map tests passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### Asymptotic Profile

| Operation | Best Case | Expected Case (SUHA) | Worst Case (Hostile Collisions) | Auxiliary Space |
| :--- | :--- | :--- | :--- | :--- |
| `Search (Get)` | $\Theta(1)$ (head of chain) | $\Theta(1 + \alpha)$ | $\Theta(N)$ (linear chain scan) | $\Theta(1)$ |
| `Insert (Put)` | $\Theta(1)$ | $\Theta(1 + \alpha)$ | $\Theta(N)$ | $\Theta(1)$ (new node) |
| `Delete (Remove)`| $\Theta(1)$ (head of chain) | $\Theta(1 + \alpha)$ | $\Theta(N)$ | $\Theta(1)$ |
| `Rehash` | $\Theta(N + M)$ | $\Theta(N + M)$ | $\Theta(N + M)$ | $\Theta(N_{\text{new}})$ |

### Systems Memory Overhead
In a 64-bit CLR, storing $1,000,000$ key-value pairs (`int` $\to$ `int`) in `ChainedHashMap`:
- **Node Allocations:** $1,000,000 \times 32 \text{ bytes} \approx 32 \text{ MB}$.
- **Bucket Array:** $1,333,333 \times 8 \text{ bytes} \approx 10.6 \text{ MB}$.
- **Total Overhead:** $\approx 42.6 \text{ MB}$ for 8 MB of raw primitive data! ($> 5\times$ memory bloat).
- Additionally, creating $10^6$ distinct node objects creates heavy pressure on the .NET Garbage Collector during mark-and-sweep phases.

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### Problem: [LeetCode 706] Design HashMap (Easy / Medium from-scratch)

#### Problem Statement
Design a HashMap without using any built-in hash table libraries.
Implement the `MyHashMap` class:
- `MyHashMap()` initializes the object with an empty map.
- `void put(int key, int value)` inserts a `(key, value)` pair into the HashMap. If the key already exists, update the corresponding value.
- `int get(int key)` returns the value to which the specified key is mapped, or `-1` if this map contains no mapping for the key.
- `void remove(key)` removes the key and its corresponding value if the map contains the mapping for the key.

#### Production Solution in C#
```csharp
public class MyHashMap
{
    private class Node
    {
        public int Key;
        public int Value;
        public Node Next;
        public Node(int k, int v, Node n) { Key = k; Value = v; Next = n; }
    }

    private const int Capacity = 10007; // Prime bucket count
    private readonly Node[] _buckets;

    public MyHashMap()
    {
        _buckets = new Node[Capacity];
    }

    private int GetBucket(int key) => (key & 0x7FFFFFFF) % Capacity;

    public void Put(int key, int value)
    {
        int b = GetBucket(key);
        Node curr = _buckets[b];

        while (curr != null)
        {
            if (curr.Key == key)
            {
                curr.Value = value; // Update existing
                return;
            }
            curr = curr.Next;
        }

        // Prepend new node
        _buckets[b] = new Node(key, value, _buckets[b]);
    }

    public int Get(int key)
    {
        int b = GetBucket(key);
        Node curr = _buckets[b];

        while (curr != null)
        {
            if (curr.Key == key) return curr.Value;
            curr = curr.Next;
        }

        return -1; // Key absent
    }

    public void Remove(int key)
    {
        int b = GetBucket(key);
        Node curr = _buckets[b];
        Node prev = null;

        while (curr != null)
        {
            if (curr.Key == key)
            {
                if (prev == null) _buckets[b] = curr.Next;
                else prev.Next = curr.Next;
                return;
            }
            prev = curr;
            curr = curr.Next;
        }
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 705] Design HashSet (Easy):**
   - *Task:* Implement a HashSet from scratch using separate chaining with linked nodes storing only keys.
   - *Invariants:* Ensure duplicate keys are rejected on `add(key)`.

2. **[LeetCode 219] Contains Duplicate II (Easy/Medium):**
   - *Task:* Given an integer array `nums` and an integer `k`, return `true` if there are two distinct indices `i` and `j` such that `nums[i] == nums[j]` and `abs(i - j) <= k`.
   - *Pattern:* Sliding window hash set of size $k$. Add element $i$; if already present, return `true`; when window exceeds $k$, remove `nums[i - k]`.

3. **Bucket Node Object Pool Optimization:**
   - *Task:* In high-throughput C# systems, how can we avoid GC allocation on every `Put`?
   - *Hint:* Maintain a free list of recycled `Node` objects or use struct nodes in an array pool!

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Associative Storage Architecture Decision:

                   ┌─────────────────────────────────────────┐
                   │    ASSOCIATIVE STORAGE ARCHITECTURE     │
                   └─────────────────────────────────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│       SEPARATE CHAINING (POINTERS)   │  │       FLAT OPEN ADDRESSING           │
├──────────────────────────────────────┤  ├──────────────────────────────────────┤
│ • Load factor can exceed 1.0.        │  │ • Strictly bounded load factor (<=0.5│
│ • Trivially simple node deletion.    │  │ • Zero pointer overhead (0 bytes).   │
│ • Tolerates poor hash distributions. │  │ • Optimal CPU L1 cache line speed.   │
│ • Higher memory overhead per node.   │  │ • Tombstone recycling required.      │
│ • Standard: C++ std::unordered_map   │  │ • Standard: Rust HashMap, SwissTable │
└──────────────────────────────────────┘  └──────────────────────────────────────┘
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
In separate chaining, what is the expected time complexity of search when the hash function is uniform vs when an adversary forces all keys into a single bucket?

### Architectural Model Answer
1. **Expected Case Under Uniform Hashing (SUHA):**
   - Under the Simple Uniform Hashing Assumption, the probability that any key hashes to bucket $i$ is uniformly $1 / M$.
   - When distributing $N$ keys across $M$ buckets, the expected length of any given linked chain is the load factor:
     $$\mathbb{E}[\text{Chain Length}] = \alpha = \frac{N}{M}$$
   - Computing the bucket index via modular arithmetic takes $\Theta(1)$ time.
   - Traversing the chain inspects an average of $\alpha / 2$ nodes for a successful search and $\alpha$ nodes for an unsuccessful search.
   - Therefore, the total expected time complexity is:
     $$T_{\text{expected}} = \Theta(1 + \alpha)$$
   - When the table resizes dynamically to maintain $\alpha \le 0.75$, $T_{\text{expected}} = \Theta(1 + 0.75) = \mathbf{\Theta(1) \text{ constant time}}$.

2. **Adversarial Worst Case (Hash Flooding Attack):**
   - If an adversary knows the hash function (e.g. standard MurmurHash or polynomial hash with fixed seed), they can generate $N$ distinct keys that all produce the exact same bucket index:
     $$\forall i \in [1, N]: \quad h(k_i) \pmod M = B_{\text{target}}$$
   - In this adversarial scenario, $M-1$ buckets remain completely empty, while a single bucket contains a massive linked list of all $N$ elements.
   - Searching for or inserting a key requires traversing the entire $N$-element linked list:
     $$T_{\text{worst}} = \mathbf{\Theta(N) \text{ linear time}}$$
   - Inserting $N$ such keys takes $\sum_{i=1}^N i = \mathbf{\Theta(N^2) \text{ quadratic time}}$, exhausting CPU capacity. Modern runtimes defend against this by treeifying long chains into Red-Black trees ($O(\log N)$) or using randomized secret seeds (SipHash).
