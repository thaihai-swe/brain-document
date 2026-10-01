---
title: "Week 8 — Day 50: Stack Memory Architecture, Array-Backed Stacks, From-Scratch Implementations (Array vs. Linked List) & Parentheses Matching"
---

Welcome to **Week 8: Stack Call Semantics, Monotonic Stacks & Expression Parsing**!

Having conquered contiguous arrays, strings, and linked list cache architectures in Weeks 1–7, we now embark on the algorithmic power of **LIFO (Last-In-First-Out) Abstract Data Types**:
1. **The Physical Reality of the Stack:** CPU thread call stacks, `RSP`/`RBP` register manipulation, stack activation frames, and the mechanical cause of `StackOverflowException`.
2. **From-Scratch Container Implementations:** Building both a **Dynamic Array-Backed Stack (`ArrayStack<T>`)** and a **Singly-Linked Node Stack (`LinkedStack<T>`)** in C#, analyzing memory layout, geometric doubling, shrink heuristics, and Garbage Collector reference loitering.
3. **Architectural Trade-Off Analysis:** Contiguous cache-line locality vs. pointer chasing, per-push heap allocation churn, and amortized $O(1)$ vs. strict worst-case $O(1)$ latency guarantees.
4. **The Delimiter State Machine ([LeetCode 20]):** The "Push Expected Closer" optimization for parenthesis matching.
5. **Historical Extrema Tracking in $O(1)$ Time ([LeetCode 155]):** Designing a `MinStack` that tracks minimums across pops without recalculation.
6. **Path Canonicalization ([LeetCode 71]):** Modeling hierarchical directory navigation using a tokenized LIFO stack.

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* The **Stack Abstract Data Type (ADT)** is a linear LIFO (Last-In, First-Out) collection where insertions and removals occur exclusively at a single end termed the `Top`.
  - *Core Invariants:* LIFO Access Invariant: The most recently pushed element is the first element removed; Parenthesis Nesting Invariant: Every closing symbol must match the top of the stack, which represents the most recently opened unmatched scope.
  - *Misconception Check:* A stack is *not* simply an array. An array allows $O(1)$ random indexing across all elements; a stack enforces an encapsulation contract restricting operations to `Push`, `Pop`, and `Peek` in strictly $\Theta(1)$ time.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the need to track multi-level nested scopes or recursion unwindings manually.
  - *Complexity Advantage:* Validates nested grammars, expression scopes, and call frames in strict $O(N)$ linear time and $O(N)$ space.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Valid Parentheses" (LC 20), call stack execution, undo/redo buffers, evaluating postfix expressions, reverse order processing. Signal words: "LIFO", "valid parentheses", "nested matching", "reverse order".
  - *When to Avoid / Failure Modes:* When elements must be processed in arrival order (FIFO; use a Queue) or accessed arbitrarily by rank/index (use an Array).
- **4. WHERE:**
  - *Physical CLR Memory:* Hardware Thread Call Stack (stack frames, activation records, local value types) vs. CLR Heap `ArrayStack<T>`. In array-backed stacks, prevent reference loitering upon `Pop()` with `_items[--_size] = default(T)!` to permit GC reclamation.
  - *Production Systems:* CPU execution stack, JVM/CLR execution engines, compiler syntax tree parsers, browser navigation back-stacks.
- **5. WHO:**
  - *Spoken Script:* "A stack enforces strict LIFO access. In parenthesis matching, each closing bracket must pair with the most recent open bracket, making the stack top the natural boundary to validate nesting in $O(N)$ time and $O(N)$ space."
  - *Interviewer Evaluation Lens:* Evaluates candidate's understanding of call stack memory vs. heap data structure, fail-fast versioning enumerator mechanics, and reference loitering defense (`default(T)`).
- **6. HOW:**
  - *Cost Model:* Push: $O(1)$ amortized; Pop: $O(1)$; Peek: $O(1)$; Space: $O(N)$.
  - *State Transition Trace (Valid Parentheses):* `s="([{}])" -> seen '(' push -> seen '[' push -> seen '{' push -> seen '}' matches top '{' pop -> seen ']' matches top '[' pop -> seen ')' matches top '(' pop -> stack empty => valid!`.

### ⚖️ Architectural Comparison: Stack vs. Queue vs. Deque
| Dimension | Stack (`LIFO`) | Queue (`FIFO`) | Deque (Double-Ended Queue) |
| :--- | :--- | :--- | :--- |
| **Access Discipline** | **Last-In, First-Out:** Entry and exit through `Top` only | **First-In, First-Out:** Entry at `Tail`, exit at `Head` | **Bidirectional:** Entry and exit at both `Front` and `Back` |
| **Active Access Points** | 1 point (`Top`) | 2 points (`Head` and `Tail`) | 2 points (`Front` and `Back`) |
| **Optimal Array Implementation** | Dynamic array: push/pop at index `Count - 1` | Circular Ring Buffer: modular arithmetic `(tail + 1) % Cap` | Circular Ring Buffer: bidirectional modular arithmetic |
| **Optimal Linked Implementation**| Singly linked list: push/pop at `Head` | Singly linked list: enqueue at `Tail`, dequeue at `Head` | Doubly linked list with sentinel dummy nodes |
| **Primary Invariants** | Top element always reflects the most recently observed active state | Order of dequeue matches chronological order of enqueue | Elements can be inspected and pruned from both extremities |
| **Canonical Algorithmic Patterns**| 1. Monotonic Stack (Next Greater/Smaller element)<br>2. Parentheses & syntax parsing<br>3. Recursive call-stack emulation<br>4. Depth-First Search (DFS) | 1. Breadth-First Search (BFS) level wavefronts<br>2. Task buffering & rate limiting<br>3. Producer-Consumer streaming | 1. Monotonic Deque (Sliding Window Min/Max)<br>2. 0-1 BFS shortest paths<br>3. Maximum constrained subsequence DP |

---

### 1.1 Physical Mental Model — Cafeteria Plate Dispensers & Russian Nesting Dolls

**Analogy 1 — The Stack ADT: Spring-Loaded Cafeteria Plate Dispenser**

Imagine the spring-loaded plate dispenser at a cafeteria buffet:
- Clean plates are placed on top, pushing the spring down (`Push`).
- Diners can only pick up the **topmost plate** (`Pop` or `Peek`).
- The plate at the very bottom of the tube (the first plate washed at 6:00 AM) cannot be accessed until every single plate stacked on top of it has been taken!
- **LIFO Rule (Last-In, First-Out):** The last plate placed on the dispenser is the very first plate taken by a diner.

