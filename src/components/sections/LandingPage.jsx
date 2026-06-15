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
import introFlyingTomo from "../../assets/img/onboarding/tomo-flying-solo.png";
import { useParentalConsent } from "../../hooks/useParentalConsent";

const TOMO_RUNNING_VIDEO_URL =
  "https://res.cloudinary.com/dl7wz4oiy/video/upload/v1781255594/tomo-intro-music_w5kbrj.mp4";

const VIDEO_OVERLAY_SENTENCES = [
  { time: 16, text: "Listen to a short story" },
  { time: 19, text: "Talk to the characters" },
  { time: 21, text: "Help me understand new words" },
];

const getCurrentDateValue = () => new Date().toISOString().split("T")[0];

const steps = [
  {
    id: 1,
    type: "intro",
    image: introBackground,
    title: "Teach Tomo about Earth",
    text: "A voice AI first adventure where curious children aged 6–12 teach an alien about Earth, building critical thinking and spoken confidence.",
  },
  {
    id: 2,
    type: "permission",
    title: "Parent permission for the Miotomo test",
  },
  {
    id: 3,
    image: placeholder1,
    landscapeImage: placeholder1Landscape,
    title: "Welcome to Miotomo",
    text: "Tomo leaves Motara to discover the universe.",
  },
  {
    id: 4,
    image: placeholder2,
    landscapeImage: placeholder2Landscape,
    title: "Talk about your books",
    text: "After a long journey, Tomo crashes on Earth. ",
  },
  {
    id: 5,
    image: placeholder3,
    landscapeImage: placeholder3Landscape,
    title: "Chat about the book with Miotomo",
    text: "Tomo wants to explore planet Earth to discover how everything works.",
  },
  {
    id: 6,
    image: placeholder4,
    landscapeImage: placeholder4Landscape,
    title: "See your progress",
    text: "To teach Tomo, you listen, talk, debate and learn with experts.",
  },
  {
    id: 7,
    image: placeholder5,
    landscapeImage: placeholder5Landscape,
    title: "See your progress",
    text: "Then teach Tomo everything you learn and help Tomo grow",
  },
  {
    id: 8,
    type: "video",
    video: TOMO_RUNNING_VIDEO_URL,
    title: "Start your adventure",
    text: "",
  },
];

function LandingPage({ onContinue, studentId = "", studentName = "" }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [prevStep, setPrevStep] = useState(null);
  const [transitionPhase, setTransitionPhase] = useState("idle");
  const [transitionDirection, setTransitionDirection] = useState("left");
  const [transitionKey, setTransitionKey] = useState(0);
  const [useLandscapeImage, setUseLandscapeImage] = useState(false);
  const [videoReadyToContinue, setVideoReadyToContinue] = useState(false);
  const [videoNeedsManualStart, setVideoNeedsManualStart] = useState(false);
  const [activeVideoOverlays, setActiveVideoOverlays] = useState([]);
  const [introFlightStarted, setIntroFlightStarted] = useState(false);
  const [permissionConsent, setPermissionConsent] = useState(false);
  const [permissionParentName, setPermissionParentName] = useState("");
  const [permissionChildName, setPermissionChildName] = useState(
    () => studentName?.trim() ?? "",
  );
  const [permissionDate, setPermissionDate] = useState(() =>
    getCurrentDateValue(),
  );
  const [permissionSaved, setPermissionSaved] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const [imageHeight, setImageHeight] = useState(null);
  const containerRef = useRef(null);
  const preloadRef = useRef(false);
  const transitionTimerRef = useRef(null);
  const videoRef = useRef(null);
  const introFlightImageRef = useRef(null);
  const {
    saveConsent,
    saving: savingConsent,
    error: consentError,
  } = useParentalConsent();

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

  const handleNext = async () => {
    if (isPermissionStep) {
      if (!permissionFormValid || savingConsent) return;

      const { error } = await saveConsent({
        studentId,
        childName: permissionChildName.trim(),
        parentName: permissionParentName.trim(),
        consentDate: permissionDate,
        consentTextVersion: "landing-permission-v1",
        processorsDisclosed: ["OpenAI", "Speechmatics"],
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      });

      if (error) return;
      setPermissionSaved(true);
    }

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
  const isPermissionStep = currentStepConfig.type === "permission";
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
    setIntroFlightStarted(false);
  }, [currentStep]);

  useEffect(() => {
    if (!studentName?.trim()) return;
    setPermissionChildName(studentName.trim());
  }, [studentName]);

  useEffect(() => {
    if (!isPermissionStep) {
      setPermissionSaved(false);
      return;
    }

    setPermissionSaved(false);
  }, [
    isPermissionStep,
    permissionConsent,
    permissionParentName,
    permissionChildName,
    permissionDate,
  ]);

  useEffect(() => {
    if (!isIntroStep) return undefined;

    const maybeStartFlight = () => {
      window.requestAnimationFrame(() => {
        setIntroFlightStarted(true);
      });
    };

    const image = introFlightImageRef.current;
    if (image?.complete) {
      maybeStartFlight();
    }

    return undefined;
  }, [isIntroStep, transitionKey]);

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
    if (step.type === "permission") return "#13102A";
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
        : isPermissionStep
          ? "Continue →"
          : "Next";

  const permissionFormValid =
    permissionConsent &&
    permissionParentName.trim().length > 0 &&
    permissionChildName.trim().length > 0 &&
    permissionDate.trim().length > 0;

  const ctaDisabled = isPermissionStep && !permissionFormValid;

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
          <div className="relative flex h-full w-full items-center justify-start overflow-hidden px-7 pb-32 pt-16 md:px-12 md:pb-36">
            <div className="pointer-events-none absolute inset-0">
              <div
                className={`absolute right-[3%] top-[10%] w-[8.75rem] sm:right-[4%] sm:top-[9%] sm:w-[10.5rem] md:right-[6%] md:top-[8%] md:w-[12rem] lg:w-[13rem] ${
                  introFlightStarted
                    ? "landing-intro-flight"
                    : "landing-intro-flight--pre"
                }`}
              >
                <img
                  ref={introFlightImageRef}
                  src={introFlyingTomo}
                  alt=""
                  className="block h-auto w-full drop-shadow-[0_18px_30px_rgba(17,7,35,0.24)]"
                  onLoad={() => setIntroFlightStarted(true)}
                />
              </div>
            </div>
            <div className="relative z-10 max-w-[15.5rem] text-left text-[#F0E6CF] sm:max-w-[18rem] md:max-w-2xl md:text-center">
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
        {isPermissionStep && (
          <div className="flex h-full w-full flex-col overflow-y-auto px-6 pb-64 pt-14">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <span
                className="h-2 w-2 rounded-full bg-[#b6c356]"
                aria-hidden="true"
              />
              MioTomo
            </div>
            <div className="mt-6 text-xs font-bold uppercase tracking-widest text-[#b6c356]">
              Before we begin
            </div>
            <h1
              className="mt-3 text-4xl font-bold leading-[1.05] text-white"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              Parent permission for the Miotomo Prototype test
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/80">
              Thank you for helping us test Miotomo. Miotomo is an early
              learning personal project prototype where children listen to a
              short story, talk about it with friendly AI characters, and then
              explain what they understood to Tomo.
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              The purpose of this test is to understand whether the experience
              is clear, enjoyable, and easy for children to follow.
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              During the activity, your child will use their voice to answer
              questions and take part in the story. To make this work, the
              Miotomo prototype uses trusted technology providers, including
              OpenAI and Speechmatics, to process your child's speech and
              generate responses during the session.
            </p>
            <div className="mt-6 rounded-2xl border border-[#b6c356]/25 bg-[#b6c356]/8 p-5">
              <div className="font-bold text-[#b6c356]">
                Your child&apos;s privacy is protected
              </div>
              <ul className="mt-3 space-y-3">
                {[
                  "We do not store your child's audio.",
                  "Their voice is never used to train AI models.",
                  "We do not sell children's data or use it for advertising.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-snug text-white/80"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#b6c356]"
                      fill="none"
                    >
                      <path
                        d="M3 8.5l3 3 7-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              Children do not need to share their full name, home address,
              school address, passwords, or private family information. Please
              remind your child to use only their first name or a nickname
              during the test.
            </p>

            <p className="mt-4 text-base leading-relaxed text-white/80">
              Miotomo is still an early prototype, so it may sometimes
              misunderstand a response or say something that does not feel quite
              right. An adult may be present or nearby during the test, and your
              child can stop at any time.
              <br />
              <br />
              Any feedback from this test will be used only to help improve the
              Miotomo prototype.
              <br />
              <br />
              By allowing your child to take part, you confirm that you
              understand this is an early voice-AI prototype and give permission
              for your child's spoken answers to be processed by the Miotomo
              prototype and its technology providers, including OpenAI and
              Speechmatics, as part of the test experience.
            </p>

            {/* Consent checkbox */}
            <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-2xl bg-white/5 p-4">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={permissionConsent}
                  onChange={(e) => setPermissionConsent(e.target.checked)}
                />
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${
                    permissionConsent
                      ? "border-[#b6c356] bg-[#b6c356]"
                      : "border-white/30 bg-transparent"
                  }`}
                >
                  {permissionConsent && (
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3.5 w-3.5"
                      fill="none"
                    >
                      <path
                        d="M3 8.5l3 3 7-7"
                        stroke="#13102A"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-white/85">
                I give permission for my child to try the Miotomo prototype and
                for their spoken answers to be processed during the test by the
                Miotomo prototype and its technology providers, including OpenAI
                and Speechmatics.
              </p>
            </label>

            {consentError ? (
              <p className="mt-4 rounded-2xl border border-[#ff8f8f]/30 bg-[#ff8f8f]/10 px-4 py-3 text-sm leading-relaxed text-[#ffd3d3]">
                We couldn&apos;t save this permission form yet. Please try
                again.
              </p>
            ) : null}

            {permissionSaved ? (
              <p className="mt-4 rounded-2xl border border-[var(--lizard-green)]/30 bg-[var(--lizard-green)]/10 px-4 py-3 text-sm font-medium leading-relaxed text-[var(--lizard-green)]">
                Permission saved for this test session.
              </p>
            ) : null}

            {/* Form fields */}
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  Parent / guardian name
                </label>
                <input
                  type="text"
                  value={permissionParentName}
                  onChange={(e) => setPermissionParentName(e.target.value)}
                  className="w-full rounded-xl bg-white/8 px-4 py-3.5 text-base text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-[#b6c356]/60"
                  placeholder=""
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  Child&apos;s first name or nickname
                </label>
                <input
                  type="text"
                  value={permissionChildName}
                  onChange={(e) => setPermissionChildName(e.target.value)}
                  className="w-full rounded-xl bg-white/8 px-4 py-3.5 text-base text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-[#b6c356]/60"
                  placeholder=""
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  Date
                </label>
                <input
                  type="date"
                  value={permissionDate}
                  onChange={(e) => setPermissionDate(e.target.value)}
                  className="w-full rounded-xl bg-white/8 px-4 py-3.5 text-base text-white outline-none focus:ring-1 focus:ring-[#b6c356]/60"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-xl font-bold text-[var(--lizard-green)]">
                Thanks Vasundhara &amp; Carlo
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
                <div className="w-full max-w-[31rem] rounded-[1.75rem] bg-[rgba(254,251,252,0.5)] px-5 py-4 text-left text-lg font-medium leading-snug text-black md:text-xl">
                  <ol className="space-y-3">
                    {VIDEO_OVERLAY_SENTENCES.map((entry, index) => {
                      const isVisible = activeVideoOverlays.some(
                        (activeEntry) => activeEntry.time === entry.time,
                      );

                      return (
                        <li
                          key={entry.time}
                          className={`flex items-start gap-3 transition-opacity duration-200 ${
                            isVisible ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <span className="min-w-[1.4rem] font-bold text-black">
                            {index + 1}.
                          </span>
                          <span>{entry.text}</span>
                        </li>
                      );
                    })}
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
      {!isVideoStep && !isIntroStep && !isPermissionStep && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-t from-black to-transparent"
          style={{
            top: gradientTop ? `${gradientTop}px` : "44vh",
            height: gradientHeight ? `${gradientHeight}px` : "11vh",
          }}
        />
      )}
      {!isIntroStep && !isVideoStep && !isPermissionStep && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[42%] bg-gradient-to-t from-black via-black/85 to-transparent" />
      )}
      {isPermissionStep && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-[#13102A] to-transparent" />
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
        {!isVideoStep && !isIntroStep && !isPermissionStep && (
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
            disabled={ctaDisabled || savingConsent}
            className={`w-full max-w-md rounded-full py-4 text-lg font-medium md:mx-auto md:max-w-lg ${
              !isIntroStep && !isVideoStep ? "mb-[40px]" : ""
            } ${ctaDisabled || savingConsent ? "cursor-not-allowed !bg-white/10 text-white/35" : "text-[#020617]"}`}
            style={
              ctaDisabled || savingConsent
                ? undefined
                : { background: "var(--lizard-green)" }
            }
          >
            {savingConsent ? "Saving..." : ctaLabel}
          </button>
        )}

        {currentStep !== 0 && !isPermissionStep && (
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
