---
title: "Week 3 — Day 20: Master Review, Pattern Cross-Mapping & Integration Challenges"
---

Welcome to Day 20! You have now completed the entire array and string curriculum across Weeks 1, 2, and 3.

Today is our **Grand Synthesis & Pattern Cross-Mapping Day**. Before the Week 1–3 Milestone Assessment (Mock Interview) tomorrow, we construct a unified decision architecture across all 12 core patterns, walk through three integration challenges combining multiple techniques, and provide your master code templates.

---

## 1. 🧠 TEACH: The Unified Pattern Decision Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* Day 20 is the **Phase 1 Master Review & Cross-Mapping Module**, synthesizing pattern selection across Array Memory, Pointers, Windows, Prefixes, and Strings.
  - *Core Invariants:* Diagnostic Decision Invariant: Contiguous range query $\implies$ Prefix Sum / Sliding Window; Sorted pair/triplet search $\implies$ Opposite-Ends Two Pointers; In-place compaction $\implies$ Reader/Writer Pointers; Anagrams $\implies$ Frequency Vector.
  - *Misconception Check:* Do not jump into coding immediately; the 60-second interview diagnostic must establish whether the problem domain is monotonic, whether memory is contiguous, and whether auxiliary space is restricted to $O(1)$.
- **2. WHY:**
  - *Bottleneck Solved:* Prevents candidate panic and false starts in technical interviews by building structured pattern recognition reflexes.
  - *Complexity Advantage:* Instantly maps any linear data problem to its mathematically optimal complexity tier ($O(N)$ time, $O(1)$ or $O(N)$ space).
- **3. WHEN:**
  - *When to Choose / Signal Words:* Pre-assessment synthesis, complex multi-pattern problems blending sliding window with frequency vectors or two pointers with sorting.
  - *When to Avoid / Failure Modes:* Never rely on memorized code solutions; always derive the solution from the underlying invariant.
- **4. WHERE:**
  - *Physical CLR Memory:* Full spectrum: stack allocation, CPU cache lines, Gen 0/1/2 GC impact, string immutability, and zero-allocation `Span<T>`.
  - *Production Systems:* High-performance low-latency service architectures where GC pauses and memory allocations are strictly bounded.
- **5. WHO:**
  - *Spoken Script:* "In linear collections, my first step is diagnosing access patterns and constraints: contiguous ranges with non-negative data map to sliding window; negative numbers require prefix sums with a hash map; sorted pair searches map to opposite-ends two pointers; and in-place updates map to reader-writer compaction."
  - *Interviewer Evaluation Lens:* Assesses breadth of pattern recognition, crisp articulation of trade-offs, and speed of algorithmic classification.
- **6. HOW:**
  - *Cost Model:* Diagnostic classification: $\le 60$ seconds; Implementation: $\le 15$ minutes per Medium problem.
  - *State Transition Trace:* Problem Prompt $\to$ Monotonicity Check $\to$ Memory Constraint Check $\to$ Invariant Selection $\to$ Implementation $\to$ Verification.


### 1.1 Physical Mental Model: The Grand Linear Inspection Conveyor

Weeks 1 through 3 establish that all linear array and string algorithms operate through three mechanical pointer configurations across a physical tape:

```
       ======================================================================
         PHYSICAL ANALOGY: THE 3 LINEAR POINTER CONFIGURATIONS
       ======================================================================

       1. THE HYDRAULIC CALIPER (Opposite Ends / Center Expansion)
          [Left Jaw] ------------------>               <------------------ [Right Jaw]
          - Inward: Exploits sorted monotonicity to prune 2D search spaces in O(N).
          - Outward: Radiates from 2N - 1 acoustic canyon centers for palindromes.

       2. THE INCHWORM ACCORDION (Fixed & Variable Sliding Windows)
          [Tail / Left] ============================== [Head / Right] -------->
          - Fixed Width: Cardboard cutout with O(1) incremental delta (+in, -out).
          - Variable: Elastic inchworm expanding right, contracting left to restore validity.

       3. THE SCRIBE & INSPECTOR (Reader / Writer In-Place Compaction)
          [Clean Accepted]       [Garbage Buffer]        [Raw Unexamined Tape]
          0 ... write - 1       write ... read - 1      read ............. N - 1
                                  ^                       ^
                               Scribe                  Inspector
          - write <= read invariant guarantees zero data stomping in O(1) space!
```

