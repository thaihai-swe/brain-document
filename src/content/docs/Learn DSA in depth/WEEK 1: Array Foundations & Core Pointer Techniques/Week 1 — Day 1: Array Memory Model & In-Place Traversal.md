---
title: "Week 1 — Day 1: Array Memory Model, From-Scratch Dynamic Array (List<T>) & In-Place Traversal"
---

Welcome to Day 1 of **Week 1: Array Foundations & Core Pointer Techniques**!

Today we lay down the physical, theoretical, and architectural foundation of computer memory and contiguous collections:
1. **The Physical Reality of Memory:** Hardware RAM byte addressing, CPU cache lines (64-byte blocks), spatial vs. temporal locality, and the mathematical derivation of $O(1)$ indexing.
2. **From-Scratch Dynamic Array Container (`DynamicArray<T>`):** Building a production-grade generic resizable array in C# with geometric doubling, boundary verification, Garbage Collection reference loitering prevention, and fail-fast version enumerators.
3. **Formal Amortized Complexity Analysis:** Proving why resizing is amortized $O(1)$ using both the **Aggregate Method** and the **Banker's / Potential Method ($\Phi$)**, and analyzing shrink-thrashing heuristics.
4. **The Reader & Writer Invariant:** Inverting deletion problems to achieve $O(N)$ time and $O(1)$ auxiliary space during in-place mutations.
5. **Canonical Problem Walkthroughs:** Deep-dive derivations for **LeetCode 27 (Remove Element)** and **LeetCode 26 (Remove Duplicates from Sorted Array)**.

---

## 1. 🧠 TEACH: The Physical Reality of an Array & Dynamic Resizing

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* An **Array** is a linear collection of homogeneous elements allocated in contiguous physical memory addresses. A **Dynamic Array** (`DynamicArray<T>`, `List<T>`) wraps a raw array with geometric buffer doubling.
  - *Core Invariants:* Contiguity Invariant ($i$ adjacent to $i-1, i+1$); $\Theta(1)$ Random Access Law ($\text{Address}(i) = \text{Base} + i \times \text{sizeof}(T)$); Capacity Invariant ($0 \le \text{Count} \le \text{Capacity}$).
  - *Misconception Check:* Appending is *not* worst-case $O(1)$; it is amortized $O(1)$ with occasional $O(N)$ reallocation spikes. Indexing is only $O(1)$ because of contiguous pointer arithmetic, not because of magic hardware hashing.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates pointer chasing and cache-miss overhead of linked nodes, enabling hardware prefetchers to stream data directly into CPU L1/L2 caches.
  - *Complexity Advantage:* Constant-time random access $\Theta(1)$ allows divide-and-conquer binary search in $\Theta(\log N)$, which is physically impossible in node-linked structures.
- **3. WHEN:**
  - *When to Choose / Signal Words:* High read-to-write ratio, index-heavy access, known or bounded dataset size, sequential numerical processing, tight inner loops. Signal words: "contiguous subarray", "in-place compaction", "index lookup".
  - *When to Avoid / Failure Modes:* Frequent arbitrary insertions/deletions in the middle or head ($O(N)$ memory shift); unbounded streaming data where reallocation latency spikes violate real-time SLAs.
- **4. WHERE:**
  - *Physical CLR Memory:* 64-bit .NET object heap: 8-byte `Object Header` + 8-byte `MethodTable Pointer` + 4-byte `Length` + 4-byte padding + raw contiguous elements. Elements fill 64-byte cache lines. Arrays $\ge 85,000$ B enter Gen 2 Large Object Heap (LOH).
  - *Production Systems:* Flat disk buffers in database page caches, OS paging tables, SIMD vectorization registers.
- **5. WHO:**
  - *Spoken Script:* "An array provides constant-time $O(1)$ direct address arithmetic because elements are stored contiguously in memory. I choose dynamic arrays when cache locality and instant random access are paramount, accepting amortized $O(1)$ appends via geometric capacity doubling."
  - *Interviewer Evaluation Lens:* Evaluates whether the candidate understands contiguous memory layout, amortized analysis via potential method, and reference loitering prevention (`default(T)`).
- **6. HOW:**
  - *Cost Model:* Access: $\Theta(1)$; Append: $\Theta(1)$ amortized (Worst $O(N)$); Insert/Delete at $i$: $\Theta(N)$; Search: $\Theta(N)$ unsorted, $\Theta(\log N)$ sorted.
  - *State Transition Trace:* `[1, 2, 3, _] (Count=3, Cap=4) -> Add(4) -> [1, 2, 3, 4] (Count=4, Cap=4) -> Add(5) -> Reallocate to Cap=8 -> [1, 2, 3, 4, 5, _, _, _] (Count=5, Cap=8)`.

### 1.1 Physical Mental Model: Post Office Boxes, Cache Trays & Domino Shifts

Before exploring pointer arithmetic or memory pages, anchor your mental model in a physical wall of post office mailboxes:

```
       ======================================================================
         PHYSICAL ANALOGY: POST OFFICE MAILBOXES & DIRECT TAPE MEASURE
       ======================================================================

       A wall of 1,000 identical mailboxes bolted side-by-side:
       - Every box has the exact same width: 4 inches (sizeof(int)).
       - The wall starts at distance 0 (Base Address: 0x1000).

       Locker 0         Locker 1         Locker 2         Locker 3
       [ 0x1000: 10 ]   [ 0x1004: 20 ]   [ 0x1008: 30 ]   [ 0x100C: 40 ]
       |<-- 4 in. -->|  |<-- 4 in. -->|  |<-- 4 in. -->|  |<-- 4 in. -->|

       HOW O(1) RANDOM ACCESS WORKS:
       Want Locker #3? You NEVER count 0, then 1, then 2!
       You pull a tape measure directly to: Base + (3 * 4 in) = 12 inches.
       Instant O(1) direct address arithmetic!
```

```
       ======================================================================
         HARDWARE REALITY: THE 64-BYTE CPU CACHE TRAY
       ======================================================================

       When the CPU visits Locker 0, it doesn't carry back 4 bytes.
       It carries a 64-byte metal tray (CPU Cache Line):
       
       +---------------------------------------------------------------+
       | Locker 0 | Locker 1 | Locker 2 | ... | Locker 15              |
       +---------------------------------------------------------------+
       <------------------ Loaded into L1 Cache in 1 cycle ------------>
       
       Sequential traversal reads Lockers 1..15 at 0ns latency (Cache Hit!).
```

```
       ======================================================================
         THE COST OF INSERTION: THE DOMINO SHIFT
       ======================================================================

       Want to insert a new box between Locker 1 and Locker 2?
       [ 10 ]  [ 20 ]  ---INSERT [ 99 ] HERE---  [ 30 ]  [ 40 ]
       
       You MUST physically shove Locker 2, 3, and all following lockers to the right!
       Time is proportional to the number of elements shifted: O(N).
```

---

### 1.2 Memory as a Continuous Byte Strip

Your computer’s RAM is physically organized as a massive, 1-dimensional sequence of byte addresses.

When you allocate an array in C#:

```csharp
int[] arr = new int[4] { 10, 20, 30, 40 };
```

The runtime allocator reserves a single **contiguous block** of virtual memory:
- An `int` in .NET occupies 4 bytes (32 bits).
- 4 integers require $4 \times 4 = 16$ contiguous bytes of payload.

```
Memory Address:  0x1000       0x1004       0x1008       0x100C
                 ┌────────────┬────────────┬────────────┬────────────┐
Index:           │   arr[0]   │   arr[1]   │   arr[2]   │   arr[3]   │
Value:           │     10     │     20     │     30     │     40     │
                 └────────────┴────────────┴────────────┴────────────┘
                 ◄────────────── Contiguous 16 Bytes ──────────────►
```

---

### 1.2 The Math Behind $O(1)$ Indexing

Why is accessing `arr[i]` an $O(1)$ constant-time operation? Because it requires **zero searching**.

The CPU calculates the exact target memory address in a single clock cycle using hardware integer arithmetic:

$$\mathbf{\text{Target Address} = \text{Base Address} + (i \times \text{sizeof}(T))}$$

If $\text{Base} = \text{0x1000}$ and $\text{sizeof}(int) = 4\text{ bytes}$:
- To access `arr[2]`: $\text{0x1000} + (2 \times 4) = \text{0x1008}$.
- The CPU jumps directly to `0x1008`. Whether the array contains 10 elements or 10,000,000 elements, computing the address takes the exact same physical duration.

> [!NOTE]
> This address arithmetic is the fundamental reason arrays are **0-indexed**. The index is not a cardinal "rank"; it is an **offset distance** indicating how many element units to step forward from the base pointer.

---

### 1.3 Hardware Architecture: CPU Cache Lines & Spatial Locality

When your CPU core requests data from `arr[0]`, it does not transfer just 4 isolated bytes across the memory bus. Main RAM latency is high (~50–100 nanoseconds), while L1 CPU caches operate at processor clock speeds (~1 nanosecond).

To bridge this latency gap, the CPU Memory Management Unit fetches a full **Cache Line** (standardized at **64 contiguous bytes**) into the L1 data cache at once:
- When accessing `arr[0]` (4 bytes), the hardware automatically prefetches the subsequent 60 bytes containing `arr[1]` through `arr[15]`.
- As a direct result, sequential linear array traversals (`for (int i = 0; i < n; i++)`) yield near **100% L1 cache hit rates**.
- *(Contrast this with Linked Lists, where each node is allocated independently on the managed heap; traversing nodes requires chasing pointer addresses across disconnected memory pages, causing frequent CPU pipeline stalls and cache misses).*

---

### 1.4 The Cost of Modifying Arrays

Because elements are packed tightly in contiguous memory, resizing or inserting elements requires physical memory relocation:

| Operation | Position | Time Complexity | Architectural Rationale |
| :--- | :--- | :---: | :--- |
| **Lookup / Read** | `arr[i]` | $O(1)$ | Direct address arithmetic: $\text{Base} + i \times \text{Size}$. |
| **Update** | `arr[i] = val` | $O(1)$ | Overwrites a fixed, known physical address. |
| **Insert / Append** | End (Tail) | $O(1)$ amortized | If free capacity exists $\implies$ write to `arr[size]`. |
| **Insert** | Beginning (Head) | $O(N)$ | Every existing element must shift 1 slot to the right. |
| **Delete** | Beginning (Head) | $O(N)$ | Every remaining element must shift 1 slot to the left. |

```
Insert at index 0 requires shifting EVERY item right:
Initial:   [ 10 , 20 , 30 , 40 ]
Step 1:               40 ───► [Slot 4]
Step 2:          30 ────────► [Slot 3]
Step 3:     20 ─────────────► [Slot 2]
Step 4:10 ──────────────────► [Slot 1]
Result:    [ NEW, 10 , 20 , 30 , 40 ]  ──► N operations!
```

---

### 1.5 The Dynamic Array Abstract Data Type (ADT)

