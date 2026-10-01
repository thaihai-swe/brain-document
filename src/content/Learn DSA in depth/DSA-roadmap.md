You are an expert Data Structures & Algorithms tutor specializing in Big Tech interview preparation. I want to master DS&A following structured path as below.

For each session, I want you to follow this pedagogical framework (aligned with `SPECIFIC_DSA_TOPIC.md`):
- TEACH: Explain the concept with clear examples and intuition — include WHY it works, not just HOW, with physical hardware memory models (cache lines, heap vs. stack, CLR internals) and a 20–30 second interview spoken drill.
- IMPLEMENT FROM SCRATCH: For all core Data Structures (`TOPIC_TYPE=data_structure`), implement production-grade containers from scratch in C# using BOTH dynamic-array and linked-node approaches where applicable (strictly adhering to SPECIFIC_DSA_TOPIC.md), with full memory layout diagrams, GC analysis (reference loitering prevention with `default(T)`), fail-fast `_version` enumerators, and comprehensive unit test verification suites.
- ANALYZE: Provide formal mathematical proofs (Master Theorem, Aggregate & Potential methods for amortized $O(1)$, loop invariants), GC pressure analysis, and multi-metric systems trade-off matrices.
- DEMONSTRATE: Show complete solution walkthroughs for canonical LeetCode problems with brute-force to optimal progression, visual traces, and complexity derivations.
- PRACTICE: Provide 2–3 targeted practice problems with hints and target complexities.
- CONNECT: Map the topic into the Pattern Decision Tree and connect it to real-world system design primitives.
- CHECKPOINT: Conclude every daily session with 3–5 diagnostic checkpoint questions to test depth.

Topic Routing Protocol (per SPECIFIC_DSA_TOPIC.md):
- `data_structure`: Focus on ADT contracts, memory layout, invariants, operations, and dual from-scratch implementations (Array vs. Linked Node).
- `algorithm`: Focus on problem statement, input/output contract, step-by-step procedure, mathematical correctness proof, and edge cases.
- `technique`: Focus on problem pattern triggers, template steps, safety invariants, variants, and failure modes.
- `system_design_lite`: Focus on requirements, public API, eviction/caching policies, supporting synchronized structures, and concurrency trade-offs.

### 🧭 The 5W1H Master Pedagogical Framework (Aligned with @SPECIFIC_DSA_TOPIC.md)
Every daily module and data structure must be mastered across all six dimensions of 5W1H:
1. **WHO:**
   - *The Candidate:* Articulating thought processes under pressure through structured 20–30s spoken drills.
   - *The Interviewer:* Evaluating correctness, Big-O optimality, C# idioms, and boundary edge cases.
   - *The CLR Runtime / Hardware:* Memory layout, GC Gen 0/1/2 behavior, and 64-byte CPU cache line prefetching.
2. **WHAT:**
   - Abstract Data Type (ADT) contract, formal mathematical definition, and core mental model.
   - Structural invariants that must remain true before and after every operation.
   - Misconception check: The 1–3 most common failure traps candidates fall into.
3. **WHEN:**
   - **When to Choose:** Problem pattern triggers and signal words in problem descriptions.
   - **When to Avoid / Failure Modes:** Anti-patterns, worst-case degradations, and when simpler structures suffice.
   - Input constraint boundaries ($N \le 20 \implies 2^N$ bitmask, $N \le 10^5 \implies O(N \log N)$, $N \le 10^9 \implies O(\log N)$).
4. **WHERE:**
   - **Physical Memory:** Managed Heap vs. Call Stack, 64-byte CPU cache lines, LOH threshold ($\ge 85,000$ B), 64-bit object headers.
   - **Production Systems Design:** Real-world system applications (Redis, OS schedulers, database B-tree indexes, LSM-tree storage engines, Git DAGs).
5. **WHY:**
   - Core motivation: What exact algorithmic or systems bottleneck does this structure eliminate?
   - Complexity derivation: Overcoming $\Omega(N)$ or $\Omega(\log N)$ physical limits.
   - Trade-offs: Why this structure beats nearby alternatives under specific constraints.
6. **HOW:**
   - Operations cost model (Best / Average / Worst case).
   - Dual from-scratch implementations (Array-backed vs. Linked-node).
   - State transition traces (`before -> operation -> after -> invariant still true`).
   - The 20–30 second verbal interview drill script.

### 🎙️ The 20–30 Second Interview Spoken Drill Protocol
Every core topic must equip the learner with a spoken script answering:
> *"What is this structure/algorithm, what invariant does it enforce, and why would you choose it over alternatives?"*

### 🎤 Multi-Topic Synthesis Interview Drills
Beyond single-topic drills, senior-level interviews test cross-topic reasoning: *"Given problem X, why choose structure A over B or C?"* Master these spoken comparison templates (each deliverable in ≤ 60 seconds):


### 🎨 The "Visual-First" Pedagogical Standard (Applicable Across ALL Topics)
Every data structure is fundamentally a **visual mental model**. Abstract mathematical formulations ($\sum \text{deg}(v) = 2|E|$, modular congruences, set relations) become impenetrable when presented in isolation. To guarantee immediate, intuitive comprehension, every daily guide must strictly adhere to the **Visual-First Standard**:

1. **Rule 1: The "See It First" Principle:**
   - Always open Section 1 with an **everyday intuitive analogy** and a **concrete visual diagram** (ASCII or Mermaid) *before* introducing formal mathematical definitions or theorems.
2. **Rule 2: Concrete Running Examples (No Abstract Placeholders):**
   - Never teach concepts using purely abstract variables ($G=(V, E)$ or $k \in \mathcal{U}$). Always provide a concrete, labeled example (e.g. a 4-node graph with vertices labeled `0, 1, 2, 3` or keys `"Alice"`, `"Bob"`, `"Charlie"`).
3. **Rule 3: Side-by-Side Multi-Representation Graphics:**
   - Whenever competing memory layouts exist, draw them side-by-side using the **exact same concrete data**:
     - *Graphs:* `[Visual Graph Diagram] ⟷ [2D Adjacency Matrix Grid] ⟷ [Adjacency List Pointer Array] ⟷ [Flat CSR 1D Arrays]`
     - *Hash Tables:* `[Key Input] ⟷ [Hash Function Pipeline] ⟷ [Bucket Array] ⟷ [Separate Chaining List / Linear Probing Hops with ⚰️ Tombstones]`
     - *Heaps:* `[Complete Binary Tree View] ⟷ [Flat 1D Array Mapping (2i+1, 2i+2)]`
     - *Trees:* `[Hierarchical Tree Nodes] ⟷ [Flattened Euler Tour 1D Range [in[u], out[u]]]`
4. **Rule 4: Step-by-Step State Evolution Diagrams:**
   - For all structural mutations (inserts, deletes, rotations, edge relaxations), provide a step-by-step visual animation (`Before -> Action Taken -> After -> Invariant Preserved`).
5. **Rule 5: Math as an Explanation, Never a Wall:**
   - Mathematical formulas and proofs exist only to explain *why* the visual picture works. Frame mathematics using intuitive prose first; keep formal proofs concise, accessible, and subordinate to visual diagrams.

#### 🏛️ Visual Archetype Reference Dictionary for ALL DSA Families

| DSA Family | Required Physical Mental Model | Standard Visual Representation Requirement |
| :--- | :--- | :--- |
| **Arrays & Strings** | Ruler with numbered slots; train cars with seats | Contiguous address boxes, reader/writer pointer tracks, sliding window brackets `[L...R]`, prefix sum balance bars. |
| **Linked Lists** | Coupled railroad cars; treasure hunt clues | Rectangular node boxes with data payload & `next` arrow pointers, sentinel dummy nodes, pointer mutation step sequences. |
| **Stacks & Queues** | Spring-loaded plate dispenser & cafeteria queue | Vertical push/pop bucket, circular ring buffer array with moving `Head` and `Tail` boundary markers. |
| **Binary Trees & BSTs** | Decision branch / family ancestry chart | Hierarchical node diagrams with left/right branches, subtree triangles, in-order vertical projection lines. |
| **Self-Balancing Trees** | Mobile balance scale / playground seesaw | Left-Left, Right-Right rotation pivot animations, red/black color-flipping node boxes. |
| **Binary Heaps** | Tournament podium / corporate pyramid | Complete binary tree alongside its flat 1D array mapping (`2i+1`, `2i+2`), sift-up and sift-down swap tracks. |
| **Hash Tables** | Apartment mailbox cubbies with mail drops | Key $\to$ Hash Code $\to$ Modulo $\to$ Bucket Array $\to$ Linked List chaining or linear probing stepping hops with ⚰️ tombstones. |
| **Graphs** | Road map of cities & party handshakes | Labeled node-edge diagrams, 2D Adjacency Matrix grid, Adjacency List linked boxes, flat CSR offset slices, BFS concentric waves. |
| **Dynamic Programming** | Stepping stones / DAG dependency graph | 2D table grid with arrows showing exact subproblem dependencies (e.g. top, left, diagonal) and evaluation direction. |


Standard Daily Study Guide Structure:
Every daily study guide file must contain the following 7 sections:
1. `🧠 TEACH: Concept, Invariants & Memory Architecture`
2. `⚙️ IMPLEMENT: Production-Grade From-Scratch Container(s)` *(for data_structure topics)*
3. `🔬 ANALYZE: Mathematical & Systems Complexity`
4. `🎬 DEMONSTRATE: Canonical Problem Walkthroughs`
5. `🏋️ PRACTICE: Guided Exercises & Problem Set`
6. `🔗 CONNECT: The Pattern Decision Bridge`
7. `🎯 Daily Checkpoint Questions`

Standard Session Kickoff Commands:
- To start a new 2-week block: `"Kick off Week [X–Y] Master Study Plan per @DSA-roadmap.md and @SPECIFIC_DSA_TOPIC.md"`
- To start a daily study session: `"Proceed to Week [X] Day [Y]: [Topic Title] per @DSA-roadmap.md and the current week study plan following the SPECIFIC_DSA_TOPIC.md standard"`
- To resume / continue progress: `"Continue with the next scheduled day per @DSA-roadmap.md and the current week study plan"`

My Learning Style:
- I learn best with visual explanations and step-by-step breakdowns
- I want to understand WHY, not just HOW — include invariants, proofs, and failure modes
- I prefer starting with brute force, then optimizing — always show the progression
- I need help identifying problem patterns and when to use each approach
- Implementation language: C# / .NET — reference CLR internals, memory alignment, and runtime behavior where relevant

## WEEK 1-3: ARRAY & STRING FUNDAMENTALS
**Foundation Building**
### 📐 5W1H Taxonomy: The Array & Dynamic Array (`DynamicArray<T>`)
- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* An **Array** is a linear collection of homogeneous elements allocated in contiguous physical memory addresses. A **Dynamic Array** (`List<T>`, `std::vector`) wraps a raw array with geometric buffer doubling.
  - *Core Invariants:* Contiguity Invariant ($i$ adjacent to $i-1, i+1$); $\Theta(1)$ Random Access Law ($\text{Address}(i) = \text{Base} + i \times \text{sizeof}(T)$); Capacity Invariant ($\text{Count} \le \text{Capacity}$).
  - *Misconception Check:* Appending is *not* worst-case $O(1)$; it is amortized $O(1)$ with occasional $O(N)$ reallocation spikes. Indexing is only $O(1)$ because of contiguous pointer arithmetic, not because of magic hardware hashing.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the pointer chasing and cache-miss overhead of linked nodes, enabling hardware prefetchers to stream data directly into CPU L1/L2 caches.
  - *Mathematical Advantage:* Constant-time random access $\Theta(1)$ allows divide-and-conquer binary search in $\Theta(\log N)$, which is physically impossible in node-linked structures.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* High read-to-write ratio, index-heavy access, known or bounded dataset size, sequential numerical processing, tight inner loops.
  - *When to Avoid / Failure Modes:* Frequent arbitrary insertions/deletions in the middle or head ($O(N)$ memory shift); unbounded streaming data where reallocation latency spikes violate real-time SLAs.
  - *Signal Words:* "Contiguous subarray", "pair sum in sorted array", "in-place compaction", "sliding window of size K".
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* 64-bit .NET object heap: 8-byte `Object Header` + 8-byte `MethodTable Pointer` + 4-byte `Length` + 4-byte padding + raw contiguous elements. Elements fill 64-byte cache lines. Arrays $\ge 85,000$ B enter Gen 2 Large Object Heap (LOH).
  - *Production Systems:* Flat disk buffers in database page caches, OS paging tables, SIMD vectorization registers.
- **5. HOW (Operations, Implementation & Spoken Drill):**
  - *Operations Cost Model:* Access: $\Theta(1)$; Append: $\Theta(1)$ amortized; Insert/Delete at $i$: $\Theta(N)$; Search: $\Theta(N)$ unsorted, $\Theta(\log N)$ sorted.
  - *From-Scratch Implementation:* Geometric doubling ($2\times$ or $1.5\times$), 25% shrink heuristic, GC reference loitering prevention (`_items[size] = default(T)!`).
  - *Interview Spoken Drill (20–30s):* *"An array is a contiguous memory buffer providing $\Theta(1)$ direct address arithmetic. I choose dynamic arrays when cache locality and instant random access are paramount, accepting amortized $\Theta(1)$ appends via geometric doubling."*

- **Array Memory Architecture & From-Scratch Dynamic Array**: Contiguous heap/stack allocation, 64-byte CPU cache lines, spatial vs temporal locality, pointer arithmetic for O(1) random access (`address(i) = base + i × sizeof(T)`), why arrays beat linked lists for sequential scans; implementing `DynamicArray<T>` from scratch with geometric doubling (1.5× vs 2×), shrink heuristics, and amortized O(1) proof
- **Dynamic Array Mechanics & Amortized Analysis**: Growth factor (1.5× vs 2×) trade-offs, aggregate and accounting method proof for amortized O(1) push, memory reallocation overhead, zero-allocation slicing with `Span<T>` / `Memory<T>`
- **Memory Alignment, Padding & LOH Dynamics**: Struct field alignment (4/8-byte boundaries), padding overhead in custom data structures, Large Object Heap (LOH threshold ≥85,000 bytes) fragmentation hazards in Gen 2 GC when allocating large arrays
- **CPU Branch Prediction & Pipeline Stalls**: Why sorted arrays process conditions up to 3–6× faster due to the Branch History Table (BHT), pipeline flush penalties, writing branchless algorithms using bitwise arithmetic and conditional moves (`cmov`)
- **Two Pointers Invariant Coordination**: Reader/Writer compaction pattern (write ≤ read always), opposite-end convergence on sorted arrays, fast/slow cycle and midpoint detection, Dutch National Flag 3-way partitioning, correctness via loop invariant proofs
- **Sliding Window Monotonicity**: Fixed-size differential add/remove updates, variable-size window validity invariants, O(2N) → O(N) amortized expansion/contraction proof (each element enters and exits at most once), frequency-match counters for substring problems
- **Prefix Sums & Difference Arrays**: Range sum derivation (`sum(i,j) = prefix[j+1] - prefix[i]`), 2D inclusion-exclusion prefix formula, difference arrays for O(1) batch range updates (convert O(N) updates to O(1)), prefix sum + HashMap for subarray sum = target in O(N)
- **String Immutability & Memory Internals**: CLR managed heap layout (Object Header + Length + UTF-16 char buffer), why `string +=` in a loop is O(N²) via GC Gen0 thrashing, `StringBuilder` amortized O(1) append via internal doubling, `string.AsSpan()` for zero-allocation reads
- **Unicode, UTF-16 Surrogate Pairs & Runes**: Difference between 16-bit code units (`char`) and Unicode Scalar Values (`Rune`), why non-BMP characters and emojis break naive indexing (`s[i]`) and length checks, robust zero-allocation character iteration via `.EnumerateRunes()`
- **String Pattern Foundations**: Palindrome center-expansion (2N-1 centers for odd and even lengths), anagram frequency vector isomorphism (`int[26]` as canonical key), subsequence two-pointer O(M+N) state tracking vs substring contiguous window
- **Basic Sorting Principles**: Bubble/Selection/Insertion sort O(N²) and their adaptive properties, why production runtimes use Dual-Pivot Quicksort + Insertion Sort hybrid (IntroSort), sorting stability and when it matters
- **Kadane's Algorithm (Maximum Subarray)**: Local vs global max tracking: `localMax = max(nums[i], localMax + nums[i])`, `globalMax = max(globalMax, localMax)`; formal loop invariant: `localMax` = maximum subarray ending exactly at index i; extension to circular arrays (total sum − minimum subarray) and 2D maximum sum rectangle via row-compression; time O(N), space O(1)
- **Dutch National Flag & 3-Way Partitioning**: Dijkstra's 3-way partition invariant: maintain `lo`, `mid`, `hi` pointers such that `[0..lo-1]` < pivot, `[lo..mid-1]` = pivot, `[hi+1..N-1]` > pivot; single pass O(N) with O(1) space; extension to sorting colors / 0-1-2 arrays without counting
- **Coordinate Compression**: Mapping arbitrary large values to dense rank indices in [0, N); collect + sort + deduplicate values, then binary-search-rank each original value; prerequisite for offline sweep-line and Fenwick/Segment Tree problems with large coordinate ranges

### ⚙️ Core Operations & Internal Logic Deep-Dive: Dynamic Array & Linear Buffers

#### 1. Geometric Buffer Growth (`Add(T item)` / `EnsureCapacity(int min)`)
- **Dimension 1 (Contract & Complexity):** Append item to end of array. Amortized $\Theta(1)$ time, worst-case $\Theta(N)$ when reallocation triggers; $O(N)$ auxiliary space during buffer migration.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Check if `_size == _items.Length`. If false, bypass allocation: assign `_items[_size++] = item; _version++; return;`.
  2. If true, calculate `newCapacity = _items.Length == 0 ? DefaultCapacity (4) : _items.Length * 2`. Guard against overflow (`newCapacity > Array.MaxLength`).
  3. Allocate new managed array: `T[] newItems = new T[newCapacity];`.
  4. Perform contiguous block memory copy: `Array.Copy(_items, 0, newItems, 0, _size);` (delegates to unmanaged `memmove`/`memcpy` vectorized SIMD block transfer).
  5. Swing internal reference: `_items = newItems;`. The old array reference is dropped, becoming eligible for Gen 0 GC collection.
  6. Insert `_items[_size++] = item; _version++;`.
- **Dimension 3 (Visual State Transition):**
  ```
  [BEFORE RESIZE: Count=4, Capacity=4]
  Index:     0     1     2     3
  _items -> [10]  [20]  [30]  [40]  (FULL! Cannot append 50 without overflow)

  [STEP 1: Allocate doubled buffer on managed heap]
  newItems -> [  ]  [  ]  [  ]  [  ]  [  ]  [  ]  [  ]  [  ]  (Capacity = 8)

  [STEP 2: Bulk block copy via memmove]
  newItems -> [10]  [20]  [30]  [40]  [  ]  [  ]  [  ]  [  ]

  [STEP 3: Swing reference, append 50, increment size]
  _items   -> [10]  [20]  [30]  [40]  [50]  [  ]  [  ]  [  ] (Count=5, Capacity=8)
  (Old buffer [10,20,30,40] unrooted -> GC Gen 0 sweeps on next collection)
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Potential Function:* $\Phi = 2 \cdot \text{size} - \text{capacity}$.
  - Just after doubling, $\text{capacity} = 2 \cdot \text{size} \implies \Phi = 2 \cdot \text{size} - 2 \cdot \text{size} = 0 \ge 0$.
  - Just before doubling, $\text{capacity} = \text{size} \implies \Phi = 2 \cdot \text{size} - \text{size} = \text{size}$.
  - For normal append without resize: actual work $c_i = 1$, $\Delta\Phi = (2(\text{size}+1) - \text{cap}) - (2\cdot\text{size} - \text{cap}) = 2$. Amortized cost $\hat{c}_i = c_i + \Delta\Phi = 1 + 2 = 3 = O(1)$.
  - For append with doubling from $N$ to $2N$: actual work $c_i = N + 1$ (copying $N$ items + writing 1), $\Delta\Phi = \Phi_{new} - \Phi_{old} = (2(N+1) - 2N) - N = 2 - N$. Amortized cost $\hat{c}_i = (N + 1) + (2 - N) = 3 = O(1)$.
- **Dimension 5 (Edge Case Matrix):**
  - `capacity == 0`: Initial allocation immediately sets capacity to 4 (avoids repeated allocations on early elements).
  - Huge arrays: If size exceeds `Array.MaxLength` (~2 billion elements), clamp to `Array.MaxLength` or throw `OutOfMemoryException`.
  - Reference Types: If array contains reference types (`string`, custom class), old buffer references must not hold active GC roots once unrooted.

#### 2. Arbitrary Insertion & Memory Shift (`Insert(int index, T item)`)
- **Dimension 1 (Contract & Complexity):** Shift elements at `[index.._size-1]` right by 1 and place `item` at `index`. Worst-case $\Theta(N)$ time (when `index == 0`), best-case $\Theta(1)$ amortized (when `index == _size`); $O(1)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Validate bounds: `if ((uint)index > (uint)_size) throw new ArgumentOutOfRangeException();`.
  2. Ensure capacity for `_size + 1`.
  3. If `index < _size`, execute rightward shift: `Array.Copy(_items, index, _items, index + 1, _size - index);`.
  4. Write `_items[index] = item; _size++; _version++;`.
- **Dimension 3 (Visual State Transition):**
  ```
  Insert(1, 99) into [10, 20, 30, 40] (size=4, cap=8):
  Step 1: Shift right from index 1 by 1 position (backward copy preserves data)
  Index:     0     1     2     3     4
  _items:   [10] [ HOLE ] [20]  [30]  [40]   (cells 1..3 shifted to 2..4)
  Step 2: Assign _items[1] = 99, size becomes 5
  _items:   [10]  [99]   [20]  [30]  [40]
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Contiguity Invariant:* Element previously at position $k \ge \text{index}$ now resides at $k+1$. Since addresses are computed via $\text{Base} + i \times \text{sizeof}(T)$, index-based access remains unbroken for all $0 \le i < \text{size}$.
- **Dimension 5 (Edge Case Matrix):**
  - `index == 0`: Head insertion causes maximum possible shifts ($N$ shifts).
  - `index == _size`: Tail insertion causes 0 shifts (degenerates to `Add`).
  - `index < 0` or `index > _size`: Fast-fail with `ArgumentOutOfRangeException` before any array manipulation occurs.

#### 3. Deletion & GC Loitering Prevention (`RemoveAt(int index)`)
- **Dimension 1 (Contract & Complexity):** Remove element at `index` and shift subsequent elements left. $\Theta(N)$ worst-case time, $\Theta(1)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Validate bounds: `if ((uint)index >= (uint)_size) throw new ArgumentOutOfRangeException();`.
  2. Decrement logical size: `_size--;`.
  3. Shift suffix left: `if (index < _size) Array.Copy(_items, index + 1, _items, index, _size - index);`.
  4. **Critical GC Step (Loitering Prevention):** Assign `_items[_size] = default(T)!;` (for reference types, zeroes the reference pointer so the CLR garbage collector can reclaim the unreferenced object).
  5. Increment `_version++;`.
- **Dimension 3 (Visual State Transition):**
  ```
  RemoveAt(1) from [10, 99, 20, 30, 40] (size=5):
  Step 1: Shift elements left from index 2..4 into index 1..3
  _items:   [10]  [20]  [30]  [40]  [40 (STALE COPY)]
  Step 2: Clear trailing slot to prevent GC reference loitering
  _items:   [10]  [20]  [30]  [40]  [ null / 0 ]  (size=4)
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Reference Cleanliness Invariant:* For all $k \ge \text{size}$, `_items[k] == default(T)`. This guarantees that discarded references are not kept alive on the heap through "zombie slots" in dormant array memory.
- **Dimension 5 (Edge Case Matrix):**
  - Deleting head (`index == 0`): Shifts all $N-1$ remaining elements left.
  - Deleting tail (`index == _size - 1`): Zero shifts required; purely zero out the slot and decrement size ($\Theta(1)$).
  - Shrink heuristic: If `_size <= _items.Length / 4`, optionally reallocate to `_items.Length / 2` to reclaim RAM without causing resize thrashing.

## WEEK 4-5: ADVANCED ARRAY & STRING TECHNIQUES
**Pattern Mastery**
- **Binary Search Invariants & Overflow Safety**: Loop invariant (`[left, right]` always contains the answer), overflow-safe midpoint `mid = left + (right - left) / 2`, exact match vs lower-bound vs upper-bound variants, proving termination (range shrinks by ≥1 per iteration)
- **Binary Search on Answer Space**: Identifying monotone feasibility predicates `P(x) ⟹ P(x+1)`, constructing `IsFeasible(capacity)` greedy simulation, defining `[lo, hi]` bounds as max_single_element to total_sum; discrete vs continuous (floating-point epsilon) binary search
- **Advanced Two Pointers & Reduction**: 3Sum via sort + two-pointer O(N²) with duplicate pruning, Trapping Rain Water space optimization from O(N) left/right arrays to O(1) dual-pointer min-tracking
- **String Pattern Matching Algorithms**: KMP prefix function (π-array) construction and how it encodes "longest proper prefix that is also a suffix", Rabin-Karp polynomial rolling hash and double-hashing for collision resistance
- **Array Intervals & Sweep-Line**: Greedy interval merge via sort-by-start, coordinate compression for large x-coordinates, event-driven timeline sweep for minimum room/platform allocation
- **2D Matrix Transformations**: In-place matrix transpose using `(i,j) ↔ (j,i)` swapping, clockwise rotation via transpose + row-reverse, spiral layer-by-layer boundary shrinking, saddleback search (top-right start) in row/col sorted matrix O(M+N)
- **Bit Manipulation Basics**: XOR self-inverse property (`x ^ x = 0`, `x ^ 0 = x`), isolating lowest set bit with `x & (-x)`, clearing lowest set bit with `x & (x-1)`, single missing/duplicate number detection
- **Matrix Algorithms — Strassen & Sparse Matrices**: Strassen's 7-multiplication matrix multiplication recurrence T(N) = 7T(N/2) + O(N²) → O(N^2.807); sparse matrix representations (CSR, COO, DOK) and when to prefer them over dense 2D arrays; matrix exponentiation setup for linear recurrences (bridge to Week 45-46)
- **In-Place Array Tricks**: Rotation by reversal (reverse whole → reverse first k → reverse last n-k); marking visited via sign flipping (`nums[|nums[i]|-1] *= -1`) when values ∈ [1,N]; cyclic replacement for O(1) space rotation

### ⚙️ Core Operations & Internal Logic Deep-Dive: Advanced Array & String Mechanics

#### 1. Monotonic Sliding Window State Machine
- **Dimension 1 (Contract & Complexity):** Maintain a contiguous subarray window $[L, R]$ satisfying validity predicate $P(\text{window})$. Total time $\Theta(N)$ amortized; $O(1)$ or $O(K)$ space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Initialize two pointers: $L = 0, R = 0$.
  2. **Expansion Phase:** Increment $R$. Incorporate `nums[R]` into window state accumulator (e.g., character frequency table, window sum).
  3. **Violation Check & Contraction Phase:** While $P(\text{window})$ is violated, subtract `nums[L]` from window accumulator and increment $L++$.
  4. **Optimal State Capture:** Once $P(\text{window})$ is restored, update global maximum/minimum metrics with current window length $(R - L + 1)$.
- **Dimension 3 (Visual State Transition):**
  ```
  Target: Longest substring with at most 2 distinct characters in "eceba"
  R=0 ('e'): window=['e'], counts={e:1}, valid -> maxLen=1
  R=1 ('c'): window=['e','c'], counts={e:1,c:1}, valid -> maxLen=2
  R=2 ('e'): window=['e','c','e'], counts={e:2,c:1}, valid -> maxLen=3
  R=3 ('b'): window=['e','c','e','b'], counts={e:2,c:1,b:1} (3 distinct > 2) -> VIOLATION!
    Contract L:
    L=0: remove 'e' -> counts={e:1,c:1,b:1} (still 3 distinct) -> L=1
    L=1: remove 'c' -> counts={e:1,b:1} (2 distinct <= 2) -> VALID! L=2
    window=['e','b'], maxLen remains 3.
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  Both $L$ and $R$ monotonically advance from $0$ to $N-1$. $R$ advances exactly $N$ times. $L$ advances at most $N$ times. Total pointer advances $\le 2N \implies \Theta(N)$ total amortized time.
- **Dimension 5 (Edge Case Matrix):**
  - Empty input: Return 0 immediately.
  - Window never violates: $L$ remains 0; single pass returns entire array.
  - Window violates at every step: $L$ chases $R$ constantly; window stays size 1.

#### 2. Dutch National Flag 3-Way In-Place Partitioning
- **Dimension 1 (Contract & Complexity):** Segregate elements into 3 contiguous bands: $(< \text{pivot}, == \text{pivot}, > \text{pivot})$. Exactly $\Theta(N)$ time in a single pass; $\Theta(1)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Initialize `lo = 0`, `mid = 0`, `hi = nums.Length - 1`.
  2. While `mid <= hi`:
     - If `nums[mid] < pivot`: `Swap(nums, lo, mid); lo++; mid++;`
     - Else if `nums[mid] == pivot`: `mid++;`
     - Else (`nums[mid] > pivot`): `Swap(nums, mid, hi); hi--;` *(Crucial: do NOT advance `mid`, because the swapped element from `hi` is unexamined!)*
- **Dimension 3 (Visual State Transition):**
  ```
  Initial: lo=0, mid=0, hi=4, array = [2, 0, 2, 1, 1], pivot=1
  mid=0: nums[mid]=2 > 1 -> Swap(mid, hi) [1, 0, 2, 1, 2], hi=3 (mid stays 0!)
  mid=0: nums[mid]=1 == 1 -> mid=1
  mid=1: nums[mid]=0 < 1 -> Swap(lo, mid) [0, 1, 2, 1, 2], lo=1, mid=2
  mid=2: nums[mid]=2 > 1 -> Swap(mid, hi) [0, 1, 1, 2, 2], hi=2 (mid stays 2!)
  mid=2: nums[mid]=1 == 1 -> mid=3
  mid=3 > hi=2 -> Terminate. Array is sorted: [0, 1, 1, 2, 2].
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Loop Invariant:* Throughout execution:
  - $\forall k \in [0, \text{lo}-1]: \text{nums}[k] < \text{pivot}$
  - $\forall k \in [\text{lo}, \text{mid}-1]: \text{nums}[k] == \text{pivot}$
  - $\forall k \in [\text{mid}, \text{hi}]: \text{nums}[k] \text{ is uninspected}$
  - $\forall k \in [\text{hi}+1, N-1]: \text{nums}[k] > \text{pivot}$
  When `mid > hi`, the uninspected band is empty, leaving a completely partitioned array.
- **Dimension 5 (Edge Case Matrix):**
  - All elements equal to pivot: `mid` sweeps through entire array without swaps; $O(N)$ with zero writes.
  - Already partitioned array: Exactly zero cross-band swaps.
  - 2-element array inverted: Single swap cleanly terminates.

#### 3. Difference Array Range Update & Cumulative Prefix Reconstruction
- **Dimension 1 (Contract & Complexity):** Execute $Q$ batch range additions $+V$ on range $[L, R]$ in $O(1)$ per update, followed by single $O(N)$ sweep to recover final values. Total time $O(N + Q)$ vs $O(N \cdot Q)$ naive.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Build difference array: `diff[0] = nums[0]`, `diff[i] = nums[i] - nums[i-1]` for $i \ge 1$.
  2. For each query $(L, R, V)$:
     - `diff[L] += V;`
     - `if (R + 1 < N) diff[R + 1] -= V;`
  3. Reconstruct: `nums[0] = diff[0]`; for $i = 1 \dots N-1$: `nums[i] = nums[i-1] + diff[i]`.
- **Dimension 3 (Visual State Transition):**
  ```
  Array: [0, 0, 0, 0, 0]. Query: Add 5 to range [1..3]
  diff before:  [ 0,  0,  0,  0,  0]
  Apply update: diff[1] += 5; diff[4] -= 5;
  diff after:   [ 0, +5,  0,  0, -5]
  Reconstruct prefix sum:
  i=0: 0
  i=1: 0 + 5 = 5
  i=2: 5 + 0 = 5
  i=3: 5 + 0 = 5
  i=4: 5 - 5 = 0  --> Final: [0, 5, 5, 5, 0] (Range [1..3] incremented by 5 in O(1)!)
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  Telescoping sum: $\text{nums}[k] = \sum_{j=0}^k \text{diff}[j]$. For any $k \in [L, R]$, the $+V$ term is included in the sum. For $k > R$, both $+V$ and $-V$ are included, summing to 0 and cancelling out the effect.
- **Dimension 5 (Edge Case Matrix):**
  - $R == N-1$ (Update extends to end of array): The $-V$ step at $R+1$ is omitted to prevent out-of-bounds index access.
  - Single-element range $L == R$: `diff[L] += V; diff[L+1] -= V;` correctly isolates a single cell modification.

