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

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **Modified Binary Search** applies logarithmic partitioning to piece-wise monotonic or unimodal domains where sorted invariants hold locally.
  - *Core Invariants:* Rotated Array Invariant: For any midpoint $mid$, at least one half ($[left .. mid]$ or $[mid .. right]$) is strictly sorted; Gradient Peak Invariant: If $nums[mid] < nums[mid + 1]$, an uphill walk to the right is guaranteed to encounter a local peak.
  - *Misconception Check:* A rotated array is *not* completely unsorted. Comparing $nums[mid]$ with $nums[right]$ instantly identifies which half is normally sorted and which half contains the pivot cliff.
- **2. WHY:**
  - *Bottleneck Solved:* Prevents degrading to $O(N)$ linear scans on cyclically shifted or unimodal arrays.
  - *Complexity Advantage:* Preserves $O(\log N)$ time complexity without needing to un-rotate or restore the original array.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Search in rotated sorted array" (LC 33), "find minimum in rotated sorted array" (LC 153), "find peak element" (LC 162).
  - *When to Avoid / Failure Modes:* When rotated array contains many duplicates (e.g. `[1, 0, 1, 1, 1]`); worst-case drops to $O(N)$ because $nums[mid] == nums[left] == nums[right]$ prevents determining the sorted half.
- **4. WHERE:**
  - *Physical CLR Memory:* Stack registers for indices; zero heap memory; minimal CPU instruction branches.
  - *Production Systems:* Circular ring buffer binary search in network packet sniffers, log file time partition discovery.
- **5. WHO:**
  - *Spoken Script:* "In a rotated sorted array, splitting at any midpoint divides the array into one strictly sorted half and one rotated half. By checking if the target lies within the sorted half's boundaries, I discard the other half, maintaining logarithmic $O(\log N)$ search."
  - *Interviewer Evaluation Lens:* Checks whether candidate correctly identifies the sorted half, handles strictly $< vs \le$ comparisons, and avoids duplicate degradation traps.
- **6. HOW:**
  - *Cost Model:* Time: $O(\log N)$ (worst $O(N)$ with duplicates); Space: $O(1)$ auxiliary space.
  - *State Transition Trace (Search Rotated):* `nums=[4,5,6,7,0,1,2], target=0 -> L=0, R=6, mid=3 (val 7) -> Left [4..7] is sorted -> 0 not in [4..7] => L = mid + 1 = 4 -> L=4, R=6, mid=5 (val 1) -> Target found!`.


### 1.1 Physical Mental Model: The Broken Escalator Ramp & The Foggy Peak Walker

Modified binary search algorithms adapt to non-standard shapes through two intuitive physical terrain models:

```
       ======================================================================
         PHYSICAL ANALOGY A: THE BROKEN ESCALATOR RAMP (ROTATED ARRAY LC 33)
       ======================================================================

       A continuous escalator was cut in half and stacked:
       
       Ramp A (Elevated):   [ 4 ] -> [ 5 ] -> [ 6 ] -> [ 7 ]
                                                            \ (Cliff Drop!)
       Ramp B (Ground):                                      [ 0 ] -> [ 1 ] -> [ 2 ]
       
       THE "ONE HALF IS ALWAYS SMOOTH" LAW:
       No matter where you cut the array with `mid`:
       - One side MUST be a completely smooth, unbroken upward escalator!
       - If `nums[left] <= nums[mid]`: The left half is 100% sorted and smooth!
       - Check if target sits on that smooth ramp: `nums[left] <= target < nums[mid]`.
         If yes: Search left! If no: Discard the entire smooth ramp and search right!
```

```
       ======================================================================
         PHYSICAL ANALOGY B: THE FOGGY MOUNTAIN PEAK WALKER (LC 162)
       ======================================================================

       You are hiking on a ridge shrouded in thick fog.
       You can only see the slope right under your boots:
       
       Slope: nums[mid] < nums[mid + 1]  (Uphill to the right!)
       
                  Foggy Unknown
                    .  /\  .               You only see:
                   .  /  \  .                nums[mid] < nums[mid+1]
                  .  /    \  .                     /
                    /      \                      / (Going up!)
                   /        \                    /
                  /          \
       
       THE GUARANTEED SUMMIT LAW:
       Because the ground is rising to your right, a peak is 100% GUARANTEED
       to lie to your right! (Either the mountain keeps rising to the boundary,
       or it drops back down, creating a summit).
       You discard the entire left half with total confidence: `left = mid + 1`!
```

---

### 1.2 The Geometric Anatomy of a Rotated Sorted Array

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

### 1.5 ⚙️ Core Operations Deep-Dive: Rotated Monotonic Sub-Array Disambiguation & Gradient Peak Ascent

#### Dimension 1: Operation Contract & Big-O Bounds

