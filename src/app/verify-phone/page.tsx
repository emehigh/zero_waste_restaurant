"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function VerifyPhonePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/customer-login");
    }
  }, [status, router]);

  // Countdown timer for resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  async function handleSendCode() {
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, referralCode: referralCode.trim() || null }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Verification code sent!");
        setStep("verify");
        setCountdown(60); // 1 minute before resend
      } else {
        setError(data.error || "Failed to send verification code");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  }

  async function handleVerifyCode() {
    if (!verificationCode.trim()) {
      setError("Verification code is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-phone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        
        // Show bonus message if applicable
        if (data.bonusMessage) {
          alert(data.bonusMessage);
        }

        // Redirect to offers page after success
        setTimeout(() => {
          router.push("/offers");
        }, 2000);
      } else {
        setError(data.error || "Failed to verify code");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-green-600">
              <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify Your Phone</h1>
          <p className="text-gray-600 mt-2">
            {step === "phone" 
              ? "We'll send you a verification code to confirm your phone number"
              : `Enter the 6-digit code sent to ${phone}`
            }
          </p>
        </div>

        {step === "phone" ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="+40 123 456 789"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter referral code to get bonus"
              />
              <p className="text-sm text-green-600 mt-1">
                💰 Get 25 RON bonus with a valid referral code!
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm">
                {success}
              </div>
            )}

            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm">
                {success}
              </div>
            )}

            <button
              onClick={handleVerifyCode}
              disabled={loading}
              className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <div className="text-center">
              <button
                onClick={() => countdown === 0 ? handleSendCode() : null}
                disabled={countdown > 0}
                className={`text-sm ${countdown > 0 ? 'text-gray-400' : 'text-green-600 hover:underline'}`}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
              </button>
            </div>

            <button
              onClick={() => setStep("phone")}
              className="w-full text-gray-600 hover:text-gray-800"
            >
              ← Change Phone Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}