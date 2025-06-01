import React from "react";
import {
  useVoiceBot,
  VoiceBotStatus,
} from "../../../context/VoiceBotContextProvider";
import { Microphone } from "../../common/icons/Microphone";
import { MicrophoneMute } from "../../common/icons/MicrophoneMute";
import { MicrophoneSpeaking } from "../../common/icons/MicrophoneSpeaking";

const getStatusClass = (status: VoiceBotStatus) => {
  switch (status) {
    case VoiceBotStatus.LISTENING:
      return "mic-pulse";
    case VoiceBotStatus.SPEAKING:
      return "mic-glow";
    case VoiceBotStatus.SLEEPING:
    case VoiceBotStatus.NONE:
      return "mic-fade";
    default:
      return "";
  }
};

const MicrophoneStatus: React.FC = () => {
  const { status, toggleSleep } = useVoiceBot();

  let Icon = Microphone;
  if (status === VoiceBotStatus.SPEAKING) {
    Icon = MicrophoneSpeaking;
  } else if (
    status === VoiceBotStatus.SLEEPING ||
    status === VoiceBotStatus.NONE
  ) {
    Icon = MicrophoneMute;
  }

  return (
    <button
      onClick={toggleSleep}
      className={`orb-animation bg-white flex items-center justify-center ${getStatusClass(status)}`}
      style={{
        border: "4px solid #000",
        borderRadius: "50%",
        width: 80,
        height: 80,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "box-shadow 0.2s",
      }}
      aria-label="Microphone Status"
    >
      <Icon style={{ width: 48, height: 48, color: "#000" }} />
    </button>
  );
};

export default MicrophoneStatus;
