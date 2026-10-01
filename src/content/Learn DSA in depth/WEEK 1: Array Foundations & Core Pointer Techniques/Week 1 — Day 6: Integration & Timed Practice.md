---
title: "Week 1 — Day 6: Integration & Timed Practice"
---

Welcome to Day 6! This is your **integration day** — a chance to combine everything you've learned in Weeks 1–5 (array memory, in-place mutation, two-pointer patterns, and sorting invariants) to solve two classic, high-frequency interview problems.

You will see the **same patterns reappear** in slightly different guises, reinforcing why these abstractions matter.

---

## 1. 🧠 TEACH: Two Problems, One Mental Toolbox

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* Week 1 Integration synthesizes sorting, opposite-ends pointers, and bounded-min invariants for composite multidimensional challenges (3Sum, Trapping Rain Water).
  - *Core Invariants:* 3Sum Anchor Reduction Invariant: Sorting + fixing index $i$ reduces $3\text{Sum}(target)$ to $2\text{Sum}(target - nums[i])$ on $[i+1 .. N-1]$; Rain Water Bounded-Min Invariant: Water level at index $i$ is strictly governed by $\min(left\_max, right\_max) - height[i]$.
  - *Misconception Check:* In 3Sum, skipping duplicates must occur at *both* the outer loop and inner two-pointer loops; omitting either produces duplicate triplets. In Trapping Rain Water, you do *not* need $O(N)$ left/right max arrays; the lower wall dictates the water level, enabling $O(1)$ space.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates $O(N^3)$ brute-force search in 3Sum and $O(N)$ extra memory in Trapping Rain Water.
  - *Complexity Advantage:* 3Sum: $O(N^3) \to O(N^2)$; Trapping Rain Water: $O(N)$ space $\to O(1)$ space.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Unique triplets summing to zero", "container trapping water", "three numbers satisfying condition".
  - *When to Avoid / Failure Modes:* If the array cannot be sorted and original indices must be returned (3Sum sort destroys index mapping unless pairs of (value, index) are maintained).
- **4. WHERE:**
  - *Physical CLR Memory:* Pointers and boundary variables (`left`, `right`, `left_max`, `right_max`) reside in CPU registers. Zero heap allocations during two-pointer traversal.
  - *Production Systems:* Computer graphics rendering bounding boxes, civil engineering hydraulic elevation modeling, geometric computational convex hulls.
- **5. WHO:**
  - *Spoken Script:* "For 3Sum, I sort the array in $O(N \log N)$ and fix each element as an anchor, running opposite-ends two pointers on the suffix while aggressively skipping duplicate values. For Trapping Rain Water, because the lower of the two boundaries limits the water height, I move the pointer at the shorter boundary inward, computing trapped water in $O(N)$ time and $O(1)$ space."
  - *Interviewer Evaluation Lens:* Evaluates duplicate-skipping hygiene in 3Sum, mathematical proof of the bounded-min invariant in Trapping Rain Water, and live boundary tracing.
- **6. HOW:**
  - *Cost Model:* 3Sum: $O(N^2)$ time, $O(1)$ aux space (excluding output list); Trapping Rain Water: $O(N)$ time, $O(1)$ aux space.
  - *State Transition Trace (Rain Water):* `left=0, right=n-1; while(left < right) { if(h[left] < h[right]) { if(h[left] >= left_max) left_max=h[left]; else water += left_max - h[left]; left++; } else { ... right--; } }`.


### 1.1 Physical Mental Model: The Mountain Lake Reservoir & The Triplet Anchor Vise

Week 1 culminates in two benchmark array challenges governed by physical terrain and caliper geometry:

```
       ======================================================================
         PHYSICAL ANALOGY A: THE MOUNTAIN LAKE RESERVOIR (LC 42)
       ======================================================================

       Rain falls onto a jagged mountain range:
       
       Height:
         3 |             [Peak]                          [Peak]
         2 |             +----+   ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~  +----+
         1 |    [Peak]   |    |  +----+  ~ ~ ~  +----+   |    |
         0 |----+----+---+----+--+----+--+----+--+----+--+----+---
           Idx:   0        1       2       3       4       5
       
       At column 3 (Height 0), how high can water rise?
       - Left Wall Peak:  leftMax = 2
       - Right Wall Peak: rightMax = 3
       - Water Level: min(leftMax, rightMax) = min(2, 3) = 2!
       - Trapped Water at Idx 3 = WaterLevel - Height[3] = 2 - 0 = 2 units!

       THE TWO-POINTER CONVERGENCE LAW:
       If leftMax < rightMax:
         The left wall is the confirmed bottleneck! Even if there are Mount Everests
         hiding in the unseen fog in the middle, water on the left can NEVER exceed
         leftMax! We compute water at 'left' immediately and advance left++!
```