```
SPRING-LOADED PLATE TUBE:
          ┌─────────────┐
          │  Plate [C]  │  <-- TOP (Most recent: Pop/Peek here!)
          ├─────────────┤
          │  Plate [B]  │
          ├─────────────┤
          │  Plate [A]  │  <-- BOTTOM (First inserted, buried deepest)
          └──────┬──────┘
             [ SPRING ] (Pushes upward)
```

---

**Analogy 2 — Valid Parentheses: Russian Matryoshka Nesting Dolls**

Parentheses matching is just assembling nested Russian dolls:
- An opening bracket `(`, `[`, `{` is placing down an open doll shell.
- A closing bracket `)`, `]`, `}` is putting the lid on!
- **The Golden Nesting Rule:** You can only put a lid on the **most recently opened shell**!
  - If you open `{`, then open `[`, the very next lid MUST be `]` to close the inner doll before you can close the `{` outer doll!
  - If you try to close `{` with `]`, the sizes mismatch $\implies$ **Syntax Error!**

```
Matching s = " { [ ] } ":
1. Read '{': Push '{' onto stack.        Stack: [ '{' ]
2. Read '[': Push '[' onto stack.        Stack: [ '{', '[' ]
3. Read ']': Matches top '['! Pop '['!   Stack: [ '{' ]
4. Read '}': Matches top '{'! Pop '{'!   Stack: [] (Empty!)
Result: Stack is completely empty -> VALID! 🎉
```

---

**Hardware Call Stack vs. Heap ArrayStack Memory Layout:**

```
Hardware Thread Stack (Grows DOWN):     Heap ArrayStack<T> (Contiguous Array):
High Memory: 0x7FFF_FFFF_0000           _items buffer on managed heap:
┌───────────────────────────────┐       Index:    [ 0 ]   [ 1 ]   [ 2 ]   [ 3 ]
│ Main() Frame                  │       Content:  [ A ]   [ B ]   [ C ]   [null]
├───────────────────────────────┤                                   ▲
│ Foo() Frame (RBP)             │                            _size = 3 (Top is idx 2)
├───────────────────────────────┤
│ Bar() Frame (RSP: Top of stack)│      Push: _items[_size++] = item;
└───────────────────────────────┘       Pop:  item = _items[--_size];
                                              _items[_size] = default(T)! (Prevent loitering!)
```

---

### 1.2 The Stack ADT Contract & LIFO Invariant

The **Stack** is a linear collection governed by the **LIFO (Last-In-First-Out)** discipline:
$$\text{LIFO Invariant: } \text{The most recently added element that has not yet been removed is the next element to be accessed or removed.}$$

Mathematically, for any sequence of operations, if element $x$ is pushed before element $y$, and both remain in the stack, $y$ must be popped before $x$:
$$\text{Push}(x) \prec \text{Push}(y) \implies \text{Pop}(y) \prec \text{Pop}(x)$$

#### Essential ADT Operations & Complexity Targets:
- **`Push(T item)`:** Inserts an element onto the top of the stack. Target: $O(1)$ time.
- **`Pop()`:** Removes and returns the element currently at the top. Target: $O(1)$ time. Throws if empty.
- **`Peek()`:** Returns the element currently at the top without removing it. Target: $O(1)$ time. Throws if empty.
- **`TryPop(out T item)` / `TryPeek(out T item)`:** Non-throwing defensive query primitives. Target: $O(1)$ time.
- **`IsEmpty` / `Count`:** State inspection properties. Target: $O(1)$ time.
- **`Clear()`:** Resets the stack, releasing all stored references for Garbage Collection.

---

### 1.2 The Hardware Memory Stack vs. The Stack ADT

In computer systems, the term "Stack" refers to both a physical hardware mechanism and a software Abstract Data Type. Understanding both is critical for senior systems engineers.

#### The CPU Hardware Call Stack:
Every operating system thread is allocated a contiguous block of virtual memory called the **Call Stack** (typically 1 MB default on Windows CLR, 8 MB on macOS/Linux).
- Two dedicated CPU registers manage this memory:
  - **`RSP` (Stack Pointer):** Points to the top-most active address in the thread's stack.
  - **`RBP` (Base/Frame Pointer):** Points to the base address of the currently executing function's stack frame.
- **Pushing a Stack Frame:** When function `Foo()` calls `Bar()`, the CPU executes a hardware `CALL` instruction:
  1. The return instruction pointer (`RIP`) is pushed onto the stack (`RSP` decrements by 8 bytes on x86-64).
  2. The caller's `RBP` is saved on the stack.
  3. `RSP` decrements further to allocate space for `Bar`'s local variables and parameters.
- **Why Hardware Stack Allocation is Instantaneous:** Allocating 128 bytes on the stack requires a single CPU clock cycle instruction: `sub rsp, 128`. There are no heap data structure traversals, no thread locks, and no Garbage Collection cycles!
- **`StackOverflowException`:** If a recursive algorithm lacks a termination base case, `RSP` continually decrements until it hits the thread's **Guard Page** (an uncommitted memory boundary). The CPU memory management unit (MMU) catches the page fault and aborts the process immediately with an unrecoverable `StackOverflowException`.

```
High Virtual Memory (0x7FFF_FFFF_FFFF)
┌──────────────────────────────────────────────┐
│ Main() Activation Frame                      │
├──────────────────────────────────────────────┤
│ Foo() Activation Frame                       │
├──────────────────────────────────────────────┤
│ Bar() Activation Frame                       │ ◄── RBP (Base Frame Pointer)
│   - Local variable: int counter              │
│   - Local variable: Span<byte> buffer        │
│   - Saved Return Address (RIP)               │ ◄── RSP (Stack Pointer)
├──────────────────────────────────────────────┤
│                    │                         │
│                    ▼ (Grows Downward)        │
│               [Guard Page]                   │ ◄── Collision triggers StackOverflowException!
└──────────────────────────────────────────────┘
Low Virtual Memory (0x0000_0000_0000)
```

---

### 1.3 Managed Heap Representations: Array vs. Node-Pointer Chain

When implementing the Stack ADT on the managed heap, two primary backing representations exist:

```
1. Dynamic Array-Backed Stack (Contiguous Memory Buffer):
   Array in RAM:
   ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
   │ 0x10 │ 0x20 │ 0x30 │ 0x40 │ null │ null │ null │ null │
   └──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
     [0]    [1]    [2]    [3]    [4]    [5]    [6]    [7]
                           ▲
                           └── _size = 4 (Top is at _size - 1)
   • Sequential elements sit side-by-side in memory.
   • Loading index 3 into CPU cache brings indices 0-7 into the 64-byte L1 cache line!

2. Singly-Linked Node Stack (Fragmented Heap References):
   _head
     │
     ▼
   ┌───────────┐       ┌───────────┐       ┌───────────┐
   │ Val: 0x40 │       │ Val: 0x30 │       │ Val: 0x20 │
   │ Next: ────┼─────► │ Next: ────┼─────► │ Next: ────┼─────► null
   └───────────┘       └───────────┘       └───────────┘
   Address: 0x8120     Address: 0x1040     Address: 0x9480
   • Each push allocates a standalone object on the managed heap.
   • Elements are scattered across arbitrary heap memory pages ("pointer chasing").
```

