---
title: "Week 18 — Day 123: Quadratic Probing, Double Hashing & Secondary Clustering Mitigation"
---

# Week 18 — Day 123: Quadratic Probing, Double Hashing & Secondary Clustering Mitigation

Welcome to **Day 123 of your DSA Mastery Journey**!

Yesterday, on Day 122, you explored open addressing with Linear Probing and discovered its fatal flaw: **Primary Clustering**. Contiguous blocks of occupied slots merge into giant traffic jams, causing search times to degrade quadratically toward infinity as $\alpha \to 1$.

Today, we conquer primary clustering by introducing **Quadratic Probing** and the gold standard of open addressing: **Double Hashing**.

You will learn:
1. **Quadratic Probing Mechanics:** How non-linear strides ($h(k) + i^2$) break up contiguous clusters.
2. **The Full Cycle Coverage Theorems:** Why quadratic probing can get stuck in cycles unless mathematical constraints on $M$ and constants $c_1, c_2$ are strictly enforced.
3. **Double Hashing:** How using a secondary hash function $h_2(k)$ as a key-dependent step size eliminates both primary AND secondary clustering.
4. **The Coprimality Mandate:** The mathematical proof that $\gcd(h_2(k), M) = 1$ is required to guarantee full table traversal.
5. **From-Scratch Container:** Building `DoubleHashingHashMap<K, V>` in C# with twin hash functions and prime capacity scaling.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               DAY 123: CLUSTERING MITIGATION PARADIGMS                            │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│         QUADRATIC PROBING         │                             │           DOUBLE HASHING          │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Formula:                        │                             │ • Formula:                        │
│   idx = (h(k) + c1*i + c2*i^2) % M│                             │   idx = (h1(k) + i * h2(k)) % M   │
│ • Eliminates Primary Clustering!  │                             │ • Step size h2(k) DEPENDS ON KEY! │
│ • Secondary Clustering remains:   │                             │ • Eliminates BOTH Primary AND     │
│   Keys with same h(k) follow the  │                             │   Secondary Clustering!           │
│   EXACT same probe path.          │                             │ • Ideal Uniform Permutation:      │
│ • Cycle Hazard: Might not visit   │                             │   M^2 distinct probe sequences!   │
│   all slots unless M is prime.    │                             │ • Coprimality Mandate: gcd(h2,M)=1│
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         PROBING BEHAVIOR COMPARISON         │
                          ├─────────────────────────────────────────────┤
                          │ • Linear:   Step = 1, 1, 1, 1, 1, 1...      │
                          │ • Quadratic:Step = 1, 4, 9, 16, 25...       │
                          │ • Double:   Step = h2(k), 2*h2(k)...        │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🦘 The Visual Mental Model: The Accelerating Kangaroo & The Personalized Stride

Before analyzing quadratic congruences and coprimality proofs, picture how people escape from a crowded room:

```
              🦘 LINEAR VS QUADRATIC VS DOUBLE HASHING INTUITION

   1. LINEAR PROBING: THE BUMPER-TO-BUMPER TRAFFIC JAM
      • When you hit an occupied stall: Take 1 step (+1, +1, +1...).
      • Problem: Everyone walks in the exact same single-file line!
      • The traffic jam gets wider and wider (PRIMARY CLUSTERING)!

   2. QUADRATIC PROBING: THE ACCELERATING KANGAROO
      • On 1st collision: Jump +1 stall.
      • On 2nd collision: Jump +4 stalls (+2^2).
      • On 3rd collision: Jump +9 stalls (+3^2).
      • On 4th collision: Jump +16 stalls (+4^2)!
      • You leap completely over the local neighborhood and escape the jam!
      • WEAKNESS (Secondary Clustering): All keys that start at Slot 2 trace the EXACT
        SAME sequence of hops (+1, +4, +9...). They follow each other like ducklings!

   3. DOUBLE HASHING: THE PERSONALIZED STRIDE LENGTH
      • Every key is given a CUSTOM STRIDE LENGTH based on a second hash function h2(key)!
      • Key A starts at Slot 2 with a stride of +3 ──► Probes: 2, 5, 8, 11...
      • Key B starts at Slot 2 with a stride of +5 ──► Probes: 2, 7, 12, 4...
      • Even though they collide at Slot 2, their paths IMMEDIATELY DIVERGE!
      • Secondary clustering is 100% ELIMINATED!
```

