---
title: "Week 7 — Day 45: K-Way Merge of Linked Lists"
---

In **Day 44**, we mastered arbitrary-precision list arithmetic, carry propagation invariants, and non-destructive stack accumulators.

Today, we conquer **$K$-Way Stream Merging**:
1. **The $K$-Way Merge Problem:** Consolidating $K$ sorted linked lists containing $N$ total elements into a single sorted list.
2. **The Systems Foundation:** Why $K$-way merging is the core primitive powering database query engines, external merge sort, distributed MapReduce shuffles, and LSM-tree compaction in RocksDB and Cassandra.
3. **Min-Heap vs. Divide-and-Conquer:** An in-depth asymptotic and hardware-level performance comparison.
4. **The C# 10+ `PriorityQueue` Architecture:** Utilizing modern .NET priority queues for streaming data.

---

## 1. 🧠 TEACH: Stream Merging & Complexity Derivations

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **K-Way Merge** consolidates $K$ independently sorted linked lists into a single globally sorted list using a Min-Heap or Divide-and-Conquer tournament tree.
  - *Core Invariants:* Min-Heap Invariant: A priority queue of capacity $K$ always holds the current smallest available node across all active lists; Tournament Invariant: Pairwise merging of $K$ lists reduces the problem in $\lceil \log_2 K \rceil$ rounds.
  - *Misconception Check:* Merging lists sequentially one-by-one takes $O(K^2 \times N / K) = O(K \times N)$ time; using a Min-Heap or Divide-and-Conquer reduces the time to $O(N \log K)$.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(K \times N)$ bottleneck of sequential list merging.
  - *Complexity Advantage:* Reduces merge time from $O(K \times N)$ to optimal $O(N \log K)$, where $N$ is total node count across all lists.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Merge k Sorted Lists" (LC 23), external merge sort runs, multi-source log stream merging. Signal words: "merge k sorted lists", "stream merging".
  - *When to Avoid / Failure Modes:* When $K$ is very large and exceeds available RAM; requires external disk tournament trees.
- **4. WHERE:**
  - *Physical CLR Memory:* .NET `PriorityQueue<ListNode, int>` on managed heap (size $\le K$); rewires existing node references in-place with zero node reallocations.
  - *Production Systems:* Database query merge joins on partitioned tables, distributed search engine inverted index posting list merging (Lucene).
- **5. WHO:**
  - *Spoken Script:* "To merge K sorted lists in $O(N \log K)$ time, I maintain a Min-Heap of size at most K holding the current head of each list. At each step, I pop the minimum node, append it to my merged result via a sentinel pointer, and push its next node back into the heap."
  - *Interviewer Evaluation Lens:* Evaluates Min-Heap vs. Divide-and-Conquer trade-offs, handling of null or empty lists in array, and zero-allocation pointer stitching.
- **6. HOW:**
  - *Cost Model:* Min-Heap: $O(N \log K)$ time, $O(K)$ space; Divide-and-Conquer: $O(N \log K)$ time, $O(\log K)$ recursion space.
  - *State Transition Trace (Min-Heap):* `PQ holds heads of lists 1..K -> pop min node u -> append u to tail -> if (u.next != null) PQ.Enqueue(u.next, u.next.val)`.


### 1.1 Physical Mental Model: The K-Lane Toll Plaza & The Tournament Bracket

Merging $K$ sorted streams into one unified highway is best understood through two physical screening models:

```
       ======================================================================
         PHYSICAL ANALOGY A: THE K-LANE HIGHWAY TOLL PLAZA (MIN-HEAP)
       ======================================================================

       Lane 0: [ 1 ] ===> [ 4 ] ===> [ 5 ]
       Lane 1: [ 1 ] ===> [ 3 ] ===> [ 4 ]
       Lane 2: [ 2 ] ===> [ 6 ]
       
       TOLL BOOTH (Min-Heap of Capacity K = 3):
       The booth operator only looks at the FRONT car of each lane:
                 [ 1 (Lane 0) ]  <--- Minimum! Dispatched onto single bridge!
                /              \
         [ 1 (Lane 1) ]   [ 2 (Lane 2) ]

       When [ 1 (Lane 0) ] departs:
       - Spliced to merged highway tail.
       - The next car in Lane 0 ([ 4 ]) pulls up to the booth.
       - Heap sifts [ 4 ] down in O(log K) steps.
       
       Total Bridge Cars = N. Each transition costs O(log K) -> O(N log K)!
```

