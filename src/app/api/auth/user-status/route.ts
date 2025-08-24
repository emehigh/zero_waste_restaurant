import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        phoneVerified: true,
        phone: true,
        credits: true,
        referralCode: true,
        referralBonus: true,
      }
    });

    return NextResponse.json({
      phoneVerified: user?.phoneVerified || false,
      hasPhone: !!user?.phone,
      credits: user?.credits || 0,
      referralCode: user?.referralCode,
      totalReferralBonus: user?.referralBonus || 0,
    });

  } catch (error) {
    console.error('User status error:', error);
    return NextResponse.json({ error: "Failed to get user status" }, { status: 500 });
  }
}