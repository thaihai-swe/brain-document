---
title: "Week 4 — Day 27: Sweep-Line & Event-Driven Processing"
---

In **Day 26**, we studied Interval Algebra ($[start, end]$), learning how to sort intervals as indivisible blocks to merge overlapping ranges and greedily schedule activities.

Today, we unlock **Sweep-Line (Event-Driven Timeline Processing)** — one of the most intellectually elegant and versatile algorithmic patterns in computer science.

Instead of treating an interval as an atomic block, Sweep-Line deconstructs intervals into **discrete chronological events**: an **Arrival (+1)** and a **Departure (-1)**. Moving an imaginary vertical line across time converts complex 2D concurrency problems (like conference room allocation, airport gate scheduling, and skyline silhouette rendering) into a simple, deterministic **running prefix sum**.

---

## 1. 🧠 TEACH: The Mechanics of Chronological Event Decomposition

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* The **Sweep-Line Algorithm** decomposes intervals into discrete point events (Start/Arrival $= +1$, End/Departure $= -1$) sorted chronologically along a timeline.
  - *Core Invariants:* Chronological Event Order: Events are processed in strictly ascending timestamp order; Tie-Breaking Invariant: If simultaneous events do not consume concurrent capacity, Departures ($-1$) must be processed **before** Arrivals ($+1$); Active Sum Invariant: $\text{ActiveCount} = \sum \text{delta}$.
  - *Misconception Check:* On identical timestamps, processing an arrival before a departure falsely inflates the concurrent resource count by 1. Exact tie-breaking logic is critical to interview correctness.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates continuous timeline discretization or 2D intersection tracking.
  - *Complexity Advantage:* Calculates global peak concurrent usage across arbitrary floating-point or 64-bit timestamps in $O(N \log N)$ time.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Meeting Rooms II" (LC 253), "Car Pooling" (LC 1094), "My Calendar III" (LC 732). Signal words: "concurrent events", "maximum rooms required", "peak load".
  - *When to Avoid / Failure Modes:* If the timestamp domain is tiny (e.g. $[0 .. 1000]$), a Difference Array on a flat array achieves $O(N + \text{Range})$ without sorting overhead.
- **4. WHERE:**
  - *Physical CLR Memory:* Array of event structs `(int Time, int Delta)` on managed heap, or a Min-Heap (`PriorityQueue<int, int>`) tracking active end times.
  - *Production Systems:* Airport runway gate scheduling, cloud virtual machine peak core capacity planning, network bandwidth billing peak meters.
- **5. WHO:**
  - *Spoken Script:* "Sweep-line decomposes intervals into discrete point events: start times add $+1$ to active count, end times subtract $-1$. By sorting all events chronologically with careful tie-breaking, a single pass tracks active concurrent resources and finds the global peak demand in $O(N \log N)$ time."
  - *Interviewer Evaluation Lens:* Evaluates event decoupling representation, precise tie-breaking on simultaneous events, and Min-Heap vs. Event List trade-off analysis.
- **6. HOW:**
  - *Cost Model:* Time: $O(N \log N)$ time; Space: $O(N)$ auxiliary space.
  - *State Transition Trace (Meeting Rooms II):* `[[0,30],[5,10],[15,20]] -> Events: (0,+1), (5,+1), (10,-1), (15,+1), (20,-1), (30,-1) -> Running sum: 1 -> 2 (peak) -> 1 -> 2 -> 1 -> 0 => Max rooms = 2`.


### 1.1 Physical Mental Model: The Airport Turnstile Clicker & The Vertical Radar Sweep

Sweep-line algorithms discard complex interval overlaps by turning time into a physical stream of entrance and exit turnstile clicks:

```
       ======================================================================
         PHYSICAL ANALOGY A: THE AIRPORT TURNSTILE CLICKER (CONCURRENCY)
       ======================================================================

       Guests enter and leave an airport VIP lounge:
       - Meeting [0, 30]: Enters at 0, leaves at 30.
       - Meeting [5, 10]: Enters at 5, leaves at 10.
       
       Instead of visualizing overlapping colored bars, place a counter at the door:
       Time  0: Guest enters!  Turnstile clicks: +1.  (Current in room: 1)
       Time  5: Guest enters!  Turnstile clicks: +1.  (Current in room: 2) -> PEAK!
       Time 10: Guest leaves!  Turnstile clicks: -1.  (Current in room: 1)
       Time 30: Guest leaves!  Turnstile clicks: -1.  (Current in room: 0)

       🚪 THE DOORWAY TIE-BREAKER LAW (EXIT BEFORE ENTER):
       Alice leaves at 10:00 AM. Bob arrives at 10:00 AM.
       If Bob pushes inside first, room count spikes to 2!
       If Alice steps out first (-1), then Bob enters (+1), room count stays at 1!
       Therefore: Sort (-1) BEFORE (+1) on identical timestamps!
```

```
       ======================================================================
         PHYSICAL ANALOGY B: THE VERTICAL RADAR SWEEP (SKYLINE LC 218)
       ======================================================================

       A vertical laser beam sweeps across a city skyline from left to right:
       
       Height
        30 |       [Building A: H=30]
        20 |             |                   [Building B: H=20]
        10 |             |                         |
         0 |-------------+-------------------------+--------------------> X
                     X = 5                     X = 15
       
       Sweep line moves along X:
       - Hits X = 5: Building A (H=30) enters the active Max-Heap. Laser rises to 30!
       - Hits X = 15: Building B (H=20) enters heap. But H=30 still dominates! Laser stays at 30!
       - Max-Heap always reports the currently visible roof contour in O(log N)!
```

---

### 1.2 The Core Insight: Deconstructing Intervals into Flux

Consider scheduling meetings:
- Meeting 1: $[0, 30]$
- Meeting 2: $[5, 10]$
- Meeting 3: $[15, 20]$

How many meeting rooms are required simultaneously at peak concurrency?

```
Time:      0    5    10   15   20   25   30
M1:        [=============================]
M2:             [====]
M3:                       [====]

Rooms:     1    2     1    2    1    1    0   --> Peak = 2 Rooms!
```

Instead of storing full intervals, observe the **flux** (rate of change) at each boundary:
- At $t = 0$: A meeting starts $\implies \mathbf{+1 \text{ Room}}$
- At $t = 5$: A meeting starts $\implies \mathbf{+1 \text{ Room}}$
- At $t = 10$: A meeting ends $\implies \mathbf{-1 \text{ Room}}$
- At $t = 15$: A meeting starts $\implies \mathbf{+1 \text{ Room}}$
- At $t = 20$: A meeting ends $\implies \mathbf{-1 \text{ Room}}$
- At $t = 30$: A meeting ends $\implies \mathbf{-1 \text{ Room}}$

By sorting all events by timestamp and sweeping a running accumulator `currentRooms += delta`, the maximum value reached by `currentRooms` is mathematically guaranteed to be the **maximum concurrent overlap**!

---

### 1.2 The Event Representation & Tie-Breaking Invariant

In real-world systems, events frequently share the exact same timestamp:
> *"Meeting A ends at 10:00 AM, and Meeting B starts at 10:00 AM. Does this require 1 room or 2 rooms?"*

Under standard conference room rules, Meeting A vacates the room at 10:00 AM, allowing Meeting B to reuse it immediately. They do **not** overlap.

#### The Tie-Breaking Rule:
If two events occur at the identical timestamp $T$, the **Departure (-1) MUST be processed BEFORE the Arrival (+1)**:

```
Timestamp = 10:
Event 1: Meeting A ENDS (-1)
Event 2: Meeting B STARTS (+1)

Case A (Correct: End before Start):
Rooms at 9:59 AM:  1
Process End (-1):  1 - 1 = 0
Process Start (+1): 0 + 1 = 1  --> Peak remained 1! (Correct reuse)

Case B (Catastrophic Bug: Start before End):
Rooms at 9:59 AM:  1
Process Start (+1): 1 + 1 = 2  --> False momentary peak of 2! (Bug!)
Process End (-1):  2 - 1 = 1
```

- When implementing event objects: `(timestamp, type)`.
- If type values are: `END = -1` and `START = +1`, sorting ascending by type naturally puts `END` before `START` when timestamps tie!

---

### 1.3 The Two Archetypes for Meeting Rooms II

There are two primary paradigms to solve concurrency problems:

#### Archetype 1: Min-Heap of Active End Times ($O(N \log N)$ Time, $O(N)$ Space)
1. Sort intervals by `start` time.
2. Maintain a `PriorityQueue<int, int>` storing the **end times** of active meetings.
3. For each incoming meeting `[start, end]`:
   - If the earliest meeting in the heap has already ended (`heap.Peek() <= start`), that room is free! Pop it (`heap.Dequeue()`).
   - Assign the current meeting to the room (push `end` to heap).
4. The maximum size of the heap is the minimum rooms required.

#### Archetype 2: Two Independent Sorted Arrays ($O(N \log N)$ Time, $O(1)$ Space)
Notice that an end time does not care *which* specific room it belonged to — it only signals that *some* room became available.
1. Extract all `starts` into one array, and all `ends` into another array.
2. Sort both arrays independently in $O(N \log N)$.
3. Use two pointers `startPtr` and `endPtr`:
   - If `starts[startPtr] < ends[endPtr]`: A meeting started before the earliest meeting ended. We must allocate a new room: `rooms++`, `startPtr++`.
   - Else: A meeting ended. We reuse that room: `rooms--`, `endPtr++`.
4. Peak rooms during the sweep is our answer. **Requires zero heap overhead!**

---

### 1.4 Dynamic Sweep-Line with `SortedDictionary` (Online Calendars)

When intervals are inserted dynamically one-by-one (as in [LeetCode 732 — My Calendar III]), we cannot sort a static array. We use a **Self-Balancing Binary Search Tree** (`SortedDictionary<int, int>` in C#):
- For each new interval $[start, end]$:
  - `timeline[start] = timeline.GetValueOrDefault(start, 0) + 1`
  - `timeline[end] = timeline.GetValueOrDefault(end, 0) - 1`
- Sweep through `timeline.Values` in sorted key order, computing running prefix sums to find the maximum $K$-booking in $O(N)$ per query!

---

### 1.5 Interview Spoken Drill (20–30 Seconds)

> *"To find peak concurrency, I decouple intervals into discrete arrival and departure events. I sort start times and end times independently. By advancing a pointer through arrivals and departures chronologically, whenever a start occurs before the earliest end, I increment my room count. If an end occurs, I decrement it. Sorting takes $O(N \log N)$, and the subsequent two-pointer sweep runs in $O(N)$ time with $O(1)$ auxiliary space."*

---

### 1.6 ⚙️ Core Operations Deep-Dive: Sweep-Line Event Sorting & Peak Concurrency Tracking

#### Dimension 1: Operation Contract & Big-O Bounds

##### Concurrency & Sweep-Line Primitives (`MinMeetingRooms`, `CanAttendMeetings`, `MyCalendarThree`)
- **Signatures:**
  - `public int MinMeetingRooms(int[][] intervals)`: Decoupled two-array chronological sweep finding maximum overlapping intervals in $O(N \log N)$ time and $O(N)$ space.
  - `public int MinMeetingRoomsHeap(int[][] intervals)`: Dynamic priority queue tracking earliest ending allocations in $O(N \log N)$ time and $O(N)$ heap space.
  - `public int Book(int start, int end)`: Online calendar delta-event booking via balanced BST in $O(N)$ time per transaction.
- **Preconditions:**
  - Interval format: $[start, end]$ with integer invariant $0 \le start < end \le 10^9$.
  - End events must process strictly prior to Start events when timestamps coincide ($T_{end} \le T_{start}$).
- **Postconditions:**
  - Returns minimal non-conflicting partition cardinality (chromatic number of interval graph).
  - Peak concurrency scalar strictly reflects maximum simultaneous overlap at any infinitesimal time $t$.
- **Complexity Bounds:**

| Implementation Pattern | Sorting Overhead | Scan Phase Time | Auxiliary Heap Space | Tie-Breaking Fragility |
| :--- | :--- | :--- | :--- | :--- |
| **Decoupled Two Arrays** | **$2 \times O(N \log N)$** | **$\Theta(N)$ two pointers** | **$O(1)$ extra beyond arrays** | Low (`starts[i] < ends[j]`) |
| **Min-Heap of End Times** | $O(N \log N)$ by start | $O(N \log N)$ heap push/pop | $O(N)$ heap nodes | Medium |
| **Event Object List** | $O(2N \log(2N))$ | $\Theta(N)$ single pass | $O(N)$ tuple objects | High (Requires custom tuple comparator) |
| **Coordinate Compression Array**| $O(N \log N)$ distinct | $\Theta(N)$ prefix sum | $O(N)$ flat array | Low (Static only) |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
          Decoupled Dual-Array Chronological Sweep Flow
                                │
                 [Extract starts[] and ends[] from input]
                                │
                 [Array.Sort(starts); Array.Sort(ends)]
                                │
                 [Init: startPtr = 0, endPtr = 0,
                        currentRooms = 0, maxRooms = 0]
                                │
                     [startPtr < intervals.Length?]
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
                YES                            NO ──► [Return maxRooms]
                 │
       [starts[startPtr] < ends[endPtr]?]
        ┌────────┴────────┐
       YES                NO
        │                 │
 (Meeting starts before  (Earliest meeting ended!
  earliest finishes!)     Room becomes available)
        │                 │
 [currentRooms++]        [currentRooms--]
 [maxRooms =             [endPtr++]
  Max(maxRooms, curr)]            │
 [startPtr++]                     │
        │                         │
        └────────────┬────────────┘
                     ▼
              (Next Step)
```

---

#### Dimension 3: Visual ASCII State Transitions

##### Event Ordering & Tie-Breaking Trace: `[9, 10]` and `[10, 11]`
```
Correct Processing (End at 10 processed before Start at 10):
starts: [ 9, 10 ]
ends:   [ 10, 11 ]

Step 1: starts[0] = 9, ends[0] = 10
- 9 < 10 ──► Meeting starts! currentRooms: 0 -> 1, maxRooms = 1. startPtr: 0 -> 1.

Step 2: starts[1] = 10, ends[0] = 10
- starts[1] < ends[0] is FALSE (10 < 10 is false).
- A meeting ended! currentRooms: 1 -> 0. endPtr: 0 -> 1.

Step 3: starts[1] = 10, ends[1] = 11
- 10 < 11 ──► Meeting starts in FREED room! currentRooms: 0 -> 1. maxRooms = 1. startPtr: 1 -> 2.

Sweep Finished: Result maxRooms = 1. (Room perfectly recycled!)
```

---

#### Dimension 4: Invariant Preservation Proof

##### Theorem (Decoupled Arrival-Departure Invariance):
The maximum number of concurrent intervals in a set of intervals $\{ [S_i, E_i] \}$ is mathematically equivalent to the maximum prefix difference between independently sorted arrival times $\{ S_i \}$ and departure times $\{ E_i \}$.

##### Proof:
1. Let the active count of intervals at continuous timestamp $t$ be defined as:
   $$C(t) = \sum_{i=1}^N \mathbf{1}[S_i \le t < E_i]$$
2. For any point $t$, this decomposes into:
   $$C(t) = \left( \sum_{i=1}^N \mathbf{1}[S_i \le t] \right) - \left( \sum_{i=1}^N \mathbf{1}[E_i \le t] \right)$$
3. Let $N_{\text{start}}(t) = |\{ i \mid S_i \le t \}|$ and $N_{\text{end}}(t) = |\{ i \mid E_i \le t \}|$.
   $$C(t) = N_{\text{start}}(t) - N_{\text{end}}(t)$$
4. Crucially, $N_{\text{start}}(t)$ depends **only** on the multiset of start times, and $N_{\text{end}}(t)$ depends **only** on the multiset of end times.
5. The specific pairing of which start corresponds to which end is irrelevant to the evaluation of the scalar difference $N_{\text{start}}(t) - N_{\text{end}}(t)$.
6. By sorting $starts$ and $ends$ independently, the two-pointer condition `starts[s] < ends[e]` strictly tests whether the next chronological event is an arrival or a departure.
7. Tracking $\max (s - e)$ throughout the sweep evaluates $\max_t C(t)$ with zero information loss. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Scenario | Concrete Input | Danger / Failure Mode | Invariant Protection Mechanism |
| :--- | :--- | :--- | :--- |
| **Adjacent Non-Overlapping** | `[[1, 5], [5, 10]]` | Allocating 2 rooms due to boundary tie | Condition `starts[s] < ends[e]` (strict inequality) forces departure processing before arrival; peak remains 1. |
| **All Mutually Disjoint** | `[[1, 2], [3, 4], [5, 6]]` | Room count accumulation | Every departure triggers before subsequent arrival; room count oscillates between 0 and 1. Returns 1. |
| **All Completely Nested** | `[[1, 10], [2, 9], [3, 8]]` | Premature room release | All starts occur before earliest end (8); room count accumulates monotonically: 1 $\to$ 2 $\to$ 3. Returns 3. |
| **Single Interval ($N = 1$)** | `[[1, 100]]` | Loop exit before evaluation | $s=0, e=0$. $1 < 100 \implies rooms = 1$. $s$ reaches 1; halts; returns 1. |
| **Zero Duration Interval** | `[[5, 5]]` | Ambiguity in start vs end | Precondition invariant $start < end$; invalid intervals pruned at ingestion. |

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 252 — Meeting Rooms (Easy)

> Given an array of meeting time `intervals` where `intervals[i] = [start_i, end_i]`, determine if a person could attend all meetings.

#### The Core Invariant:
A single person can attend all meetings if and only if **no two meetings overlap**. When sorted by start time, we only need to verify that each meeting finishes before the next one begins.

#### Production C# Implementation:
```csharp
public class SolutionCanAttendMeetings {
    public bool CanAttendMeetings(int[][] intervals) {
        if (intervals == null || intervals.Length <= 1) return true;

        // Sort by start time
        Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));

        for (int i = 1; i < intervals.Length; i++) {
            // If previous meeting ends strictly after next meeting starts -> Conflict!
            if (intervals[i - 1][1] > intervals[i][0]) {
                return false;
            }
        }

        return true;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N \log N)$ — sorting dominates.
- **Space Complexity:** $O(1)$ auxiliary memory.

---

### Problem 2: LeetCode 253 — Meeting Rooms II (Medium)

> Given an array of meeting time intervals `intervals` where `intervals[i] = [start_i, end_i]`, return the minimum number of conference rooms required.

#### Visual Trace of the Two Sorted Arrays Approach:
`intervals = [[0, 30], [5, 10], [15, 20]]`

- `starts = [0, 5, 15]`
- `ends   = [10, 20, 30]`

```
Pointers: startPtr = 0, endPtr = 0, currentRooms = 0, maxRooms = 0

Step 1:
 starts[0] = 0, ends[0] = 10
 0 < 10 -> Meeting starts before any meeting finishes!
 currentRooms++ -> 1. maxRooms = 1.
 startPtr++ -> 1

Step 2:
 starts[1] = 5, ends[0] = 10
 5 < 10 -> Another meeting starts before the 10:00 AM meeting ends!
 currentRooms++ -> 2. maxRooms = 2.
 startPtr++ -> 2

Step 3:
 starts[2] = 15, ends[0] = 10
 15 >= 10 -> A meeting ended at 10! Room is freed.
 currentRooms-- -> 1.
 endPtr++ -> 1

Step 4:
 starts[2] = 15, ends[1] = 20
 15 < 20 -> Meeting starts at 15 before the 20:00 meeting finishes.
 currentRooms++ -> 2. maxRooms = 2.
 startPtr++ -> 3 (All starts processed!)

Result: maxRooms = 2.
```

