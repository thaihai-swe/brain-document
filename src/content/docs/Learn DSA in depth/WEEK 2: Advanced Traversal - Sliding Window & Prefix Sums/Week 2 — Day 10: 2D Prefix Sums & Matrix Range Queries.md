---
title: "Week 2 — Day 10: 2D Prefix Sums & Matrix Range Queries"
---

Welcome to Day 10! Today we expand prefix sums into **two dimensions**.

In [Day 8](./Week%202%20%E2%80%94%20Day%208:%20Prefix%20Sum%20Fundamentals%20%281D%29.md), we precomputed a 1D prefix strip to answer range queries in $O(1)$ time. In 2D space (grids and matrices), calculating the sum of an arbitrary rectangular subgrid from $(r_1, c_1)$ to $(r_2, c_2)$ appears to require looping over rows and columns ($O(M \times N)$).

With the **Principle of Inclusion-Exclusion**, we can answer any 2D submatrix sum query in **strictly $O(1)$ constant time**.

---

## 1. 🧠 TEACH: The Principle of Inclusion-Exclusion on Grids

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* A **2D Prefix Sum Matrix** stores cumulative 2D rectangular sums from $(0, 0)$ to $(r-1, c-1)$ using the 2D inclusion-exclusion principle.
  - *Core Invariants:* Inclusion-Exclusion Build Invariant: $P[r+1, c+1] = \text{mat}[r, c] + P[r, c+1] + P[r+1, c] - P[r, c]$; Query Invariant: $\text{Sum}(r1, c1, r2, c2) = P[r2+1, c2+1] - P[r1, c2+1] - P[r2+1, c1] + P[r1, c1]$.
  - *Misconception Check:* Building a 2D prefix matrix does *not* require nested quad loops; it is constructed in a single $O(M \times N)$ pass using the exact same inclusion-exclusion subtraction.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(R \times C)$ cell-by-cell iteration required for rectangular submatrix queries.
  - *Complexity Advantage:* Reduces submatrix query time from $O(M \times N)$ to strict $O(1)$ constant time.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Range sum query 2D - immutable", "maximum sum submatrix", "box blur image filter". Signal words: "submatrix sum", "2D rectangle query", "matrix area sum".
  - *When to Avoid / Failure Modes:* Frequently updated 2D matrices (updating a cell takes $O(M \times N)$; use 2D Fenwick Tree for $O(\log M \log N)$ updates).
- **4. WHERE:**
  - *Physical CLR Memory:* 2D contiguous `int[,]` array on managed heap; iterating rows sequentially (`r` outer, `c` inner) matches row-major memory layout, preventing CPU cache thrashing.
  - *Production Systems:* Computer graphics integral images for Viola-Jones face detection, GIS elevation map queries, spatial database query bounding boxes.
- **5. WHO:**
  - *Spoken Script:* "2D prefix sums use the inclusion-exclusion principle to answer arbitrary rectangle queries in $O(1)$ time. I build an $(M+1) \times (N+1)$ prefix table where each entry adds the top and left prefixes and subtracts the doubly-counted diagonal overlap. Querying subtracts the top and left strips and restores the overlap."
  - *Interviewer Evaluation Lens:* Checks correct 2D inclusion-exclusion formula derivation, 1-based indexing offset $(r+1, c+1)$, and row-major loop ordering.
- **6. HOW:**
  - *Cost Model:* Build: $O(M \times N)$ time and space; Query: $O(1)$ time and space.
  - *State Transition Trace:* `Query(r1=1, c1=1, r2=2, c2=2) = P[3, 3] - P[1, 3] - P[3, 1] + P[1, 1]`.


### 1.1 The Geometric Mental Model

Suppose we have an $M \times N$ matrix. We define our 2D prefix table $P[r][c]$ as:
> **$P[r][c] = \text{Sum of all elements in the subgrid from top-left } (0, 0) \text{ to } (r-1, c-1)$.**

To make this completely boundary-safe, we allocate a table of size **$(M + 1) \times (N + 1)$** with row 0 and column 0 padded with zeroes.

---

### 1.2 Building the 2D Prefix Table: $O(M \times N)$

To calculate the prefix sum for cell $(r, c)$ in the padded table:

```
        0        c-1       c
    0 ┌──────────┬────────┐
      │          │        │
      │    D     │   B    │
      │          │        │
  r-1 ├──────────┼────────┤
      │    A     │  val   │  <-- val = matrix[r-1][c-1]
    r └──────────┴────────┘
```

1. Add the current element: `matrix[r-1][c-1]`.
2. Add the rectangle above it: `P[r-1][c]` (contains regions $D + B$).
3. Add the rectangle to its left: `P[r][c-1]` (contains regions $D + A$).
4. **Notice the double count:** Region $D$ (the top-left diagonal subgrid $P[r-1][c-1]$) was included in **both** $P[r-1][c]$ and $P[r][c-1]$!
5. Therefore, we must subtract $D$ once.

$$\mathbf{P[r][c] = \text{matrix}[r-1][c-1] + P[r-1][c] + P[r][c-1] - P[r-1][c-1]}$$

---

### 1.3 Querying an Arbitrary Submatrix $(r_1, c_1)$ to $(r_2, c_2)$ in $O(1)$

Now suppose we want the sum of the shaded rectangular region bounded by top-left $(r_1, c_1)$ and bottom-right $(r_2, c_2)$ (using 0-based indices):

```
          0             c1            c2+1
      0 ┌───────────────┬───────────────┐
        │               │               │
        │       D       │       B       │
        │               │               │
     r1 ├───────────────┼───────────────┤
        │               │               │
        │       A       │    TARGET     │
        │               │    REGION     │
   r2+1 └───────────────┴───────────────┘
```

1. Start with the full bounding box from $(0, 0)$ to $(r_2, c_2)$:
   $$\text{Total} = P[r_2 + 1][c_2 + 1] \quad (\text{Contains } D + B + A + \text{TARGET})$$
2. Subtract the area above the target (Region $D + B$):
   $$- P[r_1][c_2 + 1]$$
3. Subtract the area to the left of the target (Region $D + A$):
   $$- P[r_2 + 1][c_1]$$
4. **Notice the double subtraction:** Region $D$ was subtracted **twice**!
5. Add back Region $D$ ($P[r_1][c_1]$) once to restore balance.

$$\mathbf{\text{Sum}(r_1, c_1 \dots r_2, c_2) = P[r_2 + 1][c_2 + 1] - P[r_1][c_2 + 1] - P[r_2 + 1][c_1] + P[r_1][c_1]}$$

> [!TIP]
> **Memory Trick:**
> - Construction: 2 additions, 1 subtraction ($+ \text{top} + \text{left} - \text{diagonal}$).
> - Query: 1 base, 2 subtractions, 1 addition ($+ \text{bottomRight} - \text{topRight} - \text{bottomLeft} + \text{topLeft}$).

---

### 1.4 Cache Locality & Row-Major Order

In modern CPU architecture, matrices are laid out in contiguous memory **row by row** (row-major order):

```
Matrix:
[ [ 1, 2, 3 ],
  [ 4, 5, 6 ] ]

RAM Layout:
[ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ]
◄── Row 0 ────►◄── Row 1 ────►
```

- When traversing a matrix, **always iterate rows in the outer loop and columns in the inner loop**:
  ```csharp
  for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
          // Sequential memory access: 100% cache line hit rate!
      }
  }
  ```
- If you invert the loops (`c` outer, `r` inner), the CPU must jump $N \times 4$ bytes on every iteration, causing frequent **cache misses** and up to a $5\times$ performance drop.

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 304 — Range Sum Query 2D - Immutable (Medium)

> Given a 2D matrix `matrix`, handle multiple queries of the following type:
> - Calculate the sum of the elements of `matrix` inside the rectangle defined by its **upper left corner** `(row1, col1)` and **lower right corner** `(row2, col2)`.
>
> Implement the `NumMatrix` class:
> - `NumMatrix(int[][] matrix)` Initializes the object with the integer matrix.
> - `int SumRegion(int row1, int col1, int row2, int col2)` Returns the sum in $O(1)$.

#### Visual Construction Example:
`matrix` ($3 \times 3$):
```
[ [ 3, 0, 1 ],
  [ 5, 6, 3 ],
  [ 1, 2, 0 ] ]
```

