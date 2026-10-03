import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import styles from '../Header.module.css'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Accessible label — required for icon-only buttons. */
  label: string
  /** Icon content. Rendered inside an aria-hidden span. */
  children: ReactNode
  /** Optional count badge (e.g., cart items). */
  badgeCount?: number
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, children, badgeCount = 0, className, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={[styles.iconButton, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <span aria-hidden="true" className={styles.iconButtonIcon}>
        {children}
      </span>
      {badgeCount > 0 && (
        <span className={styles.badge} aria-hidden="true">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </button>
  )
})
