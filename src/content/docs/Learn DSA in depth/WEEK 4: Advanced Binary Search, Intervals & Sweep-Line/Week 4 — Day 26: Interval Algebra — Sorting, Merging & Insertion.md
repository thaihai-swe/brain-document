---
title: "Week 4 — Day 26: Interval Algebra — Sorting, Merging & Insertion"
---

In **Day 25**, we explored multi-pointer coordination on discrete array elements ($K$-Sum and Trapping Rain Water).

Today, we advance from discrete indices to **continuous ranges**: **Interval Algebra**.

Interval problems ($[start, end]$) are fundamental to computer science: calendar meeting scheduling, memory segment allocation, TCP packet reassembly, and database transaction lock management. In technical interviews, interval questions test whether you can recognize geometric overlap invariants and use **greedy sorting** to turn arbitrary 2D geometric clutter into a clean, deterministic 1D linear scan.

---

## 1. 🧠 TEACH: The Mathematical Foundations of Interval Overlaps

### 1.1 The Mathematical Overlap Theorem

Given two closed intervals $I_1 = [A, B]$ and $I_2 = [C, D]$ where $A \le B$ and $C \le D$:

$$\mathbf{\text{Overlap}(I_1, I_2) \iff \max(A, C) \le \min(B, D)}$$

#### Proof & The 6 Spatial Relationships:
Two intervals in 1D space can only exist in one of six relative configurations:

```
1. Disjoint Left:      [ A --- B ]
                                     [ C --- D ]       (B < C -> No overlap)

2. Touching Boundary:  [ A --- B ]
                               [ C --- D ]             (B == C -> Overlaps at single point)

3. Partial Overlap:    [ A ------- B ]
                               [ C ------- D ]         (C <= B -> Overlap is [C, B])

4. Complete Contain:   [ A --------------- B ]
                               [ C --- D ]             (C >= A and D <= B -> Overlap is [C, D])

5. Complete Enclosure:         [ A --- B ]
                       [ C --------------- D ]         (Overlap is [A, B])

6. Disjoint Right:                   [ A --- B ]
                       [ C --- D ]                     (D < A -> No overlap)
```

Notice that the intersection range of any two overlapping intervals is always:
$$\text{Intersection} = [\max(A, C), \ \min(B, D)]$$
If $\max(A, C) > \min(B, D)$, the intersection is the empty set $\emptyset$ (no overlap).

---

### 1.2 The Dimensionality Reduction of Sorting by Start Time

If an array of intervals is unsorted, determining which intervals overlap requires comparing every pair:
$$\binom{N}{2} = \frac{N(N-1)}{2} \implies O(N^2) \text{ comparisons}$$

#### What happens when we sort by `start` time?
Suppose we sort all intervals such that $A \le C$:

$$\text{Since } A \le C \implies \max(A, C) = C$$

The general overlap condition $\max(A, C) \le \min(B, D)$ collapses into a **single, trivial check**:

$$\mathbf{\text{Overlap} \iff C \le B}$$

> **The Linear Chain Invariant:**  
> Once sorted by start time, interval $I_2$ overlaps with interval $I_1$ **if and only if $I_2$ starts before (or when) $I_1$ ends**!  
> Furthermore, if $I_2$ does not overlap with $I_1$, **no subsequent interval can ever overlap with $I_1$** (since future starts are $\ge C > B$). We can permanently commit $I_1$!

---

### 1.3 The Merger Invariant: Why $\max(end_1, end_2)$ is Mandatory

When two sorted intervals overlap ($C \le B$), what is their union?
$$\text{Union} = [\min(A, C), \ \max(B, D)] = [A, \ \max(B, D)]$$

A common interview trap is assuming the merged end is simply the second interval's end $D$:
```csharp
// ⚠️ WRONG: Fails on complete containment!
current[1] = next[1];
```

Consider:
- Interval 1: $[1, 10]$
- Interval 2: $[2, 5]$
- Interval 2 is completely contained inside Interval 1 ($D < B$).
- The union is $[1, 10]$, **NOT** $[1, 5]$!
- **Rule:** Always take the maximum of the ends: $\mathbf{current[1] = \max(current[1], next[1])}$.

---

### 1.4 Sorting by Start vs. Sorting by End (The Greedy Divergence)

One of the most profound interview design decisions is knowing **which coordinate to sort by**:

| Objective | Sort Key | Intuition / Why It Works |
| :--- | :--- | :--- |
| **Merging Overlapping Intervals** ([LC 56]) | **Sort by `start`** | Ensures candidate overlapping intervals arrive consecutively in time. |
| **Inserting into Non-Overlapping Set** ([LC 57]) | **Already sorted by `start`** | Enables a single-pass 3-phase partition: Before $\to$ Merge $\to$ After. |
| **Maximum Non-Overlapping Intervals** ([LC 435]) | **Sort by `end`** | **Greedy choice:** The interval that finishes earliest leaves the maximal remaining time for future intervals. |
| **Minimum Arrows to Burst Balloons** ([LC 452]) | **Sort by `end`** | An arrow shot at the earliest end point bursts all balloons overlapping that point. |