---

### 1.4 State-Change Mechanics with Visual Invariant Traces

#### Trace 1: Dynamic Array Push with Capacity Expansion
Initial capacity = 2. Items = `[A, B]`. Size = 2 (Full).

```
1. Before Push('C'):
   _items: [ 'A', 'B' ]  (Capacity = 2, Size = 2)

2. Capacity Check:
   _size == _items.Length -> Triggers EnsureCapacity(3)!
   Allocate new buffer of size 4: [ null, null, null, null ]
   Array.Copy(_items, newArray, 2)
   _items points to new buffer: [ 'A', 'B', null, null ]

3. Insert & Increment:
   _items[_size] = 'C' -> _items[2] = 'C'
   _size++ -> _size = 3

4. After:
   _items: [ 'A', 'B', 'C', null ] (Capacity = 4, Size = 3)
   LIFO Invariant: Top element is _items[_size - 1] == 'C'. Valid!
```

#### Trace 2: Singly-Linked Node Push & Pop
Initial Stack: `Head -> [B] -> [A] -> null`. Size = 2.

```
1. Push('C'):
   Create newNode('C')
   newNode.Next = _head   ('C'.Next -> 'B')
   _head = newNode        (_head -> 'C')
   _count++               (_count = 3)
   After: Head -> ['C'] -> ['B'] -> ['A'] -> null. Valid!

2. Pop():
   Verify _head != null
   poppedVal = _head.Value ('C')
   _head = _head.Next      (_head -> 'B')
   _count--               (_count = 2)
   Old node ['C'] has no incoming references -> Eligible for Gen 0 GC collection!
   After: Head -> ['B'] -> ['A'] -> null. Returns 'C'. Valid!
```

---

### 1.5 Iterative DFS via Explicit Stack State Machine: Guarding Against `StackOverflowException`

In production engineering, the thread call stack is a **severely constrained resource**:
- On Windows x64, the default CLR thread stack size is **1 MB**.
- On Linux x64, the default stack size is **2 MB** (or 8 MB depending on `ulimit`).
- A recursive function frame taking 64–128 bytes (saved registers, return address, parameters, local variables) allows at most **8,000 to 15,000 recursive frames** before triggering an uncatchable `StackOverflowException`, instantly terminating the entire process.

```
Hardware Thread Call Stack (Limited to 1 MB):
┌───────────────────────────────┐  <-- RSP (Stack Pointer)
│ Frame 10,000 (Local vars)     │
├───────────────────────────────┤
│ Frame 9,999                   │
├───────────────────────────────┤
│ ...                           │
├───────────────────────────────┤
│ Frame 0 (Main)                │
└───────────────────────────────┘  CRASH! Out of stack memory -> Process killed.

Managed Heap Stack<T> (Backed by Gigabytes of Virtual Memory):
┌────────────────────────────────────────────────────────────────────────┐
│ Stack<DfsFrame> buffer in Gen 2 / LOH heap: can hold 50,000,000 frames!│
└────────────────────────────────────────────────────────────────────────┘
```

#### Emulating the Activation Record State Machine:
Any recursive algorithm can be transformed into an iterative loop using an explicit `Stack<T>` holding an activation record structure that encapsulates the node and its execution phase (instruction pointer):

```csharp
public struct DfsFrame {
    public TreeNode Node;
    public int Phase; // 0 = pre-visit, 1 = after left child, 2 = post-visit

    public DfsFrame(TreeNode node, int phase) {
        Node = node;
        Phase = phase;
    }
}

public static void SafeIterativeDFS(TreeNode root) {
    if (root == null) return;

    var stack = new Stack<DfsFrame>();
    stack.Push(new DfsFrame(root, 0));

    while (stack.Count > 0) {
        var frame = stack.Pop();
        var node = frame.Node;

        switch (frame.Phase) {
            case 0: // Pre-order action
                ProcessNode(node);
                // Push resumption frame (phase 1) before descending left
                stack.Push(new DfsFrame(node, 1));
                if (node.left != null) {
                    stack.Push(new DfsFrame(node.left, 0));
                }
                break;

            case 1: // In-order resumption
                // Push resumption frame (phase 2) before descending right
                stack.Push(new DfsFrame(node, 2));
                if (node.right != null) {
                    stack.Push(new DfsFrame(node.right, 0));
                }
                break;

            case 2: // Post-order completion
                // All children processed; unwind frame
                break;
        }
    }
}
```
**Why this matters in systems interviews:** Iterative DFS backed by heap memory transforms an algorithm vulnerable to runtime crashes on deep or degenerate input trees ($N = 10^5$) into an enterprise-safe, production-ready routine.

### 1.6 ⚙️ Core Operations Deep-Dive: LIFO Nesting Automata & Geometric Doubling Amortization

#### Dimension 1: Operation Contract & Big-O Bounds
- **Operation Signatures:**
  1. `bool IsValid(string s)`
  2. `void Push(T item)` and `T Pop()` on `ArrayStack<T>`
- **Preconditions:**
  - `s` consists solely of parentheses characters `'('`, `')'`, `'{'`, `'}'`, `'['`, `']'`.
- **Postconditions:**
  - `IsValid` returns `true` if and only if open brackets are closed by the same type of brackets in the correct LIFO order, and every close bracket has a matching open bracket.
- **Complexity Bounds:**
  - **IsValid:**
    - Time Complexity: $\Theta(N)$ — single linear pass over $N$ characters.
    - Auxiliary Space Complexity: $O(N)$ — stack stores at most $N$ characters ($N/2$ for valid strings).
  - **ArrayStack Push:**
    - Time Complexity: $O(1)$ amortized; $O(N)$ worst-case during geometric reallocation.
    - Auxiliary Space Complexity: $\Theta(C)$ where $C$ is the backing array capacity ($N \le C < 2N$).

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree
1. **Parentheses Matching State Automaton:**
   - *Parity Gate:* If `s.Length % 2 != 0`, return `false` immediately (odd length cannot be balanced).
   - Allocate `char[] stack = new char[s.Length]`, `int top = -1`.
   - Loop each character $c \in s$:
     - *Opening Bracket Rule:*
       - If $c == '(': stack[++top] = ')'$
       - If $c == '{': stack[++top] = '}'$
       - If $c == '[': stack[++top] = ']'$
     - *Closing Bracket Rule:*
       - Else:
         - If `top < 0` (stack empty) or `stack[top--] != c`:
           - Return `false` (premature close or mismatch).
   - *Final Cleanliness Check:* Return `top == -1` (unclosed opening brackets remain if `top >= 0`).