---

### 1.2 🖼️ Visual Gallery: Probe Trajectory Comparison & The Coprimality Trap

#### 1. Probing Trajectory Comparison from Collision at Slot 2:

```
   Linear (+1):          [ 2 ] ──► [ 3 ] ──► [ 4 ] ──► [ 5 ] ──► [ 6 ]  (Heavy clumping!)

   Quadratic (+i^2):     [ 2 ] ──► [ 3 ] ──────► [ 6 ] ────────────► [ 11 ] (Spreads out!)

   Double (Stride h2):   Key A (h2=3): [ 2 ] ────► [ 5 ] ────► [ 8 ] ────► [ 11 ]
                         Key B (h2=5): [ 2 ] ──────► [ 7 ] ──────► [ 12 ] ──► [ 4 ]
                         (Completely independent search paths!)
```

#### 2. ⚠️ The Coprimality Trap: Why Table Size MUST Be Prime!
What happens if Table Capacity $M = 6$ and $h_2(k) = 2$?

```
   Start at Slot 0 with Step Size = 2:
   • Probe 0: 0
   • Probe 1: (0 + 2) % 6 = 2
   • Probe 2: (2 + 2) % 6 = 4
   • Probe 3: (4 + 2) % 6 = 0  <── BACK TO START!
   
   Loop: [ 0, 2, 4, 0, 2, 4, 0, 2, 4... ]
   💥 Slots 1, 3, and 5 are NEVER VISITED! The insert loops forever even when half the table is empty!
   
   ✅ THE FIX: gcd(h2(k), M) == 1 (Coprimality).
   If M is a PRIME NUMBER (e.g. 7), ANY step size from 1 to 6 is guaranteed to visit
   EVERY SINGLE SLOT in the table before repeating!
```

---

### 1.3 🏛️ Memory Layout: Flat Table Array with Prime Capacity

