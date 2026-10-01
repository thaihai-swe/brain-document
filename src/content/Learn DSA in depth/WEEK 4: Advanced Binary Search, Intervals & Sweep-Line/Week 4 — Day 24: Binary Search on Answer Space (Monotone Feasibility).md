---
title: "Week 4 — Day 24: Binary Search on Answer Space (Monotone Feasibility)"
---

In **Days 22 and 23**, we applied Binary Search over **array indices** ($0 \dots N - 1$). The data elements were positioned in memory, and we exploited either global sorting or localized sorted segments to discard half the indices.

Today, we unlock one of the most powerful and ubiquitous patterns in Big Tech interviews: **Binary Search on Answer Space**.

Here, the input array is often **completely unsorted** and can be in arbitrary order! We do not search the array. Instead, we search over the **mathematical range of all possible answers** $[lo \dots hi]$. This pattern solves a massive class of complex optimization problems that candidates often mistakenly attempt with Dynamic Programming or Backtracking.

---

## 1. 🧠 TEACH: The Answer Space Invariant & Monotone Predicates

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **Binary Search on Answer Space** searches across the discrete or continuous range of possible answers $[lo, hi]$ using a monotonic boolean feasibility predicate $P(x)$.
  - *Core Invariants:* Monotone Feasibility Invariant: If speed or capacity $x$ is feasible, then all $x' > x$ are also feasible ($P(x) \implies P(x + 1)$); Search Domain Invariant: The answer domain $[lo, hi]$ is inherently sorted even when the input array is completely unordered.
  - *Misconception Check:* The input array does *not* need to be sorted! Binary search operates on the candidate answer values, not on the indices of the input array.
- **2. WHY:**
  - *Bottleneck Solved:* Converts complex global optimization problems ("minimize the maximum capacity") into simple decision checks ("can we finish with capacity $x$?").
  - *Complexity Advantage:* Reduces combinatorial optimization from exponential or high polynomial complexity to $O(N \log(\text{Range}))$ time.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Minimize the maximum...", "maximum minimum...", "find smallest capacity/speed such that...", "split array into K parts".
  - *When to Avoid / Failure Modes:* When the feasibility predicate is non-monotonic (e.g. $P(x)$ can be true, then false, then true; binary search fails).
- **4. WHERE:**
  - *Physical CLR Memory:* Scalar 64-bit integer registers (`lo`, `hi`, `mid`); `IsFeasible` helper runs linear scan over array with zero heap allocations.
  - *Production Systems:* Cloud autoscaling node count determination, network bandwidth throttling allocation, bin packing approximations.
- **5. WHO:**
  - *Spoken Script:* "When asked to minimize a maximum threshold, I search the monotonic answer space. If capacity C is feasible, any larger capacity is also feasible. I binary search the candidate range $[\max(nums), \sum nums]$, testing feasibility with a greedy linear scan in $O(N)$, giving $O(N \log(\text{Range}))$ total time."
  - *Interviewer Evaluation Lens:* Verifies correct identification of $[lo, hi]$ search bounds, rigorous monotonic predicate formulation, and clean greedy simulation helper.
- **6. HOW:**
  - *Cost Model:* Time: $O(N \log(hi - lo))$; Space: $O(1)$ auxiliary space.
  - *State Transition Trace (Koko Bananas):* `piles=[3,6,7,11], h=8 -> lo=1, hi=11 -> mid=6: hours=1+1+2+2=6 <= 8 (Feasible! hi=6) -> mid=3: hours=1+2+3+4=10 > 8 (False! lo=4) -> converges to 4`.


### 1.1 Physical Mental Model: The Cargo Ship Capacity Dial & The Monotonic Feasibility Horizon

Binary search on answer space transforms optimization problems into finding a boundary on a physical control dial:

```
       ======================================================================
         PHYSICAL ANALOGY: THE SHIP TONNAGE CONTROL DIAL & GREEDY PACKING
       ======================================================================

       Cargo Packages: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]  (Must ship in D = 5 days)

       MIN POSSIBLE CAPACITY:  max(weights) = 10 tons (Must carry heaviest box)
       MAX POSSIBLE CAPACITY:  sum(weights) = 55 tons (Ship everything on Day 1)

       Imagine a rotary control knob:
       
       Dial Setting (Tons): [ 10 ] ... [ 14 ]   [ 15 ]   [ 16 ] ... [ 55 ]
       Simulation Test:      FAIL       FAIL     PASS     PASS       PASS
       Predicate Result:      [ F ] ...  [ F ]    [ T ]    [ T ] ...  [ T ]
                                                   ^
                                     FIRST TRUE TRANSITION BOUNDARY!

       THE MONOTONIC HORIZON PROPERTY:
       - If a 15-ton boat can deliver all boxes in 5 days, then a 20-ton or 50-ton
         boat can OBVIOUSLY deliver them too! (True forever to the right).
       - If a 14-ton boat runs out of time, then an 11-ton boat is GUARANTEED
         to run out of time! (False forever to the left).

       We do NOT search the 10 array indices. We binary search the FEASIBILITY HORIZON
       from 10 to 55 tons! Each check simulates greedy packing in O(N) time.
```

---

### 1.2 The Paradigm Shift: Searching the Answer Domain

Consider this problem:
> *"Given an array of package weights, find the MINIMUM ship capacity required to ship all packages within $D$ days."*

```
Weights: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],  D = 5 days
```

- If you attempt to search the array directly, you hit a wall: the packages must be shipped in order, the array cannot be sorted, and no single element holds the answer.
- **The Epiphany:** The answer to this problem is a **capacity number** (e.g. 15 tons).
  - What is the smallest conceivable capacity? It must be at least $\max(weights) = 10$ (otherwise, the 10-ton package could never be loaded).
  - What is the largest conceivable capacity? The sum of all weights $\sum weights = 55$ (shipping everything in 1 day).

Therefore, the true search domain is **not** the 10 indices of the array, but the **contiguous integer range of possible capacities**:

$$\text{Search Space: } [10, 11, 12, 13, \dots, 54, 55]$$

Notice that this answer range $[10 \dots 55]$ is **inherently, strictly sorted in ascending order**!

---

### 1.2 The Monotone Feasibility Predicate $P(x)$

For any candidate answer $x$ in our search range, we define a feasibility function:
$$\text{IsFeasible}(x) \to \{\text{True}, \text{False}\}$$

For a capacity minimization problem:
- Can we ship everything with capacity $10$? No $\to$ `False`.
- Can we ship everything with capacity $12$? No $\to$ `False`.
- Can we ship everything with capacity $15$? **Yes $\to$ `True`**.
- Can we ship everything with capacity $16$? **Yes $\to$ `True`** (if capacity 15 works, 16 obviously works too!).
- Can we ship everything with capacity $55$? **Yes $\to$ `True`**.

Let us map the output of $\text{IsFeasible}(x)$ across our answer space:

```
Capacity x:     10     11     12     13     14     15     16     17  ...  55
IsFeasible(x): False  False  False  False  False  True   True   True ... True
                                                   ▲
                                            FIRST TRUE (Optimal Answer = 15)
```

#### The Monotonicity Requirement:
Binary Search on Answer Space is valid **if and only if** the predicate function is **monotonic**:

$$\forall x_1 \le x_2, \quad \text{IsFeasible}(x_1) = \text{True} \implies \text{IsFeasible}(x_2) = \text{True}$$

Once capacity becomes sufficient, it remains sufficient for all larger capacities. This boolean sequence of `[False, False, ..., True, True]` is the exact **Lower Bound / First True** pattern we mastered in **Day 22**!

---

### 1.3 How to Systematically Derive $[lo, hi]$ Bounds

Setting improper search bounds is the #1 cause of bugs in answer-space binary search. Always use physical first principles to derive $lo$ and $hi$:

| Problem Category | Lower Bound ($lo$) | Upper Bound ($hi$) | Feasibility Check |
| :--- | :--- | :--- | :--- |
| **Shipment / Capacity** | $\max(weights)$ *(heaviest single item)* | $\sum weights$ *(ship everything at once)* | Greedy linear scan packing items until capacity full |
| **Eating Speed (Koko)** | $1$ banana/hr *(slowest possible speed)* | $\max(piles)$ *(eating largest pile in 1 hr)* | $\sum \lceil pile / speed \rceil \le H$ |
| **Split Array Largest Sum** | $\max(nums)$ *(each element in own subarray)* | $\sum nums$ *(entire array in one subarray)* | Count subarrays needed with sum $\le mid$ |
| **Cut Ribbons / Wood** | $1$ *(smallest integer length)* | $\max(lengths)$ *(longest single piece)* | Count pieces: $\sum \lfloor length / mid \rfloor \ge K$ |

#### The Catastrophic Bug of Setting $lo = 0$ or $lo = 1$ in Capacity Problems:
In package shipping, if you set $lo = 1$ and the heaviest package is $10$:
- If Binary Search tests $mid = 5$, what happens when the greedy simulation encounters the 10-ton package?
- A package of weight 10 can **never** fit into a truck of capacity 5! If your code doesn't guard against this, the simulation enters an **infinite loop** or yields invalid day counts.
- **Rule:** Always set $lo = \max(\text{items})$ so every individual item can fit into a single container.

---

### 1.4 Integer Division Without Floating-Point Math: The Ceiling Trick

In problems like Koko Eating Bananas, eating a pile of size $P$ at speed $K$ requires:
$$\text{hours} = \left\lceil \frac{P}{K} \right\rceil$$

Many candidates write:
```csharp
// ⚠️ DANGEROUS: Floating-point precision loss
hours += (int)Math.Ceiling((double)pile / k);
```
In languages with IEEE 754 floating-point standards, casting large integers (e.g. $10^9$) to `double` loses precision, causing subtle off-by-one errors on edge test cases.

#### The Pure Integer Ceiling Formula:
For positive integers $A$ and $B$:
$$\mathbf{\left\lceil \frac{A}{B} \right\rceil = \frac{A + B - 1}{B}}$$

```csharp
// Pure integer arithmetic — 100% exact, zero float overhead:
int hours = (pile + k - 1) / k;
```
*(Beware of integer overflow when $A + B - 1 > \text{int.MaxValue}$; cast $A$ to `long` before adding if values can reach $2 \times 10^9$).*

---

### 1.5 ⚙️ Core Operations Deep-Dive: Predicate Monotonicity Bisection & Greedy Capacity Feasibility

#### Dimension 1: Operation Contract & Big-O Bounds

##### Answer Space Bisection Primitives (`MinEatingSpeed`, `ShipWithinDays`, `CanFeasiblyPack`)
- **Signatures:**
  - `public int ShipWithinDays(int[] weights, int days)`: Monotone capacity bisection over $[\max(W), \sum W]$ in $O(N \log(\sum W))$ time and $O(1)$ space.
  - `public int MinEatingSpeed(int[] piles, int h)`: Rate bisection over $[1, \max(P)]$ in $O(N \log(\max P))$ time and $O(1)$ space.
  - `private bool Feasible(int[] items, long capacity, int budget)`: Greedy linear feasibility simulation in $\Theta(N)$ time.
- **Preconditions:**
  - Feasibility predicate $\mathcal{P}(c)$ is monotonically non-decreasing: $\mathcal{P}(c) = \text{True} \implies \mathcal{P}(c + 1) = \text{True}$.
  - Search bounds derived from physical extremes: $lo \ge \max(items)$ and $hi \ge \sum items$.
- **Postconditions:**
  - Returns the minimal integer parameter $c^*$ such that $\mathcal{P}(c^*) = \text{True}$.
  - Arithmetic operations protected against 32-bit signed overflow via 64-bit `long` accumulation.
- **Complexity Bounds:**