Padded `_prefix` table ($4 \times 4$):
```
r\c   0   1   2   3
0   [ 0,  0,  0,  0 ]
1   [ 0,  3,  3,  4 ]
2   [ 0,  8, 14, 18 ]
3   [ 0,  9, 17, 21 ]

Trace P[2][2] (bottom-right corresponds to matrix[1][1] = 6):
P[2][2] = matrix[1][1] + P[1][2] + P[2][1] - P[1][1]
        = 6 + 3 + 8 - 3 = 14.
Check subgrid sum: 3 + 0 + 5 + 6 = 14. Perfect!

Query: SumRegion(1, 1, 2, 2)  (Values: 6, 3, 2, 0 -> Sum = 11)
Formula: P[3][3] - P[1][3] - P[3][1] + P[1][1]
       = 21 - 4 - 9 + 3 = 11. Instant O(1)!
```

#### Production C# Implementation:
```csharp
public class NumMatrix {
    private readonly int[,] _prefix;

    public NumMatrix(int[][] matrix) {
        int m = matrix.Length;
        int n = matrix[0].Length;

        // (m + 1) x (n + 1) table to eliminate edge-case checks
        _prefix = new int[m + 1, n + 1];

        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                _prefix[r + 1, c + 1] = matrix[r][c]
                                      + _prefix[r, c + 1]
                                      + _prefix[r + 1, c]
                                      - _prefix[r, c];
            }
        }
    }

    public int SumRegion(int row1, int col1, int row2, int col2) {
        return _prefix[row2 + 1, col2 + 1]
             - _prefix[row1, col2 + 1]
             - _prefix[row2 + 1, col1]
             + _prefix[row1, col1];
    }
}
```

#### Complexity:
- **Constructor Time:** $O(M \times N)$ — single row-major pass.
- **Constructor Space:** $O(M \times N)$ — internal 2D prefix array.
- **`SumRegion` Time:** $O(1)$ — four table lookups and three arithmetic operations.
- **`SumRegion` Space:** $O(1)$ auxiliary.

---

### Problem 2: LeetCode 1277 — Count Square Submatrices with All Ones (Medium)

> Given an `m * n` matrix of ones and zeros, return *how many square submatrices have all ones*.

#### The Two Perspectives:

##### Approach A: 2D Prefix Sums ($O(M \times N \times \min(M, N))$)
- Precompute 2D prefix sum table in $O(M \times N)$.
- For every cell $(r, c)$ and every possible square length $L$:
  - Use `SumRegion` to check if sum equals $L^2$ in $O(1)$.
  - Time: $O(M \times N \times \min(M, N))$. While it passes small constraints, it is suboptimal.

##### Approach B: Optimal DP Invariant ($O(M \times N)$ time, $O(1)$ auxiliary space)
Let $dp[r][c]$ be the **maximum side length of an all-ones square whose bottom-right corner is at $(r, c)$**.

**The Geometric Invariant:**
A square of size $k$ ending at $(r, c)$ can only form if:
1. The cell $(r, c)$ is $1$.
2. The square ending at the top $(r-1, c)$ has size at least $k - 1$.
3. The square ending at the left $(r, c-1)$ has size at least $k - 1$.
4. The square ending at the diagonal $(r-1, c-1)$ has size at least $k - 1$.

```
              (r-1, c-1)  │ (r-1, c)
             ─────────────┼──────────
              (r, c-1)    │ (r, c)
```

$$\mathbf{dp[r][c] = 1 + \min(dp[r-1][c], dp[r][c-1], dp[r-1][c-1]) \quad (\text{if } \text{matrix}[r][c] == 1)}$$

**Why does this count ALL square submatrices?**
If the largest square ending at $(r, c)$ has side length $3$, it automatically contains:
- 1 square of size 1
- 1 square of size 2
- 1 square of size 3

Therefore:
$$\text{Total Squares} = \sum_{r} \sum_{c} dp[r][c]$$

#### Visual Trace:
`matrix`:
```
[ [ 0, 1, 1, 1 ],
  [ 1, 1, 1, 1 ],
  [ 0, 1, 1, 1 ] ]
```

