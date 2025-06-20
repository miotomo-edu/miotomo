import React from "react";
import miotomoLanding from "../../assets/img/miotomo-landing.png";

function LandingPage({ onContinue }) {
  return (
    <div className="h-screen flex flex-col px-6 py-4 justify-between max-h-screen overflow-hidden">
      <div className="flex flex-col flex-grow justify-center items-center min-h-0">
        <div className="flex-grow flex justify-center items-center w-full min-h-0">
          <img
            src={miotomoLanding}
            alt="Miotomo Landing"
            className="max-h-full w-full max-w-md object-contain p-4"
            style={{ objectFit: "contain" }}
          />
        </div>
        <div className="flex-shrink-0">
          <h1 className="text-4xl font-bold text-left w-full">Welcome to</h1>
          <h1 className="logo text-4xl font-bold mb-4 text-left w-full text-orange-600">
            Miotomo
          </h1>
          <p className="text-2xl font-light mb-4 text-left">
            Miotomo helps you build critical thinking — just by talking about
            books
          </p>
        </div>
      </div>
      {/* Button always at the bottom with safe area padding */}
      <div className="flex-shrink-0 pb-8 safe-area-inset-bottom">
        <button
          onClick={onContinue}
          className="bg-orange-600 text-white font-light text-xl py-3 rounded-full w-3/4 max-w-xs mx-auto block mb-4"
        >
          Let's chat
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
