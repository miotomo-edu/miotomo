import React, { useState, useRef, useEffect, useMemo } from "react";

// Removed BrowserRouter, Route, Routes imports
import Layout from "./layout/Layout";
import LandingPage from "./sections/LandingPage";
import HomePage from "./sections/HomePage";
import LibraryPage from "./sections/LibraryPage";
import ProfileSection from "./sections/ProfileSection";
import { TalkWithBook } from "./TalkWithBook";
import BottomNavBar from "./common/BottomNavBar";

import { VoiceBotProvider } from "../context/VoiceBotContextProvider";
import { MicrophoneContextProvider } from "../context/MicrophoneContextProvider";
import { loadBookCompanionPrompt } from "../lib/prompts";

// Assuming defaultStsConfig is passed as a prop from main.tsx
const App = ({ defaultStsConfig }) => {
  // State to manage which component is currently active
  // Changed default state from 'interactive' to 'landing'
  const [activeComponent, setActiveComponent] = useState("landing");
  const prevActiveComponent = useRef(activeComponent);

  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    loadBookCompanionPrompt().then(setPrompt);
  }, []);

  // Function to switch components
  const handleNavigationClick = (componentName) => {
    setActiveComponent(componentName);
    prevActiveComponent.current = componentName;
  };

  const updatedStsConfig = useMemo(
    () => ({
      ...defaultStsConfig,
      agent: {
        ...defaultStsConfig.agent,
        think: {
          ...defaultStsConfig.agent.think,
          prompt,
        },
      },
    }),
    [defaultStsConfig, prompt],
  );

  console.log("updatedStsConfig", updatedStsConfig);

  // Conditional rendering based on activeComponent state
  const renderComponent = () => {
    switch (activeComponent) {
      case "landing":
        return <LandingPage onContinue={() => setActiveComponent("home")} />;
      case "home":
        return (
          <HomePage onContinue={() => setActiveComponent("interactive")} />
        );
      case "library":
        return (
          <LibraryPage onContinue={() => setActiveComponent("interactive")} />
        );
      case "profile":
        return <ProfileSection />;
      case "rewards":
        return <ProfileSection />;
      case "settings":
        return <ProfileSection />;
      case "interactive":
        // Pass defaultStsConfig only to InteractiveSection
        // return <InteractiveSection defaultStsConfig={defaultStsConfig} />;
        return (
          <MicrophoneContextProvider>
            <VoiceBotProvider>
              <TalkWithBook
                defaultStsConfig={updatedStsConfig}
                onNavigate={setActiveComponent}
              />
            </VoiceBotProvider>
          </MicrophoneContextProvider>
        );
      default:
        return <LandingPage />; // Default to landing page
    }
  };

  return (
    <Layout>
      {/* Render the currently active component */}
      <div style={{ flexGrow: 1, overflowY: "auto" }}>{renderComponent()}</div>
      {activeComponent !== "landing" && (
        <BottomNavBar
          onItemClick={handleNavigationClick}
          activeComponentName={activeComponent}
        />
      )}
    </Layout>
  );
};

export default App;
