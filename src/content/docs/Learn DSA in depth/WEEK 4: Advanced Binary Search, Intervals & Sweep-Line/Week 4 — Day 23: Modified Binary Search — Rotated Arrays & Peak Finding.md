---
title: "Week 4 — Day 23: Modified Binary Search — Rotated Arrays & Peak Finding"
---

In **Day 22**, we established the foundational invariants of Binary Search: exact match versus boundary search (`LowerBound`), integer overflow prevention, and the half-open range `[left, right)`. Every problem assumed a globally sorted array.

Today, we confront a frequent Big Tech interview pattern: **What if the array is NOT globally sorted?**

We will prove that Binary Search does **not** strictly require a fully sorted array. It only requires a **deterministic decision rule that discards half of the search space**. We will apply this principle to two classic algorithmic challenges:
1. **Rotated Sorted Arrays:** Recovering $O(\log N)$ search when an array is cyclically shifted.
2. **Gradient Peak Finding:** Finding a local maximum in an unsorted array by climbing uphill.

---

## 1. 🧠 TEACH: Preserving Binary Search Without Global Sorting

### 1.1 The Geometric Anatomy of a Rotated Sorted Array

Take an array sorted in ascending order: `[0, 1, 2, 4, 5, 6, 7]`.  
Rotate it clockwise at pivot index 4:

```
Original: [ 0, 1, 2, 4, 5, 6, 7 ]
Rotated:  [ 4, 5, 6, 7, 0, 1, 2 ]
            ├──Segment A──┤ ├──Segment B──┤
```

Plotting the values against their indices reveals two parallel ascending ramps separated by a single vertical drop (the **inflection point**):

```
Values
  ▲
7 │              * (nums[3] = 7)
6 │           *
5 │        *
4 │     * (nums[0] = 4)
  │                                    * (nums[6] = 2)
  │                                 *
1 │                              *
0 │                           * (nums[4] = 0)  <-- INFLECTION POINT (MINIMUM)
──┼─────────────────────────────────────────────► Index
  │     0   1    2    3       4   5    6
        └─ Segment A ─┘       └─ Segment B ─┘
```

#### Crucial Geometric Properties:
1. **Segment A (Left Ramp):** Every element in Segment A is strictly greater than every element in Segment B:
   $$\forall x \in \text{Segment A}, \forall y \in \text{Segment B} \implies x > y$$
2. **The Inflection Point:** The index of the minimum element (`nums[4] = 0`) is the only place in the entire array where $nums[i] < nums[i - 1]$.

---

### 1.2 The "One Half is Always Sorted" Theorem

Pick **any** arbitrary index `mid` in a rotated sorted array. It is impossible for both halves to contain the cliff. Therefore:

> **Fundamental Invariant:**  
> For any `mid`, at least one of the two halves (`[left .. mid]` or `[mid .. right]`) is **monotonically sorted without any rotation**.

```
Case 1: nums[left] <= nums[mid]
Segment A spans left to mid. The LEFT half is strictly sorted!
[ 4,  5,  6,  7,  0,  1,  2 ]
  L           M           R
  └──Sorted───┘   └──Cliff──┘

Case 2: nums[left] > nums[mid] (or nums[mid] <= nums[right])
The cliff lies in the left half. The RIGHT half is strictly sorted!
[ 6,  7,  0,  1,  2,  4,  5 ]
  L           M           R
  └──Cliff────┘   └──Sorted───┘
```

#### How to exploit this for $O(\log N)$ search:
1. Check which half is normally sorted.
2. Because that half is sorted, we can check in **$O(1)$** whether our `target` falls within its boundaries:
   - If `target` is between `nums[left]` and `nums[mid]`, the target *must* be in the left half $\implies$ discard the right half (`right = mid - 1`).
   - Otherwise, the target *must* be in the right half $\implies$ discard the left half (`left = mid + 1`).
3. We have successfully discarded half the search space!

---

### 1.3 Finding the Inflection Point (The Minimum Element)

Suppose we want to find the minimum element in `nums = [4, 5, 6, 7, 0, 1, 2]`.  
Should we compare `nums[mid]` against `nums[left]` or `nums[right]`?

#### The Flaw of Comparing with `left`:
If `nums[mid] > nums[left]`, the minimum could be to the right (if rotated, e.g. `[4, 5, 6, 7, 0, 1, 2]`) OR to the left/at `left` (if the array is not rotated at all, e.g. `[1, 2, 3, 4, 5]`). You cannot distinguish these two cases without additional checks!

