---
title: "Week 17 — Day 113: Dual-Heap Pattern & Dynamic Running Stream Median"
---

# Week 17 — Day 113: Dual-Heap Pattern & Dynamic Running Stream Median

Welcome to **Day 113 of your DSA Mastery Journey** and the commencement of **Week 17: Advanced Priority Queues, Streaming Extrema & Multi-Way Merging**!

In Week 16, you laid the hardware-aligned foundation of priority queues: you mastered implicit array layouts, derived parent-child arithmetic, proved Floyd’s $\Theta(N)$ bottom-up heap construction, implemented in-place HeapSort, and filtered streaming extrema with fixed-size heaps.

Today, we transition from single-heap containers to **multi-heap state coordination**. Specifically, we tackle one of the most celebrated algorithmic designs in computer science: **The Dual-Heap Balancing Architecture**.

By splitting an unbounded, dynamic data stream across two inversely polarized heaps, you will learn how to extract the exact running median—or any arbitrary streaming quantile—in strictly **$\Theta(1)$ time**, while accepting incoming mutations in **$O(\log N)$ time**.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DAY 113: DUAL-HEAP TOPOLOGY                                    │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│     LOWER HALF (SMALL NUMBERS)    │                             │     UPPER HALF (LARGE NUMBERS)    │
│            MAX-HEAP               │                             │            MIN-HEAP               │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Stores elements <= median.      │                             │ • Stores elements >= median.      │
│ • Root = Largest of the small     │                             │ • Root = Smallest of the large    │
│   elements: max(L).               │                             │   elements: min(R).               │
│ • Size: K or K + 1.               │                             │ • Size: K.                        │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                 │                                                                 │
                 └───────────────────────────────┬─────────────────────────────────┘
                                                 ▼
                          ┌─────────────────────────────────────────────┐
                          │         THE ORDER & BALANCE INVARIANTS      │
                          ├─────────────────────────────────────────────┤
                          │ 1. Order Invariant:                         │
                          │    MaxHeap.Peek() <= MinHeap.Peek()         │
                          │ 2. Balance Invariant:                       │
                          │    Size(MaxHeap) - Size(MinHeap) in {0, 1}  │
                          │ 3. Median in O(1):                          │
                          │    - If Odd:  MaxHeap.Peek()                │
                          │    - If Even: (MaxHeap.Peek() +             │
                          │                MinHeap.Peek()) / 2.0        │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* The **Dual-Heap Pattern** partitions a dynamic multiset $S$ into two disjoint sub-heaps, $L$ (Lower Half) and $R$ (Upper Half), such that every element in $L$ is less than or equal to every element in $R$, and the cardinalities of $L$ and $R$ differ by at most 1.
  - *Mathematical Contract:*
    $$\max_{x \in L} x \le \min_{y \in R} y \quad \text{and} \quad |L| \in \{|R|, |R| + 1\}$$
  - *Misconception Check:*
    - *Misconception 1:* "We can just insert into whichever heap currently has fewer elements." **False!** If you insert directly based on size alone, a large number could end up in the Max-Heap or a small number in the Min-Heap, destroying the order invariant $\max(L) \le \min(R)$.
    - *Misconception 2:* "A balanced BST like `std::set` or `SortedSet<T>` is strictly superior because it supports arbitrary removals." **False!** A balanced BST requires $O(\log N)$ time to look up the median element (unless augmented with subtree size counters), incurs 32 to 48 bytes of pointer overhead per node, and causes severe CPU cache thrashing compared to two contiguous array-backed heaps.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *The Bottleneck:* Maintaining a fully sorted dynamic array requires shifting $O(N)$ elements per insertion via insertion sort. A single heap only reveals one extremum (global min or global max), hiding the median in $O(N)$ array inspection.
  - *The Solution:* Dual heaps create an artificial "pinhole" at the median. The median is the boundary between the lower half and the upper half. By exposing the maximum of the lower half and the minimum of the upper half at the roots of two opposing heaps, the median is immediately accessible in $\Theta(1)$ time while insertions remain $O(\log N)$.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Calculating real-time running medians or running percentiles (P50, P90, P99) over high-frequency data streams.
    - Sliding window median calculations where the window size $K$ shifts continuously.
    - When read frequency (`FindMedian`) far exceeds write frequency (`AddNum`), demanding strictly $O(1)$ read latency.
  - *When to Avoid / Failure Modes:*
    - When you need full sorted output: Dual heaps only expose the median; the remaining elements remain partially ordered.
    - High-volume random deletions without sliding window context: arbitrary deletion in a standard binary heap requires $O(N)$ linear scans unless augmented with hash maps or lazy deletion tombstones.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Stored as two flat array allocations `T[]` on the managed heap. If each heap contains $< 10,000$ primitives, both live in Generation 0 ephemeral heap with zero interior pointer overhead.
  - *Hardware Cache Locality:* Because operations only touch the root and ancestor spines during sifting, both heaps enjoy high L1/L2 cache residency. Roots `lower[0]` and `upper[0]` are always cache-hot.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To find the dynamic median of a data stream in $O(1)$ time, I partition the numbers into two balanced heaps: a Max-Heap holding the smaller half and a Min-Heap holding the larger half. I maintain two invariants: the order invariant, where the Max-Heap's root is less than or equal to the Min-Heap's root, and the balance invariant, where the Max-Heap holds equal or exactly one more element than the Min-Heap. On insertion, I route the element through the Max-Heap into the Min-Heap, and rebalance sizes. The median is either the Max-Heap root if the count is odd, or the average of both roots if even."
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:* `FindMedian`: $\Theta(1)$ time, $\Theta(1)$ space. `AddNum`: $\Theta(\log N)$ time, $\Theta(1)$ auxiliary space. Total space: $\Theta(N)$.

---

### 1.1 Physical Mental Model — Two Facing Funnels & The Median Seam

**Everyday Analogy: Two Funnels Touching Spout-to-Spout**

Imagine taking two funnels and pressing their narrow spouts together tip-to-tip:
- **Left Funnel (Lower Half — Max-Heap):** Holds all the smaller numbers. Because it's a Max-Heap, its largest element rises to the narrow spout: $\max(\text{Lower Half})$!
- **Right Funnel (Upper Half — Min-Heap):** Holds all the larger numbers. Because it's a Min-Heap, its smallest element drops to the narrow spout: $\min(\text{Upper Half})$!

```
LOWER HALF (Max-Heap)                      UPPER HALF (Min-Heap)
   Holds smaller 50%                           Holds larger 50%
┌─────────────────────┐                     ┌─────────────────────┐
│  1,  3,  5          │                     │         13, 17, 20  │
│         \           │                     │        /            │
│          ▼          │                     │       ▼             │
│    Root: [ 7 ] ─────┼───── MEDIAN SEAM ───┼───── [ 11 ] :Root   │
└─────────────────────┘                     └─────────────────────┘
                          ▲             ▲
                 Max of Lower Half   Min of Upper Half
```

---

**The Median is Instantly Visible at the Seam in $O(1)$ Time:**

- **If Total Elements is ODD ($|L| = |R| + 1$):**
  The left funnel holds exactly one more element than the right funnel.
  The median is simply the left spout: `lower.Peek()`!
- **If Total Elements is EVEN ($|L| = |R|$):**
  The median is the exact average of the two spouts touching at the seam:
  $$\text{Median} = \frac{\text{lower.Peek()} + \text{upper.Peek()}}{2.0}$$

---

**The 2-Phase Routing Rule for New Incoming Numbers:**

Never insert based on size alone! A large number could sneak into the lower half:
1. **Push to Left, Pop to Right:** Always drop the new number into `lower` (Max-Heap) first, then immediately pop `lower.ExtractMax()` and push it into `upper` (Min-Heap). This guarantees that every element in `upper` is $\ge$ every element in `lower`!
2. **Rebalance Size:** If `upper` has more elements than `lower`, pop `upper.ExtractMin()` and push it back to `lower`.
   Now $|L| \in \{|R|, |R| + 1\}$ is restored in $O(\log N)$ time!

---

### 1.2 The Dual-Heap Balancing Invariant & Slicing the Stream

Let a dynamic stream of $N$ elements be sorted conceptually as $x_1 \le x_2 \le \dots \le x_N$.

We partition this sequence into two halves:
$$\text{Lower Half } L = \{x_1, x_2, \dots, x_{\lceil N/2 \rceil}\}$$
$$\text{Upper Half } R = \{x_{\lceil N/2 \rceil + 1}, \dots, x_N\}$$

To track the boundary between $L$ and $R$ without maintaining full sort order:
1. $L$ is backed by a **Max-Heap** (`lower`). The root is $\max(L) = x_{\lceil N/2 \rceil}$.
2. $R$ is backed by a **Min-Heap** (`upper`). The root is $\min(R) = x_{\lceil N/2 \rceil + 1}$.

```
Conceptually Sorted Sequence:
[ 1,  3,  5,  7 ] | [ 11,  13,  17 ]
└───────┬───────┘   └───────┬───────┘
        ▼                   ▼
    Max-Heap             Min-Heap
    (Lower)              (Upper)
     [ 7 ]                [ 11 ]
    /     \              /      \
  [ 5 ]   [ 3 ]        [ 13 ]   [ 17 ]
  /
[ 1 ]

Median = lower.Peek() = 7 (Odd count: 7 elements)
```

#### The Invariant Formulation
1. **The Order Invariant:**
   $$\forall a \in L, \forall b \in R: a \le b \iff \text{lower.Peek()} \le \text{upper.Peek()}$$
2. **The Size/Balance Invariant:**
   $$|L| - |R| \in \{0, 1\}$$
   - If $N$ is even: $|L| = |R| = N / 2$.
   - If $N$ is odd: $|L| = (N + 1) / 2$ and $|R| = (N - 1) / 2$.
