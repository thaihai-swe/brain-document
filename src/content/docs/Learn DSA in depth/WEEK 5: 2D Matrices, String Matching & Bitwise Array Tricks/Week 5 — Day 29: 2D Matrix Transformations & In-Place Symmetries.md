---
title: "Week 5 — Day 29: 2D Matrix Transformations & In-Place Symmetries"
---

# 🚀 Week 5 — Day 29: 2D Matrix Transformations & In-Place Symmetries

Welcome to **Week 5**! Over Weeks 1–4, you mastered 1D linear array techniques, continuous windowing, prefix sums, binary search in all its variants, multi-pointer combinations, and interval sweep-lines.

This week, we elevate our spatial reasoning to **2D Matrices, String Matching Automata, and Bitwise Array Invariants**.

Today, we dive into **2D Matrix Transformations & In-Place Symmetries**.  
Matrix manipulation is a favorite among Big Tech interviewers because it tests whether you can handle multidimensional coordinate indexing without allocating expensive auxiliary memory ($O(1)$ space), understand CPU cache line locality in row-major memory, and maintain strict boundary invariants in complex traversals like **Spiral Order**.

---

## 1. 🧠 TEACH: 2D Memory Layouts, Symmetries & In-Place Algebra

### 1.1 Physical Memory Reality of 2D Grids

Physical RAM is strictly **one-dimensional**. A 2D matrix does not exist in hardware as a grid; it is mapped to a contiguous strip of linear memory addresses:

```
Logical 2D Grid (3 x 3):
[ (0,0)  (0,1)  (0,2) ]
[ (1,0)  (1,1)  (1,2) ]
[ (2,0)  (2,1)  (2,2) ]

Physical 1D RAM Layout (Row-Major Order):
[ (0,0), (0,1), (0,2),  (1,0), (1,1), (1,2),  (2,0), (2,1), (2,2) ]
├─── Row 0 ──────────┤ ├─── Row 1 ──────────┤ ├─── Row 2 ──────────┤
```

#### The Hardware Indexing Formula:
For a matrix with $R$ rows and $C$ columns, the physical memory offset of element `(r, c)` is:
$$\mathbf{\text{Offset}(r, c) = r \times C + c}$$
Conversely, any 1D linear index $k \in [0 \dots R \times C - 1]$ maps back to 2D coordinates via:
$$\mathbf{r = k / C, \quad c = k \% C}$$

#### Why Cache Line Locality Dictates Loop Order:
CPU cache lines load 64 contiguous bytes at a time:
- **Row-by-Row Scan (`matrix[r][c]` with inner loop `c`):** Moves sequentially along contiguous memory. The first element loads 16 consecutive integers into L1 cache $\implies$ **15 cache hits out of 16!**
- **Column-by-Column Scan (`matrix[r][c]` with inner loop `r`):** Strides by $C \times 4$ bytes on every step. Jumps across memory lines $\implies$ **Cache miss on almost every access!** Up to **10× slower** on large matrices!

---

### 1.2 C# Runtime Internals: `int[,]` vs `int[][]` (The Performance Paradox)

In .NET / C#, there are two distinct ways to represent a 2D matrix:

1. **Multidimensional Array (`int[,]`):**
   - Allocated as a single contiguous block of memory on the managed heap.
   - Has a single object header.
   - *The Trap:* Every access `matrix[r, c]` incurs a hidden method call (`Get`/`Set`) and multidimensional bounds checks that the .NET JIT compiler struggles to vectorize or optimize away.

2. **Jagged Array (`int[][]` — Array of Arrays):**
   - An outer array where each element is a reference pointing to an independent 1D row array.
   - *The Advantage:* The .NET JIT compiler easily performs **Bounds Check Elimination (BCE)** on 1D arrays and vectorizes loops with SIMD.
   - In practice, **`int[][]` is typically 20% to 50% faster than `int[,]`** in .NET benchmarks, and is the standard format on LeetCode and in Big Tech interviews.

---

### 1.3 The Linear Algebra Decomposition Trick (90° Rotation in $O(1)$ Space)

Suppose an interviewer asks you to rotate an $N \times N$ matrix by **90 degrees clockwise in-place** without allocating any new matrix ($O(1)$ auxiliary space).

Attempting to track 4-way coordinate rotation cycles `(r, c) -> (c, n-1-r) -> ...` directly is error-prone and easy to mess up under pressure.

#### The Elegant Mathematical Decomposition:
A 90° clockwise rotation can be factored into two elementary geometric operations:
$$\mathbf{\text{Rotate } 90^\circ \text{ Clockwise} = \text{Transpose} + \text{Reflect Horizontally (Reverse Rows)}}$$

