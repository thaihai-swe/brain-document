---
title: "Week 5 — Day 30: 2D Matrix Search Patterns"
---

In **Day 29**, we explored physical memory row-major layouts, in-place matrix rotations via transpose decomposition, and 4-boundary spiral traversals.

Today, we master **Searching in Sorted 2D Spaces**.

Searching in a 2D matrix is one of the most frequently asked themes in Big Tech technical screens (Google, Meta, Amazon, Microsoft). The challenge is recognizing the subtle difference between **two distinct matrix sorting topologies**:
1. **Strictly Sequential Matrix ([LeetCode 74]):** The entire matrix is a continuous sorted 1D array wrapped into rows $\implies$ **Virtual 1D Binary Search in $O(\log(M \times N))$**.
2. **Independently Sorted Rows & Columns ([LeetCode 240]):** Each row and each column is sorted, but adjacent rows overlap in values $\implies$ **Saddleback Search in $O(M + N)$**.

---

## 1. 🧠 TEACH: Searching in Sorted 2D Spaces

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **2D Matrix Search Patterns** locate target values in ordered 2D grids using coordinate flattening or multidimensional elimination.
  - *Core Invariants:* Flattened Invariant (Matrix I: entire matrix sorted end-to-end): Cell $(r, c)$ maps to 1D index $idx = r \times N + c$, and $r = idx / N, c = idx \pmod N$; Saddleback Invariant (Matrix II: rows and columns independently sorted): Start at top-right corner $(0, N-1)$; if $mat[r, c] > target$, decrement column; if $< target$, increment row.
  - *Misconception Check:* You cannot start saddleback search at $(0, 0)$ or $(M-1, N-1)$! Both directions from $(0, 0)$ increase values, so you cannot eliminate a direction deterministically. You must start at top-right or bottom-left, where moving along one axis increases and the other decreases.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(M \times N)$ exhaustive cell scan.
  - *Complexity Advantage:* Reduces search time to $O(\log(MN))$ (for fully sorted matrices) or $O(M + N)$ (for row/col sorted matrices) with $O(1)$ space.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Search a 2D Matrix" (LC 74), "Search a 2D Matrix II" (LC 240). Signal words: "search 2D matrix", "rows sorted left to right", "columns sorted top to bottom".
  - *When to Avoid / Failure Modes:* If the matrix has no monotonic ordering (requires $O(MN)$ full scan).
- **4. WHERE:**
  - *Physical CLR Memory:* Zero heap allocations; coordinate pointers (`r`, `c`) live in CPU registers; cache lines are utilized effectively along row scans.
  - *Production Systems:* 2D spatial indexing lookups, range searches in multi-attribute database tables.
- **5. WHO:**
  - *Spoken Script:* "If a 2D matrix is completely sorted end-to-end, I treat it as a flattened 1D array of size $M \times N$ and perform standard binary search in $O(\log(MN))$. If rows and columns are independently sorted, I start at the top-right corner: moving left decreases the value, moving down increases it, finding the target in $O(M + N)$ time."
  - *Interviewer Evaluation Lens:* Checks whether candidate distinguishes between fully sorted (LC 74) vs. row/col sorted (LC 240) and can explain why top-right/bottom-left corners are mandatory for saddleback search.
- **6. HOW:**
  - *Cost Model:* LC 74: $O(\log(MN))$ time, $O(1)$ space; LC 240: $O(M + N)$ time, $O(1)$ space.
  - *State Transition Trace (Saddleback):* `mat 5x5, target=5 -> start at (0, 4) val 15: 15 > 5 => col-- -> (0, 3) val 11 > 5 => col-- -> (0, 2) val 7 > 5 => col-- -> (0, 1) val 4 < 5 => row++ -> (1, 1) val 5 == target => found!`.


### 1.1 Physical Mental Model: The Unrolled Tape vs The Mountain Saddleback Corner

2D matrix search algorithms are governed by two distinct spatial geometries:

```
       ======================================================================
         PHYSICAL ANALOGY A: THE UNROLLED TAPE MEASURE (LC 74)
       ======================================================================

       Because each row starts higher than the previous row ends:
       [ 1   3   5   7 ]  -->  [ 10  11  16  20 ]  -->  [ 23  30  34  60 ]
       
       You can unroll the entire 3x4 grid into a single 12-element measuring tape:
       [ 1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60 ]
       
       Direct Index Mapping:
       1D Midpoint: idx = 6 ---> row = 6 / 4 = 1, col = 6 % 4 = 2.
       Value at (1, 2) is 16. Standard binary search in O(log(M * N))!
```

```
       ======================================================================
         PHYSICAL ANALOGY B: THE SADDLEBACK LOOKOUT TOWER (LC 240)
       ======================================================================

       Rows are sorted left-to-right; columns sorted top-to-bottom.
       
       ⚠️ WHY TOP-LEFT (0,0) FAILS:
       At (0,0), going Right INCREASES, going Down ALSO INCREASES!
       If current value is too small, which way do you go? PARALYZED!

       ✨ WHY TOP-RIGHT (0, C-1) SUCCEEDS:
       At Top-Right, paths diverge orthogonally:
       - Stepping LEFT: Values DECREASE (<---)
       - Stepping DOWN: Values INCREASE ( v )
       
       Current cell: matrix[r, c] vs Target:
       - If matrix[r, c] > target: The entire column below is EVEN BIGGER!
         Eliminate column: `col--`!
       - If matrix[r, c] < target: The entire row to the left is EVEN SMALLER!
         Eliminate row: `row++`!
       
       Total Steps: At most M rows + N columns = O(M + N) staircase walk!
```

---

### 1.2 The Two Types of Sorted Matrices

Understanding the exact problem constraints dictates whether you use a logarithmic binary search or a linear staircase walk:

```
Topology A: Strictly Sequential Matrix (LeetCode 74)
[  1,   3,   5,   7  ]   <-- Row 0 ends at 7
[ 10,  11,  16,  20  ]   <-- Row 1 starts at 10 (10 > 7!)
[ 23,  30,  34,  60  ]   <-- Row 2 starts at 23 (23 > 20!)

Property: Unbroken, continuous global monotonicity from index 0 to M*N - 1.
Optimal Algorithm: Virtual 1D Binary Search in O(log(M * N)).
```

```
Topology B: Independently Sorted Matrix (LeetCode 240)
[  1,   4,   7,  11,  15 ]  <-- Row 0 ends at 15
[  2,   5,   8,  12,  19 ]  <-- Row 1 starts at 2 (2 < 15! Overlap!)
[  3,   6,   9,  16,  22 ]
[ 10,  13,  14,  17,  24 ]
[ 18,  21,  23,  26,  30 ]

Property: Rows sorted left-to-right; columns sorted top-to-bottom.
          NO global monotonicity between rows!
Optimal Algorithm: Saddleback Search in O(M + N).
```

---

### 1.2 Virtual 1D Binary Search: The Coordinate Mapping Invariant

In Topology A ([LeetCode 74]), candidates often write two binary searches (one on the first column to find the row, then another on that row).
While correct, it is clunky, branch-heavy, and unnecessary!

Because the matrix is globally monotonic, we can treat the entire $M \times N$ matrix as a single virtual 1D array of length $L = M \times N$ with indices $0 \dots L - 1$:

$$\text{Index Range: } [0 \dots M \times N - 1]$$

#### The Coordinate Translation Formula:
For any 1D midpoint index `mid`:
$$\mathbf{\text{row} = \text{mid} / C, \quad \text{col} = \text{mid} \% C}$$

```
Matrix (3 x 4): M = 3, C = 4
 mid = 6:
  row = 6 / 4 = 1
  col = 6 % 4 = 2
 Access: matrix[1][2] -> Instantaneous O(1) coordinate mapping!
```

We execute a standard Binary Search without allocating a single byte of auxiliary memory!

---

### 1.3 Saddleback Search (The Top-Right Elimination Principle)

In Topology B ([LeetCode 240]), the matrix is not globally monotonic, so a virtual 1D binary search fails.

How can we search an $M \times N$ grid faster than the brute-force $O(M \times N)$ scan?

#### Why Starting at Top-Left $(0, 0)$ Fails:
At index $(0, 0)$:
- Moving Right increases values.
- Moving Down increases values.
- If `matrix[0][0] < target`, which way do you go? Down? Right? Both?
- **Ambiguity!** You cannot eliminate any candidate space deterministically.

