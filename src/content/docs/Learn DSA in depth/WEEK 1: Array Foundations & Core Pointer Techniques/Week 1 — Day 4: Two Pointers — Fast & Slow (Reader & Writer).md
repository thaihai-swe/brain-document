---
title: "Week 1 — Day 4: Two Pointers — Fast & Slow (Reader & Writer)"
---

Welcome to Day 4! Today we master the **Fast & Slow Pointer Pattern** (also widely known as the **Reader / Writer** or **Leader / Follower** pattern).

While the Opposite-Ends pattern (Day 3) moves inward from both boundaries, Fast & Slow pointers move in the **same direction** at different speeds or under different advancing conditions. It is the premier technique for in-place array transformations, filtering, partitioning, and sequence compression with $O(1)$ auxiliary memory.

---

## 1. 🧠 TEACH: The Mental Model of Reader & Writer

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* The **Fast & Slow (Reader & Writer) Two-Pointer Pattern** is an asymmetric unidirectional traversal where a `read` pointer inspects elements while a `write` pointer anchors the boundary of processed, valid data.
  - *Core Invariants:* Compaction Invariant: $write \le read$ at all times; subarray $[0 .. write-1]$ contains only elements satisfying the retention predicate; subarray $[write .. read-1]$ contains discarded/overwritable garbage; $[read .. N-1]$ contains unprocessed elements.
  - *Misconception Check:* In-place deletion does *not* require shifting remaining elements left on every deletion ($O(N^2)$); copying valid elements forward to `write` achieves $O(N)$ single-pass compaction.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(N^2)$ cascade of memory shifts caused by calling `Array.Copy` or naive deletion loops.
  - *Complexity Advantage:* Reduces time complexity from $O(N^2)$ to $O(N)$ while maintaining strictly $O(1)$ auxiliary space.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Remove element in-place", "remove duplicates from sorted array", "move zeroes to end", "filter array without extra memory".
  - *When to Avoid / Failure Modes:* When original array elements must not be modified or overwritten; when non-contiguous sequence preservation requires secondary indices.
- **4. WHERE:**
  - *Physical CLR Memory:* Sequential streaming read and sequential write to the same buffer; zero GC allocations; near 100% L1 data cache hits due to monotonic forward traversal.
  - *Production Systems:* In-memory database log compaction, garbage collector mark-and-compact phases, disk sector defragmentation.
- **5. WHO:**
  - *Spoken Script:* "I use a reader pointer to scan every element and a writer pointer to anchor the boundary of kept data. The writer only advances when the reader encounters an element that meets the retention rule, overwriting discarded slots in-place in $O(N)$ time and $O(1)$ memory."
  - *Interviewer Evaluation Lens:* Checks strict enforcement of $write \le read$, correct handling of arrays with zero deletions, and proper return of final length $write$.
- **6. HOW:**
  - *Cost Model:* Time: $\Theta(N)$ single pass; Space: $O(1)$ auxiliary memory.
  - *State Transition Trace:* `nums=[0, 1, 0, 3, 12] -> write=0; read=0 (val 0, skip); read=1 (val 1, nums[write++]=1); read=2 (val 0, skip); read=3 (val 3, nums[write++]=3); read=4 (val 12, nums[write++]=12) -> final write=3, fill rest with 0 -> [1, 3, 12, 0, 0]`.


### 1.1 Physical Mental Model: The Conveyor Inspector (Reader) & Scribe (Writer)

In-place filtering and deduplication without auxiliary memory mirrors a factory conveyor belt staffed by two workers moving in the same direction:

```
       ======================================================================
         PHYSICAL ANALOGY: INSPECTOR (READER) & SCRIBE (WRITER)
       ======================================================================

       Conveyor Belt moving items from right to left:
       
       [ACCEPTED CLEAN ZONE]      [GARBAGE / OVERWRITABLE]    [RAW UNINSPECTED ITEMS]
       [ 1 ]   [ 3 ]   [ 12 ]       [ ? ]       [ ? ]           [ 0 ]   [ 5 ]   [ 8 ]
                                      ^                           ^
                                      |                           |
                                Scribe (write)              Inspector (read)
       
       1. Inspector (read) walks ahead examining every item one by one.
       2. If item is DEFECTIVE (e.g. value 0): Inspector steps over it. Scribe waits.
       3. If item is VALID: Scribe copies it into nums[write], and both advance!
       
       🛡️ THE NON-OVERWRITE GUARANTEE:
       Because write <= read at all times, the Scribe NEVER stomps on an uninspected
       item! The garbage zone in between acts as an in-place shock absorber.
```

```
       ======================================================================
         K-DUPLICATE DEDUPLICATION: THE "K STEPS BEHIND" RULER (LC 80)
       ======================================================================

       Problem: Allow at most K = 2 copies of any number in a sorted array.
       Do we need a Hash Map? NO!
       
       Just look K steps backward from where the Scribe is about to write:
       
       [ 1 ]   [ 1 ]   [ 2 ]   [ 2 ]   ... [ Candidate: 2 ]
                 ^                           ^
                 |                           |
             write - K                      read
       
       If nums[read] == nums[write - K]:
         We ALREADY have K copies of this number in the accepted zone! REJECT!
       If nums[read] != nums[write - K]:
         Fewer than K copies exist! ACCEPT: nums[write++] = nums[read].
```

---

### 1.2 The Dual-Zone Invariant
When you are asked to filter or reorder an array in-place, visualize the array being partitioned dynamically into three zones:

```
Index:    0               write                        read                    N-1
          ┌─────────────────┬────────────────────────────┬──────────────────────┐
Array:    │  Clean / Valid  │  Overwritten / Don't Care  │  Unprocessed Input   │
          └─────────────────┴────────────────────────────┴──────────────────────┘
          ◄─── Finalized ──►◄──────── Garbage ──────────►◄──── To Evaluate ────►
```

1. **`nums[0 .. write - 1]` (The Valid Zone):** Contains the accepted, finalized elements adhering to all problem constraints.
2. **`nums[write .. read - 1]` (The Garbage Zone):** Elements that have already been examined and either discarded or copied forward. They can be overwritten safely.
3. **`nums[read .. N - 1]` (The Raw Input Zone):** Elements waiting to be inspected by `read`.

---

### 1.2 Opposite-Ends vs. Fast & Slow: When to Use Which?

| Attribute | Opposite-Ends Pointers (Day 3) | Fast & Slow Pointers (Day 4) |
| :--- | :--- | :--- |
| **Direction** | Inward: `left++`, `right--` | Co-directional: `read++`, `write++` (conditional) |
| **Primary Goal** | Search pairs/triplets, optimize area/span | In-place filtering, deduplication, compaction |
| **Order Preservation** | May reverse or disrupt original order | **Preserves relative order** of retained elements |
| **Memory** | $O(1)$ extra space | $O(1)$ extra space |

---

### 1.3 ⚙️ Core Operations Deep-Dive: Fast & Slow In-Place Memory Overwrite & K-Frequency Boundary Invariants

#### Dimension 1: Operation Contract & Big-O Bounds

##### Compaction Primitives (`MoveZeroes`, `RemoveElement`, `RemoveDuplicatesII`)
- **Signatures:**
  - `public void MoveZeroes(int[] nums)`: Shifts non-zero elements to prefix while pushing zeroes to suffix in-place preserving stability.
  - `public int RemoveElement(int[] nums, int val)`: Overwrites occurrences of `val` in-place; returns count of surviving elements.
  - `public int RemoveDuplicatesII(int[] nums, int k = 2)`: Compacts sorted array allowing each distinct element at most $k$ occurrences.
- **Preconditions:**
  - $nums$ is non-null; length $N \ge 0$.
  - Array sorted non-decreasingly for `RemoveDuplicatesII`.
