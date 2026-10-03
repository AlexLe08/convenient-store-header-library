import type { Meta, StoryObj } from '@storybook/react'
import { Header } from './Header'
import type { NavLink } from './types'
import type { SearchSuggestion } from 'convenient-store-enterprise-ui-library'

const NAV: NavLink[] = [
  { id: 'deals', label: 'Deals', href: '#deals' },
  { id: 'new', label: 'New Arrivals', href: '#new' },
  { id: 'support', label: 'Support', href: '#support' },
]

const SUGGESTIONS: SearchSuggestion[] = [
  { id: '1', label: 'iPhone 15 Pro', category: 'Phones' },
  { id: '2', label: 'iPhone 15', category: 'Phones' },
  { id: '3', label: 'Samsung Galaxy S24', category: 'Phones' },
  { id: '4', label: 'Google Pixel 8', category: 'Phones' },
]

const meta = {
  title: 'Components/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'An enterprise header that composes the SearchInput library. ' +
          'Demonstrates cross-library composition: the Header imports ' +
          'SearchInput as a git-URL dependency, pins a version, and declares ' +
          'it as a peer so consumers share a single instance.',
      },
    },
  },
  argTypes: {
    cartCount: { control: { type: 'number', min: 0, max: 99 } },
    sticky: { control: 'boolean' },
    navLinks: { control: false },
    searchProps: { control: false },
    logoSrc: { control: 'text' },
    brandName: { control: 'text' },
  },
  args: {
    brandName: 'Convenient Store',
    navLinks: NAV,
    cartCount: 0,
    searchProps: {
      suggestions: SUGGESTIONS,
      placeholder: 'Search products…',
      'aria-label': 'Search products',
      minQueryLength: 1,
    },
  },
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

/** Default desktop header with brand, nav, and an empty cart. */
export const Default: Story = {}

/** Cart badge with a two-digit count. */
export const WithCartItems: Story = {
  args: { cartCount: 12 },
}

/**
 * Search dropdown open on top of a sticky header. The z-index contract
 * (header at 40, dropdown at 50) keeps the dropdown above the header.
 */
export const WithSearchOpen: Story = {
  render: (args) => (
    <div style={{ height: '200vh', background: '#f9fafb' }}>
      <Header {...args} />
      <p style={{ padding: '2rem', color: '#6b7280' }}>
        Scroll — the header stays pinned. Focus the search input to open the dropdown and confirm it
        renders above the sticky header.
      </p>
    </div>
  ),
  args: { sticky: true, cartCount: 3 },
}

/**
 * Mobile layout. Switch to a mobile viewport via the Storybook viewport
 * addon (top toolbar) — the header reflows to a stacked layout with a
 * hamburger toggle. Click the hamburger to open the nav drawer.
 */
export const MobileCollapsed: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { cartCount: 3 },
}

/** Mobile with the nav drawer open. Escape, click-outside, or nav-click closes it. */
export const MobileMenuOpen: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { cartCount: 3 },
  play: async ({ canvasElement }) => {
    const toggle = canvasElement.querySelector(
      'button[aria-label="Open menu"]'
    ) as HTMLButtonElement | null
    toggle?.click()
  },
}
