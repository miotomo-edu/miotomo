import React, { useState } from "react";
import createAccountImage from "../../../assets/img/onboarding/create-account.png";

function CreateAccount({ onNext, onFinish }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col items-center h-full px-8 pb-0 text-center">
      {/* Header and image */}
      <div className="flex flex-col items-center w-full max-w-sm mt-8">
        <img
          src={createAccountImage}
          alt="Create account"
          className="max-h-[160px] object-contain mb-6"
        />
        <h1 className="text-2xl font-bold mb-6">Create your account</h1>
      </div>

      {/* Form section */}
      <div className="w-full max-w-sm text-left space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="parent@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-black rounded-xl px-4 py-3 text-lg placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-black rounded-xl px-4 py-3 text-lg placeholder-gray-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              👁️
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-1">Parents help set this up.</p>

        {/* Next button */}
        <button
          onClick={onNext}
          className="bg-black text-white w-full py-4 rounded-full font-semibold text-lg mt-6"
        >
          Next
        </button>

        {/* Already have account line */}
        <p className="text-sm text-gray-600 mt-4 text-center">
          Already have an account?{" "}
          <button
            onClick={onFinish}
            className="text-black font-semibold underline hover:no-underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default CreateAccount;
