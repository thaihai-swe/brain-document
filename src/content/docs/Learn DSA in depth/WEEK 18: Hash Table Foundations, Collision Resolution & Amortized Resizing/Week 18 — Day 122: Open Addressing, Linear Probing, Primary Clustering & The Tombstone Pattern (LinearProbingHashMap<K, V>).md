---
title: "Week 18 — Day 122: Open Addressing, Linear Probing, Primary Clustering & The Tombstone Pattern (LinearProbingHashMap<K, V>)"
---

# Week 18 — Day 122: Open Addressing, Linear Probing, Primary Clustering & The Tombstone Pattern (LinearProbingHashMap<K, V>)

Welcome to **Day 122 of your DSA Mastery Journey**!

Yesterday, on Day 121, you built `ChainedHashMap<K, V>`, using linked bucket lists to resolve hash collisions. While separate chaining is conceptually elegant, it suffers from a severe hardware limitation: **pointer chasing across the managed heap**, triggering L1/L2 CPU cache misses on every node traversal.

Today, we transition to the hardware engineer's dream: **Open Addressing with Linear Probing**.

In an open-addressing hash table, **all elements live directly inside a single flat contiguous array**. There are zero linked nodes, zero object reference pointers, and zero dynamic memory allocations during insertion. When a collision occurs, the algorithm simply steps to the next adjacent slot in the array.

Today, you will learn:
1. **The Linear Probing Mechanics:** Navigating $h(k, i) = (h(k) + i) \pmod M$.
2. **The Primary Clustering Disaster:** Why runs of occupied slots merge into giant traffic jams, causing quadratic probe length explosion.
3. **The Deletion Hazard & The Tombstone Pattern:** Why deleting an item cannot simply set the slot to empty, and how to recycle tombstones safely.
4. **The Critical $\alpha \le 0.50$ Load Factor Mandate:** Proving mathematically why open addressing degrades exponentially as $\alpha \to 1$.
5. **From-Scratch Container:** Building `LinearProbingHashMap<K, V>` in C# with tri-state slot management and tombstone reclamation.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                DAY 122: LINEAR PROBING ARCHITECTURE                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       FLAT CONTIGUOUS ARRAY       │                             │      THE TOMBSTONE PATTERN        │
│          _table[0 .. M-1]         │                             │       (TRI-STATE MACHINE)         │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Zero linked node overhead!      │                             │ • State: Empty | Occupied | Dead  │
│ • Probe Sequence:                 │                             │ • Why nulling slot is fatal:      │
│   idx = (hash + i) % M            │                             │   Breaks subsequent probe chains! │
│ • 100% L1 CPU Cache Locality:     │ ─── Probe adjacent slots ──►│ • Search traverses Dead slots.    │
│   Sequential memory words hit     │                             │ • Insert reclaims first Dead slot │
│   in a single 64-byte fetch!      │                             │   after verifying key uniqueness! │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         PRIMARY CLUSTERING DISASTER         │
                          ├─────────────────────────────────────────────┤
                          │ • Probability of hitting cluster of size L: │
                          │   Pr = (L + 1) / M                          │
                          │ • Larger clusters grow faster!              │
                          │ • Unsuccessful Search Probes:               │
                          │   E[probes] ≈ 0.5 * (1 + 1/(1 - alpha)^2)   │
                          │ • When alpha = 0.50: E[probes] = 2.5        │
                          │ • When alpha = 0.90: E[probes] = 50.5!      │
                          │ • Hard Limit: alpha <= 0.50 MANDATORY!      │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🅿️ The Visual Mental Model: The Parking Lot & The ⚰️ Tombstone Marker

Before looking at modulo probing formulas or clustering mathematics, picture parking a car in a crowded downtown parking garage:

```
              🅿️ THE PARKING GARAGE ANALOGY & THE "NEXT SPOT" RULE

   Imagine a parking lot with numbered stalls [ 0, 1, 2, 3, 4, 5, 6, 7 ]:
   • Your ticket directs you to Stall 2: h(k) = 2.
   
   1. INSERTION (LOOKING FOR A FREE SPOT):
      • You drive to Stall 2. It is already OCCUPIED by a blue car!
      • You don't leave the garage! You check Stall 3: also OCCUPIED!
      • You check Stall 4: EMPTY! You park in Stall 4.
      ===> Formula: h(k, i) = (h(k) + i) % M. You probed 2 -> 3 -> 4!

   2. SEARCH (RE-FINDING YOUR CAR):
      • You return to the lot. Ticket says Stall 2.
      • Stall 2 has a blue car (not yours). Probe forward to Stall 3.
      • Stall 3 has a red car (not yours). Probe forward to Stall 4.
      • Stall 4 has YOUR CAR! Found in 3 probes!

   3. ⚠️ THE FATAL DELETION BUG (THE BROKEN SEARCH CHAIN):
      • Suppose the car in Stall 3 leaves, and we wipe Stall 3 completely EMPTY:
        Stalls: [ Stall 2: Blue ][ Stall 3: EMPTY ][ Stall 4: YOUR CAR ]
        
      • Now you return to look for your car at Stall 2:
        - Check Stall 2: Blue car. Probe forward!
        - Check Stall 3: EMPTY!
        - Standard logic assumes: "An empty spot means no car ever probed past here!
          Your car does not exist!" ===> 💥 SEARCH FAILED FALSELY!
          
   4. ⚰️ THE TOMBSTONE PATTERN:
      • When Stall 3 leaves, you CANNOT set it to EMPTY!
      • You must place a ⚰️ TOMBSTONE ("DELETED"):
        "Someone used to be parked here! Do NOT abort your search; keep probing forward!"
      • When a NEW car arrives, it is allowed to park on top of a tombstone!
```

---

### 1.2 🖼️ Visual Gallery: Probe Sequences, Clustering & Tombstone Reuse

#### 1. The Three Slot States:

```
   State Enum:  [ EMPTY = 0 ]      [ OCCUPIED = 1 ]      [ DELETED (Tombstone) = 2 ]
   Lookup:      ABORT search!       Compare Key!          KEEP PROBING forward!
   Insert:      PARK here!          Collision (Probe++)   REUSE slot & park here!
```

#### 2. The Primary Clustering Snowball:

```
   Slots:   0     1     2     3     4     5     6     7     8
   Table: [   |   | X | X | X | X | X |   |   ]
                    ▲───────────────▲
                    Cluster of 5 contiguous elements (Indices 2 through 6)

   • If a new car hashes to 2, 3, 4, 5, 6, OR 7:
     ALL OF THEM END UP PROBING UNTIL THEY HIT SLOT 7!
   • The probability of hitting slot 7 is 6/9 = 66.7%!
   • Clusters act like magnets: The bigger they get, the faster they swallow new keys!
```

---

### 1.3 🏛️ Memory Layout: Flat L1 Cache Line Streaming vs Chaining Heap Pointers

Why do systems engineers choose Open Addressing over Separate Chaining despite clustering? **CPU Hardware Performance:**

