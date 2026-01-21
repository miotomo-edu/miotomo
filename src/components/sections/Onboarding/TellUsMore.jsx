import React, { useEffect, useRef, useState } from "react";
import createAccountImage from "../../../assets/img/onboarding/tell-us-more.png";

function TellUsMore({ onBack, onFinish }) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    year: "",
    school: "",
    city: "",
    country: "",
  });
  const [imageHeight, setImageHeight] = useState(null);
  const containerRef = useRef(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

  const gradientHeight = imageHeight ? Math.max(0, imageHeight * 0.2) : null;
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
      <button
        onClick={onBack}
        className="absolute left-6 top-6 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 transition-colors duration-200 ease-in-out hover:bg-white"
        aria-label="Back"
        type="button"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.8327 10L4.16602 10.0003L9.99935 4.16699L4.16602 10.0003L9.99935 15.8337"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="relative z-10 w-full max-w-sm pt-[60vh] pb-10 text-left">
        <h1 className="text-2xl font-bold mb-6">Tell us about your child</h1>

        <div className="space-y-4">
          {/* Child Name */}
          <div>
            <label className="block text-xs font-light mb-1 text-white/70">
              Child's Name
            </label>
            <input
              name="name"
              placeholder="First name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-lg text-black placeholder-gray-400 focus:outline-none"
            />
          </div>
          {/* Age */}
          <div className="relative">
            <label className="block text-xs font-light mb-1 text-white/70">
              Age
            </label>
            <select
              name="age"
              value={form.age}
              onChange={handleChange}
              className="w-full appearance-none rounded-xl border-2 border-black bg-white px-4 py-3 pr-10 text-lg text-black focus:outline-none"
            >
              <option value="">Select age</option>
              {[6, 7, 8, 9, 10, 11, 12].map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>

            {/* outlined V arrow */}
            <svg
              className="absolute right-4 top-[46px] w-3 h-3 pointer-events-none"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {/* Year */}
          <div className="relative">
            <label className="block text-xs font-light mb-1 text-white/70">
              Level of English
            </label>
            <select
              name="year"
              value={form.year}
              onChange={handleChange}
              className="w-full appearance-none rounded-xl border-2 border-black bg-white px-4 py-3 pr-10 text-lg text-black focus:outline-none"
            >
              <option value="">Grade</option>
              {[1, 2, 3, 4, 5, 6].map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>

            <svg
              className="absolute right-4 top-[46px] w-3 h-3 pointer-events-none"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {/* Country */}
          <div className="relative">
            <label className="block text-xs font-light mb-1 text-white/70">
              Country
            </label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full appearance-none rounded-xl border-2 border-black bg-white px-4 py-3 pr-10 text-lg text-black focus:outline-none"
            >
              <option value="">Select country</option>
              <option value="Italy">Italy</option>
              <option value="UK">UK</option>
              <option value="India">India</option>
              <option value="Other">Other</option>
            </select>

            <svg
              className="absolute right-4 top-[46px] w-3 h-3 pointer-events-none"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Finish Button */}
        <button
          onClick={onFinish}
          className="mt-8 w-full rounded-full bg-white py-4 text-lg font-semibold text-black"
        >
          Finish
        </button>
      </div>
    </div>
  );
}

export default TellUsMore;
