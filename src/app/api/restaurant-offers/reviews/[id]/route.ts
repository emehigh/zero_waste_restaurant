import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET reviews for a restaurant
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 });
  }

  try {
    // Get restaurant info
    const restaurant = await prisma.user.findUnique({
      where: { id },
      select: {
        name: true,
        logoUrl: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Get reviews for this restaurant
    const reviews = await prisma.review.findMany({
      where: { restaurantId: id },
      include: {
        customer: {
          select: {
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    // Transform reviews
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      customerName: review.customer.name || "Anonymous",
      createdAt: review.createdAt.toISOString(),
      orderItems: [], // You can add this later if you track order items in reviews
    }));

    return NextResponse.json({
      restaurant: {
        name: restaurant.name,
        logoUrl: restaurant.logoUrl,
        averageRating,
        totalReviews: reviews.length,
      },
      reviews: transformedReviews,
    });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST new review
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: restaurantId } = await params;
  const { rating, comment } = await req.json();

  if (!restaurantId || !rating || !comment) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  try {
    // Find the customer user
    const customer = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Check if restaurant exists
    const restaurant = await prisma.user.findUnique({
      where: { 
        id: restaurantId,
        role: 'RESTAURANT' 
      },
      select: {
        name: true,
        logoUrl: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Create the review
    await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment,
        restaurantId,
        customerId: customer.id,
      },
    });

    // Get updated reviews
    const reviews = await prisma.review.findMany({
      where: { restaurantId },
      include: {
        customer: {
          select: {
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate new average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    // Transform reviews
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      customerName: review.customer.name || "Anonymous",
      createdAt: review.createdAt.toISOString(),
      orderItems: [],
    }));

    return NextResponse.json({
      success: true,
      restaurant: {
        name: restaurant.name,
        logoUrl: restaurant.logoUrl,
        averageRating,
        totalReviews: reviews.length,
      },
      reviews: transformedReviews,
    });

  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}