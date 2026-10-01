---
title: "Week 16 — Day 108: Floyd's Linear Θ(N) BuildHeap Algorithm & Mathematical Analysis"
---

# Week 16 — Day 108: Floyd's Linear $\Theta(N)$ BuildHeap Algorithm & Mathematical Analysis

Welcome to **Day 108 of your DSA Mastery Journey**!

Yesterday in [Day 107](./Week%2016%20%E2%80%94%20Day%20107:%20SiftUp%20Bubbling%20Insertion%20&%20SiftDown%20Extrema%20Extraction%20Mechanics.md), we mastered the dynamic surgery primitives `SiftUp` and `SiftDown` for individual $O(\log N)$ insertions and deletions.

Today, we conquer one of the most surprising and elegant results in algorithmic computer science: **Floyd's Linear $\Theta(N)$ `BuildHeap` Algorithm**:
1. **The Naive Fallacy:** Why building a heap via $N$ sequential `Insert` calls costs $\Theta(N \log N)$ time.
2. **Floyd's Bottom-Up Insight:** Why starting from the last internal node ($\lfloor N/2 \rfloor - 1$) and sifting *down* collapses total work to strictly linear $\Theta(N)$.
3. **The Arithmetico-Geometric Series Proof:** The rigorous mathematical derivation showing $\sum_{h=1}^{\log N} \frac{h}{2^h} = 2$, proving the linear upper bound from first principles.
4. **From-Scratch Production Implementation:** Enhancing our C# heap with in-place bulk construction and automated verification tests.
5. **LeetCode Lab:** Applying linear heap construction to solve **[LeetCode 973] K Closest Points to Origin** (Medium) in optimal time.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 108 ARCHITECTURE                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
         ┌────────────────────────────────────────┴────────────────────────────────────────┐
         ▼                                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       TOP-DOWN (REPEATED INSERT)  │                             │      FLOYD'S BOTTOM-UP BUILDHEAP  │
│           Θ(N log N) WORK         │                             │             Θ(N) WORK             │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Insert elements one by one.     │                             │ • Treat leaves as 1-node heaps.   │
│ • Leaves (N/2 nodes) are at the   │                             │ • Start at last internal node:    │
│   BOTTOM of the tree (height 0).  │                             │   index = (N / 2) - 1.            │
│ • Each leaf must bubble UP        │                             │ • Call SiftDown(i) down to 0.     │
│   through height log N!           │                             │ • Most nodes (N/2 leaves) do ZERO │
│ • Sum: (N/2) * log N = Ω(N log N).│                             │   sifting work! Only root does log│
│ • Wasteful and slow!              │                             │ • Total work <= 2N = Θ(N) linear! │
└───────────────────────────────────┘                             └───────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* **Floyd's `BuildHeap` Algorithm** is an in-place algorithm that transforms an arbitrary, unordered array of $N$ elements into a valid binary heap by executing `SiftDown` on all internal nodes in reverse index order, from $\lfloor N/2 \rfloor - 1$ down to $0$.
  - *Core Invariants:*
    - **Inductive Subtree Invariant:** Before calling `SiftDown(i)`, both the left subtree rooted at $2i+1$ and the right subtree rooted at $2i+2$ are already strictly valid min-heaps. `SiftDown(i)` merges them with parent $i$, establishing a valid min-heap rooted at $i$.
  - *Misconception Check:* Candidates frequently assume that building a heap requires $O(N \log N)$ time because there are $N$ elements and heap operations take $O(\log N)$. This is true for *repeated top-down insertions*, but completely false for *bottom-up Floyd heapification*, which is provably $\Theta(N)$.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Preprocessing a static collection into a priority queue is a common bottleneck in graph algorithms (Dijkstra initialization) and bulk sorting (Phase 1 of HeapSort). Reducing construction time from $O(N \log N)$ to $O(N)$ provides a measurable $2\times$ to $5\times$ speedup on large datasets.
  - *The Architectural Insight:* In any binary tree, **at least half of all nodes are leaves** ($h = 0$). Floyd's algorithm assigns zero work to leaves and $O(1)$ work to the nodes just above them; only the single root node performs $O(\log N)$ work!
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Whenever the entire input array is known upfront (offline batch data), such as initializing HeapSort or finding the top-$K$ elements of a static array.
  - *When to Avoid / Failure Modes:* When elements arrive dynamically over time (online streaming data), individual `Insert` calls ($O(\log N)$) are unavoidable.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Completely in-place within the existing array buffer. Consumes $\Theta(1)$ auxiliary memory and zero garbage collection heap allocations.
  - *Cache Line Dynamics:* Reverse index iteration traverses the array backward from $\approx N/2$ down to $0$, utilizing CPU cache lines efficiently as internal subtrees are combined.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To build a binary heap from an unordered array in linear $O(N)$ time, I use Floyd's algorithm. All nodes from index $N/2$ to $N-1$ are leaves and thus already valid 1-element heaps. I iterate backward from the last non-leaf at index $(N/2)-1$ down to the root at index $0$, calling SiftDown at each node. Because the vast majority of nodes reside near the leaves and do very little work, the summation of node count times node height converges to an arithmetico-geometric series bounded by $2N$, guaranteeing strictly linear $\Theta(N)$ time and $O(1)$ auxiliary space."
  - *Interviewer Evaluation Lens:* Evaluates whether candidate writes the exact starting index `(N / 2) - 1`, explains why leaf nodes require no work, derives the arithmetico-geometric summation $\sum h/2^h = 2$, and contrasts top-down $O(N \log N)$ with bottom-up $O(N)$.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:* Construction Time: Strictly $\Theta(N)$ worst-case; Auxiliary Space: $\Theta(1)$ in-place.