## WEEK 6-7: LINKED LIST MASTERY
**Pointer Manipulation Excellence**
### 📐 5W1H Taxonomy: The Linked List Family (Singly, Doubly, Circular)
- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* A **Linked List** is a linear collection of nodes containing values and explicit heap references directed toward neighbors (`Next`, `Prev`).
  - *Core Invariants:* Non-contiguity invariant (scattered heap addresses); Sequential reachability (node $k$ reached only via $k-1$ dereferences); Sentinel dummy invariant (`_sentinel.Next = head` permanently eliminates null-head branching).
  - *Misconception Check:* Inserting into a linked list is *not* universally $O(1)$; it is only $O(1)$ *if you already hold a direct pointer to the target node*. Finding the position requires an $O(N)$ linear walk.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the $O(N)$ memory-shifting penalty of arrays during head/tail insertions and avoids bulk buffer reallocation copies.
  - *Mathematical Advantage:* Strict, predictable worst-case $\Theta(1)$ insertion and removal at extremities without latency spikes.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Frequent insertions/removals at boundaries, unknown collection size where memory growth must be gradual, composite architectures requiring $O(1)$ node detachment (e.g. LRU / LFU cache).
  - *When to Avoid / Failure Modes:* High-frequency random index lookups, binary search (cannot access midpoint), large collections where 24–32B per-node CLR memory overhead and pointer chasing trigger severe cache/TLB misses.
  - *Signal Words:* "In-place reversal", "detect cycle / intersection", "remove N-th node from end", "reorder list with O(1) extra memory".
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Scattered managed heap objects: 8-byte `Header` + 8-byte `MethodTable` + 8-byte `Next` (+ 8-byte `Prev`) + value payload. Storing a 4-byte `int` requires 32–40 bytes ($800\%$ to $1000\%$ memory inflation).
  - *Production Systems:* Free-list allocators in operating systems, kernel process schedulers, LRU cache eviction queues in Redis/Memcached.
- **5. HOW (Operations, Implementation & Spoken Drill):**
  - *Operations Cost Model:* Prepend: $\Theta(1)$; Append (with tail): $\Theta(1)$; Access index $k$: $\Theta(k)$; Delete given reference: $\Theta(1)$ doubly, $\Theta(N)$ singly.
  - *From-Scratch Implementation:* Dual sentinel nodes (`_headSentinel`, `_tailSentinel`) for branchless 2-pointer detachment (`node.Prev.Next = node.Next; node.Next.Prev = node.Prev;`).
  - *Interview Spoken Drill (20–30s):* *"A linked list is a collection of heap nodes linked by references. I choose it when strict $O(1)$ insertion and deletion at boundaries is required, using permanent sentinel dummy nodes to eliminate head/tail edge cases."*

### ⚖️ Architectural Comparison: Array vs. Linked List (The Fundamental Memory Divide)
| Evaluation Metric | Array / Dynamic Array (`List<T>`) | Singly Linked List | Doubly Linked List |
| :--- | :--- | :--- | :--- |
| **Physical Memory Layout** | **Contiguous** block of memory on heap/stack | **Scattered** individual heap nodes | **Scattered** individual heap nodes |
| **Random Access `[i]`** | $\mathbf{\Theta(1)}$ direct address calculation | $\Theta(N)$ sequential pointer walk | $\Theta(N)$ sequential pointer walk |
| **CPU Cache Locality** | **Maximum (Spatial & Temporal):** Contiguous elements fill 64-byte cache lines; hardware prefetcher pre-loads adjacent data | **Poor:** Each node access dereferences an arbitrary pointer, causing frequent L1/L2/L3 cache misses | **Poor:** Double pointer dereferencing causes CPU pipeline stalls and cache line thrashing |
| **Insert / Delete at Head** | $\Theta(N)$ (requires shifting all subsequent elements right/left) | $\mathbf{\Theta(1)}$ (rewire `head` reference) | $\mathbf{\Theta(1)}$ (rewire `head` and sentinel references) |
| **Insert at Tail** | **Amortized $\Theta(1)$** ($\Theta(N)$ when reallocation buffer doubles) | $\Theta(1)$ with cached `tail` pointer | $\Theta(1)$ with cached `tail` pointer |
| **Insert / Delete in Middle** | $\Theta(N)$ memory move / copy overhead | $\Theta(1)$ rewiring *once pointer is at position* ($\Theta(N)$ to find position) | $\Theta(1)$ rewiring *once node reference is known* |
| **Memory Overhead per Element** | **0 bytes** overhead for primitive value types | **16 to 24 bytes** in 64-bit CLR (Object Header + TypeHandle + Next pointer) | **24 to 32 bytes** in 64-bit CLR (Header + TypeHandle + Next + Prev) |
| **Resizing Behavior** | Allocates new buffer ($1.5\times$ or $2\times$), copies memory, discards old buffer | Smooth, incremental per-node allocation on demand | Smooth, incremental per-node allocation on demand |
| **Garbage Collector Impact** | Low GC pressure (single array object) | **High GC pressure** (thousands of isolated node objects to trace/collect) | **High GC pressure** (higher reference density increases GC mark phase duration) |
| **Best Used When** | Frequent reads, index lookups, batch processing, known size, cache efficiency | Frequent head insertions/removals, unknown size, strict $O(1)$ memory guarantees | LRU Cache implementation (with HashMap), bidirectional browser history |

- **Memory Layout & Cache Miss Realities & From-Scratch Node Lists**: Pointer chasing causes cache misses (each node access may be a TLB miss or cache miss), contrast with arrays' spatial locality, sentinel dummy-node invariant that eliminates head-modification edge cases; implementing `SinglyLinkedList<T>` and `DoublyLinkedList<T>` from scratch with sentinel dummy-node invariants that eliminate head/tail edge cases
- **Cycle Detection Mathematical Proof**: Floyd's Tortoise & Hare — when slow pointer enters cycle at step F, fast is F%C steps inside cycle; they meet in at most C more steps (proof via modular arithmetic), finding cycle entrance by resetting one pointer to head then walking both at speed 1
- **Structural Reversal & Reordering**: Iterative 3-pointer reversal (save next → flip → advance), recursive reversal unwinds via call stack then rewires, K-group reversal with sublist boundary preservation
- **Merge Sort on Lists**: O(1) extra space linked list merge sort using fast/slow midpoint splitting, why this is preferred over array merge sort for lists (avoids O(N) array allocation)
- **Composite List Architectures**: Deep copy with random pointers using O(1) space via node interleaving (weave copy after original, rewire randoms, unweave), doubly-linked list + hash map for O(1) get and O(1) LRU eviction
- **XOR Linked List (Memory-Efficient Doubly Linked List)**: Store `XOR(prev, next)` in each node as a single pointer field; traverse by XOR-ing known previous address to recover next address; halves pointer storage to 1 pointer per node vs 2; not directly usable in managed GC environments (CLR moves objects) — understand WHY GC-managed runtimes prohibit raw pointer arithmetic and how `unsafe` / `GCHandle` bridges the gap
- **Skip List Architecture Cross-Reference**: Probabilistic O(log N) search without rotations via geometric coin-flip towers; full from-scratch implementation deferred to → *Week 61-62: Probabilistic Data Structures*; here, understand the linked-list foundation (each level is a singly-linked express lane) and why cache locality is worse than balanced BSTs despite similar asymptotic complexity

### ⚙️ Core Operations & Internal Logic Deep-Dive: Linked List Mutations & Pointer Traversals

#### 1. Sentinel-Guarded Node Insertion and Splicing
- **Dimension 1 (Contract & Complexity):** Splice a new node between `prev` and `next` nodes. Strict worst-case $\Theta(1)$ time; $\Theta(1)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Instantiate new heap node: `var node = new DoublyLinkedListNode<T>(value);`.
  2. Wire outgoing references: `node.Next = next; node.Prev = prev;`.
  3. Wire incoming neighbor references: `prev.Next = node; next.Prev = node;`.
  4. Increment `_count++; _version++;`.
  - *Sentinel Invariant:* Permanent dummy sentinels (`_headSentinel` and `_tailSentinel`) guarantee that `prev` and `next` are never null, eliminating all branch conditions (`if (head == null)`).
- **Dimension 3 (Visual State Transition):**
  ```
  Insert node [B] between sentinel [H] and node [A]:
  [BEFORE]
  [HeadSentinel] <=========================> [Node A]
                 .Next ->        <- .Prev

  [STEP 1: Wire outgoing pointers of new Node B]
  [HeadSentinel]                             [Node A]
        ^                                       ^
        │ .Prev                           .Next │
        └────────────── [Node B] ───────────────┘

  [STEP 2: Rewire incoming neighbor pointers]
  [HeadSentinel] <---------> [Node B] <---------> [Node A]
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Bidirectional Consistency Invariant:* For any active interior node $u$: `u.Next.Prev == u` and `u.Prev.Next == u`. The 4-step pointer assignment restores this bidirectional equality immediately upon completion.
- **Dimension 5 (Edge Case Matrix):**
  - Empty list: Spliced directly between `_headSentinel` and `_tailSentinel`.
  - Insert at front: `prev = _headSentinel`, `next = _headSentinel.Next`.
  - Insert at back: `prev = _tailSentinel.Prev`, `next = _tailSentinel`.

#### 2. Arbitrary Node Detachment (`Remove(Node node)`)
- **Dimension 1 (Contract & Complexity):** Bypass and unlink an existing node from a doubly-linked list. Strict $\Theta(1)$ time; $\Theta(1)$ space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Identify immediate neighbors: `var p = node.Prev; var n = node.Next;`.
  2. Bridge neighbors across the target node: `p.Next = n; n.Prev = p;`.
  3. **GC Cleanliness Step:** Sever outgoing links from removed node: `node.Next = null; node.Prev = null;` (prevents cyclic reference retention).
  4. Decrement `_count--; _version++;`.
- **Dimension 3 (Visual State Transition):**
  ```
  Bypassing [Node B] in [Node A] <-> [Node B] <-> [Node C]:
  Step 1: Link A directly to C
          ┌─────────────────────────────────────────┐
          │                                         ▼
      [Node A] ──x──> [Node B] ──x──> [Node C]
               <──x──          <──x──
          ▲                                         │
          └─────────────────────────────────────────┘
  Step 2: Nullify Node B references -> Node B swept by GC Gen 0.
  Final:  [Node A] <=======================> [Node C]
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  Since $p$ and $n$ are now directly connected, the sequential path from `_headSentinel` to `_tailSentinel` bypasses `node` without breaking the chain.
- **Dimension 5 (Edge Case Matrix):**
  - Attempting to remove `_headSentinel` or `_tailSentinel`: Throws `InvalidOperationException` (sentinels are immutable).
  - Removing the only remaining element: List safely transitions to `_headSentinel.Next == _tailSentinel`.

#### 3. Iterative 3-Pointer In-Place List Reversal
- **Dimension 1 (Contract & Complexity):** Invert direction of all `Next` pointers in a singly linked list. Strict $\Theta(N)$ time; $\Theta(1)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Initialize pointer state: `ListNode prev = null; ListNode curr = head;`.
  2. Loop while `curr != null`:
     - Save forward path: `ListNode next = curr.Next;`
     - Reverse link: `curr.Next = prev;`
     - Advance window: `prev = curr; curr = next;`
  3. Return new head: `return prev;`.
- **Dimension 3 (Visual State Transition):**
  ```
  Reversing 1 -> 2 -> 3 -> null:
  Initial: prev = null, curr = 1
  Iteration 1: next = 2; curr.Next = null; prev = 1; curr = 2  (1 -> null)
  Iteration 2: next = 3; curr.Next = 1;    prev = 2; curr = 3  (2 -> 1 -> null)
  Iteration 3: next = null; curr.Next = 2; prev = 3; curr = null (3 -> 2 -> 1 -> null)
  curr == null -> Terminate. Return prev (3).
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Loop Invariant:* At the beginning of each iteration, sublist `[head..prev]` is completely reversed, `curr` points to the head of the remaining unreversed list, and no links between elements in the unreversed list have been corrupted.
- **Dimension 5 (Edge Case Matrix):**
  - `head == null`: Loop never runs; returns `null`.
  - Single node (`head.Next == null`): Loop runs once; `head.Next = null`; returns `head`.

#### 4. Floyd's Tortoise & Hare Cycle Math Mechanics
- **Dimension 1 (Contract & Complexity):** Detect cycle existence and locate cycle entrance index. Time $O(N)$, Space $O(1)$.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. `slow = head; fast = head;`
  2. Advance `slow = slow.Next; fast = fast.Next?.Next;` until `fast == null` (no cycle) or `slow == fast` (collision point).
  3. If collision found: Reset `slow = head;`. Keep `fast` at collision point.
  4. Advance both pointers at speed 1: `slow = slow.Next; fast = fast.Next;`. The node where they meet is the exact cycle entrance.
- **Dimension 3 (Visual State Transition & Mathematical Derivation):**
  ```
  Head ───── F steps ─────> Entrance ───── a steps ─────> Meet Point
                                ▲                            │
                                └─────── (C - a) steps ──────┘
  At collision:
  Distance(slow) = F + a
  Distance(fast) = F + a + k * C
  Since fast moves twice as fast as slow:
  2 * (F + a) = F + a + k * C  ===>  F + a = k * C  ===>  F = k * C - a = (k - 1) * C + (C - a)
  Therefore, the distance from Head to Entrance (F) EXACTLY EQUALS
  the distance from the Meet Point to the Entrance along the cycle (C - a)!
  Advancing both at 1 step/iteration guarantees they collide at Entrance!
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  Modular arithmetic guarantees relative velocity $\Delta v = 1$ reduces distance modulo $C$ by 1 each step, ensuring rendezvous in at most $C$ steps.
- **Dimension 5 (Edge Case Matrix):**
  - No cycle: `fast` or `fast.Next` reaches null in $\le N/2$ steps.
  - Cycle contains head (circular list): $F = 0$, pointers meet immediately at head.

## WEEK 8-9: STACK & QUEUE MASTERY
**LIFO/FIFO Problem Solving**
### 📐 5W1H Taxonomy: Stack, Queue & Deque
- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *The Stack (`LIFO`):* Elements enter and exit exclusively through `Top`. Interior mutation is prohibited.
  - *The Queue (`FIFO`):* Elements enter at `Tail` and exit at `Head` in strict chronological order.
  - *The Deque (Double-Ended):* Bidirectional sequence supporting $O(1)$ push/pop at both `Front` and `Back`.
  - *Misconception Check:* A stack does *not* require a linked list; dynamic arrays are faster in practice due to cache lines. A queue cannot be implemented as a naive array without circular modulo arithmetic, or it requires $O(N)$ dequeue shifts.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates illegal state mutations by restricting access to strict disciplinary boundaries, guaranteeing $O(1)$ push/pop/enqueue/dequeue.
  - *Algorithmic Purpose:* Stack matches recursive sub-problems and boundary containment; Queue guarantees shortest path discovery in unweighted graphs (BFS); Deque enables amortized $O(N)$ sliding window extrema.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:*
    - *Stack:* Parentheses parsing, nearest greater/smaller boundary searches, expression evaluation, DFS call-stack simulation.
    - *Queue:* BFS level-order traversal, asynchronous message buffering, rate limiting.
    - *Deque:* Sliding window maximum/minimum, 0-1 BFS shortest paths.
  - *When to Avoid / Failure Modes:* When arbitrary index random access is needed; when array queues forget circular modulo arithmetic and thrash memory.
  - *Signal Words:* "Next greater element", "valid parenthesis string", "level-by-level wavefront", "sliding window max/min".
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Array-backed containers (`ArrayStack<T>`, `CircularArrayQueue<T>`) utilize contiguous heap arrays. Linked variants incur 24B–32B per-node overhead.
  - *Production Systems:* Thread execution call stacks (RSP/RBP registers), TCP socket receive buffers, print spoolers, Kafka partition log offsets.
- **5. HOW (Operations, Implementation & Spoken Drill):**
  - *Operations Cost Model:* Push/Pop/Enqueue/Dequeue: $\Theta(1)$ amortized (array) or $\Theta(1)$ strict (linked).
  - *From-Scratch Implementation:* Circular buffer arithmetic: $\text{nextTail} = (\text{tail} + 1) \pmod C$; full vs. empty disambiguation via `Count == Capacity`.
  - *Interview Spoken Drill (20–30s):* *"A stack enforces LIFO access, which I choose for monotonic boundary problems and syntax parsing. A queue enforces FIFO order via a circular ring buffer, essential for BFS level-by-level wavefronts."*

### ⚖️ Architectural Comparison: Stack vs. Queue vs. Deque
| Dimension | Stack (`LIFO`) | Queue (`FIFO`) | Deque (Double-Ended Queue) |
| :--- | :--- | :--- | :--- |
| **Access Discipline** | **Last-In, First-Out:** Entry and exit through `Top` only | **First-In, First-Out:** Entry at `Tail`, exit at `Head` | **Bidirectional:** Entry and exit at both `Front` and `Back` |
| **Active Access Points** | 1 point (`Top`) | 2 points (`Head` and `Tail`) | 2 points (`Front` and `Back`) |
| **Optimal Array Implementation** | Dynamic array: push/pop at index `Count - 1` | Circular Ring Buffer: modular arithmetic `(tail + 1) % Cap` | Circular Ring Buffer: bidirectional modular arithmetic |
| **Optimal Linked Implementation**| Singly linked list: push/pop at `Head` | Singly linked list: enqueue at `Tail`, dequeue at `Head` | Doubly linked list with sentinel dummy nodes |
| **Primary Invariants** | Top element always reflects the most recently observed active state | Order of dequeue matches chronological order of enqueue | Elements can be inspected and pruned from both extremities |
| **Canonical Algorithmic Patterns**| 1. Monotonic Stack (Next Greater/Smaller element)<br>2. Parentheses & syntax parsing<br>3. Recursive call-stack emulation<br>4. Depth-First Search (DFS) | 1. Breadth-First Search (BFS) level wavefronts<br>2. Task buffering & rate limiting<br>3. Producer-Consumer streaming | 1. Monotonic Deque (Sliding Window Min/Max)<br>2. 0-1 BFS shortest paths<br>3. Maximum constrained subsequence DP |

- **Stack Call Semantics, Memory Architecture & From-Scratch Dual Implementations**: Array-backed O(1) amortized push/pop, parentheses matching state machine, Shunting-Yard algorithm for infix-to-postfix conversion and expression evaluation with operator precedence and unary operators; CPU thread call stacks (`RSP`/`RBP`, stack frames, recursion limits); implementing `ArrayStack<T>` (dynamic array resizing, geometric doubling, shrink heuristic, GC reference loitering prevention with `default(T)`, fail-fast enumerator) and `LinkedStack<T>` (singly-linked `StackNode<T>`, strict worst-case O(1) push/pop, 24B/node CLR overhead) from scratch; architectural trade-offs (cache locality vs per-push GC allocation)
- **Monotonic Stack Deep Dive**: Maintaining strictly increasing or strictly decreasing stack invariant, amortized O(N) proof (each element pushed and popped at most once total), next greater/smaller element derivation, largest rectangle in histogram: pop when blocked, compute width as `i - stack.Peek() - 1`
- **Queue Internals, BFS Foundation & From-Scratch Dual Implementations**: Circular buffer (head/tail modular arithmetic) for O(1) enqueue/dequeue, BFS correctness proof (nodes dequeued in non-decreasing distance order), layer-by-layer level-order aggregation pattern; implementing `CircularArrayQueue<T>` (ring buffer, capacity doubling with wraparound copy, full vs empty disambiguation) and `LinkedQueue<T>` (singly-linked list with head/tail pointers, strict O(1)) from scratch
- **Monotonic Deque, Sliding Window Maximum & From-Scratch Deque**: Amortized O(N) sliding window max using monotonically decreasing deque of indices, front = current max, pop front when expired (index < i - k + 1), pop back when new element is ≥ back element; implementing `CircularArrayDeque<T>` and `LinkedDeque<T>` (doubly linked list with sentinel nodes) from scratch
- **Advanced Stack Designs**: Min-stack using auxiliary stack tracking minimums, queue-from-two-stacks amortized O(1) dequeue analysis (implementing `TwoStackQueue<T>` with potential method proof)
- **Deque as Palindrome Checker**: Push all characters to deque, then repeatedly pop-front and pop-back comparing for equality; O(N) time, O(N) space; contrast with the two-pointer O(1) space approach and when the deque approach is preferable (streaming unknown-length inputs)
- **Iterative DFS via Explicit Stack**: Replicating pre-order / post-order / in-order via an explicit `Stack<(TreeNode, Phase)>` state machine; critical for avoiding `StackOverflowException` on skewed trees / graphs with depth > ~10,000; generalizes to graph DFS to handle arbitrary depth safely
- **Priority Queue from Two Heaps (Running Median)**: Dual-heap design (`maxHeap` for lower half, `minHeap` for upper half); balance invariant: `|maxHeap.Count - minHeap.Count| ≤ 1`; median = top of larger heap or average of both tops; this pattern is canonical for streaming statistics (percentiles, median maintenance)

### ⚙️ Core Operations & Internal Logic Deep-Dive: Stack & Queue Internal State Transitions

#### 1. Circular Ring Buffer Modulo Queue Operations (`Enqueue` & `Dequeue`)
- **Dimension 1 (Contract & Complexity):** Strict $O(1)$ amortized `Enqueue`, strict $O(1)$ `Dequeue`. $O(N)$ contiguous memory buffer.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. **Enqueue(item):**
     - If `_size == _capacity`: Allocate $2\times$ array. Linearize wrapped elements by copying `[head..capacity-1]` followed by `[0..tail]`. Reset `_head = 0; _tail = _size;`.
     - Assign `_items[_tail] = item;`.
     - Update pointer: `_tail = (_tail + 1) % _capacity;`.
     - Increment `_size++; _version++;`.
  2. **Dequeue():**
     - If `_size == 0`: Throw `InvalidOperationException("Queue empty")`.
     - Capture `item = _items[_head];`.
     - **GC Cleanliness:** `_items[_head] = default(T)!;` (prevents reference retention).
     - Update pointer: `_head = (_head + 1) % _capacity;`.
     - Decrement `_size--; _version++; return item;`.
- **Dimension 3 (Visual State Transition):**
  ```
  Circular Buffer (Cap=5, Size=4):
  Index:     0      1      2      3      4
  _items:  [ C ]  [ D ]  [   ]  [ A ]  [ B ]
                          ^      ^
                         tail   head
  Queue Order: A -> B -> C -> D

  [OPERATION: Enqueue(E)]
  1. Write E at tail (index 2): _items[2] = E
  2. tail = (2 + 1) % 5 = 3 (tail wraps to head index -> buffer is FULL)
  Index:     0      1      2      3      4
  _items:  [ C ]  [ D ]  [ E ]  [ A ]  [ B ]
                                 ^ (head=3, tail=3, size=5 == capacity)

  [OPERATION: Dequeue()] -> Returns A
  1. item = _items[3] ('A')
  2. _items[3] = null (cleared!)
  3. head = (3 + 1) % 5 = 4
  Index:     0      1      2      3      4
  _items:  [ C ]  [ D ]  [ E ]  [null] [ B ]
                                        ^ (head=4, tail=3, size=4)
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *FIFO Ordering Invariant:* The $k$-th element in FIFO sequence is located at address `(_head + k) % _capacity`. Incrementing `_head` removes the oldest element without shifting any remaining elements, guaranteeing $O(1)$ execution.
- **Dimension 5 (Edge Case Matrix):**
  - `_size == _capacity` (Full queue): Modulo wraparound would make `head == tail`, identical to empty state. Disambiguated strictly via `_size` counter.
  - Power-of-two optimization: When capacity is $2^k$, modulo can be replaced by bitwise AND: `tail = (tail + 1) & (capacity - 1)`.

#### 2. Monotonic Stack Pop-While-Violating Transitions
- **Dimension 1 (Contract & Complexity):** Ingest sequence and maintain strictly monotonic order. Total time $\Theta(N)$ across all elements; $O(N)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. For each incoming element `x` at index `i`:
     - While stack is not empty AND `nums[stack.Peek()] <= nums[i]` (for strictly decreasing stack):
       - Pop `topIndex = stack.Pop()`.
       - Record result: `nextGreater[topIndex] = nums[i]`. The incoming element `nums[i]` is the definitive "next greater element" for the popped index.
     - Push `stack.Push(i);`.
- **Dimension 3 (Visual State Transition):**
  ```
  Incoming array: [2, 1, 5]
  Push index 0 (val 2): Stack = [0(2)]
  Push index 1 (val 1): 1 < 2 -> Valid monotonic descent -> Stack = [0(2), 1(1)]
  Inspect index 2 (val 5):
    5 > nums[1(1)] -> Pop 1: NextGreater[1] = 5
    5 > nums[0(2)] -> Pop 0: NextGreater[0] = 5
    Stack empty -> Invariant restored!
  Push index 2 (val 5): Stack = [2(5)]
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  Every element is pushed onto the stack exactly once and popped at most once. Total stack mutations across the entire array pass $\le 2N$, yielding strict amortized $\Theta(1)$ work per item.
- **Dimension 5 (Edge Case Matrix):**
  - Strictly decreasing input: Zero pops occur during scan; all remaining elements on stack at termination have no next greater element (`-1`).
  - Strictly increasing input: Every step pops all existing elements, stack size never exceeds 1.

## WEEK 10-12: TREE FUNDAMENTALS
**Hierarchical Data Mastery**
### 📐 5W1H Taxonomy: Tree & Binary Tree Foundations
- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* A **Tree** is a connected acyclic graph. A **Rooted Binary Tree** has a singular `Root` and at most two children (`Left`, `Right`) per node.
  - *Core Invariants:* Edge-to-Node Law ($|E| = |V| - 1$); Unique Path Invariant (exactly 1 simple path between any two vertices); Recursive Substructure (every subtree is a valid tree).
  - *Misconception Check:* A tree is *not* a general graph; you never need a `HashSet<T> visited` set for simple traversals because cycles are mathematically impossible.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Replaces linear $O(N)$ search and rigid contiguous memory allocations with hierarchical logarithmic branching $O(\log N)$.
  - *Algorithmic Purpose:* Natural representation of hierarchical data, divide-and-conquer problem decomposition, and prefix/decision routing.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Hierarchical relationships (parent-child, DOM, organizational charts), recursive sub-problem aggregation (tree height, path sums, LCA).
  - *When to Avoid / Failure Modes:* Degenerate unbalanced trees collapse into linear linked lists with $O(N)$ depth, causing catastrophic `StackOverflowException` during recursive calls.
  - *Signal Words:* "Root-to-leaf path", "lowest common ancestor", "diameter of tree", "level-order snapshot".
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Explicit reference nodes on the heap: 16-byte header + 8-byte `Value` + 8-byte `Left` + 8-byte `Right` + 8-byte `Parent`. Deep trees require explicit heap stacks to bypass 1MB thread stack limits.
  - *Production Systems:* DOM trees in web browsers, AST (Abstract Syntax Trees) in compilers (Roslyn), directory file systems.
- **5. HOW (Operations, Implementation & Spoken Drill):**
  - *Operations Cost Model:* Traversals (Pre/In/Post/Level): $\Theta(N)$ time, $\Theta(H)$ space where $H$ is tree height ($\log N \le H \le N$).
  - *From-Scratch Implementation:* `TreeNode<T>` with recursive engines and explicit stack-based state machine iterative traversals (Morris traversal for $O(1)$ auxiliary space).
  - *Interview Spoken Drill (20–30s):* *"A binary tree is a connected acyclic graph with $|E| = |V| - 1$. I leverage post-order bottom-up aggregation for path contribution problems, and maintain explicit stacks to guard against stack overflows on skewed trees."*

### ⚖️ Architectural Comparison: Tree vs. Graph vs. Linked List (The Structural Continuum)
```
       [ General Graph ]
              │ (Constraint: Connected & Acyclic)
              ▼
           [ Tree ]
              │ (Constraint: Max Branching Factor = 2)
              ▼
        [ Binary Tree ]
              │ (Constraint: Branching Factor = 1)
              ▼
       [ Linked List ]
```

| Structural Property | Singly Linked List | Rooted Binary Tree | General Graph (Directed / Undirected) |
| :--- | :--- | :--- | :--- |
| **Mathematical Definition**| Linear digraph with maximum in-degree = 1 and out-degree = 1 | Connected acyclic digraph where one vertex has in-degree 0 (root) and all others have in-degree 1 | Arbitrary set of vertices $V$ and edges $E \subseteq V \times V$ |
| **Edge-to-Node Formula**| $|E| = |V| - 1$ | $\mathbf{|E| = |V| - 1}$ (strict invariant) | $0 \le |E| \le \frac{|V|(|V|-1)}{2}$ (undirected) |
| **Root / Entry Point** | Unique `Head` reference | Unique `Root` reference | Any vertex; may contain disconnected components |
| **Paths Between Two Nodes**| At most 1 directed path | **Exactly 1 unique simple path** between any two nodes | 0, 1, or multiple distinct simple paths |
| **Cycle Presence** | Forbidden (indicates corrupted list; detected via Floyd Tortoise/Hare) | **Strictly impossible** by definition | Frequent (requires cycle detection: 3-color DFS, DSU, or visited sets) |
| **Traversal Wavefronts** | Linear single-pointer step | DFS: Pre-order, In-order, Post-order<br>BFS: Level-order wavefront | DFS: Tree/Back/Forward/Cross edges<br>BFS: Shortest-path wavefronts |
| **Cycle Prevention Need**| None during standard traversal | **None** (acyclic guarantee means visited set is unnecessary) | **Mandatory** (`HashSet<T>` visited set to prevent infinite loops) |

