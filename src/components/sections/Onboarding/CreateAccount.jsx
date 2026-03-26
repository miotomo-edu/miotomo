import React, { useEffect, useRef, useState } from "react";
import createAccountImage from "../../../assets/img/onboarding/create-account.png";

function CreateAccount({ onNext, onFinish }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="relative flex min-h-screen w-full flex-col bg-white px-6 text-left text-white"
      style={{
        backgroundImage: `url(${createAccountImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Bottom content */}
      <div className="relative z-10 mx-auto mt-auto w-full max-w-sm pt-[50vh] pb-8 text-left md:pt-0 md:pb-10">
        <div className="rounded-[2rem] bg-black/55 px-5 py-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-[2px]">
          <h1 className="mb-6 text-2xl font-bold text-white">
            Create child account
          </h1>

          <div className="space-y-4">
          {/* Email */}
            <div>
              <label className="mb-1 block text-xs font-light text-white/80">
                Email
              </label>
              <input
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-lg text-black placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-xs font-light text-white/80">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-lg text-black placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 12C4.5 7 7.5 5 12 5C16.5 5 19.5 7 22 12C19.5 17 16.5 19 12 19C7.5 19 4.5 17 2 12Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Next button */}
            <button
              onClick={onNext}
              className="mt-6 w-full rounded-full bg-white py-4 text-lg font-semibold text-black"
            >
              Next
            </button>

            {/* Already have account line */}
            <p className="mt-4 text-center text-sm text-white/80">
              Already have an account?{" "}
              <button
                onClick={onFinish}
                className="font-semibold text-white underline hover:no-underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAccount;
