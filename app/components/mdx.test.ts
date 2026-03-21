import test from 'node:test';
import assert from 'node:assert';
import sanitizeHtml from 'sanitize-html';
import { highlight } from 'sugar-high';

test('Code component sanitizes potentially dangerous HTML output', () => {
  const codeHTML = highlight('<script>alert("xss")</script>');
  const sanitizedHTML = sanitizeHtml(codeHTML, {
    allowedTags: ['span'],
    allowedAttributes: {
      span: ['class', 'style']
    }
  });

  assert.ok(!sanitizedHTML.includes('<script>'), 'The script tag should be removed');
  assert.ok(sanitizedHTML.includes('alert("xss")'), 'The text content should remain');
  assert.ok(sanitizedHTML.includes('<span class="sh__token--jsxliterals"'), 'Highlighting span should remain');
});
