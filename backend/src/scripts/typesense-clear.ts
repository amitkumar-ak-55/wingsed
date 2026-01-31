/**
 * Script to clear Typesense collection
 * Run with: npm run typesense:clear
 */

import Typesense from 'typesense';
import * as dotenv from 'dotenv';

dotenv.config();

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
  console.log('🗑️  Clearing Typesense collection...\n');

  try {
    await client.collections(COLLECTION_NAME).delete();
    console.log(`✅ Deleted collection: ${COLLECTION_NAME}`);
  } catch (error: any) {
    if (error.httpStatus === 404) {
      console.log('📁 Collection does not exist');
    } else {
      throw error;
    }
  }
}

main().catch((e) => {
  console.error('❌ Clear failed:', e);
  process.exit(1);
});