- **Postconditions:**
  - Prefix `nums[0..write-1]` contains filtered elements meeting problem criteria.
  - Relative arrival order of preserved elements strictly maintained.
  - Invariant $write \le read$ prevents reading uninitialized memory.
- **Complexity Bounds:**

| Operation | Time Complexity | Auxiliary Space | Element Writes / Swaps | In-Place? |
| :--- | :--- | :--- | :--- | :--- |
| **`MoveZeroes` (Single Pass)** | $O(N)$ | $O(1)$ | $\le N$ conditional swaps | Yes |
| **`RemoveElement`** | $O(N)$ single pass | $O(1)$ | $\le N$ writes | Yes |
| **`RemoveDuplicatesII` ($k$)** | $O(N)$ single pass | $O(1)$ | $\le N$ writes | Yes |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
               General $K$-Frequency In-Place Compaction
                                       │
                                   [write = 0]
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 │
              [read < nums.Length?]                     │
                      │                                 │
           ┌──────────┴──────────┐                      │
          YES                    NO                     │
           │                     │                      │
   [write < k ||                 └──────────────► [Return write]
    nums[read] != nums[write - k]?]
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

##### 1. Single-Pass Swap Compaction (`MoveZeroes` on `[0, 1, 0, 3, 12]`)
```
Initial: write = 0, read = 0
nums: [ 0 , 1 , 0 , 3 , 12 ] -> nums[0] == 0 (zero): skip write. read -> 1

Step 1: write = 0, read = 1
nums: [ 0 , 1 , 0 , 3 , 12 ] -> nums[1] == 1 != 0 (non-zero)
Swap(write, read) -> Swap(0, 1). write -> 1, read -> 2
State: [ 1 | 0 , 0 , 3 , 12 ]

Step 2: write = 1, read = 2
nums[2] == 0 (zero): skip write. read -> 3

Step 3: write = 1, read = 3
nums[3] == 3 != 0 (non-zero). Swap(1, 3) -> Swap index 1 with 3. write -> 2, read -> 4
State: [ 1 , 3 | 0 , 0 , 12 ]

Step 4: write = 2, read = 4
nums[4] == 12 != 0. Swap(2, 4) -> Swap index 2 with 4. write -> 3, read -> 5
State: [ 1 , 3 , 12 | 0 , 0 ]
Terminates (read == 5). Non-zero elements grouped at front in relative order!
```

##### 2. $K$-Frequency Bounded Compaction ($k = 2$ on `[1, 1, 1, 2, 2, 3]`)
```
read=0: write < 2 (0 < 2) -> nums[0]=1, write=1
read=1: write < 2 (1 < 2) -> nums[1]=1, write=2
State: [ 1 , 1 | 1 , 2 , 2 , 3 ] (write = 2)

read=2: nums[2] (1) == nums[write - 2 = 0] (1) -> ALREADY 2 COPIES! Skip.
read=3: nums[3] (2) != nums[write - 2 = 0] (1) -> Valid! nums[2] = 2, write=3
State: [ 1 , 1 , 2 | 2 , 2 , 3 ] (write = 3)

read=4: nums[4] (2) != nums[write - 2 = 1] (1) -> Valid! nums[3] = 2, write=4
State: [ 1 , 1 , 2 , 2 | 2 , 3 ] (write = 4)

read=5: nums[5] (3) != nums[write - 2 = 2] (2) -> Valid! nums[4] = 3, write=5
Final Prefix: [ 1, 1, 2, 2, 3 ], write = 5.
```

---

#### Dimension 4: Invariant Preservation Proof

##### Theorem 1: Reader-Writer Non-Destructive Lag Invariant
Let $read$ and $write$ be the fast and slow pointer indices initialized to $0$.
1. **Lag Property:**
   $write$ is incremented at most once per iteration, whereas $read$ is incremented unconditionally on every iteration.
   Therefore, $\forall t \ge 0, \text{write}(t) \le \text{read}(t)$.
2. **Safety Against Data Corruption:**
   Writing to `nums[write]` modifies memory at an index that has already been examined by `read` ($\text{write} \le \text{read}$).
   An uninspected element at index $j > \text{read}$ is never overwritten before `read` reaches $j$.
   Hence, the algorithm preserves all input information until it has been processed.

##### Theorem 2: $K$-Frequency Bounded Prefix Induction
In a sorted array, duplicate elements form contiguous subsequences.
- For any candidate element $x = \text{nums}[\text{read}]$:
  - If fewer than $k$ elements have been written ($\text{write} < k$), $x$ cannot violate the $k$-frequency bound.
  - If $\text{write} \ge k$: because the array is sorted, if $x == \text{nums}[\text{write} - k]$, then all elements in $\text{nums}[\text{write}-k .. \text{write}-1]$ must also equal $x$. Thus, exactly $k$ copies of $x$ are already present in the output prefix. Admitting $x$ would produce $k+1$ copies.
  - Conversely, if $x \ne \text{nums}[\text{write} - k]$, at most $k-1$ copies of $x$ reside in the tail of the prefix, so writing $x$ maintains the invariant that every distinct value appears at most $k$ times.

---

#### Dimension 5: Edge Case Matrix

| Edge Case | State / Input | Algorithmic Mechanism | Invariant Preservation |
| :--- | :--- | :--- | :--- |
| **Empty Array** | $N = 0$ | Loop condition `read < nums.Length` fails immediately; returns 0 | Zero memory access; safe $O(1)$ |
| **All Zeroes in MoveZeroes** | `[0, 0, 0]` | Condition `nums[read] != 0` never triggers; `write` remains 0 | Array unchanged; zero swaps |
| **No Zeroes in MoveZeroes** | `[1, 2, 3]` | `read == write` on every step; element swaps with itself (or no-op) | Array unchanged in $O(N)$ time |
| **Array Shorter than $k$** | $N < k$ | Guard `write < k` accepts all elements unconditionally | Entire array retained; returns $N$ |
| **All Identical Elements ($N > k$)** | `[2, 2, 2, 2, 2]`, $k=2$ | Writes first $k=2$ elements, skips remaining $N-k$ | Output has exactly $k$ copies |

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 283 — Move Zeroes (Easy)

> Given an integer array `nums`, move all `0`s to the end of it while maintaining the **relative order** of the non-zero elements.
>
> **Constraint:** You must do this **in-place** without making a copy of the array.

#### Brute Force ($O(N^2)$)
Scan for zeroes. Whenever a zero is found at index $i$, shift all elements from $i+1$ to $N-1$ one position left, then place the zero at the end. For an array with many zeroes, this does $O(N^2)$ shifts.

#### Optimal Approach A: Two-Pass Overwrite & Fill ($O(N)$ time, $O(1)$ space)
1. **Pass 1:** `read` scans all elements. If `nums[read] != 0`, copy to `nums[write]` and increment `write++`.
2. **Pass 2:** Fill all remaining indices from `write` to $N-1$ with `0`.

```csharp
public class SolutionTwoPass {
    public void MoveZeroes(int[] nums) {
        int write = 0;

        // Pass 1: Compact non-zeroes to the front
        for (int read = 0; read < nums.Length; read++) {
            if (nums[read] != 0) {
                nums[write] = nums[read];
                write++;
            }
        }

        // Pass 2: Zero out the rest
        while (write < nums.Length) {
            nums[write] = 0;
            write++;
        }
    }
}
```

#### Optimal Approach B: Single-Pass Swap ($O(N)$ time, $O(1)$ space)
Instead of two passes, whenever `read` encounters a non-zero, **swap** `nums[read]` with `nums[write]`, then increment `write++`.
- If `read == write` (no zeroes seen yet), an element swaps with itself (no-op).
- If `read > write`, `nums[write]` is guaranteed to be a `0`. The swap moves the non-zero to `write` and the `0` back to `read` for later advancement!

```csharp
public class Solution {
    public void MoveZeroes(int[] nums) {
        int write = 0;

        for (int read = 0; read < nums.Length; read++) {
            if (nums[read] != 0) {
                if (read != write) {
                    int temp = nums[write];
                    nums[write] = nums[read];
                    nums[read] = temp;
                }
                write++;
            }
        }
    }
}
```

---

### Problem 2: LeetCode 26 — Remove Duplicates from Sorted Array (Easy)

> Given an integer array `nums` sorted in **non-decreasing order**, remove the duplicates **in-place** such that each unique element appears only once.
> Return the number of unique elements ($k$).

#### The Invariant:
Since the array is sorted, duplicates are always adjacent.
- Element `nums[0]` is always unique and starts at index `0`.
- For any subsequent element `nums[read]`: it is a new unique element **if and only if** `nums[read] != nums[write - 1]`.

#### C# Implementation
```csharp
public class Solution {
    public int RemoveDuplicates(int[] nums) {
        if (nums.Length == 0) return 0;

        int write = 1; // nums[0] is already valid

        for (int read = 1; read < nums.Length; read++) {
            if (nums[read] != nums[write - 1]) {
                nums[write] = nums[read];
                write++;
            }
        }

        return write;
    }
}
```

---

### Problem 3: LeetCode 80 — Remove Duplicates from Sorted Array II (Medium)

> Given an integer array `nums` sorted in non-decreasing order, remove duplicates in-place such that each unique element appears **at most twice**. The relative order of the elements should be kept the same.
> Return the number of elements after removing excess duplicates.

#### The Brute Force Trap:
Many developers try to use counter variables: `count = 1`, reset count when element changes, etc. While workable, it produces messy edge-case bugs when $k=2, 3, \dots$.

#### The Master Invariant: The "Look-Back by $K$" Rule
Consider this fundamental question:
> *When is `nums[read]` allowed to be written into `nums[write]`?*

Since each element can appear at most **2 times**:
- If `nums[read] == nums[write - 2]`, writing `nums[read]` would create a **3rd identical element**!
- Therefore, we can write `nums[read]` **if and only if**:
  $$\text{nums}[read] \neq \text{nums}[write - 2]$$

Because the array is sorted:
If $\text{nums}[read] == \text{nums}[write - 2]$, then every element between `write - 2` and `write - 1` is also equal to $\text{nums}[read]$. Adding another one would violate the "at most 2" limit!

#### Step-by-Step Visual Trace
Let `nums = [1, 1, 1, 2, 2, 3]`:

```
Indices 0 and 1 are always kept (first 2 elements can never violate limit of 2).
write = 2, read = 2.

Array: [ 1 , 1 , 1 , 2 , 2 , 3 ]
                 ▲
                read=2, nums[read]=1
Check: nums[read] != nums[write-2] ?
nums[2] (1) != nums[0] (1) -> FALSE! (Already have two 1s: nums[0] and nums[1]).
Do NOT write. write stays 2.
────────────────────────────────────────────────────────
Step 1: read = 3, nums[read] = 2. write = 2.
Array: [ 1 , 1 , 1 , 2 , 2 , 3 ]
                     ▲
                    read=3
Check: nums[read] (2) != nums[write-2] (nums[0] = 1) -> TRUE (2 != 1).
Copy: nums[write] = nums[read] -> nums[2] = 2.
write++ -> write = 3.
Array: [ 1 , 1 , 2 , 2 , 2 , 3 ]
────────────────────────────────────────────────────────
Step 2: read = 4, nums[read] = 2. write = 3.
Array: [ 1 , 1 , 2 , 2 , 2 , 3 ]
                         ▲
                        read=4
Check: nums[read] (2) != nums[write-2] (nums[1] = 1) -> TRUE (2 != 1).
Copy: nums[write] = nums[read] -> nums[3] = 2.
write++ -> write = 4.
Array: [ 1 , 1 , 2 , 2 , 2 , 3 ]
────────────────────────────────────────────────────────
Step 3: read = 5, nums[read] = 3. write = 4.
Array: [ 1 , 1 , 2 , 2 , 2 , 3 ]
                             ▲
                            read=5
Check: nums[read] (3) != nums[write-2] (nums[2] = 2) -> TRUE (3 != 2).
Copy: nums[write] = nums[read] -> nums[4] = 3.
write++ -> write = 5.
Array: [ 1 , 1 , 2 , 2 , 3 , 3 ]
────────────────────────────────────────────────────────
Loop ends. Return write = 5.
First 5 elements are [1, 1, 2, 2, 3].
```

