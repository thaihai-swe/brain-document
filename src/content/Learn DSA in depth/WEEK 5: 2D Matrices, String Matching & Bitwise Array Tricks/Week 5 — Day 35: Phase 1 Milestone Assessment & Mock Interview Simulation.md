---
title: "Week 5 — Day 35: Phase 1 Milestone Assessment & Mock Interview Simulation"
---

Congratulations on reaching **Day 35**!

Today marks the **completion of Phase 1 (Linear Data Structures & Core Algorithmic Techniques)**. Over the last 5 weeks and 35 consecutive days, you have systematically built an elite algorithmic foundation:
- **Weeks 1–3:** Array Memory Layouts, Pointer Coordination, Sliding Windows, Prefix Sums, and String CLR Internals.
- **Weeks 4–5:** Binary Search Invariants, Answer Spaces, Multi-Pointer Reductions, Interval Algebra, Sweep-Line, 2D Matrix Symmetries, Rabin-Karp, KMP Automata, and Register-Level Bit Manipulation.

Today is your **Phase 1 Capstone Assessment**. We conduct a full **90-minute Mock Interview Simulation** featuring two of the most famous and challenging problems in Big Tech technical screens:
1. **Problem 1 (Arrays & Binary Search, 45 min):** [LeetCode 4] Median of Two Sorted Arrays (Hard)
2. **Problem 2 (Strings & Sliding Window, 45 min):** [LeetCode 76] Minimum Window Substring (Hard)

---

## 1. 🎯 MOCK INTERVIEW STRUCTURE & SCORING RUBRIC

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* Day 35 is the **Phase 1 Capstone Milestone Assessment & Mock Interview Simulation**, conducting a rigorous 90-minute timed evaluation on benchmark Hard problems: LeetCode 4 (Median of Two Sorted Arrays) and LeetCode 76 (Minimum Window Substring).
  - *Core Invariants:* Phase 1 Mastery Invariants: Binary search on partition cut with $\max(\text{Left}) \le \min(\text{Right})$; Variable sliding window with frequency map and scalar match counters.
  - *Misconception Check:* In LeetCode 4, binary searching on the larger array causes index out-of-bounds calculations in the smaller array; you must always ensure $M \le N$ before initiating binary search.
- **2. WHY:**
  - *Bottleneck Solved:* Verifies candidate's complete readiness across all 8 core pillars of Phase 1 before ascending to linked structures and dynamic collections in Phase 2.
  - *Complexity Advantage:* Generates optimal solutions to LeetCode Hard problems ($O(\log(\min(M, N)))$ for Median, $O(M + N)$ for Minimum Window) under realistic interview pressure.
- **3. WHEN:**
  - *When to Choose / Signal Words:* Phase 1 graduation; evaluating readiness for senior engineering technical screens.
  - *When to Avoid / Failure Modes:* Failing to state the mathematical invariant or dry-running edge cases before coding.
- **4. WHERE:**
  - *Physical CLR Memory:* Full synthesis of Phase 1 memory models: CPU cache lines, LOH dynamics, string immutability, `Span<T>`, and zero-allocation stack registers.
  - *Production Systems:* Real-world engineering trade-off evaluations: memory footprint, GC pause latency, and algorithmic optimality.
- **5. WHO:**
  - *Spoken Script:* "Phase 1 established mastery over linear data structures, pointer coordination, search spaces, and string automata. I articulate invariants before writing code, write zero-allocation C# with defensive boundaries, and formally derive time and space trade-offs."
  - *Interviewer Evaluation Lens:* Evaluates candidate against the 4 Senior Hire signals: Invariant Discovery (25%), Algorithmic Optimality (25%), Production Code Quality (25%), and Edge-Case Tracing (25%).
- **6. HOW:**
  - *Cost Model:* 90-minute simulation (45 mins per Hard problem); passing bar $\ge 16/20$ points.
  - *State Transition Trace:* Exploration $\to$ Invariant Formulation $\to$ Production Implementation $\to$ Edge-Case Dry Run $\to$ Complexity Derivation.

### 1.1 Physical Mental Model: The Phase 1 Algorithmic Symphony

Phase 1 mastery synthesizes linear and multidimensional geometries into two fundamental physical mechanics:

```
1. MEDIAN OF TWO SORTED ARRAYS: THE DUAL CONVEYOR-BELT GUILLOTINE
   We have two parallel conveyor belts of sorted ingots (Array A of size M, Array B of size N).
   Goal: Drop a vertical partition blade across both belts so exactly half the elements are on the Left.

      Belt A (M = 4): [ 1 ,  3  |  8 ,  9 ]       PartitionX = 2 (Cut between 3 and 8)
                                │
      Belt B (M = 6): [ 2 ,  4 ,  7  |  10, 12, 14 ] PartitionY = 3 (Cut between 7 and 10)
                                │
                        [Guillotine Cut]
   Condition for Perfect Balance:
     maxLeftA (3) <= minRightB (10)  AND  maxLeftB (7) <= minRightA (8)
   Both conditions hold! The median is instantly max(3, 7) or average(max(3,7), min(8,10)).
   If maxLeftA > minRightB: The blade on Belt A is too far right -> shift left!

2. MINIMUM WINDOW SUBSTRING: THE ELASTIC CATERPILLAR
   String: " A  D  O  B  E  C  O  D  E  B  A  N  C ", Target: "ABC"
            [R expands rightward to swallow required letters...]
            [L -> R: "A D O B E C"] -> Window satisfies all target letters!
            [Now contract L rightward to shed dead weight...]
            "A" removed -> Window insufficient -> Expand R again!
            Dynamic Accordion: Expand right to satisfy; shrink left to minimize!
```

#### Memory Layout: Stack-Allocated Frequency Arrays vs. Heap Dictionaries

```
HEAP DICTIONARY (ANTI-PATTERN FOR ASCII):
Heap Pointers -> Dictionary Entry Nodes -> Cache misses across GC generations.

DIRECT STACK LOOKUP BUFFER (STACK-ALLOCATED int[128]):
Stack / L1 Cache:
Index:   [ 65 ('A') ]  [ 66 ('B') ]  [ 67 ('C') ] ... [ 127 ]
Value:  |     1      |     1      |     1      | ... |   0   |
Memory Address: Contiguous 512 bytes on Stack -> 0 Heap Allocations, 0 GC Pauses!
```

#### Step-by-Step State Evolution: Binary Search on Dual Partition
```
Step 1: Always binary search the SMALLER array (M <= N).
        Array A = [1, 3, 8], Array B = [7, 9, 10, 11]
        Range on A: [low = 0, high = 3]

Step 2: Probe midX = 1:
        cutA = 1 -> LeftA: [1],       RightA: [3, 8]
        cutB = (3+4+1)/2 - 1 = 3 -> LeftB: [7, 9, 10], RightB: [11]
        Compare: maxLeftB (10) <= minRightA (3) ? FALSE! (10 > 3)
        LeftB is too big -> We must take MORE from A and LESS from B -> low = midX + 1 = 2.

Step 3: Probe midX = 2:
        cutA = 2 -> LeftA: [1, 3],    RightA: [8]
        cutB = 4 - 2 = 2 -> LeftB: [7, 9],    RightB: [10, 11]
        Compare: maxLeftA (3) <= minRightB (10) [TRUE]
                 maxLeftB (9) <= minRightA (8)  [FALSE, 9 > 8] -> low = midX + 1 = 3.

Step 4: Probe midX = 3:
        cutA = 3 -> LeftA: [1, 3, 8], RightA: [+INF]
        cutB = 4 - 3 = 1 -> LeftB: [7],       RightB: [9, 10, 11]
        Compare: maxLeftA (8) <= minRightB (9)  [TRUE: 8 <= 9]
                 maxLeftB (7) <= minRightA (+INF) [TRUE: 7 <= +INF]
        Partition found in O(log(min(M, N)))!
```

Treat this simulation as a real onsite technical interview at Google, Meta, or Microsoft:

| Evaluation Dimension | Standard for "Strong Hire" (4/4) | Score (0–4) |
| :--- | :--- | :---: |
| **1. Problem Exploration & Clarification** | Asks about constraints, empty inputs, negative values, and confirms time/space requirements before writing code. | [ ] / 4 |
| **2. Invariant Formulation & Architecture** | States the mathematical invariant (e.g. partition cut balance, window validity) clearly before implementation. | [ ] / 4 |
| **3. Production Code Quality (C#)** | Writes clean, modular C# with descriptive variable names, zero redundant allocations, and overflow guards. | [ ] / 4 |
| **4. Dry-Run & Edge Case Verification** | Proactively walks through an example and edge cases (single elements, identical values, empty strings) without being prompted. | [ ] / 4 |
| **5. Complexity Derivation** | Derives exact Big-O time and space from first principles; explains trade-offs confidently. | [ ] / 4 |

**Passing Bar:** 16 / 20 points.

---

### 1.2 ⚙️ Core Operations Deep-Dive: Phase 1 Capstone Operations Synthesis

As the culmination of Phase 1, engineering candidates must synthesize the entire spectrum of linear data structures, pointer coordination invariants, binary search geometries, string automata, and register-level bitwise operations. Below is the definitive operational deep-dive governing the hardest algorithmic paradigms encountered in Tier-1 technical interviews.

```
====================================================================================================
                        PHASE 1 CAPSTONE SYNTHESIS ARCHITECTURE
====================================================================================================
               ┌────────────────────────────────────────────────────────┐
               │        ARBITRARY LINEAR / GEOMETRIC PROBLEM INPUT      │
               └───────────────────────────┬────────────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
 ┌───────────────┐                 ┌───────────────┐                 ┌───────────────┐
 │ DUAL-SEQUENCE │                 │SLIDING WINDOW │                 │ MULTI-POINTER │
 │PARTITION CUTS │                 │ & FREQUENCY   │                 │ & BIT REGIST. │
 └───────┬───────┘                 └───────┬───────┘                 └───────┬───────┘
         │                                 │                                 │
 ┌───────┴───────┐                 ┌───────┴───────┐                 ┌───────┴───────┐
 │• Binary Search│                 │• Variable Win │                 │• Water Trap   │
 │  on Cut i     │                 │  Match Scalar │                 │  Two-Pointer  │
 │• Virtual L/R  │                 │• ASCII Direct │                 │• FSM Registers│
 │  Sentinels    │                 │  Index Vector │                 │• XOR Low Bit  │
 └───────────────┘                 └───────────────┘                 └───────────────┘
====================================================================================================
```

---

#### Dimension 1: Operation Contract & Big-O Bounds

##### 1. Dual-Array Partition Cut (`FindMedianSortedArrays`)
- **Signature:** `double FindMedianSortedArrays(ReadOnlySpan<int> nums1, ReadOnlySpan<int> nums2)`
- **Pre-conditions:** Both `nums1` and `nums2` are sorted in non-decreasing order. Without loss of generality, let $M = \text{nums1.Length} \le N = \text{nums2.Length}$, and $M + N \ge 1$.
- **Post-conditions:** Returns the exact median as `double` in $O(\log(\min(M, N)))$ time and $O(1)$ auxiliary space without merging or mutating inputs.
- **Invariants:**
  1. *Equal Partition Balance:* Cut $i \in [0, M]$ in `nums1` strictly determines cut $j = \lfloor(M + N + 1)/2\rfloor - i$ in `nums2`.
  2. *Cross-Partition Order:* Valid partition requires $\max(L_1, L_2) \le \min(R_1, R_2)$, where $L_1 = nums1[i-1]$, $R_1 = nums1[i]$, $L_2 = nums2[j-1]$, $R_2 = nums2[j]$ with sentinels $L = -\infty$ if cut $= 0$ and $R = +\infty$ if cut $= \text{Length}$.

##### 2. Exact Multi-Character Sliding Window (`MinWindowSubstring`)
- **Signature:** `string MinWindow(ReadOnlySpan<char> s, ReadOnlySpan<char> t)`
- **Pre-conditions:** `s` and `t` are ASCII character spans with lengths $N \ge 0, M \ge 0$.
- **Post-conditions:** Returns the shortest contiguous substring of `s` containing all characters of `t` (including duplicate frequencies), or `""` if no such window exists, in $O(N + M)$ time and $O(1)$ auxiliary space ($O(\Sigma)$ where $\Sigma = 128$).
- **Invariants:**
  1. *Scalar Match Invariant:* `matchedCount` equals the exact number of distinct characters in `t` whose required count is fully satisfied in the current window $[L, R]$.
  2. *Contraction Monotonicity:* Left pointer $L$ advances if and only if `matchedCount == requiredDistinctCount`, discovering minimal local valid windows.

##### 3. Trapping Rain Water Two-Pointer Invariant (`TrapRainWater`)
- **Signature:** `int Trap(ReadOnlySpan<int> height)`
- **Pre-conditions:** `height` is non-null with length $N \ge 0$.
- **Post-conditions:** Returns the total volume of trapped water in $O(N)$ time and $O(1)$ auxiliary space.
- **Invariants:**
  1. *Elevation Dominance:* At any state $[L, R]$, trapped water at the lower elevation pointer is strictly bounded by that pointer's running maximum ($\text{leftMax}$ or $\text{rightMax}$) because the opposing boundary is guaranteed to be strictly greater than or equal to it.

##### Big-O Operational Complexity Matrix
| Operation | Time (Best) | Time (Avg) | Time (Worst) | Aux Space | Primary Computational Bottleneck |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **FindMedianSortedArrays** | $O(1)$ | $O(\log(\min(M, N)))$ | $O(\log(\min(M, N)))$ | $O(1)$ | Branch disambiguation & boundary sentinel evaluations |
| **MinWindowSubstring** | $O(N + M)$ | $O(N + M)$ | $O(N + M)$ | $O(\Sigma) = O(1)$ | Cache-resident frequency vector updates across ASCII table |
| **TrapRainWater** | $O(N)$ | $O(N)$ | $O(N)$ | $O(1)$ | Inward pointer convergence & running maximum updates |
| **SingleNumberII (Mod-3)** | $O(N)$ | $O(N)$ | $O(N)$ | $O(1)$ | Register ALU bitwise operations across 32-bit words |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
====================================================================================================
                        PHASE 1 ALGORITHMIC META-DECISION TREE
====================================================================================================
What is the structural typology and query nature of the problem?
   │
   ├─► [Two Sorted Arrays / Finding K-th Element or Median]
   │      └─► Is merging in O(M + N) too slow (strictly O(log(min(M, N))) required)?
   │             └─► YES: Binary Search on Partition Cut:
   │                        • Guarantee M <= N (swap if necessary).
   │                        • Low = 0, High = M.
   │                        • Mid i = Low + (High - Low) / 2; j = (M + N + 1) / 2 - i.
   │                        • Sentinels: L1=(i==0?-inf:nums1[i-1]), R1=(i==M?+inf:nums1[i])
   │                                    L2=(j==0?-inf:nums2[j-1]), R2=(j==N?+inf:nums2[j])
   │                        • IF L1 <= R2 AND L2 <= R1: Found valid partition!
   │                        • ELSE IF L1 > R2: High = i - 1 (cut i too far right).
   │                        • ELSE: Low = i + 1 (cut i too far left).
   │
   ├─► [Contiguous Substring / Subarray Satisfying Multi-Condition Constraints]
   │      └─► Can conditions be validated monotonically as window grows / shrinks?
   │             └─► YES: Two-Pointer Variable Sliding Window:
   │                        • Expand R: add char to window map; if map[c] == target[c], matched++.
   │                        • While matched == required:
   │                             - Update global minimum window [L, R].
   │                             - Shrink L: if map[c] == target[c], matched--; map[c]--; L++.
   │
   ├─► [Elevation / Bounded Volume Calculation on 1D Grid]
   │      └─► Does water trapped at cell i depend on min(maxLeft[i], maxRight[i]) - height[i]?
   │             └─► YES: Two-Pointer Inward Elevation Convergence:
   │                        • Left = 0, Right = N - 1; leftMax = 0, rightMax = 0.
   │                        • IF height[Left] <= height[Right]:
   │                             - leftMax = max(leftMax, height[Left]); water += leftMax - height[Left]; Left++.
   │                        • ELSE:
   │                             - rightMax = max(rightMax, height[Right]); water += rightMax - height[Right]; Right--.
   │
   └─► [Duplicate Cancellation / Single Element Isolation]
          └─► XOR Parity Reduction or Modulo-3 Register FSM.
====================================================================================================
```

---

#### Dimension 3: Visual ASCII State Transitions

##### Trace A: Dual Sorted Arrays Partition Cut (`nums1 = [1, 3]`, `nums2 = [2]`)
$M = 2, N = 1 \implies M > N \implies$ Swap inputs to ensure $M \le N$:
`nums1 = [2]` ($M = 1$), `nums2 = [1, 3]` ($N = 2$).
Total length: $M + N = 3$ (Odd). Half length: $\lfloor(1 + 2 + 1)/2\rfloor = 2$.
Search space for cut $i$ in `nums1`: $[\text{low}, \text{high}] = [0, 1]$.

```
Iteration 1:
- low = 0, high = 1 ==> i = 0 + (1 - 0) / 2 = 0
- j = 2 - i = 2 - 0 = 2

Partition Cut Inspection:
nums1 (len 1):  [ | 2 ]         ==> L1 = -inf,  R1 = 2
nums2 (len 2):  [ 1, 3 | ]      ==> L2 = 3,     R2 = +inf

Check Partition Invariants:
1. L1 <= R2 ? -inf <= +inf (TRUE)
2. L2 <= R1 ? 3 <= 2       (FALSE! L2 > R1 ==> Cut i is too far left!)

Update: low = i + 1 = 1.

Iteration 2:
- low = 1, high = 1 ==> i = 1
- j = 2 - 1 = 1

Partition Cut Inspection:
nums1 (len 1):  [ 2 | ]         ==> L1 = 2,     R1 = +inf
nums2 (len 2):  [ 1 | 3 ]       ==> L2 = 1,     R2 = 3

Check Partition Invariants:
1. L1 <= R2 ? 2 <= 3  (TRUE)
2. L2 <= R1 ? 1 <= +inf (TRUE)
===> VALID PARTITION DISCOVERED!

Median Derivation:
Total elements is ODD (3):
Median = max(L1, L2) = max(2, 1) = 2.0.
Result: 2.0. (Exact median of [1, 2, 3]).
```

---

##### Trace B: Variable Sliding Window State Machine (`s = "ADOBECODEBANC"`, `t = "ABC"`)
`requiredDistinct = 3` ('A', 'B', 'C'). Target frequencies: `{'A':1, 'B':1, 'C':1}`.

```
+----+----+---------+-------------------+---------+-------------------------------+
| R  |Char| Win Freq| Matched Condition | L Steps | Action / Recorded Result      |
+----+----+---------+-------------------+---------+-------------------------------+
| 0  | A  | A:1     | A sat (matched=1) | L=0     | Expand                        |
| 1  | D  | D:1     |                   | L=0     | Expand                        |
| 2  | O  | O:1     |                   | L=0     | Expand                        |
| 3  | B  | B:1     | B sat (matched=2) | L=0     | Expand                        |
| 4  | E  | E:1     |                   | L=0     | Expand                        |
| 5  | C  | C:1     | C sat (matched=3) | L=0     | VALID! Window [0..5] "ADOBEC" |
|    |    |         |                   |         | Shrink L: remove A -> match=2 |
|    |    |         |                   | L=1     | Best Len = 6 ("ADOBEC")       |
+----+----+---------+-------------------+---------+-------------------------------+
| 6  | O  | O:2     |                   | L=1     | Expand                        |
| 7  | D  | D:2     |                   | L=1     | Expand                        |
| 8  | E  | E:2     |                   | L=1     | Expand                        |
| 9  | B  | B:2     |                   | L=1     | Expand                        |
| 10 | A  | A:1     | A sat (matched=3) | L=1     | VALID! Window [1..10]         |
|    |    |         |                   | L=1..5  | Shrink D,O,B,E,C -> match=2   |
+----+----+---------+-------------------+---------+-------------------------------+
| 11 | N  | N:1     |                   | L=6     | Expand                        |
| 12 | C  | C:1     | C sat (matched=3) | L=6     | VALID! Window [6..12]         |
|    |    |         |                   | L=6..9  | Shrink O,D,E -> Win [9..12]   |
|    |    |         |                   |         | "BANC" (len 4 < len 6)!       |
|    |    |         |                   | L=9     | Best Len = 4 ("BANC")         |
+----+----+---------+-------------------+---------+-------------------------------+
Optimal Window: "BANC" (Length 4).
```

---

#### Dimension 4: Invariant Preservation Proof

##### 1. Mathematical Proof of Partition Cut Invariant for Median of Two Sorted Arrays
Let $A$ of size $M$ and $B$ of size $N$ be sorted arrays. Let $M \le N$.
We seek a partition dividing the combined multiset $A \cup B$ into two subsets $\mathcal{L}$ (Left) and $\mathcal{R}$ (Right) such that:
1. $|\mathcal{L}| = \lfloor (M + N + 1) / 2 \rfloor$
2. $|\mathcal{R}| = (M + N) - |\mathcal{L}|$
3. $\forall x \in \mathcal{L}, \forall y \in \mathcal{R}: x \le y \iff \max(\mathcal{L}) \le \min(\mathcal{R})$.

Let the cut in $A$ be index $i \in [0, M]$, splitting $A$ into $A[0 \dots i-1]$ and $A[i \dots M-1]$.
Let the cut in $B$ be index $j$, splitting $B$ into $B[0 \dots j-1]$ and $B[j \dots N-1]$.
To satisfy condition 1:
$$i + j = \left\lfloor \frac{M + N + 1}{2} \right\rfloor \implies j = \left\lfloor \frac{M + N + 1}{2} \right\rfloor - i$$
Since $0 \le i \le M$ and $M \le N$, $j$ is strictly bounded:
$$j \ge \left\lfloor \frac{M + N + 1}{2} \right\rfloor - M \ge \frac{2M + 1}{2} - M \ge 0$$
$$j \le \left\lfloor \frac{M + N + 1}{2} \right\rfloor \le \frac{2N + 1}{2} \le N$$
Thus $j \in [0, N]$ is always a valid index into $B$.

Since $A$ and $B$ are individually sorted:
- $\max(A[0 \dots i-1]) \le \min(A[i \dots M-1]) \iff L_1 \le R_1$
- $\max(B[0 \dots j-1]) \le \min(B[j \dots N-1]) \iff L_2 \le R_2$

Therefore, the global condition $\max(\mathcal{L}) \le \min(\mathcal{R})$ reduces strictly to the cross-conditions:
$$L_1 \le R_2 \quad \text{and} \quad L_2 \le R_1$$

**Monotonicity of Cross-Condition:**
As $i$ increases, $L_1 = A[i-1]$ increases monotonically, and $j$ decreases, causing $R_2 = B[j]$ to increase monotonically.
The difference function $f(i) = R_2(i) - L_1(i)$ is strictly non-increasing with respect to $i$.
By the Bolzano Intermediate Value / Discrete Monotonic Bisection Theorem:
- If $L_1 > R_2$, cut $i$ is too large; the valid cut must lie in $[0, i-1]$.
- If $L_2 > R_1$, cut $i$ is too small; the valid cut must lie in $[i+1, M]$.
- Exactly one valid interval $[i^*, j^*]$ exists.

Upon termination at valid cut $(i^*, j^*)$:
- If $M + N$ is odd, $|\mathcal{L}| = |\mathcal{R}| + 1$, so the median is $\max(L_1, L_2)$.
- If $M + N$ is even, $|\mathcal{L}| = |\mathcal{R}|$, so the median is $\frac{\max(L_1, L_2) + \min(R_1, R_2)}{2.0}$. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Archetype | Concrete Input Instance | Failure Mode / Danger | Defensive Guard & Mitigation |
| :--- | :--- | :--- | :--- |
| **Empty First Array in Median Search** | `nums1 = []`, `nums2 = [1]` | `IndexOutOfRangeException` when accessing `nums1[0]` or binary search on empty bounds | Handled automatically by $M \le N$: $M = 0 \implies \text{low}=0, \text{high}=0 \implies i=0, j=1$. $L_1 = -\infty, R_1 = +\infty$. Returns $nums2[0]$ immediately |
| **Identical Disjoint Magnitude Ranges** | `nums1 = [1, 2]`, `nums2 = [100, 101]` | Cut falls entirely at extreme boundaries ($i = 0$ or $i = M$) | Virtual sentinels $L_1 = -\infty$ when $i=0$ and $R_1 = +\infty$ when $i=M$ prevent out-of-bounds reads |
| **Both Singletons** | `nums1 = [2]`, `nums2 = [1]` | Binary search off-by-one; floating-point truncation | Enforce `(double)` cast before division: `(maxLeft + minRight) / 2.0` |
| **Target String Longer than Source** | `s = "a"`, `t = "aa"` | Sliding window expands to end without ever finding match; infinite loop | Early return `""` immediately if `s.Length < t.Length` |
| **Target String with Duplicate Chars** | `s = "BBA"`, `t = "AB"` | Match counter triggered prematurely before frequency matched | Decrement/increment `matchedCount` strictly when `windowFreq[c] == targetFreq[c]` |
| **Negative Values & Integer Min Bounds** | `nums = [-10^6, 10^6]` | Sentinel collision if using `-1` or `0` as sentinel | Use `int.MinValue` and `int.MaxValue` for partition sentinels |

---

---

### 🎤 Multi-Topic Spoken Synthesis Drill (≤ 60 Seconds)

#### Synthesis Drill: Phase 1 Capstone Synthesis
- **The Golden Hierarchy of Search:**
  - Unsorted, immutable $\implies$ Hash Table ($O(1)$ avg, $O(N)$ space).
  - Unsorted, mutable $\implies$ Linear Scan ($O(N)$ time, $O(1)$ space).
  - Sorted array $\implies$ Binary Search ($O(\log N)$ time, $O(1)$ space).
  - Monotonic predicate over range $\implies$ Binary Search on Answer ($O(N \log R)$).


## 2. 🥊 MOCK INTERVIEW PROBLEM 1: LeetCode 4 — Median of Two Sorted Arrays (Hard)

> Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the **median** of the two sorted arrays.
> The overall run time complexity should be **$O(\log(m + n))$**.
>
> **Constraints:**
> - $nums1.Length == m, \ nums2.Length == n$
> - $0 \le m \le 1000, \ 0 \le n \le 1000$
> - $1 \le m + n \le 2000$
> - $-10^6 \le nums1[i], nums2[i] \le 10^6$

---

### 2.1 The Mathematical Partition Cut Invariant

Attempting to merge the arrays takes $O(M + N)$ time, which violates the strict $O(\log(M + N))$ requirement.

#### The Core Insight:
The median divides a combined sorted collection into two equal halves (Left Half and Right Half) such that:
1. $\text{Size}(\text{Left Half}) == \text{Size}(\text{Right Half})$ (or Left has 1 more element if total size is odd).
2. Every element in the Left Half is $\le$ every element in the Right Half:
   $$\max(\text{Left Half}) \le \min(\text{Right Half})$$

Instead of merging, we perform a **Binary Search on the Partition Cut of the smaller array**!

```
nums1:  [ x1, x2 | x3, x4, x5 ]      <- Cut i divides nums1 into Left1 and Right1
nums2:  [ y1, y2, y3 | y4, y5 ]      <- Cut j divides nums2 into Left2 and Right2
```

#### The Invariant Formulas:
1. Always binary search on the **shorter** array (swap if $M > N$) to ensure $O(\log(\min(M, N)))$ runtime and guarantee that $j \ge 0$.
2. Total elements in Left Half:
   $$\text{halfLen} = \frac{m + n + 1}{2}$$
3. For any cut index $i \in [0 \dots m]$ in `nums1`, the cut index $j$ in `nums2` is fixed:
   $$\mathbf{j = \text{halfLen} - i}$$
4. The 4 boundary values around the cut:
   - $L_1 = (i == 0) \ ? \ -\infty : nums1[i - 1]$
   - $R_1 = (i == m) \ ? \ +\infty : nums1[i]$
   - $L_2 = (j == 0) \ ? \ -\infty : nums2[j - 1]$
   - $R_2 = (j == n) \ ? \ +\infty : nums2[j]$

#### The Valid Partition Condition:
The combined partition is valid if and only if:
$$\mathbf{L_1 \le R_2 \quad \text{and} \quad L_2 \le R_1}$$

- If $L_1 > R_2$: Cut $i$ in `nums1` is too far to the right $\implies$ move cut left: `hi = i - 1`.
- If $L_2 > R_1$: Cut $i$ in `nums1` is too far to the left $\implies$ move cut right: `lo = i + 1`.

Once valid:
- If total length $(m + n)$ is **odd**: $\text{Median} = \max(L_1, L_2)$.
- If total length $(m + n)$ is **even**: $\text{Median} = \frac{\max(L_1, L_2) + \min(R_1, R_2)}{2.0}$.

---

### 2.2 Production C# Implementation

```csharp
public class SolutionMedianSortedArrays {
    public double FindMedianSortedArrays(int[] nums1, int[] nums2) {
        // Invariant 1: Always binary search on the shorter array
        if (nums1.Length > nums2.Length) {
            return FindMedianSortedArrays(nums2, nums1);
        }

        int m = nums1.Length;
        int n = nums2.Length;
        int halfLen = (m + n + 1) / 2;

        int lo = 0;
        int hi = m;

        while (lo <= hi) {
            int i = lo + (hi - lo) / 2; // Cut in nums1
            int j = halfLen - i;        // Cut in nums2

            // Boundary elements with infinity guards
            int l1 = (i == 0) ? int.MinValue : nums1[i - 1];
            int r1 = (i == m) ? int.MaxValue : nums1[i];

            int l2 = (j == 0) ? int.MinValue : nums2[j - 1];
            int r2 = (j == n) ? int.MaxValue : nums2[j];

            if (l1 <= r2 && l2 <= r1) {
                // Perfect partition cut found!
                if ((m + n) % 2 != 0) {
                    return Math.Max(l1, l2); // Odd total length
                } else {
                    return (Math.Max(l1, l2) + Math.Min(r1, r2)) / 2.0; // Even total length
                }
            } else if (l1 > r2) {
                // Cut i is too far right; move left
                hi = i - 1;
            } else {
                // Cut i is too far left; move right
                lo = i + 1;
            }
        }

        throw new ArgumentException("Input arrays are not sorted.");
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $\mathbf{O(\log(\min(M, N)))}$ — binary search on the shorter array. With $M \le 1000$, $\log_2(1000) \approx 10$ iterations max!
- **Space Complexity:** **$O(1)$** — strictly scalar pointers and boundary variables.

---

## 3. 🥊 MOCK INTERVIEW PROBLEM 2: LeetCode 76 — Minimum Window Substring (Hard)

> Given two strings `s` and `t` of lengths `m` and `n` respectively, return the **minimum window substring** of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string `""`.
>
> **Constraints:**
> - $m == s.Length, \ n == t.Length$
> - $1 \le m, n \le 10^5$
> - `s` and `t` consist of uppercase and lowercase English letters.
> - Must run in **$O(m + n)$** time.

---

### 3.1 The Dynamic Sliding Window Invariant

This is the definitive benchmark problem for the **Variable-Size Sliding Window Pattern** (introduced in Week 2).

#### The State Machine:
1. **Target Frequency Map:** Count frequencies of all characters in `t`. Store in a fixed-size ASCII array `int[128] targetFreq`.
2. **Window Frequency Map:** Track character counts in the current window `s[left .. right]`: `int[128] windowFreq`.
3. **Match Counter:** Track `int matchedCount`, representing how many *unique characters* have satisfied their required frequency:
   $$\text{When } windowFreq[c] == targetFreq[c] \implies \text{matchedCount}++$$
4. **The Expansion-Contraction Invariant:**
   - **Expand Right:** Expand `right` pointer to include incoming characters until `matchedCount == totalUniqueInT` (window is valid).
   - **Shrink Left:** While the window is valid, record the minimum window length, then shrink `left` pointer to remove unneeded characters until the window becomes invalid again.

---

### 3.2 Production C# Implementation

```csharp
public class SolutionMinWindowSubstring {
    public string MinWindow(string s, string t) {
        if (string.IsNullOrEmpty(s) || string.IsNullOrEmpty(t) || s.Length < t.Length) {
            return string.Empty;
        }

        // Frequency table for target string t (ASCII 128)
        int[] targetFreq = new int[128];
        int uniqueTargetChars = 0;
        foreach (char c in t) {
            if (targetFreq[c] == 0) uniqueTargetChars++;
            targetFreq[c]++;
        }

        int[] windowFreq = new int[128];
        int matchedChars = 0;

        int minLen = int.MaxValue;
        int bestStart = 0;

        int left = 0;

        // Slide right pointer across string s
        for (int right = 0; right < s.Length; right++) {
            char rightChar = s[right];
            windowFreq[rightChar]++;

            // Did this character satisfy its requirement in t?
            if (targetFreq[rightChar] > 0 && windowFreq[rightChar] == targetFreq[rightChar]) {
                matchedChars++;
            }

            // Window is valid! Try to shrink left boundary to find minimum
            while (matchedChars == uniqueTargetChars) {
                int currentLen = right - left + 1;
                if (currentLen < minLen) {
                    minLen = currentLen;
                    bestStart = left;
                }

                char leftChar = s[left];
                windowFreq[leftChar]--;

                // If removing leftChar breaks validity
                if (targetFreq[leftChar] > 0 && windowFreq[leftChar] < targetFreq[leftChar]) {
                    matchedChars--;
                }

                left++; // Contract window
            }
        }

        return minLen == int.MaxValue ? string.Empty : s.Substring(bestStart, minLen);
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $\mathbf{O(M + N)}$ — constructing `targetFreq` takes $O(N)$; each character in `s` is visited at most twice (once by `right`, once by `left`). Total operations $\le 2M + N \implies O(M + N)$.
- **Space Complexity:** $\mathbf{O(1)}$ auxiliary space — two fixed `int[128]` frequency tables.

---

## 4. 🎓 PHASE 1 MASTER RETROSPECTIVE & READINESS SCORECARD

You have now completed **all 35 Days of Phase 1**.

### The 8 Pillars of Phase 1 Mastery:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 1 COMPLETE: THE 8 CORE PILLARS                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
  1. Memory Architecture & Amortization: CPU Cache lines, LOH, Span<T>, Dynamic Arrays
  2. Pointer Coordination: Opposite-ends (2Sum), Fast & Slow Reader/Writer (In-place)
  3. Continuous Windows & Accumulation: Fixed/Dynamic Sliding Window, Prefix Sum, Diff Arrays
  4. String Memory & Automata: UTF-16 Runes, Rabin-Karp Rolling Hash, KMP π-Automata
  5. Logarithmic Search Spaces: Exact match, Lower Bound, Rotated Arrays, Answer Spaces
  6. Multi-Pointer Reductions: 3Sum duplicate pruning, Trapping Rain Water Bounded-Min
  7. Interval Algebra & Sweep-Line: Start vs End sorting, 3-Phase Insert, Arrival/Departure Events
  8. 2D Coordinate Transformations: Transpose + Reverse, Spiral peeling, Saddleback search
```

---

## 5. 🎯 Phase 1 Capstone Questions

Test your permanent conceptual retention:

1. **Median of Two Sorted Arrays Invariant:** In LeetCode 4, why must we ensure $M \le N$ before starting the binary search? Name two distinct failure modes if $M > N$.
2. **Sliding Window Complexity Proof:** In LeetCode 76 (Minimum Window Substring), although there is a `while` loop nested inside a `for` loop, why is the overall time complexity strictly $O(M + N)$ and never $O(M^2)$?
3. **Partition Boundary Infinity Guards:** In LeetCode 4, why do we use `int.MinValue` when $i = 0$ and `int.MaxValue` when $i = m$? How does this prevent index-out-of-bounds branching?
4. **Answer Space vs Linear Scan:** Contrast the problem-solving philosophy of **Day 24 (Binary Search on Answer)** with **Day 26 (Interval Scheduling)**. How do their greedy choices differ?

---

### 🚀 What Lies Ahead in Phase 2 (Weeks 6–10)?
In Phase 2, we leave primitive arrays and strings to conquer **Linear Abstract Data Types (ADTs)**:
- **Linked Lists Mastery:** Singly, doubly, circular, Floyd's cycle proofs, and LRU cache internals.
- **Stacks & Queues:** Call stacks, Monotonic Stacks (Next Greater Element), Monotonic Deques (Sliding Window Max), and Shunting-Yard expression parsing.
- **Heaps & Priority Queues:** Linear-time `BuildHeap`, custom comparators, K-way merges, and streaming medians.
- **Tries (Prefix Trees):** Autocomplete architectures, bitwise XOR tries, and prefix matching.