---

### 1.1 Physical Mental Model — The Pyramid Construction Paradox

**Analogy: Hauling Stones up a Pyramid vs. Sinking Stones from the Bottom Up**

Imagine building an ancient stone pyramid with $N = 10,000$ stone blocks:

**Approach A: The Exhausting Top-Down Builder (Calling `Insert` $N$ times $\implies O(N \log N)$)**
- You insert stones one-by-one at the bottom and haul each one upward via `SiftUp`.
- The pyramid gets taller and taller.
- By the time you reach the bottom half of the pyramid ($5,000$ stones!), **every single stone must be dragged up the full height of the pyramid** ($H = \log N$)!
- The vast majority of elements do the maximum amount of work: $\approx \frac{N}{2} \times \log N = O(N \log N)$.

```
Top-Down Insert: The crowd at the bottom does the MOST work!
                 ▲ (1 stone)
                / \
               /   \ (Few stones)
              /     \
             /───────\ (5,000 stones dragged up full height!)  <-- O(N log N) Exhaustion!
```

---

**Approach B: Floyd's Genius Bottom-Up Builder (`BuildHeap` $\implies \Theta(N)$)**
- You dump all $10,000$ stones onto the ground in an arbitrary heap.
- You start fixing nodes from the **bottom up** using `SiftDown`:
  - **Half of all stones ($N/2 = 5,000$ stones)** are leaves (height $h = 0$). They have no children, so they do **EXACTLY 0 SWAPS**!
  - **A quarter ($N/4 = 2,500$ stones)** sit at height $h = 1$. They sink **at most 1 step**!
  - **An eighth ($N/8 = 1,250$ stones)** sit at height $h = 2$. They sink **at most 2 steps**!
  - **ONLY A SINGLE STONE (the root)** sinks the full $\log N$ steps!

```
Floyd's Bottom-Up: The crowd at the bottom does ZERO work!
                 [ 1 stone  ] -> sinks H steps (Max work, but only 1 stone!)
                [  2 stones  ] -> sinks 2 steps
               [   4 stones   ] -> sinks 1 step
              [ 5,000 leaves   ] -> sinks 0 steps! (50% of the entire pyramid does NOTHING!)
```

**The Mathematical Miracle:**
By flipping the direction of work, the elements that do the most work are the **fewest in number** (just 1 root), while the elements that do zero work make up **more than half the entire tree**!
The total work converges to strictly less than $2N$ operations $\implies \mathbf{\Theta(N)}$ linear time!

---

### 1.2 The Mathematical Proof: Why Floyd's `BuildHeap` is $\Theta(N)$

