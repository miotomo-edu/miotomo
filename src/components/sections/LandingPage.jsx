import React, { useEffect, useRef, useState } from "react";

import placeholder1 from "../../assets/img/onboarding/step1.png";
import placeholder2 from "../../assets/img/onboarding/step2.png";
import placeholder3 from "../../assets/img/onboarding/step3.png";
import placeholder4 from "../../assets/img/onboarding/step4.png";
import placeholder5 from "../../assets/img/onboarding/step5.png";
import placeholder1Landscape from "../../assets/img/onboarding/landscape/step1.png";
import placeholder2Landscape from "../../assets/img/onboarding/landscape/step2.png";
import placeholder3Landscape from "../../assets/img/onboarding/landscape/step3.png";
import placeholder4Landscape from "../../assets/img/onboarding/landscape/step4.png";
import placeholder5Landscape from "../../assets/img/onboarding/landscape/step5.png";

const steps = [
  {
    id: 1,
    image: placeholder1,
    landscapeImage: placeholder1Landscape,
    title: "Welcome to Miotomo",
    text: "Tomo leaves Motara to discover the universe.",
  },
  {
    id: 2,
    image: placeholder2,
    landscapeImage: placeholder2Landscape,
    title: "Talk about your books",
    text: "After a long journey, Tomo crashes on Earth. ",
  },
  {
    id: 3,
    image: placeholder3,
    landscapeImage: placeholder3Landscape,
    title: "Chat about the book with Miotomo",
    text: "Tomo wants to explore planet Earth to discover how everything works.",
  },
  {
    id: 4,
    image: placeholder4,
    landscapeImage: placeholder4Landscape,
    title: "See your progress",
    text: "You listen, talk, debate and learn with experts.",
  },
  {
    id: 5,
    image: placeholder5,
    landscapeImage: placeholder5Landscape,
    title: "See your progress",
    text: "Teach Tomo everything you learn and help Tomo grow",
  },
];

function LandingPage({ onContinue }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [prevStep, setPrevStep] = useState(null);
  const [transitionPhase, setTransitionPhase] = useState("idle");
  const [transitionDirection, setTransitionDirection] = useState("left");
  const [transitionKey, setTransitionKey] = useState(0);
  const [useLandscapeImage, setUseLandscapeImage] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const [imageHeight, setImageHeight] = useState(null);
  const containerRef = useRef(null);
  const preloadRef = useRef(false);
  const transitionTimerRef = useRef(null);

  const startTransition = (nextStep) => {
    if (nextStep === currentStep) return;
    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
    }
    const direction = nextStep > currentStep ? "left" : "right";
    setPrevStep(currentStep);
    setTransitionDirection(direction);
    setTransitionPhase("start");
    setTransitionKey((value) => value + 1);
    setCurrentStep(nextStep);
    window.setTimeout(() => {
      setTransitionPhase("animate");
    }, 20);
    transitionTimerRef.current = window.setTimeout(() => {
      setPrevStep(null);
      setTransitionPhase("idle");
    }, 360);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      startTransition(currentStep + 1);
    } else {
      onContinue("onboarding");
    }
  };

  const handleDotClick = (index) => {
    startTransition(index);
  };

  const handlePrev = () => {
    if (currentStep === 0) {
      startTransition(steps.length - 1);
      return;
    }
    startTransition(Math.max(0, currentStep - 1));
  };

  const handleTouchStart = (event) => {
    if (!event.touches?.length) return;
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    if (!event.changedTouches?.length) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const threshold = 50;
    if (Math.abs(deltaX) < threshold || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }
    if (deltaX < 0) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  const selectStepImage = (step) => {
    if (useLandscapeImage && step.landscapeImage) return step.landscapeImage;
    return step.image;
  };
  const { title, text } = steps[currentStep];
  const image = selectStepImage(steps[currentStep]);
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

  useEffect(() => {
    const updateLandscape = () => {
      if (typeof window === "undefined") return;
      const isWide = window.innerWidth >= 1024;
      const isLandscape =
        window.matchMedia &&
        window.matchMedia("(orientation: landscape)").matches;
      setUseLandscapeImage(isWide && isLandscape);
    };

    updateLandscape();
    window.addEventListener("resize", updateLandscape);
    window.addEventListener("orientationchange", updateLandscape);
    return () => {
      window.removeEventListener("resize", updateLandscape);
      window.removeEventListener("orientationchange", updateLandscape);
    };
  }, []);

  useEffect(() => {
    if (preloadRef.current) return;
    preloadRef.current = true;
    steps.forEach((step) => {
      const img = new Image();
      img.src = step.image;
      if (step.landscapeImage) {
        const landscape = new Image();
        landscape.src = step.landscapeImage;
      }
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-screen flex flex-col justify-between items-start text-left px-6 bg-black text-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {prevStep !== null && (
        <div
          key={`prev-${transitionKey}`}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${selectStepImage(steps[prevStep])})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% auto",
            backgroundPosition: "top center",
            transform:
              transitionPhase === "animate"
                ? transitionDirection === "left"
                  ? "translateX(-100%)"
                  : "translateX(100%)"
                : "translateX(0)",
            transition:
              transitionPhase === "idle" ? "none" : "transform 320ms ease",
          }}
        />
      )}
      <div
        key={`current-${transitionKey}`}
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${image})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% auto",
          backgroundPosition: "top center",
          transform:
            transitionPhase === "start"
              ? transitionDirection === "left"
                ? "translateX(100%)"
                : "translateX(-100%)"
              : "translateX(0)",
          transition:
            transitionPhase === "idle" ? "none" : "transform 320ms ease",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 bg-gradient-to-t from-black to-transparent pointer-events-none"
        style={{
          top: gradientTop ? `${gradientTop}px` : "44vh",
          height: gradientHeight ? `${gradientHeight}px` : "11vh",
        }}
      />
      {/* Fixed bottom content */}
      <div
        key={`content-${transitionKey}`}
        className="relative z-10 mt-auto w-full flex flex-col items-start justify-end pb-[40px] md:items-center md:text-center"
      >
        {/* <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>*/}
        <p
          className="text-4xl font-bold text-white/80 max-w-sm mb-8 md:max-w-xl"
          style={{ textShadow: "0 4px 12px rgba(0,0,0,0.9)" }}
        >
          {text}
        </p>

        <button
          onClick={handleNext}
          className="bg-white text-black font-medium text-lg py-4 rounded-full w-full max-w-md mb-[40px] md:max-w-lg md:mx-auto"
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
