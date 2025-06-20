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
import {
  loadBookCompanionPrompt,
  the_green_ray,
  f1_growing_wings,
  f1_surving_to_drive,
} from "../lib/prompts";

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

  const setBooksArray = (newBooks) => {
    console.log("setBooksArray called with:", newBooks);
    setBooks(Array.isArray(newBooks) ? newBooks : []);
  };

  // 2. All data fetching hooks
  const {
    data: student,
    isLoading: studentLoading,
    error: studentError,
  } = useStudent(studentId === "vasu2015" ? HARDCODED_STUDENT_ID : studentId);

  // 3. All useEffect hooks
  useEffect(() => {
    loadBookCompanionPrompt().then(setPrompt);
  }, []);

  useEffect(() => {
    // Scroll multiple potential scroll containers
    const scrollToTop = () => {
      // Scroll the main container
      if (mainRef.current) {
        mainRef.current.scrollTo({ top: 0, behavior: "instant" });
        mainRef.current.scrollTop = 0;
      }

      // Also scroll the window/body for mobile
      window.scrollTo({ top: 0, behavior: "instant" });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    // Use both setTimeout and requestAnimationFrame for maximum compatibility
    setTimeout(() => {
      requestAnimationFrame(scrollToTop);
    }, 0);
  }, [activeComponent]);

  useEffect(() => {
    if (student?.name) setUserName(student.name);
  }, [student]);

  // Add these useEffects to your App.jsx component

  // 1. Dynamic viewport height
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener("resize", setViewportHeight);
    window.addEventListener("orientationchange", () => {
      setTimeout(setViewportHeight, 100);
    });

    return () => {
      window.removeEventListener("resize", setViewportHeight);
      window.removeEventListener("orientationchange", setViewportHeight);
    };
  }, []);

  // 2. Force address bar hide on mobile
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      const hideAddressBar = () => {
        // Prevent scrolling on the body
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.height = "100%";

        // Force a minimal scroll to hide address bar
        setTimeout(() => {
          window.scrollTo(0, 1);
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 0);
        }, 100);
      };

      hideAddressBar();
      window.addEventListener("orientationchange", hideAddressBar);
      window.addEventListener("resize", hideAddressBar);

      return () => {
        window.removeEventListener("orientationchange", hideAddressBar);
        window.removeEventListener("resize", hideAddressBar);
      };
    }
  }, []);

  // 5. Derived state (variables that depend on state/props)
  const introduction = selectedBook
    ? `You are Tomo, a warm, curious, and encouraging AI companion who chats with ${userName}, a child aged 10, about the book "${selectedBook.title}" by ${selectedBook.author}.`
    : `You are Tomo, a warm, curious, and encouraging AI companion who chats with ${userName}, a child aged 10 about a book.`;

  const customization = (() => {
    switch (selectedBook?.title) {
      case "The Green Ray":
        return the_green_ray;
      case "F1 Growing Wings":
        return f1_growing_wings;
      case "Surviving to Drive":
        return f1_surving_to_drive;
      default:
        return "";
    }
  })();
  const greeting = selectedBook
    ? `Hello ${userName}! I'm Miotomo! Are you enjoying "${selectedBook.title}"?`
    : `Hello ${userName}! I'm Miotomo! Are you enjoying your book?`;

  // 6. useMemo hooks (after the values they depend on are defined)
  const updatedStsConfig = useMemo(
    () => ({
      ...defaultStsConfig,
      agent: {
        ...defaultStsConfig.agent,
        think: {
          ...defaultStsConfig.agent.think,
          prompt: `${introduction}\n${customization}\n${prompt}`,
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
            setBooks={setBooksArray}
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
            setBooks={setBooksArray}
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
                userName={userName}
                studentId={studentId}
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
        {activeComponent === "landing" ? (
          renderComponent()
        ) : (
          <div style={{ flexGrow: 1, overflowY: "auto" }}>
            {renderComponent()}
          </div>
        )}
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
