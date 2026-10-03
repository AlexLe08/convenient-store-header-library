import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { SearchInput } from 'convenient-store-enterprise-ui-library'
import 'convenient-store-enterprise-ui-library/index.css'
import { IconButton } from './subcomponents/IconButton'
import { NavLinks } from './subcomponents/NavLinks'
import type { HeaderProps } from './types'
import styles from './Header.module.css'
import { MOBILE_MEDIA_QUERY } from './constants'

export function Header({
  brandName = 'Convenient Store',
  logoSrc,
  logoAlt = '',
  navLinks = [],
  cartCount = 0,
  onCartClick,
  onAccountClick,
  searchProps,
  sticky = true,
  className,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const menuId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  // Track viewport width to decide whether the drawer is used.
  // The CSS controls layout; this only affects which ARIA/behavior paths run.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(MOBILE_MEDIA_QUERY)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Close the drawer when the viewport grows past the breakpoint.
  useEffect(() => {
    if (!isMobile) setMenuOpen(false)
  }, [isMobile])

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    toggleRef.current?.focus()
  }, [])

  // Escape closes; click outside closes. Both only while the drawer is open.
  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (headerRef.current?.contains(target)) return
      setMenuOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [menuOpen, closeMenu])

  const handleToggle = () => setMenuOpen((open) => !open)

  return (
    <header
      ref={headerRef}
      className={[styles.header, sticky ? styles.sticky : '', className].filter(Boolean).join(' ')}
    >
      <div className={styles.inner}>
        {/* Hamburger — mobile only */}
        <div className={styles.hamburgerSlot}>
          <IconButton
            ref={toggleRef}
            label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={handleToggle}
            className={styles.hamburgerButton}
          >
            <HamburgerIcon open={menuOpen} />
          </IconButton>
        </div>

        {/* Logo + brand */}
        <a href="/" className={styles.logo} aria-label={`${brandName} home`}>
          {logoSrc ? (
            <img src={logoSrc} alt={logoAlt} className={styles.logoImage} />
          ) : (
            <span className={styles.logoMark} aria-hidden="true">
              {brandName.slice(0, 2).toUpperCase()}
            </span>
          )}
          <span className={styles.brandName}>{brandName}</span>
        </a>

        {/* Desktop nav — hidden on mobile via CSS */}
        <nav className={styles.desktopNav} aria-label="Primary">
          <NavLinks links={navLinks} />
        </nav>

        {/* Search — full width below on mobile, centered on desktop */}
        <div className={styles.searchSlot}>
          <SearchInput {...searchProps} />
        </div>

        {/* Actions */}
        <div className={styles.actionsSlot}>
          <IconButton label="Account" onClick={onAccountClick}>
            <AccountIcon />
          </IconButton>
          <IconButton
            label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
            onClick={onCartClick}
            badgeCount={cartCount}
          >
            <CartIcon />
          </IconButton>
        </div>

        {/* Mobile nav drawer */}
        <nav
          id={menuId}
          className={styles.mobileNav}
          data-open={menuOpen ? 'true' : undefined}
          aria-label="Primary"
          aria-hidden={!isMobile || !menuOpen}
        >
          <NavLinks links={navLinks} onNavigate={() => setMenuOpen(false)} />
        </nav>
      </div>
    </header>
  )
}

// ─── Inline icons ──────────────────────────────────────────────────────────

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" focusable="false">
      {open ? (
        <path
          d="M5 5l10 10M15 5L5 15"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <path
          d="M4 6h12M4 10h12M4 14h12"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  )
}

function CartIcon() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" focusable="false">
      <path
        d="M6 6V4a4 4 0 0 1 8 0v2M5 6h10l1 10H4L5 6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" focusable="false">
      <circle cx="10" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 17a6 6 0 0 1 12 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
