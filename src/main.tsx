import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PipecatClientProvider } from "@pipecat-ai/client-react";
import { PipecatClient } from "@pipecat-ai/client-js";
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport";
import { DailyTransport } from "@pipecat-ai/daily-transport";
import { AnalyticsProvider } from "./hooks/useAnalytics";

import "./styles/globals.css";

const queryClient = new QueryClient();

function getQueryParam(name: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const fromSearch = urlParams.get(name);
  if (fromSearch) return fromSearch;

  const pathParts = window.location.pathname
    .split("/")
    .filter((part) => part.length > 0);
  const pathIndex = pathParts.findIndex(
    (part) => part.toLowerCase() === name.toLowerCase(),
  );
  if (pathIndex !== -1 && pathParts[pathIndex + 1]) {
    return decodeURIComponent(pathParts[pathIndex + 1]);
  }

  const rawHash = window.location.hash || "";
  const hash = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
  const hashQuery = hash.includes("?")
    ? hash.split("?")[1]
    : hash.includes("=")
      ? hash
      : "";
  if (!hashQuery) return null;
  const hashParams = new URLSearchParams(hashQuery);
  return hashParams.get(name);
}

// Choose transport type based on URL param (?transport=daily or ?transport=small)
const transportType = getQueryParam("transport");
const regionParam = getQueryParam("region") || "";
let transport;
if (transportType === "daily") {
  transport = new DailyTransport();
} else {
  transport = new SmallWebRTCTransport({
    enableMic: true,
    enableCam: false,
  });
}

// Create Pipecat client instance
const client = new PipecatClient({
  transport,
  enableMic: true,
  callbacks: {
    onConnected: () => console.log("Pipecat connected"),
    onBotConnected: (participant) =>
      console.log(`Bot connected: ${JSON.stringify(participant)}`),
    onBotReady: () => console.log("Bot ready to chat!"),
    onUserTranscript: (data) => {
      if (data.final) console.log("User said:", data.text);
    },
    onBotOutput: (data) => {
      if (data.aggregated_by === "sentence") {
        console.log("Bot said (sentence):", data.text);
      }
      // console.log(`Bot Output: ${data.text}, ${data.aggregated_by}`);
    },
    onDisconnected: () => console.log("Disconnected"),
    onBotDisconnected: () => console.log("Bot disconnected"),
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <PipecatClientProvider client={client}>
        <AnalyticsProvider>
          <App transportType={transportType ?? "webrtc"} region={regionParam} />
        </AnalyticsProvider>
      </PipecatClientProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
