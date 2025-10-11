import React, { useState } from "react";
import createAccountImage from "../../../assets/img/onboarding/tell-us-more.png";

function TellUsMore({ onFinish }) {
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
    <div className="flex flex-col justify-between items-center h-full px-8 pb-10 text-center">
      <div className="flex-grow flex flex-col items-center justify-center w-full">
        <img
          src={createAccountImage}
          alt="Create account"
          className="max-h-[220px] object-contain mb-6 mt-6"
        />
        <h1 className="text-2xl font-bold mb-6">Tell us about your child</h1>

        <div className="w-full max-w-sm text-left">
          {/* Input Fields */}
          <div className="space-y-4">
            {/* Child Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Child's Name
              </label>
              <input
                name="name"
                placeholder="First name"
                value={form.name}
                onChange={handleChange}
                className="w-full border-2 border-black rounded-xl px-4 py-3 text-lg placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* Age */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Age</label>
              <select
                name="age"
                value={form.age}
                onChange={handleChange}
                className="w-full border-2 border-black rounded-xl px-4 pr-10 py-3 text-lg text-gray-700 appearance-none focus:outline-none"
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
              <label className="block text-sm font-medium mb-1">
                Year of School
              </label>
              <select
                name="year"
                value={form.year}
                onChange={handleChange}
                className="w-full border-2 border-black rounded-xl px-4 pr-10 py-3 text-lg text-gray-700 appearance-none focus:outline-none"
              >
                <option value="">Select year</option>
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

            {/* School */}
            <div>
              <label className="block text-sm font-medium mb-1">
                School Name
              </label>
              <input
                name="school"
                placeholder="School name"
                value={form.school}
                onChange={handleChange}
                className="w-full border-2 border-black rounded-xl px-4 py-3 text-lg placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
                className="w-full border-2 border-black rounded-xl px-4 py-3 text-lg placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* Country */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Country</label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full border-2 border-black rounded-xl px-4 pr-10 py-3 text-lg text-gray-700 appearance-none focus:outline-none"
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
            className="bg-black text-white w-full py-4 rounded-full font-semibold text-lg mt-8"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}

export default TellUsMore;
