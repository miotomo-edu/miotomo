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
import introBackground from "../../assets/img/onboarding/tomo-flying-bg.png";

const TOMO_RUNNING_VIDEO_URL =
  "https://res.cloudinary.com/dl7wz4oiy/video/upload/v1781255594/tomo-intro-music_w5kbrj.mp4";

const VIDEO_OVERLAY_SENTENCES = [
  { time: 16, text: "Listen to a short story" },
  { time: 19, text: "Talk to the characters" },
  { time: 21, text: "Help me understand new words" },
];

const steps = [
  {
    id: 1,
    type: "intro",
    image: introBackground,
    title: "Teach Tomo about Earth",
    text: "A voice-first adventure where curious children aged 6–12 teach an alien about Earth, building critical thinking and spoken confidence.",
  },
  {
    id: 2,
    image: placeholder1,
    landscapeImage: placeholder1Landscape,
    title: "Welcome to Miotomo",
    text: "Tomo leaves Motara to discover the universe.",
  },
  {
    id: 3,
    image: placeholder2,
    landscapeImage: placeholder2Landscape,
    title: "Talk about your books",
    text: "After a long journey, Tomo crashes on Earth. ",
  },
  {
    id: 4,
    image: placeholder3,
    landscapeImage: placeholder3Landscape,
    title: "Chat about the book with Miotomo",
    text: "Tomo wants to explore planet Earth to discover how everything works.",
  },
  {
    id: 5,
    image: placeholder4,
    landscapeImage: placeholder4Landscape,
    title: "See your progress",
    text: "To teach Tomo, you listen, talk, debate and learn with experts.",
  },
  {
    id: 6,
    image: placeholder5,
    landscapeImage: placeholder5Landscape,
    title: "See your progress",
    text: "Then teach Tomo everything you learn and help Tomo grow",
  },
  {
    id: 7,
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
  const [activeVideoOverlays, setActiveVideoOverlays] = useState([]);
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
  const isIntroStep = currentStepConfig.type === "intro";
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
    if (isVideoStep || !image) {
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
    setActiveVideoOverlays([]);
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

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    const nextOverlays = VIDEO_OVERLAY_SENTENCES.filter(
      (entry) => currentTime >= entry.time,
    );

    setActiveVideoOverlays((previous) =>
      previous.length === nextOverlays.length ? previous : nextOverlays,
    );
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
    preloadLink.as = "video";
    preloadLink.href = TOMO_RUNNING_VIDEO_URL;
    preloadLink.crossOrigin = "anonymous";
    document.head.appendChild(preloadLink);

    const preloadedVideo = document.createElement("video");
    preloadedVideo.preload = "auto";
    preloadedVideo.playsInline = true;
    preloadedVideo.crossOrigin = "anonymous";
    preloadedVideo.muted = true;
    preloadedVideo.src = TOMO_RUNNING_VIDEO_URL;
    preloadedVideo.load();

    steps.forEach((step) => {
      if (step.type === "video" && step.video) {
        const video = document.createElement("video");
        video.preload = "auto";
        video.playsInline = true;
        video.crossOrigin = "anonymous";
        video.muted = true;
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
      preloadedVideo.removeAttribute("src");
      preloadedVideo.load();
      preloadLink.remove();
    };
  }, []);

  const getStepBackgroundColor = (step) => {
    if (step.type === "video") return "#FEFBFC";
    if (step.type === "intro") return "#3D2A68";
    return undefined;
  };

  const getStepBackgroundSize = (step) => {
    if (step.type === "intro") return "cover";
    return "100% auto";
  };

  const getStepBackgroundPosition = (step) => {
    if (step.type === "intro") return "60% center";
    return "top center";
  };

  const getStepBackgroundImage = (step) => {
    if (step.type === "video") return undefined;

    const stepImage = selectStepImage(step);
    if (!stepImage) return undefined;

    if (step.type === "intro") {
      return `linear-gradient(rgba(61, 42, 104, 0.38), rgba(61, 42, 104, 0.38)), url(${stepImage})`;
    }

    return `url(${stepImage})`;
  };

  const ctaLabel =
    currentStep === 0
      ? "Start the adventure"
      : currentStep === steps.length - 1
        ? "LET'S START THE ADVENTURE"
        : "Next";

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
            backgroundImage: getStepBackgroundImage(steps[prevStep]),
            backgroundColor: getStepBackgroundColor(steps[prevStep]),
            backgroundRepeat: "no-repeat",
            backgroundSize: getStepBackgroundSize(steps[prevStep]),
            backgroundPosition: getStepBackgroundPosition(steps[prevStep]),
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
          backgroundImage: getStepBackgroundImage(currentStepConfig),
          backgroundColor: getStepBackgroundColor(currentStepConfig),
          backgroundRepeat: "no-repeat",
          backgroundSize: getStepBackgroundSize(currentStepConfig),
          backgroundPosition: getStepBackgroundPosition(currentStepConfig),
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
        {isIntroStep && (
          <div className="flex h-full w-full items-center justify-center px-7 pb-40 pt-16 md:px-12">
            <div className="max-w-md text-left text-[#F0E6CF] md:max-w-2xl md:text-center">
              <h1
                className="text-5xl font-semibold leading-[0.98] tracking-[-0.04em] md:text-6xl"
                style={{ fontFamily: '"Fraunces", serif', color: "#F0E6CF" }}
              >
                {title.split(" ").map((word) => (
                  <span key={word} className="block">
                    {word}
                  </span>
                ))}
              </h1>
              <p className="mt-6 w-[70%] text-lg leading-8 text-[#F0E6CF]/88 md:mx-auto md:text-xl">
                {text}
              </p>
            </div>
          </div>
        )}
        {isVideoStep && (
          <>
            <div className="flex h-full w-full items-end justify-center pb-5 pt-18 md:pb-9 md:pt-24">
              <video
                ref={videoRef}
                className="h-full max-h-[84vh] w-full object-contain object-center"
                src={currentStepConfig.video}
                autoPlay
                playsInline
                preload="auto"
                onPlay={() => setVideoNeedsManualStart(false)}
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={() => setVideoReadyToContinue(true)}
              />
            </div>
            {activeVideoOverlays.length > 0 && !videoNeedsManualStart && (
              <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-6 pt-10 md:pt-14">
                <div className="max-w-xl rounded-[1.75rem] bg-[rgba(254,251,252,0.5)] px-5 py-4 text-left text-lg font-medium leading-snug text-black md:text-xl">
                  <ol className="space-y-3">
                    {activeVideoOverlays.map((entry, index) => (
                      <li key={entry.time} className="flex items-start gap-3">
                        <span className="min-w-[1.4rem] font-bold text-black">
                          {index + 1}.
                        </span>
                        <span>{entry.text}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
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
      {!isVideoStep && !isIntroStep && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-t from-black to-transparent"
          style={{
            top: gradientTop ? `${gradientTop}px` : "44vh",
            height: gradientHeight ? `${gradientHeight}px` : "11vh",
          }}
        />
      )}
      {!isIntroStep && !isVideoStep && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[42%] bg-gradient-to-t from-black via-black/85 to-transparent" />
      )}
      {/* Fixed bottom content */}
      <div
        key={`content-${transitionKey}`}
        className={`relative z-10 mt-auto flex w-full flex-col items-start justify-end ${
          isVideoStep ? "pb-3" : "pb-[40px]"
        } md:items-center md:text-center ${
          isIntroStep ? "text-[#F0E6CF]" : ""
        }`}
      >
        {/* <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>*/}
        {!isVideoStep && !isIntroStep && (
          <p
            className="mb-8 max-w-sm text-3xl font-bold text-white md:max-w-xl"
            style={{ fontFamily: '"Satoshi", "Nunito", sans-serif' }}
          >
            {text}
          </p>
        )}

        {(!isVideoStep || videoReadyToContinue) && (
          <button
            onClick={handleNext}
            className={`w-full max-w-md rounded-full py-4 text-lg font-medium md:mx-auto md:max-w-lg ${
              isIntroStep
                ? "bg-[#FAC304] text-[#020617]"
                : isVideoStep
                  ? "bg-[#FAC304] text-[#020617]"
                  : "mb-[40px] bg-[#FAC304] text-[#020617]"
            }`}
          >
            {ctaLabel}
          </button>
        )}

        {currentStep !== 0 && (
          <div
            className={`flex w-full justify-center ${
              isVideoStep ? "mt-2" : ""
            }`}
          >
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                aria-label={`Go to step ${idx + 1}`}
                className={`w-3 h-3 mx-1 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? isVideoStep
                      ? "bg-black w-6"
                      : "bg-white w-6"
                    : isVideoStep
                      ? "bg-black/45 hover:bg-black/65"
                      : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LandingPage;