```
       ======================================================================
         PHYSICAL ANALOGY B: THE OLYMPIC TOURNAMENT BRACKET (DIVIDE & CONQUER)
       ======================================================================

       Round 1 (K Lists):
       [L0] <--- Zipper Merge ---> [L1]       [L2] <--- Zipper Merge ---> [L3]
                 |                                      |
                 v                                      v
       Round 2 (K / 2 Lists):
               [M01]        <--- Zipper Merge --->     [M23]
                                      |
                                      v
       Final Championship (1 List): [Unified Sorted List of N nodes]

       Tree Height: log2(K) rounds.
       Each round zips all N elements across all pairs: O(N) work.
       Total Time: O(N log K). Auxiliary Space: O(1) if bottom-up iterative!
```

---

### 1.2 The Problem Formulation

Given an array of $K$ singly linked lists, each sorted in ascending order:
$$\text{lists} = [L_0, L_1, L_2, \dots, L_{K-1}]$$
Let $N$ denote the total number of nodes across all $K$ lists ($N = \sum |L_i|$).
Our goal is to merge all $K$ lists into a single sorted linked list.

---

### 1.2 Three Architectural Approaches

#### Approach 1: Naive Sequential Merging ($O(K \cdot N)$ Time)
Merge the lists sequentially one by one:
- Merge $L_0$ and $L_1$: $\approx 2 \times \frac{N}{K}$ operations.
- Merge the result with $L_2$: $\approx 3 \times \frac{N}{K}$ operations.
- Merge with $L_3$: $\approx 4 \times \frac{N}{K}$ operations.

$$\text{Total Work} = \sum_{i=2}^K i \cdot \frac{N}{K} \approx \frac{N}{K} \cdot \frac{K(K+1)}{2} = \mathbf{O(K \cdot N)}$$

*Interview Critique:* If $K = 1,000$ and $N = 100,000$, this performs $10^8$ operations, leading directly to a **Time Limit Exceeded (TLE)** verdict.

---

#### Approach 2: Min-Heap / Priority Queue ($O(N \log K)$ Time, $O(K)$ Space)

Instead of comparing all $K$ heads on every step, maintain a **Min-Heap of size at most $K$**:

```
List 0: [1] ──► [4] ──► [5]
List 1: [1] ──► [3] ──► [4]
List 2: [2] ──► [6]

Initial Min-Heap (Size K = 3):
           (1 from L0)
          /           \
     (1 from L1)   (2 from L2)

1. Extract min (Node 1 from L0). Attach to output.
2. Advance L0 to Node 4. Push Node 4 into Heap.
3. Rebalance Heap in O(log K) time.
```

- At any instant, the heap contains at most 1 representative node from each active list.
- Each of the $N$ nodes is pushed into the heap once and extracted once.
- Total time: $N \times O(\log K) = \mathbf{O(N \log K)}$.
- Auxiliary memory: **$O(K)$ space** to hold heap elements.

---

#### Approach 3: Divide-and-Conquer Pairwise Merging ($O(N \log K)$ Time, $O(1)$ Space)

Pair up the $K$ lists and merge each pair using the standard two-list merge sort from Day 41:

```
Level 0:  L0      L1      L2      L3      L4      L5      (K lists)
           \      /        \      /        \      /
Level 1:    L0+1             L2+3             L4+5        (K/2 lists)
              \               /                 |
Level 2:            L0+1+2+3                  L4+5        (K/4 lists)
                        \                      /
Level 3:                      L0+1+2+3+4+5                (1 sorted list!)
```

#### Mathematical Work Derivation:
- At Level 1, we merge $K/2$ pairs; every node in the entire dataset participates in exactly one comparison pass $\implies O(N)$ work.
- At Level 2, we merge $K/4$ pairs $\implies O(N)$ work.
- The tree has height $\lceil \log_2 K \rceil$.
- Total Time: $\sum_{level=1}^{\log_2 K} O(N) = \mathbf{O(N \log K)}$.
- Auxiliary Memory:
  - If implemented with recursion: $O(\log K)$ stack space.
  - If implemented with an **iterative stride halving loop**: **Strictly $O(1)$ auxiliary space!**