#### The Magic of the Saddle Point (Top-Right $(0, C - 1)$ or Bottom-Left $(M - 1, 0)$):
Look at the top-right corner:
- Moving **Left** strictly **decreases** values.
- Moving **Down** strictly **increases** values.

```
                    Top-Right Corner (row = 0, col = C - 1)
                                      ▲
                                      │
                      Decreases ◄─────*─────► [Out of bounds]
                                      │
                                      ▼
                                  Increases
```

This is a **Saddle Point** (bifurcation point). At every step, comparing `matrix[r][c]` to `target` gives an unambiguous decision:

1. **If `matrix[r][c] == target`:** Found! Return `true`.
2. **If `matrix[r][c] > target`:**
   - The current element is too large.
   - Since the column is sorted top-to-bottom, **every element below `matrix[r][c]` in column `c` is even larger**!
   - Therefore, `target` cannot possibly exist anywhere in column `c`.
   - **Prune the entire column:** `c--`.
3. **If `matrix[r][c] < target`:**
   - The current element is too small.
   - Since the row is sorted left-to-right, **every element to the left of `matrix[r][c]` in row `r` is even smaller**!
   - Therefore, `target` cannot possibly exist anywhere in row `r`.
   - **Prune the entire row:** `r++`.

#### Complexity Derivation:
In every single iteration, we either decrement `c` or increment `r`.
The pointer can move at most $M$ steps down and $C$ steps left:
$$\mathbf{\text{Total Steps} \le M + C \implies O(M + N) \text{ Time!}}$$
Space complexity is strictly **$O(1)$**.

---

### 1.4 Interview Spoken Drill (20–30 Seconds)

> *"To search a matrix with independently sorted rows and columns, I start at the top-right corner. The top-right acts as a saddle point: values decrease to the left and increase downward. If the current value is greater than the target, the entire column below it is also too large, so I eliminate the column by moving left. If the current value is smaller, the entire row to the left is too small, so I eliminate the row by moving down. This guarantees finding the target or proving it absent in $O(M + N)$ time with $O(1)$ space."*

---

### 1.5 ⚙️ Core Operations Deep-Dive: 2D Row-Major Index Flattening & Saddleback Coordinate Elimination

#### Dimension 1: Operation Contract & Big-O Bounds

##### 2D Matrix Search Primitives (`SearchMatrix`, `SearchMatrixII`, `KthSmallestMatrix`)
- **Signatures:**
  - `public bool SearchMatrix(int[][] matrix, int target)`: Virtual 1D bisection via row-major index mapping in $\Theta(\log(M \times N))$ time and $O(1)$ space.
  - `public bool SearchMatrixII(int[][] matrix, int target)`: Saddleback coordinate elimination starting at $(0, C-1)$ in $O(M + N)$ time and $O(1)$ space.
  - `public int KthSmallest(int[][] matrix, int k)`: Numerical range bisection with saddleback rank counting in $O(N \log(\max - \min))$ time and $O(1)$ space.
- **Preconditions:**
  - `SearchMatrix`: Global monotonicity (first cell of row $r >$ last cell of row $r-1$).
  - `SearchMatrixII`: Independent row and column monotonicity (rows sorted left-to-right, columns top-to-bottom).
  - Matrix dimensions $M, N \ge 1$.
- **Postconditions:**
  - Returns boolean indicator of target existence without allocating auxiliary 1D arrays.
  - Saddleback traversal guarantees termination within $M + N$ steps.
- **Complexity Bounds:**