```
       ======================================================================
         PHYSICAL ANALOGY B: THE ANCHOR & CALIPER (3SUM LC 15)
       ======================================================================

       1. Lock the Anchor: Pick nums[i] as a fixed pivot.
       2. Squeeze the Caliper: Run Two Sum II on the remaining subarray [i + 1 .. N - 1].
       3. Step Over Clones: When a valid triplet is found, both jaws MUST step over
          identical values (nums[left] == nums[left + 1]) to prevent duplicate results!
```

---

### 1.2 LeetCode 15 — 3Sum (Medium)
> Given an integer array `nums`, return **all unique triplets** `[nums[i], nums[j], nums[k]]` such that `i != j != k` and `nums[i] + nums[j] + nums[k] == 0`.

**Why this problem exists in this curriculum:**
- It **requires** a sorted array (sorting invariant from Day 5).
- It uses the **opposite-ends two-pointer pattern** (Day 3) **twice** per iteration: once to find the target sum, once to skip duplicates.
- It’s the gateway to 4Sum, k-Sum, and many array-traversal interview questions.

**Core Template:**
```
for i from 0 to n - 3:
    // Skip duplicate i
    if i > 0 and nums[i] == nums[i-1]: continue

    left = i + 1
    right = n - 1
    while left < right:
        sum = nums[i] + nums[left] + nums[right]
        if sum == 0:
            add [nums[i], nums[left], nums[right]] to result
            // Skip duplicate left
            while left < right and nums[left] == nums[left+1]: left++
            // Skip duplicate right
            while left < right and nums[right] == nums[right-1]: right--
            left++; right--
        elif sum < 0:
            left++   // need a larger sum
        else:
            right--  // need a smaller sum
```

**The Duplicate-Skipping Invariant:**
> After processing index `i`, the triplet `[nums[i], ...]` will never be repeated, because we skip any `nums[i]` identical to the previous one. The same logic applies inside the two-pointer loop: after recording a valid triplet, we must `while`‑skip **both** ends before advancing.

---

### 1.2 LeetCode 42 — Trapping Rain Water (Hard)
> Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.

**Two Approaches Covered Today:**
1. **Two-Pointer (O(N) time, O(1) space)** — the optimal interview solution.
2. **Prefix-Max (O(N) time, O(N) space)** — easier to reason about, useful as a baseline.

**The Two-Pointer Insight:**
Maintain `left` and `right` pointers, and track `left_max` and `right_max` (the highest bar seen so far from each side).

The water trapped at any index `i` is:
$$\text{water}[i] = \min(\text{left\_max}, \text{right\_max}) - \text{height}[i] \quad (\text{if positive})$$

**Crucial Observation:**
If `height[left] < height[right]`:
- We **already know** that `left_max >= height[left]` (by definition).
- The water level at `left` is therefore **determined solely by `left_max`**, because the right side has a wall at least as tall as `right_max > height[left]`.
- So we can safely compute `trapped += left_max - height[left]`, then `left++`.

The opposite case (`height[left] >= height[right]`) symmetrically uses `right_max`.

This eliminates the need to precompute both max arrays — we only need one side’s max at a time.

---

### 1.3 ⚙️ Core Operations Deep-Dive: 3Sum Anchor Pruning & Trapping Rain Water Two-Pointer Invariants

#### Dimension 1: Operation Contract & Big-O Bounds

##### Composite Pointer Operations (`ThreeSum`, `TrapRainWater`)
- **Signatures:**
  - `public IList<IList<int>> ThreeSum(int[] nums)`: Computes all unique zero-sum triplets $[nums[i], nums[j], nums[k]]$ with $i < j < k$.
  - `public int Trap(int[] height)`: Calculates total units of trapped rain water using $O(1)$ auxiliary space two-pointer technique.
- **Preconditions:**
  - `height` contains non-negative integers; length $N \ge 0$.
  - For `ThreeSum`, array pre-sorted in $O(N \log N)$ time.
- **Postconditions:**
  - `ThreeSum`: Output list contains zero duplicate triplets; $O(1)$ extra space beyond results.
  - `Trap`: Computes exact integral volume $\sum \max(0, \min(\text{leftMax}, \text{rightMax}) - h[i])$; input array unmodified.
- **Complexity Bounds:**

| Operation | Time Complexity | Auxiliary Space | Bottleneck Evaluation | Pointer Movement |
| :--- | :--- | :--- | :--- | :--- |
| **`ThreeSum`** | $O(N^2)$ | $O(1)$ (ignoring result) | $N-2$ fixed outer anchors | Opposite-ends inward |
| **`Trap` (Two-Pointer)** | $O(N)$ single pass | $O(1)$ | Shorter wall dictates water level | Inward from shorter side |
| **`Trap` (Prefix Max Arrays)** | $O(N)$ (3 passes) | $O(N)$ | Requires two auxiliary arrays | Linear scans |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
               Trapping Rain Water Two-Pointer Execution
                                       │
                    [left = 0, right = n - 1;
                     leftMax = 0, rightMax = 0; water = 0]
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 │
                 [left < right?]                        │
                      │                                 │
           ┌──────────┴──────────┐                      │
          YES                    NO                     │
           │                     │                      │
  [height[left] <                └──────────────► [Return water]
   height[right]?]
           │
     ┌─────┴─────────────────────────┐
    YES                              NO
     │                               │
[height[left] >= leftMax?      [height[right] >= rightMax?
  leftMax = height[left] :       rightMax = height[right] :
  water += leftMax - h[left];    water += rightMax - h[right];
 left++]                        right--]
     │                               │
     └───────────────┬───────────────┘
                     │
                     └──► Loop back to [left < right?]
```

---

#### Dimension 3: Visual ASCII State Transitions

##### 1. Two-Pointer Elevation Trap Updates (`height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]`)
```
Step at left=2 (h=0), right=7 (h=3), leftMax=1, rightMax=3:
  Compare walls: height[left] (0) < height[right] (3) -> Left is shorter!
  Is height[left] (0) >= leftMax (1)? NO!
  Water trapped at left=2:
    water += leftMax - height[left] = 1 - 0 = 1 unit.
  Advance left: left = 3.

Step at left=3 (h=2), right=7 (h=3):
  height[left] (2) < height[right] (3) -> Left is shorter.
  height[left] (2) >= leftMax (1)? YES!
  Update leftMax = 2. Water added = 0.
  Advance left: left = 4.
```

##### 2. 3Sum Triplet Deduplication Pruning
```
Sorted Array: [ -4, -1, -1, 0, 1, 2 ]

Outer loop i=1 (nums[1] = -1):
  Target remainder = -(-1) = 1.
  Two pointers: left = 2 (val -1), right = 5 (val 2).
  nums[2] + nums[5] = -1 + 2 = 1 == target -> MATCH: [-1, -1, 2]!
  Inner Deduplication Skip:
    nums[left] == nums[left+1] ? (-1 == -1) -> advance left past duplicates.
    nums[right] == nums[right-1] ? (2 != 1) -> no skip.
    left++, right--.
  Next pair: left = 4 (val 1), right = 4 (val 1) -> left >= right -> terminates inner.

Outer loop i=2 (nums[2] = -1):
  nums[i] == nums[i-1] (-1 == -1) -> DUPLICATE ANCHOR!
  Skip immediately via `continue` without inner scan.
