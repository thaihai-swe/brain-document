# 🚀 Week 5 — Day 34: Week 5 Integration & Timed Simulation

Welcome to **Day 34: Week 5 Integration & Timed Simulation**.

Over the past 5 days, you mastered advanced 2D coordinate geometry, string search automata, polynomial rolling hashes, and register-level bit manipulation:
- **Day 29:** 2D Matrix Transformations & In-Place Symmetries (Rotate 90°, Transpose, Spiral)
- **Day 30:** 2D Matrix Search Patterns (Virtual 1D Binary Search vs. Saddleback Search)
- **Day 31:** Rabin-Karp Rolling Hash & Polynomial Fingerprinting
- **Day 32:** KMP Pattern Matching & The $\pi$-Array (Prefix Failure Automata)
- **Day 33:** Bit Manipulation Basics & Array XOR Patterns

Today is your **Integration and Timed Practice Day**. We synthesize these paradigms, contrast their trade-offs under Big Tech interview conditions, and simulate two targeted medium-level interview problems under a strict 60-minute clock.

---

## 1. 🧠 RETROSPECTIVE: The Week 5 Pattern Contrast Matrix

Study this comparative matrix before starting the timed simulation:

| Pattern | Input Precondition | Key Signals / Problem Words | Time Complexity | Core Invariant to State in Interview |
| :--- | :--- | :--- | :---: | :--- |
| **In-Place Matrix Rotation** ([LC 48]) | $N \times N$ square matrix | Rotate 90° clockwise in $O(1)$ space | $O(N^2)$ | $\text{Rotate} = \text{Transpose} + \text{Reverse Rows}$. Swap `matrix[i][j]` with `matrix[j][i]` for all $j > i$. |
| **Spiral Traversal** ([LC 54], [LC 59]) | Arbitrary $M \times N$ matrix | Layer-by-layer peeling or matrix generation | $O(M \times N)$ | 4-boundary pointers (`top, bottom, left, right`). **Must guard Steps 3 and 4** with `if (top <= bottom)` and `if (left <= right)`. |
| **Virtual 1D Binary Search** ([LC 74]) | Globally sorted matrix (Row $0$ < Row $1$ < ...) | Search target in $O(\log(MN))$ | $O(\log(MN))$ | Virtual range $[0 \dots MN - 1]$. Project index: $\mathbf{r = mid / C, \ c = mid \% C}$. Zero memory overhead. |
| **Saddleback Search** ([LC 240], [LC 378]) | Rows and columns independently sorted | Search target in $O(M + N)$; count elements $\le mid$ | $O(M + N)$ | Start at top-right $(0, C-1)$. If $> target$, prune column (`c--`); if $< target$, prune row (`r++`). |
| **Rabin-Karp Rolling Hash** ([LC 28], [LC 187], [LC 1062]) | Strings / Substring matching | Find substring; repeated patterns; 2D grids | $O(N + M)$ avg | Polynomial base-$B$ hash. Slide window in $O(1)$ via $\big((H - S[\text{out}] \cdot B^{M-1}) \cdot B + S[\text{in}]\big) \pmod M$. |
| **KMP Pattern Matching** ([LC 28], [LC 459], [LC 214]) | Strings / Substring matching | Exact match; periodic strings; palindrome prefix | $O(N + M)$ worst | Deterministic prefix function $\pi[i]$. **Text pointer never moves backward**. Mismatch at $j$ jumps to $\pi[j-1]$. |
| **Bitwise XOR Stream** ([LC 136], [LC 268]) | Array with paired duplicates | Find single unique; missing integer in $[0 \dots N]$ | $O(N)$ | XOR is associative, commutative, and self-inverse ($A \oplus A = 0$). Eliminates hash tables down to $O(1)$ space. |
| **Bit-Mask Partitioning** ([LC 260]) | Array with two unique elements | Find two elements appearing once | $O(N)$ | $\text{xorAll} = A \oplus B$. Isolate lowest set bit with $X \ \& \ (-X)$. Partition array into two independent XOR streams. |

---

### Deep Dive: Rabin-Karp vs. KMP — When Does Each Win?

An interviewer may ask: *"Why would you choose Rabin-Karp over KMP, or vice-versa?"*

| Dimension | Rabin-Karp | KMP (Knuth-Morris-Pratt) |
| :--- | :--- | :--- |
| **Worst-Case Time** | $O(N \times M)$ on pathological hash collisions | **Guaranteed $O(N + M)$** under all inputs |
| **Space Overhead** | **$O(1)$** auxiliary space | $O(M)$ auxiliary space for $\pi$-table |
| **Multiple Patterns** | **Excellent:** Can check multiple patterns of same length simultaneously in $O(1)$ via a HashSet of pattern hashes | Poor: Requires Aho-Corasick automaton to handle multiple patterns |
| **2D Matrix Matching** | **Excellent:** Can compute 2D rolling hashes over subgrids | Inapplicable: Cannot easily generalize 1D failure functions to 2D |
| **Periodicity Analysis** | Poor: Cannot easily extract minimal repeating periods | **Excellent:** $\pi[N-1]$ directly provides minimal repeating periods ([LC 459]) |

---

## 2. ⏱️ TIMED SIMULATION DRILL (60 Minutes Total)

Simulate a Big Tech technical screen. Allocate **25–30 minutes per problem**:

---

### Challenge A (30 Mins): LeetCode 54 — Spiral Matrix (Medium)

> Given an `m x n` `matrix`, return all elements of the `matrix` in **spiral order**.
>
> **Constraints:**
> - $m == matrix.Length$
> - $n == matrix[i].Length$
> - $1 \le m, n \le 10$
> - $-100 \le matrix[i][j] \le 100$

#### The 60-Second Diagnostic:
- Matrix is non-square ($M \ne N$ possible).
- Layer-by-layer peeling requires 4 boundary pointers: `top = 0, bottom = m - 1, left = 0, right = n - 1`.
- When $M = 1$ (single row) or $N = 1$ (single column), backward sweeps will re-read elements if not guarded by `top <= bottom` and `left <= right`.

#### Production C# Implementation:
```csharp
public class SolutionSpiralSimulation {
    public IList<int> SpiralOrder(int[][] matrix) {
        var result = new List<int>();
        if (matrix == null || matrix.Length == 0) return result;

        int top = 0;
        int bottom = matrix.Length - 1;
        int left = 0;
        int right = matrix[0].Length - 1;

        while (top <= bottom && left <= right) {
            // 1. Traverse Right across top boundary
            for (int c = left; c <= right; c++) {
                result.Add(matrix[top][c]);
            }
            top++;

            // 2. Traverse Down along right boundary
            for (int r = top; r <= bottom; r++) {
                result.Add(matrix[r][right]);
            }
            right--;

            // 3. Traverse Left across bottom boundary (Guard against single-row duplicate)
            if (top <= bottom) {
                for (int c = right; c >= left; c--) {
                    result.Add(matrix[bottom][c]);
                }
                bottom--;
            }

            // 4. Traverse Up along left boundary (Guard against single-col duplicate)
            if (left <= right) {
                for (int r = bottom; r >= top; r--) {
                    result.Add(matrix[r][left]);
                }
                left++;
            }
        }

        return result;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(M \times N)$ — each element is added to the result exactly once.
- **Space Complexity:** $O(1)$ auxiliary space (excluding the output list).

---

### Challenge B (30 Mins): LeetCode 137 — Single Number II (Medium)

> Given an integer array `nums` where every element appears **three times** except for one, which appears **exactly once**. Find the single element and return it.
> You must implement a solution with a linear runtime complexity and use only **constant extra space**.
>
> **Constraints:**
> - $1 \le nums.Length \le 3 \times 10^4$
> - $-2^{31} \le nums[i] \le 2^{31} - 1$

#### The 60-Second Diagnostic:
1. **Why standard XOR fails:** If numbers appear 3 times, $x \oplus x \oplus x = x$ (they do not cancel to zero!).
2. **Modulo 3 Bit Counting:**
   - Every bit position across all numbers will have a sum of set bits equal to either $3k$ (if the unique number had a `0` at that bit) or $3k + 1$ (if the unique number had a `1` at that bit).
   - If we sum the bits at each of the 32 bit positions modulo 3, the result is the exact binary representation of the unique number!
3. **The Optimal Finite State Machine ($O(1)$ Space):**
   - We need to count set bits modulo 3 ($0 \to 1 \to 2 \to 0$).
   - A single bit cannot count to 2. We need **two bits** to represent 3 states:
     - State 0: `ones = 0, twos = 0` (0 times)
     - State 1: `ones = 1, twos = 0` (1 time)
     - State 2: `ones = 0, twos = 1` (2 times)
     - Reset: When incoming bit arrives at State 2 $\to$ resets to State 0!
   - State transition logic:
     - `ones = (ones ^ num) & ~twos;`
     - `twos = (twos ^ num) & ~ones;`

#### Production C# Implementation:
```csharp
public class SolutionSingleNumberII {
    public int SingleNumber(int[] nums) {
        int ones = 0; // Tracks bits that have appeared 1 time (mod 3)
        int twos = 0; // Tracks bits that have appeared 2 times (mod 3)

        foreach (int num in nums) {
            // Add num to ones; if it was already in twos, reset to 0
            ones = (ones ^ num) & ~twos;

            // Add num to twos; if it is now in ones, reset to 0
            twos = (twos ^ num) & ~ones;
        }

        // 'ones' holds the bits of the number that appeared exactly 1 time
        return ones;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — single pass over `nums`.
- **Space Complexity:** **$O(1)$ auxiliary space** — strictly two 32-bit integer registers (`ones`, `twos`).

---

## 3. 🔍 Common Interview Failure Modes & Root Cause Analysis

### Bug 1: Non-Square Spiral Duplicate Reading
- **Symptom:** On a $1 \times 4$ matrix `[[1, 2, 3, 4]]`, code outputs `[1, 2, 3, 4, 3, 2, 1]`.
- **Root Cause:** Step 1 increments `top` from $0 \to 1$, making `top > bottom`. Without an explicit `if (top <= bottom)` check before Step 3, the bottom loop runs in reverse on the same row.
- **Fix:** Always verify `top <= bottom` before Step 3, and `left <= right` before Step 4.

### Bug 2: Operator Precedence with Bit Shifts
- **Symptom:** `int mask = 1 << 20 - 1;` evaluates to `1 << 19` instead of $2^{20} - 1$ ($1,048,575$)!
- **Root Cause:** In C#, subtraction `-` has **higher operator precedence** than bit shift `<<`! So `1 << 20 - 1` is parsed as `1 << (20 - 1)`.
- **Fix:** Always explicitly parenthesize bit shifts: `(1 << 20) - 1`.

### Bug 3: Negative Remainder in Rolling Hashes
- **Symptom:** Rolling hash produces negative numbers, failing hash comparisons.
- **Root Cause:** In C#, `-5 % 10 = -5`.
- **Fix:** Universally wrap with `((val % MOD) + MOD) % MOD`.

### Bug 4: Subtraction Overflow in Comparers
- **Symptom:** Sorting `points` in LeetCode 452 fails with `-2147483648`.
- **Root Cause:** `a[0] - b[0]` overflows 32-bit signed integers.
- **Fix:** Always use `a[0].CompareTo(b[0])`.

---

## 4. 📈 Week 5 Milestone Audit & Confidence Scorecard

Evaluate your readiness across Week 5 competencies:

| Day | Topic | Can you code it in 15 mins without hints? | Invariant Understood? |
| :---: | :--- | :---: | :---: |
| **Day 29** | In-Place Matrix Rotation & Spiral Matrix | [ ] Yes | [ ] Yes |
| **Day 30** | Virtual 1D Binary Search & Saddleback Search | [ ] Yes | [ ] Yes |
| **Day 31** | Rabin-Karp Rolling Hash & Safe Modulo | [ ] Yes | [ ] Yes |
| **Day 32** | KMP Pattern Matching & The $\pi$-Array | [ ] Yes | [ ] Yes |
| **Day 33** | Bit Manipulation Basics & Array XOR | [ ] Yes | [ ] Yes |
| **Day 34** | Integration & Modulo-3 Bit State Machine | [ ] Yes | [ ] Yes |

---

## 5. 🎯 Capstone Checkpoint Questions

Before stepping into the Day 35 Phase 1 Milestone Assessment, test your mastery:

1. **State Machine Bit Derivation:** In LeetCode 137, trace the values of `ones` and `twos` when the stream of numbers is `[5, 5, 5]`. Show how the state resets to `(0, 0)` after the third 5.
2. **KMP vs Rabin-Karp Worst Case:** Construct a pathological input pair for `haystack` and `needle` that causes a naive Rabin-Karp implementation (without double-hashing) to degrade to $O(N \times M)$ time. Why does KMP remain strictly $O(N + M)$ on this same input?
3. **Saddleback Search vs Virtual 1D:** What single constraint in a 2D matrix allows you to upgrade from $O(M + N)$ Saddleback Search to $O(\log(M \times N))$ Virtual 1D Binary Search?
4. **Spiral Boundary Invariant:** In an $N \times N$ matrix where $N$ is odd (e.g. $3 \times 3$), how many full boundary cycles occur, and which pointer values identify the final center element?
