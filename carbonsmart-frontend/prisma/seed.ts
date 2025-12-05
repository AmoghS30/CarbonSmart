import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const demoUser = await prisma.user.upsert({
    where: { username: 'demo_user' },
    update: {},
    create: {
      username: 'demo_user',
      email: 'demo@carbonsmart.com',
      password: hashedPassword,
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4',
      profile: {
        create: {
          displayName: 'Demo User',
          bio: 'Passionate about saving the planet!',
          totalEmissions: 125.5,
          creditsEarned: 42,
          level: 3,
          xp: 750,
        },
      },
    },
    include: {
      profile: true,
    },
  })

  console.log('✅ Created demo user:', demoUser.username)

  // Create sample activities for demo user
  const activities = [
    {
      activityType: 'driving',
      activity: 'Drive 20 km to work',
      predictedEmission: 4.2,
      transactionHash: '0x123abc456def789ghi',
    },
    {
      activityType: 'flight',
      activity: 'Flight from NYC to Boston',
      predictedEmission: 125.0,
      transactionHash: '0x456def789ghi123abc',
    },
    {
      activityType: 'home_energy',
      activity: 'Used 50 kWh electricity this week',
      predictedEmission: 22.5,
      transactionHash: '0x789ghi123abc456def',
    },
    {
      activityType: 'shopping',
      activity: 'Bought 5 kg of meat',
      predictedEmission: 135.0,
      transactionHash: '0xabc123def456ghi789',
    },
    {
      activityType: 'waste',
      activity: 'Recycled 10 kg of paper',
      predictedEmission: -2.5, // Negative because recycling reduces emissions
      transactionHash: '0xdef456ghi789abc123',
    },
  ]

  for (const activity of activities) {
    await prisma.activity.create({
      data: {
        userId: demoUser.id,
        ...activity,
        metadata: {
          source: 'seed',
          version: '1.0',
        },
      },
    })
  }

  console.log(`✅ Created ${activities.length} sample activities`)

  // Create sample carbon goals
  const goals = [
    {
      title: 'Reduce Monthly Emissions',
      description: 'Reduce carbon emissions by 20% this month',
      targetEmission: 100.0,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      isActive: true,
    },
    {
      title: 'Go Carbon Neutral',
      description: 'Achieve carbon neutrality by end of year',
      targetEmission: 0.0,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
    },
  ]

  for (const goal of goals) {
    await prisma.carbonGoal.create({
      data: goal,
    })
  }

  console.log(`✅ Created ${goals.length} carbon goals`)

  // Create additional test users
  const testUsers = [
    {
      username: 'eco_warrior',
      email: 'warrior@carbonsmart.com',
      displayName: 'Eco Warrior',
      bio: 'Leading the charge against climate change!',
    },
    {
      username: 'green_thumb',
      email: 'green@carbonsmart.com',
      displayName: 'Green Thumb',
      bio: 'Plant trees, save bees, clean seas!',
    },
    {
      username: 'carbon_crusher',
      email: 'crusher@carbonsmart.com',
      displayName: 'Carbon Crusher',
      bio: 'Crushing carbon emissions one day at a time.',
    },
  ]

  for (const userData of testUsers) {
    const hashedPass = await bcrypt.hash('test123', 10)
    await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: hashedPass,
        profile: {
          create: {
            displayName: userData.displayName,
            bio: userData.bio,
            totalEmissions: Math.random() * 200,
            creditsEarned: Math.floor(Math.random() * 100),
            level: Math.floor(Math.random() * 5) + 1,
            xp: Math.floor(Math.random() * 1000),
          },
        },
      },
    })
  }

  console.log(`✅ Created ${testUsers.length} additional test users`)
  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
