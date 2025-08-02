import React, { useRef, useEffect } from "react";
import { useVoiceBot } from "../../../context/VoiceBotContextProvider";
import assistantAvatar from "../../../assets/img/miotomo-avatar.png";
import userAvatar from "../../../assets/img/user-avatar.png";

function Transcript({ userName = "", currentCharacter }) {
  const { messages } = useVoiceBot();
  const messagesEndRef = useRef(null);

  // Filter out consecutive duplicate messages
  const filteredMessages = messages.filter((msg, idx, arr) => {
    if (idx === 0) return true;
    const prev = arr[idx - 1];
    // Compare both user and assistant fields
    return msg.user !== prev.user || msg.assistant !== prev.assistant;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processSpellingText = (text) => {
    if (currentCharacter?.prompt !== "spelling") {
      return text;
    }

    // Replace **word** with stars (one star per letter)
    return text.replace(/\*\*([^*]+)\*\*/g, (match, word) => {
      return "*".repeat(word.length);
    });
  };

  const assistantAvatarUrl = currentCharacter?.icon || assistantAvatar;

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className="space-y-6">
        {filteredMessages.map((message, index) => {
          const isUser = !!message.user;
          const flexDirection = isUser ? "flex-row-reverse" : "flex-row";
          const avatarMargin = isUser ? "ml-4" : "mr-4";
          const edgePadding = isUser ? "pl-10" : "pr-10";
          const alignment = isUser ? "ml-auto" : "mr-auto";

          return (
            <div
              key={index}
              className={`flex ${flexDirection} items-start w-fit max-w-full ${edgePadding} ${alignment}`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-10 h-10 ${avatarMargin} rounded-full overflow-hidden`}
              >
                <img
                  src={isUser ? userAvatar : assistantAvatarUrl}
                  alt={isUser ? "User Avatar" : "Assistant Avatar"}
                  className={`w-full h-full  object-contain`}
                />
              </div>
              {/* Bubble */}
              <div
                className={`p-3 rounded-xl max-w-[85%] break-words border-2 border-black`}
                style={{
                  backgroundColor: `${isUser ? "#C492F1" : "#fff"}`,
                }}
              >
                {isUser ? (
                  <p className="text-gray-800 leading-7">{message.user}</p>
                ) : message.assistant ? (
                  <p className="text-gray-800 leading-7">
                    {processSpellingText(message.assistant)}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}

export default Transcript;
