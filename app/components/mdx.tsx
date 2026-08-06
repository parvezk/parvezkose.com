import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { tokenize } from 'sugar-high'
import React from 'react'

function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ))
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function CustomLink(props) {
  let href = props.href;

  if (typeof href === 'string') {
    try {
      const url = new URL(href, 'http://dummy.com');
      if (['javascript:', 'vbscript:', 'data:'].includes(url.protocol)) {
        return <a {...props} href="#" />
      }
    } catch (e) {
      // If URL parsing fails, it's safer to not render the link as clickable
      return <a {...props} href="#" />
    }
  }

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function RoundedImage(props) {
  return <Image alt={props.alt} className="rounded-lg" {...props} />
}

const tokenTypes = [
  'identifier', 'keyword', 'string', 'class', 'property',
  'entity', 'jsxliterals', 'sign', 'comment', 'break', 'space'
];

function Code({ children, ...props }) {
  // If children is not a string, render it safely as is
  if (typeof children !== 'string') {
    return <code {...props}>{children}</code>;
  }

  const tokens = tokenize(children);

  // Group tokens by line
  const lines: [number, string][][] = [];
  let currentLine: [number, string][] = [];

  tokens.forEach(([type, value]) => {
    if (type === 9) { // break
      lines.push(currentLine);
      currentLine = [];
    } else {
      if (value.includes('\n')) {
        const splitValues = value.split('\n');
        splitValues.forEach((val, index) => {
          currentLine.push([type, val]);
          if (index < splitValues.length - 1) {
            lines.push(currentLine);
            currentLine = [];
          }
        });
      } else {
        currentLine.push([type, value]);
      }
    }
  });

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return (
    <code {...props}>
      {lines.map((lineTokens, lineIndex) => (
        <React.Fragment key={lineIndex}>
          <span className="sh__line">
            {lineTokens.map(([type, value], tokenIndex) => {
              const tokenType = tokenTypes[type];
              return (
                <span
                  key={tokenIndex}
                  className={`sh__token--${tokenType}`}
                  style={{ color: `var(--sh-${tokenType})` }}
                >
                  {value}
                </span>
              );
            })}
          </span>
          {lineIndex < lines.length - 1 && '\n'}
        </React.Fragment>
      ))}
    </code>
  );
}

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

function createHeading(level) {
  const Heading = ({ children }) => {
    let slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  Table,
}

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
    />
  )
}
