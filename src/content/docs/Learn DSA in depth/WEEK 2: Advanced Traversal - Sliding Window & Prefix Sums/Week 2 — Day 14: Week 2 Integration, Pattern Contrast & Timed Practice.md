---
title: "Week 2 — Day 14: Week 2 Integration, Pattern Contrast & Timed Practice"
---

Welcome to Day 14! You have completed the core traversal and range query curriculum of **Week 2**.

Today is our **Synthesis & Integration Day**. In high-stakes Big Tech interviews, the primary challenge is rarely writing the code—it is **correctly identifying the pattern within the first 60 seconds**. Today, we codify the decision boundaries between **Prefix Sums** and **Sliding Windows**, walk through two classic synthesis problems, and review the Week 2 mental architecture.

---

## 1. 🧠 TEACH: The Traversal Decision Matrix

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* Week 2 Integration synthesizes continuous range queries, contrasting Fixed Window vs. Variable Window vs. 1D/2D Prefix Sums vs. Prefix + HashMap vs. Kadane's Dynamic Subarray Maxima.
  - *Core Invariants:*
    - **Monotonicity Invariant:** Non-negative monotonic inputs enable Sliding Window ($O(1)$ space).
    - **Accumulation Invariant:** Arbitrary/negative inputs or modular equations require Prefix Sums + HashMap ($O(N)$ space).
    - **Local Choice Invariant (Kadane's):** For maximum contiguous subarray sum with negative values, $localMax = \max(nums[i], localMax + nums[i])$ determines whether to extend the previous subarray or start fresh at index $i$ ($O(1)$ space).
  - *Misconception Check:* A common interview pitfall is attempting sliding window on problems with negative numbers (e.g. LC 560 or LC 53). Monotonicity failure is absolute: if contracting the window does not monotonically decrease the metric, sliding window is theoretically invalid.
- **2. WHY:**
  - *Bottleneck Solved:* Prevents choosing the wrong algorithmic pattern under time pressure in technical screens.
  - *Complexity Advantage:* Instantly categorizes problems into $O(N)$ time with $O(1)$ space (Sliding Window / Kadane) vs. $O(N)$ time with $O(N)$ space (Prefix + Map).
- **3. WHEN:**
  - *When to Choose / Signal Words:* Contiguous subarray or substring problems; diagnosis based on input constraints ($nums[i] \ge 0$ vs. $nums[i] \in \mathbb{Z}$) and optimization goals (target sum vs max/min sum vs fixed length).
  - *When to Avoid / Failure Modes:* Non-contiguous subsequences (requires DP or greedy two pointers) or arbitrary subset selections.
- **4. WHERE:**
  - *Physical CLR Memory:* Full spectrum from zero-allocation CPU register state machines (Sliding Window & Kadane) to managed heap hash tables (Prefix Sum + Map) and 2D arrays (Matrix Queries).
  - *Production Systems:* Real-time anomaly detection in telemetry pipelines, financial high-frequency risk exposure windows, analytical OLAP range query engines.
- **5. WHO:**
  - *Spoken Script:* "When analyzing contiguous subarray problems, my first diagnostic check is the objective and monotonicity. If searching for an exact target sum with negative numbers, prefix sums plus a hash map are required in $O(N)$ space. If searching for the maximum or minimum contiguous sum, Kadane's algorithm evaluates local restart in $O(1)$ space. If all elements are non-negative, sliding window yields optimal two-pointer $O(1)$ space."
  - *Interviewer Evaluation Lens:* Evaluates candidate's diagnostic decision tree, immediate detection of negative numbers, and ability to pivot between sliding window, prefix accumulation, and Kadane's recurrence.
- **6. HOW:**
  - *Cost Model:* Sliding Window: $O(N)$ time, $O(1)$ space; Kadane's: $O(N)$ time, $O(1)$ space; Prefix Sum + Map: $O(N)$ time, $O(N)$ space; 2D Prefix: $O(MN)$ build, $O(1)$ query.
  - *State Transition Trace:* Diagnostic check: `Max contiguous sum? -> Kadane; Exact target sum with negatives? -> Prefix Sum + Map; Non-negative constraint? -> Sliding Window`.


### 1.1 The Crucial Fork in the Road

When faced with a contiguous range / subarray question:

```
                               Contiguous Subarray / Substring Problem
                                                 │
            ┌────────────────────────────────────┼────────────────────────────────────┐
            ▼                                    ▼                                    ▼
   Target sum = K with negatives?     Find MAX/MIN contiguous sum?          Are elements NON-NEGATIVE /
   (Or modular divisibility)          (Negative numbers allowed)            metrics strictly monotonic?
            │                                    │                                    │
            ▼                                    ▼                                    ▼
   PREFIX SUM + HASH MAP               KADANE'S ALGORITHM                    SLIDING WINDOW
   • Monotonicity does NOT hold.       • Local vs Global max recurrence      • Monotonicity holds.
   • Target sum: P[j] - P[i-1] == K    • localMax = max(x, localMax + x)     • Expanding right grows metric.
   • P[i-1] = P[j] - K                 • Resets when prefix dips < 0         • Shrinking left reduces metric.
   • O(N) space required.              • O(1) space, O(N) time!              • O(1) space achievable!
```

---

### 1.2 Side-by-Side Architectural Contrast

| Dimension | Sliding Window (Days 11–13) | Prefix Sum (+ Hash Map) (Days 8–10) | Kadane's Algorithm (Day 14) |
| :--- | :--- | :--- | :--- |
| **Monotonicity** | **Strictly Required.** Expanding grows, shrinking shrinks. | **Not Required.** Handles negative numbers and modulo. | **Not Required.** Discards negative accumulator prefixes dynamically. |
| **Space Complexity** | **$O(1)$** auxiliary space in almost all cases. | **$O(N)$** auxiliary space (hash table or prefix grid). | **$O(1)$** auxiliary space (two scalar registers). |
| **Goal Archetypes** | • Shortest / longest valid window<br>• Fixed length $K$ averages/maxima<br>• Exact multiset / anagram matching | • Count of subarrays summing to $K$<br>• Subarrays divisible by $K$<br>• Static 1D/2D range queries | • Maximum / minimum contiguous subarray sum<br>• Maximum circular subarray sum<br>• 2D maximum sum submatrix (row compression) |
| **Failure Mode** | Applying it to arrays with negative numbers (greedy pointers fail). | Using it when an $O(1)$ space sliding window or Kadane was possible. | Using it when subarray must equal an exact target $K$ (cannot handle non-extrema targets). |

---

### 1.3 The 3-Second Pattern Triage Checklist

Ask these four questions sequentially:
1. **Is the array static and asked for multiple range sums?**
   $\to$ **1D or 2D Prefix Sum Array** ($O(1)$ per query).
2. **Does the problem ask for the maximum/minimum contiguous sum with arbitrary/negative numbers?**
   $\to$ **Kadane's Algorithm** ($O(N)$ time, $O(1)$ space).
3. **Does the problem ask for subarrays summing to an exact $K$ and contains negative numbers?**
   $\to$ **Prefix Sum + Hash Map** ($P[i-1] = P[j] - K$).
4. **Does the problem ask for the longest / shortest substring or subarray under a monotonic constraint?**
   $\to$ **Variable-Size Sliding Window** (Accordion pattern).

---

### 1.4 Kadane's Algorithm: The Local vs. Global Subarray Invariant

#### The Invariant Formulation:
For an array $nums$, define $localMax[i]$ as the maximum sum of **any non-empty contiguous subarray that ends strictly at index $i$**.
At index $i$, we face a binary choice:
1. **Extend:** Add $nums[i]$ to the existing optimal subarray ending at $i-1$: $localMax[i-1] + nums[i]$.
2. **Restart:** Start a brand-new subarray at index $i$: $nums[i]$.

$$\mathbf{localMax[i] = \max(nums[i], localMax[i-1] + nums[i])}$$

The overall maximum subarray sum across the entire array is simply:
$$\mathbf{globalMax = \max_{0 \le i < N} localMax[i]}$$

Since $localMax[i]$ only depends on $localMax[i-1]$, we only need a single integer variable, yielding **$O(N)$ time and $O(1)$ auxiliary space**.

#### The Circular Array Extension (LeetCode 918):
When the array is circular, the maximum subarray either:
- **Case 1 (Standard):** Does not wrap around $\implies \text{KadaneMax}(nums)$.
- **Case 2 (Wrapped):** Wraps around the boundary. The elements *not* included form a contiguous minimum subarray in the middle!
  $$\text{MaxWrapped} = \text{TotalSum} - \text{KadaneMin}(nums)$$
- **Crucial Edge Case:** If all numbers are negative, $\text{TotalSum} - \text{KadaneMin} = 0$ (empty subarray), which is invalid since subarrays must be non-empty. In that case, return $\text{KadaneMax}$.
$$\mathbf{\text{Result} = (\text{KadaneMax} < 0) \ ? \ \text{KadaneMax} : \max(\text{KadaneMax}, \text{TotalSum} - \text{KadaneMin})}$$

---

## 2. 🎬 DEMONSTRATE: Integration Problems

---

### Problem 1: LeetCode 424 — Longest Repeating Character Replacement (Medium)

> You are given a string `s` and an integer `k`. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most `k` times.
> Return the *length of the longest substring containing the same letter you can get after performing the above operations*.

#### The Mathematical Window Invariant:
For any candidate window `[left .. right]`:
- Window length: $\text{windowLen} = \text{right} - \text{left} + 1$
- Let $\text{maxFreq}$ be the count of the **most frequent single character** currently in the window.
- The number of characters that must be changed to make the entire window uniform is:
  $$\text{Replacements Needed} = \text{windowLen} - \text{maxFreq}$$

The window is **valid** if and only if:
$$\mathbf{\text{windowLen} - \text{maxFreq} \le k}$$

#### The Counter-Intuitive Optimization (Non-Shrinking Window):
Do we need to decrease `maxFreq` when shrinking `left`?
**NO!**
A smaller `maxFreq` can never give us a larger window length than the maximum we've already seen. We only care about states where `maxFreq` *increases* beyond our previous historical high!
This allows a non-shrinking $O(N)$ pass.

#### Visual Trace:
`s = "AABABBA"`, `k = 1`

```
right = 0: 'A', count['A']=1, maxFreq=1, len=1, changes = 1 - 1 = 0 <= 1. maxLen = 1
right = 1: 'A', count['A']=2, maxFreq=2, len=2, changes = 2 - 2 = 0 <= 1. maxLen = 2
right = 2: 'B', count['B']=1, maxFreq=2, len=3, changes = 3 - 2 = 1 <= 1. maxLen = 3
right = 3: 'A', count['A']=3, maxFreq=3, len=4, changes = 4 - 3 = 1 <= 1. maxLen = 4 ("AABA")
right = 4: 'B', count['B']=2, maxFreq=3, len=5, changes = 5 - 3 = 2 > 1 (INVALID!)
   Shrink left: drop s[0]='A', count['A']=2, left=1. len becomes 4.
right = 5: 'B', count['B']=3, maxFreq=3, len=5, changes = 5 - 3 = 2 > 1 (INVALID!)
   Shrink left: drop s[1]='A', count['A']=1, left=2. len becomes 4.
right = 6: 'A', count['A']=2, maxFreq=3, len=5, changes = 5 - 3 = 2 > 1 (INVALID!)
   Shrink left: drop s[2]='B', count['B']=2, left=3. len becomes 4.

Final result = 4.
```

#### Production C# Implementation:
```csharp
public class SolutionCharacterReplacement {
    public int CharacterReplacement(string s, int k) {
        int[] freq = new int[26];
        int left = 0;
        int maxFreq = 0;
        int maxLen = 0;

        for (int right = 0; right < s.Length; right++) {
            int rIdx = s[right] - 'A';
            freq[rIdx]++;
            if (freq[rIdx] > maxFreq) {
                maxFreq = freq[rIdx];
            }

            // If characters to replace exceed k, shift left boundary
            while ((right - left + 1) - maxFreq > k) {
                freq[s[left] - 'A']--;
                left++;
            }

            maxLen = Math.Max(maxLen, right - left + 1);
        }

        return maxLen;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — single pass.
- **Space Complexity:** $O(1)$ — fixed 26-element integer table.

---

### Problem 2: LeetCode 904 — Fruit Into Baskets (Medium)

> You are visiting a farm that has a single row of fruit trees arranged from left to right. The trees are represented by an integer array `fruits` where `fruits[i]` is the **type** of fruit the $i$-th tree produces.
> You have **two baskets**, and each basket can only hold a **single type** of fruit. There is no limit on the amount of fruit each basket can hold.
> Starting from any tree of your choice, you must pick **exactly one fruit** from every tree (including the start tree) while moving to the right. The moment you reach a tree with fruit that cannot fit in your baskets, you must stop.
> Return the *maximum number of fruits you can pick*.

#### The Problem Translation:
Strip away the story. What is the pure DSA question?
> *"Find the length of the longest contiguous subarray that contains **at most 2 distinct integers**."*

#### Production C# Implementation:
```csharp
public class SolutionTotalFruit {
    public int TotalFruit(int[] fruits) {
        // Map stores { fruitType : frequency in current window }
        var basket = new Dictionary<int, int>();
        int left = 0;
        int maxFruits = 0;

        for (int right = 0; right < fruits.Length; right++) {
            int currentFruit = fruits[right];
            basket[currentFruit] = basket.GetValueOrDefault(currentFruit, 0) + 1;

            // If we have more than 2 types of fruit, shrink from left
            while (basket.Count > 2) {
                int leftFruit = fruits[left];
                basket[leftFruit]--;
                if (basket[leftFruit] == 0) {
                    basket.Remove(leftFruit);
                }
                left++;
            }

            maxFruits = Math.Max(maxFruits, right - left + 1);
        }

        return maxFruits;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — `left` and `right` each move at most $N$ times.
- **Space Complexity:** $O(1)$ — `basket` never contains more than 3 distinct keys at any time.

---

### Problem 3: LeetCode 53 — Maximum Subarray (Medium) ⭐⭐⭐

> Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return *its sum*.
>
> **Constraints:** $1 \le \text{nums.Length} \le 10^5$, $-10^4 \le \text{nums}[i] \le 10^4$.

#### Conceptual Walkthrough:
Why not sliding window? Because `nums` contains negative numbers. If we expand or shrink, the sum does not change monotonically.
Why not prefix sum + hash map? We are not searching for a specific target $K$; we want the *maximum* possible sum.
**Kadane's Algorithm** maintains the local optimal sum ending at current index `i`:
```csharp
public class SolutionMaxSubArray {
    public int MaxSubArray(int[] nums) {
        int localMax = nums[0];
        int globalMax = nums[0];

        for (int i = 1; i < nums.Length; i++) {
            // Choice: extend previous subarray or start new from nums[i]
            localMax = Math.Max(nums[i], localMax + nums[i]);
            globalMax = Math.Max(globalMax, localMax);
        }

        return globalMax;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — single pass over the array.
- **Space Complexity:** $O(1)$ — two integer scalar variables in CPU registers.

---

### Problem 4: LeetCode 918 — Maximum Sum Circular Subarray (Medium) ⭐⭐⭐

> Given a circular integer array `nums` of length `n`, return the maximum possible sum of a non-empty subarray of `nums`.
> A circular array means the end of the array connects to the beginning of the array.

#### The Circular Invariant:
A circular maximum subarray either:
1. Does not wrap around: standard `maxSubarray` via Kadane.
2. Wraps around: `totalSum - minSubarray` (where `minSubarray` is the minimum contiguous subarray found via Kadane).
3. **Corner Case:** If all numbers are negative, `totalSum == minSubarray`, making `totalSum - minSubarray == 0` (empty subarray, which is forbidden). In this case, return `maxSubarray`.

```csharp
public class SolutionMaxSubarraySumCircular {
    public int MaxSubarraySumCircular(int[] nums) {
        int totalSum = 0;
        int localMax = 0, globalMax = nums[0];
        int localMin = 0, globalMin = nums[0];

        foreach (int x in nums) {
            totalSum += x;

            // Standard Kadane for maximum
            localMax = Math.Max(x, localMax + x);
            globalMax = Math.Max(globalMax, localMax);

            // Inverted Kadane for minimum
            localMin = Math.Min(x, localMin + x);
            globalMin = Math.Min(globalMin, localMin);
        }

        // If all elements are negative, globalMax is the largest single negative element
        return globalMax < 0 ? globalMax : Math.Max(globalMax, totalSum - globalMin);
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — single simultaneous pass calculating max and min Kadane.
- **Space Complexity:** $O(1)$ — constant scalar variables.

---

## 3. 🏋️ PRACTICE: Week 2 Timed Drill

Put away all notes and simulate interview conditions (timed):

| Problem | Target Time | Core Pattern | Key Trap |
| :--- | :--- | :--- | :--- |
| **[LeetCode 53] Maximum Subarray** | 10 mins | Kadane's Local vs Global Max | Initializing max with 0 instead of `nums[0]` when all negative |
| **[LeetCode 918] Max Circular Subarray** | 20 mins | Dual Kadane (Max & Min) | Handling the all-negative elements wrap-around trap |
| **[LeetCode 424] Character Replacement** | 20 mins | Variable Window | `windowLen - maxFreq <= k` invariant |
| **[LeetCode 904] Fruit Into Baskets** | 15 mins | Variable Window (At most 2 distinct) | Cleaning map key when count reaches 0 |
| **[LeetCode 560] Subarray Sum Equals K** | 15 mins | Prefix Sum + Hash Map | Base case `{0: 1}` initialization |
| **[LeetCode 76] Minimum Window Substring** | 30 mins | Frequency Deficit Window | Excess characters (`need[c] < 0`) |

---

## 4. 🔗 CONNECT: Looking Ahead to Week 3

Congratulations on completing **Week 2**! Here is the journey so far:

- **Week 1:** Contiguous memory, RAM addressing, cache lines, in-place pointer coordination (Opposite-Ends, Fast & Slow), sorting order invariants.
- **Week 2:** Range calculations, cumulative sums (1D & 2D), Subarray Sum via hash complement, and the full Sliding Window hierarchy (Fixed, Variable, Frequency-Tracked).

### Tomorrow: Week 3 (String Fundamentals & Classic String Patterns)
Tomorrow in **Day 15**, we enter the memory internals of strings:
- String immutability in managed runtimes (C#, Java, Python)
- The $O(N^2)$ heap allocation trap of string concatenation in loops
- `StringBuilder` growth amortized analysis
- Frequency arrays vs Hash Maps for string key generation

---

## 5. 🎯 Day 14 Checkpoint Questions

1. **The Decision Test:** If an interviewer asks: *"Find the length of the shortest subarray whose sum equals K"*, and mentions the array can contain negative values, why must you reject Sliding Window and use Prefix Sum + Hash Map?
2. **Frequency Invariance in LC 424:** Why is it mathematically safe to leave `maxFreq` unchanged even when the character leaving at `left` was the one contributing to `maxFreq`?
3. **Map Cleanup in LC 904:** In Fruit Into Baskets, why is `basket.Remove(leftFruit)` strictly necessary when its count reaches 0? What happens to `basket.Count` if you omit that call?
4. **Kadane's Local vs Global Invariant:** In Kadane's algorithm, what does `localMax` physically represent at step `i`, and why does comparing `nums[i]` against `localMax + nums[i]` mathematically determine whether to extend or reset?
5. **Circular Subarray All-Negative Edge Case:** In LeetCode 918, if all elements in the array are negative (e.g. `[-3, -2, -3]`), why does `totalSum - minSubarray` return `0`, and why would returning `0` be an incorrect answer?
