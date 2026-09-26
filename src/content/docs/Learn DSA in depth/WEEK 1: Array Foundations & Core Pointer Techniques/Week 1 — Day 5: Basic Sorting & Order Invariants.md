# 🚀 Week 1 — Day 5: Basic Sorting & Order Invariants

Welcome to Day 5! Sorting is the most frequently *implicit* technique in DSA. Even when a problem never says "sort this array," you will constantly find yourself sorting — either explicitly (`Array.Sort`) or implicitly (binary search, two pointers on sorted input, merging, k-way merge, dedup by key).

Today we cover the three **quadratic ($O(N^2)$) foundational sorts**, understand their distinct invariants, learn *when a slow sort is actually the right answer*, and master **LeetCode 88** — which is the real interview gem of this day.

---

## 1. 🧠 TEACH: The Three Quadratic Sorts & Their Invariants

All three sorts achieve the same goal (ascending order) using $O(1)$ extra space, but they differ fundamentally in **what they maintain and how many operations they perform**.

---

### 1.1 Bubble Sort — "The Repeated Full Sweeps"

**Core Idea:** Repeatedly walk the array, comparing adjacent elements and **swapping them if out of order**. Each full sweep "bubbles" the **largest remaining element** to the very end of the unsorted region.

**Algorithm:**
```
repeat (n - 1) times:
    swapped = false
    for i from 0 to n - 2 - passesDone:
        if nums[i] > nums[i+1]:
            swap(nums[i], nums[i+1])
            swapped = true
    if not swapped: break   // <-- EARLY EXIT OPTIMIZATION
```

**The Invariant:**
> After `p` complete passes, the last `p` elements contain the `p` largest elements of the array, **and they are in their final sorted positions**.

**Visual Trace** on `[5, 1, 4, 2, 8]`:

```
Pass 1 (max 8 will float to the end):
 [5, 1, 4, 2, 8]
  (5>1) swap -> [1, 5, 4, 2, 8]
  (5>4) swap -> [1, 4, 5, 2, 8]
  (5>2) swap -> [1, 4, 2, 5, 8]
  (5<8) keep -> [1, 4, 2, 5, 8]   ✔ 8 is now locked at index 4
Pass 2 (shrink the boundary to n-2 = index 3):
  (1<4) keep -> [1, 4, 2, 5, 8]
  (4>2) swap -> [1, 2, 4, 5, 8]
  (4<5) keep -> [1, 2, 4, 5, 8]   ✔ 5 locked at index 3
Pass 3 (boundary to index 2):
  (1<2) keep -> [1, 2, 4, 5, 8]
  (2<4) keep -> [1, 2, 4, 5, 8]   ✔ 4 locked at index 2
Pass 4 (boundary to index 1):
  (1<2) keep -> [1, 2, 4, 5, 8]   ✔
Final: [1, 2, 4, 5, 8]
```

**Why swap *adjacent* elements?** This is the only reason bubble sort is **stable** (see §1.4 below).

**Key weakness:** $O(N^2)$ even with the early exit, unless the input is already sorted. In practice, nobody implements this in an interview.

---

### 1.2 Selection Sort — "Find the Extremum, Place It"

**Core Idea:** For each position `i` from left to right, scan the entire unsorted remainder to find the **minimum** element, then swap it into position `i`.

**Algorithm:**
```
for i from 0 to n - 2:
    minIndex = i
    for j from i+1 to n - 1:
        if nums[j] < nums[minIndex]:
            minIndex = j
    swap(nums[i], nums[minIndex])
```

**The Invariant:**
> Before iteration `i`, `nums[0 .. i - 1]` contains the `i` smallest elements **in final sorted position**. Everything at or after `i` is unsorted.

**Visual Trace** on `[5, 1, 4, 2, 8]`:

```
i=0: min in [5,1,4,2,8] is 1 at index 1 -> swap(0,1)
     [1, 5, 4, 2, 8]   ✔ 1 locked at index 0
i=1: min in [5,4,2,8]  is 2 at index 3 -> swap(1,3)
     [1, 2, 4, 5, 8]   ✔ 2 locked at index 1
i=2: min in [4,5,8]    is 4 at index 2 -> swap(2,2) (no-op)
     [1, 2, 4, 5, 8]   ✔
i=3: min in [5,8]      is 5 at index 3 -> swap(3,3) (no-op)
     [1, 2, 4, 5, 8]   ✔
Final: [1, 2, 4, 5, 8]
```