##### Non-Standard Bisection Primitives (`SearchRotated`, `FindMinRotated`, `FindPeakElement`)
- **Signatures:**
  - `public int Search(int[] nums, int target)`: Partitioned bisection locating target in rotated sorted array in $\Theta(\log N)$ time and $O(1)$ space.
  - `public int FindMin(int[] nums)`: Right-referenced cliff bisection locating inflection minimum in $\Theta(\log N)$ time.
  - `public int FindPeakElement(int[] nums)`: Gradient ascent bisection locating local peak over arbitrary unsorted arrays in $\Theta(\log N)$ time.
- **Preconditions:**
  - Rotated array: Originally strictly ascending before cyclic rotation. Elements are unique.
  - Peak finding: $nums[i] \ne nums[i+1]$ for all $0 \le i < N-1$, with implicit $-\infty$ boundaries.
- **Postconditions:**
  - `Search` returns exact index of target or -1.
  - `FindMin` returns global minimum without false-triggering on unrotated inputs.
  - `FindPeakElement` returns index $i$ such that $nums[i] > nums[i-1]$ and $nums[i] > nums[i+1]$.
- **Complexity Bounds:**

| Problem Pattern | Target Condition | Key Comparison Pivot | Sub-Array Discard Decision | Worst-Case Time |
| :--- | :--- | :--- | :--- | :--- |
| **Rotated Search (LC 33)** | Exact target value | Compare `nums[left]` vs `nums[mid]` | Discard non-containing half | $O(\log N)$ |
| **Rotated Search w/ Duplicates (LC 81)**| Exact target | Dual comparison | If `nums[L]==nums[M]==nums[R]`: $L++, R--$ | **$O(N)$ degenerate** |
| **Find Minimum (LC 153)** | Cliff inflection point | Compare `nums[mid]` vs `nums[right]` | If $M > R$: $L = M + 1$; else $R = M$ | $O(\log N)$ |
| **Gradient Peak (LC 162)** | Local hill maximum | Compare `nums[mid]` vs `nums[mid+1]`| If $M < M+1$: $L = M + 1$; else $R = M$ | $O(\log N)$ |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
            Rotated Array Disambiguation Tree (LeetCode 33)
                                  │
                    [Calculate mid = left + (R-L)/2]
                                  │
                        [nums[mid] == target?]
                     ┌────────────┴────────────┐
                     ▼                         ▼
                    YES                        NO
                     │                         │
               [Return mid]          [nums[left] <= nums[mid]?]
                                      (Is LEFT half sorted?)
                                     ┌─────────┴─────────┐
                                    YES                  NO
                                     │                   │
                        [target in left half?]  [target in right half?]
                        (nums[L] <= T < nums[M]) (nums[M] < T <= nums[R])
                               ┌─────┴─────┐           ┌─────┴─────┐
                               ▼           ▼           ▼           ▼
                              YES          NO         YES          NO
                               │           │           │           │
                          [R = M - 1] [L = M + 1] [L = M + 1] [R = M - 1]
```

```
               Gradient Peak Ascent Flow (LeetCode 162)
                                  │
                     [Init: left = 0, right = N - 1]
                                  │
                            [left < right?]
                     ┌────────────┴────────────┐
                     ▼                         ▼
                    YES                        NO ──► [Return left]
                     │
         [mid = left + (right - left) / 2]
                     │
           [nums[mid] < nums[mid + 1]?]
            (Uphill gradient to right?)
            ┌─────────────┴─────────────┐
           YES                          NO
            │                           │
     (Peak MUST lie to           (mid could be peak,
      the right)                  or peak lies to left)
            │                           │
     [left = mid + 1]              [right = mid]
            │                           │
            └─────────────┬─────────────┘
                          ▼
                   (Next Iteration)
```

---

#### Dimension 3: Visual ASCII State Transitions

##### 1. Rotated Search Two-Ramp Geometry
```
Array: [ 4, 5, 6, 7, 0, 1, 2 ], Target = 0

Ramp A (Elevated): [ 4, 5, 6, 7 ]
Ramp B (Depressed): [ 0, 1, 2 ]

Step 1: left = 0 (4), right = 6 (2), mid = 3 (7)
- nums[left] (4) <= nums[mid] (7) ──► Left half [4, 5, 6, 7] is SORTED!
- Target 0 in range [4 .. 7]? NO (0 < 4).
- Target must be in right half! ──► left = mid + 1 = 4.

Step 2: left = 4 (0), right = 6 (2), mid = 5 (1)
- nums[mid] = 1, target = 0.
- nums[left] (0) <= nums[mid] (1) ──► Left half [0, 1] is SORTED!
- Target 0 in range [0 .. 1]? YES (0 <= 0 < 1).
- Target is in left half! ──► right = mid - 1 = 4.

