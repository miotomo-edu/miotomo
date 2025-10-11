import React from "react";
import { HomeIcon } from "./icons/HomeIcon";
import { LibraryIcon } from "./icons/LibraryIcon";
import { RewardIcon } from "./icons/RewardIcon";
import { InsightsIcon } from "./icons/InsightsIcon";
import { SettingsIcon } from "./icons/SettingsIcon";

interface BottomNavBarProps {
  items?: { label: string; componentName: string; icon?: React.ReactNode }[];
  onItemClick?: (componentName: string) => void;
  activeComponentName?: string;
}

const defaultNavItems = [
  { label: "LIBRARY", componentName: "library", icon: <LibraryIcon /> },
  // { label: "Home", componentName: "home", icon: <HomeIcon /> },
  { label: "PROGRESS", componentName: "progress", icon: <InsightsIcon /> },
  { label: "REWARDS", componentName: "rewards", icon: <RewardIcon /> },
  // { label: "SETTINGS", componentName: "settings", icon: <SettingsIcon /> },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  items = defaultNavItems,
  onItemClick = () => {},
  activeComponentName = "library",
}) => {
  const handleButtonClick = (componentName: string) => {
    if (typeof onItemClick === "function") {
      onItemClick(componentName);
    }
  };

  return (
    <nav className="bottom-navbar-fixed bg-white border-t border-black flex justify-around items-center h-16 z-10">
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
                color: isActive ? "#000" : "#000",
              }}
            >
              {icon}
            </span>
            <span
              className="text-xs"
              style={{
                color: isActive ? "#000" : "#000",
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