```
   State Tracking in RAM (Entry<K, V>[] table, Capacity = 11 [Prime]):
   
   Index:     [ 0 ]    [ 1 ]    [ 2 ]    [ 3 ]    ...    [ 9 ]    [ 10 ]
   Key:       ["Bob"]  ["Dan"]  ["Ann"]  [ -- ]          [ -- ]   ["Eve"]
   State:     [OCC ]   [OCC ]   [OCC ]   [EMPTY]         [EMPTY]  [OCC ]
   
   • Double Hashing:
     h1("Sam") = 2  (Occupied by "Ann"!)
     h2("Sam") = 4  (Stride)
     Next slot = (2 + 4) % 11 = 6  (Empty! Insert succeeds in 1 probe!)
   • Prime capacity guarantees all 11 slots are reachable with zero infinite loops!
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* **Quadratic Probing** advances the probe sequence using a quadratic polynomial of the probe count $i$:
    $$h(k, i) = (h(k) + c_1 i + c_2 i^2) \pmod M$$
  - **Double Hashing** computes both the initial slot and the probe step size from the key itself using two independent hash functions $h_1(k)$ and $h_2(k)$:
    $$h(k, i) = (h_1(k) + i \cdot h_2(k)) \pmod M$$
  - *Core Invariants:*
    1. **Non-Zero Step Invariant:** $h_2(k) \not\equiv 0 \pmod M$. (A step size of zero causes infinite loops on the initial bucket).
    2. **Coprimality Invariant:** $\gcd(h_2(k), M) = 1$. (Ensures the probe sequence generates a full permutation of all $M$ slots).
  - *Misconception Check:*
    - *Misconception 1:* "Quadratic probing can always find an empty slot if the table is not full." **False!** If $M$ is arbitrary, quadratic probing can loop through a tiny cycle of slots indefinitely, failing to find an empty slot even when $90\%$ of the table is empty! It requires specific mathematical preconditions.
    - *Misconception 2:* "Double hashing has the same cache locality as linear probing." **False!** Because $h_2(k)$ is pseudorandom and can be any value in $[1, M-1]$, consecutive probes jump across distinct cache lines, incurring slightly more L1 cache misses than linear probing. However, it compensates by supporting higher load factors ($\alpha \le 0.70$) without clustering.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Primary Clustering Solved:* Fixed stride $+1$ in linear probing causes adjacent clusters to merge. Quadratic probing expands distance quadratically ($+1, +4, +9, +16$), jumping completely out of local clusters.
  - *Secondary Clustering Solved:* In quadratic probing, two keys with $h(k_1) = h(k_2)$ follow the exact same probe sequence. In double hashing, even if $h_1(k_1) = h_1(k_2)$, their second hash codes $h_2(k_1) \ne h_2(k_2)$ produce completely divergent search trajectories.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Open-addressing systems requiring higher load factors ($\alpha \approx 0.65 - 0.70$) where linear probing breaks down.
    - Large tables where primary clustering creates unacceptable worst-case latency spikes.
  - *When to Avoid / Failure Modes:*
    - If the table size $M$ cannot be maintained as a prime number: non-prime capacities risk gcd collisions, violating the coprimality invariant.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Hardware Memory Layout:* Double hashing stores all data in a single flat contiguous array `Entry[]`, preserving the zero-pointer overhead and GC benefits of open addressing.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "Linear probing suffers from primary clustering because all colliding keys step by $+1$. Quadratic probing mitigates this by stepping by $i^2$, breaking local clusters. However, quadratic probing still suffers from secondary clustering because identical initial hashes trace identical paths. Double hashing solves both problems by computing a key-dependent step size $h_2(k)$, producing $M^2$ distinct probe sequences. As long as $h_2(k)$ is coprime to table capacity $M$, double hashing closely models ideal uniform hashing."
- **6. HOW (Operations, Implementation & State Trace):**
  - *Complexity Profile:* Search: Expected $\Theta(1)$, Worst $\Theta(M)$; Insert: Expected $\Theta(1)$, Worst $\Theta(M)$; Delete: Expected $\Theta(1)$, Worst $\Theta(M)$; Max Load Factor: $\alpha_{\max} = 0.70$.

---

### 1.5 Quadratic Probing & The Cycle Coverage Theorems

Why does quadratic probing risk infinite loops?
Consider a table of size $M = 6$.
Let $h(k) = 0$ and probe formula be $h(k, i) = (0 + i^2) \pmod 6$:
- $i=0: 0^2 \pmod 6 = 0$
- $i=1: 1^2 \pmod 6 = 1$
- $i=2: 2^2 \pmod 6 = 4$
- $i=3: 3^2 \pmod 6 = 3$
- $i=4: 4^2 \pmod 6 = 16 \equiv 4$ (Repeated!)
- $i=5: 5^2 \pmod 6 = 25 \equiv 1$ (Repeated!)

Notice that indices **2 and 5 are NEVER visited**! If slots 0, 1, 3, and 4 are occupied, an insertion will loop between 0, 1, 4, and 3 forever, even though slots 2 and 5 are completely empty!

#### The Full Coverage Theorems
To guarantee that quadratic probing visits sufficient slots to find an open slot:
1. **Theorem 1 (Prime Table with $\alpha \le 0.5$):**
   If $M$ is a prime number and $c_1 = 0, c_2 = 1$ ($h(k, i) = h(k) + i^2 \pmod M$), the probe sequence visits at least:
   $$\left\lceil \frac{M}{2} \right\rceil \text{ distinct slots}$$
   Therefore, as long as the table is at most half full ($\alpha \le 0.5$), an insertion is **mathematically guaranteed to find an empty slot**!
2. **Theorem 2 (Power-of-Two Table with Triangular Numbers):**
   If $M = 2^k$ is a power of two, and we use the triangular formula:
   $$h(k, i) = \left( h(k) + \frac{i^2 + i}{2} \right) \pmod M$$
   The probe sequence visits **ALL $M$ distinct slots** without a single repeat!

---

### 1.2 Double Hashing: The Gold Standard of Open Addressing

Double hashing eliminates both primary and secondary clustering by generating a unique probe sequence for each key:

$$h(k, i) = (h_1(k) + i \cdot h_2(k)) \pmod M$$

```
Comparison of Probe Permutations:
• Linear Probing:    Only M distinct probe sequences (determined entirely by h(k)).
• Quadratic Probing: Only M distinct probe sequences (determined entirely by h(k)).
• Double Hashing:    M * (M - 1) ≈ M^2 distinct probe sequences!
                     (Every pair of (h1, h2) yields a completely different path!)