#### The Elegance of Comparing with `right`:
Compare `nums[mid]` against `nums[right]`:
- **If `nums[mid] > nums[right]`:**
  - `mid` is sitting on the elevated **Segment A**.
  - The drop-off (minimum) must lie strictly to the **right** of `mid`.
  - Discard left: `left = mid + 1`.
- **If `nums[mid] <= nums[right]`:**
  - `mid` is sitting on the lower **Segment B** (or the array was never rotated).
  - The minimum could be `mid` itself, or to the left of `mid`.
  - Keep `mid`: `right = mid`.

```
     Segment A (High)
       *     *
    *           * (mid)  ---> nums[mid] > nums[right]
                            The minimum MUST be to the right!
                            left = mid + 1
                                           Segment B (Low)
                                              *     * (right)
                                           * (min)
```

---

### 1.4 Gradient Ascent: Peak Finding on Unsorted Arrays

In [LeetCode 162], the array is **completely unsorted**, yet we can find a local peak in $O(\log N)$! How?

A **local peak** is an element strictly greater than its immediate neighbors:
$$nums[i] > nums[i - 1] \quad \text{and} \quad nums[i] > nums[i + 1]$$
*(Edges are treated as $-\infty$).*

```
Slope 1: nums[mid] < nums[mid + 1] (Ascending slope)
                * (mid+1)
             * (mid)
          *
Walking uphill guarantees finding a peak!
There MUST be at least one peak to the right.
Set: left = mid + 1.

Slope 2: nums[mid] > nums[mid + 1] (Descending slope)
          * (mid)
             * (mid+1)
                *
`mid` itself could be a peak, or a peak exists to the left.
Set: right = mid.
```

#### Why is a peak guaranteed to exist uphill?
Proof by contradiction / finiteness:
If we walk uphill to the right:
- Either the values keep increasing until the end of the array, in which case the last element is a peak (since $nums[n-1] > -\infty$).
- Or the values eventually drop at some index $k$, in which case index $k$ was a peak!
In all cases, **climbing uphill is guaranteed to terminate at a peak**.

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 153 — Find Minimum in Rotated Sorted Array (Medium)

> Suppose an array of length `n` sorted in ascending order is rotated between `1` and `n` times. Given the sorted rotated array `nums` of **unique** elements, return the minimum element of this array.
> You must write an algorithm that runs in $O(\log n)$ time.

#### Visual Step-by-Step Trace:
`nums = [4, 5, 6, 7, 0, 1, 2]`

```
Initialization:
 left = 0, right = 6

Iteration 1:
 mid = 0 + (6 - 0) / 2 = 3
 nums[mid] = nums[3] = 7
 nums[right] = nums[6] = 2
 Since 7 > 2 (nums[mid] > nums[right]):
 -> mid is on the high ramp (Segment A). The minimum is to the right!
 left = mid + 1 = 4

Iteration 2:
 left = 4, right = 6
 mid = 4 + (6 - 4) / 2 = 5
 nums[mid] = nums[5] = 1
 nums[right] = nums[6] = 2
 Since 1 <= 2 (nums[mid] <= nums[right]):
 -> mid is on the low ramp (Segment B). The minimum could be mid or to its left!
 right = mid = 5

Iteration 3:
 left = 4, right = 5
 mid = 4 + (5 - 4) / 2 = 4
 nums[mid] = nums[4] = 0
 nums[right] = nums[5] = 1
 Since 0 <= 1 (nums[mid] <= nums[right]):
 right = mid = 4

Loop terminates: left == right == 4.
Result: nums[4] = 0. (Correct!)
```

#### Production C# Implementation:
```csharp
public class SolutionFindMinRotated {
    public int FindMin(int[] nums) {
        int left = 0;
        int right = nums.Length - 1;

        // Invariant: The minimum element is always within [left, right]
        while (left < right) {
            int mid = left + (right - left) / 2;

            if (nums[mid] > nums[right]) {
                // Inflection point must be strictly to the right of mid
                left = mid + 1;
            } else {
                // mid itself could be the minimum, or it lies to the left
                right = mid;
            }
        }

        // Upon termination, left == right, pointing directly to the minimum
        return nums[left];
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(\log N)$ — the search space is cut in half on each step.
- **Space Complexity:** $O(1)$ — scalar pointers only.

---

### Problem 2: LeetCode 33 — Search in Rotated Sorted Array (Medium)

> Given the array `nums` after possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`. All values in `nums` are **unique**.
> You must achieve $O(\log n)$ runtime complexity.

