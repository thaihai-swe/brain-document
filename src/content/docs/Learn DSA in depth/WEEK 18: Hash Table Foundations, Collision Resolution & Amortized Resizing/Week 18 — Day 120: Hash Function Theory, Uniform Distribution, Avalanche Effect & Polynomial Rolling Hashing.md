---
title: "Week 18 — Day 120: Hash Function Theory, Uniform Distribution, Avalanche Effect & Polynomial Rolling Hashing"
---

# Week 18 — Day 120: Hash Function Theory, Uniform Distribution, Avalanche Effect & Polynomial Rolling Hashing

Welcome to **Day 120 of your DSA Mastery Journey** and the start of **Phase 5 Part 2: Hash Table & Set Mastery (Constant Time Access Patterns)**!

Over the past two weeks in Phase 5 Part 1 (Weeks 16 & 17), you mastered binary and $d$-ary heaps, implicit array indexing, Floyd’s linear construction, and priority queue coordination. Those structures achieved $\Theta(1)$ extremum inspection, but searching for an arbitrary key took $\Theta(N)$ due to weak horizontal partial ordering.

Today, we cross into the realm of **associative containers and constant-time search**. 

The entire foundation of hash tables, hash sets, bloom filters, and distributed sharding rests upon a single mathematical primitive: **The Hash Function**.

Today, you will master:
1. **The Hash Function Contract:** Determinism, Uniformity, and the Simple Uniform Hashing Assumption (SUHA).
2. **The Avalanche Effect:** Why flipping a single input bit must flip roughly 50% of output bits to prevent clustering.
3. **Polynomial Rolling Hashing for Strings:** How Horner’s rule and modular arithmetic allow computing substring hashes in strictly $O(1)$ time per sliding window shift.
4. **Integer Hashing & Knuth’s Multiplicative Fibonacci Method:** Why multiplying by the golden ratio fraction disperses contiguous integer keys.
5. **LeetCode Lab:** Solving **[LeetCode 187] Repeated DNA Sequences** using polynomial rolling hashes and 2-bit bitmask encoding.

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DAY 120: HASH FUNCTION DYNAMICS                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│     MATHEMATICAL FOUNDATIONS      │                             │      POLYNOMIAL ROLLING HASH      │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Determinism:                    │                             │ • Formula:                        │
│   a == b  ==>  h(a) == h(b)       │                             │   H(s) = sum( s[i] * p^(n-1-i) )  │
│ • Uniform Distribution (SUHA):    │                             │ • Base p: Large prime (31, 53)    │
│   Pr[h(k1) == h(k2)] = 1 / M      │                             │ • Modulus M: 10^9 + 7             │
│ • Avalanche Effect:               │                             │ • Rolling Update in O(1):         │
│   1-bit input flip ==> 50% output │                             │   H_next = (H - s[0]*p^(n-1))*p   │
│   bits inverted!                  │                             │            + s[new]               │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │          THE BIRTHDAY PARADOX BOUND         │
                          ├─────────────────────────────────────────────┤
                          │ • Number of keys before 50% collision:      │
                          │   k ≈ 1.177 * sqrt(M)                       │
                          │ • For 32-bit hash: k ≈ 77,000 keys!         │
                          │ • For 64-bit hash: k ≈ 5.06 billion keys!   │
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 📬 The Visual Mental Model: The Apartment Mailbox Analogy

Before looking at hash codes or modular arithmetic, let us understand what a **Hash Table** actually does in the physical world:

```
               📬 THE APARTMENT MAILBOX MENTAL MODEL

   Imagine an apartment building with 8 mailbox cubbies labeled 0 to 7.
   Letters arrive with human names ("Alice", "Bob", "Charlie", "David").
   The mail sorter needs to instantly drop each letter into the correct cubby!

                               THE HASH FUNCTION PIPELINE
   Incoming Mail (Key)             Math Scrambler               Modulo (Table Size 8)       Mailbox Cubby
   ──────────────────────────────────────────────────────────────────────────────────────────────────────
   ✉️ Letter for "Alice"    ──► [ Scrambler: 1,482 ]   ──►   1,482 % 8 = Index 2   ──►  Cubby [ 2 ]
   ✉️ Letter for "Bob"      ──► [ Scrambler: 3,901 ]   ──►   3,901 % 8 = Index 5   ──►  Cubby [ 5 ]
   ✉️ Letter for "Charlie"  ──► [ Scrambler: 2,754 ]   ──►   2,754 % 8 = Index 2   ──►  Cubby [ 2 ] 💥 COLLISION!
   ✉️ Letter for "David"    ──► [ Scrambler: 8,119 ]   ──►   8,119 % 8 = Index 7   ──►  Cubby [ 7 ]

   Look inside the 8 Mailbox Cubbies in RAM:
   ┌─────────┬────────────────────────────────────────────────────────────────────────────────────────┐
   │ Cubby 0 │ [ Empty ]                                                                              │
   ├─────────┼────────────────────────────────────────────────────────────────────────────────────────┤
   │ Cubby 1 │ [ Empty ]                                                                              │
   ├─────────┼────────────────────────────────────────────────────────────────────────────────────────┤
   │ Cubby 2 │ [ "Alice" : Data ] ──► [ "Charlie" : Data ]  <── COLLISION! Two letters in one cubby!  │
   ├─────────┼────────────────────────────────────────────────────────────────────────────────────────┤
   │ Cubby 3 │ [ Empty ]                                                                              │
   ├─────────┼────────────────────────────────────────────────────────────────────────────────────────┤
   │ Cubby 4 │ [ Empty ]                                                                              │
   ├─────────┼────────────────────────────────────────────────────────────────────────────────────────┤
   │ Cubby 5 │ [ "Bob" : Data ]                                                                       │
   ├─────────┼────────────────────────────────────────────────────────────────────────────────────────┤
   │ Cubby 6 │ [ Empty ]                                                                              │
   ├─────────┼────────────────────────────────────────────────────────────────────────────────────────┤
   │ Cubby 7 │ [ "David" : Data ]                                                                     │
   └─────────┴────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Why do we need Hash Tables?
- In an **Array**, you can only look up by numerical index: `arr[0], arr[1]`.
- But in real software, keys are **strings** (`"user_101"`, `"order_99"`), UUIDs, or domain objects.
- A **Hash Function** is simply a deterministic machine that translates an arbitrary key into a valid array index in $O(1)$ time, giving us **$O(1)$ instant lookups by name**!

---

### 1.2 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* A **Hash Function** is a deterministic mathematical mapping $h: \mathcal{U} \to [0, M-1]$ that converts an arbitrary-sized key $k$ into a bounded integer index (hash code) suitable for indexing an array of capacity $M$.
  - *Core Invariants:*
    1. **Strict Determinism:** $\forall a, b: a = b \implies h(a) = h(b)$. (Identical keys MUST always yield identical hash codes).
    2. **Simple Uniform Hashing (SUHA):** Keys scatter evenly across all $M$ slots to avoid clustering.
  - *Misconceptions:*
    - *Misconception 1:* "If $h(a) == h(b)$, then $a == b$." **False!** Because the universe of possible keys is infinitely larger than the number of buckets, multiple keys can map to the same bucket. This is a **Collision**, which every hash table must resolve.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *The Bottleneck:* Linear search in arrays takes $O(N)$. Binary search takes $O(\log N)$ and requires sorted data.
  - *The Solution:* The hash function computes the exact memory address in $O(1)$ time, bypassing search comparisons entirely.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* High-speed key-value lookups, caching, deduplication, counting frequencies.
  - *When to Avoid / Failure Modes:* Sorted iteration (hash tables have no order; use BSTs instead).
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Register & CPU Arithmetic:* High-speed hash functions (MurmurHash3, xxHash, FNV-1a) rely on bitwise shifts, XORs (`^`), and unsigned 64-bit multiplications (`*`), executing in $< 5$ nanoseconds entirely within CPU registers.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "A hash function maps arbitrary keys to bounded integer indices. It must satisfy strict determinism—equal objects produce equal hash codes—and uniform distribution to minimize bucket collisions. Under the Simple Uniform Hashing Assumption, keys scatter evenly across $M$ slots. To avoid clustering, good hash functions exhibit the avalanche effect, where changing a single bit flips approximately half the output bits."
- **6. HOW (Complexity Profile):**
  - *Complexity:* Compute Hash: $\Theta(1)$; Bucket Access: $\Theta(1)$; Collision Resolution: $\Theta(1)$ average, $O(N)$ worst case.

---

### 1.3 The Two-Stage Hashing Pipeline

```
┌──────────────┐          ┌──────────────────────────┐          ┌───────────────────────┐
│ Domain Key K │  ──────> │ Stage 1: Hash Code H(k)  │  ──────> │ Stage 2: Compression  │ ───> Bucket Index
│ ("user_101") │          │ 32-bit / 64-bit Integer  │          │ Index = H(k) % M      │      [ 0 .. M-1 ]
└──────────────┘          └──────────────────────────┘          └───────────────────────┘
```

1. **Stage 1 (Hash Code Generation):** Scrambles the bits of the key into a 32-bit or 64-bit signed/unsigned integer.
2. **Stage 2 (Compression Mapping):** Maps the large integer into the table capacity $[0, M-1]$ via modular reduction:
   $$\text{index} = (H(k) \ \& \ \text{0x7FFFFFFF}) \pmod M$$
   *(The bitwise AND with `0x7FFFFFFF` masks out the sign bit in 32-bit signed integer representations to prevent negative modulo results).*

---

### 1.2 The Avalanche Effect & Bit Dispersion

A high-performance hash function must exhibit the **Avalanche Effect**:

> **The Avalanche Invariant:** If an input key changes by a single bit, each bit of the resulting output hash code must change with probability $p \approx 0.5$.

```
Demonstration of Avalanche Failure vs Success:

Bad Hash (Identity / Sum of ASCII chars):
Key "cat":  'c'(99) + 'a'(97) + 't'(116) = 312
Key "act":  'a'(97) + 'c'(99) + 't'(116) = 312  <-- 100% COLLISION! Anagrams collide!

Good Hash (MurmurHash3 / FNV-1a / xxHash):
Key "cat":  0x7A1F_89BC
Key "car":  0x12E4_550A  <-- 1 single character changed, 18 out of 32 bits flipped!
```

Without the avalanche effect, structured inputs (e.g. sequential customer IDs: `10001, 10002, 10003` or similar URLs) map to identical low-order bits, creating **dense collision clusters** in the hash table.

---

### 1.3 Polynomial Rolling Hashing for Strings

When analyzing strings of length $L$, computing the hash code from scratch takes $O(L)$ character operations. If we slide a window of size $L$ across a text of length $N$, computing hash codes naively takes $O(N \cdot L)$ time.

The **Polynomial Rolling Hash** solves this by treating the string as a number in base $p$ modulo $M$:

$$H(s) = \left( \sum_{i=0}^{L-1} s[i] \cdot p^{L - 1 - i} \right) \pmod M$$

For a window $s[0 \dots L-1]$:
$$H = (s[0] \cdot p^{L-1} + s[1] \cdot p^{L-2} + \dots + s[L-2] \cdot p + s[L-1]) \pmod M$$

#### The $O(1)$ Rolling Shift
When the sliding window advances by 1 position (evicting $s[0]$ and admitting $s[L]$):
1. **Subtract Outgoing Head:**
   $$H' = H - s[0] \cdot p^{L-1} \pmod M$$
2. **Multiply by Base $p$ (Shift Left):**
   $$H'' = H' \cdot p \pmod M$$
3. **Add Incoming Tail:**
   $$H_{\text{next}} = (H'' + s[L]) \pmod M$$

```
====================================================================================================
                        POLYNOMIAL ROLLING HASH SLIDE (Base p = 10, Mod M = 1000)
====================================================================================================
Window of size 3: "415" -> H = 415

Advance window to admit '9' and evict '4': Next window is "159"
1. Evict outgoing head '4':
   415 - 4 * (10^2) = 415 - 400 = 15
2. Shift remaining digits left:
   15 * 10 = 150
3. Add incoming tail '9':
   150 + 9 = 159! (Matches "159" exactly in O(1) arithmetic!)
====================================================================================================
```

---

### 1.4 ⚙️ Core Operations Deep-Dive: Hash Functions & Rolling Fingerprints

#### Dimension 1: Operation Contract & Big-O Bounds

| Operation | Input Signature | Output / Post-condition | Time Complexity | Space Complexity | Invariants Maintained |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ComputeHash` | `long Hash(string s, int p, int m)` | Computes polynomial hash code | $\Theta(L)$ | $\Theta(1)$ | Determinism Invariant |
| `RollHash` | `long Roll(long h, char out, char in, long pPow, int p, int m)` | Slides window by 1 char | $\mathbf{\Theta(1)}$ | $\Theta(1)$ | Fingerprint Continuity |
| `KnuthIntegerHash`| `int HashInt(int key, int bits)` | Scrambles integer via Golden Ratio | $\mathbf{\Theta(1)}$ | $\Theta(1)$ | Avalanche Bit Dispersion |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                           [ RollHash(H, outChar, inChar) ]
                                          │
                                          ▼
                      term = (outChar * pPow) % M
                                          │
                                          ▼
                      H = (H - term) % M
                      If H < 0: H += M   <-- Handle C# negative modulo!
                                          │
                                          ▼
                      H = (H * p) % M
                                          │
                                          ▼
                      H = (H + inChar) % M
                                          │
                                          ▼
                                Return updated H
```

---

#### Dimension 3: Visual ASCII State Transitions

Trace string `"ABCD"`, window size $L=3$, base $p=31$, mod $M=10^9+7$:
Let character values be $A=1, B=2, C=3, D=4$.

```
Initial Window: "ABC"
H("ABC") = (1 * 31^2 + 2 * 31 + 3) % M
         = (1 * 961 + 62 + 3) = 1026

Slide to "BCD" (Evict 'A'=1, Admit 'D'=4):
- pPow = 31^(3-1) = 31^2 = 961
1. H = 1026 - (1 * 961) = 65
2. H = 65 * 31 = 2015
3. H = 2015 + 4 = 2019

Direct Verification:
H("BCD") = (2 * 31^2 + 3 * 31 + 4) % M
         = (2 * 961 + 93 + 4) = 1922 + 93 + 4 = 2019! (EXACT MATCH in O(1)!)
