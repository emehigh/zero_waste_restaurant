import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  // Get all restaurants (users with role RESTAURANT) and their offer counts
  const restaurants = await prisma.user.findMany({
    where: { role: "RESTAURANT" },
    select: {
      id: true,
      email: true,
      offers: {
        select: { id: true },
      },
    },
  });

  // Map to desired shape
  const result = restaurants.map((r) => ({
    id: r.id,
    name: r.email, // Use email as display name
    logoUrl: null, // No logo yet
    offerCount: r.offers.length,
  }));

  return NextResponse.json({ restaurants: result });
}