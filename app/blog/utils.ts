import fs from 'fs'
import path from 'path'

type Metadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
}

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  let match = frontmatterRegex.exec(fileContent)
  let frontMatterBlock = match![1]
  let content = fileContent.replace(frontmatterRegex, '').trim()
  let frontMatterLines = frontMatterBlock.trim().split('\n')
  let metadata: Partial<Metadata> = {}

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(': ')
    let value = valueArr.join(': ').trim()
    value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
    metadata[key.trim() as keyof Metadata] = value
  })

  return { metadata: metadata as Metadata, content }
}

function getMDXFiles(dir) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx')
}

function readMDXFile(filePath) {
  let rawContent = fs.readFileSync(filePath, 'utf-8')
  return parseFrontmatter(rawContent)
}

function getMDXData(dir) {
  let mdxFiles = getMDXFiles(dir)
  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file))
    let slug = path.basename(file, path.extname(file))

    return {
      metadata,
      slug,
      content,
    }
  })
}

export function getBlogPosts() {
  return getMDXData(path.join(process.cwd(), 'app', 'blog', 'posts'))
}

export function formatDate(date: string, includeRelative = false) {
  let currentDate = new Date()
  if (!date.includes('T')) {
    date = `${date}T00:00:00Z`
  }
  let targetDate = new Date(date)

  let fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

  if (!includeRelative) {
    return fullDate
  }

  let formattedDate = ''
  let timeDiff = currentDate.getTime() - targetDate.getTime()
  let daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  let monthsAgo = Math.floor(daysAgo / 30)
  let yearsAgo = Math.floor(monthsAgo / 12)

  let rtf = new Intl.RelativeTimeFormat('en', { numeric: 'always', style: 'narrow' })

  if (daysAgo < 1) {
    formattedDate = 'Today'
  } else if (yearsAgo > 0) {
    formattedDate = rtf.format(-yearsAgo, 'year')
  } else if (monthsAgo > 0) {
    formattedDate = rtf.format(-monthsAgo, 'month')
  } else {
    formattedDate = rtf.format(-daysAgo, 'day')
  }

  return `${fullDate} (${formattedDate})`
}
