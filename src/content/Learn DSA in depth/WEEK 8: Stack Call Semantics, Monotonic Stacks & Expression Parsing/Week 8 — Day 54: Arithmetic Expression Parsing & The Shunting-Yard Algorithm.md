---
title: "Week 8 — Day 54: Arithmetic Expression Parsing & The Shunting-Yard Algorithm"
---

In **Days 51 to 53**, we explored monotonic stacks for nearest neighbor lookups, boundary area optimizations, and subarray contribution models.

Today, we step from data structures into **compiler front-end engineering**:
1. **The Three Mathematical Notations:** Infix, Prefix, and Postfix (Reverse Polish Notation / RPN) and why hardware execution engines run on stacks.
2. **Postfix Evaluation ([LeetCode 150]):** The canonical stack operand reduction loop.
3. **Operator Precedence Handling ([LeetCode 227]):** Managing `*` and `/` before `+` and `-` in streaming strings.
4. **The Sign-Stack Invariant ([LeetCode 224]):** How compilers propagate nested unary signs across arbitrary parentheses in a single pass.
5. **Dijkstra's Shunting-Yard Algorithm:** The foundational railway track algorithm that converts human-readable infix expressions into machine-executable postfix streams.

---

## 1. 🧠 TEACH: Concept & Invariants

### 🧭 5W1H Executive Architecture Blueprint
- **1. WHAT:**
  - *Formal Definition:* **Arithmetic Expression Parsing** evaluates mathematical strings using operator precedence state machines (Dijkstra's Shunting-Yard algorithm).
  - *Core Invariants:* Operator Precedence Invariant: When operator $op$ arrives, all operators on the operator stack with greater or equal precedence ($\text{Prec}(\text{top}) \ge \text{Prec}(op)$) must be popped and evaluated before pushing $op$; Parenthesis Isolation Invariant: Sub-expressions within `(` and `)` evaluate completely before popping the matching `(`.
  - *Misconception Check:* Unary operators (e.g. `"-5"` or `"1 - (-2)"`) break binary operator assumptions; handling unary minus by prepending a virtual `0` (`0 - 5`) restores binary arithmetic consistency.
- **2. WHY:**
  - *Bottleneck Solved:* Eliminates the overhead and complexity of building full Abstract Syntax Trees (ASTs) for simple arithmetic evaluations.
  - *Complexity Advantage:* Evaluates arbitrary infix expressions in $O(N)$ linear time and $O(N)$ space.
- **3. WHEN:**
  - *When to Choose / Signal Words:* "Basic Calculator" (LC 224), "Basic Calculator II" (LC 227), "Evaluate Reverse Polish Notation" (LC 150). Signal words: "evaluate mathematical expression", "basic calculator", "operator precedence".
  - *When to Avoid / Failure Modes:* Full programming languages with complex control flow and block scopes (requires full recursive descent parser).
- **4. WHERE:**
  - *Physical CLR Memory:* Dual stacks: operand stack (`Stack<long>`) and operator stack (`Stack<char>`); 64-bit integer precision prevents intermediate overflow.
  - *Production Systems:* Spreadsheet calculation engines (Excel formula evaluation), SQL WHERE clause condition evaluators, math engine REPLs.
- **5. WHO:**
  - *Spoken Script:* "Dijkstra's Shunting-Yard algorithm maintains an operator stack and an operand stack. When an operator arrives, all operators on the stack with greater or equal precedence are popped and evaluated first, ensuring correct operator precedence and parenthesis associativity in $O(N)$ time."
  - *Interviewer Evaluation Lens:* Checks operator precedence map, unary sign handling, whitespace skipping, multi-digit integer parsing, and parenthesis unwinding.
- **6. HOW:**
  - *Cost Model:* Time: $O(N)$ linear time; Space: $O(N)$ auxiliary stack space.
  - *State Transition Trace (Shunting-Yard):* `3 + 2 * 2 -> push 3, push '+' -> push 2 -> '*' has higher precedence than '+' => push '*' -> push 2 -> end of string: eval 2 * 2 = 4 -> eval 3 + 4 = 7`.


---

### 1.1 Physical Mental Model — The Railroad Shunting Yard & The Siding Track

**Everyday Analogy: Dijkstra's Railroad Shunting Junction**

Edsger Dijkstra named the **Shunting-Yard Algorithm** after physical railroad switching yards where rail cars are rearranged onto different tracks:

```
INCOMING TRAIN CARS: [ 3 ] ──> [ + ] ──> [ 4 ] ──> [ * ] ──> [ 2 ]
                                    │
                                    ▼
                          ┌──────────────────┐
                          │ SIDING TRACK     │  <-- OPERATOR STACK (Dead-End Spur)
                          │ (Holds Operators)│
                          │   [ * ] (High)   │
                          │   [ + ] (Low)    │
                          └──────────────────┘
                                    │
                                    ▼
OUTGOING MAIN TRACK:  [ 3 ] ──> [ 4 ] ──> [ 2 ] ──> [ * ] ──> [ + ]
                      (Operands roll straight through to output!)
```

---

**The Three Shunting Switching Rules:**

1. **Numbers (Freight Cars):** Numbers have no priority conflicts. They **roll straight through** from the incoming track to the outgoing track!
2. **Operators (Locomotives on the Siding Track):**
   - High-priority locomotives (`*`, `/`) can pull onto the siding track in front of low-priority ones (`+`, `-`).
   - But a **low-priority locomotive (`+`) CANNOT block the track behind a high-priority locomotive (`*`)**!
   - If `+` wants to enter the siding track while `*` is parked there, `*` must be **dispatched immediately onto the main track** before `+` is allowed to park!
3. **Parentheses (Quarantine Sidings):**
   - An open parenthesis `(` is a detour onto an isolated siding.
   - Everything inside the parentheses is processed normally.
   - When `)` arrives, all waiting operators inside that siding are flushed to the main track, and the siding barrier `(` is dissolved!

---

**RPN Evaluation: The Two-Handed Calculator**

When evaluating Postfix / RPN (`3 4 2 * +`):
- Numbers sit on a stack of trays.
- When an operator (`*`) arrives:
  - Right hand pops top tray: `b = 2`.
  - Left hand pops next tray: `a = 4`.
  - Calculate `a * b = 8`, and push `8` back onto the tray stack!

```
Postfix Stream: 3 4 2 * +
Stack: [ 3 ] ──> [ 3, 4 ] ──> [ 3, 4, 2 ]
Op '*': Pop 2 (right), Pop 4 (left) -> 4 * 2 = 8 -> Stack: [ 3, 8 ]
Op '+': Pop 8 (right), Pop 3 (left) -> 3 + 8 = 11 -> Stack: [ 11 ] (Final Answer!)
```

---

### 1.2 The Three Mathematical Notations

How does a CPU or compiler evaluate $3 + 4 \times 2$?

| Notation | Format | Example | Properties & Hardware Execution |
| :--- | :--- | :--- | :--- |
| **Infix** | `operand operator operand` | `3 + 4 * 2` | Human-friendly; **inherently ambiguous** without operator precedence tables and explicit parentheses. |
| **Prefix (Polish)** | `operator operand operand` | `+ 3 * 4 2` | Unambiguous; evaluated right-to-left. Parentheses are never required. |
| **Postfix (Reverse Polish)** | `operand operand operator` | `3 4 2 * +` | **The compiler gold standard.** Evaluated strictly left-to-right using a single LIFO operand stack. |

> [!NOTE]
> Postfix notation is the exact instruction format used by the **.NET Common Intermediate Language (CIL)**, the **Java Virtual Machine (JVM)**, and the **PostScript** rendering engine. In CIL, evaluating `3 + 4 * 2` compiles directly to:
> `ldc.i4.3` $\to$ `ldc.i4.4` $\to$ `ldc.i4.2` $\to$ `mul` $\to$ `add`.

---

### 1.2 Evaluating Postfix / RPN ([LeetCode 150])

Because operands appear before their operators, postfix expressions are evaluated in a single forward pass:
- Maintain an operand stack `Stack<int>`.
- Scan tokens from left to right:
  - If token is a number: push it onto the stack.
  - If token is an operator (`+`, `-`, `*`, `/`):
    - Pop the right operand: `int b = stack.Pop();`
    - Pop the left operand: `int a = stack.Pop();`
    - Compute `result = a (op) b`.
    - Push `result` back onto the stack.
- When all tokens are processed, the stack contains exactly one element: the final evaluated result!

> [!WARNING]
> **The Non-Commutative Operand Order Trap:** Subtraction and division are not commutative ($a - b \ne b - a$ and $a / b \ne b / a$). The first popped element is the **right operand** ($b$), and the second popped element is the **left operand** ($a$). Reversing this is the most common bug in LeetCode 150!

---

### 1.3 Precedence Resolution: Basic Calculator II ([LeetCode 227])

Given an expression containing non-negative integers and operators `+`, `-`, `*`, `/` **without parentheses**:
$$\text{Expression: } 3 + 2 \times 2$$

#### The Core Insight:
`*` and `/` have **higher precedence** than `+` and `-`. We cannot perform `3 + 2` immediately because the `2` might be multiplied by a subsequent number!

#### The Trailing Operator State Machine:
We maintain:
- `currentNum`: Accumulates digits of the current number.
- `lastOp`: Tracks the operator immediately preceding `currentNum` (initialized to `'+'`).
- `stack`: Accumulates evaluated terms that will be summed at the end.

When we encounter an operator or reach the end of the string:
1. If `lastOp == '+'`: `stack.Push(currentNum)`
2. If `lastOp == '-'`: `stack.Push(-currentNum)`
3. If `lastOp == '*'`: Resolve immediately: `stack.Push(stack.Pop() * currentNum)`
4. If `lastOp == '/'`: Resolve immediately: `stack.Push(stack.Pop() / currentNum)`
5. Update `lastOp = currentToken`, reset `currentNum = 0`.

At the end of the string, the stack contains only signed additive terms. Simply sum the stack!

---

### 1.4 Parentheses & Unary Negation: The Sign-Stack Invariant ([LeetCode 224])

In **LeetCode 224**, expressions contain `+`, `-`, `(`, `)`, and spaces. Notice that without `*` or `/`, every operation is simply addition or subtraction!

Consider:
$$\mathbf{1 - (2 - (3 + 4))}$$
Notice how the signs distribute mathematically:
$$= 1 - 2 + (3 + 4) = 1 - 2 + 3 + 4$$
- Entering `-( ... )` flips the sign of every operation inside the parentheses!
- Entering `+( ... )` preserves the sign.
- Nested parentheses accumulate sign flips like a stack!

#### The Sign-Stack Architecture:
Instead of building an AST or converting to RPN, maintain a **`Stack<int> signStack`** that records the active contextual sign:
1. Initialize `signStack.Push(1)` (global positive context).
2. Maintain `currentSign = 1`, `result = 0`, `currentNum = 0`.
3. Encounter `+`: `currentSign = 1`.
4. Encounter `-`: `currentSign = -1`.
5. Encounter `(`:
   - The effective sign entering this subexpression is `currentSign * signStack.Peek()`.
   - **`signStack.Push(currentSign * signStack.Peek())`**
   - Reset `currentSign = 1`.
6. Encounter `)`:
   - **`signStack.Pop()`** (unwind the parenthesis sign context).
7. Encounter digit: Accumulate `currentNum`.
8. When a number finishes:
   $$\mathbf{result += currentNum \times (currentSign \times signStack.Peek())}$$

**Result:** A clean, single-pass $O(N)$ solution that handles arbitrary nesting with zero string allocation!

---

### 1.5 Dijkstra's Shunting-Yard Algorithm

Invented by Edsger W. Dijkstra in 1961, the Shunting-Yard algorithm uses a railway siding model to convert an **Infix** expression to **Postfix (RPN)**:

```
Infix Input:  3 + 4 * 2 / ( 1 - 5 )
                 │
                 ▼
       ┌───────────────────┐
       │   Operator Stack  │  (Railway Siding Track)
       └───────────────────┘
                 │
                 ▼
Postfix Output: 3 4 2 * 1 5 - / +  (Main Output Track)
```

#### The Invariant Rules:
1. **Operands:** Sent directly to the output stream.
2. **Left Parenthesis `(`:** Pushed onto the operator stack.
3. **Right Parenthesis `)`:** Pop operators from the stack to output until `(` is reached. Discard `(`.
4. **Operator $O_1$:**
   - While stack top is an operator $O_2$ with greater precedence (or equal precedence and left-associative):
     - Pop $O_2$ to output.
   - Push $O_1$ onto the operator stack.
5. At EOF, flush all remaining operators in the stack to output.

---

### 1.6 Interview Spoken Drill (20–30 Seconds)

> *"In compiler design, arithmetic expressions are evaluated using stacks. Postfix notation eliminates parentheses by placing operators after their operands, evaluated via a single operand stack. For infix expressions with precedence like Basic Calculator II, I track the previous operator and current number; multiplication and division are resolved immediately with the top of the stack, while addition and subtraction push signed values to be summed at the end. For Basic Calculator with parentheses, I maintain a sign stack that tracks the product of active outer signs, allowing me to distribute signs and evaluate the entire expression in a single streaming pass in $O(N)$ time and $O(N)$ space."*

### 1.7 ⚙️ Core Operations Deep-Dive: Shunting-Yard Precedence Automata & Sign Distribution

#### Dimension 1: Operation Contract & Big-O Bounds
- **Operation Signatures:**
  1. `int EvalRPN(string[] tokens)`
  2. `int Calculate(string s)` (Basic Calculator with `+`, `-`, `*`, `/`, `(`, `)`)
- **Preconditions:**
  - `tokens` represents a mathematically valid postfix expression; division by zero never occurs.
  - In `Calculate`, `s` represents a valid infix arithmetic expression with non-negative operands and valid parentheses.
- **Postconditions:**
  - Returns the exact 32-bit integer result. Integer division truncates toward zero.
- **Complexity Bounds:**
  - **Time Complexity:**
    - $\Theta(N)$ — single linear scan through $N$ tokens or characters; each operator/operand is pushed and popped at most twice.
  - **Auxiliary Space Complexity:**
    - $\Theta(N)$ — operand stack and operator stack bounded by expression length.

#### Dimension 2: Step-by-Step Algorithmic Logic & Decision Tree
1. **Streaming Sign-Distribution State Flow (Basic Calculator I with Parentheses):**
   - Initialize `int result = 0, currentNum = 0, currentSign = 1`.
   - Initialize `Stack<int> signStack = new Stack<int>()`. `signStack.Push(1)`.
   - Loop $i = 0$ to $s.Length - 1$:
     - Let $c = s[i]$.
     - If $c$ is digit: `currentNum = currentNum * 10 + (c - '0')`.
     - If $c == '+'$:
       - `result += currentSign * currentNum`.
       - `currentNum = 0; currentSign = signStack.Peek() * 1`.
     - If $c == '-'$:
       - `result += currentSign * currentNum`.
       - `currentNum = 0; currentSign = signStack.Peek() * (-1)`.
     - If $c == '(':
       - `signStack.Push(currentSign)`. (Push current sign context).
     - If $c == ')':
       - `signStack.Pop()`. (Exit sign context).
   - Flush final token: `result += currentSign * currentNum`.
   - Return `result`.
2. **Shunting-Yard Precedence Evaluation (Basic Calculator II with `*`, `/`):**
   - Precedence: `*`, `/` have precedence 2; `+`, `-` have precedence 1.
   - Immediate reduction: When an operator with $\le$ precedence arrives, reduce previous higher-precedence operations immediately from the operand stack.

```
                         [Iterate c in expression]
                                     │
           Is Digit? ───────► (Yes) Accumulate currentNum = currentNum * 10 + d
              │
             (No)
              │
          c is '+' or '-'? ─► (Yes) result += currentSign * currentNum
              │                     currentNum = 0
              │                     currentSign = signStack.Peek() * (+1 or -1)
             (No)
              │
          c is '('? ────────► (Yes) signStack.Push(currentSign)
              │
          c is ')'? ────────► (Yes) signStack.Pop()
```

#### Dimension 3: Visual ASCII State Transitions
```
EXPRESSION: 2 - ( 5 - 3 )
i=0: '2' -> currentNum = 2
i=1: '-' -> result += 1 * 2 = 2. currentNum = 0. currentSign = 1 * (-1) = -1.
i=2: '(' -> signStack.Push(-1). signStack: [ 1, -1 ]
i=3: '5' -> currentNum = 5
i=4: '-' -> result += (-1) * 5 = 2 - 5 = -3. currentNum = 0.
            currentSign = signStack.Peek()(-1) * (-1) = +1! (MINUS DISTRIBUTED!)
i=5: '3' -> currentNum = 3
i=6: ')' -> signStack.Pop(). signStack: [ 1 ]
End of loop: result += (+1) * 3 = -3 + 3 = 0.
Correct Result: 2 - (5 - 3) = 2 - 2 = 0!
```

#### Dimension 4: Invariant Preservation Proof
- **Distributive Sign Invariant:**
  - Let an expression have nested unary and binary signs. A term $x$ enclosed by parentheses inherits the product of all enclosing sign contexts:
    $$\text{effectiveSign}(x) = \prod_{k \in \text{Ancestors}} \text{sign}_k$$
  - Pushing $currentSign$ onto $signStack$ when entering `(` records the accumulated sign multiplier for that scope.
  - Setting $currentSign = signStack.Peek() \times (\pm 1)$ applies the algebraic distributive law $-(a - b) = -a + b$ in a single forward pass, eliminating parenthesized sub-evaluations.
- **Non-Commutative Division / Subtraction Order Lemma:**
  - In postfix evaluation (`EvalRPN`), when operator $\odot \in \{ -, / \}$ is encountered:
    - First pop: $b = stack.Pop()$ (Right Operand).
    - Second pop: $a = stack.Pop()$ (Left Operand).
    - Evaluation: $a \odot b$.
  - Popping in reverse ensures non-commutative operations preserve $a / b$ and $a - b$ rather than $b / a$ and $b - a$.

#### Dimension 5: Edge Case Matrix
| Edge Case Scenario | Input State | Algorithmic Behavior | Invariant Preservation |
| :--- | :--- | :--- | :--- |
| **Leading Unary Minus** | `"-3 + 5"` | Initial `result` is 0; currentSign becomes -1; evaluated as $0 - 3 + 5 = 2$. | Unary sign seamlessly distributed. |
| **Negative Division Truncation** | `["4", "-13", "/"]` | C# integer division truncates toward zero: $4 / -13 = 0$. | Matches IEEE / LeetCode specification. |
| **Whitespace Padding** | `"  30  +  ( 2 * 3 ) "` | Spaces are skipped in tokenizer; digits accumulate correctly into 30. | Robust against token separators. |
| **Deeply Nested Redundant Parens** | `"(((10)))"` | Stack pushes and pops 3 times without modifying accumulator; returns 10. | Identity preserved through arbitrary depth. |
| **No Operators** | `"42"` | Loop completes; flushed at end; returns 42. | Trivial single operand parsing. |

---

## 2. 🎬 DEMONSTRATE: Problem Walkthroughs

### 2.1 [LeetCode 150] Evaluate Reverse Polish Notation

You are given an array of strings `tokens` that represents an arithmetic expression in a Reverse Polish Notation. Evaluate the expression and return an integer that represents the value of the expression.

#### Production C# Implementation:

```csharp
public class SolutionEvalRPN {
    /// <summary>
    /// Evaluates Reverse Polish Notation in O(N) time and O(N) space.
    /// </summary>
    public int EvalRPN(string[] tokens) {
        var stack = new Stack<int>();

        foreach (string token in tokens) {
            // Check if token is an operator
            if (token == "+" || token == "-" || token == "*" || token == "/") {
                // Non-commutative order: first popped is right, second popped is left
                int b = stack.Pop();
                int a = stack.Pop();

                int result = token switch {
                    "+" => a + b,
                    "-" => a - b,
                    "*" => a * b,
                    "/" => a / b, // C# integer division truncates toward zero as required
                    _ => throw new InvalidOperationException()
                };

                stack.Push(result);
            } else {
                // Token is an integer operand
                stack.Push(int.Parse(token));
            }
        }

        return stack.Pop();
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — Every token is visited once; push and pop are $O(1)$.
- **Space Complexity:** $O(N)$ — The stack stores at most $(N + 1) / 2$ operands.

---

### 2.2 [LeetCode 227] Basic Calculator II (Precedence Without Parentheses)

Given a string `s` which represents an expression, evaluate this expression and return its value. The expression contains integers, `+`, `-`, `*`, `/`, and empty spaces.

#### Production C# Implementation ($O(1)$ Auxiliary Space Optimization):
Instead of allocating a full stack of size $N$, notice that we only need to remember the **last term**!
- `lastTerm`: Holds the result of the current multiplication/division chain.
- `totalResult`: Accumulates completed additive terms.

```csharp
public class SolutionBasicCalculatorII {
    /// <summary>
    /// Evaluates arithmetic expressions with +, -, *, / in O(N) time and O(1) space.
    /// </summary>
    public int Calculate(string s) {
        if (string.IsNullOrEmpty(s)) return 0;

        int totalResult = 0;
        int lastTerm = 0;
        int currentNum = 0;
        char lastOp = '+';

        for (int i = 0; i < s.Length; i++) {
            char c = s[i];

            if (char.IsDigit(c)) {
                currentNum = currentNum * 10 + (c - '0');
            }

            // Process operator or final character
            if ((!char.IsDigit(c) && c != ' ') || i == s.Length - 1) {
                if (lastOp == '+') {
                    totalResult += lastTerm;
                    lastTerm = currentNum;
                } else if (lastOp == '-') {
                    totalResult += lastTerm;
                    lastTerm = -currentNum;
                } else if (lastOp == '*') {
                    lastTerm = lastTerm * currentNum;
                } else if (lastOp == '/') {
                    lastTerm = lastTerm / currentNum;
                }

                lastOp = c;
                currentNum = 0;
            }
        }

        totalResult += lastTerm;
        return totalResult;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — Single pass over string `s`.
- **Space Complexity:** **Strictly $O(1)$** — Operates using 4 integer registers (`totalResult`, `lastTerm`, `currentNum`, `lastOp`).

---

### 2.3 [LeetCode 224] Basic Calculator (Parentheses & Unary Negation)

Given a string `s` representing a valid expression containing `+`, `-`, `(`, `)`, and spaces, evaluate it in $O(N)$ time.

#### Production C# Implementation (The Sign-Stack Invariant):

```csharp
public class SolutionBasicCalculator {
    /// <summary>
    /// Evaluates expressions with parentheses and unary signs in O(N) time and O(N) space
    /// using contextual sign stack propagation.
    /// </summary>
    public int Calculate(string s) {
        if (string.IsNullOrEmpty(s)) return 0;

        var signStack = new Stack<int>();
        signStack.Push(1); // Default global positive context

        int result = 0;
        int currentNum = 0;
        int currentSign = 1;

        foreach (char c in s) {
            if (char.IsDigit(c)) {
                currentNum = currentNum * 10 + (c - '0');
            } else if (c == '+') {
                result += currentSign * currentNum;
                currentNum = 0;
                currentSign = signStack.Peek(); // Apply active parenthetical sign
            } else if (c == '-') {
                result += currentSign * currentNum;
                currentNum = 0;
                currentSign = -signStack.Peek(); // Invert active parenthetical sign
            } else if (c == '(') {
                // Entering subexpression: push the current contextual sign
                signStack.Push(currentSign);
            } else if (c == ')') {
                result += currentSign * currentNum;
                currentNum = 0;
                // Exiting subexpression: pop the contextual sign
                signStack.Pop();
            }
        }

        // Add remaining accumulated number
        result += currentSign * currentNum;
        return result;
    }
}
```

#### Complexity Analysis:
- **Time Complexity:** $O(N)$ — Single pass over `s`.
- **Space Complexity:** $O(N)$ — Stack depth is bounded by the maximum nesting depth of parentheses.

---

## 3. 🏋️ PRACTICE: Your Daily Challenges

Master compiler expression parsing on LeetCode:

### Problem 1 (Postfix Machine): LeetCode 150 — Evaluate Reverse Polish Notation (Medium)
- **Goal:** Implement the LIFO operand evaluation loop.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.

### Problem 2 (Precedence State Machine): LeetCode 227 — Basic Calculator II (Medium)
- **Goal:** Implement both the stack solution and the optimal $O(1)$ space accumulator solution.
- **Target Complexity:** $O(N)$ time, $O(1)$ space.

### Problem 3 (Parenthesis Sign Propagation): LeetCode 224 — Basic Calculator (Hard)
- **Goal:** Implement the sign stack pattern to distribute unary negatives across nested parentheses.
- **Target Complexity:** $O(N)$ time, $O(N)$ space.

### Bonus / Grandmaster Challenge: LeetCode 772 — Basic Calculator III (Hard)
- **Goal:** Evaluate expressions combining `+`, `-`, `*`, `/`, and `(`, `)`.
- **Hint:** Combine Shunting-Yard or treat each `(...)` as a recursive sub-calculation!

---

## 4. 🔗 CONNECT: The Pattern Decision Bridge

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Expression Parsing Decision Tree                     │
└────────────────────────────────────────────────────────────────────────┘
                   │
                   ├─► Expression is already in Postfix (RPN) format?
                   │   └─► Single Operand Stack (Pop b, Pop a, Push a op b) [LC 150]
                   │
                   ├─► Infix with +, -, *, / but NO parentheses?
                   │   └─► Trailing Operator State Machine (O(1) Space accumulator) [LC 227]
                   │
                   ├─► Infix with +, - and NESTED parentheses?
                   │   └─► Sign-Stack Invariant (Multiply signStack.Peek()) [LC 224]
                   │
                   ├─► General Infix with +, -, *, / AND nested parentheses?
                   │   └─► Dijkstra's Shunting-Yard Algorithm or Recursive Descent [LC 772]
                   │
                   └─► Decoding nested repetition strings (e.g. "3[a2[c]]")?
                       └─► Nested State Stacks (Day 55) [LC 394, LC 316]
```

### Preview for Day 55: Complex Stack Automata & String Decoding
Tomorrow in **Day 55**, we extend stack state machines from arithmetic to **hierarchical string decoding and greedy elimination**:
- **[LeetCode 394] Decode String:** Managing dual stacks (`countStack` + `stringStack`) to unwind arbitrary repetition nestings.
- **[LeetCode 316] Remove Duplicate Letters:** Combining greedy lexicographical ordering with monotonic stacks and remaining character frequency maps.
- **[LeetCode 402] Remove K Digits:** Greedy removal using monotonic increasing stack.

---

## 5. 🎯 Day 54 Checkpoint Questions

Verify your mastery of arithmetic parsing invariants:

1. **Non-Commutative Operand Pop Order:** In LeetCode 150, when an operator is encountered and you pop two values, why must the first popped value be `b` and the second `a` when computing `a / b`?
2. **$O(1)$ Space Precedence Invariant:** In LeetCode 227, explain why `totalResult += lastTerm` is executed when encountering a `+` or `-`, but is NOT executed when encountering a `*` or `/`.
3. **Sign-Stack Distribution:** In LeetCode 224, trace the value of `signStack` and `currentSign` on the expression `1 - (2 - 3)`. Show how `- 3` inside the parentheses becomes `+ 3` in the final sum.
4. **Shunting-Yard Precedence Check:** During Dijkstra's Shunting-Yard algorithm, when an incoming operator has lower precedence than the operator currently on top of the stack, why must the stack operator be popped to the output queue before the incoming operator can be pushed?
