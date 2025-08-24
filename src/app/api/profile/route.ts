import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneVerified: true,
        credits: true,
        referralCode: true,
        referredBy: true,
        referralBonus: true,
        hasUsedReferral: true,
        createdAt: true,
        logoUrl: true,
        cropX: true,
        cropY: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get referral stats
    const referralStats = await prisma.user.findMany({
      where: { referredBy: user.referralCode },
      select: {
        name: true,
        email: true,
        createdAt: true,
        phoneVerified: true,
      }
    });

    // Get order history (mock data for now - you can implement actual orders later)
    const orderHistory = [
      {
        id: "1",
        restaurantName: "Green Bistro",
        items: ["Pasta Bolognese", "Caesar Salad"],
        total: 45.50,
        status: "completed",
        date: "2024-08-15T18:30:00Z",
        pickupTime: "19:00",
      },
      {
        id: "2", 
        restaurantName: "Eco Kitchen",
        items: ["Vegetable Curry", "Rice"],
        total: 28.00,
        status: "completed",
        date: "2024-08-12T19:15:00Z",
        pickupTime: "19:45",
      },
    ];

    return NextResponse.json({
      user: {
        ...user,
        totalReferrals: referralStats.length,
        verifiedReferrals: referralStats.filter(r => r.phoneVerified).length,
      },
      referralStats,
      orderHistory,
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, phone } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name && { name }),
        ...(phone && { phone, phoneVerified: false }), // Reset verification if phone changed
      },
      select: {
        name: true,
        phone: true,
        phoneVerified: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: phone ? "Phone updated. Please verify your new number." : "Profile updated successfully"
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}