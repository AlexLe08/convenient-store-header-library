import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Header } from './Header'
import { MOBILE_MEDIA_QUERY } from './constants'
import { resetViewportMatches, setViewportMatch } from '@/test-match-media'
import type { NavLink } from './types'

const NAV: NavLink[] = [
  { id: 'deals', label: 'Deals', href: '#deals' },
  { id: 'support', label: 'Support', href: '#support' },
]

const baseProps = {
  brandName: 'Convenient Store',
  navLinks: NAV,
  searchProps: { 'aria-label': 'Search products' },
}

describe('Header', () => {
  beforeEach(() => {
    resetViewportMatches()
  })

  it('renders the brand name and logo mark', () => {
    render(<Header {...baseProps} />)
    expect(screen.getByText('Convenient Store')).toBeInTheDocument()
    expect(screen.getByLabelText('Convenient Store home')).toBeInTheDocument()
  })

  it('renders the logo image when logoSrc is provided', () => {
    render(<Header {...baseProps} logoSrc="/logo.svg" logoAlt="Logo" />)
    const image = screen.getByAltText('Logo')
    expect(image).toHaveAttribute('src', '/logo.svg')
  })

  it('renders all nav links', () => {
    render(<Header {...baseProps} />)
    expect(screen.getByRole('link', { name: 'Deals' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Support' })).toBeInTheDocument()
  })

  it('renders the composed SearchInput', () => {
    render(<Header {...baseProps} />)
    expect(screen.getByRole('combobox', { name: 'Search products' })).toBeInTheDocument()
  })

  it('hides the cart badge when cartCount is 0', () => {
    render(<Header {...baseProps} cartCount={0} />)
    expect(screen.getByRole('button', { name: /Cart$/ })).toBeInTheDocument()
    expect(document.querySelector('[class*="badge"]')).not.toBeInTheDocument()
  })

  it('shows the cart badge when cartCount > 0', () => {
    render(<Header {...baseProps} cartCount={7} />)
    expect(screen.getByRole('button', { name: /Cart, 7 items/ })).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('caps the cart badge label at 99+', () => {
    render(<Header {...baseProps} cartCount={150} />)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('fires onCartClick when the cart button is clicked', async () => {
    const onCartClick = vi.fn()
    render(<Header {...baseProps} onCartClick={onCartClick} />)
    await userEvent.click(screen.getByRole('button', { name: /Cart/ }))
    expect(onCartClick).toHaveBeenCalledTimes(1)
  })

  it('fires onAccountClick when the account button is clicked', async () => {
    const onAccountClick = vi.fn()
    render(<Header {...baseProps} onAccountClick={onAccountClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Account' }))
    expect(onAccountClick).toHaveBeenCalledTimes(1)
  })

  describe('mobile', () => {
    beforeEach(() => {
      setViewportMatch(MOBILE_MEDIA_QUERY, true)
    })

    it('renders the hamburger toggle', () => {
      render(<Header {...baseProps} />)
      expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
    })

    it('opens the drawer when the toggle is clicked', async () => {
      render(<Header {...baseProps} />)
      const toggle = screen.getByRole('button', { name: 'Open menu' })
      expect(toggle).toHaveAttribute('aria-expanded', 'false')

      await userEvent.click(toggle)

      expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
        'aria-expanded',
        'true'
      )
    })

    it('closes the drawer on Escape and returns focus to the toggle', async () => {
      render(<Header {...baseProps} />)
      const toggle = screen.getByRole('button', { name: 'Open menu' })
      await userEvent.click(toggle)

      await userEvent.keyboard('{Escape}')

      expect(toggle).toHaveAttribute('aria-expanded', 'false')
      expect(toggle).toHaveFocus()
    })

    it('closes the drawer on mousedown outside the header', async () => {
      render(
        <>
          <Header {...baseProps} />
          <button type="button">Outside</button>
        </>
      )
      await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
      expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument()

      fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }))

      expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
        'aria-expanded',
        'false'
      )
    })

    it('closes the drawer when a nav link is clicked', async () => {
      render(<Header {...baseProps} />)
      await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))

      // The nav link inside the mobile drawer
      const mobileDrawer = document.getElementById(
        screen.getByRole('button', { name: 'Close menu' }).getAttribute('aria-controls') ?? ''
      )
      const link = mobileDrawer?.querySelector('a')
      await userEvent.click(link as HTMLAnchorElement)

      expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
        'aria-expanded',
        'false'
      )
    })

    it('closes the drawer when the viewport crosses the breakpoint', () => {
      render(<Header {...baseProps} />)
      // open first
      fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
      expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument()

      // simulate resize to desktop
      setViewportMatch(MOBILE_MEDIA_QUERY, false)

      expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
        'aria-expanded',
        'false'
      )
    })
  })
})