3. **The Median Extraction Equation:**
   $$\text{Median} = \begin{cases} \text{lower.Peek()}, & \text{if } |L| > |R| \\ \dfrac{\text{lower.Peek()} + \text{upper.Peek()}}{2.0}, & \text{if } |L| == |R| \end{cases}$$

---

### 1.2 Routing Mechanics: Why Direct Insertion Fails

A critical pitfall when implementing dual heaps is attempting to insert an incoming number directly into `lower` or `upper` using a naïve size comparison:

```
// NAIVE DANGEROUS LOGIC:
if (lower.Count <= upper.Count)
    lower.Push(num);
else
    upper.Push(num);
```

**Why this fails:** Suppose `lower` contains `[10]` and `upper` contains `[20]`. Now `num = 25` arrives. Since sizes are equal, the naïve logic pushes `25` into `lower`. Now `lower.Peek() == 25`, but `upper.Peek() == 20`! The order invariant $\text{lower.Peek()} \le \text{upper.Peek()}$ is violated ($25 \le 20$ is **false**).

#### The Elegant Cross-Routing Algorithm
To preserve the order invariant without branching into complex nested conditional trees:
1. **Step 1 (Filter through Lower):** Always insert the new element into `lower` (Max-Heap).
2. **Step 2 (Bubble Extrema to Upper):** Pop the maximum element from `lower` and push it into `upper` (Min-Heap). This guarantees that every element in `upper` is strictly greater than or equal to everything remaining in `lower`.
3. **Step 3 (Rebalance Sizes):** If `upper.Count > lower.Count`, pop the minimum element from `upper` and push it back into `lower`.

```
====================================================================================================
                        CROSS-ROUTING PIPELINE: INSERTING num = 25
====================================================================================================
State Before: lower = [10], upper = [20]

1. Push 25 into lower:
   lower = [25, 10]

2. Pop max from lower (25) and push to upper:
   lower = [10]
   upper = [20, 25]  <-- Order invariant strictly maintained!

3. Check Balance:
   lower.Count = 1, upper.Count = 2. upper.Count > lower.Count!
   Pop min from upper (20) and push to lower:
   lower = [20, 10]
   upper = [25]

State After: lower.Peek() = 20, upper.Peek() = 25. Order & Balance Invariants 100% Preserved!
====================================================================================================
```

This 3-step pipeline guarantees invariant safety under all possible input permutations with zero special cases!

---

### 1.3 Hardware Systems Dive: Dual Flat Arrays vs. Balanced Tree Nodes

```
Memory Layout Architecture:

1. Balanced BST (std::multiset / Red-Black Tree):
   ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
   │ Node (num=10) │ ───> │ Node (num=20) │ ───> │ Node (num=25) │
   │ 48 Bytes      │      │ 48 Bytes      │      │ 48 Bytes      │
   └───────────────┘      └───────────────┘      └───────────────┘
   • 48 bytes per node (Object header, pointers, color, value).
   • Finding median requires augmenting nodes with subtree sizes + pointer chasing.
   • High GC pressure and constant L1/L2 cache misses.

2. Dual Flat Heaps (MaxHeap + MinHeap):
   lower: [ 20 | 10 |  5 |  3 ]  (Contiguous 4-byte integers in L1 Cache)
   upper: [ 25 | 30 | 45 | 50 ]  (Contiguous 4-byte integers in L1 Cache)
   • 4 bytes per integer. Zero pointer overhead.
   • Roots lower[0] and upper[0] reside permanently in CPU L1 data cache.
   • Sifting touches log(N) contiguous indices, activating hardware prefetchers.
```

---

### 1.4 ⚙️ Core Operations Deep-Dive: Dual-Heap Balancing & Running Stream Extrema

#### Dimension 1: Operation Contract & Big-O Bounds

| Operation | Input Signature | Output / Post-condition | Time Complexity | Space Complexity | Invariants Maintained |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AddNum` | `void AddNum(int num)` | `num` inserted into stream; heaps rebalanced | $\Theta(\log N)$ | $\Theta(1)$ amortized | Order & Size Invariants |
| `FindMedian` | `double FindMedian()` | Returns exact mathematical median of stream | $\Theta(1)$ | $\Theta(1)$ | None (Read-only) |
| `BalanceHeaps`| `void BalanceHeaps()` | Ensures $\|L\| - \|R\| \in \{0, 1\}$ | $\Theta(\log N)$ | $\Theta(1)$ | Size Invariant |

- **Pre-conditions:** For `FindMedian()`, total elements $N \ge 1$. Throws `InvalidOperationException` if called on an empty stream.
- **Post-conditions:** `FindMedian()` never mutates the underlying heap buffers.

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                           [ AddNum(num) ]
                                  │
                                  ▼
                     Push num into Max-Heap (lower)
                                  │
                                  ▼
               Extract max from lower and push to upper
                                  │
                                  ▼
             Is upper.Count > lower.Count?
                        /               \
                  YES  /                 \  NO
                      ▼                   ▼
           Extract min from upper      Done (Sizes Valid)
           and push to lower
                      │
                      ▼
             Done (Sizes Valid)
```

```
                          [ FindMedian() ]
                                  │
                                  ▼
                          Is TotalCount == 0?
                             /          \
                       YES  /            \  NO
                           ▼              ▼
                 Throw Exception     Is TotalCount Odd?
                                        /          \
                                  YES  /            \  NO
                                      ▼              ▼
                              Return lower.Peek()   Return (lower.Peek() + 
                                                            upper.Peek()) / 2.0
```

---

#### Dimension 3: Visual ASCII State Transitions

Trace the dual-heap state through the stream: `[5, 15, 1, 3]`:

```
1. AddNum(5):
   - lower.Push(5) -> lower: [5]
   - upper.Push(lower.Pop()) -> upper: [5], lower: []
   - upper.Count (1) > lower.Count (0) -> lower.Push(upper.Pop())
   - End State: lower = [5], upper = []
   - Median: 5.0

2. AddNum(15):
   - lower.Push(15) -> lower: [15, 5]
   - upper.Push(lower.Pop()) -> upper: [15], lower: [5]
   - upper.Count (1) <= lower.Count (1) -> No rebalance
   - End State: lower = [5], upper = [15]
   - Median: (5 + 15) / 2.0 = 10.0

3. AddNum(1):
   - lower.Push(1) -> lower: [5, 1]
   - upper.Push(lower.Pop()) -> upper: [5, 15], lower: [1]
   - upper.Count (2) > lower.Count (1) -> lower.Push(upper.Pop()) -> lower: [5, 1], upper: [15]
   - End State: lower = [5, 1], upper = [15]
   - Median: lower.Peek() = 5.0

4. AddNum(3):
   - lower.Push(3) -> lower: [5, 1, 3]
   - upper.Push(lower.Pop()) -> upper: [5, 15], lower: [3, 1]
   - upper.Count (2) <= lower.Count (2) -> No rebalance
   - End State: lower = [3, 1], upper = [5, 15]
   - Median: (3 + 5) / 2.0 = 4.0
```

---

#### Dimension 4: Invariant Preservation Proof

**Theorem:** The cross-routing insertion algorithm preserves both the Order Invariant ($\max(L) \le \min(R)$) and the Balance Invariant ($|L| \in \{|R|, |R| + 1\}$) for all $N \ge 0$.

*Proof by Mathematical Induction:*
1. **Base Case ($N = 0$):** Both heaps are empty. All invariants vacuously hold.
2. **Inductive Hypothesis:** Assume after inserting $k$ elements, the invariants hold:
   $\max(L_k) \le \min(R_k)$ and $|L_k| - |R_k| \in \{0, 1\}$.