#### Production C# Implementation (Optimal Two-Array Sweep):
```csharp
public class SolutionMeetingRoomsII {
    public int MinMeetingRooms(int[][] intervals) {
        if (intervals == null || intervals.Length == 0) return 0;

        int n = intervals.Length;
        int[] starts = new int[n];
        int[] ends = new int[n];

        for (int i = 0; i < n; i++) {
            starts[i] = intervals[i][0];
            ends[i] = intervals[i][1];
        }

        // Sort starts and ends independently
        Array.Sort(starts);
        Array.Sort(ends);

        int startPtr = 0;
        int endPtr = 0;
        int currentRooms = 0;
        int maxRooms = 0;

        // Sweep line across all start events
        while (startPtr < n) {
            if (starts[startPtr] < ends[endPtr]) {
                // A meeting started before the earliest meeting ended
                currentRooms++;
                startPtr++;
            } else {
                // A meeting ended; room is freed
                currentRooms--;
                endPtr++;
            }

            maxRooms = Math.Max(maxRooms, currentRooms);
        }

        return maxRooms;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N \log N)$ — sorting two arrays of size $N$.
- **Space Complexity:** $O(N)$ — auxiliary arrays for `starts` and `ends` (avoids heap allocation overhead and pointer manipulation).

---

### Problem 3: LeetCode 732 — My Calendar III (Hard)

> A `k-booking` happens when `k` events have some non-empty intersection.
> Implement the `MyCalendarThree` class:
> - `int Book(int startTime, int endTime)` Returns an integer `k` representing the largest integer such that there exists a `k-booking` in the calendar.

#### The Dynamic Event Map Invariant:
Since booking requests arrive dynamically online, we maintain a `SortedDictionary<int, int>` mapping `timestamp -> delta`:
- At `startTime`: add $+1$.
- At `endTime`: add $-1$.
- In-order traversal of the keys simulates the chronological sweep line. The peak prefix sum is the answer.

#### Production C# Implementation:
```csharp
public class MyCalendarThree {
    // Red-Black tree under the hood: guarantees in-order traversal of timestamps
    private readonly SortedDictionary<int, int> _timeline;

