---
title: "Week 16 — Day 111: Week 16 Timed Synthesis & Priority Queue Operations Drill"
---

# Week 16 — Day 111: Week 16 Timed Synthesis & Priority Queue Operations Drill

Welcome to **Day 111 of your DSA Mastery Journey**!

Over the past five days (Days 106–110), you mastered the complete spectrum of foundational binary heap operations: implicit 0-indexed formulas, `SiftUp`, `SiftDown`, Floyd's linear $\Theta(N)$ `BuildHeap`, in-place $\Theta(1)$-space HeapSort, and bounded Top-K stream filtering.

Today is your **Timed Simulation and Synthesis Day**. Under strict Big Tech interview conditions, we drill the rapid formulation of priority-driven greedy state machines:
1. **The Priority-Cooldown Dual State Machine:** Combining a **Max-Heap** (to prioritize the highest-demand tasks) with a **FIFO Queue** (to enforce minimum cooldown intervals).
2. **Greedy Priority Simulation:** Resolving iterative annihilation games with maximum candidate pairing in $O(N \log N)$ time.
3. **Timed Technical Drill (60 Minutes Total):**
   - **Challenge A (25 Mins):** [LeetCode 1046] Last Stone Weight (Easy/Medium)
   - **Challenge B (35 Mins):** [LeetCode 621] Task Scheduler (Medium)

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DAY 111 ARCHITECTURE                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
         ┌────────────────────────────────────────┴────────────────────────────────────────┐
         ▼                                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       CHALLENGE A: SIMULATION     │                             │     CHALLENGE B: TASK SCHEDULER   │
│         MAX-HEAP PAIR SMASH       │                             │     MAX-HEAP + COOLDOWN QUEUE     │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • LC 1046: Last Stone Weight      │                             │ • LC 621: Task Scheduler (Medium) │
│ • Extract top 2 stones: y >= x.   │                             │ • Greedily run task with HIGHEST  │
│ • If y == x: both destroyed.      │                             │   remaining frequency!            │
│ • If y > x: push y - x back.      │                             │ • Put task into FIFO Queue with   │
│ • Repeat until <= 1 stone left.   │                             │   availableTime = currentTime + n │
│ • Time: O(N log N) worst-case.    │                             │ • When queue task becomes ready:  │
│ • Space: O(N) heap elements.      │                             │   push back into Max-Heap!        │
└───────────────────────────────────┘                             └───────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint

- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* The **Priority-Cooldown State Machine** is a composite algorithmic pattern that coordinates a Max-Heap and a FIFO Queue:
    1. The **Max-Heap** holds tasks currently available for immediate CPU execution, prioritized by highest remaining frequency.
    2. The **FIFO Queue** holds tasks currently cooling down, ordered chronologically by their release time `(AvailableTime, RemainingCount)`.
  - *Core Invariants:*
    - **Greedy Frequency Invariant:** At any clock cycle $t$, if the Max-Heap is non-empty, scheduling the task with the highest remaining frequency strictly minimizes the total idle cycles required across all future steps.
    - **Cooldown Separation:** A task executed at cycle $t$ cannot re-enter the Max-Heap until clock cycle $t + n + 1$.
  - *Misconception Check:* Candidates often attempt to simulate the task scheduler by calculating mathematical blocks (idle slots) alone. While a pure math formula works for LeetCode 621 when tasks are identical, it **fails completely** when tasks have distinct processing durations or dynamic dependencies! The **Max-Heap + Cooldown Queue** architecture is the universal production pattern that generalizes to real operating system schedulers.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the $O(N)$ linear scan of searching for the optimal task on every clock cycle. The Max-Heap yields the highest-demand task in $O(1)$ peek / $O(\log K)$ pop, and the Queue decouples cooldown timing from priority tracking.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* "Reorganize string so no two identical characters adjacent", "CPU task scheduler with cooldown", "rate-limiting bursty network traffic with bucket cooldowns".
  - *When to Avoid / Failure Modes:* When tasks have zero cooldown ($n = 0$), the queue is unnecessary; tasks execute strictly in descending order of frequency.
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* `PriorityQueue<int, int>` for the Max-Heap (inverted comparer) and `Queue<(int AvailableTime, int Count)>` for the cooldown queue. Because there are at most 26 English task types, heap operations run with $K \le 26$ ($O(\log 26) = O(1)$ practical runtime).
  - *Production Systems:* Operating system process dispatchers, GPU workgroup round-robin schedulers, distributed microservice rate limiters.
