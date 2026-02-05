import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Read universities from JSON file (single source of truth)
const universitiesPath = path.join(__dirname, '../data/universities.json');
const universities = JSON.parse(fs.readFileSync(universitiesPath, 'utf-8'));

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing universities
  await prisma.university.deleteMany();
  console.log('🗑️  Cleared existing universities');

  // Insert universities
  const result = await prisma.university.createMany({
    data: universities,
  });

  console.log(`✅ Seeded ${result.count} universities`);

  // Log summary by country
  const countByCountry = universities.reduce((acc: Record<string, number>, uni: { country: string }) => {
    acc[uni.country] = (acc[uni.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Universities by country:');
  Object.entries(countByCountry)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .forEach(([country, count]) => {
      console.log(`   ${country}: ${count}`);
    });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
