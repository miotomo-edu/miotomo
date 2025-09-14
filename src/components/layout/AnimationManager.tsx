import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import useResizeObserver from "@react-hook/resize-observer";
import MicrophoneStatus, {
  getStatusClass,
} from "../features/voice/MicrophoneStatus";
import { normalizeVolume } from "../../utils/audioUtils";
import {
  useVoiceBot,
  VoiceBotStatus,
} from "../../context/VoiceBotContextProvider";
import {
  usePipecatClient,
  usePipecatClientMicControl,
} from "@pipecat-ai/client-react";

const useSize = (target) => {
  const [size, setSize] = useState(new DOMRect());
  useLayoutEffect(() => {
    if (!target?.current) return;
    setSize(target.current.getBoundingClientRect());
  }, [target]);
  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
};

interface Props {
  agentVoiceAnalyser?: AnalyserNode;
  userVoiceAnalyser?: AnalyserNode;
}

const AnimationManager: React.FC<Props> = ({
  agentVoiceAnalyser,
  userVoiceAnalyser,
}) => {
  const canvasContainer = useRef<HTMLButtonElement>(null);
  useSize(canvasContainer);

  const { status } = useVoiceBot();
  const client = usePipecatClient();

  // Pipecat mic control hook
  const { enableMic, isMicEnabled } = usePipecatClientMicControl();

  const [agentVolume, setAgentVolume] = useState(0);
  const [userVolume, setUserVolume] = useState(0);

  // Animate agent volume
  useEffect(() => {
    if (!agentVoiceAnalyser) return;
    const dataArray = new Uint8Array(agentVoiceAnalyser.frequencyBinCount);
    const loop = () => {
      setAgentVolume(normalizeVolume(agentVoiceAnalyser, dataArray, 48));
      requestAnimationFrame(loop);
    };
    loop();
  }, [agentVoiceAnalyser]);

  // Animate user volume
  useEffect(() => {
    if (!userVoiceAnalyser) return;
    const dataArray = new Uint8Array(userVoiceAnalyser.frequencyBinCount);
    const loop = () => {
      setUserVolume(normalizeVolume(userVoiceAnalyser, dataArray, 48));
      requestAnimationFrame(loop);
    };
    loop();
  }, [userVoiceAnalyser]);

  const toggleMic = () => {
    const newState = !isMicEnabled;
    enableMic(newState);
    // Also send explicit control to bot if required
    client.sendClientMessage("control", {
      action: newState ? "resumeListening" : "pauseListening",
    });
  };

  const handleOrbClick = () => {
    toggleMic();
    // TODO: Long press for disconnect
  };

  // Force "sleeping" status visually when mic is muted
  const visualStatus = isMicEnabled ? status : VoiceBotStatus.SLEEPING;

  return (
    <div className="flex items-center justify-center">
      <button
        ref={canvasContainer}
        onClick={handleOrbClick}
        className={`orb-animation bg-white inline-flex items-center justify-center ${getStatusClass(
          visualStatus,
        )}`}
        style={{
          border: "4px solid #000",
          borderRadius: "50%",
          width: 80,
          height: 80,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          transition: "box-shadow 0.2s",
          padding: 0,
          lineHeight: 1,
        }}
        aria-label="Microphone Status"
      >
        <MicrophoneStatus overrideStatus={visualStatus} />
      </button>
      {/*{!isMicEnabled && <div className="text-xs text-gray-500 mt-1">Muted</div>}*/}
    </div>
  );
};

export default AnimationManager;
