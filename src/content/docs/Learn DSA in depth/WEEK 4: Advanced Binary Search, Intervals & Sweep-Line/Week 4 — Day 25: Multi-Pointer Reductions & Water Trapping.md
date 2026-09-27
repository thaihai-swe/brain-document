---
title: "Week 4 — Day 25: Multi-Pointer Reductions & Water Trapping"
---

Over **Days 22 to 24**, we conquered logarithmic search spaces: exact vs boundary searches, cyclic rotations, and binary search on monotonic answer spaces.

Today, we return to multi-element combinations and spatial geometry with **Advanced Multi-Pointer Reductions & Water Trapping**.

In basic pointer problems (Week 1), you moved two pointers across a 1D array. Today, we elevate pointer coordination to solve two of the most heavily tested algorithmic archetypes in Big Tech interviews:
1. **Dimensionality Reduction ($K$-Sum):** How sorting and two-pointer coordination reduces polynomial brute force from $O(N^3) \to O(N^2)$ (and $O(N^K) \to O(N^{K-1})$).
2. **The Bounded-Min Invariant (Trapping Rain Water):** How proving a directional bottleneck collapses an $O(N)$ auxiliary space Dynamic Programming problem into an optimal **$O(1)$ auxiliary space** two-pointer algorithm.

---

## 1. 🧠 TEACH: Dimensionality Reduction & The Bounded-Min Invariant

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **Multi-Pointer Reductions** reduce high-dimensional combinatorial search problems by fixing outer anchor variables and coordinating converging pointers along the remaining degrees of freedom.
  - *Core Invariants:* Anchor Invariant: In $K$-Sum, sorting and anchoring $K-2$ variables reduces problem to $2\text{Sum}$ on suffix; Bounded-Min Invariant: Trapped water at index $i$ is $\min(left\_max, right\_max) - height[i]$.
  - *Misconception Check:* In Trapping Rain Water, you do *not* need $O(N)$ left and right prefix-max arrays. Moving the pointer with the strictly smaller height guarantees that the other side contains an equal or taller wall, enabling $O(1)$ space.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates polynomial explosion ($O(N^K) \to O(N^{K-1})$) and auxiliary buffer allocations ($O(N) \to O(1)$ space).
  - *Complexity Advantage:* 3Sum: $O(N^3) \to O(N^2)$ time; Rain Water: $O(N)$ space $\to O(1)$ space.
- **3. WHEN:**
  - *When to Choose / Signal Words:* 3Sum (LC 15), 3Sum Closest (LC 16), 4Sum (LC 18), Trapping Rain Water (LC 42), Container With Most Water (LC 11).
  - *When to Avoid / Failure Modes:* When array order cannot be disrupted and output requires original unsorted indices (unless index-value pairs are tracked).
- **4. WHERE:**
  - *Physical CLR Memory:* Stack registers for anchor indices and converging boundary pointers; zero heap allocations during pointer convergence.
  - *Production Systems:* Computer graphics horizon culling, physics fluid simulation volume calculation, geometric convex hull bounding.
- **5. WHO:**
  - *Spoken Script:* "To solve K-Sum problems, sorting enables duplicate pruning and allows fixing $K-2$ variables in outer loops while running two-pointer convergence on the innermost pair. For Trapping Rain Water, because the lower boundary limits the water ceiling, I advance the shorter side inward in $O(N)$ time and $O(1)$ space."
  - *Interviewer Evaluation Lens:* Checks duplicate pruning hygiene at all pointer levels, mathematical proof of the bounded-min invariant, and off-by-one avoidance.
- **6. HOW:**
  - *Cost Model:* 3Sum: $O(N^2)$ time, $O(1)$ aux space; Rain Water: $O(N)$ time, $O(1)$ aux space.
  - *State Transition Trace (Container With Most Water):* `h=[1,8,6,2,5,4,8,3,7] -> L=0 (1), R=8 (7) -> area = 1 * 8 = 8 -> h[L] < h[R] => L++ -> L=1 (8), R=8 (7) -> area = 7 * 7 = 49 -> h[R] < h[L] => R--`.


### 1.1 Dimensionality Reduction ($O(N^3) \to O(N^2)$)

Consider finding all unique triplets in an array such that:
$$nums[i] + nums[j] + nums[k] = 0 \quad (i \ne j \ne k)$$

- **Brute Force:** Enumerate all triplets with three nested loops.
  - Number of triplets: $\binom{N}{3} = \frac{N(N-1)(N-2)}{6} \approx O(N^3)$.
  - For $N = 3,000$, $N^3 = 2.7 \times 10^{10}$ operations $\to$ **Time Limit Exceeded (TLE)**.

#### The Reduction Strategy:
1. **Sort the array:** Costs $O(N \log N)$ upfront.
2. **Fix the first element:** Iterate index $i$ from $0$ to $N - 3$.
3. **Reduce to Two Sum II:** The equation becomes:
   $$nums[j] + nums[k] = -nums[i] \quad \text{for } j > i, k > j$$
   Because the array is sorted, we can find all valid pairs $(j, k)$ using **Opposite-Ends Two Pointers** in $O(N)$ linear time!
4. **Overall Complexity:** $N$ outer iterations $\times O(N)$ two-pointer scan = **$O(N^2)$ total time**. Sorting overhead $O(N \log N)$ is completely eclipsed by $O(N^2)$.

```
nums = [ -4,  -1,  -1,   0,   1,   2 ]   (Sorted)
          ▲    ▲                   ▲
       Fixed  left               right
      nums[i] nums[j]           nums[k]

Target for (left, right): -(nums[i]) = -(-4) = 4
Sum = (-1) + 2 = 1 < 4  --> Need bigger sum --> left++
```

---

### 1.2 The Duplicate Pruning Invariant (The #1 3Sum Bug)

The LeetCode 15 problem specification requires returning **only unique triplets**.

If you use a Hash Set of lists to filter duplicates after the fact, you incur massive heap allocation overhead, GC pressure, and hashing costs. Production Big Tech code enforces duplicate pruning **in-place via loop invariants**.

#### Invariant Rule 1: Outer Loop Duplicate Pruning
When fixing `nums[i]`, we must skip any value identical to the previous fixed value:

```csharp
// ✅ CORRECT: Skip if identical to PREVIOUS element
if (i > 0 && nums[i] == nums[i - 1]) continue;
```

#### Why `nums[i] == nums[i - 1]` and NEVER `nums[i] == nums[i + 1]`?
- If `nums = [-1, -1, 2]`:
  - If you check `nums[i] == nums[i + 1]`, when $i = 0$ (`nums[0] = -1`), you see `nums[1] = -1` and **skip it**.
  - You would throw away the valid triplet `[-1, -1, 2]` before even examining it!
  - By checking `nums[i] == nums[i - 1]`, we allow the first occurrence of `-1` to pair with the second `-1`, but we prevent the second `-1` from spawning duplicate triplets as an outer anchor.

#### Invariant Rule 2: Inner Two-Pointer Duplicate Pruning
Once a valid triplet is found (`nums[i] + nums[left] + nums[right] == 0`), both pointers must advance past all identical elements:

```csharp
while (left < right && nums[left] == nums[left + 1]) left++;
while (left < right && nums[right] == nums[right - 1]) right--;
left++;
right--;
```

---

### 1.3 Trapping Rain Water: The Bounded-Min Principle

Given an elevation map where each bar has width 1, compute how much water it can trap after raining:

```
Elevation: [ 0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1 ]
```

```
Height
  3 │                             █
  2 │             █ ~ ~ ~ ~ ~ ~ █ █ ~ █
  1 │     █ ~ ~ █ █ ~ █ █ █ █ █ █
  0 └───█───█───█───█───█───█───█───█───█───█───█───█──►
      0 1 0 2 1 0 1 3 2 1 2 1
          ▲
    Water at index 2 = 1 unit!
```

#### The Fundamental Physical Law of Water Trapping:
Water cannot float into the sky. For any specific column $i$, water is contained by the tallest barrier to its left and the tallest barrier to its right:

$$\mathbf{\text{Water}[i] = \max\Big(0, \ \min(\text{LeftMax}[i], \ \text{RightMax}[i]) - \text{Height}[i]\Big)}$$

#### The 3-Stage Evolutionary Progression:

1. **Naive ($O(N^2)$ Time, $O(1)$ Space):**
   - For every column $i$, scan left to find $\max(0 \dots i)$ and scan right to find $\max(i \dots N-1)$.
   - $N$ columns $\times O(N)$ scan = $O(N^2)$. Inefficient.

