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
  { label: "Home", componentName: "landing", icon: <HomeIcon /> },
  { label: "Library", componentName: "profile", icon: <LibraryIcon /> },
  { label: "Rewards", componentName: "profile", icon: <RewardIcon /> },
  { label: "Insights", componentName: "profile", icon: <InsightsIcon /> },
  { label: "Settings", componentName: "profile", icon: <SettingsIcon /> },
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
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 z-10">
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
                color: isActive ? "#FAC304" : "#4B5563",
              }}
            >
              {icon}
            </span>
            <span
              className="text-sm"
              style={{
                color: isActive ? "#FAC304" : "#4B5563",
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
