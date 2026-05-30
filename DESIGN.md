# DESIGN.md

A stack-agnostic design system for building polished, accessible, modern product interfaces.

Source of truth for UI generation, product design, implementation planning, visual QA, and AI coding agents. Combines disciplined tokens, strong
product UX, warm editorial polish, and strict anti-drift rules without depending on any framework, language, component kit, styling library,
icon package, or design tool.

---

## 0. Machine-Readable Brief

```yaml
version: 3.0
name: Best Stack-Agnostic Product Design System
purpose: Generate polished, accessible, production-ready product interfaces.
stack_policy:
  dependency: none
  rule: Do not assume any framework, runtime, styling library, component kit, icon package, or design tool.
  adapter_requirement: Map tokens and component specs into the project's existing primitives.
personality:
  mood: calm confidence
  density: medium-low default, medium-high for dashboards
  brand_feel: premium, useful, intelligent, trustworthy
  interaction_feel: fast, precise, intentional
  visual_style: neutral-first surfaces, crisp borders, soft depth, restrained accent
priority_order:
  - user explicit request
  - product and page purpose
  - accessibility and usability
  - token consistency
  - responsive/adaptive behavior
  - platform conventions
  - visual polish
hard_rules:
  - Do not invent colors, radii, shadows, typography, or spacing unless requested.
  - One primary action per visual area.
  - Accent color is meaning, not decoration.
  - Product-like content, never lorem ipsum.
  - Generate default, hover/press, focus, active, disabled, loading, empty, error, success states.
  - Respect keyboard navigation, assistive tech, touch targets, reduced motion.
  - Dark mode must be designed, not inverted.
  - Implement with the host project's existing stack.
```

---

## 1. Stack-Agnostic Contract

This document defines design intent, tokens, behavior, quality bars, and page patterns. It does not prescribe implementation technology.

| Allowed | Not allowed |
|---|---|
| Token names, values, contrast roles | A named framework or runtime |
| Type scale, weights, line heights | A named UI kit or component library |
| Spacing, grids, density, responsive behavior | A named styling system |
| Component anatomy, states, behavior | A named icon or font package |
| Motion durations, easing feel | A named build tool |

### Adapter rule

Translate tokens into whatever the host project already uses (theme objects, native resources, design-tool variables, CSS custom properties). Do
not introduce a new dependency to satisfy this guide.

| Token category | Becomes in a project |
|---|---|
| Color | Theme values, native color resources, design-tool variables |
| Type | Text styles, typography scale, native text appearances |
| Spacing | Layout constants, sizing resources, grid variables |
| Radius | Shape styles, corner radius constants |
| Elevation | Shadow styles, native elevation values |
| Motion | Animation constants, transition presets |
| Components | Local components, design-tool components, native views |

---

## 2. Design DNA

The interface should feel like a real product built by a careful senior product designer.

Combined strengths from production design systems:

- **Vercel-like precision**: black/white restraint, crisp hairlines, technical labels.
- **Linear-like discipline**: one accent, dark surface ladder, product visuals as proof.
- **Stripe-like polish**: tasteful gradients, tabular numerics, clear conversion paths.
- **Apple-like whitespace**: generous rhythm, strong scale, calm hierarchy.
- **Notion-like warmth**: approachable copy, warm surfaces, friendly empty states.
- **Supabase-like developer clarity**: code-first surfaces, restrained technical presentation.
- **Claude/Cursor-like editorial warmth**: human tone, warm canvas option.

### Core feeling

Premium but approachable. Minimal but not empty. Technical but humane. Calm, fast, trustworthy. Sharp in structure, soft in detail.

### Philosophy

1. Clarity is the highest aesthetic.
2. The next action must be obvious.
3. Whitespace creates structure, not emptiness.
4. Borders and surface contrast come before heavy shadows.
5. Accent color is a signal, not decoration.
6. Gradients appear only in signature moments.
7. Motion explains change; it never distracts.
8. Product UI evidence is stronger than abstract decoration.
9. Every screen includes important states.
10. The system feels coherent across marketing, app, docs, and mobile.

---

## 3. Usage Boundaries

**Best suited for**: AI SaaS, developer tools, productivity, dashboards, analytics, internal tools, docs, pricing, auth, landing pages, mobile
companions.

**Not without adaptation**: playful consumer apps, children's products, luxury fashion, photo-first lifestyle apps, games.

### Brand modes

Pick one. For full token recipes (canvas + accent + type + radius + motion together), see §20.

| Mode | Use for | Key adjustments |
|---|---|---|
| `default-product` | SaaS, AI, dashboards | Neutral, indigo accent, subtle gradients |
| `developer` | APIs, dev tools, docs | More mono, code blocks, less decoration |
| `enterprise` | B2B, security, finance | Less gradient, stronger structure |
| `creator` | Creator/collaboration tools | Warmer surfaces, friendlier copy |
| `ai-native` | AI agents, copilots | Tool-status chips, provenance, progressive states |
| `data-heavy` | Analytics, ops | Denser tables, tabular numerals, fewer cards |

---

## 4. Color System

Neutral-first palette, one vivid accent family, semantic status colors. Neutrals carry 80-90% of the interface.

### Light theme

| Token | Value | Role |
|---|---:|---|
| `background` | `#FAFAF8` | Main canvas, warm off-white |
| `background-cool` | `#F7F8FA` | Cooler canvas for enterprise/data |
| `surface` | `#FFFFFF` | Cards, panels, sheets |
| `surface-muted` | `#F4F4F1` | Secondary panels |
| `surface-raised` | `#FFFFFF` | Menus, dialogs, floating panels |
| `surface-inset` | `#F1F1EE` | Recessed inputs, code frames |
| `surface-featured` | `#181715` | Polarity-flipped tier (recommended pricing) |
| `border` | `#E6E4DE` | Default border |
| `border-strong` | `#D4D0C7` | Hover, focus, emphasized structure |
| `border-subtle` | `#EFEEE9` | Dividers, low-emphasis lines |
| `text-primary` | `#111111` | Main text |
| `text-secondary` | `#55524C` | Body copy, descriptions |
| `text-muted` | `#8A867C` | Hints, timestamps, placeholders |
| `text-disabled` | `#AAA69C` | Disabled text |
| `text-inverse` | `#FFFFFF` | Text on dark fills |
| `primary` | `#111111` | Main CTA fill |
| `primary-hover` | `#2A2A2A` | Primary hover |
| `accent` | `#635BFF` | Links, focus, selected, key metrics |
| `accent-hover` | `#574FE8` | Accent hover |
| `accent-soft` | `#EFEEFF` | Accent background |
| `accent-strong` | `#4F46E5` | High-emphasis accent text/icon |
| `on-primary-strong` | `#0B0B0B` | Dark text on bright accent (lit-from-within button) |
| `success` | `#16A34A` | Positive state |
| `success-soft` | `#DCFCE7` | Positive background |
| `warning` | `#F59E0B` | Warning state |
| `warning-soft` | `#FEF3C7` | Warning background |
| `danger` | `#DC2626` | Error/destructive |
| `danger-soft` | `#FEE2E2` | Error background |
| `info` | `#0284C7` | Informational |
| `info-soft` | `#E0F2FE` | Informational background |
| `code-bg` | `#0B0D10` | Technical surface |
| `code-border` | `#24272E` | Technical surface border |
| `code-text` | `#F7F7F5` | Technical surface text |

### Dark theme

| Token | Value | Role |
|---|---:|---|
| `background` | `#08090A` | Main canvas |
| `surface` | `#111214` | Cards, panels |
| `surface-muted` | `#181A1D` | Secondary panels |
| `surface-raised` | `#1D1F23` | Floating panels, dialogs |
| `surface-inset` | `#0D0F12` | Recessed inputs, code frames |
| `surface-featured` | `#0A0A0B` | Polarity-flipped tier on dark |
| `border` | `#2A2D33` | Default border |
| `border-strong` | `#3A3F47` | Stronger border |
| `border-subtle` | `#202329` | Dividers |
| `text-primary` | `#F7F7F5` | Main text |
| `text-secondary` | `#B7B8BC` | Body copy |
| `text-muted` | `#7D828A` | Hints, metadata |
| `text-disabled` | `#5F656E` | Disabled text |
| `primary` | `#FFFFFF` | Main CTA fill |
| `accent` | `#8B7CFF` | Links, focus, selected |
| `accent-soft` | `#1D1A3D` | Accent background |
| `accent-strong` | `#A799FF` | High-emphasis accent |
| `success` | `#22C55E` | Positive |
| `success-soft` | `#0F2E1A` | Positive background |
| `warning` | `#FBBF24` | Warning |
| `danger` | `#F87171` | Error |
| `info` | `#38BDF8` | Informational |

### Validated brand-accent palette

When a project needs a different accent, prefer one of these production-tested values over inventing a new hex.

| Name | Light | Dark | Source |
|---|---:|---:|---|
| Indigo voltage | `#635BFF` | `#8B7CFF` | Stripe |
| Coral warmth | `#CC785C` | `#E89B82` | Anthropic |
| Lavender-blue | `#5E6AD2` | `#828FFF` | Linear |
| Action blue | `#0066CC` | `#2997FF` | Apple |
| Emerald functional | `#3ECF8E` | `#22C55E` | Supabase |
| Electric green | `#00D992` | `#00D992` | VoltAgent |
| Notion purple | `#5645D4` | `#8B7CFF` | Notion |
| Cursor orange | `#F54E00` | `#FF7A3D` | Cursor |
| Spotify green | `#1ED760` | `#1ED760` | Spotify |
| Rosso Corsa | `#DA291C` | `#DA291C` | Ferrari |
| Rausch | `#FF385C` | `#FF5A75` | Airbnb |

### Gradient tokens

Use sparingly: hero, onboarding, important empty states, signature AI moments.

| Token | Direction | Stops |
|---|---|---|
| `gradient-primary` | 135° | `#635BFF 0%`, `#8B5CF6 45%`, `#06B6D4 100%` |
| `gradient-cool` | 135° | `#06B6D4 0%`, `#635BFF 55%`, `#111827 100%` |
| `gradient-warm` | 135° | `#FF7A59 0%`, `#F59E0B 50%`, `#FDE68A 100%` |
| `gradient-subtle-light` | radial | indigo + cyan, very low opacity |
| `gradient-subtle-dark` | radial | violet + cyan, very low opacity |

### Process-state palette (AI / async work)

For multi-stage workflows (agent loops, builds, indexing). Soft tint = chip background, strong tint = icon/dot.

| Stage | Tint | Strong |
|---|---:|---:|
| Thinking / planning | `#E8DCFF` | `#9B7CFF` |
| Searching / grep | `#D9F0DC` | `#5FA866` |
| Reading / context | `#D6E4F4` | `#4F7FBF` |
| Editing / writing | `#E8D9F0` | `#9B6BC4` |
| Running / executing | `#FFE3B0` | `#C08532` |
| Done | `#DCFCE7` | `#16A34A` |

### Color rules

- Neutrals carry 80-90% of the interface.
- `accent` for selected, focus, inline links, key metrics.
- `primary` for primary CTAs, not every highlight.
- Gradients only for hero, onboarding, empty states, signature AI moments.
- Status colors are never decorative.
- One saturated accent per component (exception: data viz, AI status timeline).
- In dark mode, prioritize surface separation and text contrast over saturation.

---

## 5. Typography System

| Role | Quality | Fallback |
|---|---|---|
| Display | Modern, confident, slightly condensed | Brand font or platform default heading |
| Body | Highly readable neutral sans | Platform default sans |
| Mono | Clear technical monospace | Platform default monospace |

Do not require a downloadable font package. Mono is reserved for code, IDs, shortcuts, logs, terminal output, technical eyebrows. Use tabular
numerals for all metrics, prices, percentages, timestamps.

### Type scale

Display tracking is intentionally aggressive (4-5% of size at hero scale). This is the single biggest separator between premium and generic
systems.

| Token | Size | Line | Weight | Tracking | Usage |
|---|---:|---:|---:|---:|---|
| `display-2xl` | 96 | 0.95 | 600 | -0.060em | Editorial campaign hero |
| `display-xl` | 72 | 1.00 | 600 | -0.055em | Large marketing hero |
| `display-lg` | 56 | 1.04 | 600 | -0.050em | Standard hero |
| `display-md` | 44 | 1.08 | 600 | -0.045em | Page headline |
| `heading-xl` | 36 | 1.12 | 600 | -0.035em | Section headline |
| `heading-lg` | 28 | 1.18 | 600 | -0.030em | Major panel title |
| `heading-md` | 22 | 1.25 | 600 | -0.020em | Card title |
| `heading-sm` | 18 | 1.35 | 600 | -0.010em | Small section title |
| `body-lg` | 18 | 1.55 | 400 | -0.010em | Hero supporting copy |
| `body-md` | 16 | 1.55 | 400 | -0.005em | Default body |
| `body-sm` | 14 | 1.50 | 400 | 0 | Secondary copy |
| `label-md` | 13 | 1.25 | 500 | -0.005em | Buttons, tabs |
| `label-sm` | 12 | 1.20 | 500 | 0 | Badges, metadata |
| `caption` | 11 | 1.20 | 500 | 0 | Fine metadata |
| `eyebrow-mono` | 12 | 1.20 | 500 | +0.10em | Eyebrow above sans headline |
| `mono-sm` | 13 | 1.55 | 400 | 0 | Code, logs, CLI |
| `mono-xs` | 12 | 1.40 | 500 | +0.04em | Technical labels |

### OpenType features

Enable globally where the platform supports it. Most of the typographic polish is invisible.

| Feature | Where | Effect |
|---|---|---|
| `kern` | All text | Pair-kerning |
| `liga` | All text | Standard ligatures |
| `calt` | All text | Contextual alternates |
| `ss01` | Body, when supported | Stylistic character variants |
| `tnum` | Numeric cells, prices, timestamps | Tabular figures |
| `cv11` | Body | Single-story `g`, `a` |

`tnum` is mandatory on monetary cells, percentages, timestamps, counts, version strings, table numeric columns.

### Display tracking rule

| Size range | Tracking |
|---:|---:|
| < 24 | -0.005em to 0 |
| 24-44 | -0.020em to -0.045em |
| 44-72 | -0.045em to -0.055em |
| > 72 | -0.055em to -0.060em (poster-tight) |

Looser tracking at hero scale reads as default, not designed.

### Eyebrow-mono pattern

Small all-caps mono label with positive tracking above section headlines. Creates a "technical-layer" voice.

```
LATENCY • REGION US-EAST
Built for production traffic
```

Use `eyebrow-mono` token, color `text-muted` or `accent-strong`, under 6 words. Never inside running prose.

### Text width

| Content | Max width |
|---|---:|
| Hero headline | 920 |
| Hero supporting copy | 720 |
| Article content | 760 |
| Form descriptions | 540 |
| Card copy | 420 |

### Rules

- Hero headlines under 12 words.
- Sentence case for most UI text.
- Uppercase only for short labels, badges, technical metadata.
- No font weights below 400 unless a brand mode requests editorial thin display.
- No center-aligned long paragraphs.
- Maximum two type families per product.

---

## 6. Layout System

### Breakpoints

| Class | Width | Columns | Gutter | Margin |
|---|---:|---:|---:|---:|
| Compact | < 640 | 4 | 16 | 20 |
| Medium | 640-1023 | 8 | 24 | 32 |
| Expanded | 1024-1439 | 12 | 28 | 48 |
| Wide | 1440+ | 12 | 32 | 80 |

