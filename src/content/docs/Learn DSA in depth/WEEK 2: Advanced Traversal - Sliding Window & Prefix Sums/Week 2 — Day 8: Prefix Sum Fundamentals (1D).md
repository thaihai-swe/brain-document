# 🚀 Week 2 — Day 8: Prefix Sum Fundamentals (1D)

Welcome to **Week 2**! In Week 1, you built an unshakeable foundation in array memory layout, in-place pointer coordination (Opposite-Ends, Fast & Slow), and sorting invariants. 

This week, we elevate our traversal capabilities into **continuous range queries and windowing techniques**. Today's focus is **Prefix Sums (1D)** — one of the most elegant and frequently tested patterns in technical interviews. It converts expensive $O(N)$ range scans into instantaneous $O(1)$ queries through clever precomputation.

---

## 1. 🧠 TEACH: The Mechanics of Cumulative Sums

### 1.1 The Bottleneck of Naive Range Queries

Imagine you are given an array of size $N$ and asked $Q$ queries of the form:
> *"What is the sum of elements from index $L$ to index $R$ inclusive?"*

```
nums = [ 3,  1,  4,  1,  5,  9,  2,  6 ]
          0   1   2   3   4   5   6   7
Query 1: Sum(2, 5) -> 4 + 1 + 5 + 9 = 19
Query 2: Sum(0, 4) -> 3 + 1 + 4 + 1 + 5 = 14
Query 3: Sum(3, 7) -> 1 + 5 + 9 + 2 + 6 = 23
```

- **Naive approach:** For every query $(L, R)$, loop from $L$ to $R$ and add the numbers.
- **Cost:** Each query takes $O(R - L + 1) = O(N)$ time.
- **Total Time:** For $Q$ queries, the overall runtime is **$O(Q \times N)$**.
- **The Failure:** If $N = 10^5$ and $Q = 10^5$, $Q \times N = 10^{10}$ operations $\to$ **Time Limit Exceeded (TLE)**. The CPU wastes vast amounts of cycles repeatedly summing the exact same overlapping sub-ranges.

---

### 1.2 The Core Insight: Subtraction Over Overlapping Intervals

Instead of computing the sum from $L$ to $R$ from scratch every time, observe the relationship between ranges starting from index $0$:

$$\sum_{k=L}^{R} \text{nums}[k] = \left(\sum_{k=0}^{R} \text{nums}[k]\right) - \left(\sum_{k=0}^{L-1} \text{nums}[k]\right)$$

```
Index:         0    1    2    3    4    5    6    7
nums:        [ 3 ,  1 ,  4 ,  1 ,  5 ,  9 ,  2 ,  6 ]
             ├──────────────────────────┤
             Prefix(5) = sum(0..5) = 23
             ├───┤
          Prefix(1) = sum(0..1) = 4
                  ├─────────────────────┤
                  Desired Range Sum(2..5) = Prefix(5) - Prefix(1) = 23 - 4 = 19!
```

If we precalculate the cumulative sum up to every position once in $O(N)$ time, any arbitrary range sum $(L \dots R)$ can be answered in **$O(1)$ constant time** using a single subtraction!

---

### 1.3 The 1-Based Dummy Prefix Array Pattern (Industry Standard)

A common stumbling block for candidates is handling the edge case where $L = 0$:
$$\text{Sum}(0 \dots R) = P[R] - P[-1] \quad \text{(Out of bounds index!)}$$

If you use a 0-indexed prefix array of size $N$, you are forced to add branching logic to every query:
```csharp
// Clunky & branch-heavy:
return (L == 0) ? prefix[R] : prefix[R] - prefix[L - 1];
```

#### The Clean Solution: Size $N + 1$ with Dummy Zero at Index 0

By convention in competitive programming and high-performance engineering, we allocate a prefix array of length **$N + 1$**, defining:
> **$P[i] = \text{sum of the first } i \text{ elements of nums}$**

```
Index i:       0    1    2    3    4    5    6    7    8
Prefix P:    [ 0 ,  3 ,  4 ,  8 ,  9 , 14 , 23 , 25 , 31 ]
               ▲    ▲
            Dummy  sum(0..0)
```

Now, the range sum of `nums[L .. R]` (where $L$ and $R$ are 0-based indices) is universally:
$$\text{Sum}(L \dots R) = P[R + 1] - P[L]$$

