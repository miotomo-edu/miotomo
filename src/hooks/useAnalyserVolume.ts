import { useEffect, useState } from "react";
import { normalizeVolume } from "../utils/audioUtils";

const DEFAULT_NORMALIZATION_FACTOR = 48;

export const useAnalyserVolume = (
  analyser?: AnalyserNode | null,
  normalizationFactor: number = DEFAULT_NORMALIZATION_FACTOR,
  initialVolume = 0,
) => {
  const [volume, setVolume] = useState(initialVolume);

  useEffect(() => {
    if (!analyser) {
      setVolume(0);
      return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let rafId = 0;

    const updateVolume = () => {
      setVolume(normalizeVolume(analyser, dataArray, normalizationFactor));
      rafId = requestAnimationFrame(updateVolume);
    };

    updateVolume();

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [analyser, normalizationFactor]);

  return volume;
};

export default useAnalyserVolume;
