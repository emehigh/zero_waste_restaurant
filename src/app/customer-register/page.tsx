"use client";
import { signIn } from "next-auth/react";

export default function CustomerRegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
      <div className="bg-white rounded shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-green-700 text-center">Register as Customer</h1>
        <button
          className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow hover:bg-blue-700 transition mb-4"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          Sign up with Google
        </button>
        <div className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/customer-login" className="text-green-700 underline">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}