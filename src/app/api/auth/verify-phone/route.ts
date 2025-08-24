import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";
import twilio from 'twilio';

const prisma = new PrismaClient();

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

type UpdateData = {
  phone: string;
  phoneVerificationCode: string;
  phoneVerificationExpiry: Date;
  referredBy?: string;
};

// Send verification code
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { phone, referralCode } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number format. Please include country code (e.g., +40...)" }, { status: 400 });
    }

    // Check if phone is already verified by another user
    const existingPhone = await prisma.user.findFirst({
      where: { 
        phone,
        phoneVerified: true,
        email: { not: session.user.email } // Not the current user
      }
    });

    if (existingPhone) {
      return NextResponse.json({ error: "This phone number is already verified by another account" }, { status: 400 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with verification code and referral info
    const updateData: UpdateData = {
      phone,
      phoneVerificationCode: code,
      phoneVerificationExpiry: expiry,
    };

    // Validate referral code if provided
    if (referralCode) {
      const referrer = await prisma.user.findFirst({
        where: { referralCode }
      });

      if (!referrer) {
        return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
      }

      updateData.referredBy = referralCode;
    }

    // Update user in database first
    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    // Try to send SMS
    try {
      await sendSMS(phone, `Your ZeroWaste verification code is: ${code}. Valid for 10 minutes.`);
      
      return NextResponse.json({ 
        success: true, 
        message: "Verification code sent to your phone" 
      });

    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      
      // In development, return the code so you can test
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ 
          success: true, 
          message: "SMS service unavailable. Your verification code is:",
          devCode: code // Only in development
        });
      }
      
      return NextResponse.json({ error: "Failed to send SMS. Please try again." }, { status: 500 });
    }

  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
  }
}

// Verify phone with code
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Verification code required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check code validity
    if (!user.phoneVerificationCode || 
        user.phoneVerificationCode !== code ||
        !user.phoneVerificationExpiry ||
        user.phoneVerificationExpiry < new Date()) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    // Calculate referral bonus
    let bonusAmount = 0;
    let referralMessage = "";

    if (user.referredBy && !user.hasUsedReferral) {
      bonusAmount = 25.00; // 25 RON bonus
      referralMessage = `Welcome! You received ${bonusAmount} RON bonus from referral!`;

      // Give bonus to referrer as well
      await prisma.user.updateMany({
        where: { referralCode: user.referredBy },
        data: {
          credits: { increment: 15.00 }, // 15 RON for referrer
          referralBonus: { increment: 15.00 }
        }
      });
    }

    // Generate user's own referral code if they don't have one
    const userReferralCode = user.referralCode || generateReferralCode(user.email);

    // Update user as verified and apply bonuses
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        phoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationExpiry: null,
        credits: { increment: bonusAmount },
        referralBonus: bonusAmount > 0 ? bonusAmount : user.referralBonus,
        hasUsedReferral: true,
        referralCode: userReferralCode,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Phone verified successfully!",
      bonusMessage: referralMessage,
      bonusAmount,
      referralCode: userReferralCode
    });

  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json({ error: "Failed to verify phone" }, { status: 500 });
  }
}

// Helper functions
async function sendSMS(phone: string, message: string) {
  try {
    // For development - log the message and skip actual SMS
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_SMS === 'true') {
      console.log(`📱 [DEV] SMS to ${phone}: ${message}`);
      return { success: true, dev: true };
    }

    // Ensure Twilio credentials are available
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured');
    }

    // Send SMS via Twilio
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone
    });

    console.log(`✅ SMS sent successfully. SID: ${result.sid}`);
    return { success: true, sid: result.sid };

  } catch (error) {
    console.error('❌ SMS sending error:', error);
    throw error;
  }
}

function generateReferralCode(email: string): string {
  return email.substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
}