| Search Paradigm | Applicable Grid Topology | Time Complexity | Auxiliary Space | Pruning Decision per Step |
| :--- | :--- | :--- | :--- | :--- |
| **Virtual 1D Bisection** | **Globally Sorted (LC 74)** | **$\Theta(\log(MN))$** | **$O(1)$** | Halves 1D search space ($2^{-k}$) |
| **Saddleback Pruning** | **Row & Col Sorted (LC 240)**| **$O(M + N)$** | **$O(1)$** | Eliminates 1 row OR 1 col |
| **Row-by-Row Binary Search**| Row & Col Sorted | $O(M \log N)$ | $O(1)$ | Discards half of one row |
| **Quad-Tree Divide & Conquer**| Row & Col Sorted | $O((MN)^{\log_4 3})$ | $O(\log(MN))$ stack | Discards 1 of 4 sub-quadrants |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
               Virtual 1D Matrix Bisection Flow (LC 74)
                                  │
                 [Input: matrix (M x N), target]
                                  │
                 [Init: left = 0, right = M * N - 1]
                                  │
                          [left <= right?]
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
                 YES                              NO ──► [Return FALSE]
                  │
        [mid = left + (right - left) / 2]
                  │
        [Row-Major Coordinate Bijection:
         row = mid / N, col = mid % N]
                  │
        [val = matrix[row][col]]
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
     [val==T]  [val < T]  [val > T]
        │         │         │
    [Return    [left =   [right =
     TRUE]     mid + 1]  mid - 1]
```

```
             Saddleback Coordinate Elimination Flow (LC 240)
                                  │
                 [Init: row = 0, col = N - 1]
                                  │
                 [row < M AND col >= 0?]
                ┌───────────────┴───────────────┐
                ▼                               ▼
               YES                              NO ──► [Return FALSE]
                │
     [val = matrix[row][col]]
                │
     ┌──────────┼──────────┐
     ▼          ▼          ▼
  [val == T] [val > T]  [val < T]
     │          │          │
  [Return   [col--]     [row++]
   TRUE]  (Prune Col) (Prune Row)
                │          │
                └────┬─────┘
                     ▼
              (Next Step)
```

---

#### Dimension 3: Visual ASCII State Transitions

##### 1. Row-Major Mapping Bijection: Matrix $3 \times 4$
```
Virtual 1D Index:   0   1   2   3   4   5   6   7   8   9  10  11
2D Coordinates:   (0,0)(0,1)(0,2)(0,3)(1,0)(1,1)(1,2)(1,3)(2,0)(2,1)(2,2)(2,3)

Formula:
row = index / Cols = 6 / 4 = 1
col = index % Cols = 6 % 4 = 2
Value: matrix[1][2] evaluated instantly in O(1) time with zero memory overhead!
```

##### 2. Saddleback Elimination Geometry (Target = 5)
```
Matrix:
[  1,   4,   7,  11,  15 ]
[  2,   5,   8,  12,  19 ]
[  3,   6,   9,  16,  22 ]

Step 1: Start at (0, 4) -> Value = 15 > 5.
- Since column 4 is sorted downward, all values in col 4 are >= 15 > 5!
- Prune entire Column 4: col = 3.

Step 2: At (0, 3) -> Value = 11 > 5.
- Prune Column 3: col = 2.

Step 3: At (0, 2) -> Value = 7 > 5.
- Prune Column 2: col = 1.

Step 4: At (0, 1) -> Value = 4 < 5.
- Since row 0 is sorted rightward, all values to left in row 0 are <= 4 < 5!
- Prune entire Row 0: row = 1.

