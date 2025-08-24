"use client";
import { useState } from "react";

type ReferralStat = {
  name: string | null;
  email: string;
  createdAt: string;
  phoneVerified: boolean;
};

type User = {
  referralCode: string | null;
  referredBy: string | null;
  referralBonus: number;
  totalReferrals: number;
  verifiedReferrals: number;
};

type ReferralDetailsProps = {
  user: User;
  referralStats: ReferralStat[];
};

export default function ReferralDetails({ user, referralStats }: ReferralDetailsProps) {
  const [copied, setCopied] = useState(false);

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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Referral Program</h2>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          💰 {user.referralBonus.toFixed(2)} RON earned
        </div>
      </div>

      {/* Referral Code Section */}
      {user.referralCode && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Referral Code</h3>
            <div className="bg-white rounded-lg p-4 border-2 border-dashed border-green-300 mb-4">
              <div className="text-2xl font-bold text-green-600 tracking-wider">
                {user.referralCode}
              </div>
            </div>
            
            <div className="flex gap-3 justify-center mb-4">
              <button
                onClick={copyReferralCode}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  copied 
                    ? "bg-green-600 text-white" 
                    : "bg-white text-green-600 border border-green-600 hover:bg-green-50"
                }`}
              >
                {copied ? "✓ Copied!" : "Copy Code"}
              </button>
              
              <button
                onClick={shareReferralLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Share Link
              </button>
            </div>
            
            <p className="text-sm text-gray-600">
              Share your code with friends and both of you get bonuses when they verify their phone!
            </p>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">How Referrals Work</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-bold">1</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">Share Your Code</div>
              <div className="text-sm text-gray-600">Send your referral code to friends</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">They Sign Up</div>
              <div className="text-sm text-gray-600">Friend creates account with your code</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">Phone Verification</div>
              <div className="text-sm text-gray-600">They verify their phone number</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-bold">4</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">Both Get Bonuses!</div>
              <div className="text-sm text-gray-600">You get 15 RON, they get 25 RON</div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-600">{user.totalReferrals}</div>
          <div className="text-sm text-blue-700">Total Referrals</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-600">{user.verifiedReferrals}</div>
          <div className="text-sm text-green-700">Verified & Rewarded</div>
        </div>
      </div>

      {/* Referred Users List */}
      {referralStats.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Your Referrals</h3>
          <div className="space-y-3">
            {referralStats.map((referral, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {(referral.name || referral.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {referral.name || "Anonymous User"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {referral.email} • Joined {new Date(referral.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {referral.phoneVerified ? (
                    <div className="flex items-center gap-2">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                        ✓ Verified
                      </span>
                      <span className="text-green-600 font-medium text-sm">+15 RON</span>
                    </div>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                      ⏳ Pending verification
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referred By Section */}
      {user.referredBy && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-green-500">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            You were referred with code: <span className="font-medium text-gray-900">{user.referredBy}</span>
          </div>
        </div>
      )}
    </div>
  );
}