### Containers

| Token | Width | Usage |
|---|---:|---|
| `container-sm` | 720 | Forms, auth, narrow content |
| `container-md` | 960 | Docs, settings, simple pages |
| `container-lg` | 1180 | Marketing |
| `container-xl` | 1320 | Dashboards, data-heavy |
| `container-full` | 100% | App shell, native full-screen |

### Spacing scale

8-unit base, occasional 4-unit micro spacing.

| Token | Value | | Token | Value |
|---|---:|---|---|---:|
| `space-0` | 0 | | `space-8` | 32 |
| `space-1` | 4 | | `space-10` | 40 |
| `space-2` | 8 | | `space-12` | 48 |
| `space-3` | 12 | | `space-16` | 64 |
| `space-4` | 16 | | `space-20` | 80 |
| `space-5` | 20 | | `space-24` | 96 |
| `space-6` | 24 | | `space-32` | 128 |

### Spacing relationships

| Relationship | Target |
|---|---:|
| Label to field | 6-8 |
| Field to helper/error | 6-8 |
| Icon to label | 8 |
| Button group gap | 8-12 |
| Form field group | 16-24 |
| Card internal padding | 20-28 |
| Section internal padding | 48-80 |
| Major section gap | 80-128 |

### Rules

- Generous vertical spacing between marketing sections (80-128).
- Compact spacing inside app panels (12-24).
- Strong left-edge alignment unless marketing hero.
- Asymmetric for landing pages, strict for dashboards/settings.
- Cards group decisions, not every block.
- On compact screens stack intentionally; primary action stays visible.

---

## 7. Shape, Borders, Elevation

### Radius

| Token | Value | Usage |
|---|---:|---|
| `radius-none` | 0 | Hard-corner luxury (Ferrari/Nike) |
| `radius-xs` | 4 | Small tags, code pills |
| `radius-sm` | 6 | Inputs, compact in-app buttons |
| `radius-md` | 10 | Default controls |
| `radius-lg` | 14 | Cards (humane warmth) |
| `radius-xl` | 20 | Feature panels |
| `radius-2xl` | 28 | Hero media, large containers |
| `radius-pill` | 100 | Marketing pill CTA |
| `radius-full` | 999 | Avatars, fully round controls |

### Dual pill scale

Two button radii can coexist (Vercel/Stripe/Linear pattern):

| Context | Radius | Why |
|---|---:|---|
| Marketing pages | `radius-pill` (100) | Confident, conversion |
| In-app actions | `radius-sm` (6) or `radius-md` (10) | Quiet, dense |

Pick one in-app radius and use it everywhere inside the shell. Never mix pill and non-pill primary buttons on the same page.

### Hard-corner luxury

For luxury, automotive, editorial-fashion, or high-end enterprise: `radius-none` on hero buttons and feature cards. Pair with strong typography
contrast (uppercase labels, tight tracking). Inputs stay at `radius-sm` for usability.

### Borders

- Default width 1.
- Borders before heavy shadows.
- Dark mode borders: visible but low contrast.
- Interactive components strengthen border on hover/focus/press.
- No fully borderless cards unless background contrast is obvious.

### Elevation

| Token | Visual | Usage |
|---|---|---|
| `shadow-xs` | subtle 1-2 unit | Buttons, small controls |
| `shadow-sm` | soft 4-12 unit | Cards |
| `shadow-md` | clear 12-32 unit | Popovers, menus |
| `shadow-lg` | broad 24-80 unit | Modals, hero visuals |
| `shadow-stack` | layered low + medium | Premium product mockups |
| `shadow-glow` | soft accent glow ~48-56 unit | Signature AI/hero only |

Flat surfaces use borders. Raised surfaces use border + shadow. Modals dim with soft overlay. Glows are rare and tied to brand or AI moments.
Avoid neumorphism, heavy glassmorphism, harsh shadows.

---

## 8. Component System

### 8.1 Buttons

| Variant | Fill | Text | Border | Height | Padding |
|---|---|---|---|---:|---:|
| Primary | `primary` | `text-inverse` | `primary` | 40 | 16 |
| Secondary | `surface` | `text-primary` | `border` | 40 | 16 |
| Ghost | transparent | `text-secondary` | transparent | 36 | 12 |
| Destructive | `danger` | white | `danger` | 40 | 16 |
| Icon | surface/transparent | inherited | optional | 36-40 | square |

Behavior: hover increases surface contrast subtly; press reduces scale slightly without layout shift; focus shows visible ring; disabled reduces
opacity, removes elevation; loading keeps width stable with progress indicator; destructive pairs with consequence copy.

Copy: specific verbs (Create project, Invite teammate, Save changes). Avoid Submit, OK, Click here, Continue when destination is unclear.

### 8.2 Cards and Surfaces

| Surface | Background | Border | Radius | Padding | Elevation |
|---|---|---|---|---:|---|
| Default | `surface` | `border` | `radius-lg` | 24 | `shadow-xs` |
| Feature | subtle blend | `border` | `radius-xl` | 28 | none / `shadow-xs` |
| Interactive | `surface` | `border`→`border-strong` | `radius-lg` | 20-24 | hover→`shadow-sm` |
| Raised | `surface-raised` | `border` | `radius-xl` | 24 | `shadow-md` |
| Inset | `surface-inset` | `border-subtle` | `radius-md` | 12-16 | none |

