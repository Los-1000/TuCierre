---
page: landing-creative
---
Avant-garde editorial landing page for TuCierre — a notarial SaaS for Peruvian real estate brokers. This is NOT a conventional SaaS layout. Think Bloomberg Terminal meets high-fashion editorial meets proptech. Art-directed by a Pentagram partner. Every layout decision is intentional and bold.

DESIGN SYSTEM (REQUIRED):
- Platform: Desktop-first, full-width
- Palette: Pure Black #0A0A0A (dominant 60%), Warm Cream #F5F0E8 (secondary 30%), Terracotta #D47151 (accent ONLY — maximum 10 uses, each high-impact), Pure White #FFFFFF (cards/inputs only)
- Typography: Inter — DRAMATIC sizes. Headlines 120px+. Mix ultra-bold 900 with ultra-light 200 in same heading. Tight -0.04em letter-spacing on all display text.
- Roundness: ZERO on structural elements (sharp rectangle corners everywhere). ONLY pill shape on buttons and interactive badges. No rounded cards. No rounded sections.
- Shadows: None on sections. Deep dramatic shadows only on floating UI mockup elements.
- Atmosphere: Sovereign Editorial Brutalism. Think Brutalist architecture translated to UI. Confident. Zero decorative fluff. The whitespace IS the design. Typography IS the hero.
- Key rule: The terracotta #D47151 must feel like a single painter's brushstroke — sparse, intentional, electric.

PAGE STRUCTURE:

SECTION 1 — SPLIT VIEWPORT HERO (100vh, no scroll needed to see full impact):
Hard vertical split — LEFT 58% pure black #0A0A0A, RIGHT 42% warm cream #F5F0E8. No border between them — just the hard color edge.
LEFT SIDE (black):
  - Top-left corner: "TuCierre" wordmark in 13px uppercase white/40%, tracking-widest — like a newspaper masthead stamp
  - Vertical center: Stacked display text filling the full column width:
    Line 1: "NO" — Inter Black 900, ~180px, pure white, letter-spacing -0.05em
    Line 2: "PERSIGAS" — Inter Black 900, same scale, pure white
    Line 3: "A NADIE." — Inter Black 900, same scale, pure white
  - Below the 3 lines: a 1px terracotta horizontal rule spanning full column width
  - Below rule: "Solo cierra." in Inter Light 200, 52px, white/60%, italic
  - Bottom-left corner: small text "Lima, Perú · 2026" in 11px white/20%