- **5. WHO (20–30s Interview Spoken Drill Script):**
  - *Spoken Script:* "For the Task Scheduler, I greedily execute the task with the highest remaining frequency to minimize future idle bottlenecks. I count frequencies using a hash map and insert positive counts into a Max-Heap. At each clock tick, if the cooldown queue has tasks whose cooldown has expired, I pop them and re-enqueue them into the Max-Heap. I then pop the highest-frequency task from the heap, decrement its count, and if it still has work remaining, place it into the cooldown queue with timestamp current_time + n. If the heap is empty, the CPU must idle. This coordinates priority and cooldown in $O(N \log K)$ time."
  - *Interviewer Evaluation Lens:* Evaluates whether candidate articulates the dual heap-queue coordination, explains why highest-frequency tasks are prioritized, correctly tracks clock cycles, and mentions both the simulation and mathematical bounds.
- **6. HOW (Operations, Implementation & State Trace):**
  - *Cost Model:* Total Time: $O(N \log K)$ where $K$ is the alphabet size ($K \le 26$); Space: $O(K)$.

---

### 1.1 Physical Mental Model — Overheated Factory Machines & The Cooling Conveyor

**Everyday Analogy: The High-Pressure Stamping Factory (Task Scheduler)**

Imagine managing a manufacturing shop floor with different stamping machines (`Task A`, `Task B`, etc.):
- Machine A has **6 heavy engine blocks** left to stamp (highest backlog).
- When any machine stamps an engine block, it **overheats**!
- Safety regulations mandate: once a machine stamps, it **cannot stamp again for $n$ seconds** (cooling period).

**The Two-Room Factory Architecture:**
1. **The Ready Room (Max-Heap):**
   - Holds all machines that are currently **ice-cold and ready to work**.
   - The shop foreman always picks the machine with the **highest remaining work** (Max-Heap root)!
2. **The Cooling Conveyor Belt (FIFO Queue):**
   - Once a machine finishes stamping, it is placed onto a moving conveyor belt tagged with the exact second it will be cold: `(ReadyTime = t + n, RemainingWork)`.
   - The belt advances with each clock tick.

```
FACTORY SHOP FLOOR AT TIME t:

    READY ROOM (Max-Heap)                COOLING CONVEYOR BELT (FIFO Queue)
┌───────────────────────────┐         ┌─────────────────────────────────────┐
│ 👑 Task A: 5 jobs left    │         │ Tag: [Task B, ready at t+2]         │
│    Task C: 2 jobs left    │         │ Tag: [Task A, ready at t+3]         │
└───────────────────────────┘         └─────────────────────────────────────┘
        │                                                ▲
        ▼ (Foreman dispatches Task A to CPU)             │ (Overheats, sent to cool)
   [ CPU EXECUTES ] ─────────────────────────────────────┘
```

---

**The Foreman's Monotonic Clock Loop (Time = $t$):**

1. **Check the Conveyor Exit:** Look at the front of the cooling belt. If any machine's timer has expired ($\text{ReadyTime} \le t$), it hops off the belt and re-enters the **Ready Room (Max-Heap)**!
2. **Dispatch Next Machine:**
   - If Ready Room has machines: pop the highest-backlog machine, execute 1 job, and put it on the cooling belt (if it still has work).
   - If Ready Room is empty: the factory must **IDLE** for 1 tick while waiting for a machine to cool down!
3. **Advance Clock:** $t \leftarrow t + 1$.

**Zero Idle Wastage:** By greedily running the machine with the most work whenever possible, we spread out its cooldowns, minimizing expensive CPU idle cycles!

---

### 1.2 ⚙️ Core Operations Deep-Dive: Priority-Cooldown State Machine

#### Dimension 1: Operation Contract & Big-O Bounds

