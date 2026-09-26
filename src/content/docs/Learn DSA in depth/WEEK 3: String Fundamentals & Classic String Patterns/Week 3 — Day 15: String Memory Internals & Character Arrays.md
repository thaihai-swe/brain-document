---
title: "Week 3 — Day 15: String Memory Internals & Character Arrays"
---

Welcome to **Week 3**! In Weeks 1 and 2, you mastered array memory layout, in-place pointer coordination, and continuous range queries (Prefix Sums and Sliding Windows).

This week, we apply those foundational traversal skills to **Strings**. In technical interviews, string problems test not only your algorithmic reasoning, but also your understanding of **low-level language runtime internals**: heap allocations, immutability, cache locality, and character encoding.

---

## 1. 🧠 TEACH: The Physical Reality of Strings

### 1.1 Strings on the Managed Heap (CLR / JVM / Python)

In managed languages (C#, Java, Python), strings are **reference types** allocated on the managed heap:

```
Stack:                          Heap:
┌──────────────┐                ┌────────────────────────────────────────────────────────┐
│  string s    │ ─────────────► │ Object Header: 8 bytes (SyncBlockIndex + MethodTable)  │
└──────────────┘                ├────────────────────────────────────────────────────────┤
                                │ Length:        4 bytes                                 │
                                ├────────────────────────────────────────────────────────┤
                                │ Characters:    2 bytes per char (UTF-16)               │
                                │                [ 'H', 'e', 'l', 'l', 'o', '\0' ]       │
                                └────────────────────────────────────────────────────────┘
```

#### String Immutability:
Strings are **strictly immutable**. Once created in memory, the character buffer cannot be altered without unsafe memory manipulation. Any operation that appears to "modify" a string (`Substring`, `Replace`, `ToLower`, `+=`) actually **allocates a brand-new string object on the heap** and copies the characters.

---

### 1.2 The $O(N^2)$ Concatenation Trap (GC Thrashing)

A common performance pitfall in junior and intermediate code:

```csharp
// ⚠️ ANTI-PATTERN: Silent O(N²) Performance Disaster
string result = "";
for (int i = 0; i < n; i++) {
    result += s[i];
}
```

#### What happens under the hood?
- Loop iteration 1: Allocates new string of length 1, copies 1 char.
- Loop iteration 2: Allocates new string of length 2, copies 2 chars.
- Loop iteration 3: Allocates new string of length 3, copies 3 chars.
- ...
- Loop iteration $N$: Allocates new string of length $N$, copies $N$ chars.

$$\text{Total Chars Copied} = 1 + 2 + 3 + \dots + N = \frac{N(N + 1)}{2} \approx \mathbf{\frac{N^2}{2} \implies O(N^2) \text{ Time!}}$$

- If $N = 100,000$, this loop does $\approx 5 \times 10^9$ character copies and allocates gigabytes of short-lived garbage on the heap, triggering continuous **Garbage Collection (GC Gen 0/1) pauses**.

#### The Fix: `StringBuilder` (Amortized $O(1)$ Append)
`StringBuilder` manages an internal mutable `char[]` buffer. When the buffer fills up, it doubles its capacity:
- Copying only occurs on capacity doubling: $1 + 2 + 4 + 8 + \dots + N \le 2N$ total copies.
- Total time: **strictly $O(N)$**.

---

### 1.3 Character Encodings: ASCII vs. Unicode

- In C#, `char` is a 16-bit integer representing a **UTF-16 code unit** (`0x0000` to `0xFFFF`).
- The standard **ASCII range** spans `0` to `127`:
  - `'0'` to `'9'`: ASCII $48$ to $57$
  - `'A'` to `'Z'`: ASCII $65$ to $90$
  - `'a'` to `'z'`: ASCII $97$ to $122$

#### The Canonical Indexing Idiom:
To map any lowercase letter `'a'..'z'` to an integer index `0..25`:
$$\mathbf{\text{index} = c - \text{'a'}}$$

- `'a' - 'a' = 97 - 97 = 0`
- `'b' - 'a' = 98 - 97 = 1`
- `'z' - 'a' = 122 - 97 = 25`

#### Case Conversion Bit Trick:
In ASCII, uppercase and lowercase characters differ by exactly **bit 5** (value 32 / `0x20`):
- To toggle case: `c ^ 32` (`'A' ^ 32 = 'a'`, `'a' ^ 32 = 'A'`)
- To lower: `c | 32`
- To upper: `c & ~32`

---

### 1.4 Fixed Frequency Array (`int[26]`) vs. `Dictionary<char, int>`

Whenever a problem states: *"The string consists only of lowercase English letters"*, **never use a `Dictionary`**.

| Attribute | `int[26]` Frequency Array | `Dictionary<char, int>` |
| :--- | :--- | :--- |
| **Memory Footprint** | 104 bytes (fits entirely in L1 cache) | ~1 KB+ (buckets, entries, hash structures) |
| **Lookup Time** | **1 CPU cycle** (direct array offset) | 20–50 CPU cycles (hash, collision checks) |
| **Heap Allocations** | Single small array (or `stackalloc`) | Multiple object/bucket allocations |
| **Cache Locality** | Sequential contiguous memory | Pointer chasing across heap memory |

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 387 — First Unique Character in a String (Easy)

> Given a string `s`, find the first non-repeating character in it and return its index. If it does not exist, return `-1`.

#### Two-Pass Algorithm:
1. **Pass 1:** Count the occurrence of each character using an `int[26]` frequency array.
2. **Pass 2:** Traverse string `s` from left to right. The first character with `count == 1` is our answer!

#### Visual Trace:
`s = "loveleetcode"`

**Pass 1: Frequency counts**
`'l': 2, 'o': 2, 'v': 1, 'e': 4, 't': 1, 'c': 1, 'd': 1`

**Pass 2: Check indices from 0 to N-1**
- `i = 0, s[0] = 'l'`: count is 2 $\to$ skip
- `i = 1, s[1] = 'o'`: count is 2 $\to$ skip
- `i = 2, s[2] = 'v'`: count is **1** $\to$ **Return index 2!**

#### Production C# Implementation:
```csharp
public class SolutionFirstUniqChar {
    public int FirstUniqChar(string s) {
        int[] freq = new int[26];

        // Pass 1: Build frequency table
        for (int i = 0; i < s.Length; i++) {
            freq[s[i] - 'a']++;
        }

        // Pass 2: Find first character with count == 1
        for (int i = 0; i < s.Length; i++) {
            if (freq[s[i] - 'a'] == 1) {
                return i;
            }
        }

        return -1;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N)$ — two linear passes ($2N$ operations).
- **Space Complexity:** $O(1)$ — fixed 26-element integer table (104 bytes).

---

### Problem 2: LeetCode 383 — Ransom Note (Easy)

> Given two strings `ransomNote` and `magazine`, return `true` if `ransomNote` can be constructed by using the letters from `magazine` and `false` otherwise.
> Each letter in `magazine` can only be used once in `ransomNote`.

#### Early Rejection & Single Bucket Array:
1. **Early Exit:** If `ransomNote.Length > magazine.Length`, return `false` immediately.
2. Build character inventory from `magazine` in `int[26]`.
3. Iterate through `ransomNote`, decrementing the inventory. If any count drops below 0, return `false`.

#### Production C# Implementation:
```csharp
public class SolutionCanConstruct {
    public bool CanConstruct(string ransomNote, string magazine) {
        if (ransomNote.Length > magazine.Length) return false;

        int[] charInventory = new int[26];

        // Stock inventory from magazine
        for (int i = 0; i < magazine.Length; i++) {
            charInventory[magazine[i] - 'a']++;
        }

        // Consume inventory for ransom note
        for (int i = 0; i < ransomNote.Length; i++) {
            int charIdx = ransomNote[i] - 'a';
            charInventory[charIdx]--;
            if (charInventory[charIdx] < 0) {
                return false; // Insufficient character count
            }
        }

        return true;
    }
}
```

#### Complexity:
- **Time Complexity:** $O(M + N)$ where $M = \text{magazine.Length}, N = \text{ransomNote.Length}$.
- **Space Complexity:** $O(1)$ auxiliary space.

---

### Problem 3: LeetCode 49 — Group Anagrams (Medium)

> Given an array of strings `strs`, group the **anagrams** together. You can return the answer in **any order**.

#### The Core Question: How to Design the Equivalence Key?
Two strings are anagrams if and only if they have the exact same character counts. To group them in a `Dictionary<string, List<string>>`, we need a canonical hashable key.

##### Key Strategy A: Sorted Character Array ($O(N \cdot L \log L)$)
Sort the characters of each string:
`"eat" -> "aet"`, `"tea" -> "aet"`, `"ate" -> "aet"`
All three share key `"aet"`.

##### Key Strategy B: Frequency Signature ($O(N \cdot L)$)
Count character frequencies in `int[26]`, then serialize into a delimited string:
`"1#0#0#0#1...#1"`
Theoretical time is $O(L)$, but string building overhead often makes Strategy A faster in practice for words with $L \le 20$.

#### Production C# Implementation (Strategy A - High Performance):
```csharp
public class SolutionGroupAnagrams {
    public IList<IList<string>> GroupAnagrams(string[] strs) {
        if (strs == null || strs.Length == 0) {
            return new List<IList<string>>();
        }

        var map = new Dictionary<string, List<string>>();

        for (int i = 0; i < strs.Length; i++) {
            string s = strs[i];
            
            // Convert to char array and sort to generate canonical key
            char[] chars = s.ToCharArray();
            Array.Sort(chars);
            string key = new string(chars);

            if (!map.TryGetValue(key, out var list)) {
                list = new List<string>();
                map[key] = list;
            }
            list.Add(s);
        }

        return new List<IList<string>>(map.Values);
    }
}
```

#### Complexity:
- **Time Complexity:** $O(N \cdot L \log L)$ where $N$ is the number of strings and $L$ is the maximum string length.
- **Space Complexity:** $O(N \cdot L)$ to store grouped results.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Solve these in sequence to solidify string memory fundamentals:

### Problem 1 (Two-Pass Frequency): LeetCode 387 — First Unique Character in a String (Easy)
- **Goal:** Find first non-repeating character in $O(N)$ time.
- **Key Insight:** `int[26]` frequency array + second linear scan.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 2 (Inventory Tracking): LeetCode 383 — Ransom Note (Easy)
- **Goal:** Verify if magazine contains sufficient characters.
- **Key Insight:** Early length check + decrement inventory.
- **Target Complexity:** $O(M + N)$ time, $O(1)$ space.

### Problem 3 (Key Canonicalization): LeetCode 49 — Group Anagrams (Medium)
- **Goal:** Group words having identical character distributions.
- **Key Insight:** Sorted string key or frequency tuple key with `Dictionary<string, List<string>>`.
- **Target Complexity:** $O(N \cdot L \log L)$ time, $O(N \cdot L)$ space.

### Bonus / Extension Challenge: LeetCode 242 — Valid Anagram (Easy)
- **Goal:** Check if string `t` is an anagram of `s`.
- **Hint:** Solve using a single `int[26]` array without sorting.

---

## 4. 🔗 CONNECT: Arrays to Strings

```
Memory Architecture Bridge:
  ┌────────────────────────────────────────────────────────────┐
  │ Array of T:  Contiguous memory block, directly mutable     │
  └────────────────────────────────────────────────────────────┘
                               ▲
                 .ToCharArray()│  new string(chars)
                               ▼
  ┌────────────────────────────────────────────────────────────┐
  │ Managed String: Contiguous UTF-16 chars, STRICTLY IMMUTABLE│
  └────────────────────────────────────────────────────────────┘
```

When you need in-place pointer manipulation on strings (reversals, partitions, compressions), always convert to `char[]` first, execute in-place two-pointer operations in $O(1)$ extra memory, and reconstruct the string once at the end!

---

## 5. 🎯 Day 15 Checkpoint Questions

Verify your string memory mental model:

1. **Concatenation Trap:** If a loop runs $N = 100,000$ times concatenating one character `s += 'a'`, explain precisely why the runtime is $O(N^2)$ and what happens to the managed heap.
2. **Character Offset:** Why is `c - 'a'` guaranteed to produce an index from $0$ to $25$ for any lowercase English letter? What happens if `c` is uppercase?
3. **Key Generation Trade-off:** In LeetCode 49 (Group Anagrams), when would Strategy B (Frequency Tuple $O(L)$) be strictly superior to Strategy A (Sorting $O(L \log L)$)?

When you are ready, share your answers or request to move to **Day 16: Two-Pointer String Patterns & Palindromes**!