3. **Inductive Step (Inserting $(k+1)$-th element $x$):**
   - In Step 1, $x$ is inserted into $L$, forming $L' = L_k \cup \{x\}$.
   - In Step 2, $m = \max(L')$ is popped from $L'$ and pushed into $R_k$, forming $R' = R_k \cup \{m\}$ and $L'' = L' \setminus \{m\}$.
     - Since $m = \max(L')$, for all $y \in L''$, $y \le m$.
     - Furthermore, by inductive hypothesis, $m \ge \max(L_k)$. Since $\max(L_k) \le \min(R_k)$, if $x \le \max(L_k)$ then $m = \max(L_k) \le \min(R_k)$. If $x > \max(L_k)$, then $m = x$. In either case, $m \le \min(R_k)$ or $m$ integrates consistently into $R'$, ensuring $\forall y \in L'', \forall z \in R': y \le z$.
   - In Step 3, we analyze cardinality:
     - Case A ($k$ is even): $|L_k| = |R_k| = m$.
       - After Step 2: $|L''| = m$, $|R'| = m + 1$.
       - Since $|R'| > |L''|$, Step 3 pops $\min(R')$ and pushes to $L''$.
       - Final sizes: $|L_{k+1}| = m + 1$, $|R_{k+1}| = m$. Balance invariant $|L| - |R| = 1$ is satisfied.
     - Case B ($k$ is odd): $|L_k| = m + 1$, $|R_k| = m$.
       - After Step 2: $|L''| = m + 1$, $|R'| = m + 1$.
       - Since $|R'| \le |L''|$, Step 3 does nothing.
       - Final sizes: $|L_{k+1}| = m + 1$, $|R_{k+1}| = m + 1$. Balance invariant $|L| - |R| = 0$ is satisfied.
   - Therefore, both invariants hold for $k+1$. By mathematical induction, the algorithm is correct for all $N$. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Scenario / Edge Case | Concrete Input | Danger / Pitfall | Guard / Architectural Resolution |
| :--- | :--- | :--- | :--- |
| **Empty Heap Read** | Call `FindMedian()` with $N=0$ | Null reference or index out of range | Throw `InvalidOperationException("Stream contains no elements.")` |
| **Single Element** | Stream: `[42]` | Median must be $42.0$ | `lower` holds `42`, `upper` is empty. $|L| > |R| \implies$ returns `lower.Peek()`. |
| **Duplicate Elements** | Stream: `[7, 7, 7, 7]` | Infinite loops in comparison | Heaps use weak order ($\le$ and $\ge$), correctly accommodating duplicates. |
| **Integer Overflow on Average** | Stream: `[int.MaxValue, int.MaxValue]` | `(a + b) / 2` overflows 32-bit signed int to negative value | Compute using 64-bit float math: `a + (b - a) / 2.0` or cast to `double` before addition: `((double)a + b) / 2.0`. |
| **Monotonically Decreasing Stream** | Stream: `[100, 90, 80, 70, 60]` | Unbalanced heap drift | Cross-routing automatically normalizes elements across both heaps. |

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Container(s)

Below is the standalone, production-grade C# implementation of `DualHeapMedianFinder`. It implements self-contained `MaxHeap` and `MinHeap` mechanics using contiguous dynamic arrays with geometric capacity expansion, strictly avoiding any external standard library dependencies for maximum architectural clarity.

```csharp
using System;
using System.Diagnostics;

namespace PriorityQueues.Advanced
{
    /// <summary>
    /// Implements a dynamic running median tracker using the Dual-Heap pattern.
    /// Provides O(log N) insertion and O(1) median inspection.
    /// </summary>
    public sealed class DualHeapMedianFinder
    {
        private readonly Heap<int> _lowerMaxHeap;
        private readonly Heap<int> _upperMinHeap;

        /// <summary>
        /// Initializes a new instance of the DualHeapMedianFinder.
        /// </summary>
        /// <param name="initialCapacity">Initial buffer capacity for each internal heap.</param>
        public DualHeapMedianFinder(int initialCapacity = 16)
        {
            // Max-Heap: higher values have higher priority (b.CompareTo(a))
            _lowerMaxHeap = new Heap<int>(initialCapacity, (a, b) => b.CompareTo(a));

            // Min-Heap: lower values have higher priority (a.CompareTo(b))
            _upperMinHeap = new Heap<int>(initialCapacity, (a, b) => a.CompareTo(b));
        }

        /// <summary>
        /// Gets the total number of elements processed by the stream.
        /// </summary>
        public int Count => _lowerMaxHeap.Count + _upperMinHeap.Count;

        /// <summary>
        /// Inserts an incoming numerical value from the data stream into the dual-heap system.
        /// Maintains both Order and Balance invariants in O(log N) time.
        /// </summary>
        /// <param name="num">The integer value from the stream.</param>
        public void AddNum(int num)
        {
            // Step 1: Always route through the lower Max-Heap
            _lowerMaxHeap.Push(num);

            // Step 2: Transfer the highest element from lower into upper Min-Heap
            // This strictly guarantees that all elements in upper are >= all in lower.
            _upperMinHeap.Push(_lowerMaxHeap.Pop());

            // Step 3: Rebalance sizes so that lower.Count >= upper.Count,
            // with at most 1 excess element in lower.
            if (_upperMinHeap.Count > _lowerMaxHeap.Count)
            {
                _lowerMaxHeap.Push(_upperMinHeap.Pop());
            }

            // Invariant verification assertions for development & testing
            Debug.Assert(_lowerMaxHeap.Count >= _upperMinHeap.Count);
            Debug.Assert(_lowerMaxHeap.Count - _upperMinHeap.Count <= 1);
            if (_lowerMaxHeap.Count > 0 && _upperMinHeap.Count > 0)
            {
                Debug.Assert(_lowerMaxHeap.Peek() <= _upperMinHeap.Peek(), 
                    "Order Invariant Violated: Max(Lower) must be <= Min(Upper)");
            }
        }

        /// <summary>
        /// Retrieves the current median of all elements seen so far in O(1) time.
        /// </summary>
        /// <returns>The exact mathematical median as a 64-bit floating point number.</returns>
        /// <exception cref="InvalidOperationException">Thrown when the stream contains no elements.</exception>
        public double FindMedian()
        {
            if (Count == 0)
            {
                throw new InvalidOperationException("Cannot compute median of an empty data stream.");
            }

            if (_lowerMaxHeap.Count > _upperMinHeap.Count)
            {
                // Odd number of elements: median is exactly the root of the lower Max-Heap
                return _lowerMaxHeap.Peek();
            }

            // Even number of elements: median is the arithmetic mean of both roots.
            // Cast to double prior to addition to prevent 32-bit signed integer overflow.
            return ((double)_lowerMaxHeap.Peek() + _upperMinHeap.Peek()) / 2.0;
        }

        /// <summary>
        /// Internal high-performance generic binary heap backed by a flat contiguous array.
        /// </summary>
        /// <typeparam name="T">Element type.</typeparam>
        private sealed class Heap<T>
        {
            private T[] _buffer;
            private int _count;
            private readonly Comparison<T> _comparison;

            public Heap(int initialCapacity, Comparison<T> comparison)
            {
                if (initialCapacity < 1) initialCapacity = 4;
                _buffer = new T[initialCapacity];
                _count = 0;
                _comparison = comparison ?? throw new ArgumentNullException(nameof(comparison));
            }

            public int Count => _count;

            public T Peek()
            {
                if (_count == 0) throw new InvalidOperationException("Heap is empty.");
                return _buffer[0];
            }

            public void Push(T item)
            {
                if (_count == _buffer.Length)
                {
                    Grow();
                }

                _buffer[_count] = item;
                SiftUp(_count);
                _count++;
            }

            public T Pop()
            {
                if (_count == 0) throw new InvalidOperationException("Heap is empty.");

                T root = _buffer[0];
                _count--;

                if (_count > 0)
                {
                    _buffer[0] = _buffer[_count];
                    _buffer[_count] = default!;
                    SiftDown(0);
                }
                else
                {
                    _buffer[0] = default!;
                }

                return root;
            }

            private void SiftUp(int index)
            {
                T item = _buffer[index];
                while (index > 0)
                {
                    int parentIndex = (index - 1) >> 1;
                    T parent = _buffer[parentIndex];

                    // If item has lower priority than parent, sifting is complete
                    if (_comparison(item, parent) >= 0)
                    {
                        break;
                    }

                    _buffer[index] = parent;
                    index = parentIndex;
                }
                _buffer[index] = item;
            }

            private void SiftDown(int index)
            {
                T item = _buffer[index];
                int half = _count >> 1; // Leaf nodes have no children

                while (index < half)
                {
                    int leftChild = (index << 1) + 1;
                    int rightChild = leftChild + 1;
                    int bestChild = leftChild;

                    if (rightChild < _count && _comparison(_buffer[rightChild], _buffer[leftChild]) < 0)
                    {
                        bestChild = rightChild;
                    }

                    if (_comparison(_buffer[bestChild], item) >= 0)
                    {
                        break;
                    }

                    _buffer[index] = _buffer[bestChild];
                    index = bestChild;
                }
                _buffer[index] = item;
            }

            private void Grow()
            {
                int newCapacity = _buffer.Length * 2;
                T[] newBuffer = new T[newCapacity];
                Array.Copy(_buffer, newBuffer, _count);
                _buffer = newBuffer;
            }
        }
    }

    /// <summary>
    /// Self-testing verification harness.
    /// </summary>
    public static class DualHeapProgram
    {
        public static void Main()
        {
            Console.WriteLine("Running Dual-Heap Median Finder Verification Suite...");

            var finder = new DualHeapMedianFinder();

            // Test Case 1: Sequential insertions
            finder.AddNum(1);
            Debug.Assert(Math.Abs(finder.FindMedian() - 1.0) < 1e-9);

            finder.AddNum(2);
            Debug.Assert(Math.Abs(finder.FindMedian() - 1.5) < 1e-9);

            finder.AddNum(3);
            Debug.Assert(Math.Abs(finder.FindMedian() - 2.0) < 1e-9);

            // Test Case 2: Out of order stream
            var randomizedFinder = new DualHeapMedianFinder();
            int[] stream = { 41, 35, 62, 4, 97, 108, 12 };
            // Sorted conceptual: [4, 12, 35, 41, 62, 97, 108] -> Median is 41

            foreach (int val in stream)
            {
                randomizedFinder.AddNum(val);
            }
            Debug.Assert(Math.Abs(randomizedFinder.FindMedian() - 41.0) < 1e-9, 
                $"Expected 41.0, got {randomizedFinder.FindMedian()}");

            // Test Case 3: Integer Overflow Guard Test
            var overflowFinder = new DualHeapMedianFinder();
            overflowFinder.AddNum(int.MaxValue);
            overflowFinder.AddNum(int.MaxValue);
            Debug.Assert(Math.Abs(overflowFinder.FindMedian() - int.MaxValue) < 1e-9, 
                "Integer overflow in median calculation!");

            Console.WriteLine("All 3 verification suites passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### Asymptotic Complexity Breakdown

| Operation | Best Case Time | Average Case Time | Worst Case Time | Space Complexity |
| :--- | :--- | :--- | :--- | :--- |
| `AddNum(num)` | $\Theta(1)$ (no sifting needed) | $\Theta(\log N)$ | $\Theta(\log N)$ (sift down height) | $\Theta(1)$ auxiliary |
| `FindMedian()` | $\Theta(1)$ | $\Theta(1)$ | $\Theta(1)$ | $\Theta(1)$ |
| Total Storage | $\Theta(N)$ | $\Theta(N)$ | $\Theta(N)$ | $\Theta(N)$ (managed arrays) |

### Memory & GC Allocation Mechanics
- **Heap Growth:** Backing arrays allocate on power-of-two boundaries ($16 \to 32 \to 64 \to \dots$). Amortized allocation cost per insertion is $O(1)$.
- **Zero Per-Node Overhead:** In a 64-bit CLR, each primitive integer consumes exactly 4 bytes. An $N=1,000,000$ element stream requires only $\approx 4\text{ MB}$ of memory across both heaps, comfortably residing in Gen 2 without triggering LOH fragmentation. In contrast, a node-based binary tree would consume $\ge 32\text{ MB}$ and create 1 million individual objects for the garbage collector to trace.

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### Problem 1: [LeetCode 295] Find Median from Data Stream (Hard)

#### Problem Statement
The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.

Implement the `MedianFinder` class:
- `MedianFinder()` initializes the object.
- `void addNum(int num)` adds the integer `num` from the data stream to the data structure.
- `double findMedian()` returns the median of all elements so far.

#### Constraints
- $-10^5 \le \text{num} \le 10^5$
- There will be at least one element in the data structure before calling `findMedian`.
- At most $5 \times 10^4$ calls will be made to `addNum` and `findMedian`.

#### Production Solution using .NET 6+ `PriorityQueue<TElement, TPriority>`

```csharp
using System;
using System.Collections.Generic;

public class MedianFinder
{
    // Max-heap stores smaller half: Priority is negated to simulate max-heap
    private readonly PriorityQueue<int, int> _lowerMax;
    // Min-heap stores larger half: Priority is natural integer order
    private readonly PriorityQueue<int, int> _upperMin;

    public MedianFinder()
    {
        _lowerMax = new PriorityQueue<int, int>();
        _upperMin = new PriorityQueue<int, int>();
    }

    public void AddNum(int num)
    {
        // 1. Route into lower max-heap
        _lowerMax.Enqueue(num, -num);

        // 2. Transfer max of lower to upper min-heap
        int lowerMaxVal = _lowerMax.Dequeue();
        _upperMin.Enqueue(lowerMaxVal, lowerMaxVal);

        // 3. Rebalance sizes: lower must have >= upper elements
        if (_upperMin.Count > _lowerMax.Count)
        {
            int upperMinVal = _upperMin.Dequeue();
            _lowerMax.Enqueue(upperMinVal, -upperMinVal);
        }
    }

    public double FindMedian()
    {
        if (_lowerMax.Count > _upperMin.Count)
        {
            return _lowerMax.Peek();
        }

        return ((double)_lowerMax.Peek() + _upperMin.Peek()) / 2.0;
    }
}
```

---

### Problem 2: [LeetCode 480] Sliding Window Median (Hard)

#### Problem Statement
You are given an integer array `nums` and an integer `k`. There is a sliding window of size `k` which is moving from the very left of the array to the very right. You can only see the `k` numbers in the window. Each time the sliding window moves right by one position, return the median of the current window.

#### Architectural Challenge
A sliding window requires not just **adding** incoming elements, but **removing** the outgoing element that falls out of the window. Standard heaps do not support $O(\log K)$ arbitrary deletion.

#### Solution: Dual-Heap with Lazy Deletion
Instead of searching and removing the outgoing element immediately ($O(K)$), we record its removal in a hash table of invalid/stale counts (`_outgoingCounts`). When stale elements appear at the top of either heap, we purge them lazily!

```csharp
using System;
using System.Collections.Generic;

public class SlidingWindowMedianSolution
{
    public double[] MedianSlidingWindow(int[] nums, int k)
    {
        int n = nums.Length;
        double[] result = new double[n - k + 1];

        // Max-heap for lower half, Min-heap for upper half
        var lowerMax = new PriorityQueue<int, long>(); // Priority: -val
        var upperMin = new PriorityQueue<int, long>(); // Priority: +val

        var stale = new Dictionary<int, int>();
        int lowerValidCount = 0;
        int upperValidCount = 0;

        // Helper local functions for lazy pruning
        void Prune(PriorityQueue<int, long> heap)
        {
            while (heap.Count > 0 && stale.TryGetValue(heap.Peek(), out int count) && count > 0)
            {
                int val = heap.Dequeue();
                if (--stale[val] == 0)
                {
                    stale.Remove(val);
                }
            }
        }

        for (int i = 0; i < n; i++)
        {
            // 1. Add incoming element
            int incoming = nums[i];
            if (lowerMax.Count == 0 || incoming <= lowerMax.Peek())
            {
                lowerMax.Enqueue(incoming, -(long)incoming);
                lowerValidCount++;
            }
            else
            {
                upperMin.Enqueue(incoming, (long)incoming);
                upperValidCount++;
            }

            // Rebalance sizes
            if (lowerValidCount > upperValidCount + 1)
            {
                int val = lowerMax.Dequeue();
                upperMin.Enqueue(val, (long)val);
                lowerValidCount--;
                upperValidCount++;
                Prune(lowerMax);
            }
            else if (lowerValidCount < upperValidCount)
            {
                int val = upperMin.Dequeue();
                lowerMax.Enqueue(val, -(long)val);
                upperValidCount--;
                lowerValidCount++;
                Prune(upperMin);
            }

            // 2. Remove outgoing element once window exceeds k
            if (i >= k)
            {
                int outgoing = nums[i - k];
                stale[outgoing] = stale.GetValueOrDefault(outgoing, 0) + 1;

                if (outgoing <= lowerMax.Peek())
                {
                    lowerValidCount--;
                    if (outgoing == lowerMax.Peek()) Prune(lowerMax);
                }
                else
                {
                    upperValidCount--;
                    if (upperMin.Count > 0 && outgoing == upperMin.Peek()) Prune(upperMin);
                }

                // Re-balance after removal
                if (lowerValidCount > upperValidCount + 1)
                {
                    int val = lowerMax.Dequeue();
                    upperMin.Enqueue(val, (long)val);
                    lowerValidCount--;
                    upperValidCount++;
                    Prune(lowerMax);
                }
                else if (lowerValidCount < upperValidCount)
                {
                    int val = upperMin.Dequeue();
                    lowerMax.Enqueue(val, -(long)val);
                    upperValidCount--;
                    lowerValidCount++;
                    Prune(upperMin);
                }
            }

            // 3. Record median when full window formed
            if (i >= k - 1)
            {
                Prune(lowerMax);
                Prune(upperMin);

                if ((k & 1) == 1)
                {
                    result[i - k + 1] = lowerMax.Peek();
                }
                else
                {
                    result[i - k + 1] = ((double)lowerMax.Peek() + upperMin.Peek()) / 2.0;
                }
            }
        }

        return result;
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 1046] Last Stone Weight (Easy):**
   - *Task:* Simulate stone smashing where the two heaviest stones are crushed together repeatedly until at most one remains.
   - *Algorithmic Pattern:* Max-Heap priority queue simulation.
   - *Complexity Target:* $O(N \log N)$ time, $O(N)$ space.

2. **[LeetCode 355] Design Twitter (Medium):**
   - *Task:* Implement a newsfeed system returning the 10 most recent tweets from self and followees.
   - *Algorithmic Pattern:* Multi-way merge of user tweet linked lists using a bounded priority queue.
   - *Complexity Target:* $O(K \log U)$ where $U$ is number of followees and $K=10$.

3. **Asymmetric Quantile Tracker (Hard - Systems Extension):**
   - *Task:* Generalize the dual-heap architecture to maintain an arbitrary percentile $P \in (0, 100)$ (e.g. P99 latency) on a streaming metric.
   - *Invariant Formulation:* $|L| \approx \lfloor N \times (P / 100) \rfloor$ and $|R| \approx \lceil N \times (1 - P / 100) \rceil$.
   - *Complexity Target:* $O(\log N)$ update, $O(1)$ percentile inspection.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Streaming Quantile Architectural Trade-Offs:

                   ┌─────────────────────────────────────────┐
                   │    STREAMING QUANTILE TRACKING ENGINE   │
                   └─────────────────────────────────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│       DUAL-HEAP EXACT MEDIAN         │  │     T-DIGEST / HLL APPROXIMATION     │
├──────────────────────────────────────┤  ├──────────────────────────────────────┤
│ • Strict mathematical exactness.     │  │ • Bounded memory footprint (e.g. 8KB)│
│ • O(N) memory storage.               │  │ • 1% error tolerance on quantiles.   │
│ • Best for financial order books,    │  │ • Best for distributed monitoring,   │
│   HFT execution tracking, and small  │    Prometheus latency histograms, and   │
│   to medium stream sets (N < 10^7).  │    cloud-scale telemetry (N > 10^9).    │
└──────────────────────────────────────┘  └──────────────────────────────────────┘
```

In high-frequency trading (HFT) and micro-latency benchmarking, computing exact median fill latency is vital. The Dual-Heap pattern is embedded directly in market-maker risk gateways to continuously calculate whether fill speeds diverge from the baseline without allocating memory on every tick.

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
In the dual-heap median pattern, why must every incoming element be routed through one heap before settling into the other, rather than inserting directly based on size comparison alone?

### Architectural Model Answer
If we insert an element directly into the smaller heap based on size comparison alone, we violate the **Order Invariant** ($\max(L) \le \min(R)$).

For example, consider a dual-heap state where the lower Max-Heap $L = [10]$ and the upper Min-Heap $R = [20]$. Both heaps have size 1. An incoming element $x = 25$ arrives. A naïve size-based heuristic observes that $|L| = |R|$ and chooses to insert $x$ into $L$ to maintain the balance invariant $|L| = |R| + 1$. 

However, inserting $25$ into $L$ makes $L = [25, 10]$, which places $25$ at the root of the Max-Heap. Now, $\text{lower.Peek()} = 25$, but $\text{upper.Peek()} = 20$. The condition $\max(L) \le \min(R)$ is violated because $25 \not\le 20$. The subsequent `FindMedian()` will return $25.0$, which is false (the true median of $\{10, 20, 25\}$ is $20.0$).

Routing every element through $L$ into $R$ (and then rebalancing back to $L$ if necessary) guarantees that the incoming element is evaluated against all existing extrema. Specifically, popping $\max(L)$ and pushing it into $R$ ensures that every single element in $R$ is mathematically $\ge$ every element left in $L$. Rebalancing based on size afterwards simply restores cardinality without ever disturbing the horizontal ordering boundary.
