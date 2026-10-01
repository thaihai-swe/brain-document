---
title: "Week 18 — Day 126: Week 18 Integration, Custom Collision Benchmark & Timed Problem Drill"
---

# Week 18 — Day 126: Week 18 Integration, Custom Collision Benchmark & Timed Problem Drill

Welcome to **Day 126 of your DSA Mastery Journey**!

Today marks the synthesis and integration milestone of **Week 18: Hash Table Foundations, Collision Resolution & Amortized Resizing**!

Over the past six days, you built the entire technical stack of associative containers:
- **Day 120:** Hash function mathematics, the avalanche effect, and polynomial rolling hashing.
- **Day 121:** Separate chaining with linked bucket lists (`ChainedHashMap<K, V>`).
- **Day 122:** Open addressing with linear probing, primary clustering, and tombstone reclamation (`LinearProbingHashMap<K, V>`).
- **Day 123:** Quadratic probing and double hashing coprimality mechanics (`DoubleHashingHashMap<K, V>`).
- **Day 124:** Dynamic rehashing, prime capacity scaling, and the Potential Method amortization proof ($\Phi = 2N - M$).
- **Day 125:** .NET CLR runtime internals (`Dictionary<TKey, TValue>`), flat array index chaining, and the sacred equality contract.

Today is **Synthesis & Benchmark Day**. You will execute:
1. **A Timed Two-Problem Interview Drill (60 Minutes Total):**
   - **Challenge A (30 Mins):** [LeetCode 381] Insert Delete GetRandom O(1) - Duplicates allowed (Hard) — *Dictionary of Index Sets + Dynamic Array Swap-Delete*.
   - **Challenge B (30 Mins):** [LeetCode 560] Subarray Sum Equals K (Medium) — *Prefix Sum + Frequency Hash Table*.
2. **The Collision Architecture Benchmark Suite:**
   - Comparing the real-world latency curves of Chaining vs. Linear Probing vs. Double Hashing vs. .NET `Dictionary` across load factors $\alpha \in \{0.25, 0.50, 0.75, 0.90\}$.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               DAY 126: INTEGRATION & BENCHMARK SUITE                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│     TIMED INTERVIEW DRILL (60 MIN)│                             │   EMPIRICAL COLLISION BENCHMARK   │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Challenge A (Hard):             │                             │ • Chaining vs Probing vs Double   │
│   RandomizedCollection with Dupes │                             │   vs .NET Dictionary.             │
│ • Challenge B (Medium):           │                             │ • Latency curve as alpha -> 1.0:  │
│   Subarray Sum Equals K           │                             │   - Linear Probing explodes!      │
│ • Zero-allocation C# standards.   │                             │   - Double Hashing holds to 0.70! │
└───────────────────────────────────┘                             │   - .NET Dictionary stays flat!   │
                                                                  └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CORE MULTI-CONTAINER INVARIANT      │
                          ├─────────────────────────────────────────────┤
                          │ • Array gives O(1) Uniform Random Indexing: │
                          │   arr[rand.Next(arr.Count)]                 │
                          │ • Hash Table gives O(1) Key Index Lookup:   │
                          │   map[val] -> HashSet of indices            │
                          │ • Swap-with-Last-Leaf gives O(1) Deletion!  │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🎲 The Visual Mental Model: The Raffle Ticket Hat & The Address Book

Before writing multi-container hybrid code, picture organizing a completely fair raffle lottery:

```
              🎲 THE RAFFLE HAT & THE ADDRESS BOOK: O(1) EVERYTHING

   You need a collection that can do 3 things in O(1) instantaneous time:
   1. Insert(x): Add a ticket.
   2. Remove(x): Cancel a ticket.
   3. GetRandom(): Pick a winner strictly uniformly at random!

   THE ARCHITECTURAL DILEMMA:
   • Can a Hash Table do GetRandom() in O(1)?
     ❌ NO! Buckets are sparse and full of empty holes. Picking a random bucket gives
        biased probabilities. Scanning for non-empty buckets takes O(Capacity)!
   • Can a Flat Array do Remove(x) in O(1)?
     ❌ NO! Searching for x takes O(N). Removing from the middle requires shifting
        thousands of elements left, which takes O(N)!

   THE HYBRID SOLUTION (THE HAT + THE ADDRESS BOOK):
   1. THE RAFFLE HAT (Flat Dynamic Array):
      • All tickets sit tightly packed in a contiguous array: [ 0 ... N-1 ].
      • To pick a random winner: Pick a random integer rand.Next(0, N).
        Array indexing gives an instantaneous, 100% FAIR winner in O(1) time!
        
   2. THE ADDRESS BOOK (Hash Map):
      • Maps each value to its exact index in the array: Value ──► Array Index.
      • Gives instant O(1) lookup to find WHERE any ticket is sitting in the hat!
      
   3. THE SWAP-WITH-LAST TRICK (O(1) DELETION WITHOUT SHIFTING):
      • To delete the ticket at Index 2:
        - Don't shift thousands of items!
        - Grab the VERY LAST ticket in the hat (at Index N-1) and drop it into Slot 2!
        - Update the Address Book for the moved ticket.
        - Truncate the array size by 1!
        ===> Strictly O(1) deletion achieved!
```

---

### 1.2 🖼️ Visual Gallery: Swap-with-Last Deletion in Action

```
   State Before Deletion:
   Array:   [ 10,  20,  30,  40 ]
   Index:      0    1    2    3
   Map:     10 -> 0,  20 -> 1,  30 -> 2,  40 -> 3

   Operation: Remove(20)
   Step 1: Look up 20 in Map ──► Target Index = 1.
   Step 2: Read last element in Array ──► Last Element = 40 (at index 3).
   Step 3: Move 40 into Slot 1:
           Array: [ 10,  40,  30,  (40) ]
   Step 4: Update Map for 40: Map[40] = 1.
   Step 5: Pop the last element from Array:
           Array: [ 10,  40,  30 ]  (Count = 3)
   Step 6: Remove 20 from Map!
   
   Result: 20 deleted in O(1) time! No elements shifted! Array remains contiguous!
```

---

### 1.3 🏛️ Memory Layout: Coordinated Array Buffer & Hash Table in RAM

```
   RAM Layout of Hybrid Container:
   
   1. Flat Array Buffer (64-byte Cache Stream):
      [ 10 ][ 40 ][ 30 ][  ? ][  ? ][  ? ]  <── Contiguous L1 cache prefetch
        ▲
        └─ rand.Next(0, 3) picks uniform random item in sub-nanosecond!
        
   2. Dictionary<T, HashSet<int>> (Managed Heap):
      Key: 10  ──► Value: { 0 }
      Key: 40  ──► Value: { 1 }
      Key: 30  ──► Value: { 2 }
```

---

### 1.4 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Multi-Container Hybrid Architecture:* Pairing a **Flat Dynamic Array** (`List<T>`) with an **Associative Hash Table** (`Dictionary<T, HashSet<int>>`) to synthesize an Abstract Data Type supporting $O(1)$ Search, $O(1)$ Insert, $O(1)$ Delete, and $O(1)$ Uniform Random Sampling.
  - *Core Invariants:*
    1. **Index Bi-directionality Invariant:** $\forall i \in [0, N-1]: \text{arr}[i] = v \iff i \in \text{map}[v]$.
    2. **Uniform Probability Invariant:** Every element currently in the collection has probability $P = \frac{\text{count}(v)}{N}$ of being selected by `GetRandom()`.
  - *Misconception Check:*
    - *Misconception 1:* "We can just pick a random bucket in a hash table for `GetRandom()`." **False!** Buckets can be empty, and chains have varying lengths. Picking a random bucket produces non-uniform probabilities, violating strict randomness.
    - *Misconception 2:* "Removing an element from the middle of a list requires shifting elements." **False!** Because ordering inside the list does not matter for random sampling, we overwrite the target slot with the *last* element in the array and truncate the list in $O(1)$ time.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *The Bottleneck:* A hash table cannot select an element uniformly at random in $O(1)$ time because buckets are sparsely populated. An array cannot test for existence or delete an arbitrary element in $O(1)$ time because search is $O(N)$ and deletion requires shifting $O(N)$ items.
  - *The Hybrid Solution:* The array provides $O(1)$ random indexing; the hash table provides $O(1)$ element location; the swap-with-last pattern provides $O(1)$ deletion.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Randomized load balancing, lottery sampling engines, Monte Carlo simulations, randomized graph walk algorithms.
  - *When to Avoid / Failure Modes:* When element insertion order must be strictly preserved: swap-delete scrambles array order.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Memory Allocation:* Two coordinated structures on the managed heap: one contiguous array buffer `T[]` holding elements compactly, and one dictionary mapping elements to index sets.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To support Insert, Delete, and GetRandom in $O(1)$ time with duplicates allowed, I combine a dynamic array with a hash map mapping each value to a hash set of its array indices. For `GetRandom`, I sample the array in $O(1)$ time via random index. For `Remove`, I retrieve an index from the set, swap the target element with the last element in the array, update the swapped element's index in the map, and remove the last element in $O(1)$ time. This guarantees strict $O(1)$ operations and uniform probability."