| Strategy | Time Complexity | Auxiliary Space | Monotonicity Required? | Numerical Precision Loss? |
| :--- | :--- | :--- | :--- | :--- |
| **Monotone Answer Bisection** | **$O(N \log(\text{Range}))$** | **$O(1)$** | **Yes** | **Zero (Pure integer math)** |
| **Linear Search Increment** | $O(N \times \text{Range})$ | $O(1)$ | No | Zero |
| **Float Math Binary Search** | $O(N \log(\text{Range} / \epsilon))$ | $O(1)$ | Yes | High (IEEE 754 float drift) |
| **Dynamic Programming Memoization**| $O(N \times \text{Days} \times \text{Cap})$ | $O(N \times \text{Days})$ | No | Zero |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
               Answer Space Monotone Bisection Flow
                                 │
                   [Input: weights[], target days]
                                 │
                 [Derive Physical Bounds:
                  lo = Max(weights)
                  hi = Sum(weights) as long]
                                 │
                          [lo < hi?]
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
                  YES                          NO ──► [Return (int)lo]
                   │
        [mid = lo + (hi - lo) / 2]
                   │
        [CanShip(weights, mid, days)?]
                   │
         ┌─────────┴─────────┐
        YES                  NO
         │                   │
    (Capacity mid is    (Capacity mid is
     FEASIBLE: could     INFEASIBLE: must
     be smaller)         be larger)
         │                   │
     [hi = mid]         [lo = mid + 1]
         │                   │
         └─────────┬─────────┘
                   ▼
            (Next Iteration)
```

```
               Greedy Feasibility Simulation (`CanShip`)
                                 │
                 [Init: daysNeeded = 1, currentLoad = 0]
                                 │
                     [For each w in weights]
                                 │
                 [currentLoad + w > capacity?]
                ┌───────────────┴───────────────┐
                ▼                               ▼
               YES                              NO
                │                               │
        [daysNeeded++]                  [currentLoad += w]
        [currentLoad = w]                       │
                │                               │
        [daysNeeded > days?]                    │
          ┌─────┴─────┐                         │
         YES          NO                        │
          │           │                         │
    [Return FALSE]    └─────────────────────────┤
                                                ▼
                                         (Next Package)
                                                │
                                                ▼
                                          [Return TRUE]
```

---

#### Dimension 3: Visual ASCII State Transitions

##### Capacity Feasibility State Trace: `weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`, `days = 5`
```
Physical Search Space:
lo = Max(weights) = 10 (heaviest package)
hi = Sum(weights) = 55 (ship all in 1 day)

Iteration 1: lo = 10, hi = 55 ──► mid = 32
- Greedy simulation packs into 2 days:
  Day 1: [1..7] (sum 28 <= 32)
  Day 2: [8..10] (sum 27 <= 32)
- daysNeeded = 2 <= 5 ──► FEASIBLE! Keep mid: hi = 32.

Iteration 2: lo = 10, hi = 32 ──► mid = 21
- Packs into 3 days:
  Day 1: [1..5] (15), Day 2: [6, 7] (13), Day 3: [8..10] (27 > 21 -> split: [8,9]=17, [10]=10 -> 4 days <= 5)
- daysNeeded = 4 <= 5 ──► FEASIBLE! hi = 21.

Iteration 3: lo = 10, hi = 21 ──► mid = 15
- Packs into 5 days:
  Day 1: [1..5]=15, Day 2: [6,7]=13, Day 3: [8]=8, Day 4: [9]=9, Day 5: [10]=10
- daysNeeded = 5 <= 5 ──► FEASIBLE! hi = 15.

Iteration 4: lo = 10, hi = 15 ──► mid = 12
- Packs into 6 days > 5 ──► INFEASIBLE! Discard mid: lo = 12 + 1 = 13.

... Bisection contracts strictly down to lo == hi == 15.
Minimal capacity found: 15.
```

---

#### Dimension 4: Invariant Preservation Proof

##### Predicate Monotonicity Invariant:
Let $f(c)$ be the minimum number of days required to ship packages using vehicle capacity $c$.
1. **Monotonicity of Days Function:**
   Increasing capacity $c \implies c' > c$ guarantees that any partitioning of packages into days valid under capacity $c$ remains valid under capacity $c'$, because every package subset that summed to $\le c$ also sums to $< c'$. Therefore:
   $$c_1 \le c_2 \implies f(c_1) \ge f(c_2)$$
2. **Monotonicity of Feasibility Predicate:**
   The boolean feasibility predicate $\mathcal{P}(c) = (f(c) \le \text{days})$ is monotonic:
   $$\mathcal{P}(c) = \text{True} \implies \mathcal{P}(c + 1) = \text{True}$$
3. **Convergence to Minimal Feasible Value:**
   - Base Case: $lo = \max(W)$ guarantees every individual item can fit into at least one day. $hi = \sum W$ guarantees all items can fit into 1 day, satisfying $f(hi) = 1 \le days$.
   - Inductive Step:
     - If $\mathcal{P}(mid) = \text{True}$, the minimal feasible capacity $c^*$ cannot be $> mid$. Thus $c^* \in [lo, mid]$. Setting $hi = mid$ preserves the target in the search range.
     - If $\mathcal{P}(mid) = \text{False}$, capacity $mid$ is insufficient. By monotonicity, all $c \le mid$ are also insufficient. Thus $c^* \ge mid + 1$. Setting $lo = mid + 1$ preserves the target in the search range.
   - The interval strictly shrinks on each iteration and terminates at $lo == hi == c^*$, proven minimal. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Scenario | Concrete Input | Danger / Failure Mode | Invariant Protection Mechanism |
| :--- | :--- | :--- | :--- |
| **Days Equal to 1** | `weights = [2, 3, 5]`, $days = 1$ | Premature bisection termination | $hi = \sum weights = 10$. Simulation forces all items into 1 day; evaluates $lo = hi = 10$. |
| **Days Equal to $N$** | `weights = [2, 3, 5]`, $days = 3$ | Over-allocating capacity | $lo = \max(weights) = 5$. Each item gets its own day; returns $5$. |
| **Integer Sum Overflow** | $10^5$ items of $10^4$ | Sum exceeds $2.14 \times 10^9$ into negative overflow | Declare `hi` and `currentLoad` as `long` (`long hi = weights.Select(w => (long)w).Sum()`). |
| **Ceiling Division Float Loss** | $P = 10^9$, $K = 3$ | IEEE 754 `(int)Math.Ceiling(1e9/3)` precision drift | Use pure integer arithmetic: `(pile + k - 1L) / k`. |
| **Single Item Input ($N = 1$)** | `weights = [7]`, $days = 1$ | $lo == hi$ on initialization | $lo = 7, hi = 7$. Condition $lo < hi$ is immediately false; returns 7 directly. |

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 875 — Koko Eating Bananas (Medium)

> Koko loves to eat bananas. There are `n` piles of bananas, the `i-th` pile has `piles[i]` bananas. The guards will come back in `h` hours.
> Koko can decide her bananas-per-hour eating speed of `k`. Each hour, she chooses a pile and eats `k` bananas from it. If the pile has less than `k` bananas, she eats all of them and will not eat any more bananas during this hour.
> Return the minimum integer `k` such that she can eat all the bananas within `h` hours.

#### The Mathematical Formulation:
- **Search Space for speed $k$:**
  - $lo = 1$ (she must eat at least 1 banana per hour).
  - $hi = \max(piles)$ (eating faster than the largest pile provides no benefit, as she can only eat from one pile per hour).
- **Predicate:** $\text{HoursNeeded}(k) \le h$
  $$\text{HoursNeeded}(k) = \sum_{i=0}^{n-1} \left\lceil \frac{piles[i]}{k} \right\rceil$$

#### Step-by-Step Visual Trace:
`piles = [3, 6, 7, 11]`, `h = 8`
$lo = 1, hi = \max(piles) = 11$

```
Iteration 1:
 lo = 1, hi = 11
 mid = 1 + (11 - 1) / 2 = 6
 Hours for speed 6:
  ceil(3/6) = 1
  ceil(6/6) = 1
  ceil(7/6) = 2
  ceil(11/6) = 2
 Total hours = 1 + 1 + 2 + 2 = 6 <= 8 (True! Speed 6 is feasible).
 hi = mid = 6

Iteration 2:
 lo = 1, hi = 6
 mid = 1 + (6 - 1) / 2 = 3
 Hours for speed 3:
  ceil(3/3) = 1
  ceil(6/3) = 2
  ceil(7/3) = 3
  ceil(11/3) = 4
 Total hours = 1 + 2 + 3 + 4 = 10 > 8 (False! Speed 3 is too slow).
 lo = mid + 1 = 4

Iteration 3:
 lo = 4, hi = 6
 mid = 4 + (6 - 4) / 2 = 5
 Hours for speed 5:
  ceil(3/5) = 1
  ceil(6/5) = 2
  ceil(7/5) = 2
  ceil(11/5) = 3
 Total hours = 1 + 2 + 2 + 3 = 8 <= 8 (True! Speed 5 is feasible).
 hi = mid = 5

Iteration 4:
 lo = 4, hi = 5
 mid = 4 + (5 - 4) / 2 = 4
 Hours for speed 4:
  ceil(3/4) = 1
  ceil(6/4) = 2
  ceil(7/4) = 2
  ceil(11/4) = 3
 Total hours = 1 + 2 + 2 + 3 = 8 <= 8 (True! Speed 4 is feasible).
 hi = mid = 4

Termination: lo == hi == 4.
Minimum eating speed = 4 bananas/hr.
```

#### Production C# Implementation:
```csharp
public class SolutionKokoBananas {
    public int MinEatingSpeed(int[] piles, int h) {
        int lo = 1;
        int hi = 0;
        foreach (int pile in piles) {
            if (pile > hi) hi = pile;
        }

        // Half-open range [lo, hi]
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;

            if (CanFinish(piles, mid, h)) {
                hi = mid; // Speed mid works; try to find a slower speed to the left
            } else {
                lo = mid + 1; // Speed mid is too slow; must increase speed
            }
        }

        return lo;
    }

    private bool CanFinish(int[] piles, int speed, int maxHours) {
        long totalHours = 0; // Use long to prevent integer overflow with large piles
        foreach (int pile in piles) {
            // Integer ceiling formula: (pile + speed - 1) / speed
            totalHours += (pile + speed - 1) / speed;
            if (totalHours > maxHours) {
                return false; // Early exit pruning
            }
        }
        return totalHours <= maxHours;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N \log(\max(P)))$ where $N$ is the number of piles and $\max(P)$ is the largest pile. Binary search takes $\log(\max(P))$ steps; each step performs an $O(N)$ scan.
- **Space Complexity:** $O(1)$ constant memory.

---

### Problem 2: LeetCode 1011 — Capacity To Ship Packages Within D Days (Medium)

> A conveyor belt has packages that must be shipped from one port to another within `days` days. The `i-th` package on the conveyor belt has a weight of `weights[i]`. Each day, we load the ship with packages on the conveyor belt (in the order given by `weights`). We may not load more weight than the maximum weight capacity of the ship.
> Return the least weight capacity of the ship that will result in all the packages on the conveyor belt being shipped within `days` days.

#### The Invariant Formulation:
- Can we reorder packages? **No.** Packages must be loaded in sequential order.
- $lo = \max(weights)$: Any capacity smaller than the heaviest package will get stuck forever.
- $hi = \sum weights$: One ship carrying all packages on Day 1.

#### Visual Step-by-Step Trace:
`weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`, `days = 5`
- $lo = 10, hi = 55$

```
Iteration 1:
 lo = 10, hi = 55
 mid = 10 + (55 - 10) / 2 = 32
 Simulation with capacity 32:
  Day 1: 1+2+3+4+5+6+7 = 28 (next item 8 exceeds 32 -> end day 1)
  Day 2: 8+9+10 = 27
  Total days = 2 <= 5 (Feasible!)
 hi = 32

... [Binary search proceeds to narrow bounds] ...

Final check at mid = 15:
 Simulation with capacity 15:
  Day 1: 1+2+3+4+5 = 15
  Day 2: 6+7 = 13 (next 8 exceeds 15 -> end day 2)
  Day 3: 8
  Day 4: 9
  Day 5: 10
  Total days = 5 <= 5 (Feasible!)

Testing capacity 14:
  Day 1: 1+2+3+4 = 10
  Day 2: 5+6 = 11
  Day 3: 7
  Day 4: 8
  Day 5: 9
  Day 6: 10
  Total days = 6 > 5 (Not feasible!).

Result: 15.
```

#### Production C# Implementation:
```csharp
public class SolutionShipWithinDays {
    public int ShipWithinDays(int[] weights, int days) {
        int lo = 0;
        int hi = 0;

        foreach (int w in weights) {
            lo = Math.Max(lo, w); // Must be at least the heaviest single item
            hi += w;              // Max possible capacity is total weight
        }

        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;

            if (CanShip(weights, mid, days)) {
                hi = mid; // Capacity mid is feasible; explore smaller capacities
            } else {
                lo = mid + 1; // Capacity mid is too small; must expand
            }
        }

        return lo;
    }

    private bool CanShip(int[] weights, int capacity, int maxDays) {
        int requiredDays = 1;
        int currentDayWeight = 0;

        foreach (int w in weights) {
            if (currentDayWeight + w > capacity) {
                requiredDays++;
                currentDayWeight = 0;
            }
            currentDayWeight += w;
        }

        return requiredDays <= maxDays;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N \log(\sum W - \max(W)))$. The search space is bounded by $\sum W \le 5 \times 10^7$, so $\log_2(5 \times 10^7) \approx 26$ iterations. $26 \times N$ operations easily passes within 50ms!
- **Space Complexity:** $O(1)$.

---

### Problem 3: LeetCode 410 — Split Array Largest Sum (Hard)

> Given an integer array `nums` and an integer `k`, split `nums` into `k` non-empty subarrays such that the largest sum of any subarray is **minimized**.
> Return the **minimized largest sum** of the split.

#### The Mathematical Equivalence Theorem:
Look at the wording:
- *"Split array into $k$ contiguous subarrays such that the maximum subarray sum is minimized."*
- Now replace "subarrays" with "days", and "maximum sum" with "ship capacity":
  - *"Ship packages across $k$ days such that the maximum day load (capacity) is minimized."*

**LeetCode 410 (Hard) is mathematically 100% identical to LeetCode 1011 (Medium)!**
Candidates who do not recognize the Answer Space pattern often attempt LeetCode 410 with 2D Dynamic Programming ($O(K \cdot N^2)$ time), which is both difficult to code and produces TLE on large inputs.
With Binary Search on Answer Space, we solve this "Hard" problem in **$O(N \log(\sum N))$** time with identical code to LeetCode 1011!

#### Production C# Implementation:
```csharp
public class SolutionSplitArray {
    public int SplitArray(int[] nums, int k) {
        int lo = 0;
        int hi = 0;

        foreach (int num in nums) {
            lo = Math.Max(lo, num); // Each element must at least fit in its own subarray
            hi += num;              // Subarray containing the entire array has sum hi
        }

        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;

            if (CanSplit(nums, mid, k)) {
                hi = mid; // Subarray sum mid is achievable; try smaller sum
            } else {
                lo = mid + 1; // Cannot achieve with mid; must allow larger sum
            }
        }

        return lo;
    }

    private bool CanSplit(int[] nums, int targetMaxSum, int maxSubarrays) {
        int subarrayCount = 1;
        int currentSubarraySum = 0;

        foreach (int num in nums) {
            if (currentSubarraySum + num > targetMaxSum) {
                subarrayCount++;
                currentSubarraySum = 0;
            }
            currentSubarraySum += num;
        }

        return subarrayCount <= maxSubarrays;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N \log(\sum nums))$.
