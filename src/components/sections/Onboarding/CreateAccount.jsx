import React, { useEffect, useRef, useState } from "react";
import createAccountImage from "../../../assets/img/onboarding/create-account.png";

function CreateAccount({ onNext, onFinish }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [imageHeight, setImageHeight] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let isActive = true;
    const img = new Image();

    const updateHeight = () => {
      if (!containerRef.current || !img.naturalWidth) {
        return;
      }
      const width = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const ratio = img.naturalHeight / img.naturalWidth;
      const height = Math.min(containerHeight, width * ratio);

      if (isActive) {
        setImageHeight(height);
      }
    };

    img.onload = updateHeight;
    img.src = createAccountImage;

    if (img.complete) {
      updateHeight();
    }

    window.addEventListener("resize", updateHeight);
    return () => {
      isActive = false;
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const gradientRatio =
    typeof window !== "undefined" && window.innerHeight <= 700 ? 0.4 : 0.2;
  const gradientHeight = imageHeight
    ? Math.max(0, imageHeight * gradientRatio)
    : null;
  const gradientTop = imageHeight
    ? Math.max(0, imageHeight - gradientHeight)
    : null;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full px-6 text-left text-white"
    >
      <div
        className="absolute inset-x-0 top-0 bg-black"
        style={{
          height: imageHeight ? `${imageHeight}px` : "55vh",
          backgroundImage: `url(${createAccountImage})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% auto",
          backgroundPosition: "top center",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 bg-gradient-to-t from-black to-transparent pointer-events-none"
        style={{
          top: gradientTop ? `${gradientTop}px` : "44vh",
          height: gradientHeight ? `${gradientHeight}px` : "11vh",
        }}
      />
      {/* Bottom content */}
      <div className="relative z-10 w-full max-w-sm pt-[50vh] text-left">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ textShadow: "0 4px 12px rgba(0,0,0,0.9)" }}
        >
          Create child account
        </h1>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-light mb-1 text-white/70">
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
            <label className="block text-xs font-light mb-1 text-white/70">
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
  );
}

export default CreateAccount;