**Key weakness:** It always performs exactly $\frac{N(N-1)}{2}$ comparisons, **even if the array is already sorted**. Zero adaptivity. However, it performs at most $N-1$ **swaps** — the fewest of any sort here. This matters when writes are extremely expensive (e.g., flash memory wear leveling).

**Key failure:** It is **NOT stable** (see §1.4).

---

### 1.3 Insertion Sort — "The Card Game Sorter" ⭐

**Core Idea:** Imagine holding a hand of unsorted playing cards. You keep your left hand as a **sorted pile** and, for each new card from the right hand, you **insert it into its correct position** by shifting larger cards to the right.

**Algorithm:**
```
for i from 1 to n - 1:
    key = nums[i]
    j = i - 1
    while j >= 0 and nums[j] > key:
        nums[j+1] = nums[j]   // shift right
        j--
    nums[j+1] = key           // drop the key into place
```

**The Invariant:**
> Before iteration `i`, `nums[0 .. i - 1]` is **already sorted** and contains the `i` smallest elements of the input seen so far. `nums[i .. n-1]` is untouched.

**Visual Trace** on `[5, 2, 4, 6, 1, 3]`:

```
Sorted zone: [5]  |  Unsorted zone: [2, 4, 6, 1, 3]
──────────────────────────────────────────────────────────
i=1, key=2: shift 5 right -> [_, 5, 4, 6, 1, 3], drop 2
Sorted zone: [2, 5]  |  Unsorted: [4, 6, 1, 3]
──────────────────────────────────────────────────────────
i=2, key=4: 4 < 5, stop immediately (no shifts!)
Sorted zone: [2, 4, 5]  |  Unsorted: [6, 1, 3]
──────────────────────────────────────────────────────────
i=3, key=6: 6 > 5, shift 5 right; j=0: 6 > 2, shift 2 right
             [2, 4, 5, 6, 1, 3] -> insert 6 at front
Sorted zone: [2, 4, 5, 6]  |  Unsorted: [1, 3]
──────────────────────────────────────────────────────────
i=4, key=1: shift everything right (1 is smallest)
             [2, 4, 5, 6, _, 3] -> insert 1 at index 0
             [1, 2, 4, 5, 6, 3]
Sorted zone: [1, 2, 4, 5, 6]  |  Unsorted: [3]
──────────────────────────────────────────────────────────
i=5, key=3: shift 6, 5, 4, 2 right until we hit 1
             [1, 2, 3, 4, 5, 6]
Final: [1, 2, 3, 4, 5, 6]
```

**Why this is the most practically important of the three:**
1. **Best case $O(N)$:** On a nearly-sorted array, the inner `while` loop barely executes → only $N - 1$ comparisons.
2. **Self-Tuning:** Cost is $O(N + \text{inv})$, where $\text{inv}$ = number of **inversions** (pairs out of order). This is the *most honest* complexity formula of any sort here.
3. **It's the base case of real sorts.** .NET's introsort and Java's TimSort both switch to **Insertion Sort** for small partitions (typically $n \le 16$) because it has near-zero overhead and beats quicksort's recursion/partitioning cost at tiny sizes.

> **Insertion Sort is why `Array.Sort` on a 10-element array is faster than any "smarter" algorithm you'd write.**

---

### 1.4 The Hidden Axis: Stability

**Stable sort** = equal elements keep their **original relative order**.

| Sort | Stable? | Why |
| :--- | :--- | :--- |
| **Bubble Sort** | ✅ Yes | Only swaps **adjacent** elements. Two equal elements can only pass each other by actually becoming unequal. |
| **Insertion Sort** | ✅ Yes | Shifts only while `nums[j] > key` (strictly greater), never `>=`. Equal elements are not jumped over. |
| **Selection Sort** | ❌ **No** | Swaps elements across **arbitrary distances** (i ↔ minIndex), so equal elements can leapfrog each other. |

**Proof that Selection Sort is unstable** (this is the classic counter-example):

```
Input:  [5a, 5b, 1]

Bubble Sort (stable):     5a never jumps over 5b ->  [1, 5a, 5b]  ✔
Insertion Sort (stable):  5a never jumps over 5b ->  [1, 5a, 5b]  ✔
Selection Sort (UNSTABLE):
  i=0: min is 1 at index 2 -> swap(index 0, index 2)
       [1, 5b, 5a]   <-- 5a and 5b REVERSED!  ✘
```

**Why this matters in interviews & production:**
- **C# specific:** `Array.Sort(int[])` is **NOT stable** (it uses introsort). To get a stable sort, use **LINQ**: `list.OrderBy(x => x.Key).ThenBy(x => x.Secondary).ToList()` — LINQ's `OrderBy`/`ThenBy` are documented as **stable**.
- Typical stable-sort use case: sorting employees by `Department`, then by `Name` within the department. An unstable sort could scramble the name order.

