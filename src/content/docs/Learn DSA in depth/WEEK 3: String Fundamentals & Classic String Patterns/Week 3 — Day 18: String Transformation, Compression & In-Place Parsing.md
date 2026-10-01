---
title: "Week 3 — Day 18: String Transformation, Compression & In-Place Parsing"
---

Welcome to Day 18! Today we bring our traversal toolkit full-circle by combining **in-place pointer mechanics** (from Week 1) with **string manipulation and compression**.

In managed languages, strings are immutable, but interviewers frequently present string problems formatted around `char[]` buffers or ask you to simulate **$O(1)$ auxiliary space transformations**. Mastering the **Reader & Writer idiom** and the **Reverse-All-Then-Reverse-Each-Word idiom** is essential for high-performance string engineering.

---

## 1. 🧠 TEACH: The Mechanics of In-Place String Mutation

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* In-place string transformation mutates a character buffer via reader/writer pointers and symmetric subsegment reversals.
  - *Core Invariants:* Compaction Invariant: $w \le r$; 3-Step Word Reversal Invariant: $\text{rev}(\text{rev}(w_1) + \text{rev}(w_2) + \dots + \text{rev}(w_k)) = w_k + \dots + w_2 + w_1$; Run-Length Invariant: Write character, then write run count digits if count $> 1$.
  - *Misconception Check:* Reversing words in a string does *not* require `string.Split(' ')` (which allocates dozens of substring objects); converting to a `char[]` buffer and reversing the entire string followed by reversing each word achieves $O(N)$ time with zero GC garbage.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the massive heap allocation spikes caused by `Split()`, `Trim()`, and `Join()` in high-throughput services.
  - *Complexity Advantage:* Reduces memory complexity from $O(N)$ auxiliary allocations to $O(1)$ auxiliary space on mutable character buffers.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "String Compression" (LC 443), "Reverse Words in a String" (LC 151), "Clean redundant spaces in text". Signal words: "modify character array in-place", "compress string", "reverse words".
  - *When to Avoid / Failure Modes:* If the input string cannot be modified and output must be a standard immutable `string` (allocating the result is required, but intermediate garbage is eliminated).
- **4. WHERE:**
  - *Physical CLR Memory:* Mutable `char[]` buffer or stack-allocated `Span<char>`. In-place updates avoid Gen 0 GC collections.
  - *Production Systems:* Protocol buffer wire format serializers, HTTP URL path normalization, log file space sanitizers.
- **5. WHO:**
  - *Spoken Script:* "To reverse words in a string in $O(1)$ extra space, I clean extra spaces using reader/writer pointers, reverse the entire character array, and then reverse each individual word within its boundary. For string compression, I count contiguous runs and write the character and count digits in-place."
  - *Interviewer Evaluation Lens:* Checks multi-pass pointer coordination, edge case handling with leading/trailing/multiple spaces, and single-digit vs multi-digit count formatting.
- **6. HOW:**
  - *Cost Model:* Time: $O(N)$ linear time; Space: $O(1)$ auxiliary space (modifying `char[]`).
  - *State Transition Trace (Reverse Words):* `"the sky is blue" -> Clean spaces -> Reverse all: "eulb si yks eht" -> Reverse words: "blue is sky the"`.


### 1.1 Physical Mental Model: The Ticker Tape Scribe & The Mirror Word Dance

In-place string transformation and compression rely on two elegant mechanical operations:

```
       ======================================================================
         PHYSICAL ANALOGY A: THE TICKER TAPE SCRIBE (COMPRESSION LC 443)
       ======================================================================

       Input Ticker Tape: [ 'a', 'a', 'a', 'b', 'b', 'c' ]
       
       1. Scout (runner) measures run of identical characters: "aaa" -> length 3.
       2. Scribe (write) records:
          Slot 0: [ 'a' ]
          Slot 1: [ '3' ]
       
       🛡️ THE NON-OVERWRITE GUARANTEE:
       Original "aaa" took 3 slots.
       Compressed "a3" takes only 2 slots!
       The Scribe always lags behind or matches the Reader (`write <= read`).
       It is physically impossible to overwrite unread letters!
```