Title before supporting copy. Primary action at bottom or top-right. No nested cards more than one level deep. Don't card every line item — use
lists or tables. Hover/press moves no more than 2 units.

### 8.3 Inputs and Forms

| Element | Spec |
|---|---|
| Text input height | 40 |
| Radius | `radius-md` |
| Horizontal padding | 12 |
| Textarea min height | 112 |
| Label | Above field, always visible |
| Helper/error | Below field |
| Focus | Accent ring or visible border |
| Error | Danger border + specific copy |

Helper text explains why or what format. Errors are specific and human. Required indicators subtle. Group related fields. Disable save only when
reason is clear.

### 8.4 Navigation

**Top nav**: 64 desktop, 56 compact. `background` or `surface`. Bottom border. Logo left, nav center/left, actions right. One clear header
action. Compact converts to drawer/sheet/menu.

**Sidebar**: 240-280 wide. `surface` background. Right border. 16 padding. Item height 36, radius `radius-md`. Active item: `accent-soft`
background, `accent-strong` text/icon. One active style per group. Line icons 16-20 when useful. Collapse to rail or drawer on smaller screens.

### 8.5 Badges and Pills

Height 24, padding 0/8, radius `radius-full`, text `label-sm`, border `border`, background `surface-muted`, text `text-secondary`.

Variants: success, warning, danger, accent — each pairs `*-soft` background with the matching text color.

1-3 words. Never as buttons unless interaction is visually clear. Icons only when they clarify meaning.

### 8.6 Tables and Lists

Default text `body-sm`. Header `label-sm` muted, uppercase optional. Row 48-56. Bottom borders only. Numerics right, text left. Hover/selection:
subtle surface change.

Tabular numerals on metrics. Direct labels. Sticky bulk actions. Empty/loading/error states required. Mobile tables need designed behavior:
horizontal scroll with affordance, stacked cards, summary rows, or column priority.

### 8.7 Dialogs, Modals, Drawers, Sheets

Surface `surface-raised`, border `border`, radius `radius-xl`, max width 560 for focused dialogs, padding 24, elevation `shadow-lg`. Overlay
dims background.

Title first. One clear primary action. Secondary is usually cancel/close. Destructive requires consequence copy. Focus trapped where supported.
Escape/back/outside-click behavior defined. Long multi-step flows use pages, drawers, or wizards — not small modals.

### 8.8 Toasts and Inline Alerts

**Toast**: surface-raised, border, `radius-lg`, padding 12-14, `shadow-md`, max ~90 characters. Auto-dismiss success. Errors stay visible.
Action only when useful. Never block critical controls.

**Inline alert** variants:

| Variant | Background | Text/icon | Use |
|---|---|---|---|
| Neutral | `surface-muted` | `text-secondary` | General info |
| Info | `info-soft` | `info` | Helpful note |
| Success | `success-soft` | `success` | Positive confirm |
| Warning | `warning-soft` | `warning` | Risk/incomplete |
| Danger | `danger-soft` | `danger` | Error/warning |

### 8.9 Empty States

Structure: small icon/visual → headline → one-sentence explanation → primary action → optional secondary link.

Helpful, never apologetic. Subtle accent gradient only for important moments. No giant illustrations in dense apps. Answer: what's missing, why
it matters, what to do next.

### 8.10 Code Blocks

Background `code-bg`, text `code-text`, border `code-border`, radius `radius-lg`, `mono-sm`, padding 16, line height 1.55-1.65.

Copy action when supported. Compact CLI snippets. Muted accessible syntax highlighting. Don't overuse on non-technical pages.

### 8.11 Keyboard-Key Chip

Subtle gradient surface (`surface-muted` → `surface-inset`), `border`, `radius-sm`, padding 2/6, min width 20, height 20-22, `mono-xs`
`text-secondary`, +0.04em tracking.

For displayed shortcuts (`⌘K`, `Esc`, `/`, `?`), not active inputs. Multi-key with thin separator: `⌘ + K`. Static — not animated.

### 8.12 Code-Mockup Surface (Hero or Feature)

Embed a real code or product UI fragment directly inside a hero band, on the same canvas — no card chrome — so the page reads as documentation.

Background `code-bg` or `surface-featured`, text `mono-sm`/`code-text`, hairline `code-border`, `radius-lg`, padding 20-24. Optional chrome:
window dots, file tab, breadcrumb.

Plausible contextual content (real syntax, real route). Highlight one line with `accent-soft` background or `accent-strong` text. Pair with
eyebrow-mono caption naming the technology.

### 8.13 AI Process Timeline

For multi-stage agent, build, or async work.

```
[chip] Searching docs · 1.2s
[chip] Reading 4 files · 0.8s
[chip] Editing app/api/route.ts · running…
[chip] Done
```

Each chip uses one tint from the process-state palette (§4). Show duration for completed stages, subtle pulse on running. Collapse completed
past 6 entries. Each chip keyboard-focusable, links to underlying artifact. Never fabricate intermediate "thinking" — show only verifiable
transitions.