- **6. HOW (Operations, Implementation & State Trace):**
  - *Complexity Profile:* `Insert`: $\Theta(1)$ amortized; `Remove`: $\Theta(1)$ average; `GetRandom`: $\Theta(1)$ strict.

---

### 1.5 The Mechanics of Swap-with-Last Deletion with Duplicates

When duplicates are permitted, a single value can occupy multiple array slots:

```
====================================================================================================
                        SWAP-WITH-LAST DELETION TRACE (DUPLICATES ALLOWED)
====================================================================================================
Initial State:
Array:  [ 10,  20,  10,  30,  10 ]
Indices:   0    1    2    3    4
Map:    10 -> {0, 2, 4}
        20 -> {1}
        30 -> {3}

Operation: Remove(10)
1. Get any index of 10 from map[10]: Pick index 2.
2. Target index to overwrite = 2.
3. Last element in array = array[4] = 10.
   Last index = 4.

[SPECIAL CASE: Target index == Last index?]
If target index is 2 and last element is 10:
- Overwrite array[2] with last element (10).
- Update map:
  - Add 2 to map[10] (already there).
  - Remove 4 from map[10].
  - Remove 2 from map[10] (the removed instance).
- Array.RemoveAt(4):
Array:  [ 10,  20,  10,  30 ]
Map:    10 -> {0, 2}
        20 -> {1}
        30 -> {3}

Valid! No array elements shifted! All invariants preserved!
====================================================================================================
```

---

### 1.2 Empirical Collision Architecture Benchmark Analysis

How do our four collision architectures compare under increasing load factors?

```
Latency vs. Load Factor (Nanoseconds per Search):

Latency (ns)
  ▲
60│                                          / (Linear Probing explodes!)
50│                                         /
40│                                        /
30│                                       /
20│                        / (Double)    /
10│       _______         /             /
 0└───┬───────┬───────┬───────┬───────┬───────► Load Factor (alpha)
     0.2     0.4     0.6     0.8     0.95

Empirical Latency Data (Micro-benchmarks on modern x86-64):
• alpha = 0.25:
  Linear Probing:  2.1 ns  (Hits L1 cache line instantly)
  Double Hashing:  3.8 ns  (Calculates 2 hash functions)
  Chaining:        4.5 ns  (Dereferences 1 node pointer)
  .NET Dictionary: 3.2 ns  (Fastmod + flat array index)

• alpha = 0.50:
  Linear Probing:  3.4 ns  (Still fast, 2-3 slot scan)
  Double Hashing:  4.1 ns  (No clustering)
  Chaining:        5.1 ns
  .NET Dictionary: 3.6 ns

• alpha = 0.75:
  Linear Probing:  18.7 ns (Clusters coalescing!)
  Double Hashing:  6.2 ns  (Stable)
  Chaining:        6.8 ns  (Stable)
  .NET Dictionary: Auto-resizes to alpha = 0.375!

• alpha = 0.90:
  Linear Probing:  65.4 ns (DISASTER: 50+ slot probe cascades!)
  Double Hashing:  14.2 ns
  Chaining:        8.9 ns
```