- To query `nums[0 .. 4]`: $P[4 + 1] - P[0] = P[5] - P[0] = 14 - 0 = 14$.
- To query `nums[2 .. 5]`: $P[5 + 1] - P[2] = P[6] - P[2] = 23 - 4 = 19$.

**Zero special conditions. Zero `if (L == 0)` branching.**

---

### 1.4 Trade-Offs: When to Use (and When NOT to Use) Prefix Sums

| Property | Prefix Sum Array | Direct Iteration | Fenwick Tree / Segment Tree |
| :--- | :--- | :--- | :--- |
| **Preprocessing Time** | $O(N)$ | $O(1)$ | $O(N)$ |
| **Range Query Time** | **$O(1)$** | $O(N)$ | $O(\log N)$ |
| **Single Element Update** | **$O(N)$** (rebuild prefix) | $O(1)$ | $O(\log N)$ |
| **Space Overhead** | $O(N)$ auxiliary | $O(1)$ | $O(N)$ |
| **Ideal Scenario** | **Immutable / Static array**, high query volume $Q \gg 1$ | Very few queries ($Q \approx 1$) | **Frequent updates mixed with frequent queries** |

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 303 — Range Sum Query - Immutable (Easy)

> Implement the `NumArray` class:
> - `NumArray(int[] nums)` Initializes the object with the integer array `nums`.
> - `int SumRange(int left, int right)` Returns the sum of the elements of `nums` between indices `left` and `right` inclusive ($left \le right$).

#### Visual Memory Layout:
```
nums:        [ -2,   0,   3,  -5,   2,  -1 ]   (Length = 6)
Indices:        0    1    2    3    4    5

prefix:      [  0,  -2,  -2,   1,  -4,  -2,  -3 ]   (Length = 7)
Indices:        0    1    2    3    4    5    6

Query: SumRange(0, 2)
Formula: prefix[right + 1] - prefix[left]
       = prefix[3] - prefix[0]
       = 1 - 0 = 1. (Verifying: -2 + 0 + 3 = 1. Correct!)

Query: SumRange(2, 5)
Formula: prefix[5 + 1] - prefix[2]
       = prefix[6] - prefix[2]
       = -3 - (-2) = -1. (Verifying: 3 + (-5) + 2 + (-1) = -1. Correct!)
```

#### Production C# Implementation:
```csharp
public class NumArray {
    private readonly int[] _prefix;

    // O(N) constructor precomputation
    public NumArray(int[] nums) {
        _prefix = new int[nums.Length + 1];
        
        // Invariant: _prefix[i] stores the sum of nums[0 .. i - 1]
        for (int i = 0; i < nums.Length; i++) {
            _prefix[i + 1] = _prefix[i] + nums[i];
        }
    }
    
    // O(1) query time
    public int SumRange(int left, int right) {
        return _prefix[right + 1] - _prefix[left];
    }
}
```

#### Complexity:
- **Constructor Time:** $O(N)$ — single pass over `nums`.
- **Constructor Space:** $O(N)$ — internal `_prefix` array of size $N + 1$.
- **`SumRange` Time:** $O(1)$ — single arithmetic subtraction.
- **`SumRange` Auxiliary Space:** $O(1)$.

---

### Problem 2: LeetCode 724 — Find Pivot Index (Easy)

> Given an array of integers `nums`, calculate the **pivot index** of this array.
> The **pivot index** is the index where the sum of all the numbers strictly to the left of the index is equal to the sum of all the numbers strictly to the index's right.
> If no such index exists, return `-1`. If there are multiple pivot indices, return the **left-most** pivot index.

#### The Mathematical Invariant:
For any candidate pivot index $i$:
$$\text{totalSum} = \text{leftSum} + \text{nums}[i] + \text{rightSum}$$
$$\text{rightSum} = \text{totalSum} - \text{leftSum} - \text{nums}[i]$$

The pivot condition $\text{leftSum} == \text{rightSum}$ simplifies to:
$$\text{leftSum} == \text{totalSum} - \text{leftSum} - \text{nums}[i]$$
$$\iff 2 \times \text{leftSum} + \text{nums}[i] == \text{totalSum}$$

This means we **do not need an auxiliary prefix array**! We can solve this with a single running scalar `leftSum` in **$O(1)$ auxiliary space**.

