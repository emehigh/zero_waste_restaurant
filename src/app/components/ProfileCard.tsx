"use client";
import { useState } from "react";
import Image from "next/image";

type User = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  phoneVerified: boolean;
  credits: number;
  referralCode: string | null;
  createdAt: string;
  logoUrl: string | null;
  cropX: number | null;
  cropY: number | null;
  totalReferrals: number;
  verifiedReferrals: number;
};

type ProfileCardProps = {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => void;
};

export default function ProfileCard({ user, onUpdate }: ProfileCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSave() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();

      if (res.ok) {
        onUpdate(data.user);
        setEditing(false);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  }

  function handleCancel() {
    setName(user.name || "");
    setPhone(user.phone || "");
    setEditing(false);
    setError("");
  }

  async function copyReferralCode() {
    if (user.referralCode) {
      await navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const shareUrl = user.referralCode 
    ? `${window.location.origin}/customer-login?ref=${user.referralCode}`
    : "";

  async function shareReferralLink() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join ZeroWaste and get 25 RON bonus!',
          text: 'Sign up using my referral code and get 25 RON credit for free food!',
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to copying URL
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-6 mb-6">
        {/* Profile Image */}
        <div className="relative">
          {user.logoUrl ? (
            <div
              className="w-20 h-20 rounded-full"
              style={{
                backgroundImage: `url(${user.logoUrl})`,
                backgroundSize: "cover",
                backgroundPosition: `${user.cropX || 0}px ${user.cropY || 0}px`,
              }}
            />
          ) : (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600">
                {(user.name || user.email)[0].toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Verification Badge */}
          {user.phoneVerified && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
              <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="flex-1">
          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Your name"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Phone number"
              />
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.name || "Anonymous User"}
              </h1>
              <p className="text-gray-600 mb-1">{user.email}</p>
              {user.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">{user.phone}</span>
                  {user.phoneVerified ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                      Unverified
                    </span>
                  )}
                </div>
              )}
              
              {/* Referral Code Display */}
              {user.referralCode && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500">Referral Code:</span>
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-lg">
                    <code className="font-mono font-bold text-green-700">
                      {user.referralCode}
                    </code>
                    <button
                      onClick={copyReferralCode}
                      className={`p-1 rounded transition-colors ${
                        copied ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
                      }`}
                      title={copied ? 'Copied!' : 'Copy referral code'}
                    >
                      {copied ? (
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500 mt-2">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Edit Button */}
        <div className="flex flex-col gap-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* Referral Code Sharing Section */}
      {user.referralCode && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Share & Earn</h3>
              <p className="text-sm text-gray-600">
                Share your referral code and both you and your friend get bonuses!
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyReferralCode}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  copied 
                    ? "bg-green-600 text-white" 
                    : "bg-white text-green-600 border border-green-600 hover:bg-green-50"
                }`}
              >
                {copied ? "✓ Copied!" : "Copy Code"}
              </button>
              
              <button
                onClick={shareReferralLink}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Share Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-600">{user.credits.toFixed(2)}</div>
          <div className="text-sm text-green-700">RON Credits</div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-600">{user.totalReferrals}</div>
          <div className="text-sm text-blue-700">Total Referrals</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-purple-600">{user.verifiedReferrals}</div>
          <div className="text-sm text-purple-700">Verified Referrals</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-orange-600">
            {user.phoneVerified ? "✓" : "⚠"}
          </div>
          <div className="text-sm text-orange-700">
            {user.phoneVerified ? "Verified" : "Unverified"}
          </div>
        </div>
      </div>

      {/* Phone Verification Notice */}
      {!user.phoneVerified && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-yellow-600">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800">Phone Verification Required</h3>
              <p className="text-yellow-700 text-sm">
                Verify your phone number to unlock referral bonuses and secure your account.
              </p>
            </div>
            <button
              onClick={() => window.location.href = "/verify-phone"}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition text-sm"
            >
              Verify Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}