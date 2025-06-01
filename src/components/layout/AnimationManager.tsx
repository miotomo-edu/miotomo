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
import MicrophoneStatus from "../features/voice/MicrophoneStatus";

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
        onClick={() => {
          onOrbClick();
        }}
        className="orb-animation"
      >
        <MicrophoneStatus />
      </button>
    </div>
  );
};

export default AnimationManager;
