import React, { useState } from "react";

import placeholder1 from "../../assets/img/onboarding/step1.png";
import placeholder2 from "../../assets/img/onboarding/step2.png";
import placeholder3 from "../../assets/img/onboarding/step3.png";
import placeholder4 from "../../assets/img/onboarding/step4.png";

const steps = [
  {
    id: 1,
    image: placeholder1,
    title: "Welcome to Miotomo",
    text: "A voice world where stories talk back to you!",
  },
  {
    id: 2,
    image: placeholder2,
    title: "Talk about your books",
    text: "Chat with Tomo and friends after every chapter.",
  },
  {
    id: 3,
    image: placeholder3,
    title: "Chat about the book with Miotomo",
    text: "Chat for 15 minutes a day, to spark young minds to think and debate with heart.",
  },
  {
    id: 4,
    image: placeholder4,
    title: "See your progress",
    text: "Parents and children can track strengths, vocabulary gains, and growth over days, weeks, and months.",
  },
];

function LandingPage({ onContinue }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onContinue("onboarding");
    }
  };

  const handleDotClick = (index) => {
    setCurrentStep(index);
  };

  const { image, title, text } = steps[currentStep];

  return (
    <div className="h-screen flex flex-col justify-between items-center text-center px-6 bg-[#F2D47C]">
      {/* Top image area */}
      <div className="flex-grow flex justify-center items-center">
        <img
          src={image}
          alt={title}
          className="max-h-[55vh] w-full max-w-md object-contain"
        />
      </div>

      {/* Fixed bottom content */}
      <div className="w-full flex flex-col items-center justify-end pb-[40px]">
        <h1 className="text-3xl font-bold text-black mb-2">{title}</h1>
        <p className="text-xl font-light text-gray-700 max-w-sm mb-8">{text}</p>

        <button
          onClick={handleNext}
          className="bg-black text-white font-medium text-lg py-4 rounded-2xl w-full max-w-md mb-[40px]"
        >
          {currentStep === steps.length - 1 ? "Let's Go!" : "Next"}
        </button>

        {/* Progress dots (clickable) */}
        <div className="flex justify-center">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              aria-label={`Go to step ${idx + 1}`}
              className={`w-3 h-3 mx-1 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? "bg-black w-6"
                  : "bg-white hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
