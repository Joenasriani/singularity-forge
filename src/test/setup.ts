import '@testing-library/jest-dom'
import { beforeEach } from 'vitest'

// Clear localStorage before each test so persisted state doesn't contaminate between tests
beforeEach(() => {
  localStorage.clear()
})
