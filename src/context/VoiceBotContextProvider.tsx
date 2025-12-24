import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  voiceBotReducer,
  INCREMENT_SLEEP_TIMER,
  START_SPEAKING,
  START_LISTENING,
  START_SLEEPING,
  START_THINKING,
  ADD_MESSAGE,
  CLEAR_MESSAGES,
  SET_CONVERSATION_CONFIG,
  SET_CURRENT_CONVERSATION_ID,
  SET_LATEST_SERVER_EVENT,
} from "./VoiceBotReducer";

import { USE_MOCK_DATA, mockMessages } from "../utils/mockData";

const defaultSleepTimeoutSeconds = 30;

export type VoiceBotMessage = LatencyMessage | ConversationMessage;

export type LatencyMessage = {
  total_latency: number | null;
  tts_latency: number;
  ttt_latency: number;
};
export type ConversationMessage = UserMessage | AssistantMessage;

export type UserMessage = { user: string };
export type AssistantMessage = { assistant: string };

export const isConversationMessage = (
  voiceBotMessage: VoiceBotMessage,
): voiceBotMessage is ConversationMessage =>
  isUserMessage(voiceBotMessage as UserMessage) ||
  isAssistantMessage(voiceBotMessage as AssistantMessage);

export const isLatencyMessage = (
  voiceBotMessage: VoiceBotMessage,
): voiceBotMessage is LatencyMessage =>
  (voiceBotMessage as LatencyMessage).tts_latency !== undefined;

export const isUserMessage = (
  conversationMessage: ConversationMessage,
): conversationMessage is UserMessage =>
  (conversationMessage as UserMessage).user !== undefined;

export const isAssistantMessage = (
  conversationMessage: ConversationMessage,
): conversationMessage is AssistantMessage =>
  (conversationMessage as AssistantMessage).assistant !== undefined;

export type VoiceBotAction = { type: string };

export enum VoiceBotStatus {
  LISTENING = "listening",
  THINKING = "thinking",
  SPEAKING = "speaking",
  SLEEPING = "sleeping",
  NONE = "",
}

export interface ConversationConfig {
  studentId: string | null;
  bookId: string | null;
  autoSave: boolean;
  modalities: string | null;
}

export interface VoiceBotState {
  status: VoiceBotStatus;
  sleepTimer: number;
  messages: VoiceBotMessage[];
  messageCount: number;
  conversationConfig: ConversationConfig;
  currentConversationId: string | null;
  latestServerEvent: unknown;
}

export interface VoiceBotContext extends VoiceBotState {
  addVoicebotMessage: (newMessage: VoiceBotMessage) => void;
  isWaitingForUserVoiceAfterSleep: React.Ref<boolean>;
  startSpeaking: (wakeFromSleep?: boolean) => void;
  startListening: (wakeFromSleep?: boolean) => void;
  startThinking: () => void;
  startSleeping: () => void;
  toggleSleep: () => void;
  displayOrder: VoiceBotMessage[];
  setConversationConfig: (config: ConversationConfig) => void;
  setLatestServerEvent: (event: unknown) => void;
  clearConversation: () => void;
  conversationSaving: boolean;
  conversationSaveError: string | null;
}

const initialState: VoiceBotState = {
  status: VoiceBotStatus.SPEAKING,
  sleepTimer: 0,
  messages: USE_MOCK_DATA ? mockMessages : [],
  messageCount: 0,
  conversationConfig: {
    studentId: null,
    bookId: null,
    autoSave: false,
    modalities: null,
  },
  currentConversationId: null,
  latestServerEvent: null,
};

export const VoiceBotContext = createContext<VoiceBotContext | undefined>(
  undefined,
);

export function useVoiceBot() {
  const context = useContext(VoiceBotContext);
  if (!context)
    throw new Error("useVoiceBot must be used within a VoiceBotProvider");
  return context;
}

interface Props {
  children: React.ReactNode;
}

export function VoiceBotProvider({ children }: Props) {
  const [state, dispatch] = useReducer(voiceBotReducer, initialState);
  // Note: After waking from sleep, the bot must wait for the user to speak before playing audio.
  const isWaitingForUserVoiceAfterSleep = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedMessageCount = useRef(0);
  const previousConfigRef = useRef<ConversationConfig>(
    state.conversationConfig,
  );
  const isCurrentlySaving = useRef(false);
  const sessionConversationId = useRef<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: INCREMENT_SLEEP_TIMER });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (state.sleepTimer > defaultSleepTimeoutSeconds) {
      startSleeping();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.sleepTimer]);

  const addVoicebotMessage = (newMessage: VoiceBotMessage) => {
    dispatch({ type: ADD_MESSAGE, payload: newMessage });
  };

  const startSpeaking = useCallback(
    (wakeFromSleep = false) => {
      if (wakeFromSleep || state.status !== VoiceBotStatus.SLEEPING) {
        dispatch({ type: START_SPEAKING });
      }
    },
    [state.status],
  );

  const startListening = useCallback(
    (wakeFromSleep = false) => {
      if (wakeFromSleep || state.status !== VoiceBotStatus.SLEEPING) {
        dispatch({ type: START_LISTENING });
      }
    },
    [state.status],
  );

  const startThinking = useCallback(() => {
    if (state.status !== VoiceBotStatus.SLEEPING) {
      dispatch({ type: START_THINKING });
    }
  }, [state.status]);

  const startSleeping = () => {
    isWaitingForUserVoiceAfterSleep.current = true;
    dispatch({ type: START_SLEEPING });
  };

  const toggleSleep = useCallback(() => {
    if (state.status === VoiceBotStatus.SLEEPING) {
      startListening(true);
    } else {
      startSleeping();
    }
  }, [state.status, startListening]);

  const setLatestServerEvent = useCallback((event: unknown) => {
    dispatch({ type: SET_LATEST_SERVER_EVENT, payload: event ?? null });
  }, []);

  const endOfTurn = (
    message: ConversationMessage,
    previousMessage: ConversationMessage,
  ) => isAssistantMessage(previousMessage) && isUserMessage(message);

  const displayOrder = useMemo(() => {
    const conv = state.messages.filter(isConversationMessage);
    const lat = state.messages.filter(isLatencyMessage);

    const acc: Array<VoiceBotMessage> = [];

    conv.forEach((conversationMessage, i, arr) => {
      const previousMessage = arr[i - 1];
      if (previousMessage && endOfTurn(conversationMessage, previousMessage)) {
        const latencyMessage = lat.shift();
        if (latencyMessage) acc.push(latencyMessage);
      }
      acc.push(conversationMessage);
      if (isAssistantMessage(conversationMessage) && i === arr.length - 1) {
        const latencyMessage = lat.shift();
        if (latencyMessage) acc.push(latencyMessage);
      }
    });
    return acc;
  }, [state.messages]);

  const setConversationConfig = useCallback((config: ConversationConfig) => {
    // Check if config actually changed to prevent unnecessary updates
    const prev = previousConfigRef.current;
    if (
      prev.studentId === config.studentId &&
      prev.bookId === config.bookId &&
      prev.autoSave === config.autoSave &&
      prev.modalities === config.modalities
    ) {
      return;
    }

    dispatch({ type: SET_CONVERSATION_CONFIG, payload: config });

    console.log("New session started - conversation ID reset");
    previousConfigRef.current = config;
  }, []);

  const clearConversation = useCallback(() => {
    dispatch({ type: CLEAR_MESSAGES });

    console.log("Conversation cleared - ready for new session");
  }, []);

  const conversationSaving = false;
  const conversationSaveError: string | null = null;

  const contextValue = useMemo(
    () => ({
      ...state,
      isWaitingForUserVoiceAfterSleep,
      displayOrder,
      addVoicebotMessage,
      startSpeaking,
      startListening,
      startThinking,
      startSleeping,
      toggleSleep,
      setConversationConfig,
      setLatestServerEvent,
      clearConversation,
      conversationSaving,
      conversationSaveError,
    }),
    [
      state,
      startListening,
      startSpeaking,
      toggleSleep,
      setConversationConfig,
      setLatestServerEvent,
      displayOrder,
      startThinking,
      clearConversation,
      conversationSaving,
      conversationSaveError,
    ],
  );

  return (
    <VoiceBotContext.Provider value={contextValue}>
      {children}
    </VoiceBotContext.Provider>
  );
}
