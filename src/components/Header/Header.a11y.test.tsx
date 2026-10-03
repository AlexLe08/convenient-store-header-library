import { render, fireEvent } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { beforeEach, describe, expect, it } from 'vitest'
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

async function expectNoA11yViolations(container: HTMLElement) {
  const results = await axe(container.ownerDocument.body, {
    rules: {
      region: { enabled: false },
      'color-contrast': { enabled: false },
    },
  })
  expect(results).toHaveNoViolations()
}

describe('Header — accessibility', () => {
  beforeEach(() => {
    resetViewportMatches()
    document.body.innerHTML = ''
  })

  it('has no violations in the default state', async () => {
    const { container } = render(<Header {...baseProps} />)
    await expectNoA11yViolations(container)
  })

  it('has no violations with a cart badge', async () => {
    const { container } = render(<Header {...baseProps} cartCount={12} />)
    await expectNoA11yViolations(container)
  })

  it('has no violations with the mobile drawer open', async () => {
    setViewportMatch(MOBILE_MEDIA_QUERY, true)
    const { container } = render(<Header {...baseProps} />)
    const toggle = document.querySelector('button[aria-label="Open menu"]') as HTMLButtonElement
    fireEvent.click(toggle)
    await expectNoA11yViolations(container)
  })
})
