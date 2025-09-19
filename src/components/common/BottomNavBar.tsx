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
  { label: "Home", componentName: "home", icon: <HomeIcon /> },
  { label: "Progress", componentName: "progress", icon: <InsightsIcon /> },
  { label: "Library", componentName: "library", icon: <LibraryIcon /> },
  // { label: "Rewards", componentName: "rewards", icon: <RewardIcon /> },
  // { label: "Settings", componentName: "settings", icon: <SettingsIcon /> },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  items = defaultNavItems,
  onItemClick = () => {},
  activeComponentName = "landing",
}) => {
  const handleButtonClick = (componentName: string) => {
    if (typeof onItemClick === "function") {
      onItemClick(componentName);
    }
  };

  return (
    <nav className="bottom-navbar-fixed bg-black border-t border-gray-200 flex justify-around items-center h-16 z-10">
      {items.map((item, index) => {
        const isActive = activeComponentName === item.componentName;
        // Ensure icon is always sized the same
        const icon = item.icon ? (
          React.cloneElement(item.icon as React.ReactElement, {
            className: "w-6 h-6",
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
                color: isActive ? "#e85c33" : "#fff",
              }}
            >
              {icon}
            </span>
            <span
              className="text-sm"
              style={{
                color: isActive ? "#e85c33" : "#fff",
                fontWeight: isActive ? 600 : 400,
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
