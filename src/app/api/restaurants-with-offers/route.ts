import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  // Get all restaurants (users with role RESTAURANT) and all their data
  const restaurants = await prisma.user.findMany({
    where: { role: "RESTAURANT" },
    include: {
      offers: true, // include all offer data
    },
  });

  return NextResponse.json({ restaurants });
}