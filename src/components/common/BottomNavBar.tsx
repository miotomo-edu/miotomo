import React from "react";
import { HomeIcon } from "./icons/HomeIcon";
import { LibraryIcon } from "./icons/LibraryIcon";
import { ParentsIcon } from "./icons/ParentsIcon";
import tomoIcon from "../../assets/img/tomo.svg";
import { CirclesIcon } from "./icons/CirclesIcon";
import { SettingsIcon } from "./icons/SettingsIcon";
import { TomoIcon } from "./icons/TomoIcon4";

interface BottomNavBarProps {
  items?: { label: string; componentName: string; icon?: React.ReactNode }[];
  onItemClick?: (componentName: string) => void;
  activeComponentName?: string;
  className?: string;
  style?: React.CSSProperties;
}

const defaultNavItems = [
  { label: "CIRCLES", componentName: "library", icon: <CirclesIcon /> },
  // { label: "Home", componentName: "home", icon: <HomeIcon /> },
  { label: "TOMO", componentName: "progress", icon: <TomoIcon /> },
  // {
  //   label: "TOMO",
  //   componentName: "progress",
  //   icon: <img src={tomoIcon} alt="" className="w-6 h-6 object-contain" />,
  // },
  { label: "PARENTS", componentName: "rewards", icon: <ParentsIcon /> },
  // { label: "SETTINGS", componentName: "settings", icon: <SettingsIcon /> },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  items = defaultNavItems,
  onItemClick = () => {},
  activeComponentName = "library",
  className = "",
  style,
}) => {
  const handleButtonClick = (componentName: string) => {
    if (typeof onItemClick === "function") {
      onItemClick(componentName);
    }
  };

  const baseStyle: React.CSSProperties = {
    backgroundColor: "#000000",
    ...style,
  };

  return (
    <nav
      className={`bottom-navbar-fixed flex justify-around items-center h-16 z-10 ${className}`}
      style={baseStyle}
    >
      {items.map((item, index) => {
        const isActive = activeComponentName === item.componentName;
        // Ensure icon is always sized the same
        const icon = item.icon ? (
          React.cloneElement(item.icon as React.ReactElement, {
            className: "w-6 h-6",
            strokeWidth: isActive ? 2.5 : 1.5,
          })
        ) : (
          <UserIcon className="w-6 h-6" />
        );
        return (
          <button
            key={index}
            onClick={() => handleButtonClick(item.componentName)}
            className="flex flex-col items-center justify-center cursor-pointer p-2"
            type="button"
          >
            <span
              className="mb-1 flex items-center justify-center"
              style={{
                color: isActive ? "#fff" : "#fff",
              }}
            >
              {icon}
            </span>
            <span
              className="text-xs"
              style={{
                color: isActive ? "#fff" : "#fff",
                fontWeight: isActive ? 800 : 400,
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavBar;