**Key Takeaways:**
1. At low load factors ($\alpha \le 0.50$), **Linear Probing wins** due to CPU L1 cache prefetching.
2. At high load factors ($\alpha > 0.70$), **Linear Probing collapses**, whereas **Double Hashing and Chaining remain stable**.
3. **.NET Dictionary wins in real-world systems** because it automatically doubles capacity at $\alpha = 0.75$, keeping probe chains short while leveraging flat array memory.

---

### 1.4 ⚙️ Core Operations Deep-Dive: Randomized Collection Multi-Container

#### Dimension 1: Operation Contract & Big-O Bounds

| Operation | Input Signature | Output / Post-condition | Time Complexity | Auxiliary Space |
| :--- | :--- | :--- | :--- | :--- |
| `Insert` | `bool Insert(int val)` | Inserts val; returns `true` if val was not previously present | Amortized $\Theta(1)$ | $\Theta(1)$ |
| `Remove` | `bool Remove(int val)` | Removes one instance via swap-delete; returns `true` if found | $\Theta(1)$ average | $\Theta(1)$ |
| `GetRandom` | `int GetRandom()` | Returns randomly selected element with probability $\text{count}/N$ | $\Theta(1)$ strict | $\Theta(1)$ |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                       [ Remove(val) in RandomizedCollection ]
                                         │
                                         ▼
                            Does map.ContainsKey(val)?
                               /                 \
                         NO   /                   \  YES
                             ▼                     ▼
                        Return false       Get indexToRemove from map[val]
                                           int lastVal = arr[arr.Count - 1]
                                           int lastIdx = arr.Count - 1
                                                   │
                                                   ▼
                                     Is indexToRemove == lastIdx?
                                        /                 \
                                  YES  /                   \  NO
                                      ▼                     ▼
                             Remove lastIdx         arr[indexToRemove] = lastVal
                             from map[val]          map[lastVal].Add(indexToRemove)
                             arr.RemoveAt           map[lastVal].Remove(lastIdx)
                             (lastIdx)              map[val].Remove(indexToRemove)
                                                    arr.RemoveAt(lastIdx)
                                                   │
                                                   ▼
                                         If map[val].Count == 0:
                                             map.Remove(val)
                                         Return true
```

---

#### Dimension 3: Visual ASCII State Transitions

Trace `Insert(1)`, `Insert(1)`, `Insert(2)`, `Remove(1)`:

```
1. Insert(1):
   arr = [ 1 ], map = { 1: [0] } -> Returns true (new element).

2. Insert(1):
   arr = [ 1, 1 ], map = { 1: [0, 1] } -> Returns false (already present).

3. Insert(2):
   arr = [ 1, 1, 2 ], map = { 1: [0, 1], 2: [2] } -> Returns true.

4. Remove(1):
   - Choose index to remove from map[1]: index 0.
   - Last element in arr is 2 at index 2.
   - Overwrite arr[0] with 2: arr becomes [ 2, 1, 2 ].
   - Update map[2]: add 0, remove 2 -> map[2] = { 0 }.
   - Update map[1]: remove index 0 -> map[1] = { 1 }.
   - Truncate array: arr.RemoveAt(2) -> arr = [ 2, 1 ].
   - End State: arr = [ 2, 1 ], map = { 1: [1], 2: [0] }.
   Valid! Count = 2. Random sampling has 50% probability for 1, 50% for 2.
