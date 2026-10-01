---
title: "Week 1 — Day 2: Array Reversal, Rotation & In-Place Partitioning"
---

Welcome to Day 2! Today we build upon in-place operations by mastering two essential array manipulation techniques frequently tested in Big Tech interviews:
1. **The 3-Reversal Rotation Technique** ($O(1)$ auxiliary space rotation)
2. **The Dutch National Flag Algorithm** (3-Way In-Place Partitioning)

---

## 1. 🧠 TEACH: In-Place Array Transformations

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* In-place array coordinate transformations invert or partition array regions via symmetric index reflections without allocating secondary buffers.
  - *Core Invariants:* 3-Reversal Invariant: $\text{rev}(\text{rev}(A) + \text{rev}(B)) = B + A$; Dutch National Flag (DNF) 4-region invariant: $[0 .. low-1] < \text{pivot}$, $[low .. mid-1] == \text{pivot}$, $[mid .. high]$ unknown, $[high+1 .. N-1] > \text{pivot}$.
  - *Misconception Check:* Array rotation does not require a temporary copy or circular ring juggling; 3 simple reversals achieve $O(N)$ time and $O(1)$ auxiliary space. DNF is *unstable*; it does not preserve original relative ordering of equal elements.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates $O(N)$ auxiliary heap memory allocation during rotations and multi-way sorting, avoiding Garbage Collection allocation churn.
  - *Complexity Advantage:* Reduces memory complexity from $O(N)$ to strictly $O(1)$ auxiliary space while maintaining linear $O(N)$ time.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Rotate array by K steps in-place", "sort colors / 3-way partition", "move elements matching criteria to boundary".
  - *When to Avoid / Failure Modes:* When stable sorting is required (DNF is unstable); when input is a stream where random index swapping is impossible.
- **4. WHERE:**
  - *Physical CLR Memory:* Zero managed heap allocations; pointer indices (`low`, `mid`, `high`) reside in CPU registers/stack frames. In-place swaps write directly to L1 CPU cache lines.
  - *Production Systems:* QuickSort partition inner loops in standard library sorting engines; circular ring buffer compaction in operating system kernel queues.
- **5. WHO:**
  - *Spoken Script:* "To rotate an array by K steps in $O(1)$ space, I use the 3-reversal algorithm: reverse the whole array, reverse the first K elements, then reverse the rest. For three-way partitioning, I maintain four invariant regions using three pointers—low, mid, and high—classifying each element in a single linear pass."
  - *Interviewer Evaluation Lens:* Verifies pointer boundary discipline, off-by-one avoidance on $K \ge N$ ($K = K \pmod N$), and loop termination invariants.
- **6. HOW:**
  - *Cost Model:* Swap: $O(1)$ time, $O(1)$ space; 3-Reversal: $O(N)$ time ($N$ swaps total), $O(1)$ space; DNF: $O(N)$ time, $O(1)$ space.
  - *State Transition Trace:* `nums=[2, 0, 2, 1, 1, 0] -> low=0, mid=0, high=5 -> mid sees 2: swap(mid, high), high-- -> mid sees 0: swap(low, mid), low++, mid++ -> final: [0, 0, 1, 1, 2, 2]`.


### 1.1 Physical Mental Model: The 3-Flip Table Rotation & The 3-Compartment Postal Tray

Array reversal, rotation, and 3-way partitioning are grounded in two tangible physical actions:

```
       ======================================================================
         PHYSICAL ANALOGY A: THE 3-FLIP TABLE ROTATION ([A | B] -> [B | A])
       ======================================================================

       Suppose you have two blocks of blocks on a table: [ A=1,2,3 | B=4,5 ]
       You want: [ B=4,5 | A=1,2,3 ] without allocating any extra table space!

       STEP 1: Flip the entire table upside down!
       Original: [ 1, 2, 3 | 4, 5 ]
       Flipped:  [ 5, 4 | 3, 2, 1 ]    (Now B is at the front, but both are backwards!)

       STEP 2: Flip sub-block B right-side-up!
       Flipped:  [ 4, 5 | 3, 2, 1 ]    (B is now in perfect order!)

       STEP 3: Flip sub-block A right-side-up!
       Result:   [ 4, 5 | 1, 2, 3 ]    (A is now in perfect order!)

       Total Time: O(N) linear time, exactly N swaps, ZERO extra memory!
```

