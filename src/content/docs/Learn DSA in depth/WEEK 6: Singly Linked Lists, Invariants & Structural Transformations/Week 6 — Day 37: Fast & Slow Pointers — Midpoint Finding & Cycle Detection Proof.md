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


### 1.1 The Concept: Relative Velocity in Pointer Traversal

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
