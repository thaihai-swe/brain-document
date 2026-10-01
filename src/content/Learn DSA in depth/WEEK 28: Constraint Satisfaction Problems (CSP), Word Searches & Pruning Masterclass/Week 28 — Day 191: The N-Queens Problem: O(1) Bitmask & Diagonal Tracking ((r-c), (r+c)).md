---
title: "Week 28 — Day 191: The N-Queens Problem: O(1) Bitmask & Diagonal Tracking ((r-c), (r+c))"
---



## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 The Classical N-Queens Problem & State Space Collapse

The **$N$-Queens Problem** is the classic benchmark of combinatorial search: place $N$ non-attacking chess queens on an $N \times N$ chessboard such that no two queens share the same row, column, or diagonal.

A queen placed at cell $(r, c)$ attacks:
1. Every cell in row $r$: $\{(r, j) \mid 0 \le j < N\}$.
2. Every cell in column $c$: $\{(i, c) \mid 0 \le i < N\}$.
3. Every cell on its major diagonal ($\backslash$): $\{(r + k, c + k) \mid k \in \mathbb{Z}\}$.
4. Every cell on its anti-diagonal ($/$): $\{(r + k, c - k) \mid k \in \mathbb{Z}\}$.

```
                           QUEEN ATTACK VECTORS
                          \         │         /
                           \        │        /
                            \       │       /
                             \      │      /
                        ─────── [QUEEN] ───────
                             /      │      \
                            /       │       \
                           /        │        \
                          /         │         \
```

#### The Cascading State Space Collapse
How large is the search space for $N = 8$?

1. **Brute Force Combination Space:**
   Selecting $N$ squares arbitrarily from the $N^2$ available squares:
   $$\binom{N^2}{N} = \binom{64}{8} = 4,426,165,368 \text{ states}$$
2. **Row Invariant Collapse (Pigeonhole Principle):**
   Because there are $N$ queens and $N$ rows, and no two queens can share a row, **every row must contain exactly one queen**.
   Placing one queen per row from row $0$ to row $N-1$:
   $$N^N = 8^8 = 16,777,216 \text{ states} \quad (263\times \text{ reduction!})$$
3. **Column Permutation Invariant Collapse:**
   Because no two queens can share a column, the placement of queens corresponds to a **permutation** of column indices $(c_0, c_1, \dots, c_{N-1})$:
   $$N! = 8! = 40,320 \text{ states} \quad (416\times \text{ further reduction!})$$
4. **Diagonal Invariant Pruning & Bitmasks:**
   Pruning diagonal conflicts during row-by-row placement reduces the 40,320 permutations to just **92 valid solutions** across a search tree of only **2,056 nodes**!

---

### 1.2 Mathematical Diagonal Invariants: $(r - c)$ and $(r + c)$

On a 2D Cartesian grid with rows increasing downward ($r \in [0, N-1]$) and columns increasing to the right ($c \in [0, N-1]$):

```
      c:  0     1     2     3
   r: ┌─────┬─────┬─────┬─────┐
   0  │ 0,0 │ 0,1 │ 0,2 │ 0,3 │
      ├─────┼─────┼─────┼─────┤
   1  │ 1,0 │ 1,1 │ 1,2 │ 1,3 │
      ├─────┼─────┼─────┼─────┤
   2  │ 2,0 │ 2,1 │ 2,2 │ 2,3 │
      ├─────┼─────┼─────┼─────┤
   3  │ 3,0 │ 3,1 │ 3,2 │ 3,3 │
      └─────┴─────┴─────┴─────┘
```

#### 1. Major Diagonals ($\backslash$, Top-Left to Bottom-Right)
Moving one step along a major diagonal increments both row and column by $1$: $(r, c) \to (r + 1, c + 1)$.
The difference between row and column remains **strictly constant**:
$$(r + 1) - (c + 1) = r - c$$

The value $r - c$ ranges from:
$$\min(r - c) = 0 - (N - 1) = -(N - 1) \quad (\text{top-right corner})$$
$$\max(r - c) = (N - 1) - 0 = N - 1 \quad (\text{bottom-left corner})$$

To map this into a non-negative array index in range $[0, 2N - 2]$:
$$\text{diag1Index}(r, c) = r - c + (N - 1)$$
There are exactly $2N - 1$ distinct major diagonals.

#### 2. Anti-Diagonals ($/$, Top-Right to Bottom-Left)
Moving one step along an anti-diagonal increments the row by $1$ and decrements the column by $1$: $(r, c) \to (r + 1, c - 1)$.
The sum of row and column remains **strictly constant**:
$$(r + 1) + (c - 1) = r + c$$

The value $r + c$ ranges from:
$$\min(r + c) = 0 + 0 = 0 \quad (\text{top-left corner})$$
$$\max(r + c) = (N - 1) + (N - 1) = 2N - 2 \quad (\text{bottom-right corner})$$

$$\text{diag2Index}(r, c) = r + c \in [0, 2N - 2]$$
There are exactly $2N - 1$ distinct anti-diagonals.

```
       MAJOR DIAGONAL (r - c + N - 1)            ANTI-DIAGONAL (r + c)
            N = 4 (Index range 0..6)             N = 4 (Index range 0..6)
               c: 0  1  2  3                        c: 0  1  2  3
            r:                                   r:
            0     3  2  1  0                     0     0  1  2  3
            1     4  3  2  1                     1     1  2  3  4
            2     5  4  3  2                     2     2  3  4  5
            3     6  5  4  3                     3     3  4  5  6
```

---

### 1.3 The Bitwise Hardware Optimization: $\mathcal{O}(1)$ Register Search

Instead of tracking conflicts using three boolean arrays (`bool[N] cols`, `bool[2N-1] diag1`, `bool[2N-1] diag2`), we can compress all conflict sets into **three primitive integer registers**:
- `cols`: Bit $c$ is $1$ if column $c$ is occupied by an earlier queen.
- `diag1`: Bit $c$ is $1$ if the major diagonal passing through column $c$ in the current row is threatened.
- `diag2`: Bit $c$ is $1$ if the anti-diagonal passing through column $c$ in the current row is threatened.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    REGISTER-LEVEL PARALLEL EVALUATION                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Compute All Threatened Columns in 1 Instruction:                        │
│     occupied = cols | diag1 | diag2                                         │
│                                                                             │
│  2. Compute All Available Slots via Bitwise NOT and Mask:                   │
│     available = (~occupied) & ((1 << N) - 1)                                │
│                                                                             │
│  3. Extract Lowest Available Candidate Column in 1 Instruction:             │
│     bit = available & (-available)   <-- Two's Complement Isolation!        │
│                                                                             │
│  4. Clear Lowest Candidate Column for Next Sibling:                         │
│     available &= (available - 1)    <-- Brian Kernighan's Bit Reset!       │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Diagonal Propagation Between Rows
When transitioning from row $r$ to row $r + 1$:
- Placing a queen at column bit `bit` adds `bit` to all three masks.
- As the algorithm advances to the next row:
  - Major diagonals ($\backslash$) slant down-and-right: the threat shifts **one column to the right** relative to the next row $\implies (\text{diag1} \mid \text{bit}) \ll 1$ (or $\gg 1$ depending on bit endianness).
  - Anti-diagonals ($/$) slant down-and-left: the threat shifts **one column to the left** relative to the next row $\implies (\text{diag2} \mid \text{bit}) \gg 1$ (or $\ll 1$).
  - Columns remain vertically straight: $\text{cols} \mid \text{bit}$.

Because these masks are passed **by value** down the recursive call stack, the `Unchoose` step is **completely automatic**: returning from the recursive frame restores the caller's CPU registers in zero cycles!

---

### 1.4 Reflectional Symmetry Pruning

The chessboard exhibits vertical reflectional symmetry across its vertical center axis:

```
                      VERTICAL REFLECTION SYMMETRY
             c: 0   1   2   3              c: 0   1   2   3
          r: ┌───┬───┬───┬───┐          r: ┌───┬───┬───┬───┐
          0  │   │ Q │   │   │   ===>   0  │   │   │ Q │   │
          1  │   │   │   │ Q │  MIRROR  1  │ Q │   │   │   │
          2  │ Q │   │   │   │          2  │   │   │   │ Q │
          3  │   │   │ Q │   │          3  │   │ Q │   │   │
             └───┴───┴───┴───┘             └───┴───┴───┴───┘
                Solution 1                    Solution 2
```

In row 0, any queen placed in column $c$ will produce a set of solutions that is the exact mirror image of the solutions produced by placing a queen in column $N - 1 - c$.

