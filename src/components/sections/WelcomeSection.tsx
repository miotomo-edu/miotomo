import React from "react";

const AVATAR_SIZE = 64; // px

const WelcomeSection: React.FC = () => (
  <section className="py-6 px-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <img
          src="https://api.dicebear.com/7.x/micah/svg?seed=leo"
          alt="Avatar"
          className="rounded-full object-cover"
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
        />
        <div className="ml-4 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-1">Hi, Roi!</h1>
          <span className="text-base">Level 8 Reader</span>
        </div>
      </div>
      <button
        className="px-6 font-semibold border rounded-full py-2 border-none"
        style={{
          backgroundColor: "#F78AD7",
        }}
      >
        🔥 7 days
      </button>
    </div>
    {/* <p className="text-gray-600 mt-2">Welcome back to your reading dashboard.</p> */}
  </section>
);

export default WelcomeSection;