#### C# Implementation (Generalized for any $K$)
```csharp
public class Solution {
    public int RemoveDuplicates(int[] nums) {
        return RemoveDuplicatesAtMostK(nums, 2);
    }

    // Universal template: allows at most K occurrences
    private int RemoveDuplicatesAtMostK(int[] nums, int k) {
        if (nums.Length <= k) return nums.Length;

        int write = k;
        for (int read = k; read < nums.Length; read++) {
            if (nums[read] != nums[write - k]) {
                nums[write] = nums[read];
                write++;
            }
        }

        return write;
    }
}
```

---

## 3. 🏋️ PRACTICE: Edge Cases & Self-Check

### Edge Cases Checklist:
- **Move Zeroes:**
  - No zeroes in array: `[1, 2, 3]` $\to$ `read == write` throughout, no unnecessary writes.
  - All zeroes in array: `[0, 0, 0]` $\to$ `write` never increments.
  - Zeroes at the beginning vs zeroes at the end: `[0, 1]` vs `[1, 0]`.
- **Remove Duplicates I & II:**
  - Length $\le K$: e.g., $N = 1$ or $N = 2 \implies$ automatically return $N$.
  - All identical elements: `[1, 1, 1, 1, 1]` $\to$ returns `k` elements (`[1, 1]`).
  - No duplicates present: `[1, 2, 3, 4]` $\to$ array remains identical.

---

## 4. 🎯 Day 4 Checkpoint Questions & Answers

### Question 1: The Generalization Invariant
- **Question:** How would you modify the solution to allow at most $K = 3$ occurrences of each number in a sorted array?
- **Answer:**
  You only change the initial index and the lookback offset to $K$:
  ```csharp
  if (nums.Length <= 3) return nums.Length;
  int write = 3;
  for (int read = 3; read < nums.Length; read++) {
      if (nums[read] != nums[write - 3]) {
          nums[write] = nums[read];
          write++;
      }
  }
  return write;
  ```
  The rule holds universally: compare `nums[read]` with `nums[write - K]`.

---

### Question 2: Move Zeroes — Swap vs. Overwrite
- **Question:** In `MoveZeroes`, why might the two-pass overwrite-and-zero approach perform fewer memory writes than the single-pass swap approach if the array is already mostly sorted non-zeroes (e.g. `[1, 2, 3, ..., 0]`)?
- **Answer:**
  In the single-pass swap approach, each swap executes 2 memory writes (`nums[write] = ...` and `nums[read] = ...`). Even with `if (read != write)`, whenever `read > write`, every non-zero triggers a 2-write swap.
  In the two-pass overwrite-and-fill approach, each non-zero element triggers exactly 1 write (`nums[write] = nums[read]`), and each trailing zero triggers exactly 1 write (`nums[write] = 0`). Thus, the two-pass approach performs strictly fewer total memory write operations when writes are expensive.

---

### Question 3: Off-By-One Invariant Analysis
- **Question:** In `RemoveDuplicates II`, why do we compare `nums[read]` with `nums[write - 2]` rather than `nums[read - 2]`?
- **Answer:**
  Because the input array between `write` and `read` may contain already discarded duplicates!
  `nums[read - 2]` refers to the **original unprocessed stream**, which could contain a run of discarded duplicates that skew the count.
  `nums[write - 2]` refers to the **validated result stream**. What matters is how many times the number has already been placed into the *output zone*, not how many times it appeared in the raw input.