```

---

#### Dimension 4: Invariant Preservation Proof

**Theorem:** The rolling hash recurrence $H_{\text{next}} = ((H - s[i] \cdot p^{L-1}) \cdot p + s[i+L]) \pmod M$ produces the identical value as recomputing the polynomial hash of $s[i+1 \dots i+L]$ from scratch.

*Proof:*
1. By definition:
   $$H(s[i \dots i+L-1]) = \sum_{j=0}^{L-1} s[i+j] \cdot p^{L-1-j} \pmod M$$
2. Expanding the sum:
   $$H = s[i] \cdot p^{L-1} + \sum_{j=1}^{L-1} s[i+j] \cdot p^{L-1-j} \pmod M$$
3. Subtracting the head term $s[i] \cdot p^{L-1}$:
   $$H - s[i] \cdot p^{L-1} = \sum_{j=1}^{L-1} s[i+j] \cdot p^{L-1-j} \pmod M$$
4. Multiplying by $p$:
   $$\left( \sum_{j=1}^{L-1} s[i+j] \cdot p^{L-1-j} \right) \cdot p = \sum_{j=1}^{L-1} s[i+j] \cdot p^{L-j} \pmod M$$
   Re-indexing with $k = j - 1$ ($0 \le k \le L-2$):
   $$= \sum_{k=0}^{L-2} s[i+1+k] \cdot p^{L-1-k} \pmod M$$
5. Adding the incoming tail term $s[i+L]$ (which is $s[i+1+(L-1)] \cdot p^0$):
   $$= \sum_{k=0}^{L-1} s[i+1+k] \cdot p^{L-1-k} \pmod M = H(s[i+1 \dots i+L])$$
6. Therefore, the recurrence holds identically for all steps. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Scenario / Edge Case | Concrete Input | Danger / Pitfall | Guard / Architectural Resolution |
| :--- | :--- | :--- | :--- |
| **Negative Modulo in C#** | `(-5) % 10` returns `-5` in C# | Negative array index out of bounds | Add modulus before modulo: `(val % M + M) % M` |
| **Intermediate 64-Bit Overflow**| `(H * p) + inChar` exceeds `long.MaxValue` | Silent overflow or negative wrap | Cast operands to `long` and modulo at every intermediate addition/multiplication |
| **Base $p$ Divisible by Modulus $M$**| $p = 31$, $M = 31$ | Hash collapses to $s[L-1] \pmod M$ (zero contribution from prefix) | Always pick $p$ coprime to $M$; pick $M$ as a large prime ($10^9 + 7$) |
| **Hash Collision (False Positive)**| Two distinct substrings yield same hash | False match reported | Double hashing (two independent $p, M$ pairs) or secondary character verification |

---

## 2. ⚙️ IMPLEMENT: Production-Grade From-Scratch Container(s)

Below is the production C# implementation of `PolynomialRollingHash` and `KnuthMultiplicativeHash`, accompanied by an automated assertion verification suite.

```csharp
using System;
using System.Diagnostics;

namespace HashTables.Foundations
{
    /// <summary>
    /// Implements high-performance Polynomial Rolling Hashing for streaming string windows.
    /// Provides O(L) initialization and O(1) rolling updates per window slide.
    /// </summary>
    public sealed class PolynomialRollingHash
    {
        private readonly int _p;
        private readonly long _mod;
        private readonly long _highestPower;
        private readonly int _windowSize;

        public const int DefaultBase = 31;
        public const long DefaultModulus = 1_000_000_007;

        /// <summary>
        /// Initializes the rolling hash engine for a fixed window size.
        /// </summary>
        public PolynomialRollingHash(int windowSize, int baseP = DefaultBase, long modulus = DefaultModulus)
        {
            if (windowSize <= 0) throw new ArgumentOutOfRangeException(nameof(windowSize), "Window size must be > 0");
            _windowSize = windowSize;
            _p = baseP;
            _mod = modulus;

            // Precompute p^(windowSize - 1) % mod for O(1) head eviction
            long power = 1;
            for (int i = 0; i < windowSize - 1; i++)
            {
                power = (power * _p) % _mod;
            }
            _highestPower = power;
        }

        /// <summary>
        /// Computes the initial polynomial hash for a substring of length windowSize from scratch.
        /// Runtime: O(windowSize).
        /// </summary>
        public long ComputeInitialHash(string s, int startIndex = 0)
        {
            if (s == null) throw new ArgumentNullException(nameof(s));
            if (startIndex + _windowSize > s.Length)
            {
                throw new ArgumentException("Substring exceeds string length.");
            }

            long hash = 0;
            for (int i = 0; i < _windowSize; i++)
            {
                hash = (hash * _p + s[startIndex + i]) % _mod;
            }
            return hash;
        }