2. **Prefix/Suffix DP ($O(N)$ Time, $O(N)$ Space):**
   - Precompute two arrays:
     - `leftMax[i]` = running maximum from $0$ to $i$.
     - `rightMax[i]` = running maximum from $N-1$ down to $i$.
   - Calculate water at each column in a single pass: $\min(leftMax[i], rightMax[i]) - height[i]$.
   - Fast, but requires $2N$ auxiliary integer storage.

3. **Optimal Two Pointers ($O(N)$ Time, $O(1)$ Auxiliary Space):**
   - Place `left = 0, right = N - 1`. Maintain running scalars `leftMax` and `rightMax`.
   - **The Mathematical Invariant:**
     - If `leftMax < rightMax`, what do we know about column `left`?
     - We know `leftMax` is strictly smaller than `rightMax`. Even if there is an even taller wall somewhere between `left` and `right`, **it does not matter**! The water at `left` is strictly bounded by $\min(leftMax, \dots) = leftMax$.
     - Therefore, the water trapped at `left` is guaranteed to be `leftMax - height[left]`. We can process `left` immediately and increment `left++`!
     - Symmetrically, if `rightMax <= leftMax`, the water at `right` is strictly bounded by `rightMax`. We process `right` and decrement `right--`!

---

### 1.4 Interview Spoken Drill (20–30 Seconds)

> *"To find trapped rain water in optimal $O(1)$ space, I maintain two pointers at the boundaries and track `leftMax` and `rightMax`. At each step, whichever boundary maximum is smaller determines the ceiling for that side, because water height is governed strictly by the shorter barrier. This allows me to compute water at the smaller pointer immediately without needing to know the exact maximums in between, solving the problem in a single pass with zero extra memory."*

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 15 — 3Sum (Medium)

> Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.
> Notice that the solution set must not contain duplicate triplets.

#### Step-by-Step Visual Trace:
`nums = [-1, 0, 1, 2, -1, -4]`
Sort: `nums = [-4, -1, -1, 0, 1, 2]`

```
i = 0: nums[0] = -4
 Target for (left, right) = 4
 left = 1 (-1), right = 5 (2) -> sum = 1 < 4 -> left++
 left = 2 (-1), right = 5 (2) -> sum = 1 < 4 -> left++
 left = 3 (0),  right = 5 (2) -> sum = 2 < 4 -> left++
 left = 4 (1),  right = 5 (2) -> sum = 3 < 4 -> left++
 (No triplets with -4)

i = 1: nums[1] = -1
 Target for (left, right) = 1
 left = 2 (-1), right = 5 (2) -> sum = -1 + 2 = 1 == 1 (MATCH!)
  -> Record [-1, -1, 2]
  -> Skip dups: left++ (0), right-- (1)
 left = 3 (0),  right = 4 (1) -> sum = 0 + 1 = 1 == 1 (MATCH!)
  -> Record [-1, 0, 1]
  -> left++ (4), right-- (3) -> left > right (done with i = 1)

i = 2: nums[2] = -1
 nums[2] == nums[1] -> SKIP DUPLICATE! (Prevents duplicate [-1, 0, 1])

i = 3: nums[3] = 0
 Target = 0
 left = 4 (1), right = 5 (2) -> sum = 3 > 0 -> right-- -> left >= right (done)

Result: [ [-1, -1, 2], [-1, 0, 1] ]
```

#### Production C# Implementation:
```csharp
public class SolutionThreeSum {
    public IList<IList<int>> ThreeSum(int[] nums) {
        var result = new List<IList<int>>();
        if (nums == null || nums.Length < 3) return result;

        // Step 1: Sort array to enable two pointers and duplicate pruning
        Array.Sort(nums);
        int n = nums.Length;

        for (int i = 0; i < n - 2; i++) {
            // Early exit optimization: Smallest number > 0 means sum can never be 0
            if (nums[i] > 0) break;

            // Invariant Rule 1: Skip duplicate fixed elements
            if (i > 0 && nums[i] == nums[i - 1]) continue;

            int left = i + 1;
            int right = n - 1;
            int target = -nums[i];

            while (left < right) {
                int sum = nums[left] + nums[right];

                if (sum == target) {
                    result.Add(new List<int> { nums[i], nums[left], nums[right] });

                    // Invariant Rule 2: Skip duplicate left and right elements
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;

                    left++;
                    right--;
                } else if (sum < target) {
                    left++; // Need a larger sum
                } else {
                    right--; // Need a smaller sum
                }
            }
        }

        return result;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N^2)$ — sorting takes $O(N \log N)$; outer loop runs $N$ times, inner two-pointer scan takes $O(N)$. $N \log N + N^2 = O(N^2)$.
- **Space Complexity:** $O(1)$ auxiliary space (ignoring sorting stack depth $O(\log N)$ and output list).

---

### Problem 2: LeetCode 16 — 3Sum Closest (Medium)

> Given an integer array `nums` of length `n` and an integer `target`, find three integers in `nums` such that the sum is closest to `target`. Return the sum of the three integers.
> You may assume that each input would have exactly one solution.

#### The Core Invariant:
Instead of looking for an exact sum, we track `closestSum`. If $|currentSum - target| < |closestSum - target|$, update `closestSum`. If $currentSum == target$, return immediately ($0$ difference is optimal).

#### Production C# Implementation:
```csharp
public class SolutionThreeSumClosest {
    public int ThreeSumClosest(int[] nums, int target) {
        Array.Sort(nums);
        int n = nums.Length;
        int closestSum = nums[0] + nums[1] + nums[2];

        for (int i = 0; i < n - 2; i++) {
            // Duplicate pruning on fixed anchor
            if (i > 0 && nums[i] == nums[i - 1]) continue;

            int left = i + 1;
            int right = n - 1;

            while (left < right) {
                int currentSum = nums[i] + nums[left] + nums[right];

                if (currentSum == target) {
                    return target; // Perfect match
                }

                // Update closest sum if current difference is smaller
                if (Math.Abs(currentSum - target) < Math.Abs(closestSum - target)) {
                    closestSum = currentSum;
                }

                if (currentSum < target) {
                    left++;
                } else {
                    right--;
                }
            }
        }

        return closestSum;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N^2)$.
- **Space Complexity:** $O(1)$ auxiliary memory.

---

### Problem 3: LeetCode 42 — Trapping Rain Water (Hard)

> Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.

#### The State Machine Trace:
`height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]`
Initialize: `left = 0, right = 11, leftMax = 0, rightMax = 0, totalWater = 0`

| Step | `left` | `right` | `height[L]` | `height[R]` | `leftMax` | `rightMax` | Action | Water Added | Total |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :---: | :---: |
| 1 | 0 | 11 | 0 | 1 | 0 | 0 | $h[L] < h[R] \implies$ update `leftMax = 0`, $L++$ | 0 | 0 |
| 2 | 1 | 11 | 1 | 1 | 1 | 1 | $h[L] \le h[R] \implies$ update `leftMax = 1`, $L++$ | 0 | 0 |
| 3 | 2 | 11 | 0 | 1 | 1 | 1 | `leftMax <= rightMax` $\implies$ water += $1 - 0 = 1$, $L++$ | **+1** | **1** |
| 4 | 3 | 11 | 2 | 1 | 2 | 1 | $h[L] > h[R] \implies$ update `rightMax = 1`, $R--$ | 0 | 1 |
| 5 | 3 | 10 | 2 | 2 | 2 | 2 | $h[L] \le h[R] \implies$ update `rightMax = 2`, $R--$ | 0 | 1 |
| 6 | 3 | 9 | 2 | 1 | 2 | 2 | `rightMax <= leftMax` $\implies$ water += $2 - 1 = 1$, $R--$ | **+1** | **2** |
| 7 | 3 | 8 | 2 | 2 | 2 | 2 | `rightMax <= leftMax` $\implies$ water += $2 - 2 = 0$, $R--$ | 0 | 2 |
| 8 | 3 | 7 | 2 | 3 | 2 | 3 | $h[L] < h[R] \implies$ update `leftMax = 2`, $L++$ | 0 | 2 |
| 9 | 4 | 7 | 1 | 3 | 2 | 3 | `leftMax < rightMax` $\implies$ water += $2 - 1 = 1$, $L++$ | **+1** | **3** |
| 10 | 5 | 7 | 0 | 3 | 2 | 3 | `leftMax < rightMax` $\implies$ water += $2 - 0 = 2$, $L++$ | **+2** | **5** |
| 11 | 6 | 7 | 1 | 3 | 2 | 3 | `leftMax < rightMax` $\implies$ water += $2 - 1 = 1$, $L++$ | **+1** | **6** |
| 12 | 7 | 7 | 3 | 3 | 3 | 3 | Loop terminates (`left == right`) | 0 | **6** |

#### Production C# Implementation:
```csharp
public class SolutionTrapRainWater {
    public int Trap(int[] height) {
        if (height == null || height.Length < 3) return 0;

        int left = 0;
        int right = height.Length - 1;
        int leftMax = 0;
        int rightMax = 0;
        int totalWater = 0;

        // Invariant: The boundary with smaller max height dictates water capacity
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) {
                    leftMax = height[left]; // New boundary wall found
                } else {
                    totalWater += leftMax - height[left]; // Trapped water
                }
                left++;
            } else {
                if (height[right] >= rightMax) {
                    rightMax = height[right]; // New boundary wall found
                } else {
                    totalWater += rightMax - height[right]; // Trapped water
                }
                right--;
            }
        }

        return totalWater;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — single pass; every step increments `left` or decrements `right`.
- **Space Complexity:** **$O(1)$ auxiliary space** — strictly scalar registers (`left`, `right`, `leftMax`, `rightMax`).

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Apply multi-pointer reductions on LeetCode:

### Problem 1 (Core Challenge): LeetCode 15 — 3Sum (Medium)
- **Goal:** Implement clean two-pointer scan with dual-level duplicate pruning.
- **Target Complexity:** $O(N^2)$ time, $O(1)$ auxiliary space.

### Problem 2 (Optimization): LeetCode 16 — 3Sum Closest (Medium)
- **Goal:** Minimize $|sum - target|$ while pruning outer loops.
- **Target Complexity:** $O(N^2)$ time, $O(1)$ auxiliary space.

### Problem 3 (Hard Classic): LeetCode 42 — Trapping Rain Water (Hard)
- **Goal:** Master the two-pointer $O(1)$ space bounded-min approach.
- **Target Complexity:** $O(N)$ time, $O(1)$ auxiliary space.

### Bonus / Extension Challenge: LeetCode 18 — 4Sum (Medium)
- **Goal:** Generalize 3Sum to 4Sum ($O(N^3)$) using two fixed outer loops or a recursive $K$-Sum template.
- **Target Complexity:** $O(N^{K-1})$ time, $O(K)$ recursion stack space.

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Pointer Strategy Matrix                         │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Find pair summing to target (sorted) ─────► 2Sum (Opposite Ends) [O(N)]
                   │
                   ├─► Find triplet / quadruplet summing to 0 ───► Sort + Fix (K-2) Anchors [O(N^(K-1))]
                   │                                               [LC 15, LC 16, LC 18]
                   │
                   ├─► Water trapped between vertical bars ──────► Two Pointers (Bounded-Min) [O(1) Space]
                   │                                               [LC 42, LC 11]
                   │
                   └─► Continuous range of time / intervals ─────► Interval Algebra & Sweep-Line (Day 26)
                                                                   [LC 56, LC 57, LC 435]
```

### Preview for Day 26: Interval Algebra & Greedy Scheduling
Today we operated on discrete array coordinates. Tomorrow in **Day 26**, we advance to **Intervals** ($[start, end]$). We will learn how sorting by start vs. end times transforms complex geometric overlapping problems into greedy linear sweeps.

---

## 5. 🎯 Day 25 Checkpoint Questions

Before concluding today's session, answer these 4 invariant questions:

1. **Outer Loop Pruning Mechanics:** In 3Sum, why does `if (i > 0 && nums[i] == nums[i - 1]) continue` correctly prevent duplicate triplets, while `if (nums[i] == nums[i + 1]) continue` mistakenly eliminates valid triplets like `[-1, -1, 2]`?
2. **The Bounded-Min Proof:** In Trapping Rain Water, if `leftMax = 2` and `rightMax = 5`, why can we calculate water at `left` without knowing if there exists an even taller wall (e.g. height 10) between `left` and `right`?
3. **Container With Most Water Contrast:** In LeetCode 11 (Container With Most Water), the area is $(R - L) \times \min(h[L], h[R])$. Why do we move the *shorter* pointer inward, and why is moving the taller pointer provably useless?
4. **Generalizing to $K$-Sum:** How does the two-pointer technique scale to arbitrary $K$-Sum? What is the recurrence relation for its time complexity?
