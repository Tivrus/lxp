const path = require('node:path')
const dotenv = require('dotenv')

const root = path.resolve(__dirname, '../..')

dotenv.config({ path: path.join(root, '.env'), quiet: true })

function required(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`В .env не задан параметр ${name}`)
  }
  return value
}

const minAge = Number(required('MIN_AGE'))
if (!Number.isInteger(minAge) || minAge < 0) {
  throw new Error('MIN_AGE должен быть целым неотрицательным числом')
}

module.exports = {
  inputFile: path.resolve(root, required('INPUT_FILE')),
  outputFile: path.resolve(root, required('OUTPUT_FILE')),
  minAge,
  cityFilter: required('CITY_FILTER'),
}
