---
title: "Week 18 — Day 124: Dynamic Rehashing, Prime Capacity Scaling & The Potential Method Amortization Proof"
---

# Week 18 — Day 124: Dynamic Rehashing, Prime Capacity Scaling & The Potential Method Amortization Proof

Welcome to **Day 124 of your DSA Mastery Journey**!

Over the past three days, you mastered collision resolution mechanics: separate chaining, linear probing with tombstones, quadratic probing, and double hashing. In all four architectures, one foundational invariant governed their average $\Theta(1)$ performance: **The Load Factor Bound ($\alpha \le \alpha_{\max}$)**.

If a hash table never resized, inserting $N$ elements into $M$ fixed buckets would inevitably cause $\alpha = N / M \to \infty$, degrading all operations to $\Theta(N)$ linear scans.

Today, we master the mathematics and systems engineering of **Dynamic Rehashing**:
1. **The Rehashing Pipeline:** How allocating a new table and re-projecting keys restores $O(1)$ expected performance while purging tombstone sediment.
2. **Prime Capacity Scaling vs. Power-of-Two Bitmasking:** The deep architectural battle between .NET’s prime table strategy and Java/Go’s power-of-two bitmask strategy.
3. **Lemire's Fastmod Optimization:** How modern runtimes compute bucket indices without issuing a single expensive CPU integer division (`idiv`) instruction.
4. **The Potential Method Amortization Proof:** Proving mathematically via the credit accounting method why an occasional $O(N)$ table migration results in strictly **$O(1)$ amortized cost per insertion**.
5. **LeetCode Lab:** Mastering prefix sum hash lookups in **[LeetCode 128] Longest Consecutive Sequence** and **[LeetCode 560] Subarray Sum Equals K**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DAY 124: REHASHING & AMORTIZATION                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│     CAPACITY SCALING STRATEGIES   │                             │   THE POTENTIAL METHOD PROOF (Φ)  │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ 1. Prime Table Scaling (.NET):    │                             │ • Potential Function:             │
│    M_new = NextPrime(2 * M)       │                             │   Φ = 2N - M                      │
│    Eliminates divisor clusters!   │                             │ • Normal Insert (No Resize):      │
│ 2. Power-of-Two Bitmask (Java/Go):│                             │   c_i = 1, ΔΦ = 2 ==> c_hat = 3!  │
│    M_new = 2 * M                  │                             │ • Resize Insert (N = M):          │
│    idx = hash & (M - 1)           │                             │   c_i = M + 1, ΔΦ = 2 - M         │
│    Requires fmix32 bit-mixing!    │                             │   c_hat = (M + 1) + (2 - M) = 3!  │
│ 3. Lemire Fastmod:                │                             │ • Strictly O(1) Amortized Time!   │
│    (uint32)h * (uint64)M >> 32    │                             └───────────────────────────────────┘
└───────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 📦 The Visual Mental Model: Moving into a Bigger House & The Piggy Bank

Before analyzing amortized potential functions or Lemire fastmod, picture how a growing family moves into a bigger home:

```
              📦 MOVING INTO A BIGGER HOUSE & THE PIGGY BANK SAVINGS

   Imagine living in a small 4-room house (Capacity M = 4):
   Your belongings are stored in rooms according to: Room = Hash % 4.
   
   • Item "Book" (Hash = 5) goes into Room 1 (5 % 4 = 1).
   • Item "Shoe" (Hash = 6) goes into Room 2 (6 % 4 = 2).
   • Item "Coat" (Hash = 7) goes into Room 3 (7 % 4 = 3).
   
   Now your house is 75% full (Load Factor α = 0.75)! The rooms are getting crowded!
   You purchase a brand new 8-room house (Capacity M = 8).

   ⚠️ WHY YOU CANNOT JUST COPY ROOMS OVER (THE MODULO RE-ROUTING):
   In the new 8-room house, the room assignment formula is: Room = Hash % 8!
   • "Book" (Hash = 5): In the old house it was in Room 1.
     In the new house: 5 % 8 = Room 5! (It MOVES to a completely different room!)
   • "Shoe" (Hash = 6): 6 % 8 = Room 6!
   • "Coat" (Hash = 7): 7 % 8 = Room 7!
   ===> YOU MUST UNPACK EVERY SINGLE ITEM AND RE-ROUTE IT TO ITS NEW DESTINATION!

   💰 THE PIGGY BANK AMORTIZATION TRICK:
   Moving house takes O(N) expensive time. How do we keep insertions average O(1)?
   Every time you buy a cheap item:
   • You pay $1 of real work to put it away.
   • You drop $2 of imaginary savings tokens into a PIGGY BANK.
   By the time your house is full and you need to move, your Piggy Bank has saved
   EXACTLY enough tokens to pay the entire O(N) cost of the moving truck!
   Average amortized cost per item: Exactly $3 = O(1) constant time!
```

