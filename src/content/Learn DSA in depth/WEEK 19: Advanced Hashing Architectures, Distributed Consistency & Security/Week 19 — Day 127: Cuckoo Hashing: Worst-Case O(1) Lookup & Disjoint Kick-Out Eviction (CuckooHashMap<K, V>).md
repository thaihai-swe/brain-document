---
title: "Week 19 — Day 127: Cuckoo Hashing: Worst-Case O(1) Lookup & Disjoint Kick-Out Eviction (CuckooHashMap<K, V>)"
---

# Week 19 — Day 127: Cuckoo Hashing: Worst-Case O(1) Lookup & Disjoint Kick-Out Eviction (CuckooHashMap<K, V>)

Welcome to **Day 127 of your DSA Mastery Journey**!

Throughout Week 18, you mastered the classical collision resolution paradigms: **Separate Chaining** (pointer-linked buckets) and **Open Addressing** (Linear Probing, Quadratic Probing, and Double Hashing). While these structures deliver expected $O(1)$ operations under the Simple Uniform Hashing Assumption (SUHA), they share a critical vulnerability: **unbounded worst-case lookup latency**. In the worst case, hash collisions can degrade search times to $O(N)$ linear scans. For mission-critical systems such as high-frequency trading matching engines, network router forwarding tables (TCAM emulators), and real-time gaming engines, an unexpected $O(N)$ latency spike violates service level agreements (SLAs).

Today, we study and implement the groundbreaking algorithmic architecture introduced by Rasmus Pagh and Flemming Friche Rodler (2001): **Cuckoo Hashing**. 

By utilizing multiple disjoint hash tables and an eviction-based insertion algorithm inspired by the cuckoo bird's habit of pushing eggs out of another bird's nest, Cuckoo Hashing achieves an extraordinary theoretical and practical property: **strictly guaranteed worst-case $O(1)$ search and deletion time**, requiring at most **two memory reads**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 DAY 127: CUCKOO HASHING TOPOLOGY                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│        TABLE 1: T1[0 .. M-1]      │                             │        TABLE 2: T2[0 .. M-1]      │
│        Hash Function: h1(k)       │                             │        Hash Function: h2(k)       │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ Slot 0: [Empty]                   │                             │ Slot 0: ("B", 42)                 │
│ Slot 1: ("A", 10)  ◄──────┐       │                             │ Slot 1: [Empty]                   │
│ Slot 2: [Empty]           │       │   Displaced / Kicked Out    │ Slot 2: ("C", 99) ◄──────┐        │
│ Slot 3: ("D", 77)         │ Evict ├────────────────────────────►│ Slot 3: [Empty]          │ Evict  │
│ ...                               │                             │ ...                      │        │
└───────────────────────────────────┘                             └──────────────────────────┴────────┘
                 ▲                                                                 │
                 └────────────────── If T2[h2(A)] occupied, kick to T1 ────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CYCLE DETECTION & REHASHING         │
                          ├─────────────────────────────────────────────┤
                          │ • If eviction chain exceeds MaxSteps (~32): │
                          │   A directed cycle in Cuckoo Graph exists!  │
                          │ • Action: Allocate new tables with new hash │
                          │   seeds and reinsert all active keys.       │
                          │ • Guaranteed Lookup: inspect T1[h1(k)] and  │
                          │   T2[h2(k)]. Exactly <= 2 memory reads!     │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🐦 The Visual Mental Model: The European Cuckoo Bird & The Two Nests

Before analyzing bipartite cuckoo graphs or Erdős–Rényi phase transitions, picture the curious behavior of the European cuckoo bird in nature:

```
              🐦 THE CUCKOO BIRD & THE DISJOINT TWO-NEST RULE

   The cuckoo bird never builds its own nest. Instead:
   • It flies into an existing bird's nest and lays its egg.
   • It RUTHLESSLY KICKS OUT THE RESIDENT BIRD to take over the nest!
   • The displaced bird must fly away and find its BACKUP NEST!

   HOW CUCKOO HASHING DESIGNS COMPUTER MEMORY:
   Instead of one giant table, we allocate TWO SEPARATE TABLES (Table 1 and Table 2):
   Every key has EXACTLY TWO possible nests in the entire universe:
   • Nest 1 = T1[ h1(key) ]
   • Nest 2 = T2[ h2(key) ]

   THE CONSTANT-TIME SEARCH MIRACLE (STRICT WORST-CASE O(1)):
   To look up "Alice":
   1. Check Table 1 at slot h1("Alice"). If she's there, return!
   2. Check Table 2 at slot h2("Alice"). If she's there, return!
   3. If neither slot has Alice:
      ===> ALICE CANNOT POSSIBLY EXIST ANYWHERE IN THE DATABASE!
      Stop! You NEVER inspect a 3rd slot! Maximum 2 reads, period!

   THE CASCADING KICK-OUT INSERTION:
   • To insert "Charlie", you place him in Table 1 at h1("Charlie").
   • If "Bob" is already sitting there:
     - Charlie KICKS BOB OUT!
     - Displaced Bob flies to Table 2 at h2("Bob").
     - If "David" is sitting there, Bob KICKS DAVID OUT!
     - Displaced David flies back to Table 1 to find his alternate nest!
   • The chain terminates as soon as a displaced key lands in an EMPTY slot!
```

