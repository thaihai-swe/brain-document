---
title: "Week 16 — Day 110: Top-K Elements & Streaming Extrema Pattern (Fixed-Size Min-Heap)"
---

# Week 16 — Day 110: Top-K Elements & Streaming Extrema Pattern (Fixed-Size Min-Heap)

Welcome to **Day 110 of your DSA Mastery Journey**!

Yesterday in [Day 109](./Week%2016%20%E2%80%94%20Day%20109:%20In-Place%20HeapSort:%20Sorting%20in%20%CE%98%28N%20log%20N%29%20Time%20and%20%CE%98%281%29%20Space.md), we mastered in-place HeapSort, sorting static arrays in $\Theta(N \log N)$ time and $\Theta(1)$ auxiliary space.

Today, we transition from batch array sorting to **Streaming Extrema Processing**: the **Top-K Elements Pattern**:
1. **The Bounded Extrema Filter Paradigm:** Maintaining a small, fixed-capacity heap of size $K$ to filter an arbitrarily large (or infinite) stream of $N$ items in $O(N \log K)$ time and $\Theta(K)$ space.
2. **The Min-Heap for Largest Elements Duality:** Why extracting the $K$ *largest* elements requires a **Min-Heap** of size $K$, while extracting the $K$ *smallest* elements requires a **Max-Heap** of size $K$.
3. **Compound Priority Comparators:** Implementing multi-attribute tie-breaking in C# (e.g. frequency descending, alphabetical ascending).
4. **LeetCode Lab:** Deep-dive architectural walkthroughs of:
   - **[LeetCode 347] Top K Frequent Elements** (Medium)
   - **[LeetCode 692] Top K Frequent Words** (Medium)

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 110 ARCHITECTURE                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
         ┌────────────────────────────────────────┴────────────────────────────────────────┐
         ▼                                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│     NAIVE BATCH SORTING (O(N log N))│                           │    BOUNDED MIN-HEAP (O(N log K))  │
│         EXCESSIVE MEMORY          │                             │         OPTIMAL STREAMING         │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Buffer all N elements in memory.│                             │ • Heap capacity strictly = K.     │
│ • Sort entire collection:         │                             │ • Discard inferior elements immediately!
│   Takes O(N log N) time.          │                             │ • Root ALWAYS holds the THRESHOLD │
│ • Takes O(N) space.               │                             │   (smallest of the top K items).  │
│ • Unusable on unbounded streaming │                             │ • If new > root: pop root, push new!
│   data (e.g. network packets).    │                             │ • Time: O(N log K) << O(N log N). │
│                                   │                             │ • Space: Strictly O(K) memory!    │
└───────────────────────────────────┘                             └───────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* The **Bounded Extrema Filter Pattern** is an algorithmic pattern that processes an input sequence of $N$ items using a priority queue restricted to capacity $K$, such that the queue maintains the $K$ extreme elements (largest or smallest) in $O(N \log K)$ time and $O(K)$ space.
  - *The Core Duality:*
    - **To find the $K$ LARGEST elements:** Use a **MIN-HEAP** of size $K$. The root element is the *smallest of the top $K$*, acting as the admission threshold.
    - **To find the $K$ SMALLEST elements:** Use a **MAX-HEAP** of size $K$. The root element is the *largest of the bottom $K$*, acting as the admission ceiling.
  - *Invariants:*
    - **Threshold Invariant:** After processing prefix $S[0 \dots i]$ (where $i \ge K$), the heap contains the exact top-$K$ elements of that prefix, and `heap.Peek()` is the $K$-th largest element seen so far.
  - *Misconception Check:* Candidates frequently use a Max-Heap when asked for the $K$ largest elements. A Max-Heap of size $K$ has its *largest* element at the root; comparing an incoming element to the root tells you nothing about whether it beats the *smallest* of your top-$K$ candidates! To filter the $K$ largest elements, you **must use a Min-Heap**.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Sorting $10,000,000$ logs to find the top $10$ highest-traffic IP addresses takes $10^7 \times 24 \approx 2.4 \times 10^8$ operations and gigabytes of memory. A Min-Heap of size $K=10$ takes $10^7 \times \log_2(10) \approx 3.3 \times 10^7$ operations and only **10 entries in memory** ($< 1$ KB)!
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* "Top $K$ frequent words", "Kth largest element in stream", "high-volume real-time telemetry", "finding top spenders in database query without full sort".
  - *When to Avoid / Failure Modes:* If $K \approx N$, $O(N \log K) \approx O(N \log N)$; standard QuickSelect ($O(N)$ expected) is faster for offline arrays.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Uses .NET 6+ `PriorityQueue<TElement, TPriority>`. The heap buffer allocates an array of size $K$, completely avoiding Large Object Heap (LOH) allocations and keeping the entire working set in CPU L1 cache.
  - *Production Systems:* Twitter trending hashtags, Spotify top played tracks, Google search autocomplete query rankers.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To find the top $K$ largest elements in a stream, I maintain a Min-Heap of bounded capacity $K$. The root of the Min-Heap always holds the admission threshold—the smallest of the current top $K$ elements. For each incoming item, if the heap has fewer than $K$ elements, I insert it directly. Otherwise, if the item is strictly greater than the root, I replace the root using EnqueueDequeue. After scanning all $N$ items, the heap contains the exact top $K$ elements, executing in $O(N \log K)$ time and strictly $O(K)$ space."
  - *Interviewer Evaluation Lens:* Checks whether candidate uses a Min-Heap for largest elements (or Max-Heap for smallest), uses `EnqueueDequeue` to avoid two separate $O(\log K)$ operations, and implements compound tie-breaking comparators cleanly.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:* Total Time: $O(N \log K)$; Auxiliary Space: $\Theta(K)$ memory.

