import React, { useMemo } from "react";
import useAnalyserVolume from "../../../hooks/useAnalyserVolume";

interface CharacterImages {
  idle: string;
  sleeping?: string;
  listening?: string;
  celebrating?: string;
}

interface Props {
  analyser?: AnalyserNode | null;
  isSleeping?: boolean;
  isListening?: boolean;
  isCelebrating?: boolean;
  images: CharacterImages;
  characterName?: string;
}

const MAX_JUMP_DISTANCE_PX = 56;

const CharacterAvatar: React.FC<Props> = ({
  analyser,
  isSleeping = false,
  isListening = false,
  isCelebrating = false,
  images,
  characterName = "character",
}) => {
  const baselineImage = images?.idle;
  const sleepingImage = images?.sleeping || baselineImage;
  const listeningImage = images?.listening || baselineImage;
  const celebratingImage = images?.celebrating || baselineImage;
  const displayImage = isSleeping
    ? sleepingImage
    : isCelebrating
      ? celebratingImage
      : isListening
      ? listeningImage
      : baselineImage;

  const rawVolume = useAnalyserVolume(
    isSleeping ? null : analyser,
    36,
    0.15,
  );
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

  return (
    <div className="pointer-events-none flex h-full w-full items-end justify-center pb-2">
      <div
        className="relative w-[25vw] max-w-[320px] min-w-[160px]"
        style={{
          transition: "transform 160ms ease",
          transform: translateY,
        }}
      >
        {displayImage && (
          <img
            src={displayImage}
            alt={`${characterName} avatar`}
            className="w-full max-h-[25vh] object-contain drop-shadow-2xl"
          />
        )}
      </div>
    </div>
  );
};

export default CharacterAvatar;
