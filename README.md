# Convenient Store Header Library

A responsive enterprise header component that composes the
[Convenient Store Enterprise UI Library](https://github.com/AlexLe08/convenient-store-enterprise-ui-library)
`SearchInput` into a production-shaped navigation shell.

> **Note:** This is a portfolio project inspired by my experience at a large
> retail enterprise, where the header component and the search input were owned
> by **different teams**. The header team consumed the search team's published
> package, integrated it into a navigation shell, and the whole composition was
> brought into a Next.js application. This repository represents the middle
> tier of that architecture — a consumer library that composes another
> library, published independently, with its own version cadence and its own
> visual regression testing.
>
> It is **not** a fork or mirror of my former employer's code. Everything here
> is written from scratch, using modern packages and patterns that showcase
> both my past and present-day skills.

---

## Live Preview

**→ [View the Storybook](https://main--<appId>.chromatic.com)** _(URL populated after Chromatic setup)_

No setup required. Step through the desktop header, mobile drawer, and the
search dropdown rendered above the sticky header.

---

## Why This Exists

Real enterprise headers aren't monolithic. They're composed:

- The **search team** owns the search input — autosuggest, recents, keyboard
  navigation, ARIA. It ships on its own cadence.
- The **header team** owns the navigation shell — logo, links, cart, account,
  mobile drawer. It depends on the search package and pins a version.
- The **app team** consumes both — installs the header (which transitively
  brings the search library), imports one stylesheet, and renders.

This repository is the middle tier. It exists to demonstrate that the
composition boundary works end to end, and to prove — with tests, CI, and a
live build — that a library can consume another library without inheriting its
internals or doubling its React tree.

---

## What's Inside

```
src/
├── components/
│   └── Header/
│       ├── Header.tsx                  # Main component — desktop + mobile layouts
│       ├── Header.module.css           # Scoped styles, grid layout, drawer
│       ├── Header.test.tsx             # 15 component tests
│       ├── Header.a11y.test.tsx        # 3 axe audits across states
│       ├── Header.stories.tsx          # 5 stories, desktop + mobile
│       ├── constants.ts                # Shared breakpoint query
│       ├── types.ts                    # Public prop types
│       └── subcomponents/
│           ├── IconButton.tsx
│           └── NavLinks.tsx
├── test-match-media.ts                 # matchMedia mock for jsdom
├── test-setup.ts                       # DOM matchers, axe, storage polyfill
└── index.ts
```

**Total:** 8 source files, 18 tests, 100% a11y coverage across stories.

---

## Composition Architecture

| Concern               | How it's handled                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Dependency**        | `convenient-store-enterprise-ui-library` pinned to a git tag (`#v0.1.2`)                                        |
| **Peer relationship** | Declared as a peer dependency so consumers share one instance                                                   |
| **Externalizing**     | SearchInput is in `rollupOptions.external` — Header's build never bundles it                                    |
| **CSS**               | Header imports `convenient-store-enterprise-ui-library/index.css`; both stylesheets merge into `dist/index.css` |
| **React**             | Declared as a peer on both libraries; npm dedupes to a single React 18 instance                                 |

**Why peer + git-URL:** SearchInput must be a **peer** so the app has one copy
(duplicated React state breaks hooks). It must be a **devDependency** so Header
can build against a specific version. The git tag pins that version, and the
release cycle is: fix upstream → tag → bump downstream → reinstall.

This is the same discipline a private npm registry (JFrog, Verdaccio, GitHub
Packages) enforces — the difference is a git URL instead of a registry
endpoint.

---

## Quick Start

```bash
npm install
npm run storybook      # http://localhost:6007
```

```bash
npm run check          # lint + typecheck + test
npm run build          # produces dist/index.js, dist/index.cjs, dist/index.d.ts, dist/index.css
```

---

## Usage

```tsx
import { Header } from 'convenient-store-header-library'
import 'convenient-store-header-library/index.css'

function App() {
  return (
    <Header
      brandName="Convenient Store"
      navLinks={[
        { id: 'deals', label: 'Deals', href: '/deals' },
        { id: 'new', label: 'New Arrivals', href: '/new' },
      ]}
      cartCount={3}
      onCartClick={() => navigate('/cart')}
      onAccountClick={() => navigate('/account')}
      searchProps={{
        suggestions: products,
        placeholder: 'Search products…',
        'aria-label': 'Search products',
        onSearch: (query, source) => trackSearch(query, source),
      }}
    />
  )
}
```

**Notice what the consumer doesn't do:** they don't import SearchInput's
stylesheet separately, they don't configure the breakpoint, they don't pass
React as a dependency. The Header owns all of that.

---

## Key Design Decisions

### 1. Viewport state drives render, not CSS

The header uses `window.matchMedia` to track viewport width. `isMobile` is
React state, and the DOM reflects what's actually visible — desktop nav is
conditionally rendered only on desktop, hamburger only on mobile.

**Why not `@media` alone:** jsdom doesn't evaluate media queries. Any
visibility rule expressed only in CSS is invisible to tests, to accessibility
tooling, and to server-side rendering. If a change affects what's _in_ the
DOM semantically, it belongs in the render, not the stylesheet.

**Trade-off:** during hydration, the initial render may briefly flash the
desktop layout on mobile devices. In a Next.js consumer, this is handled by
`useIsMobile` returning `null` until after mount, or by CSS-first responsive
patterns. Documented and accepted at this layer.

### 2. Single `<nav>` element

Desktop and mobile share one `<nav aria-label="Primary">`. The class changes
based on `isMobile`, but the landmark is unique. This satisfies axe's
`landmark-unique` rule and eliminates ambiguous screen reader announcements
("Primary navigation, Primary navigation").

### 3. Fixed-height rows in the recents overlay

The recents-remove buttons sit in a positioned overlay **sibling** to the
listbox, aligned via fixed row heights. This satisfies both `nested-interactive`
and `aria-required-children` at once — the listbox contains only `group` and
`option` roles; no interactive content anywhere in its subtree.

### 4. Sticky header, portaled dropdown, z-index contract

The header is `z-index: 40`. SearchInput's portaled dropdown is `z-index: 50`.
The portal escapes the header's stacking context, so the dropdown renders above
even when the header is sticky. **This contract is load-bearing** — changing
either value breaks the visual layering. Documented in the CSS.

---

## Testing Strategy

18 tests across two layers:

| Layer             | Tests | What it covers                                                                                     |
| ----------------- | ----- | -------------------------------------------------------------------------------------------------- |
| **Component**     | 15    | Composition with SearchInput, cart badge, nav links, mobile drawer lifecycle, viewport transitions |
| **Accessibility** | 3     | axe-core audits of default, cart badge, and open drawer states                                     |

Notable tests:

- **`renders the composed SearchInput`** — end-to-end proof that library A
  renders inside library B in the test environment
- **`closes the drawer on mousedown outside the header`** — verifies the
  document-level listener registered in `useEffect`
- **`closes the drawer when the viewport crosses the breakpoint`** — verifies
  the `matchMedia` listener updates `isMobile` and closes the drawer
- **`has no violations with the mobile drawer open`** — axe scans the full
  document, including both the header and the portaled dropdown

**Test infrastructure** lives in the repo, not the library. The localStorage
polyfill, the `matchMedia` mock, and the axe matchers all live in
`src/test-setup.ts` and `src/test-match-media.ts`. Test-environment concerns
belong to the repo running the tests.

---

## Engineering Problems Worth Documenting

Composition surfaced bugs that the SearchInput library's own tests couldn't
catch. These are documented because the _process_ matters as much as the fix.

1. **Phantom CSS export.** SearchInput's `package.json` declared
   `"./style.css": "./dist/style.css"`, but Vite's library mode emits
   `index.css`. The export pointed at a file that never existed. The bug was in
   the library since day one — nothing inside the library used the public
   export path, so nothing caught it. Only a real consumer hit the failure.

2. **npm cache staleness on retag.** Retagging a release (`v0.1.2` → new
   commit) didn't take effect for the consumer. The `version` field in
   `package.json` was still `0.1.0` while the git tag was `v0.1.2`. npm's cache
   keys on `name@version`, so two commits claiming the same version were
   indistinguishable. Fix: bump the version field to match the tag.

3. **External CSS in Vitest.** Vitest loads `node_modules` through Node's ESM
   loader, which rejects `.css` files with `ERR_UNKNOWN_FILE_EXTENSION`.
   Resolved via `server.deps.inline: ['convenient-store-enterprise-ui-library']`
   in `vitest.config.ts` — routes the package through Vite's transform pipeline
   instead of Node's.

4. **Node 22 localStorage shadows jsdom's.** The same issue from SearchInput
   reappeared in Header. Each repo has its own `test-setup.ts` because
   test-environment concerns don't travel with the library. Duplicate twice,
   extract on the third.

5. **CSS-driven visibility broke testing and a11y.** The header originally used
   `@media` queries to hide the desktop nav and hamburger toggle. jsdom doesn't
   evaluate media queries, so testing-library correctly reported the buttons as
   inaccessible. Screen readers saw two "Primary" landmarks because both nav
   elements existed in the DOM. Fix: `isMobile` state drives render; CSS handles
   layout only.

---

## Scripts

```bash
npm run storybook      # Storybook dev server (port 6007)
npm run build          # Build the library
npm run check          # lint + typecheck + test
npm run test           # Vitest in watch mode
npm run test:coverage  # Coverage report
npm run lint:fix       # Auto-fix lint issues
npm run format         # Prettier
```

---

## Related Repositories

- **[Convenient Store Enterprise UI Library](https://github.com/AlexLe08/convenient-store-enterprise-ui-library)** —
  the SearchInput library this Header composes
- **Convenient Store Next.js App** _(link added when built)_ — the final
  consumer that brings both libraries together in a live page

---

## License

MIT