```
   1. SEPARATE CHAINING (Pointer-Chasing Hell):
   RAM:  BucketArray[2] ──► [Heap Node A] ──► [Heap Node B] ──► [Heap Node C]
   CPU:  💥 3 separate heap allocations scattered across RAM! 3 CPU cache misses!

   2. LINEAR PROBING (Contiguous Hardware Streaming):
   RAM:  Table Array: [ Entry 0 | Entry 1 | Entry 2 | Entry 3 | Entry 4 ]
   CPU:  ⚡ When Entry 2 is fetched, the CPU loads the entire 64-BYTE CACHE LINE!
         Entry 2, Entry 3, and Entry 4 are ALREADY INSIDE L1 CACHE!
         Probes 2, 3, 4 execute at zero cost in sub-nanosecond hardware cycles!
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* **Open Addressing** is a collision resolution strategy where all key-value entries reside directly within a single flat array of capacity $M$ ($N \le M$). When an insertion hashes to an already occupied slot, the algorithm systematically probes a deterministic sequence of alternative slots until an available slot is found.
  - *Linear Probing Formula:*
    $$h(k, i) = (h(k) + i) \pmod M \quad \text{for probe index } i = 0, 1, 2, \dots, M-1$$
  - *Core Invariants:*
    1. **Capacity Invariant:** Total stored elements $N$ must strictly satisfy $N < M$. (The table can never exceed capacity).
    2. **Cluster Continuity Invariant:** Any key $k$ inserted into the table is reachable from initial hash slot $h(k)$ by traversing a contiguous sequence of non-empty slots (Occupied or Deleted).
  - *Misconception Check:*
    - *Misconception 1:* "When deleting an element, we can simply set `table[idx] = null`." **FATAL ERROR!** If you set slot $idx$ to `Empty`, any subsequent search for an element that was inserted *after* a collision at $idx$ will hit `Empty` and terminate immediately, falsely reporting that the key does not exist! You must place a **Tombstone** (`Deleted`).
    - *Misconception 2:* "Linear probing is always faster than chaining." **False!** If the load factor $\alpha > 0.70$, linear probing slows to an agonizing crawl due to primary clustering. Linear probing is only faster when $\alpha \le 0.50$.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates 100% of linked node memory overhead and GC pressure.
  - *Hardware Cache Alignment:* Probing adjacent array indices `idx, idx+1, idx+2` triggers the CPU hardware stream prefetcher. All probed entries reside within the same 64-byte L1 data cache line, executing with sub-nanosecond latency.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - High-throughput systems where memory access latency is the primary bottleneck.
    - Small, fixed-size keys and values (e.g. primitives, value-type structs) that pack tightly into arrays.
    - Memory-constrained environments where the 24–32 byte pointer overhead of linked nodes cannot be tolerated.
  - *When to Avoid / Failure Modes:*
    - When memory allocation cannot be resized dynamically and load factor might exceed $0.50$.
    - Large reference-type payloads where each slot occupies substantial memory.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Stored as a flat, single-dimensional array `Entry[] _table` on the managed heap. If the array is composed of structs with layout `[StructLayout(LayoutKind.Sequential)]`, it forms an unfragmented contiguous block of bytes in memory.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "Linear probing is an open-addressing strategy where all elements are stored directly in a single contiguous array. When a collision occurs, we probe sequential adjacent indices. Because adjacent slots share CPU cache lines, lookups achieve maximum hardware prefetch efficiency. However, linear probing suffers from primary clustering, where contiguous occupied slots merge into large blocks. To prevent exponential search degradation, we enforce a strict load factor limit of $\alpha \le 0.50$ and manage deletions using tombstone markers to preserve probe continuity."
- **6. HOW (Operations, Implementation & State Trace):**
  - *Complexity Profile (for $\alpha \le 0.50$):* Search: Expected $\Theta(1)$, Worst $\Theta(N)$; Insert: Expected $\Theta(1)$, Worst $\Theta(N)$; Delete: Expected $\Theta(1)$, Worst $\Theta(N)$; Max Load Factor: $\alpha_{\max} = 0.50$.

---

### 1.5 The Primary Clustering Catastrophe

The defining weakness of linear probing is **Primary Clustering**:

```
====================================================================================================
                        PRIMARY CLUSTERING TRAFFIC JAM VISUALIZATION
====================================================================================================
Slots:   0     1     2     3     4     5     6     7     8     9
Table: [   |   | X | X | X | X | X |   |   |   ]
                 ▲───────────────▲
                 Cluster of 5 contiguous elements (Indices 2 through 6)

What is the probability that the next inserted element joins this cluster?
• If new key hashes to 2: Collides! Probes to 3, 4, 5, 6 -> Lands at Slot 7.
• If new key hashes to 3: Collides! Probes to 4, 5, 6    -> Lands at Slot 7.
• If new key hashes to 4: Collides! Probes to 5, 6       -> Lands at Slot 7.
• If new key hashes to 5: Collides! Probes to 6          -> Lands at Slot 7.
• If new key hashes to 6: Collides! Lands at Slot 7.
• If new key hashes to 7: Lands at Slot 7 directly!

Result: SIX DIFFERENT HASH VALUES (2, 3, 4, 5, 6, 7) all funnel into Slot 7!
Probability of hitting an isolated slot: 1 / 10 = 10%.
Probability of hitting and extending this cluster: 6 / 10 = 60%!
====================================================================================================
```

> **The Primary Clustering Theorem:** In linear probing, an existing cluster of length $L$ has probability $\frac{L + 1}{M}$ of being hit and enlarged by the next random insertion. Therefore, **large clusters grow at a rate proportional to their size**, rapidly coalescing into massive continuous blocks.

---

### 1.2 Mathematical Derivation: Why $\alpha \le 0.50$ is Mandatory

Donald Knuth proved in 1962 that under the Simple Uniform Hashing Assumption, the expected number of probes in linear probing is:

$$\mathbb{E}[\text{Probes (Unsuccessful Search)}] \approx \frac{1}{2} \left( 1 + \left( \frac{1}{1 - \alpha} \right)^2 \right)$$

$$\mathbb{E}[\text{Probes (Successful Search)}] \approx \frac{1}{2} \left( 1 + \frac{1}{1 - \alpha} \right)$$

Let us calculate the expected number of probes as load factor $\alpha$ increases:

| Load Factor $\alpha$ | Expected Probes (Successful) | Expected Probes (Unsuccessful) | Latency Degradation |
| :--- | :--- | :--- | :--- |
| **$\alpha = 0.20$** | $1.12$ probes | $1.28$ probes | Near instantaneous |
| **$\alpha = 0.50$** | **$1.50$ probes** | **$2.50$ probes** | **Optimal Operating Threshold** |
| **$\alpha = 0.75$** | $2.50$ probes | $8.50$ probes | Noticeable cache stalls |
| **$\alpha = 0.90$** | $5.50$ probes | **$50.50$ probes** | **$20\times$ Slowdown!** |
| **$\alpha = 0.99$** | $50.50$ probes | **$5000.50$ probes** | **Catastrophic Lockup ($2000\times$)** |

Notice that while separate chaining degrades linearly ($\Theta(1 + \alpha)$), linear probing degrades **quadratically** with respect to $\frac{1}{1 - \alpha}$. Once $\alpha > 0.50$, performance collapses exponentially.

---

### 1.3 The Deletion Hazard & The Tombstone Solution

Consider what happens if we delete an entry naively:

```
[SCENARIO: NAIVE DELETION DESTRUCTION]
Table (M = 5):
Insert "A" (hash % 5 = 1) -> Slot 1: [ "A" ]
Insert "B" (hash % 5 = 1) -> Collides at 1! Probes to 2: [ "B" ]
Insert "C" (hash % 5 = 1) -> Collides at 1, 2! Probes to 3: [ "C" ]
State: [0: Empty | 1: "A" | 2: "B" | 3: "C" | 4: Empty]

Operation: Remove("B"). Suppose we set Slot 2 to Empty:
State: [0: Empty | 1: "A" | 2: Empty | 3: "C" | 4: Empty]

Now execute: ContainsKey("C"):
1. hash("C") % 5 = 1. Inspect Slot 1: Found "A" != "C". Probe to next slot (2).
2. Inspect Slot 2: Slot 2 is EMPTY!
3. Search halts immediately! Reports: "C was not found"! (FALSE NEGATIVE BUG!)
```

#### The Tri-State Machine
To fix this, each slot must maintain one of three states:
1. **`Empty`:** The slot has never held an item. Search **terminates**; Insertion can place here.
2. **`Occupied`:** The slot holds a live key-value pair.
3. **`Deleted` (Tombstone):** The slot held an item that was removed. Search **continues probing** past this slot; Insertion can **recycle and reuse** this slot!

```
[OPERATION WITH TOMBSTONE]
Remove("B") sets Slot 2 to TOMBSTONE (T):
State: [0: Empty | 1: "A" | 2: TOMBSTONE | 3: "C" | 4: Empty]

Now execute: ContainsKey("C"):
1. Inspect Slot 1: Found "A". Probe to Slot 2.
2. Inspect Slot 2: TOMBSTONE! Continue probe to Slot 3!
3. Inspect Slot 3: Found "C"! (CORRECT!)
```

---

### 1.4 ⚙️ Core Operations Deep-Dive: Linear Probing with Tombstones

#### Dimension 1: Operation Contract & Big-O Bounds

| Operation | Input Signature | Output / Post-condition | Expected ($\alpha \le 0.5$) | Worst Case | Auxiliary Space |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Get` | `bool TryGetValue(K key, out V val)` | Returns value; stops at `Empty` | $\Theta(1)$ | $\Theta(M)$ | $\Theta(1)$ |
| `Put` | `void Add(K key, V val)` | Reclaims first tombstone; stops duplicate | $\Theta(1)$ | $\Theta(M)$ | $\Theta(1)$ |
| `Remove` | `bool Remove(K key)` | Marks slot as `Deleted` (tombstone) | $\Theta(1)$ | $\Theta(M)$ | $\Theta(1)$ |
| `Rehash` | `void Rehash(int newCapacity)` | Migrates live items; purges all tombstones | $\Theta(N + M)$ | $\Theta(N + M)$ | $\Theta(M_{\text{new}})$ |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                           [ Put(key, value) ]
                                    │
                                    ▼
                       int idx = Hash(key) % M
                       int firstTombstone = -1
                                    │
                                    ▼
                     Loop probe = 0 to M - 1:
                     slot = (idx + probe) % M
                                    │
                                    ▼
                         What is table[slot].State?
                         /          │          \
                        /           │           \
                  OCCUPIED       DELETED        EMPTY
                    │               │             │
                    ▼               ▼             ▼
             Does key match?   Record first    Key is new!
             - YES: Update val tombstone index Slot to use = 
               and return.     (if not yet     (firstTombstone != -1 ?
             - NO: Continue.   recorded).      firstTombstone : slot)
                               Continue probe. Overwrite slot as OCCUPIED.
                                               Increment count.
                                               If (count + tombstones) / M > 0.5:
                                                   Rehash(2 * M)
```

---

#### Dimension 3: Visual ASCII State Transitions

Trace insertion with tombstone recycling:
Table size $M = 5$. Keys $A, B$ hash to 1.
1. `Insert(A)` at 1.
2. `Insert(B)` at 2 (collision probe).
3. `Remove(A)` $\implies$ Slot 1 becomes `Tombstone`.
4. `Insert(C)` where $C$ hashes to 1.

```
Step 1 & 2:
Table: [0: Empty | 1: A (Occupied) | 2: B (Occupied) | 3: Empty | 4: Empty]

Step 3: Remove(A):
Table: [0: Empty | 1: Tombstone | 2: B (Occupied) | 3: Empty | 4: Empty]

Step 4: Insert(C) (hash % 5 = 1):
- Probe 0 (slot 1): State is Tombstone.
  Record firstTombstone = 1. Continue probe to verify "C" is not a duplicate!
- Probe 1 (slot 2): State is Occupied ("B"). "B" != "C". Continue probe.
- Probe 2 (slot 3): State is Empty.
  Search terminates! "C" is guaranteed unique.
- Where do we insert? Reuse firstTombstone (Slot 1)!
Table: [0: Empty | 1: C (Occupied) | 2: B (Occupied) | 3: Empty | 4: Empty]
Tombstone reclaimed! Zero wasted space!
```

---

#### Dimension 4: Invariant Preservation Proof

**Theorem:** Linear probing with tombstones guarantees that an existing key $k$ will always be found by `Get(k)`, provided the table has not run out of slots.

*Proof by Induction on probe length $p$:*
1. Let key $k$ have been inserted at slot $S = (h(k) + p) \pmod M$.
2. During the insertion of $k$, every slot along the probe sequence $P = \{ (h(k) + i) \pmod M \mid 0 \le i < p \}$ was occupied at that moment.
3. Subsequent operations can either:
   - Leave a slot in $P$ occupied.
   - Delete an entry in $P$, converting its state to `Deleted` (Tombstone).
   - Re-insert a new entry into a `Deleted` slot in $P$, setting it to `Occupied`.
4. Crucially, **no operation ever transitions a slot in $P$ to `Empty`**!
5. When `Get(k)` executes, it probes the identical sequence starting from $h(k)$.
6. The probe sequence only terminates upon finding $k$ or encountering an `Empty` slot.
7. Because every slot in $P$ is either `Occupied` or `Deleted`, the search will never encounter `Empty` before inspecting slot $S$.
8. Slot $S$ still contains $k$ (unless $k$ itself was deleted).
9. Therefore, $k$ is guaranteed to be reached and found. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Scenario / Edge Case | Concrete Input | Danger / Pitfall | Guard / Architectural Resolution |
| :--- | :--- | :--- | :--- |
| **Table 100% Full** | Attempting insert into full table | Infinite loop probing forever | Enforce $\alpha \le 0.50$ via dynamic `Rehash()`; loop counter bounded to $M$. |
| **Duplicate Insert with Tombstone**| Table has Tombstone at 1, key at 2; insert key again | Inserting duplicate into tombstone | Must probe until `Empty` to confirm key absence before using tombstone! |
| **Tombstone Saturation** | $10^5$ inserts followed by $10^5$ deletes | Search times degrade because tombstones must be probed | Count tombstones in load factor: resize/compact when `(count + dead) / M > 0.50`. |
| **Negative Hash Modulo** | Hash code is `int.MinValue` | Negative index crash | Mask sign bit: `(key.GetHashCode() & 0x7FFFFFFF) % capacity`. |

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Container(s)

Below is the standalone, production-grade C# implementation of `LinearProbingHashMap<TKey, TValue>`. It features:
- Tri-state slot modeling (`Empty`, `Occupied`, `Deleted`).
- Optimal tombstone reclamation during insertion.
- Enforced load factor threshold $\alpha \le 0.50$.
- Comprehensive unit test assertion suite.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace HashTables.OpenAddressing
{
    /// <summary>
    /// Production-grade Hash Map implementing Open Addressing with Linear Probing
    /// and Tombstone Slot Reclamation.
    /// Strictly bounds load factor to alpha <= 0.50 for optimal CPU cache locality.
    /// </summary>
    /// <typeparam name="TKey">Key type.</typeparam>
    /// <typeparam name="TValue">Value payload type.</typeparam>
    public sealed class LinearProbingHashMap<TKey, TValue>
    {
        public enum SlotState : byte
        {
            Empty = 0,
            Occupied = 1,
            Deleted = 2 // Tombstone
        }

        private struct Entry
        {
            public TKey Key;
            public TValue Value;
            public SlotState State;
        }

        private Entry[] _table;
        private int _count;
        private int _tombstoneCount;
        private readonly IEqualityComparer<TKey> _comparer;

        private const int DefaultCapacity = 17; // Prime capacity
        private const double MaxLoadFactor = 0.50; // Critical open addressing threshold

        public LinearProbingHashMap(int initialCapacity = DefaultCapacity, IEqualityComparer<TKey>? comparer = null)
        {
            int capacity = Math.Max(initialCapacity, DefaultCapacity);
            _table = new Entry[capacity];
            _count = 0;
            _tombstoneCount = 0;
            _comparer = comparer ?? EqualityComparer<TKey>.Default;
        }

        public int Count => _count;
        public int Capacity => _table.Length;
        public double LoadFactor => (double)(_count + _tombstoneCount) / _table.Length;

        public TValue this[TKey key]
        {
            get
            {
                if (TryGetValue(key, out TValue val)) return val;
                throw new KeyNotFoundException($"Key '{key}' was not found.");
            }
            set => AddOrUpdate(key, value);
        }

        public void Add(TKey key, TValue value)
        {
            if (key == null) throw new ArgumentNullException(nameof(key));

            if (!InsertInternal(key, value, allowUpdate: false))
            {
                throw new ArgumentException($"An entry with the key '{key}' already exists.");
            }
        }

        public void AddOrUpdate(TKey key, TValue value)
        {
            if (key == null) throw new ArgumentNullException(nameof(key));
            InsertInternal(key, value, allowUpdate: true);
        }

        public bool TryGetValue(TKey key, out TValue value)
        {
            if (key == null) throw new ArgumentNullException(nameof(key));

            int capacity = _table.Length;
            int initialSlot = (_comparer.GetHashCode(key) & 0x7FFFFFFF) % capacity;

            for (int i = 0; i < capacity; i++)
            {
                int slot = (initialSlot + i) % capacity;
                ref Entry entry = ref _table[slot];

                if (entry.State == SlotState.Empty)
                {
                    // Empty slot encountered: key is definitely absent!
                    break;
                }

                if (entry.State == SlotState.Occupied && _comparer.Equals(entry.Key, key))
                {
                    value = entry.Value;
                    return true;
                }

                // If entry.State == SlotState.Deleted (Tombstone): continue probing!
            }

            value = default!;
            return false;
        }

        public bool ContainsKey(TKey key) => TryGetValue(key, out _);

        public bool Remove(TKey key)
        {
            if (key == null) throw new ArgumentNullException(nameof(key));

            int capacity = _table.Length;
            int initialSlot = (_comparer.GetHashCode(key) & 0x7FFFFFFF) % capacity;

            for (int i = 0; i < capacity; i++)
            {
                int slot = (initialSlot + i) % capacity;
                ref Entry entry = ref _table[slot];

                if (entry.State == SlotState.Empty)
                {
                    return false; // Key absent
                }

                if (entry.State == SlotState.Occupied && _comparer.Equals(entry.Key, key))
                {
                    // Convert slot to Tombstone (Deleted)
                    entry.State = SlotState.Deleted;
                    entry.Key = default!;
                    entry.Value = default!;

                    _count--;
                    _tombstoneCount++;
                    return true;
                }
            }

            return false;
        }

        private bool InsertInternal(TKey key, TValue value, bool allowUpdate)
        {
            int capacity = _table.Length;
            int initialSlot = (_comparer.GetHashCode(key) & 0x7FFFFFFF) % capacity;
            int firstTombstone = -1;

            for (int i = 0; i < capacity; i++)
            {
                int slot = (initialSlot + i) % capacity;
                ref Entry entry = ref _table[slot];

                if (entry.State == SlotState.Occupied)
                {
                    if (_comparer.Equals(entry.Key, key))
                    {
                        if (allowUpdate)
                        {
                            entry.Value = value;
                            return true;
                        }
                        return false; // Duplicate rejected
                    }
                }
                else if (entry.State == SlotState.Deleted)
                {
                    // Record first available tombstone to reclaim later
                    if (firstTombstone == -1)
                    {
                        firstTombstone = slot;
                    }
                }
                else // SlotState.Empty
                {
                    // Search terminates: key is confirmed unique.
                    int targetSlot = (firstTombstone != -1) ? firstTombstone : slot;

                    if (targetSlot == firstTombstone)
                    {
                        _tombstoneCount--; // Reclaimed tombstone
                    }

                    _table[targetSlot].Key = key;
                    _table[targetSlot].Value = value;
                    _table[targetSlot].State = SlotState.Occupied;
                    _count++;

                    // Trigger resize if total load (live + dead) exceeds 50%
                    if (LoadFactor > MaxLoadFactor)
                    {
                        Resize(_table.Length * 2 + 1);
                    }

                    return true;
                }
            }

            // Fallback resize if entire table was probed without encountering Empty
            Resize(_table.Length * 2 + 1);
            return InsertInternal(key, value, allowUpdate);
        }

        private void Resize(int newCapacity)
        {
            Entry[] oldTable = _table;
            _table = new Entry[newCapacity];
            _count = 0;
            _tombstoneCount = 0;

            // Re-insert only live (Occupied) entries, discarding all tombstones
            for (int i = 0; i < oldTable.Length; i++)
            {
                if (oldTable[i].State == SlotState.Occupied)
                {
                    InsertInternal(oldTable[i].Key, oldTable[i].Value, allowUpdate: false);
                }
            }
        }
    }

    /// <summary>
    /// Self-testing verification harness.
    /// </summary>
    public static class LinearProbingProgram
    {
        public static void Main()
        {
            Console.WriteLine("Running Linear Probing Hash Map Verification Suite...");

            var map = new LinearProbingHashMap<string, int>(initialCapacity: 7);

            // Test 1: Insert, Collision Probe, and Retrieval
            map.Add("Alpha", 1);
            map.Add("Beta", 2);
            map.Add("Gamma", 3);

            Debug.Assert(map.Count == 3);
            Debug.Assert(map["Alpha"] == 1);
            Debug.Assert(map["Beta"] == 2);
            Debug.Assert(map["Gamma"] == 3);

            // Test 2: Tombstone Continuity Test
            // Delete "Beta"
            bool removed = map.Remove("Beta");
            Debug.Assert(removed);
            Debug.Assert(!map.ContainsKey("Beta"));

            // Search for "Gamma" must successfully traverse past the tombstone left by "Beta"!
            Debug.Assert(map.ContainsKey("Gamma"));
            Debug.Assert(map["Gamma"] == 3);

            // Test 3: Tombstone Reclamation Test
            // Insert "Delta": should reuse the tombstone slot left by "Beta"
            map.Add("Delta", 4);
            Debug.Assert(map["Delta"] == 4);
            Debug.Assert(map["Gamma"] == 3);

            // Test 4: Dynamic Resizing & Tombstone Purge
            for (int i = 0; i < 20; i++)
            {
                map.AddOrUpdate($"Key_{i}", i * 10);
            }

            Debug.Assert(map.Capacity > 7, "Failed to resize!");
            for (int i = 0; i < 20; i++)
            {
                Debug.Assert(map[$"Key_{i}"] == i * 10);
            }

            Console.WriteLine("All Linear Probing tests passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### Memory Footprint: Chaining vs. Linear Probing

For $N = 1,000,000$ integers (`int` $\to$ `int`):

| Metric | Separate Chaining (`ChainedHashMap`) | Linear Probing (`LinearProbingHashMap`) |
| :--- | :--- | :--- |
| **Array Allocations** | $1$ array of references ($1.33\text{M} \times 8 = 10.6\text{ MB}$) | $1$ array of flat structs ($2\text{M} \times 16 = 32\text{ MB}$) |
| **Node Object Allocations** | **$1,000,000$ objects** ($32\text{ MB}$) | **ZERO heap node allocations!** |
| **Total Managed Memory** | $\approx 42.6 \text{ MB}$ | $\approx 32.0 \text{ MB}$ ($\mathbf{25\% \text{ less memory!}}$) |
| **GC Tracing Overhead** | **$1,000,001$ objects to scan** | **1 single object to scan** |
| **L1 Cache Line Probing** | Poor (3-4 pointer chases to DRAM) | **Optimal (sequential contiguous words)** |

Linear probing wins massively on GC mark-sweep performance because the Garbage Collector traces a **single contiguous array** rather than traversing 1 million individual node pointers.

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### Problem: [LeetCode 1] Two Sum (Easy)

#### Problem Statement
Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.
You may assume that each input would have exactly one solution, and you may not use the same element twice.

#### Solution using Flat Hash Table Principles

```csharp
using System;
using System.Collections.Generic;

