import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnalyticsProvider } from "./hooks/useAnalytics";
import { UserDataRegionProvider } from "./hooks/integrations/supabase/userDataRegion";
import { getBooleanQueryParam, getQueryParam } from "./lib/runtimeParams";

import "./styles/globals.css";

const queryClient = new QueryClient();

const transportType = getQueryParam("transport");
const regionParam = getQueryParam("region") || "";
const testingMode = getBooleanQueryParam("testing");
const defaultTransportType =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "webrtc"
    : "daily";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserDataRegionProvider region={regionParam}>
        <AnalyticsProvider>
          <App
            transportType={transportType ?? defaultTransportType}
            region={regionParam}
            testingMode={testingMode}
          />
        </AnalyticsProvider>
      </UserDataRegionProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
