"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProfileCard from "../components/ProfileCard";
import OrderHistory from "../components/OrderHistory";
import ReferralDetails from "../components/ReferralDetails";

type User = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  phoneVerified: boolean;
  credits: number;
  referralCode: string | null;
  referredBy: string | null;
  referralBonus: number;
  hasUsedReferral: boolean;
  createdAt: string;
  logoUrl: string | null;
  cropX: number | null;
  cropY: number | null;
  totalReferrals: number;
  verifiedReferrals: number;
};

type ReferralStat = {
  name: string | null;
  email: string;
  createdAt: string;
  phoneVerified: boolean;
};

type Order = {
  id: string;
  restaurantName: string;
  items: string[];
  total: number;
  status: "completed" | "cancelled" | "pending";
  date: string;
  pickupTime: string;
};

type ProfileData = {
  user: User;
  referralStats: ReferralStat[];
  orderHistory: Order[];
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/customer-login");
      return;
    }

    if (status === "authenticated") {
      fetchProfileData();
    }
  }, [status, router]);

  async function fetchProfileData() {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();

      if (res.ok) {
        setProfileData(data);
      } else {
        setError(data.error || "Failed to load profile");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleUserUpdate(updatedFields: Partial<User>) {
    if (profileData) {
      setProfileData({
        ...profileData,
        user: {
          ...profileData.user,
          ...updatedFields,
        }
      });
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchProfileData}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No profile data found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
            
            <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
            
            <button
              onClick={() => router.push("/offers")}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Browse Offers
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Card */}
        <ProfileCard 
          user={profileData.user} 
          onUpdate={handleUserUpdate}
        />

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Referral Details */}
          <ReferralDetails 
            user={profileData.user}
            referralStats={profileData.referralStats}
          />

          {/* Order History */}
          <OrderHistory orders={profileData.orderHistory} />
        </div>

        {/* Additional Stats or Features */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push("/verify-phone")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-green-600">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Verify Phone</div>
                <div className="text-sm text-gray-600">Unlock referral bonuses</div>
              </div>
            </button>

            <button
              onClick={() => router.push("/offers")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-blue-600">
                  <path d="M19 7h-3V6a4 4 0 00-8 0v1H5a1 1 0 00-1 1v11a3 3 0 003 3h10a3 3 0 003-3V8a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Browse Offers</div>
                <div className="text-sm text-gray-600">Find fresh food deals</div>
              </div>
            </button>

            <button
              onClick={() => window.location.href = `mailto:?subject=Join ZeroWaste&body=Use my referral code ${profileData.user.referralCode} to get 25 RON bonus!`}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-purple-600">
                  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Share & Earn</div>
                <div className="text-sm text-gray-600">Invite friends via email</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}