RIGHT SIDE (cream #F5F0E8):
  - Top-right: "PLATAFORMA NOTARIAL" label in 10px uppercase terracotta, tracking-widest
  - Commission Calculator widget — sharp corners (border-radius: 0), white background, 2px black border:
    Header: "Calculadora de comisiones" in 16px bold black
    Slider: "Trámites al mes" + large tabular "5" + horizontal range slider
    Price chips: S/300 S/500 S/800 S/1k S/1.5k — sharp-cornered chips, active one filled black
    Tier row: [3%] [5% ←active black bg white text] [8%] — sharp rectangles
    Result bar (black #0A0A0A background, no radius): "S/. 500" in 68px Inter Black white tabular
    Below result: "+3 trámites → 8%" in terracotta 13px
  - Below calculator: "Empezar gratis →" terracotta-filled pill button (the ONLY pill on this section)
  - "120+ brokers activos en Lima · Gratis · Sin tarjeta" in 11px black/40%

SECTION 2 — FINANCIAL TICKER (full-width black band, 60px tall):
Scrolling marquee, left to right, infinite loop:
Content repeating: "TRÁMITE CERRADO ✦ S/. 1,200 ✦ COMPRAVENTA ✦ LIMA, PERÚ ✦ "
All in terracotta #D47151, 13px uppercase Inter SemiBold, tracking-widest, on pure black background.
Feels like a Bloomberg financial terminal ticker.

SECTION 3 — THE NUMBERS (cream #F5F0E8 bg, 200px tall):
4 giant statistics in a horizontal row, separated by 1px black vertical rules:
Stat 1: "1,000+" in 80px Inter Black #0A0A0A / label "Trámites en 2026" in 13px terracotta
Stat 2: "7 días" in 80px Inter Black / label "Tiempo promedio de cierre" in 13px black/50%
Stat 3: "16+" in 80px Inter Black / label "Tipos de trámite" in 13px black/50%
Stat 4: "8%" in 80px Inter Black terracotta / label "Comisión máxima" in 13px black/50%
No cards. No shadows. Just the numbers on cream, grid-divided by hairlines.

SECTION 4 — STAIRCASE STEPS (black #0A0A0A bg, generous vertical padding):
Section label top-left: "CÓMO FUNCIONA" in 10px white/30% uppercase tracking-widest
NOT a 3-column grid. A DIAGONAL STAIRCASE — each step is offset further right and lower:
Step 01: Left-aligned at x=0. "01" in 11px terracotta + "Registra a tu cliente" in 56px Inter SemiBold white + body in 16px white/50%. Right side: small dark UI mockup showing file upload.
Step 02: Indented 180px right. Same treatment. "La notaría lo procesa". Right: processing status mockup.
Step 03: Indented 360px right. "Tú cobras la comisión". Right: terracotta commission amount display.
Between steps: terracotta connecting arrows (→) showing progression.

SECTION 5 — FEATURE PANELS (3 full-viewport-height alternating panels):
Panel A (cream bg #F5F0E8):
  Left 40%: Giant "01" in 280px Inter Thin/100, black/8% (background texture only)
  Right 60%: Tag "COTIZACIONES" in 10px terracotta uppercase / H2 "Precio exacto. En segundos." in 52px Inter Bold black, tight leading / body text / bullet list / Dark UI mockup showing quotation form
Panel B (black #0A0A0A bg):
  Left 60%: Tag "SEGUIMIENTO" in terracotta / H2 "Nunca más '¿Cuándo sale?'" in 52px white / body / Step tracker mockup with terracotta active step
  Right 40%: Giant "02" in 280px Inter Thin white/5% (background texture)
Panel C (cream #F5F0E8 bg):
  Left 40%: Giant "03" in 280px Inter Thin black/8%
  Right 60%: Tag "COMISIONES" in terracotta / H2 "Tu pago, sin perseguir." in 52px black / Commission list mockup

SECTION 6 — PRICING TABLE "EL SISTEMA" (black #0A0A0A bg):
Top: "EL SISTEMA." in 96px Inter Black white, left-aligned, filling half the width
Subtitle: "Tu comisión sube sola. Sin formularios. Sin aprobaciones." in 18px white/40%
Below: NOT cards — 3 HORIZONTAL TABLE ROWS like a financial instrument table, each separated by 1px white/10% horizontal rule:
Row 1: [NIVEL 1] | [1–3 trámites/mes] | [3%] | [Empezar] — all on cream background row, black text
Row 2 (FEATURED): Full-width terracotta #D47151 background row. [NIVEL 2 · POPULAR] | [4–7 trámites/mes] | [5%] in 120px black bold inside the row | [Escalar →] black pill. This row is 3x taller than others to showcase the 5%.
Row 3: [NIVEL 3] | [8+ trámites/mes] | [8%] | [Alcanzar] — cream background, black text

SECTION 7 — CLOSING CTA (cream #F5F0E8 bg):
Top: 1px terracotta horizontal rule, full width
Left 55%: "¿Listo para cerrar?" in 88px Inter Bold black, 2 lines, tight leading
Right 45%: vertical stack — "Gratis para brokers" label (11px terracotta uppercase) + "Sin tarjeta de crédito" (11px black/40%) + "Empezar gratis →" large terracotta pill button + "Ya confían en TuCierre más de 120 brokers en Lima" in 12px black/30%

SECTION 8 — FOOTER (black #0A0A0A bg):
1px terracotta rule at top.
Single horizontal row: "TuCierre" bold white left | "Lima, Perú" center white/30% | nav links right white/30% (hover→terracotta)
Very minimal. 80px total height.