```
                         [Iterate c in string s]
                                    │
                            c is Opening Bracket?
                           /                     \
                     (Yes)/                       \(No: Closing Bracket)
                         ▼                         ▼
            Push expected closing char     top < 0 || stack[top--] != c?
            to stack (e.g. '(' -> ')')    /                             \
                         │          (Yes)/                               \(No)
                         │              ▼                                 ▼
                         │         Return false                      Continue loop
                         │                                                 │
                         └─────────────────────────────────────────────────┘
                                                   │
                                            After all chars:
                                            Return top == -1
```

#### Dimension 3: Visual ASCII State Transitions
```
STRING: "{ [ ] ( ) }"
i=0: c='{' -> Push '}' -> Stack: [ '}' ] (top=0)
i=1: c='[' -> Push ']' -> Stack: [ '}', ']' ] (top=1)
i=2: c=']' -> Closing bracket!
     top >= 0 and stack[1] == ']' -> MATCH! Pop! Stack: [ '}' ] (top=0)
i=3: c='(' -> Push ')' -> Stack: [ '}', ')' ] (top=1)
i=4: c=')' -> Closing bracket!
     top >= 0 and stack[1] == ')' -> MATCH! Pop! Stack: [ '}' ] (top=0)
i=5: c='}' -> Closing bracket!
     top >= 0 and stack[0] == '}' -> MATCH! Pop! Stack: [ ] (top=-1)
All chars processed. top == -1 (Empty stack).
Output: TRUE.
```

#### Dimension 4: Invariant Preservation Proof
- **LIFO Bracket Nesting Invariant:**
  - Let $S$ be a Dyck language string over $\{ (, ), \{, \}, [, ] \}$.
  - Any well-formed substring must satisfy: the inner-most open bracket must be matched and closed before any outer enclosing open bracket can close.
  - By pushing the *expected closing counterpart* onto a LIFO stack upon encountering an opening bracket, the top of the stack always holds the exact required character to close the most recently opened, unclosed scope.
  - Encountering any closing bracket that differs from the stack top breaks the nesting requirement immediately, proving soundness.
- **Geometric Doubling Potential Proof ($\Phi = 2 \cdot \text{size} - \text{capacity}$):**
  - When capacity doubles from $C$ to $2C$, copying takes $C$ operations.
  - In the preceding $C/2$ pushes, the potential grew by $2 \times (C/2) = C$.
  - This stored potential exactly pays for the $C$ copy operations.
  - Thus, the amortized cost per push is bounded by $1 + 2 = O(1)$.

#### Dimension 5: Edge Case Matrix
| Edge Case Scenario | Input State | Algorithmic Behavior | Invariant Preservation |
| :--- | :--- | :--- | :--- |
| **Odd Length** | `"((("` or `"{[]"` | Parity check `Length % 2 != 0` fires at step 0; returns false in $O(1)$. | Bypasses unnecessary loop allocations. |
| **Leading Closing Bracket** | `"]()"` | At $i=0$, closing bracket encountered with `top == -1`; returns false. | Immediate failure without underflow. |
| **Trailing Unclosed Bracket** | `"{[()]"` | Loop finishes without error, but `top == 0 != -1`; returns false. | Caught by `top == -1` guard. |
| **Mismatched Bracket Types** | `"(]"` | At $i=1$, expected `)` but got `]`; `stack[top--] != c` returns false. | Prevents cross-type corruption. |
| **Empty String** | `""` | Parity check passes ($0 \% 2 == 0$); loop does not execute; returns true. | Base empty string validity. |

---

## 2. 🛠️ IMPLEMENT FROM SCRATCH: Dual C# Implementations

### 2.1 Approach 1: Dynamic Array-Backed Stack (`ArrayStack<T>`)

This implementation mimics .NET's production `System.Collections.Generic.Stack<T>`, incorporating geometric capacity doubling, defensive argument checks, shrink heuristics, and fail-fast versioned enumeration.

```csharp
using System;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AdvancedDSA.Stacks {
    /// <summary>
    /// A high-performance, contiguous-array-backed LIFO stack.
    /// Provides amortized O(1) Push and O(1) Pop operations with minimal GC overhead.
    /// </summary>
    /// <typeparam name="T">The type of elements stored in the stack.</typeparam>
    public class ArrayStack<T> : IReadOnlyCollection<T> {
        private T[] _items;
        private int _size;
        private int _version;
        private const int DefaultCapacity = 4;
        private const int MaxArrayLength = 0X7FFFFFC7; // CLR limit for single-dimensional arrays

        /// <summary>
        /// Initializes a new instance with the specified initial capacity.
        /// </summary>
        public ArrayStack(int initialCapacity = DefaultCapacity) {
            if (initialCapacity < 0) {
                throw new ArgumentOutOfRangeException(nameof(initialCapacity), "Capacity cannot be negative.");
            }
            _items = initialCapacity == 0 ? Array.Empty<T>() : new T[initialCapacity];
            _size = 0;
            _version = 0;
        }

        /// <summary>Gets the number of elements contained in the stack.</summary>
        public int Count => _size;

        /// <summary>Gets a value indicating whether the stack is empty.</summary>
        public bool IsEmpty => _size == 0;

        /// <summary>Gets the total capacity of the internal buffer before resizing is required.</summary>
        public int Capacity => _items.Length;

        /// <summary>
        /// Pushes an item onto the top of the stack.
        /// Amortized O(1) time complexity; worst-case O(N) when capacity doubles.
        /// </summary>
        public void Push(T item) {
            if (_size == _items.Length) {
                EnsureCapacity(_size + 1);
            }
            _items[_size++] = item;
            _version++;
        }

        /// <summary>
        /// Removes and returns the item at the top of the stack.
        /// Throws InvalidOperationException if the stack is empty.
        /// O(1) time complexity.
        /// </summary>
        public T Pop() {
            if (_size == 0) {
                throw new InvalidOperationException("Stack underflow: collection is empty.");
            }

            _version++;
            T item = _items[--_size];

            // CRITICAL GC INVARIANT:
            // For reference types, we MUST nullify the array slot to prevent "GC Loitering".
            // If omitted, the managed heap object remains rooted by the array, leaking memory!
            _items[_size] = default(T)!;

            // Optional shrink heuristic: halve capacity if occupancy drops to <= 25% of buffer
            if (_size > 0 && _size <= _items.Length / 4 && _items.Length > DefaultCapacity) {
                Array.Resize(ref _items, Math.Max(DefaultCapacity, _items.Length / 2));
            }

            return item;
        }

        /// <summary>
        /// Returns the item at the top of the stack without removing it.
        /// Throws InvalidOperationException if the stack is empty.
        /// O(1) time complexity.
        /// </summary>
        public T Peek() {
            if (_size == 0) {
                throw new InvalidOperationException("Stack underflow: collection is empty.");
            }
            return _items[_size - 1];
        }

        /// <summary>
        /// Non-throwing query that attempts to remove and return the top item.
        /// </summary>
        public bool TryPop(out T result) {
            if (_size == 0) {
                result = default!;
                return false;
            }
            result = Pop();
            return true;
        }

        /// <summary>
        /// Non-throwing query that attempts to peek at the top item.
        /// </summary>
        public bool TryPeek(out T result) {
            if (_size == 0) {
                result = default!;
                return false;
            }
            result = _items[_size - 1];
            return true;
        }

        /// <summary>
        /// Clears all elements from the stack.
        /// Clears references if T is a reference type.
        /// </summary>
        public void Clear() {
            if (RuntimeHelpers.IsReferenceOrContainsReferences<T>()) {
                Array.Clear(_items, 0, _size);
            }
            _size = 0;
            _version++;
        }

        /// <summary>
        /// Trims excess capacity down to the actual number of elements.
        /// </summary>
        public void TrimExcess() {
            int threshold = (int)(_items.Length * 0.9);
            if (_size < threshold) {
                Array.Resize(ref _items, _size);
                _version++;
            }
        }

        /// <summary>
        /// Ensures the array has sufficient capacity to store the requested minimum size.
        /// Utilizes geometric doubling (2x) to maintain amortized O(1) insertions.
        /// </summary>
        private void EnsureCapacity(int min) {
            int newCapacity = _items.Length == 0 ? DefaultCapacity : _items.Length * 2;
            if ((uint)newCapacity > MaxArrayLength) {
                newCapacity = MaxArrayLength;
            }
            if (newCapacity < min) {
                newCapacity = min;
            }
            Array.Resize(ref _items, newCapacity);
        }

        /// <summary>
        /// Enumerates elements in LIFO order (top to bottom).
        /// Throws InvalidOperationException if the stack is mutated during enumeration.
        /// </summary>
        public IEnumerator<T> GetEnumerator() {
            int currentVersion = _version;
            for (int i = _size - 1; i >= 0; i--) {
                if (currentVersion != _version) {
                    throw new InvalidOperationException("Collection was modified during enumeration.");
                }
                yield return _items[i];
            }
        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
    }
}
```

