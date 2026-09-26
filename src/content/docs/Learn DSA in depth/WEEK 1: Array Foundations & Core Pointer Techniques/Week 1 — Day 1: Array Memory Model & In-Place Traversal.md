---
title: "Week 1 — Day 1: Array Memory Model & In-Place Traversal"
---

# 🚀 Week 1 — Day 1: Array Memory Model & In-Place Traversal

Welcome to Day 1! Today we lay down the physical and theoretical foundation of arrays. Everything in DSA—from dynamic programming arrays to hash maps and circular queues—relies on understanding how memory behaves under the hood.

---

## 1. 🧠 TEACH: The Physical Reality of an Array

### 1.1 Memory as a Continuous Byte Strip

Your computer’s RAM is essentially an enormous continuous sequence of addressable byte cells.

When you declare an array of integers in C#:

```csharp
int[] arr = new int[4] { 10, 20, 30, 40 };
```

The runtime OS asks the memory allocator for a single contiguous block of memory:
- An `int` takes 4 bytes (32 bits).
- 4 integers require $4 \times 4 = 16$ contiguous bytes.

```text
Memory Address:  0x1000       0x1004       0x1008       0x100C
                 ┌────────────┬────────────┬────────────┬────────────┐
Index:           │  arr[0]    │  arr[1]    │  arr[2]    │  arr[3]    │
Value:           │     10     │     20     │     30     │     40     │
                 └────────────┴────────────┴────────────┴────────────┘
                 ◄────────────── Contiguous 16 Bytes ──────────────►
```

### 1.2 The Math Behind O(1) Indexing

Why is accessing `arr[i]` an $O(1)$ constant-time operation? Because it requires zero searching.

The CPU calculates the exact memory address in a single arithmetic instruction:

$$\text{Target Address} = \text{Base Address} + (i \times \text{Size of Element})$$

If $\text{Base} = \text{0x1000}$ and $\text{Size} = 4\text{ bytes}$:
- To access `arr[2]`: $\text{0x1000} + (2 \times 4) = \text{0x1008}$.
- The CPU jumps directly to `0x1008` in one cycle. It doesn't matter if the array has 10 elements or 10,000,000 elements—it takes the exact same amount of time.

> **Key Takeaway:** This is also why arrays are 0-indexed. The index is an offset (how many element widths to skip from the base).

---

### 1.3 Hardware Secret: CPU Cache Lines & Spatial Locality

When your CPU accesses `arr[0]`, it doesn't just pull 4 bytes from RAM. RAM is slow, while CPU caches (L1, L2, L3) are extremely fast.

The CPU hardware fetches a full **Cache Line** (typically 64 consecutive bytes) into L1 cache at once.
- Because array elements are laid out side-by-side in memory, fetching `arr[0]` automatically loads `arr[1]` through `arr[15]` into ultra-fast cache.
- Sequential traversals (`for (int i = 0; i < n; i++)`) achieve near 100% cache hit rates.
- *(Contrast this with Linked Lists, where nodes are scattered randomly across the heap, triggering frequent cache misses).*

---

### 1.4 The Cost of Modifying Arrays

Because the elements are packed tightly in contiguous memory:

| Operation | Position | Time Complexity | Why? |
| :--- | :--- | :---: | :--- |
| **Lookup / Read** | `arr[i]` | $O(1)$ | Direct address arithmetic. |
| **Update** | `arr[i] = val` | $O(1)$ | Overwrite fixed address. |
| **Insert** | End (Tail) | $O(1)$ | Free capacity exists $\rightarrow$ write to `arr[size]`. |
| **Insert** | Beginning (Head) | $O(N)$ | Every existing element must shift 1 slot to the right. |
| **Delete** | Beginning (Head) | $O(N)$ | Every remaining element must shift 1 slot to the left. |

```text
Insert at index 0 requires shifting EVERY item right:
Initial:   [ 10 , 20 , 30 , 40 ]
Step 1:               40 ---> [Slot 4]
Step 2:          30 --------> [Slot 3]
Step 3:     20 -------------> [Slot 2]
Step 4:10 ------------------> [Slot 1]
Result:    [ NEW, 10 , 20 , 30 , 40 ]  --> N operations!
```

