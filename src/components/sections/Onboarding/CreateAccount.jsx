import React, { useState } from "react";
import createAccountImage from "../../../assets/img/onboarding/create-account.png";

function CreateAccount({ onNext, onFinish }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent text-left text-parchment-150">
      <div
        className="h-[40vh] min-h-[260px] w-full bg-transparent md:h-[46vh]"
        style={{
          backgroundImage: `url(${createAccountImage})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "top center",
        }}
      />

      <div className="flex-1 px-6 pb-8 pt-6 md:pb-10">
        <div className="mio-panel mio-surface mx-auto w-full max-w-sm text-left" data-raised="true">
          <p className="mio-eyebrow mb-2">Parent setup</p>
          <h1 className="mb-6 font-display text-3xl font-semibold leading-tight text-parchment-150">
            Create child account
          </h1>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-parchment-250">
                Email
              </label>
              <input
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mio-input text-lg"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-parchment-250">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mio-input pr-12 text-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-parchment-450 transition hover:text-parchment-150"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
              className="mio-button mt-6 w-full text-lg"
            >
              Next
            </button>

            <p className="mt-4 text-center text-sm text-parchment-250">
              Already have an account?{" "}
              <button
                onClick={onFinish}
                className="cursor-pointer font-semibold text-ochre-400 underline hover:no-underline"
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
