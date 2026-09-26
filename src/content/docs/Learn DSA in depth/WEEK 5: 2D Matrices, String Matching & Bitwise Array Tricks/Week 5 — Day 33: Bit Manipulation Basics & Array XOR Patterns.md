---
title: "Week 5 — Day 33: Bit Manipulation Basics & Array XOR Patterns"
---

# 🚀 Week 5 — Day 33: Bit Manipulation Basics & Array XOR Patterns

In **Days 31 and 32**, we explored high-level string algorithms (Rabin-Karp rolling hashes and KMP prefix automata).

Today, we dive into the lowest layer of computer architecture: **Bit Manipulation & Array XOR Patterns**.

In software engineering, bitwise operators operate directly within CPU registers in a single clock cycle (sub-nanosecond). In Big Tech technical interviews, bit manipulation problems test whether you can recognize **algebraic group properties** (like XOR cancellation), perform low-level bit isolation (`x & (-x)` and `x & (x - 1)`), and eliminate $O(N)$ hash tables or $O(N \log N)$ sorting down to a blazing fast **$O(N)$ linear pass with strictly $O(1)$ auxiliary space**.

---

## 1. 🧠 TEACH: CPU Bitwise Execution & The Algebraic Properties of XOR

### 1.1 The Hardware Reality: Two's Complement & Registers

All modern architectures (x86-64, ARM64) represent signed integers using **Two's Complement**.

For a 32-bit signed integer `x`:
- Most significant bit (bit 31) is the sign bit ($0 = \text{positive}, 1 = \text{negative}$).
- **The Two's Complement Negation Rule:**
  $$\mathbf{-x = \sim x + 1}$$
  To negate a number: invert all bits (`~x`) and add `1`.

```
Example with 8-bit integer: x = 12
 12  in binary:  0 0 0 0 1 1 0 0
 ~12 (invert):   1 1 1 1 0 0 1 1
 + 1:            1 1 1 1 0 1 0 0  <-- This is -12 in Two's Complement!
```

---

### 1.2 The Algebraic Group Properties of XOR ($\oplus$)

The bitwise XOR operator (`^`) evaluates to `1` if and only if the two input bits differ:
- `0 ^ 0 = 0`
- `1 ^ 1 = 0`
- `0 ^ 1 = 1`
- `1 ^ 0 = 1`

XOR forms an **Abelian Group** over bit strings with four fundamental algebraic properties:

1. **Commutative:** $A \oplus B = B \oplus A$ (order of elements does not matter).
2. **Associative:** $(A \oplus B) \oplus C = A \oplus (B \oplus C)$ (grouping does not matter).
3. **Identity Element ($0$):** $A \oplus 0 = A$ (XOR with zero leaves the number unchanged).
4. **Self-Inverse:** $\mathbf{A \oplus A = 0}$ (any number XORed with itself cancels out to zero!).

#### The Magic of Stream Cancellation:
If an array contains numbers where every number appears twice except for one unique element $X$:
$$nums = [4, 1, 2, 1, 2]$$
By associativity and commutativity, we can rearrange the entire XOR stream:
$$4 \oplus 1 \oplus 2 \oplus 1 \oplus 2 = 4 \oplus (1 \oplus 1) \oplus (2 \oplus 2) = 4 \oplus 0 \oplus 0 = \mathbf{4}$$

All duplicate pairs annihilate each other into zeros, leaving only the unique element in **$O(N)$ time and $O(1)$ space** without allocating a hash set!

---

### 1.3 The Two Essential Bit Hacks Every Engineer Must Know

#### Hack 1: Isolate the Lowest Set Bit $\implies \mathbf{x \ \& \ (-x)}$
Extracts a bitmask containing **only the lowest `1` bit** of `x`:

```
x:       0 0 1 0 1 1 0 0  (44)
-x:      1 1 0 1 0 1 0 0  (-44 = ~x + 1)
------------------------
x & -x:  0 0 0 0 0 1 0 0  (Bit 2 isolated! Value = 4)
```

- **Mathematical Proof:**
  - Let $x = \dots 1 0 \dots 0$ (a set bit followed by $k$ zeros).
  - Inversion $\sim x = \dots 0 1 \dots 1$ (flips the set bit to $0$ and all $k$ zeros to $1$).
  - Adding $1$ carries across all $k$ trailing ones, turning them back to $0$ and setting the lowest set bit back to $1$. All higher bits remain opposite.
  - AND-ing $x$ with $-x$ zeroes out all higher bits and keeps only the lowest set bit!

#### Hack 2: Clear the Lowest Set Bit $\implies \mathbf{x \ \& \ (x - 1)}$
Clears the lowest `1` bit of `x` to `0`, leaving all other bits unchanged:

```
x:       0 0 1 0 1 1 0 0  (44)
x - 1:   0 0 1 0 1 0 1 1  (43)
------------------------
x & x-1: 0 0 1 0 1 0 0 0  (Lowest set bit cleared!)
```