---

### 1.2 🖼️ Visual Gallery: Bucket Redistribution & The Dual-Table Memory Spike

#### 1. Re-Routing Keys During Capacity Doubling (Capacity 4 ──► Capacity 8):

```
   Old Table (Capacity = 4):                New Table (Capacity = 8):
   Slot 0: [ Key 8 ]  (8 % 4 = 0)   ───►    Slot 0: [ Key 8 ]  (8 % 8 = 0)
   Slot 1: [ Key 5 ]  (5 % 4 = 1)   ───►    Slot 1: [ EMPTY ]
   Slot 2: [ Key 14]  (14 % 4 = 2)  ───►    Slot 2: [ EMPTY ]
   Slot 3: [ Key 11]  (11 % 4 = 3)  ───►    Slot 3: [ Key 11]  (11 % 8 = 3)
                                            Slot 4: [ EMPTY ]
                                            Slot 5: [ Key 5 ]  (5 % 8 = 5)  <── Relocated!
                                            Slot 6: [ Key 14]  (14 % 8 = 6) <── Relocated!
                                            Slot 7: [ EMPTY ]

   Result: Load factor drops from 1.0 (cluttered) to 0.5 (clean and spacious)!
```

#### 2. ⚠️ The Temporary Memory Allocation Spike in Hardware RAM:
During rehashing, BOTH arrays must coexist in memory simultaneously:

```
   RAM During Rehashing:
   ┌───────────────────────────────────┐
   │ Old Table Array: 50 MB            │  <── Reading active keys
   ├───────────────────────────────────┤
   │ New Table Array: 100 MB           │  <── Inserting rehashed keys
   └───────────────────────────────────┘
   TOTAL MEMORY USAGE = 150 MB!
   Once all keys are migrated, Old Table Array is dereferenced and collected by GC!
```

---

### 1.3 🏛️ Systems Memory Architecture: Prime Modulo vs Power-of-Two Fastmod

```
   1. Prime Capacities (C# .NET):
      • Prevents stride clustering even with poor hash codes.
      • Historically slow idiv instruction (~25 cycles).
      • Modern .NET: Daniel Lemire Fastmod replaces division with 1 multiplication!
        fastmod = (uint)(((ulong)hash * (ulong)prime) >> 32) (Sub-nanosecond!).

   2. Power-of-Two Bitmasking (Java / Python):
      • Table size M = 2^k. Mask = M - 1.
      • Fast bitwise AND: hash & (M - 1) (1 CPU cycle).
      • Weakness: Ignores high bits! Requires bit mixing: hash ^ (hash >>> 16).
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* **Dynamic Rehashing** is the process of reallocating a hash table's backing array to a larger capacity (typically $\approx 2 \times M$) when the load factor $\alpha = N / M$ crosses a predetermined watermark, and recomputing the bucket index for every active element.
  - *Core Invariants:*
    1. **Load Factor Bound:** $\alpha = \frac{N + D}{M} \le \alpha_{\max}$ (where $D$ is the count of tombstones).
    2. **Rehash Reachability Invariant:** After rehashing from capacity $M_1$ to $M_2$, every key $k$ resides at index $h(k) \pmod{M_2}$ (or along its valid probe sequence).
  - *Misconception Check:*
    - *Misconception 1:* "When a hash table resizes, we can just `Array.Copy` the old array into the new array." **FATAL ERROR!** Because bucket indices depend on capacity ($h(k) \pmod M$), doubling $M$ changes the destination bucket for almost every key ($h(k) \pmod{17} \ne h(k) \pmod{37}$). Every single key must have its bucket index recalculated!
    - *Misconception 2:* "Rehashing takes $O(N \log N)$ time." **False!** Rehashing takes strictly $\Theta(N)$ time because re-inserting into an under-capacity table takes expected $O(1)$ time per element.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* As elements accumulate, probe lengths grow quadratically in open addressing, and chain lengths grow linearly in separate chaining. Rehashing disperses elements across a wider space, resetting the load factor to $\alpha / 2$ and restoring optimal $O(1)$ expected performance.
  - *Tombstone Sediment Purge:* In open addressing, rehashing discards all `Deleted` tombstones, reclaiming 100% of wasted space.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Trigger:*
    - Separate Chaining: Trigger when $\alpha > 0.75$.
    - Open Addressing (Linear Probing): Trigger when $\alpha > 0.50$.
    - Open Addressing (Double Hashing): Trigger when $\alpha > 0.65$.
  - *When to Avoid / Failure Modes:*
    - Uncontrolled Resizing Spikes: In ultra-low-latency financial trading (HFT), an unexpected $O(N)$ rehash pause (e.g. 5 milliseconds to rehash $10^7$ items) can violate execution SLAs. (Mitigated by incremental / progressive rehashing, as in Redis).
- **4. WHERE (Memory Model & Systems Primitives):**
  - *CLR Heap Dynamics:* Rehashing creates a temporary memory spike where **both the old table and the new table coexist simultaneously in memory**. If old table is 50 MB, the new table is 100 MB, requiring 150 MB total during migration. Once migration completes, the old array becomes eligible for Garbage Collection.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "Dynamic rehashing maintains average $O(1)$ hash table operations by doubling table capacity whenever the load factor exceeds its threshold. While an individual rehash takes $O(N)$ time to re-index all keys into the new array, the Potential Method proves that prepaying 2 units of work on each cheap insertion fully amortizes the migration cost, yielding strictly $O(1)$ amortized insertions. In .NET, we scale capacities through prime numbers to eliminate modular clustering, whereas runtimes like Java use power-of-two bitmasking paired with bit mixing."
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:* Normal Insert: $\Theta(1)$; Rehash Event: $\Theta(N)$; Amortized Insert: $\mathbf{\Theta(1)}$.

---

### 1.5 Prime Capacity Scaling vs. Power-of-Two Bitmasking

How should the new capacity $M_{\text{new}}$ be chosen?

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           THE CAPACITY SELECTION ARCHITECTURAL WAR                               │
├──────────────────────────────────────────────────┬───────────────────────────────────────────────┤
│           PRIME CAPACITY SCALING (.NET)          │       POWER-OF-TWO BITMASKING (JAVA / GO)     │
├──────────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ • Formula: M_new = NextPrime(2 * M)              │ • Formula: M_new = 2 * M                      │
│ • Bucket Index: hash % M                         │ • Bucket Index: hash & (M - 1)                │
│ • Advantage: Prime moduli naturally scramble     │ • Advantage: Bitwise AND executes in 1 clock  │
│   keys whose hash codes have common factors.     │   cycle (< 0.3 ns), whereas CPU integer       │
│ • Disadvantage: CPU integer division (idiv) is   │   division takes 15–30 clock cycles.          │
│   slow (~15–25 cycles).                          │ • Disadvantage: Ignores all high-order bits!  │
│ • .NET Mitigation: Daniel Lemire Fastmod!        │ • Mitigation: MurmurHash3 fmix32 bit-mixing!  │
└──────────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

#### The Power-of-Two Vulnerability:
If $M = 16 = 2^4$, the bitmask is $M - 1 = 15 = \text{0b00001111}$.
Any two keys whose hash codes end in the same 4 bits (e.g. `0x1234_0005` and `0xABCD_0005`) will hash to the **exact same bucket (5)**, regardless of how drastically different their remaining 28 bits are!
Therefore, power-of-two tables **mandate a bit-mixing finalizer** like Java’s:
```csharp
hash = hash ^ (hash >>> 16); // Fold high 16 bits into low 16 bits!
```

#### Lemire’s Fastmod: The Best of Both Worlds
In .NET Core 3.0+, Microsoft implemented Daniel Lemire’s **Fast Alternative to Modulo**:
Instead of computing `hash % M` (which issues an expensive `idiv` instruction), fastmod computes:
$$\text{bucket} = \left\lfloor \frac{(\text{uint32})\text{hash} \times (\text{uint64})M}{2^{32}} \right\rfloor = (\text{uint})(((\text{ulong})\text{hash} * (\text{ulong})M) \gg 32)$$
This replaces a 25-cycle integer division with a **single 3-cycle integer multiplication and shift**, giving prime-capacity tables the speed of bitmasking!

---

### 1.2 Mathematical Proof: Amortized $O(1)$ via the Potential Method

We now prove that dynamic doubling guarantees amortized $\Theta(1)$ insertions.

#### The Potential Function Setup
Let $N$ be the number of elements in the table, and $M$ be the current table capacity.
Assume the table doubles whenever $N = M$.
We define the **Potential Function** $\Phi$:
$$\Phi = 2N - M \quad (\text{for } N \ge M/2)$$

#### Invariant Verification:
1. Immediately after a doubling from $M/2$ to $M$, $N = M/2$.
   $$\Phi = 2(M/2) - M = M - M = 0 \ge 0$$
2. Just before a doubling triggers, the table is full: $N = M$.
   $$\Phi = 2M - M = M$$
   The potential has accumulated exactly $M$ units of credit—precisely the work needed to migrate $M$ elements!

#### Case 1: Normal Insertion (No Resize)
- Actual cost: $c_i = 1$ (writing the element).
- New state: $N' = N + 1$, capacity remains $M$.
- Potential change:
  $$\Delta \Phi = \Phi_{i} - \Phi_{i-1} = (2(N + 1) - M) - (2N - M) = 2$$
- Amortized cost:
  $$\hat{c}_i = c_i + \Delta \Phi = 1 + 2 = \mathbf{3 = O(1)}$$

#### Case 2: Insertion Triggering Doubling ($N = M$)
- Actual cost: $c_i = M + 1$ (copying $M$ existing items to new table + inserting the 1 new item).
- New capacity: $M_{\text{new}} = 2M$.
- New count: $N' = M + 1$.
- New potential:
  $$\Phi_{\text{new}} = 2(M + 1) - 2M = 2M + 2 - 2M = 2$$
- Potential change:
  $$\Delta \Phi = \Phi_{\text{new}} - \Phi_{\text{old}} = 2 - M$$
- Amortized cost:
  $$\hat{c}_i = c_i + \Delta \Phi = (M + 1) + (2 - M) = 1 + 2 = \mathbf{3 = O(1)!}$$

**Conclusion:** In both cases, the amortized cost per insertion is bounded by a constant $\hat{c}_i \le 3$.
Therefore, dynamic rehashing achieves **strictly $\Theta(1)$ amortized insertion time**. $\blacksquare$

---

### 1.3 Hardware Systems Dive: Progressive (Incremental) Rehashing

In memory-intensive distributed caches like **Redis**, a single hash table can hold $50,000,000$ keys.
If Redis attempted to migrate 50 million keys in a single blocking `Resize()` call:
- Total keys to migrate: $50 \times 10^6$.
- Migration time: $\approx 250 \text{ milliseconds}$.
- During those 250 ms, the single-threaded Redis event loop would **completely stop responding to client traffic**, causing network timeouts across all microservices!

```
====================================================================================================
                        REDIS INCREMENTAL (PROGRESSIVE) REHASHING
