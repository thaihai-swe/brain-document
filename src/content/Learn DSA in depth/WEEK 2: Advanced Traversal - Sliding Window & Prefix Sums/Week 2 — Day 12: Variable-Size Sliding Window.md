---
title: "Week 2 — Day 12: Variable-Size Sliding Window"
---

Welcome to Day 12! Yesterday on [Day 11](./Week%202%20%E2%80%94%20Day%2011:%20Fixed-Size%20Sliding%20Window.md), we mastered windows with a static length $K$.

Today we study the **Variable-Size Sliding Window** (often called the Dynamic Window or Accordion Pattern). Instead of a rigid frame, the window expands and contracts dynamically to locate the **longest** or **shortest** contiguous subarray satisfying a given constraint.

---

## 1. 🧠 TEACH: The Accordion Mental Model

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* The **Variable-Size Sliding Window** dynamically expands and contracts a contiguous subarray $[L, R]$ based on a monotonic validity condition.
  - *Core Invariants:* Monotonic Pointer Invariant: Both $L$ and $R$ advance strictly forward ($L \le R$); Invariant Maintenance: Expand $R$ to include elements; contract $L$ while the window is invalid (for longest window) or valid (for shortest window).
  - *Misconception Check:* A nested `while` loop inside a `for` loop does *not* mean $O(N^2)$ time! Because $L$ only increments and never resets to 0, each element enters the window at most once and exits at most once ($2N$ operations total $\implies O(N)$ amortized).
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(N^2)$ brute-force examination of all possible subarray endpoints.
  - *Complexity Advantage:* Reduces search time from $O(N^2)$ to $O(N)$ amortized linear time.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Longest substring without repeating characters", "minimum size subarray sum $\ge S$", "fruit into baskets" (at most 2 distinct). Signal words: "longest/shortest contiguous subarray satisfying condition", "all positive numbers".
  - *When to Avoid / Failure Modes:* Non-monotonic conditions (e.g. array with negative numbers where contracting $L$ can either increase or decrease the sum; use prefix sum + hash map instead).
- **4. WHERE:**
  - *Physical CLR Memory:* Stack indices `L` and `R`, plus auxiliary frequency table (`int[128]` or `Dictionary<char, int>`).
  - *Production Systems:* TCP flow control sliding window, video streaming bitrate buffer adaptation, log aggregation sliding windows.
- **5. WHO:**
  - *Spoken Script:* "In a variable sliding window, the right pointer expands the window to incorporate new data, and the left pointer contracts it whenever the validity invariant is violated. Because both pointers move strictly monotonically forward, each element enters and exits the window at most once, guaranteeing $O(N)$ amortized time."
  - *Interviewer Evaluation Lens:* Checks amortized $O(N)$ proof, distinction between longest vs. shortest window templates, and detection of non-monotonic failure modes.
- **6. HOW:**
  - *Cost Model:* Time: $O(2N) = O(N)$ amortized; Space: $O(1)$ for fixed alphabet or $O(K)$ for distinct elements.
  - *State Transition Trace (Longest Substring Without Repeating):* `s="abcabcbb" -> R expands 'a','b','c' (len 3) -> R sees duplicate 'a': L moves past previous 'a' -> window remains valid`.


### 1.1 Physical Mental Model: The Inchworm Locomotion & The Two Window Polarities

A variable-size sliding window moves across an array like an inchworm (caterpillar) crawling along a tree branch:

```
       ======================================================================
         PHYSICAL ANALOGY: INCHWORM EXPANSION & TAIL CONTRACTION
       ======================================================================

       Branch:   [ a ]   [ b ]   [ c ]   [ a ]   [ b ]   [ c ]   [ b ]   [ b ]
       
       STEP 1: HEAD EXPANDS FORWARD (right++)
                 Tail                      Head
                 [ a ] === [ b ] === [ c ] -> [ a ]  (Duplicate 'a' detected!)
                 The inchworm body is over-stretched / invalid!

       STEP 2: TAIL CONTRACTS FORWARD (left++)
                           Tail            Head
                           [ b ] === [ c ] === [ a ]  (Tail passed old 'a': Valid!)
       
       🐛 AMORTIZED O(N) PROOF:
       Head advances at most N steps.
       Tail advances at most N steps.
       Neither pointer EVER moves backward! Total work = N + N = 2N = O(N).
```

```
       ======================================================================
         THE TWO POLARITIES: RUBBER BAND VS VACUUM SHRINK-WRAP
       ======================================================================

       1. LONGEST VALID (Rubber Band - LC 3)
          - Goal: Stretch as wide as possible without snapping.
          - While INVALID: Contract left++ to restore validity.
          - Record maximum length AFTER the while loop (when window is valid!).
          `while (IsInvalid()) { Remove(nums[left++]); }`
          `maxLen = max(maxLen, right - left + 1);`

       2. SHORTEST SATISFYING (Vacuum Shrink-Wrap - LC 209)
          - Goal: Squeeze as tight as possible while still covering target.
          - While VALID: Record length, then contract left++ to test smaller fit!
          - Record minimum length INSIDE the while loop!
          `while (IsValid()) { minLen = min(minLen, right - left + 1); Remove(nums[left++]); }`
```

---

### 1.2 Expansion vs. Contraction

A variable window has two distinct phases driven by its boundaries `[left .. right]`:
- **Expansion (`right++`):** Greedily stretches the window to consume more elements.
- **Contraction (`left++`):** Shrinks the window from the left to either:
  1. **Restore validity** when a constraint has been violated (e.g. duplicate character, too many zeroes), OR
  2. **Minimize size** while maintaining an already-met condition (e.g. finding the minimal length sum $\ge K$).

```
        left                  right
         ▼                      ▼
Array: [ 2 ,  3 ,  1 ,  2 ,  4 ,  3 ]
         ◄────── Window ───────►

1. EXPAND: right moves right (grows window)
2. CONTRACT: left catches up (shrinks window)
```

---

### 1.2 The Two Canonical Templates

All dynamic window problems fall into one of two fundamental templates:

#### Template 1: Find the LONGEST Valid Subarray (Max Window)
Here, the window should grow as large as possible. When the window becomes **invalid**, shrink `left` until it is valid again:

```csharp
int left = 0, maxLen = 0;
for (int right = 0; right < n; right++) {
    // 1. Add nums[right] to window state
    Add(nums[right]);

    // 2. While window is INVALID, contract from the left
    while (IsInvalid()) {
        Remove(nums[left]);
        left++;
    }

    // 3. Window [left .. right] is guaranteed valid: update maximum
    maxLen = Math.Max(maxLen, right - left + 1);
}
```

#### Template 2: Find the SHORTEST Valid Subarray (Min Window)
Here, we expand `right` until the condition is met. While the window is **valid**, record the length and greedily shrink `left` to see if a shorter valid subarray exists:

```csharp
int left = 0, minLen = int.MaxValue;
for (int right = 0; right < n; right++) {
    // 1. Add nums[right] to window state
    Add(nums[right]);

    // 2. While window is VALID, try shrinking from the left
    while (IsValid()) {
        minLen = Math.Min(minLen, right - left + 1);
        Remove(nums[left]);
        left++;
    }
}
```

---

### 1.3 Why the Nested `while` Loop is Strictly $O(N)$ Time

A beginner looking at:
```csharp
for (int right = 0; right < n; right++) {
    while (condition) {
        left++;
    }
}
```
often mistakenly assumes this is $O(N^2)$.

#### The Amortized Proof:
- `right` increments from $0$ to $N - 1$: exactly $N$ steps.
- `left` starts at $0$ and only moves forward (`left++`). It **never moves backward or resets**.
- At most, `left` can increment $N$ times across the entire execution.
- Total pointer movements $= N + N = \mathbf{2N \to O(N)}$ amortized time!

---

### 1.4 The Monotonicity Prerequisite (Why Negatives Break It)

> [!WARNING]
> Dynamic sliding window **strictly requires monotonicity**:
> - Moving `right++` must monotonically increase (or maintain) the condition metric.
> - Moving `left++` must monotonically decrease (or maintain) the condition metric.

If an array contains **negative numbers**, adding an element might *decrease* the sum, and dropping an element might *increase* it. The greedy contract collapses! If negative numbers are present, you must use **Prefix Sum + Hash Map (Day 9)** instead.

---

### 1.5 ⚙️ Core Operations Deep-Dive: Variable-Size Sliding Window Expansion-Contraction Invariants

#### Dimension 1: Operation Contract & Big-O Bounds

##### Variable-Window Primitives (`MinSubArrayLen`, `MaxValidWindow`, `ExpandRight`, `ShrinkLeft`)
- **Signatures:**
  - `public int MinSubArrayLen(int target, int[] nums)`: Computes the minimal contiguous slice length where $\sum \ge target$ in $\Theta(N)$ amortized time.
  - `public int LongestValidSubarray(int[] nums, int constraint)`: Computes maximal contiguous slice length satisfying monotonic predicate in $\Theta(N)$ amortized time.
  - `private void Expand(ref WindowState state, int elem)` / `private void Shrink(ref WindowState state, int elem)`: Incremental state transitions in $O(1)$ time.
- **Preconditions:**
  - Array elements conform to monotonic aggregation (e.g., $nums[i] \ge 0$ for summation; non-decreasing cardinality for distinct sets).
  - $0 \le left \le right < N$.
- **Postconditions:**
  - Returns optimal segment length satisfying predicate $\mathcal{P}$, or fallback (0 or -1) if no contiguous subsegment satisfies $\mathcal{P}$.
  - Memory consumption strictly bounded to $O(1)$ auxiliary space (or $O(|\Sigma|)$ for alphabet frequency table).
- **Complexity Bounds:**

| Strategy | Time Complexity | Auxiliary Space | Pruning Mechanism | Monotonicity Required? |
| :--- | :--- | :--- | :--- | :--- |
| **Two-Pointer Dynamic Window** | **$\Theta(N)$ Amortized** | **$O(1)$** | Monotonic greedy pointer skipping | **Yes** (Strictly non-negative) |
| **Prefix Sum + Binary Search** | $O(N \log N)$ | $O(N)$ | Bisection on prefix table | Yes ($P[i]$ must be monotonic) |
| **Prefix Sum + Hash Table (Day 9)** | $\Theta(N)$ | $O(N)$ | Algebraic complement lookup | **No** (Supports negative values) |
| **Exhaustive Subarray Scan** | $O(N^2)$ | $O(1)$ | None | No |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
       Divergent Decision Trees: Variable Window Dual Paradigms

        [PARADIGM A: MINIMAL VALID]             [PARADIGM B: MAXIMAL VALID]
         (e.g., MinSubArrayLen >= S)            (e.g., Longest Substring <= K)
                     │                                       │
            [Expand right++]                        [Expand right++]
            [Add state(right)]                      [Add state(right)]
                     │                                       │
                     ▼                                       ▼
       ┌───────────────────────────┐           ┌───────────────────────────┐
       ▼                           │           ▼                           │
  [Is Window Valid?]               │      [Is Window INVALID?]             │
  (e.g., sum >= S)                 │      (e.g., distinct > K)             │
       │                           │           │                           │
      YES                          │          YES                          │
       │                           │           │                           │
  [1. Record minLen =              │      [1. Remove state(left)]          │
      Min(minLen, right-left+1)]   │      [2. left++]                      │
  [2. Remove state(left)]          │           │                           │
  [3. left++]                      │           └───────────► (Loop while)  │
       │                           │                                       │
       └───────────► (Loop while)  │                                      NO
                                   │                                       │
                                  NO                        [Window now VALID:
                                   │                         Record maxLen =
                         [Window now INVALID:                Max(maxLen, R-L+1)]
                          Needs more elements]                             │
                                   │                                       ▼
                                   ▼                             [Advance right++]
                           [Advance right++]
```

---

#### Dimension 3: Visual ASCII State Transitions

##### Minimal Valid Window Trace: `nums = [2, 3, 1, 2, 4, 3]`, `target = 7`
```
Phase 1: Expand Right until Valid
L=0, R=0: [2]                 sum = 2 (< 7)
L=0, R=1: [2, 3]              sum = 5 (< 7)
L=0, R=2: [2, 3, 1]           sum = 6 (< 7)
L=0, R=3: [2, 3, 1, 2]        sum = 8 (>= 7)  ──► VALID! len = 4

Phase 2: Contract Left while Valid (Search for Local Minimum)
- Record minLen = Min(INF, 4) = 4
- Shrink left: drop nums[0] (2) ──► sum = 6 (< 7) ──► INVALID, exit while loop

Phase 3: Expand Right
L=1, R=4: [3, 1, 2, 4]        sum = 10 (>= 7) ──► VALID! len = 4
- Record minLen = Min(4, 4) = 4
- Shrink left: drop nums[1] (3) ──► sum = 7 (>= 7) ──► STILL VALID! len = 3
- Record minLen = Min(4, 3) = 3
- Shrink left: drop nums[2] (1) ──► sum = 6 (< 7) ──► INVALID, exit while loop

Phase 4: Expand Right
L=3, R=5: [2, 4, 3]           sum = 9 (>= 7)  ──► VALID! len = 3
- Record minLen = Min(3, 3) = 3
- Shrink left: drop nums[3] (2) ──► sum = 7 (>= 7) ──► STILL VALID! len = 2
- Record minLen = Min(3, 2) = 2  ◄── GLOBAL MINIMUM!
- Shrink left: drop nums[4] (4) ──► sum = 3 (< 7) ──► INVALID, exit while loop
```

---

#### Dimension 4: Invariant Preservation Proof

##### 1. Amortized Complexity Proof via Potential Function $\Phi$:
- Let dynamic potential function $\Phi(t) = 2N - (left + right)$.
- **Initialization:** At $t=0$, $left = 0, right = 0 \implies \Phi(0) = 2N$.
- **Right Step:** The outer loop executes $N$ times. Each increment of `right` costs $O(1)$ actual work and decreases $\Phi$ by 1:
  $$\Delta \Phi_{right} = -1$$
- **Left Step:** The inner `while` condition triggers only when permitted. Each increment of `left` costs $O(1)$ actual work and decreases $\Phi$ by 1:
  $$\Delta \Phi_{left} = -1$$
- **Boundary:** Since $left \le right < N$, at all times $\Phi(t) \ge 0$.
- **Total Work:** The maximum number of increments across both pointers cannot exceed $2N$.
  $$\text{Total Operations} \le N (\text{right increments}) + N (\text{left increments}) = 2N \in O(N)$$

##### 2. Correctness & Pruning Invariant:
- **Claim:** In Minimal Valid Window, skipping subarrays starting at $left$ with endpoints $> right$ never misses a minimal candidate.
- **Proof:** Suppose window $[left \dots right]$ is valid ($\sum_{i=left}^{right} nums[i] \ge target$).
  Any extension $[left \dots right + k]$ ($k \ge 1$) will also have sum $\ge target$ (due to $nums \ge 0$), but its length $(right + k) - left + 1 > right - left + 1$. Thus, no extension anchored at $left$ can yield a strictly smaller length than $[left \dots right]$.
  Hence, advancing `left++` safely discards suboptimal search space without omitting any global optimum. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Scenario | Concrete Input | Danger / Failure Mode | Invariant Protection Mechanism |
| :--- | :--- | :--- | :--- |
| **Target Unreachable** | `nums = [1, 2, 1]`, $target = 100$ | Inner loop never fires; returns uninitialized 0 or INF | Initialize `minLen = int.MaxValue`. At return, test `minLen == int.MaxValue ? 0 : minLen`. |
| **Singleton Array Valid** | `nums = [10]`, $target = 5$ | Off-by-one in length calculation $(0 - 0 + 1)$ | `right - left + 1 = 1`. Inner loop fires once, records `minLen = 1`, increments `left = 1`, and safely terminates. |
| **Singleton Array Invalid**| `nums = [2]`, $target = 5$ | Premature evaluation | Inner loop does not trigger; loop terminates; returns 0. |
| **Entire Array Required** | `nums = [1, 1, 1]`, $target = 3$ | Valid condition met only at last index | At $right = 2$, sum reaches 3. Inner loop triggers, records length 3, drops index 0, sum becomes 2, terminates. |
| **Negative Values Present** | `nums = [2, -1, 5]`, $target = 6$ | Broken monotonicity causes early left contraction | Contraction assumes dropping $nums[left]$ reduces sum. If negative, sum increases! Precondition violation: redirect to Prefix Hash Map. |
| **Zero Values in Array** | `nums = [0, 0, 7]`, $target = 7$ | Redundant zero contractions | $0$ does not change sum; inner loop drops leading zeros, shrinking window to length 1 (`[7]`). Fully preserved. |

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 209 — Minimum Size Subarray Sum (Medium)

> Given an array of **positive integers** `nums` and a positive integer `target`, return the *minimal length of a subarray whose sum is greater than or equal to* `target`. If there is no such subarray, return `0`.

#### Visual Trace:
`nums = [ 2, 3, 1, 2, 4, 3 ]`, `target = 7`

```
right = 0: val = 2, sum = 2 (< 7)
right = 1: val = 3, sum = 5 (< 7)
right = 2: val = 1, sum = 6 (< 7)
right = 3: val = 2, sum = 8 (>= 7) -> VALID!
   minLen = min(inf, 3 - 0 + 1) = 4 [2, 3, 1, 2]
   shrink: drop nums[0]=2, sum = 6 (< 7), left = 1
right = 4: val = 4, sum = 6 + 4 = 10 (>= 7) -> VALID!
   minLen = min(4, 4 - 1 + 1) = 4 [3, 1, 2, 4]
   shrink: drop nums[1]=3, sum = 7 (>= 7) -> VALID!
   minLen = min(4, 4 - 2 + 1) = 3 [1, 2, 4]
   shrink: drop nums[2]=1, sum = 6 (< 7), left = 3
right = 5: val = 3, sum = 6 + 3 = 9 (>= 7) -> VALID!
   minLen = min(3, 5 - 3 + 1) = 3 [2, 4, 3]
   shrink: drop nums[3]=2, sum = 7 (>= 7) -> VALID!
   minLen = min(3, 5 - 4 + 1) = 2 [4, 3]
   shrink: drop nums[4]=4, sum = 3 (< 7), left = 5

Final minLen = 2.
```

#### Production C# Implementation:
```csharp
public class SolutionMinSubArrayLen {
    public int MinSubArrayLen(int target, int[] nums) {
        int left = 0;
        int currentSum = 0;
        int minLen = int.MaxValue;

        for (int right = 0; right < nums.Length; right++) {
            currentSum += nums[right];

            // Greedily shrink while window condition is satisfied
            while (currentSum >= target) {
                int currentWindowLen = right - left + 1;
                if (currentWindowLen < minLen) {
                    minLen = currentWindowLen;
                }

                currentSum -= nums[left];
                left++;
            }
        }

        return (minLen == int.MaxValue) ? 0 : minLen;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — `left` and `right` each visit elements at most once.
- **Space Complexity:** $O(1)$ auxiliary space.

---

### Problem 2: LeetCode 3 — Longest Substring Without Repeating Characters (Medium)

> Given a string `s`, find the length of the **longest substring** without duplicate characters.

#### Direct Fast-Forward Optimization (Jump to Last Seen Index):
Instead of incrementing `left++` step-by-step, maintain an array `lastSeen[128]` storing the most recent index where each ASCII character appeared.
When character `c` is encountered:
- If `c` was seen inside the current window (`lastSeen[c] >= left`):
  Jump `left` directly past that previous occurrence: `left = lastSeen[c] + 1`!

#### Visual Trace:
`s = "pwwkew"`

```
right = 0: 'p', not seen in window. maxLen = max(0, 0-0+1) = 1. lastSeen['p'] = 0.
right = 1: 'w', not seen in window. maxLen = max(1, 1-0+1) = 2. lastSeen['w'] = 1.
right = 2: 'w', ALREADY SEEN at index 1!
   Jump: left = max(0, 1 + 1) = 2.
   maxLen = max(2, 2-2+1) = 2. lastSeen['w'] = 2.
right = 3: 'k', not seen. maxLen = max(2, 3-2+1) = 2. lastSeen['k'] = 3.
right = 4: 'e', not seen. maxLen = max(2, 4-2+1) = 3. lastSeen['e'] = 4.
right = 5: 'w', seen at index 2 (>= left=2).
   Jump: left = max(2, 2 + 1) = 3.
   maxLen = max(3, 5-3+1) = 3. lastSeen['w'] = 5.

Result = 3 ("wke").
```

#### Production C# Implementation:
```csharp
public class SolutionLengthOfLongestSubstring {
    public int LengthOfLongestSubstring(string s) {
        // Fast direct ASCII table to store the last seen 1-based index (or 0 if unseen)
        int[] lastSeen = new int[128];
        int maxLen = 0;
        int left = 0;

        for (int right = 0; right < s.Length; right++) {
            char c = s[right];

            // If c has been seen at or after 'left', fast-forward left
            if (lastSeen[c] > left) {
                left = lastSeen[c];
            }

            maxLen = Math.Max(maxLen, right - left + 1);

            // Record 1-based index of right (so default 0 means unvisited)
            lastSeen[c] = right + 1;
        }

        return maxLen;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — single pass over the string.
- **Space Complexity:** $O(1)$ — fixed 128-element integer lookup array.

---

### Problem 3: LeetCode 1004 — Max Consecutive Ones III (Medium)

> Given a binary array `nums` and an integer `k`, return the *maximum number of consecutive `1`'s in the array if you can flip at most `k` `0`'s*.

#### The Problem Inversion:
*"Flip at most $k$ zeroes"* is mathematically equivalent to:
> *"Find the longest contiguous subarray that contains **at most $k$ zeroes**."*

#### Window Invariant:
Maintain `zeroCount` inside window `[left .. right]`.
- As `right` advances, if `nums[right] == 0`, increment `zeroCount++`.
- If `zeroCount > k`, shrink from the left: if `nums[left] == 0`, decrement `zeroCount--`, and increment `left++`.
- Subarray length is $right - left + 1$.

#### Production C# Implementation:
```csharp
public class SolutionLongestOnes {
    public int LongestOnes(int[] nums, int k) {
        int left = 0;
        int zeroCount = 0;
        int maxLen = 0;

        for (int right = 0; right < nums.Length; right++) {
            if (nums[right] == 0) {
                zeroCount++;
            }

            // Window is invalid when zeroCount exceeds k: shrink from left
            while (zeroCount > k) {
                if (nums[left] == 0) {
                    zeroCount--;
                }
                left++;
            }

            maxLen = Math.Max(maxLen, right - left + 1);
        }

        return maxLen;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — amortized linear scan.
- **Space Complexity:** $O(1)$ auxiliary space.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Apply the expansion/contraction templates to these core problems:

### Problem 1 (Shortest Window): LeetCode 209 — Minimum Size Subarray Sum (Medium)
- **Goal:** Minimal subarray with sum $\ge$ target.
- **Key Insight:** Template 2 (shrink while sum $\ge$ target). All positive numbers guarantee monotonicity.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 2 (Character Set / Jump Window): LeetCode 3 — Longest Substring Without Repeating Characters (Medium)
- **Goal:** Longest substring without duplicates.
- **Key Insight:** Template 1 (expand, jump `left` past previous duplicate). Use `int[128]` for $O(1)$ lookup.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 3 (Flipped Condition): LeetCode 1004 — Max Consecutive Ones III (Medium)
- **Goal:** Max consecutive 1s with at most $k$ flipped 0s.
- **Key Insight:** Invert problem to "at most $k$ zeroes in window".
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Bonus / Extension Challenge: LeetCode 904 — Fruit Into Baskets (Medium)
- **Goal:** Longest contiguous subarray with at most 2 distinct numbers.
- **Hint:** Template 1 with a frequency dictionary of size $\le 2$.

---

## 4. 🔗 CONNECT: Choosing the Right Subarray Pattern

```
Subarray / Range Question Matrix:
  ├─ Fixed length K given?
  │    └─► Fixed-Size Sliding Window (Day 11)
  │
  ├─ Variable length + Constraint (min/max size, target sum) + ALL NON-NEGATIVE?
  │    └─► Variable-Size Sliding Window (Day 12 - Today)
  │
  ├─ Target sum K + CONTAINS NEGATIVE NUMBERS?
  │    └─► Prefix Sum + Hash Map (Day 9) [Sliding window monotonicity fails!]
  │
  └─ Exact character frequency matching (Anagrams / Substring permutations)?
       └─► Window with Frequency Map / Diff Counter (Day 13 - Tomorrow!)
```

---

## 5. 🎯 Day 12 Checkpoint Questions

Verify your mental model before coding:

1. **Failure with Negatives:** Why would dynamic sliding window fail on `Minimum Size Subarray Sum` if `nums = [1, 2, -10, 8]` and `target = 7`? Which step breaks down?
2. **Fast-Forward Jumping:** In LeetCode 3, why does `lastSeen[c] > left` ensure we don't accidentally move `left` *backwards* when encountering a duplicate character that appeared before the current window?
3. **Loop Bounding:** If an array has $N = 100,000$ elements, what is the theoretical maximum number of times the code inside `while (zeroCount > k)` can execute in LeetCode 1004 across the entire run?
