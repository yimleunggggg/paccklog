# PACKLOG 行前志 — Cursor Rules

## Project Context
PACKLOG (行前志) is a scenario-based packing list web app for outdoor enthusiasts and frequent travelers. Users select activity scenes (camping, hiking, trail running, diving, festival, etc.) to auto-generate merged, deduplicated gear checklists with status tracking, brand notes, and reference bookmarks.

## Tech Stack
- Next.js 14+ with App Router (NOT Pages Router)
- TypeScript (strict mode)
- Tailwind CSS (dark theme by default)
- Supabase (PostgreSQL, Auth, Storage)
- Framer Motion (animations)
- Zustand (state management)
- shadcn/ui (base components)
- Lucide Icons

## Design System Rules

### Colors
- Background: #0F0F0F (primary), #1A1A1A (cards), #242424 (inputs)
- Accent: #C8956C (warm copper — primary actions), #8B7355 (secondary)
- Status: #4ADE80 (packed/green), #F59E0B (to-buy/amber), #9CA3AF (to-pack/gray), #6B7280 (optional)
- Text: #F5F5F0 (primary), #A0998C (secondary), #6B6560 (tertiary)

### Typography
- Headings & Body: 'DM Sans' (EN) + 'Noto Sans SC' (CN)
- Monospace/Numbers: 'JetBrains Mono'
- NEVER use Inter, Roboto, Arial, or system fonts

### Design Tone
- "Expedition Journal" — warm, professional, outdoor-gear-manual feel
- Dark theme default, warm copper accents
- NOT generic SaaS, NOT purple gradients, NOT corporate clean

## Coding Conventions

### File Structure
- Follow Next.js App Router conventions
- Components in src/components/{domain}/ (trip/, item/, reference/, layout/, shared/, ui/)
- Hooks in src/lib/hooks/
- Stores in src/lib/stores/
- Utils in src/lib/utils/
- Database types in src/lib/supabase/types.ts

### Component Patterns
- Use 'use client' only when needed (client components for interactivity)
- Server Components by default
- Prefer composition over prop drilling
- All components should support both zh-CN and en locales

### Styling
- Tailwind CSS utility classes
- CSS variables for theme colors (defined in globals.css)
- Framer Motion for animations (not CSS animations for complex effects)
- Mobile-first responsive: base styles for mobile, md: for tablet, lg: for desktop

### Data Flow
- Supabase client for browser-side operations
- Supabase server client for Server Components / API routes
- Zustand for client-side UI state (view mode, filters, etc.)
- React Query or SWR patterns for data fetching (optional)

### Naming
- Components: PascalCase (TripCard.tsx)
- Files: kebab-case (trip-card.tsx)
- Database columns: snake_case
- TypeScript interfaces: PascalCase with prefix (e.g., TripItem, SceneTemplate)
- CSS variables: --kebab-case

## Key Business Logic

### Scene Merging Algorithm
When user selects multiple scenes:
1. Collect all items from selected scene templates
2. Match duplicates by name_zh (exact match first, then fuzzy)
3. For duplicates: keep highest priority (must > should > nice_to_have > optional)
4. Merge notes from different sources with " | " separator
5. Track source template IDs for each merged item
6. Sort by: category → priority → sort_order

### Item Statuses
- to_pack: Default state, gray
- packed: User confirmed packed, green with checkmark
- to_buy: Needs purchasing, amber
- optional: Nice to have, dimmed/dashed border

### Container Types
- suitcase: 行李箱
- backpack: 背包
- carry_on: 随身
- wear: 穿着
- undecided: 待定 (default)

## i18n
- Support zh-CN and en
- All user-facing strings should come from i18n files
- Database stores both name_zh and name_en
- Default locale: zh-CN

## Performance
- Lazy load non-critical components
- Optimize images with next/image
- PWA with offline support (service worker)
- Minimize client-side JavaScript

## Accessibility
- Semantic HTML
- ARIA labels for interactive elements
- Keyboard navigation support
- Touch targets minimum 44x44px on mobile

Always read `packlog-prd-v1.md` before writing any new page or component.
Product name is PACKLOG (English) / 行前志 (Chinese). Never use any other name.
