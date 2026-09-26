# 🚀 Week 3 — Day 21: Milestone Assessment & Mock Interview Simulation

Welcome to Day 21! Today marks the **Milestone Assessment for Weeks 1–3**.

Over the last 20 days, you have systematically built an unshakeable foundation in:
- **Array Memory, Cache Locality & In-Place Traversals** (Days 1–7)
- **Cumulative Traversal: Prefix Sums & Sliding Windows** (Days 8–14)
- **String Memory Internals, Palindromes & Lexicographical Ordering** (Days 15–20)

Today, we transition from *learning* to *execution*. In this assessment, you will simulate a **strict 45-minute Big Tech coding round** with candidate-interviewer dialogue, real-time code drafting, manual dry-running, and a 20-point evaluation rubric.

---

## 1. 🧠 TEACH: The Big Tech 45-Minute Interview Protocol

In interviews at Google, Meta, Amazon, and Microsoft, your score is **not** determined solely by passing test cases. Interviewers evaluate five distinct competencies:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                           45-Minute Interview Clock                           │
└───────────────────────────────────────────────────────────────────────────────┘
  00:00 - 05:00 │ Phase 1: Clarification, constraints, input bounds, edge cases
  05:00 - 12:00 │ Phase 2: Brute force -> Bottleneck -> Optimal Invariant proposal
  12:00 - 28:00 │ Phase 3: Clean, idiomatic, defensive implementation
  28:00 - 38:00 │ Phase 4: Structured manual dry-run with test case table
  38:00 - 43:00 │ Phase 5: Rigorous Time and Auxiliary Space complexity analysis
  43:00 - 45:00 │ Phase 6: Follow-up scaling considerations & wrap-up
```

### The Senior / Staff Differentiating Statement
When given a contiguous subarray problem:
> *"Before writing code, I want to clarify: **Can the array contain negative numbers?**  
> If all numbers are non-negative, I can achieve $O(N)$ time and **$O(1)$ space** using a Variable Sliding Window.  
> If the array contains negative numbers, sliding window monotonicity collapses, and I must use **Prefix Sum + Hash Map** which takes $O(N)$ time and **$O(N)$ space**."*

Stating this in the first 2 minutes immediately demonstrates pattern mastery.

---

## 2. 🎬 DEMONSTRATE: The Mock Interview Simulation

---

### Interview Track 1 (20 Minutes): Two Sum II (LeetCode 167)

#### The Problem:
> Given a **1-indexed** array of integers `numbers` that is already **sorted in non-decreasing order**, find two numbers such that they add up to a specific `target` number. Return the indices added by one. Constraint: $O(1)$ extra memory.

#### Candidate-Interviewer Walkthrough Script:

**Candidate:** *"Let me verify the constraints: The array is already sorted in non-decreasing order. Is it guaranteed that exactly one valid solution exists, or could there be none?"*  
**Interviewer:** *"Exactly one solution is guaranteed. You cannot use the same element twice."*

**Candidate:** *"Understood. A brute-force nested loop would compare all pairs in $O(N^2)$ time. A Hash Map achieves $O(N)$ time but uses $O(N)$ auxiliary space, violating our $O(1)$ constraint.*  
*Because the array is sorted, we have **monotonicity**. I will place two pointers at opposite ends: `left = 0` and `right = numbers.Length - 1`.*  
- *If `numbers[left] + numbers[right] < target`, the sum is too small. Because `numbers[right]` is the largest available element, `numbers[left]` cannot pair with any element to reach `target`. We safely eliminate it via `left++`.*  
- *If `numbers[left] + numbers[right] > target`, the sum is too large. By the symmetric invariant, we eliminate `numbers[right]` via `right--`.*  
- *When the sum matches, we return `[left + 1, right + 1]` in 1-based indexing.*  
*This reduces the 2D search space from $O(N^2)$ to $O(N)$ time and $O(1)$ space."*

**Interviewer:** *"Sounds great. Please write the code."*

#### Production Implementation:
```csharp
public class SolutionTwoSumII {
    public int[] TwoSum(int[] numbers, int target) {
        int left = 0;
        int right = numbers.Length - 1;

        while (left < right) {
            int currentSum = numbers[left] + numbers[right];

            if (currentSum == target) {
                return new int[] { left + 1, right + 1 };
            } else if (currentSum < target) {
                left++;
            } else {
                right--;
            }
        }

        return Array.Empty<int>();
    }
}
```

#### Manual Dry-Run Trace:
`numbers = [2, 7, 11, 15]`, `target = 9`

| Step | `left` | `right` | `numbers[left]` | `numbers[right]` | `currentSum` | Comparison vs `target` | Action |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Initial | 0 | 3 | 2 | 15 | 17 | $17 > 9$ | `right--` $\to 2$ |
| 1 | 0 | 2 | 2 | 11 | 13 | $13 > 9$ | `right--` $\to 1$ |
| 2 | 0 | 1 | 2 | 7 | 9 | $9 == 9$ | **Match! Return [1, 2]** |

---

### Interview Track 2 (25 Minutes): Subarray Sum Equals K (LeetCode 560)

#### The Problem:
> Given an array of integers `nums` and an integer `k`, return the total number of continuous subarrays whose sum equals `k`.

#### Candidate-Interviewer Walkthrough Script:

**Candidate:** *"Can the array contain negative numbers?"*  
**Interviewer:** *"Yes, `nums[i]` can be negative, positive, or zero."*

**Candidate:** *"Because numbers can be negative, a sliding window is invalid. Adding an element may decrease the sum, and shrinking may increase it.*  
*Instead, I will express the subarray sum from index $i$ to $j$ in terms of cumulative prefix sums:*
$$\sum_{m=i}^{j} \text{nums}[m] = P[j] - P[i - 1] = K \implies P[i - 1] = P[j] - K$$
*As I iterate through the array maintaining running sum $P[j]$, I look backward into a Hash Map to see how many previous prefix sums equaled $(P[j] - K)$.*  
*Base Case: I must initialize `map[0] = 1` because an empty prefix before index 0 has a sum of 0. If $P[j] == K$, the subarray `nums[0 .. j]` is valid.*  
*Time complexity: $O(N)$ with a single pass. Space complexity: $O(N)$ to store up to $N+1$ prefix sums."*

**Interviewer:** *"Excellent derivation. Go ahead and implement it."*

#### Production Implementation:
```csharp
public class SolutionSubarraySumEqualsKAssessment {
    public int SubarraySum(int[] nums, int k) {
        int count = 0;
        int runningSum = 0;
        
        // Key: prefix sum, Value: frequency of occurrence
        var prefixFreq = new Dictionary<int, int>();
        prefixFreq[0] = 1; // Base case for subarrays starting at index 0

        for (int i = 0; i < nums.Length; i++) {
            runningSum += nums[i];

            // If (runningSum - k) has occurred before, add its frequency
            int complement = runningSum - k;
            if (prefixFreq.TryGetValue(complement, out int freq)) {
                count += freq;
            }

            // Record current runningSum in map
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

#### Manual Dry-Run Trace:
`nums = [1, -1, 1, 1, 1]`, `k = 2`

| $i$ | `nums[i]` | `runningSum` | `complement = runningSum - 2` | `prefixFreq.ContainsKey(complement)` | `count` updated | `prefixFreq` state after step |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Start | - | 0 | - | - | 0 | `{ 0: 1 }` |
| 0 | 1 | 1 | -1 | No | 0 | `{ 0:1, 1:1 }` |
| 1 | -1 | 0 | -2 | No | 0 | `{ 0:2, 1:1 }` |
| 2 | 1 | 1 | -1 | No | 0 | `{ 0:2, 1:2 }` |
| 3 | 1 | 2 | 0 | **YES! (freq = 2)** | $0 + 2 = \mathbf{2}$ | `{ 0:2, 1:2, 2:1 }` |
| 4 | 1 | 3 | 1 | **YES! (freq = 2)** | $2 + 2 = \mathbf{4}$ | `{ 0:2, 1:2, 2:1, 3:1 }` |

**Final Result: 4 valid subarrays.** Correct!

---

## 3. 📊 Self-Grading Evaluation Rubric (20 Points Total)

Score your performance honestly across these 5 categories:

| Category | Criteria (4 Points Each) | Points Earned |
| :--- | :--- | :---: |
| **1. Clarification & Edge Cases** | Asked about negatives, bounds, duplicates, empty array, single element before coding. | `/4` |
| **2. Invariant & Architecture** | Stated brute force, identified bottleneck, stated mathematical invariant before code. | `/4` |
| **3. Implementation Quality** | Idiomatic C#, zero syntax errors, descriptive variable names, defensive guards. | `/4` |
| **4. Manual Verification** | Traced concrete example step-by-step with a table before claiming completion. | `/4` |
| **5. Complexity & Trade-Offs** | Stated exact $O(N)$ time and $O(1)$ or $O(N)$ space with clear rationale. | `/4` |
| **TOTAL SCORE** | **Target: $\ge 16/20$ for Big Tech Interview Readiness** | **`/20`** |

### Benchmark Standards:
- **18–20 Points:** **Strong Hire** (Google L5 / Meta E5 caliber). Complete autonomy, zero prompting required.
- **15–17 Points:** **Hire** (L4 / E4 caliber). Solid algorithm, minor edge case prompting.
- **12–14 Points:** **Lean Hire** (L3 entry level). Correct intuition, but needed hints on invariants or base cases.
- **< 12 Points:** **Needs Review**. Repeat target daily drills before proceeding.

---

## 4. 🔗 CONNECT: Weeks 1–3 Complete Retrospective

### What You Have Mastered:
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MASTER TRAVERSAL & STRING PORTFOLIO                             │
└────────────────────────────────────────────────────────────────────────────────────────┘
  Array Foundations:
    • Memory address arithmetic: Addr(i) = Base + i * Size
    • L1/L2/L3 cache line spatial locality (row-major sequential iteration)
    • In-place pointer swaps, 3-step reversals (A^R B^R)^R = BA
    • Fast & Slow reader/writer pointer overwriting
    
  Range Calculations & Windows:
    • 1D Prefix Sum with (N+1) dummy zero: P[R+1] - P[L]
    • 2D Matrix Prefix Sum via Inclusion-Exclusion: +BR - TR - BL + TL
    • Prefix Sum + Hash Map (Two Sum on cumulative prefixes)
    • Fixed Window (K) incremental delta updates
    • Variable Window (Accordion) expansion & contraction
    • Frequency Map Windows with O(1) match counters & deficit vectors

  String Architecture:
    • Heap allocation mechanics, immutability, GC pressure
    • StringBuilder amortized geometric doubling
    • In-flight character skipping (zero heap allocations)
    • Outside-In verification vs Inside-Out center expansion (2N - 1 centers)
    • Multi-pointer waiting list bucket dispatch (O(|S| + Sum L))
    • Custom concatenation sorting comparator: (B + A).CompareTo(A + B)
```

---

## 5. 🎯 Looking Ahead: WEEKS 4–5 (Advanced Arrays, Binary Search & Matrices)

You have successfully completed the foundational phase of your DSA mastery!

In **Week 4**, we graduate to **Advanced Search & Multi-Dimensional Techniques**:
- **Binary Search on Arrays:** Search space reduction, lower/upper bounds, rotated sorted arrays, peak finding.
- **Advanced Two Pointers & Windows:** 3Sum, 4Sum, Trapping Rain Water, Minimum Window Substring scale-up.
- **Array Intervals:** Merge Intervals, Insert Intervals, Non-Overlapping Intervals, Meeting Rooms.
- **Matrix Traversals:** Spiral Matrix, In-Place Matrix Rotation, Search in 2D Matrix.

---

## 6. 🎯 Day 21 Checkpoint Questions

1. **The Diagnostic Test:** When presented with a subarray problem, what is the single most critical clarifying question you must ask the interviewer, and how does the answer dictate your choice between Sliding Window and Prefix Sum?
2. **The Base Case Invariant:** In `Subarray Sum Equals K`, why does omitting `prefixFreq[0] = 1` cause the algorithm to fail on any valid subarray that begins at index 0?
3. **Complexity Precision:** In LeetCode 179 (Largest Number), why is the time complexity $O(N \log N \cdot L)$ rather than just $O(N \log N)$?

Congratulations on completing **Weeks 1–3**! Share your self-grading score and let me know when you're ready to proceed to **Week 4 (Advanced Arrays & Binary Search)**!
