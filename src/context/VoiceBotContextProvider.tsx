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
  START_SPEAKING,
  START_LISTENING,
  ADD_MESSAGE,
  SET_CONVERSATION_CONFIG,
} from "./VoiceBotReducer";

import { USE_MOCK_DATA, mockMessages } from "../utils/mockData";
import { useConversations } from "../hooks/useConversations";
import { useConversationPersistence } from "../hooks/useConversationPersistence"; // <-- NEW

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

export const isConversationMessage = (
  voiceBotMessage: VoiceBotMessage,
): voiceBotMessage is ConversationMessage =>
  isUserMessage(voiceBotMessage as UserMessage) ||
  isAssistantMessage(voiceBotMessage as AssistantMessage);

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
  messages: VoiceBotMessage[];
  messageCount: number;
  conversationConfig: ConversationConfig;
  currentConversationId: string | null;
}

export interface VoiceBotContext extends VoiceBotState {
  addVoicebotMessage: (newMessage: VoiceBotMessage) => void;
  startSpeaking: (wakeFromSleep?: boolean) => void;
  startListening: (wakeFromSleep?: boolean) => void;
  setConversationConfig: (config: ConversationConfig) => void;
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

  // Use persistence hook
  const previousConfigRef = useRef(state.conversationConfig);
  const [currentConversationId, setCurrentConversationId] = React.useState<
    string | null
  >(null);

  const { conversationSaving, conversationSaveError, resetSession } =
    useConversationPersistence({
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

  // Context value
  const contextValue = useMemo(
    () => ({
      ...state,
      addVoicebotMessage,
      startSpeaking,
      startListening,
      setConversationConfig,
      conversationSaving,
      conversationSaveError,
      currentConversationId,
    }),
    [
      state,
      startListening,
      startSpeaking,
      setConversationConfig,
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
