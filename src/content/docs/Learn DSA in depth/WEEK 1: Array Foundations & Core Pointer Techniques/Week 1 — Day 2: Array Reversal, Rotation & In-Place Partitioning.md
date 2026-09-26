---
title: "Week 1 — Day 2: Array Reversal, Rotation & In-Place Partitioning"
---

# 🚀 Week 1 — Day 2: Array Reversal, Rotation & In-Place Partitioning

Welcome to Day 2! Today we build upon in-place operations by mastering two essential array manipulation techniques frequently tested in Big Tech interviews:
1. **The 3-Reversal Rotation Technique** ($O(1)$ auxiliary space rotation)
2. **The Dutch National Flag Algorithm** (3-Way In-Place Partitioning)

---

## 1. 🧠 TEACH: In-Place Array Transformations

### 1.1 In-Place Swapping
An in-place algorithm transforms the input data structure without using auxiliary data structures proportional to the input size ($O(1)$ extra space).
The foundational building block is the **Two-Pointer Swap**:

```csharp
void Reverse(int[] nums, int left, int right) {
    while (left < right) {
        int temp = nums[left];
        nums[left] = nums[right];
        nums[right] = temp;
        left++;
        right--;
    }
}
```
- **Time Complexity:** $O(N)$ — each element between `left` and `right` is moved at most once.
- **Space Complexity:** $O(1)$ — single temporary variable for swapping.

---

### 1.2 The Algebraic Reversal Magic: $(A^R B^R)^R = BA$
Suppose an array consists of two contiguous sub-blocks, $A$ and $B$:
$$\text{Original Array} = [A \mid B]$$

Rotating the array to the right by $k$ positions means shifting the last $k$ elements ($B$) to the front, and the first $n-k$ elements ($A$) to the back:
$$\text{Target Array} = [B \mid A]$$

How do we achieve this in $O(1)$ space without shifting elements one by one ($O(N \times K)$)?
We exploit the algebraic property of reversal where $(X^R)^R = X$ and $(XY)^R = Y^R X^R$:

1. **Reverse the entire array:**
   $$(AB)^R = B^R A^R$$
2. **Reverse the first $k$ elements (which is $B^R$):**
   $$(B^R)^R A^R = B A^R$$
3. **Reverse the remaining $n - k$ elements (which is $A^R$):**
   $$B (A^R)^R = B A$$

✨ **Result: The array is rotated to $BA$ in $O(N)$ time using only $O(1)$ extra memory!**

---

### 1.3 The 3-Way Partition (Dutch National Flag Algorithm)
Formulated by Edsger W. Dijkstra, this algorithm partitions an array containing three distinct values (or three distinct ranges relative to a pivot) in a **single pass** ($O(N)$ time) with **$O(1)$ space**.

We divide the array into **4 logical zones** using 3 pointers: `low`, `mid`, and `high`:

```
Index:    0          low              mid              high         N-1
          ┌──────────┬────────────────┬────────────────┬────────────┐
Values:   │ All 0s   │ All 1s         │ Unexamined ??? │ All 2s     │
          └──────────┴────────────────┴────────────────┴────────────┘
          ◄──Done───►◄─────Done──────►◄──Processing───►◄────Done────►
```

#### The 4 Invariants That Must Always Hold:
1. `nums[0 .. low - 1] == 0` (The finalized zero section)
2. `nums[low .. mid - 1] == 1` (The finalized one section)
3. `nums[mid .. high]` are **unexamined elements**
4. `nums[high + 1 .. N - 1] == 2` (The finalized two section)

The algorithm terminates when `mid > high`, meaning the unexamined zone has shrunk to zero elements.

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 189 — Rotate Array (Medium)

> Given an integer array `nums`, rotate the array to the right by `k` steps, where `k` is non-negative.
>
> **Follow up:** Could you do it in-place with $O(1)$ extra space?

#### Step 1: Normalizing $k$
Rotating an array of length $N$ by $N$ steps results in the original array.
Therefore, the effective rotation is always:
```csharp
k = k % nums.Length;
```
If $k == 0$, no rotation is needed.

#### Step 2: Comparison of Approaches