> [!IMPORTANT]
> **The GC Loitering Trap:** Look at `_items[_size] = default(T)!` in `Pop()`. If `T` is a reference type (e.g., `string`, `UserSession`, or `ListNode`) and the implementation simply decrements `_size` without setting that slot to `null`, the object remains referenced by the array! The Garbage Collector cannot reclaim it, causing a silent, catastrophic memory leak known as **Object Loitering**.

---

### 2.2 Approach 2: Singly-Linked Node Stack (`LinkedStack<T>`)

This implementation relies on individual heap-allocated nodes. It provides **strict worst-case $O(1)$ latency** because it never halts execution to resize an array buffer.

```csharp
using System;
using System.Collections;
using System.Collections.Generic;

namespace AdvancedDSA.Stacks {
    /// <summary>
    /// A node-based, singly-linked LIFO stack.
    /// Guarantees strict O(1) worst-case latency for every Push and Pop operation,
    /// eliminating array-reallocation spikes at the cost of per-element heap allocations.
    /// </summary>
    /// <typeparam name="T">The type of elements stored in the stack.</typeparam>
    public class LinkedStack<T> : IReadOnlyCollection<T> {
        /// <summary>
        /// Internal singly-linked node.
        /// </summary>
        private sealed class StackNode {
            public readonly T Value;
            public readonly StackNode? Next;

            public StackNode(T value, StackNode? next) {
                Value = value;
                Next = next;
            }
        }

        private StackNode? _head;
        private int _count;
        private int _version;

        public LinkedStack() {
            _head = null;
            _count = 0;
            _version = 0;
        }

        /// <summary>Gets the number of elements contained in the stack.</summary>
        public int Count => _count;

        /// <summary>Gets a value indicating whether the stack is empty.</summary>
        public bool IsEmpty => _count == 0;

        /// <summary>
        /// Pushes an item onto the top of the stack.
        /// Strict O(1) worst-case time complexity.
        /// </summary>
        public void Push(T item) {
            _head = new StackNode(item, _head);
            _count++;
            _version++;
        }

        /// <summary>
        /// Removes and returns the item at the top of the stack.
        /// Throws InvalidOperationException if the stack is empty.
        /// Strict O(1) worst-case time complexity.
        /// </summary>
        public T Pop() {
            if (_head == null) {
                throw new InvalidOperationException("Stack underflow: collection is empty.");
            }

            _version++;
            T value = _head.Value;
            _head = _head.Next; // Head advanced; old node unreferenced, collected by GC Gen 0
            _count--;
            return value;
        }

        /// <summary>
        /// Returns the item at the top of the stack without removing it.
        /// Throws InvalidOperationException if the stack is empty.
        /// Strict O(1) worst-case time complexity.
        /// </summary>
        public T Peek() {
            if (_head == null) {
                throw new InvalidOperationException("Stack underflow: collection is empty.");
            }
            return _head.Value;
        }

        /// <summary>
        /// Non-throwing query that attempts to pop the top item.
        /// </summary>
        public bool TryPop(out T result) {
            if (_head == null) {
                result = default!;
                return false;
            }
            result = Pop();
            return true;
        }

        /// <summary>
        /// Non-throwing query that attempts to peek at the top item.
        /// </summary>
        public bool TryPeek(out T result) {
            if (_head == null) {
                result = default!;
                return false;
            }
            result = _head.Value;
            return true;
        }

        /// <summary>
        /// Clears all elements from the stack by unlinking the head pointer.
        /// </summary>
        public void Clear() {
            _head = null; // Unroots entire linked chain for GC collection
            _count = 0;
            _version++;
        }

        /// <summary>
        /// Enumerates elements in LIFO order (top to bottom).
        /// Throws InvalidOperationException if the stack is mutated during iteration.
        /// </summary>
        public IEnumerator<T> GetEnumerator() {
            int currentVersion = _version;
            StackNode? current = _head;
            while (current != null) {
                if (currentVersion != _version) {
                    throw new InvalidOperationException("Collection was modified during enumeration.");
                }
                yield return current.Value;
                current = current.Next;
            }
        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
    }
}
```

---

### 2.3 Architectural & Mechanical Comparison: `ArrayStack<T>` vs. `LinkedStack<T>`