```
       ======================================================================
           HARDWARE EXECUTION ARCHITECTURE: FLAT CONTIGUOUS MEMORY
       ======================================================================

       Managed Stack: [ left: 0 ]  [ right: 15 ]  [ write: 3 ]  [ matchCount: 26 ]
             |
             v
       Flat Array Buffer in L1/L2 CPU Cache Lines:
       +-------+-------+-------+-------+-------+-------+-------+-------+
       |  'a'  |  'b'  |  'c'  |  'd'  |  'e'  |  'f'  |  'g'  |  'h'  |
       +-------+-------+-------+-------+-------+-------+-------+-------+
       <------------ 64-Byte Hardware Prefetcher Sequential Stream ------------>
```

---

### 1.2 The 5-Second Diagnostic Flowchart

When you read any Array or String problem in an interview, trace this decision path:

```
                                    Array / String Problem
                                              │
      ┌───────────────────────────────────────┼───────────────────────────────────────┐
      ▼                                       ▼                                       ▼
PAIR / TRIPLET / SEARCH               CONTIGUOUS RANGE / SUBARRAY            TRANSFORMATION / PARSING
      │                                       │                                       │
      ├─ Sorted array?                        ├─ Static multiple queries?             ├─ Filter/Compact in-place?
      │  └─► Opposite-Ends Pointers           │  └─► 1D/2D Prefix Sum                 │  └─► Fast & Slow (Reader/Writer)
      │                                       │                                       │
      ├─ Palindrome symmetry?                 ├─ Target sum with negatives?           ├─ Reverse word sequence?
      │  ├─ Outside-In (Verification)         │  └─► Prefix Sum + Hash Map            │  └─► 3-Step In-Place Reversal
      │  └─ Inside-Out (Expansion)            │                                       │
      │                                       ├─ Monotonic min/max window?            ├─ Adjacent cancellation?
      └─ Sparse subsequence matching?         │  └─► Variable Sliding Window          │  └─► In-Place Stack Pointer
         ├─ Single pair: Greedy 2-pointer     │                                       │
         └─ Multi-target: Bucket Dispatch     └─ Fixed length K or Anagrams?          └─ Numeric parsing / Atoi?
                                                 └─► Fixed Window / Match Counter        └─► Pre-Multiplication Guard
```

---

### 1.2 The Master Decision Matrix (All 12 Patterns)

| # | Pattern Name | Trigger Signals | Key Invariant | Time | Space |
|:---:|:--- |:--- |:--- |:---:|:---:|
| **1** | **Opposite-Ends Pointers** | Sorted array, Two Sum II, Container With Water | Monotonicity: moving pointer shrinks search space predictably | $O(N)$ | $O(1)$ |
| **2** | **Reader & Writer Pointers** | In-place removal, Move Zeroes, Deduplication | `write <= read`; valid items in `[0 .. write - 1]` | $O(N)$ | $O(1)$ |
| **3** | **Array Reversal Trick** | Rotate array by $K$, Reverse Words | $(A^R B^R)^R = BA$ | $O(N)$ | $O(1)$ |
| **4** | **1D Prefix Sum** | Static immutable array, repeated range sums | $\text{Sum}(L \dots R) = P[R + 1] - P[L]$ ($N+1$ dummy) | $O(1)$ query | $O(N)$ |
| **5** | **Prefix Sum + Hash Map** | Subarray sum equals $K$ with **negative numbers** | $P[i-1] = P[j] - K$; count: `map[0]=1`, maxLen: `map[0]=-1` | $O(N)$ | $O(N)$ |
| **6** | **2D Prefix Sum** | Matrix subgrid range queries | Inclusion-Exclusion: $+ \text{BR} - \text{TR} - \text{BL} + \text{TL}$ | $O(1)$ query | $O(MN)$ |
| **7** | **Fixed-Size Window** | Exactly length $K$ given, maximum average | Delta update: $+ \text{nums}[r] - \text{nums}[r - K]$ | $O(N)$ | $O(1)$ |
| **8** | **Variable-Size Window** | Longest/shortest span, all non-negative | Monotonic accordion: expand `r`, shrink `l` | $O(N)$ | $O(1)$ |
| **9** | **Frequency Match Window** | Anagrams, Permutation in String, Min Window | Single `matches` counter or deficit vector `missing` | $O(N)$ | $O(1)$ |
| **10**| **Inside-Out Expansion** | Longest Palindromic Substring | Expand around $2N - 1$ centers (odd & even) | $O(N^2)$ | $O(1)$ |
| **11**| **Multi-Pointer Buckets** | $K$ words against 1 long text (Subsequences) | 26 waiting lists; stream text $S$ once | $O(\|S\| + \sum L)$ | $O(K)$ |
| **12**| **In-Place Stack Pointer** | Remove adjacent duplicates, nested collapses | Use input `char[]` with `write` as stack top | $O(N)$ | $O(1)$ |

