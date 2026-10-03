import '@testing-library/jest-dom'
import { expect } from 'vitest'
import * as axeMatchers from 'vitest-axe/matchers'
import './test-match-media'

expect.extend(axeMatchers)
