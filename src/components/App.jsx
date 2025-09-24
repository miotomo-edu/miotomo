import React, { useState, useRef, useEffect, useMemo } from "react";
import { PipecatClientAudio } from "@pipecat-ai/client-react";

import Layout from "./layout/Layout";
import LandingPage from "./sections/LandingPage";
import HomePage from "./sections/HomePage";
import LibraryPage from "./sections/LibraryPage";
import ProfileSection from "./sections/ProfileSection";
import RewardsSection from "./sections/RewardsSection";
import SettingsSection from "./sections/SettingsSection";
import MapSection from "./sections/MapSection";
import { TalkWithBook } from "./TalkWithBook";
import ProgressSection from "./sections/ProgressSection";
import BottomNavBar from "./common/BottomNavBar";
import { usePingOnMount } from "../hooks/usePingOnMount";
import { VoiceBotProvider } from "../context/VoiceBotContextProvider";
import {
  loadBookCompanionPrompt,
  the_green_ray,
  f1_growing_wings,
  f1_surving_to_drive,
} from "../lib/prompts";
import { getBookSectionType } from "../utils/bookUtils";
import { useStudent, HARDCODED_STUDENT_ID } from "../hooks/useStudent";

import { PipecatConnectionManager } from "../hooks/usePipecatConnection";

const WAKEUP_URL =
  "https://littleark--2ee0422496c511f08e120224a6c84d84.web.val.run";

const App = ({ defaultStsConfig, transportType }) => {
  usePingOnMount(WAKEUP_URL);

  const [activeComponent, setActiveComponent] = useState("landing");
  const prevActiveComponent = useRef(activeComponent);
  const [prompt, setPrompt] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [books, setBooks] = useState([]);
  const mainRef = useRef(null);
  const [userName, setUserName] = useState("");
  const [currentCharacter, setCurrentCharacter] = useState(null);

  // Used to trigger disconnect from BottomNavBar or when leaving interactive
  const disconnectRef = useRef(null);

  const [studentId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("studentId") || "";
  });

  const {
    data: student,
    isLoading: studentLoading,
    error: studentError,
  } = useStudent(studentId === "vasu2015" ? HARDCODED_STUDENT_ID : studentId);

  useEffect(() => {
    if (currentCharacter?.prompt) {
      loadBookCompanionPrompt(currentCharacter.prompt).then(setPrompt);
    }
  }, [currentCharacter]);

  useEffect(() => {
    if (student?.name) setUserName(student.name);
  }, [student]);

  // --- Viewport helpers omitted for brevity ---

  const introduction =
    selectedBook && currentCharacter
      ? `You are ${currentCharacter.name}, a warm, curious, and encouraging AI companion who chats with ${userName}, a child aged 10, about the book "${selectedBook.title}" by ${selectedBook.author}. Focus on chapter ${selectedChapter}.`
      : selectedBook
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
    ? `Hello ${userName}! I'm ${currentCharacter?.name}! Are you enjoying ${getBookSectionType(
        selectedBook.section_type,
      )} ${selectedChapter} of "${selectedBook.title}"?`
    : `Hello ${userName}! I'm ${currentCharacter?.name}! Are you enjoying your book?`;

  const updatedBotConfig = useMemo(
    () => ({
      prompt: `${introduction}\n${customization}\n${prompt}`,
      greeting,
      voice: currentCharacter?.voice ?? "default-voice",
      transportType, // 'daily' or 'webrtc' from main.tsx
      metadata: {
        book: selectedBook,
        chapter: selectedChapter,
        studentName: userName,
        character: currentCharacter,
      },
    }),
    [
      prompt,
      selectedBook,
      introduction,
      greeting,
      currentCharacter,
      selectedChapter,
      userName,
      transportType,
    ],
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

  const handleBookAndCharacterSelect = (book, character) => {
    setSelectedBook(book);
    setCurrentCharacter(character);
    setActiveComponent("interactive");
  };

  const handleNavigationClick = (componentName) => {
    // When leaving the talk screen, disconnect.
    if (activeComponent === "interactive" && disconnectRef.current) {
      disconnectRef.current();
    }
    setActiveComponent(componentName);
    prevActiveComponent.current = componentName;
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "landing":
        return <LandingPage onContinue={() => setActiveComponent("home")} />;
      case "home":
        return (
          <HomePage
            books={books}
            setBooks={(arr) => setBooks(Array.isArray(arr) ? arr : [])}
            onContinue={() => setActiveComponent("interactive")}
            selectedBook={selectedBook}
            selectedChapter={selectedChapter}
            onBookAndCharacterSelect={handleBookAndCharacterSelect}
            userName={userName}
            studentId={studentId}
            onBookSelectForMap={(book, chapter) => {
              setSelectedBook(book);
              setSelectedChapter(chapter);
              setActiveComponent("map");
            }}
          />
        );
      case "library":
        return (
          <LibraryPage
            books={books}
            setBooks={(arr) => setBooks(Array.isArray(arr) ? arr : [])}
            selectedBook={selectedBook}
            selectedChapter={selectedChapter}
            onBookAndCharacterSelect={handleBookAndCharacterSelect}
            onContinue={() => setActiveComponent("interactive")}
            userName={userName}
            studentId={studentId}
            onBookSelectForMap={(book, chapter) => {
              setSelectedBook(book);
              setSelectedChapter(chapter);
              setActiveComponent("map");
            }}
          />
        );
      case "progress":
        return (
          <ProgressSection
            userName={userName}
            studentId={studentId}
            selectedBook={selectedBook}
          />
        );
      case "profile":
        return <ProfileSection />;
      case "rewards":
        return <RewardsSection />;
      case "settings":
        return <SettingsSection />;
      case "map":
        return (
          <MapSection
            book={selectedBook}
            chapter={selectedChapter}
            onSelectModality={(character) =>
              handleBookAndCharacterSelect(selectedBook, character)
            }
            onBack={() => setActiveComponent("library")}
          />
        );
      case "interactive":
        return (
          <VoiceBotProvider>
            <TalkWithBook
              botConfig={updatedBotConfig}
              onNavigate={setActiveComponent}
              selectedBook={selectedBook}
              chapter={selectedChapter}
              currentCharacter={currentCharacter}
              userName={userName}
              studentId={studentId}
              showControlButton={false} // hide controls; autostart path
              onDisconnectRequest={disconnectRef}
            />
            <PipecatClientAudio volume={1.0} muted={false} />
          </VoiceBotProvider>
        );
      default:
        return <LandingPage />;
    }
  };

  // 👉 IMPORTANT: Key the connection manager on book:chapter:character so it remounts
  const connectionKey = `${selectedBook?.id || "none"}:${selectedChapter || 0}:${currentCharacter?.name || "none"}`;

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

      {/* 🔌 Pre-connect as soon as we have enough info (even before TalkWithBook mounts) */}
      {selectedBook && currentCharacter && (
        <PipecatConnectionManager
          key={connectionKey}
          autoConnect
          botConfig={updatedBotConfig}
          userName={userName}
          selectedBook={selectedBook}
          chapter={selectedChapter}
          onDisconnectRef={disconnectRef}
        />
      )}

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
