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

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const lat = formData.get("lat") as string;
  const lng = formData.get("lng") as string;
  const cropY = formData.get("cropY") as string;
  const cropX = formData.get("cropX") as string;
  const image = formData.get("image") as File | null;

  // Find the user
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let logoUrl = user.logoUrl;
  if (image && image.size > 0) {
    try {
      // Upload to Cloudinary
      const buffer = Buffer.from(await image.arrayBuffer());
      const base64 = buffer.toString('base64');
      const dataURI = `data:${image.type};base64,${base64}`;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'restaurant-logos',
        public_id: `restaurant-${user.id}`,
        overwrite: true,
        transformation: [
          { width: 1000, height: 1000, crop: 'fill', quality: 'auto' }
        ]
      });
      
      logoUrl = result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }
  }

  // Update user with new info and crop coordinates
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      logoUrl,
      cropY: cropY ? parseInt(cropY, 10) : 0,
      cropX: cropX ? parseInt(cropX, 10) : 0,
    },
  });

  return NextResponse.json({ success: true, logoUrl, cropY, cropX });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      lat: true,
      lng: true,
      logoUrl: true,
      cropY: true,
      cropX: true,
      email: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}