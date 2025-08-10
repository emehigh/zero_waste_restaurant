import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the restaurant user
  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email } 
  });
  
  if (!user || user.role !== "RESTAURANT") {
    return NextResponse.json({ error: "Only restaurants can view registered food" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Build where clause with proper typing
    const whereClause: {
      restaurantId: string;
      category?: string;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
        ingredients?: { has: string };
      }>;
    } = {
      restaurantId: user.id,
    };

    if (category && category !== "All") {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { ingredients: { has: search } },
      ];
    }

    const foodItems = await prisma.foodItem.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        category: true,
        ingredients: true,
        allergens: true,
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
        fiber: true,
        sugar: true,
        sodium: true,
        createdAt: true,
        // Include count of current offers using this food item
        _count: {
          select: {
            offers: {
              where: {
                postedAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today's offers
                }
              }
            }
          }
        }
      },
    });

    // Get unique categories for filtering
    const categories = await prisma.foodItem.findMany({
      where: { restaurantId: user.id },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });

    const categoryList = categories.map(c => c.category);

    return NextResponse.json({ 
      foodItems: foodItems.map(item => ({
        ...item,
        currentOffers: item._count.offers
      })),
      categories: ['All', ...categoryList],
      totalCount: foodItems.length
    });

  } catch (error) {
    console.error('Registered food fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch registered food items" }, { status: 500 });
  }
}