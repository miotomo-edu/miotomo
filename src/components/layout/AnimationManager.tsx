import React, { useEffect, useMemo, useState } from "react";
import useAnalyserVolume from "../../hooks/useAnalyserVolume";
import CharacterAvatar from "../features/voice/CharacterAvatar";
import CharacterContainer from "../features/voice/CharacterContainer";

interface Props {
  agentVoiceAnalyser?: AnalyserNode;
  userVoiceAnalyser?: AnalyserNode;
  isUserSpeaking?: boolean;
  isBotSpeaking?: boolean;
  isMicEnabled?: boolean;
  characterImages?: {
    idle: string;
    sleeping?: string;
    listening?: string;
  };
  characterName?: string;
  onMicToggle?: (enabled: boolean) => void;
  isCelebrating?: boolean;
  forceAwake?: boolean;
  isMicToggleDisabled?: boolean;
  useMicOrb?: boolean;
}

interface MicOrbProps {
  isPaused: boolean;
  isListening: boolean;
  isTalking: boolean;
}

const MicOrb: React.FC<MicOrbProps> = ({
  isPaused,
  isListening,
  isTalking,
}) => {
  const ringClass = isTalking
    ? "absolute inset-0 rounded-full border border-white/70 animate-pulse"
    : "absolute inset-0 rounded-full border border-transparent";
  const orbClass = isPaused
    ? "bg-white/10 border-white/30 text-white/50"
    : isListening
      ? "bg-white/20 border-white text-white"
      : "bg-white/15 border-white/60 text-white/80";

  return (
    <div className="relative flex items-center justify-center">
      <span className={ringClass} />
      <span
        className={`relative flex h-20 w-20 items-center justify-center rounded-full border-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:h-24 sm:w-24 ${orbClass}`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-8 w-8 sm:h-9 sm:w-9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4C10.343 4 9 5.343 9 7V12C9 13.657 10.343 15 12 15C13.657 15 15 13.657 15 12V7C15 5.343 13.657 4 12 4Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M6 11V12C6 15.314 8.686 18 12 18C15.314 18 18 15.314 18 12V11"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M12 18V21"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M9 21H15"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {isPaused && (
            <path
              d="M6 6L18 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          )}
        </svg>
      </span>
    </div>
  );
};

const AnimationManager: React.FC<Props> = ({
  agentVoiceAnalyser,
  userVoiceAnalyser,
  isUserSpeaking = false,
  isBotSpeaking = false,
  isMicEnabled = false,
  characterImages,
  characterName,
  onMicToggle,
  isCelebrating = false,
  forceAwake = false,
  isMicToggleDisabled = false,
  useMicOrb = false,
}) => {
  const [hasBeenAwake, setHasBeenAwake] = useState(false);
  const [isUserSpeakingTransient, setIsUserSpeakingTransient] = useState(false);

  const agentVolume = useAnalyserVolume(agentVoiceAnalyser);
  const userVolume = useAnalyserVolume(userVoiceAnalyser);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("🎤 Mic state changed:", isMicEnabled);
    }
  }, [isMicEnabled]);

  const toggleMic = () => {
    if (isCelebrating || isMicToggleDisabled) {
      return;
    }
    if (process.env.NODE_ENV !== "production") {
      console.log("🎤 Mic toggleMic");
    }

    onMicToggle?.(!isMicEnabled);
  };

  const handleOrbClick = () => {
    toggleMic();
    // TODO: Long press for disconnect
  };

  const activeVolume = useMemo(() => {
    const loudest = Math.max(agentVolume, userVolume, 0);
    return Math.min(Math.max(loudest, 0), 1);
  }, [agentVolume, userVolume]);

  useEffect(() => {
    if (!isMicEnabled) {
      setIsUserSpeakingTransient(false);
      return;
    }
    const USER_THRESHOLD = 0.25;
    if (userVolume > USER_THRESHOLD) {
      setIsUserSpeakingTransient(true);
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsUserSpeakingTransient(false);
    }, 140);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [userVolume, isMicEnabled]);

  useEffect(() => {
    if (isMicEnabled) {
      setHasBeenAwake(true);
    }
  }, [isMicEnabled]);

  const isSleepingDisplay =
    !forceAwake && !isMicEnabled && hasBeenAwake && !isCelebrating;

  const displayVolume = isSleepingDisplay ? 0 : activeVolume;

  const isListeningDisplay = Boolean(
    isMicEnabled &&
      (isUserSpeaking || (isUserSpeakingTransient && !isBotSpeaking)),
  );
  const isPausedDisplay = isSleepingDisplay;
  const isListeningState = Boolean(isMicEnabled && !isBotSpeaking);
  const isTalkingState = Boolean(isMicEnabled && isBotSpeaking);

  return (
    <div className="flex items-center justify-center gap-4">
      <CharacterContainer activeVolume={displayVolume}>
        <button
          onClick={handleOrbClick}
          className="relative inline-flex items-center justify-center"
          disabled={isCelebrating || isMicToggleDisabled}
          aria-label="Toggle microphone"
        >
          {useMicOrb ? (
            <MicOrb
              isPaused={isPausedDisplay}
              isListening={isListeningState}
              isTalking={isTalkingState}
            />
          ) : (
            <CharacterAvatar
              analyser={isMicEnabled ? (userVoiceAnalyser ?? null) : null}
              isCelebrating={isCelebrating}
              isSleeping={isSleepingDisplay}
              isListening={isListeningDisplay}
              images={
                characterImages ?? {
                  idle: "",
                }
              }
              characterName={characterName}
            />
          )}
        </button>
      </CharacterContainer>
    </div>
  );
};

export default AnimationManager;
