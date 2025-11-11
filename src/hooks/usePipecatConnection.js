// Reusable connection utilities for Pipecat (Daily + Small WebRTC)
// - usePipecatConnection(): hook with connect / disconnect / sendClientMessage
// - <PipecatConnectionManager />: optional headless component to auto-connect on mount
//
// Works with the existing PipecatClientProvider.
// Keep event binding (transcripts, BotReady -> start-chat, etc.) in your screen components.

import { useCallback, useEffect, useRef, useState } from "react";
import { usePipecatClient } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";

/**
 * Build the Small WebRTC offer URL from your current app state.
 * You can replace this with a server-side session setup if preferred.
 */
function buildSmallWebRTCUrl({
  base = "http://localhost:8000/api/offer",
  userName = "",
  botConfig,
  selectedBook,
  chapter,
}) {
  const params = new URLSearchParams({
    student: userName || "",
    chapter_old: String(botConfig?.metadata?.book?.progress ?? ""),
    chapter: String(chapter ?? ""),
    book_id: String(selectedBook?.id ?? ""),
    book: String(selectedBook?.title ?? ""),
    prompt: String(botConfig?.metadata?.character?.prompt ?? ""),
    section_type: String(botConfig?.metadata?.book?.section_type ?? ""),
    character_name: String(botConfig?.metadata?.character?.name ?? ""),
    modalities: String(
      botConfig?.metadata?.character?.modalities ??
        "storytelling,spelling,debating",
    ),
    modality_handoff_default: String(
      botConfig?.metadata?.character?.modality_handoff_default ?? 1,
    ),
  });
  return `${base}?${params.toString()}`;
}

/**
 * Reusable connection hook.
 * Returns connect(), disconnect(), sendClientMessage(), and connection state.
 */
const resolveEnvVar = (key) => {
  const value = import.meta.env?.[key];
  if (!value) {
    throw new Error(
      `${key} is not defined. Create a .env.local (or export the variable) with ${key}=<url>.`,
    );
  }
  return value;
};

export function usePipecatConnection(options = {}) {
  const client = usePipecatClient();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const connectingRef = useRef(false); // Track in-progress connection attempts
  const disconnectingRef = useRef(false); // Track in-progress disconnection

  // Basic connection state listeners (keep other event bindings in your pages)
  useEffect(() => {
    if (!client) return;

    const onConnected = () => {
      console.log("📡 Client connected event");
      setIsConnected(true);
      setIsConnecting(false);
      connectingRef.current = false;
    };

    const onDisconnected = () => {
      console.log("📡 Client disconnected event");
      setIsConnected(false);
      setIsConnecting(false);
      connectingRef.current = false;
      disconnectingRef.current = false;
    };

    const onConnecting = () => {
      console.log("📡 Client connecting event");
      setIsConnecting(true);
      connectingRef.current = true;
    };

    client.on(RTVIEvent.Connected, onConnected);
    client.on(RTVIEvent.Disconnected, onDisconnected);
    client.on(RTVIEvent.Connecting, onConnecting);

    return () => {
      client.off(RTVIEvent.Connected, onConnected);
      client.off(RTVIEvent.Disconnected, onDisconnected);
      client.off(RTVIEvent.Connecting, onConnecting);
    };
  }, [client]);

  const connect = useCallback(
    async ({
      botConfig,
      userName,
      selectedBook,
      chapter,
      dailyProxyUrl,
      smallWebRTCOfferUrlBase,
    }) => {
      if (!client) throw new Error("Pipecat client missing");

      // Check if client is already in a connected/connecting state
      const clientState = client.state;
      console.log("📊 Client state:", clientState);

      // Prevent duplicate connections
      if (connectingRef.current) {
        console.log("🔄 Connect already in progress, skipping");
        return;
      }

      // If client is already connected or connecting, skip
      if (clientState === "ready" || clientState === "connecting") {
        console.log(
          "⚠️ Client already",
          clientState,
          "- skipping duplicate connect",
        );
        return;
      }

      // If already connected according to our state, disconnect first
      if (isConnected && !disconnectingRef.current) {
        console.log("⚠️ Already connected, disconnecting first...");
        try {
          disconnectingRef.current = true;
          await client.disconnect();
          // Wait for clean disconnect
          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (err) {
          console.warn("Error during pre-connect disconnect:", err);
        } finally {
          disconnectingRef.current = false;
        }
      }

      connectingRef.current = true;
      setIsConnecting(true);

      console.log("🚀 Starting connection...", {
        transportType: botConfig?.transportType,
        selectedBook: selectedBook?.id,
        chapter,
        userName,
      });

      try {
        const resolvedDailyProxyUrl =
          dailyProxyUrl ?? resolveEnvVar("VITE_DAILY_PROXY_URL");
        const resolvedSmallWebRTCUrl =
          smallWebRTCOfferUrlBase ?? resolveEnvVar("VITE_SMALL_WEBRTC_URL");

        if (botConfig?.transportType === "daily") {
          // 1) Create Daily room/token via your proxy
          if (!resolvedDailyProxyUrl) {
            throw new Error(
              "Daily proxy URL missing. Set VITE_DAILY_PROXY_URL or pass dailyProxyUrl to usePipecatConnection connect().",
            );
          }
          const response = await fetch(`${resolvedDailyProxyUrl}/connect-pipecat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ config: botConfig }),
          });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Daily HTTP ${response.status}`);
          }
          const { room_url, token } = await response.json();
          // 2) Connect Pipecat client to Daily
          console.log("🔐 Daily credentials received", {
            room_url,
            hasToken: Boolean(token),
          });
          await client.connect({ room_url, token });
        } else {
          // Small WebRTC transport
          console.log("🌐 Using Small WebRTC transport");
          if (!resolvedSmallWebRTCUrl) {
            throw new Error(
              "Small WebRTC offer URL missing. Set VITE_SMALL_WEBRTC_URL or pass smallWebRTCOfferUrlBase to usePipecatConnection connect().",
            );
          }
          const webrtcUrl = buildSmallWebRTCUrl({
            base: resolvedSmallWebRTCUrl,
            userName,
            botConfig,
            selectedBook,
            chapter,
          });
          console.log("🔗 WebRTC URL:", webrtcUrl);
          await client.connect({ webrtcUrl });
          console.log("✅ WebRTC connection initiated");
        }
      } catch (err) {
        console.error("Pipecat connect failed:", err);
        connectingRef.current = false;
        setIsConnecting(false);
        throw err;
      }
    },
    [client, isConnected],
  );

  const disconnect = useCallback(async () => {
    if (!client) {
      console.log("⚠️ No client to disconnect");
      return;
    }

    if (disconnectingRef.current) {
      console.log("🔄 Disconnect already in progress, skipping");
      return;
    }

    console.log("🔌 Starting disconnect...");
    disconnectingRef.current = true;
    connectingRef.current = false;

    try {
      // Force stop all media tracks first
      try {
        const tracks = client.tracks();
        if (tracks) {
          console.log("🎤 Stopping media tracks...");
          Object.values(tracks).forEach((track) => {
            if (track && typeof track.stop === "function") {
              try {
                track.stop();
                console.log("✅ Stopped track:", track.kind);
              } catch (e) {
                console.warn("Error stopping individual track:", e);
              }
            }
          });
        }
      } catch (trackErr) {
        console.warn("Error stopping tracks:", trackErr);
      }

      // Now disconnect the client
      await client.disconnect();
      console.log("✅ Disconnected successfully");

      // Give extra time for full cleanup
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err) {
      console.error("Pipecat disconnect failed:", err);
    } finally {
      disconnectingRef.current = false;
      setIsConnecting(false);
      setIsConnected(false);
    }
  }, [client]);

  const sendClientMessage = useCallback(
    (type, data) => {
      if (!client) {
        console.warn("⚠️ Cannot send message - no client");
        return;
      }

      // Check if client is in ready state
      const clientState = client.state;
      if (clientState !== "ready") {
        console.warn(
          `⚠️ Cannot send message - client state is '${clientState}', not 'ready'`,
        );
        return;
      }

      try {
        client.sendClientMessage(type, data);
        console.log(`📤 Sent message: ${type}`, data);
      } catch (err) {
        console.error("sendClientMessage failed:", err);
      }
    },
    [client],
  );

  return {
    connect,
    disconnect,
    sendClientMessage,
    isConnected,
    isConnecting,
  };
}

