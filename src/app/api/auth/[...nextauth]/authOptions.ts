import { SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();
type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  referralCode?: string | null;
  phoneVerified?: boolean;
};


function generateReferralCode(email: string): string {
  const prefix = email.substring(0, 3).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${random}`;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        if (!user.password) return null;
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;
        return { id: user.id, email: user.email };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  pages: {
    signIn: "/company-login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        // If user is signing in with Google, ensure they exist in DB with CUSTOMER role
        if (account?.provider === "google") {
          const existing = await prisma.user.findUnique({ 
            where: { email: user.email },
            select: { id: true, role: true, referralCode: true }
          });
          
          if (!existing) {
            // Generate unique referral code for new user
            let referralCode = generateReferralCode(user.email);
            
            // Ensure referral code is unique
            let codeExists = await prisma.user.findFirst({
              where: { referralCode }
            });
            
            while (codeExists) {
              referralCode = generateReferralCode(user.email);
              codeExists = await prisma.user.findFirst({
                where: { referralCode }
              });
            }

            // Create new user with referral code
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || null,
                password: "", // No password for Google users
                role: "CUSTOMER",
                referralCode: referralCode,
                logoUrl: user.image || null,
              },
            });

            console.log(`New Google user created with referral code: ${referralCode}`);
          } else if (!existing.referralCode) {
            // Add referral code to existing user who doesn't have one
            let referralCode = generateReferralCode(user.email);
            
            let codeExists = await prisma.user.findFirst({
              where: { referralCode }
            });
            
            while (codeExists) {
              referralCode = generateReferralCode(user.email);
              codeExists = await prisma.user.findFirst({
                where: { referralCode }
              });
            }

            await prisma.user.update({
              where: { email: user.email },
              data: { referralCode },
            });

            console.log(`Referral code added to existing Google user: ${referralCode}`);
          }
        }

        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session }) {
      if (session?.user?.email) {
        const dbUser = await prisma.user.findUnique({ 
          where: { email: session.user.email },
          select: { role: true, referralCode: true, phoneVerified: true }
        });
        
        if (dbUser && session.user) {
          (session.user as SessionUser).role = dbUser.role;
          (session.user as SessionUser).referralCode = dbUser.referralCode;
          (session.user as SessionUser).phoneVerified = dbUser.phoneVerified;
        }
      }
      return session;
    }
  },
};