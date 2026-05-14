# Full Focus Pay — Design System

A working design system for **Full Focus Pay**, the payment surface of the Full Focus gaming ecosystem. Full Focus Pay lets gamers top up international digital services — Steam, Epic Games, Discord Nitro, AI subscriptions, marketplaces — through a fast, minimal, trustworthy fintech experience.

This system is the **evolution** of the Full Focus brand into a product identity. It borrows the FF palette and visual DNA (Glitch Core violet, Neon Bloom accent, Deep Memory canvas, sci-fi-inspired display type) and re-shapes them into something closer to Stripe / Linear / Revolut than to the parent club's marketing materials.

---

## Sources

- **`uploads/FF_brandbook.pdf`** — Full Focus brand guidelines (22 pages, Russian). Contains tone of voice, positioning, color palette, type system, logo rules. Treated as foundation, not a strict cage — Pay reinterprets these primitives for an interface-driven product.
- **`uploads/brand-usage-rules.md`** — explicit rules from the team: use FF as foundation, don't copy social/marketing comps, lean cleaner / more premium / more interface-driven.
- **`fomin-max/fullfocuspay`** GitHub repo — <https://github.com/fomin-max/fullfocuspay> — connected, but currently empty (no commits at time of design). When the team pushes the codebase, re-run this system pass to import real components / tokens / icons. See also adjacent repos that may share visual language: <https://github.com/fomin-max/fullfocusclub>, <https://github.com/fomin-max/fullfocushub>.
- **Industry UI references** the brief calls out: Stripe (payments), Linear (density + restraint), Revolut (consumer money UI), Steam / Discord (the surfaces being topped up).

---

## What this design system is

| Folder | What's inside |
|---|---|
| `README.md` | This file — context, content fundamentals, visual foundations, iconography, index. |
| `SKILL.md` | Agent skill manifest — drop this into a Claude Code project to load Pay as a design context. |
| `colors_and_type.css` | All tokens — colors, gradients, type scale, spacing, radii, shadows, motion. Import this anywhere. |
| `assets/` | Logos (wordmark + mark, light/dark), gradient backgrounds, service tiles, illustration primitives, pattern SVGs. |
| `fonts/` | Notes on font substitutions (FF brandbook fonts are licensed — system uses Google Fonts equivalents). |
| `preview/` | The card files that populate the **Design System** tab. Each card previews one foundation or component cluster. |
| `ui_kits/app/` | Hi-fi React recreation of the mobile-first Pay product — top-up flow, wallet, transaction history, login. Open `index.html` to walk through it. |
| `ui_kits/web/` | Hi-fi React recreation of the marketing site — hero, supported services grid, security explainer, footer. |

---

## Content Fundamentals — how Pay speaks

### Voice — pulled from the FF brandbook + adjusted for fintech

The parent brand defines voice as **"confident, clear, modern. Friendly without being too familiar. Simple words, on point. Brief. Technological. Emotionally engaging."** Example phrases from the book (translated):

- "4080 isn't the limit. With us, it's the standard."
- "Technology in focus."
- "Full control. Full Focus."
- "You play. We handle the rest."

For **Pay**, we keep the confidence and brevity, drop most of the swagger, and add a layer of **fintech precision** — every word a user reads about money has to be unambiguous.

### Rules of Pay copy

| Rule | Example |
|---|---|
| **Second person, never first.** Address the player. | ✅ "Top up Steam in two taps." &nbsp; ❌ "We help you top up Steam." |
| **Short clauses. One idea per line.** Marketing favors statements stacked vertically over paragraphs. | ✅ "Fast. Anonymous. No card needed." |
| **Lowercase product naming.** Mirror the brandbook wordmark: `full focus pay`, not Full Focus Pay, in product chrome. Sentence case is fine in prose. | `full focus pay` |
| **Numbers are the hero.** Lead with the amount, the time, the count. Words frame them. | "**$50** to Steam. **18 seconds.**" |
| **No emoji in product chrome.** They appear nowhere in the FF brandbook; they undermine the precision of a money UI. Reserved for status (✓ delivered) and only as iconography, not punctuation. | — |
| **No exclamation points on transactional surfaces.** Save them for marketing hero copy. | ✅ "Payment received." &nbsp; ❌ "Payment received!" |
| **Plain English over fintech jargon.** "Top up" not "credit your wallet." "Sent" not "transaction submitted." | — |
| **Never apologize generically for delays.** State the cause and the ETA. | ✅ "Steam is processing. Usually under a minute." &nbsp; ❌ "Sorry for the delay!" |
| **Cyrillic copy welcome.** The parent brand is Russian-first. Pay supports both — the type system is cyrillic-safe (Manrope) and the wordmark uses Audiowide which is latin-only (so the mark is invariant). | "Пополни Steam за два касания." |

### Tone matrix