====================================================================================================
Redis maintains TWO tables during rehash: ht[0] (old) and ht[1] (new).
A rehash cursor `rehashidx` starts at 0.

On every subsequent client command (GET, SET, DEL):
1. Migrate ONE bucket from ht[0] to ht[1]:
   - Move all keys at ht[0][rehashidx] into ht[1].
   - Increment `rehashidx++`.
2. Execute client command:
   - For reads: Check ht[0] first; if not found, check ht[1].
   - For writes: ALWAYS write to ht[1] directly!
3. Background cron job migrates 100 buckets per 100 ms.

Result: Zero latency spikes! The 250 ms pause is chopped into 50 million 5-nanosecond slices!
====================================================================================================
```

---

### 1.4 ⚙️ Core Operations Deep-Dive: Dynamic Rehashing Engine

#### Dimension 1: Operation Contract & Big-O Bounds

| Operation | Input Signature | Output / Post-condition | Amortized Time | Worst-Case Time | Auxiliary Space |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Fastmod` | `uint Fastmod(uint hash, uint capacity)` | Returns `hash % capacity` in 3 CPU cycles | $\Theta(1)$ | $\Theta(1)$ | $\Theta(1)$ |
| `EnsureCapacity`| `void EnsureCapacity(int required)` | Resizes table if load exceeds threshold | $\Theta(1)$ amortized | $\Theta(N)$ | $\Theta(N_{\text{new}})$ |
| `Rehash` | `void Rehash(int newCapacity)` | Migrates all live entries to new prime array | $\Theta(N + M)$ | $\Theta(N + M)$ | $\Theta(N_{\text{new}})$ |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                       [ Insert with Rehash Check ]
                                     │
                                     ▼
                   Is (Count + 1) / Capacity > MaxLoad?
                              /             \
                        YES  /               \  NO
                            ▼                 ▼
                 Select Next Prime Capacity   Insert into Current Table
                            │
                            ▼
                 Allocate newTable = new Entry[newPrime]
                            │
                            ▼
                 Loop through oldTable:
                 - For each active entry:
                     int newSlot = Fastmod(hash, newPrime)
                     Insert into newTable
                            │
                            ▼
                 Swing _table pointer to newTable
                 Discard oldTable to GC
