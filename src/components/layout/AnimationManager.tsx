// buildathon/miot/src/components/layout/AnimationManager.tsx
import React, {
  useLayoutEffect,
  useState,
  useEffect,
  useRef,
  type FC,
  type RefObject,
} from "react";
import useResizeObserver from "@react-hook/resize-observer";

import { normalizeVolume } from "../../utils/audioUtils";
import MicrophoneStatus, {
  getStatusClass,
} from "../features/voice/MicrophoneStatus";
import { useVoiceBot } from "../../context/VoiceBotContextProvider";

const useSize = (target: RefObject<HTMLButtonElement> | null) => {
  const [size, setSize] = useState<DOMRect>(new DOMRect());

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
  onOrbClick: () => void;
}

const AnimationManager: FC<Props> = ({
  agentVoiceAnalyser,
  userVoiceAnalyser,
  onOrbClick,
}: Props) => {
  const canvasContainer = useRef<HTMLButtonElement>(null);
  const size = useSize(canvasContainer);
  const { status } = useVoiceBot();

  const [agentVolume, setAgentVolume] = useState(0);
  const [userVolume, setUserVolume] = useState(0);

  useEffect(() => {
    if (!agentVoiceAnalyser) return;
    const dataArrayAgent = new Uint8Array(agentVoiceAnalyser.frequencyBinCount);
    const getVolume = () => {
      setAgentVolume(normalizeVolume(agentVoiceAnalyser, dataArrayAgent, 48));
      requestAnimationFrame(getVolume);
    };
    getVolume();
  }, [agentVoiceAnalyser]);

  useEffect(() => {
    if (!userVoiceAnalyser) return;
    const dataArray = new Uint8Array(userVoiceAnalyser.frequencyBinCount);
    const getVolume = () => {
      setUserVolume(normalizeVolume(userVoiceAnalyser, dataArray, 48));
      requestAnimationFrame(getVolume);
    };
    getVolume();
  }, [userVoiceAnalyser]);

  return (
    <div className="flex items-center justify-center">
      <button
        ref={canvasContainer}
        onClick={onOrbClick}
        className={`orb-animation bg-white inline-flex items-center justify-center ${getStatusClass(status)}`}
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
        <MicrophoneStatus />
      </button>
    </div>
  );
};

export default AnimationManager;