---

### 1.5 The Comparison: When to Use What?

| | **Bubble** | **Selection** | **Insertion** | **Built-in `Array.Sort`** |
| :--- | :---: | :---: | :---: | :---: |
| Best case | $O(N)$* | $O(N^2)$ | $O(N)$ | $O(N \log N)$ |
| Average case | $O(N^2)$ | $O(N^2)$ | $O(N^2)$ | $O(N \log N)$ |
| Worst case | $O(N^2)$ | $O(N^2)$ | $O(N^2)$ | **$O(N \log N)$** |
| Space | $O(1)$ | $O(1)$ | $O(1)$ | $O(\log N)$ stack |
| Stable | ✅ | ❌ | ✅ | ❌ (introsort) |
| # Swaps | $O(N^2)$ | $\le N-1$ | $O(N^2)$ | $O(N \log N)$ |
| Adaptive | ✅ (with flag) | ❌ | ✅ | ❌ |

\* Bubble sort's $O(N)$ best case **only** happens with the `swapped` early-exit flag. Without it, it is *always* $O(N^2)$.

**The Golden Rule for interviews:**

> **If the problem does not explicitly say "implement a sorting algorithm," use `Array.Sort` and state $O(N \log N)$.**
> Writing bubble sort when asked for Two Sum II (which needs a *sorted* array) is a self-inflicted $O(N^2)$ wound.
> Only hand-roll a sort when the interviewer says *"without using the built-in sort"* (as in LeetCode 912, 215, 912, 493) or when you specifically need the *adaptivity* of insertion sort.

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 912 — Sort an Array (Medium)

> Given an integer array `nums`, return the array **sorted in ascending order**.
> **Follow-up:** Can you solve it **without using any built-in sorting function**?

#### Approach 1: The Brute-Force Quadratic Sorts (for concept only)
Any of bubble/selection/insertion sort satisfies the constraint of "no built-in sort," but all are $O(N^2)$.

#### Approach 2: Hand-Rolled QuickSort / Merge Sort ($O(N \log N)$)
Doable, but Week 37-39 covers divide & conquer properly. For today, focus on the *conceptual* value.

#### ✅ Approach 3: The Right Answer Today — Insertion Sort
Because it is $O(1)$ space, simple to verify, stable, and adapts to nearly-sorted input.

```csharp
public class Solution {
    public int[] SortArray(int[] nums) {
        for (int i = 1; i < nums.Length; i++) {
            int key = nums[i];          // "card" to insert
            int j = i - 1;
            
            // Shift larger elements one slot to the right
            while (j >= 0 && nums[j] > key) {
                nums[j + 1] = nums[j];
                j--;
            }
            
            // Place the key in its final resting spot
            nums[j + 1] = key;
        }
        
        return nums;
    }
}
```

**The Real Production Answer** (and what you should say out loud in an interview):
```csharp
public class Solution {
    public int[] SortArray(int[] nums) {
        Array.Sort(nums);   // Introsort: O(N log N) worst case guaranteed
        return nums;
    }
}
```

---

### Problem 2: LeetCode 88 — Merge Sorted Array (Easy) ⭐⭐

> You are given **two sorted arrays** `nums1` and `nums2` of lengths `m` and `n` respectively, sorted in **non-decreasing** order.
> **Merge** `nums2` into `nums1` as a single array, **in-place** and in **sorted** order.
>
> **Constraint:** `nums1` has length $m + n$ with its first $m$ elements occupied by the original values, and the last $n$ elements are `0`.
> **Follow-up:** Can you do it in $O(1)$ extra space?

---

#### The Trap: Why the Naive Forward Merge Fails ($O(N)$ Space)

The "obvious" approach — create a third array, merge, copy back — uses $O(N)$ extra space:
```csharp
// This works but VIOLATES the in-place requirement
int[] merged = new int[m + n];
int i = 0, j = 0, k = 0;
while (i < m && j < n) { ... }
Array.Copy(merged, nums1, m + n);   // copy back — O(N) extra memory
```

Even a "clever" forward in-place merge fails:
```csharp
int i = 0, j = 0, k = 0;
while (j < n) {
    if (i < m && nums1[i] <= nums2[j]) { i++; k++; }
    else { nums1[k++] = nums2[j++]; }   // <-- CLOBBERS nums1[i] that we haven't read yet!
}
```
**Why it breaks:** writing to `k` destroys data at `k` that the read-pointer `i` has not consumed yet.

---

#### ✅ The Optimal Solution: Merge From the Back ($O(N)$ time, $O(1)$ space)

**The Insight:** If we fill the array **from the end (right to left)**, we are writing into slots that have **already been consumed** by the read pointers. Nothing valuable is ever overwritten.

**Three Pointers:**
- `i` = `m - 1` — the last **valid** element of `nums1` (start at `m - 1`, **not** `m + n - 1`, because the tail slots contain only `0`s / garbage)
- `j` = `n - 1` — the last element of `nums2`
- `k` = `m + n - 1` — the write cursor in `nums1`

**Algorithm:**
```
while j >= 0:
    if i >= 0 and nums1[i] > nums2[j]:
        nums1[k] = nums1[i]; i--; k--
    else:
        nums1[k] = nums2[j]; j--; k--
```

**Why the loop can stop early at `j >= 0`:** once `nums2` is exhausted, the remaining `nums1` elements are already in place — no work needed.

---

**Step-by-Step Visual Trace:**
`nums1 = [1, 2, 3, 0, 0, 0]`, `m = 3`; `nums2 = [2, 5, 6]`, `n = 3`

```
i = 2 (val 3), j = 2 (val 6), k = 5
nums1: [ 1, 2, 3, 0, 0, 0 ]
                            ▲ k=5
  nums1[2]=3 > nums2[2]=6 ? NO -> place 6
  [ 1, 2, 3, 0, 0, 6 ]   j=1, k=4
──────────────────────────────────────────────────
i = 2 (val 3), j = 1 (val 5), k = 4
  3 > 5 ? NO -> place 5
  [ 1, 2, 3, 0, 5, 6 ]   j=0, k=3
──────────────────────────────────────────────────
i = 2 (val 3), j = 0 (val 2), k = 3
  3 > 2 ? YES -> place 3 from nums1
  [ 1, 2, 3, 5, 6, 0 ]  <-- wait, k=3 was 0, now 3 was already there
                          place 3: nums1[3] = nums1[2] = 3
  [ 1, 2, 3, 3, 5, 6 ]   i=1, k=2   (overwrote the 0 slot — safe, already consumed)
──────────────────────────────────────────────────
i = 1 (val 2), j = 0 (val 2), k = 2
  nums1[1]=2 > nums2[0]=2 ? NO (equal -> take nums2 side)
  place 2: nums1[2] = nums2[0] = 2
  [ 1, 2, 2, 3, 5, 6 ]   j=-1, k=1   <-- j < 0, loop exits
──────────────────────────────────────────────────
Loop ends. Result: [ 1, 2, 2, 3, 5, 6 ]   ✔ Sorted!
```

---

**C# Implementation:**
```csharp
public class Solution {
    public void Merge(int[] nums1, int m, int[] nums2, int n) {
        int i = m - 1;            // last valid element in nums1
        int j = n - 1;            // last element in nums2
        int k = m + n - 1;        // write cursor
        
        while (j >= 0) {
            if (i >= 0 && nums1[i] > nums2[j]) {
                nums1[k] = nums1[i];
                i--;
            } else {
                nums1[k] = nums2[j];
                j--;
            }
            k--;
        }
    }
}
```

**Complexity:** Time $O(m + n)$ (each element written exactly once), Space $O(1)$.

**The Generalizable Lesson (this is the real takeaway):**
> **When merging into a fixed-size buffer, iterate *backward*.**
> Forward merging requires destination space; backward merging only reuses already-consumed slots. This same logic reappears in **in-place merge sort**, **LC 453 Merge Sorted Array (min moves)**, and **sorting a nearly-sorted array with a single element out of place**.

---

### Bonus: Sorting with Custom Comparers in C#

```csharp
// Sort by LastName, then by FirstName (multi-key, STABLE via LINQ)
var people = new List<Person> { /* ... */ };
people.OrderBy(p => p.LastName)
      .ThenBy(p => p.FirstName)
      .ToList();

// Custom type comparison with IComparer<T>
public class PersonByAge : IComparer<Person> {
    public int Compare(Person a, Person b) => a.Age.CompareTo(b.Age);
}
people.Sort(new PersonByAge());       // <-- List<T>.Sort is ALSO unstable
Array.Sort(peopleArray, new PersonByAge());
```

---

## 3. 🏋️ PRACTICE: Edge Cases & Self-Check

### Edge Cases Checklist:
- **Empty array** `[]`: Bubble `$n-1 = -1$ passes → no-op`; Insertion `for i=1..-1 → no-op`; Selection `no-op`. All safe.
- **Single element** `[5]`: All three are no-ops. Return immediately.
- **All identical** `[3,3,3,3]`: Insertion does $N-1$ comparisons, **zero swaps/shifts** → $O(N)$.
- **Reverse sorted** `[5,4,3,2,1]`: **Worst case** for all three → $O(N^2)$.
- **Integer overflow:** Comparison sorts never sum values, so overflow is not a concern. (Contrast with prefix-sum / product problems.)
- **LC 88 special case:** `n = 0` (nothing to merge) → `j = -1` immediately, loop never runs. ✅
- **LC 88 special case:** `m = 0` (nums1 is all zeros) → `i = -1`, guard `i >= 0` fails, all of `nums2` copied in. ✅

---

## 4. 🎯 Day 5 Checkpoint Questions & Answers

### Question 1: Counting Inversions (Insertion Sort's True Cost)

- **Question:** Insertion Sort is $O(N + \text{inv})$. Given `nums = [3, 1, 4, 2, 5]`, how many **inversions** are there, and therefore what is the exact number of *key comparisons* the algorithm performs?
- **Answer:**
  An **inversion** is a pair $(i, j)$ where $i < j$ but $\text{nums}[i] > \text{nums}[j]$.

  | $i$ | Value | Pairs to its right that are smaller |
  | :--- | :---: | :--- |
  | 0 | `3` | `1`, `2` → **2 inversions** |
  | 1 | `1` | (none smaller than 1 to its right) → **0** |
  | 2 | `4` | `2` → **1 inversion** |
  | 3 | `2` | (none smaller than 2 to its right) → **0** |
  | 4 | `5` | (none) → **0** |
  | | | **Total = 3 inversions** |

  Each inversion corresponds to exactly one shift of the inner `while` loop. Additionally, the algorithm makes $N - 1 = 4$ **failed** key comparisons (one per outer-loop iteration, when the key is already correctly placed).
  $$\text{Total key comparisons} = \text{inv} + (N - 1) = 3 + 4 = \boxed{7}$$

---

### Question 2: Reverse-Merge Correctness

- **Question:** In LeetCode 88, why must the read pointer `i` start at `m - 1` instead of `m + n - 1`?
- **Answer:**
  The last $n$ slots of `nums1` (indices `m` through `m + n - 1`) contain **placeholder `0`s** (or, in the general version, **uninitialized garbage**), not real data from `nums1`.
  If `i` started at `m + n - 1`, the algorithm would read those zeros as legitimate `nums1` elements. Since `0` is the minimum possible value, it would always lose the comparison to `nums2[j]` and be written to the back of the array — placing spurious zeros *after* real values, producing garbage output like `[1, 2, 3, 5, 6, 0]`.
  Starting `i` at `m - 1` restricts reads to the genuinely-occupied prefix `nums1[0 .. m-1]`.

---

### Question 3: Choosing a Sort in an Interview

- **Question:** You are asked to "return the k-th largest element in an array" and no constraint mentions sorting. Which do you write, and why?
- **Answer:**
  **Do not use `Array.Sort` on the whole array by default — consider quickselect.** However, for interview clarity, `Array.Sort` is acceptable if $N$ is modest. The reasoning you should voice out loud:

  | Approach | Time | Space | Notes |
  | :--- | :---: | :---: | :--- |
  | `Array.Sort` then index `nums[n - k]` | $O(N \log N)$ | $O(\log N)$ | Simple, correct, **always acceptable** unless constraints forbid |
  | Max-heap (build $O(N)$, pop $k$ times $O(k \log N)$) | $O(N + k \log N)$ | $O(N)$ | Better when $k$ is tiny; taught in Week 16-17 |
  | **Quickselect** (expected) | $O(N)$ | $O(1)$ | Optimal average case; taught in Week 47-48 |

  The decision rule: **if $k$ is small relative to $N$ and you know heaps/quickselect, use them; otherwise `Array.Sort` is the pragmatic, defensible answer.** The most important thing is that you *state the complexity out loud* so the interviewer knows you considered the alternatives.

---

## 🔗 CONNECT: Where This Leads

- **Next (Day 6):** Integration day — LeetCode **3Sum** (sort + two pointers) and **Trapping Rain Water** (opposite-end pointers applied to a prefix-max problem).
- **Week 2 (Day 8-10):** Prefix sums, which frequently pair with sorting (e.g., counting inversions via merge sort).
- **Week 4-5:** Binary search **requires** a sorted array — the order invariant established here becomes a hard precondition there.
- **Week 16-17:** Heaps formalize the "Top K" alternative raised in Question 3.
- **Week 37-39:** Merge sort — the $O(N \log N)$ upgrade of today's merge routine.
