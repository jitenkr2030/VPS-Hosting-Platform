import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create VPS templates
  const templates = [
    {
      name: 'Ubuntu 22.04 LTS',
      description: 'Latest Ubuntu Long Term Support with security updates',
      os: 'ubuntu',
      version: '22.04',
      imageUrl: '/images/ubuntu-22.04.png',
    },
    {
      name: 'Ubuntu 20.04 LTS',
      description: 'Stable Ubuntu Long Term Support release',
      os: 'ubuntu',
      version: '20.04',
      imageUrl: '/images/ubuntu-20.04.png',
    },
    {
      name: 'Debian 11',
      description: 'Stable Debian release with rock-solid reliability',
      os: 'debian',
      version: '11',
      imageUrl: '/images/debian-11.png',
    },
    {
      name: 'CentOS 8',
      description: 'Enterprise-grade Linux distribution',
      os: 'centos',
      version: '8',
      imageUrl: '/images/centos-8.png',
    },
    {
      name: 'Fedora 37',
      description: 'Cutting-edge Linux with latest features',
      os: 'fedora',
      version: '37',
      imageUrl: '/images/fedora-37.png',
    }
  ]

  for (const template of templates) {
    const existing = await prisma.vpsTemplate.findFirst({
      where: { name: template.name }
    })
    
    if (!existing) {
      await prisma.vpsTemplate.create({
        data: template,
      })
    }
  }

  console.log('VPS templates have been seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })