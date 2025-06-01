import React, { useRef, useEffect } from "react";
import { useVoiceBot } from "../../../context/VoiceBotContextProvider";
import assistantAvatar from "../../../assets/img/miotomo-avatar.png";

function Transcript() {
  const { messages } = useVoiceBot();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const userAvatarUrl = "https://api.dicebear.com/7.x/micah/svg?seed=leo";
  const assistantAvatarUrl = assistantAvatar;

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className="space-y-6">
        {messages.map((message, index) => {
          const isUser = !!message.user;
          const avatarBg = isUser ? "bg-userBubble" : "bg-assistantBubble20";
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
              <div className={`flex-shrink-0 w-10 h-10 ${avatarMargin}`}>
                <img
                  src={isUser ? userAvatarUrl : assistantAvatarUrl}
                  alt={isUser ? "User Avatar" : "Assistant Avatar"}
                  className={`w-full h-full rounded-full object-cover ${avatarBg}`}
                />
              </div>
              {/* Bubble */}
              <div
                className={`p-3 rounded-xl max-w-[85%] break-words border border-black`}
              >
                {isUser ? (
                  <p className="text-gray-800 leading-7">{message.user}</p>
                ) : message.assistant ? (
                  <p className="text-gray-800 leading-7">{message.assistant}</p>
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