- **Binary Tree Properties & Memory & From-Scratch Tree Node**: Node struct vs class allocation, complete binary tree maximum nodes at depth d = 2^d, recursive substructure (every subtree is a valid tree), recursive call stack depth = tree height (risk of stack overflow for degenerate trees); implementing `TreeNode<T>` and `BinaryTree<T>` container from scratch with recursive and iterative traversal engines
- **Traversal Invariants & Iterative Conversion**: Preorder root-first semantics (serialization), inorder left-root-right (sorted order for BST), postorder children-before-parent (deletion, subtree aggregation), converting any recursive traversal to iterative using explicit stack with state encoding; Morris traversal threaded binary tree mechanics for O(1) auxiliary space
- **BFS & Level-Wise Aggregation**: Queue-based BFS with level-size snapshot (`int size = queue.Count` at each level), zigzag direction toggle, null-separator level tracking alternative
- **Tree Path Problems (Post-Order Contribution Model)**: Tree height via postorder bottom-up, diameter = max(leftHeight + rightHeight) tracked via global variable, maximum path sum using "contribution" framing: `contrib(node) = node.val + max(0, leftContrib, rightContrib)`, path-through-node = `node.val + max(0, leftContrib) + max(0, rightContrib)`
- **Lowest Common Ancestor (LCA)**: Recursive divide: if both targets in left → recurse left, both in right → recurse right, otherwise current node is LCA; handles cases when target may not exist by returning found count
- **Tree Serialization & Reconstruction**: Preorder + null-marker serialization for unique reconstruction, rebuild from preorder + inorder using HashMap for O(1) inorder index lookup
- **N-ary Tree Traversal & Representation**: Generalizing binary tree to N children via `List<Node> children`; pre-order DFS and level-order BFS work identically; encoding N-ary tree as binary tree using left-child right-sibling (LCRS) transformation — first child = left pointer, next sibling = right pointer; O(1) space transformation with O(N) reconstruction
- **Threaded Binary Trees**: Each null pointer replaced by a thread to the in-order predecessor/successor; enables O(N) in-order traversal with O(1) auxiliary space without explicit stack; foundation for Morris traversal (already listed) — understand how threading avoids stack allocation at the architectural level
- **Expression Tree Construction & Evaluation**: Building AST from postfix / prefix expression strings; each operator node holds left/right operand subtrees; recursive evaluation = post-order traversal; real-world connection to Roslyn's `SyntaxTree` and `ExpressionTree<T>` in C# LINQ

### ⚙️ Core Operations & Internal Logic Deep-Dive: Binary Tree Traversal & Pointer Manipulation

#### 1. Stack-Frame State Machine Traversal (Iterative Pre/In/Postorder)
- **Dimension 1 (Contract & Complexity):** Traverse all $N$ nodes without system call stack recursion. Strict $\Theta(N)$ time; $\Theta(H)$ space where $H$ is tree height ($\log N \le H \le N$).
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Encode the recursive activation record into a discrete 3-phase state machine:
     - `State 0 (Process / Left)`: Emit value (if Preorder); push `(node, State 1)`; push `(node.Left, State 0)` if `node.Left != null`.
     - `State 1 (Inorder / Right)`: Emit value (if Inorder); push `(node, State 2)`; push `(node.Right, State 0)` if `node.Right != null`.
     - `State 2 (Postorder)`: Emit value (if Postorder); pop frame (exit subroutine).
  2. Emulate call stack via explicit `Stack<(TreeNode Node, int Phase)>`.
  3. Loop until explicit stack is empty.
- **Dimension 3 (Visual State Transition):**
  ```
  Tree:      [ 1 ]
            /     \
         [ 2 ]   [ 3 ]
  Initial: Stack = [(1, State 0)]

  Step 1: Pop (1,0) -> Preorder emits [1] -> Push (1,1) -> Push (2,0)
          Stack = [(1, State 1), (2, State 0)]
  Step 2: Pop (2,0) -> Preorder emits [2] -> Push (2,1) -> (2.Left is null)
          Stack = [(1, State 1), (2, State 1)]
  Step 3: Pop (2,1) -> Inorder emits [2]  -> Push (2,2) -> (2.Right is null)
          Stack = [(1, State 1), (2, State 2)]
  Step 4: Pop (2,2) -> Postorder emits [2] -> Node 2 finalized!
          Stack = [(1, State 1)]
  Step 5: Pop (1,1) -> Inorder emits [1]  -> Push (1,2) -> Push (3,0)
  ... Unfolds identically to the hardware instruction pointer register (RIP).
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *State Progress Invariant:* Each node transitions strictly $0 \to 1 \to 2$ before being permanently discarded. Every node enters the stack at most 3 times, guaranteeing exactly $3N$ operations $\implies \Theta(N)$ total time.
- **Dimension 5 (Edge Case Matrix):**
  - Skewed tree ($H = N$): Explicit stack grows to $N$ elements on managed heap, completely preventing OS thread `StackOverflowException` (1MB limit).
  - Empty tree (`root == null`): Immediate termination, 0 iterations.

#### 2. Morris Threaded In-Order Traversal ($O(1)$ Auxiliary Space)
- **Dimension 1 (Contract & Complexity):** In-order tree traversal with zero stack and zero queue allocation. Strict $\Theta(N)$ time; strict $\Theta(1)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Set `curr = root`.
  2. While `curr != null`:
     - If `curr.Left == null`: Emit `curr.Val; curr = curr.Right;`.
     - Else: Find in-order predecessor `pred = curr.Left`:
       - While `pred.Right != null && pred.Right != curr`: `pred = pred.Right;`.
       - If `pred.Right == null` (Thread doesn't exist yet):
         - Create thread: `pred.Right = curr;`
         - Advance: `curr = curr.Left;`
       - Else (`pred.Right == curr`, Thread already exists, returning from left subtree):
         - Destroy thread: `pred.Right = null;`
         - Emit `curr.Val;`
         - Advance: `curr = curr.Right;`
- **Dimension 3 (Visual State Transition):**
  ```
  Tree:       [ 2 ]
             /     \
          [ 1 ]   [ 3 ]

  Phase 1: curr=2. pred=1. pred.Right is null.
  CREATE THREAD: 1.Right = 2. Advance curr=1.
          [ 2 ] <────────┐
         /     \         │ (temporary thread)
      [ 1 ]───>─┘       [ 3 ]

  Phase 2: curr=1. curr.Left is null -> Emit [1]!
  Follow thread: curr = curr.Right (curr becomes 2).

  Phase 3: curr=2. pred=1. pred.Right == curr (Thread detected!).
  DESTROY THREAD: 1.Right = null (tree restored).
  Emit [2]! Advance curr = curr.Right (curr becomes 3).

  Phase 4: curr=3. curr.Left is null -> Emit [3]! curr = curr.Right (null) -> Done.
  Output: [1, 2, 3]. Tree structure is 100% restored to original state!
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Reversibility Invariant:* Every edge modified to point to an ancestor is traversed twice: once to establish the thread and once to destroy it. At completion, zero temporary threads remain in the tree, ensuring zero memory corruption.
- **Dimension 5 (Edge Case Matrix):**
  - Tree without left children (right-skewed): Degenerates to a linear linked list scan; zero threads created, runs in exactly $N$ iterations.
  - Full tree: Predecessor is always the rightmost node of left subtree.

#### 3. Post-Order Bottom-Up Contribution Model
- **Dimension 1 (Contract & Complexity):** Compute global tree metrics (diameter, maximum path sum) by gathering child answers before computing parent. $\Theta(N)$ time; $\Theta(H)$ space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Base case: If `node == null`, return 0.
  2. Recurse left: `int left = Math.Max(0, Dfs(node.Left));` (prune negative paths).
  3. Recurse right: `int right = Math.Max(0, Dfs(node.Right));`.
  4. Local Subtree Synthesis: Update global optimum with path crossing current node: `globalMax = Math.Max(globalMax, node.Val + left + right);`.
  5. Return Single Branch Contribution upward to parent: `return node.Val + Math.Max(left, right);`.
- **Dimension 3 (Visual State Transition):**
  ```
            [-10] (returns -10 + 35 = 25)
           /     \
         [9]     [20] (returns 20 + 15 = 35)
                /    \
             [15]    [7]
  Leaves 15 and 7 return 15 and 7.
  At node [20]: Local path = 20 + 15 + 7 = 42. Returns max(15,7)+20 = 35 upward.
  At node [-10]: Local path = -10 + 9 + 35 = 34.
  Global Maximum Path Sum = 42 (Path: 15 -> 20 -> 7).
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Subproblem Separation Invariant:* A valid path can only branch once. By returning $\max(\text{left}, \text{right})$ upward, the caller parent is guaranteed a non-branching half-path that can legally connect to ancestor nodes.
- **Dimension 5 (Edge Case Matrix):**
  - All node values negative: `Math.Max(0, ...)` safely clamps negative branch choices to 0, selecting the single least-negative node.

## WEEK 13-15: BINARY SEARCH TREES & ADVANCED TREES
**Ordered Tree Structures**
### 📐 5W1H Taxonomy: Binary Search Trees & Advanced Trees
- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *BST Invariant:* For every node $u$, all left descendants $< \text{val}(u) <$ all right descendants. In-order traversal yields sorted order.
  - *Balanced Trees (AVL / Red-Black):* Strictly enforce balance invariants via rotation primitives, bounding tree height to $O(\log N)$.
  - *Trie & Range Trees:* Tries store shared string prefixes; Fenwick/Segment Trees store interval aggregations.
  - *Misconception Check:* Checking only direct children (`left.val < node.val < right.val`) is *insufficient* to validate a BST; the range constraint `(min, max)` must propagate to all descendants.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Unifies the $O(\log N)$ search capability of sorted arrays with the $O(1)$ pointer-splicing insertions of linked lists.
  - *Algorithmic Purpose:* Enables dynamic sorted sets with predecessor, successor, and range query support (`[L, R]`) that Hash Tables cannot provide.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Dynamic collections requiring continuous order, interval queries, floor/ceiling queries, or auto-complete prefix search.
  - *When to Avoid / Failure Modes:* Simple lookup when sorting is not required (Hash Table is $O(1)$ vs BST $O(\log N)$); unrotated plain BSTs fed with sorted data degenerate to $O(N)$ linear chains.
  - *Signal Words:* "K-th smallest in BST", "range sum query mutable", "words matching prefix", "in-order successor".
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Heap nodes with reference pointers. Used in .NET `SortedDictionary<K,V>` and `SortedSet<T>` (implemented internally as Red-Black trees).
  - *Production Systems:* Database indexes (B+ Trees), IP routing tables (Tries), spell-check engines.
- **5. HOW (Operations, Implementation & Spoken Drill):**
  - *Operations Cost Model:* Search/Insert/Delete: $\Theta(\log N)$ balanced; Range Queries: $\Theta(\log N + K)$.
  - *From-Scratch Implementation:* Single and double tree rotations (LL, RR, LR, RL); 3-case deletion (leaf, one child, two children replaced by successor).
  - *Interview Spoken Drill (20–30s):* *"A BST enforces global ordering between subtrees, enabling $O(\log N)$ search and sorted range scans. I use self-balancing invariants like Red-Black coloring to eliminate degenerate $O(N)$ skewing."*

- **BST Invariant & Range Propagation**: Full BST property (`∀u ∈ left subtree: u < root < ∀v ∈ right subtree`), why checking only parent-child is insufficient, correct validation via propagating valid range `(min, max)` downward
- **BST Structural Operations & From-Scratch BST**: Inorder successor (leftmost in right subtree or first ancestor where we came from left), 3-case deletion (leaf → remove, one child → bypass, two children → replace with inorder successor), O(H) time where H = height; implementing `BinarySearchTree<T>` from scratch with Search, Insert, and 3-case Delete
- **Balanced BST Principles & AVL Implementation**: AVL balance factor ∈ {-1, 0, 1}, 4 rotation cases (LL = single right, RR = single left, LR = left-right double, RL = right-left double), Red-Black tree 5 properties (coloring + black-height invariant) guaranteeing height ≤ 2·log₂(N+1); implementing self-balancing `AVLTree<T>` from scratch with single and double rotations
- **Trie Architecture, Trade-offs & From-Scratch Trie**: Fixed `char[26]` children array (O(1) access, O(26·N) space) vs dynamic `Dictionary<char, TrieNode>` (O(1) average, less memory for sparse alphabets), `isEnd` flag for word boundary, prefix search vs full-word search; implementing `Trie` from scratch with Insert, Search, StartsWith, and word deletion
- **Segment Tree & Fenwick Tree Fundamentals & From-Scratch Implementations**: Segment tree build O(N), point update and range query both O(log N); Fenwick Tree (BIT) using lowbit operation `i & (-i)` — adding lowbit ascends to parent (update path), subtracting lowbit descends to prefix (query path), why this works via binary representation; implementing `FenwickTree` (Binary Indexed Tree) and array-backed `SegmentTree` from scratch
- **Tree DP Introduction**: Postorder bottom-up state aggregation, defining `dp[v][0/1]` for House Robber on tree (rob vs not-rob states), combining children results before computing parent
- **Interval Tree & Augmented BST**: Augmenting each BST node with `maxEndpoint` of its subtree; interval search query: check overlap with current node, recurse left if `left.maxEndpoint ≥ queryStart`, else recurse right; O(log N) per query on balanced BST; applications in calendar scheduling, IP packet routing, and database range locks
- **Order-Statistic Tree (Rank Tree)**: Augmenting each node with `subtreeSize`; `Select(k)` = k-th smallest in O(log N) by comparing k with left subtree size; `Rank(x)` = position of x in sorted order in O(log N); .NET's `SortedSet<T>` does NOT support this natively — must implement via augmented AVL/Red-Black; applications in LeetCode "Count of Smaller Numbers After Self"
- **Van Emde Boas Tree Intro (Optional Advanced)**: Universe-decomposing recursive structure on integer keys [0, U); O(log log U) search/insert/delete/successor/predecessor — asymptotically superior to O(log N) for integer keys; uses O(U) space; primarily academic but appears in advanced interviews; understand the cluster + summary recursive decomposition conceptually
- **Persistent Data Structures**: Functional / immutable variants where operations produce a new version without destroying the old; path copying in persistent BSTs: only O(log N) nodes copied per update; foundation for `git` commit history and functional programming immutable maps; cross-reference with Persistent Segment Tree in Week 55-56

### ⚙️ Core Operations & Internal Logic Deep-Dive: BST Mutations, Self-Balancing & Range Trees

#### 1. BST 3-Case Hibbard Deletion (`Delete(T key)`)
- **Dimension 1 (Contract & Complexity):** Remove target key and preserve global BST order $\forall u \in \text{Left} < \text{node} < \forall v \in \text{Right}$. $O(H)$ time where $H \in [\log N, N]$; $O(1)$ auxiliary space iterative.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Navigate to target node: if `key < curr.Val` go left; if `key > curr.Val` go right.
  2. When target is located:
     - **Case 1 (Target is Leaf):** Target has 0 children (`curr.Left == null && curr.Right == null`). Nullify parent pointer to `curr`.
     - **Case 2 (Target has 1 Child):** Replace parent's pointer to `curr` with `curr.Left ?? curr.Right`.
     - **Case 3 (Target has 2 Children):**
       a. Locate in-order successor $S$ (minimum node in `curr.Right` subtree: start at `curr.Right` and walk `.Left` until `.Left == null`).
       b. Overwrite target node's value: `curr.Val = S.Val;`.
       c. Delete node $S$ from right subtree: `curr.Right = Delete(curr.Right, S.Val);` (guaranteed to fall into Case 1 or Case 2 because $S$ has NO left child!).
- **Dimension 3 (Visual State Transition - Case 3):**
  ```
  Delete 20 from BST:
          [ 50 ]                      [ 50 ]
         /      \                    /      \
      [ 20 ]    [ 70 ]            [ 25 ]    [ 70 ]  <-- Value 20 replaced by 25!
     /      \                    /      \
  [ 10 ]    [ 30 ]            [ 10 ]    [ 30 ]
           /                           /
        [ 25 ] (Successor S)       [ null ] (S spliced out cleanly via Case 1)
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Successor Left-Nullity Theorem:* By definition, $S$ is the minimum element in `curr.Right`. If $S.\text{Left} \ne \text{null}$, then that left child would be strictly smaller than $S$, contradicting minimality. Therefore, $S.\text{Left}$ is identically null. Splicing $S$ out is always trivial (Case 1 or 2). Furthermore, $S$ is greater than all nodes in `curr.Left` and smaller than all remaining nodes in `curr.Right`, preserving the global BST invariant perfectly.
- **Dimension 5 (Edge Case Matrix):**
  - Target is Root: Updated root reference returned to caller.
  - Successor is immediate right child of target (`curr.Right.Left == null`): Immediate bypass of `curr.Right`.

#### 2. AVL Self-Balancing 4-Rotation Primitives
- **Dimension 1 (Contract & Complexity):** Rebalance AVL subtree after insertion/deletion when balance factor $|BF| > 1$. Strict $\Theta(1)$ pointer reassignments; restores balance in $\le 2$ rotations for insert, $\le O(\log N)$ rotations for delete.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. `BalanceFactor(node) = Height(node.Left) - Height(node.Right)`.
  2. Four canonical violation cases:
     - **LL Case** ($BF > 1$ and $BF(\text{node.Left}) \ge 0$): Single Right Rotation `RotateRight(node)`.
     - **RR Case** ($BF < -1$ and $BF(\text{node.Right}) \le 0$): Single Left Rotation `RotateLeft(node)`.
     - **LR Case** ($BF > 1$ and $BF(\text{node.Left}) < 0$): Left rotate `node.Left`, then Right rotate `node`.
     - **RL Case** ($BF < -1$ and $BF(\text{node.Right}) > 0$): Right rotate `node.Right`, then Left rotate `node`.
- **Dimension 3 (Visual State Transition - Right Rotation LL):**
  ```
  RotateRight around [ Y ]:
         [ Y ] (BF=+2)                     [ X ] (BF=0)
        /     \                           /     \
     [ X ]    [ C ]       ====>        [ A ]    [ Y ]
    /     \                                    /     \
  [ A ]   [ B ]                              [ B ]   [ C ]
  Pointers rewired:
  1. Y.Left = X.Right  (Subtree B adopted as Y's left child)
  2. X.Right = Y       (Y becomes X's right child)
  3. Recalculate heights: Height(Y) = 1 + max(H(B), H(C)), Height(X) = 1 + max(H(A), H(Y))
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Ordering Preservation:* In the original tree: $A < X < B < Y < C$. In the rotated tree: $A < X$, and $X < Y$, with $B$ between $X$ and $Y$ ($X < B < Y$) and $Y < C$. The sorted in-order traversal is identical ($A, X, B, Y, C$), while the tree height drops by 1.
- **Dimension 5 (Edge Case Matrix):**
  - Subtree $B$ is empty (`X.Right == null`): $Y.\text{Left}$ becomes null cleanly.
  - Node is Root: Root reference updated to point to new pivot node $X$.

#### 3. Red-Black Tree Insertion Uncle Cases
- **Dimension 1 (Contract & Complexity):** Insert new key with RED color, maintaining Black-Height invariant and Double-Red prohibition. $O(\log N)$ time, at most 2 rotations.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  Let $Z$ be new node (RED), $P$ be parent (RED), $G$ be grandparent (BLACK), $U$ be uncle (sibling of $P$).
  - **Case 1 (Uncle is RED):** Color Flip.
    - Set $P.\text{Color} = \text{BLACK}$, $U.\text{Color} = \text{BLACK}$, $G.\text{Color} = \text{RED}$.
    - Advance $Z = G$ up the tree; repeat check.
  - **Case 2 (Uncle is BLACK - Triangle/Zig-Zag):**
    - Rotate $P$ opposite to $Z$ to form a straight line. $Z$ becomes old parent; advance to Case 3.
  - **Case 3 (Uncle is BLACK - Line):**
    - Rotate $G$ in opposite direction of $P$.
    - Swap colors: $P.\text{Color} = \text{BLACK}$, $G.\text{Color} = \text{RED}$.
    - Tree is now fully balanced; terminate.
- **Dimension 3 (Visual State Transition - Case 1 Color Flip):**
  ```
         [ G (B) ]                             [ G (R) ] <-- Push red upward
        /         \                           /         \
     [ P (R) ]   [ U (R) ]     ====>       [ P (B) ]   [ U (B) ]
       /                                     /
    [ Z (R) ]                             [ Z (R) ]
  (Both children of G absorb blackness; Black-Height across all paths unchanged!)
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Black-Height Invariant:* In Case 1, the number of black nodes on any path passing through $G$ remains identical because the $+1$ black on $P$ and $U$ balances the $-1$ black on $G$. In Case 3, the rotated parent becomes BLACK while the grandparent becomes RED, restoring black-height without introducing double reds.
- **Dimension 5 (Edge Case Matrix):**
  - $G$ is Root: Root forced to BLACK at end of insertion; increments tree black-height by 1 globally.

#### 4. Fenwick Tree (BIT) Lowbit Navigation Paths
- **Dimension 1 (Contract & Complexity):** Point update $+V$ and prefix sum query $\sum_{k=1}^i A[k]$ in $O(\log N)$ time; $\Theta(N)$ build; $O(N)$ space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Lowbit isolation primitive: `lowbit(i) = i & (-i)`.
  2. **Point Update (`Add(int i, int delta)`):**
     - Loop while $i \le N$: `tree[i] += delta; i += i & (-i);`.
     - *Logic:* Ascend through all binary intervals that contain index $i$.
  3. **Prefix Query (`Query(int i)`):**
     - `sum = 0;` while $i > 0$: `sum += tree[i]; i -= i & (-i);`.
     - *Logic:* Accumulate disjoint power-of-two prefix blocks by peeling off the least significant bit.
- **Dimension 3 (Visual State Transition):**
  ```
  Query prefix sum at index 7 (binary 0111):
  Step 1: sum += tree[7]  (0111: covers [7..7], length 1)
          i -= (7 & -7) -> 7 - 1 = 6 (binary 0110)
  Step 2: sum += tree[6]  (0110: covers [5..6], length 2)
          i -= (6 & -6) -> 6 - 2 = 4 (binary 0100)
  Step 3: sum += tree[4]  (0100: covers [1..4], length 4)
          i -= (4 & -4) -> 4 - 4 = 0 -> Terminate.
  Result: tree[7] + tree[6] + tree[4] = Sum([1..7]) in exactly 3 steps!
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Binary Decomposition Invariant:* Any integer $i \in [1, N]$ has at most $\lfloor \log_2 N \rfloor + 1$ set bits. Stripping the lowest set bit at each step guarantees termination in $\le \log_2 N$ iterations with zero interval overlap.
- **Dimension 5 (Edge Case Matrix):**
  - Index 0: Fenwick trees are strictly 1-indexed because `0 & (-0) == 0`, which triggers an infinite loop. Always offset 0-indexed arrays by $+1$.

#### 5. Segment Tree Canonical Cover & Lazy Propagation
- **Dimension 1 (Contract & Complexity):** Range Query and Range Update in $\Theta(\log N)$ time; $\Theta(N)$ build; $4N$ flat array allocation.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. **Canonical Decomposition (`Query(node, l, r, ql, qr)`):**
     - If $[ql, qr]$ completely contains $[l, r]$: return `tree[node]`.
     - If disjoint ($qr < l$ or $ql > r$): return identity element (0 for sum, $\infty$ for min).
     - Otherwise: `PushDown(node, l, r)`. Recurse left and right. Return `Merge(leftResult, rightResult)`.
  2. **Lazy Propagation (`PushDown(node, l, r)`):**
     - If `lazy[node] != 0`:
       - Transfer tag: `lazy[2*node] += lazy[node]; lazy[2*node+1] += lazy[node];`.
       - Update children tree values: scaled by child interval lengths.
       - Clear parent tag: `lazy[node] = 0;`.
- **Dimension 3 (Visual State Transition):**
  ```
  Query range [2..5] on root [0..7]:
               [0..7] (Partial overlap -> PushDown & Split)
              /      \
          [0..3]     [4..7] (Both partial -> Split)
         /      \   /      \
      [0..1]  [2..3] [4..5] [6..7]
      (Disj)  (CANONICAL) (CANONICAL) (Disj)
  Query decomposes into exactly 2 canonical nodes: [2..3] and [4..5]!
  At most 4 nodes visited at each level of the tree -> 4 * log(N) bound!
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *At-Most-4 Nodes Per Level Theorem:* Any contiguous range $[ql, qr]$ intersects at most 2 boundary subtrees (left boundary and right boundary). All interior nodes between the boundaries are fully enclosed canonical covers and do not recurse further, guaranteeing $O(\log N)$ complexity.
- **Dimension 5 (Edge Case Matrix):**
  - Single-element range $ql == qr$: Reaches exact leaf node without unnecessary branching.

## WEEK 16-17: HEAP & PRIORITY QUEUE MASTERY
**Priority-Based Problem Solving**
### 📐 5W1H Taxonomy: The Binary Heap & Priority Queue
- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* A **Binary Heap** is a complete binary tree stored implicitly inside a flat array that satisfies the **Heap-Order Invariant** (Min-Heap: $\text{Parent} \le \text{Children}$).
  - *Core Invariants:* Complete Tree Shape (dense left-packed array); Implicit Indexing Formulas ($\text{Left} = 2i+1, \text{Right} = 2i+2, \text{Parent} = \lfloor(i-1)/2\rfloor$).
  - *Misconception Check:* A binary heap does *not* sort the array; siblings have no relative ordering. Extracting all elements is $O(N \log N)$, but initial bulk building is linear $\Theta(N)$.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the $O(N)$ insertion cost of maintaining a fully sorted array when you only need dynamic access to the minimum or maximum element.
  - *Mathematical Advantage:* Floyd's linear `BuildHeap` achieves $\Theta(N)$ construction via bottom-up sift-downs, avoiding the $\Theta(N \log N)$ cost of repeated insertions.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Top-K elements, dynamic running median (dual heaps), K-way merge of sorted streams, greedy graph algorithms (Dijkstra, Prim).
  - *When to Avoid / Failure Modes:* Searching for arbitrary keys ($O(N)$ linear scan); range queries; when elements must be traversed in sorted order without popping.
  - *Signal Words:* "Kth largest/smallest element", "merge K sorted lists", "minimum cost to connect", "running stream median".
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* 100% flat contiguous array. Zero node-pointer overhead; optimal CPU cache line prefetching.
  - *Production Systems:* Priority job schedulers in OS kernels (Linux CFS), timer wheels, event-driven simulation engines.
- **5. HOW (Operations, Implementation & Spoken Drill):**
  - *Operations Cost Model:* `Peek`: $\Theta(1)$; `Insert`: $\Theta(\log N)$; `ExtractMin`: $\Theta(\log N)$; `BuildHeap`: $\Theta(N)$.
  - *From-Scratch Implementation:* Dynamic array backing, `SiftUp`, and `SiftDown` with element swaps.
  - *Interview Spoken Drill (20–30s):* *"A binary heap is an array-backed complete tree enforcing the partial-order invariant that parents are less than or equal to children. It provides $O(1)$ min-inspection and $O(\log N)$ updates, constructed in linear $O(N)$ time via Floyd's algorithm."*

### ⚖️ Architectural Comparison: Priority Queue vs. Monotonic Queue vs. Monotonic Stack
| Architectural Feature | Priority Queue (Binary Heap) | Monotonic Queue (Deque) | Monotonic Stack |
| :--- | :--- | :--- | :--- |
| **Underlying Container**| Complete binary tree in contiguous array | Double-ended queue (`CircularArrayDeque` or `LinkedList`) | Dynamic array (`ArrayStack`) or linked nodes |
| **Order Maintenance** | Heap invariant restored via `SiftUp` / `SiftDown` | Maintained by evicting smaller/larger elements from the **Back** | Maintained by popping violating elements from the **Top** |
| **Eviction Mechanics** | Explicit extraction of minimum/maximum element | 1. **Back eviction:** Maintained on every push<br>2. **Front eviction:** When element expires outside window | **Top eviction:** Popped whenever the incoming element violates monotonicity |
| **Time per Operation** | $\Theta(\log K)$ per push/pop | **Amortized $\Theta(1)$** (each element enters and leaves deque at most once) | **Amortized $\Theta(1)$** (each element pushed and popped at most once) |
| **Active Window Scope** | Global extrema over all unextracted items | **Local extrema over contiguous sliding window $[i-K+1, i]$** | **Nearest boundary element** (Next Greater / Previous Smaller) |
| **Canonical Interview Triggers**| 1. K-way merge of sorted streams<br>2. Find Kth largest element<br>3. Dijkstra / Prim greedy shortest paths | 1. Sliding Window Maximum / Minimum<br>2. Shortest subarray with sum at least $K$<br>3. Constrained subsequence sum DP | 1. Daily Temperatures / Next Greater Element<br>2. Largest Rectangle in Histogram<br>3. Trapping Rain Water (horizontal scan) |

- **Binary Heap Structure, Array Layout & From-Scratch Min/Max Heap**: Heap property invariant (parent ≤ children for min-heap), complete binary tree stored in array (left child = `2i+1`, right = `2i+2`, parent = `(i-1)/2`), why complete tree shape minimizes height to O(log N); implementing `BinaryHeap<T>` (`MinHeap<T>` and `MaxHeap<T>`) from scratch with dynamic array backing, `SiftUp`, `SiftDown`, and $O(N)$ linear `BuildHeap`
- **Heapify & Build Heap Complexity**: Heapify-up after insert O(log N), heapify-down after extract O(log N), linear-time BuildHeap proof: start from last non-leaf, heapify-down all; total work = sum of heights × nodes at each height = O(N) (geometric series argument), NOT O(N log N)
- **Top-K & Streaming Algorithms**: Min-heap of size K for Kth largest (if new element > heap.top, pop and push): O(N log K); dual-heap running median (max-heap for lower half, min-heap for upper half, balance invariant `|maxH.size - minH.size| ≤ 1`)
- **K-Way Merge**: Insert first element of each of K sorted lists into min-heap with list index, repeatedly extract-min and insert next from that list: O(N log K) total
- **Lazy Deletion Pattern**: When decrease-key is unavailable (e.g. .NET `PriorityQueue`), push new entry with updated priority; when dequeuing, skip if entry is stale (track actual values in a dictionary); comparison with theoretical Fibonacci/Pairing Heaps (why binary heaps win in practice due to cache locality)
- **d-ary Heap**: Generalization of binary heap to d children per node; `Parent(i) = (i-1)/d`, `j-th child of i = d·i + j + 1`; decreasing d reduces tree height (fewer SiftUp steps) but increases SiftDown cost (must compare d children); d=4 often optimal in practice for Dijkstra-heavy workloads due to CPU cache prefetching of d children fitting in one cache line
- **Indexed Priority Queue (Heap + HashMap)**: Augmenting min-heap with inverse index map `pos[key] → heapIndex`; enables O(log N) `DecreaseKey(key, newPriority)` by updating heap index + sifting; critical for efficient Prim's MST and Dijkstra when edge weights change; implementing `IndexedPriorityQueue<TKey, TPriority>` from scratch
- **Fibonacci Heap (Theoretical Deep Dive)**: Lazy merging of binomial trees enabling amortized O(1) insert and DecreaseKey, O(log N) ExtractMin; why it achieves O(E + V log V) Dijkstra (vs O((E+V) log V) for binary heap); why it is NOT used in practice (high constant factors, cache unfriendly, complex implementation) — understanding theoretical vs practical trade-off is an interview signal
- **Soft Heap (Approximate Priority Queue)**: Trades correctness for speed — intentionally corrupts some element keys to achieve O(1) amortized operations; used in optimal deterministic MST algorithm O(E α(V)); know the concept for system design discussions on approximation trade-offs