---

### 1.2 🖼️ Visual Gallery: The Cascading Kick-Out Sequence in Action

```
   Step 0: Table 1 and Table 2 with existing residents:
   T1: [ Slot 1: "Alice" ]
   T2: [ Slot 2: "Bob"   ]

   Operation: Insert "Charlie" where h1("Charlie") = 1 and h2("Charlie") = 3:
   
   Step 1: Charlie tries T1[1] (Occupied by "Alice"!).
           Charlie moves in; "Alice" is KICKED OUT!
           T1[1] is now "Charlie".
           
   Step 2: "Alice" must flee to her alternate nest in Table 2: h2("Alice") = 2!
           T2[2] is occupied by "Bob"!
           "Alice" moves in; "Bob" is KICKED OUT!
           T2[2] is now "Alice".
           
   Step 3: "Bob" must flee to his alternate nest in Table 1: h1("Bob") = 3!
           T1[3] is EMPTY!
           "Bob" moves into T1[3]!
           🎉 CASCADE COMPLETE! All keys peacefully stored!
```

---

### 1.3 🏛️ Memory Layout: Dual Disjoint Arrays in Hardware RAM

```
   Hardware Dual-Array Architecture:
   
   Table 1 (Primary Nests, Size M):
   Index:      [ 0 ]    [ 1: Charlie ]    [ 2 ]    [ 3: Bob ]    [ 4 ]
   
   Table 2 (Secondary Nests, Size M):
   Index:      [ 0 ]    [ 1 ]             [ 2: Alice ]    [ 3 ]  [ 4 ]
   
   • In hardware FPGAs, Network ASICs, and dual-channel memory:
     Memory Controller issues h1(k) and h2(k) SIMULTANEOUSLY in parallel!
     Lookup completes in a single clock cycle!
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* **Cuckoo Hashing** is an open-addressing dictionary structure employing two (or more) distinct hash tables $T_1$ and $T_2$ of equal size $M$, and two independent universal hash functions $h_1(k)$ and $h_2(k)$. 
  - *The Invariant of Constant-Time Search:* For any key $k$ stored in the table, $k$ **must** reside at either index $h_1(k)$ in $T_1$ or index $h_2(k)$ in $T_2$.
    $$\forall k \in \mathcal{K}, \quad \text{Location}(k) \in \{ T_1[h_1(k)], \; T_2[h_2(k)] \}$$
    Consequently, searching for a key never probes more than two slots, guaranteeing **deterministic $O(1)$ worst-case lookup**.
  - *The Insertion Invariant (Kick-Out Eviction):* A new key $k$ is initially placed into $T_1[h_1(k)]$. If that slot is already occupied by key $k'$, $k$ **evicts** (kicks out) $k'$. The displaced key $k'$ must then be relocated to its alternative slot in $T_2[h_2(k')]$. If that slot is occupied by $k''$, $k''$ is displaced to its alternative slot in $T_1[h_1(k'')]$. This cascading eviction continues until an empty slot is found or an eviction loop (cycle) is detected.
  - *Misconception Check:*
    - *Misconception 1:* "Cuckoo hashing guarantees worst-case $O(1)$ insertion time." **False!** While lookup and delete are strictly $O(1)$ worst-case, insertion has an **amortized expected $O(1)$** time. If an eviction cycle occurs, insertion triggers an expensive $O(N)$ full table rehash.
    - *Misconception 2:* "Cuckoo hashing can support high load factors like 90%." **False!** Classical 2-hash cuckoo hashing suffers from a phase transition around load factor $\alpha \approx 0.50$ (50%). Above 50% capacity, the probability of an infinite eviction cycle approaches 1.0. Modern variants (e.g., Cuckoo tables with bucket size $B=4$ or 3 hash functions) increase viable load factors to 90–95%.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates long probe runs and primary clustering in linear probing, and eliminates pointer chasing and heap fragmentation in separate chaining.
  - *Guaranteed SLA:* In read-heavy systems where p99.99 read latency must be bounded (e.g., DNS resolution, hardware packet filtering, key-value lookup caches), Cuckoo Hashing guarantees that no lookup ever requires more than two cache line inspections.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Read-dominated workloads where lookups outnumber insertions by orders of magnitude (e.g., static configuration lookup, networking routing tables).
    - Hardware implementations (FPGA, ASIC, TCAM emulators) where two memory reads can be executed **simultaneously in parallel** via two independent memory banks.
  - *When to Avoid / Failure Modes:*
    - Write-heavy workloads where cascading kick-outs cause high write amplification and frequent rehash operations.
    - High-concurrency multithreaded systems with concurrent writers, as cascading evictions require complex multi-slot locking.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Hardware Parallelism:* $T_1$ and $T_2$ can be stored in distinct memory chips or cache lines. Because $h_1(k)$ and $h_2(k)$ are independent, a modern superscalar CPU or dual-channel memory architecture can issue both memory prefetch requests concurrently.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "Cuckoo Hashing resolves collisions by maintaining two disjoint tables with two independent hash functions. Any key resides in exactly one of two predetermined slots: $T_1[h_1(k)]$ or $T_2[h_2(k)]$. Lookups and deletions are strictly deterministic worst-case $O(1)$, taking at most two memory lookups. Insertions use kick-out eviction: an incoming key evicts the existing resident to its alternate table. If the eviction chain detects a cycle—exceeding $O(\log N)$ steps—we rehash the entire table with new hash seeds."
- **6. HOW (Operations, Implementation & State Trace):**
  - *Complexity Profile:* `Lookup`: Worst-case $O(1)$ ($\le 2$ reads); `Delete`: Worst-case $O(1)$ ($\le 2$ reads); `Insert`: Expected amortized $O(1)$, Worst-case $O(N)$ (if rehash triggered); Space: $O(N)$ (typically operating at load factor $\alpha \le 0.50$).

---

### 1.5 The Cuckoo Graph & The Cycle Phase Transition

To understand why Cuckoo Hashing works—and why it fails when $\alpha > 0.50$—we model the table as an undirected **Cuckoo Graph** $G = (V, E)$:
- **Vertices ($V$):** The set of all $2M$ bucket slots across both tables $T_1$ and $T_2$.
- **Edges ($E$):** Each stored key $k$ represents an undirected edge connecting vertex $u = T_1[h_1(k)]$ and vertex $v = T_2[h_2(k)]$.

```
Cuckoo Bipartite Graph Representation:
Table 1 Slots (T1)                 Table 2 Slots (T2)
      [Slot 0] ────────────────────────── [Slot 0]
      [Slot 1] ─── Key "A" ────────────── [Slot 2]
      [Slot 2] ─── Key "B" ────────────── [Slot 1]
      [Slot 3] ─── Key "C" ────────────── [Slot 2]  <-- Collision on T2[2]!
