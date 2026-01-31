import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Real university data with logos and website URLs
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
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/2560px-MIT_logo.svg.png',
    websiteUrl: 'https://www.mit.edu',
    description: 'MIT is a world-renowned private research university in Cambridge, Massachusetts. Known for its cutting-edge research in engineering, computer science, and technology, MIT has produced 98 Nobel laureates and is consistently ranked among the top universities globally.',
  },
  {
    name: 'Stanford University',
    country: 'United States',
    city: 'Stanford',
    tuitionFee: 56169,
    publicPrivate: 'Private',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Stanford_Cardinal_logo.svg/1200px-Stanford_Cardinal_logo.svg.png',
    websiteUrl: 'https://www.stanford.edu',
    description: 'Located in the heart of Silicon Valley, Stanford University is one of the world\'s leading research and teaching institutions. Founded in 1885, it has been the birthplace of countless innovations and startups including Google, Netflix, and LinkedIn.',
  },
  {
    name: 'University of California, Berkeley',
    country: 'United States',
    city: 'Berkeley',
    tuitionFee: 44066,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Seal_of_University_of_California%2C_Berkeley.svg/1200px-Seal_of_University_of_California%2C_Berkeley.svg.png',
    websiteUrl: 'https://www.berkeley.edu',
    description: 'UC Berkeley is a top-ranked public research university established in 1868. As the flagship institution of the University of California system, it is known for its academic excellence, groundbreaking research, and 110 Nobel laureates.',
  },
  {
    name: 'University of Michigan',
    country: 'United States',
    city: 'Ann Arbor',
    tuitionFee: 52266,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Seal_of_the_University_of_Michigan.svg/1200px-Seal_of_the_University_of_Michigan.svg.png',
    websiteUrl: 'https://umich.edu',
    description: 'The University of Michigan is one of America\'s top public research universities. Founded in 1817, it offers over 280 degree programs across 17 schools and colleges. Known for strong engineering, business, law, and medical programs.',
  },
  {
    name: 'Carnegie Mellon University',
    country: 'United States',
    city: 'Pittsburgh',
    tuitionFee: 58924,
    publicPrivate: 'Private',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Carnegie_Mellon_wordmark.svg/1280px-Carnegie_Mellon_wordmark.svg.png',
    websiteUrl: 'https://www.cmu.edu',
    description: 'Carnegie Mellon is a global leader in computer science, robotics, and artificial intelligence research. Founded by Andrew Carnegie in 1900, its School of Computer Science is consistently ranked #1 in the world.',
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
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/1200px-Oxford-University-Circlet.svg.png',
    websiteUrl: 'https://www.ox.ac.uk',
    description: 'Founded in 1096, Oxford is the oldest university in the English-speaking world. Its 39 colleges host over 24,000 students from 140+ countries. Oxford has produced 72 Nobel Prize winners and 28 British Prime Ministers.',
  },
  {
    name: 'University of Cambridge',
    country: 'United Kingdom',
    city: 'Cambridge',
    tuitionFee: 37000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Coat_of_Arms_of_the_University_of_Cambridge.svg/1200px-Coat_of_Arms_of_the_University_of_Cambridge.svg.png',
    websiteUrl: 'https://www.cam.ac.uk',
    description: 'Cambridge University, founded in 1209, is one of the world\'s most prestigious institutions. With 31 colleges and over 100 departments, it excels in sciences, humanities, and arts. Alumni include Isaac Newton, Charles Darwin, and Stephen Hawking.',
  },
  {
    name: 'Imperial College London',
    country: 'United Kingdom',
    city: 'London',
    tuitionFee: 42000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Imperial_College_London_crest.svg/1200px-Imperial_College_London_crest.svg.png',
    websiteUrl: 'https://www.imperial.ac.uk',
    description: 'Imperial College is a world-leading science, engineering, medicine, and business institution in central London. Ranked consistently in the top 10 globally, Imperial focuses on research that addresses global challenges.',
  },
  {
    name: 'London School of Economics',
    country: 'United Kingdom',
    city: 'London',
    tuitionFee: 35000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/LSE_Logo.svg/1200px-LSE_Logo.svg.png',
    websiteUrl: 'https://www.lse.ac.uk',
    description: 'LSE is the world\'s leading social science university, located in the heart of London. Founded in 1895, it specializes in economics, political science, sociology, law, and international relations. LSE has educated 37 world leaders.',
  },
  {
    name: 'University of Edinburgh',
    country: 'United Kingdom',
    city: 'Edinburgh',
    tuitionFee: 28000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/University_of_Edinburgh_ceremonial_roundel.svg/1200px-University_of_Edinburgh_ceremonial_roundel.svg.png',
    websiteUrl: 'https://www.ed.ac.uk',
    description: 'Founded in 1582, Edinburgh is Scotland\'s leading research university and one of the UK\'s top institutions. Known for medicine, AI, and informatics, with notable alumni including Charles Darwin and Alexander Graham Bell.',
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
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Logo_of_the_Technical_University_of_Munich.svg/1200px-Logo_of_the_Technical_University_of_Munich.svg.png',
    websiteUrl: 'https://www.tum.de/en',
    description: 'TUM is Germany\'s top technical university and one of Europe\'s leading research institutions. With virtually free tuition for international students, it offers world-class programs in engineering, computer science, and natural sciences.',
  },
  {
    name: 'Ludwig Maximilian University of Munich',
    country: 'Germany',
    city: 'Munich',
    tuitionFee: 400,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/LMU_Muenchen_Logo.svg/2560px-LMU_Muenchen_Logo.svg.png',
    websiteUrl: 'https://www.lmu.de/en',
    description: 'LMU Munich is one of Europe\'s leading research universities, founded in 1472. With 50,000+ students and minimal tuition fees, it excels in medicine, law, physics, and humanities. LMU has produced 43 Nobel laureates.',
  },
  {
    name: 'Heidelberg University',
    country: 'Germany',
    city: 'Heidelberg',
    tuitionFee: 350,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Ruprecht-Karls-Universit%C3%A4t_Heidelberg_Logo.svg/2560px-Ruprecht-Karls-Universit%C3%A4t_Heidelberg_Logo.svg.png',
    websiteUrl: 'https://www.uni-heidelberg.de/en',
    description: 'Founded in 1386, Heidelberg is Germany\'s oldest university and a member of the elite German Universities Excellence Initiative. Known for medicine, life sciences, and humanities in one of Germany\'s most beautiful cities.',
  },
  {
    name: 'RWTH Aachen University',
    country: 'Germany',
    city: 'Aachen',
    tuitionFee: 450,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/RWTH_Aachen_University_Logo.svg/1200px-RWTH_Aachen_University_Logo.svg.png',
    websiteUrl: 'https://www.rwth-aachen.de/go/id/a/?lidx=1',
    description: 'RWTH Aachen is Germany\'s largest technical university and a leading engineering school in Europe. With strong ties to the automotive and tech industries, it offers excellent career prospects in mechanical and electrical engineering.',
  },
  {
    name: 'Humboldt University of Berlin',
    country: 'Germany',
    city: 'Berlin',
    tuitionFee: 350,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Huberlin-logo.svg/1200px-Huberlin-logo.svg.png',
    websiteUrl: 'https://www.hu-berlin.de/en',
    description: 'Humboldt University, founded in 1810, is one of Berlin\'s most prestigious institutions. Alumni include Albert Einstein, Max Planck, and 57 Nobel laureates. Located in the heart of Berlin with affordable world-class education.',
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
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Trinity_College_Dublin_Coat_of_Arms.svg/1200px-Trinity_College_Dublin_Coat_of_Arms.svg.png',
    websiteUrl: 'https://www.tcd.ie',
    description: 'Founded in 1592, Trinity is Ireland\'s oldest and most prestigious university. Located in the heart of Dublin, its historic campus is home to the famous Book of Kells. Trinity excels in computer science, medicine, and humanities.',
  },
  {
    name: 'University College Dublin',
    country: 'Ireland',
    city: 'Dublin',
    tuitionFee: 23000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/University_College_Dublin_Logo.svg/1200px-University_College_Dublin_Logo.svg.png',
    websiteUrl: 'https://www.ucd.ie',
    description: 'UCD is Ireland\'s largest university with 35,000+ students from 139 countries. Founded in 1854, it offers world-class programs in business, engineering, and sciences. UCD\'s modern campus and strong industry links make it a top choice.',
  },
  {
    name: 'University of Galway',
    country: 'Ireland',
    city: 'Galway',
    tuitionFee: 18000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/University_of_Galway_Logo.svg/1200px-University_of_Galway_Logo.svg.png',
    websiteUrl: 'https://www.universityofgalway.ie',
    description: 'University of Galway combines academic excellence with the charm of Ireland\'s west coast. Known for biomedical science, engineering, and marine research, it offers a unique student experience in one of Ireland\'s most cultural cities.',
  },
  {
    name: 'University College Cork',
    country: 'Ireland',
    city: 'Cork',
    tuitionFee: 19000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/UCC_logo.svg/1200px-UCC_logo.svg.png',
    websiteUrl: 'https://www.ucc.ie',
    description: 'UCC was named Irish University of the Year five times. Founded in 1845, it\'s known for its beautiful riverside campus and strong programs in pharmacy, food science, and law. Cork offers excellent quality of life with lower living costs.',
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
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Zegel_van_de_Universiteit_van_Amsterdam.svg/1200px-Zegel_van_de_Universiteit_van_Amsterdam.svg.png',
    websiteUrl: 'https://www.uva.nl/en',
    description: 'Founded in 1632, the University of Amsterdam is one of Europe\'s most comprehensive universities. Located in one of the world\'s most international cities, it offers 200+ English-taught programs and attracts students from 100+ countries.',
  },
  {
    name: 'Delft University of Technology',
    country: 'Netherlands',
    city: 'Delft',
    tuitionFee: 18000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/TU_Delft_Logo.svg/1200px-TU_Delft_Logo.svg.png',
    websiteUrl: 'https://www.tudelft.nl/en',
    description: 'TU Delft is the Netherlands\' largest and oldest technical university. Ranked among the world\'s top engineering schools, it excels in aerospace, civil engineering, and architecture with a focus on sustainable innovation.',
  },
  {
    name: 'Erasmus University Rotterdam',
    country: 'Netherlands',
    city: 'Rotterdam',
    tuitionFee: 15000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Erasmus_Universiteit_Rotterdam_logo.svg/1200px-Erasmus_Universiteit_Rotterdam_logo.svg.png',
    websiteUrl: 'https://www.eur.nl/en',
    description: 'Erasmus University is a top European research university known for its Rotterdam School of Management (RSM), one of Europe\'s best business schools. Located in Europe\'s largest port city, it excels in economics, medicine, and social sciences.',
  },
  {
    name: 'Leiden University',
    country: 'Netherlands',
    city: 'Leiden',
    tuitionFee: 14000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Leiden_University_seal.svg/1200px-Leiden_University_seal.svg.png',
    websiteUrl: 'https://www.universiteitleiden.nl/en',
    description: 'Founded in 1575, Leiden is the Netherlands\' oldest and most prestigious university. Einstein was a professor here. Located between Amsterdam and The Hague, Leiden excels in law, humanities, and sciences.',
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
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Polimi_logo.svg/1200px-Polimi_logo.svg.png',
    websiteUrl: 'https://www.polimi.it/en',
    description: 'Politecnico di Milano is Italy\'s largest technical university and one of Europe\'s top engineering schools. Founded in 1863, it\'s known for architecture, design, and engineering. Affordable tuition in Italy\'s business capital.',
  },
  {
    name: 'University of Bologna',
    country: 'Italy',
    city: 'Bologna',
    tuitionFee: 3500,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Seal_of_the_University_of_Bologna.svg/1200px-Seal_of_the_University_of_Bologna.svg.png',
    websiteUrl: 'https://www.unibo.it/en',
    description: 'Founded in 1088, Bologna is the world\'s oldest university in continuous operation. Known as "La Dotta" (The Learned), it offers programs across all disciplines. Bologna\'s central location and affordable living make it ideal for students.',
  },
  {
    name: 'Sapienza University of Rome',
    country: 'Italy',
    city: 'Rome',
    tuitionFee: 3000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/69/Seal_of_Sapienza_University_of_Rome.svg/1200px-Seal_of_Sapienza_University_of_Rome.svg.png',
    websiteUrl: 'https://www.uniroma1.it/en',
    description: 'Sapienza is Europe\'s largest university with 115,000+ students. Founded in 1303, it offers affordable world-class education in the Eternal City. Sapienza excels in classics, archaeology, physics, and medicine.',
  },
  {
    name: 'Bocconi University',
    country: 'Italy',
    city: 'Milan',
    tuitionFee: 14000,
    publicPrivate: 'Private',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Universit%C3%A0_Bocconi_logo.svg/1200px-Universit%C3%A0_Bocconi_logo.svg.png',
    websiteUrl: 'https://www.unibocconi.eu',
    description: 'Bocconi is one of Europe\'s top business schools, located in Milan\'s fashion and finance district. Known for economics, management, and law, it offers a highly international environment with alumni leading major European companies.',
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
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Logo_Sorbonne_Universit%C3%A9.svg/1200px-Logo_Sorbonne_Universit%C3%A9.svg.png',
    websiteUrl: 'https://www.sorbonne-universite.fr/en',
    description: 'The Sorbonne is one of the world\'s oldest and most famous universities, founded in 1257. Located in the heart of Paris, it excels in humanities, sciences, and medicine. Affordable tuition for a Parisian education.',
  },
  {
    name: 'École Polytechnique',
    country: 'France',
    city: 'Palaiseau',
    tuitionFee: 15000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Logo_%C3%89cole_polytechnique.svg/1200px-Logo_%C3%89cole_polytechnique.svg.png',
    websiteUrl: 'https://www.polytechnique.edu/en',
    description: 'École Polytechnique is France\'s leading engineering grande école and one of the world\'s most selective institutions. Founded in 1794, it combines cutting-edge research with intensive multidisciplinary education.',
  },
  {
    name: 'HEC Paris',
    country: 'France',
    city: 'Paris',
    tuitionFee: 45000,
    publicPrivate: 'Private',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Logo_HEC_Paris.svg/1200px-Logo_HEC_Paris.svg.png',
    websiteUrl: 'https://www.hec.edu/en',
    description: 'HEC Paris is Europe\'s top-ranked business school, consistently rated #1 for its MBA and Master programs. Located near Paris, it offers world-class business education with strong corporate connections.',
  },
  {
    name: 'Sciences Po',
    country: 'France',
    city: 'Paris',
    tuitionFee: 14000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Logo_Sciences_Po.svg/1200px-Logo_Sciences_Po.svg.png',
    websiteUrl: 'https://www.sciencespo.fr/en',
    description: 'Sciences Po is France\'s leading university for political science and international affairs. Located in Paris, it has educated presidents, prime ministers, and global leaders. Known for its selective admissions and international outlook.',
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
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/IE_University_logo.svg/1200px-IE_University_logo.svg.png',
    websiteUrl: 'https://www.ie.edu',
    description: 'IE University is a top international business school in Madrid, known for innovation in education. Its diverse student body from 130+ countries creates a global learning environment. IE excels in entrepreneurship and technology.',
  },
  {
    name: 'University of Barcelona',
    country: 'Spain',
    city: 'Barcelona',
    tuitionFee: 3500,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Escudo_de_la_Universidad_de_Barcelona.svg/1200px-Escudo_de_la_Universidad_de_Barcelona.svg.png',
    websiteUrl: 'https://www.ub.edu/web/ub/en',
    description: 'Founded in 1450, the University of Barcelona is Spain\'s premier public university. With 60,000+ students, it offers affordable programs in sciences, humanities, and medicine. Barcelona\'s Mediterranean lifestyle enhances the experience.',
  },
  {
    name: 'ESADE Business School',
    country: 'Spain',
    city: 'Barcelona',
    tuitionFee: 38000,
    publicPrivate: 'Private',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/ESADE_Logo.svg/1200px-ESADE_Logo.svg.png',
    websiteUrl: 'https://www.esade.edu/en',
    description: 'ESADE is one of Europe\'s top business schools, located in vibrant Barcelona. Known for its MBA, law, and executive education programs, ESADE combines academic rigor with entrepreneurial spirit.',
  },
  {
    name: 'Autonomous University of Madrid',
    country: 'Spain',
    city: 'Madrid',
    tuitionFee: 2500,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Escudo_de_la_Universidad_Aut%C3%B3noma_de_Madrid.svg/1200px-Escudo_de_la_Universidad_Aut%C3%B3noma_de_Madrid.svg.png',
    websiteUrl: 'https://www.uam.es/en',
    description: 'UAM is one of Spain\'s top research universities, located on a modern campus near Madrid. Known for law, biology, and physics, it offers excellent facilities and international programs at affordable rates.',
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
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/New_York_University_Seal.svg/1200px-New_York_University_Seal.svg.png',
    websiteUrl: 'https://nyuad.nyu.edu',
    description: 'NYU Abu Dhabi offers a full NYU degree in a spectacular campus on Saadiyat Island. One of the world\'s most selective universities, it provides full scholarships to admitted students. Diverse student body from 120+ countries.',
  },
  {
    name: 'American University of Sharjah',
    country: 'United Arab Emirates',
    city: 'Sharjah',
    tuitionFee: 25000,
    publicPrivate: 'Private',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/American_University_of_Sharjah_%28emblem%29.svg/1200px-American_University_of_Sharjah_%28emblem%29.svg.png',
    websiteUrl: 'https://www.aus.edu',
    description: 'AUS offers American-style education on a stunning campus in Sharjah. Accredited by US agencies, it attracts students from 100+ countries. Known for engineering, architecture, and business excellence.',
  },
  {
    name: 'Khalifa University',
    country: 'United Arab Emirates',
    city: 'Abu Dhabi',
    tuitionFee: 18000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Khalifa_University_of_Science_and_Technology_Logo.svg/1200px-Khalifa_University_of_Science_and_Technology_Logo.svg.png',
    websiteUrl: 'https://www.ku.ac.ae',
    description: 'Khalifa University is the UAE\'s top research university, focused on science, engineering, and technology. With world-class facilities and generous scholarships, it attracts top talent globally.',
  },
  {
    name: 'University of Dubai',
    country: 'United Arab Emirates',
    city: 'Dubai',
    tuitionFee: 15000,
    publicPrivate: 'Private',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/87/University_of_Dubai_logo.png',
    websiteUrl: 'https://ud.ac.ae',
    description: 'The University of Dubai offers accredited programs in business, IT, and law in the heart of Dubai. With strong industry connections in the UAE\'s business hub, graduates enjoy excellent employment prospects.',
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
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/36/KAUST_logo.svg/1200px-KAUST_logo.svg.png',
    websiteUrl: 'https://www.kaust.edu.sa',
    description: 'KAUST is a fully-funded graduate research university offering free tuition, housing, and living allowances to all admitted students. Located on the Red Sea, it focuses on science and technology to address global challenges.',
  },
  {
    name: 'King Saud University',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    tuitionFee: 5000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/King_Saud_University_Logo.svg/1200px-King_Saud_University_Logo.svg.png',
    websiteUrl: 'https://ksu.edu.sa/en',
    description: 'King Saud University is Saudi Arabia\'s oldest and largest university. With generous scholarships and modern facilities, it offers programs in medicine, engineering, and sciences on an 800-hectare campus in Riyadh.',
  },
  {
    name: 'King Fahd University of Petroleum and Minerals',
    country: 'Saudi Arabia',
    city: 'Dhahran',
    tuitionFee: 3000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c4/KFUPM_Logo.svg/1200px-KFUPM_Logo.svg.png',
    websiteUrl: 'https://www.kfupm.edu.sa',
    description: 'KFUPM is the Middle East\'s leading technical university, specializing in petroleum engineering, computer science, and business. Strong ties to Saudi Aramco ensure excellent career prospects for graduates.',
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
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/ed/University_of_Melbourne_logo.svg/1200px-University_of_Melbourne_logo.svg.png',
    websiteUrl: 'https://www.unimelb.edu.au',
    description: 'The University of Melbourne is Australia\'s second-oldest university and consistently ranked #1 in Australia. Established in 1853, it offers comprehensive programs in business, engineering, medicine, and arts.',
  },
  {
    name: 'University of Sydney',
    country: 'Australia',
    city: 'Sydney',
    tuitionFee: 48000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d8/University_of_Sydney_logo.svg/1200px-University_of_Sydney_logo.svg.png',
    websiteUrl: 'https://www.sydney.edu.au',
    description: 'Founded in 1850, the University of Sydney is Australia\'s first university. Located near Sydney\'s iconic harbor, it offers 400+ programs. Known for graduate employability with alumni including five prime ministers.',
  },
  {
    name: 'Australian National University',
    country: 'Australia',
    city: 'Canberra',
    tuitionFee: 42000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/Australian_National_University_crest.svg/1200px-Australian_National_University_crest.svg.png',
    websiteUrl: 'https://www.anu.edu.au',
    description: 'ANU is Australia\'s national research university, located in the capital city. Founded in 1946, it consistently ranks as Australia\'s top university. Known for public policy, international relations, and sciences.',
  },
  {
    name: 'University of New South Wales',
    country: 'Australia',
    city: 'Sydney',
    tuitionFee: 46000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/UNSW_logo.svg/1200px-UNSW_logo.svg.png',
    websiteUrl: 'https://www.unsw.edu.au',
    description: 'UNSW Sydney is a leading Australian research university with a focus on innovation and entrepreneurship. Known for engineering, business, and design, UNSW has produced more millionaire graduates than any other Australian university.',
  },
  {
    name: 'Monash University',
    country: 'Australia',
    city: 'Melbourne',
    tuitionFee: 44000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Monash_University_logo.svg/1280px-Monash_University_logo.svg.png',
    websiteUrl: 'https://www.monash.edu',
    description: 'Monash is Australia\'s largest university and a member of the prestigious Group of Eight. With campuses across four continents, it offers a truly global education. Excels in pharmacy, engineering, and medicine.',
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
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a5/Crest_of_the_University_of_Auckland.svg/1200px-Crest_of_the_University_of_Auckland.svg.png',
    websiteUrl: 'https://www.auckland.ac.nz',
    description: 'The University of Auckland is New Zealand\'s leading university, ranked in the global top 100. Located in Auckland, it offers comprehensive programs. The post-study work visa makes it attractive for international students.',
  },
  {
    name: 'University of Otago',
    country: 'New Zealand',
    city: 'Dunedin',
    tuitionFee: 28000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6d/Crest_of_the_University_of_Otago.svg/1200px-Crest_of_the_University_of_Otago.svg.png',
    websiteUrl: 'https://www.otago.ac.nz',
    description: 'Founded in 1869, Otago is New Zealand\'s oldest university. Known for medicine, health sciences, and research, it offers a unique campus experience in the charming city of Dunedin with affordable living.',
  },
  {
    name: 'Victoria University of Wellington',
    country: 'New Zealand',
    city: 'Wellington',
    tuitionFee: 27000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/VUW_Logo.svg/1200px-VUW_Logo.svg.png',
    websiteUrl: 'https://www.wgtn.ac.nz',
    description: 'Victoria University is located in New Zealand\'s capital, Wellington. Known for law, humanities, and sciences, it\'s the country\'s top-ranked university for research intensity. Wellington\'s creative industries offer unique opportunities.',
  },
  {
    name: 'University of Canterbury',
    country: 'New Zealand',
    city: 'Christchurch',
    tuitionFee: 26000,
    publicPrivate: 'Public',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/ca/UC_shield.svg/1200px-UC_shield.svg.png',
    websiteUrl: 'https://www.canterbury.ac.nz',
    description: 'The University of Canterbury is known for engineering, sciences, and forestry. Located in Christchurch, New Zealand\'s second-largest city, it offers a safe, affordable student experience with post-study work opportunities.',
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