---

### 1.3 ⚙️ Core Operations Deep-Dive: String Pattern Cross-Mapping & Parsing Automata Synthesis

#### Dimension 1: Operation Contract & Big-O Bounds

##### String State Machine & Stack Primitives (`RemoveAdjacentDuplicates`, `MyAtoi`, `LengthOfLongestKDistinct`)
- **Signatures:**
  - `public string RemoveDuplicates(string s)`: In-place stack simulation eliminating adjacent duplicates in $\Theta(N)$ time and $O(1)$ auxiliary space.
  - `public int MyAtoi(string s)`: Deterministic finite automaton state transition with clamped 32-bit overflow guards in $\Theta(N)$ time and $O(1)$ space.
  - `public int LengthOfLongestSubstringKDistinct(string s, int k)`: Multi-character accordion sliding window in $\Theta(N)$ amortized time.
- **Preconditions:**
  - String input is non-null ($0 \le N \le 10^5$).
  - Character alphabet conforms to UTF-16 code units (ASCII subset optimized via flat lookup tables).
- **Postconditions:**
  - Stack reduction produces an irreducible string containing no two identical adjacent characters.
  - Numeric parsing strictly returns values clamped to $[ -2^{31}, 2^{31} - 1 ]$ without throwing arithmetic overflow exceptions.
- **Complexity Bounds:**

| Implementation Pattern | Time Complexity | Auxiliary Space | Memory Allocations | Cache Friendliness |
| :--- | :--- | :--- | :--- | :--- |
| **In-Place Stack Pointer (`char[]`)** | **$\Theta(N)$** | **$O(1)$** | **1 char array (reused)** | L1 cache contiguous |
| **Generic `Stack<char>` Object** | $\Theta(N)$ | $O(N)$ | Node allocations / internal array | High pointer overhead |
| **Repeated `string.Replace`** | $O(N^2)$ | $O(N^2)$ | Creates new string on each reduction | Heavy GC Gen 0 thrash |
| **Regex Adjacent Replacement** | $O(N^2)$ | $O(N)$ | NFA/DFA state backtracking | Slow execution |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
          In-Place Stack Simulation Flow (LeetCode 1047)
                                │
                 [Init: chars = s.ToCharArray(),
                        write = 0]
                                │
                   [For read = 0 to N - 1]
                                │
                 [write > 0 AND chars[write - 1] == chars[read]?]
                ┌───────────────┴───────────────┐
                ▼                               ▼
               YES                              NO
                │                               │
        (Adjacent duplicate!)           (Distinct character)
                │                               │
            [write--]                  [chars[write++] = chars[read]]
         (Pop from stack)               (Push onto stack)
                │                               │
                └───────────────┬───────────────┘
                                ▼
                         (Next Iteration)
                                │
                                ▼
             [Return new string(chars, 0, write)]
```

```
           Deterministic Finite Automaton: String to Integer (Atoi)
                                │
                    [State 0: Skip Whitespace]
                                │
                    [State 1: Optional Sign (+/-)]
                                │
                    [State 2: Consume Digits]
                                │
            ┌───────────────────┴───────────────────┐
            ▼                                       ▼
    [Overflow Check:                        [Valid Digit:
     total > MAX/10 OR                       total = total * 10 + d]
     (total == MAX/10 && d > 7)]                    │
            │                                       │
           YES                                      ▼
            │                                (Next Character)
    [Return Clamped Value:                          │
     sign == 1 ? MAX : MIN]                         ▼
                                            [State 3: Terminate]
                                            [Return sign * total]
