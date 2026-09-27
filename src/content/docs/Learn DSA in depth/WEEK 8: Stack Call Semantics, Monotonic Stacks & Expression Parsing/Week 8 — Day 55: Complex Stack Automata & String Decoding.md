---
title: "Week 8 — Day 55: Complex Stack Automata & String Decoding"
---

In **Day 54**, we engineered arithmetic expression parsers, evaluated postfix stacks, and derived the Shunting-Yard algorithm.

Today, we conquer **Complex Stack Automata & Greedy String Reduction**:
1. **Hierarchical String Decoding ([LeetCode 394]):** Managing dual-stack state machines (`countStack` + `stringStack`) to unwind nested repetition structures without recursion stack overhead.
2. **Greedy Monotonic Pruning with Frequency Lookaheads ([LeetCode 316] / [LeetCode 1081]):** Finding the lexicographically smallest sequence of unique characters.
3. **The 3 Invariant Conditions:** Proving when a character is permitted to be popped from a monotonic stack.
4. **Greedy High-Order Digit Stripping ([LeetCode 402]):** Removing $K$ digits to minimize numerical magnitude in $O(N)$ time.
5. **Edge Case Sanitization:** Managing remaining removals, empty outputs, and leading zero elimination.

---

## 1. 🧠 TEACH: Concept & Invariants

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **Complex Stack Automata** use multi-variable stack frames to evaluate nested grammar encodings and serialized object graphs.
  - *Core Invariants:* Context Stashing Invariant: When an opening bracket `[` is encountered, stash the current outer context `(currentString, currentK)` onto the stack and reset accumulators; Unwinding Invariant: When `]` is encountered, pop `(prevString, k)` and update `currentString = prevString + repeat(currentString, k)`.
  - *Misconception Check:* String concatenation inside decoding loops can trigger quadratic memory churn; use `StringBuilder` or pre-sized buffers to prevent GC Gen 0 thrashing.
- **2. WHY:**
  - *Bottleneck Solved:* Evaluates nested recursive string encodings without risking call stack overflow from deep recursion.
  - *Complexity Advantage:* Decodes strings in optimal $O(\text{Output Length})$ time and memory.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Decode String" (LC 394), "Mini Parser" (LC 385), "Flatten Nested List Iterator" (LC 341). Signal words: "decode string", "nested k-multiplied strings", "parse nested lists".
  - *When to Avoid / Failure Modes:* When grammar is ambiguous or requires backtracking parser tables.
- **4. WHERE:**
  - *Physical CLR Memory:* Stack holding tuple frames `Stack<(string, int)>`; heap-allocated `StringBuilder` for character accumulation.
  - *Production Systems:* JSON/XML streaming deserializers, template engine macro expansions, compressed archive decoding (run-length packet decoders).
- **5. WHO:**
  - *Spoken Script:* "To decode nested repeat patterns like 3[a2[c]], I use a stack to stash the outer string and multiplier whenever an opening bracket appears. On a closing bracket, I pop the parent context, duplicate the child string K times, and append it back to the parent string in $O(N)$ time."
  - *Interviewer Evaluation Lens:* Verifies handling of multi-digit numbers ($k \ge 10$), consecutive letters without multipliers, deeply nested brackets, and clean state resetting.
- **6. HOW:**
  - *Cost Model:* Time: $O(\text{Output Length})$; Space: $O(\text{Output Length})$.
  - *State Transition Trace (Decode String):* `3[a2[c]] -> see '3', '[': push ("", 3), str="a" -> see '2', '[': push ("a", 2), str="" -> see 'c': str="c" -> see ']': pop ("a", 2) => str = "a" + "cc" = "acc" -> see ']': pop ("", 3) => str = "" + 3*"acc" = "accaccacc"`.


### 1.1 Hierarchical String Decoding ([LeetCode 394])

Given an encoded string such as `3[a2[c]]`, decode it into `accaccacc`.

```
Input: 3 [ a 2 [ c ] ]
           └──┬──┘
        Inner: "acc"
       └──────┬──────┘
    Outer: "accaccacc"
```

#### Why Pure Regular Expressions or Simple Scans Fail:
Brackets can be nested to arbitrary depths (`k1[a k2[b k3[c ... ]]]`). Inner brackets **must** be resolved and multiplied before their enclosing parent strings can be constructed. This is the definition of a **LIFO grammar**.