```
       ======================================================================
         PHYSICAL ANALOGY B: THE MIRROR WORD DANCE (REVERSE WORDS LC 151)
       ======================================================================

       Sentence: "the sky is blue"

       STEP 1: FLIP ENTIRE SENTENCE IN A MIRROR
       Result:   "eulb si yks eht"
       Observation: The words are now in the EXACT right order!
                    ("blue" is first, "the" is last).
                    The only problem: each individual word is backwards!

       STEP 2: FLIP EACH WORD INDIVIDUALLY RIGHT-SIDE-UP
       - Flip "eulb" -> "blue"
       - Flip "si"   -> "is"
       - Flip "yks"  -> "sky"
       - Flip "eht"  -> "the"
       Result:   "blue is sky the"
       Zero auxiliary arrays! Strictly O(1) in-place transformation!
```

---

### 1.2 The Reader & Writer Compression Invariant (LeetCode 443)

In Run-Length Encoding (RLE), consecutive identical characters are compressed into the character followed by its count:
`['a', 'a', 'b', 'b', 'c', 'c', 'c']` $\to$ `['a', '2', 'b', '2', 'c', '3']`.

```
                    write           read            runner
                      ▼               ▼               ▼
Array: [ 'a', '2',  'b',   ...   |  'c',  'c',  'c',  'd' ]
         ◄──── Finalized ────►     ◄── Run length = 3 ──►
```

#### Why In-Place Overwriting is Always Safe:
> **The `write <= read` Invariant:**
> - A run of length 1 consumes 1 input slot and writes 1 character (`write == read`).
> - A run of length $K \ge 2$ consumes $K$ input slots and writes at most $1 + \lfloor \log_{10} K \rfloor + 1$ slots. Since $K \ge 2 > 1 + \text{digits}$, `write` will **never overtake `read`**.
> - You will never overwrite an unread character!

---

### 1.2 The Three-Step Reversal Idiom (LeetCode 151)

When asked to reverse the order of words in a sentence while cleaning whitespace (e.g. `"  the   sky is  blue  "` $\to$ `"blue is sky the"`), naive split/join creates multiple intermediate heap strings and arrays.

The optimal, allocation-minimized algorithm executes in **3 in-place passes**:

```
Input: "  the sky   is blue  "

Step 1: Clean spaces via Reader/Writer (Day 4 pattern)
        Result: "the sky is blue" (length = 15)

Step 2: Reverse the ENTIRE array (Day 2 pattern)
        Result: "eulb si yks eht"
        (Words are now in correct order, but each word is backwards!)

Step 3: Reverse EACH INDIVIDUAL word back to normal
        "eulb" -> "blue"
        "si"   -> "is"
        "yks"  -> "sky"
        "eht"  -> "the"
        Result: "blue is sky the"
```

---

### 1.3 Horizontal vs. Vertical Scanning (Prefix Matching)

When finding the Longest Common Prefix among $N$ strings:
- **Horizontal Scanning:** Compare `strs[0]` with `strs[1]`, take common prefix, compare with `strs[2]`, etc.
  - Flaw: If `strs[0]` is length $10,000$ and `strs[1]` is length $10,000$, but `strs[N-1]` is `"x"`, horizontal scanning does thousands of redundant character comparisons upfront.
- **Vertical Scanning (Optimal):** Inspect column 0 across all strings, then column 1, then column 2.
  - The moment a character mismatch occurs or any string terminates, **return immediately**.
  - Minimum possible work performed!

---

### 1.5 ⚙️ Core Operations Deep-Dive: In-Place Run-Length Compression & Two-Pass String Mutation

#### Dimension 1: Operation Contract & Big-O Bounds

##### In-Place String Mutation Primitives (`Compress`, `ReverseWordsInPlace`, `VerticalScanPrefix`)
- **Signatures:**
  - `public int Compress(char[] chars)`: In-place run-length compaction modifying array prefix in $\Theta(N)$ time and $O(1)$ auxiliary space.
  - `public string ReverseWords(string s)`: Three-step in-place reversal (clean spaces $\to$ reverse all $\to$ reverse each word) in $\Theta(N)$ time.
  - `public string LongestCommonPrefix(string[] strs)`: Fail-fast vertical column scan in $O(S)$ worst-case and $O(M \cdot \min |strs|)$ average time.
- **Preconditions:**
  - `chars` buffer is non-null ($N \ge 1$).
  - Character array is mutable and elements are within standard ASCII bounds.
- **Postconditions:**
  - Compacted content written to `chars[0 .. write - 1]` with no unread data prematurely overwritten ($write \le read$ invariant).
  - Returns strictly non-negative compressed length `write` ($1 \le write \le N$).