##### 1. Greedy Task Scheduler Contract (`LeastInterval`)
- **Signature:** `int LeastInterval(char[] tasks, int n)`
- **Pre-conditions:** `tasks` is non-null ($1 \le \text{Length} \le 10^4$); $n \ge 0$.
- **Post-conditions:** Returns the minimum number of CPU intervals required to complete all tasks respecting the cooldown $n$.
- **Invariants:**
  1. No two identical task types are scheduled within $n$ units of time of each other.
  2. The simulation advances time monotonically ($t \leftarrow t + 1$).

##### Big-O Operational Complexity Matrix
| Operation | Time Complexity | Auxiliary Space | Bottleneck |
| :--- | :---: | :---: | :--- |
| **Frequency Counting** | $O(N)$ | $O(\Sigma)$ ($\Sigma = 26$) | Single sequential memory scan |
| **Simulation Loop** | $O(\text{TotalCycles} \cdot \log \Sigma)$ | $O(\Sigma)$ | Max-Heap pop/push and FIFO queue operations |
| **Mathematical Formula** | $O(N)$ | $O(\Sigma)$ | Frequency max scan ($O(1)$ after count) |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
====================================================================================================
                    PRIORITY-COOLDOWN STATE MACHINE DECISION TREE
====================================================================================================
At clock cycle time = t:
   │
   ├─► STEP 1: Release Expired Tasks from Cooldown Queue:
   │      • While queue.Count > 0 AND queue.Peek().AvailableTime <= t:
   │           - task = queue.Dequeue();
   │           - maxHeap.Enqueue(task.Count, task.Count); // Back in circulation!
   │
   ├─► STEP 2: Execute Highest-Demand Task:
   │      ├─► IF maxHeap is NOT empty:
   │      │      • count = maxHeap.Dequeue();
   │      │      • count--;
   │      │      • IF count > 0:
   │      │           - queue.Enqueue((AvailableTime: t + n + 1, Count: count));
   │      │
   │      └─► ELSE (maxHeap is empty):
   │             • CPU MUST IDLE! (No tasks currently available).
   │
   └─► STEP 3: Advance Clock:
          • time++;
          • Check termination: If maxHeap is empty AND queue is empty => STOP.
