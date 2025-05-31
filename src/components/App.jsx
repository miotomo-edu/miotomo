import React, { useState, useRef, useEffect } from "react";

// Removed BrowserRouter, Route, Routes imports
import Layout from "./layout/Layout";
import LandingPage from "./sections/LandingPage";
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
  const [activeComponent, setActiveComponent] = useState("interactive");
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

  defaultStsConfig.agent.think.prompt = prompt;

  console.log("defaultStsConfig", defaultStsConfig);

  // Conditional rendering based on activeComponent state
  const renderComponent = () => {
    switch (activeComponent) {
      case "landing":
        return (
          <LandingPage onContinue={() => setActiveComponent("interactive")} />
        );
      case "library":
        return (
          <LibraryPage onContinue={() => setActiveComponent("interactive")} />
        );
      case "profile":
        return <ProfileSection />;
      case "interactive":
        // Pass defaultStsConfig only to InteractiveSection
        // return <InteractiveSection defaultStsConfig={defaultStsConfig} />;
        return (
          <MicrophoneContextProvider>
            <VoiceBotProvider>
              <TalkWithBook
                defaultStsConfig={defaultStsConfig}
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
      <div style={{ flexGrow: 1, overflowY: "auto" }}>
        {" "}
        {/* Added basic styling for content area */}
        {renderComponent()}
      </div>

      <BottomNavBar
        onItemClick={handleNavigationClick}
        activeComponentName={activeComponent}
      />
    </Layout>
  );
};

export default App;