`dp` matrix:
```
[ [ 0, 1, 1, 1 ],
  [ 1, 1, 2, 2 ],
  [ 0, 1, 2, 3 ] ]
```
Sum of all cells in `dp` = $0 + 1 + 1 + 1 + 1 + 1 + 2 + 2 + 0 + 1 + 2 + 3 = \mathbf{15}$.

#### Production C# Implementation:
```csharp
public class SolutionCountSquares {
    public int CountSquares(int[][] matrix) {
        int m = matrix.Length;
        int n = matrix[0].Length;
        int totalSquares = 0;

        // dp[r, c] represents the side length of the largest all-ones square
        // with its bottom-right corner at (r, c).
        int[,] dp = new int[m, n];

        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                if (matrix[r][c] == 1) {
                    if (r == 0 || c == 0) {
                        dp[r, c] = 1;
                    } else {
                        dp[r, c] = 1 + Math.Min(dp[r - 1, c - 1],
                                       Math.Min(dp[r - 1, c], dp[r, c - 1]));
                    }
                    totalSquares += dp[r, c];
                }
            }
        }

        return totalSquares;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(M \times N)$ — single row-major traversal.
- **Space Complexity:** $O(M \times N)$ (can be optimized to $O(1)$ by mutating `matrix` in place or $O(N)$ with a single row buffer).

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Solve these targeted problems to master matrix ranges:

### Problem 1 (The Core Standard): LeetCode 304 — Range Sum Query 2D - Immutable (Medium)
- **Goal:** Implement $(M+1) \times (N+1)$ padded 2D prefix sum table for $O(1)$ queries.
- **Formula to memorize:** `P[r2+1, c2+1] - P[r1, c2+1] - P[r2+1, c1] + P[r1, c1]`.

### Problem 2 (Square Counting): LeetCode 1277 — Count Square Submatrices with All Ones (Medium)
- **Goal:** Count all squares of 1s in $O(M \times N)$.
- **Key Insight:** `dp[r, c]` represents both the maximum side length and the number of squares ending at $(r, c)$.

### Problem 3 (Maximum Area): LeetCode 221 — Maximal Square (Medium)
- **Goal:** Find the area of the largest square containing only 1s.
- **Hint:** Uses the identical DP invariant as LC 1277! Return $(\max dp[r, c])^2$.

### Problem 4 (Clamped Boundary Query): LeetCode 1314 — Matrix Block Sum (Medium)
- **Goal:** For each cell $(i, j)$, calculate sum of elements within distance $K$: $\max(0, i-K) \dots \min(M-1, i+K)$.
- **Hint:** Compute 2D prefix sum first, then evaluate clamped coordinates in $O(1)$ for each cell.

---

## 4. 🔗 CONNECT: Dimensional Progression

Notice the mathematical symmetry across dimensions:

| Dimension | Table Size | Construction Overlap | Query Formula Terms |
| :--- | :--- | :--- | :--- |
| **1D (Day 8)** | $N + 1$ | None: $P[i] = P[i-1] + \text{val}$ | 2 terms: $P[R+1] - P[L]$ |
| **2D (Day 10)** | $(M+1) \times (N+1)$ | 1 overlap: $+ \text{top} + \text{left} - \text{diag}$ | 4 terms: $+ \text{BR} - \text{TR} - \text{BL} + \text{TL}$ |
| **3D (Advanced)** | $(X+1) \times (Y+1) \times (Z+1)$ | 3 faces, 3 edges, 1 corner | 8 terms (Inclusion-Exclusion alternating signs) |

---

## 5. 🎯 Day 10 Checkpoint Questions

Test your matrix geometry intuition:

1. **Inclusion-Exclusion Trace:** Draw a $3 \times 3$ grid. If you query `SumRegion(1, 1, 2, 2)`, write out the four prefix coordinates accessed in `_prefix`. Which region was double-subtracted and needed re-addition?
2. **Padding Defense:** Why does allocating $(M + 1) \times (N + 1)$ with `_prefix[0, *] = 0` and `_prefix[*, 0] = 0` prevent index out-of-bounds exceptions when $r_1 = 0$ or $c_1 = 0$?
3. **Square Submatrix Invariant:** In LeetCode 1277, why does `dp[r, c] = 3` imply that there are *exactly 3* square submatrices of all 1s whose bottom-right corner is at $(r, c)$?