| Architectural Metric | Dynamic Array Stack (`ArrayStack<T>`) | Singly-Linked Node Stack (`LinkedStack<T>`) |
| :--- | :--- | :--- |
| **Push Time Complexity** | **Amortized $O(1)$** (Worst-case $O(N)$ during resize) | **Strict $O(1)$** (Never resizes) |
| **Pop Time Complexity** | **$O(1)$** | **$O(1)$** |
| **Peek Time Complexity** | **$O(1)$** | **$O(1)$** |
| **CPU Cache Locality** | **Extremely High** (Contiguous memory, hardware cache line prefetch) | **Very Poor** (Nodes scattered across heap; pointer chasing) |
| **Memory Allocations** | **$O(\log N)$ total reallocations** over lifetime | **$O(N)$ allocations** (1 heap allocation per Push) |
| **GC Pressure** | **Near Zero** (Old buffers collected rarely; elements reused) | **Severe** (High Gen 0 churn on every Push and Pop) |
| **Per-Element Memory Overhead**| **0 bytes** beyond unused buffer capacity | **24–32 bytes overhead per element** on 64-bit CLR |
| **Latency Predictability** | High throughput, but occasional $O(N)$ reallocation stall | Perfectly uniform latency per push (ideal for hard real-time) |
| **Traversal / Iteration Speed**| **Blazing Fast** (Contiguous memory scan) | **Slow** (Memory jumps, cache line misses) |

#### Deep CLR Memory Breakdown for `LinkedStack<T>`:
On a 64-bit .NET runtime, every instance of `class StackNode` incurs:
1. **Object Header:** 8 bytes (lock hash code, sync block index)
2. **MethodTable Pointer (TypeHandle):** 8 bytes (metadata identifying `StackNode`)
3. **`Next` Pointer Reference:** 8 bytes
4. **`Value` Payload:** 4 bytes for `int` (padded by CLR to 8 bytes for 8-byte alignment)
$$\text{Total Memory per Node} = 8 + 8 + 8 + 8 = \mathbf{32\text{ bytes to store a 4-byte integer!}}$$
In contrast, `ArrayStack<int>` packs integers contiguously with **0 bytes of per-element metadata**, allowing sixteen 4-byte integers to fit into a single 64-byte L1 CPU cache line!

> [!TIP]
> **Production Recommendation:** Default to **`ArrayStack<T>`** for 99% of software systems. Choose **`LinkedStack<T>`** only in specialized real-time systems where GC latency spikes from array reallocations are intolerable and a custom object pool is used for nodes.

---

## 3. 🧪 VERIFY: Unit Testing & Invariant Validation Suite

To verify that our from-scratch implementations preserve all ADT invariants, we run this comprehensive test suite:

```csharp
using System;
using System.Diagnostics;
using AdvancedDSA.Stacks;

public static class StackVerificationSuite {
    public static void RunAllTests() {
        Console.WriteLine("Running Stack Verification Tests...");

        TestLIFOOrder(new ArrayStack<int>(), "ArrayStack");
        TestLIFOOrder(new LinkedStack<int>(), "LinkedStack");

        TestUnderflowExceptions(new ArrayStack<string>(), "ArrayStack");
        TestUnderflowExceptions(new LinkedStack<string>(), "LinkedStack");

        TestTryPopAndTryPeek(new ArrayStack<int>(), "ArrayStack");
        TestTryPopAndTryPeek(new LinkedStack<int>(), "LinkedStack");

        TestFailFastEnumeration(new ArrayStack<int>(), "ArrayStack");
        TestFailFastEnumeration(new LinkedStack<int>(), "LinkedStack");

        TestDynamicResizingArrayStack();

        Console.WriteLine("✅ All Stack ADT Invariant Tests Passed Successfully!");
    }

    private static void TestLIFOOrder(dynamic stack, string name) {
        stack.Push(10);
        stack.Push(20);
        stack.Push(30);

        Debug.Assert(stack.Count == 3, $"{name}: Count should be 3.");
        Debug.Assert(stack.Peek() == 30, $"{name}: Peek should return top element (30).");
        Debug.Assert(stack.Pop() == 30, $"{name}: Pop should return 30.");
        Debug.Assert(stack.Pop() == 20, $"{name}: Pop should return 20.");
        Debug.Assert(stack.Pop() == 10, $"{name}: Pop should return 10.");
        Debug.Assert(stack.IsEmpty, $"{name}: Stack should be empty after popping all.");
    }

    private static void TestUnderflowExceptions(dynamic stack, string name) {
        try {
            stack.Pop();
            Debug.Assert(false, $"{name}: Pop() on empty stack should throw InvalidOperationException.");
        } catch (InvalidOperationException) { /* Expected */ }

        try {
            stack.Peek();
            Debug.Assert(false, $"{name}: Peek() on empty stack should throw InvalidOperationException.");
        } catch (InvalidOperationException) { /* Expected */ }
    }

    private static void TestTryPopAndTryPeek(dynamic stack, string name) {
        Debug.Assert(!stack.TryPop(out _), $"{name}: TryPop on empty stack should return false.");
        Debug.Assert(!stack.TryPeek(out _), $"{name}: TryPeek on empty stack should return false.");

        stack.Push(42);
        Debug.Assert(stack.TryPeek(out int peekVal) && peekVal == 42, $"{name}: TryPeek should succeed.");
        Debug.Assert(stack.TryPop(out int popVal) && popVal == 42, $"{name}: TryPop should succeed.");
        Debug.Assert(stack.IsEmpty, $"{name}: Stack should be empty.");
    }

    private static void TestFailFastEnumeration(dynamic stack, string name) {
        stack.Push(1);
        stack.Push(2);
        stack.Push(3);

        try {
            foreach (var item in stack) {
                if (item == 2) {
                    stack.Push(99); // Mutate during iteration!
                }
            }
            Debug.Assert(false, $"{name}: Iteration mutation should throw InvalidOperationException.");
        } catch (InvalidOperationException) { /* Expected */ }
    }

    private static void TestDynamicResizingArrayStack() {
        var stack = new ArrayStack<int>(initialCapacity: 2);
        Debug.Assert(stack.Capacity == 2);

        // Exceed initial capacity: 2 -> 4 -> 8 -> 16
        for (int i = 1; i <= 10; i++) {
            stack.Push(i);
        }

        Debug.Assert(stack.Count == 10);
        Debug.Assert(stack.Capacity >= 10, "Capacity should have expanded geometrically.");

        for (int i = 10; i >= 1; i--) {
            Debug.Assert(stack.Pop() == i);
        }
        Debug.Assert(stack.IsEmpty);
    }
}
```

---

## 4. 🎬 DEMONSTRATE: Algorithmic Problem Walkthroughs

Now that we possess deep mastery of the Stack ADT and its memory internals, let us study how LIFO mechanics resolve complex algorithmic challenges.

---

### 4.1 [LeetCode 20] Valid Parentheses

Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.
An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

#### The LIFO Nesting Invariant:
When delimiters nest inside one another (e.g. `{[()]}`), the delimiter that was opened **most recently** must be the **first one to close**. This is the textbook definition of LIFO.

#### The "Push Expected Closer" Optimization:
Instead of pushing opening characters `(`, `[`, `{` and writing cumbersome `switch` branches during `Pop()`, **push the expected closing character**:
- Encounter `(` $\implies$ push `)`
- Encounter `[` $\implies$ push `]`
- Encounter `{` $\implies$ push `}`
- Encounter closing character `c`:
  - Verify that the stack is non-empty and `stack.Pop() == c`. If not $\implies$ invalid!

```
Expression: " { [ ] } "

1. Character '{' -> Push '}'           Stack: [ '}' ]
2. Character '[' -> Push ']'           Stack: [ '}', ']' ]
3. Character ']' -> Pop matches ']'!   Stack: [ '}' ]
4. Character '}' -> Pop matches '}'!   Stack: []

Finished! stack.IsEmpty == true -> VALID!
```

#### Production C# Solution:

```csharp
public class SolutionValidParentheses {
    /// <summary>
    /// Validates balanced parentheses in O(N) time and O(N) space
    /// using the Push-Expected-Closer pattern.
    /// </summary>
    public bool IsValid(string s) {
        if (string.IsNullOrEmpty(s) || s.Length % 2 != 0) {
            return false; // Fast prune: odd length strings can never be balanced
        }

        var stack = new Stack<char>();

        foreach (char c in s) {
            if (c == '(') {
                stack.Push(')');
            } else if (c == '[') {
                stack.Push(']');
            } else if (c == '{') {
                stack.Push('}');
            } else {
                // c is a closing bracket: it MUST match the top of the stack
                if (stack.Count == 0 || stack.Pop() != c) {
                    return false;
                }
            }
        }

        return stack.Count == 0;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — Single scan through string of length $N$.
- **Space Complexity:** $O(N)$ — Worst case when all characters are openers (e.g. `(((((`), stack holds $N/2$ elements.

---

### 4.2 [LeetCode 155] Min Stack

Design a stack that supports `Push`, `Pop`, `Top`, and retrieving the minimum element in **$O(1)$ time**.

#### The Historical State Challenge:
If we store a single scalar variable `int currentMin`:
- Push 5 $\implies min = 5$
- Push 2 $\implies min = 2$
- Push 8 $\implies min = 2$
- Pop 8 $\implies min = 2$
- Pop 2 $\implies$ **What is the new minimum?**
A scalar variable cannot remember what the minimum was before 2 was pushed! We must store the **history** of minimums.

#### The Value-Deduplicated Dual-Stack Architecture:
Instead of pairing every element with a minimum (which doubles memory consumption), maintain two stacks:
1. `_mainStack`: Holds all values.
2. `_minStack`: Holds the running minimums.
   - **Push Invariant:** When pushing `x`, push to `_minStack` only if `_minStack.Count == 0 || x <= _minStack.Peek()`.
     - *Critical Detail:* We use `<=` rather than `<`. If duplicate minimum values are pushed (e.g. 2, then another 2), both must be recorded so that a subsequent pop of one 2 does not prematurely erase the minimum status of the other!
   - **Pop Invariant:** When popping `val` from `_mainStack`, if `val == _minStack.Peek()`, pop `_minStack` simultaneously.

```
Operation       _mainStack             _minStack (Push if <= Top)
Push(5)         [ 5 ]                  [ 5 ]
Push(3)         [ 5, 3 ]               [ 5, 3 ]
Push(7)         [ 5, 3, 7 ]            [ 5, 3 ]         (7 > 3, skipped!)
Push(3)         [ 5, 3, 7, 3 ]         [ 5, 3, 3 ]      (3 <= 3, pushed!)
Pop()           [ 5, 3, 7 ]            [ 5, 3 ]         (3 == 3, popped!)
GetMin() -> 3
```

#### Production C# Solution:

```csharp
public class MinStack {
    private readonly Stack<int> _mainStack;
    private readonly Stack<int> _minStack;

    public MinStack() {
        _mainStack = new Stack<int>();
        _minStack = new Stack<int>();
    }

    public void Push(int val) {
        _mainStack.Push(val);
        // Push to minStack only if it's a new or duplicate global minimum
        if (_minStack.Count == 0 || val <= _minStack.Peek()) {
            _minStack.Push(val);
        }
    }

    public void Pop() {
        if (_mainStack.Count == 0) {
            throw new InvalidOperationException("Stack underflow.");
        }

        int popped = _mainStack.Pop();
        if (popped == _minStack.Peek()) {
            _minStack.Pop();
        }
    }

    public int Top() {
        if (_mainStack.Count == 0) {
            throw new InvalidOperationException("Stack underflow.");
        }
        return _mainStack.Peek();
    }

    public int GetMin() {
        if (_minStack.Count == 0) {
            throw new InvalidOperationException("Stack underflow.");
        }
        return _minStack.Peek();
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(1)$ for `Push`, `Pop`, `Top`, and `GetMin`.
- **Space Complexity:** $O(N)$ — In the worst-case (strictly decreasing values), `_minStack` stores $N$ items; in practical random workloads, `_minStack` stores $O(\log N)$ items.

---

### 4.3 [LeetCode 71] Simplify Path

Given an absolute path for a Unix-style file system, convert it to the simplified **canonical path**.
Rules:
- A single period `.` represents the current directory (no-op).
- A double period `..` represents moving up one directory level.
- Multiple consecutive slashes `//` are treated as a single slash `/`.
- The path must start with a single `/`, and directories must be separated by exactly one `/`.

#### Tokenized LIFO Stack Invariant:
When navigating hierarchical directories, entering a folder pushes it onto the stack. Encountering `..` pops the most recent directory from the stack:

```
Path: "/a/./b/../../c/"
Tokens after splitting by '/': ["a", ".", "b", "..", "..", "c"]

Token "a"  -> Push "a"          Stack: ["a"]
Token "."  -> Skip (current dir)
Token "b"  -> Push "b"          Stack: ["a", "b"]
Token ".." -> Pop "b"           Stack: ["a"]
Token ".." -> Pop "a"           Stack: []
Token "c"  -> Push "c"          Stack: ["c"]

Reconstruct root-to-leaf: "/c"
```

#### Production C# Solution:

```csharp
using System.Text;

public class SolutionSimplifyPath {
    public string SimplifyPath(string path) {
        if (string.IsNullOrEmpty(path)) return "/";

        string[] tokens = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
        var stack = new Stack<string>();

        foreach (string token in tokens) {
            if (token == "." || string.IsNullOrEmpty(token)) {
                continue;
            }

            if (token == "..") {
                if (stack.Count > 0) {
                    stack.Pop(); // Ascend to parent directory
                }
            } else {
                stack.Push(token); // Enter subdirectory
            }
        }

        // Reconstruct canonical path
        // In C#, iterating Stack<T> yields elements in LIFO order (top to bottom).
        // Using Reverse() restores chronological root-to-leaf path order.
        var sb = new StringBuilder();
        foreach (string dir in stack.Reverse()) {
            sb.Append('/').Append(dir);
        }

        return sb.Length == 0 ? "/" : sb.ToString();
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — String splitting and stack manipulation take linear time proportional to path length.
- **Space Complexity:** $O(N)$ — Storage for tokens, stack, and result `StringBuilder`.

---

## 5. ⚠️ PITFALLS: Common Engineering & Algorithmic Traps

### 1. The GC Reference Loitering Bug in Array Stacks
```csharp
// ❌ WRONG (Leaves heap reference rooted in array):
public T Pop() {
    return _items[--_size];
}

// ✅ CORRECT (Clears array slot for GC reclamation):
public T Pop() {
    T item = _items[--_size];
    _items[_size] = default(T)!;
    return item;
}
```

### 2. Strict Inequality in MinStack Causes Premature Min Loss
```csharp
// ❌ WRONG: If nums = [2, 2], only first 2 is pushed to _minStack.
// When first 2 is popped, _minStack pops 2, losing min for the remaining 2!
if (_minStack.Count == 0 || val < _minStack.Peek()) {
    _minStack.Push(val);
}

// ✅ CORRECT: Duplicate minimums MUST be tracked in _minStack!
if (_minStack.Count == 0 || val <= _minStack.Peek()) {
    _minStack.Push(val);
}
```

### 3. Mutating a Collection During Foreach Enumeration
Iterating a stack while calling `Push` or `Pop` inside the loop causes corrupted state. Always maintain a `_version` counter in custom containers that triggers an `InvalidOperationException` upon mutation during enumeration.

---

## 6. 🏋️ PRACTICE: Your Daily Challenges

Master foundational stack state machines on LeetCode:

### Problem 1 (The Foundational State Machine): LeetCode 20 — Valid Parentheses (Easy)
- **Goal:** Implement the "Push Expected Closer" pattern.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.

### Problem 2 (Constant-Time History): LeetCode 155 — Min Stack (Medium)
- **Goal:** Implement the value-deduplicated dual-stack `MinStack`.
- **Target Complexity:** $O(1)$ time for all operations, $O(N)$ space.

### Problem 3 (Directory Parsing): LeetCode 71 — Simplify Path (Medium)
- **Goal:** Handle edge cases with `..`, `.`, multiple slashes, and root edge cases.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.

### Bonus Challenge: LeetCode 1021 — Remove Outermost Parentheses (Easy)
- **Goal:** Strip the outermost parentheses from every primitive valid string without allocating extra stack structures (tracking open count scalar).
- **Target Complexity:** $O(N)$ time, $O(1)$ auxiliary space.

---

## 7. 🔗 CONNECT: The Pattern Decision Bridge & Lookahead

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Stack LIFO Decision Tree                          │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Need to store elements with LIFO discipline?
                   │   ├─► Contiguous memory, cache locality, amortized O(1)? -> ArrayStack<T>
                   │   └─► Strict worst-case O(1) latency, no resize spikes?  -> LinkedStack<T>
                   │
                   ├─► Nested matching / Balanced delimiters?
                   │   └─► Push Expected Closer to Stack [LC 20]
                   │
                   ├─► Constant time retrieval of historical extrema?
                   │   └─► Auxiliary Min/Max Stack with val <= minStack.Peek() [LC 155]
                   │
                   ├─► Hierarchical navigation / Directory backtracks?
                   │   └─► Tokenized LIFO Stack (pop on '..') [LC 71]
                   │
                   └─► Finding next/previous greater or smaller elements?
                       └─► Monotonic Stacks (Day 51) [LC 496, LC 503, LC 739]
```

### Preview for Day 51: Monotonic Stack Fundamentals
In **Day 51**, we unlock one of the most powerful algorithmic paradigms in computer science:
- **The Monotonic Stack Invariant:** Maintaining elements in strictly increasing or strictly decreasing order.
- **The Amortized $O(N)$ Proof:** Why an inner `while` loop inside an outer `for` loop runs in strictly linear time.
- **Next Greater Element ([LeetCode 496, 503, 739]):** Finding distance spans and nearest larger elements using a monotonic stack of **indices**.

---

## 8. 🎯 Checkpoint Questions & Spoken Interview Drills

### Spoken Interview Drill (20–30 Seconds):
> *"A stack is a LIFO Abstract Data Type where the most recently added item is the first to be retrieved. In software engineering, I implement it using either a dynamic contiguous array (`ArrayStack<T>`) or singly-linked nodes (`LinkedStack<T>`). The dynamic array backing is superior for 99% of workloads because it provides $O(1)$ amortized operations, high spatial cache locality on 64-byte CPU cache lines, and minimal GC pressure. When popping reference types from an array stack, setting the vacated slot to default(T) is mandatory to eliminate GC loitering. In delimiter matching problems, I use the 'push expected closer' pattern for clean branchless validation, and for a MinStack, I use an auxiliary stack tracking values less than or equal to the current minimum."*

### Checkpoint Questions:
1. **Hardware Stack vs. Managed Heap:** Explain why allocating memory on the CPU thread stack takes a single instruction (`sub rsp, N`), whereas allocating a node on the managed heap requires orders of magnitude more CPU cycles.
2. **The GC Loitering Trap:** In `ArrayStack<T>.Pop()`, why is `_items[_size] = default(T)!` required when `T` is a reference type? What happens in the CLR garbage collector if this line is omitted?
3. **ArrayStack vs. LinkedStack Memory Footprint:** On a 64-bit CLR, calculate the exact memory overhead incurred by a `class StackNode<int>` compared to an element in `ArrayStack<int>`. Why does `ArrayStack` process sequential items faster?
4. **The `<=` MinStack Invariant:** In `MinStack.Push(val)`, why is the condition `val <= _minStack.Peek()` using `<=` rather than `<`? Trace what occurs on `Push(2), Push(2), Pop()` if `<` is used.
5. **Thread Stack vs. Heap Stack Limitation:** Why does deep recursion on an input graph of depth $50,000$ crash a .NET process with `StackOverflowException`, while an explicit `Stack<DfsFrame>` allocated on the heap executes without issue? How does the frame's `Phase` field emulate the CPU instruction pointer?
