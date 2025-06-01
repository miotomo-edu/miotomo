import React from "react";
import miotomoLanding from "../../assets/img/miotomo-landing.png";

function LandingPage({ onContinue }) {
  return (
    <div className="h-full flex flex-col px-6 py-6">
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <h1 className="text-3xl font-bold mb-4 text-left">
          Welcome to Miotomo
        </h1>
        <img
          src={miotomoLanding}
          alt="Miotomo Landing"
          className="w-full max-w-md mb-6"
          style={{ objectFit: "cover" }}
        />
        <p className="text-lg font-semibold mb-8">
          Miotomo helps you build critical thinking! Chat with your books, ask
          questions, and explore stories in a whole new way.
        </p>
      </div>
      {/* Button always at the bottom */}
      <button
        onClick={onContinue}
        className="hover:bg-pink-600 text-black font-bold py-3 rounded-full w-3/4 max-w-xs mx-auto mt-4"
        style={{
          backgroundColor: "#F78AD7",
        }}
      >
        Let's chat
      </button>
    </div>
  );
}

export default LandingPage;
