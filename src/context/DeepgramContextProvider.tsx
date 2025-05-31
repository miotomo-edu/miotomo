import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { getApiKey, sendKeepAliveMessage } from "../utils/deepgramUtils";

enum SocketState {
  Unstarted = -1,
  Connecting = 0,
  Connected = 1,
  Failed = 2,
  Closed = 3,
}

interface Context {
  socket: null | WebSocket;
  socketState: SocketState;
  rateLimited: boolean;
  connectToDeepgram: () => Promise<void>;
  disconnectFromDeepgram: () => void;
}

const defaultContext: Context = {
  socket: null,
  socketState: SocketState.Unstarted,
  rateLimited: false,
  connectToDeepgram: async () => {},
};

const DeepgramContext = createContext<Context>(defaultContext);

const DeepgramContextProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState(null);
  const [socketState, setSocketState] = useState(SocketState.Unstarted);
  const [rateLimited, setRateLimited] = useState(false);
  const keepAlive = useRef();
  const reconnectTimeout = useRef();
  const shouldReconnect = useRef(true);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Stable event handlers
  const handleOpen = (ws) => () => {
    setSocketState(SocketState.Connected);
    reconnectAttempts.current = 0;
    if (keepAlive.current) clearInterval(keepAlive.current);
    keepAlive.current = setInterval(sendKeepAliveMessage(ws), 6000);
  };

  const handleError = (err) => {
    setSocketState(SocketState.Failed);
    console.error("Websocket error", err);
  };
  const connectToDeepgram = async () => {
    console.log("[Deepgram] connectToDeepgram called");
    shouldReconnect.current = true;
    if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    if (socket && socket.readyState !== WebSocket.CLOSED) socket.close();

    setSocketState(SocketState.Connecting);

    try {
      const newSocket = new WebSocket(
        "wss://agent.deepgram.com/v1/agent/converse",
        ["token", await getApiKey()],
      );
      newSocket.binaryType = "arraybuffer";
      newSocket.addEventListener("open", handleOpen(newSocket));
      newSocket.addEventListener("error", handleError);
      newSocket.addEventListener("close", handleClose);
      // ...other handlers...
      setSocket(newSocket);
    } catch (error) {
      setSocketState(SocketState.Failed);
      if (
        shouldReconnect.current &&
        reconnectAttempts.current < maxReconnectAttempts
      ) {
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttempts.current),
          30000,
        );
        reconnectTimeout.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connectToDeepgram();
        }, delay);
      }
    }
  };

  const disconnectFromDeepgram = () => {
    console.log("[Deepgram] disconnectFromDeepgram called");
    shouldReconnect.current = false;
    if (keepAlive.current) clearInterval(keepAlive.current);
    if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    if (socket && socket.readyState !== WebSocket.CLOSED) socket.close();
    setSocket(null);
    setSocketState(SocketState.Closed);
  };

  const handleClose = () => {
    console.log("[Deepgram] WebSocket closed");
    if (keepAlive.current) clearInterval(keepAlive.current);
    setSocketState(SocketState.Closed);
    if (
      shouldReconnect.current &&
      reconnectAttempts.current < maxReconnectAttempts
    ) {
      const delay = Math.min(
        1000 * Math.pow(2, reconnectAttempts.current),
        30000,
      );
      reconnectTimeout.current = setTimeout(() => {
        reconnectAttempts.current += 1;
        connectToDeepgram();
      }, delay);
    } else if (!shouldReconnect.current) {
      // Do nothing, intentional disconnect
    } else {
      setRateLimited(true);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (keepAlive.current) {
        clearInterval(keepAlive.current);
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }
    };
  }, [socket]);

  return (
    <DeepgramContext.Provider
      value={{
        socket,
        socketState,
        rateLimited,
        connectToDeepgram,
        disconnectFromDeepgram,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

function useDeepgram() {
  return useContext(DeepgramContext);
}

export { DeepgramContextProvider, useDeepgram };
