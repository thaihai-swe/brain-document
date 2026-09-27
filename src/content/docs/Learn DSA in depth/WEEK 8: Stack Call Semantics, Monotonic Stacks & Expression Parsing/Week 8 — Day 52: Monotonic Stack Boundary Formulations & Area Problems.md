---
title: "Week 8 — Day 52: Monotonic Stack Boundary Formulations & Area Problems"
---

In **Day 51**, we established the foundational mechanics of monotonic stacks to solve Next Greater and Smaller Element queries in amortized $O(N)$ time.

Today, we conquer one of the most celebrated geometric algorithmic patterns in Big Tech interviews:
1. **The Histogram Inversion Principle:** Transforming an $O(N^2)$ interval search into an $O(N)$ bottleneck height optimization.
2. **The Monotonic Increasing Stack:** Finding both the First Smaller to the Left ($L$) and First Smaller to the Right ($R$) in a single linear pass.
3. **The Width Invariant:** Proving why $\mathbf{\text{width} = (stack.Count == 0) \ ? \ i : i - stack.Peek() - 1}$ is mathematically bulletproof.
4. **The Virtual Zero Sentinel:** Eliminating edge cases and post-loop cleanup routines.
5. **2D Grid Reduction ([LeetCode 85]):** Projecting 2D binary matrices into running 1D histogram baselines.

---

## 1. 🧠 TEACH: Concept & Invariants

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **Monotonic Stack Boundary Formulations** compute optimal geometric areas (histograms, rectangles) by using monotonic stacks to identify the maximal left and right extent of each element.
  - *Core Invariants:* Boundary Width Invariant: For bar $h$ popped at index $mid$, its right boundary is the arriving index $i$ and its left boundary is the remaining stack top: $\text{Width} = i - \text{stack.Peek()} - 1$; Virtual Sentinel Invariant: Appending a virtual 0-height bar at index $N$ (and $-1$ at bottom) forces all remaining bars to flush and calculate.
  - *Misconception Check:* The width is *not* simply $i - mid$; the width extends from the left boundary (the new stack top after popping $mid$) to the right boundary ($i$), because all bars in between were strictly taller and previously popped.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(N^2)$ brute-force expansion of rectangular histogram areas.
  - *Complexity Advantage:* Reduces Largest Rectangle in Histogram from $O(N^2)$ to optimal $O(N)$ linear time.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Largest Rectangle in Histogram" (LC 84), "Maximal Rectangle" (LC 85). Signal words: "largest rectangle in histogram", "maximal rectangle of 1s in 2D binary matrix".
  - *When to Avoid / Failure Modes:* When bars cannot be treated as contiguous or when shapes are non-rectangular.
- **4. WHERE:**
  - *Physical CLR Memory:* Integer index stack on managed heap; appending virtual sentinel or flushing stack at array end.
  - *Production Systems:* Computer graphics silhouette bounding box aggregation, silicon chip floorplan area optimization, image processing morphological open operations.
- **5. WHO:**
  - *Spoken Script:* "In Largest Rectangle in Histogram, I maintain a monotonic increasing stack of bar indices. When a shorter bar arrives, it serves as the right boundary for the popped bar, while the remaining stack top serves as the left boundary. The width is $i - \text{top} - 1$, computing all areas in $O(N)$ time."
  - *Interviewer Evaluation Lens:* Checks derivation of the width formula $i - \text{top} - 1$, handling of empty stack left boundary, and virtual sentinel flushing.
- **6. HOW:**
  - *Cost Model:* Time: $O(N)$ single pass; Space: $O(N)$ auxiliary stack space.
  - *State Transition Trace (LC 84):* `heights=[2, 1, 5, 6, 2, 3] -> 1 pops 2: area = 2 * (1 - (-1) - 1) = 2 -> 2 pops 6: area = 6 * (4 - 2 - 1) = 6 -> 2 pops 5: area = 5 * (4 - 1 - 1) = 10 (Max Area!)`.


### 1.1 The Histogram Optimization Dilemma

Given an array of non-negative integers `heights` where each bar has width 1, find the area of the largest rectangle that fits inside the histogram:

```
        ┌───┐
        │ 6 │
    ┌───┼───┤
    │ 5 │ 6 │
    │ 5 │ 6 │     ┌───┐
┌───┼───┼───┼───┬─┼───┤
│ 2 │ 1 │ 5 │ 6 │2│ 3 │
└───┴───┴───┴───┴─┴───┘
Index: 0   1   2   3   4   5
Heights: [2, 1, 5, 6, 2, 3]
```

- **The Naive Approach ($O(N^2)$):**
  - Check every possible span $[i \dots j]$.
  - The height of the rectangle is $\min(heights[i \dots j])$.
  - The area is $(j - i + 1) \times \min(heights[i \dots j])$.
  - With $O(N^2)$ pairs, this takes $O(N^2)$ time $\implies$ **TLE for $N = 10^5$**.

---

### 1.2 The Bottleneck Inversion Principle

Instead of asking: *"For each pair of endpoints, what is the minimum bar?"*
We **invert the perspective** and ask:

> [!TIP]
> **The Bottleneck Framing:** For each bar `mid`, what is the **widest rectangle** where `heights[mid]` is the **limiting (shortest) bar**?

For any bar `mid` to act as the bottleneck height of a rectangle, the rectangle can extend:
- **To the Right:** As long as subsequent bars have height $\ge heights[mid]$. It must stop at the **First Smaller Element to the Right** ($R$).
- **To the Left:** As long as preceding bars have height $\ge heights[mid]$. It must stop at the **First Smaller Element to the Left** ($L$).

```
           L (First Smaller Left)        R (First Smaller Right)
           ▼                             ▼
       ... 1 [ 5   6   5   7 ] 2 ...
                   ▲
                  mid (height = 5)

Width = R - L - 1
Area  = heights[mid] * (R - L - 1)
```

---

### 1.3 The Monotonic Increasing Stack Mechanics

How do we find both $L$ and $R$ for every bar in a single pass?
**We maintain a Monotonic Increasing Stack of Indices** (values increase from bottom to top).

#### The Discovery Moment:
When we encounter an incoming bar $i$ such that:
$$heights[i] < heights[stack.Peek()]$$
The bar at the top of the stack (`mid = stack.Pop()`) can **no longer extend to the right**!
1. **Right Boundary ($R$):** The incoming bar $i$ is precisely the **First Smaller Element to the Right** of `mid`! Thus, $R = i$.
2. **Left Boundary ($L$):** What is the First Smaller Element to the Left of `mid`?
   - Because the stack is strictly increasing, the element *immediately below* `mid` in the stack was the last element smaller than `mid`!
   - Thus, the new top of the stack (`stack.Peek()`) is $L$!
   - If the stack is empty after popping, it means there was **no smaller element to the left** (all preceding bars were $\ge heights[mid]$), so $L = -1$.

#### The Universal Width Formula:
$$\mathbf{\text{width} = (stack.Count == 0) \ ? \ i : i - stack.Peek() - 1}$$
$$\mathbf{\text{area} = heights[mid] \times \text{width}}$$

---

### 1.4 The Flush Trap & The Virtual Zero Sentinel

Consider a strictly increasing histogram: `heights = [1, 2, 3, 4, 5]`.
- Every incoming bar is greater than the previous bar.
- Every bar is pushed onto the stack.
- When the loop finishes, **zero bars have been popped**! No areas were computed!

#### The Sentinel Solution:
Run the loop from $i = 0$ to $i = N$ (inclusive, $N + 1$ iterations):
- At index $i = N$, define a virtual sentinel bar with **$height = 0$**.
- Because $0$ is strictly less than any valid histogram bar ($height \ge 0$), encountering $heights[N] = 0$ forces the `while` loop to pop and calculate the area for **every single bar remaining in the stack**!
- Zero post-loop cleanup code required!

---

### 1.5 2D Matrix Reduction: Maximal Rectangle ([LeetCode 85])

Given a 2D binary matrix of `'0'`s and `'1'`s, find the largest rectangle containing only `'1'`s.

```
Matrix:
1  0  1  0  0       Row 0 Histogram: [1, 0, 1, 0, 0] -> Max Area = 1
1  0  1  1  1  ──►  Row 1 Histogram: [2, 0, 2, 1, 1] -> Max Area = 3
1  1  1  1  1       Row 2 Histogram: [3, 1, 3, 2, 2] -> Max Area = 6!
1  0  0  1  0       Row 3 Histogram: [4, 0, 0, 3, 0] -> Max Area = 4
```

#### The Dynamic Histogram Baseline:
Treat each row of the matrix as the horizontal ground of a histogram:
- Maintain an array `int[] heights = new int[cols]`.
- For each row $r$:
  - If `matrix[r][c] == '1'`: `heights[c] += 1` (accumulate vertical height).
  - If `matrix[r][c] == '0'`: `heights[c] = 0` (ground is broken; height resets to 0!).
  - Run **LeetCode 84 (Largest Rectangle in Histogram)** on `heights`.
- Overall Time Complexity: $M$ rows $\times O(N)$ per row = $\mathbf{O(M \times N)}$.

---

### 1.6 Interview Spoken Drill (20–30 Seconds)

> *"To find the largest rectangle in a histogram in $O(N)$ time, I invert the problem: for each bar, I determine the widest span where that bar is the bottleneck height. I maintain a monotonic increasing stack of indices. When an incoming bar is shorter than the stack top, it establishes the right boundary for the popped bar, while the new stack top provides the left boundary. The span width is calculated as `i - stack.Peek() - 1`. By appending a virtual zero-height sentinel at index N, I ensure all remaining bars in the stack are fully evaluated without requiring post-loop cleanup."*

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

### 2.1 [LeetCode 84] Largest Rectangle in Histogram

Given an array of integers `heights` representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.

#### Visual Execution Trace on `[2, 1, 5, 6, 2, 3]`:

```
Array with sentinel: [2, 1, 5, 6, 2, 3, 0 (sentinel at idx 6)]

i = 0 (h = 2): Stack empty -> Push 0. Stack: [0]
i = 1 (h = 1): 1 < 2!
  Pop 0 (h = 2). Stack empty -> width = 1. Area = 2 * 1 = 2.
  Push 1. Stack: [1]
i = 2 (h = 5): 5 > 1 -> Push 2. Stack: [1, 2]
i = 3 (h = 6): 6 > 5 -> Push 3. Stack: [1, 2, 3]
i = 4 (h = 2): 2 < 6!
  Pop 3 (h = 6). Left = 2. width = 4 - 2 - 1 = 1. Area = 6 * 1 = 6.
  2 < 5!
  Pop 2 (h = 5). Left = 1. width = 4 - 1 - 1 = 2. Area = 5 * 2 = 10! (MAX!)
  2 > 1 -> Push 4. Stack: [1, 4]
i = 5 (h = 3): 3 > 2 -> Push 5. Stack: [1, 4, 5]
i = 6 (h = 0, Sentinel):
  Pop 5 (h = 3). Left = 4. width = 6 - 4 - 1 = 1. Area = 3 * 1 = 3.
  Pop 4 (h = 2). Left = 1. width = 6 - 1 - 1 = 4. Area = 2 * 4 = 8.
  Pop 1 (h = 1). Stack empty -> width = 6. Area = 1 * 6 = 6.

Max Area Found = 10 (bars [5, 6] bounded by height 5 with width 2).
```

#### Production C# Implementation:

```csharp
public class SolutionLargestRectangle {
    /// <summary>
    /// Computes the largest rectangle area in a histogram in O(N) time and O(N) space
    /// using a monotonic increasing stack with a virtual zero sentinel.
    /// </summary>
    public int LargestRectangleArea(int[] heights) {
        if (heights == null || heights.Length == 0) return 0;

        int n = heights.Length;
        var stack = new Stack<int>(); // Monotonic increasing stack of INDICES
        int maxArea = 0;

        // Iterate up to n inclusive (index n acts as virtual height = 0 sentinel)
        for (int i = 0; i <= n; i++) {
            int currentHeight = (i == n) ? 0 : heights[i];

            // When current bar is shorter than the stack top, pop and calculate area
            while (stack.Count > 0 && currentHeight < heights[stack.Peek()]) {
                int mid = stack.Pop();
                int h = heights[mid];

                // Right boundary is i; Left boundary is stack.Peek() (or -1 if empty)
                int width = (stack.Count == 0) ? i : i - stack.Peek() - 1;

                int area = h * width;
                if (area > maxArea) {
                    maxArea = area;
                }
            }

            stack.Push(i);
        }

        return maxArea;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — Every bar index is pushed exactly once and popped exactly once.
- **Space Complexity:** $O(N)$ — The stack holds at most $N + 1$ indices.

---

### 2.2 [LeetCode 85] Maximal Rectangle (2D Reduction)

Given a `rows x cols` binary `matrix` filled with `0`'s and `1`'s, find the largest rectangle containing only `1`'s and return its area.

#### Production C# Implementation:

```csharp
public class SolutionMaximalRectangle {
    /// <summary>
    /// Finds maximal rectangle in 2D binary matrix in O(R * C) time and O(C) space
    /// by reducing each row to a 1D histogram.
    /// </summary>
    public int MaximalRectangle(char[][] matrix) {
        if (matrix == null || matrix.Length == 0 || matrix[0].Length == 0) {
            return 0;
        }

        int rows = matrix.Length;
        int cols = matrix[0].Length;
        int[] heights = new int[cols];
        int maxArea = 0;

        for (int r = 0; r < rows; r++) {
            // Update running histogram heights for current row
            for (int c = 0; c < cols; c++) {
                if (matrix[r][c] == '1') {
                    heights[c] += 1;
                } else {
                    heights[c] = 0; // Continuity broken
                }
            }

            // Calculate largest rectangle for current histogram baseline
            int rowMaxArea = CalculateHistogramMaxArea(heights);
            if (rowMaxArea > maxArea) {
                maxArea = rowMaxArea;
            }
        }

        return maxArea;
    }

    private int CalculateHistogramMaxArea(int[] heights) {
        int n = heights.Length;
        var stack = new Stack<int>();
        int maxArea = 0;

        for (int i = 0; i <= n; i++) {
            int currentHeight = (i == n) ? 0 : heights[i];

            while (stack.Count > 0 && currentHeight < heights[stack.Peek()]) {
                int mid = stack.Pop();
                int h = heights[mid];
                int width = (stack.Count == 0) ? i : i - stack.Peek() - 1;
                maxArea = Math.Max(maxArea, h * width);
            }

            stack.Push(i);
        }

        return maxArea;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(R \times C)$ — We process $R$ rows; each row solves a histogram of size $C$ in $O(C)$ time.
- **Space Complexity:** $O(C)$ — Auxiliary `heights` array and stack of size $C + 1$.

---

### 2.3 Contrast: LeetCode 84 (Histogram) vs. LeetCode 42 (Trapping Rain Water)

Candidates often confuse these two classic problems because both involve bars:

| Dimension | [LeetCode 84] Largest Rectangle in Histogram | [LeetCode 42] Trapping Rain Water |
| :--- | :--- | :--- |
| **Bounding Principle** | Bounded by the **shortest** bar inside the span. | Bounded by the **two flanking peaks** on the left and right. |
| **Formula** | $\text{Area} = \min(heights) \times \text{width}$ | $\text{Water} = \min(\text{LeftMax}, \text{RightMax}) - \text{floor}$ |
| **Stack Invariant** | **Monotonic Increasing Stack** (pops on smaller element). | **Monotonic Decreasing Stack** (pops on larger element). |
| **Alternative Method**| Monotonic Stack is optimal ($O(N)$). | Two Pointers opposite-ends squeeze ($O(N)$ time, $O(1)$ space). |

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master boundary-based area optimizations on LeetCode:

### Problem 1 (The Cornerstone): LeetCode 84 — Largest Rectangle in Histogram (Hard)
- **Goal:** Implement the monotonic increasing stack with the virtual 0-height sentinel.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.

### Problem 2 (2D Projection): LeetCode 85 — Maximal Rectangle (Hard)
- **Goal:** Project a 2D binary grid into running 1D histograms and find the maximum area.
- **Target Complexity:** $O(R \times C)$ time, $O(C)$ space.

### Problem 3 (Subarray Score Optimization): LeetCode 1793 — Maximum Score of a Good Subarray (Hard)
- **Goal:** Find the maximum score of a subarray that contains index $k$, where score is $\min(nums[i \dots j]) \times (j - i + 1)$.
- **Target Complexity:** $O(N)$ time, $O(N)$ space (via Monotonic Stack) or $O(N)$ time, $O(1)$ space (via Two Pointers from $k$).

### Bonus Challenge: LeetCode 221 — Maximal Square (Medium)
- **Goal:** Find the largest square containing only 1s in a binary matrix.
- **Comparison:** Solve via 2D DP (`dp[i,j] = min(top, left, diag) + 1`) and contrast with histogram approach.

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Geometric Area & Boundary Decision Tree              │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Largest rectangle bounded by internal minimum bar?
                   │   └─► Monotonic Increasing Stack (Width = i - Peek - 1) [LC 84]
                   │
                   ├─► Largest rectangle of 1s in 2D binary grid?
                   │   └─► Reduce each row to 1D Histogram + LC 84 [LC 85]
                   │
                   ├─► Trapped volume between external boundary peaks?
                   │   └─► Two Pointers / Monotonic Decreasing Stack [LC 42]
                   │
                   └─► Summing minimums across ALL possible subarrays?
                       └─► Range Contribution Model (Day 53) [LC 907, LC 2104]
```

### Preview for Day 53: Monotonic Stack Range Contribution & Subarray Aggregations
Tomorrow in **Day 53**, we extend monotonic boundary identification from geometric areas to **statistical subarray aggregations**:
- **The Contribution Model:** Instead of enumerating $O(N^2)$ subarrays, compute how many subarrays an element $A[i]$ serves as the absolute minimum.
- **The Formula:** $\mathbf{\text{Count} = (i - PLE) \times (NLE - i)}$.
- **The Duplicate Counting Trap:** How to use strict inequality on the left ($<$) and non-strict on the right ($\le$) to avoid double-counting identical numbers.
- **[LeetCode 907] Sum of Subarray Minimums (Medium) & [LeetCode 2104] Sum of Subarray Ranges (Medium).**

---

## 5. 🎯 Day 52 Checkpoint Questions

Verify your mastery of boundary and area formulations:

1. **Width Derivation:** In LeetCode 84, when `mid = stack.Pop()` is executed, explain why the left boundary of `mid` is `stack.Peek()` and NOT `mid - 1`. What happened to the elements between `stack.Peek()` and `mid`?
2. **Sentinel Mechanics:** Why does running the loop to $i = n$ with a virtual height of 0 guarantee that the stack is completely empty at termination?
3. **Empty Stack Width Invariant:** If `stack.Count == 0` after popping `mid`, why is the width simply equal to `i`?
4. **2D Continuity Reset:** In LeetCode 85, why is `heights[c] = 0` mandatory when `matrix[r][c] == '0'`, rather than simply keeping `heights[c]` unchanged?
