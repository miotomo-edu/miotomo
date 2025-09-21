import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  voiceBotReducer,
  INCREMENT_SLEEP_TIMER,
  START_SPEAKING,
  START_LISTENING,
  START_SLEEPING,
  ADD_MESSAGE,
  SET_PARAMS_ON_COPY_URL,
  ADD_BEHIND_SCENES_EVENT,
  CLEAR_MESSAGES,
  SET_CONVERSATION_CONFIG,
} from "./VoiceBotReducer";

import { USE_MOCK_DATA, mockMessages } from "../utils/mockData";
import { useConversations } from "../hooks/useConversations";
import { useConversationPersistence } from "../hooks/useConversationPersistence"; // <-- NEW

const defaultSleepTimeoutSeconds = 30;

export enum EventType {
  SETTINGS_APPLIED = "SettingsApplied",
  AGENT_AUDIO_DONE = "AgentAudioDone",
  USER_STARTED_SPEAKING = "UserStartedSpeaking",
  AGENT_STARTED_SPEAKING = "AgentStartedSpeaking",
  CONVERSATION_TEXT = "ConversationText",
  END_OF_THOUGHT = "EndOfThought",
}

export type VoiceBotMessage = LatencyMessage | ConversationMessage;

export type LatencyMessage = {
  total_latency: number | null;
  tts_latency: number;
  ttt_latency: number;
};
export type ConversationMessage = UserMessage | AssistantMessage;

export type UserMessage = { user: string };
export type AssistantMessage = { assistant: string };

export type BehindTheScenesEvent =
  | { type: EventType.SETTINGS_APPLIED }
  | { type: EventType.USER_STARTED_SPEAKING }
  | { type: EventType.AGENT_STARTED_SPEAKING }
  | {
      type: EventType.CONVERSATION_TEXT;
      role: "user" | "assistant";
      content: string;
    }
  | { type: "Interruption" }
  | { type: EventType.END_OF_THOUGHT };

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
}

export interface VoiceBotState {
  status: VoiceBotStatus;
  sleepTimer: number;
  messages: VoiceBotMessage[];
  attachParamsToCopyUrl: boolean;
  behindTheScenesEvents: BehindTheScenesEvent[];
  messageCount: number;
  conversationConfig: ConversationConfig;
  currentConversationId: string | null;
}

export interface VoiceBotContext extends VoiceBotState {
  addVoicebotMessage: (newMessage: VoiceBotMessage) => void;
  addBehindTheScenesEvent: (data: BehindTheScenesEvent) => void;
  isWaitingForUserVoiceAfterSleep: React.Ref<boolean>;
  startSpeaking: (wakeFromSleep?: boolean) => void;
  startListening: (wakeFromSleep?: boolean) => void;
  startSleeping: () => void;
  toggleSleep: () => void;
  displayOrder: VoiceBotMessage[];
  setAttachParamsToCopyUrl: (attachParamsToCopyUrl: boolean) => void;
  setConversationConfig: (config: ConversationConfig) => void;
  clearConversation: () => void;
  conversationSaving: boolean;
  conversationSaveError: string | null;
}

const initialState = {
  status: VoiceBotStatus.SPEAKING,
  sleepTimer: 0,
  messages: USE_MOCK_DATA ? mockMessages : [],
  attachParamsToCopyUrl: true,
  behindTheScenesEvents: [],
  messageCount: 0,
  conversationConfig: {
    studentId: null,
    bookId: null,
    autoSave: false,
  },
  currentConversationId: null,
};

export const VoiceBotContext = createContext(undefined);

export function useVoiceBot() {
  const context = useContext(VoiceBotContext);
  if (!context)
    throw new Error("useVoiceBot must be used within a VoiceBotProvider");
  return context;
}

export function VoiceBotProvider({ children }) {
  const [state, dispatch] = useReducer(voiceBotReducer, initialState);
  const { createConversation, updateConversation } = useConversations();

  // Timer for sleep
  useRef(() => {
    const interval = setInterval(() => {
      dispatch({ type: INCREMENT_SLEEP_TIMER });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sleep after timeout
  useRef(() => {
    if (state.sleepTimer > defaultSleepTimeoutSeconds) {
      startSleeping();
    }
  }, [state.sleepTimer]);

  // ---- NEW: Use persistence hook ----
  const previousConfigRef = useRef(state.conversationConfig);
  const [currentConversationId, setCurrentConversationId] = React.useState<
    string | null
  >(null);

  const {
    conversationSaving,
    conversationSaveError,
    resetSession,
    sessionConversationId,
  } = useConversationPersistence({
    conversationConfig: state.conversationConfig,
    messages: state.messages,
    messageCount: state.messageCount,
    createConversation,
    updateConversation,
    onSessionIdChange: setCurrentConversationId,
    debounceMs: 2000,
  });

  // Message/event functions
  const addVoicebotMessage = (newMessage) => {
    dispatch({ type: ADD_MESSAGE, payload: newMessage });
  };

  const addBehindTheScenesEvent = (event) => {
    dispatch({ type: ADD_BEHIND_SCENES_EVENT, payload: event });
  };

  // Status functions
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

  const startSleeping = () => {
    dispatch({ type: START_SLEEPING });
  };

  const toggleSleep = useCallback(() => {
    if (state.status === VoiceBotStatus.SLEEPING) {
      startListening(true);
    } else {
      startSleeping();
    }
  }, [state.status, startListening]);

  // Display order logic unchanged
  const displayOrder = useMemo(() => {
    const conv = state.messages.filter(isConversationMessage);
    const lat = state.messages.filter(isLatencyMessage);

    const acc = [];
    conv.forEach((conversationMessage, i, arr) => {
      const previousMessage = arr[i - 1];
      if (
        previousMessage &&
        isAssistantMessage(previousMessage) &&
        isUserMessage(conversationMessage)
      ) {
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

  // Attach params to copy URL
  const setAttachParamsToCopyUrl = useCallback((attachParamsToCopyUrl) => {
    dispatch({
      type: SET_PARAMS_ON_COPY_URL,
      payload: attachParamsToCopyUrl,
    });
  }, []);

  // Conversation config
  const setConversationConfig = useCallback(
    (config) => {
      const prev = previousConfigRef.current;
      if (
        prev.studentId === config.studentId &&
        prev.bookId === config.bookId &&
        prev.autoSave === config.autoSave
      ) {
        return;
      }
      dispatch({ type: SET_CONVERSATION_CONFIG, payload: config });
      resetSession();
      previousConfigRef.current = config;
    },
    [resetSession],
  );

  // Clear conversation
  const clearConversation = useCallback(() => {
    dispatch({ type: CLEAR_MESSAGES });
    resetSession();
  }, [resetSession]);

  // Context value
  const contextValue = useMemo(
    () => ({
      ...state,
      displayOrder,
      addVoicebotMessage,
      addBehindTheScenesEvent,
      startSpeaking,
      startListening,
      startSleeping,
      toggleSleep,
      setAttachParamsToCopyUrl,
      setConversationConfig,
      clearConversation,
      conversationSaving,
      conversationSaveError,
      currentConversationId,
    }),
    [
      state,
      displayOrder,
      startListening,
      startSpeaking,
      toggleSleep,
      setAttachParamsToCopyUrl,
      setConversationConfig,
      clearConversation,
      conversationSaving,
      conversationSaveError,
      currentConversationId,
    ],
  );

  return (
    <VoiceBotContext.Provider value={contextValue}>
      {children}
    </VoiceBotContext.Provider>
  );
}