### ⚙️ Core Operations & Internal Logic Deep-Dive: Binary Heap, Sifting & Priority Queues

#### 1. SiftUp Bubbling Insertion (`Insert(T value)`)
- **Dimension 1 (Contract & Complexity):** Append element to heap and restore min-heap property. Worst-case $\Theta(\log N)$ time; strict $\Theta(1)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Append `value` to the end of the backing dynamic array: `_items.Add(value);`.
  2. Set current index `i = _items.Count - 1;`.
  3. While $i > 0$:
     - Compute parent index: `int p = (i - 1) / 2;`.
     - If `_items[i] < _items[p]`: `Swap(i, p); i = p;`.
     - Else: Heap invariant satisfied; `break;`.
- **Dimension 3 (Visual State Transition):**
  ```
  Insert 5 into Min-Heap [10, 20, 30, 40]:
  Array: [10, 20, 30, 40, 5] (5 placed at index 4)
  Tree:
          [ 10 ]
         /      \
      [ 20 ]    [ 30 ]
     /      \
  [ 40 ]    [ 5 ] (Index 4)

  Step 1: Compare with parent index 1 (val 20). 5 < 20 -> Swap(4, 1):
  Array: [10, 5, 30, 40, 20]
  Step 2: Compare with parent index 0 (val 10). 5 < 10 -> Swap(1, 0):
  Array: [5, 10, 30, 40, 20]
  i becomes 0 -> Terminate. 5 is new root!
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Ancestor Spine Invariant:* The new element only violates the heap invariant with respect to its ancestors. Subtrees not on the path from index $i$ to root are completely untouched and retain their valid heap-order invariant.
- **Dimension 5 (Edge Case Matrix):**
  - First element inserted: $i=0$, while loop never executes; becomes root in $O(1)$.
  - Element is larger than parent: Zero swaps, terminates in 1 comparison ($O(1)$ best-case).

#### 2. SiftDown Extrema Extraction (`ExtractMin()`)
- **Dimension 1 (Contract & Complexity):** Remove and return root minimum element, restoring complete tree shape and min-heap order. Strict $\Theta(\log N)$ time; $\Theta(1)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Capture root minimum: `T min = _items[0];`.
  2. Overwrite root with last element: `_items[0] = _items[_items.Count - 1]; _items.RemoveAt(_items.Count - 1);`.
  3. If heap is non-empty, call `SiftDown(0)`:
     - While left child `2i + 1 < _items.Count`:
       - `int smallest = i; int left = 2i + 1; int right = 2i + 2;`
       - If `_items[left] < _items[smallest]`: `smallest = left;`
       - If `right < _items.Count && _items[right] < _items[smallest]`: `smallest = right;`
       - If `smallest != i`: `Swap(i, smallest); i = smallest;`
       - Else: `break;`
- **Dimension 3 (Visual State Transition):**
  ```
  ExtractMin from [5, 10, 30, 40, 20]:
  Step 1: Save 5. Overwrite root with 20. Array: [20, 10, 30, 40]
  Step 2: SiftDown(0): Compare 20 with left child 10 and right child 30.
          Smallest child is 10 (index 1). 10 < 20 -> Swap(0, 1):
  Array: [10, 20, 30, 40]
  Step 3: At index 1: left child is 40. 20 < 40 -> Invariant restored!
  Return 5.
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  Swapping with the strictly smaller of the two children guarantees that after the swap, the new parent is less than or equal to both children, preserving the min-heap invariant at the current level while pushing the anomaly down one level.
- **Dimension 5 (Edge Case Matrix):**
  - Single element heap: Root removed, size becomes 0, `SiftDown` bypassed.
  - Node has only left child (right child index $\ge \text{Count}$): Checked safely via `right < Count` guard.

#### 3. Floyd's Linear $\Theta(N)$ `BuildHeap` Algorithm
- **Dimension 1 (Contract & Complexity):** Convert arbitrary unordered array of length $N$ into a valid binary heap. Strict $\Theta(N)$ time (NOT $\Theta(N \log N)$); in-place $\Theta(1)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. All leaf nodes (indices $\lfloor N/2 \rfloor \dots N-1$) are already valid 1-element heaps.
  2. Iterate backward from the last non-leaf node down to the root:
     `for (int i = (N / 2) - 1; i >= 0; i--) SiftDown(i);`
- **Dimension 3 (Mathematical Work Summation):**
  ```
  At height h (distance from leaf), there are at most ⌈N / 2^(h+1)⌉ nodes.
  Each SiftDown at height h performs at most O(h) operations.
  Total Work S = ∑ (N / 2^(h+1)) * h = (N / 2) * ∑ (h / 2^h) for h=1 to log N.
  Since ∑ (h / 2^h) = (1/2) / (1 - 1/2)^2 = 2 (standard arithmetico-geometric series):
  Total Operations S ≤ (N / 2) * 2 = N = Θ(N)!
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Inductive Invariant:* Before calling `SiftDown(i)`, both the left subtree rooted at $2i+1$ and the right subtree rooted at $2i+2$ are strictly valid heaps. `SiftDown(i)` correctly merges these two valid heaps with parent $i$, establishing a valid heap rooted at $i$.
- **Dimension 5 (Edge Case Matrix):**
  - $N=0$ or $N=1$: Loop bounds $(N/2 - 1) < 0$; 0 operations executed.

#### 4. Indexed Priority Queue (`DecreaseKey(key, newPriority)`)
- **Dimension 1 (Contract & Complexity):** Update the priority of an arbitrary element and restore the heap. Strict $\Theta(\log N)$ time without $O(N)$ linear scans; $O(N)$ auxiliary index table.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Maintain bidirectional pointers: `heap[i] = (key, priority)` and `pos[key] = heapIndex`.
  2. In `Swap(i, j)`: Update `pos[heap[i].key] = i; pos[heap[j].key] = j;`.
  3. `DecreaseKey(key, newPriority)`:
     - Locate index `i = pos[key];`.
     - Update priority: `heap[i].priority = newPriority;`.
     - Call `SiftUp(i);` to bubble the decreased key toward the root in $O(\log N)$.

## WEEK 18-19: HASH TABLE & SET MASTERY
**Constant Time Access Patterns**
### 📐 5W1H Taxonomy: Hash Table & Hash Set (`ChainedHashMap`, `LinearProbingHashMap`)
- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* An associative dictionary mapping unique keys to values via a deterministic **Hash Function** $h(k)$ into an array of buckets.
  - *Core Invariants:* Determinism Invariant (`a.Equals(b) ⟹ a.GetHashCode() == b.GetHashCode()`); Load Factor Bound ($\alpha = N/M \le 0.75$).
  - *Misconception Check:* Hash lookup is *not* guaranteed $O(1)$; it is average $\Theta(1)$. Hostile hash collisions or poor distribution degrade operations to worst-case $\Theta(N)$ linear scans.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Bypasses the $\Omega(\log N)$ comparison-based search lower bound to achieve instantaneous $\Theta(1)$ expected time lookup and insertion.
  - *Algorithmic Purpose:* Constant-time frequency tracking, instant membership testing, and dynamic memoization caching.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* High-frequency key lookup, duplicate detection, counting occurrences, graph visited set tracking.
  - *When to Avoid / Failure Modes:* Sorted order traversal, range queries `[L, R]`, keys with mutable hash codes (mutating an object while stored in a hash set corrupts the bucket lookup).
  - *Signal Words:* "Two sum / pair sum", "frequency counter", "first non-repeating character", "group anagrams".
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* .NET `Dictionary<K,V>` uses prime bucket arrays + flat `Entry[]` array with separate chaining via array indices (cache-conscious chaining).
  - *Production Systems:* Memcached / Redis key-value stores, database hash joins, distributed consistent hash rings.
- **5. HOW (Operations, Implementation & Spoken Drill):**
  - *Operations Cost Model:* Search/Insert/Delete: Average $\Theta(1)$, Worst $\Theta(N)$; Rehashing: $\Theta(N)$.
  - *From-Scratch Implementation:* Separate chaining with linked buckets vs. Open addressing with linear probing and tombstone markers.
  - *Interview Spoken Drill (20–30s):* *"A hash table maps keys to buckets via a deterministic hash function, providing average $\Theta(1)$ search and insertion. I manage collisions via separate chaining or linear probing with tombstones, resizing when the load factor exceeds 0.75."*

### ⚖️ Architectural Comparison: Binary Search Tree vs. Binary Heap vs. Hash Table
| Feature / Operation | Balanced BST (AVL / Red-Black) | Binary Heap (`MinHeap` / `MaxHeap`) | Hash Table (Chained / Probing) |
| :--- | :--- | :--- | :--- |
| **Ordering Property** | **Strict Total Order:** $\text{Left} < \text{Root} < \text{Right}$ everywhere | **Weak Partial Order:** $\text{Parent} \le \text{Children}$ (no left vs right order) | **Zero Order:** Elements distributed pseudorandomly by hash code |
| **Physical Storage** | Explicit pointer-linked tree nodes on heap | **Implicit complete tree in flat contiguous array** | Array of buckets containing entries or chains |
| **Find Key $k$** | $\mathbf{\Theta(\log N)}$ deterministic | $\Theta(N)$ (requires linear scan of array) | $\mathbf{\Theta(1)}$ average, $\Theta(N)$ worst |
| **Find Min / Max** | $\Theta(\log N)$ (or $\Theta(1)$ with cached extremum pointer) | $\mathbf{\Theta(1)}$ (always stored at index `0`) | $\Theta(N)$ (requires inspecting all buckets) |
| **Extract Min / Max** | $\Theta(\log N)$ | $\mathbf{\Theta(\log N)}$ via `SiftDown` | $\Theta(N)$ |
| **Insert Key** | $\Theta(\log N)$ | $\Theta(\log N)$ (amortized $O(1)$ push + sift up) | $\Theta(1)$ average, $\Theta(N)$ worst |
| **Delete Arbitrary Key** | $\Theta(\log N)$ | $\Theta(N)$ to locate + $\Theta(\log N)$ to restore | $\Theta(1)$ average |
| **Range Queries `[L, R]`**| $\mathbf{\Theta(\log N + K)}$ via in-order traversal | Not supported ($\Theta(N \log N)$) | Not supported ($\Theta(N)$ full table scan) |
| **Successor / Predecessor**| $\mathbf{\Theta(\log N)}$ | $\Theta(N)$ | Not supported |
| **Bulk Construction** | $\Theta(N \log N)$ | $\mathbf{\Theta(N)}$ via Floyd linear `BuildHeap` | $\Theta(N)$ average |
| **Memory Footprint** | High (24–32 bytes overhead per node) | **Zero overhead** (pure flat contiguous buffer) | Moderate ($1.3\times$ to $2\times$ capacity factor) |

- **Hash Function Design**: Uniform distribution requirement, determinism, avalanche effect (small input change → large output change), polynomial rolling hash for strings: `hash(s) = s[0]·p^(n-1) + s[1]·p^(n-2) + ... + s[n-1]`
- **Collision Resolution Mechanics & Dual From-Scratch Hash Tables**: Separate chaining (linked list per bucket, Java HashMap treeifies chains ≥ 8 to Red-Black tree), open addressing (linear probing → primary clustering, quadratic probing, double hashing → minimal clustering), load factor α = N/M threshold; implementing `ChainedHashMap<K, V>` (separate chaining) and `LinearProbingHashMap<K, V>` (open addressing with tombstone deletion and dynamic rehashing) from scratch
- **Amortized O(1) Insert via Potential Method**: Define Φ = number of filled slots, amortized cost of insert = actual cost + ΔΦ; during rehash actual cost = O(N) but accumulated Φ covers it, proving amortized O(1)
- **C# Dictionary Internals & Equality Contract**: `Dictionary<K,V>` uses prime bucket counts + separate chaining in entries array; critical rule: if `a.Equals(b)` then `a.GetHashCode() == b.GetHashCode()` — violating this corrupts the dictionary; always override both when using custom types as keys
- **Advanced Hashing Applications**: Rolling hash for sliding window substring matching, consistent hashing ring for distributed systems (each key maps to nearest clockwise server), virtual nodes for load balancing variance reduction
- **Perfect Hashing**: Static set of N keys: two-level scheme — hash to M = N buckets, within each bucket build a secondary perfect hash table of size = (collisions in bucket)²; worst-case O(1) lookup with O(N) expected total space; contrast with dynamic hash tables where O(1) is only average
- **Cuckoo Hashing**: Two hash functions h1, h2; each key occupies position h1(k) or h2(k); on collision, evict current occupant to its alternative position (chain eviction); lookup always O(1) worst-case (only 2 positions to check); insert expected O(1), worst-case O(N) if cuckoo cycle detected → full rehash; implementing `CuckooHashMap<K,V>` from scratch
- **Robin Hood Hashing**: Open-addressing variant where elements with higher probe length ("poor" elements) steal positions from elements with lower probe length ("rich" elements); reduces maximum probe length variance; lookup: stop when probe length of current slot < probe length of query → O(1) negative lookups; used in many modern hash table implementations (Rust's `HashMap`)
- **Hash Table Security & Denial of Service**: Hash flooding attacks: adversary crafts keys with same hash code causing O(N) degradation; mitigations: randomized seeds (MSVC, .NET uses randomized `GetHashCode` per-process), SipHash authenticated hash function; .NET `Dictionary<K,V>` uses randomized seed for `string` keys by default since .NET Core

### ⚙️ Core Operations & Internal Logic Deep-Dive: Hash Table Resolution & Dynamic Rehashing

#### 1. Separate Chaining Bucket Traversal (`Put(K key, V value)`)
- **Dimension 1 (Contract & Complexity):** Associate `value` with `key`. Average $\Theta(1)$ time, worst-case $\Theta(N)$ under malicious hash collision attack; $\Theta(1)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Compute non-negative bucket index: `int bucket = (key.GetHashCode() & 0x7FFFFFFF) % _buckets.Length;`.
  2. Traverse linked chain at `_buckets[bucket]`:
     - If `entry.Key.Equals(key)`: Overwrite `entry.Value = value; return;`.
  3. If key is not present in chain:
     - Instantiate new node: `var newNode = new Node(key, value, _buckets[bucket]);`.
     - Prepend node to head of chain: `_buckets[bucket] = newNode; _count++; _version++;`.
  4. Check Load Factor: If `(double)_count / _buckets.Length > 0.75`, invoke `Rehash()`.
- **Dimension 3 (Visual State Transition):**
  ```
  Put("pear", 30) into table with 4 buckets. hash("pear") % 4 = 1.
  Bucket 1 currently points to: ["apple": 10] -> ["banana": 20] -> null
  Step 1: Traverse chain. Neither equals "pear".
  Step 2: Prepend new node "pear" as head of Bucket 1 chain:
  _buckets[1] -> ["pear": 30] -> ["apple": 10] -> ["banana": 20] -> null
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Deterministic Reachability:* For any key $k$, its bucket index is uniquely determined by `hash(k) % M`. Since the hash function is deterministic, looking up $k$ will always inspect this exact chain.
- **Dimension 5 (Edge Case Matrix):**
  - Null key: Handled by custom guard or dedicated zero-index bucket.
  - Negative hash codes: Bitwise AND `hash & 0x7FFFFFFF` masks sign bit, guaranteeing positive modulo.

#### 2. Open Addressing Linear Probing with Tombstones (`Remove(K key)`)
- **Dimension 1 (Contract & Complexity):** Delete entry while keeping subsequent probe sequences intact. Average $\Theta(1)$ time, $\Theta(1)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Compute starting index: `int idx = (key.GetHashCode() & 0x7FFFFFFF) % _capacity;`.
  2. Linear probe loop:
     - If slot is empty (`_table[idx].State == Empty`): Key is absent; return `false`.
     - If slot is active AND `_table[idx].Key.Equals(key)`:
       - **Mark Tombstone:** `_table[idx].State = Deleted; _table[idx].Key = default; _table[idx].Value = default;`.
       - Decrement `_count--; _version++; return true;`.
     - Else: `idx = (idx + 1) % _capacity;` (advance probe).
- **Dimension 3 (Visual State Transition):**
  ```
  Keys with hash % 5 = 1 inserted: "A" at 1, "B" at 2, "C" at 3.
  Slots: [0: Empty] [1: A] [2: B] [3: C] [4: Empty]

  [OPERATION: Remove("B")]
  CRITICAL: Do NOT set slot 2 to Empty!
  If slot 2 was Empty, a subsequent search for "C" would hash to 1, check 1 ("A"),
  step to 2, see Empty, and erroneously report "C is not found"!
  INSTEAD, mark as Tombstone (T):
  Slots: [0: Empty] [1: A] [2: TOMBSTONE] [3: C] [4: Empty]
  Search for "C" encounters Tombstone at 2, continues probe to 3, and finds "C"!
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Cluster Continuity Invariant:* Linear probing relies on contiguous runs of non-empty slots. Tombstones act as bridges during search and re-usable empty slots during insert, preserving probe integrity.
- **Dimension 5 (Edge Case Matrix):**
  - Full table of tombstones: Rehashing purges all tombstones, reclaiming slots.

#### 3. Dynamic Rehashing & Prime Capacity Scaling
- **Dimension 1 (Contract & Complexity):** Reallocate and redistribute all elements when load factor exceeds threshold $\alpha = 0.75$. $\Theta(N)$ time; $\Theta(N)$ auxiliary buffer.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Select next prime number approximately $2 \times \text{capacity}$ (prime capacity minimizes collisions when hash codes have common factors).
  2. Allocate `newBuckets = new Node[newCapacity]`.
  3. For each bucket in old array:
     - While chain is not null:
       - Unlink node: `var curr = chain; chain = chain.Next;`
       - Recompute destination: `int newIdx = (curr.Key.GetHashCode() & 0x7FFFFFFF) % newCapacity;`
       - Prepend to `newBuckets[newIdx]`.
  4. Swing table pointer: `_buckets = newBuckets;`.
- **Dimension 3 (Visual State Transition):**
  ```
  Old Cap = 4, New Cap = 7 (Prime).
  Keys with hash 4 and 8 both mapped to bucket 0 in old table (4%4=0, 8%4=0).
  In new table:
  hash 4 -> 4 % 7 = Bucket 4
  hash 8 -> 8 % 7 = Bucket 1
  Rehashing successfully disperses collision clusters across the new prime space!
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  Amortized analysis via Potential Function $\Phi = 2 \cdot \text{count} - \text{capacity}$ guarantees that the accumulated prepayments over $O(N)$ cheap insertions fully pay for the $O(N)$ migration cost, yielding amortized $O(1)$ operations.
- **Dimension 5 (Edge Case Matrix):**
  - Table reaches maximum array size: Clamp to `int.MaxValue` or throw `OutOfMemoryException`.

## WEEK 20-23: GRAPH FUNDAMENTALS
**Network & Relationship Modeling**
### 📐 5W1H Taxonomy: Graph Foundations & Representations
- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Formal Definition:* A **Graph** $G = (V, E)$ models entities as vertices $V$ and arbitrary relationships as edges $E \subseteq V \times V$.
  - *Core Invariants:* Handshaking Lemma ($\sum \text{deg}(v) = 2|E|$); Tree Boundary ($|E| = |V|-1$); DAG Topological Invariant (valid ordering exists iff no directed cycle).
  - *Misconception Check:* Forgetting cycle detection in general graphs causes infinite loops; unlike trees, graphs strictly require `HashSet<T>` visited tracking or 3-color states.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Overcomes the strict single-parent limitation of trees, enabling modeling of arbitrary networks, cyclic workflows, and multi-path dependencies.
  - *Algorithmic Purpose:* Shortest-path routing, dependency scheduling, network connectivity, and reachability.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Modeling multi-hop relationships, prerequisite ordering (topological sort), shortest paths (BFS / Dijkstra), bipartite matching.
  - *When to Avoid / Failure Modes:* Simple hierarchical data (use Trees to save visited overhead); using $O(V^2)$ adjacency matrices on large sparse graphs.
  - *Signal Words:* "Prerequisites / course schedule", "clone graph", "network delay time", "number of connected islands".
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical CLR Memory:* Adjacency List: `List<int>[]` or `Dictionary<T, List<T>>` ($O(V+E)$ memory). CSR (Compressed Sparse Row) uses flat contiguous arrays for maximum cache speed.
  - *Production Systems:* Git commit history (DAG), social network friend graphs, Google PageRank web crawler, GPS road navigation.
- **5. HOW (Operations, Implementation & Spoken Drill):**
  - *Operations Cost Model:* BFS / DFS: $\Theta(V + E)$ with adjacency list; Edge lookup: $\Theta(1)$ with matrix.
  - *From-Scratch Implementation:* `AdjacencyListGraph<T>` with edge weights; 3-color state machine cycle detection (White, Gray, Black).
  - *Interview Spoken Drill (20–30s):* *"A graph models arbitrary pairwise relationships. For sparse graphs, I represent edges via adjacency lists for $O(V+E)$ traversal, enforcing cycle safety through 3-color states or hash visited sets."*