- **Application A: Power of Two Check in $O(1)$:**
  - A positive integer is a power of two if and only if it has **exactly one set bit**:
    $$\mathbf{\text{IsPowerOfTwo}(x) = (x > 0) \ \&\& \ ((x \ \& \ (x - 1)) == 0)}$$
- **Application B: Brian Kernighan’s Hamming Weight Algorithm:**
  - Instead of looping through all 32 bits, repeatedly clearing the lowest set bit counts the number of `1` bits in **$O(\text{set bits})$ iterations**!

---

### 1.4 Partitioning Two Unknowns with a Differing Bit (Single Number III)

Suppose an array contains **two** unique numbers $A$ and $B$, while all other numbers appear twice.
If we XOR the entire array, all duplicates cancel out, leaving:
$$\text{xorAll} = A \oplus B$$

Since $A \ne B$, $\text{xorAll} \ne 0$. There must be **at least one bit that is `1`** in $\text{xorAll}$!
- What does a `1` bit in $A \oplus B$ mean?
- It means that at that specific bit position, **$A$ has a `1` and $B$ has a `0`** (or vice versa)!

#### The Partitioning Invariant:
1. Isolate any set bit of $\text{xorAll}$: `diffBit = xorAll & (-xorAll)`.
2. Partition the entire array into two conceptual groups:
   - **Group 1:** Numbers where `(num & diffBit) != 0`
   - **Group 2:** Numbers where `(num & diffBit) == 0`
3. Notice:
   - $A$ falls into Group 1; $B$ falls into Group 2.
   - Any duplicate pair will have the exact same bit value, so both copies fall into the **same** group and cancel each other out!
4. XORing Group 1 isolates $A$; XORing Group 2 isolates $B$!

---

### 1.5 Interview Spoken Drill (20–30 Seconds)

> *"XOR is commutative, associative, and its own inverse: any number XORed with itself is zero. To find the single non-duplicate number, I XOR all elements in a single pass; all duplicate pairs cancel out, leaving the unique value in $O(N)$ time with $O(1)$ space. For two unique numbers, the XOR sum gives $A \oplus B$. I isolate the lowest set bit using `x & (-x)` and partition the array into two subsets based on that bit, isolating both numbers independently in linear time."*

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 136 — Single Number (Easy)

> Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one.
> You must implement a solution with a linear runtime complexity and use only constant extra space.

#### Visual Step-by-Step Trace:
`nums = [4, 1, 2, 1, 2]`

```
Accumulator result = 0
Step 1: result ^= 4 -> result = 4  (0100)
Step 2: result ^= 1 -> result = 5  (0101)
Step 3: result ^= 2 -> result = 7  (0111)
Step 4: result ^= 1 -> result = 6  (0110)  [1 cancelled!]
Step 5: result ^= 2 -> result = 4  (0100)  [2 cancelled!]

Final result = 4.
```

#### Production C# Implementation:
```csharp
public class SolutionSingleNumber {
    public int SingleNumber(int[] nums) {
        int unique = 0;
        foreach (int num in nums) {
            unique ^= num; // All duplicate pairs cancel to 0; unique ^ 0 = unique
        }
        return unique;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — single pass over `nums`.
- **Space Complexity:** $O(1)$ — single 32-bit integer register.

---

### Problem 2: LeetCode 268 — Missing Number (Easy)

> Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.

#### The Dual-Stream XOR Cancellation:
The complete set should be $0, 1, 2, \dots, n$.  
The array has all of them except one missing number.
If we XOR all numbers from $0$ to $n$, and simultaneously XOR all numbers in `nums`, every present number appears exactly twice and cancels out, leaving only the missing number!

#### Production C# Implementation:
```csharp
public class SolutionMissingNumber {
    public int MissingNumber(int[] nums) {
        int n = nums.Length;
        int missing = n; // Initialize with n

        for (int i = 0; i < n; i++) {
            // XOR index i and value nums[i]
            missing ^= (i ^ nums[i]);
        }

        return missing;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — single pass.
- **Space Complexity:** $O(1)$ — zero auxiliary memory (avoids arithmetic overflow of Gauss's formula $\frac{n(n+1)}{2}$).

---

### Problem 3: LeetCode 260 — Single Number III (Medium)

> Given an integer array `nums`, in which exactly two elements appear only once and all the other elements appear exactly twice. Find the two elements that appear only once. You can return the answer in any order.
> You must write an algorithm that runs in linear runtime complexity and uses only constant extra space.

#### Visual Step-by-Step Trace:
`nums = [1, 2, 1, 3, 2, 5]`  
The two unique numbers are `3` (`011_2`) and `5` (`101_2`).

```
Step 1: XOR all elements
 xorAll = 1 ^ 2 ^ 1 ^ 3 ^ 2 ^ 5 = 3 ^ 5 = 011 ^ 101 = 110_2 (Value = 6)

Step 2: Isolate lowest set bit of 6 (0110_2)
 diffBit = 6 & (-6) = 0010_2 (Value = 2, Bit 1)

Step 3: Partition and XOR into two groups
 Group 1 (bit 1 is 1): [2, 3, 2] -> 2 ^ 3 ^ 2 = 3
 Group 2 (bit 1 is 0): [1, 1, 5] -> 1 ^ 1 ^ 5 = 5

Result: [3, 5]!
```

#### The `int.MinValue` Overflow Guard:
In C#, if `xorAll == int.MinValue` ($-2^{31}$), evaluating `-xorAll` would cause an arithmetic overflow because $+2^{31}$ exceeds `int.MaxValue`. We cast to `long` or use unsigned bitwise logic!

#### Production C# Implementation:
```csharp
public class SolutionSingleNumberIII {
    public int[] SingleNumber(int[] nums) {
        // Step 1: XOR all elements to find A ^ B
        long xorAll = 0;
        foreach (int num in nums) {
            xorAll ^= num;
        }

        // Step 2: Isolate the lowest set bit (cast to long prevents int.MinValue overflow)
        long diffBit = xorAll & (-xorAll);

        int a = 0;
        int b = 0;

        // Step 3: Partition into two groups and isolate A and B
        foreach (int num in nums) {
            if ((num & diffBit) != 0) {
                a ^= num; // Group 1
            } else {
                b ^= num; // Group 2
            }
        }

        return new int[] { a, b };
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — two linear passes over `nums`.
- **Space Complexity:** $O(1)$ auxiliary space.

---

### Problem 4: LeetCode 191 — Number of 1 Bits (Easy)

> Write a function that takes the binary representation of a positive integer and returns the number of set bits it has (also known as the Hamming weight).

#### Production C# Implementation (Brian Kernighan’s Algorithm):
```csharp
public class SolutionHammingWeight {
    public int HammingWeight(int n) {
        int count = 0;
        while (n != 0) {
            n = n & (n - 1); // Clears the lowest set bit in a single cycle
            count++;
        }
        return count;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(K)$ where $K$ is the number of set bits ($K \le 32$). If `n` has only 3 ones, the loop executes exactly 3 times!
- **Space Complexity:** $O(1)$.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master low-level bit manipulation on LeetCode:

### Problem 1 (XOR Cancellation): LeetCode 136 — Single Number (Easy)
- **Goal:** Find the non-duplicate element in $O(N)$ time and $O(1)$ space.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 2 (Dual Stream): LeetCode 268 — Missing Number (Easy)
- **Goal:** XOR indices and values to identify the missing number without integer overflow.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 3 (Bit Partitioning): LeetCode 260 — Single Number III (Medium)
- **Goal:** Isolate two unique numbers using `x & (-x)` bit partitioning.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 4 (Bit Clearing): LeetCode 191 — Number of 1 Bits (Easy)
- **Goal:** Implement Brian Kernighan’s `n & (n - 1)` loop.
- **Target Complexity:** $O(\text{set bits})$ time, $O(1)$ space.

### Bonus / Extension Challenge: LeetCode 137 — Single Number II (Medium)
- **Goal:** Every element appears **three times** except one. Find the single one.
- **Hint:** Build a finite state machine using two bit-vectors (`ones` and `twos`) to count set bits modulo 3 in $O(N)$ time and $O(1)$ space!

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Bit Manipulation Strategy Tree                    │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Find single element appearing once (all others 2x) ──► XOR Stream Accumulation [LC 136]
                   │
                   ├─► Find two unique elements appearing once (others 2x) ─► Diff Bit Partitioning [LC 260]
                   │                                                          (x & -x)
                   │
                   ├─► Find missing element in range [0 .. n] ─────────────► Index ^ Value Cancellation [LC 268]
                   │
                   ├─► Count set bits / Test power of two ─────────────────► Clear Lowest Set Bit [LC 191]
                   │                                                          (x & (x - 1))
                   │
                   └─► Elements appear 3 times (modulo-K counts) ──────────► 2-State Bit Vector Machine [LC 137]
```

### Preview for Day 34: Week 5 Integration & Timed Simulation
Congratulations on mastering 2D matrix transformations, saddleback search, polynomial rolling hashes (Rabin-Karp), KMP failure automata, and register-level bit tricks!  
Tomorrow in **Day 34**, we conduct the **Week 5 Integration & Timed Simulation Round** to prepare you for the Phase 1 Capstone Assessment (Day 35).

---

## 5. 🎯 Day 33 Checkpoint Questions

Verify your depth in bitwise execution with these 4 questions:

1. **Why `x & (-x)` isolates the lowest set bit:** Provide the algebraic proof using two's complement inversion $-x = \sim x + 1$.
2. **Why `nums[i] == int.MinValue` overflows `-x`:** What is the binary representation of `int.MinValue` in 32-bit signed integers? Why does negating it produce an overflow in C#?
3. **Difference with Addition:** In LeetCode 268 (Missing Number), why is XOR cancellation ($O(1)$ space) preferred over the mathematical formula $\frac{n(n+1)}{2} - \sum nums$?
4. **Modulo 3 State Machine:** In LeetCode 137, why does a simple XOR fail when numbers appear 3 times instead of 2 times?