#### The Dual-Stack State Machine:
We maintain:
- `countStack: Stack<int>` $\to$ stores the multiplier $K$ for each nesting level.
- `stringStack: Stack<StringBuilder>` $\to$ stores the partially constructed string *before* entering the current bracket.
- `currStr: StringBuilder` $\to$ the string currently being assembled at the active level.
- `currentK: int` $\to$ accumulates digits for the upcoming multiplier.

#### The 4 Token Transitions:
1. **Digit (`0`–`9`):** `currentK = currentK * 10 + (c - '0')`.
2. **Opening Bracket (`'['`):**
   - Push `currentK` onto `countStack`.
   - Push `currStr` onto `stringStack`.
   - Reset: `currStr = new StringBuilder()`, `currentK = 0`.
3. **Closing Bracket (`']'`):**
   - Pop the multiplier: `int repeatCount = countStack.Pop();`
   - Pop the outer prefix: `StringBuilder prevStr = stringStack.Pop();`
   - Append `currStr` repeated `repeatCount` times to `prevStr`.
   - Update active string: `currStr = prevStr`.
4. **Normal Character (`'a'`–`'z'`):** Append directly to `currStr`.

---

### 1.2 Lexicographical Minimization: Remove Duplicate Letters ([LeetCode 316])

Given a string `s`, remove duplicate letters so that every letter appears once and only once, ensuring the result is the **smallest in lexicographical order** among all possible results.

```
Example: "cbacdcbc"
Candidate 1: "cbad"
Candidate 2: "bacd"  <-- Lexicographically smallest!
```

#### The Conflict Between Greed and Survival:
- To make a string lexicographically smallest, we want smaller characters (like `'a'`) as early as possible.
- If we see a large character (like `'c'`), and then a smaller character (like `'a'`), we want to discard `'c'` and replace it with `'a'`!
- **However:** What if `'c'` never appears again in the rest of the string? If we discard `'c'`, we can never satisfy the requirement that every unique character must appear in the output!

#### The 3 Invariants for Popping from the Monotonic Stack:
As we process character `curr`:
If `curr` is **already in our stack**, we must **skip it** immediately! (Keeping its earlier occurrence is always lexicographically optimal).

If `curr` is not in the stack, we can pop the top character `top = stack.Peek()` **if and only if ALL THREE of these conditions hold**:
1. **Monotonicity:** `top > curr` (the top character is lexicographically worse than `curr`).
2. **Survival / Lookahead:** `remainingCount[top] > 0` (the top character appears AGAIN later in the string, so we are safe to discard it now and pick it up later).
3. **Unvisited:** `!inStack[curr - 'a']`.

```
Character: 'b', Stack top: 'c'
1. 'c' > 'b' ? YES.
2. Does 'c' appear later in string? YES (remainingCount['c'] > 0).
Conclusion: POP 'c'! We can pick up a better 'c' later!
```

---

### 1.3 High-Order Magnitude Reduction: Remove K Digits ([LeetCode 402])

Given string `num` representing a non-negative integer and integer `k`, remove `k` digits from the number so that the new number is the **smallest possible**.

#### The Exponential Dominance of High-Order Digits:
In a base-10 number, a change in the $i$-th digit from the left impacts the value by $10^{N - 1 - i}$.
Comparing `1432` vs `1342`:
- In `1432`, at index 1 we have digit `4` followed by smaller digit `3` ($4 > 3$).
- Removing `4` yields `132`, which is strictly smaller than removing any later digit!

#### The Invariant Rule:
Whenever a digit is immediately followed by a strictly smaller digit ($d_i > d_{i+1}$), **removing $d_i$ is always optimal**!
- Maintain a **Monotonic Increasing Stack of Digits**.
- When incoming digit `d < stack.Peek()` and $k > 0$:
  - `stack.Pop()`
  - `k--`
- Push `d` onto stack.

#### Two Critical Edge Cases:
1. **Unused $k$ removals:** If the digits are already in strictly ascending order (e.g. `num = "12345"`, `k = 2`), zero pops occur during the scan. We must pop the remaining $k$ digits from the **tail** (the top of the stack).
2. **Leading Zeros:** Stripping leading zeros (`"0200"` $\to$ `"200"`). If the final string is empty, return `"0"`.

---

### 1.4 Interview Spoken Drill (20–30 Seconds)