---

### 1.1 Physical Mental Model — The VIP Lounge & The Bouncer at the Door

**Everyday Analogy: The Exclusive 3-Chair VIP Lounge**

Imagine an ultra-exclusive VIP lounge with room for only **$K = 3$ chairs**. You want the 3 richest people in the city to occupy those chairs:

**The Great Paradox: Why use a MIN-Heap to find the LARGEST elements?**
- In a Min-Heap of size 3, who sits right at the entrance gate (`heap.Peek()`)?
  $\implies$ **The POOREST person currently inside the lounge!**
- The person at the gate acts as the **Admission Threshold**:

```
The VIP Lounge (Min-Heap of Size K=3):
Inside: [ $50M, $100M, $200M ]
Gatekeeper (heap.Peek()): [ $50M ]  <-- The Poorest VIP inside!
```

---

**The Bouncer's Golden Rule:**

A new guest arrives outside the lounge:
1. **If guest has $\le \$50M$ (Guest $\le$ `heap.Peek()`):**
   - The bouncer slams the door shut!
   - *"You aren't even richer than our poorest member!"*
   - Instant $O(1)$ rejection! Zero changes to the heap!
2. **If guest has $>\$50M$ (Guest $>$ `heap.Peek()`):**
   - The bouncer kicks the \$50M person out the back door!
   - The new guest takes a seat.
   - The 3 remaining VIPs compare wealth in $O(\log K)$ time. Whoever is now the poorest takes their place by the entrance gate as the new threshold!

```
New Guest arrives with $80M:
1. $80M > $50M (Door Threshold) -> Bouncer admits guest!
2. Kick out $50M.
3. Lounge becomes: [ $80M, $100M, $200M ].
4. New Door Gatekeeper is now [ $80M ]!
```

**Memory Miracle:**
Even if $100,000,000$ guests arrive, you **never store more than 3 people in memory** ($O(K)$ space)!

---

### 1.2 The Threshold Replacement Mechanics in Action

Finding the Top $3$ Largest numbers in stream `[ 4, 1, 7, 3, 8, 5, 2, 9 ]` ($K = 3$):

```
Initial Stream: [ 4, 1, 7, 3, 8, 5, 2, 9 ]
Container: Min-Heap (Capacity K = 3)

Step 1: Process 4 -> Heap: [ 4 ] (Count = 1 < 3)
Step 2: Process 1 -> Heap: [ 1, 4 ] (Count = 2 < 3)
Step 3: Process 7 -> Heap: [ 1, 4, 7 ] (Count = 3 == K)
Threshold is heap.Peek() = 1.

Step 4: Process 3:
- Is 3 > Threshold (1)? YES!
- Replace 1 with 3: EnqueueDequeue(3) -> Pop 1, Push 3.
- Heap becomes: [ 3, 4, 7 ]
- New threshold is 3.

Step 5: Process 8:
- Is 8 > Threshold (3)? YES!
- Replace 3 with 8: EnqueueDequeue(8) -> Pop 3, Push 8.
- Heap becomes: [ 4, 8, 7 ]
- New threshold is 4.

Step 6: Process 5:
- Is 5 > Threshold (4)? YES!
- Replace 4 with 5: EnqueueDequeue(5) -> Pop 4, Push 5.
- Heap becomes: [ 5, 8, 7 ]
- New threshold is 5.

Step 7: Process 2:
- Is 2 > Threshold (5)? NO!
- Discard 2 immediately (0 heap operations!).
- Heap remains: [ 5, 8, 7 ]

Step 8: Process 9:
- Is 9 > Threshold (5)? YES!
- Replace 5 with 9: EnqueueDequeue(9) -> Pop 5, Push 9.
- Heap becomes: [ 7, 8, 9 ]

Final Heap: { 7, 8, 9 }
The exact Top 3 elements discovered with strictly 3 elements in memory!
```

---

### 1.2 ⚙️ Core Operations Deep-Dive: Bounded Streaming Extrema

#### Dimension 1: Operation Contract & Big-O Bounds

##### 1. Top-K Extrema Filter Contract
- **Signature:** `IList<T> FindTopK<T>(IEnumerable<T> stream, int k, IComparer<T> comparer)`
- **Pre-conditions:** `stream` is non-null; $k \ge 1$.
- **Post-conditions:** Returns a list of the $k$ most extreme elements according to `comparer`.
- **Invariants:**
  1. At all times after the first $k$ elements, `heap.Count == k`.
  2. For a top-$K$ largest query, $\forall x \in \text{heap}: x \ge \text{heap.Peek()}$.
  3. Every discarded element $y$ satisfies $y \le \text{heap.Peek()}$.

##### Big-O Operational Complexity Matrix
| Approach | Time Complexity | Auxiliary Space | Handles Unbounded Streams? |
| :--- | :---: | :---: | :---: |
| **Full Array Sort** | $O(N \log N)$ | $O(N)$ | ❌ NO (Requires entire array in memory) |
| **Max-Heap of Size $N$** | $O(N + K \log N)$ | $O(N)$ | ❌ NO (Requires all elements) |
| **Bounded Min-Heap of Size $K$** | $\mathbf{O(N \log K)}$ | $\mathbf{\Theta(K)}$ | **✅ YES (Strictly $\Theta(K)$ memory working set)** |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
====================================================================================================
                        BOUNDED TOP-K FILTER DECISION TREE
====================================================================================================
What is the extrema objective?
   │
   ├─► FIND TOP K LARGEST:
   │      • Use MIN-HEAP of capacity K!
   │      • For each element x in stream:
   │           - IF heap.Count < K:
   │                heap.Enqueue(x, x);
   │           - ELSE IF x > heap.Peek():
   │                heap.EnqueueDequeue(x, x);  // Replace threshold
   │           - ELSE:
   │                Discard x;                  // x cannot be in top K
   │
   └─► FIND TOP K SMALLEST:
          • Use MAX-HEAP of capacity K (invert comparer)!
          • For each element x in stream:
               - IF heap.Count < K:
                    heap.Enqueue(x, x);
               - ELSE IF x < heap.Peek():
                    heap.EnqueueDequeue(x, x);  // Replace ceiling
               - ELSE:
                    Discard x;                  // x cannot be in bottom K