Step 3: left = 4, right = 4, mid = 4
- nums[4] = 0 == target! Return index 4.
```

##### 2. Gradient Peak Ascent Geometry
```
Array: [ 1, 2, 1, 3, 5, 6, 4 ]

Indices:  0   1   2   3   4   5   6
Values:   1   2   1   3   5   6   4
          /   \   /       /   \   \
        up   down up     up   down down

Step 1: L=0, R=6, M=3 (val: 3)
- nums[3] (3) < nums[4] (5) ──► Uphill right!
- left = mid + 1 = 4.

Step 2: L=4, R=6, M=5 (val: 6)
- nums[5] (6) > nums[6] (4) ──► Downhill right! (Mid could be peak!)
- right = mid = 5.

Step 3: L=4, R=5, M=4 (val: 5)
- nums[4] (5) < nums[5] (6) ──► Uphill right!
- left = mid + 1 = 5.

L == R == 5. Peak found at index 5 (value 6 > 5 and 6 > 4).
```

---

#### Dimension 4: Invariant Preservation Proof

##### 1. Rotated Partition Invariant Theorem:
For any cyclically shifted sorted array $A[L \dots R]$ and midpoint $M$, at least one of the two sub-arrays $A[L \dots M]$ or $A[M \dots R]$ is guaranteed to be monotonically sorted.

##### Proof:
1. An unrotated sorted array contains 0 points of inflection (where $A[i] > A[i+1]$).
2. A rotated sorted array contains at most 1 point of inflection (the cliff between maximum and minimum).
3. The midpoint $M$ divides the array into two disjoint sub-ranges: $[L, M]$ and $[M, R]$.
4. By Pigeonhole Principle, the single inflection cliff can lie in at most one sub-range:
   - If the cliff lies in $[M, R]$, then $[L, M]$ contains 0 cliffs $\implies [L, M]$ is strictly sorted ($A[L] \le A[M]$).
   - If the cliff lies in $[L, M]$, then $[M, R]$ contains 0 cliffs $\implies [M, R]$ is strictly sorted ($A[M] \le A[R]$).
5. Testing `A[L] <= A[M]` unambiguously identifies whether the left half is monotonic. If true, range query $A[L] \le target < A[M]$ decides whether the target is in the left half in $O(1)$ time. $\blacksquare$

##### 2. Gradient Ascent Convergence Theorem:
For any array $A$ with $A[-1] = A[N] = -\infty$ and adjacent elements distinct, gradient bisection with `L = M + 1` (if $A[M] < A[M+1]$) and `R = M` (if $A[M] > A[M+1]$) converges to a local peak.

##### Proof:
1. **Loop Invariant:** The interval $[L, R]$ always contains at least one local peak.
2. **Base Case:** For $[0, N-1]$, $A[0] > A[-1] = -\infty$ and $A[N-1] > A[N] = -\infty$. At least one peak must exist between two boundaries that are both lower than the interior.
3. **Inductive Step:**
   - If $A[M] < A[M+1]$: We enter a state where the sequence ascends from $M$ to $M+1$. Since the array ends at $A[N] = -\infty$, the values cannot increase forever. They must either peak or drop, creating a peak in $[M+1, R]$.
   - If $A[M] > A[M+1]$: The sequence drops from $M$ to $M+1$. Since $A[L-1]$ was lower (or $-\infty$), a peak exists in $[L, M]$.
4. The interval length strictly shrinks on each step until $L == R$. The isolated single element $A[L]$ is proven to be a peak. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Scenario | Concrete Input | Danger / Failure Mode | Invariant Protection Mechanism |
| :--- | :--- | :--- | :--- |
| **Array Not Rotated ($k = 0$)** | `[1, 2, 3, 4, 5]` | Misinterpreting unrotated array as shifted | `nums[mid] <= nums[right]` holds everywhere; contracts $right$ down to index 0, correctly identifying `nums[0] = 1`. |
| **Array Rotated by 1 Element** | `[5, 1, 2, 3, 4]` | Boundary off-by-one | At $mid = 2$ (2), $2 \le 4 \implies right = 2$. Next $mid = 1$ (1), $1 \le 1 \implies right = 1$. Returns index 1. |
| **Strictly Decreasing Array (Peak)** | `[5, 4, 3, 2, 1]` | Cliff at index 0 | $nums[mid] > nums[mid+1]$ holds everywhere; $right$ collapses to 0. Correctly returns index 0 (peak vs $-\infty$). |
| **Strictly Increasing Array (Peak)** | `[1, 2, 3, 4, 5]` | Peak at index $N-1$ | $nums[mid] < nums[mid+1]$ holds everywhere; $left$ advances to $N-1$. Correctly returns index 4. |
| **Two Elements Only ($N = 2$)** | `[3, 1]` | `mid + 1` out of bounds | $mid = 0 + (1-0)/2 = 0$. $mid+1 = 1 \le 1$. In-bounds access guaranteed. |

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
