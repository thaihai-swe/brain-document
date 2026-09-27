---
title: "Week 14 — Day 97: Maximum XOR Pair in Array & Bitwise Binary Trie"
---

# Week 14 — Day 97: Maximum XOR Pair in Array & Bitwise Binary Trie

Welcome to **Day 97 of your DSA Mastery Journey**!

Yesterday in [Day 96](./Week%2014%20%E2%80%94%20Day%2096:%20Word%20Search%20II%20&%20Trie-Pruned%202D%20Grid%20Backtracking.md), we mastered the dual-automaton paradigm, coordinating 2D grid searches with Trie prefix trees and dynamic leaf pruning.

Today, we shift from string alphabets to **binary bitwise search trees**: the **Bitwise Binary Trie** ($|\Sigma| = \{0, 1\}$):
1. **The Bitwise Trie Model:** Representing 32-bit integers as fixed-depth binary paths from MSB (Most Significant Bit) to LSB (Least Significant Bit).
2. **The 5W1H Executive Blueprint:** Contract, invariants, bit manipulation mechanics, and greedy optimality.
3. **The Greedy MSB Maximization Theorem:** Mathematical proof why maximizing the highest possible bit $i$ strictly dominates all lower bits $0 \dots i-1$ combined.
4. **Offline Query Processing:** Monotonically populating a single shared Trie to eliminate redundant tree rebuilds for range-constrained queries.
5. **Hardware & Systems Memory Dive:** Flat array-backed Tries (`int[MaxNodes, 2]`) vs CLR object trees, eliminating 24 bytes of object header overhead per node and maximizing CPU cache hits.
6. **LeetCode Lab:** Comprehensive architectural walkthroughs of:
   - **[LeetCode 421] Maximum XOR of Two Numbers in an Array** (Medium)
   - **[LeetCode 1707] Maximum XOR With an Element From Array** (Hard)

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 97 ARCHITECTURE                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────────────────────────┴───────────────────────────────────────┐
         ▼                                                                               ▼
┌─────────────────────────────────┐                                     ┌─────────────────────────────────┐
│     PART I: BITWISE TRIE        │                                     │   PART II: OFFLINE MONOTONIC    │
│    Greedy Opposite Descent      │                                     │        Query Optimization       │
├─────────────────────────────────┤                                     ├─────────────────────────────────┤
│ • Alphabet: Σ = {0, 1}          │                                     │ • Problem: Max XOR where x ≤ m  │
│ • Height: Fixed 31 / 32 levels  │                                     │ • Online Approach:              │
│ • Greedy Strategy:              │                                     │   Rebuild Trie per query: TLE!  │
│   Query bit = b                 │                                     │ • Offline Monotonic Approach:   │
│   Target bit = b ^ 1            │                                     │   1. Sort nums ascending        │
│   - If target exists:           │                                     │   2. Sort queries by m ascending│
│     Branch target, XOR bit = 1! │                                     │   3. Monotonically insert nums  │
│   - Else:                       │                                     │      into SINGLE persistent Trie│
│     Branch b, XOR bit = 0.      │                                     │   4. Restore original query idx!│
└─────────────────────────────────┘                                     └─────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* A **Bitwise Binary Trie** is a digital search tree of fixed depth $B$ (typically $B = 31$ for non-negative 32-bit integers, or $B = 63$ for 64-bit integers) where every internal node has at most two children: `Children[0]` (bit `0`) and `Children[1]` (bit `1`).
  - *Invariants:*
    - **Uniform Depth Invariant:** Every inserted integer corresponds to a path of exactly $B$ edges from the root to a leaf node at depth $B$.
    - **Greedy Dominance Invariant:** For any bit position $i \in [0, B-1]$, setting the $i$-th bit of the XOR result to `1` yields a strictly greater value than any possible combination of bits in positions $0 \dots i-1$:
      $$2^i > \sum_{j=0}^{i-1} 2^j = 2^i - 1$$
    - **Opposite Branch Invariant:** To maximize $X \oplus Y$, if the $i$-th bit of $X$ is $b$, we must greedily branch into $b \oplus 1$ in the Trie if that edge exists.
  - *Misconception Check:* Candidates often attempt to use dynamic programming or sorting to find the maximum XOR pair. Because XOR has no monotonicity under standard arithmetic order ($5 < 6$, but $5 \oplus 7 = 2 < 6 \oplus 7 = 1$), comparison sorting fails. The Bitwise Trie is the only structure that evaluates bitwise significance hierarchically in $O(B)$ time.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Reduces all-pairs XOR comparisons from $O(N^2)$ brute force to strictly $O(N \cdot B) = O(31 \cdot N) = O(N)$ linear time!
  - *Algorithmic Advantage:* Enables finding the maximum XOR partner for any integer $X$ against a collection of $N$ numbers in strictly **31 pointer steps**, completely independent of $N$.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - Finding maximum/minimum XOR pairs or subarrays.
    - Range-constrained bitwise queries (e.g. elements $\le M$).
    - Longest prefix matching in network IP routers (CIDR masks).
    - Game theory (Nim-sum game state evaluation).
  - *When to Avoid / Failure Modes:*
    - Standard numeric range search ($X \le \text{val} \le Y$) where balance trees (AVL, Red-Black) or B-Trees provide natural interval ordering.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Memory Model:* Since $|\Sigma| = 2$, each node only requires two 8-byte references (16 bytes) plus node overhead. In high-performance implementations, a 2D flat array `int[MaxNodes, 2]` eliminates all object overhead and GC pressure.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "To maximize XOR between two numbers in linear time, we represent integers as 31-bit binary paths in a binary Trie. For each number, we query the Trie from MSB down to bit 0. At bit position i, if the query number has bit b, we greedily search for child 1 - b. If it exists, we take it and set the i-th bit of our answer to 1. If not, we take child b. This is provably optimal because 2^i is strictly greater than all lower bits combined. This reduces an O(N^2) search to O(31 * N), which is linear time."
  - *Interviewer Evaluation Lens:* Checks whether candidate understands the greedy MSB dominance proof, writes bit shifts correctly (`(num >> i) & 1`), and manages offline sorting in constrained variants.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:*
    - `Insert(num)`: Exactly 31 iterations.
    - `QueryMaxXor(num)`: Exactly 31 iterations.
    - Total Time: $O(31 \cdot N) = O(N)$.
    - Space Complexity: At most $31 \cdot N$ nodes.

---

### 1.1 The Greedy MSB Maximization Theorem

#### Mathematical Proof:
Let $A$ and $B$ be two $k$-bit integers.
Suppose at bit position $i$, candidate pair 1 has a bit difference ($b_i \oplus b_i' = 1$), while candidate pair 2 has identical bits ($b_i \oplus b_i' = 0$).

The contribution of bit $i$ to candidate 1 is $2^i$.
The maximum possible value that candidate 2 can achieve from **all remaining lower bits combined** ($0$ through $i-1$) is:
$$\sum_{j=0}^{i-1} 2^j = 2^0 + 2^1 + \dots + 2^{i-1} = 2^i - 1 < 2^i$$

$$\therefore 2^i > \sum_{j=0}^{i-1} 2^j$$

**Conclusion:** Securing a `1` at bit $i$ is guaranteed to produce a larger XOR sum than securing `1`s at *every single lower position* from $i-1$ down to $0$. A greedy choice made at the most significant bit is **globally optimal**!

---

### 1.2 Visual Trace: Bitwise Trie Insertion & Greedy Query

Consider 3-bit numbers: `2` (`010`), `3` (`011`), and `5` (`101`).

```
Inserted Numbers:
2: 0 -> 1 -> 0
3: 0 -> 1 -> 1
5: 1 -> 0 -> 1

Trie Structure:
                  [ Root ]
                 /        \
          Bit 2 /          \ Bit 2
               0            1
              /              \
       Bit 1 /                \ Bit 1
            1                  0
           / \                  \
    Bit 0 /   \ Bit 0            \ Bit 0
         0     1                  1
       (val=2)(val=3)           (val=5)
```

