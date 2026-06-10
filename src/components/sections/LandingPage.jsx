import React, { useEffect, useRef, useState } from "react";

import placeholder1 from "../../assets/img/onboarding/step1.webp";
import placeholder2 from "../../assets/img/onboarding/step2.webp";
import placeholder3 from "../../assets/img/onboarding/step3.webp";
import placeholder4 from "../../assets/img/onboarding/step4.webp";
import placeholder5 from "../../assets/img/onboarding/step5.webp";
import placeholder1Landscape from "../../assets/img/onboarding/landscape/step1.webp";
import placeholder2Landscape from "../../assets/img/onboarding/landscape/step2.webp";
import placeholder3Landscape from "../../assets/img/onboarding/landscape/step3.webp";
import placeholder4Landscape from "../../assets/img/onboarding/landscape/step4.webp";
import placeholder5Landscape from "../../assets/img/onboarding/landscape/step5.webp";

const TOMO_RUNNING_VIDEO_URL =
  "https://res.cloudinary.com/dl7wz4oiy/video/upload/v1781107038/tomo_s8aqt4.mov";

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
    text: "To teach Tomo, you listen, talk, debate and learn with experts.",
  },
  {
    id: 5,
    image: placeholder5,
    landscapeImage: placeholder5Landscape,
    title: "See your progress",
    text: "Then teach Tomo everything you learn and help Tomo grow",
  },
  {
    id: 6,
    type: "video",
    video: TOMO_RUNNING_VIDEO_URL,
    title: "Start your adventure",
    text: "",
  },
];

function LandingPage({ onContinue }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [prevStep, setPrevStep] = useState(null);
  const [transitionPhase, setTransitionPhase] = useState("idle");
  const [transitionDirection, setTransitionDirection] = useState("left");
  const [transitionKey, setTransitionKey] = useState(0);
  const [useLandscapeImage, setUseLandscapeImage] = useState(false);
  const [videoReadyToContinue, setVideoReadyToContinue] = useState(false);
  const [videoNeedsManualStart, setVideoNeedsManualStart] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const [imageHeight, setImageHeight] = useState(null);
  const containerRef = useRef(null);
  const preloadRef = useRef(false);
  const transitionTimerRef = useRef(null);
  const videoRef = useRef(null);

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
  const currentStepConfig = steps[currentStep];
  const { title, text } = currentStepConfig;
  const isVideoStep = currentStepConfig.type === "video";
  const image = isVideoStep ? null : selectStepImage(currentStepConfig);
  const gradientRatio =
    typeof window !== "undefined" && window.innerHeight <= 700 ? 0.4 : 0.2;
  const gradientHeight = imageHeight
    ? Math.max(0, imageHeight * gradientRatio)
    : null;
  const gradientTop = imageHeight
    ? Math.max(0, imageHeight - gradientHeight)
    : null;

  useEffect(() => {
    if (isVideoStep) {
      setImageHeight(null);
      return undefined;
    }

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
  }, [image, isVideoStep]);

  useEffect(() => {
    setVideoReadyToContinue(false);
    setVideoNeedsManualStart(false);
  }, [currentStep]);

  useEffect(() => {
    if (!isVideoStep || !videoRef.current) return undefined;

    const video = videoRef.current;
    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        setVideoNeedsManualStart(true);
      });
    }

    return () => {
      video.pause();
    };
  }, [isVideoStep, transitionKey]);

  const handleManualVideoStart = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    video.muted = false;
    video.volume = 1;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
    setVideoNeedsManualStart(false);
  };

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

    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.as = "fetch";
    preloadLink.href = TOMO_RUNNING_VIDEO_URL;
    preloadLink.crossOrigin = "anonymous";
    document.head.appendChild(preloadLink);

    steps.forEach((step) => {
      if (step.type === "video" && step.video) {
        const video = document.createElement("video");
        video.preload = "auto";
        video.src = step.video;
        video.load();
        return;
      }
      const img = new Image();
      img.src = step.image;
      if (step.landscapeImage) {
        const landscape = new Image();
        landscape.src = step.landscapeImage;
      }
    });

    return () => {
      preloadLink.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex h-screen flex-col items-start justify-between bg-black px-6 text-left text-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {prevStep !== null && (
        <div
          key={`prev-${transitionKey}`}
          className="absolute inset-0"
          style={{
            backgroundImage:
              steps[prevStep].type === "video"
                ? undefined
                : `url(${selectStepImage(steps[prevStep])})`,
            backgroundColor: steps[prevStep].type === "video" ? "#FCFCFC" : undefined,
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
          backgroundImage: image ? `url(${image})` : undefined,
          backgroundColor: isVideoStep ? "#FCFCFC" : undefined,
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
      >
        {isVideoStep && (
          <>
            <video
              ref={videoRef}
              className="h-full w-full object-contain object-center"
              src={currentStepConfig.video}
              autoPlay
              playsInline
              preload="auto"
              onPlay={() => setVideoNeedsManualStart(false)}
              onEnded={() => setVideoReadyToContinue(true)}
            />
            {videoNeedsManualStart && (
              <div
                className="absolute inset-0 flex items-center justify-center px-6"
                style={{ backgroundColor: "rgba(252, 252, 252, 0.72)" }}
              >
                <button
                  type="button"
                  onClick={handleManualVideoStart}
                  className="rounded-full bg-white px-8 py-4 text-lg font-bold text-black shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
                >
                  Play with sound
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {!isVideoStep && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-t from-black to-transparent"
          style={{
            top: gradientTop ? `${gradientTop}px` : "44vh",
            height: gradientHeight ? `${gradientHeight}px` : "11vh",
          }}
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[42%] bg-gradient-to-t from-black via-black/85 to-transparent" />
      {/* Fixed bottom content */}
      <div
        key={`content-${transitionKey}`}
        className="relative z-10 mt-auto w-full flex flex-col items-start justify-end pb-[40px] md:items-center md:text-center"
      >
        {/* <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>*/}
        {!isVideoStep && (
          <p className="mb-8 max-w-sm text-4xl font-bold text-white md:max-w-xl">
            {text}
          </p>
        )}

        {(!isVideoStep || videoReadyToContinue) && (
          <button
            onClick={handleNext}
            className="w-full max-w-md rounded-full bg-white py-4 text-lg font-medium text-black mb-[40px] md:mx-auto md:max-w-lg"
          >
            {currentStep === steps.length - 1 ? "LET'S GO!!!" : "Next"}
          </button>
        )}

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
