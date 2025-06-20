import {
  type VoiceBotState,
  VoiceBotStatus,
  type ConversationMessage,
  type LatencyMessage,
  type BehindTheScenesEvent,
  type ConversationConfig,
} from "./VoiceBotContextProvider";

export const START_LISTENING = "start_listening";
export const START_THINKING = "start_thinking";
export const START_SPEAKING = "start_speaking";
export const START_SLEEPING = "start_sleeping";
export const INCREMENT_SLEEP_TIMER = "increment_sleep_timer";
export const ADD_MESSAGE = "add_message";
export const SET_PARAMS_ON_COPY_URL = "set_attach_params_to_copy_url";
export const ADD_BEHIND_SCENES_EVENT = "add_behind_scenes_event";
export const CLEAR_MESSAGES = "clear_messages";
export const SET_CONVERSATION_CONFIG = "set_conversation_config";
export const SET_CURRENT_CONVERSATION_ID = "set_current_conversation_id";

export type VoiceBotAction =
  | { type: typeof START_LISTENING }
  | { type: typeof START_THINKING }
  | { type: typeof START_SPEAKING }
  | { type: typeof START_SLEEPING }
  | { type: typeof INCREMENT_SLEEP_TIMER }
  | { type: typeof ADD_MESSAGE; payload: ConversationMessage | LatencyMessage }
  | { type: typeof SET_PARAMS_ON_COPY_URL; payload: boolean }
  | { type: typeof ADD_BEHIND_SCENES_EVENT; payload: BehindTheScenesEvent }
  | { type: typeof CLEAR_MESSAGES }
  | { type: typeof SET_CONVERSATION_CONFIG; payload: ConversationConfig }
  | { type: typeof SET_CURRENT_CONVERSATION_ID; payload: string | null };

export const voiceBotReducer = (
  state: VoiceBotState,
  action: VoiceBotAction,
) => {
  switch (action.type) {
    case START_LISTENING:
      return { ...state, status: VoiceBotStatus.LISTENING, sleepTimer: 0 };
    case START_THINKING:
      return { ...state, status: VoiceBotStatus.THINKING };
    case START_SPEAKING:
      return { ...state, status: VoiceBotStatus.SPEAKING, sleepTimer: 0 };
    case START_SLEEPING:
      return { ...state, status: VoiceBotStatus.SLEEPING };
    case INCREMENT_SLEEP_TIMER:
      return { ...state, sleepTimer: state.sleepTimer + 1 };
    case ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        messageCount: state.messageCount + 1,
      };
    case SET_PARAMS_ON_COPY_URL:
      return { ...state, attachParamsToCopyUrl: action.payload };
    case ADD_BEHIND_SCENES_EVENT:
      return {
        ...state,
        behindTheScenesEvents: [...state.behindTheScenesEvents, action.payload],
      };
    case CLEAR_MESSAGES:
      return {
        ...state,
        messages: [],
        behindTheScenesEvents: [],
        messageCount: 0,
      };
    case SET_CONVERSATION_CONFIG:
      return {
        ...state,
        conversationConfig: action.payload,
      };
    case SET_CURRENT_CONVERSATION_ID:
      return {
        ...state,
        currentConversationId: action.payload,
      };
    default:
      return state;
  }
};