```

#### The Insertion Path and Cycle Theorem
An insertion of a new key $k_{\text{new}}$ is equivalent to adding a new edge between $h_1(k_{\text{new}})$ and $h_2(k_{\text{new}})$.
- A cascading eviction sequence corresponds to an alternating path along the edges of the Cuckoo Graph.
- If the connected component containing the new edge is a **tree** or a **unicyclic graph** (contains at most one cycle), the displacement sequence will eventually terminate at an unoccupied slot.
- If the component contains **more than one cycle** (a bicyclic component), the insertion loop will **never terminate**. No assignment of keys to slots exists that satisfies the Cuckoo invariant for that edge set!

#### The Erdős–Rényi Phase Transition
By random graph theory (Erdős–Rényi random graphs), when the ratio of edges to vertices $c = |E| / |V| = N / (2M) = \alpha / 2$ exceeds a critical threshold:
- For 2 hash functions: The threshold is $c^* = 1/2 \implies \alpha^* = 0.50$.
- When $\alpha < 0.50$, the probability of a cycle occurring during insertion is strictly bounded by $O(1/N)$, and the expected length of an eviction chain is bounded by $O(1)$.
- When $\alpha > 0.50$, a giant component with multiple cycles forms almost surely, causing insertion to trigger an infinite cycle.
- **Cycle Detection Threshold:** In practice, we set a maximum kick-out limit:
  $$\text{MaxEvictionSteps} = \max(32, \; 2 \lceil \log_2 N \rceil)$$
  If the eviction loop exceeds this threshold, a cycle is guaranteed, and the table triggers a complete rehash with new hash salt seeds.

---

## 2. 🛠️ IMPLEMENT: Production-Grade From-Scratch C# Container

Below is the standalone, production-grade C# implementation of `CuckooHashMap<K, V>`. It features:
1. Two disjoint arrays `_table1` and `_table2`.
2. Two independent hash functions (FNV-1a with distinct prime seeds).
3. The displacement (kick-out) insertion loop with cycle detection.
4. Automatic dynamic rehashing when an eviction cycle occurs or load exceeds $\alpha = 0.45$.
5. Deterministic worst-case $O(1)$ `TryGetValue` and `Remove`.
6. Complete `Debug.Assert` validation suite.

```csharp
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedHashing.Cuckoo
{
    /// <summary>
    /// Represents an entry in a Cuckoo Hash Table.
    /// </summary>
    public struct CuckooEntry<K, V>
    {
        public K Key;
        public V Value;
        public bool IsOccupied;

        public CuckooEntry(K key, V value)
        {
            Key = key;
            Value = value;
            IsOccupied = true;
        }

        public void Clear()
        {
            Key = default!;
            Value = default!;
            IsOccupied = false;
        }
    }

    /// <summary>
    /// A high-performance, deterministic worst-case O(1) search hash map
    /// implementing Pagh & Rodler's Cuckoo Hashing algorithm with twin tables.
    /// </summary>
    /// <typeparam name="K">The key type (must be non-null).</typeparam>
    /// <typeparam name="V">The value type.</typeparam>
    public class CuckooHashMap<K, V> : IEnumerable<KeyValuePair<K, V>> where K : notnull
    {
        private const int DefaultCapacity = 16;
        private const double MaxLoadFactor = 0.45; // Safe threshold below theoretical 0.50 limit

        private CuckooEntry<K, V>[] _table1;
        private CuckooEntry<K, V>[] _table2;
        private int _capacity; // Size of each individual table
        private int _count;

        // Hash seeds for generating independent universal hash functions
        private uint _seed1;
        private uint _seed2;
        private readonly IEqualityComparer<K> _comparer;

        public int Count => _count;
        public int CapacityPerTable => _capacity;
        public int TotalCapacity => _capacity * 2;
        public double CurrentLoadFactor => (double)_count / TotalCapacity;

        public CuckooHashMap(int initialCapacity = DefaultCapacity, IEqualityComparer<K>? comparer = null)
        {
            _capacity = Math.Max(DefaultCapacity, GetNextPowerOfTwo(initialCapacity));
            _comparer = comparer ?? EqualityComparer<K>.Default;
            _table1 = new CuckooEntry<K, V>[_capacity];
            _table2 = new CuckooEntry<K, V>[_capacity];
            _count = 0;

            InitializeHashSeeds();
        }

        private void InitializeHashSeeds()
        {
            var rng = new Random();
            _seed1 = (uint)rng.Next(1, int.MaxValue) | 1u; // Ensure non-zero odd seed
            _seed2 = (uint)rng.Next(1, int.MaxValue) | 1u;
            while (_seed1 == _seed2)
            {
                _seed2 = (uint)rng.Next(1, int.MaxValue) | 1u;
            }
        }

        #region Hash Computation

        /// <summary>
        /// Computes the first hash index into Table 1 using FNV-1a seeded variant.
        /// </summary>
        private int Hash1(K key)
        {
            uint hash = 2166136261u ^ _seed1;
            int raw = _comparer.GetHashCode(key);
            hash = (hash ^ (uint)raw) * 16777619u;
            return (int)((hash ^ (hash >> 16)) & (_capacity - 1));
        }

        /// <summary>
        /// Computes the second hash index into Table 2 using Murmur-inspired seeded mix.
        /// </summary>
        private int Hash2(K key)
        {
            uint hash = 2166136261u ^ _seed2;
            int raw = _comparer.GetHashCode(key);
            hash = (hash ^ (uint)raw) * 2654435761u; // Knuth's multiplicative golden ratio
            hash ^= hash >> 13;
            hash *= 1274126177u;
            return (int)((hash ^ (hash >> 16)) & (_capacity - 1));
        }

        #endregion

        #region Lookup (Strict Worst-Case O(1))

        /// <summary>
        /// Attempts to get the value associated with the specified key.
        /// Strictly deterministic: Inspects at most Table 1[h1] and Table 2[h2].
        /// </summary>
        public bool TryGetValue(K key, out V value)
        {
            if (key == null) throw new ArgumentNullException(nameof(key));

            // Check Table 1
            int idx1 = Hash1(key);
            if (_table1[idx1].IsOccupied && _comparer.Equals(_table1[idx1].Key, key))
            {
                value = _table1[idx1].Value;
                return true;
            }

            // Check Table 2
            int idx2 = Hash2(key);
            if (_table2[idx2].IsOccupied && _comparer.Equals(_table2[idx2].Key, key))
            {
                value = _table2[idx2].Value;
                return true;
            }

            value = default!;
            return false;
        }

        public bool ContainsKey(K key) => TryGetValue(key, out _);

        public V this[K key]
        {
            get
            {
                if (TryGetValue(key, out var val)) return val;
                throw new KeyNotFoundException($"Key '{key}' was not found in the Cuckoo Map.");
            }
            set => Put(key, value);
        }

        #endregion

        #region Insertion & Kick-Out Eviction

        /// <summary>
        /// Inserts or updates the specified key-value pair.
        /// Uses cascading kick-out displacement. If an eviction cycle is detected,
        /// automatically rehashes with fresh seeds.
        /// </summary>
        public void Put(K key, V value)
        {
            if (key == null) throw new ArgumentNullException(nameof(key));

            // Step 1: Check if key already exists in either table and update in-place
            int idx1 = Hash1(key);
            if (_table1[idx1].IsOccupied && _comparer.Equals(_table1[idx1].Key, key))
            {
                _table1[idx1].Value = value;
                return;
            }

            int idx2 = Hash2(key);
            if (_table2[idx2].IsOccupied && _comparer.Equals(_table2[idx2].Key, key))
            {
                _table2[idx2].Value = value;
                return;
            }

            // Step 2: Trigger growth resize if load factor exceeds safe limit
            if ((double)(_count + 1) / TotalCapacity > MaxLoadFactor)
            {
                ResizeAndRehash(_capacity * 2);
            }

            // Step 3: Kick-out eviction loop
            K currKey = key;
            V currVal = value;
            int maxSteps = Math.Max(32, 2 * (32 - BitOperationsLeadingZeros((uint)_capacity)));

            for (int step = 0; step < maxSteps; step++)
            {
                // Try to insert into Table 1
                int pos1 = Hash1(currKey);
                if (!_table1[pos1].IsOccupied)
                {
                    _table1[pos1] = new CuckooEntry<K, V>(currKey, currVal);
                    _count++;
                    return;
                }

                // Evict occupant from Table 1
                var evicted1 = _table1[pos1];
                _table1[pos1] = new CuckooEntry<K, V>(currKey, currVal);
                currKey = evicted1.Key;
                currVal = evicted1.Value;

                // Try to place the evicted key into Table 2
                int pos2 = Hash2(currKey);
                if (!_table2[pos2].IsOccupied)
                {
                    _table2[pos2] = new CuckooEntry<K, V>(currKey, currVal);
                    _count++;
                    return;
                }

                // Evict occupant from Table 2
                var evicted2 = _table2[pos2];
                _table2[pos2] = new CuckooEntry<K, V>(currKey, currVal);
                currKey = evicted2.Key;
                currVal = evicted2.Value;
            }

            // Step 4: Cycle detected! Eviction chain exceeded max steps.
            // Rehash with fresh seeds and re-insert the currently dangling key.
            RehashWithFreshSeeds();
            Put(currKey, currVal);
        }

        #endregion

        #region Deletion (Strict Worst-Case O(1))

        /// <summary>
        /// Removes the specified key from the table.
        /// Strictly deterministic: Checks Table 1 and Table 2.
        /// </summary>
        public bool Remove(K key)
        {
            if (key == null) throw new ArgumentNullException(nameof(key));

            int idx1 = Hash1(key);
            if (_table1[idx1].IsOccupied && _comparer.Equals(_table1[idx1].Key, key))
            {
                _table1[idx1].Clear();
                _count--;
                return true;
            }

            int idx2 = Hash2(key);
            if (_table2[idx2].IsOccupied && _comparer.Equals(_table2[idx2].Key, key))
            {
                _table2[idx2].Clear();
                _count--;
                return true;
            }

            return false;
        }

        #endregion

        #region Rehashing & Resizing

        private void RehashWithFreshSeeds()
        {
            // Keep same capacity, but randomize hash function seeds
            InitializeHashSeeds();
            ReinsertAllEntries(_capacity);
        }

        private void ResizeAndRehash(int newCapacity)
        {
            InitializeHashSeeds();
            ReinsertAllEntries(newCapacity);
        }

        private void ReinsertAllEntries(int targetCapacity)
        {
            var oldTable1 = _table1;
            var oldTable2 = _table2;

            _capacity = targetCapacity;
            _table1 = new CuckooEntry<K, V>[_capacity];
            _table2 = new CuckooEntry<K, V>[_capacity];
            _count = 0;

            // Reinsert elements from old Table 1
            for (int i = 0; i < oldTable1.Length; i++)
            {
                if (oldTable1[i].IsOccupied)
                {
                    Put(oldTable1[i].Key, oldTable1[i].Value);
                }
            }

            // Reinsert elements from old Table 2
            for (int i = 0; i < oldTable2.Length; i++)
            {
                if (oldTable2[i].IsOccupied)
                {
                    Put(oldTable2[i].Key, oldTable2[i].Value);
                }
            }
        }

        #endregion

        #region Utility Methods

        private static int GetNextPowerOfTwo(int value)
        {
            int power = 1;
            while (power < value) power <<= 1;
            return power;
        }

        private static int BitOperationsLeadingZeros(uint value)
        {
            if (value == 0) return 32;
            int count = 0;
            while ((value & 0x80000000u) == 0)
            {
                count++;
                value <<= 1;
            }
            return count;
        }

        public IEnumerator<KeyValuePair<K, V>> GetEnumerator()
        {
            for (int i = 0; i < _capacity; i++)
            {
                if (_table1[i].IsOccupied)
                    yield return new KeyValuePair<K, V>(_table1[i].Key, _table1[i].Value);
            }
            for (int i = 0; i < _capacity; i++)
            {
                if (_table2[i].IsOccupied)
                    yield return new KeyValuePair<K, V>(_table2[i].Key, _table2[i].Value);
            }
        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();

        #endregion
    }

    /// <summary>
    /// Comprehensive verification test suite for CuckooHashMap.
    /// </summary>
    public static class CuckooHashMapTests
    {
        public static void RunAllTests()
        {
            Console.WriteLine("Executing CuckooHashMap Verification Suite...");

            // Test 1: Basic Insert, Lookup, and Count
            var map = new CuckooHashMap<string, int>(initialCapacity: 8);
            map.Put("alpha", 1);
            map.Put("beta", 2);
            map.Put("gamma", 3);
            map.Put("delta", 4);

            Debug.Assert(map.Count == 4);
            Debug.Assert(map.TryGetValue("alpha", out int valAlpha) && valAlpha == 1);
            Debug.Assert(map.TryGetValue("beta", out int valBeta) && valBeta == 2);
            Debug.Assert(map.TryGetValue("gamma", out int valGamma) && valGamma == 3);
            Debug.Assert(map.TryGetValue("delta", out int valDelta) && valDelta == 4);
            Debug.Assert(!map.ContainsKey("nonexistent"));

            // Test 2: In-place Update
            map.Put("alpha", 100);
            Debug.Assert(map.Count == 4);
            Debug.Assert(map["alpha"] == 100);

            // Test 3: Deletion
            bool removed = map.Remove("beta");
            Debug.Assert(removed);
            Debug.Assert(map.Count == 3);
            Debug.Assert(!map.ContainsKey("beta"));
            Debug.Assert(!map.Remove("beta"), "Double remove should return false");

            // Test 4: Heavy Load & Cascading Eviction Stress Test
            // Inserting 500 keys forces multiple cascading kick-outs and resizes
            var stressMap = new CuckooHashMap<int, string>(initialCapacity: 16);
            for (int i = 0; i < 500; i++)
            {
                stressMap.Put(i, $"Value_{i}");
            }

            Debug.Assert(stressMap.Count == 500);
            for (int i = 0; i < 500; i++)
            {
                Debug.Assert(stressMap.TryGetValue(i, out string? strVal) && strVal == $"Value_{i}",
                    $"Failed to retrieve key {i} after cascading evictions!");
            }

            // Test 5: Verify removal during heavy load
            for (int i = 0; i < 250; i++)
            {
                Debug.Assert(stressMap.Remove(i));
            }
            Debug.Assert(stressMap.Count == 250);
            for (int i = 0; i < 250; i++)
            {
                Debug.Assert(!stressMap.ContainsKey(i));
            }
            for (int i = 250; i < 500; i++)
            {
                Debug.Assert(stressMap[i] == $"Value_{i}");
            }

            Console.WriteLine("All CuckooHashMap tests passed with 100% assertions verified!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### Asymptotic Profile

| Operation | Best Case | Expected Case (SUHA) | Worst Case (Deterministic) | Auxiliary Space |
| :--- | :--- | :--- | :--- | :--- |
| `Search (TryGetValue)` | $\Theta(1)$ (1 probe) | $\Theta(1)$ ($\le 2$ probes) | $\mathbf{\Theta(1)}$ **(Strictly $\le 2$ probes!)** | $O(1)$ |
| `Delete (Remove)` | $\Theta(1)$ (1 probe) | $\Theta(1)$ ($\le 2$ probes) | $\mathbf{\Theta(1)}$ **(Strictly $\le 2$ probes!)** | $O(1)$ |
| `Insert (Put)` | $\Theta(1)$ (empty slot) | Amortized $\Theta(1)$ | $\Theta(N)$ (if rehash triggered) | $O(1)$ |
| `Rehash (Cycle resolution)`| $\Theta(N)$ | $\Theta(N)$ | $\Theta(N)$ | $\Theta(N)$ |

### Systems Analysis: Why Cuckoo Hashing Dominates High-SLA Systems

1. **Hardware Cache Concurrency:**
   Because the locations $T_1[h_1(k)]$ and $T_2[h_2(k)]$ are completely disjoint and known in advance, modern CPUs can execute both hash computations and issue both L1/L2 cache prefetch requests **simultaneously in parallel**. Unlike linear probing, where slot $i+1$ cannot be prefetched until slot $i$ is inspected, Cuckoo Hashing eliminates data dependency hazards.

2. **Negative Lookup Efficiency:**
   In linear probing, proving a key is *absent* requires scanning until an empty slot is encountered (which can take dozens of probes when $\alpha = 0.70$). In Cuckoo Hashing, a negative lookup checks **exactly two slots** and halts immediately.

3. **Memory Overhead Comparison:**
   - Classical 2-hash Cuckoo Hashing operates at $\alpha \le 0.50$, consuming roughly $2\times$ the raw data storage.
   - However, because it stores entries as flat structs inside contiguous arrays, it requires **zero pointer overhead**, completely outperforming Separate Chaining in memory density and GC allocation pressure.

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### Problem 1: [LeetCode 205] Isomorphic Strings (Easy / Medium Pattern)

#### Problem Statement
Given two strings `s` and `t`, determine if they are isomorphic.
Two strings `s` and `t` are isomorphic if the characters in `s` can be replaced to get `t`.
All occurrences of a character must be replaced with another character while preserving the order of characters. No two characters may map to the same character, but a character may map to itself.

#### The Dual-Mapping / Bijective Hash Invariant
To ensure a valid mathematical **bijection** (one-to-one and onto), we must enforce two disjoint mapping invariants:
1. Every character $s[i]$ maps to exactly one character $t[i]$.
2. Every character $t[i]$ is mapped from exactly one character $s[i]$.
Using two hash tables (or arrays) mirrors the dual-table design of Cuckoo Hashing.

#### Production Solution in C#
```csharp
public class IsomorphicStringsSolution
{
    public static bool IsIsomorphic(string s, string t)
    {
        if (s.Length != t.Length) return false;

        // Using 256-entry fixed arrays for O(1) space ASCII direct mapping
        int[] mapStoT = new int[256];
        int[] mapTtoS = new int[256];

        for (int i = 0; i < s.Length; i++)
        {
            char charS = s[i];
            char charT = t[i];

            // 1-based indexing so that 0 represents unmapped
            int codeS = (int)charS;
            int codeT = (int)charT;

            if (mapStoT[codeS] == 0 && mapTtoS[codeT] == 0)
            {
                mapStoT[codeS] = codeT + 1;
                mapTtoS[codeT] = codeS + 1;
            }
            else
            {
                if (mapStoT[codeS] != codeT + 1 || mapTtoS[codeT] != codeS + 1)
                {
                    return false;
                }
            }
        }

        return true;
    }
}
```
- **Complexity:** Time: $O(N)$ single pass; Space: $O(1)$ fixed 256-element arrays.

---

### Problem 2: [LeetCode 290] Word Pattern (Easy / Medium Pattern)

#### Problem Statement
Given a `pattern` and a string `s`, find if `s` follows the same pattern.
Here *follow* means a full match, such that there is a bijection between a letter in `pattern` and a non-empty word in `s`.

#### Production Solution in C#
```csharp
using System.Collections.Generic;

public class WordPatternSolution
{
    public static bool WordPattern(string pattern, string s)
    {
        string[] words = s.Split(' ');
        if (pattern.Length != words.Length) return false;

        var charToWord = new Dictionary<char, string>();
        var wordToChar = new Dictionary<string, char>();

        for (int i = 0; i < pattern.Length; i++)
        {
            char c = pattern[i];
            string w = words[i];

            if (charToWord.TryGetValue(c, out var mappedWord))
            {
                if (mappedWord != w) return false;
            }
            else
            {
                charToWord[c] = w;
            }

            if (wordToChar.TryGetValue(w, out var mappedChar))
            {
                if (mappedChar != c) return false;
            }
            else
            {
                wordToChar[w] = c;
            }
        }

        return true;
    }
}
```
- **Complexity:** Time: $O(N + M)$ where $N$ is string length and $M$ is pattern length; Space: $O(U)$ where $U$ is unique tokens.

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 242] Valid Anagram (Easy):**
   - *Task:* Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.
   - *Architecture Connection:* Compare single-array frequency differential vs two-pass hash mapping.

2. **[LeetCode 202] Happy Number (Easy/Medium):**
   - *Task:* Determine if a number `n` is happy by repeatedly replacing the number with the sum of the squares of its digits.
   - *Architecture Connection:* Detect cycles in hash space using Floyd's Tortoise and Hare vs HashSet tracking.

3. **D-Ary Cuckoo Hashing Architectural Analysis:**
   - *Task:* Calculate the theoretical maximum load factor if we expand the Cuckoo Hash Table from 2 hash functions to 3 hash functions ($T_1, T_2, T_3$).
   - *Insight:* With $d=3$, the critical phase transition jumps from $\alpha \approx 0.50$ to $\alpha \approx 0.91$, achieving over $90\%$ memory utilization!

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Collision Resolution Architectural Comparison:

                     ┌───────────────────────────────────────────────┐
                     │          COLLISION RESOLUTION CHOICE          │
                     └───────────────────────────────────────────────┘
                                             │
             ┌───────────────────────────────┼───────────────────────────────┐
             ▼                               ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│    SEPARATE CHAINING    │     │     LINEAR PROBING      │     │     CUCKOO HASHING      │
├─────────────────────────┤     ├─────────────────────────┤     ├─────────────────────────┤
│ • Search: O(1 + alpha)  │     │ • Search: O(1) expected │     │ • Search: O(1) worst!   │
│ • Worst: O(N) chain     │     │ • Worst: O(N) cluster   │     │ • Worst: <= 2 probes    │
│ • High Memory overhead  │     │ • Optimal Cache lines   │     │ • Dual memory prefetch  │
│ • Use: General Purpose  │     │ • Use: CPU inner-loops  │     │ • Use: Hard Real-Time   │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
Why does Cuckoo Hashing guarantee worst-case $O(1)$ lookups, and under what condition does an insertion trigger a complete table rehash?

### Architectural Model Answer
1. **Worst-Case $O(1)$ Lookup Guarantee:**
   - In Cuckoo Hashing with two disjoint tables $T_1$ and $T_2$ and two independent hash functions $h_1$ and $h_2$, the fundamental invariant states that for any key $k$, its value **can only ever reside in one of two specific memory locations**:
     $$\text{Location}(k) \in \{ T_1[h_1(k)], \; T_2[h_2(k)] \}$$
   - When a search request arrives for key $k$, the algorithm computes $h_1(k)$ and inspects $T_1[h_1(k)]$. If present, it returns the value. If absent or containing another key, it computes $h_2(k)$ and inspects $T_2[h_2(k)]$.
   - If neither slot contains $k$, the key is guaranteed not to exist in the table. 
   - No open-address probe loops or linked chain traversals are ever performed. The lookup terminates in strictly **at most two memory reads**, making the worst-case lookup time deterministically $O(1)$.

2. **Rehash Trigger Condition:**
   - Insertion is performed via cascading kick-out evictions: placing key $k$ into $T_1[h_1(k)]$ displaces the current occupant $k'$ to its alternate location $T_2[h_2(k')]$, which may in turn displace $k''$ back to $T_1[h_1(k'')]$.
   - In graph-theoretic terms, keys represent edges and slots represent vertices in a Cuckoo Graph. If the sequence of displacements encounters a **cycle** (specifically, a component containing more edges than vertices), no valid placement of keys into slots exists without collisions.
   - To detect this without expensive graph traversal, the implementation enforces an eviction threshold:
     $$\text{MaxEvictionSteps} = \Theta(\log N) \approx 32$$
   - If the eviction loop reaches `MaxEvictionSteps` without finding an empty slot, a cycle is detected. The table must **rehash**:
     - It selects new random salt seeds for $h_1$ and $h_2$ (or doubles capacity if load factor exceeds threshold).
     - It rebuilds the tables and re-inserts all existing elements into the fresh hash space.