| Surface | Tone |
|---|---|
| Marketing hero | Confident, almost declarative. Single sentence. "The fastest way to fund your game life." |
| Top-up flow | Quiet, instructive. "Choose an amount." "Confirm in your app." |
| Empty states | Direct, no whimsy. "No transactions yet. Make your first top-up to see it here." |
| Error states | Cause + next action. "Card refused. Try another method." |
| Success states | Calm satisfaction, not celebration. "Sent. Steam usually credits within 60 seconds." |

### What we don't do

- **No gamer-baiting slang.** No "GG", no "pwn", no "let's go". The audience is digital-native — talking down to them reads as cringe.
- **No fintech corp-speak.** No "seamless", no "best-in-class", no "your financial journey".
- **No fake scarcity / urgency.** No "limited time" countdowns on commodities.

---

## Visual Foundations

### Color

The system is **dark-canvas first**. Light surfaces exist but are the exception — they're used inside dark hosts (a white amount field on a dark sheet) rather than as page backgrounds.

| Token | Hex | Role |
|---|---|---|
| `--ff-glitch-core` | `#6632FA` | The brand violet. Primary CTA, focus rings, selection, brand surfaces. |
| `--ff-deep-memory` | `#080223` | The void. Lives behind everything. |
| `--ff-softlight` | `#F2F2F7` | All on-dark text. |
| `--ff-neon-bloom` | `#00FFB6` | Live / success / positive movement only. The "pulse of the system." Used sparingly — one neon thing per screen, max. |
| `--ff-system-fog` | `#9D9D9C` | Secondary text. |

Pay extends Deep Memory with a 4-step elevation scale (`--pay-bg-0` through `--pay-surface-3`) — what would be `gray-50…gray-200` in a light system is achieved by tinting toward violet, not gray. This gives the dark UI a **subtle warmth toward the brand** without ever becoming saturated.

**Gradient rules:**
- The brandbook's signature radial Glitch Core → Neon Bloom bloom is allowed in **one place per screen** — hero key art, or the brand surface of a card.
- Linear gradients are for **brand surfaces** (logo plates, primary CTAs in marketing) and **divider lines** (1px high, low-opacity, fading violet → transparent).
- **Never** put a gradient on a long body of text. Never use multi-stop rainbow gradients. The brandbook calls out "noisy gradients" as a thing to avoid.

### Type

| Family | Role | Substitution note |
|---|---|---|
| **Audiowide** | Display, wordmark, key brand moments. | Direct match for the "sci-fi inspired" display type the brandbook describes. Available on Google Fonts. |
| **Manrope** | All UI, body, numerals, forms. | **Substituted for Grandis Extended** (licensed in FF book — file not provided). Manrope is geometric, modern, premium, cyrillic-complete. **⚠ Flag for the user:** when the team licenses Grandis Extended, swap the `--pay-font-sans` variable and re-test ascenders / numeral widths. |
| **JetBrains Mono** | Transaction IDs, codes, technical strings. | Standard fintech mono. |

**Magistral** (FF brandbook secondary) is not currently used. If the team wants it for marketing comps later, Chakra Petch on Google Fonts is the closest free equivalent.

### Spacing

4px base grid (`--pay-space-1` = 4px through `--pay-space-11` = 120px). The product is **mobile-first**: most cards use 16px (`--pay-space-4`) padding, vertical rhythm between sections is 24px (`--pay-space-6`), screen edges are 20px (`--pay-space-5`).

### Radii

Restrained. **The product is not bubbly.** Inputs and small buttons are 8px (`--pay-radius-sm`). Cards are 12px (`--pay-radius-md`). Hero / modal / sheet are 16–24px. Pills (`--pay-radius-full`) are reserved for **status tags only** — never for buttons.

### Borders, shadows, elevation

Because the UI is dark, **elevation is communicated by a hairline border + a small lift in surface tint**, not by drop shadows. Shadows are reserved for floating things — dropdown menus, toasts, modals — where they sell separation from the canvas.

- `--pay-border-1` (6% white) — default hairlines on dark surfaces.
- `--pay-border-2` (10% white) — buttons, inputs at rest.
- `--pay-border-3` (16% white) — hover / prominent.
- `--pay-shadow-1/2/3` — only on floating elements.

### Backgrounds & textures

- **No full-bleed photography in product chrome.** It belongs in marketing hero only.
- **No repeating textures or grain.** The book's "cyberpunk character render" key art is for marketing illustration — never UI.
- **Allowed:** the radial Glitch Core → Neon Bloom bloom as a hero background, faded toward Deep Memory at the edges. One per screen.
- **Allowed:** a 1px dotted grid (`rgba(242,242,247,0.04)`) on empty/marketing surfaces for "tech grid" feel — never behind text.

### Motion

- **Easing:** `cubic-bezier(0.2, 0.7, 0.2, 1)` — quick, confident, no overshoot. **No bounce, no spring.** Bouncy motion contradicts the "fintech precision" the brief asks for.
- **Durations:** `120ms` for state changes (hover, press), `200ms` for in-page transitions, `360ms` for sheet / modal entries.
- **Fades over slides** for most transitions. A sheet slides up from the bottom on mobile; everything else cross-fades.
- **Numerical changes** in the wallet balance get a 200ms tick-up, not a count-up animation — the digits change once, calmly.

