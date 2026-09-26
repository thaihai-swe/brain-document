---
title: "Week 3 — Day 18: String Transformation, Compression & In-Place Parsing"
---

Welcome to Day 18! Today we bring our traversal toolkit full-circle by combining **in-place pointer mechanics** (from Week 1) with **string manipulation and compression**.

In managed languages, strings are immutable, but interviewers frequently present string problems formatted around `char[]` buffers or ask you to simulate **$O(1)$ auxiliary space transformations**. Mastering the **Reader & Writer idiom** and the **Reverse-All-Then-Reverse-Each-Word idiom** is essential for high-performance string engineering.

---

## 1. 🧠 TEACH: The Mechanics of In-Place String Mutation

### 1.1 The Reader & Writer Compression Invariant (LeetCode 443)

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
