import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, mkdir, copyFile, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const entry = (date, title = 'An update', body = 'An authored description.') => ({ date, title, body })

async function fixture(context) {
  const directory = await mkdtemp(join(tmpdir(), 'vangrd-changelog-test-'))
  context.after(() => rm(directory, { recursive: true, force: true }))
  await mkdir(join(directory, 'scripts'))
  await copyFile(new URL('./refresh-changelog.mjs', import.meta.url), join(directory, 'scripts/refresh-changelog.mjs'))
  await writeFile(join(directory, 'README.md'), '# Product\n\n<!-- changelog-summary:start -->\n<!-- changelog-summary:end -->\n')
  await writeFile(join(directory, 'CHANGELOG.md'), '# Previous history\n')
  const input = join(directory, 'input.json')
  return {
    directory,
    setEntries: entries => writeFile(input, JSON.stringify(entries)),
    run: (...flags) => spawnSync(process.execPath, [join(directory, 'scripts/refresh-changelog.mjs'), ...flags, input], { encoding: 'utf8' }),
    read: file => readFile(join(directory, file), 'utf8')
  }
}

test('preserves complete history, equal timestamps, and links across repeat refreshes', async context => {
  const sample = await fixture(context)
  const entries = [entry('2026-10-08T23:13', 'First'), entry('2026-10-08T23:13', 'Second'), entry('2026-02-25T17:18', 'Oldest', '[Open](/app/translations)')]
  await sample.setEntries(entries)
  assert.equal(sample.run().status, 0)
  const before = await sample.read('CHANGELOG.md')
  const readme = await sample.read('README.md')
  assert.equal((before.match(/<!-- entry-date:/g) ?? []).length, 3)
  assert.match(before, /\[Open\]\(https:\/\/vangrd.bot\/app\/translations\)/)
  for (const match of readme.matchAll(/CHANGELOG.md#([^)]*)/g)) assert.ok(before.includes(`id="${match[1]}"`))
  assert.match(sample.run().stdout, /0 files changed/)
  assert.equal(await sample.read('CHANGELOG.md'), before)
  assert.equal(sample.run('--check').status, 0)
  await writeFile(join(sample.directory, 'CHANGELOG.md'), before + 'Manual edit\n')
  assert.notEqual(sample.run('--check').status, 0)
})

test('rejects incomplete history without changing either output', async context => {
  const sample = await fixture(context)
  const entries = [entry('2026-10-08T23:13'), entry('2026-02-25T17:18')]
  await sample.setEntries(entries)
  assert.equal(sample.run().status, 0)
  const before = await sample.read('CHANGELOG.md')
  const readme = await sample.read('README.md')
  await sample.setEntries(entries.slice(0, 1))
  const result = sample.run()
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /remove existing history/)
  assert.equal(await sample.read('CHANGELOG.md'), before)
  assert.equal(await sample.read('README.md'), readme)
})

test('rejects malformed or unordered exports before writing', async context => {
  const sample = await fixture(context)
  const invalid = [
    [],
    [entry('2026-02-30T10:00')],
    [entry('2026-10-08T99:00')],
    [entry('2026-10-08T23:13'), entry('2026-10-08T23:13')],
    [entry('2026-02-25T17:18'), entry('2026-10-08T23:13')],
    [entry('2026-10-08T23:13', '')],
    [{ ...entry('2026-10-08T23:13'), privateData: 'unexpected' }]
  ]
  for (const entries of invalid) {
    await sample.setEntries(entries)
    assert.notEqual(sample.run().status, 0)
    assert.equal(await sample.read('CHANGELOG.md'), '# Previous history\n')
  }
})

test('fails a missing README marker before changing the changelog', async context => {
  const sample = await fixture(context)
  await sample.setEntries([entry('2026-10-08T23:13')])
  await writeFile(join(sample.directory, 'README.md'), '# Product\n')
  assert.notEqual(sample.run().status, 0)
  assert.equal(await sample.read('CHANGELOG.md'), '# Previous history\n')
})

test('selects reviewed fixes and reliability notes using their source dates', async context => {
  const sample = await fixture(context)
  await sample.setEntries([
    entry('2027-01-12T08:42', 'A new product feature'),
    entry('2027-01-11T16:20', 'Video Bonuses Work Again'),
    entry('2027-01-10T07:15', 'Dodges and Planned Attacks Always Run'),
    entry('2027-01-09T11:30', 'Agent and Account Improvements'),
    entry('2027-01-08T14:05', 'Farm Lists Go Out Before a Break'),
    entry('2027-01-07T09:00', 'Run Now Runs Once'),
    entry('2027-01-06T08:00', 'Farm Lists Go Out Together')
  ])
  assert.equal(sample.run().status, 0)
  const readme = await sample.read('README.md')
  assert.match(readme, /Latest product update: \*\*2027-01-12 08:42\*\* · \[A new product feature\]/)
  assert.match(readme, /Recent fixes:\n\n- 2027-01-11 · \[Video Bonuses Work Again\]/)
  assert.match(readme, /Reliability improvements:\n\n- 2027-01-10 · \[Dodges and Planned Attacks Always Run\]/)
  assert.ok(readme.includes('2027-01-09 · [Agent and Account Improvements]'))
  assert.ok(readme.includes('2027-01-08 · [Farm Lists Go Out Before a Break]'))
  assert.ok(!readme.includes('Run Now Runs Once'))
  assert.ok(!readme.includes('Farm Lists Go Out Together'))
  assert.match(readme, /Dates come from product notes, not documentation commits/)
  assert.match(sample.run().stdout, /0 files changed/)
})

test('uses plain product updates when titles have no reviewed categories', async context => {
  const sample = await fixture(context)
  await sample.setEntries([
    entry('2026-06-21T14:05', 'New Reliability Dashboard'),
    entry('2026-06-20T09:12', 'Choose a Fix Strategy'),
    entry('2026-06-19T08:00', 'Connection Monitor'),
    entry('2026-06-18T11:30', 'Fourth product feature')
  ])
  assert.equal(sample.run().status, 0)
  const readme = await sample.read('README.md')
  assert.match(readme, /Recent product updates:/)
  assert.ok(readme.includes('2026-06-20 · [Choose a Fix Strategy]'))
  assert.ok(readme.includes('2026-06-19 · [Connection Monitor]'))
  assert.ok(!readme.includes('Recent fixes:'))
  assert.ok(!readme.includes('Reliability improvements:'))
  assert.ok(!readme.includes('Fourth product feature'))
})

test('omits each missing category and expires older reviewed notes', async context => {
  for (const [title, present, absent] of [
    ['Video Bonuses Work Again', 'Recent fixes:', 'Reliability improvements:'],
    ['Farm Lists Go Out Before a Break', 'Reliability improvements:', 'Recent fixes:']
  ]) {
    const sample = await fixture(context)
    await sample.setEntries([
      entry('2028-03-31T12:00', 'Latest feature'),
      entry('2028-03-01T12:00', title),
      entry('2028-03-01T11:59', 'Agent and Account Improvements'),
      entry('2028-02-29T16:00', 'Dodges and Planned Attacks Always Run')
    ])
    assert.equal(sample.run().status, 0)
    const readme = await sample.read('README.md')
    assert.ok(readme.includes(present))
    assert.ok(!readme.includes(absent))
    assert.ok(!readme.includes('Agent and Account Improvements'))
    assert.ok(!readme.includes('Dodges and Planned Attacks Always Run'))
    assert.ok((await sample.read('CHANGELOG.md')).includes('2028-02-29T16:00'))
  }
})

test('preserves manual README content and advances only source dates', async context => {
  const sample = await fixture(context)
  const prefix = '# Product\n\nThe manual introduction stays here.\n\n'
  const suffix = '\n\n![Status](guides/img/status-page.webp)\n\n## Features\n\nManual features stay here.\n'
  await writeFile(join(sample.directory, 'README.md'), prefix + '<!-- changelog-summary:start -->\nOld summary\n<!-- changelog-summary:end -->' + suffix)
  const previous = entry('2026-04-02T10:00', 'Previous feature')
  await sample.setEntries([previous])
  assert.equal(sample.run().status, 0)
  await sample.setEntries([entry('2026-09-03T23:58', 'Latest feature'), previous])
  assert.equal(sample.run().status, 0)
  const readme = await sample.read('README.md')
  assert.ok(readme.startsWith(prefix))
  assert.ok(readme.endsWith(suffix))
  assert.match(readme, /Latest product update: \*\*2026-09-03 23:58\*\*/)
  assert.equal((readme.match(/changelog-summary:start/g) ?? []).length, 1)
  assert.match(sample.run().stdout, /0 files changed/)
  assert.equal(await sample.read('README.md'), readme)
  assert.equal(sample.run('--check').status, 0)
})

test('rejects duplicate README blocks without changing either file', async context => {
  const sample = await fixture(context)
  await sample.setEntries([entry('2026-10-08T23:13')])
  const readme = await sample.read('README.md')
  await writeFile(join(sample.directory, 'README.md'), readme + readme)
  assert.notEqual(sample.run().status, 0)
  assert.equal(await sample.read('README.md'), readme + readme)
  assert.equal(await sample.read('CHANGELOG.md'), '# Previous history\n')
})
