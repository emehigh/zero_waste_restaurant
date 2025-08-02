"use client";
import React, { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const CompanyLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setApiError("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false);
    if (res?.error) {
      setApiError("Invalid email or password.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <Image src="/globe.svg" alt="Zero Waste Logo" width={64} height={64} className="mb-4" />
        <h1 className="text-2xl font-bold text-green-700 mb-2">Company Login</h1>
        <p className="text-gray-600 mb-6 text-center">
          Log in to list your surplus food and help reduce waste.
        </p>
        <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Company Email"
            className="border rounded px-3 py-2 text-gray-900"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border rounded px-3 py-2 text-gray-900"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {apiError && <div className="text-red-600 text-sm">{apiError}</div>}
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanyLoginPage;