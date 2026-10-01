---
title: "Week 24 — Day 166: Advanced DSU: Potential Fields, Weighted DSU & Parity Relations"
---

# Week 24 — Day 166: Advanced DSU: Potential Fields, Weighted DSU & Parity Relations

Welcome to **Day 166 of your DSA Mastery Journey**!

Standard Disjoint Set Union answers a binary question: *"Do elements $x$ and $y$ belong to the same connected component?"* It partitions elements into disjoint buckets, but it stores zero information about the **relative relationship** between elements in the same set.

In advanced systems design, mathematical constraint solvers, and competitive programming, relationships carry quantitative values:
- In algebra solvers: $A$ is $2.0 \times B$, and $B$ is $3.0 \times C$. What is the ratio $A / C$?
- In game theory and physics: Particle $x$ has potential energy relative to particle $y$ ($\Delta V_{xy} = V_x - V_y$).
- In 2-coloring and bipartite networks: Elements $x$ and $y$ have opposite parity (they belong to different partitions of a bipartite graph).

When relationships satisfy **transitivity** (e.g. vector addition, multiplication, or XOR parity), we can augment DSU to maintain **Potential Fields**—also known as **Weighted DSU** or **Vector DSU**.

Today, you will master:
1. **The Vector Potential Invariant:** Defining `weight[x]` as the relative offset between element $x$ and its immediate parent `parent[x]`.
2. **Vector Composition during Path Compression:** Updating offsets transitively as pointers are flattened: `weight[x] = weight[x] * weight[oldParent]`.
3. **From-Scratch C# Container:** Building `WeightedDisjointSetUnion` with multiplicative ratio tracking and consistency checks.
4. **Canonical Problem Mastery:** Conquering **[LeetCode 399] Evaluate Division** (transitive ratio propagation) and **[LeetCode 990] Satisfiability of Equality Equations** (variable equivalence consistency).

---

## 🧭 Executive Curriculum Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│              DAY 166: WEIGHTED DSU, POTENTIAL FIELDS & PARITY PROPAGATION                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
│       THE POTENTIAL FIELD MODEL   │                             │    VECTOR COMPOSITION ON FIND     │
├───────────────────────────────────┤                             ├───────────────────────────────────┤
│ • Standard DSU:                   │                             │ • Path Compression with Weights:  │
│   parent[x] = root.               │ ── Relative Field Bridge ──►│   int oldP = parent[x];           │
│ • Weighted DSU:                   │                             │   parent[x] = Find(oldP);         │
│   weight[x] = value(x) - value(p) │                             │   weight[x] *= weight[oldP];      │
│   (or ratio x / p).               │                             │ • Transitivity:                   │
│ • Transitive Relation:            │                             │   (x / oldP) * (oldP / root)      │
│   x ~ p, p ~ root => x ~ root!    │                             │   = (x / root)!                   │
└───────────────────────────────────┘                             └───────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌─────────────────────────────────────────────┐
                          │         CANONICAL PROBLEM MASTERY           │
                          ├─────────────────────────────────────────────┤
                          │ • Production WeightedDisjointSetUnion class │
                          │ • [LC 399] Evaluate Division (Medium)       │
                          │ • [LC 990] Satisfiability of Equations (Med)│
                          └─────────────────────────────────────────────┘
