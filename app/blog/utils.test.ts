import { test, describe, mock, afterEach } from 'node:test'
import assert from 'node:assert'
import { formatDate } from './utils.ts'

describe('formatDate', () => {
  afterEach(() => {
    mock.timers.reset()
  })

  test('formats date correctly without relative time', () => {
    assert.strictEqual(formatDate('2024-01-01'), 'January 1, 2024')
  })

  test('formats date correctly when time is included', () => {
    assert.strictEqual(formatDate('2024-01-01T12:00:00'), 'January 1, 2024')
  })

  test('returns "Today" for current date', () => {
    mock.timers.enable({ apis: ['Date'], now: new Date('2024-05-15T12:00:00') })
    assert.strictEqual(formatDate('2024-05-15', true), 'May 15, 2024 (Today)')
  })

  test('returns days ago correctly', () => {
    mock.timers.enable({ apis: ['Date'], now: new Date('2024-05-15T12:00:00') })
    assert.strictEqual(formatDate('2024-05-10', true), 'May 10, 2024 (5d ago)')
  })

  test('returns months ago correctly', () => {
    mock.timers.enable({ apis: ['Date'], now: new Date('2024-05-15T12:00:00') })
    assert.strictEqual(formatDate('2024-02-15', true), 'February 15, 2024 (3mo ago)')
  })

  test('returns years ago correctly', () => {
    mock.timers.enable({ apis: ['Date'], now: new Date('2024-05-15T12:00:00') })
    assert.strictEqual(formatDate('2022-05-15', true), 'May 15, 2022 (2y ago)')
  })

  test('handles future dates as Today', () => {
    // If the date provided is in the future, yearsAgo, monthsAgo, daysAgo will be negative.
    // The current logic defaults to 'Today' for negative or zero values.
    mock.timers.enable({ apis: ['Date'], now: new Date('2024-05-15T12:00:00') })
    assert.strictEqual(formatDate('2024-05-20', true), 'May 20, 2024 (Today)')
  })
})