```

---

#### Dimension 4: Invariant Preservation Proof

##### Theorem 1: Lower Wall Sufficiency for Trapping Rain Water
Let the true water level at index $i$ be $W(i) = \min(\text{PrefixMax}[i], \text{SuffixMax}[i])$.
At any iteration of the two-pointer algorithm with pointers `left` and `right`:
1. `leftMax` represents the exact maximum of all heights in $[0 .. \text{left}]$.
2. `rightMax` represents the exact maximum of all heights in $[\text{right} .. N-1]$.
3. **Suppose $\text{height}[\text{left}] < \text{height}[\text{right}]$:**
   - Since `rightMax` is the maximum over $[\text{right} .. N-1]$ and $\text{right} > \text{left}$, we have:
     $$\text{SuffixMax}[\text{left}] \ge \text{height}[\text{right}] > \text{height}[\text{left}]$$
   - Furthermore, because `height[left] < height[right] <= rightMax`, it follows that:
     $$\text{leftMax} \le \text{SuffixMax}[\text{left}]$$
   - Therefore:
     $$\min(\text{PrefixMax}[\text{left}], \text{SuffixMax}[\text{left}]) = \min(\text{leftMax}, \text{SuffixMax}[\text{left}]) = \text{leftMax}$$
   - The exact water trapped at `left` is determined exclusively by `leftMax`, regardless of any unexamined bars between `left` and `right`.
Symmetrically, if $\text{height}[\text{left}] \ge \text{height}[\text{right}]$, water at `right` is strictly determined by `rightMax`.
Thus, advancing the pointer at the smaller height computes the exact water level at every position in $O(N)$ time and $O(1)$ space.

---

#### Dimension 5: Edge Case Matrix

| Edge Case | State / Input | Algorithmic Mechanism | Invariant Preservation |
| :--- | :--- | :--- | :--- |
| **Monotonically Increasing Terrain** | `[1, 2, 3, 4, 5]` | `height[left] < height[right]` holds; `height[left] >= leftMax` updates max | Traps 0 water; `water == 0` |
| **Monotonically Decreasing Terrain** | `[5, 4, 3, 2, 1]` | `height[left] >= height[right]` holds; `rightMax` updates continuously | Traps 0 water; `water == 0` |
| **All Flat Terrain** | `[2, 2, 2, 2]` | Walls equal; updates `leftMax = 2`, `rightMax = 2`; `max - h = 0` | Traps 0 water |
| **Array Length < 3** | $N < 3$ | Traps no water (needs at least 2 boundaries and 1 interior) | Returns 0 immediately |
| **3Sum No Solution** | `[1, 2, 3]` | Pair sum always $> 0$ after sorting; loop terminates | Returns empty list |
| **3Sum Large Overflow** | Values $\approx 10^9$ | Integer cast `(long)nums[i] + nums[left] + nums[right]` | Prevents 32-bit arithmetic overflow |

---

---

### 🎤 Multi-Topic Spoken Synthesis Drill (≤ 60 Seconds)

#### Synthesis Drill 4: Array vs. Linked List vs. Composite (LRU Cache Case Study)
- **Interviewer Trigger:** *"Why choose an Array over a Linked List, and when do we combine them?"*
- **Array / Dynamic Array:** Choose for instant $O(1)$ random access (`arr[i]`) and maximum CPU cache line locality (64-byte prefetching). Downside: $O(N)$ shift on mid-array mutations and reallocation spikes.
- **Linked List:** Choose when $O(1)$ boundary insertion/deletion without shifting is strictly required and size is completely unpredictable. Downside: scattered heap nodes, pointer-chasing cache misses, and 24–32B per-node CLR memory overhead.
- **Composite Solution (LRU Cache):** Combine `Dictionary<K, LinkedListNode<V>>` (for $O(1)$ key lookup) with a Doubly Linked List with permanent sentinels (for $O(1)$ node detachment and head-splicing).


## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 15 — 3Sum (Medium)

**Brute Force ($O(N^3)$):** Triple nested loops. Infeasible for $N > 100$.

**Sort + Two Pointers ($O(N^2)$):**
1. Sort the array — $O(N \log N)$.
2. Fix one element `nums[i]`.
3. Use opposite-ends two pointers on the subarray `nums[i+1 .. n-1]` to find pairs summing to `-nums[i]`.

**Step-by-Step Trace:**
`nums = [-1, 0, 1, 2, -1, -4]`

1. Sort: `[-4, -1, -1, 0, 1, 2]`
2. `i = 0`, `nums[i] = -4`. Target = `4`. Subarray `[-1, -1, 0, 1, 2]`.
   - `left = 1` (val -1), `right = 5` (val 2). Sum = -3 < 4 → `left++`
   - `left = 2` (val -1), `right = 5` (val 2). Sum = -1 < 4 → `left++`
   - `left = 3` (val 0), `right = 5` (val 2). Sum = 2 < 4 → `left++`
   - `left = 4` (val 1), `right = 5` (val 2). Sum = 3 < 4 → `left++`. Loop ends (`left >= right`). No triplet with -4.
3. `i = 1`, `nums[i] = -1`. But `i > 0` and `nums[i] == nums[i-1]`? `nums[1] == -1`, `nums[0] == -4`. Not equal, so proceed. Target = `1`. Subarray `[-1, 0, 1, 2]`.
   - `left = 2` (val -1), `right = 5` (val 2). Sum = 1 == target! Add triplet `[-1, -1, 2]`.
     - Skip duplicates: `left` advances past any consecutive equal values (none here). `right` retreats similarly.
     - `left = 3`, `right = 4`.
   - `left = 3` (val 0), `right = 4` (val 1). Sum = 1 == target! Add triplet `[-1, 0, 1]`.
     - `left = 4`, `right = 3` → loop ends.
4. `i = 2`, `nums[i] = -1`. `i > 0` and `nums[i] == nums[i-1]`? Yes! `nums[2] == nums[1]`. **Skip** this iteration entirely.
5. `i = 3`, `nums[i] = 0`. Target = `0`. Subarray `[1, 2]`.
   - `left = 4`, `right = 5`. Sum = 3 > 0 → `right--`. Loop ends.

**Final Result:** `[[-1, -1, 2], [-1, 0, 1]]` ✅

**C# Implementation:**
```csharp
public class Solution {
    public IList<IList<int>> ThreeSum(int[] nums) {
        var result = new List<IList<int>>();
        Array.Sort(nums);

        for (int i = 0; i < nums.Length - 2; i++) {
            // 1️⃣ Skip duplicate i
            if (i > 0 && nums[i] == nums[i - 1]) continue;

            int target = -nums[i];
            int left = i + 1;
            int right = nums.Length - 1;

            while (left < right) {
                int sum = nums[left] + nums[right];

                if (sum == target) {
                    result.Add(new List<int> { nums[i], nums[left], nums[right] });

                    // 2️⃣ Skip duplicate left
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    // 3️⃣ Skip duplicate right
                    while (left < right && nums[right] == nums[right - 1]) right--;

                    left++;
                    right--;
                } else if (sum < target) {
                    left++;
                } else {
                    right--;
                }
            }
        }

        return result;
    }
}
```

---

### Problem 2: LeetCode 42 — Trapping Rain Water (Hard)

**Example:** `height = [0,1,0,2,1,0,1,3,2,1,2,1]`

**Answer:** 6 units of water.

#### Approach A: Prefix-Max (Baseline, O(N) space)
- `leftMax[i] = max(height[0..i])`
- `rightMax[i] = max(height[i..n-1])`
- `water[i] = min(leftMax[i], rightMax[i]) - height[i]` (if > 0)
- Walk through once to fill arrays, once to compute answer.

#### Approach B: Two-Pointer (O(1) space) ⭐

```
left = 0, right = n - 1
left_max = 0, right_max = 0
water = 0

