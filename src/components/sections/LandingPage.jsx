import React from "react";
import miotomoLanding from "../../assets/img/miotomo-landing.png";

function LandingPage({ onContinue }) {
  return (
    <div className="h-screen flex flex-col px-6 py-6 justify-between">
      {" "}
      {/* Added justify-between to push button to bottom */}
      <div className="flex flex-col flex-grow justify-center items-center">
        {" "}
        <div className="flex-grow flex justify-center items-center w-full">
          <img
            src={miotomoLanding}
            alt="Miotomo Landing"
            className="max-h-full w-full max-w-md object-contain p-6" /* Removed h-full, added max-h-full, kept object-contain */
            style={{ objectFit: "contain" }}
          />
        </div>
        <h1 className="text-4xl font-bold text-left w-full">Welcome to</h1>
        <h1 className="logo text-4xl font-bold mb-4 text-left w-full text-orange-600">
          Miotomo
        </h1>
        <p className="text-2xl font-ligth mb-4 text-left">
          Miotomo helps you build critical thinking — just by talking about
          books
        </p>
      </div>
      {/* Button always at the bottom */}
      <button
        onClick={onContinue}
        className="bg-orange-600 text-white mt-8 mb-8 font-light text-xl py-3 rounded-full w-3/4 max-w-xs mx-auto" /* Removed mt-4 here as justify-between handles spacing */
      >
        Let's chat
      </button>
    </div>
  );
}

export default LandingPage;