---

## 9. Motion and Interaction

### Timing

| Token | Duration | Usage |
|---|---:|---|
| `motion-fast` | 100ms | Button press, small hover |
| `motion-base` | 160ms | Default hover, focus, selection |
| `motion-slow` | 240ms | Panels, dropdowns, sheets |
| `motion-page` | 360ms | Page or hero transitions |

### Easing

| Token | Feel | Usage |
|---|---|---|
| `ease-standard` | quick start, smooth settle | Default |
| `ease-out` | natural deceleration | Entrances, sheets, popovers |
| `ease-in-out` | symmetrical | Mode/page transitions |

### Active-state micro-interaction

Apply uniform `transform: scale(0.96-0.97)` on press to every interactive surface. Duration `motion-fast`, easing `ease-standard`. Pair with
opacity dip 0.85-0.92 on touch. Never combine with translate — the press compresses in place. Reduced-motion: skip transform, keep opacity
feedback.

### Rules

- Hover/press movement ≤ 2-4 units.
- Prefer opacity and transform over layout-changing animation.
- Respect reduced-motion preferences.
- Animate only when it clarifies hierarchy.
- Don't animate every element on page load.
- Never rely on motion as the only state-change explanation.

---

## 10. Iconography and Illustration

**Icons**: simple line, stroke 1.75-2, default 16 in controls / 20 in cards / 24 in features. Inherit text color unless communicating status. No
mixed icon families. No required icon library.

**Illustrations**: prefer product screenshots, abstract diagrams, soft gradients, geometric forms, lightweight 3D for hero only. Avoid generic
cartoon people, mascots, complex illustrations that compete with the UI, AI-generated blobs.

---

## 11. Data Visualization

### Chart sequence

| Order | Color |
|---:|---:|
| 1 | `#635BFF` |
| 2 | `#06B6D4` |
| 3 | `#16A34A` |
| 4 | `#F59E0B` |
| 5 | `#DC2626` |
| 6 | `#8B5CF6` |
| 7 | `#64748B` |

### Rules

- Direct labels when possible.
- Subtle gridlines.
- Tabular numerals.
- No 3D charts, no rainbow palettes.
- Highlight one key series, mute the rest.
- Always include units.
- Empty/loading/error states required.
- Chart colors are not general UI accents.

---

## 12. Accessibility

**Contrast**: meet WCAG AA or platform equivalent. Never color-only state. Visible focus. Readable disabled.

**Keyboard**: every interactive element reachable. Focus order matches visual order. Escape/back closes modal surfaces. Activation works
consistently across input methods.

**Assistive tech**: prefer semantic platform controls. Accessible names for icon-only actions. Live regions for async feedback. Labels
associated with form controls. Logical heading order.

**Touch**: minimum 44 unit target. No hover-only essential controls. More spacing between tappable items on compact screens.

**Reduced motion**: remove non-essential animation. Preserve instant state changes. Avoid parallax, large zooms, ambient movement.

---

## 13. Responsive and Adaptive

**Compact**: stack multi-column layouts. Hero display 40-48. Nav to drawer/sheet/menu. Bottom sheets or focused pages for filters/secondary
workflows. Primary actions stay visible. No horizontal scroll except tables with affordance.

**Medium**: 8-column or two-pane. Sidebars collapse to rails. Cards 2-column. Dialogs/sheets near full width with safe margins.

**Expanded**: full 12-column. Dense but calm dashboards. Sticky secondary panels when useful. Line lengths ≤ 760.

**Native**: respect safe areas, system nav, platform back behavior, text scaling. Use platform-native controls when they better support
accessibility. Token roles and visual hierarchy stay consistent even when implementation differs.

---

## 14. Content and Voice

Voice: clear, calm, direct, helpful, slightly warm, never gimmicky.

**Rules**: verbs for actions. Specific labels over generic. Plain-language errors. Avoid exclamation marks except rare celebration. Avoid
Submit/OK/Proceed. Realistic product copy in generated UI.

**Microcopy examples**:

| Context | Good copy |
|---|---|
| Empty project | Create your first project to start organizing work. |
| Loading | Preparing your workspace... |
| Save success | Changes saved. |
| Permission error | You do not have permission to edit this workspace. |
| Delete confirmation | This action permanently removes the project and its data. |
| Invite helper | They will receive an invitation with access instructions. |

**Error formula**: what happened → why (if known) → what to do next.

> We could not save your changes because the connection timed out. Check your connection and try again.

Avoid "Something went wrong."

---

## 15. Page Blueprints

Each blueprint lists structure (in order) and rules unique to that page type. Universal rules (states, accessibility, responsive) live in §8,
§12, §13.

### 15.1 SaaS Landing

Structure: nav → announcement pill → hero headline → supporting paragraph → primary + secondary CTA → product visual → social proof → feature
grid → workflow → use cases → testimonials → pricing preview → footer.

Rules: hero visually dominant; supporting copy max 720; one subtle gradient; one primary CTA above the fold; product visual real not generic;
feature cards 2-3 columns expanded, stacked compact.

### 15.2 AI Chat

Structure: app shell → conversation/project nav → message list → composer → tool/status area → optional context panel.

