# Covalent GP — Unified Frontend Design System

**Version:** 1.0
**Project:** Covalent GP — Community Academic Platform
**Stack:** React · TypeScript · Vite · Tailwind CSS · shadcn/ui · Lucide React
**Sources merged:**
- Source A — Color palette and theme guidance (`primary_colors.md`)
- Source B — Typography, spacing, sizing, and component patterns (`Linear_styleGuide.json`)
- Context — Component inventory and UI requirements (`frontend_context.md`)

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Color System](#2-color-system)
   - 2.1 Palette Reference
   - 2.2 Semantic Tokens — Light Mode
   - 2.3 Semantic Tokens — Dark Mode
   - 2.4 CSS Variable Declarations
   - 2.5 Tailwind Configuration Extension
3. [Gradient System](#3-gradient-system)
4. [Typography Scale](#4-typography-scale)
   - 4.1 Font Family
   - 4.2 Scale Definitions
   - 4.3 Tailwind Usage Reference
5. [Spacing System](#5-spacing-system)
6. [Radius System](#6-radius-system)
7. [Shadow System](#7-shadow-system)
8. [Component Styling Rules](#8-component-styling-rules)
   - 8.1 Application Shell
   - 8.2 Sidebar
   - 8.3 Buttons
   - 8.4 Cards (SpaceCard, PostCard, AnswerCard, MaterialFileCard, MaterialLinkCard, OnlineCourseCard)
   - 8.5 Forms and Inputs
   - 8.6 Badges and Tags
   - 8.7 Dialogs and Modals
   - 8.8 Tabs
   - 8.9 Tables
   - 8.10 Progress Bars
   - 8.11 Avatars
   - 8.12 Notification Bell and Unread Badge
   - 8.13 Toast Notifications
   - 8.14 Leaderboard
   - 8.15 Auth Pages
   - 8.16 Empty States
   - 8.17 Loading States
9. [Interaction States](#9-interaction-states)
10. [Consistency Rules](#10-consistency-rules)
11. [Implementation Notes](#11-implementation-notes)

---

## 1. Design Principles

**P1 — Clarity first.**
Every visual decision must aid comprehension, not compete with content. Academic content (posts, answers, materials) is the focal point. Decoration serves only to create hierarchy or communicate state.

**P2 — Minimal chrome.**
Avoid gradients, heavy shadows, and animations unless they communicate state, depth, or hierarchy. Restraint in decoration is a feature, not a limitation.

**P3 — Consistent depth hierarchy.**
Light mode expresses depth via white-on-gray layering. Dark mode expresses depth via navy-on-navy layering. Elevation is communicated through background tone changes, not shadow intensity.

**P4 — Color carries meaning.**
Indigo/purple tones (`primary`, `accent`) signal interactive elements and primary actions. Avoid using brand colors for purely decorative purposes. Green = success/solved. Red = error/destructive.

**P5 — Responsive by default.**
Sidebar collapses on mobile. All card grids use responsive columns. No hardcoded pixel widths in content areas.

**P6 — Token-first theming.**
Every color value references a CSS variable. No hardcoded hex or RGB values in component files. Both light and dark modes are supported from the start.

**P7 — shadcn/ui is the base.**
Override at the CSS variable level only. Do not edit generated shadcn/ui component files directly.

**P8 — Accessible and keyboard-operable.**
All interactive elements must have a visible `focus-visible` ring. Minimum touch target is 44×44px. Contrast ratios meet WCAG AA (4.5:1 for normal text, 3:1 for large text).

---

## 2. Color System

### 2.1 Palette Reference

#### Brand Palette (Source A)

| Name | Hex | HSL | Role |
|------|-----|-----|------|
| Dark Navy | `#0E1A3E` | `225 63% 15%` | Sidebar bg (light mode), primary text (light) |
| Deep Blue | `#293677` | `230 49% 31%` | Gradient midpoint, heading accent |
| Primary Indigo | `#544BBA` | `245 45% 51%` | Primary action (light mode) |
| Bright Purple | `#6B65E3` | `243 69% 64%` | Primary action (dark mode), accent |
| Soft Lavender | `#A9A7E9` | `242 60% 78%` | Muted text (dark), secondary tints |
| Light Gray | `#F5F5F7` | `240 11% 97%` | Page background (light mode) |
| White | `#FFFFFF` | `0 0% 100%` | Surface (light mode), text (dark mode) |

#### Neutral Dark Backgrounds (Derived from Brand Palette)

| Name | Hex | HSL | Role |
|------|-----|-----|------|
| Dark BG | `#08101F` | `225 59% 8%` | Page background (dark mode) |
| Dark Surface | `#0D1829` | `224 52% 11%` | Card bg (dark mode) |
| Dark Elevated | `#132040` | `227 54% 16%` | Modal, dropdown bg (dark mode) |
| Dark Sidebar | `#0B1527` | `224 56% 10%` | Sidebar bg (dark mode) |

---

### 2.2 Semantic Tokens — Light Mode

| Token | HSL Value | Hex Approx | Usage |
|-------|-----------|-----------|-------|
| `--background` | `240 11% 97%` | `#F5F5F7` | Page background |
| `--foreground` | `225 63% 15%` | `#0E1A3E` | Primary body text |
| `--card` | `0 0% 100%` | `#FFFFFF` | Card, panel background |
| `--card-foreground` | `225 63% 15%` | `#0E1A3E` | Text on cards |
| `--popover` | `0 0% 100%` | `#FFFFFF` | Dropdown, tooltip bg |
| `--popover-foreground` | `225 63% 15%` | `#0E1A3E` | Text in popovers |
| `--primary` | `245 45% 51%` | `#544BBA` | Primary buttons, links, active states |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | Text on primary bg |
| `--secondary` | `242 56% 94%` | `#E8E7F9` | Secondary buttons, light tints |
| `--secondary-foreground` | `245 45% 51%` | `#544BBA` | Text on secondary bg |
| `--muted` | `240 11% 93%` | `#EAEAEE` | Muted backgrounds, skeleton |
| `--muted-foreground` | `230 20% 45%` | `#5C6A8A` | Meta text, placeholders, timestamps |
| `--accent` | `243 69% 64%` | `#6B65E3` | Accent highlights, hover tints |
| `--accent-foreground` | `0 0% 100%` | `#FFFFFF` | Text on accent bg |
| `--destructive` | `0 72% 51%` | `#D93025` | Error states, delete actions |
| `--destructive-foreground` | `0 0% 100%` | `#FFFFFF` | Text on destructive bg |
| `--border` | `225 25% 87%` | `#D5D8E4` | Card borders, dividers, input borders |
| `--input` | `225 25% 87%` | `#D5D8E4` | Input border color |
| `--ring` | `245 45% 51%` | `#544BBA` | Focus ring color |
| `--radius` | `8px` | — | Global border radius base |
| `--sidebar-bg` | `225 63% 15%` | `#0E1A3E` | Sidebar background |
| `--sidebar-fg` | `0 0% 100%` | `#FFFFFF` | Sidebar text and icons |
| `--sidebar-active` | `245 45% 51%` | `#544BBA` | Active nav item bg |
| `--sidebar-border` | `225 60% 22%` | `#162255` | Sidebar internal divider |

---

### 2.3 Semantic Tokens — Dark Mode

| Token | HSL Value | Hex Approx | Usage |
|-------|-----------|-----------|-------|
| `--background` | `225 59% 8%` | `#08101F` | Page background |
| `--foreground` | `240 11% 97%` | `#F5F5F7` | Primary body text |
| `--card` | `224 52% 11%` | `#0D1829` | Card, panel background |
| `--card-foreground` | `240 11% 97%` | `#F5F5F7` | Text on cards |
| `--popover` | `227 54% 16%` | `#132040` | Dropdown, modal bg |
| `--popover-foreground` | `240 11% 97%` | `#F5F5F7` | Text in popovers |
| `--primary` | `243 69% 64%` | `#6B65E3` | Primary buttons, links, active states |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | Text on primary bg |
| `--secondary` | `225 40% 20%` | `#1C2B55` | Secondary button bg, secondary panels |
| `--secondary-foreground` | `242 60% 78%` | `#A9A7E9` | Text on secondary bg |
| `--muted` | `225 40% 18%` | `#19274D` | Muted backgrounds, skeleton |
| `--muted-foreground` | `242 60% 78%` | `#A9A7E9` | Meta text, placeholders, timestamps |
| `--accent` | `242 60% 78%` | `#A9A7E9` | Accent highlights, subtle tints |
| `--accent-foreground` | `225 63% 15%` | `#0E1A3E` | Text on accent bg |
| `--destructive` | `0 62% 54%` | `#D94040` | Error states, delete actions |
| `--destructive-foreground` | `0 0% 100%` | `#FFFFFF` | Text on destructive bg |
| `--border` | `225 40% 20%` | `#1C2B55` | Card borders, dividers |
| `--input` | `225 40% 20%` | `#1C2B55` | Input background and border |
| `--ring` | `243 69% 64%` | `#6B65E3` | Focus ring color |
| `--sidebar-bg` | `224 56% 10%` | `#0B1527` | Sidebar background |
| `--sidebar-fg` | `240 11% 97%` | `#F5F5F7` | Sidebar text and icons |
| `--sidebar-active` | `243 69% 64%` | `#6B65E3` | Active nav item bg |
| `--sidebar-border` | `225 52% 14%` | `#111E3A` | Sidebar internal divider |

---

### 2.4 CSS Variable Declarations

Place in `src/index.css` inside an `@layer base` block, after the Tailwind directives.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* ── Light Mode ──────────────────────────────────────── */
    --background: 240 11% 97%;
    --foreground: 225 63% 15%;

    --card: 0 0% 100%;
    --card-foreground: 225 63% 15%;

    --popover: 0 0% 100%;
    --popover-foreground: 225 63% 15%;

    --primary: 245 45% 51%;
    --primary-foreground: 0 0% 100%;

    --secondary: 242 56% 94%;
    --secondary-foreground: 245 45% 51%;

    --muted: 240 11% 93%;
    --muted-foreground: 230 20% 45%;

    --accent: 243 69% 64%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;

    --border: 225 25% 87%;
    --input: 225 25% 87%;
    --ring: 245 45% 51%;
    --radius: 8px;

    /* ── Sidebar (always dark in light mode) ─────────────── */
    --sidebar-bg: 225 63% 15%;
    --sidebar-fg: 0 0% 100%;
    --sidebar-active: 245 45% 51%;
    --sidebar-border: 225 60% 22%;

    /* ── Raw Palette Aliases ──────────────────────────────── */
    --color-navy: 225 63% 15%;
    --color-deep-blue: 230 49% 31%;
    --color-indigo: 245 45% 51%;
    --color-purple: 243 69% 64%;
    --color-lavender: 242 60% 78%;
  }

  .dark {
    /* ── Dark Mode ───────────────────────────────────────── */
    --background: 225 59% 8%;
    --foreground: 240 11% 97%;

    --card: 224 52% 11%;
    --card-foreground: 240 11% 97%;

    --popover: 227 54% 16%;
    --popover-foreground: 240 11% 97%;

    --primary: 243 69% 64%;
    --primary-foreground: 0 0% 100%;

    --secondary: 225 40% 20%;
    --secondary-foreground: 242 60% 78%;

    --muted: 225 40% 18%;
    --muted-foreground: 242 60% 78%;

    --accent: 242 60% 78%;
    --accent-foreground: 225 63% 15%;

    --destructive: 0 62% 54%;
    --destructive-foreground: 0 0% 100%;

    --border: 225 40% 20%;
    --input: 225 40% 20%;
    --ring: 243 69% 64%;

    /* ── Sidebar (dark mode) ─────────────────────────────── */
    --sidebar-bg: 224 56% 10%;
    --sidebar-fg: 240 11% 97%;
    --sidebar-active: 243 69% 64%;
    --sidebar-border: 225 52% 14%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: "Inter Variable", "SF Pro Display", -apple-system,
      BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
      "Open Sans", "Helvetica Neue", sans-serif;
    font-size: 15px;
    line-height: 24px;
    letter-spacing: -0.165px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

---

### 2.5 Tailwind Configuration Extension

Replace `tailwind.config.js` with the following. The CSS variable mapping must match Section 2.4 exactly.

```js
// tailwind.config.js
import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        sidebar: {
          bg: "hsl(var(--sidebar-bg))",
          fg: "hsl(var(--sidebar-fg))",
          active: "hsl(var(--sidebar-active))",
          border: "hsl(var(--sidebar-border))",
        },
        // Raw palette aliases — use sparingly; prefer semantic tokens above
        navy: "hsl(var(--color-navy))",
        "deep-blue": "hsl(var(--color-deep-blue))",
        indigo: "hsl(var(--color-indigo))",
        "brand-purple": "hsl(var(--color-purple))",
        lavender: "hsl(var(--color-lavender))",
      },
      fontFamily: {
        sans: [
          "Inter Variable",
          "SF Pro Display",
          ...fontFamily.sans,
        ],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        full: "9999px",
      },
      boxShadow: {
        sm: "rgba(0, 0, 0, 0.03) 0px 1.2px 0px 0px",
        "card-light":
          "rgba(14, 26, 62, 0.06) 0px 1px 3px 0px, rgba(14, 26, 62, 0.04) 0px 0px 0px 1px",
        "card-dark": "rgba(0, 0, 0, 0.3) 0px 1px 3px 0px",
        "btn-primary":
          "rgba(0,0,0,0.01) 0px 5px 2px 0px, rgba(0,0,0,0.04) 0px 3px 2px 0px, rgba(0,0,0,0.07) 0px 1px 1px 0px, rgba(0,0,0,0.08) 0px 0px 1px 0px",
        "btn-secondary":
          "rgba(255,255,255,0.03) 0px 0px 0px 1px inset, rgba(255,255,255,0.04) 0px 1px 0px 0px inset, rgba(0,0,0,0.6) 0px 0px 0px 1px, rgba(0,0,0,0.1) 0px 4px 4px 0px",
        inner: "rgba(0, 0, 0, 0.2) 0px 0px 12px 0px inset",
        modal: "rgba(0, 0, 0, 0.2) 0px 8px 40px 0px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

---

## 3. Gradient System

### Rules

1. **Background-level only.** Never apply gradients to text, buttons, or interactive elements.
2. **Maximum 3 color stops.** Anchor points: `#0E1A3E → #293677 → #544BBA`.
3. **Approved use cases only:** Auth page decorative panel, leaderboard top banner, empty-state illustration backgrounds.
4. **Forbidden use cases:** Cards, buttons, sidebars, modals, tables, form elements, nav items.
5. **Direction is linear at 135°.** No radial gradients. No animated gradients.

### Approved Gradient Definitions

**Hero Dark** — Auth page right panel, any full-section dark hero:
```css
background: linear-gradient(135deg, #0E1A3E 0%, #293677 50%, #544BBA 100%);
```

**Hero Subtle** — Light mode empty-state banner or onboarding section:
```css
background: linear-gradient(135deg, #F5F5F7 0%, #E8E7F9 100%);
```

**Leaderboard Banner** — Top section of the leaderboard page:
```css
background: linear-gradient(135deg, #293677 0%, #544BBA 100%);
```

**XP Progress Bar Fill** — Light mode:
```css
background: linear-gradient(90deg, #544BBA 0%, #6B65E3 100%);
```

**XP Progress Bar Fill** — Dark mode:
```css
background: linear-gradient(90deg, #6B65E3 0%, #A9A7E9 100%);
```

---

## 4. Typography Scale

### 4.1 Font Family

**Primary font:** Inter Variable
**Fallback chain:**
```
"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont,
"Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif
```

**Font loading** — Add to `index.html` `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  rel="stylesheet"
/>
```

**Note on `font-weight: 510`:** Inter Variable supports non-integer weights via font-variation-settings. Use `font-weight: 510` or `font-[510]` in Tailwind. In non-variable font environments, browsers round this to `500`.

---

### 4.2 Scale Definitions

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `h1` / display-1 | `56px` | `510` | `61.6px` | `−1.232px` | Auth page hero headings only |
| `h2` / display-2 | `40px` | `510` | `44px` | `−0.88px` | Page titles, section headings |
| `h3` / heading | `20px` | `510` | `26.6px` | `−0.24px` | Card titles, dialog titles, sub-section headers |
| `h4` / label-lg | `16px` | `510` | `24px` | `0px` | Nav items, tab labels, sidebar items |
| `body` / p | `15px` | `400` | `24px` | `−0.165px` | Body copy, descriptions, card content |
| `label-sm` | `13px` | `500` | `18px` | `0px` | Badges, timestamps, metadata, XP values |
| `caption` | `12px` | `400` | `16px` | `0.1px` | Form hints, tooltips, auxiliary text |

**Weight constraints:**
- `400` — All body text, descriptions, meta text.
- `500` — Labels, badge text, metadata emphasis.
- `510` — All headings (h1–h4), button text, nav item text.
- Never use `600` or `700` in interface chrome.

---

### 4.3 Tailwind Usage Reference

```tsx
// h1 — auth page hero only
<h1 className="text-[56px] leading-[61.6px] tracking-[-1.232px] font-[510]">

// h2 — page title
<h2 className="text-[40px] leading-[44px] tracking-[-0.88px] font-[510]">

// h3 — card title, dialog title
<h3 className="text-[20px] leading-[26.6px] tracking-[-0.24px] font-[510]">

// h4 — nav items, tab labels
<h4 className="text-[16px] leading-[24px] font-[510]">

// body paragraph
<p className="text-[15px] leading-[24px] tracking-[-0.165px] font-normal">

// label-sm — badge, timestamp
<span className="text-[13px] leading-[18px] font-medium">

// caption — hint text
<span className="text-[12px] leading-[16px] tracking-[0.1px] font-normal">
```

---

## 5. Spacing System

Derived from the Linear source. Use these values for all padding, gap, and margin decisions.

| Token | Value | Tailwind Shorthand | Primary Usage |
|-------|-------|--------------------|---------------|
| `space-xs` | `8px` | `p-2 / gap-2 / m-2` | Icon gaps, badge padding, inner chip spacing |
| `space-sm` | `16px` | `p-4 / gap-4 / m-4` | Input padding, card vertical padding, list item gaps |
| `space-md` | `28px` | `p-7 / gap-7` | Card horizontal padding, form group gaps, section separators |
| `space-lg` | `60px` | `py-[60px] / gap-[60px]` | Page section separation, major layout block gaps |
| `space-xl` | `128px` | `py-32 / gap-32` | Page-level hero padding, full-page vertical rhythm |

**Grid column gap:** `28px` (`gap-7`)
**Grid row gap:** `28px` (`gap-7`)
**Page horizontal padding:** `16px` on mobile (`px-4`), `28px` on tablet (`md:px-7`), `60px` on desktop (`lg:px-[60px]`)
**Sidebar width (desktop):** `256px` (`w-64`)
**Content area max-width:** `1200px` (`max-w-[1200px] mx-auto`)
**Top content spacing (inside protected pages):** `32px` (`pt-8`) below the page title

---

## 6. Radius System

| Token | Value | Primary Usage |
|-------|-------|---------------|
| `rounded-sm` | `4px` | Inline chips, small tags inside inputs |
| `rounded-md` | `8px` | Cards, inputs, dropdowns, dialogs — this is the default (`--radius`) |
| `rounded-lg` | `12px` | Large modals, sheet drawers, image thumbnails |
| `rounded-xl` | `16px` | Auth panel decorative sections |
| `rounded-full` | `9999px` | Buttons (primary and secondary), avatars, unread count badges, pill tags |

**Rule:** `--radius: 8px` is the global default. shadcn/ui components inherit this value. Override per-component in Tailwind only when the table above specifies a different value.

---

## 7. Shadow System

Shadows are minimal. Depth is communicated through background tone differences and border contrast, not large drop shadows.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `rgba(0,0,0,0.03) 0px 1.2px 0px 0px` | Subtle bottom-edge line for table rows, list separators |
| `shadow-card-light` | `rgba(14,26,62,0.06) 0px 1px 3px, rgba(14,26,62,0.04) 0px 0px 0px 1px` | Cards in light mode |
| `shadow-card-dark` | `rgba(0,0,0,0.3) 0px 1px 3px 0px` | Cards in dark mode (supplementary to border) |
| `shadow-btn-primary` | `rgba(0,0,0,0.01) 0px 5px 2px, rgba(0,0,0,0.04) 0px 3px 2px, rgba(0,0,0,0.07) 0px 1px 1px, rgba(0,0,0,0.08) 0px 0px 1px` | All primary buttons |
| `shadow-btn-secondary` | `rgba(255,255,255,0.03) 0px 0px 0px 1px inset, rgba(255,255,255,0.04) 0px 1px 0px 0px inset, rgba(0,0,0,0.6) 0px 0px 0px 1px, rgba(0,0,0,0.1) 0px 4px 4px 0px` | Secondary buttons (dark mode) |
| `shadow-inner` | `rgba(0,0,0,0.2) 0px 0px 12px 0px inset` | Active input inner glow |
| `shadow-modal` | `rgba(0,0,0,0.2) 0px 8px 40px 0px` | Dialogs, sheet drawers |

**Prohibited:** `shadow-lg`, `shadow-xl`, colored shadows, outer glows. No exceptions.

---

## 8. Component Styling Rules

### 8.1 Application Shell

**Authenticated layout structure:**
```
┌──────────────────────────────────────────────────────┐
│  Sidebar (256px, fixed)         │  Main Content Area │
│  bg: sidebar-bg                 │  bg: background    │
│  border-r: 1px border           │  flex-1            │
│  (always rendered in dark navy) │  overflow-y-auto   │
│                                 │  max-w: 1200px     │
│                                 │  mx-auto           │
└──────────────────────────────────────────────────────┘
```

**Tailwind shell pattern:**
```tsx
<div className="flex min-h-screen bg-background">
  <Sidebar />
  <main className="flex-1 overflow-y-auto">
    <div className="max-w-[1200px] mx-auto px-4 md:px-7 lg:px-[60px] pt-8">
      {children}
    </div>
  </main>
</div>
```

**Mobile:** Sidebar is hidden off-canvas (`-translate-x-full`). A hamburger button (`Menu` icon from Lucide) in a fixed top-left position opens it as a slide-in drawer with a dark overlay backdrop.

---

### 8.2 Sidebar

| Property | Value |
|----------|-------|
| Width | `256px` (`w-64`) |
| Background | `hsl(var(--sidebar-bg))` — always dark navy regardless of theme |
| Text | `hsl(var(--sidebar-fg))` |
| Right border | `1px solid hsl(var(--sidebar-border))` |
| Position | `fixed left-0 top-0 h-full z-40` |
| Padding | `px-3 py-4` |
| Logo area | Top section, `mb-8` |
| Nav item height | `44px` (`min-h-[44px]`) — minimum touch target |
| Nav item padding | `px-3 py-2` |
| Nav item font | `text-[15px] font-[510]` |
| Nav item radius | `rounded-md` |
| Active item background | `hsl(var(--sidebar-active))` |
| Active item text | `hsl(var(--primary-foreground))` (white) |
| Inactive item text | `hsl(var(--sidebar-fg) / 0.65)` |
| Inactive item hover bg | `hsl(var(--sidebar-fg) / 0.08)` |
| Icon size | `20px`, `mr-3` before label |
| Divider between groups | `1px solid hsl(var(--sidebar-border))`, `my-2` |
| "About Us" position | Pinned bottom: `mt-auto` |

**Nav item order (top to bottom):**
1. Home (`/`) — `Home` icon
2. Discover (`/discover`) — `Compass` icon
3. Online Courses (`/online-courses`) — `GraduationCap` icon
4. Leaderboard (`/leaderboard`) — `Trophy` icon
5. Profile (`/profile`) — `User` icon
6. Notifications (`/notifications`) — `Bell` icon with unread badge
7. Divider + About Us (`/about`) — `Info` icon — pinned to bottom

**Notification badge:** `absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[11px] font-medium flex items-center justify-center px-1`

---

### 8.3 Buttons

All buttons use `rounded-full` (9999px), minimum height `44px`, minimum width `127px`, font size `16px`, font weight `510`.

#### Primary Button

| Property | Light Mode | Dark Mode |
|----------|-----------|-----------|
| Background | `hsl(var(--primary))` = `#544BBA` | `hsl(var(--primary))` = `#6B65E3` |
| Text | `hsl(var(--primary-foreground))` = white | white |
| Border | none | none |
| Shadow | `shadow-btn-primary` | `shadow-btn-primary` |
| Hover background | `hsl(var(--accent))` = `#6B65E3` | `#7F7AE8` (lighten 5%) |
| Focus ring | `ring-2 ring-ring ring-offset-2` | same |
| Disabled | `opacity-50 cursor-not-allowed` | same |

```tsx
// Tailwind classes for primary button
className="inline-flex items-center justify-center rounded-full
           bg-primary text-primary-foreground
           px-[20px] py-[14px] text-[16px] font-[510]
           min-w-[127px] min-h-[44px]
           shadow-btn-primary
           hover:bg-accent transition-colors duration-150
           focus-visible:outline-none focus-visible:ring-2
           focus-visible:ring-ring focus-visible:ring-offset-2
           disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
```

#### Secondary Button

| Property | Light Mode | Dark Mode |
|----------|-----------|-----------|
| Background | `transparent` | `transparent` |
| Text | `hsl(var(--primary))` = `#544BBA` | `hsl(var(--secondary-foreground))` = `#A9A7E9` |
| Border (light) | `1px solid hsl(var(--primary))` | — |
| Shadow (dark) | — | `shadow-btn-secondary` |
| Hover background | `hsl(var(--primary) / 0.06)` | `hsl(var(--primary) / 0.12)` |

#### Ghost Button (for icon-only and inline actions)

| Property | Value |
|----------|-------|
| Background | `transparent` |
| Text | `hsl(var(--muted-foreground))` |
| Hover background | `hsl(var(--muted))` |
| Border radius | `rounded-md` |
| Padding | `p-2` (8px, square for icon-only) |
| Min size | `36px × 36px` (icon buttons may be smaller than primary, but never below 36px) |

#### Destructive Button

| Property | Value |
|----------|-------|
| Background | `hsl(var(--destructive))` |
| Text | `hsl(var(--destructive-foreground))` |
| Hover | `hsl(var(--destructive) / 0.85)` |
| Border radius | `rounded-full` |

#### Loading State (all button variants)

When a button is in a loading state (e.g., during form submission): replace button text with `<Loader2 className="animate-spin w-4 h-4" />` and set `disabled`. Do not change button size.

---

### 8.4 Cards

**Base card styles** applied to all card components:

| Property | Light Mode | Dark Mode |
|----------|-----------|-----------|
| Background | `hsl(var(--card))` = `#FFFFFF` | `hsl(var(--card))` = `#0D1829` |
| Text | `hsl(var(--card-foreground))` | `hsl(var(--card-foreground))` |
| Border | `1px solid hsl(var(--border))` | `1px solid hsl(var(--border))` |
| Border radius | `rounded-md` (8px) | `rounded-md` |
| Shadow | `shadow-card-light` | `shadow-card-dark` |
| Padding | `pt-6 px-6 pb-7` (top=24px, horizontal=24px, bottom=28px) | same |

**Interactive card hover** (SpaceCard, PostCard, MaterialCard):
```tsx
className="hover:border-primary/30 transition-all duration-150"
```

---

#### 8.4.1 SpaceCard

**Layout:**
```
┌─────────────────────────────────────┐
│  [Category Badge]      [Member Count Icon + N]  │
│  ─────────────────────────────────── │
│  Space Name (h3, line-clamp-1)      │
│  Description (body, line-clamp-2)   │
│  ─────────────────────────────────── │
│  [Join Button] or [→ Open Space]    │
└─────────────────────────────────────┘
```

- **Entire card is clickable** when user is a member (`cursor-pointer`).
- **Join button:** Secondary variant, positioned bottom-right.
- **Category badge:** `rounded-full bg-secondary text-secondary-foreground text-[13px] font-medium px-2 py-0.5`.
- **Member count:** `<Users size={14} className="mr-1 text-muted-foreground" />` + `text-[13px] text-muted-foreground`.

---

#### 8.4.2 PostCard

**Layout:**
```
┌─────────────────────────────────────┐
│  [Avatar sm] Author · Date   [Solved Badge?]  │
│  ─────────────────────────────────── │
│  Post Title (h3, line-clamp-2)      │
│  Post Body (body, line-clamp-3)     │
│  ─────────────────────────────────── │
│  [👍 Good Q (N)]  [👁 Views (N)]  [💬 Answers (N)]  │
│  ─────────────────────────────────── │
│  [Top 3 answer previews, inline]    │
│  [Answer textarea + Submit btn]     │
└─────────────────────────────────────┘
```

- **Solved badge:** `rounded-full text-[13px] font-medium px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`.
- **Good Question button (voted):** `text-primary fill-primary` icon fill; bg tint `bg-primary/8`.
- **Good Question button (unvoted):** Ghost button style, `text-muted-foreground`.
- **Author disabled state (cannot vote own post):** `opacity-50 cursor-not-allowed pointer-events-none`.
- **View count:** `text-[13px] text-muted-foreground`, `<Eye size={14} />` icon.

---

#### 8.4.3 AnswerCard

**Layout:**
```
┌─────────────────────────────────────┐
│  [Avatar sm] Author · Date  [Accepted Badge?]  │
│  ─────────────────────────────────── │
│  Answer Body (body text, no clamp)  │
│  ─────────────────────────────────── │
│  [↑ Upvote (N)]  [✓ Accept] (post author only)  │
└─────────────────────────────────────┘
```

- **Accepted card:** Left accent border `border-l-[3px] border-primary` on the card; increases visual weight of the accepted answer.
- **Accepted badge:** `rounded-md bg-primary/10 text-primary dark:bg-primary/20 text-[13px] font-medium px-2 py-0.5`.
- **Upvote button (active):** `text-primary`, `<ArrowUp />` icon filled.
- **Accept button:** Ghost button, visible only to post author, hidden after acceptance (replaced by accepted badge).

---

#### 8.4.4 MaterialFileCard

**Layout:**
```
┌─────────────────────────────────────┐
│  [FileTypeIcon 24px]  [File Type Badge]  │
│  ─────────────────────────────────── │
│  Title (h4, line-clamp-1)           │
│  Description (body, line-clamp-2)   │
│  ─────────────────────────────────── │
│  Uploader · Date                    │
│  [🔖 N]  [↓ Download]  [🔖 Toggle] │
└─────────────────────────────────────┘
```

**File type badge colors:**

| Type | Light | Dark |
|------|-------|------|
| PDF | `bg-red-100 text-red-700` | `bg-red-900/30 text-red-400` |
| DOCX / DOC | `bg-blue-100 text-blue-700` | `bg-blue-900/30 text-blue-400` |
| TXT | `bg-gray-100 text-gray-600` | `bg-gray-800/50 text-gray-400` |
| MD | `bg-orange-100 text-orange-700` | `bg-orange-900/30 text-orange-400` |

**Bookmark icon (active):** `<Bookmark className="fill-primary stroke-primary" />`.
**Bookmark icon (inactive):** `<Bookmark className="stroke-muted-foreground" />`.

---

#### 8.4.5 MaterialLinkCard

Same layout as MaterialFileCard. Replace file icon with `<ExternalLink size={24} className="text-muted-foreground" />`. No Download button. Show a "Visit Link" button using the secondary button style that opens `material.url` in a new tab.

---

#### 8.4.6 OnlineCourseCard (static)

**Layout:**
```
┌─────────────────────────────────────┐
│  [Source Logo/Icon]  [Source Label] │
│  ─────────────────────────────────── │
│  Title (h3, line-clamp-2)           │
│  Description (body, line-clamp-2)   │
│  ─────────────────────────────────── │
│  ★ 4.8  (12,000 reviews)           │
│  [Go To →]  (secondary button)      │
└─────────────────────────────────────┘
```

- Star rating: `text-yellow-400`, `text-[13px]`.
- Review count: `text-muted-foreground text-[13px]`.

---

### 8.5 Forms and Inputs

| Property | Light Mode | Dark Mode |
|----------|-----------|-----------|
| Background | `hsl(var(--card))` | `hsl(var(--input))` |
| Border | `1px solid hsl(var(--input))` | `1px solid hsl(var(--input))` |
| Text | `hsl(var(--foreground))` | `hsl(var(--foreground))` |
| Placeholder | `hsl(var(--muted-foreground))` | `hsl(var(--muted-foreground))` |
| Focus border | `hsl(var(--ring))` via `ring-2 ring-ring` | same |
| Error border | `hsl(var(--destructive))` | same |
| Border radius | `rounded-md` (8px) | `rounded-md` |
| Height | `44px` (`h-11`) | `44px` |
| Padding | `px-[14px] py-[12px]` | same |
| Font size | `15px` | `15px` |

**Textarea:** Same as input. `min-h-[100px]`, `resize-y`.

**Select:** Uses shadcn `<Select>`. Same appearance as input.

**Form label:** `text-[15px] font-[510] text-foreground mb-[8px] block`.

**Form error message:** `text-[13px] text-destructive mt-[4px]`.

**Form group vertical gap:** `gap-y-4` (16px) between fields within a group.

**Form section vertical gap:** `gap-y-7` (28px) between major form sections.

**Password strength indicator (Register page):**
- 5 horizontal segments: `h-[3px] flex-1 rounded-full transition-colors duration-200`
- Segments filled left-to-right based on complexity score
- Score 0: all `bg-muted`
- Score 1–2: first N segments `bg-destructive`
- Score 3: first N segments `bg-yellow-500`
- Score 4–5: all segments `bg-green-500`
- Placed `mt-[8px]` below the password input

**Show/hide password toggle:** `<Eye>` / `<EyeOff>` ghost button inside the input right edge (`absolute right-3 top-1/2 -translate-y-1/2`).

---

### 8.6 Badges and Tags

**Base:** `inline-flex items-center rounded-full text-[13px] font-medium px-2 py-0.5`

| Variant | Light | Dark |
|---------|-------|------|
| Default | `bg-muted text-muted-foreground` | same |
| Primary | `bg-primary/10 text-primary` | `bg-primary/20 text-primary` |
| Success | `bg-green-100 text-green-700` | `bg-green-900/30 text-green-400` |
| Destructive | `bg-destructive/10 text-destructive` | same |
| Warning | `bg-yellow-100 text-yellow-700` | `bg-yellow-900/30 text-yellow-400` |
| Accent | `bg-accent/10 text-accent` | `bg-accent/20 text-accent` |

**Usage mapping:**
- Category badge (SpaceCard): Default variant.
- Solved badge (PostCard): Success variant.
- Accepted badge (AnswerCard): Primary variant.
- File type badge (MaterialFileCard): Color-matched per file type (see §8.4.4).
- XP level badge: Primary variant with `rounded-md` instead of `rounded-full`.
- Recommendation reason tag: Accent variant, `rounded-sm`.

---

### 8.7 Dialogs and Modals

| Property | Value |
|----------|-------|
| Overlay | `fixed inset-0 bg-black/50 dark:bg-black/70 z-50` |
| Dialog container | `fixed inset-0 flex items-center justify-center z-50 p-4` |
| Dialog background | `hsl(var(--popover))` |
| Dialog border | `1px solid hsl(var(--border))` |
| Dialog border radius | `rounded-lg` (12px) |
| Dialog shadow | `shadow-modal` |
| Dialog max-width (default) | `max-w-[480px] w-full` |
| Dialog max-width (wide) | `max-w-[640px] w-full` — space conflict flow, create space form |
| Dialog padding | `p-7` (28px) |
| Title | `text-[20px] leading-[26.6px] tracking-[-0.24px] font-[510]` |
| Close button | Top-right, `absolute top-4 right-4`, ghost icon button (`<X size={20} />`) |

**Space creation conflict dialog** uses the wide `640px` width with a scrollable content section (`max-h-[60vh] overflow-y-auto`) for the similar spaces list.

---

### 8.8 Tabs

| Property | Value |
|----------|-------|
| Tab bar container | `border-b border-border` |
| Tab list background | `transparent` |
| Active tab text | `text-foreground font-[510]` |
| Active tab indicator | `border-b-2 border-primary` — flush with container bottom border |
| Inactive tab text | `text-muted-foreground font-[510]` |
| Inactive tab hover text | `text-foreground` |
| Tab padding | `px-4 py-3` |
| Tab font size | `text-[15px]` |
| Gap between tabs | none — tabs sit adjacent |

**Tab variants by context:**

| Context | Style |
|---------|-------|
| Space detail (Posts / Materials / Leaderboard) | Full-width bar at top of content area, `text-[15px]` |
| Profile (Info / Gamification) | Same as above |
| Materials sub-tabs (Files / Links / Bookmarked) | Secondary tab bar below the primary, `text-[13px]`, smaller padding |

---

### 8.9 Tables (Course Registrations)

| Property | Light Mode | Dark Mode |
|----------|-----------|-----------|
| Header background | `hsl(var(--muted))` | `hsl(var(--muted))` |
| Header text | `text-[13px] font-medium text-muted-foreground uppercase tracking-wide` | same |
| Row background | `hsl(var(--card))` | `hsl(var(--card))` |
| Row hover | `hsl(var(--muted) / 0.5)` | same |
| Row border | `border-b border-border` | same |
| Cell text | `text-[15px] text-foreground` | same |
| Cell padding | `px-4 py-3` | same |
| Table border radius | Wrap table in `rounded-md overflow-hidden border border-border` | same |
| Action buttons cell | Right-aligned, `flex gap-2 justify-end` |

**Column pattern for course registration table:**
| Course Code | Course Name | Semester | Year | Grade | Status | Actions |

---

### 8.10 Progress Bars (XP Progress)

| Property | Value |
|----------|-------|
| Track background | `hsl(var(--muted))` |
| Track border radius | `rounded-full` |
| Track height | `8px` |
| Fill (light mode) | `linear-gradient(90deg, #544BBA 0%, #6B65E3 100%)` |
| Fill (dark mode) | `linear-gradient(90deg, #6B65E3 0%, #A9A7E9 100%)` |
| Fill border radius | `rounded-full` |
| Fill transition | `transition-all duration-500 ease-out` |

**XP progress block layout:**
```
Current Level Badge · "X XP / Y XP to Level N"   ← text-[13px] text-muted-foreground
[═══════════════════════░░░░░░░░░░░░░░░░░░░░░░░]  ← progress bar, mt-2
Next Level: N                                      ← text-[12px] text-muted-foreground, mt-1
```

**Level badge:** `rounded-md bg-primary text-primary-foreground text-[13px] font-medium px-2 py-0.5`.

---

### 8.11 Avatars

| Property | Value |
|----------|-------|
| Shape | `rounded-full` |
| Size — small (sm) | `28px` (`w-7 h-7`) — PostCard, AnswerCard inline |
| Size — medium (md) | `40px` (`w-10 h-10`) — Profile page header |
| Size — large (lg) | `56px` (`w-14 h-14`) — Profile detail, leaderboard top 3 |
| Initials background (light) | `hsl(var(--primary) / 0.12)` |
| Initials background (dark) | `hsl(var(--primary) / 0.22)` |
| Initials text | `hsl(var(--primary)) font-medium uppercase` |
| Image fit | `object-cover` |
| Image fallback | Show initials on error |

**Initials generation rule:** First character of first word + first character of last word from `fullName`. Example: "Ahmed Hassan" → "AH".

**Stacked avatars** (e.g., leaderboard row): `ring-2 ring-card` border to separate overlapping circles.

---

### 8.12 Notification Bell and Unread Badge

| Property | Value |
|----------|-------|
| Bell icon | `<Bell size={24} />` from Lucide |
| Bell color (default) | `hsl(var(--sidebar-fg) / 0.65)` |
| Bell color (has unread) | `hsl(var(--sidebar-fg))` |
| Badge background | `hsl(var(--destructive))` |
| Badge text | `white text-[11px] font-medium` |
| Badge size | `min-w-[18px] h-[18px] rounded-full` |
| Badge position | `absolute -top-1 -right-1` |
| Badge padding | `px-1` for counts ≥ 10 |

**Notification list item (unread):**
- Background: `hsl(var(--primary) / 0.06)` (light), `hsl(var(--primary) / 0.12)` (dark)
- Left accent: `border-l-[3px] border-primary`
- Sender name: `font-[510]`

**Notification list item (read):**
- Background: `hsl(var(--card))` (default card surface)
- No left border

**Notification click flow:** Call `PUT /mark-read/{id}` → navigate to deep-link target. Do both synchronously (optimistic update the read state locally first).

---

### 8.13 Toast Notifications

**Library:** `sonner` (configured in `main.tsx`).

```tsx
<Toaster
  richColors
  position="top-right"
  toastOptions={{
    style: {
      fontFamily:
        "'Inter Variable', 'SF Pro Display', -apple-system, sans-serif",
      fontSize: "15px",
    },
  }}
/>
```

| State | Trigger |
|-------|---------|
| Success | Any successful mutation (create, update, delete, join, bookmark, vote) |
| Error | Any failed API call with `message` from `ApiResponse` |
| Info | Non-critical informational messages |

**Rule:** Do not use `alert()`. Do not render error messages inline in components except for form field validation errors (which use the error text style from §8.5).

---

### 8.14 Leaderboard

**Page header banner:**
```css
background: linear-gradient(135deg, #293677 0%, #544BBA 100%);
```
White text on banner. `text-[40px] font-[510]` for "Leaderboard" title. Padding `py-[60px]`.

**Rank row treatments:**

| Rank | Border style | Rank number color |
|------|-------------|------------------|
| 1 | `border-l-4 border-yellow-400` | `text-yellow-400 font-[510]` |
| 2 | `border-l-4 border-slate-400` | `text-slate-400 font-[510]` |
| 3 | `border-l-4 border-orange-400` | `text-orange-400 font-[510]` |
| 4+ | no border | `text-muted-foreground font-normal` |

**Current user row:** `bg-primary/10 dark:bg-primary/15 font-[510]` — visually separated but stays in-position within the ranked list.

**Hints box:** Separate card with `bg-secondary text-secondary-foreground`. Title `text-[16px] font-[510]`. Line items `text-[13px]`. XP values displayed as `text-primary font-medium`.

---

### 8.15 Auth Pages

**Layout:**
```tsx
<div className="flex min-h-screen">
  {/* Form Panel */}
  <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-background">
    <div className="w-full max-w-[400px]">
      {/* form content */}
    </div>
  </div>
  {/* Brand Panel */}
  <div
    className="hidden md:flex w-1/2 flex-col items-center justify-center p-[60px]"
    style={{ background: "linear-gradient(135deg, #0E1A3E 0%, #293677 50%, #544BBA 100%)" }}
  >
    {/* Logo, tagline */}
  </div>
</div>
```

**Panel swap rule:**
- Login: form panel left, brand panel right.
- Register: brand panel left, form panel right.

**Auth page title:** `text-[40px] leading-[44px] tracking-[-0.88px] font-[510] text-foreground mb-2`
**Auth page subtitle:** `text-[15px] text-muted-foreground mb-8`
**Switch page link:** `text-primary underline-offset-4 hover:underline text-[15px]`

**Brand panel content:**
- App logo (SVG or wordmark), white, centered
- Tagline: `text-[20px] font-[510] text-white/90 mt-4 text-center max-w-[300px]`
- Brief description: `text-[15px] text-white/65 mt-2 text-center max-w-[300px]`

---

### 8.16 Empty States

```
┌──────────────────────────────────────┐
│   (centered, py-[60px])              │
│   [SVG icon or Lucide icon, 64px]    │
│   text-muted-foreground              │
│                                      │
│   Heading (heading-3, mt-4)          │
│   text-foreground                    │
│                                      │
│   Body (body, text-center, mt-2)     │
│   max-w-[320px] text-muted-foreground│
│                                      │
│   [Primary CTA] [Secondary CTA]      │
│   flex gap-4 mt-7                    │
└──────────────────────────────────────┘
```

**Home page empty state** (no spaces joined):
- Icon: `Layers` (Lucide)
- Heading: "You haven't joined any spaces yet"
- Body: "Join a study space or create your own to get started."
- Buttons: "Join a Space" (primary) + "Create a Space" (secondary)

**Discover empty state** (no search results):
- Icon: `SearchX` (Lucide)
- Heading: "No spaces found"
- Body: "Try a different search or browse all available spaces."

**Post feed empty state:**
- Icon: `MessageSquare` (Lucide)
- Heading: "No posts yet"
- Body: "Be the first to ask a question in this space."
- Button: "Create Post" (primary)

---

### 8.17 Loading States

**Skeleton pattern:**
```tsx
<div className="bg-muted animate-pulse rounded-md" style={{ height: "Xpx" }} />
```

**Rule:** Show skeleton layouts that match the shape of the expected content. Never show a bare centered spinner for full-page data fetches.

**Button loading:**
```tsx
<button disabled>
  <Loader2 className="animate-spin w-4 h-4 mr-2" />
  Saving...
</button>
```

**Card grid skeleton** (SpaceCards, PostCards):
- Render 6 skeleton card shapes matching real card dimensions while `isLoading === true`.

**Inline mutation loading** (vote, bookmark, accept): Do not show a spinner. Use optimistic updates (toggle the state immediately, revert on error).

---

## 9. Interaction States

| State | Visual Treatment | Duration |
|-------|-----------------|----------|
| Hover (card, row, nav item) | Background: `+ 6–8% opacity` of the muted or primary color | `150ms ease` |
| Focus (keyboard) | `ring-2 ring-ring ring-offset-2 rounded-md` — use `focus-visible:` not `focus:` | instant |
| Active / Pressed | `scale-[0.98]` | `100ms ease` |
| Disabled | `opacity-50 cursor-not-allowed pointer-events-none` | — |
| Selected tab | Active text color + `border-b-2 border-primary` indicator | instant |
| Active nav item | `bg-sidebar-active text-primary-foreground` | instant |
| Voted / Active (toggle) | Icon: `fill-primary stroke-primary`; optional `bg-primary/8` tint | `150ms ease` |
| Bookmarked (toggle) | Icon: `fill-primary stroke-primary` | `150ms ease` |
| Error (input) | `border-destructive ring-destructive` + error message below | instant |
| Loading | `opacity-70` on the triggering element + spinner | — |

**Transition default:** `transition-colors duration-150` for all color changes. `transition-transform duration-100` for scale. Apply only where specified; do not add transitions globally.

**Reduced motion:** Respect `prefers-reduced-motion`. Wrap animated elements:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse, .animate-spin { animation: none; }
  * { transition-duration: 0ms !important; }
}
```

---

## 10. Consistency Rules

**C1 — Tokens only.**
Never use raw hex, RGB, or HSL values in component files. Always reference `hsl(var(--token))` or a Tailwind token class.

**C2 — No one-off colors.**
If a color is needed that is not in the semantic token set (Section 2), add it as a CSS variable in `index.css` before using it. Do not introduce ad-hoc Tailwind `bg-[#HEX]` overrides.

**C3 — Typography from scale only.**
Permitted font sizes: `56px, 40px, 20px, 16px, 15px, 13px, 12px`. All other sizes are forbidden. Do not use arbitrary `text-[17px]` or similar.

**C4 — Spacing from system.**
Preferred spacing values: `8px, 16px, 28px, 60px, 128px`. Use standard Tailwind equivalents or `p-[Xpx]` matching these exact values. Avoid random in-between values.

**C5 — shadcn/ui overrides at variable level.**
Do not edit files inside `src/components/ui/`. Override appearance through CSS variables in Section 2.4. If a component needs structural changes, wrap it in a custom component.

**C6 — Lucide only for icons.**
Do not mix icon libraries. All icons come from `lucide-react`. Icon sizes: `16px` inline, `20px` nav items, `24px` feature icons, `64px` empty state illustrations.

**C7 — Keyboard accessibility is non-negotiable.**
Every interactive element must render a visible `focus-visible` ring in both light and dark modes. Never suppress focus outlines without replacing them.

**C8 — Minimum touch target 44×44px.**
Applies to all buttons, nav items, icon buttons, and interactive card regions. This matches the shadcn button `min-h-[44px]` specification from the Linear source.

**C9 — Explicit text truncation.**
Use `line-clamp-1`, `line-clamp-2`, or `line-clamp-3`. Never use `overflow-hidden` alone without a clamp or `truncate` class.

**C10 — Dark mode via class strategy.**
Apply the `dark` class to the `<html>` element to activate dark mode. Read and persist the user's preference in `localStorage` under the key `"theme"`. Initialize the class before React renders to avoid flash.

**C11 — No decorative gradients.**
Gradients are permitted only in the four cases defined in Section 3. All other surfaces use flat background colors.

**C12 — Responsive breakpoints.**
Mobile first. Use `md:` (768px) for sidebar visibility and two-column layouts. Use `lg:` (1024px) for three-column card grids and full desktop layouts.

**C13 — Font weight 510 for all interactive labels.**
Buttons, nav items, tab labels, card titles, form labels, dialog titles — all use `font-[510]`. Body text and meta text use `font-normal` (400) or `font-medium` (500). Never use 600 or 700 in UI chrome.

**C14 — Independent pagination state.**
Posts pagination, answers pagination, and materials pagination are entirely separate. Never share or sync pagination state between different data sources on the same page.

---

## 11. Implementation Notes

### Dark Mode Initialization (Prevents Flash)

Add this inline script to `index.html` `<head>` before any other scripts:

```html
<script>
  (function () {
    const theme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (theme === "dark" || (!theme && prefersDark)) {
      document.documentElement.classList.add("dark");
    }
  })();
</script>
```

---

### Dark Mode Toggle Component

```tsx
// src/components/shared/ThemeToggle.tsx
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((prev) => !prev)}
      aria-label="Toggle theme"
      className="p-2 rounded-md text-muted-foreground hover:bg-muted
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
```

---

### shadcn/ui Initialization

When running `npx shadcn@latest init`, ensure `components.json` is configured as:

```json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**After init:** Replace the entire `:root` and `.dark` CSS variable block that shadcn generates in `src/index.css` with the declarations in Section 2.4 above. Do not merge — replace entirely.

---

### Card Padding Implementation Note

The Linear source specifies card padding as `0px 24px 28px` (top=0, right/left=24px, bottom=28px). Implement this on the inner content wrapper:

```tsx
<div className="rounded-md border border-border shadow-card-light dark:shadow-card-dark bg-card">
  {/* Any card header with its own top padding */}
  <div className="px-6 pt-6">
    <span className="text-[13px] text-muted-foreground">Category</span>
  </div>
  {/* Card body */}
  <div className="px-6 pb-7">
    {/* content */}
  </div>
</div>
```

---

### Responsive Card Grids

```tsx
// SpaceCard grid (Home page, Discover page)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
  {spaces.map((space) => <SpaceCard key={space.id} space={space} />)}
</div>

// PostCard feed (single column, full width)
<div className="flex flex-col gap-7">
  {posts.map((post) => <PostCard key={post.id} post={post} />)}
</div>

// MaterialCard grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-7">
  {materials.map((m) => <MaterialFileCard key={m.id} material={m} />)}
</div>
```

---

### WCAG AA Contrast Verification

All primary color pairings in this system pass WCAG AA (4.5:1 for body text):

| Foreground | Background | Ratio | Status |
|------------|------------|-------|--------|
| `#FFFFFF` | `#544BBA` (primary light) | ~6.3:1 | ✓ |
| `#FFFFFF` | `#6B65E3` (primary dark) | ~4.8:1 | ✓ |
| `#0E1A3E` | `#FFFFFF` (card light) | ~14.3:1 | ✓ |
| `#F5F5F7` | `#0D1829` (card dark) | ~13.1:1 | ✓ |
| `#A9A7E9` | `#0D1829` (muted dark) | ~7.8:1 | ✓ |
| `#5C6A8A` | `#FFFFFF` (muted light) | ~4.6:1 | ✓ |
| `#F5F5F7` | `#0E1A3E` (sidebar) | ~13.5:1 | ✓ |

---

### Font Weight 510 Compatibility

`font-weight: 510` is valid only for variable fonts (Inter Variable). In Tailwind use `font-[510]`. For fallback fonts that do not support variable weight axes, the browser rounds to `500`. This is an acceptable degradation. Do not provide a non-variable font override — the font stack fallback handles it automatically.

---

*End of Covalent GP Unified Frontend Design System v1.0*