Let $N$ be the number of elements in a complete binary tree of height $H = \lfloor \log_2 N \rfloor$.
Let height $h$ be measured from the bottom of the tree, such that leaves are at height $h = 0$, their parents are at height $h = 1$, and the root is at height $H$.

#### Step 1: Counting Nodes at Each Height
In a complete binary tree, the maximum number of nodes at height $h$ is:
$$N_h = \left\lceil \frac{N}{2^{h+1}} \right\rceil$$
- At height $h = 0$ (Leaves): $\approx N/2$ nodes.
- At height $h = 1$: $\approx N/4$ nodes.
- At height $h = 2$: $\approx N/8$ nodes.
- At height $H = \log N$ (Root): exactly $1$ node.

#### Step 2: Summing the SiftDown Work
A node at height $h$ can trickle down at most $h$ levels during `SiftDown`.
The total work $S$ across all internal nodes is:
$$S = \sum_{h=1}^{H} N_h \cdot h \le \sum_{h=1}^{\infty} \frac{N}{2^{h+1}} \cdot h = \frac{N}{2} \sum_{h=1}^{\infty} \frac{h}{2^h}$$

#### Step 3: Evaluating the Arithmetico-Geometric Series
Let $X = \sum_{h=1}^{\infty} \frac{h}{2^h}$:
$$X = \frac{1}{2} + \frac{2}{4} + \frac{3}{8} + \frac{4}{16} + \frac{5}{32} + \dots$$
Multiply both sides by $\frac{1}{2}$:
$$\frac{1}{2} X = \frac{1}{4} + \frac{2}{8} + \frac{3}{16} + \frac{4}{32} + \dots$$
Subtract the second equation from the first:
$$X - \frac{1}{2} X = \frac{1}{2} + \left( \frac{2}{4} - \frac{1}{4} \right) + \left( \frac{3}{8} - \frac{2}{8} \right) + \left( \frac{4}{16} - \frac{3}{16} \right) + \dots$$
$$\frac{1}{2} X = \frac{1}{2} + \frac{1}{4} + \frac{1}{8} + \frac{1}{16} + \dots$$
The right-hand side is a standard infinite geometric series with ratio $r = 1/2$:
$$\frac{1}{2} X = \frac{1/2}{1 - 1/2} = 1 \implies \mathbf{X = 2}$$

#### Step 4: Final Conclusion
Substitute $X = 2$ back into the work summation:
$$S \le \frac{N}{2} \cdot X = \frac{N}{2} \cdot 2 = \mathbf{N}$$
Thus, the total number of operations performed by Floyd's algorithm is strictly bounded by:
$$\mathbf{S \le N \implies \Theta(N)}$$
Floyd's algorithm builds a heap in **strictly linear time**! $\blacksquare$

---

### 1.2 Top-Down vs. Bottom-Up: The Fundamental Cost Asymmetry

Why does top-down insertion take $\Theta(N \log N)$ while bottom-up take $\Theta(N)$?

```
====================================================================================================
                            THE WORK ASYMMETRY COMPARISON
====================================================================================================
1. TOP-DOWN INSERTION (SiftUp):
   • As you insert nodes, the tree grows deeper.
   • The N/2 leaf nodes are at the very bottom (depth log N).
   • Each of the N/2 leaf nodes must SiftUp through log N ancestors!
   • Total Work: (N / 2) * log N = Ω(N log N)
   ===> THE MAJORITY OF NODES DO THE MAXIMUM AMOUNT OF WORK!

2. FLOYD'S BOTTOM-UP (SiftDown):
   • The N/2 leaf nodes do ZERO work (height 0).
   • The N/4 nodes at height 1 do at most 1 swap.
   • The N/8 nodes at height 2 do at most 2 swaps.
   • Only the single root at the top does log N swaps!
   • Total Work: Sum of (nodes * height) = Θ(N)
   ===> THE MAJORITY OF NODES DO MINIMAL WORK!
====================================================================================================
```

---

### 1.3 ⚙️ Core Operations Deep-Dive: Floyd's Heapification & Complexity Limits

#### Dimension 1: Operation Contract & Big-O Bounds

##### 1. In-Place Floyd Heapification (`BuildHeap`)
- **Signature:** `void BuildMinHeap<T>(T[] array) where T : IComparable<T>`
- **Pre-conditions:** `array` is a non-null contiguous array of length $N \ge 0$.
- **Post-conditions:** The array elements are permuted in-place such that `array` satisfies the min-heap property for all indices.
- **Invariants:**
  1. For any index $i$ during the loop, all subtrees rooted at indices $j > i$ satisfy the min-heap property.
  2. Memory consumed is strictly $\Theta(1)$ auxiliary space.

##### Big-O Operational Complexity Matrix
| Operation | Time (Best) | Time (Avg) | Time (Worst) | Aux Space | Primary Computational Bottleneck |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Floyd BuildHeap** | $\Theta(N)$ | $\Theta(N)$ | $\Theta(N)$ | $\Theta(1)$ | Cache line reads during reverse linear index descent |
| **Top-Down Build** | $O(N)$ (sorted) | $\Theta(N \log N)$ | $\Theta(N \log N)$ | $\Theta(1)$ | Frequent ancestor pointer swaps across cache lines |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
====================================================================================================
                        FLOYD BUILDHEAP EXECUTION LOGIC
====================================================================================================
Given array of length N:
   │
   ├─► Is N <= 1?
   │      └─► YES: Array is already a valid heap! Return immediately.
   │
   └─► For N >= 2:
          │
          ├─► Step 1: Identify the last internal node index:
          │      startIndex = (N >> 1) - 1;
          │
          └─► Step 2: Loop backward from startIndex down to 0:
                 • For i = startIndex down to 0:
                      - Call SiftDown(array, i, N)
                      - SiftDown trickles array[i] down into its subtrees
                      - When SiftDown(i) completes, the subtree rooted at i is a valid min-heap!
                 • Termination: When i = 0 completes, the entire tree is a valid min-heap!
====================================================================================================
```

---

#### Dimension 3: Visual ASCII State Transitions

##### Complete Trace of Floyd's `BuildHeap` on `[9, 4, 7, 1, 6, 2, 5]` ($N = 7$)
```
Initial Unordered Array:
Index:   0   1   2   3   4   5   6
Value: [ 9 | 4 | 7 | 1 | 6 | 2 | 5 ]

Initial Tree Representation:
                     [ 9 ] (0)
                    /         \
             [ 4 ] (1)         [ 7 ] (2)
            /        \        /        \
         [ 1 ](3)  [ 6 ](4)[ 2 ](5)  [ 5 ](6)

Last internal node index = (7 / 2) - 1 = 3 - 1 = 2.
Internal nodes to process in reverse order: Index 2, Index 1, Index 0.

Pass 1: Process Index 2 (val = 7):
- Children: left=5 (val 2), right=6 (val 5).
- Smallest child is 2 (index 5).
- 2 < 7 => Swap(2, 5).
Array after Pass 1: [ 9, 4, 2, 1, 6, 7, 5 ]
Subtree at index 2 is now a valid min-heap!

Pass 2: Process Index 1 (val = 4):
- Children: left=3 (val 1), right=4 (val 6).
- Smallest child is 1 (index 3).
- 1 < 4 => Swap(1, 3).
Array after Pass 2: [ 9, 1, 2, 4, 6, 7, 5 ]
Subtree at index 1 is now a valid min-heap!

Pass 3: Process Index 0 (Root, val = 9):
- Children: left=1 (val 1), right=2 (val 2).
- Smallest child is 1 (index 1).
- 1 < 9 => Swap(0, 1).
Array: [ 1, 9, 2, 4, 6, 7, 5 ]
- Now trickle 9 down at index 1:
  Children of 1: left=3 (val 4), right=4 (val 6).
  Smallest child is 4 (index 3).
  4 < 9 => Swap(1, 3).
Array after Pass 3: [ 1, 4, 2, 9, 6, 7, 5 ]
Index 3 has no children (2*3 + 1 = 7 >= 7). SiftDown terminates!

Final Array: [ 1, 4, 2, 9, 6, 7, 5 ]
Final Tree:
                     [ 1 ]
                    /     \
             [ 4 ]         [ 2 ]
            /     \       /     \
         [ 9 ]   [ 6 ] [ 7 ]   [ 5 ]
(Every parent <= children. Valid Min-Heap built in exactly 4 swaps!).
```

---

#### Dimension 4: Invariant Preservation Proof

##### Inductive Proof of Floyd's Algorithm Correctness
We prove by induction on the loop counter $i$ that after `SiftDown(i)` finishes, the subtree rooted at index $i$ is a valid min-heap.
- **Base Case:** All nodes at indices $k \ge \lfloor N/2 \rfloor$ are leaf nodes. By definition, a leaf has no children, so every single-node subtree rooted at $k$ is trivially a valid min-heap.
- **Inductive Step:** Consider internal node $i$, where $0 \le i < \lfloor N/2 \rfloor$.
  Assume by induction that all subtrees rooted at indices $j > i$ are already valid min-heaps.
  - The left child of $i$ is $L = 2i + 1 > i$. By hypothesis, the subtree rooted at $L$ is a valid min-heap.
  - The right child of $i$ is $R = 2i + 2 > i$. By hypothesis, if $R < N$, the subtree rooted at $R$ is a valid min-heap.
  - The operation `SiftDown(i)` compares the value at $i$ with the roots of both subtrees ($L$ and $R$).
  - If $\text{arr}[i] \le \min(\text{arr}[L], \text{arr}[R])$, the heap property at $i$ is satisfied immediately.
  - Otherwise, swapping $i$ with the smaller child places the minimum of all three elements at root $i$.
  - The potential violation is pushed into the chosen child subtree, which `SiftDown` recursively repairs until it reaches a valid position or a leaf.
  - Thus, the subtree rooted at $i$ becomes a valid min-heap.
- By backward induction, when $i = 0$ is processed, the entire tree rooted at $0$ is a valid min-heap. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Archetype | Concrete Input Instance | Failure Mode / Danger | Defensive Guard & Mitigation |
| :--- | :--- | :--- | :--- |
| **Empty or 1-Element Array** | `N = 0` or `N = 1` | Loop index `(N / 2) - 1` becomes negative (`-1`) | Loop condition `i >= 0` terminates before running, safely no-opping |
| **Two-Element Array** | `arr = [10, 5]` | Index calculation out of bounds | Start index is $(2/2)-1 = 0$. Sifts down index 0 against left child index 1 |
| **Already Sorted Array** | `arr = [1, 2, 3, 4, 5]` | Unnecessary swaps corrupting order | `SiftDown` checks `smallest != i`; if already smallest, breaks immediately ($O(1)$) |
| **Reverse Sorted Array** | `arr = [5, 4, 3, 2, 1]` | Maximum number of swaps per internal node | Still bounded by mathematical limit $\sum h/2^h = 2$, guaranteeing $\le N$ swaps |
| **All Identical Values** | `arr = [7, 7, 7, 7]` | Infinite swap loop | `<` comparison strictly fails on equality, breaking immediately in $O(1)$ |

---

## 2. 🎬 DEMONSTRATE: From-Scratch Production Implementation

Below is the complete production-grade C# implementation of Floyd's linear heap builder and a standalone bulk-constructed min-heap:

```csharp
using System;
using System.Diagnostics;

namespace AdvancedHeaps.Day108
{
    public static class FloydHeapBuilder
    {
        /// <summary>
        /// Transforms an arbitrary array into a valid Min-Heap in strictly linear O(N) time
        /// and O(1) auxiliary space using Floyd's bottom-up heapification algorithm.
        /// </summary>
        public static void BuildMinHeap<T>(T[] array) where T : IComparable<T>
        {
            if (array == null || array.Length <= 1) return;

            int n = array.Length;
            int lastInternalNode = (n >> 1) - 1;

            // Iterate backward from the last non-leaf node down to the root
            for (int i = lastInternalNode; i >= 0; i--)
            {
                SiftDown(array, i, n);
            }
        }

        /// <summary>
        /// In-place SiftDown utility operating directly on an arbitrary array slice [0, heapSize).
        /// </summary>
        public static void SiftDown<T>(T[] array, int i, int heapSize) where T : IComparable<T>
        {
            while ((i << 1) + 1 < heapSize)
            {
                int smallest = i;
                int left = (i << 1) + 1;
                int right = (i << 1) + 2;

                if (array[left].CompareTo(array[smallest]) < 0)
                {
                    smallest = left;
                }

                if (right < heapSize && array[right].CompareTo(array[smallest]) < 0)
                {
                    smallest = right;
                }

                if (smallest != i)
                {
                    T temp = array[i];
                    array[i] = array[smallest];
                    array[smallest] = temp;
                    i = smallest;
                }
                else
                {
                    break;
                }
            }
        }

        /// <summary>
        /// Validates that every internal node satisfies the min-heap invariant.
        /// </summary>
        public static bool IsValidMinHeap<T>(T[] array) where T : IComparable<T>
        {
            if (array == null || array.Length <= 1) return true;

            int lastInternalNode = (array.Length >> 1) - 1;

            for (int i = 0; i <= lastInternalNode; i++)
            {
                int left = (i << 1) + 1;
                int right = (i << 1) + 2;

                if (left < array.Length && array[left].CompareTo(array[i]) < 0)
                    return false;

                if (right < array.Length && array[right].CompareTo(array[i]) < 0)
                    return false;
            }

            return true;
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
            Console.WriteLine("  RUNNING DAY 108: FLOYD LINEAR BUILDHEAP VERIFICATION SUITE     ");
            Console.WriteLine("=================================================================");

            TestSmallArrayBuild();
            TestReverseSortedBuild();
            TestLargeRandomBuild();

            Console.WriteLine("\n[SUCCESS] ALL VERIFICATION TESTS PASSED!");
        }

        private static void TestSmallArrayBuild()
        {
            int[] arr = { 9, 4, 7, 1, 6, 2, 5 };
            FloydHeapBuilder.BuildMinHeap(arr);

            Debug.Assert(FloydHeapBuilder.IsValidMinHeap(arr), "Array should be a valid min-heap.");
            Debug.Assert(arr[0] == 1, "Root must be the minimum element (1).");

            Console.WriteLine("✔ TestSmallArrayBuild passed.");
        }

        private static void TestReverseSortedBuild()
        {
            int[] arr = { 50, 40, 30, 20, 10 };
            FloydHeapBuilder.BuildMinHeap(arr);

            Debug.Assert(FloydHeapBuilder.IsValidMinHeap(arr), "Reverse sorted array must become valid min-heap.");
            Debug.Assert(arr[0] == 10, "Root must be 10.");

            Console.WriteLine("✔ TestReverseSortedBuild passed.");
        }

        private static void TestLargeRandomBuild()
        {
            var random = new Random(108);
            int[] arr = new int[10_000];

            for (int i = 0; i < arr.Length; i++)
            {
                arr[i] = random.Next(-100_000, 100_000);
            }

            FloydHeapBuilder.BuildMinHeap(arr);
            Debug.Assert(FloydHeapBuilder.IsValidMinHeap(arr), "Large random array must satisfy min-heap invariant.");

            Console.WriteLine("✔ TestLargeRandomBuild passed on 10,000 elements.");
        }
    }
}
```

---

## 3. 🥊 PRACTICE: High-Frequency Problem Walkthroughs

### Problem: LeetCode 973 — K Closest Points to Origin (Medium)

> Given an array of `points` where `points[i] = [xi, yi]` represents a point on the X-Y plane and an integer `k`, return the `k` closest points to the origin `(0, 0)`.
> The distance between two points is Euclidean distance: $\sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2}$.
> You may return the answer in **any order**.
>
> **Constraints:**
> - $1 \le k \le points.Length \le 10^4$
> - $-10^4 \le xi, yi \le 10^4$

---

#### 1. Strategy Comparison

| Strategy | Approach | Time Complexity | Space Complexity |
| :--- | :--- | :---: | :---: |
| **Strategy 1: Full Sort** | Sort all points by squared distance | $O(N \log N)$ | $O(1)$ in-place |
| **Strategy 2: Bounded Max-Heap** | Max-Heap of size $K$; pop largest if closer arrives | $O(N \log K)$ | $O(K)$ |
| **Strategy 3: Floyd Min-Heap** | Bulk `BuildMinHeap` on all $N$ points, then pop $K$ times | $\mathbf{O(N + K \log N)}$ | $\mathbf{O(1)}$ |

When $K$ is small, Strategy 2 ($O(N \log K)$) wins on memory. But when all points are already in memory, **Strategy 3** builds the heap in $\Theta(N)$ time and extracts $K$ points in $O(K \log N)$ time with zero extra heap allocations!

#### 2. Production C# Implementation (Bounded Max-Heap of Size $K$)

```csharp
using System.Collections.Generic;

