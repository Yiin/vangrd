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
