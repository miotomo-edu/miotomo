import React from "react";
import {
  useVoiceBot,
  VoiceBotStatus,
} from "../../../context/VoiceBotContextProvider";
import { Microphone } from "../../common/icons/Microphone";
import { MicrophoneMute } from "../../common/icons/MicrophoneMute";
import { MicrophoneSpeaking } from "../../common/icons/MicrophoneSpeaking";

export const getStatusClass = (status: VoiceBotStatus) => {
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

interface Props {
  overrideStatus?: VoiceBotStatus;
}

const MicrophoneStatus: React.FC<Props> = ({ overrideStatus }) => {
  const { status } = useVoiceBot();
  const finalStatus = overrideStatus ?? status;

  let Icon = Microphone;
  if (finalStatus === VoiceBotStatus.SPEAKING) {
    Icon = MicrophoneSpeaking;
  } else if (
    finalStatus === VoiceBotStatus.SLEEPING ||
    finalStatus === VoiceBotStatus.NONE
  ) {
    Icon = MicrophoneMute;
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Icon style={{ width: 48, height: 48, color: "#000" }} />
    </div>
  );
};

export default MicrophoneStatus;
