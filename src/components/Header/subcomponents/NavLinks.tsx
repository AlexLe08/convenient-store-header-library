import type { NavLink } from '../types'

export interface NavLinksProps {
  links: NavLink[]
  /** Fired when any link is activated. Useful for closing the mobile drawer. */
  onNavigate?: () => void
}

export function NavLinks({ links, onNavigate }: NavLinksProps) {
  return (
    <>
      {links.map((link) => (
        <a key={link.id} href={link.href} onClick={onNavigate}>
          {link.label}
        </a>
      ))}
    </>
  )
}