#### Decision Flowchart for Each Mid:
```
                      nums[left] <= nums[mid]?
                             /        \
                           YES         NO
                          /              \
            [Left half is sorted]      [Right half is sorted]
                 /          \               /          \
      target in left?     NOT in left   target in right? NOT in right
            /                \             /                \
      right=mid-1         left=mid+1    left=mid+1        right=mid-1
```

#### Visual Step-by-Step Trace:
`nums = [4, 5, 6, 7, 0, 1, 2]`, `target = 0`

```
Iteration 1:
 left = 0, right = 6
 mid = 0 + (6 - 0) / 2 = 3
 nums[mid] = nums[3] = 7
 7 != 0 (No match)

 Is left half sorted?
 nums[left] <= nums[mid] -> 4 <= 7 (YES! Left half [4, 5, 6, 7] is sorted)
 Is target (0) within [4, 7]?
 4 <= 0 && 0 < 7 -> FALSE.
 Target is NOT in the sorted left half. It must be in the right half!
 left = mid + 1 = 4

Iteration 2:
 left = 4, right = 6
 mid = 4 + (6 - 4) / 2 = 5
 nums[mid] = nums[5] = 1
 1 != 0 (No match)

 Is left half sorted?
 nums[left] <= nums[mid] -> nums[4] <= nums[5] -> 0 <= 1 (YES! Left half [0, 1] is sorted)
 Is target (0) within [0, 1]?
 nums[left] <= target && target < nums[mid] -> 0 <= 0 && 0 < 1 -> TRUE!
 Target is inside the sorted left half!
 right = mid - 1 = 4

Iteration 3:
 left = 4, right = 4
 mid = 4 + (4 - 4) / 2 = 4
 nums[mid] = nums[4] = 0
 0 == 0 -> MATCH FOUND!
 Return mid = 4. (Correct!)
```

#### Production C# Implementation:
```csharp
public class SolutionSearchRotated {
    public int Search(int[] nums, int target) {
        int left = 0;
        int right = nums.Length - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;

            if (nums[mid] == target) {
                return mid; // Found
            }

            // Case A: Left half [left .. mid] is strictly sorted
            if (nums[left] <= nums[mid]) {
                // Is target within the sorted left half?
                if (nums[left] <= target && target < nums[mid]) {
                    right = mid - 1; // Search left
                } else {
                    left = mid + 1;  // Search right
                }
            } 
            // Case B: Right half [mid .. right] is strictly sorted
            else {
                // Is target within the sorted right half?
                if (nums[mid] < target && target <= nums[right]) {
                    left = mid + 1;  // Search right
                } else {
                    right = mid - 1; // Search left
                }
            }
        }

        return -1; // Target not found
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(\log N)$ — maintains logarithmic halving.
- **Space Complexity:** $O(1)$ — constant extra memory.

---

### Problem 3: LeetCode 162 — Find Peak Element (Medium)

> A peak element is an element that is strictly greater than its neighbors. Given a 0-indexed integer array `nums`, find a peak element, and return its index. If the array contains multiple peaks, return the index to **any of the peaks**.
> You may imagine that $nums[-1] = nums[n] = -\infty$.
> You must write an algorithm that runs in $O(\log n)$ time.

#### Visual Step-by-Step Trace:
`nums = [1, 2, 1, 3, 5, 6, 4]`

```
Initialization: left = 0, right = 6

Iteration 1:
 left = 0, right = 6
 mid = 0 + (6 - 0) / 2 = 3
 nums[mid] = 3, nums[mid + 1] = 5
 3 < 5 -> Slope is climbing UPWARD to the right!
 There must be a peak to the right.
 left = mid + 1 = 4

Iteration 2:
 left = 4, right = 6
 mid = 4 + (6 - 4) / 2 = 5
 nums[mid] = 6, nums[mid + 1] = 4
 6 > 4 -> Slope is going DOWNWARD to the right!
 mid itself could be the peak, or a peak exists to the left.
 right = mid = 5

