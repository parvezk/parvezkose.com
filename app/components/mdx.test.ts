import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('no dangerouslySetInnerHTML in mdx.tsx Code component', () => {
  const content = fs.readFileSync('app/components/mdx.tsx', 'utf8');
  assert.ok(!content.includes('dangerouslySetInnerHTML'), 'dangerouslySetInnerHTML should be removed');
  assert.ok(content.includes('tokenize(children)'), 'Should use tokenize from sugar-high');
});
