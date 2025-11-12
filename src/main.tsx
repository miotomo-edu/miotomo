import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PipecatClientProvider } from "@pipecat-ai/client-react";
import { PipecatClient } from "@pipecat-ai/client-js";
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport";
import { DailyTransport } from "@pipecat-ai/daily-transport";

import "./styles/globals.css";

const queryClient = new QueryClient();

function getQueryParam(name: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Choose transport type based on URL param (?transport=daily or ?transport=small)
const transportType = getQueryParam("transport");
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
    onUserTranscript: (data) => {
      if (data.final) console.log(`User: ${data.text}`);
    },
    onBotTranscript: (data) => {
      console.log(`Bot: ${data.text}`);
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <PipecatClientProvider client={client}>
        <App transportType={transportType ?? "webrtc"} />
      </PipecatClientProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
