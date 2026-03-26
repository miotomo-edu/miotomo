import React, { useState } from "react";
import createAccountImage from "../../../assets/img/onboarding/create-account.png";

function CreateAccount({ onNext, onFinish }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col bg-white text-left text-black">
      <div
        className="h-[40vh] min-h-[260px] w-full bg-white md:h-[46vh]"
        style={{
          backgroundImage: `url(${createAccountImage})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "top center",
        }}
      />

      <div className="flex-1 px-6 pb-8 pt-6 md:pb-10">
        <div className="mx-auto w-full max-w-sm text-left">
          <h1 className="mb-6 font-display text-3xl font-bold leading-tight text-black">
            Create child account
          </h1>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-black/60">
                Email
              </label>
              <input
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-black/20 bg-white px-4 py-3 text-lg text-black placeholder-gray-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-black/60">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-black/20 bg-white px-4 py-3 text-lg text-black placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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

            <button
              onClick={onNext}
              className="mt-6 w-full rounded-full bg-black py-4 text-lg font-semibold text-white"
            >
              Next
            </button>

            <p className="mt-4 text-center text-sm text-black/70">
              Already have an account?{" "}
              <button
                onClick={onFinish}
                className="font-semibold text-black underline hover:no-underline"
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