```
       ======================================================================
         PHYSICAL ANALOGY B: THE 3-COMPARTMENT POSTAL TRAY (DUTCH FLAG)
       ======================================================================

       A letter sorting tray divided into 4 active territories:
       
       [ Red Zone: 0s ] [ White Zone: 1s ] [ Unknown Letters ] [ Blue Zone: 2s ]
       0 ............ low-1 | low ........ mid-1 | mid ...... high | high+1 .... N-1
                                              ^
                                         Inspect here!

       1. Letter is 0: Toss left! Swap(low, mid). Advance low++, mid++.
       2. Letter is 1: Already in white zone! Advance mid++.
       3. Letter is 2: Toss right! Swap(mid, high). Decrement high--.
          ⚠️ DANGER: Do NOT advance mid! The letter swapped from high is UNKNOWN!
```

---

### 1.2 In-Place Swapping
An in-place algorithm transforms the input data structure without using auxiliary data structures proportional to the input size ($O(1)$ extra space).
The foundational building block is the **Two-Pointer Swap**:

```csharp
void Reverse(int[] nums, int left, int right) {
    while (left < right) {
        int temp = nums[left];
        nums[left] = nums[right];
        nums[right] = temp;
        left++;
        right--;
    }
}
```
- **Time Complexity:** $O(N)$ — each element between `left` and `right` is moved at most once.
- **Space Complexity:** $O(1)$ — single temporary variable for swapping.

---

### 1.2 The Algebraic Reversal Magic: $(A^R B^R)^R = BA$
Suppose an array consists of two contiguous sub-blocks, $A$ and $B$:
$$\text{Original Array} = [A \mid B]$$

Rotating the array to the right by $k$ positions means shifting the last $k$ elements ($B$) to the front, and the first $n-k$ elements ($A$) to the back:
$$\text{Target Array} = [B \mid A]$$

How do we achieve this in $O(1)$ space without shifting elements one by one ($O(N \times K)$)?
We exploit the algebraic property of reversal where $(X^R)^R = X$ and $(XY)^R = Y^R X^R$:

1. **Reverse the entire array:**
   $$(AB)^R = B^R A^R$$
2. **Reverse the first $k$ elements (which is $B^R$):**
   $$(B^R)^R A^R = B A^R$$
3. **Reverse the remaining $n - k$ elements (which is $A^R$):**
   $$B (A^R)^R = B A$$

✨ **Result: The array is rotated to $BA$ in $O(N)$ time using only $O(1)$ extra memory!**

---

### 1.3 The 3-Way Partition (Dutch National Flag Algorithm)
Formulated by Edsger W. Dijkstra, this algorithm partitions an array containing three distinct values (or three distinct ranges relative to a pivot) in a **single pass** ($O(N)$ time) with **$O(1)$ space**.

We divide the array into **4 logical zones** using 3 pointers: `low`, `mid`, and `high`:

```
Index:    0          low              mid              high         N-1
          ┌──────────┬────────────────┬────────────────┬────────────┐
Values:   │ All 0s   │ All 1s         │ Unexamined ??? │ All 2s     │
          └──────────┴────────────────┴────────────────┴────────────┘
          ◄──Done───►◄─────Done──────►◄──Processing───►◄────Done────►
```

#### The 4 Invariants That Must Always Hold:
1. `nums[0 .. low - 1] == 0` (The finalized zero section)
2. `nums[low .. mid - 1] == 1` (The finalized one section)
3. `nums[mid .. high]` are **unexamined elements**
4. `nums[high + 1 .. N - 1] == 2` (The finalized two section)

The algorithm terminates when `mid > high`, meaning the unexamined zone has shrunk to zero elements.

---

### 1.4 ⚙️ Core Operations Deep-Dive: 3-Pass Reversal Rotation & Dutch National Flag 3-Way Partitioning

#### Dimension 1: Operation Contract & Big-O Bounds

##### Coordinate Transformation Primitives (`Rotate`, `ReverseRange`, `SortColors`)
- **Signatures:**
  - `public void Rotate(int[] nums, int k)`: Cyclically shifts elements right by $k$ positions in-place using 3 subsegment reversals.
  - `public void Reverse(int[] nums, int left, int right)`: Reverses elements in index interval $[left, right]$ in-place.
  - `public void SortColors(int[] nums)`: Partitions an array of 0s, 1s, and 2s into contiguous sorted clusters in a single pass.