### Hover & press

- **Hover** raises tint one step (`--pay-surface-1` → `--pay-surface-2`) and lifts border one step. No scale.
- **Press** drops tint one step and adds an inset 1px brand-violet ring. No squish, no shrink.
- **Focus** is a 4px brand-violet outer ring (`--pay-shadow-glow`).

### Transparency & blur

- **Sticky chrome** (mobile bottom nav, top header) uses `rgba(11,6,38,0.72)` over `backdrop-filter: blur(20px)`.
- **Modal scrim** is 60% Deep Memory, no blur (cheaper, equally clear).
- **Frosted glass** is otherwise avoided — it clashes with the "sci-fi precision" tone when overused.

### Layout rules

- Mobile-first **390×844** (iPhone 14) canvas for the app. Marketing canvas is 1440 wide, content max 1200.
- Sticky bottom nav (`Wallet`, `Top up`, `History`, `You`) — primary navigation on mobile.
- Sticky top header with logo + a single right-side action (notifications or KYC status).
- Marketing site is a centered single column with edge-to-edge bands of differing surface tint.

### Card anatomy

- **Default card:** `--pay-surface-1` background, `--pay-border-2` 1px border, `--pay-radius-md`, `--pay-space-4` padding, no shadow.
- **Brand card** (hero in a flow): `--pay-grad-deep` background, plus a low-opacity Glitch Core radial bloom in one corner, 1px border, `--pay-radius-lg`.
- **Transaction row:** no border, no card. Just a row with bottom-edge `--pay-border-1` divider.

---

## Iconography

The FF brandbook does **not** define an icon set — the visuals in the book are illustrative key-art renders, not glyphs. So Pay sets its own icon language:

- **Library:** [Lucide](https://lucide.dev) (1.5px stroke, rounded line caps, 24×24 default). Loaded via CDN — see the UI kits' `index.html` for the `<script>` tag. Lucide matches the brandbook's "clean lines, strict geometry" logo description and the "minimalist, restrained" tone.
- **Sizing:** 16, 20, 24 px. 16 inline with body text; 20 in buttons; 24 in section headers.
- **Stroke color:** always `currentColor`. Icons inherit from the text they sit beside.
- **No filled icons.** Stroke-only across the entire product.
- **No emoji** in product chrome (see content rules). Status uses Lucide `check`, `clock`, `alert-circle`, `x-circle`.
- **No Unicode glyphs as icons.** No `→`, no `✓` — use Lucide `arrow-right`, `check`.

### Service / brand logos (Steam, Epic, Discord, OpenAI, etc.)

These are **third-party marks** displayed for product identification under nominative fair use. The system stores **stylized placeholder tiles** in `assets/services/` so the design files render offline — see `assets/services/README.md` for the substitution table. For production, the team should replace each placeholder with the official brand asset from the partner's brand kit.

### Logo

`assets/logo-pay-wordmark.svg` — full lockup. The mark is a stacked-bar "F" with a focus-aperture dot — referencing both the brandbook's geometric F-mark and a payment "indicator." It uses the Bloom→Glitch gradient. `logo-pay-mark.svg` is the icon-only variant for app icons / favicons. `logo-pay-wordmark-mono.svg` is the single-color version for ad placements and constrained surfaces.

---

## Index — what's in this project

```
.
├── README.md                  ← this file
├── SKILL.md                   ← agent skill manifest
├── colors_and_type.css        ← all design tokens
├── assets/
│   ├── logo-pay-wordmark.svg
│   ├── logo-pay-wordmark-mono.svg
│   ├── logo-pay-mark.svg
│   ├── bg-bloom.svg           ← hero radial bloom
│   ├── pattern-grid.svg       ← faint tech grid for marketing
│   └── services/              ← Steam/Epic/Discord/etc placeholder tiles
├── fonts/
│   └── README.md              ← substitution notes
├── preview/                   ← Design System tab cards
└── ui_kits/
    ├── app/                   ← mobile Pay product (React + JSX)
    └── web/                   ← marketing site (React + JSX)
```

---

## Caveats (read these before going to production)

1. **Grandis Extended is substituted with Manrope.** The FF brandbook calls for Grandis Extended (paid license). When you obtain it, swap `--pay-font-sans` in `colors_and_type.css`.
2. **The GitHub repo `fomin-max/fullfocuspay` is empty.** Nothing was imported from code. When real components land, the tokens here will likely need adjustment to match production CSS variables exactly.
3. **No real logos for Steam / Epic / Discord / etc.** are bundled — only stylized tiles. Replace with partner brand assets at build time.
4. **The Pay product mark** in `assets/logo-pay-*.svg` is a proposal, not a finalized brand asset. The FF parent mark wasn't provided in importable form. Treat as a placeholder for review.
5. **Russian-first copy.** UI strings in the kits are English for legibility; the type stack is cyrillic-safe and the system documents the bilingual tone, but production strings should be authored Russian-first.
