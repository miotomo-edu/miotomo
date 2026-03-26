import React, { useState } from "react";
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
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
      <button
        onClick={onBack}
        className="absolute left-6 top-6 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 transition-colors duration-200 ease-in-out hover:bg-white"
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
      <div className="flex-1 px-6 pb-10 pt-6">
        <div className="mx-auto w-full max-w-sm text-left">
          <h1 className="mb-6 font-display text-3xl font-bold leading-tight text-black">
            Tell us about your child
          </h1>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-black/60">
                Child's Name
              </label>
              <input
                name="name"
                placeholder="First name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-black/20 bg-white px-4 py-3 text-lg text-black placeholder-gray-400 focus:outline-none"
              />
            </div>
            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-black/60">
                Age
              </label>
              <select
                name="age"
                value={form.age}
                onChange={handleChange}
                className="w-full appearance-none rounded-xl border-2 border-black/20 bg-white px-4 py-3 pr-10 text-lg text-black focus:outline-none"
              >
                <option value="">Select age</option>
                {[6, 7, 8, 9, 10, 11, 12].map((age) => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-4 top-[46px] h-3 w-3"
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
            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-black/60">
                Level of English
              </label>
              <select
                name="year"
                value={form.year}
                onChange={handleChange}
                className="w-full appearance-none rounded-xl border-2 border-black/20 bg-white px-4 py-3 pr-10 text-lg text-black focus:outline-none"
              >
                <option value="">Grade</option>
                {[1, 2, 3, 4, 5, 6].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>

              <svg
                className="absolute right-4 top-[46px] h-3 w-3 pointer-events-none"
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
            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-black/60">
                Country
              </label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full appearance-none rounded-xl border-2 border-black/20 bg-white px-4 py-3 pr-10 text-lg text-black focus:outline-none"
              >
                <option value="">Select country</option>
                <option value="Italy">Italy</option>
                <option value="UK">UK</option>
                <option value="India">India</option>
                <option value="Other">Other</option>
              </select>

              <svg
                className="absolute right-4 top-[46px] h-3 w-3 pointer-events-none"
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

          <button
            onClick={onFinish}
            className="mt-8 w-full rounded-full bg-black py-4 text-lg font-semibold text-white"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}

export default TellUsMore;