/**
 * Optional headless component that auto-connects on mount and disconnects on unmount.
 * Useful if you want to manage connection declaratively from a parent.
 */
export function PipecatConnectionManager({
  autoConnect = false,
  botConfig,
  userName,
  selectedBook,
  chapter,
  dailyProxyUrl,
  smallWebRTCOfferUrlBase,
  onDisconnectRef, // optional ref so parent can trigger disconnect()
}) {
  const { connect, disconnect, isConnected, isConnecting } =
    usePipecatConnection();

  const hasConnectedRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastSignatureRef = useRef(null);

  const connectionSignature = `${selectedBook?.id ?? ""}|${
    chapter ?? ""
  }|${botConfig?.metadata?.character?.name ?? ""}|${
    botConfig?.transportType ?? ""
  }`;

  // Track mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // expose disconnect to parent
  useEffect(() => {
    if (!onDisconnectRef) return;
    onDisconnectRef.current = disconnect;
    return () => {
      onDisconnectRef.current = null;
    };
  }, [onDisconnectRef, disconnect]);

  // auto-connect
  useEffect(() => {
    if (!autoConnect) return;
    if (!botConfig || !selectedBook?.id || !chapter) return;

    if (lastSignatureRef.current !== connectionSignature) {
      hasConnectedRef.current = false;
      lastSignatureRef.current = connectionSignature;
    }

    if (hasConnectedRef.current) return;
    if (isConnected || isConnecting) return;

    console.log(
      "🔄 AUTO CONNECT",
      selectedBook.id,
      chapter,
      botConfig.metadata?.character?.name,
    );
    hasConnectedRef.current = true;

    connect({
      botConfig,
      userName,
      selectedBook,
      chapter,
      dailyProxyUrl,
      smallWebRTCOfferUrlBase,
    }).catch((err) => {
      if (!err?.message?.includes("already started")) {
        console.error("Auto-connect failed:", err);
      } else {
        console.log("ℹ️ Connection already in progress from another component");
      }
      if (isMountedRef.current) {
        hasConnectedRef.current = false;
      }
    });
  }, [
    autoConnect,
    botConfig,
    userName,
    selectedBook?.id,
    chapter,
    connect,
    isConnected,
    isConnecting,
    dailyProxyUrl,
    smallWebRTCOfferUrlBase,
    connectionSignature,
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 PipecatConnectionManager unmounting, disconnecting...");
      disconnect();
    };
  }, [disconnect]);

  return null; // headless
}