```

```
====================================================================================================
                        DOUBLE HASHING PERMUTATION DIVERGENCE
====================================================================================================
Scenario: Key "X" and Key "Y" collide at initial bucket: h1("X") = 3, h1("Y") = 3.

In Linear Probing:
• "X" probes: 3, 4, 5, 6, 7 ...
• "Y" probes: 3, 4, 5, 6, 7 ...  <-- EXACT SAME PATH! Secondary clustering!

In Double Hashing:
Suppose h2("X") = 2, and h2("Y") = 5 (Table size M = 11):
• "X" probes: 3, 5, 7, 9, 0, 2 ... (Steps of +2)
• "Y" probes: 3, 8, 2, 7, 1, 6 ... (Steps of +5)

Result: The two keys immediately diverge onto completely distinct paths across the table!
====================================================================================================
```

---

### 1.3 The Coprimality Mandate: Why $\gcd(h_2(k), M) = 1$

What happens if $h_2(k)$ and $M$ share a common divisor $d > 1$?
The probe sequence forms a cyclic subgroup of order $M / d$.
For example, if $M = 12$ and $h_2(k) = 4$:
$$i \cdot 4 \pmod{12} \in \{ 0, 4, 8 \}$$
The probe sequence only inspects **3 slots out of 12**! It will loop endlessly after 3 steps.

#### How Production Systems Guarantee Coprimality:
1. **Approach A (Prime Capacity $M$):**
   - Choose table capacity $M$ as a **prime number**.
   - Design $h_2(k)$ to return an integer in the range $[1, M - 1]$:
     $$h_2(k) = 1 + (h(k) \pmod{M - 1})$$
   - Since $M$ is prime, every integer $1 \le h_2(k) < M$ is strictly coprime to $M$:
     $$\gcd(h_2(k), M) = 1 \quad \text{guaranteed!}$$
2. **Approach B (Power-of-Two Capacity $M = 2^k$):**
   - Ensure $h_2(k)$ is always an **odd number**:
     $$h_2(k) = (2 \cdot h(k) + 1) \pmod M$$
   - Since $M = 2^k$ and $h_2(k)$ is odd, $\gcd(\text{odd}, 2^k) = 1$ is guaranteed!

---

### 1.4 ⚙️ Core Operations Deep-Dive: Double Hashing

#### Dimension 1: Operation Contract & Big-O Bounds

| Operation | Input Signature | Output / Post-condition | Expected ($\alpha \le 0.7$) | Worst Case | Auxiliary Space |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Get` | `bool TryGetValue(K key, out V val)` | Returns value; stops at `Empty` | $\Theta(1)$ | $\Theta(M)$ | $\Theta(1)$ |
| `Put` | `void Add(K key, V val)` | Reclaims first tombstone; stops duplicate | $\Theta(1)$ | $\Theta(M)$ | $\Theta(1)$ |
| `Remove` | `bool Remove(K key)` | Marks slot as `Deleted` (tombstone) | $\Theta(1)$ | $\Theta(M)$ | $\Theta(1)$ |
| `Rehash` | `void Rehash(int newCapacity)` | Resizes table to new prime capacity | $\Theta(N + M)$ | $\Theta(N + M)$ | $\Theta(M_{\text{new}})$ |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                       [ Double Hashing Probe Loop ]
                                     │
                                     ▼
                      int h1 = (Hash(key) & 0x7FFFFFFF) % M
                      int h2 = 1 + ((Hash(key) / M) % (M - 1))
                      If h2 <= 0: h2 += (M - 1)  <-- Guarantee h2 in [1, M-1]
                                     │
                                     ▼
                     Loop probe = 0 to M - 1:
                     slot = (h1 + probe * h2) % M
                                     │
                                     ▼
                          Inspect table[slot].State
                          /          │          \
                   OCCUPIED       DELETED        EMPTY
                     │               │             │
                     ▼               ▼             ▼
              Key matches?       Record first   Search terminates.
              - YES: Update      tombstone.     Insert into first
              - NO: Continue     Continue.      tombstone or empty slot!