---

### 1.3 The Hardware Benchmark: Why Divide-and-Conquer Wins in Practice

In Big Tech technical screens, candidates often ask: *"Both approaches are $O(N \log K)$. Does it matter which one I implement?"*

**Yes. Divide-and-Conquer is significantly faster in production .NET runtimes**:

| Dimension | Min-Heap (`PriorityQueue<T, P>`) | Divide-and-Conquer Iterative |
| :--- | :--- | :--- |
| **Heap Operations** | Performs $N$ extractions and $N$ insertions $\implies 2N \log_2 K$ heapify swaps. | **Zero heapify swaps.** |
| **Branch Predictor** | Unpredictable heap child comparisons (`arr[2i+1]` vs `arr[2i+2]`). | **High predictability:** Long sorted sequences from a single list execute without branch mispredictions. |
| **Memory Access** | Non-contiguous memory dereferencing into the heap buffer. | Linear pointer traversal (`curr = curr.next`) with superior prefetching. |
| **Auxiliary Allocation** | Allocates heap internal array of size $K$. | **Zero allocations** ($O(1)$ space). |

---

### 1.4 Interview Spoken Drill (20–30 Seconds)

> *"To merge K sorted linked lists containing N total nodes, sequential merging is sub-optimal at $O(KN)$ time. Instead, we can use a Min-Heap of size K, pushing each list's head and extracting the global minimum in $O(\log K)$ time per node, achieving $O(N \log K)$ time and $O(K)$ space. Even better is iterative Divide-and-Conquer pairwise merging: we pair up lists and merge them in $\log K$ passes. This achieves the same $O(N \log K)$ runtime but operates in strict $O(1)$ auxiliary space with superior CPU branch prediction and zero heap rebalancing overhead."*

### 1.5 ⚙️ Core Operations Deep-Dive: Pairwise Stride Halving & In-Place Tournament Invariants

#### Dimension 1: Operation Contract & Big-O Bounds
- **Operation Signature:** `ListNode MergeKLists(ListNode[] lists)`
- **Preconditions:**
  - `lists` is an array of $K \ge 0$ singly linked list head references.
  - Every individual linked list in `lists` is pre-sorted in non-decreasing order.
  - The total number of nodes across all lists is $N \ge 0$.
- **Postconditions:**
  - Returns a single unified linked list containing all $N$ nodes sorted in non-decreasing order.
  - In the divide-and-conquer approach, existing nodes are rewired in place without heap allocations.
- **Complexity Bounds:**
  - **Divide-and-Conquer (Stride Halving):**
    - Time Complexity: $\Theta(N \log K)$ — exactly $\lceil \log_2 K \rceil$ pairwise merging rounds, each processing $N$ total nodes.
    - Auxiliary Space Complexity: **Strictly $O(1)$** auxiliary space (operates directly within the input `lists` array buffer).
  - **Min-Heap Approach:**
    - Time Complexity: $\Theta(N \log K)$.
    - Auxiliary Space Complexity: $\Theta(K)$ heap space.

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree
1. **Iterative Pairwise Stride Halving Execution:**
   - If `lists == null || lists.Length == 0`, return `null`.
   - Initialize `int interval = 1`.
   - *Tournament Round Loop (`while interval < lists.Length`):*
     - For $i = 0$; $i + interval < lists.Length$; $i += interval \times 2$:
       - `lists[i] = MergeTwoLists(lists[i], lists[i + interval])`.
     - Double stride interval: `interval *= 2`.
   - Return `lists[0]`.
2. **Two-List In-Place Splice Subroutine (`MergeTwoLists(l1, l2)`):**
   - Initialize `ListNode dummy = new ListNode(0), tail = dummy`.
   - While `l1 != null && l2 != null`:
     - If `l1.val <= l2.val`: `tail.next = l1; l1 = l1.next;`
     - Else: `tail.next = l2; l2 = l2.next;`
     - `tail = tail.next;`
   - Splice remainder: `tail.next = (l1 != null) ? l1 : l2;`
   - Return `dummy.next`.

