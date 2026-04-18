# Design Brief: V-7 Shop

## Overview
Vibrant, energetic e-commerce marketplace with professional authentication and admin control. Bold maximalism for storefront (product discovery, checkout), refined clarity for admin dashboard. Mobile-first responsive design with accessible payment flows and location-based checkout.

## Tone & Differentiation
Playful storefront energy meets professional admin UX. 5 switchable theme dots, animated product cards, Google-style login page with account picker. Admin sidebar (7 sections) uses dark theme for focus. Checkout adds Locate Me button + Stripe/COD toggle. Contact form is full-width and conversion-focused.

## Palette

| Token | OKLCH | Role |
|-------|-------|------|
| Primary (Blue) | 0.48 0.25 254 | Header, main CTAs, checkout buttons, admin accent |
| Secondary (Orange) | 0.64 0.22 30 | Sale badges, highlights, secondary CTAs |
| Accent (Teal) | 0.68 0.18 165 | Trust badges, success states, Location active state |
| Destructive (Magenta) | 0.58 0.20 331 | Alerts, cancellation actions |
| Background | 0.98 0.01 70 | Storefront main, light card backgrounds |
| Card | 0.99 0 0 | Product cards, modals, checkout form, login cards |
| Foreground | 0.25 0.02 40 | Body text, high contrast |
| Muted | 0.88 0.01 70 | Secondary text, disabled states, form hints |
| Sidebar Dark | 0.16 0 0 | Admin sidebar background (dark mode focus) |

## Typography
- **Display**: Bricolage Grotesque (bold, playful, modern) — headers, hero text
- **Body**: General Sans (clean, legible, contemporary) — product descriptions, body copy
- **Mono**: Geist Mono (technical) — SKUs, order numbers

## Structural Zones

| Zone | Treatment | Details |
|------|-----------|---------|
| Header (Storefront) | bg-primary, full-width, elevated | Blue header with white text, search, cart, 5 theme dots |
| Hero Banner | Layered video + gradient overlay | Looping video background with blue→transparent gradient |
| Product Grid | bg-background, card-soft shadow | 4-column responsive grid, white cards, 12px radius |
| Login Page | Full-height, bg-background | Google-style account picker, device avatars, admin option below |
| Admin Sidebar | bg-sidebar (dark), 7 sections | Inventory, User Logins, Orders, Reviews, Contact, Damaged Orders, Out of Stock |
| Checkout Modal | bg-card, elevated shadow | Locate Me button (accent teal), Payment Method toggle (COD/Stripe), Proceed CTA |
| Contact Form | Full-width, bg-background | Email form (name, email, message), submit button in primary |
| Footer | bg-sidebar (dark), light text | 3-column layout, subtle borders, contact links |

## Spacing & Rhythm
4px base grid. Header: 16px vertical padding. Product cards: 16px internal padding, 12px gap between cards. Trust badges: 8px padding inline, 4px gap. Footer: 24px vertical, 16px horizontal.

## Component Patterns

- **Buttons**: Primary (blue bg, white text, 8px radius), Secondary (orange), Tertiary (teal outline)
- **Product Cards**: White card, image 200px, brand + price, scale + glow on hover
- **Login Cards**: Rounded avatar frame (40px), account name + email, click to select
- **Admin Sidebar**: Dark background, 7 navigation items, icon + label, active state in primary blue
- **Checkout Fields**: Striped input styles (border-input), Locate Me button (accent teal with geolocation icon)
- **Payment Toggle**: Radio buttons (COD selected by default, Stripe card option)
- **Contact Form**: Full-width inputs, textarea for message, submit button in primary

## Motion
- **Fade In**: 0.4s ease-out on page load
- **Scale Pop**: Product cards scale to 1.08 on hover with 0.35s spring easing (0.34, 1.56, 0.64, 1)
- **Glow Hover**: Accent color shadow (0 8px 32px) transitions in on card hover
- **Pulse Badge**: Trust badges pulse gently at 2s infinite for subtle CTA
- **Slide Up**: Product cards slide up 8px on hover entry

## Constraints
- No gradients on full page (reserved for text accents, hero overlay, button highlights)
- Shadows: use oklch-based glow on primary/accent only (not black-heavy)
- Radius: 12px (cards), 8px (buttons), 24px (badges, rounded pills)
- Font weights: 400 (body), 600 (headers), 700 (strong emphasis)
## Signature Detail
5 switchable color theme dots embedded in header create personalization. Google-style login picker with device account avatars reduces friction. Admin sidebar (7 sections) uses dark mode for admin control focus. Locate Me button (geolocation + reverse geocoding) in checkout auto-fills address fields. Stripe payment toggle alongside existing COD.
