const prisma = require('../src/db')
const seed = require('./seed-data.json')

async function main() {
  await prisma.post.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.user.deleteMany()

  const ids = {}
  for (const user of seed.users) {
    const created = await prisma.user.create({ data: user })
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

  console.log('Тестовые данные добавлены')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
