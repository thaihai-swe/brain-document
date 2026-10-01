---
title: "Week 4 — Day 28: Week 4 Integration & Timed Simulation"
---

Congratulations on completing the core content of **Week 4**!

Over the past 6 days, you mastered advanced search spaces, multidimensional reductions, and timeline geometry:
- **Day 22:** Binary Search Invariants, Overflow Safety & Lower Bound
- **Day 23:** Modified Binary Search (Rotated Arrays & Gradient Peak Finding)
- **Day 24:** Binary Search on Monotone Answer Space (Feasibility Functions)
- **Day 25:** Multi-Pointer Reductions (3Sum, 3Sum Closest & Trapping Rain Water)
- **Day 26:** Interval Algebra (Sorting, Merging & Greedy Scheduling)
- **Day 27:** Sweep-Line & Event-Driven Concurrency (Arrivals +1, Departures -1)

Today is your **Integration, Contrast, and Timed Simulation Day**. The goal is to develop instinctive pattern recognition under time pressure so you can diagnose the optimal approach within 30–60 seconds in a Big Tech interview.

---

## 1. 🧠 RETROSPECTIVE: The Week 4 Pattern Contrast Matrix

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* Day 28 is the **Week 4 Integration, Contrast & Timed Simulation Module**, evaluating pattern diagnosis across Logarithmic Search, Multi-Pointer Reductions, and Interval Geometry.
  - *Core Invariants:* Diagnostic Decision Invariant: Sorted target lookup $\implies$ Binary Search ($O(\log N)$); Monotonic optimization threshold $\implies$ Binary Search on Answer ($O(N \log(\text{Range}))$); Overlapping intervals $\implies$ Sort by Start ($O(N \log N)$); Compatible non-overlapping scheduling $\implies$ Sort by End ($O(N \log N)$); Peak concurrency $\implies$ Sweep-Line.
  - *Misconception Check:* Candidates frequently confuse interval merging with interval scheduling. Merging requires start-time sorting; scheduling (maximizing non-overlapping events) requires end-time sorting.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates pattern misdiagnosis and hesitation under strict technical interview time pressure.
  - *Complexity Advantage:* Selects the optimal algorithmic paradigm within 30–60 seconds of hearing the problem statement.
- **3. WHEN:**
  - *When to Choose / Signal Words:* Week 4 capstone timed simulation; technical interview simulation testing speed and accuracy.
  - *When to Avoid / Failure Modes:* Do not proceed to implementation before stating the core invariant and confirming complexity targets with the interviewer.
- **4. WHERE:**
  - *Physical CLR Memory:* Zero-allocation registers, in-place interval manipulation, and cache-conscious event buffers.
  - *Production Systems:* Resource allocation schedulers, real-time query optimization planners.
- **5. WHO:**
  - *Spoken Script:* "Week 4 expands algorithmic search and geometry: we use binary search on answer when feasibility is monotonic; sort by start time to merge intervals; sort by end time to schedule intervals; and convert intervals to +/-1 point events for concurrent timeline sweep."
  - *Interviewer Evaluation Lens:* Assesses speed of diagnostic pattern recognition, code cleanliness, boundary condition handling, and verbal articulation.
- **6. HOW:**
  - *Cost Model:* 60-minute timed simulation drill (25–30 mins per challenge: LeetCode 1283 and LeetCode 435).
  - *State Transition Trace:* Problem Prompt $\to$ Monotonicity / Geometry Check $\to$ Invariant Selection $\to$ Implementation $\to$ Verification.


### 1.1 Physical Mental Model: The Grand Geometric & Logarithmic Arena

Week 4 arms you with four high-precision physical mechanisms for non-linear search and multi-interval geometry:

```
       ======================================================================
         PHYSICAL ANALOGY: THE 4 GEOMETRIC & LOGARITHMIC MECHANICS
       ======================================================================

       1. THE BISECTION GUILLOTINE (Binary Search: Half-Open [L, R))
          - Target <= nums[mid]: Slice right half away (R = mid).
          - Target >  nums[mid]: Slice left half away (L = mid + 1).
          - Terminates precisely when L == R on the exact lower bound!

       2. THE FEASIBILITY HORIZON DIAL (Binary Search on Answer)
          - Capacity knob [10 .. 55 tons]: [ F, F, F, F, T, T, T, T ]
          - Monotonicity guarantee: If capacity X works, all X+1 work too!
          - Bisection finds the first 'T' transition point in O(N log(Range)).

       3. THE WET PAINT ROLLER (Interval Merge: Sort by Start)
          - Start meeting at time 1. Next meeting at time 2 (paint still wet!).
          - Stretch active boundary: end = max(end1, end2).
          - Dry paint triggers new interval emission!

       4. THE TURNSTILE CLICKER (Sweep-Line Concurrency: Exit before Enter)
          - Intervals decouple into +1 (Arrival) and -1 (Departure) clicks.
          - Track running tally to find the highest room occupancy peak.
```

---

Study this diagnostic synthesis before beginning the timed simulation:

| Pattern | Input Precondition | Objective / Signal | Time Complexity | Core Invariant to State in Interview |
| :--- | :--- | :--- | :---: | :--- |
| **Lower Bound / First True** ([LC 35], [LC 34]) | Sorted array | First element satisfying $nums[i] \ge T$ | $O(\log N)$ | Half-open $[left, right)$; if True: $right = mid$; if False: $left = mid + 1$. Terminates at $left == right$. |
| **Rotated Binary Search** ([LC 33], [LC 153]) | Cyclically shifted sorted array | Find target or minimum element | $O(\log N)$ | For any $mid$, at least one half is strictly sorted. Compare with $nums[right]$ to locate the inflection cliff. |
| **Gradient Peak Finding** ([LC 162]) | Unsorted array | Find any local maximum | $O(\log N)$ | If $nums[mid] < nums[mid+1]$, an uphill walk to the right is guaranteed to encounter a peak. |
| **Binary Search on Answer** ([LC 875], [LC 1011], [LC 410]) | Unsorted array; numerical answer range | Minimize maximum threshold (capacity, speed, days) | $O(N \log(\text{Range}))$ | Feasibility predicate $P(x)$ is monotonic ($P(x) \implies P(x+1)$). Search domain $[lo, hi]$ is inherently sorted. |
| **Multi-Pointer Reduction** ([LC 15], [LC 42]) | Discrete array elements; pairs / triplets / boundaries | Find combinations summing to target; trapped volume | $O(N^2)$ (3Sum) / $O(N)$ (Water) | Sort + fix anchor reduces $O(N^K) \to O(N^{K-1})$. In water trapping, the shorter boundary maximum dictates the ceiling. |
| **Interval Merging** ([LC 56]) | Range pairs $[start, end]$ | Consolidate overlapping intervals | $O(N \log N)$ | **Sort by START**. Extend boundary: $cur.end = \max(cur.end, next.end)$. |
| **Interval Scheduling** ([LC 435], [LC 452]) | Competing range pairs $[start, end]$ | Maximize compatible intervals / Min removals | $O(N \log N)$ | **Sort by END**. Earliest finish time leaves maximal remaining time for future events (Greedy Stays Ahead). |
| **Sweep-Line Events** ([LC 253], [LC 732]) | Timelines with resource allocations | Peak concurrent resource demand | $O(N \log N)$ | Decouple intervals into $+1$ (Arrival) and $-1$ (Departure). **Process departures before arrivals on timestamp ties**. |

---

### 1.2 ⚙️ Core Operations Deep-Dive: Binary Search & Interval Scheduling Operational Synthesis

#### Dimension 1: Operation Contract & Big-O Bounds

##### Operational Primitives (`SmallestDivisor`, `FindMinArrowShots`, `EraseOverlapIntervals`)
- **Signatures:**
  - `public int SmallestDivisor(int[] nums, int threshold)`: Monotone parameter bisection over $[1, \max(nums)]$ in $O(N \log(\max N))$ time and $O(1)$ space.
  - `public int FindMinArrowShots(int[][] points)`: Sort-by-end greedy interval stabbing with overflow-safe comparator in $O(N \log N)$ time and $O(1)$ space.
  - `public int EraseOverlapIntervals(int[][] intervals)`: Greedy earliest finish time scheduling in $O(N \log N)$ time and $O(1)$ space.
- **Preconditions:**
  - Coordinate values span full 32-bit signed integer range $[-2^{31}, 2^{31}-1]$.
  - Divisors are strictly positive integers ($D \ge 1$).