```

---

## 1. 🧠 TEACH: Concept, Invariants & Memory Architecture

### 1.1 🗝️ The Visual Mental Model: Potential Fields along Trees

In a standard DSU tree, the root represents the cluster.
In a **Weighted DSU**, the root serves as the **Origin of Coordinates (Datum Reference)** for the entire cluster.
Every node $x$ maintains a relative displacement vector:
$$\text{Vector}(x) = \text{Value}(x) - \text{Value}(\text{parent}[x])$$
or in a multiplicative field (ratios):
$$\text{Weight}[x] = \frac{\text{Value}(x)}{\text{Value}(\text{parent}[x])}$$

```
                    MULTIPLICATIVE POTENTIAL TREE (ROOT = R)

                                 [ R ] (Root / Datum = 1.0)
                                /     \
                       w=2.0  /         \  w=3.0
                            /             \
                        [ A ]             [ B ]
                          │
                   w=4.0  │
                          ▼
                        [ C ]

    What is the ratio of C relative to Root R?
    • C relates to A: C / A = 4.0
    • A relates to R: A / R = 2.0
    • By transitive chain multiplication:
      C / R = (C / A) * (A / R) = 4.0 * 2.0 = 8.0!
```

---

### 1.2 🖼️ Visual Mechanics: Vector Composition during Path Compression

When `Find(C)` is invoked, we want to redirect `C` to point directly to root `R`.
What happens to `weight[C]`?
Before compression: `parent[C] = A` and `weight[C] = 4.0`.
During compression, `Find(A)` flattens `A` to `R`, making `parent[A] = R` and `weight[A] = 2.0`.
To preserve the physical invariant $C / R = 8.0$, we must multiply `weight[C]` by `weight[oldParent]`!

```
                  PATH COMPRESSION VECTOR COMPOSITION

       BEFORE Find(C):                          AFTER Find(C):
            [ R ]                                    [ R ]
              │                                     /     \
         w=2.0│                               w=2.0/       \ w=8.0 (4.0 * 2.0)
              ▼                                   ▼         ▼
            [ A ]                               [ A ]     [ C ]
              │                                 
         w=4.0│                                 Direct pointer to Root!
              ▼                                 Weight is now C / R = 8.0!
            [ C ]
```

#### The Universal Path Compression Recurrence:
```csharp
public int Find(int x)
{
    if (parent[x] != x)
    {
        int oldParent = parent[x];
        parent[x] = Find(oldParent);      // Flatten oldParent to root first!
        weight[x] *= weight[oldParent];   // Multiplicative composition
        // (For additive potential: weight[x] += weight[oldParent])
        // (For XOR parity:         weight[x] ^= weight[oldParent])
    }
    return parent[x];
}
```

---

### 1.3 🧮 Mathematical Derivation: Union of Two Weighted Trees

Suppose we are given a new relationship:
$$\frac{X}{Y} = V$$
where $X$ belongs to a tree with root $R_X$, and $Y$ belongs to a tree with root $R_Y$.

To merge the two trees, we must attach one root to the other (e.g. attach $R_X$ under $R_Y$):
$$\text{parent}[R_X] = R_Y$$
**What must the edge weight `weight[Rx]` be set to?**

```
                    DERIVING THE WEIGHT OF THE MERGE EDGE

          [ Rx ]                                 [ Ry ]
            │ (weight[X] = X / Rx)                 │ (weight[Y] = Y / Ry)
            ▼                                      ▼
          [ X ] ------------ (X / Y = V) -------- [ Y ]

   We want to find: W = Rx / Ry = weight[Rx]

   Express X and Y in terms of their roots:
   1. X = Rx * weight[X]  ==>  Rx = X / weight[X]
   2. Y = Ry * weight[Y]  ==>  Ry = Y / weight[Y]

   Substitute into W:
   W = Rx / Ry = (X / weight[X]) / (Y / weight[Y])
               = (X / Y) * (weight[Y] / weight[X])
               = V * (weight[Y] / weight[X])!
```

> [!IMPORTANT]
> **The Universal Weight Update Formula:**
> When attaching root $R_X$ under root $R_Y$ given relation $\frac{X}{Y} = V$:
> $$\text{weight}[R_X] = \frac{V \cdot \text{weight}[Y]}{\text{weight}[X]}$$
> (For additive potentials with $X - Y = \Delta$: $\text{weight}[R_X] = \Delta + \text{weight}[Y] - \text{weight}[X]$).

---

### 1.4 5W1H Executive Architecture Blueprint: Weighted DSU

| Dimension | Architectural Specification |
| :--- | :--- |
| **1. WHAT** | An augmented DSU data structure where each node maintains a directed scalar or vector potential relative to its immediate parent. |
| **2. WHY** | Solves systems of equations, ratio evaluation, and bipartite parity constraints dynamically without building full graph adjacency matrices or running repeated BFS traversals. |
| **3. WHEN** | Division/ratio queries ([LC 399]), variable equality/inequality verification ([LC 990]), potential differences in electrical circuits, relative coordinate systems. |
| **4. WHERE** | Two parallel arrays: `int[] parent` and `double[] weight` (or `int[] diff`). Contiguous cache-friendly storage. |
| **5. WHO** | *"I track relative potential fields using Weighted DSU. During path compression, vector offsets compose transitively via chain multiplication or addition, allowing query evaluations in $O(\alpha(N))$ time."* |
| **6. HOW** | On `Find(x)`, recursively compress root, updating `weight[x] = weight[x] * weight[oldParent]`. On `Union(x, y, ratio)`, connect `parent[rootX] = rootY` with derived weight $V \cdot \text{weight}[Y] / \text{weight}[X]$. |

---

## 2. ⚙️ IMPLEMENT: Production-Grade Container

Here is the production-grade, standalone compilable C# implementation of `WeightedDisjointSetUnion` supporting multiplicative ratios, cycle detection, and consistency verification.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AdvancedGraphAlgorithms.DisjointSet
{
    /// <summary>
    /// Production-grade Weighted Disjoint Set Union (Ratio Potential Field).
    /// Tracks multiplicative relationships: Value(x) = weight[x] * Value(parent[x]).
    /// </summary>
    public sealed class WeightedDisjointSetUnion
    {
        private readonly int[] _parent;
        private readonly double[] _weight;

        /// <summary>
        /// Initializes a new weighted disjoint set universe of size n.
        /// </summary>
        public WeightedDisjointSetUnion(int n)
        {
            if (n <= 0) throw new ArgumentOutOfRangeException(nameof(n));

            _parent = new int[n];
            _weight = new double[n];

            for (int i = 0; i < n; i++)
            {
                _parent[i] = i;
                _weight[i] = 1.0; // x / parent[x] = 1.0 initially
            }
        }

        /// <summary>
        /// Finds the canonical root of x, recursively compressing the path
        /// and updating weight[x] to represent x / root.
        /// </summary>
        public int Find(int x)
        {
            if (_parent[x] != x)
            {
                int oldParent = _parent[x];
                _parent[x] = Find(oldParent);
                // Vector composition: (x / oldParent) * (oldParent / root) = (x / root)
                _weight[x] *= _weight[oldParent];
            }
            return _parent[x];
        }

        /// <summary>
        /// Unions the sets containing x and y given the relationship: x / y = value.
        /// </summary>
        /// <param name="x">First element index.</param>
        /// <param name="y">Second element index.</param>
        /// <param name="value">The ratio x / y.</param>
        /// <returns>True if merged or consistent; False if contradictory.</returns>
        public bool Union(int x, int y, double value)
        {
            int rootX = Find(x);
            int rootY = Find(y);

            if (rootX == rootY)
            {
                // Already in same set: verify consistency!
                // Current ratio is (x / root) / (y / root) = _weight[x] / _weight[y]
                double currentRatio = _weight[x] / _weight[y];
                return Math.Abs(currentRatio - value) < 1e-6;
            }

            // Attach rootX under rootY
            // We need weight[rootX] = rootX / rootY
            // From formula: rootX / rootY = (x / y) * (y / rootY) / (x / rootX)
            //                             = value * _weight[y] / _weight[x]
            _parent[rootX] = rootY;
            _weight[rootX] = value * _weight[y] / _weight[x];

            return true;
        }

        /// <summary>
        /// Evaluates the ratio x / y if x and y belong to the same component.
        /// </summary>
        /// <returns>The evaluated ratio, or -1.0 if disconnected.</returns>
        public double QueryRatio(int x, int y)
        {
            int rootX = Find(x);
            int rootY = Find(y);

            if (rootX != rootY)
            {
                return -1.0; // Disconnected: ratio cannot be determined
            }

            // x / y = (x / root) / (y / root) = _weight[x] / _weight[y]
            return _weight[x] / _weight[y];
        }

        // ====================================================================
        // SELF-VALIDATING TEST SUITE
        // ====================================================================
        public static void Main()
        {
            Console.WriteLine("==================================================");
            Console.WriteLine("RUNNING TEST SUITE: WeightedDisjointSetUnion");
            Console.WriteLine("==================================================");

            var wdsu = new WeightedDisjointSetUnion(5);

            // Given: 0 / 1 = 2.0 (A / B = 2.0)
            // Given: 1 / 2 = 3.0 (B / C = 3.0)
            Debug.Assert(wdsu.Union(0, 1, 2.0) == true);
            Debug.Assert(wdsu.Union(1, 2, 3.0) == true);

            // Query: A / C (0 / 2) -> Should be 2.0 * 3.0 = 6.0
            double ratioAC = wdsu.QueryRatio(0, 2);
            Debug.Assert(Math.Abs(ratioAC - 6.0) < 1e-6, $"Expected 6.0, got {ratioAC}");

            // Query: C / A (2 / 0) -> Should be 1.0 / 6.0 ≈ 0.166667
            double ratioCA = wdsu.QueryRatio(2, 0);
            Debug.Assert(Math.Abs(ratioCA - (1.0 / 6.0)) < 1e-6);

            // Contradiction Check: Try saying A / C = 5.0 (which contradicts 6.0)
            Debug.Assert(wdsu.Union(0, 2, 5.0) == false, "Contradictory relationship must be rejected!");

            // Disconnected Check: Element 4 has no relation
            Debug.Assert(wdsu.QueryRatio(0, 4) == -1.0, "Disconnected ratio must return -1.0.");

            Console.WriteLine("✅ All WeightedDisjointSetUnion assertions passed successfully!");
        }
    }
}
```

