# 🚀 Week 2 — Day 9: Prefix Sum + Hash Map (The Subarray Sum Pattern)

Welcome to Day 9! Today we study one of the most powerful and high-frequency array patterns asked in Big Tech interviews: **Prefix Sum combined with a Hash Map**.

Yesterday on [Day 8](file:///Users/thaihai-swe/Desktop/my-prompt/learn%20DSA%20in%20depth/WEEK%202:%20Advanced%20Traversal%20-%20Sliding%20Window%20&%20Prefix%20Sums/Week%202%20%E2%80%94%20Day%208:%20Prefix%20Sum%20Fundamentals%20%281D%29.md), we explored static range sum queries using the property $\text{Sum}(L \dots R) = P[R] - P[L-1]$. Today, we invert that formula to locate sub-arrays dynamically in $O(N)$ time—**even when the array contains negative numbers**, a scenario where sliding window completely collapses.

---

## 1. 🧠 TEACH: The Synthesis of Running Sums and Hash Lookups

### 1.1 The Critical Dilemma: Why Sliding Window Fails on Negative Numbers

Consider this problem:
> *Find the number of continuous subarrays that sum to $K = 5$.*
> `nums = [ 2, 3, -4, 4, 1, -1, 5 ]`

If you attempt to use a **Sliding Window** (Two Pointers moving right):
- When `currentSum < 5`, you expand `right++` assuming the sum will increase.
- But what if `nums[right]` is **negative** (e.g. $-4$)? The sum **decreases**!
- When `currentSum > 5`, you shrink `left++` assuming the sum will decrease.
- But what if `nums[left]` is **negative**? Subtracting a negative number **increases** the sum!

```
Sliding Window relies on MONOTONICITY:
  Expand right  ──> Sum strictly non-decreasing (requires nums[i] >= 0)
  Shrink left   ──> Sum strictly non-increasing (requires nums[i] >= 0)

With negative numbers, monotonicity is DESTROYED.
Greedy expansion and contraction no longer work!
```

---

### 1.2 The Algebraic Inversion: Two Sum on Prefix Sums

Recall the definition of a contiguous subarray sum from index $i$ to $j$:

$$\sum_{k=i}^{j} \text{nums}[k] = P[j] - P[i - 1] = K$$

Now, apply elementary algebra to isolate the unknown historical prefix:

$$P[i - 1] = P[j] - K$$

```
                                  Standing at index j
                                  Current running sum: P[j]
                                           ▼
┌──────────────────────────────────────────┬────────────────────────┐
│              nums[0 .. i-1]              │      nums[i .. j]      │
└──────────────────────────────────────────┴────────────────────────┘
◄────────── Prefix P[i-1] ────────────────►◄────── Subarray Sum ────►
          Target: Must equal (P[j] - K)                  Target: K
```

**The Core Epiphany:**
> As we iterate through the array and maintain the running sum $P[j]$, we do not search forward for what comes next. Instead, we look **backward** and ask:
> 
> *"How many times have we previously seen a prefix sum equal to $(P[j] - K)$?"*

Every prior occurrence of $(P[j] - K)$ marks the start of a valid subarray ending exactly at $j$ that sums to $K$. By recording historical prefix sum frequencies in a **Hash Map**, this query takes **$O(1)$** time!

---

### 1.3 The Two Types of Hash Map Storage

Depending on what the problem asks for, the value stored in the Hash Map changes:

| Problem Goal | Hash Map Key | Hash Map Value | Action on Match |
| :--- | :--- | :--- | :--- |
| **Count total subarrays** (LC 560, LC 974) | `prefixSum` | **Frequency count** (`int`) | `totalCount += map[prefixSum - K]` |
| **Maximize subarray length** (LC 525, LC 325) | `prefixSum` | **First (earliest) index** (`int`) | `maxLen = Math.Max(maxLen, j - map[prefixSum - K])` |

> [!IMPORTANT]
> When maximizing length, **never overwrite** an existing key in the map! To maximize $j - i$, you want $i$ to be as small (as far to the left) as possible.

---

### 1.4 The Base Case Trap: Why Initialize `{0: 1}` or `{0: -1}`?

What happens if a subarray starting from the very first element (index $0$) sums to $K$?
- Let `nums = [5]`, $K = 5$.
- At index $j = 0$, $P[0] = 5$.
- We calculate target: $P[j] - K = 5 - 5 = 0$.
- If our map has no record of `0`, we will look up `map[0]`, find nothing, and fail to count the valid subarray `nums[0 .. 0]`!

```
Rule for Count Problems:
Initialize map[0] = 1.
Meaning: "A prefix sum of 0 has occurred 1 time before any elements were inspected (the empty prefix)."

Rule for Max Length Problems:
Initialize map[0] = -1.
Meaning: "A prefix sum of 0 conceptually occurs at dummy index -1. If P[j] == 0, the length is j - (-1) = j + 1."
```

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 560 — Subarray Sum Equals K (Medium)

> Given an array of integers `nums` and an integer `k`, return the *total number of subarrays whose sum equals to* `k`.
>
> A subarray is a contiguous **non-empty** sequence of elements within an array.

#### Visual Step-by-Step Trace:
Let `nums = [ 1,  2,  3, -2,  1,  2 ]`, `k = 3`.

Initialize:
- `count = 0`
- `runningSum = 0`
- `prefixFreq = { 0: 1 }` (base case)

```
───────────────────────────────────────────────────────────────────────────────
Step 1: i = 0, val = 1
  runningSum = 0 + 1 = 1
  target = runningSum - k = 1 - 3 = -2
  Is -2 in prefixFreq? No (0 times).
  count += 0 -> count = 0
  Record runningSum: prefixFreq[1] = 1
  prefixFreq state: { 0:1, 1:1 }
───────────────────────────────────────────────────────────────────────────────
Step 2: i = 1, val = 2
  runningSum = 1 + 2 = 3
  target = runningSum - k = 3 - 3 = 0
  Is 0 in prefixFreq? YES! (freq = 1).
  count += 1 -> count = 1   [Valid subarray: nums[0..1] -> (1 + 2 = 3)]
  Record runningSum: prefixFreq[3] = 1
  prefixFreq state: { 0:1, 1:1, 3:1 }
───────────────────────────────────────────────────────────────────────────────
Step 3: i = 2, val = 3
  runningSum = 3 + 3 = 6
  target = runningSum - k = 6 - 3 = 3
  Is 3 in prefixFreq? YES! (freq = 1).
  count += 1 -> count = 2   [Valid subarray: nums[2..2] -> (3 = 3)]
  Record runningSum: prefixFreq[6] = 1
  prefixFreq state: { 0:1, 1:1, 3:1, 6:1 }
───────────────────────────────────────────────────────────────────────────────
Step 4: i = 3, val = -2
  runningSum = 6 + (-2) = 4
  target = runningSum - k = 4 - 3 = 1
  Is 1 in prefixFreq? YES! (freq = 1).
  count += 1 -> count = 3   [Valid subarray: nums[1..3] -> (2 + 3 - 2 = 3)]
  Record runningSum: prefixFreq[4] = 1
  prefixFreq state: { 0:1, 1:1, 3:1, 4:1, 6:1 }
───────────────────────────────────────────────────────────────────────────────
Step 5: i = 4, val = 1
  runningSum = 4 + 1 = 5
  target = runningSum - k = 5 - 3 = 2
  Is 2 in prefixFreq? No.
  count += 0 -> count = 3
  Record runningSum: prefixFreq[5] = 1
  prefixFreq state: { 0:1, 1:1, 3:1, 4:1, 5:1, 6:1 }
───────────────────────────────────────────────────────────────────────────────
Step 6: i = 5, val = 2
  runningSum = 5 + 2 = 7
  target = runningSum - k = 7 - 3 = 4
  Is 4 in prefixFreq? YES! (freq = 1).
  count += 1 -> count = 4   [Valid subarray: nums[4..5] -> (1 + 2 = 3)]
  Record runningSum: prefixFreq[7] = 1

Final Result: count = 4.
```

#### Production C# Implementation:
```csharp
public class SolutionSubarraySumEqualsK {
    public int SubarraySum(int[] nums, int k) {
        int count = 0;
        int runningSum = 0;
        
        // Key: prefix sum, Value: number of times this prefix sum has occurred
        var prefixFreq = new Dictionary<int, int>();
        
        // Base case: an empty prefix has sum 0 occurring once
        prefixFreq[0] = 1;
        
        for (int i = 0; i < nums.Length; i++) {
            runningSum += nums[i];
            
            // If (runningSum - k) exists in history, those prefixes form valid subarrays
            int complement = runningSum - k;
            if (prefixFreq.TryGetValue(complement, out int freq)) {
                count += freq;
            }
            
            // Add current runningSum to frequency map
            if (prefixFreq.TryGetValue(runningSum, out int currentCount)) {
                prefixFreq[runningSum] = currentCount + 1;
            } else {
                prefixFreq[runningSum] = 1;
            }
        }
        
        return count;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — single pass; dictionary lookups and insertions are amortized $O(1)$.
- **Space Complexity:** $O(N)$ — up to $N + 1$ unique prefix sums stored in the dictionary.

---

### Problem 2: LeetCode 525 — Contiguous Array (Medium)

> Given a binary array `nums`, return the *maximum length of a contiguous subarray with an equal number of `0` and `1`*.

#### The Modeling Insight: Transform 0 into -1
If an array contains equal counts of zeroes and ones:
$$\text{count}(1) = \text{count}(0) \iff \text{count}(1) - \text{count}(0) = 0$$

If we replace every `0` with `-1`:
- Adding a `1` increments the sum by $+1$.
- Adding a `0` decrements the sum by $-1$.
- A subarray with equal zeroes and ones will have a sum of **strictly $0$**!

Now the problem simplifies to:
> *"Find the maximum length of a contiguous subarray with sum equal to $0$."*

$$\text{Sum}(i \dots j) = P[j] - P[i - 1] = 0 \iff P[j] = P[i - 1]$$

Whenever we see the **same prefix sum twice**, the elements between the first occurrence and the current index sum to $0$!

#### Visual Trace:
`nums = [ 0,  1,  0,  1,  1,  0 ]`  
Converted: `[-1,  1, -1,  1,  1, -1 ]`

Initialize: `firstSeen = { 0: -1 }`, `maxLen = 0`, `runningSum = 0`

| $i$ | `nums[i]` | delta | `runningSum` | `firstSeen` lookup | `maxLen` update | `firstSeen` update |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **0** | 0 | -1 | -1 | Not found | `maxLen = 0` | Add `-1: 0` |
| **1** | 1 | +1 | 0 | Found at `-1` | $1 - (-1) = \mathbf{2}$ | Already present, keep `0: -1` |
| **2** | 0 | -1 | -1 | Found at `0` | $\max(2, 2 - 0) = \mathbf{2}$ | Already present, keep `-1: 0` |
| **3** | 1 | +1 | 0 | Found at `-1` | $\max(2, 3 - (-1)) = \mathbf{4}$ | Already present, keep `0: -1` |
| **4** | 1 | +1 | +1 | Not found | `maxLen = 4` | Add `1: 4` |
| **5** | 0 | -1 | 0 | Found at `-1` | $\max(4, 5 - (-1)) = \mathbf{6}$ | Already present, keep `0: -1` |

**Result:** `maxLen = 6` (the entire array has three 0s and three 1s).

#### Production C# Implementation:
```csharp
public class SolutionContiguousArray {
    public int FindMaxLength(int[] nums) {
        int maxLen = 0;
        int runningSum = 0;
        
        // Key: prefix sum, Value: earliest index where this prefix sum occurred
        var firstSeen = new Dictionary<int, int>();
        
        // Base case: prefix sum 0 occurs before the array starts at index -1
        firstSeen[0] = -1;
        
        for (int i = 0; i < nums.Length; i++) {
            // Treat 1 as +1, and 0 as -1
            runningSum += (nums[i] == 1) ? 1 : -1;
            
            if (firstSeen.TryGetValue(runningSum, out int prevIndex)) {
                // Do not update map! Keep earliest index to maximize (i - prevIndex)
                maxLen = Math.Max(maxLen, i - prevIndex);
            } else {
                firstSeen[runningSum] = i;
            }
        }
        
        return maxLen;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — single pass.
- **Space Complexity:** $O(N)$ — auxiliary dictionary.

---

### Problem 3: LeetCode 974 — Subarray Sums Divisible by K (Medium)

> Given an integer array `nums` and an integer `k`, return the *number of non-empty subarrays that have a sum divisible by* `k`.

#### Mathematical Invariant: Modular Arithmetic
A subarray sum $\text{nums}[i \dots j]$ is divisible by $K$ if:

$$(P[j] - P[i - 1]) \pmod K = 0 \iff P[j] \pmod K = P[i - 1] \pmod K$$

If two prefix sums have the exact same remainder modulo $K$, the subarray between them is divisible by $K$!

#### The Negative Modulo Trap in C# / Java / C++:
In C#, `-7 % 5 = -2` (truncated toward zero), whereas mathematical modulo requires remainders to be strictly non-negative: $-7 \equiv 3 \pmod 5$.

If we don't normalize, $-2$ and $3$ won't match even though $(-2) - 3 = -5$ is divisible by 5!

**The Universal Non-Negative Modulo Formula:**
```csharp
int remainder = ((runningSum % k) + k) % k;
```

#### Array Optimization:
Since the remainder is guaranteed to be in $[0, K - 1]$, we do **not even need a `Dictionary`**! We can use a direct `int[k]` frequency array, achieving instant cache-friendly indexing.

#### Production C# Implementation:
```csharp
public class SolutionSubarraySumsDivisibleByK {
    public int SubarraysDivByK(int[] nums, int k) {
        int count = 0;
        int runningSum = 0;
        
        // Direct array lookup for remainders in [0 .. k - 1]
        int[] remainderFreq = new int[k];
        
        // Base case: remainder 0 occurs once before processing (empty prefix)
        remainderFreq[0] = 1;
        
        for (int i = 0; i < nums.Length; i++) {
            runningSum += nums[i];
            
            // Normalize remainder to range [0 .. k - 1]
            int remainder = ((runningSum % k) + k) % k;
            
            // Add count of previous prefixes having the same remainder
            count += remainderFreq[remainder];
            
            // Increment frequency for this remainder
            remainderFreq[remainder]++;
        }
        
        return count;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — single pass with $O(1)$ primitive array operations.
- **Space Complexity:** $O(K)$ — fixed-size array of length $K$.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Solve these in order to cement the pattern:

### Problem 1 (The Canonical Classic): LeetCode 560 — Subarray Sum Equals K (Medium)
- **Goal:** Find number of contiguous subarrays summing to $K$.
- **Key Insight:** `target = runningSum - k`. Map stores frequency. Base case `map[0] = 1`.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.

### Problem 2 (Sign Inversion Trick): LeetCode 525 — Contiguous Array (Medium)
- **Goal:** Maximum length of subarray with equal 0s and 1s.
- **Key Insight:** Convert `0` to `-1`. Target sum is $0$. Map stores earliest index. Do not overwrite existing keys.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.

### Problem 3 (Modular Congruence): LeetCode 974 — Subarray Sums Divisible by K (Medium)
- **Goal:** Count subarrays whose sum is a multiple of $K$.
- **Key Insight:** Two prefixes with identical remainders yield a divisible subarray. Remember negative normalization: `((sum % k) + k) % k`.
- **Target Complexity:** $O(N)$ time, $O(K)$ space.

### Bonus Challenge: LeetCode 523 — Continuous Subarray Sum (Medium)
- **Goal:** Subarray of length **at least 2** whose sum is a multiple of $K$.
- **Hint:** Combine the earliest-index map from LC 525 with the remainder logic from LC 974, checking condition `i - map[rem] >= 2`.

---

## 4. 🔗 CONNECT: The Progression of Traversal Patterns

Observe the evolutionary hierarchy:

```
Level 1: Two Sum (Hash Map)
  Target: nums[i] + nums[j] == K  ──►  Look for (K - nums[j]) in map.

Level 2: 1D Prefix Sum (Day 8)
  Range sum: sum(L..R) = P[R] - P[L-1].

Level 3: Subarray Sum via Prefix Sum + Hash Map (Day 9)
  Target: P[j] - P[i-1] == K  ──►  Look for (P[j] - K) in map.
  It is literally Two Sum applied to the cumulative prefix sums!
```

---

## 5. 🎯 Day 9 Checkpoint Questions

Before you jump into coding, verify your intuition:

1. **The Base Case:** If `nums = [3, 4]`, `k = 3`, trace line-by-line what happens at index 0 if `prefixFreq` is initialized empty `{}` vs initialized with `{0: 1}`.
2. **Frequency vs Index:** Why does LeetCode 560 increment map frequencies (`map[sum]++`) on every step, while LeetCode 525 strictly refuses to overwrite an existing key in the map?
3. **Modulo Mechanics:** Why is `(-8 % 5)` problematic in C# for LeetCode 974, and how does `((sum % k) + k) % k` mathematically correct it?
