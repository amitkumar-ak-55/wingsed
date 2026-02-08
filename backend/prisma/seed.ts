import { PrismaClient, CampusType, DegreeType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Read universities from JSON file (single source of truth)
const universitiesPath = path.join(__dirname, '../data/universities.json');

function loadUniversityData(): RawUniversity[] {
  if (!fs.existsSync(universitiesPath)) {
    throw new Error(`Seed data file not found: ${universitiesPath}`);
  }
  try {
    return JSON.parse(fs.readFileSync(universitiesPath, 'utf-8'));
  } catch (e) {
    throw new Error(`Failed to parse universities.json: ${(e as Error).message}`);
  }
}

interface RawProgram {
  name: string;
  degreeType: string;
  department?: string;
  duration?: string;
  tuitionFee?: number;
  description?: string;
  applicationDeadline?: string;
  intakes?: string[];
  greRequired?: boolean;
  greMinScore?: number;
  gmatRequired?: boolean;
  gmatMinScore?: number;
  ieltsMinScore?: number;
  toeflMinScore?: number;
  gpaMinScore?: number;
}

interface RawUniversity {
  name: string;
  country: string;
  city: string;
  tuitionFee: number;
  publicPrivate: string;
  logoUrl?: string;
  imageUrl?: string;
  websiteUrl?: string;
  description?: string;
  address?: string;
  qsRanking?: number;
  timesRanking?: number;
  usNewsRanking?: number;
  acceptanceRate?: number;
  applicationFee?: number;
  campusType?: string;
  totalStudents?: number;
  internationalStudentPercent?: number;
  foodHousingCost?: number;
  avgScholarshipAmount?: number;
  employmentRate?: number;
  programs?: RawProgram[];
}

function validateCampusType(value: string | undefined): CampusType | undefined {
  if (!value) return undefined;
  if (!Object.values(CampusType).includes(value as CampusType)) {
    throw new Error(`Invalid campusType: ${value}`);
  }
  return value as CampusType;
}

function validateDegreeType(value: string): DegreeType {
  if (!Object.values(DegreeType).includes(value as DegreeType)) {
    throw new Error(`Invalid degreeType: ${value}`);
  }
  return value as DegreeType;
}

async function main() {
  console.log('🌱 Starting database seed...');

  const rawData = loadUniversityData();

  // Clear existing data (programs cascade-deleted with universities)
  await prisma.program.deleteMany();
  await prisma.university.deleteMany();
  console.log('🗑️  Cleared existing universities and programs');

  let totalPrograms = 0;

  // Insert each university with its programs
  for (const raw of rawData) {
    const { programs, ...universityData } = raw;

    const university = await prisma.university.create({
      data: {
        ...universityData,
        campusType: validateCampusType(universityData.campusType),
        programs: programs
          ? {
              create: programs.map((p) => ({
                name: p.name,
                degreeType: validateDegreeType(p.degreeType),
                department: p.department,
                duration: p.duration,
                tuitionFee: p.tuitionFee,
                description: p.description,
                applicationDeadline: p.applicationDeadline
                  ? new Date(p.applicationDeadline)
                  : undefined,
                intakes: p.intakes || [],
                greRequired: p.greRequired ?? false,
                greMinScore: p.greMinScore,
                gmatRequired: p.gmatRequired ?? false,
                gmatMinScore: p.gmatMinScore,
                ieltsMinScore: p.ieltsMinScore,
                toeflMinScore: p.toeflMinScore,
                gpaMinScore: p.gpaMinScore,
              })),
            }
          : undefined,
      },
    });

    const programCount = programs?.length ?? 0;
    totalPrograms += programCount;
    console.log(`  ✅ ${university.name} (${programCount} programs)`);
  }

  console.log(`\n✅ Seeded ${rawData.length} universities with ${totalPrograms} programs`);

  // Log summary by country
  const countByCountry = rawData.reduce(
    (acc: Record<string, number>, uni) => {
      acc[uni.country] = (acc[uni.country] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

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