```

---

#### Dimension 3: Visual ASCII State Transitions

Trace $M = 7$ (Prime).
Let Key $A$ have $h_1 = 2, h_2 = 3$.
Let Key $B$ have $h_1 = 2, h_2 = 2$ (Initial collision with $A$!).

```
1. Insert A:
   - Probe 0: slot = (2 + 0 * 3) % 7 = 2.
   - Slot 2 is Empty -> Store A at Slot 2.

2. Insert B:
   - Probe 0: slot = (2 + 0 * 2) % 7 = 2.
     Slot 2 is Occupied by A! Collision!
   - Probe 1: slot = (2 + 1 * 2) % 7 = 4.
     Slot 4 is Empty -> Store B at Slot 4!

3. Insert C (h1 = 2, h2 = 3): Collides with A at 2!
   - Probe 0: slot = 2 (Occupied by A).
   - Probe 1: slot = (2 + 1 * 3) % 7 = 5.
     Slot 5 is Empty -> Store C at Slot 5!

Notice: Keys B and C both collided at Slot 2, but B probed to 4 while C probed to 5!
Secondary clustering completely eliminated!
```

---

#### Dimension 4: Invariant Preservation Proof

**Theorem (Full Permutation Property):** If $M$ is prime and $1 \le h_2(k) < M$, the sequence $S = \{ (h_1(k) + i \cdot h_2(k)) \pmod M \mid 0 \le i < M \}$ visits all $M$ distinct integers in $[0, M-1]$.

*Proof by Contradiction:*
1. Suppose the sequence does not visit all $M$ distinct integers.
2. By the Pigeonhole Principle, there must exist two distinct probe indices $i$ and $j$ ($0 \le i < j < M$) such that:
   $$(h_1(k) + i \cdot h_2(k)) \equiv (h_1(k) + j \cdot h_2(k)) \pmod M$$
3. Subtracting $h_1(k)$ from both sides:
   $$i \cdot h_2(k) \equiv j \cdot h_2(k) \pmod M$$
4. Rearranging:
   $$(j - i) \cdot h_2(k) \equiv 0 \pmod M \implies M \text{ divides } (j - i) \cdot h_2(k)$$
5. By Euclid's Lemma, if a prime $M$ divides a product $a \cdot b$, it must divide $a$ or divide $b$.
6. Here, $M$ must divide $(j - i)$ or $M$ must divide $h_2(k)$.
   - Case 1: $1 \le h_2(k) < M$. Therefore, $M$ cannot divide $h_2(k)$.
   - Case 2: $0 \le i < j < M \implies 1 \le j - i < M$. Therefore, $M$ cannot divide $(j - i)$.
7. Both cases lead to a contradiction!
8. Therefore, no two probe indices in $[0, M-1]$ can yield the same slot. The sequence generates a complete permutation of $[0, M-1]$. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Scenario / Edge Case | Concrete Input | Danger / Pitfall | Guard / Architectural Resolution |
| :--- | :--- | :--- | :--- |
| **Zero Secondary Step** | $h_2(k) \pmod M = 0$ | Infinite loop on initial bucket | Clamp or add offset: $h_2 = 1 + (h \pmod{M - 1})$ |
| **Non-Prime Capacity** | Rehash doubles to even number | Probe cycle covers only half the table | Always select next prime number from prime table during resize |
| **Negative Hash Code** | `key.GetHashCode()` is negative | Negative array index | Mask sign bit: `hash & 0x7FFFFFFF` |
| **High Load Factor ($\alpha > 0.7$)** | Table 75% full | Increased probe length | Rehash when `(count + dead) / capacity > 0.65` |

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Container(s)

Below is the production-grade C# implementation of `DoubleHashingHashMap<TKey, TValue>`. It includes:
- Prime capacity table generation.
- Dual hash calculation with coprimality enforcement.
- Tombstone recycling.
- Assertion verification harness.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace HashTables.DoubleHashing
{
    /// <summary>
    /// Production-grade Hash Map implementing Open Addressing with Double Hashing.
    /// Eliminates both primary and secondary clustering by computing key-dependent step sizes.
    /// Maintains strict prime capacity for coprimality guarantees.
    /// </summary>
    public sealed class DoubleHashingHashMap<TKey, TValue>
    {
        public enum SlotState : byte
        {
            Empty = 0,
            Occupied = 1,
            Deleted = 2
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

        // Primes table for safe dynamic resizing
        private static readonly int[] Primes = {
            17, 37, 79, 163, 331, 673, 1361, 2729, 5471, 10949, 21911, 43853, 87719, 175447
        };
        private int _primeIndex;

        private const double MaxLoadFactor = 0.65; // Safe threshold for double hashing

        public DoubleHashingHashMap(IEqualityComparer<TKey>? comparer = null)
        {
            _primeIndex = 0;
            _table = new Entry[Primes[_primeIndex]];
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

            int m = _table.Length;
            int rawHash = _comparer.GetHashCode(key) & 0x7FFFFFFF;

            int h1 = rawHash % m;
            int h2 = 1 + (rawHash % (m - 1)); // Invariant: h2 in [1, m - 1], coprime to prime m

            for (int i = 0; i < m; i++)
            {
                int slot = (int)(((long)h1 + (long)i * h2) % m);
                ref Entry entry = ref _table[slot];

                if (entry.State == SlotState.Empty)
                {
                    break; // Key absent
                }

                if (entry.State == SlotState.Occupied && _comparer.Equals(entry.Key, key))
                {
                    value = entry.Value;
                    return true;
                }
            }

            value = default!;
            return false;
        }

        public bool ContainsKey(TKey key) => TryGetValue(key, out _);

        public bool Remove(TKey key)
        {
            if (key == null) throw new ArgumentNullException(nameof(key));

            int m = _table.Length;
            int rawHash = _comparer.GetHashCode(key) & 0x7FFFFFFF;

            int h1 = rawHash % m;
            int h2 = 1 + (rawHash % (m - 1));

            for (int i = 0; i < m; i++)
            {
                int slot = (int)(((long)h1 + (long)i * h2) % m);
                ref Entry entry = ref _table[slot];

                if (entry.State == SlotState.Empty)
                {
                    return false;
                }

                if (entry.State == SlotState.Occupied && _comparer.Equals(entry.Key, key))
                {
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
            int m = _table.Length;
            int rawHash = _comparer.GetHashCode(key) & 0x7FFFFFFF;

            int h1 = rawHash % m;
            int h2 = 1 + (rawHash % (m - 1));
            int firstTombstone = -1;

            for (int i = 0; i < m; i++)
            {
                int slot = (int)(((long)h1 + (long)i * h2) % m);
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
                        return false;
                    }
                }
                else if (entry.State == SlotState.Deleted)
                {
                    if (firstTombstone == -1) firstTombstone = slot;
                }
                else // SlotState.Empty
                {
                    int targetSlot = (firstTombstone != -1) ? firstTombstone : slot;
                    if (targetSlot == firstTombstone) _tombstoneCount--;

                    _table[targetSlot].Key = key;
                    _table[targetSlot].Value = value;
                    _table[targetSlot].State = SlotState.Occupied;
                    _count++;

                    if (LoadFactor > MaxLoadFactor)
                    {
                        Resize();
                    }

                    return true;
                }
            }

            Resize();
            return InsertInternal(key, value, allowUpdate);
        }

        private void Resize()
        {
            if (_primeIndex + 1 < Primes.Length)
            {
                _primeIndex++;
            }

            int newCapacity = Primes[_primeIndex];
            Entry[] oldTable = _table;

            _table = new Entry[newCapacity];
            _count = 0;
            _tombstoneCount = 0;

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
    public static class DoubleHashingProgram
    {
        public static void Main()
        {
            Console.WriteLine("Running Double Hashing Verification Suite...");

            var map = new DoubleHashingHashMap<string, int>();

            map.Add("Mercury", 1);
            map.Add("Venus", 2);
            map.Add("Earth", 3);
            map.Add("Mars", 4);

            Debug.Assert(map.Count == 4);
            Debug.Assert(map["Mercury"] == 1);
            Debug.Assert(map["Earth"] == 3);

            // Test Tombstone search traversal
            map.Remove("Venus");
            Debug.Assert(!map.ContainsKey("Venus"));
            Debug.Assert(map.ContainsKey("Earth")); // Reachable past tombstone

            // Insert many elements to trigger dynamic prime scaling
            for (int i = 0; i < 50; i++)
            {
                map.AddOrUpdate($"Planet_{i}", i);
            }

            Debug.Assert(map.Capacity > 17, "Table did not expand prime capacity!");
            for (int i = 0; i < 50; i++)
            {
                Debug.Assert(map[$"Planet_{i}"] == i);
            }

            Console.WriteLine("All Double Hashing tests passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### Theoretical Comparison of Probing Strategies

| Resolution Strategy | Secondary Clustering? | Primary Clustering? | Max Practical Load Factor | Distinct Probe Paths | Cache Prefetch Efficiency |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Linear Probing** | Yes | **Severe** | $\alpha \le 0.50$ | $M$ | **Optimal (sequential words)** |
| **Quadratic Probing**| **Yes** | None | $\alpha \le 0.50$ | $M$ | Moderate |
| **Double Hashing** | **None** | **None** | $\mathbf{\alpha \le 0.70}$ | $\mathbf{M^2}$ | Lower (stride jumps) |
| **Separate Chaining**| None | None | $\alpha \le 0.75$ (or $> 1.0$) | N/A | Poor (pointer chasing) |

Double hashing provides the **most uniform slot dispersion** of any open-addressing technique, achieving near-theoretical uniform permutation behavior without needing linked-list pointers.

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### Problem: [LeetCode 49] Group Anagrams (Medium)

#### Problem Statement
Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.
An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

#### Canonical Key Design Pattern
To hash anagrams into the same bucket:
1. **Approach 1 (Sorting):** Sort string characters (`"eat" -> "aet"`). Slower: $O(K \log K)$ per word.
2. **Approach 2 (Frequency Tuple / String):** Count frequencies in `int[26]`. Construct a serialized string key: `"1#0#0#0#1#..."` or a custom hash code. Runtime: strictly $O(K)$ linear time!

```csharp
using System.Collections.Generic;

public class GroupAnagramsSolution
{
    public IList<IList<string>> GroupAnagrams(string[] strs)
    {
        var groups = new Dictionary<string, List<string>>();

        foreach (string s in strs)
        {
            // Build 26-character frequency signature
            int[] counts = new int[26];
            foreach (char c in s)
            {
                counts[c - 'a']++;
            }

            // Build canonical hash key representation
            var keyChars = new char[26];
            for (int i = 0; i < 26; i++)
            {
                keyChars[i] = (char)('a' + counts[i]);
            }
            string key = new string(keyChars);

            if (!groups.TryGetValue(key, out var list))
            {
                list = new List<string>();
                groups[key] = list;
            }
            list.Add(s);
        }

        return new List<IList<string>>(groups.Values);
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 205] Isomorphic Strings (Easy):**
   - *Task:* Determine if characters in string `s` can be replaced to get `t`.
   - *Pattern:* Dual hash map tracking forward and reverse character mappings.

2. **[LeetCode 290] Word Pattern (Easy):**
   - *Task:* Determine if string follows pattern (e.g. `"abba"` vs `"dog cat cat dog"`).
   - *Pattern:* Bijective mapping between character and word tokens.

3. **[LeetCode 451] Sort Characters By Frequency (Medium):**
   - *Task:* Sort string in decreasing order based on frequency of characters.
   - *Pattern:* Hash map frequency count + Max-Heap or Bucket Sort.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Open Addressing Cache Strategy:

                   ┌─────────────────────────────────────────┐
                   │       OPEN ADDRESSING SELECTION         │
                   └─────────────────────────────────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│          LINEAR PROBING              │  │           DOUBLE HASHING             │
├──────────────────────────────────────┤  ├──────────────────────────────────────┤
│ • Best when memory is plenty and     │  │ • Best when memory is tight and      │
│   alpha <= 0.50.                     │  │   alpha must reach 0.65 - 0.70.      │
│ • Maximum hardware cache locality.   │  │ • Eliminates all clustering jams.    │
│ • Deployed in compilers and VMs.     │  │ • Deployed in database index buffers.│
└──────────────────────────────────────┘  └──────────────────────────────────────┘
```

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
In double hashing, why must $h_2(k)$ and the table capacity $M$ be strictly coprime, and how do you guarantee this in practice?

### Architectural Model Answer
1. **The Mathematical Mandate of Coprimality:**
   - In double hashing, the probe sequence is defined as:
     $$\text{slot}(i) = (h_1(k) + i \cdot h_2(k)) \pmod M$$
   - This formula generates an arithmetic progression in the ring of integers modulo $M$ ($\mathbb{Z}/M\mathbb{Z}$).
   - By number theory, the elements $\{i \cdot h_2(k) \pmod M\}$ generate the entire additive group $\mathbb{Z}/M\mathbb{Z}$ if and only if:
     $$\gcd(h_2(k), M) = 1$$
   - If $\gcd(h_2(k), M) = d > 1$, the probe sequence cycles through only $\frac{M}{d}$ distinct slots. For example, if $M = 100$ and $h_2(k) = 20$, $\gcd(20, 100) = 20$. The search visits only $\frac{100}{20} = 5$ slots! If those 5 slots are occupied, the algorithm will loop infinitely, failing to insert the key even though 95 slots are vacant.

2. **How to Guarantee Coprimality in Production Systems:**
   - **Method 1 (Prime Table Capacity):** Maintain table capacity $M$ as a prime number (e.g., $17, 37, 79, \dots$). Compute $h_2(k)$ using an offset modulo $M - 1$:
     $$h_2(k) = 1 + (h(k) \pmod{M - 1})$$
     Because $1 \le h_2(k) < M$ and $M$ is prime, $M$ cannot share any divisors with $h_2(k)$. Thus $\gcd(h_2(k), M) = 1$ is guaranteed under all inputs.
   - **Method 2 (Power-of-Two Capacity):** If $M = 2^p$ for fast bitmasking ($M - 1$), force $h_2(k)$ to be an **odd number**:
     $$h_2(k) = (2 \cdot h(k) + 1) \pmod M$$
     Because any odd number has no common prime factors with $2^p$, $\gcd(\text{odd}, 2^p) = 1$, ensuring full table traversal.