```
                    [while interval < lists.Length]
                                   │
                   for i = 0; i + interval < Length; i += interval * 2:
                     lists[i] = MergeTwoLists(lists[i], lists[i + interval])
                                   │
                             interval *= 2
                                   │
                              Return lists[0]
```

#### Dimension 3: Visual ASCII State Transitions
```
INITIAL LISTS: [ L0, L1, L2, L3, L4 ] (K = 5)

ROUND 1 (interval = 1):
  i = 0: merge(L0, L1) -> stored in lists[0]
  i = 2: merge(L2, L3) -> stored in lists[2]
  i = 4: no pair (4 + 1 = 5 >= Length) -> L4 survives unchanged
  State: [ (L0+L1), _, (L2+L3), _, L4 ]

ROUND 2 (interval = 2):
  i = 0: merge(lists[0], lists[2]) -> stored in lists[0]
  i = 4: no pair (4 + 2 = 6 >= Length) -> L4 survives unchanged
  State: [ (L0+L1+L2+L3), _, _, _, L4 ]

ROUND 3 (interval = 4):
  i = 0: merge(lists[0], lists[4]) -> stored in lists[0]
  State: [ (L0+L1+L2+L3+L4), _, _, _, _ ]
  interval becomes 8 >= 5. Exits.

FINAL RESULT: lists[0] contains all 5 merged lists.
```

#### Dimension 4: Invariant Preservation Proof
- **Logarithmic Round Upper Bound Proof:**
  - Let $K$ be the number of active lists.
  - In each round with stride `interval`, the number of distinct list heads is halved:
    $$K_{r+1} = \lceil K_r / 2 \rceil$$
  - After $R = \lceil \log_2 K \rceil$ rounds, the stride exceeds the array length, leaving exactly one list at index 0.
  - In round $r$, each pair of lists merged contains on average $2^r \cdot (N/K)$ nodes.
  - The total number of node comparisons across all pairs in round $r$ is bounded by:
    $$\sum_{\text{all pairs}} (|A| + |B|) \le N$$
  - Multiplying $N$ work per round by $\lceil \log_2 K \rceil$ rounds yields total runtime $\Theta(N \log K)$.
- **Strict In-Place Pointer Rewiring Invariant:**
  - `MergeTwoLists` merely mutates the `next` references of existing nodes; zero new `ListNode` allocations occur (beyond a reusable stack dummy).
  - Hence, the entire $K$-way merge runs in strictly $O(1)$ auxiliary memory.

#### Dimension 5: Edge Case Matrix
| Edge Case Scenario | Input State | Algorithmic Behavior | Invariant Preservation |
| :--- | :--- | :--- | :--- |
| **Empty Input Array** | `lists.Length == 0` | Guard check returns `null` immediately. | Safe empty exit. |
| **Array of Null Heads** | `[null, null, null]` | Merging nulls returns null; `lists[0]` remains null. | Nullity preserved. |
| **Odd Number of Lists** | $K = 5$ | Unpaired odd tail carries over into subsequent rounds automatically. | Handled without special branch logic. |
| **Single List** | $K = 1$ | Loop condition `interval < 1` false immediately; returns `lists[0]`. | Zero redundant operations. |
| **Heavily Skewed List Lengths** | $L_0$ has $10^5$ nodes, $L_1$ has 1 node | Subroutine splices remainder of $L_0$ in $O(1)$ pointer assignment. | Optimal linear splicing. |

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

### 2.1 [LeetCode 23] Merge k Sorted Lists — Approach A: Min-Heap (`PriorityQueue`)

Given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.

In .NET 6+, C# provides `PriorityQueue<TElement, TPriority>`. We store `ListNode` as the element and its `val` as the priority.

