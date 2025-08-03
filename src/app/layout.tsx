import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientSessionProvider from "./sessionProvider";
import Sidebar from "./components/Sidebar";
import "./globals.css";
import CartButtonWrapper from "./components/CartButtonWrapper"; // Move CartButtonWrapper to its own file

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zero Waste",
  description: "A platform to reduce food waste by connecting companies with surplus food to consumers looking for cheap eco-friendly deals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientSessionProvider>
          <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-green-50 via-green-100 to-green-200">
            <Sidebar />
            <main className="flex-1 flex flex-col relative">
              {children}
              <CartButtonWrapper />
            </main>
          </div>
        </ClientSessionProvider>
      </body>
    </html>
  );
}