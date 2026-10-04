# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-10-03

w

### Added

- `Header` component — responsive enterprise header composing `SearchInput`
  from `convenient-store-enterprise-ui-library`
- `IconButton` subcomponent — accessible icon button with optional count badge
- `NavLinks` subcomponent — shared link rendering for desktop and mobile nav
- Desktop layout: brand mark, primary nav, centered search, account and cart
  actions, sticky positioning
- Mobile layout: hamburger toggle, stacked grid, expandable nav drawer with
  escape and outside-click dismissal
- Viewport-aware rendering — desktop and mobile variants controlled by React
  state, not CSS media queries
- `MOBILE_BREAKPOINT` / `MOBILE_MEDIA_QUERY` constants shared between component
  and tests
- Storybook stories: default, cart badge, search dropdown open on sticky header,
  mobile collapsed, mobile drawer open
- Test suite: 18 tests across component and a11y layers, including composed
  `SearchInput` rendering, mobile drawer lifecycle, and axe audits of every state
- Cross-library composition via pinned git-URL dependency
  (`convenient-store-enterprise-ui-library#v0.1.2`)

### Fixed

- `landmark-unique` a11y violation from duplicate `<nav aria-label="Primary">`
  elements — consolidated to a single nav that adapts to viewport
- `nested-interactive` and `aria-required-children` violations inherited from
  SearchInput's listbox structure (fixed upstream in v0.1.1 and v0.1.2)
- Vitest failing to resolve `.css` imports from the external SearchInput
  package — resolved with `server.deps.inline`
- jsdom `localStorage` shadowed by Node 22's experimental stub — resolved with
  a defensive in-memory `Storage` polyfill in `test-setup.ts`
- Prettier reintroducing leading semicolons in storage assignment — refactored
  to avoid the ASI-ambiguous syntax

### Design decisions

- **Composition over duplication.** The Header imports `SearchInput` rather
  than reimplementing search. The dependency is pinned to a git tag and declared
  as a peer so consumers share a single React and SearchInput instance.
- **Viewport state drives render, not CSS.** `isMobile` is React state; the
  DOM reflects what's actually visible. CSS handles layout only.
- **Single `<nav>` element.** Desktop and mobile share one landmark to satisfy
  the `landmark-unique` rule and eliminate ambiguous queries.
- **Fixed-height rows in the recents overlay.** Header layout depends on
  predictable row heights; the fix moves a11y-violating buttons out of the
  listbox into a positioned sibling.

[Unreleased]: https://github.com/AlexLe08/convenient-store-header-library/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/AlexLe08/convenient-store-header-library/releases/tag/v0.1.0
