import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user?: {
      email?: string;
      name?: string;
      image?: string;
      role?: string;
    };
  }
}