---
title: "Week 5 — Day 31: Rabin-Karp Rolling Hash & Polynomial Fingerprinting"
---

In **Days 29 and 30**, we mastered 2D matrix transformations and search topologies (Virtual 1D Binary Search and Saddleback Search).

Today, we transition from numeric matrices to **Advanced String Matching & Polynomial Fingerprinting**.

String matching is ubiquitous: database full-text indexing, plagiarism detection, DNA sequence analysis, and network packet payload inspection. Naive substring comparison is notoriously slow ($O(N \times M)$). Today, we unlock the **Rabin-Karp Algorithm**: a technique that treats strings as positional polynomials under modulo arithmetic, enabling **$O(1)$ sliding window hash updates** and turning substring searches into linear-time $O(N)$ operations with zero string allocations!

---

## 1. 🧠 TEACH: The Mechanics of Polynomial Rolling Hashes

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **Rabin-Karp Rolling Hash** is a string search algorithm that computes a polynomial fingerprint of a sliding window to achieve constant-time window equality testing.
  - *Core Invariants:* Polynomial Hash Invariant: $H(s[i..i+m-1]) = \sum_{k=0}^{m-1} s[i+k] \times B^{m-1-k} \pmod M$; Rolling Update Invariant: $H_{new} = ((H_{old} - s[i] \times B^{m-1}) \times B + s[i+m]) \pmod M$.
  - *Misconception Check:* A hash match is *not* a guaranteed string match when using a single modulus, due to hash collisions. In interviews, state that you either verify characters upon hash match (costing $O(M)$ on collision) or use double hashing with two large primes to make collision probability negligible.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(M)$ character comparison overhead on every window shift.
  - *Complexity Advantage:* Reduces average pattern matching time from $O(N \times M)$ to $O(N + M)$ with $O(1)$ auxiliary space.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Find the Index of the First Occurrence in a String" (LC 28), "Repeated DNA Sequences" (LC 187), "Longest Duplicate Substring" (LC 1044). Signal words: "rolling hash", "find all occurrences of pattern", "polynomial fingerprint".
  - *When to Avoid / Failure Modes:* Adversarial inputs engineered to cause hash collisions on a single known modulus (causes worst-case degradation to $O(N \times M)$).
- **4. WHERE:**
  - *Physical CLR Memory:* 64-bit integer registers (`long`) to prevent arithmetic overflow before modulo operation; choose prime base $B$ (e.g. 31 or 131) and large modulus $M$ ($10^9 + 7$).
  - *Production Systems:* Rsync rolling checksum delta transfer algorithm, plagiarism detection software, DNA sequence motif search.
- **5. WHO:**
  - *Spoken Script:* "Rabin-Karp computes a polynomial rolling hash over a sliding window of length M. When sliding one character right, I subtract the outgoing high-order term, multiply by the base, and add the incoming character in $O(1)$ time, yielding $O(N)$ average time for pattern search."
  - *Interviewer Evaluation Lens:* Checks proper modular arithmetic handling (avoiding negative modulo results: `(val % M + M) % M`), power calculation $B^{m-1} \pmod M$, and collision defense.
- **6. HOW:**
  - *Cost Model:* Best/Avg: $O(N + M)$ time; Worst: $O(N \times M)$ on hash collisions; Space: $O(1)$ auxiliary memory.
  - *State Transition Trace:* `H_new = ((H_old - s[i] * power) * base + s[i + m]) % mod`.


### 1.1 The Bottleneck of Naive Substring Searching

Given a text $T$ of length $N$ and a pattern $P$ of length $M$ ($M \le N$):
- **Naive Algorithm:** Align $P$ at every index $i \in [0 \dots N - M]$ and compare characters one by one.
  - Worst-Case: $T = \text{"AAAAAAAAAB"}$, $P = \text{"AAAAB"}$.
  - At every step, we make $M$ character comparisons before failing at the last character.
  - Total time: $O((N - M + 1) \times M) \approx \mathbf{O(N \times M)}$.
  - For $N = 10^5$ and $M = 10^4$, $N \times M = 10^9$ operations $\implies$ **Time Limit Exceeded (TLE)**.

#### Why Standard Hashing Fails:
If we recompute a standard hash function (like `string.GetHashCode()`) for each window of length $M$, computing the hash still takes $O(M)$ time. $N$ windows $\times O(M)$ hashing $= O(N \times M)$ — no speedup!