- **Preconditions:**
  - $0 \le left \le right < nums.Length$.
  - $k \ge 0$; $nums$ is non-null.
  - For `SortColors`, elements strictly belong to $\{0, 1, 2\}$.
- **Postconditions:**
  - `Rotate`: Element initially at index $i$ moves to $(i + k) \pmod N$; relative cyclic ordering preserved.
  - `SortColors`: Array partitioned such that all 0s precede all 1s, which precede all 2s; zero auxiliary buffers allocated.
- **Complexity Bounds:**

| Operation | Time Complexity | Auxiliary Space | Element Swaps | Space Policy |
| :--- | :--- | :--- | :--- | :--- |
| **`Reverse(l, r)`** | $O(r - l)$ | $O(1)$ | $\lfloor (r - l + 1) / 2 \rfloor$ | Strictly in-place |
| **`Rotate(k)`** | $O(N)$ (3 passes) | $O(1)$ | $N$ swaps total | Strictly in-place |
| **`SortColors` (DNF)** | $O(N)$ (single pass) | $O(1)$ | $\le N$ swaps | Strictly in-place |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                       3-Pass Array Reversal Rotation
                                       │
                                [k = k % n]
                                       │
                         ┌─────────────┴─────────────┐
                       k == 0                        k > 0
                         │                             │
                   [Return early]             [Reverse(0, n - 1)]  // Entire array
                                                       │
                                              [Reverse(0, k - 1)]  // Prefix k
                                                       │
                                              [Reverse(k, n - 1)]  // Suffix n-k
                                                       │
                                                    [Return]
```

```
                 Dutch National Flag (DNF) 3-Way Partition
                                       │
                       [low = 0; mid = 0; high = n - 1]
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 │
                 [mid <= high?]                         │
                      │                                 │
           ┌──────────┴──────────┐                      │
          YES                    NO                     │
           │                     │                      │
     [nums[mid] == ?]            └──────────────► [Terminated: All 4 zones valid]
           │
     ┌─────┼─────────────────────┐
     ▼     ▼                     ▼
    == 0  == 1                  == 2
     │     │                     │
[Swap(low, mid);  [mid++]   [Swap(mid, high);
 low++; mid++]               high--]
     │                           │
     └─────────────┬─────────────┘
                   │
                   └──► Loop back to [mid <= high?]
```

---

#### Dimension 3: Visual ASCII State Transitions

##### 1. 3-Reversal Block Rotation (`nums = [1, 2, 3, 4 | 5, 6, 7]`, $k = 3$)
```
Block Decomposition: A = [1, 2, 3, 4], B = [5, 6, 7]
Target: [B | A] = [5, 6, 7, 1, 2, 3, 4]

Step 1: Reverse entire array (0 to 6):
  [ 7 , 6 , 5 | 4 , 3 , 2 , 1 ]  -> Topology is now [ B^R | A^R ]

Step 2: Reverse first k elements (0 to 2):
  [ 5 , 6 , 7 | 4 , 3 , 2 , 1 ]  -> Topology is now [ (B^R)^R | A^R ] = [ B | A^R ]

Step 3: Reverse remaining n - k elements (3 to 6):
  [ 5 , 6 , 7 | 1 , 2 , 3 , 4 ]  -> Topology is now [ B | (A^R)^R ] = [ B | A ]
Complete rotation achieved in exactly 3 in-place reversals!
```

##### 2. DNF 4-Region State Transitions (`nums = [2, 0, 2, 1, 1, 0]`)
```
Initial: low=0, mid=0, high=5
nums: [ 2 , 0 , 2 , 1 , 1 , 0 ]
        ▲
     low, mid               high

Step 1: nums[mid] == 2 -> Swap(mid, high) -> Swap(0, 5), high--
nums: [ 0 , 0 , 2 , 1 , 1 | 2 ] (high=4)
        ▲
     low, mid

Step 2: nums[mid] == 0 -> Swap(low, mid) -> low++, mid++
nums: [ 0 | 0 , 2 , 1 , 1 | 2 ] (low=1, mid=1)
            ▲
         low, mid

Step 3: nums[mid] == 0 -> Swap(low, mid) -> low++, mid++
nums: [ 0 , 0 | 2 , 1 , 1 | 2 ] (low=2, mid=2)
                ▲
             low, mid

Step 4: nums[mid] == 2 -> Swap(mid, high) -> Swap(2, 4), high--
nums: [ 0 , 0 | 1 , 1 | 2 , 2 ] (high=3)
                ▲
             low, mid

Step 5: nums[mid] == 1 -> mid++ -> mid=3
Step 6: nums[mid] == 1 -> mid++ -> mid=4 (mid > high: HALT!)
Final: [ 0, 0 | 1, 1 | 2, 2 ]
```

---

#### Dimension 4: Invariant Preservation Proof

##### Theorem 1: Reversal Involution & Concatenation Commutativity
Let an array of length $N$ be partitioned into two blocks $A$ (length $N - k$) and $B$ (length $k$).
The original sequence is $S = A \cdot B$.
1. Reversal operator $R$ is an anti-homomorphism over concatenation:
   $$R(X \cdot Y) = R(Y) \cdot R(X)$$
2. Reversal is an involution:
   $$R(R(X)) = X$$
3. Applying $R$ to the entire array:
   $$S_1 = R(A \cdot B) = R(B) \cdot R(A)$$
4. Applying $R$ to the prefix of length $k$ (which is $R(B)$):
   $$S_2 = R(R(B)) \cdot R(A) = B \cdot R(A)$$
5. Applying $R$ to the suffix of length $N - k$ (which is $R(A)$):
   $$S_3 = B \cdot R(R(A)) = B \cdot A$$
Since each element is swapped exactly twice across the 3 passes, total element swaps is bounded by $\frac{N}{2} + \frac{k}{2} + \frac{N-k}{2} = N$. Space complexity is strictly $O(1)$.

##### Theorem 2: DNF 4-Zone Partition Invariant
At the start of every loop iteration, the array indices satisfy:
1. $0 \le i < \text{low} \implies \text{nums}[i] = 0$
2. $\text{low} \le i < \text{mid} \implies \text{nums}[i] = 1$
3. $\text{high} < i < N \implies \text{nums}[i] = 2$
4. $\text{mid} \le i \le \text{high}$ contains unprocessed elements.
- When `nums[mid] == 0`: swapping with `low` moves 0 to the 0-zone. Because `low <= mid` and zone $[\text{low}..\text{mid}-1]$ contains only 1s, the element swapped into `mid` is guaranteed to be 1. Thus, both `low` and `mid` can advance safely.
- When `nums[mid] == 2`: swapping with `high` moves 2 to the 2-zone and decrements `high`. The element swapped into `mid` came from the unprocessed zone, so `mid` **must not advance** until it is inspected in the next step.
- Termination: The unprocessed zone length is $\text{high} - \text{mid} + 1$. Each iteration decrements $\text{high}$ or increments $\text{mid}$, strictly reducing the unprocessed window until $\text{mid} > \text{high}$.

---

#### Dimension 5: Edge Case Matrix

| Edge Case | State / Input | Algorithmic Mechanism | Invariant Preservation |
| :--- | :--- | :--- | :--- |
| **$k = 0$ or $k \pmod N = 0$** | No rotation needed | Guard `if (k == 0) return;` triggers immediate return | Avoids redundant swaps; runs in $O(1)$ |
| **$k > N$ Exceeds Length** | $k = 10^9, N = 5$ | Normalization `k %= n` contracts $k$ to $[0, N-1]$ | Eliminates $10^9$ redundant cycles |
| **Single Element Array** | $N = 1$ | $k \% 1 = 0$; returns immediately | Zero swaps; boundary safe |
| **DNF All Identical (e.g., all 1s)** | `[1, 1, 1]` | `mid` advances from 0 to $N$; `low` stays 0; `high` stays $N-1$ | 0 swaps executed; linear scan in $O(N)$ |
| **DNF No 1s (Only 0s and 2s)** | `[2, 0, 2, 0]` | Swaps between `mid` and `high`, then `low` and `mid` | Partitions cleanly into `[0, 0, 2, 2]` |
| **DNF Reversed `[2, 1, 0]`** | Worst-case initial order | Element 2 swapped to back, element 0 swapped to front | Fully sorts in $N$ operations |

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 189 — Rotate Array (Medium)

> Given an integer array `nums`, rotate the array to the right by `k` steps, where `k` is non-negative.
>
> **Follow up:** Could you do it in-place with $O(1)$ extra space?

#### Step 1: Normalizing $k$
Rotating an array of length $N$ by $N$ steps results in the original array.
Therefore, the effective rotation is always:
```csharp
k = k % nums.Length;
```
If $k == 0$, no rotation is needed.

#### Step 2: Comparison of Approaches

| Approach | Time Complexity | Space Complexity | Why it's suboptimal |
| :--- | :---: | :---: | :--- |
| **Brute Force** (Rotate by 1, $k$ times) | $O(N \times k)$ | $O(1)$ | $10^5 \times 10^5 = 10^{10}$ ops $\to$ **TLE** |
| **Auxiliary Array** (`copy[(i+k)%n]`) | $O(N)$ | $O(N)$ | Allocates $O(N)$ extra memory |
| **Cyclic Replacements** | $O(N)$ | $O(1)$ | Complex bookkeeping with GCD loops |
| **3-Reversal Technique** | $O(N)$ | $O(1)$ | **Optimal**, intuitive, clean code |

#### Step 3: Visual Trace of 3-Reversal
Let `nums = [1, 2, 3, 4, 5, 6, 7]`, `k = 3`, `n = 7`:
- Block $A$ = `[1, 2, 3, 4]` (length $n - k = 4$)
- Block $B$ = `[5, 6, 7]` (length $k = 3$)

```
Original:             [ 1, 2, 3, 4 | 5, 6, 7 ]
Step 1: Reverse(0, 6) [ 7, 6, 5 | 4, 3, 2, 1 ]  // Entire array reversed
Step 2: Reverse(0, 2) [ 5, 6, 7 | 4, 3, 2, 1 ]  // First k elements reversed
Step 3: Reverse(3, 6) [ 5, 6, 7 | 1, 2, 3, 4 ]  // Remaining n-k elements reversed
```

#### Step 4: C# Implementation
```csharp
public class Solution {
    public void Rotate(int[] nums, int k) {
        int n = nums.Length;
        k %= n;
        if (k == 0) return;

        // Step 1: Reverse entire array
        Reverse(nums, 0, n - 1);
        // Step 2: Reverse first k elements
        Reverse(nums, 0, k - 1);
        // Step 3: Reverse remaining n - k elements
        Reverse(nums, k, n - 1);
    }