| Approach | Time Complexity | Space Complexity | Why it's suboptimal |
| :--- | :---: | :---: | :--- |
| **Brute Force** (Rotate by 1, $k$ times) | $O(N \times k)$ | $O(1)$ | $10^5 \times 10^5 = 10^{10}$ ops $\to$ **TLE** |
| **Auxiliary Array** (`copy[(i+k)%n]`) | $O(N)$ | $O(N)$ | Allocates $O(N)$ extra memory |
| **Cyclic Replacements** | $O(N)$ | $O(1)$ | Complex bookkeeping with GCD loops |
| **3-Reversal Technique** | $O(N)$ | $O(1)$ | **Optimal**, intuitive, clean code |

#### Step 3: Visual Trace of 3-Reversal
Let `nums = [1, 2, 3, 4, 5, 6, 7]`, `k = 3`, `n = 7`:
- Block $A$ = `[1, 2, 3, 4]` (length $n - k = 4$)
- Block $B$ = `[5, 6, 7]` (length $k = 3$)

```
Original:             [ 1, 2, 3, 4 | 5, 6, 7 ]
Step 1: Reverse(0, 6) [ 7, 6, 5 | 4, 3, 2, 1 ]  // Entire array reversed
Step 2: Reverse(0, 2) [ 5, 6, 7 | 4, 3, 2, 1 ]  // First k elements reversed
Step 3: Reverse(3, 6) [ 5, 6, 7 | 1, 2, 3, 4 ]  // Remaining n-k elements reversed
```

#### Step 4: C# Implementation
```csharp
public class Solution {
    public void Rotate(int[] nums, int k) {
        int n = nums.Length;
        k %= n;
        if (k == 0) return;
        
        // Step 1: Reverse entire array
        Reverse(nums, 0, n - 1);
        // Step 2: Reverse first k elements
        Reverse(nums, 0, k - 1);
        // Step 3: Reverse remaining n - k elements
        Reverse(nums, k, n - 1);
    }
    
    private void Reverse(int[] nums, int left, int right) {
        while (left < right) {
            int temp = nums[left];
            nums[left] = nums[right];
            nums[right] = temp;
            left++;
            right--;
        }
    }
}
```

---

### Problem 2: LeetCode 75 — Sort Colors (Medium)

> Given an array `nums` with $n$ objects colored red (`0`), white (`1`), or blue (`2`), sort them **in-place** so that objects of the same color are adjacent, with the colors in the order 0, 1, and 2.
>
> You must solve this problem without using the library's sort function and in a **single pass**.

#### The Core Interview Insight: Why `mid` behaves differently
- **Case `nums[mid] == 0`:**
  Swap `nums[low]` and `nums[mid]`.
  Increment `low++`.
  Increment `mid++`.
  *Why can we safely increment `mid`?*
  Because `low <= mid`. Any element at `nums[low]` was already processed by `mid` earlier, so after the swap, `nums[mid]` is guaranteed to be a `1`.
- **Case `nums[mid] == 1`:**
  Increment `mid++`.
  The invariant holds because `nums[low .. mid-1]` is all `1`s.
- **Case `nums[mid] == 2`:**
  Swap `nums[mid]` and `nums[high]`.
  Decrement `high--`.
  **CRITICAL:** Do NOT increment `mid`!
  *Why?*
  The element that just came from index `high` was in the **unexamined region**. It could be a `0`, `1`, or `2`. We must evaluate it on the next iteration.

#### Visual Trace on `[2, 0, 2, 1, 1, 0]`

```
Start:  low = 0, mid = 0, high = 5
Array:  [ 2, 0, 2, 1, 1, 0 ]
          ▲
         mid points to 2: Swap(mid, high), high--
────────────────────────────────────────────────────────
Step 1: low = 0, mid = 0, high = 4
Array:  [ 0, 0, 2, 1, 1, 2 ]
          ▲
         mid points to 0: Swap(low, mid), low++, mid++
────────────────────────────────────────────────────────
Step 2: low = 1, mid = 1, high = 4
Array:  [ 0, 0, 2, 1, 1, 2 ]
             ▲
            mid points to 0: Swap(low, mid), low++, mid++
────────────────────────────────────────────────────────
Step 3: low = 2, mid = 2, high = 4
Array:  [ 0, 0, 2, 1, 1, 2 ]
                ▲
               mid points to 2: Swap(mid, high), high--
────────────────────────────────────────────────────────
Step 4: low = 2, mid = 2, high = 3
Array:  [ 0, 0, 1, 1, 2, 2 ]
                ▲
               mid points to 1: mid++
────────────────────────────────────────────────────────
Step 5: low = 2, mid = 3, high = 3
Array:  [ 0, 0, 1, 1, 2, 2 ]
                   ▲
                  mid points to 1: mid++
────────────────────────────────────────────────────────
End:    low = 2, mid = 4, high = 3
Condition mid <= high is false (4 <= 3 is False). Terminate!
Final Array: [ 0, 0, 1, 1, 2, 2 ]
```

