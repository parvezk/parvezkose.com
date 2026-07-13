import test from 'node:test'
import assert from 'node:assert'
import { baseUrl } from './sitemap'
import robots from './robots'

test('robots() returns the correct configuration', () => {
  const expected = {
    rules: [
      {
        userAgent: '*',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }

  const actual = robots()
  assert.deepStrictEqual(actual, expected)
})