    private void Reverse(int[] nums, int left, int right) {
        while (left < right) {
            int temp = nums[left];
            nums[left] = nums[right];
            nums[right] = temp;
            left++;
            right--;
        }
    }
}
```

---

### Problem 2: LeetCode 75 — Sort Colors (Medium)

> Given an array `nums` with $n$ objects colored red (`0`), white (`1`), or blue (`2`), sort them **in-place** so that objects of the same color are adjacent, with the colors in the order 0, 1, and 2.
>
> You must solve this problem without using the library's sort function and in a **single pass**.

#### The Core Interview Insight: Why `mid` behaves differently
- **Case `nums[mid] == 0`:**
  Swap `nums[low]` and `nums[mid]`.
  Increment `low++`.
  Increment `mid++`.
  *Why can we safely increment `mid`?*
  Because `low <= mid`. Any element at `nums[low]` was already processed by `mid` earlier, so after the swap, `nums[mid]` is guaranteed to be a `1`.
- **Case `nums[mid] == 1`:**
  Increment `mid++`.
  The invariant holds because `nums[low .. mid-1]` is all `1`s.
- **Case `nums[mid] == 2`:**
  Swap `nums[mid]` and `nums[high]`.
  Decrement `high--`.
  **CRITICAL:** Do NOT increment `mid`!
  *Why?*
  The element that just came from index `high` was in the **unexamined region**. It could be a `0`, `1`, or `2`. We must evaluate it on the next iteration.

#### Visual Trace on `[2, 0, 2, 1, 1, 0]`

```
Start:  low = 0, mid = 0, high = 5
Array:  [ 2, 0, 2, 1, 1, 0 ]
          ▲
         mid points to 2: Swap(mid, high), high--
────────────────────────────────────────────────────────
Step 1: low = 0, mid = 0, high = 4
Array:  [ 0, 0, 2, 1, 1, 2 ]
          ▲
         mid points to 0: Swap(low, mid), low++, mid++
────────────────────────────────────────────────────────
Step 2: low = 1, mid = 1, high = 4
Array:  [ 0, 0, 2, 1, 1, 2 ]
             ▲
            mid points to 0: Swap(low, mid), low++, mid++
