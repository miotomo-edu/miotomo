import React, { useState, useRef, useEffect, useMemo } from "react";

// Removed BrowserRouter, Route, Routes imports
import Layout from "./layout/Layout";
import LandingPage from "./sections/LandingPage";
import HomePage from "./sections/HomePage";
import LibraryPage from "./sections/LibraryPage";
import ProfileSection from "./sections/ProfileSection";
import RewardsSection from "./sections/RewardsSection";
import SettingsSection from "./sections/SettingsSection";
import { TalkWithBook } from "./TalkWithBook";
import BottomNavBar from "./common/BottomNavBar";

import { VoiceBotProvider } from "../context/VoiceBotContextProvider";
import { MicrophoneContextProvider } from "../context/MicrophoneContextProvider";
import { loadBookCompanionPrompt } from "../lib/prompts";

import { useStudent, HARDCODED_STUDENT_ID } from "../hooks/useStudent";

// Assuming defaultStsConfig is passed as a prop from main.tsx
const App = ({ defaultStsConfig }) => {
  // 1. All useState and useRef hooks
  const [activeComponent, setActiveComponent] = useState("landing");
  const prevActiveComponent = useRef(activeComponent);
  const [prompt, setPrompt] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const mainRef = useRef(null);
  const [userName, setUserName] = useState("");

  const [studentId, setStudentId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("studentId") || "";
  });

  // 2. All data fetching hooks
  const {
    data: student,
    isLoading: studentLoading,
    error: studentError,
  } = useStudent(studentId);

  // 3. All useEffect hooks
  useEffect(() => {
    loadBookCompanionPrompt().then(setPrompt);
  }, []);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeComponent]);

  useEffect(() => {
    if (student?.name) setUserName(student.name);
  }, [student]);

  // 5. Derived state (variables that depend on state/props)
  const introduction = selectedBook
    ? `You are Tomo, a warm, curious, and encouraging AI companion who chats with ${userName}, a child aged 10, about the book "${selectedBook.title}" by ${selectedBook.author}.`
    : `You are Tomo, a warm, curious, and encouraging AI companion who chats with ${userName}, a child aged 10 about a book.`;

  const greeting = selectedBook
    ? `Hello ${userName}! I'm Miotomo! Your happy book buddy! Are you enjoying "${selectedBook.title}"?`
    : `Hello ${userName}! I'm Miotomo! Your happy book buddy! Are you enjoying your book?`;

  // 6. useMemo hooks (after the values they depend on are defined)
  const updatedStsConfig = useMemo(
    () => ({
      ...defaultStsConfig,
      agent: {
        ...defaultStsConfig.agent,
        think: {
          ...defaultStsConfig.agent.think,
          prompt: `${introduction}\n${prompt}`,
        },
        greeting,
      },
    }),
    [defaultStsConfig, prompt, selectedBook, introduction, greeting],
  );

  if (studentLoading) return <div>Loading student...</div>;
  if (studentError) return <div>Error loading student.</div>;

  if (!studentId || studentError || (!studentLoading && !student)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
        }}
      >
        coming soon...
      </div>
    );
  }

  // Function to switch components
  const handleNavigationClick = (componentName) => {
    setActiveComponent(componentName);
    prevActiveComponent.current = componentName;
  };

  // Conditional rendering based on activeComponent state
  const renderComponent = () => {
    switch (activeComponent) {
      case "landing":
        return <LandingPage onContinue={() => setActiveComponent("home")} />;
      case "home":
        return (
          <HomePage
            books={books}
            setBooks={setBooks}
            onContinue={() => setActiveComponent("interactive")}
            selectedBook={selectedBook}
            onBookSelect={setSelectedBook}
            userName={userName}
            studentId={studentId}
          />
        );
      case "library":
        return (
          <LibraryPage
            books={books}
            setBooks={setBooks}
            onContinue={() => setActiveComponent("interactive")}
            selectedBook={selectedBook}
            onBookSelect={setSelectedBook}
            userName={userName}
            studentId={studentId}
          />
        );
      case "profile":
        return <ProfileSection />;
      case "rewards":
        return <RewardsSection />;
      case "settings":
        return <SettingsSection />;
      case "interactive":
        return (
          <MicrophoneContextProvider>
            <VoiceBotProvider>
              <TalkWithBook
                defaultStsConfig={updatedStsConfig}
                onNavigate={setActiveComponent}
                selectedBook={selectedBook}
              />
            </VoiceBotProvider>
          </MicrophoneContextProvider>
        );
      default:
        return <LandingPage />; // Default to landing page
    }
  };

  return (
    <div className="app-mobile-shell">
      <Layout mainRef={mainRef}>
        <div style={{ flexGrow: 1, overflowY: "auto" }}>
          {renderComponent()}
        </div>
      </Layout>
      {activeComponent !== "landing" && (
        <BottomNavBar
          onItemClick={handleNavigationClick}
          activeComponentName={activeComponent}
        />
      )}
    </div>
  );
};

export default App;
