-- AlterTable
ALTER TABLE "ProjectDeliverable" ADD COLUMN     "copiesToPrint" INTEGER,
ADD COLUMN     "readyForPrinting" BOOLEAN DEFAULT false;
