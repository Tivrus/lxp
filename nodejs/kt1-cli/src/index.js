const path = require('node:path')

async function main() {
  const config = require('./config')
  const { filterCsv } = require('./utils/csv')

  console.log(`Фильтр: возраст >= ${config.minAge}, город = ${config.cityFilter}`)

  const stats = await filterCsv({
    input: config.inputFile,
    output: config.outputFile,
    predicate: (row) => Number(row.age) >= config.minAge && row.city === config.cityFilter,
  })

  console.log(`Обработано строк: ${stats.total}`)
  console.log(`Прошло фильтр: ${stats.passed}`)
  console.log(`Результат записан в ${path.relative(process.cwd(), config.outputFile)}`)
}

main().catch((error) => {
  console.error(`Ошибка: ${error.message}`)
  process.exit(1)
})