====================================================================================================
```

---

#### Dimension 3: Visual ASCII State Transitions

```
+-------+-------+-------------------+-----------------------------------+
| Step  | Input | Heap State (Min)  | Action Taken                      |
+-------+-------+-------------------+-----------------------------------+
| Init  |  ---  | []                | Allocate PriorityQueue size K     |
| 1     |  10   | [10]              | Enqueue (Count 1 < K)             |
| 2     |  20   | [10, 20]          | Enqueue (Count 2 < K)             |
| 3     |   5   | [5, 20, 10]       | Enqueue (Count 3 == K)            |
|       |       |                   | Threshold = 5                     |
| 4     |   2   | [5, 20, 10]       | 2 <= 5 -> Discarded immediately!  |
| 5     |  15   | [10, 20, 15]      | 15 > 5 -> EnqueueDequeue(15)      |
|       |       |                   | New Threshold = 10                |
| 6     |  30   | [15, 20, 30]      | 30 > 10 -> EnqueueDequeue(30)     |
|       |       |                   | New Threshold = 15                |
+-------+-------+-------------------+-----------------------------------+
Final Top 3: [15, 20, 30].
```

---

#### Dimension 4: Invariant Preservation Proof

##### Inductive Proof of Top-$K$ Threshold Invariant
Let $S = \langle x_1, x_2, \dots, x_N \rangle$ be a stream of elements.
We prove by induction on $m \ge K$ that after processing prefix $S_m = \langle x_1, \dots, x_m \rangle$, the Min-Heap contains the exact $K$ largest elements of $S_m$, and the root $r = \text{heap.Peek()}$ satisfies $r = \min(\text{heap})$.
- **Base Case ($m = K$):**
  The first $K$ elements are inserted directly. Since the heap contains all $K$ elements seen so far, it trivially contains the top-$K$ elements of $S_K$. By the min-heap property, $r = \min(S_K)$.
- **Inductive Step:**
  Assume the hypothesis holds for prefix $S_m$. Let incoming element be $x_{m+1}$.
  - Let $T_m$ be the multiset of the $K$ largest elements of $S_m$.
  - The top-$K$ largest elements of $S_{m+1}$ are mathematically defined as:
    $$T_{m+1} = \begin{cases} T_m & \text{if } x_{m+1} \le r \\ (T_m \setminus \{r\}) \cup \{x_{m+1}\} & \text{if } x_{m+1} > r \end{cases}$$
  - **Case 1 ($x_{m+1} \le r$):** Since $r = \min(T_m)$, $x_{m+1}$ is $\le$ every element in $T_m$. Thus $x_{m+1}$ cannot belong to the top-$K$ elements of $S_{m+1}$. The algorithm discards $x_{m+1}$. The heap remains $T_m = T_{m+1}$.
  - **Case 2 ($x_{m+1} > r$):** Since $x_{m+1} > r$, $x_{m+1}$ is strictly larger than the smallest element in $T_m$. Therefore, $r$ is no longer among the top-$K$ elements and must be evicted, replaced by $x_{m+1}$. The algorithm executes `EnqueueDequeue(x_{m+1})`, which removes $r$ and inserts $x_{m+1}$, restoring the min-heap invariant.
  - The new root is the minimum element of the updated set $T_{m+1}$.
- By induction, after processing all $N$ elements, the heap contains the exact top-$K$ elements of the entire stream. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Archetype | Concrete Input Instance | Failure Mode / Danger | Defensive Guard & Mitigation |
| :--- | :--- | :--- | :--- |
| **Stream Length Smaller Than $K$** | $N = 2, K = 5$ | Heap never fills; attempting to pop $K$ elements throws exception | Return whatever elements are currently in the heap (`heap.Count` elements) |
| **$K = 1$ (Finding Extremum)** | $K = 1$ | Unnecessary heap overhead | Min-Heap of size 1 reduces to simple running scalar tracking ($O(N)$ time, $O(1)$ space) |
| **All Stream Elements Identical** | Stream of all `5`s | Indiscriminate popping or threshold churn | `x > heap.Peek()` strictly fails when $x == \text{root}$, discarding duplicates in $O(1)$ |
| **Ties in Compound Comparators** | Frequency match: `"apple": 3`, `"banana": 3` | Undefined alphabetical ordering | Compound comparator: primary sort by frequency, secondary sort by `string.CompareOrdinal` |

---

## 2. 🎬 DEMONSTRATE: From-Scratch Production Implementation

Below is the complete production-grade C# implementation of the generic bounded Top-K filter:

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedHeaps.Day110
{
    public static class BoundedTopKFilter
    {
        /// <summary>
        /// Extracts the top K largest elements from an arbitrary stream in O(N log K) time
        /// and strictly Theta(K) auxiliary memory using a bounded Min-Heap.
        /// </summary>
        public static List<T> FindTopKLargest<T>(IEnumerable<T> stream, int k) where T : IComparable<T>
        {
            if (k <= 0) return new List<T>();

            // Min-Heap of size K: smallest element at the root
            var minHeap = new PriorityQueue<T, T>();

            foreach (var item in stream)
            {
                if (minHeap.Count < k)
                {
                    minHeap.Enqueue(item, item);
                }
                else if (item.CompareTo(minHeap.Peek()) > 0)
                {
                    minHeap.EnqueueDequeue(item, item);
                }
            }

            var result = new List<T>(minHeap.Count);
            while (minHeap.Count > 0)
            {
                result.Add(minHeap.Dequeue());
            }

            // Optional: reverse to return in descending order (largest first)
            result.Reverse();
            return result;
        }
    }

    // =========================================================================
    // PRODUCTION VERIFICATION TEST SUITE
    // =========================================================================

    public static class Program
    {
        public static void Main()
        {
            Console.WriteLine("=================================================================");
            Console.WriteLine("  RUNNING DAY 110: TOP-K STREAMING FILTER VERIFICATION SUITE     ");
            Console.WriteLine("=================================================================");

            TestStandardTopK();
            TestKGreaterThanStreamLength();
            TestIdenticalElements();

            Console.WriteLine("\n[SUCCESS] ALL VERIFICATION TESTS PASSED!");
        }

        private static void TestStandardTopK()
        {
            int[] stream = { 4, 1, 7, 3, 8, 5, 2, 9 };
            var top3 = BoundedTopKFilter.FindTopKLargest(stream, 3);

            // Expected Top 3: [9, 8, 7]
            Debug.Assert(top3.Count == 3);
            Debug.Assert(top3[0] == 9);
            Debug.Assert(top3[1] == 8);
            Debug.Assert(top3[2] == 7);

            Console.WriteLine("✔ TestStandardTopK passed.");
        }

        private static void TestKGreaterThanStreamLength()
        {
            int[] stream = { 10, 20 };
            var result = BoundedTopKFilter.FindTopKLargest(stream, 5);

            Debug.Assert(result.Count == 2);
            Debug.Assert(result[0] == 20);
            Debug.Assert(result[1] == 10);

            Console.WriteLine("✔ TestKGreaterThanStreamLength passed.");
        }

        private static void TestIdenticalElements()
        {
            int[] stream = { 5, 5, 5, 5, 5 };
            var result = BoundedTopKFilter.FindTopKLargest(stream, 3);

            Debug.Assert(result.Count == 3);
            Debug.Assert(result[0] == 5 && result[1] == 5 && result[2] == 5);

            Console.WriteLine("✔ TestIdenticalElements passed.");
        }
    }
}
```

