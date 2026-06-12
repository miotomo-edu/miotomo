import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnalyticsProvider } from "./hooks/useAnalytics";
import { getBooleanQueryParam, getQueryParam } from "./lib/runtimeParams";

import "./styles/globals.css";

const queryClient = new QueryClient();

const transportType = getQueryParam("transport");
const regionParam = getQueryParam("region") || "";
const testingMode = getBooleanQueryParam("testing");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AnalyticsProvider>
        <App
          transportType={transportType ?? "daily"}
          region={regionParam}
          testingMode={testingMode}
        />
      </AnalyticsProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
