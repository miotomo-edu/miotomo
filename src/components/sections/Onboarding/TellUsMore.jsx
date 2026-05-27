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
      <button
        onClick={onBack}
        className="absolute left-6 top-6 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-parchment-150/20 bg-motara-950/70 text-parchment-150 backdrop-blur-md transition-colors duration-200 ease-in-out hover:bg-motara-800"
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
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="flex-1 px-6 pb-10 pt-6">
        <div className="mio-panel mio-surface mx-auto w-full max-w-sm text-left" data-raised="true">
          <p className="mio-eyebrow mb-2">Reader profile</p>
          <h1 className="mb-6 font-display text-3xl font-semibold leading-tight text-parchment-150">
            Tell us about your child
          </h1>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-parchment-250">
                Child's Name
              </label>
              <input
                name="name"
                placeholder="First name"
                value={form.name}
                onChange={handleChange}
                className="mio-input text-lg"
              />
            </div>
            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-parchment-250">
                Age
              </label>
              <select
                name="age"
                value={form.age}
                onChange={handleChange}
                className="mio-input appearance-none pr-10 text-lg"
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
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-parchment-250">
                Level of English
              </label>
              <select
                name="year"
                value={form.year}
                onChange={handleChange}
                className="mio-input appearance-none pr-10 text-lg"
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
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-parchment-250">
                Country
              </label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className="mio-input appearance-none pr-10 text-lg"
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
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <button
            onClick={onFinish}
            className="mio-button mt-8 w-full text-lg"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}

export default TellUsMore;