#### The Rabin-Karp Insight:
We need a hash function where moving the window one position to the right can be computed in **$O(1)$ constant time** using the previous window's hash!

---

### 1.2 The Positional Polynomial Hash Representation

Think of how the decimal numbering system works:
$$\text{"432"} = 4 \times 10^2 + 3 \times 10^1 + 2 \times 10^0 = 400 + 30 + 2 = 432$$

What happens when we slide a window of size 3 from `"432"` to `"325"`?
1. **Remove old high-order digit ($4$):** $432 - 4 \times 10^2 = 32$.
2. **Shift remaining digits left ($\times 10$):** $32 \times 10 = 320$.
3. **Add new low-order digit ($5$):** $320 + 5 = 325$.
All done in $O(1)$ arithmetic!

#### The Formal Polynomial Formula:
For a string $S$ of length $M$, choosing a base $B$ and large prime modulus $M_{\text{mod}}$:

$$\mathbf{H(S) = \left(\sum_{i=0}^{M-1} S[i] \cdot B^{M - 1 - i}\right) \pmod{M_{\text{mod}}}}$$

Expanded:
$$H(S) = \Big(S[0] \cdot B^{M-1} + S[1] \cdot B^{M-2} + \dots + S[M-2] \cdot B^1 + S[M-1] \cdot B^0\Big) \pmod{M_{\text{mod}}}$$

- **Base $B$:** Typically a prime greater than the alphabet size:
  - Lowercase English (`a-z`): $B = 31$ or $B = 37$.
  - Extended ASCII (256 chars): $B = 257$.
- **Modulus $M_{\text{mod}}$:** A large prime to minimize hash collisions:
  - Standard choice: $10^9 + 7$ ($1,000,000,007$) or $10^9 + 9$.

---

### 1.3 The $O(1)$ Rolling Transition Formula

When sliding the window from `text[i .. i + M - 1]` to `text[i + 1 .. i + M]`:
- Exiting character: $\text{outChar} = text[i]$ (its contribution is $\text{outChar} \cdot B^{M-1}$).
- Entering character: $\text{inChar} = text[i + M]$.

$$\mathbf{H_{\text{new}} = \Big(\big(H_{\text{old}} - \text{outChar} \cdot B^{M-1}\big) \cdot B + \text{inChar}\Big) \pmod{M_{\text{mod}}}}$$

Because $B^{M-1} \pmod{M_{\text{mod}}}$ can be precomputed once in $O(M)$ time, **each slide takes exactly 3 arithmetic operations $\implies O(1)$ time**!

---

### 1.4 The C# Modulo Trap: Negative Remainder Wrap

In C# / .NET, the `%` operator is the **remainder operator**, NOT the mathematical modulo:

```csharp
int result = -5 % 10; // Evaluates to -5 in C#, NOT 5!
```

When subtracting the high-order term $\text{outChar} \cdot B^{M-1}$, the difference $H_{\text{old}} - \text{term}$ can easily be **negative**! If you simply apply `% M`, you will produce a negative hash, which corrupts equality comparisons.

#### The Universal C# Safe Modulo Idiom:
$$\mathbf{\text{SafeMod}(x, M) = ((x \% M) + M) \% M}$$

```csharp
long newHash = ((oldHash - outChar * highPower) % MOD + MOD) % MOD;
newHash = (newHash * BASE + inChar) % MOD;
```

---

### 1.5 Hash Collisions & Anti-Collision Engineering

What if two different strings produce the exact same hash?
$$H(S_1) \equiv H(S_2) \pmod{M_{\text{mod}}}$$

- **Spurious Hit:** If hashes match, we perform an $O(M)$ string verification check (`text.AsSpan(i, M).SequenceEqual(pattern)`).
- **Double Hashing:** To avoid doing string verification on every match in high-throughput systems, compute **two independent hashes simultaneously** with different primes:
  - Hash 1: $(B_1 = 31, M_1 = 10^9 + 7)$
  - Hash 2: $(B_2 = 37, M_2 = 10^9 + 9)$
  - A collision requires both independent hashes to collide simultaneously:
    $$\text{Collision Probability} \approx \frac{1}{M_1 \times M_2} \approx \frac{1}{10^{18}} \approx 0$$

---

### 1.6 Interview Spoken Drill (20–30 Seconds)

> *"Rabin-Karp treats substrings as positional base-B polynomials modulo a large prime. By maintaining the rolling hash, I can slide the window in O(1) time by subtracting the exiting character scaled by $B^{M-1}$, multiplying by the base, and adding the incoming character. This scans the text in $O(N)$ average time. If a hash matches the pattern hash, I verify the characters using Span to guard against hash collisions, achieving linear time with zero string allocation."*

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 28 — Find the Index of the First Occurrence in a String (Medium)

> Given two strings `needle` and `haystack`, return the index of the first occurrence of `needle` in `haystack`, or `-1` if `needle` is not part of `haystack`.

#### Step-by-Step Visual Trace:
`haystack = "abracadabra"`, `needle = "cad"` ($M = 3$, $B = 31, MOD = 10^9 + 7$)
Precompute $B^{M-1} = 31^2 = 961$.

```
Target needle: "cad"
 Hash(needle) = ('c'*31^2 + 'a'*31 + 'd') % MOD

Window 0 ("abr"):
 Hash0 = ('a'*961 + 'b'*31 + 'r') % MOD != Hash(needle)

Window 1 ("bra"):
 Roll: remove 'a', multiply 31, add 'a'
 Hash1 != Hash(needle)

... Slide windows in O(1) ...

Window 4 ("cad"):
 Hash4 == Hash(needle)!
 Hash match detected -> Perform SequenceEqual verification.
 Match confirmed! Return index 4.
```

#### Production C# Implementation:
```csharp
public class SolutionRabinKarp {
    private const long BASE = 31;
    private const long MOD = 1_000_000_007;

    public int StrStr(string haystack, string needle) {
        int n = haystack.Length;
        int m = needle.Length;
        if (m == 0) return 0;
        if (m > n) return -1;

        // Step 1: Compute high-order power B^(m - 1) % MOD
        long highPower = 1;
        for (int i = 0; i < m - 1; i++) {
            highPower = (highPower * BASE) % MOD;
        }

        // Step 2: Compute initial hash for needle and first window of haystack
        long patternHash = 0;
        long windowHash = 0;
        for (int i = 0; i < m; i++) {
            patternHash = (patternHash * BASE + (needle[i] - 'a' + 1)) % MOD;
            windowHash = (windowHash * BASE + (haystack[i] - 'a' + 1)) % MOD;
        }

        // Step 3: Slide the window across haystack
        for (int i = 0; i <= n - m; i++) {
            // If hashes match, verify character-by-character to eliminate spurious hits
            if (windowHash == patternHash) {
                if (haystack.AsSpan(i, m).SequenceEqual(needle.AsSpan())) {
                    return i; // First match found
                }
            }

            // Roll the hash forward to window [i + 1 .. i + m]
            if (i < n - m) {
                long outChar = haystack[i] - 'a' + 1;
                long inChar = haystack[i + m] - 'a' + 1;

                // Subtract exiting char with safe modulo
                long temp = (windowHash - (outChar * highPower) % MOD + MOD) % MOD;
                // Shift base and add incoming char
                windowHash = (temp * BASE + inChar) % MOD;
            }
        }

        return -1;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N + M)$ on average. Precomputing $B^{M-1}$ takes $O(M)$. Sliding the window takes $O(N)$ with $O(1)$ hash updates. Spurious hit verification takes $O(M)$ only when hashes collide (rare). Worst-case with pathological collisions: $O(N \times M)$.
- **Space Complexity:** $O(1)$ auxiliary space. Uses `Span<char>` for zero-allocation verification.

---

### Problem 2: LeetCode 187 — Repeated DNA Sequences (Medium)

> The DNA sequence is composed of a series of nucleotides abbreviated as `'A'`, `'C'`, `'G'`, and `'T'`.
> Given a string `s` that represents a DNA sequence, return all the **10-letter-long sequences** (substrings) that occur more than once in a DNA molecule.

#### The Bit-Packed Rolling Hash Innovation:
DNA only uses 4 characters $\implies$ we can encode each nucleotide into **2 bits**:
- `'A' = 00_2 = 0`
- `'C' = 01_2 = 1`
- `'G' = 10_2 = 2`
- `'T' = 11_2 = 3`

A 10-letter window requires $10 \times 2 = \mathbf{20 \text{ bits}}$.
A standard 32-bit `int` holds 32 bits! We can represent an entire 10-letter DNA sequence as a **single integer hash with ZERO modulo arithmetic and ZERO collisions**!

#### The $O(1)$ Bitwise Rolling Transition:
1. **Shift left by 2 bits:** `hash = (hash << 2)`
2. **Add incoming 2 bits:** `hash |= charCode`
3. **Mask off high bits beyond 20 bits:** `hash &= 0xFFFFF` (where `0xFFFFF` is 20 ones: $2^{20} - 1$).

```
Window of 10 chars (20 bits):
[  b19 b18  ...  b3 b2 b1 b0  ]
     ▲
