import React, { useMemo } from "react";
import OctopusCharacterImage from "../../../assets/img/octopus.svg";
import OctopusSleepImage from "../../../assets/img/octopus_sleep.svg";
import OctopusListeningImage from "../../../assets/img/octopus_listening.svg";
import useAnalyserVolume from "../../../hooks/useAnalyserVolume";

interface Props {
  analyser?: AnalyserNode | null;
  isSleeping?: boolean;
  isListening?: boolean;
}

const MAX_JUMP_DISTANCE_PX = 56;

const OctopusAvatar: React.FC<Props> = ({
  analyser,
  isSleeping = false,
  isListening = false,
}) => {
  const rawVolume = useAnalyserVolume(isSleeping ? null : analyser, 36, 0.15);
  const clampedVolume = useMemo(
    () => Math.min(Math.max(rawVolume, 0), 1),
    [rawVolume],
  );

  const translateY = useMemo(
    () =>
      isSleeping
        ? "translateY(0)"
        : `translateY(-${(clampedVolume * MAX_JUMP_DISTANCE_PX).toFixed(1)}px)`,
    [clampedVolume, isSleeping],
  );

  const imageSrc = isSleeping
    ? OctopusSleepImage
    : isListening
      ? OctopusListeningImage
      : OctopusCharacterImage;

  return (
    <div className="pointer-events-none flex h-full w-full items-end justify-center pb-2">
      <div
        className="relative w-[25vw] max-w-[320px] min-w-[160px]"
        style={{
          transition: "transform 160ms ease",
          transform: translateY,
        }}
      >
        <img
          src={imageSrc}
          alt="Octopus guide"
          className="w-full max-h-[25vh] object-contain drop-shadow-2xl"
        />
      </div>
    </div>
  );
};

export default OctopusAvatar;
