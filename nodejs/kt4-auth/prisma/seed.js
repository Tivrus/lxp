const bcrypt = require('bcrypt')
const prisma = require('../src/db')
const seed = require('./seed-data.json')

async function main() {
  await prisma.post.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.user.deleteMany()

  const password = await bcrypt.hash(seed.password, 10)

  const ids = {}
  for (const user of seed.users) {
    const created = await prisma.user.create({ data: { ...user, password } })
    ids[user.email] = created.id
  }

  for (const { author, tags, ...post } of seed.posts) {
    await prisma.post.create({
      data: {
        ...post,
        authorId: ids[author],
        tags: { connectOrCreate: tags.map((name) => ({ where: { name }, create: { name } })) },
      },
    })
  }

  console.log(`Тестовые данные добавлены, пароль у всех: ${seed.password}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
