import React, { useRef, useEffect } from "react";
import useConversation from "./useConversation"; // 👈 the hook you shared/adapted
import assistantAvatar from "../../../assets/img/miotomo-avatar.png";
import userAvatar from "../../../assets/img/user-avatar.png";

function Transcript({ userName = "", currentCharacter }) {
  const { messages } = useConversation();
  const messagesEndRef = useRef(null);
  // console.log(messages);
  // Filter out consecutive duplicates
  const filteredMessages = messages.filter((msg, idx, arr) => {
    if (idx === 0) return true;
    const prev = arr[idx - 1];
    return msg.content !== prev.content || msg.role !== prev.role;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processSpellingText = (text) => {
    // if (currentCharacter?.prompt !== "spelling") return text;

    // Case 1: **WORD**
    let result = text.replace(/\*\*([^*]+)\*\*/g, (_, word) =>
      "*".repeat(word.length),
    );

    // Case 2: "can you spell WORD"
    // Only apply if case 1 didn't already replace
    if (result === text) {
      result = result.replace(/can you spell ([A-Z]+)\??/i, (match, word) => {
        return match.replace(word, "*".repeat(word.length));
      });
    }

    return result;
  };

  const assistantAvatarUrl = currentCharacter?.icon || assistantAvatar;

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className="space-y-6">
        {filteredMessages
          .filter((message) => message.content.length > 0)
          .map((message, index) => {
            const isUser = message.role === "user";
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
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Bubble */}
                <div
                  className={`p-3 rounded-xl max-w-[85%] break-words border-2 border-black`}
                  style={{
                    backgroundColor: `${isUser ? "#C492F1" : "#fff"}`,
                  }}
                >
                  <p className="text-gray-800 leading-7">
                    {isUser
                      ? message.content
                      : processSpellingText(message.content)}
                  </p>
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