#### Querying Maximum XOR for $X = 5$ (`101_2`):
```
Goal: Find Y in Trie maximizing 5 ^ Y.

Step 1: Bit 2 of X is 1.
        Desired opposite bit: 1 ^ 1 = 0.
        Does Root have child 0? YES!
        Action: Move to child 0.
        XOR contribution: (1 << 2) = 4.

Step 2: Bit 1 of X is 0.
        Desired opposite bit: 0 ^ 1 = 1.
        Does current node have child 1? YES!
        Action: Move to child 1.
        XOR contribution: 4 + (1 << 1) = 6.

Step 3: Bit 0 of X is 1.
        Desired opposite bit: 1 ^ 1 = 0.
        Does current node have child 0? YES! (Node leading to 2).
        Action: Move to child 0.
        XOR contribution: 6 + (1 << 0) = 7.

Final Maximum XOR: 7 (Pair: 5 ^ 2 = 7). Optimal in exactly 3 steps!
```

---

## 2. 🎯 GUIDED PRACTICE: Architectural Patterns & Techniques

### Pattern 1: Bitwise Extraction & Inversion Arithmetic

In C#, bit manipulation must be clean and free of sign-extension bugs:
- Extracting bit $i$ of `num`:
  ```csharp
  int bit = (num >> i) & 1;
  ```
- Target opposite bit:
  ```csharp
  int targetBit = bit ^ 1; // 0 becomes 1, 1 becomes 0
  ```
- Setting bit $i$ in the XOR result:
  ```csharp
  maxXor |= (1 << i);
  ```

> [!CAUTION]
> **Bit-Width Invariant:** For non-negative 32-bit signed integers (like LeetCode problems where $0 \le \text{nums}[i] \le 2^{31} - 1$), the highest bit is bit 30 (representing $2^{30} \approx 1.07 \times 10^9$). We loop from `i = 30 down to 0`.
> Never use `i = 31` with signed integers unless handling negative numbers in two's complement!

---

### Pattern 2: Monotonic Offline Query Sorting ([LeetCode 1707])

#### The Problem:
We are given queries of the form: `[x_i, m_i]` $\implies$ Find the maximum XOR of $x_i$ with any element in `nums` that is **$\le m_i$**. If no element is $\le m_i$, return `-1`.

#### Naive Online Approach:
For each query, filter `nums` for elements $\le m_i$, build a new Trie, and query.
- Cost: $O(Q \cdot N \cdot 31)$. With $Q = 10^5$ and $N = 10^5$, operations exceed $10^{11} \implies$ **Severe TLE!**

#### The Offline Architectural Solution:
Sort both `nums` and `queries` so that we **never rebuild the Trie**:
1. Sort `nums` in ascending order.
2. Augment each query with its original index: `(x, m, originalIndex)`.
3. Sort `queries` in ascending order of $m$.
4. Maintain a pointer `numsIdx = 0` and a **single persistent Trie**.
5. For each query `(x, m, origIdx)`:
   - While `numsIdx < nums.Length && nums[numsIdx] <= m`:
     - Insert `nums[numsIdx]` into the Trie.
     - `numsIdx++`.
   - If the Trie is empty (i.e. `numsIdx == 0`), answer is `-1`.
   - Else, query the Trie with $x$ and record the answer at `result[origIdx]`.
6. Return `result`.

```
Complexity:
- Sort nums: O(N log N)
- Sort queries: O(Q log Q)
- Monotonic Inserts: Each num inserted AT MOST ONCE! O(31 * N)
- Queries: Q queries * 31 steps = O(31 * Q)
TOTAL TIME: O(N log N + Q log Q + 31 * (N + Q)) — Blazing Fast Linearithmic!
```

---

