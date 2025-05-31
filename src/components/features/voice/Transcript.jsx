import React, { useRef, useEffect } from "react";
import { useVoiceBot } from "../../../context/VoiceBotContextProvider";

function Transcript() {
  const { messages } = useVoiceBot();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    // Removed overflow and scrollbar classes here
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="space-y-3">
        {messages.map((message, index) => {
          const isUser = !!message.user;
          const avatarBg = isUser ? "bg-userBubble" : "bg-assistantBubble20";
          const avatarLetter = isUser ? "J" : "T";
          const bubbleBg = isUser ? "bg-userBubble" : "bg-assistantBubble20";
          // For flex direction and avatar position
          const flexDirection = isUser ? "flex-row-reverse" : "flex-row";
          const avatarMargin = isUser ? "ml-2" : "mr-2";
          // Padding at the far edge
          const edgePadding = isUser ? "pl-10" : "pr-10";
          // Alignment
          const alignment = isUser ? "ml-auto" : "mr-auto";

          return (
            <div
              key={index}
              className={`flex ${flexDirection} items-start w-fit max-w-full ${edgePadding} ${alignment}`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-10 h-10 ${avatarBg} rounded-full flex items-center justify-center text-2xl font-normal text-gray-800 ${avatarMargin}`}
              >
                {avatarLetter}
              </div>
              {/* Bubble */}
              <div
                className={`p-3 rounded-lg ${bubbleBg} max-w-[70vw] break-words`}
              >
                {isUser ? (
                  <p className="text-gray-800">{message.user}</p>
                ) : message.assistant ? (
                  <p className="text-gray-800">{message.assistant}</p>
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