#### The Symmetry Optimization Rule
1. Only iterate column choices $c \in [0, \lfloor N / 2 \rfloor - 1]$ in row 0.
2. For each solution found in these branches, count it as **2 solutions** ($1$ original + $1$ vertical mirror).
3. If $N$ is odd, explore the center column $c = N / 2$ as a single, separate branch without doubling.

This cuts the search space of the root invocation by **nearly 50%**!

---

## 2. ⚙️ IMPLEMENT: Production-Grade Container / Algorithm

The following production container **`NQueensBitmaskSolver`** implements:
1. **Board Materialization Solver** ([LC 51]) returning complete board configurations.
2. **High-Performance Bitmask Counter** ([LC 52]) tracking registers without allocations.
3. **Symmetric Bitmask Solver** exploiting vertical mirror symmetry for $2\times$ acceleration.
4. Comprehensive test harness verifying known mathematical sequences for $N = 1 \dots 14$ and empirical benchmarks.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace NQueensBitmaskEngine
{
    /// <summary>
    /// Production-grade N-Queens solver utilizing O(1) bitwise register arithmetic
    /// and vertical reflection symmetry pruning.
    /// </summary>
    public static class NQueensBitmaskSolver
    {
        // ====================================================================
        // 1. BOARD MATERIALIZATION ENGINE (LEETCODE 51)
        // ====================================================================

        /// <summary>
        /// Solves N-Queens and returns all distinct board arrangements as strings.
        /// Uses boolean arrays for readability and path materialization.
        /// </summary>
        public static List<List<string>> SolveNQueens(int n)
        {
            var result = new List<List<string>>();
            if (n <= 0) return result;

            int[] queens = new int[n]; // queens[row] = col
            bool[] cols = new bool[n];
            bool[] diag1 = new bool[2 * n - 1]; // row - col + (n - 1)
            bool[] diag2 = new bool[2 * n - 1]; // row + col

            SolveDfs(0, n, queens, cols, diag1, diag2, result);
            return result;
        }

        private static void SolveDfs(
            int row,
            int n,
            int[] queens,
            bool[] cols,
            bool[] diag1,
            bool[] diag2,
            List<List<string>> result)
        {
            if (row == n)
            {
                result.Add(MaterializeBoard(queens, n));
                return;
            }

            for (int col = 0; col < n; col++)
            {
                int d1 = row - col + (n - 1);
                int d2 = row + col;

                // Lookahead Pruning: Constant-time conflict detection
                if (cols[col] || diag1[d1] || diag2[d2])
                {
                    continue;
                }

                // CHOOSE
                queens[row] = col;
                cols[col] = true;
                diag1[d1] = true;
                diag2[d2] = true;

                // EXPLORE
                SolveDfs(row + 1, n, queens, cols, diag1, diag2, result);

                // UNCHOOSE (State Restoration)
                cols[col] = false;
                diag1[d1] = false;
                diag2[d2] = false;
            }
        }

        private static List<string> MaterializeBoard(int[] queens, int n)
        {
            var board = new List<string>(n);
            char[] rowChars = new char[n];

            for (int r = 0; r < n; r++)
            {
                Array.Fill(rowChars, '.');
                rowChars[queens[r]] = 'Q';
                board.Add(new string(rowChars));
            }

            return board;
        }

        // ====================================================================
        // 2. ULTRA-FAST BITWISE COUNTING ENGINE (LEETCODE 52)
        // ====================================================================

        /// <summary>
        /// Computes the total number of distinct solutions using scalar registers.
        /// Zero heap allocation during traversal; O(1) bitwise operations per step.
        /// </summary>
        public static int TotalNQueens(int n)
        {
            if (n <= 0) return 0;
            if (n == 1) return 1;
            if (n > 31) throw new ArgumentOutOfRangeException(nameof(n), "Exceeds 32-bit integer register width.");

            int allMask = (1 << n) - 1; // Bitmask of n ones
            return CountDfs(0, 0, 0, allMask);
        }

        private static int CountDfs(int cols, int diag1, int diag2, int allMask)
        {
            // All rows successfully assigned!
            if (cols == allMask)
            {
                return 1;
            }

            int count = 0;

            // 1. Bitwise OR gives all blocked columns
            // 2. Bitwise NOT inverts to get unblocked columns
            // 3. Bitwise AND with allMask bounds available slots to first N bits
            int available = ~(cols | diag1 | diag2) & allMask;

            // Loop through each available candidate slot
            while (available != 0)
            {
                // Isolate the lowest set bit in O(1) using Two's Complement
                int bit = available & (-available);

                // Clear lowest set bit in available pool
                available &= (available - 1);

                // RECURSE:
                // cols | bit: mark column as occupied
                // (diag1 | bit) << 1: shift major diagonals down-and-right
                // (diag2 | bit) >> 1: shift anti-diagonals down-and-left
                count += CountDfs(cols | bit, (diag1 | bit) << 1, (diag2 | bit) >> 1, allMask);
            }

            return count;
        }

        // ====================================================================
        // 3. SYMMETRIC ACCELERATED BITMASK SOLVER (2X SPEEDUP)
        // ====================================================================

        /// <summary>
        /// Solves N-Queens utilizing vertical reflectional symmetry.
        /// Evaluates only the left half of row 0 and doubles solutions.
        /// </summary>
        public static int TotalNQueensSymmetric(int n)
        {
            if (n <= 0) return 0;
            if (n == 1) return 1;

            int allMask = (1 << n) - 1;
            int totalSolutions = 0;

            // Half-board symmetry boundary
            int half = n / 2;

            for (int col = 0; col < half; col++)
            {
                int bit = 1 << col;
                int count = CountDfs(bit, bit << 1, bit >> 1, allMask);
                totalSolutions += count * 2; // Double mirror solutions!
            }

            // If N is odd, compute center column without doubling
            if ((n & 1) != 0)
            {
                int centerBit = 1 << half;
                totalSolutions += CountDfs(centerBit, centerBit << 1, centerBit >> 1, allMask);
            }

            return totalSolutions;
        }
    }

    /// <summary>
    /// Self-contained verification and comparative benchmarking harness.
    /// </summary>
    public static class Program
    {
        // Known sequence for N-Queens solutions (OEIS A000170)
        private static readonly int[] KnownSolutions = {
            0,      // N = 0
            1,      // N = 1
            0,      // N = 2
            0,      // N = 3
            2,      // N = 4
            10,     // N = 5
            4,      // N = 6
            40,     // N = 7
            92,     // N = 8
            352,    // N = 9
            724,    // N = 10
            2680,   // N = 11
            14200,  // N = 12
            73712,  // N = 13
            365596  // N = 14
        };

        public static void Main()
        {
            Console.WriteLine("====================================================================");
            Console.WriteLine("  WEEK 28 — DAY 191: N-QUEENS O(1) BITMASK & DIAGONAL INVARIANTS    ");
            Console.WriteLine("====================================================================\n");

            TestBoardMaterialization();
            TestKnownSequencesUpToN12();
            TestSymmetryEquivalence();
            RunHighOrderBenchmarkN14();

            Console.WriteLine("\n[SUCCESS] All N-Queens bitmask invariants, diagonal proofs, and benchmarks passed seamlessly!");
        }

        private static void TestBoardMaterialization()
        {
            Console.Write("Test 1: LeetCode 51 Board Materialization (N = 4)... ");

            var boards = NQueensBitmaskSolver.SolveNQueens(4);

            Debug.Assert(boards.Count == 2, $"Expected 2 boards for N=4, got {boards.Count}");

            // Verify each board has 4 rows and 1 queen per row
            foreach (var board in boards)
            {
                Debug.Assert(board.Count == 4);
                foreach (string row in board)
                {
                    Debug.Assert(row.Length == 4);
                    int qCount = 0;
                    foreach (char c in row) if (c == 'Q') qCount++;
                    Debug.Assert(qCount == 1, "Each row must contain exactly one Queen!");
                }
            }

            Console.WriteLine($"PASSED (Generated {boards.Count} valid boards)");
        }

        private static void TestKnownSequencesUpToN12()
        {
            Console.Write("Test 2: OEIS A000170 Sequence Validation (N = 1..12)... ");

            for (int n = 1; n <= 12; n++)
            {
                int count = NQueensBitmaskSolver.TotalNQueens(n);
                Debug.Assert(count == KnownSolutions[n],
                    $"Discrepancy at N={n}: Expected {KnownSolutions[n]}, got {count}");
            }

            Console.WriteLine("PASSED (All counts for N=1..12 match OEIS sequence exactly)");
        }

        private static void TestSymmetryEquivalence()
        {
            Console.Write("Test 3: Symmetric Bitmask Pruning Equivalence (N = 8, 9, 10)... ");

            foreach (int n in new[] { 8, 9, 10 })
            {
                int standard = NQueensBitmaskSolver.TotalNQueens(n);
                int symmetric = NQueensBitmaskSolver.TotalNQueensSymmetric(n);
                Debug.Assert(standard == symmetric,
                    $"Symmetry mismatch at N={n}: standard={standard}, symmetric={symmetric}");
            }

            Console.WriteLine("PASSED (Symmetric solver outputs bitwise identical counts)");
        }

        private static void RunHighOrderBenchmarkN14()
        {
            Console.WriteLine("\nTest 4: High-Order Performance Benchmark (N = 14 -> 365,596 Solutions)");

            // Warm up
            NQueensBitmaskSolver.TotalNQueens(8);

            // 1. Standard Bitmask
            var sw = Stopwatch.StartNew();
            int countStandard = NQueensBitmaskSolver.TotalNQueens(14);
            sw.Stop();
            long standardMs = sw.ElapsedMilliseconds;

            // 2. Symmetric Bitmask
            sw.Restart();
            int countSymmetric = NQueensBitmaskSolver.TotalNQueensSymmetric(14);
            sw.Stop();
            long symmetricMs = sw.ElapsedMilliseconds;

            Debug.Assert(countStandard == 365596);
            Debug.Assert(countSymmetric == 365596);

            Console.WriteLine($"  - Total Solutions Emitted:  {countStandard:N0}");
            Console.WriteLine($"  - Standard Bitmask Time:    {standardMs} ms");
            Console.WriteLine($"  - Symmetric Bitmask Time:   {symmetricMs} ms");
            Console.WriteLine($"  - Symmetry Acceleration:    {(double)standardMs / Math.Max(1, symmetricMs):F2}x speedup");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Complexity, Proofs & Performance Profile

### 3.1 Theorem & Formal Proof: Mathematical Invariance of Diagonals

#### Theorem
On an $N \times N$ discrete integer grid $\mathbb{Z}^2$:
1. A set of cells lies on the same major diagonal ($\backslash$, slope $+1$) if and only if $r - c = k_1$ for some constant $k_1 \in [-(N - 1), N - 1]$.
2. A set of cells lies on the same anti-diagonal ($/$, slope $-1$) if and only if $r + c = k_2$ for some constant $k_2 \in [0, 2N - 2]$.

#### Proof
1. **Major Diagonal Invariant:**
   The equation of a line with slope $m = +1$ passing through point $(r_0, c_0)$ in Cartesian coordinates is given by:
   $$r - r_0 = 1 \cdot (c - c_0) \implies r - c = r_0 - c_0$$
   Let two arbitrary cells be $A = (r_1, c_1)$ and $B = (r_2, c_2)$.
   $A$ and $B$ share a major diagonal $\iff \frac{r_2 - r_1}{c_2 - c_1} = 1 \iff r_2 - r_1 = c_2 - c_1 \iff r_2 - c_2 = r_1 - c_1$.
   Therefore, the quantity $r - c$ is strictly invariant for all cells on that diagonal.
   Adding $N - 1$ ensures that the mapped index $\text{diag1} = r - c + (N - 1)$ is strictly non-negative and bounded in $[0, 2N - 2]$.

2. **Anti-Diagonal Invariant:**
   The equation of a line with slope $m = -1$ passing through point $(r_0, c_0)$ is:
   $$r - r_0 = -1 \cdot (c - c_0) \implies r + c = r_0 + c_0$$
   $A$ and $B$ share an anti-diagonal $\iff \frac{r_2 - r_1}{c_2 - c_1} = -1 \iff r_2 - r_1 = -(c_2 - c_1) \iff r_2 + c_2 = r_1 + c_1$.
   Therefore, the quantity $r + c$ is strictly invariant for all cells on that diagonal.
   The sum ranges from $(0 + 0) = 0$ to $(N - 1) + (N - 1) = 2N - 2$.

$\blacksquare$ **Q.E.D.**

---

### 3.2 Proof: Diagonal Bit-Shift Invariant Across Successive Rows

#### Theorem
Let a queen be placed at column $c$ in row $r$, setting bit $b = 1 \ll c$. When advancing to row $r + 1$:
1. The threatened column for the major diagonal shifts to $c + 1$, represented by $b \ll 1$.
2. The threatened column for the anti-diagonal shifts to $c - 1$, represented by $b \gg 1$.

#### Proof
1. **Major Diagonal Shift:**
   The queen is at $(r, c)$. Its major diagonal satisfies $r' - c' = r - c$.
   At row $r' = r + 1$, substituting gives:
   $$(r + 1) - c' = r - c \implies c' = c + 1$$
   The threatened column in the next row is shifted right by $1$.
   In binary positional representation, advancing from index $c$ to $c + 1$ corresponds to shifting left by 1 bit: $1 \ll (c + 1) = (1 \ll c) \ll 1$.
   Therefore, shifting the accumulated major diagonal mask by 1 bit left ($\ll 1$) accurately projects all major diagonal threats onto row $r + 1$.

2. **Anti-Diagonal Shift:**
   The queen is at $(r, c)$. Its anti-diagonal satisfies $r' + c' = r + c$.
   At row $r' = r + 1$, substituting gives:
   $$(r + 1) + c' = r + c \implies c' = c - 1$$
   The threatened column in the next row is shifted left by $1$.
   In binary positional representation, shifting from index $c$ to $c - 1$ corresponds to shifting right by 1 bit: $1 \ll (c - 1) = (1 \ll c) \gg 1$.
   Therefore, shifting the accumulated anti-diagonal mask by 1 bit right ($\gg 1$) accurately projects all anti-diagonal threats onto row $r + 1$.

$\blacksquare$ **Q.E.D.**

---

### 3.3 Complexity Profile Across Architectures

| Approach | Time Complexity | Auxiliary Space | Pruning Cost per Candidate | CPU Memory Segment |
| :--- | :---: | :---: | :---: | :---: |
| **Naive Matrix Scan** | $\mathcal{O}(N! \cdot N^2)$ | $\mathcal{O}(N^2)$ board | $\mathcal{O}(N)$ loop over diagonals | Heap / Stack arrays |
| **Boolean Lookup Arrays** | $\mathcal{O}(N!)$ | $\mathcal{O}(N)$ stack + arrays | $\mathcal{O}(1)$ (3 array reads) | L1 Data Cache |
| **Bitwise Registers** | $\mathbf{\mathcal{O}(c^N)}$ | $\mathbf{\mathcal{O}(N)\text{ stack only}}$ | $\mathbf{\mathcal{O}(1)}$ (Single bitwise ALU instruction) | **CPU Registers (ALU)** |
| **Symmetric Bitwise** | $\mathbf{\mathcal{O}(0.5 \cdot c^N)}$ | $\mathbf{\mathcal{O}(N)\text{ stack only}}$ | $\mathbf{\mathcal{O}(1)}$ | **CPU Registers (ALU)** |

*Where $c \approx 2.54$ empirical branching factor with diagonal pruning.*

---

## 4. 🎬 DEMONSTRATE: Canonical Traces & Step-by-Step Executions

### 4.1 Step-by-Step Bitwise Trace for $N = 4$

All mask: $allMask = (1 \ll 4) - 1 = 1111_2 = 15$.

```
ROW 0: cols = 0000, diag1 = 0000, diag2 = 0000
  occupied  = 0000 | 0000 | 0000 = 0000
  available = ~0000 & 1111 = 1111_2 (Columns 0, 1, 2, 3 available)

  Branch 1: Try column 0 (bit = 0001)
    ROW 1: cols = 0001, diag1 = 0010 (0001 << 1), diag2 = 0000 (0001 >> 1)
      occupied  = 0001 | 0010 | 0000 = 0011_2
      available = ~0011 & 1111 = 1100_2 (Columns 2, 3 available)

      Sub-branch 1.1: Try column 2 (bit = 0100)
        ROW 2: cols = 0101, diag1 = 1100 ((0010|0100)<<1), diag2 = 0010 ((0000|0100)>>1)
          occupied  = 0101 | 1100 | 0010 = 1111_2
          available = ~1111 & 1111 = 0000_2  ===> PRUNED! (Zero slots available)

      Sub-branch 1.2: Try column 3 (bit = 1000)
        ROW 2: cols = 1001, diag1 = 0100 ((0010|1000)<<1 & 1111), diag2 = 0100 ((0000|1000)>>1)
          occupied  = 1001 | 0100 | 0100 = 1101_2
          available = ~1101 & 1111 = 0010_2 (Only column 1 available!)

          Sub-sub-branch 1.2.1: Try column 1 (bit = 0010)
            ROW 3: cols = 1011, diag1 = 1100, diag2 = 0011
              occupied  = 1011 | 1100 | 0011 = 1111_2
              available = ~1111 & 1111 = 0000_2 ===> PRUNED!

  Branch 2: Try column 1 (bit = 0010)
    ROW 1: cols = 0010, diag1 = 0100 (0010 << 1), diag2 = 0001 (0010 >> 1)
      occupied  = 0010 | 0100 | 0001 = 0111_2
      available = ~0111 & 1111 = 1000_2 (Only column 3 available!)

      Sub-branch 2.1: Try column 3 (bit = 1000)
        ROW 2: cols = 1010, diag1 = 1000 ((0100|1000)<<1 & 1111), diag2 = 0100 ((0001|1000)>>1)
          occupied  = 1010 | 1000 | 0100 = 1110_2
          available = ~1110 & 1111 = 0001_2 (Only column 0 available!)

          Sub-sub-branch 2.1.1: Try column 0 (bit = 0001)
            ROW 3: cols = 1011, diag1 = 0010 ((1000|0001)<<1 & 1111), diag2 = 0100 ((0100|0001)>>1)
              occupied  = 1011 | 0010 | 0100 = 1101_2
              available = ~1101 & 1111 = 0010_2 (Column 2 available!)

              Sub-sub-sub-branch 2.1.1.1: Try column 2 (bit = 0100)
                ROW 4: cols == 1111 (allMask)
                ===> SOLUTION 1 FOUND: [1, 3, 0, 2]!
```

---

## 5. 🏋️ PRACTICE: Progressive Rigorous Drills

### Drill 1: The N-Rooks Problem
- **Problem Statement:** Place $N$ non-attacking rooks on an $N \times N$ chessboard such that no two rooks share the same row or column (rooks do not attack diagonally).
- **Core Invariant:** Diagonal constraints vanish! Every solution is a pure permutation of $[0 \dots N-1]$.
- **Total Solutions:** Exactly $N!$.

---

### Drill 2: Super Queens / Amazon Problem
- **Problem Statement:** An **Amazon** is a chess piece that can move both like a Queen and like a Knight. Place $N$ non-attacking Amazons on an $N \times N$ board.
- **Invariants:**
  - Queen constraints: $cols$, $diag1$, $diag2$.
  - Knight constraints: Cell $(r, c)$ attacks $(r-2, c-1)$, $(r-2, c+1)$, $(r-1, c-2)$, and $(r-1, c+2)$.
  - Pruning: Maintain a knight attack bitmask projected from the previous two rows.

---

### Drill 3: Counting Solutions on Odd vs. Even Boards
- **Problem Statement:** Prove why $N = 2$ and $N = 3$ have exactly 0 solutions, while $N = 4$ has 2 solutions.
- **Analysis:**
  - For $N = 2$: Only $2! = 2$ column permutations: $(0, 1)$ and $(1, 0)$. Both have $|r_1 - r_0| = |c_1 - c_0| = 1$ (major/anti diagonal collision).
  - For $N = 3$: All $3! = 6$ permutations have diagonal collisions.

---

## 6. 🔗 CONNECT: Real-World Systems & Cross-Domain Mappings

### 6.1 VLSI Design: Crosstalk Noise Avoidance in Microchip Buses

In integrated circuit design (ASIC, FPGA):
- Parallel bus wires running on adjacent metal layers induce mutual capacitive and inductive crosstalk noise.
- The **Crossbar Routing Problem** assigns signals to wire tracks such that high-frequency switching lines are separated by physical distance and diagonal pitch.
- Solvers model wire routing as an extended $N$-Queens constraint matrix to ensure non-interfering signal propagation at gigahertz clock frequencies.

---

### 6.2 Computer Architecture: Crossbar Interconnect Packet Arbitration

In high-performance networking routers (Cisco, Juniper) and GPU multi-chip modules:
- A crossbar switch connects $N$ input ports to $N$ output ports.
- In each clock cycle, the crossbar arbiter must select a set of packet transfers such that no two packets share an input port, output port, or internal switching matrix collision.
- The arbiter executes bitwise $N$-Queens-like matching in specialized hardware registers to schedule wire transfers in under 1 nanosecond.

---

### 6.3 Chess Engines: Bitboards in Stockfish & AlphaZero

Modern chess engines represent the entire $8 \times 8$ board using 64-bit integer scalars (`ulong` bitboards):
- Ray attacks for sliders (Rooks, Bishops, Queens) are computed via bitwise shifts, Magic Bitboards, and hardware SIMD instructions (`PEXT` - Parallel Bits Extract).
- Our $N$-Queens bitmask propagation engine ($diag1 \ll 1, diag2 \gg 1$) is the direct theoretical foundation of chess engine sliding piece attack generators.

---

## 7. 🎯 Daily Checkpoint Questions

1. **Diagonal Indexing Formulas:** State the mathematical formulas mapping grid cell $(r, c)$ to its major diagonal index and anti-diagonal index on an $N \times N$ board. Why is the offset $+ (N - 1)$ necessary for major diagonals?
2. **Two's Complement Bit Isolation:** Explain how the bitwise operation `bit = available & (-available)` isolates the lowest set bit in a single instruction.
3. **Diagonal Shift Mechanics:** In our bitmask engine, why is the major diagonal mask shifted left (`diag1 << 1`) while the anti-diagonal mask is shifted right (`diag2 >> 1`) when advancing from row $r$ to row $r + 1$?
4. **State Restoration Invariance in Registers:** Why does the bitmask N-Queens engine require zero explicit `Unchoose` instructions (no bit clearing or array restoring) after returning from the recursive call?
5. **Symmetry Speedup:** How does vertical reflectional symmetry accelerate N-Queens solution counting by nearly $2\times$? What special case must be handled when $N$ is odd?

---

### 💡 Checkpoint Solutions

1. **Diagonal Formulas & Offset:**
   - Major diagonal: $\text{diag1} = r - c + (N - 1)$.
   - Anti-diagonal: $\text{diag2} = r + c$.
   - The offset $+ (N - 1)$ is required because the raw difference $r - c$ ranges from $-(N - 1)$ to $+(N - 1)$. Adding $N - 1$ translates this range to $[0, 2N - 2]$, allowing it to be indexed into a zero-based array or bitmask.
2. **Two's Complement Lowest Bit Isolation:**
   In Two's Complement binary representation, the negative of a number is formed by inverting all bits and adding 1: $-x = \sim x + 1$.
   When you invert $x$, all trailing zeros become ones, and the lowest set bit becomes zero.
   Adding 1 causes a carry ripple through the trailing ones until it reaches the lowest set bit, flipping it back to 1 and leaving all higher bits inverted.
   Performing bitwise AND $x \ \& \ (-x)$ cancels all higher bits (since they are inverted) and trailing zeros, leaving **only the single lowest set bit** active.
3. **Diagonal Bit Shifts:**
   - When advancing from row $r$ to row $r + 1$, a major diagonal slants downward and to the right, threatening column $c + 1$ in the new row. Moving from column index $c$ to $c + 1$ corresponds to shifting left by 1 bit in positional notation ($1 \ll (c + 1) = (1 \ll c) \ll 1$).
   - Conversely, an anti-diagonal slants downward and to the left, threatening column $c - 1$ in the new row. Moving from column index $c$ to $c - 1$ corresponds to shifting right by 1 bit ($1 \ll (c - 1) = (1 \ll c) \gg 1$).
4. **Zero-Cost Register Restoration:**
   The conflict masks `cols`, `diag1`, and `diag2` are passed **by value** into child activation frames. In the x64 calling convention, primitive integer arguments are passed in CPU registers (e.g., `RCX`, `RDX`, `R8`, `R9`). When a child recursive frame finishes and returns, the parent frame's CPU registers remain untouched, meaning the state is naturally restored in zero instructions without manual rollback operations.
5. **Symmetry Speedup & Odd Case:**
   A chessboard is symmetric across its vertical center axis. Every valid configuration with a queen at column $c$ in row 0 has an exact mirror-image solution with a queen at column $N - 1 - c$. By only exploring columns $0 \dots \lfloor N / 2 \rfloor - 1$ in row 0 and multiplying the count by 2, we eliminate nearly half the search tree. When $N$ is odd, the central column $c = N / 2$ is its own mirror image, so its search branch is evaluated separately without multiplying by 2.