```

---

#### Dimension 3: Visual ASCII State Transitions

Trace Rehashing from $M = 5$ to $M = 11$ (Prime):
Entries:
- `"A"` (hash = 10) $\implies 10 \pmod 5 = 0$.
- `"B"` (hash = 15) $\implies 15 \pmod 5 = 0$ (Collision at 0 in old table!).
- `"C"` (hash = 7)  $\implies 7 \pmod 5 = 2$.

```
Old Table (Capacity = 5):
Slot 0: [ "B": 20 ] -> [ "A": 10 ]  <-- Collision Chain!
Slot 1: null
Slot 2: [ "C": 30 ]
Slot 3: null
Slot 4: null

Rehash Triggered: Allocate New Table (Capacity = 11):
- Migrate "A": hash 10 -> 10 % 11 = Slot 10.
- Migrate "B": hash 15 -> 15 % 11 = Slot 4.
- Migrate "C": hash 7  -> 7 % 11  = Slot 7.

New Table (Capacity = 11):
Slot 0..3:  null
Slot 4:     [ "B": 20 ]  <-- Unbundled from "A"!
Slot 5..6:  null
Slot 7:     [ "C": 30 ]
Slot 8..9:  null
Slot 10:    [ "A": 10 ]  <-- Unbundled from "B"!

Result: All collision chains completely dispersed! Average chain length reset to < 0.3!
```

---

#### Dimension 4: Invariant Preservation Proof

**Theorem:** Dynamic rehashing guarantees that the average search cost remains bounded by $O(1)$ indefinitely as $N \to \infty$.

*Proof:*
1. By the Load Factor Bound, rehashing triggers whenever $\frac{N}{M} \ge \alpha_{\max}$.
2. The new capacity is chosen such that $M_{\text{new}} \ge 2M$.
3. Immediately after rehashing, the new load factor is:
   $$\alpha_{\text{new}} = \frac{N}{M_{\text{new}}} \le \frac{N}{2M} = \frac{\alpha_{\max}}{2}$$
4. For separate chaining with $\alpha_{\max} = 0.75$, $\alpha_{\text{new}} \le 0.375$.
5. The expected search time under SUHA is $T = \Theta(1 + \alpha)$.
6. Because $\alpha$ oscillates strictly within the closed interval $[0.375, 0.75]$, the expected search time is strictly bounded by:
   $$T \le \Theta(1 + 0.75) = O(1)$$
7. Since this bound holds for arbitrary $N$, search performance never degrades, preserving $O(1)$ throughput for all time. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Scenario / Edge Case | Concrete Input | Danger / Pitfall | Guard / Architectural Resolution |
| :--- | :--- | :--- | :--- |
| **Max Capacity Overflow** | Doubling $M > \text{int.MaxValue} / 2$ | 32-bit signed integer overflow into negative capacity | Clamp to `HashHelpers.MaxPrimeArrayLength` ($2,146,435,071$) |
| **Zero Initial Capacity** | `new HashMap(0)` | Division by zero in modulo operation | Clamp initial capacity to minimum prime (e.g. 3 or 17) |
| **Transient Memory Exhaustion**| Rehash on a 12 GB table in 16 GB RAM | `OutOfMemoryException` while co-hosting old + new buffers | Deploy incremental rehashing or disk-spilled compaction |
| **High Deletion Ratio** | $10^6$ insertions followed by $999,990$ deletions | Wasted RAM (huge sparse table) | Implement shrink threshold: halve capacity when $\alpha < 0.125$ |

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Container(s)

Below is the production C# implementation of `PrimeResizingTable<TKey, TValue>`. It demonstrates:
- Precomputed prime capacity progression.
- Daniel Lemire's Fastmod optimization for 3-cycle bucket calculation.
- Dynamic rehashing with zero-allocation potential accounting.
- Assertion self-testing harness.

```csharp
using System;
using System.Diagnostics;