---

## 3. 🔬 ANALYZE: Operational Deep-Dive (5 Dimensions)

### Dimension 1: Mathematical Contract & Asymptotic Proofs

| Operation | Amortized Time Complexity | Space Complexity | Correctness Invariant |
| :--- | :--- | :--- | :--- |
| **`Find(x)`** | $\mathbf{\Theta(\alpha(N))}$ | $O(\log N)$ call stack | Maintains invariant $\text{weight}[x] = \text{Value}(x) / \text{Value}(\text{parent}[x])$. |
| **`Union(x, y, v)`** | $\mathbf{\Theta(\alpha(N))}$ | $O(1)$ auxiliary | Attaches roots while satisfying $x / y = v$. |
| **`QueryRatio(x, y)`** | $\mathbf{\Theta(\alpha(N))}$ | $O(1)$ auxiliary | Computes $\text{weight}[x] / \text{weight}[y]$ if $\text{root}(x) = \text{root}(y)$. |

---

### Dimension 2: Step-by-Step Execution Trace

Let us trace `wdsu.Union(0, 1, 2.0)` and `wdsu.Union(1, 2, 3.0)`:

| Step | Call | `parent[]` | `weight[]` | Invariant Check |
| :---: | :--- | :--- | :--- | :--- |
| 0 | *Init* | `[0, 1, 2]` | `[1.0, 1.0, 1.0]` | $x / \text{parent}[x] = 1.0$ |
| 1 | `Union(0, 1, 2.0)` | `[1, 1, 2]` | `[2.0, 1.0, 1.0]` | $0 / 1 = 2.0$. `parent[0] = 1`, `weight[0] = 2.0`. |
| 2 | `Union(1, 2, 3.0)` | `[1, 2, 2]` | `[2.0, 3.0, 1.0]` | $1 / 2 = 3.0$. `parent[1] = 2`, `weight[1] = 3.0`. |
| 3 | `QueryRatio(0, 2)` | Unwinds `Find(0)` | `weight[0] = 2.0 * 3.0 = 6.0` | `Find(0)` flattens `0 -> 2`. `weight[0] = 6.0`. |
| 4 | Final State | `[2, 2, 2]` | `[6.0, 3.0, 1.0]` | Direct evaluation: $0/2 = 6.0/1.0 = 6.0$. |

---

### Dimension 3: Visual ASCII State Transitions

```
               WEIGHTED UNION VECTOR POTENTIAL EVOLUTION

    Initial State:
    [ 0 ] (w=1.0)       [ 1 ] (w=1.0)       [ 2 ] (w=1.0)

    After Union(0, 1, v=2.0):
           [ 1 ] (Root)
             │
        w=2.0│ (0 / 1 = 2.0)
             ▼
           [ 0 ]

    After Union(1, 2, v=3.0):
                 [ 2 ] (Root)
                   │
              w=3.0│ (1 / 2 = 3.0)
                   ▼
                 [ 1 ]
                   │
              w=2.0│
                   ▼
                 [ 0 ]

    During QueryRatio(0, 2) -> Find(0):
    1. Find(1) returns root 2, weight[1] = 3.0
    2. parent[0] becomes 2
    3. weight[0] = weight[0] * weight[oldParent] = 2.0 * 3.0 = 6.0!
```

---

### Dimension 4: Invariant Preservation Proofs

1. **Path Compression Multiplicative Invariant:**
   At all times, $\text{weight}[x] = \text{Value}(x) / \text{Value}(\text{parent}[x])$.
   - *Proof:* Suppose $p = \text{parent}[x]$. When $\text{Find}(p)$ returns, $p$ now points to root $R$, and $\text{weight}[p] = \text{Value}(p) / \text{Value}(R)$.
   - When we update $\text{weight}[x] \leftarrow \text{weight}[x] \times \text{weight}[p]$, we have:
     $$\text{weight}[x]_{\text{new}} = \left(\frac{\text{Value}(x)}{\text{Value}(p)}\right) \times \left(\frac{\text{Value}(p)}{\text{Value}(R)}\right) = \frac{\text{Value}(x)}{\text{Value}(R)}$$
   - Since $\text{parent}[x]$ is simultaneously updated to $R$, the invariant is maintained exactly!

---

### Dimension 5: Edge Case Analysis & Defense Matrix

| Edge Case Scenario | Potential Failure Mode | Built-in Defense Mechanism |
| :--- | :--- | :--- |
| **Division by Zero** | NaN / Infinity in floating-point operations. | Ratios must be non-zero in problem formulation; reject zero-weight inputs. |
| **Self Query: $X / X$** | Unregistered variable query. | Verify that variable exists in dictionary before returning 1.0. |
| **Floating-Point Precision Drift** | Accumulated rounding errors in deep chains. | Path compression flattens trees to depth 1, minimizing rounding operations to at most 1 per query. |
| **Contradictory Equations** | Cycle with conflicting constraints ($A/B = 2$ and $A/B = 3$). | `if (rootX == rootY)` checks tolerance: `Math.Abs(currentRatio - value) < 1e-6`. |

---

## 4. 🎬 DEMONSTRATE: Canonical LeetCode Walkthroughs

### 4.1 [LeetCode 399] Evaluate Division (Medium)

#### Problem Formulation
You are given an array of variable pairs `equations` and an array of real numbers `values`, where `equations[i] = [Ai, Bi]` and `values[i]` represents $Ai / Bi = values[i]$. Given queries `queries[j] = [Cj, Dj]`, return the answers to all queries. If a single answer cannot be determined, return `-1.0`.

