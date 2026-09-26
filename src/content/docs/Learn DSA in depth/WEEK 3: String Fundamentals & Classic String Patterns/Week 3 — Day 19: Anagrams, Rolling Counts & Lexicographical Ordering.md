---
title: "Week 3 — Day 19: Anagrams, Rolling Counts & Lexicographical Ordering"
---

Welcome to Day 19! Today we examine the intersection of **frequency balance arrays, recursive string generation, and custom lexicographical sorting**.

In technical interviews, these problems verify whether you can reason about string edge cases (leading zeroes, empty strings, character overflow) and prove ordering invariants on string concatenations.

---

## 1. 🧠 TEACH: Frequency Verification & Concatenation Invariants

### 1.1 The Single-Pass Balance Array (`int[26]`)

Two strings $S$ and $T$ are anagrams if and only if:
1. $|S| == |T|$
2. Every character appears with the exact same frequency in both strings.

#### The Single Delta Array Pattern:
Instead of allocating two separate frequency arrays and calling `.SequenceEqual()`, maintain a **single balance array**:
- Increment for $S$: `freq[s[i] - 'a']++`
- Decrement for $T$: `freq[t[i] - 'a']--`
- If $S$ and $T$ are anagrams, every single cell in `freq` must be strictly `0`.

```
s = "anagram", t = "nagaram"
i = 0: s[0]='a' (+1 to 'a'), t[0]='n' (-1 to 'n')
i = 1: s[1]='n' (+1 to 'n'), t[1]='a' (-1 to 'a') -> 'n' balances to 0, 'a' balances to 0!
...
Final array: [ 0, 0, 0, 0, ... 0 ] -> Perfect balance!
```

---

### 1.2 The Concatenation Ordering Invariant (LeetCode 179)

Given a list of numbers like `[3, 30, 34, 5, 9]`, we want to order them to form the **largest possible concatenated number**.

#### Why Standard Sorting Fails:
- Comparing `"3"` vs `"30"`: In standard alphabetical order, `"30"` is longer or equal to `"3"`, but concatenated:
  - `"3" + "30" = "330"`
  - `"30" + "3" = "303"`
  - Clearly `"330" > "303"`, so `"3"` must precede `"30"`.
- Comparing `"34"` vs `"3"`:
  - `"34" + "3" = "343"`
  - `"3" + "34" = "334"`
  - `"343" > "334"`, so `"34"` must precede `"3"`.

#### The Custom Comparator:
For any two string numbers $A$ and $B$, define the comparator:
$$\mathbf{\text{Compare}(A, B) = (B + A).\text{CompareTo}(A + B)}$$

#### Why This Works (Proof of Transitivity):
For any sorting algorithm to work, the comparator must satisfy **Strict Weak Ordering**:
1. **Asymmetry:** If $A \succ B$, then $B \not\succ A$.
2. **Transitivity:** If $A \succ B$ and $B \succ C$, then $A \succ C$.

Because concatenation comparisons satisfy transitivity, sorting all strings with this comparator in $O(N \log N)$ **guarantees the globally optimal largest concatenated number**.

#### The Leading Zero Edge Case:
If the input is `[0, 0]`, sorting produces `["0", "0"]`. Concatenating yields `"00"`.
**Guardrail:** If the largest element after sorting is `"0"`, the answer is simply `"0"`.

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 242 — Valid Anagram (Easy)

> Given two strings `s` and `t`, return `true` if `t` is an **anagram** of `s`, and `false` otherwise.

#### Visual Trace:
`s = "rat"`, `t = "car"`
1. `s.Length == t.Length` (3 == 3).
2. Delta pass:
   - `'r'`: `freq['r']++` (+1), `freq['c']--` (-1)
   - `'a'`: `freq['a']++` (+1), `freq['a']--` (-1) $\to$ net 0
   - `'t'`: `freq['t']++` (+1), `freq['r']--` (-1) $\to$ net 0 for `'r'`
3. Inspection: `freq['c'] = -1, freq['t'] = 1` $\to$ Not all zeroes $\to$ return `false`.