while left < right:
    if height[left] < height[right]:
        if height[left] >= left_max:
            left_max = height[left]
        else:
            water += left_max - height[left]
        left++
    else:
        if height[right] >= right_max:
            right_max = height[right]
        else:
            water += right_max - height[right]
        right--
```

**Visual Trace on `[0,1,0,2,1,0,1,3,2,1,2,1]` (n = 12):**

```
left=0 (h=0), right=11 (h=1), left_max=0, right_max=0, water=0
h[left] < h[right]? 0 < 1 YES
  height[left]=0 >= left_max=0? YES -> left_max=0
  left++ -> left=1

left=1 (h=1), right=11 (h=1), left_max=0, right_max=0, water=0
h[left] < h[right]? 1 < 1 NO (equal falls into else branch)
  height[right]=1 >= right_max=0? YES -> right_max=1
  right-- -> right=10

left=1 (h=1), right=10 (h=2), left_max=0, right_max=1, water=0
h[left] < h[right]? 1 < 2 YES
  height[left]=1 >= left_max=0? YES -> left_max=1
  left++ -> left=2

left=2 (h=0), right=10 (h=2), left_max=1, right_max=1, water=0
h[left] < h[right]? 0 < 2 YES
  height[left]=0 >= left_max=1? NO -> water += left_max - height[left] = 1 - 0 = 1   water=1
  left++ -> left=3

