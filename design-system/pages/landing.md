# Landing Page — Design Override
> Overrides MASTER.md for `/` (public landing page)

## Layout Structure

```
1. Navbar (sticky, transparent → solid on scroll)
2. Hero Section
3. "Cómo funciona" (3 steps)
4. Beneficios (3 cards)
5. Tiers de recompensas
6. CTA final + registro
7. Footer
```

## Hero Section

- **Headline**: Large (text-4xl md:text-5xl lg:text-6xl), font-bold, text-primary
- **Subheadline**: text-xl text-text-secondary, max-w-2xl
- **Primary CTA**: "Empieza gratis" — bg-accent, large button (px-8 py-4)
- **Secondary CTA**: "Ver cómo funciona" — ghost button with arrow icon
- **Social proof**: "Más de X brokers ya usan TuCierre" — small text below CTA
- **Visual**: Abstract illustration or screenshot mockup (right side, desktop)
- **Background**: Gradient from #f7fafc to white, or subtle grid pattern

## "Cómo funciona" Section

- 3 horizontal steps on desktop, vertical on mobile
- Connector line between steps (hidden on mobile)
- Each step: number badge (filled circle, primary) + icon + title + description
- Step labels: "01 Cotiza", "02 Solicita", "03 Trackea"

## Beneficios Cards

- 3 cards in a row (desktop), stacked (mobile)
- Icon (32px, accent color) + H3 + body text
- Cards: white bg, shadow-sm, rounded-xl
- Benefit icons: `Scale` (precio transparente), `RefreshCw` (price matching), `TrendingDown` (descuentos)

## Tiers Section

- Background: primary color (dark blue), white text
- 3 tier cards side by side: Bronce, Plata, Oro
- Oro card: slightly elevated, gold accent border — most prominent
- Each tier: icon + name + tramites/mes + descuento + benefits list

## Navbar (Landing only)

- Logo left: "TuCierre" wordmark (Inter Bold) + "powered by NotaryOS" caption
- Links: "Cómo funciona", "Precios", "Para brokers"
- CTA: "Iniciar sesión" (ghost) + "Registrarse" (accent button)
- Transparent on top, white bg with shadow after 80px scroll
- Mobile: hamburger menu

## Footer

- Logo + tagline
- Links columns: Producto, Legal, Soporte
- "Powered by NotaryOS" — small, muted
- Copyright

## Performance Notes

- Hero image/illustration: WebP, lazy=false (above fold)
- Below-fold images: lazy load
- Font Inter: preload 400 + 600 weights only