public class TwoSumSolution
{
    public int[] TwoSum(int[] nums, int target)
    {
        // Hash map mapping value -> original index
        var map = new Dictionary<int, int>(capacity: nums.Length);

        for (int i = 0; i < nums.Length; i++)
        {
            int complement = target - nums[i];

            if (map.TryGetValue(complement, out int complementIndex))
            {
                return new int[] { complementIndex, i };
            }

            // Record current number's index
            map[nums[i]] = i;
        }

        return Array.Empty<int>();
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 136] Single Number (Easy):**
   - *Task:* Every element appears twice except for one. Find that single one.
   - *Pattern:* Hash Set insertion and deletion (or bitwise XOR in $O(1)$ space).

2. **[LeetCode 387] First Unique Character in a String (Easy):**
   - *Task:* Find the first non-repeating character in a string.
   - *Pattern:* Linear frequency array or open-addressing table pass followed by index inspection.

3. **[LeetCode 202] Happy Number (Easy):**
   - *Task:* Determine if a number loops endlessly in cycle of sum of squared digits.
   - *Pattern:* Open-addressing hash set cycle detection (or Floyd's tortoise and hare).

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Open Addressing in Production Runtimes:

Python 3.6+ Compact Dict Layout:
indices:  [ 0 | 2 | - | 1 | - | - | 3 ]  (Sparse array of 1-byte indices)
entries:  [ (hash0, k0, v0),             (Dense array of entries, packed tightly)
            (hash1, k1, v1),
            (hash2, k2, v2), ... ]
• Combines open addressing index probing with dense sequential array storage.
• Cuts memory usage by 30% to 50% compared to classic chaining!
• Guarantees insertion-order iteration out of the box!
```

Modern language runtimes (Python 3.6+, Rust’s `hashbrown`, Google’s `flat_hash_map`) have abandoned linked-node separate chaining in favor of flat open-addressing variants because modern CPU architectures penalize random DRAM memory hops far more than instruction execution counts.

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
Why must open addressing with linear probing maintain a load factor strictly below $\alpha \le 0.50$, and what happens mathematically to the expected probe length as $\alpha \to 1$?

### Architectural Model Answer
1. **The Mathematical Explosion of Probe Lengths:**
   - Under linear probing, the expected number of probes required to locate an absent key (unsuccessful search or new insertion) is given by Knuth's formula:
     $$\mathbb{E}[\text{Probes}] \approx \frac{1}{2} \left( 1 + \left( \frac{1}{1 - \alpha} \right)^2 \right)$$
   - Notice the term $\left( \frac{1}{1 - \alpha} \right)^2$:
     - When $\alpha = 0.50$: $\mathbb{E}[\text{Probes}] = \frac{1}{2}(1 + 2^2) = \mathbf{2.5 \text{ probes}}$. The hardware CPU prefetcher loads all 2.5 slots within a single 64-byte cache line fetch!
     - When $\alpha = 0.80$: $\mathbb{E}[\text{Probes}] = \frac{1}{2}(1 + 5^2) = \mathbf{13.0 \text{ probes}}$.
     - When $\alpha = 0.90$: $\mathbb{E}[\text{Probes}] = \frac{1}{2}(1 + 10^2) = \mathbf{50.5 \text{ probes}}$.
     - As $\alpha \to 1$: $\lim_{\alpha \to 1} \frac{1}{(1 - \alpha)^2} = \infty$. The expected probe count diverges quadratically toward infinity!

2. **The Physical Cause: Primary Clustering Cascade:**
   - In linear probing, any key that hashes anywhere into an existing cluster of size $L$ must probe across the entire cluster and append itself to the end, increasing the cluster size to $L + 1$.
   - Because the probability of an insertion hitting a cluster is proportional to its length ($\frac{L+1}{M}$), larger clusters expand faster than smaller clusters, rapidly merging adjacent clusters into massive contiguous blocks.
   - Once $\alpha > 0.50$, the probability of clusters coalescing crosses a critical percolation threshold. At $\alpha = 0.90$, lookups require scanning dozens of slots across multiple cache lines, destroying throughput. Enforcing $\alpha \le 0.50$ via dynamic doubling guarantees that probe lengths remain bounded to $\le 2.5$ on average.