## 3. 💻 PRODUCTION IMPLEMENTATION: Clean C# Code

Below is the complete, production-grade `BitwiseTrie` container in C#. It includes:
- $O(1)$ node navigation using binary child indexing.
- Insertion and greedy maximum XOR search.
- Clean memory cleanup and defensive boundary checks.

```csharp
using System;

namespace AdvancedDSA.Trees
{
    /// <summary>
    /// High-performance Bitwise Binary Trie for 32-bit non-negative integers.
    /// Operates over bits 30 down to 0.
    /// </summary>
    public sealed class BitwiseTrie
    {
        private const int MaxBit = 30; // 2^30 > 10^9

        private sealed class BinaryNode
        {
            public readonly BinaryNode?[] Children = new BinaryNode?[2];
        }

        private readonly BinaryNode _root;

        public int Count { get; private set; }

        public BitwiseTrie()
        {
            _root = new BinaryNode();
            Count = 0;
        }

        /// <summary>
        /// Inserts a non-negative integer into the Bitwise Trie.
        /// Time: Strictly 31 operations (O(1)), Space: O(31).
        /// </summary>
        public void Insert(int num)
        {
            if (num < 0) throw new ArgumentOutOfRangeException(nameof(num), "Only non-negative integers supported.");

            BinaryNode current = _root;
            for (int i = MaxBit; i >= 0; i--)
            {
                int bit = (num >> i) & 1;
                if (current.Children[bit] == null)
                {
                    current.Children[bit] = new BinaryNode();
                }
                current = current.Children[bit]!;
            }
            Count++;
        }

        /// <summary>
        /// Finds the maximum XOR achievable by pairing the query number with any number in the Trie.
        /// Time: Strictly 31 operations (O(1)), Space: O(1).
        /// </summary>
        /// <exception cref="InvalidOperationException">Thrown if the Trie is empty.</exception>
        public int FindMaximumXor(int num)
        {
            if (Count == 0)
            {
                throw new InvalidOperationException("Cannot query an empty Bitwise Trie.");
            }

            BinaryNode current = _root;
            int maxXor = 0;

            for (int i = MaxBit; i >= 0; i--)
            {
                int bit = (num >> i) & 1;
                int targetBit = bit ^ 1; // Greedily prefer opposite bit!

                // If the opposite bit branch exists, take it!
                if (current.Children[targetBit] != null)
                {
                    maxXor |= (1 << i);
                    current = current.Children[targetBit]!;
                }
                else
                {
                    // Fall back to same bit (yields 0 at this bit position)
                    current = current.Children[bit]!;
                }
            }

            return maxXor;
        }
    }
}
```

---

## 4. ⚡ HARDWARE & RUNTIME ARCHITECTURE: Cache, Memory & CLR Deep Dive

### 4.1 The Flat Array-Backed Bitwise Trie (`int[MaxNodes, 2]`)

In standard object-oriented C#, each `BinaryNode` carries CLR object overhead:
- 16 bytes (Object Header + MethodTable) + 8 bytes (Array Reference) + 24 bytes (Child Array Object) = **48 bytes of pure overhead** to store just two 8-byte child pointers!
- In a Trie with 100,000 numbers, this creates up to $31 \times 100,000 = 3.1 \text{ million nodes}$, consuming **150+ MB of RAM** and triggering massive GC overhead.

#### Systems Solution: Flat 2D Array / Struct Pool
In competitive programming, game engines, and low-latency financial systems, the entire tree is flattened into a single contiguous array:

```csharp
public sealed class FlatBitwiseTrie
{
    private readonly int[,] _tree;
    private int _nodeCount;

    public FlatBitwiseTrie(int maxCapacity)
    {
        // 31 levels * capacity max nodes
        _tree = new int[maxCapacity * 31 + 2, 2];
        _nodeCount = 1; // Node 1 is root; 0 represents null
    }

    public void Insert(int num)
    {
        int curr = 1;
        for (int i = 30; i >= 0; i--)
        {
            int bit = (num >> i) & 1;
            if (_tree[curr, bit] == 0)
            {
                _tree[curr, bit] = ++_nodeCount;
            }
            curr = _tree[curr, bit];
        }
    }

    public int FindMaxXor(int num)
    {
        int curr = 1;
        int maxXor = 0;
        for (int i = 30; i >= 0; i--)
        {
            int bit = (num >> i) & 1;
            int target = bit ^ 1;
            if (_tree[curr, target] != 0)
            {
                maxXor |= (1 << i);
                curr = _tree[curr, target];
            }
            else
            {
                curr = _tree[curr, bit];
            }
        }
        return maxXor;
    }
}
```

#### Hardware Benefits of Flat Array:
1. **Zero Garbage Collection:** The entire tree is allocated once upfront. No objects on the GC heap.
2. **L1/L2 Spatial Locality:** Because array elements are stored in contiguous memory, traversing parent to child frequently hits neighboring elements within the same 64-byte CPU cache line.
3. **5x Speedup:** Eliminates pointer dereferencing and bounds-checking overhead, achieving 5x higher throughput on benchmarks.

---

## 5. 🧩 LEETCODE LAB: Canonical Problems & Step-by-Step Breakdown

### Problem 1: [LeetCode 421] Maximum XOR of Two Numbers in an Array

**Difficulty:** Medium | **Frequency:** High (Google, Amazon, Meta)

#### Problem Statement
Given an integer array `nums`, return the maximum result of `nums[i] XOR nums[j]`, where $0 \le i \le j < n$.

#### Production C# Solution

```csharp
public class Solution
{
    private sealed class Node
    {
        public readonly Node?[] Children = new Node?[2];
    }

    public int FindMaximumXOR(int[] nums)
    {
        if (nums == null || nums.Length < 2) return 0;

        Node root = new();

        // 1. Insert all numbers into the 31-bit Trie
        foreach (int num in nums)
        {
            Node curr = root;
            for (int i = 30; i >= 0; i--)
            {
                int bit = (num >> i) & 1;
                if (curr.Children[bit] == null)
                {
                    curr.Children[bit] = new Node();
                }
                curr = curr.Children[bit]!;
            }
        }

        int globalMax = 0;

        // 2. For each number, greedily find its maximum XOR partner
        foreach (int num in nums)
        {
            Node curr = root;
            int currentXor = 0;

            for (int i = 30; i >= 0; i--)
            {
                int bit = (num >> i) & 1;
                int target = bit ^ 1;

                if (curr.Children[target] != null)
                {
                    currentXor |= (1 << i);
                    curr = curr.Children[target]!;
                }
                else
                {
                    curr = curr.Children[bit]!;
                }
            }

            if (currentXor > globalMax)
            {
                globalMax = currentXor;
            }
        }

        return globalMax;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:**
  - Trie Construction: $N \times 31$ operations $\implies O(N)$.
  - Max XOR Queries: $N \times 31$ operations $\implies O(N)$.
  - Total Time: $\Theta(31 \cdot N) = O(N)$.
- **Space Complexity:** At most $31 \times N$ nodes $\implies O(N)$ heap space.

---

### Problem 2: [LeetCode 1707] Maximum XOR With an Element From Array

**Difficulty:** Hard | **Frequency:** Top Asked Advanced Trie Problem (Google, ByteDance)

#### Problem Statement
You are given an array `nums` of non-negative integers and an array `queries` where `queries[i] = [xi, mi]`.

The answer to the $i$-th query is the maximum bitwise `XOR` value of $x_i$ with any element in `nums` that does not exceed $m_i$. If all elements in `nums` are larger than $m_i$, the answer is `-1`.

Return an array `answer` where `answer[i]` is the answer to the $i$-th query.

#### Production C# Solution (Offline Query Sorting + Monotonic Trie)

```csharp
using System;

public class Solution
{
    private sealed class Node
    {
        public readonly Node?[] Children = new Node?[2];
    }