Step 5: At (1, 1) -> Value = 5 == 5 (MATCH FOUND!) -> Return TRUE.
Total steps: 4 comparisons instead of 15!
```

---

#### Dimension 4: Invariant Preservation Proof

##### Saddleback Elimination Correctness Theorem:
At any step $(r, c)$ in Saddleback search, the target element cannot reside in any cell of the excluded region:
$$\mathcal{E} = \{ (i, j) \mid i < r \lor j > c \}$$

##### Mathematical Proof:
1. **Base Case:**
   At start, $r = 0, c = C - 1$. The set $\{ i < 0 \lor j > C - 1 \}$ contains no valid grid coordinates. Invariant holds trivially.
2. **Inductive Step:**
   Assume hypothesis holds for current position $(r, c)$.
   - **Case A ($matrix[r][c] > target$):**
     Because column $c$ is sorted non-decreasingly top-to-bottom:
     $$\forall i \ge r, \quad matrix[i][c] \ge matrix[r][c] > target$$
     Thus, no cell in column $c$ at or below row $r$ can equal target.
     All cells in column $c$ above row $r$ ($i < r$) were already in $\mathcal{E}$ by induction.
     Therefore, column $c$ contains zero valid targets. Decrementing $c \to c - 1$ expands $\mathcal{E}$ to include column $c$ without discarding any target cell.
   - **Case B ($matrix[r][c] < target$):**
     Because row $r$ is sorted non-decreasingly left-to-right:
     $$\forall j \le c, \quad matrix[r][j] \le matrix[r][c] < target$$
     Thus, no cell in row $r$ at or to the left of column $c$ can equal target.
     All cells in row $r$ to the right of column $c$ ($j > c$) were already in $\mathcal{E}$ by induction.
     Therefore, row $r$ contains zero valid targets. Incrementing $r \to r + 1$ expands $\mathcal{E}$ to include row $r$ without discarding any target cell.
3. **Termination:**
   Since either $c$ decrements or $r$ increments each step, the loop must terminate in at most $M + C$ steps. If target is not found, $\mathcal{E}$ covers the entire matrix. Target is proven absent. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Scenario | Concrete Input | Danger / Failure Mode | Invariant Protection Mechanism |
| :--- | :--- | :--- | :--- |
| **Integer Index Overflow ($M \times N$)** | $M = 10^5, N = 10^5$ | $M \times N = 10^{10} > 2^{31}-1$ overflows 32-bit `int` | In virtual 1D bisection, calculate indices using `long` (`long right = (long)M * N - 1`). |
| **$1 \times 1$ Grid Match** | `matrix = [[5]]`, $target = 5$ | Single iteration boundary fail | $L=0, R=0, mid=0 \implies row=0, col=0 \implies$ match found immediately. |
| **Target Smaller Than Minimum** | `matrix[0][0] > target` | Full diagonal descent | Saddleback prunes all columns leftward down to $c = -1$; loop halts cleanly and returns `false`. |
| **Target Larger Than Maximum** | `matrix[M-1][C-1] < target` | Full vertical descent | Saddleback prunes all rows downward down to $r = M$; loop halts cleanly and returns `false`. |
| **Single Row Matrix ($1 \times N$)** | `[[1, 3, 5, 7]]`, $target = 3$ | Row division by $N$ | $r = 0$ throughout; operates identically to 1D binary search. |

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 74 — Search a 2D Matrix (Medium)

> You are given an `m x n` integer matrix `matrix` with the following two properties:
> - Each row is sorted in non-decreasing order.
> - The first integer of each row is greater than the last integer of the previous row.
>
> Given an integer `target`, return `true` if `target` is in `matrix` or `false` otherwise.
> You must write a solution in $O(\log(m \times n))$ time complexity.

#### Visual Step-by-Step Trace:
`matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]]`, `target = 3`
$M = 3, C = 4$. Virtual range: `left = 0, right = 3 * 4 - 1 = 11`.

```
Iteration 1:
 left = 0, right = 11
 mid = 0 + (11 - 0) / 2 = 5
 Map to 2D: row = 5 / 4 = 1, col = 5 % 4 = 1
 matrix[1][1] = 11
 11 > 3 (target) -> target lies in left half.
 right = mid - 1 = 4

Iteration 2:
 left = 0, right = 4
 mid = 0 + (4 - 0) / 2 = 2
 Map to 2D: row = 2 / 4 = 0, col = 2 % 4 = 2
 matrix[0][2] = 5
 5 > 3 (target) -> target lies in left half.
 right = mid - 1 = 1

Iteration 3:
 left = 0, right = 1
 mid = 0 + (1 - 0) / 2 = 0
 Map to 2D: row = 0 / 4 = 0, col = 0 % 4 = 0
 matrix[0][0] = 1
 1 < 3 (target) -> target lies in right half.
 left = mid + 1 = 1

Iteration 4:
 left = 1, right = 1
 mid = 1 + (1 - 1) / 2 = 1
 Map to 2D: row = 1 / 4 = 0, col = 1 % 4 = 1
 matrix[0][1] = 3
 3 == 3 -> MATCH FOUND! Return true.