- **Space Complexity:** $O(1)$ auxiliary memory. (DP would require $O(N \cdot K)$ memory).

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Cement the Answer Space pattern with these core problems:

### Problem 1 (Speed Optimization): LeetCode 875 — Koko Eating Bananas (Medium)
- **Goal:** Implement pure integer ceiling arithmetic and solve with $O(N \log(\max P))$ time.
- **Target Complexity:** $O(N \log(\max P))$ time, $O(1)$ space.

### Problem 2 (Greedy Simulation): LeetCode 1011 — Capacity To Ship Packages Within D Days (Medium)
- **Goal:** Correctly derive the lower bound $lo = \max(weights)$ and simulate daily loads.
- **Target Complexity:** $O(N \log(\sum W))$ time, $O(1)$ space.

### Problem 3 (Hard Reduction): LeetCode 410 — Split Array Largest Sum (Hard)
- **Goal:** Map the problem to container capacity and solve without dynamic programming.
- **Target Complexity:** $O(N \log(\sum nums))$ time, $O(1)$ space.

### Bonus / Extension Challenge: LeetCode 1482 — Minimum Number of Days to Make m Bouquets (Medium)
- **Goal:** Binary search on day $D$. Predicate: can we pick $m$ adjacent groups of $k$ blooming flowers on day $D$?
- **Hint:** Range is $[1, \max(bloomDay)]$. If $m \times k > bloomDay.Length$, return -1 immediately.

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

Here is the diagnostic filter to identify **Binary Search on Answer Space** within 15 seconds during an interview:

```
┌────────────────────────────────────────────────────────────────────────┐
│             Answer Space Binary Search Diagnostic Filter               │
└────────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
Question 1: Does the problem ask for:          Question 2: Does it satisfy Monotonicity?
- "Find the MINIMUM X such that condition..."  - If answer X works, does X + 1 also work?
- "Find the MAXIMUM X such that condition..."  - If answer X fails, does X - 1 also fail?
- "Minimize the maximum..." / "Maximize min..."
    │                                                               │
    └───────────────────────────────┬───────────────────────────────┘
                                    │ YES to both!
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │     Apply Binary Search on Answer Space [lo, hi]        │
       │  1. Derive physical bounds: lo = min_val, hi = max_val  │
       │  2. Write greedy simulation: bool IsFeasible(mid)       │
       │  3. Standard LowerBound binary search loop              │
       └─────────────────────────────────────────────────────────┘
```

### Preview for Day 25: Multi-Pointer Reductions & Water Trapping
Binary Search is one way to bypass exhaustive brute force. In **Day 25**, we return to multi-element combinations with **3Sum**, **4Sum**, and **Trapping Rain Water**. We will learn how sorting and two-pointer coordination reduces $O(N^3) \to O(N^2)$ and how running boundary minimums eliminate $O(N)$ auxiliary arrays down to $O(1)$ space!

---

## 5. 🎯 Day 24 Checkpoint Questions

Solidify your grasp of Monotone Feasibility with these 4 questions:

1. **The Lower Bound Trap:** In LeetCode 1011 (Capacity to Ship Packages), what specific bug occurs in the `CanShip` loop if you mistakenly initialize $lo = 1$ instead of $lo = \max(weights)$?
2. **Integer Ceiling Arithmetic:** Why does `(A + B - 1) / B` correctly compute $\lceil A / B \rceil$ using pure integer division for positive integers? Trace it with $A = 7, B = 3$ and $A = 6, B = 3$.
3. **Hard Problem Reduction:** Why is LeetCode 410 (Split Array Largest Sum) considered a "Hard" problem if its code is virtually identical to LeetCode 1011 (Medium)? What alternate approach makes it hard?
4. **Feasibility Monotonicity Failure:** What if a problem asks: *"Find capacity $C$ such that packages are shipped in EXACTLY $D$ days (not at most $D$ days)"*? Does the boolean sequence of feasibility remain monotonic? Can you still use Binary Search?