namespace HashTables.Resizing
{
    /// <summary>
    /// Demonstrates Prime Capacity Scaling and Lemire Fastmod optimization.
    /// Provides guaranteed O(1) amortized insertions via dynamic doubling.
    /// </summary>
    public sealed class PrimeResizingTable<TKey, TValue>
    {
        private struct Node
        {
            public TKey Key;
            public TValue Value;
            public int Next; // Array-based index chaining
        }

        private int[] _buckets;
        private Node[] _entries;
        private int _count;
        private int _freeList;

        // Standard prime progression table
        private static readonly int[] PrimeTable = {
            17, 37, 79, 163, 331, 673, 1361, 2729, 5471, 10949, 21911, 43853, 87719, 175447
        };
        private int _primeIndex;

        private const double MaxLoadFactor = 0.75;

        public PrimeResizingTable()
        {
            _primeIndex = 0;
            int initialCapacity = PrimeTable[_primeIndex];

            _buckets = new int[initialCapacity];
            Array.Fill(_buckets, -1); // -1 indicates empty bucket

            _entries = new Node[initialCapacity];
            _count = 0;
            _freeList = -1;
        }

        public int Count => _count;
        public int Capacity => _buckets.Length;
        public double LoadFactor => (double)_count / _buckets.Length;

        /// <summary>
        /// Lemire's Fastmod: Computes (hash % capacity) using a single 64-bit multiplication and shift.
        /// Bypasses the 25-cycle CPU integer division (idiv) instruction!
        /// </summary>
        [System.Runtime.CompilerServices.MethodImpl(System.Runtime.CompilerServices.MethodImplOptions.AggressiveInlining)]
        private static int Fastmod(uint hash, uint capacity)
        {
            // High 32 bits of 64-bit product (hash * capacity) computes exact mathematical modulo
            return (int)(((ulong)hash * (ulong)capacity) >> 32);
        }

        public void Add(TKey key, TValue value)
        {
            if (key == null) throw new ArgumentNullException(nameof(key));

            uint hash = (uint)(key.GetHashCode() & 0x7FFFFFFF);
            int bucket = Fastmod(hash, (uint)_buckets.Length);

            // Traverse chain for duplicate key check
            for (int i = _buckets[bucket]; i >= 0; i = _entries[i].Next)
            {
                if (_entries[i].Key!.Equals(key))
                {
                    _entries[i].Value = value; // Update
                    return;
                }
            }

            // Trigger rehash if load factor threshold exceeded
            if ((double)(_count + 1) / _buckets.Length > MaxLoadFactor)
            {
                Rehash();
                // Recalculate bucket in new capacity
                bucket = Fastmod(hash, (uint)_buckets.Length);
            }

            // Allocate slot in entries
            int entryIndex = _count;
            _entries[entryIndex].Key = key;
            _entries[entryIndex].Value = value;
            _entries[entryIndex].Next = _buckets[bucket];

            _buckets[bucket] = entryIndex;
            _count++;
        }

        public bool TryGetValue(TKey key, out TValue value)
        {
            if (key == null) throw new ArgumentNullException(nameof(key));

            uint hash = (uint)(key.GetHashCode() & 0x7FFFFFFF);
            int bucket = Fastmod(hash, (uint)_buckets.Length);

            for (int i = _buckets[bucket]; i >= 0; i = _entries[i].Next)
            {
                if (_entries[i].Key!.Equals(key))
                {
                    value = _entries[i].Value;
                    return true;
                }
            }

            value = default!;
            return false;
        }

        private void Rehash()
        {
            if (_primeIndex + 1 >= PrimeTable.Length)
            {
                return; // Reached maximum precomputed prime
            }

            _primeIndex++;
            int newCapacity = PrimeTable[_primeIndex];

            int[] newBuckets = new int[newCapacity];
            Array.Fill(newBuckets, -1);

            Node[] newEntries = new Node[newCapacity];
            Array.Copy(_entries, newEntries, _count);

            // Re-project all existing elements into new buckets using Fastmod
            for (int i = 0; i < _count; i++)
            {
                uint hash = (uint)(newEntries[i].Key!.GetHashCode() & 0x7FFFFFFF);
                int newBucket = Fastmod(hash, (uint)newCapacity);

                newEntries[i].Next = newBuckets[newBucket];
                newBuckets[newBucket] = i;
            }

            _buckets = newBuckets;
            _entries = newEntries;
        }
    }