```csharp
public class SolutionMinHeap {
    /// <summary>
    /// Merges K sorted lists using a Min-Heap (PriorityQueue).
    /// Time Complexity: O(N log K)
    /// Space Complexity: O(K) auxiliary space for the heap
    /// </summary>
    public ListNode MergeKLists(ListNode[] lists) {
        if (lists == null || lists.Length == 0) return null;

        // Min-Heap ordered by ListNode.val
        var minHeap = new PriorityQueue<ListNode, int>();

        // Step 1: Initialize heap with the head of each non-empty list
        foreach (ListNode head in lists) {
            if (head != null) {
                minHeap.Enqueue(head, head.val);
            }
        }

        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;

        // Step 2: Continuously extract min and advance the corresponding list
        while (minHeap.Count > 0) {
            ListNode smallest = minHeap.Dequeue();
            tail.next = smallest;
            tail = tail.next;

            // If the extracted node has a next element, enqueue it
            if (smallest.next != null) {
                minHeap.Enqueue(smallest.next, smallest.next.val);
            }
        }

        return dummy.next;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N \log K)$ — The heap holds at most $K$ elements. Every node is enqueued once and dequeued once ($N$ total items $\times O(\log K)$ operations).
- **Space Complexity:** $O(K)$ auxiliary space — The heap contains at most one node pointer per active list.

---

### 2.2 [LeetCode 23] Merge k Sorted Lists — Approach B: Divide-and-Conquer (Optimal $O(1)$ Space)

Instead of allocating a heap, we repeatedly merge pairs of lists in-place using our Day 41 two-list merge routine.

#### The Iterative Stride Halving Pattern:
We maintain an interval `interval = 1`. In each round, we merge `lists[i]` and `lists[i + interval]`, then double `interval *= 2` until `interval >= lists.Length`.

```
Initial lists: [L0, L1, L2, L3]

Round 1 (interval = 1):
  i = 0: merge(L0, L1) -> stored in lists[0]
  i = 2: merge(L2, L3) -> stored in lists[2]
  Resulting array: [L0+1, L1, L2+3, L3]

Round 2 (interval = 2):
  i = 0: merge(lists[0], lists[2]) -> stored in lists[0]
  Resulting array: [L0+1+2+3, ...]

Done! lists[0] contains the fully merged result!
```

#### Production C# Implementation:

```csharp
public class SolutionDivideAndConquer {
    /// <summary>
    /// Merges K sorted lists using bottom-up iterative Divide-and-Conquer.
    /// Time Complexity: O(N log K)
    /// Space Complexity: O(1) auxiliary space (modifies input array in-place)
    /// </summary>
    public ListNode MergeKLists(ListNode[] lists) {
        if (lists == null || lists.Length == 0) return null;

        int amount = lists.Length;
        int interval = 1;

        // Iteratively merge adjacent pairs, doubling the stride each pass
        while (interval < amount) {
            for (int i = 0; i + interval < amount; i += interval * 2) {
                lists[i] = MergeTwoLists(lists[i], lists[i + interval]);
            }
            interval *= 2;
        }

        return lists[0];
    }

    /// <summary>
    /// Standard O(1) space two-list merge using sentinel dummy head.
    /// </summary>
    private ListNode MergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;

        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {
                tail.next = l1;
                l1 = l1.next;
            } else {
                tail.next = l2;
                l2 = l2.next;
            }
            tail = tail.next;
        }

        tail.next = (l1 != null) ? l1 : l2;
        return dummy.next;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N \log K)$ — There are $\lceil \log_2 K \rceil$ passes. Each pass traverses all $N$ nodes across pairwise merges.
- **Space Complexity:** **Strictly $O(1)$ auxiliary space** — Operates entirely by rewiring `.next` pointers within the existing array slots. No recursion stack and no heap buffers.

---

### 2.3 System Design Extension: External Merge Sort for Terabyte Datasets

How does $K$-way merge operate when data cannot fit in physical memory (RAM)?

```
100 GB Raw File on Disk
       │
       ▼ (Read 1 GB chunks into RAM, Sort in RAM via Quicksort, Write back to Disk)
100 Sorted Runs of 1 GB each on SSD: [Run 0, Run 1, ... Run 99]
       │
       ▼ (K-Way Merge with K = 100)
Input Buffers in RAM: 100 small stream buffers (e.g. 8 MB each)
Priority Queue of size K = 100
Output Buffer in RAM (e.g. 64 MB)
       │
       ▼ (Flush when Output Buffer fills)
Final 100 GB Sorted File on Disk
```

