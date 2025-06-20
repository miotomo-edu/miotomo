import React from "react";

type SplitColorButtonProps = {
  text: string;
  leftColor: string;
  rightColor: string;
  split?: number;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactElement;
};

const ICON_SIZE = 32; // px

const SplitColorButton: React.FC<SplitColorButtonProps> = ({
  text,
  leftColor,
  rightColor,
  split = 50,
  onClick,
  className = "",
  style = {},
  icon,
}) => {
  // Only shift text if icon is present
  const textShift = icon ? -ICON_SIZE / 2 : 0;

  return (
    <button
      className={`w-full font-light text-base rounded-full border-none relative overflow-hidden h-12 ${className}`}
      style={{
        background: `linear-gradient(to right, ${leftColor} 0%, ${leftColor} ${split}%, ${rightColor} ${split}%, ${rightColor} 100%)`,
        paddingLeft: icon ? ICON_SIZE : undefined,
        paddingRight: 24,
        ...style,
      }}
      onClick={onClick}
    >
      {/* Absolutely positioned icon on the left */}
      {icon && (
        <span
          className="absolute left-0 top-0 h-full flex items-center justify-center ml-2"
          style={{ width: ICON_SIZE, zIndex: 3, color: "#000" }}
        >
          {React.cloneElement(icon, { className: "w-8 h-8" })}
        </span>
      )}
      {/* White text, clipped to left */}
      <span
        className="absolute left-0 top-0 w-full h-full flex items-center justify-center font-light text-base select-none pointer-events-none"
        style={{
          color: "#fff", // #000
          clipPath: `inset(0 ${100 - split}% 0 0)`,
          WebkitClipPath: `inset(0 ${100 - split}% 0 0)`,
          zIndex: 2,
        }}
      >
        <span
          className="text-center w-full"
          style={
            icon ? { transform: `translateX(-${textShift}px)` } : undefined
          }
        >
          {text}
        </span>
      </span>
      {/* Black text, clipped to right */}
      <span
        className="absolute left-0 top-0 w-full h-full flex items-center justify-center font-light text-base select-none pointer-events-none"
        style={{
          color: "#fff",
          clipPath: `inset(0 0 0 ${split}%)`,
          WebkitClipPath: `inset(0 0 0 ${split}%)`,
          zIndex: 2,
        }}
      >
        <span
          className="text-center w-full"
          style={
            icon ? { transform: `translateX(-${textShift}px)` } : undefined
          }
        >
          {text}
        </span>
      </span>
      {/* Invisible text for button sizing (no icon here!) */}
      <span
        className="absolute left-0 top-0 w-full h-full flex items-center justify-center font-light text-base select-none pointer-events-none"
        style={{
          opacity: 0,
          pointerEvents: "none",
          height: "100%",
        }}
      >
        <span className="text-center w-full">{text}</span>
      </span>
    </button>
  );
};

export default SplitColorButton;