        /// <summary>
        /// Rolls the hash window by 1 character in strictly O(1) time.
        /// Evicts outChar and incorporates inChar.
        /// </summary>
        public long Roll(long currentHash, char outChar, char inChar)
        {
            // 1. Subtract outgoing character's contribution: (outChar * p^(L-1)) % mod
            long headTerm = ((long)outChar * _highestPower) % _mod;
            long newHash = (currentHash - headTerm) % _mod;

            // Handle C# negative modulo
            if (newHash < 0) newHash += _mod;

            // 2. Shift remaining characters left: multiply by p
            newHash = (newHash * _p) % _mod;

            // 3. Add incoming character
            newHash = (newHash + inChar) % _mod;

            return newHash;
        }
    }

    /// <summary>
    /// Knuth's Multiplicative Hash (Fibonacci Hashing) for scattering contiguous integers.
    /// Exploits the fractional part of the Golden Ratio: phi = (sqrt(5) - 1) / 2.
    /// Multiplier = 2654435769U (for 32-bit integers).
    /// </summary>
    public static class KnuthMultiplicativeHash
    {
        // 2^32 * ((sqrt(5) - 1) / 2) ≈ 2654435769
        private const uint GoldenRatio32 = 2654435769U;

        /// <summary>
        /// Hashes a 32-bit integer into an index range [0, 2^targetBits - 1] in O(1) bitwise operations.
        /// </summary>
        public static int Hash(int key, int targetBits)
        {
            unchecked
            {
                uint unsignedKey = (uint)key;
                uint product = unsignedKey * GoldenRatio32;
                // High-order bits contain the highest entropy / best dispersion
                return (int)(product >> (32 - targetBits));
            }
        }
    }