A fixed-size array cannot grow once allocated. A **Dynamic Array** (e.g., `List<T>` in C#, `std::vector` in C++, `ArrayList` in Java) solves this by wrapping a heap-allocated fixed array and automating growth.

#### Core ADT Invariants:
1. **Capacity Invariant:** $\mathbf{0 \le \text{Count} \le \text{Capacity}}$.
2. **Contiguity Invariant:** Elements reside strictly in indices $0 \dots \text{Count} - 1$. No "gaps" or uninitialized slots exist between active elements.
3. **Geometric Growth Invariant:** Whenever $\text{Count} == \text{Capacity}$, allocate a new buffer of size $\mathbf{\text{Capacity} \times G}$ (where growth factor $G \in \{1.5, 2.0\}$), copy all active elements over, and reassign the internal pointer.

#### Growth Factor Trade-Offs ($2.0\times$ vs $1.5\times$):
- **$2.0\times$ (C# `List<T>`, Java `ArrayList`):** Doubles memory every resize. Faster growth with fewer reallocations, but mathematically guarantees that the newly allocated memory block can *never* reuse previously freed memory blocks (since $\sum_{i=0}^{k} 2^i = 2^{k+1} - 1 < 2^{k+1}$).
- **$1.5\times$ (C++ `std::vector` in MSVC, folly/jemalloc):** Slightly more frequent reallocations, but allows the memory allocator to reuse previously deallocated chunks from earlier resizes once the sum of earlier allocations exceeds the new block size.

---

### 1.6 Garbage Collection & Reference Loitering in C#

In managed runtimes like .NET, if an array holds **reference types** (`class` instances), deleting an element from a dynamic array by simply decrementing `_size` causes a severe silent bug called **Reference Loitering**:
- `_items[_size]` still holds an active heap reference to the removed object.
- Because the array itself is alive and reachable, the Garbage Collector sees this reference as a valid GC root and **refuses to reclaim the object**, even though the application logic considers it deleted!
- **The Mandatory Fix:** Always assign `_items[_size] = default(T)!` on deletion and `Clear()`. For reference types, this writes `null`, immediately severing the GC root.

---

### 1.7 Fail-Fast Enumerator & Version Tracking

When iterating through a collection using `foreach`, modifying the collection concurrently (adding or removing elements) invalidates the iteration state and leads to unpredictable bugs.
- Production .NET collections maintain an internal integer counter: `private int _version`.
- Any mutating operation (`Add`, `Insert`, `RemoveAt`, `Clear`) increments `_version++`.
- The enumerator captures `int capturedVersion = _version` on initialization. On every step of `MoveNext()`, if `_version != capturedVersion`, it immediately throws an `InvalidOperationException`.

---

### 1.8 Interview Spoken Drill (20–30 Seconds)

> *"An array is a contiguous block of memory where each element can be accessed in $O(1)$ time via simple arithmetic: base address plus index times element size. Because elements are stored consecutively, arrays exploit CPU spatial locality, fetching 64 bytes into L1 cache lines at once for near 100% sequential cache hit rates. Dynamic arrays achieve $O(1)$ amortized append time by doubling their internal capacity whenever the buffer fills, meaning the total copying cost over $N$ insertions is bounded by $2N$. When removing elements from dynamic arrays, we must clear the vacated slot to default(T) to prevent GC reference loitering."*

---

### 1.9 ⚙️ Core Operations Deep-Dive: Dynamic Array Geometric Resizing & Reader-Writer Compaction

#### Dimension 1: Operation Contract & Big-O Bounds

##### Core Operations (`Add`, `Insert`, `RemoveAt`, `RemoveDuplicates`)
- **Signatures:**
  - `public void Add(T item)`: Appends element to tail; triggers $2\times$ capacity doubling if buffer is full.
  - `public void Insert(int index, T item)`: Shifts subsequent elements rightward by 1 slot and writes `item` at `index`.
  - `public void RemoveAt(int index)`: Shifts elements leftward, decrements `_size`, and clears vacated slot to `default(T)` to eliminate GC reference loitering.
  - `public int RemoveDuplicates(int[] nums)`: In-place array compaction using reader-writer two-pointer technique.
- **Preconditions:**
  - $0 \le \text{index} \le \text{\_size}$ for `Insert`; $0 \le \text{index} < \text{\_size}$ for `RemoveAt`.
  - Array memory is contiguous; capacity $\ge 0$.
- **Postconditions:**
  - `Add`: Element resides at `_items[_size - 1]`; capacity invariant $0 \le \text{\_size} \le \text{\_capacity}$ preserved.
  - `RemoveAt`: Vacated slot `_items[_size]` is set to `default(T)`; relative order of non-removed elements preserved.
  - `RemoveDuplicates`: Subarray `nums[0..write-1]` contains all distinct values in original relative order; returns length `write`.
- **Complexity Bounds:**

| Operation | Time Complexity (Amortized) | Time Complexity (Worst-Case) | Auxiliary Space | Allocation Policy |
| :--- | :--- | :--- | :--- | :--- |
| **`Add(item)`** | $O(1)$ | $O(N)$ (buffer doubling copy) | $O(1)$ | Geometric doubling ($2\times$) |
| **`Insert(i, item)`** | $O(N)$ | $O(N)$ (shifts $N - i$ elements) | $O(1)$ | Allocates only if full |
| **`RemoveAt(i)`** | $O(N)$ | $O(N)$ (shifts $N - i - 1$ elements) | $O(1)$ | 0 allocations |
| **`RemoveDuplicates`** | $O(N)$ single pass | $O(N)$ | $O(1)$ | 0 allocations (in-place) |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                       Dynamic Array `Add(item)` Execution
                                       │
                              [_size == _capacity?]
                                       │
                         ┌─────────────┴─────────────┐
                        YES                          NO
                         │                           │
            [newCap = _capacity == 0                 │
                      ? DefaultCap : _capacity * 2;  │
             EnsureCapacity(newCap)]                 │
                         │                           │
                         └─────────────┬─────────────┘
                                       ▼
                             [_items[_size] = item;
                              _size++;
                              _version++]
                                       │
                                       ▼
                                    [Return]
```

```
                 Reader-Writer In-Place Compaction (`RemoveDuplicates`)
                                       │
                                [write = 1; read = 1]
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 │
              [read < nums.Length?]                     │
                      │                                 │
           ┌──────────┴──────────┐                      │
          YES                    NO                     │
           │                     │                      │
  [nums[read] != nums[write-1]?] └──────────────► [Return write]
           │
     ┌─────┴─────┐
    YES          NO
     │           │
[nums[write] = nums[read];   [read++]
 write++; read++]                │
     │                           │
     └───────────────────────────┴──► Loop back to [read < nums.Length?]
```

---

#### Dimension 3: Visual ASCII State Transitions

##### 1. Geometric Doubling on `Add(5)` (Old Cap = 4, New Cap = 8)
```
Before Resizing:
Index:     0    1    2    3
_items:  [ 10 , 20 , 30 , 40 ]  (_size = 4, _capacity = 4)

Step 1: Allocate new array of size 8:
newItems: [ - , - , - , - , - , - , - , - ]

Step 2: Copy elements 0..3:
newItems: [ 10 , 20 , 30 , 40 , - , - , - , - ]

Step 3: Assign new element and update pointer:
newItems: [ 10 , 20 , 30 , 40 , 50 , - , - , - ]
_items = newItems; _size = 5; _capacity = 8;
```

##### 2. Reader-Writer Two-Pointer Compaction (`[1, 1, 2, 2, 3]`)
```
Initial: write = 1, read = 1
[ 1 | 1 , 2 , 2 , 3 ]  nums[read=1] == nums[write-1=0] (1 == 1) -> Duplicate! Skip. read -> 2

Step 1: write = 1, read = 2
[ 1 | 1 , 2 , 2 , 3 ]  nums[read=2] != nums[write-1=0] (2 != 1) -> Unique!
Copy nums[write=1] = nums[read=2] (2), write -> 2, read -> 3
State: [ 1 , 2 | 2 , 2 , 3 ]

Step 2: write = 2, read = 3
[ 1 , 2 | 2 , 2 , 3 ]  nums[read=3] == nums[write-1=1] (2 == 2) -> Duplicate! Skip. read -> 4

Step 3: write = 2, read = 4
[ 1 , 2 | 2 , 2 , 3 ]  nums[read=4] != nums[write-1=1] (3 != 2) -> Unique!
Copy nums[write=2] = nums[read=4] (3), write -> 3, read -> 5

Terminates (read == 5). Distinct prefix: [1, 2, 3], length write = 3.
```

---

#### Dimension 4: Invariant Preservation Proof

##### Theorem 1: Amortized $O(1)$ Append via Potential Function $\Phi$
Let the potential function after $i$ operations be defined as:
$$\Phi_i = 2 \cdot \text{\_size}_i - \text{\_capacity}_i$$
1. **Non-negativity:** Immediately after resizing from $C$ to $2C$, $\text{\_size} = C + 1$ and $\text{\_capacity} = 2C$, so $\Phi = 2(C + 1) - 2C = 2 \ge 0$. Since $\text{\_size} \ge \text{\_capacity}/2$ at all times when capacity $> 0$, $\Phi_i \ge 0$ holds strictly.
2. **Case A: `Add` without resizing ($\text{\_size} < \text{\_capacity}$):**
   - Actual cost $c_i = 1$ (writing to slot).
   - $\Delta \Phi = (2(\text{\_size} + 1) - \text{\_capacity}) - (2 \cdot \text{\_size} - \text{\_capacity}) = 2$.
   - Amortized cost: $\hat{c}_i = c_i + \Delta \Phi = 1 + 2 = 3 = O(1)$.
3. **Case B: `Add` with resizing from $C$ to $2C$:**
   - Actual cost $c_i = C + 1$ (copying $C$ elements + inserting 1 element).
   - Prior potential: $\Phi_{i-1} = 2C - C = C$.
   - Post potential: $\Phi_i = 2(C + 1) - 2C = 2$.
   - $\Delta \Phi = 2 - C$.
   - Amortized cost: $\hat{c}_i = c_i + \Delta \Phi = (C + 1) + (2 - C) = 3 = O(1)$.
Therefore, the amortized cost of every append operation is bounded by constant 3, proving $O(1)$ amortized complexity.

##### Theorem 2: Reader-Writer Compaction Induction
Let array prefix $P(k) = \text{nums}[0..\text{write}-1]$ at iteration $k$.
- **Base Case ($k=1$):** `write = 1`. $P(1) = [\text{nums}[0]]$ is sorted and strictly distinct.
- **Inductive Step:** If $\text{nums}[\text{read}] \ne \text{nums}[\text{write}-1]$, then since the array is sorted, $\text{nums}[\text{read}] > \text{nums}[\text{write}-1]$. Writing it to `nums[write]` and advancing `write` preserves strict monotonicity $\text{nums}[\text{write}-1] < \text{nums}[\text{write}]$, keeping the prefix unique. If equal, skipping maintains the distinct invariant without overwriting valid data.

---

#### Dimension 5: Edge Case Matrix

| Edge Case | State / Input | Algorithmic Mechanism | Invariant Preservation |
| :--- | :--- | :--- | :--- |
| **Initial Capacity Zero** | `capacity = 0` | Backing array initialized to `Array.Empty<T>()`; first add resizes to 4 | Zero allocations until first write |
| **Insert at Index Zero** | $i = 0$ | Shifts all $N$ elements right by 1 slot: `Array.Copy(..., 0, ..., 1, N)` | Head correctly populated; order preserved |
| **Remove Last Element** | $i = \text{\_size} - 1$ | No shifts needed; `_size--`; `_items[_size] = default(T)` | $O(1)$ fast path deletion |
| **GC Reference Loitering** | Deleting reference type | Explicit `_items[_size] = default(T)!` severs object graph reference | Enables immediate garbage collection of deleted item |
| **Concurrent Modification** | Modifying during `foreach` | `_version++` on every write; enumerator validates `version == captured` | Fail-fast: throws `InvalidOperationException` |
| **All Duplicates in Compaction** | `[1, 1, 1, 1]` | `read` advances to end without writing; `write` remains 1 | Correctly returns length 1 |

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Dynamic Array

### 2.1 Complete C# Implementation (`DynamicArray<T>`)

```csharp
using System;
using System.Collections;
using System.Collections.Generic;

/// <summary>
/// A production-grade generic dynamic array implemented from scratch in C#.
/// Demonstrates geometric doubling, boundary validation, fail-fast iteration,
/// and reference loitering prevention for managed runtimes.
/// </summary>
/// <typeparam name="T">The element type stored in the array.</typeparam>
public class DynamicArray<T> : IEnumerable<T> {
    private const int DefaultCapacity = 4;
    private T[] _items;
    private int _size;
    private int _version;

    /// <summary>
    /// Initializes a new instance with the specified initial capacity.
    /// </summary>
    public DynamicArray(int capacity = DefaultCapacity) {
        if (capacity < 0) {
            throw new ArgumentOutOfRangeException(nameof(capacity), "Capacity cannot be negative.");
        }
        _items = capacity == 0 ? Array.Empty<T>() : new T[capacity];
        _size = 0;
        _version = 0;
    }

    /// <summary>
    /// Gets the number of active elements contained in the dynamic array.
    /// </summary>
    public int Count => _size;

    /// <summary>
    /// Gets the total number of elements the internal data structure can hold without resizing.
    /// </summary>
    public int Capacity => _items.Length;

    /// <summary>
    /// Gets a value indicating whether the array contains no elements.
    /// </summary>
    public bool IsEmpty => _size == 0;

    /// <summary>
    /// Gets or sets the element at the specified index.
    /// </summary>
    public T this[int index] {
        get {
            ValidateIndex(index);
            return _items[index];
        }
        set {
            ValidateIndex(index);
            _items[index] = value;
            _version++;
        }
    }

    /// <summary>
    /// Adds an element to the end of the dynamic array.
    /// Time Complexity: Amortized O(1), Worst-Case O(N) when resizing.
    /// </summary>
    public void Add(T item) {
        if (_size == _items.Length) {
            EnsureCapacity(_size + 1);
        }
        _items[_size] = item;
        _size++;
        _version++;
    }

    /// <summary>
    /// Inserts an element into the dynamic array at the specified index.
    /// Time Complexity: O(N) due to rightward element shifting.
    /// </summary>
    public void Insert(int index, T item) {
        if ((uint)index > (uint)_size) {
            throw new ArgumentOutOfRangeException(nameof(index), $"Index must be between 0 and {_size}.");
        }

        if (_size == _items.Length) {
            EnsureCapacity(_size + 1);
        }

        // Shift elements to the right by 1 slot: [index .. _size - 1] -> [index + 1 .. _size]
        if (index < _size) {
            Array.Copy(_items, index, _items, index + 1, _size - index);
        }

        _items[index] = item;
        _size++;
        _version++;
    }

    /// <summary>
    /// Removes the element at the specified index.
    /// Time Complexity: O(N) due to leftward element shifting.
    /// </summary>
    public void RemoveAt(int index) {
        ValidateIndex(index);
        _size--;

        // Shift elements to the left by 1 slot: [index + 1 .. _size] -> [index .. _size - 1]
        if (index < _size) {
            Array.Copy(_items, index + 1, _items, index, _size - index);
        }

        // CRITICAL: Prevent GC reference loitering for reference types
        _items[_size] = default(T)!;
        _version++;

        CheckShrink();
    }

    /// <summary>
    /// Removes the first occurrence of a specific item from the dynamic array.
    /// </summary>
    public bool Remove(T item) {
        int index = IndexOf(item);
        if (index >= 0) {
            RemoveAt(index);
            return true;
        }
        return false;
    }

    /// <summary>
    /// Searches for the specified item and returns the zero-based index of the first occurrence.
    /// Time Complexity: O(N)
    /// </summary>
    public int IndexOf(T item) {
        var comparer = EqualityComparer<T>.Default;
        for (int i = 0; i < _size; i++) {
            if (comparer.Equals(_items[i], item)) {
                return i;
            }
        }
        return -1;
    }

    /// <summary>
    /// Determines whether an element is in the dynamic array.
    /// </summary>
    public bool Contains(T item) => IndexOf(item) >= 0;

    /// <summary>
    /// Removes all elements from the dynamic array and frees references for GC.
    /// </summary>
    public void Clear() {
        if (_size > 0) {
            Array.Clear(_items, 0, _size);
            _size = 0;
        }
        _version++;
    }

    /// <summary>
    /// Sets the capacity to the actual number of elements if that number is less than 90 percent of current capacity.
    /// </summary>
    public void TrimExcess() {
        int threshold = (int)(_items.Length * 0.9);
        if (_size < threshold) {
            Capacity = _size;
        }
    }

    /// <summary>
    /// Resizes the internal buffer capacity explicitly.
    /// </summary>
    private int CapacitySetter {
        set {
            if (value < _size) {
                throw new ArgumentOutOfRangeException(nameof(value), "Capacity cannot be less than current Count.");
            }
            if (value != _items.Length) {
                if (value > 0) {
                    T[] newItems = new T[value];
                    if (_size > 0) {
                        Array.Copy(_items, newItems, _size);
                    }
                    _items = newItems;
                } else {
                    _items = Array.Empty<T>();
                }
                _version++;
            }
        }
    }

    /// <summary>
    /// Ensures that the internal array has at least the specified capacity.
    /// Employs geometric doubling (2x).
    /// </summary>
    private void EnsureCapacity(int minCapacity) {
        if (_items.Length < minCapacity) {
            int newCapacity = _items.Length == 0 ? DefaultCapacity : _items.Length * 2;
            if (newCapacity < minCapacity) {
                newCapacity = minCapacity;
            }
            T[] newArray = new T[newCapacity];
            if (_size > 0) {
                Array.Copy(_items, newArray, _size);
            }
            _items = newArray;
        }
    }

    /// <summary>
    /// Shrinks the internal buffer when utilization drops to 25% or below.
    /// Reduces memory consumption while avoiding resize thrashing.
    /// </summary>
    private void CheckShrink() {
        if (_size > 0 && _size <= _items.Length / 4 && _items.Length > DefaultCapacity) {
            int newCapacity = Math.Max(_items.Length / 2, DefaultCapacity);
            T[] newArray = new T[newCapacity];
            Array.Copy(_items, newArray, _size);
            _items = newArray;
        }
    }

    private void ValidateIndex(int index) {
        if ((uint)index >= (uint)_size) {
            throw new ArgumentOutOfRangeException(nameof(index), $"Index {index} was out of range [0, {_size - 1}].");
        }
    }

    /// <summary>
    /// Returns an enumerator that iterates through the dynamic array.
    /// Provides fail-fast protection against concurrent modification.
    /// </summary>
    public IEnumerator<T> GetEnumerator() {
        int capturedVersion = _version;
        for (int i = 0; i < _size; i++) {
            if (capturedVersion != _version) {
                throw new InvalidOperationException("Collection was modified; enumeration operation may not execute.");
            }
            yield return _items[i];
        }
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}
```

---

### 2.2 Visual Invariant Traces

#### Trace 1: `Add(T item)` with Geometric Resizing
Initial capacity = 2, elements = `[10, 20]`, `_size = 2`. Adding `30`:

```
1. Before Add(30):
   _items: [ 10 , 20 ]  (Size = 2, Capacity = 2)

2. Capacity Check (_size == _items.Length):
   Triggers EnsureCapacity(3):
   Allocate new buffer of size 4: [ 0, 0, 0, 0 ]
   Array.Copy(_items, newArray, 2)
   _items points to new buffer:   [ 10, 20, 0, 0 ]

3. Insert & Increment:
   _items[_size] = 30 -> [ 10, 20, 30, 0 ]
   _size++ -> 3
   _version++
   Invariant maintained: 0 <= Count (3) <= Capacity (4).
```

#### Trace 2: `RemoveAt(1)` with Reference Loitering Prevention
Elements = `["A", "B", "C", "D"]`, `_size = 4`. Call `RemoveAt(1)`:

```
1. Target: index 1 ("B")
2. Array.Copy: Shift rightward elements ["C", "D"] left by 1:
   _items: [ "A", "C", "D", "D" ]
3. Decrement size: _size = 3
4. Prevent Loitering:
   _items[3] = default(string) -> null!
   _items: [ "A", "C", "D", null ]
   _version++
   GC can now reclaim "B" immediately. No reference loitering!
```

---

### 2.3 Comprehensive Verification Test Suite

```csharp
using System;
using System.Diagnostics;

public static class DynamicArrayVerificationSuite {
    public static void RunAllTests() {
        TestAppendAndDoubling();
        TestInsertAndShifts();
        TestRemoveAtAndLoitering();
        TestShrinkHeuristic();
        TestFailFastEnumerator();
        Console.WriteLine("✅ All DynamicArray<T> Unit Tests Passed Successfully!");
    }

    private static void TestAppendAndDoubling() {
        var arr = new DynamicArray<int>(2);
        Debug.Assert(arr.Capacity == 2);
        arr.Add(10);
        arr.Add(20);
        Debug.Assert(arr.Count == 2);
        Debug.Assert(arr.Capacity == 2);

        // Triggers doubling to 4
        arr.Add(30);
        Debug.Assert(arr.Count == 3);
        Debug.Assert(arr.Capacity == 4);
        Debug.Assert(arr[0] == 10 && arr[1] == 20 && arr[2] == 30);
    }

    private static void TestInsertAndShifts() {
        var arr = new DynamicArray<string>();
        arr.Add("A");
        arr.Add("C");
        arr.Insert(1, "B"); // [A, B, C]
        Debug.Assert(arr.Count == 3);
        Debug.Assert(arr[0] == "A" && arr[1] == "B" && arr[2] == "C");

        arr.Insert(0, "START"); // [START, A, B, C]
        Debug.Assert(arr[0] == "START" && arr[1] == "A");
    }

    private static void TestRemoveAtAndLoitering() {
        var arr = new DynamicArray<string>();
        arr.Add("first");
        arr.Add("second");
        arr.Add("third");

        arr.RemoveAt(1); // Removes "second"
        Debug.Assert(arr.Count == 2);
        Debug.Assert(arr[0] == "first");
        Debug.Assert(arr[1] == "third");
        Debug.Assert(arr.IndexOf("second") == -1);
    }

    private static void TestShrinkHeuristic() {
        var arr = new DynamicArray<int>(16);
        for (int i = 0; i < 16; i++) arr.Add(i);
        Debug.Assert(arr.Capacity == 16);

        // Remove elements until size <= capacity / 4 (4 elements)
        for (int i = 0; i < 12; i++) arr.RemoveAt(arr.Count - 1);
        Debug.Assert(arr.Count == 4);
        Debug.Assert(arr.Capacity == 8); // Shrinks to 8
    }

    private static void TestFailFastEnumerator() {
        var arr = new DynamicArray<int>();
        arr.Add(1);
        arr.Add(2);

        bool caught = false;
        try {
            foreach (var item in arr) {
                if (item == 1) arr.Add(99); // Concurrent modification
            }
        } catch (InvalidOperationException) {
            caught = true;
        }
        Debug.Assert(caught, "Enumerator failed to throw on concurrent mutation!");
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### 3.1 Formal Amortized Analysis Proof

Why is dynamic array resizing considered $O(1)$ when a single doubling operation takes $O(N)$?

#### 1. The Aggregate Method
Suppose we insert $N = 2^k$ elements into an initially empty array of capacity 1.
- Resizing occurs at insertions: $1, 2, 4, 8, 16, \dots, 2^k$.
- The number of copies performed during each resize is:
  $$\text{Total Copies} = 1 + 2 + 4 + 8 + \dots + 2^k = \sum_{j=0}^{k} 2^j = 2^{k+1} - 1 = 2N - 1 < 2N$$
- In addition, each element is written once upon insertion ($N$ writes).
- Total operations for $N$ appends:
  $$T(N) = N \text{ (regular writes)} + (2N - 1) \text{ (copy operations)} < 3N$$
- Average cost per operation:
  $$\mathbf{\text{Amortized Cost} = \frac{T(N)}{N} < \frac{3N}{N} = 3 \implies O(1)}$$

#### 2. The Potential Method (Physicist's Method)
Define the potential function $\Phi$:
$$\mathbf{\Phi(D_i) = 2 \cdot \text{size}_i - \text{capacity}_i}$$

Notice the properties of $\Phi$:
- Initially, $\text{size}_0 = 0, \text{capacity}_0 = 0 \implies \Phi(D_0) = 0$.
- Immediately before a resize, $\text{size} = \text{capacity} \implies \Phi = 2 \cdot \text{size} - \text{size} = \text{size} \ge 0$.
- Immediately after doubling, $\text{size}' = \text{size}, \text{capacity}' = 2 \cdot \text{size} \implies \Phi' = 2 \cdot \text{size} - 2 \cdot \text{size} = 0$.
- Since $\Phi(D_i) \ge 0$ for all states after the first insertion, the amortized cost upper-bounds the true cost:
  $$\hat{c}_i = c_i + \Phi(D_i) - \Phi(D_{i-1})$$

**Case A: Insertion without Resizing ($c_i = 1$):**
- $\text{size}_i = \text{size}_{i-1} + 1$, $\text{capacity}_i = \text{capacity}_{i-1}$.
- $\Delta\Phi = [2(\text{size}_{i-1} + 1) - \text{capacity}] - [2 \cdot \text{size}_{i-1} - \text{capacity}] = 2$.
- $\mathbf{\hat{c}_i = 1 + 2 = 3 = O(1)}$.

**Case B: Insertion triggering Doubling ($c_i = \text{size}_{i-1} + 1$):**
- $\text{size}_i = \text{size}_{i-1} + 1$, $\text{capacity}_i = 2 \cdot \text{size}_{i-1}$.
- $\Phi(D_{i-1}) = 2 \cdot \text{size}_{i-1} - \text{size}_{i-1} = \text{size}_{i-1}$.
- $\Phi(D_i) = 2(\text{size}_{i-1} + 1) - 2 \cdot \text{size}_{i-1} = 2$.
- $\Delta\Phi = 2 - \text{size}_{i-1}$.
- $\mathbf{\hat{c}_i = (\text{size}_{i-1} + 1) + (2 - \text{size}_{i-1}) = 3 = O(1)}$.

In both cases, the amortized cost is strictly bounded by **3 operations**!

---

### 3.2 Shrink Thrashing Analysis: Why 25% Threshold?

A naive shrinking policy would be: *"When size drops to $50\%$ of capacity, shrink capacity to half."*
- **The Catastrophic Thrashing Scenario:**
  - Suppose capacity is $N$ and size is $N$.
  - Operation 1: `Add()` $\implies$ triggers doubling to $2N$ ($O(N)$ copies).
  - Operation 2: `RemoveAt()` $\implies$ size drops to $N$ (50%) $\implies$ triggers halving to $N$ ($O(N)$ copies).
  - Operation 3: `Add()` $\implies$ triggers doubling to $2N$ ($O(N)$ copies).
  - An alternating sequence of `Add` and `RemoveAt` costs $O(N)$ on **every single operation**!
- **The Solution:** Decouple growth and shrink thresholds.
  - Double capacity when $100\%$ full ($\text{Count} == \text{Capacity}$).
  - Halve capacity only when utilization drops to **$25\%$ or below** ($\text{Count} \le \text{Capacity} / 4$).
  - After halving, the array is $50\%$ full. It requires at least $N/2$ insertions to trigger the next doubling, or at least $N/4$ deletions to trigger another halving, guaranteeing amortized $O(1)$ operations throughout!

---

## 4. 🎬 DEMONSTRATE: Problem Walkthroughs

### 4.1 [LeetCode 27] Remove Element

> Given an integer array `nums` and an integer `val`, remove all occurrences of `val` in-place and return the number of elements which are not equal to `val`.
>
> **Constraint:** $O(1)$ extra memory. Do not allocate another array!

#### Step 1: The Brute Force Instinct ($O(N^2)$)
A beginner's instinct is: *"Whenever I see `nums[i] == val`, delete it by shifting all elements after it one step left."*

```
nums = [3, 2, 2, 3], val = 3

i = 0: nums[0] is 3 (matches val!)
Shift: nums[1] -> nums[0], nums[2] -> nums[1], nums[3] -> nums[2]
Array becomes: [2, 2, 3, ?]  (cost: N-1 shifts)
Repeat scan...
```
- For an array of size $N$ filled with `val`, shifting on every match results in $(N-1) + (N-2) + \dots + 1 = \frac{N(N-1)}{2}$ shifts.
- **Time Complexity:** $O(N^2)$ — unacceptable for $N = 10^5$.
- **Root Cause:** Repeatedly copying the same elements over and over.

---

#### Step 2: The Optimal Insight — Two Pointers (Reader & Writer)
Instead of shifting elements every time we find a match, invert the question:

> [!TIP]
> **Inversion Principle:** Don't delete what you want to remove. Collect and copy what you want to **keep**.

Maintain two pointers moving from left to right:
1. `read`: Scans every element from index $0$ to $N - 1$.
2. `write`: Tracks the destination index for the next valid element (`nums[read] != val`).

#### The Loop Invariant:
$$\mathbf{\text{Everything in } nums[0 \dots write - 1] \text{ is guaranteed to be a valid element } \ne val.}$$

---

#### Step 3: Visual Trace

Let `nums = [3, 2, 2, 3]`, `val = 3`:

```
Initial:
write = 0
nums:  [ 3,  2,  2,  3 ]
         ▲
        read = 0 (nums[0] == 3 -> MATCH! Skip it. write stays at 0)
─────────────────────────────────────────────────────────────
Step 1:
write = 0
nums:  [ 3,  2,  2,  3 ]
             ▲
            read = 1 (nums[1] == 2 -> KEEP IT!)
Copy nums[read] into nums[write], then write++:
nums:  [ 2,  2,  2,  3 ]
             ▲
           write = 1
─────────────────────────────────────────────────────────────
Step 2:
nums:  [ 2,  2,  2,  3 ]
                 ▲
                read = 2 (nums[2] == 2 -> KEEP IT!)
Copy nums[read] into nums[write], then write++:
nums:  [ 2,  2,  2,  3 ]
                 ▲
               write = 2
─────────────────────────────────────────────────────────────
Step 3:
nums:  [ 2,  2,  2,  3 ]
                     ▲
                    read = 3 (nums[3] == 3 -> MATCH! Skip it)
─────────────────────────────────────────────────────────────
End of Loop:
read finishes. Return write = 2.
The first 2 elements are [2, 2].
```

---

#### Step 4: Production C# Implementation

```csharp
public class SolutionRemoveElement {
    /// <summary>
    /// Removes all occurrences of val in-place in O(N) time and O(1) space
    /// using the two-pointer Reader & Writer pattern.
    /// </summary>
    public int RemoveElement(int[] nums, int val) {
        if (nums == null || nums.Length == 0) return 0;

        int write = 0;

        for (int read = 0; read < nums.Length; read++) {
            if (nums[read] != val) {
                nums[write] = nums[read];
                write++;
            }
        }

        return write; // 'write' represents the count of valid retained elements
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — `read` visits each element exactly once.
- **Space Complexity:** $O(1)$ — strictly two integer pointers (`read`, `write`). Zero heap allocations.

---

### 4.2 [LeetCode 26] Remove Duplicates from Sorted Array

> Given an integer array `nums` sorted in **non-decreasing order**, remove duplicates in-place such that each unique element appears only **once**. The relative order of the elements should be kept the same.
> Return the number of unique elements in `nums`.

#### The Sorted Invariant:
Because `nums` is sorted, **all identical elements are physically contiguous**!
- We do not need a `HashSet` ($O(N)$ memory).
- An incoming element `nums[read]` is a duplicate if and only if it equals the last unique element written: `nums[read] == nums[write - 1]`.

#### Production C# Implementation:

```csharp
public class SolutionRemoveDuplicates {
    /// <summary>
    /// Removes duplicate values from a sorted array in-place.
    /// Time Complexity: O(N)
    /// Space Complexity: O(1)
    /// </summary>
    public int RemoveDuplicates(int[] nums) {
        if (nums == null || nums.Length == 0) return 0;

        // The first element is always unique
        int write = 1;

        for (int read = 1; read < nums.Length; read++) {
            // If current element is different from the last written unique element
            if (nums[read] != nums[write - 1]) {
                nums[write] = nums[read];
                write++;
            }
        }

        return write;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — Single linear pass across the array.
- **Space Complexity:** $O(1)$ auxiliary space.

---

## 5. 🏋️ PRACTICE: Your Daily Challenges

Reinforce in-place array transformations on LeetCode:

### Problem 1 (Warmup): LeetCode 1929 — Concatenation of Array (Easy)
- **Goal:** Given `nums` of length $N$, return an array `ans` of length $2N$ where `ans[i] == nums[i]` and `ans[i + n] == nums[i]`.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.
- **Hint:** Allocate an array of size $2N$. In a single loop from $0$ to $N - 1$, populate both `ans[i]` and `ans[i + n]`.

### Problem 2 (Core Challenge): LeetCode 27 — Remove Element (Easy)
- **Goal:** Remove all instances of `val` in-place using the Reader/Writer two-pointer technique.
- **Target Complexity:** $O(N)$ time, $O(1)$ auxiliary space.

### Problem 3 (Adjacent Duplicate Invariant): LeetCode 26 — Remove Duplicates from Sorted Array (Easy)
- **Goal:** Filter out duplicate values in a sorted array by checking `nums[read] != nums[write - 1]`.
- **Target Complexity:** $O(N)$ time, $O(1)$ auxiliary space.

### Bonus Challenge: LeetCode 283 — Move Zeroes (Easy)
- **Goal:** Move all zeros to the end of the array while maintaining the relative order of non-zero elements.
- **Hint:** Writer collects non-zeroes; after `read` finishes, fill `nums[write .. N - 1]` with `0`!

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                   In-Place Array Traversal Decision Tree               │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Filter/Remove elements matching target value?
                   │   └─► Reader & Writer Pointers (nums[read] != val) [LC 27]
                   │
                   ├─► Filter duplicates from SORTED array?
                   │   └─► Reader & Writer Pointers (nums[read] != nums[write - 1]) [LC 26]
                   │
                   ├─► Rotate array by K steps in O(1) space?
                   │   └─► 3-Reversal Technique (Reverse all, reverse K, reverse rest) (Day 2) [LC 189]
                   │
                   └─► Partition array into 3 categories (0s, 1s, 2s)?
                       └─► Dutch National Flag (3-Pointer Low, Mid, High) (Day 2) [LC 75]
```

---

## 7. 🎯 Day 1 Checkpoint Questions

Verify your foundational array, memory, and container intuition:

1. **Memory Math:** If `arr[0]` is located at hex address `0x2000`, and each element is an 8-byte `long` integer, what is the exact hexadecimal memory address of `arr[5]`? Show the address calculation formula.
2. **Dynamic Array Loitering:** In `DynamicArray<T>.RemoveAt(int index)`, why is `_items[_size] = default(T)!` strictly necessary for reference types? What happens in .NET Garbage Collection if this assignment is omitted?
3. **Amortized Analysis:** In the Potential Method proof for dynamic array resizing, what is the potential $\Phi$ immediately before and immediately after an array doubles its capacity?
4. **Shrink Heuristic:** Why does halving the array capacity when it becomes $50\%$ empty cause severe performance degradation (thrashing), and how does the $25\%$ threshold resolve it?
5. **Reader / Writer Invariant:** In the `RemoveElement` problem, if the array has no matching values (e.g. `nums = [1, 2, 3]`, `val = 5`), what happens to `read` and `write` at every step? Does the code still execute correctly?
