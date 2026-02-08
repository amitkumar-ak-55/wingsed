-- CreateEnum
CREATE TYPE "CampusType" AS ENUM ('URBAN', 'SUBURBAN', 'RURAL');

-- CreateEnum
CREATE TYPE "DegreeType" AS ENUM ('BACHELORS', 'MASTERS', 'PHD', 'DIPLOMA', 'CERTIFICATE');

-- AlterTable
ALTER TABLE "universities" ADD COLUMN     "acceptanceRate" DOUBLE PRECISION,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "applicationFee" INTEGER,
ADD COLUMN     "avgScholarshipAmount" INTEGER,
ADD COLUMN     "campusType" "CampusType",
ADD COLUMN     "employmentRate" DOUBLE PRECISION,
ADD COLUMN     "foodHousingCost" INTEGER,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "internationalStudentPercent" DOUBLE PRECISION,
ADD COLUMN     "qsRanking" INTEGER,
ADD COLUMN     "timesRanking" INTEGER,
ADD COLUMN     "totalStudents" INTEGER,
ADD COLUMN     "usNewsRanking" INTEGER;

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "degreeType" "DegreeType" NOT NULL,
    "department" TEXT,
    "duration" TEXT,
    "tuitionFee" INTEGER,
    "description" TEXT,
    "applicationDeadline" TIMESTAMP(3),
    "intakes" TEXT[],
    "greRequired" BOOLEAN NOT NULL DEFAULT false,
    "greMinScore" INTEGER,
    "gmatRequired" BOOLEAN NOT NULL DEFAULT false,
    "gmatMinScore" INTEGER,
    "ieltsMinScore" DOUBLE PRECISION,
    "toeflMinScore" INTEGER,
    "gpaMinScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "programs_universityId_idx" ON "programs"("universityId");

-- CreateIndex
CREATE INDEX "programs_degreeType_idx" ON "programs"("degreeType");

-- CreateIndex
CREATE INDEX "programs_name_idx" ON "programs"("name");

-- CreateIndex
CREATE INDEX "universities_qsRanking_idx" ON "universities"("qsRanking");

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
