import React from "react";
import type { CSSProperties } from "react";

interface Props {
  children: React.ReactNode;
  activeVolume: number;
}

const CharacterContainer: React.FC<Props> = ({ children, activeVolume }) => {
  const scale = (1 + activeVolume * 0.35).toFixed(3);
  const style = {
    ["--active-volume" as string]: activeVolume.toString(),
    transform: `scale(${scale})`,
  } satisfies CSSProperties;

  return (
    <div className="character-orb-wrapper" style={style}>
      {children}
    </div>
  );
};

export default CharacterContainer;
