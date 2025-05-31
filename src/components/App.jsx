import React, { useState } from "react";

import Layout from "./layout/Layout";
import LandingPage from "./sections/LandingPage";
import ProfileSection from "./sections/ProfileSection";
import BottomNavBar from "./common/BottomNavBar";

// Assuming defaultStsConfig is passed as a prop from main.tsx
const App = ({ defaultStsConfig }) => {
  // State to manage which component is currently active
  const [activeComponent, setActiveComponent] = useState("landing");

  // Function to switch components
  const handleNavigationClick = (componentName) => {
    setActiveComponent(componentName);
  };

  // Conditional rendering based on activeComponent state
  const renderComponent = () => {
    switch (activeComponent) {
      case "landing":
        return (
          <LandingPage onContinue={() => setActiveComponent("interactive")} />
        );
      case "profile":
        return <ProfileSection />;
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