Shift left 2 bits -> b19, b18 overflow -> Masked out by 0xFFFFF!
New bits inserted at b1, b0!
```

#### Production C# Implementation:
```csharp
public class SolutionRepeatedDNA {
    public IList<string> FindRepeatedDnaSequences(string s) {
        var result = new List<string>();
        int n = s.Length;
        if (n < 10) return result;

        // Bitwise mappings: 2 bits per char
        // A -> 0 (00), C -> 1 (01), G -> 2 (10), T -> 3 (11)
        int CharToBit(char c) => c switch {
            'A' => 0,
            'C' => 1,
            'G' => 2,
            'T' => 3,
            _ => 0
        };

        const int MASK = (1 << 20) - 1; // 20 bits mask (0xFFFFF)
        var seenHashes = new HashSet<int>();
        var addedHashes = new HashSet<int>();

        int rollingHash = 0;

        // Build initial 10-char hash (first 9 chars)
        for (int i = 0; i < 9; i++) {
            rollingHash = (rollingHash << 2) | CharToBit(s[i]);
        }

        // Slide across string
        for (int i = 9; i < n; i++) {
            // Shift left by 2, add new char, mask to 20 bits
            rollingHash = ((rollingHash << 2) | CharToBit(s[i])) & MASK;

            // If seen before and not yet added to results
            if (!seenHashes.Add(rollingHash)) {
                if (addedHashes.Add(rollingHash)) {
                    result.Add(s.Substring(i - 9, 10));
                }
            }
        }

        return result;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — single pass over the string with pure bitwise shifts (`<<`, `|`, `&`).
- **Space Complexity:** $O(N)$ — hash sets storing 32-bit integers (not expensive strings!).

---

### Problem 3: LeetCode 1062 — Longest Repeating Substring (Medium)

> Given a string `s`, find the length of the longest repeating substring(s). Return `0` if no repeating substring exists.

#### Pattern Synthesis: Binary Search on Answer Space (Day 24) + Rabin-Karp:
1. **Search Space:** The length $L$ of repeating substrings can range from $1$ to $N - 1$.
2. **Monotonicity:** If there exists a repeating substring of length $L$, then there must also exist a repeating substring of length $L - 1$ (any prefix of the length-$L$ substring).
   - Feasibility predicate: $P(L) = \text{HasRepeatingSubstring}(s, L)$.
   - $\implies$ **Binary Search on Length $L$ in $[1 \dots N - 1]$**!
3. **The Checker in $O(N)$:** For a fixed candidate length $mid$, use **Rabin-Karp** to check if any window of size $mid$ appears twice in $O(N)$ time!
4. **Total Time:** $\mathbf{O(N \log N)}$! (Compare this to $O(N^3)$ brute force).

#### Production C# Implementation:
```csharp
public class SolutionLongestRepeatingSubstring {
    private const long BASE = 31;
    private const long MOD = 1_000_000_007;

    public int LongestRepeatingSubstring(string s) {
        int n = s.Length;
        int lo = 1;
        int hi = n - 1;
        int bestLength = 0;

        // Binary Search on Answer Space (Substring Length)
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;

            if (HasRepeating(s, mid)) {
                bestLength = mid; // Feasible; try to find a longer one
                lo = mid + 1;
            } else {
                hi = mid - 1; // Too long; shrink length
            }
        }

        return bestLength;
    }

    private bool HasRepeating(string s, int len) {
        int n = s.Length;
        long highPower = 1;
        for (int i = 0; i < len - 1; i++) {
            highPower = (highPower * BASE) % MOD;
        }

        var seenHashes = new HashSet<long>();
        long currentHash = 0;

        for (int i = 0; i < len; i++) {
            currentHash = (currentHash * BASE + (s[i] - 'a' + 1)) % MOD;
        }
        seenHashes.Add(currentHash);

        for (int i = 1; i <= n - len; i++) {
            long outChar = s[i - 1] - 'a' + 1;
            long inChar = s[i + len - 1] - 'a' + 1;

            long temp = (currentHash - (outChar * highPower) % MOD + MOD) % MOD;
            currentHash = (temp * BASE + inChar) % MOD;

            if (!seenHashes.Add(currentHash)) {
                return true; // Duplicate hash found!
            }
        }

        return false;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N \log N)$ — binary search takes $\log N$ steps; each step performs an $O(N)$ Rabin-Karp sweep.
- **Space Complexity:** $O(N)$ — to store hashes in the hash set.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master Rabin-Karp and rolling hashes on LeetCode:

### Problem 1 (Foundational String Matching): LeetCode 28 — Find the Index of the First Occurrence in a String (Medium)
- **Goal:** Implement Rabin-Karp with safe modulo subtraction and `Span` verification.
- **Target Complexity:** $O(N + M)$ time, $O(1)$ space.

### Problem 2 (Bit-Packed Rolling Hash): LeetCode 187 — Repeated DNA Sequences (Medium)
- **Goal:** Encode 4-char alphabet into 2-bit sliding window integers with zero modulo arithmetic.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.

### Problem 3 (Synthesis / Binary Search + Hash): LeetCode 1062 — Longest Repeating Substring (Medium)
- **Goal:** Combine binary search on length with Rabin-Karp to achieve $O(N \log N)$.
- **Target Complexity:** $O(N \log N)$ time, $O(N)$ space.

### Bonus / Extension Challenge: LeetCode 214 — Shortest Palindrome (Hard)
- **Goal:** Find the longest palindrome prefix of string $S$.
- **Hint:** Compute rolling hash of $S$ forward and reverse simultaneously! When forward hash equals reverse hash, prefix is a palindrome!

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                        String Search Strategy                          │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Substring match with rolling hash ────────► Rabin-Karp [LC 28]
                   │   (Great for multi-pattern, 2D grids)
                   │
                   ├─► Small alphabet fixed-length windows ──────► Bit-Packed Rolling Hash [LC 187]
                   │   (4 chars -> 2 bits; zero mod overhead)
                   │
                   ├─► Find longest duplicate / repeated string ─► BS on Answer + Rabin-Karp [LC 1062]
                   │
                   └─► Guaranteed worst-case O(N+M) without hash ► KMP Automata (Day 32)
                       (Deterministic π-table prefix matching)     [LC 28, LC 459, LC 214]
```

### Preview for Day 32: KMP Pattern Matching & The $\pi$-Array
Rabin-Karp is probabilistic (dependent on modulo arithmetic and hash collisions).
Tomorrow in **Day 32**, we conquer **Knuth-Morris-Pratt (KMP)**: a strictly deterministic algorithm that constructs a prefix-suffix failure automaton ($\pi$-table) in $O(M)$ time to guarantee exact $O(N + M)$ pattern matching with **zero hash collisions, zero floating-point math, and zero string verification overhead**!

---

## 5. 🎯 Day 31 Checkpoint Questions

Verify your depth in rolling hashes with these 4 questions:

1. **The Negative Modulo Trap:** Why does `(windowHash - outChar * highPower) % MOD` produce a negative result in C#? What is the algebraic formula to guarantee a non-negative result in $[0, MOD - 1]$?
2. **Bit-Packing Efficiency:** In LeetCode 187, why is a 20-bit bitwise rolling hash strictly faster and more reliable than a polynomial rolling hash? Name two distinct advantages.
3. **Double Hashing Probability:** If modulus $M_1 = 10^9 + 7$ and $M_2 = 10^9 + 9$, what is the theoretical probability of a spurious hash collision when using Double Hashing?
4. **Answer Space Connection:** In LeetCode 1062, why is the condition "string contains a repeating substring of length $L$" monotonic? Why does a repeating substring of length $L$ guarantee the existence of one of length $L - 1$?