#### Complete C# Weighted DSU Solution
```csharp
public sealed class EvaluateDivisionSolution
{
    private sealed class WeightedDsu
    {
        private readonly int[] _parent;
        private readonly double[] _weight;

        public WeightedDsu(int n)
        {
            _parent = new int[n];
            _weight = new double[n];
            for (int i = 0; i < n; i++)
            {
                _parent[i] = i;
                _weight[i] = 1.0;
            }
        }

        public int Find(int x)
        {
            if (_parent[x] != x)
            {
                int oldParent = _parent[x];
                _parent[x] = Find(oldParent);
                _weight[x] *= _weight[oldParent];
            }
            return _parent[x];
        }

        public void Union(int x, int y, double value)
        {
            int rootX = Find(x);
            int rootY = Find(y);
            if (rootX == rootY) return;

            _parent[rootX] = rootY;
            _weight[rootX] = value * _weight[y] / _weight[x];
        }

        public double Query(int x, int y)
        {
            int rootX = Find(x);
            int rootY = Find(y);
            if (rootX != rootY) return -1.0;

            return _weight[x] / _weight[y];
        }
    }

    public double[] CalcEquation(IList<IList<string>> equations, double[] values, IList<IList<string>> queries)
    {
        // 1. Map string variable names to contiguous integer IDs
        var varToId = new Dictionary<string, int>();
        int idGen = 0;

        foreach (var eq in equations)
        {
            if (!varToId.ContainsKey(eq[0])) varToId[eq[0]] = idGen++;
            if (!varToId.ContainsKey(eq[1])) varToId[eq[1]] = idGen++;
        }

        var dsu = new WeightedDsu(idGen);

        // 2. Build the weighted potential forest
        for (int i = 0; i < equations.Count; i++)
        {
            int u = varToId[equations[i][0]];
            int v = varToId[equations[i][1]];
            double val = values[i];
            dsu.Union(u, v, val);
        }

        // 3. Process queries
        var results = new double[queries.Count];
        for (int i = 0; i < queries.Count; i++)
        {
            string varA = queries[i][0];
            string varB = queries[i][1];

            if (!varToId.ContainsKey(varA) || !varToId.ContainsKey(varB))
            {
                results[i] = -1.0;
            }
            else
            {
                results[i] = dsu.Query(varToId[varA], varToId[varB]);
            }
        }

        return results;
    }
}
```

#### Complexity Analysis
- **Time Complexity:** $O((E + Q) \cdot \alpha(V))$ where $E$ is equations count, $Q$ is queries count, and $V \le 2E$. Each equation merge and query lookup is near $O(1)$.
- **Space Complexity:** $O(V)$ for variable dictionary and DSU arrays.

---

### 4.2 [LeetCode 990] Satisfiability of Equality Equations (Medium)

#### Problem Formulation
Given an array of strings `equations` representing relationships between variables (e.g. `"a==b"` or `"b!=c"`). Return `true` if it is possible to assign integers to variable names to satisfy all equations, or `false` otherwise.

#### Two-Pass DSU Invariant
1. Variables are lowercase English letters (`'a'` to `'z'`), so $V = 26$.
2. **Pass 1:** Process all equality equations `"=="`. Merge variables using standard DSU: `dsu.Union(u, v)`.
3. **Pass 2:** Process all inequality equations `"!="`. If any inequality pair shares the exact same root (`dsu.Find(u) == dsu.Find(v)`), a direct mathematical contradiction exists; return `false`!