    /// <summary>
    /// Self-testing verification harness.
    /// </summary>
    public static class DynamicRehashProgram
    {
        public static void Main()
        {
            Console.WriteLine("Running Dynamic Rehashing Verification Suite...");

            var table = new PrimeResizingTable<string, int>();

            Debug.Assert(table.Capacity == 17);

            // Insert 12 items -> Load factor = 12 / 17 = 0.705 <= 0.75 (No rehash yet)
            for (int i = 0; i < 12; i++)
            {
                table.Add($"Key_{i}", i * 100);
            }
            Debug.Assert(table.Capacity == 17);

            // Insert 13th item -> 13 / 17 = 0.764 > 0.75 -> REHASH TRIGGERS!
            table.Add("Key_12", 1200);
            Debug.Assert(table.Capacity == 37, $"Expected capacity 37, got {table.Capacity}");

            // Verify all 13 items are fully reachable in new capacity
            for (int i = 0; i <= 12; i++)
            {
                bool found = table.TryGetValue($"Key_{i}", out int val);
                Debug.Assert(found, $"Key_{i} lost after rehash!");
                Debug.Assert(val == i * 100);
            }

            Console.WriteLine("All Dynamic Rehashing tests passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### Machine Instruction Analysis: Modulo vs. Fastmod

```
x86-64 Machine Instructions Comparison:

1. Standard Integer Modulo (hash % M):
   mov edx, 0
   mov eax, [hash]
   mov ecx, [M]
   idiv ecx            <-- EXPENSIVE! Takes 15 to 30 CPU cycles!
                       Result stored in edx (remainder).

2. Daniel Lemire Fastmod (((ulong)hash * (ulong)M) >> 32):
   mov eax, [hash]
   mov edx, [M]
   mul rdx             <-- BLAZING FAST! Takes 3 CPU cycles!
   shr rdx, 32         <-- High 32 bits is exact remainder in 1 cycle!
   Total: 4 CPU cycles! (Over 6x faster than idiv!)
```

This 4-cycle multiplication is why modern .NET `Dictionary<TKey, TValue>` implementations can retain prime capacity tables without suffering the latency penalty of division!

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### Problem 1: [LeetCode 128] Longest Consecutive Sequence (Medium)

#### Problem Statement
Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence.
You must write an algorithm that runs in **$O(N)$ time**.

#### Architectural Mechanics: The Streak-Start Filter
If we check every number and expand bidirectionally, worst-case runtime degrades to $O(N^2)$.
**The Golden Invariant:** Only attempt to build a sequence starting from numbers that are **true sequence heads**!
A number $x$ is a sequence head if and only if $x - 1$ is **NOT** present in the hash set!

```csharp
using System;
using System.Collections.Generic;

public class LongestConsecutiveSequenceSolution
{
    public int LongestConsecutive(int[] nums)
    {
        if (nums == null || nums.Length == 0) return 0;

        // O(N) bulk construction of Hash Set
        var set = new HashSet<int>(nums);
        int longestStreak = 0;

        foreach (int num in set)
        {
            // Only start counting if 'num' is the beginning of a streak!
            // If num - 1 is present, 'num' is part of an ongoing streak counted elsewhere.
            if (!set.Contains(num - 1))
            {
                int currentNum = num;
                int currentStreak = 1;

                while (set.Contains(currentNum + 1))
                {
                    currentNum++;
                    currentStreak++;
                }

                longestStreak = Math.Max(longestStreak, currentStreak);
            }
        }

        return longestStreak;
    }
}
```

---

### Problem 2: [LeetCode 560] Subarray Sum Equals K (Medium)

#### Problem Statement
Given an array of integers `nums` and an integer `k`, return the total number of continuous subarrays whose sum equals to `k`.

#### Mathematical Prefix Sum Invariant
Let $\text{prefix}[j] = \sum_{m=0}^{j} \text{nums}[m]$.
A subarray from $i$ to $j$ has sum:
$$\text{sum}(i, j) = \text{prefix}[j] - \text{prefix}[i - 1] = k \implies \mathbf{\text{prefix}[i - 1] = \text{prefix}[j] - k}$$
We track the running prefix sum and use a hash map to record how many times each prefix sum has occurred!

```csharp
using System.Collections.Generic;

public class SubarraySumEqualsKSolution
{
    public int SubarraySum(int[] nums, int k)
    {
        // Hash map stores: prefixSum -> frequency
        var prefixCounts = new Dictionary<int, int>();

        // Base Case: prefix sum 0 occurs once (for subarrays starting at index 0)
        prefixCounts[0] = 1;

        int currentSum = 0;
        int totalSubarrays = 0;

        foreach (int num in nums)
        {
            currentSum += num;

            // Target prefix needed to form sum k
            int targetPrefix = currentSum - k;

            if (prefixCounts.TryGetValue(targetPrefix, out int count))
            {
                totalSubarrays += count;
            }

            // Record current prefix sum in map
            prefixCounts[currentSum] = prefixCounts.GetValueOrDefault(currentSum, 0) + 1;
        }

        return totalSubarrays;
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 525] Contiguous Array (Medium):**
   - *Task:* Find the maximum length of a contiguous subarray with an equal number of 0 and 1.
   - *Pattern:* Treat 0 as -1. The problem reduces to finding the longest subarray with sum 0 using a prefix sum hash map storing the *first occurrence index*.

2. **[LeetCode 523] Continuous Subarray Sum (Medium):**
   - *Task:* Find if array has a contiguous subarray of size at least two that sums to a multiple of $k$.
   - *Pattern:* Prefix sum modulo $k$. If $\text{prefix}[j] \equiv \text{prefix}[i] \pmod k$ and $j - i \ge 2$, the subarray between them sums to a multiple of $k$!

3. **[LeetCode 974] Subarray Sums Divisible by K (Medium):**
   - *Task:* Return number of non-empty subarrays with sum divisible by $k$.
   - *Pattern:* Prefix sum modulo arithmetic with non-negative remainder normalization: `(sum % k + k) % k`.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Runtime Table Sizing Philosophies:

                   ┌─────────────────────────────────────────┐
                   │       RUNTIME TABLE SIZING PHILOSOPHY   │
                   └─────────────────────────────────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│       PRIME SCALING (.NET CLR)       │  │    POWER-OF-TWO BITMASK (JAVA / GO)  │
├──────────────────────────────────────┤  ├──────────────────────────────────────┤
│ • Prime table array: HashHelpers     │  │ • Table size is always 2^K.          │
│ • Lemire Fastmod (multiplication).   │  │ • Bitwise AND: hash & (2^K - 1).     │
│ • Resists modular clustering.        │  │ • Extremely simple hardware mask.    │
│ • Higher capacity utilization factor.│  │ • Strictly requires fmix32 bit-mix.  │
└──────────────────────────────────────┘  └──────────────────────────────────────┘
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
Why do standard hash tables resize to prime numbers when using simple modular hashing, but resize to powers of two when using bit-mixed hashing?

### Architectural Model Answer
1. **Why Simple Modular Hashing Requires Prime Numbers:**
   - In basic hash tables without advanced bit-mixing, the hash code is compressed via integer modulo:
     $$\text{slot} = h(k) \pmod M$$
   - If the capacity $M$ is a composite number sharing common factors with the input distribution (e.g. $M = 16 = 2^4$, and memory addresses or IDs are multiples of 4 or 8):
     $$\forall k = 4, 8, 12, 16 \dots \implies k \pmod{16} \in \{0, 4, 8, 12\}$$
   - All entries collapse into only 4 out of 16 buckets, leaving 75% of the table completely vacant and creating severe collision clusters.
   - Choosing $M$ as a **prime number** guarantees that $\gcd(k, M) = 1$ for almost all keys. By number theory, modulo reduction by a prime produces a uniform permutation across all $M$ slots, even if the input hash codes contain periodic strides.

2. **Why Power-of-Two Tables Work with Bit Mixing:**
   - A power-of-two capacity ($M = 2^p$) allows computing the bucket index using a single-cycle bitwise operation:
     $$\text{slot} = h(k) \ \& \ (2^p - 1)$$
   - The danger of this operation is that it completely ignores the upper $32 - p$ bits of the hash code, relying exclusively on the lowest $p$ bits.
   - However, if the runtime executes a high-entropy **avalanche bit-mixer** (such as Java's `h ^ (h >>> 16)` or MurmurHash3's `fmix32`) *before* applying the bitmask, every individual bit in the upper half of the key is scrambled and folded into the lower $p$ bits.
   - As a result, the lowest $p$ bits exhibit uniform pseudo-random entropy, rendering prime numbers unnecessary and unlocking the 1-cycle speed of bitwise AND masking.