### ⚖️ Architectural Comparison: Graph Storage (Adjacency List vs. Matrix vs. CSR)
| Architectural Metric | Adjacency List (`List<Edge>[]`) | Adjacency Matrix (`bool[V,V]` / `int[V,V]`) | Compressed Sparse Row (CSR) |
| :--- | :--- | :--- | :--- |
| **Space Complexity** | $\mathbf{\Theta(V + E)}$ (optimal for sparse graphs) | $\Theta(V^2)$ (optimal only for dense graphs $|E| \approx V^2$) | $\mathbf{\Theta(V + E)}$ (minimal memory, zero object overhead) |
| **Edge Lookup `(u, v)`** | $\Theta(\text{deg}(u))$ (linear search in $u$\'s adjacency list) | $\mathbf{\Theta(1)}$ direct 2D array index lookup | $\Theta(\log(\text{deg}(u)))$ binary search within offset slice |
| **Iterate Out-Neighbors of $u$** | $\mathbf{\Theta(\text{deg}(u))}$ | $\Theta(V)$ (must scan entire row $u$, even if empty) | $\mathbf{\Theta(\text{deg}(u))}$ |
| **Add Edge `(u, v)`** | $\Theta(1)$ append | $\Theta(1)$ assignment | $\Theta(E)$ (immutable; requires full buffer rebuild) |
| **Add Vertex $u$** | Amortized $\Theta(1)$ | $\Theta(V)$ reallocation and 2D matrix copy | $\Theta(V + E)$ rebuild |
| **CPU Cache Locality** | **Poor:** Pointers chasing across scattered linked lists or dynamic list buffers | **Moderate:** Row-major access provides spatial locality across row scans | **Optimal:** Neighbors stored in single contiguous flat 1D array |
| **Best Suited For** | Dynamic sparse graphs, standard BFS/DFS algorithms, general interview coding | Dense graphs, all-pairs shortest paths (Floyd-Warshall), sub-graph isomorphism | Static large-scale web graphs, PageRank, GPU graph processing |

- **Graph Representations, Cache Behavior & From-Scratch Graph Structures**: Adjacency list O(V+E) space (best for sparse graphs), adjacency matrix O(V²) space (best for dense graphs or O(1) edge lookup), Compressed Sparse Row (CSR) for cache-conscious traversal; implementing `AdjacencyListGraph<T>` and `AdjacencyMatrixGraph<T>` from scratch supporting directed, undirected, and weighted edges
- **DFS Mechanics & Timestamps**: Discovery time `disc[v]` and finish time `fin[v]`, DFS tree vs back/forward/cross edges in directed graphs, iterative DFS using explicit stack to avoid call-stack overflow on deep graphs
- **BFS Shortest Path Proof**: BFS processes vertices in non-decreasing distance order; when vertex v is first dequeued at distance d, no shorter path exists (proof by contradiction via induction on distance layers)
- **Cycle Detection Algorithms**: Directed graph: 3-color DFS (White=unvisited, Gray=in-current-path, Black=done); reaching a Gray node = back edge = cycle. Undirected: parent-tracking BFS/DFS to avoid treating tree edges as cycles
- **Topological Sorting Deep Dive**: Kahn's algorithm: iteratively remove in-degree-0 nodes, detect cycle if processed < V nodes; DFS reverse post-order: finish-time reversal gives valid topological order (u→v means u finishes after v)
- **Bipartite Detection & Applications**: 2-color BFS/DFS alternating colors, odd-length cycle ↔ not bipartite equivalence; bipartite graph as prerequisite for maximum bipartite matching
- **Graph Coloring & Chromatic Number**: Greedy coloring assigns minimum colors greedily (not optimal in general); chromatic number χ(G) is NP-hard to compute exactly; special cases: bipartite graphs χ = 2 (2-colorable), planar graphs χ ≤ 4 (Four Color Theorem), interval graphs χ = maximum clique size; applications in register allocation (CPU compiler), scheduling, map coloring
- **Euler Tour on Trees (DFS In/Out Timestamps)**: Assign `in[v]` (enter time) and `out[v]` (exit time) via DFS; subtree of v = contiguous range `[in[v], out[v]]` in the DFS order array; enables O(log N) subtree sum queries via Segment Tree / Fenwick Tree; cross-reference Heavy-Light Decomposition in Week 55-56
- **Graph Planarity & Kuratowski's Theorem**: A graph is planar iff it contains no subdivision of K₅ or K₃,₃; Euler's formula for planar graphs: V - E + F = 2 (vertices, edges, faces); consequence: planar graphs have E ≤ 3V - 6 (sparse); practical implication: planar graph BFS/DFS is O(V) not O(V+E) since E = O(V); know for system design discussions (road networks, PCB routing are planar-like)

### ⚙️ Core Operations & Internal Logic Deep-Dive: Graph Traversals & Cycle Detection State Machines

#### 1. 3-Color DFS Cycle Detection State Machine
- **Dimension 1 (Contract & Complexity):** Detect directed cycle in graph $G=(V,E)$ in $\Theta(V + E)$ time; $\Theta(V)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Initialize color array `color[u] = 0` (White = unvisited) for all $u \in V$.
  2. For each vertex $u \in V$: if `color[u] == 0`, invoke `DfsVisit(u)`.
  3. `DfsVisit(u)`:
     - Mark `color[u] = 1` (Gray = currently on active recursion call stack).
     - For each neighbor $v \in \text{Adj}[u]$:
       - If `color[v] == 1`: **Back Edge Encountered!** A path exists from $v \rightsquigarrow u$ and edge $u \to v$ closes a directed cycle. Return `true`.
       - If `color[v] == 0`: If `DfsVisit(v)` returns true, propagate `true`.
       - If `color[v] == 2` (Black = fully explored & backtracked): Cross/Forward edge, ignore.
     - Mark `color[u] = 2` (Black = pop from active call stack).
     - Return `false`.
- **Dimension 3 (Visual State Transition):**
  ```
  Edge: 1 -> 2 -> 3 -> 1 (Cycle)
  Step 1: Dfs(1) -> color[1] = GRAY (Stack: [1])
  Step 2: Dfs(2) -> color[2] = GRAY (Stack: [1, 2])
  Step 3: Dfs(3) -> color[3] = GRAY (Stack: [1, 2, 3])
  Step 4: Inspect neighbor of 3 (Node 1). color[1] is GRAY!
          Encountered node currently on the active ancestor stack!
          --> BACK EDGE CONFIRMED! Cycle: 1 -> 2 -> 3 -> 1.
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *White Path Theorem:* In a DFS forest, vertex $v$ is a descendant of $u$ iff at time `disc[u]`, there is a path from $u$ to $v$ consisting entirely of white vertices. A cycle exists iff DFS discovers a back edge pointing to an ancestor whose `fin[v]` has not yet occurred (still Gray).
- **Dimension 5 (Edge Case Matrix):**
  - Self-loops ($u \to u$): Node inspects self while Gray, immediately detects cycle.
  - Disconnected graph: Outer loop over all $V$ guarantees disconnected cyclic components are discovered.

#### 2. Kahn's Algorithm (BFS In-Degree Zero Wavefront)
- **Dimension 1 (Contract & Complexity):** Compute valid topological sort order or declare cycle. Strict $\Theta(V + E)$ time; $\Theta(V)$ space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Compute `inDegree[u]` for all $u \in V$.
  2. Enqueue all $u$ where `inDegree[u] == 0` into queue $Q$.
  3. While $Q$ not empty:
     - Dequeue $u$; append to `topologicalOrder`.
     - For each neighbor $v \in \text{Adj}[u]$:
       - Decrement `inDegree[v]--;`
       - If `inDegree[v] == 0`: `Q.Enqueue(v);`
  4. Cycle verification: If `topologicalOrder.Count < V`, graph contains at least one directed cycle (nodes with unresolved prerequisites never reached in-degree 0).
- **Dimension 3 (Visual State Transition):**
  ```
  Graph: A -> B, A -> C, B -> D, C -> D
  inDegree: {A:0, B:1, C:1, D:2}
  Queue: [A]
  Pop A: Order=[A]. Decrement B to 0, C to 0. Queue=[B, C]
  Pop B: Order=[A, B]. Decrement D to 1. Queue=[C]
  Pop C: Order=[A, B, C]. Decrement D to 0 -> Enqueue D! Queue=[D]
  Pop D: Order=[A, B, C, D]. Queue empty. All 4 nodes resolved!
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *DAG Prerequisite Independence:* A node can be processed safely if and only if all incoming dependency edges have already been resolved (in-degree becomes 0).
- **Dimension 5 (Edge Case Matrix):**
  - Fully cyclic graph ($A \to B \to A$): Initial queue is empty (`topologicalOrder.Count == 0`).

## WEEK 24-26: ADVANCED GRAPH ALGORITHMS
**Shortest Paths & Optimization**
- **Dijkstra's Algorithm Correctness & Implementation**: Greedy choice: always process the unvisited node with smallest known distance; correctness proof (by contradiction: first incorrectly-finalized node must have a shorter path through an unvisited node, but all edges ≥ 0 prevents this); lazy deletion implementation O((V+E) log V) with `PriorityQueue` in C#
- **Negative Weights & Bellman-Ford**: Why negative edges break Dijkstra (a later-discovered path through a negative edge can undercut a previously finalized node), Bellman-Ford relaxes all E edges V-1 times O(VE), detects negative cycles if relaxation still possible on V-th pass; SPFA queue optimization
- **All-Pairs Shortest Paths (Floyd-Warshall)**: DP state `dp[k][i][j]` = shortest path i→j using only vertices {1..k} as intermediates; WHY k-loop must be outermost (ensures sub-problems resolved before use); negative cycle detection via `dp[i][i] < 0`
- **Minimum Spanning Tree (MST)**: Cut property proof (minimum weight edge crossing any cut is in some MST), Kruskal O(E log E) via sort + DSU cycle detection, Prim O((V+E) log V) via min-heap growing the tree; Kruskal preferred for sparse graphs, Prim for dense
- **Disjoint Set Union (DSU) & From-Scratch Implementation**: Path compression flattens tree (future finds faster), union by rank/size prevents height growth; combined amortized complexity O(α(N)) per operation where α is the Inverse Ackermann function (≤ 4 for any practical N); implementing `DisjointSetUnion` (Union-Find) from scratch with path compression, union by rank, and connected component counting
- **Graph Decomposition Basics**: Tarjan's bridge detection using `disc[u]` and `low[u]` arrays; bridge condition: `low[v] > disc[u]` means v's subtree cannot reach u or earlier via back edges; articulation point condition: `low[v] ≥ disc[u]` for non-root u
- **A\* Search Algorithm**: Informed BFS with heuristic `f(n) = g(n) + h(n)` where g(n) = cost from start, h(n) = admissible heuristic (never overestimates actual cost); admissibility guarantees optimality; consistency (monotone) heuristic: `h(n) ≤ cost(n, n') + h(n')` ensures each node expanded only once; common heuristics: Manhattan distance (grid, no diagonals), Euclidean distance (geometric), Chebyshev distance (grid with diagonals); degenerates to Dijkstra when h=0, to BFS when all edge costs equal; used in GPS pathfinding, game AI, robot motion planning
- **Bidirectional BFS & Bidirectional Dijkstra**: Simultaneously expand frontiers from both source and target; meet-in-the-middle reduces O(b^d) to O(b^(d/2)) in BFS; bidirectional Dijkstra stopping criterion: stop when a node is settled from both directions (not just when frontiers meet); important subtlety: the meeting node may not be on the shortest path — must check path through the meeting edge
- **Johnson's Algorithm Cross-Reference**: For all-pairs shortest paths on sparse graphs with negative weights; see Week 57-58 for full coverage; at this stage, understand WHY Bellman-Ford is used for reweighting (to make all edges non-negative) before running Dijkstra V times

### ⚙️ Core Operations & Internal Logic Deep-Dive: Shortest Path Relaxations & Disjoint Sets

#### 1. Disjoint Set Union (DSU) Path Compression & Union by Rank
- **Dimension 1 (Contract & Complexity):** Maintain disjoint partitions of elements. Amortized $\Theta(\alpha(N))$ time per operation (where $\alpha(N) \le 4$ for all practical universe sizes); $\Theta(N)$ space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. **`Find(x)` with Path Compression:**
     - If `parent[x] == x`, return `x`.
     - Else: Assign `parent[x] = Find(parent[x]); return parent[x];` (recursive 2-pass points every inspected node directly to the set representative).
  2. **`Union(x, y)` by Rank:**
     - `rootX = Find(x); rootY = Find(y);`
     - If `rootX == rootY`, return `false` (cycle detected / already connected).
     - If `rank[rootX] < rank[rootY]`: `parent[rootX] = rootY;`
     - Else if `rank[rootX] > rank[rootY]`: `parent[rootY] = rootX;`
     - Else: `parent[rootY] = rootX; rank[rootX]++;`
     - Return `true;`
- **Dimension 3 (Visual State Transition):**
  ```
  Find(4) with Path Compression on chain 4 -> 3 -> 2 -> 1 (Root):
  [BEFORE FIND]
  [ 4 ] ──> [ 3 ] ──> [ 2 ] ──> [ 1 (Root) ]

  Step 1: Recurse up to root 1.
  Step 2: Unwind call stack, re-wiring parent pointers:
          parent[2] = 1; parent[3] = 1; parent[4] = 1;

  [AFTER FIND]
  [ 4 ] ──────────────┐
  [ 3 ] ────────────> [ 1 (Root) ]  (Tree depth flattened from 4 to 1 in a single op!)
  [ 2 ] ──────────────┘
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Rank Height Upper Bound:* By induction, a tree of rank $r$ contains at least $2^r$ nodes. Therefore, rank $r \le \lfloor \log_2 N \rfloor$. Path compression further flattens intermediate nodes, reducing the amortized cost per operation to $O(\alpha(N))$ via Ackermann potential analysis.
- **Dimension 5 (Edge Case Matrix):**
  - Redundant union: `Find(x) == Find(y)` returns `false` without rank mutation.

#### 2. Dijkstra's Greedy Frontier Edge Relaxation
- **Dimension 1 (Contract & Complexity):** Compute single-source shortest paths on non-negative weighted graphs. $O((V + E) \log V)$ time with binary min-heap; $\Theta(V)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Initialize `dist[v] = ∞` for all $v \in V$, `dist[src] = 0`.
  2. Min-Heap `pq.Enqueue(src, 0)`.
  3. While `pq` is not empty:
     - Dequeue `(u, d)`.
     - **Lazy Stale Check:** If `d > dist[u]`, continue (skip outdated heap entry).
     - For each outgoing weighted edge $(u, v, w)$:
       - **Edge Relaxation:** If `dist[u] + w < dist[v]`:
         - Update: `dist[v] = dist[u] + w;`
         - `pq.Enqueue(v, dist[v]);`
- **Dimension 3 (Visual State Transition):**
  ```
  Current: dist[u]=10. Edge: u -(4)-> v. Existing dist[v]=20.
  Test: dist[u] + w = 10 + 4 = 14 < 20 (Shorter path found!)
  Relax: dist[v] updated from 20 to 14.
  Enqueue (v, 14) into PriorityQueue.
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Non-Negative Weight Invariant:* Because all edge weights $w \ge 0$, when a node $u$ is dequeued with minimum tentative distance $d$, no future relaxation path through unvisited nodes can produce a distance smaller than $d$. Thus, $d$ is provably optimal.
- **Dimension 5 (Edge Case Matrix):**
  - Disconnected nodes: Tentative distances remain $\infty$.
  - Negative edge present: Violates non-negativity invariant; Dijkstra can produce incorrect distances. Use Bellman-Ford instead.

## WEEK 27-30: RECURSION & BACKTRACKING MASTERY
**Systematic Search & Exploration**
- **Call Stack Activation Frames**: Stack segment vs heap segment in process memory, each frame stores local variables + return address + parameters, default CLR stack = 1MB (~10k frames), tail-call optimization: C# CLR does NOT guarantee it — convert deep recursion to explicit heap stack to avoid `StackOverflowException`
- **Recursion Shape Analysis**: Linear recursion T(n) = T(n-1) + O(1) → O(N) calls; binary recursion T(n) = 2T(n/2) + O(N) → O(N log N) work (merge sort); exponential T(n) = k·T(n-1) → O(k^N) calls (power set); Master Theorem for recurrence analysis
- **Backtracking State Machine**: Choose → Explore → Unchoose canonical template; state restoration invariant (undo must be exact inverse of do); pruning by constraint propagation BEFORE recursing; duplicate avoidance via sort-and-skip (`if (i > start && nums[i] == nums[i-1]) continue`)
- **Combinatorial Generation**: Permutations (swap-based vs insertion-based), combinations with start index to avoid revisiting, power set by inclusion/exclusion per element, time complexity = O(k^N × N) for generation + output
- **Constraint Satisfaction Problems (CSP)**: N-Queens: O(1) conflict check using column + diagonal `(row-col)` + anti-diagonal `(row+col)` boolean arrays; Sudoku: constraint propagation (eliminate candidates) + backtracking
- **Game Theory & Minimax**: Zero-sum two-player game tree recursion, MAX layer vs MIN layer alternation, alpha-beta pruning eliminates branches where better alternative already found (reduces O(b^d) to O(b^(d/2)) best case), Sprague-Grundy theorem: every impartial game position has a nim-value (Grundy number = mex of reachable positions), XOR of independent sub-game Grundy numbers determines winner
- **Branch and Bound**: Systematic enumeration with bounds — maintain `bestSolution` global; at each node, compute a lower bound (relaxed subproblem); if lower bound ≥ bestSolution, prune entire subtree; unlike backtracking (feasibility pruning), B&B prunes by quality bounding; used in TSP, Integer Linear Programming, and 0/1 Knapsack exact solvers; difference from DP: B&B explores tree space, DP fills table of overlapping subproblems
- **Dancing Links (DLX) for Exact Cover**: Knuth's Algorithm X with doubly-linked matrix of 1s (column and row circular doubly-linked lists); `Cover(c)` removes column c and all rows containing a 1 in column c; backtrack by `Uncover(c)` in reverse order; solves Exact Cover in O(1) per link/unlink operation vs O(N) matrix deletion; applications: Sudoku solving, pentomino tiling, N-Queens; implementing `DancingLinks` from scratch
- **Iterative Deepening DFS (IDDFS) & IDA\***: Depth-limited DFS with increasing depth limits 1,2,3,...; achieves BFS space complexity O(d) while avoiding BFS's O(b^d) memory; IDA* = IDDFS with heuristic cost bound instead of depth; optimal for pathfinding with tight memory constraints; used in chess engines and robotic planning

### ⚙️ Core Operations & Internal Logic Deep-Dive: Backtracking State Restoration & Search Space Exploration

#### 1. Choose -> Explore -> Unchoose State Machine
- **Dimension 1 (Contract & Complexity):** Exhaustively traverse combinatorial solution spaces with $O(H)$ auxiliary space where $H$ is decision tree depth.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Base case test: If current state meets completion criteria, clone and record solution (`results.Add(new List<T>(path))`).
  2. Iterate candidate choices for current step:
     - **Constraint Pruning Guard:** If candidate violates feasibility, `continue`.
     - **Choose:** Mutate global accumulator state with candidate (e.g. `path.Add(choice)`, `visited.Add(choice)`).
     - **Explore:** Recurse down decision branch (`Dfs(depth + 1)`).
     - **Unchoose (State Restoration):** Reverse mutation exactly (`path.RemoveAt(path.Count - 1)`, `visited.Remove(choice)`).
- **Dimension 3 (Visual State Transition):**
  ```
  Permutations of [1, 2]:
  Path: []
  ├── Choose 1 -> Path: [1]
  │   └── Choose 2 -> Path: [1, 2] (Base Case -> Record [1, 2])
  │       └── Unchoose 2 -> Path: [1]
  │   └── Unchoose 1 -> Path: []  <-- State strictly restored to root!
  ├── Choose 2 -> Path: [2]
  │   └── Choose 1 -> Path: [2, 1] (Base Case -> Record [2, 1])
  │       └── Unchoose 1 -> Path: [2]
  │   └── Unchoose 2 -> Path: []
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *State Restoration Invariant:* For every invocation of `Dfs()`, the global state upon return must be bitwise identical to the state prior to the call. This eliminates the need to allocate $O(N)$ deep copies at each node of the decision tree.
- **Dimension 5 (Edge Case Matrix):**
  - Duplicates in input array: Sort array first; skip duplicate siblings via `if (i > start && nums[i] == nums[i-1]) continue;`.

## WEEK 31-36: DYNAMIC PROGRAMMING MASTERY
**Optimization & Memoization Excellence**
- **Theoretical Foundations**: Optimal substructure: optimal solution built from optimal sub-solutions (prove via cut-and-paste argument), overlapping subproblems: same sub-states computed multiple times in brute-force recursion, Bellman's Principle of Optimality, DP as "intelligent brute-force with memory"
- **Memoization vs Tabulation**: Top-down memoization: natural recursion + cache, only computes needed states, function-call overhead; bottom-up tabulation: iterative, no call overhead, better cache locality, forces correct dependency order
- **1D DP State Transitions**: Fibonacci/Climbing Stairs (F(n) = F(n-1) + F(n-2)), House Robber skip-state (dp[i] = max(dp[i-2]+nums[i], dp[i-1])), Longest Increasing Subsequence: O(N²) DP vs O(N log N) patience sorting (maintain `tails[]` array via binary search insertion)
- **2D Sequence & Grid DP**: LCS recurrence derivation (match → diagonal+1, mismatch → max of up/left), Edit Distance three-operation mapping (replace→diagonal, delete-from-s1→up, insert-into-s1→left), rolling array space optimization from O(MN) → O(min(M,N))
- **The Knapsack Family**: 0/1 Knapsack: traverse capacity HIGH→LOW to prevent reusing same item (when computing dp[w], dp[w-weight[i]] still reflects "before item i" era); Unbounded Knapsack: traverse LOW→HIGH to allow reuse; WHY direction matters is the most common misconception
- **Interval DP**: State `dp[i][j]` = optimal for range [i..j], enumerate split point k, MUST iterate by interval length (not left endpoint) for correct bottom-up dependency order; Burst Balloons: reverse-think "last balloon popped in range" for independent subproblems
- **Advanced State Representations**: Tree DP postorder aggregation, Bitmask DP intro for N≤20 subset states (`dp[mask][i]`), space optimization techniques (1D rolling, 2D to 1D via alternating rows)
- **Counting DP**: Distinct from optimization DP — count number of ways, number of valid configurations, or number of paths; modular arithmetic required when counts are large; examples: number of BSTs with N keys (Catalan numbers `C_N = Σ C_i · C_{N-1-i}`), number of valid parenthesizations (Matrix Chain), number of distinct subsequences; common mistake: confusing counting with optimization state transitions
- **DP on Broken Profile / Contour-Line DP Cross-Reference**: Processing grid cells left-to-right, top-to-bottom; state = bitmask of the "frontier" between processed and unprocessed cells; O(2^M · N · M) for M×N grid; domino/tromino tiling canonical application; full deep-dive in → *Week 59-60: Advanced DP Optimizations*
- **String DP**: Edit distance (Levenshtein), longest palindromic subsequence (`dp[i][j] = dp[i+1][j-1] + 2` if match, else `max(dp[i+1][j], dp[i][j-1])`), distinct ways to decode string (digit DP on strings); palindromic subsequence vs palindromic substring (contiguous vs not); all achieve O(N²) time, O(N) space with rolling array
- **Probability & Expected Value DP**: `E[state]` = probability-weighted sum of outcomes; examples: expected dice rolls to reach a target, expected number of trials to collect all coupons (coupon collector problem `E = N·H_N`); when probabilities form a DAG, standard DP ordering works; when cyclic, solve system of linear equations (Gaussian elimination)
- **DP Optimization Checklist**: Before coding DP, verify: (1) optimal substructure exists, (2) subproblems overlap (else use D&C), (3) identify state dimensions and transitions, (4) determine iteration order (top-down vs bottom-up, left-to-right vs interval length), (5) check if space can be compressed (rolling array, 1D reduction)

### ⚙️ Core Operations & Internal Logic Deep-Dive: DP State Transitions & Space Optimization

#### 1. 0/1 Knapsack Backward Sweep vs. Unbounded Forward Sweep
- **Dimension 1 (Contract & Complexity):** Compute maximum value achievable with weight capacity $W$. Time $O(N \cdot W)$; optimized auxiliary space $\Theta(W)$.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. **0/1 Knapsack (Single Use per Item):**
     - Iterate items $i = 0 \dots N-1$:
       - **Loop BACKWARD:** `for (int w = W; w >= weight[i]; w--)`
       - Transition: `dp[w] = Math.Max(dp[w], dp[w - weight[i]] + value[i]);`
       - *Why Backward?* `dp[w - weight[i]]` has NOT been updated in the current outer loop pass yet; it represents the state from the previous item $i-1$, strictly preventing item reuse.
  2. **Unbounded Knapsack (Infinite Use per Item):**
     - Iterate items $i = 0 \dots N-1$:
       - **Loop FORWARD:** `for (int w = weight[i]; w <= W; w++)`
       - Transition: `dp[w] = Math.Max(dp[w], dp[w - weight[i]] + value[i]);`
       - *Why Forward?* `dp[w - weight[i]]` already reflects choices from the current item $i$, allowing the item to be picked repeatedly.
- **Dimension 3 (Visual State Transition - 0/1 Backward):**
  ```
  Item: wt=2, val=10. Cap W=4. dp before item: [0, 0, 0, 0, 0]
  Backward sweep:
  w=4: dp[4] = max(dp[4], dp[4-2] + 10) = max(0, dp[2] + 10) = 10
  w=3: dp[3] = max(dp[3], dp[3-2] + 10) = max(0, dp[1] + 10) = 10
  w=2: dp[2] = max(dp[2], dp[2-2] + 10) = max(0, dp[0] + 10) = 10
  dp after item: [0, 0, 10, 10, 10]
  (If we looped forward, dp[2] would become 10, and then dp[4] would read dp[2]+10=20,
   erroneously using the item TWICE!)
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Temporal Layering Invariant:* When computing `dp[w]` in backward iteration, any index $j < w$ holds the solution to subproblems containing at most $i-1$ items, preserving the 2D recurrence contract `dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt] + val)`.
- **Dimension 5 (Edge Case Matrix):**
  - Item weight > capacity: Guard `w >= weight[i]` prevents negative array indexing.
## WEEK 37-39: DIVIDE & CONQUER MASTERY
**Problem Decomposition Excellence**
- **Master Theorem & Recursion Trees**: T(n) = aT(n/b) + f(n); three cases based on comparing f(n) with n^(log_b(a)): dominated by recursion (Case 1), balanced (Case 2, add log factor), dominated by combine (Case 3); recursion tree visualization as sum of levels
- **Classic Sorting Correctness**: Quicksort random pivot → expected O(N log N) via probability analysis (each element's expected comparisons = O(log N)), Lomuto vs Hoare partition correctness, worst-case O(N²) avoided by randomization; Mergesort stable O(N log N) with O(N) auxiliary space
- **Mathematical D&C Applications**: Fast exponentiation: `x^n = (x^(n/2))^2` if n even, `x · x^(n-1)` if odd → O(log N); Strassen matrix multiplication: 7 submatrix multiplications vs 8 → O(N^2.807)
- **Computational Geometry & Orientation**: 2D cross product orientation test `(B-A) × (C-A)` (positive = CCW / left turn, negative = CW / right turn, zero = collinear) without floating-point error; Point-in-Polygon ray-casting (even-odd crossing rule) and winding number
- **Convex Hull & Geometric Sweeps**: Graham Scan (O(N log N) angular sort + stack) and Andrew's Monotone Chain (sort by x, build lower/upper hulls); 2D closest pair of points O(N log N) with ≤7 points strip check; Rotating Calipers for polygon diameter and antipodal pairs in O(N)
- **D&C vs DP vs Greedy Decision Framework**: D&C when subproblems are independent; DP when subproblems overlap; Greedy when local optimal = global optimal (provable via exchange argument)
- **Randomized Algorithms Foundations**: Las Vegas algorithms (always correct, random runtime — QuickSort, QuickSelect); Monte Carlo algorithms (random correctness, deterministic runtime — Miller-Rabin, randomized min-cut); expected value analysis via indicator random variables; cross-reference with Week 61-62 for probabilistic data structures
- **Cache-Oblivious Algorithms Intro**: Design algorithms optimal at all cache levels without knowing cache parameters; key insight: recursive divide-and-conquer naturally accesses memory in blocks matching any cache size; cache-oblivious matrix multiplication (block-recursive), funnel sort; full coverage in → *Week 47-48: Sorting* and *Week 63-64: Systems*

### ⚙️ Core Operations & Internal Logic Deep-Dive: Divide & Conquer Partitioning & Geometry

#### 1. Hoare vs. Lomuto In-Place Partitioning Mechanics
- **Dimension 1 (Contract & Complexity):** Partition array around pivot so elements $\le \text{pivot}$ precede elements $\ge \text{pivot}$. Strict $\Theta(N)$ time; $\Theta(1)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. **Hoare Partition:**
     - Set `pivot = A[lo]`, `i = lo - 1`, `j = hi + 1`.
     - Advance `i++` while `A[i] < pivot`.
     - Decrement `j--` while `A[j] > pivot`.
     - If `i >= j`, return split index `j`.
     - Else `Swap(A, i, j)` and repeat.
     - *Advantage:* Makes ~3× fewer swaps on average than Lomuto and handles duplicates cleanly without quadratic degradation.
- **Dimension 3 (Visual State Transition):**
  ```
  Array: [5, 3, 8, 4, 2, 7, 1, 9], Pivot = 5
  i sweeps right looking for element >= 5 (stops at 5, idx 0)
  j sweeps left looking for element <= 5 (stops at 1, idx 6)
  Swap(0, 6): [1, 3, 8, 4, 2, 7, 5, 9]
  Next iteration: i stops at 8 (idx 2), j stops at 2 (idx 4)
  Swap(2, 4): [1, 3, 2, 4, 8, 7, 5, 9]
  Next iteration: i stops at 8 (idx 4), j stops at 4 (idx 3) -> i >= j -> Split at j=3!
  Subarrays: [1, 3, 2, 4] <= 5 and [8, 7, 5, 9] >= 5.
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Partition Invariant:* At all times, all elements in $A[\text{lo} \dots i-1] \le \text{pivot}$ and all elements in $A[j+1 \dots \text{hi}] \ge \text{pivot}$. When $i \ge j$, the array is partitioned into two valid non-empty halves.
- **Dimension 5 (Edge Case Matrix):**
  - All elements equal: Hoare splits exactly in the middle ($N/2$), preserving $O(N \log N)$ recursion; Lomuto degenerates to $O(N^2)$.

## WEEK 40-42: GREEDY ALGORITHMS & OPTIMIZATION
**Local Choice Global Optimum**
- **Greedy Choice Property & Correctness Proofs**: Exchange argument: show any optimal solution can be transformed into the greedy solution step-by-step without worsening the objective; "greedy stays ahead" proof: show greedy solution is always at least as good as any other at each step
- **Interval Scheduling & Partitioning**: Activity selection by earliest finish time greedy (formally proven optimal via exchange argument), interval graph coloring: minimum colors = maximum overlap at any point (scan events with sorted endpoints)
- **Huffman Coding & Optimal Prefix Trees**: Prefix-free codes via binary trie, always merge two lowest-frequency nodes (priority queue), formal optimality proof via exchange argument on leaf depths × frequencies; Shannon entropy as lower bound
- **Greedy Failure Mode Detection**: Coin change with arbitrary denominations (greedy fails — needs DP), 0/1 Knapsack (greedy by density fails — needs DP), Shortest path with negative edges (greedy Dijkstra fails — needs Bellman-Ford)
- **Proof Techniques**: Structural induction on greedy choices, contradiction proofs showing optimal solution must match greedy structure
- **Matroid Theory & Greedy Optimality**: A matroid is an independence system where the greedy algorithm is provably optimal; graphic matroid: independent sets = acyclic edge subsets (forests); uniform matroid: all sets of size ≤ k; key theorem: greedy algorithm finds maximum-weight basis of any matroid; Kruskal's MST is greedy on the graphic matroid — this is WHY it works; understanding matroids distinguishes problems where greedy is optimal from those where it isn't
- **Scheduling Theory**: Single-machine scheduling: minimize total weighted completion time (sort by w_i/p_i ratio — Smith's rule, provably optimal); minimize number of late jobs (earliest deadline first — provably optimal); interval scheduling maximization (earliest finish time — provably optimal); all three are matroid/exchange-argument proofs; connection to OS thread scheduling (CFS, EDF, weighted fair queuing)
- **Online Algorithms & Competitive Ratio**: Algorithm that processes input sequentially without future knowledge; competitive ratio = worst-case (online cost) / (offline optimal cost); Ski Rental Problem: rent (cost 1) vs buy (cost B) — deterministic optimal break-even at B rentals, CR=2; randomized rent-then-buy CR = e/(e-1) ≈ 1.58; Paging / Cache Eviction: LRU is k-competitive (k = cache size), optimal offline = Bélády's algorithm (evict furthest future use); used in CDN caching policy decisions

### ⚙️ Core Operations & Internal Logic Deep-Dive: Greedy Choice Exchange Arguments & Matroids

#### 1. Interval Scheduling Earliest-Finish-Time Exchange Argument
- **Dimension 1 (Contract & Complexity):** Select maximum number of mutually compatible intervals. $O(N \log N)$ time (dominated by sorting); $O(1)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Sort intervals ascending by finish time $f_i$: `intervals.Sort((a,b) => a.End.CompareTo(b.End));`.
  2. Maintain `count = 0`, `lastEnd = -∞`.
  3. For each interval $(s_i, f_i)$:
     - If $s_i \ge lastEnd$: Greedily accept interval. Update `lastEnd = f_i; count++;`.
     - Else: Overlaps with selected set; reject.
- **Dimension 3 (Exchange Argument Proof Mechanics):**
  ```
  Let G = {g_1, g_2, ..., g_k} be the greedy schedule.
  Let O = {o_1, o_2, ..., o_m} be an optimal schedule.
  Since g_1 has the earliest finish time among ALL intervals: f(g_1) <= f(o_1).
  Replace o_1 with g_1 in O to form O':
  Because f(g_1) <= f(o_1) <= s(o_2), g_1 cannot conflict with o_2!
  Therefore, O' is valid and |O'| = |O|.
  By induction, we can transform O into G step-by-step without ever reducing cardinality.
  Hence, |G| = |O|, proving greedy is globally optimal!
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Greedy Stays Ahead Invariant:* For every step $k \le \min(|G|, |O|)$, $f(g_k) \le f(o_k)$. Greedy always leaves maximal remaining timeline for subsequent intervals.
- **Dimension 5 (Edge Case Matrix):**
  - Identical start/end times: Sorting by finish time handles degenerate intervals without special branches.

## WEEK 43-44: BIT MANIPULATION MASTERY
**Low-Level Optimization Techniques**
- **Binary Arithmetic & Two's Complement**: Signed integers use two's complement (`-x = ~x + 1`), arithmetic right shift fills with sign bit, logical right shift fills with 0; overflow behavior in checked vs unchecked C# contexts
- **Fundamental Bit Tricks**: Isolate lowest set bit: `x & (-x)` (proof: -x = ~x+1 sets bits below lowest-set-bit of x to 0); clear lowest set bit: `x & (x-1)` (Brian Kernighan's bit-count algorithm runs in O(popcount) iterations); power-of-two check: `x > 0 && (x & (x-1)) == 0`
- **XOR Properties & Applications**: XOR is commutative + associative + self-inverse (`x^x=0`, `x^0=x`); Single Number I (XOR all elements), Single Number II (3-state bit counter using two bit-vectors tracking mod-3 counts), find two unique numbers (XOR then partition by any differing bit)
- **Bitmask Subset Enumeration**: Integer as compact set of up to 64 elements, submask iteration: `for (int sub = mask; sub > 0; sub = (sub-1) & mask)` visits all non-empty subsets; total iterations across all masks = 3^N (each element either in mask but not sub, in sub, or in neither)
- **Bit DP State Representation**: `dp[mask]` where bit i set = element i is "used", transition by OR-ing in new element's bit, subset enumeration in O(2^N) for TSP-class problems with N≤20; Bitset vectorization (packing 64 booleans into `ulong` for 64× speedup in reachability and subset queries)
- **Gray Code & Hamiltonian Paths on Hypercubes**: N-bit Gray code: adjacent codewords differ by exactly 1 bit (`gray(i) = i ^ (i >> 1)`); inverse: `bin(g) = g ^ (g >> 1) ^ (g >> 2) ^ ...`; applications: rotary encoders (minimize error on transition), subset enumeration without recomputing full hash (only update the changed element), Hamiltonian path on N-dimensional hypercube graph; LeetCode "Gray Code" generation via reflection construction
- **Bitset Operations in C# (`BitArray` & `ulong` Arrays)**: `BitArray` class: O(N/64) for AND, OR, XOR, NOT operations; when to use vs `HashSet<int>` (Bitset wins when universe size is bounded and small, e.g. ≤ 10^6); implementing manual 64-bit `Bitset` using `ulong[]` for competitive-grade speed; `popcount` via `BitOperations.PopCount(ulong)` (.NET 5+); `trailingZeroCount` via `BitOperations.TrailingZeroCount`
- **SIMD & Vectorization Awareness**: .NET `Vector<T>` and `Vector128/256/512<T>` in `System.Runtime.Intrinsics`; auto-vectorization by JIT for simple loops on contiguous arrays; why `float[]` loops can be 4–8× faster than `double[]` when SIMD width is the bottleneck; writing branchless SIMD-friendly code (no data-dependent branches inside hot loops)

### ⚙️ Core Operations & Internal Logic Deep-Dive: Bitwise Arithmetic & Subset Masks

#### 1. Submask Iteration Logic (`sub = (sub - 1) & mask`)
- **Dimension 1 (Contract & Complexity):** Enumerate all $2^k$ submasks of a bitmask with $k$ set bits. Amortized $\Theta(1)$ per submask; $\Theta(3^N)$ total across all masks of length $N$.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Initialize `sub = mask;`.
  2. While `sub > 0`:
     - Process submask `sub`.
     - Transition: `sub = (sub - 1) & mask;`
       - Subtracting 1 flips the lowest set bit to 0 and all lower bits to 1.
       - Bitwise AND `& mask` zeroes out all bits that were not in the parent mask, strictly confining the state to valid submasks.
- **Dimension 3 (Visual State Transition):**
  ```
  Mask = 1010_2 (10). Submask transitions:
  Start: sub = 1010_2 (10)
  sub-1 = 1001_2. (1001 & 1010) = 1000_2 (8)
  sub-1 = 0111_2. (0111 & 1010) = 0010_2 (2)
  sub-1 = 0001_2. (0001 & 1010) = 0000_2 (0) -> Terminate.
  Encountered non-empty submasks: {10, 8, 2} in strict descending order!
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Binomial Summation Bound:* Across all $2^N$ masks: $\sum_{k=0}^N \binom{N}{k} 2^k = (1 + 2)^N = 3^N$, vastly faster than naive $O(4^N)$ mask-pair checking.
- **Dimension 5 (Edge Case Matrix):**
  - Empty mask (`mask == 0`): Loop condition `sub > 0` prevents execution; 0 steps.

## WEEK 45-46: MATHEMATICAL ALGORITHMS
**Computational Mathematics**
- **Number Theory Foundations**: Euclidean algorithm for GCD: `gcd(a,b) = gcd(b, a mod b)` terminates in O(log(min(a,b))) steps (Fibonacci worst case), Extended Euclidean finds Bézout coefficients (ax + by = gcd(a,b)) for modular inverse
- **Prime Numbers, Sieves & Primality Testing**: Trial division O(√N), Sieve of Eratosthenes O(N log log N) (harmonic series of primes ∑ 1/p ≈ log log N), Linear Sieve O(N) marking each composite by its smallest prime factor; Miller-Rabin probabilistic primality test for large numbers
- **Modular Arithmetic & Fast Exponentiation**: Properties: (a+b)%m, (a·b)%m are safe; modular inverse via Fermat's Little Theorem (`a^(p-2) mod p` when p is prime, via fast exponentiation O(log p)); Chinese Remainder Theorem for simultaneous modular equations
- **Combinatorics with Modular Arithmetic**: Precompute factorial and inverse-factorial arrays mod prime p for O(1) nCr queries; Pascal's triangle for small values; Inclusion-Exclusion Principle formulas, derangements ($!n$), and Burnside's Lemma basics
- **Matrix Exponentiation**: Represent linear recurrences as matrix multiplication, use fast matrix exponentiation O(K³ log N) to compute N-th term of K-variable recurrence in O(K³ log N) instead of O(KN)
- **Euler's Totient Function φ(N)**: φ(N) = count of integers in [1,N] coprime to N; multiplicative function: φ(p^k) = p^k - p^(k-1); φ(N) = N · Π(1 - 1/p) for all prime factors p; Euler's theorem: `a^φ(N) ≡ 1 (mod N)` for gcd(a,N)=1 (generalization of Fermat's Little Theorem); applications: RSA cryptography, primitive roots, discrete logarithm
- **Möbius Function & Inclusion-Exclusion on Divisors**: Möbius function μ(N): 0 if N has squared prime factor, (-1)^k if N is product of k distinct primes, 1 if N=1; Möbius inversion formula: if `f(n) = Σ_{d|n} g(d)` then `g(n) = Σ_{d|n} μ(n/d) f(d)`; applications: counting squarefree numbers, GCD sum problems, inclusion-exclusion on divisor lattice
- **Fast Fourier Transform (FFT) & Number Theoretic Transform (NTT)**: FFT computes polynomial multiplication in O(N log N) via DFT: `A(ω^k) = Σ a_j · ω^(jk)` using butterfly network; Cooley-Tukey radix-2 algorithm; NTT = FFT over modular arithmetic (using primitive root of prime modulus, e.g. 998244353 = 119·2^23 + 1); applications: large integer multiplication, convolution (string matching, subset sum counting, polynomial hashing); implementing `NTT` from scratch for competitive programming
- **Linear Algebra for Algorithms**: Gaussian elimination O(N³) for solving systems of linear equations; application in probability DP with cycles, EV problems on graphs; rank and basis in XOR problems (linear basis of XOR space for maximum XOR subarray / subset); matrix rank over GF(2) for XOR basis problems

### ⚙️ Core Operations & Internal Logic Deep-Dive: Number Theoretic & Matrix Exponentiation Operations

#### 1. Extended Euclidean Algorithm & Modular Inverse
- **Dimension 1 (Contract & Complexity):** Find integers $(x, y)$ such that $a \cdot x + b \cdot y = \gcd(a, b)$. Strict $O(\log(\min(a, b)))$ time; $\Theta(\log(\min(a, b)))$ stack frames.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Base case: If `b == 0`, set $x = 1, y = 0$; return $a$.
  2. Recurse: `gcd = ExtGcd(b, a % b, out x1, out y1);`.
  3. Unwind state transition:
     - $x = y_1;$
     - $y = x_1 - (a / b) \cdot y_1;$
     - Return $gcd$.
  4. Modular Inverse: $a^{-1} \pmod m$ exists iff $\gcd(a, m) = 1$, given by $(x \pmod m + m) \pmod m$.
- **Dimension 3 (Visual State Transition):**
  ```
  Solve 35x + 15y = 5:
  Step 1: gcd(35, 15) -> 35 = 2*15 + 5
  Step 2: gcd(15, 5)  -> 15 = 3*5 + 0 (b=0 -> x=1, y=0)
  Unwind Step 2: 5 = 15*0 + 5*1  -> x1=0, y1=1
  Unwind Step 1: 5 = 35*1 + 15*(0 - 2*1) = 35*(1) + 15*(-2)
  Solution: x = 1, y = -2. Check: 35(1) + 15(-2) = 35 - 30 = 5. Correct!
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Bézout Identity Invariant:* At every stack level, $b \cdot x_1 + (a \pmod b) \cdot y_1 = \gcd$. Substituting $a \pmod b = a - \lfloor a/b \rfloor \cdot b$ yields $a \cdot y_1 + b \cdot (x_1 - \lfloor a/b \rfloor \cdot y_1) = \gcd$, preserving the identity.
- **Dimension 5 (Edge Case Matrix):**
  - Negative coefficients: Modulo normalization `(x % m + m) % m` ensures strictly non-negative inverse.

## WEEK 47-48: ADVANCED SORTING & SEARCHING
**Specialized Algorithms**
- **Comparison Sort Lower Bound**: Information-theoretic proof: any comparison-based sort must make Ω(N log N) comparisons (decision tree has N! leaves, height ≥ log₂(N!) = Ω(N log N) by Stirling's approximation)
- **Non-Comparison Sorts**: Counting Sort O(N+K) for integer keys [0,K]; Radix Sort O(d(N+b)) for d-digit base-b numbers — requires stable intermediate sort per digit (usually Counting Sort); Bucket Sort O(N) average when keys are uniformly distributed in [0,1)
- **Order Statistics & Selection**: Quickselect: partition around pivot, recurse only on relevant half — expected O(N) by random pivot analysis (each step expected to reduce problem size by half); Median of Medians: divide into groups of 5, median-of-medians pivot guarantees 30% elimination → T(N) = T(N/5) + T(7N/10) + O(N) → O(N) worst-case
- **Specialized Searching**: Exponential search for unbounded arrays (find bracket by doubling, then binary search in O(log i) for answer at position i), ternary search for unimodal functions (find maximum in O(log₃ N))
- **External & Cache-Aware Sorting**: External 2-way merge sort (read/sort M-sized chunks → sorted runs, K-way merge passes), minimizing disk I/O passes = ⌈log_k(N/M)⌉; B-tree page-aligned access patterns; cache-oblivious algorithms work well at all memory hierarchy levels without knowing cache parameters
- **Timsort Internals**: Production sort used in Python, Java, and partially in .NET; identifies natural runs (existing sorted/reverse-sorted sequences) and merges them using merge sort; minimum run length ~32-64 (tuned for cache); galloping mode: exponential search to find merge point when one run dominates; stable sort with O(N log N) worst and O(N) best case (already sorted); understanding Timsort explains why `Array.Sort` vs `List.Sort` differ in stability guarantees in C#
- **Parallel Sorting Algorithms**: Bitonic sort: network sort O(N log² N) comparisons, fully parallelizable (each comparison independent); parallel merge sort: O(N log N / P + log² N) work on P processors; Parallel LINQ (`PLINQ`) sort in C#: `.AsParallel().OrderBy()` partitions + merges using thread pool; when parallel sort beats sequential: N > 10^6 and multi-core available
- **Cache-Oblivious Sorting (Funnel Sort)**: Recursive k-way merge using a funnel data structure of buffers; optimal cache performance at ALL cache levels simultaneously without cache-size parameters; Van Emde Boas tree layout for BFS traversal: map tree nodes to positions that are cache-optimal at all levels

### ⚙️ Core Operations & Internal Logic Deep-Dive: Non-Comparison Sorts & Order Statistics

#### 1. Quickselect Expected $O(N)$ K-th Selection
- **Dimension 1 (Contract & Complexity):** Find the $k$-th smallest element in an unordered array. Expected $\Theta(N)$ time, worst-case $\Theta(N^2)$ (avoided via random pivot); $\Theta(1)$ auxiliary space.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. `lo = 0, hi = nums.Length - 1`.
  2. While `lo <= hi`:
     - Partition array around random pivot: `pIdx = Partition(nums, lo, hi);`.
     - If `pIdx == k`: Return `nums[pIdx]`.
     - Else if `pIdx < k`: Pivot is too small; search right half: `lo = pIdx + 1;`.
     - Else: Pivot is too large; search left half: `hi = pIdx - 1;`.
- **Dimension 3 (Visual State Transition):**
  ```
  Find k=2 (3rd smallest) in [7, 10, 4, 3, 20, 15]:
  Partition around pivot 7 -> [4, 3] [7] [10, 20, 15], pIdx = 2.
  Target k == 2! Immediately found in a single pass without sorting [10, 20, 15]!
  Total work: N comparisons, returns 7 in O(N).
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Geometric Decay of Subproblems:* Unlike Quicksort which recurses on BOTH halves ($T(N) = 2T(N/2) + O(N) = O(N \log N)$), Quickselect discards one half: $T(N) = T(N/2) + O(N) = N + N/2 + N/4 + \dots = 2N = O(N)$.
- **Dimension 5 (Edge Case Matrix):**
  - $k=0$ (Minimum) or $k=N-1$ (Maximum): Handled uniformly by index check.

## WEEK 49-52: INTEGRATION & MASTERY
**Cross-Pattern Problem Solving**
- **Pattern Identification Speed Drills**: Given problem statement, identify pattern in ≤60 seconds using signal words (contiguous/substring → sliding window, sorted + target → binary search/two-pointer, shortest path unweighted → BFS, weighted non-negative → Dijkstra, count ways/optimize → DP)
- **Multi-Structure Hybrid Architectures**: Heap + HashMap for O(log N) priority + O(1) lookup (lazy deletion), BST/SortedSet + LinkedList for O(log N) ordered + O(1) LRU eviction, DSU + sorting for offline connectivity queries, BFS + bitmask for state-space search on N≤20 element sets
- **Time-Space Trade-off Analysis**: Space-time Pareto frontier (when extra O(N) space buys O(N log N) → O(N) time), bitset compression for boolean DP (64x space reduction), precomputed answer tables vs on-the-fly computation based on query frequency
- **Production Code Quality Under Pressure**: Meaningful variable names (not `i,j,k` for everything), helper function extraction, `int` vs `long` overflow awareness (multiply two ~10^9 values needs `long`), guard clauses for null/empty inputs, complexity annotation comments
- **Testing Strategy & Edge Cases**: Empty / single-element inputs, all-same elements, already-sorted / reverse-sorted, maximum constraint inputs (stress test with brute-force comparison), integer boundary values (`int.MinValue`, `int.MaxValue` in arithmetic)
- **Interview Execution Framework**: Clarify constraints before coding (2 min), state approach + complexity before writing code (3 min), code cleanly (30 min), walk through one normal + one edge case at the end (5 min)
- **System Design Connection Checklist**: For every algorithm/data structure, be able to answer: (1) What production system uses this? (2) What scale breaks the naive approach? (3) What data structure choice does the system make and why? (4) What is the write vs read amplification trade-off? (5) How does concurrency/replication affect correctness?
- **Behavioral Interview Framework (STAR + DSA)**: Situation → Task → Action (highlight algorithmic decision: WHY this data structure, WHY this complexity) → Result (quantified impact); common DSA-relevant behavioral questions: "Tell me about a time you optimized a slow algorithm", "Describe a complex data modeling decision", "How did you debug a performance issue?"; always connect to specific complexity improvements ("reduced from O(N²) to O(N log N) by switching from a sorted list to a balanced BST")
- **Mock Interview Simulation Protocol**: Weekly timed mock sessions: (a) 5 min problem reading + clarifying, (b) 5 min approach discussion, (c) 20 min coding, (d) 5 min testing + edge cases, (e) 5 min complexity analysis; record sessions and review for: filler words during explanation, correctness of spoken complexity claims, code cleanliness under pressure
- **Complexity Class Awareness**: P (polynomial time solvable), NP (polynomial time verifiable), NP-Complete (hardest in NP — reduce any NP problem to it), NP-Hard (at least as hard as NP-Complete but not necessarily in NP); canonical NP-Complete problems: SAT, 3-SAT, Hamiltonian Cycle, Vertex Cover, Subset Sum, TSP; recognizing NP-Complete structure in interview problems → pivot to approximation algorithms or exact exponential algorithms for small N

## WEEK 53-54: ADVANCED STRING ALGORITHMS & AUTOMATA
**Deep Pattern Matching & Suffix Structures**
- **KMP Failure Function (π-array) Deep Mechanics**: Formal definition: π[i] = length of longest proper prefix of pattern[0..i] that is also a suffix; construction in O(M) via two-pointer with fallback; string as state machine — mismatch jumps to π[j-1] rather than restart; applications beyond search: period detection (`M % (M - π[M-1]) == 0`), shortest palindrome prefix
- **Z-Algorithm & Applications**: Z[i] = length of longest substring starting at index i that matches a prefix of S; Z-box maintenance: `[l, r]` tracks rightmost matching window, only extend naively when beyond r → O(N) total extensions; applications: exact pattern matching (concatenate pattern + '$' + text, Z-values ≥ |pattern| are match positions), string compression
- **Manacher’s Linear-Time Palindrome Algorithm**: O(N) linear time and space for finding the longest palindromic substring; inserting dummy delimiters (`#`) to unify odd and even palindromes; maintaining current palindrome center C and rightmost boundary R; radius array mirroring `P[i] ≥ min(R - i, P[2C - i])` to eliminate redundant expansions
- **Booth's Algorithm & Minimal String Rotation**: Modified KMP failure function on doubled string S+S to find the lexicographically minimal circular string rotation in O(N) time; applications in canonical string representations
- **Lyndon Words & Duval's Algorithm**: A Lyndon word is a string strictly smaller than all its proper rotations and suffixes; Duval's algorithm factorizes any string into non-increasing sequence of Lyndon words in O(N) time and O(1) space; connection to suffix arrays (Lyndon factorization sorts suffixes), string periodicity, and lexicographically smallest infinite repetition; implementing `DuvalLyndonFactorization` from scratch
- **Palindromic Tree (Eertree)**: Compact automaton storing all distinct palindromic substrings of a string; O(N) nodes (at most N+2 including two root nodes for odd/even length); each insertion either extends an existing palindrome or creates a new node; `link` pointer = longest proper palindromic suffix; enables O(N) computation of palindrome count, palindrome factorization, and minimum palindrome cuts; implementing `Eertree` from scratch
- **Suffix Tree Construction (Ukkonen's Algorithm)**: Online O(N) suffix tree construction; 3 active point variables (active_node, active_edge, active_length); extension rules 1/2/3 and implicit suffix tree; O(N) space in compact representation (store edge as [start, end] index pair); enables O(M) pattern matching, O(N) longest common substring of two strings via generalized suffix tree; implementing conceptual Ukkonen step-by-step walkthrough
- **Aho-Corasick Automaton & From-Scratch Multi-Pattern Trie**: Build Trie of all patterns, then add failure links (like KMP π-array but on Trie nodes) via BFS; failure link of node v = longest proper suffix of path(v) that also exists in Trie; dictionary links shortcut to nearest terminal ancestor; final automaton processes text in O(N + Σ|patterns| + total_matches), used in intrusion detection and bioinformatics; implementing `AhoCorasick` trie automaton from scratch
- **Suffix Arrays & LCP Array**: Suffix Array SA: sorted array of all suffix starting indices; doubling construction O(N log² N) or SA-IS O(N); Kasai's O(N) LCP array construction (if LCP[rank[i]] = k > 0, then LCP[rank[i+1]] ≥ k-1); applications: count distinct substrings = N(N+1)/2 - ∑LCP[i], longest repeated substring = max(LCP), string duplication detection
- **Suffix Automaton (SAM) & From-Scratch Automaton**: Most compact representation of all substrings of S in O(N) nodes; each state represents an equivalence class of end-positions (`endpos`); `link` tree = suffix tree structure; enables O(N) solutions for longest common substring of multiple strings and distinct substring counting; implementing online `SuffixAutomaton` from scratch

### ⚙️ Core Operations & Internal Logic Deep-Dive: Advanced Strings & Automata State Machines

#### 1. KMP $\pi$-Array Fallback Transition & Online Search State Machine
- **Dimension 1 (Contract & Complexity):** Construct prefix function $\pi[i] = \max \{ k : P[0..k-1] = P[i-k+1..i], k < i+1 \}$. Time Complexity: $\Theta(M)$ for pattern preprocessing, $\Theta(N)$ for text scanning; Space Complexity: $\Theta(M)$ integers.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Initialize $\pi[0] = 0, j = 0$.
  2. For $i = 1$ to $M - 1$:
     - Fallback loop: While $j > 0$ and $P[i] \neq P[j]$, cascade backwards: $j = \pi[j - 1]$.
     - Character match: If $P[i] == P[j]$, advance prefix length: $j++$.
     - Commit state: $\pi[i] = j$.
  3. Text Scanning: Match $T[k]$ against $P[j]$. On mismatch, $j$ retreats to $\pi[j-1]$ without resetting $k$.
- **Dimension 3 (Visual State Transition):**
  ```
  Pattern: "A B A B A C"
  Indices:  0 1 2 3 4 5

  i=1 ('B'): P[1] != P[0] ('A') -> pi[1] = 0
  i=2 ('A'): P[2] == P[0] ('A') -> j=1, pi[2] = 1
  i=3 ('B'): P[3] == P[1] ('B') -> j=2, pi[3] = 2
  i=4 ('A'): P[4] == P[2] ('A') -> j=3, pi[4] = 3
  i=5 ('C'): P[5] != P[3] ('B') -> j = pi[2] = 1
             P[5] != P[1] ('B') -> j = pi[0] = 0
             P[5] != P[0] ('A') -> j = 0, pi[5] = 0
  Result Array: [0, 0, 1, 2, 3, 0]
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Amortized Cost Invariant:* In each step of text search or table build, $j$ increases by at most 1. The operation $j = \pi[j-1]$ strictly decreases $j$. Since $j \ge 0$, the total number of decrements across the entire loop cannot exceed the total number of increments ($M$ or $N$). Thus, amortized time is strictly $O(1)$ per character, yielding $O(N + M)$ total.
- **Dimension 5 (Edge Case Matrix):**
  - All identical characters (`"AAAAA"`): $\pi = [0, 1, 2, 3, 4]$, fallback chains step down by 1.
  - Alternating pattern (`"ABABAB"`): Periodicity detected via $M \pmod{M - \pi[M-1]} == 0$.
  - No prefix match (`"ABCDEF"`): $\pi$ filled with zeroes; $j$ remains 0 throughout.

#### 2. Suffix Automaton (SAM) Online Character Extension & Link Redirection
- **Dimension 1 (Contract & Complexity):** Extend suffix automaton by character $c$. Maintains minimal deterministic acyclic finite automaton (DAWG) recognizing all substrings of $S$. Time Complexity: $O(1)$ amortized per character, total $O(N)$ for string of length $N$; Space Complexity: $\le 2N - 1$ states, $\le 3N - 4$ transitions.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Allocate state `cur` with `len[cur] = len[last] + 1`. Let `p = last`.
  2. While `p != -1` and `next[p, c] == null`:
     - Set `next[p, c] = cur`, and climb link: `p = link[p]`.
  3. If `p == -1`: No ancestor has transition $c$; set `link[cur] = 0` (root), update `last = cur`, return.
  4. Let `q = next[p, c]`.
     - Case A (Continuous transition): If `len[q] == len[p] + 1`, suffix set aligns perfectly $\to$ set `link[cur] = q`, `last = cur`.
     - Case B (Split/Cloning): Otherwise, clone state $q$ into state `clone` (`len[clone] = len[p] + 1`, copy transitions and `link[clone] = link[q]`).
     - Rewire links: Set `link[q] = clone`, `link[cur] = clone`.
     - Redirect transitions: While `p != -1` and `next[p, c] == q`: set `next[p, c] = clone`, `p = link[p]`.
     - Update `last = cur`.
- **Dimension 3 (Visual State Transition):**
  ```
  State Splitting during Extension with character 'c':
  BEFORE (Discontinuous match):
  (p) --'c'--> (q) [len[q] > len[p]+1, endpos(q) contains longer paths]
   ^
  link(cur) unresolved

  CLONE & REDIRECT:
  Create (clone) with len[clone] = len[p] + 1
  link[clone] = link[q]
  link[q] = clone; link[cur] = clone

  AFTER:
  (p) --'c'--> (clone) <--link-- (cur)
                 ^
                 |--link-- (q)
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Equivalence Class Invariant:* Each state $u$ represents an equivalence class of substrings having identical sets of end positions (`endpos`). Splitting state $q$ isolates paths of length $\le len[p]+1$ (which acquire the new endpos $|S|$) from longer paths (which do not match the new extension), strictly preserving DFA determinism and minimality.
- **Dimension 5 (Edge Case Matrix):**
  - First character added: Connects directly from root state 0; `link[cur] = 0`.
  - Repetitive character (`"aaaa"`): Hits Case A repeatedly (`len[q] == len[p] + 1`); no clones created.
  - Distinct alphabet (`"abcdef"`): Traverses back to root each time; exactly $N$ states formed.

## WEEK 55-56: ADVANCED RANGE QUERIES & TREE DECOMPOSITIONS
**Sub-Logarithmic Querying & Tree Path Algorithms**
- **Segment Tree with Lazy Propagation & From-Scratch Implementation**: Deferred range-update via "lazy tag" stored at internal nodes; push-down invariant: before accessing a node's children, propagate its tag; supports range-add + range-query and range-set + range-query in O(log N); implement `Build`, `PushDown`, `Update`, `Query` with 4N array; implementing `LazySegmentTree<T>` from scratch
- **Sparse Table for Static RMQ & From-Scratch Sparse Table**: `st[i][j]` = min/max of range [i, i+2^j-1]; build in O(N log N); O(1) query via two overlapping windows: `min(st[L][k], st[R-2^k+1][k])` where k = ⌊log₂(R-L+1)⌋ — overlap is valid because min is idempotent; no updates supported; preferred over Segment Tree when array is static and queries are numerous; implementing `SparseTable<T>` from scratch
- **Mo’s Algorithm & Sqrt Decomposition**: Optimal block size $B = N / \sqrt{Q}$; sorting offline range queries in Mo's order (`(L/B, R)` with alternating R sweep direction) to achieve $O((N + Q)\sqrt{N})$ total pointer movements for range frequency and distinct element queries; general array sqrt chunking for sub-linear updates/queries
- **Cartesian Tree & Treaps & From-Scratch Randomized Treap**: Building Cartesian Tree in O(N) using a monotonic stack (simultaneously a binary search tree in-order and a heap on values); equivalence between Cartesian Tree LCA and array RMQ; Treap (Tree + Heap) randomized balanced BST with priority heap invariants; implementing `Treap<K, P>` from scratch with split/merge operations
- **Binary Lifting for LCA**: `anc[v][j]` = 2^j-th ancestor of v, precompute in O(N log N) via `anc[v][j] = anc[anc[v][j-1]][j-1]`; LCA query: equalize depths by lifting shallower node, then binary-lift both until they converge — O(log N) per query; also answers "distance between nodes" and "path maximum/minimum"
- **Euler Tour Flattening vs HLD**: Mapping tree subtrees to contiguous array intervals `[in[u], out[u]]` via DFS timestamps for O(log N) subtree queries with Segment Tree; Heavy-Light Decomposition (HLD) for path queries: decomposing tree into heavy chains, climbing chains to LCA via Segment Tree in O(log² N)
- **DSU on Tree ("Sack" / Small-to-Large Merging)**: Answering offline subtree queries in O(N log N); maintaining frequency maps by keeping the heavy child's data structure intact and clearing light children; much simpler than full HLD for subtree-only queries
- **Centroid Decomposition**: Centroid of tree = node whose removal leaves no component > N/2; find in O(N) DFS; build centroid tree of depth O(log N); every path in original tree passes through its centroid-tree LCA; process all paths through current centroid in O(N) then recurse on subtrees → O(N log N) algorithms for path-distance problems
- **Wavelet Tree**: Space-efficient structure over arrays of integers with range [0, σ); O(N log σ) space; supports range k-th smallest, range count ≤ v, range frequency in O(log σ) per query; built recursively: split values at median, store left/right bitmask, recurse; supersedes Merge Sort Tree for offline range order statistics; implementing `WaveletTree` from scratch
- **Persistent Segment Tree (Functional Segment Tree)**: Each update creates a new root pointing to a new path of O(log N) nodes, sharing unchanged subtrees with previous version; O(N log N) space for N updates; enables offline version queries: "range min/max/sum at version k"; prerequisite: coordinate compression for online persistent queries; implementing `PersistentSegmentTree` from scratch with version array
- **Link-Cut Trees (Advanced Optional)**: Dynamic tree supporting O(log N) path queries and link/cut operations on a forest; implemented via splay trees on preferred paths; enables dynamic connectivity, dynamic MST, and LCA in changing forests; know conceptually for system design discussions on dynamic graph databases

### ⚙️ Core Operations & Internal Logic Deep-Dive: Advanced Tree Decompositions & Balanced Treaps

#### 1. Heavy-Light Decomposition (HLD) Chain Climbing & Segment Tree Bridging
- **Dimension 1 (Contract & Complexity):** Decompose arbitrary tree into disjoint vertex paths (chains) such that any path between vertices $u$ and $v$ traverses at most $O(\log N)$ heavy chains. Time Complexity: Preprocessing $\Theta(N)$, Path Query/Update $O(\log^2 N)$ using Segment Tree; Space Complexity: $\Theta(N)$.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. DFS 1 (Subtree Sizes & Heavy Child Selection):
     - Compute subtree size `sz[u]`.
     - Identify heavy child `heavy[u]` such that `sz[heavy[u]] == max(sz[v])` for all children $v$.
  2. DFS 2 (Chain Flattening & DFS Ordering):
     - Assign `pos[u] = ++timer` and record chain head `head[u]`.
     - Recurse on `heavy[u]` *first* (setting `head[heavy[u]] = head[u]`), ensuring vertices on the same heavy chain occupy contiguous indices in `pos[]`.
     - Recurse on each light child $v$ (setting `head[v] = v`).
  3. Query Path $(u, v)$:
     - While `head[u] != head[v]`:
       - Pick node with deeper head: Assume `depth[head[u]] >= depth[head[v]]`.
       - Execute Segment Tree query on interval `[pos[head[u]], pos[u]]`.
       - Climb to light edge: `u = parent[head[u]]`.
     - When `head[u] == head[v]`: Both are on the same chain; execute final Segment Tree query on `[min(pos[u], pos[v]), max(pos[u], pos[v])]`.
- **Dimension 3 (Visual State Transition):**
  ```
  Tree Decomposition:
       (1) [head=1]
       /  \
     (2)   (3) [heavy, head=1]
           /  \
         (4)  (5) [heavy, head=1]

  Chain 1 (Heavy): 1 - 3 - 5 -> Contiguous Segment Tree indices [1, 2, 3]
  Light Children: (2) [pos=4, head=2], (4) [pos=5, head=4]

  Query Path(2, 5):
  Step 1: head[2]=2, head[5]=1. depth[head[2]] > depth[head[1]].
          Query SegTree [pos[2], pos[2]] -> SegTree[4..4]. u becomes parent[2] = 1.
  Step 2: head[1]=1, head[5]=1. Same chain!
          Query SegTree [min(pos[1], pos[5]), max(pos[1], pos[5])] -> SegTree[1..3].
  Total Segment Tree ranges combined: 2.
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Light Edge Halving Invariant:* A light edge $(u, v)$ satisfies $sz[v] \le sz[u]/2$. Moving from leaf to root can traverse at most $\log_2 N$ light edges. Between any two light edges lies at most one heavy chain. Thus, any simple path intersects at most $O(\log N)$ chains, bounding range query combinations to $O(\log^2 N)$.
- **Dimension 5 (Edge Case Matrix):**
  - $u == v$: Loop terminates immediately; single point query on `[pos[u], pos[u]]`.
  - Linear tree (Degenerate chain): Exactly 1 heavy chain; query executes in $O(\log N)$ single Segment Tree query.
  - Star graph: All edges are light; each step climbs exactly 1 node to root; maximum 2 light edge transitions.

#### 2. Randomized Cartesian Treap Split & Merge Primitive Transitions
- **Dimension 1 (Contract & Complexity):** Maintain binary search tree on keys with min-heap on randomized priorities. Supports `Split(root, key, out left, out right)` and `Merge(out root, left, right)`. Time Complexity: Expected $\Theta(\log N)$ for both split and merge, $\Theta(N)$ worst-case (probability $< 1/N!$); Space Complexity: $\Theta(1)$ auxiliary.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. `Split(node, key, out L, out R)`:
     - Base: If `node == null`, $L = \text{null}, R = \text{null}$; return.
     - If `node.Key <= key`: `node` and its left subtree belong to $L$. Recurse on right child: `Split(node.Right, key, out node.Right, out R)`; $L = \text{node}$.
     - Else: `node` and its right subtree belong to $R$. Recurse on left child: `Split(node.Left, key, out L, out node.Left)`; $R = \text{node}$.
     - Recalculate subtree size / aggregate values for `node`.
  2. `Merge(out node, L, R)` (Invariant: $\max(key(L)) < \min(key(R))$):
     - Base: If $L == \text{null}$, node = $R$; if $R == \text{null}$, node = $L$; return.
     - Heap Priority Check:
       - If `L.Priority < R.Priority`: $L$ is root. Recurse: `Merge(out L.Right, L.Right, R)`; node = $L$.
       - Else: $R$ is root. Recurse: `Merge(out R.Left, L, R.Left)`; node = $R$.
     - Recalculate subtree aggregates for `node`.
- **Dimension 3 (Visual State Transition):**
  ```
  Merge Treaps L and R:
  L (Key=10, Prio=2)          R (Key=20, Prio=5)
     /      \                     /      \
  (5, 7)   (12, 8)            (15, 9)   (25, 6)

  Step 1: Compare root priorities: L.Prio (2) < R.Prio (5) -> L becomes Root!
  Step 2: Recurse Merge(L.Right [12, 8], R [20, 5]):
          Compare priorities: R.Prio (5) < L.Right.Prio (8) -> R becomes Right child of L!
  Step 3: Recurse Merge(L.Right [12, 8], R.Left [15, 9]):
          Compare priorities: 8 < 9 -> (12, 8) becomes Left child of R!
  Result Tree: Root=(10, 2) -> Right=(20, 5) -> Left=(12, 8) -> Right=(15, 9).
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Simultaneous BST and Heap Invariant:* Split preserves key partitioning because each subtree cleanly retains keys $\le key$ or $> key$. Merge preserves heap order by greedily taking the smaller priority as root and inducting on subtrees, maintaining expected tree depth $\le 2\ln N$ via uniform random priorities.
- **Dimension 5 (Edge Case Matrix):**
  - Merge with empty tree: Instant $O(1)$ return of non-empty child.
  - Split key smaller than all keys: $L = \text{null}$, $R = \text{full tree}$.
  - Split key larger than all keys: $L = \text{full tree}$, $R = \text{null}$.

## WEEK 57-58: ADVANCED GRAPH ALGORITHMS & NETWORK FLOW
**Residual Graphs, Matching & Connectivity**
- **Multi-Source BFS & 0-1 BFS**: Multi-source: add all sources to queue simultaneously at distance 0 (equivalent to virtual super-source with weight-0 edges); 0-1 BFS: use deque — weight-0 edges push to front (same distance), weight-1 edges push to back (distance+1); deque invariant maintains sorted distance → O(V+E) vs Dijkstra's O((V+E)logV)
- **Eulerian Path & Circuit (Hierholzer’s Algorithm)**: Existence theorems (undirected: 0 or 2 odd-degree vertices; directed: at most one start node with out - in = 1 and one end node with in - out = 1); Hierholzer's post-order edge-deletion DFS in O(V+E) for reconstruct itinerary problems
- **Strongly Connected Components (SCC)**: Kosaraju's: DFS on original graph recording finish order, DFS on transposed graph in reverse finish order — each tree in 2nd DFS = one SCC; Tarjan's: single DFS with `disc[]`, `low[]`, and stack — pop SCC when `low[v] == disc[v]` (v is SCC root); condensation DAG is always a DAG
- **2-SAT Problem Formulation**: Each boolean variable x creates two implication nodes (x and ¬x); clause (a ∨ b) converted to implications (¬a → b) and (¬b → a); linear-time resolution: solvable iff x and ¬x never share an SCC; variable assignment via topological order of condensation DAG
- **Johnson’s All-Pairs Shortest Path**: Reweighting edges using Bellman-Ford vertex potentials h(u) such that `w'(u,v) = w(u,v) + h(u) - h(v) ≥ 0`; running Dijkstra V times in O(V · E log V) on sparse graphs with negative edge weights without negative cycles
- **Biconnected Components & Block-Cut Trees**: Decomposing graphs into 2-vertex-connected components (blocks) and cut vertices; building tree of blocks and cut vertices for network bridge/articulation reachability queries
- **Gomory-Hu Tree**: A weighted tree on V nodes representing all V(V-1)/2 pairwise max-flows in an undirected graph; constructed via V-1 max-flow computations; query: max-flow between s and t = minimum edge weight on the unique s-t path in the Gomory-Hu tree; reduces V² max-flow computations to V-1; used in network reliability analysis and multi-commodity flow approximation
- **Push-Relabel Algorithm (Goldberg-Tarjan)**: Vertex-centric max-flow maintaining preflow (nodes can have excess); `push` moves excess along admissible edges; `relabel` increases height label when no admissible edge exists; O(V²E) general, O(V³) with FIFO selection rule; outperforms Dinic's on dense graphs; `Gap Heuristic`: if no node has height h, all nodes with height > h are disconnected from sink → reassign to h = V
- **Maximum Matching Beyond Bipartite (Blossom Algorithm)**: Edmond's Blossom algorithm: augmenting paths in general (non-bipartite) graphs; blossom = odd cycle contracted to single vertex (enables BFS augmenting path search); O(V³) general matching, O(E√V) with sophisticated implementation; minimum vertex cover = V - |maximum matching| (König's theorem only for bipartite); applications in scheduling, computational chemistry (electron pairing)
- **Max-Flow & Min-Cut Theorem**: Residual graph: forward edge (remaining capacity c-f), backward edge (allows undoing flow, capacity f); augmenting path = path from s to t in residual graph; Max-Flow Min-Cut Theorem: max flow = min cut capacity (fundamental duality); Ford-Fulkerson: find any augmenting path + augment; Edmonds-Karp: BFS augmenting paths → O(VE²)
- **Dinic’s Algorithm & Hopcroft-Karp**: Dinic's: builds level graph via BFS, finds blocking flow via DFS → O(V²E) general, O(E√V) on unit-capacity networks; Hopcroft-Karp: maximum bipartite matching in O(E√V) via simultaneous shortest augmenting paths; Min-Cost Max-Flow (MCMF) via successive shortest augmenting paths with SPFA or potentials

### ⚙️ Core Operations & Internal Logic Deep-Dive: Residual Graphs & Dinic's Blocking Flow

#### 1. Dinic's Algorithm: Level Graph BFS & DFS Blocking Flow Augmentation
- **Dimension 1 (Contract & Complexity):** Compute maximum $s$-$t$ flow in directed network $G=(V, E, c)$. Time Complexity: $O(V^2 E)$ general networks, $O(E \sqrt{V})$ on unit networks / bipartite matching; Space Complexity: $\Theta(V + E)$ for adjacency list and level arrays.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. BFS Phase (Level Graph Construction):
     - Reset `level[] = -1`, `level[s] = 0`, queue $Q = \{s\}$.
     - While $Q$ not empty: Dequeue $u$. For each edge $(u, v)$ with residual capacity $r(u, v) > 0$:
       - If `level[v] == -1`: Set `level[v] = level[u] + 1`, enqueue $v$.
     - If `level[t] == -1`: No augmenting path exists; terminate algorithm.
  2. DFS Phase (Find Blocking Flow via Level Graph):
     - Initialize `ptr[u] = 0` (current edge pointer optimization to avoid re-examining saturated edges).
     - Function `Dfs(u, pushed)`:
       - If $u == t$ or $pushed == 0$: return $pushed$.
       - For `i = ptr[u]` to `adj[u].Count - 1`:
         - Set `ptr[u] = i`. Let edge $e = adj[u][i]$.
         - If `level[e.to] == level[u] + 1` and $e.cap - e.flow > 0$:
           - $tr = Dfs(e.to, \min(pushed, e.cap - e.flow))$.
           - If $tr > 0$:
             - Update residual: $e.flow += tr$, $rev(e).flow -= tr$.
             - Return $tr$.
       - Return 0.
     - While $(f = Dfs(s, \infty)) > 0$: TotalMaxFlow += $f$.
  3. Repeat from Step 1.
- **Dimension 3 (Visual State Transition):**
  ```
  Residual Edge Update during Augmentation:
  Forward Edge e (u -> v): cap = 10, flow = 4, residual = 6
  Reverse Edge rev (v -> u): cap = 0, flow = -4, residual = 4

  DFS finds augmenting flow delta = 3 through (u -> v):
  Step 1: e.flow += 3     -> flow = 7 (residual decreases: 10 - 7 = 3)
  Step 2: rev.flow -= 3   -> flow = -7 (back-residual increases: 0 - (-7) = 7)

  Structure AFTER Augmentation:
  [u] ===== flow: 7 / cap: 10 =====> [v]  (Forward capacity remaining: 3)
  [u] <.... residual capacity: 7 ... [v]  (Cancellation capacity available: 7)
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Strict Distance Monotonicity:* In each iteration of Dinic's algorithm, the blocking flow saturates at least one edge on every path in the level graph, and any newly created residual backward edges point backwards in levels ($level[u] \ge level[v]$). Therefore, the distance from source $s$ to sink $t$ in the level graph strictly increases after each phase: $level^{(k+1)}[t] > level^{(k)}[t]$. Since $level[t] \le V - 1$, there are at most $V - 1$ BFS phases.
- **Dimension 5 (Edge Case Matrix):**
  - Disconnected $s$ and $t$: BFS fails to reach $t$ on phase 1; returns max flow 0 in $O(V + E)$.
  - Saturated edges: `ptr[u]` edge skipping ensures saturated edges are never revisited within the same DFS phase, guaranteeing $O(VE)$ per blocking flow.
  - Zero-capacity antiparallel edges: Properly handled via dual residual edges without cyclic interference.

## WEEK 59-60: ADVANCED DYNAMIC PROGRAMMING OPTIMIZATIONS
**Specialized State Spaces & Speedup Techniques**
- **Digit DP**: Count integers in [1, N] satisfying digit-level constraint; state: `(position, tight, extra_constraint)` where `tight = true` means current digit bounded by N's digit; when a digit < N[pos] is chosen, tight becomes false; template: `dfs(pos, tight, state)` memoized with `Dictionary<(int,int,int), long>`; range query: `Count(R) - Count(L-1)`
- **Tree DP & Rerooting Technique**: Standard tree DP: define `dp[v]` = optimal for subtree of v, compute postorder; Rerooting: when answer depends on full tree per node, two DFS passes — first DFS computes `down[v]` (subtree contribution), second DFS propagates `up[v]` (rest-of-tree contribution) using parent's `down` values and sibling re-derivation; enables O(N) for "answer for every node as root" problems
- **Sum Over Subsets (SOS DP)**: Calculating $\sum_{sub \subseteq mask} f(sub)$ for all $2^N$ masks in $O(N \cdot 2^N)$ time using multi-dimensional prefix sums over bit dimensions, eliminating the naive $O(3^N)$ submask enumeration bottleneck
- **Convex Hull Trick (CHT) & Li Chao Tree & From-Scratch Implementation**: For DP recurrences `dp[i] = min_j(dp[j] + m[j]·x[i] + c[j])`: each j defines a line y = m[j]·x + c[j]; minimize over all lines at query x[i]; maintain lower convex hull of lines; if queries sorted → O(N) with pointer; arbitrary queries → O(N log N) with binary search; Li Chao Tree: segment-tree-based CHT supporting online queries in O(N log N); implementing `LiChaoTree` from scratch
- **Aliens Trick (WQS Binary Search / Lagrangian Relaxation)**: Removing exact-K constraints by adding penalty $\lambda$ per item selected; binary searching on $\lambda$ to find the target count when the optimal cost curve is convex/concave; reduces 2D state DP to 1D DP in $O(N \log(\text{Range}))$
- **Divide & Conquer DP Optimization**: When optimal split point `opt[i][j]` satisfies monotonicity `opt[i-1][j] ≤ opt[i][j] ≤ opt[i][j+1]`, 2D DP O(N²) → O(N log N): solve middle row by checking [opt_lo, opt_hi], recurse on upper/lower halves with tighter bounds; applicable when cost function satisfies quadrangle inequality
- **Knuth-Yao Speedup & Slope Trick**: Interval DP `dp[i][j] = min_k(dp[i][k] + dp[k+1][j] + w(i,j))` where w satisfies quadrangle inequality and monotone sub-interval → `opt[i][j-1] ≤ opt[i][j] ≤ opt[i+1][j]`, reducing O(N³) → O(N²); Slope Trick for maintaining piecewise linear convex functions using two priority queues of transition breakpoints
- **Profile DP / Broken Profile**: Dynamic programming with bitmask states on grid cell boundaries (domino tiling, contour line DP), tracking the frontier of filled cells cell-by-cell in $O(M \cdot N \cdot 2^M)$
- **Monotone Queue DP Optimization**: When DP transition is `dp[i] = min_{j in [i-k, i-1]}(dp[j]) + cost(i)` with fixed window, use monotonic deque to reduce O(NK) → O(N); extend to variable window via shrink/expand with validity checks on j; canonical problem: largest rectangle in histogram DP formulation
- **Shortest Path Faster Algorithm (SPFA) & its Demise**: Queue-based Bellman-Ford relaxation; relaxes only neighbors of recently updated vertices; average O(E) but worst-case O(VE) — adversarially bad on dense grids; SPFA with SLF (Shortest Label First) heuristic improves average case; in competitive programming, SPFA is deprecated in favor of Dijkstra + potentials or Bellman-Ford for negative edges
- **Directed MST (Minimum Spanning Arborescence / Chu-Liu Edmonds)**: Finding minimum weight directed spanning tree rooted at r in a directed graph; Chu-Liu/Edmonds algorithm: O(VE) naive, O(E log V) with heaps; unlike undirected MST (Kruskal/Prim), requires considering directionality and contracting strongly connected components of minimum-incoming-edge cycles; used in network broadcasting and dependency trees

### ⚙️ Core Operations & Internal Logic Deep-Dive: Geometric & Convex Dynamic Programming Optimizations

#### 1. Convex Hull Trick (CHT) Envelope Maintenance & Query Pointer Transitions
- **Dimension 1 (Contract & Complexity):** Evaluate $\min_{j < i} \{ m_j \cdot x_i + c_j \}$ dynamically. When lines have monotonic slopes $m_j$ and queries have monotonic $x_i$, achieves amortized $\Theta(1)$ per query and $\Theta(N)$ total time; Space Complexity: $\Theta(N)$.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Intersection Calculation:
     - Intersection x-coordinate of lines $L_1 (m_1, c_1)$ and $L_2 (m_2, c_2)$: $x_{int}(L_1, L_2) = \frac{c_1 - c_2}{m_2 - m_1}$.
  2. Line Insertion `AddLine(m_new, c_new)` (assume decreasing slopes $m_1 > m_2 > \dots$):
     - While deque length $\ge 2$:
       - Let $L_{back} = deque[last], L_{prev} = deque[last - 1]$.
       - If $x_{int}(L_{prev}, L_{back}) \ge x_{int}(L_{back}, L_{new})$:
         - Line $L_{back}$ is made redundant (never optimal for any $x$); pop $L_{back}$.
       - Else: break.
     - Push $L_{new}$ to deque.
  3. Query `Query(x_query)` (assume increasing query points $x$):
     - While deque length $\ge 2$ and $deque[0].Eval(x) \ge deque[1].Eval(x)$:
       - Front line is permanently suboptimal for all future larger $x$; pop front.
     - Return $deque[0].Eval(x)$.
- **Dimension 3 (Visual State Transition):**
  ```
  Lower Convex Hull Envelope Pruning:
  Existing lines: L1, L2. Candidate insertion: L3.

         y ^
           |      / (L1)
           |     /     / (L2)
           |    /  *  /
           |   /  / \/    / (L3)
           |  /  /  /\   /
           | /  /  /  \ /
           +-------------------> x
                 x12  x23
  If x12 >= x23: L2 is pushed entirely ABOVE the envelope formed by L1 and L3!
  POP L2 from hull! L1 and L3 now intersect directly on the optimal lower boundary.
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Strict Convexity Invariant:* The deque maintains lines sorted by slope such that intersection points $x_{int}(L_k, L_{k+1})$ are strictly increasing: $x_{int}(L_0, L_1) < x_{int}(L_1, L_2) < \dots < x_{int}(L_{k-1}, L_k)$. Each added line can eliminate multiple obsolete lines, but each line is pushed once and popped at most once, guaranteeing amortized $O(1)$ maintenance.
- **Dimension 5 (Edge Case Matrix):**
  - Parallel lines ($m_1 == m_2$): Discard the line with higher $c$ immediately in $O(1)$ without division by zero.
  - Queries not monotonic: Envelope maintenance remains $O(N)$, but query requires binary search over hull lines in $O(\log N)$.

## WEEK 61-62: PROBABILISTIC, RANDOMIZED & STREAMING DATA STRUCTURES
**Sub-Linear Space & Stochastic Algorithms**
### 📐 5W1H Taxonomy: Probabilistic & Streaming Structures
- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *Bloom Filter:* Probabilistic set answering "definitely not in set" or "possibly in set" with zero false negatives.
  - *Skip List:* Multi-layered linked list using randomized geometric coin-toss levels for $O(\log N)$ balanced search without tree rotations.
  - *Count-Min Sketch & HyperLogLog:* Sub-linear streaming frequency and cardinality estimators.
  - *Misconception Check:* A Bloom Filter can *never* produce a false negative; if it says an element is absent, it is guaranteed absent.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* Eliminates the impossible memory barrier of storing billions of elements in RAM by sacrificing absolute precision for mathematically bounded error rates.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Billions of items, web crawlers (visited URLs), database disk read guards (SSTables), real-time unique visitor counting.
  - *When to Avoid / Failure Modes:* When exact 100% precision is legally or computationally required (banking transactions); deleting elements from standard Bloom Filters (requires Counting Bloom Filter).
  - *Signal Words:* "Sub-linear memory", "approximate unique visitors", "prevent expensive disk read for non-existent key".
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical Memory:* Compact bit-arrays (Bloom Filter uses ~10 bits/item for 1% error); HyperLogLog uses ~1.5 KB total for 1% error on billions of keys.
  - *Production Systems:* Apache Cassandra & RocksDB (SSTable Bloom filters), Redis `PFCOUNT` (HyperLogLog), LevelDB.
- **5. HOW (Operations, Implementation & Spoken Drill):**
  - *Operations Cost Model:* Bloom filter test/add: $\Theta(k)$ hash operations ($O(1)$); Skip List search/insert: expected $\Theta(\log N)$.
  - *Interview Spoken Drill (20–30s):* *"A Bloom filter is a bit-array with multiple hash functions providing zero-false-negative set checks. I use it as a low-memory guard in front of databases to eliminate expensive disk seeks for missing keys."*

- **Reservoir Sampling**: Maintain random sample of size K from stream of unknown length; for each new element i (1-indexed): add to reservoir if i ≤ K; else replace random reservoir element with probability K/i; proof by induction: after seeing i elements, each has exactly K/i probability of being in reservoir; O(1) per element, O(K) space
- **Fisher-Yates Shuffle**: For i from N-1 down to 1: swap A[i] with A[random(0,i)]; produces uniformly random permutation in O(N); proof: each of N! permutations has exactly 1/N! probability (N · (N-1) · ... · 1 equally likely choices at each step)
- **Bloom Filters & From-Scratch Implementation**: M-bit array + K hash functions; insert: set K bits; query: all K bits set → "possibly present" (no false negatives), any bit unset → "definitely absent"; false positive probability ≈ (1 - e^(-kn/m))^k, optimal k = (m/n)·ln 2; ~10 bits/element for 1% FP rate; used in databases to avoid disk lookups for non-existent keys; implementing `BloomFilter<T>` from scratch with Murmur3/FNV hash spreading
- **Count-Min Sketch & From-Scratch Implementation**: d rows × w columns of counters + d independent hash functions; add(x): increment counters at (h_i(x) mod w) in each row i; estimate(x): min across all d rows; always overestimates (hash collisions inflate counts, never deflate); error bound: estimate ≤ true_count + ε·total_items with probability ≥ 1-δ for w=e/ε, d=ln(1/δ); implementing `CountMinSketch<T>` from scratch
- **HyperLogLog & Skip Lists & From-Scratch Probabilistic Index**: Approximate distinct count using harmonic mean of leading zeros in hashed values; O(log log N) bits per register; standard error ≈ 1.04/√m for m registers; Redis `PFCOUNT` uses HyperLogLog for unique visitor counts with ~1.5KB for 1% error; Skip Lists: probabilistic BST alternative using layered linked lists, expected O(log N) search/insert/delete, simpler implementation than Red-Black trees; implementing `SkipList<T>` from scratch with coin-flip geometric tower generation

### ⚙️ Core Operations & Internal Logic Deep-Dive: Probabilistic Filters & Skip List Pointer Layers

#### 1. Bloom Filter Multi-Hash Bit Array Toggle & Membership Verification
- **Dimension 1 (Contract & Complexity):** Test set membership of key $x$ across $M$ bits using $K$ independent hash functions. False positive probability $P_{FP} \approx (1 - e^{-Kn/M})^K$; False negative probability: strictly 0. Time Complexity: $\Theta(K)$ bit operations ($O(1)$ for fixed $K$); Space Complexity: $M$ bits ($\approx 9.6$ bits/key for $1\%$ error).
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Kirsch-Mitzenmacher Double Hashing Optimization:
     - Generate two 64-bit base hashes $h_1(x)$ and $h_2(x)$ (e.g., via MurmurHash3).
     - Compute $K$ independent hash positions without $K$ hash evaluations:
       $g_i(x) = (h_1(x) + i \cdot h_2(x)) \pmod M$ for $i = 0, \dots, K-1$.
  2. `Add(key)`:
     - For $i = 0$ to $K - 1$:
       - Calculate bit index: $idx = g_i(key)$.
       - Bit-array mutate: Set bit at $idx$ via bitmask: `buffer[idx >> 6] |= (1UL << (idx & 63))`.
  3. `Contains(key)`:
     - For $i = 0$ to $K - 1$:
       - Calculate bit index: $idx = g_i(key)$.
       - Bit-array query: Check if bit is set: `(buffer[idx >> 6] & (1UL << (idx & 63))) != 0`.
       - If bit is 0: Return `false` (Definitively absent).
     - Return `true` (Probabilistically present).
- **Dimension 3 (Visual State Transition):**
  ```
  Bit Array (M=12, K=3):
  Initial:    [0][0][0][0][0][0][0][0][0][0][0][0]

  Add("apple"):  g0=2, g1=5, g2=9
  State:      [0][0][1][0][0][1][0][0][0][1][0][0]
                     ^        ^              ^
  Add("banana"): g0=5, g1=7, g2=11
  State:      [0][0][1][0][0][1][0][1][0][1][0][1]
                              ^     ^        ^  ^
  Query("orange"): g0=2 (bit=1), g1=7 (bit=1), g2=8 (bit=0!)
  -> Bit 8 is 0! Guarantee: "orange" was NEVER inserted! Return false.
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Zero False-Negative Invariant:* If key $x \in S$, its insertion set bits $g_0(x), \dots, g_{K-1}(x)$ to 1. Since standard Bloom Filters only support 0-to-1 bit flips and never clear bits, all $K$ bits must remain 1 for any previously inserted key. Thus, a bit value of 0 guarantees non-membership.
- **Dimension 5 (Edge Case Matrix):**
  - Saturation ($n \gg M/K$): Bit-array becomes all 1s; false positive rate becomes 100% (always returns `true`), but zero false negative invariant remains intact.
  - $K=1$: Degenerates into a standard bit-set hash table with high collision rate.

#### 2. Skip List Multi-Level Tower Splice & Coin-Flip Growth Transition
- **Dimension 1 (Contract & Complexity):** Ordered dictionary maintaining $L$ levels of forward pointers. Supports `Search`, `Insert`, and `Delete` in expected $\Theta(\log N)$ time, $\Theta(N)$ worst-case; Space Complexity: expected $\Theta(N)$ pointers with geometric decay $p = 1/2$.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. `Search(key)` / Pre-Insert Predecessor Search:
     - Initialize `curr = head`. Allocate `update[0..MAX_LEVEL]`.
     - For level $i = currLevel$ down to 0:
       - While `curr.Forward[i] != null` and `curr.Forward[i].Key < key`:
         - Advance horizontally: `curr = curr.Forward[i]`.
       - Record drop point: `update[i] = curr`.
     - Drop to level $i - 1$.
  2. Coin-Toss Height Generation:
     - Generate randomized tower height: `lvl = 1`.
     - While `Random() < 0.5` and `lvl < MAX_LEVEL`: `lvl++`.
     - If `lvl > currLevel`: Expand `update` array pointers to `head` for levels between `currLevel` and `lvl`.
  3. Pointer Splicing (`Insert`):
     - Instantiate `newNode` with height `lvl`.
     - For $i = 0$ to $lvl - 1$:
       - `newNode.Forward[i] = update[i].Forward[i]`.
       - `update[i].Forward[i] = newNode`.
- **Dimension 3 (Visual State Transition):**
  ```
  Insert Key=17 with Tower Height = 3:
  BEFORE:
  Level 2: [Head] ------------------------------> [25]
  Level 1: [Head] ------------> [10] -------------> [25]
  Level 0: [Head] ---> [5] ---> [10] ---> [15] ---> [25]

  Predecessor vector recorded in update[]:
  update[2] = Head, update[1] = [10], update[0] = [15]

  AFTER SPLICING:
  Level 2: [Head] -------------------> [17] ------> [25]
  Level 1: [Head] ------------> [10] -> [17] ------> [25]
  Level 0: [Head] ---> [5] ---> [10] -> [15] -> [17] [25]
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Geometric Level Bound Invariant:* The probability that a node has height $\ge k$ is $p^k = 2^{-k}$. The expected number of nodes at level $k$ is $N / 2^k$. At the highest expected level $L = \log_2 N$, there are $O(1)$ nodes. Traversing backwards from target to head, each step either climbs up with probability $1 - p = 0.5$ or moves left with probability $p = 0.5$, bounding total expected steps to $O(\log N)$.
- **Dimension 5 (Edge Case Matrix):**
  - Insert duplicate key: Update vector locates existing node at level 0; overwrite value without splicing pointers.
  - Insert smaller than all elements: All `update[i]` pointers point to `head`; inserted as immediate successor to `head`.

## WEEK 63-64: SYSTEM-LEVEL & DISTRIBUTED DATA STRUCTURES
**Translating Algorithms to Large-Scale Production**
### 📐 5W1H Taxonomy: Production Systems & Concurrency Primitives
- **1. WHAT (Contract, Invariants & Misconceptions):**
  - *B-Tree:* Self-balancing $m$-ary search tree where nodes are sized to match hardware block pages (4KB), keeping height very low.
  - *LSM-Tree:* Write-optimized engine combining in-memory `MemTable` + immutable disk `SSTables` + background compaction.
  - *Lock-Free Queue:* Concurrent FIFO queue operating via atomic CAS instructions (`Interlocked.CompareExchange`) without OS thread locks.
  - *Misconception Check:* Lock-free does *not* mean wait-free; concurrent threads may loop (spin) on CAS failures under high contention.
- **2. WHY (Motivation & Bottlenecks Solved):**
  - *Bottleneck Solved:* B-Trees solve the disk-I/O latency bottleneck (~10ms seek); LSM-Trees convert expensive random disk writes into high-throughput sequential appends; Lock-Free queues solve thread starvation and context-switch latency.
- **3. WHEN (Selection Triggers & Failure Modes):**
  - *When to Choose:* Relational database indexing (B-Tree for range scans); write-heavy time-series / event logging (LSM-Tree); ultra-low-latency multithreaded queues.
  - *When to Avoid / Failure Modes:* High write contention on B-Trees causes expensive page splits; LSM-Trees suffer from read amplification and write compaction stalls.
  - *Signal Words:* "Disk page alignment", "write amplification", "lock-free thread synchronization", "consistent hashing ring".
- **4. WHERE (Memory Model & Systems Primitives):**
  - *Physical Architecture:* RAM vs SSD block boundary; CPU cache line false sharing isolation via `[StructLayout(LayoutKind.Explicit)]` padding.
  - *Production Systems:* Postgres & MySQL InnoDB (B+ Trees), SQLite, RocksDB, Apache Kafka, LMAX Disruptor.
- **5. HOW (Operations, Implementation & Spoken Drill):**
  - *Operations Cost Model:* B-Tree search/insert: $O(\log_B N)$ disk seeks; LSM-Tree write: $O(1)$ memory append; Lock-free enqueue/dequeue: atomic $O(1)$ CAS.
  - *Interview Spoken Drill (20–30s):* *"B-Trees minimize disk seeks by packing hundreds of keys per 4KB node, optimal for read-heavy range queries. For write-heavy workloads, I choose LSM-Trees to convert random writes into sequential appends, backed by Bloom filters."*

- **Memory Hierarchy & Cache-Oblivious Algorithms & From-Scratch B-Tree**: L1 (4KB, ~1ns), L2 (256KB, ~4ns), L3 (8MB, ~40ns), RAM (~100ns), SSD (~100μs) latency hierarchy; B-Trees store multiple keys per node to match disk page size (4KB), minimizing I/O levels; cache-oblivious algorithms (van Emde Boas tree layout, funnel sort) perform well at all cache levels without hardcoded parameters; implementing `BTree<TKey, TValue>` node splitting and searching from scratch
- **External Merge Sort at Scale**: Phase 1: read M-byte chunks into RAM, sort in-memory, write sorted runs to disk; Phase 2: K-way merge of sorted runs using a min-heap; total I/O passes = 1 + ⌈log_K(N/M)⌉; with K=32 and 4TB data / 1GB RAM: ~2 passes → very efficient; used in database query processing and MapReduce shuffle
- **Consistent Hashing & Distributed Partitioning & From-Scratch Hash Ring**: Hash space [0, 2³²) forms a ring; servers placed at hash(server_id) positions; each key maps to nearest clockwise server; adding/removing a server remaps only 1/N keys on average (vs modular hashing remaps ~N-1/N keys); virtual nodes (each server → V ring positions) reduce load variance to O(1/√V); implementing `ConsistentHashRing<TServer>` from scratch with binary search ring traversal
- **LSM-Trees (Log-Structured Merge-Trees)**: Write-optimized: all writes go to in-memory MemTable first (O(1)), periodically flushed to immutable SSTables on disk; reads merge MemTable + SSTables (use Bloom Filters to skip SSTables without matching key); compaction strategies: leveled (bounded read amplification) vs size-tiered (bounded write amplification); used in LevelDB, RocksDB, Cassandra, HBase
- **Lock-Free Data Structures & Memory Barriers & From-Scratch Michael-Scott Queue**: Atomic Compare-And-Swap (CAS): `if (current == expected) { current = new; return true }` executed atomically by CPU; ABA problem: CAS can succeed spuriously when value changed A→B→A; fix: versioned/tagged pointers or hazard pointers; Michael-Scott lock-free queue uses two CAS operations for enqueue (append to tail) and one for dequeue (advance head); `Interlocked` class in C# for lock-free atomic operations; implementing `LockFreeQueue<T>` (Michael-Scott queue) from scratch using `Interlocked.CompareExchange`
- **False Sharing & Cache Line Padding**: How independent variables co-located on the same 64-byte cache line cause continuous CPU cache invalidations across cores (MESI protocol thrashing); cache line padding techniques (`[StructLayout(LayoutKind.Explicit)]`) to isolate frequently written concurrent variables; concurrent Skip Lists with lock-free optimistic concurrency
- **B+ Tree vs B-Tree Distinction**: B-Trees store data in both internal and leaf nodes; B+ Trees store all data only in leaf nodes, with internal nodes as pure routing keys; B+ Trees form a linked leaf list enabling range scans in O(K) after O(log_B N) search (B-Trees require tree traversal for ranges); all modern RDBMS indexes (InnoDB, PostgreSQL) use B+ Trees; implementing distinction in `BPlusTree<TKey, TValue>` from scratch with leaf sibling pointers
- **Concurrency Patterns for Data Structures**: Reader-Writer lock (`ReaderWriterLockSlim` in C#): multiple concurrent readers, exclusive writer; compare `lock` (mutual exclusion, simple) vs `ReaderWriterLockSlim` (higher read throughput) vs `Interlocked` (lock-free single variables); Thread-safe collections in .NET: `ConcurrentQueue<T>`, `ConcurrentDictionary<K,V>`, `BlockingCollection<T>` (bounded producer-consumer); `Channel<T>` for async producer-consumer pipelines (preferred over `BlockingCollection` in async code)
- **LMAX Disruptor Ring Buffer**: Lock-free single-producer-single-consumer ring buffer using power-of-2 capacity with bitmask indexing (`index & (capacity-1)` instead of `%`); sequence number per slot eliminates ABA problem; memory barrier (`Thread.MemoryBarrier()` or `Volatile.Read/Write`) ensures visibility; padding to 64 bytes isolates producer and consumer sequence numbers to different cache lines; used in high-frequency trading systems for sub-microsecond latency

### ⚙️ Core Operations & Internal Logic Deep-Dive: High-Throughput Storage & Concurrency Primitives

#### 1. B-Tree Page Node Splitting & Median Key Promotion
- **Dimension 1 (Contract & Complexity):** Insert key into B-Tree of order $M$ (max keys $M - 1$, max children $M$). Guarantees tree height $\le \lceil \log_{\lceil M/2 \rceil} ((N+1)/2) \rceil$. Time Complexity: $O(M \log_M N)$ CPU work, $O(\log_M N)$ disk page fetches; Space Complexity: $\Theta(N)$ stored on disk.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Search leaf page where key belongs, maintaining parent traversal stack.
  2. Insert key in sorted order into leaf page keys array.
  3. Overflow Check: If `leaf.KeyCount == M`:
     - Median Index: $mid = \lfloor (M - 1) / 2 \rfloor$.
     - Median Key: $K_{med} = leaf.Keys[mid]$.
     - Create new sibling page `sibling`.
     - Transfer upper keys `[mid + 1 .. M - 1]` and children to `sibling`.
     - Truncate `leaf` keys to `[0 .. mid - 1]`.
     - Promote $K_{med}$ into parent page along with child pointer to `sibling`.
  4. Cascade upward: If parent overflows, repeat split. If root splits, create new root with 1 key ($K_{med}$) and 2 children; tree height increments by 1.
- **Dimension 3 (Visual State Transition):**
  ```
  Node Splitting on Order M=4 (Max keys = 3):
  Attempt insert 15 into full leaf [10, 20, 30]:
  Temporary state: [10, 15, 20, 30] (Keys = 4 -> OVERFLOW!)

  Median selection: mid = 1 -> Keys[1] = 15 promoted to parent!

  BEFORE SPLIT:
           [Parent: 50]
                /
        [10, 15, 20, 30]

  AFTER SPLIT:
           [Parent: 15, 50]
               /    \
            [10]    [20, 30]
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Degree Bounded Invariant:* Every internal node (except root) maintains at least $\lceil M/2 \rceil - 1$ keys and at most $M - 1$ keys. Splitting an overflowing node with $M$ keys leaves the original node with $\lfloor (M-1)/2 \rfloor$ keys and the sibling with $M - 1 - \lfloor (M-1)/2 \rfloor - 1$ keys, both of which are $\ge \lceil M/2 \rceil - 1$, preserving structural balance.
- **Dimension 5 (Edge Case Matrix):**
  - Root node split: Root is the only node permitted to have fewer than $\lceil M/2 \rceil - 1$ keys; becomes new single-key root, increasing total tree height uniformly for all leaves.
  - Leaf vs Internal Split: Leaf nodes transfer only keys; internal nodes also redistribute child page pointers.

#### 2. Michael-Scott Lock-Free Queue 2-CAS Atomic Enqueue
- **Dimension 1 (Contract & Complexity):** Multi-producer multi-consumer concurrent FIFO queue operating via lock-free Compare-And-Swap (CAS). Time Complexity: Amortized $O(1)$ per enqueue/dequeue; Space Complexity: $O(N)$ heap nodes with sentinel head node.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Allocate new node: `node = new Node(value)`.
  2. Loop (Retry on contention):
     - Read local copies: `tail = this.tail; next = tail.next;`.
     - Consistency Check: Verify `tail == this.tail`. If false, restart loop.
     - Case 1 (Tail lagging behind actual end of queue):
       - If `next != null`: Another thread added a node but hasn't updated `tail`.
       - Help finish the update: `Interlocked.CompareExchange(ref this.tail, next, tail);`.
     - Case 2 (Tail points to actual end of queue):
       - If `next == null`: Attempt to link new node:
         - `if (Interlocked.CompareExchange(ref tail.next, node, null) == null)`:
           - CAS 1 Succeeded! Edge is committed.
           - Attempt CAS 2 (Advance tail): `Interlocked.CompareExchange(ref this.tail, node, tail);`.
           - Enqueue complete; return.
- **Dimension 3 (Visual State Transition):**
  ```
  Two-Phase Atomic Enqueue:
  Initial: [Head] ---> [Node A] === tail points here (tail.next == null)

  PHASE 1: CAS 1 links new node to tail.next:
  [Head] ---> [Node A] ---> [Node B (New)]
                 ^
            tail pointer (lagging)

  PHASE 2: CAS 2 advances tail pointer to Node B:
  [Head] ---> [Node A] ---> [Node B]
                              ^
                         tail pointer (updated!)
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Lock-Free Progress Invariant:* Even if Thread 1 pauses immediately after succeeding at CAS 1 (before executing CAS 2), any concurrent Thread 2 will observe `tail.next != null` (Case 1) and cooperatively advance `this.tail` to `next` before attempting its own insertion. Thus, the system as a whole is guaranteed to make progress regardless of individual thread suspensions.
- **Dimension 5 (Edge Case Matrix):**
  - High thread contention: Failed CAS attempts immediately re-read updated head/tail references and retry without entering OS kernel thread locks.
  - Empty queue state: Always contains dummy sentinel node (`head == tail`), ensuring `tail.next` is never a null reference on empty checks.

## WEEK 65-66: GEOMETRY ALGORITHMS
**Computational Geometry for Interviews & Systems**
- **2D Geometry Primitives**: Point, vector, line, segment, ray representations; dot product `a·b = |a||b|cos θ` (projection, perpendicularity test); cross product magnitude `|a×b| = |a||b|sin θ` (signed area of parallelogram, orientation test); all integer arithmetic avoids floating-point errors in competitive programming
- **Line Sweep Algorithm (Sweep Line)**: Move a vertical line from left to right processing events; events = segment endpoints sorted by x; maintain active segments in a balanced BST (sorted by y at current x); detects segment intersections in O((N+K) log N); applications: area of union of rectangles, closest pair of points, Voronoi diagram construction; interval scheduling and room allocation as degenerate sweep-line problems
- **Segment Intersection (Shamos-Hoey & Bentley-Ottmann)**: Shamos-Hoey: does any pair of N segments intersect? O(N log N) using sweep-line + BST; Bentley-Ottmann: find all K intersections in O((N+K) log N); correctness relies on maintaining proper order of segments between events; avoid floating-point issues with exact arithmetic or symbolic perturbation
- **Point Location & Half-Plane Intersection**: Determining which polygon/region contains a query point; half-plane = set of points on one side of a line; intersection of half-planes = convex polygon; O(N log N) half-plane intersection via angular sweep; applications: visibility polygons, robot workspace computation
- **Polygon Area & Centroid**: Shoelace formula (Gauss's area formula): `Area = |Σ(x_i·y_{i+1} - x_{i+1}·y_i)| / 2` for polygon vertices in order; centroid of polygon; Pick's theorem: `Area = I + B/2 - 1` where I = interior lattice points, B = boundary lattice points; integer-valued areas using `2×Area` to avoid floating point
- **Voronoi Diagram & Delaunay Triangulation**: Voronoi diagram partitions plane into regions where all points in a region are closest to the same seed; Fortune's algorithm constructs Voronoi in O(N log N) via sweep-line with parabola events; Delaunay triangulation = dual of Voronoi; maximizes minimum angle (no sliver triangles); used in mesh generation, nearest-neighbor queries, network coverage optimization
- **Rotating Calipers & Antipodal Pairs**: After convex hull construction O(N log N), rotating calipers traverse antipodal pairs in O(N); computes: diameter of point set, minimum-width bounding rectangle, maximum distance between convex polygons; all O(N log N) total; implementing `RotatingCalipers` from scratch on convex hull output

### ⚙️ Core Operations & Internal Logic Deep-Dive: Computational Geometry & Sweep-Line State Transitions

#### 1. Rotating Calipers Antipodal Pair Traversal & Caliper Parallelism
- **Dimension 1 (Contract & Complexity):** Find maximum distance between any pair of points (diameter) in a convex polygon of $N$ vertices. Time Complexity: $\Theta(N)$ after convex hull construction; Space Complexity: $\Theta(1)$ auxiliary.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Input: Convex polygon vertices $P_0, P_1, \dots, P_{N-1}$ in counterclockwise order.
  2. Find point $k$ with maximum distance from edge $P_0 - P_1$ using cross-product triangle area:
     $Area(P_i, P_j, P_k) = |(P_j.x - P_i.x)(P_k.y - P_i.y) - (P_j.y - P_i.y)(P_k.x - P_i.x)|$.
  3. Advance edge pointer $i = 0$; while $Area(P_i, P_{i+1}, P_{(k+1)\%N}) > Area(P_i, P_{i+1}, P_k)$: $k = (k + 1) \% N$.
  4. Caliper Rotation Loop:
     - For $i = 0$ to $N - 1$:
       - While $Area(P_i, P_{i+1}, P_{(k+1)\%N}) > Area(P_i, P_{i+1}, P_k)$:
         - $k = (k + 1) \% N$.
       - Check distances: $\max(dist(P_i, P_k), dist(P_{i+1}, P_k))$.
- **Dimension 3 (Visual State Transition):**
  ```
  Two Parallel Calipers Clamping Convex Hull:

          Caliper Line L2 (parallel to L1)
              |
              v [Pk] (Antipodal vertex with maximum height)
           .----.
          /      \
         /        \
        '----------'
       [Pi] =====> [Pi+1]
              ^
              |
          Caliper Line L1 (resting on edge Pi -> Pi+1)

  As base edge Pi -> Pi+1 rotates CCW, antipodal apex Pk only advances CCW!
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Unimodal Area Monotonicity:* Because the polygon is strictly convex, the perpendicular distance from edge $P_i - P_{i+1}$ to polygon vertices is unimodal (increases to a single maximum, then decreases). As edge $P_i - P_{i+1}$ rotates counterclockwise, the apex $P_k$ moves strictly counterclockwise. Thus, the index $k$ makes at most 2 full revolutions around the polygon, guaranteeing total operations $\le 3N = O(N)$.
- **Dimension 5 (Edge Case Matrix):**
  - Collinear edge with apex: $Area(P_i, P_{i+1}, P_k) == Area(P_i, P_{i+1}, P_{k+1})$; both $P_k$ and $P_{k+1}$ are verified as valid antipodal candidates.
  - Triangle ($N=3$): Caliper immediately checks all 3 vertex pairs without redundant rotations.

## WEEK 67-68: APPROXIMATION ALGORITHMS & COMPLEXITY THEORY
**Handling NP-Hard Problems in Practice**
### 📐 Complexity Theory Foundations
- **P vs NP & Complexity Classes**: P = problems solvable in polynomial time; NP = problems verifiable in polynomial time; NP-Complete = NP ∩ NP-Hard; NP-Hard = at least as hard as NP-Complete (but may not be in NP); EXP = exponential time; PSPACE = polynomial space; relationships: P ⊆ NP ⊆ PSPACE ⊆ EXP; co-NP = complement problems of NP (e.g. proving a formula is unsatisfiable)
- **NP-Completeness Proofs via Reduction**: To prove problem B is NP-Complete: (1) show B ∈ NP (polynomial verifier), (2) choose known NP-Complete problem A, (3) construct polynomial-time reduction f: A → B; canonical reductions: 3-SAT → Independent Set → Vertex Cover → Clique → Hamiltonian Cycle → TSP; recognizing NP-Complete structure: "partition into equal subsets" (Partition), "find path visiting all nodes" (Hamiltonian), "minimum coloring" (Graph Coloring)
- **Approximation Algorithms**: When exact solution is NP-Hard, seek polynomial-time algorithm with provable approximation ratio ρ; ρ-approximation: output ≤ ρ·OPT for minimization (or ≥ OPT/ρ for maximization); PTAS (Polynomial-Time Approximation Scheme): for any ε>0, (1+ε)-approximation in poly(N) time; FPTAS: PTAS with runtime also polynomial in 1/ε
- **Greedy Approximation Examples**: Vertex Cover: pick any uncovered edge, add both endpoints → 2-approximation (OPT ≥ |matching| and greedy ≤ 2|matching|); Set Cover: greedily pick set covering most uncovered elements → H_N-approximation (H_N = harmonic number ≈ ln N), tight lower bound unless P=NP; Metric TSP: minimum spanning tree + Euler tour → 2-approximation; Christofides algorithm → 3/2-approximation using MST + minimum weight perfect matching
- **Local Search & Simulated Annealing**: Local search: start with feasible solution, iteratively apply local improvements; terminates at local optimum; 2-OPT for TSP: swap two edges if it reduces total cost, O(N²) per iteration; Simulated Annealing: accept worsening moves with probability `e^(-ΔE/T)` where T decreases over time; escapes local optima with high probability; convergence guaranteed with slow-enough cooling schedule (Markov chain analysis)
- **Parameterized Complexity & Fixed-Parameter Tractable (FPT)**: Problem with parameter k is FPT if solvable in f(k)·poly(N) time; k-Vertex Cover: O(2^k · N) by branch-and-bound; k-Path: color-coding technique O(2^k · E); W-hierarchy: W[1]-hard problems likely not FPT; practical use: when k is small (e.g., treewidth of network graph is small), FPT algorithms are efficient

## WEEK 69-70: CONCURRENCY & PARALLEL ALGORITHMS
**Multi-Core & Distributed Computing Patterns**
- **Concurrency vs Parallelism**: Concurrency = logical simultaneous progress (managed by OS context switching); Parallelism = physical simultaneous execution on multiple CPU cores; .NET thread pool vs manual thread creation; `Task<T>` and `async/await` for I/O-bound concurrency; `Parallel.For` / `PLINQ` for CPU-bound parallelism
- **Memory Models & Visibility**: C# memory model: `volatile` keyword prevents reordering across reads/writes; `Interlocked` operations: atomic read-modify-write; `Monitor.Enter/Exit` (`lock`) generates full memory barriers; `Thread.MemoryBarrier()` for fine-grained control; CLR memory model is weaker than Java (no sequential consistency guarantee without explicit synchronization)
- **Parallel Prefix Sum (Scan)**: Phase 1 (Up-sweep / Reduce): build reduction tree in O(log N) parallel steps; Phase 2 (Down-sweep / Distribute): distribute prefix values down the tree in O(log N) parallel steps; total O(N) work, O(log N) depth on N processors; used in GPU parallel reductions, parallel sorting, and parallel BFS; implementing work-efficient parallel scan
- **Parallel BFS & Graph Traversal**: Level-synchronous BFS: all frontiers of distance d processed in parallel before advancing to d+1; `Parallel.ForEach` over current frontier; visited set requires `ConcurrentHashSet` or `Interlocked.CompareExchange` on a boolean array; Δ-stepping: bucket-based parallel Dijkstra for near-linear expected time on real-world graphs
- **Work-Stealing Schedulers**: Thread pool threads steal tasks from the tail of other threads' deques when idle; `Task` in .NET uses CLR work-stealing thread pool; implementing a `WorkStealingDeque<T>` (Chase-Lev deque) from scratch: owner pushes/pops at bottom, thieves steal from top using CAS; enables O(1) amortized cost per task with O(P · D) steal operations for P threads and D task depth
- **Producer-Consumer Patterns**: Bounded buffer via `SemaphoreSlim` (count = buffer capacity, producer waits when full, consumer waits when empty); `Channel<T>` (preferred in modern C#): `CreateBounded(capacity)` / `CreateUnbounded()`; `BlockingCollection<T>` for legacy code; rate limiting via token bucket algorithm (refill tokens at rate r, consume 1 per request, block when empty)
- **Parallel Sorting & Merge**: Parallel merge sort: split array in half, sort each half on separate tasks, merge sequentially → O(N log N / P + N) with P processors; parallel merge: binary-search to split the merge into independent sub-merges → O(N/P + log N) merge step; `PLINQ.OrderBy()` = parallel merge sort + final merge pass; when to prefer vs sequential: N > 10^6 and multi-core available

### ⚙️ Core Operations & Internal Logic Deep-Dive: Lock-Free Task Scheduling & Work-Stealing Mechanics

#### 1. Chase-Lev Work-Stealing Deque: Local Push/Pop vs Concurrent CAS Steal
- **Dimension 1 (Contract & Complexity):** Double-ended task queue owned by a single worker thread, allowing concurrent worker threads (thieves) to steal tasks from the opposite end. Time Complexity: $O(1)$ amortized for owner `Push`/`Pop`, $O(1)$ atomic CAS for thief `Steal`; Space Complexity: $\Theta(\text{capacity})$ circular buffer.
- **Dimension 2 (Step-by-Step Algorithmic Logic):**
  1. Memory layout: Circular buffer with `top` (read/written by thieves and owner) and `bottom` (written only by owner).
  2. `Push(task)` (Worker thread only):
     - `b = bottom; t = top;`
     - If $b - t \ge capacity$: Resize circular buffer.
     - Store task: `buffer[b & mask] = task;`
     - Volatile store barrier: `bottom = b + 1;`
  3. `Pop()` (Worker thread only - LIFO order for cache locality):
     - `b = bottom - 1; bottom = b; Thread.MemoryBarrier(); t = top;`
     - If $b < t$: Empty queue; `bottom = t; return null;`
     - If $b > t$: Multiple tasks exist; `return buffer[b & mask];` (Zero contention!)
     - If $b == t$: Exactly 1 task left! Potential race with concurrent thieves:
       - `if (Interlocked.CompareExchange(ref top, t + 1, t) == t)`: Won race! `bottom = t + 1; return buffer[b & mask];`
       - Else: Lost race to thief; `bottom = t + 1; return null;`
  4. `Steal()` (Thief threads - FIFO order for broad granularity):
     - `t = top; Thread.MemoryBarrier(); b = bottom;`
     - If $t \ge b$: Empty; return `null`.
     - `task = buffer[t & mask];`
     - `if (Interlocked.CompareExchange(ref top, t + 1, t) == t)`: Stole successfully! Return `task`.
     - Else: Contention with owner or other thief; return `null` (retry).
- **Dimension 3 (Visual State Transition):**
  ```
  Chase-Lev Deque Dual-Ended Invariant:

  Thieves STEAL (FIFO)               Owner PUSH / POP (LIFO)
         |                                    |
         v                                    v
     +-------+-------+-------+-------+-------+-------+
     |   T0  |   T1  |   T2  |   T3  |   T4  |   T5  |
     +-------+-------+-------+-------+-------+-------+
       ^                                       ^
     top                                     bottom

  Contention happens ONLY when top == bottom - 1 (1 task remaining)!
  In all other states, Owner operates without any CAS or locks!
  ```
- **Dimension 4 (Invariant Preservation Proof):**
  *Asymmetric Synchronization Invariant:* The owner only uses CAS when the queue contains exactly 1 task ($b == t$). In all other cases ($b > t$), the index separation guarantees that the slot accessed by the owner ($b$) is distinct from the slot accessed by thieves ($t$). Full memory barriers ensure `top` and `bottom` index stores are never reordered by the CPU out-of-order execution pipeline.
- **Dimension 5 (Edge Case Matrix):**
  - Empty steal attempt ($t \ge b$): Returns `null` immediately without mutating any state.
  - Multi-thief contention: Exactly one thief succeeds via CAS; all losing thieves return `null` without corrupting queue indices.

## 📊 PATTERN DECISION TREE (Quick-Reference)
**Signal Word → Pattern → Data Structure Selection Guide**

| Problem Signal Words | Primary Pattern | Key Data Structure | Complexity Target |
| :--- | :--- | :--- | :--- |
| "contiguous subarray", "window of size K" | Sliding Window | Array + Two Pointers / Deque | O(N) |
| "pair sum", "sorted array + target" | Two Pointers | Array (sorted) | O(N) |
| "subarray sum = K", "prefix difference" | Prefix Sum + HashMap | `Dictionary<int,int>` | O(N) |
| "binary search", "sorted + find boundary" | Binary Search | Array | O(log N) |
| "monotone feasibility", "minimize maximum" | Binary Search on Answer | Custom predicate | O(N log N) |
| "next greater", "nearest smaller", "histogram" | Monotonic Stack | `ArrayStack<int>` | O(N) |
| "sliding window max/min" | Monotonic Deque | `CircularArrayDeque<int>` | O(N) |
| "level order", "shortest path unweighted" | BFS | `Queue<T>` | O(V+E) |
| "topological order", "dependency scheduling" | Kahn's / DFS Post-order | `int[] inDegree` + Queue | O(V+E) |
| "shortest path non-negative weights" | Dijkstra | `PriorityQueue<T>` | O((V+E) log V) |
| "shortest path negative weights" | Bellman-Ford | Array | O(VE) |
| "minimum spanning tree" | Kruskal / Prim | DSU / `PriorityQueue` | O(E log E) |
| "top K elements", "K-th largest" | Heap | `MinHeap<T>` size K | O(N log K) |
| "frequency count", "two sum", "duplicates" | Hash Table | `Dictionary<K,V>` | O(N) |
| "sorted dynamic set", "floor/ceil", "range" | Balanced BST | `SortedSet<T>` | O(log N) |
| "prefix search", "autocomplete", "word dict" | Trie | `Trie` | O(M) per op |
| "range sum/min/max query + updates" | Segment Tree / Fenwick | `SegmentTree` / `FenwickTree` | O(log N) |
| "K-th ancestor", "LCA queries" | Binary Lifting | `int[][] anc` | O(N log N) build |
| "count ways", "optimal value", "overlapping" | Dynamic Programming | dp array / memo dict | problem-specific |
| "generate all subsets / permutations" | Backtracking | Recursive + undo | O(k^N) |
| "connected components", "union-find" | Disjoint Set Union | `DisjointSetUnion` | O(α(N)) |
| "max flow", "min cut", "matching" | Network Flow | Residual graph | O(V²E) / O(E√V) |
| "string pattern matching" | KMP / Z-algorithm | `int[] π` / `int[] Z` | O(N+M) |
| "multiple pattern search" | Aho-Corasick | Trie + failure links | O(N+Σpatterns) |
| "all palindromic substrings" | Manacher / Eertree | `int[] P` radius array | O(N) |
| "approximate membership", "frequency stream" | Probabilistic | Bloom Filter / CMS | O(k) hash ops |
| "disk-efficient index", "range scan" | B+ Tree | Node with multiple keys | O(log_B N) |
| "write-heavy storage", "log-structured" | LSM-Tree | MemTable + SSTables | O(1) write |
| "NP-Hard detected" | Approximation / FPT | Greedy ρ-approx or 2^k·N | provable ratio |

## 📝 AMORTIZED ANALYSIS CHEAT SHEET
**Master Methods for Proving Amortized Costs**

| Method | How It Works | When to Use | Example |
| :--- | :--- | :--- | :--- |
| **Aggregate Method** | Sum total cost of N operations ÷ N | All operations have same amortized cost | Dynamic array: N pushes total O(N) work → O(1) each |
| **Accounting Method** | Charge extra "credit" to cheap ops; spend credit during expensive ops | Natural credit assignment | Push: charge 2 (1 for work + 1 stored credit); doubling: use stored credits |
| **Potential Method** | Define Φ(state); amortized cost = actual + ΔΦ | Precise analysis, arbitrary ops | Dynamic array: Φ = 2·Count - Capacity; Stack/Queue decomposition |
| **Banker's Method** | Prepay for future work; invariant: each object holds enough prepaid credit | Data structure invariant proofs | Splay trees: O(log N) amortized via potential = Σ log(subtree size) |

**Key Amortized Results to Know Cold:**
- Dynamic Array push: O(1) amortized (2× doubling)
- Stack-based operations (monotonic stack): O(N) total = O(1) amortized per element (each element pushed/popped once)
- `TwoStackQueue` dequeue: O(1) amortized (each element moved at most once across stacks)
- Splay tree access: O(log N) amortized (zig-zig rotation potential argument)
- `DisjointSetUnion` with path compression + union by rank: O(α(N)) amortized per operation
- Fibonacci heap insert / decrease-key: O(1) amortized; extract-min: O(log N) amortized

## 📊 LEET CODE PROBLEM MAPPINGS PER WEEK (Canonical 3-Problem Sets)

| Week(s) | Topic | Easy (Warmup) | Medium (Core) | Hard (Stretch) |
| :--- | :--- | :--- | :--- | :--- |
| 1-3 | Arrays & Strings | #1 Two Sum, #217 Contains Duplicate | #15 3Sum, #11 Container With Most Water | #42 Trapping Rain Water |
| 1-3 | Sliding Window | #643 Max Avg Subarray I | #3 Longest Substring Without Repeat, #567 Permutation in String | #76 Minimum Window Substring |
| 1-3 | Kadane / Subarray | #53 Maximum Subarray | #152 Maximum Product Subarray | #363 Max Sum of Rectangle |
| 4-5 | Binary Search | #704 Binary Search | #33 Search in Rotated Sorted Array, #153 Find Min in Rotated | #4 Median of Two Sorted Arrays |
| 4-5 | Binary Search on Answer | — | #875 Koko Eating Bananas, #1011 Capacity to Ship | #410 Split Array Largest Sum |
| 4-5 | 2D Matrix | #73 Set Matrix Zeroes | #54 Spiral Matrix, #48 Rotate Image | #85 Maximal Rectangle |
| 6-7 | Linked List | #206 Reverse Linked List | #19 Remove Nth from End, #143 Reorder List | #25 Reverse Nodes in K-Group |
| 6-7 | Fast/Slow Pointers | #141 Linked List Cycle | #142 Linked List Cycle II, #287 Find Duplicate | — |
| 8-9 | Stack | #20 Valid Parentheses | #155 Min Stack, #739 Daily Temperatures | #84 Largest Rectangle in Histogram |
| 8-9 | Queue / BFS | #933 Number of Recent Calls | #102 Binary Tree Level Order, #994 Rotting Oranges | #239 Sliding Window Maximum |
| 10-12 | Binary Tree | #104 Max Depth, #226 Invert Tree | #105 Construct from Preorder+Inorder, #236 LCA | #124 Binary Tree Max Path Sum |
| 13-15 | BST | #700 Search in BST | #98 Validate BST, #230 Kth Smallest | #315 Count of Smaller Numbers After Self |
| 13-15 | Trie | #208 Implement Trie | #211 Word Dictionary (Regex), #212 Word Search II | #336 Palindrome Pairs |
| 16-17 | Heap / Priority Queue | #703 Kth Largest in Stream | #215 Kth Largest Element, #347 Top K Frequent | #295 Find Median from Data Stream |
| 18-19 | Hash Table | #1 Two Sum, #242 Valid Anagram | #49 Group Anagrams, #128 Longest Consecutive | #432 All O'one Data Structure |
| 20-23 | Graph BFS/DFS | #200 Number of Islands | #133 Clone Graph, #207 Course Schedule | #269 Alien Dictionary |
| 24-26 | Shortest Paths | — | #743 Network Delay Time (Dijkstra) | #787 Cheapest Flights K Stops |
| 24-26 | DSU / MST | — | #547 Number of Provinces, #684 Redundant Connection | #1584 Min Cost to Connect All Points |
| 27-30 | Backtracking | #78 Subsets | #39 Combination Sum, #46 Permutations | #37 Sudoku Solver, #51 N-Queens |
| 31-36 | 1D DP | #70 Climbing Stairs, #198 House Robber | #300 LIS, #139 Word Break | #10 Regular Expression Matching |
| 31-36 | 2D DP | — | #62 Unique Paths, #1143 LCS, #72 Edit Distance | #97 Interleaving String |
| 31-36 | Knapsack | — | #416 Partition Equal Subset Sum | #474 Ones and Zeroes, #879 Profitable Schemes |
| 37-39 | Divide & Conquer | — | #148 Sort List, #240 Search 2D Matrix II | #23 Merge K Sorted Lists |
| 40-42 | Greedy | #455 Assign Cookies | #435 Non-Overlapping Intervals, #763 Partition Labels | #630 Course Schedule III |
| 43-44 | Bit Manipulation | #136 Single Number | #137 Single Number II, #260 Single Number III | #318 Max Product of Word Lengths |
| 45-46 | Math | #204 Count Primes | #372 Super Pow, #50 Pow(x,n) | #149 Max Points on a Line |
| 53-54 | Advanced Strings | — | #28 Find Index of Pattern (KMP) | #336 Palindrome Pairs, #65 Valid Number |
| 55-56 | Range Queries | — | #307 Range Sum Query Mutable (Fenwick) | #218 Skyline Problem, #308 Range Sum Query 2D |
| 57-58 | Network Flow | — | #200 Islands (DSU warmup) | #1168 Optimize Water Distribution, #1579 Remove Max Edges |
| 59-60 | Advanced DP | — | #264 Ugly Number II, #1235 Maximum Profit Scheduling | #1960 Digit DP Problems |

## 🛠️ FROM-SCRATCH IMPLEMENTATION TESTING FRAMEWORK
**Unit Test Suite Standards for Every Container**

Every from-scratch implementation must pass the following standardized test suites before a topic is considered complete:

### Required Test Categories:
1. **Empty container invariants**: Operations on empty container must throw appropriate exceptions or return sentinel values (not crash with NullReferenceException)
2. **Single element**: Insert, access, and remove the only element; container returns to empty state
3. **Boundary transitions**: Fill exactly to capacity, trigger one resize/rehash, verify all elements survive
4. **Sorted input stress test**: Insert N=10,000 elements in ascending and descending order; verify height/balance invariants for tree structures
5. **Random input correctness**: Insert 10,000 random elements, compare output with .NET BCL equivalent (`List<T>`, `Dictionary<K,V>`, `SortedSet<T>`, etc.)
6. **Fail-fast enumerator**: Modify container during `foreach` loop; verify `InvalidOperationException` is thrown via `_version` check
7. **GC reference loitering**: After removing elements, verify array slots contain `default(T)` (not lingering references) using reflection-based inspection
8. **Thread safety (where applicable)**: Concurrent inserts/removes from multiple threads; verify no torn reads, lost updates, or deadlocks using `Interlocked` / `lock` per design
9. **Performance baseline**: Measure P99 latency for 1,000,000 operations; compare against BCL equivalent; flag if >2× slower
10. **Edge type parameters**: Test with `int` (value type), `string` (reference type), and `record struct` (user-defined value type) to verify generic constraints work correctly

### C# Test Boilerplate Template:
```csharp
// xUnit test class template for every from-scratch container
public class {ContainerName}Tests
{
    [Fact] public void Empty_Count_IsZero() { ... }
    [Fact] public void SingleInsert_ThenRemove_ReturnsEmpty() { ... }
    [Fact] public void BoundaryFill_ThenResize_AllElementsSurvive() { ... }
    [Theory, InlineData(10_000)] public void Sorted_Insert_CorrectOrder(int N) { ... }
    [Fact] public void Enumerator_ModifyDuringIteration_ThrowsInvalidOp() { ... }
    [Fact] public void GCLoitering_RemovedSlots_ContainDefault() { ... }
    [Fact] public void RandomOps_MatchesBCLEquivalent() { ... }
}
```

## ✅ SUCCESS METRICS:
- [ ] Can identify problem type and approach in 30 seconds from problem statement signal words
- [ ] Can implement optimal solutions for medium problems without hints in ≤20 minutes
- [ ] Can solve hard problems with hints in reasonable time, explaining trade-offs
- [ ] Can explain time/space complexity instantly WITH the derivation (not just the answer)
- [ ] Can optimize brute force to optimal systematically, narrating each step
- [ ] Can handle edge cases (empty input, single element, overflow, duplicates, surrogate pairs) proactively
- [ ] Can code cleanly under pressure — meaningful names, no magic numbers, guard clauses
- [ ] Can explain solutions clearly and answer follow-up questions from interviewers
- [ ] Can prove algorithm correctness (invariant, induction, cut-and-paste, or exchange argument) when asked
- [ ] Can connect any algorithm to a real-world system design scenario (caching, storage, indexing, concurrency)

## ENHANCED LEARNING STRATEGY:
### **Pattern Recognition Framework**
For every problem:
1. **Problem type identification**: What category does this belong to? Look for signal words in the problem statement.
2. **Data structure selection**: What's the most appropriate structure? What invariant does it maintain that maps to this problem's constraint?
3. **Algorithm choice**: Which technique fits best? Start with brute force, identify the bottleneck, then optimize.
4. **Complexity analysis**: What are the time/space requirements? Derive, don't guess — use Master Theorem, potential method, or amortized analysis.
5. **Correctness verification**: Can you state the loop invariant, cut property, or prove the greedy choice property?
6. **Optimization opportunities**: Space compression, early termination, precomputation trade-offs.

### **Implementation Strategy**
1. **Understand the problem**: Read carefully, identify constraints (N up to 10^5? 10^9?), clarify ambiguities
2. **Discuss approaches**: Brute force → identify bottleneck → optimal; state complexity for each
3. **Code the solution**: Clean, readable C# with meaningful variable names
4. **Test thoroughly**: Walk through one normal example + at least one edge case manually
5. **Optimize if needed**: Space/time improvements, consider CLR-specific optimizations (Span<T>, stackalloc, memory alignment)

### **Debugging Methodology**
- **Systematic testing**: Start with simplest case (empty, single element), then small examples, then large
- **Edge case checklist**: Empty inputs, single elements, all-same elements, negative numbers, integer overflow, Unicode surrogate pairs
- **Complexity verification**: Count actual operations on a small example and verify Big-O matches
- **Off-by-one audits**: Array bounds (`<` vs `<=`), index initialization, loop termination conditions

## KEY RESOURCES:
- **LeetCode**: Primary practice platform — use "study plans" organized by topic, filter by pattern after each week
- **CSES Problem Set** (cses.fi): Structured competitive-level problems for advanced topics (Weeks 53-64)
- **cp-algorithms.com**: Deep theoretical explanations for advanced algorithms with mathematical proofs
- **Books**: "Introduction to Algorithms" (CLRS) for formal proofs; "Elements of Programming Interviews in C#" for interview format
- **Visualizations**: visualgo.net for interactive algorithm animation; algorithm-visualizer.org for step-by-step traces
- **Practice**: Daily coding, mock interviews with time pressure, explain-out-loud rubber duck debugging

## ADVANCED OPTIMIZATION (After Mastery):
- **Competitive programming**: ICPC-style contest problems, Codeforces Div 1 / Div 2, advanced techniques (Aliens Trick, Slope Trick, CDQ Divide and Conquer)
- **Research algorithms**: Approximation algorithms (PTAS, FPTAS), streaming algorithms with provable guarantees, online algorithms and competitive ratio analysis
- **Parallel & concurrent algorithms**: Lock-free and wait-free data structures, parallel prefix sums, parallel sorting (bitonic sort, parallel merge), GPU computing considerations
- **System-level optimization**: Cache-oblivious algorithm design, SIMD vectorization awareness, memory allocator behavior, GC tuning for latency-sensitive C# applications