```

---

#### Dimension 3: Visual ASCII State Transitions

##### In-Place Stack Reduction Trace: `s = "abbaca"`
```
Input: "abbaca", char[] chars, write = 0

read = 0 ('a'):
- Stack empty ──► chars[0] = 'a', write = 1.
- State: [ 'a' ] (write = 1)

read = 1 ('b'):
- chars[0] ('a') != 'b' ──► chars[1] = 'b', write = 2.
- State: [ 'a', 'b' ] (write = 2)

read = 2 ('b'):
- chars[1] ('b') == 'b' ──► MATCH! write decrements: 2 -> 1 (Pop 'b').
- State: [ 'a' ] (write = 1)
  *Notice:* chars[1] is now logically dead.

read = 3 ('a'):
- chars[0] ('a') == 'a' ──► MATCH! write decrements: 1 -> 0 (Pop 'a').
- State: [ ] (write = 0)

read = 4 ('c'):
- Stack empty ──► chars[0] = 'c', write = 1.
- State: [ 'c' ] (write = 1)

read = 5 ('a'):
- chars[0] ('c') != 'a' ──► chars[1] = 'a', write = 2.
- State: [ 'c', 'a' ] (write = 2)

Final Result: Substring chars[0 .. 1] = "ca".
```

---

#### Dimension 4: Invariant Preservation Proof

##### Theorem (Irreducible Reduction Invariant):
For any string $s$, processing with an in-place stack pointer yields an irreducible string $R$ such that no two adjacent characters are identical, and $R$ is equivalent to repeatedly removing adjacent pairs from $s$.

##### Proof by Structural Induction on Traversal Index `read`:
1. **Base Case ($read = 0$):**
   - The stack contains 0 characters ($write = 0$). An empty string contains no adjacent duplicates and is trivially irreducible. Invariant holds.
2. **Inductive Step:**
   - Assume by hypothesis that `chars[0 .. write - 1]` represents the unique irreducible reduction of prefix $s[0 .. read - 1]$.
   - Let the next incoming character be $c = s[read]$.
   - **Case A ($write > 0$ and $chars[write - 1] == c$):**
     - Character $c$ and the current stack top $chars[write - 1]$ form an adjacent duplicate pair.
     - By Church-Rosser confluence for string reductions, cancelling this pair immediately preserves global equivalence.
     - Decrementing `write--` removes $chars[write - 1]$.
     - The resulting prefix `chars[0 .. write - 2]` was irreducible by hypothesis.
   - **Case B ($write == 0$ or $chars[write - 1] \ne c$):**
     - Character $c$ differs from the adjacent left neighbor.
     - Appending $c$ creates no duplicate with the immediate top.
     - Since the previous stack had no adjacent duplicates, adding $c$ at the end cannot create any duplicates internally.
     - Incrementing `write++` produces an irreducible prefix of length $write$.
3. **Conclusion:**
   - At $read = N$, the prefix `chars[0 .. write - 1]` is irreducible.
   - Because each character is pushed at most once and popped at most once, total operations are bounded by $2N \in O(N)$ time. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Scenario | Concrete Input | Danger / Failure Mode | Invariant Protection Mechanism |
| :--- | :--- | :--- | :--- |
| **Complete Annihilation** | `s = "abba"` | Stack underflow on repeated pops | Guard: `write > 0` before indexing `chars[write - 1]`. Correctly drops to 0 and returns `""`. |
| **No Adjacent Duplicates** | `s = "abcdef"` | Unnecessary pops | `chars[write - 1] == chars[read]` never matches; `write` advances to $N$. Returns original string. |
| **Arithmetic Overflow (Atoi)** | `s = "2147483648"` | Overflow wrap into negative integers | Pre-multiplication guard: `if (total > 214748364 || (total == 214748364 && digit > 7))` clamps to `int.MaxValue`. |
| **Negative Overflow (Atoi)** | `s = "-2147483649"` | Arithmetic underflow | Pre-multiplication guard returns `int.MinValue` directly. |
| **Leading Garbage Characters** | `s = "words and 987"` | Spurious numeric parsing | State machine requires digits/sign as first non-space character; immediately halts and returns 0. |

---

---

### 🎤 Multi-Topic Spoken Synthesis Drill (≤ 60 Seconds)

#### Synthesis Drill: String Immutability vs. Mutable Buffer (StringBuilder)
- **String Concatenation in Loops:** Strings are immutable in .NET/CLR. Concatenating inside a loop of length $N$ generates $N$ transient heap allocations, triggering Gen 0 GC storms and $O(N^2)$ copying time.
- **StringBuilder / ValueStringBuilder:** Amortized $O(1)$ append via geometric chunk doubling. Use `Span<char>` and stack allocation (`stackalloc char[256]`) for zero-allocation parsing in hot paths.


## 2. 🎬 DEMONSTRATE: Integration Problems

---

### Problem 1: LeetCode 340 — Longest Substring with At Most K Distinct Characters (Medium)

> Given a string `s` and an integer `k`, return the *length of the longest substring of `s` that contains at most `k` distinct characters*.

#### Integration Points:
- Variable-Size Sliding Window (Template 1)
- Frequency Map tracking distinct keys
- Edge cases: $K = 0$ or $K \ge \text{distinct chars}$

#### Production C# Implementation:
```csharp
public class SolutionLengthOfLongestSubstringKDistinct {
    public int LengthOfLongestSubstringKDistinct(string s, int k) {
        if (string.IsNullOrEmpty(s) || k == 0) return 0;

        // ASCII frequency table
        int[] freq = new int[256];
        int distinctCount = 0;
        int left = 0;
        int maxLen = 0;

        for (int right = 0; right < s.Length; right++) {
            char rChar = s[right];
            if (freq[rChar] == 0) {
                distinctCount++;
            }
            freq[rChar]++;

            // When distinct characters exceed k, contract from left
            while (distinctCount > k) {
                char lChar = s[left];
                freq[lChar]--;
                if (freq[lChar] == 0) {
                    distinctCount--;
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
- **Space Complexity:** $O(1)$ — fixed 256-element integer table.

---

### Problem 2: LeetCode 1047 — Remove All Adjacent Duplicates In String (Easy)

> You are given a string `s` consisting of lowercase English letters. A **duplicate removal** consists of choosing two adjacent and equal letters and removing them.
> We repeatedly make duplicate removals on `s` until we no longer can.
> Return *the final string after all such duplicate removals have been made*.

#### The Two-Pointer Stack Simulation (Zero Extra Memory):
While standard solutions use a `Stack<char>`, top candidates use `chars` as an **in-place stack** using a single integer `write`:
- `write` represents the size of the stack.
- Top of the stack is `chars[write - 1]`.
- If `write > 0 && chars[write - 1] == chars[read]`:
  **Pop:** `write--` (cancels adjacent duplicate!).
- Else:
  **Push:** `chars[write++] = chars[read]`.

#### Visual Trace:
`s = "abbaca"`

```
read = 0 ('a'): stack empty -> push 'a'. chars[0] = 'a', write = 1
read = 1 ('b'): top ('a') != 'b' -> push 'b'. chars[1] = 'b', write = 2
read = 2 ('b'): top ('b') == 'b' -> MATCH! POP! write = 1 (stack is now ['a'])
read = 3 ('a'): top ('a') == 'a' -> MATCH! POP! write = 0 (stack is empty)
read = 4 ('c'): stack empty -> push 'c'. chars[0] = 'c', write = 1
read = 5 ('a'): top ('c') != 'a' -> push 'a'. chars[1] = 'a', write = 2

Result: "ca" of length write = 2.
```

#### Production C# Implementation:
```csharp
public class SolutionRemoveDuplicates {
    public string RemoveDuplicates(string s) {
        char[] chars = s.ToCharArray();
        int write = 0; // In-place stack top pointer

        for (int read = 0; read < chars.Length; read++) {
            if (write > 0 && chars[write - 1] == chars[read]) {
                // Adjacent duplicate detected: pop from stack
                write--;
            } else {
                // Push to stack
                chars[write++] = chars[read];
            }
        }

        return new string(chars, 0, write);
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — single pass.
- **Space Complexity:** $O(N)$ for `char[]` buffer; $O(1)$ auxiliary memory (zero stack allocations).

---

### Problem 3: LeetCode 8 — String to Integer (atoi) (Medium)

> Implement the `myAtoi(string s)` function, which converts a string to a 32-bit signed integer.
> 1. Whitespace: Ignore leading spaces.
> 2. Signedness: Determine sign by checking if the next character is `'-'` or `'+'`.
> 3. Conversion: Read integer digits until non-digit is encountered.
> 4. Rounding: Clamp to $[-2^{31}, 2^{31} - 1]$ if overflow occurs.

#### The Pre-Multiplication Overflow Guard:
How do you test if `result * 10 + digit > int.MaxValue` **without triggering overflow**?
$$\text{result} > \frac{\text{int.MaxValue}}{10} \quad \text{OR} \quad \left(\text{result} == \frac{\text{int.MaxValue}}{10} \text{ and } \text{digit} > 7\right)$$
Because $2^{31} - 1 = 2,147,483,64\mathbf{7}$.

#### Production C# Implementation:
```csharp
public class SolutionMyAtoi {
    public int MyAtoi(string s) {
        if (string.IsNullOrEmpty(s)) return 0;

        int i = 0;
        int n = s.Length;

        // 1. Skip leading whitespace
        while (i < n && s[i] == ' ') i++;
        if (i == n) return 0;

        // 2. Check sign
        int sign = 1;
        if (s[i] == '-' || s[i] == '+') {
            sign = (s[i] == '-') ? -1 : 1;
            i++;
        }

        int result = 0;
        int threshold = int.MaxValue / 10;

        // 3. Read digits with overflow guard
        while (i < n && char.IsDigit(s[i])) {
            int digit = s[i] - '0';

            // Pre-multiplication overflow check
            if (result > threshold || (result == threshold && digit > 7)) {
                return (sign == 1) ? int.MaxValue : int.MinValue;
            }

            result = result * 10 + digit;
            i++;
        }

        return result * sign;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — single pass; early exits on non-digit.
- **Space Complexity:** $O(1)$ auxiliary space.

---

## 3. 🛠️ Master Code Template Sheet

### Template A: Subarray Sum Equals K (Prefix Sum + Hash Map)
```csharp
public int SubarraySum(int[] nums, int k) {
    int count = 0, runningSum = 0;
    var map = new Dictionary<int, int> { [0] = 1 };
    foreach (int x in nums) {
        runningSum += x;
        count += map.GetValueOrDefault(runningSum - k, 0);
        map[runningSum] = map.GetValueOrDefault(runningSum, 0) + 1;
    }
    return count;
}
```

### Template B: Variable Sliding Window (Dynamic Min/Max)
```csharp
public int MaxWindow(int[] nums, int k) {
    int left = 0, maxLen = 0;
    for (int right = 0; right < nums.Length; right++) {
        Add(nums[right]);
        while (IsInvalid()) { Remove(nums[left]); left++; }
        maxLen = Math.Max(maxLen, right - left + 1);
    }
    return maxLen;
}
```

### Template C: 2D Prefix Sum Query
```csharp
public int Query2D(int[,] P, int r1, int c1, int r2, int c2) =>
    P[r2 + 1, c2 + 1] - P[r1, c2 + 1] - P[r2 + 1, c1] + P[r1, c1];
```

---

## 4. 🏋️ PRACTICE: Day 20 Integration Challenges

1. **[LeetCode 340] Longest Substring with At Most K Distinct Characters (Medium)** — Variable sliding window with frequency bounds.
2. **[LeetCode 1047] Remove All Adjacent Duplicates In String (Easy)** — In-place stack simulation via pointer overwriting.
3. **[LeetCode 8] String to Integer (atoi) (Medium)** — Pre-multiplication 32-bit overflow guards.
4. **[LeetCode 451] Sort Characters By Frequency (Medium)** *(Bonus)* — Frequency table + Bucket Sort on counts ($O(N)$ runtime).

---

## 5. 🎯 Day 20 Checkpoint Questions

1. **Pre-Multiplication Arithmetic:** In `MyAtoi`, why do we check `result > int.MaxValue / 10` instead of letting `result = result * 10 + digit` calculate first and checking `if (result < 0)`?
2. **In-Place Stack Duality:** In LeetCode 1047, how does the `write` pointer simultaneously act as an array index and a stack top?
3. **Subarray Contrast:** Why would solving LeetCode 340 with Prefix Sum + Hash Map be a disastrous choice compared to Sliding Window?

When you are ready, share your answers or request to launch **Day 21: Week 1–3 Milestone Assessment (Mock Interview Simulation)**!