====================================================================================================
```

---

#### Dimension 3: Visual ASCII State Transitions

##### Trace: Task Scheduler on `['A', 'A', 'A', 'B', 'B', 'B']` with Cooldown $n = 2$
Frequencies: `A: 3, B: 3`. Max-Heap initially: `[ 3 (A), 3 (B) ]`.

```
+------+--------+-------------------+-----------------------+---------------------+
| Time | Action | Max-Heap State    | Cooldown Queue State  | CPU Activity Log    |
+------+--------+-------------------+-----------------------+---------------------+
| t=0  | Pop A  | [ 3 (B) ]         | [ (Ready: 3, A: 2) ]  | EXECUTE: A          |
| t=1  | Pop B  | []                | [ (Ready: 3, A: 2),   | EXECUTE: B          |
|      |        |                   |   (Ready: 4, B: 2) ]  |                     |
| t=2  | Empty  | []                | [ (Ready: 3, A: 2),   | IDLE (Waiting for A)|
|      |        |                   |   (Ready: 4, B: 2) ]  |                     |
| t=3  | A Re-in| [ 2 (A) ]         | [ (Ready: 4, B: 2) ]  |                     |
|      | Pop A  | []                | [ (Ready: 4, B: 2),   | EXECUTE: A          |
|      |        |                   |   (Ready: 6, A: 1) ]  |                     |
| t=4  | B Re-in| [ 2 (B) ]         | [ (Ready: 6, A: 1) ]  |                     |
|      | Pop B  | []                | [ (Ready: 6, A: 1),   | EXECUTE: B          |
|      |        |                   |   (Ready: 7, B: 1) ]  |                     |
| t=5  | Empty  | []                | [ (Ready: 6, A: 1),   | IDLE (Waiting for A)|
|      |        |                   |   (Ready: 7, B: 1) ]  |                     |
| t=6  | A Re-in| [ 1 (A) ]         | [ (Ready: 7, B: 1) ]  |                     |
|      | Pop A  | []                | [ (Ready: 7, B: 1) ]  | EXECUTE: A (A done!)|
| t=7  | B Re-in| [ 1 (B) ]         | []                    |                     |
|      | Pop B  | []                | []                    | EXECUTE: B (B done!)|
+------+--------+-------------------+-----------------------+---------------------+
Total Clock Cycles: 8 (Execution pattern: A -> B -> IDLE -> A -> B -> IDLE -> A -> B).
```

---

#### Dimension 4: Invariant Preservation Proof

##### Greedy Choice Property of Frequency Scheduling
Let $T = \{t_1, t_2, \dots, t_k\}$ be the set of tasks with counts $c_1 \ge c_2 \ge \dots \ge c_k$.
- **Theorem:** An optimal schedule can always execute the task with the maximum remaining count $c_1$ whenever it is legal to do so.
- **Proof:**
  1. Let $S^*$ be an optimal schedule. Suppose at time $t$, $S^*$ schedules task $A$ with count $c_A$, but task $B$ was also legal and had $c_B > c_A$.
  2. Because $c_B > c_A$, task $B$ has more remaining instances that must be separated by at least $n$ units of time.
  3. The number of idle slots in any valid schedule is bounded from below by the task with the maximum frequency:
     $$\text{MinIdle} \ge (c_{\max} - 1) \cdot n - \sum_{i \ne \max} c_i$$
  4. Swapping the execution of $A$ and $B$ at time $t$ does not introduce any cooldown violations for $B$, because $B$ was already legal at $t$.
  5. Furthermore, delaying the execution of $B$ can only force its future instances closer to the end of the schedule, increasing the probability of forced idle slots.
  6. Therefore, the schedule $S'$ obtained by prioritizing $B$ over $A$ has total duration $|S'| \le |S^*|$.
  7. By induction, greedily selecting the task with the maximum remaining frequency at every available cycle is optimal. $\blacksquare$

---

#### Dimension 5: Edge Case Matrix

| Edge Case Archetype | Concrete Input Instance | Failure Mode / Danger | Defensive Guard & Mitigation |
| :--- | :--- | :--- | :--- |
| **Zero Cooldown ($n = 0$)** | `tasks = ['A', 'A', 'B']`, `n = 0` | Tasks enter queue with `time + 1`, forcing unnecessary idle | When $n = 0$, result is trivially `tasks.Length`; bypass queue entirely |
| **All Tasks Unique** | `tasks = ['A', 'B', 'C', 'D']`, `n = 2` | Simulating idle cycles when none are needed | Result is bounded by `Math.Max(tasks.Length, formulaResult)` |
| **High Cooldown with Single Task** | `tasks = ['A', 'A']`, `n = 100` | Infinite loop waiting for next task | Clock jumps or proper idle simulation: $(2 - 1) \times (100 + 1) + 1 = 102$ |
| **Heap and Queue Both Empty** | End of all tasks | Extra tick counted | Check `while (maxHeap.Count > 0 || queue.Count > 0)` at loop header |

---

## 2. 🎬 DEMONSTRATE: From-Scratch Production Implementation

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedHeaps.Day111
{
    public static class TaskSchedulerSimulator
    {
        /// <summary>
        /// Simulates the Priority-Cooldown State Machine using a Max-Heap and FIFO Queue.
        /// Time Complexity: O(TotalIntervals * log(Sigma)) where Sigma <= 26.
        /// Auxiliary Space: O(Sigma) memory.
        /// </summary>
        public static int LeastInterval(char[] tasks, int n)
        {
            if (tasks == null || tasks.Length == 0) return 0;
            if (n == 0) return tasks.Length;

            // Step 1: Frequency counting
            int[] frequencies = new int[26];
            foreach (char c in tasks)
            {
                frequencies[c - 'A']++;
            }

            // Step 2: Max-Heap for available tasks (inverted priority comparer)
            var maxHeap = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
            for (int i = 0; i < 26; i++)
            {
                if (frequencies[i] > 0)
                {
                    maxHeap.Enqueue(frequencies[i], frequencies[i]);
                }
            }

            // Step 3: Cooldown FIFO Queue storing (AvailableTime, RemainingCount)
            var cooldownQueue = new Queue<(int AvailableTime, int Count)>();

            int currentTime = 0;

            // Step 4: Discrete event simulation loop
            while (maxHeap.Count > 0 || cooldownQueue.Count > 0)
            {
                // Release tasks whose cooldown has expired
                while (cooldownQueue.Count > 0 && cooldownQueue.Peek().AvailableTime <= currentTime)
                {
                    var readyTask = cooldownQueue.Dequeue();
                    maxHeap.Enqueue(readyTask.Count, readyTask.Count);
                }

                // If a task is ready, execute it
                if (maxHeap.Count > 0)
                {
                    int remainingCount = maxHeap.Dequeue() - 1;

                    if (remainingCount > 0)
                    {
                        // Enforce cooldown: task can run again at currentTime + n + 1
                        cooldownQueue.Enqueue((currentTime + n + 1, remainingCount));
                    }
                }
                // Else: CPU Idles (currentTime still increments)

                currentTime++;
            }

            return currentTime;
        }

        /// <summary>
        /// Mathematical closed-form solution: O(N) time and O(1) space.
        /// </summary>
        public static int LeastIntervalMath(char[] tasks, int n)
        {
            if (tasks == null || tasks.Length == 0) return 0;
            if (n == 0) return tasks.Length;

            int[] freq = new int[26];
            int maxFreq = 0;
            foreach (char c in tasks)
            {
                freq[c - 'A']++;
                if (freq[c - 'A'] > maxFreq)
                    maxFreq = freq[c - 'A'];
            }

            int countOfMaxFreq = 0;
            for (int i = 0; i < 26; i++)
            {
                if (freq[i] == maxFreq)
                    countOfMaxFreq++;
            }

            // Closed formula: (maxFreq - 1) * (n + 1) + countOfMaxFreq
            int emptySlots = (maxFreq - 1) * (n + 1) + countOfMaxFreq;

            return Math.Max(tasks.Length, emptySlots);
        }
    }

    // =========================================================================
    // PRODUCTION VERIFICATION TEST SUITE
    // =========================================================================

    public static class Program
    {
        public static void Main()
        {
            Console.WriteLine("=================================================================");
            Console.WriteLine("  RUNNING DAY 111: TASK SCHEDULER & TIMED SYNTHESIS VERIFICATION ");
            Console.WriteLine("=================================================================");

            TestTaskSchedulerStandard();
            TestTaskSchedulerZeroCooldown();
            TestTaskSchedulerAllDistinct();
            TestSimulationMatchesMathFormula();

            Console.WriteLine("\n[SUCCESS] ALL VERIFICATION TESTS PASSED!");
        }

        private static void TestTaskSchedulerStandard()
        {
            char[] tasks = { 'A', 'A', 'A', 'B', 'B', 'B' };
            int n = 2;

            int simResult = TaskSchedulerSimulator.LeastInterval(tasks, n);
            int mathResult = TaskSchedulerSimulator.LeastIntervalMath(tasks, n);

            Debug.Assert(simResult == 8, $"Simulation expected 8 but got {simResult}");
            Debug.Assert(mathResult == 8, $"Math expected 8 but got {mathResult}");

            Console.WriteLine("✔ TestTaskSchedulerStandard passed.");
        }

        private static void TestTaskSchedulerZeroCooldown()
        {
            char[] tasks = { 'A', 'A', 'A', 'B', 'B' };
            int n = 0;

            int result = TaskSchedulerSimulator.LeastInterval(tasks, n);
            Debug.Assert(result == 5);

            Console.WriteLine("✔ TestTaskSchedulerZeroCooldown passed.");
        }

        private static void TestTaskSchedulerAllDistinct()
        {
            char[] tasks = { 'A', 'B', 'C', 'D' };
            int n = 2;

            int result = TaskSchedulerSimulator.LeastInterval(tasks, n);
            Debug.Assert(result == 4);

            Console.WriteLine("✔ TestTaskSchedulerAllDistinct passed.");
        }

        private static void TestSimulationMatchesMathFormula()
        {
            char[] tasks = { 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'D' };
            int n = 2;

            int sim = TaskSchedulerSimulator.LeastInterval(tasks, n);
            int math = TaskSchedulerSimulator.LeastIntervalMath(tasks, n);

            Debug.Assert(sim == math, $"Sim {sim} did not match Math {math}");
            Console.WriteLine("✔ TestSimulationMatchesMathFormula passed.");
        }
    }
}
```

