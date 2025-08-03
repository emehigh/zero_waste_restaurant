import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const restaurant = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true },
  });

  if (!restaurant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const offers = await prisma.foodOffer.findMany({
    where: { userId: id },
    orderBy: { postedAt: "desc" },
  });

  return NextResponse.json({ restaurant, offers });
}