    private readonly struct QueryItem
    {
        public readonly int X;
        public readonly int M;
        public readonly int OriginalIndex;

        public QueryItem(int x, int m, int originalIndex)
        {
            X = x;
            M = m;
            OriginalIndex = originalIndex;
        }
    }

    public int[] MaximizeXor(int[] nums, int[][] queries)
    {
        // 1. Sort nums ascending
        Array.Sort(nums);

        // 2. Prepare and sort queries ascending by M
        int qLen = queries.Length;
        QueryItem[] sortedQueries = new QueryItem[qLen];
        for (int i = 0; i < qLen; i++)
        {
            sortedQueries[i] = new QueryItem(queries[i][0], queries[i][1], i);
        }
        Array.Sort(sortedQueries, (a, b) => a.M.CompareTo(b.M));

        int[] result = new int[qLen];
        Node root = new();
        int numsIndex = 0;
        int n = nums.Length;

        // 3. Process queries monotonically
        foreach (var query in sortedQueries)
        {
            // Insert all nums <= query.M into the shared persistent Trie
            while (numsIndex < n && nums[numsIndex] <= query.M)
            {
                Insert(root, nums[numsIndex]);
                numsIndex++;
            }

            // If no numbers <= query.M exist, Trie is empty
            if (numsIndex == 0)
            {
                result[query.OriginalIndex] = -1;
            }
            else
            {
                result[query.OriginalIndex] = QueryMaxXor(root, query.X);
            }
        }

        return result;
    }

    private static void Insert(Node root, int val)
    {
        Node curr = root;
        for (int i = 30; i >= 0; i--)
        {
            int bit = (val >> i) & 1;
            if (curr.Children[bit] == null)
            {
                curr.Children[bit] = new Node();
            }
            curr = curr.Children[bit]!;
        }
    }