Rules: user messages compact, assistant messages spacious with rich content; composer easy to find with obvious focus; render AI process
timeline (§8.13) for stages; long conversations stay navigable; compact view never hides input.

### 15.3 Admin Dashboard

Structure: app nav → top bar → page heading → metric cards → filter row → main table or chart → detail drawer → pagination + bulk actions.

Rules: prioritize scanning; consistent row heights; tabular numerals on metrics; actions live near affected data; bulk actions appear only on
selection; filters obvious and reversible.

### 15.4 Pricing

Structure: headline → value statement → billing toggle → pricing cards → comparison table → FAQ → final CTA.

Rules: highlight one recommended plan with `surface-featured` (polarity flip); one CTA per plan; clear price hierarchy; short feature bullets;
enterprise plan serious not vague.

### 15.5 Settings

Structure: settings nav → title + description → grouped sections → forms with helpers → save/cancel → destructive zone (separated).

Rules: sections not one giant form; show current/saved state; disable save until changes exist or explain why; confirm destructive actions with
explicit consequence copy.

### 15.6 Documentation

Structure: docs shell → left nav → article → table of contents → code blocks → callouts → previous/next.

Rules: article max 760; code blocks include copy actions; callouts sparingly; descriptive headings; runnable or realistic examples; quieter than
marketing pages.

### 15.7 Mobile / Compact

Structure: app bar → content stack → primary action → bottom nav or drawer → sheets for secondary workflows.

Rules: minimum 44 tap target; sticky primary actions when needed; bottom sheets for complex controls; no tiny icon-only actions; test long
content and narrow screens.

### 15.8 Auth

Structure: product mark → headline → provider actions → divider → email form → error/helper text → legal/support links.

Rules: quiet page; no marketing content; specific exact errors; provider buttons visually consistent; reassuring secure copy.

---

## 16. Patterns

### Metric card

```
Active users
12,480
+8.2% from last month
Updated 4 minutes ago
```

Tabular numerals. No percentages without baseline. Status color only on meaningful change.

### Command palette

Search input → recent actions → suggested navigation → available commands. Keyboard shortcuts. Highlight matched text. Action-oriented command
names.

### Product evidence

Framed UI fragment → one workflow moment → minimal chrome → realistic labels/metrics → no fake clutter. Visuals support the value prop.
Plausible contextual data.

---

## 17. Agent Rules

### Source of truth

Don't invent colors, shadows, radii, spacing, or type scales unless requested. Use tokens here as the default language. Derive new variants from
existing tokens. Prefer production-ready UI over decorative mockups. Use the host project's existing stack and conventions.

### Workflow

1. Read this file before generating UI.
2. Identify page or component type.
3. Inspect the existing project stack.
4. Select the closest blueprint or component rule.
5. Map tokens into the project's existing primitives.
6. Generate all important states.
7. Check compact, medium, expanded layouts.
8. Use realistic copy.
9. Verify against the rubric (§19).

### Output should feel

Complete, intentional, product-specific, accessible by default, responsive without afterthought, consistent across components, easy to maintain,
compatible with the existing stack.

### Implementation rule

When an agent generates UI from this file, it should infer:

> I will implement this using the project's existing stack and map DESIGN.md tokens into local theme, style, component, or resource primitives.

It should not say it will use a specific framework, styling library, UI kit, or icon package unless the user or project files explicitly require
that stack.

---

## 18. Anti-Patterns

**Visual**: random purple-gradient startup UI, excessive glassmorphism, heavy shadows on every card, low-contrast gray text, giant icons in
dense dashboards, decorative blobs everywhere, multiple unrelated accents, mixed-radius controls, cards inside cards inside cards, centered
long-form text, three+ CTAs in hero, equally-emphasized pricing plans, dashboards that look like marketing, marketing that looks like admin,
light-mode-only UI.

**Content**: lorem ipsum, generic hype, Submit/Click here/Error occurred, Something went wrong without recovery, fake testimonials, vague empty
states ("No data"), placeholder metrics that look real without context.

**Layout**: primary and destructive adjacent without separation, primary CTA below the fold, inconsistent section padding, mixed alignment
systems, compact = shrunken expanded, tables overflowing on compact without controls, modals for long multi-step workflows, full-width sections
without max width.

**Interaction**: removed focus outlines, hover-only essential controls, layout-jumping animations, broken-looking loading states, instant
destructive actions, disabled buttons without explanation.

**Stack**: adding a framework because a component was mentioned, adding a UI kit because a pattern resembles one, adding a styling framework to
implement token names, adding an icon library to match icon style, framework-specific code in DESIGN.md.

---

## 19. Quality Bar

### Universal page checklist

- Clear page title and primary action.
- Responsive/adaptive layout.
- Loading, empty, error states.
- Accessible focus states.
- Realistic content.
- No token drift.
- Dark mode designed (when product supports dark mode).
- No stack dependency introduced by this guide.

### Component checklist

Every interactive component must have: default, hover/press, active, focus, disabled, and loading states. Accessible name. Touch target met on
compact/touch screens. No icon-alone actions without label.

### Review rubric

Score 1-5. Minimum shipping bar: every category ≥ 3. Target: ≥ 4.