#### Step-by-Step Visual Trace:
`nums = [1, 7, 3, 6, 5, 6]`  
1. `totalSum = 1 + 7 + 3 + 6 + 5 + 6 = 28`
2. Initialize `leftSum = 0`

| $i$ | `nums[i]` | `leftSum` | `rightSum = totalSum - leftSum - nums[i]` | `leftSum == rightSum`? | Action |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **0** | 1 | 0 | $28 - 0 - 1 = 27$ | No ($0 \ne 27$) | `leftSum += 1` $\to 1$ |
| **1** | 7 | 1 | $28 - 1 - 7 = 20$ | No ($1 \ne 20$) | `leftSum += 7` $\to 8$ |
| **2** | 3 | 8 | $28 - 8 - 3 = 17$ | No ($8 \ne 17$) | `leftSum += 3` $\to 11$ |
| **3** | 6 | 11 | $28 - 11 - 6 = 11$ | **YES ($11 == 11$)** | **Return index 3** |

#### Production C# Implementation:
```csharp
public class SolutionPivotIndex {
    public int PivotIndex(int[] nums) {
        int totalSum = 0;
        for (int i = 0; i < nums.Length; i++) {
            totalSum += nums[i];
        }

        int leftSum = 0;
        for (int i = 0; i < nums.Length; i++) {
            // rightSum = totalSum - leftSum - nums[i]
            if (leftSum == totalSum - leftSum - nums[i]) {
                return i; // Left-most pivot found
            }
            leftSum += nums[i];
        }

        return -1;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — two sequential passes over `nums`.
- **Space Complexity:** $O(1)$ — only two integer accumulators (`totalSum`, `leftSum`).

---

### Problem 3: LeetCode 238 — Product of Array Except Self (Medium)

> Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.
>
> **Constraints:**
> - Must run in **$O(N)$** time.
> - **Must NOT use the division operator `/`**.
> - Can you solve it in **$O(1)$ auxiliary memory** (the output array does not count as extra space)?

#### Why Division is a Trap:
If division were allowed, you might compute the total product of the array and divide by `nums[i]`. But:
1. What if `nums[i] == 0`? Division by zero crashes the program.
2. What if there are multiple zeroes? Every element becomes 0.
3. The prompt explicitly forbids `/` to force you into prefix/suffix product thinking!

#### The Prefix-Suffix Decomposition:
Notice that for any index $i$, the product of all elements except `nums[i]` is the product of everything to its left multiplied by everything to its right:

$$\text{answer}[i] = \underbrace{\left(\prod_{k=0}^{i-1} \text{nums}[k]\right)}_{\text{Prefix Product}} \times \underbrace{\left(\prod_{k=i+1}^{N-1} \text{nums}[k]\right)}_{\text{Suffix Product}}$$

#### Two-Pass Optimization to $O(1)$ Auxiliary Space:
- **Pass 1 (Left to Right):** Fill `answer[i]` with the product of all elements to the left of $i$.
- **Pass 2 (Right to Left):** Maintain a running scalar `suffixProduct`. Multiply `answer[i]` by `suffixProduct`, then update `suffixProduct *= nums[i]`.

#### Step-by-Step Visual Trace:
`nums = [1, 2, 3, 4]`

**Pass 1: Build Prefix Products into `answer`**
```
i = 0: answer[0] = 1 (no elements to the left)
i = 1: answer[1] = answer[0] * nums[0] = 1 * 1 = 1
i = 2: answer[2] = answer[1] * nums[1] = 1 * 2 = 2
i = 3: answer[3] = answer[2] * nums[2] = 2 * 3 = 6

After Pass 1: answer = [ 1,  1,  2,  6 ]
```

**Pass 2: Accumulate Suffix Products from the Right**
```
Initialize suffix = 1

i = 3: answer[3] = answer[3] * suffix = 6 * 1 = 6;  suffix = 1 * nums[3] = 4
i = 2: answer[2] = answer[2] * suffix = 2 * 4 = 8;  suffix = 4 * nums[2] = 12
i = 1: answer[1] = answer[1] * suffix = 1 * 12 = 12; suffix = 12 * nums[1] = 24
i = 0: answer[0] = answer[0] * suffix = 1 * 24 = 24; suffix = 24 * nums[0] = 24

Final answer: [ 24, 12, 8, 6 ]
```
Verification:
- $2 \times 3 \times 4 = 24$ (Matches `answer[0]`)
- $1 \times 3 \times 4 = 12$ (Matches `answer[1]`)
- $1 \times 2 \times 4 = 8$  (Matches `answer[2]`)
- $1 \times 2 \times 3 = 6$  (Matches `answer[3]`)

#### Production C# Implementation:
```csharp
public class SolutionProductExceptSelf {
    public int[] ProductExceptSelf(int[] nums) {
        int n = nums.Length;
        int[] result = new int[n];

        // Pass 1: Prefix products
        // result[i] contains the product of all elements to the left of index i
        result[0] = 1;
        for (int i = 1; i < n; i++) {
            result[i] = result[i - 1] * nums[i - 1];
        }

        // Pass 2: Suffix products via running scalar
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            result[i] *= suffix;
            suffix *= nums[i];
        }

        return result;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — two non-nested linear passes ($2N$ operations).
- **Auxiliary Space:** $O(1)$ — output array does not count toward auxiliary memory per problem description. Only one scalar `suffix`.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Apply these patterns right now on LeetCode:

### Problem 1 (Warmup): LeetCode 303 — Range Sum Query - Immutable (Easy)
- **Goal:** Precompute prefix sums of size $N+1$ with a leading dummy `0`.
- **Target Complexity:** $O(N)$ constructor, $O(1)$ query, $O(N)$ space.

### Problem 2 (Core Challenge): LeetCode 724 — Find Pivot Index (Easy)
- **Goal:** Identify the balance point where $\sum_{0}^{i-1} == \sum_{i+1}^{N-1}$.
- **Target Complexity:** $O(N)$ time, $O(1)$ auxiliary space.

### Problem 3 (Interview Favorite): LeetCode 238 — Product of Array Except Self (Medium)
- **Goal:** Deconstruct into prefix product $\times$ suffix product without division.
- **Target Complexity:** $O(N)$ time, $O(1)$ auxiliary space.

### Bonus / Extension Challenge: LeetCode 1732 — Find the Highest Altitude (Easy)
- **Goal:** Given net gain in altitude between points, find the maximum altitude reached starting at 0.
- **Hint:** This is finding the maximum running prefix sum.

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

Notice how **Prefix Sum** bridges between what we've already covered and what's coming:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               Array Traversal Strategy                                │
└────────────────────────────────────────────────────────────────────────────────────────┘
                 │
                 ├─► Pair / Triplet search in sorted array ────────► Two Pointers (Opposite Ends)
                 │
                 ├─► In-place element filtering / compression ─────► Two Pointers (Reader & Writer)
                 │
                 ├─► Static range queries (Sum of L..R) ───────────► 1D Prefix Sum (O(1) per query)
                 │
                 ├─► Prefix state decomposition (Left x Right) ────► Prefix & Suffix Accumulation
                 │
                 └─► Subarray sum equals K with NEGATIVE numbers ──► Prefix Sum + Hash Map (Day 9!)
```

### Preview for Day 9: Why Sliding Window Fails When Negatives Appear
In Day 11 and 12, we will study Sliding Window. Dynamic sliding window expands `right` to increase a sum and shrinks `left` to decrease it. But if the array contains **negative numbers**, adding an element might decrease the sum, and shrinking might increase it! **Monotonicity is destroyed.**
Tomorrow in **Day 9**, we will combine **Prefix Sums with Hash Maps** to solve `Subarray Sum Equals K` in $O(N)$ time, even in the presence of arbitrary negative numbers.

---

## 5. 🎯 Day 8 Checkpoint Questions

Before writing your solutions, check your intuition against these 3 questions:

1. **Dummy Index Mechanics:** Why does defining a prefix array of length $N + 1$ with $P[0] = 0$ eliminate boundary check bugs for ranges starting at $L = 0$? Show the algebraic substitution for `nums[0 .. 3]`.
2. **Space Optimization:** In LeetCode 724 (Pivot Index), why can we eliminate the $O(N)$ prefix array entirely and use just two scalar variables (`totalSum` and `leftSum`)?
3. **Prefix Product Zero Handling:** In LeetCode 238 (Product of Array Except Self), what happens inside the two passes if `nums` contains a single `0` (e.g., `[2, 0, 4, 5]`)? Does the algorithm produce the correct result without throwing an exception?