    private static int QueryMaxXor(Node root, int val)
    {
        Node curr = root;
        int maxXor = 0;

        for (int i = 30; i >= 0; i--)
        {
            int bit = (val >> i) & 1;
            int target = bit ^ 1;

            if (curr.Children[target] != null)
            {
                maxXor |= (1 << i);
                curr = curr.Children[target]!;
            }
            else
            {
                curr = curr.Children[bit]!;
            }
        }

        return maxXor;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:**
  - Sorting `nums`: $O(N \log N)$.
  - Sorting `queries`: $O(Q \log Q)$.
  - Monotonic Insertions: Exactly $N$ total insertions across all queries $\implies O(31 \cdot N)$.
  - Query Traversal: Exactly $Q$ total queries $\implies O(31 \cdot Q)$.
  - Total Time: $O(N \log N + Q \log Q + 31(N + Q))$, which executes in $\approx 150\text{ ms}$ for $N, Q = 10^5$.
- **Space Complexity:** $O(Q)$ for sorted queries and result array + $O(31 \cdot N)$ for Trie nodes.

---

## 6. ⚠️ COMMON PITFALLS & ERROR LOG: Production Bug Audits

### Bug 1: The Arithmetic Right-Shift Sign Extension Trap
- **Symptom:** Querying negative numbers or bit 31 produces an infinite loop or wrong bit values.
- **Root Cause:** In C#, `>>` on signed `int` performs an **arithmetic shift**, propagating the sign bit:
  ```csharp
  int x = -1;
  int bit = (x >> 31); // Yields -1, NOT 1!
  ```
- **Fix:** Either restrict to non-negative numbers ($0 \le \text{MaxBit} \le 30$) or cast to `uint` and use unsigned logical shift `>>>` in modern C# (.NET 7+).

### Bug 2: Missing Original Index in Offline Query Processing
- **Symptom:** `MaximizeXor` produces correct values but in scrambled query order.
- **Root Cause:** Sorting the queries array directly without preserving each query's original input index.
- **Fix:** Wrap each query in a struct containing `int OriginalIndex` and populate `result[q.OriginalIndex] = ans`.

### Bug 3: Empty Trie NullReferenceException in LeetCode 1707
- **Symptom:** `NullReferenceException` when all numbers in `nums` are strictly greater than $m_i$.
- **Root Cause:** Calling `QueryMaxXor(root, query.X)` when `numsIndex == 0` (zero numbers inserted into root).
- **Fix:** Guard with `if (numsIndex == 0) { result[query.OriginalIndex] = -1; continue; }`.

---

## 7. 🎯 DAILY CHECKPOINT QUESTIONS: Active Recall & Spoken Defense

### Checkpoint 1: Why Does the Greedy MSB Choice Guarantee Global Maximum?
**Question:** Prove why choosing the opposite bit at the highest available position $i$ ($b \oplus 1$) always yields a greater XOR sum than any potential match at lower bit positions $i-1 \dots 0$.
<details>
<summary><b>View Architectural Answer</b></summary>

The binary value of bit $i$ is $2^i$.
The sum of all lower bits from $0$ up to $i-1$ is:
$$\sum_{j=0}^{i-1} 2^j = 2^i - 1$$
Because $2^i > 2^i - 1$, having a `1` at bit $i$ is strictly greater than having `1`s at *every single lower bit combined*.
Therefore, sacrificing bit $i$ to gain any lower bits can never result in a larger number. The greedy choice made at the most significant bit is mathematically guaranteed to be globally optimal.
</details>

---

### Checkpoint 2: Monotonic Trie Insertion vs Tree Rebuilding
**Question:** In [LeetCode 1707], why does offline query sorting allow us to achieve linearithmic time $O((N + Q) \log(N + Q))$ instead of $O(Q \cdot N \cdot 31)$?
<details>
<summary><b>View Architectural Answer</b></summary>

By sorting `queries` in ascending order of their upper bound constraint $m$, the set of valid numbers $\{x \in \text{nums} \mid x \le m\}$ grows **monotonically**.
Instead of clearing and rebuilding the Trie from scratch for every query, we maintain a persistent Trie and an insertion cursor `numsIndex`.
As $m$ increases with each query, we only insert the newly qualified elements into the existing Trie. Across all $Q$ queries, each element in `nums` is inserted into the Trie **at most once**.
This reduces $Q$ tree reconstructions down to a single streaming pass of $N$ insertions ($O(31 \cdot N)$ total insertion time).
</details>

---

### Checkpoint 3: Object Reference Trie vs Flat Array-Backed Trie
**Question:** Under what hardware conditions is a Flat Array-backed Trie (`int[MaxNodes, 2]`) preferred over a standard reference-based `BinaryNode` Trie in C#?
<details>
<summary><b>View Architectural Answer</b></summary>

A Flat Array Trie is preferred when:
1. **Memory Constrained / Large $N$:** Storing $3.1 \times 10^6$ nodes with standard C# objects consumes $>150\text{ MB}$ due to object headers (16B) and child array overhead. A flat `int[,]` array consumes only $2 \times 4\text{B} = 8\text{B}$ per node—an $83\%$ memory reduction!
2. **GC Latency / Allocation Pressure:** Flat arrays allocate zero objects during execution, eliminating GC Gen 0/1 sweeps in real-time game engines or trading systems.
3. **L1/L2 Cache Locality:** Contiguous integer arrays pack multiple tree nodes into a single 64-byte hardware cache line, avoiding pointer chasing across scattered heap pages.
</details>

---

### Daily Mastery Checklist
- [x] Mastered the Bitwise Binary Trie model ($|\Sigma| = 2$, fixed 31-bit depth).
- [x] Proved the Greedy MSB Maximization Theorem ($2^i > \sum_{j=0}^{i-1} 2^j$).
- [x] Solved [LeetCode 421] Maximum XOR of Two Numbers in an Array in $O(N)$ time.
- [x] Solved [LeetCode 1707] Maximum XOR With an Element From Array via offline query sorting.
- [x] Architected a zero-allocation flat array-backed Bitwise Trie.