#### C# Implementation
```csharp
public class Solution {
    public void SortColors(int[] nums) {
        int low = 0;
        int mid = 0;
        int high = nums.Length - 1;
        
        while (mid <= high) {
            if (nums[mid] == 0) {
                Swap(nums, low, mid);
                low++;
                mid++;
            } else if (nums[mid] == 1) {
                mid++;
            } else { // nums[mid] == 2
                Swap(nums, mid, high);
                high--;
                // Note: Do NOT increment mid here!
            }
        }
    }
    
    private void Swap(int[] nums, int i, int j) {
        int temp = nums[i];
        nums[i] = nums[j];
        nums[j] = temp;
    }
}
```

---

## 3. 🏋️ PRACTICE: Edge Cases & Self-Check

### Edge Cases for Rotate Array:
- $k = 0$: Array remains unchanged.
- $k > n$: Handled by `k %= n`.
- $n = 1$: Any rotation leaves array unchanged.
- $k$ is a multiple of $n$: e.g. $k = 7, n = 7 \implies k = 0$.

### Edge Cases for Sort Colors:
- Array contains only one color: `[0, 0, 0]` or `[2, 2, 2]`.
- Array is already sorted: `[0, 1, 2]`.
- Array is reverse sorted: `[2, 1, 0]`.

---

## 4. 🎯 Day 2 Checkpoint Questions & Answers

### Question 1: Why Modulo?
- **Question:** If `nums.Length == 5` and $k = 13$, what is the effective number of rotations?
- **Answer:**
  Rotating an array of length $5$ by $5$ positions yields the original array.
  $$\text{Effective } k = 13 \pmod 5 = 3$$
  Rotating by $13$ is functionally identical to rotating right by $3$ steps. Using modulo prevents redundant operations and prevents index out-of-range exceptions.

---

### Question 2: Reverse Bounds
- **Question:** In `Rotate Array`, why is the second reverse boundary `[0 .. k - 1]` and not `[0 .. k]`?
- **Answer:**
  Arrays are 0-indexed. The first $k$ elements occupy indices $0, 1, 2, \dots, k - 1$.
  If we reversed `[0 .. k]`, we would be reversing $k + 1$ elements instead of $k$.

---

### Question 3: Dutch National Flag Bug Analysis
- **Question:** What would happen if you wrote `mid++` after swapping `nums[mid]` and `nums[high]`? Provide a small test case where this produces the wrong answer.
- **Answer:**
  If you increment `mid` immediately after swapping with `high`, the element that came from `high` bypasses inspection. If that swapped element was `0` or `2`, it will be misplaced.

  **Concrete Failing Test Case:**
  Let `nums = [1, 2, 0]`.
  - `low = 0, mid = 0, high = 2`.
  - `nums[mid] == 1` $\to$ `mid++` ($mid = 1$).
  - At `mid = 1`, `nums[mid] == 2`:
    - Swap `nums[mid]` and `nums[high]` $\implies$ array becomes `[1, 0, 2]`.
    - `high--` ($high = 1$).
    - **BUG:** If you also do `mid++`, then $mid = 2$.
  - Now `mid > high` ($2 > 1$), so the loop ends!
  - **Resulting array:** `[1, 0, 2]` — **INCORRECT!** The `0` was never inspected or swapped to `low`.
  - With the correct logic (keeping `mid = 1`), the next iteration inspects `nums[mid] == 0`, swaps it with `nums[low]`, yielding the correct `[0, 1, 2]`.