---

### 1.5 Interview Spoken Drill (20–30 Seconds)

> *"To merge intervals, I sort them by start time in $O(N \log N)$ so overlapping intervals are guaranteed to be adjacent. I iterate through the sorted list, maintaining a current interval. If the next interval starts before or at the current interval's end, they overlap, so I extend the current end to the maximum of both ends. If it starts strictly after, they are disjoint, so I commit the current interval and start a new one. This processes the entire array in a single linear pass."*

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 56 — Merge Intervals (Medium)

> Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

#### Visual Step-by-Step Trace:
`intervals = [[1, 3], [8, 10], [2, 6], [15, 18]]`

**Step 1: Sort by start time:**  
`[[1, 3], [2, 6], [8, 10], [15, 18]]`

```
Time:     0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18
[1, 3]:      [====]
[2, 6]:         [=======]
Merge:       [==========]  -> [1, 6]

[8, 10]:                          [====]
Does 8 <= 6? No! Disjoint.
Commit [1, 6] to result. Active interval becomes [8, 10].

[15, 18]:                                                [=======]
Does 15 <= 10? No! Disjoint.
Commit [8, 10] to result. Active interval becomes [15, 18].

End of loop: Commit final interval [15, 18].
Result: [[1, 6], [8, 10], [15, 18]]
```

#### Production C# Implementation:
```csharp
public class SolutionMergeIntervals {
    public int[][] Merge(int[][] intervals) {
        if (intervals == null || intervals.Length <= 1) return intervals;

        // Step 1: Sort by interval start time
        Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));

        var merged = new List<int[]>();
        int[] current = intervals[0];
        merged.Add(current);

        // Step 2: Linear sweep to merge or append
        for (int i = 1; i < intervals.Length; i++) {
            int[] next = intervals[i];

            if (next[0] <= current[1]) {
                // Overlap: Extend the current interval's end
                current[1] = Math.Max(current[1], next[1]);
            } else {
                // Disjoint: Commit next interval as the new active interval
                current = next;
                merged.Add(current);
            }
        }

        return merged.ToArray();
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N \log N)$ — sorting dominates; the subsequent merge pass is $O(N)$.
- **Space Complexity:** $O(N)$ — to store the merged result (or $O(\log N)$ sorting stack space).

---

### Problem 2: LeetCode 57 — Insert Interval (Medium)

> You are given an array of non-overlapping intervals `intervals` where `intervals[i] = [start_i, end_i]` sorted in ascending order by `start_i`. You are also given an interval `newInterval = [start, end]`.
> Insert `newInterval` into `intervals` such that `intervals` is still sorted in ascending order and has no overlapping intervals (merge if necessary).

#### The 3-Phase Linear Partition Invariant:
Since the input is **already sorted** and non-overlapping, we do NOT need to sort ($O(N \log N)$). We can solve this in **strictly $O(N)$ linear time** using 3 clean sequential phases:

```
               ┌──────────────────────┐
               │     newInterval      │
               └──────────────────────┘
[Phase 1: Disjoint Left]  [Phase 2: Overlapping Merges]  [Phase 3: Disjoint Right]
     intervals[i].end <        intervals[i].start <=          intervals[i].start >
      newInterval.start          newInterval.end               newInterval.end
```

1. **Phase 1 (Before):** Add all intervals that finish completely before `newInterval` starts (`interval[1] < newInterval[0]`).
2. **Phase 2 (Merge):** While intervals overlap with `newInterval` (`interval[0] <= newInterval[1]`), merge them into `newInterval`:
   - `newInterval[0] = Math.Min(newInterval[0], interval[0])`
   - `newInterval[1] = Math.Max(newInterval[1], interval[1])`
   Once this loop finishes, add the consolidated `newInterval`.
3. **Phase 3 (After):** Add all remaining intervals that start strictly after `newInterval` finishes.

#### Production C# Implementation:
```csharp
public class SolutionInsertInterval {
    public int[][] Insert(int[][] intervals, int[] newInterval) {
        var result = new List<int[]>();
        int i = 0;
        int n = intervals.Length;

        // Phase 1: Add all intervals that end strictly before newInterval starts
        while (i < n && intervals[i][1] < newInterval[0]) {
            result.Add(intervals[i]);
            i++;
        }

        // Phase 2: Merge all overlapping intervals into newInterval
        while (i < n && intervals[i][0] <= newInterval[1]) {
            newInterval[0] = Math.Min(newInterval[0], intervals[i][0]);
            newInterval[1] = Math.Max(newInterval[1], intervals[i][1]);
            i++;
        }
        result.Add(newInterval); // Commit merged interval

        // Phase 3: Add all remaining intervals that start strictly after newInterval ends
        while (i < n) {
            result.Add(intervals[i]);
            i++;
        }

        return result.ToArray();
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — single sequential pass over the array.
- **Space Complexity:** $O(N)$ — for output list; $O(1)$ auxiliary space.

---

### Problem 3: LeetCode 435 — Non-overlapping Intervals (Medium)

> Given an array of intervals `intervals` where `intervals[i] = [start_i, end_i]`, return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.

#### The Equivalence Transformation:
> *"Minimizing removals to leave non-overlapping intervals"*  
> $\equiv$  
> **Total Intervals ($N$) $-$ Maximum Non-Overlapping Intervals (Interval Scheduling)**

#### The Greedy Proof: Why Sort by End Time?
Suppose we have a set of competing intervals. Which one should we keep first?
- If interval $A$ ends at time 3 and interval $B$ ends at time 8:
- Keeping interval $A$ frees up the timeline after time 3.
- Keeping interval $B$ blocks the timeline until time 8.
- **Greedy Stays Ahead:** Choosing the interval that **finishes earliest** leaves the maximum possible remaining time to accommodate future intervals without conflicts.

#### Production C# Implementation:
```csharp
public class SolutionEraseOverlapIntervals {
    public int EraseOverlapIntervals(int[][] intervals) {
        if (intervals.Length <= 1) return 0;

        // Step 1: Sort by end time ascending
        Array.Sort(intervals, (a, b) => a[1].CompareTo(b[1]));

        int nonOverlappingCount = 1;
        int currentEnd = intervals[0][1];

        // Step 2: Greedy selection
        for (int i = 1; i < intervals.Length; i++) {
            // If next interval starts after or at currentEnd, it is compatible
            if (intervals[i][0] >= currentEnd) {
                nonOverlappingCount++;
                currentEnd = intervals[i][1]; // Update finish boundary
            }
            // Else: Overlap detected! Discard intervals[i] greedily (currentEnd stays smaller)
        }

        // Removals = Total - Kept
        return intervals.Length - nonOverlappingCount;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N \log N)$ — sorting by end time.
- **Space Complexity:** $O(1)$ auxiliary memory (ignoring sorting recursion stack).

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master the interval algebra pattern on LeetCode:

### Problem 1 (Foundational Merge): LeetCode 56 — Merge Intervals (Medium)
- **Goal:** Sort by start time and extend boundary using $\max(end_1, end_2)$.
- **Target Complexity:** $O(N \log N)$ time, $O(1)$ auxiliary space.

### Problem 2 (Linear Sweep): LeetCode 57 — Insert Interval (Medium)
- **Goal:** Implement the 3-phase partition (before, merge, after) in $O(N)$ time.
- **Target Complexity:** $O(N)$ time, $O(1)$ auxiliary space.

### Problem 3 (Greedy Scheduling): LeetCode 435 — Non-overlapping Intervals (Medium)
- **Goal:** Sort by end time and apply the Greedy Stays Ahead principle.
- **Target Complexity:** $O(N \log N)$ time, $O(1)$ auxiliary space.

### Bonus / Extension Challenge: LeetCode 452 — Minimum Number of Arrows to Burst Balloons (Medium)
- **Goal:** Find minimum number of points required to pierce all intervals.
- **Hint:** Mathematically identical to interval scheduling; shoot arrow at the earliest end time. Watch out for integer overflow during comparison: use `a[1].CompareTo(b[1])` instead of `a[1] - b[1]`.

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Interval Problem Strategy                       │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Consolidate overlapping ranges ───────────► Sort by START, merge contiguous
                   │                                               [LC 56]
                   │
                   ├─► Insert new range into non-overlapping set ─► 3-Phase Sweep (Before, Merge, After)
                   │                                               [LC 57]
                   │
                   ├─► Maximize compatible intervals / Min remove ► Sort by END, Greedy Earliest Finish
                   │                                               [LC 435, LC 452]
                   │
                   └─► Count concurrent overlapping resources ────► Sweep-Line / Events Timeline (Day 27)
                                                                   [LC 252, LC 253, LC 732]
```

### Preview for Day 27: Sweep-Line & Event-Driven Processing
Today we handled intervals as single atomic entities $[start, end]$.  
Tomorrow in **Day 27**, we split intervals into discrete **Arrival (+1)** and **Departure (-1)** events along a timeline. This is **Sweep-Line**, the foundational pattern behind conference room allocation ([Meeting Rooms II]), skyline generation, and 2D computational geometry!

---

## 5. 🎯 Day 26 Checkpoint Questions

Verify your mastery of interval invariants with these 4 questions:

1. **The Subtraction Overflow Trap:** Why should you NEVER sort intervals using `Array.Sort(intervals, (a, b) => a[0] - b[0])` in C#? What happens when $a[0] = -2 \times 10^9$ and $b[0] = 2 \times 10^9$?
2. **Touching Boundaries:** In LeetCode 56, if two intervals touch at a single point (e.g. $[1, 4]$ and $[4, 5]$), do they merge? What about in LeetCode 435? How does the problem statement change the condition from `<=` to `<`?
3. **The Proof of Earliest End Time:** In LeetCode 435, why does sorting by `start` time fail for greedy scheduling? Give a simple 3-interval counter-example where sorting by start time produces a sub-optimal removal count.
4. **Phase 2 Invariant in Insert:** In LeetCode 57 (Insert Interval), why is the while loop condition for merging `intervals[i][0] <= newInterval[1]`? Show why this guarantees intersection.
