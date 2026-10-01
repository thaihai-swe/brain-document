---
title: "Week 16 — Day 109: In-Place HeapSort: Sorting in Θ(N log N) Time and Θ(1) Space"
---

# Week 16 — Day 109: In-Place HeapSort: Sorting in $\Theta(N \log N)$ Time and $\Theta(1)$ Space

Welcome to **Day 109 of your DSA Mastery Journey**!

Yesterday in [Day 108](./Week%2016%20%E2%80%94%20Day%20108:%20Floyd%27s%20Linear%20%CE%98%28N%29%20BuildHeap%20Algorithm%20&%20Mathematical%20Analysis.md), we mastered Floyd's linear $\Theta(N)$ heapification algorithm.

Today, we leverage that linear builder to engineer the classic **In-Place HeapSort Algorithm**:
1. **The Dual-Phase In-Place Architecture:**
   - **Phase 1 (Heapification):** Transforming the raw array into a Max-Heap in $\Theta(N)$ time.
   - **Phase 2 (Sorted Extraction):** Repeatedly extracting the maximum, placing it at the array boundary, and sifting down over the shrinking heap prefix in $\Theta(N \log N)$ time.
2. **The Max-Heap Paradox:** Understanding why an **ascending** sorted array requires a **Max-Heap** (not a Min-Heap) when sorting in-place.
3. **Strict $\Theta(1)$ Auxiliary Space:** Proving how the boundary pointer cleanly separates the shrinking heap from the growing sorted suffix without allocating a single additional byte of heap memory.
4. **Stability Analysis:** Proving why HeapSort is inherently unstable and how long-distance swaps disrupt identical keys.
5. **LeetCode Lab:** Conquering **[LeetCode 912] Sort an Array** (Medium) by implementing in-place HeapSort from scratch to beat strict memory and anti-QuickSort test cases.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 109 ARCHITECTURE                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
         ┌────────────────────────────────────────┴────────────────────────────────────────┐
         ▼                                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       PHASE 1: BULK HEAPIFY       │                             │     PHASE 2: IN-PLACE EXTRACTION  │
│        FLOYD MAX-HEAP: Θ(N)       │                             │       SORTING PASS: Θ(N log N)    │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Unordered array: arr[0..N-1].   │                             │ • Loop end from N-1 down to 1:    │
│ • Bottom-up sift-downs:           │                             │   1. Swap(arr[0], arr[end]).      │
│   for i = (N/2)-1 down to 0:      │                             │      (Max moved to sorted suffix) │
│       SiftDownMax(i, N);          │                             │   2. SiftDownMax(0, end).         │
│ • Array is now a valid Max-Heap!  │                             │      (Heap boundary shrinks!)     │
│ • Root arr[0] is global maximum.  │                             │ • Result: arr is sorted ASCENDING!│
│ • Takes Θ(N) time, O(1) space.    │                             │ • Total Auxiliary Space: O(1)!    │
└───────────────────────────────────┘                             └───────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* **In-Place HeapSort** is a comparison-based sorting algorithm that operates in two phases: it first organizes an array into a Max-Heap, then iteratively swaps the root element with the terminal element of the active heap, shrinking the heap boundary and sifting down the root to produce a fully sorted ascending sequence in $\Theta(N \log N)$ time and $\Theta(1)$ auxiliary space.
  - *Core Invariants:*
    - **Dual-Region Boundary Invariant:** At iteration $k$ (where `end` ranges from $N-1$ down to $1$):
      1. Prefix `arr[0..end]` is a valid Max-Heap of size `end + 1`.
      2. Suffix `arr[end+1..N-1]` is strictly sorted in ascending order.
      3. Every element in the prefix heap is $\le$ every element in the suffix:
         $$\forall i \le \text{end}, \forall j > \text{end}: \quad \text{arr}[i] \le \text{arr}[j]$$
  - *Misconception Check:*
    - *The Max-Heap vs Min-Heap Trap:* Candidates often instinctively think that sorting in ascending order requires a Min-Heap. If you use a Min-Heap in-place, the minimum element is extracted to `arr[0]`, which requires an auxiliary array to store the result, or shifting all elements right ($O(N)$ per extraction $\implies O(N^2)$). A **Max-Heap** places the largest element directly at the tail index `end` in $O(1)$ time, creating an ascending array with zero extra space!
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* MergeSort requires $O(N)$ auxiliary space (allocating auxiliary buffers). QuickSort can degrade to $O(N^2)$ worst-case time on pathological pivot inputs and requires $O(\log N)$ stack recursion.
  - *The HeapSort Guarantee:* HeapSort guarantees **strictly $O(N \log N)$ worst-case time** AND **strictly $O(1)$ auxiliary space** under all possible input permutations!
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Embedded systems, kernel drivers, or real-time mission-critical systems where memory allocation is forbidden ($O(1)$ space requirement) and worst-case $O(N^2)$ latency spikes cannot be tolerated.
  - *When to Avoid / Failure Modes:*
    - When stability is required: HeapSort is **NOT stable** (swapping root to the end scrambles the relative order of duplicate elements).
    - When average-case cache performance is the top priority: QuickSort typically runs $2\times$ to $3\times$ faster than HeapSort in practice because HeapSort's parent-child swaps hop across powers-of-two strides in memory, causing more cache misses.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* 100% in-place mutation of the input array. Consumes $0$ bytes of managed heap memory and $O(1)$ stack frames (iterative sifting).
  - *Production Systems:* Introsort (used in C++ `std::sort` and .NET `Array.Sort`): starts with QuickSort, but switches to **HeapSort** if the recursion depth exceeds $2 \log_2 N$, providing an ironclad guard against $O(N^2)$ denial-of-service attacks.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "HeapSort sorts an array in-place in $\Theta(N \log N)$ worst-case time and $O(1)$ auxiliary space. In Phase 1, I transform the array into a Max-Heap in linear $\Theta(N)$ time using Floyd's bottom-up algorithm. In Phase 2, I repeatedly swap the root maximum at index 0 with the last element of the active heap, shrink the heap boundary, and sift down the new root over the reduced prefix. The extracted maximums naturally accumulate in ascending order from the tail backward, achieving an optimal in-place sort without auxiliary memory."
  - *Interviewer Evaluation Lens:* Checks whether candidate explains why a Max-Heap is used for ascending sort, articulates the dual-region boundary invariant, derives the $O(1)$ space guarantee, and explains why HeapSort is unstable.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:* Best Time: $\Theta(N \log N)$; Average Time: $\Theta(N \log N)$; Worst Time: $\Theta(N \log N)$; Space: Strictly $\Theta(1)$.

---

### 1.1 Physical Mental Model — The Parking Lot & The Shrinking Construction Barrier

**Everyday Analogy: Parking Heavy Trucks in Ascending Order**

Imagine an $N$-stall parking lot numbered $0$ to $N-1$. You must sort $N$ vehicles in ascending order of weight **without using a spare parking lot** ($O(1)$ auxiliary space):

**The Counter-Intuitive Truth: Why use a MAX-Heap for ASCENDING order?**
- In a Max-Heap, the single heaviest vehicle is sitting right at the front gate: **Stall 0**.
- In an ascending lineup, where does the heaviest vehicle belong? **At the very back of the lot (Stall $N-1$)**!
- That is why a Max-Heap is the ultimate in-place engine for ascending sort!

```
Phase 2 In-Place Mechanics:
Stall:      [ 0 ]   [ 1 ]   [ 2 ]   [ 3 ]   │  [ 4 ]  <-- Construction Barrier!
Content:   [ 10 ]   [ 8 ]   [ 7 ]   [ 4 ]   │  [ 3 ]
             ▲                              │    ▲
         HEAVIEST                           │  SWAP!
             └──────────────────────────────┴────┘
```

---

**The Shrinking Barrier Cycle:**