```

#### Production C# Implementation:
```csharp
public class SolutionSearch2DMatrix {
    public bool SearchMatrix(int[][] matrix, int target) {
        if (matrix == null || matrix.Length == 0 || matrix[0].Length == 0) return false;

        int m = matrix.Length;
        int n = matrix[0].Length;
        int left = 0;
        int right = m * n - 1; // Virtual 1D bounds

        while (left <= right) {
            int mid = left + (right - left) / 2;

            // Mathematical 1D to 2D projection
            int row = mid / n;
            int col = mid % n;
            int midVal = matrix[row][col];

            if (midVal == target) {
                return true;
            }
            if (midVal < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return false;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(\log(M \times N))$ — logarithmic halving over the entire grid.
- **Space Complexity:** $O(1)$ — constant scalar pointers.

---

### Problem 2: LeetCode 240 — Search a 2D Matrix II (Medium)

> Write an efficient algorithm that searches for a value `target` in an `m x n` integer matrix `matrix`. This matrix has the following properties:
> - Integers in each row are sorted in ascending from left to right.
> - Integers in each column are sorted in ascending from top to bottom.

#### Visual Step-by-Step Trace (Saddleback Walk):
`matrix =`
```
[  1,   4,   7,  11,  15 ]
[  2,   5,   8,  12,  19 ]
[  3,   6,   9,  16,  22 ]
[ 10,  13,  14,  17,  24 ]
[ 18,  21,  23,  26,  30 ]
```
`target = 5`
Start at top-right: `row = 0, col = 4`

| Step | `(row, col)` | `matrix[row][col]` | Comparison | Action | Eliminated Space |
| :---: | :---: | :---: | :---: | :---: | :--- |
| 1 | $(0, 4)$ | 15 | $15 > 5$ | `col--` (3) | Column 4 eliminated |
| 2 | $(0, 3)$ | 11 | $11 > 5$ | `col--` (2) | Column 3 eliminated |
| 3 | $(0, 2)$ | 7 | $7 > 5$ | `col--` (1) | Column 2 eliminated |
| 4 | $(0, 1)$ | 4 | $4 < 5$ | `row++` (1) | Row 0 eliminated |
| 5 | $(1, 1)$ | 5 | $5 == 5$ | **FOUND!** | Return `true` |

Total steps: 5! (Compare this to checking all 25 elements).

#### Production C# Implementation:
```csharp
public class SolutionSearch2DMatrixII {
    public bool SearchMatrix(int[][] matrix, int target) {
        if (matrix == null || matrix.Length == 0 || matrix[0].Length == 0) return false;

        int m = matrix.Length;
        int n = matrix[0].Length;

        // Start at the top-right saddle point
        int row = 0;
        int col = n - 1;

        while (row < m && col >= 0) {
            int current = matrix[row][col];

            if (current == target) {
                return true;
            }
            if (current > target) {
                // Current is too large -> Target cannot be in this column
                col--;
            } else {
                // Current is too small -> Target cannot be in this row
                row++;
            }
        }

        return false; // Out of bounds without match
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(M + N)$ — row advances at most $M$ times; column decreases at most $N$ times.
- **Space Complexity:** $O(1)$ — strictly two pointers (`row`, `col`).

---

### Problem 3: LeetCode 378 — Kth Smallest Element in a Sorted Matrix (Medium)

> Given an `n x n` `matrix` where each of the rows and columns is sorted in ascending order, return the `k-th` smallest element in the matrix.
> Note that it is the `k-th` smallest element in the sorted order, not the `k-th` distinct element.

#### Combining Saddleback with Binary Search on Answer Space (Day 24 Integration):
Notice:
1. What is the search space for the value?
   - $lo = matrix[0][0]$ (smallest element).
   - $hi = matrix[n-1][n-1]$ (largest element).
2. For any candidate value $mid$, how many elements in the matrix are $\le mid$?
   - We can count all elements $\le mid$ in $O(N)$ time using the **Saddleback staircase sweep**!
   - Start at bottom-left `(n-1, 0)`:
     - If `matrix[r][c] <= mid`, then every element above `(r, c)` in column `c` is also $\le mid$.
     - We add $(r + 1)$ to our count and move right: `col++`.
     - Else: `row--`.
3. If count $\ge k$, $mid$ is feasible $\implies hi = mid$.
4. Total runtime: $\mathbf{O(N \log(\max - \min))}$! (Far faster than Min-Heap $O(K \log N)$ when $K \approx N^2$).

#### Production C# Implementation:
```csharp
public class SolutionKthSmallestMatrix {
    public int KthSmallest(int[][] matrix, int k) {
        int n = matrix.Length;
        int lo = matrix[0][0];
        int hi = matrix[n - 1][n - 1];

        // Binary Search on Answer Space
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;

            if (CountLessOrEqual(matrix, mid) >= k) {
                hi = mid; // First True: mid is large enough to have >= k elements <= mid
            } else {
                lo = mid + 1;
            }
        }

        return lo;
    }

    // Saddleback count in O(N) starting from bottom-left
    private int CountLessOrEqual(int[][] matrix, int target) {
        int n = matrix.Length;
        int count = 0;
        int row = n - 1;
        int col = 0;

        while (row >= 0 && col < n) {
            if (matrix[row][col] <= target) {
                // All elements from index 0 to row in this column are <= target
                count += (row + 1);
                col++; // Move to next column
            } else {
                row--; // Move up to smaller values
            }
        }

        return count;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N \log(\max - \min))$. Each check counts in $O(N)$ time.
- **Space Complexity:** $O(1)$ auxiliary space.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master 2D matrix searches on LeetCode:

### Problem 1 (Virtual 1D Binary Search): LeetCode 74 — Search a 2D Matrix (Medium)
- **Goal:** Map 1D `mid` to `(mid / C, mid % C)` and achieve $O(\log(MN))$.
- **Target Complexity:** $O(\log(MN))$ time, $O(1)$ space.

### Problem 2 (Saddleback Pruning): LeetCode 240 — Search a 2D Matrix II (Medium)
- **Goal:** Start at top-right and eliminate rows/columns in $O(M + N)$.
- **Target Complexity:** $O(M + N)$ time, $O(1)$ space.

### Problem 3 (Synthesis / Answer Space): LeetCode 378 — Kth Smallest Element in a Sorted Matrix (Medium)
- **Goal:** Combine answer-space binary search with the $O(N)$ staircase count.
- **Target Complexity:** $O(N \log(\text{Range}))$ time, $O(1)$ space.

### Bonus / Extension Challenge: LeetCode 1428 — Leftmost Column with at Least a One (Medium)
- **Goal:** Given a binary matrix API with row-sorted 0s and 1s, find the leftmost column with a 1 in $O(M + N)$ calls.
- **Hint:** Start at top-right $(0, C-1)$. If `1`, move left (`c--`) and record candidate column; if `0`, move down (`r++`).

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                        2D Grid Search Strategy                         │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Strict global sort (Row 0 < Row 1 < ...) ─► Virtual 1D Binary Search [O(log(MN))]
                   │                                               [LC 74]
                   │
                   ├─► Independent row and column sorting ───────► Saddleback Search [O(M + N)]
                   │                                               [LC 240, LC 1428]
                   │
                   ├─► Kth smallest element in sorted grid ──────► Answer Space BS + Saddleback Count
                   │                                               [LC 378]
                   │
                   └─► Unsorted grid / graph search ─────────────► BFS / DFS Traversal (Week 20)
```

### Preview for Day 31: Rabin-Karp Rolling Hash & Polynomial Fingerprinting
Over Days 29 and 30, we conquered 2D matrix geometry and search bifurcations.
Tomorrow in **Day 31**, we transition from numeric grids to **Advanced String Search**:
We will learn **Rabin-Karp Rolling Hashing**, unlocking how polynomial modular fingerprints enable $O(1)$ sliding window substring comparisons and $O(N)$ multi-pattern searching without string allocations!

---

## 5. 🎯 Day 30 Checkpoint Questions

Solidify your 2D search invariants with these 4 questions:

1. **Why Saddleback Works:** Why can you NOT start a Saddleback Search at index $(0, 0)$ or $(M-1, C-1)$? What unique mathematical property do $(0, C-1)$ and $(M-1, 0)$ possess?
2. **Flattening Impossibility in 240:** If you attempt to treat LeetCode 240 as a single 1D array of size $M \times N$ with `r = mid / C, c = mid % C`, give a simple $2 \times 2$ matrix counter-example that proves monotonicity is violated.
3. **Bottom-Left vs Top-Right:** Trace Saddleback Search starting from the **bottom-left** corner $(M-1, 0)$. When `matrix[r][c] > target`, which direction do you move? When `matrix[r][c] < target`, which direction do you move?
4. **Answer Space Counting:** In LeetCode 378, why does `CountLessOrEqual` add `(row + 1)` when `matrix[row][col] <= target`?