    /// <summary>
    /// Self-testing verification harness.
    /// </summary>
    public static class HashTheoryProgram
    {
        public static void Main()
        {
            Console.WriteLine("Running Hash Function Theory Verification Suite...");

            // Test 1: Rolling Hash Equivalence Test
            string text = "ACGTACGTTAGCT";
            int window = 4;
            var roller = new PolynomialRollingHash(window);

            // Compute "ACGT" directly
            long h0 = roller.ComputeInitialHash(text, 0);

            // Roll to "CGTA"
            long h1_rolled = roller.Roll(h0, text[0], text[4]);
            long h1_direct = roller.ComputeInitialHash(text, 1);

            Debug.Assert(h1_rolled == h1_direct, 
                $"Rolling hash mismatch! Rolled: {h1_rolled}, Direct: {h1_direct}");

            // Roll through entire string and verify every single slide matches direct computation
            long current = h0;
            for (int i = 0; i < text.Length - window; i++)
            {
                long direct = roller.ComputeInitialHash(text, i);
                Debug.Assert(current == direct, $"Mismatch at window index {i}");
                current = roller.Roll(current, text[i], text[i + window]);
            }

            // Test 2: Knuth Hash Dispersion Test
            // Verify sequential integers don't map to contiguous slots
            int b0 = KnuthMultiplicativeHash.Hash(100, 8);
            int b1 = KnuthMultiplicativeHash.Hash(101, 8);
            int b2 = KnuthMultiplicativeHash.Hash(102, 8);

            Debug.Assert(b0 != b1 && b1 != b2, "Clustering detected in multiplicative hash!");

            Console.WriteLine("All Hash Function Theory tests passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Mathematical & Systems Complexity

### The Birthday Paradox & Hash Collision Probability

A common engineering question: *"If my hash table has $M$ buckets, how many keys $N$ can I insert before encountering a $50\%$ probability of at least one collision?"*

Under the Simple Uniform Hashing Assumption (SUHA), the probability that $N$ keys have **zero collisions** is:
$$P(\text{no collision}) = \prod_{i=1}^{N-1} \left( 1 - \frac{i}{M} \right) \approx \prod_{i=1}^{N-1} e^{-i / M} = e^{-\sum_{i=1}^{N-1} i / M} = e^{-N(N-1) / 2M} \approx e^{-N^2 / 2M}$$

Setting $P(\text{collision}) = 1 - e^{-N^2 / 2M} = 0.5$:
$$e^{-N^2 / 2M} = 0.5 \implies \frac{N^2}{2M} = \ln 2 \implies \mathbf{N \approx \sqrt{2 \ln 2 \cdot M} \approx 1.177 \sqrt{M}}$$

```
Birthday Paradox Collision Thresholds:
• 16-bit Hash (M = 65,536):              Collision expected after ~301 keys!
• 32-bit Hash (M = 4,294,967,296):       Collision expected after ~77,163 keys!
• 64-bit Hash (M ≈ 1.84 * 10^19):        Collision expected after ~5.06 BILLION keys!
```

This mathematical proof demonstrates why 32-bit hash codes **will always collide in large datasets**, mandating robust collision resolution strategies!

---

## 4. 🎬 DEMONSTRATE: Canonical Problem Walkthroughs

### Problem: [LeetCode 187] Repeated DNA Sequences (Medium)

#### Problem Statement
The DNA sequence is composed of a series of nucleotides abbreviated as `'A'`, `'C'`, `'G'`, and `'T'`.
Given a string `s` that represents a DNA sequence, return all the 10-letter-long sequences (substrings) that occur more than once in a DNA molecule. You may return the answer in any order.

#### Constraints
- $1 \le \text{s.length} \le 10^5$
- `s[i]` is either `'A'`, `'C'`, `'G'`, or `'T'`.

#### Architectural Solution 1: 2-Bit Integer Rolling Bitmask ($O(N)$ Time, $O(N)$ Space)
Since there are only 4 distinct characters, we can encode each nucleotide in **exactly 2 bits**:
`'A' = 00` (0), `'C' = 01` (1), `'G' = 10` (2), `'T' = 11` (3).
A 10-character DNA window requires $10 \times 2 = \mathbf{20 \text{ bits}}$, which fits perfectly inside a single 32-bit integer!

```csharp
using System.Collections.Generic;

public class RepeatedDnaSequencesBitmaskSolution
{
    public IList<string> FindRepeatedDnaSequences(string s)
    {
        var result = new List<string>();
        if (s == null || s.Length < 10) return result;

        // Map characters to 2-bit values
        int CharToBits(char c) => c switch
        {
            'A' => 0, // 00
            'C' => 1, // 01
            'G' => 2, // 10
            'T' => 3, // 11
            _ => 0
        };

        // 20-bit mask: (1 << 20) - 1 = 0xFFFFF
        const int bitmask = 0xFFFFF;
        int currentWindow = 0;

        // Build initial 10-char window
        for (int i = 0; i < 10; i++)
        {
            currentWindow = (currentWindow << 2) | CharToBits(s[i]);
        }

        var seen = new HashSet<int>();
        var added = new HashSet<int>();
        seen.Add(currentWindow);

        // Slide window by 1 character (shift left 2 bits, mask to 20 bits, append new 2 bits)
        for (int i = 10; i < s.Length; i++)
        {
            currentWindow = ((currentWindow << 2) & bitmask) | CharToBits(s[i]);

            if (seen.Contains(currentWindow))
            {
                if (added.Add(currentWindow))
                {
                    // Extract original 10-char substring only when duplicate is confirmed
                    result.Add(s.Substring(i - 9, 10));
                }
            }
            else
            {
                seen.Add(currentWindow);
            }
        }

        return result;
    }
}
```

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Problem Set

1. **[LeetCode 28] Find the Index of the First Occurrence in a String (Medium):**
   - *Task:* Implement `strStr()` finding substring needle in haystack.
   - *Pattern:* Rabin-Karp polynomial rolling hash matching needle's hash against rolling window in $O(N)$ time.

2. **[LeetCode 1044] Longest Duplicate Substring (Hard):**
   - *Task:* Find the longest duplicate substring in string `s`.
   - *Pattern:* Binary search on substring length $L \in [1, N-1]$ + Rabin-Karp rolling hash with double modular hashing to eliminate false collisions.

3. **MurmurHash3 Invariant Verification:**
   - *Task:* Implement the 32-bit finalization avalanche mixer `fmix32(h)`:
     ```csharp
     h ^= h >> 16;
     h *= 0x85ebca6b;
     h ^= h >> 13;
     h *= 0xc2b2ae35;
     h ^= h >> 16;
     ```
   - Prove empirically that sequential inputs `0, 1, 2, 3` yield hash codes whose bits differ by $\approx 50\%$.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
Hash Function Architecture Selection:

                   ┌─────────────────────────────────────────┐
                   │        HASH FUNCTION SELECTION TREE     │
                   └─────────────────────────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌───────────────────────┐    ┌───────────────────────┐    ┌───────────────────────┐
│ HIGH-SPEED IN-MEMORY  │    │  STREAMING TEXT / I/O │    │ CRYPTOGRAPHIC / AUTH  │
├───────────────────────┤    ├───────────────────────┤    ├───────────────────────┤
│ • xxHash / Murmur3    │    │ • Polynomial Rolling  │    │ • SHA-256 / BLAKE3    │
│ • > 10 GB/s throughput│    │   Hash (Rabin-Karp)   │    │ • Resists preimage &  │
│ • Perfect for         │    │ • O(1) sliding window │      collision attacks.    │
│   Dictionary<K, V>    │      fingerprinting.       │ • Slow (~500 MB/s).    │
└───────────────────────┘    └───────────────────────┘    └───────────────────────┘
```

In production web applications, selecting the appropriate hash function is a performance-critical decision. In-memory data structures deploy non-cryptographic algorithms like **xxHash** or **MurmurHash3** because they achieve tens of gigabytes per second of throughput, leaving cryptography strictly to security boundaries.

---

## 7. 🎯 Daily Checkpoint Questions

### Checkpoint Question
Why does the modulus $M$ in a polynomial rolling hash need to be a large prime, and what is the exact collision probability under the Birthday Paradox?

### Architectural Model Answer
1. **Why Modulus $M$ Must Be a Large Prime:**
   - In polynomial rolling hashing, the hash value is computed as $H(s) = \sum s[i] \cdot p^{L-1-i} \pmod M$.
   - If $M$ is a composite number sharing common factors with the base $p$ (e.g. $M = 2^{32}$ and $p$ is even), the high-order terms quickly become multiples of $M$, causing the prefix characters to evaluate to $0 \pmod M$. This causes the hash code to depend only on the trailing characters, leading to massive collision clusters.
   - Choosing a **large prime number** (such as $M = 10^9 + 7$ or $M = 2^{61} - 1$, a Mersenne prime) guarantees that the integers modulo $M$ form a mathematical **Finite Field** ($\mathbb{Z}/M\mathbb{Z}$). Every element has a unique modular inverse, ensuring that multiplying by base $p$ induces a bijection that scrambles all character positions uniformly across $[0, M-1]$.

2. **Exact Collision Probability Under the Birthday Paradox:**
   - Under the Simple Uniform Hashing Assumption, when hashing $N$ distinct substrings into a space of size $M$, the probability of at least one collision is:
     $$P(\text{collision}) \approx 1 - e^{-\frac{N^2}{2M}}$$
   - If we use $M = 10^9 + 7$, a 50% collision probability occurs when:
     $$N \approx 1.177 \sqrt{M} \approx 1.177 \sqrt{10^9} \approx 37,200 \text{ substrings}$$
   - This proves that in strings longer than $\approx 40,000$ characters, a single rolling hash will likely encounter a false-positive collision. To achieve collision safety up to $N = 10^7$ strings, production implementations deploy **Double Hashing** (e.g. $M_1 = 10^9 + 7$ and $M_2 = 10^9 + 9$), expanding the state space to $M_1 \times M_2 \approx 10^{18}$, where collisions only occur after $\approx 1.177 \sqrt{10^{18}} \approx 1.17 \text{ billion}$ substrings!