> *"For nested string decoding like 3[a2[c]], I use a dual-stack state machine tracking counts and string prefixes, appending multiplied substrings to their parent context upon encountering closing brackets. For lexicographically smallest unique sequences, I combine a monotonic increasing stack with a remaining frequency array: a larger character can only be popped from the stack if its remaining frequency is greater than zero, guaranteeing survival while achieving greedy minimization. For removing K digits, high-order digits dominate magnitude, so I maintain a monotonic increasing stack, dropping larger predecessors whenever a smaller digit arrives until K removals are exhausted."*

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

### 2.1 [LeetCode 394] Decode String

Given an encoded string, return its decoded string.

#### Production C# Implementation:

```csharp
public class SolutionDecodeString {
    /// <summary>
    /// Decodes nested repeat strings in O(output length) time and O(N) space
    /// using dual stacks for counts and prefix buffers.
    /// </summary>
    public string DecodeString(string s) {
        if (string.IsNullOrEmpty(s)) return string.Empty;

        var countStack = new Stack<int>();
        var stringStack = new Stack<StringBuilder>();

        var currStr = new StringBuilder();
        int currentK = 0;

        foreach (char c in s) {
            if (char.IsDigit(c)) {
                currentK = currentK * 10 + (c - '0');
            } else if (c == '[') {
                // Push current multiplier and string context onto stacks
                countStack.Push(currentK);
                stringStack.Push(currStr);

                // Reset for the new nested level
                currentK = 0;
                currStr = new StringBuilder();
            } else if (c == ']') {
                // Pop multiplier and previous context
                int repeatCount = countStack.Pop();
                StringBuilder prevStr = stringStack.Pop();

                // Append currStr repeated repeatCount times to prevStr
                for (int i = 0; i < repeatCount; i++) {
                    prevStr.Append(currStr);
                }

                currStr = prevStr;
            } else {
                currStr.Append(c);
            }
        }

        return currStr.ToString();
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(L)$ where $L$ is the length of the final decoded string. Every character is appended and processed in linear time.
- **Space Complexity:** $O(L)$ — Memory required to store intermediate string builders and stack frames proportional to nesting depth.

---

### 2.2 [LeetCode 316] Remove Duplicate Letters / LC 1081

Given a string `s`, remove duplicate letters so that every letter appears once and only once, ensuring the result is the smallest in lexicographical order.

#### Production C# Implementation:

```csharp
public class SolutionRemoveDuplicateLetters {
    /// <summary>
    /// Constructs lexicographically smallest unique character string in O(N) time
    /// using a monotonic stack with frequency lookaheads and visited bitmask/array.
    /// </summary>
    public string RemoveDuplicateLetters(string s) {
        if (string.IsNullOrEmpty(s)) return string.Empty;

        // Step 1: Count total occurrences of each character
        int[] remainingCount = new int[26];
        foreach (char c in s) {
            remainingCount[c - 'a']++;
        }

        var stack = new Stack<char>();
        bool[] inStack = new bool[26];

        // Step 2: Iterate through the string
        foreach (char c in s) {
            int idx = c - 'a';
            remainingCount[idx]--; // Decrement remaining count

            // If character is already in our candidate string, skip it
            if (inStack[idx]) {
                continue;
            }

            // Monotonic pop: while stack top is greater than c AND appears later in string
            while (stack.Count > 0 && stack.Peek() > c && remainingCount[stack.Peek() - 'a'] > 0) {
                char popped = stack.Pop();
                inStack[popped - 'a'] = false;
            }

            stack.Push(c);
            inStack[idx] = true;
        }

        // Reconstruct string from stack (stack enumerates top-to-bottom in C#)
        var sb = new StringBuilder();
        foreach (char c in stack.Reverse()) {
            sb.Append(c);
        }

        return sb.ToString();
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — First pass counts frequencies; second pass pushes and pops each character at most once.
- **Space Complexity:** $O(1)$ auxiliary space — Fixed-size arrays of size 26 for English lowercase letters.

---

### 2.3 [LeetCode 402] Remove K Digits

Given string `num` representing a non-negative integer and an integer `k`, return the smallest possible integer after removing `k` digits from `num`.

#### Production C# Implementation:

```csharp
public class SolutionRemoveKDigits {
    /// <summary>
    /// Minimizes integer magnitude by removing k digits in O(N) time and O(N) space.
    /// </summary>
    public string RemoveKdigits(string num, int k) {
        if (num.Length == k) return "0";

        var stack = new Stack<char>();

        foreach (char digit in num) {
            // While we still have removals left and the stack top is larger than current digit
            while (k > 0 && stack.Count > 0 && stack.Peek() > digit) {
                stack.Pop();
                k--;
            }
            stack.Push(digit);
        }

        // Edge Case 1: If removals remain (e.g. input was strictly increasing like "12345")
        while (k > 0 && stack.Count > 0) {
            stack.Pop();
            k--;
        }

        // Edge Case 2: Reconstruct string and strip leading zeros
        var sb = new StringBuilder();
        foreach (char c in stack.Reverse()) {
            // Skip leading zeros
            if (sb.Length == 0 && c == '0') {
                continue;
            }
            sb.Append(c);
        }

        return sb.Length == 0 ? "0" : sb.ToString();
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — Single pass over $N$ digits with at most $N$ stack pops.
- **Space Complexity:** $O(N)$ auxiliary stack space.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master string automata and greedy reduction on LeetCode:

### Problem 1 (Dual-Stack State Machine): LeetCode 394 — Decode String (Medium)
- **Goal:** Implement the `countStack` and `stringStack` unwinding state machine.
- **Target Complexity:** $O(L)$ time, $O(L)$ space.

### Problem 2 (Monotonic Lookahead): LeetCode 316 — Remove Duplicate Letters (Medium)
- **Goal:** Combine monotonic increasing stack with `remainingCount` and `inStack` flags.
- **Target Complexity:** $O(N)$ time, $O(1)$ auxiliary space.

### Problem 3 (High-Order Greedy Pruning): LeetCode 402 — Remove K Digits (Medium)
- **Goal:** Drop high-order peaks and handle leading zero stripping.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.

### Bonus / Identical Twin Challenge: LeetCode 1081 — Smallest Subsequence of Distinct Characters (Medium)
- **Goal:** Solve LeetCode 1081 in under 10 minutes (exact same problem as LC 316).

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Stack Automata & String Pruning Tree                 │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Nested repetition strings with multipliers?
                   │   └─► Dual Stacks: countStack + stringStack [LC 394]
                   │
                   ├─► Smallest lexicographical unique sequence?
                   │   └─► Monotonic Stack + remainingCount Lookahead [LC 316, LC 1081]
                   │       (Pop only if top > curr AND remainingCount[top] > 0)
                   │
                   ├─► Minimize numerical value by removing K digits?
                   │   └─► Monotonic Increasing Stack + Pop tail if k remains [LC 402]
                   │
                   └─► Physical collision simulation or sequence verification?
                       └─► Week 8 Integration Simulation (Day 56) [LC 735, LC 946]
```

### Preview for Day 56: Week 8 Integration, Pattern Contrast & Timed Simulation
Tomorrow in **Day 56**, we conclude Week 8 with a high-intensity **Timed Simulation**:
- **[LeetCode 735] Asteroid Collision (Medium):** Simulating physical mass collisions using a bidirectional LIFO stack.
- **[LeetCode 946] Validate Stack Sequences (Medium):** Validating push/pop permutation sequences.
- **Comprehensive Review:** When to choose Monotonic Stacks vs. Two Pointers vs. Sliding Window.

---

## 5. 🎯 Day 55 Checkpoint Questions

Verify your mastery of stack automata and greedy string elimination:

1. **The Three Pop Conditions in LC 316:** Explain why popping a character from the stack in LeetCode 316 requires BOTH `stack.Peek() > curr` AND `remainingCount[stack.Peek()] > 0`. What happens if the second condition is omitted on `"bcabc"`?
2. **The `inStack` Guard:** In LeetCode 316, why do we immediately skip `curr` if `inStack[curr - 'a'] == true`? Why is replacing an existing character with a later duplicate always sub-optimal?
3. **Ascending Sequence Removals in LC 402:** If `num = "12345"` and `k = 2`, what is the state of the stack after the main loop finishes? Explain why the secondary loop `while (k > 0) stack.Pop()` is required.
4. **Leading Zero Corner Case:** In LeetCode 402, trace what happens to `num = "10200"` with `k = 1`. Show how the output becomes `"200"` rather than `"0200"`.
