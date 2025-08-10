import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the restaurant user
  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email } 
  });
  
  if (!user || user.role !== "RESTAURANT") {
    return NextResponse.json({ error: "Only restaurants can register food items" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const ingredientsJson = formData.get("ingredients") as string;
    const allergensJson = formData.get("allergens") as string;
    const calories = parseFloat(formData.get("calories") as string) || 0;
    const protein = parseFloat(formData.get("protein") as string) || 0;
    const carbs = parseFloat(formData.get("carbs") as string) || 0;
    const fat = parseFloat(formData.get("fat") as string) || 0;
    const fiber = parseFloat(formData.get("fiber") as string) || 0;
    const sugar = parseFloat(formData.get("sugar") as string) || 0;
    const sodium = parseFloat(formData.get("sodium") as string) || 0;
    const image = formData.get("image") as File | null;

    // Parse JSON arrays
    const ingredients = ingredientsJson ? JSON.parse(ingredientsJson) : [];
    const allergens = allergensJson ? JSON.parse(allergensJson) : [];

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json({ error: "Name and category are required" }, { status: 400 });
    }

    let imageUrl = null;
    if (image && image.size > 0) {
      try {
        // Upload to Cloudinary
        const buffer = Buffer.from(await image.arrayBuffer());
        const base64 = buffer.toString('base64');
        const dataURI = `data:${image.type};base64,${base64}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'food-items',
          public_id: `food-${user.id}-${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', quality: 'auto' }
          ]
        });
        
        imageUrl = result.secure_url;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
      }
    }

    // Create the food item
    const foodItem = await prisma.foodItem.create({
      data: {
        name,
        description,
        imageUrl,
        category,
        ingredients,
        allergens,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar,
        sodium,
        restaurantId: user.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      foodItem: {
        id: foodItem.id,
        name: foodItem.name,
        category: foodItem.category,
        imageUrl: foodItem.imageUrl,
      }
    });

  } catch (error) {
    console.error('Food item creation error:', error);
    return NextResponse.json({ error: "Failed to create food item" }, { status: 500 });
  }
}

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
    return NextResponse.json({ error: "Only restaurants can view food items" }, { status: 403 });
  }

  try {
    const foodItems = await prisma.foodItem.findMany({
      where: { restaurantId: user.id },
      orderBy: { createdAt: 'desc' },
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
      },
    });

    return NextResponse.json({ foodItems });

  } catch (error) {
    console.error('Food items fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch food items" }, { status: 500 });
  }
}