- **Postconditions:**
  - `SmallestDivisor` yields the unique minimum integer $D$ such that $\sum_{i} \lceil nums[i] / D \rceil \le threshold$.
  - `FindMinArrowShots` determines the minimal cardinality of stabbed points, equal to maximum number of mutually disjoint intervals.
- **Complexity Bounds:**

| Week 4 Archetype | Sorting Key | Decision Invariant | Auxiliary Space | Vulnerability Mode |
| :--- | :--- | :--- | :--- | :--- |
| **Interval Consolidation (Merge)** | **Sort by START** | Extend boundary if $S_{next} \le E_{curr}$ | $O(N)$ output | Truncating contained intervals |
| **Interval Scheduling (Erase)** | **Sort by END** | Discard if $S_{next} < E_{curr}$ | $O(1)$ | Sorting by start breaks greedy choice |
| **Arrow Stabbing (Points)** | **Sort by END** | Shoot at $E_{curr}$, skip $S_{next} \le E_{curr}$ | $O(1)$ | Integer subtraction comparator overflow |
| **Monotone Feasibility (Answer BS)**| Domain $[lo, hi]$ | If $P(mid) \le T \implies hi = mid$ | $O(1)$ | Floating-point division precision drift |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
               Week 4 Algorithmic Meta-Diagnostic Selector
                                    │
                  [What is the fundamental query geometry?]
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
  [Numerical Parameter]    [Mutually Exclusive Sets]   [Consolidating Spans]
         │                          │                          │
  [Is f(x) monotonic?]       [Minimize removals /       [Merge overlapping
   ┌─────┴─────┐              arrows to pierce]          subsegments]
   ▼           ▼                    │                          │
  YES          NO             [SORT BY END]             [SORT BY START]
   │           │                    │                          │
[Binary     [Linear /         [Greedy Stays             [Extend right:
 Search on   Backtracking]     Ahead: Earliest           cur.end =
 Answer]                       deadline finish]          Max(cur.end, next.end)]
```

```
           Greedy Balloon Piercing Flow (LeetCode 452)
                                │
               [Sort points by point[1] via CompareTo]
                                │
                 [Init: arrows = 1, arrowPos = points[0][1]]
                                │
                   [For i = 1 to points.Length - 1]
                                │
                 [points[i][0] > arrowPos?]
                ┌───────────────┴───────────────┐
                ▼                               ▼
               YES                              NO
                │                               │
       (Balloon starts AFTER           (Balloon overlaps current
        arrow; requires NEW             arrow; BURST AUTOMATICALLY!)
        arrow!)                                 │
                │                               (Skip without arrow)
       [arrows++]                               │
       [arrowPos = points[i][1]]                │
                │                               │
                └───────────────┬───────────────┘
                                ▼
                         (Next Balloon)
                                │
                                ▼
                         [Return arrows]
```

---

#### Dimension 3: Visual ASCII State Transitions

##### Greedy Stays Ahead: Shooting Balloons Sorted by End Coordinate
```
Input: points = [ [10, 16], [2, 8], [1, 6], [7, 12] ]

Step 1: Sort by end coordinate (Safe CompareTo):
B0: [ 1,  6 ]
B1: [ 2,  8 ]
B2: [ 7, 12 ]
B3: [ 10, 16 ]

Step 2: First arrow shot at B0.end (Coordinate = 6)
Arrow 1 at X = 6:
B0: [ 1 ────── 6 ]  ──► BURST!
B1:   [ 2 ──────── 8 ]  ──► Starts at 2 <= 6 ──► BURST!
B2:          [ 7 ───── 12 ] ──► Starts at 7 > 6 ──► MISS! Requires new arrow.

Step 3: Second arrow shot at B2.end (Coordinate = 12)
Arrow 2 at X = 12:
B2:          [ 7 ───── 12 ] ──► BURST!
B3:               [ 10 ──── 16 ] ──► Starts at 10 <= 12 ──► BURST!

