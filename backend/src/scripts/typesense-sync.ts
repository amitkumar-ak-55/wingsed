/**
 * Script to sync universities from PostgreSQL to Typesense
 * Run with: npm run typesense:sync
 */

import { PrismaClient } from '@prisma/client';
import Typesense from 'typesense';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const client = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: parseInt(process.env.TYPESENSE_PORT || '8108'),
      protocol: process.env.TYPESENSE_PROTOCOL || 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || 'wingsed_typesense_dev_key',
  connectionTimeoutSeconds: 5,
});

const COLLECTION_NAME = 'universities';

async function main() {
  console.log('🔄 Syncing universities to Typesense...\n');

  // Check Typesense health
  try {
    await client.health.retrieve();
    console.log('✅ Typesense is healthy');
  } catch (error) {
    console.error('❌ Typesense is not available. Make sure it\'s running.');
    console.error('   Run: docker-compose up -d');
    process.exit(1);
  }

  // Create or recreate collection
  const schema = {
    name: COLLECTION_NAME,
    fields: [
      { name: 'id', type: 'string' as const },
      { name: 'name', type: 'string' as const },
      { name: 'country', type: 'string' as const, facet: true },
      { name: 'city', type: 'string' as const },
      { name: 'tuitionFee', type: 'int32' as const },
      { name: 'publicPrivate', type: 'string' as const, facet: true },
      { name: 'description', type: 'string' as const, optional: true },
    ],
    default_sorting_field: 'tuitionFee',
  };

  try {
    await client.collections(COLLECTION_NAME).delete();
    console.log('🗑️  Deleted existing collection');
  } catch {
    console.log('📁 No existing collection to delete');
  }

  await client.collections().create(schema);
  console.log('✅ Created collection schema\n');

  // Get universities from PostgreSQL
  const universities = await prisma.university.findMany();
  console.log(`📊 Found ${universities.length} universities in database`);

  // Transform for Typesense
  const documents = universities.map((uni) => ({
    id: uni.id,
    name: uni.name,
    country: uni.country,
    city: uni.city,
    tuitionFee: uni.tuitionFee,
    publicPrivate: uni.publicPrivate,
    description: uni.description || '',
  }));

  // Import to Typesense
  const result = await client
    .collections(COLLECTION_NAME)
    .documents()
    .import(documents, { action: 'create' });

  const successCount = result.filter((r) => r.success).length;
  const failCount = result.filter((r) => !r.success).length;

  console.log(`\n✅ Synced ${successCount} universities to Typesense`);
  if (failCount > 0) {
    console.log(`⚠️  Failed to sync ${failCount} documents`);
  }

  // Show stats by country
  const countByCountry = universities.reduce((acc, uni) => {
    acc[uni.country] = (acc[uni.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Universities by country:');
  Object.entries(countByCountry)
    .sort((a, b) => b[1] - a[1])
    .forEach(([country, count]) => {
      console.log(`   ${country}: ${count}`);
    });
}

main()
  .catch((e) => {
    console.error('❌ Sync failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
