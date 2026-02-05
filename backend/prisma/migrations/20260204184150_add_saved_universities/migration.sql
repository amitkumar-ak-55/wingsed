-- AlterTable
ALTER TABLE "universities" ADD COLUMN     "websiteUrl" TEXT;

-- CreateTable
CREATE TABLE "saved_universities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_universities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_universities_userId_idx" ON "saved_universities"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_universities_userId_universityId_key" ON "saved_universities"("userId", "universityId");

-- AddForeignKey
ALTER TABLE "saved_universities" ADD CONSTRAINT "saved_universities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_universities" ADD CONSTRAINT "saved_universities_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