```csharp
public sealed class SatisfiabilityOfEqualityEquationsSolution
{
    public bool EquationsPossible(string[] equations)
    {
        var parent = new int[26];
        for (int i = 0; i < 26; i++) parent[i] = i;

        int Find(int x)
        {
            if (parent[x] != x) parent[x] = Find(parent[x]);
            return parent[x];
        }

        void Union(int x, int y)
        {
            int rx = Find(x);
            int ry = Find(y);
            if (rx != ry) parent[rx] = ry;
        }

        // Pass 1: Union all equalities
        foreach (var eq in equations)
        {
            if (eq[1] == '=')
            {
                int u = eq[0] - 'a';
                int v = eq[3] - 'a';
                Union(u, v);
            }
        }

        // Pass 2: Verify inequalities do not contradict
        foreach (var eq in equations)
        {
            if (eq[1] == '!')
            {
                int u = eq[0] - 'a';
                int v = eq[3] - 'a';
                if (Find(u) == Find(v))
                {
                    return false; // Contradiction!
                }
            }
        }

        return true;
    }
}
```

#### Complexity Analysis
- **Time Complexity:** $O(N \cdot \alpha(26)) = O(N)$.
- **Space Complexity:** $O(1)$ (26 integers).

---

## 5. 🏋️ PRACTICE: Guided Exercises & Problem Set

### Exercise 1: Possible Bipartition via Parity DSU ([LeetCode 886] - Medium)
- **Constraint:** Given $N$ people and a list of dislikes `dislikes[i] = [a, b]`. Can we split into 2 groups?
- **Parity DSU Hint:** Track parity: `diff[x] = (color[x] ^ color[parent[x]])`. Alternatively, maintain $2N$ nodes where node $x$ has an enemy node $x + N$.

### Exercise 2: Similar String Groups ([LeetCode 839] - Hard)
- **Constraint:** Two strings are similar if they can be made equal by swapping at most two characters. Group similar strings into equivalence classes.

---

## 6. 🔗 CONNECT: The Pattern Decision Bridge

```
                     WEIGHTED DSU CONSTRAINT PATTERN

                 What type of relation exists between nodes?
                                  /       \
                     EQUALITY ONLY        QUANTITATIVE / RELATIVE
                         /                         \
                [Standard DSU]            What mathematical group?
               parent[x] = root                  /           \
                                         ADDITIVE             MULTIPLICATIVE
                                       POTENTIALS                 RATIOS
                                     weight[x] += weight[p]   weight[x] *= weight[p]
                                     (Mod 2 / Parity)         ([LC 399] Division)
```

---

## 7. 🎯 Daily Checkpoint Questions

### Diagnostic Question
In a weighted DSU tracking ratios $x / \text{parent}[x]$, how do you update the ratio during path compression and set union?

### Architectural Model Answer
1. **During Path Compression (`Find(x)`):**
   - Save `oldParent = parent[x]`.
   - Recursively call `Find(oldParent)` to flatten `oldParent` to root $R$, which recursively updates `weight[oldParent] = oldParent / R`.
   - Update `parent[x] = parent[oldParent]`.
   - By transitive chain multiplication:
     $$\frac{x}{R} = \frac{x}{\text{oldParent}} \times \frac{\text{oldParent}}{R}$$
     Therefore: `weight[x] = weight[x] * weight[oldParent]`.
2. **During Set Union (`Union(x, y, value)` where $x / y = \text{value}$):**
   - Let $R_X = \text{Find}(x)$ and $R_Y = \text{Find}(y)$.
   - To attach $R_X$ under $R_Y$ (`parent[Rx] = Ry`), the merge edge weight must equal $R_X / R_Y$.
   - Expressing $R_X$ and $R_Y$ in terms of known quantities:
     $$R_X = \frac{x}{\text{weight}[x]}, \quad R_Y = \frac{y}{\text{weight}[y]}$$
   - Dividing gives:
     $$\text{weight}[R_X] = \frac{R_X}{R_Y} = \left(\frac{x}{y}\right) \times \frac{\text{weight}[y]}{\text{weight}[x]} = \text{value} \times \frac{\text{weight}[y]}{\text{weight}[x]}$$
