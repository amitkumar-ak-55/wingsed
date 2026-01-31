import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Real university data from target regions
const universities = [
  // ===========================================
  // UNITED STATES
  // ===========================================
  {
    name: 'Massachusetts Institute of Technology',
    country: 'United States',
    city: 'Cambridge',
    tuitionFee: 57986,
    publicPrivate: 'Private',
    description: 'World-renowned for engineering and technology programs.',
  },
  {
    name: 'Stanford University',
    country: 'United States',
    city: 'Stanford',
    tuitionFee: 56169,
    publicPrivate: 'Private',
    description: 'Leading research university in the heart of Silicon Valley.',
  },
  {
    name: 'University of California, Berkeley',
    country: 'United States',
    city: 'Berkeley',
    tuitionFee: 44066,
    publicPrivate: 'Public',
    description: 'Top public university with strong STEM programs.',
  },
  {
    name: 'University of Michigan',
    country: 'United States',
    city: 'Ann Arbor',
    tuitionFee: 52266,
    publicPrivate: 'Public',
    description: 'Comprehensive research university with diverse programs.',
  },
  {
    name: 'Carnegie Mellon University',
    country: 'United States',
    city: 'Pittsburgh',
    tuitionFee: 58924,
    publicPrivate: 'Private',
    description: 'Globally recognized for computer science and business.',
  },

  // ===========================================
  // UNITED KINGDOM
  // ===========================================
  {
    name: 'University of Oxford',
    country: 'United Kingdom',
    city: 'Oxford',
    tuitionFee: 39000,
    publicPrivate: 'Public',
    description: 'One of the oldest and most prestigious universities in the world.',
  },
  {
    name: 'University of Cambridge',
    country: 'United Kingdom',
    city: 'Cambridge',
    tuitionFee: 37000,
    publicPrivate: 'Public',
    description: 'World-leading research institution with rich academic heritage.',
  },
  {
    name: 'Imperial College London',
    country: 'United Kingdom',
    city: 'London',
    tuitionFee: 42000,
    publicPrivate: 'Public',
    description: 'Focused on science, engineering, medicine, and business.',
  },
  {
    name: 'London School of Economics',
    country: 'United Kingdom',
    city: 'London',
    tuitionFee: 35000,
    publicPrivate: 'Public',
    description: 'Global leader in social sciences and economics.',
  },
  {
    name: 'University of Edinburgh',
    country: 'United Kingdom',
    city: 'Edinburgh',
    tuitionFee: 28000,
    publicPrivate: 'Public',
    description: 'Scotland\'s premier research university.',
  },

  // ===========================================
  // GERMANY
  // ===========================================
  {
    name: 'Technical University of Munich',
    country: 'Germany',
    city: 'Munich',
    tuitionFee: 500,
    publicPrivate: 'Public',
    description: 'Germany\'s top technical university with minimal tuition fees.',
  },
  {
    name: 'Ludwig Maximilian University of Munich',
    country: 'Germany',
    city: 'Munich',
    tuitionFee: 400,
    publicPrivate: 'Public',
    description: 'Leading research university with diverse programs.',
  },
  {
    name: 'Heidelberg University',
    country: 'Germany',
    city: 'Heidelberg',
    tuitionFee: 350,
    publicPrivate: 'Public',
    description: 'Germany\'s oldest university with strong research focus.',
  },
  {
    name: 'RWTH Aachen University',
    country: 'Germany',
    city: 'Aachen',
    tuitionFee: 450,
    publicPrivate: 'Public',
    description: 'Leading technical university specializing in engineering.',
  },
  {
    name: 'Humboldt University of Berlin',
    country: 'Germany',
    city: 'Berlin',
    tuitionFee: 350,
    publicPrivate: 'Public',
    description: 'Prestigious university in the heart of Berlin.',
  },

  // ===========================================
  // IRELAND
  // ===========================================
  {
    name: 'Trinity College Dublin',
    country: 'Ireland',
    city: 'Dublin',
    tuitionFee: 25000,
    publicPrivate: 'Public',
    description: 'Ireland\'s most prestigious university.',
  },
  {
    name: 'University College Dublin',
    country: 'Ireland',
    city: 'Dublin',
    tuitionFee: 23000,
    publicPrivate: 'Public',
    description: 'Research-intensive university with global outlook.',
  },
  {
    name: 'University of Galway',
    country: 'Ireland',
    city: 'Galway',
    tuitionFee: 18000,
    publicPrivate: 'Public',
    description: 'Dynamic university on Ireland\'s west coast.',
  },
  {
    name: 'University College Cork',
    country: 'Ireland',
    city: 'Cork',
    tuitionFee: 19000,
    publicPrivate: 'Public',
    description: 'Leading university in southern Ireland.',
  },

  // ===========================================
  // NETHERLANDS
  // ===========================================
  {
    name: 'University of Amsterdam',
    country: 'Netherlands',
    city: 'Amsterdam',
    tuitionFee: 16000,
    publicPrivate: 'Public',
    description: 'Largest research university in the Netherlands.',
  },
  {
    name: 'Delft University of Technology',
    country: 'Netherlands',
    city: 'Delft',
    tuitionFee: 18000,
    publicPrivate: 'Public',
    description: 'Top technical university with engineering excellence.',
  },
  {
    name: 'Erasmus University Rotterdam',
    country: 'Netherlands',
    city: 'Rotterdam',
    tuitionFee: 15000,
    publicPrivate: 'Public',
    description: 'Known for business, economics, and medical programs.',
  },
  {
    name: 'Leiden University',
    country: 'Netherlands',
    city: 'Leiden',
    tuitionFee: 14000,
    publicPrivate: 'Public',
    description: 'Oldest university in the Netherlands with rich history.',
  },

  // ===========================================
  // ITALY
  // ===========================================
  {
    name: 'Politecnico di Milano',
    country: 'Italy',
    city: 'Milan',
    tuitionFee: 4000,
    publicPrivate: 'Public',
    description: 'Italy\'s largest technical university.',
  },
  {
    name: 'University of Bologna',
    country: 'Italy',
    city: 'Bologna',
    tuitionFee: 3500,
    publicPrivate: 'Public',
    description: 'The oldest university in the Western world.',
  },
  {
    name: 'Sapienza University of Rome',
    country: 'Italy',
    city: 'Rome',
    tuitionFee: 3000,
    publicPrivate: 'Public',
    description: 'Largest European university by enrollment.',
  },
  {
    name: 'Bocconi University',
    country: 'Italy',
    city: 'Milan',
    tuitionFee: 14000,
    publicPrivate: 'Private',
    description: 'Premier business school in Europe.',
  },

  // ===========================================
  // FRANCE
  // ===========================================
  {
    name: 'Sorbonne University',
    country: 'France',
    city: 'Paris',
    tuitionFee: 4500,
    publicPrivate: 'Public',
    description: 'World-famous university with rich academic tradition.',
  },
  {
    name: 'École Polytechnique',
    country: 'France',
    city: 'Palaiseau',
    tuitionFee: 15000,
    publicPrivate: 'Public',
    description: 'France\'s leading engineering grande école.',
  },
  {
    name: 'HEC Paris',
    country: 'France',
    city: 'Paris',
    tuitionFee: 45000,
    publicPrivate: 'Private',
    description: 'Top European business school for MBA.',
  },
  {
    name: 'Sciences Po',
    country: 'France',
    city: 'Paris',
    tuitionFee: 14000,
    publicPrivate: 'Public',
    description: 'Leading university for political and social sciences.',
  },

  // ===========================================
  // SPAIN
  // ===========================================
  {
    name: 'IE Business School',
    country: 'Spain',
    city: 'Madrid',
    tuitionFee: 42000,
    publicPrivate: 'Private',
    description: 'Top-ranked global business school.',
  },
  {
    name: 'University of Barcelona',
    country: 'Spain',
    city: 'Barcelona',
    tuitionFee: 3500,
    publicPrivate: 'Public',
    description: 'Spain\'s top comprehensive university.',
  },
  {
    name: 'ESADE Business School',
    country: 'Spain',
    city: 'Barcelona',
    tuitionFee: 38000,
    publicPrivate: 'Private',
    description: 'World-renowned business and law school.',
  },
  {
    name: 'Autonomous University of Madrid',
    country: 'Spain',
    city: 'Madrid',
    tuitionFee: 2500,
    publicPrivate: 'Public',
    description: 'Leading research university in Spain.',
  },

  // ===========================================
  // UNITED ARAB EMIRATES
  // ===========================================
  {
    name: 'New York University Abu Dhabi',
    country: 'United Arab Emirates',
    city: 'Abu Dhabi',
    tuitionFee: 53000,
    publicPrivate: 'Private',
    description: 'Liberal arts campus of NYU in the Middle East.',
  },
  {
    name: 'American University of Sharjah',
    country: 'United Arab Emirates',
    city: 'Sharjah',
    tuitionFee: 25000,
    publicPrivate: 'Private',
    description: 'American-style education in the UAE.',
  },
  {
    name: 'Khalifa University',
    country: 'United Arab Emirates',
    city: 'Abu Dhabi',
    tuitionFee: 18000,
    publicPrivate: 'Public',
    description: 'Research university focused on science and technology.',
  },
  {
    name: 'University of Dubai',
    country: 'United Arab Emirates',
    city: 'Dubai',
    tuitionFee: 15000,
    publicPrivate: 'Private',
    description: 'Business-focused university in Dubai.',
  },

  // ===========================================
  // SAUDI ARABIA
  // ===========================================
  {
    name: 'King Abdullah University of Science and Technology',
    country: 'Saudi Arabia',
    city: 'Thuwal',
    tuitionFee: 0,
    publicPrivate: 'Private',
    description: 'Fully-funded graduate research university.',
  },
  {
    name: 'King Saud University',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    tuitionFee: 5000,
    publicPrivate: 'Public',
    description: 'Saudi Arabia\'s oldest and largest university.',
  },
  {
    name: 'King Fahd University of Petroleum and Minerals',
    country: 'Saudi Arabia',
    city: 'Dhahran',
    tuitionFee: 3000,
    publicPrivate: 'Public',
    description: 'Leading technical university in the Middle East.',
  },

  // ===========================================
  // AUSTRALIA
  // ===========================================
  {
    name: 'University of Melbourne',
    country: 'Australia',
    city: 'Melbourne',
    tuitionFee: 45000,
    publicPrivate: 'Public',
    description: 'Australia\'s top-ranked university.',
  },
  {
    name: 'University of Sydney',
    country: 'Australia',
    city: 'Sydney',
    tuitionFee: 48000,
    publicPrivate: 'Public',
    description: 'Australia\'s oldest university with global reputation.',
  },
  {
    name: 'Australian National University',
    country: 'Australia',
    city: 'Canberra',
    tuitionFee: 42000,
    publicPrivate: 'Public',
    description: 'National research university ranked among the best.',
  },
  {
    name: 'University of New South Wales',
    country: 'Australia',
    city: 'Sydney',
    tuitionFee: 46000,
    publicPrivate: 'Public',
    description: 'Research-intensive university with industry connections.',
  },
  {
    name: 'Monash University',
    country: 'Australia',
    city: 'Melbourne',
    tuitionFee: 44000,
    publicPrivate: 'Public',
    description: 'Australia\'s largest university with global campuses.',
  },

  // ===========================================
  // NEW ZEALAND
  // ===========================================
  {
    name: 'University of Auckland',
    country: 'New Zealand',
    city: 'Auckland',
    tuitionFee: 32000,
    publicPrivate: 'Public',
    description: 'New Zealand\'s largest and highest-ranked university.',
  },
  {
    name: 'University of Otago',
    country: 'New Zealand',
    city: 'Dunedin',
    tuitionFee: 28000,
    publicPrivate: 'Public',
    description: 'New Zealand\'s first university with strong research.',
  },
  {
    name: 'Victoria University of Wellington',
    country: 'New Zealand',
    city: 'Wellington',
    tuitionFee: 27000,
    publicPrivate: 'Public',
    description: 'Capital city university with law and humanities focus.',
  },
  {
    name: 'University of Canterbury',
    country: 'New Zealand',
    city: 'Christchurch',
    tuitionFee: 26000,
    publicPrivate: 'Public',
    description: 'Strong engineering and sciences programs.',
  },
];

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
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