    public MyCalendarThree() {
        _timeline = new SortedDictionary<int, int>();
    }

    public int Book(int startTime, int endTime) {
        // Step 1: Record delta flux
        _timeline[startTime] = _timeline.GetValueOrDefault(startTime, 0) + 1;
        _timeline[endTime] = _timeline.GetValueOrDefault(endTime, 0) - 1;

        // Step 2: Sweep line across all recorded boundaries
        int currentActive = 0;
        int maxKBooking = 0;

        foreach (var delta in _timeline.Values) {
            currentActive += delta;
            if (currentActive > maxKBooking) {
                maxKBooking = currentActive;
            }
        }

        return maxKBooking;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** For $N$ booking calls:
  - Inserting into `SortedDictionary`: $O(\log K)$ where $K \le 2N$ is the number of unique timestamps.
  - Sweeping the tree values: $O(K) = O(N)$.
  - Total time for $N$ bookings: $\sum_{i=1}^N i = O(N^2)$ worst-case. (Sufficient for $N \le 400$).
- **Space Complexity:** $O(N)$ — to store up to $2N$ boundary keys in the balanced tree.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master Sweep-Line patterns on LeetCode:

### Problem 1 (Warmup): LeetCode 252 — Meeting Rooms (Easy)
- **Goal:** Sort by start time and detect any pairwise overlap.
- **Target Complexity:** $O(N \log N)$ time, $O(1)$ space.

### Problem 2 (Classic Sweep): LeetCode 253 — Meeting Rooms II (Medium)
- **Goal:** Implement both the Min-Heap approach and the Two-Sorted-Arrays approach.
- **Target Complexity:** $O(N \log N)$ time, $O(1)$ auxiliary space.

### Problem 3 (Online Sweep): LeetCode 732 — My Calendar III (Hard)
- **Goal:** Manage dynamic delta boundaries using a balanced BST / `SortedDictionary`.
- **Target Complexity:** $O(N)$ per booking, $O(N)$ total space.

### Bonus / Extension Challenge: LeetCode 1854 — Maximum Population Year (Easy)
- **Goal:** Given birth and death years $[1950, 2050]$, find the earliest year with maximum population.
- **Hint:** Since the coordinate range is fixed ($1950 \dots 2050$), you don't even need sorting! Use a fixed-size Difference Array `int[101]` and prefix sum in $O(N)$!

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Temporal & Range Patterns                       │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Consolidate overlapping intervals ────────► Sort by Start, Linear Merge
                   │                                               [LC 56]
                   │
                   ├─► Maximum non-overlapping intervals ────────► Sort by End, Greedy Earliest Finish
                   │                                               [LC 435]
                   │
                   ├─► Max concurrent overlap / Resource sizing ─► Sweep-Line (Arrival +1, Departure -1)
                   │                                               [LC 253, LC 732]
                   │
                   └─► Bounded coordinate range [0 .. 10^5] ─────► Difference Array Prefix Sweep
                                                                   [LC 1854]
```

### Preview for Day 28: Week 4 Integration & Timed Simulation
Congratulations on mastering Binary Search invariants, Rotated Arrays, Answer Spaces, Multi-Pointer reductions, Interval algebra, and Sweep-Line!
Tomorrow in **Day 28**, we conduct a **Timed Simulation & Pattern Contrast Session**. You will face mixed problems under realistic interview conditions to hone your pattern diagnosis speed.

---

## 5. 🎯 Day 27 Checkpoint Questions

Test your mastery of Sweep-Line mechanics with these 4 questions:

1. **The Tie-Breaking Bug:** In an event-based Sweep-Line algorithm, if an interval ends at $t = 5$ and another starts at $t = 5$, what error occurs if the start event is processed before the end event?
2. **Two Sorted Arrays Invariant:** In LeetCode 253, why is it valid to sort `starts` and `ends` independently into two separate arrays, effectively decoupling which start corresponds to which end?
3. **Difference Array Connection:** When can a Sweep-Line problem be optimized from $O(N \log N)$ sorting down to $O(N + R)$ linear time using a Difference Array? What constraint on the coordinate range $R$ is required?
4. **Min-Heap vs Two-Array Trade-off:** What is one advantage the Min-Heap approach has over the Two-Array approach if you were asked not just for the *count* of rooms, but to assign and return the exact *room number* (e.g. Room 1, Room 2) for each meeting?