```
Original Matrix:          Step 1: Transpose (Flip Main Diag)   Step 2: Reverse Each Row
[ 1,  2,  3 ]             [ 1,  4,  7 ]                       [ 7,  4,  1 ]
[ 4,  5,  6 ]    ───►     [ 2,  5,  8 ]              ───►     [ 8,  5,  2 ]
[ 7,  8,  9 ]             [ 3,  6,  9 ]                       [ 9,  6,  3 ]
```

#### How to Transpose In-Place:
Swap elements across the main diagonal ($i == j$ stays unchanged):
$$\text{Swap } \text{matrix}[i][j] \longleftrightarrow \text{matrix}[j][i] \quad \text{for all } j > i$$

#### How to Reflect Horizontally:
For each row $i$, reverse the row using standard two pointers (`left = 0, right = N - 1`).

#### What about 90° Counter-Clockwise?
$$\mathbf{\text{Rotate } 90^\circ \text{ Counter-Clockwise} = \text{Transpose} + \text{Reflect Vertically (Reverse Columns)}}$$
*(Or reverse each row first, then transpose).*

---

### 1.4 The 4-Boundary Invariant Model for Spiral Traversal

Spiral Matrix requires peeling layers of a grid inward like an onion:

```
   top ──────►  [  1   2   3   4  ]  ───┐
                [ 10  11  12   5  ]     │
bottom ──────►  [  9   8   7   6  ]  ◄──┘
                   ▲           ▲
                  left       right
```

#### The 4-Phase Invariant Cycle:
Maintain 4 boundary pointers:
- `top = 0, bottom = R - 1`
- `left = 0, right = C - 1`

While `top <= bottom` and `left <= right`:
1. **Left $\to$ Right along `top`:** Read `matrix[top][col]` for `col` from `left` to `right`. Then contract boundary: `top++`.
2. **Top $\to$ Bottom along `right`:** Read `matrix[row][right]` for `row` from `top` to `bottom`. Then contract boundary: `right--`.
3. **Right $\to$ Left along `bottom`:**  
   ⚠️ **CRITICAL GUARD:** Check `if (top <= bottom)` before executing! Read `matrix[bottom][col]` for `col` from `right` down to `left`. Then contract: `bottom--`.
4. **Bottom $\to$ Top along `left`:**  
   ⚠️ **CRITICAL GUARD:** Check `if (left <= right)` before executing! Read `matrix[row][left]` for `row` from `bottom` down to `top`. Then contract: `left++`.

#### Why the Guards in Steps 3 and 4 are Mandatory:
For non-square matrices (e.g., $1 \times 4$ or $3 \times 1$):
- In a $1 \times 4$ matrix, Step 1 reads the only row and increments `top` from $0 \to 1$.
- Now `top > bottom`. If you do not guard Step 3 with `if (top <= bottom)`, it will traverse the row **a second time in reverse**, producing duplicate outputs!

---

### 1.5 Interview Spoken Drill (20–30 Seconds)

> *"To rotate an $N \times N$ matrix 90 degrees clockwise in-place, I decompose the rotation into two linear algebra operations: transpose followed by a horizontal row reversal. First, I swap `matrix[i][j]` with `matrix[j][i]` for all $j > i$ to flip over the main diagonal. Then, I reverse each individual row using two pointers. This achieves the exact 90-degree rotation in $O(N^2)$ time with strictly $O(1)$ auxiliary space."*

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 48 — Rotate Image (Medium)

> You are given an `n x n` 2D `matrix` representing an image, rotate the image by **90 degrees (clockwise)**.
> You have to rotate the image **in-place**, which means you have to modify the input 2D matrix directly. **DO NOT** allocate another 2D matrix and do the rotation.

#### Visual Step-by-Step Trace:
`matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]`

**Step 1: In-Place Transpose (Main Diagonal Reflection)**
```
Only swap where j > i:
i = 0, j = 1: Swap matrix[0][1] (2) and matrix[1][0] (4)
i = 0, j = 2: Swap matrix[0][2] (3) and matrix[2][0] (7)
i = 1, j = 2: Swap matrix[1][2] (6) and matrix[2][1] (8)

Matrix after Transpose:
[ 1,  4,  7 ]
[ 2,  5,  8 ]
[ 3,  6,  9 ]
```

