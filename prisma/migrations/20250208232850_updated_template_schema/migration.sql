/*
  Warnings:

  - You are about to drop the column `previewUrl` on the `LibraryItem` table. All the data in the column will be lost.
  - You are about to drop the column `pdfUrl` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `previewUrl` on the `Template` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LibraryItem" DROP COLUMN "previewUrl";

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "pdfUrl",
DROP COLUMN "previewUrl",
ADD COLUMN     "imageUrl" TEXT NOT NULL;
