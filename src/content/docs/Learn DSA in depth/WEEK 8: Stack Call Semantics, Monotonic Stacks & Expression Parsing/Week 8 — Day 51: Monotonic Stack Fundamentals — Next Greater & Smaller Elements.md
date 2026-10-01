---
title: "Week 8 — Day 51: Monotonic Stack Fundamentals — Next Greater & Smaller Elements"
---

In **Day 50**, we explored the physical hardware call stack, dynamic array-backed stack memory management, and delimiter state machines.

Today, we unlock one of the most intellectually elegant and high-frequency patterns in computer science:
1. **The Monotonic Stack Invariant:** Preserving a strictly sorted sequence within a stack to eliminate redundant linear scans.
2. **The Amortized $O(N)$ Proof:** Why nested loops collapse into guaranteed linear time under aggregate analysis.
3. **The Index vs. Value Rule:** Why high-performance monotonic algorithms must store array indices rather than values.
4. **The 4 Cardinal Orientations:** Symmetrically solving Next/Previous Greater/Smaller queries across 1D arrays.
5. **Circular Array Unrolling ([LeetCode 503]):** Virtual $2N$ traversal using modulo arithmetic (`i % N`) without allocating memory.

---

## 1. 🧠 TEACH: Concept & Invariants

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* A **Monotonic Stack** is a stack whose elements are strictly monotonically increasing or decreasing from bottom to top.
  - *Core Invariants:* Monotonicity Invariant: Elements in the stack maintain $S[0] < S[1] < \dots < S[\text{top}]$; Nearest Boundary Invariant: When an arriving element $x$ pops an element $y$, $x$ is the **Next Greater (or Smaller) Element** to the right of $y$, and the element directly below $y$ in the stack is the Nearest Greater (or Smaller) to the left of $y$.
  - *Misconception Check:* A monotonic stack does *not* require $O(N^2)$ time despite the nested `while` loop inside the traversal `for` loop; because every array index is pushed onto the stack exactly once and popped at most once, the total number of operations across the entire loop is at most $2N$, guaranteeing strict $O(N)$ amortized time.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(N^2)$ exhaustive search for the nearest larger or smaller neighbor of every array element.
  - *Complexity Advantage:* Reduces nearest neighbor searches from $O(N^2)$ to strict $O(N)$ amortized linear time.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Next Greater Element" (LC 496, 503), "Daily Temperatures" (LC 739), "Online Stock Span" (LC 901). Signal words: "next greater element", "days until warmer temperature", "first element larger to the right".
  - *When to Avoid / Failure Modes:* When queries seek global extremes across the entire array rather than the nearest adjacent boundary (use Prefix/Suffix Max or Heap instead).
- **4. WHERE:**
  - *Physical CLR Memory:* Heap-allocated array-backed integer stack `int[]`; storing array indices rather than values allows both the value (`nums[idx]`) and relative distance ($i - idx$) to be retrieved in $O(1)$ time.
  - *Production Systems:* Stock market order book depth processing, oceanographic sensor wave peak detection, seismic event threshold monitoring.
- **5. WHO:**
  - *Spoken Script:* "A monotonic stack maintains elements in sorted order. When a new element violates the monotonicity invariant, it pops smaller elements from the stack. The incoming element is the next greater element for everything it pops, resolving all queries in $O(N)$ total time."
  - *Interviewer Evaluation Lens:* Evaluates whether candidate stores indices vs. values, handles strictly increasing vs. non-decreasing equality ties, and proves amortized $O(N)$ complexity.
- **6. HOW:**
  - *Cost Model:* Time: $O(2N) = O(N)$ amortized; Space: $O(N)$ auxiliary space.
  - *State Transition Trace (Daily Temps):* `T=[73, 74, 75, 71, 69, 72] -> push 0 (73) -> 74 > 73: pop 0, ans[0] = 1 - 0 = 1, push 1 (74) -> ...`.


---

### 1.1 Physical Mental Model — Tall People at the Cinema & The Waiting Line

**Everyday Analogy: Waiting for Someone Taller in the Cinema Line**

Imagine people of various heights standing in a line, each looking forward to find the **first person taller than themselves**:
- Instead of having every person look down the entire line ($O(N^2)$ looking ahead), people wait patiently inside a **Monotonic Stack**:
- Inside the stack, people must stand in **strictly decreasing order of height** (tallest at the bottom, shortest at the top).

```
MONOTONIC DECREASING STACK:
┌──────────────┐
│ Person 71 cm │  <-- TOP (Shortest waiting person)
├──────────────┤
│ Person 75 cm │
├──────────────┤
│ Person 90 cm │  <-- BOTTOM (Tallest waiting person)
└──────────────┘
```

---

**The Incoming Giant Arrival:**

A new person arrives with height **$74\text{ cm}$** (`nums[i] = 74`):
1. **The Giant Looks at the Top:** The top of the stack is person **$71\text{ cm}$**.
2. **Resolution!** Person $74$ is strictly taller than $71$!
   - Person $71$ rejoices: *"My search is over! $74$ is my Next Greater Element!"*
   - Person $71$ **hops out of the stack (`Pop()`)** and writes $74$ into their answer ledger!
3. **Check the Next Person:** The next person in the stack is **$75\text{ cm}$**.
   - Person $74$ is NOT taller than $75$.
   - Person $74$ steps into the stack and stands on top of $75$!

```
BEFORE:                          ACTION:                          AFTER:
Stack: [ 90, 75, 71 ]            Incoming 74 > Top 71!            Stack: [ 90, 75, 74 ]
                                 Pop 71 -> Resolved by 74!        (Monotonicity preserved!)
                                 Push 74 on top of 75.
```

**Why It's Strictly $O(N)$ Time (The Amortized Guarantee):**
Every person steps into the stack **at most once**, and hops out **at most once**.
Even though some giants pop 5 people in one step, across the entire array of $N$ people, there are at most $N$ pushes and $N$ pops $\implies \mathbf{\le 2N}$ total operations!

---

### 1.2 The Naive Inefficiency ($O(N^2)$)

Suppose you are given an array of temperatures and asked:
*"For each day, how many days do you have to wait until a warmer temperature?"*

```
Temperatures: [ 73, 74, 75, 71, 69, 72, 76, 73 ]
For index 0 (73): Day 1 is 74 (Warmer!) -> Wait 1 day.
For index 2 (75): Look ahead: 71 (no), 69 (no), 72 (no), 76 (yes!) -> Wait 4 days.
```

- **The Brute Force Approach:** For every index $i$, run an inner loop $j = i + 1 \dots N - 1$ until `nums[j] > nums[i]`.
- **The Worst-Case Trap:** On a monotonically decreasing input (e.g. `[100, 90, 80, 70, 60]`), the inner loop scans to the end for every single element:
  $$\text{Comparisons} = (N - 1) + (N - 2) + \dots + 1 = \frac{N(N - 1)}{2} = \mathbf{O(N^2)}$$
  For $N = 10^5$, $N^2 = 10^{10}$ operations $\implies$ **Time Limit Exceeded (TLE)**.

---

### 1.2 The Monotonic Stack Invariant

Instead of repeatedly scanning the same elements into the future, we maintain a **Monotonic Decreasing Stack**:
- Elements inside the stack are always sorted from bottom to top in **strictly descending order** (largest at bottom, smallest at top).

#### The Active Resolution Mechanic:
When processing element `nums[i]`:
1. We compare `nums[i]` with the element at the top of the stack (`nums[stack.Peek()]`).
2. If `nums[i] <= nums[stack.Peek()]`:
   - Pushing `i` maintains the descending invariant. Push `i` and move to the next element.
3. If `nums[i] > nums[stack.Peek()]`:
   - **Discovery!** `nums[i]` is the **Next Greater Element** for the element at the top of the stack!
   - We pop the index from the stack: `int prevIdx = stack.Pop()`.
   - We record the answer for `prevIdx`:
     - If the problem asks for the *value*: `result[prevIdx] = nums[i]`.
     - If the problem asks for the *distance*: `result[prevIdx] = i - prevIdx`.
   - We repeat this check until the stack is empty or `nums[i] <= nums[stack.Peek()]`.
   - Finally, we push `i` onto the stack.

```
Incoming: 74
Stack Top: 73
Since 74 > 73: 74 resolves 73!
Pop 73 -> Wait time = 1 - 0 = 1 day.
Push 74 onto stack.
```

---

### 1.3 The Amortized $O(N)$ Complexity Proof

Candidates frequently stumble in Big Tech interviews when asked:
*"You have a `while` loop nested inside a `for` loop. How can you claim this is $O(N)$ time?"*

#### The Potential / Aggregate Accounting Proof:
Let us analyze the lifecycle of every element $x \in nums$:
1. How many times can index $i$ be **pushed** onto the stack?
   - Exactly **1 time** (in the outer `for` loop). Total pushes across the entire algorithm = $N$.
2. How many times can index $i$ be **popped** from the stack?
   - At most **1 time** (once popped, it is discarded forever). Total pops across the entire algorithm $\le N$.
3. Total number of inner `while` loop iterations over the entire program lifetime:
   $$\text{Total Inner Iterations} = \text{Total Pops} \le N$$
4. Total Operations:
   $$\mathbf{\text{Total Pushes} + \text{Total Pops} \le N + N = 2N = O(N)}$$

The amortized time per element is strictly $\mathbf{O(1)}$.

---

### 1.4 The Cardinal Taxonomy: 4 Variations of Monotonic Stacks

Depending on whether you seek **Greater** vs. **Smaller** and **Next (Right)** vs. **Previous (Left)**:

| Target Query | Stack Property | Scan Direction | Pop Trigger Condition |
| :--- | :--- | :--- | :--- |
| **Next Greater Element (Right)** | Monotonic Decreasing | Left $\to$ Right (forward) | `nums[curr] > nums[stack.Peek()]` |
| **Previous Greater Element (Left)** | Monotonic Decreasing | Left $\to$ Right (forward) | Pop smaller elements; peek is the previous greater |
| **Next Smaller Element (Right)** | Monotonic Increasing | Left $\to$ Right (forward) | `nums[curr] < nums[stack.Peek()]` |
| **Previous Smaller Element (Left)** | Monotonic Increasing | Left $\to$ Right (forward) | Pop larger elements; peek is the previous smaller |

---

### 1.5 Why We Store INDICES, Never Values

A fatal beginner flaw is writing `Stack<int>` and pushing `nums[i]` (the value).

**Always store the array index `i`:**
1. **Distance Retrieval:** You can compute span distances: `span = i - stack.Peek()`.
2. **Value Access:** You can always read the value via `nums[stack.Peek()]`.
3. **Duplicate Disambiguation:** If `nums = [2, 2, 2]`, storing values makes identical elements indistinguishable; storing indices (`0, 1, 2`) preserves exact positions.

---

### 1.6 Circular Array Unrolling ($2N$ Virtual Pass)

In **LeetCode 503**, the array is circular: the search wraps around from the end of the array back to index 0.

#### The Zero-Allocation Trick:
Do not concatenate `nums` with itself to create an array of size $2N$ (wastes $O(N)$ heap memory).
Instead, run your loop from `0` to `2 * N - 1` and map to the array using **modulo arithmetic**:
$$\mathbf{\text{virtualIndex} = i \% N}$$

- In pass 1 ($i \in [0 \dots N - 1]$): Elements are pushed onto the stack and resolve previous elements.
- In pass 2 ($i \in [N \dots 2N - 1]$): Elements resolve any remaining unresolved elements from pass 1, but **we do not push new elements** into the stack!

---

### 1.7 Interview Spoken Drill (20–30 Seconds)

> *"To find the Next Greater Element in $O(N)$ time instead of $O(N^2)$, I use a monotonic decreasing stack of indices. As I iterate through the array, any incoming element that is strictly greater than the stack's top resolves that top element, allowing us to record its answer and pop it. Although the while loop is nested inside a for loop, every element is pushed at most once and popped at most once, guaranteeing $O(N)$ amortized runtime. Storing indices rather than values enables constant-time distance calculations and handles duplicates cleanly. For circular arrays, I simulate a $2N$ pass using modulo indexing without extra array allocations."*

### 1.8 ⚙️ Core Operations Deep-Dive: Monotonic Pop-While-Violating & Circular Modulo Invariants

#### Dimension 1: Operation Contract & Big-O Bounds
- **Operation Signatures:**
  1. `int[] DailyTemperatures(int[] temperatures)`
  2. `int[] NextGreaterElements(int[] nums)` (Circular Array)
- **Preconditions:**
  - `temperatures` and `nums` are non-null integer arrays with length $N \ge 1$.
- **Postconditions:**
  - `DailyTemperatures` returns an array where index $i$ stores the distance to the next warmer temperature, or $0$ if none exists.
  - `NextGreaterElements` returns an array where index $i$ stores the value of the next greater element in circular order, or $-1$ if none exists.
- **Complexity Bounds:**
  - **Time Complexity:**
    - $\Theta(N)$ amortized — each index $i \in [0, N-1]$ is pushed onto the stack at most once and popped at most once. For circular arrays, the loop runs $2N$ times with $N$ pushes and $\le N$ pops, strictly bounded by $O(N)$.
  - **Auxiliary Space Complexity:**
    - $\Theta(N)$ auxiliary space for the explicit index stack.

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree
1. **Circular Next Greater Element State Flow:**
   - Initialize `int[] result = new int[N]`. Fill with `-1`.
   - Initialize `Stack<int> stack = new Stack<int>()` (storing indices).
   - Loop $i = 0$ to $2N - 1$:
     - Let `val = nums[i % N]`.
     - *Resolution Phase (Pop-While-Violating):*
       - While `stack.Count > 0 && val > nums[stack.Peek()]`:
         - Popped index `target = stack.Pop()`.
         - `result[target] = val`.
     - *Push Phase (First Pass Only):*
       - If $i < N$:
         - `stack.Push(i)`.
   - Return `result`.

```
                    [Loop i from 0 to 2N - 1]
                                │
                    val = nums[i % N]
                                │
             stack.Count > 0 && val > nums[stack.Peek()]?
                            /                  \
                      (Yes)/                    \(No)
                          ▼                      ▼
               target = stack.Pop()            i < N?
               result[target] = val           /      \
                          │             (Yes)/        \(No)
                          └─────────────►   ▼          ▼
                                        stack.Push(i)  Continue
```

#### Dimension 3: Visual ASCII State Transitions
```
CIRCULAR ARRAY: nums = [ 1, 2, 1 ]
Initialized result = [ -1, -1, -1 ]

i=0 (val=1): stack empty -> Push 0. Stack: [ 0(1) ]
i=1 (val=2): 2 > nums[0](1)! Pop 0 -> result[0] = 2.
             stack empty -> Push 1. Stack: [ 1(2) ]
i=2 (val=1): 1 <= nums[1](2). Push 2. Stack: [ 1(2), 2(1) ]

--- ENTER CIRCULAR PASS 2 (No more pushes) ---
i=3 (val=nums[0]=1): 1 <= nums[2](1). Do nothing.
i=4 (val=nums[1]=2): 2 > nums[2](1)! Pop 2 -> result[2] = 2.
                     2 <= nums[1](2). Do nothing.
i=5 (val=nums[2]=1): 1 <= nums[1](2). Do nothing.

Loop terminates. Remaining stack top is 1 (result[1] stays -1).
Final Result: [ 2, -1, 2 ]
```

#### Dimension 4: Invariant Preservation Proof
- **Monotonic Decreasing Stack Invariant:**
  - At every step of the algorithm, indices in the stack $\langle s_0, s_1, \dots, s_k \rangle$ satisfy:
    $$nums[s_0] \ge nums[s_1] \ge \dots \ge nums[s_k]$$
  - When incoming element $nums[i]$ arrives:
    - Any element $s_j$ where $nums[s_j] < nums[i]$ has its first strictly greater right-side neighbor found. Since we scan from left to right, $i$ is guaranteed to be the *nearest* such index.
    - Popping all violating elements restores the non-increasing property before $i$ is pushed.
- **Circular Modulo Wrap-Around Soundness ($2N - 1$ Bounds):**
  - In a circular array of length $N$, the next greater element for index $j$ must appear within distance $N - 1$ steps forward.
  - Running index $i$ up to $2N - 1$ allows index $N-1$ to be compared against all elements up to $N-2$, covering all possible circular candidates.
  - Suppressing pushes during pass 2 ($i \ge N$) ensures no index is evaluated for duplicate resolution, guaranteeing exact $\Theta(N)$ runtime.

#### Dimension 5: Edge Case Matrix
| Edge Case Scenario | Input State | Algorithmic Behavior | Invariant Preservation |
| :--- | :--- | :--- | :--- |
| **Strictly Decreasing** | `[5, 4, 3, 2, 1]` | No elements popped in pass 1. In pass 2, 5 pops all smaller elements except itself. | Largest element retains `-1`; all others resolve to 5. |
| **Strictly Increasing** | `[1, 2, 3, 4, 5]` | Every element immediately pops the previous in pass 1. Stack depth never exceeds 1. | Resolves adjacent neighbors in $\Theta(N)$. |
| **All Identical Elements** | `[2, 2, 2, 2]` | Strict inequality `val > nums[stack.Peek()]` never fires. Stack holds all indices. | All elements retain default `-1`. |
| **Single Element** | `[42]` | Pass 1 pushes 0; pass 2 compares 42 with 42 (does not pop); result `[-1]`. | Single element has no strictly greater neighbor. |
| **Large Spans** | High temperature arrives after 10,000 cold days | Stack drains 10,000 cold days in a single cascade. | Distance arithmetic `i - prevDay` yields 10,000. |

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

### 2.1 [LeetCode 739] Daily Temperatures

Given an array of integers `temperatures` represents the daily temperatures, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `i`-th day to get a warmer temperature. If there is no future day for which this is possible, keep `answer[i] == 0` instead.

#### Visual Execution Trace on `[73, 74, 75, 71, 69, 72, 76, 73]`:

```
i = 0 (73): stack is empty -> Push 0. Stack: [0(73)]
i = 1 (74): 74 > 73!
            Pop 0. answer[0] = 1 - 0 = 1 day.
            Push 1. Stack: [1(74)]
i = 2 (75): 75 > 74!
            Pop 1. answer[1] = 2 - 1 = 1 day.
            Push 2. Stack: [2(75)]
i = 3 (71): 71 <= 75. Push 3. Stack: [2(75), 3(71)]
i = 4 (69): 69 <= 71. Push 4. Stack: [2(75), 3(71), 4(69)]
i = 5 (72): 72 > 69! Pop 4. answer[4] = 5 - 4 = 1 day.
            72 > 71! Pop 3. answer[3] = 5 - 3 = 2 days.
            72 <= 75. Push 5. Stack: [2(75), 5(72)]
i = 6 (76): 76 > 72! Pop 5. answer[5] = 6 - 5 = 1 day.
            76 > 75! Pop 2. answer[2] = 6 - 2 = 4 days.
            Push 6. Stack: [6(76)]
i = 7 (73): 73 <= 76. Push 7. Stack: [6(76), 7(73)]

End of loop. Unpopped indices (6, 7) remain 0.
Result: [1, 1, 4, 2, 1, 1, 0, 0]
```

#### Production C# Implementation:

```csharp
public class SolutionDailyTemperatures {
    /// <summary>
    /// Computes waiting days to next warmer temperature in O(N) time and O(N) space
    /// using a monotonic decreasing stack of indices.
    /// </summary>
    public int[] DailyTemperatures(int[] temperatures) {
        if (temperatures == null || temperatures.Length == 0) {
            return Array.Empty<int>();
        }

        int n = temperatures.Length;
        int[] answer = new int[n]; // Initialized to 0 by default in C#
        var stack = new Stack<int>(); // Stores INDICES

        for (int i = 0; i < n; i++) {
            int currentTemp = temperatures[i];

            // Resolve any previous days whose temperature is strictly less than today's
            while (stack.Count > 0 && currentTemp > temperatures[stack.Peek()]) {
                int prevDay = stack.Pop();
                answer[prevDay] = i - prevDay; // Days waited
            }

            stack.Push(i);
        }

        return answer;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — Every index is pushed once and popped at most once.
- **Space Complexity:** $O(N)$ — Auxiliary stack holds at most $N$ indices in the worst case (strictly decreasing temperatures).

---

### 2.2 [LeetCode 496] Next Greater Element I

The **next greater element** of some element `x` in an array is the first greater element to its right in the same array.
You are given two distinct integer arrays `nums1` and `nums2`, where `nums1` is a subset of `nums2`. For each `0 <= i < nums1.length`, find the index `j` such that `nums1[i] == nums2[j]` and determine the next greater element of `nums2[j]` in `nums2`. If there is no next greater element, then the answer for this query is `-1`.

#### Algorithmic Invariants:
1. Since all elements in `nums2` are distinct, we can precalculate the next greater element for **every** element in `nums2` using a monotonic decreasing stack.
2. Store the mappings in a `Dictionary<int, int> nextGreaterMap`.
3. Iterate through `nums1` and populate the answer array via $O(1)$ dictionary lookups!

#### Production C# Implementation:

```csharp
public class SolutionNextGreaterElementI {
    /// <summary>
    /// Resolves next greater elements for subset nums1 using precalculated map from nums2.
    /// Time Complexity: O(N1 + N2)
    /// Space Complexity: O(N2)
    /// </summary>
    public int[] NextGreaterElement(int[] nums1, int[] nums2) {
        var nextGreaterMap = new Dictionary<int, int>();
        var stack = new Stack<int>();

        // Step 1: Precalculate Next Greater Element for all items in nums2
        foreach (int num in nums2) {
            while (stack.Count > 0 && num > stack.Peek()) {
                nextGreaterMap[stack.Pop()] = num;
            }
            stack.Push(num);
        }

        // Remaining elements in stack have no greater element to their right
        while (stack.Count > 0) {
            nextGreaterMap[stack.Pop()] = -1;
        }

        // Step 2: Answer queries for nums1 in O(1) time each
        int[] result = new int[nums1.Length];
        for (int i = 0; i < nums1.Length; i++) {
            result[i] = nextGreaterMap[nums1[i]];
        }

        return result;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N_1 + N_2)$ — $O(N_2)$ to build the monotonic map, $O(N_1)$ to map queries.
- **Space Complexity:** $O(N_2)$ auxiliary space for dictionary and stack.

---

### 2.3 [LeetCode 503] Next Greater Element II (Circular Array)

Given a circular integer array `nums` (i.e., the next element of `nums[nums.length - 1]` is `nums[0]`), return the **next greater number** for every element in `nums`.

#### Production C# Implementation:

```csharp
public class SolutionNextGreaterElementII {
    /// <summary>
    /// Finds next greater element in circular array using virtual 2N pass in O(N) time and space.
    /// </summary>
    public int[] NextGreaterElements(int[] nums) {
        if (nums == null || nums.Length == 0) return Array.Empty<int>();

        int n = nums.Length;
        int[] result = new int[n];
        Array.Fill(result, -1);

        var stack = new Stack<int>(); // Stores indices

        // Virtual unrolling: traverse 2 * n steps
        for (int i = 0; i < 2 * n; i++) {
            int currentNum = nums[i % n];

            // Resolve any indices whose values are less than currentNum
            while (stack.Count > 0 && currentNum > nums[stack.Peek()]) {
                int poppedIndex = stack.Pop();
                result[poppedIndex] = currentNum;
            }

            // Only push indices during the first pass (0 to n - 1)
            if (i < n) {
                stack.Push(i);
            }
        }

        return result;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — Loop runs $2N$ iterations; each index is pushed at most once and popped at most once.
- **Space Complexity:** $O(N)$ auxiliary space for the stack (holds at most $N$ elements).

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master monotonic stack fundamentals on LeetCode:

### Problem 1 (The Foundational Distance Span): LeetCode 739 — Daily Temperatures (Medium)
- **Goal:** Implement the monotonic decreasing stack of indices to compute day spans.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.

### Problem 2 (Subset Mapping): LeetCode 496 — Next Greater Element I (Easy)
- **Goal:** Combine monotonic stack preprocessing with a hash map lookup.
- **Target Complexity:** $O(N_1 + N_2)$ time, $O(N_2)$ space.

### Problem 3 (Circular Array Unrolling): LeetCode 503 — Next Greater Element II (Medium)
- **Goal:** Implement the $2N$ virtual modulo loop (`i % N`) without copying the array.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.

### Bonus / Extension Challenge: LeetCode 901 — Online Stock Span (Medium)
- **Goal:** Design a data structure that receives streaming stock prices and returns the span of consecutive days the stock was $\le$ today's price.
- **Hint:** Maintain a stack of pairs: `(price, span)`. When a larger price arrives, pop and aggregate previous spans!

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Monotonic Stack Variation Decision Tree              │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Finding Next Greater Element in standard 1D array?
                   │   └─► Monotonic Decreasing Stack (Push indices, pop on num > top) [LC 739]
                   │
                   ├─► Finding Next Greater Element in Circular Array?
                   │   └─► Virtual 2N Pass (i < 2N, i % N, only push if i < N) [LC 503]
                   │
                   ├─► Streaming queries of previous consecutive smaller prices?
                   │   └─► Online Monotonic Stack aggregating spans (price, span) [LC 901]
                   │
                   └─► Finding largest rectangular area bounded by histogram bars?
                       └─► Monotonic Increasing Stack with Width Formula (Day 52) [LC 84, LC 85]
```

### Preview for Day 52: Monotonic Stack Boundary Formulations & Area Problems
Tomorrow in **Day 52**, we elevate monotonic stacks to solve geometric optimization problems:
- **[LeetCode 84] Largest Rectangle in Histogram (Hard):** Using a monotonic increasing stack to identify both the left and right limiting boundaries for every bar in a single pass.
- **The Width Formula:** $\mathbf{\text{width} = (stack.Count == 0) \ ? \ i : i - stack.Peek() - 1}$.
- **[LeetCode 85] Maximal Rectangle (Hard):** Reducing 2D binary grids to running 1D histograms.

---

## 5. 🎯 Day 51 Checkpoint Questions

Verify your mastery of monotonic stack mechanics:

1. **The Amortized Proof:** In an interview, if the interviewer challenges your claim that LeetCode 739 is $O(N)$ despite having a while loop inside a for loop, state the exact 2-sentence mathematical proof that settles the question.
2. **Strict vs. Non-Strict Inequality:** In LeetCode 739, why is the condition `currentTemp > temperatures[stack.Peek()]` using strictly `>` rather than `>=`? What would happen if temperatures were equal (e.g. `[70, 70]`)?
3. **Circular Pass Guard:** In LeetCode 503, why do we include the check `if (i < n) stack.Push(i);`? What disaster occurs if you push indices during the second pass ($i \ge n$)?
4. **Distance Formula Invariant:** Why does `i - prevDay` correctly compute the number of days waited? Why could this formula NOT be computed if we pushed values instead of indices?
