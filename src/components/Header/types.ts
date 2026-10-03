import type { SearchInputProps } from 'convenient-store-enterprise-ui-library'

export interface NavLink {
  id: string
  label: string
  href: string
}

export interface HeaderProps {
  /** Brand name shown next to the logo mark. */
  brandName?: string
  /** URL for a logo image. Falls back to a text mark if omitted. */
  logoSrc?: string
  logoAlt?: string
  /** Nav links rendered inline on desktop and in the mobile drawer. */
  navLinks?: NavLink[]
  /** Cart item count. Shows a badge when > 0. */
  cartCount?: number
  onCartClick?: () => void
  onAccountClick?: () => void
  /**
   * Props forwarded to the embedded SearchInput.
   * `className` is omitted — the header controls layout.
   */
  searchProps?: Omit<SearchInputProps, 'className'>
  /** Pins the header to the top of the scroll container. */
  sticky?: boolean
  /** Class applied to the outer <header> element. */
  className?: string
}