---

## 3. 🥊 PRACTICE: High-Frequency Problem Walkthroughs

### Problem 1: LeetCode 347 — Top K Frequent Elements (Medium)

> Given an integer array `nums` and an integer `k`, return *the* `k` *most frequent elements*. You may return the answer in **any order**.
>
> **Constraints:**
> - $1 \le nums.Length \le 10^5$
> - $-10^4 \le nums[i] \le 10^4$
> - `k` is in the range $[1, \text{number of unique elements}]$.
> - The answer is **guaranteed** to be unique.

#### Production C# Implementation (Frequency Map + Min-Heap of Size $K$)

```csharp
using System.Collections.Generic;

namespace AdvancedHeaps.Day110
{
    public static class TopKFrequentSolver
    {
        public static int[] TopKFrequent(int[] nums, int k)
        {
            // Step 1: Frequency map O(N)
            var freqMap = new Dictionary<int, int>();
            foreach (int num in nums)
            {
                freqMap[num] = freqMap.GetValueOrDefault(num, 0) + 1;
            }

            // Step 2: Min-Heap of capacity K (stores (number, frequency), priority is frequency)
            var minHeap = new PriorityQueue<int, int>();

            foreach (var (num, freq) in freqMap)
            {
                if (minHeap.Count < k)
                {
                    minHeap.Enqueue(num, freq);
                }
                else
                {
                    // If current frequency beats the smallest frequency in top K
                    minHeap.TryPeek(out _, out int minFreq);
                    if (freq > minFreq)
                    {
                        minHeap.EnqueueDequeue(num, freq);
                    }
                }
            }

            // Step 3: Extract results
            int[] result = new int[k];
            for (int i = 0; i < k; i++)
            {
                result[i] = minHeap.Dequeue();
            }

            return result;
        }
    }
}
```

- **Time Complexity:** $O(N + U \log K)$ where $U \le N$ is unique numbers. Strictly better than $O(N \log N)$.
- **Space Complexity:** $O(U + K)$ memory.

---

### Problem 2: LeetCode 692 — Top K Frequent Words (Medium)

> Given an array of strings `words` and an integer `k`, return *the* `k` *most frequent strings*.
> Return the answer **sorted by the frequency from highest to lowest**. Sort words with the same frequency by their **lexicographical order**.

#### The Compound Comparator Insight
We use a **Min-Heap of size $K$**:
- For frequency: we want higher frequency, so smaller frequency is evicted first (normal min-heap order).
- For words with identical frequency: we want lexicographically smaller words in the final result, so **lexicographically larger words must be evicted first**!
- Therefore, in our Min-Heap comparer:
  - Higher frequency is considered "greater" (stays in heap).
  - Smaller frequency is considered "smaller" (evicted first).
  - On equal frequency, lexicographically smaller word is considered "greater" (stays in heap).

#### Production C# Implementation

```csharp
using System;
using System.Collections.Generic;

namespace AdvancedHeaps.Day110
{
    public static class TopKFrequentWordsSolver
    {
        private sealed class WordFrequencyComparer : IComparer<(string Word, int Freq)>
        {
            public int Compare((string Word, int Freq) a, (string Word, int Freq) b)
            {
                // Primary sort: Frequency ascending (so smaller frequency is at root of Min-Heap)
                int freqComp = a.Freq.CompareTo(b.Freq);
                if (freqComp != 0) return freqComp;

                // Secondary sort: Word lexicographically descending
                // (so alphabetically larger word is at root and evicted first!)
                return string.CompareOrdinal(b.Word, a.Word);
            }
        }

        public static IList<string> TopKFrequent(string[] words, int k)
        {
            var freqMap = new Dictionary<string, int>();
            foreach (var word in words)
            {
                freqMap[word] = freqMap.GetValueOrDefault(word, 0) + 1;
            }

            var comparer = new WordFrequencyComparer();
            var minHeap = new PriorityQueue<(string Word, int Freq), (string Word, int Freq)>(comparer);

            foreach (var kvp in freqMap)
            {
                var entry = (Word: kvp.Key, Freq: kvp.Value);

                if (minHeap.Count < k)
                {
                    minHeap.Enqueue(entry, entry);
                }
                else if (comparer.Compare(entry, minHeap.Peek()) > 0)
                {
                    minHeap.EnqueueDequeue(entry, entry);
                }
            }

            var result = new List<string>(k);
            while (minHeap.Count > 0)
            {
                result.Add(minHeap.Dequeue().Word);
            }

            result.Reverse();
            return result;
        }
    }
}
```

---

## 4. 🔬 VERIFY: Production Quality Checklist & Daily Checkpoint

### Production Quality Verification Checklist
- [x] **Min-Heap for Largest Extrema:** Correctly used a Min-Heap of size $K$ to filter the $K$ largest items.
- [x] **Compound Tie-Breaking:** Inverted secondary string comparison to ensure lexicographically larger words are evicted first from the Min-Heap.
- [x] **Optimal EnqueueDequeue:** Single-pass root replacement avoiding double sifting overhead.
- [x] **Strict $O(K)$ Working Set:** Heap size never exceeds $K$, guaranteeing minimal memory footprint.

---

### 💡 Daily Checkpoint Answer

> **Question:** When finding the $K$ largest elements, why do we use a Min-Heap of size $K$ rather than a Max-Heap of size $K$?

**Architectural Answer:**
1. **The Role of the Root in a Bounded Heap:**
   - In any heap of bounded capacity $K$, the element at the root (`Peek()`) is the only element that can be inspected in $O(1)$ time without searching the rest of the array.
   - Therefore, the root must represent the **admission threshold**—the element that an incoming candidate must beat in order to earn a spot in the top $K$.
2. **Why Min-Heap Succeeds:**
   - A Min-Heap of size $K$ contains the $K$ largest candidates seen so far.
   - Its root is the **minimum of these $K$ candidates** (i.e. the $K$-th largest element).
   - When a new element $X$ arrives:
     - If $X > \text{root}$, $X$ is larger than at least one of our top-$K$ elements! We pop the root (the smallest of the top-$K$) and insert $X$.
     - If $X \le \text{root}$, $X$ is smaller than all $K$ current members of the top-$K$, so we can safely discard $X$ in $O(1)$ time.
3. **Why Max-Heap Fails:**
   - In a Max-Heap of size $K$, the root is the **maximum of the $K$ elements** (the single largest element).
   - When a new element $X$ arrives and $X < \text{root}$, you have **no idea** whether $X$ is larger or smaller than the other $K-1$ elements in the heap! To find out, you would have to inspect all elements ($O(K)$ time), defeating the entire purpose of using a heap.
   - Therefore, **a Min-Heap is mathematically required to track the $K$ largest elements**, while **a Max-Heap is required to track the $K$ smallest elements**.