**Step 2: Reverse Each Row Horizontally**
```
Row 0: Reverse [1, 4, 7] -> [7, 4, 1]
Row 1: Reverse [2, 5, 8] -> [8, 5, 2]
Row 2: Reverse [3, 6, 9] -> [9, 6, 3]

Final Matrix:
[ 7,  4,  1 ]
[ 8,  5,  2 ]
[ 9,  6,  3 ]  (Correct!)
```

#### Production C# Implementation:
```csharp
public class SolutionRotateImage {
    public void Rotate(int[][] matrix) {
        int n = matrix.Length;

        // Step 1: Transpose matrix in-place (swap over main diagonal)
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                int temp = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = temp;
            }
        }

        // Step 2: Reverse each row using opposite-ends two pointers
        for (int i = 0; i < n; i++) {
            int left = 0;
            int right = n - 1;
            while (left < right) {
                int temp = matrix[i][left];
                matrix[i][left] = matrix[i][right];
                matrix[i][right] = temp;
                left++;
                right--;
            }
        }
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N^2)$ — Transpose visits $\frac{N(N-1)}{2}$ pairs; reversing rows touches all $N^2$ elements. Total operations $\approx 1.5 N^2 = O(N^2)$.
- **Space Complexity:** **$O(1)$ auxiliary space** — strictly in-place coordinate swaps.

---

### Problem 2: LeetCode 54 — Spiral Matrix (Medium)

> Given an `m x n` `matrix`, return all elements of the `matrix` in **spiral order**.

#### Visual Step-by-Step Trace on Non-Square Matrix:
`matrix = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]` ($3 \times 4$)  
Initialize: `top = 0, bottom = 2, left = 0, right = 3`

```
Cycle 1:
 1. Left -> Right on top (0): [1, 2, 3, 4]  --> top becomes 1
 2. Top -> Bottom on right (3): [8, 12]     --> right becomes 2
 3. Right -> Left on bottom (2):
    Check: top (1) <= bottom (2)? YES.
    Read: [11, 10, 9]                       --> bottom becomes 1
 4. Bottom -> Top on left (0):
    Check: left (0) <= right (2)? YES.
    Read: [5]                               --> left becomes 1

Cycle 2:
 Bounds are now: top = 1, bottom = 1, left = 1, right = 2
 1. Left -> Right on top (1): [6, 7]        --> top becomes 2
 2. Top -> Bottom on right (2):
    row from top (2) to bottom (1) -> loop does not execute -> right becomes 1
 3. Right -> Left on bottom (1):
    Check: top (2) <= bottom (1)? FALSE!
    Guard triggers! Prevents duplicate re-reading of [6, 7].
 4. Bottom -> Top on left (1):
    Check: left (1) <= right (1)? But loop condition top (2) <= bottom (1) terminates!

Result: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]  (12 elements, complete!)
```

#### Production C# Implementation:
```csharp
public class SolutionSpiralMatrix {
    public IList<int> SpiralOrder(int[][] matrix) {
        var result = new List<int>();
        if (matrix == null || matrix.Length == 0) return result;

        int top = 0;
        int bottom = matrix.Length - 1;
        int left = 0;
        int right = matrix[0].Length - 1;

        while (top <= bottom && left <= right) {
            // 1. Traverse Right across the top boundary
            for (int col = left; col <= right; col++) {
                result.Add(matrix[top][col]);
            }
            top++;

            // 2. Traverse Down along the right boundary
            for (int row = top; row <= bottom; row++) {
                result.Add(matrix[row][right]);
            }
            right--;

            // 3. Traverse Left across the bottom boundary (Guard against single-row duplicates)
            if (top <= bottom) {
                for (int col = right; col >= left; col--) {
                    result.Add(matrix[bottom][col]);
                }
                bottom--;
            }

            // 4. Traverse Up along the left boundary (Guard against single-col duplicates)
            if (left <= right) {
                for (int row = bottom; row >= top; row--) {
                    result.Add(matrix[row][left]);
                }
                left++;
            }
        }

        return result;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(M \times N)$ — each element is visited and added to `result` exactly once.
- **Space Complexity:** $O(1)$ auxiliary space (excluding the output list of size $M \times N$).

---

### Problem 3: LeetCode 59 — Spiral Matrix II (Medium)

> Given a positive integer `n`, generate an `n x n` `matrix` filled with elements from `1` to `n^2` in spiral order.

#### The Inverse Formulation:
Instead of reading from a matrix into a list, we maintain a running counter `num = 1 \dots n^2` and write into `matrix[row][col]` following the exact same 4-boundary contraction model!

#### Production C# Implementation:
```csharp
public class SolutionSpiralMatrixII {
    public int[][] GenerateMatrix(int n) {
        int[][] matrix = new int[n][];
        for (int i = 0; i < n; i++) {
            matrix[i] = new int[n];
        }

        int top = 0, bottom = n - 1;
        int left = 0, right = n - 1;
        int val = 1;

        while (top <= bottom && left <= right) {
            // Left to Right
            for (int col = left; col <= right; col++) {
                matrix[top][col] = val++;
            }
            top++;

            // Top to Bottom
            for (int row = top; row <= bottom; row++) {
                matrix[row][right] = val++;
            }
            right--;

            // Right to Left
            if (top <= bottom) {
                for (int col = right; col >= left; col--) {
                    matrix[bottom][col] = val++;
                }
                bottom--;
            }

            // Bottom to Top
            if (left <= right) {
                for (int row = bottom; row >= top; row--) {
                    matrix[row][left] = val++;
                }
                left++;
            }
        }

        return matrix;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N^2)$ — fills all $N^2$ cells once.
- **Space Complexity:** $O(1)$ auxiliary space (excluding the required $N \times N$ output matrix).

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Apply 2D matrix transformations on LeetCode:

### Problem 1 (In-Place Symmetries): LeetCode 48 — Rotate Image (Medium)
- **Goal:** Rotate $N \times N$ matrix 90° clockwise in $O(1)$ auxiliary space.
- **Target Complexity:** $O(N^2)$ time, $O(1)$ space.

### Problem 2 (Boundary Contraction): LeetCode 54 — Spiral Matrix (Medium)
- **Goal:** Read arbitrary $M \times N$ matrix in spiral order with boundary guard conditions.
- **Target Complexity:** $O(M \times N)$ time, $O(1)$ space.

### Problem 3 (Matrix Construction): LeetCode 59 — Spiral Matrix II (Medium)
- **Goal:** Fill an $N \times N$ matrix with $1 \dots N^2$ in spiral order.
- **Target Complexity:** $O(N^2)$ time, $O(1)$ space.

### Bonus / Extension Challenge: LeetCode 73 — Set Matrix Zeroes (Medium)
- **Goal:** If `matrix[r][c] == 0`, set its entire row and column to 0 **in-place with $O(1)$ extra space**.
- **Hint:** Use the first row (`matrix[0]`) and first column (`matrix[][0]`) as in-place storage flags! Use two boolean variables `firstRowZero` and `firstColZero` to track whether row 0 and col 0 themselves had zeroes.

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                        2D Matrix Problem Taxonomy                      │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Rotate 90° Clockwise in-place ───────────► Transpose + Reverse Rows [LC 48]
                   │
                   ├─► Rotate 90° Counter-Clockwise in-place ───► Transpose + Reverse Columns
                   │
                   ├─► Layer-by-layer peeling / construction ──► 4-Boundary Pointers (Top, Bottom, Left, Right)
                   │                                             [LC 54, LC 59]
                   │
                   ├─► In-place state marking with O(1) space ──► Use Row 0 & Col 0 as flag bitsets [LC 73]
                   │
                   └─► Search in row/column sorted matrix ──────► Saddleback Search / 1D Binary Search (Day 30)
                                                                 [LC 74, LC 240]
```

### Preview for Day 30: 2D Matrix Search Patterns
Today we operated on matrix transformations and geometric rotations.  
Tomorrow in **Day 30**, we tackle **Searching in 2D Matrices**:
- When rows and columns are strictly sorted sequentially $\implies$ **Virtual 1D Binary Search** in $O(\log(M \times N))$.
- When only individual rows and columns are sorted independently $\implies$ **Saddleback Search** starting from the top-right corner in $O(M + N)$.

---

## 5. 🎯 Day 29 Checkpoint Questions

Verify your mastery of 2D memory layouts and geometric invariants:

1. **JIT Bounds Check Elimination:** Why is `int[][]` typically faster than `int[,]` in modern .NET runtimes, despite the extra pointer dereference per row?
2. **Transpose Range Invariant:** In `Rotate Image`, why does the transpose inner loop iterate `for (int j = i + 1; j < n; j++)` starting at `i + 1` instead of `0`? What catastrophic bug happens if it starts at `0`?
3. **The Non-Square Spiral Trap:** Trace what happens in LeetCode 54 (Spiral Matrix) on a $1 \times 4$ matrix `[[1, 2, 3, 4]]` if you remove the guard condition `if (top <= bottom)` before Step 3.
4. **Counter-Clockwise Formula:** Express a 90° counter-clockwise rotation as a combination of Transpose and row/column reflection. What are the two valid combinations?