Result: Exactly 2 arrows pierce all 4 balloons.
```

---

#### Dimension 4: Invariant Preservation Proof

##### Theorem (Greedy Stays Ahead for Interval Scheduling):
Sorting intervals by end coordinate and greedily selecting each non-overlapping interval with the earliest finish time maximizes the number of mutually compatible intervals.

##### Proof by Induction on Schedule Size:
1. Let greedy schedule be $G = (g_1, g_2, \dots, g_k)$ sorted by finish time.
2. Let any optimal schedule be $O = (o_1, o_2, \dots, o_m)$ sorted by finish time.
3. **Inductive Claim:** For all $r \le k$, $end(g_r) \le end(o_r)$.
4. **Base Case ($r = 1$):**
   The algorithm selects $g_1$ as the interval with the absolute minimal finish time across all available intervals.
   Therefore, $end(g_1) \le end(o_1)$ by construction.
5. **Inductive Step:**
   - Assume $end(g_{r-1}) \le end(o_{r-1})$.
   - By definition of a valid schedule, interval $o_r$ is compatible with $o_{r-1}$:
     $$start(o_r) \ge end(o_{r-1}) \ge end(g_{r-1})$$
   - Thus, $o_r$ starts after $g_{r-1}$ finishes, meaning $o_r$ is a valid compatible candidate available to the greedy algorithm at step $r$.
   - Because the greedy algorithm selects the interval with the smallest finish time among all compatible candidates, it follows that:
     $$end(g_r) \le end(o_r)$$
6. **Optimality Conclusion:**
   Since each greedy choice finishes no later than the corresponding optimal choice, greedy can never "run out" of room before optimal. If optimal had $m > k$ intervals, interval $o_{k+1}$ would be compatible with $g_k$, and greedy would have selected at least one more interval.
   Thus $k \ge m \implies k = m$. The greedy schedule is globally optimal. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Scenario | Concrete Input | Danger / Failure Mode | Invariant Protection Mechanism |
| :--- | :--- | :--- | :--- |
| **Integer Subtraction Comparator Overflow** | `[-2147483648, 2147483647]` | `a[1] - b[1]` wraps around signed 32-bit int | Use `a[1].CompareTo(b[1])` to guarantee mathematically correct sign comparisons. |
| **Balloons Touching at Single Coordinate** | `[[1, 2], [2, 3]]` | Double counting arrows | Condition `points[i][0] > arrowPos` treats $2 > 2$ as false; single arrow at 2 bursts both balloons. |
| **All Balloons Completely Disjoint** | `[[1, 2], [3, 4], [5, 6]]` | Missed increment | Every start exceeds previous end; requires exactly $N$ arrows. |
| **Single Balloon ($N = 1$)** | `[[10, 20]]` | Loop skips execution | Initialized with `arrows = 1`; loop terminates immediately; returns 1. |
| **Divisor Calculation Overflow** | `num = 10^9, divisor = 10^9` | `(num + divisor - 1)` overflows 32-bit int | Cast to 64-bit: `((long)num + divisor - 1) / divisor`. |

---

---

### 🎤 Multi-Topic Spoken Synthesis Drill (≤ 60 Seconds)

#### Synthesis Drill: Binary Search on Index vs. Binary Search on Answer Space
- **Binary Search on Index:** Physical array is sorted; search bounds are $[0 \dots N-1]$; $O(\log N)$.
- **Binary Search on Answer:** Solution space exhibits monotonic feasibility ($P(x)$ flips once); search bounds are $[\min\_ans \dots \max\_ans]$; feasibility predicate `IsValid(mid)` is $O(N)$, total time $O(N \log(	ext{Range}))$. (Signals: *Koko Eating Bananas, Capacity to Ship Packages*).


## 2. ⏱️ TIMED SIMULATION DRILL (60 Minutes Total)

Simulate a realistic Big Tech interview round:
- **Rules:** Close all tabs, hints, and IDE auto-complete. Write the code cleanly from scratch. Allocate **25–30 minutes per problem**.

---

### Challenge A (30 Mins): LeetCode 1283 — Find the Smallest Divisor Given a Threshold (Medium)

> Given an array of integers `nums` and an integer `threshold`, we will choose a positive integer `divisor`, divide all the array by it, and sum the division's result. Find the **smallest divisor** such that the result mentioned above is **less than or equal to** `threshold`.
> Each result of division is rounded to the nearest integer greater than or equal to that element (e.g. $7 / 3 = 3$, $10 / 2 = 5$).
>
> **Constraints:**
> - $1 \le nums.Length \le 5 \times 10^4$
> - $1 \le nums[i] \le 10^6$
> - $nums.Length \le threshold \le 10^6$

#### The 60-Second Interview Diagnostic:
1. **Goal:** *"Find the SMALLEST divisor..."* $\implies$ Minimization problem.
2. **Monotonicity:** As the `divisor` increases, each term $\lceil nums[i] / divisor \rceil$ decreases or stays the same, so the total sum monotonically **decreases**.
   - If divisor $D$ yields a sum $\le threshold$, any larger divisor $D + 1$ will also yield a sum $\le threshold$.
   - **Monotonic Feasibility Confirmed!** $\implies$ **Binary Search on Answer Space**.
3. **Search Bounds:**
   - $lo = 1$ (smallest positive integer divisor).
   - $hi = \max(nums)$ (any divisor $\ge \max(nums)$ turns every element into $1$, producing sum $= nums.Length \le threshold$).

#### Production C# Implementation:
```csharp
public class SolutionSmallestDivisor {
    public int SmallestDivisor(int[] nums, int threshold) {
        int lo = 1;
        int hi = 0;
        foreach (int num in nums) {
            if (num > hi) hi = num;
        }

        // Half-open binary search [lo, hi] for First True
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;

            if (CalculateSum(nums, mid) <= threshold) {
                hi = mid; // Sum is small enough; try to find a smaller divisor
            } else {
                lo = mid + 1; // Sum is too large; divisor must be increased
            }
        }