- **Complexity Bounds:**

| Implementation Strategy | Time Complexity | Auxiliary Space | Buffer Overwrite Risk | Allocation Churn |
| :--- | :--- | :--- | :--- | :--- |
| **In-Place Reader/Writer** | **$\Theta(N)$** | **$O(1)$** | **Zero (Proven $write \le read$)** | **Zero heap allocations** |
| **Intermediate `StringBuilder`** | $\Theta(N)$ | $O(N)$ | None (Separate buffer) | $1 \times$ array resize copy |
| **LINQ Grouping (`GroupBy`)** | $O(N)$ | $O(N)$ heap | None | Heavy allocation of iterator nodes |
| **Regex String Match** | $O(N)$ | $O(N)$ heap | None | Regex DFA state machine overhead |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
               In-Place Run-Length Compression Flow
                                 │
                   [Init: write = 0, read = 0]
                                 │
                       [read < chars.Length?]
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
                  YES                          NO ──► [Return write]
                   │
      [curr = chars[read], runner = read]
                   │
      [Advance runner while chars[runner] == curr]
                   │
           [count = runner - read]
                   │
          [chars[write++] = curr]
                   │
             [count > 1?]
         ┌─────────┴─────────┐
        YES                  NO
         │                   │
  [Convert count to          │
   decimal digits]           │
         │                   │
  [For each digit d:         │
   chars[write++] = d]       │
         │                   │
         └─────────┬─────────┘
                   ▼
             [read = runner]
                   │
                   ▼
            (Next Iteration)
```

---

#### Dimension 3: Visual ASCII State Transitions

##### Non-Overwriting Reader-Writer In-Place Compression Trace
```
Initial Array: [ 'a', 'a', 'a', 'b', 'b', 'c' ]   (N = 6)

Step 1: Group 'a' (read = 0, runner = 3, count = 3)
- Write char: chars[0] = 'a'    (write = 1)
- Write digit: chars[1] = '3'   (write = 2)
- State: [ 'a', '3', 'a', 'b', 'b', 'c' ]
                 ▲    ▲
               write read(3)
  *Notice:* chars[2] was corrupted, but read is ALREADY at index 3! No data loss!

Step 2: Group 'b' (read = 3, runner = 5, count = 2)
- Write char: chars[2] = 'b'    (write = 3)
- Write digit: chars[3] = '2'   (write = 4)
- State: [ 'a', '3', 'b', '2', 'b', 'c' ]
                           ▲    ▲
                         write read(5)

Step 3: Group 'c' (read = 5, runner = 6, count = 1)
- Write char: chars[4] = 'c'    (write = 5)
- count == 1, no digits written
- State: [ 'a', '3', 'b', '2', 'c', 'c' ]
                                ▲    ▲
                              write read(6 == N)

