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
  ADD_MESSAGE,
  SET_PARAMS_ON_COPY_URL,
  ADD_BEHIND_SCENES_EVENT,
  CLEAR_MESSAGES,
  SET_CONVERSATION_CONFIG,
} from "./VoiceBotReducer";

import { USE_MOCK_DATA, mockMessages } from "../utils/mockData";
import { useConversations } from "../hooks/useConversations";

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

const initialState: VoiceBotState = {
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
  const {
    createConversation,
    updateConversation,
    loading: conversationSaving,
    error: conversationSaveError,
  } = useConversations();

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

  // Auto-save conversation when messages change
  useEffect(() => {
    const { conversationConfig, messages, messageCount } = state;

    // Only auto-save if enabled and we have the required data
    if (
      !conversationConfig.autoSave ||
      !conversationConfig.studentId ||
      !conversationConfig.bookId ||
      messages.length === 0 ||
      messageCount === lastSavedMessageCount.current ||
      isCurrentlySaving.current
    ) {
      return;
    }

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save operation (wait 2 seconds after the last message)
    saveTimeoutRef.current = setTimeout(async () => {
      if (isCurrentlySaving.current) {
        return; // Prevent concurrent saves
      }

      // Wrap the entire save operation in a try-catch to prevent any errors from bubbling up
      try {
        isCurrentlySaving.current = true;
        console.log("Auto-saving conversation...");

        if (sessionConversationId.current) {
          // Update existing conversation for this session
          console.log(
            "Updating existing conversation:",
            sessionConversationId.current,
          );

          try {
            const result = await updateConversation(
              sessionConversationId.current,
              messages,
            );

            if (result.error) {
              console.error("Failed to update conversation:", result.error);
              // Don't reset sessionConversationId on error - try again next time
            } else {
              console.log("Conversation updated successfully");
              lastSavedMessageCount.current = messageCount;
            }
          } catch (updateError) {
            console.error("Exception during conversation update:", updateError);
            // Continue normal app operation
          }
        } else {
          // Create new conversation for this session
          console.log("Creating new conversation for session");

          try {
            const result = await createConversation(
              conversationConfig.studentId!,
              conversationConfig.bookId!,
              messages,
            );

            if (result.error) {
              console.error("Failed to create conversation:", result.error);
              // Don't set sessionConversationId on error
            } else {
              console.log(
                "New conversation created successfully:",
                result.conversationId,
              );
              sessionConversationId.current = result.conversationId || null;
              lastSavedMessageCount.current = messageCount;

              // Update the state with the new conversation ID
              try {
                dispatch({
                  type: "SET_CURRENT_CONVERSATION_ID",
                  payload: result.conversationId || null,
                });
              } catch (dispatchError) {
                console.error(
                  "Error updating conversation ID in state:",
                  dispatchError,
                );
                // Continue - this won't affect the main app functionality
              }
            }
          } catch (createError) {
            console.error(
              "Exception during conversation creation:",
              createError,
            );
            // Continue normal app operation
          }
        }
      } catch (outerError) {
        console.error(
          "Unexpected error in conversation auto-save:",
          outerError,
        );
        // This should never happen, but if it does, don't crash the app
      } finally {
        isCurrentlySaving.current = false;
      }
    }, 2000); // 2 second debounce

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    state.messages,
    state.messageCount,
    state.conversationConfig,
    createConversation,
    updateConversation,
  ]);

  const addVoicebotMessage = (newMessage: VoiceBotMessage) => {
    console.log("addVoicebotMessage", newMessage);
    dispatch({ type: ADD_MESSAGE, payload: newMessage });
  };

  const addBehindTheScenesEvent = (event: BehindTheScenesEvent) => {
    dispatch({ type: ADD_BEHIND_SCENES_EVENT, payload: event });
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

  const setAttachParamsToCopyUrl = useCallback(
    (attachParamsToCopyUrl: boolean) => {
      dispatch({
        type: SET_PARAMS_ON_COPY_URL,
        payload: attachParamsToCopyUrl,
      });
    },
    [],
  );

  const setConversationConfig = useCallback((config: ConversationConfig) => {
    // Check if config actually changed to prevent unnecessary updates
    const prev = previousConfigRef.current;
    if (
      prev.studentId === config.studentId &&
      prev.bookId === config.bookId &&
      prev.autoSave === config.autoSave
    ) {
      return;
    }

    dispatch({ type: SET_CONVERSATION_CONFIG, payload: config });

    // Always reset session tracking when configuration changes
    // This ensures each new session (even same student/book) gets a new conversation
    sessionConversationId.current = null;
    dispatch({ type: "SET_CURRENT_CONVERSATION_ID", payload: null });
    lastSavedMessageCount.current = 0;
    isCurrentlySaving.current = false;

    // Clear any pending save timeout when switching contexts
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    console.log("New session started - conversation ID reset");
    previousConfigRef.current = config;
  }, []);

  const clearConversation = useCallback(() => {
    dispatch({ type: CLEAR_MESSAGES });

    // Reset session conversation tracking
    sessionConversationId.current = null;
    dispatch({ type: "SET_CURRENT_CONVERSATION_ID", payload: null });
    lastSavedMessageCount.current = 0;
    isCurrentlySaving.current = false;

    // Clear any pending save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    console.log("Conversation cleared - ready for new session");
  }, []);

  const contextValue = useMemo(
    () => ({
      ...state,
      isWaitingForUserVoiceAfterSleep,
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
    }),
    [
      state,
      startListening,
      startSpeaking,
      toggleSleep,
      setAttachParamsToCopyUrl,
      setConversationConfig,
      displayOrder,
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