1. **Phase 1 (Run Generation):** Stream chunks that fit in RAM, sort them, and write them back to disk as sorted runs.
2. **Phase 2 ($K$-Way Merge):**
   - Open a read stream for each of the $K$ runs.
   - Load only the first block of each run into a dedicated RAM buffer.
   - Use a Min-Heap of size $K$ to extract the smallest element across all buffers.
   - When a run's RAM buffer is depleted, read the next block from disk.
   - When the output buffer fills, write it to disk in large sequential blocks to maximize I/O throughput.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master multi-stream merging patterns on LeetCode:

### Problem 1 (The Benchmark): LeetCode 23 — Merge k Sorted Lists (Hard)
- **Goal:** Implement both the Min-Heap and the iterative Divide-and-Conquer solutions.
- **Target Complexity:** $O(N \log K)$ time, $O(1)$ auxiliary space.

### Problem 2 (2D Array $K$-Way Merge): LeetCode 378 — Kth Smallest Element in a Sorted Matrix (Medium)
- **Goal:** Treat each row of an $N \times N$ matrix as a sorted list; extract $K$ elements using a Min-Heap of size $N$.
- **Target Complexity:** $O(K \log N)$ time, $O(N)$ space.

### Problem 3 (Multi-Stream Exploration): LeetCode 373 — Find K Pairs with Smallest Sums (Medium)
- **Goal:** Use a Min-Heap of size $K$ to generate smallest sum pairs across two sorted arrays.
- **Target Complexity:** $O(K \log K)$ time, $O(K)$ space.

### Bonus / Extension Challenge: LeetCode 632 — Smallest Range Covering Elements from K Lists (Hard)
- **Goal:** Find the smallest range $[a, b]$ that includes at least one number from each of the $K$ sorted lists using a Min-Heap tracking `currentMax`.
- **Target Complexity:** $O(N \log K)$ time, $O(K)$ space.

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                     K-Stream Merging Decision Tree                     │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Merging K Linked Lists in memory?
                   │   ├─► Simplest implementation ────► Min-Heap (PriorityQueue<ListNode, int>) [LC 23]
                   │   │                                 O(N log K) time, O(K) space
                   │   └─► Max performance & O(1) space ► Iterative Divide-and-Conquer Pairwise Merge
                   │                                     O(N log K) time, strictly O(1) space
                   │
                   ├─► Finding K-th smallest in multiple sorted arrays/matrix?
                   │   └─► Min-Heap tracking array indices [LC 378, LC 373]
                   │
                   ├─► Finding bounded sliding window across K lists?
                   │   └─► Min-Heap + Track Global Max scalar [LC 632]
                   │
                   └─► Maintaining key-value eviction order in O(1) time?
                       └─► Hash Map + Doubly Linked List (Day 46: LRU Cache) [LC 146]
```

### Preview for Day 46: Doubly Linked Lists & The LRU Cache Architecture
Tomorrow in **Day 46**, we step into one of the most famous system design interview questions on Earth:
- **[LeetCode 146] LRU Cache:** Designing an $O(1)$ `Get(key)` and $O(1)$ `Put(key, value)` eviction system.
- Why a Hash Map alone fails (cannot track access recency in $O(1)$).
- Why a Singly Linked List fails (cannot splice an arbitrary node in $O(1)$ without predecessor).
- **The Composite Architecture:** Synchronizing a `Dictionary<int, DNode>` with a Doubly Linked List featuring sentinel `head` and `tail` nodes.

---

## 5. 🎯 Day 45 Checkpoint Questions

Verify your mastery of $K$-way stream merging:

1. **Pairwise Stride Invariant:** In the iterative Divide-and-Conquer algorithm for LeetCode 23, why is the inner loop increment `i += interval * 2` rather than `i += interval`?
2. **Asymptotic Work Proof:** Why does pairwise merging across $\log_2 K$ levels sum to exactly $O(N \log K)$ total work, rather than $O(N \cdot K)$?
3. **Hardware Cache Efficiency:** Explain why Divide-and-Conquer exhibits better CPU branch prediction and memory bandwidth utilization than Min-Heap on the same input data.
4. **C# `PriorityQueue` Stability:** Is .NET's `PriorityQueue<TElement, TPriority>` stable (i.e. does it guarantee FIFO order for elements with equal priority)? Why does stability not affect the correctness of LeetCode 23?
