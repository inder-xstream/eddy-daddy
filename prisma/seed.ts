import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  const categories = [
    { name: 'Amateur', slug: 'amateur' },
    { name: 'POV', slug: 'pov' },
    { name: 'MILF', slug: 'milf' },
    { name: 'Teen', slug: 'teen' },
    { name: 'Mature', slug: 'mature' },
    { name: 'Ebony', slug: 'ebony' },
    { name: 'Asian', slug: 'asian' },
    { name: 'Latina', slug: 'latina' },
    { name: 'Blonde', slug: 'blonde' },
    { name: 'Brunette', slug: 'brunette' },
    { name: 'Redhead', slug: 'redhead' },
    { name: 'Big Tits', slug: 'big-tits' },
    { name: 'Big Ass', slug: 'big-ass' },
    { name: 'Anal', slug: 'anal' },
    { name: 'Hardcore', slug: 'hardcore' },
    { name: 'Softcore', slug: 'softcore' },
    { name: 'Verified', slug: 'verified' },
    { name: 'Exclusive', slug: 'exclusive' },
    { name: 'Interracial', slug: 'interracial' },
    { name: 'Lesbian', slug: 'lesbian' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        isActive: true,
      },
    })
  }

  const tags = [
    'HD', '1080p', '4k', 'Indoor', 'Outdoor', 'Casting', 'Interview', 
    'Reality', 'Public', 'Car', 'Hotel', 'Office', 'Shower', 'Pool', 
    'Gym', 'Yoga', 'Massage', 'Compilation', 'Solo', 'Threesome', 
    'Orgy', 'Gangbang', 'Creampie', 'Facial', 'Deepthroat'
  ]

  for (const tagName of tags) {
    const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: {
        name: tagName,
        slug,
      },
    })
  }

  // Create "Unknown" model as a fallback if needed
  await prisma.model.upsert({
    where: { slug: 'unknown' },
    update: {},
    create: {
      stageName: 'Unknown',
      slug: 'unknown',
      isVerified: false,
    },
  })

  console.log('Seeding finished.')
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
