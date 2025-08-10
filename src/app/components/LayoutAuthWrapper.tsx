"use client";
import { useSession } from "next-auth/react";

export function LayoutAuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  if (status !== "authenticated" || !session?.user) return null;
  return <>{children}</>;
}