| Category | 1 | 3 | 5 |
|---|---|---|---|
| Visual hierarchy | Confusing | Mostly clear | Instantly clear |
| Token consistency | Random | Minor drift | Fully consistent |
| Accessibility | Poor | Basic | Strong |
| Responsiveness | Broken | Works | Thoughtful |
| Copy quality | Generic | Acceptable | Specific and useful |
| Component states | Missing | Partial | Complete |
| Product fit | Template-like | Somewhat | Purpose-built |
| Polish | Rough | Decent | Premium |
| Stack independence | Introduces deps | Mostly portable | Fully agnostic |

---

## 20. Brand Personality Recipes

Four cohesive token clusters synthesized from production design systems. Pick exactly one. Each tunes canvas, accent, type, radius, and motion
as a unified personality.

### 20.1 Warm Editorial

Reference: Anthropic, Cursor, Notion. For literary, considered, humanist tone.

| Token | Value |
|---|---|
| `background` | `#FAF9F5` (cream) |
| `surface-featured` | `#181715` (warm dark) |
| `text-primary` | `#26251E` |
| `accent` | `#CC785C` (coral) or `#F54E00` |
| Card radius | `radius-lg` (14) |
| Display weight | 400 (low-weight serif) or 500 (sans) |
| Display tracking | -0.045em to -0.055em |
| Hero rhythm | cream → cream-card → dark-mockup → coral-callout |

Signature: alternating cream and warm-dark surfaces as page rhythm. Real product mockup cards on dark surfaces between cream content.

### 20.2 Near-Black Craft Tool

Reference: Linear, Raycast, VoltAgent, Framer, Spotify. For developer/creator/AI tools that want quiet density.

| Token | Value |
|---|---|
| `background` | `#0A0A0B` to `#010102` |
| Surface ladder | `#0F1011` / `#141516` / `#18191A` |
| `border` | `#23252A` (hairline only) |
| `text-primary` | `#F7F8F8` |
| `accent` | `#5E6AD2` (lavender-blue) or `#00D992` (electric green) |
| Drop shadow | none — use the surface ladder |
| Eyebrow | `eyebrow-mono` at +0.10em |
| Display tracking | -0.04em to -0.06em |

Signature: hierarchy from a 4-step charcoal ladder + hairline borders. No drop shadows. Eyebrow-mono labels above every section.

### 20.3 Stark Editorial Density

Reference: Vercel, Stripe, Figma, Apple. For platforms that want engineered calm with one chromatic event.

| Token | Value |
|---|---|
| `background` | `#FAFAFA` to `#FFFFFF` (binary) |
| `text-primary` | `#171717` |
| `accent` | `#635BFF` (Stripe) or `#0066CC` (Apple) |
| Single chromatic event | mesh gradient hero, OR color block, OR polarity-flipped pricing |
| Body size | 17-18 (instead of 16) |
| Display weight | 300-500 (never 700) |
| Marketing CTA radius | `radius-pill` (100) |
| In-app radius | `radius-sm` (6) |

Signature: 95% black-and-white chrome with one carefully chosen chromatic moment per page.

### 20.4 Photography-First

Reference: Apple, Nike, Ferrari, Airbnb. For products where the artifact is the protagonist.

| Token | Value |
|---|---|
| `background` | `#F5F5F7` (parchment) or `#181818` (cinema dark) |
| `accent` | `#0066CC` / `#DA291C` / `#FF385C` — single voltage |
| Hero | edge-to-edge photography or product render |
| Card radius | `radius-lg` (14) for warmth, OR `radius-none` (0) for luxury |
| Display | uppercase 96px line-height 0.9-1.0, OR delicate weight 300 |
| Type contrast | extreme cliff (96px next to 14px chrome) |
| Drop shadow | reserved for product imagery only |

Signature: chrome recedes until the artifact dissolves the UI. Single accent for every interactive element across the entire site.

---

## 21. Universal Premium Patterns

The seven patterns that separate premium product UI from generic templates. Apply to any project regardless of personality.

- [ ] **Aggressive negative tracking on display sizes** — 4-5% of font size at hero scale.
- [ ] **One brand voltage color, used scarcely** — primary CTA, brand mark, focus ring. Nothing else.
- [ ] **Surface ladder for hierarchy** — dim surfaces for elevation before reaching for shadows.
- [ ] **Real product UI screenshots** — composited dashboards beat marketing illustrations.
- [ ] **Body at 16-18px, not 14px** — generous reading sizes signal editorial confidence.
- [ ] **OpenType features enabled globally** — `kern`, `liga`, `calt`, `tnum`, `ss01`.
- [ ] **Polarity-flipped featured tier** — dark-fill recommended pricing card on a light page.

If any item is missing, the design will read as generic regardless of how many tokens are defined.

---

## 22. Final Agent Instruction

Priority order:

1. User's explicit request
2. Product/page purpose
3. Accessibility and usability
4. DESIGN.md tokens and rules
5. Existing project stack and conventions
6. Platform conventions
7. Visual polish

Never sacrifice clarity for decoration. Never sacrifice accessibility for aesthetics. Never sacrifice consistency for novelty. Never introduce a technology dependency just because this guide describes a component, token, or pattern.

The result should look like a real product built by a careful senior product designer and implementation engineer, while remaining fully portable across stacks.
