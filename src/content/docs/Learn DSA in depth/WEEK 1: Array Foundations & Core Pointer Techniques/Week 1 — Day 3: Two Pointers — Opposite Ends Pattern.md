---
title: "Week 1 — Day 3: Two Pointers — Opposite Ends Pattern"
---

Welcome to Day 3! Today we master the **Opposite-Ends Two-Pointer Pattern** (sometimes called the Converging Pointers technique). This is one of the highest-frequency algorithmic patterns in technical interviews because it transforms naive $O(N^2)$ exhaustive pair searches into blazing fast $O(N)$ single-pass solutions with $O(1)$ auxiliary space.

---

## 1. 🧠 TEACH: The Mechanics of Opposite Pointers

### 1.1 The Prerequisite: Monotonicity
The opposite-ends pattern places one pointer at the start (`left = 0`) and one pointer at the end (`right = n - 1`), marching them toward each other until they meet (`while (left < right)`).

For this technique to work, the problem domain must possess **monotonicity**:
> Moving a pointer in one direction must have a **predictable, single-directional effect** on the evaluation metric.

For example, in a sorted array:
- Moving `left++` moves to an element $\ge \text{nums}[left]$, which can **only increase (or keep equal)** the sum.
- Moving `right--` moves to an element $\le \text{nums}[right]$, which can **only decrease (or keep equal)** the sum.

```
       left ───>                               <─── right
Index:   0       1       2       3       4       5       6
Array: [ 2 ,     7 ,    11 ,    15 ,    19 ,    24 ,    30 ]  (Sorted)
       ▲                                                 ▲
   Smallest                                           Largest
```

---

### 1.2 Eliminating the 2D Search Space
When looking for a pair $(i, j)$ in an array of size $N$, there are $\approx \frac{N^2}{2}$ possible pairs. We can visualize this pair space as an upper-triangular matrix:

```
        j=0   j=1   j=2   j=3   j=4 (right)
i=0 (L)  --    (0,1) (0,2) (0,3) (0,4)  <-- We start here! sum = nums[0] + nums[4]
i=1            --    (1,2) (1,3) (1,4)
i=2                  --    (2,3) (2,4)
i=3                        --    (3,4)
```

Suppose `nums[left] + nums[right] > target`:
- Because the array is sorted, every other element before `right` paired with `nums[left]` would be smaller, BUT we know `nums[right]` is already too big when paired with `nums[left]`.
- More importantly: `nums[right]` paired with *any* index larger than `left` (e.g. `left + 1`, `left + 2`) would produce an even **larger** sum, which would also exceed `target`!
- Therefore, `nums[right]` can **never** be part of any valid solution with any index $\ge left$.
- We can safely **discard an entire column** of candidate pairs by doing `right--`!

Each step eliminates an entire row or an entire column of search space in $O(1)$ time, reducing the total search from $O(N^2)$ to at most $N$ steps: **$O(N)$**.

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 167 — Two Sum II - Input Array Is Sorted (Medium)

> Given a **1-indexed** array of integers `numbers` that is already **sorted in non-decreasing order**, find two numbers such that they add up to a specific `target` number.
> Return the indices of the two numbers, added by one, as an integer array `[index1, index2]` of length 2.
>
> **Constraint:** $O(1)$ extra space.

#### Brute Force ($O(N^2)$)
Test every pair $(i, j)$ with two nested loops.
For $N = 3 \times 10^4$, $N^2 \approx 9 \times 10^8$ operations $\to$ **Time Limit Exceeded**.

#### Hash Map Approach ($O(N)$ time, $O(N)$ space)
Store elements in a `Dictionary<int, int>`.
While this achieves $O(N)$ time, it allocates $O(N)$ memory and ignores the valuable given constraint: **the array is already sorted**.

#### Optimal: Opposite-Ends Two Pointers ($O(N)$ time, $O(1)$ space)

```
Invariant:
- If sum < target: nums[left] cannot pair with ANY remaining element to reach target -> left++
- If sum > target: nums[right] cannot pair with ANY remaining element to reach target -> right--
- If sum == target: Solution found!
```

#### Step-by-Step Visual Trace
Let `numbers = [2, 7, 11, 15]`, `target = 9`.

```
Initial: left = 0 (val 2), right = 3 (val 15)
Sum = 2 + 15 = 17
17 > target (9) -> sum is too large! Discard right -> right--

Step 1: left = 0 (val 2), right = 2 (val 11)
Sum = 2 + 11 = 13
13 > target (9) -> sum is too large! Discard right -> right--

Step 2: left = 0 (val 2), right = 1 (val 7)
Sum = 2 + 7 = 9
9 == target (9) -> MATCH!
Return [left + 1, right + 1] = [1, 2] (1-based index).
```

#### C# Implementation
```csharp
public class Solution {
    public int[] TwoSum(int[] numbers, int target) {
        int left = 0;
        int right = numbers.Length - 1;
        
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            
            if (sum == target) {
                return new int[] { left + 1, right + 1 }; // 1-based indexing
            } else if (sum < target) {
                left++;  // Need a larger sum
            } else {
                right--; // Need a smaller sum
            }
        }
        
        return new int[0]; // No solution found
    }
}
```

---

### Problem 2: LeetCode 11 — Container With Most Water (Medium)

> You are given an integer array `height` of length $n$. There are $n$ vertical lines drawn such that the two endpoints of the $i$-th line are $(i, 0)$ and $(i, \text{height}[i])$.
> Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.

#### The Formula for Area
The water contained between lines at indices $L$ and $R$ ($L < R$) is:
$$\text{Area} = (R - L) \times \min(\text{height}[L], \text{height}[R])$$

Notice:
1. **Width:** $(R - L)$ — decreases as the pointers move inward.
2. **Effective Height:** $\min(\text{height}[L], \text{height}[R])$ — limited strictly by the **shorter** line.