---

## 3. 🥊 PRACTICE: High-Frequency Problem Walkthroughs

### Problem: LeetCode 1046 — Last Stone Weight (Easy/Medium)

> You are given an array of integers `stones` where `stones[i]` is the weight of the $i$-th stone.
> We are playing a game with the stones. On each turn, we choose the **heaviest two stones** and smash them together. Suppose the heaviest two stones have weights `x` and `y` with $x \le y$. The result of this smash is:
> - If $x == y$, both stones are destroyed.
> - If $x < y$, the stone of weight $x$ is destroyed, and the stone of weight $y$ has new weight $y - x$.
>
> At the end of the game, there is **at most one stone left**. Return *the weight of the last remaining stone*. If there are no stones left, return `0`.

#### Production C# Implementation (Max-Heap Simulation)

```csharp
using System;
using System.Collections.Generic;

namespace AdvancedHeaps.Day111
{
    public static class LastStoneWeightSolver
    {
        public static int LastStoneWeight(int[] stones)
        {
            if (stones == null || stones.Length == 0) return 0;
            if (stones.Length == 1) return stones[0];

            // Invert comparer to create a Max-Heap
            var maxHeap = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));

            foreach (int stone in stones)
            {
                maxHeap.Enqueue(stone, stone);
            }

            while (maxHeap.Count > 1)
            {
                int y = maxHeap.Dequeue(); // Heaviest
                int x = maxHeap.Dequeue(); // Second heaviest

                if (y > x)
                {
                    int remainder = y - x;
                    maxHeap.Enqueue(remainder, remainder);
                }
            }

            return maxHeap.Count == 1 ? maxHeap.Dequeue() : 0;
        }
    }
}
```

- **Time Complexity:** $O(N \log N)$ — each smash reduces the stone count by at least 1, taking at most $N-1$ iterations with $O(\log N)$ heap pops/pushes.
- **Space Complexity:** $O(N)$ heap buffer.

---

## 4. 🔬 VERIFY: Production Quality Checklist & Daily Checkpoint

### Production Quality Verification Checklist
- [x] **Dual Container Coordination:** Max-Heap stores ready tasks; FIFO Queue stores cooling tasks.
- [x] **Zero Cooldown Fast Path:** Handled $n = 0$ as an $O(1)$ immediate return of `tasks.Length`.
- [x] **Mathematical Dual Proof:** Provided both the simulation and the closed-form math solution, verifying exact equivalence across test cases.
- [x] **Time Monotonicity:** Ensured `currentTime` increments deterministically without clock regression.

---

### 💡 Daily Checkpoint Answer

> **Question:** How does the Task Scheduler pattern use a Max-Heap to prove the greedy optimality of scheduling highest-frequency tasks first?

**Architectural Answer:**
1. **The Bottleneck Task Principle:**
   - In any scheduling problem with a cooldown constraint $n$, the task with the maximum frequency $f_{\max}$ establishes the theoretical minimum time frame:
     $$\text{Minimum Frames} = (f_{\max} - 1) \cdot (n + 1) + \text{Count}(f_{\max})$$
   - This task acts as the "scaffolding" or "frame" of the schedule.
2. **Why Lower-Frequency Tasks Cannot Fill the Gaps Later:**
   - If you greedily schedule low-frequency tasks first while holding back the highest-frequency task, the highest-frequency task's remaining count does not decrease.
   - When the low-frequency tasks run out, you will be left with many instances of the highest-frequency task and **no other tasks left to interleave between them**!
   - This forces the CPU into long, continuous stretches of $n$ idle cycles between every single remaining instance of the high-frequency task.
3. **The Max-Heap Proof:**
   - By using a **Max-Heap**, we always consume an instance of the task with the largest remaining backlog.
   - This maximizes the interleaving of other tasks into the cooldown intervals of the most frequent task, shrinking the overall backlog uniformly.
   - Therefore, the greedy choice of popping the Max-Heap at every available cycle strictly minimizes future idle starvation.