left=3 (h=2), right=10 (h=2), left_max=1, right_max=1, water=1
h[left] < h[right]? 2 < 2 NO (else branch)
  height[right]=2 >= right_max=1? YES -> right_max=2
  right-- -> right=9

left=3 (h=2), right=9 (h=1), left_max=1, right_max=2, water=1
h[left] < h[right]? 2 < 1 NO (else branch)
  height[right]=1 >= right_max=2? NO -> water += right_max - height[right] = 2 - 1 = 1   water=2
  right-- -> right=8

left=3 (h=2), right=8 (h=2), left_max=1, right_max=2, water=2
h[left] < h[right]? 2 < 2 NO (else branch)
  height[right]=2 >= right_max=2? YES -> right_max=2 (unchanged)
  right-- -> right=7

left=3 (h=2), right=7 (h=3), left_max=1, right_max=2, water=2
h[left] < h[right]? 2 < 3 YES
  height[left]=2 >= left_max=1? YES -> left_max=2
  left++ -> left=4

... (continue similarly, water accumulates from indices 4,5,6)
Final water = 6 ✅
```

**C# Implementation (Two-Pointer):**
```csharp
public class Solution {
    public int Trap(int[] height) {
        int left = 0;
        int right = height.Length - 1;
        int left_max = 0, right_max = 0;
        int water = 0;

        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= left_max) {
                    left_max = height[left];
                } else {
                    water += left_max - height[left];
                }
                left++;
            } else {
                if (height[right] >= right_max) {
                    right_max = height[right];
                } else {
                    water += right_max - height[right];
                }
                right--;
            }
        }

        return water;
    }
}
```

---

## 3. 🏋️ PRACTICE: Edge Cases & Self-Check

### 3Sum Edge Cases:
- **No valid triplets:** `[1, 2, 3]` → empty result.
- **All zeroes:** `[0, 0, 0, 0]` → `[[0, 0, 0]]`.
- **Multiple duplicates:** `[-1, -1, -1, 0, 1]` → careful with `i`, `left`, `right` skips.
- **Array length < 3:** return empty list immediately.

### Trapping Rain Water Edge Cases:
- **No water:** `[1, 2, 3, 4]` (strictly increasing) → `0`.
- **All same height:** `[3, 3, 3, 3, 3]` → `0`.
- **Single bar:** `[5]` → `0` (loop `left < right` never runs).
- **Two bars:** `[2, 1]` → `0` (no enclosed space).

---

## 4. 🎯 Day 6 Checkpoint Questions & Answers

### Question 1: 3Sum Duplicate Skipping Correctness
- **Question:** In `3Sum`, why do we skip duplicates for `i` *before* entering the two-pointer loop, but skip duplicates for `left` and `right` *after* finding a valid triplet?
- **Answer:**
  - **`i` duplicates:** If `nums[i] == nums[i-1]`, any triplet starting with `nums[i]` would be identical to a triplet already generated when `i-1` was processed. Skipping *before* the inner loop prevents generating the same first element twice.
  - **`left`/`right` duplicates:** After recording `[nums[i], nums[left], nums[right]]`, there may be other pairs between the current `left` and `right` that yield the same sum. If we only did `left++` / `right--` once, the *next* iteration might produce the exact same triplet values. The `while` loops rigorously advance past **all** consecutive equal values, guaranteeing the next valid triplet has a different `nums[left]` or `nums[right]`.

---

### Question 2: Two-Pointer Water Level Logic
- **Question:** In the Trapping Rain Water two-pointer approach, when `height[left] < height[right]`, you said the water level at `left` is determined by `left_max`. But what if `right_max` (tracked from the other side) is actually *smaller* than `left_max`? Wouldn't that give the wrong water amount?
- **Answer:**
  This is the most common point of confusion! Let's reason it through:
  - The condition `height[left] < height[right]` guarantees that **there exists at least one bar on the right side (namely `height[right]`) that is taller than the current `left` bar.**
  - Therefore, `right_max` (the maximum bar seen so far from the right) satisfies `right_max >= height[right] > height[left]`.
  - The water level at `left` is capped by the **shorter** of the two side-maximums: `min(left_max, right_max)`.
  - Since we know `right_max > height[left]`, the bottleneck is `left_max`. If `left_max <= right_max`, water = `left_max - height[left]`. If somehow `left_max > right_max` (impossible under the invariant), the formula would still be `min(left_max, right_max) - height[left]`, but the `if height[left] < height[right]` condition ensures we only enter this branch when the right side is structurally capable of holding water up to `left_max`.

  Formally, the invariant maintained is: **`left_max` is the highest bar from index 0 to `left`; `right_max` is the highest bar from index `right` to n-1`. If `height[left] < height[right]`, then `right_max >= height[right] > height[left]`, so `min(left_max, right_max) = left_max` (because `left_max` could be anything, but we know `right_max` is already large enough to not be the minimum). Wait, actually the rigorous invariant is: *at any step, `left_max >= max(height[0..left])` and `right_max >= max(height[right..n-1])`.* The key is that when `height[left] < height[right]`, the right maximum is guaranteed to be **at least** `height[right]`, which is already larger than `height[left]`. Therefore `min(left_max, right_max)` is *always* `left_max` (since `left_max` is the max from the left, and `right_max` is known to be bigger than the current `left` element). Actually, `left_max` could be larger than `right_max` if we've seen a huge bar on the left earlier. But the formula `water += left_max - height[left]` works because **the water trapped at `left` cannot exceed the lower of the two side maximums**, and we know the right side's contribution is already "enough" (i.e., `right_max >= height[left]`), so the limiting factor is indeed `left_max`. The code is correct because we only add water when `height[left] < left_max`, and the amount added is exactly the difference between the limiting side's max and the current height. The branching on `height[left] < height[right]` ensures we're always advancing the side with the *smaller* bar, which guarantees the other side's max is a valid upper bound.

  In interview talking points, you can simplify: *"Because we always move the pointer at the **shorter** bar, the bar at the other side acts as a ceiling that's guaranteed to be tall enough. So the water level is just the max we've seen on our moving side."*

