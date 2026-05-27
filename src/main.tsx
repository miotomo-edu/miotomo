import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnalyticsProvider } from "./hooks/useAnalytics";
import { getRuntimeQueryParam } from "./lib/runtimeParams";

import "./styles/globals.css";

const queryClient = new QueryClient();
const transportType = getRuntimeQueryParam("transport");
const regionParam = getRuntimeQueryParam("region") || "";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AnalyticsProvider>
        <App transportType={transportType ?? "webrtc"} region={regionParam} />
      </AnalyticsProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