#### Production C# Implementation:
```csharp
public class SolutionIsAnagram {
    public bool IsAnagram(string s, string t) {
        if (s.Length != t.Length) return false;

        int[] balance = new int[26];

        for (int i = 0; i < s.Length; i++) {
            balance[s[i] - 'a']++;
            balance[t[i] - 'a']--;
        }

        for (int i = 0; i < 26; i++) {
            if (balance[i] != 0) {
                return false;
            }
        }

        return true;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — single simultaneous pass + fixed 26-element loop.
- **Space Complexity:** $O(1)$ — 104-byte integer table.

---

### Problem 2: LeetCode 38 — Count and Say (Medium)

> The **count-and-say** sequence is a sequence of digit strings defined by the recursive formula:
> - `countAndSay(1) = "1"`
> - `countAndSay(n)` is the run-length encoding of `countAndSay(n - 1)`.
>
> Given a positive integer `n`, return the $n$-th term of the count-and-say sequence.

#### Visual Trace:
- $n = 1$: `"1"`
- $n = 2$: Run of one `'1'` $\to$ `"11"`
- $n = 3$: Run of two `'1'`s $\to$ `"21"`
- $n = 4$: Run of one `'2'`, one `'1'` $\to$ `"1211"`
- $n = 5$: Run of one `'1'`, one `'2'`, two `'1'`s $\to$ `"111221"`

#### Production C# Implementation:
```csharp
public class SolutionCountAndSay {
    public string CountAndSay(int n) {
        if (n <= 0) return string.Empty;

        string current = "1";

        for (int step = 2; step <= n; step++) {
            var next = new System.Text.StringBuilder();
            int read = 0;

            while (read < current.Length) {
                char digit = current[read];
                int runner = read;

                // Find length of identical digit run
                while (runner < current.Length && current[runner] == digit) {
                    runner++;
                }

                int count = runner - read;
                next.Append(count).Append(digit);

                read = runner;
            }

            current = next.ToString();
        }

        return current;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(M)$ where $M$ is the cumulative length of strings generated up to step $n$.
- **Space Complexity:** $O(L)$ where $L$ is the length of the $n$-th string.

---

### Problem 3: LeetCode 179 — Largest Number (Medium)

> Given a list of non-negative integers `nums`, arrange them such that they form the **largest number** and return it.
> Since the result may be very large, so you need to return a string instead of an integer.

#### Visual Trace:
`nums = [3, 30, 34, 5, 9]`

Convert to strings: `["3", "30", "34", "5", "9"]`
Sort using `(b + a).CompareTo(a + b)`:
1. `"9"` vs any: `"9" + X > X + "9"` $\to$ `"9"` is first.
2. `"5"` vs any remaining $\to$ `"5"` is second.
3. `"34"` vs `"3"`: `"343" > "334"` $\to$ `"34"` precedes `"3"`.
4. `"3"` vs `"30"`: `"330" > "303"` $\to$ `"3"` precedes `"30"`.

Sorted order: `["9", "5", "34", "3", "30"]`
Concatenation: `"9534330"`. Correct!

#### Production C# Implementation:
```csharp
public class SolutionLargestNumber {
    public string LargestNumber(int[] nums) {
        if (nums == null || nums.Length == 0) return string.Empty;

        // Convert ints to strings
        string[] strNums = new string[nums.Length];
        for (int i = 0; i < nums.Length; i++) {
            strNums[i] = nums[i].ToString();
        }

        // Custom sort: compare (b + a) to (a + b) for descending order
        Array.Sort(strNums, (a, b) => {
            string order1 = a + b;
            string order2 = b + a;
            return order2.CompareTo(order1);
        });

        // Edge case: if the largest number is "0", the entire number is 0
        if (strNums[0] == "0") {
            return "0";
        }

        var sb = new System.Text.StringBuilder();
        for (int i = 0; i < strNums.Length; i++) {
            sb.Append(strNums[i]);
        }

        return sb.ToString();
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N \log N \cdot L)$ where $N$ is count of numbers and $L$ is average string length (string concatenations take $O(L)$ inside comparator).
- **Space Complexity:** $O(N \cdot L)$ to store string representations.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Solve these in sequence to master custom ordering and edge cases:

### Problem 1 (Balance Verification): LeetCode 242 — Valid Anagram (Easy)
- **Goal:** Verify if two strings are permutations of each other.
- **Key Insight:** Single `int[26]` balance array with delta increments/decrements.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 2 (Iterative RLE Generation): LeetCode 38 — Count and Say (Medium)
- **Goal:** Generate RLE sequence up to $N$.
- **Key Insight:** Runner pointer on previous term; build next term with `StringBuilder`.
- **Target Complexity:** $O(\text{Total Length})$ time, $O(L)$ space.

### Problem 3 (Transitive Concatenation Sort): LeetCode 179 — Largest Number (Medium)
- **Goal:** Form largest number via custom sorting.
- **Key Insight:** Comparator `(b + a).CompareTo(a + b)` with leading `"0"` guardrail.
- **Target Complexity:** $O(N \log N \cdot L)$ time, $O(N \cdot L)$ space.

### Bonus / Extension Challenge: LeetCode 205 — Isomorphic Strings (Easy)
- **Goal:** Check if characters in `s` can be replaced to get `t`.
- **Hint:** Maintain bidirectional mapping arrays `mapST[128]` and `mapTS[128]`.

---

## 4. 🔗 CONNECT: Order Invariants Re-Visited

```
Day 5 (Arrays):
  nums[i] compared to nums[j] -> Scalar order (e.g. standard integer comparison)

Day 19 (Strings):
  (A + B) compared to (B + A) -> Transitive concatenation order
  Extends Week 1 sorting invariants to multi-character composite permutations!
```

---

## 5. 🎯 Day 19 Checkpoint Questions

1. **Balance Proof:** In LeetCode 242, why is checking `s.Length != t.Length` at the very beginning essential before running the single delta balance loop?
2. **Comparator Asymmetry:** In LeetCode 179, why does comparing `(b + a).CompareTo(a + b)` produce descending order rather than ascending order?
3. **Leading Zero Bug:** If `nums = [0, 0, 0]`, what would `LargestNumber` return if you omitted the `if (strNums[0] == "0") return "0";` check?
