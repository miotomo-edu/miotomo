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
}

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

  return (
    <div className="flex items-center justify-center gap-4">
      <CharacterContainer activeVolume={displayVolume}>
        <button
          onClick={handleOrbClick}
          className="relative inline-flex items-center justify-center"
          disabled={isCelebrating || isMicToggleDisabled}
          aria-label="Toggle microphone"
        >
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
        </button>
      </CharacterContainer>
    </div>
  );
};

export default AnimationManager;
