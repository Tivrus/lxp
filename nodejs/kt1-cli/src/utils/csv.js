const fs = require('node:fs')
const readline = require('node:readline')
const { once } = require('node:events')
const { finished } = require('node:stream/promises')

async function checkFile(file) {
  try {
    await fs.promises.access(file, fs.constants.R_OK)
  } catch {
    throw new Error(`Входной файл не найден или недоступен: ${file}`)
  }
}

function parseLine(line, columns) {
  const values = line.split(',').map((value) => value.trim())
  return Object.fromEntries(columns.map((column, i) => [column, values[i] ?? '']))
}

async function write(stream, text) {
  if (!stream.write(text)) {
    await once(stream, 'drain')
  }
}

async function filterCsv({ input, output, predicate }) {
  await checkFile(input)

  const reader = fs.createReadStream(input, { encoding: 'utf8' })
  const lines = readline.createInterface({ input: reader, crlfDelay: Infinity })
  const writer = fs.createWriteStream(output, { encoding: 'utf8' })

  let header = null
  let columns = []
  const stats = { total: 0, passed: 0 }

  try {
    for await (const line of lines) {
      if (!line.trim()) continue

      if (!header) {
        header = line
        columns = line.split(',').map((column) => column.trim())
        await write(writer, header + '\n')
        continue
      }

      stats.total++
      if (predicate(parseLine(line, columns))) {
        stats.passed++
        await write(writer, line + '\n')
      }
    }

    if (!header) {
      throw new Error('Входной файл пустой')
    }
  } finally {
    writer.end()
    await finished(writer)
  }

  return stats
}

module.exports = { filterCsv }
