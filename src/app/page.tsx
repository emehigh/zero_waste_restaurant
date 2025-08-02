
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-green-50 flex flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8 w-full max-w-2xl">
        <Image
          src="/globe.svg"
          alt="Zero Waste Globe"
          width={80}
          height={80}
          className="mb-4"
        />
        <h1 className="text-4xl font-bold text-green-700 text-center mb-2">Zero Waste Marketplace</h1>
        <p className="text-lg text-gray-700 text-center mb-6">
          Save food, save the planet! Discover eco-friendly deals from local companies offering surplus food at reduced prices. Join us in the fight against food waste.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/company-login" className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow hover:bg-green-700 transition text-center">
            Company Login / Enroll
          </Link>
          <Link href="#browse" className="bg-white border border-green-600 text-green-700 font-semibold py-3 px-6 rounded-lg shadow hover:bg-green-50 transition text-center">
            Browse Surplus Food
          </Link>
        </div>
        <section id="how-it-works" className="mt-10 w-full">
          <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">How It Works</h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>Companies enroll and list surplus food items.</li>
            <li>People browse and buy eco-friendly deals near them.</li>
            <li>Food is picked up or delivered, reducing waste and saving money.</li>
          </ol>
        </section>
      </main>
      <footer className="mt-12 text-gray-500 text-sm text-center">
        <span>🌱 Powered by Zero Waste - Together for a greener future!</span>
      </footer>
    </div>
  );
}
