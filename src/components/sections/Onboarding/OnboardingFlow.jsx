import React, { useState } from "react";
import CreateAccount from "./CreateAccount";
import TellUsMore from "./TellUsMore";

function OnboardingFlow({ onFinish }) {
  const [step, setStep] = useState(0);

  const handleNext = () => setStep(1);
  const handleBack = () => setStep(0);
  const handleFinish = () => onFinish();
  const handleDotClick = (index) => setStep(index);

  return (
    <div className="h-screen w-full flex flex-col justify-between bg-black text-white">
      {/* Dynamic section content */}
      <div className="flex-1 min-h-0 flex overflow-y-auto">
        {step === 0 ? (
          <CreateAccount onNext={handleNext} onFinish={handleFinish} />
        ) : (
          <TellUsMore onBack={handleBack} onFinish={handleFinish} />
        )}
      </div>

      {/* Stepper dots below the content */}
      {/* <div className="flex justify-center mt-6 mb-8">
        {[0, 1].map((idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            aria-label={`Go to step ${idx + 1}`}
            className={`w-3 h-3 mx-1 rounded-full transition-all duration-300 ${
              step === idx
                ? "bg-white w-6"
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>*/}
    </div>
  );
}

export default OnboardingFlow;
