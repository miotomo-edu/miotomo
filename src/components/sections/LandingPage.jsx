import React, { useEffect, useRef, useState } from "react";

import placeholder1 from "../../assets/img/onboarding/step1.png";
import placeholder2 from "../../assets/img/onboarding/step2.png";
import placeholder3 from "../../assets/img/onboarding/step3.png";
import placeholder4 from "../../assets/img/onboarding/step4.png";
import placeholder5 from "../../assets/img/onboarding/step5.png";

const steps = [
  {
    id: 1,
    image: placeholder1,
    title: "Welcome to Miotomo",
    text: "Tomo leaves Motara to discover the universe.",
  },
  {
    id: 2,
    image: placeholder2,
    title: "Talk about your books",
    text: "After a long journey, Tomo crashes on Earth. ",
  },
  {
    id: 3,
    image: placeholder3,
    title: "Chat about the book with Miotomo",
    text: "Tomo wants to explore planet Earth to discover how everything works.",
  },
  {
    id: 4,
    image: placeholder4,
    title: "See your progress",
    text: "You listen, talk, debate and learn with experts.",
  },
  {
    id: 5,
    image: placeholder5,
    title: "See your progress",
    text: "Teach Tomo everything you learn and help Tomo grow",
  },
];

function LandingPage({ onContinue }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [imageHeight, setImageHeight] = useState(null);
  const containerRef = useRef(null);

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
  const gradientRatio =
    typeof window !== "undefined" && window.innerHeight <= 700 ? 0.4 : 0.2;
  const gradientHeight = imageHeight
    ? Math.max(0, imageHeight * gradientRatio)
    : null;
  const gradientTop = imageHeight
    ? Math.max(0, imageHeight - gradientHeight)
    : null;

  useEffect(() => {
    let isActive = true;
    const img = new Image();

    const updateHeight = () => {
      if (!containerRef.current || !img.naturalWidth) {
        return;
      }
      const width = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const ratio = img.naturalHeight / img.naturalWidth;
      const height = Math.min(containerHeight, width * ratio);

      if (isActive) {
        setImageHeight(height);
      }
    };

    img.onload = updateHeight;
    img.src = image;

    if (img.complete) {
      updateHeight();
    }

    window.addEventListener("resize", updateHeight);
    return () => {
      isActive = false;
      window.removeEventListener("resize", updateHeight);
    };
  }, [image]);

  return (
    <div
      ref={containerRef}
      className="relative h-screen flex flex-col justify-between items-start text-left px-6 bg-black text-white"
      style={{
        backgroundImage: `url(${image})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% auto",
        backgroundPosition: "top center",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 bg-gradient-to-t from-black to-transparent pointer-events-none"
        style={{
          top: gradientTop ? `${gradientTop}px` : "44vh",
          height: gradientHeight ? `${gradientHeight}px` : "11vh",
        }}
      />
      {/* Fixed bottom content */}
      <div className="relative z-10 mt-auto w-full flex flex-col items-start justify-end pb-[40px]">
        {/* <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>*/}
        <p
          className="text-2xl font-bold text-white/80 max-w-sm mb-8"
          style={{ textShadow: "0 4px 12px rgba(0,0,0,0.9)" }}
        >
          {text}
        </p>

        <button
          onClick={handleNext}
          className="bg-white text-black font-medium text-lg py-4 rounded-full w-full max-w-md mb-[40px]"
        >
          {currentStep === steps.length - 1 ? "Let's Go!" : "Next"}
        </button>

        {/* Progress dots (clickable) */}
        <div className="flex w-full justify-center">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              aria-label={`Go to step ${idx + 1}`}
              className={`w-3 h-3 mx-1 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
