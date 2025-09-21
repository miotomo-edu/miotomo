import {
  type VoiceBotState,
  VoiceBotStatus,
  type ConversationMessage,
  type LatencyMessage,
  type ConversationConfig,
} from "./VoiceBotContextProvider";

export const START_LISTENING = "start_listening";
export const START_THINKING = "start_thinking";
export const START_SPEAKING = "start_speaking";
export const ADD_MESSAGE = "add_message";
export const SET_CONVERSATION_CONFIG = "set_conversation_config";

export type VoiceBotAction =
  | { type: typeof START_LISTENING }
  | { type: typeof START_THINKING }
  | { type: typeof START_SPEAKING }
  | { type: typeof ADD_MESSAGE; payload: ConversationMessage | LatencyMessage }
  | { type: typeof SET_CONVERSATION_CONFIG; payload: ConversationConfig };

export const voiceBotReducer = (
  state: VoiceBotState,
  action: VoiceBotAction,
) => {
  switch (action.type) {
    case START_LISTENING:
      return { ...state, status: VoiceBotStatus.LISTENING };
    case START_THINKING:
      return { ...state, status: VoiceBotStatus.THINKING };
    case START_SPEAKING:
      return { ...state, status: VoiceBotStatus.SPEAKING };
    case ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        messageCount: state.messageCount + 1,
      };
    case SET_CONVERSATION_CONFIG:
      return {
        ...state,
        conversationConfig: action.payload,
      };
    default:
      return state;
  }
};
