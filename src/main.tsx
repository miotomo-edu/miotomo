import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.jsx";
import { DeepgramContextProvider } from "./context/DeepgramContextProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./styles/globals.css";
import { stsConfig } from "./lib/constants";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DeepgramContextProvider>
        <App defaultStsConfig={stsConfig} />
      </DeepgramContextProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
