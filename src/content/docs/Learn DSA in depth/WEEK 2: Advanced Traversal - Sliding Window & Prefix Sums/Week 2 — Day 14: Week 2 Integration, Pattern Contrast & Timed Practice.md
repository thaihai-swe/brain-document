---
title: "Week 2 — Day 14: Week 2 Integration, Pattern Contrast & Timed Practice"
---

# 🚀 Week 2 — Day 14: Week 2 Integration, Pattern Contrast & Timed Practice

Welcome to Day 14! You have completed the core traversal and range query curriculum of **Week 2**.

Today is our **Synthesis & Integration Day**. In high-stakes Big Tech interviews, the primary challenge is rarely writing the code—it is **correctly identifying the pattern within the first 60 seconds**. Today, we codify the decision boundaries between **Prefix Sums** and **Sliding Windows**, walk through two classic synthesis problems, and review the Week 2 mental architecture.

---

## 1. 🧠 TEACH: The Traversal Decision Matrix

### 1.1 The Crucial Fork in the Road

When faced with a contiguous range / subarray question:

```
                               Contiguous Subarray / Substring Problem
                                                 │
            ┌────────────────────────────────────┴────────────────────────────────────┐
            ▼                                                                         ▼
   Can elements be NEGATIVE?                                               Are all elements NON-NEGATIVE /
   (Or checking modular sums)?                                            character frequencies monotonic?
            │                                                                         │
            ▼                                                                         ▼
   PREFIX SUM + HASH MAP                                                       SLIDING WINDOW
   • Monotonicity does NOT hold.                                               • Monotonicity holds.
   • Target sum: P[j] - P[i-1] == K                                            • Expanding right grows metric.
   • P[i-1] = P[j] - K                                                         • Shrinking left reduces metric.
   • O(N) space required.                                                      • O(1) space achievable!
```

---

### 1.2 Side-by-Side Architectural Contrast

| Dimension | Sliding Window (Days 11–13) | Prefix Sum (+ Hash Map) (Days 8–10) |
| :--- | :--- | :--- |
| **Monotonicity** | **Strictly Required.** Expanding grows, shrinking shrinks. | **Not Required.** Handles negative numbers, zeroes, and negatives under modulo. |
| **Space Complexity** | **$O(1)$** auxiliary space in almost all cases. | **$O(N)$** auxiliary space (hash table or prefix grid). |
| **Goal Archetypes** | • Shortest / longest valid window<br>• Fixed length $K$ averages/maxima<br>• Exact multiset / anagram matching | • Count of subarrays summing to $K$<br>• Longest subarray with sum $0$ (equal 0s and 1s)<br>• Subarrays divisible by $K$<br>• Static 1D/2D range queries |
| **Failure Mode** | Applying it to arrays with negative numbers (greedy pointers fail). | Using it when an $O(1)$ space sliding window was possible. |

---

### 1.3 The 3-Second Pattern Triage Checklist

Ask these three questions sequentially:
1. **Is the array static and asked for multiple range sums?**
   $\to$ **1D or 2D Prefix Sum Array** ($O(1)$ per query).
2. **Does the problem ask for subarrays summing to $K$ and contains negative numbers?**
   $\to$ **Prefix Sum + Hash Map** ($P[i-1] = P[j] - K$).
3. **Does the problem ask for the longest / shortest substring or subarray under a positive constraint?**
   $\to$ **Variable-Size Sliding Window** (Accordion pattern).

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

## 3. 🏋️ PRACTICE: Week 2 Timed Drill

Put away all notes and simulate interview conditions (timed):

| Problem | Target Time | Core Pattern | Key Trap |
| :--- | :--- | :--- | :--- |
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
