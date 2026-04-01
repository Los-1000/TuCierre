# TuCierre Design System

## 1. Brand Identity
- **Product:** TuCierre
- **Category:** Notarial SaaS / PropTech
- **Market:** Peru — real estate brokers
- **Vibe:** Premium fintech (Stripe + Wise + Revolut aesthetic) applied to notarial services

## 2. Color Palette
| Role | Name | Hex |
|------|------|-----|
| Background dark | Charcoal | `#18181B` |
| Background light | Off-white | `#F9F9F8` |
| Accent / CTA | Terracotta | `#D47151` |
| Accent hover | Terracotta dark | `#A6553A` |
| Border subtle | — | `#18181B1a` |
| Text primary | Charcoal | `#18181B` |
| Text muted | — | `#18181B99` |

## 3. Typography
- **Font:** Inter (all weights)
- **Display headings:** fluid `clamp(48px, 6vw, 84px)`, font-weight 600, tracking-tight
- **Section headings:** fluid `clamp(36px, 5vw, 56px)`, font-weight 600
- **Body:** 17–18px, font-weight 500, line-height relaxed
- **Labels:** 11–13px, font-weight 700, tracking-widest, UPPERCASE
- **Tabular numbers:** font-variant-numeric tabular-nums

## 4. Component Patterns
- **Pill badges:** `border border-[color]/15 bg-[color]/5 rounded-full px-3 py-1` — small tag with dot indicator
- **Buttons primary:** `bg-[#18181B] text-white rounded-full px-8 py-4 font-semibold` with arrow icon
- **Buttons ghost:** `border border-[#18181B]/15 rounded-full px-8 py-4 font-medium bg-transparent`
- **Buttons CTA (terracotta):** `bg-[#D47151] text-white rounded-full`
- **Cards:** `bg-white rounded-3xl shadow-[0_8px_48px_rgba(18,22,31,0.08)] border border-[#18181B]/6`
- **Dark cards:** `bg-[#27272A] rounded-3xl border border-white/10`
- **Mockup panels:** dark `#27272A` bg with `border border-white/10`, inner rows `bg-white/5`

## 5. Layout System
- **Max width:** `max-w-6xl mx-auto px-6 sm:px-10`
- **Section padding:** `py-24 sm:py-32`
- **Grid hero:** `grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20`
- **Grid 3-col:** `grid md:grid-cols-3 gap-8`
- **Alternating dark/light sections** for visual rhythm

## 6. Design System Notes for Stitch Generation

```
DESIGN SYSTEM (REQUIRED):
- Platform: Desktop-first, full-width layout
- Palette: Charcoal #18181B (dark sections, headings), Terracotta #D47151 (CTAs, active states, accents), Off-white #F9F9F8 (light section backgrounds), Pure white (cards)
- Typography: Inter — fluid headline sizes, semibold/bold headings, medium body text, uppercase tracking-widest labels
- Roundness: rounded-3xl cards (24px), full-rounded pill buttons and badges
- Shadows: large soft shadows on white cards `0 8px 48px rgba(18,22,31,0.08)`, deep shadows on dark mockups
- Atmosphere: Premium editorial fintech — bold, confident, high-contrast, generous whitespace. Think Stripe meets Wise meets proptech. No illustrations — use clean UI mockups and geometric accents.
- Section alternation: Light #F9F9F8 and dark #18181B sections alternate throughout the page
- Buttons: Black filled pill (primary), ghost outline pill (secondary), terracotta pill (featured CTA)
- Accents: Terracotta #D47151 used sparingly but powerfully — CTAs, active states, highlights, underlines, dots
```
