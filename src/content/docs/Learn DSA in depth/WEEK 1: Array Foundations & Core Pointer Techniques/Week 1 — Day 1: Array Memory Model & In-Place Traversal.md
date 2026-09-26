---
title: "Week 1 — Day 1: Array Memory Model & In-Place Traversal"
---
# 🚀 Week 1 — Day 1: Array Memory Model & In-Place Traversal

Welcome to Day 1! Today we lay down the physical and theoretical foundation of arrays. Everything in DSA—from dynamic programming tables to hash maps and circular queues—relies on understanding how memory behaves under the hood.

---

## 1. 🧠 TEACH: The Physical Reality of an Array

### 1.1 Memory as a Continuous Byte Strip

Your computer’s RAM is essentially an enormous continuous sequence of addressable byte cells.

When you declare an array of integers in C#:

```csharp
int[] arr = new int[4] { 10, 20, 30, 40 };
```

The runtime OS asks the memory allocator for a single **contiguous block** of memory:
- An `int` takes 4 bytes (32 bits).
- 4 integers require $4 \times 4 = 16$ contiguous bytes.

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

The CPU calculates the exact memory address in a single arithmetic instruction:

$$\mathbf{\text{Target Address} = \text{Base Address} + (i \times \text{Size of Element})}$$

If $\text{Base} = \text{0x1000}$ and $\text{Size} = 4\text{ bytes}$:
- To access `arr[2]`: $\text{0x1000} + (2 \times 4) = \text{0x1008}$.
- The CPU jumps directly to `0x1008` in one cycle. It doesn't matter if the array has 10 elements or 10,000,000 elements—it takes the exact same amount of time.

> [!NOTE]
> This address formula is why arrays are **0-indexed**. The index is an offset indicating how many element widths to skip from the base address.

---

### 1.3 Hardware Architecture: CPU Cache Lines & Spatial Locality

When your CPU accesses `arr[0]`, it doesn't just pull 4 bytes from RAM. RAM is relatively slow, while CPU caches (L1, L2, L3) operate at near-processor speeds.

The CPU hardware fetches a full **Cache Line** (typically 64 consecutive bytes) into the L1 cache at once:
- Because array elements are laid out side-by-side in memory, fetching `arr[0]` automatically loads `arr[1]` through `arr[15]` into the ultra-fast L1 cache.
- Sequential traversals (`for (int i = 0; i < n; i++)`) achieve near **100% cache hit rates**.
- *(Contrast this with Linked Lists, where nodes are scattered across the managed heap, triggering frequent CPU cache misses and pointer-chasing stalls).*

---

### 1.4 The Cost of Modifying Arrays

Because elements are packed tightly in contiguous memory, resizing or inserting elements requires physical memory relocation:

| Operation | Position | Time Complexity | Architectural Rationale |
| :--- | :--- | :---: | :--- |
| **Lookup / Read** | `arr[i]` | $O(1)$ | Direct address arithmetic: $\text{Base} + i \times \text{Size}$. |
| **Update** | `arr[i] = val` | $O(1)$ | Overwrites a fixed, known physical address. |
| **Insert / Append** | End (Tail) | $O(1)$ | Free capacity exists $\implies$ write to `arr[size]`. |
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

### 1.5 Interview Spoken Drill (20–30 Seconds)

> *"An array is a contiguous block of memory where each element can be accessed in $O(1)$ time via simple arithmetic: base address plus index times element size. Because elements are stored consecutively, arrays exploit CPU spatial locality, fetching up to 64 bytes into L1 cache lines at once for near 100% sequential cache hit rates. However, inserting or deleting at arbitrary positions requires shifting subsequent elements in $O(N)$ time. To remove elements in $O(N)$ time and $O(1)$ space without shifting, we use the Two-Pointer Reader and Writer pattern."*

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

### 2.1 [LeetCode 27] Remove Element

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

### 2.2 [LeetCode 26] Remove Duplicates from Sorted Array

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

## 3. 🏋️ PRACTICE: Your Daily Challenges

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

## 4. 🔗 CONNECT: The Pattern Decision Bridge

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

### Preview for Day 2: Array Reversal, Rotation & In-Place Partitioning
Tomorrow in **Day 2**, we build upon in-place array manipulation:
- **The 3-Reversal Rotation Trick ([LeetCode 189]):** Rotating an array to the right by $K$ steps in $O(N)$ time and $O(1)$ space using the algebraic identity $(A^R B^R)^R = BA$.
- **The Dutch National Flag Algorithm ([LeetCode 75]):** Edsger Dijkstra's optimal single-pass 3-way partition using `low`, `mid`, and `high` pointers.

---

## 5. 🎯 Day 1 Checkpoint Questions

Verify your foundational array and memory intuition:

1. **Memory Math:** If `arr[0]` is located at hex address `0x2000`, and each element is an 8-byte `long` integer, what is the exact hexadecimal memory address of `arr[5]`? Show the address calculation formula.
2. **Shifting Cost:** Suppose an array has $N = 1,000,000$ elements. You call `Insert(0, item)`. How many element copies happen in RAM? What if you call `Insert(1,000,000, item)` (append)?
3. **Reader / Writer Invariant:** In the `RemoveElement` problem, if the array has no matching values (e.g. `nums = [1, 2, 3]`, `val = 5`), what happens to `read` and `write` at every step? Does the code still execute correctly?
4. **Cache Miss Reality:** Why does iterating sequentially over an array `int[N]` trigger far fewer CPU cache misses than iterating through a linked list of $N$ nodes containing identical integer values?
