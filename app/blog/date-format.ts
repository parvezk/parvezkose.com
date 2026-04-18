/** Pure date formatting — safe for client components (no `fs`). */

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
