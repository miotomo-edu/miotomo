import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.jsx";
import { DeepgramContextProvider } from "./context/DeepgramContextProvider";
import "./styles/globals.css";
import { stsConfig } from "./lib/constants";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DeepgramContextProvider>
      <App defaultStsConfig={stsConfig} />
    </DeepgramContextProvider>
  </React.StrictMode>,
);
