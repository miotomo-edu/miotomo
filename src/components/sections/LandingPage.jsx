import React from "react";
import miotomoLanding from "../../assets/img/miotomo-landing.png";

function LandingPage({ onContinue }) {
  return (
    <div className="flex flex-col items-left px-6 py-6">
      {/* Welcome sentence */}
      <h1 className="text-3xl font-bold mb-4 text-left">Welcome to Miotomo</h1>

      {/* Big image */}
      <img
        src={miotomoLanding}
        alt="Miotomo Landing"
        className="w-full max-w-md mb-6"
        style={{ objectFit: "cover" }}
      />

      <h1 className="text-2xl font-bold mb-8 text-left">
        🎓 Top of the class, here you come!
      </h1>
      <p className="text-lg font-semibold mb-8">
        Miotomo helps you build critical thinking! Chat with your books, ask
        questions, and explore stories in a whole new way.
      </p>

      <button
        onClick={onContinue}
        className="hover:bg-pink-600 text-black font-bold py-3 rounded-full"
        style={{
          width: "50%",
          margin: "0 auto",
          display: "block",
          backgroundColor: "#F78AD7",
        }}
      >
        Let's chat
      </button>
    </div>
  );
}

export default LandingPage;