        return lo;
    }

    private int CalculateSum(int[] nums, int divisor) {
        int sum = 0;
        foreach (int num in nums) {
            // Pure integer ceiling division: ceil(A / B) = (A + B - 1) / B
            sum += (num + divisor - 1) / divisor;
        }
        return sum;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N \log(\max(nums)))$. With $\max(nums) \le 10^6$, $\log_2(10^6) \approx 20$ iterations $\times 5 \times 10^4$ elements $= 10^6$ operations $\approx 5\text{ms}$ runtime!
- **Space Complexity:** $O(1)$ auxiliary space.

---

### Challenge B (30 Mins): LeetCode 452 — Minimum Number of Arrows to Burst Balloons (Medium)

> There are spherical balloons taped to a flat wall that represents the XY-plane. The balloons are represented as a 2D integer array `points` where `points[i] = [x_start, x_end]`.
> An arrow can be shot up exactly vertically (in the positive Y-direction) from different points along the X-axis. A balloon with $[x_{start}, x_{end}]$ is burst by an arrow shot at $x$ if $x_{start} \le x \le x_{end}$. There is no limit to the number of arrows that can be shot.
> Return the **minimum number of arrows** that must be shot to burst all balloons.
>
> **Constraints:**
> - $1 \le points.Length \le 10^5$
> - $-2^{31} \le x_{start} < x_{end} \le 2^{31} - 1$

#### The 60-Second Interview Diagnostic:
1. **Geometric Formulation:** Each balloon is an interval on the X-axis. One arrow at coordinate $X$ pierces all intervals containing $X$.
2. **Reduction:** To pierce the maximum number of overlapping intervals with a single arrow, where should we shoot?
   - If we sort intervals by **end coordinate**, the first balloon $B_0$ must be pierced.
   - The greedy choice is to shoot the arrow at the **latest possible coordinate** that still hits $B_0$, which is **$B_0.end$**!
   - This single arrow will also pierce every subsequent balloon whose `start` $\le B_0.end$.
   - Any balloon whose `start` $> B_0.end$ cannot be pierced by this arrow and requires a new arrow.
3. **The Subtraction Trap:** Look at the constraints: $-2^{31} \le x_{start} < x_{end} \le 2^{31} - 1$.
   - If you write `Array.Sort(points, (a, b) => a[1] - b[1])`, evaluating $(-2 \times 10^9) - (2 \times 10^9)$ **overflows 32-bit signed integers** into a positive number, completely corrupting the sort!
   - **Must use:** `a[1].CompareTo(b[1])`.

#### Production C# Implementation:
```csharp
public class SolutionFindMinArrowShots {
    public int FindMinArrowShots(int[][] points) {
        if (points == null || points.Length == 0) return 0;

        // Step 1: Sort by end coordinate ascending using CompareTo to prevent overflow
        Array.Sort(points, (a, b) => a[1].CompareTo(b[1]));

        int arrows = 1;
        int currentArrowPos = points[0][1];

        // Step 2: Greedy piercing pass
        for (int i = 1; i < points.Length; i++) {
            // If the next balloon starts strictly after current arrow position -> need new arrow
            if (points[i][0] > currentArrowPos) {
                arrows++;
                currentArrowPos = points[i][1]; // Shoot new arrow at this balloon's end
            }
            // Else: Balloon is already pierced by the current arrow!
        }

        return arrows;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N \log N)$ — dominated by sorting.
- **Space Complexity:** $O(1)$ auxiliary memory (ignoring sorting recursion stack).

---

## 3. 🔍 Common Interview Failure Modes & Root Cause Analysis

Review these 4 classic bugs that eliminate candidates in Big Tech interviews:

### Bug 1: The Infinite Loop in Binary Search
- **Cause:** Writing `left = mid` in a Lower Bound search where `mid = left + (right - left) / 2`.
- **Root Cause:** In integer division, when `right = left + 1`, `mid` evaluates to `left`. If the condition sets `left = mid`, then `left` never changes! The search space never shrinks, causing an **infinite loop**.
- **Fix:** Always use the canonical template: `left = mid + 1` and `right = mid`.

### Bug 2: Integer Subtraction Overflow in Comparers
- **Cause:** `(a, b) => a[0] - b[0]`
- **Root Cause:** When sorting coordinates or numbers spanning positive and negative values near $2 \times 10^9$, subtraction overflows $32$-bit limits.
- **Fix:** Universally use `a[0].CompareTo(b[0])`.

### Bug 3: Swapping Interval End Boundaries
- **Cause:** In interval merging, writing `current[1] = next[1]`.
- **Root Cause:** Fails when an interval is completely contained inside the previous interval (e.g. $[1, 10]$ and $[2, 5]$).
- **Fix:** Always take the maximum: `current[1] = Math.Max(current[1], next[1])`.

### Bug 4: Incorrect Sweep-Line Tie-Breaking
- **Cause:** Processing Start (+1) before End (-1) when two intervals touch at the same timestamp.
- **Root Cause:** Causes false momentary concurrency peaks.
- **Fix:** When intervals can touch without conflict, departures must precede arrivals.

---

## 4. 📈 Week 4 Milestone Audit & Confidence Scorecard

Evaluate your readiness across Week 4's competencies:

| Day | Topic | Can you code it in 15 mins without hints? | Invariant Understood? |
| :---: | :--- | :---: | :---: |
| **Day 22** | Binary Search (Exact & Lower Bound) | [ ] Yes | [ ] Yes |
| **Day 23** | Rotated Sorted Array & Peak Finding | [ ] Yes | [ ] Yes |
| **Day 24** | Binary Search on Answer Space | [ ] Yes | [ ] Yes |
| **Day 25** | 3Sum & Trapping Rain Water | [ ] Yes | [ ] Yes |
| **Day 26** | Interval Merging & Insertion | [ ] Yes | [ ] Yes |
| **Day 27** | Sweep-Line & Meeting Rooms II | [ ] Yes | [ ] Yes |
| **Day 28** | Timed Integration & Pattern Contrast | [ ] Yes | [ ] Yes |

---

## 5. 🎯 Capstone Checkpoint Questions

Before stepping into Week 5, answer these 4 synthesis questions:

1. **Answer Space vs Linear Scan:** In LeetCode 1283, why is Binary Search on Answer Space with runtime $O(N \log(\max nums))$ preferred over testing every possible divisor $1, 2, 3, \dots, \max(nums)$ sequentially?
2. **Greedy Piercing Equivalence:** How is LeetCode 452 (Burst Balloons) mathematically related to LeetCode 435 (Non-overlapping Intervals)? Show the bijection between "minimum arrows" and "maximum non-overlapping intervals".
3. **Rotated Array Inflection:** If you are asked to find an element in a rotated array that contains duplicate values (LeetCode 81), why does the worst-case runtime degrade to $O(N)$?
4. **Water Trapping Monotonic Stack Alternative:** In LeetCode 42 (Trapping Rain Water), we solved it with Two Pointers ($O(1)$ space). Can it also be solved using a **Monotonic Stack**? What does the stack store, and does it compute water horizontally or vertically?
