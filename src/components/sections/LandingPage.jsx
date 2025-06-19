import React from "react";
import miotomoLanding from "../../assets/img/miotomo-landing.png";

function LandingPage({ onContinue }) {
  return (
    <div className="h-screen flex flex-col px-6 py-6 justify-between">
      {" "}
      {/* Added justify-between to push button to bottom */}
      <div className="flex flex-col flex-grow justify-center items-center">
        {" "}
        {/* flex-grow to take remaining space, justify-center for vertical distribution of content */}
        <h1 className="logo text-3xl font-bold mb-4 text-center">Miotomo</h1>
        {/* New div to manage image height and allow it to shrink */}
        <div className="flex-grow flex justify-center items-center w-full">
          <img
            src={miotomoLanding}
            alt="Miotomo Landing"
            className="max-h-full w-full max-w-md object-contain p-6" /* Removed h-full, added max-h-full, kept object-contain */
            style={{ objectFit: "contain" }}
          />
        </div>
        <p className="text-lg font-semibold mt-4 mb-4 text-center">
          {" "}
          {/* Adjusted margins and added text-center */}
          Miotomo helps you build critical thinking! Chat with your books, ask
          questions, and explore stories in a whole new way.
        </p>
      </div>
      {/* Button always at the bottom */}
      <button
        onClick={onContinue}
        className="hover:bg-pink-600 text-black font-bold py-3 rounded-full w-3/4 max-w-xs mx-auto" /* Removed mt-4 here as justify-between handles spacing */
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