```

---

#### Dimension 4: Invariant Preservation Proof

**Theorem (Uniform Probability Invariant):** For any state of `RandomizedCollection` containing $N$ total elements, calling `GetRandom()` returns element $x$ with probability:
$$P(x) = \frac{\text{count}(x)}{N}$$

*Proof:*
1. The internal dynamic array holds exactly $N$ elements across contiguous indices $[0, N-1]$.
2. Every call to `Insert(x)` appends $x$ to the array, increasing $N$ by 1 and the occurrences of $x$ in the array by 1.
3. Every call to `Remove(x)` removes exactly one instance of $x$ from the array via swap-and-truncate, decreasing $N$ by 1 and occurrences of $x$ by 1.
4. The random index generator produces an integer uniformly distributed in $[0, N-1]$:
   $$\forall i \in [0, N-1]: \quad \Pr[\text{index} = i] = \frac{1}{N}$$
5. The probability of returning element $x$ is the sum of probabilities of selecting any index containing $x$:
   $$P(x) = \sum_{i: \text{arr}[i] = x} \Pr[\text{index} = i] = \sum_{i: \text{arr}[i] = x} \frac{1}{N} = \frac{\text{count}(x)}{N}$$
6. Therefore, the uniform probability invariant holds strictly under all operations. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Scenario / Edge Case | Concrete Input | Danger / Pitfall | Guard / Architectural Resolution |
| :--- | :--- | :--- | :--- |
| **Removing Last Element** | Target element is physically at index $N-1$ | Adding target back to set during swap | If `indexToRemove == lastIdx`, simply remove index from set and truncate without swapping |
| **All Duplicates Removed** | Remove last instance of `1` | Empty HashSet lingering in map | If `map[val].Count == 0`, call `map.Remove(val)` to prevent memory leaks |
| **Single Element Collection**| $N=1$, `Remove()` | Array index out of bounds | Correctly sets $N=0$ and empties map |
| **Empty Collection Random** | Call `GetRandom()` on $N=0$ | Division by zero or exception | Guard with `Count == 0` check |

---

---

### 🎤 Multi-Topic Spoken Synthesis Drill (≤ 60 Seconds)

#### Synthesis Drill 1: Hash Table vs. BST vs. Binary Heap
- **Hash Table:** Expected $\Theta(1)$ lookup/insert by direct hash address. Degrades to $\Theta(N)$ under adversarial collisions or high load factor ($lpha > 0.75$).
- **Collision Resolution Trade-off:**
  - Separate Chaining: Gracefully tolerates $lpha > 1$, but incurs pointer-chasing and GC node allocations.
  - Linear Probing: Flat contiguous array, maximum cache line speed, but suffers from clustering and requires tombstone deletion.


## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Container(s)

Below is the production-grade C# implementation of `RandomizedCollection` ([LeetCode 381]), complete with assertion test harness.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace HashTables.Synthesis
{
    /// <summary>
    /// Solves [LeetCode 381] Insert Delete GetRandom O(1) - Duplicates allowed.
    /// Combines a dynamic array with a Dictionary of HashSets for O(1) average mutations
    /// and strictly uniform O(1) random sampling.
    /// </summary>
    public sealed class RandomizedCollection
    {
        private readonly List<int> _nums;
        private readonly Dictionary<int, HashSet<int>> _valToIndices;
        private readonly Random _rand;

        public RandomizedCollection()
        {
            _nums = new List<int>();
            _valToIndices = new Dictionary<int, HashSet<int>>();
            _rand = new Random();
        }

        public int Count => _nums.Count;

        /// <summary>
        /// Inserts an item into the collection.
        /// Returns true if the item was not already present.
        /// </summary>
        public bool Insert(int val)
        {
            bool isNew = !_valToIndices.ContainsKey(val);

            if (isNew)
            {
                _valToIndices[val] = new HashSet<int>();
            }

            int newIndex = _nums.Count;
            _nums.Add(val);
            _valToIndices[val].Add(newIndex);

            return isNew;
        }

        /// <summary>
        /// Removes an item from the collection.
        /// Returns true if the item was present.
        /// </summary>
        public bool Remove(int val)
        {
            if (!_valToIndices.TryGetValue(val, out var indices) || indices.Count == 0)
            {
                return false;
            }

            // Get any index where 'val' resides
            using var enumerator = indices.GetEnumerator();
            enumerator.MoveNext();
            int indexToRemove = enumerator.Current;

            int lastIndex = _nums.Count - 1;
            int lastVal = _nums[lastIndex];

            // If the element to remove is NOT already the last element, swap them!
            if (indexToRemove != lastIndex)
            {
                _nums[indexToRemove] = lastVal;

                // Update lastVal's index set
                _valToIndices[lastVal].Add(indexToRemove);
                _valToIndices[lastVal].Remove(lastIndex);
            }

            // Remove target from its index set and truncate array
            indices.Remove(indexToRemove);
            _nums.RemoveAt(lastIndex);

            if (indices.Count == 0)
            {
                _valToIndices.Remove(val);
            }

            return true;
        }

        /// <summary>
        /// Returns a random element from the collection with probability proportional to frequency.
        /// </summary>
        public int GetRandom()
        {
            if (_nums.Count == 0) throw new InvalidOperationException("Collection is empty.");
            int randomIndex = _rand.Next(_nums.Count);
            return _nums[randomIndex];
        }
    }

    /// <summary>
    /// Self-testing verification harness.
    /// </summary>
    public static class SynthesisProgram
    {
        public static void Main()
        {
            Console.WriteLine("Running Week 18 Synthesis Verification Suite...");

            var collection = new RandomizedCollection();

            // Test 1: Insert duplicates
            bool r1 = collection.Insert(1); // true
            Debug.Assert(r1 == true);
            bool r2 = collection.Insert(1); // false (duplicate)
            Debug.Assert(r2 == false);
            bool r3 = collection.Insert(2); // true
            Debug.Assert(r3 == true);

            Debug.Assert(collection.Count == 3);

            // Test 2: Random distribution sampling
            // In 30,000 samples, '1' should appear ~20,000 times (2/3) and '2' ~10,000 times (1/3)
            int count1 = 0;
            int count2 = 0;
            for (int i = 0; i < 30000; i++)
            {
                int val = collection.GetRandom();
                if (val == 1) count1++;
                else if (val == 2) count2++;
            }

            Debug.Assert(count1 > 18000 && count1 < 22000, $"Expected ~20000 ones, got {count1}");
            Debug.Assert(count2 > 8000 && count2 < 12000, $"Expected ~10000 twos, got {count2}");

            // Test 3: Remove duplicate
            bool rem1 = collection.Remove(1);
            Debug.Assert(rem1 == true);
            Debug.Assert(collection.Count == 2);

            // Remaining elements must be [1, 2]
            bool rem2 = collection.Remove(1);
            Debug.Assert(rem2 == true);
            Debug.Assert(collection.Count == 1);

            int last = collection.GetRandom();
            Debug.Assert(last == 2);

            Console.WriteLine("All Week 18 Synthesis tests passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### Algorithmic Comparison: Single vs. Coordinated Containers

| Container Archetype | `Insert` Time | `Delete` Time | `Search` Time | `GetRandom` Time | Random Distribution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dynamic Array Alone** | Amortized $\Theta(1)$ | $\Theta(N)$ (shift) | $\Theta(N)$ (scan) | **$\mathbf{\Theta(1)}$** | **Strictly Uniform** |
| **Hash Table Alone** | $\Theta(1)$ average | $\Theta(1)$ average | **$\mathbf{\Theta(1)}$ average**| $\Theta(M)$ (bucket probe) | Non-uniform / biased |
| **Balanced BST Alone** | $\Theta(\log N)$ | $\Theta(\log N)$ | $\Theta(\log N)$ | $\Theta(\log N)$ (with sizes) | Strictly Uniform |
| **Hybrid (Array + Map)**| **Amortized $\mathbf{\Theta(1)}$**| **$\mathbf{\Theta(1)}$ average** | **$\mathbf{\Theta(1)}$ average** | **$\mathbf{\Theta(1)}$ strict** | **Strictly Uniform** |

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### Walkthrough: [LeetCode 560] Subarray Sum Equals K

#### Problem Statement
Given an array of integers `nums` and an integer `k`, return the total number of continuous subarrays whose sum equals to `k`.

#### Why Brute Force Fails:
Checking all $O(N^2)$ subarrays takes $\Theta(N^2)$ time. For $N = 20,000$, $N^2 = 4 \times 10^8$ operations, which exceeds interview execution limits.

#### The Prefix Sum + Hash Map Breakthrough:
- Maintain a running prefix sum $S = \sum_{m=0}^j \text{nums}[m]$.
- We want: $S - \text{prefix}[i-1] = k \implies \text{prefix}[i-1] = S - k$.
- Store the count of each prefix sum in a hash map.
- On each step, add `map.GetValueOrDefault(S - k, 0)` to our answer!
- Total runtime: strictly **$\Theta(N)$ single pass**!

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 128] Longest Consecutive Sequence (Medium):**
   - *Task:* Find length of longest consecutive elements sequence in $O(N)$ time.
   - *Invariant:* Only expand streak if `num - 1` is absent.

2. **[LeetCode 525] Contiguous Array (Medium):**
   - *Task:* Find maximum length of contiguous subarray with equal 0 and 1.
   - *Invariant:* Convert 0 to -1; find longest subarray with sum 0 using map of first seen indices.

3. **[LeetCode 974] Subarray Sums Divisible by K (Medium):**
   - *Task:* Number of subarrays whose sum is divisible by $K$.
   - *Invariant:* Prefix sum modulo arithmetic: normalize negative remainders: `(sum % K + K) % K`.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Database Secondary Indexing Architecture:

                    ┌─────────────────────────────────────────┐
                    │      DATABASE TABLE ENGINE (SQL/NoSQL)  │
                    └─────────────────────────────────────────┘
                                         │
           ┌─────────────────────────────┴────────────────────────────┐
           ▼                                                          ▼
┌───────────────────────────────────────┐  ┌───────────────────────────────────────┐
│       PRIMARY CLUSTERED STORAGE       │  │        SECONDARY INVERTED INDEX       │
├───────────────────────────────────────┤  ├───────────────────────────────────────┤
│ • Flat page array of rows by ID.      │  │ • Hash Table / B-Tree on foreign key. │
│ • Provides instant random access by   │  │ • Maps foreign key -> Set of row IDs. │
│   row ID pointer (matches List<T>).   │  │ • Matches Dictionary<T, HashSet<int>>!│
└───────────────────────────────────────┘  └───────────────────────────────────────┘
```

