# Fonts — Full Focus Pay

## What the brandbook calls for

| Family | Where it's used in FF brandbook |
|---|---|
| **Grandis Extended** | Primary UI / body — light, regular, medium, bold (+ italics). **License required.** |
| **Audiowide** | Display / display alternates. **Available free on Google Fonts.** |
| **Magistral** | Marketing — bold + extra-bold + italics. **License required.** |

## What this design system uses

| Token | Family in use | Notes |
|---|---|---|
| `--pay-font-display` | **Audiowide** (Google Fonts) | Matches the brandbook's sci-fi display type one-to-one. |
| `--pay-font-sans` | **Manrope** (Google Fonts) | **Substituted for Grandis Extended.** Geometric, modern, premium, cyrillic-complete, six usable weights. Closest free equivalent to Grandis Extended's character. |
| `--pay-font-mono` | **JetBrains Mono** (Google Fonts) | New addition. Used for transaction IDs, amounts in technical lists. |

## Action items for the team

1. Acquire **Grandis Extended** webfont (woff2) from the licensor.
2. Drop the woff2 files into this `fonts/` folder (e.g. `GrandisExtended-Regular.woff2`).
3. Replace the `@import` for Manrope in `colors_and_type.css` with a local `@font-face` block.
4. Update `--pay-font-sans` to `"Grandis Extended", ...` (already listed as the first fallback so the swap is one variable).
5. Visually QA: numeral widths, ascender height, weight equivalence (Manrope 600 may not match Grandis 700 — recheck button labels).

If **Magistral** is licensed, add it as `--pay-font-display-alt` and use it for marketing comps; do not introduce it into product chrome.

The system is designed so that font swaps happen at the **token layer**, not at usage sites.