---

### Question 3: Choosing Between 3Sum Variants
- **Question:** If an interview asks for "4Sum" or "k-Sum", how does the approach change from 3Sum?
- **Answer:**
  - **4Sum:** Same template, add one more fixed index `j` after `i`, then run the standard 2Sum two-pointer on the remaining subarray. Complexity: $O(N^3)$.
  - **General k-Sum:** Recursive template: fix one element, recursively call `k-1` sum on the remaining subarray. Base case `k == 2` uses the two-pointer technique. Complexity: $O(N^{k-1})$ expected.
  - **Key optimization:** Pruning — if the smallest possible sum with the remaining elements already exceeds the target, or the largest possible sum is still below the target, terminate that branch early.

---

## 5. 🔗 CONNECT: What's Next

- **Week 2 (Day 8–10):** Prefix sums and subarray problems (e.g., LeetCode 560, 724). The sorting and two-pointer foundations you've built in Week 1 will make these significantly easier.
- **Week 4–5:** Binary search on answer and monotonic binary search templates — a conceptual leap from the pointer movements you've mastered.
- **Week 16–17:** Heaps and Top-K problems — a different *access pattern* but same $O(N \log N)$ spirit.
- **Week 37–39:** Divide & Conquer — mergesort and quicksort recursion patterns that underlie many of the algorithms you've been implementing by hand.

---

## 📌 Final Milestone Checklist Before Moving to Week 2

| ✅ Can I implement 3Sum from memory in < 10 minutes? | ___ |
| ✅ Can I implement Trapping Rain Water (two-pointer) from memory? | ___ |
| ✅ Do I instinctively know when to sort vs. when NOT to sort? | ___ |
| ✅ Can I explain the "move the shorter pointer" invariant in my own words? | ___ |
| ✅ Am I comfortable skipping duplicates in-place without extra sets? | ___ |

**If all boxes are checked → you are ready for Week 2!**
**If any are blank → re‑review that day’s checkpoint answers before proceeding.**

Whenever you're ready, say **"proceed to Week 2"** (Prefix Sums & Subarray Problems) — or let me know if you'd like to revisit any specific Day 1–6 material first!