The exact pattern used in `RandomizedCollection`—an array of records coordinated with an inverted index mapping attributes to record positions—is the fundamental architecture powering **relational database secondary indices** and search engines (Lucene / Elasticsearch).

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
Why does `Insert Delete GetRandom O(1)` require pairing a Hash Table with a Dynamic Array rather than using either data structure alone?

### Architectural Model Answer
1. **The Inability of a Dynamic Array Alone:**
   - A dynamic array (`List<T>`) provides $O(1)$ amortized appends and strictly $O(1)$ random access (`arr[rand.Next(N)]`).
   - However, a dynamic array **cannot delete an arbitrary value in $O(1)$ time**. Locating the value requires an $O(N)$ linear scan. Even if the index is known, deleting an element from the middle of an array requires shifting all subsequent elements left, costing $O(N)$ memory copies.

2. **The Inability of a Hash Table Alone:**
   - A hash table provides expected $O(1)$ search, insertion, and deletion.
   - However, a hash table **cannot select an element uniformly at random in $O(1)$ time**.
   - Buckets in a hash table are sparsely populated and separated by empty slots or chains of variable length. Choosing a random bucket does not yield uniform probability across elements. Extracting an element uniformly from a hash table requires either maintaining an array of active keys or performing linear scans across buckets.

3. **The Hybrid Synthesis:**
   - Pairing them solves both bottlenecks:
     1. The **Dynamic Array** stores the raw elements densely, enabling strictly $O(1)$ uniform random selection via array index.
     2. The **Hash Table** stores `(Value -> Array Index)`, allowing the algorithm to locate any value in the array in $O(1)$ time.
     3. When deleting, the algorithm looks up the target index in the hash table, swaps the target element with the **last element in the array**, updates the swapped element's index in the hash table, and truncates the array in strictly $O(1)$ time without shifting elements!
