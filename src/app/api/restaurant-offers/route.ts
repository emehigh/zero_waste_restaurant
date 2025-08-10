import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 });
  }

  try {
    const restaurant = await prisma.user.findUnique({
      where: { id },
      select: {
        name: true,
        email: true,
        logoUrl: true,
        cropY: true,
        cropX: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Check what food items exist for this restaurant
    const foodItems = await prisma.foodItem.findMany({
      where: { restaurantId: id },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      }
    });

    console.log('Food items for restaurant:', foodItems);

    // Fetch offers with food item relations
    const foodOffers = await prisma.foodOffer.findMany({
      where: { userId: id },
      include: {
        foodItem: {
          select: {
            id: true,
            imageUrl: true,
            description: true,
            calories: true,
            protein: true,
            allergens: true,
            category: true,
            ingredients: true,
          }
        }
      },
      orderBy: { postedAt: 'desc' },
    });

    console.log('Raw offers from database:', foodOffers.map(o => ({
      id: o.id,
      food: o.food,
      foodItemId: o.foodItemId,
      hasFoodItem: !!o.foodItem,
      foodItemImage: o.foodItem?.imageUrl
    })));

    // Transform to match frontend expectations exactly
    const offers = foodOffers.map(offer => ({
      id: offer.id,
      food: offer.food,
      quantity: offer.quantity,
      unit: offer.unit,
      price: offer.price,
      postedAt: offer.postedAt.toISOString(),
      foodItem: offer.foodItem ? {
        imageUrl: offer.foodItem.imageUrl || null,
        description: offer.foodItem.description || null,
        calories: offer.foodItem.calories || 0,
        protein: offer.foodItem.protein || 0,
        allergens: offer.foodItem.allergens || [],
        category: offer.foodItem.category || "",
      } : null
    }));

    return NextResponse.json({ 
      restaurant, 
      offers,
      debug: {
        totalFoodItems: foodItems.length,
        totalOffers: offers.length,
        offersWithImages: offers.filter(o => o.foodItem?.imageUrl).length
      }
    });
  } catch (error) {
    console.error('Restaurant offers fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}