1. **Swap to Tail:** Swap the king (Stall 0) with the vehicle at the current barrier (`arr[end]`). The heaviest vehicle is now locked in its final resting place!
2. **Move Barrier Left:** Move the construction barrier left by 1 stall (`end--`). The sorted wall grows backward from right to left!
3. **SiftDown Stall 0:** The vehicle swapped into Stall 0 is small and misplaced. Sift it down inside the active lot $[0 \dots end]$. The second-heaviest vehicle floats up to Stall 0.
4. **Repeat:** Swap Stall 0 to Stall $N-2$, move barrier, repeat!

```
Array Division at any moment:
┌───────────────────────────────┬───────────────────────────────┐
│ Active Max-Heap [0 .. end]    │ Permanently Sorted Ascending  │
│ (Unsorted heap of smaller items) (Largest items locked in tail)│
└───────────────────────────────┴───────────────────────────────┘
                                ▲
                       Construction Barrier
```

**Zero Allocation:** The entire sort happens inside the original array buffer without a single extra heap or stack allocation!

---

### 1.2 The Dual-Region Boundary Invariant in Action

Trace of Phase 2 on array `[ 10, 8, 7, 4, 3 ]` ($N = 5$, Max-Heap already built):

```
Initial State (end = 4):
[ 10, 8, 7, 4, 3 ]
  <--- Heap ---> | Suffix: []

Step 1 (end = 4):
1. Swap arr[0] (10) with arr[4] (3):
   Array: [ 3, 8, 7, 4 | 10 ]
2. SiftDownMax(0, heapSize = 4):
   - At index 0 (val 3): left=1 (8), right=2 (7). Largest is 8 (idx 1).
   - Swap(0, 1) => [ 8, 3, 7, 4 | 10 ]
   - At index 1 (val 3): left=3 (4). Largest is 4 (idx 3).
   - Swap(1, 3) => [ 8, 4, 7, 3 | 10 ]
Heap Prefix: [ 8, 4, 7, 3 ] | Suffix: [ 10 ]

Step 2 (end = 3):
1. Swap arr[0] (8) with arr[3] (3):
   Array: [ 3, 4, 7 | 8, 10 ]
2. SiftDownMax(0, heapSize = 3):
   - At index 0 (val 3): left=1 (4), right=2 (7). Largest is 7 (idx 2).
   - Swap(0, 2) => [ 7, 4, 3 | 8, 10 ]
Heap Prefix: [ 7, 4, 3 ] | Suffix: [ 8, 10 ]

Step 3 (end = 2):
1. Swap arr[0] (7) with arr[2] (3):
   Array: [ 3, 4 | 7, 8, 10 ]
2. SiftDownMax(0, heapSize = 2):
   - At index 0 (val 3): left=1 (4). Largest is 4 (idx 1).
   - Swap(0, 1) => [ 4, 3 | 7, 8, 10 ]
Heap Prefix: [ 4, 3 ] | Suffix: [ 7, 8, 10 ]

Step 4 (end = 1):
1. Swap arr[0] (4) with arr[1] (3):
   Array: [ 3 | 4, 7, 8, 10 ]
2. SiftDownMax(0, heapSize = 1): Leaf reached immediately.

Final Array: [ 3, 4, 7, 8, 10 ]
Fully sorted in ascending order with ZERO auxiliary space!
```

---

### 1.2 Why HeapSort is NOT Stable

A sorting algorithm is **stable** if elements with identical keys preserve their relative order from the input.
HeapSort is **inherently unstable**:

```
Example Demonstrating Instability:
Input Array with duplicate keys: [ 5_A, 5_B, 3 ]
(Here, 5_A appears BEFORE 5_B in the original array).

Phase 1: BuildMaxHeap on [ 5_A, 5_B, 3 ]:
Index 0 is 5_A, Left child (1) is 5_B, Right child (2) is 3.
Since 5_A >= 5_B and 5_A >= 3, it is already a valid Max-Heap!
Array: [ 5_A, 5_B, 3 ]

Phase 2 (end = 2):
1. Swap arr[0] with arr[2]:
   arr[0] (5_A) swaps with arr[2] (3)!
   Array becomes: [ 3, 5_B, 5_A ]
2. SiftDownMax(0, heapSize = 2):
   At index 0 (val 3), left child is 5_B (idx 1).
   3 < 5_B => Swap(0, 1).
   Array becomes: [ 5_B, 3, 5_A ]

Phase 2 (end = 1):
1. Swap arr[0] (5_B) with arr[1] (3):
   Array becomes: [ 3, 5_B, 5_A ]

LOOK AT THE RESULT:
Sorted Array: [ 3, 5_B, 5_A ]
Notice: 5_B now appears BEFORE 5_A!
Their relative original order was reversed. HeapSort is UNSTABLE!
```

---

### 1.3 ⚙️ Core Operations Deep-Dive: HeapSort Invariants & Complexity Matrix

#### Dimension 1: Operation Contract & Big-O Bounds

##### 1. In-Place HeapSort Contract (`Sort`)
- **Signature:** `void HeapSort<T>(T[] array) where T : IComparable<T>`
- **Pre-conditions:** `array` is a non-null contiguous array of length $N \ge 0$.
- **Post-conditions:** The array elements are permuted in-place such that $\text{array}[0] \le \text{array}[1] \le \dots \le \text{array}[N-1]$.
- **Invariants:**
  1. *Prefix-Suffix Invariant:* At each step `end`, `arr[0..end]` is a valid Max-Heap, and `arr[end+1..N-1]` is sorted with all elements $\ge \max(\text{arr}[0..\text{end}])$.
  2. *Space Complexity:* Auxiliary space is strictly $\Theta(1)$ (no heap or stack allocations).

##### Big-O Operational Complexity Matrix
| Phase / Algorithm | Time (Best) | Time (Avg) | Time (Worst) | Aux Space | Primary Computational Bottleneck |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Phase 1: BuildMaxHeap** | $\Theta(N)$ | $\Theta(N)$ | $\Theta(N)$ | $\Theta(1)$ | Reverse linear scan with in-place swaps |
| **Phase 2: Extraction** | $\Theta(N \log N)$ | $\Theta(N \log N)$ | $\Theta(N \log N)$ | $\Theta(1)$ | Cache line hops down the shrinking tree height |
| **Total HeapSort** | $\mathbf{\Theta(N \log N)}$ | $\mathbf{\Theta(N \log N)}$ | $\mathbf{\Theta(N \log N)}$ | $\mathbf{\Theta(1)}$ | Unstable long-distance swaps disrupting cache locality |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
====================================================================================================
                        IN-PLACE HEAPSORT DECISION TREE
====================================================================================================
Given array of length N:
   │
   ├─► Is N <= 1?
   │      └─► YES: Already sorted! Return immediately.
   │
   └─► For N >= 2:
          │
          ├─► PHASE 1: BuildMaxHeap in Θ(N)
          │      • lastInternal = (N >> 1) - 1;
          │      • For i = lastInternal down to 0:
          │           SiftDownMax(array, i, N);
          │
          └─► PHASE 2: Sorted Extraction Loop in Θ(N log N)
                 • For end = N - 1 down to 1:
                      - Swap(array[0], array[end]);  // Move maximum to sorted suffix
                      - SiftDownMax(array, 0, end);   // Restore heap property over [0, end)
                 • Termination: Entire array is sorted in ascending order!
====================================================================================================
```

---

#### Dimension 3: Visual ASCII State Transitions

##### Complete Execution Matrix for Array of Size $N = 4$
Input: `[ 3, 1, 4, 2 ]`

```
Phase 1: BuildMaxHeap
- lastInternal = (4 / 2) - 1 = 1.
- SiftDownMax(1, 4): index 1 (val 1) has left child 3 (val 2). 2 > 1 => Swap(1, 3).
  Array: [ 3, 2, 4, 1 ]
- SiftDownMax(0, 4): index 0 (val 3) has left 1 (2), right 2 (4). Largest is 4 (idx 2).
  Swap(0, 2) => Array: [ 4, 2, 3, 1 ]
Max-Heap Phase 1 Complete!

Phase 2:
Iteration 1 (end = 3):
- Swap(0, 3): [ 1, 2, 3 | 4 ]
- SiftDownMax(0, heapSize = 3):
  index 0 (val 1) has left 1 (2), right 2 (3). Largest is 3 (idx 2).
  Swap(0, 2) => [ 3, 2, 1 | 4 ]

Iteration 2 (end = 2):
- Swap(0, 2): [ 1, 2 | 3, 4 ]
- SiftDownMax(0, heapSize = 2):
  index 0 (val 1) has left 1 (2). Largest is 2 (idx 1).
  Swap(0, 1) => [ 2, 1 | 3, 4 ]

Iteration 3 (end = 1):
- Swap(0, 1): [ 1 | 2, 3, 4 ]
- SiftDownMax(0, heapSize = 1): Leaf reached immediately.

Final Sorted Array: [ 1, 2, 3, 4 ]!
```

---

#### Dimension 4: Invariant Preservation Proof

##### Loop Invariant Proof for Phase 2
We prove that at the beginning of each iteration of Phase 2 with loop counter `end`:
1. `arr[0..end]` is a valid Max-Heap of size `end + 1`.
2. `arr[end+1..N-1]` contains the $N - 1 - \text{end}$ largest elements of the original array in sorted ascending order.
3. Every element in `arr[0..end]` is $\le$ every element in `arr[end+1..N-1]`.

- **Initialization (`end = N - 1`):**
  Phase 1 constructed a valid Max-Heap on `arr[0..N-1]`. The suffix `arr[N..N-1]` is empty. The invariant trivially holds.
- **Maintenance:**
  Assume the invariant holds for `end = k`.
  1. Since `arr[0..k]` is a valid Max-Heap, `arr[0]` is the maximum element in `arr[0..k]`.
  2. By condition 3, `arr[0]` is $\le$ all elements in `arr[k+1..N-1]`.
  3. Swapping `arr[0]` with `arr[k]` places the largest remaining element at index $k$.
  4. Now `arr[k..N-1]` is sorted, and all elements in `arr[0..k-1]` are $\le \text{arr}[k]$.
  5. The heap boundary shrinks to `k`. The only element violating the heap property is the new root `arr[0]` (the former element from index $k$).
  6. Calling `SiftDownMax(0, k)` restores the Max-Heap property over `arr[0..k-1]` in $O(\log k)$ time.
  7. The invariant holds for `end = k - 1`.
- **Termination (`end = 0`):**
  When `end = 0`, the suffix `arr[1..N-1]` contains the $N-1$ largest elements in sorted order, and `arr[0]` is $\le \text{arr}[1]$. Thus, the entire array `arr[0..N-1]` is sorted in ascending order. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Archetype | Concrete Input Instance | Failure Mode / Danger | Defensive Guard & Mitigation |
| :--- | :--- | :--- | :--- |
| **Empty or 1-Element Array** | `[]` or `[42]` | Out-of-bounds loop indices | Early return `if (array == null || array.Length <= 1) return;` |
| **Already Sorted Array** | `[1, 2, 3, 4, 5]` | Destructive reshuffling | Max-Heap reverses elements initially, then correctly restores them |
| **All Identical Elements** | `[5, 5, 5, 5, 5]` | Unnecessary swaps causing performance degradation | `SiftDownMax` checks `largest != i`; breaks immediately on equality ($O(N)$) |
| **Negative Values** | `[-10, -50, -2, -1]` | Comparison sign errors | Generic `T : IComparable<T>` handles negative two's complement correctly |
| **Two-Element Array** | `[2, 1]` or `[1, 2]` | Loop bounds off-by-one | `end = 1` executes exactly 1 swap, resulting in correct order `[1, 2]` |

---

## 2. 🎬 DEMONSTRATE: From-Scratch Production Implementation

Below is the complete production-grade C# implementation of in-place HeapSort:

```csharp
using System;
using System.Diagnostics;

namespace AdvancedHeaps.Day109
{
    public static class InPlaceHeapSorter
    {
        /// <summary>
        /// Sorts an arbitrary array in-place in ascending order using HeapSort.
        /// Guarantees Theta(N log N) worst-case time and Theta(1) auxiliary space.
        /// </summary>
        public static void HeapSort<T>(T[] array) where T : IComparable<T>
        {
            if (array == null || array.Length <= 1) return;

            int n = array.Length;

            // Phase 1: Build Max-Heap in-place in linear O(N) time
            int lastInternalNode = (n >> 1) - 1;
            for (int i = lastInternalNode; i >= 0; i--)
            {
                SiftDownMax(array, i, n);
            }

            // Phase 2: In-place sorted extraction in O(N log N) time
            for (int end = n - 1; end > 0; end--)
            {
                // Move current maximum (root) to the end of the unsorted region
                Swap(array, 0, end);

                // Restore Max-Heap property over the reduced prefix [0, end)
                SiftDownMax(array, 0, end);
            }
        }

        /// <summary>
        /// Sifts down element i within a bounded Max-Heap of size heapSize.
        /// Iterative implementation guarantees strict O(1) auxiliary stack space.
        /// </summary>
        private static void SiftDownMax<T>(T[] array, int i, int heapSize) where T : IComparable<T>
        {
            while ((i << 1) + 1 < heapSize)
            {
                int largest = i;
                int left = (i << 1) + 1;
                int right = (i << 1) + 2;

                if (array[left].CompareTo(array[largest]) > 0)
                {
                    largest = left;
                }

                if (right < heapSize && array[right].CompareTo(array[largest]) > 0)
                {
                    largest = right;
                }

                if (largest != i)
                {
                    Swap(array, i, largest);
                    i = largest;
                }
                else
                {
                    break;
                }
            }
        }

        private static void Swap<T>(T[] array, int a, int b) =>
            (array[a], array[b]) = (array[b], array[a]);
    }

    // =========================================================================
    // PRODUCTION VERIFICATION TEST SUITE
    // =========================================================================

    public static class Program
    {
        public static void Main()
        {
            Console.WriteLine("=================================================================");
            Console.WriteLine("  RUNNING DAY 109: IN-PLACE HEAPSORT VERIFICATION SUITE          ");
            Console.WriteLine("=================================================================");

            TestSmallArray();
            TestAlreadySorted();
            TestReverseSorted();
            TestDuplicates();
            TestLargeRandomSorting();

            Console.WriteLine("\n[SUCCESS] ALL VERIFICATION TESTS PASSED!");
        }

        private static void TestSmallArray()
        {
            int[] arr = { 3, 1, 4, 2 };
            InPlaceHeapSorter.HeapSort(arr);

            Debug.Assert(IsSorted(arr), "Array should be sorted [1, 2, 3, 4].");
            Console.WriteLine("✔ TestSmallArray passed.");
        }

        private static void TestAlreadySorted()
        {
            int[] arr = { 1, 2, 3, 4, 5 };
            InPlaceHeapSorter.HeapSort(arr);

            Debug.Assert(IsSorted(arr), "Already sorted array should remain sorted.");
            Console.WriteLine("✔ TestAlreadySorted passed.");
        }

        private static void TestReverseSorted()
        {
            int[] arr = { 5, 4, 3, 2, 1 };
            InPlaceHeapSorter.HeapSort(arr);

            Debug.Assert(IsSorted(arr), "Reverse sorted array must be sorted correctly.");
            Console.WriteLine("✔ TestReverseSorted passed.");
        }

        private static void TestDuplicates()
        {
            int[] arr = { 5, 2, 5, 1, 2, 5 };
            InPlaceHeapSorter.HeapSort(arr);

            Debug.Assert(IsSorted(arr), "Array with duplicates must be sorted correctly.");
            Console.WriteLine("✔ TestDuplicates passed.");
        }

        private static void TestLargeRandomSorting()
        {
            var random = new Random(109);
            int[] arr = new int[20_000];

            for (int i = 0; i < arr.Length; i++)
            {
                arr[i] = random.Next(-100_000, 100_000);
            }

            InPlaceHeapSorter.HeapSort(arr);
            Debug.Assert(IsSorted(arr), "Large random array must be sorted.");

            Console.WriteLine("✔ TestLargeRandomSorting passed on 20,000 elements.");
        }

        private static bool IsSorted<T>(T[] array) where T : IComparable<T>
        {
            for (int i = 0; i < array.Length - 1; i++)
            {
                if (array[i].CompareTo(array[i + 1]) > 0)
                    return false;
            }
            return true;
        }
    }
}
```

---

## 3. 🥊 PRACTICE: High-Frequency Problem Walkthroughs

### Problem: LeetCode 912 — Sort an Array (Medium)

> Given an array of integers `nums`, sort the array in ascending order and return it.
> You must solve the problem without using any built-in functions in $O(N \log N)$ time complexity and with the smallest possible space complexity.
>
> **Constraints:**
> - $1 \le nums.Length \le 5 \times 10^4$
> - $-5 \times 10^4 \le nums[i] \le 5 \times 10^4$

---

#### Why QuickSort and MergeSort Can Fail LeetCode 912
LeetCode 912 has pathological anti-sorting test cases:
1. **Anti-QuickSort Cases:** Arrays designed to trigger worst-case $O(N^2)$ recursion in naive QuickSort implementations (e.g. median-of-three killer inputs).
2. **Anti-MergeSort Cases:** Huge arrays that trigger `Memory Limit Exceeded` when allocating $O(N)$ auxiliary buffers repeatedly.
3. **The Solution: HeapSort!**
   - HeapSort is immune to pathological pivot inputs: its worst-case is **strictly guaranteed $O(N \log N)$**.
   - HeapSort uses **strictly $\Theta(1)$ auxiliary space**, consuming zero extra memory!

---

## 4. 🔬 VERIFY: Production Quality Checklist & Daily Checkpoint

### Production Quality Verification Checklist
- [x] **Max-Heap Selection:** Used a Max-Heap to produce an ascending array in-place.
- [x] **Zero Auxiliary Memory:** Sorted in-place using exclusively iterative swaps without allocating secondary arrays.
- [x] **Boundary Shrinkage:** The parameter `heapSize` strictly equals `end` during each sift-down, isolating the sorted suffix.
- [x] **Guaranteed Worst-Case:** Immunity to $O(N^2)$ degradations proven mathematically.

---

### 💡 Daily Checkpoint Answer

> **Question:** Why does in-place HeapSort produce an array sorted in ascending order when using a Max-Heap, rather than a Min-Heap?

**Architectural Answer:**
1. **The In-Place Space Constraint:**
   - In an in-place sort, we cannot allocate a separate output array. The single input array must simultaneously store both the **unprocessed heap** and the **growing sorted result**.
   - If we divide an array of length $N$ into two regions, one region shrinks as the other expands:
     `[ Unprocessed Heap (Prefix) | Processed Sorted Elements (Suffix) ]`
2. **Why Max-Heap Works Perfectly:**
   - In a Max-Heap, the root `arr[0]` is the **maximum element** in the heap prefix.
   - We extract this maximum by swapping `arr[0]` with `arr[end]`.
   - Now, the maximum element sits permanently at index `end`.
   - We decrement `end--`. The heap prefix shrinks to `[0, end-1]`, and the sorted suffix grows from right to left (`end, end+1, ..., N-1`).
   - The largest element goes to the last index ($N-1$), the second largest goes to $N-2$, and so forth.
   - This naturally produces an **ascending sorted array** from left to right!
3. **Why Min-Heap Fails In-Place:**
   - In a Min-Heap, the root `arr[0]` is the **minimum element**.
   - If you swap `arr[0]` with `arr[end]`, the minimum element is placed at index `end` (the tail of the array!).
   - Repeating this process puts smaller elements at the end, which produces a **descending** sorted array, not an ascending one.
   - To make a Min-Heap sort in ascending order in-place, the minimum element would need to stay at the front (`arr[0]`), which would require shifting the remaining $N-1$ elements to the right to make room for the next minimum—turning the algorithm into an $O(N^2)$ disaster!
   - Therefore, **Max-Heap is the only configuration that produces an ascending sort in-place in $\Theta(N \log N)$ time and $\Theta(1)$ space**.
