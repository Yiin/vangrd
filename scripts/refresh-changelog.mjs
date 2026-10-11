import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const argumentsList = process.argv.slice(2)
const check = argumentsList[0] === '--check'
const input = argumentsList[check ? 1 : 0]
if (!input || argumentsList.length !== (check ? 2 : 1)) {
  console.error('Usage: node scripts/refresh-changelog.mjs [--check] <export.json>')
  process.exit(1)
}

function validateEntries(value) {
  if (!Array.isArray(value) || value.length === 0) throw new Error('Expected a nonempty changelog array')
  const identities = new Set()
  for (const [index, entry] of value.entries()) {
    if (!entry || typeof entry !== 'object' || Object.keys(entry).sort().join(',') !== 'body,date,title') {
      throw new Error(`Entry ${index + 1} must contain only date, title, and body`)
    }
    for (const field of ['date', 'title', 'body']) {
      if (typeof entry[field] !== 'string' || !entry[field].trim()) {
        throw new Error(`Entry ${index + 1} has an empty or invalid ${field}`)
      }
    }
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(entry.date)) {
      throw new Error(`Entry ${index + 1} has an invalid date format`)
    }
    const parsedDate = new Date(`${entry.date}:00Z`)
    if (Number.isNaN(parsedDate.valueOf()) || parsedDate.toISOString().slice(0, 16) !== entry.date) {
      throw new Error(`Entry ${index + 1} has an invalid calendar date`)
    }
    if (entry.title.includes('\n') || entry.title.includes('\r')) {
      throw new Error(`Entry ${index + 1} has a multiline title`)
    }
    if (index > 0 && value[index - 1].date < entry.date) {
      throw new Error('Expected entries in newest-first order')
    }
    const identity = `${entry.date}\n${entry.title}`
    if (identities.has(identity)) throw new Error(`Duplicate entry: ${entry.date} ${entry.title}`)
    identities.add(identity)
  }
  return value
}

function entryAnchor(entry) {
  const digest = createHash('sha256').update(`${entry.date}\n${entry.title}`).digest('hex').slice(0, 12)
  return `entry-${entry.date.replace(/[^0-9]/g, '')}-${digest}`
}

function linkText(value) {
  return value.replace(/[\\[\]|]/g, '\\$&')
}

// These exact titles identify reviewed fixes and reliability changes in the public feed.
// Unrecognized notes remain product updates. No keyword guessing changes their category.
const maintenanceCategories = new Map([
  ['Agent and Account Improvements', 'fix'],
  ['Video Bonuses Work Again', 'fix'],
  ['Farm Lists Keep Your Interval', 'fix'],
  ['Run Now Runs Once', 'fix'],
  ['Dodges and Planned Attacks Always Run', 'reliability'],
  ['Farm Lists Go Out Before a Break', 'reliability'],
  ['Farm Lists Go Out Together', 'reliability']
])
const recentWindowMilliseconds = 30 * 24 * 60 * 60 * 1000

function summaryLink(entry) {
  return `${entry.date.slice(0, 10)} · [${linkText(entry.title)}](CHANGELOG.md#${entryAnchor(entry)})`
}

function maintenanceSummary(entries) {
  const newest = entries[0]
  // Use product-note dates, never the import time or a documentation commit date.
  const cutoff = new Date(`${newest.date}:00Z`).valueOf() - recentWindowMilliseconds
  const recent = entries.filter(entry => new Date(`${entry.date}:00Z`).valueOf() >= cutoff)
  const fixes = recent.filter(entry => maintenanceCategories.get(entry.title) === 'fix').slice(0, 2)
  const reliability = recent.filter(entry => maintenanceCategories.get(entry.title) === 'reliability').slice(0, 2)
  const lines = [
    '<!-- changelog-summary:start -->',
    `Latest product note: **${newest.date.replace('T', ' ')}** · [${linkText(newest.title)}](CHANGELOG.md#${entryAnchor(newest)})`,
    ''
  ]
  for (const [label, selected] of [['Recent fixes', fixes], ['Reliability improvements', reliability]]) {
    if (selected.length) lines.push(`${label}:`, '', ...selected.map(entry => `- ${summaryLink(entry)}`), '')
  }
  if (!fixes.length && !reliability.length) {
    lines.push('Recent product updates:', '', ...entries.slice(0, 3).map(entry => `- ${summaryLink(entry)}`), '')
  }
  lines.push(
    '[Full product changelog](CHANGELOG.md) · [Website changelog](https://vangrd.bot/changelog)',
    '',
    'Dates come from product notes, not documentation commits. Listed fixes and reliability improvements are within 30 days of the latest product note.',
    '<!-- changelog-summary:end -->'
  )
  return lines.join('\n')
}

try {
  const entries = validateEntries(JSON.parse(await readFile(resolve(input), 'utf8')))
  const readmePath = resolve(repository, 'README.md')
  const changelogPath = resolve(repository, 'CHANGELOG.md')
  const readme = await readFile(readmePath, 'utf8')
  const previous = await readFile(changelogPath, 'utf8')
  const previousDates = [...previous.matchAll(/^<!-- entry-date: (\S+) -->$/gm)].map(match => match[1])
  const nextDates = entries.map(entry => entry.date)
  const previousCounts = new Map()
  const nextCounts = new Map()
  for (const date of previousDates) previousCounts.set(date, (previousCounts.get(date) ?? 0) + 1)
  for (const date of nextDates) nextCounts.set(date, (nextCounts.get(date) ?? 0) + 1)
  for (const [date, count] of previousCounts) {
    if ((nextCounts.get(date) ?? 0) < count) throw new Error(`Feed would remove existing history at ${date}`)
  }

  const newest = entries[0].date
  const oldest = entries.at(-1).date
  const lines = [
    '# Vangrd changelog',
    '',
    'The complete English product notes from [Vangrd](https://vangrd.bot/changelog), newest first.',
    `This snapshot contains ${entries.length} entries, from ${oldest} through ${newest}.`,
    '',
    'These historical notes describe changes at the time of each entry. They are not uptime measurements or timing guarantees.',
    'Entry dates are not deployment timestamps. Wording follows the authored product history.',
    '',
    '[Product overview](README.md) · [Current website changelog](https://vangrd.bot/changelog) · [Refresh instructions](MAINTAINING.md)',
    '',
    '<!-- Generated by scripts/refresh-changelog.mjs. Edit the canonical product notes, then refresh. -->',
    ''
  ]
  let day = ''
  for (const entry of entries) {
    if (entry.date.slice(0, 10) !== day) {
      day = entry.date.slice(0, 10)
      lines.push(`## ${day}`, '')
    }
    lines.push(
      `<!-- entry-date: ${entry.date} -->`,
      `<a id="${entryAnchor(entry)}"></a>`,
      '',
      `### ${entry.title}`,
      '',
      entry.body.replace(/\]\(\/(?!\/)/g, '](https://vangrd.bot/'),
      ''
    )
  }
  const changelog = `${lines.join('\n').trimEnd()}\n`
  const marker = /<!-- changelog-summary:start -->[\s\S]*?<!-- changelog-summary:end -->/g
  if ([...readme.matchAll(marker)].length !== 1) throw new Error('README must have exactly one changelog summary block')
  const summary = maintenanceSummary(entries)
  const updatedReadme = readme.replace(marker, () => summary)
  const outputs = [[changelogPath, previous, changelog], [readmePath, readme, updatedReadme]]
  const changed = outputs.filter(([, before, after]) => before !== after)
  if (check && changed.length) throw new Error('Generated changelog or README summary is stale. Run refresh without --check')
  if (!check) {
    for (const [path, , content] of changed) await writeFile(path, content)
  }
  console.log(`${check ? 'Verified' : 'Refreshed'} ${entries.length} entries; newest ${newest}; ${changed.length} files changed`)
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
