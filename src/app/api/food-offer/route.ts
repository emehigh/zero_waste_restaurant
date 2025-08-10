import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email } 
  });
  
  if (!user || user.role !== "RESTAURANT") {
    return NextResponse.json({ error: "Only restaurants can create offers" }, { status: 403 });
  }

  try {
    const data = await req.json();
    const { food, quantity, unit, price, foodItemId } = data;

    console.log('Creating offer with data:', { food, quantity, unit, price, foodItemId });

    if (!food || !quantity || !unit || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // If foodItemId is provided, verify it exists and belongs to this restaurant
    if (foodItemId) {
      const foodItem = await prisma.foodItem.findFirst({
        where: {
          id: foodItemId,
          restaurantId: user.id
        }
      });

      if (!foodItem) {
        return NextResponse.json({ error: "Food item not found or doesn't belong to your restaurant" }, { status: 400 });
      }

      console.log('✅ Linking to food item:', foodItem.name);
    }

    const offer = await prisma.foodOffer.create({
      data: {
        food,
        quantity: parseInt(quantity, 10),
        unit,
        price: parseFloat(price),
        userId: user.id,
        foodItemId: foodItemId || null, // Link to food item if provided
      },
      include: {
        foodItem: {
          select: {
            imageUrl: true,
            description: true,
            calories: true,
            protein: true,
            allergens: true,
            category: true,
          }
        }
      }
    });

    console.log('✅ Created offer:', {
      id: offer.id,
      food: offer.food,
      linkedToFoodItem: !!offer.foodItemId,
      hasImage: !!offer.foodItem?.imageUrl
    });

    return NextResponse.json({ 
      success: true,
      offer: {
        id: offer.id,
        food: offer.food,
        quantity: offer.quantity,
        unit: offer.unit,
        price: offer.price,
        postedAt: offer.postedAt,
        foodItem: offer.foodItem
      }
    });

  } catch (error) {
    console.error('Offer creation error:', error);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email } 
  });
  
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const offers = await prisma.foodOffer.findMany({
      where: { userId: user.id },
      include: {
        foodItem: {
          select: {
            imageUrl: true,
            description: true,
            calories: true,
            protein: true,
            allergens: true,
            category: true,
          }
        }
      },
      orderBy: { postedAt: "desc" },
    });

    return NextResponse.json({ offers });
  } catch (error) {
    console.error('Offers fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email } 
  });
  
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing offer ID" }, { status: 400 });
    }

    // Delete only offers that belong to this user
    const deletedOffer = await prisma.foodOffer.deleteMany({
      where: { 
        id, 
        userId: user.id 
      },
    });

    if (deletedOffer.count === 0) {
      return NextResponse.json({ error: "Offer not found or doesn't belong to you" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedCount: deletedOffer.count });
  } catch (error) {
    console.error('Offer deletion error:', error);
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}