-- AlterTable
ALTER TABLE "visits" ADD COLUMN     "currentStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "guide" JSONB,
ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "reminders" JSONB,
ADD COLUMN     "summary" TEXT;