---

## 2. 🎬 DEMONSTRATE: The In-Place Overwriting Pattern

Now let's apply this memory understanding to an interview classic.

### Problem: LeetCode 27 — Remove Element

> Given an integer array `nums` and an integer `val`, remove all occurrences of `val` in-place and return the number of elements not equal to `val`.
>
> **Constraint:** $O(1)$ extra memory. Do not allocate another array!

---

### Step 1: The Brute Force Instinct ($O(N^2)$)

A beginner's instinct is: *"Whenever I see `nums[i] == val`, delete it by shifting all elements after it one step left."*

```text
nums = [3, 2, 2, 3], val = 3

i = 0: nums[0] is 3 (matches val!)
Shift: nums[1] -> nums[0], nums[2] -> nums[1], nums[3] -> nums[2]
Array becomes: [2, 2, 3, ?]  (cost: N-1 shifts)
Repeat scan...
```

- For an array of size $N$ filled with `val`, shifting on every match results in $(N-1) + (N-2) + \dots + 1 = \frac{N(N-1)}{2}$ shifts.
- **Time Complexity:** $O(N^2)$ (terrible for $N = 10^5$).
- **Bottleneck:** Repeatedly moving the same elements over and over.

---

### Step 2: The Optimal Insight — Two Pointers (Reader & Writer)

Instead of shifting elements every time we find a match, invert the question:

> *Don't delete what you hate. Collect and copy what you want.*

We can maintain two pointers moving from left to right:
1. `read`: Scans every element from index 0 to $n - 1$.
2. `write`: Tracks the destination index for the next valid element (an element $\neq$ `val`).

#### The Loop Invariant (Rule that never breaks):

> Everything in `nums[0 .. write - 1]` is guaranteed to be a valid element not equal to `val`.

---

### Step 3: Visual Trace

Let `nums = [3, 2, 2, 3]`, `val = 3`:

```text
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
read finishes. Return `write` = 2.
The first 2 elements are [2, 2].
```

---

### Step 4: C# Implementation

```csharp
public class Solution {
    public int RemoveElement(int[] nums, int val) {
        int write = 0;

        for (int read = 0; read < nums.Length; read++) {
            if (nums[read] != val) {
                nums[write] = nums[read];
                write++;
            }
        }

        return write; // 'write' represents the count of valid elements
    }
}
```

#### Complexity Analysis:

- **Time Complexity:** $O(N)$ — `read` visits each element exactly once.
- **Space Complexity:** $O(1)$ — only two integer variables (`read`, `write`). No extra allocations.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Now it's your turn to apply and reinforce this pattern:

### Problem 1 (Warmup): LeetCode 1929 — Concatenation of Array (Easy)

- **Goal:** Given `nums` of length $n$, return an array `ans` of length $2n$ where `ans[i] == nums[i]` and `ans[i + n] == nums[i]`.
- **Hint:** Allocate an array of size $2n$. Notice that in a single loop from 0 to $n - 1$, you can populate both `ans[i]` and `ans[i + n]`.

### Problem 2 (Core Challenge): LeetCode 26 — Remove Duplicates from Sorted Array (Easy)

- **Goal:** Given an integer array `nums` sorted in non-decreasing order, remove duplicates in-place such that each unique element appears once. Return number of unique elements.
- **Hint:**
  - Use the exact same Reader / Writer pattern!
  - Since the array is sorted, all duplicates are adjacent.
  - When should `write` advance? Only when `nums[read] != nums[write - 1]`.

---

## 4. 🎯 Day 1 Checkpoint Questions

Before you jump into coding the practice problems, answer these 3 quick questions in your own words to verify your intuition:

1. **Memory Math:** If `arr[0]` is located at hex address `0x2000`, and each element is an 8-byte long integer, what is the exact memory address of `arr[5]`?
2. **Shifting Cost:** Suppose an array has $N = 1,000,000$ elements. You call `Insert(0, item)`. How many element copies happen in RAM? What if you call `Insert(1,000,000, item)` (append)?
3. **Reader / Writer Invariant:** In the `RemoveElement` problem, if the array has no matching values (e.g. `nums = [1, 2, 3]`, `val = 5`), what happens to `read` and `write` at every step?
