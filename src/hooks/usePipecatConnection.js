// Reusable connection utilities for Pipecat (Daily + Small WebRTC)
// - usePipecatConnection(): hook with connect / disconnect / sendClientMessage
// - <PipecatConnectionManager />: optional headless component to auto-connect on mount
//
// Works with the existing PipecatClientProvider.
// Keep event binding (transcripts, BotReady -> start-chat, etc.) in your screen components.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  });
  return `${base}?${params.toString()}`;
}

/**
 * Reusable connection hook.
 * Returns connect(), disconnect(), sendClientMessage(), and connection state.
 */
export function usePipecatConnection(options = {}) {
  const client = usePipecatClient();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const startedRef = useRef(false); // prevent duplicate connects (StrictMode etc.)

  // Basic connection state listeners (keep other event bindings in your pages)
  useEffect(() => {
    if (!client) return;
    const onConnected = () => setIsConnected(true);
    const onDisconnected = () => setIsConnected(false);
    client.on(RTVIEvent.Connected, onConnected);
    client.on(RTVIEvent.Disconnected, onDisconnected);
    return () => {
      client.off(RTVIEvent.Connected, onConnected);
      client.off(RTVIEvent.Disconnected, onDisconnected);
    };
  }, [client]);

  const connect = useCallback(
    async ({
      botConfig,
      userName,
      selectedBook,
      chapter,
      dailyProxyUrl = "https://littleark--a3f08acc7cb911f08eaf0224a6c84d84.web.val.run",
      smallWebRTCOfferUrlBase = "http://localhost:8000/api/offer",
    }) => {
      if (!client) throw new Error("Pipecat client missing");
      if (startedRef.current) return; // already connecting/connected
      startedRef.current = true;
      setIsConnecting(true);
      try {
        if (botConfig?.transportType === "daily") {
          // 1) Create Daily room/token via your proxy
          const response = await fetch(`${dailyProxyUrl}/connect-pipecat`, {
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
          await client.connect({ room_url, token });
        } else {
          // Small WebRTC transport
          const webrtcUrl = buildSmallWebRTCUrl({
            base: smallWebRTCOfferUrlBase,
            userName,
            botConfig,
            selectedBook,
            chapter,
          });
          await client.connect({ webrtcUrl });
        }
      } catch (err) {
        console.error("Pipecat connect failed:", err);
        startedRef.current = false; // allow retry on next call
        throw err;
      } finally {
        setIsConnecting(false);
      }
    },
    [client],
  );

  const disconnect = useCallback(async () => {
    if (!client) return;
    try {
      await client.disconnect();
    } catch (err) {
      console.error("Pipecat disconnect failed:", err);
    } finally {
      startedRef.current = false;
    }
  }, [client]);

  const sendClientMessage = useCallback(
    (type, data) => {
      if (!client) return;
      try {
        client.sendClientMessage(type, data);
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
    console.log("AUTO CONNECT", selectedBook.id, chapter);
    connect({
      botConfig,
      userName,
      selectedBook,
      chapter,
      dailyProxyUrl,
      smallWebRTCOfferUrlBase,
    }).catch(() => {});
    // no deps on connect params to avoid reconnect loop; manage via keys in parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, botConfig, selectedBook?.id, chapter]);

  // clean up
  useEffect(() => () => void disconnect(), [disconnect]);

  return null; // headless
}