Iteration 3:
 left = 4, right = 5
 mid = 4 + (5 - 4) / 2 = 4
 nums[mid] = 5, nums[mid + 1] = 6
 5 < 6 -> Slope is climbing UPWARD!
 left = mid + 1 = 5

Loop terminates: left == right == 5.
Return index 5 (value 6, which is > 5 and > 4). Correct!
```

#### Production C# Implementation:
```csharp
public class SolutionFindPeak {
    public int FindPeakElement(int[] nums) {
        int left = 0;
        int right = nums.Length - 1;

        // Invariant: A local peak is guaranteed to exist in [left, right]
        while (left < right) {
            int mid = left + (right - left) / 2;

            if (nums[mid] < nums[mid + 1]) {
                // Ascending slope: Climb uphill to the right
                left = mid + 1;
            } else {
                // Descending slope: Peak is at mid or to its left
                right = mid;
            }
        }

        return left; // left == right
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(\log N)$ — logarithmic gradient ascent.
- **Space Complexity:** $O(1)$.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master these core problems on LeetCode:

### Problem 1 (Inflection Point): LeetCode 153 — Find Minimum in Rotated Sorted Array (Medium)
- **Goal:** Identify the rotation boundary by comparing `mid` against `right`.
- **Target Complexity:** $O(\log N)$ time, $O(1)$ space.

### Problem 2 (Core Challenge): LeetCode 33 — Search in Rotated Sorted Array (Medium)
- **Goal:** Determine which half is sorted, then query boundaries in $O(1)$.
- **Target Complexity:** $O(\log N)$ time, $O(1)$ space.

### Problem 3 (Gradient Ascent): LeetCode 162 — Find Peak Element (Medium)
- **Goal:** Find any local maximum on an unsorted array using slope comparison ($mid$ vs $mid + 1$).
- **Target Complexity:** $O(\log N)$ time, $O(1)$ space.

### Bonus / Extension Challenge: LeetCode 81 — Search in Rotated Sorted Array II (Medium)
- **Goal:** What happens when the array contains **duplicates** (e.g., `[1, 0, 1, 1, 1]`)?
- **Hint:** When `nums[left] == nums[mid] == nums[right]`, you cannot tell which half is sorted! You must shrink both bounds linearly: `left++; right--;`. Worst-case runtime degrades to $O(N)$.

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

Compare today's modified binary search against the overall roadmap:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Search Strategy Decision                        │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Array is strictly sorted ─────────────────► Standard Binary Search (Day 22)
                   │                                               [LC 704, LC 35]
                   │
                   ├─► Array is cyclically rotated ──────────────► Rotated Binary Search (Day 23)
                   │   (Unique elements, two sorted segments)      [LC 153, LC 33]
                   │
                   ├─► Array is unsorted, find local peak ───────► Gradient Ascent (Day 23)
                   │                                               [LC 162, LC 852]
                   │
                   └─► Finding minimum feasible answer X ────────► Binary Search on Answer (Day 24)
                       (Capacity, speed, threshold)                [LC 875, LC 1011, LC 410]
```

### Preview for Day 24: Binary Search on Answer Space
Notice that in Days 22 and 23, we always searched across an **array of indices**.  
Tomorrow in **Day 24**, we elevate Binary Search to an entirely new paradigm: searching across a **range of potential answers** (e.g. ship capacity, eating speed, or split sums) where the array itself does not even need to be sorted, but the **feasibility function** $P(\text{answer})$ is monotonic.

---

## 5. 🎯 Day 23 Checkpoint Questions

Test your depth of understanding with these 4 questions:

1. **The Equality Edge Case in 33:** In LeetCode 33, why do we check `if (nums[left] <= nums[mid])` with `<=` instead of strictly `<`? What happens when `left == mid` (a two-element subarray)?
2. **The Left vs Right Reference in 153:** In LeetCode 153, what specific counter-example proves that comparing `nums[mid] > nums[left]` fails to identify the location of the minimum?
3. **Peak Finding Termination:** In LeetCode 162, why is it safe to access `nums[mid + 1]` without risking an `IndexOutOfRangeException` when the loop condition is `while (left < right)`?
4. **The Duplicate Catastrophe (LeetCode 81):** If `nums = [1, 0, 1, 1, 1]` and `target = 0`, why is it mathematically impossible for any algorithm to guarantee $O(\log N)$ worst-case time?
