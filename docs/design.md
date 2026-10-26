# Hot Voyage — Design (neobrutalism.dev adaptation)

> Source of truth for touristic neobrutalist tokens. Adapted from
> https://www.neobrutalism.dev/ — adapt, do not copy verbatim.
> Token values here MUST match `apps/web/src/styles/tokens.css`.

## What we kept from neobrutalism.dev

- Thick uniform borders (`3px solid ink`) on every surface and control.
- Hard offset shadows with no blur (`6px 6px 0` cards, `3px 3px 0` buttons).
- Small radius (`8px` cards, `999px` pills only for badges).
- Press-down button interaction (`translate(3px,3px)` + shadow removed on `:active`).
- Uppercase, letter-spaced badges.

## What we changed (touristic theming)

- Palette swapped from default yellow/black to sea/sun/sand + ink (see token table).
- Display type uses a heavy grotesque (`Archivo Black` fallback stack) for the
  travel-poster feel; body stays neutral (`Inter`, system-ui fallback).
- Cards carry generous padding (`2rem`) and a `36rem` max width for readability;
  not full-bleed poster blocks.
- Interactive elements always keep a visible `:focus-visible` ring
  (`3px solid sea`, `2px` offset).

## Token table

| Token               | Value                      | Use                       |
| ------------------- | -------------------------- | ------------------------- |
| `--hv-sea`          | `#0e7c7b`                  | Primary actions, focus    |
| `--hv-sea-deep`     | `#0a5a59`                  | Hover/active sea surfaces |
| `--hv-sun`          | `#ffc53d`                  | Default buttons, accents  |
| `--hv-sun-soft`     | `#ffe08a`                  | Badges, stack chips       |
| `--hv-sand`         | `#fdf6e3`                  | Page background           |
| `--hv-coral`        | `#ff6b5b`                  | Hot-deal urgency accents  |
| `--hv-ink`          | `#1a1a1a`                  | Borders, shadows, text    |
| `--hv-paper`        | `#fffdf7`                  | Card surfaces             |
| `--hv-border`       | `3px solid var(--hv-ink)`  | All component borders     |
| `--hv-shadow`       | `6px 6px 0 var(--hv-ink)`  | Card shadow               |
| `--hv-shadow-small` | `3px 3px 0 var(--hv-ink)`  | Button/chip shadow        |
| `--hv-radius`       | `8px`                      | Card/button radius        |
| `--hv-type-hero`    | `clamp(2rem, 5vw, 3.5rem)` | Page/hero titles          |
| `--hv-type-title`   | `1.5rem`                   | Card titles               |
| `--hv-type-body`    | `1rem`                     | Body copy                 |
| `--hv-type-small`   | `0.875rem`                 | Badges, chips, meta       |

## Type scale

- Display (`Archivo Black` stack): hero only, one per viewport.
- Title (`1.5rem`, bold): card and section titles.
- Body (`1rem`, 400/500): descriptions, itinerary text.
- Small (`0.875rem`, 700–800, uppercase + `0.04em` tracking for badges).

## Component patterns

- **Button** (`.hv-button`): sun bg, ink text, `3px` border, small hard shadow,
  press-down active state. Sea variant (`.hv-button--sea`) for primary CTAs
  (white text). Never ghost buttons for primary actions.
- **Card** (`.hv-card`): paper bg, `3px` border, `8px` radius, `6px` hard shadow.
  Content order: badge → title → text → meta → actions.
- **Badge** (`.hv-badge`): sun-soft pill, `2px` border, uppercase small type.
  Coral reserved for hot-deal urgency (countdowns, seats-left).
- **Chips** (stack/meta lists): sun-soft bg, `2px` border, `6px` radius.

## Touristic examples

- Home hello card: sand page → paper card → sun badge → display title.
- Later catalog cards (step 02) reuse `.hv-card` + coral badge for hot deals;
  no new shadow/border language.
- Detail pages (step 02) reuse the same title/body/small scale.

## Accessibility notes (full audit in step 04)

- Ink (`#1a1a1a`) on sand (`#fdf6e3`) and on sun (`#ffc53d`): high contrast.
- White on sea (`#0e7c7b`): passes for large/bold CTA text; body-size white-on-sea
  must be re-checked in the step-04 audit.
- Coral (`#ff6b5b`) is decorative/urgency only — never the sole carrier of meaning;
  pair with text (`-20%`, `3 left`).
- Focus is always visible (`outline: 3px solid sea`); never remove outlines.
- Hard shadows are offset copies, not blur — they do not reduce text contrast.

## What NOT to copy

- Do not import neobrutalism.dev components verbatim (different palette, fonts).
- No pure-black (`#000`) surfaces; ink is `#1a1a1a`.
- No brutalist chaos (rotated cards, overlapping shadows) on transactional UI
  (booking/inquiry, admin forms) — readability first.
- No new border widths, shadow offsets, or radii without updating this file
  and `tokens.css` together.