Final Output: write = 5. Result buffer prefix: ['a', '3', 'b', '2', 'c'].
```

---

#### Dimension 4: Invariant Preservation Proof

##### Safe Overwrite Theorem ($write \le read$):
For any character array `chars` processed by run-length encoding, the writer pointer never overtakes the reader pointer ($write \le runner = read_{next}$ at every step), ensuring unread characters are never overwritten before consumption.

##### Proof by Mathematical Induction over Character Groups:
1. **Base Case:** At start, $write = 0, read = 0$. Invariant $write \le read$ trivially holds.
2. **Inductive Step:**
   - Consider group $k$ of identical characters of length $L \ge 1$ spanning $[read \dots read + L - 1]$.
   - The reader advances by $L$ units: $read_{new} = read + L$.
   - The writer outputs:
     - 1 character for the symbol itself.
     - $D(L)$ characters for the decimal representation of count $L$ (if $L > 1$), where $D(L) = \lfloor \log_{10} L \rfloor + 1$.
   - Thus, the writer advances by $\Delta write = 1 + (L > 1 \ ? \ D(L) : 0)$.
   - We must show that $\Delta write \le L$ for all integers $L \ge 1$:
     - For $L = 1$: $\Delta write = 1 \le 1$. (Equality holds).
     - For $L \in [2, 9]$: $\Delta write = 1 + 1 = 2 \le L$ (since $L \ge 2$).
     - For $L \in [10, 99]$: $\Delta write = 1 + 2 = 3 \le L$ (since $L \ge 10$).
     - For any $L \ge 10^k$: $\Delta write = 1 + k + 1 = k + 2 \le 10^k \le L$.
   - In all cases, $\Delta write \le L = \Delta read$.
3. **Conclusion:**
   $$write_{new} = write + \Delta write \le read + \Delta read = read_{new}$$
   The invariant $write \le read$ is preserved monotonically across all group iterations. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Scenario | Concrete Input | Danger / Failure Mode | Invariant Protection Mechanism |
| :--- | :--- | :--- | :--- |
| **All Characters Unique** | `['a', 'b', 'c']` | Spurious digit generation | `if (count > 1)` guard prevents emitting '1'; $write$ matches $read$ at every step. Returns 3. |
| **Single Element Array** | `['x']` | Loop terminates before evaluation | Runner halts at 1; writes 'x'; exits; returns `write = 1`. |
| **Count Exceeding 9 (Multi-Digit)** | 12 identical `'b'`s | Digit truncation (e.g. writing "12" as single char) | Format decimal count: iterate over `count.ToString().ToCharArray()` (or reverse modulus) writing individual chars `'1'`, `'2'`. |
| **Massive Run ($L \ge 1000$)** | 2000 identical `'a'`s | Array overflow | $\Delta write = 1 + 4 = 5 \ll 2000$. Safe compression factor $> 400\times$. |
| **Empty String Prefix Array** | `strs = ["", "b"]` | IndexOutOfBounds during vertical scan | Scan checks `col == strs[i].Length`; terminates immediately returning `""`. |

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 443 — String Compression (Medium)

> Given an array of characters `chars`, compress it using the following algorithm:
> Begin with an empty string `s`. For each group of **consecutive repeating characters** in `chars`:
> - If the group's length is `1`, append the character to `s`.
> - Otherwise, append the character followed by the group's length.
>
> The compressed string `s` **should not be returned separately**, but instead, be stored **in the input character array `chars`**.
> Return the *new length of the array*. You must write an algorithm that uses only **$O(1)$ extra space**.

#### Visual Trace:
`chars = ['a', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b']` (1 'a', 12 'b's)

```
read = 0 ('a'):
  runner finds end of 'a' at index 1. count = 1 - 0 = 1.
  chars[write++] = 'a'. (write = 1).
  count == 1 -> no digits written.
  read moves to 1.

read = 1 ('b'):
  runner finds end of 'b' at index 13. count = 13 - 1 = 12.
  chars[write++] = 'b'. (write = 2).
  count = 12 > 1 -> write digits '1', '2':
    chars[write++] = '1'. (write = 3).
    chars[write++] = '2'. (write = 4).
  read moves to 13. Loop ends.

Result = 4. chars[0..3] = ['a', 'b', '1', '2'].
```

#### Production C# Implementation:
```csharp
public class SolutionCompress {
    public int Compress(char[] chars) {
        int write = 0;
        int read = 0;

        while (read < chars.Length) {
            char currentChar = chars[read];
            int runner = read;

            // Find the boundary of the current identical run
            while (runner < chars.Length && chars[runner] == currentChar) {
                runner++;
            }

            int count = runner - read;

            // 1. Write the character
            chars[write++] = currentChar;

            // 2. If count > 1, write each digit of the count
            if (count > 1) {
                string countStr = count.ToString();
                for (int i = 0; i < countStr.Length; i++) {
                    chars[write++] = countStr[i];
                }
            }

            // Advance read to next distinct group
            read = runner;
        }

        return write;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — `read` and `runner` each traverse the array once.
- **Space Complexity:** $O(1)$ auxiliary space.

---

### Problem 2: LeetCode 151 — Reverse Words in a String (Medium)

> Given an input string `s`, reverse the order of the **words**.
> A **word** is defined as a sequence of non-space characters. The words in `s` will be separated by at least one space.
> Return *a string of the words in reverse order concatenated by a single space*.
> **Note:** `s` may contain leading or trailing spaces or multiple spaces between two words. The returned string should only have a single space separating the words. Do not include any extra spaces.

#### Production C# Implementation (3-Pass In-Place Simulation):
```csharp
public class SolutionReverseWords {
    public string ReverseWords(string s) {
        char[] chars = s.ToCharArray();
        int n = chars.Length;

        // Step 1: Clean spaces in-place (Reader & Writer)
        int write = 0;
        int read = 0;
        while (read < n) {
            // Skip spaces
            while (read < n && chars[read] == ' ') read++;

            // If we found a word and it's not the first word, insert single space
            if (read < n && write > 0) {
                chars[write++] = ' ';
            }

            // Copy word characters
            while (read < n && chars[read] != ' ') {
                chars[write++] = chars[read++];
            }
        }
        int len = write; // Compacted length

        // Step 2: Reverse the entire cleaned string [0 .. len - 1]
        Reverse(chars, 0, len - 1);

        // Step 3: Reverse each individual word in-place
        int wordStart = 0;
        for (int i = 0; i <= len; i++) {
            if (i == len || chars[i] == ' ') {
                Reverse(chars, wordStart, i - 1);
                wordStart = i + 1;
            }
        }

        return new string(chars, 0, len);
    }

    private static void Reverse(char[] arr, int left, int right) {
        while (left < right) {
            char temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++;
            right--;
        }
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — three linear passes (clean spaces, reverse all, reverse each word).
- **Space Complexity:** $O(N)$ for mutable `char[]` buffer; $O(1)$ auxiliary algorithmic space.

---

### Problem 3: LeetCode 14 — Longest Common Prefix (Easy)

> Write a function to find the longest common prefix string amongst an array of strings.
> If there is no common prefix, return an empty string `""`.

#### Vertical Scan Implementation:
```csharp
public class SolutionLongestCommonPrefix {
    public string LongestCommonPrefix(string[] strs) {
        if (strs == null || strs.Length == 0) return string.Empty;

        // Scan vertically across each character column of strs[0]
        for (int col = 0; col < strs[0].Length; col++) {
            char c = strs[0][col];

            // Verify if all other strings have character 'c' at column 'col'
            for (int row = 1; row < strs.Length; row++) {
                if (col >= strs[row].Length || strs[row][col] != c) {
                    // Mismatch or end of string reached: return prefix immediately
                    return strs[0].Substring(0, col);
                }
            }
        }

        return strs[0];
    }
}
```

#### Complexity:
- **Time Complexity:** $O(S)$ in worst case (where $S$ is sum of all characters), but terminates on the **first mismatched column**, making average time proportional to $O(N \times \text{prefixLen})$.
- **Space Complexity:** $O(1)$ auxiliary space.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Solve these to master string mutation mechanics:

### Problem 1 (In-Place RLE): LeetCode 443 — String Compression (Medium)
- **Goal:** Compress run-lengths into `chars` with $O(1)$ extra space.
- **Key Insight:** `runner - read` count, write digits sequentially.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 2 (3-Pass Word Reversal): LeetCode 151 — Reverse Words in a String (Medium)
- **Goal:** Clean spaces, reverse entire sentence, reverse each word back.
- **Key Insight:** Fast/Slow whitespace compaction + Opposite-Ends word reversal.
- **Target Complexity:** $O(N)$ time, $O(1)$ auxiliary space.

### Problem 3 (Vertical Prefix Scan): LeetCode 14 — Longest Common Prefix (Easy)
- **Goal:** Find prefix in minimum character inspections.
- **Key Insight:** Column-by-column scan with early return on mismatch.
- **Target Complexity:** $O(S)$ time, $O(1)$ space.

### Bonus / Extension Challenge: LeetCode 186 — Reverse Words in a String II (Medium)
- **Goal:** Reverse words in `char[]` in-place where spaces are already single spaces.
- **Hint:** Skip Step 1 of LC 151! Just Step 2 (reverse whole) + Step 3 (reverse words).

---

## 4. 🔗 CONNECT: Full Circle to Week 1 Mechanics

Notice how Day 18 directly synthesizes Week 1:

```
Week 1 Technique                   Day 18 Application
─────────────────────────────────  ──────────────────────────────────────────
Fast & Slow Pointers (Day 4)   ──► Space compaction in ReverseWords (LC 151)
Opposite-Ends Pointers (Day 2) ──► Reversal idiom (whole + words) (LC 151)
In-Place Overwriting (Day 1)   ──► Run-Length Encoding compression (LC 443)
```

---

## 5. 🎯 Day 18 Checkpoint Questions

1. **Safety Proof:** In LeetCode 443 (String Compression), why is it impossible for `write` to ever overtake `read` and overwrite an unprocessed character?
2. **Reversal Trick:** Explain why reversing the entire string first, and then reversing each individual word, produces the words in correct order with correct spelling.
3. **Scan Comparison:** Why does vertical scanning in LeetCode 14 perform significantly fewer character inspections than horizontal scanning when the last string in the array is very short or has a completely different prefix?
