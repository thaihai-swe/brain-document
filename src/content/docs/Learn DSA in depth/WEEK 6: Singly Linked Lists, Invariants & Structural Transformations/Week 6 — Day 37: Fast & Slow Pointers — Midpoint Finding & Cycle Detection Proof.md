---
title: "Week 6 — Day 37: Fast & Slow Pointers — Midpoint Finding & Cycle Detection Proof"
---

In **Day 36**, we established the memory realities of linked lists on the managed heap, explored pointer chasing, and mastered the **Sentinel Dummy Node Invariant** and **Iterative 3-Pointer Reversals**.

Today, we unlock one of the most celebrated algorithmic techniques in computer science: **Fast & Slow Pointers (Floyd's Tortoise & Hare Algorithm)**.

Using two pointers moving at different velocities ($2v$ vs $v$), we can locate list midpoints in a single pass without knowing the list length, detect cyclic infinite loops in linear time without allocating hash sets, and locate the **exact cycle entrance** using an elegant proof in modular arithmetic.

---

## 1. 🧠 TEACH: The Mechanics of Asymmetric Pointer Speeds

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **Floyd's Cycle-Finding Algorithm (Tortoise and Hare)** coordinates two pointers moving at asymmetric velocities (`slow` advances 1 step, `fast` advances 2 steps) to detect cycles and locate midpoints.
  - *Core Invariants:* Floyd's Convergence Invariant: Inside a cycle of length $C$, the relative gap between `fast` and `slow` decreases by 1 step per iteration ($2k - k = k \pmod C$), guaranteeing they meet in $\le C$ steps; Cycle Entrance Invariant: $L = (k \times C) - X$, where $L$ is distance from head to entrance and $X$ is distance from entrance to meeting point.
  - *Misconception Check:* Resetting `slow` to `head` and advancing both at 1 step is *not* a magic coincidence; it is a rigorous algebraic identity ($L \equiv -X \pmod C$) proving they will collide precisely at the entrance node.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the $O(N)$ auxiliary hash set memory typically used to track visited node addresses.
  - *Complexity Advantage:* Reduces memory complexity from $O(N)$ to strictly $O(1)$ auxiliary space while retaining optimal $O(N)$ time.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Linked List Cycle" (LC 141), "Linked List Cycle II" (LC 142), "Middle of the Linked List" (LC 876), "Find the Duplicate Number" (LC 287). Signal words: "detect cycle in list", "find cycle start node", "find middle node in one pass".
  - *When to Avoid / Failure Modes:* If the collection is an array and values are outside the $[1 .. N]$ range (Floyd's cycle detection on arrays requires value-as-pointer indexing).
- **4. WHERE:**
  - *Physical CLR Memory:* Two reference pointers (`slow`, `fast`) in CPU registers; zero heap memory allocations.
  - *Production Systems:* Deadlock detection in resource allocation wait-for graphs, routing loop detection in distributed network protocols (BGP split horizon).
- **5. WHO:**
  - *Spoken Script:* "Floyd's Tortoise and Hare algorithm uses slow moving 1 step and fast moving 2 steps. The gap closes by 1 step every iteration inside a cycle, guaranteeing they meet in $O(N)$ time. Once they meet, resetting slow to head and advancing both at 1 step guarantees they meet at the cycle entrance because $L = kC - X$."
  - *Interviewer Evaluation Lens:* Verifies formal mathematical proof of the entrance formula, loop condition `fast != null && fast.next != null`, and clean midpoint initialization.
- **6. HOW:**
  - *Cost Model:* Cycle Detection: $O(N)$ time, $O(1)$ space; Cycle Entrance: $O(N)$ time, $O(1)$ space; Midpoint: $O(N)$ time ($N/2$ steps), $O(1)$ space.
  - *State Transition Trace (Detect Cycle):* `slow=head, fast=head; while(fast?.next != null) { slow = slow.next; fast = fast.next.next; if (slow == fast) break; }`.


### 1.1 Physical Mental Model: The Circular Running Track & Relative Velocity

Floyd's Fast-Slow Pointer algorithm (Tortoise and Hare) is fundamentally identical to two runners on a circular athletics track connected to an entry pathway:

```
       ======================================================================
         PHYSICAL ANALOGY: TWO RUNNERS ON A TRACK (TORTOISE & HARE)
       ======================================================================

                   Straight Tunnel (Length L)
       Start                                  Cycle Entrance (Node E)
       [ 0 ] ------> [ 1 ] ------> [ 2 ] ------> [ 3 ] <----------------+
                                                   |                    |
                                                   v                    |
                                                 [ 4 ]                  |
                                                   |         Loop Arc   |
                                                   v         (Circum = C)
                                                 [ 5 ]                  |
                                                   |                    |
                                                   v                    |
                                          Meeting Point M: [ 6 ] -------+
                                           Distance from E to M = X
                                           Distance from M to E = C - X
```

```
       ======================================================================
           RELATIVE VELOCITY: WHY THE HARE CANNOT LEAP OVER THE TORTOISE
       ======================================================================

       Hare speed:     v_fast = 2 nodes/step
       Tortoise speed: v_slow = 1 node/step
       Gap closing rate: v_rel = 2 - 1 = 1 node/step!

       Inside a loop of length C, Hare is chasing Tortoise from behind.
       Because the gap decreases by EXACTLY 1 node every tick:
       - Distance: 5 -> 4 -> 3 -> 2 -> 1 -> 0 (COLLISION!).
       - It is physically impossible for fast to jump over slow without meeting!
```

```
       ======================================================================
           THE CYCLE ENTRANCE EQUATION: L = k*C - X
       ======================================================================

       Runner A starts at Head (Node 0) and walks L steps ---> Lands on E!
       Runner B starts at Meeting M (Node 6) and walks L steps:
         L steps from M = (k*C - X) steps forward.
         Since M is at distance X inside the loop, (X + k*C - X) = k*C full laps!
         Lands EXACTLY on the entrance node E at the same second!
```

---

### 1.2 The Concept: Relative Velocity in Pointer Traversal

Place two pointers at the `head` of a linked list:
- `slow`: advances 1 node per iteration ($v_{\text{slow}} = 1$).
- `fast`: advances 2 nodes per iteration ($v_{\text{fast}} = 2$).

$$\mathbf{v_{\text{relative}} = v_{\text{fast}} - v_{\text{slow}} = 2 - 1 = 1 \text{ node/step}}$$

Because the relative velocity is strictly **$1$ node per step**:
1. In an **acyclic list**, when `fast` reaches the end ($2D$), `slow` has traversed exactly half that distance ($D$).
2. In a **cyclic list**, every step `fast` takes closes the gap between it and `slow` by exactly **$1$ node**. It cannot skip over or leap past `slow`!

---

### 1.2 Midpoint Finding in a Single Pass (Odd vs. Even Parity)

Finding the middle of a linked list in a single pass is the core sub-routine of **Merge Sort on Lists** and **Palindrome List Verification**.

#### Parity Invariant 1: Odd Length ($N = 5$)
`[ 1 -> 2 -> 3 -> 4 -> 5 -> null ]`

```
Initial: slow = 1, fast = 1
Step 1:  slow = 2, fast = 3
Step 2:  slow = 3, fast = 5
Condition: fast.next == null -> LOOP TERMINATES!
slow points directly to 3 (Exact middle node!).
```

#### Parity Invariant 2: Even Length ($N = 6$)
`[ 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> null ]`

```
Initial: slow = 1, fast = 1
Step 1:  slow = 2, fast = 3
Step 2:  slow = 3, fast = 5
Step 3:  slow = 4, fast = null
Condition: fast == null -> LOOP TERMINATES!
slow points to 4 (Second middle node, standard LeetCode 876 convention).
```

#### The Safe Loop Guard:
To prevent `NullReferenceException` on `fast.next.next`:
$$\mathbf{\text{while } (fast \ne null \ \&\& \ fast.next \ne null)}$$
- If $N$ is even, `fast` becomes `null` and the first condition halts the loop.
- If $N$ is odd, `fast.next` becomes `null` and the second condition halts the loop.

---

### 1.3 The Cycle Detection Mathematical Proof (Floyd's Phase 1)

Suppose a linked list contains a cycle:

```
Head                                Entrance
 ◯ ───► ◯ ───► ◯ ─────────────► ◯ ◄──────────┐
 └─── Distance F ─────────────┘ │             │
                                ▼             │
                                ◯             ◯ (Cycle Length C)
                                │             │
                                ▼             │
                                ◯ ──────────► ◯
```

- Let $F$ be the distance from `head` to the cycle entrance.
- Let $C$ be the circumference (number of nodes) of the cycle.

#### What happens when `slow` enters the cycle?
- `slow` takes $F$ steps to reach the entrance.
- During these $F$ steps, `fast` took $2F$ steps total.
- Since `fast` entered the cycle after $F$ steps, it has been running in circles for the remaining $F$ steps.
- At the moment `slow` enters the cycle, `fast` is at position:
  $$\text{fastPosition} = F \pmod C$$
- The distance `fast` needs to "catch up" to `slow` from behind is:
  $$\text{Gap} = C - (F \pmod C) < C$$
- Since `fast` closes the gap by **$1$ node on every iteration**, it will collide with `slow` in exactly $\text{Gap}$ more steps!
- **Total Steps before Collision $\le F + C \implies \mathbf{O(N)}$ Linear Time.**
- Space complexity is strictly **$O(1)$** (no hash table of visited nodes!).

---

### 1.4 The Cycle Entrance Proof (Floyd's Phase 2)

Once `slow` and `fast` collide at some meeting node $M$, how do we find the **cycle entrance**?

```
Head                  Entrance                    Meeting Point M
 ◯ ─────── ... ───────► ◯ ─────────── ... ───────────► ◯
 └─── Distance a ─────┘ └─── Distance b ─────────────┘
                        ▲                             │
                        │                             │
                        └──────── Distance c ─────────┘
                        (Note: Cycle circumference C = b + c)
```

Let:
- $a$ = distance from `head` to the cycle entrance.
- $b$ = distance from the cycle entrance to the meeting point $M$.
- $c$ = distance from $M$ back to the cycle entrance (so $b + c = C$).

#### The Algebraic Derivation:
At the moment of collision:
1. Total distance traveled by `slow`:
   $$D_{\text{slow}} = a + b$$
2. Total distance traveled by `fast`:
   $$D_{\text{fast}} = a + b + k \cdot C \quad (\text{where } k \ge 1 \text{ is the number of full cycle loops})$$
3. Because `fast` travels at twice the speed of `slow`:
   $$D_{\text{fast}} = 2 \cdot D_{\text{slow}}$$
   $$a + b + k \cdot C = 2(a + b)$$
   $$k \cdot C = a + b$$
   $$\mathbf{a = k \cdot C - b}$$
4. Decomposing $k \cdot C - b$:
   $$a = (k - 1) \cdot C + (C - b)$$
   Since $C - b = c$:
   $$\mathbf{a = (k - 1) \cdot C + c}$$

#### The Profound Geometric Truth:
> **The distance from the `head` to the entrance ($a$) is IDENTICALLY EQUAL to the distance from the meeting point $M$ to the entrance ($c$), plus $(k - 1)$ full cycle revolutions!**

#### The Algorithm for Phase 2:
1. Keep `fast` at the meeting point $M$.
2. Reset `slow` back to the `head`.
3. Advance **both pointers at speed 1** (one step per iteration).
4. After walking $a$ steps:
   - `slow` arrives at the cycle entrance (having traveled distance $a$).
   - `fast` arrives at the cycle entrance (having traveled distance $c$ plus $(k-1)$ full loops).
5. **They collide at the exact cycle entrance node!**

---

### 1.5 Interview Spoken Drill (20–30 Seconds)

> *"To detect a cycle in $O(N)$ time and $O(1)$ space, I advance slow by one and fast by two. Inside a cycle, fast closes the gap by one node per step, guaranteeing collision. Once they meet, I reset slow to the head and keep fast at the meeting point, advancing both at speed 1. Mathematically, the distance from head to entrance equals the distance from the meeting point to entrance modulo cycle length. Therefore, their second collision point is guaranteed to be the exact cycle entrance."*

---

### 1.6 ⚙️ Core Operations Deep-Dive: Fast & Slow Pointer Convergence & Cycle Entrance Resolution

#### Dimension 1: Operation Contract & Big-O Bounds

##### Runner Operations (`MiddleNode`, `HasCycle`, `DetectCycle`)
- **Signatures:**
  - `public ListNode MiddleNode(ListNode head)`: Locates middle node (second middle for even lengths) in one pass.
  - `public bool HasCycle(ListNode head)`: Determines if a cyclic back-edge exists.
  - `public ListNode DetectCycle(ListNode head)`: Locates exact entry node of the cycle, or returns `null` if acyclic.
- **Preconditions:**
  - `head` is the entry point of a singly linked list (may be empty, finite, or contain a directed cycle).
  - Graph out-degree $\le 1$ for all nodes.
- **Postconditions:**
  - Zero modifications to node structures or values (strictly read-only traversal).
  - Deterministic return of the entrance node without modifying pointers.
- **Complexity Bounds:**

| Operation | Time Complexity | Auxiliary Space | Max Pointer Steps |
| :--- | :--- | :--- | :--- |
| **`MiddleNode`** | $O(N)$ ($\approx N/2$ slow hops) | $O(1)$ | $N$ hops by `fast` |
| **`HasCycle`** | $O(N)$ ($a + C$ steps) | $O(1)$ | $\le 2(a + C)$ steps |
| **`DetectCycle`** | $O(N)$ ($a + C + a$ steps) | $O(1)$ | $\le 3N$ total steps |

---

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree

```
                   Floyd's Cycle Finding & Entrance Detection
                                       │
                           [slow = head; fast = head]
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 │
           [fast != null && fast.next != null?]         │
                      │                                 │
           ┌──────────┴──────────┐                      │
          YES                    NO                     │
           │                     │                      │
     [slow = slow.next;          └──────────────► [Return null: Acyclic]
      fast = fast.next.next]
           │
           ▼
     [slow == fast?] ───NO───► Loop back to [fast != null...]
           │
          YES (Phase 1 Collision Confirmed!)
           │
           ▼
     [slow = head]
           │
           ▼
     [slow == fast?]
           │
     ┌─────┴─────┐
    YES          NO
     │           │
     │     [slow = slow.next;
     │      fast = fast.next]
     │           │
     │           └──► Loop back to [slow == fast?]
     ▼
[Return slow: Cycle Entrance Node]
```

---

#### Dimension 3: Visual ASCII State Transitions

##### 1. Midpoint Traversal: Odd vs Even
```
Odd Length (5 nodes):
Step 0:  S, F -> [1] -> [2] -> [3] -> [4] -> [5] -> null
Step 1:          [1] -> S   -> [2] -> F   -> [3] -> [4] -> [5] -> null
Step 2:          [1] -> [2] -> S   -> [3] -> [4] -> F   -> [5] -> null
Terminates: fast.next == null. Slow is exactly at [3] (unique middle).

Even Length (6 nodes):
Step 0:  S, F -> [1] -> [2] -> [3] -> [4] -> [5] -> [6] -> null
Step 1:          [1] -> S   -> [2] -> F   -> [3] -> [4] -> [5] -> [6] -> null
Step 2:          [1] -> [2] -> S   -> [3] -> [4] -> F   -> [5] -> [6] -> null
Step 3:          [1] -> [2] -> [3] -> S   -> [4] -> [5] -> [6] -> F (null)
Terminates: fast == null. Slow is exactly at [4] (second middle).
```

##### 2. Cycle Catch-Up Relative Distance Decay
```
Cycle of length C = 6:
Let distance d be the number of steps fast is behind slow inside cycle.

Step t:   fast is at pos 1, slow is at pos 4  ===> Gap = 3
Advance:  fast hops 2 (to pos 3), slow hops 1 (to pos 5)
Step t+1: fast is at pos 3, slow is at pos 5  ===> Gap = 2
Advance:  fast hops 2 (to pos 5), slow hops 1 (to pos 6)
Step t+2: fast is at pos 5, slow is at pos 6  ===> Gap = 1
Advance:  fast hops 2 (to pos 1), slow hops 1 (to pos 1)
Step t+3: fast is at pos 1, slow is at pos 1  ===> Gap = 0 (Collision!)
```

---

#### Dimension 4: Invariant Preservation Proof

##### Theorem 1: Floyd's Relative Velocity Collision Lemma
Let a linked list have non-cycle prefix length $a \ge 0$ and cycle circumference $C \ge 1$.
1. **Entry Guarantee:**
   `slow` enters the cycle at time $t_0 = a$. At this instant, `fast` is already within the cycle, having taken $2a$ total steps ($a$ steps past the entrance).
   The initial distance from `fast` to `slow` along the directed cycle edges is:
   $$d_0 = (C - (a \pmod C)) \pmod C < C$$
2. **Strict Gap Monotonicity:**
   In each step $t \ge t_0$, `slow` advances by 1 and `fast` advances by 2.
   The directed distance $d_t$ remaining for `fast` to catch `slow` changes as:
   $$d_{t+1} = (d_t - 2 + 1) \pmod C = (d_t - 1) \pmod C$$
   Since $d_0 < C$ and the gap decreases by strictly 1 at every step, $d_t = 0$ must occur after exactly $d_0$ steps.
   Because $d_0 < C$, collision occurs before `slow` completes a single revolution of the cycle.
   $$\text{Total Time to Collision } T_{\text{phase 1}} = a + d_0 \le a + C = O(N)$$

##### Theorem 2: Cycle Entrance Equivalence
From the algebraic relation:
$$D_{\text{fast}} = 2 \cdot D_{\text{slow}} \implies a + b + k \cdot C = 2(a + b) \implies a = (k - 1)C + (C - b)$$
Since $C - b = c$ (the distance from collision point $M$ to cycle entrance):
$$a = (k - 1)C + c$$
When pointer $P_1$ starts at `head` and pointer $P_2$ starts at $M$, advancing both at speed 1:
- After $a$ steps, $P_1$ travels distance $a$, landing exactly on the cycle entrance.
- After $a$ steps, $P_2$ travels distance $c + (k - 1)C$, which represents $c$ steps to reach the entrance plus $(k-1)$ full revolutions, landing identically on the entrance.
- Therefore, $P_1$ and $P_2$ intersect at the entrance node with zero false positives.

---

#### Dimension 5: Edge Case Matrix

| Edge Case | State / Input | Algorithmic Behavior | Invariant Preservation |
| :--- | :--- | :--- | :--- |
| **Empty List** | `head == null` | `fast != null` check fails immediately; returns `null` / `false` | Safe early termination without dereferencing |
| **Single Node (No Cycle)** | `head.next == null` | Loop condition `fast.next != null` fails; returns `false` / `null` | Evaluates in $O(1)$ time |
| **Single Node Self-Cycle** | `head.next == head` | `slow` moves to `head`, `fast` moves to `head`; collision on step 1 | Detects cycle instantly; entrance identified as `head` |
| **Cycle Entrance at Head** | $a = 0$ | $a = (k-1)C + c \implies c = 0$. Meeting point $M$ is `head` | Phase 2 resets `slow` to `head`; `slow == fast` initially holds, returns `head` |
| **Even List First Middle Needed** | $N$ is even, want first middle | Condition becomes `while (fast.next != null && fast.next.next != null)` | Slow stops at $\frac{N}{2}$ instead of $\frac{N}{2} + 1$ |

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

---

### Problem 1: LeetCode 876 — Middle of the Linked List (Easy)

> Given the `head` of a singly linked list, return the middle node of the linked list. If there are two middle nodes, return the **second middle node**.

#### Production C# Implementation:
```csharp
public class SolutionMiddleNode {
    public ListNode MiddleNode(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;

        // When fast reaches end (null or fast.next is null), slow is at middle
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }

        return slow; // Points to the middle (or second middle if even)
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — single pass; `fast` touches $N$ nodes, `slow` touches $N/2$ nodes.
- **Space Complexity:** $O(1)$ — two scalar pointer references.

---

### Problem 2: LeetCode 141 — Linked List Cycle (Easy)

> Given `head`, the head of a linked list, determine if the linked list has a cycle in it. Return `true` if there is a cycle, otherwise `false`. Solve in $O(1)$ memory.

#### Production C# Implementation:
```csharp
public class SolutionHasCycle {
    public bool HasCycle(ListNode head) {
        if (head == null || head.next == null) return false;

        ListNode slow = head;
        ListNode fast = head;

        // Guard against null references when approaching end of acyclic list
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;

            if (slow == fast) {
                return true; // Fast caught slow from behind -> Cycle exists!
            }
        }

        return false; // Fast reached null -> Acyclic list
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — at most $F + C$ steps.
- **Space Complexity:** $O(1)$ — zero auxiliary memory.

---

### Problem 3: LeetCode 142 — Linked List Cycle II (Medium)

> Given the `head` of a linked list, return the node where the cycle begins. If there is no cycle, return `null`. Solve without modifying the list and using $O(1)$ memory.

#### Visual Step-by-Step Trace:
`head = [3 -> 2 -> 0 -> -4 -> (loops back to 2)]`
- $a = 1$ (distance from 3 to entrance 2)
- Cycle: `[2, 0, -4]`, length $C = 3$.

```
Phase 1: Detect Collision
 Initial: slow = 3, fast = 3
 Step 1:  slow = 2, fast = 0
 Step 2:  slow = 0, fast = 2
 Step 3:  slow = -4, fast = -4  --> COLLISION at node -4!

Phase 2: Find Entrance
 Reset: p1 = head (node 3), p2 = meetingPoint (node -4)
 Walk both at speed 1:
 Step 1:
  p1 moves from 3 -> 2
  p2 moves from -4 -> 2
  p1 == p2! Collision at node 2!

Return node 2 (Cycle Entrance). Correct!
```

#### Production C# Implementation:
```csharp
public class SolutionDetectCycleII {
    public ListNode DetectCycle(ListNode head) {
        if (head == null || head.next == null) return null;

        ListNode slow = head;
        ListNode fast = head;

        // Phase 1: Determine if cycle exists
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;

            if (slow == fast) {
                // Phase 2: Locate cycle entrance
                ListNode p1 = head;
                ListNode p2 = slow;

                while (p1 != p2) {
                    p1 = p1.next;
                    p2 = p2.next;
                }

                return p1; // Both meet at the cycle entrance
            }
        }

        return null; // Acyclic list
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — Phase 1 takes $\le F + C$ steps; Phase 2 takes $F$ steps. Total operations $< 2N = O(N)$.
- **Space Complexity:** $O(1)$ — auxiliary space.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master fast & slow pointers on LeetCode:

### Problem 1 (Midpoint Extraction): LeetCode 876 — Middle of the Linked List (Easy)
- **Goal:** Find the middle node in a single pass without computing list length.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 2 (Cycle Detection): LeetCode 141 — Linked List Cycle (Easy)
- **Goal:** Implement Floyd's Tortoise & Hare Phase 1 with strict `null` guards.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 3 (Entrance Locator): LeetCode 142 — Linked List Cycle II (Medium)
- **Goal:** Implement Phase 2 to locate the cycle entrance in $O(1)$ space.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Bonus / Extension Challenge: LeetCode 287 — Find the Duplicate Number (Medium)
- **Goal:** Given an array `nums` of length $N + 1$ with integers in $[1, N]$, find the duplicate without modifying the array and using $O(1)$ space.
- **Hint:** Treat the array as a functional linked list where $index \to nums[index]$! Because there are $N + 1$ elements mapping to $1 \dots N$, at least two indices point to the same value $\implies$ a cycle exists! Use Floyd's algorithm on array indices!

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                     Fast & Slow Pointer Applications                   │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Find exact midpoint in single pass ───────► Fast (2x), Slow (1x) [LC 876]
                   │
                   ├─► Detect infinite loop in list / graph ─────► Floyd's Phase 1 Collision [LC 141]
                   │
                   ├─► Find cycle entrance node ─────────────────► Floyd's Phase 2 Reset Walk [LC 142]
                   │
                   ├─► Find duplicate in array [1 .. N] ─────────► Map Array as Linked List [LC 287]
                   │                                               (index -> nums[index])
                   │
                   └─► Test if list is Palindrome in O(1) space ─► Midpoint + Reverse 2nd Half (Day 38)
                                                                   [LC 234]
```

### Preview for Day 38: In-Place Reversals & Palindrome Lists
Today we analyzed pointer speeds and cycles.
Tomorrow in **Day 38**, we combine **Midpoint Finding (Day 37)** with **3-Pointer Reversal (Day 36)** to conquer **Palindrome Linked Lists** in $O(N)$ time and $O(1)$ space, and master partial subsegment reversals (**Reverse Linked List II**)!

---

## 5. 🎯 Day 37 Checkpoint Questions

Verify your depth in Floyd's algorithm with these 4 questions:

1. **Midpoint Split Parity:** If you are preparing to split a linked list for Merge Sort, you need `slow` to stop at the **first middle** for even lengths (e.g. at node 2 in `[1, 2, 3, 4]`). How must you adjust the loop condition from `while (fast != null && fast.next != null)`?
2. **The Fast Leap Trap:** Could `fast` ever "jump over" `slow` inside the cycle without colliding? Why is this mathematically impossible when $v_{\text{fast}} = 2$ and $v_{\text{slow}} = 1$?
3. **Phase 2 Revolution Offset:** In Floyd's Phase 2, if the cycle is very small ($C = 2$) and the distance to the entrance is large ($a = 100$), how many revolutions around the cycle will `fast` make before `slow` arrives at the entrance?
4. **Array Reduction (LC 287):** Why is index `0` guaranteed never to be part of the cycle when mapping `nums` as a linked list in LeetCode 287?