────────────────────────────────────────────────────────
Step 3: low = 2, mid = 2, high = 4
Array:  [ 0, 0, 2, 1, 1, 2 ]
                ▲
               mid points to 2: Swap(mid, high), high--
────────────────────────────────────────────────────────
Step 4: low = 2, mid = 2, high = 3
Array:  [ 0, 0, 1, 1, 2, 2 ]
                ▲
               mid points to 1: mid++
────────────────────────────────────────────────────────
Step 5: low = 2, mid = 3, high = 3
Array:  [ 0, 0, 1, 1, 2, 2 ]
                   ▲
                  mid points to 1: mid++
────────────────────────────────────────────────────────
End:    low = 2, mid = 4, high = 3
Condition mid <= high is false (4 <= 3 is False). Terminate!
Final Array: [ 0, 0, 1, 1, 2, 2 ]
```

#### C# Implementation
```csharp
public class Solution {
    public void SortColors(int[] nums) {
        int low = 0;
        int mid = 0;
        int high = nums.Length - 1;

        while (mid <= high) {
            if (nums[mid] == 0) {
                Swap(nums, low, mid);
                low++;
                mid++;
            } else if (nums[mid] == 1) {
                mid++;
            } else { // nums[mid] == 2
                Swap(nums, mid, high);
                high--;
                // Note: Do NOT increment mid here!
            }
        }
    }

    private void Swap(int[] nums, int i, int j) {
        int temp = nums[i];
        nums[i] = nums[j];
        nums[j] = temp;
    }
}
```

---

## 3. 🏋️ PRACTICE: Edge Cases & Self-Check

### Edge Cases for Rotate Array:
- $k = 0$: Array remains unchanged.
- $k > n$: Handled by `k %= n`.
- $n = 1$: Any rotation leaves array unchanged.
- $k$ is a multiple of $n$: e.g. $k = 7, n = 7 \implies k = 0$.

### Edge Cases for Sort Colors:
- Array contains only one color: `[0, 0, 0]` or `[2, 2, 2]`.
- Array is already sorted: `[0, 1, 2]`.
- Array is reverse sorted: `[2, 1, 0]`.

---

## 4. 🎯 Day 2 Checkpoint Questions & Answers

### Question 1: Why Modulo?
- **Question:** If `nums.Length == 5` and $k = 13$, what is the effective number of rotations?
- **Answer:**
  Rotating an array of length $5$ by $5$ positions yields the original array.
  $$\text{Effective } k = 13 \pmod 5 = 3$$
  Rotating by $13$ is functionally identical to rotating right by $3$ steps. Using modulo prevents redundant operations and prevents index out-of-range exceptions.

---

### Question 2: Reverse Bounds
- **Question:** In `Rotate Array`, why is the second reverse boundary `[0 .. k - 1]` and not `[0 .. k]`?
- **Answer:**
  Arrays are 0-indexed. The first $k$ elements occupy indices $0, 1, 2, \dots, k - 1$.
  If we reversed `[0 .. k]`, we would be reversing $k + 1$ elements instead of $k$.

---

### Question 3: Dutch National Flag Bug Analysis
- **Question:** What would happen if you wrote `mid++` after swapping `nums[mid]` and `nums[high]`? Provide a small test case where this produces the wrong answer.
- **Answer:**
  If you increment `mid` immediately after swapping with `high`, the element that came from `high` bypasses inspection. If that swapped element was `0` or `2`, it will be misplaced.

  **Concrete Failing Test Case:**
  Let `nums = [1, 2, 0]`.
  - `low = 0, mid = 0, high = 2`.
  - `nums[mid] == 1` $\to$ `mid++` ($mid = 1$).
  - At `mid = 1`, `nums[mid] == 2`:
    - Swap `nums[mid]` and `nums[high]` $\implies$ array becomes `[1, 0, 2]`.
    - `high--` ($high = 1$).
    - **BUG:** If you also do `mid++`, then $mid = 2$.
  - Now `mid > high` ($2 > 1$), so the loop ends!
  - **Resulting array:** `[1, 0, 2]` — **INCORRECT!** The `0` was never inspected or swapped to `low`.
  - With the correct logic (keeping `mid = 1`), the next iteration inspects `nums[mid] == 0`, swaps it with `nums[low]`, yielding the correct `[0, 1, 2]`.
