---
title: "Week 2 — Day 12: Variable-Size Sliding Window"
---

Welcome to Day 12! Yesterday on [Day 11](file:///Users/thaihai-swe/Desktop/my-prompt/learn%20DSA%20in%20depth/WEEK%202:%20Advanced%20Traversal%20-%20Sliding%20Window%20&%20Prefix%20Sums/Week%202%20%E2%80%94%20Day%2011:%20Fixed-Size%20Sliding%20Window.md), we mastered windows with a static length $K$.

Today we study the **Variable-Size Sliding Window** (often called the Dynamic Window or Accordion Pattern). Instead of a rigid frame, the window expands and contracts dynamically to locate the **longest** or **shortest** contiguous subarray satisfying a given constraint.

---

## 1. 🧠 TEACH: The Accordion Mental Model

### 1.1 Expansion vs. Contraction

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