#### The Greedy Choice Invariant:
Start with maximum possible width: `left = 0, right = n - 1`.
Now, which pointer do we move?
- Suppose $\text{height}[left] < \text{height}[right]$ (the left line is strictly shorter).
- If we move `right` inward (e.g. `right - 1`, `right - 2`):
  - The width **strictly decreases** from $(R - L)$ to $(R - 1 - L)$.
  - The height can **at best** be $\text{height}[left]$ (since it's capped by the shorter side).
  - Therefore, any container formed by keeping `left` and moving `right` will have **strictly smaller area**!
- Conclusion: `left` can **never** be part of a larger container than the current one.
- **We must move the shorter pointer inward!**

```
h[L] = 1, h[R] = 7, Width = 8  --> Area = 8 * min(1, 7) = 8
                                  
If we move the taller pointer (R):
Width becomes 7, height is STILL capped at 1! Area <= 7 (strictly worse).
Moving R is a wasted dead end.
ONLY moving L has any mathematical chance of finding a taller wall to offset width loss.
```

#### Step-by-Step Visual Trace
Let `height = [1, 8, 6, 2, 5, 4, 8, 3, 7]`:

```
left = 0 (h=1), right = 8 (h=7), width = 8 -> Area = 8 * min(1, 7) = 8. Max = 8.
h[left] < h[right] -> left++

left = 1 (h=8), right = 8 (h=7), width = 7 -> Area = 7 * min(8, 7) = 49. Max = 49.
h[right] < h[left] -> right--

left = 1 (h=8), right = 7 (h=3), width = 6 -> Area = 6 * min(8, 3) = 18. Max = 49.
h[right] < h[left] -> right--

left = 1 (h=8), right = 6 (h=8), width = 5 -> Area = 5 * min(8, 8) = 40. Max = 49.
h[left] == h[right] -> move either (e.g. right--)

left = 1 (h=8), right = 5 (h=4), width = 4 -> Area = 4 * min(8, 4) = 16. Max = 49.
right--

left = 1 (h=8), right = 4 (h=5), width = 3 -> Area = 3 * min(8, 5) = 15. Max = 49.
right--

left = 1 (h=8), right = 3 (h=2), width = 2 -> Area = 2 * min(8, 2) = 4. Max = 49.
right--

left = 1 (h=8), right = 2 (h=6), width = 1 -> Area = 1 * min(8, 6) = 6. Max = 49.
right--

left == right (left = 1, right = 1) -> Loop ends.
Maximum Area = 49.
```

#### C# Implementation
```csharp
public class Solution {
    public int MaxArea(int[] height) {
        int left = 0;
        int right = height.Length - 1;
        int maxArea = 0;
        
        while (left < right) {
            int width = right - left;
            int currentHeight = Math.Min(height[left], height[right]);
            int currentArea = width * currentHeight;
            
            if (currentArea > maxArea) {
                maxArea = currentArea;
            }
            
            // Greedily discard the shorter line
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        
        return maxArea;
    }
}
```

---

### Problem 3: LeetCode 977 — Squares of a Sorted Array (Easy)

> Given an integer array `nums` sorted in **non-decreasing** order, return an array of the **squares of each number** sorted in non-decreasing order.
>
> **Challenge:** $O(N)$ time instead of $O(N \log N)$ (square then sort).

#### Intuition:
Due to negative numbers (e.g., `[-7, -3, 2, 3, 11]`), the largest squares are at the **extreme ends**:
$(-7)^2 = 49$, $(11)^2 = 121$.
As you move inward toward 0, the squares decrease.

Thus, we can use two pointers at opposite ends, compare their squares, and fill the result array **from right to left** (largest to smallest).

#### C# Implementation
```csharp
public class Solution {
    public int[] SortedSquares(int[] nums) {
        int n = nums.Length;
        int[] result = new int[n];
        int left = 0;
        int right = n - 1;
        int write = n - 1; // Fill from the end
        
        while (left <= right) {
            int leftSquare = nums[left] * nums[left];
            int rightSquare = nums[right] * nums[right];
            
            if (leftSquare > rightSquare) {
                result[write] = leftSquare;
                left++;
            } else {
                result[write] = rightSquare;
                right--;
            }
            write--;
        }
        
        return result;
    }
}
```

---

## 3. 🏋️ PRACTICE: Edge Cases & Self-Check

### Edge Cases Checklist:
- **Two Sum II:**
  - Exact pair at boundaries: `left = 0, right = n - 1`.
  - Exact pair adjacent: `left = k, right = k + 1`.
  - Negative values included: works seamlessly because monotonicity of sum still holds.
- **Container With Most Water:**
  - Array of length 2: single container possible.
  - All walls identical height: moving either pointer is valid.
  - Decreasing heights or V-shaped heights.
- **Sorted Squares:**
  - All negative numbers: `[-5, -3, -1]` $\to$ squares reversed.
  - All positive numbers: `[1, 2, 3]` $\to$ squares identical order.
  - Mixed with zero: `[-4, 0, 1, 3]`.

---

## 4. 🎯 Day 3 Checkpoint Questions & Answers

### Question 1: Eliminating Search Space
- **Question:** In `Two Sum II`, when `numbers[left] + numbers[right] > target`, why are we guaranteed that `numbers[right]` cannot form a valid pair with *any* other index between `left` and `right - 1`?
- **Answer:**
  Since the array is sorted in non-decreasing order:
  $$\text{For any } k \ge \text{left}, \quad \text{numbers}[k] \ge \text{numbers}[left]$$
  Therefore:
  $$\text{numbers}[k] + \text{numbers}[right] \ge \text{numbers}[left] + \text{numbers}[right] > \text{target}$$
  Any other candidate index $k$ paired with `right` would yield a sum equal to or even greater than the current sum, which is already strictly larger than `target`. Hence, `right` cannot pair with any valid remaining element. Decrementing `right--` is provably safe.

---

### Question 2: Container With Most Water Greedy Proof
- **Question:** In `Container With Most Water`, when `height[left] == height[right]`, does it matter whether we increment `left` or decrement `right`?
- **Answer:**
  No, it does not matter. You can move either `left++` or `right--` (or even both).
  **Proof:**
  Suppose $\text{height}[left] == \text{height}[right] = H$. The current area is $W \times H$.
  If we only move one pointer (say `left++`), the width drops to $W - 1$. For any future container using the unchanged `right` pointer to beat the current area, it would need an effective height $> H$. But the effective height is capped by $\min(\text{height}[\text{new\_left}], \text{height}[right]) \le \text{height}[right] = H$.
  Since the height cannot exceed $H$ and the width has shrunk, keeping either pointer cannot produce a larger area. Thus, discarding either (or both) is completely safe.

---

### Question 3: Why Unsorted Arrays Break the Invariant
- **Question:** Can we use the opposite-ends two-pointer pattern directly on an unsorted array to solve Two Sum in $O(N)$ time and $O(1)$ space?
- **Answer:**
  No. On an unsorted array, the monotonicity property is lost. If `nums[left] + nums[right] < target`, incrementing `left` might give an element that is larger, smaller, or equal. You cannot know whether to advance `left` or decrement `right` to increase or decrease the sum without inspecting all remaining elements.
  To use two pointers, you must first sort the array ($O(N \log N)$), which also loses the original index positions unless stored as `(val, originalIndex)` pairs. That is why for unsorted Two Sum, a **Hash Map** ($O(N)$ time, $O(N)$ space) is the standard optimal approach.
