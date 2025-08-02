-- CreateTable
CREATE TABLE "FoodOffer" (
    "id" TEXT NOT NULL,
    "food" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FoodOffer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FoodOffer" ADD CONSTRAINT "FoodOffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