namespace AdvancedHeaps.Day108
{
    public static class ClosestPointsFinder
    {
        public static int[][] KClosest(int[][] points, int k)
        {
            // Max-Heap of size K: priority is squared distance (invert comparer for Max-Heap)
            var maxHeap = new PriorityQueue<int[], int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));

            foreach (var point in points)
            {
                int dist = point[0] * point[0] + point[1] * point[1];

                if (maxHeap.Count < k)
                {
                    maxHeap.Enqueue(point, dist);
                }
                else
                {
                    // If current point is closer than the furthest of the top-K
                    // In a max-heap, maxHeap.Peek() has the largest distance
                    int maxDist = 0;
                    if (maxHeap.TryPeek(out _, out maxDist) && dist < maxDist)
                    {
                        maxHeap.EnqueueDequeue(point, dist);
                    }
                }
            }

            int[][] result = new int[k][];
            for (int i = 0; i < k; i++)
            {
                result[i] = maxHeap.Dequeue();
            }

            return result;
        }
    }
}
```

---

## 4. 🔬 VERIFY: Production Quality Checklist & Daily Checkpoint

### Production Quality Verification Checklist
- [x] **Starting Index Correctness:** Loop begins strictly at `(n >> 1) - 1`, skipping leaf nodes entirely.
- [x] **Reverse Direction Navigation:** Loop index decreases (`i--`) toward root index $0$.
- [x] **Zero Allocation Guarantee:** Floyd `BuildMinHeap` operates completely in-place without allocating temporary buffers.
- [x] **Mathematical Soundness:** Arithmetico-geometric series summation proven from first principles ($\le 2N$).

---

### 💡 Daily Checkpoint Answer

> **Question:** Mathematically prove why `BuildHeap` bottom-up takes $\Theta(N)$ time, while building a heap top-down via repeated `SiftUp` calls takes $\Theta(N \log N)$ time.

**Architectural Answer:**
1. **The Top-Down (Repeated Insertion) Upper Bound:**
   - In top-down building, elements are inserted one by one.
   - The tree grows downward. When the $i$-th element is inserted, it is placed at depth $\lfloor \log_2 i \rfloor$ and can bubble up to $\log_2 i$ levels.
   - The last $N/2$ elements (the entire bottom leaf level) are inserted when the tree has height $\log_2 N$.
   - Each of these $N/2$ leaves can travel $\log_2 N$ steps upward:
     $$\text{Work}_{\text{top-down}} \ge \sum_{i=N/2}^{N} \log_2(N/2) = \frac{N}{2} (\log_2 N - 1) = \mathbf{\Omega(N \log N)}$$
   - **Crucial Flaw:** The majority of nodes ($50\%$) are asked to perform the maximum possible work ($O(\log N)$).

2. **The Bottom-Up (Floyd) Upper Bound:**
   - In Floyd's algorithm, the direction of sifting is reversed: we sift **down**, not up.
   - The $N/2$ leaf nodes are already valid heaps and perform **$0$ operations**.
   - The $N/4$ nodes one level above the leaves perform at most **$1$ swap**.
   - The $N/8$ nodes two levels above perform at most **$2$ swaps**.
   - The single root node performs $\log_2 N$ swaps.
   - Summing the work:
     $$\text{Work}_{\text{Floyd}} = \sum_{h=1}^{\log N} \frac{N}{2^{h+1}} \cdot h = \frac{N}{2} \sum_{h=1}^{\infty} \frac{h}{2^h} = \frac{N}{2} \cdot 2 = \mathbf{\Theta(N)}$$
   - **Crucial Advantage:** The majority of nodes perform minimal work, and only exponentially fewer nodes near the root perform deeper traversals, yielding strict linearity!
