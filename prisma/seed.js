const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const income = await prisma.category.upsert({
    where: { id: 'income' },
    update: {},
    create: {
      id: 'income',
      name: 'Revenus',
      keywords:'cas mfq-af,cas mfq-sfs,msp federal govt'
    },
  })

  const investment = await prisma.category.upsert({
    where: { id: 'investment' },
    update: {},
    create: {
      id: 'investment',
      name: 'Investissement',
      keywords:'inv agora,msp ind all epargne,4004839474'
    },
  })

  const groceries = await prisma.category.upsert({
    where: { id: 'groceries' },
    update: {},
    create: {
      id: 'groceries',
      name: 'Epicerie',
      keywords:'maxi,kim phat,pc express,flashfood,iga,du pain,metro,walmart,costco,super c, rovigo'
    },
  })

  const reccurent = await prisma.category.upsert({
    where: { id: 'reccurent' },
    update: {},
    create: {
      id: 'reccurent',
      name: 'Reccurent',
      keywords:'hp *instant,frais bancaires, ins ind all ass mtl,securplus,fizz,amazon web service,netflix.com,ins industrielle,lns spl,bpy hydro-quebec'
    },
  })

  const home = await prisma.category.upsert({
    where: { id: 'home' },
    update: {},
    create: {
      id: 'home',
      name: 'Maison',
      keywords:'amazon.ca,mondou,ardenne,saaq-permis,amzn, aubainerie,dollarama,bureau en gros,canac,canadian tire,cdn tire,rona,home depot,ikea'
    },
  })

  const health = await prisma.category.upsert({
    where: { id: 'health' },
    update: {},
    create: {
      id: 'health',
      name: 'Sante',
      keywords:'tonik bar beaute,centre dentaire,pharmaprix,jean coutu,brunet,uniprix'
    },
  })

  const leisure = await prisma.category.upsert({
    where: { id: 'leisure' },
    update: {},
    create: {
      id: 'leisure',
      name: 'Sport et Loisirs',
      keywords:'tuango,decathlon,mcdonald,retrait a un gab,mlle cafe,jouets et cie,sepaq,pizza,www.jaimontour,restaurant,restau,chez vincent,presotea,second-cup'
    },
  })

  const unknow = await prisma.category.upsert({
    where: { id: 'unknow' },
    update: {},
    create: {
      id: 'unknow',
      name: 'Inconnu',
      keywords:'virement interac'
    },
  })

  const blacklist = await prisma.category.upsert({
    where: { id: 'blacklist' },
    update: {},
    create: {
      id: 'blacklist',
      name: 'Ignore',
      keywords:'virement interac'
    },
  })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })